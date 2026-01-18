'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import type { TreatmentPlanUpdateInput } from '@/types/treatment-plan';

// ============================================
// Result Types
// ============================================

type ActionResult = { success: true } | { success: false; error: string };
type CreateResult = { success: true; id: string } | { success: false; error: string };

// ============================================
// Validation Schemas
// ============================================

const treatmentPlanUpdateSchema = z.object({
  treatmentPlanId: z.string().uuid(),
  lifestyle_behaviors: z.any().optional().nullable(),
  nutrition: z.any().optional().nullable(),
  training: z.any().optional().nullable(),
  prescriptions_data: z.any().optional().nullable(),
  peptides_data: z.any().optional().nullable(),
  supplements_data: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ============================================
// Helper Functions
// ============================================

async function getProviderWithAccess(patientId: string, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: provider } = await supabase
    .from('providers')
    .select('id, license_type')
    .eq('user_id', userId)
    .single();

  if (!provider) {
    return { provider: null, hasAccess: false };
  }

  // MD can access any patient
  if (provider.license_type === 'MD') {
    return { provider, hasAccess: true };
  }

  // PA/NP must have a treatment plan for this patient
  const { data: existingPlan } = await supabase
    .from('treatment_plans')
    .select('id')
    .eq('patient_id', patientId)
    .eq('provider_id', provider.id)
    .limit(1)
    .maybeSingle();

  return { provider, hasAccess: !!existingPlan };
}

// ============================================
// Server Actions
// ============================================

/**
 * Create a new draft treatment plan for a patient
 */
export async function createTreatmentPlan(patientId: string): Promise<CreateResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Only providers can create treatment plans' };
    }

    const supabase = await createClient();

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Get provider record
    const { data: provider } = await supabase
      .from('providers')
      .select('id, license_type')
      .eq('user_id', user.id)
      .single();

    if (!provider && user.role === 'provider') {
      return { success: false, error: 'Provider record not found' };
    }

    // For PA/NP, verify they are assigned to this patient (they can create first plan)
    // MD and admin can create for any patient
    const providerId = provider?.id;

    if (!providerId && user.role !== 'admin') {
      return { success: false, error: 'Provider record not found' };
    }

    // Check if a treatment plan already exists for this patient
    const { data: existingPlan } = await supabase
      .from('treatment_plans')
      .select('id')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (existingPlan) {
      return { success: false, error: 'A treatment plan already exists for this patient' };
    }

    // Create new draft treatment plan
    const { data: newPlan, error: createError } = await supabase
      .from('treatment_plans')
      .insert({
        patient_id: patientId,
        provider_id: providerId,
        status: 'draft',
        lifestyle_behaviors: null,
        nutrition: null,
        training: null,
        prescriptions_data: null,
        peptides_data: null,
        supplements_data: null,
        notes: null,
      })
      .select('id')
      .single();

    if (createError || !newPlan) {
      console.error('Create treatment plan error:', createError);
      return { success: false, error: 'Failed to create treatment plan' };
    }

    revalidatePath(`/provider/patients/${patientId}`);
    revalidatePath(`/provider/patients/${patientId}/treatment-plan`);

    return { success: true, id: newPlan.id };
  } catch (error) {
    console.error('Unexpected error in createTreatmentPlan:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update treatment plan sections (partial update)
 */
export async function updateTreatmentPlan(input: TreatmentPlanUpdateInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parsed = treatmentPlanUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Get the treatment plan
    const { data: treatmentPlan, error: planError } = await supabase
      .from('treatment_plans')
      .select('id, patient_id, provider_id')
      .eq('id', data.treatmentPlanId)
      .single();

    if (planError || !treatmentPlan) {
      return { success: false, error: 'Treatment plan not found' };
    }

    // Verify provider access
    if (user.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, license_type')
        .eq('user_id', user.id)
        .single();

      if (!provider) {
        return { success: false, error: 'Provider record not found' };
      }

      // Provider must own the plan or be an MD
      if (treatmentPlan.provider_id !== provider.id && provider.license_type !== 'MD') {
        return { success: false, error: 'You do not have access to this treatment plan' };
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.lifestyle_behaviors !== undefined) {
      updateData.lifestyle_behaviors = data.lifestyle_behaviors;
    }
    if (data.nutrition !== undefined) {
      updateData.nutrition = data.nutrition;
    }
    if (data.training !== undefined) {
      updateData.training = data.training;
    }
    if (data.prescriptions_data !== undefined) {
      updateData.prescriptions_data = data.prescriptions_data;
    }
    if (data.peptides_data !== undefined) {
      updateData.peptides_data = data.peptides_data;
    }
    if (data.supplements_data !== undefined) {
      updateData.supplements_data = data.supplements_data;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const { error: updateError } = await supabase
      .from('treatment_plans')
      .update(updateData)
      .eq('id', data.treatmentPlanId);

    if (updateError) {
      console.error('Update treatment plan error:', updateError);
      return { success: false, error: 'Failed to update treatment plan' };
    }

    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}`);
    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}/treatment-plan`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateTreatmentPlan:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update treatment plan status (draft -> active -> completed)
 */
export async function updateTreatmentPlanStatus(
  treatmentPlanId: string,
  status: 'draft' | 'active' | 'completed'
): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get the treatment plan with all data
    const { data: treatmentPlan, error: planError } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('id', treatmentPlanId)
      .single();

    if (planError || !treatmentPlan) {
      return { success: false, error: 'Treatment plan not found' };
    }

    // Verify provider access
    if (user.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, license_type')
        .eq('user_id', user.id)
        .single();

      if (!provider) {
        return { success: false, error: 'Provider record not found' };
      }

      if (treatmentPlan.provider_id !== provider.id && provider.license_type !== 'MD') {
        return { success: false, error: 'You do not have access to this treatment plan' };
      }
    }

    // When changing to 'active', validate required sections
    if (status === 'active') {
      // Check if at least one section has data
      const hasContent =
        treatmentPlan.lifestyle_behaviors ||
        treatmentPlan.nutrition ||
        treatmentPlan.training ||
        (treatmentPlan.prescriptions_data && Array.isArray(treatmentPlan.prescriptions_data) && treatmentPlan.prescriptions_data.length > 0) ||
        (treatmentPlan.peptides_data && Array.isArray(treatmentPlan.peptides_data) && treatmentPlan.peptides_data.length > 0) ||
        (treatmentPlan.supplements_data && Array.isArray(treatmentPlan.supplements_data) && treatmentPlan.supplements_data.length > 0);

      if (!hasContent) {
        return { success: false, error: 'Treatment plan must have at least one section filled before publishing' };
      }
    }

    const { error: updateError } = await supabase
      .from('treatment_plans')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', treatmentPlanId);

    if (updateError) {
      console.error('Update status error:', updateError);
      return { success: false, error: 'Failed to update treatment plan status' };
    }

    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}`);
    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}/treatment-plan`);
    revalidatePath(`/patient/treatment-plan`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateTreatmentPlanStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a draft treatment plan
 */
export async function deleteTreatmentPlan(treatmentPlanId: string): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get the treatment plan
    const { data: treatmentPlan, error: planError } = await supabase
      .from('treatment_plans')
      .select('id, patient_id, provider_id, status')
      .eq('id', treatmentPlanId)
      .single();

    if (planError || !treatmentPlan) {
      return { success: false, error: 'Treatment plan not found' };
    }

    // Only allow deletion of draft plans
    if (treatmentPlan.status !== 'draft') {
      return { success: false, error: 'Only draft treatment plans can be deleted' };
    }

    // Verify provider access
    if (user.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, license_type')
        .eq('user_id', user.id)
        .single();

      if (!provider) {
        return { success: false, error: 'Provider record not found' };
      }

      if (treatmentPlan.provider_id !== provider.id && provider.license_type !== 'MD') {
        return { success: false, error: 'You do not have access to this treatment plan' };
      }
    }

    const { error: deleteError } = await supabase
      .from('treatment_plans')
      .delete()
      .eq('id', treatmentPlanId);

    if (deleteError) {
      console.error('Delete treatment plan error:', deleteError);
      return { success: false, error: 'Failed to delete treatment plan' };
    }

    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteTreatmentPlan:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get treatment plan for a patient (used by editor page)
 */
export async function getTreatmentPlanForPatient(patientId: string) {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { data: null, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data: treatmentPlan, error } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) {
      console.error('Get treatment plan error:', error);
      return { data: null, error: 'Failed to fetch treatment plan' };
    }

    return { data: treatmentPlan, error: null };
  } catch (error) {
    console.error('Unexpected error in getTreatmentPlanForPatient:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Send treatment plan to patient (sets sent_to_patient_at timestamp)
 */
export async function sendPlanToPatient(treatmentPlanId: string): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get the treatment plan
    const { data: treatmentPlan, error: planError } = await supabase
      .from('treatment_plans')
      .select('id, patient_id, provider_id, status')
      .eq('id', treatmentPlanId)
      .single();

    if (planError || !treatmentPlan) {
      return { success: false, error: 'Treatment plan not found' };
    }

    // Plan must be active to send
    if (treatmentPlan.status !== 'active') {
      return { success: false, error: 'Plan must be published before sending to patient' };
    }

    // Verify provider access
    if (user.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, license_type')
        .eq('user_id', user.id)
        .single();

      if (!provider) {
        return { success: false, error: 'Provider record not found' };
      }

      if (treatmentPlan.provider_id !== provider.id && provider.license_type !== 'MD') {
        return { success: false, error: 'You do not have access to this treatment plan' };
      }
    }

    const { error: updateError } = await supabase
      .from('treatment_plans')
      .update({
        sent_to_patient_at: new Date().toISOString(),
        patient_signed_off_at: null, // Reset sign-off when re-sending
        updated_at: new Date().toISOString(),
      })
      .eq('id', treatmentPlanId);

    if (updateError) {
      console.error('Send plan to patient error:', updateError);
      return { success: false, error: 'Failed to send treatment plan to patient' };
    }

    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}`);
    revalidatePath(`/provider/patients/${treatmentPlan.patient_id}/treatment-plan`);
    revalidatePath(`/patient/treatment-plan`);
    revalidatePath(`/patient/treatment-plan/signoff`);

    // TODO: In future phase, this will trigger a notification to the patient

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in sendPlanToPatient:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Patient signs off on their treatment plan
 */
export async function signOffTreatmentPlan(treatmentPlanId: string): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only patients can sign off
    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can sign off on treatment plans' };
    }

    const supabase = await createClient();

    // Get patient record for this user
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patient) {
      return { success: false, error: 'Patient record not found' };
    }

    // Get the treatment plan
    const { data: treatmentPlan, error: planError } = await supabase
      .from('treatment_plans')
      .select('id, patient_id, sent_to_patient_at, patient_signed_off_at')
      .eq('id', treatmentPlanId)
      .single();

    if (planError || !treatmentPlan) {
      return { success: false, error: 'Treatment plan not found' };
    }

    // Verify this patient owns the plan
    if (treatmentPlan.patient_id !== patient.id) {
      return { success: false, error: 'You do not have access to this treatment plan' };
    }

    // Plan must have been sent to patient
    if (!treatmentPlan.sent_to_patient_at) {
      return { success: false, error: 'Treatment plan has not been sent for review' };
    }

    // Already signed off
    if (treatmentPlan.patient_signed_off_at) {
      return { success: false, error: 'Treatment plan has already been signed off' };
    }

    const { error: updateError } = await supabase
      .from('treatment_plans')
      .update({
        patient_signed_off_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', treatmentPlanId);

    if (updateError) {
      console.error('Sign off treatment plan error:', updateError);
      return { success: false, error: 'Failed to sign off treatment plan' };
    }

    revalidatePath(`/patient/treatment-plan`);
    revalidatePath(`/patient/treatment-plan/signoff`);
    revalidatePath(`/patient`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in signOffTreatmentPlan:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get treatment plan awaiting patient sign-off
 */
export async function getPendingSignOff() {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { data: null, error: 'Unauthorized' };
    }

    if (user.role !== 'patient') {
      return { data: null, error: 'Only patients can access pending sign-offs' };
    }

    const supabase = await createClient();

    // Get patient record
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patient) {
      return { data: null, error: 'Patient record not found' };
    }

    // Get treatment plan that was sent but not signed off
    const { data: treatmentPlan, error } = await supabase
      .from('treatment_plans')
      .select(`
        *,
        providers (
          id,
          users (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('patient_id', patient.id)
      .not('sent_to_patient_at', 'is', null)
      .is('patient_signed_off_at', null)
      .maybeSingle();

    if (error) {
      console.error('Get pending sign-off error:', error);
      return { data: null, error: 'Failed to fetch pending sign-off' };
    }

    return { data: treatmentPlan, error: null };
  } catch (error) {
    console.error('Unexpected error in getPendingSignOff:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
