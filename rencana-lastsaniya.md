# 📋 RENCANA PENGEMBANGAN SIPRAGA V2
> Dokumen ini adalah panduan teknis sprint pengembangan fitur baru.  
> Dibuat berdasarkan kode aktual di branch backup-supabase.  
> Terakhir diperbarui: Juni 2026

---

## 🗺️ Ringkasan Fitur yang Harus Dikerjakan

| # | Fitur | Role | Status | Prioritas |
|---|---|---|---|---|
| 1 | Letter Detail — status TTD + download | Warga | ⚠️ Perlu perbaikan | 🔴 Tinggi |
| 2 | Profil terhubung data registrasi | Warga + RT/RW | ❌ Belum terhubung | 🔴 Tinggi |
| 3 | Ajukan surat scroll + preview PDF | Warga | ✅ Wizard ada, cek bug | 🟡 Sedang |
| 4 | Frontend Letterbox (inbox warga) | Warga | ⚠️ Ada tapi link salah | 🔴 Tinggi |
| 5 | Notifikasi terhubung RT/RW | Semua | ⚠️ Backend ada, frontend perlu fix | 🟡 Sedang |
| 6 | Detail surat RT/RW + TTD | RT/RW | ⚠️ Parsial | 🔴 Tinggi |
| 7 | Profil RT/RW terhubung | RT/RW | ❌ Belum | 🔴 Tinggi |
| 8 | Frontend Letter Inbox RT/RW | RT/RW | ⚠️ Ada tapi link salah | 🔴 Tinggi |
| 9 | Buat surat pengantar RT/RW + preview | RT/RW | ✅ Wizard bisa dipakai | 🟡 Sedang |
| 10 | Riwayat surat terhubung | RT/RW | ⚠️ List ada, data kosong | 🟡 Sedang |
| 11 | Dashboard Superadmin (data desa) | Superadmin | ✅ Ada, perlu perkaya | 🟢 Rendah |
| 12 | Manajemen Akun RT/RW | Superadmin | ✅ Ada | 🟢 Rendah |
| 13 | Konfigurasi Instansi | Superadmin | ✅ Ada | 🟢 Rendah |
| 14 | Log Sistem | Superadmin | ✅ Ada | 🟢 Rendah |
| 15 | Template Surat Markdown | Superadmin | ✅ Ada, perlu validasi | 🟡 Sedang |

---

## 🔴 FITUR PRIORITAS TINGGI

---

### 1. Letter Detail — Status TTD + Download (Warga)

**File yang diubah:**
- `frontend/src/features/letters/pages/LetterDetailPage.jsx`

**Kondisi saat ini:**
Komponen `SignatureStatusCard` sudah ada di file ini dan menampilkan status TTD (sudah/belum ditandatangani RT & RW). Komponen ini sudah benar secara logika. **Yang masih kurang:**
1. Tombol download PDF final untuk warga belum ada atau tersembunyi
2. Preview iframe PDF belum tampil dengan benar
3. Halaman ini belum dipanggil dari LetterListPage dengan link yang tepat

**Yang harus dikerjakan:**

```jsx
// Di LetterDetailPage.jsx — tambahkan seksi download untuk warga
// Cari bagian SignatureStatusCard, tambahkan di bawahnya:

function DownloadSection({ letter, userRole }) {
  const pdfVersions = letter?.pdf_versions || [];
  const finalPdf = pdfVersions.find(p => p.type === 'final');
  const signedRtPdf = pdfVersions.find(p => p.type === 'signed_rt');
  const previewPdf = pdfVersions.find(p => p.type === 'preview');

  // Hanya tampilkan kalau status completed
  if (letter?.status !== 'completed' && letter?.status !== 'approved_rt') return null;

  const downloadUrl = finalPdf?.file_url || signedRtPdf?.file_url;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-emerald-800 mb-3">📄 Unduh Surat</p>
      {downloadUrl ? (
        <>
          {/* Preview iframe */}
          <iframe
            src={downloadUrl}
            className="w-full h-80 rounded-lg border border-emerald-200 mb-3"
            title="Preview Surat"
          />
          <a
            href={downloadUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
          >
            ⬇️ Download Surat PDF
          </a>
        </>
      ) : (
        <p className="text-sm text-emerald-600">Surat sedang diproses, silakan cek kembali nanti.</p>
      )}
    </div>
  );
}
```

**Di bagian render utama LetterDetailPage, tambahkan setelah `<SignatureStatusCard>`:**
```jsx
<DownloadSection letter={letter} userRole={user?.role} />
```

**Fix link di LetterListPage:**
```jsx
// frontend/src/features/letters/pages/LetterListPage.jsx
// Baris yang ada Link ke detail surat — pastikan pathnya benar:
// Untuk warga: /warga/surat/${letter.uuid}
// Untuk RT/RW: /rtrw/surat/${letter.uuid}

// Gunakan useAuth untuk tahu role:
import { useAuth } from '../../../context/AuthContext';
const { user } = useAuth();
const detailPath = user?.role === 'warga'
  ? `/warga/surat/${letter.uuid}`
  : `/rtrw/surat/${letter.uuid}`;
```

---

### 2. Profil Warga Terhubung Data Registrasi

**File yang diubah:**
- `frontend/src/pages/ProfilePage.jsx`
- `backend/src/controllers/ProfileController.js`
- `backend/src/routes/wargaRoutes.js` (atau authRoutes)

**Kondisi saat ini:**
`ProfilePage.jsx` sudah ada form dengan semua field yang benar (NIK, nama, tempat_lahir, dll). **Masalahnya:** query ke backend `GET /api/profile` mungkin tidak mengembalikan data yang sama seperti saat register, atau endpoint belum ada.

**Yang harus dikerjakan:**

Cek backend `ProfileController.js`:
```js
// backend/src/controllers/ProfileController.js
// Pastikan endpoint GET /api/profile mengembalikan SEMUA field ini:
// nama, email, no_hp, alamat, NIK, tempat_lahir, tanggal_lahir,
// jenis_kelamin, agama, status_perkawinan, pekerjaan, rt, rw,
// kelurahan_desa, kecamatan, kota, provinsi

// Query yang benar:
const getProfile = async (req, res) => {
  const id = req.user.id_warga; // dari JWT payload
  const [rows] = await pool.query(
    `SELECT id_warga, nama, email, no_hp, alamat, NIK,
            tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
            status_perkawinan, pekerjaan, rt, rw,
            kelurahan_desa, kecamatan, kota, provinsi, avatar_url
     FROM warga WHERE id_warga = ?`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  res.json({ success: true, data: rows[0] });
};
```

**Di ProfilePage.jsx — pastikan query key dan fetch sudah benar:**
```jsx
const { data: profile, isLoading } = useQuery({
  queryKey: ['profile'],
  queryFn: async () => {
    const { data, error } = await api.get('/profile'); // atau /warga/profile
    if (error) throw new Error(error);
    return data?.data;
  },
});

// Setelah data berhasil di-fetch, populate form:
useEffect(() => {
  if (profile) {
    reset(profile); // react-hook-form reset dengan data dari server
  }
}, [profile, reset]);
```

**Cek route di backend — pastikan ada:**
```js
// backend/src/routes/wargaRoutes.js atau authRoutes.js
router.get('/profile', authMiddleware.verifyToken, ProfileController.getProfile);
router.put('/profile', authMiddleware.verifyToken, ProfileController.updateProfile);
```

**Untuk RT/RW profile** — endpoint terpisah karena tabel berbeda:
```js
// backend/src/routes/authRtRwRoutes.js — tambahkan:
router.get('/profile', authRtRwMiddleware, RtRwProfileController.getProfile);
router.put('/profile', authRtRwMiddleware, RtRwProfileController.updateProfile);
// Query ke tabel rt atau rw sesuai role
```

---

### 4. Frontend Letterbox / Inbox Warga

**File yang diubah:**
- `frontend/src/features/letters/pages/LetterInboxPage.jsx`

**Kondisi saat ini:**
File `LetterInboxPage.jsx` sudah ada. **Masalahnya:**
1. Link di item inbox mengarah ke `/letters/${letter.uuid}` — ini **salah**, seharusnya `/warga/surat/${letter.uuid}` atau `/rtrw/surat/${letter.uuid}`
2. Halaman ini dipakai oleh warga **dan** RT/RW sekaligus — perlu dibedakan atau role-aware
3. Tidak ada empty state yang menarik

**Yang harus diperbaiki:**

```jsx
// frontend/src/features/letters/pages/LetterInboxPage.jsx

import { useAuth } from '../../../context/AuthContext';

export default function LetterInboxPage() {
  const { user } = useAuth();
  // ...

  // Fix link ke detail surat — gunakan path yang benar sesuai role
  const getDetailPath = (uuid) => {
    if (user?.role === 'warga') return `/warga/surat/${uuid}`;
    return `/rtrw/surat/${uuid}`;
  };

  // ...
  // Di dalam map, ganti:
  // to={`/letters/${letter.uuid}`}  ← SALAH
  // to={getDetailPath(letter.uuid)} ← BENAR
}
```

**Untuk warga**, inbox menampilkan notifikasi balik: surat disetujui, ditolak, minta revisi.  
**Untuk RT/RW**, inbox menampilkan surat masuk dari warga yang perlu diproses.

Backend endpoint sudah ada:
- `GET /api/v2/letters/inbox` — untuk RT/RW (surat masuk dari warga)
- `GET /api/notifications` — untuk warga (notifikasi status surat)

---

### 6. Detail Surat RT/RW — Preview + Verifikasi + TTD

**File yang diubah:**
- `frontend/src/features/letters/pages/LetterDetailPage.jsx`
- Komponen `TtdApprovalPanel` yang sudah ada di file yang sama

**Kondisi saat ini:**
`LetterDetailPage.jsx` sudah punya `TtdApprovalPanel` yang menampilkan tombol approve/reject. **Yang masih kurang:**
1. Preview PDF surat belum tampil dengan benar di modal
2. Tombol "Tandatangani" perlu memproses TTD yang sudah disimpan RT/RW
3. Status tanda tangan belum sync setelah aksi

**Yang harus dikerjakan:**

```jsx
// Di LetterDetailPage.jsx — tambahkan preview PDF sebelum TtdApprovalPanel
function PdfPreviewForRtRw({ letter }) {
  const pdfVersions = letter?.pdf_versions || [];
  const previewPdf = pdfVersions.find(p => p.type === 'preview');
  const finalPdf = pdfVersions.find(p => p.type === 'final');
  const pdfUrl = previewPdf?.file_url || finalPdf?.file_url;

  if (!pdfUrl) return (
    <div className="bg-slate-50 border rounded-xl p-6 text-center text-slate-400 text-sm">
      Preview surat belum tersedia. PDF sedang diproses...
    </div>
  );

  return (
    <div className="bg-white border border-surface-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">📄 Preview Surat</p>
        <a href={pdfUrl} target="_blank" rel="noreferrer"
           className="text-xs text-brand-500 font-medium hover:underline">
          Buka di tab baru ↗
        </a>
      </div>
      <iframe src={pdfUrl} className="w-full h-[500px]" title="Preview Surat" />
    </div>
  );
}
```

**Alur TTD yang benar:**
```
1. RT/RW buka LetterDetailPage (/rtrw/surat/:uuid)
2. Lihat preview PDF surat warga
3. Klik tombol "Setujui & Tandatangani"
4. Backend: POST /api/v2/letters/:uuid/approve
   → ambil TTD RT/RW dari tabel rt_rw_ttd
   → embed TTD ke PDF menggunakan pdf-lib
   → simpan PDF baru ke storage (Cloudinary/Supabase)
   → update status letter ke approved_rt atau approved_rw
   → trigger notifikasi ke warga
5. Frontend invalidate query dan refresh data
```

---

### 7. Profil RT/RW Terhubung Data Registrasi

Sama seperti poin 2, tapi untuk RT/RW. **Perbedaannya:**
- Data disimpan di tabel `rt` atau `rw` (bukan `warga`)
- Field yang ada: `username`, `nama_ketua`, `no_hp`, `no_rt`/`no_rw`, `kelurahan_desa`, dll
- Token JWT RT/RW punya payload: `{ id, username, nama, role: 'rt'/'rw' }`

**Yang harus dikerjakan:**

```js
// Buat backend/src/controllers/RtRwProfileController.js
const getProfile = async (req, res) => {
  const id = req.user.id; // dari JWT RT/RW
  const role = req.user.role; // 'rt' atau 'rw'
  const table = role === 'rt' ? 'rt' : 'rw';
  const idCol = role === 'rt' ? 'rt_id' : 'rw_id';

  const [rows] = await pool.query(
    `SELECT * FROM ${table} WHERE ${idCol} = ?`, [id]
  );
  res.json({ success: true, data: rows[0] });
};
```

**Di ProfilePage.jsx — handle dua kondisi:**
```jsx
// ProfilePage.jsx perlu tahu role user untuk fetch endpoint yang tepat
const { user } = useAuth();
const profileEndpoint = user?.role === 'warga' ? '/profile' : '/rtrw/profile';
```

---

### 8. Frontend Letter Inbox RT/RW

Sudah dijelaskan di poin 4. Tambahan khusus untuk RT/RW:

```jsx
// LetterInboxPage.jsx — untuk RT/RW
// Inbox RT/RW = surat dari warga yang menunggu diproses

// Tampilkan info ekstra: nama warga, NIK, jenis surat
// Tombol aksi langsung dari inbox (quick approve) atau klik untuk detail

// Badge urgency: surat yang sudah > 3 hari menunggu warna merah
const isUrgent = (createdAt) => {
  const diff = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  return diff > 3;
};
```

---

### 10. Riwayat Surat Terhubung (RT/RW)

**File yang diubah:**
- `frontend/src/features/letters/pages/LetterListPage.jsx`

**Kondisi saat ini:**
`LetterListPage.jsx` fetch dari `GET /api/v2/letters` — ini **sudah benar untuk warga**. Untuk RT/RW, endpoint yang sama bisa dipakai tapi perlu memfilter berdasarkan siapa yang memproses surat tsb.

**Perbaikan:**
```jsx
// LetterListPage.jsx
import { useAuth } from '../../../context/AuthContext';

export default function LetterListPage() {
  const { user } = useAuth();

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters-v2', user?.role],
    queryFn: async () => {
      // Warga: semua suratnya sendiri
      // RT/RW: surat yang pernah diproses olehnya (sudah approved/rejected)
      const { data, error } = await api.get('/v2/letters');
      if (error) throw new Error(error);
      return data?.data || [];
    },
  });

  // Link ke detail yang benar
  const getDetailPath = (uuid) =>
    user?.role === 'warga' ? `/warga/surat/${uuid}` : `/rtrw/surat/${uuid}`;
```

---

## 🟡 FITUR PRIORITAS SEDANG

---

### 3. Ajukan Surat — Scroll + Preview PDF (Warga)

**File yang relevan:**
- `frontend/src/features/letters/pages/LetterWizardPage.jsx`
- `frontend/src/features/letters/components/wizard/Step2FillData.jsx`
- `frontend/src/features/letters/components/wizard/Step6PdfPreview.jsx`

**Kondisi saat ini:**
Wizard 8 step sudah ada. Yang perlu dipastikan:
1. **Scroll otomatis** ke atas saat pindah step
2. **Step 6 (PDF Preview)** menampilkan iframe dengan benar setelah draft dibuat
3. Loading state yang jelas saat generate PDF

**Perbaikan LetterWizardPage.jsx:**
```jsx
// Tambahkan scroll to top saat step berubah
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [currentStep]);
```

**Perbaikan Step6PdfPreview.jsx:**
```jsx
// Step6PdfPreview.jsx
export default function Step6PdfPreview({ pdfUrl, isLoading }) {
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
      <p className="text-sm">Membuat preview surat...</p>
    </div>
  );

  if (!pdfUrl) return (
    <div className="text-center text-slate-400 py-12 text-sm">
      Preview tidak tersedia. Klik "Generate Preview" untuk melihat surat.
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden border border-surface-border shadow-sm">
      <iframe src={pdfUrl} className="w-full h-[600px]" title="Preview Surat" />
    </div>
  );
}
```

---

### 5. Notifikasi Terhubung RT/RW

**File yang relevan:**
- `frontend/src/components/NotificationBell.jsx` (sudah ada)
- `backend/src/services/NotificationService.js` (sudah ada)
- `backend/src/controllers/notificationController.js`

**Kondisi saat ini:**
`NotificationBell.jsx` sudah ada dan polling setiap 30 detik ke `GET /api/notifications`. Backend `NotificationService.js` bisa kirim email & WhatsApp. **Yang masih kurang:**
1. Notifikasi **in-app** (database) belum disimpan — hanya email/WA
2. Table `notifications` perlu dicek apakah sudah ada di database

**Cek database — apakah table notifications ada:**
```sql
-- Tambahkan ke database/init.sql kalau belum ada:
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  user_type   ENUM('warga', 'rt', 'rw') NOT NULL,
  type        VARCHAR(50) NOT NULL,
  -- 'NEW_LETTER', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  link        VARCHAR(255),
  -- Link ke halaman terkait, contoh: /warga/surat/uuid-xxx
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Pastikan di SuratService.js atau approvals.service.js memanggil:**
```js
// Setelah approve/reject, trigger notifikasi in-app:
await pool.query(
  `INSERT INTO notifications (user_id, user_type, type, title, message, link)
   VALUES (?, 'warga', 'APPROVED', 'Surat Disetujui',
           'Surat Anda telah disetujui oleh RT/RW. Silakan download.',
           ?)`,
  [letter.resident_id, `/warga/surat/${letter.uuid}`]
);
```

---

### 9. Buat Surat Pengantar RT/RW + Preview

Wizard yang sama dengan warga bisa dipakai untuk RT/RW (`/rtrw/buat-surat-v2`). Route sudah ada di `App.jsx`:
```jsx
<Route path="/rtrw/buat-surat-v2" element={sa(['rt', 'rw'], <LetterWizardPage />)} />
```

**Yang perlu dipastikan:**
- Wizard membaca role dari `useAuth()` dan menyesuaikan step (RT/RW tidak perlu pilih workflow)
- Template surat untuk RT/RW bisa berbeda (surat pengantar formal)
- Pastikan `tenant_id` di letter diisi berdasarkan RT/RW yang login

---

### 15. Template Surat Markdown (Superadmin)

**File yang relevan:**
- `frontend/src/pages/superadmin/TemplateSuratMarkdown.jsx`
- `backend/src/controllers/superAdminController.js` (fungsi `previewMarkdownTemplate`)

**Kondisi saat ini:**
Halaman sudah ada dengan editor Markdown + variabel hints. **Yang perlu diperbaiki:**
1. Preview PDF via iframe — pastikan endpoint `/superadmin/templates/:id/preview` berjalan
2. Koneksi template ke wizard warga — ketika warga memilih jenis surat, tampilkan template yang dibuat admin

**Alur yang benar:**
```
Superadmin buat template Markdown → disimpan ke letter_pdf_templates
→ Ketika PDF di-generate (pdf.service.js):
   1. Cari template di letter_pdf_templates WHERE letter_type_id = ?
   2. Render markdown ke HTML (menggunakan `marked`)
   3. Inject data warga ke Mustache variables
   4. Puppeteer generate PDF
```

---

## 🟢 FITUR SUPERADMIN (Sudah Ada, Perlu Verifikasi)

### 11. Dashboard Superadmin — Data Desa

**File:** `frontend/src/pages/superadmin/Dashboard.jsx`

Dashboard sudah ada dan menampilkan list RW. Klik RW akan fetch stats warga via `GET /api/superadmin/stats/warga/:rw_id`.

**Data yang sudah tersedia:**
- Total warga per RW
- Distribusi pekerjaan
- Status perkawinan
- Jumlah kepala keluarga (inferensi)

**Yang perlu ditambahkan:**
- Chart/visualisasi menggunakan Recharts (sudah ada di package.json)
- Data: berapa yang punya pekerjaan vs pengangguran
- Data pendidikan (jika ada field di database)

### 12–14. Manajemen Akun, Konfigurasi, Log Sistem

Semua sudah ada di `frontend/src/pages/superadmin/`. Pastikan:
- `ManajemenAkun.jsx`: dapat tambah RT/RW baru, reset password, toggle active
- `KonfigurasiInstansi.jsx`: dapat update nama desa, logo (upload ke Cloudinary)
- `LogSistem.jsx`: tampilkan audit trail dari `GET /api/superadmin/logs`

---

## 🎨 KONSISTENSI DESAIN FRONTEND

### Design Tokens yang Harus Dipakai

Semua halaman **wajib** menggunakan token dari `design-frontend.md`. Jangan gunakan warna arbitrary seperti `text-blue-700` langsung — gunakan class yang sudah didefinisikan.

**Palet warna:**
```
Brand utama   : bg-brand-500 (#0e84f5) atau bg-[#1e3a5f] untuk sidebar
Surface card  : bg-white border border-surface-border
Background    : bg-surface (atau bg-slate-50)
Teks utama    : text-ink (atau text-slate-800)
Teks sekunder : text-ink-secondary (atau text-slate-500)
```

**Komponen wajib konsisten:**

| Komponen | Kelas wajib |
|---|---|
| Card/panel | `bg-white rounded-xl border border-slate-200 shadow-sm p-4` |
| Button primary | `bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600` |
| Button sekunder | `bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200` |
| Badge status | `text-xs px-2.5 py-1 rounded-full font-bold border` |
| Heading halaman | `text-2xl font-bold text-slate-800` |
| Sub-heading | `text-sm font-semibold text-slate-500 uppercase tracking-wider` |
| Input | `w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500` |

**Aturan layout:**
- Semua halaman warga: `max-w-5xl mx-auto p-4 md:p-6`
- Semua halaman RT/RW: `max-w-5xl mx-auto p-4 md:p-6`
- Halaman superadmin: `max-w-7xl mx-auto p-6`

---

## 🔄 ALUR LENGKAP SISTEM

### Alur Warga Mengajukan Surat

```
1. Warga login → /login-warga
2. Dashboard → klik "Ajukan Surat Baru" → /warga/buat-surat-v2
3. LetterWizardPage:
   Step 1: Pilih jenis surat (dari GET /api/v2/letters/types)
   Step 2: Isi data (form dinamis dari GET /api/v2/letters/types/:id/fields)
   Step 3: Tulis konten/keperluan
   Step 4: Upload lampiran (KTP, KK, dll)
   Step 5: Pilih workflow (RT saja / RT → RW)
   Step 6: Preview PDF (POST draft → generate PDF)
   Step 7: Konfirmasi & kirim (POST /api/v2/letters/:uuid/submit)
   Step 8: Sukses — tampilkan UUID
4. Warga bisa pantau di /warga/riwayat (LetterListPage)
5. Notifikasi masuk kalau ada update status
6. Kalau selesai: /warga/surat/:uuid → download PDF final
```

### Alur RT/RW Memproses Surat

```
1. RT/RW login → /login-rtrw
2. Dashboard → lihat surat masuk terbaru
3. Klik "Tugas & Kotak Masuk" → /rtrw/inbox (LetterInboxPage)
4. Klik surat → /rtrw/surat/:uuid (LetterDetailPage)
5. Lihat preview PDF + data warga
6. Klik "Setujui & Tandatangani" → 
   Backend: POST /api/v2/letters/:uuid/approve
   → embed TTD ke PDF
   → kirim notifikasi ke warga
7. Atau klik "Tolak" → isi alasan → status = rejected
8. Riwayat bisa dilihat di /rtrw/riwayat-v2
```

### Alur Superadmin

```
1. Superadmin login → /login-superadmin (atau route yang ada)
2. Dashboard → list RW, klik untuk detail statistik warga
3. Manajemen Akun → tambah/hapus RT/RW, reset password
4. Template Surat → buat template Markdown dengan variabel Mustache
                  → preview PDF sebelum publish
5. Konfigurasi → atur nama desa, logo kop surat
6. Log Sistem → pantau semua aktivitas
```

---

## 🐛 BUG YANG HARUS DIPERBAIKI SEBELUM LANJUT

### Bug Kritis

1. **`LetterInboxPage.jsx` link salah** — semua link ke `/letters/${uuid}` harusnya dinamis sesuai role
2. **`LetterListPage.jsx` link salah** — sama, harus gunakan `useAuth()` untuk tentukan path
3. **`utils/api.js` duplikat method** — ada `put` dan `patch` yang didefinisikan dua kali (satu dengan implementasi, satu kosong `/* same pattern */`)
4. **Notifikasi di-email `CORETAX`** — template email masih pakai nama "CORETAX" bukan "SIPRAGA" — perlu diganti di `NotificationService.js`

### Bug Non-Kritis

5. **`LetterWizardPage.jsx`** tidak scroll ke atas saat pindah step
6. **ProfilePage.jsx** — field `rt` dan `rw` termark `editable: false` tapi belum tentu muncul di tampilan edit

---

## 📁 STRUKTUR FILE LENGKAP

```
capstone_SIPRAGA_V2/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                              ← Routing utama (sudah lengkap)
│   │   ├── context/AuthContext.jsx              ← JWT decode + login/logout
│   │   ├── utils/api.js                         ← HTTP client (ADA BUG duplikat)
│   │   ├── components/
│   │   │   ├── layout/DashboardLayout.jsx       ← Sidebar + topbar (sudah lengkap)
│   │   │   ├── NotificationBell.jsx             ← Bell notif (perlu backend fix)
│   │   │   └── ProtectedRoute.jsx               ← Guard route
│   │   ├── features/letters/
│   │   │   ├── pages/
│   │   │   │   ├── LetterDetailPage.jsx         ← Detail surat (perlu download+preview)
│   │   │   │   ├── LetterInboxPage.jsx          ← Inbox (perlu fix link)
│   │   │   │   ├── LetterListPage.jsx           ← Riwayat (perlu fix link + role)
│   │   │   │   └── LetterWizardPage.jsx         ← Wizard 8-step
│   │   │   ├── components/wizard/
│   │   │   │   ├── Step1PickTemplate.jsx        ← Pilih jenis surat
│   │   │   │   ├── Step2FillData.jsx            ← Form dinamis
│   │   │   │   ├── Step3ContentBuilder.jsx      ← Drag-drop konten
│   │   │   │   ├── Step4Attachments.jsx         ← Upload lampiran
│   │   │   │   ├── Step5PickWorkflow.jsx        ← Pilih RT/RW
│   │   │   │   ├── Step6PdfPreview.jsx          ← Preview PDF (perlu fix)
│   │   │   │   ├── Step7Confirm.jsx             ← Konfirmasi
│   │   │   │   └── Step8Success.jsx             ← Sukses
│   │   │   └── hooks/useLetterWizard.js         ← State wizard
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginWarga.jsx
│   │   │   │   ├── RegisterWarga.jsx
│   │   │   │   ├── LoginRtRw.jsx
│   │   │   │   └── RegisterRtRw.jsx
│   │   │   ├── warga/Dashboard.jsx              ← Dashboard warga (sudah OK)
│   │   │   ├── rtrw/
│   │   │   │   ├── Dashboard.jsx                ← Dashboard RT/RW (sudah OK)
│   │   │   │   └── TtdSurat.jsx                 ← Upload/draw TTD (sudah OK)
│   │   │   ├── superadmin/
│   │   │   │   ├── Dashboard.jsx                ← Stats desa
│   │   │   │   ├── ManajemenAkun.jsx
│   │   │   │   ├── KonfigurasiInstansi.jsx
│   │   │   │   ├── LogSistem.jsx
│   │   │   │   └── TemplateSuratMarkdown.jsx    ← Template MD + preview
│   │   │   └── ProfilePage.jsx                  ← Profil (perlu fix endpoint)
│   │   └── services/
│   │       ├── authService.js
│   │       ├── suratService.js
│   │       ├── templateService.js
│   │       └── ttdService.js
│
└── backend/
    ├── src/
    │   ├── app.js                               ← Express setup
    │   ├── server.js                            ← Entry point
    │   ├── config/
    │   │   ├── db.js                            ← MySQL pool
    │   │   └── supabase.js                      ← Supabase client
    │   ├── controllers/
    │   │   ├── authController.js                ← Login/register semua role
    │   │   ├── ProfileController.js             ← GET/PUT profile warga
    │   │   ├── superAdminController.js          ← Semua fungsi superadmin
    │   │   ├── notificationController.js        ← CRUD notifikasi
    │   │   └── wargaController.js
    │   ├── middlewares/
    │   │   ├── authMiddleware.js                ← Guard warga (verifyToken)
    │   │   ├── authRtRwMiddleware.js            ← Guard RT/RW
    │   │   └── superAdminMiddleware.js          ← Guard superadmin
    │   ├── modules/letters/
    │   │   ├── letters.controller.js            ← Handler V2 letter CRUD
    │   │   ├── letters.model.js                 ← Query MySQL letters
    │   │   ├── letters.routes.js                ← Routes /api/v2/letters
    │   │   ├── letters.service.js               ← Business logic
    │   │   └── sub-modules/
    │   │       ├── approvals/approvals.service.js ← Approve/reject
    │   │       ├── attachments/attachments.service.js
    │   │       └── pdf/
    │   │           ├── pdf.service.js           ← Generate PDF (Puppeteer)
    │   │           └── pdf.queue.js             ← BullMQ job
    │   ├── routes/
    │   │   ├── authRoutes.js                    ← /api/auth/*
    │   │   ├── authRtRwRoutes.js                ← /api/auth/rtrw/*
    │   │   ├── notificationRoutes.js            ← /api/notifications
    │   │   ├── superAdminRoutes.js              ← /api/superadmin/*
    │   │   └── suratRoutes.js                   ← /api/surat/* (V1, legacy)
    │   └── services/
    │       ├── AuthService.js                   ← Login/register logic
    │       ├── NotificationService.js           ← Email + WhatsApp (Fonnte)
    │       └── SuratService.js                  ← V1 surat service
    └── database/
        ├── init.sql                             ← Schema V2 letters
        ├── 00-base.sql                          ← Schema dasar (warga, rt, rw)
        └── seed.sql                             ← Data dummy
```