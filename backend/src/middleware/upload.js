const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_randomString.ext
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}_${timestamp}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Middleware for single avatar upload
const uploadAvatar = upload.single('avatar');

// Wrapper to handle multer errors
const handleAvatarUpload = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'File size too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        error: 'Bad Request',
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        error: 'Bad Request',
        message: err.message
      });
    }
    next();
  });
};

// Helper function to delete old avatar file
const deleteOldAvatar = (avatarUrl) => {
  if (!avatarUrl || avatarUrl.includes('placeholder')) {
    return;
  }
  
  try {
    // Extract filename from URL
    const filename = avatarUrl.split('/').pop();
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
  }
};

module.exports = {
  handleAvatarUpload,
  deleteOldAvatar,
  uploadsDir
};
