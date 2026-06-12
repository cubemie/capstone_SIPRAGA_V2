const pool = require('../config/db.js');
const { successResponse, errorResponse } = require('../utils/response.js');

const getProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const [rows] = await pool.query(
      `SELECT id_warga, NIK, nama, email, no_hp, tempat_lahir, tanggal_lahir,
              jenis_kelamin, alamat, rt, rw, kelurahan_desa, kecamatan,
              agama, status_perkawinan, pekerjaan, kewarganegaraan, foto_ktp
       FROM warga WHERE id_warga = ?`,
      [id_warga]
    );
    if (!rows.length) return errorResponse(res, 404, 'Profil tidak ditemukan');
    return successResponse(res, 200, 'Profil berhasil diambil', rows[0]);
  } catch (err) {
    return errorResponse(res, 500, 'Gagal mengambil profil', err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const { nama, email, no_hp, alamat, NIK } = req.body;

    // Validasi NIK 16 digit
    if (NIK && !/^\d{16}$/.test(NIK)) {
      return errorResponse(res, 400, 'NIK harus 16 digit angka');
    }

    await pool.query(
      `UPDATE warga SET nama=?, email=?, no_hp=?, alamat=?, NIK=?
       WHERE id_warga=?`,
      [nama, email, no_hp, alamat, NIK, id_warga]
    );

    return successResponse(res, 200, 'Profil berhasil diperbarui');
  } catch (err) {
    return errorResponse(res, 500, 'Gagal memperbarui profil', err.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
