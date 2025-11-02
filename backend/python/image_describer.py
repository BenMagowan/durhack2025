import os
import base64
import json
import re
import requests

# Configuration
DIRECTORY = "images"
JSON_PATH = "image_descriptions.json"
MODEL = "openai/gpt-4o"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
API_KEY = os.getenv("OPENROUTER_API_KEY")

def encode_image(image_path):
    with open(image_path, "rb") as img:
        return base64.b64encode(img.read()).decode("utf-8")

def describe_meme(image_path):
    image_b64 = encode_image(image_path)
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = (
        "You are a meme analyst. Given an image, describe it briefly in one sentence, "
        "then propose a fitting meme with top text and bottom text, and suggest a new descriptive filename. "
        "Respond ONLY in valid JSON with keys: description, top_text, bottom_text, filename. "
        "Do NOT include markdown, code fences, or any text outside JSON."
    )

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a concise meme description assistant that only outputs JSON."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": f"data:image/jpeg;base64,{image_b64}"}
            ]}
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    raw = response.json()
    content = raw["choices"][0]["message"]["content"].strip()

    # Try to extract JSON safely (removes any text outside {})
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if not match:
        raise ValueError(f"No valid JSON found in model response:\n{content}")

    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON decode error: {e}\nRaw content:\n{content}")

    print(f"\n✅ Parsed result for {os.path.basename(image_path)}:")
    print(json.dumps(data, indent=2))
    return data

def rename_image(old_path, new_filename):
    directory = os.path.dirname(old_path)
    ext = os.path.splitext(old_path)[1].lower()
    new_filename = new_filename.strip().replace(" ", "_")
    if not new_filename.endswith(ext):
        new_filename += ext
    new_path = os.path.join(directory, new_filename)

    # Prevent overwriting
    if os.path.exists(new_path):
        base, ext = os.path.splitext(new_path)
        counter = 1
        while os.path.exists(new_path):
            new_path = f"{base}_{counter}{ext}"
            counter += 1

    os.rename(old_path, new_path)
    return new_path

def main():
    if not API_KEY:
        raise ValueError("Missing OPENROUTER_API_KEY environment variable.")
    if not os.path.isdir(DIRECTORY):
        raise ValueError(f"Directory '{DIRECTORY}' not found.")

    for filename in os.listdir(DIRECTORY):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            filepath = os.path.join(DIRECTORY, filename)
            try:
                result = describe_meme(filepath)
                new_filename = result.get("filename")
                if new_filename:
                    new_path = rename_image(filepath, new_filename)
                    print(f"🖼️ Renamed to: {os.path.basename(new_path)}")
                else:
                    print(f"⚠️ No filename returned for {filename}")

                # write json to file
                json_output_path = os.path.join(DIRECTORY, JSON_PATH)
                if os.path.exists(json_output_path):
                    with open(json_output_path, "r") as jf:
                        all_data = json.load(jf)
                else:
                    all_data = []

                all_data.append(result)
                with open(json_output_path, "w") as jf:
                    json.dump(all_data, jf, indent=2)

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

if __name__ == "__main__":
    main()
