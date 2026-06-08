-- ============================================================================
-- CORETAX — init.sql
-- Dijalankan OTOMATIS oleh MySQL Docker container saat volume pertama dibuat.
-- Urutan CREATE TABLE penting: rw → rt (FK), warga → pengajuan_surat (FK)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS capstone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE capstone;

-- ----------------------------------------------------------------------------
-- Tabel: superadmin
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS superadmin (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  CONSTRAINT chk_superadmin_username CHECK (CHAR_LENGTH(username) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabel: rw
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rw (
  rw_id          VARCHAR(100) PRIMARY KEY,
  no_rw          VARCHAR(10),
  nama_ketua     VARCHAR(255),
  provinsi       VARCHAR(100),
  kota           VARCHAR(255),
  kecamatan      VARCHAR(100),
  kelurahan_desa VARCHAR(100),
  username       VARCHAR(255) UNIQUE,
  password       VARCHAR(255),
  ttd_digital    VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabel: rt  (FK ke rw)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rt (
  rt_id          INT AUTO_INCREMENT PRIMARY KEY,
  no_rt          VARCHAR(10),
  rw_id          VARCHAR(100) NOT NULL,
  nama_ketua     VARCHAR(255),
  provinsi       VARCHAR(100),
  kota           VARCHAR(255),
  kecamatan      VARCHAR(100),
  kelurahan_desa VARCHAR(100),
  username       VARCHAR(255) UNIQUE,
  password       VARCHAR(255),
  ttd_digital    VARCHAR(255),
  CONSTRAINT fk_rt_rw FOREIGN KEY (rw_id) REFERENCES rw(rw_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabel: warga
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warga (
  id_warga          INT AUTO_INCREMENT PRIMARY KEY,
  NIK               CHAR(16) UNIQUE NOT NULL,
  nama              VARCHAR(255),
  email             VARCHAR(255) UNIQUE,
  password          VARCHAR(255),
  no_hp             VARCHAR(15),
  tempat_lahir      VARCHAR(255),
  tanggal_lahir     DATE,
  jenis_kelamin     ENUM('Laki-laki','Perempuan'),
  alamat            TEXT,
  rt                VARCHAR(10),
  rw                VARCHAR(10),
  kelurahan_desa    VARCHAR(100),
  kecamatan         VARCHAR(100),
  provinsi          VARCHAR(100),
  kota              VARCHAR(255),
  agama             VARCHAR(50),
  status_perkawinan ENUM('Belum Kawin','Kawin'),
  pekerjaan         VARCHAR(100),
  kewarganegaraan   VARCHAR(50),
  negara            VARCHAR(100),
  foto_ktp          VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabel: template_surat
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_surat (
  id_template INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(255),
  file_path   VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabel: pengajuan_surat  (FK ke warga)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengajuan_surat (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  id_warga         INT,
  subjek           VARCHAR(255),
  file_path        VARCHAR(255),
  file_path_signed VARCHAR(255),
  provinsi         VARCHAR(100),
  kota             VARCHAR(255),
  kecamatan        VARCHAR(100),
  kelurahan        VARCHAR(100),
  rt               VARCHAR(10),
  rw               VARCHAR(10),
  status           TINYINT DEFAULT 1,
  alasan_penolakan TEXT,
  tanggal_ajuan    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_surat_warga FOREIGN KEY (id_warga) REFERENCES warga(id_warga)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Seed: superadmin default
-- Password = bcrypt('admin123', 10)
-- ⚠️  GANTI HASH INI sebelum deploy ke production!
-- Cara generate: node -e "const b=require('bcryptjs');b.hash('passwordBaru',10).then(console.log)"
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO superadmin (username, password)
VALUES ('superadmin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
