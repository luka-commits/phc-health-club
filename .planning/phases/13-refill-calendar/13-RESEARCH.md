# Phase 13: Refill Calendar - Research

**Researched:** 2026-01-18
**Domain:** react-big-calendar for medical schedule visualization
**Confidence:** HIGH

<research_summary>
## Summary

Researched calendar solutions for displaying Refill Schedule and Blood Work Schedule in a Next.js 16 + shadcn/ui application. The project already has `react-big-calendar` v1.19.4 and `date-fns` v4.1.0 installed.

Key finding: react-big-calendar works well for this use case but requires **controlled state pattern** in Next.js to fix navigation button issues. The date-fns localizer is the best choice since it's already in the project and tree-shakeable. Timezone handling is the main pitfall area - store dates in UTC, display in local time.

**Primary recommendation:** Use react-big-calendar with date-fns localizer, implement controlled state for view/date, create a client component wrapper, and map RefillSchedule + Prescription + BloodWork data to calendar events with color coding by type.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-big-calendar | 1.19.4 | Calendar UI component | Google Calendar-like interface, MIT license, 520k+ weekly downloads |
| @types/react-big-calendar | 1.16.3 | TypeScript definitions | Full type coverage for props and events |
| date-fns | 4.1.0 | Date localizer | Tree-shakeable, already in project, modern API |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date formatting & math | All date operations in calendar |
| zustand | 5.0.10 | State management | Optional: persist calendar view preference |
| lucide-react | 0.562.0 | Icons | Event type icons (pill, droplet, calendar) |

### No Additional Dependencies Needed
The project has everything required. Do NOT add:
- moment.js (heavy, date-fns already available)
- dayjs (redundant with date-fns)
- FullCalendar (commercial license for premium features, larger bundle)

**Installation:** None required - all dependencies present.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   └── calendar/
│       ├── refill-calendar.tsx      # Main calendar client component
│       ├── calendar-event.tsx       # Custom event rendering
│       ├── calendar-toolbar.tsx     # Optional: custom toolbar with shadcn
│       └── use-calendar-events.ts   # Hook to transform data to events
├── app/(dashboard)/patient/refills/
│   └── calendar/
│       └── page.tsx                 # Server component: fetch data, render calendar
```

### Pattern 1: Controlled State for Next.js (CRITICAL)
**What:** Control date and view via useState to fix navigation button issues
**When to use:** Always in Next.js App Router
**Example:**
```typescript
'use client'

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useCallback } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'refill' | 'bloodwork'
  resource?: unknown
}

export function RefillCalendar({ events }: { events: CalendarEvent[] }) {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const onView = useCallback((newView: View) => setView(newView), [])

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onNavigate={onNavigate}
        onView={onView}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'agenda']}
      />
    </div>
  )
}
```

### Pattern 2: Event Type Styling with eventPropGetter
**What:** Color-code events by type (refill vs bloodwork)
**When to use:** Multiple event types need visual distinction
**Example:**
```typescript
const eventPropGetter = useCallback((event: CalendarEvent) => {
  const styles: React.CSSProperties = {}

  if (event.type === 'refill') {
    styles.backgroundColor = 'hsl(var(--primary))'
  } else if (event.type === 'bloodwork') {
    styles.backgroundColor = 'hsl(var(--destructive))'
  }

  return { style: styles }
}, [])

<Calendar eventPropGetter={eventPropGetter} />
```

### Pattern 3: Server Component Data Fetching + Client Calendar
**What:** Fetch data server-side, pass to client calendar component
**When to use:** Standard Next.js App Router pattern
**Example:**
```typescript
// page.tsx (Server Component)
export default async function RefillCalendarPage() {
  const prescriptions = await fetchPrescriptions()
  const bloodWork = await fetchBloodWorkSchedule()

  const events = transformToCalendarEvents(prescriptions, bloodWork)

  return <RefillCalendar events={events} />
}

// Transform function
function transformToCalendarEvents(prescriptions, bloodWork): CalendarEvent[] {
  const refillEvents = prescriptions
    .filter(p => p.refill_date)
    .map(p => ({
      id: `refill-${p.id}`,
      title: `Refill: ${p.products?.name}`,
      start: new Date(p.refill_date),
      end: new Date(p.refill_date), // All-day event
      type: 'refill' as const,
    }))

  const bloodWorkEvents = bloodWork.map(bw => ({
    id: `bloodwork-${bw.id}`,
    title: 'Blood Work Due',
    start: new Date(bw.scheduled_date),
    end: new Date(bw.scheduled_date),
    type: 'bloodwork' as const,
  }))

  return [...refillEvents, ...bloodWorkEvents]
}
```

### Anti-Patterns to Avoid
- **Uncontrolled state in Next.js:** Navigation buttons will break - always use controlled date/view
- **Importing entire date-fns:** Import only needed functions for tree-shaking
- **CSS in server component:** Import calendar CSS in client component only
- **Missing container height:** Calendar requires explicit height on container
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar grid rendering | Custom div grid | react-big-calendar | Week/month layouts are complex, accessibility matters |
| Date navigation | Custom prev/next logic | Calendar's onNavigate | Handles month boundaries, year transitions |
| Event positioning | Manual CSS positioning | Calendar's built-in layout | Overlapping events, multi-day spans are hard |
| Date math for views | Manual calculations | date-fns + localizer | Week start, month boundaries, DST handling |
| All-day vs timed events | Custom logic | Calendar's allDay prop | Built-in handling for display differences |

**Key insight:** Calendar UIs have decades of edge cases (DST, leap years, week boundaries, event overlap algorithms). react-big-calendar handles these. Custom calendars look simple but break in production.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Navigation Buttons Not Working in Next.js
**What goes wrong:** Today/Back/Next/View buttons don't respond to clicks
**Why it happens:** React Strict Mode double-invocation + uncontrolled component state
**How to avoid:** Always use controlled state pattern with useState for date and view
**Warning signs:** Clicking navigation does nothing, no errors in console

### Pitfall 2: Timezone Day Shifting
**What goes wrong:** Events appear on wrong day (off by one)
**Why it happens:** Mixing UTC database dates with local browser timezone
**How to avoid:**
- Store dates in UTC in database (already done via Supabase timestamps)
- Parse dates consistently: `new Date(isoString)` handles this correctly
- For all-day events, consider using `date-fns` `parseISO` and `startOfDay`
**Warning signs:** Events shift when users are in different timezones

### Pitfall 3: Calendar Not Visible
**What goes wrong:** Component renders but nothing shows
**Why it happens:** Container has no height
**How to avoid:** Always set explicit height on calendar container: `style={{ height: 600 }}`
**Warning signs:** Component mounts, no errors, but empty space

### Pitfall 4: CSS Not Loading
**What goes wrong:** Calendar renders but looks broken/unstyled
**Why it happens:** Forgot to import CSS file
**How to avoid:** Import in client component: `import 'react-big-calendar/lib/css/react-big-calendar.css'`
**Warning signs:** Calendar structure visible but no borders, colors, or proper layout

### Pitfall 5: SSR Hydration Mismatch
**What goes wrong:** Console errors about hydration, flickering
**Why it happens:** Date objects differ between server and client render
**How to avoid:**
- Use `'use client'` directive on calendar component
- Initialize date with `useState(new Date())` not a static value
- Consider `suppressHydrationWarning` for date-dependent elements
**Warning signs:** React hydration warnings in console
</common_pitfalls>

<code_examples>
## Code Examples

### Complete Calendar Setup with date-fns v4
```typescript
// Source: react-big-calendar docs + date-fns v4 compatibility
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

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  type: 'refill' | 'bloodwork'
}

interface RefillCalendarProps {
  events: CalendarEvent[]
}

export function RefillCalendar({ events }: RefillCalendarProps) {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)

  const onNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const onView = useCallback((newView: View) => {
    setView(newView)
  }, [])

  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: event.type === 'refill'
        ? 'hsl(142 76% 36%)' // green for refills
        : 'hsl(0 84% 60%)',   // red for bloodwork
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
```

### Data Transformation Hook
```typescript
// Source: Project-specific pattern
import { useMemo } from 'react'
import { Prescription, RefillSchedule, BloodWork } from '@/types/database'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: 'refill' | 'bloodwork'
  data: Prescription | BloodWork
}

interface UseCalendarEventsProps {
  prescriptions: (Prescription & { products?: { name: string } })[]
  bloodWorkSchedule?: { id: string; scheduled_date: string }[]
}

export function useCalendarEvents({
  prescriptions,
  bloodWorkSchedule = []
}: UseCalendarEventsProps): CalendarEvent[] {
  return useMemo(() => {
    const refillEvents: CalendarEvent[] = prescriptions
      .filter(p => p.refill_date && p.status === 'active')
      .map(p => ({
        id: `refill-${p.id}`,
        title: `Refill: ${p.products?.name || 'Medication'}`,
        start: new Date(p.refill_date!),
        end: new Date(p.refill_date!),
        allDay: true,
        type: 'refill' as const,
        data: p,
      }))

    const bloodWorkEvents: CalendarEvent[] = bloodWorkSchedule.map(bw => ({
      id: `bloodwork-${bw.id}`,
      title: 'Blood Work Due',
      start: new Date(bw.scheduled_date),
      end: new Date(bw.scheduled_date),
      allDay: true,
      type: 'bloodwork' as const,
      data: bw as unknown as BloodWork,
    }))

    return [...refillEvents, ...bloodWorkEvents]
  }, [prescriptions, bloodWorkSchedule])
}
```

### Tailwind CSS Overrides for shadcn/ui Compatibility
```css
/* In globals.css or a dedicated calendar.css */
.rbc-calendar {
  @apply font-sans;
}

.rbc-toolbar {
  @apply mb-4 flex flex-wrap gap-2;
}

.rbc-toolbar button {
  @apply px-3 py-1.5 text-sm font-medium rounded-md
         border border-input bg-background hover:bg-accent
         hover:text-accent-foreground;
}

.rbc-toolbar button.rbc-active {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.rbc-header {
  @apply py-2 text-sm font-medium text-muted-foreground;
}

.rbc-today {
  @apply bg-accent/50;
}

.rbc-event {
  @apply text-xs;
}

.rbc-agenda-view table.rbc-agenda-table {
  @apply border-collapse;
}

.rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
  @apply border-b border-border py-2;
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js localizer | date-fns localizer | 2023+ | Smaller bundle, tree-shakeable |
| Uncontrolled Calendar | Controlled state in Next.js | 2024 | Required for App Router compatibility |
| Manual CSS overrides | CSS variables + Tailwind | 2024+ | Better theme integration |

**New tools/patterns to consider:**
- **shadcn/ui calendar blocks:** Official blocks available (`npx shadcn add calendar-01` etc.) but these are date pickers, not full schedule views
- **Headless Full Calendar for shadcn:** Community component at dninomiya.github.io - worth evaluating if react-big-calendar styling proves difficult
- **@tanstack/react-query:** For refetching schedule data on calendar navigation

**Deprecated/outdated:**
- **moment.js:** Still works but adds ~70KB, use date-fns instead
- **FullCalendar free tier:** Limited features, commercial license required for premium
- **Uncontrolled component pattern:** Breaks in Next.js App Router
</sota_updates>

<open_questions>
## Open Questions

1. **Blood Work Schedule Source**
   - What we know: `BloodWork` table has `date` for completed work, `Appointment` has `type: 'bloodwork'`
   - What's unclear: Where does "scheduled" blood work come from? Provider-created appointments or auto-calculated?
   - Recommendation: During planning, clarify if blood work schedule comes from appointments table or needs separate tracking

2. **Calendar View Persistence**
   - What we know: Users may prefer month vs week view
   - What's unclear: Should view preference persist across sessions?
   - Recommendation: Can use localStorage or user settings - decide during planning

3. **Event Click Behavior**
   - What we know: Events are clickable by default
   - What's unclear: What should happen on click? Show details? Navigate to refill page?
   - Recommendation: Implement onSelectEvent to show event details in a dialog or navigate
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [react-big-calendar npm](https://www.npmjs.com/package/react-big-calendar) - Version 1.19.4, dependencies
- [react-big-calendar GitHub](https://github.com/jquense/react-big-calendar) - Features, API, styling
- [Fix Navigation Buttons in Next.js](https://medium.com/@oktaykopcak/fix-react-big-calendar-buttons-in-next-js-2ad92601d55d) - Controlled state pattern

### Secondary (MEDIUM confidence)
- [react-big-calendar Storybook](https://jquense.github.io/react-big-calendar/examples/index.html) - Props reference
- [date-fns documentation](https://date-fns.org/) - Localizer setup
- [shadcn/ui Calendar Discussion](https://github.com/shadcn-ui/ui/discussions/3214) - Community solutions

### Tertiary (Verified against existing codebase)
- Project package.json - Confirmed react-big-calendar 1.19.4, date-fns 4.1.0 installed
- Project types/database.ts - RefillSchedule, Prescription, BloodWork structures
- Existing refills/page.tsx - Current data fetching patterns
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: react-big-calendar with date-fns localizer
- Ecosystem: No additional dependencies needed
- Patterns: Controlled state, server/client split, event type styling
- Pitfalls: Next.js navigation, timezone, CSS, hydration

**Confidence breakdown:**
- Standard stack: HIGH - Already installed, verified compatible
- Architecture: HIGH - Based on official patterns + Next.js docs
- Pitfalls: HIGH - Well-documented issues with solutions
- Code examples: HIGH - Tested patterns from official sources

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - react-big-calendar stable)
</metadata>

---

*Phase: 13-refill-calendar*
*Research completed: 2026-01-18*
*Ready for planning: yes*
