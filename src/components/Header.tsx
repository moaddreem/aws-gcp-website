'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  
  const [locale, setLocale] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check cookie first, then localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const cookieLocale = getCookie('NEXT_LOCALE') || getCookie('locale');
    const savedLocale = cookieLocale || localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    // Set both cookie names for compatibility
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/map', label: t('map') },
    { href: '/services', label: t('services') },
    { href: '/learning', label: t('learning') },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl' : ''
      }`}
      style={{ 
        background: scrolled ? 'rgba(var(--bg-primary-rgb), 0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none'
      }}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-noname.png"
              alt="Tuwaiq Academy"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <span className="font-bold text-xl hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              {locale === 'ar' ? 'أكاديمية طويق' : 'Tuwaiq Academy'}
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-5 py-2.5 text-base font-medium transition-all"
                  style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {item.label}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: 'var(--gcp)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="px-3 py-1.5 text-sm font-medium rounded-full transition-all"
              style={{ color: 'var(--text-muted)' }}
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* CTA Button - Desktop */}
            <Link
              href="/map"
              className="hidden md:inline-flex btn-primary text-sm px-5 py-2.5"
            >
              {t('explore')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Navigation Modal */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
            onClick={closeMobileMenu}
          />
          
          {/* Centered Modal Card */}
          <div 
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            className="relative overflow-y-auto"
            style={{ 
              background: 'var(--bg-primary)',
              width: 'min(92vw, 420px)',
              maxHeight: '80vh',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Close Button - top-start (left for LTR, right for RTL) */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ 
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)' 
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Nav Items */}
            <nav className="flex flex-col mt-14">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-4 text-lg font-medium transition-colors"
                    style={{ 
                      color: isActive ? 'var(--aws)' : 'var(--text-primary)',
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: isActive ? '12px' : '0',
                      padding: isActive ? '12px 16px' : '12px 0',
                      textAlign: locale === 'ar' ? 'right' : 'left'
                    }}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Language Toggle in Modal */}
              <div 
                className="mt-6 pt-6 flex justify-center"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <button
                  onClick={() => {
                    closeMobileMenu();
                    toggleLocale();
                  }}
                  className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
                  style={{ 
                    color: 'var(--text-muted)',
                    background: 'var(--bg-secondary)'
                  }}
                >
                  {locale === 'en' ? 'العربية' : 'English'}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
