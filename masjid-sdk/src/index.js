import { LitElement, html, css, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { I18N } from './utils/i18n.js'
import { THEMES, ICONS } from './utils/themes.js'
import { formatTime, formatGregorian, formatHijri, getNextPrayer } from './utils/format.js'
import { gregorianToHijri } from './utils/hijri.js'

class MasjidPrayerTimes extends LitElement {

  static properties = {
    mosqueId:      { type: String, attribute: 'mosque-id' },
    view:          { type: String },
    theme:         { type: String },
    lang:          { type: String },
    timeFormat:    { type: String, attribute: 'time-format' },
    showAmpm:      { type: String, attribute: 'show-ampm' },
    showAzaan:     { type: String, attribute: 'show-azaan' },
    showIqamah:    { type: String, attribute: 'show-iqamah' },
    showSunrise:   { type: String, attribute: 'show-sunrise' },
    showDate:      { type: String, attribute: 'show-date' },
    showHijri:     { type: String, attribute: 'show-hijri' },
    dateFormat:    { type: String, attribute: 'date-format' },
    prayers:       { type: String },
    logoUrl:       { type: String, attribute: 'logo-url' },
    accentColor:   { type: String, attribute: 'accent-color' },
    bgColor:       { type: String, attribute: 'bg-color' },
    textColor:     { type: String, attribute: 'text-color' },
    apiUrl:        { type: String, attribute: 'api-url' },
    monthlyLayout: { type: String, attribute: 'monthly-layout' },
    highlightTime: { type: String, attribute: 'highlight-time' },
    width:         { type: String },
    showHijriCol:  { type: String, attribute: 'show-hijri-col' },
    showIcons:     { type: String, attribute: 'show-icons' },
    dayName:       { type: String, attribute: 'day-name' },
    fontSize:      { type: String, attribute: 'font-size' },
    dailyLayout:   { type: String, attribute: 'daily-layout' },
    prayerNames:   { type: String, attribute: 'prayer-names' },
    sunriseLabel:  { type: String, attribute: 'sunrise-label' },
    adhanLabel:    { type: String, attribute: 'adhan-label' },
    iqamahLabel:   { type: String, attribute: 'iqamah-label' },
    _data:         { state: true },
    _loading:      { state: true },
    _error:        { state: true },
    _isNextDay:    { state: true },
  }

  constructor() {
    super()
    this.mosqueId      = ''
    this.view          = 'daily'
    this.theme         = 'light'
    this.lang          = 'en'
    this.timeFormat    = '12h'
    this.showAmpm      = 'false'
    this.showAzaan     = 'true'
    this.showIqamah    = 'true'
    this.showSunrise   = 'true'
    this.showDate      = 'true'
    this.showHijri     = 'true'
    this.dateFormat    = 'MMMM D, YYYY'
    this.prayers       = 'fajr,dhuhr,asr,maghrib,isha'
    this.logoUrl       = ''
    this.accentColor   = ''
    this.bgColor       = ''
    this.textColor     = ''
    this.apiUrl        = 'http://localhost:3000'
    this.monthlyLayout = 'split'
    this.highlightTime = 'both'
    this.width         = 'responsive'
    this.showHijriCol  = 'false'
    this.showIcons     = 'true'
    this.dayName       = 'short'
    this.dailyLayout   = 'list'
    this.fontSize      = ''
    this.prayerNames   = ''
    this.sunriseLabel  = ''
    this.adhanLabel    = ''
    this.iqamahLabel   = ''
    this._data      = null
    this._loading   = false
    this._error     = null
    this._isNextDay = false
    this._fetchKey  = ''
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  get _t()           { return I18N[this.lang] || I18N.en }
  get _showAzaan()   { return this.showAzaan   !== 'false' }
  get _showAmpm()    { return this.showAmpm    === 'true' }
  get _showIqamah()  { return this.showIqamah  !== 'false' }
  get _showSunrise() { return this.showSunrise === 'true' }
  get _showDate()    { return this.showDate    !== 'false' }
  get _showHijri()   { return this.showHijri   !== 'false' }
  get _showBoth()    { return this._showAzaan && this._showIqamah }
  get _showHijriCol(){ return this.showHijriCol === 'true' }
  get _showIcons()   { return this.showIcons    !== 'false' }
  get _useSplit()    { return this.monthlyLayout === 'split' && this._showBoth }
  get _apiUrl()      { return (this.apiUrl || 'http://localhost:3000').replace(/\/$/, '') }
  get _adhanLabel()  { return this.adhanLabel  || this._t.azaan  }
  get _iqamahLabel() { return this.iqamahLabel || this._t.iqamah }

  _prayerLabel(p) {
    if (p === 'sunrise') return this.sunriseLabel || this._t.prayers.sunrise
    if (this.prayerNames) {
      const names = this.prayerNames.split(',').map(s => s.trim())
      const idx = this._prayerList.indexOf(p)
      if (idx >= 0 && names[idx]) return names[idx]
    }
    return this._t.prayers[p] || p
  }

  get _prayerList() {
    return this.prayers.split(',').map(s => s.trim()).filter(Boolean)
  }

  _formatPrayerTime(time, prayer) {
    const period = prayer === 'fajr' || prayer === 'sunrise' ? 'AM' : 'PM'
    return formatTime(time, this.timeFormat, this.lang, this._showAmpm, period)
  }

  get _displayPrayers() {
    const list = [...this._prayerList]
    if (this._showSunrise) list.splice(1, 0, 'sunrise')
    return list
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  willUpdate(changedProps) {
    // Runs BEFORE render — clear stale data when the fetch target changes so
    // render never sees daily data while view='monthly' (or vice versa).
    if (changedProps.has('mosqueId') || changedProps.has('view') || changedProps.has('apiUrl')) {
      const key = `${this._apiUrl}|${this.mosqueId}|${this.view}`
      if (key !== this._fetchKey) {
        this._data    = null
        this._loading = true
      }
    }
  }

  updated(changedProps) {
    this._applyCssVars()
    if (changedProps.has('mosqueId') || changedProps.has('view') || changedProps.has('apiUrl')) {
      this._fetchData()
    }
  }

  _applyCssVars() {
    const theme = THEMES[this.theme] || THEMES.light
    const vars = { ...theme }
    if (this.accentColor) vars['--mt-accent'] = this.accentColor
    if (this.bgColor)     vars['--mt-bg']     = this.bgColor
    if (this.textColor)   vars['--mt-text']   = this.textColor
    if (this.width && this.width !== 'responsive') {
      vars['--mt-width'] = this.width
    } else {
      this.style.removeProperty('--mt-width')
    }
    if (this.fontSize) {
      this.style.setProperty('--mt-font-size', this.fontSize)
    } else {
      this.style.removeProperty('--mt-font-size')
    }
    for (const [k, v] of Object.entries(vars)) {
      this.style.setProperty(k, v)
    }
  }

  async _fetchData() {
    const { mosqueId, _apiUrl: apiUrl, view } = this
    if (!mosqueId) { this._error = 'mosque-id required'; this._data = null; return }

    const key = `${apiUrl}|${mosqueId}|${view}`
    if (this._fetchKey === key && this._data) return

    this._loading   = true
    this._error     = null
    this._isNextDay = false

    try {
      const month = new Date().getMonth() + 1
      const url   = view === 'monthly'
        ? `${apiUrl}/api/mosques/${mosqueId}/month/${month}`
        : `${apiUrl}/api/mosques/${mosqueId}/today`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      // For daily view: if all prayers' iqamahs have passed, load tomorrow
      if (view !== 'monthly' && data.times && this._allPrayersDone(data.times)) {
        const tomorrowTimes = await this._fetchTomorrowTimes(apiUrl, mosqueId)
        if (tomorrowTimes) {
          this._data      = { ...data, times: tomorrowTimes }
          this._isNextDay = true
        } else {
          this._data = data
        }
      } else {
        this._data = data
      }

      this._fetchKey = key
    } catch (e) {
      this._error = e.message
      this._data  = null
    } finally {
      this._loading = false
    }
  }

  _allPrayersDone(times) {
    const lastP  = this._prayerList[this._prayerList.length - 1]
    const t      = times[`${lastP}_iqamah`] || times[`${lastP}_azaan`]
    if (!t) return false
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!m) return false
    let h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    const period = m[3].toUpperCase()
    if (period === 'AM' && h === 12) h = 0
    if (period === 'PM' && h !== 12) h += 12
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    return (h * 60 + min) <= nowMin
  }

  async _fetchTomorrowTimes(apiUrl, mosqueId) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const month = tomorrow.getMonth() + 1
    const day   = tomorrow.getDate()
    try {
      const res  = await fetch(`${apiUrl}/api/mosques/${mosqueId}/month/${month}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.days?.[day] || null
    } catch {
      return null
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const rtl = this.lang === 'ar'
    return html`
      <div class="widget ${rtl ? 'rtl' : ''}">
        ${this._loading
          ? html`<div class="state-msg"><div class="spinner"></div><br>${this._t.loading}</div>`
          : (this._error || !this._data)
            ? html`<div class="state-msg">${this._t.error}</div>`
            : html`
                ${this._showDate ? this._renderHeader() : nothing}
                ${this.view === 'monthly' ? this._renderMonthly() : this._renderDaily()}
              `
        }
      </div>
    `
  }

  _renderHeader() {
    const now  = this._isNextDay ? new Date(Date.now() + 86400000) : new Date()
    const greg  = formatGregorian(now, this.dateFormat, this.lang)
    const hijri = formatHijri(now, this.lang)
    return html`
      <div class="header">
        ${this.logoUrl ? html`<img class="header-logo" src="${this.logoUrl}" alt="" loading="lazy">` : nothing}
        <div class="header-text">
          ${this._data?.name ? html`<div class="mosque-name">${this._data.name}</div>` : nothing}
          ${this._isNextDay ? html`<div class="tomorrow-label">Tomorrow</div>` : nothing}
          <div class="date-gregorian">${greg}</div>
          ${this._showHijri ? html`<div class="date-hijri">${hijri}</div>` : nothing}
        </div>
      </div>
    `
  }

  _renderDaily() {
    switch (this.dailyLayout) {
      case 'row':      return this._renderDailyRow()
      case 'compact':  return this._renderDailyCompact()
      case 'focused':  return this._renderDailyFocused()
      default:         return this._renderDailyList()
    }
  }

  _renderDailyList() {
    const { times } = this._data
    const next = getNextPrayer(times, this._prayerList)
    const hl   = this.highlightTime
    const azCls = hl === 'adhan'  ? 'time-value hl-primary' : hl === 'iqamah' ? 'time-value hl-dim' : 'time-value'
    const iqCls = hl === 'iqamah' ? 'time-value hl-primary' : hl === 'adhan'  ? 'time-value hl-dim' : 'time-value'
    return html`
      <div class="prayers-list">
        ${this._displayPrayers.map(p => html`
          <div class="prayer-row ${p === next ? 'next' : ''}">
            ${this._showIcons ? html`<div class="prayer-icon">${unsafeHTML(ICONS[p] || ICONS.dhuhr)}</div>` : nothing}
            <div class="prayer-name">${this._prayerLabel(p)}</div>
            ${p === 'sunrise'
              ? html`
                  <div class="times-group">
                    <div class="time-block">
                      <div class="time-value">${this._formatPrayerTime(times.sunrise, 'sunrise')}</div>
                    </div>
                  </div>`
              : html`
                  <div class="times-group">
                    ${this._showAzaan ? html`
                      <div class="time-block">
                        <div class="time-label">${this._adhanLabel}</div>
                        <div class="${azCls}">${this._formatPrayerTime(times[`${p}_azaan`], p)}</div>
                      </div>` : nothing}
                    ${this._showIqamah ? html`
                      <div class="time-block">
                        <div class="time-label">${this._iqamahLabel}</div>
                        <div class="${iqCls}">${this._formatPrayerTime(times[`${p}_iqamah`], p)}</div>
                      </div>` : nothing}
                  </div>`
            }
          </div>
        `)}
      </div>
    `
  }

  _renderDailyRow() {
    const { times } = this._data
    const next = getNextPrayer(times, this._prayerList)
    const hl   = this.highlightTime
    const azCls = `card-adhan${hl === 'iqamah' ? ' hl-dim' : ''}`
    const iqCls = `card-iqamah${(hl === 'iqamah' || hl === 'both') ? ' hl-primary' : hl === 'adhan' ? ' hl-dim' : ''}`
    return html`
      <div class="prayers-row">
        ${this._displayPrayers.map(p => html`
          <div class="prayer-card ${p === next ? 'next' : ''}">
            ${this._showIcons ? html`<div class="prayer-icon">${unsafeHTML(ICONS[p] || ICONS.dhuhr)}</div>` : nothing}
            <div class="prayer-name">${this._prayerLabel(p)}</div>
            <div class="card-times">
              ${p === 'sunrise'
                ? html`
                    <div class="${azCls}">${this._formatPrayerTime(times.sunrise, 'sunrise')}</div>
                    ${this._showIqamah ? html`<div class="${iqCls}" style="visibility:hidden" aria-hidden="true">-</div>` : nothing}
                  `
                : html`
                    ${this._showAzaan   ? html`<div class="${azCls}">${this._formatPrayerTime(times[`${p}_azaan`], p)}</div>` : nothing}
                    ${this._showIqamah  ? html`<div class="${iqCls}">${this._formatPrayerTime(times[`${p}_iqamah`], p)}</div>` : nothing}
                  `
              }
            </div>
          </div>
        `)}
      </div>
    `
  }

  _renderDailyCompact() {
    const { times } = this._data
    const next = getNextPrayer(times, this._prayerList)
    const hl   = this.highlightTime
    const azCls = hl === 'iqamah' ? 'ct-time hl-dim' : (hl === 'adhan' || hl === 'both') ? 'ct-time hl-primary' : 'ct-time'
    const iqCls = hl === 'adhan'  ? 'ct-time hl-dim' : (hl === 'iqamah' || hl === 'both') ? 'ct-time hl-primary' : 'ct-time'
    const iconCol = this._showIcons ? '1.6em ' : ''
    const azCol   = this._showAzaan  ? '1fr ' : ''
    const iqCol   = this._showIqamah ? '1fr'  : ''
    const cols    = `${iconCol}1fr ${azCol}${iqCol}`.trim()
    return html`
      <div class="ct-table" style="grid-template-columns:${cols}">
        <div class="ct-head-row">
          ${this._showIcons ? html`<span></span>` : nothing}
          <span></span>
          ${this._showAzaan  ? html`<span class="ct-col-head">${this._adhanLabel}</span>`  : nothing}
          ${this._showIqamah ? html`<span class="ct-col-head">${this._iqamahLabel}</span>` : nothing}
        </div>
        ${this._displayPrayers.map(p => html`
          <div class="ct-row ${p === next ? 'next' : ''}">
            ${this._showIcons ? html`<div class="ct-icon" aria-hidden="true">${unsafeHTML(ICONS[p] || ICONS.dhuhr)}</div>` : nothing}
            <div class="ct-name">${this._prayerLabel(p)}</div>
            ${p === 'sunrise'
              ? html`
                  <div class="ct-time">${this._formatPrayerTime(times.sunrise, 'sunrise')}</div>
                  ${this._showIqamah ? html`<div aria-hidden="true"></div>` : nothing}
                `
              : html`
                  ${this._showAzaan  ? html`<div class="${azCls}">${this._formatPrayerTime(times[`${p}_azaan`], p)}</div>` : nothing}
                  ${this._showIqamah ? html`<div class="${iqCls}">${this._formatPrayerTime(times[`${p}_iqamah`], p)}</div>` : nothing}
                `}
          </div>
        `)}
      </div>
    `
  }

  _renderDailyFocused() {
    const { times } = this._data
    const next = getNextPrayer(times, this._prayerList)
    const hl   = this.highlightTime
    const showSecondary = this._showAzaan && this._showIqamah
    const heroKey = hl === 'iqamah' ? `${next}_iqamah` : `${next}_azaan`
    const heroTime = this._formatPrayerTime(times[heroKey], next)
    const secKey  = hl === 'iqamah' ? `${next}_azaan` : `${next}_iqamah`
    const secTime = this._formatPrayerTime(times[secKey], next)
    const secLabel = hl === 'iqamah' ? this._adhanLabel : this._iqamahLabel
    return html`
      <div class="fc-wrap">
        <div class="fc-hero">
          ${this._showIcons ? html`<div class="fc-hero-icon" aria-hidden="true">${unsafeHTML(ICONS[next] || ICONS.dhuhr)}</div>` : nothing}
          <div class="fc-hero-name">${this._prayerLabel(next)}</div>
          <div class="fc-hero-time">${heroTime}</div>
          ${showSecondary ? html`<div class="fc-hero-secondary"><span class="fc-sec-label">${secLabel}</span><span class="fc-sec-time">${secTime}</span></div>` : nothing}
        </div>
        <div class="fc-strip">
          ${this._displayPrayers.map(p => html`
            <div class="fc-chip ${p === next ? 'next' : ''}">
              ${this._showIcons ? html`<div class="fc-chip-icon" aria-hidden="true">${unsafeHTML(ICONS[p] || ICONS.dhuhr)}</div>` : nothing}
              <div class="fc-chip-name">${this._prayerLabel(p)}</div>
              ${p === 'sunrise'
                ? html`<div class="fc-chip-time">${this._formatPrayerTime(times.sunrise, 'sunrise')}</div>`
                : html`
                    ${this._showAzaan  ? html`<div class="fc-chip-time ${hl === 'adhan' || hl === 'both' ? 'hl-primary' : ''}">${this._formatPrayerTime(times[`${p}_azaan`], p)}</div>` : nothing}
                    ${this._showIqamah ? html`<div class="fc-chip-iqamah ${hl === 'iqamah' || hl === 'both' ? 'hl-primary' : 'hl-dim'}">${this._formatPrayerTime(times[`${p}_iqamah`], p)}</div>` : nothing}
                  `}
            </div>
          `)}
        </div>
      </div>
    `
  }

  _renderMonthly() {
    const { days }    = this._data
    const today       = new Date().getDate()
    const t           = this._t
    const dp          = this._displayPrayers
    const useSplit    = this._useSplit
    const showBoth    = this._showBoth
    const hl          = this.highlightTime
    const showHijriCol = this._showHijriCol
    const dayNameFmt  = this.dayName  // 'none' | 'short' | 'long'
    const showDayName = dayNameFmt !== 'none'
    const now         = new Date()
    const year        = now.getFullYear()
    const month       = now.getMonth()
    const sortedDays  = Object.entries(days).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))

    let prevHijriMonth = -1

    return html`
      <div class="monthly-wrap">
        <table class="monthly">
          <thead>
            <tr>
              <th rowspan="${useSplit ? 2 : 1}" class="day-num">#</th>
              ${showDayName  ? html`<th rowspan="${useSplit ? 2 : 1}" class="day-name-col">${t.dayCol}</th>` : nothing}
              ${showHijriCol ? html`<th rowspan="${useSplit ? 2 : 1}" class="hijri-col">${t.hijriCol}</th>` : nothing}
              ${dp.map(p =>
                p === 'sunrise'
                  ? html`<th rowspan="${useSplit ? 2 : 1}" class="th-prayer">${this._prayerLabel(p)}</th>`
                  : useSplit
                    ? html`<th colspan="2" class="th-prayer">${this._prayerLabel(p)}</th>`
                    : html`<th>${this._prayerLabel(p)}${showBoth
                        ? html`<span class="sub">${this._adhanLabel}</span><span class="sub">${this._iqamahLabel}</span>`
                        : nothing}</th>`
              )}
            </tr>
            ${useSplit ? html`
              <tr>
                ${dp.filter(p => p !== 'sunrise').map(() => html`
                  <th class="th-sub">${this._adhanLabel}</th>
                  <th class="th-sub td-split-last">${this._iqamahLabel}</th>
                `)}
              </tr>` : nothing}
          </thead>
          <tbody>
            ${sortedDays.map(([day, dayTimes]) => {
              const date   = new Date(year, month, parseInt(day))
              const dow    = date.getDay()

              const dayNameCell = showDayName ? html`
                <td class="day-name-col">
                  ${dayNameFmt === 'long' ? t.days[dow] : t.daysShort[dow]}
                </td>` : nothing

              let hijriCell = nothing
              if (showHijriCol) {
                const h = gregorianToHijri(date)
                const newMonth = h.month !== prevHijriMonth
                prevHijriMonth = h.month
                hijriCell = html`
                  <td class="hijri-col">
                    ${h.day}${newMonth ? html`<span class="sub">${t.hijriMonths[h.month - 1]}</span>` : nothing}
                  </td>`
              }
              return html`
              <tr class="${parseInt(day) === today ? 'today' : ''}">
                <td class="day-num">${day}</td>
                ${dayNameCell}
                ${hijriCell}
                ${dp.map(p => {
                  if (p === 'sunrise') {
                    return html`<td>${this._formatPrayerTime(dayTimes.sunrise, 'sunrise')}</td>`
                  }
                  const az = this._formatPrayerTime(dayTimes[`${p}_azaan`], p)
                  const iq = this._formatPrayerTime(dayTimes[`${p}_iqamah`], p)
                  if (useSplit) {
                    return [
                      html`<td class="${hl === 'adhan' || hl === 'both' ? 'td-hl' : ''}">${az}</td>`,
                      html`<td class="td-split-last ${hl === 'iqamah' || hl === 'both' ? 'td-hl' : ''}">${iq}</td>`,
                    ]
                  }
                  if (!showBoth) {
                    return html`<td>${this._showAzaan ? az : iq}</td>`
                  }
                  const azCls = hl === 'adhan' ? 't-primary' : hl === 'iqamah' ? 't-secondary' : hl === 'both' ? 't-equal' : 't-muted'
                  const iqCls = hl === 'adhan' ? 't-secondary' : hl === 'iqamah' ? 't-primary' : hl === 'both' ? 't-equal' : 't-muted'
                  return html`<td><span class="${azCls}">${az}</span><span class="${iqCls}">${iq}</span></td>`
                })}
              </tr>
            `})}
          </tbody>
        </table>
      </div>
    `
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: var(--mt-font-size, 1rem);
      box-sizing: border-box;
      width: var(--mt-width, 100%);
      container-type: inline-size;
    }
    *, *::before, *::after { box-sizing: inherit; }

    .widget { background: var(--mt-bg); border-radius: var(--mt-radius); box-shadow: var(--mt-shadow); overflow: clip; color: var(--mt-text); }

    /* Header */
    .header { display: flex; align-items: center; gap: 12px; padding: 16px 20px 12px; border-bottom: 1px solid var(--mt-border); }
    .header-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
    .header-text { flex: 1; min-width: 0; }
    .mosque-name { font-weight: 700; font-size: 1em; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .date-gregorian { font-size: 0.82em; color: var(--mt-text-muted); }
    .date-hijri { font-size: 0.78em; color: var(--mt-accent); margin-top: 1px; }

    .tomorrow-label { display: inline-block; font-size: 0.68em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mt-accent); background: color-mix(in srgb, var(--mt-accent) 12%, transparent); border-radius: 4px; padding: 1px 6px; margin-bottom: 2px; }

    /* Daily view */
    .prayers-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
    .prayer-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: calc(var(--mt-radius) - 4px); background: var(--mt-bg-card); border: 1px solid var(--mt-border); transition: background 0.2s; }
    .prayer-row.next { background: var(--mt-accent); border-color: var(--mt-accent); color: var(--mt-accent-text); }
    .prayer-row.next .time-label { color: var(--mt-accent-text); opacity: 0.75; }
    .prayer-icon { width: 26px; height: 26px; flex-shrink: 0; opacity: 0.85; }
    .prayer-name { font-weight: 600; font-size: 0.95em; flex: 1; }
    .times-group { display: flex; gap: 20px; }
    .time-block { text-align: center; }
    .time-label { font-size: 0.67em; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mt-text-muted); margin-bottom: 1px; }
    .time-value { font-size: 0.9em; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

    /* Daily row (horizontal) layout */
    .prayers-row { display: flex; gap: 8px; padding: 12px 16px; overflow-x: auto; }
    .prayer-card { flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; padding: 14px 8px 12px; border-radius: calc(var(--mt-radius) - 4px); background: var(--mt-bg-card); border: 1px solid var(--mt-border); text-align: center; gap: 0; }
    .prayer-card.next { background: var(--mt-accent); border-color: var(--mt-accent); color: var(--mt-accent-text); }
    .prayer-card .prayer-icon { width: 24px; height: 24px; flex-shrink: 0; opacity: 0.85; margin-bottom: 7px; }
    .prayer-card .prayer-name { font-weight: 600; font-size: 0.8em; margin-bottom: 10px; }
    .card-times { width: 100%; border-top: 1px solid var(--mt-border); padding-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .prayer-card.next .card-times { border-top-color: rgba(255,255,255,0.25); }
    .card-adhan  { font-size: 0.95em; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .card-iqamah { font-size: 0.78em; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mt-text-muted); }
    .prayer-card.next .card-iqamah { color: var(--mt-accent-text); opacity: 0.75; }

    /* Monthly view */
    .monthly-wrap { overflow-x: auto; }
    table.monthly { width: 100%; border-collapse: collapse; font-size: 0.8em; }
    table.monthly th { background: var(--mt-bg-card); color: var(--mt-text-muted); font-weight: 600; padding: 10px 6px; text-align: center; border-bottom: 2px solid var(--mt-border); white-space: nowrap; }
    table.monthly th.th-prayer { border-right: 1px solid var(--mt-border); border-left: 1px solid var(--mt-border); border-bottom: 1px solid var(--mt-border); }
    table.monthly th.th-sub { font-size: 0.85em; font-weight: 500; padding: 4px 6px; border-bottom: 2px solid var(--mt-border); }
    table.monthly td { padding: 6px; text-align: center; border-bottom: 1px solid var(--mt-border); font-variant-numeric: tabular-nums; white-space: nowrap; }
    table.monthly .td-split-last { border-right: 1px solid var(--mt-border); }
    table.monthly tr.today td { background: var(--mt-bg-highlight); }
    table.monthly tr.today td.day-num { color: var(--mt-accent); font-weight: 700; }
    .day-num { font-weight: 700; min-width: 22px; }
    .sub { font-size: 0.875em; color: var(--mt-text-muted); display: block; white-space: nowrap; }
    .t-primary   { font-size: 1.025em; font-weight: 700; display: block; }
    .t-secondary { font-size: 0.9em; color: var(--mt-text-muted); display: block; margin-top: 1px; }
    .t-equal     { font-size: 0.975em; font-weight: 600; display: block; }
    .t-muted     { font-size: 0.9375em; color: var(--mt-text-muted); display: block; }
    td.td-hl { font-weight: 700; }
    .hl-primary { font-weight: 700; }
    .hl-dim     { font-weight: 400; opacity: 0.5; }
    .card-adhan.hl-dim      { font-size: 0.78em; }
    .card-iqamah.hl-primary { font-size: 0.95em; color: inherit; }
    .day-name-col { color: var(--mt-text-muted); font-size: 0.9375em; white-space: nowrap; border-right: 1px solid var(--mt-border); }
    .hijri-col { color: var(--mt-accent); font-size: 0.975em; min-width: 30px; border-right: 1px solid var(--mt-border); }

    /* States */
    .state-msg { padding: 32px 16px; text-align: center; color: var(--mt-text-muted); font-size: 0.9em; }
    .spinner { display: inline-block; width: 22px; height: 22px; border: 3px solid var(--mt-border); border-top-color: var(--mt-accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sticky day-number column */
    table.monthly thead th:first-child,
    table.monthly tbody td.day-num {
      position: sticky; left: 0; z-index: 1;
      background: var(--mt-bg-card);
      border-right: 1px solid var(--mt-border);
    }
    table.monthly tbody td.day-num { background: var(--mt-bg); }
    table.monthly tr.today td.day-num { background: var(--mt-bg-highlight); }

    /* Container query breakpoints */
    @container (max-width: 500px) {
      .prayers-row { flex-direction: column; overflow-x: visible; gap: 6px; padding: 10px 14px; }
      .prayer-card { flex-direction: row; align-items: center; text-align: start; min-width: unset; padding: 10px 12px; gap: 10px; }
      .prayer-card .prayer-icon { margin-bottom: 0; }
      .prayer-card .prayer-name { flex: 1; margin-bottom: 0; font-size: 0.95em; text-align: start; }
      .card-times { border-top: none; border-inline-start: 1px solid var(--mt-border); padding-top: 0; padding-inline-start: 12px; width: auto; flex-direction: row; gap: 16px; align-items: center; }
      .prayer-card.next .card-times { border-inline-start-color: rgba(255,255,255,0.25); }
    }
    @container (max-width: 400px) {
      .header { padding: 12px 14px 10px; gap: 10px; }
      .header-logo { width: 38px; height: 38px; }
      .mosque-name { font-size: 0.92em; }
      .date-gregorian { font-size: 0.76em; }
      .date-hijri { font-size: 0.72em; }
      .prayers-list { padding: 8px 10px; gap: 6px; }
      .prayer-row { padding: 8px 10px; gap: 10px; }
      .prayer-name { font-size: 0.88em; }
      .time-value { font-size: 0.84em; }
      .time-label { font-size: 0.62em; }
      .times-group { gap: 12px; }
      table.monthly { font-size: 0.74em; }
      table.monthly th { padding: 8px 4px; }
      table.monthly td { padding: 5px 4px; }
    }
    @container (max-width: 300px) {
      .prayer-icon { display: none; }
      .prayer-row { padding: 7px 10px; }
      .times-group { flex-direction: column; gap: 4px; align-items: flex-end; }
      .time-block { display: flex; align-items: center; gap: 6px; }
      .time-label { margin-bottom: 0; }
    }

    /* ── Compact layout ─────────────────────────────────────────────────────── */
    .ct-table { display: grid; padding: 8px 12px 10px; row-gap: 0; }
    .ct-head-row { display: contents; }
    .ct-head-row > * { padding: 4px 6px 6px; font-size: 0.65em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--mt-text-muted); border-bottom: 2px solid var(--mt-border); }
    .ct-row { display: contents; }
    .ct-row > * { display: flex; align-items: center; padding: 8px 6px; border-bottom: 1px solid var(--mt-border); font-size: 0.88em; }
    .ct-row.next > * { background: color-mix(in srgb, var(--mt-accent) 10%, transparent); }
    .ct-row.next > *:first-child { border-inline-start: 3px solid var(--mt-accent); padding-inline-start: 3px; }
    .ct-icon { width: 1.1em; height: 1.1em; flex-shrink: 0; color: var(--mt-text-muted); }
    .ct-row.next .ct-icon { color: var(--mt-accent); }
    .ct-name { font-weight: 600; font-size: 0.92em; white-space: nowrap; padding-inline-end: 8px; flex: 1; }
    .ct-col-head:not(:first-child), .ct-time { justify-content: flex-end; text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
    @container (max-width: 300px) { .ct-table { padding: 6px 8px; } .ct-row > * { padding: 6px 4px; } }

    /* ── Focused layout ──────────────────────────────────────────────────────── */
    .fc-wrap { display: flex; flex-direction: column; }
    .fc-hero { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 28px 24px 22px; background: var(--mt-accent); color: var(--mt-accent-text); gap: 4px; min-height: 8em; }
    .fc-hero-icon { width: 2.4em; height: 2.4em; opacity: 0.9; margin-bottom: 4px; }
    .fc-hero-name { font-size: 0.8em; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .fc-hero-time { font-size: 3.2em; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.05; letter-spacing: -0.5px; }
    .fc-hero-secondary { display: flex; align-items: center; gap: 6px; font-size: 0.78em; opacity: 0.72; margin-top: 4px; }
    .fc-sec-label { font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    .fc-sec-time { font-variant-numeric: tabular-nums; }
    .fc-strip { display: flex; overflow-x: auto; border-top: 2px solid var(--mt-border); scrollbar-width: thin; scrollbar-color: var(--mt-border) transparent; }
    .fc-chip { flex: 1; min-width: 4.5em; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 6px; gap: 3px; background: var(--mt-bg-card); border-inline-end: 1px solid var(--mt-border); }
    .fc-chip:last-child { border-inline-end: none; }
    .fc-chip.next { background: var(--mt-bg-highlight); }
    .fc-chip-icon { width: 1.1em; height: 1.1em; color: var(--mt-text-muted); margin-bottom: 1px; }
    .fc-chip.next .fc-chip-icon { color: var(--mt-accent); }
    .fc-chip-name { font-size: 0.68em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--mt-text-muted); white-space: nowrap; }
    .fc-chip.next .fc-chip-name { color: var(--mt-accent); }
    .fc-chip-time { font-size: 0.78em; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .fc-chip.next .fc-chip-time { color: var(--mt-accent); }
    .fc-chip-iqamah { font-size: 0.68em; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mt-text-muted); }
    @container (max-width: 340px) { .fc-hero { padding: 20px 16px 18px; min-height: 6.5em; } .fc-hero-time { font-size: 2.4em; } .fc-hero-icon { width: 1.8em; height: 1.8em; } .fc-chip { min-width: 3.6em; padding: 8px 4px; } }
    @container (min-width: 500px) { .fc-hero-time { font-size: 4em; } }
    .rtl .fc-strip { flex-direction: row-reverse; }

    /* RTL */
    .rtl { direction: rtl; }
    .rtl .header { flex-direction: row-reverse; }
    .rtl .prayer-row { flex-direction: row-reverse; }
    .rtl .times-group { flex-direction: row-reverse; }
    .rtl table.monthly th, .rtl table.monthly td { direction: rtl; }
    .rtl table.monthly thead th:first-child,
    .rtl table.monthly tbody td.day-num { left: auto; right: 0; }
  `
}

customElements.define('masjid-prayer-times', MasjidPrayerTimes)
