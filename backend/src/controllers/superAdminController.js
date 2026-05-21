const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createRt, createRw } = require('./rtRwController');

/**
 * Login Superadmin — endpoint terpisah dari RT/RW
 * Tabel: superadmin (id, username, password)
 */
exports.loginSuperadmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM superadmin WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Username tidak ditemukan.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Password salah.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: 'superadmin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login superadmin berhasil', token, role: 'superadmin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Diteruskan ke rtRwController
exports.insertRt = createRt;
exports.insertRw = createRw;
