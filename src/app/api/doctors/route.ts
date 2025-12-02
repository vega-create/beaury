import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: doctors, error } = await supabase
        .from('doctors')
        .select(`
      id,
      specialization,
      bio,
      profiles (full_name)
    `)
        .eq('is_active', true);

    if (error) {
        return NextResponse.json({ error: '查詢失敗', details: error }, { status: 500 });
    }

    // Flatten the response for easier frontend consumption
    const formattedDoctors = doctors.map(doc => ({
        id: doc.id,
        full_name: doc.profiles?.full_name,
        specialization: doc.specialization,
        bio: doc.bio
    }));

    return NextResponse.json({ doctors: formattedDoctors });
}
