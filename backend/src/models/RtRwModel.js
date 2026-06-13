/**
 * RtRwModel.js - FIXED VERSION
 */

const db = require('../config/db');

class RtRwModel {
  // ─── RT METHODS ──────────────────────────────────────────────────────────

  static async findRtByUsername(username) {
    const [rows] = await db.query('SELECT * FROM rt WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findRtById(id) {
    const [rows] = await db.query('SELECT * FROM rt WHERE rt_id = ?', [id]);
    return rows[0] || null;
  }

  static async isRtUsernameTaken(username) {
    const [rows] = await db.query('SELECT id FROM rt WHERE username = ?', [username]);
    return rows.length > 0;
  }

  static async createRt(data) {
    // OTOMATISASI: Jika frontend tidak mengirim rt_id, kita buatkan formatnya
    // Contoh: no_rt '03' dan rw_id 'RW005-BGR' menjadi 'RT03-RW005-BGR'
    const generatedRtId = data.rt_id || `RT${data.no_rt}-${data.rw_id}`;

    const query = `
      INSERT INTO rt 
      (rt_id, no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return await db.query(query, [
      generatedRtId,       // Gunakan ID yang baru dibuat atau yang dari data
      data.no_rt, 
      data.rw_id, 
      data.nama_ketua,
      data.provinsi, 
      data.kota, 
      data.kecamatan, 
      data.kelurahan_desa,
      data.username, 
      data.password, 
      data.ttd_digital || null
    ]);
  }

  // ─── RW METHODS ──────────────────────────────────────────────────────────

  static async findRwByUsername(username) {
    const [rows] = await db.query('SELECT * FROM rw WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findRwById(id) {
    const [rows] = await db.query('SELECT * FROM rw WHERE rw_id = ?', [id]);
    return rows[0] || null;
  }

  static async isRwUsernameTaken(username) {
    const [rows] = await db.query('SELECT id FROM rw WHERE username = ?', [username]);
    return rows.length > 0;
  }

  static async isRwExists(rw_id) {
    const [rows] = await db.query('SELECT id FROM rw WHERE rw_id = ?', [rw_id]);
    return rows.length > 0;
  }

  static async createRw(data) {
    // Ada 10 Kolom -> Harus 10 Tanda Tanya (Tadi saya tulis 11, itu yang bikin error)
    const query = `
      INSERT INTO rw 
      (rw_id, no_rw, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await db.query(query, [
      data.rw_id, data.no_rw, data.nama_ketua,
      data.provinsi, data.kota, data.kecamatan, data.kelurahan_desa,
      data.username, data.password, data.ttd_digital || null
    ]);
  }

  // ─── SUPERADMIN METHODS ──────────────────────────────────────────────────

  static async findSuperadminByUsername(username) {
    const [rows] = await db.query('SELECT * FROM superadmin WHERE username = ?', [username]);
    return rows[0] || null;
  }
}

module.exports = RtRwModel;