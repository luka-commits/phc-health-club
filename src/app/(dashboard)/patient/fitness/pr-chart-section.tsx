'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRChart } from '@/components/fitness/PRChart';
import type { PersonalRecord, LiftType } from '@/types/database';

interface PRChartSectionProps {
  data: PersonalRecord[];
}

interface LiftConfig {
  key: LiftType;
  label: string;
  tabLabel: string;
  color: string;
}

const LIFTS: LiftConfig[] = [
  { key: 'squat', label: 'Squat', tabLabel: 'Squat', color: 'hsl(var(--chart-1))' },
  { key: 'bench_press', label: 'Bench Press', tabLabel: 'Bench', color: 'hsl(var(--chart-2))' },
  { key: 'deadlift', label: 'Deadlift', tabLabel: 'Deadlift', color: 'hsl(var(--chart-3))' },
  { key: 'overhead_press', label: 'Overhead Press', tabLabel: 'OHP', color: 'hsl(var(--chart-4))' },
  { key: 'barbell_row', label: 'Barbell Row', tabLabel: 'Row', color: 'hsl(var(--chart-5))' },
  { key: 'pull_up', label: 'Pull-up', tabLabel: 'Pull-up', color: 'hsl(142.1 76.2% 36.3%)' },
];

export function PRChartSection({ data }: PRChartSectionProps) {
  const [activeLift, setActiveLift] = useState<LiftType>('squat');

  // Filter data by lift type for the chart
  const filteredData = useMemo(() => {
    return data.filter((record) => record.lift_type === activeLift);
  }, [data, activeLift]);

  // Determine which lifts have data
  const availableLifts = useMemo(() => {
    const liftsWithData = new Set<LiftType>();
    for (const record of data) {
      liftsWithData.add(record.lift_type);
    }
    return liftsWithData;
  }, [data]);

  // If no data at all, show message
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No PR data available yet. Add your first PR to see progress charts.
      </div>
    );
  }

  // If active lift has no data, try to switch to first available
  const activeHasData = availableLifts.has(activeLift);
  const effectiveLift = activeHasData
    ? activeLift
    : (LIFTS.find(l => availableLifts.has(l.key))?.key || activeLift);

  const currentConfig = LIFTS.find((l) => l.key === effectiveLift)!;
  const effectiveData = data.filter((record) => record.lift_type === effectiveLift);

  return (
    <Tabs value={effectiveLift} onValueChange={(v) => setActiveLift(v as LiftType)}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
        {LIFTS.map((lift) => {
          const hasData = availableLifts.has(lift.key);
          return (
            <TabsTrigger
              key={lift.key}
              value={lift.key}
              disabled={!hasData}
              className="text-xs"
            >
              {lift.tabLabel}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {LIFTS.map((lift) => (
        <TabsContent key={lift.key} value={lift.key}>
          <PRChart
            data={data.filter((record) => record.lift_type === lift.key)}
            color={lift.color}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
