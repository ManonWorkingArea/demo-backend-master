/**
 * 🧠 TRANSACTION ENGINE - CORE CONTROL LAYER
 * 
 * หัวใจของระบบ ERP ทั้งหมด - Single Source of Truth (SOT)
 * 
 * 🔥 CORE PRINCIPLES:
 * - ทุกโมดูลต้องสื่อสารผ่าน Engine นี้เท่านั้น
 * - ไม่มีการเขียนข้อมูลตรงๆ ในโมดูลย่อย
 * - Type-based routing ไปยัง schema และ flow ที่ถูกต้อง
 * - Event-driven communication ข้ามโมดูล
 * - Unified state management ทั้งระบบ
 * 
 * 🎯 ARCHITECTURE:
 * - Decoupled I/O Layer (LocalStorage → API → Database)
 * - Schema Validation + State Machine Control
 * - Hook System สำหรับ workflow automation
 * - Transactional Safety + Audit Trail
 */

import { TRANSACTION_TYPES, INITIAL_STATES, isValidTransactionType } from './Types.js'
import { TransactionValidator } from './Validator.js'
import { getSchema } from './Schema.js'
import { TransactionService } from './Service.js'

export class TransactionEngine {
  constructor(driverType = 'local', options = {}) {
    this.service = new TransactionService(driverType, options)
    this.driverType = driverType
    
    // 🎯 Control Layer Components
    this.hooks = {} // Event hooks registry
    this.middleware = [] // Middleware pipeline
    this.cache = new Map() // In-memory cache
    this.history = [] // Transaction history
    this.locks = new Map() // Transaction locks with timeout tracking { lockKey: timeoutId }
    
    // ⏱️ Lock Configuration
    this.LOCK_TIMEOUT = options.lockTimeout || 30000 // 30 seconds default
    this.LOCK_WARNING_THRESHOLD = options.lockWarningThreshold || 5000 // 5 seconds
    
    // 📊 Metrics & Monitoring
    this.metrics = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: 0,
      lockTimeouts: 0,
      startTime: Date.now()
    }
    
    console.log(`🚀 TransactionEngine initialized with ${driverType} driver`)
  }

  /**
   * Generate unique ID สำหรับ transaction
   */
  generateId(type) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9) 
    const prefix = type.toUpperCase().substr(0, 3)
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * 🔒 Acquire lock with automatic timeout
   * @param {string} lockKey - Lock identifier
   * @param {number} timeoutMs - Custom timeout (optional)
   * @returns {boolean} True if lock acquired
   * @throws {Error} If lock is already held
   */
  acquireLock(lockKey, timeoutMs = null) {
    if (this.locks.has(lockKey)) {
      throw new Error(`🔒 Lock already held: ${lockKey}`)
    }
    
    const timeout = timeoutMs || this.LOCK_TIMEOUT
    const startTime = Date.now()
    
    // Set automatic timeout to release lock
    const timeoutId = setTimeout(() => {
      if (this.locks.has(lockKey)) {
        this.locks.delete(lockKey)
        this.metrics.lockTimeouts++
        console.warn(`⚠️ Lock timeout after ${timeout}ms: ${lockKey}`)
      }
    }, timeout)
    
    // Store timeout ID for manual cleanup
    this.locks.set(lockKey, { timeoutId, startTime, timeout })
    
    // Warning for long-running operations
    if (timeout > this.LOCK_WARNING_THRESHOLD) {
      console.warn(`⏱️ Long lock timeout configured: ${lockKey} (${timeout}ms)`)
    }
    
    return true
  }

  /**
   * 🔓 Release lock manually
   * @param {string} lockKey - Lock identifier
   */
  releaseLock(lockKey) {
    const lockInfo = this.locks.get(lockKey)
    
    if (!lockInfo) {
      // Lock already released or timed out
      return
    }
    
    // Clear the timeout
    clearTimeout(lockInfo.timeoutId)
    
    // Calculate lock duration
    const duration = Date.now() - lockInfo.startTime
    
    // Warn if lock was held for long time
    if (duration > this.LOCK_WARNING_THRESHOLD) {
      console.warn(`⏱️ Lock held for ${duration}ms: ${lockKey}`)
    }
    
    this.locks.delete(lockKey)
  }

  /**
   * 🔍 Check if lock is held
   * @param {string} lockKey - Lock identifier
   * @returns {boolean}
   */
  isLocked(lockKey) {
    return this.locks.has(lockKey)
  }

  /**
   * 📊 Get lock information
   * @param {string} lockKey - Lock identifier
   * @returns {object|null} Lock info or null
   */
  getLockInfo(lockKey) {
    const lockInfo = this.locks.get(lockKey)
    if (!lockInfo) return null
    
    return {
      lockKey,
      startTime: lockInfo.startTime,
      timeout: lockInfo.timeout,
      age: Date.now() - lockInfo.startTime,
      remainingTime: lockInfo.timeout - (Date.now() - lockInfo.startTime)
    }
  }

  /**
   * Register event hook
   */
  on(event, callback) {
    if (!this.hooks[event]) {
      this.hooks[event] = []
    }
    this.hooks[event].push(callback)
  }

  /**
   * Trigger event hooks
   */
  async triggerHook(event, type, data) {
    const eventHooks = this.hooks[event]
    if (eventHooks && eventHooks.length > 0) {
      for (const hook of eventHooks) {
        try {
          await hook(type, data)
        } catch (error) {
          console.warn(`Hook ${event} failed:`, error.message)
        }
      }
    }
  }

  /**
   * 🔥 CREATE TRANSACTION - Core Control Point
   * ตัวควบคุมหลักในการสร้างธุรกรรมใหม่
   */
  async create(type, data, userId = 'system') {
    const startTime = Date.now()
    const lockKey = `create_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    try {
      // 🔒 Acquire transaction lock with timeout
      this.acquireLock(lockKey)
      
      // ✅ Type validation
      if (!isValidTransactionType(type)) {
        throw new Error(`❌ Unknown transaction type: ${type}. Supported: ${Object.values(TRANSACTION_TYPES).join(', ')}`)
      }
      
      // 🎯 Schema-based field generation
      const schema = getSchema(type)
      if (!schema) {
        throw new Error(`❌ Schema not found for transaction type: ${type}`)
      }
      
      // 🆔 Auto-generate required fields
      const now = new Date().toISOString()
      const autoFields = {
        id: data.id || this.generateId(type),
        // ✅ ไม่ override type field ถ้ามีค่าอยู่แล้ว (สำหรับ supplier type selection)
        ...(data.type ? {} : { type }),
        status: INITIAL_STATES[type] || 'draft',
        created_at: now,
        updated_at: now,
        created_by: userId,
        updated_by: userId
      }
      
      // 🔧 Apply schema defaults
      const transactionData = this.applySchemaDefaults(type, {
        ...data,
        ...autoFields
      })

      // 🐛 Debug log for supplier type tracking
      if (type === 'supplier') {
        console.log(`🔍 [TransactionEngine] Create Debug`)
        console.log('📥 Original data:', data)
        console.log('🤖 Auto fields:', autoFields)
        console.log('📦 Final transactionData:', transactionData)
        console.log('🎯 Type field value:', transactionData.type)
      }

      // 🛡️ Comprehensive validation
      const validation = TransactionValidator.validateForCreate(type, transactionData)
      if (!validation.isValid) {
        throw new Error(`❌ Validation failed: ${validation.errors.join(', ')}`)
      }
      
      // 🔗 Run middleware pipeline
      await this.runMiddleware('beforeCreate', type, transactionData)
      
      // 🎣 Trigger beforeCreate hooks
      await this.triggerHook('beforeCreate', type, transactionData)
      
      // 💾 Core storage operation
      const transaction = await this.service.create(type, transactionData)
      
      // 📝 Add to audit trail
      this.addToHistory('CREATE', type, transaction.id, userId, {
        duration: Date.now() - startTime,
        size: JSON.stringify(transaction).length
      })
      
      // 💾 Cache the transaction
      this.cache.set(`${type}:${transaction.id}`, transaction)
      
      // 🔄 Smart cache invalidation - clear list caches
      this.clearCacheByType(type)
      
      // 🎣 Trigger afterCreate hooks (workflow automation)
      await this.triggerHook('afterCreate', type, transaction)
      
      // 📊 Update metrics
      this.metrics.created++
      
      console.log(`✅ Transaction created: ${transaction.id} (${type}) in ${Date.now() - startTime}ms`)
      
      return {
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
        metadata: {
          duration: Date.now() - startTime,
          cache_hit: false,
          hooks_triggered: this.hooks['afterCreate']?.length || 0
        }
      }
      
    } catch (error) {
      this.metrics.errors++
      console.error(`❌ Create transaction failed (${type}):`, error.message)
      
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          duration: Date.now() - startTime,
          failed_at: 'create'
        }
      }
    } finally {
      // 🔓 Release lock (always, even on error)
      this.releaseLock(lockKey)
    }
  }

  /**
   * 📖 READ TRANSACTION - Smart Cache-First Retrieval
   */
  async read(type, id) {
    const startTime = Date.now()
    
    try {
      // 💾 Check cache first
      const cacheKey = `${type}:${id}`
      if (this.cache.has(cacheKey)) {
        console.log(`⚡ Cache hit: ${cacheKey}`)
        return {
          success: true,
          data: this.cache.get(cacheKey),
          message: 'Transaction retrieved from cache',
          metadata: {
            duration: Date.now() - startTime,
            cache_hit: true
          }
        }
      }
      
      // 💾 Read from storage
      const transaction = await this.service.read(type, id)
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${id} not found`)
      }

      // ✅ Skip type validation for supplier transactions (type field used for supplier classification)
      if (transaction.type !== type && type !== 'supplier') {
        throw new Error(`Transaction ${id} is not of type ${type}, found: ${transaction.type}`)
      }
      
      // 💾 Cache for future reads
      this.cache.set(cacheKey, transaction)
      
      // 📝 Add to audit trail
      this.addToHistory('READ', type, transaction.id, 'system', {
        duration: Date.now() - startTime,
        cache_miss: true
      })

      return {
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully',
        metadata: {
          duration: Date.now() - startTime,
          cache_hit: false
        }
      }

    } catch (error) {
      this.metrics.errors++
      console.error(`❌ Read transaction failed (${type}:${id}):`, error.message)
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          duration: Date.now() - startTime,
          failed_at: 'read'
        }
      }
    }
  }

  /**
   * ✏️ UPDATE TRANSACTION - Controlled State Management
   */
  async update(type, id, updates, userId = 'system') {
    const startTime = Date.now()
    const lockKey = `update_${type}_${id}`
    
    try {
      // 🔒 Acquire transaction lock with timeout
      this.acquireLock(lockKey)
      
      // 📖 Get existing transaction (cache-first)
      const existingResult = await this.read(type, id)
      if (!existingResult.success) {
        throw new Error(existingResult.error)
      }
      
      const existing = existingResult.data
      
      // 🔄 Prepare update data with timestamp (following BASE_SCHEMA)
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }

      // � Debug log for supplier type tracking
      if (type === 'supplier') {
        console.log(`🔍 [TransactionEngine] Update Debug - ID: ${id}`)
        console.log('📥 Original updates:', updates)
        console.log('📦 Prepared updateData:', updateData)
        console.log('🎯 Type field value:', updateData.type)
      }

      // �🛡️ Validate updates
      const validation = TransactionValidator.validateForUpdate(type, updateData)
      if (!validation.isValid) {
        throw new Error(`❌ Validation failed: ${validation.errors.join(', ')}`)
      }

      // 🔄 State transition validation
      if (updateData.state && updateData.state !== existing.state) {
        const stateValidation = TransactionValidator.validateStateTransition(
          type, 
          existing.state, 
          updateData.state
        )
        if (!stateValidation.isValid) {
          throw new Error(`❌ State transition failed: ${stateValidation.error}`)
        }
        
        console.log(`🔄 State transition: ${existing.state} → ${updateData.state} (${type}:${id})`)
      }

      // 🔗 Run middleware pipeline
      await this.runMiddleware('beforeUpdate', type, { id, updates: updateData, existing })

      // 🎣 Trigger beforeUpdate hook
      await this.triggerHook('beforeUpdate', type, { id, updates: updateData, existing })

      // 💾 Core storage operation
      const transaction = await this.service.update(type, id, updateData)
      
      // 💾 Update cache
      const cacheKey = `${type}:${id}`
      this.cache.set(cacheKey, transaction)
      
      // � Smart cache invalidation - clear list caches
      this.clearCacheByType(type)
      
      // �📝 Add to audit trail
      this.addToHistory('UPDATE', type, transaction.id, userId, {
        duration: Date.now() - startTime,
        changes: Object.keys(updates),
        state_changed: updateData.state !== existing.state,
        old_state: existing.state,
        new_state: updateData.state
      })
      
      // 🎣 Trigger afterUpdate hook (workflow automation)
      await this.triggerHook('afterUpdate', type, transaction)
      
      // 📊 Update metrics
      this.metrics.updated++
      
      console.log(`✅ Transaction updated: ${id} (${type}) in ${Date.now() - startTime}ms`)
      
      return {
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
        metadata: {
          duration: Date.now() - startTime,
          changes_applied: Object.keys(updates).length,
          status_changed: updateData.status !== existing.status,
          hooks_triggered: this.hooks['afterUpdate']?.length || 0
        }
      }

    } catch (error) {
      this.metrics.errors++
      console.error(`❌ Update transaction failed (${type}:${id}):`, error.message)
      
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          duration: Date.now() - startTime,
          failed_at: 'update'
        }
      }
    } finally {
      // 🔓 Release lock (always, even on error)
      this.releaseLock(lockKey)
    }
  }

  /**
   * Upsert transaction (Create or Update)
   * @param {string} type - Transaction type
   * @param {string} id - Transaction ID (for update) or null (for create)
   * @param {Object} data - Transaction data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Operation result
   */
  async upsert(type, id, data, userId = 'system') {
    try {
      if (id) {
        // Try to read existing record
        const existing = await this.read(type, id)
        if (existing && existing.success) {
          // Record exists, update it
          console.log(`🔄 [TransactionEngine] Upserting existing ${type}:${id}`)
          return await this.update(type, id, data, userId)
        }
      }
      
      // Record doesn't exist or no ID provided, create new
      console.log(`➕ [TransactionEngine] Upserting new ${type}`)
      return await this.create(type, data, userId)
      
    } catch (error) {
      console.error(`❌ [TransactionEngine] Upsert failed for ${type}:${id}:`, error)
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          type,
          id,
          failed_at: 'upsert'
        }
      }
    }
  }

  /**
   * 🗑️ Delete transaction
   */
  async delete(type, id, userId = 'system') {
    const startTime = Date.now()
    const lockKey = `delete_${type}_${id}`
    
    try {
      // 🔒 Acquire transaction lock with timeout
      this.acquireLock(lockKey)
      
      // ตรวจสอบว่าธุรกรรมมีอยู่จริง
      const existing = await this.service.read(type, id)
      if (!existing) {
        throw new Error(`Transaction with ID ${id} not found`)
      }

      // ✅ Skip type validation for supplier transactions (type field used for supplier classification)
      if (existing.type !== type && type !== 'supplier') {
        throw new Error(`Transaction ${id} is not of type ${type}`)
      }

      // ลบธุรกรรม
      await this.service.delete(type, id)
      
      // 🔄 Clear cache
      const cacheKey = `${type}:${id}`
      this.cache.delete(cacheKey)
      
      // 🔄 Smart cache invalidation
      this.clearCacheByType(type)
      
      // 📝 Add to audit trail
      this.addToHistory('DELETE', type, id, userId, {
        duration: Date.now() - startTime
      })
      
      // 📊 Update metrics
      this.metrics.deleted++
      
      console.log(`✅ Transaction deleted: ${id} (${type}) in ${Date.now() - startTime}ms`)
      return {
        success: true,
        data: { id, type },
        message: 'Transaction deleted successfully',
        metadata: {
          duration: Date.now() - startTime
        }
      }

    } catch (error) {
      this.metrics.errors++
      console.error('❌ Delete transaction failed:', error.message)
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          duration: Date.now() - startTime,
          failed_at: 'delete'
        }
      }
    } finally {
      // 🔓 Release lock (always, even on error)
      this.releaseLock(lockKey)
    }
  }

  /**
   * List transactions with filters
   */
  async list(type = null, filters = {}) {
    try {
      const queryFilters = { ...filters }
      if (type) {
        queryFilters.type = type
      }

      const transactions = type 
        ? await this.service.list(type, filters)
        : await this.getAllTransactions(filters)
      
      return {
        success: true,
        data: transactions,
        count: transactions.length,
        message: 'Transactions retrieved successfully'
      }

    } catch (error) {
      console.error('❌ List transactions failed:', error.message)
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0
      }
    }
  }

  /**
   * Aggregate transactions with MongoDB pipeline
   * 📊 Executes aggregation pipeline against transaction data
   * 
   * @param {string} type - Transaction type (e.g., 'PURCHASE', 'SALES')
   * @param {array} pipeline - MongoDB aggregation pipeline stages
   * @returns {array} Aggregated results
   * @throws {Error} If type or pipeline is invalid
   */
  async aggregate(type, pipeline) {
    try {
      // Validate input parameters
      if (!type || typeof type !== 'string') {
        throw new Error('Transaction type must be a non-empty string')
      }

      if (!Array.isArray(pipeline)) {
        throw new Error('Pipeline must be an array of stage objects')
      }

      if (pipeline.length === 0) {
        throw new Error('Pipeline must contain at least one stage')
      }

      // Validate type is supported
      if (!isValidTransactionType(type)) {
        throw new Error(`Invalid transaction type: ${type}`)
      }

      console.log(`📊 [Engine] Aggregating ${type} transactions with ${pipeline.length} stages`)

      // Execute aggregation through service layer
      const result = await this.service.aggregate(type, pipeline)
      
      console.log(`✅ [Engine] Aggregation completed: ${Array.isArray(result) ? result.length : 0} results`)
      
      return result

    } catch (error) {
      console.error('❌ Aggregate transactions failed:', error.message)
      throw error
    }
  }

  /**
   * Change transaction state
   */
  async changeState(type, id, newState, userId = 'system') {
    try {
      const existing = await this.service.read(type, id)
      if (!existing) {
        throw new Error(`Transaction with ID ${id} not found`)
      }

      if (existing.type !== type) {
        throw new Error(`Transaction ${id} is not of type ${type}`)
      }

      // Validate state transition
      const validation = TransactionValidator.validateStateTransition(
        type, 
        existing.state, 
        newState
      )
      if (!validation.isValid) {
        throw new Error(`State transition failed: ${validation.error}`)
      }

      // Update state
      const transaction = await this.service.update(type, id, {
        state: newState,
        updated_by: userId
      })
      
      console.log(`✅ Transaction state changed: ${id} (${existing.state} → ${newState})`)
      return {
        success: true,
        data: transaction,
        message: `Transaction state changed from ${existing.state} to ${newState}`
      }

    } catch (error) {
      console.error('❌ Change state failed:', error.message)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Search transactions
   */
  async search(query, filters = {}) {
    try {
      const transactions = await this.service.search(query, filters)
      
      return {
        success: true,
        data: transactions,
        count: transactions.length,
        message: 'Search completed successfully'
      }

    } catch (error) {
      console.error('❌ Search failed:', error.message)
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0
      }
    }
  }

  /**
   * Get all transactions across types (helper method)
   */
  async getAllTransactions(filters = {}) {
    const allTransactions = []
    
    for (const type of Object.values(TRANSACTION_TYPES)) {
      try {
        const transactions = await this.service.list(type, filters)
        allTransactions.push(...transactions)
      } catch (error) {
        console.warn(`Failed to load ${type} transactions:`, error.message)
      }
    }
    
    return allTransactions
  }

  /**
   * Get statistics
   */
  async getStats(type = null) {
    try {
      if (type) {
        // Get stats for specific type
        const stats = await this.service.getStats(type)
        return {
          success: true,
          data: stats,
          message: `Statistics for ${type} retrieved successfully`
        }
      } else {
        // Get stats for all types
        const allStats = {
          total: 0,
          by_type: {},
          by_state: {},
          storage_size: 0
        }
        
        for (const transactionType of Object.values(TRANSACTION_TYPES)) {
          try {
            const typeStats = await this.service.getStats(transactionType)
            allStats.total += typeStats.total
            allStats.by_type[transactionType] = typeStats.total
            allStats.by_state[transactionType] = typeStats.by_state
            allStats.storage_size += typeStats.storage_size
          } catch (error) {
            console.warn(`Failed to get stats for ${transactionType}:`, error.message)
          }
        }

        return {
          success: true,
          data: allStats,
          message: 'All statistics retrieved successfully'
        }
      }

    } catch (error) {
      console.error('❌ Get stats failed:', error.message)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Clear all data (for development/testing)
   */
  async clearAll() {
    try {
      await this.service.clearAll()
      
      console.log('🧹 All transaction data cleared')
      return {
        success: true,
        message: 'All transaction data cleared successfully'
      }

    } catch (error) {
      console.error('❌ Clear data failed:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Switch storage driver
   */
  switchDriver(driverType, options = {}) {
    try {
      this.service.setDriver(driverType, options)
      this.driverType = driverType
      
      console.log(`✅ Switched to ${driverType} driver`)
      return {
        success: true,
        message: `Successfully switched to ${driverType} driver`
      }
    } catch (error) {
      console.error('❌ Switch driver failed:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 🔧 Apply schema defaults to transaction data
   */
  applySchemaDefaults(type, data) {
    const schema = getSchema(type)
    if (!schema) return data
    
    const result = { ...data }
    
    // Apply default values from schema
    Object.entries(schema).forEach(([field, config]) => {
      if (result[field] === undefined && config.default !== undefined) {
        result[field] = typeof config.default === 'function' 
          ? config.default() 
          : config.default
      }
    })
    
    return result
  }
  
  /**
   * 🔗 Run middleware pipeline
   */
  async runMiddleware(event, type, data) {
    for (const middleware of this.middleware) {
      if (middleware.events?.includes(event)) {
        await middleware.handler(type, data, event)
      }
    }
  }
  
  /**
   * 📝 Add to audit trail
   */
  addToHistory(action, type, id, userId, metadata = {}) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      action,
      type,
      id,
      userId,
      metadata
    }
    
    this.history.push(historyEntry)
    
    // Keep only last 1000 entries
    if (this.history.length > 1000) {
      this.history.shift()
    }
  }
  
  /**
   * 🔌 Register middleware
   */
  use(middleware) {
    this.middleware.push(middleware)
    console.log(`📦 Middleware registered: ${middleware.name || 'anonymous'}`)
  }
  
  /**
   * 📊 Get comprehensive metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      cache_size: this.cache.size,
      cache_stats: this.getCacheStatistics(),
      history_entries: this.history.length,
      active_locks: this.locks.size,
      lock_stats: this.getLockStatistics(),
      hooks_registered: Object.keys(this.hooks).length,
      middleware_count: this.middleware.length
    }
  }

  /**
   * 📊 Get lock statistics
   * @returns {object} Lock statistics
   */
  getLockStatistics() {
    const stats = {
      activeLocks: this.locks.size,
      locks: [],
      totalTimeouts: this.metrics.lockTimeouts
    }
    
    for (const [lockKey, lockInfo] of this.locks.entries()) {
      stats.locks.push({
        lockKey,
        age: Date.now() - lockInfo.startTime,
        timeout: lockInfo.timeout,
        remainingTime: lockInfo.timeout - (Date.now() - lockInfo.startTime)
      })
    }
    
    // Sort by age (oldest first)
    stats.locks.sort((a, b) => b.age - a.age)
    
    return stats
  }
  
  /**
   * 🧹 Clear cache
   */
  clearCache(type = null) {
    if (type) {
      // Clear specific type
      const keysToDelete = []
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${type}:`)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key))
      console.log(`🧹 Cleared ${keysToDelete.length} cache entries for ${type}`)
    } else {
      // Clear all cache
      const size = this.cache.size
      this.cache.clear()
      console.log(`🧹 Cleared ${size} cache entries`)
    }
  }

  /**
   * 🔄 Smart cache invalidation by type
   * Clears all cache entries related to a specific transaction type
   * @param {string} type - Transaction type
   */
  clearCacheByType(type) {
    let cleared = 0
    
    // Clear all cached entries for this type
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        this.cache.delete(key)
        cleared++
      }
    }
    
    if (cleared > 0) {
      console.log(`🔄 Auto-invalidated ${cleared} cache entries for type: ${type}`)
    }
  }

  /**
   * 📊 Get cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStatistics() {
    const stats = {
      totalEntries: this.cache.size,
      byType: {},
      totalSizeBytes: 0
    }
    
    for (const [key, value] of this.cache.entries()) {
      const type = key.split(':')[0]
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, sizeBytes: 0 }
      }
      stats.byType[type].count++
      
      const sizeBytes = JSON.stringify(value).length
      stats.byType[type].sizeBytes += sizeBytes
      stats.totalSizeBytes += sizeBytes
    }
    
    return stats
  }
  
  /**
   * 📜 Get audit history
   */
  getHistory(filters = {}) {
    let history = [...this.history]
    
    if (filters.type) {
      history = history.filter(entry => entry.type === filters.type)
    }
    
    if (filters.action) {
      history = history.filter(entry => entry.action === filters.action)
    }
    
    if (filters.userId) {
      history = history.filter(entry => entry.userId === filters.userId)
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit)
    }
    
    return history
  }

  /**
   * � Execute Module Function (Core-Only Access)
   * ทางเดียวในการเรียก module functions
   */
  async executeModuleFunction(moduleType, functionName, ...args) {
    const startTime = Date.now()
    
    try {
      // ✅ Special case: Engine methods (transactionEngine)
      if (moduleType === 'transactionEngine') {
        if (!this[functionName] || typeof this[functionName] !== 'function') {
          throw new Error(`Engine method '${functionName}' not found`)
        }
        
        console.log(`🎯 Executing engine method: ${functionName} with args:`, args)
        
        // 🎯 Execute engine method directly
        const result = await this[functionName](...args)
        
        const duration = Date.now() - startTime
        console.log(`✅ Engine method executed: ${functionName} in ${duration}ms`)
        
        return result // Return direct result (already formatted by engine methods)
      }
      
      // ✅ Special case: Cross-module operations
      if (moduleType === 'crossModule') {
        return await this.handleCrossModuleOperation(functionName, ...args)
      }
      
      // ✅ Validate module type for regular modules
      if (!isValidTransactionType(moduleType)) {
        throw new Error(`Invalid module type: ${moduleType}`)
      }
      
      // 🔍 Load module dynamically
      const module = await this.getModule(moduleType)
      if (!module || !module[functionName]) {
        throw new Error(`Function '${functionName}' not found in '${moduleType}' module`)
      }
      
      // 📝 Audit trail for module function calls
      this.addToHistory('MODULE_FUNCTION', moduleType, functionName, 'system', {
        args: args.length,
        duration: 0
      })
      
      // 🎯 Execute pure function
      const result = await module[functionName](...args)
      
      // 📊 Update metrics
      const duration = Date.now() - startTime
      this.addToHistory('MODULE_FUNCTION', moduleType, functionName, 'system', {
        args: args.length,
        duration,
        success: true
      })
      
      console.log(`✅ Module function executed: ${moduleType}.${functionName} in ${duration}ms`)
      
      return {
        success: true,
        data: result,
        message: `Module function ${functionName} executed successfully`,
        metadata: {
          module: moduleType,
          function: functionName,
          duration
        }
      }
      
    } catch (error) {
      this.metrics.errors++
      console.error(`❌ Module function failed (${moduleType}.${functionName}):`, error.message)
      
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          module: moduleType,
          function: functionName,
          duration: Date.now() - startTime,
          failed_at: 'module_execution'
        }
      }
    }
  }

  /**
   * 🔗 Handle Cross-Module Operations
   * จัดการ operations ข้าม modules ตาม AI Guidelines Rule #4
   */
  async handleCrossModuleOperation(operationName, ...args) {
    const startTime = Date.now()
    
    try {
      switch (operationName) {
        case 'handleInventoryReceipt': {
          const [operations] = args
          console.log('🔗 Cross-module: Purchase → Inventory receipt:', operations)
          
          // สร้าง inventory transactions สำหรับแต่ละ item
          const inventoryResults = []
          
          for (const item of operations.items || []) {
            const inventoryTxn = {
              subtype: 'goods_receipt',
              reference_id: operations.grn_id,
              reference_po_id: operations.po_id,
              product_id: item.product_id,
              quantity: item.received_quantity,
              unit_price: item.unit_price,
              total_amount: item.received_quantity * item.unit_price,
              warehouse_location: operations.warehouse_location,
              transaction_date: operations.received_date,
              created_by: operations.received_by
            }
            
            const result = await this.create('inventory', inventoryTxn)
            inventoryResults.push(result)
          }
          
          return {
            success: true,
            data: inventoryResults,
            message: 'Inventory receipt processed via cross-module operation'
          }
        }
        
        case 'handleAccountsPayable': {
          const [operations] = args
          console.log('🔗 Cross-module: Purchase → Finance AP:', operations)
          
          const financeData = {
            subtype: 'accounts_payable',
            reference_id: operations.invoice_id,
            reference_po_id: operations.po_id,
            vendor_id: operations.vendor_id,
            amount: operations.amount,
            status: 'unpaid',
            due_date: operations.due_date,
            created_date: new Date().toISOString(),
            created_by: operations.created_by
          }
          
          const result = await this.create('finance', financeData)
          
          return {
            success: true,
            data: result,
            message: 'Accounts payable processed via cross-module operation'
          }
        }
        
        default:
          throw new Error(`Unknown cross-module operation: ${operationName}`)
      }
      
    } catch (error) {
      console.error(`❌ Cross-module operation failed (${operationName}):`, error.message)
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          operation: operationName,
          duration: Date.now() - startTime
        }
      }
    }
  }

  /**
   * 📦 Get Module (Dynamic Import)
   * ระบบ module loading ที่ปลอดภัย
   */
  async getModule(moduleType) {
    try {
      // 🎯 Type-safe module mapping
      const moduleMap = {
        [TRANSACTION_TYPES.INVENTORY]: () => import('./masterdata/inventory/data.js'),
        [TRANSACTION_TYPES.PURCHASE]: () => import('./masterdata/purchase/data.js'),
        [TRANSACTION_TYPES.SALES]: () => import('./masterdata/sales/data.js'),
        [TRANSACTION_TYPES.DELIVERY]: () => import('./masterdata/delivery/data.js'),
        [TRANSACTION_TYPES.WORK_ORDER]: () => import('./masterdata/workorder/data.js'),
        [TRANSACTION_TYPES.PRODUCTION]: () => import('./masterdata/production/data.js'),
        [TRANSACTION_TYPES.RETURNS]: () => import('./masterdata/returns/data.js'),
        [TRANSACTION_TYPES.QUOTATION]: () => import('./masterdata/quotation/data.js'),
        [TRANSACTION_TYPES.PAYMENT]: () => import('./masterdata/payment/data.js'),
        [TRANSACTION_TYPES.SUPPLIER]: () => import('./masterdata/supplier/data.js'),
        [TRANSACTION_TYPES.CODE_MANAGEMENT]: () => import('./masterdata/codeManagement/data.js'),
        [TRANSACTION_TYPES.STOCK_LOCATION]: () => import('./masterdata/inventory/stock_locations/data.js'),
        [TRANSACTION_TYPES.INVENTORY_BALANCE]: () => import('./masterdata/inventory/balance/data.js'),
        [TRANSACTION_TYPES.HR]: () => import('./masterdata/hr/data.js'),
        [TRANSACTION_TYPES.HR_EMPLOYEE]: () => import('./masterdata/hr/data.js'),
        [TRANSACTION_TYPES.HR_USER]: () => import('./masterdata/hr/data.js'),
        [TRANSACTION_TYPES.HR_DEPARTMENT]: () => import('./masterdata/hr/data.js'),
        [TRANSACTION_TYPES.HR_POSITION]: () => import('./masterdata/hr/data.js')
      }
      
      const moduleLoader = moduleMap[moduleType]
      if (!moduleLoader) {
        throw new Error(`No module loader found for type: ${moduleType}`)
      }
      
      // 💾 Cache module if not already cached
      const cacheKey = `module:${moduleType}`
      if (!this.cache.has(cacheKey)) {
        const moduleExports = await moduleLoader()
        this.cache.set(cacheKey, moduleExports)
      }
      
      return this.cache.get(cacheKey)
      
    } catch (error) {
      console.error(`Failed to load module ${moduleType}:`, error.message)
      throw new Error(`Module loading failed: ${moduleType}`)
    }
  }

  /**
   * �📊 Get engine information
   */
  getInfo() {
    return {
      engine: 'TransactionEngine',
      version: '2.1.0',
      architecture: 'Core Control Layer',
      driver: this.service.getDriverInfo(),
      supported_types: Object.values(TRANSACTION_TYPES),
      features: [
        'Single Source of Truth',
        'Type-based Routing',
        'Event-driven Hooks',
        'Middleware Pipeline',
        'Schema Validation',
        'State Machine Control',
        'Audit Trail',
        'Performance Metrics',
        'Auto-timeout Locking',
        'Smart Cache Invalidation',
        'Intelligent Caching'
      ],
      config: {
        lockTimeout: this.LOCK_TIMEOUT,
        lockWarningThreshold: this.LOCK_WARNING_THRESHOLD,
        driverType: this.driverType
      },
      metrics: this.getMetrics()
    }
  }
}

// Export singleton instances for convenience
export const localTransactionEngine = new TransactionEngine('local')
export const apiTransactionEngine = new TransactionEngine('api')

// Default export (local driver)
export default localTransactionEngine