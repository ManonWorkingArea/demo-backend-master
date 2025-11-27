/**
 * Document Module Exports
 * ส่งออกฟังก์ชันและค่าคงที่สำหรับโมดูลเอกสาร
 */

// Sub-module exports
export * from './receipt/index.js'
export * from './tax_invoice/index.js'
export * from './invoice/index.js'

// Schema exports (legacy support)
export {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  BRANCH_TYPES,
  DOCUMENT_CONFIG,
  DOCUMENT_DEFAULTS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  BRANCH_TYPE_LABELS,
  RECEIPT_SCHEMA_STRUCTURE,
  TAX_INVOICE_SCHEMA_STRUCTURE,
  TRANSACTION_FIELD_STRUCTURES
} from './schema.js'

// Data function exports (legacy support)
export {
  DOCUMENT_CODE_CONFIG,
  generateDocumentNumber,
  calculateDocumentValues,
  validateDocument,
  createDocumentFromTemplate,
  formatters,
  filters
} from './data.js'

// Import for utility object
import * as schema from './schema.js'
import * as data from './data.js'

// Combined utility object for convenience
export const DocumentUtils = {
  // Document generation
  generateNumber: data.generateDocumentNumber,
  calculateValues: data.calculateDocumentValues,
  validate: data.validateDocument,
  createFromTemplate: data.createDocumentFromTemplate,
  
  // Utilities
  formatters: data.formatters,
  filters: data.filters
}

// Re-export for backward compatibility
export { DocumentUtils as documentUtils }

// Default export
export default {
  // Constants
  TYPES: schema.DOCUMENT_TYPES,
  STATUS: schema.DOCUMENT_STATUS,
  BRANCH_TYPES: schema.BRANCH_TYPES,
  CONFIG: schema.DOCUMENT_CONFIG,
  DEFAULTS: schema.DOCUMENT_DEFAULTS,
  
  // Labels
  TYPE_LABELS: schema.DOCUMENT_TYPE_LABELS,
  STATUS_LABELS: schema.DOCUMENT_STATUS_LABELS,
  BRANCH_TYPE_LABELS: schema.BRANCH_TYPE_LABELS,
  
  // Schema structures
  RECEIPT_SCHEMA: schema.RECEIPT_SCHEMA_STRUCTURE,
  TAX_INVOICE_SCHEMA: schema.TAX_INVOICE_SCHEMA_STRUCTURE,
  TRANSACTION_FIELDS: schema.TRANSACTION_FIELD_STRUCTURES,
  
  // Utilities
  utils: DocumentUtils
}