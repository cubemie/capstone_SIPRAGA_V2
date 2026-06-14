INSERT IGNORE INTO letter_workflow_options (code, name, description, steps, sort_order) VALUES
('RT_ONLY', 'Persetujuan RT Saja', 'Hanya membutuhkan tanda tangan Ketua RT',
  '[{"step":1,"role":"admin_rt","label":"Verifikasi RT"}]', 1),
('RT_THEN_RW', 'Persetujuan RT & RW', 'Membutuhkan tanda tangan Ketua RT, dilanjutkan Ketua RW',
  '[{"step":1,"role":"admin_rt","label":"Verifikasi RT"},{"step":2,"role":"admin_rw","label":"Tanda Tangan RW"}]', 2);
