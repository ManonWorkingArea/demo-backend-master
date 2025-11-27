/**
 * Quotation Module Exports
 * ส่งออกฟังก์ชันและค่าคงที่สำหรับโมดูลใบเสนอราคา
 */

// Schema exports
export {
  QUOTATION_TYPES,
  QUOTATION_STATUS,
  CUSTOMER_TYPES,
  PRIORITY_LEVELS,
  COMPETITION_LEVELS,
  CONFIDENCE_LEVELS,
  DISCOUNT_TYPES,
  PAYMENT_TERMS,
  DELIVERY_TERMS,
  REJECTION_REASONS,
  DELIVERY_CHANNELS,
  FOLLOW_UP_TYPES,
  CONVERSION_STATUS,
  QUOTATION_CONFIG,
  QUOTATION_DEFAULTS,
  QUOTATION_TEMPLATES,
  QUOTATION_TYPE_LABELS,
  QUOTATION_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
  PRIORITY_LEVEL_LABELS,
  COMPETITION_LEVEL_LABELS,
  CONFIDENCE_LEVEL_LABELS,
  DISCOUNT_TYPE_LABELS,
  PAYMENT_TERM_LABELS,
  DELIVERY_TERM_LABELS,
  REJECTION_REASON_LABELS,
  DELIVERY_CHANNEL_LABELS,
  FOLLOW_UP_TYPE_LABELS,
  CONVERSION_STATUS_LABELS
} from './schema.js'

// Data function exports
export {
  generateQuotationNumber,
  calculateQuotationValue,
  calculateVolumeDiscount,
  validateQuotation,
  calculateExpiryDate,
  isQuotationExpired,
  getDaysUntilExpiry,
  generateFollowUpSchedule,
  calculateWinProbability,
  generateQuotationAnalysis,
  suggestQuotationImprovements,
  createQuotationFromTemplate,
  formatters,
  filters
} from './data.js'

// Import all for utility object
import * as schema from './schema.js'
import * as data from './data.js'

// Combined utility object for convenience
export const QuotationUtils = {
  // Document management
  generateNumber: data.generateQuotationNumber,
  calculateValue: data.calculateQuotationValue,
  calculateVolumeDiscount: data.calculateVolumeDiscount,
  validate: data.validateQuotation,
  
  // Date management
  calculateExpiry: data.calculateExpiryDate,
  isExpired: data.isQuotationExpired,
  getDaysUntilExpiry: data.getDaysUntilExpiry,
  
  // Business logic
  generateFollowUpSchedule: data.generateFollowUpSchedule,
  calculateWinProbability: data.calculateWinProbability,
  generateAnalysis: data.generateQuotationAnalysis,
  suggestImprovements: data.suggestQuotationImprovements,
  
  // Template management
  createFromTemplate: data.createQuotationFromTemplate,
  
  // Formatting and filtering
  formatters: data.formatters,
  filters: data.filters
}

// Re-export everything
export * from './schema.js'
export * from './data.js'
export { QUOTATION_CODE_CONFIG } from './data.js'

// Default export
export default {
  // Constants
  TYPES: schema.QUOTATION_TYPES,
  STATUS: schema.QUOTATION_STATUS,
  CUSTOMER_TYPES: schema.CUSTOMER_TYPES,
  PRIORITY_LEVELS: schema.PRIORITY_LEVELS,
  COMPETITION_LEVELS: schema.COMPETITION_LEVELS,
  CONFIDENCE_LEVELS: schema.CONFIDENCE_LEVELS,
  DISCOUNT_TYPES: schema.DISCOUNT_TYPES,
  PAYMENT_TERMS: schema.PAYMENT_TERMS,
  DELIVERY_TERMS: schema.DELIVERY_TERMS,
  REJECTION_REASONS: schema.REJECTION_REASONS,
  DELIVERY_CHANNELS: schema.DELIVERY_CHANNELS,
  FOLLOW_UP_TYPES: schema.FOLLOW_UP_TYPES,
  CONVERSION_STATUS: schema.CONVERSION_STATUS,
  CONFIG: schema.QUOTATION_CONFIG,
  DEFAULTS: schema.QUOTATION_DEFAULTS,
  TEMPLATES: schema.QUOTATION_TEMPLATES,
  
  // Labels
  TYPE_LABELS: schema.QUOTATION_TYPE_LABELS,
  STATUS_LABELS: schema.QUOTATION_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS: schema.CUSTOMER_TYPE_LABELS,
  PRIORITY_LEVEL_LABELS: schema.PRIORITY_LEVEL_LABELS,
  COMPETITION_LEVEL_LABELS: schema.COMPETITION_LEVEL_LABELS,
  CONFIDENCE_LEVEL_LABELS: schema.CONFIDENCE_LEVEL_LABELS,
  DISCOUNT_TYPE_LABELS: schema.DISCOUNT_TYPE_LABELS,
  PAYMENT_TERM_LABELS: schema.PAYMENT_TERM_LABELS,
  DELIVERY_TERM_LABELS: schema.DELIVERY_TERM_LABELS,
  REJECTION_REASON_LABELS: schema.REJECTION_REASON_LABELS,
  DELIVERY_CHANNEL_LABELS: schema.DELIVERY_CHANNEL_LABELS,
  FOLLOW_UP_TYPE_LABELS: schema.FOLLOW_UP_TYPE_LABELS,
  CONVERSION_STATUS_LABELS: schema.CONVERSION_STATUS_LABELS,
  
  // Utilities
  utils: QuotationUtils
}