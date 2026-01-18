import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  UserCog,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Fetch total patients
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  // Fetch total providers
  const { count: totalProviders } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  // Fetch active products
  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  // Fetch appointments this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthlyAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('datetime', startOfMonth.toISOString());

  // Fetch recent patients
  const { data: recentPatients } = await supabase
    .from('patients')
    .select(`
      *,
      users(first_name, last_name, email, avatar_url, created_at)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch providers
  const { data: providers } = await supabase
    .from('providers')
    .select(`
      *,
      users(first_name, last_name, email, avatar_url)
    `)
    .limit(5);

  // Fetch today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todaysAppointments, count: todaysCount } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(users(first_name, last_name)),
      providers(users(first_name, last_name))
    `, { count: 'exact' })
    .gte('datetime', today.toISOString())
    .lt('datetime', tomorrow.toISOString())
    .order('datetime', { ascending: true })
    .limit(5);

  // Fetch new patients this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const { count: newPatientsThisWeek } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfWeek.toISOString());

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your PHC Health Club platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/patients">
              <Users className="mr-2 h-4 w-4" />
              Manage Patients
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/providers">
              <UserCog className="mr-2 h-4 w-4" />
              Manage Providers
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+{newPatientsThisWeek || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProviders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Licensed practitioners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyAppointments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Appointments scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Patients
              </CardTitle>
              <CardDescription>Newly registered patients</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/patients">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPatients && recentPatients.length > 0 ? (
              <div className="space-y-4">
                {recentPatients.map((patient) => {
                  const patientUser = patient.users;
                  const initials = `${patientUser?.first_name?.[0] || ''}${patientUser?.last_name?.[0] || ''}`.toUpperCase();

                  return (
                    <Link
                      key={patient.id}
                      href={`/admin/patients/${patient.id}`}
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
                        <p className="text-xs text-muted-foreground truncate">
                          {patientUser?.email}
                        </p>
                      </div>
                      <Badge variant={patient.intake_completed ? 'default' : 'secondary'}>
                        {patient.intake_completed ? 'Active' : 'Pending'}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No patients yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Providers
              </CardTitle>
              <CardDescription>Your healthcare team</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/providers">
                Manage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {providers && providers.length > 0 ? (
              <div className="space-y-4">
                {providers.map((provider) => {
                  const providerUser = provider.users;
                  const initials = `${providerUser?.first_name?.[0] || ''}${providerUser?.last_name?.[0] || ''}`.toUpperCase();

                  return (
                    <div
                      key={provider.id}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <Avatar>
                        <AvatarImage src={providerUser?.avatar_url || undefined} />
                        <AvatarFallback>{initials || '??'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {providerUser?.first_name} {providerUser?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {provider.specialty || 'General Practice'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {provider.license_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No providers yet</p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/admin/providers/new">Add Provider</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} - {todaysCount || 0} appointments
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/appointments">
                View Calendar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaysAppointments && todaysAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todaysAppointments.map((appointment) => {
                  const patientName = appointment.patients?.users
                    ? `${appointment.patients.users.first_name} ${appointment.patients.users.last_name}`
                    : 'Unknown Patient';
                  const providerName = appointment.providers?.users
                    ? `Dr. ${appointment.providers.users.last_name}`
                    : 'Unknown Provider';

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {formatTime(appointment.datetime)}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {appointment.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{patientName}</p>
                      <p className="text-xs text-muted-foreground">with {providerName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {appointment.duration} min
                        </span>
                        <Badge
                          variant={
                            appointment.status === 'completed'
                              ? 'default'
                              : appointment.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link href="/admin/products">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Product Catalog</p>
                <p className="text-sm text-muted-foreground">Manage products</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link href="/admin/billing">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Billing</p>
                <p className="text-sm text-muted-foreground">View transactions</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link href="/admin/analytics">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">View reports</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link href="/admin/settings">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-100 p-3">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">System Health</p>
                <p className="text-sm text-muted-foreground">Monitor status</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
