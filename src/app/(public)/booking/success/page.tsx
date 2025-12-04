'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, User } from 'lucide-react'
import { Suspense } from 'react'

function BookingSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const queueNumber = searchParams.get('queue')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const doctor = searchParams.get('doctor')

    return (
        <div className="min-h-screen bg-cream py-12 flex items-center justify-center">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white/90 backdrop-blur">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-serif text-dark-slate">預約成功！</CardTitle>
                    <p className="text-slate-500 mt-2">我們已收到您的預約資訊</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="bg-gold/5 rounded-xl p-6 border border-gold/20 text-center">
                        <p className="text-sm text-slate-500 mb-1">您的掛號號碼</p>
                        <p className="text-4xl font-bold text-gold-dark">{queueNumber || '-'}</p>
                    </div>

                    <div className="space-y-4">
                        {date && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <Calendar className="w-5 h-5 text-gold" />
                                <span>{date}</span>
                            </div>
                        )}
                        {time && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <Clock className="w-5 h-5 text-gold" />
                                <span>{time}</span>
                            </div>
                        )}
                        {doctor && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <User className="w-5 h-5 text-gold" />
                                <span>{doctor} 醫師</span>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 text-center">
                        我們會發送簡訊通知您，請留意您的手機訊息。<br />
                        如需更改預約，請聯繫診所櫃檯。
                    </p>
                </CardContent>
                <CardFooter className="pt-2 pb-8">
                    <Button
                        className="w-full bg-black hover:bg-slate-800 text-white rounded-full h-12"
                        onClick={() => router.push('/')}
                    >
                        返回首頁
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    )
}
