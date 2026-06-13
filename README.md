![Logo/Banner](frontend/src/images.jpeg)

# Aplikasi RT-RW CORETAX

## Latar Belakang
[Akan ditambahkan nanti]

## Tujuan
[Akan ditambahkan nanti]

## Fitur Utama
- **Multi-Role Access**: Mendukung login dan hak akses spesifik untuk 3 tingkat pengguna: *Warga*, *Pengurus RT/RW*, dan *Super Admin*.
- **Manajemen Warga**: Pencatatan, pembaruan, dan pengelolaan profil kependudukan atau data warga.
- **Pengajuan Surat Mandiri**: Warga dapat memohon berbagai jenis surat pengantar secara online tanpa harus langsung datang ke pengurus.
- **Persetujuan & Tanda Tangan Elektronik**: Pengurus RT/RW dapat mereview ajuan, menyetujui, dan membubuhkan tanda tangan elektronik (TTD) langsung ke dalam surat.
- **Manajemen Template Surat**: Template surat yang dinamis, dikelola langsung oleh sistem untuk berbagai kebutuhan administrasi kelurahan/desa.
- **Dashboard Terintegrasi**: Tampilan dashboard khusus yang informatif untuk RT/RW guna memantau permohonan surat masuk dan statistik warganya.

## Arsitektur Sistem
Aplikasi ini dibangun dengan arsitektur *Client-Server*:
- **Frontend**: Aplikasi antarmuka pengguna berbasis komponen (React) yang berinteraksi dengan API backend.
- **Backend**: REST API Server (Node.js) yang memproses logika bisnis dan melayani permintaan data.
- **Database**: Relational Database menggunakan MySQL.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router DOM
- **Backend**: Node.js, Express.js, MySQL2, JWT (JSON Web Token), Multer, Cloudinary, PDF-Lib
- **Database**: MySQL 8.0
- **Deployment & Environment**: Docker, Docker Compose

## Struktur Folder
```text
capstone_RT-RW_CORETAX/
├── backend/            # Source code backend API (Node.js/Express)
├── frontend/           # Source code antarmuka pengguna (React/Vite)
├── database/           # Script inisialisasi struktur database (init.sql)
└── docker-compose.yml  # Konfigurasi orkestrasi container Docker
```

## Panduan Setup untuk Tim

Backend dan database **wajib dijalankan via Docker Compose**. Frontend dijalankan lokal dengan Vite.

### 1. Persiapan Awal (Prasyarat)
- **Docker Desktop**: Wajib terinstal dan menyala.
- **Node.js**: v18+ (hanya untuk menjalankan frontend).
- **Git**: Untuk pull/push kode.

### 2. Setup Environment Backend
1. Salin template environment:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. **Jangan ubah** `DB_HOST=db` dan `REDIS_HOST=redis` — itu nama service Docker, bukan localhost.
3. Sesuaikan `JWT_SECRET` dan kredensial opsional (Supabase, SMTP, dll.) jika perlu.

### 3. Jalankan Backend + Database + Redis (Docker)
Dari root proyek:
```bash
# Production-like
docker compose up --build -d

# Atau development (hot-reload backend)
docker compose -f docker-compose.dev.yml up --build
```

Setelah container healthy:
- Backend API: `http://localhost:3000`
- MySQL (akses dari host): `localhost:3307` (user `root`, password `root`, db `capstone`)
- Redis: `localhost:6379`

Database otomatis diinisialisasi dari:
`00-base.sql` → `init.sql` → `seed.sql` → `seed_workflows.sql`

### 4. Jalankan Frontend (Lokal)
```bash
cd frontend
npm install
npm run dev
```
Buka browser: `http://localhost:5173`

Frontend mem-proxy request `/api` ke `http://localhost:3000` (backend Docker).

### 5. Perintah Docker Berguna
```bash
# Lihat log backend
docker compose logs -f backend

# Stop semua container
docker compose down

# Reset database (hapus volume)
docker compose down -v
docker compose up --build -d
```

---

## Setup Manual (Tidak Direkomendasikan)
Jika benar-benar perlu menjalankan backend tanpa Docker, ubah `DB_HOST=localhost` di `.env` dan siapkan MySQL/Redis lokal sendiri. **Tim development menggunakan Docker sebagai standar.**

<details>
<summary>Instruksi manual lama (legacy)</summary>

### Setup Database Lokal
1. Buat database `capstone`.
2. Import `database/init.sql`, `database/seed.sql`, dan `database/seed_workflows.sql`.

### Backend Manual
```bash
cd backend
cp .env.example .env
# Ubah DB_HOST=localhost, REDIS_HOST=localhost di .env
npm install
npm run dev
```

</details>



## API Endpoint
Berikut adalah rute dasar (*base URL*) untuk masing-masing layanan yang tersedia di Backend:

| Base Route | Deskripsi Fungsi |
|---|---|
| `/api/auth` | Autentikasi (Register, Login Warga, Login RT/RW, dan Logout) |
| `/api/warga` | Manajemen profil, validasi, dan data kependudukan Warga |
| `/api/surat` | Operasi terkait pengajuan, riwayat, dan penerbitan Surat Pengantar |
| `/api/template-surat` | Manajemen CRUD template surat administrasi |
| `/api/ttd` | Mengelola *file* tanda tangan digital milik pengurus RT/RW |
| `/api/superadmin` | Manajemen platform level atas untuk Super Admin |
| `/api/dashboard-rt-rw` | Endpoint khusus analitik/statistik untuk dashboard Pengurus |

*(Note: Detail dokumentasi endpoint, request body, dan response JSON dapat dilihat selengkapnya di [API_REFERENCE.md](docs/API_REFERENCE.md)).*

## Strategi Migrasi Database
Untuk meminimalisir masalah perubahan schema database antar tim, gunakan folder `database/migrations/`:
- **Jangan pernah merubah skema** `init.sql` jika fitur tersebut baru.
- Buat file `.sql` baru di folder `database/migrations/` (misal: `001_add_no_hp_to_warga.sql`) dan komunikasikan ke grup tim agar semua menjalankan file SQL tersebut.
- Baca detail selengkapnya di [database/migrations/README.md](database/migrations/README.md).

## Deployment
[Akan ditambahkan nanti]

## Tim Pengembang
[Akan ditambahkan nanti]

## Progress Sementara

### Login Page
![alt text](login.png)

### Register Page
![alt text](register.png)

## Lisensi
[Akan ditambahkan nanti]
