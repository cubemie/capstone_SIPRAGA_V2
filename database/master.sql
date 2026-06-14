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
  current_reviewer_role VARCHAR(10) NULL,
  submission_source     VARCHAR(20) NULL,
  created_by_role       VARCHAR(10) NULL,
  created_by_id         VARCHAR(100) NULL,
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
