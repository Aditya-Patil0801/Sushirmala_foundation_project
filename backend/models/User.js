const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  age: { type: Number, required: true, min: 18, max: 65 },
  occupation: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ['president', 'secretary', 'treasurer', 'member'], default: 'member' },
  bachatGatId: { type: mongoose.Schema.Types.ObjectId, ref: "BachatGat" },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  profilePicture: { type: String }, // URL to profile image
  passbookFile: { type: String }, // URL to passbook file
  loanBalance: { type: Number, default: 0 }, // Current loan balance
  interestRate: { type: Number, default: 0 }, // Interest rate for user's loans
  loanHistory: [{
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);