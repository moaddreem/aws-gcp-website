'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import InnerPageShell from '@/components/InnerPageShell';

const CloudMap = dynamic(() => import('@/components/CloudMap'), { ssr: false });

export default function MapPage() {
  const t = useTranslations('map');

  return (
    <InnerPageShell>
      <div className="flex flex-col">
        {/* Header */}
        <section className="relative py-12 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="relative z-10 section-container text-center">
          <div className="pill-badge mb-4 mx-auto w-fit">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>AWS + GCP</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('title')}
          </h1>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

        {/* Map Container - min 70vh height */}
        <div className="flex-1" style={{ minHeight: '70vh' }}>
          <CloudMap />
        </div>
      </div>
    </InnerPageShell>
  );
}
