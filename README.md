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

---

#### 1. 🏠 Dashboard RT/RW
Halaman utama setelah RT atau RW login. Menampilkan ringkasan surat yang perlu diverifikasi:
- **Butuh Verifikasi** — jumlah surat yang sedang menunggu tindakan
- **Total Masuk** — total seluruh surat yang masuk ke inbox
- **Daftar Surat Masuk** — 5 surat terbaru yang perlu diproses (nama warga, jenis surat, tanggal, status)
- **Tombol "Lihat Semua"** — menuju halaman inbox lengkap

> **Cara akses:** Login sebagai RT/RW → otomatis masuk ke Dashboard RT/RW

---

#### 2. 📥 Inbox Surat Masuk
Halaman daftar semua surat yang masuk ke antrian verifikasi RT atau RW.

Setiap item menampilkan:
- Nama warga & NIK
- Jenis surat
- Tanggal pengajuan
- Status surat (Menunggu RT / Diproses RT / Menunggu RW / Diproses RW)
- Tombol klik untuk membuka detail surat

> **Cara akses:** Dashboard → Klik **"Lihat semua"** atau menu **"Inbox"** di sidebar

---

#### 3. 📋 Detail & Verifikasi Surat
Halaman untuk meninjau dan mengambil keputusan atas pengajuan surat dari warga.

**Yang bisa dilakukan RT/RW:**
- Melihat data lengkap surat dan informasi warga
- Melihat lampiran yang diunggah warga
- **Setujui** — meneruskan surat ke langkah berikutnya (RW atau selesai)
- **Tolak** — menolak surat dengan disertai alasan penolakan
- **Minta Revisi** — meminta warga melengkapi atau memperbaiki data

Setelah disetujui, tanda tangan digital RT/RW yang tersimpan akan otomatis dilekatkan ke PDF surat.

> **Cara akses:** Inbox → Klik nama surat

---

#### 4. ✍️ Tanda Tangan Digital
Halaman untuk mengatur tanda tangan digital yang akan digunakan secara otomatis di setiap surat yang disetujui.

**Dua metode input:**
| Metode | Keterangan |
|--------|------------|
| Gambar TTD | Mode menggambar tanda tangan langsung di canvas menggunakan mouse/stylus/sentuhan |
| Upload File | Upload file gambar tanda tangan (format PNG/JPG) |

**Fitur:**
- **Pratinjau Tersimpan** — melihat tanda tangan yang sedang aktif
- **Status Aktif/Kosong** — indikator apakah TTD sudah tersimpan
- Tanda tangan dapat diperbarui kapan saja
- Disertifikasi oleh SIPRAGA Secure

> **Cara akses:** Menu **"Tanda Tangan"** di sidebar

---

#### 5. 📋 Riwayat Surat RT/RW
Halaman daftar semua surat yang pernah diproses oleh RT/RW, dilengkapi filter status.

> **Cara akses:** Menu **"Riwayat Surat"** di sidebar

---

#### 6. 👤 Profil RT/RW
Halaman untuk melihat dan mengelola profil akun RT/RW.

> **Cara akses:** Klik menu **"Profil Saya"** di sidebar

---

### 🛡️ Fitur untuk Superadmin

---

#### 1. 📊 Dashboard Superadmin
Halaman utama yang menampilkan ringkasan statistik seluruh wilayah:
- **Total Warga** — jumlah warga terdaftar di seluruh wilayah
- **Total RT** — jumlah RT aktif
- **Total RW** — jumlah RW aktif
- **Surat Selesai** — total surat yang telah berhasil diselesaikan

**Daftar Wilayah RW:**
- Klik salah satu RW untuk melihat detail datanya
- Detail mencakup: total warga, estimasi kepala KK, jumlah RT, distribusi jenis kelamin, distribusi pekerjaan (Top 5), dan daftar RT beserta nama ketua

> **Cara akses:** Login sebagai Superadmin → otomatis masuk ke Dashboard

---

#### 2. 👥 Manajemen Akun RT/RW
Halaman untuk mengelola seluruh akun Ketua RT dan Ketua RW.

**Tab tersedia:**
- **RT** — daftar semua ketua RT
- **RW** — daftar semua ketua RW

**Kolom data:** Nomor RT/RW, Nama Ketua, Username, Wilayah (Kelurahan), Status Aktif/Nonaktif

**Aksi yang tersedia per akun:**

| Aksi | Keterangan |
|------|------------|
| 🔄 Toggle Aktif/Nonaktif | Menonaktifkan atau mengaktifkan kembali akun |
| 🔑 Reset Password | Mengatur ulang kata sandi akun |
| 🗑️ Hapus Akun | Menghapus akun secara permanen |

**Tambah Akun Baru:**
- Klik tombol **"+ Tambah Akun"**
- Isi form: No. RT/RW, RW Induk (untuk RT), Nama Ketua, Username, Password, dan data wilayah (Provinsi, Kota, Kecamatan, Kelurahan/Desa)

> **Cara akses:** Menu **"Manajemen Akun"** di sidebar

---

#### 3. 📝 Template Surat (Markdown)
Halaman untuk membuat dan mengelola template surat dalam format Markdown.

**Fitur:**
- **Buat Template Baru** — tulis template surat menggunakan Markdown dengan dukungan variabel dinamis
- **Edit Template** — perbarui konten template yang sudah ada
- **Preview PDF** — pratinjau hasil render template menjadi PDF
- **Hapus Template** — menghapus template yang tidak digunakan
- **Versi Template** — setiap template memiliki nomor versi

**Variabel dinamis yang didukung:**

| Variabel | Keterangan |
|----------|------------|
| `{{nama_warga}}` | Nama warga |
| `{{nik}}` | NIK warga |
| `{{alamat}}` | Alamat warga |
| `{{keperluan}}` | Keperluan surat |
| `{{tanggal}}` | Tanggal surat |
| `{{nomor_surat}}` | Nomor surat |
| `{{nama_desa}}` | Nama desa/kelurahan |
| `{{kecamatan}}` | Kecamatan |
| `{{kabupaten}}` | Kabupaten/Kota |
| `{{kepala_desa}}` | Nama kepala desa |
| `{{nip_kepala}}` | NIP kepala desa |

> **Cara akses:** Menu **"Template Surat"** di sidebar

---

#### 4. ⚙️ Konfigurasi Instansi
Halaman untuk mengatur informasi instansi yang tampil di kop surat PDF.

**Pengaturan yang bisa diubah:**

| Bagian | Field |
|--------|-------|
| Informasi Instansi | Nama Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi, Kode Pos |
| Kepala Instansi | Nama Kepala Desa/Lurah, NIP |
| Kop Surat | Kop Surat Baris 1, Kop Surat Baris 2, URL Logo Instansi |

> **Cara akses:** Menu **"Konfigurasi"** di sidebar

---

#### 5. 🗒️ Log Sistem
Halaman audit trail yang mencatat seluruh aktivitas pengguna dan sistem.

**Kolom log:** Waktu, Jenis Aksi, Pelaku (nama + role), Target, Detail

**Filter tersedia:**
- **Filter Role:** Semua / Warga / RT / RW / Superadmin / System
- **Filter Aksi:** Login, Buat Surat, Approve Surat, Tolak Surat, Hapus Akun, Reset Password, Update Konfigurasi

**Navigasi:** Pagination per 50 entri

> **Cara akses:** Menu **"Log Sistem"** di sidebar

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

## 👥 Tim Pengembang

Disusun Oleh:
1. Mutia Saniya Rahma - G6401231002
2. Quina Rizky Dae Yuena Siregar - G6401231013
3. Danella Nur Aisyah Latief - G6401231041
4. Naufal Rama Koswara - G6401231113

---
