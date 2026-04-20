import os
import requests
import json
from datetime import datetime
from google import genai

def get_data_with_ai(url, site_name):
    # Setup Gemini Client inside the function
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        # Ensure URL is a clean string with no brackets
        clean_url = url.strip("[]() ")
        response = requests.get(clean_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # We take the first 40k characters to ensure we get the prayer table
        html_content = response.text[:40000]
        
        prompt = f"""
        Extract the Friday/Jummah prayer times and speakers from this HTML for {site_name}.
        Include 'Jummah 1', 'Jummah 2', etc.
        Return ONLY a valid JSON object.
        Format: {{ "location": "{site_name}", "prayers": [{{ "label": "", "time": "", "details": "" }}] }}
        """
        
        # Using the new 2026 SDK method
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[prompt, html_content]
        )
        
        # Clean AI response
        text = response.text
        clean_json = text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
        
    except Exception as e:
        print(f"Error processing {site_name}: {e}")
        return None

def main():
    # CLEAN URLS - No brackets or parentheses!
    sites = {
        "MCA_and_AlNoor": "https://www.mcabayarea.org/",
        "SBIA": "https://sbia.info"
    }
    
    final_results = {
        "date_scraped": str(datetime.now()),
        "data": []
    }

    for name, url in sites.items():
        print(f"Asking Gemini to parse {name}...")
        site_data = get_data_with_ai(url, name)
        if site_data:
            final_results["data"].append(site_data)

    with open('data.json', 'w') as f:
        json.dump(final_results, f, indent=4)
    print("Done!")

if __name__ == "__main__":
    main()
