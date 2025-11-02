import os
import json
from rapidfuzz import fuzz
import requests
from requests.exceptions import RequestException
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

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

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            data=json.dumps({
                "model": "openai/gpt-4o-mini", # Optional
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
    user_prompt = input("Describe your meme (e.g. 'create a meme about cats and dogs'): ")
    caption = generate_caption(user_prompt)

    print(f"Generated Caption: {caption}")
