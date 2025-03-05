class ClaudeAPIHandler {
    constructor(apiKey = null, endpoint = null) {
        this.endpoint = endpoint || "https://sample-flask-occ49.ondigitalocean.app/claude-api"; // Use your DigitalOcean app URL
    }

    async generateMessage(name, traits = "", insecurities = "") {
        let prompt = this.constructPrompt(name, traits, insecurities);

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-3-opus-20240229",
                    max_tokens: 300,
                    temperature: 0.7,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.content && data.content[0] && data.content[0].text
                ? data.content[0].text.trim()
                : "I couldn't generate a message at this time. Please try again.";
        } catch (error) {
            console.error("Error calling Claude API:", error);
            return this.getFallbackMessage(name, traits, insecurities);
        }
    }

    constructPrompt(name, traits, insecurities) {
        let prompt = `Please generate a positive, uplifting message for ${name}.`;

        if (traits) {
            prompt += ` They have these traits or interests: ${traits}.`;
        }

        if (insecurities) {
            prompt += ` They sometimes feel insecure about: ${insecurities}. Please address this sensitively and positively.`;
        }

        prompt += `\n\nThe message should be personal, encouraging, and no longer than two or three sentences.`;
        return prompt;
    }

    getFallbackMessage(name, traits, insecurities) {
        const templates = [
            `${name}, your unique spirit brings light to everyone around you!`,
            `The world is more beautiful because you're in it, ${name}!`,
            `${name}, each day you grow stronger and more magnificent in your journey.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
}

// Create a global instance for use throughout the app
const claudeAPI = new ClaudeAPIHandler();
