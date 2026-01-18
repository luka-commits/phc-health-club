"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface BiomarkerChartProps {
  data: { date: string; value: number }[];
  referenceRange: { low: number | null; high: number | null };
  unit: string;
  biomarkerName: string;
}

export function BiomarkerChart({
  data,
  referenceRange,
  unit,
  biomarkerName,
}: BiomarkerChartProps) {
  const chartConfig: ChartConfig = {
    value: {
      label: biomarkerName,
      color: "hsl(var(--chart-1))",
    },
  };

  // Calculate Y-axis domain based on data and reference range
  const allValues = data.map((d) => d.value);
  if (referenceRange.low !== null) allValues.push(referenceRange.low);
  if (referenceRange.high !== null) allValues.push(referenceRange.high);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1 || 10;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart
        data={data}
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
          domain={[minValue - padding, maxValue + padding]}
          tickFormatter={(value) => `${value}${unit ? ` ${unit}` : ""}`}
        />

        {/* Reference range band - only show if both bounds exist */}
        {referenceRange.low !== null && referenceRange.high !== null && (
          <ReferenceArea
            y1={referenceRange.low}
            y2={referenceRange.high}
            fill="hsl(142.1 76.2% 36.3%)"
            fillOpacity={0.1}
          />
        )}

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
              labelFormatter={(label) => label}
              formatter={(value) => [`${value} ${unit}`, biomarkerName]}
            />
          }
        />
      </LineChart>
    </ChartContainer>
  );
}
