'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { profileSchema, addressSchema, type ProfileInput, type AddressInput } from '@/lib/validations/profile';

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(formData: ProfileInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = profileSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0]?.message || 'Validation failed' };
    }

    const { first_name, last_name, phone, date_of_birth } = validationResult.data;

    const supabase = await createClient();

    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (userError) {
      return { success: false, error: 'Failed to update profile' };
    }

    // Update patients table if date_of_birth is provided
    if (date_of_birth !== undefined) {
      const { error: patientError } = await supabase
        .from('patients')
        .update({
          date_of_birth: date_of_birth || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (patientError) {
        return { success: false, error: 'Failed to update patient info' };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateShippingAddress(formData: AddressInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = addressSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0]?.message || 'Validation failed' };
    }

    const address = validationResult.data;

    const supabase = await createClient();

    // Update patients.shipping_address (JSONB field)
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        shipping_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: 'Failed to update shipping address' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateBillingAddress(formData: AddressInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = addressSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0]?.message || 'Validation failed' };
    }

    const address = validationResult.data;

    const supabase = await createClient();

    // Update patients.billing_address (JSONB field)
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        billing_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: 'Failed to update billing address' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
