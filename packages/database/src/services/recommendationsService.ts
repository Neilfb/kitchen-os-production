import { AnalyticsService } from './analyticsService';
import { MenuService, MenuItemService } from './menuService';
import { MenuItem, Menu } from '../models';

export interface MenuRecommendation {
  id: string;
  type: 'promote' | 'reposition' | 'remove' | 'price_adjust' | 'allergen_alternative' | 'seasonal';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionRequired: string;
  data: {
    itemId?: string;
    currentPosition?: number;
    suggestedPosition?: number;
    currentPrice?: number;
    suggestedPrice?: number;
    clickRate?: number;
    viewRate?: number;
    conversionRate?: number;
  };
}

export interface MenuInsights {
  performanceScore: number;
  totalRecommendations: number;
  highPriorityCount: number;
  recommendations: MenuRecommendation[];
  summary: {
    topPerformers: Array<{ itemId: string; name: string; score: number }>;
    underPerformers: Array<{ itemId: string; name: string; score: number }>;
    opportunities: string[];
  };
}

export class RecommendationsService {
  /**
   * Generate comprehensive menu recommendations
   */
  static async generateMenuRecommendations(
    restaurantId: string,
    menuId?: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<MenuInsights> {
    try {
      // Get analytics data
      const analytics = await AnalyticsService.getDashboardMetrics(
        restaurantId,
        dateRange?.startDate,
        dateRange?.endDate
      );

      // Get menu data
      const menus = menuId 
        ? [await MenuService.getMenuById(menuId)].filter(Boolean) as Menu[]
        : await MenuService.getMenusByRestaurant(restaurantId);

      if (!menus.length) {
        return {
          performanceScore: 0,
          totalRecommendations: 0,
          highPriorityCount: 0,
          recommendations: [],
          summary: { topPerformers: [], underPerformers: [], opportunities: [] },
        };
      }

      // Get all menu items
      const allMenuItems: MenuItem[] = [];
      for (const menu of menus) {
        const items = await MenuItemService.getMenuItems(menu.id);
        allMenuItems.push(...items);
      }

      const recommendations: MenuRecommendation[] = [];

      // Analyze item performance
      const itemPerformance = this.analyzeItemPerformance(analytics, allMenuItems);
      
      // Generate recommendations based on performance
      recommendations.push(...this.generatePerformanceRecommendations(itemPerformance));
      
      // Generate pricing recommendations
      recommendations.push(...this.generatePricingRecommendations(itemPerformance));
      
      // Generate positioning recommendations
      recommendations.push(...this.generatePositioningRecommendations(itemPerformance, menus));
      
      // Generate allergen recommendations
      recommendations.push(...this.generateAllergenRecommendations(allMenuItems));
      
      // Generate seasonal recommendations
      recommendations.push(...this.generateSeasonalRecommendations(allMenuItems));

      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore(analytics, allMenuItems);
      
      // Sort recommendations by priority
      const sortedRecommendations = recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;

      // Generate summary
      const summary = this.generateSummary(itemPerformance, recommendations);

      return {
        performanceScore,
        totalRecommendations: recommendations.length,
        highPriorityCount,
        recommendations: sortedRecommendations,
        summary,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Analyze individual item performance
   */
  private static analyzeItemPerformance(analytics: any, menuItems: MenuItem[]) {
    const itemPerformance = new Map();

    // Initialize performance data for all items
    menuItems.forEach(item => {
      itemPerformance.set(item.id, {
        item,
        clicks: 0,
        views: 0,
        clickRate: 0,
        position: item.order,
        price: item.price,
        allergenCount: item.allergens.length,
        dietaryTags: item.dietaryTags,
      });
    });

    // Add analytics data
    analytics.topMenuItems.forEach((itemData: any) => {
      const existing = itemPerformance.get(itemData.itemId);
      if (existing) {
        existing.clicks = itemData.clicks;
        existing.clickRate = analytics.totalViews > 0 ? (itemData.clicks / analytics.totalViews) * 100 : 0;
      }
    });

    return itemPerformance;
  }

  /**
   * Generate performance-based recommendations
   */
  private static generatePerformanceRecommendations(itemPerformance: Map<string, any>): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    const items = Array.from(itemPerformance.values());
    
    // Sort by click rate
    items.sort((a, b) => b.clickRate - a.clickRate);
    
    const topPerformers = items.slice(0, Math.ceil(items.length * 0.2));
    const bottomPerformers = items.slice(-Math.ceil(items.length * 0.2));

    // Recommend promoting top performers
    topPerformers.forEach((itemData, index) => {
      if (itemData.position > 3 && itemData.clickRate > 5) {
        recommendations.push({
          id: `promote_${itemData.item.id}`,
          type: 'promote',
          priority: 'high',
          title: `Promote "${itemData.item.name}"`,
          description: `This item has a high click rate (${itemData.clickRate.toFixed(1)}%) but is positioned low in the menu.`,
          impact: 'Could increase overall menu engagement by 15-25%',
          actionRequired: 'Move to top 3 positions in its category',
          data: {
            itemId: itemData.item.id,
            currentPosition: itemData.position,
            suggestedPosition: Math.min(itemData.position, 3),
            clickRate: itemData.clickRate,
          },
        });
      }
    });

    // Recommend reviewing bottom performers
    bottomPerformers.forEach((itemData) => {
      if (itemData.clickRate < 1 && itemData.clicks < 5) {
        recommendations.push({
          id: `review_${itemData.item.id}`,
          type: 'remove',
          priority: 'medium',
          title: `Review "${itemData.item.name}"`,
          description: `This item has very low engagement (${itemData.clickRate.toFixed(1)}% click rate).`,
          impact: 'Removing could simplify menu and improve focus on popular items',
          actionRequired: 'Consider removing or updating description/pricing',
          data: {
            itemId: itemData.item.id,
            clickRate: itemData.clickRate,
          },
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate pricing recommendations
   */
  private static generatePricingRecommendations(itemPerformance: Map<string, any>): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    const items = Array.from(itemPerformance.values());

    items.forEach((itemData) => {
      // High engagement, potentially underpriced
      if (itemData.clickRate > 8 && itemData.price < 15) {
        const suggestedPrice = itemData.price * 1.1; // 10% increase
        recommendations.push({
          id: `price_increase_${itemData.item.id}`,
          type: 'price_adjust',
          priority: 'medium',
          title: `Consider price increase for "${itemData.item.name}"`,
          description: `High engagement (${itemData.clickRate.toFixed(1)}%) suggests price elasticity.`,
          impact: 'Could increase revenue by 8-12% with minimal impact on demand',
          actionRequired: `Test price increase from $${itemData.price} to $${suggestedPrice.toFixed(2)}`,
          data: {
            itemId: itemData.item.id,
            currentPrice: itemData.price,
            suggestedPrice: suggestedPrice,
            clickRate: itemData.clickRate,
          },
        });
      }

      // Low engagement, potentially overpriced
      if (itemData.clickRate < 2 && itemData.price > 20) {
        const suggestedPrice = itemData.price * 0.9; // 10% decrease
        recommendations.push({
          id: `price_decrease_${itemData.item.id}`,
          type: 'price_adjust',
          priority: 'low',
          title: `Consider price reduction for "${itemData.item.name}"`,
          description: `Low engagement (${itemData.clickRate.toFixed(1)}%) may indicate price sensitivity.`,
          impact: 'Could increase demand and overall category performance',
          actionRequired: `Test price reduction from $${itemData.price} to $${suggestedPrice.toFixed(2)}`,
          data: {
            itemId: itemData.item.id,
            currentPrice: itemData.price,
            suggestedPrice: suggestedPrice,
            clickRate: itemData.clickRate,
          },
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate positioning recommendations
   */
  private static generatePositioningRecommendations(itemPerformance: Map<string, any>, menus: Menu[]): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    
    // Analyze menu structure and suggest improvements
    menus.forEach(menu => {
      if (menu.sections.length > 8) {
        recommendations.push({
          id: `simplify_menu_${menu.id}`,
          type: 'reposition',
          priority: 'medium',
          title: 'Simplify menu structure',
          description: `Menu has ${menu.sections.length} sections, which may overwhelm customers.`,
          impact: 'Reducing sections could improve decision-making and increase orders',
          actionRequired: 'Consider consolidating similar sections or removing underperforming ones',
          data: {},
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate allergen-friendly recommendations
   */
  private static generateAllergenRecommendations(menuItems: MenuItem[]): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    
    const allergenFriendlyCount = menuItems.filter(item => 
      item.dietaryTags.includes('vegan') || 
      item.dietaryTags.includes('gluten-free') || 
      item.dietaryTags.includes('dairy-free')
    ).length;

    const totalItems = menuItems.length;
    const allergenFriendlyPercentage = (allergenFriendlyCount / totalItems) * 100;

    if (allergenFriendlyPercentage < 20) {
      recommendations.push({
        id: 'add_allergen_friendly',
        type: 'allergen_alternative',
        priority: 'medium',
        title: 'Add more allergen-friendly options',
        description: `Only ${allergenFriendlyPercentage.toFixed(1)}% of menu items are allergen-friendly.`,
        impact: 'Could capture 15-20% more customers with dietary restrictions',
        actionRequired: 'Add vegan, gluten-free, or dairy-free alternatives to popular items',
        data: {},
      });
    }

    return recommendations;
  }

  /**
   * Generate seasonal recommendations
   */
  private static generateSeasonalRecommendations(menuItems: MenuItem[]): MenuRecommendation[] {
    const recommendations: MenuRecommendation[] = [];
    const currentMonth = new Date().getMonth();
    
    // Seasonal suggestions based on current time of year
    const seasonalSuggestions = this.getSeasonalSuggestions(currentMonth);
    
    if (seasonalSuggestions.length > 0) {
      recommendations.push({
        id: 'seasonal_items',
        type: 'seasonal',
        priority: 'low',
        title: 'Consider seasonal menu items',
        description: seasonalSuggestions.join(', '),
        impact: 'Seasonal items can increase customer interest and social media engagement',
        actionRequired: 'Add limited-time seasonal offerings to capitalize on current trends',
        data: {},
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall performance score
   */
  private static calculatePerformanceScore(analytics: any, menuItems: MenuItem[]): number {
    if (!analytics.totalViews || !menuItems.length) return 0;

    const engagementRate = (analytics.totalClicks / analytics.totalViews) * 100;
    const conversionRate = analytics.uniqueVisitors > 0 ? (analytics.totalClicks / analytics.uniqueVisitors) * 100 : 0;
    const menuComplexity = Math.max(0, 100 - (menuItems.length * 2)); // Penalty for too many items

    return Math.min(100, Math.round((engagementRate * 0.4) + (conversionRate * 0.4) + (menuComplexity * 0.2)));
  }

  /**
   * Generate insights summary
   */
  private static generateSummary(itemPerformance: Map<string, any>, recommendations: MenuRecommendation[]) {
    const items = Array.from(itemPerformance.values());
    items.sort((a, b) => b.clickRate - a.clickRate);

    const topPerformers = items.slice(0, 5).map(item => ({
      itemId: item.item.id,
      name: item.item.name,
      score: item.clickRate,
    }));

    const underPerformers = items.slice(-5).map(item => ({
      itemId: item.item.id,
      name: item.item.name,
      score: item.clickRate,
    }));

    const opportunities = [
      ...new Set(recommendations.filter(r => r.priority === 'high').map(r => r.impact))
    ].slice(0, 3);

    return { topPerformers, underPerformers, opportunities };
  }

  /**
   * Get seasonal suggestions based on month
   */
  private static getSeasonalSuggestions(month: number): string[] {
    const seasonal = {
      0: ['New Year detox items', 'Comfort food for winter'], // January
      1: ['Valentine\'s Day specials', 'Heart-healthy options'], // February
      2: ['Spring vegetables', 'St. Patrick\'s Day items'], // March
      3: ['Easter brunch items', 'Fresh spring ingredients'], // April
      4: ['Mother\'s Day specials', 'Light spring dishes'], // May
      5: ['Father\'s Day BBQ', 'Summer salads'], // June
      6: ['Independence Day items', 'Grilled summer favorites'], // July
      7: ['Summer harvest specials', 'Cold refreshing dishes'], // August
      8: ['Back-to-school comfort food', 'Autumn flavors'], // September
      9: ['Halloween themed items', 'Pumpkin and apple dishes'], // October
      10: ['Thanksgiving specials', 'Harvest ingredients'], // November
      11: ['Holiday party platters', 'Winter comfort food'], // December
    };

    return seasonal[month as keyof typeof seasonal] || [];
  }
}
