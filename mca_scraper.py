"""
Deterministic scraper for the MCA Bay Area homepage (MCA + Al-Noor).

Replaces the AI-based extraction in scraper.py for these two locations.
The homepage renders both prayer tables server-side with stable markup:

    <div id="loc_mca">
      <table class="prayer-timing-table">
        ...
        <tr class="prayer-jummah">
          <td class="prayer-name">Jummah 1</td>
          <td class="prayer-time" colspan=2>12:15 PM <p>Br. Omar Ahmad (11/6)</p></td>
        </tr>

so the Friday speakers can be read with plain regex parsing.
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from html import unescape

import requests

URL = "https://www.mcabayarea.org/"

# Section id on the homepage -> location key used in data.json
SECTIONS = {
    "MCA": "loc_mca",
    "AlNoor": "loc_alnoor",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

DATA_FILE = "data.json"

ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"]


def next_friday(today=None):
    """The Friday the website's speaker list refers to."""
    today = today or datetime.now()
    days_ahead = (4 - today.weekday()) % 7
    # After Friday ~2pm the posted schedule has normally rolled to next week.
    if days_ahead == 0 and today.hour >= 14:
        days_ahead = 7
    return today + timedelta(days=days_ahead)


def extract_section(html, section_id):
    """Return the markup of the first <div id="section_id"> prayer table."""
    start = html.find('id="%s"' % section_id)
    if start == -1:
        return None
    # The prayer table is the first one after the section opens.
    table_start = html.find('<table', start)
    table_end = html.find('</table>', table_start)
    if table_start == -1 or table_end == -1:
        return None
    return html[table_start:table_end]


def strip_tags(fragment):
    text = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def normalize_time(raw):
    """'1:30PM' / '12:15 pm' -> '1:30 PM'."""
    m = re.search(r"(\d{1,2}):(\d{2})\s*([APap])\.?\s*[Mm]\.?", raw)
    if not m:
        return None
    hour, minute, meridiem = m.group(1), m.group(2), m.group(3).upper()
    return "%d:%s %sM" % (int(hour), minute, meridiem)


def parse_speaker(raw, target_friday):
    """
    Pull the khateeb name out of a cell like
    'Br. Omar Ahmad (11/6) (*no outside overflow)'.

    Returns None when no name is posted, or when the posted date does not
    match the upcoming Friday (i.e. the site still shows last week's name).
    """
    if not raw:
        return None

    # Drop the leading time, which shares the cell with the speaker.
    text = re.sub(r"^\s*\d{1,2}:\d{2}\s*[APap]\.?\s*[Mm]\.?", "", raw).strip()

    # A posted date like "(11/6)" tells us which Friday this name is for.
    date_match = re.search(r"\((\d{1,2})\s*/\s*(\d{1,2})\)", text)
    if date_match:
        month, day = int(date_match.group(1)), int(date_match.group(2))
        if (month, day) != (target_friday.month, target_friday.day):
            return None

    # Remove every parenthetical (dates, "(*no outside overflow)", etc.).
    text = re.sub(r"\([^)]*\)", " ", text)
    # Remove trailing footnote markers and separators.
    text = re.sub(r"[*•]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" -–—,;:")

    if not text or text.lower() in {"tbd", "tba", "n/a", "na"}:
        return None
    return text


def parse_jummah_rows(table_html, target_friday):
    """Parse every <tr class="prayer-jummah"> row into a prayer entry."""
    prayers = []
    rows = re.findall(
        r'<tr[^>]*class="[^"]*prayer-jummah[^"]*"[^>]*>(.*?)</tr>',
        table_html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    for row in rows:
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.DOTALL | re.IGNORECASE)
        if not cells:
            continue

        name_cell = strip_tags(cells[0])
        value_cell = strip_tags(cells[1]) if len(cells) > 1 else ""

        time_str = normalize_time(value_cell)
        if not time_str:
            continue

        speaker = parse_speaker(value_cell, target_friday)

        # "Jummah 1" -> "1st Jummah"; fall back to row order.
        num_match = re.search(r"(\d+)", name_cell)
        index = int(num_match.group(1)) - 1 if num_match else len(prayers)
        ordinal = ORDINALS[index] if 0 <= index < len(ORDINALS) else "%dth" % (index + 1)

        prayers.append(
            {
                "label": "%s Jummah" % ordinal,
                "time": time_str,
                "speaker": speaker,
            }
        )

    return prayers


def fetch_html(url=URL, retries=3):
    last_error = None
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=20)
            response.raise_for_status()
            return response.text
        except Exception as exc:  # network hiccups are the common case
            last_error = exc
            print("Fetch attempt %d/%d failed: %s" % (attempt + 1, retries, exc))
            if attempt < retries - 1:
                import time

                time.sleep(5 * (attempt + 1))
    raise RuntimeError("Could not fetch %s: %s" % (url, last_error))


def scrape():
    friday = next_friday()
    print("Target Friday: %s" % friday.strftime("%B %d, %Y"))

    html = fetch_html()
    results = {}

    for location, section_id in SECTIONS.items():
        table_html = extract_section(html, section_id)
        if not table_html:
            print("x %s: section '%s' not found on page" % (location, section_id))
            continue

        prayers = parse_jummah_rows(table_html, friday)
        if not prayers:
            print("x %s: no Jummah rows parsed" % location)
            continue

        results[location] = {"location": location, "prayers": prayers}
        print("v %s: %d Jummah entries" % (location, len(prayers)))
        for prayer in prayers:
            print(
                "    %-12s %-9s %s"
                % (prayer["label"], prayer["time"], prayer["speaker"] or "(no speaker posted)")
            )

    return results


def save(results, data_file=DATA_FILE):
    """Merge the scraped locations into data.json, preserving other mosques."""
    mosque_map = {}
    if os.path.exists(data_file):
        try:
            with open(data_file, "r") as f:
                existing = json.load(f)
            for item in existing.get("data", []):
                mosque_map[item["location"]] = item
            print("Loaded %d existing locations from %s" % (len(mosque_map), data_file))
        except Exception as exc:
            print("Warning: could not read %s: %s" % (data_file, exc))

    mosque_map.update(results)

    payload = {
        "date_scraped": str(datetime.now()),
        "data": list(mosque_map.values()),
    }

    with open(data_file, "w") as f:
        json.dump(payload, f, indent=4)
    print("v Saved %d locations to %s" % (len(payload["data"]), data_file))


def main():
    results = scrape()
    if not results:
        print("x Nothing scraped; leaving %s untouched" % DATA_FILE)
        return 1
    save(results)
    return 0


if __name__ == "__main__":
    sys.exit(main())
