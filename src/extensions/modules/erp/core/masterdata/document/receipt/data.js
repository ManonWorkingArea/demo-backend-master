/**
 * Receipt Data and Business Logic
 * ข้อมูลและฟังก์ชันทางธุรกิจสำหรับใบเสร็จ
 */

import { RECEIPT_CONFIG, PAYMENT_METHODS, RECEIPT_FIELD_SCHEMA } from './schema.js'

// Code configuration สำหรับการสร้างรหัสใบเสร็จ
export const RECEIPT_CODE_CONFIG = {
  prefix: 'RC',
  yearDigits: 4,
  monthIncluded: true,
  sequenceLength: 6,
  separator: '-',
  format: RECEIPT_CONFIG.NUMBER_FORMAT
}

// Receipt Master Data Class
export class ReceiptMasterData {
  constructor() {
    this.schema = RECEIPT_FIELD_SCHEMA
    this.config = RECEIPT_CONFIG
  }

  // สร้างเลขที่ใบเสร็จใหม่
  generateReceiptNumber(sequence = 1, date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const sequenceStr = String(sequence).padStart(RECEIPT_CODE_CONFIG.sequenceLength, '0')
    
    return `${RECEIPT_CODE_CONFIG.prefix}${year}${month}${RECEIPT_CODE_CONFIG.separator}${sequenceStr}`
  }

  // คำนวณยอดรวม
  calculateTotals(items = [], shippingCost = 0, discountAmount = 0) {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
      return sum + itemTotal
    }, 0)

    const totalAmount = subtotal + shippingCost - discountAmount

    return {
      subtotal: subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total_amount: Math.max(0, totalAmount) // ป้องกันค่าติดลบ
    }
  }

  // Validate receipt data
  validateReceiptData(data) {
    const errors = []

    // ตรวจสอบข้อมูลจำเป็น
    if (!data.receipt_number) {
      errors.push('เลขที่ใบเสร็จเป็นข้อมูลจำเป็น')
    }

    if (!data.customer_name) {
      errors.push('ชื่อลูกค้าเป็นข้อมูลจำเป็น')
    }

    if (!data.total_amount || data.total_amount <= 0) {
      errors.push('ยอดรวมต้องมากกว่า 0')
    }

    // ตรวจสอบรายการสินค้า
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        if (!item.product_name) {
          errors.push(`รายการที่ ${index + 1}: ชื่อสินค้าเป็นข้อมูลจำเป็น`)
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
      isValid: errors.length === 0,
      errors: errors
    }
  }

  // สร้างใบเสร็จจาก template
  createFromTemplate(templateData = {}) {
    const defaultData = {
      receipt_number: '',
      receipt_date: new Date().toISOString(),
      status: 'issued',
      customer_name: '',
      items: [],
      subtotal: 0,
      discount_amount: 0,
      shipping_cost: 0,
      total_amount: 0,
      payment_method: PAYMENT_METHODS.CASH,
      payment_terms: RECEIPT_CONFIG.DEFAULT_PAYMENT_TERMS,
      created_date: new Date().toISOString(),
      ...templateData
    }

    return defaultData
  }

  // Format ข้อมูลสำหรับแสดงผล
  formatForDisplay(receiptData) {
    return {
      ...receiptData,
      formatted_date: receiptData.receipt_date ? 
        new Date(receiptData.receipt_date).toLocaleDateString('th-TH') : '',
      formatted_total: receiptData.total_amount ? 
        receiptData.total_amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00'
    }
  }
}

// Receipt Utilities
export const ReceiptUtils = {
  // สร้างเลขที่ใบเสร็จ
  generateNumber: (sequence, date) => {
    const masterData = new ReceiptMasterData()
    return masterData.generateReceiptNumber(sequence, date)
  },

  // คำนวณยอดรวม
  calculateTotals: (items, shippingCost, discountAmount) => {
    const masterData = new ReceiptMasterData()
    return masterData.calculateTotals(items, shippingCost, discountAmount)
  },

  // Validate ข้อมูล
  validate: (data) => {
    const masterData = new ReceiptMasterData()
    return masterData.validateReceiptData(data)
  },

  // Format สำหรับแสดงผล
  formatForDisplay: (data) => {
    const masterData = new ReceiptMasterData()
    return masterData.formatForDisplay(data)
  },

  // Helper functions
  formatters: {
    currency: (amount) => amount ? amount.toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB'
    }) : '฿0.00',
    
    date: (date) => date ? new Date(date).toLocaleDateString('th-TH') : '',
    
    number: (num) => num ? num.toLocaleString('th-TH') : '0'
  }
}

// Export default
export default ReceiptMasterData