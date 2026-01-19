import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartProvider from "@/src/context/CartContext";
import CartDrawer from "@/src/components/cartDrawer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/context/authProvider";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.collidedgalaxies.in"),
  title: {
    default: "Collided Galaxies | Oversized Unisex T-Shirts",
    template: "%s | Collided Galaxies",
  },
  description:
    "Collided Galaxies is a unisex clothing brand offering premium oversized t-shirts, both printed & plain. Shop aesthetic streetwear designed for comfort and style.",
  keywords: [
    "oversized t-shirts",
    "unisex clothing",
    "streetwear india",
    "printed oversized tees",
    "plain oversized tees",
    "baggy tees",
    "men fashion",
    "women fashion",
    "minimal clothing",
    "aesthetic clothing",
    "Indian streetwear",
  ],
  openGraph: {
    title: "Collided Galaxies – Premium Oversized T-Shirts",
    description:
      "Shop high-quality oversized tees for men & women. Printed & plain drops. Premium fabric & unique designs.",
    url: "https://www.collidedgalaxies.in",
    siteName: "Collided Galaxies",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
      { url: "/icons/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-icon-precomposed.png", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/icons/android-icon-192x192.png" },
      { rel: "android-chrome-144x144", url: "/icons/android-icon-144x144.png" },
      { rel: "android-chrome-96x96", url: "/icons/android-icon-96x96.png" },
      { rel: "android-chrome-72x72", url: "/icons/android-icon-72x72.png" },
      { rel: "android-chrome-48x48", url: "/icons/android-icon-48x48.png" },
      { rel: "android-chrome-36x36", url: "/icons/android-icon-36x36.png" },
      { rel: "icon", url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} pt-14 sm:pt-16`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" />
            <CartDrawer />
            {/* Chatbot is intentionally disabled right now to avoid loading client-side chat code in layout. */}
            {/* To enable later, re-add a client-only dynamic import here, e.g.:
              const Chatbot = dynamic(() => import('@/src/components/chat-assistant/chatBot'), { ssr: false });
              <Chatbot />
            */}
          </CartProvider>
        </AuthProvider>

        {/* Shiprocket Checkout SDK */}
        <Script
          src="https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        {/* Shiprocket Checkout CSS */}
        <link
          rel="stylesheet"
          href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css"
        />

        {/* Cashfree Payment SDK */}
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="afterInteractive"
        />

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
        gtag('config', 'G-7TT62HXKQP');
      `}
        </Script>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Collided Galaxies",
              url: "https://www.collidedgalaxies.in",
            }),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}