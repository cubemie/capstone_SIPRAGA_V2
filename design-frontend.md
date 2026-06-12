# SIPRAGA V2 — Design System Frontend
> Panduan visual konsisten untuk semua halaman — warga, RT/RW, superadmin  
> Terakhir diperbarui: Juni 2026

---

## Filosofi Desain

SIPRAGA adalah sistem administrasi RT/RW — bukan aplikasi bank, bukan SaaS startup. Penggunanya adalah warga biasa yang mengurus surat domisili, SKCK, atau nikah. RT/RW menggunakannya sambil pegang stempel. Suasananya harus terasa **resmi tapi tidak dingin, digital tapi tidak asing**.

Satu prinsip utama: **kepercayaan dulu, kemewahan belakangan.** Setiap elemen ada karena fungsinya, bukan karena terlihat keren. Warna biru pemerintahan dipertahankan sebagai anchor, tapi dihangatkan dengan nuansa teal dan putih bersih.

---

## Token Desain

### Warna

```css
/* tailwind.config.js — extend colors */
colors: {
  brand: {
    50:  '#f0f7ff',
    100: '#e0efff',
    200: '#baddff',
    300: '#7dc3ff',
    400: '#38a4ff',
    500: '#0e84f5',   /* Primary — biru pemerintahan */
    600: '#0065cc',
    700: '#004fa3',
    800: '#003d80',
    900: '#002d5c',
  },
  surface: {
    DEFAULT: '#f8fafc',   /* Background halaman */
    card:    '#ffffff',   /* Card/panel */
    muted:   '#f1f5f9',   /* Input, disabled area */
    border:  '#e2e8f0',   /* Divider, border */
  },
  ink: {
    DEFAULT: '#0f172a',   /* Teks utama */
    secondary: '#475569', /* Label, caption */
    muted:     '#94a3b8', /* Placeholder, timestamp */
    inverse:   '#ffffff', /* Teks di atas bg gelap */
  },
  status: {
    /* V2 letter statuses */
    draft:     { bg: '#f1f5f9', text: '#475569' },
    submitted: { bg: '#fefce8', text: '#854d0e' },
    review_rt: { bg: '#eff6ff', text: '#1d4ed8' },
    approved:  { bg: '#f0fdf4', text: '#15803d' },
    review_rw: { bg: '#eef2ff', text: '#4338ca' },
    revision:  { bg: '#fff7ed', text: '#c2410c' },
    rejected:  { bg: '#fef2f2', text: '#b91c1c' },
    completed: { bg: '#f0fdf4', text: '#166534' },
    cancelled: { bg: '#f8fafc', text: '#64748b' },
  },
}
```

### Tipografi

Font yang dipakai adalah **Inter** (Google Fonts) — bersih, terbaca di semua ukuran layar, dan sudah familiar dengan nuansa semi-formal Indonesia.

```html
<!-- Di index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* tailwind.config.js */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'], /* untuk nomor surat */
}
```

**Skala tipe:**

| Token | Class Tailwind | Penggunaan |
|---|---|---|
| Display | `text-2xl font-bold` | Judul halaman utama |
| Heading | `text-lg font-semibold` | Judul card/section |
| Body | `text-sm` | Konten umum |
| Caption | `text-xs text-ink-muted` | Timestamp, label input |
| Code | `text-xs font-mono` | Nomor surat, UUID |

---

### Spacing & Radius

```
Padding halaman  : p-4 (mobile) → p-6 (desktop)
Gap antar card   : gap-3 (daftar) → gap-4 (grid)
Border radius    : rounded-xl (card) | rounded-lg (input, button) | rounded-full (badge)
Max width konten : max-w-3xl mx-auto (halaman warga) | max-w-7xl (dashboard admin)
```

### Elevasi / Bayangan

```
Card default     : shadow-sm border border-surface-border
Card hover       : shadow-md (transition-shadow duration-200)
Modal/Drawer     : shadow-xl
Tidak dipakai    : shadow-lg, shadow-2xl (terlalu dramatis untuk konteks ini)
```

---

## Komponen Dasar

### Button

Semua tombol punya 3 varian: `primary`, `secondary`, `ghost`.

```jsx
// components/ui/Button.jsx

const VARIANTS = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary: 'bg-surface-muted text-ink border border-surface-border hover:bg-surface-border',
  ghost:     'text-brand-500 hover:bg-brand-50',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  success:   'bg-green-600 text-white hover:bg-green-700',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
      `}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
```

---

### Badge Status

Dipakai di seluruh aplikasi untuk status surat V2.

```jsx
// components/ui/StatusBadge.jsx
import { LETTER_STATUS_V2 } from '../../constants/suratStatus';

export default function StatusBadge({ status }) {
  const info = LETTER_STATUS_V2[status] ?? {
    label: status,
    color: 'bg-surface-muted text-ink-secondary',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
```

---

### Card

```jsx
// components/ui/Card.jsx
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

---

### Input

```jsx
// components/ui/Input.jsx
export default function Input({ label, error, helpText, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-ink-secondary">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          placeholder:text-ink-muted
          transition-shadow duration-150
          ${error ? 'border-red-400 bg-red-50' : 'border-surface-border'}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helpText && !error && <p className="text-xs text-ink-muted">{helpText}</p>}
    </div>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-ink-secondary">{label}</label>
      )}
      <textarea
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white resize-none
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          placeholder:text-ink-muted
          ${error ? 'border-red-400 bg-red-50' : 'border-surface-border'}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

---

### Tab

Dipakai di LetterListPage, LetterInboxPage, TtdSurat, TemplateSurat.

```jsx
// components/ui/Tabs.jsx
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-surface-border mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors duration-150
            ${
              active === tab.key
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              active === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-surface-muted text-ink-muted'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

---

### Empty State

```jsx
// components/ui/EmptyState.jsx
export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="text-xs text-ink-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

### Skeleton Loader

```jsx
// components/ui/Skeleton.jsx
export function CardSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-surface-muted rounded w-3/4" />
      <div className="h-3 bg-surface-muted rounded w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## Layout

### DashboardLayout

```jsx
// components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const NAV_WARGA = [
  { to: '/warga/dashboard', icon: '🏠', label: 'Beranda' },
  { to: '/letters', icon: '📄', label: 'Surat Saya' },
  { to: '/letters/new', icon: '✏️', label: 'Ajukan Surat' },
  { to: '/warga/profile', icon: '👤', label: 'Profil' },
];

const NAV_RTRW = [
  { to: '/rtrw/dashboard', icon: '🏠', label: 'Beranda' },
  { to: '/letters/inbox', icon: '📥', label: 'Surat Masuk' },
  { to: '/rtrw/riwayat', icon: '📋', label: 'Riwayat' },
  { to: '/rtrw/ttd', icon: '✍️', label: 'Tanda Tangan' },
];

const NAV_SUPERADMIN = [
  { to: '/superadmin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/superadmin/template-surat', icon: '📑', label: 'Template Surat' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    user?.role === 'warga'
      ? NAV_WARGA
      : user?.role === 'superadmin'
      ? NAV_SUPERADMIN
      : NAV_RTRW;

  const roleLabel = {
    warga: 'Warga',
    rt: 'Ketua RT',
    rw: 'Ketua RW',
    superadmin: 'Superadmin',
  }[user?.role] ?? user?.role;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-surface-card border-r border-surface-border fixed h-full z-20">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-tight">SIPRAGA</p>
              <p className="text-[10px] text-ink-muted leading-tight">Sistem Persuratan RT/RW</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-secondary hover:bg-surface-muted hover:text-ink'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-3 border-t border-surface-border">
          <p className="text-xs font-medium text-ink truncate">{user?.nama}</p>
          <p className="text-[10px] text-ink-muted">{roleLabel}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-56 min-h-screen flex flex-col">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-card border-b border-surface-border sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-bold text-ink">SIPRAGA</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-ink-secondary"
          >
            ☰
          </button>
        </header>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-surface-card border-b border-surface-border px-3 py-2 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:bg-surface-muted"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-red-500"
            >
              Keluar
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

### PageHeader

Dipakai di semua halaman untuk konsistensi judul.

```jsx
// components/layout/PageHeader.jsx
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {back && (
          <Link
            to={back}
            className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1 mb-1.5"
          >
            ← Kembali
          </Link>
        )}
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
```

---

## Halaman per Halaman

---

### LandingPage

**Vibe:** Resmi, bisa dipercaya, tapi tidak menakutkan.

```jsx
// pages/LandingPage.jsx
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '📄', title: 'Ajukan Surat Online', desc: 'Kirim permohonan surat tanpa harus datang ke RT/RW.' },
  { icon: '✅', title: 'Pantau Status Real-time', desc: 'Tahu kapan surat disetujui atau perlu revisi.' },
  { icon: '🔒', title: 'Tanda Tangan Digital', desc: 'Ketua RT/RW tanda tangan langsung dari sistem.' },
  { icon: '🔍', title: 'QR Code Terverifikasi', desc: 'Setiap surat bisa diverifikasi keasliannya via QR.' },
];

const LETTER_TYPES = [
  'Surat Domisili', 'Surat Tidak Mampu', 'Pengantar KTP',
  'Pengantar KK', 'Pengantar Nikah', 'Surat Usaha',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Navbar */}
      <nav className="bg-surface-card border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-bold text-ink">SIPRAGA</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-ink-secondary hover:text-ink px-3 py-1.5">
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 font-medium"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        {/* Eyebrow */}
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Sistem Informasi Persuratan Digital
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-ink leading-tight max-w-2xl mx-auto">
          Urus surat RT/RW dari mana saja, tanpa antri
        </h1>
        <p className="mt-4 text-ink-secondary text-base max-w-xl mx-auto leading-relaxed">
          Ajukan surat keterangan domisili, SKCK, nikah, dan lainnya langsung dari ponsel.
          Ketua RT memproses, kamu dapat notifikasi, surat siap diunduh.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-brand-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-600 text-sm"
          >
            Mulai Sekarang
          </Link>
          <Link
            to="/login-rtrw"
            className="text-sm text-ink-secondary hover:text-ink border border-surface-border px-6 py-2.5 rounded-lg"
          >
            Masuk sebagai RT/RW →
          </Link>
        </div>
      </section>

      {/* Jenis Surat */}
      <section className="bg-surface-card border-y border-surface-border py-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="text-xs font-medium text-ink-muted text-center mb-5 tracking-wider uppercase">
            Jenis surat yang tersedia
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {LETTER_TYPES.map((type) => (
              <span
                key={type}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-muted text-ink-secondary border border-surface-border"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        <h2 className="text-xl font-bold text-ink text-center mb-10">Kenapa pakai SIPRAGA?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-4 bg-surface-card border border-surface-border rounded-xl"
            >
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{f.title}</p>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-6 text-center">
        <p className="text-xs text-ink-muted">
          SIPRAGA V2 — Sistem Informasi Persuratan RT/RW
        </p>
      </footer>
    </div>
  );
}
```

---

### Halaman Auth (Login & Register)

Semua halaman auth pakai layout dua kolom: kiri dekoratif, kanan form. Di mobile, hanya tampil form.

```jsx
// Layout reusable untuk semua halaman auth
// components/layout/AuthLayout.jsx

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Panel kiri — dekoratif, hidden di mobile */}
      <div className="hidden md:flex w-96 bg-brand-600 flex-col justify-between p-10 flex-shrink-0">
        <div>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-8">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <h2 className="text-white text-2xl font-bold leading-snug max-w-xs">
            Pelayanan surat RT/RW yang lebih mudah
          </h2>
          <p className="text-brand-200 text-sm mt-3 leading-relaxed">
            Ajukan, pantau, dan unduh surat keterangan tanpa perlu datang langsung ke kantor RT.
          </p>
        </div>
        <p className="text-brand-300 text-xs">SIPRAGA V2 © 2026</p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-sm">
          {/* Logo mobile only */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-bold text-ink">SIPRAGA</span>
          </div>

          <h1 className="text-xl font-bold text-ink mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-ink-secondary mb-6">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}
```

**Contoh pemakaian di LoginWarga.jsx:**

```jsx
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export default function LoginWarga() {
  // ... logic useForm, useMutation

  return (
    <AuthLayout title="Selamat datang" subtitle="Masuk ke akun warga kamu">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="nama@email.com" {...register('email')} error={errors.email?.message} />
        <Input label="Kata Sandi" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />

        <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
          Masuk
        </Button>
      </form>

      <p className="text-center text-xs text-ink-muted mt-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-brand-500 font-medium hover:underline">
          Daftar di sini
        </Link>
      </p>
      <p className="text-center text-xs text-ink-muted mt-2">
        Ketua RT/RW?{' '}
        <Link to="/login-rtrw" className="text-brand-500 font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>
    </AuthLayout>
  );
}
```

---

### Dashboard Warga

```jsx
// pages/warga/Dashboard.jsx — struktur & class yang dipakai

// Stat card
<div className="grid grid-cols-2 gap-3 mb-6">
  <div className="bg-surface-card border border-surface-border rounded-xl p-4">
    <p className="text-2xl font-bold text-ink">{totalSurat}</p>
    <p className="text-xs text-ink-muted mt-0.5">Total Surat</p>
  </div>
  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
    <p className="text-2xl font-bold text-brand-600">{sedangProses}</p>
    <p className="text-xs text-brand-400 mt-0.5">Sedang Diproses</p>
  </div>
</div>

// Quick action
<div className="grid grid-cols-2 gap-3 mb-6">
  <Link to="/letters/new" className="bg-brand-500 text-white rounded-xl p-4 flex flex-col gap-2 hover:bg-brand-600 transition-colors">
    <span className="text-2xl">✏️</span>
    <p className="text-sm font-medium">Ajukan Surat Baru</p>
  </Link>
  <Link to="/letters" className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
    <span className="text-2xl">📄</span>
    <p className="text-sm font-medium text-ink">Lihat Surat Saya</p>
  </Link>
</div>

// Surat terbaru (3 item)
<div>
  <p className="text-xs font-medium text-ink-secondary mb-3 uppercase tracking-wider">Surat Terbaru</p>
  <div className="space-y-2">
    {/* ... LetterCard per item */}
  </div>
</div>
```

---

### Dashboard RT/RW

```jsx
// pages/rtrw/Dashboard.jsx — struktur

// Header dengan nama + wilayah
<div className="bg-brand-600 rounded-xl p-5 text-white mb-6">
  <p className="text-xs text-brand-200 mb-1">Selamat datang,</p>
  <p className="text-lg font-bold">{user?.nama}</p>
  <p className="text-brand-200 text-sm mt-0.5">RT {user?.no_rt} / RW {user?.rw_id}</p>
</div>

// Stats row
<div className="grid grid-cols-3 gap-3 mb-6">
  {[
    { label: 'Menunggu', value: stats?.menunggu ?? 0, color: 'text-yellow-600' },
    { label: 'Diproses', value: stats?.diproses ?? 0, color: 'text-blue-600' },
    { label: 'Selesai', value: stats?.selesai ?? 0, color: 'text-green-600' },
  ].map(({ label, value, color }) => (
    <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </div>
  ))}
</div>

// CTA utama — inbox
<Link to="/letters/inbox" className="block bg-brand-500 text-white rounded-xl p-4 mb-3 hover:bg-brand-600 transition-colors">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-semibold">📥 Surat Masuk</p>
      <p className="text-brand-100 text-xs mt-0.5">Ada {stats?.menunggu} surat perlu diproses</p>
    </div>
    <span className="text-brand-200 text-xl">→</span>
  </div>
</Link>
```

---

### Letter Wizard (Step 1–8)

Wizard pakai layout khusus dengan progress bar di atas.

```jsx
// features/letters/pages/LetterWizardPage.jsx — wrapper layout wizard

const STEP_LABELS = [
  'Jenis', 'Data', 'Konten', 'Lampiran',
  'Alur', 'Preview', 'Konfirmasi', 'Selesai',
];

// Progress bar
<div className="bg-surface-card border-b border-surface-border px-4 py-3 sticky top-0 z-10">
  <div className="max-w-2xl mx-auto">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-medium text-ink-secondary">
        Langkah {currentStep} dari {STEP_LABELS.length}
      </p>
      <p className="text-xs text-ink-muted">{STEP_LABELS[currentStep - 1]}</p>
    </div>
    <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-500 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / STEP_LABELS.length) * 100}%` }}
      />
    </div>
  </div>
</div>

// Konten step
<div className="max-w-2xl mx-auto px-4 py-6">
  {/* Step content di sini */}
</div>

// Nav bawah (Prev / Next)
<div className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-border px-4 py-3 md:ml-56">
  <div className="max-w-2xl mx-auto flex gap-3">
    {currentStep > 1 && (
      <Button variant="secondary" onClick={prevStep} className="flex-1">
        ← Kembali
      </Button>
    )}
    <Button variant="primary" onClick={nextStep} className="flex-1">
      {currentStep === 7 ? 'Kirim Surat' : 'Lanjut →'}
    </Button>
  </div>
</div>
```

**Step 1 — Pilih Jenis Surat:**

```jsx
// Grid card jenis surat
<div className="grid grid-cols-2 gap-3">
  {letterTypes.map((type) => (
    <button
      key={type.id}
      onClick={() => selectType(type)}
      className={`
        p-4 border rounded-xl text-left transition-all duration-150
        ${selectedType?.id === type.id
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
          : 'border-surface-border bg-surface-card hover:shadow-sm'
        }
      `}
    >
      <span className="text-2xl block mb-2">{type.icon ?? '📄'}</span>
      <p className="text-sm font-medium text-ink leading-tight">{type.name}</p>
      {type.required_docs?.length > 0 && (
        <p className="text-[10px] text-ink-muted mt-1">
          Butuh: {type.required_docs.join(', ')}
        </p>
      )}
    </button>
  ))}
</div>
```

**Step 5 — Pilih Workflow:**

```jsx
// Card pilihan workflow
<div className="space-y-3">
  {workflows.map((wf) => (
    <button
      key={wf.id}
      onClick={() => selectWorkflow(wf)}
      className={`
        w-full p-4 border rounded-xl text-left transition-all duration-150
        ${selectedWorkflow?.id === wf.id
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
          : 'border-surface-border bg-surface-card hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{wf.name}</p>
          <p className="text-xs text-ink-secondary mt-0.5">{wf.description}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          wf.code === 'RT_ONLY'
            ? 'bg-green-50 text-green-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {wf.code === 'RT_ONLY' ? '1 langkah' : '2 langkah'}
        </span>
      </div>

      {/* Visualisasi alur */}
      <div className="flex items-center gap-1 mt-3">
        {JSON.parse(wf.steps ?? '[]').map((step, i, arr) => (
          <div key={i} className="flex items-center gap-1">
            <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
              {step.label}
            </span>
            {i < arr.length - 1 && (
              <span className="text-ink-muted text-xs">→</span>
            )}
          </div>
        ))}
        <span className="text-ink-muted text-xs mx-1">→</span>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selesai</span>
      </div>
    </button>
  ))}
</div>
```

---

### QrVerifyPage

Halaman ini publik — tidak butuh login. Desainnya berdiri sendiri, bukan pakai DashboardLayout.

```jsx
// Sudah ada di fitur.md — tambahan class notes:
// - Halaman full-height dengan centering
// - Card max-w-md dengan rounded-2xl shadow-lg
// - Header card: bg-brand-600 dengan ikon besar
// - Status valid: border-l-4 border-green-500 di dalam card
// - Status invalid: border-l-4 border-red-500
// Warna background halaman: bg-surface (abu sangat terang)
```

---

## Panduan Penggunaan Warna Status

Selalu gunakan konstanta dari `suratStatus.js`, jangan hardcode warna di komponen.

```jsx
// ✅ Benar
import { LETTER_STATUS_V2 } from '../../constants/suratStatus';
const { label, color } = LETTER_STATUS_V2[status];
<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>

// ❌ Salah — jangan hardcode
<span className="bg-yellow-100 text-yellow-700 ...">Menunggu RT</span>
```

---

## Panduan Toast / Notifikasi

Gunakan **Sonner** yang sudah terinstall. Pakai di bagian `onSuccess`/`onError` mutation.

```jsx
import { toast } from 'sonner';

// Sukses
toast.success('Surat berhasil diajukan');

// Error
toast.error('Gagal mengirim surat. Coba lagi.');

// Info
toast.info('PDF sedang digenerate...');

// Di main.jsx / App.jsx, tambah Toaster sekali saja:
import { Toaster } from 'sonner';
<Toaster position="top-right" richColors />
```

---

## Panduan Loading State

Selalu gunakan skeleton, bukan spinner global, untuk list dan card.

```jsx
// ✅ List surat — gunakan ListSkeleton
{isLoading ? <ListSkeleton count={3} /> : <div>...data</div>}

// ✅ Tombol aksi — gunakan loading prop di Button
<Button loading={mutation.isPending}>Simpan</Button>

// ✅ Full page load — boleh gunakan center spinner
{isLoading && (
  <div className="flex items-center justify-center h-64">
    <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

---

## Panduan Form

Semua form menggunakan `react-hook-form` + `zod`. Konsistensi error message:

```js
// Pesan error yang konsisten (dalam bahasa Indonesia)
nama: z.string().min(3, 'Nama minimal 3 karakter'),
email: z.string().email('Format email tidak valid'),
no_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
NIK: z.string().length(16, 'NIK harus tepat 16 digit'),
password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
```

---

## Tailwind Config Lengkap

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#baddff',
          300: '#7dc3ff',
          400: '#38a4ff',
          500: '#0e84f5',
          600: '#0065cc',
          700: '#004fa3',
          800: '#003d80',
          900: '#002d5c',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          muted:   '#f1f5f9',
          border:  '#e2e8f0',
        },
        ink: {
          DEFAULT:   '#0f172a',
          secondary: '#475569',
          muted:     '#94a3b8',
          inverse:   '#ffffff',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
```

---

## Checklist Konsistensi per Halaman

Sebelum dianggap selesai, setiap halaman harus memenuhi:

- [ ] Judul halaman menggunakan `PageHeader` dengan prop `title` dan opsional `back`
- [ ] Semua tombol aksi utama menggunakan komponen `Button` dengan `variant="primary"`
- [ ] Status surat ditampilkan dengan `StatusBadge`, bukan class hardcode
- [ ] Loading state menggunakan `ListSkeleton` atau `CardSkeleton`
- [ ] Empty state menggunakan `EmptyState` dengan teks yang actionable
- [ ] Form error menggunakan prop `error` di komponen `Input`
- [ ] Toast menggunakan `sonner` (`toast.success` / `toast.error`)
- [ ] Spacing konsisten: `p-4 md:p-6` untuk page, `gap-3` untuk list, `gap-4` untuk grid
- [ ] Tidak ada warna hardcode yang duplikasi dari token (pakai class token)
- [ ] Responsive: tampil baik di lebar 375px (iPhone SE) dan 1280px (desktop)
