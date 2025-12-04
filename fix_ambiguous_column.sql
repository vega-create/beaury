-- 修復 RPC 函數欄位歧義問題
-- 將返回欄位名稱改為 slot_start 和 slot_end

CREATE OR REPLACE FUNCTION get_doctor_booked_slots(p_doctor_id UUID, p_date DATE)
RETURNS TABLE (slot_start TIME, slot_end TIME)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT start_time, end_time 
  FROM appointments 
  WHERE doctor_id = p_doctor_id 
  AND appointment_date = p_date 
  AND status IN ('pending', 'confirmed');
END;
$$;

-- 重新賦予權限 (雖然 REPLACE 通常會保留權限，但保險起見)
GRANT EXECUTE ON FUNCTION get_doctor_booked_slots TO public, anon, authenticated;
