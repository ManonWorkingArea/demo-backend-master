/**
 * Purchase Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Purchase
 */

import * as Schema from './schema.js'

/**
 * Purchase Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Purchase Module
 */
export const PURCHASE_CODE_CONFIG = {
  // Default pattern (ให้เหมือน supplier pattern)
  prefix: 'PR',
  year: true,
  sequence: {
    digits: 5,
    start: 1,
    resetOnYearChange: true
  },
  format: '{prefix}{year}{sequence}', // PR202500001

  // Code Pattern Configuration (สำหรับ advanced usage)
  patterns: {
    default: {
      prefix: 'PR',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PR202500001
    },
    purchaseRequest: {
      prefix: 'PR',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PR202500001
    },
    purchaseOrder: {
      prefix: 'PO',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PO202500001
    },
    purchaseContract: {
      prefix: 'PC',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PC20250001
    },
    purchaseInvoice: {
      prefix: 'PI',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PI202500001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'purchaseRequest',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireApprovalForCustomCode: true
  }
}

// Default Values - ค่าเริ่มต้น
export const PURCHASE_DEFAULTS = {
  TYPE: Schema.PURCHASE_TYPES.STANDARD,
  STATUS: Schema.PURCHASE_STATUS.DRAFT,
  PRIORITY: Schema.PURCHASE_PRIORITIES.NORMAL,
  PAYMENT_TERMS: Schema.PAYMENT_TERMS.NET_30,
  DELIVERY_TERMS: Schema.DELIVERY_TERMS.EXW,
  SUPPLIER_TYPE: Schema.SUPPLIER_TYPES.DISTRIBUTOR,
  APPROVAL_LEVEL: Schema.APPROVAL_LEVELS.AUTO_APPROVE,
  CURRENCY: 'THB',
  TAX_RATE: 7,
  DISCOUNT_RATE: 0,
  DELIVERY_DAYS: 7,
  WARRANTY_DAYS: 365,
  IS_ACTIVE: true,
  REQUIRES_APPROVAL: false,
  AUTO_CREATE_RECEIPT: false
}

// Validation Rules - กฎการตรวจสอบ
export const PURCHASE_VALIDATION_RULES = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 99999999,
  MIN_QUANTITY: 0.01,
  MAX_QUANTITY: 999999,
  MIN_DISCOUNT: 0,
  MAX_DISCOUNT: 100,
  MIN_TAX_RATE: 0,
  MAX_TAX_RATE: 50,
  REQUIRED_FIELDS: {
    [Schema.PURCHASE_STATUS.DRAFT]: ['purchase_order', 'supplier_id'],
    [Schema.PURCHASE_STATUS.APPROVED]: ['approved_by', 'approved_at'],
    [Schema.PURCHASE_STATUS.COMPLETED]: ['received_at', 'received_by']
  }
}

// Helper Functions
export const PurchaseMasterData = {
  /**
   * Get purchase type label
   */
  getPurchaseTypeLabel(type) {
    const labels = {
      [Schema.PURCHASE_TYPES.STANDARD]: 'การซื้อมาตรฐาน',
      [Schema.PURCHASE_TYPES.SERVICE]: 'การซื้อบริการ',
      [Schema.PURCHASE_TYPES.URGENT]: 'การซื้อเร่งด่วน',
      [Schema.PURCHASE_TYPES.BLANKET_ORDER]: 'ใบสั่งซื้อครอบคลุม',
      [Schema.PURCHASE_TYPES.CONTRACT]: 'การซื้อตามสัญญา',
      [Schema.PURCHASE_TYPES.SPOT_BUY]: 'การซื้อทันที',
      [Schema.PURCHASE_TYPES.CONSIGNMENT]: 'การซื้อแบบฝากขาย',
      [Schema.PURCHASE_TYPES.DROP_SHIP]: 'การซื้อส่งตรง'
    }
    return labels[type] || type
  },

  /**
   * Get status label
   */
  getStatusLabel(status) {
    const labels = {
      [Schema.PURCHASE_STATUS.DRAFT]: 'แบบร่าง',
      [Schema.PURCHASE_STATUS.PENDING_APPROVAL]: 'รออนุมัติ',
      [Schema.PURCHASE_STATUS.APPROVED]: 'อนุมัติแล้ว',
      [Schema.PURCHASE_STATUS.SENT]: 'ส่งแล้ว',
      [Schema.PURCHASE_STATUS.ACKNOWLEDGED]: 'ยืนยันแล้ว',
      [Schema.PURCHASE_STATUS.PARTIALLY_RECEIVED]: 'รับบางส่วน',
      [Schema.PURCHASE_STATUS.COMPLETED]: 'เสร็จสิ้น',
      [Schema.PURCHASE_STATUS.CANCELLED]: 'ยกเลิก',
      [Schema.PURCHASE_STATUS.REJECTED]: 'ปฏิเสธ'
    }
    return labels[status] || status
  },

  /**
   * Calculate purchase totals
   */
  calculatePurchaseTotals(items, discountRate = 0, taxRate = 7) {
    const subtotal = items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unit_price || 0))
    }, 0)
    
    const discount = subtotal * (discountRate / 100)
    const afterDiscount = subtotal - discount
    const tax = afterDiscount * (taxRate / 100)
    const total = afterDiscount + tax
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      afterDiscount: Math.round(afterDiscount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  },

  /**
   * Generate purchase order number
   */
  generatePurchaseOrderNumber(type = Schema.PURCHASE_TYPES.STANDARD, sequence = 1) {
    const typePrefix = {
      [Schema.PURCHASE_TYPES.STANDARD]: 'PO',
      [Schema.PURCHASE_TYPES.SERVICE]: 'SVC',
      [Schema.PURCHASE_TYPES.URGENT]: 'URG',
      [Schema.PURCHASE_TYPES.BLANKET_ORDER]: 'BLK',
      [Schema.PURCHASE_TYPES.CONTRACT]: 'CNT',
      [Schema.PURCHASE_TYPES.SPOT_BUY]: 'SPT',
      [Schema.PURCHASE_TYPES.CONSIGNMENT]: 'CSG',
      [Schema.PURCHASE_TYPES.DROP_SHIP]: 'DRP'
    }
    
    const prefix = typePrefix[type] || 'PO'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const seqStr = sequence.toString().padStart(4, '0')
    
    return `${prefix}-${date}-${seqStr}`
  },

  /**
   * Validate purchase data
   */
  validatePurchaseData(data, status = Schema.PURCHASE_STATUS.DRAFT) {
    const errors = []
    const rules = PURCHASE_VALIDATION_RULES
    const requiredFields = rules.REQUIRED_FIELDS[status] || []
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Field '${field}' is required for status '${status}'`)
      }
    })
    
    // Validate amounts
    if (data.total_amount && (data.total_amount < rules.MIN_AMOUNT || data.total_amount > rules.MAX_AMOUNT)) {
      errors.push(`Total amount must be between ${rules.MIN_AMOUNT} and ${rules.MAX_AMOUNT}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Format function for Purchase Request
 * ฟังก์ชันจัดรูปแบบข้อมูลสำหรับใบขอซื้อ
 */
export function format(data) {
  console.log('🔧 [Purchase/format] กำลังจัดรูปแบบข้อมูล Purchase Request:', data)
  
  try {
    const formatted = {
      // Basic Information
      description: data.description || '',
      department: data.department || '',
      requested_by: data.requested_by || '',
      priority: data.priority || PURCHASE_DEFAULTS.PRIORITY,
      purchase_type: data.purchase_type || PURCHASE_DEFAULTS.TYPE,
      category: data.category || '',
      
      // Purchase Request specific fields
      purchase_request_code: data.purchase_request_code || '', // จะถูกสร้างโดย CodeManager
      expected_delivery_date: data.expected_delivery_date || null,
      justification: data.justification || '',
      
      // Items and totals
      items: Array.isArray(data.items) ? data.items : [],
      subtotal: parseFloat(data.subtotal) || 0,
      tax_amount: parseFloat(data.tax_amount) || 0,
      total_amount: parseFloat(data.total_amount) || 0,
      
      // Additional information
      delivery_address: data.delivery_address || '',
      supplier_suggestion: data.supplier_suggestion || '',
      payment_terms: data.payment_terms || PURCHASE_DEFAULTS.PAYMENT_TERMS,
      budget_code: data.budget_code || '',
      cost_center: data.cost_center || '',
      notes: data.notes || '',
      
      // Status and workflow
      status: data.status || PURCHASE_DEFAULTS.STATUS,
      workflow_state: data.workflow_state || 'draft',
      
      // Stock related (for stock replenishment)
      is_stock_replenishment: Boolean(data.is_stock_replenishment),
      auto_update_stock: Boolean(data.auto_update_stock),
      new_products: Array.isArray(data.new_products) ? data.new_products : [],
      stock_impact_items: Array.isArray(data.stock_impact_items) ? data.stock_impact_items : [],
      
      // System fields
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.created_by || '',
      updated_by: data.updated_by || ''
    }
    
    console.log('✅ [Purchase/format] จัดรูปแบบเสร็จสิ้น:', formatted)
    return formatted
  } catch (error) {
    console.error('❌ [Purchase/format] เกิดข้อผิดพลาด:', error)
    throw error
  }
}

/**
 * Validate function for Purchase Request
 * ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลใบขอซื้อ
 */
export function validate(data) {
  console.log('🔍 [Purchase/validate] กำลังตรวจสอบข้อมูล Purchase Request:', data)
  
  const errors = []
  
  try {
    // Required fields validation
    if (!data.description || data.description.trim() === '') {
      errors.push('กรุณาระบุรายละเอียดใบขอซื้อ')
    }
    
    if (!data.requested_by || data.requested_by.trim() === '') {
      errors.push('กรุณาระบุผู้ขอซื้อ')
    }
    
    // Items validation
    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ')
    } else {
      data.items.forEach((item, index) => {
        if (!item.product_name || item.product_name.trim() === '') {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุชื่อสินค้า`)
        }
        
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`รายการที่ ${index + 1}: จำนวนต้องมากกว่า 0`)
        }
        
        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องไม่น้อยกว่า 0`)
        }
      })
    }
    
    // Amount validation
    if (data.total_amount && data.total_amount < 0) {
      errors.push('ยอดรวมทั้งสิ้นต้องไม่น้อยกว่า 0')
    }
    
    // Status validation
    const validStatuses = Object.values(Schema.PURCHASE_STATUS)
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`สถานะไม่ถูกต้อง: ${data.status}`)
    }
    
    // Priority validation
    const validPriorities = Object.values(Schema.PURCHASE_PRIORITIES)
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push(`ระดับความสำคัญไม่ถูกต้อง: ${data.priority}`)
    }
    
    // Purchase type validation
    const validTypes = Object.values(Schema.PURCHASE_TYPES)
    if (data.purchase_type && !validTypes.includes(data.purchase_type)) {
      errors.push(`ประเภทการซื้อไม่ถูกต้อง: ${data.purchase_type}`)
    }
    
    const result = {
      isValid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? format(data) : null
    }
    
    console.log('✅ [Purchase/validate] ผลการตรวจสอบ:', result)
    return result
    
  } catch (error) {
    console.error('❌ [Purchase/validate] เกิดข้อผิดพลาดในการตรวจสอบ:', error)
    return {
      isValid: false,
      errors: [`เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: ${error.message}`],
      data: null
    }
  }
}

export default {
  ...Schema,
  PURCHASE_DEFAULTS,
  PURCHASE_VALIDATION_RULES,
  PurchaseMasterData,
  format,
  validate
}