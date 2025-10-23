// Test script for Green API integration
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test Green API message sending
const testGreenApiMessage = async (toNumber, message) => {
  try {
    // Import the Green API WhatsApp messaging system
    const whatsappRoutes = require('./routes/whatsapp-green');
    const sendWhatsAppMessage = whatsappRoutes.sendWhatsAppMessage;
    
    console.log(`📱 Testing Green API message to ${toNumber}...`);
    
    const result = await sendWhatsAppMessage({
      body: message,
      to: toNumber // The function will format this correctly
    });
    
    console.log('✅ Green API message sent successfully!');
    console.log('Message ID:', result.id);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending Green API message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
};

// Test with active farmer
const testWithActiveFarmer = async () => {
  try {
    await connectDB();
    
    console.log('=== Testing Green API with Active Farmer ===');
    
    // Find an active farmer for testing
    const farmer = await Farmer.findOne({ isActive: true });
    
    if (!farmer) {
      console.log('❌ No active farmer found for testing');
      return;
    }
    
    console.log(`✅ Found active farmer: ${farmer.name} (${farmer.phone})`);
    
    // Test sending a message
    const testMessage = `🧪 Test message from FarmLink AI Green API integration!\n\nThis is a test to verify Green API functionality.`;
    
    // For testing purposes, we'll send the message to the farmer's phone number
    // The Green API function will format it correctly as phone@c.us
    await testGreenApiMessage(farmer.phone, testMessage);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    mongoose.connection.close();
  }
};

// Run the test
testWithActiveFarmer();