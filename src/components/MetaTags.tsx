// SEO Meta Tags Component
// Use this component to inject meta tags dynamically on client-side when needed

import Script from 'next/script';

interface MetaTagProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

/**
 * Component for injecting dynamic meta tags
 * Use in client components with 'use client' directive if needed
 */
export function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
}: MetaTagProps) {
  return (
    <>
      {/* Meta tags are typically set via metadata export in page.tsx */}
      {/* This component is useful for dynamic updates */}
      
      {jsonLd && (
        <Script
          id="dynamic-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      )}
    </>
  );
}

export default MetaTags;
