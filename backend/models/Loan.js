const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  bachatGatId: { type: mongoose.Schema.Types.ObjectId, ref: "BachatGat", required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1000 },
  interestRate: { type: Number, required: true, min: 0, max: 50 }, // Interest rate in percentage
  duration: { type: Number, required: true, min: 1 }, // Duration in months
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedDate: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },
  monthlyEMI: { type: Number },
  totalAmount: { type: Number }, // Principal + Interest
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  transactions: [{
    type: { type: String, enum: ['emi', 'partial', 'full', 'loan_disbursement'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],
  documents: [{
    type: { type: String, required: true }, // e.g., 'income_certificate', 'guarantor_form'
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedDate: { type: Date, default: Date.now }
  }],
  guarantors: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
    address: { type: String, required: true }
  }],
  remarks: { type: String }
}, {
  timestamps: true
});

// Virtual to calculate remaining amount
loanSchema.virtual('calculatedRemainingAmount').get(function() {
  if (this.totalAmount && this.paidAmount) {
    return this.totalAmount - this.paidAmount;
  }
  return this.remainingAmount;
});

// Virtual to check if loan is overdue
loanSchema.virtual('isOverdue').get(function() {
  if (this.endDate && this.status === 'active') {
    return new Date() > this.endDate && this.remainingAmount > 0;
  }
  return false;
});

// Method to update remaining amount
loanSchema.methods.updateRemainingAmount = function() {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  return this.save();
};

module.exports = mongoose.model("Loan", loanSchema);