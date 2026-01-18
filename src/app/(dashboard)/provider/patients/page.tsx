import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { PatientList, PatientListItem } from '@/components/provider/patient-list';

export default async function PatientsPage() {
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
  let showAllPatients = false;

  if (user.role === 'provider') {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id, license_type')
      .eq('user_id', user.id)
      .single();
    provider = providerData;

    // MD providers see all patients
    showAllPatients = provider?.license_type === 'MD';
  } else if (user.role === 'admin') {
    // Admins always see all patients
    showAllPatients = true;
  }

  let patients: PatientListItem[] = [];

  if (showAllPatients) {
    // MD/Admin: Fetch ALL patients
    const { data: allPatients } = await supabase
      .from('patients')
      .select(`
        id,
        intake_completed,
        created_at,
        users(first_name, last_name, email, avatar_url, phone)
      `)
      .order('created_at', { ascending: false });

    // Get treatment plan status for each patient (if any)
    const patientIds = allPatients?.map(p => p.id) || [];
    const { data: treatmentPlans } = await supabase
      .from('treatment_plans')
      .select('patient_id, status, updated_at')
      .in('patient_id', patientIds)
      .order('updated_at', { ascending: false });

    // Create a map of patient_id to latest treatment plan
    const treatmentPlanMap = new Map<string, { status: string; updated_at: string }>();
    treatmentPlans?.forEach((plan) => {
      if (!treatmentPlanMap.has(plan.patient_id)) {
        treatmentPlanMap.set(plan.patient_id, { status: plan.status, updated_at: plan.updated_at });
      }
    });

    // Transform to PatientListItem format
    patients = (allPatients || []).map((patient) => {
      const userData = patient.users as unknown as {
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
        phone: string | null;
      };
      const treatmentPlan = treatmentPlanMap.get(patient.id);

      return {
        id: patient.id,
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        email: userData?.email || '',
        avatarUrl: userData?.avatar_url || null,
        phone: userData?.phone || null,
        intakeCompleted: patient.intake_completed,
        treatmentPlanStatus: treatmentPlan?.status || null,
        lastUpdated: treatmentPlan?.updated_at || patient.created_at,
      };
    });
  } else {
    // PA/NP: Fetch only assigned patients via treatment plans
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
    const patientsMap = new Map<string, PatientListItem>();
    treatmentPlans?.forEach((plan) => {
      const patientData = plan.patients as unknown as {
        id: string;
        intake_completed: boolean;
        users: { first_name: string; last_name: string; email: string; avatar_url: string | null; phone: string | null };
      } | null;

      if (patientData && !patientsMap.has(patientData.id)) {
        patientsMap.set(patientData.id, {
          id: patientData.id,
          firstName: patientData.users?.first_name || '',
          lastName: patientData.users?.last_name || '',
          email: patientData.users?.email || '',
          avatarUrl: patientData.users?.avatar_url || null,
          phone: patientData.users?.phone || null,
          intakeCompleted: patientData.intake_completed,
          treatmentPlanStatus: plan.status,
          lastUpdated: plan.updated_at,
        });
      }
    });
    patients = Array.from(patientsMap.values());
  }

  const headerTitle = showAllPatients ? 'All Patients' : 'My Patients';
  const headerDescription = showAllPatients
    ? `${patients.length} patient${patients.length !== 1 ? 's' : ''} in the system`
    : `${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={headerTitle}
        description={headerDescription}
      />

      <PatientList patients={patients} showAllPatients={showAllPatients} />
    </div>
  );
}
