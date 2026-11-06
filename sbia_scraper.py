"""
Deterministic scraper for SBIA (sbia.info) Jummah times and khateebs.

sbia.info server-renders its Jumu'ah block, so the data can be read directly:

    <span ...>Jumu&#x27;ah 1</span>12:15 PM</p>
    <p class="text-xs text-clay">Khateeb: <!-- -->Shaykh Alauddin ElBakri</p>

Replaces the LLM extraction that previously handled this site in scraper.py.
"""

import re
import sys

import requests

from jummah_store import (
    HEADERS,
    clean_speaker,
    merge_locations,
    normalize_time,
    ordinal,
    report,
    strip_tags,
)

URL = "https://sbia.info"
LOCATION = "SBIA"

# One Jumu'ah slot: the "Jumu'ah N" label, the time that follows it in the same
# <p>, then an optional "Khateeb: <name>" paragraph.
SLOT_RE = re.compile(
    r"Jumu(?:&#x27;|&#39;|')?ah\s*(\d+)\s*</span>(?P<time>[^<]*)</p>"
    r"(?:\s*<p[^>]*>\s*Khateeb:\s*(?P<speaker>.*?)</p>)?",
    re.IGNORECASE | re.DOTALL,
)


def parse(html):
    prayers = []
    seen = set()

    for match in SLOT_RE.finditer(html):
        time_str = normalize_time(match.group("time"))
        if not time_str:
            continue

        slot = int(match.group(1))
        # The page renders the block twice (SSR + hydration payload).
        if slot in seen:
            continue
        seen.add(slot)

        prayers.append(
            {
                "label": "%s Jummah" % ordinal(slot - 1),
                "time": time_str,
                "speaker": clean_speaker(strip_tags(match.group("speaker") or "")),
            }
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
