@@ -0,0 +1,180 @@
#!/usr/bin/env python3
"""Fetch MCA Bay Area events straight from the Modern Events Calendar AJAX
endpoint (no browser) and write them to JSON.

Discovered via network capture: the calendar's next/prev month control POSTs to
/wp-admin/admin-ajax.php with action=mec_monthly_view_load_month. The response
is JSON whose "month" field is calendar HTML containing one schema.org/Event
JSON-LD block per event. We parse those blocks — that's the whole trick.

The endpoint is public (no cookie/nonce), but it sits behind Cloudflare, which
403s bot-looking clients. Realistic browser headers (full User-Agent + Referer)
are what get us through.

Usage:
    python fetch_mca_events.py                       # current + next 2 months
    python fetch_mca_events.py --months 6            # current + next 5 months
    python fetch_mca_events.py --year 2026 --month 8 # one specific month
    python fetch_mca_events.py -o events.json         # choose output path

Designed to run headless in CI (GitHub Actions). Only dependency: requests.
"""

import argparse
import html
import json
import re
import sys
from datetime import date

import requests

AJAX_URL = "https://www.mcabayarea.org/wp-admin/admin-ajax.php"
CALENDAR_URL = "https://www.mcabayarea.org/events-calendar/"

# Realistic browser headers — the bare "Mozilla/5.0" UA gets a Cloudflare 403.
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": "https://www.mcabayarea.org",
    "Referer": CALENDAR_URL,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}

JSONLD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.S | re.I,
)


def clean(text):
    """Decode HTML entities (&#8216;, &amp;, …) that MEC leaves in titles."""
    return html.unescape(text).strip() if isinstance(text, str) else text


def parse_events(month_html):
    """Extract schema.org/Event objects from the calendar HTML's JSON-LD blocks."""
    events = []
    for raw in JSONLD_RE.findall(month_html):
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        candidates = data if isinstance(data, list) else [data]
        expanded = []
        for c in candidates:
            if isinstance(c, dict) and "@graph" in c:
                expanded.extend(c["@graph"])
            else:
                expanded.append(c)
        for c in expanded:
            if not (isinstance(c, dict) and "Event" in str(c.get("@type", ""))):
                continue
            loc = c.get("location")
            if isinstance(loc, dict):
                loc = loc.get("name")
            img = c.get("image")
            if isinstance(img, list):
                img = img[0] if img else None
            if isinstance(img, dict):
                img = img.get("url")
            events.append({
                "title": clean(c.get("name")),
                "start": c.get("startDate"),
                "end": c.get("endDate"),
                "location": clean(loc),
                "image": img,
                "url": c.get("url"),
                "description": clean(c.get("description")),
            })
    return events


def fetch_month(session, year, month):
    """POST the AJAX call for one month and return its parsed events."""
    resp = session.post(
        AJAX_URL,
        headers=HEADERS,
        data={
            "action": "mec_monthly_view_load_month",
            "mec_year": str(year),
            "mec_month": f"{month:02d}",
        },
        timeout=30,
    )
    if resp.status_code == 403:
        raise RuntimeError(
            f"HTTP 403 (Cloudflare block) for {year}-{month:02d}. "
            "The endpoint likely escalated to a JS challenge from this IP."
        )
    resp.raise_for_status()
    payload = resp.json()
    return parse_events(payload.get("month", ""))


def month_range(start_year, start_month, count):
    y, m = start_year, start_month
    for _ in range(count):
        yield y, m
        m += 1
        if m > 12:
            m, y = 1, y + 1


def main():
    ap = argparse.ArgumentParser(description="Fetch MCA Bay Area events to JSON (no browser).")
    ap.add_argument("--year", type=int, help="Specific year (with --month).")
    ap.add_argument("--month", type=int, help="Specific month 1-12 (with --year).")
    ap.add_argument("--months", type=int, default=3,
                    help="How many months from the current one to fetch (default 3). Ignored if --year/--month given.")
    ap.add_argument("-o", "--output", default="mca_events.json", help="Output JSON path.")
    args = ap.parse_args()

    if bool(args.year) ^ bool(args.month):
        ap.error("--year and --month must be used together.")

    if args.year and args.month:
        targets = [(args.year, args.month)]
    else:
        today = date.today()
        targets = list(month_range(today.year, today.month, args.months))

    session = requests.Session()
    all_events = []
    seen = set()
    for year, month in targets:
        try:
            events = fetch_month(session, year, month)
        except Exception as exc:
            print(f"! {year}-{month:02d}: {exc}", file=sys.stderr)
            continue
        # De-dupe by (title, start) — a multi-day event can recur across cells.
        added = 0
        for e in events:
            key = (e["title"], e["start"])
            if key not in seen:
                seen.add(key)
                all_events.append(e)
                added += 1
        print(f"  {year}-{month:02d}: {len(events)} parsed, {added} new", file=sys.stderr)

    all_events.sort(key=lambda e: e["start"] or "")
    result = {
        "source": CALENDAR_URL,
        "generated_at": date.today().isoformat(),
        "count": len(all_events),
        "events": all_events,
    }
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(all_events)} events -> {args.output}", file=sys.stderr)

    if not all_events:
        sys.exit(1)   # non-zero so a CI job flags an empty scrape


if __name__ == "__main__":
    main()
