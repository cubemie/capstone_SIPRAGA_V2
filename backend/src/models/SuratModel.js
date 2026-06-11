/**
 * SuratModel
 *
 * Bertanggung jawab atas seluruh akses database untuk tabel `pengajuan_surat`.
 * Tidak mengandung logika bisnis — hanya query SQL.
 */

const db          = require('../config/db');
const SURAT_STATUS = require('../constants/suratStatus');

/** Padding angka RT/RW ke 3 digit: "1" → "001" */
function padRtRw(val) {
  return String(val).replace(/\D/g, '').padStart(3, '0');
}

class SuratModel {
  /**
   * Buat pengajuan surat baru.
   */
  static async create({ id_warga, subjek, file_path, provinsi, kota, kecamatan, kelurahan, rt, rw }) {
    await db.query(
      `INSERT INTO pengajuan_surat
       (id_warga, subjek, file_path, provinsi, kota, kecamatan, kelurahan, rt, rw)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_warga, subjek, file_path, provinsi, kota, kecamatan, kelurahan, padRtRw(rt), padRtRw(rw)]
    );
  }

  /**
   * Ambil semua surat milik warga tertentu.
   * @param {number} id_warga
   * @returns {Array}
   */
  static async findByWargaId(id_warga) {
    const [rows] = await db.query(
      `SELECT id, subjek, file_path, file_path_signed,
              tanggal_ajuan AS created_at, status, alasan_penolakan
       FROM pengajuan_surat
       WHERE id_warga = ?
       ORDER BY tanggal_ajuan DESC`,
      [id_warga]
    );
    return rows;
  }

  /**
   * Ambil semua surat yang masuk dan menunggu verifikasi.
   * @param {number|string} id
   * @param {string} role
   * @returns {Array}
   */
  static async findMasuk(id, role) {
    let query = `SELECT ps.id, ps.subjek, ps.file_path, ps.tanggal_ajuan AS created_at,
              ps.status, w.nama AS nama_warga, w.NIK AS nik_warga
       FROM pengajuan_surat ps
       JOIN warga w ON ps.id_warga = w.id_warga
       WHERE ps.status = ?`;
    const params = [SURAT_STATUS.MENUNGGU];

    if (role === 'rt') {
      const [rtRows] = await db.query('SELECT no_rt, rw.no_rw FROM rt JOIN rw ON rt.rw_id = rw.rw_id WHERE rt_id = ?', [id]);
      if (rtRows.length > 0) {
        query += ` AND ps.rt = ? AND ps.rw = ?`;
        params.push(padRtRw(rtRows[0].no_rt), padRtRw(rtRows[0].no_rw));
      } else {
        query += ` AND 1=0`;
      }
    } else if (role === 'rw') {
      const [rwRows] = await db.query('SELECT no_rw FROM rw WHERE rw_id = ?', [id]);
      if (rwRows.length > 0) {
        query += ` AND ps.rw = ?`;
        params.push(padRtRw(rwRows[0].no_rw));
      } else {
        query += ` AND 1=0`;
      }
    }

    query += ` ORDER BY ps.tanggal_ajuan ASC`;
    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Ambil riwayat surat yang sudah selesai diproses.
   * @returns {Array}
   */
  static async findRiwayat() {
    const [rows] = await db.query(
      `SELECT ps.id, ps.subjek AS jenis_surat, ps.tanggal_ajuan AS created_at,
              ps.status, w.nama AS nama_warga
       FROM pengajuan_surat ps
       JOIN warga w ON ps.id_warga = w.id_warga
       WHERE ps.status IN (?, ?)
       ORDER BY ps.tanggal_ajuan DESC`,
      [SURAT_STATUS.DISETUJUI, SURAT_STATUS.DITOLAK]
    );
    return rows;
  }

  /**
   * Setujui surat (update file signed + ubah status ke DISETUJUI).
   * @param {number} id
   * @param {string|null} file_path_signed
   */
  static async approve(id, file_path_signed) {
    await db.query(
      'UPDATE pengajuan_surat SET file_path_signed = ?, status = ? WHERE id = ?',
      [file_path_signed, SURAT_STATUS.DISETUJUI, id]
    );
  }

  /**
   * Tolak surat (ubah status ke DITOLAK + simpan alasan).
   * @param {number} id
   * @param {string} alasan
   */
  static async reject(id, alasan) {
    await db.query(
      'UPDATE pengajuan_surat SET status = ?, alasan_penolakan = ? WHERE id = ?',
      [SURAT_STATUS.DITOLAK, alasan, id]
    );
  }

  /**
   * Hitung statistik surat per warga.
   * @param {number} id_warga
   * @returns {{ total, menunggu, disetujui, ditolak }}
   */
  static async getStatistik(id_warga) {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = ?) AS menunggu,
         SUM(status = ?) AS disetujui,
         SUM(status = ?) AS ditolak
       FROM pengajuan_surat
       WHERE id_warga = ?`,
      [SURAT_STATUS.MENUNGGU, SURAT_STATUS.DISETUJUI, SURAT_STATUS.DITOLAK, id_warga]
    );
    return rows[0];
  }

  /**
   * Ambil semua surat dari semua warga (superadmin global view).
   * @returns {Array}
   */
  static async findAll() {
    const [rows] = await db.query(
      `SELECT ps.id, ps.subjek, ps.tanggal_ajuan, ps.status,
              ps.rt, ps.rw, ps.file_path, ps.file_path_signed,
              ps.alasan_penolakan,
              w.nama AS nama_warga, w.NIK AS nik_warga
       FROM pengajuan_surat ps
       JOIN warga w ON ps.id_warga = w.id_warga
       ORDER BY ps.tanggal_ajuan DESC`
    );
    return rows;
  }
}

module.exports = SuratModel;
