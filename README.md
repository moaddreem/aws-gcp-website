# Cloud Solutions Engineering Bootcamp Website

معسكر هندسة الحلول السحابية (AWS + Google Cloud)

A bilingual (Arabic + English) public website for a Saudi bootcamp at Tuwaiq Academy.

## Features

- **Light/Dark Mode**: Toggle between themes with system preference detection and localStorage persistence
- **Bilingual Support**: Full Arabic (RTL) and English support with language toggle
- **Modern Landing Page**: Reference-style design with:
  - Hero section with gradient backgrounds
  - Social proof strip with avatars
  - Bootcamp progress bar (Saudi timezone)
  - Benefits cards section
  - Testimonials section
  - FAQ accordion
  - Final CTA section
- **Interactive Map**: World map showing AWS and Google Cloud infrastructure
  - Filter by provider (AWS/GCP)
  - Filter by status (Live/Announced)
  - Filter by type (Regions/Data Centers)
  - Style switcher (Streets/Satellite/Terrain)
  - Marker clustering
  - Fullscreen mode
- **Services Comparison**: Category-first expandable UI with search
- **Learning Materials**: Accordion-based navigation for Slides, Labs, and Extras
- **Responsive Design**: Mobile-first, modern UI with AWS Orange + GCP Blue gradients

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

## Environment Variables

Create a `.env.local` file:

```env
# MapTiler API Key for satellite/terrain map styles
# Get your free key at https://www.maptiler.com/
NEXT_PUBLIC_MAPTILER_KEY=your_key_here
```

Without the MapTiler key, the map will fall back to basic streets style.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page
│   │   ├── map/page.tsx     # Map page
│   │   └── services/page.tsx # Services page
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CloudMap.tsx     # Full map component
│   │   └── MapPreview.tsx   # Home page map preview
│   ├── data/                # JSON data files
│   │   ├── locations.json   # AWS/GCP locations
│   │   ├── services.json    # Service comparisons
│   │   └── resources.json   # Slides, labs, extras
│   ├── lib/                 # Utilities
│   │   └── utils.ts
│   ├── messages/            # i18n translations
│   │   ├── en.json
│   │   └── ar.json
│   └── i18n.ts              # i18n configuration
├── public/                  # Static assets
│   ├── placeholder-tuwaiq.svg   # TODO: Replace with actual logo
│   └── placeholder-personal.svg # TODO: Replace with actual logo
└── ...
```

## Customization

### Logos

Replace the placeholder logos in `public/`:
- `placeholder-tuwaiq.svg` → Tuwaiq Academy logo
- `placeholder-personal.svg` → Personal logo

Update the Header component to use the actual logo files.

### Data Files

Edit the JSON files in `src/data/`:

- **locations.json**: Add/edit AWS and GCP locations
- **services.json**: Add/edit service comparisons by category
- **resources.json**: Add slides, labs, and extras

### Bootcamp Dates

Update the dates in `src/lib/utils.ts`:

```typescript
export const BOOTCAMP_CONFIG = {
  startDate: '2026-02-23',
  endDate: '2026-05-14',
  // ...
};
```

### Translations

Edit translation files in `src/messages/`:
- `en.json` for English
- `ar.json` for Arabic

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

For subdomain `cloud.duraym.com`:
1. Add custom domain in Vercel project settings
2. Configure DNS CNAME record

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Maps**: MapLibre GL JS
- **Clustering**: Supercluster

## License

© 2026 Cloud Bootcamp. All rights reserved.
