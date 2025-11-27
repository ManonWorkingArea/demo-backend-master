// Document Components Registry
// Central registry for all ERP document components

import PurchaseRequestDocument from './PurchaseRequestDocument.vue'
import InvoiceDocument from './InvoiceDocument.vue'
import QuotationDocument from './QuotationDocument.vue'

// Document Components Map
export const DocumentComponents = {
  
  // Purchase/Procurement Documents
  PurchaseRequestDocument,
  PurchaseOrderDocument: null, // TODO: Create component
  ReceiptDocument: null, // TODO: Create component
  
  // Sales Documents
  QuotationDocument,
  SalesOrderDocument: null, // TODO: Create component
  InvoiceDocument,
  DeliveryNoteDocument: null, // TODO: Create component
  CreditNoteDocument: null, // TODO: Create component
  
  // Inventory Documents
  StockMovementDocument: null, // TODO: Create component
  StockCountDocument: null, // TODO: Create component
  TransferDocument: null, // TODO: Create component
  
  // Financial Documents
  PaymentVoucherDocument: null, // TODO: Create component
  ReceiptVoucherDocument: null, // TODO: Create component
  JournalEntryDocument: null, // TODO: Create component
  
  // HR Documents
  PayrollDocument: null, // TODO: Create component
  LeaveRequestDocument: null, // TODO: Create component
  EmployeeDocument: null, // TODO: Create component
  
  // Production Documents
  WorkOrderDocument: null, // TODO: Create component
  BOMDocument: null, // TODO: Create component
  ProductionReportDocument: null, // TODO: Create component
  
  // Maintenance Documents
  MaintenanceRequestDocument: null, // TODO: Create component
  MaintenanceReportDocument: null, // TODO: Create component
  
  // Quality Documents
  QualityInspectionDocument: null, // TODO: Create component
  QualityReportDocument: null, // TODO: Create component
}

// Document Type Mapping
export const DocumentTypes = {
  // Purchase/Procurement
  'purchase_request': 'PurchaseRequestDocument',
  'purchase_order': 'PurchaseOrderDocument',
  'receipt': 'ReceiptDocument',
  
  // Sales
  'quotation': 'QuotationDocument',
  'sales_order': 'SalesOrderDocument',
  'invoice': 'InvoiceDocument',
  'delivery_note': 'DeliveryNoteDocument',
  'credit_note': 'CreditNoteDocument',
  
  // Inventory
  'stock_movement': 'StockMovementDocument',
  'stock_count': 'StockCountDocument',
  'transfer': 'TransferDocument',
  
  // Financial
  'payment_voucher': 'PaymentVoucherDocument',
  'receipt_voucher': 'ReceiptVoucherDocument',
  'journal_entry': 'JournalEntryDocument',
  
  // HR
  'payroll': 'PayrollDocument',
  'leave_request': 'LeaveRequestDocument',
  'employee': 'EmployeeDocument',
  
  // Production
  'work_order': 'WorkOrderDocument',
  'bom': 'BOMDocument',
  'production_report': 'ProductionReportDocument',
  
  // Maintenance
  'maintenance_request': 'MaintenanceRequestDocument',
  'maintenance_report': 'MaintenanceReportDocument',
  
  // Quality
  'quality_inspection': 'QualityInspectionDocument',
  'quality_report': 'QualityReportDocument',
}

// Document Categories
export const DocumentCategories = {
  purchase: {
    name: 'การจัดซื้อ',
    icon: '🛒',
    documents: ['purchase_request', 'purchase_order', 'receipt']
  },
  sales: {
    name: 'การขาย',
    icon: '💰',
    documents: ['quotation', 'sales_order', 'invoice', 'delivery_note', 'credit_note']
  },
  inventory: {
    name: 'คลังสินค้า',
    icon: '📦',
    documents: ['stock_movement', 'stock_count', 'transfer']
  },
  financial: {
    name: 'การเงิน',
    icon: '💳',
    documents: ['payment_voucher', 'receipt_voucher', 'journal_entry']
  },
  hr: {
    name: 'ทรัพยากรบุคคล',
    icon: '👥',
    documents: ['payroll', 'leave_request', 'employee']
  },
  production: {
    name: 'การผลิต',
    icon: '🏭',
    documents: ['work_order', 'bom', 'production_report']
  },
  maintenance: {
    name: 'การบำรุงรักษา',
    icon: '🔧',
    documents: ['maintenance_request', 'maintenance_report']
  },
  quality: {
    name: 'การควบคุมคุณภาพ',
    icon: '✅',
    documents: ['quality_inspection', 'quality_report']
  }
}

/**
 * Get document component by type
 * @param {string} documentType - The document type
 * @returns {Object|null} - Vue component or null if not found
 */
export function getDocumentComponent(documentType) {
  const componentName = DocumentTypes[documentType]
  if (!componentName) {
    console.warn(`Unknown document type: ${documentType}`)
    return null
  }
  
  const component = DocumentComponents[componentName]
  if (!component) {
    console.warn(`Component not implemented: ${componentName}`)
    return null
  }
  
  return component
}

/**
 * Check if document type is supported
 * @param {string} documentType - The document type
 * @returns {boolean} - True if supported
 */
export function isDocumentTypeSupported(documentType) {
  const componentName = DocumentTypes[documentType]
  return componentName && DocumentComponents[componentName] !== null
}

/**
 * Get all supported document types
 * @returns {Array} - Array of supported document types
 */
export function getSupportedDocumentTypes() {
  return Object.keys(DocumentTypes).filter(type => isDocumentTypeSupported(type))
}

/**
 * Get document category info
 * @param {string} documentType - The document type
 * @returns {Object|null} - Category info or null if not found
 */
export function getDocumentCategory(documentType) {
  for (const [categoryKey, category] of Object.entries(DocumentCategories)) {
    if (category.documents.includes(documentType)) {
      return { ...category, key: categoryKey }
    }
  }
  return null
}

/**
 * Get documents by category
 * @param {string} categoryKey - The category key
 * @returns {Array} - Array of document types in the category
 */
export function getDocumentsByCategory(categoryKey) {
  const category = DocumentCategories[categoryKey]
  return category ? category.documents : []
}

/**
 * Get available document components (non-null)
 * @returns {Object} - Object of available components
 */
export function getAvailableComponents() {
  const available = {}
  Object.entries(DocumentComponents).forEach(([key, component]) => {
    if (component !== null) {
      available[key] = component
    }
  })
  return available
}

/**
 * Register new document component
 * @param {string} componentName - Name of the component
 * @param {Object} component - Vue component
 * @param {string} documentType - Document type key
 */
export function registerDocumentComponent(componentName, component, documentType) {
  DocumentComponents[componentName] = component
  if (documentType) {
    DocumentTypes[documentType] = componentName
  }
}

// Default export
export default {
  DocumentComponents,
  DocumentTypes,
  DocumentCategories,
  getDocumentComponent,
  isDocumentTypeSupported,
  getSupportedDocumentTypes,
  getDocumentCategory,
  getDocumentsByCategory,
  getAvailableComponents,
  registerDocumentComponent,
  
  // Individual components
  PurchaseRequestDocument,
  InvoiceDocument,
  QuotationDocument
}