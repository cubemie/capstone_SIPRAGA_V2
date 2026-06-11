import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { CreditCard, Lock, UserCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function LoginWarga() {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: err } = await authService.loginWarga({ nik, password });

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
    navigate('/warga/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <Logo className="scale-125" />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
          Login Akun Warga
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Atau{' '}
          <Link to="/register-warga" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150">
            buat akun warga baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-150">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="nik" className="block text-sm font-semibold text-slate-700">
                NIK (Nomor Induk Kependudukan)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="nik"
                  name="nik"
                  type="text"
                  maxLength={16}
                  autoComplete="off"
                  required
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="16 digit NIK"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Memproses...' : 'Masuk ke Dashboard Warga'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <Link
              to="/login-rtrw"
              className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
            >
              <UserCheck className="w-5 h-5 mr-2 text-slate-500" />
              Login sebagai RT / RW / Super Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
