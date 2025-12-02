'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'

interface TimeSlotPickerProps {
    doctorId: string
    treatmentId: string
    selectedDate?: Date
    selectedTime?: string
    onDateSelect: (date: Date | undefined) => void
    onTimeSelect: (time: string) => void
}

export function TimeSlotPicker({
    doctorId,
    treatmentId,
    selectedDate,
    selectedTime,
    onDateSelect,
    onTimeSelect,
}: TimeSlotPickerProps) {
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate || !doctorId || !treatmentId) {
                setAvailableSlots([])
                return
            }

            setLoading(true)
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd')
                const params = new URLSearchParams({
                    doctor_id: doctorId,
                    treatment_id: treatmentId,
                    date: dateStr,
                })

                const res = await fetch(`/api/appointments/available-slots?${params}`)
                const data = await res.json()

                if (data.available_slots) {
                    setAvailableSlots(data.available_slots)
                } else {
                    setAvailableSlots([])
                }
            } catch (error) {
                console.error('Failed to fetch slots', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSlots()
    }, [selectedDate, doctorId, treatmentId])

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    disabled={(date) => {
                        // Disable past dates and dates more than 2 months out
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const maxDate = new Date()
                        maxDate.setMonth(maxDate.getMonth() + 2)
                        return date < today || date > maxDate
                    }}
                    className="rounded-md border shadow-sm w-full"
                />
            </div>

            <div className="flex-1 min-w-[200px]">
                <h3 className="font-medium mb-3 text-sm text-slate-500">
                    {selectedDate
                        ? format(selectedDate, 'yyyy年 MM月 dd日 (EEEE)', { locale: zhTW })
                        : '請先選擇日期'}
                </h3>

                <ScrollArea className="h-[300px] rounded-md border p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            查詢中...
                        </div>
                    ) : !selectedDate ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            請選擇左側日期
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            該日無可用時段
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {availableSlots.map((slot) => (
                                <Button
                                    key={slot}
                                    variant={selectedTime === slot ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => onTimeSelect(slot)}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
