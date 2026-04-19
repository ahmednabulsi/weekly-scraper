import os
import requests
import json
from datetime import datetime

# You'll need to add 'google-generativeai' to your requirements
import google.generativeai as genai

# Setup Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

def get_data_with_ai(url, site_name):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers, timeout=15)
        html_content = response.text[:30000] # Send first 30k chars to stay in limit
        
        prompt = f"""
        Act as a data extractor. I will provide HTML from {site_name}. 
        Extract the Friday/Jummah prayer times and speakers. 
        Return ONLY a JSON object with this format:
        {{ "location": "{site_name}", "prayers": [{{ "label": "", "time": "", "details": "" }}] }}
        
        HTML:
        {html_content}
        """
        
        ai_response = model.generate_content(prompt)
        # Clean the response in case Gemini adds ```json markdown
        clean_json = ai_response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"Error processing {site_name}: {e}")
        return None

def main():
    sites = {
        "MCA_and_AlNoor": "[https://www.mcabayarea.org/](https://www.mcabayarea.org/)",
        "SBIA": "[https://sbia.info](https://sbia.info)"
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

if __name__ == "__main__":
    main()
