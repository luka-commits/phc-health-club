'use server'

import { createClient } from '@/lib/supabase/server';
import { getDBUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';

interface CreateBloodWorkRequestInput {
    requested_date: string;
    reason?: string;
}

export async function createBloodWorkRequest(input: CreateBloodWorkRequestInput) {
    const { user, error: authError } = await getDBUser();

    if (authError || !user || user.role !== 'patient') {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get patient ID
    const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!patient) {
        return { success: false, error: 'Patient not found' };
    }

    // Create request
    const { error } = await supabase
        .from('blood_work_requests')
        .insert({
            patient_id: patient.id,
            requested_date: input.requested_date,
            reason: input.reason || null,
            status: 'pending',
        });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/patient/blood-work-schedule');
    return { success: true };
}

export async function getBloodWorkRequests() {
    const { user, error: authError } = await getDBUser();

    if (authError || !user) {
        return { success: false, error: 'Unauthorized', data: null };
    }

    const supabase = await createClient();

    // Get patient ID
    const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!patient) {
        return { success: false, error: 'Patient not found', data: null };
    }

    const { data, error } = await supabase
        .from('blood_work_requests')
        .select('*')
        .eq('patient_id', patient.id)
        .order('requested_date', { ascending: true });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
}
