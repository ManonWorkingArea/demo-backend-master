/**
 * ERP Core Global Plugin
 * 
 * ติดตั้งใน main.js:
 * 
 * import erpCorePlugin from '@/extensions/modules/erp/plugins/erp-core'
 * import apiRequest from '@/services/apiRequest'
 * 
 * app.use(erpCorePlugin, {
 *   driver: 'api',
 *   apiRequest: apiRequest
 * })
 * 
 * ใช้งานใน Component:
 * 
 * export default {
 *   inject: ['erpCore'],
 *   methods: {
 *     async load() {
 *       const result = await this.erpCore.list('inventory')
 *     }
 *   }
 * }
 */

import { initializeERPCore } from '../core/index.js'

export default {
  install(app, options = {}) {
    const {
      apiRequest,
      driver = process.env.VUE_APP_ERP_DRIVER || 'api',
      baseEndpoint = process.env.VUE_APP_ERP_ENDPOINT || 'transaction',
      prefix = process.env.VUE_APP_API_PREFIX || '/api/'
    } = options
    
    console.log('🚀 Installing ERP Core Plugin...')
    console.log(`📊 Configuration:`, {
      driver,
      baseEndpoint,
      prefix,
      hasApiRequest: !!apiRequest
    })
    
    // ตรวจสอบว่าถ้าใช้ API driver ต้องมี apiRequest
    let finalDriver = driver
    if (driver === 'api' && !apiRequest) {
      console.warn('⚠️ ERP Core: API driver selected but apiRequest not provided')
      console.warn('⚠️ Falling back to localStorage driver')
      finalDriver = 'local'
    }
    
    // สร้าง ERP_CORE instance
    const erpCore = initializeERPCore({
      driver: finalDriver,
      apiRequest,
      baseEndpoint,
      prefix
    })
    
    // Provide to all child components
    app.provide('erpCore', erpCore)
    
    // Also add as global property (optional - for easier access)
    app.config.globalProperties.$erp = erpCore
    
    console.log(`✅ ERP Core Plugin installed successfully with ${finalDriver} driver`)
    
    // Add to window for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      window.$erpCore = erpCore
      console.log('🔧 Debug: window.$erpCore is available')
    }
  }
}
