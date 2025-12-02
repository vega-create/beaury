import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Clock, Activity } from 'lucide-react'

export default async function StaffDashboard() {
    const supabase = await createClient()

    // Fetch some basic stats
    const { count: doctorCount } = await supabase.from('doctors').select('*', { count: 'exact', head: true })
    const { count: appointmentCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending')

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0]
    const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">後台總覽</h2>
                <p className="text-muted-foreground">歡迎回來，這裡是診所營運管理中心。</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">今日預約</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayCount || 0}</div>
                        <p className="text-xs text-muted-foreground">位病患預計今日看診</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">待確認預約</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentCount || 0}</div>
                        <p className="text-xs text-muted-foreground">筆新預約等待審核</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">執業醫師</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{doctorCount || 0}</div>
                        <p className="text-xs text-muted-foreground">位醫師目前在職</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">系統狀態</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">正常</div>
                        <p className="text-xs text-muted-foreground">所有服務運作中</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
