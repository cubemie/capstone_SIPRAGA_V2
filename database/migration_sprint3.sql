-- ============================================================================
-- CORETAX — Migration Script
-- Sprint 3: Perbaikan skema database
-- Dijalankan SETELAH database awal sudah terbuat dari database.txt
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sprint 3.2 — Tambah kolom no_hp ke tabel warga
-- Nomor HP diperlukan untuk notifikasi WhatsApp via Fonnte
-- ----------------------------------------------------------------------------
ALTER TABLE warga
  ADD COLUMN no_hp VARCHAR(15) NULL AFTER email;

-- ----------------------------------------------------------------------------
-- Sprint 3.4 — Tabel superadmin (belum terdokumentasi sebelumnya)
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
-- CATATAN: Jalankan ini hanya SETELAH mengubah tipe data rw_id di tabel rt
-- menjadi sesuai dengan tipe di tabel rw (saat ini varchar(100) vs varchar(100))
-- Pastikan tidak ada data orphan sebelum menjalankan ALTER ini.
-- ----------------------------------------------------------------------------

-- Cek dan tambah FK constraint (akan error jika sudah ada — aman diabaikan)
ALTER TABLE rt
  MODIFY COLUMN rw_id VARCHAR(100) NOT NULL,
  ADD CONSTRAINT fk_rt_rw
    FOREIGN KEY (rw_id) REFERENCES rw(rw_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- Dokumentasi lengkap tabel superadmin (Sprint 3.4)
-- Skema:
--   id       INT AUTO_INCREMENT PRIMARY KEY
--   username VARCHAR(255) UNIQUE NOT NULL   — username login superadmin
--   password VARCHAR(255) NOT NULL          — bcrypt hashed password
-- ----------------------------------------------------------------------------

-- Contoh: insert superadmin default (GANTI PASSWORD setelah deploy!)
-- Password di bawah = bcrypt hash dari 'admin123' dengan 10 rounds
-- INSERT IGNORE INTO superadmin (username, password)
-- VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
