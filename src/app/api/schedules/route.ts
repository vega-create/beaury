import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const scheduleSchema = z.object({
    doctor_id: z.string().uuid(),
    day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    effective_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Auth check (Only staff/admin should create schedules)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // TODO: Add role check here

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: '格式錯誤', details: validation.error }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('schedules')
        .insert(validation.data)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: '建立排班失敗', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data });
}
