/**
 * Payment Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับการชำระเงิน
 */

// ประเภทการชำระเงิน
export const PAYMENT_TYPES = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  CHECK: 'check',
  PROMISSORY_NOTE: 'promissory_note',
  MOBILE_BANKING: 'mobile_banking',
  E_WALLET: 'e_wallet',
  QR_CODE: 'qr_code',
  CRYPTOCURRENCY: 'cryptocurrency',
  INSTALLMENT: 'installment',
  CREDIT: 'credit'
}

// สถานะการชำระเงิน
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  DISPUTED: 'disputed',
  CHARGEBACK: 'chargeback',
  OVERDUE: 'overdue',
  PARTIAL: 'partial'
}

// ประเภทธุรกรรม
export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  PARTIAL_REFUND: 'partial_refund',
  CHARGEBACK: 'chargeback',
  REVERSAL: 'reversal',
  ADJUSTMENT: 'adjustment',
  FEE: 'fee',
  PENALTY: 'penalty',
  DISCOUNT: 'discount',
  TAX: 'tax'
}

// วิธีการชำระเงิน
export const PAYMENT_METHODS = {
  FULL_PAYMENT: 'full_payment',
  INSTALLMENT: 'installment',
  PARTIAL_PAYMENT: 'partial_payment',
  ADVANCE_PAYMENT: 'advance_payment',
  COD: 'cod', // Cash on Delivery
  CREDIT_TERMS: 'credit_terms',
  LAYAWAY: 'layaway',
  SUBSCRIPTION: 'subscription'
}

// ประเภทธนาคาร
export const BANK_TYPES = {
  COMMERCIAL: 'commercial',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  CENTRAL: 'central',
  FOREIGN: 'foreign',
  ISLAMIC: 'islamic',
  DIGITAL: 'digital'
}

// สกุลเงิน
export const CURRENCIES = {
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

// ระดับความเสี่ยง
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
  CRITICAL: 'critical'
}

// ประเภทค่าธรรมเนียม
export const FEE_TYPES = {
  TRANSACTION: 'transaction',
  PROCESSING: 'processing',
  GATEWAY: 'gateway',
  BANK: 'bank',
  CURRENCY_EXCHANGE: 'currency_exchange',
  LATE_PAYMENT: 'late_payment',
  EARLY_PAYMENT: 'early_payment',
  ADMIN: 'admin',
  SERVICE: 'service'
}

// ประเภทการคืนเงิน
export const REFUND_TYPES = {
  FULL: 'full',
  PARTIAL: 'partial',
  STORE_CREDIT: 'store_credit',
  EXCHANGE: 'exchange',
  VOUCHER: 'voucher',
  BANK_TRANSFER: 'bank_transfer',
  ORIGINAL_METHOD: 'original_method'
}

// เหตุผลการคืนเงิน
export const REFUND_REASONS = {
  CUSTOMER_REQUEST: 'customer_request',
  DEFECTIVE_PRODUCT: 'defective_product',
  WRONG_ITEM: 'wrong_item',
  DAMAGED_SHIPPING: 'damaged_shipping',
  NOT_AS_DESCRIBED: 'not_as_described',
  ORDER_CANCELLED: 'order_cancelled',
  DUPLICATE_PAYMENT: 'duplicate_payment',
  SYSTEM_ERROR: 'system_error',
  FRAUD: 'fraud',
  CHARGEBACK: 'chargeback'
}

// ประเภทการผ่อนชำระ
export const INSTALLMENT_TYPES = {
  EQUAL: 'equal',
  DECLINING: 'declining',
  BALLOON: 'balloon',
  INTEREST_ONLY: 'interest_only',
  GRADUATED: 'graduated',
  SEASONAL: 'seasonal',
  FLEXIBLE: 'flexible'
}

// ช่องทางการชำระเงิน
export const PAYMENT_CHANNELS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MOBILE_APP: 'mobile_app',
  ATM: 'atm',
  BRANCH: 'branch',
  AGENT: 'agent',
  KIOSK: 'kiosk',
  PHONE: 'phone',
  MAIL: 'mail',
  DIRECT_DEBIT: 'direct_debit'
}

// ประเภทการตรวจสอบ
export const VERIFICATION_TYPES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  BIOMETRIC: 'biometric',
  OTP: 'otp',
  TOKEN: 'token',
  SIGNATURE: 'signature',
  PIN: 'pin',
  PASSWORD: 'password',
  TWO_FACTOR: 'two_factor'
}

// ระดับการอนุมัติ
export const APPROVAL_LEVELS = {
  AUTO: 'auto',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  DIRECTOR: 'director',
  CFO: 'cfo',
  CEO: 'ceo',
  BOARD: 'board'
}

// Labels สำหรับแสดงผล
export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.CASH]: 'เงินสด',
  [PAYMENT_TYPES.BANK_TRANSFER]: 'โอนเงินผ่านธนาคาร',
  [PAYMENT_TYPES.CREDIT_CARD]: 'บัตรเครดิต',
  [PAYMENT_TYPES.DEBIT_CARD]: 'บัตรเดบิต',
  [PAYMENT_TYPES.CHECK]: 'เช็ค',
  [PAYMENT_TYPES.PROMISSORY_NOTE]: 'ตั๋วสัญญาใช้เงิน',
  [PAYMENT_TYPES.MOBILE_BANKING]: 'มือถือแบงกิ้ง',
  [PAYMENT_TYPES.E_WALLET]: 'กระเป๋าเงินอิเล็กทรอนิกส์',
  [PAYMENT_TYPES.QR_CODE]: 'คิวอาร์โค้ด',
  [PAYMENT_TYPES.CRYPTOCURRENCY]: 'เงินดิจิทัล',
  [PAYMENT_TYPES.INSTALLMENT]: 'ผ่อนชำระ',
  [PAYMENT_TYPES.CREDIT]: 'เครดิต'
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'รอดำเนินการ',
  [PAYMENT_STATUS.PROCESSING]: 'กำลังดำเนินการ',
  [PAYMENT_STATUS.COMPLETED]: 'สำเร็จ',
  [PAYMENT_STATUS.FAILED]: 'ไม่สำเร็จ',
  [PAYMENT_STATUS.CANCELLED]: 'ยกเลิก',
  [PAYMENT_STATUS.REFUNDED]: 'คืนเงินแล้ว',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'คืนเงินบางส่วน',
  [PAYMENT_STATUS.DISPUTED]: 'โต้แย้ง',
  [PAYMENT_STATUS.CHARGEBACK]: 'เรียกเงินคืน',
  [PAYMENT_STATUS.OVERDUE]: 'เกินกำหนด',
  [PAYMENT_STATUS.PARTIAL]: 'ชำระบางส่วน'
}

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.PAYMENT]: 'การชำระเงิน',
  [TRANSACTION_TYPES.REFUND]: 'การคืนเงิน',
  [TRANSACTION_TYPES.PARTIAL_REFUND]: 'การคืนเงินบางส่วน',
  [TRANSACTION_TYPES.CHARGEBACK]: 'การเรียกเงินคืน',
  [TRANSACTION_TYPES.REVERSAL]: 'การยกเลิกธุรกรรม',
  [TRANSACTION_TYPES.ADJUSTMENT]: 'การปรับปรุง',
  [TRANSACTION_TYPES.FEE]: 'ค่าธรรมเนียม',
  [TRANSACTION_TYPES.PENALTY]: 'ค่าปรับ',
  [TRANSACTION_TYPES.DISCOUNT]: 'ส่วนลด',
  [TRANSACTION_TYPES.TAX]: 'ภาษี'
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.FULL_PAYMENT]: 'ชำระเต็มจำนวน',
  [PAYMENT_METHODS.INSTALLMENT]: 'ผ่อนชำระ',
  [PAYMENT_METHODS.PARTIAL_PAYMENT]: 'ชำระบางส่วน',
  [PAYMENT_METHODS.ADVANCE_PAYMENT]: 'ชำระล่วงหน้า',
  [PAYMENT_METHODS.COD]: 'เก็บเงินปลายทาง',
  [PAYMENT_METHODS.CREDIT_TERMS]: 'เงื่อนไขเครดิต',
  [PAYMENT_METHODS.LAYAWAY]: 'วางมัดจำ',
  [PAYMENT_METHODS.SUBSCRIPTION]: 'สมาชิก'
}

export const BANK_TYPE_LABELS = {
  [BANK_TYPES.COMMERCIAL]: 'ธนาคารพาณิชย์',
  [BANK_TYPES.SAVINGS]: 'ธนาคารออมสิน',
  [BANK_TYPES.INVESTMENT]: 'ธนาคารลงทุน',
  [BANK_TYPES.CENTRAL]: 'ธนาคารกลาง',
  [BANK_TYPES.FOREIGN]: 'ธนาคารต่างชาติ',
  [BANK_TYPES.ISLAMIC]: 'ธนาคารอิสลาม',
  [BANK_TYPES.DIGITAL]: 'ธนาคารดิจิทัล'
}

export const CURRENCY_LABELS = {
  [CURRENCIES.THB]: 'บาทไทย',
  [CURRENCIES.USD]: 'ดอลลาร์สหรัฐ',
  [CURRENCIES.EUR]: 'ยูโร',
  [CURRENCIES.GBP]: 'ปอนด์อังกฤษ',
  [CURRENCIES.JPY]: 'เยนญี่ปุ่น',
  [CURRENCIES.CNY]: 'หยวนจีน',
  [CURRENCIES.SGD]: 'ดอลลาร์สิงคโปร์',
  [CURRENCIES.MYR]: 'ริงกิตมาเลเซีย',
  [CURRENCIES.HKD]: 'ดอลลาร์ฮ่องกง',
  [CURRENCIES.AUD]: 'ดอลลาร์ออสเตรเลีย'
}

export const RISK_LEVEL_LABELS = {
  [RISK_LEVELS.LOW]: 'ต่ำ',
  [RISK_LEVELS.MEDIUM]: 'ปานกลาง',
  [RISK_LEVELS.HIGH]: 'สูง',
  [RISK_LEVELS.VERY_HIGH]: 'สูงมาก',
  [RISK_LEVELS.CRITICAL]: 'วิกฤต'
}

export const FEE_TYPE_LABELS = {
  [FEE_TYPES.TRANSACTION]: 'ค่าธรรมเนียมธุรกรรม',
  [FEE_TYPES.PROCESSING]: 'ค่าดำเนินการ',
  [FEE_TYPES.GATEWAY]: 'ค่าเกตเวย์',
  [FEE_TYPES.BANK]: 'ค่าธรรมเนียมธนาคาร',
  [FEE_TYPES.CURRENCY_EXCHANGE]: 'ค่าแลกเปลี่ยนเงินตรา',
  [FEE_TYPES.LATE_PAYMENT]: 'ค่าปรับชำระช้า',
  [FEE_TYPES.EARLY_PAYMENT]: 'ส่วนลดจ่ายเร็ว',
  [FEE_TYPES.ADMIN]: 'ค่าธรรมเนียมบริหาร',
  [FEE_TYPES.SERVICE]: 'ค่าบริการ'
}

export const REFUND_TYPE_LABELS = {
  [REFUND_TYPES.FULL]: 'คืนเงินเต็มจำนวน',
  [REFUND_TYPES.PARTIAL]: 'คืนเงินบางส่วน',
  [REFUND_TYPES.STORE_CREDIT]: 'เครดิตร้านค้า',
  [REFUND_TYPES.EXCHANGE]: 'แลกเปลี่ยน',
  [REFUND_TYPES.VOUCHER]: 'บัตรกำนัล',
  [REFUND_TYPES.BANK_TRANSFER]: 'โอนเงินคืน',
  [REFUND_TYPES.ORIGINAL_METHOD]: 'คืนเงินตามวิธีเดิม'
}

export const REFUND_REASON_LABELS = {
  [REFUND_REASONS.CUSTOMER_REQUEST]: 'ลูกค้าขอคืนเงิน',
  [REFUND_REASONS.DEFECTIVE_PRODUCT]: 'สินค้าชำรุด',
  [REFUND_REASONS.WRONG_ITEM]: 'สินค้าผิด',
  [REFUND_REASONS.DAMAGED_SHIPPING]: 'เสียหายระหว่างขนส่ง',
  [REFUND_REASONS.NOT_AS_DESCRIBED]: 'ไม่ตรงตามรายละเอียด',
  [REFUND_REASONS.ORDER_CANCELLED]: 'ยกเลิกคำสั่งซื้อ',
  [REFUND_REASONS.DUPLICATE_PAYMENT]: 'ชำระเงินซ้ำ',
  [REFUND_REASONS.SYSTEM_ERROR]: 'ข้อผิดพลาดระบบ',
  [REFUND_REASONS.FRAUD]: 'การฉ้อโกง',
  [REFUND_REASONS.CHARGEBACK]: 'เรียกเงินคืนจากธนาคาร'
}

export const INSTALLMENT_TYPE_LABELS = {
  [INSTALLMENT_TYPES.EQUAL]: 'ผ่อนเท่ากัน',
  [INSTALLMENT_TYPES.DECLINING]: 'ผ่อนลดลง',
  [INSTALLMENT_TYPES.BALLOON]: 'ผ่อนบอลลูน',
  [INSTALLMENT_TYPES.INTEREST_ONLY]: 'จ่ายดอกเบี้ยอย่างเดียว',
  [INSTALLMENT_TYPES.GRADUATED]: 'ผ่อนขั้นบันได',
  [INSTALLMENT_TYPES.SEASONAL]: 'ผ่อนตามฤดูกาล',
  [INSTALLMENT_TYPES.FLEXIBLE]: 'ผ่อนยืดหยุ่น'
}

export const PAYMENT_CHANNEL_LABELS = {
  [PAYMENT_CHANNELS.ONLINE]: 'ออนไลน์',
  [PAYMENT_CHANNELS.OFFLINE]: 'ออฟไลน์',
  [PAYMENT_CHANNELS.MOBILE_APP]: 'แอปมือถือ',
  [PAYMENT_CHANNELS.ATM]: 'ตู้เอทีเอ็ม',
  [PAYMENT_CHANNELS.BRANCH]: 'สาขา',
  [PAYMENT_CHANNELS.AGENT]: 'ตัวแทน',
  [PAYMENT_CHANNELS.KIOSK]: 'เครื่องคีออส',
  [PAYMENT_CHANNELS.PHONE]: 'โทรศัพท์',
  [PAYMENT_CHANNELS.MAIL]: 'ไปรษณีย์',
  [PAYMENT_CHANNELS.DIRECT_DEBIT]: 'หักบัญชีโดยตรง'
}

export const VERIFICATION_TYPE_LABELS = {
  [VERIFICATION_TYPES.MANUAL]: 'ตรวจสอบด้วยมือ',
  [VERIFICATION_TYPES.AUTOMATIC]: 'ตรวจสอบอัตโนมัติ',
  [VERIFICATION_TYPES.BIOMETRIC]: 'ตรวจสอบชีวมิติ',
  [VERIFICATION_TYPES.OTP]: 'รหัส OTP',
  [VERIFICATION_TYPES.TOKEN]: 'โทเค็น',
  [VERIFICATION_TYPES.SIGNATURE]: 'ลายเซ็น',
  [VERIFICATION_TYPES.PIN]: 'รหัส PIN',
  [VERIFICATION_TYPES.PASSWORD]: 'รหัสผ่าน',
  [VERIFICATION_TYPES.TWO_FACTOR]: 'ยืนยันสองปัจจัย'
}

export const APPROVAL_LEVEL_LABELS = {
  [APPROVAL_LEVELS.AUTO]: 'อนุมัติอัตโนมัติ',
  [APPROVAL_LEVELS.SUPERVISOR]: 'หัวหน้างาน',
  [APPROVAL_LEVELS.MANAGER]: 'ผู้จัดการ',
  [APPROVAL_LEVELS.DIRECTOR]: 'ผู้อำนวยการ',
  [APPROVAL_LEVELS.CFO]: 'CFO',
  [APPROVAL_LEVELS.CEO]: 'CEO',
  [APPROVAL_LEVELS.BOARD]: 'คณะกรรมการ'
}

// การกำหนดค่าระบบ
export const PAYMENT_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    PAYMENT: 'PAY{year}{month}-{number:6}',
    REFUND: 'REF{year}{month}-{number:6}',
    RECEIPT: 'RCP{year}{month}-{number:6}',
    INVOICE: 'INV{year}{month}-{number:6}',
    CREDIT_NOTE: 'CN{year}{month}-{number:6}'
  },
  
  // อัตราค่าธรรมเนียมเริ่มต้น (%)
  DEFAULT_FEE_RATES: {
    CREDIT_CARD: 2.65,
    DEBIT_CARD: 1.85,
    BANK_TRANSFER: 0.5,
    MOBILE_BANKING: 0.3,
    E_WALLET: 1.5,
    QR_CODE: 0.4
  },
  
  // ระยะเวลาการชำระเงินเริ่มต้น (วัน)
  DEFAULT_PAYMENT_TERMS: {
    CASH: 0,
    NET_7: 7,
    NET_15: 15,
    NET_30: 30,
    NET_45: 45,
    NET_60: 60,
    NET_90: 90
  },
  
  // ระดับการอนุมัติตามมูลค่า
  APPROVAL_LIMITS: {
    [APPROVAL_LEVELS.AUTO]: 10000,      // 10,000 บาท
    [APPROVAL_LEVELS.SUPERVISOR]: 50000, // 50,000 บาท
    [APPROVAL_LEVELS.MANAGER]: 200000,   // 200,000 บาท
    [APPROVAL_LEVELS.DIRECTOR]: 1000000, // 1,000,000 บาท
    [APPROVAL_LEVELS.CFO]: 5000000,      // 5,000,000 บาท
    [APPROVAL_LEVELS.CEO]: 10000000,     // 10,000,000 บาท
    [APPROVAL_LEVELS.BOARD]: Infinity    // ไม่จำกัด
  },
  
  // อัตราดอกเบี้ยผิดนัดเริ่มต้น (% ต่อปี)
  DEFAULT_PENALTY_RATE: 15,
  
  // ระยะเวลาขั้นต่ำสำหรับการผ่อนชำระ (เดือน)
  MIN_INSTALLMENT_PERIOD: 3,
  
  // ระยะเวลาสูงสุดสำหรับการผ่อนชำระ (เดือน)
  MAX_INSTALLMENT_PERIOD: 60,
  
  // จำนวนวันย้อนหลังสำหรับการคืนเงิน
  REFUND_PERIOD_DAYS: 30,
  
  // ระยะเวลาสำหรับการโต้แย้ง (วัน)
  DISPUTE_PERIOD_DAYS: 180,
  
  // การแจ้งเตือนก่อนครบกำหนด (วัน)
  PAYMENT_REMINDER_DAYS: [7, 3, 1],
  
  // สกุลเงินเริ่มต้น
  DEFAULT_CURRENCY: CURRENCIES.THB,
  
  // การปัดเศษ
  ROUNDING_PRECISION: 2
}

// ค่าเริ่มต้นของข้อมูล
export const PAYMENT_DEFAULTS = {
  type: PAYMENT_TYPES.BANK_TRANSFER,
  status: PAYMENT_STATUS.PENDING,
  method: PAYMENT_METHODS.FULL_PAYMENT,
  currency: PAYMENT_CONFIG.DEFAULT_CURRENCY,
  channel: PAYMENT_CHANNELS.ONLINE,
  verification_type: VERIFICATION_TYPES.AUTOMATIC,
  approval_level: APPROVAL_LEVELS.AUTO,
  risk_level: RISK_LEVELS.LOW,
  fee_rate: 0,
  penalty_rate: PAYMENT_CONFIG.DEFAULT_PENALTY_RATE,
  requires_approval: false,
  auto_reconcile: true,
  send_receipt: true,
  send_notification: true
}

// เทมเพลตการชำระเงินทั่วไป
export const PAYMENT_TEMPLATES = {
  CASH_PAYMENT: {
    name: 'การชำระด้วยเงินสด',
    type: PAYMENT_TYPES.CASH,
    method: PAYMENT_METHODS.FULL_PAYMENT,
    channel: PAYMENT_CHANNELS.OFFLINE,
    verification_type: VERIFICATION_TYPES.MANUAL,
    requires_approval: false,
    auto_reconcile: false
  },
  CREDIT_CARD_PAYMENT: {
    name: 'การชำระด้วยบัตรเครดิต',
    type: PAYMENT_TYPES.CREDIT_CARD,
    method: PAYMENT_METHODS.FULL_PAYMENT,
    channel: PAYMENT_CHANNELS.ONLINE,
    verification_type: VERIFICATION_TYPES.TWO_FACTOR,
    fee_rate: PAYMENT_CONFIG.DEFAULT_FEE_RATES.CREDIT_CARD,
    requires_approval: false,
    auto_reconcile: true
  },
  BANK_TRANSFER: {
    name: 'การโอนเงินผ่านธนาคาร',
    type: PAYMENT_TYPES.BANK_TRANSFER,
    method: PAYMENT_METHODS.FULL_PAYMENT,
    channel: PAYMENT_CHANNELS.ONLINE,
    verification_type: VERIFICATION_TYPES.AUTOMATIC,
    fee_rate: PAYMENT_CONFIG.DEFAULT_FEE_RATES.BANK_TRANSFER,
    requires_approval: false,
    auto_reconcile: true
  },
  INSTALLMENT_PAYMENT: {
    name: 'การผ่อนชำระ',
    type: PAYMENT_TYPES.INSTALLMENT,
    method: PAYMENT_METHODS.INSTALLMENT,
    channel: PAYMENT_CHANNELS.ONLINE,
    verification_type: VERIFICATION_TYPES.AUTOMATIC,
    installment_type: INSTALLMENT_TYPES.EQUAL,
    requires_approval: true,
    auto_reconcile: true
  },
  MOBILE_PAYMENT: {
    name: 'การชำระผ่านมือถือ',
    type: PAYMENT_TYPES.MOBILE_BANKING,
    method: PAYMENT_METHODS.FULL_PAYMENT,
    channel: PAYMENT_CHANNELS.MOBILE_APP,
    verification_type: VERIFICATION_TYPES.OTP,
    fee_rate: PAYMENT_CONFIG.DEFAULT_FEE_RATES.MOBILE_BANKING,
    requires_approval: false,
    auto_reconcile: true
  }
}

// Transaction States - สถานะการทำธุรกรรม Payment
export const PAYMENT_STATES = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const PAYMENT_TRANSITIONS = {
  'pending': ['processing', 'cancelled'],
  'processing': ['completed', 'failed'],
  'completed': ['refunded'],
  'failed': ['pending'], // สามารถลองใหม่ได้
  'cancelled': [],
  'refunded': [] // สถานะสุดท้าย
}

// Initial State
export const PAYMENT_INITIAL_STATE = 'pending'

// Storage Key
export const PAYMENT_STORAGE_KEY = 'erp_payment_transactions'