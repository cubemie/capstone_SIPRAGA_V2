import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services';

const LoginWarga = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nik: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await authService.loginWarga({ nik: form.nik, password: form.password });
      login(res.token);
      navigate('/warga/dashboard');
    } catch (err) {
      setError(err?.message ?? 'NIK atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-neutral-100 rounded-xl shadow-md p-7">
        <div className="text-center mb-6">
          <Landmark className="w-10 h-10 text-white mb-4 opacity-90 mx-auto" />
          <h1 className="text-xl font-bold text-primary-dark mt-2">SIPRAGA</h1>
          <p className="text-sm text-gray-500 mt-0.5">Masuk sebagai Warga</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
            <input id="nik" name="nik" value={form.nik} onChange={handleChange}
              maxLength={16} inputMode="numeric" required placeholder="Masukkan 16 digit NIK"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange} required placeholder="Password Anda"
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary text-xs">
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

        <div className="mt-5 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register-warga" className="text-primary-light hover:underline font-medium">Daftar di sini</Link>
          </p>
          <p className="text-xs text-gray-400">
            Pengurus RT/RW?{' '}
            <Link to="/login-rtrw" className="text-primary-light hover:underline">Login RT/RW</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginWarga;
