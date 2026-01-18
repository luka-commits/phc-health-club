'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BloodWork, BiomarkerValue } from '@/types/database';

interface BloodWorkChartProps {
  bloodWorkRecords: BloodWork[];
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  value: number;
  unit: string;
  flag: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
}

export function BloodWorkChart({ bloodWorkRecords }: BloodWorkChartProps) {
  // Get all unique biomarkers across all records
  const uniqueBiomarkers = useMemo(() => {
    const biomarkerSet = new Set<string>();
    bloodWorkRecords.forEach((record) => {
      if (record.biomarkers) {
        Object.keys(record.biomarkers).forEach((name) => biomarkerSet.add(name));
      }
    });
    return Array.from(biomarkerSet).sort();
  }, [bloodWorkRecords]);

  // Default to first common biomarker or "Testosterone" if exists
  const defaultBiomarker = useMemo(() => {
    if (uniqueBiomarkers.includes('Testosterone')) return 'Testosterone';
    if (uniqueBiomarkers.includes('TSH')) return 'TSH';
    return uniqueBiomarkers[0] || '';
  }, [uniqueBiomarkers]);

  const [selectedBiomarker, setSelectedBiomarker] = useState(defaultBiomarker);

  // Extract data points for selected biomarker
  const chartData = useMemo(() => {
    if (!selectedBiomarker) return [];

    const dataPoints: ChartDataPoint[] = [];

    // Sort records by date ascending for chart
    const sortedRecords = [...bloodWorkRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedRecords.forEach((record) => {
      if (record.biomarkers && record.biomarkers[selectedBiomarker]) {
        const biomarker = record.biomarkers[selectedBiomarker] as BiomarkerValue;
        dataPoints.push({
          date: record.date,
          formattedDate: format(new Date(record.date), 'MMM d, yy'),
          value: biomarker.value,
          unit: biomarker.unit,
          flag: biomarker.flag,
          referenceLow: biomarker.reference_low,
          referenceHigh: biomarker.reference_high,
        });
      }
    });

    return dataPoints;
  }, [bloodWorkRecords, selectedBiomarker]);

  // Get reference range from first data point (assuming consistent)
  const referenceRange = useMemo(() => {
    const firstWithRef = chartData.find(
      (d) => d.referenceLow !== null && d.referenceHigh !== null
    );
    if (firstWithRef) {
      return {
        low: firstWithRef.referenceLow!,
        high: firstWithRef.referenceHigh!,
      };
    }
    return null;
  }, [chartData]);

  const unit = chartData[0]?.unit || '';

  if (uniqueBiomarkers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biomarker Trends</CardTitle>
          <CardDescription>No biomarker data available for charting</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biomarker Trends</CardTitle>
          <CardDescription>Select a biomarker to view trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
            <SelectTrigger>
              <SelectValue placeholder="Select biomarker" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBiomarkers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Not enough data points to display chart (need at least 2)
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biomarker Trends</CardTitle>
        <CardDescription>Track biomarker values over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
          <SelectTrigger>
            <SelectValue placeholder="Select biomarker" />
          </SelectTrigger>
          <SelectContent>
            {uniqueBiomarkers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataPoint;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-medium">{selectedBiomarker}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(data.date), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-lg font-bold">
                          {data.value} {data.unit}
                        </p>
                        {data.flag && (
                          <p
                            className={`text-sm ${
                              data.flag === 'high'
                                ? 'text-red-500'
                                : data.flag === 'low'
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`}
                          >
                            {data.flag.charAt(0).toUpperCase() + data.flag.slice(1)}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {referenceRange && (
                <>
                  <ReferenceArea
                    y1={referenceRange.low}
                    y2={referenceRange.high}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    label={{
                      value: 'Normal Range',
                      position: 'insideTopRight',
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <ReferenceLine
                    y={referenceRange.low}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <ReferenceLine
                    y={referenceRange.high}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
