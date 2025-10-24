// Test phone number formatting
const { normalizePhone } = require('./utils/phone');

// Test with the farmer's phone number
const farmerPhone = '+919845325913';

console.log('Testing phone number formatting:');
console.log('Original:', farmerPhone);
console.log('Normalized:', normalizePhone(farmerPhone));

// Test what the phone utility would create
const normalized = normalizePhone(farmerPhone);
console.log('Normalized format:', normalized);

console.log('Match with expected format:', normalized === '+919845325913' ? '✅ YES' : '❌ NO');