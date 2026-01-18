'use client';

import { format } from 'date-fns';
import { ScrollText, Scale, Dumbbell, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { LifestyleNote, BodyMetric, PersonalRecord, FitnessNote, LiftType } from '@/types/database';

interface LifestyleTabProps {
  lifestyleNotes: LifestyleNote[];
  bodyMetrics: BodyMetric[];
  personalRecords?: PersonalRecord[];
  fitnessNotes?: FitnessNote[];
}

const liftTypeLabels: Record<LiftType, string> = {
  squat: 'Squat',
  bench_press: 'Bench Press',
  deadlift: 'Deadlift',
  overhead_press: 'Overhead Press',
  barbell_row: 'Barbell Row',
  pull_up: 'Pull Up',
  other: 'Other',
};

export function LifestyleTab({
  lifestyleNotes,
  bodyMetrics,
  personalRecords = [],
  fitnessNotes = [],
}: LifestyleTabProps) {
  // Get latest PRs by lift type
  const latestPRs = personalRecords.reduce((acc, pr) => {
    if (!acc[pr.lift_type] || new Date(pr.recorded_at) > new Date(acc[pr.lift_type].recorded_at)) {
      acc[pr.lift_type] = pr;
    }
    return acc;
  }, {} as Record<LiftType, PersonalRecord>);

  // Prepare weight chart data (last 5 readings)
  const weightChartData = bodyMetrics
    .filter((m) => m.weight_lbs !== null)
    .slice(0, 5)
    .reverse()
    .map((m) => ({
      date: format(new Date(m.measured_at), 'MMM d'),
      weight: m.weight_lbs,
    }));

  // Most recent body metric
  const latestMetric = bodyMetrics[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Patient Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Patient&apos;s Lifestyle Notes
          </CardTitle>
          <CardDescription>
            Notes written by the patient about their health journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lifestyleNotes.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {lifestyleNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(note.note_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <EmptyState
              icon={ScrollText}
              title="No Notes"
              description="Patient hasn't written any lifestyle notes yet."
            />
          )}
        </CardContent>
      </Card>

      {/* Body Metrics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Body Measurements
          </CardTitle>
          <CardDescription>
            {latestMetric
              ? `Last measured ${format(new Date(latestMetric.measured_at), 'MMMM d, yyyy')}`
              : 'No measurements recorded'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestMetric ? (
            <div className="space-y-4">
              {/* Current values */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {latestMetric.weight_lbs !== null && (
                  <MetricBadge label="Weight" value={latestMetric.weight_lbs} unit="lbs" />
                )}
                {latestMetric.chest_inches !== null && (
                  <MetricBadge label="Chest" value={latestMetric.chest_inches} unit="in" />
                )}
                {latestMetric.waist_inches !== null && (
                  <MetricBadge label="Waist" value={latestMetric.waist_inches} unit="in" />
                )}
                {latestMetric.hip_inches !== null && (
                  <MetricBadge label="Hip" value={latestMetric.hip_inches} unit="in" />
                )}
                {latestMetric.arm_inches !== null && (
                  <MetricBadge label="Arm" value={latestMetric.arm_inches} unit="in" />
                )}
                {latestMetric.thigh_inches !== null && (
                  <MetricBadge label="Thigh" value={latestMetric.thigh_inches} unit="in" />
                )}
              </div>

              {/* Mini weight trend chart */}
              {weightChartData.length >= 2 && (
                <div className="pt-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Weight Trend (Last 5)
                  </p>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Scale}
              title="No Measurements"
              description="Patient hasn't recorded any body measurements."
            />
          )}
        </CardContent>
      </Card>

      {/* Fitness Progress Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Fitness & Performance
          </CardTitle>
          <CardDescription>Personal records and training notes</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(latestPRs).length > 0 || fitnessNotes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* PRs */}
              <div>
                <h4 className="font-medium mb-3">Personal Records</h4>
                {Object.keys(latestPRs).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(latestPRs).map(([liftType, pr]) => (
                      <div
                        key={liftType}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{liftTypeLabels[liftType as LiftType]}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(pr.recorded_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {pr.weight_lbs} lbs x {pr.reps}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No personal records logged</p>
                )}
              </div>

              {/* Recent fitness notes */}
              <div>
                <h4 className="font-medium mb-3">Recent Training Notes</h4>
                {fitnessNotes.length > 0 ? (
                  <div className="space-y-2">
                    {fitnessNotes.slice(0, 3).map((note) => (
                      <div key={note.id} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(note.note_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm line-clamp-2">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No training notes logged</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No Fitness Data"
              description="Patient hasn't logged any personal records or fitness notes."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricBadge({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
