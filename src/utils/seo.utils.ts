// SEO Utilities - Helper functions for SEO implementations
import { Metadata } from 'next';
import { SITE_CONFIG, PAGES_META } from './seo.constants';

/**
 * Generate metadata for pages with proper OpenGraph and Twitter Card data
 */
export function generatePageMetadata(
  pageKey: keyof typeof PAGES_META,
  customOverrides?: Partial<Metadata>
): Metadata {
  const pageMeta = PAGES_META[pageKey];
  const baseUrl = SITE_CONFIG.domain;

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    keywords: pageMeta.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMeta.title,
      description: pageMeta.description,
      creator: SITE_CONFIG.twitterCreator,
      images: [`${baseUrl}/og-image.jpg`],
    },
    ...customOverrides,
  };
}

/**
 * Generate product metadata with structured data
 */
export function generateProductMetadata(
  productName: string,
  productDescription: string,
  productImage: string,
  price: number,
  slug: string
): Metadata {
  const productUrl = `${SITE_CONFIG.domain}/pdtDetails/${slug}`;

  return {
    title: `${productName} | ${SITE_CONFIG.name}`,
    description: productDescription.substring(0, 160),
    keywords: [
      productName,
      'oversized t-shirt',
      'streetwear',
      'unisex clothing',
    ],
    metadataBase: new URL(SITE_CONFIG.domain),
    alternates: {
      canonical: productUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${productName} | ${SITE_CONFIG.name}`,
      description: productDescription.substring(0, 160),
      type: 'website',
      url: productUrl,
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: productName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} | ${SITE_CONFIG.name}`,
      description: productDescription.substring(0, 160),
      images: [productImage],
    },
  };
}

/**
 * Generate JSON-LD schema for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      'https://www.instagram.com/collidedgalaxies',
      'https://www.facebook.com/collidedgalaxies',
      'https://www.youtube.com/@collidedgalaxies',
    ],
    contact: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: SITE_CONFIG.email,
    },
  };
}

/**
 * Generate JSON-LD schema for Product
 */
export function generateProductSchema(
  productName: string,
  description: string,
  image: string,
  price: number,
  currency: string = 'INR',
  rating?: number,
  reviewCount?: number,
  availability: string = 'InStock'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: {
      '@type': 'Offer',
      url: SITE_CONFIG.domain,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
    },
    ...(rating && reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
      },
    }),
  };
}

/**
 * Generate JSON-LD schema for BreadcrumbList
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate JSON-LD schema for FAQPage
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD schema for WebPage
 */
export function generateWebPageSchema(
  title: string,
  description: string,
  url: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image: image || `${SITE_CONFIG.domain}/og-image.jpg`,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.domain}/logo.png`,
      },
    },
  };
}

/**
 * Format schema for JSON-LD script tag
 */
export function formatSchemaAsString(schema: object): string {
  return JSON.stringify(schema, null, 2);
}
