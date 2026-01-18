'use client'

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useCallback, useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }

// Setup the localizer
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
    getDay,
    locales,
})

export interface BloodWorkEvent {
    id: string
    title: string
    start: Date
    end: Date
    allDay: boolean
    type: 'scheduled' | 'completed' | 'requested'
    status?: string
    data?: unknown
}

interface BloodWorkCalendarProps {
    events: BloodWorkEvent[]
    onSelectEvent?: (event: BloodWorkEvent) => void
}

export function BloodWorkCalendar({ events, onSelectEvent }: BloodWorkCalendarProps) {
    // CRITICAL: Use controlled state pattern to fix Next.js navigation button issues
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<View>(Views.MONTH)

    const onNavigate = useCallback((newDate: Date) => {
        setDate(newDate)
    }, [])

    const onView = useCallback((newView: View) => {
        setView(newView)
    }, [])

    // Color events by type
    const eventPropGetter = useCallback((event: BloodWorkEvent) => {
        let backgroundColor = 'hsl(25 95% 53%)' // default orange for scheduled

        if (event.type === 'completed') {
            backgroundColor = 'hsl(142 76% 36%)' // green for completed
        } else if (event.type === 'requested') {
            backgroundColor = 'hsl(221 83% 53%)' // blue for requested
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                border: 'none',
                color: 'white',
            },
        }
    }, [])

    const { views } = useMemo(() => ({
        views: [Views.MONTH, Views.WEEK, Views.AGENDA] as View[],
    }), [])

    return (
        <div className="h-[600px] mt-6">
            <Calendar
                localizer={localizer}
                events={events}
                date={date}
                view={view}
                views={views}
                onNavigate={onNavigate}
                onView={onView}
                onSelectEvent={onSelectEvent}
                startAccessor="start"
                endAccessor="end"
                eventPropGetter={eventPropGetter}
                popup
                showMultiDayTimes
            />
        </div>
    )
}
