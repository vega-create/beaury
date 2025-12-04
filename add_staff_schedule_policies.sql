-- 允許 Staff (Admin, Receptionist, Doctor) 管理排班

-- 1. 允許 Staff 新增排班
CREATE POLICY "Staff can insert schedules" ON schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );

-- 2. 允許 Staff 更新排班
CREATE POLICY "Staff can update schedules" ON schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );

-- 3. 允許 Staff 刪除排班
CREATE POLICY "Staff can delete schedules" ON schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );

-- 4. 確保 Staff 可以查看所有排班（包括不活躍的）
-- 先刪除舊的只允許查看活躍排班的策略（如果需要更寬鬆的權限）
-- 或者添加一個新的策略
CREATE POLICY "Staff can view all schedules" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );
