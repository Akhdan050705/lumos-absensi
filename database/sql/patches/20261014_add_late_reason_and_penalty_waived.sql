-- Patch: Add late reason and penalty waiver columns to attendance_records
ALTER TABLE attendance_records 
    ADD COLUMN IF NOT EXISTS late_reason VARCHAR(255) NULL AFTER penalty_amount,
    ADD COLUMN IF NOT EXISTS late_notes TEXT NULL AFTER late_reason,
    ADD COLUMN IF NOT EXISTS penalty_waived TINYINT(1) DEFAULT 0 AFTER late_notes,
    ADD COLUMN IF NOT EXISTS waived_reason VARCHAR(255) NULL AFTER penalty_waived;
