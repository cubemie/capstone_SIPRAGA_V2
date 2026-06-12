USE capstone;

INSERT IGNORE INTO letter_workflow_options (code, name, description, steps, sort_order) VALUES 
('RT_ONLY', 'Hanya RT', 'Surat hanya memerlukan persetujuan dan tanda tangan Ketua RT', '[{"step": 1, "role": "rt", "label": "Verifikasi RT"}]', 1), 
('RT_THEN_RW', 'RT kemudian RW', 'Surat memerlukan persetujuan RT, dilanjutkan tanda tangan RW', '[{"step": 1, "role": "rt", "label": "Verifikasi RT"}, {"step": 2, "role": "rw", "label": "Tanda Tangan RW"}]', 2);
