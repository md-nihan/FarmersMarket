// Script to create and approve a test farmer to test messaging
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink';

async function createAndApproveTestFarmer() {
  try {
    console.log('🧪 Creating and approving test farmer...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Delete any existing test farmers
    const deleted = await Farmer.deleteMany({ phone: '+919876543210' });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Deleted ${deleted.deletedCount} existing test farmers`);
    }
    
    // Create a test farmer
    console.log('\n🌱 Creating test farmer...');
    const farmer = new Farmer({
      name: 'Test Messaging Farmer',
      phone: '+919876543210',
      village: 'Test Village',
      district: 'Test District',
      crops: 'Tomato, Onion',
      approvalStatus: 'pending',
      isActive: false
    });
    
    await farmer.save();
    console.log('✅ Test farmer created successfully!');
    console.log(`   ID: ${farmer._id}`);
    console.log(`   Name: ${farmer.name}`);
    console.log(`   Phone: ${farmer.phone}`);
    console.log(`   Status: ${farmer.approvalStatus}`);
    
    // Test the WhatsApp system
    console.log('\n🔧 Testing WhatsApp system...');
    console.log('✅ WhatsApp system ready for testing!');
    console.log('\n📝 To test approval messaging:');
    console.log('   1. Start the server: node server.js');
    console.log('   2. Approve farmer with ID:', farmer._id.toString());
    console.log('   3. Check server logs for messaging status');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

// Run the function
createAndApproveTestFarmer();