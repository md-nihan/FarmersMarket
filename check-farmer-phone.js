// Script to check farmer phone number formats in the database
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Check farmer phone numbers
const checkFarmerPhones = async () => {
  try {
    const conn = await connectDB();
    
    console.log('=== Checking Farmer Phone Numbers ===');
    
    // Find all farmers
    const farmers = await Farmer.find({});
    
    if (farmers.length === 0) {
      console.log('❌ No farmers found in database');
      return;
    }
    
    console.log(`✅ Found ${farmers.length} farmers:`);
    
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name}: ${farmer.phone} (${farmer.approvalStatus}, ${farmer.isActive ? 'Active' : 'Inactive'})`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error checking farmers:', error.message);
    mongoose.connection.close();
  }
};

// Run the check
checkFarmerPhones();