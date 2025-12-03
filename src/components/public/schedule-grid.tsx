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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAYS_LABEL = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']

const PERIODS = [
    { id: 'morning', label: '早診', timeRange: '10:00 - 13:00', isPeriod: (time: string) => parseInt(time.split(':')[0]) < 13 },
    { id: 'afternoon', label: '午診', timeRange: '14:00 - 17:00', isPeriod: (time: string) => parseInt(time.split(':')[0]) >= 13 && parseInt(time.split(':')[0]) < 18 },
    { id: 'evening', label: '晚診', timeRange: '18:00 - 21:00', isPeriod: (time: string) => parseInt(time.split(':')[0]) >= 18 },
]

// Helper to get the next date for a specific day of week
const getNextDayDate = (dayName: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    if (targetDay === -1) return '';

    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;

    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
}

export default async function ScheduleGrid() {
    const supabase = await createClient()

    // Fetch active doctors
    const { data: doctors } = await supabase
        .from('doctors')
        .select(`
      id,
      specialization,
      profiles (full_name)
    `)
        .eq('is_active', true)

    // Fetch all active schedules
    const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)

    if (!doctors || !schedules) return null

    // Helper to get doctors for a specific day and period
    const getDoctorsForSlot = (day: string, periodChecker: (time: string) => boolean) => {
        return schedules.filter(s => s.day_of_week === day && periodChecker(s.start_time)).map(schedule => {
            const doctor = doctors.find(d => d.id === schedule.doctor_id)
            return {
                ...doctor,
                schedule
            }
        }).filter(item => item.id) // Filter out if doctor not found
    }

    return (
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gold/10 border-b border-gold/20 pb-6">
                <CardTitle className="text-center text-2xl font-serif text-dark-slate">
                    醫師門診表
                    <span className="block text-sm font-sans font-normal text-slate-500 mt-2">
                        Professional Medical Team Schedule
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gold/5 hover:bg-gold/5 border-gold/10">
                                <TableHead className="w-[100px] text-center font-bold text-dark-slate bg-gold/10">時段</TableHead>
                                {DAYS_LABEL.map((day) => (
                                    <TableHead key={day} className="text-center font-bold text-dark-slate min-w-[140px]">
                                        {day}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PERIODS.map((period) => (
                                <TableRow key={period.id} className="hover:bg-transparent border-gold/10">
                                    <TableCell className="font-bold text-center bg-gold/5 border-r border-gold/10">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-lg text-dark-slate">{period.label}</span>
                                            <span className="text-xs text-slate-400 font-normal">{period.timeRange}</span>
                                        </div>
                                    </TableCell>
                                    {DAYS.map((day) => {
                                        const doctorsInSlot = getDoctorsForSlot(day, period.isPeriod)
                                        return (
                                            <TableCell key={`${day}-${period.id}`} className="text-center p-2 border-l border-gold/5 align-top">
                                                <div className="flex flex-col gap-2">
                                                    {doctorsInSlot.length > 0 ? (
                                                        doctorsInSlot.map((item: any) => (
                                                            <Link
                                                                key={item.schedule.id}
                                                                href={`/booking/new?doctor=${item.schedule.doctor_id}&date=${getNextDayDate(day)}&time=${item.schedule.start_time}`}
                                                                className="block group"
                                                            >
                                                                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-gold/10 shadow-sm hover:shadow-md hover:border-gold/30 hover:bg-gold/5 transition-all cursor-pointer">
                                                                    <span className="font-bold text-dark-slate group-hover:text-gold-dark transition-colors">
                                                                        {item.profiles?.full_name}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400 mt-1 group-hover:text-gold-dark/70">
                                                                        {item.specialization?.[0]}
                                                                    </span>
                                                                    <Badge variant="secondary" className="mt-2 bg-gold/10 text-gold-dark hover:bg-gold hover:text-white text-[10px] h-5 px-2">
                                                                        預約
                                                                    </Badge>
                                                                </div>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-200 text-2xl font-light">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
