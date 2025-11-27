import debug from '@/plugins/Logger.js';
import { TokenManager, TenantManager, ConnectionManager, RetryManager, PerformanceMonitor } from '@/plugins/request/index.js';

/**
 * ApiRequest - Centralized API Request Handler with Modular Architecture
 */

class ApiRequest {
  constructor(hostkey, baseURL = 'https://api-gateway.manonsanoi.workers.dev') {
    this.hostkey = hostkey;
    this.baseURL = baseURL;
    
    this.tokenManager = new TokenManager();
    this.tenantManager = new TenantManager(this.tokenManager);
    this.connectionManager = new ConnectionManager({ enableLogging: true });
    this.retryManager = new RetryManager({ enableLogging: true });
    this.performanceMonitor = new PerformanceMonitor({ enableLogging: true });
    
    this.authSecret = null;
    this.defaultTTL = 15;
    this.enableLogging = true;
    
    this.tenantConfig = {
      authSecret: 'hu5udwGdvJfMlDvOoXwU8CYc12YBXgQX',
      baseURL: 'https://api-gateway.manonsanoi.workers.dev'
    };
    
    if (!hostkey && !this.authSecret) {
      this.applyHardcodedConfig();
    }
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Initialized with modular architecture', {
        baseURL: this.baseURL,
        hostkey: this.hostkey ? this.hostkey.substring(0, 8) + '...' : 'none',
        defaultTTL: this.defaultTTL
      });
    }
  }

  setAuthSecret(authSecret) {
    this.authSecret = authSecret;
    this.tokenManager.setAuthSecret(authSecret);
    
    if (this.enableLogging) {
      debug.log('ApiRequest: AUTH_SECRET updated');
    }
  }

  setHostname(hostname) {
    this.tenantManager.setHostname(hostname);
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Hostname updated:', hostname);
    }
  }

  async generateEncryptedToken(baseToken, ttlSeconds = null) {
    const ttl = ttlSeconds || this.defaultTTL;
    return await this.tokenManager.generateEncryptedToken(baseToken, ttl);
  }

  useTokenDirectly(token) {
    return this.tokenManager.useTokenDirectly(token);
  }

  startTokenCountdown() {
    return this.tokenManager.startTokenCountdown();
  }

  async testToken() {
    if (!this.tokenManager.isTokenValid()) {
      throw new Error('No token to test');
    }
    
    try {
      const response = await this.apiCall('/api/test', 'GET');
      return response && response.ok !== false;
    } catch (error) {
      if (this.enableLogging) {
        debug.error('ApiRequest: Token test failed:', error);
      }
      return false;
    }
  }

  getTokenStatus() {
    return this.tokenManager.getTokenStatus();
  }

  clearToken() {
    return this.tokenManager.clearToken();
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    };

    const currentToken = this.tokenManager.getCurrentToken();
    if (currentToken) {
      headers['X-API-Key'] = currentToken;
    } else if (this.hostkey) {
      headers['X-API-Key'] = this.hostkey;
    }

    const hostname = this.tenantManager.getHostname();
    if (hostname) {
      headers['X-Hostname-Ref'] = hostname;
    }

    return headers;
  }

  async apiCall(endpoint, methodOrOptions = {}, collection = null, body = null) {
    const requestId = this.performanceMonitor.startRequest();
    
    let options = {};
    
    if (typeof methodOrOptions === 'string') {
      options = {
        method: methodOrOptions,
        collection: collection,
        body: body,
        headers: {},
        timeout: 30000,
        retries: true
      };
    } else {
      options = {
        method: 'GET',
        body: null,
        collection: null,
        headers: {},
        timeout: 30000,
        retries: true,
        ...methodOrOptions
      };
    }

    const {
      method,
      body: requestBody,
      collection: targetCollection,
      headers,
      timeout,
      retries: enableRetries
    } = options;

    const requestKey = this.connectionManager.generateRequestKey(endpoint, method, targetCollection, requestBody);

    try {
      const result = await this.connectionManager.deduplicateRequest(requestKey, async () => {
        await this.connectionManager.acquireConnection();
        
        try {
          const requestFn = async () => {
            let url;
            if (targetCollection) {
              const baseUrl = this.baseURL.replace('/subscription', '');
              url = `${baseUrl}/${targetCollection}${endpoint}?key=DU1eYMDG7j8yb199YDPg4`;
            } else {
              if (endpoint.startsWith('http')) {
                url = endpoint;
              } else {
                const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
                url = `${this.baseURL}/${cleanEndpoint}?key=DU1eYMDG7j8yb199YDPg4`;
              }
            }

            const requestOptions = {
              method,
              headers: {
                ...this.getHeaders(),
                ...headers
              }
            };

            if (requestBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              requestOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
            }

            console.log(`API Call: ${method} ${url}`);
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
            });

            const response = await Promise.race([
              fetch(url, requestOptions),
              timeoutPromise
            ]);

            if (!response.ok) {
              const errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
              if (this.enableLogging) {
                debug.error(`ApiRequest: ${errorMessage}`);
              }
              throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await response.json();
            } else {
              return response;
            }
          };

          if (enableRetries) {
            return await this.retryManager.executeWithRetry(requestFn);
          } else {
            return await requestFn();
          }
        } finally {
          this.connectionManager.releaseConnection();
        }
      });

      this.performanceMonitor.endRequest(requestId, false);
      return result;

    } catch (error) {
      this.performanceMonitor.endRequest(requestId, true);
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return await this.apiCall(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data = null, options = {}) {
    return await this.apiCall(endpoint, { method: 'POST', body: data, ...options });
  }

  async put(endpoint, data = null, options = {}) {
    return await this.apiCall(endpoint, { method: 'PUT', body: data, ...options });
  }

  async patch(endpoint, data = null, options = {}) {
    return await this.apiCall(endpoint, { method: 'PATCH', body: data, ...options });
  }

  async deleteRequest(endpoint, options = {}) {
    return await this.apiCall(endpoint, { method: 'DELETE', ...options });
  }

  getStats() {
    const performanceStats = this.performanceMonitor.getStats();
    const connectionStats = this.connectionManager.getStats();
    const retryStats = this.retryManager.getStats();
    
    return {
      requests: performanceStats.requests,
      responseTimes: performanceStats.responseTimes,
      connections: connectionStats,
      retries: retryStats,
      uptime: performanceStats.uptime
    };
  }

  async batchRequests(requests, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => 
        this.apiCall(request.endpoint, request.options).catch(error => ({ error }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  async aggregateCall(collection, pipeline) {
    const endpoint = '/aggregate';
    const body = { pipeline };
    
    return await this.apiCall(endpoint, 'POST', collection, body);
  }

  async getById(collection, id) {
    const endpoint = `/${id}`;
    
    return await this.apiCall(endpoint, 'GET', collection);
  }

  async create(collection, data) {
    const endpoint = '';
    
    let finalData = data;
    if (typeof data === 'object' && data !== null) {
      if (!Object.prototype.hasOwnProperty.call(data, 'data')) {
        finalData = { data: data };
        console.log('Auto-wrapping create data:', finalData);
      } else {
        finalData = data;
        console.log('Create data already wrapped:', finalData);
      }
    }
    
    const result = await this.apiCall(endpoint, 'POST', collection, finalData);
    
    return result;
  }

  async update(collection, id, data) {
    const endpoint = `/${id}`;
    const body = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    let finalBody = body;
    if (typeof body === 'object' && body !== null) {
      if (!Object.prototype.hasOwnProperty.call(body, 'data')) {
        finalBody = { data: body };
        console.log('Auto-wrapping update data:', finalBody);
      } else {
        finalBody = body;
        console.log('Update data already wrapped:', finalBody);
      }
    }
    
    const result = await this.apiCall(endpoint, 'PUT', collection, finalBody);
    
    return result;
  }

  async delete(collection, id) {
    const endpoint = `/${id}`;
    const result = await this.apiCall(endpoint, 'DELETE', collection);
    
    return result;
  }

  async legacyFind(collection, args = [{}], options = {}) {
    console.warn('legacyFind is deprecated. Use aggregateCall with $match pipeline instead.');
    
    const pipeline = [
      { $match: args[0] || {} }
    ];
    
    if (options.sort) {
      pipeline.push({ $sort: options.sort });
    }
    
    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }
    
    if (options.skip) {
      pipeline.push({ $skip: options.skip });
    }
    
    return await this.aggregateCall(collection, pipeline);
  }

  async legacyFindOneAndUpdate(collection, filter, update) {
    console.warn('legacyFindOneAndUpdate is deprecated. Use aggregateCall with $merge pipeline instead.');
    
    const pipeline = [
      { $match: filter },
      { $addFields: update.$set || update },
      { $merge: { into: collection, whenMatched: 'replace' } }
    ];
    
    return await this.aggregateCall(collection, pipeline);
  }

  async legacyInsertOne(collection, document) {
    console.warn('legacyInsertOne is deprecated. Use create instead.');
    return await this.create(collection, document);
  }

  async legacyUpdateOne(collection, filter, update) {
    console.warn('legacyUpdateOne is deprecated. Use update with document ID instead.');
    
    const id = filter._id || filter.id;
    if (id) {
      return await this.update(collection, id, update.$set || update);
    }
    
    return await this.legacyFindOneAndUpdate(collection, filter, update);
  }

  async healthCheck() {
    try {
      const response = await this.apiCall('/api/health', 'GET');
      return response && response.ok !== false;
    } catch (error) {
      if (this.enableLogging) {
        debug.warn('ApiRequest: Health check failed:', error.message);
      }
      return false;
    }
  }

  async clearCache(hostname = null) {
    try {
      const targetHostname = hostname || this.tenantManager.getHostname();
      
      if (!targetHostname) {
        throw new Error('No hostname provided for cache clearing');
      }
      
      // Always use proxy for cache clearing
      const proxyUrl = `/proxy-cache/clear-cache/${targetHostname}`;
      
      if (this.enableLogging) {
        debug.log('ApiRequest: Clearing cache via proxy for hostname:', targetHostname);
      }
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Cache clear via proxy failed with status: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (this.enableLogging) {
        debug.log('ApiRequest: Cache cleared successfully via proxy for:', targetHostname, result);
      }
      
      return {
        success: true,
        hostname: targetHostname,
        status: response.status,
        data: result,
        method: 'proxy'
      };
      
    } catch (error) {
      if (this.enableLogging) {
        debug.error('ApiRequest: Cache clear via proxy failed:', error);
      }
      
      return {
        success: false,
        error: error.message,
        hostname: hostname || this.tenantManager.getHostname(),
        method: 'proxy'
      };
    }
  }

  async clearCacheForCurrentTenant() {
    const hostname = this.tenantManager.getHostname();
    
    if (!hostname) {
      if (this.enableLogging) {
        debug.warn('ApiRequest: No hostname set for current tenant');
      }
      return {
        success: false,
        error: 'No hostname set for current tenant',
        method: 'proxy'
      };
    }
    
    return await this.clearCache(hostname);
  }

  async clearCacheForMultipleHosts(hostnames = []) {
    if (!Array.isArray(hostnames) || hostnames.length === 0) {
      throw new Error('Invalid hostnames array provided');
    }
    
    const results = [];
    
    for (const hostname of hostnames) {
      const result = await this.clearCache(hostname);
      results.push(result);
      
      // เว้นช่วงเวลาเล็กน้อยระหว่างการเรียก API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return {
      totalRequests: hostnames.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    };
  }

  getConfig() {
    return {
      hostkey: this.hostkey,
      baseURL: this.baseURL,
      authSecret: this.authSecret ? 'SET' : 'NOT_SET',
      hostname: this.tenantManager.getHostname(),
      defaultTTL: this.defaultTTL,
      enableLogging: this.enableLogging,
      retryConfig: { ...this.retryConfig }
    };
  }

  setLogging(enable) {
    this.enableLogging = enable;
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Logging enabled');
    }
  }

  destroy() {
    this.tokenManager.destroy();
    this.tenantManager.clear();
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Client destroyed');
    }
  }

  injectTenantData(tenantData) {
    this.tenantManager.injectTenantData(tenantData);
    
    if (tenantData?.child?.token) {
      this.hostkey = tenantData.child.token;
    }
    
    return this;
  }

  setHardcodedConfig(config = {}) {
    const finalConfig = {
      authSecret: config.authSecret || this.tenantConfig.authSecret,
      baseURL: config.baseURL || this.tenantConfig.baseURL
    };
    
    if (finalConfig.authSecret) {
      this.setAuthSecret(finalConfig.authSecret);
    }
    
    if (finalConfig.baseURL) {
      this.baseURL = finalConfig.baseURL;
    }
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Hardcoded configuration applied', {
        hasAuthSecret: !!this.authSecret,
        baseURL: this.baseURL
      });
    }
    
    return this;
  }

  applyHardcodedConfig() {
    this.authSecret = this.tenantConfig.authSecret;
    this.baseURL = this.tenantConfig.baseURL;
    
    if (this.enableLogging) {
      debug.log('ApiRequest: Hardcoded configuration auto-applied', {
        baseURL: this.baseURL,
        hasAuthSecret: !!this.authSecret
      });
    }
    
    return this;
  }

  useHardcodedToken() {
    if (this.enableLogging) {
      debug.warn('ApiRequest: Use tenant data for token instead of hardcoded token');
    }
    return false;
  }

  async generateHardcodedEncryptedToken() {
    throw new Error('Use tenant data for token generation instead of hardcoded token');
  }

  debugStatus() {
    const tokenStatus = this.getTokenStatus();
    const config = this.getConfig();
    const stats = this.getStats();
    
    console.group('🔍 ApiRequest Debug Status');
    console.log('📋 Configuration:', config);
    console.log('🔐 Token Status:', tokenStatus);
    console.log('📊 Performance Stats:', stats);
    console.groupEnd();
    
    return {
      config,
      tokenStatus,
      stats
    };
  }

  getDetailedConfig() {
    const tokenStatus = this.getTokenStatus();
    
    return {
      ...this.getConfig(),
      tokenStatus,
      performanceStats: this.performanceMonitor.getStats(),
      connectionStats: this.connectionManager.getStats(),
      retryStats: this.retryManager.getStats(),
      hasActiveCountdown: this.tokenManager.hasActiveCountdown()
    };
  }

  static createWithHardcodedConfig() {
    const instance = new ApiRequest();
    instance.applyHardcodedConfig();
    return instance;
  }

  static createReadyToUse() {
    const instance = ApiRequest.createWithHardcodedConfig();
    return instance;
  }

  static createWithTenant(tenantData) {
    const instance = ApiRequest.createReadyToUse();
    instance.injectTenantData(tenantData);
    return instance;
  }

  static async clearCacheForHost(hostname) {
    if (!hostname) {
      throw new Error('Hostname is required for cache clearing');
    }
    
    // Always use proxy for static method
    const proxyUrl = `/proxy-cache/clear-cache/${hostname}`;
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Cache clear via proxy failed with status: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        hostname: hostname,
        status: response.status,
        data: result,
        method: 'proxy'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        hostname: hostname,
        method: 'proxy'
      };
    }
  }

  // CORS Bypass Methods using Proxy
  async apiCallWithProxy(endpoint, methodOrOptions = {}, collection = null, body = null) {
    // Similar to apiCall but uses proxy endpoints
    let options = {};
    
    if (typeof methodOrOptions === 'string') {
      options = {
        method: methodOrOptions,
        collection: collection,
        body: body,
        headers: {},
        timeout: 30000,
        retries: true
      };
    } else {
      options = {
        method: 'GET',
        body: null,
        collection: null,
        headers: {},
        timeout: 30000,
        retries: true,
        ...methodOrOptions
      };
    }

    const { method, body: requestBody, collection: targetCollection, headers } = options;

    try {
      let url;
      if (targetCollection) {
        url = `/proxy-api/${targetCollection}${endpoint}`;
      } else {
        url = `/proxy-api${endpoint}`;
      }

      const requestOptions = {
        method,
        headers: {
          ...this.getHeaders(),
          ...headers
        }
      };

      if (requestBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = JSON.stringify(requestBody);
      }

      if (this.enableLogging) {
        debug.log(`API Call via Proxy: ${method} ${url}`);
      }

      const response = await fetch(url, requestOptions);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`API call via proxy failed for ${endpoint}:`, error);
      throw error;
    }
  }

  getHardcodedConfig() {
    return { ...this.tenantConfig };
  }
}

export default ApiRequest;

export const ApiRequestPlugin = {
  install(app, options = {}) {
    const config = {
      hostkey: options.hostkey || null,
      baseURL: options.baseURL || 'https://api-gateway.manonsanoi.workers.dev',
      authSecret: options.authSecret,
      hostname: options.hostname,
      enableLogging: options.enableLogging !== undefined ? options.enableLogging : true,
      defaultTTL: options.defaultTTL || 15,
      useHardcoded: options.useHardcoded !== undefined ? options.useHardcoded : false,
      useTenant: options.useTenant !== undefined ? options.useTenant : true,
      ...options
    };
    
    let apiRequest;
    
    if (config.useHardcoded || Object.keys(options).length === 0) {
      apiRequest = ApiRequest.createReadyToUse();
    } else {
      apiRequest = ApiRequest.createWithConfig(config);
    }
    
    if (config.useTenant) {
      const checkAndInjectTenant = () => {
        try {
          const tenant = app._context?.provides?.tenant;
          
          if (tenant && tenant.child) {
            const tenantChild = tenant.child;
            
            if (tenantChild.hostname) {
              apiRequest.setHostname(tenantChild.hostname);
              
              if (apiRequest.enableLogging) {
                console.log('ApiRequest: Updated hostname from tenant:', tenantChild.hostname);
              }
            }
            
            if (tenantChild.token) {
              apiRequest.hostkey = tenantChild.token;
              apiRequest.useTokenDirectly(tenantChild.token);
              
              if (apiRequest.enableLogging) {
                console.log('ApiRequest: Updated token from tenant:', tenantChild.token.substring(0, 8) + '...');
              }
            }
            
            if (apiRequest.enableLogging) {
              console.log('ApiRequest: Successfully injected tenant data:', {
                hostname: tenantChild.hostname,
                hasToken: !!tenantChild.token
              });
            }
            
            return true;
          }
        } catch (error) {
          if (apiRequest.enableLogging) {
            console.warn('ApiRequest: Could not inject tenant data:', error.message);
          }
        }
        
        return false;
      };
      
      const immediateSuccess = checkAndInjectTenant();
      
      if (!immediateSuccess) {
        setTimeout(() => {
          if (!checkAndInjectTenant()) {
            setTimeout(checkAndInjectTenant, 1000);
          }
        }, 100);
      }
    }
    
    app.config.globalProperties.$apiRequest = apiRequest;
    app.provide('apiRequest', apiRequest);
    
    // เพิ่ม global method สำหรับ cache clearing (all via proxy)
    app.config.globalProperties.$clearCache = async (hostname = null) => {
      return await apiRequest.clearCache(hostname);
    };
    
    app.config.globalProperties.$clearCacheForCurrentTenant = async () => {
      return await apiRequest.clearCacheForCurrentTenant();
    };
    
    // เพิ่ม global method สำหรับ API calls via proxy
    app.config.globalProperties.$apiCallWithProxy = async (endpoint, method, collection, body) => {
      return await apiRequest.apiCallWithProxy(endpoint, method, collection, body);
    };
    
    if (apiRequest.enableLogging) {
      debug.log('ApiRequest: Vue plugin installed with enhanced configuration support', {
        hasAuthSecret: !!apiRequest.authSecret,
        hostname: apiRequest.tenantManager.getHostname(),
        baseURL: apiRequest.baseURL,
        defaultTTL: apiRequest.defaultTTL,
        usingHardcoded: config.useHardcoded || Object.keys(options).length === 0,
        tenantInjection: config.useTenant,
        cacheClearingEnabled: true
      });
    }
    
    return apiRequest;
  }
};

if (typeof debug !== 'undefined') {
  debug.log("ApiRequest Plugin :: V2.0.0 {AES-GCM Encryption + Legacy Support}");
}