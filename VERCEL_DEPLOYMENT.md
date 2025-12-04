# Vercel 部署指南

## 重要：環境變數設置

在 Vercel 部署時，**必須**設置以下環境變數，否則應用將無法正常運行：

### 必需的環境變數

```env
NEXT_PUBLIC_SUPABASE_URL=你的-Supabase-項目-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的-Supabase-Anon-Key
```

### 如何在 Vercel 設置環境變數

1. 在 Vercel Dashboard 中打開你的項目
2. 進入 **Settings** → **Environment Variables**
3. 添加以下兩個變數：
   - **變數名稱**: `NEXT_PUBLIC_SUPABASE_URL`
     **值**: 從 Supabase Dashboard → Settings → API 複製 "Project URL"
   - **變數名稱**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     **值**: 從 Supabase Dashboard → Settings → API 複製 "anon public" key
4. 確保環境變數應用到 **Production**, **Preview**, 和 **Development** 環境
5. 點擊 **Save**
6. 重新部署項目（Vercel 會自動觸發）

### Supabase 設置

確保你的 Supabase 項目已經：

1. ✅ 創建了所有必要的資料表（doctors, profiles, appointments, schedules 等）
2. ✅ 設置了正確的 Row Level Security (RLS) policies
3. ✅ 執行了所有的遷移 SQL 腳本

### 本地開發

如果你在本地開發，請創建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

然後編輯 `.env.local` 並填入你的 Supabase 憑證。

### 常見問題

**Q: 部署後看到 "Network Error" 或連接失敗**
A: 檢查環境變數是否正確設置，特別是 Supabase URL 和 Key

**Q: Build 成功但頁面無法加載數據**
A: 檢查 Supabase RLS policies 是否正確設置

**Q: 登入失敗**
A: 確保 Supabase Auth 已啟用，並檢查 Site URL 設置

## 快速部署命令

如果你已經設置好環境變數，部署很簡單：

```bash
# 推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push

# Vercel 會自動檢測並部署
```

## 需要幫助？

查看完整的部署工作流程：`.agent/workflows/deploy_to_vercel.md`
