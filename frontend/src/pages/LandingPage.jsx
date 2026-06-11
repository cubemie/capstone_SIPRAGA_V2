import { Link } from 'react-router-dom';

const STEPS = [
  { no: '01', icon: '📝', title: 'Daftar & Isi Data', desc: 'Buat akun dengan NIK Anda, lalu lengkapi data kependudukan dan alamat.' },
  { no: '02', icon: '📄', title: 'Pilih & Ajukan Surat', desc: 'Pilih template surat, isi form, atau ajukan permintaan manual ke admin.' },
  { no: '03', icon: '✍️', title: 'Tunggu TTD RT/RW', desc: 'Pengurus RT/RW menandatangani surat secara digital melalui sistem.' },
  { no: '04', icon: '📥', title: 'Unduh Surat', desc: 'Unduh surat yang sudah ditandatangani langsung dari akun Anda.' },
];

const LandingPage = () => (
  <div className="min-h-screen flex flex-col">
    {/* Navbar */}
    <nav className="bg-[#0F2D5C] h-16 flex items-center justify-between px-6 md:px-12">
      <span className="text-white font-bold text-lg tracking-tight">🏛️ SIPRAGA</span>
      <div className="flex items-center gap-3">
        <Link to="/login-warga"
          className="text-white/80 hover:text-white text-sm transition-colors">
          Masuk
        </Link>
        <Link to="/register-warga"
          className="bg-white text-[#0F2D5C] hover:bg-blue-50 text-sm font-medium px-3 py-1.5 rounded transition-colors">
          Daftar
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="bg-[#0F2D5C] relative overflow-hidden flex-shrink-0">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <p className="text-blue-300 text-sm font-medium tracking-widest uppercase mb-4">
          Sistem Informasi Pengantar RT/RW — SIPRAGA
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
          Administrasi Surat RT/RW<br />
          <span className="text-blue-300">Kini Lebih Mudah</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-8">
          Ajukan surat pengantar dari rumah. Tanpa antre, tanpa bolak-balik. Pengurus RT/RW bisa menyetujui secara digital.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login-warga"
            className="px-6 py-3 bg-white text-[#0F2D5C] hover:bg-blue-50 rounded-lg font-semibold text-sm transition-colors shadow-md"
          >
            Masuk sebagai Warga
          </Link>
          <Link
            to="/login-rtrw"
            className="px-6 py-3 border-2 border-white/50 text-white hover:bg-white/10 rounded-lg font-semibold text-sm transition-colors"
          >
            Masuk sebagai RT/RW
          </Link>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Cara Kerja SIPRAGA</h2>
          <p className="text-gray-500 text-sm mt-2">Empat langkah mudah dari pengajuan hingga unduh surat</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.no} className="relative">
              <div className="bg-blue-50 rounded-xl p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                  <span className="text-xs font-bold text-blue-400 tracking-widest">{s.no}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Fitur Unggulan</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: '🔒', title: 'Aman & Terenkripsi', desc: 'Data Anda dilindungi dengan JWT dan enkripsi bcrypt.' },
            { icon: '☁️', title: 'Penyimpanan Cloud', desc: 'Dokumen tersimpan aman di Cloudinary, bisa diakses kapan saja.' },
            { icon: '✍️', title: 'TTD Digital', desc: 'Pengurus RT/RW menandatangani secara digital tanpa tatap muka.' },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <span className="text-3xl block mb-3" aria-hidden="true">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-[#0F2D5C] py-12 px-6 text-center">
      <h2 className="text-xl font-bold text-white mb-3">Siap mengajukan surat?</h2>
      <p className="text-white/60 text-sm mb-6">Daftar gratis sekarang dan nikmati kemudahan administrasi digital.</p>
      <Link
        to="/register-warga"
        className="inline-block px-6 py-3 bg-white text-[#0F2D5C] hover:bg-blue-50 rounded-lg font-semibold text-sm transition-colors"
      >
        Daftar Sekarang — Gratis
      </Link>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 py-5 px-6 text-center">
      <p className="text-xs text-gray-500">
        © 2026 SIPRAGA — Sistem Informasi Pengantar RT/RW
      </p>
    </footer>
  </div>
);

export default LandingPage;
