'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { manualEntrySchema, ManualEntryInput } from '@/lib/validations/blood-work';
import type { BiomarkerValue } from '@/types/database';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface UploadUrlResult {
  signedUrl: string;
  token: string;
  path: string;
}

interface SaveBloodWorkInput {
  pdfPath: string;
  date: string;
  labSource: 'quest' | 'labcorp' | 'other';
}

/**
 * Generate a signed upload URL for blood work PDF uploads.
 * The URL allows direct client-side upload to Supabase Storage.
 */
export async function getBloodWorkUploadUrl(fileName: string): Promise<ActionResult<UploadUrlResult>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
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

    // Generate unique path: {patient_id}/{uuid}.pdf
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    const uniqueName = `${uuidv4()}.${fileExt}`;
    const path = `${patient.id}/${uniqueName}`;

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('blood-work')
      .createSignedUploadUrl(path);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        path,
      },
    };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Save a blood work record after successful PDF upload.
 * Links the uploaded PDF to the patient's blood work history.
 */
export async function saveBloodWorkRecord(input: SaveBloodWorkInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createClient();

    // Get patient ID and verify ownership
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Verify the file path belongs to this patient
    if (!input.pdfPath.startsWith(patient.id)) {
      return { success: false, error: 'Unauthorized file access' };
    }

    // Get public URL for the uploaded file
    // Note: The bucket is private, so this URL won't work directly
    // Use signed download URLs when viewing is needed
    const { data: urlData } = supabase.storage
      .from('blood-work')
      .getPublicUrl(input.pdfPath);

    // Insert blood work record
    const { error: insertError } = await supabase
      .from('blood_work')
      .insert({
        patient_id: patient.id,
        date: input.date,
        lab_source: input.labSource,
        pdf_url: urlData.publicUrl,
        biomarkers: null, // To be filled manually or via OCR later
        notes: null,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/blood-work');
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Save manually entered blood work results.
 * Transforms biomarker array into Record format for database storage.
 */
export async function saveManualBloodWork(input: ManualEntryInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const result = manualEntrySchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || 'Invalid input' };
    }

    const supabase = await createClient();

    // Get patient ID and verify ownership
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' };
    }

    // Transform biomarkers array to Record format
    const biomarkers: Record<string, BiomarkerValue> = {};
    for (const biomarker of result.data.biomarkers) {
      // Calculate flag based on value vs reference range
      let flag: 'normal' | 'low' | 'high' | null = null;
      if (biomarker.reference_low != null && biomarker.reference_high != null) {
        if (biomarker.value < biomarker.reference_low) {
          flag = 'low';
        } else if (biomarker.value > biomarker.reference_high) {
          flag = 'high';
        } else {
          flag = 'normal';
        }
      }

      biomarkers[biomarker.name] = {
        value: biomarker.value,
        unit: biomarker.unit,
        reference_low: biomarker.reference_low ?? null,
        reference_high: biomarker.reference_high ?? null,
        flag,
      };
    }

    // Insert blood work record
    const { error: insertError } = await supabase
      .from('blood_work')
      .insert({
        patient_id: patient.id,
        date: result.data.date,
        lab_source: result.data.lab_source,
        pdf_url: null, // No PDF for manual entry
        biomarkers,
        notes: result.data.notes || null,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/blood-work');
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
