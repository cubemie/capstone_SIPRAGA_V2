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

Untuk rekan-rekan tim, silakan ikuti langkah berikut untuk menjalankan aplikasi di komputer masing-masing. **Kalian tidak perlu menginstal Docker**, cukup gunakan Node.js dan MySQL lokal (seperti XAMPP).

### 1. Persiapan Awal (Prasyarat)
- **Node.js**: Wajib diinstal (minimal v18) untuk menjalankan backend dan frontend.
- **MySQL / XAMPP**: Pastikan server database MySQL lokal sudah terinstal dan menyala.
- **Git**: Untuk proses pull/push kode.

### 2. Setup Database Lokal
1. Buka MySQL kalian (lewat phpMyAdmin atau DBeaver).
2. Buat database baru dengan nama `capstone`.
3. Import file `database/init.sql` ke dalam database `capstone` tersebut agar tabel-tabelnya otomatis terbuat.

### 3. Cara Menjalankan Backend (Manual)
1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Pastikan file `.env` sudah ada dan konfigurasinya mengarah ke MySQL lokal kalian:
   `DB_HOST=localhost`
   `DB_PORT=3306` (atau sesuaikan dengan port MySQL kalian)
3. Instal dependencies backend:
   ```bash
   npm install
   ```
4. Jalankan backend:
   ```bash
   npm run dev
   ```
   Backend akan berjalan di `http://localhost:3000`.

### 4. Cara Menjalankan Frontend
1. Buka tab terminal baru, lalu masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal dependencies frontend:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
4. Buka browser dan ketik alamat: `http://localhost:5173`

---

## Cara Menjalankan Menggunakan Docker (Khusus Setup / PIC Server)
Bagian ini **opsional** dan utamanya digunakan oleh PIC yang mengatur environment Docker (tidak wajib untuk anggota tim lain).

1. Pastikan Docker Desktop menyala.
2. Buka terminal di root proyek, jalankan:
   ```bash
   docker compose up --build -d
   ```
*(Untuk menggunakan Docker, pastikan `DB_HOST=db` di dalam `.env` backend).*

---

### 4. Menjalankan Frontend
Frontend tetap kita jalankan secara lokal menggunakan Vite.

1. Buka tab terminal baru, lalu masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal *library/dependencies* (cukup dilakukan sekali diawal, atau saat ada update package dari member lain):
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
4. Buka browser dan ketik alamat: `http://localhost:5173`

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

*(Note: Endpoint spesifik seperti POST/GET/PUT/DELETE dapat dilihat selengkapnya di direktori `backend/src/routes` atau via Postman Collection).*

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
