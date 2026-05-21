/**
 * TemplateSuratModel
 *
 * Bertanggung jawab atas seluruh akses database untuk tabel `template_surat`.
 * Tidak mengandung logika bisnis — hanya query SQL.
 */

const db = require('../config/db');

class TemplateSuratModel {
  /**
   * Ambil semua template surat.
   * @returns {Array}
   */
  static async findAll() {
    const [rows] = await db.query(
      'SELECT * FROM template_surat ORDER BY id_template ASC'
    );
    return rows;
  }

  /**
   * Cari template berdasarkan ID.
   * @param {number} id
   * @returns {Object|null}
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM template_surat WHERE id_template = ?',
      [id]
    );
    return rows[0] ?? null;
  }

  /**
   * Buat template surat baru.
   * @param {{ nama: string, file_path: string }} data
   */
  static async create({ nama, file_path }) {
    await db.query(
      'INSERT INTO template_surat (nama, file_path) VALUES (?, ?)',
      [nama, file_path]
    );
  }

  /**
   * Hapus template berdasarkan ID.
   * @param {number} id
   */
  static async deleteById(id) {
    await db.query(
      'DELETE FROM template_surat WHERE id_template = ?',
      [id]
    );
  }
}

module.exports = TemplateSuratModel;
