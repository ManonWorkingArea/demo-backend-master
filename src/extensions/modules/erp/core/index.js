/**
 * ERP Core Module Index
 * รวม export core ทั้งหมดสำหรับการใช้งานในโมดูลอื่น ๆ
 */

// Main Engine Classes & Instances
export { 
  TransactionEngine, 
  localTransactionEngine, 
  apiTransactionEngine 
} from './Engine.js'

// Service Layer Classes & Instances
export { 
  TransactionService, 
  localTransactionService, 
  apiTransactionService 
} from './Service.js'

// Storage Drivers
export { LocalStorageDriver } from './drivers/LocalStorageDriver.js'
export { ApiDriver } from './drivers/ApiDriver.js'

// Validation
export { TransactionValidator } from './Validator.js'

// Schema Configuration
export { 
  TRANSACTION_SCHEMAS, 
  getSchema, 
  getTransactionSchema,
  validateTransactionStructure
} from './Schema.js'

// Balance Management
export { 
  BalanceManager
} from './BalanceManager.js'

// Type Configuration & Helpers
export { 
  TRANSACTION_TYPES, 
  TRANSACTION_STATES, 
  TRANSACTION_TRANSITIONS, 
  INITIAL_STATES,
  STORAGE_KEYS,
  isValidTransactionType,
  isValidState,
  canTransitionTo
} from './Types.js'

// Code Management
export { CodeManager } from './CodeManager.js'

// Module Registry System
export { default as ModuleRegistry, moduleRegistry } from './ModuleRegistry.js'

// Accounting Settings - Dynamic Chart of Accounts
export { default as AccountingSettings } from '../../../../services/AccountingSettings.js'

// ERP Utils - Centralized business utilities
export { 
  ERP_UTILS,
  delivery,
  sales,
  inventory,
  finance,
  production,
  general,
  deliveryUtils,
  salesUtils,
  inventoryUtils,
  financeUtils,
  productionUtils,
  generalUtils
} from './utils/index.js'

// Document Preview System - Export for external usage
export { 
  DocumentComponents, 
  DocumentTypes, 
  DocumentCategories,
  getDocumentComponent, 
  isDocumentTypeSupported, 
  getSupportedDocumentTypes,
  getDocumentCategory,
  getDocumentsByCategory,
  getAvailableComponents,
  registerDocumentComponent
} from './components/document/index.js'

// Import classes and instances for convenience object
import { 
  TransactionEngine,
  apiTransactionEngine  // ✅ ใช้ API engine
} from './Engine.js'
import { 
  TransactionService,
  apiTransactionService  // ✅ ใช้ API service
} from './Service.js'
import { LocalStorageDriver } from './drivers/LocalStorageDriver.js'
import { ApiDriver } from './drivers/ApiDriver.js'
import { TransactionValidator } from './Validator.js'
import { TRANSACTION_TYPES } from './Types.js'
import WorkflowEngine from './WorkflowEngine.js'
import { CodeManager } from './CodeManager.js'
import { BalanceManager } from './BalanceManager.js'
import { ERP_UTILS } from './utils/index.js'

// Accounting Settings
// Import services
import accountingSettings from '@/services/AccountingSettings.js'
import inventoryService from '@/services/InventoryService.js'
import purchaseService from '@/services/PurchaseService.js'
import { hrService } from '@/services/HRService.js'
import departmentService from '@/services/DepartmentService.js'
import positionService from '@/services/PositionService.js'

// Document Preview System
import { 
  DocumentComponents, 
  DocumentTypes, 
  DocumentCategories,
  getDocumentComponent, 
  isDocumentTypeSupported, 
  getSupportedDocumentTypes,
  getDocumentCategory,
  getDocumentsByCategory,
  getAvailableComponents,
  registerDocumentComponent
} from './components/document/index.js'

// Import DocumentPreview component
import DocumentPreview from './components/preview/DocumentPreview.vue'

// Import masterdata modules
import { SUPPLIER_CODE_CONFIG } from './masterdata/supplier/data.js'
import { CUSTOMER_CODE_CONFIG } from './masterdata/customer/data.js'
import { PURCHASE_CODE_CONFIG } from './masterdata/purchase/data.js'
import { INVENTORY_CODE_CONFIG } from './masterdata/inventory/data.js'
import { PRODUCT_CODE_CONFIG } from './masterdata/product/data.js'
import { SALES_CODE_CONFIG } from './masterdata/sales/data.js'
import { QUOTATION_CODE_CONFIG } from './masterdata/quotation/data.js'

// Import menu registry - Centralized menu configuration
import menuRegistryModule from '../config/menuRegistry.js'

// Import Module Registry
import { moduleRegistry } from './ModuleRegistry.js'

/**
 * 🚀 Initialize ERP Core with specified driver
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.driver - 'local' or 'api'
 * @param {Object} options.vueApp - Vue app instance (required for API driver)
 * @param {string} options.baseEndpoint - Base endpoint for API (default: 'transaction')
 * @param {string} options.clientKey - Client key for API authentication
 * @returns {Object} ERP_CORE instance
 */
export function initializeERPCore(options = {}) {
  const driverType = options.driver || 'local'
  const driverOptions = {}
  
  console.log(`🚀 Initializing ERP Core with driver: ${driverType}`)
  
  if (driverType === 'api') {
    if (!options.vueApp) {
      console.warn('⚠️ Vue app not provided. API driver may not work properly.')
      console.warn('Please provide vueApp: initializeERPCore({ driver: "api", vueApp })')
    }
    driverOptions.vueApp = options.vueApp
    driverOptions.baseEndpoint = options.baseEndpoint || 'transaction'
    driverOptions.clientKey = options.clientKey || null
  }
  
  // Create engine with driver
  const engine = new TransactionEngine(driverType, driverOptions)
  const service = new TransactionService(driverType, driverOptions)
  
  // Create managers
  const workflow = new WorkflowEngine(engine)
  
  // Return ERP_CORE object
  return createERPCore(engine, service, workflow)
}

/**
 * 🏗️ Create ERP_CORE object with given engine and service
 * Export เพื่อให้สามารถสร้าง ERP_CORE instance ใหม่ได้จาก main.js
 */
export function createERPCore(engine, service, workflow) {
  // สร้าง managers ที่ใช้ engine เดียวกัน
  const balanceManagerInstance = new BalanceManager(engine)
  const codeManagerInstance = new CodeManager(engine)
  
  return {
    // ✅ Client Key - Single Source of Truth
    clientKey: '39D4A4BDA9FD1D38',
    
    Engine: TransactionEngine,
    Service: TransactionService,
    Validator: TransactionValidator,
    WorkflowEngine: WorkflowEngine,
    drivers: {
      LocalStorage: LocalStorageDriver,
      Api: ApiDriver
    },
    types: TRANSACTION_TYPES,
    
    // 📋 Masterdata configurations
    masterdata: {
      supplier: {
        SUPPLIER_CODE_CONFIG
      },
      customer: {
        CUSTOMER_CODE_CONFIG
      },
      purchase: {
        PURCHASE_CODE_CONFIG
      },
      inventory: {
        INVENTORY_CODE_CONFIG,
      },
      product: {
        PRODUCT_CODE_CONFIG
      },
      sales: {
        SALES_CODE_CONFIG
      },
      quotation: {
        QUOTATION_CODE_CONFIG
      }
    },
    
    // Instances
    engine: engine,
    service: service,
    workflow: workflow,
    codeManager: codeManagerInstance,
    balanceManager: balanceManagerInstance,
    
    // 💰 Accounting Settings - Dynamic Chart of Accounts
    accounting: accountingSettings,
    
    // 📦 Inventory Service - Stock Locations, Products, Inventory Management
    inventory: inventoryService,
    
    // 🛒 Purchase Service - Suppliers, Purchase Requests, Purchase Orders
    purchase: purchaseService,
    
    // 👥 HR Service - Users, Employees, Departments, Authentication
    hr: hrService,
    
    // 🏢 Department Service - Department Management, Module Access Control
    departments: departmentService,
    
    // 📋 Position Service - Position Master Data Management
    positions: positionService,
    
    // 🧮 ERP Utils - Business calculation utilities
    utils: ERP_UTILS,
    
    // 📱 Menu Registry - Centralized menu configuration from all modules
    menus: {
      // Registry object with all module menus
      registry: menuRegistryModule.menuRegistry,
      
      // Helper functions for menu access
      getMenuConfig: menuRegistryModule.getMenuConfig,
      getMenuItems: menuRegistryModule.getMenuItems,
      getAllMenuConfigs: menuRegistryModule.getAllMenuConfigs,
      getModuleList: menuRegistryModule.getModuleList,
      getTotalMenuCount: menuRegistryModule.getTotalMenuCount,
      findMenuByKey: menuRegistryModule.findMenuByKey,
      findMenusByRoute: menuRegistryModule.findMenusByRoute,
      
      // Convenience method - get menu by module name
      get(moduleName) {
        return menuRegistryModule.getMenuConfig(moduleName)
      },
      
      // Get all menus as object
      getAll() {
        return menuRegistryModule.getAllMenuConfigs()
      }
    },
    
    // 🎯 Module Registry - Dynamic module access without hardcoded paths
    modules: moduleRegistry,
    
    // 🏦 Balance Management
    balance: {
      async ensureProductBalance(productData, options = {}) {
        return await balanceManagerInstance.ensureProductBalance(productData, options)
      },
      async findProductBalance(productId, stockLocationId = null) {
        return await balanceManagerInstance.findProductBalance(productId, stockLocationId)
      },
      async updateBalanceFromMovement(movementData, options = {}) {
        const productId = movementData.product_id
        const locationId = movementData.stock_location_id || movementData.location_code || movementData.location || null
        const updatedBy = options.updatedBy || 'system'
        
        return await balanceManagerInstance.updateBalanceFromMovement(productId, locationId, movementData, updatedBy)
      },
      async recalculateBalance(productId, stockLocationId, options = {}) {
        return await balanceManagerInstance.recalculateBalance(productId, stockLocationId, options)
      },
      async getProductBalanceSummary(productId) {
        return await balanceManagerInstance.getProductBalanceSummary(productId)
      }
    },
    
    // 🔧 Core-Only Module Access
    executeModuleFunction: (...args) => engine.executeModuleFunction(...args),
    
    // 🎯 Convenience methods
    async create(type, data, userId) {
      return await engine.create(type, data, userId)
    },
    
    async read(type, id) {
      return await engine.read(type, id)
    },
    
    async update(type, id, data, userId) {
      return await engine.update(type, id, data, userId)
    },
    
    async delete(type, id, userId) {
      return await engine.delete(type, id, userId)
    },
    
    async list(type, filters) {
      return await engine.list(type, filters)
    },
    
    async calculate(moduleType, functionName, ...args) {
      return await engine.executeModuleFunction(moduleType, functionName, ...args)
    },
    
    async validate(moduleType, data) {
      return await engine.executeModuleFunction(moduleType, 'validateData', data)
    },
    
    // 🧩 Components - Expose Vue components for external use
    components: {
      DocumentPreview: DocumentPreview
    },
    
    // 📄 Document Preview System - Built-in
    documents: {
      components: DocumentComponents,
      types: DocumentTypes,
      categories: DocumentCategories,
      getComponent: getDocumentComponent,
      isSupported: isDocumentTypeSupported,
      getSupportedTypes: getSupportedDocumentTypes,
      getCategory: getDocumentCategory,
      getByCategory: getDocumentsByCategory,
      getAvailable: getAvailableComponents,
      register: registerDocumentComponent,
      
      generateDocumentData(sourceData, documentType, options = {}) {
        return {
          ...sourceData,
          document_type: documentType,
          preview_options: options,
          generated_at: new Date().toISOString()
        }
      },
      
      extractItems(sourceData) {
        let rawItems = []
        
        if (sourceData?.items) {
          rawItems = sourceData.items
        } else if (sourceData?.products) {
          rawItems = sourceData.products
        } else if (sourceData?.request_items) {
          rawItems = sourceData.request_items
        } else if (Array.isArray(sourceData)) {
          rawItems = sourceData
        }
        
        return rawItems.map(item => ({
          product_code: item?.sku || item?.product_code || 'N/A',
          product_name: item?.product_name || item?.name || 'ไม่ระบุ',
          quantity: parseFloat(item?.quantity || 0),
          unit: item?.unit || 'ชิ้น',
          unit_price: parseFloat(item?.unit_price || item?.unitPrice || 0),
          total: parseFloat(item?.total || item?.amount || (item?.quantity * item?.unit_price) || 0),
          line_total: parseFloat(item?.total || item?.amount || (item?.quantity * item?.unit_price) || 0),
          specification: item?.description || item?.notes || item?.specification
        }))
      },
      
      generateDocumentNumber(documentType, options = {}) {
        const prefix = {
          'purchase_request': 'PR',
          'quotation': 'QT',
          'invoice': 'INV',
          'sales_order': 'SO',
          'delivery_note': 'DN',
          'credit_note': 'CN'
        }[documentType] || 'DOC'
        
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        
        return options.format ? 
          options.format.replace('{prefix}', prefix).replace('{year}', year).replace('{month}', month).replace('{random}', random) :
          `${prefix}-${year}${month}-${random}`
      },
      
      getDocumentTitle(documentType) {
        const titles = {
          'purchase_request': 'ใบขอซื้อ',
          'quotation': 'ใบเสนอราคา', 
          'invoice': 'ใบแจ้งหนี้',
          'sales_order': 'ใบสั่งซื้อ',
          'delivery_note': 'ใบส่งของ',
          'credit_note': 'ใบลดหนี้'
        }
        return titles[documentType] || 'เอกสาร'
      },

      showPreview(sourceData, documentType, options = {}) {
        return this.showSimplePreview(sourceData, documentType, options)
      },

      async showSimplePreview(sourceData, documentType, options = {}) {
        try {
          const documentData = this.generateDocumentData(sourceData, documentType, options)
          
          if (window.DocumentPreview && typeof window.DocumentPreview.show === 'function') {
            return window.DocumentPreview.show(documentData, documentType, options)
          }
          
          const documentRegistry = await import('/src/extensions/modules/erp/core/components/document/index.js')
          const documentComponent = documentRegistry.getDocumentComponent(documentType)
          
          if (documentComponent && options.onComponentReady) {
            return options.onComponentReady(documentComponent, documentData)
          }
          
          console.warn(`No preview handler available for document type: ${documentType}`)
          return null
          
        } catch (error) {
          console.error('Document preview error:', error)
          return null
        }
      },

      showFallbackPreview(documentData, documentTitle) {
        console.log(`Fallback preview requested for: ${documentTitle}`)
        console.log('Document data:', documentData)
        
        if (window.alert) {
          window.alert(`เอกสาร: ${documentTitle}\nกรุณาใช้ระบบ Document Preview ภายนอก`)
        }
        
        return null
      }
    },
    
    // 🔔 Notification system
    showNotification(type, message, title = null) {
      console.log(`[ERP_CORE] ${type.toUpperCase()}: ${message}`)
      
      if (window.$toast) {
        switch(type) {
          case 'success':
            window.$toast.success(title ? `${title}: ${message}` : message)
            break
          case 'error':
            window.$toast.error(title ? `${title}: ${message}` : message)
            break
          case 'warning':
            window.$toast.warning(title ? `${title}: ${message}` : message)
            break
          case 'info':
            window.$toast.info(title ? `${title}: ${message}` : message)
            break
          default:
            window.$toast.info(title ? `${title}: ${message}` : message)
        }
      } else {
        const displayMessage = title ? `${title}: ${message}` : message
        alert(displayMessage)
      }
    }
  }
}
// ✅ FIXED: ใช้ API driver แทน LocalStorage เป็น default
export const ERP_CORE = createERPCore(
  apiTransactionEngine,      // ✅ เปลี่ยนเป็น API engine
  apiTransactionService,     // ✅ เปลี่ยนเป็น API service
  new WorkflowEngine(apiTransactionEngine)  // ✅ workflow ใช้ API engine
)

// Initialize services with window.vueApp if available
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.vueApp?.config?.globalProperties) {
        console.log('🔧 [ERP_CORE] Auto-initializing services...')
        
        try {
          positionService.initialize(window.vueApp.config.globalProperties)
          console.log('✅ [ERP_CORE] PositionService initialized')
        } catch (error) {
          console.warn('⚠️ [ERP_CORE] PositionService initialization failed:', error)
        }
      }
    }, 100)
  })
}

// Export initialization function is already exported at the top
// export { initializeERPCore } - already exported above

// Default export (API engine instance)
export default apiTransactionEngine  // ✅ เปลี่ยนเป็น API engine
