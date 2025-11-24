import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StructuredData from '@/components/home/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Hippo Buck Homa Bay | Best Hotel in Homa Bay Town | Lake Victoria Hotels Kenya',
  description:
    'Hotel Hippo Buck - Premier hotel in Homa Bay Town offering breathtaking Lake Victoria sunsets, fresh Tilapia cuisine, comfortable rooms & warm hospitality. Book your lakeside getaway, romantic escape, or family vacation at the best hotel in Homa Bay County, Kenya.',
  keywords: [
    'Hotel Hippo Buck',
    'Homa Bay hotel',
    'Homa Bay Town hotel',
    'Lake Victoria hotel',
    'hotels in Homa Bay',
    'best hotel Homa Bay',
    'Homa Bay accommodation',
    'Lake Victoria accommodation',
    'Homa Bay County hotels',
    'Kenya lakeside hotel',
    'Homa Bay lodging',
    'fresh Tilapia restaurant Homa Bay',
    'Lake Victoria sunset hotel',
    'romantic getaway Homa Bay',
    'family vacation hotel Homa Bay',
    'peaceful retreat Kenya',
    'Homa Bay hospitality',
    'book hotel Homa Bay',
    'Homa Bay tourism',
    'Kenya hotel booking',
    'lakeside hotel Kenya',
    'Homa Bay business hotel',
    'weekend getaway Homa Bay',
    'Lake Victoria views',
    'affordable hotel Homa Bay',
  ].join(', '),
  authors: [{ name: 'Hotel Hippo Buck' }],
  openGraph: {
    title: 'Hotel Hippo Buck - Best Hotel in Homa Bay Town, Lake Victoria',
    description:
      'Experience serene lakeside hospitality at Hotel Hippo Buck, Homa Bay. Stunning Lake Victoria sunsets, fresh Tilapia cuisine, comfortable rooms. Perfect for romantic escapes, family vacations & peaceful getaways.',
    url: 'https://hotelhippobuck.com',
    siteName: 'Hotel Hippo Buck',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hotel Hippo Buck - Homa Bay Town Lakeside Hotel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Hippo Buck Homa Bay | Lake Victoria Hotels Kenya',
    description:
      'Premier hotel in Homa Bay Town with Lake Victoria sunsets, fresh Tilapia & warm hospitality. Book your perfect getaway today!',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://hotelhippobuck.com',
  },
  category: 'Hospitality',
};

export default function RootLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="geo.region" content="KE-29" />
        <meta name="geo.placename" content="Homa Bay Town" />
        <meta name="geo.position" content="-0.5273;34.4570" />
        <meta name="ICBM" content="-0.5273, 34.4570" />
      </head>
      <body className={inter.className}>
        <StructuredData />
        {children}

      </body>
    </html>
  );
}