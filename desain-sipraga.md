# Desain Sistem SIPRAGA V2
> Arsitektur & desain teknis berdasarkan kode aktual di repository  
> Terakhir diperbarui: Juni 2026

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│                                                          │
│   React 19 + Vite 8    →   http://localhost:5173         │
│   TailwindCSS 4        →   Styling utility-first         │
│   TanStack Query 5     →   Server state & caching        │
│   React Router DOM 7   →   Client-side routing           │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                           │
│                                                          │
│   Express.js v5        →   http://localhost:3000         │
│   JWT Auth             →   jsonwebtoken, 1d expiry       │
│   Rate Limiting        →   express-rate-limit            │
│   Swagger Docs         →   /api/docs                     │
│                                                          │
│   V1 Routes: /api/surat, /api/warga, /api/auth, ...      │
│   V2 Routes: /api/v2/letters/**                          │
└─────────┬───────────────┬───────────────────────────────┘
          │               │
          ▼               ▼
┌──────────────┐  ┌───────────────────────────────────────┐
│   MySQL 8.0  │  │            STORAGE LAYER               │
│   DB: capstone│  │                                       │
│              │  │  Cloudinary  →  KTP, TTD, surat V1    │
│  V1 tables:  │  │  Supabase    →  storage V2 (planned)  │
│  - warga     │  │  Local /uploads → fallback dev         │
│  - rt / rw   │  └───────────────────────────────────────┘
│  - pengajuan │
│  - template  │  ┌───────────────────────────────────────┐
│              │  │           BACKGROUND JOBS              │
│  V2 tables:  │  │                                        │
│  - letters   │  │  BullMQ + Redis  →  PDF generation     │
│  - letter_*  │  │  pdf.queue.js    →  worker file        │
└──────────────┘  └───────────────────────────────────────┘
```

---

## 2. Desain Autentikasi

### Alur JWT per Role

```
[Register/Login]
      │
      ▼
  AuthService.js
      │
  bcryptjs (10 rounds) → hash password
  jsonwebtoken         → sign JWT (1d)
      │
      ▼
  Response: { token, user }
      │
      ▼
  Frontend: AuthContext.jsx
  → simpan token di localStorage/memory
  → interceptor di utils/api.js
    (Axios: Authorization: Bearer <token>)
```

### Payload JWT per Role

| Role | Field di Payload |
|---|---|
| Warga | `{ id_warga, nama, nik, role: "warga" }` |
| RT | `{ id: rt_id, username, nama, role: "rt" }` |
| RW | `{ id: rw_id, username, nama, role: "rw" }` |
| Superadmin | `{ id, username, role: "superadmin" }` |

### Guard Middleware

```
frontend/src/components/ProtectedRoute.jsx
    → baca AuthContext, redirect jika tidak login

backend/src/middlewares/
    authMiddleware.js       → guard route warga
    authRtRwMiddleware.js   → guard route RT/RW
    superAdminMiddleware.js → guard route superadmin
```

---

## 3. Desain Letter Wizard V2

### State Machine Surat

```
draft
  │ POST /api/v2/letters/drafts
  ▼
submitted
  │ POST /api/v2/letters/:uuid/submit
  ▼
in_review_rt ──→ revision_requested
  │                    │
  │ approve            │ (warga revisi, resubmit)
  ▼                    │
approved_rt ◄──────────┘
  │
  │ [jika workflow RT_THEN_RW]
  ▼
in_review_rw ──→ revision_requested
  │
  │ approve
  ▼
approved_rw
  │
  │ generate PDF final (BullMQ job)
  ▼
completed ──→ PDF final tersedia, letter_number di-assign

rejected (kapan saja oleh RT atau RW)
cancelled  (oleh warga, dari status draft/submitted)
```

### Alur Data 8-Step Wizard

```
useLetterWizard.js (state manager)
├── Step 1: selectedType
│     GET /api/v2/letters/types
│     → frontend/src/features/letters/components/wizard/Step1PickTemplate.jsx
│
├── Step 2: fieldValues
│     GET /api/v2/letters/types/:typeId/fields
│     → DynamicField.jsx render form sesuai field_type
│     → react-hook-form + zod validation
│
├── Step 3: letterContent (subject, purpose, blocks)
│     → @dnd-kit/core drag-and-drop
│     → block_type: paragraph / list / points / note / info
│     → disimpan di letter_content_blocks
│
├── Step 4: attachments
│     → upload ke Cloudinary via multer
│     → disimpan di letter_attachments
│
├── Step 5: selectedWorkflow
│     GET /api/v2/letters/workflows
│     → RT_ONLY (1 step) atau RT_THEN_RW (2 steps)
│
├── Step 6: PDF preview
│     POST draft → trigger pdf.service.js
│     → Puppeteer + Mustache render HTML ke PDF
│     → react-pdf viewer di browser
│
├── Step 7: konfirmasi
│     POST /api/v2/letters/:uuid/submit
│
└── Step 8: sukses
      → tampilkan UUID + link tracking
```

---

## 4. Desain Engine PDF

### Flow Lengkap

```
letters.service.js
    │
    ├─ 1. Ambil letter + field_values dari DB
    │      letters.model.js → query MySQL
    │
    ├─ 2. Merge jadi templateData object
    │      { letter_type_name, letter_number,
    │        resident_name, resident_nik,
    │        purpose, created_date,
    │        ...semua field dinamis }
    │
    ├─ 3. Ambil HTML template
    │      letter_pdf_templates WHERE letter_type_id = ?
    │      → fallback: template HTML sederhana bawaan
    │
    ├─ 4. Generate QR Code
    │      qrcode → PNG base64 dari qr_token
    │
    ├─ 5. Render HTML
    │      mustache.render(html_template, templateData)
    │
    ├─ 6. Puppeteer → PDF buffer
    │      page.setContent(renderedHtml)
    │      page.pdf({ format: 'A4', margin: '2cm semua sisi' })
    │
    └─ 7. Upload / kirim ke client
           Cloudinary atau Supabase Storage
```

### Template Variables (Mustache Syntax)

| Variable | Sumber Data |
|---|---|
| `{{letter_type_name}}` | letter_types.name |
| `{{letter_number}}` | letters.letter_number (saat completed) |
| `{{resident_name}}` | warga.nama |
| `{{resident_nik}}` | warga.NIK |
| `{{purpose}}` | letters.purpose |
| `{{created_date}}` | letters.created_at (format id-ID) |
| `{{qrCodeBase64}}` | generated dari letters.qr_token |
| `{{lama_tinggal}}` | letter_field_values.value WHERE field_key='lama_tinggal' |
| `{{keperluan_domisili}}` | letter_field_values.value WHERE field_key='keperluan_domisili' |

### BullMQ Queue

```
File: backend/src/modules/letters/sub-modules/pdf/pdf.queue.js

Producer (letters.service.js)
  → queue.add('generate-pdf', { letterId, type })

Worker (pdf.queue.js)
  → process job
  → panggil pdf.service.js
  → update letter_pdf_versions
  → update letters.status jika perlu
```

---

## 5. Desain Notifikasi

```
NotificationService.js
├── sendEmail(to, subject, html)
│     nodemailer + SMTP
│     fallback: Ethereal SMTP jika env kosong
│
├── sendWhatsApp(phone, message)
│     Fonnte API (hanya jika FONNTE_TOKEN di-set)
│
└── notify(event, targetUser)
      Promise.allSettled([sendEmail, sendWhatsApp])
      → error hanya di-log, tidak block flow

Events:
  DIAJUKAN       → notify warga (konfirmasi)
  DISETUJUI      → notify warga (approved)
  DITOLAK        → notify warga (alasan penolakan)
  PENGAJUAN_BARU → notify RT/RW (ada surat masuk)
```

---

## 6. Desain Database

### Relasi Antar Tabel V2

```
warga (id_warga)
    │
    └──► letters (resident_id)
              │
              ├──► letter_types (letter_type_id)
              │         └──► letter_template_fields
              │
              ├──► letter_workflow_options (workflow_option_id)
              │
              ├──► letter_field_values (letter_id)
              │
              ├──► letter_content_blocks (letter_id)
              │
              ├──► letter_attachments (letter_id)
              │
              ├──► letter_pdf_versions (letter_id)
              │
              ├──► letter_approvals (letter_id)
              │         └──► rt/rw (approver_id)
              │
              └──► letter_comments (letter_id)

letter_pdf_templates
    └──► letter_types (letter_type_id)
         tenant_id NULL = template global/default
```

### Index Penting di Tabel `letters`

```sql
INDEX (tenant_id, status)   -- untuk filter inbox RT/RW
INDEX (resident_id)         -- untuk letterbox warga
INDEX (uuid)                -- untuk URL lookup & QR verify
UNIQUE (uuid)
UNIQUE (qr_token)
```

---

## 7. Desain Routing Frontend

### Struktur Route (App.jsx)

```
/                           → LandingPage.jsx
/login                      → LoginWarga.jsx
/login-rtrw                 → LoginRtRw.jsx
/register                   → RegisterWarga.jsx
/register-rtrw              → RegisterRtRw.jsx
/register-superadmin        → RegisterSuperadmin.jsx

[Protected: role=warga]
/warga/dashboard            → pages/warga/Dashboard.jsx
/warga/ajukan-surat         → pages/warga/AjukanSurat.jsx (V1 legacy)
/warga/status-surat         → pages/warga/StatusSurat.jsx
/warga/profile              → ProfilePage.jsx
/letters                    → features/letters/pages/LetterListPage.jsx
/letters/new                → features/letters/pages/LetterWizardPage.jsx
/letters/:uuid              → features/letters/pages/LetterDetailPage.jsx

[Protected: role=rt | role=rw]
/rtrw/dashboard             → pages/rtrw/Dashboard.jsx
/rtrw/ajukan-surat          → pages/rtrw/AjukanSurat.jsx
/rtrw/riwayat               → pages/rtrw/RiwayatSurat.jsx
/rtrw/ttd                   → pages/rtrw/TtdSurat.jsx
/letters/inbox              → features/letters/pages/LetterInboxPage.jsx

[Protected: role=superadmin]
/superadmin/dashboard       → pages/superadmin/Dashboard.jsx
/superadmin/template-surat  → pages/superadmin/TemplateSurat.jsx

[Public]
/verify/:qrToken            → features/letters/pages/QrVerifyPage.jsx
```

---

## 8. Desain API V2 (Letters)

### Endpoint Lengkap

```
GET    /api/v2/letters/types
       → letter_types WHERE is_active=1 ORDER BY sort_order
       → public, no auth

GET    /api/v2/letters/types/:typeId/fields
       → letter_template_fields WHERE letter_type_id=?
       → public, no auth

GET    /api/v2/letters/workflows
       → letter_workflow_options WHERE is_active=1
       → public, no auth

GET    /api/v2/letters
       → letters WHERE resident_id = req.user.id_warga
       → JWT (warga)

POST   /api/v2/letters/drafts
       body: { letter_type_id, workflow_option_id, subject,
               purpose, field_values, content_blocks }
       → insert letters (status=draft) + field_values + content_blocks
       → JWT (warga)

GET    /api/v2/letters/:uuid
       → letters JOIN field_values JOIN attachments
       → JWT (warga atau RT/RW yang berwenang)

POST   /api/v2/letters/:uuid/submit
       → UPDATE letters SET status='submitted'
       → trigger NotificationService PENGAJUAN_BARU ke RT
       → JWT (warga, hanya boleh jika status=draft)

POST   /api/v2/letters/:uuid/approve
       body: { notes, signature_url }
       → approvals.service.js
       → insert letter_approvals
       → UPDATE letters.status sesuai workflow step
       → trigger BullMQ PDF job jika step terakhir
       → JWT (rt atau rw)

POST   /api/v2/letters/:uuid/reject
       body: { notes }
       → UPDATE letters SET status='rejected', rejected_by_role
       → trigger NotificationService DITOLAK ke warga
       → JWT (rt atau rw)
```

---

## 9. Desain Fitur TTD Digital (Rencana Ekstensi)

### Yang Sudah Ada di Kode

```
frontend/src/pages/rtrw/TtdSurat.jsx
    → halaman upload TTD image (Cloudinary)
    → react-signature-canvas sudah ter-install

backend/src/routes/ttdRtRwRoutes.js
    → POST /api/ttd/upload  (multer → Cloudinary)
    → GET  /api/ttd         (ambil TTD milik sendiri)

Database:
    rt.ttd_digital      → URL Cloudinary TTD Ketua RT
    rw.ttd_digital      → URL Cloudinary TTD Ketua RW
    letter_approvals.signature_url → URL TTD yang dipakai saat approve

pdf-lib sudah ter-install:
    → embed image TTD ke dalam PDF
```

### Desain Ekstensi Canvas Signature

```
TtdSurat.jsx
    ├── Mode 1: Upload file (sudah jalan)
    └── Mode 2: Draw di browser (belum)
          react-signature-canvas
          → onEnd: canvas.toDataURL('image/png')
          → kirim base64 ke POST /api/ttd/upload
          → backend konversi base64 → buffer
          → upload ke Cloudinary
          → UPDATE rt/rw SET ttd_digital=cloudinaryUrl
```

---

## 10. Desain Tenant (Multi RT/RW)

### Kondisi Saat Ini

Field `tenant_id` di tabel `letters` sudah ada tapi belum diisi otomatis dari JWT.

### Desain yang Direncanakan

```
JWT RT:  { id: rt_id, rw_id, role: "rt" }
JWT RW:  { id: rw_id, role: "rw" }

authRtRwMiddleware.js
    → decode JWT
    → set req.tenantId = rw_id (pakai rw_id sebagai tenant identifier)

letters.service.js → createDraft()
    → INSERT letters SET tenant_id = req.tenantId  ← belum ada

letters.model.js → getInbox()
    → WHERE tenant_id = req.tenantId  ← perlu diimplementasikan
```

---

## 11. Variabel Environment Lengkap

```env
# ── Server ──────────────────────────────────────
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=debug

# ── Database ─────────────────────────────────────
DB_HOST=localhost          # Docker: DB_HOST=db
DB_USER=root
DB_PASSWORD=
DB_NAME=capstone

# ── Auth ─────────────────────────────────────────
JWT_SECRET=min-32-karakter-random-string

# ── Storage: Cloudinary ───────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Storage: Supabase ────────────────────────────
SUPABASE_URL=https://avlwwbkhsrubhsfwbgpr.supabase.co
SUPABASE_KEY=<service_role_key>

# ── Notifikasi: Email ────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
# jika kosong → otomatis pakai Ethereal (dev mode)

# ── Notifikasi: WhatsApp ─────────────────────────
FONNTE_TOKEN=your-fonnte-token
# jika kosong → WA notif dinonaktifkan

# ── Queue (BullMQ) ───────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 12. Catatan Kompatibilitas & Breaking Changes

| Item | Detail |
|---|---|
| Express v5 | Async error handler otomatis (tidak perlu `next(err)` manual). Router path matching berubah sedikit dari v4. |
| React v19 | `react-pdf` masih butuh React 18. Gunakan `overrides` di `frontend/package.json`. |
| `rw_id` VARCHAR | Bukan auto-increment. Harus diisi manual saat register RW (contoh: `"RW001"`). |
| Dua sistem paralel | V1 (`/api/surat`) dan V2 (`/api/v2/letters`) berjalan bersama di satu Express app. |
| PDF fallback | `pdf.service.js` punya template HTML hardcoded sebagai fallback jika `letter_pdf_templates` kosong. |
