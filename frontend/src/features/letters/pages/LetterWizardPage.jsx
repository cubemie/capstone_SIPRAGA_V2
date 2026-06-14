
import React, { useMemo, useState } from 'react';
import { useLetterWizard } from '../hooks/useLetterWizard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { FileText, X, Send, Eye } from 'lucide-react';

// Import Steps
import Step1PickTemplate from '../components/wizard/Step1PickTemplate';
import Step2FillData from '../components/wizard/Step2FillData';
import Step3ContentBuilder from '../components/wizard/Step3ContentBuilder';
import Step4Attachments from '../components/wizard/Step4Attachments';
import Step5PickWorkflow from '../components/wizard/Step5PickWorkflow';
import Step8Success from '../components/wizard/Step8Success';
import LetterPdfTemplate from '../components/pdf/LetterPdfTemplate';

const LetterWizardPage = () => {
  const wizard = useLetterWizard();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);

  // Create real-time preview data for the PDF
  const previewData = useMemo(() => {
    return {
      letter_type_name: wizard.selectedType?.name || 'Surat Pengantar',
      letter_number: '___/RT.___/RW.___/2026',
      resident_name: user?.nama || 'Nama Lengkap Pemohon',
      resident_nik: user?.nik || '3374xxxxxxxxxxxx',
      purpose: wizard.letterContent?.purpose || '',
      dynamic_fields: wizard.fieldValues || {},
      approver_name: 'Ketua RT / RW',
      created_date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    };
  }, [wizard.selectedType, wizard.letterContent, wizard.fieldValues, user]);

  const handleSubmit = async () => {
    if (!wizard.selectedType) return toast.error('Harap pilih jenis surat');
    if (!wizard.letterContent.subject || !wizard.letterContent.purpose) return toast.error('Harap isi subjek dan keperluan surat');
    if (!wizard.selectedWorkflow) return toast.error('Harap pilih alur persetujuan');

    try {
      // 1. Simpan Draft
      const draftData = await wizard.saveDraftAsync();
      const uuid = draftData.uuid;

      // 2. Upload Lampiran (jika ada)
      if (wizard.attachments && wizard.attachments.length > 0) {
        await wizard.uploadAttachmentsAsync({ uuid, files: wizard.attachments });
      }

      // 3. Submit Final
      await wizard.submitLetterAsync(uuid);
    } catch (error) {
      console.error('Submit Flow Error:', error);
      // errors already toasted in hook
    }
  };

  // Jika sudah sukses terkirim, tampilkan layar success penuh
  if (wizard.isSubmitted) {
    return (
      <div className="flex flex-col h-screen bg-[var(--color-surface-muted)]">
        <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-4 shadow-sm flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Ajukan Surat Baru</h1>
          <button onClick={() => navigate('/warga/dashboard')} className="text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] flex items-center gap-1.5 text-sm font-medium">
            <X className="w-4 h-4" /> Tutup
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Step8Success wizard={wizard} navigate={navigate} />
        </main>
      </div>
    );
  }

  const previewPanel = (
    <div className="bg-[var(--color-surface-card)] w-full h-full rounded-xl shadow-inner overflow-hidden border border-[var(--color-surface-border)] flex flex-col">
      <div className="bg-[var(--color-surface-muted)] border-b border-[var(--color-surface-border)] px-4 py-2 flex justify-between items-center text-xs text-[var(--color-ink-secondary)] uppercase font-bold tracking-wider">
        <span>Live Preview PDF</span>
        <span>Dokumen Dinamis</span>
      </div>
      <div className="flex-1 min-h-0">
        {wizard.selectedType ? (
          <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
            <LetterPdfTemplate data={previewData} />
          </PDFViewer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-ink-muted)] p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-surface-muted)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-surface-border)]">
              <FileText className="w-7 h-7 text-[var(--color-ink-muted)]" />
            </div>
            <p className="font-medium text-[var(--color-ink-secondary)] mb-1">Pilih Jenis Surat</p>
            <p className="text-sm">Preview PDF akan muncul di sini setelah Anda memilih jenis surat di form sebelah kiri.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 z-20 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-[var(--color-ink)] truncate">Ajukan Surat Baru</h1>
          <p className="hidden sm:block text-sm text-[var(--color-ink-secondary)]">Isi form di kiri, dan lihat hasil PDF-nya secara real-time di kanan.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {wizard.selectedType && (
            <button
              onClick={() => setShowPreview(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-[var(--color-primary)] font-medium text-sm border border-[var(--color-surface-border)] rounded-lg px-3 py-2 hover:bg-[var(--color-surface-muted)]"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          )}
          <button
            onClick={() => {
              if (user?.role === 'warga') navigate('/warga/dashboard');
              else if (user?.role === 'rt' || user?.role === 'rw') navigate('/rtrw/dashboard');
              else navigate('/');
            }}
            className="text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] font-medium text-sm hidden sm:inline-block"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={wizard.isSubmitting}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait text-sm sm:text-base"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{wizard.isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
            <span className="sm:hidden">{wizard.isSubmitting ? '...' : 'Kirim'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Split Screen on desktop, single column on mobile */}
      <main className="flex-1 flex overflow-hidden">
        {/* KIRI: Form Input (Scrollable) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[var(--color-surface-muted)]">
          <section className="bg-[var(--color-surface-card)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
            <Step1PickTemplate wizard={wizard} />
          </section>

          {wizard.selectedType && (
            <>
              <section className="bg-[var(--color-surface-card)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
                <Step2FillData wizard={wizard} />
              </section>

              <section className="bg-[var(--color-surface-card)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
                <Step3ContentBuilder wizard={wizard} />
              </section>

              <section className="bg-[var(--color-surface-card)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
                <Step4Attachments wizard={wizard} />
              </section>

              <section className="bg-[var(--color-surface-card)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)] shadow-sm">
                <Step5PickWorkflow wizard={wizard} />
              </section>
            </>
          )}

          {/* Bottom Padding for scroll space */}
          <div className="h-12"></div>
        </div>

        {/* KANAN: Live PDF Preview (Sticky/Fixed) — hidden on mobile, shown via modal */}
        <div className="hidden lg:block w-1/2 h-full bg-[var(--color-surface)] border-l border-[var(--color-surface-border)] p-4">
          {previewPanel}
        </div>
      </main>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[var(--color-surface)] w-full sm:max-w-lg h-[85vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-card)]">
              <h3 className="font-semibold text-[var(--color-ink)]">Preview Surat</h3>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-full hover:bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-3 min-h-0">
              {previewPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterWizardPage;
