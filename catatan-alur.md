# 📋 Catatan Alur Routing — SIPRAGA (Sistem Informasi Persuratan Digital RT/RW)

> **Di mana file ini?**  
> `capstone_RT-RW_CORETAX/catatan-alur.md` — simpan di root proyek agar mudah ditemukan.

---

## 🗂️ File-file Routing yang Perlu Kamu Tahu

| Letak | File | Fungsi |
|---|---|---|
| Frontend | `frontend/src/App.jsx` | **Pusat semua route halaman** — ini yang pertama dibuka |
| Backend  | `backend/src/app.js`   | **Pusat semua route API** — registrasi semua endpoint |
| Frontend | `frontend/src/components/ProtectedRoute.jsx` | Guard halaman berdasarkan role |
| Frontend | `frontend/src/context/AuthContext.jsx` | State login global (token JWT) |
| Frontend | `frontend/src/utils/api.js` | HTTP client terpusat (`/api/*`) |

---

## 👥 Role yang Ada di Sistem

| Role | Login Via | Dashboard |
|---|---|---|
| `warga` | `/login-warga` | `/warga/dashboard` |
| `rt` | `/login-rtrw` | `/rtrw/dashboard` |
| `rw` | `/login-rtrw` | `/rtrw/dashboard` |
| `superadmin` | `/register-superadmin` → login via route superadmin | `/superadmin/dashboard` |

> **Mekanisme Auth:**  
> Token JWT disimpan di `localStorage`. Setiap request HTTP otomatis membawa header  
> `Authorization: Bearer <token>` via `api.js`. Ketika token expired, `AuthContext` otomatis clear.

---

## 🌐 FRONTEND — Peta Semua Halaman

### 📁 File: `frontend/src/App.jsx`

---

### 1. Public Routes (Tanpa Login)

| URL | Komponen | Lokasi File |
|---|---|---|
| `/` | `LandingPage` | `pages/LandingPage.jsx` |
| `/login-warga` | `LoginWarga` | `pages/auth/LoginWarga.jsx` |
| `/register-warga` | `RegisterWarga` | `pages/auth/RegisterWarga.jsx` |
| `/login-rtrw` | `LoginRtRw` | `pages/auth/LoginRtRw.jsx` |
| `/register-rtrw` | `RegisterRtRw` | `pages/auth/RegisterRtRw.jsx` |
| `/register-superadmin` | `RegisterSuperadmin` | `pages/auth/RegisterSuperadmin.jsx` |
| `/verify/:qrToken` | `QrVerifyPage` | `features/letters/pages/QrVerifyPage.jsx` |

> ℹ️ `/verify/:qrToken` — halaman ini bisa dibuka siapa saja (tanpa login) untuk memverifikasi keaslian surat lewat QR Code.

---

### 2. Protected Routes — Warga (role: `warga`)

Semua halaman ini dibungkus `DashboardLayout` (sidebar + topbar).

| URL | Komponen | Lokasi File |
|---|---|---|
| `/warga/dashboard` | `WargaDashboard` | `pages/warga/Dashboard.jsx` |
| `/warga/buat-surat-v2` | `LetterWizardPage` | `features/letters/pages/LetterWizardPage.jsx` |
| `/warga/surat/:uuid` | `LetterDetailPage` | `features/letters/pages/LetterDetailPage.jsx` |
| `/warga/riwayat` | `LetterListPage` | `features/letters/pages/LetterListPage.jsx` |
| `/warga/inbox` | `LetterInboxPage` | `features/letters/pages/LetterInboxPage.jsx` |
| `/profil` | `ProfilePage` | `pages/ProfilePage.jsx` |

---

### 3. Protected Routes — RT/RW (role: `rt` atau `rw`)

Semua halaman ini juga dibungkus `DashboardLayout`.

| URL | Komponen | Lokasi File |
|---|---|---|
| `/rtrw/dashboard` | `RtRwDashboard` | `pages/rtrw/Dashboard.jsx` |
| `/rtrw/buat-surat-v2` | `LetterWizardPage` | `features/letters/pages/LetterWizardPage.jsx` |
| `/rtrw/surat/:uuid` | `LetterDetailPage` | `features/letters/pages/LetterDetailPage.jsx` |
| `/rtrw/ttd` | `TtdSurat` | `pages/rtrw/TtdSurat.jsx` |
| `/rtrw/riwayat-v2` | `LetterListPage` | `features/letters/pages/LetterListPage.jsx` |
| `/rtrw/inbox` | `LetterInboxPage` | `features/letters/pages/LetterInboxPage.jsx` |
| `/profil` | `ProfilePage` | `pages/ProfilePage.jsx` |

> ⚠️ `LetterWizardPage` dan `LetterDetailPage` **dipakai bersama** oleh Warga dan RT/RW.  
> Komponen ini cek `user.role` secara internal untuk menyesuaikan tampilan & tombol.

---

### 4. Protected Routes — Superadmin (role: `superadmin`)

Superadmin punya `DashboardLayout`-nya sendiri yang sudah di-embed di masing-masing halaman.

| URL | Komponen | Lokasi File |
|---|---|---|
| `/superadmin/dashboard` | `SuperAdminDashboard` | `pages/superadmin/Dashboard.jsx` |
| `/superadmin/template-md` | `TemplateSuratMarkdown` | `pages/superadmin/TemplateSuratMarkdown.jsx` |
| `/superadmin/akun` | `ManajemenAkun` | `pages/superadmin/ManajemenAkun.jsx` |
| `/superadmin/config` | `KonfigurasiInstansi` | `pages/superadmin/KonfigurasiInstansi.jsx` |
| `/superadmin/log` | `LogSistem` | `pages/superadmin/LogSistem.jsx` |

---

### 5. Mekanisme Guard / ProtectedRoute

**File:** `frontend/src/components/ProtectedRoute.jsx`

```
Akses halaman protected
        ↓
Apakah punya token di localStorage?
  → Tidak → Redirect ke /login-warga atau /login-rtrw
        ↓
Apakah role sesuai allowedRoles?
  → Tidak → Redirect ke dashboard sesuai role yang dimiliki
        ↓
Tampilkan halaman
```

---

## 🖥️ BACKEND — Peta Semua Endpoint API

### 📁 File: `backend/src/app.js`
### Base URL semua request dari frontend: `VITE_API_URL` (default: `/api`)

---

### Grup 1: Auth & Profil — `/api/auth/*`
**File Route:** `backend/src/routes/authRoutes.js`

| Method | Endpoint | Siapa | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register` | Publik | Daftar akun warga |
| POST | `/api/auth/register-rw` | Publik | Daftar akun RW |
| POST | `/api/auth/register-rt` | Publik | Daftar akun RT |
| POST | `/api/auth/login` | Publik | Login warga (rate limit 10x/15mnt) |
| POST | `/api/auth/login-rtrw` | Publik | Login RT/RW (rate limit 10x/15mnt) |
| POST | `/api/auth/logout` | Login | Logout |
| GET  | `/api/auth/check-session` | Login | Cek validitas token |
| GET  | `/api/auth/profile` | Login | Ambil profil user |
| PUT  | `/api/auth/profile` | Login | Update profil + upload avatar |

> ℹ️ Ada juga alias mundur: `POST /api/auth/login-rt-rw` (dari `authRtRwRoutes.js`) — sama dengan `/login-rtrw`.

---

### Grup 2: Data Warga — `/api/warga/*`
**File Route:** `backend/src/routes/wargaRoutes.js`

| Method | Endpoint | Siapa | Fungsi |
|---|---|---|---|
| GET | `/api/warga/profil` | Warga | Ambil profil warga |
| GET | `/api/warga/kelengkapan-data` | Warga | Cek data warga sudah lengkap? |
| PUT | `/api/warga/lengkapi-data` | Warga | Lengkapi data (NIK, alamat, foto KTP) |
| GET | `/api/warga/profile` | Warga | Alias profil (endpoint baru) |
| PUT | `/api/warga/profile` | Warga | Update profil + avatar |

---

### Grup 3: Surat (Lama/v1) — `/api/surat/*`
**File Route:** `backend/src/routes/suratRoutes.js`

| Method | Endpoint | Siapa | Fungsi |
|---|---|---|---|
| POST | `/api/surat/ajukan` | Warga | Ajukan surat (upload file manual) |
| GET  | `/api/surat/milik-saya` | Warga | Daftar surat milik warga |
| GET  | `/api/surat/statistik` | Warga | Statistik surat warga |
| GET  | `/api/surat/masuk` | RT/RW | Lihat surat masuk |
| GET  | `/api/surat/menunggu-ttd` | RT/RW | Surat menunggu tanda tangan |
| POST | `/api/surat/tanda-tangani/:id` | RT/RW | Setujui + upload file surat bertanda |
| POST | `/api/surat/tolak/:id` | RT/RW | Tolak surat |
| GET  | `/api/surat/riwayat-rtrw` | RT/RW | Riwayat surat di RT/RW |
| POST | `/api/surat/offline` | RT/RW | Buat surat untuk warga datang langsung |
| GET  | `/api/surat/download/:filename` | Login | Download file surat |

> ⚠️ **Ini adalah sistem surat lama (v1)**. Saat ini sistem v2 (`/api/v2/letters/*`) yang aktif dipakai di frontend React.

---

### Grup 4: Tanda Tangan Digital RT/RW — `/api/ttd/*`
**File Route:** `backend/src/routes/ttdRtRwRoutes.js`

| Method | Endpoint | Siapa | Fungsi |
|---|---|---|---|
| POST | `/api/ttd/upload-ttd` | RT/RW | Upload gambar tanda tangan digital |
| GET  | `/api/ttd/current-ttd` | RT/RW | Ambil TTD yang tersimpan |

---

### Grup 5: Superadmin — `/api/superadmin/*`
**File Route:** `backend/src/routes/superAdminRoutes.js`  
> Semua endpoint dilindungi guard: `verifyToken + requireSuperadmin + auditLogger`

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/superadmin/register` | Daftar akun superadmin |
| POST | `/api/superadmin/login` | Login superadmin |
| GET  | `/api/superadmin/dashboard` | Statistik dashboard |
| GET  | `/api/superadmin/dashboard-stats` | Alias statistik |
| GET  | `/api/superadmin/stats/warga/:rw_id` | Statistik warga per RW |
| GET  | `/api/superadmin/rt` | Daftar semua RT |
| GET  | `/api/superadmin/rw` | Daftar semua RW |
| DELETE | `/api/superadmin/users/:role/:id` | Hapus akun RT/RW |
| PATCH | `/api/superadmin/users/:role/:id/reset-password` | Reset password |
| PATCH | `/api/superadmin/users/:role/:id/toggle-active` | Aktif/nonaktifkan akun |
| GET  | `/api/superadmin/config` | Baca konfigurasi instansi |
| PUT  | `/api/superadmin/config` | Update konfigurasi instansi |
| GET  | `/api/superadmin/logs` | Ambil log audit |
| GET  | `/api/superadmin/templates` | Daftar template surat |
| POST | `/api/superadmin/templates` | Buat template baru |
| PUT  | `/api/superadmin/templates/:id` | Edit template |
| DELETE | `/api/superadmin/templates/:id` | Hapus template |
| GET  | `/api/superadmin/templates/:id/preview` | Preview template |

---

### Grup 6: Template Surat — `/api/template-surat/*`
**File Route:** `backend/src/routes/templateSuratRoutes.js`

| Method | Endpoint | Siapa | Fungsi |
|---|---|---|---|
| GET | `/api/template-surat/` | Publik | Daftar semua template |
| POST | `/api/template-surat/` | Superadmin | Upload template baru |
| DELETE | `/api/template-surat/:id` | Superadmin | Hapus template |
| GET | `/api/template-surat/:id/download` | Login | Download file template |

---

### Grup 7: Notifikasi — `/api/notifications/*`
**File Route:** `backend/src/routes/notificationRoutes.js`  
> Bisa dipakai oleh semua role (warga, RT, RW, superadmin) asalkan punya JWT valid.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET   | `/api/notifications/` | Ambil semua notifikasi milik user |
| PATCH | `/api/notifications/:id/read` | Tandai satu notifikasi sudah dibaca |
| PATCH | `/api/notifications/read-all` | Tandai semua notifikasi sudah dibaca |

---

### Grup 8: ⭐ Surat V2 (AKTIF DIPAKAI) — `/api/v2/letters/*`
**File Route:** `backend/src/modules/letters/letters.routes.js`  
**Controller:** `backend/src/modules/letters/letters.controller.js`

#### 8a. Public (Tanpa Auth)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v2/letters/types` | Ambil semua jenis surat yang tersedia |
| GET | `/api/v2/letters/types/:typeId/fields` | Ambil field dinamis untuk jenis surat tertentu |
| GET | `/api/v2/letters/workflows` | Ambil pilihan alur persetujuan (RT saja / RT+RW) |
| GET | `/api/v2/letters/verify/:qrToken` | Verifikasi keaslian surat via QR token |

#### 8b. Warga Only

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/v2/letters/drafts` | Simpan draft surat baru |
| POST | `/api/v2/letters/:uuid/submit` | Submit draft → status: submitted |
| POST | `/api/v2/letters/:uuid/upload-pdf` | Upload hasil render PDF dari client |
| POST | `/api/v2/letters/:uuid/attachments` | Upload lampiran (max 10 file) ke Supabase |

#### 8c. RT/RW Only

| Method | Endpoint | Fungsi |
|---|---|---|
| GET  | `/api/v2/letters/inbox` | Ambil inbox surat masuk sesuai role & tenant |
| POST | `/api/v2/letters/:uuid/approve` | Setujui surat + lampirkan TTD digital |
| POST | `/api/v2/letters/:uuid/reject` | Tolak surat |

#### 8d. Shared (Warga + RT/RW)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v2/letters/` | Daftar surat milik warga |
| GET | `/api/v2/letters/:uuid` | Detail satu surat |
| GET | `/api/v2/letters/:uuid/preview-pdf` | Ambil/generate PDF preview |

---

### Grup 9: Public Verifikasi — `/api/v2/public/*`
**File Route:** `backend/src/modules/public/public.routes.js`

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v2/public/letters/:uuid/verify` | Verifikasi surat lewat UUID (alternatif QR) |

---

### Grup 10: Dashboard RT/RW — `/api/dashboard-rt-rw`
**File Route:** `backend/src/routes/dashboardRtRwRoutes.js`

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/dashboard-rt-rw` | Ambil data selamat datang RT/RW |

---

## 🔄 Alur Fitur Utama

---

### Alur 1: Warga Mengajukan Surat (Wizard V2)

```
Warga buka /warga/buat-surat-v2
        ↓
LetterWizardPage.jsx render
        ↓
[STEP 1] Pilih Jenis Surat
  → GET /api/v2/letters/types
  → State: selectedType
        ↓
[STEP 2] Isi Data Dinamis (field sesuai jenis surat)
  → GET /api/v2/letters/types/:typeId/fields
  → State: fieldValues{}
        ↓
[STEP 3] Isi Keperluan & Subjek Surat
  → State: letterContent { subject, purpose }
        ↓
[STEP 4] Upload Lampiran (opsional, max 10 file)
  → State: attachments[]
        ↓
[STEP 5] Pilih Alur Persetujuan
  → GET /api/v2/letters/workflows
  → Pilihan: "RT Saja" atau "RT + RW"
  → State: selectedWorkflow
        ↓
Live Preview PDF selalu aktif di panel kanan (dekstop)
atau via modal di mobile
        ↓
Klik "Kirim Pengajuan"
  → Validasi: selectedType, subject, purpose, selectedWorkflow wajib ada
  → Cek profil warga: NIK, no_hp, alamat harus terisi
        ↓
Tampil ConfirmationModal
        ↓
Konfirmasi → handleConfirmSubmit():
  Step 0: POST /api/v2/letters/drafts → dapat UUID
  Step 1: POST /api/v2/letters/:uuid/attachments (jika ada lampiran)
  Step 2: POST /api/v2/letters/:uuid/submit → status: submitted
        ↓
Tampil Step8Success (layar sukses)
```

**Hook yang dipakai:** `useLetterWizard.js`  
**Komponen wizard:** `Step1-5` + `Step8Success` di `features/letters/components/wizard/`

---

### Alur 2: RT/RW Memproses Surat Masuk

```
RT/RW buka /rtrw/inbox
        ↓
LetterInboxPage.jsx render
  → GET /api/v2/letters/inbox (auto-refresh setiap 30 detik)
  → Filter tab: Semua / Menunggu / Diproses
        ↓
Klik satu surat → navigate ke /rtrw/surat/:uuid
        ↓
LetterDetailPage.jsx render
  → GET /api/v2/letters/:uuid → detail lengkap + riwayat approval
  → GET /api/ttd/current-ttd → ambil TTD digital RT/RW
        ↓
Tampil:
  - StatusTimeline (progress surat)
  - SignatureStatusCard (siapa saja yang sudah TTD)
  - TtdApprovalPanel (panel aksi approve/reject) ← hanya muncul jika canApprove
        ↓
Kondisi canApprove:
  RT dapat approve jika status: submitted | in_review_rt
  RW dapat approve jika status: approved_rt | in_review_rw
        ↓
Klik "Setujui Surat":
  → POST /api/v2/letters/:uuid/approve { notes, signature_url }
  → Status berubah sesuai workflow
        ↓
Klik "Tolak Surat":
  → POST /api/v2/letters/:uuid/reject { notes }
  → Status berubah menjadi rejected
```

---

### Alur 3: Status Surat V2 (LETTER_STATUS_V2)

```
draft
  ↓ (submit)
submitted             ← Menunggu RT
  ↓ (RT approve)
approved_rt / in_review_rt
  ↓
  ├── Jika workflow RT_ONLY → completed ✅
  └── Jika workflow RT+RW  → approved_rt
                               ↓ (RW approve)
                            in_review_rw
                               ↓
                            completed ✅

Di mana saja bisa → rejected ❌ atau revision_requested atau cancelled
```

**Semua status label ada di:** `frontend/src/constants/suratStatus.js`

---

### Alur 4: Verifikasi QR Code

```
Scan QR code → buka browser → /verify/:qrToken
        ↓
QrVerifyPage.jsx (tanpa login)
  → GET /api/v2/letters/verify/:qrToken
        ↓
Backend cek tabel letters WHERE qr_token = ?
        ↓
Tampil:
  valid=true  → Info surat (nama, jenis, no surat, tanggal selesai, status) ✅
  valid=false → "Surat tidak valid / token tidak ditemukan" ❌
```

---

### Alur 5: Superadmin Kelola Template Surat

```
Superadmin buka /superadmin/template-md
        ↓
TemplateSuratMarkdown.jsx
  → GET /api/superadmin/templates → daftar template
        ↓
Buat template baru:
  → POST /api/superadmin/templates (isi konten Markdown)
        ↓
Edit template:
  → PUT /api/superadmin/templates/:id
        ↓
Preview template:
  → GET /api/superadmin/templates/:id/preview
        ↓
Hapus template:
  → DELETE /api/superadmin/templates/:id
```

---

### Alur 6: RT/RW Upload Tanda Tangan Digital

```
RT/RW buka /rtrw/ttd
        ↓
TtdSurat.jsx
  → GET /api/ttd/current-ttd → cek TTD yang tersimpan
        ↓
Upload TTD baru:
  → POST /api/ttd/upload-ttd (multipart/form-data, field: ttdImage)
        ↓
TTD tersimpan → akan otomatis dilampirkan saat approve surat
```

---

## 🧱 Struktur Middleware Backend

| Middleware | File | Fungsi |
|---|---|---|
| `verifyToken` | `middlewares/authMiddleware.js` | Verifikasi JWT warga/umum |
| `authRtRwMiddleware` | `middlewares/authRtRwMiddleware.js` | Verifikasi JWT + cek role RT/RW |
| `requireSuperadmin` | `middlewares/superAdminMiddleware.js` | Pastikan role superadmin |
| `auditLogger` | `middlewares/auditLogger.js` | Catat semua aksi superadmin ke log |
| `uploadAvatar` | `middlewares/upload.js` | Multer untuk avatar |
| `uploadKtp` | `middlewares/upload.js` | Multer untuk foto KTP |
| `uploadSurat` | `middlewares/upload.js` | Multer untuk file surat |
| `uploadTtd` | `middlewares/upload.js` | Multer untuk gambar TTD |
| `validateSurat` | `middlewares/validateSurat.js` | Validasi body ajukan surat |
| `errorHandler` | `middlewares/errorHandler.js` | Global error handler (paling akhir) |

---

## 📁 Peta Struktur Folder Lengkap

```
capstone_RT-RW_CORETAX/
├── frontend/src/
│   ├── App.jsx                          ← ROUTING UTAMA FRONTEND
│   ├── main.jsx                         ← Entry point React
│   ├── utils/api.js                     ← HTTP Client (fetch wrapper)
│   ├── context/AuthContext.jsx          ← State login global
│   ├── components/
│   │   ├── ProtectedRoute.jsx           ← Guard route berdasarkan role
│   │   ├── layout/DashboardLayout.jsx   ← Layout sidebar+topbar
│   │   └── ui/                          ← Komponen UI reusable
│   │       ├── ConfirmationModal.jsx
│   │       ├── WizardStepper.jsx
│   │       ├── StatusTimeline.jsx
│   │       ├── RejectionBanner.jsx
│   │       ├── SubmitOverlay.jsx
│   │       └── ProfileWarningBanner.jsx
│   ├── constants/suratStatus.js         ← Semua label & warna status surat
│   ├── features/letters/                ← Fitur Surat V2
│   │   ├── hooks/useLetterWizard.js     ← State management wizard
│   │   ├── pages/
│   │   │   ├── LetterWizardPage.jsx     ← Halaman buat surat
│   │   │   ├── LetterDetailPage.jsx     ← Detail + approve/reject
│   │   │   ├── LetterListPage.jsx       ← Riwayat surat
│   │   │   ├── LetterInboxPage.jsx      ← Inbox RT/RW
│   │   │   └── QrVerifyPage.jsx         ← Verifikasi QR
│   │   └── components/
│   │       ├── wizard/Step1-8*.jsx      ← Komponen per langkah wizard
│   │       ├── shared/DynamicField.jsx  ← Field dinamis form
│   │       └── pdf/LetterPdfTemplate.jsx← Template PDF surat
│   └── pages/
│       ├── LandingPage.jsx
│       ├── ProfilePage.jsx
│       ├── auth/LoginWarga.jsx, LoginRtRw.jsx, dll.
│       ├── warga/Dashboard.jsx
│       ├── rtrw/Dashboard.jsx, TtdSurat.jsx
│       └── superadmin/Dashboard.jsx, ManajemenAkun.jsx, dll.
│
└── backend/src/
    ├── app.js                           ← ROUTING UTAMA BACKEND
    ├── server.js                        ← Entry point Express
    ├── routes/                          ← Route lama (v1 + auth + dll)
    │   ├── authRoutes.js
    │   ├── suratRoutes.js
    │   ├── wargaRoutes.js
    │   ├── ttdRtRwRoutes.js
    │   ├── superAdminRoutes.js
    │   ├── templateSuratRoutes.js
    │   ├── notificationRoutes.js
    │   └── dashboardRtRwRoutes.js
    ├── modules/                         ← Sistem modular (v2)
    │   ├── letters/
    │   │   ├── letters.routes.js        ← /api/v2/letters/*
    │   │   ├── letters.controller.js
    │   │   ├── letters.service.js
    │   │   ├── letters.model.js
    │   │   └── sub-modules/
    │   │       ├── approvals/approvals.service.js  ← Logic approve/reject
    │   │       ├── attachments/attachments.service.js
    │   │       └── pdf/pdf.service.js + pdf.queue.js
    │   └── public/
    │       ├── public.routes.js         ← /api/v2/public/*
    │       └── public.controller.js
    ├── controllers/                     ← Controller v1
    ├── services/                        ← Service v1
    ├── models/                          ← Model v1
    ├── middlewares/                     ← Semua middleware
    └── config/
        ├── db.js                        ← Koneksi MySQL (pool)
        ├── supabase.js                  ← Storage Supabase (lampiran)
        ├── queue.js                     ← Bull queue (PDF async)
        └── swagger.js                   ← Dokumentasi API → /api/docs
```

---

## 💡 Tips Cepat

1. **Mau tambah halaman baru?**  
   → Buka `frontend/src/App.jsx`, tambah `<Route>` di bagian yang sesuai role-nya.

2. **Mau tambah endpoint baru?**  
   → Buka file route yang sesuai di `backend/src/routes/` atau `backend/src/modules/letters/letters.routes.js`, lalu tambah method + controller.

3. **Mau lihat semua API secara interaktif?**  
   → Buka `http://localhost:3000/api/docs` (Swagger UI) saat backend jalan.

4. **Status surat berubah di mana?**  
   → Logic ada di `backend/src/modules/letters/sub-modules/approvals/approvals.service.js`

5. **Lampiran disimpan di mana?**  
   → Supabase Storage bucket `sipraga-storage` (configured di `backend/src/config/supabase.js`)

6. **Autentikasi menggunakan apa?**  
   → JWT. Secret ada di `backend/.env` → `JWT_SECRET`. Token expire dicek di `AuthContext.jsx`.
