import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              M
            </div>
            Medical Booking
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">登入</Button>
            </Link>
            <Link href="/register">
              <Button>註冊帳號</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            專業醫美療程<br />
            <span className="text-blue-600">線上預約系統</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            提供最專業的醫師團隊與頂級設備，讓您輕鬆預約諮詢與療程。
            24小時線上服務，隨時掌握您的美麗行程。
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-lg gap-2">
                立即預約 <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">線上即時預約</h3>
              <p className="text-slate-600">
                無需電話等待，隨時查看醫師班表與可預約時段，輕鬆安排您的時間。
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">專業術前評估</h3>
              <p className="text-slate-600">
                完整的線上術前評估表單，讓醫師提前了解您的狀況，提供更精準的建議。
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">療程提醒通知</h3>
              <p className="text-slate-600">
                系統自動發送預約提醒，確保您不會錯過任何重要的美麗時刻。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Medical Booking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
