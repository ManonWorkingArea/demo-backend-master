/**
 * Base Transaction Schema
 * กำหนดโครงสร้างข้อมูลพื้นฐานสำหรับธุรกรรมทั้งหมด
 */

// ประเภทสถานะทั่วไป
export const BASE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
}

// ระดับความสำคัญ
export const BASE_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// สกุลเงิน
export const BASE_CURRENCIES = {
  THB: 'THB',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  SGD: 'SGD',
  MYR: 'MYR',
  HKD: 'HKD',
  AUD: 'AUD'
}

// สถานะการอนุมัติ
export const BASE_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_REVIEW: 'requires_review',
  CONDITIONAL: 'conditional'
}

// สถานะการซิงค์
export const BASE_SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
  PARTIAL: 'partial'
}

// Labels สำหรับแสดงผล
export const BASE_STATUS_LABELS = {
  [BASE_STATUS.DRAFT]: 'ร่าง',
  [BASE_STATUS.PENDING]: 'รอดำเนินการ',
  [BASE_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [BASE_STATUS.REJECTED]: 'ปฏิเสธ',
  [BASE_STATUS.ACTIVE]: 'ใช้งาน',
  [BASE_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [BASE_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [BASE_STATUS.CANCELLED]: 'ยกเลิก',
  [BASE_STATUS.ARCHIVED]: 'เก็บถาวร'
}

export const BASE_PRIORITY_LABELS = {
  [BASE_PRIORITY.LOW]: 'ต่ำ',
  [BASE_PRIORITY.NORMAL]: 'ปกติ',
  [BASE_PRIORITY.HIGH]: 'สูง',
  [BASE_PRIORITY.URGENT]: 'ด่วน',
  [BASE_PRIORITY.CRITICAL]: 'วิกฤต'
}

export const BASE_CURRENCY_LABELS = {
  [BASE_CURRENCIES.THB]: 'บาทไทย',
  [BASE_CURRENCIES.USD]: 'ดอลลาร์สหรัฐ',
  [BASE_CURRENCIES.EUR]: 'ยูโร',
  [BASE_CURRENCIES.GBP]: 'ปอนด์อังกฤษ',
  [BASE_CURRENCIES.JPY]: 'เยนญี่ปุ่น',
  [BASE_CURRENCIES.CNY]: 'หยวนจีน',
  [BASE_CURRENCIES.SGD]: 'ดอลลาร์สิงคโปร์',
  [BASE_CURRENCIES.MYR]: 'ริงกิตมาเลเซีย',
  [BASE_CURRENCIES.HKD]: 'ดอลลาร์ฮ่องกง',
  [BASE_CURRENCIES.AUD]: 'ดอลลาร์ออสเตรเลีย'
}

export const BASE_APPROVAL_STATUS_LABELS = {
  [BASE_APPROVAL_STATUS.PENDING]: 'รอการอนุมัติ',
  [BASE_APPROVAL_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [BASE_APPROVAL_STATUS.REJECTED]: 'ปฏิเสธ',
  [BASE_APPROVAL_STATUS.REQUIRES_REVIEW]: 'ต้องตรวจสอบ',
  [BASE_APPROVAL_STATUS.CONDITIONAL]: 'อนุมัติมีเงื่อนไข'
}

export const BASE_SYNC_STATUS_LABELS = {
  [BASE_SYNC_STATUS.PENDING]: 'รอซิงค์',
  [BASE_SYNC_STATUS.SYNCING]: 'กำลังซิงค์',
  [BASE_SYNC_STATUS.SYNCED]: 'ซิงค์แล้ว',
  [BASE_SYNC_STATUS.FAILED]: 'ซิงค์ไม่สำเร็จ',
  [BASE_SYNC_STATUS.PARTIAL]: 'ซิงค์บางส่วน'
}

// การกำหนดค่าพื้นฐาน
export const BASE_CONFIG = {
  // รูปแบบ ID เริ่มต้น
  ID_PREFIX: 'TXN',
  ID_LENGTH: 12,
  
  // สกุลเงินเริ่มต้น
  DEFAULT_CURRENCY: BASE_CURRENCIES.THB,
  
  // อัตราแลกเปลี่ยนเริ่มต้น
  DEFAULT_EXCHANGE_RATE: 1,
  
  // ระดับความสำคัญเริ่มต้น
  DEFAULT_PRIORITY: BASE_PRIORITY.NORMAL,
  
  // สถานะเริ่มต้น
  DEFAULT_STATUS: BASE_STATUS.DRAFT,
  DEFAULT_APPROVAL_STATUS: BASE_APPROVAL_STATUS.PENDING,
  DEFAULT_SYNC_STATUS: BASE_SYNC_STATUS.PENDING,
  
  // การตั้งค่าเวลา
  TIMEZONE: 'Asia/Bangkok',
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  
  // การตั้งค่าการแสดงผล
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.'
}

// ค่าเริ่มต้นพื้นฐาน
export const BASE_DEFAULTS = {
  status: BASE_CONFIG.DEFAULT_STATUS,
  priority: BASE_CONFIG.DEFAULT_PRIORITY,
  currency: BASE_CONFIG.DEFAULT_CURRENCY,
  exchange_rate: BASE_CONFIG.DEFAULT_EXCHANGE_RATE,
  approval_status: BASE_CONFIG.DEFAULT_APPROVAL_STATUS,
  sync_status: BASE_CONFIG.DEFAULT_SYNC_STATUS,
  created_at: () => new Date(),
  updated_at: () => new Date()
}

// Base Schema Structure
export const BASE_SCHEMA_STRUCTURE = {
  // Core identification
  id: { type: 'string', required: false },
  transaction_id: { type: 'string', required: false },
  document_number: { type: 'string', required: false },
  reference_number: { type: 'string', required: false },
  
  // Transaction metadata
  transaction_type: { type: 'string', required: false },
  transaction_date: { type: 'date', required: false },
  status: { type: 'string', required: false, default: BASE_CONFIG.DEFAULT_STATUS },
  
  // Timestamps
  created_at: { type: 'date', required: false },
  updated_at: { type: 'date', required: false },
  created_by: { type: 'string', required: false },
  updated_by: { type: 'string', required: false },
  
  // Common business fields
  notes: { type: 'string', required: false },
  tags: { type: 'array', required: false, items: { type: 'string' } },
  priority: { type: 'string', required: false, default: BASE_CONFIG.DEFAULT_PRIORITY },
  
  // Financial
  currency: { type: 'string', required: false, default: BASE_CONFIG.DEFAULT_CURRENCY },
  exchange_rate: { type: 'number', required: false, default: BASE_CONFIG.DEFAULT_EXCHANGE_RATE },
  
  // Approval workflow
  approval_status: { type: 'string', required: false, default: BASE_CONFIG.DEFAULT_APPROVAL_STATUS },
  approved_by: { type: 'string', required: false },
  approved_at: { type: 'date', required: false },
  
  // Integration
  external_id: { type: 'string', required: false },
  external_reference: { type: 'string', required: false },
  sync_status: { type: 'string', required: false, default: BASE_CONFIG.DEFAULT_SYNC_STATUS }
}