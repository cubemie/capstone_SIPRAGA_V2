// backend/src/controllers/ProfileController.js
// GANTI SELURUH ISI — versi lengkap dengan semua field

const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const [rows] = await pool.query(
      `SELECT
        id_warga, NIK, nama, email, no_hp,
        tempat_lahir, tanggal_lahir, jenis_kelamin,
        alamat, rt, rw, kelurahan_desa, kecamatan,
        agama, status_perkawinan, pekerjaan,
        kewarganegaraan, negara, provinsi, kota,
        foto_ktp
       FROM warga WHERE id_warga = ?`,
      [id_warga]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil profil', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const {
      nama, email, no_hp, alamat, NIK,
      tempat_lahir, tanggal_lahir, jenis_kelamin,
      kelurahan_desa, kecamatan, agama,
      status_perkawinan, pekerjaan,
    } = req.body;

    if (NIK && !/^\d{16}$/.test(NIK)) {
      return res.status(400).json({ success: false, message: 'NIK harus 16 digit angka' });
    }

    await pool.query(
      `UPDATE warga SET
         nama=?, email=?, no_hp=?, alamat=?, NIK=?,
         tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?,
         kelurahan_desa=?, kecamatan=?, agama=?,
         status_perkawinan=?, pekerjaan=?
       WHERE id_warga=?`,
      [
        nama, email, no_hp, alamat, NIK,
        tempat_lahir, tanggal_lahir, jenis_kelamin,
        kelurahan_desa, kecamatan, agama,
        status_perkawinan, pekerjaan,
        id_warga,
      ]
    );

    return res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal update profil', error: err.message });
  }
};

module.exports = { getProfile, updateProfile };