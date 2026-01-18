import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar, Clock, Video, Plus } from 'lucide-react';

export default async function AppointmentsPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get patient record
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      providers(
        license_type,
        users(first_name, last_name)
      )
    `)
    .eq('patient_id', patient?.id)
    .gte('datetime', new Date().toISOString())
    .in('status', ['scheduled'])
    .order('datetime', { ascending: true });

  // Get past appointments
  const { data: pastAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      providers(
        license_type,
        users(first_name, last_name)
      )
    `)
    .eq('patient_id', patient?.id)
    .or(`datetime.lt.${new Date().toISOString()},status.in.(completed,cancelled,no_show)`)
    .order('datetime', { ascending: false })
    .limit(10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge>Scheduled</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="secondary">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: NonNullable<typeof upcomingAppointments>[0]; showActions?: boolean }) => {
    const providerName = appointment.providers?.users
      ? `Dr. ${appointment.providers.users.first_name} ${appointment.providers.users.last_name}`
      : 'Provider';

    return (
      <Card key={appointment.id}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(appointment.datetime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" />
                {new Date(appointment.datetime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })} - {appointment.duration} minutes
              </CardDescription>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{providerName}</p>
              <p className="text-sm text-muted-foreground">{appointment.providers?.license_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{appointment.type.replace('_', ' ')} Consultation</p>
            </div>
          </div>
          {showActions && appointment.status === 'scheduled' && (
            <div className="flex gap-2 mt-4">
              {appointment.video_link && (
                <Button asChild>
                  <a href={appointment.video_link} target="_blank" rel="noopener noreferrer">
                    <Video className="mr-2 h-4 w-4" />
                    Join Video Call
                  </a>
                </Button>
              )}
              <Button variant="outline">Reschedule</Button>
              <Button variant="outline" className="text-destructive">Cancel</Button>
            </div>
          )}
          {appointment.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm mt-1">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Schedule and manage your consultations"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </PageHeader>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} showActions />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="No Upcoming Appointments"
                  description="Schedule an appointment with your provider to discuss your treatment plan."
                >
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </EmptyState>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments && pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="No Past Appointments"
                  description="Your appointment history will appear here."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
