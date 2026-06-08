/**
 * SuratService
 *
 * Mengelola seluruh business logic pengajuan surat pengantar:
 * - Pengajuan surat oleh warga
 * - Pengambilan surat (milik warga, masuk, riwayat)
 * - Persetujuan dan penolakan surat oleh RT/RW
 * - Statistik surat
 */

const SuratModel = require('../models/SuratModel');

class SuratService {
  /**
   * Ajukan surat baru oleh warga.
   * @param {number} id_warga
   * @param {{ subjek, provinsi, kota, kecamatan, kelurahan, rt, rw }} body
   * @param {Object} file — object dari multer
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async ajukanSurat(id_warga, body, file) {
    if (!file) {
      return { data: null, error: 'File wajib diunggah (PDF/DOCX).' };
    }

    const { subjek, provinsi, kota, kecamatan, kelurahan, rt, rw } = body;

    await SuratModel.create({
      id_warga,
      subjek,
      file_path: file.path, // URL Cloudinary penuh
      provinsi,
      kota,
      kecamatan,
      kelurahan,
      rt,
      rw,
    });

    return { data: { message: 'Surat berhasil diajukan.' }, error: null };
  }

  /**
   * Ambil semua surat milik warga yang sedang login.
   * @param {number} id_warga
   * @returns {{ data: Array|null, error: string|null }}
   */
  static async getMySurat(id_warga) {
    const rows = await SuratModel.findByWargaId(id_warga);
    return { data: rows, error: null };
  }

  /**
   * Ambil semua surat yang masuk dan menunggu verifikasi.
   * @returns {{ data: Array|null, error: string|null }}
   */
  static async getSuratMasuk() {
    const rows = await SuratModel.findMasuk();
    return { data: rows, error: null };
  }

  /**
   * Setujui surat berdasarkan ID (dengan upload file signed).
   * @param {number} id
   * @param {Object} file — object dari multer (opsional)
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async approveSurat(id, file) {
    const filePath = file ? file.path : null; // URL Cloudinary penuh
    await SuratModel.approve(id, filePath);
    return { data: { message: 'Surat berhasil disetujui.' }, error: null };
  }

  /**
   * Tolak surat berdasarkan ID.
   * @param {number} id
   * @param {string} alasan
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async rejectSurat(id, alasan) {
    if (!alasan) {
      return { data: null, error: 'Alasan penolakan harus diisi.' };
    }
    await SuratModel.reject(id, alasan);
    return { data: { message: 'Surat berhasil ditolak.' }, error: null };
  }

  /**
   * Ambil riwayat surat yang sudah diproses.
   * @returns {{ data: Array|null, error: string|null }}
   */
  static async getRiwayat() {
    const rows = await SuratModel.findRiwayat();
    return { data: rows, error: null };
  }

  /**
   * Ambil statistik surat per warga.
   * @param {number} id_warga
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async getStatistik(id_warga) {
    const stats = await SuratModel.getStatistik(id_warga);
    return {
      data: {
        diajukan: stats.total,
        menunggu: stats.menunggu,
        disetujui: stats.disetujui,
        ditolak: stats.ditolak,
      },
      error: null,
    };
  }

  /**
   * Buat surat offline oleh RT/RW untuk warga yang datang langsung.
   * @param {{ nik_warga: string, nama_warga: string, jenis_surat: string, alasan: string }} data
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async ajukanSuratOffline({ nik_warga, nama_warga, jenis_surat, alasan }) {
    if (!nik_warga || !nama_warga || !jenis_surat) {
      return { data: null, error: 'NIK warga, nama warga, dan jenis surat wajib diisi.' };
    }

    const WargaModel = require('../models/WargaModel');
    const warga = await WargaModel.findByNik(nik_warga);
    if (!warga) {
      return { data: null, error: `Warga dengan NIK ${nik_warga} tidak ditemukan.` };
    }

    await SuratModel.create({
      id_warga: warga.id_warga,
      subjek: jenis_surat,
      file_path: null,
      provinsi: warga.provinsi || '',
      kota: warga.kota || '',
      kecamatan: warga.kecamatan || '',
      kelurahan: warga.kelurahan_desa || '',
      rt: warga.rt || '000',
      rw: warga.rw || '000',
    });

    return { data: { message: 'Surat offline berhasil dibuat.' }, error: null };
  }
}

module.exports = SuratService;
