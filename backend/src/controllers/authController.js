const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nik, nama, jenis_kelamin, tanggal_lahir, email, password, confirm_password } = req.body;

  if (!nik || !nama || !jenis_kelamin || !tanggal_lahir || !email || !password || !confirm_password) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM warga WHERE NIK = ? OR email = ?', [nik, email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'NIK atau email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(`
      INSERT INTO warga (NIK, nama, jenis_kelamin, tanggal_lahir, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nik, nama, jenis_kelamin, tanggal_lahir, email, hashedPassword]);

    res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.login = async (req, res) => {
  const { nik, password } = req.body;

  if (!nik || !password) {
    return res.status(400).json({ message: 'NIK dan password wajib diisi.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM warga WHERE NIK = ?', [nik]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'NIK belum terdaftar.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Password salah.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id_warga: user.id_warga,
        nama: user.nama,
        nik: user.NIK
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login berhasil', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.logout = (req, res) => {
  // JWT stateless — logout cukup hapus token di sisi client
  res.json({ message: 'Logout berhasil.' });
};
