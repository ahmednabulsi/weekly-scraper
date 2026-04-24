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

            # Get current date info for context
            from datetime import datetime, timedelta
            today = datetime.now()
            # Find next Friday (weekday 4 = Friday)
            days_until_friday = (4 - today.weekday()) % 7
            if days_until_friday == 0 and today.hour > 14:  # If it's Friday afternoon, get next Friday
                days_until_friday = 7
            next_friday = today + timedelta(days=days_until_friday)
            
            prompt = f"""
            You are extracting Friday/Jummah prayer schedule data from the website of {site_name}.
            
            IMPORTANT: Focus ONLY on the upcoming Friday ({next_friday.strftime('%B %d, %Y')}).
            Ignore any data from past weeks or future weeks beyond the next Friday.

            Look for:
            - Jummah/Friday prayer times for the upcoming Friday ONLY
            - Khateeb or speaker names for each prayer
            - Any labels like "1st Jummah", "2nd Jummah", etc.
            
            CONSOLIDATION RULES:
            - If you find multiple entries with the same time, merge them into one entry
            - If you find a time without a speaker and a speaker with the same time, combine them
            - If there are multiple speakers for the same time, create separate entries
            - Use "1st Jummah", "2nd Jummah" etc. as labels if not explicitly provided
            
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

            try:
                parsed_result = json.loads(result)
                print(f"✓ Successfully parsed JSON for {site_name}")
                return parsed_result
            except json.JSONDecodeError as json_error:
                print(f"✗ JSON parse error for {site_name}: {json_error}")
                print(f"Raw AI response: {result[:500]}...")
                if attempt < retries - 1:
                    print(f"Retrying... (attempt {attempt + 1}/{retries})")
                    continue
                return None

        except json.JSONDecodeError as e:
            print(f"JSON parse error for {site_name}: {e}")
            print(f"Raw response: {result}")
            return None
        except Exception as e:
            if '429' in str(e) and attempt < retries - 1:
                wait = 30 * (attempt + 1)
                print(f"Rate limited on {site_name}. Retrying in {wait}s... (attempt {attempt + 1}/{retries})")
                time.sleep(wait)
            elif 'api_key' in str(e).lower():
                print(f"✗ API Key error for {site_name}: {e}")
                print("Please check your Groq API key is valid")
                return None
            else:
                print(f"✗ Error processing {site_name}: {e}")
                if attempt < retries - 1:
                    print(f"Retrying... (attempt {attempt + 1}/{retries})")
                    time.sleep(5)
                else:
                    return None
    
    print(f"✗ All {retries} attempts failed for {site_name}")
    return None


def consolidate_prayer_data(prayer_data):
    """
    Post-process prayer data to consolidate entries with same times
    and fill in missing labels
    """
    if not prayer_data or 'prayers' not in prayer_data:
        return prayer_data
    
    prayers = prayer_data['prayers']
    if not prayers:
        return prayer_data
    
    # Group prayers by time
    time_groups = {}
    for prayer in prayers:
        time = prayer.get('time')
        if time:
            if time not in time_groups:
                time_groups[time] = []
            time_groups[time].append(prayer)
    
    # Consolidate each time group
    consolidated_prayers = []
    for time, group in time_groups.items():
        if len(group) == 1:
            # Single entry, just ensure it has a label
            prayer = group[0]
            if not prayer.get('label'):
                prayer['label'] = f"{len(consolidated_prayers) + 1}{'st' if len(consolidated_prayers) == 0 else 'nd' if len(consolidated_prayers) == 1 else 'rd' if len(consolidated_prayers) == 2 else 'th'} Jummah"
            consolidated_prayers.append(prayer)
        else:
            # Multiple entries for same time - try to merge
            speakers = []
            labels = []
            
            for prayer in group:
                if prayer.get('speaker') and prayer['speaker'] not in speakers:
                    speakers.append(prayer['speaker'])
                if prayer.get('label') and prayer['label'] not in labels:
                    labels.append(prayer['label'])
            
            # If we have speakers, create entries for each
            if speakers:
                for i, speaker in enumerate(speakers):
                    label = labels[i] if i < len(labels) else f"{len(consolidated_prayers) + i + 1}{'st' if len(consolidated_prayers) + i == 0 else 'nd' if len(consolidated_prayers) + i == 1 else 'rd' if len(consolidated_prayers) + i == 2 else 'th'} Jummah"
                    consolidated_prayers.append({
                        'label': label,
                        'time': time,
                        'speaker': speaker
                    })
            else:
                # No speakers found, just use the first entry with a proper label
                prayer = group[0]
                if not prayer.get('label'):
                    prayer['label'] = f"{len(consolidated_prayers) + 1}{'st' if len(consolidated_prayers) == 0 else 'nd' if len(consolidated_prayers) == 1 else 'rd' if len(consolidated_prayers) == 2 else 'th'} Jummah"
                consolidated_prayers.append(prayer)
    
    # Sort by time
    def time_sort_key(prayer):
        time_str = prayer.get('time', '')
        try:
            from datetime import datetime
            # Parse time like "12:30 PM"
            time_obj = datetime.strptime(time_str, '%I:%M %p')
            return time_obj.hour * 60 + time_obj.minute
        except:
            return 0
    
    consolidated_prayers.sort(key=time_sort_key)
    
    # Update labels to be sequential
    for i, prayer in enumerate(consolidated_prayers):
        ordinal = f"{i + 1}{'st' if i == 0 else 'nd' if i == 1 else 'rd' if i == 2 else 'th'}"
        prayer['label'] = f"{ordinal} Jummah"
    
    return {
        'location': prayer_data['location'],
        'prayers': consolidated_prayers
    }


def main():
    sites = {
        "MCA": ("https://www.mcabayarea.org/", "loc_mca"),
        "AlNoor": ("https://www.mcabayarea.org/", "loc_alnoor"),
        "SBIA": ("https://sbia.info", None),
        "WVMuslim": ("https://wvmuslim.org/prayer/", None)
    }

    # Use a dictionary to store mosque data keyed by location (to preserve other mosques)
    mosque_data_map = {}
    
    # 1. Try to load existing data
    data_file = 'data.json'
    print(f"Looking for existing data file: {os.path.abspath(data_file)}")
    
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r') as f:
                existing_json = json.load(f)
                # Populate the map with existing data
                for item in existing_json.get('data', []):
                    mosque_data_map[item['location']] = item
            print(f"Loaded {len(mosque_data_map)} mosques from existing {data_file}")
        except Exception as e:
            print(f"Warning: Could not load existing {data_file}: {e}")
    else:
        print(f"No existing {data_file} found, starting fresh")

    # 2. Scrape and update only the specified sites
    successful_updates = 0
    for i, (name, (url, section_id)) in enumerate(sites.items()):
        print(f"\n--- Processing {name} ({i+1}/{len(sites)}) ---")
        print(f"URL: {url}")
        print(f"Section ID: {section_id}")
        
        site_data = get_data_with_ai(url, name, section_id=section_id)
        if site_data:
            # Apply consolidation logic to clean up the data
            consolidated_data = consolidate_prayer_data(site_data)
            mosque_data_map[name] = consolidated_data
            successful_updates += 1
            print(f"✓ Successfully updated {name}")
            print(f"  Raw data: {json.dumps(site_data, indent=2)}")
            print(f"  Consolidated data: {json.dumps(consolidated_data, indent=2)}")
        else:
            print(f"✗ Failed to update {name}")

        if i < len(sites) - 1:
            print("Waiting 5 seconds before next request...")
            time.sleep(5)

    print(f"\n--- Summary ---")
    print(f"Successful updates: {successful_updates}/{len(sites)}")
    print(f"Total mosques in memory: {len(mosque_data_map)}")

    # 3. Construct final results (preserving all mosques)
    final_results = {
        "date_scraped": str(datetime.now()),
        "data": list(mosque_data_map.values())
    }

    # 4. Save back to data.json
    try:
        print(f"\nSaving data to: {os.path.abspath(data_file)}")
        with open(data_file, 'w') as f:
            json.dump(final_results, f, indent=4)
        print(f"✓ Successfully saved {len(final_results['data'])} mosques to {data_file}")
        
        # Verify the file was written
        if os.path.exists(data_file):
            file_size = os.path.getsize(data_file)
            print(f"✓ File verification: {data_file} exists ({file_size} bytes)")
        else:
            print(f"✗ File verification failed: {data_file} does not exist")
            
    except Exception as e:
        print(f"✗ Error saving to {data_file}: {e}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Attempting to save to current directory...")
        
        # Try saving to current directory as fallback
        try:
            fallback_file = os.path.join(os.getcwd(), 'data_backup.json')
            with open(fallback_file, 'w') as f:
                json.dump(final_results, f, indent=4)
            print(f"✓ Saved backup to: {fallback_file}")
        except Exception as backup_error:
            print(f"✗ Backup save failed: {backup_error}")

    print("\n--- Process Finished ---")
    print(f"Final mosque count: {len(final_results['data'])}")


if __name__ == "__main__":
    main()
