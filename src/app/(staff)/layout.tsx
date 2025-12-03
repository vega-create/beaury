import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, FileText, LogOut, LayoutDashboard, Shield } from 'lucide-react'

export default async function StaffLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // 寬容判斷：轉小寫並去除空白
    const role = profile?.role?.trim().toLowerCase();

    if (!profile || !['receptionist', 'doctor', 'admin'].includes(role)) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">M</div>
                        診所後台
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Medical Clinic Admin</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/staff/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        總覽儀表板
                    </Link>
                    <Link href="/staff/doctors" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        醫師管理
                    </Link>
                    <Link href="/staff/schedules" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                        <Calendar className="w-5 h-5" />
                        排班管理
                    </Link>
                    <Link href="/staff/appointments" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                        <FileText className="w-5 h-5" />
                        預約列表
                    </Link>
                    
                    {/* ★ 修正後的權限判斷：使用處理過的 role 變數 */}
                    {role === 'admin' && (
                        <Link href="/staff/users" className="flex items-center gap-3 px-4 py-3 text-amber-400 hover:bg-slate-800 hover:text-amber-300 rounded-lg transition-colors">
                            <Shield className="w-5 h-5" />
                            權限管理
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-white">{user.email}</p>
                            {/* ★ 修正後的除錯訊息：補上閉合標籤 </p> */}
                            <p className="text-xs font-bold text-yellow-400 mt-1">
                                目前身份: [{role}]
                            </p>
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                            登出系統
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between">
                    <span className="font-bold">診所後台</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
