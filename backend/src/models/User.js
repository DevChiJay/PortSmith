const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth
      return !this.googleId && !this.githubId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String,
    select: false // Don't return token in queries by default
  },
  verification_token_expires: {
    type: Date,
    select: false // Don't return expiry in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Skip password hashing if user is authenticated via OAuth
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
