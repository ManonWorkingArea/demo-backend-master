/**
 * Migration Script: localStorage → MongoDB (CorporateConfig)
 * ใช้สำหรับย้ายข้อมูลการตั้งค่าจาก localStorage ไป Database
 * 
 * วิธีใช้:
 * 1. เปิด Browser Console
 * 2. Copy-paste script นี้
 * 3. เรียก migrateToDatabase()
 */

async function migrateToDatabase() {
  console.log('🚀 Starting migration from localStorage to MongoDB...')
  
  const $Request = window.app?.$Request || window.vue?.$Request
  
  if (!$Request) {
    console.error('❌ $Request not found. Make sure app is loaded.')
    return
  }
  
  const migrations = []
  
  // 1. Migrate Account Mapping
  const accountMapping = localStorage.getItem('accounting.account_mapping')
  if (accountMapping) {
    try {
      const data = JSON.parse(accountMapping)
      migrations.push({
        config_key: 'accounting.account_mapping',
        module: 'accounting',
        category: 'account_mapping',
        config_data: data,
        name: 'Account Mapping Configuration',
        description: 'ผังบัญชีทั้งหมดในระบบ',
        version: '1.0.0'
      })
      console.log('✅ Found account_mapping in localStorage')
    } catch (error) {
      console.warn('⚠️ Failed to parse account_mapping:', error)
    }
  }
  
  // 2. Migrate Account Types
  const accountTypes = localStorage.getItem('accounting.account_types')
  if (accountTypes) {
    try {
      const data = JSON.parse(accountTypes)
      migrations.push({
        config_key: 'accounting.account_types',
        module: 'accounting',
        category: 'account_types',
        config_data: data,
        name: 'Account Types Configuration',
        description: 'ประเภทบัญชีทั้งหมดในระบบ',
        version: '1.0.0'
      })
      console.log('✅ Found account_types in localStorage')
    } catch (error) {
      console.warn('⚠️ Failed to parse account_types:', error)
    }
  }
  
  // 3. Legacy keys (old format)
  const legacyAccountMapping = localStorage.getItem('accounting_account_mapping')
  const legacyAccountTypes = localStorage.getItem('accounting_account_types')
  
  if (legacyAccountMapping && !accountMapping) {
    try {
      const data = JSON.parse(legacyAccountMapping)
      migrations.push({
        config_key: 'accounting.account_mapping',
        module: 'accounting',
        category: 'account_mapping',
        config_data: data,
        name: 'Account Mapping Configuration',
        description: 'ผังบัญชีทั้งหมดในระบบ (Migrated from legacy)',
        version: '1.0.0'
      })
      console.log('✅ Found legacy account_mapping')
    } catch (error) {
      console.warn('⚠️ Failed to parse legacy account_mapping:', error)
    }
  }
  
  if (legacyAccountTypes && !accountTypes) {
    try {
      const data = JSON.parse(legacyAccountTypes)
      migrations.push({
        config_key: 'accounting.account_types',
        module: 'accounting',
        category: 'account_types',
        config_data: data,
        name: 'Account Types Configuration',
        description: 'ประเภทบัญชีทั้งหมดในระบบ (Migrated from legacy)',
        version: '1.0.0'
      })
      console.log('✅ Found legacy account_types')
    } catch (error) {
      console.warn('⚠️ Failed to parse legacy account_types:', error)
    }
  }
  
  if (migrations.length === 0) {
    console.log('ℹ️ No data found in localStorage to migrate')
    return
  }
  
  console.log(`📦 Found ${migrations.length} configurations to migrate`)
  
  // Migrate to database
  const results = {
    success: [],
    failed: []
  }
  
  for (const config of migrations) {
    try {
      const response = await $Request({
        method: 'POST',
        url: '/api/corporate-config/upsert',
        body: config
      })
      
      if (response.success) {
        console.log(`✅ Migrated: ${config.config_key}`)
        results.success.push(config.config_key)
      } else {
        console.error(`❌ Failed to migrate ${config.config_key}:`, response.message)
        results.failed.push({ key: config.config_key, error: response.message })
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ${config.config_key}:`, error)
      results.failed.push({ key: config.config_key, error: error.message })
    }
  }
  
  // Summary
  console.log('\n📊 Migration Summary:')
  console.log(`✅ Success: ${results.success.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  
  if (results.success.length > 0) {
    console.log('\n✅ Successfully migrated:')
    results.success.forEach(key => console.log(`  - ${key}`))
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed to migrate:')
    results.failed.forEach(({ key, error }) => console.log(`  - ${key}: ${error}`))
  }
  
  // Ask to clean localStorage
  if (results.success.length > 0) {
    console.log('\n🧹 To clean localStorage after successful migration, run:')
    console.log('cleanLocalStorage()')
  }
  
  return results
}

/**
 * Clean localStorage after migration
 */
function cleanLocalStorage() {
  const keysToRemove = [
    'accounting.account_mapping',
    'accounting.account_types',
    'accounting_account_mapping',
    'accounting_account_types'
  ]
  
  let removed = 0
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      removed++
      console.log(`🗑️ Removed: ${key}`)
    }
  })
  
  console.log(`✅ Cleaned ${removed} items from localStorage`)
}

/**
 * Verify migration
 */
async function verifyMigration() {
  const $Request = window.app?.$Request || window.vue?.$Request
  
  if (!$Request) {
    console.error('❌ $Request not found')
    return
  }
  
  console.log('🔍 Verifying migration...')
  
  try {
    // Check account_mapping
    const mappingResponse = await $Request({
      method: 'GET',
      url: '/api/corporate-config',
      params: { config_key: 'accounting.account_mapping' }
    })
    
    if (mappingResponse.success && mappingResponse.data.length > 0) {
      console.log('✅ accounting.account_mapping found in database')
      console.log(`   Items: ${Object.keys(mappingResponse.data[0].config_data).length}`)
    } else {
      console.log('❌ accounting.account_mapping NOT found in database')
    }
    
    // Check account_types
    const typesResponse = await $Request({
      method: 'GET',
      url: '/api/corporate-config',
      params: { config_key: 'accounting.account_types' }
    })
    
    if (typesResponse.success && typesResponse.data.length > 0) {
      console.log('✅ accounting.account_types found in database')
      console.log(`   Types: ${Object.keys(typesResponse.data[0].config_data).length}`)
    } else {
      console.log('❌ accounting.account_types NOT found in database')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

// Export functions
window.migrateToDatabase = migrateToDatabase
window.cleanLocalStorage = cleanLocalStorage
window.verifyMigration = verifyMigration

console.log('📋 Migration tools loaded:')
console.log('  - migrateToDatabase() - Migrate data from localStorage to MongoDB')
console.log('  - verifyMigration() - Verify data in database')
console.log('  - cleanLocalStorage() - Clean localStorage after migration')
