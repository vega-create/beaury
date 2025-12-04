---
description: How to deploy the Medical Clinic Booking app to Vercel
---

# Deploying to Vercel

這個應用已經配置為可以在 Vercel 上順利部署。請按照以下步驟操作。

## ⚠️ 重要前置條件

在開始部署前，請確保：

1. ✅ 代碼已推送到 GitHub repository: `vega-create/beaury`
2. ✅ Supabase 項目已建立並正常運行
3. ✅ 已從 Supabase Dashboard 獲取 API 憑證

## 部署步驟

### 1. 登入 Vercel

- 前往 [vercel.com](https://vercel.com) 並登入
- 確保你有權限訪問部署項目的組織/帳號

### 2. 導入項目

- 點擊 **"Add New..."** → **"Project"**
- 在 "Import Git Repository" 區域，找到 `vega-create/beaury` 
- 點擊 **"Import"**

### 3. 配置項目

#### Framework Preset
- Vercel 會自動檢測到 **Next.js**
- 確認 Framework 是 `Next.js`

#### Root Directory
- 保持默認值 `./`

#### Build 和 Output 設置
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

這些通常會自動檢測，無需手動設置。

### 4. **設置環境變數（必需！）**

這是最關鍵的步驟！展開 **"Environment Variables"** 區域：

#### 必需的環境變數

添加以下兩個環境變數：

**變數 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: 你的 Supabase 項目 URL
  - 從 Supabase Dashboard → Settings → API → Project URL 複製
  - 格式類似：`https://xxxxxxxxxxxxx.supabase.co`

**變數 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: 你的 Supabase Anon/Public Key
  - 從 Supabase Dashboard → Settings → API → Project API keys → anon public 複製
  - 是一個長的 JWT token

#### 環境設置

確保這兩個環境變數應用到所有環境：
- ✅ Production
- ✅ Preview  
- ✅ Development

### 5. 部署

- 點擊 **"Deploy"** 按鈕
- Vercel 會開始構建你的項目
- 等待 1-3 分鐘完成部署

### 6. 驗證部署

部署完成後：

1. 點擊 "Visit" 按鈕訪問你的應用
2. 測試以下功能：
   - ✅ 首頁能正常加載
   - ✅ 可以訪問登入頁面
   - ✅ 預約流程能正常運作
   - ✅ 後台管理功能正常

## 故障排除

### ❌ Build 失敗

**症狀**: Vercel Build 階段失敗

**可能原因與解決方案**:
1. **環境變數未設置**: 
   - 檢查是否已添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 確保沒有多餘的空格或引號

2. **依賴項問題**:
   - 檢查 Build Logs 中的錯誤訊息
   - 確保 `package.json` 中的依賴版本正確

3. **TypeScript 錯誤**:
   - 在本地運行 `npm run build` 檢查是否有錯誤
   - 修復所有 TypeScript 編譯錯誤後重新部署

### ❌ 部署成功但頁面空白或報錯

**症狀**: 部署成功，但訪問頁面時出現錯誤或空白

**可能原因與解決方案**:

1. **環境變數不正確**:
   - 前往 Vercel Dashboard → Settings → Environment Variables
   - 檢查 Supabase URL 和 Key 是否正確
   - 修改後需要 **Redeploy** 才會生效

2. **Supabase 連接問題**:
   - 在瀏覽器開發者工具中查看 Console 錯誤
   - 確認 Supabase 項目狀態為 "Active"
   - 檢查 Supabase 的 Network 規則是否允許訪問

3. **數據庫表不存在**:
   - 確保已在 Supabase 執行所有 SQL 遷移腳本
   - 檢查 RLS (Row Level Security) policies 是否正確設置

### ❌ 功能無法正常運作

**症狀**: 應用能訪問，但某些功能（如登入、預約）失敗

**檢查清單**:

1. **Supabase Auth 設置**:
   - 前往 Supabase Dashboard → Authentication → Settings
   - 確認 "Site URL" 設置為你的 Vercel domain
   - 將 Vercel domain 添加到 "Redirect URLs" 列表

2. **RLS Policies**:
   - 確保 `profiles`, `doctors`, `appointments`, `schedules` 表的 RLS policies 已正確設置
   - 可以在 Supabase Dashboard → Table Editor 中檢查

3. **API Routes**:
   - 檢查 Vercel Functions Logs
   - 前往 Vercel Dashboard → Deployments → [最新部署] → Functions

### 🔄 重新部署

如果你修改了環境變數或代碼：

1. **環境變數修改後**: 前往 Deployments → 最新部署 → 三個點 → Redeploy
2. **代碼修改後**: 直接 push 到 GitHub，Vercel 會自動觸發部署

## 檢查清單

在部署前，確認以下項目：

- [ ] GitHub repository 已更新到最新版本
- [ ] Supabase 項目已建立且狀態正常
- [ ] 已獲取 Supabase URL 和 Anon Key
- [ ] 在 Vercel 中設置了所有必需的環境變數
- [ ] 環境變數已應用到 Production, Preview, Development
- [ ] Supabase 中已執行所有 SQL 遷移腳本
- [ ] Supabase Auth Site URL 設置為 Vercel domain

## 額外資源

- [Next.js 部署文檔](https://nextjs.org/docs/deployment)
- [Vercel 環境變數指南](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase 部署最佳實踐](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 需要幫助？

如果遇到問題，請檢查：
1. Vercel Build Logs
2. Vercel Functions Logs  
3. Browser Console 錯誤
4. Supabase Dashboard Logs

詳細的環境變數配置說明請參考：`VERCEL_DEPLOYMENT.md`
