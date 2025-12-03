'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function ExportAppointmentsButton({ data }: { data: any[] }) {
    const handleExport = () => {
        // 1. 整理資料格式 (移除了「掛號號碼」)
        const formattedData = data.map(apt => ({
            預約日期: apt.appointment_date,
            預約時間: apt.start_time.slice(0, 5),
            // 原本這裡有掛號號碼，現在移除了
            病患姓名: apt.is_guest ? (apt.guest_name + '(訪)') : (apt.profiles?.full_name || '未知'),
            電話: apt.is_guest ? apt.guest_phone : apt.profiles?.phone || '-',
            Email: apt.is_guest ? apt.guest_email : apt.profiles?.email || '-',
            醫師: apt.doctors?.profiles?.full_name || '-',
            療程: apt.treatments?.name || '-',
            狀態: apt.status === 'pending' ? '待確認' :
                  apt.status === 'confirmed' ? '已確認' :
                  apt.status === 'completed' ? '已完成' :
                  apt.status === 'cancelled' ? '已取消' :
                  apt.status === 'no_show' ? '未出席' : apt.status
        }))

        // 2. 製作 CSV 內容 (處理中文編碼 BOM \uFEFF)
        const headers = Object.keys(formattedData[0] || {}).join(',')
        const rows = formattedData.map(obj => 
            Object.values(obj).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')
        )
        const csvContent = '\uFEFF' + [headers, ...rows].join('\n')

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
        <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> 
            匯出 CSV
        </Button>
    )
}
