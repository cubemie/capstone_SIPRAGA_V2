import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📮</span>
            <span className="text-xl font-bold tracking-wide">RT-RW CORETAX</span>
          </div>
          <nav className="flex space-x-4">
            <Link to="/login-warga" className="bg-white text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition shadow">
              Login Warga
            </Link>
            <Link to="/login-rtrw" className="bg-blue-700 text-white border border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition shadow">
              Login RT / RW / Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Layanan Surat Pengantar RT/RW Digital
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Ajukan surat pengantar, pantau status persetujuan, dan tanda tangani dokumen secara digital dengan cepat, transparan, dan aman dalam satu platform terpadu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register-warga" className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-400 transition shadow-lg text-center">
              Daftar Akun Warga
            </Link>
            <Link to="/login-warga" className="w-full sm:w-auto bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-white/20 transition shadow-lg text-center">
              Ajukan Surat Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-950 mb-12">
          Fitur Unggulan RT-RW CORETAX
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 text-blue-900 rounded-xl mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pengajuan Online</h3>
            <p className="text-slate-500 text-sm">
              Warga dapat mengajukan berbagai jenis surat pengantar kapan saja tanpa harus bertatap muka langsung.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-xl mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tanda Tangan Digital</h3>
            <p className="text-slate-500 text-sm">
              Ketua RT dan RW dapat menandatangani surat secara digital yang sah dan terenkripsi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pantau Real-Time</h3>
            <p className="text-slate-500 text-sm">
              Pantau status surat pengajuan Anda secara berkala mulai dari verifikasi RT hingga disetujui RW.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-3 bg-indigo-100 text-indigo-900 rounded-xl mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Kelola Template</h3>
            <p className="text-slate-500 text-sm">
              Super Admin dapat mengunggah dan mengelola berbagai template surat resmi sesuai kebutuhan desa.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© {new Date().getFullYear()} RT-RW CORETAX. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-sm text-slate-500">Mewujudkan Administrasi RT dan RW yang Lebih Cepat, Akurat, dan Transparan.</p>
        </div>
      </footer>
    </div>
  );
}
