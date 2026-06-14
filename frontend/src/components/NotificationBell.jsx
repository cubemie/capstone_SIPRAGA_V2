// frontend/src/components/NotificationBell.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, Clock3, FileText, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const fetchNotifications = async () => {
  const { data, error } = await api.get('/notifications');
  if (error) throw new Error(error);
  return data?.data;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000, // polling 30 detik
    staleTime: 15_000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = data?.unread_count ?? 0;
  const notifications = data?.notifications ?? [];

  const TYPE_ICONS = {
    NEW_LETTER: FileText,
    APPROVED: CheckCircle2,
    REJECTED: ShieldAlert,
    REMINDER: Clock3,
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-ink-secondary hover:bg-surface-muted transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-danger)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-surface-card)] border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <p className="text-sm font-semibold text-ink">Notifikasi</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-brand-500 hover:text-brand-700"
                >
                  Tandai semua dibaca
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List notif */}
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ink-muted">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-sm">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || '#'}
                  onClick={() => {
                    if (!notif.is_read) markOneMutation.mutate(notif.id);
                    setOpen(false);
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-surface-muted transition ${
                    !notif.is_read ? 'bg-brand-50/50' : ''
                  }`}
                >
                  {(() => {
                    const Icon = TYPE_ICONS[notif.type] || Bell;
                    return <Icon className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-brand-600" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{notif.title}</p>
                    <p className="text-xs text-ink-secondary mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {new Date(notif.created_at).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
