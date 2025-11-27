/**
 * Sales Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับการขาย
 */

import { BASE_SCHEMA_STRUCTURE } from '../base/schema.js'

// ประเภทการขาย
export const SALES_TYPES = {
  REGULAR_SALE: 'regular_sale',
  WHOLESALE: 'wholesale',
  RETAIL: 'retail',
  EXPORT: 'export',
  CONSIGNMENT: 'consignment',
  RETURN_SALE: 'return_sale',
  PROMOTION: 'promotion',
  SAMPLE: 'sample'
}

// สถานะใบขาย
export const SALES_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
}

// ประเภทลูกค้า
export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  CORPORATE: 'corporate',
  GOVERNMENT: 'government',
  DEALER: 'dealer',
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer',
  END_USER: 'end_user',
  RESELLER: 'reseller'
}

// กลุ่มลูกค้า
export const CUSTOMER_GROUPS = {
  VIP: 'vip',
  PREMIUM: 'premium',
  STANDARD: 'standard',
  NEW: 'new',
  INACTIVE: 'inactive'
}

// เงื่อนไขการชำระเงิน
export const PAYMENT_TERMS = {
  CASH: 'cash',
  CREDIT_7: 'credit_7',
  CREDIT_15: 'credit_15',
  CREDIT_30: 'credit_30',
  CREDIT_45: 'credit_45',
  CREDIT_60: 'credit_60',
  CREDIT_90: 'credit_90',
  INSTALLMENT: 'installment',
  ADVANCE_PAYMENT: 'advance_payment'
}

// ประเภทส่วนลด
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  QUANTITY: 'quantity',
  VOLUME: 'volume',
  SEASONAL: 'seasonal',
  CLEARANCE: 'clearance',
  LOYALTY: 'loyalty',
  PROMOTIONAL: 'promotional'
}

// ประเภทภาษี
export const TAX_TYPES = {
  VAT: 'vat',
  WITHHOLDING: 'withholding',
  EXCISE: 'excise',
  EXPORT_TAX: 'export_tax',
  EXEMPT: 'exempt'
}

// สถานะการจัดส่ง
export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned'
}

// วิธีการจัดส่ง
export const SHIPPING_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  POST: 'post',
  EMS: 'ems',
  EXPRESS: 'express',
  FREIGHT: 'freight',
  COURIER: 'courier'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// ขั้นตอนการอนุมัติ
export const APPROVAL_STEPS = {
  SALES_TEAM: 'sales_team',
  SALES_MANAGER: 'sales_manager',
  FINANCE: 'finance',
  WAREHOUSE: 'warehouse',
  MANAGEMENT: 'management'
}

// ประเภทเอกสาร
export const DOCUMENT_TYPES = {
  QUOTATION: 'quotation',
  SALES_ORDER: 'sales_order',
  INVOICE: 'invoice',
  RECEIPT: 'receipt',
  DELIVERY_NOTE: 'delivery_note',
  CREDIT_NOTE: 'credit_note',
  DEBIT_NOTE: 'debit_note'
}

// รูปแบบการชำระเงิน
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CREDIT_CARD: 'credit_card',
  PROMISSORY_NOTE: 'promissory_note',
  BARTER: 'barter',
  OFFSET: 'offset'
}

// Labels สำหรับแสดงผล
export const SALES_TYPE_LABELS = {
  [SALES_TYPES.REGULAR_SALE]: 'ขายปกติ',
  [SALES_TYPES.WHOLESALE]: 'ขายส่ง',
  [SALES_TYPES.RETAIL]: 'ขายปลีก',
  [SALES_TYPES.EXPORT]: 'ส่งออก',
  [SALES_TYPES.CONSIGNMENT]: 'ฝากขาย',
  [SALES_TYPES.RETURN_SALE]: 'ขายคืน',
  [SALES_TYPES.PROMOTION]: 'โปรโมชั่น',
  [SALES_TYPES.SAMPLE]: 'ตัวอย่าง'
}

export const SALES_STATUS_LABELS = {
  [SALES_STATUS.DRAFT]: 'ร่าง',
  [SALES_STATUS.PENDING]: 'รอดำเนินการ',
  [SALES_STATUS.CONFIRMED]: 'ยืนยันแล้ว',
  [SALES_STATUS.PROCESSING]: 'กำลังดำเนินการ',
  [SALES_STATUS.SHIPPED]: 'จัดส่งแล้ว',
  [SALES_STATUS.DELIVERED]: 'ส่งมอบแล้ว',
  [SALES_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [SALES_STATUS.CANCELLED]: 'ยกเลิก',
  [SALES_STATUS.RETURNED]: 'ส่งคืน'
}

export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPES.INDIVIDUAL]: 'บุคคลธรรมดา',
  [CUSTOMER_TYPES.CORPORATE]: 'นิติบุคคล',
  [CUSTOMER_TYPES.GOVERNMENT]: 'หน่วยงานราชการ',
  [CUSTOMER_TYPES.DEALER]: 'ตัวแทนจำหน่าย',
  [CUSTOMER_TYPES.DISTRIBUTOR]: 'ผู้จัดจำหน่าย',
  [CUSTOMER_TYPES.RETAILER]: 'ร้านค้าปลีก',
  [CUSTOMER_TYPES.END_USER]: 'ผู้ใช้ปลายทาง',
  [CUSTOMER_TYPES.RESELLER]: 'ตัวแทนขาย'
}

export const CUSTOMER_GROUP_LABELS = {
  [CUSTOMER_GROUPS.VIP]: 'วีไอพี',
  [CUSTOMER_GROUPS.PREMIUM]: 'พรีเมียม',
  [CUSTOMER_GROUPS.STANDARD]: 'มาตรฐาน',
  [CUSTOMER_GROUPS.NEW]: 'ลูกค้าใหม่',
  [CUSTOMER_GROUPS.INACTIVE]: 'ไม่ใช้งาน'
}

export const PAYMENT_TERM_LABELS = {
  [PAYMENT_TERMS.CASH]: 'เงินสด',
  [PAYMENT_TERMS.CREDIT_7]: 'เครดิต 7 วัน',
  [PAYMENT_TERMS.CREDIT_15]: 'เครดิต 15 วัน',
  [PAYMENT_TERMS.CREDIT_30]: 'เครดิต 30 วัน',
  [PAYMENT_TERMS.CREDIT_45]: 'เครดิต 45 วัน',
  [PAYMENT_TERMS.CREDIT_60]: 'เครดิต 60 วัน',
  [PAYMENT_TERMS.CREDIT_90]: 'เครดิต 90 วัน',
  [PAYMENT_TERMS.INSTALLMENT]: 'ผ่อนชำระ',
  [PAYMENT_TERMS.ADVANCE_PAYMENT]: 'จ่ายล่วงหน้า'
}

// การกำหนดค่าระบบ
export const SALES_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    QUOTATION: 'QT{year}{month}-{number:4}',
    SALES_ORDER: 'SO{year}{month}-{number:4}',
    INVOICE: 'IV{year}{month}-{number:4}'
  },
  
  // อัตราภาษีมูลค่าเพิ่มเริ่มต้น
  DEFAULT_VAT_RATE: 7,
  
  // อัตราหัก ณ ที่จ่ายเริ่มต้น
  DEFAULT_WITHHOLDING_RATE: 3,
  
  // วันครบกำหนดเริ่มต้น
  DEFAULT_DUE_DATE_DAYS: 30,
  
  // จำนวนวันเตือนล่วงหน้า
  REMINDER_DAYS: 7,
  
  // ระดับการอนุมัติตามยอดเงิน
  APPROVAL_LEVELS: {
    SALES_TEAM: 100000,      // 100,000 บาท
    SALES_MANAGER: 500000,   // 500,000 บาท
    FINANCE: 1000000,        // 1,000,000 บาท
    MANAGEMENT: Infinity      // ไม่จำกัด
  }
}

// ค่าเริ่มต้นของข้อมูล
export const SALES_DEFAULTS = {
  type: SALES_TYPES.REGULAR_SALE,
  status: SALES_STATUS.DRAFT,
  customer_type: CUSTOMER_TYPES.INDIVIDUAL,
  customer_group: CUSTOMER_GROUPS.STANDARD,
  payment_term: PAYMENT_TERMS.CASH,
  payment_method: PAYMENT_METHODS.CASH,
  tax_type: TAX_TYPES.VAT,
  vat_rate: SALES_CONFIG.DEFAULT_VAT_RATE,
  withholding_rate: 0,
  discount_rate: 0,
  shipping_method: SHIPPING_METHODS.PICKUP,
  priority: PRIORITY_LEVELS.NORMAL
}

// Transaction States - สถานะการทำธุรกรรม Sales
export const SALES_STATES = ['draft', 'quoted', 'confirmed', 'delivered', 'invoiced', 'complete']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const SALES_TRANSITIONS = {
  'draft': ['quoted'],
  'quoted': ['confirmed'],
  'confirmed': ['delivered'],
  'delivered': ['invoiced'],
  'invoiced': ['complete'],
  'complete': [] // สถานะสุดท้าย
}

// Initial State
export const SALES_INITIAL_STATE = 'draft'

// Storage Key
export const SALES_STORAGE_KEY = 'erp_sales_transactions'

// Sales Schema Structure
export const SALES_SCHEMA = {
  // Inherit base schema
  ...BASE_SCHEMA_STRUCTURE,
  
  // Sales-specific fields
  order_number: { type: 'string', required: false },
  orderNumber: { type: 'string', required: false },
  
  // Customer information
  customer_id: { type: 'string', required: false },
  customer_name: { type: 'string', required: false },
  customerName: { type: 'string', required: false },
  customer_phone: { type: 'string', required: false },
  customer_email: { type: 'string', required: false },
  customer_address: { type: 'string', required: false },
  customer_type: { type: 'string', required: false },
  customer_group: { type: 'string', required: false },
  
  // Order details
  order_date: { type: 'date', required: false },
  due_date: { type: 'date', required: false },
  delivery_date: { type: 'date', required: false },
  
  // Financial fields
  subtotal: { type: 'number', required: false, min: 0 },
  discount: { type: 'number', required: false, min: 0 },
  discount_rate: { type: 'number', required: false, min: 0 },
  tax: { type: 'number', required: false, min: 0 },
  tax_rate: { type: 'number', required: false, min: 0 },
  taxRate: { type: 'number', required: false, min: 0 },
  total: { type: 'number', required: false, min: 0 },
  totalAmount: { type: 'number', required: false, min: 0 },
  
  // Items array
  items: {
    type: 'array',
    required: false,
    items: {
      properties: {
        id: { type: 'string', required: false },
        productId: { type: 'string', required: false },
        product_id: { type: 'string', required: false },
        productName: { type: 'string', required: false },
        product_name: { type: 'string', required: false },
        name: { type: 'string', required: false },
        itemName: { type: 'string', required: false },
        code: { type: 'string', required: false },
        sku: { type: 'string', required: false },
        quantity: { type: 'number', required: false, min: 0 },
        unit: { type: 'string', required: false },
        price: { type: 'number', required: false, min: 0 },
        unitPrice: { type: 'number', required: false, min: 0 },
        discount: { type: 'number', required: false, min: 0 },
        total: { type: 'number', required: false, min: 0 }
      }
    }
  },
  
  // Payment information
  payment_term: { type: 'string', required: false },
  payment_method: { type: 'string', required: false },
  payment_status: { type: 'string', required: false },
  
  // Shipping information
  shipping_method: { type: 'string', required: false },
  shipping_address: { type: 'string', required: false },
  shipping_cost: { type: 'number', required: false, min: 0 },
  tracking_number: { type: 'string', required: false },
  
  // Workflow
  workflow_status: { type: 'string', required: false },
  assigned_to: { type: 'string', required: false },
  
  // Activity log (local storage)
  activityLog: {
    type: 'array',
    required: false,
    items: {
      properties: {
        action: { type: 'string', required: false },
        description: { type: 'string', required: false },
        user: { type: 'string', required: false },
        timestamp: { type: 'date', required: false },
        notes: { type: 'string', required: false },
        from_status: { type: 'string', required: false },
        to_status: { type: 'string', required: false }
      }
    }
  },
  
  // Local activity log (client-side only)
  _localActivityLog: {
    type: 'array',
    required: false,
    items: {
      properties: {
        action: { type: 'string', required: false },
        description: { type: 'string', required: false },
        user: { type: 'string', required: false },
        timestamp: { type: 'date', required: false },
        notes: { type: 'string', required: false },
        from_status: { type: 'string', required: false },
        to_status: { type: 'string', required: false }
      }
    }
  }
}