# Phase 9: Blood Work History - Research

**Researched:** 2026-01-18
**Domain:** Recharts v3 for biomarker trend visualization
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Recharts ecosystem for visualizing blood work biomarker trends with reference range bands. The project already has Recharts v3.6.0 installed, but needs the shadcn/ui chart wrapper and React 19 compatibility fix.

Key finding: Use `ReferenceArea` component to display normal/optimal reference ranges as highlighted bands behind the data line. This provides clear visual context for whether values are in/out of range over time.

**Primary recommendation:** Add shadcn/ui chart component for consistent styling, fix React 19 compatibility via `react-is` override, use LineChart with ReferenceArea for biomarker trends showing reference ranges.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.6.0 | Chart rendering | Already installed, standard React charting |
| date-fns | 4.1.0 | Date formatting | Already installed, for x-axis labels |

### Supporting (To Add)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui chart | latest | Chart wrapper + theming | Consistent styling with app theme |
| react-is | 19.x | React 19 compatibility | Required for Recharts with React 19 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory | Victory more complex, Recharts already installed |
| Recharts | Chart.js | Chart.js not React-native, Recharts better DX |
| Recharts | Tremor | Tremor opinionated, Recharts more flexible |

**Installation:**
```bash
# Add shadcn/ui chart component
npx shadcn@latest add chart

# Fix React 19 compatibility - add to package.json
npm install react-is@19.2.3
# Then add overrides (see pitfalls section)
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   └── chart.tsx          # shadcn/ui chart wrapper (to add)
│   └── blood-work/
│       ├── biomarker-chart.tsx    # Client component with chart
│       ├── biomarker-card.tsx     # Single biomarker display
│       └── trend-indicator.tsx    # Up/down/stable indicator
├── app/(dashboard)/patient/blood-work/
│   ├── page.tsx               # Server component (existing)
│   └── [id]/
│       └── page.tsx           # Detail view with charts
└── lib/
    └── utils/
        └── biomarker-utils.ts # Data transformation helpers
```

### Pattern 1: Client Component for Charts
**What:** Charts must be client components in Next.js
**When to use:** Always for Recharts
**Example:**
```typescript
// components/blood-work/biomarker-chart.tsx
"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid,
         Tooltip, ReferenceArea, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BiomarkerChartProps {
  data: { date: string; value: number }[]
  referenceRange: { low: number; high: number }
  unit: string
  biomarkerName: string
}

export function BiomarkerChart({ data, referenceRange, unit, biomarkerName }: BiomarkerChartProps) {
  const chartConfig = {
    value: { label: biomarkerName, color: "hsl(var(--chart-1))" }
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis unit={unit} tickLine={false} axisLine={false} />

        {/* Reference range band */}
        <ReferenceArea
          y1={referenceRange.low}
          y2={referenceRange.high}
          fill="hsl(var(--chart-2))"
          fillOpacity={0.1}
          label={{ value: "Normal Range", position: "insideTopRight" }}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{ fill: "var(--color-value)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </LineChart>
    </ChartContainer>
  )
}
```

### Pattern 2: Data Transformation for Charts
**What:** Transform blood_work records into chart-ready format
**When to use:** Before passing to chart components
**Example:**
```typescript
// lib/utils/biomarker-utils.ts
import { format } from "date-fns"
import type { BloodWork, BiomarkerValue } from "@/types/database"

export function getBiomarkerTrend(
  records: BloodWork[],
  biomarkerKey: string
): { date: string; value: number }[] {
  return records
    .filter(r => r.biomarkers?.[biomarkerKey])
    .map(r => ({
      date: format(new Date(r.date), "MMM yyyy"),
      value: (r.biomarkers![biomarkerKey] as BiomarkerValue).value
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getUniqueBiomarkers(records: BloodWork[]): string[] {
  const biomarkers = new Set<string>()
  records.forEach(r => {
    if (r.biomarkers) {
      Object.keys(r.biomarkers).forEach(k => biomarkers.add(k))
    }
  })
  return Array.from(biomarkers).sort()
}
```

### Pattern 3: Server Component Fetches, Client Component Renders
**What:** Keep data fetching in server components, pass to client chart
**When to use:** Always in Next.js App Router
**Example:**
```typescript
// app/(dashboard)/patient/blood-work/[id]/page.tsx
import { BiomarkerChart } from "@/components/blood-work/biomarker-chart"
import { getBiomarkerTrend } from "@/lib/utils/biomarker-utils"

export default async function BloodWorkDetailPage({ params }: { params: { id: string } }) {
  // Server: fetch data
  const records = await getPatientBloodWork(patientId)
  const trendData = getBiomarkerTrend(records, "Testosterone")

  // Pass processed data to client component
  return (
    <BiomarkerChart
      data={trendData}
      referenceRange={{ low: 300, high: 1000 }}
      unit="ng/dL"
      biomarkerName="Testosterone"
    />
  )
}
```

### Anti-Patterns to Avoid
- **Importing Recharts in server components:** Will cause hydration errors
- **Using ResponsiveContainer without min-height:** Chart won't render
- **Fetching data in chart component:** Violates server/client boundary
- **Not using ReferenceArea for ranges:** Missed opportunity for context
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reference range bands | CSS positioned divs | `ReferenceArea` | Coordinate-aware, handles scale changes |
| Date formatting on axis | Manual string manipulation | `date-fns` + `tickFormatter` | Handles locales, edge cases |
| Responsive charts | Manual resize listeners | `ResponsiveContainer` | Handles resize, debouncing |
| Tooltip styling | Custom positioned div | `ChartTooltip` from shadcn | Themed, accessible, positioned |
| Chart theming | Inline colors | shadcn chart config | Dark mode, consistent with app |
| Trend calculation | Array reduce in component | Utility function | Reusable, testable, memoizable |

**Key insight:** Recharts provides coordinate-aware reference components (`ReferenceLine`, `ReferenceArea`, `ReferenceDot`) that automatically adapt to scale changes and zooming. Building custom overlay divs will break when the chart scale changes.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: React 19 Compatibility
**What goes wrong:** Charts render empty or don't render at all
**Why it happens:** `react-is` dependency mismatch with React 19
**How to avoid:** Add overrides to package.json:
```json
{
  "dependencies": {
    "react-is": "19.2.3"
  },
  "overrides": {
    "react-is": "$react-is"
  }
}
```
**Warning signs:** Empty chart container, no console errors

### Pitfall 2: ResponsiveContainer Height
**What goes wrong:** Chart doesn't appear
**Why it happens:** ResponsiveContainer needs explicit height
**How to avoid:** Always set min-height on container:
```tsx
<ChartContainer className="min-h-[200px] w-full">
```
**Warning signs:** Container exists but has 0 height

### Pitfall 3: Server Component Import
**What goes wrong:** "window is not defined" or hydration mismatch
**Why it happens:** Recharts uses browser APIs
**How to avoid:** Always use "use client" directive for chart components
**Warning signs:** Build errors, SSR crashes

### Pitfall 4: Data Key Mismatch
**What goes wrong:** Line doesn't render, no data shown
**Why it happens:** dataKey doesn't match object property
**How to avoid:** Verify data structure matches dataKey props:
```tsx
// Data: [{ date: "Jan", value: 500 }]
<Line dataKey="value" />  // Correct
<Line dataKey="Value" />  // Wrong - case sensitive
```
**Warning signs:** Empty chart with axes but no data

### Pitfall 5: Missing Chart Config
**What goes wrong:** Colors don't apply, legend shows raw keys
**Why it happens:** shadcn ChartContainer expects config object
**How to avoid:** Always define chartConfig with labels and colors
**Warning signs:** Generic gray colors, dataKey shown instead of label
</common_pitfalls>

<code_examples>
## Code Examples

### Basic Biomarker Line Chart with Reference Range
```typescript
// Source: Recharts docs + shadcn patterns
"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid,
         ReferenceArea, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "Jan 2025", value: 450 },
  { date: "Apr 2025", value: 520 },
  { date: "Jul 2025", value: 480 },
  { date: "Oct 2025", value: 510 },
]

const chartConfig = {
  value: { label: "Testosterone", color: "hsl(var(--chart-1))" }
}

export function TestosteroneChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <LineChart data={data} accessibilityLayer margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          domain={[200, 800]}
        />

        {/* Normal range: 300-1000 ng/dL */}
        <ReferenceArea
          y1={300}
          y2={700}
          fill="hsl(142.1 76.2% 36.3%)"  /* green-600 */
          fillOpacity={0.1}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />

        <ChartTooltip
          content={<ChartTooltipContent labelKey="date" />}
        />
      </LineChart>
    </ChartContainer>
  )
}
```

### Multiple Biomarkers Comparison
```typescript
// Source: Recharts multi-line pattern
"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  totalTestosterone: { label: "Total T", color: "hsl(var(--chart-1))" },
  freeTestosterone: { label: "Free T", color: "hsl(var(--chart-2))" },
  estradiol: { label: "E2", color: "hsl(var(--chart-3))" },
}

export function MultipleMarkersChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis />

        <Line type="monotone" dataKey="totalTestosterone" stroke="var(--color-totalTestosterone)" />
        <Line type="monotone" dataKey="freeTestosterone" stroke="var(--color-freeTestosterone)" />
        <Line type="monotone" dataKey="estradiol" stroke="var(--color-estradiol)" />

        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  )
}
```

### Biomarker Card with Trend Indicator
```typescript
// Source: Healthcare UX patterns
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BiomarkerCardProps {
  name: string
  value: number
  unit: string
  previousValue?: number
  referenceRange: { low: number; high: number }
  flag: "normal" | "high" | "low" | null
}

export function BiomarkerCard({ name, value, unit, previousValue, referenceRange, flag }: BiomarkerCardProps) {
  const trend = previousValue ? value - previousValue : 0
  const trendPercent = previousValue ? ((trend / previousValue) * 100).toFixed(1) : null

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{name}</span>
        {flag && (
          <Badge variant={flag === "high" ? "destructive" : flag === "low" ? "secondary" : "default"}>
            {flag}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      {trendPercent && (
        <div className="flex items-center gap-1 mt-1 text-sm">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : ""}>
            {trend > 0 ? "+" : ""}{trendPercent}%
          </span>
          <span className="text-muted-foreground">vs last</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-2">
        Range: {referenceRange.low} - {referenceRange.high} {unit}
      </div>
    </div>
  )
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 | Recharts v3 | 2024 | Better TypeScript, tree-shaking |
| Manual theming | shadcn chart config | 2024 | Dark mode, consistent styling |
| Victory/Chart.js | Recharts with shadcn | 2024 | Better React integration |
| Custom tooltips | ChartTooltip component | 2024 | Accessible, themed |

**New tools/patterns to consider:**
- **shadcn/ui chart component**: Wraps Recharts with theme-aware config pattern
- **React 19 + Recharts**: Requires react-is override (documented fix)
- **accessibilityLayer prop**: New in Recharts for keyboard navigation

**Deprecated/outdated:**
- **Recharts ResponsiveContainer alone**: Use ChartContainer from shadcn for theming
- **Inline color strings**: Use CSS variables via chart config
</sota_updates>

<open_questions>
## Open Questions

1. **Biomarker Reference Ranges**
   - What we know: Each biomarker has reference_low/reference_high in data
   - What's unclear: Are ranges age/gender specific? Static or dynamic?
   - Recommendation: Start with static ranges from data, plan for dynamic later

2. **Chart Interactions**
   - What we know: Can add click handlers, brush for zoom
   - What's unclear: Do users need to compare specific dates? Zoom?
   - Recommendation: Start simple (tooltip only), add interactions if requested

3. **Multi-biomarker Normalization**
   - What we know: Different biomarkers have vastly different scales
   - What's unclear: How to show multiple biomarkers on one chart
   - Recommendation: Use separate charts per biomarker, or normalize to % of range
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [recharts/recharts GitHub](https://github.com/recharts/recharts) - Library source
- [shadcn/ui Chart docs](https://ui.shadcn.com/docs/components/chart) - Chart component setup
- [Recharts ReferenceArea API](https://recharts.github.io/en-US/api/ReferenceArea/) - Reference band docs

### Secondary (MEDIUM confidence)
- [shadcn/ui React 19 docs](https://ui.shadcn.com/docs/react-19) - React 19 compatibility fix
- [How to Fix Recharts with React 19](https://www.bstefanski.com/blog/recharts-empty-chart-react-19) - Verified fix pattern
- [Visualizing reference ranges](https://www.danielsarmiento.com/posts/visualizing-reference-ranges/) - Medical data viz patterns

### Tertiary (LOW confidence - needs validation)
- Healthcare app UX patterns from Dribbble/Medium - Design inspiration only
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Recharts v3 with shadcn/ui wrapper
- Ecosystem: date-fns for dates, Lucide for icons
- Patterns: ReferenceArea for ranges, client component architecture
- Pitfalls: React 19 compat, ResponsiveContainer height, SSR

**Confidence breakdown:**
- Standard stack: HIGH - Recharts already installed, shadcn documented
- Architecture: HIGH - Standard Next.js patterns
- Pitfalls: HIGH - Well-documented React 19 issues
- Code examples: HIGH - From official docs/patterns

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - Recharts ecosystem stable)
</metadata>

---

*Phase: 09-blood-work-history*
*Research completed: 2026-01-18*
*Ready for planning: yes*
