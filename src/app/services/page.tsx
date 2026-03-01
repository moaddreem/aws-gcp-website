'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo, useEffect } from 'react';
import servicesData from '@/data/services.json';
import InnerPageShell from '@/components/InnerPageShell';

interface ServiceProvider {
  name: string;
  desc_en: string;
  desc_ar: string;
}

interface ServiceItem {
  aws: ServiceProvider;
  gcp: ServiceProvider;
  equivalence: 'direct' | 'partial' | 'none';
  notes_en: string;
  notes_ar: string;
}

interface Category {
  id: string;
  title_en: string;
  title_ar: string;
  items: ServiceItem[];
}

const categoryIconPaths: Record<string, string> = {
  compute: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  containers: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  databases: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  networking_and_content_delivery: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  storage: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  application_integration: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  blockchain: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  business_applications: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  cloud_financial_management: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  customer_enablement: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  developer_tools: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  end_user_computing: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  frontend_web_mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  game_tech: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  iot: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  machine_learning_ai: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  management_governance: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  media: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  migration_transfer: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
  quantum_technologies: 'M13 10V3L4 14h7v7l9-11h-7z',
  satellite: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  security_identity_compliance: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

const equivalenceBadgeStyles: Record<string, { bg: string; text: string; label_en: string; label_ar: string }> = {
  direct: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label_en: 'Direct', label_ar: 'مباشر' },
  partial: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label_en: 'Partial', label_ar: 'جزئي' },
  none: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label_en: 'None', label_ar: 'لا يوجد' },
};

const CATEGORY_ORDER = [
  'analytics',
  'application_integration',
  'blockchain',
  'business_applications',
  'cloud_financial_management',
  'compute',
  'customer_enablement',
  'containers',
  'databases',
  'developer_tools',
  'end_user_computing',
  'frontend_web_mobile',
  'game_tech',
  'iot',
  'machine_learning_ai',
  'management_governance',
  'media',
  'migration_transfer',
  'networking_and_content_delivery',
  'quantum_technologies',
  'satellite',
  'security_identity_compliance',
  'storage'
];

export default function ServicesPage() {
  const tServices = useTranslations('services');
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locale, setLocale] = useState('en');
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [showAwsOnly, setShowAwsOnly] = useState(false);
  const [showGcpOnly, setShowGcpOnly] = useState(false);

  const handleCloseCategory = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setSearchQuery('');
      setExpandedNotes(new Set());
      setIsClosing(false);
    }, 250);
  };

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);
  }, []);

  const rawCategories = servicesData.categories as Category[];
  const unmatchedLists = servicesData.unmatched_lists;
  
  // Sort categories according to the defined order
  const categories = useMemo(() => {
    const orderMap = new Map(CATEGORY_ORDER.map((id, idx) => [id, idx]));
    return [...rawCategories].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999;
      const orderB = orderMap.get(b.id) ?? 999;
      return orderA - orderB;
    });
  }, [rawCategories]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    
    return selectedCategory.items.filter((item) => {
      const query = searchQuery.toLowerCase();
      const awsMatch = item.aws.name.toLowerCase().includes(query);
      const gcpMatch = item.gcp.name.toLowerCase().includes(query);
      return awsMatch || gcpMatch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleNotes = (idx: number) => {
    const newSet = new Set(expandedNotes);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedNotes(newSet);
  };

  const renderServiceCard = (service: ServiceProvider, isAws: boolean) => {
    if (service.name === 'Not Available') {
      return (
        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          <span className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {locale === 'ar' ? 'غير متاح' : 'Not Available'}
          </span>
        </div>
      );
    }
    return (
      <div 
        className="p-3 rounded-lg border-l-4"
        style={{ 
          background: 'var(--bg-item, var(--bg-secondary))',
          borderColor: isAws ? 'var(--aws)' : 'var(--gcp)'
        }}
      >
        <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
          {service.name}
        </div>
        {(locale === 'ar' ? service.desc_ar : service.desc_en) && (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {locale === 'ar' ? service.desc_ar : service.desc_en}
          </div>
        )}
      </div>
    );
  };

  return (
    <InnerPageShell>
      {/* Header */}
      <section className="relative py-12 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="relative z-10 section-container text-center">
          <div className="pill-badge mb-4 mx-auto w-fit">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>AWS vs GCP</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {tServices('title')}
          </h1>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {tServices('subtitle')}
          </p>
        </div>
      </section>

      <div className="section-container py-12">
        {!selectedCategory ? (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="group rounded-xl p-4 transition-all hover:scale-[1.02]"
                  style={{ 
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon Box - Fixed size, gradient border, rounded */}
                    <div 
                      className="w-10 h-10 min-w-[40px] rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(to right, #f97316, #3b82f6)',
                        padding: '2px'
                      }}
                    >
                      <div className="w-full h-full rounded-md flex items-center justify-center bg-[#E2E5EB] dark:bg-[#0C1220]">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={categoryIconPaths[category.id] || 'M4 6h16M4 12h16M4 18h16'} />
                        </svg>
                      </div>
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0 text-start">
                      <h3 className="font-medium text-sm leading-relaxed text-gray-800 dark:text-white transition-all duration-200 pb-0.5">
                        {locale === 'ar' ? category.title_ar : category.title_en}
                      </h3>
                      <p className="text-xs mt-0.5 text-white">
                        {category.items.length} {locale === 'ar' ? 'مقارنة' : 'mappings'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Unmatched Lists & Method Notes Accordions */}
            <div className="space-y-4">
              {/* AWS Only */}
              <div className="card !p-0 overflow-hidden">
                <button
                  onClick={() => setShowAwsOnly(!showAwsOnly)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'ar' ? 'خدمات AWS فقط' : 'AWS Only Services'} ({unmatchedLists.aws_only.length})
                    </span>
                  </div>
                  <svg className={`w-5 h-5 transition-transform ${showAwsOnly ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showAwsOnly && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {unmatchedLists.aws_only.map((service, i) => (
                        <span key={i} className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GCP Only */}
              <div className="card !p-0 overflow-hidden">
                <button
                  onClick={() => setShowGcpOnly(!showGcpOnly)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'ar' ? 'خدمات GCP فقط' : 'GCP Only Services'} ({unmatchedLists.gcp_only.length})
                    </span>
                  </div>
                  <svg className={`w-5 h-5 transition-transform ${showGcpOnly ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showGcpOnly && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {unmatchedLists.gcp_only.map((service, i) => (
                        <span key={i} className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          /* Category Detail View */
          <div className={isClosing ? 'animate-out' : 'animate-in'}>
            {/* Back Button & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <button
                onClick={handleCloseCategory}
                className="flex items-center gap-2 font-medium transition-colors"
                style={{ color: 'var(--aws)' }}
              >
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {tServices('backToCategories')}
              </button>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder={tServices('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 ps-10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <svg
                  className="w-5 h-5 absolute start-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIconPaths[selectedCategory.id] || 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'ar' ? selectedCategory.title_ar : selectedCategory.title_en}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {filteredItems.length} {locale === 'ar' ? 'مقارنة' : 'mappings'}
                </p>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-4">
              {filteredItems.map((item, idx) => {
                const eqStyle = equivalenceBadgeStyles[item.equivalence];
                const isExpanded = expandedNotes.has(idx);
                return (
                  <div key={idx} className="card">
                    {/* Equivalence Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${eqStyle.bg} ${eqStyle.text}`}>
                        {locale === 'ar' ? eqStyle.label_ar : eqStyle.label_en}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* AWS Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-sm"></span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>AWS</span>
                        </div>
                        {renderServiceCard(item.aws, true)}
                      </div>

                      {/* GCP Column */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-sm"></span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Google Cloud</span>
                        </div>
                        {renderServiceCard(item.gcp, false)}
                      </div>
                    </div>

                    {/* Notes Toggle */}
                    <button
                      onClick={() => toggleNotes(idx)}
                      className="mt-3 text-sm flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 text-sm" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {locale === 'ar' ? item.notes_ar : item.notes_en}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="card text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar' ? 'لم يتم العثور على خدمات مطابقة للبحث.' : 'No services found matching your search.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </InnerPageShell>
  );
}
