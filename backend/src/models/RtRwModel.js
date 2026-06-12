/**
 * RtRwModel
 *
 * Bertanggung jawab atas seluruh akses database untuk tabel `rt`, `rw`,
 * dan `superadmin`.
 * Tidak mengandung logika bisnis — hanya query SQL.
 */

const db = require('../config/db');

class RtRwModel {
  // ─── RT ──────────────────────────────────────────────────────────────────

  /**
   * Cari data RT berdasarkan username.
   * @param {string} username
   * @returns {Object|null}
   */
  static async findRtByUsername(username) {
    const [rows] = await db.query('SELECT * FROM rt WHERE username = ?', [username]);
    return rows[0] || null;
  }

  /**
   * Cari data RT berdasarkan ID.
   * @param {number} id
   * @returns {Object|null}
   */
  static async findRtById(id) {
    const [rows] = await db.query('SELECT * FROM rt WHERE rt_id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Cek apakah username RT sudah digunakan.
   * @param {string} username
   * @returns {boolean}
   */
  static async isRtUsernameTaken(username) {
    const [rows] = await db.query('SELECT rt_id FROM rt WHERE username = ?', [username]);
    return rows.length > 0;
  }

  /**
   * Buat akun RT baru.
   * @param {{ no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital }} data
   */
  static async createRt(data) {
    await db.query(
      `INSERT INTO rt
       (no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.no_rt, data.rw_id, data.nama_ketua,
        data.provinsi, data.kota, data.kecamatan, data.kelurahan_desa,
        data.username, data.password, data.ttd_digital || null,
      ]
    );
  }

  /**
   * Update tanda tangan digital RT.
   * @param {number} id
   * @param {string} filename
   */
  static async updateTtdRt(id, filename) {
    await db.query('UPDATE rt SET ttd_digital = ? WHERE rt_id = ?', [filename, id]);
  }

  /**
   * Update data profil RT.
   * @param {number} id
   * @param {Object} fields
   */
  static async updateRt(id, fields) {
    await db.query(
      `UPDATE rt
       SET nama_ketua=?, provinsi=?, kota=?, kecamatan=?, kelurahan_desa=?, avatar_url=?
       WHERE rt_id = ?`,
      [fields.nama_ketua, fields.provinsi, fields.kota, fields.kecamatan, fields.kelurahan_desa, fields.avatar_url, id]
    );
  }

  // ─── RW ──────────────────────────────────────────────────────────────────

  /**
   * Cari data RW berdasarkan username.
   * @param {string} username
   * @returns {Object|null}
   */
  static async findRwByUsername(username) {
    const [rows] = await db.query('SELECT * FROM rw WHERE username = ?', [username]);
    return rows[0] || null;
  }

  /**
   * Cari data RW berdasarkan ID.
   * @param {number} id
   * @returns {Object|null}
   */
  static async findRwById(id) {
    const [rows] = await db.query('SELECT * FROM rw WHERE rw_id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Cek apakah username RW sudah digunakan.
   * @param {string} username
   * @returns {boolean}
   */
  static async isRwUsernameTaken(username) {
    const [rows] = await db.query('SELECT rw_id FROM rw WHERE username = ?', [username]);
    return rows.length > 0;
  }

  /**
   * Cek apakah rw_id ada di tabel rw.
   * @param {string|number} rw_id
   * @returns {boolean}
   */
  static async isRwExists(rw_id) {
    const [rows] = await db.query('SELECT rw_id FROM rw WHERE rw_id = ?', [rw_id]);
    return rows.length > 0;
  }

  /**
   * Buat akun RW baru.
   * @param {{ rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital }} data
   */
  static async createRw(data) {
    await db.query(
      `INSERT INTO rw
       (rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.rw_id, data.no_rw, data.nama_ketua,
        data.provinsi, data.kota, data.kecamatan, data.kelurahan_desa,
        data.username, data.password, data.ttd_digital || null,
      ]
    );
  }

  /**
   * Update tanda tangan digital RW.
   * @param {number} id
   * @param {string} filename
   */
  static async updateTtdRw(id, filename) {
    await db.query('UPDATE rw SET ttd_digital = ? WHERE rw_id = ?', [filename, id]);
  }

  /**
   * Update data profil RW.
   * @param {number} id
   * @param {Object} fields
   */
  static async updateRw(id, fields) {
    await db.query(
      `UPDATE rw
       SET nama_ketua=?, provinsi=?, kota=?, kecamatan=?, kelurahan_desa=?, avatar_url=?
       WHERE rw_id = ?`,
      [fields.nama_ketua, fields.provinsi, fields.kota, fields.kecamatan, fields.kelurahan_desa, fields.avatar_url, id]
    );
  }

  // ─── Superadmin ──────────────────────────────────────────────────────────

  /**
   * Cari superadmin berdasarkan username.
   * @param {string} username
   * @returns {Object|null}
   */
  static async findSuperadminByUsername(username) {
    const [rows] = await db.query('SELECT * FROM superadmin WHERE username = ?', [username]);
    return rows[0] || null;
  }

  /**
   * Cek apakah username superadmin sudah digunakan.
   * @param {string} username
   * @returns {boolean}
   */
  static async isSuperadminUsernameTaken(username) {
    const [rows] = await db.query('SELECT id FROM superadmin WHERE username = ?', [username]);
    return rows.length > 0;
  }

  /**
   * Buat akun superadmin baru.
   * @param {{ username: string, password: string }} data
   */
  static async createSuperadmin({ username, password }) {
    await db.query(
      'INSERT INTO superadmin (username, password) VALUES (?, ?)',
      [username, password]
    );
  }
}

module.exports = RtRwModel;
