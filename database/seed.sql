-- ============================================================================
-- seed.sql — Data awal untuk testing / development
-- Password semua akun = "admin123" (bcrypt hash)
-- ============================================================================

USE capstone;

-- RW Default
INSERT IGNORE INTO rw (rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password)
VALUES (
  'RW001',
  '001',
  'Budi Santoso',
  'Jawa Tengah',
  'Semarang',
  'Banyumanik',
  'Srondol Wetan',
  'ketuarw001',
  '$2b$10$YikZd8a/51iYuyP5HdQhHuysQ3UG3RyXnlUyKpP726C7JRhX7da16'
);

-- RT Default (FK ke RW001)
INSERT IGNORE INTO rt (no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password)
VALUES (
  '001',
  'RW001',
  'Andi Wijaya',
  'Jawa Tengah',
  'Semarang',
  'Banyumanik',
  'Srondol Wetan',
  'ketuart001',
  '$2b$10$YikZd8a/51iYuyP5HdQhHuysQ3UG3RyXnlUyKpP726C7JRhX7da16'
);

INSERT IGNORE INTO letter_types (code, name, description, required_docs, sort_order) VALUES
('DOMISILI',      'Surat Keterangan Domisili',        'Keterangan bahwa pemohon berdomisili di wilayah RT/RW',        '["KTP", "KK"]', 1),
('TIDAK_MAMPU',   'Surat Keterangan Tidak Mampu',     'Keterangan kondisi ekonomi untuk keperluan bantuan/beasiswa',  '["KTP", "KK", "Bukti Penghasilan"]', 2),
('PENGANTAR_KTP', 'Surat Pengantar KTP',              'Pengantar untuk pembuatan atau perpanjangan KTP',              '["KK", "Surat Pindah (jika pindahan)"]', 3),
('PENGANTAR_KK',  'Surat Pengantar KK',               'Pengantar untuk pembuatan atau perubahan KK',                  '["KTP", "Akta Kelahiran/Nikah"]', 4),
('NIKAH',         'Surat Pengantar Nikah',             'Pengantar ke KUA untuk keperluan pernikahan',                  '["KTP", "KK", "Akta Kelahiran", "Pas Foto 4x6"]', 5),
('USAHA',         'Surat Keterangan Usaha',            'Keterangan bahwa pemohon memiliki usaha di wilayah ini',       '["KTP", "KK"]', 6),
('KEHILANGAN',    'Surat Keterangan Kehilangan',       'Keterangan kehilangan barang/dokumen untuk laporan polisi',    '["KTP"]', 7),
('SKCK',          'Surat Pengantar SKCK',              'Pengantar ke Polsek untuk pembuatan SKCK',                     '["KTP", "KK", "Pas Foto 4x6"]', 8),
('AHLI_WARIS',    'Surat Keterangan Ahli Waris',       'Keterangan ahli waris untuk keperluan hukum/perbankan',        '["KTP Ahli Waris", "KK", "Akta Kematian", "Akta Kelahiran"]', 9),
('BEDA_ALAMAT',   'Surat Keterangan Beda Alamat',      'Keterangan bahwa KTP dan alamat tinggal berbeda',              '["KTP", "KK"]', 10);

-- DOMISILI
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(1, 'lama_tinggal',         'Lama Tinggal di Alamat Ini', 'text',   NULL, '{"required":true}', 1),
-- Contoh: "5 tahun", "sejak 2018"
(1, 'status_tempat_tinggal','Status Tempat Tinggal',      'select',
  '[{"value":"milik_sendiri","label":"Milik Sendiri"},
    {"value":"kontrak","label":"Kontrak/Sewa"},
    {"value":"kos","label":"Kost"},
    {"value":"numpang","label":"Numpang/Menumpang"}]',
  '{"required":true}', 2),
(1, 'keperluan_domisili',   'Keperluan Surat Domisili',   'select',
  '[{"value":"bank","label":"Keperluan Bank"},
    {"value":"kerja","label":"Melamar Pekerjaan"},
    {"value":"sekolah","label":"Pendaftaran Sekolah/Kuliah"},
    {"value":"beasiswa","label":"Beasiswa"},
    {"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 3),
(1, 'keterangan_tambahan',  'Keterangan Tambahan',        'textarea', NULL, '{"required":false}', 4);

-- TIDAK_MAMPU
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(2, 'penghasilan_per_bulan', 'Penghasilan Per Bulan (Rp)', 'number', NULL, '{"required":true,"min":0}', 1),
(2, 'jumlah_tanggungan',     'Jumlah Anggota Keluarga',    'number', NULL, '{"required":true,"min":1,"max":20}', 2),
(2, 'pekerjaan_kepala_keluarga', 'Pekerjaan Kepala Keluarga', 'text', NULL, '{"required":true}', 3),
(2, 'keperluan_surat',       'Keperluan Surat',            'select',
  '[{"value":"biaya_sekolah","label":"Keringanan Biaya Sekolah"},
    {"value":"beasiswa","label":"Beasiswa"},
    {"value":"bantuan_sosial","label":"Bantuan Sosial"},
    {"value":"bpjs","label":"BPJS Kesehatan Gratis"},
    {"value":"pengobatan","label":"Keringanan Biaya Pengobatan"},
    {"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 4),
(2, 'alasan_tambahan',       'Alasan/Keterangan Tambahan', 'textarea', NULL, '{"required":false}', 5);

-- PENGANTAR_KTP
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(3, 'jenis_keperluan_ktp', 'Jenis Keperluan', 'select',
  '[{"value":"baru","label":"Pembuatan KTP Baru"},
    {"value":"perpanjangan","label":"Perpanjangan KTP"},
    {"value":"rusak","label":"KTP Rusak"},
    {"value":"hilang","label":"KTP Hilang"},
    {"value":"pindah","label":"Pindah Domisili"}]',
  '{"required":true}', 1);

-- NIKAH
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(5, 'status_perkawinan_saat_ini', 'Status Perkawinan Saat Ini', 'select',
  '[{"value":"belum_kawin","label":"Belum Pernah Kawin"},
    {"value":"duda","label":"Duda"},
    {"value":"janda","label":"Janda"}]',
  '{"required":true}', 1),
(5, 'nama_calon_pasangan',  'Nama Calon Pasangan',         'text',   NULL, '{"required":true}', 2),
(5, 'alamat_calon_pasangan','Alamat Calon Pasangan',       'textarea', NULL, '{"required":true}', 3),
(5, 'rencana_tanggal_nikah','Rencana Tanggal Pernikahan',  'date',   NULL, '{"required":true}', 4),
(5, 'tempat_akad',          'Tempat Akad/Pemberkatan',     'text',   NULL, '{"required":true}', 5);

-- USAHA
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(6, 'nama_usaha',    'Nama Usaha',         'text',   NULL, '{"required":true}', 1),
(6, 'jenis_usaha',   'Jenis Usaha',        'select',
  '[{"value":"perdagangan","label":"Perdagangan/Toko"},
    {"value":"jasa","label":"Jasa"},
    {"value":"kuliner","label":"Kuliner/Makanan"},
    {"value":"pertanian","label":"Pertanian"},
    {"value":"peternakan","label":"Peternakan"},
    {"value":"kerajinan","label":"Kerajinan Tangan"},
    {"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 2),
(6, 'lama_usaha',    'Lama Usaha Berdiri', 'text',   NULL, '{"required":true}', 3),
(6, 'alamat_usaha',  'Alamat Usaha',       'textarea', NULL, '{"required":true}', 4),
(6, 'keperluan_surat_usaha', 'Keperluan Surat', 'select',
  '[{"value":"izin_usaha","label":"Pengurusan Izin Usaha"},
    {"value":"pinjaman","label":"Pengajuan Pinjaman/KUR"},
    {"value":"tender","label":"Keperluan Tender"},
    {"value":"lainnya","label":"Lainnya"}]',
  '{"required":true}', 5);

-- KEHILANGAN
INSERT IGNORE INTO letter_template_fields (letter_type_id, field_key, label, field_type, options, validation, sort_order) VALUES
(7, 'barang_hilang',     'Nama Barang/Dokumen yang Hilang', 'text',  NULL, '{"required":true}', 1),
(7, 'waktu_kehilangan',  'Perkiraan Waktu Kehilangan',      'date',  NULL, '{"required":true}', 2),
(7, 'tempat_kehilangan', 'Perkiraan Tempat Kehilangan',     'text',  NULL, '{"required":false}', 3),
(7, 'kronologi',         'Kronologi Singkat',               'textarea', NULL, '{"required":true}', 4);

SELECT 'Seed berhasil!' AS hasil;
