/**
 * SuratModel
 *
 * Bertanggung jawab atas seluruh akses database untuk tabel `pengajuan_surat`.
 * Tidak mengandung logika bisnis — hanya query SQL.
 */

const db = require('../config/db');

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
              tanggal_ajuan AS created_at, status, alasan_penolakan AS alasan_penolakan
       FROM pengajuan_surat
       WHERE id_warga = ?
       ORDER BY tanggal_ajuan DESC`,
      [id_warga]
    );
    return rows;
  }

  /**
   * Ambil semua surat yang masuk dan menunggu verifikasi (status = 1).
   * @returns {Array}
   */
  static async findMasuk() {
    const [rows] = await db.query(
      `SELECT ps.id, ps.subjek, ps.file_path, ps.tanggal_ajuan AS created_at,
              ps.status, w.nama AS nama_warga, w.NIK AS nik_warga
       FROM pengajuan_surat ps
       JOIN warga w ON ps.id_warga = w.id_warga
       WHERE ps.status = 1
       ORDER BY ps.tanggal_ajuan ASC`
    );
    return rows;
  }

  /**
   * Ambil riwayat surat yang sudah selesai diproses (status 2 = disetujui, 3 = ditolak).
   * @returns {Array}
   */
  static async findRiwayat() {
    const [rows] = await db.query(
      `SELECT ps.id, ps.subjek AS jenis_surat, ps.tanggal_ajuan AS created_at,
              ps.status, w.nama AS nama_warga
       FROM pengajuan_surat ps
       JOIN warga w ON ps.id_warga = w.id_warga
       WHERE ps.status IN (2, 3)
       ORDER BY ps.tanggal_ajuan DESC`
    );
    return rows;
  }

  /**
   * Setujui surat (update file signed + ubah status ke 2).
   * @param {number} id
   * @param {string} file_path_signed
   */
  static async approve(id, file_path_signed) {
    await db.query(
      'UPDATE pengajuan_surat SET file_path_signed = ?, status = 2 WHERE id = ?',
      [file_path_signed, id]
    );
  }

  /**
   * Tolak surat (ubah status ke 3 + simpan alasan).
   * @param {number} id
   * @param {string} alasan
   */
  static async reject(id, alasan) {
    await db.query(
      'UPDATE pengajuan_surat SET status = 3, alasan_penolakan = ? WHERE id = ?',
      [alasan, id]
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
         SUM(status = 1) AS menunggu,
         SUM(status = 2) AS disetujui,
         SUM(status = 3) AS ditolak
       FROM pengajuan_surat
       WHERE id_warga = ?`,
      [id_warga]
    );
    return rows[0];
  }
}

module.exports = SuratModel;
