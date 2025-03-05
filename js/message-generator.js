// message-generator.js - Handles message generation using Google Cloud Function

// Function to generate a positive message via the Google Cloud Function
export async function generateMessage(name, traits) {
    // Construct the prompt data
    let promptData = { name, traits };

    try {
        const response = await fetch('https://us-central1-message-vault-452811.cloudfunctions.net/generateMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(promptData)
        });

        if (!response.ok) {
            throw new Error('Cloud Function request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data.message || 'Error generating message';
    } catch (error) {
        console.error('Error generating message:', error);
        throw error;
    }
}

// Note: This approach keeps your API key secure in the cloud and avoids exposing it in JavaScript.
// Replace 'your-project-id' with your actual Google Cloud project ID from the console.
// For production, ensure the function is secured (e.g., require authentication for API calls).
}

// Warning: Hardcoding the API key is for local testing only. For production, use a backend (e.g., Flask) to securely handle API calls.
// See Anthropic's documentation for setup: https://docs.anthropic.com/claude/reference/messages_post
