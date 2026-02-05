const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Keep bachatGatId as an ObjectId to avoid populated document issues in downstream routes
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin only middleware
const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Group member middleware (user must be member of a bachat gat)
const groupMemberOnly = async (req, res, next) => {
  try {
    if (!req.user.bachatGatId) {
      return res.status(403).json({ message: "Access denied. You must be a member of a Bachat Gat." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Group officer middleware (president, secretary, or treasurer)
const groupOfficerOnly = async (req, res, next) => {
  try {
    const bachatGatId = req.user.bachatGatId;

    if (!bachatGatId) {
      return res.status(403).json({ message: "Access denied. You must be a member of a Bachat Gat." });
    }

    const BachatGat = require("../models/BachatGat");
    const bachatGat = await BachatGat.findById(bachatGatId).select('president secretary treasurer');
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const userId = req.user._id.toString();
    const isOfficer = (
      bachatGat.president?.toString() === userId ||
      bachatGat.secretary?.toString() === userId ||
      bachatGat.treasurer?.toString() === userId
    );

    if (!isOfficer && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Officer privileges required." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { auth, adminOnly, groupMemberOnly, groupOfficerOnly };