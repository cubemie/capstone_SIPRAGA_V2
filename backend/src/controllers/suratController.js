/**
 * SuratController
 *
 * Thin controller — hanya mengekstrak data dari request,
 * meneruskan ke SuratService, dan mengembalikan response HTTP.
 * Error fatal diteruskan ke global errorHandler via next(err).
 */

const SuratService = require('../services/SuratService');

class SuratController {
  /** POST /api/surat/ajukan */
  static async ajukanSurat(req, res, next) {
    try {
      const id_warga = req.user.id_warga;
      const { data, error } = await SuratService.ajukanSurat(id_warga, req.body, req.file);
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/surat/milik-saya */
  static async getMySurat(req, res, next) {
    try {
      const id_warga = req.user.id_warga;
      const { data, error } = await SuratService.getMySurat(id_warga);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/surat/masuk */
  static async getSuratMasuk(req, res, next) {
    try {
      const { data, error } = await SuratService.getSuratMasuk();
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/surat/tanda-tangani/:id */
  static async approveSurat(req, res, next) {
    try {
      const id = req.params.id;
      const { data, error } = await SuratService.approveSurat(id, req.file);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/surat/tolak/:id */
  static async rejectSurat(req, res, next) {
    try {
      const id = req.params.id;
      const { alasan } = req.body;
      const { data, error } = await SuratService.rejectSurat(id, alasan);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/surat/riwayat-rtrw */
  static async getRiwayat(req, res, next) {
    try {
      const { data, error } = await SuratService.getRiwayat();
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/surat/statistik */
  static async getStatistik(req, res, next) {
    try {
      const id_warga = req.user.id_warga;
      const { data, error } = await SuratService.getStatistik(id_warga);
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/surat/menunggu-ttd */
  static async getSuratMenungguTtd(req, res, next) {
    try {
      const { data, error } = await SuratService.getSuratMasuk();
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/surat/offline — RT/RW buat surat untuk warga yang datang langsung */
  static async ajukanSuratOffline(req, res, next) {
    try {
      const { nik_warga, nama_warga, jenis_surat, alasan } = req.body;
      const { data, error } = await SuratService.ajukanSuratOffline({
        nik_warga,
        nama_warga,
        jenis_surat,
        alasan,
      });
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SuratController;
