import React from 'react';
import { Landmark } from 'lucide-react';

export default function Logo({ className = '' }) {
  // TODO: Ganti komponen ini dengan tag <img> ketika logo asli sudah tersedia.
  // Contoh: return <img src="/logo-asli.png" alt="Logo RT-RW" className={className} />;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="bg-[var(--color-accent)] text-[var(--color-primary)] rounded-lg p-1.5 flex items-center justify-center">
        <Landmark className="w-5 h-5" />
      </div>
      <span className="text-lg sm:text-xl font-bold tracking-wide text-[var(--color-ink)]">
        SIPRAGA
      </span>
    </div>
  );
}
