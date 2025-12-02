import { z } from 'zod';

export const appointmentSchema = z.object({
    doctor_id: z.string().uuid('醫師 ID 格式錯誤'),
    treatment_id: z.string().uuid('療程 ID 格式錯誤'),
    appointment_type: z.enum(['consultation', 'treatment']).optional(),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式錯誤'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, '時間格式錯誤'),
    notes: z.string().optional(),
    // Guest fields
    is_guest: z.boolean().optional(),
    guest_name: z.union([z.string().min(1), z.literal('')]).optional(),
    guest_phone: z.union([z.string().min(1), z.literal('')]).optional(),
    guest_email: z.union([z.string().email('Email 格式錯誤'), z.literal('')]).optional(),
});

export const availableSlotsSchema = z.object({
    doctor_id: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    treatment_id: z.string().uuid()
});
