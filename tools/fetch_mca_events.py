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
from datetime import date, datetime, timezone

import requests

AJAX_URL = "https://www.mcabayarea.org/wp-admin/admin-ajax.php"
CALENDAR_URL = "https://www.mcabayarea.org/events-calendar/"
HOME_URL = "https://www.mcabayarea.org/"

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


def fix_mec_time(iso):
    """Correct MEC's double-timezone bug in schema.org startDate/endDate.

    MEC writes the intended local wall-clock time (e.g. 9:30 AM) into the
    timestamp as if it were UTC, then *also* appends the site's offset — so
    "9:30 AM Pacific" ships as "2026-07-23T02:30:00-07:00", which is 7h early
    (8h in PST). The real local time is the UTC wall-clock of that value, so we
    convert to UTC and re-stamp it with the original offset. Verified against
    the rendered event-page times for every event in a summer (PDT) and winter
    (PST) month — the shift is uniform, so this is safe to apply unconditionally.
    """
    if not iso:
        return iso
    try:
        dt = datetime.fromisoformat(iso)
    except (ValueError, TypeError):
        return iso
    if dt.tzinfo is None:
        return iso  # no offset to double-apply; leave as-is
    return dt.astimezone(timezone.utc).replace(tzinfo=dt.tzinfo).isoformat()


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
                "start": fix_mec_time(c.get("startDate")),
                "end": fix_mec_time(c.get("endDate")),
                "location": clean(loc),
                "image": img,
                "url": c.get("url"),
                "description": clean(c.get("description")),
            })
    return events


# The homepage "Featured Events" section is NOT part of MEC's calendar — it's a
# hand-curated Divi "event-grid" of event-card blocks. MEC exposes no featured
# flag anywhere (checked the monthly feed, WP REST API, and taxonomies), so the
# homepage grid is the only source of truth for what the site treats as featured.
_CARD_SPLIT_RE = re.compile(r'<div class="event-card\s*">')
_STRIP_TAGS_RE = re.compile(r"<[^>]+>")


def _card_text(fragment):
    """Strip tags and collapse whitespace from an HTML fragment."""
    if not fragment:
        return None
    return html.unescape(re.sub(r"\s+", " ", _STRIP_TAGS_RE.sub(" ", fragment))).strip()


def parse_featured(home_html):
    """Extract the homepage 'Featured Events' grid (event-card blocks)."""
    start = home_html.find('class="event-grid"')
    if start < 0:
        return []
    grid = home_html[start:]
    featured = []
    for chunk in _CARD_SPLIT_RE.split(grid)[1:]:
        name_m = re.search(r'<h3 class="event-name">\s*<a[^>]*>(.*?)</a>', chunk, re.S)
        if not name_m:
            break  # ran past the end of the grid into unrelated markup
        def grp(pat):
            m = re.search(pat, chunk, re.S)
            return m.group(1) if m else None
        featured.append({
            "title": _card_text(name_m.group(1)),
            "date_text": _card_text(grp(r'<span class="event-date">(.*?)</span>')),
            "time_text": _card_text(grp(r'<div class="event-time[^"]*">(.*?)</div>')),
            "url": grp(r'<h3 class="event-name">\s*<a href="([^"]+)"'),
            "image": grp(r'<img[^>]*src="([^"]+)"'),
            "featured": True,
        })
    return featured


def fetch_featured(session):
    """Fetch and parse the homepage 'Featured Events' section."""
    resp = session.get(HOME_URL, headers=HEADERS, timeout=30)
    if resp.status_code == 403:
        raise RuntimeError("HTTP 403 (Cloudflare block) fetching homepage for featured events.")
    resp.raise_for_status()
    return parse_featured(resp.text)


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
    ap.add_argument("--featured", action="store_true",
                    help="Also include the homepage 'Featured Events' section (added under a 'featured' key).")
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

    if args.featured:
        try:
            featured = fetch_featured(session)
            result["featured"] = featured
            print(f"  featured: {len(featured)} events", file=sys.stderr)
        except Exception as exc:
            print(f"! featured: {exc}", file=sys.stderr)
            result["featured"] = []
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(all_events)} events -> {args.output}", file=sys.stderr)

    if not all_events:
        sys.exit(1)   # non-zero so a CI job flags an empty scrape


if __name__ == "__main__":
    main()
