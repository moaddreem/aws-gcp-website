export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Bootcamp configuration
export const BOOTCAMP_CONFIG = {
  startDate: '2026-02-23',
  endDate: '2026-05-14',
  dailyTime: {
    start: '11:00',
    end: '15:00',
  },
  timezone: 'Asia/Riyadh',
};

// Calculate bootcamp progress (0-100)
export function calculateProgress(): number {
  const now = new Date();
  // Convert to Saudi Arabia timezone
  const saudiTime = new Date(now.toLocaleString('en-US', { timeZone: BOOTCAMP_CONFIG.timezone }));
  
  const start = new Date(BOOTCAMP_CONFIG.startDate);
  const end = new Date(BOOTCAMP_CONFIG.endDate);
  
  // Set to start of day for day precision
  saudiTime.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (saudiTime.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  // Clamp between 0 and 1, then convert to percentage
  const progress = Math.max(0, Math.min(1, elapsedDays / totalDays)) * 100;
  
  return Math.round(progress);
}

// Format date for display
export function formatDateRange(locale: string): string {
  const start = new Date(BOOTCAMP_CONFIG.startDate);
  const end = new Date(BOOTCAMP_CONFIG.endDate);
  
  if (locale === 'ar') {
    return `${start.toLocaleDateString('ar-SA')} - ${end.toLocaleDateString('ar-SA')}`;
  }
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
