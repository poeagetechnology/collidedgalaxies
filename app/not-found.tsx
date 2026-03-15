import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Collided Galaxies',
  description:
    'The page you are looking for might have been removed or is temporarily unavailable. Return to our homepage.',
  robots: {
    index: false,
    follow: false,
  },
};

const NotFound404 = () => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found',
    url: 'https://www.collidedgalaxies.com/404',
    description:
      'The page you are looking for might have been removed or is temporarily unavailable.',
  };

  return (
    <>
      <Script
        id="not-found-schema"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Homepage
            </Link>

            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Link
                href="/products"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Shop Products
              </Link>
              <Link
                href="/contact"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Contact Us
              </Link>
              <Link
                href="/about"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                About Us
              </Link>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Error Code: 404</p>
            <p>If you believe this is a mistake, please contact our support team.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound404;
