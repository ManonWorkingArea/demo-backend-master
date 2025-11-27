/**
 * Invoice Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Invoice
 */

/**
 * Invoice Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Invoice Module
 */
export const INVOICE_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    invoice: {
      prefix: 'INV',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true,
        resetOnMonthChange: false
      },
      format: '{prefix}{year}{month}{sequence}' // INV202501XXXX
    },
    salesInvoice: {
      prefix: 'SIX',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // SIX2025XXXXX
    },
    taxInvoice: {
      prefix: 'TAX',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true,
        resetOnMonthChange: false
      },
      format: '{prefix}{year}{month}{sequence}' // TAX202501XXXX
    },
    receipt: {
      prefix: 'RCP',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true,
        resetOnMonthChange: false
      },
      format: '{prefix}{year}{month}{sequence}' // RCP202501XXXX
    },
    creditNote: {
      prefix: 'CN',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true,
        resetOnMonthChange: false
      },
      format: '{prefix}{year}{month}{sequence}' // CN202501XXXX
    },
    debitNote: {
      prefix: 'DN',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true,
        resetOnMonthChange: false
      },
      format: '{prefix}{year}{month}{sequence}' // DN202501XXXX
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'invoice',
    allowCustomCodes: false,
    validateUniqueCode: true,
    enablePaymentTracking: true,
    autoGenerateTaxInvoice: true
  }
}

/**
 * Invoice Status
 */
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PARTIAL_PAYMENT: 'partial_payment',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
  REFUNDED: 'refunded'
}

/**
 * Payment Method
 */
export const PAYMENT_METHOD = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  CHEQUE: 'cheque',
  PROMISSORY_NOTE: 'promissory_note',
  MOBILE_BANKING: 'mobile_banking',
  E_WALLET: 'e_wallet'
}

/**
 * Default Configuration
 */
export const INVOICE_CONFIG = {
  DEFAULT_VAT_RATE: 7,
  DEFAULT_DUE_DAYS: 30,
  PAYMENT_TERMS: {
    IMMEDIATE: 0,
    NET_7: 7,
    NET_15: 15,
    NET_30: 30,
    NET_45: 45,
    NET_60: 60,
    NET_90: 90
  },
  LATE_PAYMENT_PENALTY_RATE: 1.5, // % per month
  ENABLE_AUTO_REMINDERS: true,
  REMINDER_SCHEDULE: {
    BEFORE_DUE: -7, // 7 days before due date
    ON_DUE: 0,
    AFTER_DUE_1: 3, // 3 days after due
    AFTER_DUE_2: 7, // 7 days after due
    AFTER_DUE_3: 14 // 14 days after due
  }
}

/**
 * Invoice Defaults
 */
export const INVOICE_DEFAULTS = {
  status: INVOICE_STATUS.DRAFT,
  payment_status: PAYMENT_STATUS.PENDING,
  vat_rate: INVOICE_CONFIG.DEFAULT_VAT_RATE,
  currency: 'THB',
  items: [],
  subtotal: 0,
  vat_amount: 0,
  total_amount: 0,
  paid_amount: 0,
  payment_method: null,
  payment_date: null,
  notes: ''
}

/**
 * Status Labels (Thai)
 */
export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: 'ร่าง',
  [INVOICE_STATUS.PENDING_PAYMENT]: 'รอชำระเงิน',
  [INVOICE_STATUS.PARTIAL_PAYMENT]: 'ชำระบางส่วน',
  [INVOICE_STATUS.PAID]: 'ชำระแล้ว',
  [INVOICE_STATUS.OVERDUE]: 'เกินกำหนด',
  [INVOICE_STATUS.CANCELLED]: 'ยกเลิก',
  [INVOICE_STATUS.REFUNDED]: 'คืนเงิน'
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'ยังไม่ชำระ',
  [PAYMENT_STATUS.PARTIAL]: 'ชำระบางส่วน',
  [PAYMENT_STATUS.PAID]: 'ชำระครบ',
  [PAYMENT_STATUS.OVERDUE]: 'เกินกำหนด',
  [PAYMENT_STATUS.REFUNDED]: 'คืนเงิน'
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: 'เงินสด',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'โอนเงินผ่านธนาคาร',
  [PAYMENT_METHOD.CREDIT_CARD]: 'บัตรเครดิต',
  [PAYMENT_METHOD.CHEQUE]: 'เช็ค',
  [PAYMENT_METHOD.PROMISSORY_NOTE]: 'ตั๋วสัญญาใช้เงิน',
  [PAYMENT_METHOD.MOBILE_BANKING]: 'Mobile Banking',
  [PAYMENT_METHOD.E_WALLET]: 'E-Wallet'
}

/**
 * Calculate Invoice Totals
 */
export const calculateInvoiceTotals = (items = [], vatRate = INVOICE_CONFIG.DEFAULT_VAT_RATE) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unit_price || 0))
  }, 0)
  
  const vatAmount = subtotal * (vatRate / 100)
  const totalAmount = subtotal + vatAmount
  
  return {
    subtotal,
    vat_amount: vatAmount,
    total_amount: totalAmount
  }
}

/**
 * Calculate Due Date
 */
export const calculateDueDate = (invoiceDate = new Date(), dueDays = INVOICE_CONFIG.DEFAULT_DUE_DAYS) => {
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + dueDays)
  return dueDate
}

/**
 * Check if Invoice is Overdue
 */
export const isInvoiceOverdue = (invoice) => {
  if (!invoice.due_date) return false
  if (invoice.payment_status === PAYMENT_STATUS.PAID) return false
  return new Date(invoice.due_date) < new Date()
}

/**
 * Calculate Days Overdue
 */
export const getDaysOverdue = (invoice) => {
  if (!isInvoiceOverdue(invoice)) return 0
  
  const today = new Date()
  const dueDate = new Date(invoice.due_date)
  const diffTime = today - dueDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Calculate Late Payment Penalty
 */
export const calculateLatePenalty = (invoice) => {
  const daysOverdue = getDaysOverdue(invoice)
  if (daysOverdue <= 0) return 0
  
  const monthsOverdue = Math.ceil(daysOverdue / 30)
  const penaltyRate = INVOICE_CONFIG.LATE_PAYMENT_PENALTY_RATE
  const outstandingAmount = (invoice.total_amount || 0) - (invoice.paid_amount || 0)
  
  return outstandingAmount * (penaltyRate / 100) * monthsOverdue
}

/**
 * Validate Invoice
 */
export const validateInvoice = (invoice) => {
  const errors = []
  
  if (!invoice.customer_id) {
    errors.push('ต้องระบุลูกค้า')
  }
  
  if (!invoice.items || invoice.items.length === 0) {
    errors.push('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ')
  }
  
  if (invoice.items) {
    invoice.items.forEach((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`รายการที่ ${index + 1}: จำนวนต้องมากกว่า 0`)
      }
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องไม่ติดลบ`)
      }
    })
  }
  
  return {
    is_valid: errors.length === 0,
    errors
  }
}

/**
 * Format Currency
 */
export const formatCurrency = (amount, currency = 'THB') => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency
  }).format(amount || 0)
}

/**
 * Export all configurations
 */
export default {
  INVOICE_CODE_CONFIG,
  INVOICE_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  INVOICE_CONFIG,
  INVOICE_DEFAULTS,
  INVOICE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  calculateInvoiceTotals,
  calculateDueDate,
  isInvoiceOverdue,
  getDaysOverdue,
  calculateLatePenalty,
  validateInvoice,
  formatCurrency
}
