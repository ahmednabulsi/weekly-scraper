#!/usr/bin/env python3
"""Refresh one month in existing USA and Canada prayer-time files."""

import argparse
import calendar
import json
import os
import tempfile
import time
from datetime import date, datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup


SCRIPT_DIR = Path(__file__).resolve().parent
PRAYER_TIMES_DIR = SCRIPT_DIR / "prayer-times"
MOSQUE_INDEX_FILE = PRAYER_TIMES_DIR / "mosque-index.json"
PROGRESS_FILE = SCRIPT_DIR / "update_prayers_monthly_progress.json"
MONTH_NAMES = list(calendar.month_name)[1:]
PRAYER_FIELDS = {
    "fajr_azaan",
    "fajr_iqamah",
    "sunrise",
    "dhuhr_azaan",
    "dhuhr_iqamah",
    "asr_azaan",
    "asr_iqamah",
    "maghrib_azaan",
    "maghrib_iqamah",
    "isha_azaan",
    "isha_iqamah",
}
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    )
}
COUNTRIES = {
    "usa": "US",
    "canada": "CA",
}


def clean_time_part(value):
    if not value:
        return "-"
    value = value.replace("\n", " ").strip()
    return value.replace(" AM", "").replace(" PM", "").strip()


def split_times(cell_text):
    parts = [part.strip() for part in cell_text.split("|") if part.strip()]
    if not parts:
        return "-", "-"
    azaan = clean_time_part(parts[0])
    iqamah = clean_time_part(parts[-1]) if len(parts) > 1 else "-"
    return azaan, iqamah


def parse_month_html(html, year, month):
    month_name = MONTH_NAMES[month - 1]
    soup = BeautifulSoup(html, "html.parser")

    heading = soup.find("div", class_=lambda value: value and "pagesubheading" in value)
    if heading:
        heading_text = heading.get_text(strip=True).split("(")[0].strip().upper()
        if not heading_text.startswith(month_name.upper()):
            raise ValueError(f"server returned {heading_text!r}, not {month_name}")

    month_data = {}
    for row in soup.find_all("tr"):
        cells = row.find_all("td", class_=lambda value: value and "regCell" in value)
        if len(cells) < 8:
            continue

        date_text = cells[0].get_text(strip=True)
        if "," not in date_text:
            continue
        day = date_text.split(",", 1)[0].strip()
        if not day.isdigit():
            continue

        fajr_a, fajr_i = split_times(cells[2].get_text(separator="|", strip=True))
        sunrise, _ = split_times(cells[3].get_text(separator="|", strip=True))
        dhuhr_a, dhuhr_i = split_times(cells[4].get_text(separator="|", strip=True))
        asr_a, asr_i = split_times(cells[5].get_text(separator="|", strip=True))
        maghrib_a, maghrib_i = split_times(cells[6].get_text(separator="|", strip=True))
        isha_a, isha_i = split_times(cells[7].get_text(separator="|", strip=True))

        month_data[str(int(day))] = {
            "fajr_azaan": fajr_a,
            "fajr_iqamah": fajr_i,
            "sunrise": sunrise,
            "dhuhr_azaan": dhuhr_a,
            "dhuhr_iqamah": dhuhr_i,
            "asr_azaan": asr_a,
            "asr_iqamah": asr_i,
            "maghrib_azaan": maghrib_a,
            "maghrib_iqamah": maghrib_i,
            "isha_azaan": isha_a,
            "isha_iqamah": isha_i,
        }

    expected_days = {str(day) for day in range(1, calendar.monthrange(year, month)[1] + 1)}
    if set(month_data) != expected_days:
        missing = sorted(expected_days - set(month_data), key=int)
        extra = sorted(set(month_data) - expected_days, key=int)
        raise ValueError(f"incomplete month (missing={missing}, extra={extra})")

    for day, values in month_data.items():
        if set(values) != PRAYER_FIELDS:
            raise ValueError(f"unexpected fields for {month_name} {day}")

    return month_data


def fetch_month(session, mosque_id, year, month, retries, retry_delay):
    url = "https://timing.athanplus.com/masjid/widgets/monthly"
    params = {
        "theme": 3,
        "masjid_id": mosque_id,
        "date": f"{year}-{month:02d}-01",
    }
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            response = session.get(url, params=params, timeout=20)
            response.raise_for_status()
            return parse_month_html(response.text, year, month)
        except (requests.RequestException, ValueError) as error:
            last_error = error
            if attempt < retries:
                time.sleep(retry_delay)

    raise RuntimeError(str(last_error))


def load_mosque_ids(country_code):
    with MOSQUE_INDEX_FILE.open(encoding="utf-8") as handle:
        mosques = json.load(handle)
    return {
        mosque["id"]
        for mosque in mosques
        if mosque.get("id") and mosque.get("country", "").upper() == country_code
    }


def find_existing_files(country, mosque_ids):
    country_dir = PRAYER_TIMES_DIR / country
    matches = []
    for prayers_file in country_dir.glob("*/*/prayers.json"):
        if prayers_file.parent.name in mosque_ids:
            matches.append(prayers_file)
    return sorted(matches, key=lambda path: str(path).lower())


def write_json_atomically(path, data):
    temp_name = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temp_name = handle.name
            json.dump(data, handle, indent=4)
            handle.write("\n")
        os.replace(temp_name, path)
    finally:
        if temp_name and os.path.exists(temp_name):
            os.unlink(temp_name)


def load_progress():
    if not PROGRESS_FILE.exists():
        return {"version": 1, "runs": {}}
    with PROGRESS_FILE.open(encoding="utf-8") as handle:
        progress = json.load(handle)
    if not isinstance(progress, dict) or not isinstance(progress.get("runs"), dict):
        raise ValueError(f"invalid progress file: {PROGRESS_FILE}")
    return progress


def checked_at():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def update_file(session, prayers_file, year, month, retries, retry_delay, dry_run):
    with prayers_file.open(encoding="utf-8") as handle:
        annual_data = json.load(handle)

    mosque_id = prayers_file.parent.name
    month_name = MONTH_NAMES[month - 1]
    new_month = fetch_month(session, mosque_id, year, month, retries, retry_delay)
    if annual_data.get(month_name) == new_month:
        return "unchanged"

    annual_data[month_name] = new_month
    if not dry_run:
        write_json_atomically(prayers_file, annual_data)
    return "would update" if dry_run else "updated"


def parse_args():
    today = date.today()
    parser = argparse.ArgumentParser(
        description="Update one month in existing AthanPlus prayer-time JSON files."
    )
    parser.add_argument("--year", type=int, default=today.year)
    parser.add_argument("--month", type=int, choices=range(1, 13), default=today.month)
    parser.add_argument(
        "--country",
        choices=("all", "usa", "canada"),
        default="all",
        help="dataset to update (default: all)",
    )
    parser.add_argument("--mosque-id", help="update only one existing mosque file")
    parser.add_argument(
        "--delay",
        type=float,
        default=5.0,
        help="seconds between requests (default: 5)",
    )
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true", help="fetch and compare without writing")
    parser.add_argument(
        "--restart",
        action="store_true",
        help="forget completed progress for this selection and check it again",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    if args.delay < 0:
        raise SystemExit("--delay cannot be negative")
    if args.retries < 1:
        raise SystemExit("--retries must be at least 1")

    selected = COUNTRIES if args.country == "all" else {args.country: COUNTRIES[args.country]}
    targets = []
    for country, country_code in selected.items():
        mosque_ids = load_mosque_ids(country_code)
        if args.mosque_id:
            mosque_ids &= {args.mosque_id}
        targets.extend((country, path) for path in find_existing_files(country, mosque_ids))

    if not targets:
        raise SystemExit("No existing prayer files matched the selection.")

    month_name = MONTH_NAMES[args.month - 1]
    run_key = f"{args.year}-{args.month:02d}"
    progress = None
    skipped = 0
    if not args.dry_run:
        progress = load_progress()
        run_progress = progress["runs"].setdefault(run_key, {})
        for country, prayers_file in targets:
            mosque_id = prayers_file.parent.name
            country_progress = run_progress.setdefault(country, {})
            if args.restart:
                country_progress.pop(mosque_id, None)
            country_progress.setdefault(
                mosque_id,
                {
                    "status": "pending",
                    "path": str(prayers_file.relative_to(SCRIPT_DIR)),
                },
            )
        write_json_atomically(PROGRESS_FILE, progress)

        pending_targets = []
        for country, prayers_file in targets:
            status = run_progress[country][prayers_file.parent.name]["status"]
            if status in {"updated", "unchanged"}:
                skipped += 1
            else:
                pending_targets.append((country, prayers_file))
        targets = pending_targets

    if not targets:
        print(f"All selected mosques were already checked for {month_name} {args.year}.")
        return

    mode = "Checking" if args.dry_run else "Updating"
    resume_text = f" ({skipped} already completed)" if skipped else ""
    print(f"{mode} {month_name} {args.year} for {len(targets)} mosques{resume_text}...")

    counts = {"updated": 0, "would update": 0, "unchanged": 0, "failed": 0}
    with requests.Session() as session:
        session.headers.update(REQUEST_HEADERS)
        for index, (country, prayers_file) in enumerate(targets, 1):
            mosque_id = prayers_file.parent.name
            label = f"[{index}/{len(targets)}] {country.upper()} {mosque_id}"
            try:
                result = update_file(
                    session,
                    prayers_file,
                    args.year,
                    args.month,
                    args.retries,
                    args.delay,
                    args.dry_run,
                )
                counts[result] += 1
            except (OSError, json.JSONDecodeError, RuntimeError) as error:
                result = "failed"
                counts["failed"] += 1
                error_text = str(error)

            if progress is not None:
                record = {
                    "status": result,
                    "checked_at": checked_at(),
                    "path": str(prayers_file.relative_to(SCRIPT_DIR)),
                }
                if result == "failed":
                    record["error"] = error_text
                progress["runs"][run_key][country][mosque_id] = record
                write_json_atomically(PROGRESS_FILE, progress)

            if result == "failed":
                print(f"{label}: FAILED - {error_text}")
            else:
                print(f"{label}: {result}")

            if index < len(targets) and args.delay:
                time.sleep(args.delay)

    print(
        "Done: "
        + ", ".join(f"{name}={count}" for name, count in counts.items() if count)
    )
    if counts["failed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
