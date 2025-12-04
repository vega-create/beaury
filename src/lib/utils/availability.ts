import { SupabaseClient } from '@supabase/supabase-js';
import { addMinutes, format, parse, isBefore, isAfter, isEqual } from 'date-fns';

// Helper to get day of week for database query (monday, tuesday, etc.)
export function getDayOfWeek(dateString: string): string {
    // 使用 parseISO 或手動解析，避免時區問題
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
    const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .lte('effective_from', date)
        .or(`effective_until.is.null,effective_until.gte.${date}`);

    if (!schedules || schedules.length === 0) {
        return false;
    }

    // Find the schedule that covers this time
    const schedule = schedules.find(s => startTime >= s.start_time && endTime <= s.end_time);

    if (!schedule) {
        return false;
    }

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
        // If is_available=true, we assume it works (or adds capacity? for now assume standard capacity)
    }

    // 3. Check Capacity
    // Fetch all existing appointments for this slot
    const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    if (!appointments || appointments.length === 0) {
        return true;
    }

    const capacity = schedule.capacity || 1;

    // Check if adding this appointment exceeds capacity at any point
    return isSlotAvailable(appointments, startTime, endTime, capacity);
}

// Helper to check if a slot is available given existing appointments and capacity
export function isSlotAvailable(
    appointments: { start_time: string, end_time: string }[],
    slotStartTime: string,
    slotEndTime: string,
    capacity: number
): boolean {
    // Filter only relevant appointments (already done by DB query usually, but good for safety)
    const relevantAppts = appointments.filter(a =>
        a.start_time < slotEndTime && a.end_time > slotStartTime
    );

    // Optimization: If total overlapping < capacity, it's definitely safe
    if (relevantAppts.length < capacity) {
        return true;
    }

    // Sweep line / Critical points check
    // Check at the start of the requested slot, and at the start of every overlapping appointment
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
    // This function was strictly checking for ANY overlap (Capacity=1)
    // We redirect to checkDoctorAvailability but we need to know if it returns false (available) or true (available)
    // Wait, checkDoctorAvailability returns TRUE if available.
    // checkAppointmentConflict returns TRUE if CONFLICT.
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
