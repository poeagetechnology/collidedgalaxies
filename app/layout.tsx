import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartProvider from "@/src/context/CartContext";
import CartDrawer from "@/src/components/cartDrawer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/context/authProvider";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import {
  SITE_CONFIG,
  BRAND_KEYWORDS,
  COMPANY_INFO,
} from "@/src/utils/seo.constants";
import { generateOrganizationSchema } from "@/src/utils/seo.utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: "Collided Galaxies | Premium Oversized Unisex T-Shirts",
    template: "%s | Collided Galaxies",
  },
  description: SITE_CONFIG.description,
  keywords: BRAND_KEYWORDS,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  applicationName: SITE_CONFIG.name,
  category: "Fashion",
  classification: "E-commerce",
  alternates: {
    canonical: SITE_CONFIG.domain,
    languages: {
      "en-US": `${SITE_CONFIG.domain}`,
    },
  },
  openGraph: {
    title: "Collided Galaxies – Premium Oversized T-Shirts",
    description:
      "Shop high-quality oversized tees for men & women. Printed & plain drops. Premium fabric, unique designs & fast shipping.",
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.domain}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
      {
        url: `${SITE_CONFIG.domain}/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collided Galaxies",
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterCreator,
    images: [`${SITE_CONFIG.domain}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon-32x32.png",
    apple: [
      { url: "/icons/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/icons/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/icons/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      {
        url: "/icons/apple-icon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      { url: "/icons/apple-icon-precomposed.png", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/icons/android-icon-192x192.png" },
      { rel: "android-chrome-144x144", url: "/icons/android-icon-144x144.png" },
      { rel: "android-chrome-96x96", url: "/icons/android-icon-96x96.png" },
      { rel: "android-chrome-72x72", url: "/icons/android-icon-72x72.png" },
      { rel: "android-chrome-48x48", url: "/icons/android-icon-48x48.png" },
      { rel: "android-chrome-36x36", url: "/icons/android-icon-36x36.png" },
      {
        rel: "icon",
        url: "/icons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      { rel: "manifest", url: "/icons/manifest.json" },
    ],
  },
  verification: {
    google: "gRk0ofB9Go43PKl7o4kWRP63Q4Wnf2dIZQ3whMaszZs",
  },
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Collided Galaxies",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />

        {/* DNS Prefetch for better performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Canonical URL */}
        <link rel="canonical" href={SITE_CONFIG.domain} />

        {/* Language Alternatives */}
        <link rel="alternate" hrefLang="en-US" href={SITE_CONFIG.domain} />

        {/* Microsoft Clarity Tracking in Head */}
        <Script
          id="clarity-head"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vmru37uvep");
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} pt-14 sm:pt-16`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>

        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7TT62HXKQP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7TT62HXKQP', {
              'page_path': window.location.pathname,
              'anonymize_ip': true
            });
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1214709424180151');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Meta Pixel No-Script */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1214709424180151&ev=PageView&noscript=1"
            alt="Facebook Pixel"
          />
        </noscript>

        {/* Organization JSON-LD Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* WebSite Schema with Search Action */}
        <Script
          id="website-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.domain,
              description: SITE_CONFIG.description,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_CONFIG.domain}/products?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <Analytics />

        {/* Microsoft Clarity Tracking in Body */}
        <Script
          id="clarity-body"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vmru37uvep");
            `,
          }}
        />
      </body>
    </html>
  );
}
