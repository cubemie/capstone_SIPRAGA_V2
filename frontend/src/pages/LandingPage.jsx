import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Users } from 'lucide-react';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[var(--color-primary)] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo className="text-white [&_svg]:text-white [&_span]:text-white" />
          <nav className="flex space-x-4">
            <Link to="/login-warga" className="bg-[var(--color-accent)] text-[var(--color-primary)] px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-accent-dark)] transition shadow text-sm sm:text-base">
              Login Warga
            </Link>
            <Link to="/login-rtrw" className="bg-[var(--color-primary-light)] text-white border border-white/20 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition shadow text-sm sm:text-base">
              Login RT / RW / Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[#0A1F5C] text-white py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Layanan Surat Pengantar RT/RW Digital
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            Ajukan surat pengantar, pantau status persetujuan, dan tanda tangani dokumen secara digital dengan cepat, transparan, dan aman dalam satu platform terpadu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register-warga" className="w-full sm:w-auto bg-[var(--color-accent)] text-[var(--color-primary)] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-[var(--color-accent-dark)] transition shadow-lg text-center">
              Daftar Akun Warga
            </Link>
            <Link to="/login-warga" className="w-full sm:w-auto bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-white/20 transition shadow-lg text-center">
              Ajukan Surat Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--color-ink)] mb-10 sm:mb-12">
          Fitur Unggulan SIPRAGA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-[var(--color-surface-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-surface-border)] flex flex-col items-center text-center">
            <div className="p-3 bg-[var(--color-brand-100)] text-[var(--color-primary)] rounded-xl mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pengajuan Online</h3>
            <p className="text-[var(--color-ink-secondary)] text-sm">
              Warga dapat mengajukan berbagai jenis surat pengantar kapan saja tanpa harus bertatap muka langsung.
            </p>
          </div>

          <div className="bg-[var(--color-surface-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-surface-border)] flex flex-col items-center text-center">
            <div className="p-3 bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] rounded-xl mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tanda Tangan Digital</h3>
            <p className="text-[var(--color-ink-secondary)] text-sm">
              Ketua RT dan RW dapat menandatangani surat secara digital yang sah dan terenkripsi.
            </p>
          </div>

          <div className="bg-[var(--color-surface-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-surface-border)] flex flex-col items-center text-center">
            <div className="p-3 bg-[var(--color-status-disetujui-bg)] text-[var(--color-status-disetujui-text)] rounded-xl mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pantau Real-Time</h3>
            <p className="text-[var(--color-ink-secondary)] text-sm">
              Pantau status surat pengajuan Anda secara berkala mulai dari verifikasi RT hingga disetujui RW.
            </p>
          </div>

          <div className="bg-[var(--color-surface-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-surface-border)] flex flex-col items-center text-center">
            <div className="p-3 bg-[var(--color-danger-light)] text-[var(--color-danger)] rounded-xl mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Kelola Template</h3>
            <p className="text-[var(--color-ink-secondary)] text-sm">
              Super Admin dapat mengunggah dan mengelola berbagai template surat resmi sesuai kebutuhan desa.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1F5C] text-white/60 py-10 mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© {new Date().getFullYear()} SIPRAGA. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-sm text-white/40">Mewujudkan Administrasi RT dan RW yang Lebih Cepat, Akurat, dan Transparan.</p>
        </div>
      </footer>
    </div>
  );
}
