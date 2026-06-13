/**
 * ProfileController.js
 * Menangani pengambilan dan pembaruan profil untuk semua role.
 */

const pool = require('../config/db');

const PROFILE_EXTRAS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_role ENUM('warga','rt','rw','superadmin') NOT NULL,
    user_ref VARCHAR(100) NOT NULL,
    nama_lengkap VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    no_hp VARCHAR(20) NULL,
    alamat TEXT NULL,
    tempat_lahir VARCHAR(255) NULL,
    tanggal_lahir DATE NULL,
    jenis_kelamin VARCHAR(30) NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_profiles_role_ref (user_role, user_ref)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

function normalizeRole(role) {
  if (role === 'admin_rt') return 'rt';
  if (role === 'admin_rw') return 'rw';
  return role;
}

function getProfileConfig(user) {
  const role = normalizeRole(user?.role);

  switch (role) {
    case 'warga':
      return { role, tableName: 'warga', idColumn: 'id_warga', userId: user.id_warga };
    case 'rt':
      return { role, tableName: 'rt', idColumn: 'rt_id', userId: user.id };
    case 'rw':
      return { role, tableName: 'rw', idColumn: 'rw_id', userId: user.id };
    case 'superadmin':
      return { role, tableName: 'superadmin', idColumn: 'id', userId: user.id };
    default:
      return null;
  }
}

function pickAllowedFields(source, fieldNames) {
  return fieldNames.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      acc[field] = source[field];
    }
    return acc;
  }, {});
}

async function ensureProfileExtrasTable() {
  await pool.query(PROFILE_EXTRAS_TABLE_SQL);
}

async function getBaseProfile(config) {
  const [rows] = await pool.query(
    `SELECT * FROM ${config.tableName} WHERE ${config.idColumn} = ? LIMIT 1`,
    [config.userId]
  );
  return rows[0] || null;
}

async function getExtraProfile(config) {
  const [rows] = await pool.query(
    'SELECT * FROM user_profiles WHERE user_role = ? AND user_ref = ? LIMIT 1',
    [config.role, String(config.userId)]
  );
  return rows[0] || null;
}

async function upsertExtraProfile(config, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const placeholders = keys.map(() => '?').join(', ');
  const assignments = keys.map((key) => `${key} = VALUES(${key})`).join(', ');

  await pool.query(
    `INSERT INTO user_profiles (user_role, user_ref, ${keys.join(', ')})
     VALUES (?, ?, ${placeholders})
     ON DUPLICATE KEY UPDATE ${assignments}`,
    [config.role, String(config.userId), ...keys.map((key) => fields[key])]
  );
}

function mergeProfile(config, baseProfile, extraProfile) {
  const { password, ...safeBase } = baseProfile;
  const extra = extraProfile || {};

  const merged = {
    ...safeBase,
    role: config.role,
    avatar_url: safeBase.avatar || extra.avatar_url || null,
    email: safeBase.email || extra.email || '',
    no_hp: safeBase.no_hp || extra.no_hp || '',
    alamat: safeBase.alamat || extra.alamat || '',
    tempat_lahir: safeBase.tempat_lahir || extra.tempat_lahir || '',
    tanggal_lahir: safeBase.tanggal_lahir || extra.tanggal_lahir || null,
    jenis_kelamin: safeBase.jenis_kelamin || extra.jenis_kelamin || '',
    nama_lengkap:
      safeBase.nama ||
      safeBase.nama_ketua ||
      extra.nama_lengkap ||
      safeBase.username ||
      '',
  };

  if (config.role === 'superadmin') {
    merged.nama_lengkap = extra.nama_lengkap || safeBase.username;
  }

  return merged;
}

const getProfile = async (req, res) => {
  try {
    const config = getProfileConfig(req.user);
    if (!config || !config.userId) {
      return res.status(403).json({ success: false, message: 'Role atau identitas user tidak valid.' });
    }

    await ensureProfileExtrasTable();

    const [baseProfile, extraProfile] = await Promise.all([
      getBaseProfile(config),
      getExtraProfile(config),
    ]);

    if (!baseProfile) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
    }

    return res.json({
      success: true,
      data: mergeProfile(config, baseProfile, extraProfile),
    });
  } catch (err) {
    console.error('Error getProfile:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil.',
      error: err.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const config = getProfileConfig(req.user);
    if (!config || !config.userId) {
      return res.status(403).json({ success: false, message: 'Role atau identitas user tidak valid.' });
    }

    await ensureProfileExtrasTable();

    const body = req.body || {};
    const avatarUrl = req.file?.path || null;

    let baseUpdates = {};
    let extraUpdates = {};

    if (config.role === 'warga') {
      baseUpdates = pickAllowedFields(body, [
        'nama',
        'email',
        'no_hp',
        'alamat',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'kelurahan_desa',
        'kecamatan',
        'kota',
        'provinsi',
      ]);

      if (avatarUrl) {
        baseUpdates.avatar = avatarUrl;
      }
    } else if (config.role === 'rt' || config.role === 'rw') {
      baseUpdates = pickAllowedFields(body, [
        'nama_ketua',
        'provinsi',
        'kota',
        'kecamatan',
        'kelurahan_desa',
      ]);

      extraUpdates = pickAllowedFields(body, [
        'email',
        'no_hp',
        'alamat',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
      ]);

      if (avatarUrl) {
        extraUpdates.avatar_url = avatarUrl;
      }
    } else if (config.role === 'superadmin') {
      extraUpdates = pickAllowedFields(body, [
        'nama_lengkap',
        'email',
        'no_hp',
        'alamat',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
      ]);

      if (avatarUrl) {
        extraUpdates.avatar_url = avatarUrl;
      }
    }

    if (Object.keys(baseUpdates).length > 0) {
      await pool.query(
        `UPDATE ${config.tableName} SET ? WHERE ${config.idColumn} = ?`,
        [baseUpdates, config.userId]
      );
    }

    if (Object.keys(extraUpdates).length > 0) {
      await upsertExtraProfile(config, extraUpdates);
    }

    const [updatedBase, updatedExtra] = await Promise.all([
      getBaseProfile(config),
      getExtraProfile(config),
    ]);

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: mergeProfile(config, updatedBase, updatedExtra),
    });
  } catch (err) {
    console.error('Error updateProfile:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil.',
      error: err.message,
    });
  }
};

module.exports = { getProfile, updateProfile };
