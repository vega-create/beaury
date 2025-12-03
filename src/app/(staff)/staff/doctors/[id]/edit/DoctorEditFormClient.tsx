'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface Doctor {
    id: string
    user_id: string
    license_number: string
    specialization: string[]
    bio: string | null
    is_active: boolean
    profiles: {
        id: string
        full_name: string
        email: string
        phone: string | null
    }
}

interface Props {
    doctor: Doctor
}

export default function DoctorEditFormClient({ doctor }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: doctor.profiles?.full_name || '',
        phone: doctor.profiles?.phone || '',
        license_number: doctor.license_number || '',
        specialization: doctor.specialization?.join(', ') || '',
        bio: doctor.bio || '',
        is_active: doctor.is_active,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                })
                .eq('id', doctor.user_id)

            if (profileError) throw profileError

            const { error: doctorError } = await supabase
                .from('doctors')
                .update({
                    license_number: formData.license_number,
                    specialization: formData.specialization.split(',').map(s => s.trim()).filter(Boolean),
                    bio: formData.bio,
                    is_active: formData.is_active,
                })
                .eq('id', doctor.id)

            if (doctorError) throw doctorError

            alert('更新成功！')
            router.push('/staff/doctors')
            router.refresh()
        } catch (error) {
            console.error('更新失敗:', error)
            alert('更新失敗，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="space-y-2">
                <Label htmlFor="full_name">醫師姓名</Label>
                <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">聯絡電話</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="license_number">執照號碼</Label>
                <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="specialization">專長項目</Label>
                <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="皮膚科, 醫美, 雷射治療（用逗號分隔）"
                />
                <p className="text-xs text-muted-foreground">多個專長請用逗號分隔</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">醫師簡介</Label>
                <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="醫師學經歷、專業背景..."
                />
            </div>
            
             <div className="flex items-center gap-3 rounded-lg border p-4">
             <input
                 type="checkbox"
                 id="is_active"
                 checked={formData.is_active}
                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                 className="h-5 w-5"
               />
              <div>
             <Label htmlFor="is_active">執業狀態</Label>
             <p className="text-sm text-muted-foreground">
            {formData.is_active ? '目前為執業中狀態' : '目前為停用狀態'}
          </p>
          </div>
     </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? '儲存中...' : '儲存變更'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    取消
                </Button>
            </div>
        </form>
    )
}
