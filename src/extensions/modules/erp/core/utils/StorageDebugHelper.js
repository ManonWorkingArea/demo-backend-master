/**
 * Storage Debug Helper
 * เครื่องมือช่วยดีบัก localStorage และการจัดการข้อมูลที่เสียหาย
 */

import { LocalStorageDriver } from '../drivers/LocalStorageDriver.js'
import { TRANSACTION_TYPES, STORAGE_KEYS } from '../Types.js'

export class StorageDebugHelper {
  constructor() {
    this.driver = new LocalStorageDriver()
  }

  /**
   * แสดงสถานะ localStorage ทั้งหมด
   */
  getStorageStatus() {
    const status = {
      totalSize: this.getTotalStorageSize(),
      transactions: {},
      corrupted: this.driver.getCorruptedBackups(),
      health: {}
    }

    // ตรวจสอบแต่ละประเภทธุรกรรม
    Object.values(TRANSACTION_TYPES).forEach(type => {
      const key = STORAGE_KEYS[type] || `erp_${type}_transactions`
      const stored = localStorage.getItem(key)
      
      status.transactions[type] = {
        exists: !!stored,
        size: stored ? stored.length : 0,
        isValid: this.isValidJSON(stored),
        recordCount: this.getRecordCount(type)
      }
    })

    return status
  }

  /**
   * ตรวจสอบความถูกต้องของ JSON
   */
  isValidJSON(jsonString) {
    if (!jsonString) return true // Empty is valid

    try {
      JSON.parse(jsonString)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * นับจำนวนรายการในประเภทธุรกรรม
   */
  getRecordCount(type) {
    try {
      const data = this.driver.loadData(type)
      return Object.keys(data).length
    } catch (error) {
      return 0
    }
  }

  /**
   * คำนวณขนาด localStorage ทั้งหมด
   */
  getTotalStorageSize() {
    let total = 0
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  /**
   * แสดงข้อมูลที่เสียหายทั้งหมด
   */
  getCorruptionReport() {
    const backups = this.driver.getCorruptedBackups()
    const report = {
      total: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      byType: {},
      oldestCorruption: null,
      newestCorruption: null
    }

    if (backups.length > 0) {
      report.oldestCorruption = backups[backups.length - 1]
      report.newestCorruption = backups[0]

      // จัดกลุ่มตามประเภท
      backups.forEach(backup => {
        if (!report.byType[backup.type]) {
          report.byType[backup.type] = {
            count: 0,
            totalSize: 0,
            backups: []
          }
        }
        
        report.byType[backup.type].count++
        report.byType[backup.type].totalSize += backup.size
        report.byType[backup.type].backups.push(backup)
      })
    }

    return report
  }

  /**
   * ทำความสะอาดข้อมูลที่เสียหาย
   */
  async cleanupCorruption() {
    console.log('🧹 [StorageDebugHelper] Starting corruption cleanup...')
    
    // ทำความสะอาดข้อมูลสำรองเก่า
    const cleaned = this.driver.cleanupCorruptedBackups(7) // 7 วันที่แล้ว
    
    // ตรวจสอบข้อมูลที่เสียหายปัจจุบัน
    const status = this.getStorageStatus()
    const corruptedTypes = []
    
    Object.entries(status.transactions).forEach(([type, info]) => {
      if (info.exists && !info.isValid) {
        corruptedTypes.push(type)
      }
    })

    if (corruptedTypes.length > 0) {
      console.warn(`⚠️ [StorageDebugHelper] Found ${corruptedTypes.length} corrupted transaction types:`, corruptedTypes)
      
      // พยายามกู้คืนข้อมูลที่เสียหาย
      const recoveryResults = []
      
      for (const type of corruptedTypes) {
        try {
          console.log(`🔧 [StorageDebugHelper] Attempting recovery for ${type}...`)
          
          // โหลดข้อมูลจะทำให้เกิดการจัดการข้อมูลที่เสียหายอัตโนมัติ
          const data = this.driver.loadData(type)
          
          recoveryResults.push({
            type,
            success: true,
            recoveredRecords: Object.keys(data).length,
            message: `Recovered ${Object.keys(data).length} records`
          })
          
        } catch (error) {
          recoveryResults.push({
            type,
            success: false,
            error: error.message,
            message: `Recovery failed: ${error.message}`
          })
        }
      }
      
      return {
        cleanedBackups: cleaned,
        corruptedTypes: corruptedTypes.length,
        recoveryResults
      }
    }

    return {
      cleanedBackups: cleaned,
      corruptedTypes: 0,
      recoveryResults: []
    }
  }

  /**
   * สร้างรายงานสุขภาพ localStorage
   */
  async generateHealthReport() {
    console.log('📋 [StorageDebugHelper] Generating storage health report...')
    
    const status = this.getStorageStatus()
    const corruption = this.getCorruptionReport()
    const health = await this.driver.healthCheck()
    
    const report = {
      timestamp: new Date().toISOString(),
      overallHealth: health,
      storage: {
        totalSizeBytes: status.totalSize,
        totalSizeKB: Math.round(status.totalSize / 1024),
        totalTransactionTypes: Object.keys(status.transactions).length
      },
      transactions: status.transactions,
      corruption: {
        hasCorruption: corruption.total > 0,
        totalCorruptedBackups: corruption.total,
        corruptionSizeBytes: corruption.totalSize,
        affectedTypes: Object.keys(corruption.byType),
        details: corruption
      },
      recommendations: this.generateRecommendations(status, corruption)
    }

    // แสดงในคอนโซล
    console.table(Object.entries(status.transactions).map(([type, info]) => ({
      Type: type,
      Exists: info.exists ? '✅' : '❌',
      Valid: info.isValid ? '✅' : '❌',
      Records: info.recordCount,
      'Size (KB)': Math.round(info.size / 1024)
    })))

    if (corruption.total > 0) {
      console.warn(`⚠️ Found ${corruption.total} corrupted backups affecting ${Object.keys(corruption.byType).length} transaction types`)
    }

    return report
  }

  /**
   * สร้างข้อเสนอแนะ
   */
  generateRecommendations(status, corruption) {
    const recommendations = []

    // ตรวจสอบการเสียหาย
    const corruptedCount = Object.values(status.transactions).filter(t => t.exists && !t.isValid).length
    if (corruptedCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'CORRUPTION',
        message: `${corruptedCount} transaction types have corrupted data. Run cleanup to attempt recovery.`,
        action: 'Call cleanupCorruption() method'
      })
    }

    // ตรวจสอบขนาดข้อมูล
    const sizeMB = status.totalSize / (1024 * 1024)
    if (sizeMB > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'SIZE',
        message: `localStorage size is ${sizeMB.toFixed(1)}MB. Consider data archiving.`,
        action: 'Archive old transactions or implement data pruning'
      })
    }

    // ตรวจสอบข้อมูลสำรองเก่า
    if (corruption.total > 10) {
      recommendations.push({
        priority: 'LOW',
        type: 'CLEANUP',
        message: `${corruption.total} old corrupted backups found. Consider cleanup.`,
        action: 'Run cleanupCorruptedBackups() to remove old backups'
      })
    }

    return recommendations
  }

  /**
   * Export ข้อมูลทั้งหมดสำหรับการสำรอง
   */
  async exportAllData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    }

    Object.values(TRANSACTION_TYPES).forEach(type => {
      try {
        exportData.data[type] = this.driver.loadData(type)
      } catch (error) {
        exportData.data[type] = { error: error.message }
      }
    })

    return exportData
  }
}

// Helper function สำหรับใช้ในคอนโซล
export function debugStorage() {
  const helper = new StorageDebugHelper()
  return helper.generateHealthReport()
}

export function cleanupStorage() {
  const helper = new StorageDebugHelper()
  return helper.cleanupCorruption()
}

export function exportStorage() {
  const helper = new StorageDebugHelper()
  return helper.exportAllData()
}