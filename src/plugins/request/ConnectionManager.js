import debug from '@/plugins/Logger.js';

/**
 * ConnectionManager - Handles connection pooling and request deduplication
 * 
 * Features:
 * - Connection pool management
 * - Request deduplication
 * - Concurrent request limiting
 * - Queue management
 */
export class ConnectionManager {
  constructor(config = {}) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      ...config
    };
    
    // Connection pool simulation
    this.connectionPool = {
      maxConnections: this.config.maxConnections,
      activeConnections: 0,
      queue: []
    };
    
    // Request deduplication
    this.pendingRequests = new Map();
    
    this.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;
    
    if (this.enableLogging) {
      debug.log('ConnectionManager: Initialized', this.config);
    }
  }

  /**
   * Acquire connection from pool
   * @returns {Promise<void>} Resolves when connection is available
   */
  async acquireConnection() {
    return new Promise((resolve) => {
      if (this.connectionPool.activeConnections < this.connectionPool.maxConnections) {
        this.connectionPool.activeConnections++;
        
        if (this.enableLogging) {
          debug.log('ConnectionManager: Connection acquired', {
            active: this.connectionPool.activeConnections,
            max: this.connectionPool.maxConnections
          });
        }
        
        resolve();
      } else {
        this.connectionPool.queue.push(resolve);
        
        if (this.enableLogging) {
          debug.log('ConnectionManager: Connection queued', {
            queueLength: this.connectionPool.queue.length
          });
        }
      }
    });
  }

  /**
   * Release connection back to pool
   */
  releaseConnection() {
    this.connectionPool.activeConnections--;
    
    if (this.connectionPool.queue.length > 0) {
      const nextResolve = this.connectionPool.queue.shift();
      this.connectionPool.activeConnections++;
      nextResolve();
      
      if (this.enableLogging) {
        debug.log('ConnectionManager: Connection released and reassigned', {
          active: this.connectionPool.activeConnections,
          queueLength: this.connectionPool.queue.length
        });
      }
    } else {
      if (this.enableLogging) {
        debug.log('ConnectionManager: Connection released', {
          active: this.connectionPool.activeConnections
        });
      }
    }
  }

  /**
   * Generate request key for deduplication
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {string} collection - Collection name
   * @param {Object} body - Request body
   * @returns {string} Request key
   */
  generateRequestKey(endpoint, method, collection, body) {
    return `${method}:${collection || ''}:${endpoint}:${JSON.stringify(body || {})}`;
  }

  /**
   * Request deduplication - prevent duplicate requests
   * @param {string} requestKey - Unique request key
   * @param {Function} requestFn - Function that executes the request
   * @returns {Promise<*>} Request result
   */
  async deduplicateRequest(requestKey, requestFn) {
    if (this.pendingRequests.has(requestKey)) {
      if (this.enableLogging) {
        debug.log('ConnectionManager: Request deduplicated:', requestKey);
      }
      
      return await this.pendingRequests.get(requestKey);
    }
    
    const promise = requestFn();
    this.pendingRequests.set(requestKey, promise);
    
    try {
      const result = await promise;
      this.pendingRequests.delete(requestKey);
      
      if (this.enableLogging) {
        debug.log('ConnectionManager: Request completed:', requestKey);
      }
      
      return result;
    } catch (error) {
      this.pendingRequests.delete(requestKey);
      
      if (this.enableLogging) {
        debug.error('ConnectionManager: Request failed:', requestKey, error.message);
      }
      
      throw error;
    }
  }

  /**
   * Get connection pool statistics
   * @returns {Object} Connection statistics
   */
  getStats() {
    return {
      activeConnections: this.connectionPool.activeConnections,
      maxConnections: this.connectionPool.maxConnections,
      queuedConnections: this.connectionPool.queue.length,
      pendingRequests: this.pendingRequests.size,
      utilizationRate: `${((this.connectionPool.activeConnections / this.connectionPool.maxConnections) * 100).toFixed(2)}%`
    };
  }

  /**
   * Get pending request keys for debugging
   * @returns {Array<string>} Array of pending request keys
   */
  getPendingRequestKeys() {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * Check if connection pool is at capacity
   * @returns {boolean} True if at capacity
   */
  isAtCapacity() {
    return this.connectionPool.activeConnections >= this.connectionPool.maxConnections;
  }

  /**
   * Get queue length
   * @returns {number} Number of queued connection requests
   */
  getQueueLength() {
    return this.connectionPool.queue.length;
  }

  /**
   * Clear all pending requests (use with caution)
   */
  clearPendingRequests() {
    const count = this.pendingRequests.size;
    this.pendingRequests.clear();
    
    if (this.enableLogging) {
      debug.log('ConnectionManager: Cleared pending requests:', count);
    }
  }

  /**
   * Force clear connection queue (use with caution)
   */
  clearQueue() {
    const count = this.connectionPool.queue.length;
    
    // Resolve all queued promises to prevent hanging
    this.connectionPool.queue.forEach(resolve => resolve());
    this.connectionPool.queue = [];
    
    if (this.enableLogging) {
      debug.log('ConnectionManager: Cleared connection queue:', count);
    }
  }

  /**
   * Enable or disable logging
   * @param {boolean} enable - Enable logging
   */
  setLogging(enable) {
    this.enableLogging = enable;
  }

  /**
   * Destroy connection manager
   */
  destroy() {
    this.clearPendingRequests();
    this.clearQueue();
    this.connectionPool.activeConnections = 0;
    
    if (this.enableLogging) {
      debug.log('ConnectionManager: Destroyed');
    }
  }
}

export default ConnectionManager;
