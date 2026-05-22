/**
 * AuthService
 *
 * Mengelola seluruh business logic autentikasi:
 * - Registrasi warga
 * - Login warga (JWT)
 * - Login RT/RW (JWT)
 * - Login Superadmin (JWT)
 * - Pembuatan akun RT/RW oleh superadmin
 */

const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const WargaModel = require('../models/WargaModel');
const RtRwModel  = require('../models/RtRwModel');

// ─── Konstanta ────────────────────────────────────────────────────────────────

const NIK_LENGTH      = 16;
const BCRYPT_ROUNDS   = 10;
const JWT_EXPIRES_IN  = '1d';

// ─── Helper validasi ──────────────────────────────────────────────────────────

/**
 * Validasi NIK: harus 16 digit angka.
 * @param {string} nik
 * @returns {string|null} pesan error, atau null jika valid
 */
function validateNik(nik) {
  if (!nik || typeof nik !== 'string') return 'NIK wajib diisi.';
  if (!/^\d+$/.test(nik))             return 'NIK hanya boleh berisi angka.';
  if (nik.length !== NIK_LENGTH)      return `NIK harus ${NIK_LENGTH} digit.`;
  return null;
}

/**
 * Sign JWT dengan payload dan options standar.
 * @param {Object} payload
 * @returns {string} token
 */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ─── Class ────────────────────────────────────────────────────────────────────

class AuthService {
  // ─── Warga ───────────────────────────────────────────────────────────────

  /**
   * Registrasi warga baru.
   * @param {{ nik, nama, email, password, confirm_password, jenis_kelamin, tanggal_lahir }} data
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async registerWarga(data) {
    const { nik, nama, email, password, confirm_password, jenis_kelamin, tanggal_lahir } = data;

    // Validasi field wajib
    if (!nik || !nama || !email || !password || !confirm_password || !jenis_kelamin || !tanggal_lahir) {
      return { data: null, error: 'Semua field wajib diisi.' };
    }

    // Validasi format NIK
    const nikError = validateNik(nik);
    if (nikError) return { data: null, error: nikError };

    // Validasi konfirmasi password
    if (password !== confirm_password) {
      return { data: null, error: 'Konfirmasi password tidak cocok.' };
    }

    // Cek duplikat NIK atau email
    const existing = await WargaModel.findByNikOrEmail(nik, email);
    if (existing) {
      return { data: null, error: 'NIK atau email sudah terdaftar.' };
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await WargaModel.create({ nik, nama, email, password: hashedPassword, jenis_kelamin, tanggal_lahir });

    return { data: { message: 'Registrasi berhasil. Silakan login.' }, error: null };
  }

  /**
   * Login warga dengan NIK dan password.
   * @param {string} nik
   * @param {string} password
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async loginWarga(nik, password) {
    if (!nik || !password) {
      return { data: null, error: 'NIK dan password wajib diisi.' };
    }

    const user = await WargaModel.findByNik(nik);
    if (!user) return { data: null, error: 'NIK belum terdaftar.' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { data: null, error: 'Password salah.' };

    const token = signToken({
      id_warga: user.id_warga,
      nama:     user.nama,
      nik:      user.NIK,
      role:     'warga',
    });

    return { data: { message: 'Login berhasil', token }, error: null };
  }

  // ─── RT / RW ─────────────────────────────────────────────────────────────

  /**
   * Login RT atau RW.
   * Mencari di tabel `rt` terlebih dahulu, lalu `rw`.
   * @param {string} username
   * @param {string} password
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async loginRtRw(username, password) {
    if (!username || !password) {
      return { data: null, error: 'Username dan password wajib diisi.' };
    }

    // Cari di tabel RT, lalu RW
    let user = await RtRwModel.findRtByUsername(username);
    let role = 'rt';

    if (!user) {
      user = await RtRwModel.findRwByUsername(username);
      role = 'rw';
    }

    if (!user) return { data: null, error: 'Username tidak ditemukan.' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { data: null, error: 'Password salah.' };

    const token = signToken({
      id:       user.rt_id || user.rw_id,
      username: user.username,
      nama:     user.nama_ketua,
      role,
    });

    return { data: { message: 'Login berhasil', token, role }, error: null };
  }

  // ─── Superadmin ──────────────────────────────────────────────────────────

  /**
   * Login superadmin.
   * @param {string} username
   * @param {string} password
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async loginSuperadmin(username, password) {
    if (!username || !password) {
      return { data: null, error: 'Username dan password wajib diisi.' };
    }

    const user = await RtRwModel.findSuperadminByUsername(username);
    if (!user) return { data: null, error: 'Username tidak ditemukan.' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { data: null, error: 'Password salah.' };

    const token = signToken({ id: user.id, username: user.username, role: 'superadmin' });

    return { data: { message: 'Login superadmin berhasil', token, role: 'superadmin' }, error: null };
  }

  // ─── Manajemen RT/RW oleh Superadmin ─────────────────────────────────────

  /**
   * Buat akun RT baru.
   * @param {Object} data
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async createRt(data) {
    const { no_rt, rw_id, nama_ketua, username, password } = data;

    if (!no_rt || !rw_id || !nama_ketua || !username || !password) {
      return { data: null, error: 'Field wajib diisi.' };
    }

    const rwExists = await RtRwModel.isRwExists(rw_id);
    if (!rwExists) return { data: null, error: 'rw_id tidak ditemukan.' };

    const usernameTaken = await RtRwModel.isRtUsernameTaken(username);
    if (usernameTaken) return { data: null, error: 'Username RT sudah digunakan.' };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await RtRwModel.createRt({ ...data, password: hashedPassword });

    return { data: { message: 'Data RT berhasil ditambahkan.' }, error: null };
  }

  /**
   * Buat akun RW baru.
   * @param {Object} data
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async createRw(data) {
    const { rw_id, no_rw, nama_ketua, username, password } = data;

    if (!rw_id || !no_rw || !nama_ketua || !username || !password) {
      return { data: null, error: 'Field wajib diisi.' };
    }

    const usernameTaken = await RtRwModel.isRwUsernameTaken(username);
    if (usernameTaken) return { data: null, error: 'Username RW sudah digunakan.' };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await RtRwModel.createRw({ ...data, password: hashedPassword });

    return { data: { message: 'Data RW berhasil ditambahkan.' }, error: null };
  }
}

module.exports = AuthService;
