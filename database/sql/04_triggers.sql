-- Lumos Absession - Database Triggers
-- --------------------------------------------------------
-- CATATAN: Sesuai spesifikasi, logika bisnis (denda, liveness) dan operasional
-- harus berada di ranah backend aplikasi (Laravel). Triggers SQL di sini
-- hanya disediakan sebagai template apabila kelak dibutuhkan audit murni 
-- di level database (Database Level Audit Trail).
-- Saat ini dikosongkan/di-comment agar tidak menyebabkan efek samping yang 
-- berbenturan dengan backend audit_log.
-- --------------------------------------------------------

/*
DELIMITER //

CREATE TRIGGER trg_after_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.email != NEW.email OR OLD.is_active != NEW.is_active THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, old_values, new_values)
        VALUES ('UPDATE', 'user', NEW.id, JSON_OBJECT('email', OLD.email, 'is_active', OLD.is_active), JSON_OBJECT('email', NEW.email, 'is_active', NEW.is_active));
    END IF;
END //

DELIMITER ;
*/
