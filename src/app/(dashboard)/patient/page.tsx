import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  TestTube,
  Calendar,
  PillBottle,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default async function PatientDashboard() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Fetch patient data
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*, providers(user_id, users(first_name, last_name))')
    .eq('patient_id', patient?.id)
    .eq('status', 'scheduled')
    .gte('datetime', new Date().toISOString())
    .order('datetime', { ascending: true })
    .limit(3);

  // Fetch recent blood work
  const { data: recentBloodWork } = await supabase
    .from('blood_work')
    .select('*')
    .eq('patient_id', patient?.id)
    .order('date', { ascending: false })
    .limit(1);

  // Fetch active treatment plan
  const { data: treatmentPlan } = await supabase
    .from('treatment_plans')
    .select('*')
    .eq('patient_id', patient?.id)
    .eq('status', 'active')
    .single();

  // Fetch upcoming refills
  const { data: upcomingRefills } = await supabase
    .from('prescriptions')
    .select('*, products(name)')
    .eq('patient_id', patient?.id)
    .eq('status', 'active')
    .eq('auto_refill', true)
    .order('refill_date', { ascending: true })
    .limit(3);

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user.first_name || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your health journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/patient/messages">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Intake Form Alert */}
      {!patient?.intake_completed && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">Complete Your Intake Form</p>
                <p className="text-sm text-amber-700">
                  Please complete your intake form to get started with your treatment plan
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href="/patient/intake">
                Start Intake
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Treatment Plan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {treatmentPlan ? (
                <Badge variant="default" className="text-sm">Active</Badge>
              ) : (
                <Badge variant="secondary" className="text-sm">Pending</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {treatmentPlan ? 'View your current plan' : 'Awaiting provider assignment'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Blood Work</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentBloodWork?.[0] ? (
                formatDate(recentBloodWork[0].date)
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentBloodWork?.[0] ? 'Results available' : 'No records yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAppointments?.[0] ? (
                formatDate(upcomingAppointments[0].datetime)
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingAppointments?.[0]?.type || 'No upcoming appointments'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <PillBottle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingRefills?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With auto-refill enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Treatment Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Treatment Plan
            </CardTitle>
            <CardDescription>Your current health optimization protocol</CardDescription>
          </CardHeader>
          <CardContent>
            {treatmentPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">{formatDate(treatmentPlan.updated_at)}</span>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/patient/treatment-plan">
                    View Full Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No active treatment plan</p>
                <p className="text-sm text-muted-foreground">
                  Your provider will create one after your initial consultation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {formatDateTime(appointment.datetime)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {appointment.type.replace('_', ' ')} consultation
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{appointment.duration} min</Badge>
                  </div>
                ))}
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/patient/appointments">
                    View All Appointments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/patient/appointments">
                    Book an Appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blood Work Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Blood Work
            </CardTitle>
            <CardDescription>Your lab results and biomarkers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBloodWork && recentBloodWork.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Test Date</span>
                  <span className="text-sm font-medium">{formatDate(recentBloodWork[0].date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lab Source</span>
                  <Badge variant="secondary" className="capitalize">
                    {recentBloodWork[0].lab_source}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Results within normal range
                  </span>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/patient/blood-work">
                    View All Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <TestTube className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No blood work records</p>
                <p className="text-sm text-muted-foreground">
                  Upload your lab results to track your biomarkers
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/patient/blood-work/upload">
                    Upload Results
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refill Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PillBottle className="h-5 w-5" />
              Upcoming Refills
            </CardTitle>
            <CardDescription>Your medication refill schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRefills && upcomingRefills.length > 0 ? (
              <div className="space-y-4">
                {upcomingRefills.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {prescription.products?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Refill: {prescription.refill_date ? formatDate(prescription.refill_date) : 'TBD'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Auto-Refill
                    </Badge>
                  </div>
                ))}
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/patient/refills">
                    View All Refills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <PillBottle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No active prescriptions</p>
                <p className="text-sm text-muted-foreground">
                  Your prescriptions will appear here once prescribed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
