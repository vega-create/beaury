-- 確保 Appointments 表的 RLS 策略正確

-- 1. 允許認證用戶插入自己的預約
CREATE POLICY "Users can insert their own appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
  );

-- 2. 允許任何人（包括訪客）插入預約
-- 注意：這是一個比較寬鬆的策略，為了支持訪客預約。
-- 如果您希望更嚴格，可以檢查 is_guest = true
CREATE POLICY "Anyone can insert appointments" ON appointments
  FOR INSERT WITH CHECK (
    true
  );

-- 3. 允許用戶查看自己的預約
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = customer_id
  );

-- 4. 允許 Staff 查看所有預約
CREATE POLICY "Staff can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );
