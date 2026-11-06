"""Shared helpers for the Jummah scrapers.

Every scraper writes the same data.json: a list of locations, each with a list
of {label, time, speaker} prayers. These helpers keep the merge semantics (and
the time formatting) identical across scrapers, so one site changing its markup
can never reshape another location's entry.
"""

import json
import os
import re
from datetime import datetime, timedelta, timezone
from html import unescape

DATA_FILE = "data.json"

ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"]

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

HEADERS = {"User-Agent": USER_AGENT}

PLACEHOLDER_SPEAKERS = {"tbd", "tba", "tbd.", "n/a", "na", "none", "-", "—"}


PACIFIC = "America/Los_Angeles"


def now_local():
    """Current time where the mosques are, not where the CI runner is."""
    try:
        from zoneinfo import ZoneInfo

        return datetime.now(ZoneInfo(PACIFIC))
    except Exception:
        # No tzdata available: UTC-8 is close enough for a day boundary.
        return datetime.now(timezone.utc) - timedelta(hours=8)


def next_friday(today=None):
    """
    The Friday the sites' posted schedules refer to, in Pacific time.

    The rollover is the day boundary, not a time of day. On a Friday the
    target is that same Friday: the scheduled runs land Thursday evening and
    Friday pre-dawn Pacific, and a run GitHub delays into Friday daytime must
    still match that day's posted khateeb rather than skipping a week ahead
    and discarding every speaker as stale. Speakers are cleared after Jummah
    by reset_speakers.py instead.
    """
    today = today or now_local()
    return today + timedelta(days=(4 - today.weekday()) % 7)


def ordinal(index):
    """0 -> '1st'."""
    return ORDINALS[index] if 0 <= index < len(ORDINALS) else "%dth" % (index + 1)


def strip_tags(fragment):
    """HTML fragment -> collapsed plain text."""
    # Drop comments first: React/Next.js splits text with <!-- --> markers.
    text = re.sub(r"<!--.*?-->", "", fragment, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def normalize_time(raw):
    """'1:30PM' / '1:30 pm' / '13:30' -> '1:30 PM'. None when no time present."""
    if not raw:
        return None

    match = re.search(r"(\d{1,2}):(\d{2})\s*([APap])\.?\s*[Mm]\.?", raw)
    if match:
        hour, minute, meridiem = int(match.group(1)), match.group(2), match.group(3).upper()
        return "%d:%s %sM" % (hour, minute, meridiem)

    # 24-hour fallback (API timestamps).
    match = re.search(r"\b(\d{1,2}):(\d{2})(?::\d{2})?\b", raw)
    if not match:
        return None
    hour, minute = int(match.group(1)), match.group(2)
    if hour > 23:
        return None
    meridiem = "AM" if hour < 12 else "PM"
    hour12 = hour % 12 or 12
    return "%d:%s %s" % (hour12, minute, meridiem)


def clean_speaker(raw):
    """Tidy a khateeb name; None when nothing real is posted."""
    if not raw:
        return None
    name = re.sub(r"\([^)]*\)", " ", unescape(raw))
    name = re.sub(r"[*•]+", " ", name)
    name = re.sub(r"\s+", " ", name).strip(" -–—,;:.")
    if not name or name.lower() in PLACEHOLDER_SPEAKERS:
        return None
    return name


def time_key(prayer):
    """Sort key for a prayer entry by its clock time."""
    try:
        parsed = datetime.strptime(prayer.get("time", ""), "%I:%M %p")
    except ValueError:
        return 0
    return parsed.hour * 60 + parsed.minute


def merge_locations(results, data_file=DATA_FILE):
    """
    Merge {location: entry} into data.json, preserving every other location.

    Returns the number of locations in the written file, or None on failure.
    """
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

    try:
        with open(data_file, "w") as f:
            json.dump(payload, f, indent=4)
    except Exception as exc:
        print("x Error saving %s: %s" % (data_file, exc))
        return None

    print("v Saved %d locations to %s" % (len(payload["data"]), data_file))
    return len(payload["data"])


def report(location, prayers):
    """Print a scraped location in a consistent, log-friendly shape."""
    print("v %s: %d Jummah entries" % (location, len(prayers)))
    for prayer in prayers:
        print(
            "    %-28s %-9s %s"
            % (prayer["label"], prayer["time"], prayer["speaker"] or "(no speaker posted)")
        )
