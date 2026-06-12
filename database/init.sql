-- ============================================================
-- LETTER_TYPES — Jenis surat yang tersedia
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_types (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50) UNIQUE NOT NULL,
  -- Contoh: 'DOMISILI', 'TIDAK_MAMPU', 'PENGANTAR_KTP', 'USAHA'
  name         VARCHAR(255) NOT NULL,
  -- Contoh: 'Surat Keterangan Domisili'
  description  TEXT,
  icon         VARCHAR(50),
  -- Nama icon dari lucide-react, contoh: 'Home', 'FileText'
  required_docs JSON,
  -- ["KTP", "KK", "Surat Pengantar RT"] — ditampilkan di card Step 1
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_TEMPLATE_FIELDS — Field dinamis per jenis surat
-- Tidak hardcode di frontend.
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_template_fields (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id  INT NOT NULL,
  field_key       VARCHAR(100) NOT NULL,
  -- Key unik, dipakai sebagai nama variabel di template PDF
  -- Contoh: 'lama_tinggal', 'status_tempat_tinggal', 'penghasilan'
  label           VARCHAR(255) NOT NULL,
  -- Label yang ditampilkan ke user: 'Lama Tinggal'
  field_type      ENUM(
                    'text',
                    'textarea',
                    'number',
                    'date',
                    'select',
                    'radio',
                    'checkbox'
                  ) NOT NULL,
  placeholder     VARCHAR(255),
  options         JSON,
  -- Untuk select/radio: [{"value": "milik_sendiri", "label": "Milik Sendiri"}]
  validation      JSON,
  -- {"required": true, "min": 1, "max": 100, "pattern": "..."}
  help_text       VARCHAR(500),
  sort_order      INT DEFAULT 0,
  is_required     BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id),
  UNIQUE KEY uq_type_field (letter_type_id, field_key)
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_PDF_TEMPLATES — Template file untuk generate PDF
-- Bisa berbeda per tenant (RW bisa punya kop surat sendiri)
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_pdf_templates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  letter_type_id  INT NOT NULL,
  tenant_id       VARCHAR(50) NULL,
  -- NULL = template global/default
  name            VARCHAR(255) NOT NULL,
  html_template   LONGTEXT NOT NULL,
  -- Template HTML dengan placeholder: {{nama}}, {{nik}}, {{lama_tinggal}}
  -- Puppeteer akan render ini ke PDF
  version         INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id)
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_WORKFLOW_OPTIONS — Pilihan workflow yang bisa dipilih user
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_workflow_options (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50) UNIQUE NOT NULL,
  -- 'RT_ONLY', 'RW_ONLY', 'RT_THEN_RW', 'KELURAHAN'
  name         VARCHAR(255) NOT NULL,
  -- 'Ketua RT saja', 'RT lalu RW'
  description  VARCHAR(500),
  steps        JSON NOT NULL,
  -- [{"step": 1, "role": "admin_rt", "label": "Verifikasi RT"},
  --  {"step": 2, "role": "admin_rw", "label": "Tanda Tangan RW"}]
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0
) ENGINE=InnoDB;

-- ============================================================
-- LETTERS — Inti pengajuan surat
-- ============================================================
CREATE TABLE IF NOT EXISTS letters (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  uuid              VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  -- Dipakai di URL dan QR code, bukan expose INT id
  letter_number     VARCHAR(100) NULL,
  -- Assign saat COMPLETED: '001/RT-06/VII/2026'
  tenant_id         VARCHAR(50) NOT NULL,
  resident_id       INT NOT NULL,
  letter_type_id    INT NOT NULL,
  workflow_option_id INT NOT NULL,
  subject           VARCHAR(255) NOT NULL,
  purpose           TEXT,
  -- Keperluan surat (field umum)
  status            ENUM(
                      'draft',
                      'submitted',
                      'in_review_rt',
                      'approved_rt',
                      'in_review_rw',
                      'approved_rw',
                      'revision_requested',
                      'rejected',
                      'completed',
                      'cancelled'
                    ) DEFAULT 'draft',
  current_step      INT DEFAULT 1,
  qr_token          VARCHAR(36) UNIQUE,
  -- Assign saat COMPLETED untuk verifikasi publik
  rejected_by_role  VARCHAR(20) NULL,
  -- 'admin_rt' atau 'admin_rw' — siapa yang menolak
  submitted_at      TIMESTAMP NULL,
  completed_at      TIMESTAMP NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES warga(id_warga),
  FOREIGN KEY (letter_type_id) REFERENCES letter_types(id),
  FOREIGN KEY (workflow_option_id) REFERENCES letter_workflow_options(id),
  INDEX idx_letters_tenant_status (tenant_id, status),
  INDEX idx_letters_resident (resident_id),
  INDEX idx_letters_uuid (uuid)
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_FIELD_VALUES — Nilai field dinamis yang diisi user
-- Key-value store, fleksibel untuk semua jenis surat
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_field_values (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  letter_id  INT NOT NULL,
  field_key  VARCHAR(100) NOT NULL,
  -- Merujuk ke letter_template_fields.field_key
  value      TEXT NOT NULL,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE,
  UNIQUE KEY uq_letter_field (letter_id, field_key)
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_CONTENT_BLOCKS — Content Builder (Step 3)
-- Elemen tambahan yang ditambahkan user ke isi surat
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_content_blocks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  letter_id   INT NOT NULL,
  block_type  ENUM('paragraph', 'list', 'points', 'note', 'info') NOT NULL,
  content     TEXT NOT NULL,
  -- Untuk list/points: JSON array ["item 1", "item 2"]
  -- Untuk paragraph/note: plain text
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_ATTACHMENTS — Lampiran (Step 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_attachments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  letter_id   INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  mime_type   VARCHAR(100) NOT NULL,
  file_size   INT NOT NULL,
  -- Bytes
  sort_order  INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_PDF_VERSIONS — Versi PDF yang pernah di-generate
-- Setiap approval menghasilkan PDF baru
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_pdf_versions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  letter_id   INT NOT NULL,
  version     INT NOT NULL,
  -- 1 = preview awal, 2 = setelah TTD RT, 3 = final
  type        ENUM('preview', 'signed_rt', 'signed_rw', 'final') NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  generated_by INT NULL,
  -- user_id yang trigger generate (NULL = system)
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_APPROVALS — History approval setiap step
-- Immutable, tidak pernah di-update
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_approvals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  letter_id     INT NOT NULL,
  approver_id   INT NOT NULL,
  step          INT NOT NULL,
  action        ENUM('approved', 'rejected', 'revision_requested') NOT NULL,
  notes         TEXT,
  signature_url VARCHAR(500),
  -- URL TTD digital yang dipakai di step ini
  acted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id)
) ENGINE=InnoDB;

-- ============================================================
-- LETTER_COMMENTS — Catatan/komunikasi dalam surat
-- Bisa dari warga, RT, atau RW
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_comments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  letter_id   INT NOT NULL,
  author_id   INT NOT NULL,
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  -- TRUE = hanya terlihat oleh RT/RW, tidak oleh warga
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB;