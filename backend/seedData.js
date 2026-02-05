const mongoose = require('mongoose');
const BachatGat = require('./models/BachatGat');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Bachat Gat groups
const seedBachatGats = async () => {
  try {
    // Clear existing data
    await BachatGat.deleteMany({});
    await User.deleteMany({});

    // Create the three Bachat Gat groups
    const bachatGats = [
      {
        name: 'Sushir Jyot',
        description: 'A group focused on women empowerment and financial independence through collective savings and mutual support.',
        registrationNumber: 'BG001',
        bankAccount: {
          accountNumber: '1234567890123456',
          bankName: 'State Bank of India',
          ifscCode: 'SBIN0001234'
        },
        location: {
          village: 'Village A',
          district: 'District A',
          state: 'Maharashtra'
        },
        maxMembers: 12,
        monthlyContribution: 1000,
        totalFunds: 0,
        foundedDate: new Date('2020-01-01'),
        monthlyMeetingDate: 15,
        isActive: true,
        rules: [
          'Monthly contribution of ₹1000 is mandatory',
          'Meetings will be held on 15th of every month',
          'All members must attend at least 80% of meetings',
          'Loan applications require approval from President and Secretary',
          'Maximum loan amount is 5 times the monthly contribution'
        ]
      },
      {
        name: 'Sushir Umang',
        description: 'A group dedicated to uplifting women through education, skill development, and financial literacy.',
        registrationNumber: 'BG002',
        bankAccount: {
          accountNumber: '2345678901234567',
          bankName: 'HDFC Bank',
          ifscCode: 'HDFC0001234'
        },
        location: {
          village: 'Village B',
          district: 'District B',
          state: 'Maharashtra'
        },
        maxMembers: 12,
        monthlyContribution: 1200,
        totalFunds: 0,
        foundedDate: new Date('2020-02-01'),
        monthlyMeetingDate: 20,
        isActive: true,
        rules: [
          'Monthly contribution of ₹1200 is mandatory',
          'Meetings will be held on 20th of every month',
          'All members must attend at least 80% of meetings',
          'Loan applications require approval from President and Secretary',
          'Maximum loan amount is 5 times the monthly contribution'
        ]
      },
      {
        name: 'Sushir Udan',
        description: 'A group committed to helping women achieve their dreams through entrepreneurship and business development.',
        registrationNumber: 'BG003',
        bankAccount: {
          accountNumber: '3456789012345678',
          bankName: 'ICICI Bank',
          ifscCode: 'ICIC0001234'
        },
        location: {
          village: 'Village C',
          district: 'District C',
          state: 'Maharashtra'
        },
        maxMembers: 12,
        monthlyContribution: 1500,
        totalFunds: 0,
        foundedDate: new Date('2020-03-01'),
        monthlyMeetingDate: 25,
        isActive: true,
        rules: [
          'Monthly contribution of ₹1500 is mandatory',
          'Meetings will be held on 25th of every month',
          'All members must attend at least 80% of meetings',
          'Loan applications require approval from President and Secretary',
          'Maximum loan amount is 5 times the monthly contribution'
        ]
      }
    ];

    const createdBachatGats = await BachatGat.insertMany(bachatGats);
    console.log('Bachat Gat groups created:', createdBachatGats.length);

    // Do not create any sample users; only seed empty groups
    console.log('Database seeded successfully with empty groups (no dummy users).');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedBachatGats();
  process.exit(0);
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedBachatGats };
