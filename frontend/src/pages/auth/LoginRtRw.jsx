import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Award } from 'lucide-react';

export default function LoginRtRw() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rt'); // 'rt', 'rw', 'superadmin'
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'rt' || role === 'rw') {
      navigate('/rtrw/dashboard');
    } else if (role === 'superadmin') {
      navigate('/superadmin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-3xl">📮</Link>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
          Login Staff & Administrasi
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
              onClick={() => setRole('rt')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'rt' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ketua RT
            </button>
            <button
              type="button"
              onClick={() => setRole('rw')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'rw' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ketua RW
            </button>
            <button
              type="button"
              onClick={() => setRole('superadmin')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                role === 'superadmin' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Super Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username / Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Masuk sebagai {role === 'rt' ? 'Ketua RT' : role === 'rw' ? 'Ketua RW' : 'Super Admin'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <Link
              to="/login-warga"
              className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
            >
              Login sebagai Warga
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
