// app.js - Main logic for The Message Vault

// DOM elements
const messageForm = document.getElementById('messageForm');
const nameInput = document.getElementById('name');
const predefinedTraits = document.getElementById('predefinedTraits');
const customTraits = document.getElementById('customTraits');
const messageDisplay = document.getElementById('messageDisplay');
const shareOptions = document.getElementById('shareOptions');
const generateBtn = document.getElementById('generateBtn');
const vaultBtn = document.getElementById('vaultBtn');
const vaultSection = document.getElementById('vault-section');
const backBtn = document.getElementById('backBtn');
const messageFormSection = document.getElementById('message-form');
const generateAnotherBtn = document.getElementById('generateAnotherBtn');
const saveVaultBtn = document.getElementById('saveVaultBtn');

// Event listeners
messageForm.addEventListener('submit', handleSubmit);
generateBtn.addEventListener('click', showForm);
vaultBtn.addEventListener('click', showVault);
backBtn.addEventListener('click', showForm);
generateAnotherBtn.addEventListener('click', generateNewMessage);
saveVaultBtn.addEventListener('click', saveToVault);

// Show/hide sections
function showForm() {
    messageFormSection.classList.add('active');
    messageFormSection.classList.remove('hidden');
    vaultSection.classList.add('hidden');
    vaultSection.classList.remove('active');
}

function showVault() {
    messageFormSection.classList.add('hidden');
    messageFormSection.classList.remove('active');
    vaultSection.classList.add('active');
    vaultSection.classList.remove('hidden');
    displayVault(); // Call to vault.js
}

// Handle form submission to generate message
async function handleSubmit(event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    let traits = predefinedTraits.value.trim();
    if (customTraits.value.trim()) {
        traits = customTraits.value.trim(); // Use custom traits if provided
    }
    if (name) {
        try {
            const message = await generateMessage(name, traits); // Call to message-generator.js
            displayMessage(message);
            shareOptions.classList.remove('hidden');
        } catch (error) {
            alert('Error generating message: ' + error.message);
        }
    } else {
        alert('Please enter a name!');
    }
    messageForm.reset(); // Clear form
}

// Generate a new message without resubmitting the form
async function generateNewMessage() {
    const name = nameInput.value.trim();
    let traits = predefinedTraits.value.trim();
    if (customTraits.value.trim()) {
        traits = customTraits.value.trim();
    }
    if (name) {
        try {
            const message = await generateMessage(name, traits);
            displayMessage(message);
        } catch (error) {
            alert('Error generating new message: ' + error.message);
        }
    }
}

// Display message with animation
function displayMessage(message) {
    const messageElement = document.getElementById('generatedMessage');
    messageElement.textContent = message;
    messageDisplay.classList.remove('hidden');
    messageDisplay.classList.add('fade-in'); // Simple animation for engagement
    setTimeout(() => messageDisplay.classList.remove('fade-in'), 1000); // Remove animation after 1 second
}

// Security note: This is for local testing only. Do not push to GitHub with the API key hardcoded.
    
    // Initialize the app when DOM is loaded
    initApp();
});
