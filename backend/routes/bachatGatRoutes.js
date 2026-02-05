const express = require("express");
const BachatGat = require("../models/BachatGat");
const User = require("../models/User");
const { auth, adminOnly, groupMemberOnly, groupOfficerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/bachatgat
// @desc    Get all Bachat Gats (for admin) or available groups (for users)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show active groups
    if (req.user.role !== 'admin') {
      query.isActive = true;
    }

    const bachatGats = await BachatGat.find(query)
      .populate('members', 'name email phone')
      .populate('president secretary treasurer', 'name email')
      .sort({ createdAt: -1 });

    res.json(bachatGats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/bachatgat/available
// @desc    Get available Bachat Gats (not full)
// @access  Public (used by registration page)
router.get("/available", async (req, res) => {
  try {
    const bachatGats = await BachatGat.find({
      isActive: true,
      $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] }
    })
      .populate('members', 'name')
      .select('name description location members maxMembers monthlyContribution');

    res.json({
      success: true,
      data: bachatGats
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/bachatgat/:id
// @desc    Get specific Bachat Gat details
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.id)
      .populate('members', 'name email phone address age occupation')
      .populate('president secretary treasurer', 'name email phone')
      .populate('meetings.attendees', 'name')
      .populate('transactions.member', 'name')
      .populate('transactions.approvedBy', 'name');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has access to this group
    if (req.user.role !== 'admin' && 
        req.user.bachatGatId?.toString() !== bachatGat._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(bachatGat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/bachatgat
// @desc    Create new Bachat Gat
// @access  Private (Admin only)
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      monthlyMeetingDate,
      monthlyContribution,
      rules
    } = req.body;

    // Check if name already exists
    const existingGat = await BachatGat.findOne({ name });
    if (existingGat) {
      return res.status(400).json({ message: "Bachat Gat with this name already exists" });
    }

    const bachatGat = await BachatGat.create({
      name,
      description,
      location,
      monthlyMeetingDate,
      monthlyContribution,
      rules: rules || []
    });

    res.status(201).json(bachatGat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/bachatgat/:id
// @desc    Update Bachat Gat (allows treasurer to update monthlyContribution and totalFunds)
// @access  Private (Admin or Group Officers)
router.put("/:id", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.id);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check permissions
    const isOfficer = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString() ||
      bachatGat.treasurer?.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isOfficer) {
      return res.status(403).json({ message: "Access denied. Officer privileges required." });
    }

    // Enforce treasurer limitation: treasurer can only update monthlyContribution and totalFunds
    // All officers can update foundedDate
    let updatePayload = { ...req.body };
    const userIsTreasurer = bachatGat.treasurer?.toString() === req.user._id.toString();
    
    if (userIsTreasurer && req.user.role !== 'admin') {
      const allowedForTreasurer = ['monthlyContribution', 'totalFunds', 'foundedDate'];
      updatePayload = Object.keys(updatePayload).reduce((acc, key) => {
        if (allowedForTreasurer.includes(key)) {
          acc[key] = updatePayload[key];
        }
        return acc;
      }, {});

      if (Object.keys(updatePayload).length === 0) {
        return res.status(403).json({ message: 'Treasurer can only update monthlyContribution, totalFunds, or foundedDate' });
      }
    } else if (isOfficer && req.user.role !== 'admin') {
      // For other officers, allow foundedDate update in addition to normal fields
      const allowedForOfficers = ['name', 'description', 'registrationNumber', 'location', 'monthlyMeetingDate', 'monthlyContribution', 'rules', 'foundedDate'];
      updatePayload = Object.keys(updatePayload).reduce((acc, key) => {
        if (allowedForOfficers.includes(key)) {
          acc[key] = updatePayload[key];
        }
        return acc;
      }, {});
    }

    const updatedBachatGat = await BachatGat.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).populate('members', 'name email phone');

    res.json(updatedBachatGat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/bachatgat/:id
// @desc    Delete/Deactivate Bachat Gat
// @access  Private (Admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    res.json({ message: "Bachat Gat deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/bachatgat/:id/join
// @desc    Join a Bachat Gat
// @access  Private
router.post("/:id/join", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.id);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    if (!bachatGat.isActive) {
      return res.status(400).json({ message: "This Bachat Gat is not active" });
    }

    // Check if already a member of any group
    if (req.user.bachatGatId) {
      return res.status(400).json({ message: "You are already a member of a Bachat Gat" });
    }

    // Check if group is full
    if (bachatGat.members.length >= bachatGat.maxMembers) {
      return res.status(400).json({ message: "This Bachat Gat is full" });
    }

    // Check if already in this group
    if (bachatGat.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    // Add user to group
    bachatGat.members.push(req.user._id);
    await bachatGat.save();

    // Update user's bachatGatId
    await User.findByIdAndUpdate(req.user._id, { bachatGatId: bachatGat._id });

    res.json({ message: "Successfully joined the Bachat Gat", bachatGat: bachatGat.name });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/bachatgat/:id/leave
// @desc    Leave a Bachat Gat
// @access  Private
router.post("/:id/leave", auth, groupMemberOnly, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.id);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user is member of this group
    if (req.user.bachatGatId?.toString() !== bachatGat._id.toString()) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    // Remove user from group
    bachatGat.members = bachatGat.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    // Remove from officer positions if applicable
    if (bachatGat.president?.toString() === req.user._id.toString()) {
      bachatGat.president = null;
    }
    if (bachatGat.secretary?.toString() === req.user._id.toString()) {
      bachatGat.secretary = null;
    }
    if (bachatGat.treasurer?.toString() === req.user._id.toString()) {
      bachatGat.treasurer = null;
    }

    await bachatGat.save();

    // Update user's bachatGatId
    await User.findByIdAndUpdate(req.user._id, { bachatGatId: null });

    res.json({ message: "Successfully left the Bachat Gat" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/bachatgat/:id/assign-officer
// @desc    Assign officer role (president, secretary, treasurer)
// @access  Private (Admin or current officers)
router.post("/:id/assign-officer", auth, async (req, res) => {
  try {
    const { memberId, position } = req.body;
    
    if (!['president', 'secretary', 'treasurer'].includes(position)) {
      return res.status(400).json({ message: "Invalid position" });
    }

    const bachatGat = await BachatGat.findById(req.params.id);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check permissions
    const isOfficer = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString() ||
      bachatGat.treasurer?.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isOfficer) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if member exists in the group
    if (!bachatGat.members.includes(memberId)) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    // Ensure only one officer per position
    // Clear previous holder (implicit overwrite)
    bachatGat[position] = memberId;
    await bachatGat.save();

    res.json({ message: `Successfully assigned ${position}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;