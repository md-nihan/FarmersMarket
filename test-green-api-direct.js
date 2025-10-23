// Direct test of Green API configuration
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

async function testGreenApiDirect() {
  try {
    const GREEN_API_URL = process.env.GREEN_API_URL || 'https://7107.api.green-api.com';
    const GREEN_API_ID_INSTANCE = process.env.GREEN_API_ID_INSTANCE || '7107354839';
    const GREEN_API_TOKEN_INSTANCE = process.env.GREEN_API_TOKEN_INSTANCE || '5b07156c08544004b9e719999b8b3afb10fd4aae37304efa99';
    
    console.log('🔧 Testing Green API configuration...');
    console.log(`   GREEN_API_URL: ${GREEN_API_URL}`);
    console.log(`   GREEN_API_ID_INSTANCE: ${GREEN_API_ID_INSTANCE}`);
    console.log(`   GREEN_API_TOKEN_INSTANCE: ${GREEN_API_TOKEN_INSTANCE ? 'SET' : 'MISSING'}`);
    
    if (!GREEN_API_TOKEN_INSTANCE) {
      console.error('❌ Green API token is missing!');
      return;
    }
    
    // Test the API with a simple request to check if the instance is active
    const response = await axios.get(
      `${GREEN_API_URL}/waInstance${GREEN_API_ID_INSTANCE}/GetSettings/${GREEN_API_TOKEN_INSTANCE}`
    );
    
    console.log('✅ Green API instance is active!');
    console.log('Instance settings:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing Green API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGreenApiDirect();