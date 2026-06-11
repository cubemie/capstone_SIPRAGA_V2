-- ============================================================================
-- CORETAX — Migration Script
-- Menggabungkan migrasi Sprint 3 dan Sprint 4
-- Dijalankan SETELAH database awal sudah terbuat dari database.txt
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sprint 3.2 — Tambah kolom no_hp ke tabel warga
-- Nomor HP diperlukan untuk notifikasi WhatsApp via Fonnte
-- ----------------------------------------------------------------------------
ALTER TABLE warga
  ADD COLUMN no_hp VARCHAR(15) NULL AFTER email;

-- ----------------------------------------------------------------------------
-- Sprint 3.4 — Tabel superadmin
-- Tabel ini digunakan AuthService.loginSuperadmin
-- Jalankan CREATE TABLE hanya jika belum ada
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS superadmin (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  CONSTRAINT chk_superadmin_username CHECK (CHAR_LENGTH(username) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Sprint 3.4 — FK constraint yang hilang: rt.rw_id → rw.rw_id
-- ----------------------------------------------------------------------------
ALTER TABLE rt
  MODIFY COLUMN rw_id VARCHAR(100) NOT NULL,
  ADD CONSTRAINT fk_rt_rw
    FOREIGN KEY (rw_id) REFERENCES rw(rw_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- Sprint 4 — Menambahkan foreign key rt_id pada tabel warga
-- ----------------------------------------------------------------------------
ALTER TABLE warga
  ADD COLUMN rt_id INT NULL,
  ADD CONSTRAINT fk_warga_rt FOREIGN KEY (rt_id) REFERENCES rt(rt_id);

-- ----------------------------------------------------------------------------
-- Contoh: insert superadmin default (GANTI PASSWORD setelah deploy!)
-- Password di bawah = bcrypt hash dari 'admin123' dengan 10 rounds
-- INSERT IGNORE INTO superadmin (username, password)
-- VALUES ('superadmin', '$2b$10$VZo7pSVfZUprjQwnFszsh.4BIKGwUkPOmv.aQqlTJoeF6sn.lE7lu');
