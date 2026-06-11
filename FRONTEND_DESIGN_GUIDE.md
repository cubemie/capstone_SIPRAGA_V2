# SIPRAGA V2 — Frontend Design Guide

Panduan ini berisi standar desain antarmuka (UI) untuk aplikasi web SIPRAGA V2, mencakup palet warna, tipografi, dan penggunaan komponen dasar.

## 1. Color Palette (Tailwind v4)

Warna-warna ini telah dikonfigurasi secara global di `frontend/src/index.css`. Gunakan class Tailwind standar seperti `bg-primary`, `text-secondary`, dsb.

| Kategori | Warna Hex | Variabel CSS | Penggunaan Utama |
|---|---|---|---|
| **Primary** | `#1A4A8A` | `--color-primary` | Warna utama (sidebar, tombol utama, header) |
| **Primary Dark** | `#0F3068` | `--color-primary-dark` | Hover state tombol utama, sidebar aktif |
| **Primary Light** | `#2563EB` | `--color-primary-light` | Aksen warna, link, elemen interaktif ringan |
| **Secondary** | `#64748B` | `--color-secondary` | Teks sekunder, border, tombol outline/sekunder |
| **Success** | `#16A34A` | `--color-success` | Badge "Disetujui", notifikasi berhasil |
| **Warning** | `#D97706` | `--color-warning` | Badge "Menunggu", notifikasi peringatan |
| **Error** | `#DC2626` | `--color-error` | Badge "Ditolak", notifikasi error, pesan validasi |
| **Neutral 50** | `#F8FAFC` | `--color-neutral-50` | Background halaman, card background |
| **Neutral 100**| `#F1F5F9` | `--color-neutral-100`| Background sidebar muda, table header |
| **Neutral 900**| `#0F172A` | `--color-neutral-900`| Teks utama, judul, text konten |

## 2. Typography

Aplikasi SIPRAGA V2 menggunakan font **Inter** sebagai standar. Pastikan Google Fonts Inter sudah terpasang di `index.html`.

- **Font Family**: Inter, ui-sans-serif, system-ui, sans-serif (`font-sans`)
- **Headers (`h1` - `h3`)**: Gunakan `font-bold` dengan warna `text-neutral-900`.
- **Body Text**: Gunakan `text-base` atau `text-sm` dengan warna `text-neutral-900` atau `text-secondary`.

## 3. Icons

Kami menggunakan **Lucide React** (`lucide-react`) untuk konsistensi icon.
- Selalu gunakan `size={20}` atau `size={24}` untuk icon di dalam button/menu.
- Contoh penggunaan: `import { FileText, User, Home } from 'lucide-react';`

## 4. Komponen & Layouts

### AppLayout (Unified Sidebar Layout)
Jangan menggunakan `WargaLayout`, `RTRWLayout`, atau `SuperAdminLayout` sebagai standalone layout yang menduplikasi sidebar. Gunakan komponen `AppLayout` sebagai kerangka utama.
Masing-masing role (Warga, RT/RW, Superadmin) hanya perlu mengirimkan props `menuItems` (array of objects yang berisi label, icon, dan path tujuan) ke komponen `AppLayout`.

### Cards & Panels
- **Background**: `bg-white`
- **Border/Shadow**: `shadow-sm rounded-xl border border-neutral-100`
- **Padding**: `p-6` (standar) atau `p-4` (compact)

### Buttons
- **Primary**: `bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2`
- **Secondary**: `bg-white border border-secondary text-secondary hover:bg-neutral-50 rounded-lg px-4 py-2`
- **Danger**: `bg-error hover:bg-red-700 text-white rounded-lg px-4 py-2`

Pastikan seluruh tim pengembangan mengacu pada panduan ini untuk menjaga konsistensi UI SIPRAGA V2.
