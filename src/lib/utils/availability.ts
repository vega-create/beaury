import { SupabaseClient } from '@supabase/supabase-js';
import { addMinutes, format } from 'date-fns';

// Helper to get day of week for database query (monday, tuesday, etc.)
export function getDayOfWeek(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // 月份從 0 開始
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

// Calculate end time based on start time and duration
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const endDate = addMinutes(date, durationMinutes);
    return format(endDate, 'HH:mm');
}

// Check if a doctor is available at a specific time (considering capacity)
export async function checkDoctorAvailability(
    supabase: SupabaseClient,
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string
): Promise<boolean> {
    const dayOfWeek = getDayOfWeek(date);
    console.log('=== Availability Check ===');
    console.log('Date:', date);
    console.log('Calculated dayOfWeek:', dayOfWeek);
    console.log('DoctorId:', doctorId);
    console.log('Time:', startTime, '-', endTime);

    // 1. Get Schedule & Capacity
    // ★ 修正重點：這裡加入了 error: schedError 的宣告
    const { data: schedules, error: schedError } = await supabase
        .from('schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .lte('effective_from', date)
        .or(`effective_until.is.null,effective_until.gte.${date}`);

    console.log('Found schedules:', schedules?.length || 0);
    console.log('Schedules:', JSON.stringify(schedules, null, 2));

    // ★ 因為上面已經宣告了 schedError，這行現在才不會報錯 (如果不想要也可以直接刪除這行)
    console.log('Schedule query error:', schedError);

    if (!schedules || schedules.length === 0) {
        console.log('❌ No schedules found');
        return false;
    }

    // Find the schedule that covers this time
    const schedule = schedules.find(s => {
        // 統一格式：都補上秒數再比對
        const normalizedStart = startTime.length === 5 ? startTime + ':00' : startTime;
        const normalizedEnd = endTime.length === 5 ? endTime + ':00' : endTime;
        const scheduleStart = s.start_time;
        const scheduleEnd = s.end_time;

        return normalizedStart >= scheduleStart && normalizedEnd <= scheduleEnd;
    });

    console.log('Matching schedule:', schedule);

    if (!schedule) {
        console.log('❌ No matching schedule for this time');
        return false;
    }

    console.log('✅ Schedule found, checking capacity...');

    // 2. Check Exceptions
    const { data: exception } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('exception_date', date)
        .maybeSingle();

    if (exception) {
        if (!exception.is_available) {
            // Leave
            if (!exception.start_time || !exception.end_time) return false; // Full day
            if (startTime < exception.end_time && endTime > exception.start_time) return false; // Partial overlap
        }
    }

    // 3. Check Capacity
    // Fetch all existing appointments for this slot using RPC to bypass RLS
    const { data: appointments, error: rpcError } = await supabase.rpc('get_doctor_booked_slots', {
        p_doctor_id: doctorId,
        p_date: date
    });

    if (rpcError) {
        console.error('Error fetching booked slots via RPC:', rpcError);
        throw new Error(`Availability Check Failed: ${rpcError.message}`);
    }

    // Filter appointments that overlap with the requested slot
    // Note: RPC returns all appointments for the day, we filter here for the specific slot
    // Updated to use slot_start/slot_end to avoid SQL ambiguity
    const relevantAppointments = appointments?.filter((a: any) =>
        a.slot_start < endTime && a.slot_end > startTime
    ) || [];

    if (relevantAppointments.length === 0) {
        return true;
    }


    const capacity = schedule.capacity || 1;

    // Map RPC result to expected format for isSlotAvailable
    const mappedAppointments = (appointments || []).map((a: any) => ({
        start_time: a.slot_start,
        end_time: a.slot_end
    }));

    // Check if adding this appointment exceeds capacity at any point
    // Note: We pass all appointments for the day, isSlotAvailable will filter relevant ones
    return isSlotAvailable(mappedAppointments, startTime, endTime, capacity);
}

// Helper to check if a slot is available given existing appointments and capacity
export function isSlotAvailable(
    appointments: { start_time: string, end_time: string }[],
    slotStartTime: string,
    slotEndTime: string,
    capacity: number
): boolean {
    const relevantAppts = appointments.filter(a =>
        a.start_time < slotEndTime && a.end_time > slotStartTime
    );

    if (relevantAppts.length < capacity) {
        return true;
    }

    const pointsToCheck = new Set<string>();
    pointsToCheck.add(slotStartTime);
    relevantAppts.forEach(a => {
        if (a.start_time >= slotStartTime && a.start_time < slotEndTime) {
            pointsToCheck.add(a.start_time);
        }
    });

    for (const point of Array.from(pointsToCheck)) {
        const activeCount = relevantAppts.filter(a =>
            a.start_time <= point && a.end_time > point
        ).length;

        if (activeCount >= capacity) {
            return false;
        }
    }

    return true;
}

// Deprecated: Use checkDoctorAvailability instead
export async function checkAppointmentConflict(
    supabase: SupabaseClient,
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string
): Promise<boolean> {
    const isAvailable = await checkDoctorAvailability(supabase, doctorId, date, startTime, endTime);
    return !isAvailable;
}

// Check resource availability
export async function checkResourceAvailability(
    supabase: SupabaseClient,
    requiredEquipmentIds: string[],
    date: string,
    startTime: string,
    endTime: string
): Promise<any[]> {
    const availableResources = [];

    for (const equipmentId of requiredEquipmentIds) {
        const { data: bookings } = await supabase
            .from('resource_bookings')
            .select('id')
            .eq('resource_id', equipmentId)
            .eq('booking_date', date)
            .lt('start_time', endTime)
            .gt('end_time', startTime);

        if (!bookings || bookings.length === 0) {
            const { data: resource } = await supabase
                .from('resources')
                .select('*')
                .eq('id', equipmentId)
                .eq('is_active', true)
                .single();

            if (resource) {
                availableResources.push(resource);
            }
        }
    }

    return availableResources;
}
