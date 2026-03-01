declare module '*.geojson' {
  const value: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: { type: 'Point'; coordinates: [number, number] };
      properties: {
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
      };
    }>;
  };
  export default value;
}
