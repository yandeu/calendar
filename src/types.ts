/**
 * https://developers.google.com/calendar/api/v3/reference/events
 */

export interface CalendarTime {
  /* yyyy-mm-dd */
  date?: string
  /* RFC 3339 */
  dateTime: Date
  /* Europe/Zurich */
  timeZone: string
}

export interface CalendarEvent {
  kind?: 'calendar#event'
  id: string
  summary: string
  description: string
  start: CalendarTime
  end?: CalendarTime
  created?: Date
  updated?: Date
  time?: any
}
