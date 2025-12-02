'use client'

import AppointmentForm from '@/components/appointments/appointment-form'

export default function NewAppointmentPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-8 text-center">預約新療程</h1>
            <AppointmentForm />
        </div>
    )
}
