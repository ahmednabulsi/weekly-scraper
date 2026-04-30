# Prayer Dashboard for Google Nest Hub

This package contains the source code for a custom Google Cast application that displays prayer times and plays a notification 10 minutes before each prayer.

## Files
- `receiver.html`: The actual dashboard that runs on the Nest Hub.
- `sender.html`: The website you open on your phone/PC to "cast" the dashboard.

## Setup Instructions
1. **Host the Files**: Upload these files to a static host with HTTPS (like GitHub Pages).
2. **Google Cast Developer Console**:
   - Go to: https://cast.google.com/publish/
   - Pay the $5 one-time developer fee.
   - Click "Add New Application" -> "Custom Receiver".
   - Name: "Prayer Dashboard".
   - Receiver Control URL: The link to your `receiver.html` on GitHub Pages.
   - Save and get your **Application ID**.
3. **Update Sender**:
   - Open `sender.html` and replace `YOUR_APP_ID` with your new ID.
4. **Cast**:
   - Open your hosted `sender.html` in Chrome (Phone or PC).
   - Tap "Cast to Device" and select your Nest Hub.

## Note on JSON
The receiver is currently hardcoded to fetch data from:
https://raw.githubusercontent.com/ahmednabulsi/weekly-scraper/refs/heads/main/alnoor.json
