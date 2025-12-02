'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                // Profile creation is handled by Supabase Database Trigger
                // No manual insertion needed here to avoid RLS issues
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || '註冊失敗，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>註冊帳號</CardTitle>
                <CardDescription>建立您的專屬帳號以開始預約</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">真實姓名</Label>
                        <Input
                            id="fullName"
                            placeholder="王小明"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">手機號碼</Label>
                        <Input
                            id="phone"
                            placeholder="0912345678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">電子郵件</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">設定密碼</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '註冊中...' : '註冊'}
                    </Button>
                    <div className="text-sm text-center text-slate-600">
                        已經有帳號？{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            登入
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
