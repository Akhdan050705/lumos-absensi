-- Lumos Absession - Database Indexes
-- Dieksekusi setelah 01_schema.sql untuk optimasi query

-- Indeks untuk pencarian pegawai berdasarkan NIK/Kode
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_status ON employees(status);

-- Indeks untuk absensi (pencarian berdasarkan tanggal dan status)
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Indeks untuk laporan snapshot POS (berdasarkan tanggal dan status)
CREATE INDEX idx_snapshot_employee ON sales_snapshots(employee_id);
CREATE INDEX idx_snapshot_status ON sales_snapshots(status);
CREATE INDEX idx_snapshot_date ON sales_snapshots(created_at);

-- Indeks untuk transaksi barber
CREATE INDEX idx_barber_txn_time ON barber_transactions(transaction_time);
CREATE INDEX idx_barber_txn_employee ON barber_transactions(employee_id);

-- Indeks untuk optimasi query payroll per periode
CREATE INDEX idx_payroll_calc_period ON payroll_calculations(period_id);
CREATE INDEX idx_payroll_calc_employee ON payroll_calculations(employee_id);

-- Indeks audit log (sering difilter berdasarkan entitas atau user)
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Indeks notifikasi (untuk menghitung notifikasi belum dibaca)
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
