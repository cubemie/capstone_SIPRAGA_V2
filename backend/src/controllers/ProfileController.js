const WargaModel = require('../models/WargaModel');
const RtRwModel = require('../models/RtRwModel');
const { sendSuccess, sendError } = require('../utils/response');

class ProfileController {
  /**
   * GET /api/profile
   * Ambil profil berdasarkan token JWT (req.user).
   */
  static async getProfile(req, res, next) {
    try {
      const { id, role } = req.user; // Diset oleh middleware verifyToken

      let userProfile = null;

      if (role === 'warga') {
        userProfile = await WargaModel.findById(id);
      } else if (role === 'rt') {
        userProfile = await RtRwModel.findRtById(id);
      } else if (role === 'rw') {
        userProfile = await RtRwModel.findRwById(id);
      } else if (role === 'superadmin') {
        userProfile = await RtRwModel.findSuperadminByUsername(req.user.username);
      }

      if (!userProfile) {
        return sendError(res, 404, 'Profil tidak ditemukan');
      }

      // Hapus field sensitif
      delete userProfile.password;

      sendSuccess(res, userProfile, 'Profil berhasil diambil');
    } catch (error) {
      console.error('Error getProfile:', error);
      next(error);
    }
  }

  /**
   * PUT /api/profile
   * Update profil berdasarkan role (mendukung upload avatar_url jika ada middleware multer).
   */
  static async updateProfile(req, res, next) {
    try {
      const { id, role } = req.user;
      
      // Data yang mau diupdate
      const updateData = { ...req.body };
      
      // Jika ada file avatar diupload
      if (req.file) {
        // Asumsi disimpan di folder uploads/avatar/ 
        // dan bisa diakses via /uploads/...
        updateData.avatar_url = `/uploads/${req.file.filename}`;
      }

      if (role === 'warga') {
        // Ambil data lama agar tidak null
        const oldData = await WargaModel.findById(id);
        if (!oldData) return sendError(res, 404, 'Profil warga tidak ditemukan');
        
        await WargaModel.update(id, {
          ...oldData,
          ...updateData
        });
      } else if (role === 'rt') {
        const oldData = await RtRwModel.findRtById(id);
        if (!oldData) return sendError(res, 404, 'Profil RT tidak ditemukan');
        
        await RtRwModel.updateRt(id, {
          ...oldData,
          ...updateData
        });
      } else if (role === 'rw') {
        const oldData = await RtRwModel.findRwById(id);
        if (!oldData) return sendError(res, 404, 'Profil RW tidak ditemukan');
        
        await RtRwModel.updateRw(id, {
          ...oldData,
          ...updateData
        });
      } else {
        return sendError(res, 403, 'Role ini tidak diizinkan mengubah profil di endpoint ini');
      }

      sendSuccess(res, null, 'Profil berhasil diperbarui');
    } catch (error) {
      console.error('Error updateProfile:', error);
      next(error);
    }
  }
}

module.exports = ProfileController;
