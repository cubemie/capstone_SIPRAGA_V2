# SIPRAGA V2 — Implementasi Kode Lengkap
> Kode yang harus dibuat dan dimasukkan per fitur, berdasarkan rencana-sipraga, desain-sipraga, dan rincian-sipraga  
> Terakhir diperbarui: Juni 2026

---

## Cara Pakai Dokumen Ini

Setiap section berisi:
- **File yang dibuat/diubah** dengan path lengkap
- **Kode lengkap** yang siap di-paste
- Komentar `// ← TAMBAH` untuk baris baru, `// ← UBAH` untuk baris yang diganti

---

## SPRINT 1 — Stabilisasi Core

---

### 1.1 ProfilePage — Integrasi Data Warga

#### `frontend/src/services/wargaService.js`
Tambah dua fungsi baru di bawah fungsi yang sudah ada:

```js
// ← TAMBAH fungsi baru
export const getProfile = async () => {
  const res = await api.get('/api/warga/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/api/warga/profile', data);
  return res.data;
};
```

---

#### `frontend/src/pages/ProfilePage.jsx`
Ganti isi file ini seluruhnya:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { getProfile, updateProfile } from '../services/wargaService';

const profileSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
  alamat: z.string().min(5, 'Alamat terlalu pendek'),
  NIK: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh angka'),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          nama: profile.nama ?? '',
          email: profile.email ?? '',
          no_hp: profile.no_hp ?? '',
          alamat: profile.alamat ?? '',
          NIK: profile.NIK ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Gagal memperbarui profil');
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      {/* Foto KTP */}
      {profile?.foto_ktp && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
          <img
            src={profile.foto_ktp}
            alt="Foto KTP"
            className="w-48 h-32 object-cover rounded-lg border"
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { name: 'nama', label: 'Nama Lengkap', type: 'text' },
          { name: 'NIK', label: 'NIK (16 digit)', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'no_hp', label: 'Nomor HP', type: 'text' },
          { name: 'alamat', label: 'Alamat', type: 'textarea' },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {type === 'textarea' ? (
              <textarea
                {...register(name)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                {...register(name)}
                type={type}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors[name] && (
              <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
```

---

#### `backend/src/controllers/ProfileController.js`
Ganti atau buat file ini:

```js
import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const [rows] = await pool.query(
      `SELECT id_warga, NIK, nama, email, no_hp, tempat_lahir, tanggal_lahir,
              jenis_kelamin, alamat, rt, rw, kelurahan_desa, kecamatan,
              agama, status_perkawinan, pekerjaan, kewarganegaraan, foto_ktp
       FROM warga WHERE id_warga = ?`,
      [id_warga]
    );
    if (!rows.length) return errorResponse(res, 404, 'Profil tidak ditemukan');
    return successResponse(res, 200, 'Profil berhasil diambil', rows[0]);
  } catch (err) {
    return errorResponse(res, 500, 'Gagal mengambil profil', err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id_warga } = req.user;
    const { nama, email, no_hp, alamat, NIK } = req.body;

    // Validasi NIK 16 digit
    if (NIK && !/^\d{16}$/.test(NIK)) {
      return errorResponse(res, 400, 'NIK harus 16 digit angka');
    }

    await pool.query(
      `UPDATE warga SET nama=?, email=?, no_hp=?, alamat=?, NIK=?
       WHERE id_warga=?`,
      [nama, email, no_hp, alamat, NIK, id_warga]
    );

    return successResponse(res, 200, 'Profil berhasil diperbarui');
  } catch (err) {
    return errorResponse(res, 500, 'Gagal memperbarui profil', err.message);
  }
};
```

---

#### `backend/src/routes/wargaRoutes.js`
Tambah dua route baru:

```js
import express from 'express';
import { getProfile, updateProfile } from '../controllers/ProfileController.js'; // ← TAMBAH import
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// ← TAMBAH dua route ini
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
```

---

### 1.2 Konfigurasi Redis untuk BullMQ

#### `backend/src/config/queue.js`
Ganti isi file ini:

```js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',  // ← baca dari env
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

connection.on('connect', () => {
  console.log('[Redis] Connected');
});

export const pdfQueue = new Queue('pdf-generation', { connection });

export { connection };
```

---

#### `backend/src/modules/letters/sub-modules/pdf/pdf.queue.js`
Ganti isi file ini:

```js
import { Worker } from 'bullmq';
import { connection } from '../../../../config/queue.js';
import { PdfService } from './pdf.service.js';
import pool from '../../../../config/db.js';

const pdfService = new PdfService();

const worker = new Worker(
  'pdf-generation',
  async (job) => {
    const { letterId, type } = job.data;
    console.log(`[PDF Queue] Processing job ${job.id} — letterId: ${letterId}, type: ${type}`);

    try {
      const pdfBuffer = await pdfService.generateForLetter(letterId);

      // Simpan ke letter_pdf_versions
      await pool.query(
        `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [letterId, 1, type || 'preview', `data:application/pdf;base64,${pdfBuffer.toString('base64')}`]
      );

      console.log(`[PDF Queue] Job ${job.id} selesai`);
    } catch (err) {
      console.error(`[PDF Queue] Job ${job.id} gagal:`, err.message);
      throw err;
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error(`[PDF Queue] Job ${job?.id} failed:`, err.message);
});

export default worker;
```

---

#### `backend/src/server.js`
Tambah satu baris import di bagian atas, setelah import-import yang sudah ada:

```js
// ← TAMBAH baris ini untuk start queue worker saat server boot
import './modules/letters/sub-modules/pdf/pdf.queue.js';
```

---

#### `backend/.env.example`
Tambah variabel berikut ke file `.env.example`:

```env
# ── Queue (BullMQ) ───────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379

# ── Storage: Supabase ────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# ── Storage: Cloudinary ───────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### 1.3 Step 6 PDF Preview — Integrasi Frontend

#### `backend/src/modules/letters/letters.routes.js`
Tambah satu route baru:

```js
// ← TAMBAH route preview PDF
router.get('/:uuid/preview-pdf', authMiddleware, getPreviewPdf);
```

---

#### `backend/src/modules/letters/letters.controller.js`
Tambah handler `getPreviewPdf`:

```js
export const getPreviewPdf = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Cari letter by UUID
    const [letters] = await pool.query(
      'SELECT id FROM letters WHERE uuid = ?',
      [uuid]
    );
    if (!letters.length) return errorResponse(res, 404, 'Surat tidak ditemukan');

    const letterId = letters[0].id;

    // Cek apakah preview sudah ada
    const [existing] = await pool.query(
      `SELECT file_url FROM letter_pdf_versions
       WHERE letter_id = ? AND type = 'preview'
       ORDER BY generated_at DESC LIMIT 1`,
      [letterId]
    );

    if (existing.length) {
      return successResponse(res, 200, 'PDF preview tersedia', {
        pdf_url: existing[0].file_url,
      });
    }

    // Generate preview baru
    const pdfService = new PdfService();
    const pdfBuffer = await pdfService.generateForLetter(letterId);

    // Simpan ke letter_pdf_versions
    await pool.query(
      `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
       VALUES (?, 1, 'preview', ?, NOW())`,
      [letterId, `data:application/pdf;base64,${pdfBuffer.toString('base64')}`]
    );

    return successResponse(res, 200, 'PDF preview berhasil digenerate', {
      pdf_url: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Gagal generate PDF preview', err.message);
  }
};
```

---

#### `frontend/src/features/letters/components/wizard/Step6PdfPreview.jsx`
Ganti isi file ini:

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import api from '../../../../../utils/api';

// Setup worker react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const fetchPreviewPdf = async (uuid) => {
  const res = await api.get(`/api/v2/letters/${uuid}/preview-pdf`);
  return res.data.data.pdf_url;
};

export default function Step6PdfPreview({ draftUuid }) {
  const [numPages, setNumPages] = useState(null);

  const { data: pdfUrl, isLoading, isError } = useQuery({
    queryKey: ['pdf-preview', draftUuid],
    queryFn: () => fetchPreviewPdf(draftUuid),
    enabled: !!draftUuid,
    staleTime: 1000 * 60 * 5, // cache 5 menit
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Preview Surat</h2>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="preview-surat.pdf"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Download Preview
          </a>
        )}
      </div>

      <div className="border rounded-lg bg-gray-50 min-h-96 flex items-center justify-center">
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Sedang generate PDF...</p>
          </div>
        )}

        {isError && (
          <p className="text-red-500 text-sm">Gagal memuat PDF preview.</p>
        )}

        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="flex flex-col items-center gap-2"
          >
            {Array.from({ length: numPages || 1 }, (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={600}
                className="shadow-md"
              />
            ))}
          </Document>
        )}
      </div>

      {numPages && (
        <p className="text-xs text-center text-gray-400">
          {numPages} halaman
        </p>
      )}
    </div>
  );
}
```

---

### 1.4 LetterListPage — Fetch Data Real

#### `frontend/src/services/suratService.js`
Tambah fungsi baru:

```js
// ← TAMBAH
export const getLettersV2 = async () => {
  const res = await api.get('/api/v2/letters');
  return res.data.data;
};
```

---

#### `frontend/src/constants/suratStatus.js`
Tambah status V2 di bawah status V1 yang sudah ada:

```js
// ← TAMBAH konstanta V2
export const LETTER_STATUS_V2 = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Menunggu RT', color: 'bg-yellow-100 text-yellow-700' },
  in_review_rt: { label: 'Diproses RT', color: 'bg-blue-100 text-blue-700' },
  approved_rt: { label: 'Disetujui RT', color: 'bg-cyan-100 text-cyan-700' },
  in_review_rw: { label: 'Diproses RW', color: 'bg-indigo-100 text-indigo-700' },
  approved_rw: { label: 'Disetujui RW', color: 'bg-purple-100 text-purple-700' },
  revision_requested: { label: 'Perlu Revisi', color: 'bg-orange-100 text-orange-700' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-200 text-gray-500' },
};
```

---

#### `frontend/src/features/letters/pages/LetterListPage.jsx`
Ganti isi file ini:

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLettersV2 } from '../../../services/suratService';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'process', label: 'Proses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'rejected', label: 'Ditolak' },
];

const PROCESS_STATUSES = ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw', 'approved_rw'];

export default function LetterListPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters-v2'],
    queryFn: getLettersV2,
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'process') return PROCESS_STATUSES.includes(l.status);
    if (activeTab === 'completed') return l.status === 'completed';
    if (activeTab === 'rejected') return ['rejected', 'cancelled'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Surat Saya</h1>
        <Link
          to="/letters/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Ajukan Surat
        </Link>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-lg">Belum ada surat</p>
          <p className="text-sm mt-1">Klik "+ Ajukan Surat" untuk mulai</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((letter) => {
          const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
            label: letter.status,
            color: 'bg-gray-100 text-gray-600',
          };
          return (
            <Link
              key={letter.uuid}
              to={`/letters/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {letter.letter_type_name ?? letter.subject ?? 'Surat'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 1.5 LetterDetailPage — Data Lengkap + Timeline

#### `backend/src/modules/letters/letters.model.js`
Tambah method `getDetailByUuid`:

```js
// ← TAMBAH method ini di class/object LetterModel
async getDetailByUuid(uuid) {
  const [rows] = await pool.query(
    `SELECT l.*,
            lt.name AS letter_type_name,
            w.nama AS resident_name, w.NIK AS resident_nik,
            lwo.name AS workflow_name, lwo.steps AS workflow_steps
     FROM letters l
     JOIN letter_types lt ON l.letter_type_id = lt.id
     JOIN warga w ON l.resident_id = w.id_warga
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     WHERE l.uuid = ?`,
    [uuid]
  );
  if (!rows.length) return null;

  const letter = rows[0];

  // Field values
  const [fieldValues] = await pool.query(
    'SELECT field_key, value FROM letter_field_values WHERE letter_id = ?',
    [letter.id]
  );

  // Approval history
  const [approvals] = await pool.query(
    `SELECT la.*, 
            COALESCE(r.nama_ketua, rw.nama_ketua) AS approver_name
     FROM letter_approvals la
     LEFT JOIN rt r ON la.approver_id = r.rt_id
     LEFT JOIN rw rw ON la.approver_id = rw.rw_id
     WHERE la.letter_id = ?
     ORDER BY la.acted_at ASC`,
    [letter.id]
  );

  // PDF versions
  const [pdfVersions] = await pool.query(
    `SELECT type, file_url, generated_at
     FROM letter_pdf_versions
     WHERE letter_id = ?
     ORDER BY generated_at DESC`,
    [letter.id]
  );

  return {
    ...letter,
    field_values: fieldValues,
    approvals,
    pdf_versions: pdfVersions,
  };
}
```

---

#### `frontend/src/features/letters/pages/LetterDetailPage.jsx`
Ganti isi file ini:

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import api from '../../../utils/api';

const fetchLetterDetail = async (uuid) => {
  const res = await api.get(`/api/v2/letters/${uuid}`);
  return res.data.data;
};

const STATUS_ORDER = [
  'draft', 'submitted', 'in_review_rt', 'approved_rt',
  'in_review_rw', 'approved_rw', 'completed',
];

export default function LetterDetailPage() {
  const { uuid } = useParams();

  const { data: letter, isLoading } = useQuery({
    queryKey: ['letter-detail', uuid],
    queryFn: () => fetchLetterDetail(uuid),
    enabled: !!uuid,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-400 py-16">
        Surat tidak ditemukan.
      </div>
    );
  }

  const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
    label: letter.status,
    color: 'bg-gray-100 text-gray-600',
  };

  const finalPdf = letter.pdf_versions?.find((p) => p.type === 'final');
  const currentStatusIndex = STATUS_ORDER.indexOf(letter.status);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {letter.letter_type_name}
          </h1>
          {letter.letter_number && (
            <p className="text-sm text-gray-500 mt-1">
              No. Surat: <span className="font-mono">{letter.letter_number}</span>
            </p>
          )}
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Status Tracker */}
      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Progres</p>
        <div className="flex items-center gap-0">
          {STATUS_ORDER.filter((s) => !['approved_rw'].includes(s)).map((s, i, arr) => {
            const done = STATUS_ORDER.indexOf(s) <= currentStatusIndex;
            const isLast = i === arr.length - 1;
            return (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    done ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 ${
                      done ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Draft</span>
          <span className="text-xs text-gray-400">Selesai</span>
        </div>
      </div>

      {/* Data Surat */}
      {letter.field_values?.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Data Surat</p>
          <dl className="space-y-2">
            {letter.field_values.map((fv) => (
              <div key={fv.field_key} className="flex gap-2 text-sm">
                <dt className="text-gray-500 capitalize w-40 flex-shrink-0">
                  {fv.field_key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-gray-800">{fv.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Timeline Approval */}
      {letter.approvals?.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Riwayat Proses</p>
          <div className="space-y-3">
            {letter.approvals.map((a) => (
              <div key={a.id} className="flex gap-3 text-sm">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.action === 'approved'
                      ? 'bg-green-500'
                      : a.action === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                />
                <div>
                  <p className="text-gray-800">
                    <span className="font-medium">{a.approver_name}</span>{' '}
                    {a.action === 'approved'
                      ? '✅ Menyetujui'
                      : a.action === 'rejected'
                      ? '❌ Menolak'
                      : '🔄 Minta Revisi'}
                  </p>
                  {a.notes && (
                    <p className="text-gray-400 text-xs mt-0.5">{a.notes}</p>
                  )}
                  <p className="text-gray-400 text-xs">
                    {new Date(a.acted_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download PDF Final */}
      {finalPdf && (
        <a
          href={finalPdf.file_url}
          download="surat-selesai.pdf"
          className="block text-center w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
        >
          ⬇ Download Surat Final
        </a>
      )}
    </div>
  );
}
```

---

## SPRINT 2 — RT/RW Inbox & Approval

---

### 2.1 LetterInboxPage untuk RT/RW

#### `backend/src/modules/letters/letters.model.js`
Tambah method `getInboxByRole`:

```js
// ← TAMBAH
async getInboxByRole(role, tenantId) {
  let statusFilter;
  if (role === 'rt') {
    statusFilter = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
  } else if (role === 'rw') {
    statusFilter = `l.status IN ('approved_rt', 'in_review_rw')`;
  } else {
    return [];
  }

  const params = role === 'rt' ? [tenantId] : [];
  const [rows] = await pool.query(
    `SELECT l.uuid, l.status, l.created_at, l.subject,
            lt.name AS letter_type_name,
            w.nama AS resident_name
     FROM letters l
     JOIN letter_types lt ON l.letter_type_id = lt.id
     JOIN warga w ON l.resident_id = w.id_warga
     WHERE ${statusFilter}
     ORDER BY l.created_at DESC`,
    params
  );
  return rows;
}
```

---

#### `backend/src/modules/letters/letters.routes.js`
Tambah route inbox:

```js
import authRtRwMiddleware from '../../middlewares/authRtRwMiddleware.js';

// ← TAMBAH
router.get('/inbox', authRtRwMiddleware, getInbox);
```

---

#### `backend/src/modules/letters/letters.controller.js`
Tambah handler `getInbox`:

```js
// ← TAMBAH
export const getInbox = async (req, res) => {
  try {
    const { role } = req.user;
    const tenantId = req.tenantId;
    const letters = await LetterModel.getInboxByRole(role, tenantId);
    return successResponse(res, 200, 'Inbox berhasil diambil', letters);
  } catch (err) {
    return errorResponse(res, 500, 'Gagal mengambil inbox', err.message);
  }
};
```

---

#### `frontend/src/features/letters/pages/LetterInboxPage.jsx`
Ganti isi file ini:

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import api from '../../../utils/api';

const fetchInbox = async () => {
  const res = await api.get('/api/v2/letters/inbox');
  return res.data.data;
};

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'process', label: 'Diproses' },
];

export default function LetterInboxPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['inbox-rtrw'],
    queryFn: fetchInbox,
    refetchInterval: 30000, // refresh tiap 30 detik
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return ['submitted', 'approved_rt'].includes(l.status);
    if (activeTab === 'process') return ['in_review_rt', 'in_review_rw'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inbox Surat Masuk</h1>

      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p>Tidak ada surat masuk</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((letter) => {
          const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
            label: letter.status,
            color: 'bg-gray-100 text-gray-600',
          };
          return (
            <Link
              key={letter.uuid}
              to={`/letters/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{letter.resident_name}</p>
                  <p className="text-sm text-gray-500">{letter.letter_type_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Proses →</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 2.2 Approve / Reject di LetterDetailPage (Mode RT/RW)

#### `backend/src/modules/letters/sub-modules/approvals/approvals.service.js`
Ganti atau buat file ini:

```js
import pool from '../../../../config/db.js';
import { pdfQueue } from '../../../../config/queue.js';

const STATUS_TRANSITIONS = {
  // RT_ONLY workflow
  RT_ONLY: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  // RT_THEN_RW workflow
  RT_THEN_RW: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw: { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

export const approveLetter = async (letterId, approverId, role, notes, signatureUrl) => {
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     WHERE l.id = ?`,
    [letterId]
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error('Workflow tidak dikenal');

  const transition = workflow[role];
  if (!transition) throw new Error(`Role ${role} tidak bisa approve workflow ini`);
  if (!transition.from.includes(letter.status)) {
    throw new Error(`Status saat ini (${letter.status}) tidak bisa di-approve`);
  }

  const nextStatus = transition.to;

  // Insert approval history
  await pool.query(
    `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
     VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
    [letterId, approverId, letter.current_step, notes, signatureUrl]
  );

  // Update status surat
  const updateFields =
    nextStatus === 'completed'
      ? 'status = ?, completed_at = NOW(), current_step = current_step + 1'
      : 'status = ?, current_step = current_step + 1';

  await pool.query(`UPDATE letters SET ${updateFields} WHERE id = ?`, [
    nextStatus,
    letterId,
  ]);

  // Trigger PDF final jika selesai
  if (nextStatus === 'completed') {
    await pdfQueue.add('generate-pdf', { letterId, type: 'final' });
  }

  return { nextStatus };
};

export const rejectLetter = async (letterId, approverId, role, notes) => {
  const [[letter]] = await pool.query('SELECT * FROM letters WHERE id = ?', [letterId]);
  if (!letter) throw new Error('Surat tidak ditemukan');

  await pool.query(
    `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
     VALUES (?, ?, ?, 'rejected', ?, NOW())`,
    [letterId, approverId, letter.current_step, notes]
  );

  await pool.query(
    `UPDATE letters SET status = 'rejected', rejected_by_role = ? WHERE id = ?`,
    [role, letterId]
  );
};
```

---

#### Tambah tombol Approve/Reject di `frontend/src/features/letters/pages/LetterDetailPage.jsx`
Tambah bagian ini di bawah timeline approval (sebelum penutup `</div>`):

```jsx
// Tambah di atas file (import)
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tambah di dalam komponen, sebelum return
const { user } = useContext(AuthContext);
const queryClient = useQueryClient();
const [rejectNotes, setRejectNotes] = useState('');
const [approveNotes, setApproveNotes] = useState('');

const approveMutation = useMutation({
  mutationFn: () =>
    api.post(`/api/v2/letters/${uuid}/approve`, { notes: approveNotes }),
  onSuccess: () => {
    toast.success('Surat berhasil disetujui');
    queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
  },
  onError: () => toast.error('Gagal menyetujui surat'),
});

const rejectMutation = useMutation({
  mutationFn: () =>
    api.post(`/api/v2/letters/${uuid}/reject`, { notes: rejectNotes }),
  onSuccess: () => {
    toast.success('Surat ditolak');
    queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
  },
  onError: () => toast.error('Gagal menolak surat'),
});

// Tambah JSX ini di dalam return, setelah section timeline approval
const canAct =
  (user?.role === 'rt' && ['submitted', 'in_review_rt'].includes(letter?.status)) ||
  (user?.role === 'rw' && ['approved_rt', 'in_review_rw'].includes(letter?.status));

{canAct && (
  <div className="bg-white border rounded-lg p-4 space-y-4">
    <p className="text-sm font-medium text-gray-700">Tindakan</p>
    <div>
      <label className="text-xs text-gray-500">Catatan (opsional)</label>
      <textarea
        value={approveNotes}
        onChange={(e) => setApproveNotes(e.target.value)}
        rows={2}
        placeholder="Catatan untuk warga..."
        className="w-full border rounded px-3 py-2 text-sm mt-1"
      />
    </div>
    <div className="flex gap-3">
      <button
        onClick={() => approveMutation.mutate()}
        disabled={approveMutation.isPending}
        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        ✅ Setujui
      </button>
      <button
        onClick={() => rejectMutation.mutate()}
        disabled={rejectMutation.isPending}
        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
      >
        ❌ Tolak
      </button>
    </div>
    {/* Field alasan tolak */}
    <div>
      <label className="text-xs text-gray-500">Alasan penolakan (jika ditolak)</label>
      <textarea
        value={rejectNotes}
        onChange={(e) => setRejectNotes(e.target.value)}
        rows={2}
        placeholder="Tulis alasan penolakan..."
        className="w-full border rounded px-3 py-2 text-sm mt-1"
      />
    </div>
  </div>
)}
```

---

### 2.3 Tenant ID Otomatis dari JWT

#### `backend/src/services/AuthService.js`
Di fungsi `loginRtRw()`, tambah `rw_id` ke payload JWT untuk RT:

```js
// Cari bagian sign JWT untuk role RT, lalu ubah menjadi:
const token = jwt.sign(
  {
    id: rt.rt_id,
    rw_id: rt.rw_id,       // ← TAMBAH field ini
    username: rt.username,
    nama: rt.nama_ketua,
    role: 'rt',
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);
```

---

#### `backend/src/middlewares/authRtRwMiddleware.js`
Tambah `req.tenantId` setelah verify:

```js
// Setelah baris: req.user = decoded;
// ← TAMBAH
req.tenantId = decoded.rw_id || decoded.id;
```

---

## SPRINT 3 — Canvas TTD & QR Verify

---

### 3.1 Canvas Signature Pad di TtdSurat.jsx

#### `frontend/src/services/ttdService.js`
Tambah fungsi:

```js
// ← TAMBAH
export const uploadTtd = async (formData) => {
  const res = await api.post('/api/ttd/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getTtd = async () => {
  const res = await api.get('/api/ttd');
  return res.data;
};
```

---

#### `frontend/src/pages/rtrw/TtdSurat.jsx`
Ganti isi file ini:

```jsx
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import { getTtd, uploadTtd } from '../../services/ttdService';

const dataURLtoBlob = (dataUrl) => {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
};

export default function TtdSurat() {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'draw'
  const queryClient = useQueryClient();

  const { data: ttdData } = useQuery({
    queryKey: ['ttd'],
    queryFn: getTtd,
  });

  const mutation = useMutation({
    mutationFn: uploadTtd,
    onSuccess: () => {
      toast.success('TTD berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['ttd'] });
    },
    onError: () => toast.error('Gagal menyimpan TTD'),
  });

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('ttd', file);
    mutation.mutate(formData);
  };

  const handleSaveCanvas = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error('Tanda tangan masih kosong');
      return;
    }
    const dataUrl = sigCanvas.current.toDataURL('image/png');
    const blob = dataURLtoBlob(dataUrl);
    const formData = new FormData();
    formData.append('ttd', blob, 'ttd.png');
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tanda Tangan Digital</h1>

      {/* TTD Tersimpan */}
      {ttdData?.ttd_digital && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-600 mb-2">TTD Saat Ini</p>
          <img
            src={ttdData.ttd_digital}
            alt="TTD Tersimpan"
            className="max-h-24 border rounded bg-white p-2"
          />
        </div>
      )}

      {/* Tab */}
      <div className="flex gap-2 border-b mb-4">
        {[
          { key: 'upload', label: 'Upload File' },
          { key: 'draw', label: 'Gambar TTD' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleUploadFile}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={mutation.isPending}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-12 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <p className="text-lg">📎</p>
            <p className="text-sm mt-1">Klik untuk pilih file PNG/JPG</p>
          </button>
        </div>
      )}

      {activeTab === 'draw' && (
        <div>
          <div className="border rounded-lg overflow-hidden bg-white mb-3">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 560,
                height: 200,
                className: 'w-full',
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => sigCanvas.current.clear()}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Hapus
            </button>
            <button
              onClick={handleSaveCanvas}
              disabled={mutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan TTD'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3.2 QrVerifyPage — Implementasi Penuh

#### `backend/src/modules/letters/letters.routes.js`
Tambah route publik (tanpa auth):

```js
// ← TAMBAH — tidak perlu authMiddleware karena publik
router.get('/verify/:qrToken', verifyByQrToken);
```

---

#### `backend/src/modules/letters/letters.controller.js`
Tambah handler:

```js
// ← TAMBAH
export const verifyByQrToken = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const [rows] = await pool.query(
      `SELECT l.letter_number, l.status, l.completed_at,
              lt.name AS letter_type_name,
              w.nama AS resident_name
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       JOIN warga w ON l.resident_id = w.id_warga
       WHERE l.qr_token = ?`,
      [qrToken]
    );

    if (!rows.length) {
      return res.status(404).json({ valid: false, message: 'Surat tidak ditemukan' });
    }

    const letter = rows[0];
    return res.json({
      valid: true,
      letter_number: letter.letter_number,
      letter_type: letter.letter_type_name,
      resident_name: letter.resident_name,
      status: letter.status,
      completed_at: letter.completed_at,
    });
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
};
```

---

#### `frontend/src/features/letters/pages/QrVerifyPage.jsx`
Ganti isi file ini:

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

const verifyLetter = async (qrToken) => {
  const res = await api.get(`/api/v2/letters/verify/${qrToken}`);
  return res.data;
};

export default function QrVerifyPage() {
  const { qrToken } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', qrToken],
    queryFn: () => verifyLetter(qrToken),
    enabled: !!qrToken,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <p className="text-4xl mb-2">🔍</p>
          <h1 className="text-xl font-bold">Verifikasi Surat</h1>
          <p className="text-blue-100 text-sm mt-1">SIPRAGA V2</p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">Memverifikasi surat...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <p className="text-5xl mb-3">❌</p>
              <p className="text-red-600 font-semibold">Surat tidak valid</p>
              <p className="text-gray-400 text-sm mt-1">
                Token QR tidak ditemukan atau sudah kedaluwarsa.
              </p>
            </div>
          )}

          {data && !data.valid && (
            <div className="text-center py-8">
              <p className="text-5xl mb-3">❌</p>
              <p className="text-red-600 font-semibold">Surat tidak valid</p>
            </div>
          )}

          {data?.valid && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg py-3">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">Surat Terverifikasi</span>
              </div>

              <dl className="space-y-3">
                {[
                  { label: 'Nama Warga', value: data.resident_name },
                  { label: 'Jenis Surat', value: data.letter_type },
                  { label: 'Nomor Surat', value: data.letter_number ?? '-' },
                  {
                    label: 'Tanggal Selesai',
                    value: data.completed_at
                      ? new Date(data.completed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-',
                  },
                  { label: 'Status', value: data.status },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm border-b pb-2">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="text-gray-800 font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-300">
            Dikeluarkan oleh SIPRAGA — Sistem Informasi Persuratan Digital RT/RW
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## SPRINT 4 — Superadmin & Analytics

---

### 4.1 Dashboard Superadmin — Data Real

#### `backend/src/routes/superAdminRoutes.js`
Tambah route statistik:

```js
import { getStats } from '../controllers/authController.js';

// ← TAMBAH
router.get('/stats', superAdminMiddleware, getStats);
```

---

#### `backend/src/controllers/authController.js`
Tambah handler `getStats`:

```js
// ← TAMBAH
export const getStats = async (req, res) => {
  try {
    const [[{ total_warga }]] = await pool.query(
      'SELECT COUNT(*) AS total_warga FROM warga'
    );
    const [[{ total_rt }]] = await pool.query('SELECT COUNT(*) AS total_rt FROM rt');
    const [[{ total_rw }]] = await pool.query('SELECT COUNT(*) AS total_rw FROM rw');

    const [suratV1] = await pool.query(
      'SELECT status, COUNT(*) AS total FROM pengajuan_surat GROUP BY status'
    );
    const [suratV2] = await pool.query(
      'SELECT status, COUNT(*) AS total FROM letters GROUP BY status'
    );

    return successResponse(res, 200, 'Statistik berhasil diambil', {
      total_warga,
      total_rt,
      total_rw,
      surat_v1: suratV1,
      surat_v2: suratV2,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Gagal mengambil statistik', err.message);
  }
};
```

---

#### `frontend/src/pages/superadmin/Dashboard.jsx`
Tambah section statistik (tambah di atas komponen tabel yang sudah ada):

```jsx
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

const fetchStats = async () => {
  const res = await api.get('/api/superadmin/stats');
  return res.data.data;
};

// Di dalam komponen Dashboard, tambah:
const { data: stats } = useQuery({
  queryKey: ['superadmin-stats'],
  queryFn: fetchStats,
});

// JSX yang ditambahkan (sebelum tabel RT/RW):
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {[
    { label: 'Total Warga', value: stats?.total_warga ?? '—', color: 'bg-blue-50 text-blue-700' },
    { label: 'Jumlah RT', value: stats?.total_rt ?? '—', color: 'bg-green-50 text-green-700' },
    { label: 'Jumlah RW', value: stats?.total_rw ?? '—', color: 'bg-purple-50 text-purple-700' },
    {
      label: 'Surat V2',
      value: stats?.surat_v2?.reduce((a, b) => a + Number(b.total), 0) ?? '—',
      color: 'bg-orange-50 text-orange-700',
    },
  ].map(({ label, value, color }) => (
    <div key={label} className={`rounded-lg p-4 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-70">{label}</p>
    </div>
  ))}
</div>
```

---

## SPRINT 5 — Docker & CI/CD

---

### 5.1 docker-compose.yml (root proyek)
Buat file baru di root proyek:

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: capstone
    volumes:
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  backend:
    build: ./backend
    restart: always
    env_file: ./backend/.env
    environment:
      DB_HOST: db
      REDIS_HOST: redis
      DB_NAME: capstone
      DB_USER: root
      DB_PASSWORD: root
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  mysql_data:
```

---

### 5.2 CI/CD Frontend — `.github/workflows/frontend.yml`
Buat file baru:

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
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build
        run: cd frontend && npm run build

      - name: Check build output
        run: ls -la frontend/dist
```

---

## Ringkasan File yang Dibuat/Diubah

| Sprint | File | Status |
|---|---|---|
| 1.1 | `frontend/src/services/wargaService.js` | Tambah 2 fungsi |
| 1.1 | `frontend/src/pages/ProfilePage.jsx` | Ganti semua |
| 1.1 | `backend/src/controllers/ProfileController.js` | Ganti semua |
| 1.1 | `backend/src/routes/wargaRoutes.js` | Tambah 2 route |
| 1.2 | `backend/src/config/queue.js` | Ganti semua |
| 1.2 | `backend/src/modules/letters/sub-modules/pdf/pdf.queue.js` | Ganti semua |
| 1.2 | `backend/src/server.js` | Tambah 1 baris import |
| 1.2 | `backend/.env.example` | Tambah 7 variabel |
| 1.3 | `backend/src/modules/letters/letters.routes.js` | Tambah route preview |
| 1.3 | `backend/src/modules/letters/letters.controller.js` | Tambah `getPreviewPdf` |
| 1.3 | `frontend/.../Step6PdfPreview.jsx` | Ganti semua |
| 1.4 | `frontend/src/services/suratService.js` | Tambah `getLettersV2` |
| 1.4 | `frontend/src/constants/suratStatus.js` | Tambah `LETTER_STATUS_V2` |
| 1.4 | `frontend/.../LetterListPage.jsx` | Ganti semua |
| 1.5 | `backend/.../letters.model.js` | Tambah `getDetailByUuid` |
| 1.5 | `frontend/.../LetterDetailPage.jsx` | Ganti semua |
| 2.1 | `backend/.../letters.model.js` | Tambah `getInboxByRole` |
| 2.1 | `backend/.../letters.routes.js` | Tambah route inbox |
| 2.1 | `backend/.../letters.controller.js` | Tambah `getInbox` |
| 2.1 | `frontend/.../LetterInboxPage.jsx` | Ganti semua |
| 2.2 | `backend/.../approvals.service.js` | Ganti semua |
| 2.2 | `frontend/.../LetterDetailPage.jsx` | Tambah tombol Approve/Reject |
| 2.3 | `backend/src/services/AuthService.js` | Tambah `rw_id` ke JWT RT |
| 2.3 | `backend/src/middlewares/authRtRwMiddleware.js` | Tambah `req.tenantId` |
| 3.1 | `frontend/src/services/ttdService.js` | Tambah 2 fungsi |
| 3.1 | `frontend/src/pages/rtrw/TtdSurat.jsx` | Ganti semua |
| 3.2 | `backend/.../letters.routes.js` | Tambah route verify publik |
| 3.2 | `backend/.../letters.controller.js` | Tambah `verifyByQrToken` |
| 3.2 | `frontend/.../QrVerifyPage.jsx` | Ganti semua |
| 4.1 | `backend/src/routes/superAdminRoutes.js` | Tambah route stats |
| 4.1 | `backend/src/controllers/authController.js` | Tambah `getStats` |
| 4.1 | `frontend/src/pages/superadmin/Dashboard.jsx` | Tambah stats cards |
| 5.1 | `docker-compose.yml` (root) | Buat baru |
| 5.2 | `.github/workflows/frontend.yml` | Buat baru |
