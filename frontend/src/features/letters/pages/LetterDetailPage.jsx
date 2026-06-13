import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { api } from '../../../utils/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import LetterPdfTemplate from '../components/pdf/LetterPdfTemplate';

const fetchLetterDetail = async (uuid) => {
  const res = await api.get(`/v2/letters/${uuid}`);
  return res.data.data;
};

const STATUS_ORDER = [
  'draft', 'submitted', 'in_review_rt', 'approved_rt',
  'in_review_rw', 'approved_rw', 'completed',
];

function SignatureStatusCard({ letter }) {
  const workflowCode = letter?.workflow_code || 'RT_ONLY';
  
  // Find signatures in approvals history
  const rtApproval = letter?.approvals?.find(a => a.step === 1 && a.action === 'approved');
  const rwApproval = letter?.approvals?.find(a => a.step === 2 && a.action === 'approved');

  const isFinal = letter?.status === 'completed';

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
    <div className="bg-white border border-surface-border rounded-xl p-4">
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
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step.done ? '✓' : '○'}
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
    <div className="bg-white border border-surface-border rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
        Proses Surat Ini
      </p>

      {/* Preview TTD yang akan dipakai */}
      {userTtdUrl && (
        <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
          <img
            src={userTtdUrl}
            alt="Tanda Tangan"
            className="h-12 object-contain bg-white border border-surface-border rounded p-1"
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
            className="text-xs text-amber-700 font-semibold underline mt-1 inline-block"
          >
            Upload TTD sekarang →
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
            : '✅ Setujui Surat'
          }
        </button>
        <button
          onClick={() => rejectMutation.mutate()}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
        >
          {rejectMutation.isPending
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
            : '❌ Tolak Surat'
          }
        </button>
      </div>
    </div>
  );
}

export default function LetterDetailPage() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectNotes, setRejectNotes] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  const approveMutation = useMutation({
    mutationFn: () =>
      api.post(`/v2/letters/${uuid}/approve`, { notes: approveNotes }),
    onSuccess: () => {
      toast.success('Surat berhasil disetujui');
      queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
    },
    onError: () => toast.error('Gagal menyetujui surat'),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      api.post(`/v2/letters/${uuid}/reject`, { notes: rejectNotes }),
    onSuccess: () => {
      toast.success('Surat ditolak');
      queryClient.invalidateQueries({ queryKey: ['letter-detail', uuid] });
    },
    onError: () => toast.error('Gagal menolak surat'),
  });


  const { data: myTtd } = useQuery({
    queryKey: ['my-ttd'],
    queryFn: async () => {
      if (!['rt', 'rw'].includes(user?.role)) return null;
      const { data } = await api.get('/ttd/current-ttd');
      return data?.data?.ttd_digital || data?.data?.ttd_url || null;
    },
    enabled: ['rt', 'rw'].includes(user?.role),
  });

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

  const currentStatusIndex = STATUS_ORDER.indexOf(letter.status);

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

      {/* Action RT/RW */}
      <TtdApprovalPanel uuid={uuid} status={letter?.status} userTtdUrl={myTtd} />

      <SignatureStatusCard letter={letter} />

      {/* PDF View */}
      <div className="bg-white border rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">{pdfTitle}</p>
          <PDFDownloadLink
            document={<LetterPdfTemplate data={previewData} />}
            fileName={`Surat-${letter.letter_type_name.replace(/\s+/g, '-')}-${uuid.substring(0, 8)}.pdf`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
              isFinal 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}
          >
            {({ loading }) => (loading ? 'Memuat PDF...' : '⬇ Download PDF')}
          </PDFDownloadLink>
        </div>
        
        <div className="border rounded-lg bg-gray-50 min-h-[600px] flex items-center justify-center overflow-hidden">
          <PDFViewer width="100%" height="600px" showToolbar={false} style={{ border: 'none' }}>
            <LetterPdfTemplate data={previewData} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
