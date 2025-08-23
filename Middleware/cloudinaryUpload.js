const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = 'temp-uploads';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware to upload to Cloudinary and clean up temp files
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Upload files to Cloudinary
    const uploadResults = await uploadMultipleImages(req.files, 'blog-images');
    
    // Store Cloudinary data in request
    req.cloudinaryImages = uploadResults.map(result => ({
      public_id: result.public_id,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.size
    }));

    // Clean up temporary files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    next();
  } catch (error) {
    // Clean up temporary files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// Middleware to handle profile picture uploads
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Upload to Cloudinary with profile picture folder
    const { uploadImage } = require('../utils/cloudinary');
    const result = await uploadImage(req.file, 'profile-pictures');
    
    req.cloudinaryProfile = {
      public_id: result.public_id,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.size
    };

    // Clean up temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next();
  } catch (error) {
    // Clean up temporary file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  uploadProfilePicture
};
