import axios from 'axios';
import CryptoJS from 'crypto-js';
import notification from './Notification';
import { hashing,base } from '@/master/hashing.js';
import debug from '@/plugins/Logger.js';

/**
 * HTTP Request Client with caching, encryption, and notification support
 */
class RequestClient {
  constructor(notification = false) {
    this.showNotification = notification;
    this.baseURL = base;
    //this.baseURL = 'http://localhost:5001/api/';
    this.notificationStack = [];

    // Constants
    this.CACHE_EXPIRATION_TIME = 60 * 1000; // 1 minute
    this.MAX_CACHE_SIZE = 100; // Maximum cache entries
    this.REQUEST_TIMEOUT = 30000; // 30 seconds
    this.MAX_RETRIES = 3;
    this.TOKEN_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
    this.MAX_CONCURRENT_REQUESTS = 10;

    // Create and configure a reusable Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      },
    });

    this.configureAxios();

    this.cache = new Map();
    this.cacheAccessOrder = []; // For LRU cache implementation
    this.tokenCache = new Map(); // Token caching
    this.requestQueue = new Map(); // Request deduplication
    this.activeRequests = 0; // Concurrent request counter

    // Configure axios with interceptors and environment-specific settings
    this.configureAxios();
  }

  /**
   * Check if we're in development mode
   * @returns {boolean} True if in development mode
   */
  isDevelopment() {
    return process.env.NODE_ENV === 'development' || 
           process.env.NODE_ENV === 'dev' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Configure axios instance with environment-specific settings
   */
  configureAxios() {
    // Add request interceptor for logging in development
    if (this.isDevelopment()) {
      this.axiosInstance.interceptors.request.use(
        (config) => {
          debug.log(`RequestClient: ${config.method?.toUpperCase()} ${config.url}`);
          debug.log('RequestClient: Headers:', config.headers);
          return config;
        },
        (error) => {
          debug.error('RequestClient: Request interceptor error:', error);
          return Promise.reject(error);
        }
      );
    }

    // Add response interceptor for consistent error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Enhanced error information for debugging
        if (error.response) {
          debug.error('RequestClient: Response error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            method: error.config?.method
          });
        } else if (error.request) {
          debug.error('RequestClient: Network error:', {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message
          });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate encrypted token for API authentication (no cache, always new)
   * @param {string} key - API key
   * @returns {Object} Token object with encryption details
   */
  token(key) {
    if (!key) {
      throw new Error('API key is required for token generation');
    }
    try {
      const secret = CryptoJS.lib.WordArray.random(128 / 8);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      const hashingArray = CryptoJS.enc.Utf8.parse(hashing);
      const timestamp = Date.now();
      const keyWithTimestamp = { key, timestamp };
      const combinedKey = CryptoJS.lib.WordArray.create()
        .concat(secret)
        .concat(hashingArray);
      const token = CryptoJS.AES.encrypt(JSON.stringify(keyWithTimestamp), combinedKey, {
        iv: iv,
      }).toString();
      const tokenData = { token, secret, iv, timestamp };
      debug.log('Generated new token (no cache)');
      return tokenData;
    } catch (error) {
      debug.error('Token generation failed:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Main connection method with retry logic and improved error handling
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {string} key - API key
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Object>} API response
   */
  async connect(method, endpoint, data, key, retryCount = 0) {
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }
    if (!key) {
      throw new Error('API key is required');
    }

    // Clear expired cache entries periodically
    this.clearExpiredCache();
    this.clearExpiredTokens();

    // Generate request key for deduplication
    const requestKey = this.generateRequestKey(method, endpoint, data);
    
    // Check if the same request is already in progress
    if (this.requestQueue.has(requestKey)) {
      debug.log(`Reusing in-flight request: ${requestKey}`);
      return this.requestQueue.get(requestKey);
    }

    // Wait for available slot if at concurrent limit
    await this.waitForSlot();
    this.activeRequests++;

    // Create the actual request execution
    const requestPromise = this._executeActualRequest(method, endpoint, data, key, retryCount);
    
    // Store in queue for deduplication
    this.requestQueue.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up
      this.activeRequests--;
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Execute the actual HTTP request (private method)
   * @private
   */
  async _executeActualRequest(method, endpoint, data, key, retryCount = 0) {

    // Check if the endpoint contains 'https://' or 'http://'
    const isFullURL = /^(https?:\/\/)/.test(endpoint);

    // If it's a full URL, use it as is; otherwise, combine it with the baseURL
    const url = isFullURL ? endpoint : this.baseURL + endpoint;
    
    let token, secret, iv;
    try {
      ({ token, secret, iv } = this.token(key));
    } catch (error) {
      debug.error('Token generation failed:', error);
      throw new Error('Authentication token generation failed');
    }

    // Use the Axios instance and set specific headers for this request
    const baseHeaders = this.getSafeHeaders();
    const requestHeaders = {
      ...baseHeaders,
      'client-token-key': key,
      'x-content-token': token,
      'x-content-sign': iv.toString(),
      'x-content-key': secret.toString(),
    };

    // Sanitize headers to avoid browser restrictions
    const headers = this.sanitizeHeaders(requestHeaders);

    // Sanitize headers to avoid browser restrictions
    const safeHeaders = this.sanitizeHeaders(headers);

    notification(`${method} Request`, `${endpoint} is Processing...`, 'normal', this.showNotification);

    try {
      // Check if caching is enabled and a cached response is available
      if (method === 'GET' && data && data.cache && this.cache.has(endpoint)) {
        const cachedItem = this.cache.get(endpoint);
        const currentTime = Date.now();

        // Check if the cached item has expired
        if (currentTime - cachedItem.timestamp <= this.CACHE_EXPIRATION_TIME) {
          notification(`${method} Request`, `${endpoint} is Cached`, 'info', this.showNotification);
          this.manageCacheSize(endpoint); // Update access order
          return cachedItem.response;
        } else {
          // If the cached item has expired, remove it from the cache
          this.cache.delete(endpoint);
          const index = this.cacheAccessOrder.indexOf(endpoint);
          if (index > -1) {
            this.cacheAccessOrder.splice(index, 1);
          }
        }
      }

      // Deduplicate requests
      const requestKey = this.generateRequestKey(method, endpoint, data);
      if (this.requestQueue.has(requestKey)) {
        debug.log(`Request to ${endpoint} is already in progress, waiting...`);
        return this.requestQueue.get(requestKey);
      }

      // Limit concurrent requests
      await this.waitForSlot();
      this.activeRequests++;

      // Add request to queue
      const requestPromise = (async () => {
        try {
          let response;
          if (method === 'DELETE') {
            response = await this.axiosInstance.request({
              method,
              url,
              headers: safeHeaders,
            });
          } else {
            response = await this.axiosInstance.request({
              method,
              url,
              headers: safeHeaders,
              data,
            });
          }

          // Cache the successful response if caching is enabled
          if (method === 'GET' && data && data.cache) {
            const cachedItem = {
              response,
              timestamp: Date.now(),
            };
            this.cache.set(endpoint, cachedItem);
            this.manageCacheSize(endpoint);
          }

          notification(`${method} Request`, `${endpoint} is Successful`, 'success', this.showNotification);
          return response;
        } catch (error) {
          const isNetworkError = !error.response;
          const isServerError = error.response && error.response.status >= 500;
          const isTimeout = error.code === 'ECONNABORTED';
          const isAuthExpired = error.response && 
                               error.response.status === 500 && 
                               error.response.data && 
                               (error.response.data.message === "Authenticated expired" || 
                                error.response.data.message === "Authentication expired");
          
          // Handle authentication expired error
          if (isAuthExpired && retryCount < this.MAX_RETRIES) {
            debug.log(`Authentication expired for ${endpoint}, refreshing token and retrying...`);
            
            // Clear the expired token from cache
            const cacheKey = `token_${key}`;
            this.tokenCache.delete(cacheKey);
            debug.log('Expired token cleared from cache');
            
            // Add a small delay before retry
            const retryDelay = Math.min(500 * Math.pow(2, retryCount), 2000); // Shorter delay for auth refresh
            await this.sleep(retryDelay);
            
            // Retry with fresh token
            return this.connect(method, endpoint, data, key, retryCount + 1);
          }
          
          // Retry logic for other specific errors
          if ((isNetworkError || isServerError || isTimeout) && retryCount < this.MAX_RETRIES) {
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
            debug.log(`Retrying request to ${endpoint} in ${retryDelay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
            
            await this.sleep(retryDelay);
            return this.connect(method, endpoint, data, key, retryCount + 1);
          }

          // Enhanced error logging
          const errorDetails = {
            method,
            endpoint,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseMessage: error.response?.data?.message,
            isNetworkError,
            isTimeout,
            isAuthExpired,
            retryCount
          };
          
          debug.error('API request error:', errorDetails);
          notification(`${method} Request`, `${endpoint} is Failed`, 'error', this.showNotification);
          
          // Re-throw with enhanced error information
          const enhancedError = new Error(`API request failed: ${error.message}`);
          enhancedError.originalError = error;
          enhancedError.requestDetails = errorDetails;
          throw enhancedError;
        } finally {
          // Remove request from queue
          this.requestQueue.delete(requestKey);
          this.activeRequests--;
        }
      })();

      // Add to request queue
      this.requestQueue.set(requestKey, requestPromise);
      return requestPromise;
    } catch (error) {
      // Handle unexpected errors
      debug.error('Unexpected error in request flow:', error);
      notification(`${method} Request`, `${endpoint} encountered an error`, 'error', this.showNotification);
      throw new Error(`Request processing error: ${error.message}`);
    }
  }

  /**
   * HTTP GET request
   * @param {string} endpoint - API endpoint
   * @param {string} key - API key
   * @param {boolean} cache - Enable caching for this request
   * @returns {Promise<Object>} API response
   */
  async GET(endpoint, key, cache = false) {
    return this.connect('GET', endpoint, { cache }, key);
  }

  /**
   * HTTP POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {string} key - API key
   * @param {boolean} cache - Enable caching for this request
   * @returns {Promise<Object>} API response
   */
  async POST(endpoint, data, key, cache = false) {
    return this.connect('POST', endpoint, { cache, ...data }, key);
  }

  /**
   * HTTP PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {string} key - API key
   * @returns {Promise<Object>} API response
   */
  async PUT(endpoint, data, key) {
    return this.connect('PUT', endpoint, data, key);
  }

  /**
   * HTTP DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data (optional)
   * @param {string} key - API key
   * @returns {Promise<Object>} API response
   */
  async DELETE(endpoint, data, key) {
    debug.log("Delete", key);
    return this.connect('DELETE', endpoint, null, key);
  }

  /**
   * Generate request key for deduplication
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {string} Unique request key
   */
  generateRequestKey(method, endpoint, data) {
    const dataHash = data ? CryptoJS.MD5(JSON.stringify(data)).toString() : '';
    return `${method}_${endpoint}_${dataHash}`;
  }

  /**
   * Wait for concurrent request limit
   */
  async waitForSlot() {
    while (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      await this.sleep(10); // Wait 10ms before checking again
    }
  }

  /**
   * Clear expired tokens from cache
   */
  clearExpiredTokens() {
    const currentTime = Date.now();
    const expiredKeys = [];

    for (const [key, tokenInfo] of this.tokenCache.entries()) {
      if (currentTime - tokenInfo.timestamp > this.TOKEN_CACHE_TIME) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.tokenCache.delete(key));
    
    if (expiredKeys.length > 0) {
      debug.log(`Token cache: Cleared ${expiredKeys.length} expired tokens`);
    }
  }

  /**
   * Refresh token by clearing expired token from cache
   * @param {string} key - API key
   */
  refreshToken(key) {
    if (!key) {
      throw new Error('API key is required for token refresh');
    }

    const cacheKey = `token_${key}`;
    const hadCachedToken = this.tokenCache.has(cacheKey);
    
    // Clear the token from cache to force regeneration
    this.tokenCache.delete(cacheKey);
    
    debug.log(`Token refreshed for key: ${key.substring(0, 8)}... (had cached: ${hadCachedToken})`);
    
    return hadCachedToken;
  }

  /**
   * Clear all expired or specific tokens
   * @param {string} specificKey - Optional specific key to clear
   */
  clearTokens(specificKey = null) {
    if (specificKey) {
      const cacheKey = `token_${specificKey}`;
      const deleted = this.tokenCache.delete(cacheKey);
      debug.log(`Specific token cleared: ${specificKey.substring(0, 8)}... (existed: ${deleted})`);
      return deleted;
    } else {
      const size = this.tokenCache.size;
      this.tokenCache.clear();
      debug.log(`All tokens cleared: ${size} tokens removed`);
      return size;
    }
  }

  /**
   * Manage cache size using LRU (Least Recently Used) strategy
   * @param {string} endpoint - The endpoint key
   */
  manageCacheSize(endpoint) {
    // Update access order
    const existingIndex = this.cacheAccessOrder.indexOf(endpoint);
    if (existingIndex > -1) {
      this.cacheAccessOrder.splice(existingIndex, 1);
    }
    this.cacheAccessOrder.push(endpoint);

    // Remove oldest entries if cache is full
    while (this.cache.size >= this.MAX_CACHE_SIZE && this.cacheAccessOrder.length > 0) {
      const oldestEndpoint = this.cacheAccessOrder.shift();
      this.cache.delete(oldestEndpoint);
      debug.log(`Cache: Removed old entry for ${oldestEndpoint}`);
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const currentTime = Date.now();
    const expiredEntries = [];

    for (const [endpoint, cachedItem] of this.cache.entries()) {
      if (currentTime - cachedItem.timestamp > this.CACHE_EXPIRATION_TIME) {
        expiredEntries.push(endpoint);
      }
    }

    expiredEntries.forEach(endpoint => {
      this.cache.delete(endpoint);
      const index = this.cacheAccessOrder.indexOf(endpoint);
      if (index > -1) {
        this.cacheAccessOrder.splice(index, 1);
      }
    });

    if (expiredEntries.length > 0) {
      debug.log(`Cache: Cleared ${expiredEntries.length} expired entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  clearCache() {
    this.cache.clear();
    this.cacheAccessOrder = [];
    debug.log('Cache: All entries cleared');
  }

  /**
   * Clear all caches (both response and token cache)
   */
  clearAllCaches() {
    this.clearCache();
    this.tokenCache.clear();
    debug.log('All caches cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      expirationTime: this.CACHE_EXPIRATION_TIME,
      accessOrder: [...this.cacheAccessOrder]
    };
  }

  /**
   * Get comprehensive performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return {
      cache: this.getCacheStats(),
      tokenCache: {
        size: this.tokenCache.size,
        expirationTime: this.TOKEN_CACHE_TIME
      },
      activeRequests: this.activeRequests,
      maxConcurrentRequests: this.MAX_CONCURRENT_REQUESTS,
      queuedRequests: this.requestQueue.size
    };
  }

  /**
   * Get detailed diagnostics for troubleshooting
   * @returns {Object} Comprehensive diagnostics
   */
  getDiagnostics() {
    return {
      configuration: {
        baseURL: this.baseURL,
        timeout: this.REQUEST_TIMEOUT,
        maxRetries: this.MAX_RETRIES,
        maxConcurrentRequests: this.MAX_CONCURRENT_REQUESTS,
        isDevelopment: this.isDevelopment()
      },
      performance: this.getPerformanceStats(),
      network: {
        activeRequests: this.activeRequests,
        queuedRequests: this.requestQueue.size,
        queueKeys: Array.from(this.requestQueue.keys())
      },
      timestamps: {
        lastCacheCleanup: Date.now(), // You could track this if needed
        currentTime: Date.now()
      }
    };
  }

  /**
   * Reset all internal state (useful for testing or debugging)
   */
  reset() {
    this.clearAllCaches();
    this.requestQueue.clear();
    this.activeRequests = 0;
    debug.log('RequestClient: All state reset');
  }

  /**
   * Test the request client with a simple health check
   * @returns {Promise<boolean>} True if successful
   */
  async healthCheck() {
    try {
      // Simple test to verify the client is working
      const testEndpoint = 'health';
      const testKey = 'test';
      
      // This would fail gracefully if the endpoint doesn't exist
      await this.GET(testEndpoint, testKey);
      return true;
    } catch (error) {
      debug.warn('RequestClient health check failed:', error.message);
      return false;
    }
  }

  /**
   * Batch multiple requests
   * @param {Array} requests - Array of request objects {method, endpoint, data, key, cache}
   * @returns {Promise<Array>} Array of responses
   */
  async batch(requests) {
    if (!Array.isArray(requests)) {
      throw new Error('Requests must be an array');
    }

    const promises = requests.map(req => {
      const { method, endpoint, data = {}, key, cache = false } = req;
      
      switch (method.toUpperCase()) {
        case 'GET':
          return this.GET(endpoint, key, cache);
        case 'POST':
          return this.POST(endpoint, data, key, cache);
        case 'PUT':
          return this.PUT(endpoint, data, key);
        case 'DELETE':
          return this.DELETE(endpoint, data, key);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });

    return Promise.allSettled(promises);
  }

  /**
   * Sleep function for retry delays
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate and sanitize headers to avoid browser restrictions
   * @param {Object} headers - Headers object
   * @returns {Object} Sanitized headers
   */
  sanitizeHeaders(headers) {
    // List of headers that browsers control and should not be set manually
    const restrictedHeaders = [
      'accept-encoding',
      'access-control-request-headers',
      'access-control-request-method',
      'connection',
      'content-length',
      'cookie',
      'cookie2',
      'date',
      'dnt',
      'expect',
      'host',
      'keep-alive',
      'origin',
      'referer',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
      'via',
      'proxy-connection'
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      
      // Skip restricted headers and headers starting with 'sec-'
      const isRestricted = restrictedHeaders.includes(lowerKey) || 
                          lowerKey.startsWith('sec-') ||
                          lowerKey === 'x-http-method-override';
      
      if (isRestricted) {
        debug.warn(`RequestClient: Skipping restricted header: ${key}`);
        continue;
      }
      
      // Validate header value
      if (value !== null && value !== undefined) {
        sanitized[key] = String(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Get safe default headers for requests
   * @returns {Object} Safe headers object
   */
  getSafeHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
}

debug.log("Client Request :: V0.001 {axios}");
export default RequestClient;
