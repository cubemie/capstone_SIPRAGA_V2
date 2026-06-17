import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, CheckCircle2, Download, PencilLine, ShieldAlert } from 'lucide-react';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { api } from '../../../utils/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import LetterPdfTemplate from '../components/pdf/LetterPdfTemplate';
import StatusTimeline from '../../../components/ui/StatusTimeline';
import RejectionBanner from '../../../components/ui/RejectionBanner';

const fetchLetterDetail = async (uuid) => {
  const res = await api.get(`/v2/letters/${uuid}`);
  if (res.error) throw new Error(res.error);
  return res.data?.data;
};
function SignatureStatusCard({ letter }) {
  const workflowCode = letter?.workflow_code || 'RT_ONLY';
  
  // Find signatures in approvals history
  const rtApproval = letter?.approvals?.find(a => a.step === 1 && a.action === 'approved');
  const rwApproval = letter?.approvals?.find(a => a.step === 2 && a.action === 'approved');


  // Tentukan tahap TTD berdasarkan workflow
  const ttdSteps = workflowCode === 'RT_ONLY'
    ? [
        { label: 'Tanda Tangan Ketua RT', done: !!rtApproval, name: rtApproval?.approver_name },
      ]
    : [
        { label: 'Tanda Tangan Ketua RT', done: !!rtApproval, name: rtApproval?.approver_name },
        { label: 'Tanda Tangan Ketua RW', done: !!rwApproval, name: rwApproval?.approver_name },
      ];

  return (
    <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-4">
      <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
        Status Tanda Tangan
      </p>
      <div className="space-y-3">
        {ttdSteps.map((step, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]'
              }`}>
                {step.done ? <Check className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{step.label}</p>
                <p className={`text-xs ${step.done ? 'text-emerald-600' : 'text-ink-muted'}`}>
                  {step.done ? `Ditandatangani oleh ${step.name}` : 'Menunggu tanda tangan'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TtdApprovalPanel({ uuid, status, userTtdUrl }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [useTtd, setUseTtd] = useState(true);

  const canApprove =
    (user?.role === 'rt' && ['submitted', 'in_review_rt'].includes(status)) ||
    (user?.role === 'rw' && ['approved_rt', 'in_review_rw'].includes(status));

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.post(`/v2/letters/${uuid}/approve`, {
        notes,
        signature_url: useTtd ? userTtdUrl : null,
      });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success('Surat berhasil disetujui!');
      queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
    },
    onError: (e) => toast.error(e.message || 'Gagal menyetujui'),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.post(`/v2/letters/${uuid}/reject`, { notes });
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success('Surat telah ditolak');
      queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
    },
    onError: (e) => toast.error(e.message || 'Gagal menolak'),
  });

  if (!canApprove) return null;

  return (
    <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
        Proses Surat Ini
      </p>

      {/* Preview TTD yang akan dipakai */}
      {userTtdUrl && (
        <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
          <img
            src={userTtdUrl}
            alt="Tanda Tangan"
            className="h-12 object-contain bg-[var(--color-surface-card)] border border-surface-border rounded p-1"
          />
          <div className="flex-1">
            <p className="text-xs font-medium text-ink">Tanda tangan akan dilampirkan</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Sesuai TTD digital yang tersimpan di profil kamu
            </p>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-ink-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={useTtd}
              onChange={e => setUseTtd(e.target.checked)}
              className="rounded"
            />
            Gunakan TTD
          </label>
        </div>
      )}

      {!userTtdUrl && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 font-medium">TTD digital belum diupload</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Upload TTD di menu "Tanda Tangan" agar bisa dilampirkan ke surat.
          </p>
          <Link
            to="/rtrw/ttd"
            className="text-xs text-amber-700 font-semibold underline mt-1 inline-flex items-center gap-1"
          >
            <PencilLine className="w-3.5 h-3.5" />
            Upload TTD sekarang
          </Link>
        </div>
      )}

      {/* Catatan */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        placeholder="Catatan untuk warga (opsional)..."
        className="w-full text-sm border border-surface-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {approveMutation.isPending
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
            : <><CheckCircle2 className="w-4 h-4" /> Setujui Surat</>
          }
        </button>
        <button
          onClick={() => rejectMutation.mutate()}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-danger)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-danger-dark)] transition disabled:opacity-50"
        >
          {rejectMutation.isPending
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
            : <><ShieldAlert className="w-4 h-4" /> Tolak Surat</>
          }
        </button>
      </div>
    </div>
  );
}

export default function LetterDetailPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath = user?.role === 'warga' ? '/warga/riwayat' : '/rtrw/inbox';
  const backLabel = user?.role === 'warga' ? 'Riwayat Surat' : 'Kotak Masuk';
  const { data: myTtd } = useQuery({
    queryKey: ['my-ttd'],
    queryFn: async () => {
      if (!['rt', 'rw'].includes(user?.role)) return null;
      const { data } = await api.get('/ttd/current-ttd');
      return data?.data?.ttd_digital || data?.data?.ttd_url || null;
    },
    enabled: ['rt', 'rw'].includes(user?.role),
  });

  const { data: letter, isLoading, error } = useQuery({
    queryKey: ['letter-detail', uuid],
    queryFn: () => fetchLetterDetail(uuid),
    enabled: !!uuid,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[var(--color-surface-muted)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-[var(--color-danger)] py-16">
        Gagal memuat surat: {error.message}
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-[var(--color-ink-muted)] py-16">
        Surat tidak ditemukan.
      </div>
    );
  }

  const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
    label: letter.status,
    color: 'bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]',
  };
  // Extract signatures from approval history
  const signatures = letter.approvals
    ?.filter((a) => a.action === 'approved' && a.signature_url)
    .map((a) => ({
      role: a.step === 1 ? 'Ketua RT' : 'Ketua RW',
      name: a.approver_name,
      url: a.signature_url,
    })) || [];

  const isFinal = letter.status === 'completed';
  const pdfTitle = isFinal ? 'Dokumen Final Resmi' : 'Preview Dokumen';

  // Parse field_values mapping for LetterPdfTemplate
  const fieldMapping = {};
  if (letter.field_values) {
    letter.field_values.forEach(fv => {
      fieldMapping[fv.field_key] = fv.value;
    });
  }

  const previewData = {
    letter_type_name: letter.letter_type_name || 'Surat Pengantar',
    letter_number: letter.letter_number || '___/RT.___/RW.___/2026',
    resident_name: letter.resident_name || 'Nama Lengkap Pemohon',
    resident_nik: letter.resident_nik || '3374xxxxxxxxxxxx',
    purpose: letter.purpose || 'Keperluan Surat',
    dynamic_fields: fieldMapping,
    signatures: signatures,
    attachments: letter.attachments || [],
    approver_name: 'Ketua RT / RW',
    created_date: new Date(letter.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }),
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(backPath)}
        className="mb-4 text-xs text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {backLabel}
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">
            {letter.letter_type_name}
          </h1>
          {letter.letter_number && (
            <p className="text-sm text-[var(--color-ink-secondary)] mt-1">
              No. Surat: <span className="font-mono">{letter.letter_number}</span>
            </p>
          )}
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Rejection Banner */}
      <RejectionBanner letter={letter} role={user?.role} />

      {/* Status Timeline */}
      <div className="bg-[var(--color-surface-card)] border rounded-xl p-5">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-4">Progress Surat</p>
        <StatusTimeline
          status={letter.status}
          workflowCode={letter.workflow_code || 'RT_ONLY'}
          approvals={letter.approvals || []}
          createdAt={letter.created_at}
        />
      </div>

      {/* Data Surat */}
      {letter.field_values?.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border rounded-lg p-4">
          <p className="text-sm font-medium text-[var(--color-ink-secondary)] mb-3">Data Surat</p>
          <dl className="space-y-2">
            {letter.field_values.map((fv) => (
              <div key={fv.field_key} className="flex gap-2 text-sm">
                <dt className="text-[var(--color-ink-secondary)] capitalize w-40 flex-shrink-0">
                  {fv.field_key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-[var(--color-ink)]">{fv.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}



      {/* Action RT/RW */}
      <TtdApprovalPanel uuid={uuid} status={letter?.status} userTtdUrl={myTtd} />

      <SignatureStatusCard letter={letter} />

      {/* PDF View */}
      <div className="bg-[var(--color-surface-card)] border rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-[var(--color-ink-secondary)]">{pdfTitle}</p>
          <PDFDownloadLink
            document={<LetterPdfTemplate data={previewData} />}
            fileName={`Surat-${letter.letter_type_name.replace(/\s+/g, '-')}-${uuid.substring(0, 8)}.pdf`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
              isFinal 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}
          >
            {({ loading }) => (
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {loading ? 'Memuat PDF...' : 'Download PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
        
        <div className="border rounded-lg bg-[var(--color-surface-muted)] min-h-[600px] flex items-center justify-center overflow-hidden">
          <PDFViewer width="100%" height="600px" showToolbar={false} style={{ border: 'none' }}>
            <LetterPdfTemplate data={previewData} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
