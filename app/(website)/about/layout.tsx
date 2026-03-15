import { Metadata } from 'next';
import { generatePageMetadata, generateWebPageSchema } from '@/src/utils/seo.utils';
import Script from 'next/script';

export const metadata: Metadata = generatePageMetadata('about', {
  alternates: {
    canonical: 'https://www.collidedgalaxies.com/about',
  },
});

export default function AboutPage() {
  const schemaData = generateWebPageSchema(
    'About Collided Galaxies',
    'Discover the story behind Collided Galaxies. We create premium oversized t-shirts that blend comfort, style, and aesthetic appeal.',
    'https://www.collidedgalaxies.com/about'
  );

  return (
    <>
      <Script
        id="about-schema"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />
      {/* Page content will be rendered by existing components */}
    </>
  );
}
