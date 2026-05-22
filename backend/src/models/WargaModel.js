/**
 * WargaModel
 *
 * Bertanggung jawab atas seluruh akses database untuk tabel `warga`.
 * Tidak mengandung logika bisnis — hanya query SQL.
 */

const db = require('../config/db');

class WargaModel {
  /**
   * Cari warga berdasarkan NIK.
   * @param {string} nik
   * @returns {Object|null}
   */
  static async findByNik(nik) {
    const [rows] = await db.query('SELECT * FROM warga WHERE NIK = ?', [nik]);
    return rows[0] || null;
  }

  /**
   * Cari warga berdasarkan email.
   * @param {string} email
   * @returns {Object|null}
   */
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM warga WHERE email = ?', [email]);
    return rows[0] || null;
  }

  /**
   * Cari warga berdasarkan NIK atau email (untuk cek duplikat saat register).
   * @param {string} nik
   * @param {string} email
   * @returns {Object|null}
   */
  static async findByNikOrEmail(nik, email) {
    const [rows] = await db.query(
      'SELECT * FROM warga WHERE NIK = ? OR email = ?',
      [nik, email]
    );
    return rows[0] || null;
  }

  /**
   * Cari warga berdasarkan ID.
   * @param {number} id
   * @returns {Object|null}
   */
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM warga WHERE id_warga = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Buat akun warga baru.
   * @param {{ nik, nama, email, password, jenis_kelamin, tanggal_lahir }} data
   */
  static async create({ nik, nama, email, password, jenis_kelamin, tanggal_lahir }) {
    await db.query(
      `INSERT INTO warga (NIK, nama, jenis_kelamin, tanggal_lahir, email, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nik, nama, jenis_kelamin, tanggal_lahir, email, password]
    );
  }

  /**
   * Update data profil warga.
   * @param {number} id
   * @param {Object} fields
   */
  static async update(id, fields) {
    await db.query(
      `UPDATE warga
       SET provinsi=?, kota=?, kecamatan=?, kelurahan_desa=?, rw=?, rt=?,
           agama=?, status_perkawinan=?, pekerjaan=?, kewarganegaraan=?,
           tempat_lahir=?, alamat=?, negara=?, foto_ktp=?
       WHERE id_warga = ?`,
      [
        fields.provinsi, fields.kota, fields.kecamatan, fields.kelurahan_desa,
        fields.rw, fields.rt, fields.agama, fields.status_perkawinan,
        fields.pekerjaan, fields.kewarganegaraan, fields.tempat_lahir,
        fields.alamat, fields.negara, fields.foto_ktp, id,
      ]
    );
  }
}

module.exports = WargaModel;
