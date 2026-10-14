-- Patch: Add early leave columns to attendance_records, insert Full Shift, and streamline leave_types

-- 1. Tambah kolom pulang lebih awal di attendance_records
ALTER TABLE attendance_records 
    ADD COLUMN IF NOT EXISTS early_leave_minutes INT DEFAULT 0 AFTER waived_reason,
    ADD COLUMN IF NOT EXISTS early_leave_reason VARCHAR(255) NULL AFTER early_leave_minutes,
    ADD COLUMN IF NOT EXISTS early_leave_notes TEXT NULL AFTER early_leave_reason,
    ADD COLUMN IF NOT EXISTS early_leave_status VARCHAR(50) DEFAULT 'none' AFTER early_leave_notes,
    ADD COLUMN IF NOT EXISTS early_leave_penalty DECIMAL(12,2) DEFAULT 0.00 AFTER early_leave_status,
    ADD COLUMN IF NOT EXISTS early_leave_approval_notes VARCHAR(255) NULL AFTER early_leave_penalty;

-- 2. Tambah shift Full Shift (10:00 - 22:00) untuk Unit 1 dan Unit 2
INSERT INTO work_shifts (id, unit_id, name, start_time, end_time, is_active, created_at, updated_at) 
VALUES 
(4, 1, 'Full Shift', '10:00:00', '22:00:00', 1, NOW(), NOW()),
(5, 2, 'Full Shift', '10:00:00', '22:00:00', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    unit_id = VALUES(unit_id),
    name = VALUES(name),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    is_active = 1;

-- 3. Sederhanakan leave_types hanya untuk Sakit dan Cuti / Tidak Masuk
UPDATE leave_types SET name = 'Izin Sakit' WHERE id = 1;
UPDATE leave_types SET name = 'Cuti / Tidak Masuk' WHERE id = 2;
DELETE FROM leave_types WHERE id > 2;
