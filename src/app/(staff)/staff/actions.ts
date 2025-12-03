'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const doctorSchema = z.object({
    email: z.string().email(),
    licenseNumber: z.string().min(1, '請輸入執照號碼'),
    specialization: z.string().min(1, '請輸入專長項目'),
    bio: z.string().optional(),
})

export async function createDoctor(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        licenseNumber: formData.get('licenseNumber'),
        specialization: formData.get('specialization'),
        bio: formData.get('bio'),
    }

    const validated = doctorSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: '資料格式錯誤' }
    }

    const { email, licenseNumber, specialization, bio } = validated.data

    // 1. Find user by email
    // Note: We can only find by email if we have access to auth.users (requires service role)
    // OR if we look up in public.profiles (if email is stored there)
    // Our profiles table HAS email column.

    const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (findError || !profile) {
        return { error: '找不到此 Email 的使用者，請確認該醫師已註冊帳號。' }
    }

    // 2. Update profile role to 'doctor'
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'doctor' })
        .eq('id', profile.id)

    if (updateError) {
        console.error('Update role error:', updateError)
        return { error: '無法更新使用者權限 (RLS 錯誤?)' }
    }

    // 3. Insert into doctors table
    const { error: insertError } = await supabase
        .from('doctors')
        .insert({
            profile_id: profile.id,
            license_number: licenseNumber,
            specialization: specialization.split(',').map(s => s.trim()), // Split by comma
            bio: bio,
            is_active: true
        })

    if (insertError) {
        console.error('Insert doctor error:', insertError)
        return { error: '建立醫師資料失敗' }
    }

    revalidatePath('/staff/doctors')
    redirect('/staff/doctors')
}

const scheduleSchema = z.object({
    doctorId: z.string().uuid(),
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    capacity: z.coerce.number().min(1),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function createSchedule(formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        doctorId: formData.get('doctorId'),
        dayOfWeek: formData.get('dayOfWeek'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        capacity: formData.get('capacity'),
        effectiveFrom: formData.get('effectiveFrom'),
    }

    const validated = scheduleSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: '資料格式錯誤: ' + JSON.stringify(validated.error.flatten()) }
    }

    const { doctorId, dayOfWeek, startTime, endTime, capacity, effectiveFrom } = validated.data

    const { error } = await supabase
        .from('schedules')
        .insert({
            doctor_id: doctorId,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            capacity: capacity,
            effective_from: effectiveFrom,
            is_active: true
        })

    if (error) {
        console.error('Create schedule error:', error)
        if (error.code === '23P01') { // Exclusion violation
            return { error: '該時段與現有排班衝突，請檢查時間。' }
        }
        return { error: '建立排班失敗' }
    }

    revalidatePath('/staff/schedules')
    redirect('/staff/schedules')
}

// ★ 新增：更新使用者角色的功能
export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()

  // 1. 安全檢查：確認操作者自己必須是 admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未登入')

  const { data: operatorProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (operatorProfile?.role !== 'admin') {
    throw new Error('權限不足：只有管理員可以修改他人權限')
  }

  // 2. 執行更新
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Update role error:', error)
    throw new Error('更新失敗')
  }

  // 3. 更新畫面
  revalidatePath('/staff/users')
  return { success: true }
}
