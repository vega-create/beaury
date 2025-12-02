import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-cream font-sans text-dark-slate">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-20 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-white font-serif text-xl font-bold">
                            M
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-wide text-dark-slate">MIRA CLINIC</span>
                            <span className="text-[10px] tracking-[0.2em] text-gold-dark uppercase">Medical Aesthetics</span>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-dark-slate text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold text-gold">MIRA CLINIC</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                致力於提供最專業、安全、精緻的醫美服務，讓您的美麗自信綻放。
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-gold-light">服務項目</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li><Link href="#" className="hover:text-gold">皮秒雷射</Link></li>
                                <li><Link href="#" className="hover:text-gold">音波拉提</Link></li>
                                <li><Link href="#" className="hover:text-gold">微整注射</Link></li>
                                <li><Link href="#" className="hover:text-gold">抗衰老療程</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-gold-light">聯絡我們</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>台北市信義區松高路 1 號</li>
                                <li>(02) 2345-6789</li>
                                <li>service@miraclinic.com</li>
                                <li>週一至週六 10:00 - 21:00</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-gold-light">關注我們</h4>
                            <div className="flex gap-4">
                                {/* Social Icons would go here */}
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-gold transition-colors cursor-pointer">FB</div>
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-gold transition-colors cursor-pointer">IG</div>
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-gold transition-colors cursor-pointer">LINE</div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
                        © 2024 MIRA Medical Aesthetic Clinic. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
