/**
 * TemplateSuratService
 *
 * Mengelola seluruh business logic pengelolaan template surat resmi.
 * Hanya dapat diakses oleh superadmin.
 */

const TemplateSuratModel = require('../models/TemplateSuratModel');

class TemplateSuratService {
  /**
   * Ambil semua template surat yang tersedia.
   * @returns {{ data: Array|null, error: string|null }}
   */
  static async getAll() {
    const rows = await TemplateSuratModel.findAll();
    return { data: rows, error: null };
  }

  /**
   * Upload template surat baru.
   * @param {string} nama - Nama template
   * @param {Object} file - Object dari multer
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async upload(nama, file) {
    if (!nama || !file) {
      return { data: null, error: 'Nama template dan file wajib diisi.' };
    }

    await TemplateSuratModel.create({ nama, file_path: file.filename });

    return { data: { message: 'Template surat berhasil ditambahkan.' }, error: null };
  }

  /**
   * Hapus template surat berdasarkan ID.
   * @param {number|string} id
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async deleteById(id) {
    const existing = await TemplateSuratModel.findById(id);
    if (!existing) {
      return { data: null, error: 'Template tidak ditemukan.' };
    }

    await TemplateSuratModel.deleteById(id);
    return { data: { message: 'Template surat berhasil dihapus.' }, error: null };
  }

  /**
   * Ambil detail template berdasarkan ID (untuk download).
   * @param {number|string} id
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async getById(id) {
    const template = await TemplateSuratModel.findById(id);
    if (!template) {
      return { data: null, error: 'Template tidak ditemukan.' };
    }
    return { data: template, error: null };
  }
}

module.exports = TemplateSuratService;
