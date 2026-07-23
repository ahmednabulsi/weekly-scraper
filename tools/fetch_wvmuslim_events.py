#!/usr/bin/env python3
"""Fetch West Valley Muslim Association events from The Events Calendar (Tribe)
public REST API and write them to JSON.

Unlike MCA (which uses Modern Events Calendar and needed an admin-ajax scrape),
wvmuslim.org runs The Events Calendar plugin, which exposes a clean, public,
paginated REST API — no HTML parsing required:

    GET /wp-json/tribe/events/v1/events?start_date=&end_date=&page=&per_page=

Each event already carries structured title/start/end/venue/image, plus a native
`featured` boolean, so featured events come free here (no homepage scraping).

Usage:
    python fetch_wvmuslim_events.py                        # current month
    python fetch_wvmuslim_events.py --months 3             # current + next 2
    python fetch_wvmuslim_events.py --start 2026-07-01 --end 2026-07-31
    python fetch_wvmuslim_events.py --featured-only        # only featured events
    python fetch_wvmuslim_events.py -o data/wv_events.json

Only dependency: requests. Designed to run headless in CI (GitHub Actions).
"""

import argparse
import calendar
import html
import json
import os
import sys
from datetime import date

import requests

API_URL = "https://wvmuslim.org/wp-json/tribe/events/v1/events"
CALENDAR_URL = "https://wvmuslim.org/calendar/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": CALENDAR_URL,
}


def clean(text):
    """Decode HTML entities the plugin leaves in titles/venues."""
    return html.unescape(text).strip() if isinstance(text, str) else text


def normalize(e):
    """Reduce a Tribe event object to the fields we care about."""
    venue = e.get("venue")
    if isinstance(venue, dict):
        venue = venue.get("venue")
    elif not isinstance(venue, str):
        venue = None   # Tribe returns [] when an event has no venue
    img = e.get("image")
    if isinstance(img, dict):
        img = img.get("url")
    return {
        "title": clean(e.get("title")),
        "start": e.get("start_date"),
        "end": e.get("end_date"),
        "all_day": e.get("all_day"),
        "venue": clean(venue),
        "image": img,
        "url": e.get("url"),
        "featured": bool(e.get("featured")),
    }


def fetch_range(session, start, end, featured_only=False):
    """Fetch every event in [start, end], following the API's pagination."""
    events = []
    page = 1
    while True:
        params = {
            "start_date": start,
            "end_date": end,
            "per_page": 50,
            "page": page,
        }
        if featured_only:
            params["featured"] = 1
        resp = session.get(API_URL, headers=HEADERS, params=params, timeout=30)
        if resp.status_code == 404:
            break   # Tribe returns 404 for pages past the last one
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("events", [])
        events.extend(normalize(e) for e in batch)
        total_pages = data.get("total_pages", 1)
        print(f"  page {page}/{total_pages}: {len(batch)} events", file=sys.stderr)
        if page >= total_pages or not batch:
            break
        page += 1
    return events


def default_window(months):
    """Return (start, end) spanning the current month through `months` total."""
    today = date.today()
    start = today.replace(day=1)
    y, m = today.year, today.month
    for _ in range(months - 1):
        m += 1
        if m > 12:
            m, y = 1, y + 1
    end = date(y, m, calendar.monthrange(y, m)[1])
    return start.isoformat(), end.isoformat()


def main():
    ap = argparse.ArgumentParser(description="Fetch WV Muslim Association events to JSON.")
    ap.add_argument("--months", type=int, default=1,
                    help="Number of months from the current one to fetch (default 1). Ignored if --start/--end given.")
    ap.add_argument("--start", help="Start date YYYY-MM-DD (with --end).")
    ap.add_argument("--end", help="End date YYYY-MM-DD (with --start).")
    ap.add_argument("--featured-only", action="store_true", help="Fetch only events flagged featured.")
    ap.add_argument("-o", "--output", default="wvmuslim_events.json", help="Output JSON path.")
    args = ap.parse_args()

    if bool(args.start) ^ bool(args.end):
        ap.error("--start and --end must be used together.")
    if args.start and args.end:
        start, end = args.start, args.end
    else:
        start, end = default_window(args.months)

    print(f"Fetching {start} .. {end}"
          + (" (featured only)" if args.featured_only else ""), file=sys.stderr)

    session = requests.Session()
    events = fetch_range(session, start, end, featured_only=args.featured_only)
    events.sort(key=lambda e: e["start"] or "")

    featured = [e for e in events if e["featured"]]
    result = {
        "source": CALENDAR_URL,
        "generated_at": date.today().isoformat(),
        "window": {"start": start, "end": end},
        "count": len(events),
        "featured_count": len(featured),
        "events": events,
    }

    parent = os.path.dirname(args.output)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(events)} events ({len(featured)} featured) -> {args.output}", file=sys.stderr)

    if not events:
        sys.exit(1)   # non-zero so a CI job flags an empty scrape


if __name__ == "__main__":
    main()
