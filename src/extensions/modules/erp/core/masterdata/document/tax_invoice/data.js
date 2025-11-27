/**
 * Tax Invoice Data and Business Logic
 * ข้อมูลและฟังก์ชันทางธุรกิจสำหรับใบกำกับภาษี
 */

import { 
  TAX_INVOICE_CONFIG, 
  VAT_RATES, 
  VAT_TYPES, 
  TAX_INVOICE_FIELD_SCHEMA 
} from './schema.js'

// Code configuration สำหรับการสร้างรหัสใบกำกับภาษี
export const TAX_INVOICE_CODE_CONFIG = {
  prefix: 'TAX',
  yearDigits: 4,
  monthIncluded: true,
  sequenceLength: 6,
  separator: '-',
  format: TAX_INVOICE_CONFIG.NUMBER_FORMAT
}

// Tax Invoice Master Data Class
export class TaxInvoiceMasterData {
  constructor() {
    this.schema = TAX_INVOICE_FIELD_SCHEMA
    this.config = TAX_INVOICE_CONFIG
  }

  // สร้างเลขที่ใบกำกับภาษีใหม่
  generateTaxInvoiceNumber(sequence = 1, date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const sequenceStr = String(sequence).padStart(TAX_INVOICE_CODE_CONFIG.sequenceLength, '0')
    
    return `${TAX_INVOICE_CODE_CONFIG.prefix}${year}${month}${TAX_INVOICE_CODE_CONFIG.separator}${sequenceStr}`
  }

  // คำนวณ VAT และยอดรวม
  calculateVATAndTotals(items = [], shippingCost = 0, discountAmount = 0, vatRate = VAT_RATES.STANDARD) {
    // คำนวณ subtotal จากรายการสินค้า
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
      return sum + itemTotal
    }, 0)

    // คำนวณ net total (ราคาสุทธิก่อน VAT)
    const netTotal = subtotal + shippingCost - discountAmount

    // คำนวณ VAT
    const vatAmount = (netTotal * vatRate) / 100

    // คำนวณ grand total (รวม VAT)
    const grandTotal = netTotal + vatAmount

    return {
      subtotal: subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      net_total: Math.max(0, netTotal),
      vat_rate: vatRate,
      vat_amount: Math.max(0, vatAmount),
      grand_total: Math.max(0, grandTotal)
    }
  }

  // Validate tax invoice data
  validateTaxInvoiceData(data) {
    const errors = []

    // ตรวจสอบข้อมูลจำเป็น
    if (!data.tax_invoice_number) {
      errors.push('เลขที่ใบกำกับภาษีเป็นข้อมูลจำเป็น')
    }

    if (!data.customer_name) {
      errors.push('ชื่อลูกค้า/ผู้ซื้อเป็นข้อมูลจำเป็น')
    }

    if (!data.subtotal || data.subtotal < 0) {
      errors.push('ยอดสินค้ารวมต้องไม่ติดลบ')
    }

    if (!data.grand_total || data.grand_total <= 0) {
      errors.push('ยอดรวมทั้งสิ้นต้องมากกว่า 0')
    }

    // ตรวจสอบ VAT
    if (data.vat_rate < 0 || data.vat_rate > 100) {
      errors.push('อัตราภาษีมูลค่าเพิ่มต้องอยู่ระหว่าง 0-100%')
    }

    if (!data.vat_amount || data.vat_amount < 0) {
      errors.push('ยอด VAT ต้องไม่ติดลบ')
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

    // ตรวจสอบเลขประจำตัวผู้เสียภาษี (ถ้ามี)
    if (data.customer_tax_id && !this.validateTaxId(data.customer_tax_id)) {
      errors.push('รูปแบบเลขประจำตัวผู้เสียภาษีไม่ถูกต้อง')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  // ตรวจสอบรูปแบบเลขประจำตัวผู้เสียภาษี
  validateTaxId(taxId) {
    // เลขประจำตัวผู้เสียภาษีไทย 13 หลัก
    const taxIdPattern = /^\d{13}$/
    return taxIdPattern.test(taxId)
  }

  // สร้างใบกำกับภาษีจาก template
  createFromTemplate(templateData = {}) {
    const defaultData = {
      tax_invoice_number: '',
      tax_invoice_date: new Date().toISOString(),
      status: 'issued',
      customer_name: '',
      items: [],
      subtotal: 0,
      discount_amount: 0,
      shipping_cost: 0,
      net_total: 0,
      vat_type: VAT_TYPES.STANDARD,
      vat_rate: VAT_RATES.STANDARD,
      vat_amount: 0,
      grand_total: 0,
      payment_terms: TAX_INVOICE_CONFIG.DEFAULT_PAYMENT_TERMS,
      branch_code: TAX_INVOICE_CONFIG.DEFAULT_BRANCH_CODE,
      created_date: new Date().toISOString(),
      ...templateData
    }

    return defaultData
  }

  // Format ข้อมูลสำหรับแสดงผล
  formatForDisplay(taxInvoiceData) {
    return {
      ...taxInvoiceData,
      formatted_date: taxInvoiceData.tax_invoice_date ? 
        new Date(taxInvoiceData.tax_invoice_date).toLocaleDateString('th-TH') : '',
      formatted_due_date: taxInvoiceData.due_date ? 
        new Date(taxInvoiceData.due_date).toLocaleDateString('th-TH') : '',
      formatted_subtotal: taxInvoiceData.subtotal ? 
        taxInvoiceData.subtotal.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      formatted_vat_amount: taxInvoiceData.vat_amount ? 
        taxInvoiceData.vat_amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00',
      formatted_grand_total: taxInvoiceData.grand_total ? 
        taxInvoiceData.grand_total.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB'
        }) : '฿0.00'
    }
  }
}

// Tax Invoice Utilities
export const TaxInvoiceUtils = {
  // สร้างเลขที่ใบกำกับภาษี
  generateNumber: (sequence, date) => {
    const masterData = new TaxInvoiceMasterData()
    return masterData.generateTaxInvoiceNumber(sequence, date)
  },

  // คำนวณ VAT และยอดรวม
  calculateVATAndTotals: (items, shippingCost, discountAmount, vatRate) => {
    const masterData = new TaxInvoiceMasterData()
    return masterData.calculateVATAndTotals(items, shippingCost, discountAmount, vatRate)
  },

  // Validate ข้อมูล
  validate: (data) => {
    const masterData = new TaxInvoiceMasterData()
    return masterData.validateTaxInvoiceData(data)
  },

  // Validate Tax ID
  validateTaxId: (taxId) => {
    const masterData = new TaxInvoiceMasterData()
    return masterData.validateTaxId(taxId)
  },

  // Format สำหรับแสดงผล
  formatForDisplay: (data) => {
    const masterData = new TaxInvoiceMasterData()
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

    percent: (rate) => rate ? `${rate}%` : '0%',

    taxId: (taxId) => taxId ? taxId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5') : ''
  }
}

// Export default
export default TaxInvoiceMasterData