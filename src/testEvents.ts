import { CalendarEvent } from './types.js'

export const makeTestEvents = (): CalendarEvent[] => {
  const now = new Date()

  const randomDate = () => {
    const m = Math.ceil(Math.random() * 3) - 2
    const d = Math.ceil(Math.random() * 30)

    const date = new Date(now.getFullYear(), now.getMonth() + m, d)

    const h = Math.ceil(Math.random() * 9) * 8
    const min = Math.floor(Math.random() * 4)
    date.setHours(h, min * 15, 0)
    return date
  }

  const events = []
  for (let i = 0; i < 300; i++) {
    const event: CalendarEvent = {
      id: 'random',
      start: {
        // date: toYYYYMMDD(date),
        dateTime: randomDate(),
        timeZone: 'Europe/Zurich'
      },
      description: '',
      summary: Math.random() > 0.98 ? 'URGENCE' : Math.random() > 0.9 ? 'LIBRE' : 'Test Event'
    }
    events.push(event)
  }

  return events
}
