import sys
import json
from prompt_security_checker import PromptSecurityChecker

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    
    try:
        checker = PromptSecurityChecker()
        result = checker.check_prompt(prompt)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "is_safe": False, "score": 0.0}))
        sys.exit(1)

if __name__ == "__main__":
    main()