import debug from '@/plugins/Logger.js';

/**
 * RetryManager - Handles retry logic with exponential backoff
 * 
 * Features:
 * - Configurable retry attempts
 * - Exponential backoff with jitter
 * - Selective retry based on error types
 * - Retry statistics
 */
export class RetryManager {
  constructor(config = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      backoffMultiplier: config.backoffMultiplier || 2,
      maxRetryDelay: config.maxRetryDelay || 30000,
      jitterEnabled: config.jitterEnabled !== undefined ? config.jitterEnabled : true,
      retryableStatusCodes: config.retryableStatusCodes || [408, 429, 500, 502, 503, 504],
      retryableErrors: config.retryableErrors || ['timeout', 'network', 'ECONNABORTED', 'ENOTFOUND'],
      ...config
    };
    
    this.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;
    
    // Statistics
    this.stats = {
      totalAttempts: 0,
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      retriesByStatusCode: {},
      retriesByError: {}
    };
    
    if (this.enableLogging) {
      debug.log('RetryManager: Initialized', this.config);
    }
  }

  /**
   * Sleep function for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} Sleep promise
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate retry delay with exponential backoff and optional jitter
   * @param {number} retryCount - Current retry attempt number
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(retryCount) {
    let delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, retryCount);
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxRetryDelay);
    
    // Add jitter to prevent thundering herd
    if (this.config.jitterEnabled) {
      const jitter = Math.random() * 0.1 * delay; // 10% jitter
      delay += jitter;
    }
    
    return Math.floor(delay);
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error object
   * @returns {boolean} True if retryable
   */
  isRetryableError(error) {
    // Check status codes
    const statusCode = this.extractStatusCode(error);
    if (statusCode && this.config.retryableStatusCodes.includes(statusCode)) {
      return true;
    }
    
    // Check error messages
    const errorMessage = error.message.toLowerCase();
    return this.config.retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  /**
   * Extract status code from error
   * @param {Error} error - Error object
   * @returns {number|null} Status code or null
   */
  extractStatusCode(error) {
    // Try different ways to extract status code
    if (error.status) return error.status;
    if (error.response && error.response.status) return error.response.status;
    
    // Parse from error message
    const statusMatch = error.message.match(/status:?\s*(\d+)/i);
    return statusMatch ? parseInt(statusMatch[1]) : null;
  }

  /**
   * Execute function with retry logic
   * @param {Function} requestFn - Function to execute
   * @param {Object} options - Retry options
   * @returns {Promise<*>} Result of successful execution
   */
  async executeWithRetry(requestFn, options = {}) {
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : this.config.maxRetries;
    const enableRetries = options.enableRetries !== undefined ? options.enableRetries : true;
    
    if (!enableRetries) {
      this.stats.totalAttempts++;
      return await requestFn();
    }
    
    let lastError;
    
    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
      try {
        this.stats.totalAttempts++;
        
        if (retryCount > 0) {
          this.stats.totalRetries++;
        }
        
        const result = await requestFn();
        
        if (retryCount > 0) {
          this.stats.successfulRetries++;
          
          if (this.enableLogging) {
            debug.log('RetryManager: Request succeeded after retries:', {
              retryCount,
              totalAttempts: this.stats.totalAttempts
            });
          }
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry if this is the last attempt
        if (retryCount >= maxRetries) {
          this.stats.failedRetries++;
          this.updateErrorStats(error);
          break;
        }
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          if (this.enableLogging) {
            debug.log('RetryManager: Error not retryable:', error.message);
          }
          break;
        }
        
        // Calculate delay and wait
        const delay = this.calculateDelay(retryCount);
        
        if (this.enableLogging) {
          debug.log('RetryManager: Retrying request', {
            retryCount: retryCount + 1,
            maxRetries,
            delay,
            error: error.message
          });
        }
        
        this.updateErrorStats(error);
        await this.sleep(delay);
      }
    }
    
    // All retries exhausted
    if (this.enableLogging) {
      debug.error('RetryManager: All retries exhausted:', {
        maxRetries,
        error: lastError.message
      });
    }
    
    throw lastError;
  }

  /**
   * Update error statistics
   * @param {Error} error - Error object
   */
  updateErrorStats(error) {
    const statusCode = this.extractStatusCode(error);
    if (statusCode) {
      this.stats.retriesByStatusCode[statusCode] = (this.stats.retriesByStatusCode[statusCode] || 0) + 1;
    }
    
    const errorType = this.categorizeError(error);
    this.stats.retriesByError[errorType] = (this.stats.retriesByError[errorType] || 0) + 1;
  }

  /**
   * Categorize error type
   * @param {Error} error - Error object
   * @returns {string} Error category
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('econnaborted')) return 'connection_aborted';
    if (message.includes('enotfound')) return 'dns_error';
    
    const statusCode = this.extractStatusCode(error);
    if (statusCode >= 500) return 'server_error';
    if (statusCode >= 400) return 'client_error';
    
    return 'unknown';
  }

  /**
   * Get retry statistics
   * @returns {Object} Retry statistics
   */
  getStats() {
    const successRate = this.stats.totalAttempts > 0 
      ? ((this.stats.totalAttempts - this.stats.failedRetries) / this.stats.totalAttempts * 100).toFixed(2)
      : 100;
    
    const retryRate = this.stats.totalAttempts > 0 
      ? (this.stats.totalRetries / this.stats.totalAttempts * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      successRate: `${successRate}%`,
      retryRate: `${retryRate}%`,
      config: { ...this.config }
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalAttempts: 0,
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      retriesByStatusCode: {},
      retriesByError: {}
    };
    
    if (this.enableLogging) {
      debug.log('RetryManager: Statistics reset');
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
   * Destroy retry manager
   */
  destroy() {
    this.resetStats();
    
    if (this.enableLogging) {
      debug.log('RetryManager: Destroyed');
    }
  }
}

export default RetryManager;
