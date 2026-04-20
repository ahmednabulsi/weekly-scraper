import os
import requests
import json
import time
from datetime import datetime
from groq import Groq


def get_data_with_ai(url, site_name, section_id=None, retries=3):
    client = Groq(api_key=os.environ["GEMINI_API_KEY"])
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    for attempt in range(retries):
        try:
            clean_url = url.strip("[]() ")
            response = requests.get(clean_url, headers=headers, timeout=15)
            response.raise_for_status()

            # Increased chunk size and strip scripts/styles to get more useful text
            html = response.text

            # If a section id is provided, extract only that section
            if section_id:
                import re
                match = re.search(rf'<div id="{section_id}">(.*?)</div>\s*</div>', html, flags=re.DOTALL)
                if match:
                    html = match.group(0)
                else:
                    print(f"Warning: section '{section_id}' not found, using full page")

            # Remove script and style tags to reduce noise
            import re
            html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
            html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
            # Remove script and style tags to reduce noise
            html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
            html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
            # Remove HTML comments
            html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)  # <-- add this line
            # Strip all HTML tags to get plain text
            text_only = re.sub(r'<[^>]+>', ' ', html)

            # Strip all HTML tags to get plain text
            text_only = re.sub(r'<[^>]+>', ' ', html)
            # Collapse whitespace
            text_only = re.sub(r'\s+', ' ', text_only).strip()
            # Take more content now that it's clean text (much smaller than raw HTML)
            text_only = text_only[:8000]

            prompt = f"""
            You are extracting Friday/Jummah prayer schedule data from the website of {site_name}.

            Look for:
            - Jummah/Friday prayer times (there may be multiple prayers at different times)
            - Khateeb or speaker names for each prayer
            - Any labels like "1st Jummah", "2nd Jummah", etc.
            If a field is not found, use null instead of empty string or guessing.

            Return ONLY a valid JSON object in this exact format:
            {{
                "location": "{site_name}",
                "prayers": [
                    {{
                        "label": "1st Jummah",
                        "time": "12:30 PM",
                        "speaker": "Sheikh Ahmed"
                    }}
                ]
            }}

            Website text content:
            {text_only}
            """

            ai_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Upgraded to smarter model
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data extraction assistant. You return only valid JSON, nothing else. No markdown, no code blocks, no explanation. If information is not found, use null for that field."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0  # Make output deterministic
            )

            result = ai_response.choices[0].message.content.strip()

            # Clean up any markdown code blocks just in case
            if result.startswith("```"):
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
            result = result.strip()

            return json.loads(result)

        except json.JSONDecodeError as e:
            print(f"JSON parse error for {site_name}: {e}")
            print(f"Raw response: {result}")
            return None
        except Exception as e:
            if '429' in str(e) and attempt < retries - 1:
                wait = 30 * (attempt + 1)
                print(f"Rate limited on {site_name}. Retrying in {wait}s... (attempt {attempt + 1}/{retries})")
                time.sleep(wait)
            else:
                print(f"Error processing {site_name}: {e}")
                return None


def main():
    sites = {
        "MCA": ("https://www.mcabayarea.org/", "loc_mca"),
        "AlNoor": ("https://www.mcabayarea.org/", "loc_alnoor"),
        "SBIA": ("https://sbia.info", None),
        "WVMuslim": ("https://wvmuslim.org/prayer/", None)
    }

    final_results = {
        "date_scraped": str(datetime.now()),
        "data": []
    }

    for i, (name, (url, section_id)) in enumerate(sites.items()):
        print(f"Requesting AI parse for {name}...")
        site_data = get_data_with_ai(url, name, section_id=section_id)
        if site_data:
            final_results["data"].append(site_data)
            print(f"Successfully scraped {name}.")
        else:
            print(f"Skipping {name} due to empty or failed response.")

        if i < len(sites) - 1:
            print("Waiting 5 seconds before next request...")
            time.sleep(5)

    with open('data.json', 'w') as f:
        json.dump(final_results, f, indent=4)

    print("Process Finished.")
    print(json.dumps(final_results, indent=4))


if __name__ == "__main__":
    main()
