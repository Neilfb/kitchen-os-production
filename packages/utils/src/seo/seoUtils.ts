// Temporary interfaces until database package is available
interface Restaurant {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  id: string;
  updatedAt: string;
}

interface Menu {
  name: string;
  description?: string;
  id: string;
  restaurantId: string;
  published: boolean;
  updatedAt: string;
  sections: Array<{
    name: string;
    description?: string;
    items: string[];
  }>;
}

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  currency: string;
  allergens: string[];
  dietaryTags: string[];
  ingredients: string[];
  category: string;
  id: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    type: string;
    url?: string;
    image?: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
  structuredData: any;
}

export class SEOUtils {
  /**
   * Generate SEO metadata for restaurant page
   */
  static generateRestaurantSEO(restaurant: Restaurant): SEOMetadata {
    const title = `${restaurant.name} - Digital Menu | Kitchen OS`;
    const description = restaurant.description 
      ? `${restaurant.description} View our digital menu with allergen information and dietary options.`
      : `Digital menu for ${restaurant.name}. View our complete menu with allergen information and dietary options.`;

    const keywords = [
      restaurant.name.toLowerCase(),
      'digital menu',
      'restaurant',
      'allergen information',
      'dietary options',
      restaurant.address.city.toLowerCase(),
      restaurant.address.state.toLowerCase(),
      'qr code menu',
      'contactless menu',
    ];

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: restaurant.name,
      description: restaurant.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: restaurant.address.street,
        addressLocality: restaurant.address.city,
        addressRegion: restaurant.address.state,
        postalCode: restaurant.address.zipCode,
        addressCountry: restaurant.address.country,
      },
      telephone: restaurant.phone,
      email: restaurant.email,
      url: restaurant.website,
      image: restaurant.logoUrl,
      servesCuisine: 'Various',
      priceRange: '$$',
      hasMenu: `${process.env.NEXT_PUBLIC_APP_URL}/menu/${restaurant.id}`,
    };

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'business.business',
        siteName: 'Kitchen OS',
        image: restaurant.logoUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: restaurant.logoUrl,
      },
      structuredData,
    };
  }

  /**
   * Generate meta tags for Next.js
   */
  static generateMetaTags(seo: SEOMetadata): Array<{ name?: string; property?: string; content: string }> {
    const tags = [
      { name: 'description', content: seo.description },
      { name: 'keywords', content: seo.keywords.join(', ') },
      
      // Open Graph
      { property: 'og:title', content: seo.openGraph.title },
      { property: 'og:description', content: seo.openGraph.description },
      { property: 'og:type', content: seo.openGraph.type },
      { property: 'og:site_name', content: seo.openGraph.siteName },
      
      // Twitter
      { name: 'twitter:card', content: seo.twitter.card },
      { name: 'twitter:title', content: seo.twitter.title },
      { name: 'twitter:description', content: seo.twitter.description },
    ];

    if (seo.openGraph.url) {
      tags.push({ property: 'og:url', content: seo.openGraph.url });
    }

    if (seo.openGraph.image) {
      tags.push({ property: 'og:image', content: seo.openGraph.image });
      tags.push({ name: 'twitter:image', content: seo.openGraph.image });
    }

    return tags;
  }

  /**
   * Generate canonical URL
   */
  static generateCanonicalUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchen-os-web.vercel.app';
    return `${baseUrl}${path}`;
  }
}
