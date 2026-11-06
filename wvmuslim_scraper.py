"""
Deterministic scraper for West Valley Muslim Association (wvmuslim.org).

wvmuslim.org runs The Events Calendar, which exposes a public REST API, and
each Friday prayer is an event whose title carries the time and the khateeb:

    "Jumu’ah (12:30 PM) – Sh Junaid Bhaiyat"   @ Prospect Center
    "Jumu’ah (1:30 PM) @ LGIC – Samy Hilali"   @ Los Gatos Islamic Center (LGIC)

WVMA holds Jummah at several venues, so the venue name is appended to each
label (matching the existing data.json convention). Replaces the LLM
extraction that previously handled this site in scraper.py.
"""

import re
import sys
from html import unescape

import requests

from jummah_store import (
    HEADERS,
    clean_speaker,
    merge_locations,
    next_friday,
    normalize_time,
    ordinal,
    report,
    time_key,
)

API_URL = "https://wvmuslim.org/wp-json/tribe/events/v1/events"
LOCATION = "WVMuslim"

JUMUAH_RE = re.compile(r"jum[uw]?[’'`]?[ua]?h", re.IGNORECASE)

# Title shapes: "Jumu’ah (1:30 PM) @ LGIC – Samy Hilali" or
#               "Jumu’ah (12:30 PM) – Sh Junaid Bhaiyat"
SPEAKER_SPLIT_RE = re.compile(r"\s+[–—-]\s+")


def fetch_friday_events(friday):
    day = friday.strftime("%Y-%m-%d")
    params = {"start_date": day, "end_date": day, "per_page": 50}
    response = requests.get(API_URL, headers=HEADERS, params=params, timeout=20)
    response.raise_for_status()
    return response.json().get("events", [])


def short_venue(venue):
    """'Los Gatos Islamic Center (LGIC)' -> 'LGIC'; keeps the existing labels short."""
    if not venue:
        return None
    text = unescape(venue).strip()
    acronym = re.search(r"\(([A-Z][A-Za-z0-9&.\- ]{1,14})\)", text)
    return acronym.group(1).strip() if acronym else text


def parse_title(title):
    """Return (time_or_None, speaker_or_None) from an event title."""
    text = unescape(title)

    # The parenthesised time is the authoritative one in the title, but the
    # event's own start_date is used as the fallback by the caller.
    time_match = re.search(r"\(([^)]*\d{1,2}:\d{2}[^)]*)\)", text)
    time_str = normalize_time(time_match.group(1)) if time_match else None

    # Everything after the last dash separator is the khateeb.
    tail = SPEAKER_SPLIT_RE.split(text)
    speaker = None
    if len(tail) > 1:
        candidate = tail[-1].strip()
        # Guard against a dash inside the venue part rather than a speaker.
        if candidate and not JUMUAH_RE.search(candidate):
            speaker = clean_speaker(candidate)

    return time_str, speaker


def build_prayers(events, friday):
    prayers = []

    for event in events:
        title = event.get("title") or ""
        if not JUMUAH_RE.search(unescape(title)):
            continue

        time_str, speaker = parse_title(title)
        if not time_str:
            time_str = normalize_time(event.get("start_date") or "")
        if not time_str:
            continue

        venue = short_venue((event.get("venue") or {}).get("venue"))

        prayers.append({"venue": venue, "time": time_str, "speaker": speaker})

    # Order by clock time, then label sequentially with the venue appended.
    prayers.sort(key=time_key)

    labelled = []
    for index, prayer in enumerate(prayers):
        label = "%s Jummah" % ordinal(index)
        if prayer["venue"]:
            label = "%s - %s" % (label, prayer["venue"])
        labelled.append(
            {"label": label, "time": prayer["time"], "speaker": prayer["speaker"]}
        )

    return labelled


def main():
    friday = next_friday()
    print("Target Friday: %s" % friday.strftime("%B %d, %Y"))

    try:
        events = fetch_friday_events(friday)
    except Exception as exc:
        print("x Could not query %s: %s" % (API_URL, exc))
        return 1

    print("Events on %s: %d" % (friday.strftime("%Y-%m-%d"), len(events)))
    prayers = build_prayers(events, friday)
    if not prayers:
        print("x No Jumu'ah events found; leaving data.json untouched")
        return 1

    report(LOCATION, prayers)
    merge_locations({LOCATION: {"location": LOCATION, "prayers": prayers}})
    return 0


if __name__ == "__main__":
    sys.exit(main())
