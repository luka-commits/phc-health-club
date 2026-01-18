'use client'

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useCallback, useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
})

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: 'refill' | 'bloodwork'
  data?: unknown
}

interface RefillCalendarProps {
  events: CalendarEvent[]
}

export function RefillCalendar({ events }: RefillCalendarProps) {
  // CRITICAL: Use controlled state pattern to fix Next.js navigation button issues
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)

  const onNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const onView = useCallback((newView: View) => {
    setView(newView)
  }, [])

  // Color events by type: refill = green, bloodwork = orange
  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: event.type === 'refill'
        ? 'hsl(142 76% 36%)' // green for refills
        : 'hsl(25 95% 53%)',  // orange for bloodwork
      borderRadius: '4px',
      border: 'none',
      color: 'white',
    },
  }), [])

  const { views } = useMemo(() => ({
    views: [Views.MONTH, Views.WEEK, Views.AGENDA] as View[],
  }), [])

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        views={views}
        onNavigate={onNavigate}
        onView={onView}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventPropGetter}
        popup
        showMultiDayTimes
      />
    </div>
  )
}
