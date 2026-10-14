-- Lumos Absession - Database Views
-- Eksekusi file ini setelah 01_schema.sql

-- View untuk memudahkan agregasi detail profil pegawai
CREATE OR REPLACE VIEW vw_employee_details AS
SELECT 
    e.id AS employee_id, 
    e.employee_code, 
    e.status, 
    u.email, 
    u.is_active AS user_active,
    ep.full_name, 
    ep.phone, 
    b.name AS unit_name, 
    b.type AS unit_type
FROM employees e
JOIN users u ON e.user_id = u.id
JOIN employee_profiles ep ON e.id = ep.employee_id
JOIN business_units b ON e.unit_id = b.id;

-- View untuk rekap harian absensi
CREATE OR REPLACE VIEW vw_daily_attendance AS
SELECT 
    a.id, 
    a.date, 
    a.check_in, 
    a.check_out, 
    a.status, 
    a.late_minutes, 
    a.penalty_amount,
    e.employee_code, 
    ep.full_name, 
    ws.name AS shift_name,
    b.name AS unit_name
FROM attendance_records a
JOIN employees e ON a.employee_id = e.id
JOIN employee_profiles ep ON e.id = ep.employee_id
JOIN business_units b ON e.unit_id = b.id
LEFT JOIN work_shifts ws ON a.shift_id = ws.id;
