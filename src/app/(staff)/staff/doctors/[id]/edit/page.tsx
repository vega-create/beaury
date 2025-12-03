import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DoctorEditFormClient from './DoctorEditFormClient'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function DoctorEditPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: doctor, error } = await supabase
        .from('doctors')
        .select(`
            *,
            profiles (id, full_name, email, phone)
        `)
        .eq('id', id)
        .single()

    if (error || !doctor) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">編輯醫師</h2>
                <p className="text-muted-foreground">修改醫師資料與設定。</p>
            </div>

            <div className="max-w-2xl">
                <DoctorEditFormClient doctor={doctor} />
            </div>
        </div>
    )
}
