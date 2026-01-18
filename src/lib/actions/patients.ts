'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import type { Address } from '@/types/database';

// Validation schema for patient update
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 letters'),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  country: z.string(),
});

const insuranceSchema = z.object({
  provider_name: z.string().optional(),
  policy_number: z.string().optional(),
  group_number: z.string().optional(),
});

const patientUpdateSchema = z.object({
  patientId: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  shipping_address: addressSchema.optional().nullable(),
  billing_address: addressSchema.optional().nullable(),
  insurance_info: insuranceSchema.optional().nullable(),
  same_billing_as_shipping: z.boolean().optional(),
});

export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updatePatientInfo(input: PatientUpdateInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only providers and admins can update patient info
    if (user.role !== 'provider' && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parsed = patientUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Get the patient to verify it exists and get user_id
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, user_id')
      .eq('id', data.patientId)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // For providers, verify access
    if (user.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, license_type')
        .eq('user_id', user.id)
        .single();

      if (!provider) {
        return { success: false, error: 'Provider not found' };
      }

      // MD can edit any patient
      if (provider.license_type !== 'MD') {
        // PA/NP must have treatment plan for this patient
        const { data: treatmentPlan } = await supabase
          .from('treatment_plans')
          .select('id')
          .eq('patient_id', data.patientId)
          .eq('provider_id', provider.id)
          .limit(1)
          .single();

        if (!treatmentPlan) {
          return { success: false, error: 'You do not have access to this patient' };
        }
      }
    }

    // Update user table (first_name, last_name, phone)
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
      })
      .eq('id', patient.user_id);

    if (userUpdateError) {
      console.error('User update error:', userUpdateError);
      return { success: false, error: 'Failed to update user information' };
    }

    // Determine billing address
    let billingAddress: Address | null = data.billing_address || null;
    if (data.same_billing_as_shipping && data.shipping_address) {
      billingAddress = data.shipping_address;
    }

    // Update patients table
    const { error: patientUpdateError } = await supabase
      .from('patients')
      .update({
        date_of_birth: data.date_of_birth || null,
        shipping_address: data.shipping_address || null,
        billing_address: billingAddress,
        insurance_info: data.insurance_info || null,
      })
      .eq('id', data.patientId);

    if (patientUpdateError) {
      console.error('Patient update error:', patientUpdateError);
      return { success: false, error: 'Failed to update patient information' };
    }

    // Revalidate the patient detail page
    revalidatePath(`/provider/patients/${data.patientId}`);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updatePatientInfo:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
