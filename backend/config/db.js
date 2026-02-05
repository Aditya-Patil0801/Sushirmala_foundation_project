const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
   
    // Don't exit in development to allow testing without database
    console.error('MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;
