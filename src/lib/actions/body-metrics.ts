'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import type { BodyMetric } from '@/types/database';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface CreateBodyMetricInput {
  measuredAt: string;
  weightLbs?: number;
  chestInches?: number;
  waistInches?: number;
  hipInches?: number;
  armInches?: number;
  thighInches?: number;
  notes?: string;
}

/**
 * Create a new body metric record for the current patient.
 * At least one measurement must be provided.
 */
export async function createBodyMetric(input: CreateBodyMetricInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can create body metrics' };
    }

    // Validate that at least one measurement is provided
    const hasMeasurement =
      input.weightLbs !== undefined ||
      input.chestInches !== undefined ||
      input.waistInches !== undefined ||
      input.hipInches !== undefined ||
      input.armInches !== undefined ||
      input.thighInches !== undefined;

    if (!hasMeasurement) {
      return { success: false, error: 'At least one measurement is required' };
    }

    if (!input.measuredAt) {
      return { success: false, error: 'Measurement date is required' };
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

    // Insert body metric
    const { error: insertError } = await supabase
      .from('body_metrics')
      .insert({
        patient_id: patient.id,
        measured_at: input.measuredAt,
        weight_lbs: input.weightLbs ?? null,
        chest_inches: input.chestInches ?? null,
        waist_inches: input.waistInches ?? null,
        hip_inches: input.hipInches ?? null,
        arm_inches: input.armInches ?? null,
        thigh_inches: input.thighInches ?? null,
        notes: input.notes?.trim() || null,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/body-metrics');
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get body metrics for the current patient.
 * Returns up to 50 records for chart performance, ordered by date descending.
 */
export async function getBodyMetrics(): Promise<ActionResult<BodyMetric[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view body metrics' };
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

    // Get body metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('patient_id', patient.id)
      .order('measured_at', { ascending: false })
      .limit(50);

    if (metricsError) {
      return { success: false, error: metricsError.message };
    }

    return { success: true, data: metrics || [] };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get the most recent body metric for the current patient.
 * Used for displaying current values.
 */
export async function getLatestBodyMetric(): Promise<ActionResult<BodyMetric | null>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view body metrics' };
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

    // Get most recent body metric
    const { data: metric, error: metricError } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('patient_id', patient.id)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single();

    if (metricError && metricError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's ok, return null
      return { success: false, error: metricError.message };
    }

    return { success: true, data: metric || null };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
