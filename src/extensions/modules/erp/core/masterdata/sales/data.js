/**
 * Sales Transaction Data
 * ข้อมูลหลักและฟังก์ชันสำหรับการขาย
 */

import {
  SALES_TYPES,
  SALES_STATUS,
  CUSTOMER_TYPES,
  CUSTOMER_GROUPS,
  PAYMENT_TERMS,
  SALES_TYPE_LABELS,
  SALES_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_GROUP_LABELS,
  PAYMENT_TERM_LABELS,
  SALES_CONFIG,
  SALES_DEFAULTS
} from './schema.js'

/**
 * Sales Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Sales Module
 */
export const SALES_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    customer: {
      prefix: 'CUS',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // CUS20250001
    },
    salesOrder: {
      prefix: 'SO',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // SO202500001
    },
    salesInvoice: {
      prefix: 'SI',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // SI202500001
    },
    salesQuotation: {
      prefix: 'SQ',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // SQ20250001
    },
    creditNote: {
      prefix: 'CN',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // CN20250001
    },
    debitNote: {
      prefix: 'DN',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // DN20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'customer',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireTaxNumberValidation: true
  }
}

/**
 * ข้อมูลหลักสำหรับการขาย
 */
export const SalesMasterData = {
  // ฟังก์ชันสำหรับ Labels
  getSalesTypeLabel(type) {
    return SALES_TYPE_LABELS[type] || type
  },

  getSalesStatusLabel(status) {
    return SALES_STATUS_LABELS[status] || status
  },

  getCustomerTypeLabel(type) {
    return CUSTOMER_TYPE_LABELS[type] || type
  },

  getCustomerGroupLabel(group) {
    return CUSTOMER_GROUP_LABELS[group] || group
  },

  getPaymentTermLabel(term) {
    return PAYMENT_TERM_LABELS[term] || term
  },

  // ฟังก์ชันสำหรับ Options
  getSalesTypeOptions() {
    return Object.keys(SALES_TYPES).map(key => ({
      value: SALES_TYPES[key],
      label: SALES_TYPE_LABELS[SALES_TYPES[key]],
      key
    }))
  },

  getSalesStatusOptions() {
    return Object.keys(SALES_STATUS).map(key => ({
      value: SALES_STATUS[key],
      label: SALES_STATUS_LABELS[SALES_STATUS[key]],
      key
    }))
  },

  getCustomerTypeOptions() {
    return Object.keys(CUSTOMER_TYPES).map(key => ({
      value: CUSTOMER_TYPES[key],
      label: CUSTOMER_TYPE_LABELS[CUSTOMER_TYPES[key]],
      key
    }))
  },

  getCustomerGroupOptions() {
    return Object.keys(CUSTOMER_GROUPS).map(key => ({
      value: CUSTOMER_GROUPS[key],
      label: CUSTOMER_GROUP_LABELS[CUSTOMER_GROUPS[key]],
      key
    }))
  },

  getPaymentTermOptions() {
    return Object.keys(PAYMENT_TERMS).map(key => ({
      value: PAYMENT_TERMS[key],
      label: PAYMENT_TERM_LABELS[PAYMENT_TERMS[key]],
      key
    }))
  },

  // ฟังก์ชันสำหรับสร้างเลขที่เอกสาร
  generateDocumentNumber(documentType, sequence, date = new Date()) {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const format = SALES_CONFIG.DOCUMENT_NUMBER_FORMAT[documentType.toUpperCase()]
    
    if (!format) {
      throw new Error(`Unsupported document type: ${documentType}`)
    }
    
    return format
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{number:4}', sequence.toString().padStart(4, '0'))
  },

  generateQuotationNumber(sequence, date) {
    return this.generateDocumentNumber('quotation', sequence, date)
  },

  generateSalesOrderNumber(sequence, date) {
    return this.generateDocumentNumber('sales_order', sequence, date)
  },

  generateInvoiceNumber(sequence, date) {
    return this.generateDocumentNumber('invoice', sequence, date)
  },

  // ฟังก์ชันคำนวณยอดเงิน
  calculateLineTotal(quantity, unitPrice, discountPercent = 0) {
    const subtotal = quantity * unitPrice
    const discountAmount = subtotal * (discountPercent / 100)
    return subtotal - discountAmount
  },

  calculateSubtotal(items) {
    return items.reduce((total, item) => {
      return total + this.calculateLineTotal(
        item.quantity || 0,
        item.unit_price || 0,
        item.discount_percent || 0
      )
    }, 0)
  },

  calculateDiscount(subtotal, discountPercent = 0, discountAmount = 0) {
    if (discountAmount > 0) {
      return discountAmount
    }
    return subtotal * (discountPercent / 100)
  },

  calculateTax(taxableAmount, vatRate = SALES_CONFIG.DEFAULT_VAT_RATE) {
    return taxableAmount * (vatRate / 100)
  },

  calculateWithholding(taxableAmount, withholdingRate = SALES_CONFIG.DEFAULT_WITHHOLDING_RATE) {
    return taxableAmount * (withholdingRate / 100)
  },

  calculateTotal(items, discountPercent = 0, discountAmount = 0, vatRate = SALES_CONFIG.DEFAULT_VAT_RATE, withholdingRate = 0) {
    const subtotal = this.calculateSubtotal(items)
    const discount = this.calculateDiscount(subtotal, discountPercent, discountAmount)
    const taxableAmount = subtotal - discount
    const vat = this.calculateTax(taxableAmount, vatRate)
    const withholding = this.calculateWithholding(taxableAmount, withholdingRate)
    
    return {
      subtotal,
      discount,
      taxable_amount: taxableAmount,
      vat,
      withholding,
      total: taxableAmount + vat - withholding
    }
  },

  // ฟังก์ชันคำนวณวันครบกำหนด
  calculateDueDate(salesDate, paymentTerm) {
    const date = new Date(salesDate)
    
    switch (paymentTerm) {
      case PAYMENT_TERMS.CASH:
        return date
      case PAYMENT_TERMS.CREDIT_7:
        date.setDate(date.getDate() + 7)
        break
      case PAYMENT_TERMS.CREDIT_15:
        date.setDate(date.getDate() + 15)
        break
      case PAYMENT_TERMS.CREDIT_30:
        date.setDate(date.getDate() + 30)
        break
      case PAYMENT_TERMS.CREDIT_45:
        date.setDate(date.getDate() + 45)
        break
      case PAYMENT_TERMS.CREDIT_60:
        date.setDate(date.getDate() + 60)
        break
      case PAYMENT_TERMS.CREDIT_90:
        date.setDate(date.getDate() + 90)
        break
      default:
        date.setDate(date.getDate() + SALES_CONFIG.DEFAULT_DUE_DATE_DAYS)
    }
    
    return date
  },

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  validateSalesData(data) {
    const errors = []
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!data.customer_id) {
      errors.push('กรุณาระบุลูกค้า')
    }
    
    if (!data.sales_date) {
      errors.push('กรุณาระบุวันที่ขาย')
    }
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('กรุณาระบุรายการสินค้า')
    } else {
      // ตรวจสอบรายการสินค้า
      data.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุสินค้า`)
        }
        
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนที่ถูกต้อง`)
        }
        
        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุราคาต่อหน่วยที่ถูกต้อง`)
        }
      })
    }
    
    // ตรวจสอบประเภทการขาย
    if (!Object.values(SALES_TYPES).includes(data.type)) {
      errors.push('ประเภทการขายไม่ถูกต้อง')
    }
    
    // ตรวจสอบสถานะ
    if (!Object.values(SALES_STATUS).includes(data.status)) {
      errors.push('สถานะไม่ถูกต้อง')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // ฟังก์ชันตรวจสอบสิทธิ์การอนุมัติ
  getRequiredApprovalLevel(totalAmount) {
    if (totalAmount <= SALES_CONFIG.APPROVAL_LEVELS.SALES_TEAM) {
      return 'SALES_TEAM'
    } else if (totalAmount <= SALES_CONFIG.APPROVAL_LEVELS.SALES_MANAGER) {
      return 'SALES_MANAGER'
    } else if (totalAmount <= SALES_CONFIG.APPROVAL_LEVELS.FINANCE) {
      return 'FINANCE'
    } else {
      return 'MANAGEMENT'
    }
  },

  // ฟังก์ชันตรวจสอบสถานะการจัดส่ง
  canShip(salesData) {
    const validStatuses = [SALES_STATUS.CONFIRMED, SALES_STATUS.PROCESSING]
    return validStatuses.includes(salesData.status) && 
           salesData.payment_status !== 'overdue'
  },

  // ฟังก์ชันคำนวณค่าคอมมิชชั่น
  calculateCommission(salesAmount, commissionRate) {
    return salesAmount * (commissionRate / 100)
  },

  // ฟังก์ชันสร้างข้อมูลเริ่มต้น
  createDefaultSalesData(overrides = {}) {
    return {
      ...SALES_DEFAULTS,
      sales_date: new Date().toISOString().split('T')[0],
      due_date: this.calculateDueDate(new Date(), SALES_DEFAULTS.payment_term).toISOString().split('T')[0],
      items: [],
      ...overrides
    }
  },

  // ฟังก์ชันค้นหาและกรองข้อมูล
  filterSalesByStatus(salesList, status) {
    return salesList.filter(sale => sale.status === status)
  },

  filterSalesByCustomer(salesList, customerId) {
    return salesList.filter(sale => sale.customer_id === customerId)
  },

  filterSalesByDateRange(salesList, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return salesList.filter(sale => {
      const saleDate = new Date(sale.sales_date)
      return saleDate >= start && saleDate <= end
    })
  },

  // ฟังก์ชันสำหรับรายงาน
  calculateSalesSummary(salesList) {
    return salesList.reduce((summary, sale) => {
      summary.total_sales += sale.total_amount || 0
      summary.total_orders += 1
      
      if (sale.status === SALES_STATUS.COMPLETED) {
        summary.completed_sales += sale.total_amount || 0
        summary.completed_orders += 1
      }
      
      return summary
    }, {
      total_sales: 0,
      total_orders: 0,
      completed_sales: 0,
      completed_orders: 0,
      average_order_value: 0
    })
  },

  // ฟังก์ชันจัดกลุ่มยอดขายตามลูกค้า
  groupSalesByCustomer(salesList) {
    return salesList.reduce((groups, sale) => {
      const customerId = sale.customer_id
      if (!groups[customerId]) {
        groups[customerId] = {
          customer_id: customerId,
          total_amount: 0,
          order_count: 0,
          orders: []
        }
      }
      
      groups[customerId].total_amount += sale.total_amount || 0
      groups[customerId].order_count += 1
      groups[customerId].orders.push(sale)
      
      return groups
    }, {})
  }
}

// ฟังก์ชันยูทิลิตี้
export const SalesUtils = {
  formatCurrency(amount, currency = 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  formatDate(date, locale = 'th-TH') {
    return new Date(date).toLocaleDateString(locale)
  },

  formatDateTime(date, locale = 'th-TH') {
    return new Date(date).toLocaleString(locale)
  },

  generateReference(prefix = 'REF', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = prefix + '-'
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  },

  isOverdue(dueDate) {
    return new Date(dueDate) < new Date()
  },

  getDaysOverdue(dueDate) {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today - due
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

export default SalesMasterData