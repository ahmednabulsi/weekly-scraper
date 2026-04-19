import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_prayer_times():
    url = "https://www.mcabayarea.org/"
    # User-Agent makes the request look like it's coming from a browser
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    results = {
        "date_scraped": str(datetime.now()),
        "locations": {}
    }

    # List of location IDs to look for in the HTML
    locations = {
        "MCA": "loc_mca",
        "Al-Noor": "loc_alnoor"
    }

    for loc_name, div_id in locations.items():
        loc_div = soup.find('div', id=div_id)
        if not loc_div:
            continue
            
        jummah_data = []
        # Find all rows labeled as 'prayer-jummah'
        rows = loc_div.find_all('tr', class_='prayer-jummah')
        
        for row in rows:
            name = row.find('td', class_='prayer-name').get_text(strip=True)
            time_td = row.find('td', class_='prayer-time')
            
            # get_text(separator="|") helps separate the time from the speaker text
            time_text = time_td.get_text(" ", strip=True)
            
            jummah_data.append({
                "label": name,
                "details": time_text
            })
            
        results["locations"][loc_name] = jummah_data

    # Save to JSON file
    with open('data.json', 'w') as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    scrape_prayer_times()
