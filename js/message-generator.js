// Message generation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form and display elements
    const messageForm = document.getElementById('message-form');
    const nameInput = document.getElementById('name');
    const traitsInput = document.getElementById('traits');
    const insecuritiesInput = document.getElementById('insecurities');
    const messageDisplay = document.getElementById('message-display');
    const generatedMessage = document.getElementById('generated-message');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // Templates for message generation (for the client-side version)
    const messageTemplates = [
        "NAME, your KIND heart creates ripples of joy wherever you go!",
        "NAME, embracing your passion for TRAIT makes you truly inspirational!",
        "The world is brighter because of your unique perspective, NAME!",
        "NAME, your journey of growth with INSECURITY is a beautiful testament to your strength!",
        "Every challenge you overcome with INSECURITY only highlights your incredible resilience, NAME!",
        "NAME, your TRAIT brings so much value to those around you!",
        "The way you handle INSECURITY showcases your amazing inner strength, NAME!",
        "NAME, never forget that your kindness creates magic in others' lives!",
        "Your passion for TRAIT is contagious and inspires everyone around you, NAME!",
        "NAME, the way you approach INSECURITY with grace is truly admirable!",
        "Your journey with INSECURITY is transforming you into an even more beautiful soul, NAME!",
        "NAME, your light shines so brightly that it illuminates paths for others!",
        "The universe celebrates when you embrace your authentic self, NAME!",
        "NAME, your TRAIT is a superpower that makes this world better!",
        "When you work through INSECURITY, you become a beacon of hope for others, NAME!"
    ];
    
    // Trait-specific message templates
    const traitSpecificTemplates = {
        "hiking": [
            "NAME, your adventurous spirit on the trails inspires everyone around you!",
            "The way you embrace nature through hiking shows your beautiful connection to the world, NAME!",
            "NAME, each step you take on your hiking journeys represents your incredible determination!"
        ],
        "creative": [
            "NAME, your creativity paints this world with colors others can't even imagine!",
            "The way your creative mind works is truly a gift to this world, NAME!",
            "NAME, your creative spirit brings innovation and beauty wherever you go!"
        ],
        "cooking": [
            "NAME, the love you put into your cooking nourishes both body and soul!",
            "Your culinary creativity makes everyday moments special, NAME!",
            "NAME, the way you express care through cooking is a beautiful gift!"
        ],
        "reading": [
            "NAME, your love for reading shows your beautiful curious mind!",
            "The worlds you explore through reading enrich your unique perspective, NAME!",
            "NAME, your passion for books reflects your wonderful depth and wisdom!"
        ],
        "music": [
            "NAME, the rhythm of your heart beats in harmony with the music you love!",
            "Your connection to music reveals your sensitive and beautiful soul, NAME!",
            "NAME, the way music moves through you creates magic for everyone around you!"
        ]
    };
    
    // Insecurity-specific message templates
    const insecuritySpecificTemplates = {
        "public speaking": [
            "NAME, your voice deserves to be heard - your thoughts are valuable!",
            "Each time you speak up, you inspire others with your courage, NAME!",
            "NAME, the world needs your unique voice and perspective!"
        ],
        "appearance": [
            "NAME, your beauty radiates from within and touches everyone you meet!",
            "Your unique appearance is perfectly you - and that's what makes you beautiful, NAME!",
            "NAME, true beauty is found in your kind heart and authentic spirit!"
        ],
        "confidence": [
            "NAME, the strength within you is greater than any doubts you face!",
            "Your journey to confidence is inspiring others more than you know, NAME!",
            "NAME, each step you take with courage builds the confidence you already possess!"
        ],
        "failure": [
            "NAME, every perceived failure is actually a stepping stone to your success!",
            "Your resilience through challenges reveals your incredible strength, NAME!",
            "NAME, the lessons you learn through setbacks are shaping your beautiful future!"
        ],
        "rejection": [
            "NAME, every 'no' leads you closer to the perfect 'yes' that awaits you!",
            "Your worth is never determined by others' decisions or opinions, NAME!",
            "NAME, each rejection redirects you to a path more aligned with your true purpose!"
        ]
    };
    
    // Form submission event listener
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateMessage();
    });
    
    // Regenerate button event listener
    regenerateBtn.addEventListener('click', function() {
        generateMessage();
    });
    
    // Save button event listener
    saveBtn.addEventListener('click', function() {
        saveMessage(generatedMessage.textContent);
    });
    
    // Function to generate a message
    function generateMessage() {
        // Check if daily limit reached
        if (!canGenerateMessage()) {
            return;
        }
        
        const name = nameInput.value.trim();
        const traits = traitsInput.value.trim().toLowerCase();
        const insecurities = insecuritiesInput.value.trim().toLowerCase();
        
        if (!name) {
            alert('Please enter a name to generate a message.');
            return;
        }
        
        // Increment usage counter for today
        incrementMessageCounter();
        
        // Generate message
        let message = createPersonalizedMessage(name, traits, insecurities);
        
        // Display the message
        generatedMessage.textContent = message;
        messageDisplay.classList.remove('hidden');
        
        // Update limit notice and check limits for next generation
        updateLimitNotice();
        checkUsageLimits();
    }
    
    // Function to create a personalized message based on inputs
    function createPersonalizedMessage(name, traits, insecurities) {
        // Process traits into an array
        const traitList = traits ? traits.split(',').map(t => t.trim()) : [];
        
        // Process insecurities into an array
        const insecurityList = insecurities ? insecurities.split(',').map(i => i.trim()) : [];
        
        let message = '';
        let usedSpecificTemplate = false;
        
        // Try to use trait-specific templates if available
        if (traitList.length > 0) {
            for (const trait of traitList) {
                // Look for specific templates for this trait
                for (const specificTrait in traitSpecificTemplates) {
                    if (trait.includes(specificTrait)) {
                        const templates = traitSpecificTemplates[specificTrait];
                        message = templates[Math.floor(Math.random() * templates.length)];
                        usedSpecificTemplate = true;
                        break;
                    }
                }
                if (usedSpecificTemplate) break;
            }
        }
        
        // Try to use insecurity-specific templates if available and we haven't used a trait template
        if (!usedSpecificTemplate && insecurityList.length > 0) {
            for (const insecurity of insecurityList) {
                // Look for specific templates for this insecurity
                for (const specificInsecurity in insecuritySpecificTemplates) {
                    if (insecurity.includes(specificInsecurity)) {
                        const templates = insecuritySpecificTemplates[specificInsecurity];
                        message = templates[Math.floor(Math.random() * templates.length)];
                        usedSpecificTemplate = true;
                        break;
                    }
                }
                if (usedSpecificTemplate) break;
            }
        }
        
        // If no specific template was used, use a generic template
        if (!usedSpecificTemplate) {
            message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        }
        
        // Replace placeholders with actual values
        message = message.replace(/NAME/g, name);
        
        // Replace TRAIT with a random trait if traits were provided
        if (message.includes('TRAIT') && traitList.length > 0) {
            const randomTrait = traitList[Math.floor(Math.random() * traitList.length)];
            message = message.replace(/TRAIT/g, randomTrait);
        } else if (message.includes('TRAIT')) {
            // If no traits were provided but the template includes TRAIT, replace with a generic positive trait
            const genericTraits = ['kindness', 'authenticity', 'strength', 'wisdom', 'compassion'];
            const randomGenericTrait = genericTraits[Math.floor(Math.random() * genericTraits.length)];
            message = message.replace(/TRAIT/g, randomGenericTrait);
        }
        
        // Replace INSECURITY with a random insecurity if insecurities were provided
        if (message.includes('INSECURITY') && insecurityList.length > 0) {
            const randomInsecurity = insecurityList[Math.floor(Math.random() * insecurityList.length)];
            message = message.replace(/INSECURITY/g, randomInsecurity);
        } else if (message.includes('INSECURITY')) {
            // If the template includes INSECURITY but none were provided, replace with a generic challenge
            const genericChallenges = ['challenges', 'growth moments', 'learning experiences'];
            const randomGenericChallenge = genericChallenges[Math.floor(Math.random() * genericChallenges.length)];
            message = message.replace(/INSECURITY/g, randomGenericChallenge);
        }
        
        return message;
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
    
    // Function to update limit notice (defined here for reference, implemented in app.js)
    function updateLimitNotice() {
        // This function is implemented in app.js
        // We check if it exists and call it if it does
        if (window.updateLimitNotice) {
            window.updateLimitNotice();
        }
    }
    
    // Function to check usage limits (defined here for reference, implemented in app.js)
    function checkUsageLimits() {
        // This function is implemented in app.js
        // We check if it exists and call it if it does
        if (window.checkUsageLimits) {
            window.checkUsageLimits();
        }
    }
});
