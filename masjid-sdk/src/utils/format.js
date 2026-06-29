import { I18N } from './i18n.js'
import { gregorianToHijri } from './hijri.js'

export function to24h(timeStr) {
  if (!timeStr) return ''
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return timeStr
  let h = parseInt(m[1], 10)
  const min = m[2]
  const period = m[3].toUpperCase()
  if (period === 'AM' && h === 12) h = 0
  if (period === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${min}`
}

export function formatTime(timeStr, fmt, lang, showPeriod = false, periodHint = '') {
  if (!timeStr) return '—'
  if (fmt === '24h') return to24h(timeStr)
  if (timeStr === '-' || timeStr === '—') return timeStr

  let formatted = String(timeStr).trim()
  const hasPeriod = /\s*(AM|PM)$/i.test(formatted)
  if (showPeriod && !hasPeriod && periodHint) {
    formatted = `${formatted} ${periodHint}`
  } else if (!showPeriod && hasPeriod) {
    formatted = formatted.replace(/\s*(AM|PM)$/i, '')
  }

  if (lang === 'ar') return formatted.replace(/AM/i, 'ص').replace(/PM/i, 'م')
  return formatted
}

export function formatGregorian(date, fmt, lang) {
  const t = I18N[lang] || I18N.en
  const M  = t.months[date.getMonth()]
  const D  = date.getDate()
  const Y  = date.getFullYear()
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const DD = String(D).padStart(2, '0')
  return fmt
    .replace('MMMM', M)
    .replace('MMM',  M.slice(0, 3))
    .replace('MM',   MM)
    .replace('YYYY', Y)
    .replace('DD',   DD)
    .replace('D',    D)
}

export function formatHijri(date, lang) {
  const h = gregorianToHijri(date)
  const t = I18N[lang] || I18N.en
  return `${h.day} ${t.hijriMonths[h.month - 1]} ${h.year}`
}

function parseToMin(timeStr) {
  if (!timeStr) return -1
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return -1
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const period = m[3].toUpperCase()
  if (period === 'AM' && h === 12) h = 0
  if (period === 'PM' && h !== 12) h += 12
  return h * 60 + min
}

export function getNextPrayer(times, prayers) {
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  for (const p of prayers) {
    // Use iqamah as the cutover — prayer is "done" once iqamah passes
    const t = times[`${p}_iqamah`] || times[`${p}_azaan`]
    if (parseToMin(t) > nowMin) return p
  }
  return prayers[0] // wrapped to next day
}

// Returns { prayer, isNextDay } for header display
export function getNextPrayerInfo(times, prayers) {
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  for (const p of prayers) {
    const t = times[`${p}_iqamah`] || times[`${p}_azaan`]
    if (parseToMin(t) > nowMin) return { prayer: p, isNextDay: false }
  }
  return { prayer: prayers[0], isNextDay: true }
}
