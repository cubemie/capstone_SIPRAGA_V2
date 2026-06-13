import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Search, ShieldAlert } from 'lucide-react';
import { api } from '../../../utils/api';

const verifyLetter = async (qrToken) => {
  const res = await api.get(`/v2/letters/verify/${qrToken}`);
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
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-surface-card)] rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-primary)] p-6 text-center text-white">
          <Search className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">Verifikasi Surat</h1>
          <p className="text-blue-100 text-sm mt-1">SIPRAGA V2</p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-center text-[var(--color-ink-muted)] py-8">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">Memverifikasi surat...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[var(--color-danger)]" />
              <p className="text-[var(--color-danger)] font-semibold">Surat tidak valid</p>
              <p className="text-[var(--color-ink-muted)] text-sm mt-1">
                Token QR tidak ditemukan atau sudah kedaluwarsa.
              </p>
            </div>
          )}

          {data && !data.valid && (
            <div className="text-center py-8">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[var(--color-danger)]" />
              <p className="text-[var(--color-danger)] font-semibold">Surat tidak valid</p>
            </div>
          )}

          {data?.valid && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-[var(--color-status-disetujui-text)] bg-green-50 rounded-lg py-3">
                <CheckCircle2 className="w-6 h-6" />
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
                    <dt className="text-[var(--color-ink-secondary)]">{label}</dt>
                    <dd className="text-[var(--color-ink)] font-medium text-right">{value}</dd>
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
