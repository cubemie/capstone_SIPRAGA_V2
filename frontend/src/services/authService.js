/**
 * authService
 *
 * Mengelola semua operasi autentikasi:
 * - Warga: login + register
 * - RT/RW: login via endpoint khusus
 * - Superadmin: login via endpoint superadmin
 */

import { api } from '../utils/api';

export const authService = {
  /**
   * Login warga menggunakan NIK dan password.
   * @param {{ nik: string, password: string }} credentials
   */
  loginWarga: ({ nik, password }) =>
    api.post('/auth/login', { nik, password }),

  /**
   * Login RT atau RW menggunakan username dan password.
   * @param {{ username: string, password: string }} credentials
   */
  loginRtRw: ({ username, password }) =>
    api.post('/auth/login-rtrw', { username, password }),

  /**
   * Login Superadmin menggunakan username dan password.
   * @param {{ username: string, password: string }} credentials
   */
  loginSuperadmin: ({ username, password }) =>
    api.post('/superadmin/login', { username, password }),

  /**
   * Registrasi mandiri Ketua RW baru.
   */
  registerRw: (data) =>
    api.post('/auth/register-rw', data),

  /**
   * Registrasi mandiri Ketua RT baru.
   */
  registerRt: (data) =>
    api.post('/auth/register-rt', data),

  /**
   * Registrasi akun warga baru.
   * @param {{ nik, nama, email, password, confirm_password, jenis_kelamin, tanggal_lahir }} data
   */
  registerWarga: (data) =>
    api.post('/auth/register', data),
};
