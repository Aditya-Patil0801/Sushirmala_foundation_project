const express = require("express");
const BachatGat = require("../models/BachatGat");
const { auth, groupMemberOnly, groupOfficerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/meetings
// @desc    Create a new meeting
// @access  Private (Group Officers)
router.post("/", auth, groupOfficerOnly, async (req, res) => {
  try {
    const { date, agenda, nextMeetingDate, attendees } = req.body;
    
    const bachatGat = await BachatGat.findById(req.user.bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const meeting = {
      date: new Date(date),
      attendees: Array.isArray(attendees) ? attendees : [],
      agenda,
      decisions: [],
      nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate) : null
    };

    bachatGat.meetings.push(meeting);
    await bachatGat.save();

    res.status(201).json({ 
      message: "Meeting created successfully",
      meeting: bachatGat.meetings[bachatGat.meetings.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/meetings/:meetingId/attendance
// @desc    Mark attendance for a meeting
// @access  Private (Group Members)
router.put("/:meetingId/attendance", auth, groupMemberOnly, async (req, res) => {
  try {
    const { memberId } = req.body;
    
    const bachatGat = await BachatGat.findById(req.user.bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const meeting = bachatGat.meetings.id(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if member is in the group (compare as strings to avoid ObjectId issues)
    if (!bachatGat.members.some((m) => m.toString() === String(memberId))) {
      return res.status(400).json({ message: "Member not found in this group" });
    }

    // Add to attendees if not already present
    if (!meeting.attendees.some((m) => m.toString() === String(memberId))) {
      meeting.attendees.push(memberId);
      await bachatGat.save();
    }

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/meetings/:meetingId/decisions
// @desc    Add decisions to a meeting
// @access  Private (Group Officers)
router.put("/:meetingId/decisions", auth, groupOfficerOnly, async (req, res) => {
  try {
    const { decisions } = req.body;
    
    const bachatGat = await BachatGat.findById(req.user.bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const meeting = bachatGat.meetings.id(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.decisions = decisions;
    await bachatGat.save();

    res.json({ message: "Meeting decisions updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/meetings
// @desc    Get meetings for user's group
// @access  Private (Group Members)
router.get("/", auth, groupMemberOnly, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.user.bachatGatId)
      .populate('meetings.attendees', 'name email')
      .select('meetings');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    res.json(bachatGat.meetings.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;