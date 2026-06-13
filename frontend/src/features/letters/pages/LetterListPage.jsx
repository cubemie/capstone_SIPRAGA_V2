import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLettersV2 } from '../../../services/suratService';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'process', label: 'Proses' },
  { key: 'completed', label: 'Selesai' },
  { key: 'rejected', label: 'Ditolak' },
];

const PROCESS_STATUSES = ['submitted', 'in_review_rt', 'approved_rt', 'in_review_rw', 'approved_rw'];

export default function LetterListPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  const pathPrefix = user?.role === 'warga' ? '/warga' : '/rtrw';
  const newLetterPath = user?.role === 'warga' ? '/warga/buat-surat-v2' : '/rtrw/buat-surat-v2';

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters-v2'],
    queryFn: getLettersV2,
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'process') return PROCESS_STATUSES.includes(l.status);
    if (activeTab === 'completed') return l.status === 'completed';
    if (activeTab === 'rejected') return ['rejected', 'cancelled'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Surat Saya</h1>
        <Link
          to={newLetterPath}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Ajukan Surat
        </Link>
      </div>

      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-lg">Belum ada surat</p>
          <p className="text-sm mt-1">Klik "+ Ajukan Surat" untuk mulai</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((letter) => {
          const statusInfo = LETTER_STATUS_V2[letter.status] ?? {
            label: letter.status,
            color: 'bg-gray-100 text-gray-600',
          };
          return (
            <Link
              key={letter.uuid}
              to={`${pathPrefix}/surat/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {letter.letter_type_name ?? letter.subject ?? 'Surat'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
