const express = require("express");
const BachatGat = require("../models/BachatGat");
const User = require("../models/User");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/schemes/:groupId
// @desc    Get all schemes for a specific Bachat Gat
// @access  Private
router.get("/:groupId", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.groupId)
      .populate('schemes.createdBy', 'name role')
      .select('schemes');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has access to this group
    if (req.user.bachatGatId?.toString() !== bachatGat._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(bachatGat.schemes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/schemes/:groupId
// @desc    Add a new scheme to Bachat Gat
// @access  Private (President, Secretary only)
router.post("/:groupId", auth, async (req, res) => {
  try {
    const { title, description, url, startDate, endDate } = req.body;

    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check if user has permission (President or Secretary)
    const canManageSchemes = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageSchemes) {
      return res.status(403).json({ message: "Only President and Secretary can manage schemes" });
    }

    const newScheme = {
      title,
      description,
      url,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    bachatGat.schemes.push(newScheme);
    await bachatGat.save();

    // Add to notice board
    bachatGat.noticeBoard.push({
      type: 'scheme',
      title: `New Scheme: ${title}`,
      content: description,
      postedBy: req.user._id
    });
    await bachatGat.save();

    res.status(201).json({ message: "Scheme added successfully", scheme: newScheme });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/schemes/:groupId/:schemeId
// @desc    Update a scheme
// @access  Private (President, Secretary only)
router.put("/:groupId/:schemeId", auth, async (req, res) => {
  try {
    const { title, description, url, startDate, endDate, isActive } = req.body;

    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check permissions
    const canManageSchemes = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageSchemes) {
      return res.status(403).json({ message: "Only President and Secretary can manage schemes" });
    }

    const scheme = bachatGat.schemes.id(req.params.schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Update scheme fields
    if (title) scheme.title = title;
    if (description) scheme.description = description;
    if (url !== undefined) scheme.url = url;
    if (startDate) scheme.startDate = new Date(startDate);
    if (endDate !== undefined) scheme.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) scheme.isActive = isActive;

    await bachatGat.save();

    res.json({ message: "Scheme updated successfully", scheme });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/schemes/:groupId/:schemeId
// @desc    Delete a scheme
// @access  Private (President, Secretary only)
router.delete("/:groupId/:schemeId", auth, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.params.groupId);
    
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Check permissions
    const canManageSchemes = (
      bachatGat.president?.toString() === req.user._id.toString() ||
      bachatGat.secretary?.toString() === req.user._id.toString()
    );

    if (!canManageSchemes) {
      return res.status(403).json({ message: "Only President and Secretary can manage schemes" });
    }

    const scheme = bachatGat.schemes.id(req.params.schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Remove the scheme completely
    bachatGat.schemes.pull(req.params.schemeId);
    await bachatGat.save();

    res.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
