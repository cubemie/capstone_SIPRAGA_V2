// frontend/src/pages/superadmin/LogSistem.jsx — FILE BARU

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_COLORS = {
  LOGIN:             'bg-green-50 text-green-700',
  LOGOUT:            'bg-[var(--color-surface)] text-slate-600',
  CREATE_LETTER:     'bg-[var(--color-brand-50)] text-[var(--color-primary)]',
  APPROVE_LETTER:    'bg-emerald-50 text-emerald-700',
  REJECT_LETTER:     'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  DELETE_USER:       'bg-red-100 text-red-700',
  RESET_PASSWORD:    'bg-amber-50 text-amber-700',
  UPDATE_CONFIG:     'bg-purple-50 text-purple-700',
  DEFAULT:           'bg-[var(--color-surface-muted)] text-slate-600',
};

export default function LogSistem() {
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole]     = useState('');
  const [filterAction, setFilterAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['system-logs', page, filterRole, filterAction],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 50 });
      if (filterRole)   params.set('role', filterRole);
      if (filterAction) params.set('action', filterAction);
      const { data, error } = await api.get(`/superadmin/logs?${params}`);
      if (error) throw new Error(error);
      return data?.data;
    },
    keepPreviousData: true,
  });

  const totalPages = Math.ceil((data?.total || 0) / 50);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Log Sistem</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            Audit trail seluruh aktivitas pengguna dan sistem
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none text-ink-secondary"
          >
            <option value="">Semua Role</option>
            <option value="warga">Warga</option>
            <option value="rt">RT</option>
            <option value="rw">RW</option>
            <option value="superadmin">Superadmin</option>
            <option value="system">System</option>
          </select>
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none text-ink-secondary"
          >
            <option value="">Semua Aksi</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE_LETTER">Buat Surat</option>
            <option value="APPROVE_LETTER">Approve Surat</option>
            <option value="REJECT_LETTER">Tolak Surat</option>
            <option value="DELETE_USER">Hapus Akun</option>
            <option value="RESET_PASSWORD">Reset Password</option>
            <option value="UPDATE_CONFIG">Update Konfigurasi</option>
          </select>
          {data?.total && (
            <span className="ml-auto text-xs text-ink-muted self-center">
              {data.total.toLocaleString('id-ID')} entri total
            </span>
          )}
        </div>

        <div className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase">Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase">Aksi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase">Pelaku</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.logs || []).map(log => {
                const actionColor = ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;
                return (
                  <tr key={log.id} className="hover:bg-surface-muted/30 transition">
                    <td className="px-4 py-3 text-xs text-ink-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${actionColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-ink">{log.actor_name || log.actor_id || '–'}</p>
                      <p className="text-xs text-ink-muted">{log.actor_role}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">
                      {log.target_type && (
                        <span className="font-medium">{log.target_type}</span>
                      )}
                      {log.target_id && (
                        <span className="text-ink-muted"> #{log.target_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted max-w-xs truncate">
                      {log.detail ? JSON.stringify(log.detail).slice(0, 60) : '–'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 border border-surface-border rounded-lg disabled:opacity-40 hover:bg-surface-muted transition inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Sebelumnya
              </button>
              <span className="text-xs text-ink-muted">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs px-3 py-1.5 border border-surface-border rounded-lg disabled:opacity-40 hover:bg-surface-muted transition inline-flex items-center gap-1"
              >
                Berikutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
