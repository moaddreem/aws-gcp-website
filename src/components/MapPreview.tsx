'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import locations from '@/data/locations.json';

export default function MapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : 'https://demotiles.maplibre.org/style.json';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [45, 25],
      zoom: 2,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      locations.locations.forEach((location) => {
        const color = location.provider === 'aws' ? '#FF9900' : '#4285F4';
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.backgroundColor = color;
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

        new maplibregl.Marker({ element: el })
          .setLngLat([location.lon, location.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
