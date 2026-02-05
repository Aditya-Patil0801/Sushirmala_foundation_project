const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bachatGatId: { type: mongoose.Schema.Types.ObjectId, ref: "BachatGat", required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 }, // 1-12 for January-December
  year: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Officer who recorded the payment
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'other'], 
    default: 'cash' 
  },
  remarks: { type: String }
}, {
  timestamps: true
});

// Compound index to ensure unique contribution per member per month per year
contributionSchema.index({ memberId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Contribution", contributionSchema);