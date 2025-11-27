/**
 * Tax Invoice Transaction Schema
 * กำหนดโครงสร้างข้อมูลสำหรับใบกำกับภาษี
 */

// สถานะใบกำกับภาษี
export const TAX_INVOICE_STATES = [
  'draft',
  'issued',
  'sent',
  'paid',
  'cancelled',
  'voided'
]

// การเปลี่ยนสถานะใบกำกับภาษี
export const TAX_INVOICE_TRANSITIONS = {
  'draft': ['issued', 'cancelled'],
  'issued': ['sent', 'paid', 'voided'],
  'sent': ['paid', 'voided'],
  'paid': [], // สถานะสุดท้าย
  'cancelled': [], // สถานะสุดท้าย
  'voided': [] // สถานะสุดท้าย
}

// สถานะเริ่มต้น
export const TAX_INVOICE_INITIAL_STATE = 'issued'

// Storage key
export const TAX_INVOICE_STORAGE_KEY = 'erp_tax_invoice_transactions'

// ประเภท VAT
export const VAT_TYPES = {
  STANDARD: 'standard',
  EXEMPTED: 'exempted',
  ZERO_RATED: 'zero_rated'
}

// อัตรา VAT
export const VAT_RATES = {
  STANDARD: 7,
  EXEMPTED: 0,
  ZERO_RATED: 0
}

// ประเภทสาขา
export const BRANCH_TYPES = {
  HEAD_OFFICE: '00000',
  BRANCH_001: '00001',
  BRANCH_002: '00002',
  WAREHOUSE: '99999'
}

// Labels
export const TAX_INVOICE_STATE_LABELS = {
  'draft': 'ร่าง',
  'issued': 'ออกแล้ว',
  'sent': 'ส่งแล้ว',
  'paid': 'ชำระแล้ว',
  'cancelled': 'ยกเลิก',
  'voided': 'เป็นโมฆะ'
}

export const VAT_TYPE_LABELS = {
  [VAT_TYPES.STANDARD]: 'ภาษีมูลค่าเพิ่มมาตรฐาน',
  [VAT_TYPES.EXEMPTED]: 'ยกเว้นภาษีมูลค่าเพิ่ม',
  [VAT_TYPES.ZERO_RATED]: 'อัตราภาษีมูลค่าเพิ่มร้อยละ 0'
}

export const BRANCH_TYPE_LABELS = {
  [BRANCH_TYPES.HEAD_OFFICE]: 'สำนักงานใหญ่',
  [BRANCH_TYPES.BRANCH_001]: 'สาขา 001',
  [BRANCH_TYPES.BRANCH_002]: 'สาขา 002',
  [BRANCH_TYPES.WAREHOUSE]: 'คลังสินค้า'
}

// Field Schema สำหรับ Tax Invoice Transaction
export const TAX_INVOICE_FIELD_SCHEMA = {
  // Basic Information
  id: { type: 'string', required: true, description: 'รหัสใบกำกับภาษี (UUID)' },
  tax_invoice_number: { type: 'string', required: true, description: 'เลขที่ใบกำกับภาษี' },
  tax_invoice_date: { type: 'date', required: false, description: 'วันที่ออกใบกำกับภาษี' },
  status: { type: 'string', required: false, enum: TAX_INVOICE_STATES, default: TAX_INVOICE_INITIAL_STATE },
  
  // Reference Information
  delivery_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบจัดส่ง' },
  delivery_number: { type: 'string', required: false, description: 'เลขที่ใบจัดส่ง' },
  sales_order_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบสั่งขาย' },
  sales_order_number: { type: 'string', required: false, description: 'เลขที่ใบสั่งขาย' },
  receipt_id: { type: 'string', required: false, description: 'รหัสอ้างอิงใบเสร็จ' },
  receipt_number: { type: 'string', required: false, description: 'เลขที่ใบเสร็จ' },
  
  // Customer Information (ผู้ซื้อ)
  customer_id: { type: 'string', required: false, description: 'รหัสลูกค้า' },
  customer_name: { type: 'string', required: true, description: 'ชื่อลูกค้า/ผู้ซื้อ' },
  customer_phone: { type: 'string', required: false, description: 'เบอร์โทรลูกค้า' },
  customer_email: { type: 'string', required: false, description: 'อีเมลลูกค้า' },
  customer_tax_id: { type: 'string', required: false, description: 'เลขประจำตัวผู้เสียภาษีลูกค้า' },
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
  
  // Seller Information (ผู้ขาย) 
  seller_name: { type: 'string', required: false, description: 'ชื่อผู้ขาย' },
  seller_tax_id: { type: 'string', required: false, description: 'เลขประจำตัวผู้เสียภาษีผู้ขาย' },
  seller_address: {
    type: 'object',
    required: false,
    description: 'ที่อยู่ผู้ขาย',
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
        total_price: { type: 'number', required: false, min: 0, description: 'ราคารวม' },
        vat_type: { type: 'string', required: false, enum: Object.values(VAT_TYPES), default: VAT_TYPES.STANDARD }
      }
    }
  },
  
  // Financial Information
  subtotal: { type: 'number', required: true, min: 0, description: 'ราคาสินค้ารวม (ก่อน VAT)' },
  discount_amount: { type: 'number', required: false, min: 0, default: 0, description: 'ส่วนลด' },
  shipping_cost: { type: 'number', required: false, min: 0, default: 0, description: 'ค่าจัดส่ง' },
  net_total: { type: 'number', required: false, min: 0, description: 'ยอดสุทธิ (ก่อน VAT)' },
  
  // VAT Information
  vat_type: { type: 'string', required: false, enum: Object.values(VAT_TYPES), default: VAT_TYPES.STANDARD },
  vat_rate: { type: 'number', required: false, min: 0, max: 100, default: VAT_RATES.STANDARD },
  vat_amount: { type: 'number', required: true, min: 0, description: 'ยอด VAT' },
  grand_total: { type: 'number', required: true, min: 0, description: 'ยอดรวมทั้งสิ้น (รวม VAT)' },
  
  // Payment Information
  payment_terms: { type: 'string', required: false, description: 'เงื่อนไขการชำระเงิน' },
  payment_method: { type: 'string', required: false, description: 'วิธีการชำระเงิน' },
  payment_date: { type: 'date', required: false, description: 'วันที่ชำระเงิน' },
  payment_reference: { type: 'string', required: false, description: 'หมายเลขอ้างอิงการชำระเงิน' },
  due_date: { type: 'date', required: false, description: 'กำหนดชำระ' },
  
  // Branch Information
  branch_code: { type: 'string', required: false, enum: Object.values(BRANCH_TYPES), default: BRANCH_TYPES.HEAD_OFFICE },
  branch_name: { type: 'string', required: false, description: 'ชื่อสาขา' },
  
  // User Information
  issued_by: { type: 'string', required: false, description: 'ผู้ออกใบกำกับภาษี' },
  issued_date: { type: 'date', required: false, description: 'วันที่ออกใบกำกับภาษี' },
  approved_by: { type: 'string', required: false, description: 'ผู้อนุมัติ' },
  approved_date: { type: 'date', required: false, description: 'วันที่อนุมัติ' },
  
  // Notes
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  terms_and_conditions: { type: 'string', required: false, description: 'ข้อกำหนดและเงื่อนไข' },
  
  // System fields (BASE_SCHEMA)
  created_date: { type: 'date', required: false, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, description: 'ผู้สร้าง' },
  updated_date: { type: 'date', required: false, description: 'วันที่แก้ไขล่าสุด' },
  updated_by: { type: 'string', required: false, description: 'ผู้แก้ไขล่าสุด' }
}

// Configuration
export const TAX_INVOICE_CONFIG = {
  NUMBER_FORMAT: 'TAX{year}{month}-{sequence:6}',
  DEFAULT_VAT_RATE: VAT_RATES.STANDARD,
  DEFAULT_VAT_TYPE: VAT_TYPES.STANDARD,
  DEFAULT_BRANCH_CODE: BRANCH_TYPES.HEAD_OFFICE,
  DEFAULT_PAYMENT_TERMS: 'ชำระเงินภายใน 30 วัน'
}

// Defaults
export const TAX_INVOICE_DEFAULTS = {
  status: TAX_INVOICE_INITIAL_STATE,
  vat_type: TAX_INVOICE_CONFIG.DEFAULT_VAT_TYPE,
  vat_rate: TAX_INVOICE_CONFIG.DEFAULT_VAT_RATE,
  branch_code: TAX_INVOICE_CONFIG.DEFAULT_BRANCH_CODE,
  payment_terms: TAX_INVOICE_CONFIG.DEFAULT_PAYMENT_TERMS,
  subtotal: 0,
  discount_amount: 0,
  shipping_cost: 0,
  net_total: 0,
  vat_amount: 0,
  grand_total: 0
}