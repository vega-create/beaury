'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// 定義我們要匯出的資料格式
interface Appointment {
    id: string
    appointment_date: string
    start_time: string
    status: string
    queue_number: number | null
    patient_name: string
    patient_phone: string
    doctor_name: string
    treatment_name: string
}

export default function ExportAppointmentsButton({ data }: { data: any[] }) {
    const handleExport = () => {
        // 1. 整理資料格式
        const formattedData = data.map(apt => ({
            日期: apt.appointment_date,
            時間: apt.start_time.slice(0, 5),
            掛號號碼: apt.queue_number || '-',
            病患姓名: apt.is_guest ? apt.guest_name : apt.profiles?.full_name || '未知',
            電話: apt.is_guest ? apt.guest_phone : apt.profiles?.phone || '-',
            醫師: apt.doctors?.profiles?.full_name || '-',
            療程: apt.treatments?.name || '-',
            狀態: apt.status === 'pending' ? '待確認' :
                  apt.status === 'confirmed' ? '已確認' :
                  apt.status === 'completed' ? '已完成' :
                  apt.status === 'cancelled' ? '已取消' : apt.status
        }))

        // 2. 製作 CSV 內容 (處理中文編碼)
        const headers = Object.keys(formattedData[0] || {}).join(',')
        const rows = formattedData.map(obj => Object.values(obj).map(v => `"${v}"`).join(','))
        const csvContent = '\uFEFF' + [headers, ...rows].join('\n') // \uFEFF 是 BOM，讓 Excel 能正確讀取中文

        // 3. 觸發下載
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `預約清單_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> 匯出 CSV
        </Button>
    )
}
