import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
