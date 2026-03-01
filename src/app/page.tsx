'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroBackdrop from '@/components/HeroBackdrop';

// Bootcamp dates
const BOOTCAMP_START = new Date('2026-02-23T00:00:00+03:00'); // Asia/Riyadh
const BOOTCAMP_END = new Date('2026-05-14T23:59:59+03:00');   // Asia/Riyadh

function calculateBootcampProgress(): number {
  // Get current time in Asia/Riyadh timezone
  const now = new Date();
  const riyadhTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  
  // Calculate progress
  const totalDuration = BOOTCAMP_END.getTime() - BOOTCAMP_START.getTime();
  const elapsed = riyadhTime.getTime() - BOOTCAMP_START.getTime();
  
  // Clamp between 0 and 1
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
  return Math.round(progress * 100);
}

export default function HomePage() {
  const t = useTranslations('home');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    // Calculate progress on mount
    setProgress(calculateBootcampProgress());
    
    // Get locale
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);
    
    // Update progress daily
    const interval = setInterval(() => {
      setProgress(calculateBootcampProgress());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(Array.from(prev).concat(entry.target.id)));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dome backdrop - true half-circle shape */}
        <HeroBackdrop />

        <div className="relative z-10 section-container text-center pt-24 pb-32">
          {/* Pill Badge */}
          <div className="pill-badge mb-6 mx-auto w-fit">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{t('badge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-balance" style={{ color: 'var(--text-primary)' }}>
            {t('headline')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/map" className="btn-primary">
              {t('ctaPrimary')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/learning" className="btn-link">
              {t('ctaSecondary')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Bootcamp Info */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('dates')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('dailyTime')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('location')}
            </span>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section id="progress" className={`py-12 transition-all duration-700 ${visibleSections.has('progress') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="section-container max-w-2xl">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'تقدم المعسكر' : 'Bootcamp Progress'}
              </h3>
              <span className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, var(--aws), var(--gcp))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {progress}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--aws), var(--gcp))'
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{locale === 'ar' ? '٢٣ فبراير ٢٠٢٦' : '23 Feb 2026'}</span>
              <span>{locale === 'ar' ? '١٤ مايو ٢٠٢٦' : '14 May 2026'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* About the Bootcamp Section */}
      <section id="about" className={`py-24 transition-all duration-700 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('aboutTitle')}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
              {t('aboutText')}
            </p>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className={`py-24 transition-all duration-700 ${visibleSections.has('objectives') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('objectivesTitle')}
              </h2>
            </div>
            <div className="space-y-6">
              {(t.raw('objectives') as string[]).map((objective: string, index: number) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: index % 2 === 0 ? 'var(--aws)' : 'var(--gcp)' }}>
                    {index + 1}
                  </div>
                  <p className="text-base leading-relaxed pt-1" style={{ color: 'var(--text-secondary)' }}>
                    {objective}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
