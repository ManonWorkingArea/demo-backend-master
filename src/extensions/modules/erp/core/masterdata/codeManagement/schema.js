/**
 * Code Management Master Data Schema
 * ระบบจัดการรหัสแบบศูนย์กลางสำหรับ supplier, product, document, customer
 */

/**
 * ประเภทของโมดูล
 */
export const CODE_MODULES = {
  SUPPLIER: 'supplier',
  PRODUCT: 'product', 
  DOCUMENT: 'document',
  CUSTOMER: 'customer',
  PURCHASE: 'purchase',
  SALES: 'sales',
  INVENTORY: 'inventory'
}

/**
 * ประเภทของ Pattern Components
 */
export const PATTERN_COMPONENTS = {
  PREFIX: 'prefix',           // คำนำหน้า (SUP, PRD, DOC, CUS)
  YEAR: 'year',              // ปี (YYYY, YY)
  MONTH: 'month',            // เดือน (MM, M)
  DAY: 'day',                // วัน (DD, D)
  SEQUENCE: 'sequence',       // เลขลำดับ (0001, 001)
  SEPARATOR: 'separator',     // ตัวคั่น (-, _, /)
  CUSTOM: 'custom'           // ค่าคงที่ที่กำหนดเอง
}

/**
 * รูปแบบของปี
 */
export const YEAR_FORMATS = {
  FULL: 'YYYY',              // 2025
  SHORT: 'YY'                // 25
}

/**
 * รูปแบบของเดือน
 */
export const MONTH_FORMATS = {
  PADDED: 'MM',              // 01, 02, ..., 12
  NORMAL: 'M'                // 1, 2, ..., 12
}

/**
 * รูปแบบของวัน
 */
export const DAY_FORMATS = {
  PADDED: 'DD',              // 01, 02, ..., 31
  NORMAL: 'D'                // 1, 2, ..., 31
}

/**
 * สกุลเงินสำหรับเลขลำดับ
 */
export const SEQUENCE_FORMATS = {
  FOUR_DIGIT: '0000',        // 0001, 0002, ..., 9999
  THREE_DIGIT: '000',        // 001, 002, ..., 999
  FIVE_DIGIT: '00000',       // 00001, 00002, ..., 99999
  SIX_DIGIT: '000000'        // 000001, 000002, ..., 999999
}

/**
 * รูปแบบเริ่มต้นสำหรับแต่ละโมดูล
 */
export const DEFAULT_CODE_PATTERNS = {
  [CODE_MODULES.SUPPLIER]: {
    module: CODE_MODULES.SUPPLIER,
    name: 'Supplier Code',
    description: 'รหัสผู้ขาย',
    pattern: 'SUP{YYYY}{0000}',
    components: [
      { type: PATTERN_COMPONENTS.PREFIX, value: 'SUP' },
      { type: PATTERN_COMPONENTS.YEAR, format: YEAR_FORMATS.FULL },
      { type: PATTERN_COMPONENTS.SEQUENCE, format: SEQUENCE_FORMATS.FOUR_DIGIT, resetPeriod: 'yearly' }
    ],
    resetPeriod: 'yearly',
    currentSequence: 0,
    isActive: true,
    example: 'SUP20250001'
  },
  
  [CODE_MODULES.PRODUCT]: {
    module: CODE_MODULES.PRODUCT,
    name: 'Product Code', 
    description: 'รหัสสินค้า',
    pattern: 'PRD{YY}{MM}{000}',
    components: [
      { type: PATTERN_COMPONENTS.PREFIX, value: 'PRD' },
      { type: PATTERN_COMPONENTS.YEAR, format: YEAR_FORMATS.SHORT },
      { type: PATTERN_COMPONENTS.MONTH, format: MONTH_FORMATS.PADDED },
      { type: PATTERN_COMPONENTS.SEQUENCE, format: SEQUENCE_FORMATS.THREE_DIGIT, resetPeriod: 'monthly' }
    ],
    resetPeriod: 'monthly',
    currentSequence: 0,
    isActive: true,
    example: 'PRD2510001'
  },
  
  [CODE_MODULES.DOCUMENT]: {
    module: CODE_MODULES.DOCUMENT,
    name: 'Document Code',
    description: 'รหัสเอกสาร',
    pattern: 'DOC-{YYYY}-{00000}',
    components: [
      { type: PATTERN_COMPONENTS.PREFIX, value: 'DOC' },
      { type: PATTERN_COMPONENTS.SEPARATOR, value: '-' },
      { type: PATTERN_COMPONENTS.YEAR, format: YEAR_FORMATS.FULL },
      { type: PATTERN_COMPONENTS.SEPARATOR, value: '-' },
      { type: PATTERN_COMPONENTS.SEQUENCE, format: SEQUENCE_FORMATS.FIVE_DIGIT, resetPeriod: 'yearly' }
    ],
    resetPeriod: 'yearly',
    currentSequence: 0,
    isActive: true,
    example: 'DOC-2025-00001'
  },
  
  [CODE_MODULES.CUSTOMER]: {
    module: CODE_MODULES.CUSTOMER,
    name: 'Customer Code',
    description: 'รหัสลูกค้า',
    pattern: 'CUS{YYYY}{0000}',
    components: [
      { type: PATTERN_COMPONENTS.PREFIX, value: 'CUS' },
      { type: PATTERN_COMPONENTS.YEAR, format: YEAR_FORMATS.FULL },
      { type: PATTERN_COMPONENTS.SEQUENCE, format: SEQUENCE_FORMATS.FOUR_DIGIT, resetPeriod: 'yearly' }
    ],
    resetPeriod: 'yearly',
    currentSequence: 0,
    isActive: true,
    example: 'CUS20250001'
  }
}

/**
 * ระยะเวลาการรีเซ็ตเลขลำดับ
 */
export const RESET_PERIODS = {
  NEVER: 'never',            // ไม่รีเซ็ต
  DAILY: 'daily',            // รีเซ็ตทุกวัน
  MONTHLY: 'monthly',        // รีเซ็ตทุกเดือน
  YEARLY: 'yearly'           // รีเซ็ตทุกปี
}

/**
 * สถานะของ Code Pattern
 */
export const CODE_PATTERN_STATUS = {
  ACTIVE: 'active',          // ใช้งานอยู่
  INACTIVE: 'inactive',      // ไม่ใช้งาน
  DRAFT: 'draft'            // ร่าง
}

/**
 * Code Management Schema สำหรับ Transaction Engine
 */
export const CODE_MANAGEMENT_SCHEMA = {
  // Basic Information
  id: { type: 'string', required: true },
  module: { type: 'string', required: true, enum: Object.values(CODE_MODULES) },
  name: { type: 'string', required: true, maxLength: 100 },
  description: { type: 'string', required: false, maxLength: 255 },
  
  // Pattern Configuration
  pattern: { type: 'string', required: true, maxLength: 200 },
  components: { type: 'array', required: true },
  
  // Sequence Management
  resetPeriod: { type: 'string', required: true, enum: Object.values(RESET_PERIODS) },
  currentSequence: { type: 'number', required: false, default: 0 },
  lastResetDate: { type: 'date', required: false },
  
  // Status & Control
  status: { type: 'string', required: false, enum: Object.values(CODE_PATTERN_STATUS), default: 'active' },
  isActive: { type: 'boolean', required: false, default: true },
  
  // Example & Validation
  example: { type: 'string', required: false, maxLength: 50 },
  validationPattern: { type: 'string', required: false, maxLength: 200 },
  
  // System Fields
  created_date: { type: 'date', required: false, default: () => new Date() },
  updated_date: { type: 'date', required: false, default: () => new Date() },
  created_by: { type: 'string', required: false, default: 'system' },
  updated_by: { type: 'string', required: false, default: 'system' },
  version: { type: 'number', required: false, default: 1 }
}

/**
 * ป้ายกำกับสำหรับแสดงผล
 */
export const CODE_MODULE_LABELS = {
  [CODE_MODULES.SUPPLIER]: 'ผู้ขาย',
  [CODE_MODULES.PRODUCT]: 'สินค้า',
  [CODE_MODULES.DOCUMENT]: 'เอกสาร',
  [CODE_MODULES.CUSTOMER]: 'ลูกค้า',
  [CODE_MODULES.PURCHASE]: 'ใบสั่งซื้อ',
  [CODE_MODULES.SALES]: 'ใบสั่งขาย',
  [CODE_MODULES.INVENTORY]: 'คลังสินค้า'
}

export const PATTERN_COMPONENT_LABELS = {
  [PATTERN_COMPONENTS.PREFIX]: 'คำนำหน้า',
  [PATTERN_COMPONENTS.YEAR]: 'ปี',
  [PATTERN_COMPONENTS.MONTH]: 'เดือน',
  [PATTERN_COMPONENTS.DAY]: 'วัน',
  [PATTERN_COMPONENTS.SEQUENCE]: 'เลขลำดับ',
  [PATTERN_COMPONENTS.SEPARATOR]: 'ตัวคั่น',
  [PATTERN_COMPONENTS.CUSTOM]: 'ค่าคงที่'
}

export const RESET_PERIOD_LABELS = {
  [RESET_PERIODS.NEVER]: 'ไม่รีเซ็ต',
  [RESET_PERIODS.DAILY]: 'รายวัน',
  [RESET_PERIODS.MONTHLY]: 'รายเดือน',
  [RESET_PERIODS.YEARLY]: 'รายปี'
}

export const CODE_PATTERN_STATUS_LABELS = {
  [CODE_PATTERN_STATUS.ACTIVE]: 'ใช้งานอยู่',
  [CODE_PATTERN_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [CODE_PATTERN_STATUS.DRAFT]: 'ร่าง'
}