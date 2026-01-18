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
  metadataBase: new URL("https://docsqueezer.com"),
  title: "DocSqueezer - Free PDF Compression & Conversion",
  description: "Compress PDFs and images instantly. Fast, secure, and private. Free tier available with Pro plans starting at £5/month.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: "https://docsqueezer.com",
    title: "DocSqueezer - Free PDF Compression & Conversion",
    description: "Compress PDFs and images instantly. Fast, secure, and private. Free tier available with Pro plans starting at £5/month.",
    siteName: "DocSqueezer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocSqueezer - Free PDF Compression & Conversion",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://docsqueezer.com",
    title: "DocSqueezer - Free PDF Compression & Conversion",
    description: "Compress PDFs and images instantly. Fast, secure, and private. Free tier available.",
    images: ["/og-image.png"],
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
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    // Check for updates every time the page is loaded
                    registration.update();
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });

                // Reload the page when a new service worker takes over
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
