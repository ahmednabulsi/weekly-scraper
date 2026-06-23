# Masjid Times SDK

A zero-dependency JavaScript Web Component that displays prayer times on any website. Drop in a single `<script>` tag and place the `<masjid-prayer-times>` element wherever you want the widget.

---

## Quick Start

1. **Start the server** (serves mosque data and the SDK file):
   ```bash
   cd masjid-sdk
   npm install
   npm start
   # API running at http://localhost:3000
   ```

2. **Open the configurator** to visually build your embed code:
   ```
   http://localhost:3000/demo.html
   ```

3. **Embed on any website:**
   ```html
   <script src="http://localhost:3000/masjid-times.js"></script>

   <masjid-prayer-times
     mosque-id="zakariya"
     theme="emerald"
   ></masjid-prayer-times>
   ```

---

## All Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `mosque-id` | slug string | _(required)_ | Mosque identifier — see [Mosque IDs](#mosque-ids) |
| `api-url` | URL | `http://localhost:3000` | URL of the prayer times server |
| `view` | `daily` \| `monthly` | `daily` | Show today's times or the full month table |
| `theme` | `light` \| `dark` \| `emerald` \| `navy` \| `gold` \| `minimal` | `light` | Built-in color theme |
| `lang` | `en` \| `ar` | `en` | Language — Arabic enables RTL layout automatically |
| `time-format` | `12h` \| `24h` | `12h` | Clock format |
| `show-azaan` | `true` \| `false` | `true` | Show Adhan times |
| `show-iqamah` | `true` \| `false` | `true` | Show Iqamah times |
| `show-sunrise` | `true` \| `false` | `false` | Show Sunrise row |
| `show-date` | `true` \| `false` | `true` | Show date header |
| `show-hijri` | `true` \| `false` | `true` | Show Hijri date below the Gregorian date |
| `date-format` | see below | `MMMM D, YYYY` | Gregorian date format |
| `prayers` | comma-separated | `fajr,dhuhr,asr,maghrib,isha` | Which prayers to display |
| `logo-url` | URL string | _(none)_ | Mosque logo shown in the header |
| `accent-color` | CSS color | _(theme default)_ | Override the theme's accent color |
| `bg-color` | CSS color or `transparent` | _(theme default)_ | Override the widget background |
| `text-color` | CSS color | _(theme default)_ | Override the main text color |
| `monthly-layout` | `stacked` \| `split` | `stacked` | Monthly table: both times in one cell, or separate columns per prayer |
| `highlight-time` | `adhan` \| `iqamah` \| `both` \| `none` | `adhan` | Which time to emphasize (bold) in the monthly table |
| `width` | `responsive` \| CSS width | `responsive` | `responsive` fills the container; any CSS value (e.g. `400px`, `90%`) sets a fixed width with internal horizontal scroll |

### Date Format Tokens

| Token | Output |
|-------|--------|
| `MMMM` | May |
| `MMM` | May |
| `MM` | 05 |
| `D` | 13 |
| `DD` | 13 |
| `YYYY` | 2026 |

**Examples:** `MMMM D, YYYY` → `May 13, 2026` · `DD/MM/YYYY` → `13/05/2026` · `D MMM YYYY` → `13 May 2026`

---

## Themes

| Theme | Description |
|-------|-------------|
| `light` | Clean white background, navy accent |
| `dark` | Deep charcoal, light blue accent |
| `emerald` | Soft green palette |
| `navy` | Deep navy background, gold accent |
| `gold` | Warm ivory, gold accent |
| `minimal` | No background or border — inherits the page style |

---

## Examples

### Daily widget, emerald theme
```html
<masjid-prayer-times
  mosque-id="zakariya"
  theme="emerald"
  show-hijri="true"
  api-url="http://localhost:3000"
></masjid-prayer-times>
```

### Arabic, RTL, dark theme
```html
<masjid-prayer-times
  mosque-id="alnoor"
  lang="ar"
  theme="dark"
  time-format="24h"
  api-url="http://localhost:3000"
></masjid-prayer-times>
```

### Monthly view with logo
```html
<masjid-prayer-times
  mosque-id="mcc-east-bay"
  view="monthly"
  theme="navy"
  logo-url="https://example.com/mcc-logo.png"
  api-url="http://localhost:3000"
></masjid-prayer-times>
```

### Iqamah only, transparent background
```html
<masjid-prayer-times
  mosque-id="zakariya"
  theme="minimal"
  show-azaan="false"
  bg-color="transparent"
  api-url="http://localhost:3000"
></masjid-prayer-times>
```

### Custom accent color
```html
<masjid-prayer-times
  mosque-id="sbia"
  theme="light"
  accent-color="#7b2d8b"
  api-url="http://localhost:3000"
></masjid-prayer-times>
```

---

## Mosque IDs

Mosque IDs are lowercase kebab-case versions of the mosque file names.

| Mosque Name | ID |
|-------------|-----|
| Al Medina Education Center | `al-medina-education-center` |
| Blossom Valley Muslim Community Center | `blossom-valley-muslim-community-center` |
| Evergreen Islamic Center | `evergreen-islamic-center` |
| Islamic Center of Fremont | `islamic-center-of-fremont` |
| MCC East Bay | `mcc-east-bay` |
| Masjid Furqaan Hayward | `masjid-furqaan-hayward` |
| SVIC | `svic` |
| Silver Creek Muslim Community Center | `silver-creek-muslim-community-center` |
| Yaseen Belmont Masjid | `yaseen-belmont-masjid` |
| Yaseen Burlingame Center | `yaseen-burlingame-center` |
| Zakariya | `zakariya` |
| Al Noor | `alnoor` |
| Bosni | `bosni` |
| MCA | `mca` |
| SBIA | `sbia` |
| WV Muslim | `wvmuslim` |

To list all IDs programmatically:
```
GET http://localhost:3000/api/mosques
```

---

## API Reference

The server exposes these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mosques` | List all mosques `[{id, name}]` |
| `GET` | `/api/mosques/:id` | Full year data for a mosque |
| `GET` | `/api/mosques/:id/today` | Today's prayer times |
| `GET` | `/api/mosques/:id/month/:month` | A specific month (1–12 or `january`) |

**Example response — `/api/mosques/zakariya/today`:**
```json
{
  "id": "zakariya",
  "name": "Zakariya",
  "date": { "month": "MAY", "day": "13" },
  "times": {
    "fajr_azaan":    "4:37 AM",
    "fajr_iqamah":   "5:20 AM",
    "sunrise":       "6:00 AM",
    "dhuhr_azaan":   "1:04 PM",
    "dhuhr_iqamah":  "1:30 PM",
    "asr_azaan":     "4:55 PM",
    "asr_iqamah":    "6:30 PM",
    "maghrib_azaan": "8:12 PM",
    "maghrib_iqamah":"8:17 PM",
    "isha_azaan":    "9:32 PM",
    "isha_iqamah":   "9:45 PM"
  }
}
```

---

## Adding a New Mosque

Place a JSON file in `../prayer-times/<Mosque Name>.json` following the existing schema, then restart the server. The mosque will appear automatically in the API and configurator.
