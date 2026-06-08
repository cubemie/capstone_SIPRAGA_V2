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

## Cara Instalasi

### Prasyarat
- **Docker & Docker Compose** (Disarankan, untuk menjalankan backend & database dengan mudah)
- **Node.js** (Minimal versi 18, untuk menjalankan frontend dan/atau backend manual)
- **Git**

### Clone Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd capstone_RT-RW_CORETAX
```

## Cara Menjalankan Backend & Database

Backend dan database MySQL dijalankan menggunakan Docker untuk memudahkan environment setup.

1. Pastikan Docker Desktop atau Docker Engine sudah berjalan.
2. Buka terminal/command prompt di direktori root proyek (`capstone_RT-RW_CORETAX`).
3. Jalankan perintah berikut untuk mem-build dan menyalakan container:
   ```bash
   docker compose up --build -d
   ```
4. Tunggu beberapa saat. Database akan otomatis diinisialisasi (tabel dan data awal dari `database/init.sql`).
5. Backend (API) kini berjalan di `http://localhost:3000`.

### Perintah Docker yang Berguna
- **Melihat Log secara Real-time**: `docker compose logs -f`
- **Mematikan Server (Container)**: `docker compose down`
- **Mereset Database (Menghapus Data)**: `docker compose down -v`
- **Restart Backend Saja**: `docker compose restart backend`

### Penjelasan Container Docker
Aplikasi ini berjalan menggunakan dua layanan di dalam `docker-compose.yml`:
1. **Service `db` (`coretax_db`)**: Menggunakan image MySQL 8.0. Data disimpan secara persisten di dalam Docker Volume bernama `db_data`. Script `database/init.sql` akan otomatis tereksekusi pada saat container database pertama kali dibuat.
2. **Service `backend` (`coretax_backend`)**: Node.js Backend API. Aplikasi di-build menggunakan `Dockerfile` yang ada di dalam folder `/backend`. Container backend terhubung ke container database melalui jaringan internal docker, dan diekspos ke Host pada port `3000`.

## Cara Menjalankan Backend (Manual / Tanpa Docker)

Jika Anda ingin menjalankan backend secara lokal tanpa menggunakan Docker, ikuti langkah berikut:

1. Pastikan Anda memiliki server MySQL lokal yang berjalan dan sudah membuat database `capstone`.
2. Buka file `backend/.env` dan ubah host database menjadi localhost:
   `DB_HOST=localhost`
3. Buka tab terminal baru dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
4. Instal semua dependencies backend:
   ```bash
   npm install
   ```
5. Jalankan backend menggunakan nodemon (untuk development):
   ```bash
   npm run dev
   ```
   Atau untuk menjalankan secara standar: `npm start` (atau `node src/server.js`)

---

## Cara Menjalankan Frontend

Frontend aplikasi ini dibangun menggunakan React + Vite.

1. Buka tab terminal baru, lalu masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal semua dependencies (hanya perlu dilakukan sekali atau saat ada pembaruan package):
   ```bash
   npm install
   ```
3. Jalankan server lokal untuk development:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses alamat yang tertera di terminal (biasanya `http://localhost:5173`).

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
