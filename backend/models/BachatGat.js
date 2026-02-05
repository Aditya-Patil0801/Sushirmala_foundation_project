const mongoose = require("mongoose");

const bachatGatSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['Sushir Jyot', 'Sushir Umang', 'Sushir Udan']
  },
  description: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  bankAccount: {
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String, required: true }
  },
  location: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true }
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxMembers: { type: Number, default: 12, min: 1, max: 12 },
  foundedDate: { type: Date, default: Date.now },
  monthlyMeetingDate: { type: Number, min: 1, max: 31 }, // Day of month
  monthlyContribution: { type: Number, required: true, min: 100 }, // Monthly saving amount
  totalFunds: { type: Number, default: 0 },
  president: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  secretary: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  treasurer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  rules: [{ type: String }], // Group rules
  meetings: [{
    date: { type: Date, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    agenda: { type: String },
    decisions: [{ type: String }],
    nextMeetingDate: { type: Date }
  }],
  transactions: [{
    type: { type: String, enum: ['contribution', 'loan', 'repayment', 'expense'], required: true },
    amount: { type: Number, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],
  schemes: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String }, // Optional URL for scheme details
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  noticeBoard: [{
    type: { type: String, enum: ['scheme', 'meeting', 'general'], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

// Virtual to get current member count
bachatGatSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual to check if group is full
bachatGatSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

module.exports = mongoose.model("BachatGat", bachatGatSchema);
