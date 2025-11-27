/**
 * Sales Module Plugin - SalesService Integration with Code Management
 * Auto-initialize SalesService และ Code Patterns เมื่อ module โหลด
 */

import { salesService } from '@/services/SalesService.js'
import { autoInitializeSalesPatterns, SalesCodeInitializer } from '../config/codeInitializer.js'
import { autoInitializeSales, SalesAutoInitDebug } from '../config/autoInit.js'

export default {
  async install(app) {
    // Auto-register Sales Module to ERP_CORE.masterdata FIRST
    try {
      console.log('🏗️ [Sales Module] Registering to masterdata...')
      const registered = autoInitializeSales()
      
      if (registered) {
        console.log('✅ [Sales Module] Successfully registered to ERP_CORE.masterdata')
      } else {
        console.log('⏳ [Sales Module] Registration in progress...')
      }
      
      // Make debug helpers available
      app.config.globalProperties.$salesDebug = SalesAutoInitDebug
      
    } catch (error) {
      console.error('❌ [Sales Module] Failed to register to masterdata:', error)
    }

    // Auto-initialize SalesService with app context
    try {
      console.log('🚀 [Sales Module] Initializing SalesService...')
      
      // Initialize with app's global properties
      salesService.initialize(app.config.globalProperties)
      
      // Make service available globally
      app.config.globalProperties.$salesService = salesService
      app.provide('salesService', salesService)
      
      console.log('✅ [Sales Module] SalesService initialized successfully')
      
      // Debug: Show available methods
      console.log('🔧 [Sales Module] Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(salesService)))
      
    } catch (error) {
      console.error('❌ [Sales Module] Failed to initialize SalesService:', error)
    }

    // Initialize Sales Code Patterns
    try {
      console.log('📋 [Sales Module] Initializing sales code patterns...')
      
      // Wait a bit for CodeManager to be ready
      setTimeout(async () => {
        const initResult = await autoInitializeSalesPatterns()
        
        if (initResult?.success) {
          console.log('✅ [Sales Module] Sales code patterns initialized successfully')
          
          // Make code initializer available globally for debugging
          app.config.globalProperties.$salesCodeInitializer = new SalesCodeInitializer()
          
        } else if (initResult === null) {
          console.log('⏳ [Sales Module] CodeManager not ready, code patterns will be initialized later')
        } else {
          console.warn('⚠️ [Sales Module] Some sales code patterns failed to initialize:', initResult)
        }
      }, 1000) // Wait 1 second for CodeManager
      
    } catch (error) {
      console.error('❌ [Sales Module] Failed to initialize sales code patterns:', error)
    }

    // Setup global helpers
    app.config.globalProperties.$salesHelpers = {
      // Quick access to generate document numbers
      async generateQuotationNumber(customData = {}) {
        return await salesService.generateQuotationNumber(customData)
      },
      
      async generateSalesOrderNumber(customData = {}) {
        return await salesService.generateSalesOrderNumber(customData)
      },
      
      async generateInvoiceNumber(customData = {}) {
        return await salesService.generateInvoiceNumber(customData)
      },
      
      async generateTaxInvoiceNumber(customData = {}) {
        return await salesService.generateTaxInvoiceNumber(customData)
      },

      // Debug helpers
      async debugCodePatterns() {
        if (window.ERP_CORE?.codeManager) {
          const initializer = new SalesCodeInitializer()
          return await initializer.verifySalesPatterns()
        }
        return null
      },

      async testCodeGeneration() {
        if (window.ERP_CORE?.codeManager) {
          const initializer = new SalesCodeInitializer()
          return await initializer.generateTestCodes()
        }
        return null
      }
    }

    console.log('✅ [Sales Module] Plugin installed with SalesService, Code Management, and MasterData registration')
  }
}

// Export salesService for direct imports
export { salesService }