import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
// ★ 新增：匯入剛剛建立的按鈕元件
import ExportAppointmentsButton from '@/components/staff/export-appointments-button'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: '待確認', variant: 'secondary' },
    confirmed: { label: '已確認', variant: 'default' },
    completed: { label: '已完成', variant: 'outline' },
    cancelled: { label: '已取消', variant: 'destructive' },
    no_show: { label: '未出席', variant: 'destructive' },
}

export default async function AppointmentsPage() {
    const supabase = await createClient()

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
      *,
      profiles (full_name, phone, email),
      doctors (profiles (full_name)),
      treatments (name)
    `)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: true })

    return (
        <div className="space-y-8">
            {/* ★ 修改：使用 flex 佈局來讓標題和按鈕排在同一行 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">預約列表</h2>
                    <p className="text-muted-foreground">查看所有病患的預約紀錄與狀態。</p>
                </div>
                {/* ★ 新增：放入匯出按鈕，只有在有資料時才顯示 */}
                {appointments && appointments.length > 0 && (
                    <ExportAppointmentsButton data={appointments} />
                )}
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>預約日期</TableHead>
                            <TableHead>時間</TableHead>
                            {/* ★ 新增：顯示掛號號碼 */}
                            <TableHead>號碼</TableHead>
                            <TableHead>病患姓名</TableHead>
                            <TableHead>聯絡電話</TableHead>
                            <TableHead>預約醫師</TableHead>
                            <TableHead>療程項目</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments?.map((apt) => (
                            <TableRow key={apt.id}>
                                <TableCell>
                                    {format(new Date(apt.appointment_date), 'yyyy/MM/dd (eee)', { locale: zhTW })}
                                </TableCell>
                                <TableCell>
                                    {apt.start_time.slice(0, 5)}
                                </TableCell>
                                {/* ★ 新增：顯示掛號號碼 */}
                                <TableCell className="font-mono font-bold text-blue-600">
                                    {apt.queue_number ? `#${apt.queue_number}` : '-'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            {/* 如果是訪客，顯示 '訪'，否則顯示姓名首字 */}
                                            <AvatarFallback>
                                                {apt.is_guest ? '訪' : apt.profiles?.full_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* 判斷顯示訪客姓名還是會員姓名 */}
                                        {apt.is_guest ? (
                                            <span>{apt.guest_name} <span className="text-xs text-slate-400">(訪客)</span></span>
                                        ) : (
                                            apt.profiles?.full_name
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {/* 判斷顯示訪客電話還是會員電話 */}
                                    {apt.is_guest ? apt.guest_phone : apt.profiles?.phone}
                                </TableCell>
                                <TableCell>{apt.doctors?.profiles?.full_name}</TableCell>
                                <TableCell>{apt.treatments?.name}</TableCell>
                                <TableCell>
                                    <Badge variant={STATUS_MAP[apt.status]?.variant || 'outline'}>
                                        {STATUS_MAP[apt.status]?.label || apt.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-sm text-muted-foreground">管理</span>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!appointments || appointments.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    目前沒有預約紀錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
