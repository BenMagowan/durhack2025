import os
import json
import sys
from dotenv import load_dotenv
import urllib.request

load_dotenv()

def pick_template(caption):
    api_key = os.getenv("OPENROUTER_API_KEY")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(BASE_DIR, "image_descriptions.json")

    with open(json_path) as f:
        templates = json.load(f)


    summaries = "\n".join([
        f"{name}: {info['description']}"
        for name, info in templates.items()
    ])

    prompt = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": (
                "You are a meme template selector. Given a caption and some meme templates, "
                "choose the most fitting one. Respond only in JSON like: "
                "{\"filename\": \"filename.jpg\", \"reason\": \"why\"}"
            )},
            {"role": "user", "content": (
                f"Caption: {caption}\n\nAvailable templates:\n{summaries}"
            )}
        ]
    }

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(prompt).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
    return data["choices"][0]["message"]["content"].strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_caption.py '<meme caption>'")
        sys.exit(1)
    caption = sys.argv[1]
    response = pick_template(caption)

    try:
        result = json.loads(response)
        print(json.dumps(result))
    except json.JSONDecodeError:
        print(f"Error parsing JSON response:\n{response}")