import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src="/icon.svg"
        alt="Logo SIPRAGA"
        className="w-8 h-8 object-contain"
      />
      <span className="text-lg sm:text-xl font-bold tracking-wide text-[var(--color-ink)]">
        SIPRAGA
      </span>
    </div>
  );
}
