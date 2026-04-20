import os
import requests
import json
from datetime import datetime
from google import genai

def get_data_with_ai(url, site_name):
    # Initialize the client
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        clean_url = url.strip("[]() ")
        response = requests.get(clean_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # We use a smaller chunk of HTML to be safe and fast
        html_content = response.text[:35000]
        
        prompt = f"""
        Extract the Friday/Jummah prayer times and speakers from this HTML for {site_name}.
        Return ONLY a valid JSON object.
        Format: {{ "location": "{site_name}", "prayers": [{{ "label": "", "time": "", "details": "" }}] }}
        """
        
        # FIX: Explicitly using the full model path 'models/gemini-1.5-flash'
        # and checking the generate method
        response = client.models.generate_content(
            model='gemini-1.5-flash', 
            contents=f"{prompt}\n\nHTML Content:\n{html_content}"
        )
        
        if not response.text:
            print(f"Gemini returned empty text for {site_name}")
            return None

        # Clean AI response from any markdown code blocks
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        return json.loads(text.strip())
        
    except Exception as e:
        print(f"Error processing {site_name}: {e}")
        return None

def main():
    sites = {
        "MCA_and_AlNoor": "https://www.mcabayarea.org/",
        "SBIA": "https://sbia.info"
    }
    
    final_results = {
        "date_scraped": str(datetime.now()),
        "data": []
    }

    for name, url in sites.items():
        print(f"Requesting AI parse for {name}...")
        site_data = get_data_with_ai(url, name)
        if site_data:
            final_results["data"].append(site_data)
        else:
            print(f"Skipping {name} due to empty or failed response.")

    with open('data.json', 'w') as f:
        json.dump(final_results, f, indent=4)
    print("Process Finished.")

if __name__ == "__main__":
    main()
