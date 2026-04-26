import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from PIL import Image
from io import BytesIO
from datetime import datetime

# Requirements: pip install requests beautifulsoup4 google-generativeai pillow

def get_yaseen_jummah_data():
    """
    Scrapes the Yaseen Foundation website to find the Jummah schedule image
    and extracts speaker data using Gemini AI.
    """
    url = "https://www.yaseen.org/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    print(f"Fetching {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Find the Jummah schedule image
        # Squarespace often uses data-src for images
        img_src = None
        images = soup.find_all('img')
        for img in images:
            src = img.get('data-src') or img.get('src')
            if src and 'YaseenFoundationJummah' in src:
                img_src = src
                break
        
        if not img_src:
            print("✗ Error: Could not find Jummah schedule image on the website.")
            return None
            
        print(f"✓ Found image URL: {img_src}")
        
        # 2. Extract data with Gemini AI
        api_key = os.environ.get("GEMINI_API_KEY")
            
        genai.configure(api_key=api_key)
        # Using 1.5-flash as it's optimized for OCR and fast
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Download the image
        print("Downloading image...")
        img_response = requests.get(img_src)
        img_response.raise_for_status()
        pil_img = Image.open(BytesIO(img_response.content))
        
        prompt = """
        This is an image of the Jummah (Friday prayer) schedule for Yaseen Foundation.
        Please extract the prayer times and speaker names for the following locations:
        
        1. Yaseen Belmont Masjid (YBM) -> Map to location: "YaseenBelmont"
        2. Yaseen Burlingame Center (TBC) -> Map to location: "YaseenBurlingame"
        
        The image contains a table with columns for 1st Jumu'ah and 2nd Jumu'ah times and speakers.
        
        Return ONLY a JSON list of objects in this format:
        [
            {
                "location": "YaseenBelmont",
                "prayers": [
                    {
                        "label": "1st Jumu'ah",
                        "time": "HH:MM AM/PM",
                        "speaker": "Name of Speaker"
                    },
                    {
                        "label": "2nd Jumu'ah",
                        "time": "HH:MM AM/PM",
                        "speaker": "Name of Speaker"
                    }
                ]
            },
            {
                "location": "YaseenBurlingame",
                "prayers": [
                    {
                        "label": "1st Jumu'ah",
                        "time": "HH:MM AM/PM",
                        "speaker": "Name of Speaker"
                    },
                    {
                        "label": "2nd Jumu'ah",
                        "time": "HH:MM AM/PM",
                        "speaker": "Name of Speaker"
                    }
                ]
            }
        ]
        
        Rules:
        - Return ONLY the raw JSON list. No markdown wrapping.
        - If a speaker is not listed, use null.
        - Ensure times are formatted as "HH:MM AM/PM" (e.g., "1:30 PM").
        - Capture the specific speakers for the upcoming Friday mentioned in the image.
        """
        
        print("Processing image with AI...")
        ai_response = model.generate_content([prompt, pil_img])
        
        result = ai_response.text.strip()
        # Clean up potential markdown wrapping
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
    data = get_yaseen_jummah_data()
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
                for new_item in data:
                    found = False
                    for i, existing_item in enumerate(full_data['data']):
                        if existing_item['location'] == new_item['location']:
                            full_data['data'][i] = new_item
                            found = True
                            break
                    if not found:
                        full_data['data'].append(new_item)
                
                # Update the scrape date
                full_data['date_scraped'] = str(datetime.now())
                
                with open(data_file, 'w') as f:
                    json.dump(full_data, f, indent=4)
                print(f"✓ Successfully updated Jummah speakers for Yaseen locations.")
            else:
                print("✗ Error: 'data' field not found in data.json structure.")
                
        except Exception as e:
            print(f"✗ Error saving to {data_file}: {e}")
            # Print data anyway so it's not lost
            print(json.dumps(data, indent=4))
    else:
        print("✗ Process failed.")

if __name__ == "__main__":
    main()
