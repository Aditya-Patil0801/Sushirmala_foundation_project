const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/passbooks');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${req.user._id}_${uniqueSuffix}${extension}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/upload/passbook
// @desc    Upload passbook file for user
// @access  Private
router.post("/passbook", auth, upload.single('passbook'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user's passbook file path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        passbookFile: `/uploads/passbooks/${req.file.filename}`
      },
      { new: true }
    ).select('-password');

    res.json({
      message: "Passbook uploaded successfully",
      filePath: `/uploads/passbooks/${req.file.filename}`,
      user: user
    });

  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// @route   POST /api/upload/profile-picture
// @desc    Upload profile picture for user
// @access  Private
router.post("/profile-picture", auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user's profile picture path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        profilePicture: `/uploads/passbooks/${req.file.filename}`
      },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profile picture uploaded successfully",
      filePath: `/uploads/passbooks/${req.file.filename}`,
      user: user
    });

  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// @route   DELETE /api/upload/passbook
// @desc    Delete user's passbook file
// @access  Private
router.delete("/passbook", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.passbookFile) {
      return res.status(400).json({ message: "No passbook file to delete" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', user.passbookFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file reference from user
    await User.findByIdAndUpdate(req.user._id, { 
      passbookFile: null 
    });

    res.json({ message: "Passbook file deleted successfully" });

  } catch (error) {
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'Unknown upload error' });
});

module.exports = router;
