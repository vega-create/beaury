import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getDailyLimit, updateDailyLimit } from '@/lib/utils/queue-number';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // Check if user is staff
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'staff') {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    try {
        const dailyLimit = await getDailyLimit(supabase);

        return NextResponse.json({
            daily_appointment_limit_per_doctor: dailyLimit
        });
    } catch (error) {
        console.error('Error fetching clinic settings:', error);
        return NextResponse.json(
            { error: '查詢失敗' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Check if user is staff
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'staff') {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { daily_appointment_limit_per_doctor } = body;

        if (!daily_appointment_limit_per_doctor || typeof daily_appointment_limit_per_doctor !== 'number') {
            return NextResponse.json(
                { error: '資料格式錯誤' },
                { status: 400 }
            );
        }

        if (daily_appointment_limit_per_doctor < 1 || daily_appointment_limit_per_doctor > 100) {
            return NextResponse.json(
                { error: '每日人數限制必須介於 1-100 之間' },
                { status: 400 }
            );
        }

        await updateDailyLimit(supabase, daily_appointment_limit_per_doctor);

        return NextResponse.json({
            success: true,
            daily_appointment_limit_per_doctor
        });
    } catch (error) {
        console.error('Error updating clinic settings:', error);
        return NextResponse.json(
            { error: '更新失敗' },
            { status: 500 }
        );
    }
}
