/**
 * Returns Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับการคืนสินค้า
 */

// ประเภทการคืนสินค้า
export const RETURN_TYPES = {
  CUSTOMER_RETURN: 'customer_return',
  VENDOR_RETURN: 'vendor_return',
  INTERNAL_RETURN: 'internal_return',
  WARRANTY_RETURN: 'warranty_return',
  DEFECTIVE_RETURN: 'defective_return',
  EXCHANGE: 'exchange',
  REFUND: 'refund',
  CREDIT_NOTE: 'credit_note'
}

// สถานะการคืนสินค้า
export const RETURN_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_TRANSIT: 'in_transit',
  RECEIVED: 'received',
  INSPECTED: 'inspected',
  PROCESSED: 'processed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
}

// สาเหตุการคืนสินค้า
export const RETURN_REASONS = {
  DAMAGED: 'damaged',
  DEFECTIVE: 'defective',
  WRONG_ITEM: 'wrong_item',
  EXCESS_QUANTITY: 'excess_quantity',
  NOT_AS_DESCRIBED: 'not_as_described',
  LATE_DELIVERY: 'late_delivery',
  CUSTOMER_CHANGED_MIND: 'customer_changed_mind',
  QUALITY_ISSUE: 'quality_issue',
  WARRANTY_CLAIM: 'warranty_claim',
  EXPIRED: 'expired',
  OVERSTOCK: 'overstock',
  OTHER: 'other'
}

// เงื่อนไขสินค้าที่คืน
export const RETURN_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'damaged',
  DEFECTIVE: 'defective',
  EXPIRED: 'expired',
  OPENED: 'opened',
  MISSING_PARTS: 'missing_parts',
  REPAIRABLE: 'repairable',
  SCRAP: 'scrap'
}

// การดำเนินการกับสินค้าที่คืน
export const RETURN_ACTIONS = {
  RESTOCK: 'restock',
  REPAIR: 'repair',
  REFURBISH: 'refurbish',
  DISPOSE: 'dispose',
  RETURN_TO_VENDOR: 'return_to_vendor',
  REPLACE: 'replace',
  EXCHANGE: 'exchange',
  REFUND: 'refund',
  CREDIT: 'credit'
}

// ประเภทการชดเชย
export const COMPENSATION_TYPES = {
  FULL_REFUND: 'full_refund',
  PARTIAL_REFUND: 'partial_refund',
  STORE_CREDIT: 'store_credit',
  EXCHANGE: 'exchange',
  REPAIR: 'repair',
  REPLACEMENT: 'replacement',
  NO_COMPENSATION: 'no_compensation'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// ผลการตรวจสอบ
export const INSPECTION_RESULTS = {
  ACCEPTABLE: 'acceptable',
  MINOR_DAMAGE: 'minor_damage',
  MAJOR_DAMAGE: 'major_damage',
  DEFECTIVE: 'defective',
  MISSING_PARTS: 'missing_parts',
  NOT_RETURNABLE: 'not_returnable'
}

// ช่องทางการคืนสินค้า
export const RETURN_CHANNELS = {
  STORE: 'store',
  ONLINE: 'online',
  PHONE: 'phone',
  EMAIL: 'email',
  MAIL: 'mail',
  PICKUP: 'pickup',
  DROP_OFF: 'drop_off'
}

// ประเภทค่าใช้จ่าย
export const COST_TYPES = {
  SHIPPING: 'shipping',
  RESTOCKING: 'restocking',
  INSPECTION: 'inspection',
  REPAIR: 'repair',
  DISPOSAL: 'disposal',
  ADMINISTRATION: 'administration',
  REFUND: 'refund',
  REPLACEMENT: 'replacement'
}

// สถานะการชำระเงินคืน
export const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSED: 'processed',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// วิธีการชำระเงินคืน
export const REFUND_METHODS = {
  ORIGINAL_PAYMENT: 'original_payment',
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  STORE_CREDIT: 'store_credit',
  GIFT_CARD: 'gift_card'
}

// Labels สำหรับแสดงผล
export const RETURN_TYPE_LABELS = {
  [RETURN_TYPES.CUSTOMER_RETURN]: 'ลูกค้าคืนสินค้า',
  [RETURN_TYPES.VENDOR_RETURN]: 'คืนสินค้าให้ผู้จัดจำหน่าย',
  [RETURN_TYPES.INTERNAL_RETURN]: 'คืนสินค้าภายใน',
  [RETURN_TYPES.WARRANTY_RETURN]: 'คืนสินค้าตามการรับประกัน',
  [RETURN_TYPES.DEFECTIVE_RETURN]: 'คืนสินค้าเสียหาย',
  [RETURN_TYPES.EXCHANGE]: 'แลกเปลี่ยนสินค้า',
  [RETURN_TYPES.REFUND]: 'คืนเงิน',
  [RETURN_TYPES.CREDIT_NOTE]: 'ใบลดหนี้'
}

export const RETURN_STATUS_LABELS = {
  [RETURN_STATUS.REQUESTED]: 'ขอคืนสินค้า',
  [RETURN_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [RETURN_STATUS.REJECTED]: 'ปฏิเสธ',
  [RETURN_STATUS.IN_TRANSIT]: 'ระหว่างขนส่ง',
  [RETURN_STATUS.RECEIVED]: 'รับสินค้าแล้ว',
  [RETURN_STATUS.INSPECTED]: 'ตรวจสอบแล้ว',
  [RETURN_STATUS.PROCESSED]: 'ดำเนินการแล้ว',
  [RETURN_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [RETURN_STATUS.CANCELLED]: 'ยกเลิก',
  [RETURN_STATUS.ON_HOLD]: 'ระงับชั่วคราว'
}

export const RETURN_REASON_LABELS = {
  [RETURN_REASONS.DAMAGED]: 'สินค้าเสียหาย',
  [RETURN_REASONS.DEFECTIVE]: 'สินค้าบกพร่อง',
  [RETURN_REASONS.WRONG_ITEM]: 'สินค้าผิดรายการ',
  [RETURN_REASONS.EXCESS_QUANTITY]: 'จำนวนเกิน',
  [RETURN_REASONS.NOT_AS_DESCRIBED]: 'ไม่ตรงตามรายละเอียด',
  [RETURN_REASONS.LATE_DELIVERY]: 'ส่งของช้า',
  [RETURN_REASONS.CUSTOMER_CHANGED_MIND]: 'ลูกค้าเปลี่ยนใจ',
  [RETURN_REASONS.QUALITY_ISSUE]: 'ปัญหาคุณภาพ',
  [RETURN_REASONS.WARRANTY_CLAIM]: 'เคลมการรับประกัน',
  [RETURN_REASONS.EXPIRED]: 'หมดอายุ',
  [RETURN_REASONS.OVERSTOCK]: 'สต็อกเกิน',
  [RETURN_REASONS.OTHER]: 'อื่นๆ'
}

export const RETURN_CONDITION_LABELS = {
  [RETURN_CONDITIONS.NEW]: 'ใหม่',
  [RETURN_CONDITIONS.USED]: 'ใช้แล้ว',
  [RETURN_CONDITIONS.DAMAGED]: 'เสียหาย',
  [RETURN_CONDITIONS.DEFECTIVE]: 'บกพร่อง',
  [RETURN_CONDITIONS.EXPIRED]: 'หมดอายุ',
  [RETURN_CONDITIONS.OPENED]: 'เปิดแล้ว',
  [RETURN_CONDITIONS.MISSING_PARTS]: 'ขาดชิ้นส่วน',
  [RETURN_CONDITIONS.REPAIRABLE]: 'ซ่อมได้',
  [RETURN_CONDITIONS.SCRAP]: 'ทิ้ง'
}

export const RETURN_ACTION_LABELS = {
  [RETURN_ACTIONS.RESTOCK]: 'เข้าสต็อกใหม่',
  [RETURN_ACTIONS.REPAIR]: 'ซ่อมแซม',
  [RETURN_ACTIONS.REFURBISH]: 'ปรับปรุง',
  [RETURN_ACTIONS.DISPOSE]: 'ทิ้ง',
  [RETURN_ACTIONS.RETURN_TO_VENDOR]: 'คืนให้ผู้จัดจำหน่าย',
  [RETURN_ACTIONS.REPLACE]: 'เปลี่ยนใหม่',
  [RETURN_ACTIONS.EXCHANGE]: 'แลกเปลี่ยน',
  [RETURN_ACTIONS.REFUND]: 'คืนเงิน',
  [RETURN_ACTIONS.CREDIT]: 'เครดิต'
}

export const COMPENSATION_TYPE_LABELS = {
  [COMPENSATION_TYPES.FULL_REFUND]: 'คืนเงินเต็มจำนวน',
  [COMPENSATION_TYPES.PARTIAL_REFUND]: 'คืนเงินบางส่วน',
  [COMPENSATION_TYPES.STORE_CREDIT]: 'เครดิตร้าน',
  [COMPENSATION_TYPES.EXCHANGE]: 'แลกเปลี่ยน',
  [COMPENSATION_TYPES.REPAIR]: 'ซ่อมให้',
  [COMPENSATION_TYPES.REPLACEMENT]: 'เปลี่ยนใหม่',
  [COMPENSATION_TYPES.NO_COMPENSATION]: 'ไม่ชดเชย'
}

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'ต่ำ',
  [PRIORITY_LEVELS.NORMAL]: 'ปกติ',
  [PRIORITY_LEVELS.HIGH]: 'สูง',
  [PRIORITY_LEVELS.URGENT]: 'ด่วน',
  [PRIORITY_LEVELS.CRITICAL]: 'วิกฤต'
}

export const INSPECTION_RESULT_LABELS = {
  [INSPECTION_RESULTS.ACCEPTABLE]: 'ยอมรับได้',
  [INSPECTION_RESULTS.MINOR_DAMAGE]: 'เสียหายเล็กน้อย',
  [INSPECTION_RESULTS.MAJOR_DAMAGE]: 'เสียหายมาก',
  [INSPECTION_RESULTS.DEFECTIVE]: 'บกพร่อง',
  [INSPECTION_RESULTS.MISSING_PARTS]: 'ขาดชิ้นส่วน',
  [INSPECTION_RESULTS.NOT_RETURNABLE]: 'ไม่สามารถคืนได้'
}

export const RETURN_CHANNEL_LABELS = {
  [RETURN_CHANNELS.STORE]: 'ที่ร้าน',
  [RETURN_CHANNELS.ONLINE]: 'ออนไลน์',
  [RETURN_CHANNELS.PHONE]: 'โทรศัพท์',
  [RETURN_CHANNELS.EMAIL]: 'อีเมล',
  [RETURN_CHANNELS.MAIL]: 'ไปรษณีย์',
  [RETURN_CHANNELS.PICKUP]: 'รับที่บ้าน',
  [RETURN_CHANNELS.DROP_OFF]: 'ส่งที่จุดรับ'
}

export const COST_TYPE_LABELS = {
  [COST_TYPES.SHIPPING]: 'ค่าจัดส่ง',
  [COST_TYPES.RESTOCKING]: 'ค่าเก็บสต็อก',
  [COST_TYPES.INSPECTION]: 'ค่าตรวจสอบ',
  [COST_TYPES.REPAIR]: 'ค่าซ่อม',
  [COST_TYPES.DISPOSAL]: 'ค่าทิ้ง',
  [COST_TYPES.ADMINISTRATION]: 'ค่าดำเนินการ',
  [COST_TYPES.REFUND]: 'เงินคืน',
  [COST_TYPES.REPLACEMENT]: 'ค่าเปลี่ยน'
}

export const REFUND_STATUS_LABELS = {
  [REFUND_STATUS.PENDING]: 'รอดำเนินการ',
  [REFUND_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [REFUND_STATUS.PROCESSED]: 'ดำเนินการแล้ว',
  [REFUND_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [REFUND_STATUS.FAILED]: 'ล้มเหลว',
  [REFUND_STATUS.CANCELLED]: 'ยกเลิก'
}

export const REFUND_METHOD_LABELS = {
  [REFUND_METHODS.ORIGINAL_PAYMENT]: 'คืนตามช่องทางเดิم',
  [REFUND_METHODS.CASH]: 'เงินสด',
  [REFUND_METHODS.BANK_TRANSFER]: 'โอนเงิน',
  [REFUND_METHODS.CHECK]: 'เช็ค',
  [REFUND_METHODS.STORE_CREDIT]: 'เครดิตร้าน',
  [REFUND_METHODS.GIFT_CARD]: 'บัตรของขวัญ'
}

// การกำหนดค่าระบบ
export const RETURN_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    RETURN_REQUEST: 'RR{year}{month}-{number:5}',
    RETURN_AUTHORIZATION: 'RA{year}{month}-{number:5}',
    CREDIT_NOTE: 'CN{year}{month}-{number:5}',
    REFUND: 'RF{year}{month}-{number:5}'
  },
  
  // ระยะเวลาการคืนสินค้า (วัน)
  RETURN_PERIODS: {
    STANDARD: 30,
    ELECTRONICS: 14,
    PERISHABLE: 7,
    CUSTOM: 60,
    WARRANTY: 365
  },
  
  // ค่าธรรมเนียมการคืนสินค้า (%)
  RESTOCKING_FEES: {
    STANDARD: 0,
    OPENED: 15,
    USED: 25,
    CUSTOM: 30
  },
  
  // ระดับการอนุมัติตามมูลค่า
  APPROVAL_LEVELS: {
    SUPERVISOR: 5000,       // 5,000 บาท
    MANAGER: 20000,         // 20,000 บาท
    DIRECTOR: 50000,        // 50,000 บาท
    EXECUTIVE: Infinity     // ไม่จำกัด
  },
  
  // เวลาดำเนินการ (วัน)
  PROCESSING_TIMES: {
    [RETURN_STATUS.REQUESTED]: 1,    // วันทำการ
    [RETURN_STATUS.APPROVED]: 3,     // วันทำการ
    [RETURN_STATUS.RECEIVED]: 2,     // วันทำการ
    [RETURN_STATUS.INSPECTED]: 1,    // วันทำการ
    [RETURN_STATUS.PROCESSED]: 3     // วันทำการ
  },
  
  // การแจ้งเตือน (วันก่อนครบกำหนด)
  REMINDER_DAYS: {
    CUSTOMER_FOLLOW_UP: 5,
    INSPECTION_DUE: 2,
    REFUND_DUE: 1
  }
}

// ค่าเริ่มต้นของข้อมูล
export const RETURN_DEFAULTS = {
  type: RETURN_TYPES.CUSTOMER_RETURN,
  status: RETURN_STATUS.REQUESTED,
  priority: PRIORITY_LEVELS.NORMAL,
  channel: RETURN_CHANNELS.STORE,
  reason: RETURN_REASONS.OTHER,
  condition: RETURN_CONDITIONS.USED,
  action: RETURN_ACTIONS.RESTOCK,
  compensation_type: COMPENSATION_TYPES.FULL_REFUND,
  refund_method: REFUND_METHODS.ORIGINAL_PAYMENT,
  requires_inspection: true,
  restocking_fee_percentage: 0,
  shipping_cost_responsibility: 'customer' // 'customer' หรือ 'company'
}

// เทมเพลตการคืนสินค้าทั่วไป
export const RETURN_TEMPLATES = {
  DEFECTIVE_PRODUCT: {
    name: 'สินค้าบกพร่อง',
    type: RETURN_TYPES.DEFECTIVE_RETURN,
    reason: RETURN_REASONS.DEFECTIVE,
    priority: PRIORITY_LEVELS.HIGH,
    compensation_type: COMPENSATION_TYPES.REPLACEMENT,
    requires_inspection: true,
    restocking_fee_percentage: 0
  },
  WRONG_ITEM: {
    name: 'สินค้าผิดรายการ',
    type: RETURN_TYPES.CUSTOMER_RETURN,
    reason: RETURN_REASONS.WRONG_ITEM,
    priority: PRIORITY_LEVELS.HIGH,
    compensation_type: COMPENSATION_TYPES.EXCHANGE,
    requires_inspection: false,
    restocking_fee_percentage: 0
  },
  CUSTOMER_CHANGED_MIND: {
    name: 'ลูกค้าเปลี่ยนใจ',
    type: RETURN_TYPES.CUSTOMER_RETURN,
    reason: RETURN_REASONS.CUSTOMER_CHANGED_MIND,
    priority: PRIORITY_LEVELS.NORMAL,
    compensation_type: COMPENSATION_TYPES.STORE_CREDIT,
    requires_inspection: true,
    restocking_fee_percentage: 15
  },
  WARRANTY_CLAIM: {
    name: 'เคลมการรับประกัน',
    type: RETURN_TYPES.warranty_RETURN,
    reason: RETURN_REASONS.WARRANTY_CLAIM,
    priority: PRIORITY_LEVELS.HIGH,
    compensation_type: COMPENSATION_TYPES.REPAIR,
    requires_inspection: true,
    restocking_fee_percentage: 0
  }
}

// Transaction States - สถานะการทำธุรกรรม Returns
export const RETURNS_STATES = ['requested', 'approved', 'in_transit', 'received', 'processed', 'refunded', 'completed']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const RETURNS_TRANSITIONS = {
  'requested': ['approved'],
  'approved': ['in_transit'],
  'in_transit': ['received'],
  'received': ['processed'],
  'processed': ['refunded'],
  'refunded': ['completed'],
  'completed': [] // สถานะสุดท้าย
}

// Initial State
export const RETURNS_INITIAL_STATE = 'requested'

// Storage Key
export const RETURNS_STORAGE_KEY = 'erp_returns_transactions'