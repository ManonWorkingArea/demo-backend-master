/**
 * Sales Module Entry Point
 * จุดเข้าใช้งานสำหรับ sales module
 */

// Export ค่าคงที่และ schema
export {
  SALES_TYPES,
  SALES_STATUS,
  CUSTOMER_TYPES,
  CUSTOMER_GROUPS,
  PAYMENT_TERMS,
  DISCOUNT_TYPES,
  TAX_TYPES,
  SHIPPING_STATUS,
  SHIPPING_METHODS,
  PRIORITY_LEVELS,
  APPROVAL_STEPS,
  DOCUMENT_TYPES,
  PAYMENT_METHODS,
  SALES_TYPE_LABELS,
  SALES_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_GROUP_LABELS,
  PAYMENT_TERM_LABELS,
  SALES_CONFIG,
  SALES_DEFAULTS
} from './schema.js'

// Re-export everything for easy access
export * from './schema.js'
export * from './data.js'
export { SALES_CODE_CONFIG } from './data.js'

// Export default
export { default } from './data.js'