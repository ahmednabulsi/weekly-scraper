import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def get_soup(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_mca(soup, results):
    # Search for all Jummah rows on the MCA page
    all_jummah_rows = soup.find_all('tr', class_='prayer-jummah')
    for row in all_jummah_rows:
        name_td = row.find('td', class_='prayer-name')
        time_td = row.find('td', class_='prayer-time')
        if name_td and time_td:
            label = name_td.get_text(strip=True)
            details = time_td.get_text(" ", strip=True)
            # Simple logic to split MCA vs Al-Noor based on order
            if len(results["locations"]["MCA"]) < 2:
                results["locations"]["MCA"].append({"label": label, "details": details})
            else:
                results["locations"]["Al-Noor"].append({"label": label, "details": details})

def scrape_sbia(soup, results):
    # SBIA uses a table with the class 'prayer_table'
    table = soup.find('table', class_='prayer_table')
    if not table:
        return

    # Look for the specific cell that contains "Jumu'ah"
    cells = table.find_all('td')
    for cell in cells:
        header = cell.find('h5')
        if header and "jumu" in header.get_text(strip=True).lower():
            label = header.get_text(strip=True)
            time = cell.find('h4').get_text(strip=True) if cell.find('h4') else ""
            footer = cell.find('footer').get_text(" ", strip=True) if cell.find('footer') else ""
            
            results["locations"]["SBIA"].append({
                "label": label,
                "time": time,
                "details": footer
            })

def main():
    results = {
        "date_scraped": str(datetime.now()),
        "locations": {
            "MCA": [],
            "Al-Noor": [],
            "SBIA": []
        }
    }

    # Scrape MCA/Al-Noor
    mca_soup = get_soup("https://www.mcabayarea.org/")
    if mca_soup:
        scrape_mca(mca_soup, results)

    # Scrape SBIA
    sbia_soup = get_soup("https://sbia.info")
    if sbia_soup:
        scrape_sbia(sbia_soup, results)

    # Save to file
    with open('data.json', 'w') as f:
        json.dump(results, f, indent=4)
    print("Scrape complete. Data saved to data.json")

if __name__ == "__main__":
    main()
