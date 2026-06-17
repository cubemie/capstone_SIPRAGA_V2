import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import {
  ShieldCheck,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authService } from '../../services/authService';

export default function RegisterSuperadmin() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi client-side
    if (form.username.length < 3) {
      return setError('Username minimal 3 karakter.');
    }
    if (form.password.length < 6) {
      return setError('Password minimal 6 karakter.');
    }
    if (form.password !== form.confirm_password) {
      return setError('Konfirmasi password tidak cocok.');
    }

    setLoading(true);
    const { data, error: err } = await authService.registerSuperadmin(form);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(data?.data?.message || 'Akun berhasil dibuat!');
    setTimeout(() => navigate('/login-rtrw'), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-block hover:opacity-80 transition">
            <Logo className="scale-125" />
          </Link>
        </div>
        <div className="flex justify-center mb-3">
          <div className="bg-blue-900 text-white rounded-full p-3 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Daftar Akun Super Admin
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-ink-secondary)]">
          Buat akun Super Admin untuk mengelola platform RT/RW
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-surface-card)] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-150">

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 text-sm text-red-700 bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success} Mengarahkan ke halaman login...</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-[var(--color-ink)] mb-1">
                Username
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[var(--color-ink-muted)]" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  placeholder="Minimal 3 karakter"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-ink)] mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-ink-muted)]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-ink-muted)] hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-[var(--color-ink)] mb-1">
                Konfirmasi Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-ink-muted)]" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-ink-muted)] hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Indikator kesesuaian password */}
              {form.confirm_password && (
                <p className={`mt-1 text-xs font-medium ${
                  form.password === form.confirm_password ? 'text-[var(--color-status-disetujui-text)]' : 'text-[var(--color-danger)]'
                }`}>
                  {form.password === form.confirm_password ? '✓ Password cocok' : '✗ Password tidak cocok'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memproses...' : 'Buat Akun Super Admin'}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--color-surface-border)] pt-5 text-center">
            <p className="text-sm text-[var(--color-ink-secondary)]">
              Sudah punya akun?{' '}
              <Link
                to="/login-rtrw"
                className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
