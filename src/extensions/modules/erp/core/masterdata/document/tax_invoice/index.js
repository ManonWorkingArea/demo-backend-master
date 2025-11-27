/**
 * Tax Invoice Module Entry Point
 * จุดเข้าใช้งานสำหรับ tax_invoice sub-module
 */

// Export ค่าคงที่และ schema
export {
  TAX_INVOICE_STATES,
  TAX_INVOICE_TRANSITIONS,
  TAX_INVOICE_INITIAL_STATE,
  TAX_INVOICE_STORAGE_KEY,
  VAT_TYPES,
  VAT_RATES,
  BRANCH_TYPES,
  TAX_INVOICE_STATE_LABELS,
  VAT_TYPE_LABELS,
  BRANCH_TYPE_LABELS,
  TAX_INVOICE_FIELD_SCHEMA,
  TAX_INVOICE_CONFIG,
  TAX_INVOICE_DEFAULTS
} from './schema.js'

// Export ข้อมูลและฟังก์ชัน
export {
  TAX_INVOICE_CODE_CONFIG,
  TaxInvoiceMasterData,
  TaxInvoiceUtils
} from './data.js'

// Export default
export { default } from './data.js'