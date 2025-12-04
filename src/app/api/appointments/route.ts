import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { appointmentSchema } from '@/lib/validations/appointment';
import {
    calculateEndTime,
    checkDoctorAvailability,
    checkAppointmentConflict,
    checkResourceAvailability
} from '@/lib/utils/availability';
import { getNextQueueNumber, checkDailyLimit } from '@/lib/utils/queue-number';

import { z } from 'zod';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const json = await request.json();
        const body = appointmentSchema.parse(json);

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser();

        // If not logged in and not a guest booking, reject
        if (!user && !body.is_guest) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Calculate end time (default 30 mins)
        const endTime = calculateEndTime(body.start_time, 30);

        // 3. Check daily appointment limit
        const hasCapacity = await checkDailyLimit(
            supabase,
            body.doctor_id,
            body.appointment_date
        );

        if (!hasCapacity) {
            return NextResponse.json(
                { error: '該日掛號已額滿，請選擇其他日期' },
                { status: 409 }
            );
        }

        // 4. Check availability
        const isAvailable = await checkDoctorAvailability(
            supabase,
            body.doctor_id,
            body.appointment_date,
            body.start_time,
            endTime
        );

        if (!isAvailable) {
            return NextResponse.json(
                { error: '該時段已被預約或醫師未排班' },
                { status: 409 }
            );
        }

        // 5. Get next queue number for this doctor on this date
        const queueNumber = await getNextQueueNumber(
            supabase,
            body.doctor_id,
            body.appointment_date
        );

        // 6. Insert Appointment with queue number
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                customer_id: user ? user.id : null,
                doctor_id: body.doctor_id,
                treatment_id: body.treatment_id,
                appointment_type: 'treatment',
                appointment_date: body.appointment_date,
                start_time: body.start_time,
                end_time: endTime,
                status: 'pending',
                customer_notes: body.notes,
                queue_number: queueNumber,
                // Guest fields
                guest_name: body.guest_name,
                guest_phone: body.guest_phone,
                guest_email: body.guest_email,
                is_guest: body.is_guest || false
            })
            .select()
            .single();

        if (error) {
            console.error('Database Insert Error:', error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: '資料格式錯誤', details: error.issues }, { status: 400 });
        }
        console.error('Booking Error:', error);

        // 嘗試提取有用的錯誤訊息
        let errorDetails = 'Unknown error';
        if (error instanceof Error) {
            errorDetails = error.message;
        } else if (typeof error === 'object' && error !== null) {
            // 處理 Supabase PostgrestError
            errorDetails = JSON.stringify(error);
        } else {
            errorDetails = String(error);
        }

        return NextResponse.json(
            {
                error: '預約失敗，請稍後再試',
                details: errorDetails,
                debug_info: error // 嘗試回傳原始錯誤物件
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // Fetch appointments for the current user
    // TODO: Add support for staff to fetch all appointments
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctors (full_name),
      treatments (name, duration_minutes)
    `)
        .eq('customer_id', user.id)
        .order('appointment_date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: '查詢失敗', details: error }, { status: 500 });
    }

    return NextResponse.json({ appointments });
}
