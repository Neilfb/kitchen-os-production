import { Restaurant, Menu, MenuItem } from '@kitchen-os/database';

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
   * Generate SEO metadata for menu page
   */
  static generateMenuSEO(restaurant: Restaurant, menu: Menu, menuItems: MenuItem[]): SEOMetadata {
    const title = `${menu.name} - ${restaurant.name} | Kitchen OS`;
    const description = menu.description 
      ? `${menu.description} Browse ${menuItems.length} items with detailed allergen information.`
      : `Browse ${menu.name} at ${restaurant.name}. ${menuItems.length} items with detailed allergen information and dietary options.`;

    // Extract popular ingredients and categories for keywords
    const categories = [...new Set(menuItems.map(item => item.category.toLowerCase()))];
    const popularIngredients = this.extractPopularIngredients(menuItems);
    const dietaryOptions = [...new Set(menuItems.flatMap(item => item.dietaryTags))];

    const keywords = [
      restaurant.name.toLowerCase(),
      menu.name.toLowerCase(),
      'digital menu',
      'restaurant menu',
      'allergen information',
      ...categories,
      ...popularIngredients.slice(0, 10),
      ...dietaryOptions,
      restaurant.address.city.toLowerCase(),
      'qr code menu',
      'contactless dining',
    ];

    // Generate menu items for structured data
    const menuItemsStructured = menuItems.slice(0, 20).map(item => ({
      '@type': 'MenuItem',
      name: item.name,
      description: item.description,
      offers: {
        '@type': 'Offer',
        price: item.price,
        priceCurrency: item.currency,
      },
      nutrition: {
        '@type': 'NutritionInformation',
        allergens: item.allergens,
      },
      suitableForDiet: item.dietaryTags.map(tag => this.mapDietaryTagToSchema(tag)).filter(Boolean),
    }));

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      name: menu.name,
      description: menu.description,
      provider: {
        '@type': 'Restaurant',
        name: restaurant.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.address.street,
          addressLocality: restaurant.address.city,
          addressRegion: restaurant.address.state,
          postalCode: restaurant.address.zipCode,
          addressCountry: restaurant.address.country,
        },
      },
      hasMenuSection: menu.sections.map(section => ({
        '@type': 'MenuSection',
        name: section.name,
        description: section.description,
        hasMenuItem: menuItemsStructured.filter(item => 
          section.items.includes(menuItems.find(mi => mi.name === item.name)?.id || '')
        ),
      })),
    };

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
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
   * Generate sitemap entries for restaurant and menus
   */
  static generateSitemapEntries(restaurants: Restaurant[], menus: Menu[]): Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'daily' | 'weekly' | 'monthly';
    priority: number;
  }> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchen-os-web.vercel.app';
    const entries = [];

    // Restaurant pages
    restaurants.forEach(restaurant => {
      entries.push({
        url: `${baseUrl}/menu/${restaurant.id}`,
        lastModified: new Date(restaurant.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    });

    // Menu pages
    menus.filter(menu => menu.published).forEach(menu => {
      entries.push({
        url: `${baseUrl}/menu/${menu.restaurantId}/${menu.id}`,
        lastModified: new Date(menu.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      });
    });

    return entries;
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchen-os-web.vercel.app';
    
    return `User-agent: *
Allow: /menu/
Allow: /qr/
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;
  }

  /**
   * Extract popular ingredients from menu items
   */
  private static extractPopularIngredients(menuItems: MenuItem[]): string[] {
    const ingredientCounts = new Map<string, number>();

    menuItems.forEach(item => {
      item.ingredients.forEach(ingredient => {
        const normalized = ingredient.toLowerCase().trim();
        ingredientCounts.set(normalized, (ingredientCounts.get(normalized) || 0) + 1);
      });
    });

    return Array.from(ingredientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([ingredient]) => ingredient)
      .filter(ingredient => ingredient.length > 2); // Filter out very short ingredients
  }

  /**
   * Map dietary tags to schema.org diet types
   */
  private static mapDietaryTagToSchema(tag: string): string | null {
    const mapping: Record<string, string> = {
      'vegan': 'https://schema.org/VeganDiet',
      'vegetarian': 'https://schema.org/VegetarianDiet',
      'gluten-free': 'https://schema.org/GlutenFreeDiet',
      'dairy-free': 'https://schema.org/DiabeticDiet', // Closest match
      'halal': 'https://schema.org/HalalDiet',
      'kosher': 'https://schema.org/KosherDiet',
    };

    return mapping[tag] || null;
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

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): any {
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
}
