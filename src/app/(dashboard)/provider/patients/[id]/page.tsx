import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PatientInfoCard } from '@/components/provider/patient-detail/patient-info-card';
import { TreatmentPlanTab } from '@/components/provider/patient-detail/treatment-plan-tab';
import { PrescriptionsList } from '@/components/provider/patient-detail/prescriptions-list';
import { BloodWorkTab } from '@/components/provider/patient-detail/blood-work-tab';
import { BloodWorkChart } from '@/components/provider/patient-detail/blood-work-chart';
import { LifestyleTab } from '@/components/provider/patient-detail/lifestyle-tab';
import { IntakeFormDisplay } from '@/components/provider/patient-detail/intake-form-display';
import type {
  Address,
  Patient,
  User,
  TreatmentPlan,
  Provider,
  Prescription,
  Product,
  BloodWork,
  BiomarkerValue,
  LifestyleNote,
  BodyMetric,
  PersonalRecord,
  FitnessNote,
} from '@/types/database';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
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
  let canEditPatient = false;

  if (user.role === 'provider') {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id, license_type')
      .eq('user_id', user.id)
      .single();
    provider = providerData;

    // MD providers can always edit
    canEditPatient = provider?.license_type === 'MD';
  } else if (user.role === 'admin') {
    // Admins can always edit
    canEditPatient = true;
  }

  // Fetch patient with user data
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select(`
      id,
      user_id,
      date_of_birth,
      shipping_address,
      billing_address,
      insurance_info,
      intake_form_data,
      intake_completed,
      stripe_customer_id,
      created_at,
      updated_at,
      users(id, email, first_name, last_name, phone, avatar_url, created_at)
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
      .single();

    if (!treatmentPlanAccess) {
      // PA/NP doesn't have access to this patient
      redirect('/provider/patients');
    }
    // PA/NP with treatment plan can edit
    canEditPatient = true;
  }

  // Fetch all additional data in parallel
  const [
    treatmentPlanResult,
    prescriptionsResult,
    bloodWorkResult,
    lifestyleNotesResult,
    bodyMetricsResult,
    personalRecordsResult,
    fitnessNotesResult,
  ] = await Promise.all([
    // Treatment plan with provider info
    supabase
      .from('treatment_plans')
      .select(`
        *,
        providers(
          id,
          user_id,
          license_type,
          users(id, first_name, last_name)
        )
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .single(),
    // Prescriptions with products
    supabase
      .from('prescriptions')
      .select(`
        *,
        products(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    // Blood work records
    supabase
      .from('blood_work')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false }),
    // Lifestyle notes
    supabase
      .from('lifestyle_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('note_date', { ascending: false }),
    // Body metrics
    supabase
      .from('body_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false }),
    // Personal records
    supabase
      .from('personal_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false }),
    // Fitness notes
    supabase
      .from('fitness_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('note_date', { ascending: false }),
  ]);

  // Transform patient data
  const userData = patientData.users as unknown as {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
  };

  const patient: Patient & { user: User } = {
    id: patientData.id,
    user_id: patientData.user_id,
    date_of_birth: patientData.date_of_birth,
    shipping_address: patientData.shipping_address as Address | null,
    billing_address: patientData.billing_address as Address | null,
    insurance_info: patientData.insurance_info as Record<string, unknown> | null,
    intake_form_data: patientData.intake_form_data as Record<string, unknown> | null,
    intake_completed: patientData.intake_completed,
    stripe_customer_id: patientData.stripe_customer_id,
    created_at: patientData.created_at,
    updated_at: patientData.updated_at,
    user: {
      id: userData.id,
      email: userData.email,
      role: 'patient',
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      avatar_url: userData.avatar_url,
      created_at: userData.created_at,
      updated_at: patientData.updated_at,
    },
  };

  // Transform treatment plan
  const treatmentPlan = treatmentPlanResult.data as (TreatmentPlan & {
    providers?: (Provider & { users?: User }) | null;
  }) | null;

  // Transform prescriptions
  const prescriptions = (prescriptionsResult.data || []) as (Prescription & {
    products?: Product | null;
  })[];

  // Transform blood work with proper biomarkers typing
  const bloodWorkRecords = (bloodWorkResult.data || []).map((record) => ({
    ...record,
    biomarkers: record.biomarkers as Record<string, BiomarkerValue> | null,
  })) as BloodWork[];

  // Lifestyle data
  const lifestyleNotes = (lifestyleNotesResult.data || []) as LifestyleNote[];
  const bodyMetrics = (bodyMetricsResult.data || []) as BodyMetric[];
  const personalRecords = (personalRecordsResult.data || []) as PersonalRecord[];
  const fitnessNotes = (fitnessNotesResult.data || []) as FitnessNote[];

  const patientName = [patient.user.first_name, patient.user.last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={patientName}>
          <Badge variant={patient.intake_completed ? 'default' : 'secondary'}>
            {patient.intake_completed ? 'Intake Complete' : 'Intake Pending'}
          </Badge>
        </PageHeader>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="treatment-plan">Treatment Plan</TabsTrigger>
          <TabsTrigger value="blood-work">Blood Work</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PatientInfoCard patient={patient} canEdit={canEditPatient} />
        </TabsContent>

        <TabsContent value="treatment-plan" className="space-y-6">
          <TreatmentPlanTab treatmentPlan={treatmentPlan} />
          <PrescriptionsList prescriptions={prescriptions} />
        </TabsContent>

        <TabsContent value="blood-work" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BloodWorkTab bloodWorkRecords={bloodWorkRecords} />
            <BloodWorkChart bloodWorkRecords={bloodWorkRecords} />
          </div>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-6">
          <LifestyleTab
            lifestyleNotes={lifestyleNotes}
            bodyMetrics={bodyMetrics}
            personalRecords={personalRecords}
            fitnessNotes={fitnessNotes}
          />
          <IntakeFormDisplay
            intakeData={patient.intake_form_data}
            intakeCompleted={patient.intake_completed}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
