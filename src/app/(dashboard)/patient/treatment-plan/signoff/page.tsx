import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileCheck } from 'lucide-react';

import { getDBUser } from '@/lib/supabase/auth';
import { getPendingSignOff } from '@/lib/actions/treatment-plans';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { TreatmentPlanSignoff } from '@/components/patient/treatment-plan-signoff';

export default async function TreatmentPlanSignoffPage() {
  const { user, error: authError } = await getDBUser();

  if (authError || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const { data: treatmentPlan, error } = await getPendingSignOff();

  const patientName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email;

  if (error || !treatmentPlan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Review Treatment Plan"
          description="Sign off on your treatment plan"
        />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileCheck}
              title="No Treatment Plan Awaiting Review"
              description="You don't have any treatment plans that require your sign-off at this time."
            >
              <Button variant="outline" asChild>
                <Link href="/patient">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Treatment Plan"
        description="Please review and sign off on your updated treatment plan"
      />

      <TreatmentPlanSignoff
        treatmentPlan={treatmentPlan}
        patientName={patientName}
      />
    </div>
  );
}
