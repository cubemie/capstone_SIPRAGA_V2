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
   */
  static async registerWarga(data) {
    const { nik, nama, email, password, confirm_password, jenis_kelamin, tanggal_lahir, tempat_lahir, alamat, rt, rw, kelurahan_desa, kecamatan, provinsi, kota } = data;

    // Validasi field wajib
    if (!nik || !nama || !email || !password || !confirm_password || !jenis_kelamin || !tanggal_lahir) {
      return { data: null, error: 'Semua field wajib diisi.' };
    }

    if (password !== confirm_password) {
      return { data: null, error: 'Konfirmasi password tidak cocok.' };
    }

    const nikError = validateNik(nik);
    if (nikError) return { data: null, error: nikError };

    // Cek duplikasi NIK atau email
    const existingUser = await WargaModel.findByNikOrEmail(nik, email);
    if (existingUser) {
      return { data: null, error: 'NIK atau Email sudah terdaftar.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Simpan ke database
    await WargaModel.create({
      nik, nama, email, password: hashedPassword, jenis_kelamin, tanggal_lahir,
      tempat_lahir: tempat_lahir || '',
      alamat: alamat || '',
      rt: rt || '',
      rw: rw || '',
      kelurahan_desa: kelurahan_desa || '',
      kecamatan: kecamatan || '',
      provinsi: provinsi || '',
      kota: kota || '',
    });

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
      rw_id:    user.rw_id,
      no_rt:    user.no_rt || null,
      no_rw:    user.no_rw || null,
      username: user.username,
      nama:     user.nama_ketua,
      role,
    });

    return { data: { message: 'Login berhasil', token, role }, error: null };
  }

  // ─── Superadmin ──────────────────────────────────────────────────────────

  /**
   * Registrasi akun superadmin baru.
   * @param {{ username, password, confirm_password }} data
   * @returns {{ data: Object|null, error: string|null }}
   */
  static async registerSuperadmin({ username, password, confirm_password }) {
    if (!username || !password || !confirm_password) {
      return { data: null, error: 'Semua field wajib diisi.' };
    }
    if (username.length < 3) {
      return { data: null, error: 'Username minimal 3 karakter.' };
    }
    if (password.length < 6) {
      return { data: null, error: 'Password minimal 6 karakter.' };
    }
    if (password !== confirm_password) {
      return { data: null, error: 'Konfirmasi password tidak cocok.' };
    }

    const taken = await RtRwModel.isSuperadminUsernameTaken(username);
    if (taken) return { data: null, error: 'Username sudah digunakan.' };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await RtRwModel.createSuperadmin({ username, password: hashedPassword });

    return { data: { message: 'Akun superadmin berhasil dibuat. Silakan login.' }, error: null };
  }

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

  // ─── Registrasi mandiri RT / RW ───────────────────────────────────────────

  /**
   * Registrasi mandiri akun RW baru.
   * RW bisa daftar sendiri tanpa perlu superadmin.
   */
  static async registerRw(data) {
    const { rw_id, no_rw, nama_ketua, username, password, confirm_password,
            provinsi, kota, kecamatan, kelurahan_desa } = data;

    if (!rw_id || !no_rw || !nama_ketua || !username || !password || !confirm_password) {
      return { data: null, error: 'Semua field wajib diisi.' };
    }
    if (password !== confirm_password) {
      return { data: null, error: 'Konfirmasi password tidak cocok.' };
    }
    if (password.length < 6) {
      return { data: null, error: 'Password minimal 6 karakter.' };
    }

    const usernameTaken = await RtRwModel.isRwUsernameTaken(username);
    if (usernameTaken) return { data: null, error: 'Username sudah digunakan.' };

    const rwExists = await RtRwModel.isRwExists(rw_id);
    if (rwExists) return { data: null, error: 'ID RW sudah terdaftar.' };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await RtRwModel.createRw({
      rw_id, no_rw, nama_ketua, username, password: hashedPassword,
      provinsi: provinsi || '', kota: kota || '',
      kecamatan: kecamatan || '', kelurahan_desa: kelurahan_desa || '',
    });

    return { data: { message: 'Akun RW berhasil didaftarkan. Silakan login.' }, error: null };
  }

  /**
   * Registrasi mandiri akun RT baru.
   * RT perlu memasukkan rw_id yang sudah ada (RW mereka).
   */
  static async registerRt(data) {
    const { no_rt, rw_id, nama_ketua, username, password, confirm_password,
            provinsi, kota, kecamatan, kelurahan_desa } = data;

    if (!no_rt || !rw_id || !nama_ketua || !username || !password || !confirm_password) {
      return { data: null, error: 'Semua field wajib diisi.' };
    }
    if (password !== confirm_password) {
      return { data: null, error: 'Konfirmasi password tidak cocok.' };
    }
    if (password.length < 6) {
      return { data: null, error: 'Password minimal 6 karakter.' };
    }

    const rwExists = await RtRwModel.isRwExists(rw_id);
    if (!rwExists) return { data: null, error: 'ID RW tidak ditemukan. Pastikan RW Anda sudah terdaftar terlebih dahulu.' };

    const usernameTaken = await RtRwModel.isRtUsernameTaken(username);
    if (usernameTaken) return { data: null, error: 'Username sudah digunakan.' };

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await RtRwModel.createRt({
      no_rt, rw_id, nama_ketua, username, password: hashedPassword,
      provinsi: provinsi || '', kota: kota || '',
      kecamatan: kecamatan || '', kelurahan_desa: kelurahan_desa || '',
    });

    return { data: { message: 'Akun RT berhasil didaftarkan. Silakan login.' }, error: null };
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
