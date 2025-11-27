/**
 * Invoice Data and Business Logic
 * ข้อมูลและฟังก์ชันทางธุรกิจสำหรับใบแจ้งหนี้
 */

import { 
  INVOICE_CONFIG, 
  PAYMENT_TERMS, 
  INVOICE_TYPES, 
  INVOICE_FIELD_SCHEMA 
} from './schema.js'

// Code configuration สำหรับการสร้างรหัสใบแจ้งหนี้
export const INVOICE_CODE_CONFIG = {
  prefix: 'INV',
  yearDigits: 4,
  monthIncluded: true,
  sequenceLength: 6,
  separator: '-',
  format: INVOICE_CONFIG.NUMBER_FORMAT
}

// Invoice Master Data Class
export class InvoiceMasterData {
  constructor() {
    this.schema = INVOICE_FIELD_SCHEMA
    this.config = INVOICE_CONFIG
  }

  // สร้างเลขที่ใบแจ้งหนี้ใหม่
  generateInvoiceNumber(sequence = 1, date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const sequenceStr = String(sequence).padStart(INVOICE_CODE_CONFIG.sequenceLength, '0')
    
    return `${INVOICE_CODE_CONFIG.prefix}${year}${month}${INVOICE_CODE_CONFIG.separator}${sequenceStr}`
  }

  // คำนวณยอดรวมและวันครบกำหนด
  calculateTotalsAndDueDate(items = [], shippingCost = 0, discountAmount = 0, taxAmount = 0, paymentTermsDays = 30, invoiceDate = new Date()) {
    // คำนวณ subtotal จากรายการสินค้า
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
      const itemDiscount = item.discount_amount || ((itemTotal * (item.discount_percent || 0)) / 100)
      return sum + itemTotal - itemDiscount
    }, 0)

    // คำนวณ total amount
    const totalAmount = subtotal + shippingCost - discountAmount + taxAmount

    // คำนวณวันครบกำหนดชำระ
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + paymentTermsDays)

    return {
      subtotal: subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: Math.max(0, totalAmount),
      due_date: dueDate.toISOString(),
      remaining_amount: Math.max(0, totalAmount)
    }
  }

  // คำนวณยอดคงเหลือ
  calculateRemainingAmount(totalAmount, paidAmount) {
    return Math.max(0, totalAmount - paidAmount)
  }

  // ตรวจสอบสถานะการชำระเงิน
  determinePaymentStatus(totalAmount, paidAmount, dueDate = new Date()) {
    const remaining = this.calculateRemainingAmount(totalAmount, paidAmount)
    const now = new Date()
    const due = new Date(dueDate)

    if (remaining === 0) {
      return 'paid'
    } else if (paidAmount > 0 && remaining > 0) {
      return now > due ? 'overdue' : 'partial_paid'
    } else if (remaining > 0 && now > due) {
      return 'overdue'
    }

    return 'sent' // หรือสถานะปัจจุบัน
  }

  // Validate invoice data
  validateInvoiceData(data) {
    const errors = []

    // ตรวจสอบข้อมูลจำเป็น
    if (!data.invoice_number) {
      errors.push('เลขที่ใบแจ้งหนี้เป็นข้อมูลจำเป็น')
    }

    if (!data.customer_name) {
      errors.push('ชื่อลูกค้าเป็นข้อมูลจำเป็น')
    }

    if (!data.total_amount || data.total_amount <= 0) {
      errors.push('ยอดรวมต้องมากกว่า 0')
    }

    // ตรวจสอบรายการสินค้า
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('ต้องมีรายการสินค้า/บริการอย่างน้อย 1 รายการ')
    } else {
      data.items.forEach((item, index) => {
        if (!item.product_name) {
          errors.push(`รายการที่ ${index + 1}: ชื่อสินค้า/บริการเป็นข้อมูลจำเป็น`)
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`รายการที่ ${index + 1}: จำนวนต้องมากกว่า 0`)
        }
        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องไม่ติดลบ`)
        }
      })
    }

    // ตรวจสอบเงื่อนไขการชำระเงิน
    if (data.payment_terms_days && data.payment_terms_days < 0) {
      errors.push('จำนวนวันกำหนดชำระต้องไม่ติดลบ')
    }

    // ตรวจสอบยอดเงิน
    if (data.paid_amount && data.paid_amount < 0) {
      errors.push('ยอดที่ชำระแล้วต้องไม่ติดลบ')
    }

    if (data.paid_amount && data.total_amount && data.paid_amount > data.total_amount) {
      errors.push('ยอดที่ชำระแล้วต้องไม่เกินยอดรวม')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  // สร้างใบแจ้งหนี้จาก template
  createFromTemplate(templateData = {}) {
    const defaultData = {
      invoice_number: '',
      invoice_date: new Date().toISOString(),
      invoice_type: INVOICE_TYPES.STANDARD,
      status: 'draft',
      customer_name: '',
      items: [],
      subtotal: 0,
      discount_amount: 0,
      shipping_cost: 0,
      tax_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      payment_terms: PAYMENT_TERMS.NET_30,
      payment_terms_days: INVOICE_CONFIG.DEFAULT_PAYMENT_TERMS_DAYS,
      created_date: new Date().toISOString(),
      ...templateData
    }

    // คำนวณวันครบกำหนด
    const calculations = this.calculateTotalsAndDueDate(
      defaultData.items,
      defaultData.shipping_cost,
      defaultData.discount_amount,
      defaultData.tax_amount,
      defaultData.payment_terms_days,
      new Date(defaultData.invoice_date)
    )

    return {
      ...defaultData,
      ...calculations
    }
  }

  // Format ข้อมูลสำหรับแสดงผล
  formatForDisplay(invoiceData) {
    return {
      ...invoiceData,
      formatted_date: invoiceData.invoice_date ? 
        new Date(invoiceData.invoice_date).toLocaleDateString('th-TH') : '',
      formatted_due_date: invoiceData.due_date ? 
        new Date(invoiceData.due_date).toLocaleDateString('th-TH') : '',
      formatted_subtotal: invoiceData.subtotal ? 
        invoiceData.subtotal.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      formatted_total: invoiceData.total_amount ? 
        invoiceData.total_amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      formatted_paid: invoiceData.paid_amount ? 
        invoiceData.paid_amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      formatted_remaining: invoiceData.remaining_amount ? 
        invoiceData.remaining_amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      is_overdue: invoiceData.due_date ? new Date() > new Date(invoiceData.due_date) : false
    }
  }
}

// Invoice Utilities
export const InvoiceUtils = {
  // สร้างเลขที่ใบแจ้งหนี้
  generateNumber: (sequence, date) => {
    const masterData = new InvoiceMasterData()
    return masterData.generateInvoiceNumber(sequence, date)
  },

  // คำนวณยอดรวมและวันครบกำหนด
  calculateTotalsAndDueDate: (items, shippingCost, discountAmount, taxAmount, paymentTermsDays, invoiceDate) => {
    const masterData = new InvoiceMasterData()
    return masterData.calculateTotalsAndDueDate(items, shippingCost, discountAmount, taxAmount, paymentTermsDays, invoiceDate)
  },

  // คำนวณยอดคงเหลือ
  calculateRemainingAmount: (totalAmount, paidAmount) => {
    const masterData = new InvoiceMasterData()
    return masterData.calculateRemainingAmount(totalAmount, paidAmount)
  },

  // ตรวจสอบสถานะการชำระเงิน
  determinePaymentStatus: (totalAmount, paidAmount, dueDate) => {
    const masterData = new InvoiceMasterData()
    return masterData.determinePaymentStatus(totalAmount, paidAmount, dueDate)
  },

  // Validate ข้อมูล
  validate: (data) => {
    const masterData = new InvoiceMasterData()
    return masterData.validateInvoiceData(data)
  },

  // Format สำหรับแสดงผล
  formatForDisplay: (data) => {
    const masterData = new InvoiceMasterData()
    return masterData.formatForDisplay(data)
  },

  // Helper functions
  formatters: {
    currency: (amount) => amount ? amount.toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB'
    }) : '฿0.00',
    
    date: (date) => date ? new Date(date).toLocaleDateString('th-TH') : '',
    
    number: (num) => num ? num.toLocaleString('th-TH') : '0',

    percentage: (amount, total) => total > 0 ? `${((amount / total) * 100).toFixed(1)}%` : '0%'
  }
}

// Export default
export default InvoiceMasterData