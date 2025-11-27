// Sales Module Entry Point
// ระบบจัดการขายสินค้า ตั้งแต่ใบเสนอราคาถึงการจัดส่ง

// Import ERP Core สำหรับการจัดการ Transaction
import { TransactionEngine, TransactionService, TRANSACTION_TYPES } from '../../../core'

// Import SalesService for dedicated sales operations
import salesServicePlugin, { salesService } from './salesService.js'

// Import Components
import SalesManager from '../shared/SalesManager.vue'

// Export Manager Component
export {
  SalesManager
}

// Export Core access for internal use
export {
  TransactionEngine,
  TransactionService,
  TRANSACTION_TYPES
}

// Export SalesService
export {
  salesService,
  salesServicePlugin
}

// Module configuration
export const SALES_MODULE = {
  name: 'sales',
  type: TRANSACTION_TYPES.SALES,
  title: 'Sales Management',
  description: 'ระบบจัดการขายสินค้า',
  version: '1.0.0',
  states: ['draft', 'quoted', 'confirmed', 'delivered', 'invoiced', 'complete'],
  features: [
    'quotation_management',
    'sales_order_processing', 
    'inventory_integration',
    'delivery_tracking',
    'invoice_generation',
    'customer_management'
  ],
  services: {
    salesService: 'SalesService for dedicated sales operations'
  }
}

// Sales-specific helper functions
export const SALES_STATES = {
  DRAFT: 'draft',
  QUOTED: 'quoted',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  INVOICED: 'invoiced',
  COMPLETE: 'complete'
}

export const SALES_STATE_LABELS = {
  [SALES_STATES.DRAFT]: 'ร่าง',
  [SALES_STATES.QUOTED]: 'เสนอราคาแล้ว',
  [SALES_STATES.CONFIRMED]: 'ยืนยันคำสั่งซื้อ',
  [SALES_STATES.DELIVERED]: 'จัดส่งแล้ว',
  [SALES_STATES.INVOICED]: 'ออกบิลแล้ว',
  [SALES_STATES.COMPLETE]: 'เสร็จสิ้น'
}

// Plugin installation function
export function install(app) {
  // Install SalesService plugin
  app.use(salesServicePlugin)
  
  // Additional module setup can be added here
  console.log('✅ [Sales Module] Plugin installed with SalesService')
}

// Default export
export default {
  install,
  SalesManager,
  SALES_MODULE,
  SALES_STATES,
  SALES_STATE_LABELS,
  salesService,
  salesServicePlugin
}