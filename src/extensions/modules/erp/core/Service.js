/**
 * Transaction Service
 * ตัวกลาง (middleware) ระหว่าง Engine กับ Driver
 * รองรับการสลับ Storage Driver ได้
 */

import { LocalStorageDriver } from './drivers/LocalStorageDriver.js'
import { ApiDriver } from './drivers/ApiDriver.js'
import { isValidTransactionType, TRANSACTION_TYPES } from './Types.js'

export class TransactionService {
  constructor(driverType = 'local', options = {}) {
    this.options = options
    this.setDriver(driverType, options)
  }

  /**
   * Set storage driver
   */
  setDriver(driverType, options = {}) {
    switch (driverType) {
      case 'local':
        this.driver = new LocalStorageDriver()
        break
      case 'api':
        // ApiDriver ต้องการ vueApp (ที่มี $Request)
        try {
          this.driver = new ApiDriver(options.vueApp, {
            baseEndpoint: options.baseEndpoint || 'transaction',
            clientKey: options.clientKey || null,
            allowedTypes: options.allowedTypes
          })
        } catch (error) {
          console.error('❌ Failed to initialize API driver:', error.message)
          console.warn('⚠️ Falling back to LocalStorageDriver')
          this.driver = new LocalStorageDriver()
          this.driverType = 'local'
          return
        }
        break
      default:
        throw new Error(`Unknown driver type: ${driverType}`)
    }
    
    this.driverType = driverType
    console.log(`✅ TransactionService using ${driverType} driver`)
  }

  /**
   * Validate transaction type
   */
  validateType(type) {
    if (!isValidTransactionType(type)) {
      throw new Error(`Invalid transaction type: ${type}`)
    }
  }

  /**
   * Create new transaction
   */
  async create(type, transaction) {
    this.validateType(type)
    return await this.driver.create(type, transaction)
  }

  /**
   * Read transaction by ID
   */
  async read(type, id) {
    this.validateType(type)
    const result = await this.driver.read(type, id)
    
    // Extract data from API response wrapper (for ApiDriver compatibility)
    return result && result.data ? result.data : result
  }

  /**
   * Update transaction
   */
  async update(type, id, updates) {
    this.validateType(type)
    const result = await this.driver.update(type, id, updates)
    
    // Extract data from API response wrapper (for ApiDriver compatibility)
    return result && result.data ? result.data : result
  }

  /**
   * Delete transaction
   */
  async delete(type, id) {
    this.validateType(type)
    return await this.driver.delete(type, id)
  }

  /**
   * List transactions with filters
   */
  async list(type, filters = {}) {
    this.validateType(type)
    return await this.driver.list(type, filters)
  }

  /**
   * Count transactions
   */
  async count(type, filters = {}) {
    this.validateType(type)
    return await this.driver.count(type, filters)
  }

  /**
   * Get statistics
   */
  async getStats(type) {
    this.validateType(type)
    return await this.driver.getStats(type)
  }

  /**
   * Search transactions (if supported by driver)
   */
  async search(query, filters = {}) {
    if (this.driver.search) {
      return await this.driver.search(query, filters)
    } else {
      // Fallback: search across all types manually
      const results = []
      const types = Object.values(TRANSACTION_TYPES)
      
      for (const type of types) {
        try {
          const transactions = await this.list(type, { search: query, ...filters })
          results.push(...transactions)
        } catch (error) {
          console.warn(`Search failed for type ${type}:`, error)
        }
      }
      
      return results
    }
  }

  /**
   * Aggregate transactions with MongoDB pipeline
   * 📊 Executes aggregation pipeline against transaction data
   * 
   * @param {string} type - Transaction type
   * @param {array} pipeline - MongoDB aggregation pipeline stages
   * @returns {array} Aggregated results
   */
  async aggregate(type, pipeline) {
    this.validateType(type)
    
    if (this.driver.aggregate) {
      return await this.driver.aggregate(type, pipeline)
    } else {
      throw new Error('Aggregation not supported by current driver')
    }
  }

  /**
   * Batch operations (if supported by driver)
   */
  async batch(operations) {
    if (this.driver.batch) {
      return await this.driver.batch(operations)
    } else {
      // Fallback: execute operations sequentially
      const results = []
      
      for (const operation of operations) {
        try {
          const { method, type, id, data } = operation
          let result
          
          switch (method) {
            case 'create':
              result = await this.create(type, data)
              break
            case 'read':
              result = await this.read(type, id)
              break
            case 'update':
              result = await this.update(type, id, data)
              break
            case 'delete':
              result = await this.delete(type, id)
              break
            default:
              throw new Error(`Unknown batch operation: ${method}`)
          }
          
          results.push({ success: true, data: result })
        } catch (error) {
          results.push({ success: false, error: error.message })
        }
      }
      
      return results
    }
  }

  /**
   * Clear data for a type
   */
  async clear(type) {
    this.validateType(type)
    return await this.driver.clear(type)
  }

  /**
   * Clear all data
   */
  async clearAll() {
    return await this.driver.clearAll()
  }

  /**
   * Export data
   */
  async export(type) {
    this.validateType(type)
    return await this.driver.export(type)
  }

  /**
   * Import data
   */
  async import(type, data) {
    this.validateType(type)
    return await this.driver.import(type, data)
  }

  /**
   * Health check
   */
  async healthCheck() {
    return await this.driver.healthCheck()
  }

  /**
   * Get driver information
   */
  getDriverInfo() {
    return {
      type: this.driverType,
      driver: this.driver.constructor.name
    }
  }
}

// Export singleton instances for convenience
export const localTransactionService = new TransactionService('local')
export const apiTransactionService = new TransactionService('api')

// Default export (local driver)
export default localTransactionService