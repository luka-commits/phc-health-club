import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { Calendar, Clock } from 'lucide-react';

export default async function ProviderCalendarPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'provider') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get provider record
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Get upcoming appointments for the next 7 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients(
        users(first_name, last_name, email)
      )
    `)
    .eq('provider_id', provider?.id)
    .gte('datetime', startDate.toISOString())
    .lte('datetime', endDate.toISOString())
    .order('datetime', { ascending: true });

  type AppointmentWithPatient = NonNullable<typeof appointments>[0];

  // Group appointments by date
  const appointmentsByDate = appointments?.reduce<Record<string, AppointmentWithPatient[]>>((acc, apt) => {
    const date = new Date(apt.datetime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});

  const dates = appointmentsByDate ? Object.keys(appointmentsByDate) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage your appointment schedule"
      />

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Calendar placeholder - in a real app, you'd use react-big-calendar here */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dates.length > 0 ? (
                dates.map((date) => (
                  <div key={date} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="space-y-2">
                      {appointmentsByDate?.[date]?.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded bg-muted/50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4" />
                              {new Date(apt.datetime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                            <div>
                              <p className="font-medium">
                                {apt.patients?.users?.first_name} {apt.patients?.users?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {apt.type.replace('_', ' ')} - {apt.duration} min
                              </p>
                            </div>
                          </div>
                          <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for the next 7 days</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointmentsByDate?.[new Date().toDateString()]?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure your availability settings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
