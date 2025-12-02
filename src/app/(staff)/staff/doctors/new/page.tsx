'use client'

import { useState } from 'react'
import { createDoctor } from '@/app/(staff)/staff/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function NewDoctorPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createDoctor(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // If success, it redirects automatically
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>新增醫師</CardTitle>
                    <CardDescription>
                        請輸入醫師的 Email 與基本資料。
                        <br />
                        <span className="text-amber-600 font-medium">注意：該醫師必須已經自行註冊過帳號。</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>錯誤</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">醫師 Email (已註冊帳號)</Label>
                            <Input id="email" name="email" type="email" placeholder="doctor@example.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">執照號碼</Label>
                            <Input id="licenseNumber" name="licenseNumber" placeholder="DOC-12345" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialization">專長項目 (用逗號分隔)</Label>
                            <Input id="specialization" name="specialization" placeholder="皮膚科, 微整型, 雷射" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">個人簡介</Label>
                            <Textarea id="bio" name="bio" placeholder="請輸入醫師的學經歷與簡介..." rows={4} />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                取消
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? '建立中...' : '建立醫師資料'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
