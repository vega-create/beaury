'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings, Loader2 } from 'lucide-react'

export default function ClinicSettings() {
    const [dailyLimit, setDailyLimit] = useState<number>(30)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/clinic-settings')
            if (res.ok) {
                const data = await res.json()
                setDailyLimit(data.daily_appointment_limit_per_doctor || 30)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/clinic-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    daily_appointment_limit_per_doctor: dailyLimit
                })
            })

            if (res.ok) {
                alert('設定已更新')
            } else {
                const error = await res.json()
                alert(error.error || '更新失敗')
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('更新失敗')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="border-gold/20">
            <CardHeader className="bg-gradient-to-r from-gold/5 to-transparent">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gold" />
                    <CardTitle>診所設定</CardTitle>
                </div>
                <CardDescription>
                    設定診所掛號與營運相關參數
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="daily-limit">
                                每日每位醫師掛號人數上限
                            </Label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    id="daily-limit"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={dailyLimit}
                                    onChange={(e) => setDailyLimit(parseInt(e.target.value) || 1)}
                                    className="max-w-[200px]"
                                />
                                <span className="text-sm text-slate-500">人/日</span>
                            </div>
                            <p className="text-xs text-slate-500">
                                設定每位醫師每日可接受的掛號人數上限（1-100人）
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gold hover:bg-gold-dark"
                            >
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                儲存設定
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
