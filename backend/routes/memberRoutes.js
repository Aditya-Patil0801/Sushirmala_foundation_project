const express = require("express");
const BachatGat = require("../models/BachatGat");
const User = require("../models/User");
const Loan = require("../models/Loan");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/members/:groupId
// @desc    Get all members of a Bachat Gat
// @access  Private
router.get("/:groupId", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.groupId)
      .populate('members', 'name email phone address age occupation role joiningDate profilePicture isActive')
      .populate('president secretary treasurer', 'name email');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has access to this group
    if (req.user.bachatGatId?.toString() !== bachatGat._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      members: bachatGat.members,
      officers: {
        president: bachatGat.president,
        secretary: bachatGat.secretary,
        treasurer: bachatGat.treasurer
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/members/:groupId/:userId
// @desc    Get specific member details (for authorized users only)
// @access  Private
router.get("/:groupId/:userId", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has access to this group
    if (req.user.bachatGatId?.toString() !== bachatGat._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if requesting user can view other profiles
    const canViewProfiles = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString() ||
      bachatGat.treasurer?.toString() === req.user._id.toString() ||
      req.params.userId === req.user._id.toString() // Can always view own profile
    );

    if (!canViewProfiles) {
      return res.status(403).json({ message: "Only officers can view other member profiles" });
    }

    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('bachatGatId', 'name');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user is member of this group
    if (user.bachatGatId?._id.toString() !== req.params.groupId) {
      return res.status(403).json({ message: "User is not a member of this group" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/members/:groupId/add
// @desc    Add a new member to Bachat Gat (invite by email)
// @access  Private (President, Secretary only)
router.post("/:groupId/add", auth, async (req, res) => {
  try {
    const { email, role } = req.body;

    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has permission (President or Secretary)
    const canManageMembers = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageMembers) {
      return res.status(403).json({ message: "Only President and Secretary can add members" });
    }

    // Check if group is full
    if (bachatGat.members.length >= bachatGat.maxMembers) {
      return res.status(400).json({ message: "Bachat Gat is full (maximum 12 members)" });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    // Check if user is already in a group
    if (userToAdd.bachatGatId) {
      return res.status(400).json({ message: "User is already a member of another Bachat Gat" });
    }

    // Check if user is already in this group
    if (bachatGat.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User is already a member of this group" });
    }

    // Add user to group
    bachatGat.members.push(userToAdd._id);
    
    // If role specified and it's an officer role, assign it
    if (role && ['president', 'secretary', 'treasurer'].includes(role)) {
      bachatGat[role] = userToAdd._id;
      await User.findByIdAndUpdate(userToAdd._id, { role });
    }

    await bachatGat.save();

    // Update user's bachatGatId
    await User.findByIdAndUpdate(userToAdd._id, { bachatGatId: bachatGat._id });

    res.json({ message: "Member added successfully", member: userToAdd.name });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/members/:groupId/:userId
// @desc    Remove a member from Bachat Gat (COMPLETE DELETION)
// @access  Private (President, Secretary only)
router.delete("/:groupId/:userId", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has permission (President or Secretary)
    const canManageMembers = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageMembers) {
      return res.status(403).json({ message: "Only President and Secretary can remove members" });
    }

    const userToRemove = await User.findById(req.params.userId);
    if (!userToRemove) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cannot remove yourself
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    // Check if user has active loans
    const activeLoans = await Loan.find({
      member: req.params.userId,
      status: { $in: ['pending', 'approved', 'active'] }
    });

    if (activeLoans.length > 0) {
      return res.status(400).json({ 
        message: "Cannot remove member with active loans. Please settle all loans first." 
      });
    }

    // Remove user from group members
    bachatGat.members = bachatGat.members.filter(
      member => member.toString() !== req.params.userId
    );

    // Remove from officer positions if applicable
    if (bachatGat.president?.toString() === req.params.userId) {
      bachatGat.president = null;
    }
    if (bachatGat.secretary?.toString() === req.params.userId) {
      bachatGat.secretary = null;
    }
    if (bachatGat.treasurer?.toString() === req.params.userId) {
      bachatGat.treasurer = null;
    }

    // Remove user from all group transactions, meetings, etc.
    bachatGat.transactions = bachatGat.transactions.filter(
      transaction => transaction.member?.toString() !== req.params.userId
    );

    bachatGat.meetings.forEach(meeting => {
      meeting.attendees = meeting.attendees.filter(
        attendee => attendee.toString() !== req.params.userId
      );
    });

    bachatGat.noticeBoard = bachatGat.noticeBoard.filter(
      notice => notice.postedBy?.toString() !== req.params.userId
    );

    bachatGat.schemes = bachatGat.schemes.filter(
      scheme => scheme.createdBy?.toString() !== req.params.userId
    );

    await bachatGat.save();

    // COMPLETE USER DELETION - Remove user from database entirely
    await User.findByIdAndDelete(req.params.userId);

    // Delete all user's loans
    await Loan.deleteMany({ member: req.params.userId });

    res.json({ 
      message: "Member removed completely from system", 
      removedUser: userToRemove.name 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/members/:groupId/:userId/role
// @desc    Update member role
// @access  Private (President, Secretary only)
router.put("/:groupId/:userId/role", auth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['president', 'secretary', 'treasurer', 'member'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check permissions
    const canManageMembers = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageMembers) {
      return res.status(403).json({ message: "Only President and Secretary can change roles" });
    }

    // Check if member exists in group
    if (!bachatGat.members.includes(req.params.userId)) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    // If assigning officer role, clear previous holder and set new one
    if (['president', 'secretary', 'treasurer'].includes(role)) {
      // Clear previous holder
      if (bachatGat[role]) {
        await User.findByIdAndUpdate(bachatGat[role], { role: 'member' });
      }
      
      // Set new officer
      bachatGat[role] = req.params.userId;
    } else {
      // If demoting to member, remove from officer positions
      if (bachatGat.president?.toString() === req.params.userId) {
        bachatGat.president = null;
      }
      if (bachatGat.secretary?.toString() === req.params.userId) {
        bachatGat.secretary = null;
      }
      if (bachatGat.treasurer?.toString() === req.params.userId) {
        bachatGat.treasurer = null;
      }
    }

    await bachatGat.save();

    // Update user's role
    await User.findByIdAndUpdate(req.params.userId, { role });

    res.json({ message: `Role updated to ${role} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
