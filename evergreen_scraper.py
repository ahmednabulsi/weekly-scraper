import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from datetime import datetime

# Requirements: pip install requests beautifulsoup4 google-generativeai

def get_evergreen_data():
    """
    Scrapes the EIC San Jose (Evergreen) website for Jummah prayer times and speakers.
    Uses the Khutbah time as the Jummah time and Khateeb as the speaker.
    """
    url = "https://www.eicsanjose.org/wp/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    print(f"Fetching {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract the main content text to pass to the AI
        # We focus on the part likely to contain the Jummah schedule
        text_content = soup.get_text(separator=' ', strip=True)
        # Limiting to avoid context overflow, though 1.5-flash is huge
        text_content = text_content[:10000] 

        # Setup Gemini
        api_key = os.environ.get("GEMINI_API_KEY")

            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        
        prompt = f"""
        You are extracting Jummah prayer data for the "Evergreen" (EIC San Jose) location.
        
        Instructions:
        - Use the "Khutbah" time as the prayer time.
        - Use the "Khateeb" as the speaker.
        - Ignore the "Iqama" time.
        
        Website text content:
        {text_content}
        
        Return ONLY a JSON object in this exact format:
        {{
            "location": "Evergreen",
            "prayers": [
                {{
                    "label": "Jummah 1",
                    "time": "HH:MM AM/PM",
                    "speaker": "Speaker Name"
                }},
                {{
                    "label": "Jummah 2",
                    "time": "HH:MM AM/PM",
                    "speaker": "Speaker Name"
                }}
            ]
        }}
        
        Rules:
        - Return ONLY raw JSON.
        - If information is not found, use null for that field.
        - Ensure times are formatted correctly (e.g., 1:25 PM).
        """
        
        print("Processing with AI agent...")
        ai_response = model.generate_content(prompt)
        
        result = ai_response.text.strip()
        # Clean up markdown wrapping
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        result = result.strip()
        
        return json.loads(result)
        
    except Exception as e:
        print(f"✗ Error during processing: {e}")
        return None

def main():
    data = get_evergreen_data()
    if data:
        data_file = 'data.json'
        print(f"Merging data into {data_file}...")
        
        try:
            if os.path.exists(data_file):
                with open(data_file, 'r') as f:
                    full_data = json.load(f)
            else:
                full_data = {"date_scraped": str(datetime.now()), "data": []}
            
            # Update the existing list in the 'data' field
            if 'data' in full_data:
                found = False
                for i, existing_item in enumerate(full_data['data']):
                    if existing_item['location'] == data['location']:
                        full_data['data'][i] = data
                        found = True
                        break
                if not found:
                    full_data['data'].append(data)
                
                # Update the scrape date
                full_data['date_scraped'] = str(datetime.now())
                
                with open(data_file, 'w') as f:
                    json.dump(full_data, f, indent=4)
                print(f"✓ Successfully updated Jummah speakers for Evergreen.")
                print(json.dumps(data, indent=2))
            else:
                print("✗ Error: 'data' field not found in data.json.")
                
        except Exception as e:
            print(f"✗ Error saving to {data_file}: {e}")
    else:
        print("✗ Process failed.")

if __name__ == "__main__":
    main()
