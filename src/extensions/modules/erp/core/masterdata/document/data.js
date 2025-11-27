/**
 * Document Transaction Data Functions
 * ฟังก์ชันการจัดการข้อมูลเอกสาร
 */

import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  DOCUMENT_CONFIG,
  DOCUMENT_DEFAULTS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  BRANCH_TYPE_LABELS
} from './schema.js'

/**
 * Document Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Document Module
 */
export const DOCUMENT_CODE_CONFIG = {
  // Code Pattern Configuration  
  patterns: {
    contract: {
      prefix: 'CON',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // CON20250001
    },
    agreement: {
      prefix: 'AGR',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // AGR20250001
    },
    memo: {
      prefix: 'MEM',
      year: true,
      month: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{month}{sequence}' // MEM2025100001
    },
    report: {
      prefix: 'RPT',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // RPT20250001
    },
    certificate: {
      prefix: 'CER',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // CER20250001
    },
    policy: {
      prefix: 'POL',
      year: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // POL2025001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'contract',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireApprovalWorkflow: true,
    enableVersionControl: true
  }
}

/**
 * สร้างเลขที่เอกสาร
 */
export const generateDocumentNumber = (type = DOCUMENT_TYPES.RECEIPT, sequence = 1) => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  
  const format = DOCUMENT_CONFIG.DOCUMENT_NUMBER_FORMAT[type.toUpperCase()] || 
                 DOCUMENT_CONFIG.DOCUMENT_NUMBER_FORMAT.RECEIPT
  
  return format
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{number:6}', sequence.toString().padStart(6, '0'))
}

/**
 * คำนวณมูลค่าเอกสาร
 */
export const calculateDocumentValues = (items = [], vatRate = DOCUMENT_CONFIG.DEFAULT_VAT_RATE, shippingCost = 0, discountAmount = 0) => {
  // คำนวณมูลค่ารวมจากรายการสินค้า
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
    return sum + itemTotal
  }, 0)
  
  // มูลค่าหลังหักส่วนลด
  const netTotal = subtotal - discountAmount + shippingCost
  
  // คำนวณภาษีมูลค่าเพิ่ม
  const vatAmount = netTotal * (vatRate / 100)
  
  // มูลค่ารวมทั้งหมด
  const grandTotal = netTotal + vatAmount
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    net_total: Math.round(netTotal * 100) / 100,
    vat_amount: Math.round(vatAmount * 100) / 100,
    grand_total: Math.round(grandTotal * 100) / 100,
    total_amount: Math.round(grandTotal * 100) / 100 // สำหรับความเข้ากันได้
  }
}

/**
 * ตรวจสอบความถูกต้องของเอกสาร
 */
export const validateDocument = (document, type) => {
  const errors = []
  const warnings = []
  
  // ตรวจสอบข้อมูลพื้นฐาน
  if (!document.customer_name) {
    errors.push('ต้องระบุชื่อลูกค้า')
  }
  
  if (!document.items || document.items.length === 0) {
    errors.push('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ')
  }
  
  // ตรวจสอบเฉพาะใบกำกับภาษี
  if (type === DOCUMENT_TYPES.TAX_INVOICE) {
    if (!document.tax_invoice_number) {
      errors.push('ต้องระบุเลขที่ใบกำกับภาษี')
    }
    
    if (!document.subtotal || document.subtotal <= 0) {
      errors.push('มูลค่ารวมต้องมากกว่า 0')
    }
    
    if (!document.vat_amount || document.vat_amount < 0) {
      errors.push('ภาษีมูลค่าเพิ่มไม่ถูกต้อง')
    }
    
    if (!document.grand_total || document.grand_total <= 0) {
      errors.push('มูลค่ารวมทั้งหมดต้องมากกว่า 0')
    }
  }
  
  // ตรวจสอบเฉพาะใบเสร็จ
  if (type === DOCUMENT_TYPES.RECEIPT) {
    if (!document.receipt_number) {
      errors.push('ต้องระบุเลขที่ใบเสร็จ')
    }
    
    if (!document.total_amount || document.total_amount <= 0) {
      errors.push('มูลค่ารวมต้องมากกว่า 0')
    }
  }
  
  // ตรวจสอบรายการสินค้า
  if (document.items) {
    document.items.forEach((item, index) => {
      if (!item.product_name) {
        errors.push(`รายการที่ ${index + 1}: ต้องระบุชื่อสินค้า`)
      }
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
    errors,
    warnings
  }
}

/**
 * สร้างเอกสารจากเทมเพลต
 */
export const createDocumentFromTemplate = (type, data = {}) => {
  const now = new Date()
  
  const baseDocument = {
    ...DOCUMENT_DEFAULTS,
    document_type: type,
    status: DOCUMENT_STATUS.DRAFT,
    created_at: now,
    updated_at: now,
    ...data
  }
  
  // สร้างเลขที่เอกสารตามประเภท
  if (type === DOCUMENT_TYPES.RECEIPT && !baseDocument.receipt_number) {
    baseDocument.receipt_number = generateDocumentNumber(type)
  }
  
  if (type === DOCUMENT_TYPES.TAX_INVOICE && !baseDocument.tax_invoice_number) {
    baseDocument.tax_invoice_number = generateDocumentNumber(type)
  }
  
  // คำนวณมูลค่าถ้ามีรายการสินค้า
  if (baseDocument.items && baseDocument.items.length > 0) {
    const calculations = calculateDocumentValues(
      baseDocument.items,
      baseDocument.vat_rate,
      baseDocument.shipping_cost,
      baseDocument.discount_amount
    )
    
    Object.assign(baseDocument, calculations)
  }
  
  return baseDocument
}

/**
 * ฟังก์ชันช่วยในการจัดรูปแบบ
 */
export const formatters = {
  // จัดรูปแบบประเภทเอกสาร
  formatDocumentType: (type) => {
    return DOCUMENT_TYPE_LABELS[type] || type
  },
  
  // จัดรูปแบบสถานะเอกสาร
  formatDocumentStatus: (status) => {
    return DOCUMENT_STATUS_LABELS[status] || status
  },
  
  // จัดรูปแบบรหัสสาขา
  formatBranchCode: (code) => {
    return BRANCH_TYPE_LABELS[code] || code
  },
  
  // สีสำหรับสถานะเอกสาร
  getDocumentStatusColor: (status) => {
    const colors = {
      [DOCUMENT_STATUS.DRAFT]: '#6b7280',      // เทา
      [DOCUMENT_STATUS.ISSUED]: '#10b981',     // เขียว
      [DOCUMENT_STATUS.SENT]: '#3b82f6',       // น้ำเงิน
      [DOCUMENT_STATUS.RECEIVED]: '#059669',   // เขียวเข้ม
      [DOCUMENT_STATUS.CANCELLED]: '#ef4444',  // แดง
      [DOCUMENT_STATUS.VOIDED]: '#dc2626'      // แดงเข้ม
    }
    return colors[status] || '#6b7280'
  },
  
  // จัดรูปแบบจำนวนเงิน
  formatCurrency: (amount, currency = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
}

/**
 * ฟังก์ชันการค้นหาและกรอง
 */
export const filters = {
  // กรองตามประเภทเอกสาร
  byDocumentType: (documents, types) => {
    if (!Array.isArray(types)) types = [types]
    return documents.filter(doc => types.includes(doc.document_type))
  },
  
  // กรองตามสถานะเอกสาร
  byDocumentStatus: (documents, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return documents.filter(doc => statuses.includes(doc.status))
  },
  
  // กรองตามลูกค้า
  byCustomer: (documents, customerNames) => {
    if (!Array.isArray(customerNames)) customerNames = [customerNames]
    return documents.filter(doc => customerNames.includes(doc.customer_name))
  },
  
  // กรองตามช่วงวันที่
  byDateRange: (documents, startDate, endDate, dateField = 'created_at') => {
    return documents.filter(doc => {
      const date = new Date(doc[dateField])
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  },
  
  // กรองตามช่วงมูลค่า
  byAmountRange: (documents, minAmount, maxAmount) => {
    return documents.filter(doc => {
      const amount = doc.grand_total || doc.total_amount || 0
      return amount >= minAmount && amount <= maxAmount
    })
  }
}