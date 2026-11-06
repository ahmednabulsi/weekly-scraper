"""
Deterministic scraper for the MCA Bay Area homepage (MCA + Al-Noor).

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

import re
import sys
import time

import requests

from jummah_store import (
    HEADERS,
    clean_speaker,
    merge_locations,
    next_friday,
    normalize_time,
    ordinal,
    report,
    strip_tags,
)

URL = "https://www.mcabayarea.org/"

# Section id on the homepage -> location key used in data.json
SECTIONS = {
    "MCA": "loc_mca",
    "AlNoor": "loc_alnoor",
}


def extract_section(html, section_id):
    """Return the markup of the first <div id="section_id"> prayer table."""
    start = html.find('id="%s"' % section_id)
    if start == -1:
        return None
    # The prayer table is the first one after the section opens.
    table_start = html.find("<table", start)
    table_end = html.find("</table>", table_start)
    if table_start == -1 or table_end == -1:
        return None
    return html[table_start:table_end]


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

    return clean_speaker(text)


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

        prayers.append(
            {
                "label": "%s Jummah" % ordinal(index),
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
        report(location, prayers)

    return results


def main():
    results = scrape()
    if not results:
        print("x Nothing scraped; leaving data.json untouched")
        return 1
    merge_locations(results)
    return 0


if __name__ == "__main__":
    sys.exit(main())
