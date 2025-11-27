import debug from '@/plugins/Logger.js';

/**
 * PerformanceMonitor - Handles performance monitoring and statistics
 * 
 * Features:
 * - Request timing and performance metrics
 * - Response time analysis
 * - Throughput monitoring
 * - Performance statistics
 */
export class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      sampleSize: config.sampleSize || 100, // Keep last 100 measurements
      ...config
    };
    
    this.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;
    
    // Performance statistics
    this.stats = {
      totalRequests: 0,
      errors: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [], // Keep sample of response times for analysis
      requestsPerSecond: 0,
      lastRequestTime: null,
      startTime: Date.now()
    };
    
    // Performance tracking
    this.activeRequests = new Map(); // Track ongoing requests
    this.recentRequests = []; // Track recent request timestamps for throughput calculation
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Initialized', this.config);
    }
  }

  /**
   * Start timing a request
   * @param {string} requestId - Unique request identifier
   * @returns {string} Request ID for tracking
   */
  startRequest(requestId = null) {
    const id = requestId || this.generateRequestId();
    const startTime = Date.now();
    
    this.activeRequests.set(id, {
      startTime,
      requestId: id
    });
    
    this.stats.totalRequests++;
    this.stats.lastRequestTime = startTime;
    
    // Track recent requests for throughput calculation
    this.recentRequests.push(startTime);
    this.cleanupOldRequests();
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Request started:', id);
    }
    
    return id;
  }

  /**
   * End timing a request
   * @param {string} requestId - Request identifier
   * @param {boolean} isError - Whether the request resulted in an error
   * @returns {number} Response time in milliseconds
   */
  endRequest(requestId, isError = false) {
    const requestData = this.activeRequests.get(requestId);
    if (!requestData) {
      console.warn('PerformanceMonitor: Request ID not found:', requestId);
      return 0;
    }
    
    const endTime = Date.now();
    const responseTime = endTime - requestData.startTime;
    
    // Remove from active requests
    this.activeRequests.delete(requestId);
    
    // Update statistics
    this.updateResponseTimeStats(responseTime);
    
    if (isError) {
      this.stats.errors++;
    }
    
    // Update throughput calculation
    this.updateThroughput();
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Request completed:', {
        requestId,
        responseTime,
        isError,
        averageResponseTime: this.stats.averageResponseTime
      });
    }
    
    return responseTime;
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update response time statistics
   * @param {number} responseTime - Response time in milliseconds
   */
  updateResponseTimeStats(responseTime) {
    // Update min/max
    this.stats.minResponseTime = Math.min(this.stats.minResponseTime, responseTime);
    this.stats.maxResponseTime = Math.max(this.stats.maxResponseTime, responseTime);
    
    // Update average (running average)
    const totalCompletedRequests = this.stats.totalRequests - this.activeRequests.size;
    if (totalCompletedRequests === 1) {
      this.stats.averageResponseTime = responseTime;
    } else {
      this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
    }
    
    // Keep sample of response times
    this.stats.responseTimes.push(responseTime);
    if (this.stats.responseTimes.length > this.config.sampleSize) {
      this.stats.responseTimes.shift();
    }
  }

  /**
   * Update throughput calculation
   */
  updateThroughput() {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Count requests in the last second
    const recentRequestCount = this.recentRequests.filter(time => time > oneSecondAgo).length;
    this.stats.requestsPerSecond = recentRequestCount;
  }

  /**
   * Clean up old request timestamps (older than 1 second)
   */
  cleanupOldRequests() {
    const oneSecondAgo = Date.now() - 1000;
    this.recentRequests = this.recentRequests.filter(time => time > oneSecondAgo);
  }

  /**
   * Get performance percentiles
   * @returns {Object} Performance percentiles
   */
  getPercentiles() {
    if (this.stats.responseTimes.length === 0) {
      return {
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0
      };
    }
    
    const sorted = [...this.stats.responseTimes].sort((a, b) => a - b);
    
    return {
      p50: this.getPercentile(sorted, 50),
      p90: this.getPercentile(sorted, 90),
      p95: this.getPercentile(sorted, 95),
      p99: this.getPercentile(sorted, 99)
    };
  }

  /**
   * Calculate specific percentile
   * @param {Array<number>} sortedArray - Sorted array of response times
   * @param {number} percentile - Percentile to calculate (0-100)
   * @returns {number} Percentile value
   */
  getPercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Get comprehensive performance statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const errorRate = this.stats.totalRequests > 0 
      ? (this.stats.errors / this.stats.totalRequests * 100).toFixed(2)
      : 0;
    
    const percentiles = this.getPercentiles();
    
    return {
      requests: {
        total: this.stats.totalRequests,
        active: this.activeRequests.size,
        errors: this.stats.errors,
        errorRate: `${errorRate}%`,
        requestsPerSecond: this.stats.requestsPerSecond
      },
      responseTimes: {
        average: Math.round(this.stats.averageResponseTime),
        min: this.stats.minResponseTime === Infinity ? 0 : this.stats.minResponseTime,
        max: this.stats.maxResponseTime,
        ...percentiles
      },
      uptime: {
        milliseconds: uptime,
        seconds: Math.round(uptime / 1000),
        minutes: Math.round(uptime / 60000),
        formatted: this.formatUptime(uptime)
      },
      sampleSize: this.stats.responseTimes.length,
      lastRequestTime: this.stats.lastRequestTime ? new Date(this.stats.lastRequestTime) : null
    };
  }

  /**
   * Format uptime duration
   * @param {number} uptimeMs - Uptime in milliseconds
   * @returns {string} Formatted uptime
   */
  formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000) % 60;
    const minutes = Math.floor(uptimeMs / 60000) % 60;
    const hours = Math.floor(uptimeMs / 3600000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get active requests information
   * @returns {Array} Active requests
   */
  getActiveRequests() {
    return Array.from(this.activeRequests.values()).map(request => ({
      requestId: request.requestId,
      startTime: new Date(request.startTime),
      duration: Date.now() - request.startTime
    }));
  }

  /**
   * Record error without timing (for external error tracking)
   * @param {Error} error - Error object
   */
  recordError(error) {
    this.stats.errors++;
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Error recorded:', error.message);
    }
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      errors: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      requestsPerSecond: 0,
      lastRequestTime: null,
      startTime: Date.now()
    };
    
    this.activeRequests.clear();
    this.recentRequests = [];
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Statistics reset');
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
   * Destroy performance monitor
   */
  destroy() {
    this.resetStats();
    
    if (this.enableLogging) {
      debug.log('PerformanceMonitor: Destroyed');
    }
  }
}

export default PerformanceMonitor;
