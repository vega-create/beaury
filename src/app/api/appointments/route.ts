import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { appointmentSchema } from '@/lib/validations/appointment';
import {
    calculateEndTime,
    checkDoctorAvailability,
    checkAppointmentConflict,
    checkResourceAvailability
} from '@/lib/utils/availability';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json();

    // 3. Validation
    const validationResult = appointmentSchema.safeParse(body);
    if (!validationResult.success) {
        return NextResponse.json(
            { error: '資料格式錯誤', details: validationResult.error },
            { status: 400 }
        );
    }

    const {
        doctor_id,
        treatment_id,
        appointment_type,
        appointment_date,
        start_time,
        customer_notes
    } = validationResult.data;

    // 4. Get treatment details
    const { data: treatment } = await supabase
        .from('treatments')
        .select('duration_minutes, requires_special_equipment, required_equipment_ids')
        .eq('id', treatment_id)
        .single();

    if (!treatment) {
        return NextResponse.json({ error: '療程不存在' }, { status: 404 });
    }

    // 5. Calculate end time
    const endTime = calculateEndTime(start_time, treatment.duration_minutes);

    // 6. Check doctor availability (Schedule + Exceptions)
    const isDoctorAvailable = await checkDoctorAvailability(
        supabase,
        doctor_id,
        appointment_date,
        start_time,
        endTime
    );

    if (!isDoctorAvailable) {
        return NextResponse.json(
            { error: '該時段醫師無法預約' },
            { status: 409 }
        );
    }

    // 7. Check appointment conflicts
    const hasConflict = await checkAppointmentConflict(
        supabase,
        doctor_id,
import { z } from 'zod';

    export async function POST(request: Request) {
        const supabase = await createClient()

        try {
            const json = await request.json()
            const body = appointmentSchema.parse(json)

            // Check if user is logged in
            const {
                data: { user },
            } = await supabase.auth.getUser()

            // If not logged in, check if it's a guest booking
            if (!user && !body.is_guest) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            // Check availability (including capacity)
            const isAvailable = await checkDoctorAvailability(
                supabase,
                body.doctor_id,
                body.appointment_date,
                body.start_time,
                calculateEndTime(body.start_time, 30) // Placeholder for treatment duration
            );

            if (!isAvailable) {
                return NextResponse.json(
                    { error: 'Selected slot is not available' },
                    { status: 409 }
                )
            }

            // Calculate end time
            const endTime = calculateEndTime(body.start_time, 30) // Default 30 mins if treatment duration unknown

            // Create appointment
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    customer_id: user ? user.id : null, // Null for guest
                    doctor_id: body.doctor_id,
                    treatment_id: body.treatment_id,
                    appointment_type: 'treatment', // Default type
                    appointment_date: body.appointment_date,
                    start_time: body.start_time,
                    end_time: endTime,
                    status: 'pending',
                    customer_notes: body.notes,
                    // Guest fields
                    guest_name: body.guest_name,
                    guest_phone: body.guest_phone,
                    guest_email: body.guest_email,
                })
                .select()
                .single()

            if (error) throw error

            return NextResponse.json(data)
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: error.issues }, { status: 400 })
            }
            console.error('Booking Error:', error)
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            start_time,
                end_time: endTime
        });
    }

    // 11. Check if intake form is required
    const intakeFormRequired = appointment_type === 'consultation';

    return NextResponse.json({
        success: true,
        appointment,
        intake_form_required: intakeFormRequired,
        message: intakeFormRequired
            ? '預約建立成功，請完成術前評估表單'
            : '預約建立成功'
    }, { status: 201 });
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
