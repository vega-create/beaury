-- 安全查詢預約函數 (供訪客查詢/取消用)
CREATE OR REPLACE FUNCTION get_appointments_by_phone(p_phone TEXT)
RETURNS TABLE (
  id UUID,
  appointment_date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT,
  queue_number INTEGER,
  doctor_name TEXT,
  treatment_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    a.queue_number,
    p.full_name as doctor_name,
    t.name as treatment_name
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles p ON d.id = p.id
  LEFT JOIN treatments t ON a.treatment_id = t.id
  WHERE (a.guest_phone = p_phone OR EXISTS (
    SELECT 1 FROM profiles u WHERE u.id = a.customer_id AND u.phone = p_phone
  ))
  AND a.appointment_date >= CURRENT_DATE
  AND a.status != 'cancelled'
  ORDER BY a.appointment_date, a.start_time;
END;
$$;

GRANT EXECUTE ON FUNCTION get_appointments_by_phone TO public, anon, authenticated;

-- 允許訪客取消自己的預約 (透過 ID 和電話驗證)
CREATE OR REPLACE FUNCTION cancel_appointment_by_guest(p_appointment_id UUID, p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 檢查預約是否存在且匹配電話
  SELECT COUNT(*) INTO v_count
  FROM appointments a
  LEFT JOIN profiles p ON a.customer_id = p.id
  WHERE a.id = p_appointment_id
  AND (a.guest_phone = p_phone OR p.phone = p_phone);

  IF v_count > 0 THEN
    UPDATE appointments SET status = 'cancelled' WHERE id = p_appointment_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_appointment_by_guest TO public, anon, authenticated;
