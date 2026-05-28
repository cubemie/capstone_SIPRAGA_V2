/**
 * WargaController
 *
 * Thin controller — hanya mengekstrak data dari request,
 * meneruskan ke WargaService, dan mengembalikan response HTTP.
 * Error fatal diteruskan ke global errorHandler via next(err).
 */

const WargaService = require('../services/WargaService');

class WargaController {
  /** GET /api/warga/profil */
  static async getProfile(req, res, next) {
    try {
      const id = req.user.id_warga;
      const { data, error } = await WargaService.getProfile(id);
      if (error) return res.status(404).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/warga/kelengkapan-data */
  static async getKelengkapan(req, res, next) {
    try {
      const id = req.user.id_warga;
      const { data, error } = await WargaService.getKelengkapan(id);
      if (error) return res.status(404).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/warga/lengkapi-data */
  static async lengkapiData(req, res, next) {
    try {
      const id = req.user.id_warga;
      const { data, error } = await WargaService.lengkapiData(id, req.body, req.file);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // ─── Tanda Tangan Digital ─────────────────────────────────────────────────

  /** GET /api/ttd/current-ttd */
  static async getTtd(req, res, next) {
    try {
      const { data, error } = await WargaService.getTtd(req.user);
      if (error) return res.status(404).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/ttd/upload-ttd */
  static async uploadTtd(req, res, next) {
    try {
      const { data, error } = await WargaService.uploadTtd(req.user, req.file);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WargaController;
