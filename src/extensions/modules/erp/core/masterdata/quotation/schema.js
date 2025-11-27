/**
 * Quotation Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับใบเสนอราคา
 */

// ประเภทใบเสนอราคา
export const QUOTATION_TYPES = {
  STANDARD: 'standard',
  FORMAL: 'formal',
  INFORMAL: 'informal',
  TENDER: 'tender',
  RFQ: 'rfq', // Request for Quotation
  PROFORMA: 'proforma',
  ESTIMATE: 'estimate',
  BID: 'bid',
  PROPOSAL: 'proposal',
  BLANKET: 'blanket'
}

// สถานะใบเสนอราคา
export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  UNDER_REVIEW: 'under_review',
  NEGOTIATING: 'negotiating',
  REVISED: 'revised',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  CONVERTED: 'converted'
}

// ประเภทลูกค้า
export const CUSTOMER_TYPES = {
  NEW: 'new',
  EXISTING: 'existing',
  POTENTIAL: 'potential',
  VIP: 'vip',
  CORPORATE: 'corporate',
  GOVERNMENT: 'government',
  RESELLER: 'reseller',
  DISTRIBUTOR: 'distributor'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// ประเภทการแข่งขัน
export const COMPETITION_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
}

// ระดับความมั่นใจ
export const CONFIDENCE_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
}

// ประเภทส่วนลด
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  VOLUME: 'volume',
  EARLY_PAYMENT: 'early_payment',
  LOYALTY: 'loyalty',
  SEASONAL: 'seasonal',
  PROMOTIONAL: 'promotional',
  NEGOTIATED: 'negotiated'
}

// เงื่อนไขการชำระเงิน
export const PAYMENT_TERMS = {
  CASH: 'cash',
  NET_7: 'net_7',
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_45: 'net_45',
  NET_60: 'net_60',
  NET_90: 'net_90',
  ADVANCE_50: 'advance_50',
  ADVANCE_100: 'advance_100',
  COD: 'cod', // Cash on Delivery
  INSTALLMENT: 'installment'
}

// ประเภทการจัดส่ง
export const DELIVERY_TERMS = {
  EXW: 'exw', // Ex Works
  FCA: 'fca', // Free Carrier
  CPT: 'cpt', // Carriage Paid To
  CIP: 'cip', // Carriage and Insurance Paid To
  DAP: 'dap', // Delivered at Place
  DPU: 'dpu', // Delivered at Place Unloaded
  DDP: 'ddp', // Delivered Duty Paid
  FOB: 'fob', // Free on Board
  CIF: 'cif'  // Cost, Insurance, and Freight
}

// สาเหตุการปฏิเสธ
export const REJECTION_REASONS = {
  PRICE_TOO_HIGH: 'price_too_high',
  DELIVERY_TOO_LONG: 'delivery_too_long',
  SPECIFICATIONS_NOT_MET: 'specifications_not_met',
  COMPETITOR_CHOSEN: 'competitor_chosen',
  PROJECT_CANCELLED: 'project_cancelled',
  BUDGET_CONSTRAINTS: 'budget_constraints',
  TIMING_ISSUES: 'timing_issues',
  QUALITY_CONCERNS: 'quality_concerns',
  SERVICE_ISSUES: 'service_issues',
  OTHER: 'other'
}

// ช่องทางการส่ง
export const DELIVERY_CHANNELS = {
  EMAIL: 'email',
  PRINT: 'print',
  HAND_DELIVERY: 'hand_delivery',
  POST: 'post',
  COURIER: 'courier',
  ONLINE_PORTAL: 'online_portal',
  FAX: 'fax'
}

// ประเภทการติดตาม
export const FOLLOW_UP_TYPES = {
  PHONE_CALL: 'phone_call',
  EMAIL: 'email',
  MEETING: 'meeting',
  SITE_VISIT: 'site_visit',
  PRESENTATION: 'presentation',
  DEMONSTRATION: 'demonstration',
  NEGOTIATION: 'negotiation'
}

// สถานะการแปลงเป็นใบสั่งซื้อ
export const CONVERSION_STATUS = {
  NOT_CONVERTED: 'not_converted',
  PARTIALLY_CONVERTED: 'partially_converted',
  FULLY_CONVERTED: 'fully_converted'
}

// Labels สำหรับแสดงผล
export const QUOTATION_TYPE_LABELS = {
  [QUOTATION_TYPES.STANDARD]: 'ใบเสนอราคามาตรฐาน',
  [QUOTATION_TYPES.FORMAL]: 'ใบเสนอราคาทางการ',
  [QUOTATION_TYPES.INFORMAL]: 'ใบเสนอราคาไม่เป็นทางการ',
  [QUOTATION_TYPES.TENDER]: 'ใบเสนอราคาประกวดราคา',
  [QUOTATION_TYPES.RFQ]: 'ตอบใบขอใบเสนอราคา',
  [QUOTATION_TYPES.PROFORMA]: 'ใบแจ้งหนี้เบื้องต้น',
  [QUOTATION_TYPES.ESTIMATE]: 'ใบประมาณการ',
  [QUOTATION_TYPES.BID]: 'ใบประมูล',
  [QUOTATION_TYPES.PROPOSAL]: 'ข้อเสนอ',
  [QUOTATION_TYPES.BLANKET]: 'ใบเสนอราคาครอบคลุม'
}

export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUS.DRAFT]: 'ร่าง',
  [QUOTATION_STATUS.SENT]: 'ส่งแล้ว',
  [QUOTATION_STATUS.VIEWED]: 'ดูแล้ว',
  [QUOTATION_STATUS.UNDER_REVIEW]: 'กำลังพิจารณา',
  [QUOTATION_STATUS.NEGOTIATING]: 'กำลังเจรจา',
  [QUOTATION_STATUS.REVISED]: 'แก้ไขแล้ว',
  [QUOTATION_STATUS.ACCEPTED]: 'ยอมรับแล้ว',
  [QUOTATION_STATUS.REJECTED]: 'ปฏิเสธแล้ว',
  [QUOTATION_STATUS.EXPIRED]: 'หมดอายุ',
  [QUOTATION_STATUS.CANCELLED]: 'ยกเลิก',
  [QUOTATION_STATUS.CONVERTED]: 'แปลงเป็นออเดอร์แล้ว'
}

export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPES.NEW]: 'ลูกค้าใหม่',
  [CUSTOMER_TYPES.EXISTING]: 'ลูกค้าเก่า',
  [CUSTOMER_TYPES.POTENTIAL]: 'ลูกค้าที่มีโอกาส',
  [CUSTOMER_TYPES.VIP]: 'ลูกค้าวีไอพี',
  [CUSTOMER_TYPES.CORPORATE]: 'องค์กร',
  [CUSTOMER_TYPES.GOVERNMENT]: 'หน่วยงานราชการ',
  [CUSTOMER_TYPES.RESELLER]: 'ตัวแทนขาย',
  [CUSTOMER_TYPES.DISTRIBUTOR]: 'ผู้จัดจำหน่าย'
}

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'ต่ำ',
  [PRIORITY_LEVELS.NORMAL]: 'ปกติ',
  [PRIORITY_LEVELS.HIGH]: 'สูง',
  [PRIORITY_LEVELS.URGENT]: 'ด่วน',
  [PRIORITY_LEVELS.CRITICAL]: 'วิกฤต'
}

export const COMPETITION_LEVEL_LABELS = {
  [COMPETITION_LEVELS.NONE]: 'ไม่มี',
  [COMPETITION_LEVELS.LOW]: 'ต่ำ',
  [COMPETITION_LEVELS.MEDIUM]: 'ปานกลาง',
  [COMPETITION_LEVELS.HIGH]: 'สูง',
  [COMPETITION_LEVELS.VERY_HIGH]: 'สูงมาก'
}

export const CONFIDENCE_LEVEL_LABELS = {
  [CONFIDENCE_LEVELS.VERY_LOW]: 'ต่ำมาก',
  [CONFIDENCE_LEVELS.LOW]: 'ต่ำ',
  [CONFIDENCE_LEVELS.MEDIUM]: 'ปานกลาง',
  [CONFIDENCE_LEVELS.HIGH]: 'สูง',
  [CONFIDENCE_LEVELS.VERY_HIGH]: 'สูงมาก'
}

export const DISCOUNT_TYPE_LABELS = {
  [DISCOUNT_TYPES.PERCENTAGE]: 'ส่วนลดเปอร์เซ็นต์',
  [DISCOUNT_TYPES.FIXED]: 'ส่วนลดจำนวนคงที่',
  [DISCOUNT_TYPES.VOLUME]: 'ส่วนลดปริมาณ',
  [DISCOUNT_TYPES.EARLY_PAYMENT]: 'ส่วนลดจ่ายเร็ว',
  [DISCOUNT_TYPES.LOYALTY]: 'ส่วนลดลูกค้าภักดี',
  [DISCOUNT_TYPES.SEASONAL]: 'ส่วนลดตามฤดูกาล',
  [DISCOUNT_TYPES.PROMOTIONAL]: 'ส่วนลดโปรโมชั่น',
  [DISCOUNT_TYPES.NEGOTIATED]: 'ส่วนลดเจรจา'
}

export const PAYMENT_TERM_LABELS = {
  [PAYMENT_TERMS.CASH]: 'เงินสด',
  [PAYMENT_TERMS.NET_7]: 'เครดิต 7 วัน',
  [PAYMENT_TERMS.NET_15]: 'เครดิต 15 วัน',
  [PAYMENT_TERMS.NET_30]: 'เครดิต 30 วัน',
  [PAYMENT_TERMS.NET_45]: 'เครดิต 45 วัน',
  [PAYMENT_TERMS.NET_60]: 'เครดิต 60 วัน',
  [PAYMENT_TERMS.NET_90]: 'เครดิต 90 วัน',
  [PAYMENT_TERMS.ADVANCE_50]: 'มัดจำ 50%',
  [PAYMENT_TERMS.ADVANCE_100]: 'ชำระล่วงหน้า 100%',
  [PAYMENT_TERMS.COD]: 'เก็บเงินปลายทาง',
  [PAYMENT_TERMS.INSTALLMENT]: 'ผ่อนชำระ'
}

export const DELIVERY_TERM_LABELS = {
  [DELIVERY_TERMS.EXW]: 'EXW - Ex Works',
  [DELIVERY_TERMS.FCA]: 'FCA - Free Carrier',
  [DELIVERY_TERMS.CPT]: 'CPT - Carriage Paid To',
  [DELIVERY_TERMS.CIP]: 'CIP - Carriage and Insurance Paid To',
  [DELIVERY_TERMS.DAP]: 'DAP - Delivered at Place',
  [DELIVERY_TERMS.DPU]: 'DPU - Delivered at Place Unloaded',
  [DELIVERY_TERMS.DDP]: 'DDP - Delivered Duty Paid',
  [DELIVERY_TERMS.FOB]: 'FOB - Free on Board',
  [DELIVERY_TERMS.CIF]: 'CIF - Cost, Insurance, and Freight'
}

export const REJECTION_REASON_LABELS = {
  [REJECTION_REASONS.PRICE_TOO_HIGH]: 'ราคาสูงเกินไป',
  [REJECTION_REASONS.DELIVERY_TOO_LONG]: 'ระยะเวลาส่งมอบนานเกินไป',
  [REJECTION_REASONS.SPECIFICATIONS_NOT_MET]: 'ไม่ตรงตามข้อกำหนด',
  [REJECTION_REASONS.COMPETITOR_CHOSEN]: 'เลือกคู่แข่ง',
  [REJECTION_REASONS.PROJECT_CANCELLED]: 'ยกเลิกโครงการ',
  [REJECTION_REASONS.BUDGET_CONSTRAINTS]: 'ข้อจำกัดงงบประมาณ',
  [REJECTION_REASONS.TIMING_ISSUES]: 'ปัญหาเวลา',
  [REJECTION_REASONS.QUALITY_CONCERNS]: 'กังวลเรื่องคุณภาพ',
  [REJECTION_REASONS.SERVICE_ISSUES]: 'ปัญหาการบริการ',
  [REJECTION_REASONS.OTHER]: 'อื่นๆ'
}

export const DELIVERY_CHANNEL_LABELS = {
  [DELIVERY_CHANNELS.EMAIL]: 'อีเมล',
  [DELIVERY_CHANNELS.PRINT]: 'พิมพ์',
  [DELIVERY_CHANNELS.HAND_DELIVERY]: 'ส่งด้วยมือ',
  [DELIVERY_CHANNELS.POST]: 'ไปรษณีย์',
  [DELIVERY_CHANNELS.COURIER]: 'บริการจัดส่ง',
  [DELIVERY_CHANNELS.ONLINE_PORTAL]: 'พอร์ทัลออนไลน์',
  [DELIVERY_CHANNELS.FAX]: 'แฟ็กซ์'
}

export const FOLLOW_UP_TYPE_LABELS = {
  [FOLLOW_UP_TYPES.PHONE_CALL]: 'โทรศัพท์',
  [FOLLOW_UP_TYPES.EMAIL]: 'อีเมล',
  [FOLLOW_UP_TYPES.MEETING]: 'ประชุม',
  [FOLLOW_UP_TYPES.SITE_VISIT]: 'เยี่ยมชมสถานที่',
  [FOLLOW_UP_TYPES.PRESENTATION]: 'นำเสนอ',
  [FOLLOW_UP_TYPES.DEMONSTRATION]: 'สาธิต',
  [FOLLOW_UP_TYPES.NEGOTIATION]: 'เจรจา'
}

export const CONVERSION_STATUS_LABELS = {
  [CONVERSION_STATUS.NOT_CONVERTED]: 'ยังไม่แปลง',
  [CONVERSION_STATUS.PARTIALLY_CONVERTED]: 'แปลงบางส่วน',
  [CONVERSION_STATUS.FULLY_CONVERTED]: 'แปลงทั้งหมด'
}

// การกำหนดค่าระบบ
export const QUOTATION_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    QUOTATION: 'QT{year}{month}-{number:5}',
    REVISION: 'QT{year}{month}-{number:5}R{revision}',
    ESTIMATE: 'EST{year}{month}-{number:4}',
    PROPOSAL: 'PROP{year}{month}-{number:4}'
  },
  
  // ระยะเวลาใช้งานเริ่มต้น (วัน)
  DEFAULT_VALIDITY_PERIOD: 30,
  
  // ระยะเวลาการติดตาม
  FOLLOW_UP_SCHEDULE: {
    INITIAL: 3,      // 3 วันหลังส่ง
    REMINDER_1: 7,   // 7 วันหลังส่ง
    REMINDER_2: 14,  // 14 วันหลังส่ง
    FINAL: 21        // 21 วันหลังส่ง
  },
  
  // อัตราภาษีมูลค่าเพิ่มเริ่มต้น
  DEFAULT_VAT_RATE: 7,
  
  // อัตราหัก ณ ที่จ่ายเริ่มต้น
  DEFAULT_WITHHOLDING_RATE: 3,
  
  // ระดับการอนุมัติตามมูลค่า
  APPROVAL_LEVELS: {
    SALES_REP: 100000,      // 100,000 บาท
    SALES_MANAGER: 500000,  // 500,000 บาท
    SALES_DIRECTOR: 1000000,// 1,000,000 บาท
    VP_SALES: Infinity      // ไม่จำกัด
  },
  
  // ส่วนลดสูงสุดตามระดับ
  MAX_DISCOUNT_LEVELS: {
    SALES_REP: 10,      // 10%
    SALES_MANAGER: 20,  // 20%
    SALES_DIRECTOR: 30, // 30%
    VP_SALES: 50        // 50%
  },
  
  // เป้าหมายอัตราการแปลง (%)
  TARGET_CONVERSION_RATE: 25,
  
  // เวลาตอบสนองเฉลี่ย (ชั่วโมง)
  TARGET_RESPONSE_TIME: 24,
  
  // การแจ้งเตือน (วันก่อนหมดอายุ)
  EXPIRY_REMINDER_DAYS: [7, 3, 1]
}

// ค่าเริ่มต้นของข้อมูล
export const QUOTATION_DEFAULTS = {
  type: QUOTATION_TYPES.STANDARD,
  status: QUOTATION_STATUS.DRAFT,
  priority: PRIORITY_LEVELS.NORMAL,
  customer_type: CUSTOMER_TYPES.EXISTING,
  competition_level: COMPETITION_LEVELS.MEDIUM,
  confidence_level: CONFIDENCE_LEVELS.MEDIUM,
  payment_term: PAYMENT_TERMS.NET_30,
  delivery_term: DELIVERY_TERMS.EXW,
  delivery_channel: DELIVERY_CHANNELS.EMAIL,
  conversion_status: CONVERSION_STATUS.NOT_CONVERTED,
  validity_days: QUOTATION_CONFIG.DEFAULT_VALIDITY_PERIOD,
  vat_rate: QUOTATION_CONFIG.DEFAULT_VAT_RATE,
  withholding_rate: 0,
  revision_number: 0,
  requires_approval: true,
  auto_follow_up: true
}

// เทมเพลตใบเสนอราคาทั่วไป
export const QUOTATION_TEMPLATES = {
  STANDARD_PRODUCT: {
    name: 'ใบเสนอราคาสินค้ามาตรฐาน',
    type: QUOTATION_TYPES.STANDARD,
    payment_term: PAYMENT_TERMS.NET_30,
    delivery_term: DELIVERY_TERMS.EXW,
    validity_days: 30,
    includes_installation: false,
    includes_training: false,
    includes_warranty: true
  },
  SERVICE_PROPOSAL: {
    name: 'ข้อเสนอบริการ',
    type: QUOTATION_TYPES.PROPOSAL,
    payment_term: PAYMENT_TERMS.ADVANCE_50,
    delivery_term: DELIVERY_TERMS.DAP,
    validity_days: 45,
    includes_installation: true,
    includes_training: true,
    includes_warranty: true
  },
  GOVERNMENT_TENDER: {
    name: 'ใบเสนอราคาราชการ',
    type: QUOTATION_TYPES.TENDER,
    customer_type: CUSTOMER_TYPES.GOVERNMENT,
    payment_term: PAYMENT_TERMS.NET_30,
    delivery_term: DELIVERY_TERMS.DDP,
    validity_days: 60,
    withholding_rate: 3,
    requires_approval: true
  },
  BULK_ORDER: {
    name: 'ใบเสนอราคาจำนวนมาก',
    type: QUOTATION_TYPES.FORMAL,
    payment_term: PAYMENT_TERMS.NET_45,
    delivery_term: DELIVERY_TERMS.FOB,
    validity_days: 30,
    volume_discount_applicable: true,
    early_payment_discount: 2
  }
}

// Transaction States - สถานะการทำธุรกรรม Quotation
export const QUOTATION_STATES = ['draft', 'sent', 'acknowledged', 'accepted', 'rejected', 'expired', 'converted']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const QUOTATION_TRANSITIONS = {
  'draft': ['sent'],
  'sent': ['acknowledged', 'expired'],
  'acknowledged': ['accepted', 'rejected', 'expired'],
  'accepted': ['converted'],
  'rejected': [],
  'expired': [],
  'converted': [] // สถานะสุดท้าย
}

// Initial State
export const QUOTATION_INITIAL_STATE = 'draft'

// Storage Key
export const QUOTATION_STORAGE_KEY = 'erp_quotation_transactions'