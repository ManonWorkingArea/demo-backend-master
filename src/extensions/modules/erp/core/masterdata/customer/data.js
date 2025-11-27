/**
 * Customer Master Data Configuration
 * ข้อมูลตั้งต้นและการกำหนดค่าสำหรับการจัดการลูกค้า
 */

// Customer Code Generation Configuration
export const CUSTOMER_CODE_CONFIG = {
  description: 'Customer Code Generation Configuration',
  patterns: {
    default: {
      prefix: 'CUS',
      year: false,
      month: false,
      day: false,
      sequence: {
        digits: 3,
        resetOnYearChange: false,
        resetOnMonthChange: false,
        resetOnDayChange: false
      }
    }
  },
  settings: {
    useTypeBasedCodes: false,
    autoGenerate: true,
    allowManual: true,
    validateUnique: true
  },
  validation: {
    pattern: '^CUS[0-9]{3}$',
    minLength: 6,
    maxLength: 6
  },
  examples: ['CUS001', 'CUS002', 'CUS003'],
  format: 'CUS{NNN}',
  formatDescription: 'รหัสลูกค้า - CUS + เลขลำดับ 3 หลัก'
}

// Default Customer Categories
export const DEFAULT_CUSTOMER_GROUPS = [
  {
    id: 'retail',
    name: 'ลูกค้าปลีก',
    description: 'ลูกค้าทั่วไป ซื้อในปริมาณน้อย',
    default_discount: 0,
    credit_limit: 10000,
    credit_days: 7,
    payment_terms: 'cash'
  },
  {
    id: 'wholesale', 
    name: 'ลูกค้าขายส่ง',
    description: 'ลูกค้าซื้อในปริมาณมาก เพื่อนำไปขายต่อ',
    default_discount: 5,
    credit_limit: 100000,
    credit_days: 30,
    payment_terms: 'net_30'
  },
  {
    id: 'distributor',
    name: 'ตัวแทนจำหน่าย',
    description: 'ตัวแทนจำหน่ายในพื้นที่ต่างๆ',
    default_discount: 10,
    credit_limit: 500000,
    credit_days: 45,
    payment_terms: 'net_45'
  },
  {
    id: 'vip',
    name: 'ลูกค้า VIP',
    description: 'ลูกค้าสำคัญ ได้รับสิทธิพิเศษ',
    default_discount: 15,
    credit_limit: 1000000,
    credit_days: 60,
    payment_terms: 'net_60'
  },
  {
    id: 'government',
    name: 'หน่วยงานรัฐ',
    description: 'หน่วยงานภาครัฐ มีขั้นตอนการจัดซื้อพิเศษ',
    default_discount: 0,
    credit_limit: 2000000,
    credit_days: 90,
    payment_terms: 'net_60'
  },
  {
    id: 'export',
    name: 'ลูกค้าส่งออก',
    description: 'ลูกค้าต่างประเทศ',
    default_discount: 0,
    credit_limit: 500000,
    credit_days: 30,
    payment_terms: 'advance'
  }
]

// Sales Channel Configuration
export const SALES_CHANNELS = [
  {
    id: 'direct',
    name: 'ขายตรง',
    description: 'ขายตรงจากบริษัทไปยังลูกค้า',
    commission_rate: 0
  },
  {
    id: 'online',
    name: 'ออนไลน์',
    description: 'ขายผ่านช่องทางออนไลน์',
    commission_rate: 2
  },
  {
    id: 'retail',
    name: 'ร้านค้าปลีก',
    description: 'ขายผ่านร้านค้าปลีก',
    commission_rate: 5
  },
  {
    id: 'wholesale',
    name: 'ร้านค้าขายส่ง',
    description: 'ขายผ่านร้านค้าขายส่ง',
    commission_rate: 3
  },
  {
    id: 'agent',
    name: 'ตัวแทน',
    description: 'ขายผ่านตัวแทนขาย',
    commission_rate: 8
  },
  {
    id: 'partner',
    name: 'พาร์ทเนอร์',
    description: 'ขายผ่านพาร์ทเนอร์ทางธุรกิจ',
    commission_rate: 10
  }
]

// Industry Categories
export const INDUSTRY_CATEGORIES = [
  'การเกษตร',
  'การผลิต',
  'การก่อสร้าง',
  'การขายปลีก',
  'การขายส่ง',
  'การขนส่ง',
  'การท่องเที่ยว',
  'การศึกษา',
  'การแพทย์',
  'เทคโนโลยี',
  'การเงินการธนาคาร',
  'อสังหาริมทรัพย์',
  'สื่อสารโทรคมนาคม',
  'พลังงาน',
  'สาธารณูปโภค',
  'บริการ',
  'รัฐบาล',
  'อื่นๆ'
]

// Payment Terms Configuration
export const PAYMENT_TERMS_CONFIG = {
  'cash': {
    name: 'เงินสด',
    description: 'ชำระเงินสดทันที',
    days: 0,
    discount_rate: 0
  },
  'cod': {
    name: 'เก็บเงินปลายทาง',
    description: 'ชำระเงินเมื่อได้รับสินค้า',
    days: 0,
    discount_rate: 0
  },
  'advance': {
    name: 'เงินล่วงหน้า',
    description: 'ชำระเงินล่วงหน้า 100%',
    days: -30,
    discount_rate: 3
  },
  'net_15': {
    name: 'เครดิต 15 วัน',
    description: 'ชำระเงินภายใน 15 วัน',
    days: 15,
    discount_rate: 0
  },
  'net_30': {
    name: 'เครดิต 30 วัน',
    description: 'ชำระเงินภายใน 30 วัน',
    days: 30,
    discount_rate: 0
  },
  'net_45': {
    name: 'เครดิต 45 วัน',
    description: 'ชำระเงินภายใน 45 วัน',
    days: 45,
    discount_rate: 0
  },
  'net_60': {
    name: 'เครดิต 60 วัน',
    description: 'ชำระเงินภายใน 60 วัน',
    days: 60,
    discount_rate: 0
  }
}

// Default Customer Templates
export const CUSTOMER_TEMPLATES = {
  individual: {
    customer_type: 'individual',
    customer_group: 'retail',
    sales_channel: 'direct',
    payment_terms: 'cash',
    credit_limit: 10000,
    credit_days: 7,
    currency: 'THB',
    country: 'ไทย',
    priority_level: 'normal',
    vat_registration: false
  },
  company: {
    customer_type: 'company',
    customer_group: 'wholesale',
    sales_channel: 'direct',
    payment_terms: 'net_30',
    credit_limit: 100000,
    credit_days: 30,
    currency: 'THB',
    country: 'ไทย',
    priority_level: 'normal',
    vat_registration: true,
    branch_code: '00000'
  },
  government: {
    customer_type: 'government',
    customer_group: 'government',
    sales_channel: 'direct',
    payment_terms: 'net_60',
    credit_limit: 2000000,
    credit_days: 90,
    currency: 'THB',
    country: 'ไทย',
    priority_level: 'high',
    vat_registration: true,
    branch_code: '00000'
  }
}

// Customer Validation Rules
export const CUSTOMER_VALIDATION_RULES = {
  customer_code: {
    required: true,
    unique: true,
    format: /^CUS[0-9]{3}$/
  },
  customer_name: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  tax_id: {
    format: /^[0-9]{13}$/,
    unique: true,
    message: 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก'
  },
  phone: {
    format: /^[0-9+\-\s()]+$/,
    message: 'รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง'
  },
  email: {
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'รูปแบบอีเมลไม่ถูกต้อง'
  },
  postal_code: {
    format: /^[0-9]{5}$/,
    message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
  },
  credit_limit: {
    min: 0,
    max: 50000000,
    message: 'วงเงินเครดิตต้องอยู่ในช่วง 0 - 50,000,000 บาท'
  },
  credit_days: {
    min: 0,
    max: 365,
    message: 'วันเครดิตต้องอยู่ในช่วง 0 - 365 วัน'
  }
}

// Export all customer data configurations
export default {
  CUSTOMER_CODE_CONFIG,
  DEFAULT_CUSTOMER_GROUPS,
  SALES_CHANNELS,
  INDUSTRY_CATEGORIES,
  PAYMENT_TERMS_CONFIG,
  CUSTOMER_TEMPLATES,
  CUSTOMER_VALIDATION_RULES
}