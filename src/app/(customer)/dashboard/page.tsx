import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch profile to get name and role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    歡迎回來，{profile?.full_name || user.email}
                </h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-6 bg-white rounded-lg shadow border">
                        <h2 className="text-lg font-semibold mb-2">我的預約</h2>
                        <p className="text-slate-600">查看即將到來的預約與歷史紀錄</p>
                    </div>
                    <Link href="/appointments/new" className="block group">
                        <div className="p-6 bg-white rounded-lg shadow border group-hover:border-blue-500 transition-colors">
                            <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600">預約療程</h2>
                            <p className="text-slate-600">瀏覽療程項目並預約時段</p>
                        </div>
                    </Link>
                    <div className="p-6 bg-white rounded-lg shadow border">
                        <h2 className="text-lg font-semibold mb-2">個人資料</h2>
                        <p className="text-slate-600">管理您的基本資料與健康紀錄</p>
                    </div>
                    {['receptionist', 'doctor', 'admin'].includes(profile?.role) && (
                        <Link href="/staff/dashboard" className="block group">
                            <div className="p-6 bg-slate-900 text-white rounded-lg shadow border group-hover:bg-slate-800 transition-colors">
                                <h2 className="text-lg font-semibold mb-2">診所後台</h2>
                                <p className="text-slate-400">進入管理系統 (Staff Portal)</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
