/**
 * Base Module Exports
 * ส่งออกฟังก์ชันและค่าคงที่สำหรับโมดูลพื้นฐาน
 */

// Schema exports
export {
  BASE_STATUS,
  BASE_PRIORITY,
  BASE_CURRENCIES,
  BASE_APPROVAL_STATUS,
  BASE_SYNC_STATUS,
  BASE_CONFIG,
  BASE_DEFAULTS,
  BASE_SCHEMA_STRUCTURE,
  BASE_STATUS_LABELS,
  BASE_PRIORITY_LABELS,
  BASE_CURRENCY_LABELS,
  BASE_APPROVAL_STATUS_LABELS,
  BASE_SYNC_STATUS_LABELS
} from './schema.js'

// Data function exports
export {
  generateTransactionId,
  generateDocumentNumber,
  validateBaseData,
  convertCurrency,
  calculateDocumentAge,
  checkApprovalRequired,
  updateTimestamp,
  createBaseTransaction,
  formatters,
  filters,
  reporting
} from './data.js'

// Import for utility object
import * as schema from './schema.js'
import * as data from './data.js'

// Combined utility object for convenience
export const BaseUtils = {
  // ID generation
  generateId: data.generateTransactionId,
  generateDocumentNumber: data.generateDocumentNumber,
  
  // Validation
  validate: data.validateBaseData,
  
  // Conversion and calculation
  convertCurrency: data.convertCurrency,
  calculateAge: data.calculateDocumentAge,
  
  // Workflow
  checkApprovalRequired: data.checkApprovalRequired,
  updateTimestamp: data.updateTimestamp,
  
  // Creation
  createTransaction: data.createBaseTransaction,
  
  // Utilities
  formatters: data.formatters,
  filters: data.filters,
  reporting: data.reporting
}

// Re-export for backward compatibility
export { BaseUtils as baseUtils }

// Default export
export default {
  // Constants
  STATUS: schema.BASE_STATUS,
  PRIORITY: schema.BASE_PRIORITY,
  CURRENCIES: schema.BASE_CURRENCIES,
  APPROVAL_STATUS: schema.BASE_APPROVAL_STATUS,
  SYNC_STATUS: schema.BASE_SYNC_STATUS,
  CONFIG: schema.BASE_CONFIG,
  DEFAULTS: schema.BASE_DEFAULTS,
  SCHEMA: schema.BASE_SCHEMA_STRUCTURE,
  
  // Labels
  STATUS_LABELS: schema.BASE_STATUS_LABELS,
  PRIORITY_LABELS: schema.BASE_PRIORITY_LABELS,
  CURRENCY_LABELS: schema.BASE_CURRENCY_LABELS,
  APPROVAL_STATUS_LABELS: schema.BASE_APPROVAL_STATUS_LABELS,
  SYNC_STATUS_LABELS: schema.BASE_SYNC_STATUS_LABELS,
  
  // Utilities
  utils: BaseUtils
}