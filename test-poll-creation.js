// Test script to debug poll creation
import { film05Service } from './src/firebase.js';

async function testPollCreation() {
  console.log('🧪 Testing poll creation...');
  
  const testPollData = {
    title: 'Test Poll Creation',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    month: 7, // August (0-based)
    year: 2025,
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    id: `poll_${Date.now()}`
  };
  
  console.log('📤 Sending poll data:', testPollData);
  
  try {
    const result = await film05Service.createPoll(testPollData);
    console.log('📥 Result:', result);
    
    if (result.success) {
      console.log('✅ Poll created successfully!');
      
      // Test loading polls
      console.log('🔄 Testing poll loading...');
      const loadResult = await film05Service.loadPolls();
      console.log('📥 Load result:', loadResult);
      
    } else {
      console.log('❌ Poll creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  window.testPollCreation = testPollCreation;
  console.log('🔧 Test function available as window.testPollCreation()');
} else {
  testPollCreation();
}