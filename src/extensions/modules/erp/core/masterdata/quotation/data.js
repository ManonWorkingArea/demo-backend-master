/**
 * Quotation Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Quotation
 */

/**
 * Quotation Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Quotation Module
 */
export const QUOTATION_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    quotation: {
      prefix: 'QT',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // QT202500001
    },
    priceList: {
      prefix: 'PL',
      year: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PL2025001
    },
    proposal: {
      prefix: 'PRO',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PRO20250001
    },
    rfq: {
      prefix: 'RFQ',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // RFQ20250001
    },
    tender: {
      prefix: 'TEN',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // TEN20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'quotation',
    allowCustomCodes: true,
    validateUniqueCode: true,
    enableExpirationTracking: true
  }
}

// Default Values - ค่าเริ่มต้น

import {
  QUOTATION_TYPES,
  QUOTATION_STATUS,
  CUSTOMER_TYPES,
  PRIORITY_LEVELS,
  COMPETITION_LEVELS,
  CONFIDENCE_LEVELS,
  DISCOUNT_TYPES,
  CONVERSION_STATUS,
  QUOTATION_CONFIG,
  QUOTATION_DEFAULTS,
  QUOTATION_TEMPLATES,
  QUOTATION_TYPE_LABELS,
  QUOTATION_STATUS_LABELS,
  CONFIDENCE_LEVEL_LABELS
} from './schema.js'

/**
 * สร้างเลขที่เอกสารใบเสนอราคา
 */
export const generateQuotationNumber = (type = QUOTATION_TYPES.STANDARD, sequence = 1, revision = 0) => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  
  const formatMap = {
    [QUOTATION_TYPES.STANDARD]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.FORMAL]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.INFORMAL]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.TENDER]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.RFQ]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.PROFORMA]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.ESTIMATE]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.ESTIMATE,
    [QUOTATION_TYPES.BID]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION,
    [QUOTATION_TYPES.PROPOSAL]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.PROPOSAL,
    [QUOTATION_TYPES.BLANKET]: QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION
  }
  
  let format = formatMap[type] || QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.QUOTATION
  
  if (revision > 0) {
    format = QUOTATION_CONFIG.DOCUMENT_NUMBER_FORMAT.REVISION
  }
  
  return format
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{number:5}', sequence.toString().padStart(5, '0'))
    .replace('{number:4}', sequence.toString().padStart(4, '0'))
    .replace('{revision}', revision.toString())
}

/**
 * คำนวณมูลค่าใบเสนอราคา
 */
export const calculateQuotationValue = (items = [], vatRate = QUOTATION_CONFIG.DEFAULT_VAT_RATE, discounts = []) => {
  // คำนวณมูลค่ารวมก่อนส่วนลด
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
    return sum + itemTotal
  }, 0)
  
  // คำนวณส่วนลดรวม
  let totalDiscount = 0
  discounts.forEach(discount => {
    if (discount.type === DISCOUNT_TYPES.PERCENTAGE) {
      totalDiscount += subtotal * (discount.value / 100)
    } else if (discount.type === DISCOUNT_TYPES.FIXED) {
      totalDiscount += discount.value
    }
  })
  
  // มูลค่าหลังหักส่วนลด
  const discountedAmount = subtotal - totalDiscount
  
  // คำนวณภาษีมูลค่าเพิ่ม
  const vatAmount = discountedAmount * (vatRate / 100)
  
  // มูลค่ารวมทั้งหมด
  const grandTotal = discountedAmount + vatAmount
  
  return {
    subtotal,
    total_discount: totalDiscount,
    discounted_amount: discountedAmount,
    vat_amount: vatAmount,
    grand_total: grandTotal,
    discount_percentage: subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0
  }
}

/**
 * คำนวณส่วนลดตามปริมาณ
 */
export const calculateVolumeDiscount = (quantity, volumeBreaks = []) => {
  if (!volumeBreaks.length) return 0
  
  // เรียงลำดับจากปริมาณมากไปน้อย
  const sortedBreaks = volumeBreaks.sort((a, b) => b.min_quantity - a.min_quantity)
  
  // หาส่วนลดที่เหมาะสม
  const applicableBreak = sortedBreaks.find(breakPoint => quantity >= breakPoint.min_quantity)
  
  return applicableBreak ? applicableBreak.discount_percentage : 0
}

/**
 * ตรวจสอบความถูกต้องของใบเสนอราคา
 */
export const validateQuotation = (quotation) => {
  const errors = []
  const warnings = []
  
  // ตรวจสอบข้อมูลพื้นฐาน
  if (!quotation.customer_id) {
    errors.push('ต้องระุบุลูกค้า')
  }
  
  if (!quotation.items || quotation.items.length === 0) {
    errors.push('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ')
  }
  
  if (!quotation.valid_until || new Date(quotation.valid_until) <= new Date()) {
    warnings.push('วันหมดอายุควรเป็นวันในอนาคต')
  }
  
  // ตรวจสอบรายการสินค้า
  if (quotation.items) {
    quotation.items.forEach((item, index) => {
      if (!item.product_id) {
        errors.push(`รายการที่ ${index + 1}: ต้องระบุสินค้า`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`รายการที่ ${index + 1}: จำนวนต้องมากกว่า 0`)
      }
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องไม่ติดลบ`)
      }
    })
  }
  
  // ตรวจสอบระดับการอนุมัติ
  const totalValue = calculateQuotationValue(quotation.items || [], quotation.vat_rate).grand_total
  if (totalValue > QUOTATION_CONFIG.APPROVAL_LEVELS.SALES_REP && !quotation.approved_by) {
    warnings.push('ใบเสนอราคานี้ต้องได้รับการอนุมัติ')
  }
  
  // ตรวจสอบส่วนลด
  const discountPercentage = calculateQuotationValue(quotation.items || [], quotation.vat_rate, quotation.discounts || []).discount_percentage
  if (discountPercentage > QUOTATION_CONFIG.MAX_DISCOUNT_LEVELS.SALES_REP) {
    warnings.push('ส่วนลดเกินอำนาจการอนุมัติ')
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    total_value: totalValue,
    discount_percentage: discountPercentage
  }
}

/**
 * คำนวณวันหมดอายุ
 */
export const calculateExpiryDate = (issueDate = new Date(), validityDays = QUOTATION_CONFIG.DEFAULT_VALIDITY_PERIOD) => {
  const expiryDate = new Date(issueDate)
  expiryDate.setDate(expiryDate.getDate() + validityDays)
  return expiryDate
}

/**
 * ตรวจสอบว่าใบเสนอราคาหมดอายุหรือไม่
 */
export const isQuotationExpired = (quotation) => {
  if (!quotation.valid_until) return false
  return new Date(quotation.valid_until) < new Date()
}

/**
 * คำนวณเวลาที่เหลือก่อนหมดอายุ
 */
export const getDaysUntilExpiry = (quotation) => {
  if (!quotation.valid_until) return null
  
  const today = new Date()
  const expiryDate = new Date(quotation.valid_until)
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * สร้างกำหนดการติดตาม
 */
export const generateFollowUpSchedule = (quotation) => {
  const sentDate = new Date(quotation.sent_date || quotation.created_at)
  const followUps = []
  
  Object.entries(QUOTATION_CONFIG.FOLLOW_UP_SCHEDULE).forEach(([type, days]) => {
    const followUpDate = new Date(sentDate)
    followUpDate.setDate(followUpDate.getDate() + days)
    
    // ไม่สร้างการติดตามหลังหมดอายุ
    if (quotation.valid_until && followUpDate > new Date(quotation.valid_until)) {
      return
    }
    
    followUps.push({
      type: type.toLowerCase(),
      scheduled_date: followUpDate,
      status: 'pending',
      priority: type === 'FINAL' ? PRIORITY_LEVELS.HIGH : PRIORITY_LEVELS.NORMAL
    })
  })
  
  return followUps
}

/**
 * คำนวณความน่าจะเป็นในการได้รับงาน
 */
export const calculateWinProbability = (quotation) => {
  let probability = 50 // เริ่มต้น 50%
  
  // ปรับตามประเภทลูกค้า
  const customerAdjustment = {
    [CUSTOMER_TYPES.NEW]: -10,
    [CUSTOMER_TYPES.EXISTING]: +10,
    [CUSTOMER_TYPES.POTENTIAL]: 0,
    [CUSTOMER_TYPES.VIP]: +15,
    [CUSTOMER_TYPES.CORPORATE]: +5,
    [CUSTOMER_TYPES.GOVERNMENT]: -5,
    [CUSTOMER_TYPES.RESELLER]: +5,
    [CUSTOMER_TYPES.DISTRIBUTOR]: +5
  }
  
  // ปรับตามระดับการแข่งขัน
  const competitionAdjustment = {
    [COMPETITION_LEVELS.NONE]: +20,
    [COMPETITION_LEVELS.LOW]: +10,
    [COMPETITION_LEVELS.MEDIUM]: 0,
    [COMPETITION_LEVELS.HIGH]: -10,
    [COMPETITION_LEVELS.VERY_HIGH]: -20
  }
  
  // ปรับตามระดับความมั่นใจ
  const confidenceAdjustment = {
    [CONFIDENCE_LEVELS.VERY_LOW]: -20,
    [CONFIDENCE_LEVELS.LOW]: -10,
    [CONFIDENCE_LEVELS.MEDIUM]: 0,
    [CONFIDENCE_LEVELS.HIGH]: +10,
    [CONFIDENCE_LEVELS.VERY_HIGH]: +20
  }
  
  probability += customerAdjustment[quotation.customer_type] || 0
  probability += competitionAdjustment[quotation.competition_level] || 0
  probability += confidenceAdjustment[quotation.confidence_level] || 0
  
  // ปรับตามการตอบสนอง
  if (quotation.status === QUOTATION_STATUS.VIEWED) probability += 5
  if (quotation.status === QUOTATION_STATUS.UNDER_REVIEW) probability += 10
  if (quotation.status === QUOTATION_STATUS.NEGOTIATING) probability += 15
  
  // ปรับตามเวลาที่ใช้ในการตอบสนอง
  if (quotation.response_time && quotation.response_time <= QUOTATION_CONFIG.TARGET_RESPONSE_TIME) {
    probability += 5
  }
  
  // จำกัดให้อยู่ในช่วง 0-100
  return Math.max(0, Math.min(100, probability))
}

/**
 * สร้างรายงานการวิเคราะห์ใบเสนอราคา
 */
export const generateQuotationAnalysis = (quotations = []) => {
  const total = quotations.length
  
  if (total === 0) {
    return {
      summary: {
        total: 0,
        total_value: 0,
        conversion_rate: 0,
        average_value: 0,
        win_rate: 0
      },
      by_status: {},
      by_type: {},
      by_customer_type: {},
      trends: {}
    }
  }
  
  // สถิติทั่วไป
  const totalValue = quotations.reduce((sum, q) => {
    const calc = calculateQuotationValue(q.items || [], q.vat_rate)
    return sum + calc.grand_total
  }, 0)
  
  const convertedQuotations = quotations.filter(q => 
    q.status === QUOTATION_STATUS.ACCEPTED || 
    q.conversion_status === CONVERSION_STATUS.FULLY_CONVERTED
  )
  
  const wonQuotations = quotations.filter(q => q.status === QUOTATION_STATUS.ACCEPTED)
  
  // จัดกลุ่มตามสถานะ
  const byStatus = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1
    return acc
  }, {})
  
  // จัดกลุ่มตามประเภท
  const byType = quotations.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {})
  
  // จัดกลุ่มตามประเภทลูกค้า
  const byCustomerType = quotations.reduce((acc, q) => {
    acc[q.customer_type] = (acc[q.customer_type] || 0) + 1
    return acc
  }, {})
  
  // แนวโน้มรายเดือน
  const monthlyTrends = quotations.reduce((acc, q) => {
    const month = new Date(q.created_at).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { count: 0, value: 0, won: 0 }
    }
    acc[month].count++
    
    const calc = calculateQuotationValue(q.items || [], q.vat_rate)
    acc[month].value += calc.grand_total
    
    if (q.status === QUOTATION_STATUS.ACCEPTED) {
      acc[month].won++
    }
    
    return acc
  }, {})
  
  return {
    summary: {
      total,
      total_value: totalValue,
      conversion_rate: total > 0 ? (convertedQuotations.length / total) * 100 : 0,
      average_value: total > 0 ? totalValue / total : 0,
      win_rate: total > 0 ? (wonQuotations.length / total) * 100 : 0
    },
    by_status: byStatus,
    by_type: byType,
    by_customer_type: byCustomerType,
    trends: monthlyTrends
  }
}

/**
 * แนะนำการปรับปรุงใบเสนอราคา
 */
export const suggestQuotationImprovements = (quotation) => {
  const suggestions = []
  const winProbability = calculateWinProbability(quotation)
  
  // แนะนำตามความน่าจะเป็นในการชนะ
  if (winProbability < 30) {
    suggestions.push({
      type: 'warning',
      category: 'win_probability',
      message: 'ความน่าจะเป็นในการได้รับงานต่ำ พิจารณาปรับกลยุทธ์',
      actions: [
        'ลดราคาหรือเพิ่มส่วนลด',
        'เพิ่มมูลค่าให้กับข้อเสนอ',
        'ปรับปรุงเงื่อนไขการชำระเงิน',
        'เน้นจุดขายที่แข็งแกร่ง'
      ]
    })
  }
  
  // แนะนำตามการแข่งขัน
  if (quotation.competition_level === COMPETITION_LEVELS.HIGH || 
      quotation.competition_level === COMPETITION_LEVELS.VERY_HIGH) {
    suggestions.push({
      type: 'info',
      category: 'competition',
      message: 'การแข่งขันสูง ควรเน้นจุดแตกต่าง',
      actions: [
        'เน้นคุณภาพและบริการ',
        'เสนอเงื่อนไขที่ยืดหยุ่น',
        'แสดงผลงานที่ผ่านมา',
        'เสนอการรับประกันเพิ่มเติม'
      ]
    })
  }
  
  // แนะนำตามประเภทลูกค้า
  if (quotation.customer_type === CUSTOMER_TYPES.GOVERNMENT) {
    suggestions.push({
      type: 'info',
      category: 'customer_type',
      message: 'ลูกค้าหน่วยงานราชการ ให้ความสำคัญกับการปฏิบัติตามข้อกำหนด',
      actions: [
        'ตรวจสอบเอกสารให้ครบถ้วน',
        'เน้นมาตรฐานและใบรับรอง',
        'ระบุรายละเอียดการจัดส่งชัดเจน',
        'เตรียมเอกสารประกอบการชำระเงิน'
      ]
    })
  }
  
  // แนะนำตามวันหมดอายุ
  const daysUntilExpiry = getDaysUntilExpiry(quotation)
  if (daysUntilExpiry && daysUntilExpiry <= 7) {
    suggestions.push({
      type: 'urgent',
      category: 'expiry',
      message: `ใบเสนอราคาจะหมดอายุในอีก ${daysUntilExpiry} วัน`,
      actions: [
        'ติดต่อลูกค้าเร่งด่วน',
        'เสนอขยายระยะเวลา',
        'พิจารณาปรับข้อเสนอ',
        'เตรียมใบเสนอราคาใหม่'
      ]
    })
  }
  
  // แนะนำตามมูลค่า
  const calculation = calculateQuotationValue(quotation.items || [], quotation.vat_rate)
  if (calculation.discount_percentage > 15) {
    suggestions.push({
      type: 'warning',
      category: 'discount',
      message: `ส่วนลดสูง ${calculation.discount_percentage.toFixed(1)}%`,
      actions: [
        'ตรวจสอบความจำเป็นของส่วนลด',
        'พิจารณาเงื่อนไขการชำระเงินแทน',
        'เพิ่มมูลค่าบริการเพิ่มเติม',
        'ขออนุมัติจากผู้บริหาร'
      ]
    })
  }
  
  return suggestions
}

/**
 * สร้างเทมเพลตใบเสนอราคาตามประเภท
 */
export const createQuotationFromTemplate = (templateKey, customData = {}) => {
  const template = QUOTATION_TEMPLATES[templateKey]
  if (!template) {
    throw new Error(`Template ${templateKey} not found`)
  }
  
  const baseQuotation = {
    ...QUOTATION_DEFAULTS,
    ...template,
    ...customData,
    created_at: new Date(),
    valid_until: calculateExpiryDate(new Date(), template.validity_days || QUOTATION_CONFIG.DEFAULT_VALIDITY_PERIOD)
  }
  
  // สร้างเลขที่เอกสาร
  if (!baseQuotation.document_number) {
    baseQuotation.document_number = generateQuotationNumber(baseQuotation.type)
  }
  
  return baseQuotation
}

/**
 * ฟังก์ชันช่วยในการจัดรูปแบบ
 */
export const formatters = {
  // จัดรูปแบบสถานะ
  formatStatus: (status) => {
    return QUOTATION_STATUS_LABELS[status] || status
  },
  
  // จัดรูปแบบประเภท
  formatType: (type) => {
    return QUOTATION_TYPE_LABELS[type] || type
  },
  
  // จัดรูปแบบระดับความมั่นใจ
  formatConfidence: (level) => {
    return CONFIDENCE_LEVEL_LABELS[level] || level
  },
  
  // สีสำหรับสถานะ
  getStatusColor: (status) => {
    const colors = {
      [QUOTATION_STATUS.DRAFT]: '#6b7280',
      [QUOTATION_STATUS.SENT]: '#3b82f6',
      [QUOTATION_STATUS.VIEWED]: '#8b5cf6',
      [QUOTATION_STATUS.UNDER_REVIEW]: '#f59e0b',
      [QUOTATION_STATUS.NEGOTIATING]: '#f97316',
      [QUOTATION_STATUS.REVISED]: '#06b6d4',
      [QUOTATION_STATUS.ACCEPTED]: '#10b981',
      [QUOTATION_STATUS.REJECTED]: '#ef4444',
      [QUOTATION_STATUS.EXPIRED]: '#6b7280',
      [QUOTATION_STATUS.CANCELLED]: '#ef4444',
      [QUOTATION_STATUS.CONVERTED]: '#059669'
    }
    return colors[status] || '#6b7280'
  },
  
  // สีสำหรับระดับความมั่นใจ
  getConfidenceColor: (level) => {
    const colors = {
      [CONFIDENCE_LEVELS.VERY_LOW]: '#ef4444',
      [CONFIDENCE_LEVELS.LOW]: '#f97316',
      [CONFIDENCE_LEVELS.MEDIUM]: '#f59e0b',
      [CONFIDENCE_LEVELS.HIGH]: '#10b981',
      [CONFIDENCE_LEVELS.VERY_HIGH]: '#059669'
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
  formatPercentage: (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
  }
}

/**
 * ฟังก์ชันการค้นหาและกรอง
 */
export const filters = {
  // กรองตามสถานะ
  byStatus: (quotations, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return quotations.filter(q => statuses.includes(q.status))
  },
  
  // กรองตามประเภท
  byType: (quotations, types) => {
    if (!Array.isArray(types)) types = [types]
    return quotations.filter(q => types.includes(q.type))
  },
  
  // กรองตามลูกค้า
  byCustomer: (quotations, customerIds) => {
    if (!Array.isArray(customerIds)) customerIds = [customerIds]
    return quotations.filter(q => customerIds.includes(q.customer_id))
  },
  
  // กรองตามช่วงวันที่
  byDateRange: (quotations, startDate, endDate, dateField = 'created_at') => {
    return quotations.filter(q => {
      const date = new Date(q[dateField])
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  },
  
  // กรองตามช่วงมูลค่า
  byValueRange: (quotations, minValue, maxValue) => {
    return quotations.filter(q => {
      const calculation = calculateQuotationValue(q.items || [], q.vat_rate)
      const value = calculation.grand_total
      return value >= minValue && value <= maxValue
    })
  },
  
  // กรองใบเสนอราคาที่ใกล้หมดอายุ
  nearExpiry: (quotations, days = 7) => {
    return quotations.filter(q => {
      const daysUntilExpiry = getDaysUntilExpiry(q)
      return daysUntilExpiry !== null && daysUntilExpiry <= days && daysUntilExpiry > 0
    })
  },
  
  // กรองใบเสนอราคาที่หมดอายุ
  expired: (quotations) => {
    return quotations.filter(q => isQuotationExpired(q))
  },
  
  // กรองตามความน่าจะเป็นในการชนะ
  byWinProbability: (quotations, minProbability, maxProbability = 100) => {
    return quotations.filter(q => {
      const probability = calculateWinProbability(q)
      return probability >= minProbability && probability <= maxProbability
    })
  }
}