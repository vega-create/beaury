import ScheduleGrid from '@/components/public/schedule-grid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-cream pb-20">
            {/* Hero Section */}
            <section className="relative h-[40vh] bg-dark-slate overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-slate via-transparent to-transparent" />

                <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                        線上預約
                    </h1>
                    <p className="text-gold-light text-lg max-w-xl">
                        提供最專業的醫師團隊與舒適的診療環境，讓您的美麗旅程從這裡開始。
                    </p>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
                <ScheduleGrid />
            </section>
        </div>
    )
}
