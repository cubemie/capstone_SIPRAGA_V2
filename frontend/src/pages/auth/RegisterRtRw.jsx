import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import {
  ShieldCheck, User, Lock, Building2, MapPin,
  Hash, Loader2, AlertCircle, CheckCircle, ChevronRight, ChevronLeft,
  Eye, EyeOff, Info
} from 'lucide-react';
import { authService } from "../../services";

const STEP_ROLE   = 0;
const STEP_FORM   = 1;
const STEP_SUCCESS = 2;

export default function RegisterRtRw() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_ROLE);
  const [role, setRole] = useState('rw'); // 'rw' | 'rt'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    // RW fields
    rw_id: '', no_rw: '',
    // RT fields
    no_rt: '',
    // Shared
    nama_ketua: '', username: '', password: '', confirm_password: '',
    provinsi: '', kota: '', kecamatan: '', kelurahan_desa: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const service = role === 'rw'
      ? authService.registerRw(form)
      : authService.registerRt(form);

    const { data, error: err } = await service;
    setLoading(false);

    if (err) { setError(err); return; }
    setStep(STEP_SUCCESS);
  };

  // ─── Step 0: Pilih Role ────────────────────────────────────────────────────
  if (step === STEP_ROLE) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Link to="/" className="inline-block hover:opacity-80 transition">
              <Logo className="scale-125" />
            </Link>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Daftar Akun Pengurus</h2>
          <p className="mt-2 text-sm text-slate-600">Pilih jabatan Anda sebagai pengurus wilayah</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-150 space-y-4">
            {/* Pilihan RW */}
            <button
              onClick={() => { setRole('rw'); setStep(STEP_FORM); }}
              className="w-full flex items-center justify-between p-5 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Ketua RW</p>
                  <p className="text-xs text-slate-500 mt-0.5">Daftar sebagai Ketua Rukun Warga</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition" />
            </button>

            {/* Pilihan RT */}
            <button
              onClick={() => { setRole('rt'); setStep(STEP_FORM); }}
              className="w-full flex items-center justify-between p-5 border-2 border-slate-200 rounded-2xl hover:border-slate-700 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Ketua RT</p>
                  <p className="text-xs text-slate-500 mt-0.5">Daftar sebagai Ketua Rukun Tetangga</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition" />
            </button>

            {/* Info alur pendaftaran */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-bold">Urutan Pendaftaran:</p>
                <p>1. <span className="font-semibold">Ketua RW</span> mendaftar terlebih dahulu dan mendapatkan <span className="font-semibold">ID RW</span>.</p>
                <p>2. <span className="font-semibold">Ketua RT</span> mendaftar menggunakan ID RW dari Ketua RW-nya.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <Link to="/login-rtrw" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition">
                Sudah punya akun? Login di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Sukses ────────────────────────────────────────────────────────
  if (step === STEP_SUCCESS) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-12 px-8 shadow sm:rounded-2xl border border-slate-150 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Pendaftaran Berhasil!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Akun {role === 'rw' ? 'Ketua RW' : 'Ketua RT'} <span className="font-semibold text-slate-700">{form.username}</span> berhasil didaftarkan.
              </p>
            </div>
            <button
              onClick={() => navigate('/login-rtrw')}
              className="w-full py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition shadow"
            >
              Lanjut ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 1: Form ──────────────────────────────────────────────────────────
  const isRw = role === 'rw';
  const accent = isRw ? 'blue' : 'slate';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <Logo className="scale-110" />
          </Link>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Daftar Akun {isRw ? 'Ketua RW' : 'Ketua RT'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Lengkapi data di bawah untuk membuat akun pengurus wilayah</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow sm:rounded-2xl border border-slate-150">
          {/* Back button */}
          <button
            onClick={() => { setStep(STEP_ROLE); setError(''); }}
            className="flex items-center text-sm text-slate-400 hover:text-slate-700 mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Ganti jabatan
          </button>

          {error && (
            <div className="mb-5 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Banner khusus form RT */}
          {!isRw && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">⚠️ Syarat Pendaftaran Ketua RT</p>
                <p>Ketua RW di wilayah Anda harus sudah mendaftar terlebih dahulu. Minta <span className="font-semibold">ID RW</span> kepada Ketua RW Anda, lalu masukkan di kolom "ID RW Induk" di bawah.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ─── Identitas Wilayah ─────────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identitas Wilayah</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isRw ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">ID RW (unik)</label>
                      <div className="mt-1 relative">
                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input required value={form.rw_id} onChange={set('rw_id')}
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Contoh: RW005-SMG" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Kode unik pengenal RW Anda</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Nomor RW</label>
                      <div className="mt-1 relative">
                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input required value={form.no_rw} onChange={set('no_rw')}
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Contoh: 005" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Nomor RT</label>
                      <div className="mt-1 relative">
                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input required value={form.no_rt} onChange={set('no_rt')}
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Contoh: 003" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">ID RW Induk</label>
                      <div className="mt-1 relative">
                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input required value={form.rw_id} onChange={set('rw_id')}
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="ID RW yang sudah terdaftar" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Minta ID RW ke Ketua RW Anda</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ─── Lokasi ────────────────────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lokasi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: 'provinsi', label: 'Provinsi', placeholder: 'Jawa Tengah' },
                  { field: 'kota', label: 'Kota / Kabupaten', placeholder: 'Semarang' },
                  { field: 'kecamatan', label: 'Kecamatan', placeholder: 'Banyumanik' },
                  { field: 'kelurahan_desa', label: 'Kelurahan / Desa', placeholder: 'Srondol Wetan' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-slate-700">{label}</label>
                    <div className="mt-1 relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input value={form[field]} onChange={set(field)}
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder={placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Akun ──────────────────────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Data Akun</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Nama Ketua</label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input required value={form.nama_ketua} onChange={set('nama_ketua')}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Nama lengkap sesuai KTP" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Username</label>
                  <div className="mt-1 relative">
                    <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input required value={form.username} onChange={set('username')}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Username untuk login" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Password</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                        className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Min. 6 karakter" />
                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Konfirmasi Password</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input required type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')}
                        className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ulangi password" />
                      <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Mendaftarkan...' : `Daftarkan Akun ${isRw ? 'RW' : 'RT'}`}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login-rtrw" className="font-medium text-blue-600 hover:text-blue-500 transition">
              Login di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
