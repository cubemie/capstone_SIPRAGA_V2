import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { Lock, ShieldAlert, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function LoginRtRw() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rt'); // 'rt', 'rw', 'superadmin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pilih service method berdasarkan role yang dipilih
    const serviceCall =
      role === 'superadmin'
        ? authService.loginSuperadmin({ username, password })
        : authService.loginRtRw({ username, password });

    const { data, error: err } = await serviceCall;

    setLoading(false);

    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    const token = data?.data?.token;
    if (!token) {
      setError('Login gagal: token tidak ditemukan.');
      return;
    }

    login(token);

    // Navigasi berdasarkan role yang dikembalikan server
    const userRole = data?.data?.role;
    if (userRole === 'superadmin') {
      navigate('/superadmin/dashboard');
    } else {
      navigate('/rtrw/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <Logo className="scale-125" />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
          Login Staff &amp; Administrasi
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Khusus untuk Ketua RT, RW, dan Super Admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-150">
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('rt'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'rt' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ketua RT
            </button>
            <button
              type="button"
              onClick={() => { setRole('rw'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'rw' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ketua RW
            </button>
            <button
              type="button"
              onClick={() => { setRole('superadmin'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'superadmin' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Super Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldAlert className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Username resmi"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? 'Memproses...'
                  : `Masuk sebagai ${role === 'rt' ? 'Ketua RT' : role === 'rw' ? 'Ketua RW' : 'Super Admin'}`}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 space-y-3">
            <Link
              to="/login-warga"
              className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
            >
              Login sebagai Warga
            </Link>
            {role === 'superadmin' ? (
              <p className="text-center text-sm text-slate-500">
                Belum punya akun Super Admin?{' '}
                <Link to="/register-superadmin" className="font-semibold text-blue-600 hover:text-blue-500 transition">
                  Daftar di sini
                </Link>
              </p>
            ) : (
              <p className="text-center text-sm text-slate-500">
                Belum punya akun pengurus?{' '}
                <Link to="/register-rtrw" className="font-semibold text-blue-600 hover:text-blue-500 transition">
                  Daftar di sini
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
