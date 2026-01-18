"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { BodyMetric } from "@/types/database";

type MetricKey = 'weight_lbs' | 'chest_inches' | 'waist_inches' | 'hip_inches' | 'arm_inches' | 'thigh_inches';

interface BodyMetricsChartProps {
  data: BodyMetric[];
  metric: MetricKey;
  label: string;
  color?: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export function BodyMetricsChart({
  data,
  metric,
  label,
  color = "hsl(var(--chart-1))",
}: BodyMetricsChartProps) {
  // Transform and filter data for the chart
  const chartData = useMemo(() => {
    const filtered: ChartDataPoint[] = [];

    // Process data, filter nulls, and format dates
    for (const record of data) {
      const value = record[metric];
      if (value !== null && value !== undefined) {
        filtered.push({
          date: formatDate(record.measured_at),
          value,
        });
      }
    }

    // Sort ascending by date (data comes DESC, we need ASC for chart)
    filtered.sort((a, b) => {
      // Parse the formatted date back to compare
      // This is a simplified sort since dates are already formatted
      return new Date(parseFormattedDate(a.date)).getTime() - new Date(parseFormattedDate(b.date)).getTime();
    });

    return filtered;
  }, [data, metric]);

  const chartConfig: ChartConfig = {
    value: {
      label,
      color,
    },
  };

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No {label.toLowerCase()} data yet
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.15 || maxValue * 0.1 || 10;

  const unit = metric === 'weight_lbs' ? 'lbs' : 'in';

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart
        data={chartData}
        accessibilityLayer
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickMargin={8}
          domain={[
            Math.max(0, minValue - padding),
            maxValue + padding,
          ]}
          tickFormatter={(value) => `${value}`}
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
          content={
            <ChartTooltipContent
              labelFormatter={(labelValue) => labelValue}
              formatter={(value) => [`${value} ${unit}`, label]}
            />
          }
        />
      </LineChart>
    </ChartContainer>
  );
}

/**
 * Format a date string to "MMM d" format (e.g., "Jan 15")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Parse the formatted date back for sorting comparison
 * Assumes current year if not specified
 */
function parseFormattedDate(formatted: string): string {
  // Add current year for parsing
  const currentYear = new Date().getFullYear();
  const parsed = new Date(`${formatted}, ${currentYear}`);
  return parsed.toISOString();
}
