/**
 * Payment Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Payment
 */

import {
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_CHANNELS,
  INSTALLMENT_TYPES,
  REFUND_TYPES,
  APPROVAL_LEVELS,
  RISK_LEVELS,
  PAYMENT_CONFIG,
  PAYMENT_DEFAULTS,
  PAYMENT_TEMPLATES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS
} from './schema.js'

/**
 * Payment Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Payment Module
 */
export const PAYMENT_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    payment: {
      prefix: 'PAY',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PAY202500001
    },
    receipt: {
      prefix: 'RCP',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // RCP202500001
    },
    refund: {
      prefix: 'REF',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // REF20250001
    },
    bankTransfer: {
      prefix: 'TRF',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // TRF202500001
    },
    cheque: {
      prefix: 'CHQ',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // CHQ20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'payment',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireBankIntegration: true
  }
}

// Default Values - ค่าเริ่มต้น

/**
 * สร้างเลขที่เอกสารการชำระเงิน
 */
export const generatePaymentNumber = (type = 'PAYMENT', sequence = 1) => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  
  const format = PAYMENT_CONFIG.DOCUMENT_NUMBER_FORMAT[type] || PAYMENT_CONFIG.DOCUMENT_NUMBER_FORMAT.PAYMENT
  
  return format
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{number:6}', sequence.toString().padStart(6, '0'))
}

/**
 * คำนวณค่าธรรมเนียมการชำระเงิน
 */
export const calculatePaymentFee = (amount, paymentType, feeRate = null) => {
  const rate = feeRate || PAYMENT_CONFIG.DEFAULT_FEE_RATES[paymentType] || 0
  
  // คำนวณค่าธรรมเนียมตามเปอร์เซ็นต์
  const feeAmount = amount * (rate / 100)
  
  // ปัดเศษตามการกำหนดค่า
  return Math.round(feeAmount * Math.pow(10, PAYMENT_CONFIG.ROUNDING_PRECISION)) / Math.pow(10, PAYMENT_CONFIG.ROUNDING_PRECISION)
}

/**
 * คำนวณจำนวนเงินสุทธิหลังหักค่าธรรมเนียม
 */
export const calculateNetAmount = (grossAmount, paymentType, feeRate = null) => {
  const fee = calculatePaymentFee(grossAmount, paymentType, feeRate)
  return grossAmount - fee
}

/**
 * คำนวณตารางการผ่อนชำระ
 */
export const calculateInstallmentSchedule = (principal, interestRate, periods, installmentType = INSTALLMENT_TYPES.EQUAL) => {
  const monthlyRate = interestRate / 100 / 12
  const schedule = []
  
  switch (installmentType) {
    case INSTALLMENT_TYPES.EQUAL: {
      // ผ่อนเท่ากัน
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1)
      let remainingBalance = principal
      
      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance -= principalPayment
        
        schedule.push({
          period: i,
          payment_amount: Math.round(monthlyPayment * 100) / 100,
          principal_amount: Math.round(principalPayment * 100) / 100,
          interest_amount: Math.round(interestPayment * 100) / 100,
          remaining_balance: Math.round(Math.max(0, remainingBalance) * 100) / 100,
          due_date: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)) // เพิ่มทีละ 30 วัน
        })
      }
      break
    }
    
    case INSTALLMENT_TYPES.DECLINING: {
      // ผ่อนลดลง
      const principalPayment = principal / periods
      let remainingBalance = principal
      
      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * monthlyRate
        const monthlyPayment = principalPayment + interestPayment
        remainingBalance -= principalPayment
        
        schedule.push({
          period: i,
          payment_amount: Math.round(monthlyPayment * 100) / 100,
          principal_amount: Math.round(principalPayment * 100) / 100,
          interest_amount: Math.round(interestPayment * 100) / 100,
          remaining_balance: Math.round(Math.max(0, remainingBalance) * 100) / 100,
          due_date: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000))
        })
      }
      break
    }
    
    case INSTALLMENT_TYPES.BALLOON: {
      // ผ่อนบอลลูน (จ่ายเงินต้นครั้งสุดท้าย)
      const interestPayment = principal * monthlyRate
      
      for (let i = 1; i < periods; i++) {
        schedule.push({
          period: i,
          payment_amount: Math.round(interestPayment * 100) / 100,
          principal_amount: 0,
          interest_amount: Math.round(interestPayment * 100) / 100,
          remaining_balance: principal,
          due_date: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000))
        })
      }
      
      // งวดสุดท้าย
      schedule.push({
        period: periods,
        payment_amount: Math.round((principal + interestPayment) * 100) / 100,
        principal_amount: principal,
        interest_amount: Math.round(interestPayment * 100) / 100,
        remaining_balance: 0,
        due_date: new Date(Date.now() + (periods * 30 * 24 * 60 * 60 * 1000))
      })
      break
    }
    
    default:
      throw new Error(`Unsupported installment type: ${installmentType}`)
  }
  
  return schedule
}

/**
 * ตรวจสอบความถูกต้องของการชำระเงิน
 */
export const validatePayment = (payment) => {
  const errors = []
  const warnings = []
  
  // ตรวจสอบข้อมูลพื้นฐาน
  if (!payment.amount || payment.amount <= 0) {
    errors.push('จำนวนเงินต้องมากกว่า 0')
  }
  
  if (!payment.currency) {
    errors.push('ต้องระบุสกุลเงิน')
  }
  
  if (!payment.payment_type) {
    errors.push('ต้องระบุประเภทการชำระเงิน')
  }
  
  // ตรวจสอบการอนุมัติ
  const requiredApprovalLevel = getRequiredApprovalLevel(payment.amount)
  if (requiredApprovalLevel !== APPROVAL_LEVELS.AUTO && !payment.approved_by) {
    warnings.push('การชำระเงินนี้ต้องได้รับการอนุมัติ')
  }
  
  // ตรวจสอบข้อมูลเฉพาะประเภท
  if (payment.payment_type === PAYMENT_TYPES.CHECK) {
    if (!payment.check_number) {
      errors.push('ต้องระบุหมายเลขเช็ค')
    }
    if (!payment.bank_name) {
      errors.push('ต้องระบุชื่อธนาคาร')
    }
  }
  
  if (payment.payment_type === PAYMENT_TYPES.CREDIT_CARD) {
    if (!payment.card_number || payment.card_number.length < 4) {
      errors.push('ต้องระบุหมายเลขบัตรเครดิต')
    }
  }
  
  if (payment.payment_type === PAYMENT_TYPES.BANK_TRANSFER) {
    if (!payment.bank_account) {
      errors.push('ต้องระบุหมายเลขบัญชีธนาคาร')
    }
  }
  
  // ตรวจสอบผ่อนชำระ
  if (payment.payment_method === PAYMENT_METHODS.INSTALLMENT) {
    if (!payment.installment_periods || payment.installment_periods < PAYMENT_CONFIG.MIN_INSTALLMENT_PERIOD) {
      errors.push(`จำนวนงวดผ่อนต้องไม่น้อยกว่า ${PAYMENT_CONFIG.MIN_INSTALLMENT_PERIOD} เดือน`)
    }
    if (payment.installment_periods > PAYMENT_CONFIG.MAX_INSTALLMENT_PERIOD) {
      errors.push(`จำนวนงวดผ่อนต้องไม่เกิน ${PAYMENT_CONFIG.MAX_INSTALLMENT_PERIOD} เดือน`)
    }
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    required_approval_level: requiredApprovalLevel
  }
}

/**
 * หาระดับการอนุมัติที่จำเป็น
 */
export const getRequiredApprovalLevel = (amount) => {
  const levels = Object.entries(PAYMENT_CONFIG.APPROVAL_LIMITS)
    .sort(([,a], [,b]) => a - b)
  
  for (const [level, limit] of levels) {
    if (amount <= limit) {
      return level
    }
  }
  
  return APPROVAL_LEVELS.BOARD
}

/**
 * ประเมินระดับความเสี่ยง
 */
export const assessRiskLevel = (payment) => {
  let riskScore = 0
  
  // ประเมินตามจำนวนเงิน
  if (payment.amount > 1000000) riskScore += 3
  else if (payment.amount > 500000) riskScore += 2
  else if (payment.amount > 100000) riskScore += 1
  
  // ประเมินตามประเภทการชำระเงิน
  const highRiskTypes = [PAYMENT_TYPES.CASH, PAYMENT_TYPES.CRYPTOCURRENCY]
  if (highRiskTypes.includes(payment.payment_type)) riskScore += 2
  
  // ประเมินตามลูกค้า
  if (payment.customer_risk_rating === 'high') riskScore += 2
  if (payment.is_new_customer) riskScore += 1
  
  // ประเมินตามช่องทาง
  if (payment.channel === PAYMENT_CHANNELS.OFFLINE) riskScore += 1
  
  // ประเมินตามประเทศ
  if (payment.country && payment.country !== 'TH') riskScore += 1
  
  // กำหนดระดับความเสี่ยง
  if (riskScore >= 7) return RISK_LEVELS.CRITICAL
  if (riskScore >= 5) return RISK_LEVELS.VERY_HIGH
  if (riskScore >= 3) return RISK_LEVELS.HIGH
  if (riskScore >= 1) return RISK_LEVELS.MEDIUM
  return RISK_LEVELS.LOW
}

/**
 * คำนวณค่าปรับความล่าช้า
 */
export const calculateLatePenalty = (originalAmount, daysLate, penaltyRate = PAYMENT_CONFIG.DEFAULT_PENALTY_RATE) => {
  if (daysLate <= 0) return 0
  
  // คำนวณค่าปรับแบบดอกเบี้ยทบต้น (ต่อวัน)
  const dailyRate = penaltyRate / 100 / 365
  const penaltyAmount = originalAmount * Math.pow(1 + dailyRate, daysLate) - originalAmount
  
  return Math.round(penaltyAmount * 100) / 100
}

/**
 * ตรวจสอบสถานะการชำระเงิน
 */
export const checkPaymentStatus = (payment) => {
  const now = new Date()
  const dueDate = new Date(payment.due_date)
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
  
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    return {
      status: PAYMENT_STATUS.COMPLETED,
      is_overdue: false,
      days_overdue: 0,
      penalty_amount: 0
    }
  }
  
  if (daysOverdue > 0) {
    const penaltyAmount = calculateLatePenalty(payment.amount, daysOverdue, payment.penalty_rate)
    return {
      status: PAYMENT_STATUS.OVERDUE,
      is_overdue: true,
      days_overdue: daysOverdue,
      penalty_amount: penaltyAmount
    }
  }
  
  return {
    status: payment.status,
    is_overdue: false,
    days_overdue: 0,
    penalty_amount: 0
  }
}

/**
 * สร้างใบเสร็จรับเงิน
 */
export const generateReceipt = (payment) => {
  const receiptNumber = generatePaymentNumber('RECEIPT', payment.sequence_number)
  
  return {
    receipt_number: receiptNumber,
    issue_date: new Date(),
    payment_id: payment.id,
    customer_name: payment.customer_name,
    amount: payment.amount,
    payment_type: payment.payment_type,
    currency: payment.currency,
    reference_number: payment.reference_number,
    description: payment.description,
    fee_amount: payment.fee_amount || 0,
    net_amount: payment.amount - (payment.fee_amount || 0),
    issued_by: payment.processed_by,
    status: 'issued'
  }
}

/**
 * ประมวลผลการคืนเงิน
 */
export const processRefund = (originalPayment, refundAmount, refundReason, refundType = REFUND_TYPES.ORIGINAL_METHOD) => {
  const refund = {
    refund_number: generatePaymentNumber('REFUND'),
    original_payment_id: originalPayment.id,
    refund_amount: refundAmount,
    refund_type: refundType,
    refund_reason: refundReason,
    original_amount: originalPayment.amount,
    remaining_amount: originalPayment.amount - refundAmount,
    currency: originalPayment.currency,
    refund_date: new Date(),
    status: PAYMENT_STATUS.PROCESSING,
    processed_by: null,
    approved_by: null
  }
  
  // ตรวจสอบว่าเป็นการคืนเงินเต็มจำนวนหรือบางส่วน
  if (refundAmount >= originalPayment.amount) {
    refund.refund_type = REFUND_TYPES.FULL
    refund.remaining_amount = 0
  } else {
    refund.refund_type = REFUND_TYPES.PARTIAL
  }
  
  // ตรวจสอบความจำเป็นในการอนุมัติ
  refund.requires_approval = refundAmount > PAYMENT_CONFIG.APPROVAL_LIMITS[APPROVAL_LEVELS.AUTO]
  
  return refund
}

/**
 * สร้างรายงานการชำระเงิน
 */
export const generatePaymentReport = (payments = [], dateRange = null) => {
  let filteredPayments = payments
  
  // กรองตามช่วงวันที่ถ้าระบุ
  if (dateRange) {
    filteredPayments = payments.filter(p => {
      const paymentDate = new Date(p.created_at)
      return paymentDate >= new Date(dateRange.start) && paymentDate <= new Date(dateRange.end)
    })
  }
  
  const total = filteredPayments.length
  
  if (total === 0) {
    return {
      summary: {
        total: 0,
        total_amount: 0,
        total_fees: 0,
        success_rate: 0,
        average_amount: 0
      },
      by_status: {},
      by_type: {},
      by_method: {},
      by_currency: {},
      trends: {}
    }
  }
  
  // สถิติทั่วไป
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalFees = filteredPayments.reduce((sum, p) => sum + (p.fee_amount || 0), 0)
  const successfulPayments = filteredPayments.filter(p => p.status === PAYMENT_STATUS.COMPLETED)
  
  // จัดกลุ่มตามสถานะ
  const byStatus = filteredPayments.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  
  // จัดกลุ่มตามประเภท
  const byType = filteredPayments.reduce((acc, p) => {
    acc[p.payment_type] = (acc[p.payment_type] || 0) + 1
    return acc
  }, {})
  
  // จัดกลุ่มตามวิธีการ
  const byMethod = filteredPayments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + 1
    return acc
  }, {})
  
  // จัดกลุ่มตามสกุลเงิน
  const byCurrency = filteredPayments.reduce((acc, p) => {
    const currency = p.currency || 'THB'
    if (!acc[currency]) {
      acc[currency] = { count: 0, amount: 0 }
    }
    acc[currency].count++
    acc[currency].amount += p.amount || 0
    return acc
  }, {})
  
  // แนวโน้มรายวัน
  const dailyTrends = filteredPayments.reduce((acc, p) => {
    const date = new Date(p.created_at).toISOString().slice(0, 10) // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = { count: 0, amount: 0, successful: 0 }
    }
    acc[date].count++
    acc[date].amount += p.amount || 0
    if (p.status === PAYMENT_STATUS.COMPLETED) {
      acc[date].successful++
    }
    return acc
  }, {})
  
  return {
    summary: {
      total,
      total_amount: totalAmount,
      total_fees: totalFees,
      success_rate: total > 0 ? (successfulPayments.length / total) * 100 : 0,
      average_amount: total > 0 ? totalAmount / total : 0
    },
    by_status: byStatus,
    by_type: byType,
    by_method: byMethod,
    by_currency: byCurrency,
    trends: dailyTrends
  }
}

/**
 * สร้างการชำระเงินจากเทมเพลต
 */
export const createPaymentFromTemplate = (templateKey, customData = {}) => {
  const template = PAYMENT_TEMPLATES[templateKey]
  if (!template) {
    throw new Error(`Template ${templateKey} not found`)
  }
  
  const basePayment = {
    ...PAYMENT_DEFAULTS,
    ...template,
    ...customData,
    created_at: new Date()
  }
  
  // สร้างเลขที่เอกสาร
  if (!basePayment.payment_number) {
    basePayment.payment_number = generatePaymentNumber('PAYMENT')
  }
  
  // ประเมินระดับความเสี่ยง
  basePayment.risk_level = assessRiskLevel(basePayment)
  
  // คำนวณค่าธรรมเนียม
  if (basePayment.amount && basePayment.fee_rate) {
    basePayment.fee_amount = calculatePaymentFee(basePayment.amount, basePayment.payment_type, basePayment.fee_rate)
    basePayment.net_amount = calculateNetAmount(basePayment.amount, basePayment.payment_type, basePayment.fee_rate)
  }
  
  return basePayment
}

/**
 * ฟังก์ชันช่วยในการจัดรูปแบบ
 */
export const formatters = {
  // จัดรูปแบบสถานะ
  formatStatus: (status) => {
    return PAYMENT_STATUS_LABELS[status] || status
  },
  
  // จัดรูปแบบประเภท
  formatType: (type) => {
    return PAYMENT_TYPE_LABELS[type] || type
  },
  
  // จัดรูปแบบประเภทธุรกรรม
  formatTransactionType: (type) => {
    return TRANSACTION_TYPE_LABELS[type] || type
  },
  
  // สีสำหรับสถานะ
  getStatusColor: (status) => {
    const colors = {
      [PAYMENT_STATUS.PENDING]: '#f59e0b',
      [PAYMENT_STATUS.PROCESSING]: '#3b82f6',
      [PAYMENT_STATUS.COMPLETED]: '#10b981',
      [PAYMENT_STATUS.FAILED]: '#ef4444',
      [PAYMENT_STATUS.CANCELLED]: '#6b7280',
      [PAYMENT_STATUS.REFUNDED]: '#8b5cf6',
      [PAYMENT_STATUS.PARTIALLY_REFUNDED]: '#a855f7',
      [PAYMENT_STATUS.DISPUTED]: '#f97316',
      [PAYMENT_STATUS.CHARGEBACK]: '#dc2626',
      [PAYMENT_STATUS.OVERDUE]: '#dc2626',
      [PAYMENT_STATUS.PARTIAL]: '#06b6d4'
    }
    return colors[status] || '#6b7280'
  },
  
  // สีสำหรับระดับความเสี่ยง
  getRiskColor: (level) => {
    const colors = {
      [RISK_LEVELS.LOW]: '#10b981',
      [RISK_LEVELS.MEDIUM]: '#f59e0b',
      [RISK_LEVELS.HIGH]: '#f97316',
      [RISK_LEVELS.VERY_HIGH]: '#ef4444',
      [RISK_LEVELS.CRITICAL]: '#dc2626'
    }
    return colors[level] || '#6b7280'
  },
  
  // จัดรูปแบบจำนวนเงิน
  formatCurrency: (amount, currency = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },
  
  // จัดรูปแบบเปอร์เซ็นต์
  formatPercentage: (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`
  },
  
  // จัดรูปแบบหมายเลขบัตรเครดิต
  formatCardNumber: (cardNumber) => {
    if (!cardNumber) return ''
    const masked = cardNumber.slice(0, 4) + '*'.repeat(cardNumber.length - 8) + cardNumber.slice(-4)
    return masked.replace(/(.{4})/g, '$1 ').trim()
  }
}

/**
 * ฟังก์ชันการค้นหาและกรอง
 */
export const filters = {
  // กรองตามสถานะ
  byStatus: (payments, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return payments.filter(p => statuses.includes(p.status))
  },
  
  // กรองตามประเภท
  byType: (payments, types) => {
    if (!Array.isArray(types)) types = [types]
    return payments.filter(p => types.includes(p.payment_type))
  },
  
  // กรองตามลูกค้า
  byCustomer: (payments, customerIds) => {
    if (!Array.isArray(customerIds)) customerIds = [customerIds]
    return payments.filter(p => customerIds.includes(p.customer_id))
  },
  
  // กรองตามช่วงวันที่
  byDateRange: (payments, startDate, endDate, dateField = 'created_at') => {
    return payments.filter(p => {
      const date = new Date(p[dateField])
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  },
  
  // กรองตามช่วงจำนวนเงิน
  byAmountRange: (payments, minAmount, maxAmount) => {
    return payments.filter(p => p.amount >= minAmount && p.amount <= maxAmount)
  },
  
  // กรองการชำระเงินที่เกินกำหนด
  overdue: (payments) => {
    const now = new Date()
    return payments.filter(p => {
      if (p.status === PAYMENT_STATUS.COMPLETED) return false
      return new Date(p.due_date) < now
    })
  },
  
  // กรองตามระดับความเสี่ยง
  byRiskLevel: (payments, riskLevels) => {
    if (!Array.isArray(riskLevels)) riskLevels = [riskLevels]
    return payments.filter(p => riskLevels.includes(p.risk_level))
  },
  
  // กรองการชำระเงินที่ต้องการอนุมัติ
  requiresApproval: (payments) => {
    return payments.filter(p => p.requires_approval && !p.approved_by)
  },
  
  // กรองตามสกุลเงิน
  byCurrency: (payments, currencies) => {
    if (!Array.isArray(currencies)) currencies = [currencies]
    return payments.filter(p => currencies.includes(p.currency))
  }
}