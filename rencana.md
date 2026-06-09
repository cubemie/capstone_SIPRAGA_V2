# rencana.md — Fitur Tanda Tangan Digital (E-Signature)

## 1. Tujuan Fitur

Fitur ini memungkinkan pengguna membuat tanda tangan secara digital melalui web, menyimpannya, lalu menggunakannya kembali untuk ditempel ke dokumen atau surat yang dihasilkan sistem.

Output akhir:

* Tanda tangan tersimpan sebagai gambar (PNG/Base64)
* Bisa digunakan ulang oleh user
* Bisa ditempel ke dokumen (PDF/surat)

---

## 2. Ruang Lingkup

### Yang dibangun

* Canvas tanda tangan di frontend
* Penyimpanan hasil tanda tangan
* Preview tanda tangan
* Fitur penggunaan tanda tangan ke dokumen
* Penempatan tanda tangan di dokumen (manual positioning awal)

### Yang belum (fase lanjutan)

* Validasi legal e-signature
* Multi-page drag & drop editor
* Template surat dinamis penuh

---

## 3. Arsitektur Sistem

Frontend (React)

* Signature Pad (canvas)
* Preview hasil tanda tangan
* UI pilih & pakai tanda tangan

Backend (Node.js / API kamu)

* Endpoint simpan tanda tangan
* Endpoint ambil tanda tangan user
* Integrasi ke dokumen generator

Storage

* Database: simpan Base64 atau URL gambar
* Alternatif lebih baik: simpan sebagai file (S3 / storage VPS)

---

## 4. Teknologi yang Digunakan

Frontend:

* React
* react-signature-canvas

Backend:

* Express.js (atau framework kamu)
* Multer (jika simpan file)
* PDF generator (pdf-lib / pdfkit)

Storage:

* MySQL / PostgreSQL (metadata)
* File storage (local / cloud)

---

## 5. Alur Fitur

### A. Membuat Tanda Tangan

1. User membuka halaman tanda tangan
2. User menggambar di canvas
3. User klik "Simpan"
4. Data diubah menjadi Base64 PNG
5. Data dikirim ke backend
6. Backend menyimpan data tanda tangan

---

### B. Menampilkan Tanda Tangan

1. Frontend request data tanda tangan user
2. Backend mengembalikan URL/Base64
3. Frontend menampilkan preview

---

### C. Penggunaan ke Dokumen

1. User memilih dokumen/surat
2. User memilih tanda tangan yang tersimpan
3. Sistem membuka preview dokumen
4. User menentukan posisi tanda tangan (manual drag sederhana di tahap awal)
5. Sistem menyimpan posisi (x, y)
6. Backend generate PDF dengan tanda tangan ditempel

---

## 6. Desain Implementasi Frontend

Komponen utama:

* SignaturePadComponent
* SignaturePreview
* DocumentEditor (tempat penempatan tanda tangan)

State yang dibutuhkan:

* signatureImage
* savedSignatures[]
* selectedSignature
* position (x, y)

---

## 7. Desain Backend API

### POST /signature

Menyimpan tanda tangan

Request:

```json
{
  "userId": 1,
  "image": "base64/png"
}
```

---

### GET /signature/:userId

Mengambil semua tanda tangan user

Response:

```json
[
  {
    "id": 1,
    "imageUrl": "...",
    "createdAt": "..."
  }
]
```

---

### POST /document/sign

Menempelkan tanda tangan ke dokumen

Request:

```json
{
  "documentId": 10,
  "signatureId": 2,
  "position": {
    "x": 120,
    "y": 450
  }
}
```

---

## 8. Implementasi Penempatan Tanda Tangan

Tahap 1 (MVP):

* Drag manual di canvas preview PDF
* Simpan koordinat (x, y)

Tahap 2:

* Grid snapping
* Multi signature placement
* Resize tanda tangan

---

## 9. Generasi PDF

Menggunakan:

* pdf-lib

Langkah:

1. Load template PDF
2. Ambil gambar tanda tangan
3. Convert Base64 ke image bytes
4. Draw image ke koordinat tertentu
5. Save PDF baru

---

## 10. Penyimpanan Data

Opsi 1 (simple):

* Simpan Base64 di database

Opsi 2 (recommended):

* Simpan file PNG di storage
* Database hanya menyimpan URL

---

## 11. Risiko & Catatan

* Base64 besar → bisa berat di database
* Perlu optimasi jika user banyak
* Posisi tanda tangan perlu scaling agar cocok di PDF
* Pastikan konsistensi ukuran canvas dan PDF

---

## 12. Roadmap Implementasi

### Phase 1

* Signature pad React
* Save & preview signature
* Backend API save & fetch

### Phase 2

* Integrasi ke PDF
* Manual placement

### Phase 3

* Drag & drop editor
* Multi signature support
* Template surat otomatis
