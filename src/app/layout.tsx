import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import AuthProvider from "@/components/AuthProvider";
import { AuthProvider as CustomAuthProvider } from "@/contexts/AuthContext";
import JSONLD from "@/components/SEO/JSONLD";
import { generateOrganizationSchema } from "@/lib/seo-utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Destination Kolkata - Discover the City of Joy | Hotels, Restaurants & Attractions",
    template: "%s | Destination Kolkata"
  },
  description: "Explore Kolkata's best hotels, restaurants, attractions, and events. Plan your perfect trip to the City of Joy with comprehensive guides, reviews, and local insights.",
  keywords: [
    "Kolkata tourism",
    "City of Joy",
    "Kolkata hotels",
    "Kolkata restaurants",
    "Kolkata attractions",
    "Kolkata events",
    "West Bengal tourism",
    "India travel",
    "Kolkata guide",
    "Kolkata food",
    "Kolkata culture",
    "Kolkata heritage",
    "Kolkata nightlife",
    "Kolkata shopping",
    "Kolkata accommodation"
  ],
  authors: [{ name: "Destination Kolkata Team" }],
  creator: "Destination Kolkata",
  publisher: "Destination Kolkata",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://destinationkolkata.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://destinationkolkata.com',
    title: 'Destination Kolkata - Discover the City of Joy',
    description: 'Explore Kolkata\'s best hotels, restaurants, attractions, and events. Plan your perfect trip to the City of Joy.',
    siteName: 'Destination Kolkata',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Kolkata City Skyline - The City of Joy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destination Kolkata - Discover the City of Joy',
    description: 'Explore Kolkata\'s best hotels, restaurants, attractions, and events.',
    images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'],
    creator: '@destinationkolkata',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ]
  },
  other: {
    'msapplication-TileColor': '#ea580c',
    'msapplication-config': '/browserconfig.xml'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en">
      <head>
        <JSONLD data={organizationSchema} />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CustomAuthProvider>
            <ConditionalLayout>
              <AnalyticsProvider>
                {children}
              </AnalyticsProvider>
            </ConditionalLayout>
          </CustomAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
