import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
});

export const metadata: Metadata = {
  title: 'Muath Cloud Website',
  description: 'AWS + Google Cloud bootcamp at Tuwaiq Academy, Saudi Arabia. Explore cloud infrastructure, services, and hands-on labs.',
  keywords: ['AWS', 'Google Cloud', 'GCP', 'bootcamp', 'cloud computing', 'Saudi Arabia', 'Tuwaiq Academy'],
  icons: {
    icon: '/Thisisthelogo.png',
    shortcut: '/Thisisthelogo.png',
    apple: '/Thisisthelogo.png',
  },
  openGraph: {
    title: 'Cloud Solutions Engineering Bootcamp',
    description: 'AWS + Google Cloud bootcamp at Tuwaiq Academy',
    url: 'https://cloud.duraym.com',
    siteName: 'Cloud Bootcamp',
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexArabic.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
