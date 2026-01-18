import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { getBodyMetrics, getLatestBodyMetric } from '@/lib/actions/body-metrics';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Scale } from 'lucide-react';
import { AddMetricForm } from './add-metric-form';
import { MetricsChartSection } from './metrics-chart-section';

export default async function BodyMetricsPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  // Fetch data in parallel
  const [metricsResult, latestResult] = await Promise.all([
    getBodyMetrics(),
    getLatestBodyMetric(),
  ]);

  const metrics = metricsResult.success ? metricsResult.data || [] : [];
  const latest = latestResult.success ? latestResult.data : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Body Metrics"
        description="Track your weight and body measurements to see your progress over time"
      />

      {/* Current Values Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Values</CardTitle>
          <CardDescription>
            {latest
              ? `Last measured ${new Date(latest.measured_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}`
              : 'No measurements recorded yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.weight_lbs !== null && (
                <MetricDisplay label="Weight" value={latest.weight_lbs} unit="lbs" />
              )}
              {latest.chest_inches !== null && (
                <MetricDisplay label="Chest" value={latest.chest_inches} unit="in" />
              )}
              {latest.waist_inches !== null && (
                <MetricDisplay label="Waist" value={latest.waist_inches} unit="in" />
              )}
              {latest.hip_inches !== null && (
                <MetricDisplay label="Hip" value={latest.hip_inches} unit="in" />
              )}
              {latest.arm_inches !== null && (
                <MetricDisplay label="Arm" value={latest.arm_inches} unit="in" />
              )}
              {latest.thigh_inches !== null && (
                <MetricDisplay label="Thigh" value={latest.thigh_inches} unit="in" />
              )}
            </div>
          ) : (
            <EmptyState
              icon={Scale}
              title="No Measurements Yet"
              description="Add your first measurement below to start tracking your progress."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Measurement Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Measurement</CardTitle>
            <CardDescription>
              Record your current weight and body measurements. All fields are optional except the date - add what you&apos;ve measured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddMetricForm />
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trends</CardTitle>
            <CardDescription>
              View your progress over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <MetricsChartSection data={metrics} />
            ) : (
              <EmptyState
                icon={Scale}
                title="No Data to Display"
                description="Add measurements to see your trends over time."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricDisplay({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
