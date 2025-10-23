// Test Green API client
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

console.log('🔧 Testing Green API client initialization...');

try {
  const greenApiUrl = process.env.GREEN_API_URL;
  const greenApiIdInstance = process.env.GREEN_API_ID_INSTANCE;
  const greenApiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;
  
  console.log('🔧 Green API Configuration Check:');
  console.log(`   Green API URL: ${greenApiUrl || 'MISSING'}`);
  console.log(`   Instance ID: ${greenApiIdInstance || 'MISSING'}`);
  console.log(`   Token: ${greenApiTokenInstance ? 'SET' : 'MISSING'}`);
  
  if (!greenApiUrl || !greenApiIdInstance || !greenApiTokenInstance) {
    console.error('❌ Green API credentials are missing!');
    process.exit(1);
  }
  
  console.log('✅ Green API configuration is complete');
  console.log('ℹ️  Green API client is ready to send messages');
  
} catch (error) {
  console.error('❌ Failed to initialize Green API client:', error.message);
  console.error('Error stack:', error.stack);
}