# Audit Konektivitas Fitur — SIPRAGA V2

> Diaudit langsung dari source code (`capstone_SIPRAGA_V2-main`), bukan dari dokumentasi/README.
> Semua temuan disertai path file biar bisa langsung dicek/diperbaiki.

---

## TL;DR

Akar masalahnya **satu**: kamu punya **dua sistem surat yang berjalan paralel** di codebase yang sama —

| | Sistem Lama (V1) | Sistem Baru (V2) |
|---|---|---|
| Tabel DB | `pengajuan_surat` | `letters`, `letter_types`, `letter_field_values`, `letter_approvals`, dst |
| Backend | `controllers/suratController.js`, `services/SuratService.js`, route `/api/surat` | `modules/letters/*`, route `/api/v2/letters` |
| Frontend | `services/suratService.js` (sebagian), dashboard lama | `features/letters/*` (wizard, inbox, detail, QR) |

Keduanya **hidup bersamaan, tidak saling sinkron**, dan beberapa halaman bahkan menampilkan **dua versi data sekaligus** ke user. Ini bukan bug kecil — ini yang bikin terasa "ada yang nggak nyambung" meskipun masing-masing fitur individual sebenarnya jalan.

**Opsi yang paling efektif: selesaikan migrasi ke V2, matikan V1 total.** Alasannya di bawah.

---

## Kenapa bukan opsi lain

1. **Sinkronkan V1 ↔ V2 (bikin dual-write/adapter)** → effort terus-menerus, rawan bug, dan kamu akan maintain 2x logic approval/PDF/QR selamanya. Tidak worth it untuk solo/tim kecil.
2. **Mundur ke V1, buang V2** → rugi besar. V2 sudah lebih lengkap: template surat dinamis (markdown builder di superadmin), pilihan workflow RT-only/RT-RW, QR verification, modular approvals. Wizard pengajuan surat (fitur paling sering dipakai warga) **sudah** jalan di atas V2.
3. **Migrasi penuh ke V2, retire V1** → effort sekali di depan, hasil akhir 1 sumber data, 1 flow, lebih mudah di-maintain untuk KKN/proyek lanjutan kamu juga. → **ini yang dipilih.**

---

## Temuan Detail

### 1. 🔴 Dashboard RT/RW menampilkan dua inbox berbeda yang tidak terhubung
**File:** `frontend/src/pages/rtrw/Dashboard.jsx` (baris 72, 82-89, 227-259)

RT/RW dashboard fetch dari **dua sumber sekaligus**:
- `useSurat('masuk')` → data dari `pengajuan_surat` (V1), tombol Setujui/Tolak pakai `suratService.approveSurat/rejectSurat`
- `api.get('/v2/letters/inbox')` → data dari `letters` (V2), ditampilkan di section terpisah "Surat Masuk V2" tanpa tombol approve (cuma link ke detail)

**Dampak:** RT/RW harus cek 2 tempat berbeda untuk tahu surat mana yang butuh diproses. Surat yang diajukan lewat wizard baru (`/warga/buat-surat-v2`) **tidak akan muncul** di statistik "Butuh Verifikasi" karena angka itu dihitung dari `suratMasuk` (V1) saja (baris 112).

---

### 2. 🔴 Tanda tangan pemohon (warga) di-capture tapi tidak pernah dikirim ke server
**File:** `frontend/src/features/letters/components/wizard/Step7Signature.jsx` (baris ~30-40)

```js
const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
// TODO: Kirim signatureDataUrl ke backend jika diperlukan.
// Saat ini, backend langsung /submit. Kita panggil mutasinya.
submitMutation.mutate({ signature: signatureDataUrl });
```
`mutationFn` di atasnya **mengabaikan parameter** dan cuma panggil `POST /v2/letters/:uuid/submit` tanpa membawa signature sama sekali.

**Lebih dalam:** tabel `letters` di `database/master.sql` (baris 186-213) memang **tidak punya kolom untuk signature pemohon** — jadi fitur ini secara desain memang belum punya tempat untuk disimpan, bukan cuma lupa kirim.

**Lebih penting lagi:** komponen ini **tidak dipanggil sama sekali** di flow nyata — lihat temuan #3.

---

### 3. 🟡 3 file wizard adalah dead code (dibuat tapi tidak pernah dipakai)
**File:** `frontend/src/features/letters/pages/LetterWizardPage.jsx` (baris 16-21)

Import yang dipakai cuma: `Step1PickTemplate`, `Step2FillData`, `Step3ContentBuilder`, `Step4Attachments`, `Step5PickWorkflow`, `Step8Success`.

Tidak pernah di-import:
- `Step6PdfPreview.jsx` → diganti preview inline pakai `<PDFViewer>` langsung di `LetterWizardPage.jsx`
- `Step7Signature.jsx` → digantikan submit langsung tanpa tanda tangan (lihat #2)
- `Step7Confirm.jsx` → diganti `ConfirmationModal.jsx`

**Dampak:** bukan bug fungsional (flow yang jalan sekarang memang lengkap tanpa ketiganya), tapi 3 file ini cuma nyampah & bikin orang lain (atau kamu 2 bulan lagi) bingung mana flow yang "asli".

---

### 4. 🟡 Fitur upload-template surat lama: dibangun penuh di backend+frontend, tidak pernah dipanggil
**File backend:** `controllers/TemplateSuratController.js`, `models/TemplateSuratModel.js`, `services/TemplateSuratService.js`, route `/api/template-surat`
**File frontend:** `services/templateService.js`, `hooks/useTemplate.js`

Di-cek dengan grep ke seluruh `frontend/src/pages` dan `frontend/src/features` — **nol pemanggilan**. Superadmin mengelola template surat lewat halaman `TemplateSuratMarkdown.jsx`, tapi itu pakai endpoint yang **beda total**: `/api/superadmin/templates` → tabel `letter_markdown_templates` (V2).

**Dampak:** ini fitur hantu. Tabel `template_surat` di DB juga tidak pernah dipakai (cek `database/master.sql` baris 109 vs sistem template V2 di baris 119-174).

---

### 5. 🟡 Modul "public" verifikasi surat: dibangun, tidak pernah dipanggil frontend
**File:** `backend/src/modules/public/public.controller.js` + `public.routes.js` → endpoint `GET /api/v2/public/letters/:uuid/verify`

Frontend QR verification (`QrVerifyPage.jsx`, route `/verify/:qrToken`) ternyata memanggil endpoint **lain**: `GET /api/v2/letters/verify/:qrToken` (di `letters.controller.js`, fungsi `verifyByQrToken`). Endpoint `/v2/public/...` tidak dipanggil dari mana pun di frontend.

**Dampak:** redundan, bukan blocking — tapi ini 2 endpoint berbeda untuk "verifikasi surat" yang gampang bikin orang salah pasang link suatu saat.

---

### 6. 🟡 Audit logging cuma cover aksi superadmin, bukan aksi inti sistem
**File:** `backend/src/routes/superAdminRoutes.js` (baris 9): `const guard = [verifyToken, requireSuperadmin, auditLogger];`

`auditLogger` middleware **hanya** dipasang di route superadmin. Tidak ada di `suratRoutes.js` (V1) maupun `modules/letters/letters.routes.js` (V2).

**Dampak:** README bilang "Audit Logging: Log aktivitas sistem untuk kebutuhan audit" sebagai fitur utama, tapi aksi paling penting — warga ajukan surat, RT setuju/tolak, RW tanda tangan — **tidak tercatat di audit log sama sekali**. Yang tercatat cuma CRUD akun/template/config oleh superadmin.

---

### 7. ⚪ Pola pemanggilan API tidak konsisten (minor, tapi bikin maintenance lebih susah)
Sebagian halaman panggil API lewat service file (`suratService.js`, `templateService.js`), sebagian lain langsung `api.get('/v2/...')` inline di komponen (`Dashboard.jsx`, `useLetterWizard.js`, `TemplateSuratMarkdown.jsx`). Tidak ada `lettersService.js` sebagai single source untuk semua call V2.

---

## Rencana Perbaikan (urutan prioritas)

### Quick wins — bisa langsung, < 1 hari
- [ ] **Hapus 3 file mati**: `Step6PdfPreview.jsx`, `Step7Signature.jsx`, `Step7Confirm.jsx` di `features/letters/components/wizard/`. Kalau memang mau ada tanda tangan pemohon nanti, bikin lagi dari nol dengan kolom DB yang jelas — jangan resurrect file lama yang sudah nggak nyambung skema.
- [ ] **Hapus modul `public`** (`backend/src/modules/public/`) dan unmount dari `app.js` baris 74 (`app.use('/api/v2/public', publicRoutes);`) — fungsinya sudah digantikan `verifyByQrToken`.
- [ ] **Tambahkan `auditLogger` ke route V2 letters** minimal untuk aksi approve/reject/submit (`letters.routes.js`) — ini fitur yang paling sering disebut sebagai nilai jual sistem RT/RW digital (jejak audit siapa-approve-apa-kapan).

### Migrasi inti — agar tidak ada lagi 2 sistem paralel
1. [ ] **Pastikan semua data lama (`pengajuan_surat`) sudah selesai diproses**, lalu tulis 1 script migrasi data: pindahkan riwayat `pengajuan_surat` → `letters` + tabel satelitnya (kalau historinya mau dipertahankan), atau cukup arsipkan kalau cuma data uji coba dari development.
2. [ ] **Ganti `RtRwDashboard.jsx`** supaya hanya fetch dari `/v2/letters/inbox`. Hapus `useSurat`, `suratService` dari file ini. Approve/reject pakai `POST /v2/letters/:uuid/approve` dan `/reject` (sudah ada dan jalan — lihat `approvals.service.js`), bukan `suratService.approveSurat`.
3. [ ] **Hapus** `routes/suratRoutes.js`, `controllers/suratController.js`, `services/SuratService.js`, `models/SuratModel.js` setelah langkah 2 beres, dan unmount `app.use('/api/surat', suratRoutes)` di `app.js` baris 65.
4. [ ] **Hapus** sistem upload-template lama sekalian: route `/api/template-surat`, `TemplateSuratController/Model/Service`, plus `frontend/src/services/templateService.js` dan `hooks/useTemplate.js`.
5. [ ] **Konsolidasi pemanggilan API V2** ke satu file `frontend/src/services/lettersService.js` (mirip pola `suratService.js` yang sekarang), supaya nggak ada lagi `api.get('/v2/...')` yang scattered di banyak komponen.

### Setelah migrasi selesai
- [ ] Update `README.md` — hapus klaim fitur yang sudah tidak ada (template upload lama), perjelas bahwa surat = 1 sistem (V2) saja.
- [ ] Drop tabel `pengajuan_surat` dan `template_surat` dari `database/master.sql` setelah yakin tidak ada data penting yang masih dibutuhkan, supaya skema DB juga bersih (1 representasi kebenaran, bukan dua).

---

## Yang **sudah** terhubung dengan baik (nggak usah diutak-atik)
Biar nggak cuma kelihatan negatif — ini bagian yang udah solid:
- Notifikasi in-app: `NotificationService` dipanggil konsisten dari V1 dan V2, `NotificationBell.jsx` baca dari endpoint yang sama → ini aman digabung tanpa kerja tambahan.
- Flow approval V2 (`approvals.service.js`): auto-fetch TTD digital RT/RW dari DB saat approve, transisi status per workflow (`RT_ONLY` / `RT_THEN_RW`), generate nomor surat — semua nyambung dengan benar dan sudah teruji jalannya di `LetterDetailPage.jsx`.
- QR generation → verifikasi: PDF nyisipin URL `${CLIENT_URL}/verify/:qr_token`, route frontend match, endpoint backend match. Bersih.
- 10 item UX improvement dari `implementasi-improve.md` (confirmation modal, stepper, loading overlay, dst) — sudah benar-benar terimplementasi di `LetterWizardPage.jsx`, bukan cuma rencana di dokumen.
