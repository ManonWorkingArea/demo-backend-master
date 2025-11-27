/**
 * Supplier Master Data Module
 * Export schema และ utilities สำหรับจัดการข้อมูล Supplier
 * 
 * ⚠️ SUPPLIER_CODE_CONFIG: ใช้เป็น fallback ถ้า number_series.supplier ใน database ไม่มีข้อมูล
 */

import {
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  SUPPLIER_SCHEMA,
  SUPPLIER_TEMPLATES,
  SUPPLIER_CONFIG,
  SUPPLIER_DEFAULTS,
  PAYMENT_TERMS,
  ADDRESS_TYPES,
  CONTACT_TYPES,
  DOCUMENT_TYPES,
  CURRENCIES,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  PAYMENT_TERMS_LABELS
} from './schema.js'

import {
  SUPPLIER_CODE_CONFIG,
  generateSupplierCode,
  validateSupplier,
  validateSupplierByType,
  formatSupplierData,
  calculateSupplierRating,
  formatSupplierDisplay,
  getSupplierStatusText,
  getSupplierTypeText,
  canTransitionSupplierStatus,
  generateSupplierReport,
  searchSuppliers,
  getSuppliersByStatus,
  getSuppliersByType,
  validateTaxId,
  validateBusinessNumber,
  formatAddress,
  formatContact,
  generateSupplierSummary,
  getSupplierPaymentInfo,
  updateSupplierRating,
  archiveSupplier,
  restoreSupplier
} from './data.js'

// Main Schema Export
export const SUPPLIER_SCHEMA_MODULE = {
  schema: SUPPLIER_SCHEMA,
  templates: SUPPLIER_TEMPLATES,
  config: SUPPLIER_CONFIG,
  defaults: SUPPLIER_DEFAULTS
}

// Business Logic Export
export const SUPPLIER_BUSINESS_LOGIC = {
  generateCode: generateSupplierCode,
  validate: validateSupplier,
  validateByType: validateSupplierByType,
  format: formatSupplierData,
  calculateRating: calculateSupplierRating,
  formatDisplay: formatSupplierDisplay,
  getStatusText: getSupplierStatusText,
  getTypeText: getSupplierTypeText,
  canTransitionSupplierStatus: canTransitionSupplierStatus,
  generateReport: generateSupplierReport,
  search: searchSuppliers,
  getByStatus: getSuppliersByStatus,
  getByType: getSuppliersByType,
  validateTaxId: validateTaxId,
  validateBusinessNumber: validateBusinessNumber,
  formatAddress: formatAddress,
  formatContact: formatContact,
  generateSummary: generateSupplierSummary,
  getPaymentInfo: getSupplierPaymentInfo,
  updateRating: updateSupplierRating,
  archive: archiveSupplier,
  restore: restoreSupplier
}

// Constants Export
export {
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  PAYMENT_TERMS,
  ADDRESS_TYPES,
  CONTACT_TYPES,
  DOCUMENT_TYPES,
  CURRENCIES,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  PAYMENT_TERMS_LABELS,
  SUPPLIER_CODE_CONFIG
}

// Main Schema Export for Transaction Engine
export { SUPPLIER_SCHEMA }

// Main Export (Default)
export default {
  SUPPLIER_SCHEMA,
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  PAYMENT_TERMS,
  SUPPLIER_CONFIG,
  SUPPLIER_DEFAULTS,
  SUPPLIER_TEMPLATES,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_CODE_CONFIG,
  business: SUPPLIER_BUSINESS_LOGIC,
  utils: {
    generateCode: generateSupplierCode,
    validate: validateSupplier,
    format: formatSupplierData,
    search: searchSuppliers
  }
}