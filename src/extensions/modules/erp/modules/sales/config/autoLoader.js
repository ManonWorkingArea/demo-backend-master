/**
 * Sales Module Auto-Loader
 * ไฟล์นี้จะถูกเรียกเมื่อ Vue app เริ่มต้น
 * เพื่อให้ Sales module ปรากฏใน Number Series
 */

import { autoInitializeSales, SalesAutoInitDebug } from './autoInit.js'

/**
 * Initialize Sales Module on App Start
 * เริ่มต้น Sales Module เมื่อ App เริ่ม
 */
function initializeSalesOnStart() {
  console.log('🌟 [Sales Auto-Loader] Starting sales module initialization...')
  
  // Try to initialize immediately
  const immediate = autoInitializeSales()
  
  if (immediate) {
    console.log('✅ [Sales Auto-Loader] Sales module initialized immediately')
    return
  }

  // If not immediate, set up window event listener
  if (typeof window !== 'undefined') {
    // Wait for ERP_CORE to be available
    const checkERPCore = () => {
      if (window.ERP_CORE) {
        const registered = autoInitializeSales()
        if (registered) {
          console.log('✅ [Sales Auto-Loader] Sales module registered after ERP_CORE ready')
          return
        }
      }
      
      // Check again in 500ms
      setTimeout(checkERPCore, 500)
    }
    
    // Start checking
    setTimeout(checkERPCore, 100)
  }
}

// Self-executing initialization
initializeSalesOnStart()

// Export for manual use
export {
  initializeSalesOnStart,
  autoInitializeSales,
  SalesAutoInitDebug
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.SalesAutoLoader = {
    init: initializeSalesOnStart,
    debug: SalesAutoInitDebug,
    reinitialize: autoInitializeSales
  }
}

export default {
  initializeSalesOnStart,
  autoInitializeSales,
  SalesAutoInitDebug
}