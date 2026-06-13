import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LETTER_STATUS_V2 } from '../../../constants/suratStatus';
import { api } from '../../../utils/api';

const fetchInbox = async () => {
  const res = await api.get('/v2/letters/inbox');
  if (res.error) throw new Error(res.error);
  return res.data?.data || [];
};

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'process', label: 'Diproses' },
];

export default function LetterInboxPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: letters = [], isLoading, error } = useQuery({
    queryKey: ['inbox-rtrw'],
    queryFn: fetchInbox,
    refetchInterval: 30000,
  });

  const filtered = letters.filter((l) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return ['submitted', 'in_review_rt', 'approved_rt'].includes(l.status);
    if (activeTab === 'process') return ['in_review_rt', 'in_review_rw'].includes(l.status);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inbox Surat Masuk</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Gagal memuat inbox: {error.message}
        </div>
      )}

      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
            {tab.key === 'all' && letters.length > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {letters.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-3xl mb-2">📭</p>
          <p className="font-medium">Tidak ada surat masuk</p>
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
              to={`/rtrw/surat/${letter.uuid}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{letter.resident_name}</p>
                  <p className="text-sm text-gray-500">{letter.letter_type_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(letter.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Proses →</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
