import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-xl font-bold text-white">Verifikasi Surat</h1>
          <p className="text-blue-100 text-sm mt-1">Sistem Pelayanan RT/RW</p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 font-medium">Memverifikasi Dokumen...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-3xl">❌</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Dokumen Tidak Valid</h2>
              <p className="text-gray-500 mt-2 text-sm">
                {error.response?.data?.message || 'Surat ini tidak ditemukan atau belum disahkan oleh RT/RW setempat.'}
              </p>
            </div>
          )}

          {letter && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-3xl">✅</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Dokumen Asli</h2>
                <p className="text-green-600 font-medium text-sm mt-1">
                  Surat ini tercatat resmi di sistem
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Jenis Surat</p>
                  <p className="font-semibold text-gray-800">{letter.letter_type_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Nama Pemohon</p>
                  <p className="font-medium text-gray-800">{letter.resident_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">NIK</p>
                  <p className="font-medium text-gray-800">{letter.resident_nik}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Tanggal Disahkan</p>
                  <p className="font-medium text-gray-800">
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
      
      <p className="text-xs text-gray-400 mt-8">
        © 2026 SIPRAGA. Dicetak secara elektronik.
      </p>
    </div>
  );
}
