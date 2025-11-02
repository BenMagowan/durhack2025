import sys
import json
import os
import urllib.request

def pick_image(user_prompt):
    """
    Uses OpenRouter LLM to select the single most fitting dinosaur image
    based on the prompt and the image metadata from dino_analysis.json.
    
    Args:
        user_prompt: User's meme description
        
    Returns:
        dict with image_path, filename, match_score, reasoning
    """
    # Load OpenRouter API key
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "dino_analysis.json")
    
    # Load your JSON analysis file
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"dino_analysis.json not found at: {json_path}")
    
    with open(json_path, "r", encoding="utf-8") as f:
        image_data = json.load(f)
    
    if not image_data:
        raise Exception("No images found in dino_analysis.json")
    
    # Create the context prompt
    system_prompt = {
        "role": "system",
        "content": (
            "You are a dinosaur image selector. You are given descriptions, emotions, "
            "and scenes for many dinosaur images. Based on the user's meme idea, "
            "choose ONLY the single most relevant image file path. "
            "Respond with JSON: {\"image_path\": \"path/to/image.jpg\", \"reasoning\": \"why this matches\"}"
        )
    }
    
    # Convert image metadata to a readable string
    image_summaries = "\n".join([
        f"{path}: "
        f"{v.get('description', 'No description provided')} | "
        f"emotions: {', '.join(v.get('emotions', [])) or 'none'} | "
        f"scene: {v.get('scene', 'unknown scene')}"
        for path, v in image_data.items()
    ])
    
    user_message = {
        "role": "user",
        "content": (
            f"The user wants a dinosaur meme about: '{user_prompt}'.\n\n"
            f"Available images:\n{image_summaries}\n\n"
            "Return JSON with the most suitable image file path and reasoning."
        )
    }
    
    # Send to OpenRouter API
    data = {
        "model": "anthropic/claude-3.5-haiku",
        "messages": [system_prompt, user_message],
        "temperature": 0.3,
    }
    
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json_data,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode('utf-8'))
    
    # Extract result
    content = result["choices"][0]["message"]["content"].strip()
    
    # Parse JSON response
    if content.startswith('```'):
        content = content.split('```')[1]
        if content.startswith('json'):
            content = content[4:]
        content = content.strip()
    
    llm_result = json.loads(content)
    best_image_path = llm_result.get("image_path", "")
    reasoning = llm_result.get("reasoning", "Selected by LLM")
    
    # Get filename from path
    filename = os.path.basename(best_image_path)
    
    # Return in expected format
    return {
        "image_path": best_image_path,
        "filename": filename,
        "match_score": 0.85,  # You can add scoring logic if needed
        "reasoning": reasoning,
        "analysis": image_data.get(best_image_path, {})
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    
    try:
        result = pick_image(prompt)
        print(json.dumps(result))
    except FileNotFoundError as e:
        print(json.dumps({
            "error": f"File not found: {str(e)}",
            "hint": "Make sure dino_analysis.json exists in the same directory"
        }), file=sys.stderr)
        sys.exit(1)
    except KeyError as e:
        print(json.dumps({
            "error": f"Missing key in JSON: {str(e)}",
            "hint": "Check dino_analysis.json format"
        }), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        import traceback
        print(json.dumps({
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()