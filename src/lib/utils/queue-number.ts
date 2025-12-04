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
    // Use RPC to bypass RLS
    const { data, error } = await supabase.rpc('get_doctor_max_queue_number', {
        p_doctor_id: doctorId,
        p_date: appointmentDate
    });

    if (error) {
        console.error('Error fetching max queue number via RPC:', error);
        // Fallback to normal query if RPC fails (though it shouldn't)
        // Or throw error
        throw error;
    }

    return (data || 0) + 1;
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

    let dailyLimit = 30;
    if (settingError) {
        console.error('Error fetching clinic settings:', settingError);
    } else {
        dailyLimit = settingData?.setting_value?.limit || 30;
    }

    // Use RPC to count appointments (bypass RLS)
    const { data: count, error: countError } = await supabase.rpc('get_doctor_appointment_count', {
        p_doctor_id: doctorId,
        p_date: appointmentDate
    });

    if (countError) {
        console.error('Error counting appointments via RPC:', countError);
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
