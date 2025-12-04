import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import UserRoleSelect from '@/components/staff/user-role-select'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()

  // 1. 取得目前登入者資訊 (為了防呆，不讓自己改壞自己)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. 檢查權限：如果不是 admin，直接踢回 dashboard
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUserProfile?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-500">
        您沒有權限訪問此頁面，僅限管理員使用。
      </div>
    )
  }

  // 3. 抓取所有使用者資料
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">人員權限管理</h2>
        <p className="text-muted-foreground">在此設定診所人員的角色與權限。</p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>目前角色</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{profile.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    {profile.full_name || '未設定'}
                  </div>
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.phone || '-'}</TableCell>
                <TableCell>
                  {/* 使用剛剛做好的下拉選單元件 */}
                  <UserRoleSelect
                    userId={profile.id}
                    currentRole={profile.role}
                    currentUserId={user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
