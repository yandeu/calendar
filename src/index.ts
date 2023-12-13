import { TIMEZONE } from './config.js'
import { toYYYYMMDD, getCurrentCalenderMonth, getDayOfWeekName, getMonthName, isToday } from './dates.js'
import { h, onNodeRemove } from './dom.js'
import { makeTestEvents } from './testEvents.js'
import { CalendarEvent, CalendarTime } from './types.js'

export type CalendarClickEventTypes = 'event' | 'box' | 'prev' | 'next'

type CalendarClickEventData<T> = T extends 'event'
  ? CalendarEvent
  : T extends 'box'
  ? string
  : T extends 'prev'
  ? number
  : T extends 'next'
  ? number
  : never

export class Calendar {
  constructor(public config?: { customColors?: [{ regex: RegExp; color: string }] }) {}
  private eventHandlers: Array<<T extends CalendarClickEventTypes>(type: T, data: CalendarClickEventData<T>) => void> =
    []

  public onClick(handler: <T extends CalendarClickEventTypes>(type: T, data: CalendarClickEventData<T>) => void) {
    this.eventHandlers.push(handler)
  }

  private emitEvent<T extends CalendarClickEventTypes>(type: T, data: CalendarClickEventData<T>) {
    this.eventHandlers.forEach(cb => cb(type, data))
  }

  private removeEvents() {
    // @ts-ignore
    this.eventHandlers.forEach(cb => (cb = null))
    this.eventHandlers = []
  }

  public getCurrentCalenderMonth(offset: number = 0) {
    return getCurrentCalenderMonth(offset)
  }

  private async addEventsToDOM(events: CalendarEvent[], currentMonth: Date) {
    const add = (e: CalendarEvent): Promise<void> => {
      return new Promise(resolve => {
        // event in day (not whole day)
        if (e.start.dateTime) {
          const dateTime = new Date(e.start.dateTime)
          const isCurrentMonth = dateTime.getMonth() === currentMonth.getMonth()
          const day = document.querySelector('[data-date="' + toYYYYMMDD(dateTime) + '"]')
          if (day) {
            const time = dateTime.toLocaleTimeString('en-GB', { timeZone: TIMEZONE }).slice(0, 5)
            const summary = e.summary ? e.summary.replace(/^\d{1,2}:\d{1,2}\s/gm, '') : 'no title'
            const event = h('div', null, time + ' ' + summary)
            event.classList.add('event')
            if (!isCurrentMonth) event.classList.add('inactive')

            // color based on summary keywords
            if (/libre/gim.test(summary)) event.classList.add('free')
            if (/urgence/gim.test(summary)) event.classList.add('urgent')
            if (/no title/gim.test(summary)) event.classList.add('error')

            this.config?.customColors?.forEach(c => {
              if (new RegExp(c.regex).test(summary)) {
                event.style.backgroundColor = c.color
              }
            })

            // custom filter
            const filter = false
            if (filter) {
              if (!/libre/gim.test(summary) && !/urgence/gim.test(summary)) event.classList.add('hidden')
            }

            event.addEventListener('click', f => {
              f.stopPropagation()
              this.emitEvent('event', {
                id: e.id,
                start: e.start,
                time,
                summary,
                description: e.description || '',
                updated: e.updated
              })
            })
            day.append(event)
          }
        }
        resolve()
      })
    }

    // add events to calendar
    for (const e of events) {
      await add(e)
    }
  }

  public render(offset: number = 0, events: CalendarEvent[] = []) {
    const c = document.getElementById('calendar')
    if (c) c.remove()

    const today = new Date()
    const dates = this.getCurrentCalenderMonth(offset)

    const calendar = h('div')
    calendar.id = 'calendar'

    // get first day of current month
    const currentMonth = dates.find(d => d.month === 'current')?.dateTime
    if (!currentMonth) return

    const title = h('h3', null, getMonthName(currentMonth.getMonth()) + ' ' + currentMonth.getFullYear())
    const btnPrev = h('button', null, 'prev')
    const btnNext = h('button', null, 'next')

    btnPrev.addEventListener('click', () => {
      this.emitEvent('prev', offset - 1)
    })

    btnNext.addEventListener('click', () => {
      this.emitEvent('next', offset + 1)
    })

    const grid = h('div')
    grid.id = 'grid'

    const wrapper = h('div')
    wrapper.id = 'wrapper'

    // add days of week
    for (let i = 0; i < 7; i++) {
      const spanDayOfWeek = getDayOfWeekName(i)
      const span = h('span', null, spanDayOfWeek)
      const div = h('div', null, span)
      div.classList.add('box', 'dayofweek')
      grid.append(div)
    }

    // add boxes
    for (const [i, date] of dates.entries()) {
      const span = h('span', null, date.dateTime.getDate().toString())
      span.classList.add('date')
      if (isToday(date.dateTime, today)) span.classList.add('today')
      if (date.month !== 'current') span.classList.add('light')
      const div = h('div', null, span)
      div.classList.add('box')
      div.setAttribute('data-date', toYYYYMMDD(date.dateTime))
      div.addEventListener('click', e => {
        e.stopPropagation()
        const boxes = document.querySelectorAll('#calendar #grid .box')
        for (const box of boxes) box.classList.remove('selected')
        div.classList.add('selected')
        this.emitEvent('box', toYYYYMMDD(date.dateTime))
      })
      grid.append(div)
    }

    const div = h('div', null, btnPrev, btnNext, title)
    calendar.append(div)
    calendar.append(wrapper)
    wrapper.append(grid)

    const root = document.getElementById('calendar-root')
    if (root) root.append(calendar)
    else {
      alert('No element with id "calendar-root" found!')
      console.error('No element with id "calendar-root" found!')
      return
    }

    onNodeRemove(root, () => {
      this.removeEvents()
    })

    this.addEventsToDOM(events, currentMonth)
  }
}

export const example = async () => {
  const events = makeTestEvents()
  const calendar = new Calendar({ customColors: [{ regex: /libre/gim, color: '#6d6dff' }] })

  const days = calendar.getCurrentCalenderMonth(0)

  const firstDay = days[0].dateTime
  const lastDay = days[days.length - 1].dateTime

  // get events from firstDay till lastDay from google api of similar
  calendar.render(0, events)

  calendar.onClick((event, data) => {
    if (event === 'next') calendar.render(data as number, events)
    if (event === 'prev') calendar.render(data as number, events)
    if (event === 'event') console.log(data)
    if (event === 'box') console.log(data)
  })
}
