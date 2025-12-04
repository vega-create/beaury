-- 創建安全的資料庫函數供 API 使用 (繞過 RLS)

-- 1. 獲取醫師當日的已預約時段 (只返回時間，不返回個資)
CREATE OR REPLACE FUNCTION get_doctor_booked_slots(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS TABLE (start_time TIME, end_time TIME)
LANGUAGE plpgsql
SECURITY DEFINER -- 以函數創建者(admin)權限執行
AS $$
BEGIN
  RETURN QUERY
  SELECT a.start_time, a.end_time
  FROM appointments a
  WHERE a.doctor_id = p_doctor_id
  AND a.appointment_date = p_date
  AND a.status IN ('pending', 'confirmed');
END;
$$;

-- 2. 獲取醫師當日的最大掛號號碼
CREATE OR REPLACE FUNCTION get_doctor_max_queue_number(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- 以函數創建者(admin)權限執行
AS $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT MAX(queue_number)
  INTO max_num
  FROM appointments
  WHERE doctor_id = p_doctor_id
  AND appointment_date = p_date;
  
  RETURN COALESCE(max_num, 0);
END;
$$;

-- 3. 獲取醫師當日已預約人數 (用於檢查每日上限)
CREATE OR REPLACE FUNCTION get_doctor_appointment_count(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- 以函數創建者(admin)權限執行
AS $$
DECLARE
  count_num INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_num
  FROM appointments
  WHERE doctor_id = p_doctor_id
  AND appointment_date = p_date
  AND status != 'cancelled';
  
  RETURN count_num;
END;
$$;

-- 賦予 Public 執行權限 (因為訪客需要調用)
GRANT EXECUTE ON FUNCTION get_doctor_booked_slots TO public;
GRANT EXECUTE ON FUNCTION get_doctor_booked_slots TO anon;
GRANT EXECUTE ON FUNCTION get_doctor_booked_slots TO authenticated;

GRANT EXECUTE ON FUNCTION get_doctor_max_queue_number TO public;
GRANT EXECUTE ON FUNCTION get_doctor_max_queue_number TO anon;
GRANT EXECUTE ON FUNCTION get_doctor_max_queue_number TO authenticated;

GRANT EXECUTE ON FUNCTION get_doctor_appointment_count TO public;
GRANT EXECUTE ON FUNCTION get_doctor_appointment_count TO anon;
GRANT EXECUTE ON FUNCTION get_doctor_appointment_count TO authenticated;
