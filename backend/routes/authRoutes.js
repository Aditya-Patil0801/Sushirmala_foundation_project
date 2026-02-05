const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const BachatGat = require("../models/BachatGat");
const { auth } = require("../middleware/authMiddleware");
const { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } = require("../utils/email");

const router = express.Router();

// Configure multer for passbook uploads
const uploadDir = path.join(__dirname, "..", "uploads", "passbooks");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user ? req.user._id : "anon"}-${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png"]; 
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Invalid file type"));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Register
router.post("/register", async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    address, 
    age, 
    occupation, 
    monthlyIncome, 
    aadharNumber, 
    gatId,
    role
  } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { aadharNumber }] });
    if (user) {
      return res.status(400).json({ 
        message: user.email === email ? "User with this email already exists" : "User with this Aadhar number already exists" 
      });
    }

    // Validate age
    if (age < 18 || age > 65) {
      return res.status(400).json({ message: "Age must be between 18 and 65" });
    }

    // If gatId is provided, validate and check capacity
    let bachatGat = null;
    if (gatId) {
      bachatGat = await BachatGat.findById(gatId);
      if (!bachatGat) {
        return res.status(404).json({ message: "Bachat Gat not found" });
      }

      if (!bachatGat.isActive) {
        return res.status(400).json({ message: "This Bachat Gat is not active" });
      }

      if (bachatGat.members.length >= bachatGat.maxMembers) {
        return res.status(400).json({ message: "This Bachat Gat is full" });
      }

      // If registering with an officer role, ensure the position is vacant in this group
      if (role && ['president', 'secretary', 'treasurer'].includes(role)) {
        if (bachatGat[role]) {
          return res.status(400).json({ message: `This Bachat Gat already has a ${role}` });
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Validate role if provided
    const allowedRoles = ['president', 'secretary', 'treasurer', 'member'];
    let finalRole = 'member';
    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role selected" });
      }
      finalRole = role;
    }

    // Create user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      age: Number(age),
      occupation,
      monthlyIncome: Number(monthlyIncome),
      aadharNumber,
      bachatGatId: gatId || null,
      role: finalRole
    });

    // Add user to Bachat Gat if specified
    if (bachatGat) {
      bachatGat.members.push(user._id);
      // If officer role, assign position on the group
      if (finalRole && ['president', 'secretary', 'treasurer'].includes(finalRole)) {
        bachatGat[finalRole] = user._id;
      }
      await bachatGat.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Populate the user with bachat gat info for complete response
    const populatedUser = await User.findById(user._id)
      .populate('bachatGatId', 'name')
      .select('-password');

    res.status(201).json({
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        bachatGatId: populatedUser.bachatGatId?._id,
        bachatGatName: populatedUser.bachatGatId?.name,
        phone: populatedUser.phone,
        address: populatedUser.address,
        age: populatedUser.age,
        occupation: populatedUser.occupation,
        monthlyIncome: populatedUser.monthlyIncome,
        aadharNumber: populatedUser.aadharNumber,
        joiningDate: populatedUser.joiningDate,
        profilePicture: populatedUser.profilePicture,
        passbookFile: populatedUser.passbookFile,
        loanBalance: populatedUser.loanBalance,
        interestRate: populatedUser.interestRate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password, bachatGatGroup, role } = req.body;

  try {
    // Find user and populate bachatGat info
    const user = await User.findOne({ email }).populate('bachatGatId', 'name');
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated. Please contact admin." });
    }

    // If bachatGatGroup is provided, validate it matches user's group
    if (bachatGatGroup && user.bachatGatId) {
      if (user.bachatGatId.name !== bachatGatGroup) {
        return res.status(400).json({ message: "Invalid Bachat Gat group selected" });
      }
    }

    // If role is provided, validate it matches user's role
    if (role && user.role !== role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bachatGatId: user.bachatGatId?._id || null,
        bachatGatName: user.bachatGatId?.name,
        phone: user.phone,
        address: user.address,
        age: user.age,
        occupation: user.occupation,
        monthlyIncome: user.monthlyIncome,
        aadharNumber: user.aadharNumber,
        joiningDate: user.joiningDate,
        profilePicture: user.profilePicture,
        passbookFile: user.passbookFile,
        loanBalance: user.loanBalance,
        interestRate: user.interestRate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bachatGatId', 'name description location');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address', 'occupation', 'monthlyIncome', 'age'];
    const updates = {};
    
    // Only allow certain fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password').populate('bachatGatId', 'name');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data in the same format as login/register
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bachatGatId: user.bachatGatId?._id || null,
        bachatGatName: user.bachatGatId?.name,
        phone: user.phone,
        address: user.address,
        age: user.age,
        occupation: user.occupation,
        monthlyIncome: user.monthlyIncome,
        aadharNumber: user.aadharNumber,
        joiningDate: user.joiningDate,
        profilePicture: user.profilePicture,
        passbookFile: user.passbookFile,
        loanBalance: user.loanBalance,
        interestRate: user.interestRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, we don't reveal if the email exists
      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();
    
    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }
    
    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify reset token
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }
    
    res.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Reset password token verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and remove reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Send confirmation email
    await sendPasswordResetConfirmationEmail(user.email, user.name);
    
    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;