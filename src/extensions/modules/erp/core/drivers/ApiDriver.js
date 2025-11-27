/**
 * API Driver - ใช้ $Request service ของระบบ (เหมือน PostService)
 * รองรับ auto-authentication และ error handling
 */

/**
 * Simple Logger Helper
 * Configurable log levels: 'debug', 'info', 'warn', 'error', 'silent'
 */
class Logger {
  constructor(level = 'info') {
    this.level = level
    this.levels = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    }
  }

  setLevel(level) {
    this.level = level
  }

  debug(label, data) {
    if (this.levels[this.level] >= this.levels.debug) {
      console.log(`🔍 [${label}]`, data)
    }
  }

  info(label, data) {
    if (this.levels[this.level] >= this.levels.info) {
      console.log(`ℹ️ [${label}]`, data)
    }
  }

  warn(label, data) {
    if (this.levels[this.level] >= this.levels.warn) {
      console.warn(`⚠️ [${label}]`, data)
    }
  }

  error(label, data) {
    if (this.levels[this.level] >= this.levels.error) {
      console.error(`❌ [${label}]`, data)
    }
  }
}

/**
 * Custom error class for API operations
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, originalError = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      originalError: this.originalError?.message || this.originalError
    }
  }
}

/**
 * MongoDB Query Builder Helper
 * Builds consistent MongoDB queries for list and count operations
 */
class QueryBuilder {
  constructor(type, validatedFilters = {}, searchFields = []) {
    this.type = type
    this.filters = validatedFilters
    this.searchFields = this.validateSearchFields(searchFields || ['id', 'data.name', 'data.sku'])
  }

  /**
   * Validate search fields are in correct format
   * @param {array} fields - Field names/paths to validate
   * @returns {array} Validated fields
   * @throws {Error} If fields are invalid
   */
  validateSearchFields(fields) {
    if (!Array.isArray(fields)) {
      throw new Error('searchFields must be an array')
    }
    
    if (fields.length === 0) {
      throw new Error('searchFields must contain at least one field')
    }
    
    // 🔒 Security: Block sensitive field paths
    const BLOCKED_PATTERNS = [
      'password', 'passwd', 'pwd',
      'token', 'secret', 'key', 'api_key', 'apikey',
      'private', 'credential', 'auth',
      'hash', 'salt', 'session'
    ]
    
    // Validate each field: allow alphanumeric, dots (for nested fields), underscores, hyphens
    // Examples: 'id', 'data.name', 'user.profile.email', '_id'
    const fieldRegex = /^[a-zA-Z0-9_$][a-zA-Z0-9._$-]*$/
    
    for (const field of fields) {
      if (typeof field !== 'string' || !field.trim()) {
        throw new Error('Each searchField must be a non-empty string')
      }
      
      if (!fieldRegex.test(field)) {
        throw new Error(`Invalid searchField format: "${field}". Must contain only alphanumeric, dots, underscores, hyphens, and dollar signs`)
      }
      
      // 🔒 Check for sensitive field patterns
      const fieldLower = field.toLowerCase()
      for (const blocked of BLOCKED_PATTERNS) {
        if (fieldLower.includes(blocked)) {
          throw new Error(`🔒 Security: Cannot search on sensitive field: "${field}". Field contains blocked pattern: "${blocked}"`)
        }
      }
    }
    
    return fields
  }

  /**
   * Build MongoDB query object from filters
   */
  buildQuery() {
    const query = { type: this.type }

    // Status, state, created_by filters
    if (this.filters.status) query.status = this.filters.status
    if (this.filters.state) query.state = this.filters.state
    if (this.filters.created_by) query.created_by = this.filters.created_by
    if (this.filters.subtype) query.subtype = this.filters.subtype

    // Date range filters
    if (this.filters.date_from || this.filters.date_to) {
      query.created_at = {}
      if (this.filters.date_from) query.created_at.$gte = this.filters.date_from
      if (this.filters.date_to) query.created_at.$lte = this.filters.date_to
    }

    // Text search with configurable fields
    if (this.filters.search) {
      query.$or = this.searchFields.map(field => ({
        [field]: { $regex: this.filters.search, $options: 'i' }
      }))
    }

    return query
  }

  /**
   * Build MongoDB options object (sort, pagination)
   */
  buildOptions() {
    const options = {}

    // Sorting
    if (this.filters.sort_by) {
      options.sort = { [this.filters.sort_by.field]: this.filters.sort_by.order === 'desc' ? -1 : 1 }
    } else {
      options.sort = { created_at: -1 } // Default: newest first
    }

    // Pagination
    if (this.filters.page && this.filters.limit) {
      options.skip = (this.filters.page - 1) * this.filters.limit
      options.limit = this.filters.limit
    }

    return options
  }

  /**
   * Get both query and options in one call
   */
  build() {
    return {
      query: this.buildQuery(),
      options: this.buildOptions()
    }
  }
}

export { ApiError, Logger }
export class ApiDriver {
  constructor(vueApp, options = {}) {
    // ✅ Fail-fast: throw error immediately if $Request is not available
    if (!vueApp) {
      throw new ApiError(
        '❌ ApiDriver requires Vue app instance. Provide vueApp when initializing: new TransactionService("api", { vueApp })',
        500
      )
    }
    
    if (!vueApp.config?.globalProperties?.$Request) {
      throw new ApiError(
        '❌ $Request service not found in Vue app. Please ensure $Request is installed as a global property.',
        500
      )
    }
    
    this.$Request = vueApp.config.globalProperties.$Request
    this.baseEndpoint = options.baseEndpoint || 'transaction'
    
    // ✅ ลำดับความสำคัญ: ERP_CORE clientKey > options.clientKey > null
    // ERP_CORE.clientKey เป็น Single Source of Truth เสมอ
    this.clientKey = window.ERP_CORE?.clientKey || options.clientKey || null
    
    // ✅ Debug: แสดงการเลือก clientKey
    console.log('🔑 [ApiDriver] Client Key Selection:', {
      erpCoreKey: window.ERP_CORE?.clientKey ? '***' + window.ERP_CORE.clientKey.slice(-4) : 'null',
      optionsKey: options.clientKey ? '***' + options.clientKey.slice(-4) : 'null',
      selectedKey: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
      source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : (options.clientKey ? 'options' : 'none')
    })
    
    // Logger configuration
    this.logger = new Logger(options.logLevel || 'info')
    
    // Admin role checker function (optional)
    this.isAdmin = options.isAdmin || (() => false)
    
    // Allowed transaction types for validation
    this.allowedTypes = options.allowedTypes || ['SALES', 'PURCHASE', 'INVENTORY', 'HR', 'DELIVERY']
    
    // Configurable search fields for text search in list()
    this.searchFields = options.searchFields || [
      'id',
      'data.name',
      'data.sku'
    ]
    
    // Request caching configuration
    this.cacheEnabled = options.cacheEnabled !== false // Default: enabled
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000 // Default: 5 minutes
    this.cache = new Map() // { key: { data, timestamp } }
    
    this.logger.info('ApiDriver', {
      baseEndpoint: this.baseEndpoint,
      hasRequest: !!this.$Request,
      hasClientKey: !!this.clientKey,
      logLevel: options.logLevel || 'info',
      cacheEnabled: this.cacheEnabled,
      cacheTTL: `${this.cacheTTL / 1000}s`,
      hasAdminCheck: !!options.isAdmin,
      allowedTypes: this.allowedTypes,
      searchFields: this.searchFields
    })
  }

  /**
   * Validate transaction type against whitelist
   * @param {string} type - Transaction type to validate
   * @returns {string} Validated type
   */
  validateType(type) {
    if (!type || typeof type !== 'string') {
      throw new ApiError('Type must be a non-empty string', 400)
    }
    
    const upperType = type.toUpperCase().trim()
    
    if (!this.allowedTypes.includes(upperType)) {
      throw new ApiError(
        `Invalid type: "${type}". Allowed types: ${this.allowedTypes.join(', ')}`,
        400
      )
    }
    
    return upperType
  }

  /**
   * Generate cache key from endpoint and query params
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters (optional)
   * @returns {string} Cache key
   */
  getCacheKey(endpoint, params = null) {
    if (!params || Object.keys(params).length === 0) {
      return `GET:${endpoint}`
    }
    
    // Sort keys for consistent hashing
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {})
    
    const paramHash = JSON.stringify(sortedParams)
    return `GET:${endpoint}?${paramHash}`
  }

  /**
   * Get cached response if available and not expired
   * @param {string} cacheKey - Cache key
   * @returns {*} Cached data or null
   */
  getCachedData(cacheKey) {
    if (!this.cacheEnabled || !this.cache.has(cacheKey)) {
      return null
    }

    const cached = this.cache.get(cacheKey)
    const isExpired = Date.now() - cached.timestamp > this.cacheTTL
    
    if (isExpired) {
      this.cache.delete(cacheKey)
      return null
    }

    this.logger.debug('ApiDriver.cache', `Cache hit: ${cacheKey}`)
    return cached.data
  }

  /**
   * Store response in cache
   * @param {string} cacheKey - Cache key
   * @param {*} data - Data to cache
   */
  setCachedData(cacheKey, data) {
    if (!this.cacheEnabled) return

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
    this.logger.debug('ApiDriver.cache', `Cache stored: ${cacheKey}`)
  }

  /**
   * Clear specific cache entry or all cache (with pattern support)
   * @param {string} cacheKey - Cache key to clear (optional, clears all if not provided)
   * @param {object} options - Clear options { pattern: boolean }
   */
  clearCache(cacheKey = null, options = { pattern: false }) {
    if (!cacheKey) {
      // Clear all cache
      this.cache.clear()
      this.logger.info('ApiDriver.cache', 'All cache cleared')
      return
    }
    
    if (options.pattern) {
      // Clear cache entries matching pattern (regex or string contains)
      let cleared = 0
      const pattern = typeof cacheKey === 'string' ? new RegExp(cacheKey) : cacheKey
      
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key)
          cleared++
        }
      }
      
      this.logger.debug('ApiDriver.cache', `Pattern-based cache clear: ${cleared} entries removed (pattern: ${cacheKey})`)
    } else {
      // Clear specific cache entry
      this.cache.delete(cacheKey)
      this.logger.debug('ApiDriver.cache', `Cache cleared: ${cacheKey}`)
    }
  }

  /**
   * Build full endpoint URL with path sanitization
   * Handles: removes leading/trailing slashes, prevents double slashes
   * @param {string} path - Path segment to append
   * @returns {string} Sanitized endpoint URL
   */
  getEndpoint(path = '') {
    if (!path || path.trim() === '') {
      return this.baseEndpoint
    }
    
    // Remove leading and trailing slashes from path
    const sanitizedPath = path.trim().replace(/^\/+|\/+$/g, '')
    
    // Remove trailing slash from baseEndpoint if exists
    const sanitizedBase = this.baseEndpoint.replace(/\/+$/g, '')
    
    return `${sanitizedBase}/${sanitizedPath}`
  }

  /**
   * Make API call using $Request service with retry mechanism and caching
   * 🎯 ใช้ pattern เดียวกับ PostService
   * ⏱️ Retry strategy: 3 attempts with exponential backoff (1s, 2s, 4s)
   * 💾 Caching: GET requests cached with TTL
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} body - Request body (optional)
   * @param {object} params - Query parameters for cache key (optional)
   * @param {number} attempt - Current retry attempt (internal use)
   * @returns {*} API response data
   * @throws {ApiError} If all retries fail
   */
  async apiCall(endpoint, method = 'GET', body = null, params = null, attempt = 1, timeoutMs = 30000) {
    if (!this.$Request) {
      throw new ApiError(
        '$Request service is not available. Please provide Vue app when initializing ERP Core.',
        500
      )
    }
    
    // ✅ Refresh clientKey จาก ERP_CORE ก่อนทุก API call
    const currentKey = window.ERP_CORE?.clientKey || this.clientKey
    if (currentKey !== this.clientKey) {
      console.log('🔄 [ApiDriver] Updating clientKey:', {
        oldKey: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        newKey: currentKey ? '***' + currentKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback'
      })
      this.clientKey = currentKey
    }
    
    const MAX_RETRIES = 3
    const cacheKey = this.getCacheKey(endpoint, params)
    
    // ✅ สำคัญ! ตรวจสอบและลบ _id ออกจาก PUT requests
    if (method.toUpperCase() === 'PUT' && body) {
      // Helper function เพื่อลบ _id จาก object (รวมถึง nested)
      const removeIdFields = (obj, path = '') => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
          return obj
        }
        
        const cleaned = { ...obj }
        
        if (cleaned._id !== undefined) {
          this.logger.warn('ApiDriver.apiCall', `Removing _id from PUT request at path '${path}': ${cleaned._id}`)
          delete cleaned._id
        }
        
        // ไม่ลบ id field ทั่วไป เพราะอาจเป็น business id
        // แต่ถ้าเป็น MongoDB ObjectId pattern ก็ลบออก
        if (cleaned.id && typeof cleaned.id === 'string' && /^[0-9a-fA-F]{24}$/.test(cleaned.id)) {
          this.logger.warn('ApiDriver.apiCall', `Removing MongoDB ObjectId 'id' from PUT request at path '${path}': ${cleaned.id}`)
          delete cleaned.id
        }
        
        return cleaned
      }
      
      // กรณีที่ body มี structure { data: ... }
      if (body.data && typeof body.data === 'object') {
        body = {
          ...body,
          data: removeIdFields(body.data, 'data')
        }
      }
      // กรณีที่ body เป็น object โดยตรง (ไม่มี wrapper)
      else if (typeof body === 'object') {
        body = removeIdFields(body, 'root')
      }
    }
    
    // Check cache for GET requests
    if (method.toUpperCase() === 'GET') {
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData !== null) {
        return cachedData
      }
    }
    
    try {
      this.logger.debug('ApiDriver.apiCall', `${method} ${endpoint} (timeout: ${timeoutMs}ms)`)
      
      // ✅ Debug: แสดง endpoint และ clientKey ที่จะใช้
      console.log('🌐 [ApiDriver] API Request Debug:', {
        method,
        endpoint,
        baseEndpoint: this.baseEndpoint,
        clientKey: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        bodyKeys: body ? Object.keys(body) : null
      })
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, timeoutMs)
      
      let response
      
      try {
        // ✅ ใช้ $Request เหมือน PostService
        // Note: If $Request doesn't support AbortSignal, pass signal through options
        switch (method.toUpperCase()) {
          case 'GET':
            response = await this.$Request.GET(endpoint, this.clientKey, { signal: controller.signal })
            break
          case 'POST':
            response = await this.$Request.POST(endpoint, body, this.clientKey, { signal: controller.signal })
            break
          case 'PUT':
            response = await this.$Request.PUT(endpoint, body, this.clientKey, { signal: controller.signal })
            break
          case 'DELETE':
            response = await this.$Request.DELETE(endpoint, null, this.clientKey, { signal: controller.signal })
            break
          default:
            throw new ApiError(`Unsupported HTTP method: ${method}`, 400)
        }
      } finally {
        // Ensure timeout is cleared
        clearTimeout(timeoutId)
      }
      
      const responseData = response?.data || response
      
      // Cache GET responses
      if (method.toUpperCase() === 'GET') {
        this.setCachedData(cacheKey, responseData)
      }
      
      this.logger.debug('ApiDriver.apiCall', `Response received for ${method} ${endpoint}`)
      
      // ✅ Return data เหมือน PostService
      return responseData
      
    } catch (error) {
      // Check for abort/timeout errors
      const isTimeout = error?.name === 'AbortError' || error?.message?.includes('abort')
      
      // Determine if error is retryable (network/timeout errors)
      const isRetryable = isTimeout ||
                         error?.message?.includes('timeout') || 
                         error?.message?.includes('Network') ||
                         error?.code === 'ECONNREFUSED' ||
                         error?.code === 'ECONNRESET' ||
                         error?.status === 503 ||
                         error?.status === 504
      
      // Retry if: retryable AND attempts remaining
      if (isRetryable && attempt < MAX_RETRIES) {
        const delayMs = Math.pow(2, attempt - 1) * 1000 // Exponential backoff: 1s, 2s, 4s
        const reason = isTimeout ? 'timeout' : 'transient error'
        
        this.logger.warn('ApiDriver.apiCall', 
          `Retrying ${method} ${endpoint} (${reason}, attempt ${attempt + 1}/${MAX_RETRIES}) after ${delayMs}ms`)
        
        await new Promise(resolve => setTimeout(resolve, delayMs))
        return this.apiCall(endpoint, method, body, params, attempt + 1, timeoutMs)
      }
      
      this.logger.error('ApiDriver.apiCall', `API call failed after ${attempt} attempt(s): ${method} ${endpoint}`)
      
      // Normalize error to ApiError
      if (error instanceof ApiError) {
        throw error
      }
      
      const statusCode = isTimeout ? 408 : (error?.status || error?.statusCode || 500)
      const message = isTimeout 
        ? `Request timeout after ${timeoutMs}ms: ${method} ${endpoint}`
        : (error?.message || `API call failed: ${method} ${endpoint}`)
      
      throw new ApiError(message, statusCode, error)
    }
  }

  /**
   * Create new transaction
   * 📝 Pattern: POST transaction/ { data: {...}, options: {} }
   * 
   * ตัวอย่างจากระบบเดิม:
   * await this.$Request.POST('post/', { data: post, options: { uniqueFields: ["slug"] } })
   */
  async create(type, transaction) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint()
    
    // Generate ID if not exists
    if (!transaction.id) {
      transaction.id = this.generateId(type)
    }
    
    // Set timestamps
    const now = new Date().toISOString()
    if (!transaction.created_at) transaction.created_at = now
    if (!transaction.updated_at) transaction.updated_at = now
    
    this.logger.info('ApiDriver.create', `Creating ${type} transaction: ${transaction.id}`)
    
    // ✅ ใช้ structure เดียวกับ PostService.createPost
    const result = await this.apiCall(endpoint, 'POST', {
      data: transaction,
      options: {}
    }, null) // POST ไม่ใช้ cache
    
    // 🔄 Smart cache invalidation - ล้าง cache ที่เกี่ยวข้องกับ type นี้
    this.logger.debug('ApiDriver.create', 'Invalidating related GET cache entries')
    this.clearCache(`GET:${this.baseEndpoint}/query`, { pattern: true })
    this.clearCache(this.baseEndpoint, { pattern: true })
    
    // Explicitly return single object format { data, meta }
    return this.normalizeResponse(result, 'single')
  }
  
  /**
   * Generate unique ID using UUID v4 (RFC 4122 standard)
   * Returns format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  generateId(type) {
    // UUID v4 generation
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    
    // Optional: prepend type prefix for readability
    // Example: TRX-550e8400-e29b-41d4-a716-446655440000
    return type ? `${type.toUpperCase().substr(0, 3)}-${uuid}` : uuid
  }

  /**
   * Read transaction by ID
   * 📖 Pattern: GET transaction/:id
   * 
   * ตัวอย่างจากระบบเดิม:
   * await this.$Request.GET(`post/${id}`, clientKey)
   */
  async read(type, id) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint(id)
    
    this.logger.info('ApiDriver.read', `Reading ${type} transaction: ${id}`)
    
    // ✅ GET ไม่ต้องส่ง body, ส่ง params สำหรับ cache key
    const result = await this.apiCall(endpoint, 'GET', null, { type, id })
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Update transaction
   * ✏️ Pattern: PUT transaction/:id { data: {...} }
   * 
   * ตัวอย่างจากระบบเดิม:
   * await this.$Request.PUT(`post/${id}`, { data: updateData })
   */
  async update(type, id, updates) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint(id)
    
    // ✅ สร้างสำเนาของ updates เพื่อไม่แก้ไข original object
    const cleanUpdates = { ...updates }
    
    // Set updated timestamp
    cleanUpdates.updated_at = new Date().toISOString()
    
    // ✅ ลบ _id และ id ออกจาก update data (MongoDB immutable fields)
    if (cleanUpdates._id !== undefined) {
      this.logger.debug('ApiDriver.update', `Removing _id from update data: ${cleanUpdates._id}`)
      delete cleanUpdates._id
    }
    if (cleanUpdates.id !== undefined && cleanUpdates.id === id) {
      this.logger.debug('ApiDriver.update', `Removing duplicate id from update data: ${cleanUpdates.id}`)
      delete cleanUpdates.id
    }
    
    this.logger.info('ApiDriver.update', `Updating ${type} transaction: ${id}`)
    this.logger.debug('ApiDriver.update', `Clean update data keys: ${Object.keys(cleanUpdates).join(', ')}`)
    
    // ✅ ใช้ structure เดียวกับ PostService.updatePost
    const result = await this.apiCall(endpoint, 'PUT', {
      data: cleanUpdates  // ✅ ใช้ cleanUpdates แทน updates
    }, null) // PUT ไม่ใช้ cache
    
    // 🔄 Smart cache invalidation - ล้าง cache ที่เกี่ยวข้อง
    this.logger.debug('ApiDriver.update', 'Invalidating related GET cache entries')
    this.clearCache(`GET:${this.baseEndpoint}/query`, { pattern: true })
    this.clearCache(`GET:${this.baseEndpoint}/${id}`)
    
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Delete transaction
   * 🗑️ Pattern: DELETE transaction/:id
   * 
   * ตัวอย่างจากระบบเดิม:
   * await this.$Request.DELETE(`post/${id}`, null, clientKey)
   */
  async delete(type, id) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint(id)
    
    this.logger.info('ApiDriver.delete', `Deleting ${type} transaction: ${id}`)
    
    // ✅ DELETE ไม่ต้องส่ง body (ส่ง null ใน apiCall)
    const result = await this.apiCall(endpoint, 'DELETE', null, null)
    
    // 🔄 Smart cache invalidation - ล้าง cache ที่เกี่ยวข้อง
    this.logger.debug('ApiDriver.delete', 'Invalidating related GET cache entries')
    this.clearCache(`GET:${this.baseEndpoint}/query`, { pattern: true })
    this.clearCache(`GET:${this.baseEndpoint}/${id}`)
    
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Validate and sanitize filters to prevent injection
   * @param {object} filters - Raw filters from user
   * @returns {object} Validated filters
   * @throws {ApiError} If validation fails
   */
  validateFilters(filters = {}) {
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
      throw new ApiError('Filters must be a plain object', 400)
    }
    
    const validated = {}
    const allowedFields = ['status', 'state', 'created_by', 'subtype', 'date_from', 'date_to', 'search', 'sort_by', 'page', 'limit']
    
    for (const [key, value] of Object.entries(filters)) {
      // Only allow whitelisted fields
      if (!allowedFields.includes(key)) {
        this.logger.warn('ApiDriver.validateFilters', `Ignoring unknown filter field: ${key}`)
        continue
      }
      
      // Validate value types
      if (value === null || value === undefined) {
        continue // Skip empty values
      }
      
      if (key === 'sort_by') {
        // sort_by must be { field, order }
        if (typeof value !== 'object' || !value.field || !['asc', 'desc'].includes(value.order)) {
          throw new ApiError('sort_by must be { field: string, order: "asc"|"desc" }', 400)
        }
        // Sanitize field name (allow alphanumeric, dots, underscores, hyphens)
        const sanitizedField = String(value.field).replace(/[^a-zA-Z0-9._-]/g, '')
        if (!sanitizedField) {
          throw new ApiError('sort_by field must contain valid characters', 400)
        }
        validated[key] = {
          field: sanitizedField,
          order: value.order
        }
      } else if (key === 'page' || key === 'limit') {
        // page and limit must be positive integers
        const num = parseInt(value, 10)
        if (!Number.isInteger(num) || num < 1) {
          throw new ApiError(`${key} must be a positive integer`, 400)
        }
        validated[key] = num
      } else if (typeof value === 'string') {
        // String values: trim and limit length
        const trimmed = String(value).trim()
        if (trimmed.length > 500) {
          throw new ApiError(`Filter value for ${key} exceeds max length (500 chars)`, 400)
        }
        validated[key] = trimmed
      } else if (typeof value === 'boolean') {
        validated[key] = value
      } else {
        throw new ApiError(`Invalid type for filter field ${key}: ${typeof value}`, 400)
      }
    }
    
    return validated
  }

  /**
   * List transactions with filters
   * 📋 Pattern: POST transaction/query { method: 'find', args: [...] }
   * 
   * ตัวอย่างจากระบบเดิม (CourseList):
   * await this.$Request.POST('post/aggregate', { pipeline: [...] })
   */
  async list(type, filters = {}) {
    type = this.validateType(type)
    const validatedFilters = this.validateFilters(filters)
    
    const endpoint = this.getEndpoint('query')
    
    // Use QueryBuilder with configurable search fields
    const queryBuilder = new QueryBuilder(type, validatedFilters, this.searchFields)
    const { query, options } = queryBuilder.build()
    
    this.logger.info('ApiDriver.list', `Listing ${type} transactions`)
    
    // ✅ ใช้ MongoDB query pattern แบบเดียวกับระบบเดิม
    const result = await this.apiCall(endpoint, 'POST', {
      method: 'find',
      args: [query, options]
    }, { type, filters: validatedFilters }) // ส่ง params สำหรับ cache key
    
    // Return normalized response
    return this.normalizeResponse(result, 'array')
  }

  /**
   * Count transactions
   * 🔢 Pattern: POST transaction/query { method: 'countDocuments', args: [...] }
   */
  async count(type, filters = {}) {
    type = this.validateType(type)
    const validatedFilters = this.validateFilters(filters)
    
    const endpoint = this.getEndpoint('query')
    
    // Use QueryBuilder with searchFields (for consistency, even if search not used in count)
    const queryBuilder = new QueryBuilder(type, validatedFilters, this.searchFields)
    const query = queryBuilder.buildQuery()
    
    this.logger.info('ApiDriver.count', `Counting ${type} transactions`)
    
    // ✅ ใช้ MongoDB countDocuments
    const result = await this.apiCall(endpoint, 'POST', {
      method: 'countDocuments',
      args: [query]
    }, { type, filters: validatedFilters }) // ส่ง params สำหรับ cache key
    
    return typeof result === 'number' ? result : (result?.count || 0)
  }

  /**
   * Aggregate transactions (MongoDB aggregation pipeline)
   * 📊 Pattern: POST transaction/aggregate { pipeline: [...] }
   * 
   * ตัวอย่างจากระบบเดิม (PostService):
   * await this.$Request.POST('post/aggregate', { pipeline })
   * 
   * @param {string} type - Transaction type
   * @param {array} pipeline - MongoDB aggregation pipeline stages
   * @returns {array} Aggregated results
   * @throws {ApiError} If type or pipeline is invalid
   */
  async aggregate(type, pipeline) {
    type = this.validateType(type)
    
    // Validate pipeline is array
    if (!Array.isArray(pipeline)) {
      throw new ApiError('Pipeline must be an array of stage objects', 400)
    }
    
    // Validate pipeline is not empty
    if (pipeline.length === 0) {
      throw new ApiError('Pipeline must contain at least one stage', 400)
    }
    
    // Validate each stage is an object
    for (let i = 0; i < pipeline.length; i++) {
      if (!pipeline[i] || typeof pipeline[i] !== 'object' || Array.isArray(pipeline[i])) {
        throw new ApiError(`Pipeline stage ${i} must be an object`, 400)
      }
      
      // Validate stage has at least one operator (starts with $)
      const keys = Object.keys(pipeline[i])
      if (keys.length === 0 || !keys.some(k => k.startsWith('$'))) {
        throw new ApiError(`Pipeline stage ${i} must contain MongoDB operators (starting with $)`, 400)
      }
    }
    
    const endpoint = this.getEndpoint('aggregate')
    
    this.logger.info('ApiDriver.aggregate', `Aggregating ${type} transactions with ${pipeline.length} stages`)
    
    // ✅ ใช้ MongoDB aggregation pipeline เหมือน PostService
    const result = await this.apiCall(endpoint, 'POST', {
      pipeline
    }, { type, pipelineStages: pipeline.length }) // ✅ ส่ง params สำหรับ cache key
    
    return this.normalizeResponse(result, 'array')
  }

  /**
   * Normalize API response to consistent format
   * For backward compatibility: array methods return array directly, others return { data, meta }
   * @param {*} result - Raw API response
   * @param {string} type - Response type: 'array', 'single', or null
   * @returns {array|object} array for list operations, { data, meta } for others
   */
  normalizeResponse(result, type = 'single') {
    if (type === 'array') {
      // For array operations, return array directly (backward compatible)
      return Array.isArray(result) ? result : (result?.data || [])
    } else if (type === 'single') {
      // For single records, return { data, meta }
      const data = result && typeof result === 'object' ? result : { value: result }
      return {
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      }
    }
    // Default: return as-is
    return result
  }

  /**
   * Get statistics
   */
  async getStats(type) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint('stats')
    
    this.logger.info('ApiDriver.getStats', `Getting stats for ${type}`)
    
    const result = await this.apiCall(endpoint, 'POST', { type })
    
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Search transactions (if supported by driver)
   * @param {string} query - Search query string
   * @param {object} filters - Additional filters (optional)
   * @returns {array} Search results
   * @throws {ApiError} If query is invalid
   */
  async search(query, filters = {}) {
    // Validate query parameter
    if (!query || typeof query !== 'string') {
      throw new ApiError('Search query must be a non-empty string', 400)
    }
    
    const trimmedQuery = query.trim()
    if (trimmedQuery.length === 0) {
      throw new ApiError('Search query cannot be empty', 400)
    }
    
    if (trimmedQuery.length > 500) {
      throw new ApiError('Search query exceeds max length (500 chars)', 400)
    }
    
    const endpoint = this.getEndpoint('search')
    
    this.logger.info('ApiDriver.search', `Searching transactions: ${trimmedQuery}`)
    
    const result = await this.apiCall(endpoint, 'POST', {
      query: trimmedQuery,
      filters
    })
    
    return this.normalizeResponse(result, 'array')
  }

  /**
   * Batch operations with error tracking
   * Returns partial results on individual failures instead of total batch failure
   * @param {array} operations - Array of batch operations
   * @returns {object} { successful: [...], failed: [...] } format
   */
  async batch(operations) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new ApiError('Batch operations must be non-empty array', 400)
    }
    
    const endpoint = this.getEndpoint('batch')
    
    this.logger.info('ApiDriver.batch', `Batch operations: ${operations.length}`)
    
    const successful = []
    const failed = []
    
    // Execute each operation individually to track partial success
    for (let i = 0; i < operations.length; i++) {
      try {
        const op = operations[i]
        this.logger.debug('ApiDriver.batch', `Executing operation ${i + 1}/${operations.length}`)
        
        const result = await this.apiCall(endpoint, 'POST', { operations: [op] })
        
        successful.push({
          index: i,
          operation: op,
          result: this.normalizeResponse(result, 'single')
        })
      } catch (error) {
        this.logger.warn('ApiDriver.batch', `Operation ${i + 1} failed: ${error.message}`)
        
        failed.push({
          index: i,
          operation: operations[i],
          error: error instanceof ApiError ? {
            message: error.message,
            statusCode: error.statusCode,
            timestamp: error.timestamp
          } : {
            message: error.message,
            statusCode: 500
          }
        })
      }
    }
    
    // Log batch completion statistics
    this.logger.info('ApiDriver.batch', `Completed: ${successful.length}/${operations.length} successful, ${failed.length} failed`)
    
    return {
      successful,
      failed,
      summary: {
        total: operations.length,
        succeeded: successful.length,
        failed: failed.length
      }
    }
  }

  /**
   * Clear all data for a type (admin only)
   * ⚠️ DANGEROUS: Permanently deletes all transactions of this type
   * @param {string} type - Transaction type to clear
   * @param {boolean} confirm - Must be true to proceed (prevents accidental deletion)
   * @throws {ApiError} If not admin, confirmation missing, or type invalid
   */
  async clear(type, confirm = false) {
    type = this.validateType(type)
    
    // Check admin authorization
    if (!this.isAdmin()) {
      this.logger.warn('ApiDriver.clear', `DENIED: Unauthorized clear attempt for ${type}`)
      throw new ApiError('🚨 Insufficient permissions. Admin access required for clear operations', 403)
    }
    
    if (!confirm) {
      this.logger.warn('ApiDriver.clear', 'Clear operation blocked - missing confirmation flag')
      throw new ApiError(`🚨 clear() requires confirm=true as second argument to prevent accidental data loss`, 400)
    }
    
    const endpoint = this.getEndpoint('clear')
    
    this.logger.warn('ApiDriver.clear', `⚠️  PERMANENT: Clearing all ${type} data - this cannot be undone`)
    
    // Clear related cache entries
    this.clearCache(`GET:${this.baseEndpoint}/query`)
    
    await this.apiCall(endpoint, 'POST', { type })
    return true
  }

  /**
   * Clear all ERP data (admin only)
   * ⚠️ DANGEROUS: Permanently deletes ALL transactions
   * @param {boolean} confirm - Must be true to proceed (prevents accidental deletion)
   * @throws {ApiError} If not admin or confirmation missing
   */
  async clearAll(confirm = false) {
    // Check admin authorization
    if (!this.isAdmin()) {
      this.logger.warn('ApiDriver.clearAll', `DENIED: Unauthorized clearAll attempt`)
      throw new ApiError('🚨 Insufficient permissions. Admin access required for clearAll operations', 403)
    }
    
    if (!confirm) {
      this.logger.warn('ApiDriver.clearAll', 'clearAll operation blocked - missing confirmation flag')
      throw new ApiError(`🚨 clearAll() requires confirm=true as argument to prevent accidental data loss`, 400)
    }
    
    const endpoint = this.getEndpoint('clear-all')
    
    this.logger.warn('ApiDriver.clearAll', `⚠️  PERMANENT: Clearing ALL ERP data - this cannot be undone`)
    
    // Clear all cache
    this.clearCache()
    
    await this.apiCall(endpoint, 'POST')
    return true
  }

  /**
   * Export data for backup
   */
  async export(type) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint('export')
    
    this.logger.info('ApiDriver.export', `Exporting ${type} data`)
    
    const result = await this.apiCall(endpoint, 'POST', { type })
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Import data from backup
   */
  async import(type, data) {
    type = this.validateType(type)
    const endpoint = this.getEndpoint('import')
    
    this.logger.info('ApiDriver.import', `Importing ${type} data`)
    
    const result = await this.apiCall(endpoint, 'POST', {
      type,
      data
    })
    
    return this.normalizeResponse(result, 'single')
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const endpoint = this.getEndpoint('health')
      await this.apiCall(endpoint, 'GET', null, null)
      this.logger.info('ApiDriver.healthCheck', 'Health check passed')
      return true
    } catch (error) {
      this.logger.error('ApiDriver.healthCheck', 'Health check failed')
      return false
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries())
    const now = Date.now()
    
    const stats = {
      totalEntries: this.cache.size,
      totalSizeBytes: 0,
      byEndpoint: {},
      expired: 0,
      validEntries: 0,
      oldestEntry: null,
      newestEntry: null
    }
    
    entries.forEach(([key, value]) => {
      const age = now - value.timestamp
      const isExpired = age > this.cacheTTL
      const sizeBytes = JSON.stringify(value.data).length
      
      stats.totalSizeBytes += sizeBytes
      
      if (isExpired) {
        stats.expired++
      } else {
        stats.validEntries++
      }
      
      // Extract endpoint from cache key
      const endpoint = key.split('?')[0].replace('GET:', '')
      if (!stats.byEndpoint[endpoint]) {
        stats.byEndpoint[endpoint] = { count: 0, sizeBytes: 0 }
      }
      stats.byEndpoint[endpoint].count++
      stats.byEndpoint[endpoint].sizeBytes += sizeBytes
      
      // Track oldest and newest
      if (!stats.oldestEntry || value.timestamp < stats.oldestEntry.timestamp) {
        stats.oldestEntry = { key, timestamp: value.timestamp, age }
      }
      if (!stats.newestEntry || value.timestamp > stats.newestEntry.timestamp) {
        stats.newestEntry = { key, timestamp: value.timestamp, age }
      }
    })
    
    return stats
  }

  /**
   * Clean expired cache entries
   * @returns {number} Number of entries removed
   */
  cleanExpiredCache() {
    const now = Date.now()
    let removed = 0
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
        removed++
      }
    }
    
    if (removed > 0) {
      this.logger.info('ApiDriver.cache', `Cleaned ${removed} expired cache entries`)
    }
    
    return removed
  }
}