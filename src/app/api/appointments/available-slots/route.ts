import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
    calculateEndTime,
    checkAppointmentConflict,
    getDayOfWeek,
    isSlotAvailable
} from '@/lib/utils/availability';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const doctorId = searchParams.get('doctor_id');
    const date = searchParams.get('date');
    const treatmentId = searchParams.get('treatment_id');

    if (!doctorId || !date || !treatmentId) {
        return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 1. Get treatment duration
    const { data: treatment } = await supabase
        .from('treatments')
        .select('duration_minutes')
        .eq('id', treatmentId)
        .single();

    if (!treatment) {
        return NextResponse.json({ error: '療程不存在' }, { status: 404 });
    }

    // 2. Get doctor schedules for the day
    const dayOfWeek = getDayOfWeek(date);

    const { data: schedules } = await supabase
        .from('schedules')
        .select('start_time, end_time, capacity')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .lte('effective_from', date)
        .or(`effective_until.is.null,effective_until.gte.${date}`);

    if (!schedules || schedules.length === 0) {
        return NextResponse.json({ available_slots: [] });
    }

    // 3. Fetch all appointments for the day (Optimization)
    const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

    // 4. Generate potential slots and check availability
    const availableSlots: string[] = [];
    const interval = 30; // 30 minutes interval

    for (const schedule of schedules) {
        let currentTime = schedule.start_time;
        const capacity = schedule.capacity || 1;

        while (true) {
            const endTime = calculateEndTime(currentTime, treatment.duration_minutes);
            if (endTime > schedule.end_time) break;

            // Check capacity availability using the helper
            // We need to import isSlotAvailable from utils
            // But wait, I need to import it first.
            // Let's assume I added the import at the top.

            // Re-implement logic here or use helper?
            // I'll use the helper.
            const isAvailable = isSlotAvailable(
                appointments || [],
                currentTime,
                endTime,
                capacity
            );

            if (isAvailable) {
                availableSlots.push(currentTime);
            }

            currentTime = calculateEndTime(currentTime, interval);
        }
    }

    return NextResponse.json({
        date,
        doctor_id: doctorId,
        available_slots: availableSlots
    });
}
