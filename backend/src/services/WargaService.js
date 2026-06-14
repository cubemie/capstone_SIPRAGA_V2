/**
 * WargaService
 *
 * Mengelola seluruh business logic terkait data profil warga,
 * termasuk kelengkapan data dan tanda tangan digital RT/RW.
 */

const WargaModel = require('../models/WargaModel');
const RtRwModel = require('../models/RtRwModel');

class WargaService {
  /**
   * Ambil profil warga berdasarkan ID.
   * @param {number} id
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async getProfile(id) {
    const warga = await WargaModel.findById(id);
    if (!warga) {
      return { data: null, error: 'Data warga tidak ditemukan.' };
    }
    return { data: warga, error: null };
  }

  /**
   * Hitung persentase kelengkapan data warga.
   * @param {number} id
   * @returns {{ data: { percentage: number }|null, error: string|null }}
   */
  static async getKelengkapan(id) {
    const warga = await WargaModel.findById(id);
    if (!warga) {
      return { data: null, error: 'Data warga tidak ditemukan.' };
    }

    // Hitung persentase field yang sudah terisi (kecuali id_warga)
    const fields = Object.keys(warga).filter((f) => f !== 'id_warga');
    const filled = fields.filter((f) => {
      const val = warga[f];
      return val !== null && val !== undefined && String(val).trim() !== '';
    }).length;

    const percentage = Math.round((filled / fields.length) * 100);
    return { data: { percentage }, error: null };
  }

  /**
   * Update data profil warga (termasuk foto KTP opsional).
   * @param {number} id
   * @param {Object} body - Field yang diupdate
   * @param {Object|null} file - File KTP dari multer (opsional)
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async lengkapiData(id, body, file) {
    const warga = await WargaModel.findById(id);
    if (!warga) {
      return { data: null, error: 'Data warga tidak ditemukan.' };
    }

    const fotoKtpBaru = file ? file.path : null;
    const fotoKtpFinal = fotoKtpBaru || warga.foto_ktp;

    if (!fotoKtpFinal) {
      return { data: null, error: 'Foto KTP wajib diunggah.' };
    }

    await WargaModel.update(id, { ...body, foto_ktp: fotoKtpFinal });
    return { data: { message: 'Data warga berhasil disimpan.' }, error: null };
  }

  // ─── Tanda Tangan Digital RT/RW ──────────────────────────────────────────

  /**
   * Ambil tanda tangan digital milik RT atau RW yang sedang login.
   * @param {{ id: number, role: string }} user - Dari JWT payload
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async getTtd(user) {
    console.log('[WargaService.getTtd] Called with user:', user);
    if (!user || !user.role || !['rt', 'rw'].includes(user.role)) {
      return { data: null, error: 'Role tidak valid.' };
    }

    let record;
    if (user.role === 'rt') {
      console.log('[WargaService.getTtd] Finding RT by id:', user.id);
      record = await RtRwModel.findRtById(user.id);
    } else {
      console.log('[WargaService.getTtd] Finding RW by id:', user.id);
      record = await RtRwModel.findRwById(user.id);
    }

    console.log('[WargaService.getTtd] Found record:', record);

    if (!record) {
      return { data: null, error: 'Akun RT/RW tidak ditemukan.' };
    }

    if (!record.ttd_digital) {
      return {
        data: {
          ttd_url: null,
          has_ttd: false,
        },
        error: null,
      };
    }

    // ttd_digital berisi URL file publik yang disimpan di storage.
    return {
      data: {
        ttd_url: record.ttd_digital,
        has_ttd: true,
      },
      error: null,
    };
  }

  /**
   * Simpan tanda tangan digital baru untuk RT atau RW.
   * @param {{ id: number, role: string }} user - Dari JWT payload
   * @param {Object} file - File dari multer
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async uploadTtd(user, file) {
    console.log('[WargaService.uploadTtd] Called with user:', user, 'file:', file);
    if (!file) {
      return { data: null, error: 'File tanda tangan wajib diunggah.' };
    }
    if (!user || !user.role || !['rt', 'rw'].includes(user.role)) {
      return { data: null, error: 'Role tidak valid.' };
    }

    // file.path berisi URL file publik hasil upload storage.
    const storageUrl = file.path;
    console.log('[WargaService.uploadTtd] Storage URL:', storageUrl);

    const updated = user.role === 'rt'
      ? await RtRwModel.updateTtdRt(user.id, storageUrl)
      : await RtRwModel.updateTtdRw(user.id, storageUrl);

    console.log('[WargaService.uploadTtd] Update result:', updated);

    if (!updated) {
      return { data: null, error: 'Akun RT/RW tidak ditemukan sehingga TTD gagal disimpan.' };
    }

    return {
      data: {
        message: 'Tanda tangan berhasil disimpan.',
        ttd_url: storageUrl,
      },
      error: null,
    };
  }
}

module.exports = WargaService;
