import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: treatments, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        return NextResponse.json({ error: '查詢失敗', details: error }, { status: 500 });
    }

    return NextResponse.json({ treatments });
}
