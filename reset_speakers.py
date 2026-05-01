import json
import os
from datetime import datetime

def reset_speakers():
    data_file = 'data.json'
    
    # Check if it's Saturday (weekday 5)
    today = datetime.now()
    if today.weekday() != 5:
        print(f"Today is {today.strftime('%A')}. Reset script is designed to run on Saturdays.")
        print("To run anyway, modify the script or use a force flag (not implemented).")
        # return  # Uncomment this to enforce Saturday-only execution
    
    if not os.path.exists(data_file):
        print(f"Error: {data_file} not found.")
        return

    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        if 'data' not in data:
            print("Error: Invalid data format.")
            return

        # Reset all speakers to null (None in Python)
        for mosque in data['data']:
            if 'prayers' in mosque:
                for prayer in mosque['prayers']:
                    prayer['speaker'] = None
        
        # Update the scraped date to reflect the reset
        data['date_scraped'] = str(datetime.now())

        with open(data_file, 'w') as f:
            json.dump(data, f, indent=4)
            
        print(f"✓ Successfully reset all speakers to 'TBD' in {data_file}")
        
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    reset_speakers()
