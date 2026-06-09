import React from 'react';
import { Mailbox } from 'lucide-react';

export default function Logo({ className = '' }) {
  // TODO: Ganti komponen ini dengan tag <img> ketika logo asli sudah tersedia.
  // Contoh: return <img src="/logo-asli.png" alt="Logo RT-RW" className={className} />;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Mailbox className="w-8 h-8 text-blue-600" />
      <span className="text-xl font-bold tracking-wide text-slate-800 dark:text-white">
        RT-RW CORETAX
      </span>
    </div>
  );
}
