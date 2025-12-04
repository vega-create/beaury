-- 修復 Staff 查看預約的權限

-- 先刪除舊策略（如果存在）
DROP POLICY IF EXISTS "Staff can view all appointments" ON appointments;

-- 重新建立：允許 Staff (Admin, Receptionist, Doctor) 查看所有預約
CREATE POLICY "Staff can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'receptionist', 'doctor')
    )
  );
