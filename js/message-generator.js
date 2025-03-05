// message-generator.js - Handles message generation using Anthropic Claude API

// Hardcoded Claude API key for testing (DO NOT USE IN PRODUCTION OR PUSH TO GITHUB)
// Replace 'YOUR_CLAUDE_API_KEY' with your actual API key from console.anthropic.com/settings/api-keys
const CLAUDE_API_KEY = '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';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Function to generate a positive message using Claude API
export async function generateMessage(name, traits) {
    // Construct the prompt based on input
    let prompt = `You are a positive, encouraging assistant. Generate a short, uplifting message for ${name}`;
    if (traits) {
        if (traits.includes('insecure')) {
            prompt += `, addressing their insecurity: ${traits}. Keep it sensitive, natural, and max 50 words.`;
        } else {
            prompt += `, highlighting their traits: ${traits}. Keep it natural, positive, and max 50 words.`;
        }
    } else {
        prompt += `. Keep it natural, positive, and max 50 words.`;
    }

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': CLAUDE_API_KEY, // Use x-api-key for Anthropic API
                'anthropic-version': '2023-06-01', // Use the latest API version as of March 2025
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022', // Use the latest Claude model as of March 2025; adjust if needed
                max_tokens: 50, // Limit to 50 tokens (roughly 50 words)
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }

        const data = await response.json();
        // Extract the generated text (assuming it's in data.content[0].text)
        let generatedText = data.content[0]?.text || '';
        if (!generatedText) {
            throw new Error('No text generated');
        }

        // Clean up the response (remove prompt and keep only the message)
        generatedText = generatedText.replace(prompt, '').trim();
        // Ensure the message starts with the name and is concise
        return `${name}, ${generatedText.split('.')[0]}.`; // Take first sentence for simplicity
    } catch (error) {
        console.error('Error generating message:', error);
        throw error;
    }
}

// Warning: Hardcoding the API key is for local testing only. For production, use a backend (e.g., Flask) to securely handle API calls.
// See Anthropic's documentation for setup: https://docs.anthropic.com/claude/reference/messages_post
