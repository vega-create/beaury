-- Queue Number System Migration
-- Adds queue number tracking and clinic settings for daily appointment limits

-- 1. Create clinic_settings table for configuration
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add queue_number column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS queue_number INTEGER;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_queue_lookup 
ON appointments(doctor_id, appointment_date, queue_number);

-- 4. Insert default clinic settings
INSERT INTO clinic_settings (setting_key, setting_value)
VALUES ('daily_appointment_limit_per_doctor', '{"limit": 30}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Add RLS policies for clinic_settings
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings
DROP POLICY IF EXISTS "Anyone can read clinic settings" ON clinic_settings;
CREATE POLICY "Anyone can read clinic settings"
ON clinic_settings FOR SELECT
TO authenticated
USING (true);

-- Only staff can update settings
DROP POLICY IF EXISTS "Only staff can update clinic settings" ON clinic_settings;
CREATE POLICY "Only staff can update clinic settings"
ON clinic_settings FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('receptionist', 'doctor', 'admin')
    )
);

COMMENT ON TABLE clinic_settings IS 'Stores clinic configuration settings';
COMMENT ON COLUMN appointments.queue_number IS 'Daily queue number for each appointment';
