/**
 * Document Transaction Schema
 * กำหนดโครงสร้างข้อมูลสำหรับเอกสารพิเศษ เช่น ใบเสร็จ ใบกำกับภาษี
 */

// ประเภทเอกสาร
export const DOCUMENT_TYPES = {
  RECEIPT: 'receipt',
  TAX_INVOICE: 'tax_invoice',
  CREDIT_NOTE: 'credit_note',
  DEBIT_NOTE: 'debit_note',
  DELIVERY_NOTE: 'delivery_note',
  PICKING_LIST: 'picking_list'
}

// สถานะเอกสาร
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  SENT: 'sent',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
  VOIDED: 'voided'
}

// ประเภทสาขา
export const BRANCH_TYPES = {
  HEAD_OFFICE: '00000',
  BRANCH_001: '00001',
  BRANCH_002: '00002',
  WAREHOUSE: '99999'
}

// Labels สำหรับแสดงผล
export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.RECEIPT]: 'ใบเสร็จรับเงิน',
  [DOCUMENT_TYPES.TAX_INVOICE]: 'ใบกำกับภาษี',
  [DOCUMENT_TYPES.CREDIT_NOTE]: 'ใบลดหนี้',
  [DOCUMENT_TYPES.DEBIT_NOTE]: 'ใบเพิ่มหนี้',
  [DOCUMENT_TYPES.DELIVERY_NOTE]: 'ใบส่งของ',
  [DOCUMENT_TYPES.PICKING_LIST]: 'ใบเบิกสินค้า'
}

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.DRAFT]: 'ร่าง',
  [DOCUMENT_STATUS.ISSUED]: 'ออกแล้ว',
  [DOCUMENT_STATUS.SENT]: 'ส่งแล้ว',
  [DOCUMENT_STATUS.RECEIVED]: 'ได้รับแล้ว',
  [DOCUMENT_STATUS.CANCELLED]: 'ยกเลิก',
  [DOCUMENT_STATUS.VOIDED]: 'เป็นโมฆะ'
}

export const BRANCH_TYPE_LABELS = {
  [BRANCH_TYPES.HEAD_OFFICE]: 'สำนักงานใหญ่',
  [BRANCH_TYPES.BRANCH_001]: 'สาขา 001',
  [BRANCH_TYPES.BRANCH_002]: 'สาขา 002',
  [BRANCH_TYPES.WAREHOUSE]: 'คลังสินค้า'
}

// การกำหนดค่าระบบ
export const DOCUMENT_CONFIG = {
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    RECEIPT: 'RCP{year}{month}-{number:6}',
    TAX_INVOICE: 'TAX{year}{month}-{number:6}',
    CREDIT_NOTE: 'CN{year}{month}-{number:6}',
    DEBIT_NOTE: 'DN{year}{month}-{number:6}'
  },
  
  // อัตราภาษีมูลค่าเพิ่มเริ่มต้น
  DEFAULT_VAT_RATE: 7,
  
  // วิธีการชำระเงินเริ่มต้น
  DEFAULT_PAYMENT_METHOD: 'เงินสด',
  
  // เงื่อนไขการชำระเงินเริ่มต้น
  DEFAULT_PAYMENT_TERMS: 'ชำระเงินสดทันที',
  
  // รหัสสาขาเริ่มต้น
  DEFAULT_BRANCH_CODE: BRANCH_TYPES.HEAD_OFFICE
}

// ค่าเริ่มต้น
export const DOCUMENT_DEFAULTS = {
  status: DOCUMENT_STATUS.DRAFT,
  vat_rate: DOCUMENT_CONFIG.DEFAULT_VAT_RATE,
  payment_method: DOCUMENT_CONFIG.DEFAULT_PAYMENT_METHOD,
  payment_terms: DOCUMENT_CONFIG.DEFAULT_PAYMENT_TERMS,
  branch_code: DOCUMENT_CONFIG.DEFAULT_BRANCH_CODE,
  shipping_cost: 0,
  discount_amount: 0
}

// Schema Structures สำหรับเอกสารแต่ละประเภท
export const RECEIPT_SCHEMA_STRUCTURE = {
  receipt_number: { type: 'string', required: true },
  delivery_id: { type: 'string', required: false },
  delivery_number: { type: 'string', required: false },
  customer_name: { type: 'string', required: true },
  customer_phone: { type: 'string', required: false },
  customer_email: { type: 'string', required: false },
  customer_address: { type: 'string', required: false },
  items: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        product_id: { type: 'string', required: false },
        product_name: { type: 'string', required: true },
        product_code: { type: 'string', required: false },
        quantity: { type: 'number', required: true, min: 0 },
        unit: { type: 'string', required: false, default: 'ชิ้น' },
        unit_price: { type: 'number', required: true, min: 0 },
        total_price: { type: 'number', required: false, min: 0 }
      }
    }
  },
  subtotal: { type: 'number', required: false, min: 0, default: 0 },
  total_amount: { type: 'number', required: true, min: 0 },
  shipping_cost: { type: 'number', required: false, min: 0, default: 0 },
  discount_amount: { type: 'number', required: false, min: 0, default: 0 },
  grand_total: { type: 'number', required: false, min: 0 },
  payment_method: { type: 'string', required: false, default: DOCUMENT_CONFIG.DEFAULT_PAYMENT_METHOD },
  payment_date: { type: 'date', required: false },
  payment_reference: { type: 'string', required: false },
  issued_by: { type: 'string', required: false }
}

export const TAX_INVOICE_SCHEMA_STRUCTURE = {
  tax_invoice_number: { type: 'string', required: true },
  delivery_id: { type: 'string', required: false },
  delivery_number: { type: 'string', required: false },
  customer_name: { type: 'string', required: true },
  customer_phone: { type: 'string', required: false },
  customer_email: { type: 'string', required: false },
  customer_tax_id: { type: 'string', required: false },
  customer_address: { type: 'object', required: false },
  items: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        product_id: { type: 'string', required: false },
        product_name: { type: 'string', required: true },
        product_code: { type: 'string', required: false },
        description: { type: 'string', required: false },
        quantity: { type: 'number', required: true, min: 0 },
        unit: { type: 'string', required: false, default: 'ชิ้น' },
        unit_price: { type: 'number', required: true, min: 0 },
        total_price: { type: 'number', required: false, min: 0 }
      }
    }
  },
  subtotal: { type: 'number', required: true, min: 0 },
  shipping_cost: { type: 'number', required: false, min: 0, default: 0 },
  discount_amount: { type: 'number', required: false, min: 0, default: 0 },
  net_total: { type: 'number', required: false, min: 0 },
  vat_rate: { type: 'number', required: false, min: 0, default: DOCUMENT_CONFIG.DEFAULT_VAT_RATE },
  vat_amount: { type: 'number', required: true, min: 0 },
  grand_total: { type: 'number', required: true, min: 0 },
  payment_terms: { type: 'string', required: false, default: DOCUMENT_CONFIG.DEFAULT_PAYMENT_TERMS },
  payment_method: { type: 'string', required: false },
  payment_date: { type: 'date', required: false },
  payment_reference: { type: 'string', required: false },
  issued_by: { type: 'string', required: false },
  branch_code: { type: 'string', required: false, default: DOCUMENT_CONFIG.DEFAULT_BRANCH_CODE }
}

// Transaction-specific field structures
export const TRANSACTION_FIELD_STRUCTURES = {
  INVENTORY: {
    product_id: { type: 'string', required: false },
    product_name: { type: 'string', required: false },
    sku: { type: 'string', required: false },
    quantity: { type: 'number', required: false, min: 0, default: 0 },
    unit: { type: 'string', required: false, default: 'ชิ้น' },
    warehouse: { type: 'string', required: false },
    location: { type: 'string', required: false },
    unit_price: { type: 'number', required: false, min: 0, default: 0 }
  },
  
  PURCHASE: {
    purchase_order_number: { type: 'string', required: false },
    supplier_id: { type: 'string', required: false },
    supplier_name: { type: 'string', required: false },
    total_amount: { type: 'number', required: false, min: 0 },
    status: { type: 'string', required: false, default: 'draft' }
  },
  
  SALES: {
    customer_id: { type: 'string', required: false },
    customer_name: { type: 'string', required: false },
    total_amount: { type: 'number', required: false, min: 0 },
    status: { type: 'string', required: false, default: 'draft' }
  },
  
  SALES_ORDER: {
    sales_order_number: { type: 'string', required: false },
    customer_id: { type: 'string', required: false },
    customer_name: { type: 'string', required: false },
    total_amount: { type: 'number', required: false, min: 0 },
    status: { type: 'string', required: false, default: 'draft' }
  },
  
  DELIVERY: {
    delivery_number: { type: 'string', required: false },
    customer_name: { type: 'string', required: false },
    delivery_address: { type: 'string', required: false },
    status: { type: 'string', required: false, default: 'pending' }
  },
  
  WORK_ORDER: {
    work_order_number: { type: 'string', required: false },
    title: { type: 'string', required: false },
    status: { type: 'string', required: false, default: 'open' },
    priority: { type: 'string', required: false, default: 'normal' }
  },
  
  PRODUCTION: {
    production_order_number: { type: 'string', required: false },
    product_id: { type: 'string', required: false },
    quantity_planned: { type: 'number', required: false, min: 0 },
    status: { type: 'string', required: false, default: 'planned' }
  },
  
  RETURNS: {
    return_number: { type: 'string', required: false },
    original_transaction_id: { type: 'string', required: false },
    reason: { type: 'string', required: false },
    status: { type: 'string', required: false, default: 'pending' }
  },
  
  QUOTATION: {
    quotation_number: { type: 'string', required: false },
    customer_id: { type: 'string', required: false },
    status: { type: 'string', required: false, default: 'draft' },
    valid_until: { type: 'date', required: false }
  },
  
  PAYMENT: {
    payment_number: { type: 'string', required: false },
    amount: { type: 'number', required: false, min: 0 },
    payment_type: { type: 'string', required: false },
    status: { type: 'string', required: false, default: 'pending' }
  }
}