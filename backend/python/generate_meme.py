from PIL import Image, ImageDraw, ImageFont
import json
import sys
import os

def generate_meme(image_path, top_text, bottom_text):
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Create a drawing object
        draw = ImageDraw.Draw(img)
        
        # Calculate font size based on image width
        font_size = int(img.width / 15)
        try:
            font = ImageFont.truetype("Arial", font_size)
        except:
            # Fallback to default font if Arial is not available
            font = ImageFont.load_default()
        
        # Function to draw text with outline
        def draw_text_with_outline(text, y_position):
            # Get text size
            text_width = draw.textlength(text, font=font)
            x = (img.width - text_width) / 2
            
            # Draw outline (black)
            outline_color = "black"
            for offset_x in [-2, 2]:
                for offset_y in [-2, 2]:
                    draw.text((x + offset_x, y_position + offset_y), text, font=font, fill=outline_color)
            
            # Draw main text (white)
            draw.text((x, y_position), text, font=font, fill="white")
        
        # Draw top text
        if top_text:
            draw_text_with_outline(top_text, 10)
        
        # Draw bottom text
        if bottom_text:
            text_height = font_size
            draw_text_with_outline(bottom_text, img.height - text_height - 10)
        
        # Save the image to /memes directory
        output_dir = os.path.join(os.path.dirname(__file__), "memes")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        filename = os.path.basename(image_path)
        output_path = os.path.join(output_dir, filename.replace(".jpg", "_meme.jpg"))
        img.save(output_path)
        
        return {
            "success": True,
            "output_path": output_path
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Missing arguments"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    top_text = sys.argv[2]
    bottom_text = sys.argv[3]
    
    result = generate_meme(image_path, top_text, bottom_text)
    print(json.dumps(result))
