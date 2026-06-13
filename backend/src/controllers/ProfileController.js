/**
 * ProfileController.js
 * Menangani pengambilan dan pembaruan profil untuk Warga, RT, dan RW.
 */

const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    // req.user didapat dari token saat login (authMiddleware)
    // Pastikan login-rtrw mengirimkan 'id' dan 'role' di tokennya
    const { id, role, id_warga } = req.user; 
    
    let query = "";
    let userId = id || id_warga; // Mengantisipasi perbedaan nama variabel ID
    let userData = null;

    if (role === 'admin_rt') {
      // Ambil dari tabel RT
      const [rows] = await pool.query('SELECT * FROM rt WHERE rt_id = ?', [userId]);
      userData = rows[0];
    } else if (role === 'admin_rw') {
      // Ambil dari tabel RW
      const [rows] = await pool.query('SELECT * FROM rw WHERE rw_id = ?', [userId]);
      userData = rows[0];
    } else {
      // Default: Ambil dari tabel Warga
      const [rows] = await pool.query('SELECT * FROM warga WHERE id_warga = ?', [userId]);
      userData = rows[0];
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    }

    // Hapus password agar tidak terkirim ke frontend
    const { password, ...safeData } = userData;

    return res.json({ success: true, data: safeData });
  } catch (err) {
    console.error("Error getProfile:", err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil profil', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id, role, id_warga } = req.user;
    const userId = id || id_warga;
    const fields = req.body; // Data yang dikirim dari frontend

    let tableName = "";
    let idColumn = "";

    if (role === 'admin_rt') {
      tableName = "rt";
      idColumn = "rt_id";
    } else if (role === 'admin_rw') {
      tableName = "rw";
      idColumn = "rw_id";
    } else {
      tableName = "warga";
      idColumn = "id_warga";
    }

    // Hanya update kolom yang dikirim dari frontend
    // Contoh: { nama_ketua: "Budi", provinsi: "Jabar" }
    await pool.query(`UPDATE ${tableName} SET ? WHERE ${idColumn} = ?`, [fields, userId]);

    return res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    console.error("Error updateProfile:", err);
    return res.status(500).json({ success: false, message: 'Gagal update profil', error: err.message });
  }
};

module.exports = { getProfile, updateProfile };