// Test phone number formatting
const { normalizePhone } = require('./utils/phone');

// Test with the farmer's phone number
const farmerPhone = '+919845325913';

console.log('Testing phone number formatting:');
console.log('Original:', farmerPhone);
console.log('Normalized:', normalizePhone(farmerPhone));

// Test what the Green API function would create as chatId
const normalized = normalizePhone(farmerPhone);
const greenApiNumber = normalized.startsWith('+') ? normalized.substring(1) : normalized;
const chatId = `${greenApiNumber}@c.us`;
console.log('ChatId:', chatId);

// This should match what we saw in the Green API settings: 919845325913@c.us
console.log('Expected format from Green API settings: 919845325913@c.us');
console.log('Match:', chatId === '919845325913@c.us' ? '✅ YES' : '❌ NO');