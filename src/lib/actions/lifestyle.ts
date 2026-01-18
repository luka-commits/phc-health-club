'use server';

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import type { LifestyleNote } from '@/types/database';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface CreateLifestyleNoteInput {
  content: string;
  noteDate: string;
}

interface ProviderMeetingNote {
  date: string;
  notes: string;
  providerName: string;
}

/**
 * Create a new lifestyle note for the current patient.
 */
export async function createLifestyleNote(input: CreateLifestyleNoteInput): Promise<ActionResult> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can create lifestyle notes' };
    }

    if (!input.content || input.content.trim().length === 0) {
      return { success: false, error: 'Note content is required' };
    }

    if (!input.noteDate) {
      return { success: false, error: 'Note date is required' };
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

    // Insert lifestyle note
    const { error: insertError } = await supabase
      .from('lifestyle_notes')
      .insert({
        patient_id: patient.id,
        content: input.content.trim(),
        note_date: input.noteDate,
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/lifestyle');
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all lifestyle notes for the current patient.
 * Returns notes ordered by note_date DESC, created_at DESC.
 */
export async function getLifestyleNotes(): Promise<ActionResult<LifestyleNote[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view lifestyle notes' };
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

    // Get lifestyle notes
    const { data: notes, error: notesError } = await supabase
      .from('lifestyle_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .order('note_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (notesError) {
      return { success: false, error: notesError.message };
    }

    return { success: true, data: notes || [] };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get provider meeting notes for the current patient.
 * Returns notes from completed appointments that have notes.
 */
export async function getProviderMeetingNotes(): Promise<ActionResult<ProviderMeetingNote[]>> {
  try {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'patient') {
      return { success: false, error: 'Only patients can view meeting notes' };
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

    // Get appointments with notes, joining to get provider name
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        datetime,
        notes,
        providers (
          users (
            first_name,
            last_name
          )
        )
      `)
      .eq('patient_id', patient.id)
      .eq('status', 'completed')
      .not('notes', 'is', null)
      .order('datetime', { ascending: false });

    if (appointmentsError) {
      return { success: false, error: appointmentsError.message };
    }

    // Transform the data to the expected format
    const meetingNotes: ProviderMeetingNote[] = (appointments || []).map((apt) => {
      // Supabase returns nested relations - providers contains users
      const provider = apt.providers as unknown as { users: { first_name: string | null; last_name: string | null } } | null;
      const firstName = provider?.users?.first_name || '';
      const lastName = provider?.users?.last_name || '';
      const providerName = [firstName, lastName].filter(Boolean).join(' ') || 'Provider';

      return {
        date: apt.datetime,
        notes: apt.notes || '',
        providerName,
      };
    });

    return { success: true, data: meetingNotes };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
