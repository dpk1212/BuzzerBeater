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
    const generateBtn = document.getElementById('generate-btn');
    
    // Track original button text for loading states
    const originalGenerateText = generateBtn.textContent;
    const originalRegenerateText = regenerateBtn ? regenerateBtn.textContent : 'Generate Another';
    
    // Share buttons
    const emailShare = document.getElementById('email-share');
    const twitterShare = document.getElementById('twitter-share');
    const facebookShare = document.getElementById('facebook-share');
    
    // Digital Ocean API endpoint for Claude integration
    const CLAUDE_API_ENDPOINT = 'https://sample-flask-occ49.ondigitalocean.app/'; // Replace with your actual endpoint
    
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
    
    // Message form submission - use Claude API
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await generateMessage();
    });
    
    // Regenerate button event
    regenerateBtn.addEventListener('click', async function() {
        await generateMessage();
    });
    
    // Function to generate message with Claude API
    async function generateMessage() {
        // Check if daily limit reached
        if (!canGenerateMessage()) {
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const traits = document.getElementById('traits').value.trim();
        const insecurities = document.getElementById('insecurities').value.trim();
        
        if (!name) {
            alert('Please enter a name to generate a message.');
            return;
        }
        
        // Set loading state
        setLoading(true);
        
        try {
            // Attempt to use Claude API via Digital Ocean proxy
            const message = await generateMessageWithClaude(name, traits, insecurities);
            
            // Display the message
            generatedMessage.textContent = message;
            messageDisplay.classList.remove('hidden');
            
            // Increment usage counter
            incrementMessageCounter();
            
            // Update limit notice and check limits
            updateLimitNotice();
            checkUsageLimits();
            
        } catch (error) {
            console.error("Error generating message with Claude:", error);
            
            // Fall back to template-based generation
            const fallbackMessage = createFallbackMessage(name, traits, insecurities);
            generatedMessage.textContent = fallbackMessage;
            messageDisplay.classList.remove('hidden');
            
            // Increment usage counter
            incrementMessageCounter();
            
            // Update limit notice and check limits
            updateLimitNotice();
            checkUsageLimits();
        } finally {
            // Reset loading state
            setLoading(false);
        }
    }
    
    // Function to handle loading state
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.textContent = "Generating...";
            generateBtn.disabled = true;
            
            if (regenerateBtn) {
                regenerateBtn.textContent = "Generating...";
                regenerateBtn.disabled = true;
            }
        } else {
            generateBtn.textContent = originalGenerateText;
            generateBtn.disabled = false;
            
            if (regenerateBtn) {
                regenerateBtn.textContent = originalRegenerateText;
                regenerateBtn.disabled = false;
            }
        }
    }

    // 🏆 Header Shrinking Effect on Scroll
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('header').classList.add('scrolled');
    } else {
        document.querySelector('header').classList.remove('scrolled');
    }
});

// 🌀 Smooth Section Transitions
document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll("section");

    sections.forEach(section => {
        if (!section.classList.contains("active-section")) {
            section.classList.add("hidden-section");
        }
    });

    function showSection(section) {
        sections.forEach(s => s.classList.add("hidden-section"));
        section.classList.remove("hidden-section");
        section.classList.add("active-section");
    }

    document.getElementById("nav-home").addEventListener("click", function() {
        showSection(document.getElementById("home-section"));
    });

    document.getElementById("nav-vault").addEventListener("click", function() {
        showSection(document.getElementById("vault-section"));
    });

    document.getElementById("nav-premium").addEventListener("click", function() {
        showSection(document.getElementById("premium-section"));
    });
});

    
    // Function to generate message with Claude API via Digital Ocean
    async function generateMessageWithClaude(name, traits, insecurities) {
        // Construct an effective prompt for Claude
        let prompt = `Please generate a positive, uplifting message for ${name}.`;
        
        if (traits && traits.length > 0) {
            prompt += ` They have these traits or interests: ${traits}.`;
        }
        
        if (insecurities && insecurities.length > 0) {
            prompt += ` They sometimes feel insecure about: ${insecurities}. Please address this sensitively and positively.`;
        }
        
        prompt += `\n\nThe message should be personal, encouraging, and no longer than three sentences. Focus on strengths, growth, and positive affirmation. Make it sound natural, warm, and sincere - like it's coming from a supportive friend. Address ${name} directly in the message.`;
        
        // Call your Digital Ocean API endpoint
        const response = await fetch(CLAUDE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 300,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle the response based on your Digital Ocean API's response format
        // This may need adjustment based on how your proxy returns Claude's responses
        if (data.message) {
            return data.message.trim();
        } else if (data.completion) {
            return data.completion.trim();
        } else if (data.content) {
            return data.content.trim();
        } else {
            throw new Error("Unexpected API response format");
        }
    }
    
    // Fallback message generator (template-based)
    function createFallbackMessage(name, traits, insecurities) {
        // Templates for message generation (for the fallback version)
        const messageTemplates = [
            `${name}, your kindness creates ripples of joy wherever you go!`,
            `${name}, embracing your authentic self makes you truly inspirational!`,
            `The world is brighter because of your unique perspective, ${name}!`,
            `${name}, your journey of growth is a beautiful testament to your strength!`,
            `Every challenge you overcome only highlights your incredible resilience, ${name}!`,
            `${name}, your presence brings so much value to those around you!`,
            `The way you handle challenges showcases your amazing inner strength, ${name}!`,
            `${name}, never forget that your kindness creates magic in others' lives!`,
            `Your passion is contagious and inspires everyone around you, ${name}!`,
            `${name}, the way you approach life with grace is truly admirable!`,
            `Your journey is transforming you into an even more beautiful soul, ${name}!`,
            `${name}, your light shines so brightly that it illuminates paths for others!`,
            `The universe celebrates when you embrace your authentic self, ${name}!`,
            `${name}, your unique qualities are a superpower that makes this world better!`,
            `When you believe in yourself, you become a beacon of hope for others, ${name}!`
        ];
        
        // Trait-specific templates
        let traitTemplates = [];
        if (traits) {
            const traitList = traits.split(',').map(t => t.trim());
            traitList.forEach(trait => {
                traitTemplates.push(
                    `${name}, your passion for ${trait} reveals the beautiful depth of your character!`,
                    `The way you embrace ${trait} shows your authentic and inspiring nature, ${name}!`,
                    `${name}, your dedication to ${trait} creates ripples of positive influence around you!`
                );
            });
        }
        
        // Insecurity-addressing templates
        let insecurityTemplates = [];
        if (insecurities) {
            const insecurityList = insecurities.split(',').map(i => i.trim());
            insecurityList.forEach(insecurity => {
                insecurityTemplates.push(
                    `${name}, your journey with ${insecurity} is actually strengthening your already remarkable spirit!`,
                    `The way you navigate ${insecurity} showcases your incredible resilience and growth, ${name}!`,
                    `${name}, remember that your worth isn't defined by ${insecurity} - your beautiful heart is what truly matters!`
                );
            });
        }
        
        // Combine all relevant templates
        const allTemplates = [
            ...messageTemplates,
            ...traitTemplates,
            ...insecurityTemplates
        ];
        
        // Return a random template
        return allTemplates[Math.floor(Math.random() * allTemplates.length)];
    }
    
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
    
    // Initialize the app
    function initApp() {
        // Show home section by default
        showSection(homeSection);
        
        // Initialize message counter
        initMessageCounter();
        
        // Check and display usage limits
        checkUsageLimits();
    }
    
    // Initialize the app when DOM is loaded
    initApp();
});
