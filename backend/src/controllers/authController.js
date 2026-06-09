/**
 * AuthController
 *
 * Thin controller — hanya mengekstrak data dari request,
 * meneruskan ke AuthService, dan mengembalikan response HTTP.
 * Error fatal diteruskan ke global errorHandler via next(err).
 */

const AuthService = require('../services/AuthService');
const { blacklistToken } = require('../middlewares/authMiddleware');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  /** POST /api/auth/register */
  static async register(req, res, next) {
    try {
      const { data, error } = await AuthService.registerWarga(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Registrasi warga berhasil', 201);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/register-rw */
  static async registerRw(req, res, next) {
    try {
      const { data, error } = await AuthService.registerRw(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Registrasi RW berhasil', 201);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/register-rt */
  static async registerRt(req, res, next) {
    try {
      const { data, error } = await AuthService.registerRt(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Registrasi RT berhasil', 201);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/login */
  static async loginWarga(req, res, next) {
    try {
      const { nik, password } = req.body;
      const { data, error } = await AuthService.loginWarga(nik, password);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Login warga berhasil');
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/auth/login-rtrw */
  static async loginRtRw(req, res, next) {
    try {
      const { username, password } = req.body;
      const { data, error } = await AuthService.loginRtRw(username, password);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Login pengurus berhasil');
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/superadmin/login */
  static async loginSuperadmin(req, res, next) {
    try {
      const { username, password } = req.body;
      const { data, error } = await AuthService.loginSuperadmin(username, password);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Login superadmin berhasil');
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/superadmin/register */
  static async registerSuperadmin(req, res, next) {
    try {
      const { data, error } = await AuthService.registerSuperadmin(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'Registrasi superadmin berhasil', 201);
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
    sendSuccess(res, null, 'Logout berhasil.');
  }

  /** GET /api/auth/check-session */
  static checkSession(req, res) {
    sendSuccess(res, { loggedIn: true, user: req.user }, 'Sesi aktif');
  }

  /** POST /api/superadmin/rt */
  static async insertRt(req, res, next) {
    try {
      const { data, error } = await AuthService.createRt(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'RT berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/superadmin/rw */
  static async insertRw(req, res, next) {
    try {
      const { data, error } = await AuthService.createRw(req.body);
      if (error) return sendError(res, error, 400);
      sendSuccess(res, data, 'RW berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
