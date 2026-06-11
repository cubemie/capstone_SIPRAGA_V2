import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';

// ─────────────────────────────────────────────
// LoginRTRW — POST /api/auth/login-rtrw
// ─────────────────────────────────────────────
export const LoginRTRW = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await authService.loginRTRW(form);
      login(res.token);
      navigate('/rtrw/dashboard');
    } catch (err) {
      setError(err?.message ?? 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-neutral-100 rounded-xl shadow-md p-7">
        <div className="text-center mb-6">
          <Landmark className="w-12 h-12 text-white mb-4 opacity-80" />
          <h1 className="text-xl font-bold text-primary-dark mt-2">SIPRAGA</h1>
          <p className="text-sm text-gray-500 mt-0.5">Masuk sebagai Pengurus RT/RW</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required
              placeholder="Username RT/RW"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange} required placeholder="Password"
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <div role="alert" className="bg-error/10 border border-error/20 text-error p-3 rounded text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-gray-400">
            Warga?{' '}
            <Link to="/login-warga" className="text-primary-light hover:underline">Login Warga</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LoginSuperadmin — POST /api/superadmin/login
// ─────────────────────────────────────────────
export const LoginSuperadmin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await authService.loginSuperadmin(form);
      login(res.token);
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError(err?.message ?? 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-7">
        <div className="text-center mb-6">
          <Landmark className="w-12 h-12 text-white mb-4 opacity-80" />
          <h1 className="text-xl font-bold text-primary-dark mt-2">SIPRAGA</h1>
          <p className="text-sm text-gray-500 mt-0.5">Panel Superadmin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sa-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input id="sa-username" name="username" value={form.username} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="sa-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="sa-password" name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <div role="alert" className="bg-error/10 border border-error/20 text-error p-3 rounded text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// RegisterWarga — POST /api/auth/register
// ─────────────────────────────────────────────
export const RegisterWarga = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    NIK: '', nama: '', email: '', password: '', konfirmasi: '',
    jenis_kelamin: '', tanggal_lahir: '', tempat_lahir: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.NIK.length !== 16) { setError('NIK harus tepat 16 digit.'); return; }
    if (form.password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (form.password !== form.konfirmasi) { setError('Konfirmasi password tidak cocok.'); return; }

    const { konfirmasi, ...payload } = form;
    try {
      setLoading(true);
      await authService.registerWarga(payload);
      navigate('/login-warga?registered=1');
    } catch (err) {
      setError(err?.message ?? 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-white border border-neutral-100 rounded-xl shadow-md p-7">
        <div className="text-center mb-6">
          <Landmark className="w-12 h-12 text-white mb-4 opacity-80" />
          <h1 className="text-xl font-bold text-primary-dark mt-2">Buat Akun Warga</h1>
          <p className="text-sm text-gray-500 mt-0.5">SIPRAGA — Sistem Administrasi RT/RW</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="NIK" className="block text-sm font-medium text-gray-700 mb-1">NIK <span className="text-error">*</span></label>
              <input id="NIK" name="NIK" value={form.NIK} onChange={handleChange} maxLength={16} inputMode="numeric" required
                placeholder="16 digit Nomor Induk Kependudukan"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-error">*</span></label>
              <input id="nama" name="nama" value={form.nama} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-error">*</span></label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="tempat_lahir" className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input id="tempat_lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="tanggal_lahir" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input id="tanggal_lahir" name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select id="jenis_kelamin" name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih jenis kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-error">*</span></label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange} required placeholder="Min. 8 karakter"
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>
            <div>
              <label htmlFor="konfirmasi" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password <span className="text-error">*</span></label>
              <input id="konfirmasi" name="konfirmasi" type="password" value={form.konfirmasi} onChange={handleChange} required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && <div role="alert" className="bg-error/10 border border-error/20 text-error p-3 rounded text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login-warga" className="text-primary-light hover:underline font-medium">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};
