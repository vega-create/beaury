import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Shield, Clock } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-dark-slate">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-slate/50 to-dark-slate" />

                <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
                    <div className="inline-block animate-fade-in-up">
                        <span className="px-4 py-2 rounded-full border border-gold/30 text-gold bg-gold/5 text-sm tracking-widest uppercase backdrop-blur-sm">
                            Premium Medical Aesthetics
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight leading-tight">
                        綻放您的<span className="text-gold">自信光采</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        MIRA Clinic 結合頂尖醫療技術與極致美學，為您量身打造專屬的美麗方案。
                        在優雅舒適的環境中，享受最專業的醫美服務。
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Link href="/booking">
                            <Button className="bg-gold hover:bg-gold-dark text-white text-lg px-8 py-6 rounded-full shadow-xl shadow-gold/20 w-full md:w-auto">
                                立即預約諮詢
                            </Button>
                        </Link>
                        <Link href="/services">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full w-full md:w-auto">
                                探索療程項目
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4 p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-gold">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-slate">專業醫療團隊</h3>
                            <p className="text-slate-500 leading-relaxed">
                                由資深專科醫師親自看診，擁有豐富臨床經驗，確保療程安全與效果。
                            </p>
                        </div>
                        <div className="text-center space-y-4 p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-gold">
                                <Star className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-slate">頂級原廠設備</h3>
                            <p className="text-slate-500 leading-relaxed">
                                堅持使用衛福部核准之原廠儀器與針劑，品質有保障，讓您美得安心。
                            </p>
                        </div>
                        <div className="text-center space-y-4 p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-gold">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-slate">專屬預約服務</h3>
                            <p className="text-slate-500 leading-relaxed">
                                提供線上即時預約與專人諮詢，重視您的隱私與時間，享受尊榮服務。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-dark-slate relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                        準備好遇見更美好的自己了嗎？
                    </h2>
                    <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
                        現在就預約您的專屬諮詢時間，讓我們為您打造最適合的美麗方案。
                        新客首次體驗享專屬優惠。
                    </p>
                    <Link href="/booking">
                        <Button className="bg-gold hover:bg-gold-dark text-white text-lg px-10 py-6 rounded-full shadow-xl shadow-gold/20 group">
                            立即線上預約 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
