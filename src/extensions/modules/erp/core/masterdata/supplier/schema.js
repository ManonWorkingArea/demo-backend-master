/**
 * Supplier Master Data Schema
 * โครงสร้างข้อมูลการจัดการผู้ขาย/ผู้จัดหา
 */

/**
 * ประเภทผู้ขาย
 */
export const SUPPLIER_TYPES = {
  DOMESTIC: 'domestic',           // ผู้ขายในประเทศ
  INTERNATIONAL: 'international', // ผู้ขายต่างประเทศ
  MANUFACTURER: 'manufacturer',   // ผู้ผลิต
  DISTRIBUTOR: 'distributor',     // ผู้จัดจำหน่าย
  WHOLESALER: 'wholesaler',       // ขายส่ง
  RETAILER: 'retailer',          // ขายปลีก
  SERVICE: 'service',            // ผู้ให้บริการ
  CONTRACTOR: 'contractor',       // ผู้รับเหมา
  INDIVIDUAL: 'individual',       // บุคคลธรรมดา
  GOVERNMENT: 'government'        // หน่วยงานราชการ
}

/**
 * สถานะผู้ขาย
 */
export const SUPPLIER_STATUS = {
  ACTIVE: 'active',               // ใช้งานอยู่
  INACTIVE: 'inactive',           // ไม่ใช้งาน
  PENDING: 'pending',             // รอการอนุมัติ
  SUSPENDED: 'suspended',         // ระงับการใช้งาน
  BLOCKED: 'blocked',             // ถูกบล็อก
  BLACKLISTED: 'blacklisted'      // ขึ้นบัญชีดำ
}

/**
 * ระดับการประเมิน
 */
export const SUPPLIER_RATING = {
  EXCELLENT: 'excellent',         // ดีเยี่ยม (A)
  GOOD: 'good',                  // ดี (B)
  AVERAGE: 'average',            // ปานกลาง (C)
  POOR: 'poor',                  // แย่ (D)
  UNRATED: 'unrated'             // ยังไม่ได้ประเมิน
}

/**
 * ประเภทการชำระเงิน
 */
export const PAYMENT_TERMS = {
  COD: 'cod',                    // เงินสดเมื่อได้รับสินค้า
  NET_7: 'net_7',               // เครดิต 7 วัน
  NET_15: 'net_15',             // เครดิต 15 วัน
  NET_30: 'net_30',             // เครดิต 30 วัน
  NET_45: 'net_45',             // เครดิต 45 วัน
  NET_60: 'net_60',             // เครดิต 60 วัน
  NET_90: 'net_90',             // เครดิต 90 วัน
  ADVANCE: 'advance',            // จ่ายล่วงหน้า
  INSTALLMENT: 'installment'     // ผ่อนชำระ
}

/**
 * สกุลเงิน
 */
export const CURRENCIES = {
  THB: 'THB',                    // บาทไทย
  USD: 'USD',                    // ดอลลาร์สหรัฐ
  EUR: 'EUR',                    // ยูโร
  JPY: 'JPY',                    // เยน
  CNY: 'CNY',                    // หยวน
  GBP: 'GBP',                    // ปอนด์
  SGD: 'SGD',                    // ดอลลาร์สิงคโปร์
  MYR: 'MYR'                     // ริงกิต
}

/**
 * ประเภทที่อยู่
 */
export const ADDRESS_TYPES = {
  BILLING: 'billing',            // ที่อยู่ออกใบแจ้งหนี้
  SHIPPING: 'shipping',          // ที่อยู่จัดส่ง
  OFFICE: 'office',             // ที่อยู่สำนักงาน
  WAREHOUSE: 'warehouse',        // ที่อยู่คลังสินค้า
  FACTORY: 'factory'            // ที่อยู่โรงงาน
}

/**
 * ประเภทการติดต่อ
 */
export const CONTACT_TYPES = {
  SALES: 'sales',               // ฝ่ายขาย
  PURCHASING: 'purchasing',      // ฝ่ายจัดซื้อ
  ACCOUNTING: 'accounting',      // ฝ่ายบัญชี
  TECHNICAL: 'technical',        // ฝ่ายเทคนิค
  MANAGEMENT: 'management',      // ผู้บริหาร
  CUSTOMER_SERVICE: 'customer_service' // ฝ่ายบริการลูกค้า
}

/**
 * ประเภทเอกสาร
 */
export const DOCUMENT_TYPES = {
  BUSINESS_REGISTRATION: 'business_registration',     // ใบทะเบียนพาณิชย์
  VAT_REGISTRATION: 'vat_registration',              // ใบทะเบียนภาษีมูลค่าเพิ่ม
  COMPANY_PROFILE: 'company_profile',                // โปรไฟล์บริษัท
  BANK_STATEMENT: 'bank_statement',                  // งบดุลธนาคาร
  FINANCIAL_STATEMENT: 'financial_statement',        // งบการเงิน
  CERTIFICATE: 'certificate',                       // ใบรับรองต่างๆ
  CONTRACT: 'contract',                             // สัญญา
  NDA: 'nda',                                      // ข้อตกลงการรักษาความลับ
  PRICE_LIST: 'price_list',                        // ใบแจ้งราคา
  PRODUCT_CATALOG: 'product_catalog'               // แคตตาล็อกสินค้า
}

/**
 * ค่าเริ่มต้นของระบบ
 */
export const SUPPLIER_DEFAULTS = {
  type: SUPPLIER_TYPES.DOMESTIC,
  status: SUPPLIER_STATUS.PENDING,
  rating: SUPPLIER_RATING.UNRATED,
  payment_terms: PAYMENT_TERMS.NET_30,
  currency: CURRENCIES.THB,
  credit_limit: 0,
  credit_days: 30,
  discount_percentage: 0,
  tax_rate: 7, // อัตราภาษีมูลค่าเพิ่มเริ่มต้น
  lead_time_days: 7,
  minimum_order_value: 0,
  is_active: true,
  requires_po: true, // ต้องใช้ Purchase Order
  auto_approve_limit: 0, // วงเงินอนุมัติอัตโนมัติ
  blacklist_reason: null,
  blacklist_date: null,
  created_at: new Date(),
  updated_at: new Date()
}

/**
 * การตั้งค่าระบบ
 */
export const SUPPLIER_CONFIG = {
  // รหัสผู้ขายเริ่มต้น
  DEFAULT_CODE_PREFIX: 'SUP',
  CODE_LENGTH: 8,
  
  // 🔢 Number Series Configuration (ใช้สำหรับ fallback ถ้า database ไม่มีข้อมูล)
  CODE_PATTERN: {
    prefix: 'SUP',
    format: '{prefix}{year}{sequence}',
    sequence: {
      digits: 4,
      start: 1,
      current: 0,
      resetOnYearChange: true
    }
  },
  
  // วงเงินเครดิตเริ่มต้น
  DEFAULT_CREDIT_LIMITS: {
    [SUPPLIER_TYPES.INDIVIDUAL]: 50000,
    [SUPPLIER_TYPES.DOMESTIC]: 100000,
    [SUPPLIER_TYPES.INTERNATIONAL]: 500000,
    [SUPPLIER_TYPES.MANUFACTURER]: 1000000,
    [SUPPLIER_TYPES.DISTRIBUTOR]: 500000,
    [SUPPLIER_TYPES.GOVERNMENT]: 2000000
  },
  
  // ระยะเวลาเครดิตเริ่มต้น
  DEFAULT_CREDIT_DAYS: {
    [SUPPLIER_TYPES.INDIVIDUAL]: 15,
    [SUPPLIER_TYPES.DOMESTIC]: 30,
    [SUPPLIER_TYPES.INTERNATIONAL]: 45,
    [SUPPLIER_TYPES.GOVERNMENT]: 60
  },
  
  // ระยะเวลา Lead Time เริ่มต้น
  DEFAULT_LEAD_TIMES: {
    [SUPPLIER_TYPES.DOMESTIC]: 7,
    [SUPPLIER_TYPES.INTERNATIONAL]: 30,
    [SUPPLIER_TYPES.MANUFACTURER]: 14,
    [SUPPLIER_TYPES.DISTRIBUTOR]: 5,
    [SUPPLIER_TYPES.SERVICE]: 3
  },
  
  // เกณฑ์การประเมิน
  RATING_CRITERIA: {
    QUALITY: 'quality',           // คุณภาพสินค้า
    DELIVERY: 'delivery',         // การจัดส่ง
    PRICE: 'price',              // ราคา
    SERVICE: 'service',          // บริการ
    RELIABILITY: 'reliability'   // ความน่าเชื่อถือ
  },
  
  // น้ำหนักการประเมิน
  RATING_WEIGHTS: {
    quality: 30,      // 30%
    delivery: 25,     // 25%
    price: 20,        // 20%
    service: 15,      // 15%
    reliability: 10   // 10%
  },
  
  // เกณฑ์คะแนนการประเมิน
  RATING_THRESHOLDS: {
    [SUPPLIER_RATING.EXCELLENT]: 90,  // 90-100 คะแนน
    [SUPPLIER_RATING.GOOD]: 70,       // 70-89 คะแนน
    [SUPPLIER_RATING.AVERAGE]: 50,    // 50-69 คะแนน
    [SUPPLIER_RATING.POOR]: 0         // 0-49 คะแนน
  },
  
  // ฟิลด์ที่จำเป็นสำหรับแต่ละประเภท
  REQUIRED_FIELDS: {
    [SUPPLIER_TYPES.DOMESTIC]: ['name', 'tax_id', 'contact_person', 'phone', 'email'],
    [SUPPLIER_TYPES.INTERNATIONAL]: ['name', 'country', 'contact_person', 'phone', 'email'],
    [SUPPLIER_TYPES.INDIVIDUAL]: ['name', 'id_card', 'phone', 'address'],
    [SUPPLIER_TYPES.GOVERNMENT]: ['name', 'department', 'contact_person', 'phone', 'email']
  },
  
  // ระยะเวลาการตรวจสอบ
  REVIEW_PERIODS: {
    ANNUAL: 365,      // รายปี
    SEMI_ANNUAL: 180, // ครึ่งปี
    QUARTERLY: 90,    // รายไตรมาส
    MONTHLY: 30       // รายเดือน
  },
  
  // การแจ้งเตือน
  NOTIFICATION_SETTINGS: {
    CREDIT_LIMIT_WARNING: 80,     // แจ้งเตือนเมื่อใกล้ถึงวงเงินเครดิต 80%
    DOCUMENT_EXPIRY_DAYS: 30,     // แจ้งเตือนเอกสารหมดอายุ 30 วันล่วงหน้า
    PERFORMANCE_REVIEW_DAYS: 30,  // แจ้งเตือนการประเมินผล 30 วันล่วงหน้า
    INACTIVE_DAYS: 365           // แจ้งเตือนผู้ขายไม่ใช้งาน 1 ปี
  }
}

/**
 * ป้ายกำกับสำหรับแสดงผล
 */
export const SUPPLIER_TYPE_LABELS = {
  [SUPPLIER_TYPES.DOMESTIC]: 'ผู้ขายในประเทศ',
  [SUPPLIER_TYPES.INTERNATIONAL]: 'ผู้ขายต่างประเทศ',
  [SUPPLIER_TYPES.MANUFACTURER]: 'ผู้ผลิต',
  [SUPPLIER_TYPES.DISTRIBUTOR]: 'ผู้จัดจำหน่าย',
  [SUPPLIER_TYPES.WHOLESALER]: 'ขายส่ง',
  [SUPPLIER_TYPES.RETAILER]: 'ขายปลีก',
  [SUPPLIER_TYPES.SERVICE]: 'ผู้ให้บริการ',
  [SUPPLIER_TYPES.CONTRACTOR]: 'ผู้รับเหมา',
  [SUPPLIER_TYPES.INDIVIDUAL]: 'บุคคลธรรมดา',
  [SUPPLIER_TYPES.GOVERNMENT]: 'หน่วยงานราชการ'
}

export const SUPPLIER_STATUS_LABELS = {
  [SUPPLIER_STATUS.ACTIVE]: 'ใช้งานอยู่',
  [SUPPLIER_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [SUPPLIER_STATUS.PENDING]: 'รอการอนุมัติ',
  [SUPPLIER_STATUS.SUSPENDED]: 'ระงับการใช้งาน',
  [SUPPLIER_STATUS.BLOCKED]: 'ถูกบล็อก',
  [SUPPLIER_STATUS.BLACKLISTED]: 'ขึ้นบัญชีดำ'
}

export const SUPPLIER_RATING_LABELS = {
  [SUPPLIER_RATING.EXCELLENT]: 'ดีเยี่ยม (A)',
  [SUPPLIER_RATING.GOOD]: 'ดี (B)',
  [SUPPLIER_RATING.AVERAGE]: 'ปานกลาง (C)',
  [SUPPLIER_RATING.POOR]: 'แย่ (D)',
  [SUPPLIER_RATING.UNRATED]: 'ยังไม่ได้ประเมิน'
}

export const PAYMENT_TERMS_LABELS = {
  [PAYMENT_TERMS.COD]: 'เงินสดเมื่อได้รับสินค้า',
  [PAYMENT_TERMS.NET_7]: 'เครดิต 7 วัน',
  [PAYMENT_TERMS.NET_15]: 'เครดิต 15 วัน',
  [PAYMENT_TERMS.NET_30]: 'เครดิต 30 วัน',
  [PAYMENT_TERMS.NET_45]: 'เครดิต 45 วัน',
  [PAYMENT_TERMS.NET_60]: 'เครดิต 60 วัน',
  [PAYMENT_TERMS.NET_90]: 'เครดิต 90 วัน',
  [PAYMENT_TERMS.ADVANCE]: 'จ่ายล่วงหน้า',
  [PAYMENT_TERMS.INSTALLMENT]: 'ผ่อนชำระ'
}

export const ADDRESS_TYPE_LABELS = {
  [ADDRESS_TYPES.BILLING]: 'ที่อยู่ออกใบแจ้งหนี้',
  [ADDRESS_TYPES.SHIPPING]: 'ที่อยู่จัดส่ง',
  [ADDRESS_TYPES.OFFICE]: 'ที่อยู่สำนักงาน',
  [ADDRESS_TYPES.WAREHOUSE]: 'ที่อยู่คลังสินค้า',
  [ADDRESS_TYPES.FACTORY]: 'ที่อยู่โรงงาน'
}

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPES.SALES]: 'ฝ่ายขาย',
  [CONTACT_TYPES.PURCHASING]: 'ฝ่ายจัดซื้อ',
  [CONTACT_TYPES.ACCOUNTING]: 'ฝ่ายบัญชี',
  [CONTACT_TYPES.TECHNICAL]: 'ฝ่ายเทคนิค',
  [CONTACT_TYPES.MANAGEMENT]: 'ผู้บริหาร',
  [CONTACT_TYPES.CUSTOMER_SERVICE]: 'ฝ่ายบริการลูกค้า'
}

/**
 * เทมเพลตสำหรับประเภทผู้ขายต่างๆ
 */
export const SUPPLIER_TEMPLATES = {
  domestic_company: {
    type: SUPPLIER_TYPES.DOMESTIC,
    payment_terms: PAYMENT_TERMS.NET_30,
    currency: CURRENCIES.THB,
    tax_rate: 7,
    lead_time_days: 7,
    required_documents: [
      DOCUMENT_TYPES.BUSINESS_REGISTRATION,
      DOCUMENT_TYPES.VAT_REGISTRATION,
      DOCUMENT_TYPES.COMPANY_PROFILE
    ]
  },
  
  international_supplier: {
    type: SUPPLIER_TYPES.INTERNATIONAL,
    payment_terms: PAYMENT_TERMS.NET_45,
    currency: CURRENCIES.USD,
    tax_rate: 0,
    lead_time_days: 30,
    required_documents: [
      DOCUMENT_TYPES.COMPANY_PROFILE,
      DOCUMENT_TYPES.CERTIFICATE,
      DOCUMENT_TYPES.BANK_STATEMENT
    ]
  },
  
  individual_supplier: {
    type: SUPPLIER_TYPES.INDIVIDUAL,
    payment_terms: PAYMENT_TERMS.COD,
    currency: CURRENCIES.THB,
    tax_rate: 3,
    lead_time_days: 3,
    credit_limit: 50000,
    required_documents: []
  },
  
  service_provider: {
    type: SUPPLIER_TYPES.SERVICE,
    payment_terms: PAYMENT_TERMS.NET_30,
    currency: CURRENCIES.THB,
    tax_rate: 7,
    lead_time_days: 1,
    requires_po: false,
    required_documents: [
      DOCUMENT_TYPES.BUSINESS_REGISTRATION,
      DOCUMENT_TYPES.CERTIFICATE
    ]
  }
}

/**
 * Supplier Schema สำหรับ Transaction Engine - ใช้ snake_case ตาม FormSimple.vue
 */
export const SUPPLIER_SCHEMA = {
  // Basic Information - snake_case fields (ทำให้ส่วนใหญ่เป็น optional)
  supplier_code: { type: 'string', required: true, maxLength: 20 },
  name: { type: 'string', required: true, maxLength: 200 },
  type: { type: 'string', required: false, enum: Object.values(SUPPLIER_TYPES), default: 'domestic' },
  status: { type: 'string', required: false, enum: Object.values(SUPPLIER_STATUS), default: 'active' },
  
  // Tax Information - snake_case fields
  tax_id: { type: 'string', required: false, maxLength: 13 },
  business_number: { type: 'string', required: false, maxLength: 20 },
  
  // Contact Information - snake_case fields
  contact_person: { type: 'string', required: false, maxLength: 100 },
  phone: { type: 'string', required: false, maxLength: 20 },
  email: { type: 'string', required: false, maxLength: 100 },
  website: { type: 'string', required: false, maxLength: 200 },
  
  // Address Information - snake_case fields
  address: { type: 'string', required: false, maxLength: 500 },
  province: { type: 'string', required: false, maxLength: 50 },
  postal_code: { type: 'string', required: false, maxLength: 10 },
  country: { type: 'string', required: false, maxLength: 50, default: 'ไทย' },
  
  // Business Terms - snake_case fields
  payment_terms: { type: 'string', required: false, enum: Object.values(PAYMENT_TERMS), default: 'net_30' },
  credit_limit: { type: 'number', required: false, default: 0 },
  currency: { type: 'string', required: false, default: 'THB' },
  lead_time_days: { type: 'number', required: false, default: 7 },
  requires_po: { type: 'boolean', required: false, default: true },
  
  // System Fields - snake_case fields
  rating: { type: 'number', required: false, default: 0 },
  is_active: { type: 'boolean', required: false, default: true },
  
  // Timestamps - snake_case fields
  created_date: { type: 'date', required: false, default: () => new Date() },
  updated_date: { type: 'date', required: false, default: () => new Date() },
  
  // System Fields - เพิ่ม updated_by สำหรับ Transaction Engine
  updated_by: { type: 'string', required: false },
  created_by: { type: 'string', required: false },
  
  // Version control
  version: { type: 'number', required: false, default: 1 },
  
  // Additional
  notes: { type: 'string', required: false, maxLength: 1000 }
}