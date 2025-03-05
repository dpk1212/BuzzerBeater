// Message generation functionality with Claude API integration
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
    
    // Loading state elements
    const generateBtn = document.getElementById('generate-btn');
    let originalBtnText = generateBtn.textContent;
    
    // Form submission event listener
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await generateMessage();
    });
    
    // Regenerate button event listener
    regenerateBtn.addEventListener('click', async function() {
        await generateMessage();
    });
    
    // Save button event listener
    saveBtn.addEventListener('click', function() {
        saveMessage(generatedMessage.textContent);
    });
    
    // Function to generate a message using Claude API
    async function generateMessage() {
        // Check if daily limit reached
        if (!canGenerateMessage()) {
            return;
        }
        
        const name = nameInput.value.trim();
        const traits = traitsInput.value.trim();
        const insecurities = insecuritiesInput.value.trim();
        
        if (!name) {
            alert('Please enter a name to generate a message.');
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        try {
            // Check if we have Claude API integration available
            if (typeof claudeAPI !== 'undefined') {
                // Use Claude API to generate message
                let message = await claudeAPI.generateMessage(name, traits, insecurities);
                
                // Display the message
                generatedMessage.textContent = message;
                messageDisplay.classList.remove('hidden');
                
                // Increment usage counter for today
                incrementMessageCounter();
                
                // Update limit notice and check limits for next generation
                updateLimitNotice();
                checkUsageLimits();
            } else {
                // Fallback to template-based generation if Claude API is not available
                generateTemplateMessage();
            }
        } catch (error) {
            console.error("Error generating message:", error);
            
            // If there's an API key error, prompt the user
            if (error.message && error.message.includes('API key')) {
                promptForApiKey();
            } else {
                // Otherwise fallback to template generation
                generateTemplateMessage();
            }
        } finally {
            // Hide loading state
            setLoading(false);
        }
    }
    
    // Prompt the user to enter their Claude API key
    function promptForApiKey() {
        const apiKey = prompt('Please enter your Claude API key to enable AI-powered message generation:');
        if (apiKey && apiKey.trim()) {
            claudeAPI.setApiKey(apiKey.trim());
            // Try generating again
            generateMessage();
        } else {
            // If no key provided, fall back to templates
            alert('No API key provided. Using template-based messages instead.');
            generateTemplateMessage();
        }
    }
    
    // Template-based message generation (original functionality)
    function generateTemplateMessage() {
        const name = nameInput.value.trim();
        const traits = traitsInput.value.trim();
        const insecurities = insecuritiesInput.value.trim();
        
        // Increment usage counter
        incrementMessageCounter();
        
        // Generate using existing templates
        let message = createPersonalizedMessage(name, traits, insecurities);
        
        // Display the message
        generatedMessage.textContent = message;
        messageDisplay.classList.remove('hidden');
        
        // Update limit notice and check limits
        updateLimitNotice();
        checkUsageLimits();
    }
    
    // Helper to set loading state
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.textContent = "Generating...";
            generateBtn.disabled = true;
            
            if (regenerateBtn) {
                regenerateBtn.textContent = "Generating...";
                regenerateBtn.disabled = true;
            }
        } else {
            generateBtn.textContent = originalBtnText;
            generateBtn.disabled = false;
            
            if (regenerateBtn) {
                regenerateBtn.textContent = "Generate Another";
                regenerateBtn.disabled = false;
            }
        }
    }
    
    // The rest of your existing functions (createPersonalizedMessage, canGenerateMessage, etc.) remain unchanged
    // ...
});
