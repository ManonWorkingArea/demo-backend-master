/**
 * Storage Recovery Test
 * ทดสอบระบบกู้คืนข้อมูลที่เสียหาย
 */

import { StorageDebugHelper } from '../utils/StorageDebugHelper.js'
import { LocalStorageDriver } from '../drivers/LocalStorageDriver.js'

// สร้าง Helper instance
const debugHelper = new StorageDebugHelper()
const driver = new LocalStorageDriver()

console.log('🔍 [Storage Recovery Test] Starting localStorage health check...')

// 1. ตรวจสอบสถานะปัจจุบัน
debugHelper.generateHealthReport().then(report => {
  console.log('📋 [Health Report] Generated:', report)
  
  // แสดงสถานะความเสียหาย
  if (report.corruption.hasCorruption) {
    console.warn(`⚠️ [Corruption Detected] ${report.corruption.totalCorruptedBackups} backups found`)
    console.warn(`📊 [Affected Types] ${report.corruption.affectedTypes.join(', ')}`)
  } else {
    console.log('✅ [No Corruption] All data appears healthy')
  }

  // แสดงข้อเสนอแนะ
  if (report.recommendations.length > 0) {
    console.log('\n💡 [Recommendations]:')
    report.recommendations.forEach(rec => {
      console.log(`${rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢'} ${rec.type}: ${rec.message}`)
      console.log(`   Action: ${rec.action}`)
    })
  }
})

// 2. ฟังก์ชันทดสอบการกู้คืนข้อมูล
window.testStorageRecovery = async () => {
  console.log('\n🧪 [Test] Starting storage recovery test...')
  
  try {
    // รันการทำความสะอาด
    const result = await debugHelper.cleanupCorruption()
    
    console.log('🧹 [Cleanup Result]:', result)
    console.log(`📦 [Cleaned Backups] ${result.cleanedBackups}`)
    console.log(`⚠️ [Corrupted Types] ${result.corruptedTypes}`)
    
    if (result.recoveryResults.length > 0) {
      console.log('\n🔧 [Recovery Results]:')
      result.recoveryResults.forEach(recovery => {
        if (recovery.success) {
          console.log(`✅ ${recovery.type}: ${recovery.message}`)
        } else {
          console.error(`❌ ${recovery.type}: ${recovery.message}`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ [Test Failed]:', error)
  }
}

// 3. ฟังก์ชันแสดงข้อมูลสำรองที่เสียหาย
window.showCorruptedBackups = () => {
  console.log('\n📋 [Corrupted Backups] Listing all corrupted data backups...')
  
  const backups = driver.getCorruptedBackups()
  
  if (backups.length === 0) {
    console.log('✅ [No Backups] No corrupted backups found')
    return
  }

  console.table(backups.map(backup => ({
    'Backup Key': backup.key.substring(0, 50) + '...',
    'Type': backup.type,
    'Date': backup.date,
    'Size (KB)': Math.round(backup.size / 1024)
  })))
  
  console.log(`📊 [Summary] ${backups.length} corrupted backups, total size: ${Math.round(backups.reduce((sum, b) => sum + b.size, 0) / 1024)}KB`)
}

// 4. ฟังก์ชันกู้คืนข้อมูลจากสำรองด้วยตนเอง
window.manualRestore = async (backupKey) => {
  console.log(`🔄 [Manual Restore] Attempting to restore from: ${backupKey}`)
  
  try {
    const result = await driver.restoreFromBackup(backupKey)
    console.log(`✅ [Restore Success] Recovered ${Object.keys(result).length} transactions`)
    console.table(Object.entries(result).slice(0, 5).map(([id, transaction]) => ({
      'ID': id.substring(0, 20) + '...',
      'Type': transaction.type,
      'State': transaction.state,
      'Created': new Date(transaction.created_at).toLocaleString()
    })))
  } catch (error) {
    console.error(`❌ [Restore Failed] ${error.message}`)
  }
}

// 5. ฟังก์ชัน Export ข้อมูลทั้งหมด
window.exportAllData = async () => {
  console.log('💾 [Export] Exporting all ERP data...')
  
  try {
    const exported = await debugHelper.exportAllData()
    
    // นับจำนวนรายการทั้งหมด
    let totalRecords = 0
    Object.values(exported.data).forEach(typeData => {
      if (typeData && !typeData.error) {
        totalRecords += Object.keys(typeData).length
      }
    })
    
    console.log(`📦 [Export Complete] ${totalRecords} total records across ${Object.keys(exported.data).length} transaction types`)
    console.log('📋 [Export Data] Available in exported object:', exported)
    
    // ใส่ข้อมูลใน window เพื่อให้ดาวน์โหลดได้
    window.exportedData = exported
    
    // สร้าง blob สำหรับดาวน์โหลด
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `erp_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('💾 [Download] Backup file downloaded automatically')
    
  } catch (error) {
    console.error('❌ [Export Failed]:', error)
  }
}

// แสดงคำแนะนำการใช้งาน
console.log('\n📚 [Usage Instructions]:')
console.log('🔧 testStorageRecovery() - Run automatic cleanup and recovery')
console.log('📋 showCorruptedBackups() - List all corrupted data backups') 
console.log('🔄 manualRestore("backup_key") - Manually restore from specific backup')
console.log('💾 exportAllData() - Export all data to JSON file')
console.log('🔍 debugStorage() - Generate detailed health report')
console.log('🧹 cleanupStorage() - Quick cleanup function')
console.log('\n✨ [Ready] Storage recovery tools loaded successfully!')