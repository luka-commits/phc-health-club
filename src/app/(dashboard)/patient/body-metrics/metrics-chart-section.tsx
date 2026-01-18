'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyMetricsChart } from '@/components/body-metrics/BodyMetricsChart';
import type { BodyMetric } from '@/types/database';

interface MetricsChartSectionProps {
  data: BodyMetric[];
}

type MetricKey = 'weight_lbs' | 'chest_inches' | 'waist_inches' | 'hip_inches' | 'arm_inches' | 'thigh_inches';

interface MetricConfig {
  key: MetricKey;
  label: string;
  tabLabel: string;
  color: string;
}

const METRICS: MetricConfig[] = [
  { key: 'weight_lbs', label: 'Weight', tabLabel: 'Weight', color: 'hsl(var(--chart-1))' },
  { key: 'chest_inches', label: 'Chest', tabLabel: 'Chest', color: 'hsl(var(--chart-2))' },
  { key: 'waist_inches', label: 'Waist', tabLabel: 'Waist', color: 'hsl(var(--chart-3))' },
  { key: 'hip_inches', label: 'Hip', tabLabel: 'Hip', color: 'hsl(var(--chart-4))' },
  { key: 'arm_inches', label: 'Arm', tabLabel: 'Arm', color: 'hsl(var(--chart-5))' },
  { key: 'thigh_inches', label: 'Thigh', tabLabel: 'Thigh', color: 'hsl(142.1 76.2% 36.3%)' },
];

export function MetricsChartSection({ data }: MetricsChartSectionProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('weight_lbs');

  // Filter metrics that have at least one data point
  const availableMetrics = METRICS.filter((metric) =>
    data.some((record) => record[metric.key] !== null)
  );

  // If no metrics have data, show message
  if (availableMetrics.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No measurement data available yet
      </div>
    );
  }

  // If active metric has no data, switch to first available
  const activeHasData = availableMetrics.some((m) => m.key === activeMetric);
  const effectiveMetric = activeHasData ? activeMetric : availableMetrics[0].key;

  const currentConfig = METRICS.find((m) => m.key === effectiveMetric)!;

  return (
    <Tabs value={effectiveMetric} onValueChange={(v) => setActiveMetric(v as MetricKey)}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
        {METRICS.map((metric) => {
          const hasData = availableMetrics.some((m) => m.key === metric.key);
          return (
            <TabsTrigger
              key={metric.key}
              value={metric.key}
              disabled={!hasData}
              className="text-xs"
            >
              {metric.tabLabel}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {METRICS.map((metric) => (
        <TabsContent key={metric.key} value={metric.key}>
          <BodyMetricsChart
            data={data}
            metric={metric.key}
            label={metric.label}
            color={metric.color}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
