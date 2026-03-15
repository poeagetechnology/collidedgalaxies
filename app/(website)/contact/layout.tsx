import { Metadata } from 'next';
import { generatePageMetadata, generateWebPageSchema } from '@/src/utils/seo.utils';
import Script from 'next/script';

export const metadata: Metadata = generatePageMetadata('contact', {
  alternates: {
    canonical: 'https://www.collidedgalaxies.com/contact',
  },
});

export default function ContactPage() {
  const schemaData = generateWebPageSchema(
    'Contact Collided Galaxies',
    'Get in touch with Collided Galaxies. We respond to all inquiries within 24 hours. Contact us for support, feedback, or collaboration.',
    'https://www.collidedgalaxies.com/contact'
  );

  return (
    <>
      <Script
        id="contact-schema"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />
    </>
  );
}
