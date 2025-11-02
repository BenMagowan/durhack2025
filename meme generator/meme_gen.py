import json
import random
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import textwrap
import os

# Load templates metadata
with open("templates.json", "r") as f:
    TEMPLATES = json.load(f)

def choose_random_template():
    return random.choice(TEMPLATES)

def draw_multiline_text(draw, text, font, max_width, start_y, img_width):
    """
    Draw text (wrapped) centered horizontally, starting at y = start_y.
    Returns last y coordinate used.
    """
    lines = textwrap.wrap(text, width=20)  # adjust wrap width as needed
    y = start_y
    for line in lines:
        w, h = draw.textsize(line, font=font)
        x = (img_width - w) / 2
        # Draw outline (stroke) then fill
        draw.text((x, y), line, font=font, fill="white", stroke_width=2, stroke_fill="black")
        y += h
    return y

def generate_meme(prompt: str, output_path: str = "generated_meme.png"):
    # Choose a template
    template = choose_random_template()
    img = Image.open(template["file"]).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Dynamically choose font size based on image width
    # You might need to tweak divisor
    font_size = max(24, img.width // 15)
    font = ImageFont.truetype("Impact.ttf", font_size)

    # Split prompt into top & bottom text (if comma present)
    parts = prompt.split(",", 1)
    top_text = parts[0].strip()
    bottom_text = parts[1].strip() if len(parts) > 1 else ""

    # Draw top text
    draw_multiline_text(draw, top_text, font, img.width, start_y=10, img_width=img.width)

    # Draw bottom text
    # We want bottom text closer to bottom, so compute where to start
    # Estimate height of bottom text block
    bottom_block = textwrap.wrap(bottom_text.upper(), width=20)
    # approximate height = number_of_lines * font height
    approx_height = len(bottom_block) * font.getsize("A")[1]
    start_y = img.height - approx_height - 10
    draw_multiline_text(draw, bottom_text, font, img.width, start_y=start_y, img_width=img.width)

    # Save output
    img.save(output_path)
    print(f"Meme generated: {output_path} (template: {template['name']})")

    return output_path

if __name__ == "__main__":
    user_prompt = input("Enter prompt (you can do “top, bottom” style): ")
    generate_meme(user_prompt)
