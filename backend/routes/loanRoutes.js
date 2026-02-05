const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const BachatGat = require('../models/BachatGat');
const { auth } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// Get all loans for a user's Bachat Gat
router.get('/bachat-gat/:bachatGatId', async (req, res) => {
  try {
    const { bachatGatId } = req.params;
    const { status } = req.query;

    let query = { bachatGatId };
    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query)
      .populate('member', 'name email phone role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's own loans
router.get('/my-loans', async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await Loan.find({ member: userId })
      .populate('bachatGatId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new loan request
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      interestRate,
      duration,
      purpose,
      guarantors,
      documents
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId).populate('bachatGatId');
    
    if (!user.bachatGatId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not part of any Bachat Gat' 
      });
    }

    // Build guarantors array from either structured payload or flat fields
    let normalizedGuarantors = Array.isArray(guarantors) ? guarantors : [];
    if (!Array.isArray(guarantors)) {
      const { guarantorName, guarantorPhone, guarantorRelation, guarantorAddress } = req.body;
      if (guarantorName || guarantorPhone || guarantorRelation) {
        normalizedGuarantors.push({
          name: guarantorName || 'N/A',
          phone: guarantorPhone || 'N/A',
          relationship: guarantorRelation || 'N/A',
          address: guarantorAddress || 'Not provided'
        });
      }
    }

    const effectiveInterestRate = Number(interestRate) || 12; // default 12%

    const loan = new Loan({
      bachatGatId: user.bachatGatId._id,
      member: userId,
      amount,
      interestRate: effectiveInterestRate,
      duration,
      purpose,
      guarantors: normalizedGuarantors,
      documents: documents || []
    });

    // Calculate EMI and total amount
    const monthlyRate = effectiveInterestRate / 100 / 12;
    const emi = amount * (monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                (Math.pow(1 + monthlyRate, duration) - 1);
    const totalAmount = emi * duration;

    loan.monthlyEMI = Math.round(emi);
    loan.totalAmount = Math.round(totalAmount);
    loan.remainingAmount = Math.round(totalAmount);

    await loan.save();
    await loan.populate('member', 'name email phone');

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/reject loan (President/Secretary only)
router.patch('/:loanId/status', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { status, remarks } = req.body;
    const userId = req.user.id;

    // Check if user has permission (President or Secretary)
    const user = await User.findById(userId);
    if (!['president', 'secretary'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only President or Secretary can approve loans' 
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    if (status === 'approved') {
      loan.status = 'approved';
      loan.approvedBy = userId;
      loan.approvedDate = new Date();
      loan.remarks = remarks;
      loan.startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + loan.duration);
      loan.endDate = endDate;
      
      // Update the member's loan balance
      const member = await User.findById(loan.member);
      if (member) {
        member.loanBalance = (member.loanBalance || 0) + loan.amount;
        member.interestRate = loan.interestRate;
        await member.save();
      }
      
      await loan.save();
      await loan.populate('member', 'name email phone');
      await loan.populate('approvedBy', 'name role');
      
      // Create a transaction for the approved loan
      const transaction = {
        type: 'loan_disbursement',
        amount: loan.amount,
        description: `Loan approved for ${loan.purpose}`,
        processedBy: userId
      };
      
      loan.transactions.push(transaction);
      await loan.save();
      
      return res.json({ success: true, data: loan });
    }

    if (status === 'rejected') {
      await Loan.findByIdAndDelete(loanId);
      return res.json({ success: true, message: 'Loan rejected and application deleted' });
    }

    return res.status(400).json({ success: false, message: 'Invalid status' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record loan payment (Treasurer only)
router.post('/:loanId/payment', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, type, description } = req.body;
    const userId = req.user.id;

    // Check if user is Treasurer
    const user = await User.findById(userId);
    if (user.role !== 'treasurer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Treasurer can record payments' 
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only record payments for active loans' 
      });
    }

    // Add transaction
    loan.transactions.push({
      type,
      amount,
      description,
      processedBy: userId
    });

    // Update paid amount
    loan.paidAmount += amount;
    loan.remainingAmount = loan.totalAmount - loan.paidAmount;

    // Check if loan is completed
    if (loan.remainingAmount <= 0) {
      loan.status = 'completed';
    }

    await loan.save();
    await loan.populate('member', 'name email phone');

    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get loan details
router.get('/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId)
      .populate('member', 'name email phone role')
      .populate('bachatGatId', 'name registrationNumber')
      .populate('approvedBy', 'name role')
      .populate('transactions.processedBy', 'name role');

    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
