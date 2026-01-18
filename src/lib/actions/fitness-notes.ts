'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import type { FitnessNote } from '@/types/database';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface CreateFitnessNoteInput {
  content: string;
  noteDate: string;
}

/**
 * Create a new fitness note for the current patient.
 */
export async function createFitnessNote(input: CreateFitnessNoteInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can create fitness notes' };
    }

    // Validate required fields
    if (!input.content?.trim()) {
      return { success: false, error: 'Note content is required' };
    }

    if (!input.noteDate) {
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

    // Insert fitness note
    const { error: insertError } = await supabase
      .from('fitness_notes')
      .insert({
        patient_id: patient.id,
        content: input.content.trim(),
        note_date: input.noteDate,
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
 * Get all fitness notes for the current patient.
 * Returns up to 50 records, ordered by note_date descending.
 */
export async function getFitnessNotes(): Promise<ActionResult<FitnessNote[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view fitness notes' };
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

    // Get fitness notes
    const { data: notes, error: notesError } = await supabase
      .from('fitness_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .order('note_date', { ascending: false })
      .limit(50);

    if (notesError) {
      return { success: false, error: notesError.message };
    }

    return { success: true, data: notes || [] };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
