import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, List, AlertCircle, CheckCircle2, FlaskConical, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { BloodWorkCalendar, BloodWorkEvent } from '@/components/calendar/blood-work-calendar';
import { RequestBloodWorkDialog } from '@/components/blood-work/request-blood-work-dialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Blood Work Schedule | PHC Health Club',
    description: 'View your upcoming blood work schedule',
};

export default async function BloodWorkSchedulePage() {
    const { user } = await getDBUser();
    const supabase = await createClient();

    if (!user) return null;

    // Get patient ID
    const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!patient) return <div>Patient not found</div>;

    // 1. Get scheduled appointments (upcoming)
    const { data: appointments } = await supabase
        .from('appointments')
        .select('*, provider:providers(user:users(first_name, last_name))')
        .eq('patient_id', patient.id)
        .eq('type', 'bloodwork')
        .order('datetime', { ascending: true });

    // 2. Get completed blood work
    const { data: completedLabs } = await supabase
        .from('blood_work')
        .select('id, date, created_at')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false });

    // 3. Get blood work requests
    const { data: requests } = await supabase
        .from('blood_work_requests')
        .select('*')
        .eq('patient_id', patient.id)
        .order('requested_date', { ascending: true });

    // Transform data for calendar
    const calendarEvents: BloodWorkEvent[] = [
        // Scheduled appointments
        ...(appointments || []).map(apt => ({
            id: apt.id,
            title: 'Blood Work Appointment',
            start: new Date(apt.datetime),
            end: new Date(new Date(apt.datetime).getTime() + 60 * 60 * 1000), // 1 hour duration
            allDay: false,
            type: 'scheduled' as const,
            status: apt.status,
            data: apt
        })),
        // Completed labs
        ...(completedLabs || []).map(lab => ({
            id: lab.id,
            title: 'Completed Blood Work',
            start: new Date(lab.date),
            end: new Date(lab.date),
            allDay: true,
            type: 'completed' as const,
            data: lab
        })),
        // Requests
        ...(requests || []).map(req => ({
            id: req.id,
            title: `Request: ${req.status}`,
            start: new Date(req.requested_date),
            end: new Date(req.requested_date),
            allDay: true,
            type: 'requested' as const,
            status: req.status,
            data: req
        }))
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Blood Work Schedule"
                    description="View your upcoming labs and request additional blood work."
                />
                <RequestBloodWorkDialog />
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Calendar View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    {/* Upcoming Appointments Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Upcoming Scheduled Labs
                        </h3>
                        {appointments && appointments.length > 0 ? (
                            appointments.map((apt) => (
                                <Card key={apt.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base">Blood Work Appointment</CardTitle>
                                                <CardDescription>
                                                    {format(new Date(apt.datetime), 'PPP p')}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>
                                                {apt.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Your provider will be ordering new labs on this date.
                                        </p>
                                        {apt.provider && (
                                            <div className="text-sm">
                                                Provider: Dr. {apt.provider.user?.last_name}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    No upcoming blood work appointments scheduled.
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Separator />

                    {/* Requests Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                            Your Requests
                        </h3>
                        {requests && requests.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {requests.map((req) => (
                                    <Card key={req.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base">Requested Date</CardTitle>
                                                    <CardDescription>
                                                        {format(new Date(req.requested_date), 'PPP')}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        req.status === 'approved' ? 'default' :
                                                            req.status === 'denied' ? 'destructive' : 'secondary'
                                                    }
                                                    className={cn(
                                                        req.status === 'pending' && "bg-yellow-500 hover:bg-yellow-600 text-white",
                                                        req.status === 'approved' && "bg-green-600 hover:bg-green-700",
                                                        req.status === 'denied' && "bg-red-600 hover:bg-red-700"
                                                    )}
                                                >
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {req.reason && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Reason: {req.reason}
                                                </p>
                                            )}
                                            {req.status === 'denied' && req.provider_notes && (
                                                <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded border border-red-100">
                                                    Provider Note: {req.provider_notes}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                No pending requests. You can request additional blood work using the button above.
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Completed Labs Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Completed Labs History
                        </h3>
                        {completedLabs && completedLabs.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {completedLabs.map(lab => (
                                    <Link href={`/patient/blood-work`} key={lab.id} className="block group">
                                        <Card className="group-hover:border-primary transition-colors">
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <FlaskConical className="h-4 w-4" />
                                                    Lab Results
                                                </CardTitle>
                                                <CardDescription>
                                                    {format(new Date(lab.date), 'PPP')}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                No completed blood work history found.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="calendar">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[hsl(25,95%,53%)]"></div>
                                    <span>Scheduled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[hsl(221,83%,53%)]"></div>
                                    <span>Requested</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[hsl(142,76%,36%)]"></div>
                                    <span>Completed</span>
                                </div>
                            </div>
                            <BloodWorkCalendar events={calendarEvents} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper to concatenate classes conditionally
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
