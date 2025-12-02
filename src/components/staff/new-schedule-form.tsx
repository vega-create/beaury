'use client'

import { useState } from 'react'
import { createSchedule } from '@/app/(staff)/staff/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type Doctor = {
    id: string
    profiles: {
        full_name: string
    }
}

export default function NewSchedulePage({
    doctors
}: {
    doctors: Doctor[]
}) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createSchedule(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>新增排班</CardTitle>
                    <CardDescription>
                        設定醫師的固定看診時段與人數上限。
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
                            <Label htmlFor="doctorId">選擇醫師</Label>
                            <Select name="doctorId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="請選擇醫師" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.profiles.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dayOfWeek">星期</Label>
                            <Select name="dayOfWeek" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="請選擇星期" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monday">週一</SelectItem>
                                    <SelectItem value="tuesday">週二</SelectItem>
                                    <SelectItem value="wednesday">週三</SelectItem>
                                    <SelectItem value="thursday">週四</SelectItem>
                                    <SelectItem value="friday">週五</SelectItem>
                                    <SelectItem value="saturday">週六</SelectItem>
                                    <SelectItem value="sunday">週日</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">開始時間</Label>
                                <Input id="startTime" name="startTime" type="time" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">結束時間</Label>
                                <Input id="endTime" name="endTime" type="time" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">可預約人數 (Capacity)</Label>
                                <Input id="capacity" name="capacity" type="number" min="1" defaultValue="1" required />
                                <p className="text-xs text-muted-foreground">該時段最多能接受幾位病患預約</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effectiveFrom">生效日期</Label>
                                <Input id="effectiveFrom" name="effectiveFrom" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                取消
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? '建立中...' : '建立排班'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
