const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const BachatGat = require('../models/BachatGat');
const { auth } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// Record a contribution (Treasurer and officers only)
router.post('/', async (req, res) => {
  try {
    const { memberId, amount, month, year, paymentMethod, remarks } = req.body;
    const userId = req.user.id;

    // Check if user has permission (President, Secretary, or Treasurer)
    const user = await User.findById(userId);
    if (!['president', 'secretary', 'treasurer'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only officers can record contributions' 
      });
    }

    // Validate required fields
    if (!memberId || !amount || !month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Member ID, amount, month, and year are required' 
      });
    }

    // Validate month (1-12)
    if (month < 1 || month > 12) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month must be between 1 and 12' 
      });
    }

    // Validate year (reasonable range)
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 5 || year > currentYear + 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year must be within a reasonable range' 
      });
    }

    // Check if member exists and belongs to the same BachatGat
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Member not found' 
      });
    }

    if (member.bachatGatId.toString() !== user.bachatGatId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Member does not belong to your BachatGat' 
      });
    }

    // Check if contribution already exists for this member, month, and year
    const existingContribution = await Contribution.findOne({ memberId, month, year });
    if (existingContribution) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contribution already recorded for this member for the specified month and year' 
      });
    }

    // Create contribution
    const contribution = new Contribution({
      memberId,
      bachatGatId: user.bachatGatId,
      amount,
      month,
      year,
      recordedBy: userId,
      paymentMethod: paymentMethod || 'cash',
      remarks
    });

    await contribution.save();

    // Populate member details
    await contribution.populate('memberId', 'name email');
    await contribution.populate('recordedBy', 'name role');

    res.status(201).json({ 
      success: true, 
      message: 'Contribution recorded successfully',
      data: contribution
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contribution already recorded for this member for the specified month and year' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all contributions for a BachatGat
router.get('/bachat-gat/:bachatGatId', async (req, res) => {
  try {
    const { bachatGatId } = req.params;
    const { month, year } = req.query;

    // Check if user belongs to this BachatGat
    const user = await User.findById(req.user.id);
    if (user.bachatGatId.toString() !== bachatGatId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view contributions for your BachatGat' 
      });
    }

    let query = { bachatGatId };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const contributions = await Contribution.find(query)
      .populate('memberId', 'name email')
      .populate('recordedBy', 'name role')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contributions for a specific member
router.get('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if user has permission to view this member's contributions
    const user = await User.findById(req.user.id);
    const targetMember = await User.findById(memberId);
    
    // User can view their own contributions or officers can view any member's contributions
    if (user._id.toString() !== memberId && !['president', 'secretary', 'treasurer'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view your own contributions or you need officer permissions' 
      });
    }

    // Check if both users belong to the same BachatGat
    if (user.bachatGatId.toString() !== targetMember.bachatGatId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view contributions for members in your BachatGat' 
      });
    }

    const contributions = await Contribution.find({ memberId })
      .populate('recordedBy', 'name role')
      .sort({ year: -1, month: -1 });

    res.json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get members who have paid for a specific month/year
router.get('/paid-members/:bachatGatId', async (req, res) => {
  try {
    const { bachatGatId } = req.params;
    const { month, year } = req.query;

    // Validate required parameters
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month and year are required' 
      });
    }

    // Check if user belongs to this BachatGat
    const user = await User.findById(req.user.id);
    if (user.bachatGatId.toString() !== bachatGatId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view contributions for your BachatGat' 
      });
    }

    const contributions = await Contribution.find({ 
      bachatGatId, 
      month: parseInt(month), 
      year: parseInt(year) 
    }).populate('memberId', 'name email');

    res.json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a contribution (Officers only)
router.delete('/:contributionId', async (req, res) => {
  try {
    const { contributionId } = req.params;

    // Check if user has permission (President, Secretary, or Treasurer)
    const user = await User.findById(req.user.id);
    if (!['president', 'secretary', 'treasurer'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only officers can delete contributions' 
      });
    }

    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contribution not found' 
      });
    }

    // Check if contribution belongs to user's BachatGat
    if (contribution.bachatGatId.toString() !== user.bachatGatId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete contributions for your BachatGat' 
      });
    }

    await Contribution.findByIdAndDelete(contributionId);

    res.json({ 
      success: true, 
      message: 'Contribution deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;