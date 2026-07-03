# SIPRAGA — Sistem Pengelolaan Surat RT/RW Digital

> Sistem manajemen surat pengantar berbasis web untuk RT/RW dengan dukungan tanda tangan digital dan verifikasi QR.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://capstone-sipraga-v2.vercel.app)

---

## 🚀 Demo Langsung

Coba aplikasi SIPRAGA secara langsung:

> **🌐 URL:** [https://capstone-sipraga-v2.vercel.app](https://capstone-sipraga-v2.vercel.app)

### 👤 Warga

| Field      | Value               |
| ---------- | ------------------- |
| NIK        | `1234567890123456`  |
| Kata Sandi | `123456789`         |

### 🏘️ RT (Ketua RT)

| Field      | Value        |
| ---------- | ------------ |
| Username   | `tomsuri`    |
| Kata Sandi | `initomsuri` |

### 🏡 RW (Ketua RW / Kepala Desa)

| Field      | Value      |
| ---------- | ---------- |
| Username   | `KADES`    |
| Kata Sandi | `inikades` |

### 🛡️ Super Admin

| Field      | Value    |
| ---------- | -------- |
| Username   | `sudmin` |
| Kata Sandi | `sudmin` |

> ⚠️ **Catatan:** Akun demo bersifat shared. Harap tidak mengubah kata sandi atau menghapus data penting.

---

## ✨ Fitur Utama

- **Multi-Role Access**:
  - 👤 **Warga**: Ajukan surat, lihat riwayat, cek status pengajuan
  - 🏘️ **RT**: Review surat, berikan persetujuan, tanda tangan digital
  - 🏡 **RW**: Persetujuan akhir, tanda tangan digital, manajemen wilayah
  - 🛡️ **Superadmin**: Manajemen akun, template surat, konfigurasi instansi
- **Pengajuan Surat Mandiri**: Wizard langkah demi langkah dengan template dinamis
- **Live Preview PDF**: Pratinjau surat secara real-time saat mengisi form
- **10 Jenis Surat**: Domisili, Tidak Mampu, KTP, KK, Nikah, Usaha, Kehilangan, SKCK, Ahli Waris, Beda Alamat
- **Tanda Tangan Digital (TTD)**: Canvas drawing + upload gambar, tersimpan di Supabase Storage
- **Persetujuan Bertahap**: Workflow RT-only atau RT → RW
- **PDF Generation**: Render surat otomatis dengan TTD dan QR code verifikasi
- **Notifikasi Real-time**: Notifikasi in-app
- **Audit Logging**: Log aktivitas sistem untuk kebutuhan audit
- **QR Verification**: Halaman verifikasi surat via scan QR tanpa perlu login

---

## 📖 Dokumentasi Fitur & Tampilan UI

Dokumentasi ini ditujukan untuk **warga** sebagai panduan penggunaan aplikasi SIPRAGA.

---

### 👤 Fitur untuk Warga

#### 1. 🏠 Dashboard Warga
Halaman utama setelah warga login. Menampilkan ringkasan pengajuan surat:
- **Sedang Diproses** — jumlah surat yang masih dalam antrian verifikasi RT/RW
- **Selesai / Disetujui** — jumlah surat yang telah disetujui dan siap diunduh
- **Pengajuan Ditolak** — jumlah surat yang ditolak beserta alasannya
- **Status Pengajuan Terakhir** — daftar 3 pengajuan terbaru dengan tanggal dan status

> **Cara akses:** Login → otomatis masuk ke Dashboard Warga

---

#### 2. 📄 Ajukan Surat Baru
Wizard multi-langkah untuk membuat surat pengantar. Terdiri dari 6 tahap:

| Langkah | Keterangan |
|---------|------------|
| 1. Jenis Surat | Pilih salah satu dari 10 jenis surat yang tersedia |
| 2. Isi Data | Isi data diri (otomatis dari profil) |
| 3. Isi Surat | Isi detail keperluan surat |
| 4. Lampiran | Upload dokumen pendukung (opsional) |
| 5. Alur | Pilih alur verifikasi (RT saja / RT + RW) |
| 6. Kirim | Konfirmasi dan kirim pengajuan |

**Jenis Surat yang Tersedia:**
- Surat Keterangan Domisili
- Surat Keterangan Tidak Mampu
- Surat Pengantar KTP
- Surat Pengantar KK
- Surat Pengantar Nikah
- Surat Keterangan Usaha
- Surat Keterangan Kehilangan
- Surat Pengantar SKCK
- Surat Keterangan Ahli Waris
- Surat Keterangan Beda Alamat

> **Cara akses:** Dashboard → Klik tombol **"+ Ajukan Surat Baru"** atau menu **"Ajukan Surat Baru"** di sidebar

---

#### 3. 📋 Status & Riwayat Surat
Halaman daftar semua surat yang pernah diajukan. Dilengkapi filter berdasarkan status:

| Tab | Isi |
|-----|-----|
| Semua | Seluruh pengajuan |
| Proses | Surat yang sedang diverifikasi RT/RW |
| Selesai | Surat yang telah disetujui |
| Ditolak | Surat yang ditolak |

> **Cara akses:** Klik menu **"Status & Riwayat"** di sidebar

---

#### 4. 🔍 Detail & Tracking Surat
Halaman detail untuk setiap surat yang menampilkan:
- **Progress Surat** — timeline visual alur verifikasi:
  - Surat Dibuat
  - Menunggu Verifikasi RT *(sekarang)*
  - RT Sedang Memproses
  - RT Menyetujui
  - RW Sedang Memproses
  - Surat Selesai
- **Data Surat** — rincian isian yang dikirimkan
- **Tombol Unduh PDF** — tersedia setelah surat disetujui

> **Cara akses:** Klik nama surat di halaman Status & Riwayat

---

#### 5. 👤 Profil Saya
Halaman untuk melihat dan melengkapi data diri:
- **Data Registrasi** — Nama lengkap, NIK (tidak bisa diubah), Email, Nomor HP
- **Data Pribadi** — Tempat & Tanggal Lahir, Jenis Kelamin, Agama, Kewarganegaraan
- **Data Domisili** — Alamat, RT, RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos
- **Foto Profil** — Upload foto profil

> **Cara akses:** Klik menu **"Profil Saya"** di sidebar

---

### 🏘️ Fitur untuk RT/RW

> 📝 *Dokumentasi fitur RT/RW akan dilengkapi secara manual.*

<!-- TEMPLATE: Tambahkan dokumentasi fitur RT di sini -->

---

### 🛡️ Fitur untuk Superadmin

> 📝 *Dokumentasi fitur Superadmin akan dilengkapi secara manual.*

<!-- TEMPLATE: Tambahkan dokumentasi fitur Superadmin di sini -->

---

## 🛠️ Tech Stack

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | 18+ | Runtime |
| Express.js | 5.x | Framework |
| MySQL | 8.0 | Database (via mysql2) |
| JWT + bcryptjs | — | Autentikasi |
| Supabase Storage | — | Penyimpanan file (TTD, PDF) |
| BullMQ + Redis | — | Job queue |
| PDF-Lib + Puppeteer | — | Generate PDF |
| Zod + express-validator | — | Validasi |
| Winston + Morgan | — | Logging |
| Swagger | — | Dokumentasi API |

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| React | 19.x | UI Framework |
| Vite | 8.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| React Router DOM | 7.x | Routing |
| TanStack React Query | 5.x | State & Data Fetching |
| React Hook Form + Zod | 7.x | Form Handling & Validasi |
| react-signature-canvas | — | Tanda Tangan Digital |
| @react-pdf/renderer | — | Render PDF |
| Sonner | — | Notifikasi Toast |
| Lucide React | — | Ikon |

---

## 📁 Struktur Proyek

```text
capstone_RT-RW_CORETAX/
├── .github/workflows/      # CI/CD untuk GitHub Actions
├── backend/                # Backend API (Express.js)
│   ├── src/
│   │   ├── bootstrap/      # Inisialisasi kolom database
│   │   ├── config/         # DB, Redis, Supabase, Swagger
│   │   ├── constants/      # Konstanta (status surat, dll.)
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── middlewares/    # Auth, error handling, upload
│   │   ├── models/         # Database models
│   │   ├── modules/        # Fitur modular (letters, public)
│   │   ├── routes/         # Definisi rute API
│   │   ├── services/       # Logika bisnis
│   │   └── utils/          # Helper functions
│   ├── Dockerfile
│   └── package.json
├── database/               # Script migrasi & seeding database
├── docs/                   # Dokumentasi (ERD, API ref)
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── assets/         # Gambar & file statis
│   │   ├── components/     # Komponen reusable
│   │   ├── constants/      # Konstanta frontend
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── features/       # Fitur utama (letters)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Halaman aplikasi
│   │   ├── services/       # Helper API calls
│   │   └── utils/          # Helper functions
│   ├── vercel.json         # Konfigurasi Vercel
│   └── package.json
├── docker-compose.yml      # Orkestrasi Docker (prod)
├── docker-compose.dev.yml  # Orkestrasi Docker (dev with hot-reload)
├── railway.json            # Konfigurasi Railway deployment
└── README.md
```

---

## ⚙️ Panduan Setup Lokal (Development)

### Prasyarat
- Docker Desktop (untuk backend + DB + Redis)
- Node.js 18+ (untuk frontend)
- Git

### 1. Clone Repository & Setup Environment

```bash
# Clone repo
git clone <repo-url>
cd capstone_RT-RW_CORETAX

# Setup backend env
cd backend
cp .env.example .env
# Edit .env sesuai kebutuhan (JWT_SECRET, Supabase credentials, dll.)
cd ..

# Setup frontend env
cd frontend
cp .env.example .env
# Pastikan VITE_API_URL=http://localhost:3000/api (untuk local dev)
cd ..
```

### 2. Jalankan Backend via Docker

```bash
# Development mode (hot-reload backend)
docker compose -f docker-compose.dev.yml up --build -d

# Atau production-like
docker compose up --build -d
```

Setelah container sehat:

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:3000` |
| Swagger Docs | `http://localhost:3000/api-docs` |
| MySQL | `localhost:3307` (user: root, password: root, db: capstone) |
| Redis | `localhost:6379` |

### 3. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

### 4. Perintah Docker Berguna

```bash
# Lihat log backend
docker compose logs -f backend

# Stop semua container
docker compose down

# Reset database (hapus volume)
docker compose down -v
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 🌐 Panduan Deployment (Production)

### 1. Deploy Backend ke Railway

1. Push branch utama ke GitHub
2. Buka [Railway.app](https://railway.app)
3. Klik **New Project** → Pilih repo kamu
4. Railway akan otomatis mendeteksi `railway.json` dan membuat service:
   - Backend
   - MySQL 8.0
   - Redis
5. Setelah deployment selesai, masuk ke service **Backend** → **Variables**, tambahkan:

| Variable | Keterangan |
|----------|------------|
| `JWT_SECRET` | Random string yang aman |
| `SUPABASE_URL` | URL Supabase kamu |
| `SUPABASE_KEY` | Service role key Supabase |
| `SUPABASE_BUCKET` | Nama bucket di Supabase |
| `CLIENT_URL` | URL frontend Vercel kamu |

6. Salin **Public URL** backend (misal: `https://your-backend.up.railway.app`)

### 2. Deploy Frontend ke Vercel

1. Buka [Vercel.com](https://vercel.com)
2. Klik **New Project** → Pilih repo kamu
3. Di bagian **Root Directory**, masukkan `frontend`
4. Tambahkan **Environment Variable**:
   - `VITE_API_URL` = `<RAILWAY_BACKEND_PUBLIC_URL>/api`
5. Klik **Deploy**

Selesai! 🚀 Aplikasi siap digunakan di [https://capstone-sipraga-v2.vercel.app](https://capstone-sipraga-v2.vercel.app)

---

## 📖 Dokumentasi API

Untuk detail endpoint dan penggunaan API, lihat:
- **Swagger UI** (lokal/railway): `/api-docs`
- **API Reference**: `docs/API_REFERENCE.md`

---

## 👥 Tim Pengembang

Disusun Oleh:
1. Mutia Saniya Rahma - G6401231002
2. Quina Rizky Dae Yuena Siregar - G6401231013
3. Danella Nur Aisyah Latief - G6401231041
4. Naufal Rama Koswara - G6401231113

---
