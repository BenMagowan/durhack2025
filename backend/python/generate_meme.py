import sys
import json
from dinosaur_scraper import DinosaurMemeGenerator

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    
    try:
        generator = DinosaurMemeGenerator()
        
        # Find best matching image
        match_result = generator.find_best_match(prompt)
        
        # Generate meme text
        text_result = generator.generate_meme_text(prompt, match_result['analysis'])
        
        # Combine results
        result = {
            'image_path': match_result['image_path'],
            'filename': match_result['filename'],
            'top_text': text_result.get('top_text', ''),
            'bottom_text': text_result.get('bottom_text', ''),
            'match_score': match_result['match_score'],
            'reasoning': match_result['reasoning']
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()