import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { createTreatmentPlan, getTreatmentPlanForPatient } from '@/lib/actions/treatment-plans';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { TreatmentPlanEditor } from '@/components/provider/treatment-editor/treatment-plan-editor';
import type { TreatmentPlan } from '@/types/database';

interface TreatmentPlanEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function TreatmentPlanEditorPage({ params }: TreatmentPlanEditorPageProps) {
  const { id: patientId } = await params;
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  // Allow both providers and admins to access this page
  if (user.role !== 'provider' && user.role !== 'admin') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get provider record if user is a provider
  let provider = null;

  if (user.role === 'provider') {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id, license_type')
      .eq('user_id', user.id)
      .single();
    provider = providerData;
  }

  // Fetch patient data
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select(`
      id,
      user_id,
      users(id, first_name, last_name)
    `)
    .eq('id', patientId)
    .single();

  if (patientError || !patientData) {
    notFound();
  }

  // For PA/NP, verify they have access via treatment plan
  if (user.role === 'provider' && provider?.license_type !== 'MD') {
    const { data: treatmentPlanAccess } = await supabase
      .from('treatment_plans')
      .select('id')
      .eq('patient_id', patientId)
      .eq('provider_id', provider?.id)
      .limit(1)
      .maybeSingle();

    // PA/NP can create their first treatment plan for a patient
    // but cannot edit if no treatment plan exists and they are not assigned
    if (!treatmentPlanAccess) {
      // Allow creating first plan, but redirect if trying to edit existing plan they don't own
      const { data: anyPlan } = await supabase
        .from('treatment_plans')
        .select('id')
        .eq('patient_id', patientId)
        .limit(1)
        .maybeSingle();

      if (anyPlan) {
        // Plan exists but PA/NP doesn't own it
        redirect('/provider/patients');
      }
    }
  }

  // Get existing treatment plan or create a new one
  const { data: existingPlan } = await getTreatmentPlanForPatient(patientId);

  let treatmentPlan: TreatmentPlan | null = existingPlan;

  if (!treatmentPlan) {
    // Create a new treatment plan
    const result = await createTreatmentPlan(patientId);

    if (!result.success) {
      // Failed to create, show error
      redirect('/provider/patients');
    }

    // Fetch the newly created plan
    const { data: newPlan } = await getTreatmentPlanForPatient(patientId);
    treatmentPlan = newPlan;
  }

  if (!treatmentPlan) {
    redirect('/provider/patients');
  }

  // Get patient name
  const userData = patientData.users as unknown as {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  const patientName = [userData.first_name, userData.last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/provider/patients/${patientId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={`Edit Treatment Plan - ${patientName}`} />
      </div>

      <TreatmentPlanEditor
        treatmentPlan={treatmentPlan}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}
