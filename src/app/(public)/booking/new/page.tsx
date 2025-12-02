'use client'

import BookingWizard from '@/components/public/booking-wizard'

export default function NewBookingPage() {
    return (
        <div className="min-h-screen bg-cream py-12">
            <div className="container mx-auto px-4">
                <BookingWizard />
            </div>
        </div>
    )
}
