import { z } from 'zod';

export const appointmentSchema = z.object({
    doctor_id: z.string().uuid('醫師 ID 格式錯誤'),
    treatment_id: z.string().uuid('療程 ID 格式錯誤'),
    appointment_type: z.enum(['consultation', 'treatment'], {
        errorMap: () => ({ message: '預約類型必須為初診或療程' })
  doctor_id: z.string().uuid(),
        treatment_id: z.string().uuid(),
        appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().optional(),
        // Guest fields
        is_guest: z.boolean().optional(),
        guest_name: z.string().optional(),
        guest_phone: z.string().optional(),
        guest_email: z.string().email().optional(),
    });

    export const availableSlotsSchema = z.object({
        doctor_id: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        treatment_id: z.string().uuid()
    });
