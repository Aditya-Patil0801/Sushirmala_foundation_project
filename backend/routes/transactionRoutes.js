const express = require("express");
const BachatGat = require("../models/BachatGat");
const { auth, groupMemberOnly, groupOfficerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private (Group Officers)
router.post("/", auth, groupOfficerOnly, async (req, res) => {
  try {
    const { type, amount, member, description } = req.body;
    
    if (!['contribution', 'loan', 'repayment', 'expense'].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const bachatGat = await BachatGat.findById(req.user.bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    // Validate member if provided (compare as strings)
    if (member && !bachatGat.members.some((m) => m.toString() === String(member))) {
      return res.status(400).json({ message: "Member not found in this group" });
    }

    const transaction = {
      type,
      amount: Number(amount),
      member: member || null,
      description,
      approvedBy: req.user._id,
      date: new Date()
    };

    // Update total funds based on transaction type
    if (type === 'contribution') {
      bachatGat.totalFunds += Number(amount);
    } else if (type === 'loan' || type === 'expense') {
      if (bachatGat.totalFunds < Number(amount)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      bachatGat.totalFunds -= Number(amount);
    } else if (type === 'repayment') {
      bachatGat.totalFunds += Number(amount);
    }

    bachatGat.transactions.push(transaction);
    await bachatGat.save();

    res.status(201).json({
      message: "Transaction recorded successfully",
      transaction: bachatGat.transactions[bachatGat.transactions.length - 1],
      totalFunds: bachatGat.totalFunds
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/transactions
// @desc    Get transactions for user's group
// @access  Private (Group Members)
router.get("/", auth, groupMemberOnly, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    
    const bachatGat = await BachatGat.findById(req.user.bachatGatId)
      .populate('transactions.member', 'name email')
      .populate('transactions.approvedBy', 'name')
      .select('transactions totalFunds');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    let transactions = bachatGat.transactions;

    // Filter by type if provided
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      transactions: paginatedTransactions,
      totalFunds: bachatGat.totalFunds,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(transactions.length / limit),
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get transaction summary for user's group
// @access  Private (Group Members)
router.get("/summary", auth, groupMemberOnly, async (req, res) => {
  try {
    const bachatGat = await BachatGat.findById(req.user.bachatGatId)
      .select('transactions totalFunds');

    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const transactions = bachatGat.transactions;

    // Calculate summary
    const summary = {
      totalFunds: bachatGat.totalFunds,
      totalContributions: 0,
      totalLoans: 0,
      totalRepayments: 0,
      totalExpenses: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'contribution':
          summary.totalContributions += transaction.amount;
          break;
        case 'loan':
          summary.totalLoans += transaction.amount;
          break;
        case 'repayment':
          summary.totalRepayments += transaction.amount;
          break;
        case 'expense':
          summary.totalExpenses += transaction.amount;
          break;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/transactions/:transactionId
// @desc    Update a transaction
// @access  Private (Group Officers)
router.put("/:transactionId", auth, groupOfficerOnly, async (req, res) => {
  try {
    const { description } = req.body;
    
    const bachatGat = await BachatGat.findById(req.user.bachatGatId);
    if (!bachatGat) {
      return res.status(404).json({ message: "Bachat Gat not found" });
    }

    const transaction = bachatGat.transactions.id(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Only allow updating description for now
    transaction.description = description;
    await bachatGat.save();

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;