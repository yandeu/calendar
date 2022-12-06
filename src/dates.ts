import { TIMEZONE } from './config.js'

interface MonthDate {
  dateTime: Date
  month: string
}

/** converts to YYYY-MM-DD */
export const toYYYYMMDD = (date: Date): string => {
  return date.toLocaleString('en-GB', { timeZone: TIMEZONE }).slice(0, 10).split('/').reverse().join('-')

  // const year = date.toLocaleString('default', { year: 'numeric' })
  // const month = date.toLocaleString('default', { month: '2-digit' })
  // const day = date.toLocaleString('default', { day: '2-digit' })

  // console.log(year + '-' + month + '-' + day, d)
  // return year + '-' + month + '-' + day
}

export const getCurrentCalenderMonth = (offset: number = 0): MonthDate[] => {
  // now
  const now = new Date()

  // adjust now by month offset
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)

  const dates: MonthDate[] = []

  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  // add dates of previous month (as filler)
  let _dow = firstDayOfMonth.getDay()
  if (_dow === 0) _dow = 7
  while (_dow > 1) {
    _dow--
    const d = new Date(date.getFullYear(), date.getMonth(), 1 - _dow)
    dates.push({ dateTime: d, month: 'prev' })
  }

  // add dates of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    dates.push({ dateTime: new Date(date.getFullYear(), date.getMonth(), i), month: 'current' })
  }

  // add dates of next month (as filler)
  _dow = lastDayOfMonth.getDay()
  while (_dow < 7) {
    _dow++
    const d = new Date(date.getFullYear(), date.getMonth() + 1, _dow - lastDayOfMonth.getDay())
    dates.push({ dateTime: d, month: 'next' })
  }

  return dates
}

export const getMonthName = (month: number) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  return monthNames[month]
}

export const getDayOfWeekName = (day: number) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return dayNames[day]
}

export const isToday = (someDate: Date, today?: Date) => {
  const t = today || new Date()
  return (
    someDate.getDate() == t.getDate() &&
    someDate.getMonth() == t.getMonth() &&
    someDate.getFullYear() == t.getFullYear()
  )
}
