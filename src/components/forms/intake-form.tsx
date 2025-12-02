'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function IntakeForm({ appointmentId }: { appointmentId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            appointment_id: appointmentId,
            current_medications: formData.get('current_medications'),
            past_surgeries: formData.get('past_surgeries'),
            skin_conditions: formData.get('skin_conditions'),
            previous_aesthetic_treatments: formData.get('previous_aesthetic_treatments'),
            smoking: formData.get('smoking') === 'yes',
            alcohol_consumption: formData.get('alcohol_consumption'),
            consent_given: formData.get('consent') === 'on',
        }

        try {
            const res = await fetch('/api/intake-forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error('提交失敗')

            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            alert('提交失敗，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>術前評估表單</CardTitle>
                    <CardDescription>為了您的安全，請誠實填寫以下健康資訊</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>目前是否有服用任何藥物？</Label>
                            <Textarea name="current_medications" placeholder="無，或請列出藥名..." />
                        </div>

                        <div className="space-y-2">
                            <Label>過去是否有手術病史？</Label>
                            <Textarea name="past_surgeries" placeholder="無，或請說明..." />
                        </div>

                        <div className="space-y-2">
                            <Label>是否有特殊皮膚狀況？(如敏感、濕疹)</Label>
                            <Textarea name="skin_conditions" placeholder="無，或請說明..." />
                        </div>

                        <div className="space-y-2">
                            <Label>過去做過哪些醫美療程？</Label>
                            <Textarea name="previous_aesthetic_treatments" placeholder="無，或請列出..." />
                        </div>

                        <div className="space-y-2">
                            <Label>是否抽菸？</Label>
                            <RadioGroup defaultValue="no" name="smoking" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="smoke-yes" />
                                    <Label htmlFor="smoke-yes">是</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="smoke-no" />
                                    <Label htmlFor="smoke-no">否</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Checkbox id="consent" name="consent" required />
                            <Label htmlFor="consent" className="text-sm leading-none">
                                我確認以上資訊皆屬實，並同意診所依此進行評估
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? '提交中...' : '提交表單'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
