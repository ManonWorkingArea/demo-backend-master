import debug from '@/plugins/Logger.js';

/**
 * CacheManager - Handles caching, TTL, and cache cleanup
 * 
 * Features:
 * - TTL-based caching with automatic cleanup
 * - LRU cache eviction strategy
 * - Cache statistics and monitoring
 * - Performance optimization
 */
export class CacheManager {
  constructor(config = {}) {
    // Cache configuration
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      maxCacheSize: config.maxCacheSize || 1000,
      cleanupInterval: config.cleanupInterval || 10 * 60 * 1000, // 10 minutes
      ...config
    };
    
    this.cache = new Map();
    this.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0
    };
    
    // Start automatic cleanup
    this.startCleanup();
    
    if (this.enableLogging) {
      debug.log('CacheManager: Initialized', this.config);
    }
  }

  /**
   * Generate cache key for request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {string} collection - Collection name
   * @param {Object} body - Request body
   * @returns {string} Cache key
   */
  generateCacheKey(endpoint, method, collection, body) {
    const key = `${method}:${collection || ''}:${endpoint}:${JSON.stringify(body || {})}`;
    
    try {
      return btoa(encodeURIComponent(key)).replace(/[^a-zA-Z0-9]/g, '');
    } catch (error) {
      console.warn('Cache key generation failed, using fallback hash:', error);
      return this.simpleHash(key);
    }
  }

  /**
   * Simple hash function as fallback for cache key generation
   * @param {string} str - String to hash
   * @returns {string} Hash string
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request is cacheable
   * @param {string} method - HTTP method
   * @returns {boolean} True if cacheable
   */
  isCacheable(method) {
    return ['GET'].includes(method.toUpperCase());
  }

  /**
   * Get cached response if available and valid
   * @param {string} cacheKey - Cache key
   * @returns {*} Cached data or null
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      this.stats.hits++;
      
      if (this.enableLogging) {
        debug.log('CacheManager: Cache hit for key:', cacheKey);
      }
      
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
      this.stats.deletes++;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Cache response with TTL
   * @param {string} cacheKey - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(cacheKey, data, ttl = null) {
    const finalTTL = ttl || this.config.defaultTTL;
    
    // Prevent cache overflow
    if (this.cache.size >= this.config.maxCacheSize) {
      this.cleanupOldest();
    }
    
    this.cache.set(cacheKey, {
      data: data,
      expiresAt: Date.now() + finalTTL,
      createdAt: Date.now()
    });
    
    this.stats.sets++;
    
    if (this.enableLogging) {
      debug.log('CacheManager: Cached data for key:', cacheKey, 'TTL:', finalTTL);
    }
  }

  /**
   * Delete cached item
   * @param {string} cacheKey - Cache key
   * @returns {boolean} True if deleted
   */
  delete(cacheKey) {
    const deleted = this.cache.delete(cacheKey);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clean up oldest cache entries
   */
  cleanupOldest() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.deletes++;
    }
    
    if (this.enableLogging) {
      debug.log('CacheManager: Cleaned up oldest entries:', toRemove);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.deletes += cleanedCount;
      this.stats.cleanups++;
      
      if (this.enableLogging) {
        debug.log('CacheManager: Cleaned up expired entries:', cleanedCount);
      }
    }
  }

  /**
   * Start automatic cache cleanup
   */
  startCleanup() {
    setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupInterval);
  }

  /**
   * Clear cache for specific pattern or all cache
   * @param {string} pattern - Pattern to match (optional)
   */
  clear(pattern = null) {
    if (pattern) {
      let clearCount = 0;
      for (const [key] of this.cache.entries()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          clearCount++;
        }
      }
      this.stats.deletes += clearCount;
      
      if (this.enableLogging) {
        debug.log('CacheManager: Cleared entries matching pattern:', pattern, 'Count:', clearCount);
      }
    } else {
      const size = this.cache.size;
      this.cache.clear();
      this.stats.deletes += size;
      
      if (this.enableLogging) {
        debug.log('CacheManager: Cleared all cache entries:', size);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      config: { ...this.config }
    };
  }

  /**
   * Get cache entries for debugging
   * @returns {Array} Cache entries
   */
  getEntries() {
    return Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      expiresAt: new Date(value.expiresAt),
      createdAt: new Date(value.createdAt),
      timeLeft: Math.max(0, value.expiresAt - Date.now()),
      hasExpired: Date.now() >= value.expiresAt
    }));
  }

  /**
   * Enable or disable logging
   * @param {boolean} enable - Enable logging
   */
  setLogging(enable) {
    this.enableLogging = enable;
  }

  /**
   * Destroy cache manager
   */
  destroy() {
    this.clear();
    
    if (this.enableLogging) {
      debug.log('CacheManager: Destroyed');
    }
  }
}

export default CacheManager;
