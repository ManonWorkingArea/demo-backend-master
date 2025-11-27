/**
 * Invoice Transaction Schema
 * กำหนดโครงสร้างข้อมูลสำหรับใบแจ้งหนี้/ใบส่งของ
 */

// สถานะใบแจ้งหนี้
export const INVOICE_STATES = [
  'draft',
  'sent',
  'viewed',
  'partial_paid',
  'paid',
  'overdue',
  'cancelled',
  'voided'
]

// การเปลี่ยนสถานะใบแจ้งหนี้
export const INVOICE_TRANSITIONS = {
  'draft': ['sent', 'cancelled'],
  'sent': ['viewed', 'paid', 'overdue', 'voided'],
  'viewed': ['partial_paid', 'paid', 'overdue', 'voided'],
  'partial_paid': ['paid', 'overdue', 'voided'],
  'paid': [], // สถานะสุดท้าย
  'overdue': ['partial_paid', 'paid', 'cancelled'],
  'cancelled': [], // สถานะสุดท้าย
  'voided': [] // สถานะสุดท้าย
}

// สถานะเริ่มต้น
export const INVOICE_INITIAL_STATE = 'draft'

// Storage key
export const INVOICE_STORAGE_KEY = 'erp_invoice_transactions'

// ประเภทใบแจ้งหนี้
export const INVOICE_TYPES = {
  STANDARD: 'standard',
  PROFORMA: 'proforma',
  RECURRING: 'recurring',
  CREDIT_NOTE: 'credit_note',
  DEBIT_NOTE: 'debit_note'
}

// ช่วงเวลาการชำระเงิน
export const PAYMENT_TERMS = {
  IMMEDIATE: 'immediate',
  NET_7: 'net_7',
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_60: 'net_60',
  NET_90: 'net_90',
  CUSTOM: 'custom'
}

// Labels
export const INVOICE_STATE_LABELS = {
  'draft': 'ร่าง',
  'sent': 'ส่งแล้ว',
  'viewed': 'ดูแล้ว',
  'partial_paid': 'ชำระบางส่วน',
  'paid': 'ชำระครบแล้ว',
  'overdue': 'เกินกำหนด',
  'cancelled': 'ยกเลิก',
  'voided': 'เป็นโมฆะ'
}

export const INVOICE_TYPE_LABELS = {
  [INVOICE_TYPES.STANDARD]: 'ใบแจ้งหนี้มาตรฐาน',
  [INVOICE_TYPES.PROFORMA]: 'ใบแจ้งหนี้เบื้องต้น',
  [INVOICE_TYPES.RECURRING]: 'ใบแจ้งหนี้ประจำ',
  [INVOICE_TYPES.CREDIT_NOTE]: 'ใบลดหนี้',
  [INVOICE_TYPES.DEBIT_NOTE]: 'ใบเพิ่มหนี้'
}

export const PAYMENT_TERM_LABELS = {
  [PAYMENT_TERMS.IMMEDIATE]: 'ชำระทันที',
  [PAYMENT_TERMS.NET_7]: 'ชำระภายใน 7 วัน',
  [PAYMENT_TERMS.NET_15]: 'ชำระภายใน 15 วัน',
  [PAYMENT_TERMS.NET_30]: 'ชำระภายใน 30 วัน',
  [PAYMENT_TERMS.NET_60]: 'ชำระภายใน 60 วัน',
  [PAYMENT_TERMS.NET_90]: 'ชำระภายใน 90 วัน',
  [PAYMENT_TERMS.CUSTOM]: 'กำหนดเอง'
}

// Field Schema สำหรับ Invoice Transaction
export const INVOICE_FIELD_SCHEMA = {
  // Basic Information
  id: { type: 'string', required: true, description: 'รหัสใบแจ้งหนี้ (UUID)' },
  invoice_number: { type: 'string', required: true, description: 'เลขที่ใบแจ้งหนี้' },
  invoice_date: { type: 'date', required: false, description: 'วันที่ออกใบแจ้งหนี้' },
  invoice_type: { type: 'string', required: false, enum: Object.values(INVOICE_TYPES), default: INVOICE_TYPES.STANDARD },
  status: { type: 'string', required: false, enum: INVOICE_STATES, default: INVOICE_INITIAL_STATE },
  
  // Reference Information
  delivery_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบจัดส่ง' },
  delivery_number: { type: 'string', required: false, description: 'เลขที่ใบจัดส่ง' },
  sales_order_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบสั่งขาย' },
  sales_order_number: { type: 'string', required: false, description: 'เลขที่ใบสั่งขาย' },
  quotation_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบเสนอราคา' },
  quotation_number: { type: 'string', required: false, description: 'เลขที่ใบเสนอราคา' },
  
  // Customer Information
  customer_id: { type: 'string', required: false, description: 'รหัสลูกค้า' },
  customer_name: { type: 'string', required: true, description: 'ชื่อลูกค้า' },
  customer_phone: { type: 'string', required: false, description: 'เบอร์โทรลูกค้า' },
  customer_email: { type: 'string', required: false, description: 'อีเมลลูกค้า' },
  customer_address: {
    type: 'object',
    required: false,
    description: 'ที่อยู่ลูกค้า',
    properties: {
      address: { type: 'string', required: false, description: 'ที่อยู่' },
      district: { type: 'string', required: false, description: 'ตำบล/แขวง' },
      amphoe: { type: 'string', required: false, description: 'อำเภอ/เขต' },
      province: { type: 'string', required: false, description: 'จังหวัด' },
      postal_code: { type: 'string', required: false, description: 'รหัสไปรษณีย์' }
    }
  },
  
  // Billing Information
  billing_address: {
    type: 'object',
    required: false,
    description: 'ที่อยู่สำหรับออกบิล',
    properties: {
      address: { type: 'string', required: false, description: 'ที่อยู่' },
      district: { type: 'string', required: false, description: 'ตำบล/แขวง' },
      amphoe: { type: 'string', required: false, description: 'อำเภอ/เขต' },
      province: { type: 'string', required: false, description: 'จังหวัด' },
      postal_code: { type: 'string', required: false, description: 'รหัสไปรษณีย์' }
    }
  },
  
  // Items Array
  items: {
    type: 'array',
    required: false,
    description: 'รายการสินค้า/บริการ',
    items: {
      type: 'object',
      properties: {
        product_id: { type: 'string', required: false, description: 'รหัสสินค้า' },
        product_name: { type: 'string', required: true, description: 'ชื่อสินค้า/บริการ' },
        product_code: { type: 'string', required: false, description: 'รหัสสินค้า' },
        description: { type: 'string', required: false, description: 'รายละเอียดสินค้า/บริการ' },
        quantity: { type: 'number', required: true, min: 0, description: 'จำนวน' },
        unit: { type: 'string', required: false, default: 'ชิ้น', description: 'หน่วยนับ' },
        unit_price: { type: 'number', required: true, min: 0, description: 'ราคาต่อหน่วย' },
        total_price: { type: 'number', required: false, min: 0, description: 'ราคารวม' },
        discount_percent: { type: 'number', required: false, min: 0, max: 100, default: 0, description: 'ส่วนลดเป็น %' },
        discount_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ส่วนลดเป็นจำนวนเงิน' }
      }
    }
  },
  
  // Financial Information
  subtotal: { type: 'number', required: true, min: 0, description: 'ราคาสินค้ารวม' },
  discount_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ส่วนลดรวม' },
  shipping_cost: { type: 'number', required: false, min: 0, default: 0, description: 'ค่าจัดส่ง' },
  tax_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ภาษี' },
  total_amount: { type: 'number', required: true, min: 0, description: 'ยอดรวมทั้งสิ้น' },
  
  // Payment Information
  payment_terms: { type: 'string', required: false, enum: Object.values(PAYMENT_TERMS), default: PAYMENT_TERMS.NET_30 },
  payment_terms_days: { type: 'number', required: false, min: 0, description: 'จำนวนวันกำหนดชำระ' },
  due_date: { type: 'date', required: false, description: 'วันครบกำหนดชำระ' },
  
  // Payment Tracking
  paid_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ยอดที่ชำระแล้ว' },
  remaining_amount: { type: 'number', required: false, min: 0, description: 'ยอดคงเหลือ' },
  payment_date: { type: 'date', required: false, description: 'วันที่ชำระ' },
  
  // Delivery Information
  delivery_date: { type: 'date', required: false, description: 'วันที่ส่งมอบ' },
  delivery_method: { type: 'string', required: false, description: 'วิธีการส่งมอบ' },
  
  // User Information
  created_by: { type: 'string', required: false, description: 'ผู้สร้าง' },
  sent_by: { type: 'string', required: false, description: 'ผู้ส่ง' },
  sent_date: { type: 'date', required: false, description: 'วันที่ส่ง' },
  
  // Notes
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  internal_notes: { type: 'string', required: false, description: 'หมายเหตุภายใน' },
  terms_and_conditions: { type: 'string', required: false, description: 'ข้อกำหนดและเงื่อนไข' },
  
  // System fields (BASE_SCHEMA)
  created_date: { type: 'date', required: false, description: 'วันที่สร้าง' },
  updated_date: { type: 'date', required: false, description: 'วันที่แก้ไขล่าสุด' },
  updated_by: { type: 'string', required: false, description: 'ผู้แก้ไขล่าสุด' }
}

// Configuration
export const INVOICE_CONFIG = {
  NUMBER_FORMAT: 'INV{year}{month}-{sequence:6}',
  DEFAULT_PAYMENT_TERMS: PAYMENT_TERMS.NET_30,
  DEFAULT_PAYMENT_TERMS_DAYS: 30,
  DEFAULT_INVOICE_TYPE: INVOICE_TYPES.STANDARD
}

// Defaults
export const INVOICE_DEFAULTS = {
  status: INVOICE_INITIAL_STATE,
  invoice_type: INVOICE_CONFIG.DEFAULT_INVOICE_TYPE,
  payment_terms: INVOICE_CONFIG.DEFAULT_PAYMENT_TERMS,
  payment_terms_days: INVOICE_CONFIG.DEFAULT_PAYMENT_TERMS_DAYS,
  subtotal: 0,
  discount_amount: 0,
  shipping_cost: 0,
  tax_amount: 0,
  total_amount: 0,
  paid_amount: 0
}