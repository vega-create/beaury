-- 1. 修正 RLS Policies

-- 允許所有人查看醫師的 Profile (姓名等)
CREATE POLICY "Public can view doctor profiles" ON profiles
  FOR SELECT USING (role = 'doctor');

-- 允許所有人查看有效的班表
CREATE POLICY "Public can view active schedules" ON schedules
  FOR SELECT USING (is_active = true);

-- 2. 插入測試資料 (如果沒有的話)

-- 插入醫師 Profile (如果不存在)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'doctor1@example.com', 'password', now(), 'authenticated', '{"full_name": "王大明 醫師", "phone": "0911111111", "role": "doctor"}'),
  ('00000000-0000-0000-0000-000000000002', 'doctor2@example.com', 'password', now(), 'authenticated', '{"full_name": "陳小美 醫師", "phone": "0922222222", "role": "doctor"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, full_name, phone, email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'doctor', '王大明 醫師', '0911111111', 'doctor1@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'doctor', '陳小美 醫師', '0922222222', 'doctor2@example.com')
ON CONFLICT (id) DO UPDATE SET role = 'doctor';

-- 插入 Doctors
INSERT INTO doctors (id, profile_id, license_number, specialization, bio, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'L12345', ARRAY['皮秒雷射', '微整注射'], '王醫師專精於雷射光療...', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'L67890', ARRAY['音波拉提', '抗衰老'], '陳醫師擁有多年醫美經驗...', true)
ON CONFLICT (id) DO NOTHING;

-- 插入 Schedules (王醫師: 週一/週三/週五, 陳醫師: 週二/週四/週六)
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, effective_from)
VALUES 
  ('00000000-0000-0000-0000-000000000003', 'monday', '10:00', '17:00', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000003', 'wednesday', '14:00', '21:00', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000003', 'friday', '10:00', '17:00', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000004', 'tuesday', '10:00', '17:00', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000004', 'thursday', '14:00', '21:00', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000004', 'saturday', '10:00', '15:00', '2024-01-01')
ON CONFLICT DO NOTHING;

-- 插入 Treatments
INSERT INTO treatments (name, description, duration_minutes, price, is_active)
VALUES
  ('皮秒雷射', 'PicoSure 皮秒雷射', 60, 8000, true),
  ('音波拉提', 'Ulthera 音波拉提', 90, 25000, true),
  ('肉毒桿菌', 'Botox 除皺', 30, 5000, true)
ON CONFLICT DO NOTHING;
