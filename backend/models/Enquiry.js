const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  interestedInJoining: { type: Boolean, required: true },
  livesInRentedHouse: { type: Boolean, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedDate: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedDate: { type: Date },
  remarks: { type: String },
  bachatGatId: { type: mongoose.Schema.Types.ObjectId, ref: "BachatGat", required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Enquiry", enquirySchema);