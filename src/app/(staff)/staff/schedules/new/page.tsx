import { createClient } from '@/lib/supabase/server'
import NewScheduleForm from '@/components/staff/new-schedule-form'

export default async function NewSchedulePageWrapper() {
    const supabase = await createClient()

    // Fetch active doctors for the dropdown
    const { data: doctors } = await supabase
        .from('doctors')
        .select(`
      id,
      profiles (full_name)
    `)
        .eq('is_active', true)

    // Transform the data to match the component's expected type
    const formattedDoctors = doctors?.map(d => ({
        id: d.id,
        profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
    })) || []

    return <NewScheduleForm doctors={formattedDoctors} />
}
