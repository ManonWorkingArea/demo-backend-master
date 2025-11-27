/**
 * Receipt Module Entry Point
 * จุดเข้าใช้งานสำหรับ receipt sub-module
 */

// Export ค่าคงที่และ schema
export {
  RECEIPT_STATES,
  RECEIPT_TRANSITIONS,
  RECEIPT_INITIAL_STATE,
  RECEIPT_STORAGE_KEY,
  PAYMENT_METHODS,
  RECEIPT_STATE_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_FIELD_SCHEMA,
  RECEIPT_CONFIG,
  RECEIPT_DEFAULTS
} from './schema.js'

// Export ข้อมูลและฟังก์ชัน
export {
  RECEIPT_CODE_CONFIG,
  ReceiptMasterData,
  ReceiptUtils
} from './data.js'

// Export default
export { default } from './data.js'