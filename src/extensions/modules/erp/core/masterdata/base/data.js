/**
 * Base Transaction Data Functions
 * ฟังก์ชันพื้นฐานสำหรับธุรกรรมทั้งหมด
 */

import {
  BASE_STATUS,
  BASE_PRIORITY,
  BASE_CURRENCIES,
  BASE_APPROVAL_STATUS,
  BASE_SYNC_STATUS,
  BASE_CONFIG,
  BASE_DEFAULTS,
  BASE_STATUS_LABELS,
  BASE_PRIORITY_LABELS
} from './schema.js'

/**
 * สร้างรหัส Transaction ID
 */
export const generateTransactionId = (prefix = BASE_CONFIG.ID_PREFIX, length = BASE_CONFIG.ID_LENGTH) => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const combined = timestamp + random
  
  return prefix + '-' + combined.substring(0, length - prefix.length - 1)
}

/**
 * สร้างหมายเลขเอกสาร
 */
export const generateDocumentNumber = (type, date = new Date(), sequence = 1) => {
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const seq = sequence.toString().padStart(4, '0')
  
  return `${type}${year}${month}${day}-${seq}`
}

/**
 * ตรวจสอบความถูกต้องของข้อมูลพื้นฐาน
 */
export const validateBaseData = (data) => {
  const errors = []
  const warnings = []
  
  // ตรวจสอบสกุลเงิน
  if (data.currency && !Object.values(BASE_CURRENCIES).includes(data.currency)) {
    errors.push(`สกุลเงิน ${data.currency} ไม่ถูกต้อง`)
  }
  
  // ตรวจสอบสถานะ
  if (data.status && !Object.values(BASE_STATUS).includes(data.status)) {
    warnings.push(`สถานะ ${data.status} ไม่อยู่ในรายการมาตรฐาน`)
  }
  
  // ตรวจสอบระดับความสำคัญ
  if (data.priority && !Object.values(BASE_PRIORITY).includes(data.priority)) {
    warnings.push(`ระดับความสำคัญ ${data.priority} ไม่อยู่ในรายการมาตรฐาน`)
  }
  
  // ตรวจสอบอัตราแลกเปลี่ยน
  if (data.exchange_rate && (data.exchange_rate <= 0 || data.exchange_rate > 1000)) {
    warnings.push('อัตราแลกเปลี่ยนผิดปกติ')
  }
  
  // ตรวจสอบวันที่
  if (data.transaction_date && new Date(data.transaction_date) > new Date()) {
    warnings.push('วันที่ธุรกรรมเป็นวันในอนาคต')
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * แปลงสกุลเงิน
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRates = {}) => {
  if (fromCurrency === toCurrency) {
    return amount
  }
  
  // ใช้อัตราแลกเปลี่ยนที่กำหนด
  const rate = exchangeRates[`${fromCurrency}_${toCurrency}`]
  if (rate) {
    return Math.round(amount * rate * Math.pow(10, BASE_CONFIG.DECIMAL_PLACES)) / Math.pow(10, BASE_CONFIG.DECIMAL_PLACES)
  }
  
  // ถ้าไม่มีอัตราแลกเปลี่ยน ให้คืนค่าเดิม
  return amount
}

/**
 * คำนวณอายุของเอกสาร (วัน)
 */
export const calculateDocumentAge = (createdDate) => {
  const now = new Date()
  const created = new Date(createdDate)
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * ตรวจสอบสถานะการอนุมัติ
 */
export const checkApprovalRequired = (data, approvalRules = {}) => {
  // ตรวจสอบตามมูลค่า
  if (data.total_amount && approvalRules.amount_limit) {
    if (data.total_amount > approvalRules.amount_limit) {
      return {
        required: true,
        reason: 'เกินวงเงินที่อนุมัติได้',
        level: 'manager'
      }
    }
  }
  
  // ตรวจสอบตามประเภทธุรกรรม
  if (data.transaction_type && approvalRules.type_requires_approval) {
    if (approvalRules.type_requires_approval.includes(data.transaction_type)) {
      return {
        required: true,
        reason: 'ประเภทธุรกรรมต้องได้รับการอนุมัติ',
        level: 'supervisor'
      }
    }
  }
  
  return {
    required: false,
    reason: null,
    level: null
  }
}

/**
 * อัพเดท timestamp
 */
export const updateTimestamp = (data, userId = null) => {
  const now = new Date()
  
  return {
    ...data,
    updated_at: now,
    updated_by: userId || data.updated_by
  }
}

/**
 * สร้างข้อมูลพื้นฐานใหม่
 */
export const createBaseTransaction = (type, data = {}) => {
  const now = new Date()
  const transactionId = generateTransactionId()
  
  return {
    ...BASE_DEFAULTS,
    id: transactionId,
    transaction_id: transactionId,
    transaction_type: type,
    transaction_date: now,
    document_number: generateDocumentNumber(type.substring(0, 3).toUpperCase(), now),
    created_at: now,
    updated_at: now,
    ...data
  }
}

/**
 * ฟังก์ชันช่วยในการจัดรูปแบบ
 */
export const formatters = {
  // จัดรูปแบบสกุลเงิน
  formatCurrency: (amount, currency = BASE_CONFIG.DEFAULT_CURRENCY) => {
    const formatter = new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: BASE_CONFIG.DECIMAL_PLACES,
      maximumFractionDigits: BASE_CONFIG.DECIMAL_PLACES
    })
    
    return formatter.format(amount)
  },
  
  // จัดรูปแบบตัวเลข
  formatNumber: (number, decimals = BASE_CONFIG.DECIMAL_PLACES) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  },
  
  // จัดรูปแบบวันที่
  formatDate: (date, format = BASE_CONFIG.DATE_FORMAT) => {
    const d = new Date(date)
    
    if (format === 'YYYY-MM-DD') {
      return d.toISOString().split('T')[0]
    }
    
    if (format === 'YYYY-MM-DD HH:mm:ss') {
      return d.toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // Thai format
    if (format === 'thai') {
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return d.toLocaleDateString('th-TH')
  },
  
  // จัดรูปแบบสถานะ
  formatStatus: (status) => {
    return BASE_STATUS_LABELS[status] || status
  },
  
  // จัดรูปแบบระดับความสำคัญ
  formatPriority: (priority) => {
    return BASE_PRIORITY_LABELS[priority] || priority
  },
  
  // สีสำหรับสถานะ
  getStatusColor: (status) => {
    const colors = {
      [BASE_STATUS.DRAFT]: '#6b7280',      // เทา
      [BASE_STATUS.PENDING]: '#f59e0b',    // เหลือง
      [BASE_STATUS.APPROVED]: '#10b981',   // เขียว
      [BASE_STATUS.REJECTED]: '#ef4444',   // แดง
      [BASE_STATUS.ACTIVE]: '#3b82f6',     // น้ำเงิน
      [BASE_STATUS.INACTIVE]: '#6b7280',   // เทา
      [BASE_STATUS.COMPLETED]: '#059669',  // เขียวเข้ม
      [BASE_STATUS.CANCELLED]: '#dc2626',  // แดงเข้ม
      [BASE_STATUS.ARCHIVED]: '#4b5563'    // เทาเข้ม
    }
    return colors[status] || '#6b7280'
  },
  
  // สีสำหรับระดับความสำคัญ
  getPriorityColor: (priority) => {
    const colors = {
      [BASE_PRIORITY.LOW]: '#10b981',      // เขียว
      [BASE_PRIORITY.NORMAL]: '#3b82f6',   // น้ำเงิน
      [BASE_PRIORITY.HIGH]: '#f59e0b',     // เหลือง
      [BASE_PRIORITY.URGENT]: '#f97316',   // ส้ม
      [BASE_PRIORITY.CRITICAL]: '#dc2626'  // แดง
    }
    return colors[priority] || '#3b82f6'
  }
}

/**
 * ฟังก์ชันการค้นหาและกรอง
 */
export const filters = {
  // กรองตามสถานะ
  byStatus: (items, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return items.filter(item => statuses.includes(item.status))
  },
  
  // กรองตามระดับความสำคัญ
  byPriority: (items, priorities) => {
    if (!Array.isArray(priorities)) priorities = [priorities]
    return items.filter(item => priorities.includes(item.priority))
  },
  
  // กรองตามช่วงวันที่
  byDateRange: (items, startDate, endDate, dateField = 'created_at') => {
    return items.filter(item => {
      const date = new Date(item[dateField])
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  },
  
  // กรองตามสกุลเงิน
  byCurrency: (items, currencies) => {
    if (!Array.isArray(currencies)) currencies = [currencies]
    return items.filter(item => currencies.includes(item.currency))
  },
  
  // กรองตามผู้สร้าง
  byCreator: (items, creators) => {
    if (!Array.isArray(creators)) creators = [creators]
    return items.filter(item => creators.includes(item.created_by))
  },
  
  // กรองรายการที่ต้องอนุมัติ
  requiresApproval: (items) => {
    return items.filter(item => 
      item.approval_status === BASE_APPROVAL_STATUS.PENDING ||
      item.approval_status === BASE_APPROVAL_STATUS.REQUIRES_REVIEW
    )
  },
  
  // กรองรายการที่ยังไม่ซิงค์
  notSynced: (items) => {
    return items.filter(item => 
      item.sync_status === BASE_SYNC_STATUS.PENDING ||
      item.sync_status === BASE_SYNC_STATUS.FAILED
    )
  }
}

/**
 * เครื่องมือสำหรับการรายงาน
 */
export const reporting = {
  // สรุปตามสถานะ
  summarizeByStatus: (items) => {
    return items.reduce((acc, item) => {
      const status = item.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  },
  
  // สรุปตามระดับความสำคัญ
  summarizeByPriority: (items) => {
    return items.reduce((acc, item) => {
      const priority = item.priority || 'unknown'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})
  },
  
  // สรุปตามช่วงเวลา
  summarizeByTimeRange: (items, range = 'day', dateField = 'created_at') => {
    return items.reduce((acc, item) => {
      const date = new Date(item[dateField])
      let key
      
      switch (range) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week': {
          const week = getWeekNumber(date)
          key = `${date.getFullYear()}-W${week}`
          break
        }
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'year':
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split('T')[0]
      }
      
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }
}

// Helper function สำหรับคำนวณสัปดาห์
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}