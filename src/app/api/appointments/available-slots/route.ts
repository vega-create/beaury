import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
    calculateEndTime,
    checkAppointmentConflict,
    getDayOfWeek,
    isSlotAvailable
} from '@/lib/utils/availability';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const doctorId = searchParams.get('doctor_id');
        const date = searchParams.get('date');
        const treatmentId = searchParams.get('treatment_id');

        if (!doctorId || !date || !treatmentId) {
            return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
        }

        console.log('[available-slots] Query params:', { doctorId, date, treatmentId });

        // 1. Get treatment duration
        const { data: treatment, error: treatmentError } = await supabase
            .from('treatments')
            .select('duration_minutes')
            .eq('id', treatmentId)
            .single();

        if (treatmentError) {
            console.error('[available-slots] Treatment query error:', treatmentError);
            return NextResponse.json({ error: '查詢療程失敗', details: treatmentError }, { status: 500 });
        }

        if (!treatment) {
            return NextResponse.json({ error: '療程不存在' }, { status: 404 });
        }

        console.log('[available-slots] Treatment duration:', treatment.duration_minutes);

        // 2. Get doctor schedules for the day
        const dayOfWeek = getDayOfWeek(date);
        console.log('[available-slots] Day of week:', dayOfWeek);

        const { data: schedules, error: schedError } = await supabase
            .from('schedules')
            .select('start_time, end_time, capacity')
            .eq('doctor_id', doctorId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .lte('effective_from', date)
            .or(`effective_until.is.null,effective_until.gte.${date}`);

        if (schedError) {
            console.error('[available-slots] Schedule query error:', schedError);
            return NextResponse.json({ error: '查詢排班失敗', details: schedError }, { status: 500 });
        }

        console.log('[available-slots] Found schedules:', schedules?.length || 0);

        if (!schedules || schedules.length === 0) {
            return NextResponse.json({ available_slots: [] });
        }

        // 3. Fetch all appointments for the day (Optimization)
        const { data: appointments, error: appError } = await supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('doctor_id', doctorId)
            .eq('appointment_date', date)
            .in('status', ['pending', 'confirmed']);

        if (appError) {
            console.error('[available-slots] Appointments query error:', appError);
            return NextResponse.json({ error: '查詢預約失敗', details: appError }, { status: 500 });
        }

        console.log('[available-slots] Existing appointments:', appointments?.length || 0);

        // 4. Generate potential slots and check availability
        const availableSlots: string[] = [];
        const interval = 30; // 30 minutes interval

        for (const schedule of schedules) {
            let currentTime = schedule.start_time;
            const capacity = schedule.capacity || 1;

            while (true) {
                const endTime = calculateEndTime(currentTime, treatment.duration_minutes);
                if (endTime > schedule.end_time) break;

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

        console.log('[available-slots] Available slots count:', availableSlots.length);

        return NextResponse.json({
            date,
            doctor_id: doctorId,
            available_slots: availableSlots
        });
    } catch (error) {
        console.error('[available-slots] Unexpected error:', error);
        return NextResponse.json(
            {
                error: '伺服器錯誤',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
