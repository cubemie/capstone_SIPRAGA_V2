const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginRtRw = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  try {
    // Cek apakah username ada di tabel RT
    const [rtRows] = await db.query('SELECT * FROM rt WHERE username = ?', [username]);
    let user = null;
    let role = null;

    if (rtRows.length > 0) {
      user = rtRows[0];
      role = 'rt';
    } else {
      // Cek di tabel RW
      const [rwRows] = await db.query('SELECT * FROM rw WHERE username = ?', [username]);
      if (rwRows.length > 0) {
        user = rwRows[0];
        role = 'rw';
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Username tidak ditemukan.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Password salah.' });
    }

    // Generate JWT token untuk RT/RW
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role,
        rt: user.rt || null,
        rw: user.rw || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login berhasil', token, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
