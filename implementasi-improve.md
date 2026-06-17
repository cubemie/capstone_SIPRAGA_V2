# Implementasi UX Improvements — SIPRAGA V2
> Panduan teknis lengkap berdasarkan kode aktual di repository  
> Terakhir diperbarui: Juni 2026

---

## Ringkasan

Dokumen ini menerjemahkan 10 UX improvement dari proposal menjadi **kode nyata** yang bisa langsung di-copy-paste ke repository kamu. Setiap perbaikan dilengkapi path file, kode frontend, dan kode backend yang dibutuhkan.

---

## Daftar Isi

1. [Confirmation Modal Before Submit](#1-confirmation-modal-before-submit)
2. [PDF Preview Before Submission](#2-pdf-preview-sudah-ada--enhancement)
3. [Stepper Progress Navigation](#3-stepper-progress-navigation)
4. [Loading State After Submit](#4-loading-state-after-submit)
5. [Success Modal yang Lebih Informatif](#5-success-modal-yang-lebih-informatif)
6. [Real-Time Form Validation](#6-real-time-form-validation)
7. [Status Tracking Timeline](#7-status-tracking-timeline)
8. [Reject Flow + Alasan Penolakan](#8-reject-flow--alasan-penolakan)
9. [Profile Completion Warning](#9-profile-completion-warning)
10. [Notification Center](#10-notification-center)

---

## Analisis Status Saat Ini

Sebelum implementasi, ini kondisi kode kamu sekarang:

| UX Item | Status Sekarang | Yang Perlu Ditambah |
|---|---|---|
| Confirmation Modal | ❌ Langsung submit dari header button | Modal konfirmasi sebelum `handleSubmit()` dipanggil |
| PDF Preview | ✅ Sudah ada live preview di kanan | Tombol preview mobile lebih jelas |
| Stepper | ❌ Tidak ada indikator step | Komponen stepper di atas form |
| Loading State | 🟡 Ada `isSubmitting` tapi minimal | Overlay + disabled yang lebih visual |
| Success Modal | 🟡 `Step8Success.jsx` ada tapi sederhana | Nomor pengajuan lebih prominent |
| Form Validation | 🟡 Ada di `Step2FillData` via zod | Tambah inline error yang lebih jelas |
| Status Timeline | 🟡 Ada bar sederhana di `LetterDetailPage` | Ubah ke timeline vertikal step-by-step |
| Reject Flow | 🟡 Alasan ada di `TtdApprovalPanel` | Banner alasan penolakan di warga view |
| Profile Warning | ❌ Tidak ada cek profil sebelum submit | Banner + guard sebelum akses wizard |
| Notification Center | ✅ Ada `NotificationBell.jsx` | Pastikan data real terhubung |

---

## 1. Confirmation Modal Before Submit

### Problem
Di `LetterWizardPage.jsx`, tombol "Kirim Pengajuan" langsung memanggil `handleSubmit()` tanpa konfirmasi. User bisa tidak sengaja submit.

### File yang Diubah
```
frontend/src/features/letters/pages/LetterWizardPage.jsx
frontend/src/components/ui/ConfirmationModal.jsx  ← FILE BARU
```

### Step 1: Buat Komponen `ConfirmationModal.jsx`

```jsx
// frontend/src/components/ui/ConfirmationModal.jsx  ← BUAT FILE BARU

import { X, AlertCircle, Send } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  data = {} 
}) {
  if (!isOpen) return null;

  const { jenisSurat, alurPersetujuan, subjek, keperluan, jumlahLampiran, namaPemohon, nik } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Konfirmasi Pengajuan</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            Pastikan data berikut sudah benar. Setelah dikirim, surat akan diteruskan ke RT untuk diverifikasi.
          </p>

          <div className="bg-[var(--color-surface-muted)] rounded-xl divide-y divide-[var(--color-surface-border)] text-sm overflow-hidden">
            {[
              { label: 'Jenis Surat', value: jenisSurat },
              { label: 'Alur Persetujuan', value: alurPersetujuan },
              { label: 'Subjek', value: subjek },
              { label: 'Keperluan', value: keperluan },
              { label: 'Nama Pemohon', value: namaPemohon },
              { label: 'NIK', value: nik },
              { label: 'Lampiran', value: `${jumlahLampiran || 0} dokumen` },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 px-4 py-3">
                <span className="text-[var(--color-ink-secondary)] w-36 flex-shrink-0">{label}</span>
                <span className="text-[var(--color-ink)] font-medium break-words">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface-muted)] border-t border-[var(--color-surface-border)] flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-[var(--color-surface-border)] text-sm font-medium text-[var(--color-ink)] hover:bg-white transition-colors disabled:opacity-50"
          >
            Kembali Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Pengajuan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Update `LetterWizardPage.jsx`

Cari bagian yang ada tombol "Kirim Pengajuan" dan ubah:

```jsx
// frontend/src/features/letters/pages/LetterWizardPage.jsx

// ← TAMBAH import ini di bagian atas
import { useState, useMemo } from 'react';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import { useAuth } from '../../../context/AuthContext';

const LetterWizardPage = () => {
  const wizard = useLetterWizard();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ← TAMBAH STATE INI

  // ← UBAH handleSubmit: sekarang hanya membuka modal
  const handleOpenConfirm = () => {
    if (!wizard.selectedType) return toast.error('Harap pilih jenis surat');
    if (!wizard.letterContent.subject || !wizard.letterContent.purpose) 
      return toast.error('Harap isi subjek dan keperluan surat');
    if (!wizard.selectedWorkflow) return toast.error('Harap pilih alur persetujuan');
    setShowConfirmModal(true);
  };

  // ← INI yang eksekusi submit sesungguhnya (dipanggil dari modal)
  const handleConfirmSubmit = async () => {
    try {
      const draftData = await wizard.saveDraftAsync();
      const uuid = draftData.uuid;
      if (wizard.attachments && wizard.attachments.length > 0) {
        await wizard.uploadAttachmentsAsync({ uuid, files: wizard.attachments });
      }
      await wizard.submitLetterAsync(uuid);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Submit Flow Error:', error);
    }
  };

  // ... (sisa kode tidak berubah)

  return (
    <div className="min-h-screen ...">
      <header ...>
        {/* ← UBAH onClick tombol Kirim dari handleSubmit ke handleOpenConfirm */}
        <button
          onClick={handleOpenConfirm}  // ← GANTI INI
          disabled={wizard.isSubmitting}
          className="..."
        >
          {/* ... */}
        </button>
      </header>

      {/* ... sisa layout tidak berubah ... */}

      {/* ← TAMBAH Modal di bawah semua JSX sebelum closing tag */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={wizard.isSubmitting}
        data={{
          jenisSurat: wizard.selectedType?.name,
          alurPersetujuan: wizard.selectedWorkflow?.name,
          subjek: wizard.letterContent?.subject,
          keperluan: wizard.letterContent?.purpose,
          jumlahLampiran: wizard.attachments?.length,
          namaPemohon: user?.nama,
          nik: user?.nik,
        }}
      />
    </div>
  );
};
```

---

## 2. PDF Preview (Sudah Ada → Enhancement)

### Analisis
PDF Preview sudah berfungsi di `LetterWizardPage.jsx` (panel kanan desktop + modal mobile). Yang perlu ditingkatkan:
- Tombol preview mobile lebih prominent
- Tambah keterangan "Preview Otomatis" agar user tahu ini real-time

### File yang Diubah
```
frontend/src/features/letters/pages/LetterWizardPage.jsx
```

### Enhancement tombol mobile preview

```jsx
// Di dalam LetterWizardPage.jsx, cari bagian tombol preview mobile (sudah ada)
// Ubah dari:
<button onClick={() => setShowPreview(true)} className="lg:hidden ...">
  <Eye className="w-4 h-4" /> Preview
</button>

// ← Menjadi (lebih prominent, ada badge):
<button
  onClick={() => setShowPreview(true)}
  className="lg:hidden inline-flex items-center gap-1.5 bg-[var(--color-primary)] text-white font-medium text-sm rounded-lg px-3 py-2 hover:bg-[var(--color-primary-dark)]"
>
  <Eye className="w-4 h-4" /> 
  Lihat Surat
  {wizard.selectedType && (
    <span className="w-2 h-2 rounded-full bg-green-400 ml-0.5" title="Live preview aktif" />
  )}
</button>
```

### Enhancement panel preview desktop

```jsx
// Di bagian const previewPanel = ( ... )
// Ubah bagian header panel dari:
<div className="bg-[var(--color-surface-muted)] border-b ... text-xs ...">
  <span>Live Preview PDF</span>
  <span>Dokumen Dinamis</span>
</div>

// ← Menjadi:
<div className="bg-[var(--color-surface-muted)] border-b ... px-4 py-2 flex justify-between items-center">
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    <span className="text-xs text-[var(--color-ink-secondary)] font-semibold uppercase tracking-wider">
      Live Preview PDF
    </span>
  </div>
  <span className="text-xs text-[var(--color-ink-muted)]">Update otomatis saat kamu mengisi data</span>
</div>
```

---

## 3. Stepper Progress Navigation

### Problem
Saat ini wizard adalah single-page scrollable tanpa indikator step mana yang sudah selesai. User tidak tahu di mana posisinya.

### File yang Diubah
```
frontend/src/features/letters/pages/LetterWizardPage.jsx
frontend/src/components/ui/WizardStepper.jsx  ← FILE BARU
```

### Step 1: Buat Komponen `WizardStepper.jsx`

```jsx
// frontend/src/components/ui/WizardStepper.jsx  ← BUAT FILE BARU

import { Check } from 'lucide-react';

const STEPS = [
  { key: 'type', label: 'Jenis Surat', shortLabel: '1' },
  { key: 'data', label: 'Isi Data', shortLabel: '2' },
  { key: 'content', label: 'Isi Surat', shortLabel: '3' },
  { key: 'attachments', label: 'Lampiran', shortLabel: '4' },
  { key: 'workflow', label: 'Alur', shortLabel: '5' },
  { key: 'review', label: 'Kirim', shortLabel: '6' },
];

export default function WizardStepper({ completedSteps = [] }) {
  return (
    <div className="w-full px-4 py-3 bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)]">
      {/* Mobile: horizontal pill steps */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {STEPS.map((step, index) => {
          const isDone = completedSteps.includes(step.key);
          const isLast = index === STEPS.length - 1;
          
          return (
            <div key={step.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-0.5">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isDone 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]'
                  }
                `}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.shortLabel}
                </div>
                <span className={`text-[10px] hidden sm:block font-medium whitespace-nowrap
                  ${isDone ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-muted)]'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {!isLast && (
                <div className={`w-6 sm:w-10 h-0.5 mb-3 sm:mb-0 flex-shrink-0 transition-all
                  ${isDone ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-border)]'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 2: Update `LetterWizardPage.jsx` untuk tracking step

```jsx
// frontend/src/features/letters/pages/LetterWizardPage.jsx

// ← TAMBAH import
import WizardStepper from '../../../components/ui/WizardStepper';

// ← TAMBAH computed completedSteps berdasarkan state wizard
const completedSteps = useMemo(() => {
  const steps = [];
  if (wizard.selectedType) steps.push('type');
  if (wizard.fieldValues && Object.keys(wizard.fieldValues).length > 0) steps.push('data');
  if (wizard.letterContent?.purpose) steps.push('content');
  // Attachments optional, tapi anggap selesai jika sudah melewati step 4
  if (wizard.selectedWorkflow || wizard.attachments?.length > 0) steps.push('attachments');
  if (wizard.selectedWorkflow) steps.push('workflow');
  return steps;
}, [wizard.selectedType, wizard.fieldValues, wizard.letterContent, wizard.attachments, wizard.selectedWorkflow]);

// ← Di dalam return JSX, tambahkan WizardStepper setelah <header> dan sebelum <main>
return (
  <div className="min-h-screen ...">
    <header ...>
      {/* ... existing header content ... */}
    </header>
    
    {/* ← TAMBAH STEPPER DI SINI */}
    <WizardStepper completedSteps={completedSteps} />
    
    <main className="flex-1 flex overflow-hidden">
      {/* ... sisa konten tidak berubah ... */}
    </main>
  </div>
);
```

---

## 4. Loading State After Submit

### Problem
Saat submit berlangsung, hanya ada `disabled` pada tombol. Tidak ada visual yang cukup jelas bahwa sistem sedang bekerja, terutama saat save draft + upload attachment + submit sekaligus berjalan.

### File yang Diubah
```
frontend/src/features/letters/pages/LetterWizardPage.jsx
frontend/src/components/ui/SubmitOverlay.jsx  ← FILE BARU
```

### Buat Komponen `SubmitOverlay.jsx`

```jsx
// frontend/src/components/ui/SubmitOverlay.jsx  ← BUAT FILE BARU

import { Loader2 } from 'lucide-react';

const STEPS_LABEL = [
  'Menyimpan data surat...',
  'Mengunggah lampiran...',
  'Mengirim ke RT...',
];

export default function SubmitOverlay({ isVisible, currentStep = 0 }) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
          Mengirim Pengajuan...
        </h3>
        <p className="text-sm text-[var(--color-ink-secondary)] mb-6">
          {STEPS_LABEL[currentStep] || 'Memproses...'}
        </p>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS_LABEL.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300
                ${i <= currentStep 
                  ? 'bg-[var(--color-primary)]' 
                  : 'bg-[var(--color-surface-border)]'
                }
              `}
            />
          ))}
        </div>
        
        <p className="text-xs text-[var(--color-ink-muted)] mt-4">
          Mohon jangan menutup halaman ini
        </p>
      </div>
    </div>
  );
}
```

### Update `LetterWizardPage.jsx` untuk pakai overlay

```jsx
// frontend/src/features/letters/pages/LetterWizardPage.jsx

// ← TAMBAH import
import SubmitOverlay from '../../../components/ui/SubmitOverlay';

// ← TAMBAH state di dalam component
const [submitStep, setSubmitStep] = useState(0);

// ← UPDATE handleConfirmSubmit untuk update step
const handleConfirmSubmit = async () => {
  try {
    setSubmitStep(0); // Step: simpan draft
    const draftData = await wizard.saveDraftAsync();
    const uuid = draftData.uuid;

    if (wizard.attachments && wizard.attachments.length > 0) {
      setSubmitStep(1); // Step: upload lampiran
      await wizard.uploadAttachmentsAsync({ uuid, files: wizard.attachments });
    }

    setSubmitStep(2); // Step: submit final
    await wizard.submitLetterAsync(uuid);
    setShowConfirmModal(false);
  } catch (error) {
    console.error('Submit Flow Error:', error);
  }
};

// ← Di dalam return, tambahkan SubmitOverlay
return (
  <div className="min-h-screen ...">
    {/* ... semua konten seperti biasa ... */}

    {/* ← TAMBAH DI AKHIR SEBELUM CLOSING DIV */}
    <SubmitOverlay 
      isVisible={wizard.isSubmitting} 
      currentStep={submitStep} 
    />
  </div>
);
```

---

## 5. Success Modal yang Lebih Informatif

### Problem
`Step8Success.jsx` sudah ada tapi nomor pengajuan hanya menampilkan potongan UUID dan tidak jelas. Tidak ada instruksi berikutnya yang spesifik.

### File yang Diubah
```
frontend/src/features/letters/components/wizard/Step8Success.jsx
```

### Ganti semua konten `Step8Success.jsx`

```jsx
// frontend/src/features/letters/components/wizard/Step8Success.jsx  ← Ganti semua

import { CheckCircle2, ClipboardList, Home, Bell, Clock } from 'lucide-react';

const Step8Success = ({ wizard, navigate }) => {
  const shortId = wizard.draftUuid
    ? `#${wizard.draftUuid.split('-')[0].toUpperCase()}`
    : '#-';

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 max-w-lg mx-auto w-full">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 border-4 border-emerald-100">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-2">
        Pengajuan Berhasil!
      </h2>
      <p className="text-[var(--color-ink-secondary)] mb-8 text-sm sm:text-base">
        Surat <strong>{wizard.selectedType?.name}</strong> Anda telah dikirim dan sedang menunggu verifikasi RT/RW.
      </p>

      {/* Nomor Pengajuan Card */}
      <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-5 w-full mb-8">
        <p className="text-xs text-[var(--color-primary)] font-semibold uppercase tracking-wider mb-1">
          Nomor Pengajuan
        </p>
        <p className="text-3xl font-mono font-bold text-[var(--color-primary)] mb-3">
          {shortId}
        </p>
        <div className="flex justify-between text-sm text-[var(--color-ink-secondary)] pt-3 border-t border-[var(--color-brand-100)]">
          <span>Tanggal</span>
          <span className="font-medium text-[var(--color-ink)]">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-[var(--color-ink-secondary)] pt-2">
          <span>Alur</span>
          <span className="font-medium text-[var(--color-ink)]">
            {wizard.selectedWorkflow?.name || '-'}
          </span>
        </div>
      </div>

      {/* Langkah Berikutnya */}
      <div className="bg-[var(--color-surface-muted)] rounded-xl p-4 w-full text-left mb-8 space-y-3">
        <p className="text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider">
          Langkah Berikutnya
        </p>
        {[
          { icon: Clock, text: 'RT akan memproses surat Anda dalam 1-3 hari kerja' },
          { icon: Bell, text: 'Anda akan mendapat notifikasi email/WhatsApp saat ada update' },
          { icon: ClipboardList, text: 'Pantau status surat kapan saja di halaman "Surat Saya"' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-secondary)]">
            <Icon className="w-4 h-4 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => navigate('/letters')}
          className="flex-1 py-3 border border-[var(--color-surface-border)] rounded-xl font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors inline-flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Lihat Status Surat
        </button>
        <button
          onClick={() => navigate('/warga/dashboard')}
          className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors inline-flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Step8Success;
```

---

## 6. Real-Time Form Validation

### Problem
Validasi Zod ada di `Step2FillData.jsx` tapi error message muncul setelah blur atau submit. Perlu validasi inline yang lebih responsif.

### File yang Diubah
```
frontend/src/features/letters/components/shared/DynamicField.jsx
frontend/src/features/letters/components/wizard/Step2FillData.jsx
```

### Update `DynamicField.jsx` — tambah `showError` dan `helperText`

```jsx
// frontend/src/features/letters/components/shared/DynamicField.jsx
// Cari dan update props yang diterima, tambahkan error state visual yang lebih jelas

// Tambahkan ke setiap input element:
// className berubah berdasarkan error state

// Contoh untuk field type "text":
// Sebelum:
<input
  type="text"
  className="w-full px-3 py-2 border rounded-lg text-sm ..."
/>

// Sesudah:
<input
  type="text"
  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors
    ${error 
      ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500' 
      : 'border-[var(--color-surface-border)] focus:ring-[var(--color-brand-100)] focus:border-[var(--color-primary)]'
    }
  `}
/>
{/* Tambah error message di bawah setiap field */}
{error && (
  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
    <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
    {error}
  </p>
)}
{/* Atau helper text jika tidak ada error */}
{!error && field.help_text && (
  <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
)}
```

### Tambah validasi NIK di `Step2FillData.jsx` (jika ada field NIK)

```jsx
// frontend/src/features/letters/components/wizard/Step2FillData.jsx
// Tambah inline validation message khusus NIK

// Cari handler onChange untuk field NIK, tambahkan validasi:
const validateField = (key, value) => {
  if (key === 'nik' || key === 'NIK') {
    if (value && !/^\d{16}$/.test(value)) {
      return 'NIK harus tepat 16 digit angka';
    }
  }
  if (key === 'no_hp' || key === 'no_telp') {
    if (value && !/^(\+62|08)\d{8,12}$/.test(value)) {
      return 'Format nomor HP tidak valid (contoh: 081234567890)';
    }
  }
  return null;
};
```

---

## 7. Status Tracking Timeline

### Problem
`LetterDetailPage.jsx` sudah punya status tracker berbentuk progress bar horizontal sederhana. Perlu diupgrade ke timeline vertikal yang lebih informatif dan menampilkan timestamp dari `letter_approvals`.

### File yang Diubah
```
frontend/src/features/letters/pages/LetterDetailPage.jsx
frontend/src/components/ui/StatusTimeline.jsx  ← FILE BARU
```

### Buat Komponen `StatusTimeline.jsx`

```jsx
// frontend/src/components/ui/StatusTimeline.jsx  ← BUAT FILE BARU

import { Check, Clock, X, RotateCcw, FileText, Send, ShieldCheck } from 'lucide-react';

const STATUS_CONFIG = {
  draft:                { label: 'Surat Dibuat',            icon: FileText,    color: 'text-gray-500',   bg: 'bg-gray-100' },
  submitted:            { label: 'Menunggu Verifikasi RT',  icon: Send,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
  in_review_rt:         { label: 'RT Sedang Memproses',     icon: Clock,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  approved_rt:          { label: 'RT Menyetujui',           icon: Check,       color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  in_review_rw:         { label: 'RW Sedang Memproses',     icon: Clock,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
  approved_rw:          { label: 'RW Menyetujui',           icon: Check,       color: 'text-purple-600', bg: 'bg-purple-50' },
  revision_requested:   { label: 'Perlu Revisi',            icon: RotateCcw,   color: 'text-orange-600', bg: 'bg-orange-50' },
  rejected:             { label: 'Ditolak',                 icon: X,           color: 'text-red-600',    bg: 'bg-red-50' },
  completed:            { label: 'Surat Selesai',           icon: ShieldCheck, color: 'text-emerald-600',bg: 'bg-emerald-50' },
};

// Step order default (RT_ONLY workflow)
const WORKFLOW_STEPS = {
  RT_ONLY: ['draft', 'submitted', 'in_review_rt', 'completed'],
  RT_THEN_RW: ['draft', 'submitted', 'in_review_rt', 'approved_rt', 'in_review_rw', 'completed'],
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function StatusTimeline({ status, workflowCode = 'RT_ONLY', approvals = [], createdAt }) {
  const steps = WORKFLOW_STEPS[workflowCode] || WORKFLOW_STEPS.RT_ONLY;
  
  // Handle rejected/revision status: tampilkan di akhir sebagai terminal state
  const isTerminalBad = ['rejected', 'revision_requested'].includes(status);
  const displaySteps = isTerminalBad ? [...steps, status] : steps;
  
  const currentIndex = displaySteps.indexOf(status);
  
  return (
    <div className="space-y-0">
      {displaySteps.map((step, index) => {
        const config = STATUS_CONFIG[step] || STATUS_CONFIG.draft;
        const Icon = config.icon;
        const isDone = index < currentIndex || (index === currentIndex && ['completed', 'rejected'].includes(step));
        const isCurrent = index === currentIndex && !['completed', 'rejected'].includes(status);
        const isPending = index > currentIndex;
        const isLast = index === displaySteps.length - 1;

        // Cari approval data untuk step ini
        const relatedApproval = approvals?.find(a => {
          if (step === 'approved_rt' || step === 'in_review_rt') return a.step === 1;
          if (step === 'approved_rw' || step === 'in_review_rw') return a.step === 2;
          return false;
        });

        return (
          <div key={step} className="flex gap-3">
            {/* Left: Icon + Line */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${isDone ? `${config.bg} ${config.color}` : ''}
                ${isCurrent ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current` : ''}
                ${isPending ? 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]' : ''}
              `}>
                {isDone && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-6 mt-1 transition-all
                  ${isDone || isCurrent ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-border)]'}
                `} />
              )}
            </div>

            {/* Right: Content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-semibold leading-8
                ${isDone ? config.color : ''}
                ${isCurrent ? config.color : ''}
                ${isPending ? 'text-[var(--color-ink-muted)]' : ''}
              `}>
                {config.label}
                {isCurrent && (
                  <span className="ml-2 text-xs bg-current/10 rounded-full px-2 py-0.5 font-medium">
                    Sekarang
                  </span>
                )}
              </p>
              
              {/* Timestamp */}
              {step === 'draft' && createdAt && (
                <p className="text-xs text-[var(--color-ink-muted)]">{formatDate(createdAt)}</p>
              )}
              {relatedApproval?.acted_at && (
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {relatedApproval.approver_name} · {formatDate(relatedApproval.acted_at)}
                </p>
              )}
              {relatedApproval?.notes && (
                <p className="text-xs text-[var(--color-ink-secondary)] mt-0.5 italic">
                  "{relatedApproval.notes}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Update `LetterDetailPage.jsx` — ganti status tracker lama

```jsx
// frontend/src/features/letters/pages/LetterDetailPage.jsx

// ← TAMBAH import
import StatusTimeline from '../../../components/ui/StatusTimeline';

// ← CARI blok "Status Tracker" yang ada (progress bar horizontal):
// Cari kode yang berisi STATUS_ORDER.filter(...).map(...)
// HAPUS blok tersebut dan GANTI dengan:

{/* Status Tracking Timeline */}
<div className="bg-[var(--color-surface-card)] border rounded-xl p-5">
  <p className="text-sm font-semibold text-[var(--color-ink)] mb-4">Progress Surat</p>
  <StatusTimeline
    status={letter.status}
    workflowCode={letter.workflow_code || 'RT_ONLY'}
    approvals={letter.approvals || []}
    createdAt={letter.created_at}
  />
</div>
```

---

## 8. Reject Flow + Alasan Penolakan

### Problem
Saat surat ditolak, tampilan di warga hanya menampilkan badge "Ditolak". Alasan penolakan ada di `letter_approvals` tapi tidak ditampilkan secara prominent.

### File yang Diubah
```
frontend/src/features/letters/pages/LetterDetailPage.jsx
frontend/src/components/ui/RejectionBanner.jsx  ← FILE BARU
```

### Buat Komponen `RejectionBanner.jsx`

```jsx
// frontend/src/components/ui/RejectionBanner.jsx  ← BUAT FILE BARU

import { XCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RejectionBanner({ letter, role }) {
  const isRejected = letter.status === 'rejected';
  const isRevision = letter.status === 'revision_requested';
  
  if (!isRejected && !isRevision) return null;
  
  // Cari approval terakhir yang berisi alasan
  const lastAction = letter.approvals
    ?.filter(a => ['rejected', 'revision_requested'].includes(a.action))
    .slice(-1)[0];
  
  const alasan = lastAction?.notes;
  const rejectedBy = letter.rejected_by_role === 'rt' ? 'Ketua RT' : 'Ketua RW';
  
  return (
    <div className={`rounded-xl p-5 border ${
      isRejected 
        ? 'bg-red-50 border-red-200' 
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isRejected ? 'bg-red-100' : 'bg-orange-100'
        }`}>
          {isRejected 
            ? <XCircle className="w-5 h-5 text-red-500" />
            : <RotateCcw className="w-5 h-5 text-orange-500" />
          }
        </div>
        <div>
          <h3 className={`font-semibold text-sm ${
            isRejected ? 'text-red-700' : 'text-orange-700'
          }`}>
            {isRejected ? `Pengajuan Ditolak oleh ${rejectedBy}` : 'Diminta Revisi'}
          </h3>
          <p className={`text-xs mt-0.5 ${
            isRejected ? 'text-red-600' : 'text-orange-600'
          }`}>
            {isRejected 
              ? 'Surat Anda tidak dapat diproses. Baca alasan di bawah dan ajukan ulang jika diperlukan.'
              : 'Harap perbaiki pengajuan Anda sesuai catatan di bawah.'
            }
          </p>
        </div>
      </div>
      
      {alasan && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${
          isRejected ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        }`}>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1">Alasan:</p>
          <p>"{alasan}"</p>
        </div>
      )}
      
      {/* Hanya tampilkan untuk role warga */}
      {role === 'warga' && (
        <Link
          to="/warga/buat-surat-v2"
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            isRejected
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {isRejected ? 'Ajukan Ulang Surat Baru' : 'Perbaiki Pengajuan'}
        </Link>
      )}
    </div>
  );
}
```

### Update `LetterDetailPage.jsx`

```jsx
// frontend/src/features/letters/pages/LetterDetailPage.jsx

// ← TAMBAH import
import RejectionBanner from '../../../components/ui/RejectionBanner';

// ← Di dalam JSX, tambahkan banner SETELAH header surat dan SEBELUM status timeline:
{/* Rejection / Revision Banner - hanya muncul jika status sesuai */}
<RejectionBanner letter={letter} role={user?.role} />

{/* Status Tracking Timeline */}
<div className="bg-[var(--color-surface-card)] border rounded-xl p-5">
  {/* ... */}
</div>
```

---

## 9. Profile Completion Warning

### Problem
Tidak ada validasi bahwa profil warga sudah lengkap sebelum masuk ke wizard. Jika `no_hp`, NIK, atau foto KTP kosong, surat bisa gagal di tengah proses.

### File yang Diubah
```
frontend/src/pages/warga/Dashboard.jsx
frontend/src/features/letters/pages/LetterWizardPage.jsx
frontend/src/components/ui/ProfileWarningBanner.jsx  ← FILE BARU
backend/src/controllers/ProfileController.js  ← backend check
```

### Buat `ProfileWarningBanner.jsx`

```jsx
// frontend/src/components/ui/ProfileWarningBanner.jsx  ← BUAT FILE BARU

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileWarningBanner({ missingFields = [] }) {
  if (missingFields.length === 0) return null;
  
  const fieldLabels = {
    no_hp: 'Nomor HP',
    foto_ktp: 'Foto KTP',
    NIK: 'NIK (16 digit)',
    alamat: 'Alamat lengkap',
    tempat_lahir: 'Tempat lahir',
    tanggal_lahir: 'Tanggal lahir',
  };
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Lengkapi profil sebelum mengajukan surat
        </p>
        <p className="text-xs text-amber-700 mb-3">
          Data berikut belum diisi:{' '}
          <span className="font-medium">
            {missingFields.map(f => fieldLabels[f] || f).join(', ')}
          </span>
        </p>
        <Link
          to="/warga/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 underline hover:text-amber-900"
        >
          Lengkapi Profil <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
```

### Tambah logic di `Dashboard.jsx` warga

```jsx
// frontend/src/pages/warga/Dashboard.jsx

// ← TAMBAH import
import ProfileWarningBanner from '../../components/ui/ProfileWarningBanner';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

// ← TAMBAH query untuk cek profil dalam komponen:
const { data: profile } = useQuery({
  queryKey: ['warga-profile'],
  queryFn: async () => {
    const res = await api.get('/warga/profile');
    return res.data?.data || res.data;
  },
  retry: false,
});

// ← Hitung field yang kosong:
const REQUIRED_PROFILE_FIELDS = ['no_hp', 'NIK', 'alamat', 'tanggal_lahir'];
const missingFields = profile
  ? REQUIRED_PROFILE_FIELDS.filter(f => !profile[f] || String(profile[f]).trim() === '')
  : [];

// ← Di dalam return JSX, tambahkan setelah welcome banner:
{missingFields.length > 0 && (
  <ProfileWarningBanner missingFields={missingFields} />
)}
```

### Guard di `LetterWizardPage.jsx`

```jsx
// frontend/src/features/letters/pages/LetterWizardPage.jsx
// Tambahkan guard di atas wizard, agar user tidak bisa submit jika profil kosong

// ← Tambah query profil (reuse dari queryClient — sudah di-cache dari Dashboard):
const { data: profile } = useQuery({
  queryKey: ['warga-profile'],
  queryFn: async () => {
    const res = await api.get('/warga/profile');
    return res.data?.data || res.data;
  },
  retry: false,
  enabled: user?.role === 'warga',
});

const REQUIRED_PROFILE_FIELDS = ['no_hp', 'NIK', 'alamat'];
const missingProfileFields = profile
  ? REQUIRED_PROFILE_FIELDS.filter(f => !profile[f] || String(profile[f]).trim() === '')
  : [];

// ← Update handleOpenConfirm:
const handleOpenConfirm = () => {
  // ...validasi form wizard...
  
  if (missingProfileFields.length > 0) {
    toast.error('Lengkapi profil Anda terlebih dahulu sebelum mengajukan surat', {
      description: `Data belum diisi: ${missingProfileFields.join(', ')}`,
      action: { label: 'Ke Profil', onClick: () => navigate('/warga/profile') },
    });
    return;
  }
  
  setShowConfirmModal(true);
};

// ← Tampilkan banner di atas form jika ada missing fields:
// Di dalam kiri panel (div.w-full.lg:w-1/2)
{missingProfileFields.length > 0 && (
  <div className="bg-[var(--color-surface-card)] p-4 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
    <ProfileWarningBanner missingFields={missingProfileFields} />
  </div>
)}
```

---

## 10. Notification Center

### Status
Backend notifikasi (`NotificationService.js`) dan `NotificationBell.jsx` sudah ada. Perlu dipastikan data real tersambung.

### File yang Dicek/Diubah
```
frontend/src/components/NotificationBell.jsx
backend/src/controllers/notificationController.js
backend/src/routes/notificationRoutes.js
```

### Cek `NotificationBell.jsx` — pastikan pakai endpoint real

```jsx
// frontend/src/components/NotificationBell.jsx
// Pastikan queryFn-nya memanggil endpoint yang benar

// ← Jika belum, update menjadi:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Bell, Check } from 'lucide-react';
import { useState } from 'react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data?.data || [];
    },
    refetchInterval: 30000, // poll tiap 30 detik
    retry: false,
  });

  const unreadCount = notifs.filter(n => !n.read_at).length;

  const markReadMutation = useMutation({
    mutationFn: async (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-surface-card)] rounded-xl shadow-xl border border-[var(--color-surface-border)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex justify-between items-center">
            <span className="font-semibold text-sm text-[var(--color-ink)]">Notifikasi</span>
            {unreadCount > 0 && (
              <span className="text-xs text-[var(--color-primary)]">{unreadCount} belum dibaca</span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-surface-border)]">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--color-ink-muted)]">
                Tidak ada notifikasi
              </div>
            ) : (
              notifs.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-[var(--color-surface-muted)] transition-colors ${
                    !n.read_at ? 'bg-[var(--color-brand-50)]' : ''
                  }`}
                  onClick={() => markReadMutation.mutate(n.id)}
                >
                  <p className="font-medium text-[var(--color-ink)] line-clamp-1">{n.title}</p>
                  <p className="text-[var(--color-ink-secondary)] line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                    {new Date(n.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Cek Backend: Endpoint Notifications

```js
// backend/src/routes/notificationRoutes.js
// Pastikan route ini ada dan terhubung ke app.js

const express = require('express');
const router = express.Router();
const notifCtrl = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const authRtRwMiddleware = require('../middlewares/authRtRwMiddleware');

// Endpoint untuk warga
router.get('/', authMiddleware, notifCtrl.getMyNotifications);
router.patch('/:id/read', authMiddleware, notifCtrl.markAsRead);

// Endpoint untuk RT/RW (jika belum ada)
// router.get('/rtrw', authRtRwMiddleware, notifCtrl.getMyNotifications);

module.exports = router;
```

```js
// backend/src/controllers/notificationController.js
// Pastikan method getMyNotifications sudah ada

// Jika belum, tambahkan:
const getMyNotifications = async (req, res) => {
  try {
    const pool = require('../config/db');
    const userId = req.user.id_warga || req.user.id;
    const role = req.user.role;
    
    const [notifs] = await pool.query(
      `SELECT * FROM notifications 
       WHERE recipient_id = ? AND recipient_role = ?
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId, role]
    );
    
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const pool = require('../config/db');
    await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE id = ? AND recipient_id = ?`,
      [req.params.id, req.user.id_warga || req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyNotifications, markAsRead };
```

### Daftarkan route di `app.js`

```js
// backend/src/app.js
// Cari bagian import routes, tambahkan:
const notificationRoutes = require('./routes/notificationRoutes'); // ← TAMBAH

// Cari bagian app.use(), tambahkan:
app.use('/api/notifications', notificationRoutes); // ← TAMBAH
```

---

## Urutan Implementasi yang Disarankan

Implementasikan dalam urutan ini agar setiap perubahan tidak memblokir yang lain:

### Fase 1 — Impact Tinggi, Risiko Rendah (Mulai dari sini)

| # | Item | Waktu Estimasi | File Baru | File Diubah |
|---|---|---|---|---|
| 1 | `ConfirmationModal` | 1-2 jam | `ConfirmationModal.jsx` | `LetterWizardPage.jsx` |
| 2 | `SubmitOverlay` | 1 jam | `SubmitOverlay.jsx` | `LetterWizardPage.jsx` |
| 3 | `Step8Success` improvement | 30 menit | — | `Step8Success.jsx` |
| 4 | `RejectionBanner` | 1 jam | `RejectionBanner.jsx` | `LetterDetailPage.jsx` |

### Fase 2 — Visual Enhancement

| # | Item | Waktu Estimasi | File Baru | File Diubah |
|---|---|---|---|---|
| 5 | `StatusTimeline` | 2 jam | `StatusTimeline.jsx` | `LetterDetailPage.jsx` |
| 6 | `WizardStepper` | 1.5 jam | `WizardStepper.jsx` | `LetterWizardPage.jsx` |
| 7 | Profile Warning Banner | 1 jam | `ProfileWarningBanner.jsx` | `Dashboard.jsx`, `LetterWizardPage.jsx` |

### Fase 3 — Notification & Validation

| # | Item | Waktu Estimasi | File Baru | File Diubah |
|---|---|---|---|---|
| 8 | Notification Center backend | 1 jam | — | `notificationController.js`, `app.js` |
| 9 | `NotificationBell` update | 1 jam | — | `NotificationBell.jsx` |
| 10 | Form Validation enhancement | 1 jam | — | `DynamicField.jsx`, `Step2FillData.jsx` |

**Total estimasi: ~12 jam kerja**

---

## Struktur File Baru yang Perlu Dibuat

```
frontend/src/
├── components/
│   └── ui/
│       ├── ConfirmationModal.jsx    ← BARU (Item 1)
│       ├── SubmitOverlay.jsx        ← BARU (Item 2)
│       ├── WizardStepper.jsx        ← BARU (Item 3)
│       ├── StatusTimeline.jsx       ← BARU (Item 4)
│       ├── RejectionBanner.jsx      ← BARU (Item 5)
│       └── ProfileWarningBanner.jsx ← BARU (Item 6)
```

---

## Checklist Final

### Frontend
- [ ] `ConfirmationModal.jsx` dibuat dan diintegrasikan ke `LetterWizardPage.jsx`
- [ ] `SubmitOverlay.jsx` dibuat dan tracking 3 step submit
- [ ] `Step8Success.jsx` diperbarui dengan nomor pengajuan dan langkah berikutnya
- [ ] `WizardStepper.jsx` dibuat dan completedSteps di-track dari wizard state
- [ ] `StatusTimeline.jsx` mengganti progress bar horizontal di `LetterDetailPage.jsx`
- [ ] `RejectionBanner.jsx` tampil di `LetterDetailPage.jsx` saat status rejected/revision_requested
- [ ] `ProfileWarningBanner.jsx` tampil di `Dashboard.jsx` dan guard di `LetterWizardPage.jsx`
- [ ] `NotificationBell.jsx` diupdate pakai query real ke `/api/notifications`
- [ ] Error state visual di `DynamicField.jsx` (border merah + pesan error)
- [ ] Tombol preview mobile lebih prominent dengan indikator live

### Backend
- [ ] `notificationRoutes.js` memiliki `GET /` dan `PATCH /:id/read`
- [ ] `notificationController.js` memiliki `getMyNotifications` dan `markAsRead`
- [ ] Route `/api/notifications` sudah didaftarkan di `app.js`

---

## Catatan Penting

**CSS Variables yang Digunakan**

Semua kode di atas menggunakan CSS variables yang sudah ada di proyek:
- `--color-primary`, `--color-primary-dark`
- `--color-surface-card`, `--color-surface-muted`, `--color-surface-border`
- `--color-ink`, `--color-ink-secondary`, `--color-ink-muted`
- `--color-brand-50`, `--color-brand-100`
- `--color-danger`

Pastikan variabel ini sudah terdefinisi di `index.css` kamu.

**Sonner Toast**

Beberapa tempat menggunakan `toast.error()` dengan opsi `action` (untuk redirect ke profil). Pastikan versi Sonner yang terinstall (`^2.0.7`) sudah support `action` prop di toast.

**React Query Cache**

`useQuery({ queryKey: ['warga-profile'] })` di `Dashboard.jsx` dan `LetterWizardPage.jsx` sengaja pakai key yang sama agar data di-share dari cache — tidak perlu dua request terpisah ke server.