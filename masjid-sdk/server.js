const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '..', 'prayer-times');
const MOSQUE_INDEX_FILE = path.join(DATA_DIR, 'mosque-index.json');

app.use(cors());
app.use(express.json());

// Serve the SDK file and demo from this directory
app.use(express.static(__dirname));

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

let mosques = {};

function prayerFileFromUrl(prayerUrl) {
  const marker = '/prayer-times/';
  const pathname = new URL(prayerUrl).pathname;
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('prayer_url does not contain /prayer-times/');
  }

  const relativePath = decodeURIComponent(pathname.slice(markerIndex + marker.length));
  const prayerFile = path.resolve(DATA_DIR, relativePath);
  if (!prayerFile.startsWith(`${path.resolve(DATA_DIR)}${path.sep}`)) {
    throw new Error('prayer_url points outside the prayer-times directory');
  }
  return prayerFile;
}

function loadMosques() {
  const index = JSON.parse(fs.readFileSync(MOSQUE_INDEX_FILE, 'utf8'));
  if (!Array.isArray(index)) {
    throw new Error(`${MOSQUE_INDEX_FILE} must contain a JSON array`);
  }

  mosques = {};
  let duplicates = 0;
  let skipped = 0;

  for (const entry of index) {
    if (!entry.id || !entry.name || !entry.has_prayer_times || !entry.prayer_url) {
      skipped += 1;
      continue;
    }
    if (mosques[entry.id]) {
      duplicates += 1;
      continue;
    }

    try {
      const prayerFile = prayerFileFromUrl(entry.prayer_url);
      const data = JSON.parse(fs.readFileSync(prayerFile, 'utf8'));
      mosques[entry.id] = {
        id: entry.id,
        name: entry.name,
        address: entry.address || '',
        city: entry.city || '',
        state: entry.state || '',
        zip: entry.zip || '',
        data
      };
    } catch (error) {
      skipped += 1;
      console.warn(`Skipping mosque ${entry.id}: ${error.message}`);
    }
  }

  console.log(
    `Loaded ${Object.keys(mosques).length} mosques from mosque-index.json` +
    ` (${duplicates} duplicate IDs, ${skipped} invalid or unavailable entries skipped)`
  );
}

loadMosques();

// GET /api/mosques — list all
app.get('/api/mosques', (req, res) => {
  const list = Object.values(mosques).map(({ id, name, address, city, state, zip }) => ({
    id,
    name,
    address,
    city,
    state,
    zip
  }));
  res.json(list);
});

// GET /api/mosques/:id — full year
app.get('/api/mosques/:id', (req, res) => {
  const mosque = mosques[req.params.id];
  if (!mosque) return res.status(404).json({ error: 'Mosque not found' });
  res.json({ id: mosque.id, name: mosque.name, data: mosque.data });
});

// GET /api/mosques/:id/today
app.get('/api/mosques/:id/today', (req, res) => {
  const mosque = mosques[req.params.id];
  if (!mosque) return res.status(404).json({ error: 'Mosque not found' });

  const now = new Date();
  const monthKey = MONTH_NAMES[now.getMonth()];
  const dayKey = String(now.getDate());
  const times = mosque.data[monthKey]?.[dayKey];

  if (!times) return res.status(404).json({ error: 'Times not found for today' });

  res.json({
    id: mosque.id,
    name: mosque.name,
    date: { month: monthKey, day: dayKey },
    times
  });
});

// GET /api/mosques/:id/month/:month — accepts 1-12 or "january"
app.get('/api/mosques/:id/month/:month', (req, res) => {
  const mosque = mosques[req.params.id];
  if (!mosque) return res.status(404).json({ error: 'Mosque not found' });

  let monthKey;
  const m = req.params.month;
  if (/^\d+$/.test(m)) {
    const idx = parseInt(m, 10) - 1;
    if (idx < 0 || idx > 11) return res.status(400).json({ error: 'Month must be 1-12' });
    monthKey = MONTH_NAMES[idx];
  } else {
    monthKey = MONTH_NAMES.find(name => name.toLowerCase() === m.toLowerCase());
    if (!monthKey) return res.status(400).json({ error: 'Invalid month name' });
  }

  const monthData = mosque.data[monthKey];
  if (!monthData) return res.status(404).json({ error: `No data for ${monthKey}` });

  res.json({ id: mosque.id, name: mosque.name, month: monthKey, days: monthData });
});

app.listen(PORT, () => {
  console.log(`Masjid Times API running at http://localhost:${PORT}`);
  console.log(`Demo:        http://localhost:${PORT}/demo.html`);
  console.log(`Mosques:     http://localhost:${PORT}/api/mosques`);
});
