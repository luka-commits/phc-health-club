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
import type { PersonalRecord } from "@/types/database";

interface PRChartProps {
  data: PersonalRecord[];
  color?: string;
}

interface ChartDataPoint {
  date: string;
  weight: number;
  reps: number;
  fullDate: string;
}

export function PRChart({
  data,
  color = "hsl(var(--chart-1))",
}: PRChartProps) {
  // Transform and prepare data for the chart
  const chartData = useMemo(() => {
    const points: ChartDataPoint[] = [];

    for (const record of data) {
      points.push({
        date: formatDate(record.recorded_at),
        weight: record.weight_lbs,
        reps: record.reps,
        fullDate: record.recorded_at,
      });
    }

    // Sort ascending by date (data comes DESC, we need ASC for chart)
    points.sort((a, b) => {
      return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime();
    });

    return points;
  }, [data]);

  const chartConfig: ChartConfig = {
    weight: {
      label: "Weight",
      color,
    },
  };

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No data yet for this lift
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const weights = chartData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.15 || maxWeight * 0.1 || 10;

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
            Math.max(0, minWeight - padding),
            maxWeight + padding,
          ]}
          tickFormatter={(value) => `${value}`}
        />

        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--color-weight)"
          strokeWidth={2}
          dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />

        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(labelValue) => labelValue}
              formatter={(value, name, item) => {
                const reps = item.payload?.reps;
                return [`${value} lbs x ${reps} reps`, "PR"];
              }}
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
