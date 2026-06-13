
import React, { useMemo } from 'react';
import { useLetterWizard } from '../hooks/useLetterWizard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { PDFViewer, pdf } from '@react-pdf/renderer';

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
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Ajukan Surat Baru</h1>
          <button onClick={() => navigate('/warga/dashboard')} className="text-gray-500 hover:text-gray-700">Tutup</button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Step8Success wizard={wizard} navigate={navigate} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-20 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ajukan Surat Baru</h1>
          <p className="text-sm text-gray-500">Isi form di kiri, dan lihat hasil PDF-nya secara real-time di kanan.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (user?.role === 'warga') navigate('/warga/dashboard');
              else if (user?.role === 'rt' || user?.role === 'rw') navigate('/rtrw/dashboard');
              else navigate('/');
            }}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={wizard.isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
          >
            {wizard.isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </header>

      {/* Main Content Area: Split Screen */}
      <main className="flex-1 flex overflow-hidden">
        {/* KIRI: Form Input (Scrollable) */}
        <div className="w-1/2 h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <Step1PickTemplate wizard={wizard} />
          </section>
          
          {wizard.selectedType && (
            <>
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Step2FillData wizard={wizard} />
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Step3ContentBuilder wizard={wizard} />
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Step4Attachments wizard={wizard} />
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Step5PickWorkflow wizard={wizard} />
              </section>
            </>
          )}
          
          {/* Bottom Padding for scroll space */}
          <div className="h-12"></div>
        </div>

        {/* KANAN: Live PDF Preview (Sticky/Fixed) */}
        <div className="w-1/2 h-full bg-gray-200 border-l border-gray-300 p-4">
          <div className="bg-white w-full h-full rounded-xl shadow-inner overflow-hidden border border-gray-300 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex justify-between items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
              <span>Live Preview PDF</span>
              <span>Dokumen Dinamis</span>
            </div>
            <div className="flex-1">
              {wizard.selectedType ? (
                <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
                  <LetterPdfTemplate data={previewData} />
                </PDFViewer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                    📄
                  </div>
                  <p className="font-medium text-gray-600 mb-1">Pilih Jenis Surat</p>
                  <p className="text-sm">Preview PDF akan muncul di sini setelah Anda memilih jenis surat di form sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LetterWizardPage;
