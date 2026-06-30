-- ============================================================
-- SIPRAGA V2 — Demo Accounts (sesuai README)
-- Jalankan SETELAH master.sql dan seed-master.sql
-- mysql -h <host> -P <port> -u <user> -p<pass> railway < database/seed-demo-accounts.sql
-- ============================================================

SET NAMES utf8mb4;

-- ── RW: KADES / inikades ─────────────────────────────────────────────────────
INSERT IGNORE INTO rw (rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, is_active)
VALUES (
  'RW002', '002', 'Kepala Desa',
  'Jawa Tengah', 'Kota Semarang', 'Banyumanik', 'Srondol Wetan',
  'KADES',
  '$2b$10$niIHrI2irTM53X8.ocjOFuzC0AX5wCszUvaUaiID53nc0Nbf4npRm',
  TRUE
);

-- ── RT: tomsuri / initomsuri (di bawah RW002) ────────────────────────────────
INSERT IGNORE INTO rt (no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, is_active)
VALUES (
  '002', 'RW002', 'Tom Suri',
  'Jawa Tengah', 'Kota Semarang', 'Banyumanik', 'Srondol Wetan',
  'tomsuri',
  '$2b$10$L9ieMkzq9TNeo87/hqJs7O5RMeCijKWLgqUnDtJdWBZ86hfefzWwu',
  TRUE
);

-- ── Warga: NIK 1234567890123456 / 123456789 ──────────────────────────────────
INSERT IGNORE INTO warga (NIK, nama, email, password, no_hp, jenis_kelamin, alamat, rt, rw, kelurahan_desa, kecamatan, kota, provinsi)
VALUES (
  '1234567890123456', 'Demo Warga', 'demo@sipraga.id',
  '$2b$10$CnfD.3uG1qOZoW8ukvnzhudi3gHShnUrvqerPydca52SFzYOaB2ym',
  '08123456789', 'Laki-laki',
  'Jl. Demo No. 1', '002', '002',
  'Srondol Wetan', 'Banyumanik', 'Kota Semarang', 'Jawa Tengah'
);

-- ── Superadmin: sudmin / sudmin ───────────────────────────────────────────────
INSERT IGNORE INTO superadmin (username, password)
VALUES (
  'sudmin',
  '$2b$10$13s9Aj6h6nusgiM.Hai.KO/LxHyFcEJM.mncEJyT0.Pu2L12z/WLW'
);
