/**
 * Document Factory
 * 
 * ตัวกลางสำหรับแปลงข้อมูลจากฐานข้อมูลเป็น Standard Document Schema
 * รองรับทุกประเภทเอกสารในระบบ
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

import { adaptPurchaseRequest } from './adapters/PurchaseRequestAdapter.js'
import { adaptInvoice } from './adapters/InvoiceAdapter.js'
import { adaptQuotation } from './adapters/QuotationAdapter.js'
import { createEmptyDocument, validateDocument } from './schemas/StandardDocumentSchema.js'

/**
 * Adapter Registry
 * เก็บ adapter functions สำหรับแต่ละประเภทเอกสาร
 */
const AdapterRegistry = {
  // Purchase/Procurement
  'purchase_request': adaptPurchaseRequest,
  'purchase_order': null, // TODO: Implement
  'receipt': null, // TODO: Implement
  
  // Sales
  'quotation': adaptQuotation,
  'sales_order': null, // TODO: Implement
  'invoice': adaptInvoice,
  'delivery_note': null, // TODO: Implement
  'credit_note': null, // TODO: Implement
  
  // Inventory
  'stock_movement': null, // TODO: Implement
  'stock_count': null, // TODO: Implement
  'transfer': null, // TODO: Implement
  
  // Financial
  'payment_voucher': null, // TODO: Implement
  'receipt_voucher': null, // TODO: Implement
  'journal_entry': null, // TODO: Implement
}

/**
 * Main Factory Function
 * แปลงข้อมูลจาก Database เป็น Standard Document
 * 
 * @param {string} documentType - ประเภทเอกสาร
 * @param {Object} rawData - ข้อมูลจากฐานข้อมูล
 * @param {Object} options - Options เพิ่มเติม
 * @returns {Object} Standard Document Object
 */
export function createStandardDocument(documentType, rawData, options = {}) {
  console.log(`🏭 Document Factory: Creating ${documentType}`)
  
  // ตรวจสอบว่ามี adapter หรือไม่
  const adapter = AdapterRegistry[documentType]
  
  if (!adapter) {
    console.warn(`⚠️ No adapter found for document type: ${documentType}`)
    
    // Return empty document with type
    return createEmptyDocument(documentType)
  }
  
  // แปลงข้อมูล
  try {
    const standardDocument = adapter(rawData, options)
    
    // Validate (ถ้าต้องการ)
    if (options.validate !== false) {
      const validation = validateDocument(standardDocument)
      if (!validation.valid) {
        console.warn(`⚠️ Document validation warnings for ${documentType}:`, validation.errors)
      }
    }
    
    console.log(`✅ Document Factory: Created ${documentType} successfully`)
    return standardDocument
    
  } catch (error) {
    console.error(`❌ Document Factory: Error creating ${documentType}:`, error)
    
    // Return empty document on error
    return createEmptyDocument(documentType)
  }
}

/**
 * Batch Processing
 * แปลงข้อมูลหลายเอกสารพร้อมกัน
 * 
 * @param {Array} documents - Array of {type, data}
 * @returns {Array} Array of standard documents
 */
export function createStandardDocuments(documents = []) {
  console.log(`🏭 Document Factory: Batch processing ${documents.length} documents`)
  
  return documents.map(({ type, data, options }) => {
    return createStandardDocument(type, data, options)
  })
}

/**
 * Check if adapter exists
 * @param {string} documentType - Document type
 * @returns {boolean} True if adapter exists
 */
export function hasAdapter(documentType) {
  return AdapterRegistry[documentType] !== null && AdapterRegistry[documentType] !== undefined
}

/**
 * Register new adapter
 * @param {string} documentType - Document type
 * @param {Function} adapterFunction - Adapter function
 */
export function registerAdapter(documentType, adapterFunction) {
  if (typeof adapterFunction !== 'function') {
    throw new Error('Adapter must be a function')
  }
  
  AdapterRegistry[documentType] = adapterFunction
  console.log(`✅ Registered adapter for: ${documentType}`)
}

/**
 * Get all available document types
 * @returns {Array} Array of document types with adapters
 */
export function getAvailableDocumentTypes() {
  return Object.keys(AdapterRegistry).filter(type => AdapterRegistry[type] !== null)
}

/**
 * Helper: Auto-detect document type from data
 * @param {Object} rawData - Raw data from database
 * @returns {string|null} Detected document type or null
 */
export function detectDocumentType(rawData) {
  if (!rawData) return null
  
  // Try to detect from various fields
  if (rawData.purchase_request_code || rawData.requestNumber) {
    return 'purchase_request'
  }
  
  if (rawData.invoice_number || rawData.invoice_code) {
    return 'invoice'
  }
  
  if (rawData.quotation_number || rawData.quote_number) {
    return 'quotation'
  }
  
  if (rawData.sales_order_number) {
    return 'sales_order'
  }
  
  // Check document_type or type field
  if (rawData.document_type) {
    return rawData.document_type
  }
  
  if (rawData.type) {
    return rawData.type
  }
  
  console.warn('⚠️ Could not detect document type from data')
  return null
}

/**
 * Smart Factory Function
 * แปลงข้อมูลโดยอัตโนมัติ โดยพยายามตรวจหาประเภทเอกสาร
 * 
 * @param {Object} rawData - ข้อมูลจากฐานข้อมูล
 * @param {Object} options - Options
 * @returns {Object} Standard Document Object
 */
export function createDocumentSmart(rawData, options = {}) {
  // Try to detect document type
  const detectedType = detectDocumentType(rawData)
  
  if (!detectedType) {
    console.error('❌ Could not detect document type')
    return null
  }
  
  console.log(`🤖 Smart Factory: Detected type as ${detectedType}`)
  return createStandardDocument(detectedType, rawData, options)
}

// Default export
export default {
  createStandardDocument,
  createStandardDocuments,
  createDocumentSmart,
  hasAdapter,
  registerAdapter,
  getAvailableDocumentTypes,
  detectDocumentType,
  AdapterRegistry,
}
