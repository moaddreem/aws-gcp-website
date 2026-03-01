# Map Maintenance Guide

This document explains how to maintain and extend the interactive cloud regions map.

## Overview

The map uses:
- **MapLibre GL JS** - Open-source map rendering library
- **Carto Basemaps** - 100% free vector tiles (no API key required)
- **Supercluster** - Client-side marker clustering

## Location Dataset

### File Location
```
src/data/locations.json
```

### Data Structure
```json
{
  "locations": [
    {
      "id": "aws-us-east-1",           // Unique identifier
      "provider": "aws",                // "aws" or "gcp"
      "type": "region",                 // "region" or "datacenter"
      "status": "live",                 // "live" or "announced"
      "code": "us-east-1",              // Region/DC code (optional)
      "name_en": "US East (N. Virginia)", // English name
      "name_ar": "شرق الولايات المتحدة",   // Arabic name
      "lat": 38.9519,                   // Latitude
      "lon": -77.4480,                  // Longitude
      "notes_en": "Optional notes",     // English notes (can be null)
      "notes_ar": "ملاحظات اختيارية"      // Arabic notes (can be null)
    }
  ]
}
```

## Adding/Editing Markers

### To Add a New Location:
1. Open `src/data/locations.json`
2. Add a new object to the `locations` array:
```json
{
  "id": "gcp-me-central1",
  "provider": "gcp",
  "type": "region",
  "status": "announced",
  "code": "me-central1",
  "name_en": "Middle East (Saudi Arabia)",
  "name_ar": "الشرق الأوسط (السعودية)",
  "lat": 24.7136,
  "lon": 46.6753,
  "notes_en": "Upcoming GCP region in Riyadh",
  "notes_ar": "منطقة GCP قادمة في الرياض"
}
```
3. Save the file - markers update automatically on page refresh

### Required Fields:
- `id` - Must be unique
- `provider` - Must be "aws" or "gcp"
- `type` - Must be "region" or "datacenter"
- `status` - Must be "live" or "announced"
- `name_en` - English display name
- `name_ar` - Arabic display name
- `lat` - Latitude coordinate
- `lon` - Longitude coordinate

### Optional Fields:
- `code` - Region/datacenter code
- `notes_en` - English notes
- `notes_ar` - Arabic notes

## Map Styles

### Current Styles (Carto Basemaps - Free)
| Style | URL | Description |
|-------|-----|-------------|
| Standard | `voyager-gl-style` | Colorful, detailed map |
| Light | `positron-gl-style` | Minimal light theme |
| Dark | `dark-matter-gl-style` | Dark theme |

### Adding New Basemap Styles

1. Open `src/components/CloudMap.tsx`

2. Add the style URL to `CARTO_STYLES`:
```typescript
const CARTO_STYLES: Record<MapStyle, string> = {
  standard: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  // Add new style:
  custom: 'https://your-style-url/style.json',
};
```

3. Add bilingual labels to `STYLE_LABELS`:
```typescript
const STYLE_LABELS: Record<MapStyle, { en: string; ar: string }> = {
  standard: { en: 'Standard', ar: 'قياسي' },
  light: { en: 'Light', ar: 'فاتح' },
  dark: { en: 'Dark', ar: 'داكن' },
  // Add new label:
  custom: { en: 'Custom', ar: 'مخصص' },
};
```

4. Update the `MapStyle` type:
```typescript
type MapStyle = 'standard' | 'light' | 'dark' | 'custom';
```

### Alternative Free Style Sources

| Provider | URL Pattern | Notes |
|----------|-------------|-------|
| Carto | `basemaps.cartocdn.com/gl/{style}/style.json` | Current (free, no key) |
| OpenFreeMap | `tiles.openfreemap.org/styles/liberty/style.json` | Free, no key |
| Stadia Maps | Requires domain registration | Free tier: 200k/month |

## Marker Styling

Markers are styled in the `updateMarkers` function:

### Cluster Markers
- Gradient background (AWS orange → GCP blue)
- Shows count of clustered points
- Click to zoom into cluster

### Individual Markers
- **AWS**: Orange (#FF9900)
- **GCP**: Blue (#4285F4)
- **Regions**: Square shape, 18px
- **Data Centers**: Circle shape, 12px

## Translations

Map UI translations are in:
- `src/messages/en.json` → `map` section
- `src/messages/ar.json` → `map` section

Required translation keys:
```json
{
  "map": {
    "title": "...",
    "subtitle": "...",
    "filters": "...",
    "provider": "...",
    "status": "...",
    "type": "...",
    "both": "...",
    "aws": "...",
    "gcp": "...",
    "live": "...",
    "announced": "...",
    "regions": "...",
    "dataCenters": "...",
    "fullscreen": "...",
    "exitFullscreen": "...",
    "code": "...",
    "notes": "..."
  }
}
```

## Troubleshooting

### Map shows gray/empty
- Check browser console for errors
- Verify Carto CDN is accessible
- Try a different style

### Markers not showing
- Check `locations.json` for valid JSON syntax
- Verify lat/lon coordinates are numbers
- Check filter settings

### Style switcher not working
- Ensure `CARTO_STYLES` URLs are correct
- Check for CORS issues in console

## Performance Tips

1. **Clustering**: Already implemented via Supercluster
2. **Lazy loading**: Map component uses `dynamic()` with `ssr: false`
3. **Marker cleanup**: Markers are removed before re-rendering
4. **Debouncing**: Consider adding for rapid filter changes
