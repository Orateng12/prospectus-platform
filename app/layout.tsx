import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans, Inter, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prospectus.co.za';
const TITLE = "Prospectus — South Africa's University Decision Engine";
const DESCRIPTION =
  'Enter your matric results and instantly see every programme, career, and bursary you qualify for — across 89+ South African institutions. Free for every matric student.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Prospectus',
  },
  description: DESCRIPTION,
  keywords: [
    'matric', 'APS calculator', 'university eligibility', 'South Africa',
    'NSFAS', 'bursary', 'career matching', 'NSC programmes', 'university application',
    'matric results', 'higher education South Africa',
  ],
  authors: [{ name: 'Prospectus', url: SITE_URL }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Prospectus',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakartaSans.variable} ${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
