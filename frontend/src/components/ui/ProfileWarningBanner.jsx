import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileWarningBanner({ missingFields = [] }) {
  if (missingFields.length === 0) return null;

  const fieldLabels = {
    no_hp: 'Nomor HP',
    foto_ktp: 'Foto KTP',
    NIK: 'NIK (16 digit)',
    alamat: 'Alamat lengkap',
    tempat_lahir: 'Tempat lahir',
    tanggal_lahir: 'Tanggal lahir',
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Lengkapi profil sebelum mengajukan surat
        </p>
        <p className="text-xs text-amber-700 mb-3">
          Data berikut belum diisi:{' '}
          <span className="font-medium">
            {missingFields.map(f => fieldLabels[f] || f).join(', ')}
          </span>
        </p>
        <Link
          to="/profil"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 underline hover:text-amber-900"
        >
          Lengkapi Profil <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

