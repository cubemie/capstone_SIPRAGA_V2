import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { api } from '../../../utils/api';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

const fetchLetterDetail = async (uuid) => {
  const res = await api.get(`/v2/letters/${uuid}`);
  return res.data.data;
};

const STATUS_ORDER = [
  'draft', 'submitted', 'in_review_rt', 'approved_rt',
  'in_review_rw', 'approved_rw', 'completed',
];

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

      {/* Tindakan (Action) for RT/RW */}
      {((user?.role === 'rt' && ['submitted', 'in_review_rt'].includes(letter?.status)) ||
        (user?.role === 'rw' && ['approved_rt', 'in_review_rw'].includes(letter?.status))) && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">Tindakan</p>
          <div>
            <label className="text-xs text-gray-500">Catatan (opsional)</label>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={2}
              placeholder="Catatan untuk warga..."
              className="w-full border rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
