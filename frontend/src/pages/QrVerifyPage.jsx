import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api';

const fetchVerify = async (uuid) => {
  const res = await api.get(`/v2/public/letters/verify/${uuid}`);
  return res.data.data;
};

export default function QrVerifyPage() {
  const { uuid } = useParams();

  const { data: letter, isLoading, isError, error } = useQuery({
    queryKey: ['verify-qr', uuid],
    queryFn: () => fetchVerify(uuid),
    retry: false, // jangan retry 404
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--color-surface-card)] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-primary)] p-6 text-center">
          <div className="w-16 h-16 bg-[var(--color-surface-card)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-xl font-bold text-white">Verifikasi Surat</h1>
          <p className="text-blue-100 text-sm mt-1">Sistem Pelayanan RT/RW</p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
              <p className="text-[var(--color-ink-secondary)] font-medium">Memverifikasi Dokumen...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-[var(--color-danger)]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-ink)]">Dokumen Tidak Valid</h2>
              <p className="text-[var(--color-ink-secondary)] mt-2 text-sm">
                {error.response?.data?.message || 'Surat ini tidak ditemukan atau belum disahkan oleh RT/RW setempat.'}
              </p>
            </div>
          )}

          {letter && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--color-status-disetujui-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-status-disetujui-text)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-ink)]">Dokumen Asli</h2>
                <p className="text-[var(--color-status-disetujui-text)] font-medium text-sm mt-1">
                  Surat ini tercatat resmi di sistem
                </p>
              </div>

              <div className="bg-[var(--color-surface-muted)] p-4 rounded-xl border space-y-3 text-sm">
                <div>
                  <p className="text-[var(--color-ink-secondary)] text-xs uppercase tracking-wider">Jenis Surat</p>
                  <p className="font-semibold text-[var(--color-ink)]">{letter.letter_type_name}</p>
                </div>
                <div>
                  <p className="text-[var(--color-ink-secondary)] text-xs uppercase tracking-wider">Nama Pemohon</p>
                  <p className="font-medium text-[var(--color-ink)]">{letter.resident_name}</p>
                </div>
                <div>
                  <p className="text-[var(--color-ink-secondary)] text-xs uppercase tracking-wider">NIK</p>
                  <p className="font-medium text-[var(--color-ink)]">{letter.resident_nik}</p>
                </div>
                <div>
                  <p className="text-[var(--color-ink-secondary)] text-xs uppercase tracking-wider">Tanggal Disahkan</p>
                  <p className="font-medium text-[var(--color-ink)]">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-[var(--color-ink-muted)] mt-8">
        © 2026 SIPRAGA. Dicetak secara elektronik.
      </p>
    </div>
  );
}
