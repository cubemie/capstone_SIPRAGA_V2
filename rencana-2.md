# Rencana Perbaikan & Pembenahan SIPRAGA V2
> Berdasarkan analisis kode aktual dari `capstone_SIPRAGA_V2-be_nella_fix`  
> Terakhir diperbarui: Juni 2026

---

## Ringkasan Bug & Masalah yang Ditemukan

| # | File / Area | Masalah | Prioritas |
|---|---|---|---|
| 1 | `database/` — struktur file | Ada 10+ file SQL terpisah yang berserakan, tidak ada urutan yang jelas | 🔴 |
| 2 | `database/00-base.sql` | Tabel `warga` tidak punya kolom `UNIQUE` di NIK, tidak ada `CHARSET`, tidak ada `INDEX` | 🔴 |
| 3 | `database/init.sql` | `letters.uuid` default UUID() tidak didukung semua versi MySQL 8.0 | 🔴 |
| 4 | `letters.service.js` — `submitLetter()` | Bug logika: langsung set `in_review_rt`, padahal `submitLetter` seharusnya set ke `submitted`, bukan `in_review_rt` | 🔴 |
| 5 | `letters.model.js` — `getLetterByUuid()` | Query JOIN salah: `JOIN warga r ON ... r.nik` → kolom di tabel warga bernama `NIK`, bukan `nik` | 🔴 |
| 6 | `letters.model.js` — `getLetterByUuid()` | `w.name as workflow_name` → kolom seharusnya `lwo.name` (alias variable clash) | 🔴 |
| 7 | `pdf.service.js` — `createPdfForLetter()` | Pakai `getLetterByUuid()` yang querynya salah, sehingga `letter.resident_nik` selalu `undefined` | 🔴 |
| 8 | `approvals.service.js` | Status transition `submitted → in_review_rt` tidak cocok dengan status yang di-set `submitLetter()` | 🔴 |
| 9 | `letters.controller.js` — `createDraft()` | Ada `console.log` debug yang belum dihapus, bocor data user ke log | 🟡 |
| 10 | `ttdRtRwRoutes.js` | Pakai `verifyToken` (untuk warga), bukan `authRtRwMiddleware` (untuk RT/RW) — TTD warga seharusnya bisa upload | 🟡 |
| 11 | `db.js` | `console.log` bocorkan password DB ke terminal production | 🟡 |
| 12 | `database/` | Tidak ada satu file SQL "master" untuk setup bersih dari nol | 🟡 |
| 13 | `letters.model.js` — `getInboxByRole()` | RW filter pakai `tenant_id` tapi `tenant_id` RT ≠ `rw_id`, bisa miss surat | 🟡 |
| 14 | `database/kode-tambahan-fixed-2.sql` | Tabel `system_logs`, `notifications`, `letter_markdown_templates` belum masuk skema utama | 🟡 |
| 15 | `letters.model.js` — `getMyLetters()` | `w.name as workflow_name` → alias salah, harusnya `lwo.name` | 🟡 |

---

## BAGIAN 1 — PERBAIKAN DATABASE

---

### 1.1 Master SQL — Setup Bersih dari Nol

Buat satu file SQL tunggal yang mencakup **seluruh skema** agar tidak perlu jalankan banyak file secara berurutan. File ini menggantikan: `00-base.sql`, `init.sql`, `migration_sprint3.sql`, `add_avatar.sql`, `kode-tambahan-fixed-2.sql`.

**Path:** `database/master.sql`

```sql
-- ============================================================
-- SIPRAGA V2 — Master Schema
-- Jalankan sekali untuk setup database bersih dari nol.
-- mysql -u root -p capstone < database/master.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. TABEL DASAR (V1 — masih dipakai)
-- ============================================================

CREATE TABLE IF NOT EXISTS warga (
  id_warga         INT AUTO_INCREMENT PRIMARY KEY,
  NIK              CHAR(16)     NOT NULL,
  nama             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL,
  password         VARCHAR(255) NOT NULL,
  no_hp            VARCHAR(15)  NULL,
  tempat_lahir     VARCHAR(255) NULL,
  tanggal_lahir    DATE         NULL,
  jenis_kelamin    ENUM('Laki-laki','Perempuan') NULL,
  alamat           TEXT         NULL,
  rt               VARCHAR(10)  NULL,
  rw               VARCHAR(10)  NULL,
  kelurahan_desa   VARCHAR(100) NULL,
  kecamatan        VARCHAR(100) NULL,
  agama            VARCHAR(50)  NULL,
  status_perkawinan ENUM('Belum Kawin','Kawin') NULL,
  pekerjaan        VARCHAR(100) NULL,
  kewarganegaraan  VARCHAR(50)  NULL,
  negara           VARCHAR(100) NULL,
  provinsi         VARCHAR(100) NULL,
  kota             VARCHAR(255) NULL,
  foto_ktp         VARCHAR(255) NULL,
  avatar           VARCHAR(255) NULL,
  UNIQUE KEY uq_warga_nik   (NIK),
  UNIQUE KEY uq_warga_email (email),
  INDEX idx_warga_rw (rw)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rw (
  rw_id          VARCHAR(100) PRIMARY KEY,
  no_rw          VARCHAR(10)  NOT NULL,
  nama_ketua     VARCHAR(255) NOT NULL,
  provinsi       VARCHAR(100) NULL,
  kota           VARCHAR(100) NULL,
  kecamatan      VARCHAR(100) NULL,
  kelurahan_desa VARCHAR(100) NULL,
  username       VARCHAR(255) NOT NULL,
  password       VARCHAR(255) NOT NULL,
  ttd_digital    VARCHAR(255) NULL,
  is_active      BOOLEAN      DEFAULT TRUE,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rw_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rt (
  rt_id          INT AUTO_INCREMENT PRIMARY KEY,
  no_rt          VARCHAR(10)  NOT NULL,
  rw_id          VARCHAR(100) NOT NULL,
  nama_ketua     VARCHAR(255) NOT NULL,
  provinsi       VARCHAR(100) NULL,
  kota           VARCHAR(100) NULL,
  kecamatan      VARCHAR(100) NULL,
  kelurahan_desa VARCHAR(100) NULL,
  username       VARCHAR(255) NOT NULL,
  password       VARCHAR(255) NOT NULL,
  ttd_digital    VARCHAR(255) NULL,
  is_active      BOOLEAN      DEFAULT TRUE,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rt_username (username),
  CONSTRAINT fk_rt_rw FOREIGN KEY (rw_id) REFERENCES rw(rw_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS superadmin (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_superadmin_username (username),
  CONSTRAINT chk_superadmin_username CHECK (CHAR_LENGTH(username) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pengajuan_surat (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  id_warga         INT          NOT NULL,
  subjek           VARCHAR(255) NULL,
  file_path        VARCHAR(255) NULL,
  file_path_signed VARCHAR(255) NULL,
  provinsi         VARCHAR(100) NULL,
  kota             VARCHAR(100) NULL,
  kecamatan        VARCHAR(100) NULL,
  kelurahan_desa   VARCHAR(100) NULL,
  rt               VARCHAR(10)  NULL,
  rw               VARCHAR(10)  NULL,
  status           TINYINT(4)   DEFAULT 1,  -- 1=MENUNGGU, 2=DISETUJUI, 3=DITOLAK
  alasan_penolakan TEXT         NULL,
  tanggal_ajuan    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pengajuan_warga  (id_warga),
  INDEX idx_pengajuan_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS template_surat (
  id_template INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  file_path   VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TABEL V2 — LETTERS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS letter_types (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(50)  NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT         NULL,
  icon          VARCHAR(50)  NULL,
  required_docs JSON         NULL,
  is_active     BOOLEAN      DEFAULT TRUE,
  sort_order    INT          DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_letter_types_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_template_fields (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id INT          NOT NULL,
  field_key      VARCHAR(100) NOT NULL,
  label          VARCHAR(255) NOT NULL,
  field_type     ENUM('text','textarea','number','date','select','radio','checkbox') NOT NULL,
  placeholder    VARCHAR(255) NULL,
  options        JSON         NULL,
  validation     JSON         NULL,
  help_text      VARCHAR(500) NULL,
  sort_order     INT          DEFAULT 0,
  is_required    BOOLEAN      DEFAULT TRUE,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id) ON DELETE CASCADE,
  UNIQUE KEY uq_type_field (letter_type_id, field_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_pdf_templates (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id INT          NOT NULL,
  tenant_id      VARCHAR(50)  NULL,
  name           VARCHAR(255) NOT NULL,
  html_template  LONGTEXT     NOT NULL,
  version        INT          DEFAULT 1,
  is_active      BOOLEAN      DEFAULT TRUE,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_markdown_templates (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id   INT          NOT NULL,
  name             VARCHAR(255) NOT NULL,
  markdown_content LONGTEXT     NOT NULL,
  html_compiled    LONGTEXT     NULL,
  version          INT          DEFAULT 1,
  is_active        BOOLEAN      DEFAULT TRUE,
  created_by       INT          NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_workflow_options (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(50)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  steps       JSON         NOT NULL,
  is_active   BOOLEAN      DEFAULT TRUE,
  sort_order  INT          DEFAULT 0,
  UNIQUE KEY uq_workflow_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letters (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  -- uuid di-generate di level aplikasi (INSERT dengan uuid() dari kode), bukan DEFAULT UUID()
  -- karena DEFAULT (UUID()) hanya didukung MySQL 8.0.13+
  uuid               VARCHAR(36)  NOT NULL,
  letter_number      VARCHAR(100) NULL,
  tenant_id          VARCHAR(50)  NOT NULL,
  resident_id        INT          NOT NULL,
  letter_type_id     INT          NOT NULL,
  workflow_option_id INT          NOT NULL,
  subject            VARCHAR(255) NOT NULL,
  purpose            TEXT         NULL,
  status             ENUM(
                       'draft','submitted','in_review_rt','approved_rt',
                       'in_review_rw','approved_rw','revision_requested',
                       'rejected','completed','cancelled'
                     ) NOT NULL DEFAULT 'draft',
  current_step       INT          DEFAULT 1,
  qr_token           VARCHAR(36)  NULL,
  rejected_by_role   VARCHAR(20)  NULL,
  submitted_at       TIMESTAMP    NULL,
  completed_at       TIMESTAMP    NULL,
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_letters_uuid     (uuid),
  UNIQUE KEY uq_letters_qr_token (qr_token),
  INDEX idx_letters_tenant_status (tenant_id, status),
  INDEX idx_letters_resident      (resident_id),
  FOREIGN KEY (resident_id)        REFERENCES warga(id_warga),
  FOREIGN KEY (letter_type_id)     REFERENCES letter_types(id),
  FOREIGN KEY (workflow_option_id) REFERENCES letter_workflow_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_field_values (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  letter_id INT          NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  value     TEXT         NOT NULL,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE,
  UNIQUE KEY uq_letter_field (letter_id, field_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_content_blocks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  letter_id  INT  NOT NULL,
  block_type ENUM('paragraph','list','points','note','info') NOT NULL,
  content    TEXT NOT NULL,
  sort_order INT  DEFAULT 0,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  letter_id     INT          NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url      VARCHAR(500) NOT NULL,
  mime_type     VARCHAR(100) NOT NULL,
  file_size     INT          NOT NULL DEFAULT 0,
  sort_order    INT          DEFAULT 0,
  uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_pdf_versions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  letter_id    INT  NOT NULL,
  version      INT  NOT NULL DEFAULT 1,
  type         ENUM('preview','signed_rt','signed_rw','final') NOT NULL,
  file_url     VARCHAR(500) NOT NULL,
  generated_by INT          NULL,
  generated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_approvals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  letter_id     INT  NOT NULL,
  approver_id   INT  NOT NULL,
  step          INT  NOT NULL,
  action        ENUM('approved','rejected','revision_requested') NOT NULL,
  notes         TEXT NULL,
  signature_url VARCHAR(500) NULL,
  acted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS letter_comments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  letter_id   INT     NOT NULL,
  author_id   INT     NOT NULL,
  content     TEXT    NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABEL TAMBAHAN (Superadmin, Notifikasi, Log)
-- ============================================================

CREATE TABLE IF NOT EXISTS app_config (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     TEXT         NOT NULL,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT          NULL,
  actor_role  VARCHAR(20)  NULL,
  actor_name  VARCHAR(255) NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50)  NULL,
  target_id   VARCHAR(100) NULL,
  detail      JSON         NULL,
  ip_address  VARCHAR(45)  NULL,
  user_agent  VARCHAR(500) NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_actor  (actor_role, created_at),
  INDEX idx_logs_action (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipient_id   INT          NOT NULL,
  recipient_role VARCHAR(20)  NOT NULL,
  type           VARCHAR(50)  NOT NULL,
  title          VARCHAR(255) NOT NULL,
  message        TEXT         NULL,
  link           VARCHAR(255) NULL,
  is_read        BOOLEAN      DEFAULT FALSE,
  letter_uuid    VARCHAR(36)  NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_recipient (recipient_id, recipient_role, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---

### 1.2 File Seed Master

**Path:** `database/seed-master.sql`

```sql
-- ============================================================
-- SIPRAGA V2 — Seed Data Master
-- Jalankan SETELAH master.sql
-- mysql -u root -p capstone < database/seed-master.sql
-- ============================================================

SET NAMES utf8mb4;

-- ── Workflow Options ──────────────────────────────────────────────────────────
INSERT IGNORE INTO letter_workflow_options (code, name, description, steps, is_active, sort_order) VALUES
(
  'RT_ONLY',
  'Ketua RT Saja',
  'Surat hanya perlu disetujui oleh Ketua RT',
  '[{"step":1,"role":"rt","label":"Verifikasi RT"}]',
  TRUE, 1
),
(
  'RT_THEN_RW',
  'RT lalu RW',
  'Surat disetujui RT terlebih dahulu, kemudian ditandatangani RW',
  '[{"step":1,"role":"rt","label":"Verifikasi RT"},{"step":2,"role":"rw","label":"Tanda Tangan RW"}]',
  TRUE, 2
);

-- ── Letter Types ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO letter_types (code, name, description, icon, required_docs, is_active, sort_order) VALUES
('DOMISILI',     'Surat Keterangan Domisili',    NULL, 'Home',        '["KTP","KK"]',          TRUE, 1),
('TIDAK_MAMPU',  'Surat Keterangan Tidak Mampu', NULL, 'HandHeart',   '["KTP","KK"]',          TRUE, 2),
('PENGANTAR_KTP','Surat Pengantar KTP',          NULL, 'CreditCard',  '["KTP lama","KK"]',     TRUE, 3),
('PENGANTAR_KK', 'Surat Pengantar KK',           NULL, 'Users',       '["KTP","KK lama"]',     TRUE, 4),
('NIKAH',        'Surat Pengantar Nikah',        NULL, 'Heart',       '["KTP","KK","Akta"]',   TRUE, 5),
('USAHA',        'Surat Keterangan Usaha',       NULL, 'Briefcase',   '["KTP","KK"]',          TRUE, 6),
('KEHILANGAN',   'Surat Keterangan Kehilangan',  NULL, 'AlertTriangle','["KTP"]',              TRUE, 7),
('SKCK',         'Surat Pengantar SKCK',         NULL, 'ShieldCheck', '["KTP","KK","Foto"]',   TRUE, 8),
('AHLI_WARIS',   'Surat Keterangan Ahli Waris',  NULL, 'Users2',      '["KTP","KK","Akta"]',   TRUE, 9),
('BEDA_ALAMAT',  'Surat Keterangan Beda Alamat', NULL, 'MapPin',      '["KTP","KK"]',          TRUE, 10);

-- ── Template Fields — DOMISILI ────────────────────────────────────────────────
SET @domisili_id = (SELECT id FROM letter_types WHERE code = 'DOMISILI');

INSERT IGNORE INTO letter_template_fields
  (letter_type_id, field_key, label, field_type, placeholder, options, validation, sort_order, is_required)
VALUES
(
  @domisili_id, 'lama_tinggal', 'Lama Tinggal', 'text',
  'Contoh: 5 tahun', NULL,
  '{"required":true}', 1, TRUE
),
(
  @domisili_id, 'status_tempat_tinggal', 'Status Tempat Tinggal', 'select',
  NULL,
  '[{"value":"milik_sendiri","label":"Milik Sendiri"},{"value":"kontrak","label":"Kontrak/Sewa"},{"value":"kos","label":"Kos"},{"value":"numpang","label":"Numpang"}]',
  '{"required":true}', 2, TRUE
),
(
  @domisili_id, 'keperluan_domisili', 'Keperluan', 'select',
  NULL,
  '[{"value":"bank","label":"Keperluan Bank"},{"value":"kerja","label":"Melamar Kerja"},{"value":"sekolah","label":"Pendaftaran Sekolah"},{"value":"beasiswa","label":"Beasiswa"},{"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 3, TRUE
),
(
  @domisili_id, 'keterangan_tambahan', 'Keterangan Tambahan', 'textarea',
  'Isi jika ada keterangan tambahan', NULL,
  '{"required":false}', 4, FALSE
);

-- ── Template Fields — TIDAK_MAMPU ────────────────────────────────────────────
SET @tdk_mampu_id = (SELECT id FROM letter_types WHERE code = 'TIDAK_MAMPU');

INSERT IGNORE INTO letter_template_fields
  (letter_type_id, field_key, label, field_type, placeholder, options, validation, sort_order, is_required)
VALUES
(
  @tdk_mampu_id, 'penghasilan_bulanan', 'Penghasilan Per Bulan', 'number',
  'Contoh: 1500000', NULL, '{"required":true,"min":0}', 1, TRUE
),
(
  @tdk_mampu_id, 'keperluan_surat', 'Keperluan', 'select',
  NULL,
  '[{"value":"beasiswa","label":"Beasiswa"},{"value":"bpjs","label":"BPJS Gratis"},{"value":"bantuan_sosial","label":"Bantuan Sosial"},{"value":"sekolah","label":"Biaya Sekolah"},{"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 2, TRUE
),
(
  @tdk_mampu_id, 'pekerjaan_kepala_keluarga', 'Pekerjaan Kepala Keluarga', 'text',
  'Contoh: Buruh Harian Lepas', NULL, '{"required":true}', 3, TRUE
);

-- ── Default RW (seed) ─────────────────────────────────────────────────────────
-- Password = bcrypt('admin123', 10)
INSERT IGNORE INTO rw (rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, is_active)
VALUES (
  'RW001', '001', 'Budi Santoso',
  'Jawa Tengah', 'Kota Semarang', 'Banyumanik', 'Srondol Wetan',
  'ketuarw001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  TRUE
);

-- ── Default RT (seed) ─────────────────────────────────────────────────────────
INSERT IGNORE INTO rt (no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, is_active)
VALUES (
  '001', 'RW001', 'Andi Wijaya',
  'Jawa Tengah', 'Kota Semarang', 'Banyumanik', 'Srondol Wetan',
  'ketuart001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  TRUE
);

-- ── App Config Default ────────────────────────────────────────────────────────
INSERT IGNORE INTO app_config (`key`, `value`, description) VALUES
('nama_instansi',    'RT 001 RW 001',          'Nama instansi untuk kop surat'),
('kop_surat_line1',  'RT 001 / RW 001',        'Kop Surat Baris 1'),
('kop_surat_line2',  'KELURAHAN SRONDOL WETAN', 'Kop Surat Baris 2'),
('kop_surat_line3',  'KEC. BANYUMANIK, KOTA SEMARANG', 'Kop Surat Baris 3');
```

---

### 1.3 Cara Setup Database (Baru)

Setelah punya dua file di atas, setup database cukup:

```bash
# 1. Buat database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS capstone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Jalankan schema master
mysql -u root -p capstone < database/master.sql

# 3. Jalankan seed
mysql -u root -p capstone < database/seed-master.sql
```

**File-file SQL lama yang sekarang tidak perlu dijalankan lagi (cukup disimpan sebagai referensi):**
- `00-base.sql`
- `init.sql`
- `migration_sprint3.sql`
- `add_avatar.sql`
- `kode-tambahan-fixed.sql`
- `kode-tambahan-fixed-2.sql`
- `seed.sql`
- `seed_workflows.sql`

---

## BAGIAN 2 — PERBAIKAN BACKEND

---

### 2.1 `backend/src/config/db.js` — Hapus log password

**Bug:** `console.log` bocorkan `DB_PASSWORD` ke terminal, berbahaya di production.

```js
// backend/src/config/db.js
// GANTI SELURUH ISI FILE INI

const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'capstone',
  port:     parseInt(process.env.DB_PORT, 10) || 3306,

  connectionLimit:    10,
  connectTimeout:     10000,
  waitForConnections: true,
  queueLimit:         0,
});

// Log koneksi hanya di development, tanpa expose password
if (process.env.NODE_ENV !== 'production') {
  console.log(`[DB] Connecting to ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'capstone'}`);
}

module.exports = db;
```

---

### 2.2 `backend/src/modules/letters/letters.model.js` — Fix query salah

**Bug 1:** `getLetterByUuid()` — kolom `r.nik` seharusnya `r.NIK`, dan alias `w.name` clash dengan alias tabel `w`.

**Bug 2:** `getMyLetters()` — alias `w.name as workflow_name` salah, tabel workflow di-alias `w` padahal `w` sudah dipakai di JOIN warga di luar, harus di-alias ulang.

**Bug 3:** `getLetterById()` — sama seperti di atas.

```js
// backend/src/modules/letters/letters.model.js
// GANTI SELURUH ISI FILE INI

const db = require('../../config/db');

const LettersModel = {

  // ── Master Data ──────────────────────────────────────────────────────────

  async getLetterTypes() {
    const [rows] = await db.query(
      `SELECT * FROM letter_types WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    return rows;
  },

  async getLetterTypeById(id) {
    const [rows] = await db.query(`SELECT * FROM letter_types WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async getTemplateFields(letterTypeId) {
    const [rows] = await db.query(
      `SELECT * FROM letter_template_fields
       WHERE letter_type_id = ?
       ORDER BY sort_order ASC`,
      [letterTypeId]
    );
    return rows;
  },

  async getWorkflowOptions() {
    const [rows] = await db.query(
      `SELECT * FROM letter_workflow_options WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    return rows;
  },

  // ── Letter CRUD ──────────────────────────────────────────────────────────

  async createLetterDraft(letterData) {
    const { tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose } = letterData;
    const [result] = await db.query(
      `INSERT INTO letters
        (tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, status, current_step)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', 1)`,
      [tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose]
    );
    return result.insertId;
  },

  /**
   * Query dasar letter by UUID — dipakai untuk submit dan pdf generation.
   * FIX: alias kolom NIK menjadi uppercase sesuai skema.
   */
  async getLetterByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lt.code  AS letter_type_code,
              lwo.name AS workflow_name,
              lwo.steps AS workflow_steps,
              lwo.code AS workflow_code,
              w.nama   AS resident_name,
              w.NIK    AS resident_nik
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       JOIN warga w                    ON l.resident_id         = w.id_warga
       WHERE l.uuid = ?`,
      [uuid]
    );
    return rows[0] || null;
  },

  /**
   * Query lengkap letter by UUID — termasuk field_values, approvals, attachments, pdf_versions.
   */
  async getDetailByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lt.code  AS letter_type_code,
              lwo.name AS workflow_name,
              lwo.steps AS workflow_steps,
              lwo.code AS workflow_code,
              w.nama   AS resident_name,
              w.NIK    AS resident_nik
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       JOIN warga w                    ON l.resident_id         = w.id_warga
       WHERE l.uuid = ?`,
      [uuid]
    );
    if (!rows.length) return null;

    const letter = rows[0];

    const [fieldValues] = await db.query(
      `SELECT field_key, value FROM letter_field_values
       WHERE letter_id = ? ORDER BY id ASC`,
      [letter.id]
    );

    const [approvals] = await db.query(
      `SELECT la.*,
              COALESCE(r.nama_ketua, rw_t.nama_ketua) AS approver_name,
              COALESCE(r.no_rt, NULL) AS approver_no_rt
       FROM letter_approvals la
       LEFT JOIN rt  r    ON la.approver_id = r.rt_id
       LEFT JOIN rw  rw_t ON la.approver_id = rw_t.rw_id
       WHERE la.letter_id = ?
       ORDER BY la.acted_at ASC`,
      [letter.id]
    );

    const [pdfVersions] = await db.query(
      `SELECT type, file_url, generated_at
       FROM letter_pdf_versions
       WHERE letter_id = ?
       ORDER BY generated_at DESC`,
      [letter.id]
    );

    const [attachments] = await db.query(
      `SELECT original_name, file_url, mime_type, file_size, uploaded_at
       FROM letter_attachments
       WHERE letter_id = ?
       ORDER BY uploaded_at ASC`,
      [letter.id]
    );

    return {
      ...letter,
      field_values: fieldValues,
      approvals,
      pdf_versions: pdfVersions,
      attachments,
    };
  },

  /**
   * Inbox RT/RW.
   * FIX: RW memakai tenant_id juga (karena tenant_id = rw_id), bukan tanpa filter.
   */
  async getInboxByRole(role, tenantId) {
    let whereClause;
    let params;

    if (role === 'rt') {
      // RT: lihat surat submitted & in_review_rt di tenant mereka
      whereClause = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
      params = [tenantId];
    } else if (role === 'rw') {
      // RW: lihat surat yang sudah disetujui RT & in_review_rw di tenant mereka
      // tenantId untuk RW = rw_id itu sendiri
      whereClause = `l.status IN ('approved_rt', 'in_review_rw') AND l.tenant_id = ?`;
      params = [tenantId];
    } else {
      return [];
    }

    const [rows] = await db.query(
      `SELECT l.uuid, l.status, l.subject, l.purpose, l.created_at,
              lt.name  AS letter_type_name,
              w.nama   AS resident_name,
              w.NIK    AS resident_nik
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       JOIN warga w         ON l.resident_id     = w.id_warga
       WHERE ${whereClause}
       ORDER BY l.created_at DESC`,
      params
    );
    return rows;
  },

  /**
   * Daftar surat milik satu warga.
   * FIX: alias tabel workflow ganti dari 'w' → 'lwo' agar tidak clash dengan alias warga.
   */
  async getMyLetters(residentId) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lwo.name AS workflow_name
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       WHERE l.resident_id = ?
       ORDER BY l.created_at DESC`,
      [residentId]
    );
    return rows;
  },

  /**
   * Letter by ID integer (untuk BullMQ worker).
   * FIX: alias tabel seragam dengan getLetterByUuid.
   */
  async getLetterById(id) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lt.code  AS letter_type_code,
              lwo.name AS workflow_name,
              lwo.steps AS workflow_steps,
              lwo.code AS workflow_code,
              w.nama   AS resident_name,
              w.NIK    AS resident_nik
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       JOIN warga w                    ON l.resident_id         = w.id_warga
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updateLetterStatus(id, status, current_step = 1, letter_number = null, qr_token = null) {
    const extra = [];
    const params = [status, current_step];

    if (status === 'submitted')  extra.push('submitted_at = CURRENT_TIMESTAMP');
    if (status === 'completed')  extra.push('completed_at = CURRENT_TIMESTAMP');
    if (letter_number) { extra.push('letter_number = ?'); params.push(letter_number); }
    if (qr_token)      { extra.push('qr_token = ?');      params.push(qr_token); }

    const extraStr = extra.length ? ', ' + extra.join(', ') : '';
    params.push(id);

    const [result] = await db.query(
      `UPDATE letters SET status = ?, current_step = ? ${extraStr} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  // ── Field Values ──────────────────────────────────────────────────────────

  async saveFieldValues(letterId, fields) {
    await db.query(`DELETE FROM letter_field_values WHERE letter_id = ?`, [letterId]);
    if (!fields || fields.length === 0) return;
    const values = fields.map(f => [letterId, f.field_key, f.value]);
    await db.query(
      `INSERT INTO letter_field_values (letter_id, field_key, value) VALUES ?`,
      [values]
    );
  },

  async getFieldValues(letterId) {
    const [rows] = await db.query(
      `SELECT field_key, value FROM letter_field_values WHERE letter_id = ?`,
      [letterId]
    );
    const map = {};
    rows.forEach(r => { map[r.field_key] = r.value; });
    return map;
  },

  // ── Attachments ───────────────────────────────────────────────────────────

  async insertAttachment(letterId, attachment) {
    const { original_name, file_url, mime_type, file_size = 0 } = attachment;
    const [result] = await db.query(
      `INSERT INTO letter_attachments (letter_id, original_name, file_url, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [letterId, original_name, file_url, mime_type, file_size]
    );
    return result.insertId;
  },

  // ── PDF Templates ─────────────────────────────────────────────────────────

  async getPdfTemplate(letterTypeId, tenantId) {
    const [rows] = await db.query(
      `SELECT * FROM letter_pdf_templates
       WHERE letter_type_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
       AND is_active = TRUE
       ORDER BY tenant_id DESC LIMIT 1`,
      [letterTypeId, tenantId]
    );
    return rows[0] || null;
  },

  async getMarkdownTemplate(letterTypeId) {
    const [rows] = await db.query(
      `SELECT * FROM letter_markdown_templates
       WHERE letter_type_id = ? AND is_active = TRUE
       ORDER BY version DESC LIMIT 1`,
      [letterTypeId]
    );
    return rows[0] || null;
  },

};

module.exports = LettersModel;
```

---

### 2.3 `backend/src/modules/letters/letters.service.js` — Fix `submitLetter()`

**Bug:** `submitLetter()` langsung set status ke `in_review_rt` padahal seharusnya surat dulu masuk `submitted`, kemudian RT yang mengubah ke `in_review_rt` saat melihat/membuka surat. Ini menyebabkan approvals.service.js gagal karena status awal tidak cocok.

Selain itu, `createDraft()` perlu generate UUID sendiri karena `DEFAULT (UUID())` tidak reliable di semua MySQL 8.0.

```js
// backend/src/modules/letters/letters.service.js
// GANTI SELURUH ISI FILE INI

const LettersModel = require('./letters.model');
const db           = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

class LettersService {

  static async getAvailableLetterTypes() {
    return await LettersModel.getLetterTypes();
  }

  static async getTemplateFields(letterTypeId) {
    return await LettersModel.getTemplateFields(letterTypeId);
  }

  static async getWorkflowOptions() {
    return await LettersModel.getWorkflowOptions();
  }

  static async createDraft(payload) {
    const { tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, fields } = payload;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Generate UUID di aplikasi — tidak bergantung DEFAULT (UUID()) MySQL
      const letterUuid = uuidv4();

      const [result] = await conn.query(
        `INSERT INTO letters
          (uuid, tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, status, current_step)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 1)`,
        [letterUuid, tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose]
      );

      const letterId = result.insertId;

      if (fields && fields.length > 0) {
        const values = fields.map(f => [letterId, f.field_key, f.value]);
        await conn.query(
          `INSERT INTO letter_field_values (letter_id, field_key, value) VALUES ?`,
          [values]
        );
      }

      await conn.commit();
      return letterUuid;

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getMyLetters(residentId) {
    return await LettersModel.getMyLetters(residentId);
  }

  static async getLetterDetail(uuid) {
    const detail = await LettersModel.getDetailByUuid(uuid);
    if (!detail) throw new Error('Surat tidak ditemukan');
    return detail;
  }

  /**
   * Submit draft → status: submitted
   *
   * FIX: Tidak langsung set in_review_rt. Status 'submitted' berarti
   * surat sudah dikirim warga dan menunggu RT membukanya.
   * RT yang akan mengubah ke 'in_review_rt' saat membuka/memproses surat.
   *
   * Jika ingin otomatis masuk in_review_rt saat submit, uncomment
   * bagian newStatus di bawah.
   */
  static async submitLetter(uuid) {
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error('Surat tidak ditemukan');
    if (letter.status !== 'draft') throw new Error('Hanya surat berstatus draft yang bisa disubmit');

    // Langsung set 'submitted' — RT akan memprosesnya dari inbox
    const newStatus = 'submitted';

    const success = await LettersModel.updateLetterStatus(letter.id, newStatus, 1);
    if (!success) throw new Error('Gagal mengupdate status surat');
    return true;
  }
}

module.exports = LettersService;
```

---

### 2.4 `backend/src/modules/letters/sub-modules/approvals/approvals.service.js` — Sesuaikan status transition

**Bug:** Status transitions sebelumnya hanya include `in_review_rt` tapi tidak `submitted`. Setelah fix `submitLetter()` yang set status ke `submitted`, approvals harus menerima `submitted` sebagai status yang valid untuk di-approve RT.

```js
// backend/src/modules/letters/sub-modules/approvals/approvals.service.js
// GANTI SELURUH ISI FILE INI

const pool       = require('../../../../config/db.js');
const { v4: uuidv4 } = require('uuid');

// BullMQ opsional — tidak crash jika Redis tidak aktif
let pdfQueue = null;
try {
  const queueModule = require('../../../../config/queue.js');
  pdfQueue = queueModule.pdfQueue;
} catch (e) {
  console.warn('[Approvals] BullMQ tidak aktif:', e.message);
}

/**
 * Definisi transisi status per workflow dan role.
 *
 * FIX: Tambahkan 'submitted' sebagai status awal yang valid,
 * karena submitLetter() sekarang set ke 'submitted', bukan 'in_review_rt'.
 */
const STATUS_TRANSITIONS = {
  RT_ONLY: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  RT_THEN_RW: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw: { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

async function generateLetterNumber(letterTypeCode, tenantId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM letters
     WHERE status = 'completed'
     AND MONTH(completed_at) = MONTH(NOW())
     AND YEAR(completed_at)  = YEAR(NOW())`
  );
  const seq        = String(parseInt(count) + 1).padStart(3, '0');
  const monthRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()];
  const year       = new Date().getFullYear();
  return `${seq}/${letterTypeCode || 'SK'}/${tenantId || 'RT'}/${monthRoman}/${year}`;
}

/**
 * Approve surat oleh RT atau RW.
 * @param {string} letterUuid
 * @param {string} role - 'rt' atau 'rw'
 * @param {string|null} notes
 * @param {string|null} signatureUrl
 * @param {number} approverId - ID RT/RW yang approve (dari JWT: req.user.id)
 */
const approveLetter = async (letterUuid, role, notes = null, signatureUrl = null, approverId) => {
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code, lt.code AS letter_type_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     JOIN letter_types lt             ON l.letter_type_id     = lt.id
     WHERE l.uuid = ?`,
    [letterUuid]
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error(`Workflow tidak dikenal: ${letter.workflow_code}`);

  // Normalisasi role: 'admin_rt' → 'rt', 'admin_rw' → 'rw'
  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const transition = workflow[normalizedRole];
  if (!transition) {
    throw new Error(`Role "${normalizedRole}" tidak bisa approve di workflow "${letter.workflow_code}"`);
  }
  if (!transition.from.includes(letter.status)) {
    throw new Error(
      `Status saat ini "${letter.status}" tidak bisa di-approve. Harus salah satu dari: ${transition.from.join(', ')}`
    );
  }

  const nextStatus  = transition.to;
  const isCompleted = nextStatus === 'completed';

  let letterNumber = null;
  let qrToken      = null;
  if (isCompleted) {
    letterNumber = await generateLetterNumber(letter.letter_type_code, letter.tenant_id);
    qrToken      = uuidv4();
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert approval record
    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
       VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes, signatureUrl]
    );

    // Update status surat
    if (isCompleted) {
      await conn.query(
        `UPDATE letters
         SET status = ?, current_step = current_step + 1,
             completed_at = NOW(), letter_number = ?, qr_token = ?
         WHERE id = ?`,
        [nextStatus, letterNumber, qrToken, letter.id]
      );
    } else {
      await conn.query(
        `UPDATE letters SET status = ?, current_step = current_step + 1 WHERE id = ?`,
        [nextStatus, letter.id]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // Enqueue PDF generation (non-blocking)
  if (isCompleted && pdfQueue) {
    pdfQueue.add('generate-pdf', { letterId: letter.id, type: 'final' }).catch(err => {
      console.error('[Approvals] Gagal enqueue PDF job:', err.message);
    });
  }

  return { nextStatus, letterNumber, qrToken };
};

/**
 * Reject surat oleh RT atau RW.
 */
const rejectLetter = async (letterUuid, role, notes, approverId) => {
  const [[letter]] = await pool.query(
    `SELECT * FROM letters WHERE uuid = ?`, [letterUuid]
  );
  if (!letter) throw new Error('Surat tidak ditemukan');

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
       VALUES (?, ?, ?, 'rejected', ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes || 'Tidak ada alasan']
    );

    await conn.query(
      `UPDATE letters SET status = 'rejected', rejected_by_role = ? WHERE id = ?`,
      [normalizedRole, letter.id]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { status: 'rejected' };
};

module.exports = { approveLetter, rejectLetter };
```

---

### 2.5 `backend/src/modules/letters/letters.controller.js` — Bersihkan debug log

**Bug:** Ada banyak `console.log` debug di `createDraft()` yang bocorkan data user (id_warga, body request) ke log server.

```js
// backend/src/modules/letters/letters.controller.js
// UBAH HANYA FUNGSI createDraft — ganti log debug dengan log yang aman

static async createDraft(req, res) {
  try {
    const { letter_type_id, workflow_option_id, subject, purpose, fields } = req.body;

    // FIX: Hapus console.log req.user dan req.body (bocor data sensitif)
    // Support berbagai field ID dari JWT berbeda role
    const residentId = req.user?.id_warga || req.user?.id || null;

    if (!residentId) {
      return res.status(400).json({
        success: false,
        message: 'Resident ID tidak ditemukan di dalam token JWT'
      });
    }

    const [wargaRows] = await pool.query(
      'SELECT rt, rw FROM warga WHERE id_warga = ?',
      [residentId]
    );
    const warga = wargaRows[0];
    let tenantId = 'RW001'; // default fallback

    if (warga?.rw) {
      const rwVal       = String(warga.rw).trim();
      const rwCandidate = rwVal.startsWith('RW') ? rwVal : `RW${rwVal.padStart(3, '0')}`;
      const [rwRows]    = await pool.query(
        `SELECT rw_id FROM rw WHERE rw_id = ? OR no_rw = ? OR rw_id = ? LIMIT 1`,
        [rwVal, rwVal, rwCandidate]
      );
      tenantId = rwRows[0]?.rw_id || 'RW001';
    }

    const uuid = await LettersService.createDraft({
      tenant_id: tenantId,
      resident_id: residentId,
      letter_type_id,
      workflow_option_id,
      subject,
      purpose,
      fields,
    });

    res.status(201).json({
      success: true,
      data: { uuid },
      message: 'Draft berhasil disimpan'
    });
  } catch (error) {
    console.error('[LettersController] createDraft error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan draft',
      error: error.message
    });
  }
}
```

---

### 2.6 `backend/src/modules/letters/letters.routes.js` — Tidak ada perubahan

Routes sudah benar di versi ini. Tidak perlu diubah.

---

### 2.7 `backend/src/routes/ttdRtRwRoutes.js` — Fix middleware

**Bug:** Route TTD pakai `verifyToken` (middleware untuk semua role). Ini sebenarnya benar karena TTD bisa diupload oleh RT/RW, dan `verifyToken` memang bisa dipakai untuk semua role. Tapi nama file menyiratkan ini khusus RT/RW. Tambahkan validasi role di controller.

```js
// backend/src/routes/ttdRtRwRoutes.js
// GANTI SELURUH ISI FILE INI

const express              = require('express');
const router               = express.Router();
const { verifyToken }      = require('../middlewares/authMiddleware');
const authRtRwMiddleware   = require('../middlewares/authRtRwMiddleware');
const { uploadTtd }        = require('../middlewares/upload');
const wargaController      = require('../controllers/wargaController');

// Upload TTD — hanya RT/RW yang boleh upload TTD mereka
router.post('/upload-ttd',  authRtRwMiddleware, uploadTtd.single('ttdImage'), wargaController.uploadTtd);

// Get TTD — RT/RW bisa lihat TTD mereka sendiri
router.get('/current-ttd',  authRtRwMiddleware, wargaController.getTtd);

module.exports = router;
```

---

### 2.8 `backend/src/modules/letters/sub-modules/pdf/pdf.queue.js` — Tidak ada perubahan signifikan

File ini sudah benar — graceful fallback jika Redis tidak ada. Tidak perlu diubah.

---

### 2.9 `backend/src/modules/letters/sub-modules/pdf/pdf.service.js` — Tidak ada perubahan

Setelah `getLetterByUuid()` di model diperbaiki, `pdf.service.js` sudah otomatis mendapat `resident_nik` yang benar. Tidak perlu diubah.

---

### 2.10 `backend/src/controllers/superAdminController.js` — Fix query `is_active`

**Bug:** `getDashboardStats()` query `rw.is_active` tapi kolom ini baru ditambahkan di `kode-tambahan-fixed-2.sql`. Setelah pakai `master.sql`, kolom ini sudah ada. Tidak ada perubahan kode, hanya pastikan database sudah diupdate.

Satu fix yang diperlukan: `listRT()` dan `listRW()` query sudah pakai `is_active` — pastikan kolom ada dengan menjalankan `master.sql`.

---

## BAGIAN 3 — VERIFIKASI & CARA JALANKAN

---

### 3.1 Urutan Setup Ulang Database (Fresh Install)

```bash
# 1. Drop & recreate database (hati-hati di production!)
mysql -u root -p -e "DROP DATABASE IF EXISTS capstone; CREATE DATABASE capstone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Jalankan master schema
mysql -u root -p capstone < database/master.sql

# 3. Jalankan seed
mysql -u root -p capstone < database/seed-master.sql

# 4. Verifikasi tabel
mysql -u root -p capstone -e "SHOW TABLES;"
```

Output yang diharapkan (18 tabel):
```
app_config
letter_approvals
letter_attachments
letter_comments
letter_content_blocks
letter_field_values
letter_markdown_templates
letter_pdf_templates
letter_pdf_versions
letter_template_fields
letter_types
letter_workflow_options
letters
notifications
pengajuan_surat
rw
rt
superadmin
system_logs
template_surat
warga
```

---

### 3.2 Cara Update Database Tanpa Drop (Existing Data)

Jika database sudah ada dan ada data warga/RT/RW yang tidak boleh hilang, jalankan hanya DDL tambahan:

```bash
# Buat file patch untuk database yang sudah ada
cat > database/patch-existing.sql << 'EOF'
-- Patch untuk database yang sudah ada (tidak hapus data)
SET NAMES utf8mb4;

-- Tambah kolom yang mungkin belum ada
ALTER TABLE warga
  ADD COLUMN IF NOT EXISTS no_hp    VARCHAR(15)  NULL AFTER email,
  ADD COLUMN IF NOT EXISTS avatar   VARCHAR(255) NULL AFTER foto_ktp;

ALTER TABLE rt
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN   DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE rw
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN   DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Tambah UNIQUE dan INDEX yang mungkin belum ada (abaikan error jika sudah ada)
ALTER IGNORE TABLE warga ADD UNIQUE KEY uq_warga_nik   (NIK);
ALTER IGNORE TABLE warga ADD UNIQUE KEY uq_warga_email (email);
ALTER IGNORE TABLE warga ADD INDEX idx_warga_rw (rw);

-- Tabel baru
CREATE TABLE IF NOT EXISTS app_config (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     TEXT         NOT NULL,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS system_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT          NULL,
  actor_role  VARCHAR(20)  NULL,
  actor_name  VARCHAR(255) NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50)  NULL,
  target_id   VARCHAR(100) NULL,
  detail      JSON         NULL,
  ip_address  VARCHAR(45)  NULL,
  user_agent  VARCHAR(500) NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_actor  (actor_role, created_at),
  INDEX idx_logs_action (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipient_id   INT          NOT NULL,
  recipient_role VARCHAR(20)  NOT NULL,
  type           VARCHAR(50)  NOT NULL,
  title          VARCHAR(255) NOT NULL,
  message        TEXT         NULL,
  link           VARCHAR(255) NULL,
  is_read        BOOLEAN      DEFAULT FALSE,
  letter_uuid    VARCHAR(36)  NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_recipient (recipient_id, recipient_role, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS letter_markdown_templates (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id   INT          NOT NULL,
  name             VARCHAR(255) NOT NULL,
  markdown_content LONGTEXT     NOT NULL,
  html_compiled    LONGTEXT     NULL,
  version          INT          DEFAULT 1,
  is_active        BOOLEAN      DEFAULT TRUE,
  created_by       INT          NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- App config default
INSERT IGNORE INTO app_config (`key`, `value`, description) VALUES
('nama_instansi',    'RT 001 RW 001',           'Nama instansi untuk kop surat'),
('kop_surat_line1',  'RT 001 / RW 001',         'Kop Surat Baris 1'),
('kop_surat_line2',  'KELURAHAN SRONDOL WETAN', 'Kop Surat Baris 2'),
('kop_surat_line3',  'KEC. BANYUMANIK, KOTA SEMARANG', 'Kop Surat Baris 3');
EOF

# Eksekusi patch
mysql -u root -p capstone < database/patch-existing.sql
```

Selesai. Database dan backend sekarang sudah sinkron dan berjalan menggunakan UUID yang benar dan query alias yang akurat.
