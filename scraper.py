import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_prayer_times():
    url = "https://www.mcabayarea.org/"
    # A more complete Header makes the site think you are a real Chrome browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching site: {e}")
        return

    results = {
        "date_scraped": str(datetime.now()),
        "locations": {
            "MCA": [],
            "Al-Noor": []
        }
    }

    # Find all Jummah rows on the entire page
    all_jummah_rows = soup.find_all('tr', class_='prayer-jummah')
    
    for row in all_jummah_rows:
        name_td = row.find('td', class_='prayer-name')
        time_td = row.find('td', class_='prayer-time')
        
        if name_td and time_td:
            label = name_td.get_text(strip=True) # e.g., "Jummah 1"
            details = time_td.get_text(" ", strip=True) # e.g., "12:15 PM Sh. Samy..."
            
            # Logic: MCA Jummahs usually come first in the HTML, 
            # Al-Noor Jummahs come later. 
            # If we already found 2 for MCA, the rest are likely Al-Noor.
            if len(results["locations"]["MCA"]) < 2:
                results["locations"]["MCA"].append({"label": label, "details": details})
            else:
                results["locations"]["Al-Noor"].append({"label": label, "details": details})

    # Fallback: If classes failed, search for text "Jummah" in all tables
    if not results["locations"]["MCA"]:
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                if "Jummah" in row.get_text():
                    text_data = row.get_text(" | ", strip=True)
                    if len(results["locations"]["MCA"]) < 2:
                        results["locations"]["MCA"].append(text_data)
                    else:
                        results["locations"]["Al-Noor"].append(text_data)

    with open('data.json', 'w') as f:
        json.dump(results, f, indent=4)
    
    print(f"Successfully scraped {len(results['locations']['MCA']) + len(results['locations']['Al-Noor'])} entries.")

if __name__ == "__main__":
    scrape_prayer_times()
