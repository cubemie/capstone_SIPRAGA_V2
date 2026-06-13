USE capstone;

-- Perbaiki surat lama yang tenant_id-nya salah (mis. fallback numerik '1')
UPDATE letters SET tenant_id = 'RW001' WHERE tenant_id NOT IN (SELECT rw_id FROM rw);
