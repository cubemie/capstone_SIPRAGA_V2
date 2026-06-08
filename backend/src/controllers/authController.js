/**
 * AuthController
 *
 * Thin controller — hanya mengekstrak data dari request,
 * meneruskan ke AuthService, dan mengembalikan response HTTP.
 * Error fatal diteruskan ke global errorHandler via next(err).
 */

const AuthService = require('../services/AuthService');
const { blacklistToken } = require('../middlewares/authMiddleware');

class AuthController {
  /** POST /api/auth/register */
  static async register(req, res, next) {
    try {
      const { data, error } = await AuthService.registerWarga(req.body);
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/login */
  static async loginWarga(req, res, next) {
    try {
      const { nik, password } = req.body;
      const { data, error } = await AuthService.loginWarga(nik, password);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/login-rtrw */
  static async loginRtRw(req, res, next) {
    try {
      const { username, password } = req.body;
      const { data, error } = await AuthService.loginRtRw(username, password);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/superadmin/login */
  static async loginSuperadmin(req, res, next) {
    try {
      const { username, password } = req.body;
      const { data, error } = await AuthService.loginSuperadmin(username, password);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/logout */
  static logout(req, res) {
    // Blacklist token agar tidak bisa dipakai lagi setelah logout
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) blacklistToken(token);
    res.json({ message: 'Logout berhasil.' });
  }

  /** GET /api/auth/check-session */
  static checkSession(req, res) {
    res.json({ loggedIn: true, user: req.user });
  }

  /** POST /api/superadmin/rt */
  static async insertRt(req, res, next) {
    try {
      const { data, error } = await AuthService.createRt(req.body);
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/superadmin/rw */
  static async insertRw(req, res, next) {
    try {
      const { data, error } = await AuthService.createRw(req.body);
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
