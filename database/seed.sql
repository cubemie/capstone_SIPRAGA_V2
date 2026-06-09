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
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
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
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);

SELECT 'Seed berhasil!' AS hasil;
