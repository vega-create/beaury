'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Doctor = {
    id: string
    full_name: string
    specialization: string[]
    bio: string
}

interface DoctorSelectorProps {
    selectedId?: string
    onSelect: (doctorId: string) => void
}

export function DoctorSelector({ selectedId, onSelect }: DoctorSelectorProps) {
    const [open, setOpen] = useState(false)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/doctors')
                const data = await res.json()
                if (data.doctors) {
                    setDoctors(data.doctors)
                }
            } catch (error) {
                console.error('Failed to fetch doctors', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDoctors()
    }, [])

    const selectedDoctor = doctors.find((d) => d.id === selectedId)

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-14"
                    >
                        {selectedDoctor ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback>{selectedDoctor.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-sm font-medium">{selectedDoctor.full_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {selectedDoctor.specialization.join(', ')}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            "選擇醫師..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                        <CommandInput placeholder="搜尋醫師..." />
                        <CommandList>
                            <CommandEmpty>找不到相關醫師</CommandEmpty>
                            <CommandGroup>
                                {doctors.map((doctor) => (
                                    <CommandItem
                                        key={doctor.id}
                                        value={doctor.full_name}
                                        onSelect={() => {
                                            onSelect(doctor.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedId === doctor.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{doctor.full_name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {doctor.specialization.join(', ')}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedDoctor && (
                <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                    {selectedDoctor.bio}
                </div>
            )}
        </div>
    )
}
