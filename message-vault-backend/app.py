from flask import Flask, request, jsonify, render_template
import requests
import os
from datetime import datetime
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Hugging Face API settings
HF_API_URL = "https://api-inference.huggingface.co/models/gpt2"
HF_API_TOKEN = os.environ.get("HF_API_TOKEN", "")  # Set this in your environment variables

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_message():
    data = request.json
    name = data.get('name', '')
    traits = data.get('traits', '')
    insecurities = data.get('insecurities', '')
    
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    # Construct prompt for Hugging Face API
    prompt = f"Generate a positive, encouraging message for {name}"
    if traits:
        prompt += f", who loves {traits}"
    if insecurities:
        prompt += f", and feels insecure about {insecurities}"
    
    # Call Hugging Face API
    try:
        response = requests.post(
            HF_API_URL,
            headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
            json={"inputs": prompt, "parameters": {"max_length": 100, "temperature": 0.7}}
        )
        
        if response.status_code == 200:
            # Parse and clean the generated text
            generated_text = response.json()[0]["generated_text"]
            # Extract just the relevant part (you may need to adjust this based on actual outputs)
            message = clean_message(generated_text, name, traits, insecurities)
            return jsonify({"message": message})
        else:
            # Fallback to pre-defined templates if API fails
            message = generate_fallback_message(name, traits, insecurities)
            return jsonify({"message": message, "note": "Generated using fallback templates"})
    
    except Exception as e:
        # Log the error and use fallback
        print(f"Error calling Hugging Face API: {str(e)}")
        message = generate_fallback_message(name, traits, insecurities)
        return jsonify({"message": message, "note": "Generated using fallback templates"})

def clean_message(generated_text, name, traits, insecurities):
    """Clean and format the message from the API response"""
    # This is a placeholder - you'll need to adjust based on actual API responses
    # For now, just return a simple formatted message
    return f"{name}, you are amazing just the way you are!"

def generate_fallback_message(name, traits, insecurities):
    """Generate a message from templates when API fails"""
    # This would contain similar logic to what's in your JavaScript version
    templates = [
        f"{name}, your kindness makes the world brighter!",
        f"{name}, your unique perspective brings value to everyone around you!",
        f"{name}, your resilience in facing challenges is truly inspiring!"
    ]
    
    # Use traits if provided
    if traits:
        trait_templates = [
            f"{name}, your passion for {traits} is truly admirable!",
            f"The way you embrace {traits} shows your beautiful authentic self, {name}!",
            f"{name}, your dedication to {traits} inspires everyone around you!"
        ]
        templates.extend(trait_templates)
    
    # Address insecurities if provided
    if insecurities:
        insecurity_templates = [
            f"{name}, your journey with {insecurities} is transforming you into an even more beautiful soul!",
            f"Every step you take in addressing {insecurities} showcases your incredible strength, {name}!",
            f"{name}, the courage you show in facing {insecurities} is truly inspiring!"
        ]
        templates.extend(insecurity_templates)
    
    # Return a random template
    import random
    return random.choice(templates)

@app.route('/api/premium/check', methods=['POST'])
def check_premium():
    """Check if a user has premium status (placeholder)"""
    data = request.json
    user_id = data.get('userId', '')
    
    # This is a placeholder - in a real app, you'd check against a database
    # For now, just return a mock response
    return jsonify({
        "isPremium": False,
        "message": "This is a placeholder for premium status checking"
    })

if __name__ == '__main__':
    app.run(debug=True)
