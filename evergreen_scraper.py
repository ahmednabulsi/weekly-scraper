"""
Deterministic scraper for EIC San Jose ("Evergreen") Jummah times and khateebs.

eicsanjose.org server-renders its Jumu'ah card, so the data can be read
directly — one <li> per slot:

    <span ...>1st Jumu&#x27;ah</span>
      <p>Khutbah <span ...>12:25 PM</span></p>
      <p>Iqama <span ...>12:45 PM</span></p>
    <p ...>Imam Mohammad Zabid</p>

The Khutbah time is used as the prayer time and the Iqama time is ignored,
matching the previous behaviour. Replaces the Gemini extraction this scraper
used to do.
"""

import re
import sys

import requests

from jummah_store import (
    HEADERS,
    clean_speaker,
    merge_locations,
    normalize_time,
    report,
    strip_tags,
)

URL = "https://www.eicsanjose.org/wp/"
LOCATION = "Evergreen"

SLOT_RE = re.compile(
    r"<li\b[^>]*>(?P<body>(?:(?!</li>).)*Jumu(?:&#x27;|&#39;|')?ah(?:(?!</li>).)*)</li>",
    re.IGNORECASE | re.DOTALL,
)
LABEL_RE = re.compile(
    r">\s*(\d+)(?:st|nd|rd|th)\s*Jumu(?:&#x27;|&#39;|')?ah\s*<", re.IGNORECASE
)
KHUTBAH_RE = re.compile(r"Khutbah\s*(?:<[^>]+>\s*)*([^<]+)", re.IGNORECASE)
PARAGRAPH_RE = re.compile(r"<p\b[^>]*>(.*?)</p>", re.IGNORECASE | re.DOTALL)


def parse(html):
    prayers = []
    seen = set()

    for match in SLOT_RE.finditer(html):
        body = match.group("body")

        label_match = LABEL_RE.search(body)
        khutbah_match = KHUTBAH_RE.search(body)
        if not label_match or not khutbah_match:
            continue

        time_str = normalize_time(khutbah_match.group(1))
        if not time_str:
            continue

        slot = int(label_match.group(1))
        if slot in seen:
            continue
        seen.add(slot)

        # The speaker is the one paragraph that is neither Khutbah nor Iqama.
        speaker = None
        for paragraph in PARAGRAPH_RE.findall(body):
            text = strip_tags(paragraph)
            if not text or re.search(r"khutbah|iqama", text, re.IGNORECASE):
                continue
            speaker = clean_speaker(text)
            if speaker:
                break

        prayers.append(
            {"label": "Jummah %d" % slot, "time": time_str, "speaker": speaker}
        )

    prayers.sort(key=lambda p: p["label"])
    return prayers


def main():
    print("Fetching %s..." % URL)
    try:
        response = requests.get(URL, headers=HEADERS, timeout=20)
        response.raise_for_status()
    except Exception as exc:
        print("x Could not fetch %s: %s" % (URL, exc))
        return 1

    prayers = parse(response.text)
    if not prayers:
        print("x No Jumu'ah slots parsed; leaving data.json untouched")
        return 1

    report(LOCATION, prayers)
    merge_locations({LOCATION: {"location": LOCATION, "prayers": prayers}})
    return 0


if __name__ == "__main__":
    sys.exit(main())
