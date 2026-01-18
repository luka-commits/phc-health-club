import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { getPersonalRecords, getCurrentPRs } from '@/lib/actions/personal-records';
import { getFitnessNotes } from '@/lib/actions/fitness-notes';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Dumbbell, ScrollText } from 'lucide-react';
import { AddPRForm } from './add-pr-form';
import { PRChartSection } from './pr-chart-section';
import { FitnessNotesSection } from './fitness-notes-section';
import { AddNoteForm } from './add-note-form';
import type { LiftType } from '@/types/database';

// Map lift type to display name
const LIFT_LABELS: Record<LiftType, string> = {
  squat: 'Squat',
  bench_press: 'Bench Press',
  deadlift: 'Deadlift',
  overhead_press: 'Overhead Press',
  barbell_row: 'Barbell Row',
  pull_up: 'Pull-up',
  other: 'Other',
};

export default async function FitnessPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  // Fetch data in parallel
  const [recordsResult, currentPRsResult, notesResult] = await Promise.all([
    getPersonalRecords(),
    getCurrentPRs(),
    getFitnessNotes(),
  ]);

  const records = recordsResult.success ? recordsResult.data || [] : [];
  const currentPRs = currentPRsResult.success ? currentPRsResult.data || [] : [];
  const fitnessNotes = notesResult.success ? notesResult.data || [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance & Fitness"
        description="Track your gym PRs and training progress over time"
      />

      {/* PR Tracking Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">PR Tracking</h2>

        {/* Current PRs Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current PRs</CardTitle>
            <CardDescription>
              {currentPRs.length > 0
                ? 'Your best lifts (highest weight at any rep count)'
                : 'Track your personal records for major lifts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentPRs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentPRs.map((pr) => (
                  <PRDisplay
                    key={pr.id}
                    lift={LIFT_LABELS[pr.lift_type]}
                    weight={pr.weight_lbs}
                    reps={pr.reps}
                    date={pr.recorded_at}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Dumbbell}
                title="No PRs Yet"
                description="Add your first PR below to start tracking your strength progress."
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add PR Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add PR</CardTitle>
              <CardDescription>
                Record a new personal record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddPRForm />
            </CardContent>
          </Card>

          {/* PR Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Charts</CardTitle>
              <CardDescription>
                View your strength progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PRChartSection data={records} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Log Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Training Log</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Note Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Training Note</CardTitle>
              <CardDescription>
                Log your workout details and observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddNoteForm />
            </CardContent>
          </Card>

          {/* Notes List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notes</CardTitle>
              <CardDescription>
                Your training log entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fitnessNotes.length > 0 ? (
                <FitnessNotesSection notes={fitnessNotes} />
              ) : (
                <EmptyState
                  icon={ScrollText}
                  title="No Training Notes"
                  description="Start logging your workouts to track your training history."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PRDisplay({
  lift,
  weight,
  reps,
  date,
}: {
  lift: string;
  weight: number;
  reps: number;
  date: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{lift}</p>
      <p className="text-2xl font-bold">
        {weight} <span className="text-sm font-normal text-muted-foreground">lbs</span>
      </p>
      <p className="text-sm text-muted-foreground">
        {reps} rep{reps !== 1 ? 's' : ''} &middot;{' '}
        {new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
