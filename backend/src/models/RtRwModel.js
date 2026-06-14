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
    console.log('[RtRwModel.findRtById] Called with id:', id);
    const [rows] = await db.query('SELECT * FROM rt WHERE rt_id = ?', [id]);
    console.log('[RtRwModel.findRtById] Result:', rows);
    return rows[0] || null;
  }

  static async isRtUsernameTaken(username) {
    const [rows] = await db.query('SELECT rt_id FROM rt WHERE username = ?', [username]);
    return rows.length > 0;
  }

  static async createRt(data) {
    const query = `
      INSERT INTO rt 
      (no_rt, rw_id, nama_ketua, provinsi, kota, kecamatan, kelurahan_desa, username, password, ttd_digital)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return await db.query(query, [
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

  static async updateTtdRt(id, ttdUrl) {
    console.log('[RtRwModel.updateTtdRt] Called with id:', id, 'ttdUrl:', ttdUrl);
    const [result] = await db.query(
      'UPDATE rt SET ttd_digital = ? WHERE rt_id = ?',
      [ttdUrl, id]
    );
    console.log('[RtRwModel.updateTtdRt] Result:', result);
    return result.affectedRows > 0;
  }

  // ─── RW METHODS ──────────────────────────────────────────────────────────

  static async findRwByUsername(username) {
    const [rows] = await db.query('SELECT * FROM rw WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findRwById(id) {
    console.log('[RtRwModel.findRwById] Called with id:', id);
    const [rows] = await db.query('SELECT * FROM rw WHERE rw_id = ?', [id]);
    console.log('[RtRwModel.findRwById] Result:', rows);
    return rows[0] || null;
  }

  static async isRwUsernameTaken(username) {
    const [rows] = await db.query('SELECT rw_id FROM rw WHERE username = ?', [username]);
    return rows.length > 0;
  }

  static async isRwExists(rw_id) {
    const [rows] = await db.query('SELECT rw_id FROM rw WHERE rw_id = ?', [rw_id]);
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

  static async updateTtdRw(id, ttdUrl) {
    console.log('[RtRwModel.updateTtdRw] Called with id:', id, 'ttdUrl:', ttdUrl);
    const [result] = await db.query(
      'UPDATE rw SET ttd_digital = ? WHERE rw_id = ?',
      [ttdUrl, id]
    );
    console.log('[RtRwModel.updateTtdRw] Result:', result);
    return result.affectedRows > 0;
  }

  // ─── SUPERADMIN METHODS ──────────────────────────────────────────────────

  static async isSuperadminUsernameTaken(username) {
    const [rows] = await db.query('SELECT id FROM superadmin WHERE username = ?', [username]);
    return rows.length > 0;
  }

  static async createSuperadmin(data) {
    return db.query(
      'INSERT INTO superadmin (username, password) VALUES (?, ?)',
      [data.username, data.password]
    );
  }

  static async findSuperadminByUsername(username) {
    const [rows] = await db.query('SELECT * FROM superadmin WHERE username = ?', [username]);
    return rows[0] || null;
  }
}

module.exports = RtRwModel;
