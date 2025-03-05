// Message generation functionality
document.addEventListener('DOMContentLoaded', function() {
    // This file is now primarily for supporting the main app.js functionality
    // Most message generation is handled in app.js with Claude API integration
    
    // We'll keep some utility functions here for backward compatibility
    
    // Function to check if user can generate a message (based on daily limit)
    function canGenerateMessage() {
        const today = new Date().toDateString();
        const usageData = JSON.parse(localStorage.getItem('messageVaultUsage')) || {};
        const todayCount = usageData[today] || 0;
        
        // Free tier limit is 3 messages per day
        return todayCount < 3;
    }
    
    // Function to increment message counter
    function incrementMessageCounter() {
        const today = new Date().toDateString();
        const usageData = JSON.parse(localStorage.getItem('messageVaultUsage')) || {};
        
        // Initialize or increment today's count
        usageData[today] = (usageData[today] || 0) + 1;
        
        // Save updated usage data
        localStorage.setItem('messageVaultUsage', JSON.stringify(usageData));
    }
    
    // Make these functions available to the global scope for app.js to use
    window.canGenerateMessage = canGenerateMessage;
    window.incrementMessageCounter = incrementMessageCounter;
});
