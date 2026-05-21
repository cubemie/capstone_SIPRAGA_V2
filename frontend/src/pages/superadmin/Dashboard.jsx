import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Map, Settings, LogOut, Bell, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-900">
          <span className="text-2xl">📮</span>
          <span className="text-lg font-bold tracking-wide">RT-RW CORETAX</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/superadmin/dashboard" className="flex items-center space-x-3 px-4 py-2.5 bg-slate-900 rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/superadmin/template" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-900 rounded-xl font-medium transition">
            <FileText className="w-5 h-5" />
            <span>Kelola Template</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-900">
          <Link to="/" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-red-800 hover:text-white rounded-xl font-medium transition text-slate-400">
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-slate-500 font-medium text-sm">Panel Kontrol,</span>
            <h2 className="text-lg font-bold text-slate-800">Super Administrator</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold">
              SA
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Admin Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Pusat Pengelolaan Template Surat & Pengguna</h3>
              <p className="text-slate-400 text-sm max-w-xl">
                Kelola berkas acuan (template) surat keterangan pengantar desa dan atur kewenangan pengguna Ketua RT/RW di seluruh wilayah kelurahan.
              </p>
            </div>
            <Link to="/superadmin/template" className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition shadow self-start md:self-auto">
              Kelola Template
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Warga</span>
                <p className="text-xl font-bold text-slate-800">2,482</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total RT / RW</span>
                <p className="text-xl font-bold text-slate-800">12 RT / 4 RW</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Template Surat</span>
                <p className="text-xl font-bold text-slate-800">6 Aktif</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Sistem Error</span>
                <p className="text-xl font-bold text-slate-800">0</p>
              </div>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold text-slate-800 mb-4">Pengaturan Cepat</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
                <h5 className="font-bold text-sm text-slate-900 mb-1">Manajemen Akun RT/RW</h5>
                <p className="text-slate-500 text-xs">Tambah, hapus, atau atur sandi kredensial akun Ketua RT dan Ketua RW.</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
                <h5 className="font-bold text-sm text-slate-900 mb-1">Konfigurasi Instansi</h5>
                <p className="text-slate-500 text-xs">Atur nama desa, kecamatan, kabupaten, serta logo resmi kop surat.</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
                <h5 className="font-bold text-sm text-slate-900 mb-1">Log Sistem</h5>
                <p className="text-slate-500 text-xs">Pantau seluruh audit trail tindakan dan log aktivitas server.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
