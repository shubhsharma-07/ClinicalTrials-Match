const { apiClient } = require('./lib/api.ts');

async function testAPI() {
  try {
    console.log('Testing API client...');
    
    // Test getAllTrials
    console.log('Testing getAllTrials...');
    const allTrials = await apiClient.getAllTrials();
    console.log('All trials count:', allTrials.length);
    
    // Test searchTrials with location filter
    console.log('Testing searchTrials with location filter...');
    const searchResults = await apiClient.searchTrials({ location: 'NY' });
    console.log('Search results count:', searchResults.trials.length);
    console.log('Total available:', searchResults.total);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
