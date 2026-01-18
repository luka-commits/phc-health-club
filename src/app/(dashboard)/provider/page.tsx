import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  ClipboardList,
  TestTube,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default async function ProviderDashboard() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'provider') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Fetch provider record
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch patient count for this provider
  const { count: patientCount } = await supabase
    .from('treatment_plans')
    .select('patient_id', { count: 'exact', head: true })
    .eq('provider_id', provider?.id);

  // Fetch today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todaysAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(
        id,
        user_id,
        users(first_name, last_name, email, avatar_url)
      )
    `)
    .eq('provider_id', provider?.id)
    .eq('status', 'scheduled')
    .gte('datetime', today.toISOString())
    .lt('datetime', tomorrow.toISOString())
    .order('datetime', { ascending: true });

  // Fetch upcoming appointments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: upcomingAppointments, count: upcomingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact' })
    .eq('provider_id', provider?.id)
    .eq('status', 'scheduled')
    .gte('datetime', new Date().toISOString())
    .lte('datetime', nextWeek.toISOString());

  // Fetch patients needing attention (pending blood work, overdue refills, etc.)
  const { data: recentPatients } = await supabase
    .from('treatment_plans')
    .select(`
      *,
      patients(
        id,
        user_id,
        users(first_name, last_name, email, avatar_url)
      )
    `)
    .eq('provider_id', provider?.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(5);

  // Fetch pending blood work reviews
  const { data: pendingBloodWork, count: pendingBloodWorkCount } = await supabase
    .from('blood_work')
    .select(`
      *,
      patients!inner(
        id,
        user_id,
        users(first_name, last_name)
      ),
      treatment_plans!inner(provider_id)
    `, { count: 'exact' })
    .eq('treatment_plans.provider_id', provider?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, Dr. {user.last_name || user.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your practice overview for today
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {provider?.license_type || 'Provider'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Under your care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Appointments this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBloodWorkCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Blood work to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments && todaysAppointments.length > 0 ? (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => {
                  const patient = appointment.patients;
                  const patientUser = patient?.users;
                  const initials = `${patientUser?.first_name?.[0] || ''}${patientUser?.last_name?.[0] || ''}`.toUpperCase();

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <Avatar>
                        <AvatarImage src={patientUser?.avatar_url || undefined} />
                        <AvatarFallback>{initials || '??'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {patientUser?.first_name} {patientUser?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {appointment.type.replace('_', ' ')} - {appointment.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatTime(appointment.datetime)}
                        </p>
                        {appointment.video_link && (
                          <Button size="sm" variant="outline" className="mt-1" asChild>
                            <a href={appointment.video_link} target="_blank" rel="noopener noreferrer">
                              Join Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No appointments today</p>
                <p className="text-sm text-muted-foreground">
                  Your schedule is clear for today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Patients
              </CardTitle>
              <CardDescription>Patients you&apos;ve recently worked with</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/provider/patients">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPatients && recentPatients.length > 0 ? (
              <div className="space-y-4">
                {recentPatients.map((plan) => {
                  const patient = plan.patients;
                  const patientUser = patient?.users;
                  const initials = `${patientUser?.first_name?.[0] || ''}${patientUser?.last_name?.[0] || ''}`.toUpperCase();

                  return (
                    <Link
                      key={plan.id}
                      href={`/provider/patients/${patient?.id}`}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={patientUser?.avatar_url || undefined} />
                        <AvatarFallback>{initials || '??'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {patientUser?.first_name} {patientUser?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {formatDate(plan.updated_at)}
                        </p>
                      </div>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No patients assigned</p>
                <p className="text-sm text-muted-foreground">
                  Patients will appear here once assigned to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Blood Work Reviews */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TestTube className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Blood Work Reviews</h3>
                </div>
                {pendingBloodWork && pendingBloodWork.length > 0 ? (
                  <div className="space-y-2">
                    {pendingBloodWork.slice(0, 3).map((bw) => (
                      <div key={bw.id} className="text-sm">
                        <p className="font-medium truncate">
                          {bw.patients?.users?.first_name} {bw.patients?.users?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(bw.date)}
                        </p>
                      </div>
                    ))}
                    {(pendingBloodWorkCount || 0) > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{(pendingBloodWorkCount || 0) - 3} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending reviews</p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/provider/blood-work">Review All</Link>
                </Button>
              </div>

              {/* Treatment Plans */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Treatment Plans</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {patientCount || 0} active treatment plans
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/provider/treatment-plans">Manage Plans</Link>
                </Button>
              </div>

              {/* Upcoming Appointments */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">This Week</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {upcomingCount || 0} appointments scheduled
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/provider/calendar">View Calendar</Link>
                </Button>
              </div>
            </div>
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
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
