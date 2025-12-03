import { redirect } from 'next/navigation'

export default function StaffRootPage() {
    // 當使用者訪問 /staff 時，直接轉址到儀表板
    redirect('/staff/dashboard')
}
// 觸發更新
