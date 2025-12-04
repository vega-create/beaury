import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 在 build 時，如果環境變數缺失，使用佔位符
  // 這只是為了讓 build 通過，實際運行時必須有真實的環境變數
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createBrowserClient(supabaseUrl, supabaseKey)
}
