// Run this in your browser console (F12) to recover queries
// Copy and paste this entire script into the console

(function() {
    console.log('🔍 Checking localStorage for saved data...');
    
    // Check for queries
    const savedQueries = localStorage.getItem('metraQueries');
    const savedSubscribers = localStorage.getItem('metraSubscribers');
    const savedAnalytics = localStorage.getItem('metraAnalytics');
    
    if (savedQueries) {
        const queries = JSON.parse(savedQueries);
        console.log('✅ Found Queries:', queries.length);
        console.table(queries);
    } else {
        console.log('❌ No queries found in localStorage');
    }
    
    if (savedSubscribers) {
        const subscribers = JSON.parse(savedSubscribers);
        console.log('✅ Found Subscribers:', subscribers.length);
        console.table(subscribers);
    } else {
        console.log('❌ No subscribers found in localStorage');
    }
    
    if (savedAnalytics) {
        const analytics = JSON.parse(savedAnalytics);
        console.log('✅ Found Analytics:', analytics);
    } else {
        console.log('❌ No analytics found in localStorage');
    }
    
    // Show all localStorage keys
    console.log('\n📦 All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`  - ${key}`);
    }
})();
