import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { RefillCalendar, CalendarEvent } from '@/components/calendar/refill-calendar';
import { PillBottle, Calendar, CheckCircle, Truck, Package, List, CalendarDays } from 'lucide-react';

export default async function RefillsPage() {
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

  // Get prescriptions with refill info
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      *,
      products(name, type),
      refill_schedule(*)
    `)
    .eq('patient_id', patient?.id)
    .eq('status', 'active')
    .order('refill_date', { ascending: true });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'ordered':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'ordered':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Transform prescriptions to calendar events
  const transformToCalendarEvents = (): CalendarEvent[] => {
    if (!prescriptions) return [];

    return prescriptions
      .filter((p) => p.refill_date)
      .map((p) => ({
        id: `refill-${p.id}`,
        title: `Refill: ${p.products?.name || 'Medication'}`,
        start: new Date(p.refill_date!),
        end: new Date(p.refill_date!),
        allDay: true,
        type: 'refill' as const,
        data: p,
      }));
  };

  const calendarEvents = transformToCalendarEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refill Schedule"
        description="Manage your medication refills and deliveries"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => {
                const refill = prescription.refill_schedule?.[0];
                const daysUntilRefill = prescription.refill_date
                  ? Math.ceil(
                      (new Date(prescription.refill_date).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                return (
                  <Card key={prescription.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PillBottle className="h-5 w-5" />
                            {prescription.products?.name || 'Unknown Product'}
                          </CardTitle>
                          <CardDescription>
                            {prescription.dosage} - Qty: {prescription.quantity}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {prescription.auto_refill && (
                            <Badge variant="outline" className="text-green-600">
                              Auto-Refill
                            </Badge>
                          )}
                          {refill && (
                            <Badge variant={getStatusColor(refill.status) as "default" | "secondary"}>
                              {getStatusIcon(refill.status)}
                              <span className="ml-1 capitalize">{refill.status}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Next Refill</p>
                          <p className="font-medium">
                            {prescription.refill_date
                              ? new Date(prescription.refill_date).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Not scheduled'}
                          </p>
                          {daysUntilRefill !== null && daysUntilRefill > 0 && (
                            <p className="text-sm text-muted-foreground">
                              In {daysUntilRefill} day{daysUntilRefill !== 1 ? 's' : ''}
                            </p>
                          )}
                          {daysUntilRefill !== null && daysUntilRefill <= 0 && (
                            <p className="text-sm text-amber-600">Refill due!</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pharmacy</p>
                          <p className="font-medium">{prescription.pharmacy || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Instructions</p>
                          <p className="font-medium text-sm">{prescription.instructions || 'As directed'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={PillBottle}
                  title="No Active Prescriptions"
                  description="Your prescriptions and refill schedule will appear here once prescribed by your provider."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              {calendarEvents.length > 0 ? (
                <RefillCalendar events={calendarEvents} />
              ) : (
                <div className="h-[600px] flex items-center justify-center">
                  <EmptyState
                    icon={CalendarDays}
                    title="No Scheduled Refills"
                    description="Your refill schedule will appear on this calendar once you have active prescriptions with refill dates."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
