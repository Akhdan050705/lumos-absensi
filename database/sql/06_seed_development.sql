-- =========================================================================
-- PERINGATAN KERAS: 
-- FILE INI HANYA UNTUK KEPERLUAN DEVELOPMENT LOKAL / PENGUJIAN.
-- JANGAN PERNAH DIJALANKAN DI DATABASE PRODUCTION!
--
-- File ini menggunakan INSERT ON DUPLICATE KEY dan INSERT IGNORE
-- sehingga aman dijalankan ulang (idempotent) tanpa duplikasi/data yatim.
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Password untuk semua akun development ini adalah: password
INSERT INTO users (id, name, email, password, must_change_password) VALUES
(1, 'Owner Utama', 'owner@lumos.com', '$2y$12$QQ8fSgTLB1BxZKnHe2g6xO9MnGz4u32hJeo0NoBq9nC3hODcoOCda', 0),
(2, 'Fajar Pratama', 'fajar@lumos.com', '$2y$12$QQ8fSgTLB1BxZKnHe2g6xO9MnGz4u32hJeo0NoBq9nC3hODcoOCda', 1),
(3, 'Siti Rahma', 'siti@lumos.com', '$2y$12$QQ8fSgTLB1BxZKnHe2g6xO9MnGz4u32hJeo0NoBq9nC3hODcoOCda', 1),
(4, 'Budi Santoso', 'budi@luxeast.com', '$2y$12$QQ8fSgTLB1BxZKnHe2g6xO9MnGz4u32hJeo0NoBq9nC3hODcoOCda', 1)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), email = VALUES(email), 
    password = VALUES(password), must_change_password = VALUES(must_change_password);

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 2), (4, 3);

INSERT INTO employees (id, user_id, unit_id, employee_code, status) VALUES
(1, 2, 1, 'LUM-001', 'active'),
(2, 3, 1, 'LUM-002', 'active'),
(3, 4, 2, 'LUX-001', 'active')
ON DUPLICATE KEY UPDATE 
    user_id = VALUES(user_id), unit_id = VALUES(unit_id), 
    employee_code = VALUES(employee_code), status = VALUES(status);

INSERT INTO employee_profiles (employee_id, full_name, phone, bank_name, bank_account) VALUES
(1, 'Fajar Pratama', '08111111111', 'BCA', '1234567890'),
(2, 'Siti Rahma', '08222222222', 'Mandiri', '0987654321'),
(3, 'Budi Santoso', '08333333333', 'BRI', '1122334455')
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name), phone = VALUES(phone), 
    bank_name = VALUES(bank_name), bank_account = VALUES(bank_account);

INSERT INTO work_shifts (id, unit_id, name, start_time, end_time) VALUES
(1, 1, 'Shift 1', '09:00:00', '17:00:00'),
(2, 1, 'Shift 2', '15:00:00', '23:00:00'),
(3, 2, 'Shift Reguler', '11:00:00', '21:00:00')
ON DUPLICATE KEY UPDATE 
    unit_id = VALUES(unit_id), name = VALUES(name), 
    start_time = VALUES(start_time), end_time = VALUES(end_time);

SET FOREIGN_KEY_CHECKS = 1;
