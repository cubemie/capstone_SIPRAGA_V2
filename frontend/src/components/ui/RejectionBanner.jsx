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
