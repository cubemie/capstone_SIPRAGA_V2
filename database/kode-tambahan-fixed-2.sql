  ('kop_surat_line2',  'KELURAHAN SRONDOL WETAN',  'Kop Surat Baris 2');

-- 2. Audit log / system log
CREATE TABLE IF NOT EXISTS system_logs (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id     INT,
  actor_role   VARCHAR(20),   -- 'warga', 'rt', 'rw', 'superadmin', 'system'
  actor_name   VARCHAR(255),
  action       VARCHAR(100),  -- 'LOGIN', 'LOGOUT', 'CREATE_LETTER', 'APPROVE_LETTER', dll
  target_type  VARCHAR(50),   -- 'letter', 'user', 'template', 'config'
  target_id    VARCHAR(100),
  detail       JSON,          -- data tambahan (ip, payload ringkas, dll)
  ip_address   VARCHAR(45),
  user_agent   VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (actor_role, created_at),
  INDEX (action, created_at),
  INDEX (target_type, target_id)
);

-- 3. Template surat berbasis Markdown (untuk superadmin)
-- Menggantikan/melengkapi letter_pdf_templates yang berbasis HTML Mustache
CREATE TABLE IF NOT EXISTS letter_markdown_templates (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id   INT NOT NULL,         -- FK → letter_types.id
  name             VARCHAR(255) NOT NULL,
  markdown_content LONGTEXT NOT NULL,    -- template dalam Markdown + variabel {{}}
  html_compiled    LONGTEXT,             -- hasil compile Markdown → HTML (cache)
  version          INT DEFAULT 1,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       INT,                  -- superadmin id
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id)
);

-- 4. Notifikasi in-app (untuk badge di sidebar)
CREATE TABLE IF NOT EXISTS notifications (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  recipient_role VARCHAR(20) NOT NULL,  -- 'warga', 'rt', 'rw'
  type         VARCHAR(50) NOT NULL,    -- 'NEW_LETTER', 'APPROVED', 'REJECTED', 'REMINDER'
  title        VARCHAR(255) NOT NULL,
  message      TEXT,
  link         VARCHAR(255),           -- URL yang dibuka saat klik notif
  is_read      BOOLEAN DEFAULT FALSE,
  letter_uuid  VARCHAR(36),            -- referensi surat terkait
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (recipient_id, recipient_role, is_read),
  INDEX (created_at)
);

-- 5. Kolom is_active untuk RT dan RW (untuk suspend akun)
ALTER TABLE rt ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE rw ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE rt ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rw ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
