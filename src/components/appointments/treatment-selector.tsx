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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Treatment = {
    id: string
    name: string
    description: string
    duration_minutes: number
    price: number
    is_consultation: boolean
}

interface TreatmentSelectorProps {
    selectedId?: string
    onSelect: (treatment: Treatment) => void
}

export function TreatmentSelector({ selectedId, onSelect }: TreatmentSelectorProps) {
    const [open, setOpen] = useState(false)
    const [treatments, setTreatments] = useState<Treatment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const res = await fetch('/api/treatments')
                const data = await res.json()
                if (data.treatments) {
                    setTreatments(data.treatments)
                }
            } catch (error) {
                console.error('Failed to fetch treatments', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTreatments()
    }, [])

    const selectedTreatment = treatments.find((t) => t.id === selectedId)

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12"
                    >
                        {selectedTreatment ? selectedTreatment.name : "選擇療程項目..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                        <CommandInput placeholder="搜尋療程..." />
                        <CommandList>
                            <CommandEmpty>找不到相關療程</CommandEmpty>
                            <CommandGroup>
                                {treatments.map((treatment) => (
                                    <CommandItem
                                        key={treatment.id}
                                        value={treatment.name}
                                        onSelect={() => {
                                            onSelect(treatment)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedId === treatment.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{treatment.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {treatment.duration_minutes} 分鐘 • ${treatment.price}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedTreatment && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{selectedTreatment.name}</CardTitle>
                            <Badge variant={selectedTreatment.is_consultation ? "secondary" : "default"}>
                                {selectedTreatment.is_consultation ? "初診諮詢" : "一般療程"}
                            </Badge>
                        </div>
                        <CardDescription>{selectedTreatment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">預估時間</span>
                            <span className="font-medium">{selectedTreatment.duration_minutes} 分鐘</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">參考價格</span>
                            <span className="font-medium">${selectedTreatment.price}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
