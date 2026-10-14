-- Lumos Absession - Master Seeder
-- Berisi konfigurasi awal sistem dan data statis (Roles, Units, Settings, Leaves)

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO roles (id, name, slug) VALUES 
(1, 'Owner', 'owner'),
(2, 'Pegawai Lumos', 'employee_lumos'),
(3, 'Pegawai Luxeast', 'employee_luxeast')
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug);

INSERT INTO business_units (id, name, type) VALUES 
(1, 'Lumos Vape Store', 'lumos'),
(2, 'Luxeast Barbershop', 'luxeast')
ON DUPLICATE KEY UPDATE name = VALUES(name), type = VALUES(type);

-- Koordinat awal diambil dari spesifikasi
INSERT INTO unit_locations (id, unit_id, address, latitude, longitude, radius, accuracy_limit) VALUES 
(1, 1, 'Jl. Progo No.1, Citarum, Kecamatan Bandung Wetan, Kota Bandung, Jawa Barat 40115', -6.90435932, 107.61734654, 100, 50),
(2, 2, 'Jl. Tamansari Bawah No.24/58, Tamansari, Kecamatan Bandung Wetan, Kota Bandung, Jawa Barat 40166', -6.90363462, 107.60753647, 100, 50)
ON DUPLICATE KEY UPDATE 
    unit_id = VALUES(unit_id), address = VALUES(address), latitude = VALUES(latitude), 
    longitude = VALUES(longitude), radius = VALUES(radius), accuracy_limit = VALUES(accuracy_limit);

INSERT INTO leave_types (id, name, is_paid) VALUES 
(1, 'Sakit', 1), (2, 'Tidak masuk', 0), (3, 'Terlambat dengan izin', 0), 
(4, 'Pulang lebih awal', 0), (5, 'Lupa absen masuk', 0), (6, 'Lupa absen pulang', 0), 
(7, 'Tugas luar', 1), (8, 'Hari libur', 1), (9, 'Keperluan keluarga', 0), 
(10, 'Kendala kendaraan', 0), (11, 'Kendala perangkat', 0), (12, 'Kendala GPS', 0),
(13, 'Kendala kamera', 0), (14, 'Lainnya', 0)
ON DUPLICATE KEY UPDATE name = VALUES(name), is_paid = VALUES(is_paid);

INSERT INTO payment_methods (id, unit_id, name) VALUES 
(1, 1, 'Tunai'), (2, 1, 'QRIS'), (3, 1, 'Transfer'), (4, 1, 'Debit/EDC'),
(5, 2, 'Tunai'), (6, 2, 'QRIS')
ON DUPLICATE KEY UPDATE unit_id = VALUES(unit_id), name = VALUES(name);

INSERT INTO service_categories (id, unit_id, name) VALUES 
(1, 2, 'Haircut'), (2, 2, 'Treatment')
ON DUPLICATE KEY UPDATE unit_id = VALUES(unit_id), name = VALUES(name);

INSERT INTO services (id, category_id, name, price) VALUES 
(1, 1, 'Premium Haircut', 60000.00),
(2, 1, 'Standard Haircut', 45000.00),
(3, 2, 'Hair Spa', 80000.00)
ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price);

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('face_match_threshold', '0.6', 'Batas maksimal Cosine Distance (0-1). Semakin kecil semakin ketat.'),
('liveness_enabled', 'true', 'Mengaktifkan Active Challenge Liveness (Menoleh/Berkedip)'),
('lumos_late_penalty_base', '50000', 'Nominal denda per kelipatan 30 menit (setelah toleransi 30 menit)'),
('barber_global_revenue_share', '30', 'Persentase bagi hasil default untuk Luxeast (jika aturan spesifik kosong)'),
('lumos_base_salary', '2500000', 'Gaji Pokok standar Lumos Vape Store'),
('luxeast_base_salary', '1500000', 'Gaji Pokok standar Luxeast Barbershop')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description);

INSERT INTO revenue_share_rules (id, unit_id, service_id, employee_id, percentage) VALUES
(1, 2, NULL, NULL, 30.00)
ON DUPLICATE KEY UPDATE unit_id = VALUES(unit_id), percentage = VALUES(percentage);

INSERT INTO payroll_components (id, unit_id, name, type, is_default, is_active) VALUES
(1, 1, 'Gaji Pokok', 'earning', 1, 1),
(2, 1, 'Potongan Keterlambatan', 'deduction', 1, 1),
(3, 2, 'Gaji Pokok', 'earning', 1, 1),
(4, 2, 'Potongan Keterlambatan', 'deduction', 1, 1),
(5, 2, 'Komisi Bagi Hasil', 'earning', 1, 1)
ON DUPLICATE KEY UPDATE unit_id = VALUES(unit_id), name = VALUES(name), type = VALUES(type);

SET FOREIGN_KEY_CHECKS = 1;
