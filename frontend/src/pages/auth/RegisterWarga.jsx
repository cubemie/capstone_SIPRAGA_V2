import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { User, Mail, Lock, CreditCard, MapPin, Calendar, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

export default function RegisterWarga() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    password: '',
    confirm_password: '',
    tempatLahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const { data, error: err } = await authService.registerWarga({
      nik: formData.nik,
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      jenis_kelamin: formData.jenis_kelamin,
      tanggal_lahir: formData.tanggal_lahir,
    });
    setLoading(false);

    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
    setTimeout(() => navigate('/login-warga'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <Logo className="scale-125" />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
          Daftar Akun Warga Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login-warga" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-150">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIK */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">NIK (Nomor Induk Kependudukan)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="nik"
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="16 Digit Nomor NIK"
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="nama"
                    type="text"
                    required
                    value={formData.nama}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="Sesuai KTP"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="warga@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Kata Sandi</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Konfirmasi Kata Sandi</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Tempat Lahir</label>
                <input
                  name="tempatLahir"
                  type="text"
                  required
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Kota / Kabupaten"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Tanggal Lahir</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="tanggal_lahir"
                    type="date"
                    required
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Jenis Kelamin</label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* RT / RW */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">No. RT</label>
                  <input
                    name="rt"
                    type="text"
                    required
                    value={formData.rt}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">No. RW</label>
                  <input
                    name="rw"
                    type="text"
                    required
                    value={formData.rw}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="002"
                  />
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Alamat Lengkap (Sesuai KTP)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  name="alamat"
                  required
                  rows={3}
                  value={formData.alamat}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Jl. Raya No. XX..."
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Mendaftar...' : 'Daftar Akun'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
