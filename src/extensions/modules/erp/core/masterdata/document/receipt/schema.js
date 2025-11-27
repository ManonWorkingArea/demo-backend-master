/**
 * Receipt Transaction Schema
 * กำหนดโครงสร้างข้อมูลสำหรับใบเสร็จรับเงิน
 */

// สถานะใบเสร็จ
export const RECEIPT_STATES = [
  'draft',
  'issued', 
  'paid',
  'cancelled',
  'voided'
]

// การเปลี่ยนสถานะใบเสร็จ
export const RECEIPT_TRANSITIONS = {
  'draft': ['issued', 'cancelled'],
  'issued': ['paid', 'voided'],
  'paid': [], // สถานะสุดท้าย
  'cancelled': [], // สถานะสุดท้าย
  'voided': [] // สถานะสุดท้าย
}

// สถานะเริ่มต้น
export const RECEIPT_INITIAL_STATE = 'issued'

// Storage key
export const RECEIPT_STORAGE_KEY = 'erp_receipt_transactions'

// ประเภทการชำระเงิน
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  CHEQUE: 'cheque',
  PROMISSORY_NOTE: 'promissory_note'
}

// Labels
export const RECEIPT_STATE_LABELS = {
  'draft': 'ร่าง',
  'issued': 'ออกแล้ว',
  'paid': 'ชำระแล้ว',
  'cancelled': 'ยกเลิก',
  'voided': 'เป็นโมฆะ'
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'เงินสด',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'โอนเงิน',
  [PAYMENT_METHODS.CREDIT_CARD]: 'บัตรเครดิต',
  [PAYMENT_METHODS.DEBIT_CARD]: 'บัตรเดบิต',
  [PAYMENT_METHODS.CHEQUE]: 'เช็ค',
  [PAYMENT_METHODS.PROMISSORY_NOTE]: 'ตั๋วเงิน'
}

// Field Schema สำหรับ Receipt Transaction
export const RECEIPT_FIELD_SCHEMA = {
  // Basic Information
  id: { type: 'string', required: true, description: 'รหัสใบเสร็จ (UUID)' },
  receipt_number: { type: 'string', required: true, description: 'เลขที่ใบเสร็จ' },
  receipt_date: { type: 'date', required: false, description: 'วันที่ออกใบเสร็จ' },
  status: { type: 'string', required: false, enum: RECEIPT_STATES, default: RECEIPT_INITIAL_STATE },
  
  // Reference Information
  delivery_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบจัดส่ง' },
  delivery_number: { type: 'string', required: false, description: 'เลขที่ใบจัดส่ง' },
  sales_order_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบสั่งขาย' },
  sales_order_number: { type: 'string', required: false, description: 'เลขที่ใบสั่งขาย' },
  
  // Customer Information
  customer_id: { type: 'string', required: false, description: 'รหัสลูกค้า' },
  customer_name: { type: 'string', required: true, description: 'ชื่อลูกค้า' },
  customer_phone: { type: 'string', required: false, description: 'เบอร์โทรลูกค้า' },
  customer_email: { type: 'string', required: false, description: 'อีเมลลูกค้า' },
  customer_address: { type: 'string', required: false, description: 'ที่อยู่ลูกค้า' },
  customer_tax_id: { type: 'string', required: false, description: 'เลขประจำตัวผู้เสียภาษี' },
  
  // Items Array
  items: {
    type: 'array',
    required: false,
    description: 'รายการสินค้า',
    items: {
      type: 'object',
      properties: {
        product_id: { type: 'string', required: false, description: 'รหัสสินค้า' },
        product_name: { type: 'string', required: true, description: 'ชื่อสินค้า' },
        product_code: { type: 'string', required: false, description: 'รหัสสินค้า' },
        description: { type: 'string', required: false, description: 'รายละเอียดสินค้า' },
        quantity: { type: 'number', required: true, min: 0, description: 'จำนวน' },
        unit: { type: 'string', required: false, default: 'ชิ้น', description: 'หน่วยนับ' },
        unit_price: { type: 'number', required: true, min: 0, description: 'ราคาต่อหน่วย' },
        total_price: { type: 'number', required: false, min: 0, description: 'ราคารวม' }
      }
    }
  },
  
  // Financial Information
  subtotal: { type: 'number', required: false, min: 0, default: 0, description: 'ราคาสินค้ารวม' },
  discount_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ส่วนลด' },
  shipping_cost: { type: 'number', required: false, min: 0, default: 0, description: 'ค่าจัดส่ง' },
  total_amount: { type: 'number', required: true, min: 0, description: 'ยอดรวมสุทธิ' },
  
  // Payment Information
  payment_method: { type: 'string', required: false, enum: Object.values(PAYMENT_METHODS), default: PAYMENT_METHODS.CASH },
  payment_date: { type: 'date', required: false, description: 'วันที่ชำระเงิน' },
  payment_reference: { type: 'string', required: false, description: 'หมายเลขอ้างอิงการชำระเงิน' },
  payment_terms: { type: 'string', required: false, description: 'เงื่อนไขการชำระเงิน' },
  
  // Branch Information
  branch_code: { type: 'string', required: false, description: 'รหัสสาขา' },
  branch_name: { type: 'string', required: false, description: 'ชื่อสาขา' },
  
  // User Information
  issued_by: { type: 'string', required: false, description: 'ผู้ออกใบเสร็จ' },
  issued_date: { type: 'date', required: false, description: 'วันที่ออกใบเสร็จ' },
  
  // Notes
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  
  // System fields (BASE_SCHEMA)
  created_date: { type: 'date', required: false, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, description: 'ผู้สร้าง' },
  updated_date: { type: 'date', required: false, description: 'วันที่แก้ไขล่าสุด' },
  updated_by: { type: 'string', required: false, description: 'ผู้แก้ไขล่าสุด' }
}

// Configuration
export const RECEIPT_CONFIG = {
  NUMBER_FORMAT: 'RC{year}{month}-{sequence:6}',
  DEFAULT_PAYMENT_METHOD: PAYMENT_METHODS.CASH,
  DEFAULT_PAYMENT_TERMS: 'ชำระเงินสดทันที'
}

// Defaults
export const RECEIPT_DEFAULTS = {
  status: RECEIPT_INITIAL_STATE,
  payment_method: RECEIPT_CONFIG.DEFAULT_PAYMENT_METHOD,
  payment_terms: RECEIPT_CONFIG.DEFAULT_PAYMENT_TERMS,
  subtotal: 0,
  discount_amount: 0,
  shipping_cost: 0,
  total_amount: 0
}