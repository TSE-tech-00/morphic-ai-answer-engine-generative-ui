export type DecodedIntent = {
  textQuery?: string
  checkin?: string
  checkout?: string
  adults?: number
  children?: number
}

const dateISO = /\b(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])\b/
const adultsRe = /\b(\d+)\s+adult(s)?\b/i
const childrenRe = /\b(\d+)\s+child(ren)?\b/i

export function decodeIntentFromText(text: string): DecodedIntent {
  const out: DecodedIntent = {}
  const lower = text.toLowerCase()

  // Dates
  const dates = text.match(new RegExp(dateISO, 'g'))
  if (dates && dates.length >= 1) {
    out.checkin = dates[0]
    if (dates.length >= 2) out.checkout = dates[1]
  }

  // Fallback: “next weekend”
  if (!out.checkin && /next weekend/i.test(text)) {
    const { checkin, checkout } = nextWeekendRange()
    out.checkin = checkin
    out.checkout = checkout
  }

  // Occupancy
  const a = text.match(adultsRe)
  if (a) out.adults = parseInt(a[1], 10)
  const c = text.match(childrenRe)
  if (c) out.children = parseInt(c[1], 10)

  // Very simple location heuristic: take the first capitalized token sequence
  // if user didn't provide a placeId. This is a fallback; use Places API for accuracy.
  const locMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/)
  if (locMatch) out.textQuery = locMatch[1]

  return out
}

function nextWeekendRange() {
  const now = new Date()
  const day = now.getDay() // 0 Sun .. 6 Sat
  const daysUntilSaturday = (6 - day + 7) % 7 || 7 // next Saturday (ensure future)
  const saturday = addDays(startOfDay(now), daysUntilSaturday)
  const sunday = addDays(saturday, 1)
  return {
    checkin: saturday.toISOString().slice(0, 10),
    checkout: sunday.toISOString().slice(0, 10)
  }
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}


