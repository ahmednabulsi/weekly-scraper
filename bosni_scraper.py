import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import time

# Requirements: pip install requests beautifulsoup4 google-generativeai pillow

def get_bosni_data():
    """
    Scrapes the ICBAB (Bosni) website to find the monthly prayer schedule image
    and extracts the data using Gemini AI.
    """
    base_url = "https://icbab.org/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    print(f"Fetching {base_url}...")
    try:
        response = requests.get(base_url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Look for the image in block-206 as requested
        # This section contains the monthly vaktija image
        section = soup.find('section', id='block-206')
        img_src = None
        
        if section:
            img = section.find('img')
            img_src = img.get('src') if img else None
            
        if not img_src:
            # Fallback: search for any image that looks like a monthly schedule
            print("Warning: section 'block-206' not found, searching for relevant images...")
            images = soup.find_all('img')
            for img in images:
                src = img.get('src', '')
                # Monthly images often contain the month name and year (e.g., April2026)
                if 'wp-content/uploads' in src and ('.png' in src or '.jpg' in src):
                    # Heuristic: looking for images that aren't logos or social icons
                    if not any(x in src.lower() for x in ['logo', 'facebook', 'icon']):
                        img_src = src
                        break
            
        if not img_src:
            print("✗ Error: Could not find prayer schedule image on the website.")
            return None
            
        print(f"✓ Found image URL: {img_src}")
        
        # 2. Extract data with Gemini AI
        # Using GEMINI_API_KEY as found in your scraper.py
        if "GEMINI_API_KEY" not in os.environ:
            print("✗ Error: GEMINI_API_KEY environment variable not set.")
            return None
            
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Download the image
        print("Downloading image...")
        img_response = requests.get(img_src)
        img_response.raise_for_status()
        pil_img = Image.open(BytesIO(img_response.content))
        
        prompt = """
        This image is a monthly prayer schedule (vaktija) for a mosque.
        Please extract the month name and the full table of prayer times.
        
        Return ONLY a JSON object in this exact format:
        {
            "MonthName": {
                "1": {
                    "fajr_azaan": "HH:MM AM/PM",
                    "fajr_iqamah": "HH:MM AM/PM",
                    "sunrise": "HH:MM AM/PM",
                    "dhuhr_azaan": "HH:MM AM/PM",
                    "dhuhr_iqamah": "HH:MM AM/PM",
                    "asr_azaan": "HH:MM AM/PM",
                    "asr_iqamah": "HH:MM AM/PM",
                    "maghrib_azaan": "HH:MM AM/PM",
                    "maghrib_iqamah": "HH:MM AM/PM",
                    "isha_azaan": "HH:MM AM/PM",
                    "isha_iqamah": "HH:MM AM/PM"
                },
                ... (repeat for all days in the image)
            }
        }
        
        Important: 
        1. Use the actual English month name found in the image (e.g., "April").
        2. Ensure all times include AM/PM.
        3. Capture every day shown in the table.
        4. Return ONLY the raw JSON object. No markdown, no "```json", no explanation.
        """
        
        print("Processing image with AI agent...")
        ai_response = model.generate_content([prompt, pil_img])
        
        result = ai_response.text.strip()
        # Clean up potential markdown wrapping
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        result = result.strip()
        
        # Parse to ensure it's valid JSON
        data = json.loads(result)
        print(f"✓ Successfully extracted data for month: {list(data.keys())[0]}")
        return data
        
    except Exception as e:
        print(f"✗ Error during processing: {e}")
        return None

def main():
    data = get_bosni_data()
    if data:
        output_file = 'bosni.json'
        
        # 1. Load existing data if file exists
        if os.path.exists(output_file):
            try:
                with open(output_file, 'r') as f:
                    full_data = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load existing {output_file}, starting fresh. Error: {e}")
                full_data = {}
        else:
            full_data = {}
            
        # 2. Get the month key from the scraped data
        # data is expected to be { "MonthName": { ...days... } }
        if not data:
            print("✗ Error: Scraped data is empty.")
            return

        scraped_month = list(data.keys())[0]
        print(f"Merging data for {scraped_month} into {output_file}...")
        
        # 3. Update only the scraped month
        full_data[scraped_month] = data[scraped_month]
        
        # 4. Save the full updated data back to the file
        with open(output_file, 'w') as f:
            json.dump(full_data, f, indent=4)
            
        print(f"✓ Successfully updated {scraped_month} in {output_file}")
    else:
        print("✗ Process failed.")

if __name__ == "__main__":
    main()
