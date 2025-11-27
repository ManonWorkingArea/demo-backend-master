/**
 * LocalStorage Driver
 * จัดการข้อมูลผ่าน localStorage สำหรับ ERP Core
 */

import { STORAGE_KEYS } from '../Types.js'

export class LocalStorageDriver {
  constructor() {
    this.prefix = 'erp_'
    // localStorage quota limit (5MB default, some browsers allow 10MB)
    this.MAX_SIZE = 5 * 1024 * 1024 // 5MB in bytes
    this.WARNING_THRESHOLD = 0.8 // Warn at 80% capacity
  }

  /**
   * Generate unique ID
   */
  generateId(type) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${type}_${timestamp}_${random}`
  }

  /**
   * Get storage key for transaction type
   */
  getStorageKey(type) {
    return STORAGE_KEYS[type] || `${this.prefix}${type}_transactions`
  }

  /**
   * Load data from localStorage
   */
  loadData(type) {
    try {
      const key = this.getStorageKey(type)
      const stored = localStorage.getItem(key)
      
      if (!stored) {
        return {}
      }

      // Attempt to parse JSON
      return JSON.parse(stored)
      
    } catch (error) {
      console.error(`Failed to load ${type} transactions from localStorage:`, error)
      
      // Handle specific JSON parsing errors
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.warn(`🚨 [LocalStorageDriver] JSON corruption detected in ${type} data`)
        console.warn(`📍 Error position: ${error.message}`)
        
        // Try to recover by creating backup and clearing corrupted data
        this.handleCorruptedData(type, error)
        
        return {}
      }
      
      // Other types of errors
      console.warn(`⚠️ [LocalStorageDriver] Unknown error loading ${type}:`, error)
      return {}
    }
  }

  /**
   * Calculate size of data in bytes
   */
  calculateSize(data) {
    try {
      const jsonString = JSON.stringify(data)
      // In JavaScript, each character in a string is 2 bytes (UTF-16)
      return new Blob([jsonString]).size
    } catch (error) {
      console.error('Failed to calculate data size:', error)
      return 0
    }
  }

  /**
   * Get current total localStorage usage
   */
  getTotalStorageSize() {
    let total = 0
    try {
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith(this.prefix)) {
          total += new Blob([localStorage.getItem(key)]).size
        }
      }
    } catch (error) {
      console.error('Failed to calculate total storage size:', error)
    }
    return total
  }

  /**
   * Check if storage has enough space
   */
  checkStorageCapacity(newDataSize) {
    const currentSize = this.getTotalStorageSize()
    const projectedSize = currentSize + newDataSize
    const usagePercent = (projectedSize / this.MAX_SIZE) * 100

    if (projectedSize > this.MAX_SIZE) {
      return {
        hasSpace: false,
        currentSize,
        newDataSize,
        projectedSize,
        maxSize: this.MAX_SIZE,
        usagePercent,
        message: `Storage quota exceeded! Projected: ${(projectedSize / 1024 / 1024).toFixed(2)}MB / Max: ${(this.MAX_SIZE / 1024 / 1024).toFixed(2)}MB`
      }
    }

    if (projectedSize > this.MAX_SIZE * this.WARNING_THRESHOLD) {
      console.warn(`⚠️ [LocalStorageDriver] Storage usage at ${usagePercent.toFixed(1)}% (${(projectedSize / 1024 / 1024).toFixed(2)}MB / ${(this.MAX_SIZE / 1024 / 1024).toFixed(2)}MB)`)
    }

    return {
      hasSpace: true,
      currentSize,
      newDataSize,
      projectedSize,
      maxSize: this.MAX_SIZE,
      usagePercent,
      message: `Storage OK: ${usagePercent.toFixed(1)}% used`
    }
  }

  /**
   * Save data to localStorage with size checking
   */
  saveData(type, data) {
    try {
      const key = this.getStorageKey(type)
      const dataSize = this.calculateSize(data)
      
      // Check storage capacity before saving
      const capacityCheck = this.checkStorageCapacity(dataSize)
      
      if (!capacityCheck.hasSpace) {
        const error = new Error(capacityCheck.message)
        error.code = 'QUOTA_EXCEEDED'
        error.details = {
          currentSize: capacityCheck.currentSize,
          newDataSize: capacityCheck.newDataSize,
          projectedSize: capacityCheck.projectedSize,
          maxSize: capacityCheck.maxSize,
          usagePercent: capacityCheck.usagePercent
        }
        
        console.error(`🚨 [LocalStorageDriver] ${capacityCheck.message}`)
        console.error(`📊 Current: ${(capacityCheck.currentSize / 1024 / 1024).toFixed(2)}MB`)
        console.error(`📦 New data: ${(capacityCheck.newDataSize / 1024 / 1024).toFixed(2)}MB`)
        console.error(`💡 Suggestion: Clear old data with cleanupCorruptedBackups() or export data`)
        
        throw error
      }
      
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      // Handle QuotaExceededError specifically
      if (error.name === 'QuotaExceededError' || error.code === 'QUOTA_EXCEEDED') {
        console.error(`❌ [LocalStorageDriver] Storage quota exceeded for ${type}`)
        console.error(`💡 Try: 1) Clear old backups 2) Export and archive data 3) Use API driver instead`)
      }
      
      console.error(`Failed to save ${type} transactions to localStorage:`, error)
      throw error // Re-throw to let caller handle
    }
  }

  /**
   * Handle corrupted data by creating backup and clearing
   */
  handleCorruptedData(type, error) {
    try {
      const key = this.getStorageKey(type)
      const corrupted = localStorage.getItem(key)
      
      if (corrupted) {
        // Create backup of corrupted data for potential recovery
        const backupKey = `${key}_corrupted_${Date.now()}`
        localStorage.setItem(backupKey, corrupted)
        
        console.warn(`💾 [LocalStorageDriver] Corrupted data backed up to: ${backupKey}`)
        console.warn(`📝 [LocalStorageDriver] Error details:`, error.message)
        
        // Try to extract valid JSON portions if possible
        const recoveredData = this.attemptDataRecovery(corrupted)
        
        if (Object.keys(recoveredData).length > 0) {
          console.log(`🔧 [LocalStorageDriver] Recovered ${Object.keys(recoveredData).length} transactions`)
          this.saveData(type, recoveredData)
        } else {
          // Clear corrupted data completely
          localStorage.removeItem(key)
          console.warn(`🗑️ [LocalStorageDriver] Cleared corrupted ${type} data`)
        }
      }
    } catch (recoveryError) {
      console.error(`❌ [LocalStorageDriver] Failed to handle corruption:`, recoveryError)
    }
  }

  /**
   * Attempt to recover partial data from corrupted JSON
   */
  attemptDataRecovery(corruptedString) {
    try {
      // Try to find valid JSON objects in the corrupted string
      const recovered = {}
      
      // Look for transaction patterns like "transaction_id": {
      const transactionPattern = /"([^"]+)":\s*\{[^}]*\}/g
      let match
      
      while ((match = transactionPattern.exec(corruptedString)) !== null) {
        try {
          const transactionId = match[1]
          const transactionJson = `{${match[0]}}`
          const parsed = JSON.parse(transactionJson)
          
          if (parsed[transactionId]) {
            recovered[transactionId] = parsed[transactionId]
          }
        } catch (e) {
          // Skip invalid transactions
          continue
        }
      }
      
      if (Object.keys(recovered).length > 0) {
        console.log(`🔍 [LocalStorageDriver] Recovery attempt found ${Object.keys(recovered).length} valid transactions`)
      }
      
      return recovered
    } catch (error) {
      console.warn(`❌ [LocalStorageDriver] Data recovery failed:`, error)
      return {}
    }
  }

  /**
   * Create new transaction
   */
  async create(type, transaction) {
    const data = this.loadData(type)
    const id = this.generateId(type)
    const now = new Date().toISOString()

    const newTransaction = {
      ...transaction,
      id,
      type,
      created_at: now,
      updated_at: now
    }

    data[id] = newTransaction
    const saved = this.saveData(type, data)
    
    if (saved) {
      return newTransaction
    } else {
      throw new Error(`Failed to create ${type} transaction`)
    }
  }

  /**
   * Read transaction by ID
   */
  async read(type, id) {
    const data = this.loadData(type)
    return data[id] || null
  }

  /**
   * Update transaction
   */
  async update(type, id, updates) {
    const data = this.loadData(type)
    const existing = data[id]
    
    if (!existing) {
      throw new Error(`Transaction ${id} not found`)
    }

    const updatedTransaction = {
      ...existing,
      ...updates,
      id, // Ensure ID cannot be changed
      // ✅ ไม่ override type field สำหรับ supplier (เพื่อให้สามารถเปลี่ยน supplier type ได้)
      ...(type === 'supplier' ? {} : { type }), // Only override type for non-supplier transactions
      created_at: existing.created_at, // Preserve creation time
      updated_at: new Date().toISOString()
    }

    // 🐛 Debug log for supplier type tracking
    if (type === 'supplier') {
      console.log(`🔍 [LocalStorageDriver] Update Debug - ID: ${id}`)
      console.log('📥 Updates received:', updates)
      console.log('🔄 Final transaction:', updatedTransaction)
      console.log('🎯 Final type field:', updatedTransaction.type)
    }

    data[id] = updatedTransaction
    const saved = this.saveData(type, data)
    
    if (saved) {
      return updatedTransaction
    } else {
      throw new Error(`Failed to update ${type} transaction ${id}`)
    }
  }

  /**
   * Delete transaction
   */
  async delete(type, id) {
    const data = this.loadData(type)
    
    if (!data[id]) {
      throw new Error(`Transaction ${id} not found`)
    }

    delete data[id]
    const saved = this.saveData(type, data)
    
    if (saved) {
      return true
    } else {
      throw new Error(`Failed to delete ${type} transaction ${id}`)
    }
  }

  /**
   * List all transactions with filtering
   */
  async list(type, filters = {}) {
    const data = this.loadData(type)
    let transactions = Object.values(data)

    // Apply filters
    if (filters.state) {
      transactions = transactions.filter(t => t.state === filters.state)
    }

    if (filters.created_by) {
      transactions = transactions.filter(t => t.created_by === filters.created_by)
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from)
      transactions = transactions.filter(t => new Date(t.created_at) >= fromDate)
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to)
      transactions = transactions.filter(t => new Date(t.created_at) <= toDate)
    }

    // Apply search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      transactions = transactions.filter(t => {
        const searchFields = ['id', 'supplier', 'customer', 'items']
        return searchFields.some(field => {
          const value = t[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search)
          }
          if (Array.isArray(value)) {
            return JSON.stringify(value).toLowerCase().includes(search)
          }
          return false
        })
      })
    }

    // Apply sorting
    if (filters.sort_by) {
      const { field, order = 'desc' } = filters.sort_by
      transactions.sort((a, b) => {
        let valueA = a[field]
        let valueB = b[field]

        // Handle dates
        if (field === 'created_at' || field === 'updated_at') {
          valueA = new Date(valueA)
          valueB = new Date(valueB)
        }

        if (order === 'desc') {
          return valueB > valueA ? 1 : valueB < valueA ? -1 : 0
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
        }
      })
    }

    // Apply pagination
    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit
      const end = start + filters.limit
      transactions = transactions.slice(start, end)
    }

    return transactions
  }

  /**
   * Count transactions
   */
  async count(type, filters = {}) {
    const transactions = await this.list(type, { ...filters, page: undefined, limit: undefined })
    return transactions.length
  }

  /**
   * Get statistics
   */
  async getStats(type) {
    const data = this.loadData(type)
    const transactions = Object.values(data)
    const dataSize = this.calculateSize(data)
    
    const stats = {
      total: transactions.length,
      by_state: {},
      storage_size: dataSize,
      storage_size_mb: (dataSize / 1024 / 1024).toFixed(2)
    }

    // Count by state
    transactions.forEach(transaction => {
      const state = transaction.state
      stats.by_state[state] = (stats.by_state[state] || 0) + 1
    })

    return stats
  }

  /**
   * Get overall storage statistics
   */
  getStorageStats() {
    const totalSize = this.getTotalStorageSize()
    const usagePercent = (totalSize / this.MAX_SIZE) * 100
    const availableSpace = this.MAX_SIZE - totalSize
    
    return {
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      maxSize: this.MAX_SIZE,
      maxSizeMB: (this.MAX_SIZE / 1024 / 1024).toFixed(2),
      availableSpace,
      availableSpaceMB: (availableSpace / 1024 / 1024).toFixed(2),
      usagePercent: usagePercent.toFixed(2),
      status: usagePercent > 90 ? 'critical' : usagePercent > 80 ? 'warning' : 'ok',
      recommendation: usagePercent > 90 
        ? 'URGENT: Clear data immediately or switch to API driver'
        : usagePercent > 80 
        ? 'WARNING: Consider clearing old backups'
        : 'Storage usage is healthy'
    }
  }

  /**
   * Clear all data for a type (for testing)
   */
  async clear(type) {
    const key = this.getStorageKey(type)
    localStorage.removeItem(key)
    return true
  }

  /**
   * Clear all ERP data (for testing)
   */
  async clearAll() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
    keys.forEach(key => localStorage.removeItem(key))
    return true
  }

  /**
   * Export data for backup
   */
  async export(type) {
    return this.loadData(type)
  }

  /**
   * Import data from backup
   */
  async import(type, data) {
    return this.saveData(type, data)
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const testKey = `${this.prefix}health_check`
      const testData = { timestamp: Date.now() }
      
      localStorage.setItem(testKey, JSON.stringify(testData))
      const retrieved = JSON.parse(localStorage.getItem(testKey))
      localStorage.removeItem(testKey)
      
      return retrieved.timestamp === testData.timestamp
    } catch (error) {
      return false
    }
  }

  /**
   * List all corrupted backups
   */
  getCorruptedBackups() {
    const backups = []
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix) && key.includes('_corrupted_')
    )
    
    keys.forEach(key => {
      const timestamp = key.split('_corrupted_')[1]
      const originalKey = key.replace(`_corrupted_${timestamp}`, '')
      const type = originalKey.replace(this.prefix, '').replace('_transactions', '')
      
      backups.push({
        key,
        originalKey,
        type,
        timestamp: parseInt(timestamp),
        date: new Date(parseInt(timestamp)).toLocaleString(),
        size: localStorage.getItem(key)?.length || 0
      })
    })
    
    return backups.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Manually restore from corrupted backup
   */
  async restoreFromBackup(backupKey) {
    try {
      const corruptedData = localStorage.getItem(backupKey)
      if (!corruptedData) {
        throw new Error('Backup not found')
      }
      
      // Extract type from backup key
      const type = backupKey.replace(this.prefix, '').split('_corrupted_')[0].replace('_transactions', '')
      
      console.log(`🔄 [LocalStorageDriver] Attempting manual restore for ${type}`)
      
      // Try to recover data
      const recoveredData = this.attemptDataRecovery(corruptedData)
      
      if (Object.keys(recoveredData).length > 0) {
        const success = this.saveData(type, recoveredData)
        if (success) {
          console.log(`✅ [LocalStorageDriver] Successfully restored ${Object.keys(recoveredData).length} transactions`)
          return recoveredData
        }
      }
      
      throw new Error('No recoverable data found')
      
    } catch (error) {
      console.error(`❌ [LocalStorageDriver] Restore failed:`, error)
      throw error
    }
  }

  /**
   * Clean up old corrupted backups
   */
  cleanupCorruptedBackups(daysOld = 7) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    const backups = this.getCorruptedBackups()
    let cleaned = 0
    
    backups.forEach(backup => {
      if (backup.timestamp < cutoff) {
        localStorage.removeItem(backup.key)
        cleaned++
      }
    })
    
    console.log(`🧹 [LocalStorageDriver] Cleaned up ${cleaned} old corrupted backups`)
    return cleaned
  }
}