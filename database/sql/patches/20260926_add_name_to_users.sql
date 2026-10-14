-- --------------------------------------------------------
-- Lumos Absession - Patch
-- Tanggal: 26 September 2026
-- Deskripsi: Menambahkan kolom 'name' pada tabel users (dibutuhkan untuk nama entitas akun Owner, karena profil pegawai terpisah).
-- --------------------------------------------------------

ALTER TABLE users 
ADD COLUMN name VARCHAR(255) NOT NULL AFTER id;
