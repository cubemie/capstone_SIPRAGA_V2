/**
 * TemplateSuratController
 *
 * Thin controller — hanya mengekstrak data dari request,
 * meneruskan ke TemplateSuratService, dan mengembalikan response HTTP.
 * Error fatal diteruskan ke global errorHandler via next(err).
 */

const path                 = require('path');
const fs                   = require('fs');
const TemplateSuratService = require('../services/TemplateSuratService');

class TemplateSuratController {
  /** GET /api/template-surat */
  static async getAll(req, res, next) {
    try {
      const { data, error } = await TemplateSuratService.getAll();
      if (error) return res.status(400).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/template-surat */
  static async upload(req, res, next) {
    try {
      const nama = req.body.nama || req.body.nama_template;
      const { data, error } = await TemplateSuratService.upload(nama, req.file);
      if (error) return res.status(400).json({ message: error });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/template-surat/:id */
  static async deleteById(req, res, next) {
    try {
      const { data, error } = await TemplateSuratService.deleteById(req.params.id);
      if (error) return res.status(404).json({ message: error });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/template-surat/:id/download */
  static async download(req, res, next) {
    try {
      const { data, error } = await TemplateSuratService.getById(req.params.id);
      if (error) return res.status(404).json({ message: error });

      const filePath = path.join(
        __dirname, '..', '..', 'uploads', 'template_surat', data.file_path
      );

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: 'File tidak ditemukan di server.' });
        res.download(filePath, data.file_path);
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TemplateSuratController;
