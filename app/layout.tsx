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
    icon: "/COGA_Favicon.svg",
  },
  verification: {
    google: "gRk0ofB9Go43PKl7o4kWRP63Q4Wnf2dIZQ3whMaszZs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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

        {/* Razorpay Checkout Script (REQUIRED) */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
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