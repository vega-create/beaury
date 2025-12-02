import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">醫美診所預約系統</h1>
                    <p className="mt-2 text-slate-600">專業、隱私、貼心的醫療服務</p>
                </div>
                {children}
            </div>
        </div>
    )
}
