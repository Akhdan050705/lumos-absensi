# Database Patches

Direktori ini digunakan untuk menyimpan seluruh perubahan skema database (DDL) atau data penting (DML) setelah `01_schema.sql` dijalankan di production. 

**ATURAN WAJIB:**
1. DILARANG KERAS menggunakan Laravel Migration (`php artisan migrate`).
2. Setiap perubahan database HARUS dibuat dalam file SQL baru di folder ini.
3. Gunakan format penamaan: `YYYYMMDD_deskripsi_singkat.sql`
   Contoh: `20260926_add_status_to_employees.sql`
4. File SQL ini dieksekusi secara manual via Navicat atau command line MySQL oleh Owner/DBA.
5. Harap dokumentasikan di sini urutan file patch yang sudah dieksekusi ke server Production.
