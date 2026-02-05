const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const BachatGat = require('../models/BachatGat');
const { auth } = require('../middleware/authMiddleware');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

// Create new enquiry (public route - no auth required for submission)
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      interestedInJoining,
      livesInRentedHouse,
      bachatGatId
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || interestedInJoining === undefined || livesInRentedHouse === undefined || !bachatGatId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number. Must be 10 digits starting with 6-9' 
      });
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(address.pincode)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pincode. Must be 6 digits' 
      });
    }

    // Check if BachatGat exists
    const bachatGat = await BachatGat.findById(bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ 
        success: false, 
        message: 'BachatGat not found' 
      });
    }

    // Create enquiry
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      address,
      interestedInJoining,
      livesInRentedHouse,
      bachatGatId
    });

    await enquiry.save();

    res.status(201).json({ 
      success: true, 
      message: 'Enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply auth middleware to all other routes
router.use(auth);

// Get all enquiries for a BachatGat (President, Secretary, Treasurer only)
router.get('/bachat-gat/:bachatGatId', async (req, res) => {
  try {
    const { bachatGatId } = req.params;
    const { status } = req.query;

    // Check if user has permission (President, Secretary, or Treasurer)
    const user = await User.findById(req.user.id);
    if (!['president', 'secretary', 'treasurer'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only officers can view enquiries' 
      });
    }

    // Check if user belongs to this BachatGat
    if (user.bachatGatId.toString() !== bachatGatId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view enquiries for your BachatGat' 
      });
    }

    let query = { bachatGatId };
    if (status) {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query)
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve enquiry (President, Secretary only)
router.patch('/:enquiryId/approve', async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { remarks } = req.body;

    // Check if user has permission (President or Secretary)
    const user = await User.findById(req.user.id);
    if (!['president', 'secretary'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only President or Secretary can approve enquiries' 
      });
    }

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Enquiry not found' 
      });
    }

    // Check if enquiry belongs to user's BachatGat
    if (enquiry.bachatGatId.toString() !== user.bachatGatId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only approve enquiries for your BachatGat' 
      });
    }

    // Check if already processed
    if (enquiry.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Enquiry already processed' 
      });
    }

    // Update enquiry
    enquiry.status = 'approved';
    enquiry.approvedBy = user._id;
    enquiry.approvedDate = new Date();
    enquiry.remarks = remarks;
    await enquiry.save();

    // Send email notification to applicant
    const bachatGat = await BachatGat.findById(enquiry.bachatGatId);
    if (bachatGat) {
      await sendApprovalEmail(enquiry.email, enquiry.name, bachatGat.name);
    }

    res.json({ 
      success: true, 
      message: 'Enquiry approved successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject enquiry (President, Secretary only)
router.patch('/:enquiryId/reject', async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { remarks } = req.body;

    // Check if user has permission (President or Secretary)
    const user = await User.findById(req.user.id);
    if (!['president', 'secretary'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only President or Secretary can reject enquiries' 
      });
    }

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Enquiry not found' 
      });
    }

    // Check if enquiry belongs to user's BachatGat
    if (enquiry.bachatGatId.toString() !== user.bachatGatId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only reject enquiries for your BachatGat' 
      });
    }

    // Check if already processed
    if (enquiry.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Enquiry already processed' 
      });
    }

    // Update enquiry
    enquiry.status = 'rejected';
    enquiry.rejectedBy = user._id;
    enquiry.rejectedDate = new Date();
    enquiry.remarks = remarks;
    await enquiry.save();

    // Send email notification to applicant
    const bachatGat = await BachatGat.findById(enquiry.bachatGatId);
    if (bachatGat) {
      await sendRejectionEmail(enquiry.email, enquiry.name, bachatGat.name, remarks);
    }

    res.json({ 
      success: true, 
      message: 'Enquiry rejected successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;