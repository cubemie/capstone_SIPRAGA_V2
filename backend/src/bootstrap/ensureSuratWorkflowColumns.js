const db = require('../config/db');
const SURAT_STATUS = require('../constants/suratStatus');

let ensurePromise = null;

async function columnExists(columnName) {
  try {
    const [rows] = await db.query(
      `SHOW COLUMNS FROM pengajuan_surat LIKE ?`,
      [columnName]
    );
    return rows.length > 0;
  } catch (error) {
    console.warn(`[ensureColumns] Gagal memeriksa kolom ${columnName}:`, error.message);
    return false;
  }
}

async function addColumnIfMissing(columnName, definition) {
  if (!(await columnExists(columnName))) {
    try {
      await db.query(`ALTER TABLE pengajuan_surat ADD COLUMN ${definition}`);
      console.log(`[ensureColumns] Kolom ${columnName} berhasil ditambahkan`);
    } catch (error) {
      console.warn(`[ensureColumns] Gagal menambahkan kolom ${columnName}:`, error.message);
    }
  }
}

async function ensureSuratWorkflowColumns() {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    await addColumnIfMissing("current_reviewer_role", "current_reviewer_role VARCHAR(10) NULL AFTER rw");
    await addColumnIfMissing("submission_source", "submission_source VARCHAR(20) NULL AFTER current_reviewer_role");
    await addColumnIfMissing("created_by_role", "created_by_role VARCHAR(10) NULL AFTER submission_source");
    await addColumnIfMissing("created_by_id", "created_by_id VARCHAR(100) NULL AFTER created_by_role");

    try {
      await db.query(
        `UPDATE pengajuan_surat
         SET current_reviewer_role = COALESCE(current_reviewer_role, 'rt'),
             submission_source = COALESCE(submission_source, 'online')
         WHERE status = ?`,
        [SURAT_STATUS.MENUNGGU]
      );
    } catch (error) {
      console.warn('[ensureColumns] Gagal update kolom current_reviewer_role/submission_source:', error.message);
    }

    try {
      await db.query(
        `UPDATE pengajuan_surat
         SET submission_source = COALESCE(submission_source, 'online')`
      );
    } catch (error) {
      console.warn('[ensureColumns] Gagal update kolom submission_source:', error.message);
    }
  })().catch((error) => {
    ensurePromise = null;
    console.warn('[ensureColumns] Gagal menyiapkan kolom workflow:', error.message);
  });

  return ensurePromise;
}

module.exports = ensureSuratWorkflowColumns;
