import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const dynamic = 'force-dynamic'

export default async function DoctorsPage() {
    const supabase = await createClient()

    const { data: doctors } = await supabase
        .from('doctors')
        .select(`
      *,
      profiles (full_name, email, phone)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">醫師管理</h2>
                    <p className="text-muted-foreground">管理診所醫師資料與排班設定。</p>
                </div>
                <Link href="/staff/doctors/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> 新增醫師
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>醫師姓名</TableHead>
                            <TableHead>專長項目</TableHead>
                            <TableHead>執照號碼</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {doctors?.map((doctor) => (
                            <TableRow key={doctor.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{doctor.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold">{doctor.profiles?.full_name || '未設定'}</div>
                                            <div className="text-xs text-muted-foreground">{doctor.profiles?.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {doctor.specialization?.map((spec: string) => (
                                            <Badge key={spec} variant="secondary" className="text-xs">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>{doctor.license_number}</TableCell>
                                <TableCell>
                                    <Badge variant={doctor.is_active ? 'default' : 'destructive'}>
                                        {doctor.is_active ? '執業中' : '停用'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/staff/doctors/${doctor.id}/edit`}>
                                        <Button variant="ghost" size="sm">編輯</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!doctors || doctors.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    目前沒有醫師資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
