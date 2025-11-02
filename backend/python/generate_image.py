# save as generate_nano_banana_image.py
import os
import re
import sys
import json
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

def generate_image(prompt, out_path):
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "google/gemini-2.5-flash-image",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "modalities": ["image", "text"],
            })
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise RuntimeError(f"Error generating image: {e}")

    # defensive parsing: find first base64 data URL in the response
    try:
        message = data["choices"][0]["message"]
        images = message.get("images", [])
        if not images:
            raise ValueError("No images returned; check model or prompt.")
        data_url = images[0]["image_url"]["url"]  # e.g. "data:image/png;base64,iVBORw0..."
    except Exception as e:
        raise RuntimeError(f"Unexpected response format: {e}\nFull response: {data}")

    # extract base64 payload and save
    m = re.match(r"data:(image/[^;]+);base64,(.*)", data_url, flags=re.DOTALL)
    if not m:
        raise ValueError("Image data URL not recognised.")
    b64 = m.group(2)
    image_bytes = base64.b64decode(b64)

    with open(out_path, "wb") as f:
        f.write(image_bytes)

    print(f"Saved image to {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_nano_banana_image.py '<image prompt>' <output file name>")
        sys.exit(1)

    prompt = sys.argv[1]
    out_file_name = sys.argv[2]

    out_path = os.path.join(os.path.dirname(__file__), "images", out_file_name)
    generate_image(prompt, out_path=out_path)
