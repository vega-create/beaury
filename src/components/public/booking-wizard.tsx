'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Check, ChevronRight, User, Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function BookingWizardContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Form State
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [time, setTime] = useState('')
    const [doctorId, setDoctorId] = useState('')
    const [treatmentId, setTreatmentId] = useState('')

    // Guest Info
    const [guestName, setGuestName] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [notes, setNotes] = useState('')

    // Data
    const [doctors, setDoctors] = useState<any[]>([])
    const [treatments, setTreatments] = useState<any[]>([])

    const supabase = createClient()

    useEffect(() => {
        const fetchResources = async () => {
            const { data: docs } = await supabase.from('doctors').select('*, profiles(full_name)').eq('is_active', true)
            const { data: treats } = await supabase.from('treatments').select('*').eq('is_active', true)
            if (docs) setDoctors(docs)
            if (treats) setTreatments(treats)
        }
        fetchResources()
    }, [])

    useEffect(() => {
        const paramDoctor = searchParams.get('doctor')
        const paramDate = searchParams.get('date')
        const paramTime = searchParams.get('time')

        if (paramDoctor && paramDate && paramTime) {
            setDoctorId(paramDoctor)
            const parsedDate = new Date(paramDate)
            // Check if date is valid
            if (!isNaN(parsedDate.getTime())) {
                setDate(parsedDate)
                setTime(paramTime)
                // No need to skip steps anymore, start at step 1
            } else {
                console.error('Invalid date param:', paramDate)
            }
        }
    }, [searchParams])

    const handleSubmit = async () => {
        setLoading(true)
        try {
            if (!date || isNaN(date.getTime())) {
                throw new Error('請選擇日期')
            }

            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    treatment_id: treatmentId || treatments[0]?.id, // Default to first treatment if not selected (or handle better)
                    appointment_date: format(date, 'yyyy-MM-dd'),
                    start_time: time,
                    guest_name: guestName,
                    guest_phone: guestPhone,
                    guest_email: guestEmail,
                    notes: notes,
                    is_guest: true
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Booking failed')
            }

            const result = await res.json()
            const queueNumber = result.queue_number || '未知'

            alert(`預約成功！\n您的掛號號碼是：${queueNumber}\n我們會盡快與您聯繫確認。`)
            router.push('/')
        } catch (error: any) {
            console.error(error)
            alert(error.message || '預約失敗，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    const selectedDoctor = doctors.find(d => d.id === doctorId)
    const selectedTreatment = treatments.find(t => t.id === treatmentId)

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-12">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center gap-2 relative">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 z-10",
                                step >= i ? "bg-gold text-white shadow-lg shadow-gold/30" : "bg-slate-100 text-slate-400"
                            )}>
                                {step > i ? <Check className="w-6 h-6" /> : i}
                            </div>
                            <span className={cn(
                                "absolute -bottom-8 text-xs font-medium whitespace-nowrap",
                                step >= i ? "text-gold-dark" : "text-slate-400"
                            )}>
                                {i === 1 && "填寫資料"}
                                {i === 2 && "確認預約"}
                            </span>
                        </div>
                        {i < 2 && (
                            <div className={cn(
                                "w-20 h-1 bg-slate-100 mx-2 rounded-full",
                                step > i && "bg-gold"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden mt-8">
                <CardHeader className="bg-gradient-to-r from-gold/10 to-transparent border-b border-gold/10 pb-8">
                    <CardTitle className="text-2xl font-serif text-dark-slate">
                        {step === 1 && "填寫個人資料"}
                        {step === 2 && "確認預約資訊"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "請填寫正確的聯絡資訊，以便我們與您聯繫"}
                        {step === 2 && "請核對您的預約內容，送出後即完成預約"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="bg-gold/5 p-4 rounded-lg mb-6 border border-gold/10">
                                <h4 className="font-bold text-dark-slate mb-2">已選擇時段</h4>
                                <p className="text-sm text-slate-600">
                                    {date ? format(date, 'yyyy年 MM月 dd日', { locale: zhTW }) : ''} {time}
                                    <br />
                                    {selectedDoctor ? (Array.isArray(selectedDoctor.profiles) ? selectedDoctor.profiles[0]?.full_name : selectedDoctor.profiles?.full_name) : ''} 醫師
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>真實姓名 <span className="text-red-500">*</span></Label>
                                <Input
                                    className="h-12 border-slate-200 focus-visible:ring-gold"
                                    placeholder="請輸入您的姓名"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>聯絡電話 <span className="text-red-500">*</span></Label>
                                <Input
                                    className="h-12 border-slate-200 focus-visible:ring-gold"
                                    placeholder="09xx-xxx-xxx"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (選填)</Label>
                                <Input
                                    className="h-12 border-slate-200 focus-visible:ring-gold"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>備註需求</Label>
                                <Input
                                    className="h-12 border-slate-200 focus-visible:ring-gold"
                                    placeholder="有任何特殊需求請告知..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-md mx-auto bg-gold/5 rounded-xl p-8 border border-gold/20">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gold shadow-sm">
                                        <CalendarIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">預約日期</div>
                                        <div className="font-bold text-lg text-dark-slate">
                                            {date ? format(date, 'yyyy年 MM月 dd日', { locale: zhTW }) : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gold shadow-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">預約時間</div>
                                        <div className="font-bold text-lg text-dark-slate">{time}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gold shadow-sm">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">預約項目</div>
                                        <div className="font-bold text-lg text-dark-slate">
                                            {selectedTreatment?.name || '一般門診'}
                                            ({selectedDoctor ? (Array.isArray(selectedDoctor.profiles) ? selectedDoctor.profiles[0]?.full_name : selectedDoctor.profiles?.full_name) : '不指定醫師'})
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gold/20 pt-6 mt-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">預約人</span>
                                        <span className="font-medium">{guestName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">聯絡電話</span>
                                        <span className="font-medium">{guestPhone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end bg-slate-50 p-8 border-t border-slate-100">
                    {step < 2 ? (
                        <Button
                            onClick={() => setStep(s => Math.min(2, s + 1))}
                            disabled={step === 1 && (!guestName || !guestPhone)}
                            className="bg-gold hover:bg-gold-dark text-white px-8 rounded-full shadow-lg shadow-gold/20"
                        >
                            下一步 <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-dark-slate hover:bg-slate-800 text-white px-8 rounded-full shadow-lg"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            確認預約
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div >
    )
}

export default function BookingWizard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingWizardContent />
        </Suspense>
    )
}
