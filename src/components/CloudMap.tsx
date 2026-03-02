'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import Supercluster from 'supercluster';
import geojsonData from '@/data/locations.json';

// GeoJSON Feature type
interface LocationProperties {
  provider: 'aws' | 'gcp';
  status: 'live' | 'announced';
  region_code: string | null;
  name_en: string;
  name_ar: string;
  country_en: string;
  country_ar: string;
  city_en: string;
  city_ar: string;
  notes_en: string;
  notes_ar: string;
}

interface LocationFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: LocationProperties;
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: LocationFeature[];
}

const locationsGeoJSON = geojsonData as GeoJSONData;

type Provider = 'aws' | 'gcp' | 'both';
type Status = 'live' | 'announced' | 'both';
type MapStyle = 'standard' | 'light' | 'dark';

interface Filters {
  provider: Provider;
  status: Status;
}

// Carto Basemaps - 100% free, no API key required
const CARTO_STYLES: Record<MapStyle, string> = {
  standard: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

// Style labels for bilingual UI
const STYLE_LABELS: Record<MapStyle, { en: string; ar: string }> = {
  standard: { en: 'Standard', ar: 'قياسي' },
  light: { en: 'Light', ar: 'فاتح' },
  dark: { en: 'Dark', ar: 'داكن' },
};

// Helper to create coordinate key for grouping overlapping points (rounded to 4 decimals ~11m precision)
const getCoordKey = (lng: number, lat: number) => 
  `${lng.toFixed(4)},${lat.toFixed(4)}`;

// Calculate pixel offset for overlapping markers (side-by-side, small visual separation)
// AWS always goes LEFT, GCP always goes RIGHT
// Returns [pixelOffsetX, pixelOffsetY]
const getPixelOffset = (provider: string, total: number): [number, number] => {
  if (total <= 1) return [0, 0];
  
  const radius = 16; // pixels offset for clear but close separation
  
  // Deterministic: AWS = left (-x), GCP = right (+x)
  if (provider === 'aws') {
    return [-radius, 0]; // AWS on left
  } else {
    return [radius, 0]; // GCP on right
  }
};

// Convert pixel offset to coordinate offset using map projection (zoom-aware)
const pixelToCoordOffset = (
  mapInstance: maplibregl.Map,
  lng: number,
  lat: number,
  pixelOffsetX: number,
  pixelOffsetY: number
): [number, number] => {
  const point = mapInstance.project([lng, lat]);
  const offsetPoint = mapInstance.unproject([point.x + pixelOffsetX, point.y + pixelOffsetY]);
  return [offsetPoint.lng, offsetPoint.lat];
};

// SVG Pin icon generator - viewBox expanded to prevent stroke clipping
const createPinSVG = (color: string, isAnnounced: boolean) => {
  const fillColor = isAnnounced ? 'transparent' : color;
  const strokeColor = color;
  const opacity = isAnnounced ? '0.8' : '1';
  return `
    <svg width="32" height="40" viewBox="-2 -2 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); opacity: ${opacity}; overflow: visible;">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="${isAnnounced ? strokeColor : 'white'}"/>
    </svg>
  `;
};

export default function CloudMap() {
  const t = useTranslations('map');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const clusterRef = useRef<Supercluster | null>(null);
  const updateMarkersRef = useRef<() => void>(() => {});
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<LocationFeature | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [locale, setLocale] = useState('en');
  const [filters, setFilters] = useState<Filters>({
    provider: 'both',
    status: 'both',
  });
  
  // Search panel state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get locale on mount
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

  const getStyleUrl = useCallback((style: MapStyle) => {
    return CARTO_STYLES[style];
  }, []);

  // Filter features based on provider and status
  const filteredFeatures = locationsGeoJSON.features.filter((feature) => {
    const props = feature.properties;
    if (filters.provider !== 'both' && props.provider !== filters.provider) return false;
    if (filters.status !== 'both' && props.status !== filters.status) return false;
    return true;
  });

  // Search results based on debounced query and current filters
  const searchResults = debouncedQuery.trim()
    ? filteredFeatures.filter((feature) => {
        const query = debouncedQuery.toLowerCase();
        const props = feature.properties;
        return (
          props.name_en.toLowerCase().includes(query) ||
          props.name_ar.includes(query) ||
          (props.region_code && props.region_code.toLowerCase().includes(query)) ||
          props.country_en.toLowerCase().includes(query) ||
          props.country_ar.includes(query) ||
          props.city_en.toLowerCase().includes(query) ||
          props.city_ar.includes(query)
        );
      }).slice(0, 12)
    : [];

  // Fit bounds to show all points
  const fitBoundsToFeatures = useCallback(() => {
    if (!map.current || filteredFeatures.length === 0) return;
    
    const coordinates = filteredFeatures.map(f => f.geometry.coordinates);
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
    );
    
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 5,
    });
  }, [filteredFeatures]);

  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();

    const points = filteredFeatures.map((feature, idx) => ({
      type: 'Feature' as const,
      properties: { index: idx, ...feature.properties },
      geometry: feature.geometry,
    }));

    // Reduced radius (30px) for less aggressive clustering, minPoints=2
    clusterRef.current = new Supercluster({ radius: 30, maxZoom: 14, minPoints: 2 });
    clusterRef.current.load(points);

    // Use Math.round for more accurate zoom-based clustering
    const clusters = clusterRef.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      Math.round(zoom)
    );

    // Group unclustered points by coordinates to detect overlaps
    const unclusteredPoints = clusters.filter(c => !c.properties.cluster);
    const overlapGroups = new Map<string, typeof unclusteredPoints>();
    
    unclusteredPoints.forEach((point) => {
      const [lng, lat] = point.geometry.coordinates;
      const key = getCoordKey(lng, lat);
      if (!overlapGroups.has(key)) {
        overlapGroups.set(key, []);
      }
      overlapGroups.get(key)!.push(point);
    });

    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const props = cluster.properties;

      if (props.cluster) {
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.background = 'linear-gradient(135deg, #FF9900, #4285F4)';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '14px';
        el.style.cursor = 'pointer';
        el.textContent = String(props.point_count);

        // Cluster hover tooltip
        el.addEventListener('mouseenter', () => {
          const tooltipText = locale === 'ar' 
            ? `${props.point_count} مناطق`
            : `${props.point_count} regions`;
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ 
            closeButton: false, 
            closeOnClick: false,
            offset: 20,
            className: 'cluster-popup'
          })
            .setLngLat([lng, lat])
            .setHTML(`<div style="padding: 4px 8px; font-size: 12px; font-weight: 500;">${tooltipText}</div>`)
            .addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          popupRef.current?.remove();
          popupRef.current = null;
        });

        el.addEventListener('click', () => {
          popupRef.current?.remove();
          const expansionZoom = clusterRef.current?.getClusterExpansionZoom(props.cluster_id) || zoom + 2;
          map.current?.flyTo({ center: [lng, lat], zoom: expansionZoom });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      } else {
        const feature = filteredFeatures[props.index];
        const color = feature.properties.provider === 'aws' ? '#FF9900' : '#4285F4';
        const isAnnounced = feature.properties.status === 'announced';

        // Check for overlapping points at this location
        const coordKey = getCoordKey(lng, lat);
        const overlapGroup = overlapGroups.get(coordKey) || [];
        const totalOverlaps = overlapGroup.length;
        
        // Calculate pixel offset for side-by-side markers (AWS left, GCP right)
        const [pixelOffsetX, pixelOffsetY] = getPixelOffset(feature.properties.provider, totalOverlaps);
        
        // Convert pixel offset to coordinate offset (zoom-aware)
        let markerLng = lng;
        let markerLat = lat;
        if (pixelOffsetX !== 0 || pixelOffsetY !== 0) {
          [markerLng, markerLat] = pixelToCoordOffset(map.current!, lng, lat, pixelOffsetX, pixelOffsetY);
        }

        // Create pin marker element with extra padding to prevent clipping
        const el = document.createElement('div');
        el.innerHTML = createPinSVG(color, isAnnounced);
        el.style.width = '40px';
        el.style.height = '48px';
        el.style.cursor = 'pointer';
        el.style.overflow = 'visible';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        // Hover tooltip (desktop) - each pin shows its OWN info only
        el.addEventListener('mouseenter', () => {
          const name = locale === 'ar' ? feature.properties.name_ar : feature.properties.name_en;
          const country = locale === 'ar' ? feature.properties.country_ar : feature.properties.country_en;
          const city = locale === 'ar' ? feature.properties.city_ar : feature.properties.city_en;
          const statusText = locale === 'ar' 
            ? (feature.properties.status === 'live' ? 'مباشر' : 'معلن')
            : (feature.properties.status === 'live' ? 'Live' : 'Announced');
          const regionCode = feature.properties.region_code || 'N/A';
          
          const tooltipHTML = `
            <div style="padding: 8px 12px; font-size: 13px; max-width: 250px; color: #ffffff;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #ffffff;">${name}</div>
              <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                  ${feature.properties.provider.toUpperCase()}
                </span>
                <span style="background: ${feature.properties.status === 'live' ? '#22c55e' : '#f59e0b'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                  ${statusText}
                </span>
              </div>
              <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
                <div><strong style="color: #ffffff;">${locale === 'ar' ? 'الرمز' : 'Code'}:</strong> ${regionCode}</div>
                <div><strong style="color: #ffffff;">${locale === 'ar' ? 'الدولة' : 'Country'}:</strong> ${country}</div>
                <div><strong style="color: #ffffff;">${locale === 'ar' ? 'المدينة' : 'City'}:</strong> ${city}</div>
              </div>
            </div>
          `;
          
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ 
            closeButton: false, 
            closeOnClick: false,
            offset: [0, -36],
            className: 'marker-popup'
          })
            .setLngLat([markerLng, markerLat])
            .setHTML(tooltipHTML)
            .addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          popupRef.current?.remove();
          popupRef.current = null;
        });

        // Mobile tap fallback
        el.addEventListener('click', () => {
          setSelectedFeature(feature);
        });

        // Place marker at offset coordinates (not original)
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([markerLng, markerLat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      }
    });
  }, [filteredFeatures, locale]);

  // Keep ref updated with latest updateMarkers function
  useEffect(() => {
    updateMarkersRef.current = updateMarkers;
  }, [updateMarkers]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(mapStyle),
      center: [45, 25],
      zoom: 2,
      attributionControl: { compact: true },
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      updateMarkersRef.current();
      fitBoundsToFeatures();
    });
    // Use ref to always call the latest updateMarkers (with current filters)
    map.current.on('moveend', () => {
      updateMarkersRef.current();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle style changes separately without remounting
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(getStyleUrl(mapStyle));
      map.current.once('style.load', updateMarkers);
    }
  }, [mapStyle, getStyleUrl, updateMarkers]);

  useEffect(() => {
    if (map.current?.loaded()) {
      updateMarkers();
    }
  }, [filters, updateMarkers]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainer.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={`relative ${isFullscreen ? 'h-screen z-[60]' : 'h-full min-h-[70vh] z-0'}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '70vh', isolation: 'isolate' }} />

      {/* LEFT SIDE: Filters + Style Switcher Card (top-left, fixed position) */}
      <div 
        className="absolute z-10 rounded-xl p-3 space-y-3 backdrop-blur-md"
        style={{ 
          left: '16px', 
          top: '16px',
          background: 'var(--bg-map-panel)', 
          border: '1px solid var(--border-map-panel)',
          boxShadow: 'var(--shadow-map-panel)'
        }}
      >
        {/* Filters Section */}
        <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t('filters')}</h3>
        
        {/* Provider Filter */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{t('provider')}</label>
          <div className="flex gap-1">
            {(['both', 'aws', 'gcp'] as Provider[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilters({ ...filters, provider: p })}
                className="px-2 py-1 text-xs font-medium rounded-lg transition-colors"
                style={{
                  background: filters.provider === p 
                    ? p === 'aws' ? 'var(--aws)' : p === 'gcp' ? 'var(--gcp)' : 'linear-gradient(135deg, var(--aws), var(--gcp))'
                    : 'var(--bg-map-chip)',
                  color: filters.provider === p ? 'white' : 'var(--text-primary)',
                }}
              >
                {p === 'both' ? t('both') : t(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{t('status')}</label>
          <div className="flex gap-1">
            {(['both', 'live', 'announced'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, status: s })}
                className="px-2 py-1 text-xs font-medium rounded-lg transition-colors"
                style={{
                  background: filters.status === s ? 'var(--gcp)' : 'var(--bg-map-chip)',
                  color: filters.status === s ? 'white' : 'var(--text-primary)',
                }}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-map-panel)', margin: '8px 0' }} />

        {/* Style Switcher */}
        <div className="flex gap-1">
          {(['standard', 'light', 'dark'] as MapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{
                background: mapStyle === style ? 'linear-gradient(135deg, var(--aws), var(--gcp))' : 'var(--bg-map-chip)',
                color: mapStyle === style ? 'white' : 'var(--text-primary)',
              }}
            >
              {STYLE_LABELS[style][locale as 'en' | 'ar']}
            </button>
          ))}
        </div>
      </div>

      {/* Search Panel - Below default zoom controls on right side (fixed position, no RTL mirror) */}
      <div 
        className="absolute z-10 flex flex-col gap-2"
        style={{ right: '16px', top: '120px' }}
      >
        {/* Search Toggle Button (when collapsed) */}
        {!isSearchOpen && (
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="rounded-xl p-3 transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-md"
            style={{ 
              background: 'var(--bg-map-panel)', 
              border: '1px solid var(--border-map-panel)',
              boxShadow: 'var(--shadow-map-panel)'
            }}
            title={locale === 'ar' ? 'بحث' : 'Search'}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {locale === 'ar' ? 'بحث' : 'Search'}
            </span>
          </button>
        )}

        {/* Search Panel (when expanded) */}
        {isSearchOpen && (
          <div 
            className="rounded-xl w-72 backdrop-blur-md"
            style={{ 
              background: 'var(--bg-map-panel)', 
              border: '1px solid var(--border-map-panel)',
              boxShadow: 'var(--shadow-map-panel)'
            }}
          >
            {/* Search Header */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-map-panel)' }}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <svg 
                    className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--text-muted)' }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث عن منطقة...' : 'Search regions...'}
                    className="w-full ps-9 pe-3 py-2 text-sm rounded-lg outline-none transition-colors"
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Results */}
            {debouncedQuery.trim() && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((feature, idx) => {
                      const props = feature.properties;
                      const name = locale === 'ar' ? props.name_ar : props.name_en;
                      const city = locale === 'ar' ? props.city_ar : props.city_en;
                      const country = locale === 'ar' ? props.country_ar : props.country_en;
                      
                      return (
                        <button
                          type="button"
                          key={`${props.provider}-${props.region_code || idx}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Get coordinates from GeoJSON (format: [lng, lat])
                            const [lng, lat] = feature.geometry.coordinates;
                            const mapInstance = map.current;
                            
                            if (!mapInstance) {
                              console.error('Map instance not available');
                              return;
                            }
                            
                            // Close search panel first
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            
                            // Fly to the region with smooth animation
                            mapInstance.flyTo({
                              center: [lng, lat],
                              zoom: 7,
                              speed: 1.2,
                              curve: 1.42,
                              essential: true
                            });
                            
                            // Open tooltip after fly animation completes
                            mapInstance.once('moveend', () => {
                              const color = props.provider === 'aws' ? '#FF9900' : '#4285F4';
                              const statusText = locale === 'ar' 
                                ? (props.status === 'live' ? 'مباشر' : 'معلن')
                                : (props.status === 'live' ? 'Live' : 'Announced');
                              const regionCode = props.region_code || 'N/A';
                              
                              const tooltipHTML = `
                                <div style="padding: 8px 12px; font-size: 13px; max-width: 250px; color: #ffffff;">
                                  <div style="font-weight: 600; margin-bottom: 6px; color: #ffffff;">${name}</div>
                                  <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                                    <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                                      ${props.provider.toUpperCase()}
                                    </span>
                                    <span style="background: ${props.status === 'live' ? '#22c55e' : '#f59e0b'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                                      ${statusText}
                                    </span>
                                  </div>
                                  <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
                                    <div><strong style="color: #ffffff;">${locale === 'ar' ? 'الرمز' : 'Code'}:</strong> ${regionCode}</div>
                                    <div><strong style="color: #ffffff;">${locale === 'ar' ? 'الدولة' : 'Country'}:</strong> ${country}</div>
                                    <div><strong style="color: #ffffff;">${locale === 'ar' ? 'المدينة' : 'City'}:</strong> ${city}</div>
                                  </div>
                                </div>
                              `;
                              
                              popupRef.current?.remove();
                              popupRef.current = new maplibregl.Popup({ 
                                closeButton: true, 
                                closeOnClick: true,
                                offset: [0, -36],
                                className: 'marker-popup'
                              })
                                .setLngLat([lng, lat])
                                .setHTML(tooltipHTML)
                                .addTo(mapInstance);
                            });
                          }}
                          className="w-full px-3 py-2 text-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                              style={{ background: props.provider === 'aws' ? 'var(--aws)' : 'var(--gcp)' }}
                            >
                              {props.provider.toUpperCase()}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                props.status === 'live'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}
                            >
                              {locale === 'ar' ? (props.status === 'live' ? 'مباشر' : 'معلن') : (props.status === 'live' ? 'Live' : 'Announced')}
                            </span>
                          </div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {props.region_code && <span className="font-mono">{props.region_code} • </span>}
                            {city}, {country}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
                  </div>
                )}
              </div>
            )}

            {/* Empty state hint */}
            {!debouncedQuery.trim() && (
              <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                {locale === 'ar' 
                  ? 'ابحث بالاسم أو رمز المنطقة أو الدولة أو المدينة'
                  : 'Search by name, region code, country, or city'
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Button - Bottom left (fixed position, no RTL mirror) */}
      <button
        onClick={toggleFullscreen}
        className="absolute z-10 rounded-xl p-3 transition-all hover:scale-105 backdrop-blur-md"
        style={{ 
          left: '16px', 
          bottom: '16px',
          background: 'var(--bg-map-panel)', 
          border: '1px solid var(--border-map-panel)',
          boxShadow: 'var(--shadow-map-panel)'
        }}
        title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
      >
        <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isFullscreen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          )}
        </svg>
      </button>

      {/* Details Panel - Below search on right side (fixed position, no RTL mirror) */}
      {selectedFeature && (
        <div 
          className="absolute z-10 rounded-xl p-4 w-80 max-h-[calc(100%-220px)] overflow-y-auto backdrop-blur-md"
          style={{ 
            right: '16px', 
            top: '200px',
            background: 'var(--bg-map-panel)', 
            border: '1px solid var(--border-map-panel)',
            boxShadow: 'var(--shadow-map-panel)'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {locale === 'ar' ? selectedFeature.properties.name_ar : selectedFeature.properties.name_en}
            </h3>
            <button
              onClick={() => setSelectedFeature(null)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Provider & Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ background: selectedFeature.properties.provider === 'aws' ? 'var(--aws)' : 'var(--gcp)' }}
              >
                {selectedFeature.properties.provider.toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedFeature.properties.status === 'live'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {t(selectedFeature.properties.status)}
              </span>
            </div>

            {/* Region Code */}
            <p style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('code')}:</span>{' '}
              {selectedFeature.properties.region_code || 'N/A'}
            </p>

            {/* Country */}
            <p style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{locale === 'ar' ? 'الدولة' : 'Country'}:</span>{' '}
              {locale === 'ar' ? selectedFeature.properties.country_ar : selectedFeature.properties.country_en}
            </p>

            {/* City */}
            <p style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{locale === 'ar' ? 'المدينة' : 'City'}:</span>{' '}
              {locale === 'ar' ? selectedFeature.properties.city_ar : selectedFeature.properties.city_en}
            </p>

            {/* Notes */}
            {(selectedFeature.properties.notes_en || selectedFeature.properties.notes_ar) && (
              <p style={{ color: 'var(--text-secondary)' }}>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('notes')}:</span>{' '}
                {locale === 'ar' ? selectedFeature.properties.notes_ar : selectedFeature.properties.notes_en}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
