const _svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`

export const ICONS = {
  fajr: _svg(
    `<path d="M12 2v8"/>` +
    `<path d="m4.93 10.93 1.41 1.41"/>` +
    `<path d="M2 18h2"/>` +
    `<path d="M20 18h2"/>` +
    `<path d="m19.07 10.93-1.41 1.41"/>` +
    `<path d="M22 22H2"/>` +
    `<path d="m8 6 4-4 4 4"/>` +
    `<path d="M16 18a4 4 0 0 0-8 0"/>`
  ),
  dhuhr: _svg(
    `<circle cx="12" cy="12" r="4"/>` +
    `<path d="M12 2v2"/>` +
    `<path d="M12 20v2"/>` +
    `<path d="m4.93 4.93 1.41 1.41"/>` +
    `<path d="m17.66 17.66 1.41 1.41"/>` +
    `<path d="M2 12h2"/>` +
    `<path d="M20 12h2"/>` +
    `<path d="m6.34 17.66-1.41 1.41"/>` +
    `<path d="m19.07 4.93-1.41 1.41"/>`
  ),
  asr: _svg(
    `<circle cx="12" cy="12" r="4"/>` +
    `<path d="M12 3v1.5"/>` +
    `<path d="M12 19.5V21"/>` +
    `<path d="m5.64 5.64 1.06 1.06"/>` +
    `<path d="m17.3 17.3 1.06 1.06"/>` +
    `<path d="M3 12h1.5"/>` +
    `<path d="M19.5 12H21"/>` +
    `<path d="m5.64 18.36 1.06-1.06"/>` +
    `<path d="m17.3 6.7 1.06-1.06"/>` +
    `<path d="M4 21h16"/>`
  ),
  maghrib: _svg(
    `<path d="M12 10V2"/>` +
    `<path d="m4.93 10.93 1.41 1.41"/>` +
    `<path d="M2 18h2"/>` +
    `<path d="M20 18h2"/>` +
    `<path d="m19.07 10.93-1.41 1.41"/>` +
    `<path d="M22 22H2"/>` +
    `<path d="m16 6-4 4-4-4"/>` +
    `<path d="M16 18a4 4 0 0 0-8 0"/>`
  ),
  isha: _svg(
    `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>` +
    `<path d="M20 3v4"/>` +
    `<path d="M22 5h-4"/>`
  ),
  sunrise: _svg(
    `<path d="M12 2v2"/>` +
    `<path d="m4.93 4.93 1.41 1.41"/>` +
    `<path d="m17.66 4.93-1.41 1.41"/>` +
    `<path d="M2 12h2"/>` +
    `<path d="M20 12h2"/>` +
    `<circle cx="12" cy="12" r="4"/>` +
    `<path d="M2 18h20"/>`
  ),
}

export const THEMES = {
  light: {
    '--mt-bg':           '#ffffff',
    '--mt-bg-card':      '#f8f9fa',
    '--mt-bg-highlight': '#e8f4fd',
    '--mt-text':         '#1a1a2e',
    '--mt-text-muted':   '#6c757d',
    '--mt-accent':       '#1a5276',
    '--mt-accent-text':  '#ffffff',
    '--mt-border':       '#dee2e6',
    '--mt-shadow':       '0 2px 12px rgba(0,0,0,0.08)',
    '--mt-radius':       '12px',
  },
  dark: {
    '--mt-bg':           '#1a1a2e',
    '--mt-bg-card':      '#16213e',
    '--mt-bg-highlight': '#0f3460',
    '--mt-text':         '#e8e8e8',
    '--mt-text-muted':   '#a0a0b0',
    '--mt-accent':       '#4fc3f7',
    '--mt-accent-text':  '#1a1a2e',
    '--mt-border':       '#2d2d4e',
    '--mt-shadow':       '0 2px 12px rgba(0,0,0,0.4)',
    '--mt-radius':       '12px',
  },
  emerald: {
    '--mt-bg':           '#f0faf4',
    '--mt-bg-card':      '#ffffff',
    '--mt-bg-highlight': '#c8efd8',
    '--mt-text':         '#1b3a2d',
    '--mt-text-muted':   '#4a7c59',
    '--mt-accent':       '#2d6a4f',
    '--mt-accent-text':  '#ffffff',
    '--mt-border':       '#b7dfca',
    '--mt-shadow':       '0 2px 12px rgba(45,106,79,0.12)',
    '--mt-radius':       '12px',
  },
  navy: {
    '--mt-bg':           '#0d1b2a',
    '--mt-bg-card':      '#1b2d45',
    '--mt-bg-highlight': '#243b55',
    '--mt-text':         '#f0e6d3',
    '--mt-text-muted':   '#b0a090',
    '--mt-accent':       '#c9a84c',
    '--mt-accent-text':  '#0d1b2a',
    '--mt-border':       '#2a3f5c',
    '--mt-shadow':       '0 2px 12px rgba(0,0,0,0.5)',
    '--mt-radius':       '12px',
  },
  gold: {
    '--mt-bg':           '#fdfaf3',
    '--mt-bg-card':      '#fffef9',
    '--mt-bg-highlight': '#fef3c7',
    '--mt-text':         '#3d2b00',
    '--mt-text-muted':   '#7c6030',
    '--mt-accent':       '#b7791f',
    '--mt-accent-text':  '#ffffff',
    '--mt-border':       '#e9d87e',
    '--mt-shadow':       '0 2px 12px rgba(183,121,31,0.12)',
    '--mt-radius':       '12px',
  },
  minimal: {
    '--mt-bg':           'transparent',
    '--mt-bg-card':      'transparent',
    '--mt-bg-highlight': 'rgba(0,0,0,0.04)',
    '--mt-text':         'inherit',
    '--mt-text-muted':   '#888888',
    '--mt-accent':       '#2d6a4f',
    '--mt-accent-text':  '#ffffff',
    '--mt-border':       'rgba(0,0,0,0.1)',
    '--mt-shadow':       'none',
    '--mt-radius':       '4px',
  },
}
