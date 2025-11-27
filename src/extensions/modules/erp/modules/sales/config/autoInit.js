/**
 * Sales Module Auto-Initialization
 * ระบบเริ่มต้นอัตโนมัติสำหรับ Sales Module ให้ปรากฏใน Number Series
 */

/**
 * Register Sales Patterns to ERP_CORE
 * ลงทะเบียน Sales patterns เข้า ERP_CORE.masterdata
 */
export function registerSalesToMasterData() {
  try {
    // ตรวจสอบ ERP_CORE
    if (!window.ERP_CORE) {
      console.warn('[Sales Auto-Init] ERP_CORE not available yet')
      return false
    }

    // ตรวจสอบ masterdata
    if (!window.ERP_CORE.masterdata) {
      console.warn('[Sales Auto-Init] ERP_CORE.masterdata not available')
      return false
    }

    // สร้าง SALES_CODE_CONFIG structure
    const SALES_CODE_CONFIG = {
      patterns: {
        // Main sales pattern (default)
        default: {
          prefix: 'SAL',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        // Sub-patterns จาก SALES_CODE_PATTERNS
        quotation: {
          prefix: 'QT',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        sales_order: {
          prefix: 'SO',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        sales_invoice: {
          prefix: 'INV',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        tax_invoice: {
          prefix: 'TAX',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        receipt: {
          prefix: 'RCP',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        },

        delivery_note: {
          prefix: 'DN',
          year: true,
          month: true,
          sequence: { 
            digits: 4, 
            start: 1, 
            resetOnYearChange: true,
            current: 0
          },
          format: '{prefix}{year}{month}{sequence}',
          resetPeriod: 'yearly'
        }
      },
      
      // Metadata
      settings: {
        defaultPattern: 'default',
        allowCustomCodes: true,
        validateUniqueCode: true
      },
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Register ลง ERP_CORE.masterdata
    window.ERP_CORE.masterdata.sales = {
      SALES_CODE_CONFIG
    }

    console.log('✅ [Sales Auto-Init] Sales module registered to ERP_CORE.masterdata')
    console.log('📋 [Sales Auto-Init] Available patterns:', Object.keys(SALES_CODE_CONFIG.patterns))
    
    return true

  } catch (error) {
    console.error('❌ [Sales Auto-Init] Failed to register sales to masterdata:', error)
    return false
  }
}

/**
 * Auto-initialize when DOM is ready
 * เริ่มต้นอัตโนมัติเมื่อ DOM พร้อม
 */
export function autoInitializeSales() {
  // Try immediate initialization
  if (registerSalesToMasterData()) {
    return true
  }

  // If failed, wait for ERP_CORE
  let retryCount = 0
  const maxRetries = 10

  const checkAndInitialize = () => {
    if (registerSalesToMasterData()) {
      console.log('✅ [Sales Auto-Init] Successfully registered after retries')
      return
    }

    retryCount++
    if (retryCount < maxRetries) {
      console.log(`⏳ [Sales Auto-Init] Retry ${retryCount}/${maxRetries} in 500ms...`)
      setTimeout(checkAndInitialize, 500)
    } else {
      console.warn('⚠️ [Sales Auto-Init] Failed to register sales module after max retries')
    }
  }

  // Start checking
  setTimeout(checkAndInitialize, 500)
  
  return false
}

/**
 * Debug helpers
 * ฟังก์ชันช่วยดีบัก
 */
export const SalesAutoInitDebug = {
  /**
   * ตรวจสอบสถานะการลงทะเบียน
   */
  checkRegistrationStatus() {
    const hasERPCore = !!window.ERP_CORE
    const hasMasterData = !!window.ERP_CORE?.masterdata
    const hasSales = !!window.ERP_CORE?.masterdata?.sales
    const hasCodeConfig = !!window.ERP_CORE?.masterdata?.sales?.SALES_CODE_CONFIG

    console.log('🔍 [Sales Auto-Init Debug] Registration Status:')
    console.log('  ERP_CORE available:', hasERPCore)
    console.log('  masterdata available:', hasMasterData)
    console.log('  sales module registered:', hasSales)
    console.log('  SALES_CODE_CONFIG available:', hasCodeConfig)

    if (hasCodeConfig) {
      const patterns = Object.keys(window.ERP_CORE.masterdata.sales.SALES_CODE_CONFIG.patterns)
      console.log('  Available patterns:', patterns)
    }

    return {
      hasERPCore,
      hasMasterData,
      hasSales,
      hasCodeConfig,
      patterns: hasCodeConfig ? Object.keys(window.ERP_CORE.masterdata.sales.SALES_CODE_CONFIG.patterns) : []
    }
  },

  /**
   * บังคับลงทะเบียนใหม่
   */
  forceRegister() {
    console.log('🔄 [Sales Auto-Init Debug] Force re-registering...')
    return registerSalesToMasterData()
  },

  /**
   * ลบการลงทะเบียน (สำหรับทดสอบ)
   */
  unregister() {
    if (window.ERP_CORE?.masterdata?.sales) {
      delete window.ERP_CORE.masterdata.sales
      console.log('🗑️ [Sales Auto-Init Debug] Sales module unregistered')
      return true
    }
    return false
  },

  /**
   * ทดสอบรายการ modules ใน masterdata
   */
  listMasterDataModules() {
    if (window.ERP_CORE?.masterdata) {
      const modules = Object.keys(window.ERP_CORE.masterdata)
      console.log('📋 [Sales Auto-Init Debug] Registered modules:', modules)
      return modules
    }
    console.log('❌ [Sales Auto-Init Debug] No masterdata available')
    return []
  }
}

// Export everything
export default {
  registerSalesToMasterData,
  autoInitializeSales,
  SalesAutoInitDebug
}