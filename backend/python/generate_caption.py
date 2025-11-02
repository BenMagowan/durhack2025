import os
import sys
import json
import requests
from requests.exceptions import RequestException
from dotenv import load_dotenv

# Load .env file
load_dotenv()


# --- CAPTION GENERATION USING CHAT API ---
def generate_caption(prompt):
    """
    Generate a single short meme caption using OpenRouter API.
    """
    system_prompt = """
    You are a meme caption generator.

    Given a user's description of an image, you must produce a short, funny caption suitable for a meme.

    Return your output only as a valid JSON object with the following format:
    {
    "top_text": "Top Text",
    "bottom_text": "Bottom Text"
    }

    Rules:
    - Do not include explanations or extra text outside the JSON.
    - Keep each caption under 50 characters.
    - Be creative and humorous, but avoid offensive or NSFW content.
    - If the description already suggests text, integrate it naturally.
    """

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            },
            data=json.dumps({
                "model": "openai/gpt-4o-mini", # Optional
                "temperature": 0.3,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except RequestException as e:
        print(f"Error generating caption: {e}")

# --- MAIN ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_caption.py '<image description>'")
        sys.exit(1)

    user_prompt = sys.argv[1]
    caption = generate_caption(user_prompt)
    
    # Ensure we output valid JSON
    try:
        # If the response is already JSON, parse and re-serialize it
        json_caption = json.loads(caption)
        print(json.dumps(json_caption))
    except json.JSONDecodeError:
        # If not JSON, create a default format
        fallback = {
            "top_text": "DINOSAUR TIME",
            "bottom_text": "RAWR!"
        }
        print(json.dumps(fallback))
