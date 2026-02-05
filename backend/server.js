const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bachatgat", require("./routes/bachatGatRoutes"));
app.use("/api/meetings", require("./routes/meetingRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/schemes", require("./routes/schemeRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/contributions", require("./routes/contributionRoutes"));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sushrimala Foundation API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes (commented out for now)
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});