'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import InnerPageShell from '@/components/InnerPageShell';
import labsData from '@/data/labs.json';
import slidesData from '@/data/slides.json';

type Section = 'slides' | 'labs' | 'extras' | null;
type LabCategory = 'all' | 'aws' | 'gcp' | 'general';

export default function LearningPage() {
  const t = useTranslations('learning');
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [labCategory, setLabCategory] = useState<LabCategory>('all');

  const toggleSection = (section: Section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Filter labs by category
  const filteredLabs = labCategory === 'all' 
    ? labsData.labs 
    : labsData.labs.filter(lab => lab.category === labCategory);

  // Category labels
  const categoryLabels = {
    all: { en: 'All Labs', ar: 'جميع المعامل' },
    aws: { en: 'AWS Labs', ar: 'معامل AWS' },
    gcp: { en: 'Google Cloud Labs', ar: 'معامل Google Cloud' },
    general: { en: 'General Labs', ar: 'معامل عامة' }
  };

  const sections = [
    {
      id: 'slides' as Section,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'from-orange-500 to-orange-400',
    },
    {
      id: 'labs' as Section,
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      color: 'from-blue-500 to-blue-400',
    },
    {
      id: 'extras' as Section,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'from-purple-500 to-purple-400',
    },
  ];

  return (
    <InnerPageShell>
      {/* Header */}
      <section className="relative py-12 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="relative z-10 section-container text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('title')}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Section Selector */}
      <section className="py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className={`card card-hover text-left transition-all duration-300 ${
                  activeSection === section.id
                    ? 'ring-2 ring-aws-orange dark:ring-gcp-blue'
                    : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t(section.id)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(`${section.id}Desc`)}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      activeSection === section.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={`accordion-content ${activeSection ? 'open' : ''}`}>
            <div>
              {activeSection === null && (
                <div className="card text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p style={{ color: 'var(--text-muted)' }}>{t('selectSection')}</p>
                </div>
              )}

              {/* Labs Content */}
              {activeSection === 'labs' && (
                <div className="space-y-6">
                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'aws', 'gcp', 'general'] as LabCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setLabCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          labCategory === cat
                            ? 'text-white'
                            : ''
                        }`}
                        style={{
                          background: labCategory === cat 
                            ? (cat === 'aws' ? 'var(--aws)' : cat === 'gcp' ? 'var(--gcp)' : 'var(--text-muted)')
                            : 'var(--bg-secondary)',
                          color: labCategory === cat ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {locale === 'ar' ? categoryLabels[cat].ar : categoryLabels[cat].en}
                      </button>
                    ))}
                  </div>

                  {/* Labs List */}
                  {filteredLabs.length > 0 ? (
                    filteredLabs.map((lab) => (
                      <div key={lab.id} className="card">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                          {locale === 'ar' ? lab.title_ar : lab.title_en}
                        </h3>
                        <div className="space-y-3">
                          {lab.items.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 rounded-xl transition-all hover:opacity-90 dark:border dark:border-[rgba(255,255,255,0.1)]"
                              style={{ background: 'var(--bg-item, var(--bg-secondary))' }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ 
                                    background: item.type === 'guide' 
                                      ? 'linear-gradient(135deg, var(--gcp), #3B78E7)' 
                                      : 'linear-gradient(135deg, var(--aws), #E88A00)' 
                                  }}
                                >
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {item.type === 'guide' ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    )}
                                  </svg>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {locale === 'ar' ? item.title_ar : item.title_en}
                                </span>
                              </div>
                              <svg className="w-5 h-5 rtl:rotate-180" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="card text-center py-12">
                      <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p style={{ color: 'var(--text-muted)' }}>
                        {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Slides Content */}
              {activeSection === 'slides' && (
                <div className="space-y-4">
                  {slidesData.slides.length > 0 ? (
                    slidesData.slides.map((slide) => (
                      <a
                        key={slide.id}
                        href={slide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card card-hover flex items-center justify-between p-4 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--aws), #E88A00)' }}
                          >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
                            {locale === 'ar' ? slide.title_ar : slide.title_en}
                          </span>
                        </div>
                        <svg className="w-5 h-5 rtl:rotate-180" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))
                  ) : (
                    <div className="card text-center py-12">
                      <p style={{ color: 'var(--text-muted)' }}>
                        {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Coming Soon Content - For extras only */}
              {activeSection === 'extras' && (
                <div className="card text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-blue-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {t('comingSoon')}
                  </h3>
                  <p className="max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {t('comingSoonDesc')}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('bootcampInProgress')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </InnerPageShell>
  );
}
