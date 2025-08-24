/**
 * Client-side caching service for improved performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  maxSize?: number; // Maximum cache size
}

export class CacheService {
  private static cache = new Map<string, CacheItem<any>>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes
  private static maxSize = 100;

  /**
   * Set an item in cache
   */
  static set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const maxSize = options.maxSize || this.maxSize;

    // Clean up expired items if cache is getting full
    if (this.cache.size >= maxSize) {
      this.cleanup();
    }

    // If still at max size, remove oldest item
    if (this.cache.size >= maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get an item from cache
   */
  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if an item exists and is valid in cache
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove an item from cache
   */
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired items
   */
  static cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      } else {
        validItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      hitRate: validItems / (validItems + expiredItems) || 0,
    };
  }

  /**
   * Cached fetch wrapper
   */
  static async cachedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    this.set(key, data, options);
    
    return data;
  }

  /**
   * Generate cache key for analytics
   */
  static generateAnalyticsKey(restaurantId: string, startDate?: Date, endDate?: Date): string {
    const start = startDate?.toISOString().split('T')[0] || 'all';
    const end = endDate?.toISOString().split('T')[0] || 'all';
    return `analytics:${restaurantId}:${start}:${end}`;
  }

  /**
   * Generate cache key for menu data
   */
  static generateMenuKey(restaurantId: string, menuId?: string): string {
    return `menu:${restaurantId}:${menuId || 'all'}`;
  }

  /**
   * Generate cache key for QR codes
   */
  static generateQRKey(restaurantId: string): string {
    return `qr:${restaurantId}`;
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  /**
   * Generate optimized image URL with Next.js Image Optimization
   */
  static optimizeImageUrl(
    src: string,
    width: number,
    height?: number,
    quality: number = 75
  ): string {
    if (!src) return '';

    // If it's already a data URL or external URL, return as-is
    if (src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }

    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });

    if (height) {
      params.set('h', height.toString());
    }

    return `/_next/image?${params.toString()}`;
  }

  /**
   * Generate responsive image srcSet
   */
  static generateSrcSet(src: string, sizes: number[], quality: number = 75): string {
    if (!src) return '';

    return sizes
      .map(size => `${this.optimizeImageUrl(src, size, undefined, quality)} ${size}w`)
      .join(', ');
  }

  /**
   * Preload critical images
   */
  static preloadImage(src: string, priority: 'high' | 'low' = 'low'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }

    document.head.appendChild(link);
  }
}

/**
 * Lazy loading utilities
 */
export class LazyLoader {
  private static observer: IntersectionObserver | null = null;
  private static callbacks = new Map<Element, () => void>();

  /**
   * Initialize intersection observer
   */
  private static initObserver(): void {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before element comes into view
        threshold: 0.1,
      }
    );
  }

  /**
   * Observe an element for lazy loading
   */
  static observe(element: Element, callback: () => void): void {
    this.initObserver();
    
    if (!this.observer) return;

    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  /**
   * Stop observing an element
   */
  static unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.callbacks.delete(element);
  }

  /**
   * Cleanup observer
   */
  static cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static metrics = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTiming(key: string): void {
    this.metrics.set(key, performance.now());
  }

  /**
   * End timing and get duration
   */
  static endTiming(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.metrics.delete(key);
    return duration;
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    this.startTiming(key);
    const result = await fn();
    const duration = this.endTiming(key);
    
    return { result, duration };
  }

  /**
   * Get Core Web Vitals
   */
  static getCoreWebVitals(): Promise<{
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fcp = entries[0]?.startTime;
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.lcp = entries[entries.length - 1]?.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay - fixed to use correct property
      new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        if (entries[0]) {
          vitals.fid = entries[0].processingStart - entries[0].startTime;
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      // Return after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 2000);
    });
  }

  /**
   * Report performance metrics
   */
  static reportMetrics(metrics: Record<string, number>): void {
    // In production, this would send to analytics service
    console.log('Performance Metrics:', metrics);
  }
}
