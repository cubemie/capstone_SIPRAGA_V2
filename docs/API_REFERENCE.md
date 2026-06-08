# Dokumentasi API RT-RW CORETAX

Dokumen ini berisi daftar endpoint yang dapat digunakan oleh Frontend. Semua endpoint mengembalikan format JSON dengan struktur standar sebagai berikut:

**Success Response:**
```json
{
  "status": "success",
  "message": "Pesan sukses",
  "data": { ... } // opsional, tergantung endpoint
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Pesan error"
}
```

---

## 1. Authentication

### Register Warga
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Body:**
  ```json
  {
    "nik": "1234567890123456",
    "nama": "Budi Santoso",
    "password": "password123"
  }
  ```

### Login Warga
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Body:**
  ```json
  {
    "nik": "1234567890123456",
    "password": "password123"
  }
  ```

### Login Pengurus RT/RW
- **Method:** `POST`
- **URL:** `/api/auth/login-rtrw`
- **Body:**
  ```json
  {
    "username": "rt01",
    "password": "password123"
  }
  ```

### Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

---

## 2. Profil Warga

### Get Profil Sendiri
- **Method:** `GET`
- **URL:** `/api/warga/profil`
- **Headers:** `Authorization: Bearer <token>`

### Lengkapi Data Diri (Multipart)
- **Method:** `PUT`
- **URL:** `/api/warga/lengkapi-data`
- **Headers:** `Authorization: Bearer <token>`
- **Body (form-data):**
  - `nomor_kk` (string)
  - `tempat_lahir` (string)
  - `tanggal_lahir` (YYYY-MM-DD)
  - `jenis_kelamin` (L/P)
  - `agama` (string)
  - `pendidikan` (string)
  - `pekerjaan` (string)
  - `status_perkawinan` (string)
  - `kewarganegaraan` (string)
  - `foto_ktp` (file)

---

## 3. Pengajuan Surat (Warga)

### Ajukan Surat
- **Method:** `POST`
- **URL:** `/api/surat/ajukan`
- **Headers:** `Authorization: Bearer <token>`
- **Body (form-data):**
  - `jenis_surat` (string, misal: "Surat Keterangan Domisili")
  - `alasan` (string)
  - `fileSurat` (file pdf, opsional)

### Get Riwayat Surat Saya
- **Method:** `GET`
- **URL:** `/api/surat/milik-saya`
- **Headers:** `Authorization: Bearer <token>`

---

## 4. Manajemen Surat (Pengurus RT/RW)

### Get Surat Masuk
- **Method:** `GET`
- **URL:** `/api/surat/masuk`ATAU`/api/surat/menunggu-ttd`
- **Headers:** `Authorization: Bearer <token>`

### Setujui & TTD Surat
- **Method:** `POST`
- **URL:** `/api/surat/tanda-tangani/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body (form-data):**
  - `fileSurat` (file pdf hasil TTD manual, opsional karena bisa TTD otomatis)

### Tolak Surat
- **Method:** `POST`
- **URL:** `/api/surat/tolak/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "alasan": "KTP buram, harap upload ulang"
  }
  ```

---

## 5. Health Check
- **Method:** `GET`
- **URL:** `/health`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Server is running normally."
  }
  ```
