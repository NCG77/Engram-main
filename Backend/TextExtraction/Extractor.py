import sys
import json
import os
from dotenv import load_dotenv
from groq import Groq

# 1. Load API key from .env
def check_api():
    load_dotenv()
    api_key = os.getenv("API") or os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Error: API key not found.", file=sys.stderr)
        sys.exit(1)
    return api_key

# 2. Read diary texts from stdin or file
def load_entries():
    try:
        if len(sys.argv) > 1:
            # Read from provided JSON file with encoding and error handling.
            with open(sys.argv[1], 'r', encoding="utf-8", errors="replace") as f:
                data = json.load(f)
        else:
            # Read JSON array from stdin with error handling.
            data = json.load(sys.stdin)
        
        # Join all entries and sanitize the text for any encoding issues.
        text = "\n\n".join(item.get("text", "") for item in data)
        text = text.encode("utf-8", errors="replace").decode("utf-8")
        
        # Debug log of text passed, using UTF-8 safe output.
        print("📄 Text sent to Groq:\n", text, file=sys.stderr)
        return text
    except Exception as e:
        print(f"Error loading diary entries: {e}", file=sys.stderr)
        sys.exit(1)

# 3. Call Groq API to extract personality traits
def extract(api_key, text):
    client = Groq(api_key=api_key)
    system_prompt = """
You are an AI that extracts personality traits from a person's diary entries. These entries span multiple events and should be understood as a whole. Use all available information from the full text to build an accurate picture of their personality and relationships.

Strict rules:
1. Do not invent any characters, names, or details. Use only what is present in the text.
2. In the "Relations" section, preserve actual names mentioned.
3. Your output MUST be pure JSON following this exact schema. Do NOT output any code, code blocks, explanations, or commentary — only the JSON object. If the text includes coding questions or code snippets, ignore them and focus only on personality extraction.

Respond only in this JSON format:
{
  "Openness": { "Description": "..." },
  "Conscientiousness": { "Description": "..." },
  "Extraversion": { "Description": "..." },
  "Agreeableness": { "Description": "..." },
  "Neuroticism": { "Description": "..." },
  "Relations": { "Description": "..." },
  "Other": { "Description": "..." }
}
"""
    try:
        resp = client.chat.completions.create(
            model="mistral-saba-24b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.7
        )
        content = resp.choices[0].message.content
        clean = content.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        print(f"API extraction error: {e}", file=sys.stderr)
        return None

# 4. Merge with previous aura if exists
def open_prev():
    try:
        with open('./database/temp_user_aura.json', 'r', encoding="utf-8", errors="replace") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"Error reading temp_user_aura.json: {e}", file=sys.stderr)
        return {}

def merge_data(prev, new):
    if not prev:
        return new or {}
    merged = {}
    for key in ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism", "Relations", "Other"]:
        if new and key in new:
            merged[key] = new[key]
        elif key in prev:
            merged[key] = prev[key]
    return merged

# 5. Main entrypoint
def main():
    api_key = check_api()
    text = load_entries()
    prev = open_prev()
    new = extract(api_key, text)
    merged = merge_data(prev, new)
    print(json.dumps(merged, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()