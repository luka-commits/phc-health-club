'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import type { PersonalRecord, LiftType } from '@/types/database';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface CreatePersonalRecordInput {
  liftType: LiftType;
  weightLbs: number;
  reps: number;
  recordedAt: string;
  notes?: string;
}

/**
 * Create a new personal record for the current patient.
 */
export async function createPersonalRecord(input: CreatePersonalRecordInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can create personal records' };
    }

    // Validate required fields
    if (!input.liftType) {
      return { success: false, error: 'Lift type is required' };
    }

    if (!input.weightLbs || input.weightLbs <= 0) {
      return { success: false, error: 'Weight must be greater than 0' };
    }

    if (!input.reps || input.reps <= 0) {
      return { success: false, error: 'Reps must be greater than 0' };
    }

    if (!input.recordedAt) {
      return { success: false, error: 'Date is required' };
    }

    const supabase = await createClient();

    // Get patient ID for this user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Insert personal record
    const { error: insertError } = await supabase
      .from('personal_records')
      .insert({
        patient_id: patient.id,
        lift_type: input.liftType,
        weight_lbs: input.weightLbs,
        reps: input.reps,
        recorded_at: input.recordedAt,
        notes: input.notes?.trim() || null,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/fitness');
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all personal records for the current patient.
 * Returns up to 100 records, ordered by recorded_at descending.
 */
export async function getPersonalRecords(): Promise<ActionResult<PersonalRecord[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view personal records' };
    }

    const supabase = await createClient();

    // Get patient ID for this user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Get personal records
    const { data: records, error: recordsError } = await supabase
      .from('personal_records')
      .select('*')
      .eq('patient_id', patient.id)
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (recordsError) {
      return { success: false, error: recordsError.message };
    }

    return { success: true, data: records || [] };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get personal records for a specific lift type.
 * Used for filtering chart data by lift.
 */
export async function getPersonalRecordsByLift(liftType: LiftType): Promise<ActionResult<PersonalRecord[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view personal records' };
    }

    const supabase = await createClient();

    // Get patient ID for this user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Get personal records for specific lift type
    const { data: records, error: recordsError } = await supabase
      .from('personal_records')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('lift_type', liftType)
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (recordsError) {
      return { success: false, error: recordsError.message };
    }

    return { success: true, data: records || [] };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get best PRs per lift type for the current patient.
 * Returns the max weight for each lift type (at any rep count).
 */
export async function getCurrentPRs(): Promise<ActionResult<PersonalRecord[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view personal records' };
    }

    const supabase = await createClient();

    // Get patient ID for this user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Get all records and find the max weight per lift type
    const { data: records, error: recordsError } = await supabase
      .from('personal_records')
      .select('*')
      .eq('patient_id', patient.id)
      .order('weight_lbs', { ascending: false });

    if (recordsError) {
      return { success: false, error: recordsError.message };
    }

    // Find best PR for each lift type (highest weight)
    const bestPRsByLift = new Map<LiftType, PersonalRecord>();

    for (const record of records || []) {
      const existing = bestPRsByLift.get(record.lift_type);
      if (!existing || record.weight_lbs > existing.weight_lbs) {
        bestPRsByLift.set(record.lift_type, record);
      }
    }

    return { success: true, data: Array.from(bestPRsByLift.values()) };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
