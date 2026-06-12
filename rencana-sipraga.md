# Rencana Pengembangan SIPRAGA V2
> Roadmap teknis berdasarkan gap analisis kode aktual  
> Terakhir diperbarui: Juni 2026

---

## Ringkasan Status Saat Ini

| Fitur | Status | Prioritas Fix |
|---|---|---|
| Auth semua role | ✅ Selesai | — |
| Pengajuan surat V1 | ✅ Selesai | — |
| Notifikasi email + WA | ✅ Selesai | — |
| Dashboard RT/RW | ✅ Selesai | — |
| Upload TTD digital | ✅ Selesai | — |
| Letter Wizard Step 1–7 frontend | 🟡 Partial | 🔴 Tinggi |
| PDF preview Step 6 (integrasi) | 🟡 Backend ada | 🔴 Tinggi |
| Canvas signature pad | ⏳ Belum | 🟡 Sedang |
| BullMQ + Redis queue | 🟡 File ada | 🔴 Tinggi |
| QrVerifyPage | ⏳ Stub | 🟡 Sedang |
| Tenant ID auto dari JWT | ⏳ Belum | 🟡 Sedang |
| ProfilePage integrasi | 🟡 Halaman ada | 🔴 Tinggi |

---

## Sprint 1 — Stabilisasi Core (Estimasi: 1 minggu)

Fokus: benerin hal yang sudah 90% jadi tapi belum nyambung.

---

### 1.1 Perbaikan ProfilePage

**Problem:** `ProfilePage.jsx` ada tapi data warga tidak otomatis terhubung dari data registrasi.

**File yang diubah:**
```
frontend/src/pages/ProfilePage.jsx
frontend/src/services/wargaService.js
backend/src/controllers/ProfileController.js
backend/src/routes/wargaRoutes.js
```

**Task:**
- [ ] `wargaService.js` → tambah `getProfile()` yang call `GET /api/warga/profile`
- [ ] `ProfilePage.jsx` → gunakan `useQuery` dari TanStack Query untuk fetch profil
- [ ] Tampilkan semua field warga: nama, NIK, email, no_hp, alamat, foto KTP
- [ ] Form update profil dengan `react-hook-form` + `zod` (konsisten dengan wizard)
- [ ] `ProfileController.js` → pastikan endpoint `GET /api/warga/profile` return semua field termasuk `no_hp`
- [ ] Tambah validasi NIK 16 digit di form (reuse `AuthService.validateNik()`)

**Endpoint yang dipakai:**
```
GET  /api/warga/profile   → authMiddleware.js
PUT  /api/warga/profile   → authMiddleware.js
```

---

### 1.2 Koneksi Redis untuk BullMQ

**Problem:** `pdf.queue.js` dan `config/queue.js` sudah ada tapi Redis belum terkonfigurasi, sehingga PDF generation queue tidak berjalan.

**File yang diubah:**
```
backend/src/config/queue.js
backend/.env.example
backend/src/modules/letters/sub-modules/pdf/pdf.queue.js
```

**Task:**
- [ ] Tambah `REDIS_HOST` dan `REDIS_PORT` ke `.env.example`
- [ ] `config/queue.js` → baca dari `process.env.REDIS_HOST` dan `process.env.REDIS_PORT`
- [ ] `pdf.queue.js` → pastikan worker ter-start saat `server.js` boot
- [ ] Tambah import worker di `backend/src/server.js`:
  ```js
  // server.js
  import './modules/letters/sub-modules/pdf/pdf.queue.js';
  ```
- [ ] Test: ajukan surat → submit → cek job masuk queue → PDF ter-generate
- [ ] `docker-compose.yml` → tambah service Redis jika belum ada

---

### 1.3 Perbaikan Step 6 PDF Preview

**Problem:** Backend `pdf.service.js` sudah bisa generate PDF, tapi Step 6 di frontend belum ter-integrasi penuh.

**File yang diubah:**
```
frontend/src/features/letters/components/wizard/Step6PdfPreview.jsx
frontend/src/features/letters/hooks/useLetterWizard.js
backend/src/modules/letters/letters.controller.js
backend/src/modules/letters/letters.routes.js
```

**Task:**
- [ ] Tambah endpoint baru untuk ambil URL PDF preview:
  ```
  GET /api/v2/letters/:uuid/preview-pdf
  ```
- [ ] `letters.controller.js` → handler `getPreviewPdf()`:
  - ambil `letter_pdf_versions` WHERE `letter_id=? AND type='preview'`
  - jika belum ada → trigger `pdf.service.js` generate preview
  - return `{ pdf_url }`
- [ ] `Step6PdfPreview.jsx` → fetch URL PDF lalu render dengan `react-pdf`:
  ```jsx
  import { Document, Page } from 'react-pdf';
  // render <Document file={pdfUrl}><Page pageNumber={1} /></Document>
  ```
- [ ] Loading state saat PDF sedang di-generate
- [ ] Tombol "Download Preview" → `<a href={pdfUrl} download>`

---

### 1.4 Perbaikan LetterListPage (Letterbox Warga)

**Problem:** Halaman `LetterListPage.jsx` ada tapi perlu dicek apakah sudah fetch data real dan menampilkan status dengan benar.

**File yang diubah:**
```
frontend/src/features/letters/pages/LetterListPage.jsx
frontend/src/services/suratService.js
frontend/src/constants/suratStatus.js
```

**Task:**
- [ ] `suratService.js` → tambah `getLettersV2()` call `GET /api/v2/letters`
- [ ] `LetterListPage.jsx` → gunakan `useQuery({ queryKey: ['letters-v2'], queryFn: getLettersV2 })`
- [ ] Tampilkan card per surat: jenis surat, tanggal ajuan, status badge
- [ ] Status badge color sesuai status V2:
  ```js
  // frontend/src/constants/suratStatus.js — tambah V2 statuses
  export const LETTER_STATUS_LABEL = {
    draft: 'Draft',
    submitted: 'Menunggu RT',
    in_review_rt: 'Diproses RT',
    approved_rt: 'Disetujui RT',
    in_review_rw: 'Diproses RW',
    approved_rw: 'Disetujui RW',
    revision_requested: 'Perlu Revisi',
    rejected: 'Ditolak',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  ```
- [ ] Filter tab: Semua / Proses / Selesai / Ditolak
- [ ] Link ke `LetterDetailPage` per card

---

### 1.5 Perbaikan LetterDetailPage

**Problem:** `LetterDetailPage.jsx` ada tapi perlu data lengkap dari backend.

**File yang diubah:**
```
frontend/src/features/letters/pages/LetterDetailPage.jsx
backend/src/modules/letters/letters.controller.js
backend/src/modules/letters/letters.model.js
```

**Task:**
- [ ] `letters.model.js` → method `getDetailByUuid(uuid)`:
  ```sql
  SELECT l.*, lt.name as letter_type_name,
         w.nama as resident_name, w.NIK as resident_nik,
         lwo.name as workflow_name
  FROM letters l
  JOIN letter_types lt ON l.letter_type_id = lt.id
  JOIN warga w ON l.resident_id = w.id_warga
  JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
  WHERE l.uuid = ?
  ```
- [ ] Tambah query field_values, approvals history, pdf_versions ke response
- [ ] `LetterDetailPage.jsx` tampilkan:
  - Nomor surat (jika `completed`)
  - Timeline approval (dari `letter_approvals`)
  - Tombol download PDF final (dari `letter_pdf_versions` type=`final`)
  - Status tracker visual (draft → submitted → in_review_rt → ... → completed)

---

## Sprint 2 — Fitur RT/RW Inbox & Approval (Estimasi: 1 minggu)

Fokus: alur kerja RT dan RW untuk terima dan proses surat.

---

### 2.1 LetterInboxPage untuk RT/RW

**Problem:** `LetterInboxPage.jsx` ada tapi perlu disambungkan ke backend V2 dan menampilkan surat sesuai role + tenant.

**File yang diubah:**
```
frontend/src/features/letters/pages/LetterInboxPage.jsx
backend/src/modules/letters/letters.controller.js
backend/src/modules/letters/letters.model.js
backend/src/modules/letters/letters.routes.js
```

**Task:**
- [ ] Tambah endpoint inbox untuk RT/RW:
  ```
  GET /api/v2/letters/inbox   → authRtRwMiddleware.js
  ```
- [ ] `letters.model.js` → method `getInboxByRole(role, rtId, rwId)`:
  - jika role=`rt`: filter `status IN ('submitted', 'in_review_rt')` dan `tenant_id = rwId`
  - jika role=`rw`: filter `status IN ('approved_rt', 'in_review_rw')`
- [ ] `LetterInboxPage.jsx`:
  - Tab: Menunggu / Diproses / Selesai / Ditolak
  - Card surat: nama warga, jenis surat, tanggal, status
  - Tombol "Proses" → buka `LetterDetailPage` (mode RT/RW)

---

### 2.2 Halaman Detail Surat Mode RT/RW

**File yang diubah:**
```
frontend/src/features/letters/pages/LetterDetailPage.jsx
backend/src/modules/letters/letters.controller.js
backend/src/modules/letters/sub-modules/approvals/approvals.service.js
```

**Task:**
- [ ] `LetterDetailPage.jsx` → deteksi role dari `AuthContext`:
  - jika role=`warga`: tampilkan tracking saja
  - jika role=`rt`/`rw`: tampilkan tombol Approve / Reject / Minta Revisi
- [ ] Form approve: input notes + pilih TTD dari `GET /api/ttd`
- [ ] Form reject: input alasan penolakan
- [ ] `approvals.service.js` → logic transisi status:
  ```js
  // workflow RT_ONLY: submitted → in_review_rt → completed
  // workflow RT_THEN_RW: submitted → in_review_rt → approved_rt → in_review_rw → completed
  async approve(letterId, approverId, role, notes, signatureUrl) {
    const letter = await LetterModel.findById(letterId);
    const nextStatus = determineNextStatus(letter.status, letter.workflow, role);
    // INSERT letter_approvals
    // UPDATE letters SET status = nextStatus
    // if nextStatus === 'completed' → trigger PDF final generation
    // NotificationService.notify(...)
  }
  ```

---

### 2.3 Implementasi Tenant ID Otomatis

**Problem:** Field `tenant_id` di tabel `letters` tidak diisi otomatis dari JWT.

**File yang diubah:**
```
backend/src/middlewares/authRtRwMiddleware.js
backend/src/modules/letters/letters.service.js
backend/src/modules/letters/letters.model.js
```

**Task:**
- [ ] `authRtRwMiddleware.js` → tambah `req.tenantId`:
  ```js
  // setelah verify JWT:
  req.user = decoded;
  req.tenantId = decoded.rw_id || decoded.id; // rw_id dari payload RT
  ```
- [ ] JWT RT payload harus include `rw_id`:
  ```js
  // AuthService.js → loginRtRw()
  const token = jwt.sign({
    id: rt.rt_id,
    rw_id: rt.rw_id,   // ← tambah ini
    username: rt.username,
    nama: rt.nama_ketua,
    role: 'rt',
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
  ```
- [ ] `letters.service.js` → `createDraft()`:
  ```js
  // tambah tenant_id dari req (dikirim warga)
  // atau: saat submit, RT/RW assign tenant berdasarkan alamat warga
  ```

---

### 2.4 RiwayatSurat RT/RW Integrasi V2

**Problem:** `RiwayatSurat.jsx` di `pages/rtrw/` kemungkinan masih pakai data V1.

**File yang diubah:**
```
frontend/src/pages/rtrw/RiwayatSurat.jsx
frontend/src/services/suratService.js
```

**Task:**
- [ ] Tambah `getLetterHistoryRtRw()` di `suratService.js`:
  ```
  GET /api/v2/letters/inbox?status=completed,rejected
  ```
- [ ] `RiwayatSurat.jsx` → merge data V1 (dari `GET /api/surat/riwayat`) dan V2
- [ ] Tampilkan kolom: jenis surat, warga, tanggal proses, aksi (approve/reject), status

---

## Sprint 3 — Canvas TTD & QR Verify (Estimasi: 1 minggu)

---

### 3.1 Canvas Signature Pad di TtdSurat.jsx

**Problem:** `react-signature-canvas` sudah ter-install tapi `TtdSurat.jsx` belum menggunakannya.

**File yang diubah:**
```
frontend/src/pages/rtrw/TtdSurat.jsx
backend/src/routes/ttdRtRwRoutes.js
backend/src/middlewares/upload.js
```

**Task:**
- [ ] `TtdSurat.jsx` → tambah tab "Gambar TTD":
  ```jsx
  import SignatureCanvas from 'react-signature-canvas';

  const sigCanvas = useRef(null);

  // Tombol "Simpan TTD"
  const handleSave = async () => {
    const dataUrl = sigCanvas.current.toDataURL('image/png');
    // convert dataUrl → Blob → FormData
    const blob = dataURLtoBlob(dataUrl);
    const formData = new FormData();
    formData.append('ttd', blob, 'ttd.png');
    await ttdService.uploadTtd(formData);
    toast.success('TTD berhasil disimpan');
  };
  ```
- [ ] `ttdService.js` → `uploadTtd(formData)` → `POST /api/ttd/upload`
- [ ] Tombol "Hapus" → `sigCanvas.current.clear()`
- [ ] Preview TTD yang sudah tersimpan (dari `GET /api/ttd`)

---

### 3.2 Implementasi QrVerifyPage

**Problem:** `QrVerifyPage.jsx` masih stub/kosong.

**File yang diubah:**
```
frontend/src/features/letters/pages/QrVerifyPage.jsx
backend/src/modules/letters/letters.controller.js
backend/src/modules/letters/letters.routes.js
```

**Task:**
- [ ] Tambah endpoint publik:
  ```
  GET /api/v2/letters/verify/:qrToken   → no auth (publik)
  ```
- [ ] `letters.controller.js` → `verifyByQrToken()`:
  ```js
  const letter = await LetterModel.findByQrToken(qrToken);
  if (!letter) return res.status(404).json({ valid: false });
  return res.json({
    valid: true,
    letter_number: letter.letter_number,
    letter_type: letter.letter_type_name,
    resident_name: letter.resident_name,
    completed_at: letter.completed_at,
    status: letter.status,
  });
  ```
- [ ] `QrVerifyPage.jsx` → ambil `:qrToken` dari URL params:
  ```jsx
  // route: /verify/:qrToken
  const { qrToken } = useParams();
  const { data } = useQuery(['verify', qrToken], () => verifyLetter(qrToken));
  ```
- [ ] Tampilkan: valid/invalid, nama warga, jenis surat, nomor surat, tanggal selesai
- [ ] Design sederhana, bisa dibuka tanpa login

---

## Sprint 4 — Superadmin & Analytics (Estimasi: 1 minggu)

---

### 4.1 Dashboard Superadmin Integrasi Data Real

**Problem:** `pages/superadmin/Dashboard.jsx` perlu menampilkan data statistik nyata dari DB.

**File yang diubah:**
```
frontend/src/pages/superadmin/Dashboard.jsx
backend/src/routes/superAdminRoutes.js
backend/src/controllers/authController.js
```

**Task:**
- [ ] Tambah endpoint statistik:
  ```
  GET /api/superadmin/stats   → superAdminMiddleware.js
  ```
- [ ] Query stats:
  ```sql
  -- Total warga
  SELECT COUNT(*) as total_warga FROM warga;
  -- Total surat per status (V1 + V2)
  SELECT status, COUNT(*) FROM pengajuan_surat GROUP BY status;
  SELECT status, COUNT(*) FROM letters GROUP BY status;
  -- Total RT dan RW
  SELECT COUNT(*) FROM rt;
  SELECT COUNT(*) FROM rw;
  ```
- [ ] `Dashboard.jsx` → tampilkan card statistik + tabel RT/RW aktif

---

### 4.2 Manajemen Template Surat (Superadmin)

**Problem:** `TemplateSurat.jsx` ada untuk V1. Perlu diperluas untuk bisa manage `letter_pdf_templates` (V2).

**File yang diubah:**
```
frontend/src/pages/superadmin/TemplateSurat.jsx
backend/src/controllers/TemplateSuratController.js
backend/src/routes/templateSuratRoutes.js
backend/src/services/TemplateSuratService.js
```

**Task:**
- [ ] Tambah tab "Template V2 (HTML)" di halaman TemplateSurat
- [ ] Form tambah template V2:
  - Pilih jenis surat (dari `GET /api/v2/letters/types`)
  - Textarea untuk HTML template (dengan Mustache variables hint)
  - Preview render simulasi
- [ ] Endpoint:
  ```
  GET    /api/template-surat/v2          → list letter_pdf_templates
  POST   /api/template-surat/v2          → tambah template (superadmin)
  PUT    /api/template-surat/v2/:id      → update template
  DELETE /api/template-surat/v2/:id      → hapus template
  ```
- [ ] `TemplateSuratService.js` → CRUD ke tabel `letter_pdf_templates`

---

### 4.3 Manajemen Akun RT/RW oleh Superadmin

**File yang diubah:**
```
frontend/src/pages/superadmin/Dashboard.jsx
backend/src/routes/superAdminRoutes.js
backend/src/controllers/authController.js
```

**Task:**
- [ ] Endpoint tambahan:
  ```
  DELETE /api/superadmin/users/:id    → hapus akun RT/RW
  PATCH  /api/superadmin/users/:id    → suspend / aktifkan akun
  PUT    /api/superadmin/users/:id/reset-password
  ```
- [ ] Tabel daftar RT/RW di Dashboard superadmin dengan aksi per baris

---

## Sprint 5 — Polish & Deployment (Estimasi: 1 minggu)

---

### 5.1 Lengkapi `.env.example` Backend

**File yang diubah:**
```
backend/.env.example
```

**Task:**
- [ ] Tambah env yang belum ada tapi dipakai:
  ```env
  REDIS_HOST=localhost
  REDIS_PORT=6379
  SUPABASE_URL=
  SUPABASE_KEY=
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  ```

---

### 5.2 Tambah CI/CD Frontend

**Problem:** GitHub Actions hanya ada untuk backend.

**File yang ditambah:**
```
.github/workflows/frontend.yml
```

**Task:**
- [ ] Buat file `.github/workflows/frontend.yml`:
  ```yaml
  name: Frontend CI
  on:
    push:
      branches: [main, master]
      paths: ['frontend/**']
    pull_request:
      paths: ['frontend/**']
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
        - run: cd frontend && npm ci
        - run: cd frontend && npm run build
  ```

---

### 5.3 Docker Compose Lengkap

**Problem:** Belum ada `docker-compose.yml` di root proyek yang menyertakan Redis.

**File yang ditambah/diubah:**
```
docker-compose.yml   (root proyek)
```

**Task:**
- [ ] Buat `docker-compose.yml`:
  ```yaml
  version: '3.8'
  services:
    db:
      image: mysql:8.0
      environment:
        MYSQL_ROOT_PASSWORD: root
        MYSQL_DATABASE: capstone
      volumes:
        - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
        - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
      ports:
        - "3306:3306"

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"

    backend:
      build: ./backend
      env_file: ./backend/.env
      environment:
        DB_HOST: db
        REDIS_HOST: redis
      ports:
        - "3000:3000"
      depends_on:
        - db
        - redis
  ```

---

### 5.4 Unit Test Tambahan

**File yang ditambah:**
```
backend/tests/letters.test.js
backend/tests/auth.test.js
```

**Task:**
- [ ] Test endpoint `POST /api/v2/letters/drafts`
- [ ] Test endpoint `POST /api/v2/letters/:uuid/submit`
- [ ] Test `GET /api/v2/letters/verify/:qrToken` (publik)
- [ ] Test middleware auth: pastikan 401 jika no token, 403 jika role salah
- [ ] Jalankan: `cd backend && npm test`

---

## Checklist Keseluruhan

### Sprint 1 (Stabilisasi Core)
- [ ] 1.1 ProfilePage integrasi data warga
- [ ] 1.2 Redis BullMQ konfigurasi & start queue worker
- [ ] 1.3 Step 6 PDF preview ter-integrasi
- [ ] 1.4 LetterListPage fetch data real + status badge
- [ ] 1.5 LetterDetailPage data lengkap + timeline approval

### Sprint 2 (RT/RW Flow)
- [ ] 2.1 LetterInboxPage RT/RW data real
- [ ] 2.2 Detail surat mode RT/RW (approve/reject)
- [ ] 2.3 Tenant ID otomatis dari JWT
- [ ] 2.4 RiwayatSurat merge V1 + V2

### Sprint 3 (Canvas TTD & QR)
- [ ] 3.1 Canvas signature pad di TtdSurat.jsx
- [ ] 3.2 QrVerifyPage implementasi penuh

### Sprint 4 (Superadmin)
- [ ] 4.1 Dashboard superadmin data real
- [ ] 4.2 Template V2 management UI
- [ ] 4.3 Manajemen akun RT/RW (delete/suspend/reset)

### Sprint 5 (Polish & Deploy)
- [ ] 5.1 Lengkapi `.env.example`
- [ ] 5.2 CI/CD frontend GitHub Actions
- [ ] 5.3 `docker-compose.yml` lengkap dengan Redis
- [ ] 5.4 Unit test tambahan

---

## Referensi File Penting

| Fungsi | Path |
|---|---|
| Entry point backend | `backend/src/server.js` |
| Express app setup | `backend/src/app.js` |
| Letter V2 controller | `backend/src/modules/letters/letters.controller.js` |
| Letter V2 service | `backend/src/modules/letters/letters.service.js` |
| Letter V2 model | `backend/src/modules/letters/letters.model.js` |
| PDF generation | `backend/src/modules/letters/sub-modules/pdf/pdf.service.js` |
| PDF queue worker | `backend/src/modules/letters/sub-modules/pdf/pdf.queue.js` |
| Approval logic | `backend/src/modules/letters/sub-modules/approvals/approvals.service.js` |
| Attachment upload | `backend/src/modules/letters/sub-modules/attachments/attachments.service.js` |
| Notifikasi | `backend/src/services/NotificationService.js` |
| Auth service | `backend/src/services/AuthService.js` |
| Multer + Cloudinary | `backend/src/middlewares/upload.js` |
| Queue config | `backend/src/config/queue.js` |
| Letter Wizard state | `frontend/src/features/letters/hooks/useLetterWizard.js` |
| Dynamic form field | `frontend/src/features/letters/components/shared/DynamicField.jsx` |
| Auth context | `frontend/src/context/AuthContext.jsx` |
| Axios wrapper | `frontend/src/utils/api.js` |
| Schema V2 | `database/init.sql` |
| Seed data | `database/seed.sql` |
| Migrasi Sprint 3 | `database/migration_sprint3.sql` |
| Workflow seed | `backend/workflows.sql` |
