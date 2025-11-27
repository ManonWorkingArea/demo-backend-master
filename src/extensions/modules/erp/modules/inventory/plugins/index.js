// Inventory Module Entry Point
// ระบบจัดการสินค้าคงคลัง เชื่อมกับ ERP Core

// Import ERP Core สำหรับการจัดการ Transaction
import { TransactionEngine, TransactionService, TRANSACTION_TYPES } from '../../../core'

// Import Components
import Manager from '../shared/Manager.vue'

// Export Manager Component
export {
  Manager as InventoryManager
}

// Export Core access for internal use
export {
  TransactionEngine,
  TransactionService,
  TRANSACTION_TYPES
}

// Module configuration
export const INVENTORY_MODULE = {
  name: 'inventory',
  type: TRANSACTION_TYPES.INVENTORY,
  title: 'Inventory Management',
  description: 'ระบบจัดการสินค้าคงคลัง',
  version: '1.0.0'
}

// Default export
export default {
  Manager,
  InventoryManager: Manager,
  INVENTORY_MODULE
}