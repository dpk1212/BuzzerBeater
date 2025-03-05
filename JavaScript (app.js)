// Main app functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navHome = document.getElementById('nav-home');
    const navVault = document.getElementById('nav-vault');
    const navPremium = document.getElementById('nav-premium');
    const homeSection = document.getElementById('home-section');
    const vaultSection = document.getElementById('vault-section');
    const premiumSection = document.getElementById('premium-section');
    
    // Modal elements
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const upgradeLinks = document.querySelectorAll('.upgrade-link, #upgrade-link');
    
    // Message generation form
    const messageForm = document.getElementById('message-form');
    const messageDisplay = document.getElementById('message-display');
    const generatedMessage = document.getElementById('generated-message');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const saveBtn = document.getElementById('save-btn');
    const copyBtn = document.getElementById('copy-btn');
    const shareBtn = document.getElementById('share-btn');
    const shareOptions = document.querySelector('.share-options');
    const limitNotice = document.getElementById('limit-notice');
    
    // Share buttons
    const emailShare = document.getElementById('email-share');
    const twitterShare = document.getElementById('twitter-share');
    const facebookShare = document.getElementById('facebook-share');
    
    // Navigation functions
    function showSection(section) {
        // Hide all sections
        homeSection.classList.remove('active-section');
        homeSection.classList.add('hidden-section');
        vaultSection.classList.remove('active-section');
        vaultSection.classList.add('hidden-section');
        premiumSection.classList.remove('active-section');
        premiumSection.classList.add('hidden-section');
        
        // Show selected section
        section.classList.remove('hidden-section');
        section.classList.add('active-section');
        
        // Update navigation active state
        navHome.classList.remove('active');
        navVault.classList.remove('active');
        navPremium.classList.remove('active');
        
        if (section === homeSection) {
            navHome.classList.add('active');
        } else if (section === vaultSection) {
            navVault.classList.add('active');
            refreshVault(); // Refresh vault display when viewing
        } else if (section === premiumSection) {
            navPremium.classList.add('active');
        }
    }
    
    // Navigation event listeners
    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(homeSection);
    });
    
    navVault.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(vaultSection);
    });
    
    navPremium.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(premiumSection);
    });
    
    // Modal event listeners
    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        privacyModal.classList.remove('hidden');
    });
    
    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        termsModal.classList.remove('hidden');
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            privacyModal.classList.add('hidden');
            termsModal.classList.add('hidden');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === privacyModal) {
            privacyModal.classList.add('hidden');
        }
        if (e.target === termsModal) {
            termsModal.classList.add('hidden');
        }
    });
    
    // Premium upgrade links
    upgradeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(premiumSection);
        });
    });
    
    // Share dropdown
    shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        shareOptions.classList.toggle('hidden');
    });
    
    // Close share dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!shareBtn.contains(e.target) && !shareOptions.contains(e.target)) {
            shareOptions.classList.add('hidden');
        }
    });
    
    // Share buttons functionality
    emailShare.addEventListener('click', function(e) {
        e.preventDefault();
        const message = generatedMessage.textContent;
        const mailtoLink = `mailto:?subject=A Positive Message For You&body=${encodeURIComponent(message)}`;
        window.open(mailtoLink);
    });
    
    twitterShare.addEventListener('click', function(e) {
        e.preventDefault();
        const message = generatedMessage.textContent;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&hashtags=positivity,messagevault`;
        window.open(twitterUrl, '_blank');
    });
    
    facebookShare.addEventListener('click', function(e) {
        e.preventDefault();
        // Note: Facebook sharing is more complex due to their API requirements
        // This is a simplified version that opens the share dialog
        const url = encodeURIComponent(window.location.href);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(facebookUrl, '_blank');
    });
    
    // Copy button functionality
    copyBtn.addEventListener('click', function() {
        const message = generatedMessage.textContent;
        navigator.clipboard.writeText(message).then(() => {
            // Visual feedback for copy
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    });
    
    // Initialize the app
    function initApp() {
        // Show home section by default
        showSection(homeSection);
        
        // Initialize message counter
        initMessageCounter();
        
        // Check and display usage limits
        checkUsageLimits();
    }
    
    // Function to initialize message counter
    function initMessageCounter() {
        // Check if we already have a count for today
        const today = new Date().toDateString();
        const usageData = JSON.parse(localStorage.getItem('messageVaultUsage')) || {};
        
        if (!usageData[today]) {
            usageData[today] = 0;
            localStorage.setItem('messageVaultUsage', JSON.stringify(usageData));
        }
        
        // Update the limit notice
        updateLimitNotice();
    }
    
    // Function to update limit notice based on usage
    function updateLimitNotice() {
        const today = new Date().toDateString();
        const usageData = JSON.parse(localStorage.getItem('messageVaultUsage')) || {};
        const todayCount = usageData[today] || 0;
        
        // Show/hide limit notice based on usage
        if (todayCount >= 3) {
            limitNotice.innerHTML = `
                <p>You've reached your daily limit of 3 messages. 
                <a href="#" id="upgrade-link">Upgrade to Premium</a> for unlimited messages!</p>
            `;
            limitNotice.classList.remove('hidden');
            
            // Re-attach event listener to the new upgrade link
            document.getElementById('upgrade-link').addEventListener('click', function(e) {
                e.preventDefault();
                showSection(premiumSection);
            });
        } else {
            limitNotice.innerHTML = `
                <p>Free users can generate up to 3 messages per day. You've used ${todayCount}/3 today.
                <a href="#" id="upgrade-link">Upgrade to Premium</a> for unlimited messages!</p>
            `;
            
            // Re-attach event listener to the new upgrade link
            document.getElementById('upgrade-link').addEventListener('click', function(e) {
                e.preventDefault();
                showSection(premiumSection);
            });
        }
    }
    
    // Function to check if user has reached daily limits
    function checkUsageLimits() {
        const today = new Date().toDateString();
        const usageData = JSON.parse(localStorage.getItem('messageVaultUsage')) || {};
        const todayCount = usageData[today] || 0;
        
        // Disable the generate button if limit reached
        const generateBtn = document.getElementById('generate-btn');
        if (todayCount >= 3) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Daily Limit Reached';
            generateBtn.style.backgroundColor = '#aaa';
        } else {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Message';
            generateBtn.style.backgroundColor = '#f39c12';
        }
    }
    
    // Initialize the app when DOM is loaded
    initApp();
});
