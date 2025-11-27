/**
 * ERP Core - Centralized Exports
 * Single entry point สำหรับ import ทั้งหมดจาก ERP Core
 */

// ===== TRANSACTION ENGINE =====
export { ERP_CORE, TransactionEngine } from './index.js'

// ===== MASTERDATA SCHEMAS =====
// Supplier
export {
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  PAYMENT_TERMS_LABELS
} from './masterdata/supplier/schema.js'

// Customer
export {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_STATES,
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_STATUS_LABELS
} from './masterdata/customer/schema.js'

// Purchase
export {
  PURCHASE_TYPES,
  PURCHASE_STATUS,
  PURCHASE_STATES,
  PURCHASE_TRANSITIONS,
  PURCHASE_TYPE_LABELS,
  PURCHASE_STATUS_LABELS
} from './masterdata/purchase/schema.js'

// Sales
export {
  SALES_TYPES,
  SALES_STATUS,
  SALES_STATES,
  SALES_TRANSITIONS,
  SALES_TYPE_LABELS,
  SALES_STATUS_LABELS
} from './masterdata/sales/schema.js'

// Inventory
export {
  INVENTORY_TYPES,
  INVENTORY_STATES,
  INVENTORY_STATUS,
  INVENTORY_TYPE_LABELS,
  INVENTORY_STATUS_LABELS,
  STOCK_STATUS
} from './masterdata/inventory/schema.js'

// Product
export {
  PRODUCT_TYPES,
  PRODUCT_STATUS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS
} from './masterdata/product/schema.js'

// Delivery
export {
  DELIVERY_TYPES,
  DELIVERY_STATUS,
  DELIVERY_STATES,
  DELIVERY_TRANSITIONS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_STATUS_LABELS
} from './masterdata/delivery/schema.js'

// Production & Work Order
export {
  PRODUCTION_TYPES,
  PRODUCTION_STATUS,
  PRODUCTION_STATES,
  PRODUCTION_TRANSITIONS
} from './masterdata/production/schema.js'

export {
  WORKORDER_TYPES,
  WORKORDER_STATUS,
  WORKORDER_STATES,
  WORKORDER_TRANSITIONS
} from './masterdata/workorder/schema.js'

// Payment & Finance
export {
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  PAYMENT_STATES,
  PAYMENT_TRANSITIONS,
  PAYMENT_METHODS
} from './masterdata/payment/schema.js'

// Returns & Quotation
export {
  RETURNS_TYPES,
  RETURNS_STATUS,
  RETURNS_STATES,
  RETURNS_TRANSITIONS
} from './masterdata/returns/schema.js'

export {
  QUOTATION_TYPES,
  QUOTATION_STATUS,
  QUOTATION_STATES,
  QUOTATION_TRANSITIONS
} from './masterdata/quotation/schema.js'

// ===== MASTERDATA UTILS =====
// Supplier Utils
export { SupplierUtils } from './masterdata/supplier/data.js'

// Customer Utils  
export { CustomerUtils } from './masterdata/customer/data.js'

// Purchase Utils
export { PurchaseUtils } from './masterdata/purchase/data.js'

// Sales Utils
export { SalesUtils } from './masterdata/sales/data.js'

// Inventory Utils
export { InventoryUtils } from './masterdata/inventory/data.js'

// Product Utils
export { ProductUtils } from './masterdata/product/data.js'

// ===== TRANSACTION TYPES & CORE =====
export { TRANSACTION_TYPES } from './Types.js'

// ===== CORE UTILITIES =====
export { 
  TransactionValidator,
  getSchema,
  getTransactionSchema,
  validateTransactionStructure 
} from './Schema.js'

export {
  BalanceManager,
  balanceManager
} from './BalanceManager.js'

export {
  CodeManager,
  codeManager
} from './CodeManager.js'

// ===== DRIVER INSTANCES =====
export { 
  LocalStorageDriver 
} from './drivers/LocalStorageDriver.js'

export { 
  ApiDriver 
} from './drivers/ApiDriver.js'