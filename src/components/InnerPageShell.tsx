'use client';

import { ReactNode } from 'react';

interface InnerPageShellProps {
  children: ReactNode;
}

export default function InnerPageShell({ children }: InnerPageShellProps) {
  return (
    <div 
      className="min-h-screen"
      style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}
    >
      {children}
    </div>
  );
}
