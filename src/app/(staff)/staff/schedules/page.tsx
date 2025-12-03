import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
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

const DAYS_MAP: Record<string, string> = {
    monday: '週一',
    tuesday: '週二',
    wednesday: '週三',
    thursday: '週四',
    friday: '週五',
    saturday: '週六',
    sunday: '週日',
}

export default async function SchedulesPage() {
    const supabase = await createClient()

    const { data: schedules } = await supabase
        .from('schedules')
        .select(`
      *,
      doctors (
        id,
        profiles (full_name)
      )
    `)
        .order('day_of_week')
        .order('start_time')

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">排班管理</h2>
                    <p className="text-muted-foreground">設定醫師的每週固定班表與可預約人數。</p>
                </div>
                <Link href="/staff/schedules/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> 新增排班
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>醫師</TableHead>
                            <TableHead>星期</TableHead>
                            <TableHead>時段</TableHead>
                            <TableHead>可預約人數</TableHead>
                            <TableHead>生效日期</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules?.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{schedule.doctors?.profiles?.full_name[0]}</AvatarFallback>
                                        </Avatar>
                                        {schedule.doctors?.profiles?.full_name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{DAYS_MAP[schedule.day_of_week]}</Badge>
                                </TableCell>
                                <TableCell>
                                    {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                        {schedule.capacity} 人
                                    </div>
                                </TableCell>
                                <TableCell>{schedule.effective_from}</TableCell>
                                <TableCell>
                                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                        {schedule.is_active ? '啟用' : '停用'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" disabled>編輯</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!schedules || schedules.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    目前沒有排班資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
