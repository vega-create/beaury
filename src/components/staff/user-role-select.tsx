'use client'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserRole } from '@/app/(staff)/staff/actions'

interface Props {
  userId: string
  currentRole: string
  currentUserId: string
}

export default function UserRoleSelect({ userId, currentRole, currentUserId }: Props) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const handleValueChange = async (newValue: string) => {
    if (userId === currentUserId && newValue !== 'admin') {
      if (!confirm('警告：您正在移除自己的管理員權限，確定嗎？')) return
    }

    setLoading(true)
    try {
      await updateUserRole(userId, newValue)
      setRole(newValue)
      alert('權限更新成功！')
    } catch (error) {
      alert('更新失敗，請確認您是管理員')
      setRole(currentRole)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={role} onValueChange={handleValueChange} disabled={loading}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="選擇角色" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">一般會員 (Customer)</SelectItem>
        <SelectItem value="receptionist">櫃台/護士 (Receptionist)</SelectItem>
        <SelectItem value="doctor">醫師 (Doctor)</SelectItem>
        <SelectItem value="admin">管理員 (Admin)</SelectItem>
      </SelectContent>
    </Select>
  )
}
