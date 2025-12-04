-- ==========================================
-- 綜合修復腳本：資料庫 Schema 與權限
-- ==========================================

-- 1. 確保 Appointments 表支持訪客預約
-- ------------------------------------------

-- 允許 customer_id 為空 (如果還不是的話)
DO $$ 
BEGIN 
  ALTER TABLE appointments ALTER COLUMN customer_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL; -- 忽略錯誤
END $$;

-- 新增訪客欄位 (如果不存在)
DO $$ 
BEGIN 
  BEGIN
    ALTER TABLE appointments ADD COLUMN guest_name VARCHAR(100);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE appointments ADD COLUMN guest_email VARCHAR(255);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE appointments ADD COLUMN guest_phone VARCHAR(20);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE appointments ADD COLUMN is_guest BOOLEAN DEFAULT false;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;


-- 2. 確保 RLS 策略正確 (覆蓋之前的設置)
-- ------------------------------------------

-- 先刪除舊策略
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create guest appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;

-- 重新建立：允許任何人（包括未登入訪客）新增預約
CREATE POLICY "Anyone can insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- 確保 Staff 權限
DROP POLICY IF EXISTS "Staff can insert schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can update schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can delete schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can view all schedules" ON schedules;

CREATE POLICY "Staff can insert schedules" ON schedules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'receptionist', 'doctor'))
  );

CREATE POLICY "Staff can update schedules" ON schedules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'receptionist', 'doctor'))
  );

CREATE POLICY "Staff can delete schedules" ON schedules
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'receptionist', 'doctor'))
  );

CREATE POLICY "Staff can view all schedules" ON schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'receptionist', 'doctor'))
  );
