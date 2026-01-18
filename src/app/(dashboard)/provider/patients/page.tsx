import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Search, ChevronRight } from 'lucide-react';

export default async function PatientsPage() {
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

  // Get patients assigned to this provider via treatment plans
  const { data: treatmentPlans } = await supabase
    .from('treatment_plans')
    .select(`
      id,
      status,
      updated_at,
      patients(
        id,
        intake_completed,
        users(first_name, last_name, email, avatar_url, phone)
      )
    `)
    .eq('provider_id', provider?.id)
    .order('updated_at', { ascending: false });

  // Get unique patients
  const patientsMap = new Map();
  treatmentPlans?.forEach((plan) => {
    // patients is a single object due to the FK relationship
    const patientData = plan.patients as unknown as {
      id: string;
      intake_completed: boolean;
      users: { first_name: string; last_name: string; email: string; avatar_url: string | null; phone: string | null };
    } | null;
    if (patientData && !patientsMap.has(patientData.id)) {
      patientsMap.set(patientData.id, {
        ...patientData,
        treatmentPlanStatus: plan.status,
        lastUpdated: plan.updated_at,
      });
    }
  });
  const patients = Array.from(patientsMap.values());

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Patients"
        description={`${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care`}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {patients.length > 0 ? (
        <div className="grid gap-4">
          {patients.map((patient) => {
            const initials = `${patient.users?.first_name?.[0] || ''}${patient.users?.last_name?.[0] || ''}`.toUpperCase();
            return (
              <Link key={patient.id} href={`/provider/patients/${patient.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.users?.avatar_url || undefined} />
                      <AvatarFallback>{initials || '??'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {patient.users?.first_name} {patient.users?.last_name}
                        </p>
                        {!patient.intake_completed && (
                          <Badge variant="secondary">Intake Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.users?.email}
                      </p>
                      {patient.users?.phone && (
                        <p className="text-sm text-muted-foreground">
                          {patient.users.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={patient.treatmentPlanStatus === 'active' ? 'default' : 'secondary'}>
                        {patient.treatmentPlanStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {new Date(patient.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Users}
              title="No Patients Assigned"
              description="Patients will appear here once they are assigned to you."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
