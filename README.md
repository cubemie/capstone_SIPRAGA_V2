# SIPRAGA - Sistem Pengelolaan Surat RT/RW Digital

Sistem manajemen surat pengantar berbasis web untuk RT/RW dengan dukungan tanda tangan digital dan verifikasi QR.

---

## Fitur Utama

- **Multi-Role Access**:
  - Warga: Ajukan surat, lihat riwayat, cek status
  - RT/RW: Review surat, berikan persetujuan, tanda tangan digital
  - Superadmin: Manajemen akun, template surat, konfigurasi instansi
- **Pengajuan Surat Mandiri**: Wizard langkah demi langkah dengan template dinamis
- **Tanda Tangan Digital (TTD)**: Canvas drawing + upload gambar, tersimpan di Supabase Storage
- **Persetujuan Bertahap**: Workflow RT-only atau RT-then-RW
- **PDF Generation**: Render surat otomatis dengan TTD, QR untuk verifikasi
- **Notifikasi Real-time**: Notifikasi in-app dan email/SMS (configurable)
- **Audit Logging**: Log aktivitas sistem untuk kebutuhan audit
- **QR Verification**: Halaman verifikasi surat via scan QR tanpa login

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MySQL 8.0 (via mysql2)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Storage**: Supabase Storage (@supabase/supabase-js)
- **Queue**: BullMQ + Redis (ioredis)
- **PDF**: PDF-Lib, Puppeteer
- **Validation**: Zod, express-validator
- **Logging**: Winston + Morgan
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 8.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router DOM 7.x
- **State Management**: TanStack React Query 5.x
- **Form Handling**: React Hook Form 7.x + Zod
- **Signature**: react-signature-canvas
- **PDF Rendering**: @react-pdf/renderer, react-pdf
- **Notifications**: Sonner
- **Icons**: Lucide React

---

## Struktur Proyek

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
├── docs/                   # Dokumentasi (ERD, API ref, legacy)
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── assets/         # Gambar & file statis
│   │   ├── components/     # Komponen reusable
│   │   ├── constants/      # Konstanta frontend
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── features/       # Fitur fitur utama (letters)
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

## Panduan Setup Lokal (Development)

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
- Backend API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api-docs`
- MySQL (host): `localhost:3307` (user: root, password: root, db: capstone)
- Redis: `localhost:6379`

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

## Panduan Deployment (Production)

### 1. Deploy Backend ke Railway

1. Push branch utama ke GitHub
2. Buka [Railway.app](https://railway.app)
3. Klik **New Project** → Pilih repo kamu
4. Railway akan otomatis mendeteksi `railway.json` dan membuat service:
   - Backend
   - MySQL 8.0
   - Redis
5. Setelah deployment selesai:
   - Masuk ke service **Backend** → **Variables**
   - Tambahkan variabel:
     - `JWT_SECRET`: random string yang aman
     - `SUPABASE_URL`: URL Supabase kamu
     - `SUPABASE_KEY`: Service role key Supabase
     - `SUPABASE_BUCKET`: Nama bucket di Supabase
     - `CLIENT_URL`: URL frontend Vercel kamu (misal: `https://your-app.vercel.app`)
6. Salin **Public URL** backend (misal: `https://your-backend.up.railway.app`)

### 2. Deploy Frontend ke Vercel

1. Buka [Vercel.com](https://vercel.com)
2. Klik **New Project** → Pilih repo kamu
3. Di bagian **Root Directory**, masukkan `frontend`
4. Klik **Environment Variables** → Tambahkan:
   - Name: `VITE_API_URL`
   - Value: `<RAILWAY_BACKEND_PUBLIC_URL>/api` (misal: `https://your-backend.up.railway.app/api`)
5. Klik **Deploy**

Selesai! 🚀 Aplikasi kamu siap digunakan!

---

## Dokumentasi API

Untuk detail endpoint dan penggunaan API, lihat:
- Swagger UI (di lokal/railway): `/api-docs`
- API Reference: `docs/API_REFERENCE.md`

---

## Tim Pengembang

[Daftar tim pengembang akan ditambahkan di sini]

---

## Lisensi

[Lisensi akan ditambahkan di sini]
