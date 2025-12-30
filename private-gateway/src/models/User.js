const mongoose = require('mongoose');

// Minimal User schema for public gateway
// Full user management is handled by the backend server
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  full_name: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isPro: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: false // Allow other fields from backend without errors
});

module.exports = mongoose.model('User', UserSchema);
