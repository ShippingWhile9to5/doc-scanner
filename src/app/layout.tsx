import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.docsqueezer.com"),
  title: "DocSqueezer - Privacy-First PDF Scanning & Compression",
  description: "Compress PDFs and images instantly. Fast, secure, and private document processing starting at £5/month.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.docsqueezer.com",
    title: "DocSqueezer - Privacy-First PDF Scanning & Compression",
    description: "Compress PDFs and images instantly. Fast, secure, and private document processing.",
    siteName: "DocSqueezer",
    images: [
      {
        url: "/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "DocSqueezer - Privacy-First PDF Scanning & Compression",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://www.docsqueezer.com",
    title: "DocSqueezer - Privacy-First PDF Scanning & Compression",
    description: "Compress PDFs and images instantly. Fast, secure, and private document processing.",
    images: ["/og-image.png?v=2"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DocSqueezer",
  "operatingSystem": "iOS, Android, Windows, macOS",
  "applicationCategory": "ProductivityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "description": "Privacy-focused document scanner and PDF compressor. Process files locally on your device.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "120"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // EMERGENCY KILL SWITCH: Unregister all service workers to fix ChunkLoadErrors
                window.addEventListener('load', function() {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      console.log('Unregistering stuck SW:', registration);
                      registration.unregister();
                    }
                    if (registrations.length > 0) {
                      console.log('Reloading to clear SW control...');
                      window.location.reload();
                    }
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
