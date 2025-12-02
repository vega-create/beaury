-- 1. 允許 customer_id 為空 (訪客預約)
ALTER TABLE appointments ALTER COLUMN customer_id DROP NOT NULL;

-- 2. 新增訪客資料欄位
ALTER TABLE appointments ADD COLUMN guest_name VARCHAR(100);
ALTER TABLE appointments ADD COLUMN guest_email VARCHAR(255);
ALTER TABLE appointments ADD COLUMN guest_phone VARCHAR(20);

-- 3. 開放訪客預約權限 (允許未登入者新增預約)
CREATE POLICY "Public can create guest appointments" ON appointments
  FOR INSERT WITH CHECK (customer_id IS NULL);

-- 4. 讓訪客也能查詢自己的預約 (透過預約 ID 或其他機制，這裡先暫時開放讀取自己的預約，但訪客沒有 ID，通常是預約成功後顯示一次)
-- 實務上通常不需要讓訪客查詢列表，只要回傳剛建立的那筆即可。
-- 既有的 "Staff can view all appointments" 仍然有效。
