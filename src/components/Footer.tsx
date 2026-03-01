'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const cookieLocale = getCookie('NEXT_LOCALE') || getCookie('locale');
    setLocale(cookieLocale || localStorage.getItem('locale') || 'en');
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="section-container py-16">
        {/* Creator Section */}
        <div className="text-center mb-12">
          <h3 
            className="text-4xl md:text-5xl font-bold mb-4 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 hover:bg-clip-text hover:text-transparent"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('meetCreator')}
          </h3>
          <div className="max-w-2xl mx-auto mb-6 space-y-2">
            <p className="text-xl md:text-2xl" style={{ color: 'var(--text-secondary)' }}>
              {t('creatorDescription')}
            </p>
            <p 
              className="text-xl md:text-2xl font-semibold transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 hover:bg-clip-text hover:text-transparent"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('creatorSignature')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://duraym.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('visitSite')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('navigation')}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200 cursor-pointer">
                {tNav('home')}
              </Link>
              <Link href="/map" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200 cursor-pointer">
                {tNav('map')}
              </Link>
              <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200 cursor-pointer">
                {tNav('services')}
              </Link>
              <Link href="/learning" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200 cursor-pointer">
                {tNav('learning')}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('resources')}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/learning" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer">
                {t('slides')}
              </Link>
              <Link href="/learning" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer">
                {t('labs')}
              </Link>
              <Link href="/learning" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer">
                {t('extras')}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('providers')}</h4>
            <nav className="flex flex-col gap-2">
              <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200 cursor-pointer">
                Amazon Web Services
              </a>
              <a href="https://cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer">
                Google Cloud
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('academy')}</h4>
            <nav className="flex flex-col gap-2">
              <a href="https://tuwaiq.edu.sa" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 cursor-pointer">
                Tuwaiq Academy
              </a>
            </nav>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {locale === 'ar' 
              ? 'هذا الموقع غير رسمي من الأكاديمية ومصمم من أحد طلاب المعسكر لنشر الفائدة لباقي الطلاب'
              : 'This is an unofficial website, designed by a bootcamp student to share knowledge with fellow students'}
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            {currentYear} {t('copyright')}{' '}
            <a
              href="https://duraym.com"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text hover:underline"
            >
              duraym.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
