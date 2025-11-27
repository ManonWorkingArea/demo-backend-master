/**
 * Supplier Master Data
 * ฟังก์ชันการจัดการข้อมูลผู้ขาย/ผู้จัดหา
 * 
 * ⚠️ Code Configuration: ใช้ number_series.supplier จาก database เป็นหลัก
 * SUPPLIER_CODE_CONFIG เป็น fallback ถ้า database ไม่มีข้อมูล
 */

import {
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  SUPPLIER_DEFAULTS,
  SUPPLIER_CONFIG,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  SUPPLIER_TEMPLATES
} from './schema.js'

/**
 * 🔢 SUPPLIER_CODE_CONFIG
 * Configuration สำหรับการสร้างรหัสผู้ขาย
 * ใช้เป็น fallback ถ้า database (number_series.supplier) ไม่มีข้อมูล
 */
export const SUPPLIER_CODE_CONFIG = {
  patterns: {
    default: SUPPLIER_CONFIG.CODE_PATTERN
  }
}

/**
 * สร้างรหัสผู้ขาย
 * ⚠️ ฟังก์ชันนี้ deprecated - ควรใช้ CodeManager แทน
 */
export const generateSupplierCode = (type = SUPPLIER_TYPES.DOMESTIC, sequence = 1) => {
  const typePrefix = {
    [SUPPLIER_TYPES.DOMESTIC]: 'DOM',
    [SUPPLIER_TYPES.INTERNATIONAL]: 'INT',
    [SUPPLIER_TYPES.MANUFACTURER]: 'MFG',
    [SUPPLIER_TYPES.DISTRIBUTOR]: 'DIS',
    [SUPPLIER_TYPES.WHOLESALER]: 'WHO',
    [SUPPLIER_TYPES.RETAILER]: 'RET',
    [SUPPLIER_TYPES.SERVICE]: 'SVC',
    [SUPPLIER_TYPES.CONTRACTOR]: 'COT',
    [SUPPLIER_TYPES.INDIVIDUAL]: 'IND',
    [SUPPLIER_TYPES.GOVERNMENT]: 'GOV'
  }
  
  const prefix = typePrefix[type] || SUPPLIER_CONFIG.DEFAULT_CODE_PREFIX
  const paddedSequence = sequence.toString().padStart(5, '0')
  
  return `${prefix}${paddedSequence}`
}

/**
 * ตรวจสอบความถูกต้องของข้อมูลผู้ขาย
 */
export const validateSupplier = (supplier) => {
  const errors = []
  const warnings = []
  
  // ตรวจสอบข้อมูลพื้นฐาน
  if (!supplier.name || supplier.name.trim() === '') {
    errors.push('ต้องระบุชื่อผู้ขาย')
  }
  
  if (!supplier.supplier_code || supplier.supplier_code.trim() === '') {
    errors.push('ต้องมีรหัสผู้ขาย')
  }
  
  // ตรวจสอบตามประเภทผู้ขาย
  const requiredFields = SUPPLIER_CONFIG.REQUIRED_FIELDS[supplier.type] || []
  requiredFields.forEach(field => {
    if (!supplier[field] || supplier[field].toString().trim() === '') {
      errors.push(`ต้องระบุ${getFieldLabel(field)}`)
    }
  })
  
  // ตรวจสอบเลขประจำตัวผู้เสียภาษี
  if (supplier.tax_id && !isValidTaxId(supplier.tax_id)) {
    errors.push('เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง')
  }
  
  // ตรวจสอบอีเมล
  if (supplier.email && !isValidEmail(supplier.email)) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง')
  }
  
  // ตรวจสอบเบอร์โทรศัพท์
  if (supplier.phone && !isValidPhone(supplier.phone)) {
    warnings.push('รูปแบบเบอร์โทรศัพท์อาจไม่ถูกต้อง')
  }
  
  // ตรวจสอบวงเงินเครดิต
  if (supplier.credit_limit < 0) {
    errors.push('วงเงินเครดิตต้องไม่ติดลบ')
  }
  
  // ตรวจสอบระยะเวลาเครดิต
  if (supplier.credit_days < 0) {
    errors.push('ระยะเวลาเครดิตต้องไม่ติดลบ')
  }
  
  // ตรวจสอบส่วนลด
  if (supplier.discount_percentage < 0 || supplier.discount_percentage > 100) {
    errors.push('เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 0-100')
  }
  
  // ตรวจสอบอัตราภาษี
  if (supplier.tax_rate < 0 || supplier.tax_rate > 100) {
    errors.push('อัตราภาษีต้องอยู่ระหว่าง 0-100')
  }
  
  // ตรวจสอบเอกสารที่จำเป็น
  const requiredDocs = SUPPLIER_TEMPLATES[getTemplateKey(supplier.type)]?.required_documents || []
  if (requiredDocs.length > 0 && (!supplier.documents || supplier.documents.length === 0)) {
    warnings.push('ควรแนบเอกสารที่จำเป็น')
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * คำนวณการประเมินผู้ขาย
 */
export const calculateSupplierRating = (evaluations = []) => {
  if (!evaluations.length) {
    return {
      overall_score: 0,
      rating: SUPPLIER_RATING.UNRATED,
      breakdown: {}
    }
  }
  
  // คำนวณคะแนนเฉลี่ยตามหมวดหมู่
  const breakdown = {}
  const weights = SUPPLIER_CONFIG.RATING_WEIGHTS
  
  Object.keys(SUPPLIER_CONFIG.RATING_CRITERIA).forEach(criteria => {
    const criteriaEvals = evaluations.filter(evaluation => evaluation.criteria === criteria.toLowerCase())
    if (criteriaEvals.length > 0) {
      const avgScore = criteriaEvals.reduce((sum, evaluation) => sum + evaluation.score, 0) / criteriaEvals.length
      breakdown[criteria.toLowerCase()] = {
        score: avgScore,
        weight: weights[criteria.toLowerCase()] || 0,
        weighted_score: avgScore * (weights[criteria.toLowerCase()] || 0) / 100
      }
    }
  })
  
  // คำนวณคะแนนรวม
  const overallScore = Object.values(breakdown).reduce((sum, item) => sum + item.weighted_score, 0)
  
  // กำหนดเกรด
  let rating = SUPPLIER_RATING.POOR
  const thresholds = SUPPLIER_CONFIG.RATING_THRESHOLDS
  
  if (overallScore >= thresholds[SUPPLIER_RATING.EXCELLENT]) {
    rating = SUPPLIER_RATING.EXCELLENT
  } else if (overallScore >= thresholds[SUPPLIER_RATING.GOOD]) {
    rating = SUPPLIER_RATING.GOOD
  } else if (overallScore >= thresholds[SUPPLIER_RATING.AVERAGE]) {
    rating = SUPPLIER_RATING.AVERAGE
  }
  
  return {
    overall_score: overallScore,
    rating,
    breakdown
  }
}

/**
 * คำนวณยอดซื้อและสถิติ
 */
export const calculateSupplierStatistics = (supplier, transactions = []) => {
  const stats = {
    total_orders: 0,
    total_amount: 0,
    average_order_value: 0,
    last_order_date: null,
    days_since_last_order: 0,
    on_time_delivery_rate: 0,
    defect_rate: 0,
    return_rate: 0,
    payment_punctuality: 0
  }
  
  if (!transactions.length) return stats
  
  // คำนวณยอดรวม
  stats.total_orders = transactions.length
  stats.total_amount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
  stats.average_order_value = stats.total_amount / stats.total_orders
  
  // หาวันที่สั่งซื้อล่าสุด
  const lastOrder = transactions.reduce((latest, tx) => {
    const txDate = new Date(tx.order_date || tx.created_at)
    return txDate > new Date(latest.order_date || latest.created_at) ? tx : latest
  })
  
  if (lastOrder) {
    stats.last_order_date = lastOrder.order_date || lastOrder.created_at
    const daysSince = Math.floor((new Date() - new Date(stats.last_order_date)) / (1000 * 60 * 60 * 24))
    stats.days_since_last_order = daysSince
  }
  
  // คำนวณอัตราการส่งตรงเวลา
  const deliveryData = transactions.filter(tx => tx.delivery_status)
  if (deliveryData.length > 0) {
    const onTimeCount = deliveryData.filter(tx => tx.delivery_status === 'on_time').length
    stats.on_time_delivery_rate = (onTimeCount / deliveryData.length) * 100
  }
  
  // คำนวณอัตราของเสีย
  const qualityData = transactions.filter(tx => tx.quality_status)
  if (qualityData.length > 0) {
    const defectCount = qualityData.filter(tx => tx.quality_status === 'defective').length
    stats.defect_rate = (defectCount / qualityData.length) * 100
  }
  
  return stats
}

/**
 * ตรวจสอบสถานะเครดิต
 */
export const checkCreditStatus = (supplier, currentOutstanding = 0) => {
  const creditLimit = supplier.credit_limit || 0
  const creditUsed = currentOutstanding
  const creditAvailable = creditLimit - creditUsed
  const creditUtilization = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0
  
  let status = 'good'
  let warning = null
  
  if (creditUtilization >= 100) {
    status = 'exceeded'
    warning = 'เกินวงเงินเครดิต'
  } else if (creditUtilization >= SUPPLIER_CONFIG.NOTIFICATION_SETTINGS.CREDIT_LIMIT_WARNING) {
    status = 'warning'
    warning = `ใกล้ถึงวงเงินเครดิต (${creditUtilization.toFixed(1)}%)`
  }
  
  return {
    credit_limit: creditLimit,
    credit_used: creditUsed,
    credit_available: creditAvailable,
    credit_utilization: creditUtilization,
    status,
    warning
  }
}

/**
 * ตรวจสอบเอกสารหมดอายุ
 */
export const checkDocumentExpiry = (supplier) => {
  if (!supplier.documents || !supplier.documents.length) {
    return { expired: [], expiring: [] }
  }
  
  const now = new Date()
  const warningDays = SUPPLIER_CONFIG.NOTIFICATION_SETTINGS.DOCUMENT_EXPIRY_DAYS
  const warningDate = new Date(now.getTime() + warningDays * 24 * 60 * 60 * 1000)
  
  const expired = supplier.documents.filter(doc => 
    doc.expiry_date && new Date(doc.expiry_date) < now
  )
  
  const expiring = supplier.documents.filter(doc => 
    doc.expiry_date && 
    new Date(doc.expiry_date) >= now && 
    new Date(doc.expiry_date) <= warningDate
  )
  
  return { expired, expiring }
}

/**
 * สร้างรายงานประเมินผู้ขาย
 */
export const generateSupplierReport = (supplier, transactions = [], evaluations = []) => {
  const stats = calculateSupplierStatistics(supplier, transactions)
  const rating = calculateSupplierRating(evaluations)
  const creditStatus = checkCreditStatus(supplier, stats.outstanding_amount || 0)
  const documentStatus = checkDocumentExpiry(supplier)
  
  return {
    supplier_info: {
      code: supplier.supplier_code,
      name: supplier.name,
      type: supplier.type,
      status: supplier.status,
      created_date: supplier.created_at
    },
    
    performance: {
      rating: rating.rating,
      overall_score: rating.overall_score,
      breakdown: rating.breakdown
    },
    
    statistics: stats,
    
    financial: {
      credit_status: creditStatus,
      payment_terms: supplier.payment_terms,
      currency: supplier.currency
    },
    
    compliance: {
      document_status: documentStatus,
      last_review_date: supplier.last_review_date,
      next_review_date: supplier.next_review_date
    },
    
    recommendations: generateRecommendations(supplier, stats, rating, creditStatus)
  }
}

/**
 * สร้างคำแนะนำสำหรับผู้ขาย
 */
export const generateRecommendations = (supplier, stats, rating, creditStatus) => {
  const recommendations = []
  
  // คำแนะนำตามการประเมิน
  if (rating.overall_score < SUPPLIER_CONFIG.RATING_THRESHOLDS[SUPPLIER_RATING.AVERAGE]) {
    recommendations.push({
      type: 'warning',
      category: 'performance',
      message: 'ผลการประเมินต่ำ ควรพิจารณาปรับปรุงหรือหาผู้ขายใหม่',
      priority: 'high'
    })
  }
  
  // คำแนะนำตามเครดิต
  if (creditStatus.status === 'exceeded') {
    recommendations.push({
      type: 'error',
      category: 'credit',
      message: 'เกินวงเงินเครดิต ห้ามสั่งซื้อเพิ่มเติม',
      priority: 'urgent'
    })
  } else if (creditStatus.status === 'warning') {
    recommendations.push({
      type: 'warning',
      category: 'credit',
      message: 'ใกล้ถึงวงเงินเครดิต ควรติดตามการชำระเงิน',
      priority: 'medium'
    })
  }
  
  // คำแนะนำตามการใช้งาน
  if (stats.days_since_last_order > SUPPLIER_CONFIG.NOTIFICATION_SETTINGS.INACTIVE_DAYS) {
    recommendations.push({
      type: 'info',
      category: 'activity',
      message: 'ผู้ขายไม่ได้ใช้งานเป็นเวลานาน พิจารณาเปลี่ยนสถานะ',
      priority: 'low'
    })
  }
  
  // คำแนะนำตามการส่งมอบ
  if (stats.on_time_delivery_rate < 80) {
    recommendations.push({
      type: 'warning',
      category: 'delivery',
      message: 'อัตราการส่งมอบตรงเวลาต่ำ ควรปรับปรุงหรือพิจารณาผู้ขายใหม่',
      priority: 'medium'
    })
  }
  
  return recommendations
}

/**
 * ฟังก์ชันช่วยต่างๆ
 */

// ตรวจสอบเลขประจำตัวผู้เสียภาษี
const isValidTaxId = (taxId) => {
  // เลขประจำตัวผู้เสียภาษีไทย 13 หลัก
  if (!/^\d{13}$/.test(taxId)) return false
  
  const digits = taxId.split('').map(Number)
  const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  
  const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * weights[index], 0)
  const checkDigit = (11 - (sum % 11)) % 10
  
  return checkDigit === digits[12]
}

// ตรวจสอบอีเมล
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ตรวจสอบเบอร์โทรศัพท์
const isValidPhone = (phone) => {
  return /^[\d\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 9
}

// ดึงป้ายกำกับฟิลด์
const getFieldLabel = (field) => {
  const labels = {
    name: 'ชื่อผู้ขาย',
    tax_id: 'เลขประจำตัวผู้เสียภาษี',
    contact_person: 'ผู้ติดต่อ',
    phone: 'เบอร์โทรศัพท์',
    email: 'อีเมล',
    address: 'ที่อยู่',
    country: 'ประเทศ',
    department: 'หน่วยงาน',
    id_card: 'เลขประจำตัวประชาชน'
  }
  return labels[field] || field
}

// ดึง template key
const getTemplateKey = (type) => {
  const keyMap = {
    [SUPPLIER_TYPES.DOMESTIC]: 'domestic_company',
    [SUPPLIER_TYPES.INTERNATIONAL]: 'international_supplier',
    [SUPPLIER_TYPES.INDIVIDUAL]: 'individual_supplier',
    [SUPPLIER_TYPES.SERVICE]: 'service_provider'
  }
  return keyMap[type] || 'domestic_company'
}

/**
 * สร้างผู้ขายจาก template
 */
export const createSupplierFromTemplate = (templateKey, customData = {}) => {
  const template = SUPPLIER_TEMPLATES[templateKey]
  if (!template) {
    throw new Error(`Template ${templateKey} not found`)
  }
  
  const baseSupplier = {
    ...SUPPLIER_DEFAULTS,
    ...template,
    ...customData,
    created_at: new Date(),
    updated_at: new Date()
  }
  
  // สร้างรหัสผู้ขายถ้ายังไม่ได้กำหนด
  if (!baseSupplier.supplier_code) {
    baseSupplier.supplier_code = generateSupplierCode(baseSupplier.type)
  }
  
  return baseSupplier
}

/**
 * ✅ TRANSACTION ENGINE REQUIRED EXPORTS
 * เพิ่มฟังก์ชันที่ Transaction Engine ต้องการ
 */

/**
 * ตรวจสอบข้อมูลสำหรับ Transaction Engine - ใช้ snake_case fields
 */
export const validate = (data) => {
  console.log('[Supplier Data] Validating data:', data)
  
  const errors = []
  
  // ตรวจสอบฟิลด์ที่จำเป็น - ตาม SUPPLIER_SCHEMA
  if (!data.name || data.name.trim() === '') {
    errors.push('Field name is required')
  }
  
  if (!data.supplier_code || data.supplier_code.trim() === '') {
    errors.push('Field supplier_code is required')
  }
  
  // ตรวจสอบรูปแบบอีเมล
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Field email has invalid format')
  }
  
  // ตรวจสอบเลขประจำตัวผู้เสียภาษี
  if (data.tax_id && !isValidTaxId(data.tax_id)) {
    errors.push('Field tax_id has invalid format')
  }
  
  // ตรวจสอบ enum values - ถ้ามีข้อมูลแล้วค่อยตรวจ (รองรับทั้ง supplier_type และ type)
  const supplierType = data.supplier_type || data.type
  if (supplierType && supplierType.trim() !== '' && !Object.values(SUPPLIER_TYPES).includes(supplierType)) {
    console.error('[Supplier Validation] Invalid supplier_type:', supplierType, 'Valid types:', Object.values(SUPPLIER_TYPES))
    errors.push(`Field supplier_type must be one of: ${Object.values(SUPPLIER_TYPES).join(', ')}`)
  }
  
  if (data.status && data.status.trim() !== '' && !Object.values(SUPPLIER_STATUS).includes(data.status)) {
    errors.push(`Field status must be one of: ${Object.values(SUPPLIER_STATUS).join(', ')}`)
  }
  
  if (data.payment_terms && data.payment_terms.trim() !== '' && !Object.values(PAYMENT_TERMS).includes(data.payment_terms)) {
    errors.push(`Field payment_terms must be one of: ${Object.values(PAYMENT_TERMS).join(', ')}`)
  }
  
  const result = {
    isValid: errors.length === 0,
    errors,
    warnings: []
  }
  
  console.log('[Supplier Data] Validation result:', result)
  return result
}

/**
 * จัดรูปแบบข้อมูลสำหรับ Transaction Engine - snake_case fields
 */
export const format = (data) => {
  console.log('[Supplier Data] Formatting data:', data)
  
  const formatted = {
    // ใช้ snake_case fields ตาม SUPPLIER_SCHEMA
    supplier_code: data.supplier_code || data.supplierCode || '',
    name: data.name || '',
    supplier_type: data.supplier_type || data.type || 'domestic',
    status: data.status || 'active',
    tax_id: data.tax_id || data.taxId || '',
    business_number: data.business_number || data.businessNumber || '',
    contact_person: data.contact_person || data.contactPerson || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    address: data.address || '',
    province: data.province || '',
    postal_code: data.postal_code || data.postalCode || '',
    country: data.country || 'ไทย',
    payment_terms: data.payment_terms || data.paymentTerms || 'net_30',
    credit_limit: data.credit_limit || data.creditLimit || 0,
    currency: data.currency || 'THB',
    lead_time_days: data.lead_time_days || data.leadTimeDays || 7,
    requires_po: data.requires_po !== undefined ? data.requires_po : true,
    rating: data.rating || 0,
    is_active: data.is_active !== undefined ? data.is_active : true,
    notes: data.notes || '',
    created_date: data.created_date || data.createdDate || new Date(),
    updated_date: data.updated_date || data.updatedDate || new Date(),
    created_by: data.created_by || '',
    updated_by: data.updated_by || '',
    version: data.version || 1
  }
  
  console.log('[Supplier Data] Formatted data:', formatted)
  return formatted
}

/**
 * ฟังก์ชันจัดรูปแบบ
 */
export const formatters = {
  // จัดรูปแบบสถานะ
  formatStatus: (status) => {
    return SUPPLIER_STATUS_LABELS[status] || status
  },
  
  // จัดรูปแบบประเภท
  formatType: (type) => {
    return SUPPLIER_TYPE_LABELS[type] || type
  },
  
  // จัดรูปแบบการประเมิน
  formatRating: (rating) => {
    return SUPPLIER_RATING_LABELS[rating] || rating
  },
  
  // จัดรูปแบบเงื่อนไขการชำระ
  formatPaymentTerms: (terms) => {
    return PAYMENT_TERMS_LABELS[terms] || terms
  },
  
  // สีสำหรับสถานะ
  getStatusColor: (status) => {
    const colors = {
      [SUPPLIER_STATUS.ACTIVE]: '#10b981',
      [SUPPLIER_STATUS.INACTIVE]: '#6b7280',
      [SUPPLIER_STATUS.PENDING]: '#f59e0b',
      [SUPPLIER_STATUS.SUSPENDED]: '#f97316',
      [SUPPLIER_STATUS.BLOCKED]: '#ef4444',
      [SUPPLIER_STATUS.BLACKLISTED]: '#7f1d1d'
    }
    return colors[status] || '#6b7280'
  },
  
  // สีสำหรับการประเมิน
  getRatingColor: (rating) => {
    const colors = {
      [SUPPLIER_RATING.EXCELLENT]: '#059669',
      [SUPPLIER_RATING.GOOD]: '#10b981',
      [SUPPLIER_RATING.AVERAGE]: '#f59e0b',
      [SUPPLIER_RATING.POOR]: '#ef4444',
      [SUPPLIER_RATING.UNRATED]: '#6b7280'
    }
    return colors[rating] || '#6b7280'
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
 * ฟังก์ชันการกรองและค้นหา
 */
export const filters = {
  // กรองตามสถานะ
  byStatus: (suppliers, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return suppliers.filter(s => statuses.includes(s.status))
  },
  
  // กรองตามประเภท
  byType: (suppliers, types) => {
    if (!Array.isArray(types)) types = [types]
    return suppliers.filter(s => types.includes(s.type))
  },
  
  // กรองตามการประเมิน
  byRating: (suppliers, ratings) => {
    if (!Array.isArray(ratings)) ratings = [ratings]
    return suppliers.filter(s => ratings.includes(s.rating))
  },
  
  // กรองผู้ขายที่ใช้งานอยู่
  active: (suppliers) => {
    return suppliers.filter(s => s.status === SUPPLIER_STATUS.ACTIVE)
  },
  
  // กรองผู้ขายที่มีปัญหาเครดิต
  creditIssues: (suppliers) => {
    return suppliers.filter(s => {
      const creditStatus = checkCreditStatus(s, s.outstanding_amount || 0)
      return creditStatus.status === 'exceeded' || creditStatus.status === 'warning'
    })
  },
  
  // กรองผู้ขายที่ไม่ใช้งานนาน
  inactive: (suppliers, days = SUPPLIER_CONFIG.NOTIFICATION_SETTINGS.INACTIVE_DAYS) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return suppliers.filter(s => 
      s.last_order_date && new Date(s.last_order_date) < cutoffDate
    )
  },
  
  // ค้นหาตามคำค้นหา
  search: (suppliers, query) => {
    const searchTerm = query.toLowerCase()
    return suppliers.filter(s => 
      s.name?.toLowerCase().includes(searchTerm) ||
      s.supplier_code?.toLowerCase().includes(searchTerm) ||
      s.contact_person?.toLowerCase().includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm)
    )
  }
}