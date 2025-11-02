import os
import json
import random
import re
import textwrap
import time
from PIL import Image, ImageDraw, ImageFont
from rapidfuzz import fuzz
from openai import OpenAI
from requests.exceptions import RequestException


from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read the key
api_key = os.getenv("OPENAI_API_KEY")

api_key = "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"
# --- Load OpenAI API key from environment ---
# Make sure you have set OPENAI_API_KEY in your system or .env file
client = OpenAI(api_key=api_key)

# --- Load templates metadata ---
with open("templates.json", "r") as f:
    TEMPLATES = json.load(f)

# --- TEMPLATE SELECTION ---
def choose_best_template(prompt):
    prompt_words = set(re.findall(r"\w+", prompt.lower()))
    best_template = None
    best_score = 0

    for template in TEMPLATES:
        tags = set(tag.lower() for tag in template.get("tags", []))
        tag_text = " ".join(tags)
        score = fuzz.token_set_ratio(" ".join(prompt_words), tag_text)

        if score > best_score:
            best_score = score
            best_template = template

    if not best_template:
        best_template = random.choice(TEMPLATES)

    print(f"Selected template: {best_template['name']} (score={best_score:.2f})")
    return best_template

# --- CAPTION GENERATION USING CHAT API ---
def generate_caption_simple(prompt, max_retries=2, retry_delay=1.0):
    """
    Generate a single short meme caption using OpenAI Chat API.
    """
    system_prompt = "You are a meme caption generator. Produce a short, funny caption."

    for attempt in range(max_retries + 1):
        try:
            resp = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=40  # short caption
            )

            text = resp.choices[0].message.content.strip()
            if text:
                return text
            if attempt < max_retries:
                time.sleep(retry_delay)

        except Exception as e:
            print(f"⚠️ Error generating caption: {e}")
            if attempt < max_retries:
                time.sleep(retry_delay)
                continue

    # Fallback if API fails
    return "Funny meme goes here!"



# --- DRAW TEXT ON IMAGE ---
def draw_multiline_text(draw, text, font, start_y, img_width):
    lines = textwrap.wrap(text, width=20)
    y = start_y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font, stroke_width=2)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = (img_width - w) / 2
        draw.text((x, y), line, font=font, fill="white", stroke_width=2, stroke_fill="black")
        y += h
    return y

# --- MAIN MEME GENERATOR ---
def generate_meme_from_prompt(prompt, output_path="generated_meme.png"):
    # Generate a single caption
    caption = generate_caption_simple(prompt)
    print(f"🧠 Caption generated:\n{caption}")

    # Choose a template
    template = choose_best_template(prompt)
    img = Image.open(template["file"]).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Set font
    font_size = max(24, img.width // 15)
    try:
        font = ImageFont.truetype("Impact.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    # Center the text vertically
    bbox = draw.textbbox((0, 0), caption, font=font, stroke_width=2)
    text_height = bbox[3] - bbox[1]
    start_y = (img.height - text_height) // 2

    # Draw the caption
    draw_multiline_text(draw, caption.upper(), font, start_y=start_y, img_width=img.width)

    # Save and show
    img.save(output_path)
    img.show()
    print(f"✅ Meme generated: {output_path} (template: {template['name']})")
    return output_path

# --- MAIN ---
if __name__ == "__main__":
    user_prompt = input("Describe your meme (e.g. 'create a meme about cats and dogs'): ")
    generate_meme_from_prompt(user_prompt)
