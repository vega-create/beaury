import IntakeForm from '@/components/forms/intake-form'

export default function IntakeFormPage({ params }: { params: { appointmentId: string } }) {
    return <IntakeForm appointmentId={params.appointmentId} />
}
