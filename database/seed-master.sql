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

-- ── Default Superadmin (seed) ─────────────────────────────────────────────────
-- Password = bcrypt('admin123', 10) — sama dengan password seed RT/RW di atas
INSERT IGNORE INTO superadmin (username, password)
VALUES (
  'superadmin',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

-- ── App Config Default ────────────────────────────────────────────────────────
INSERT IGNORE INTO app_config (`key`, `value`, description) VALUES
('nama_instansi',    'RT 001 RW 001',          'Nama instansi untuk kop surat'),
('kop_surat_line1',  'RT 001 / RW 001',        'Kop Surat Baris 1'),
('kop_surat_line2',  'KELURAHAN SRONDOL WETAN', 'Kop Surat Baris 2'),
('kop_surat_line3',  'KEC. BANYUMANIK, KOTA SEMARANG', 'Kop Surat Baris 3');