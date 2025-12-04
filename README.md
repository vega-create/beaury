# 醫療診所預約系統 (Medical Clinic Booking System)

一個基於 Next.js 16 和 Supabase 的全功能醫療診所預約管理系統。

## 功能特色

### 🏥 前台功能
- 🔐 用戶註冊與登入
- 📅 線上預約療程
- 👥 訪客預約（無需註冊）
- 🔢 自動排號系統
- 📱 響應式設計

### 👨‍💼 後台管理
- 👨‍⚕️ 醫師資料管理
- 📋 預約列表與狀態管理
- ⏰ 醫師排班管理
- 👥 用戶權限管理
- 📊 診所設置與統計
- 📤 預約資料匯出

## 技術棧

- **框架**: Next.js 16 (App Router)
- **資料庫**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + Radix UI
- **表單驗證**: React Hook Form + Zod
- **部署**: Vercel

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設置

創建 `.env.local` 文件並添加以下變數：

```env
NEXT_PUBLIC_SUPABASE_URL=你的-Supabase-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的-Supabase-Anon-Key
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用。

## 部署到 Vercel

### ⚠️ 重要提醒

在部署前，**必須**在 Vercel 中設置環境變數！

詳細的部署指南請查看：**[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

### 快速部署步驟

1. 推送代碼到 GitHub
2. 在 Vercel 導入項目
3. **設置環境變數**（非常重要！）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

## 項目結構

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認證相關頁面
│   ├── (customer)/        # 客戶前台頁面
│   ├── (public)/          # 公開頁面
│   ├── (staff)/           # 後台管理頁面
│   └── api/               # API Routes
├── components/            # React 組件
│   ├── ui/               # UI 基礎組件
│   ├── appointments/     # 預約相關組件
│   ├── public/           # 公開頁面組件
│   └── staff/            # 後台管理組件
└── lib/                  # 工具函數與配置
    ├── supabase/         # Supabase 客戶端
    ├── utils/            # 工具函數
    └── validations/      # 表單驗證
```

## 資料庫設置

請確保在 Supabase 中執行以下 SQL 遷移腳本：

1. `fix_data_and_policies.sql` - 基礎資料表與 RLS 策略
2. `guest_booking_migration.sql` - 訪客預約功能
3. `add_queue_number_system.sql` - 排號系統

## 常見問題

### Build 失敗？
- 確保環境變數已正確設置
- 檢查 Supabase 連接是否正常

### 部署後無法加載數據？
- 檢查 Vercel 環境變數設置
- 確認 Supabase RLS policies 已正確配置

### 更多問題？
查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 獲取詳細的故障排除指南。

## 開發指南

### 運行測試
```bash
npm run lint
```

### 構建生產版本
```bash
npm run build
```

### 啟動生產伺服器
```bash
npm start
```

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！
