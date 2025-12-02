import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the next queue number for a specific doctor on a given date
 * Queue numbers restart daily per doctor
 */
export async function getNextQueueNumber(
    supabase: SupabaseClient,
    doctorId: string,
    appointmentDate: string
): Promise<number> {
    // Get the current max queue number for this doctor on this date
    const { data, error } = await supabase
        .from('appointments')
        .select('queue_number')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .order('queue_number', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned", which is fine
        console.error('Error fetching max queue number:', error);
        throw error;
    }

    // If no appointments exist yet, start at 1
    const currentMax = data?.queue_number || 0;
    return currentMax + 1;
}

/**
 * Check if the daily appointment limit has been reached
 * Returns true if there's still capacity, false if limit reached
 */
export async function checkDailyLimit(
    supabase: SupabaseClient,
    doctorId: string,
    appointmentDate: string
): Promise<boolean> {
    // Get the daily limit from settings
    const { data: settingData, error: settingError } = await supabase
        .from('clinic_settings')
        .select('setting_value')
        .eq('setting_key', 'daily_appointment_limit_per_doctor')
        .single();

    if (settingError) {
        console.error('Error fetching clinic settings:', settingError);
        // Default to 30 if we can't fetch settings
        var dailyLimit = 30;
    } else {
        dailyLimit = settingData?.setting_value?.limit || 30;
    }

    // Count existing appointments for this doctor on this date
    const { count, error: countError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .neq('status', 'cancelled'); // Don't count cancelled appointments

    if (countError) {
        console.error('Error counting appointments:', countError);
        throw countError;
    }

    // Return true if we haven't reached the limit
    return (count || 0) < dailyLimit;
}

/**
 * Get current daily appointment limit setting
 */
export async function getDailyLimit(supabase: SupabaseClient): Promise<number> {
    const { data, error } = await supabase
        .from('clinic_settings')
        .select('setting_value')
        .eq('setting_key', 'daily_appointment_limit_per_doctor')
        .single();

    if (error) {
        console.error('Error fetching daily limit:', error);
        return 30; // Default
    }

    return data?.setting_value?.limit || 30;
}

/**
 * Update daily appointment limit setting
 * Only staff should be able to call this
 */
export async function updateDailyLimit(
    supabase: SupabaseClient,
    newLimit: number
): Promise<void> {
    const { error } = await supabase
        .from('clinic_settings')
        .update({
            setting_value: { limit: newLimit },
            updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'daily_appointment_limit_per_doctor');

    if (error) {
        console.error('Error updating daily limit:', error);
        throw error;
    }
}
