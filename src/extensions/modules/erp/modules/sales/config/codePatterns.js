/**
 * Sales Module Code Patterns Configuration
 * การตั้งค่ารูปแบบเลขที่เอกสารสำหรับระบบขาย
 */

export const SALES_CODE_PATTERNS = {
  // ใบเสนอราคา (Quotation)
  quotation: {
    module: 'quotation',
    name: 'ใบเสนอราคา',
    description: 'รูปแบบเลขที่ใบเสนอราคา',
    prefix: 'QT',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'QT25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ใบสั่งขาย (Sales Order)
  sales_order: {
    module: 'sales_order',
    name: 'ใบสั่งขาย',
    description: 'รูปแบบเลขที่ใบสั่งขาย',
    prefix: 'SO',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'SO25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ใบแจ้งหนี้ (Sales Invoice)
  sales_invoice: {
    module: 'sales_invoice',
    name: 'ใบแจ้งหนี้',
    description: 'รูปแบบเลขที่ใบแจ้งหนี้',
    prefix: 'INV',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'INV25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ใบกำกับภาษี (Tax Invoice)
  tax_invoice: {
    module: 'tax_invoice',
    name: 'ใบกำกับภาษี',
    description: 'รูปแบบเลขที่ใบกำกับภาษี',
    prefix: 'TAX',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'TAX25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ใบส่งของ (Delivery Note)
  delivery_note: {
    module: 'delivery_note',
    name: 'ใบส่งของ',
    description: 'รูปแบบเลขที่ใบส่งของ',
    prefix: 'DN',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'DN25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ใบรับเงิน (Receipt)
  receipt: {
    module: 'receipt',
    name: 'ใบรับเงิน',
    description: 'รูปแบบเลขที่ใบรับเงิน',
    prefix: 'RCP',
    year: true,
    month: true,
    sequence: { 
      digits: 4, 
      start: 1, 
      resetOnYearChange: true,
      resetOnMonthChange: false
    },
    format: '{prefix}{year}{month}{sequence}',
    example: 'RCP25110001',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Alternative patterns for different business needs
export const ALTERNATIVE_SALES_PATTERNS = {
  // รูปแบบเลขที่แบบปี 4 หลัก
  quotation_full_year: {
    module: 'quotation',
    name: 'ใบเสนอราคา (ปี 4 หลัก)',
    prefix: 'QT',
    year: true,
    yearFormat: 'YYYY', // ใช้ปี 4 หลัก
    sequence: { digits: 5, start: 1, resetOnYearChange: true },
    format: '{prefix}{year}{sequence}',
    example: 'QT202500001'
  },

  // รูปแบบเลขที่แบบไม่มีเดือน
  sales_order_no_month: {
    module: 'sales_order',
    name: 'ใบสั่งขาย (ไม่มีเดือน)',
    prefix: 'SO',
    year: true,
    month: false,
    sequence: { digits: 5, start: 1, resetOnYearChange: true },
    format: '{prefix}{year}{sequence}',
    example: 'SO2500001'
  },

  // รูปแบบเลขที่แบบมีสาขา
  invoice_with_branch: {
    module: 'sales_invoice',
    name: 'ใบแจ้งหนี้ (มีสาขา)',
    prefix: 'INV',
    branch: true,
    branchFormat: 'BB', // 2 หลัก
    year: true,
    month: true,
    sequence: { digits: 4, start: 1, resetOnYearChange: true },
    format: '{prefix}{branch}{year}{month}{sequence}',
    example: 'INV0125110001'
  }
}

// Sales Code Management Helper Functions
export const SalesCodeHelpers = {
  /**
   * Get all sales code patterns
   */
  getAllSalesPatterns() {
    return Object.values(SALES_CODE_PATTERNS)
  },

  /**
   * Get pattern by module
   */
  getPatternByModule(module) {
    return SALES_CODE_PATTERNS[module] || null
  },

  /**
   * Validate sales code format
   */
  validateSalesCode(code, module) {
    const pattern = this.getPatternByModule(module)
    if (!pattern) return false

    // Basic validation - starts with prefix
    return code.startsWith(pattern.prefix)
  },

  /**
   * Generate example code for pattern
   */
  generateExample(pattern) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const sequence = '0001'

    let example = pattern.prefix
    if (pattern.year) example += year
    if (pattern.month) example += month
    if (pattern.sequence) example += sequence

    return example
  },

  /**
   * Get next sequence number for module
   */
  async getNextSequence(module, codeManager) {
    try {
      if (codeManager && codeManager.generateCode) {
        const nextCode = await codeManager.generateCode(module)
        return nextCode
      }
      return null
    } catch (error) {
      console.error(`Failed to get next sequence for ${module}:`, error)
      return null
    }
  }
}

export default {
  SALES_CODE_PATTERNS,
  ALTERNATIVE_SALES_PATTERNS,
  SalesCodeHelpers
}