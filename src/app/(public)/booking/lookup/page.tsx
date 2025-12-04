'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Loader2, Search, XCircle } from 'lucide-react'

export default function BookingLookupPage() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [appointments, setAppointments] = useState<any[]>([])
    const [searched, setSearched] = useState(false)
    const supabase = createClient()

    const handleSearch = async () => {
        if (!phone) return
        setLoading(true)
        setSearched(true)
        setAppointments([])

        try {
            // 使用 RPC 查詢預約
            const { data, error } = await supabase.rpc('get_appointments_by_phone', {
                p_phone: phone
            })

            if (error) throw error
            // 轉換資料格式以符合 UI 預期
            const formattedData = (data || []).map((apt: any) => ({
                id: apt.id,
                appointment_date: apt.appointment_date,
                start_time: apt.start_time,
                queue_number: apt.queue_number,
                doctors: { profiles: { full_name: apt.doctor_name } },
                treatments: { name: apt.treatment_name }
            }))

            setAppointments(formattedData)
        } catch (error) {
            console.error(error)
            alert('查詢失敗，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('確定要取消此預約嗎？')) return

        try {
            const { data, error } = await supabase.rpc('cancel_appointment_by_guest', {
                p_appointment_id: id,
                p_phone: phone
            })

            if (error) throw error
            if (!data) throw new Error('取消失敗：找不到預約或權限不足')

            alert('預約已取消')
            handleSearch() // 重新整理
        } catch (error) {
            console.error(error)
            alert('取消失敗，請聯繫診所')
        }
    }

    return (
        <div className="min-h-screen bg-cream py-12">
            <div className="container mx-auto px-4 max-w-md">
                <Card className="border-none shadow-xl bg-white/90 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif text-dark-slate">查詢/取消預約</CardTitle>
                        <CardDescription>請輸入您的手機號碼以查詢預約紀錄</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="請輸入手機號碼"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <Button onClick={handleSearch} disabled={loading || !phone}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>

                        {searched && appointments.length === 0 && !loading && (
                            <div className="text-center text-slate-500 py-8">
                                查無預約紀錄
                            </div>
                        )}

                        <div className="space-y-4">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-dark-slate">
                                                {format(new Date(apt.appointment_date), 'yyyy/MM/dd (eee)', { locale: zhTW })}
                                            </div>
                                            <div className="text-gold-dark font-medium">
                                                {apt.start_time.slice(0, 5)}
                                            </div>
                                        </div>
                                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                            號碼: {apt.queue_number}
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-600 mb-4">
                                        <div>醫師：{apt.doctors?.profiles?.full_name || '不指定'}</div>
                                        <div>項目：{apt.treatments?.name}</div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                        onClick={() => handleCancel(apt.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        取消預約
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
