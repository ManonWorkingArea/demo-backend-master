// ==========================================
// JOURNAL MODULE - BUSINESS LOGIC & UTILITIES
// ==========================================

import {
  JOURNAL_TYPES,
  POSTING_STATUS,
  REFERENCE_TYPES,
  JOURNAL_VALIDATION_RULES,
  AUTO_POSTING_RULES
} from './schema.js'

// ==========================================
// JOURNAL ENTRY UTILITIES
// ==========================================
export const JournalUtils = {
  /**
   * Generate journal entry number
   */
  generateEntryNumber(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const timestamp = Date.now().toString().slice(-4)
    
    return `JE-${year}${month}${day}-${timestamp}`
  },

  /**
   * Get journal type label in Thai
   */
  getJournalTypeLabel(type) {
    const labels = {
      [JOURNAL_TYPES.GENERAL]: 'รายการทั่วไป',
      [JOURNAL_TYPES.SALES]: 'จากการขาย',
      [JOURNAL_TYPES.PURCHASE]: 'จากการซื้อ',
      [JOURNAL_TYPES.PAYMENT]: 'จากการชำระเงิน',
      [JOURNAL_TYPES.RECEIPT]: 'จากการรับชำระ',
      [JOURNAL_TYPES.INVENTORY]: 'จากสินค้าคงคลัง',
      [JOURNAL_TYPES.ADJUSTMENT]: 'รายการปรับปรุง',
      [JOURNAL_TYPES.CLOSING]: 'รายการปิดบัญชี',
      [JOURNAL_TYPES.OPENING]: 'รายการยกมา'
    }
    return labels[type] || type
  },

  /**
   * Validate journal entry
   */
  validateJournalEntry(entry, period = null, chartOfAccounts = []) {
    const errors = []
    
    // Run all validation rules
    Object.entries(JOURNAL_VALIDATION_RULES).forEach(([key, validator]) => {
      let isValid = false
      
      switch(key) {
        case 'balance_check':
        case 'min_lines':
        case 'line_amount_check':
          isValid = validator.rule(entry)
          break
        case 'period_check':
          isValid = validator.rule(entry, period)
          break
        case 'account_check':
          isValid = validator.rule(entry, chartOfAccounts)
          break
      }
      
      if (!isValid) {
        errors.push(validator.message)
      }
    })
    
    // Additional field validations
    if (!entry.entry_date) {
      errors.push('วันที่บันทึกรายการเป็นข้อมูลที่จำเป็น')
    }
    
    if (!entry.description || entry.description.trim().length < 5) {
      errors.push('รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร')
    }
    
    if (!entry.journal_type) {
      errors.push('ต้องระบุประเภทรายการบัญชี')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Calculate totals from lines
   */
  calculateTotals(lines) {
    let totalDebit = 0
    let totalCredit = 0
    
    lines.forEach(line => {
      totalDebit += parseFloat(line.debit_amount) || 0
      totalCredit += parseFloat(line.credit_amount) || 0
    })
    
    return {
      total_debit: totalDebit,
      total_credit: totalCredit,
      balance_difference: Math.abs(totalDebit - totalCredit)
    }
  },

  /**
   * Check if entry is balanced
   */
  isBalanced(entry) {
    const diff = Math.abs(entry.total_debit - entry.total_credit)
    return diff < 0.01
  },

  /**
   * Format journal lines for display
   */
  formatLinesForDisplay(lines) {
    return lines.map((line, index) => ({
      ...line,
      line_number: index + 1,
      amount_display: line.debit_amount > 0 
        ? `${this.formatCurrency(line.debit_amount)} (Dr)` 
        : `${this.formatCurrency(line.credit_amount)} (Cr)`
    }))
  },

  /**
   * Create journal entry from template
   */
  createFromTemplate(template) {
    return {
      entry_number: this.generateEntryNumber(),
      entry_date: new Date().toISOString().split('T')[0],
      journal_type: template.journal_type || JOURNAL_TYPES.GENERAL,
      description: template.description || '',
      lines: template.lines || [],
      state: 'draft',
      posting_status: POSTING_STATUS.DRAFT,
      is_auto_generated: false
    }
  },

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }
}

// ==========================================
// AUTO-POSTING LOGIC
// ==========================================
export const AutoPostingEngine = {
  /**
   * Auto-post journal entry from Sales Order
   */
  async postFromSalesOrder(salesOrder) {
    const rules = AUTO_POSTING_RULES.SALES_ORDER
    if (!rules.enabled) return null
    
    const lines = [
      // Dr. Accounts Receivable
      {
        line_number: 1,
        account_code: rules.accounts.debit,
        account_name: 'ลูกหนี้การค้า',
        description: `ขายสินค้าให้ ${salesOrder.customer_name}`,
        debit_amount: salesOrder.total_amount,
        credit_amount: 0,
        customer_id: salesOrder.customer_id
      },
      // Cr. Sales Revenue
      {
        line_number: 2,
        account_code: rules.accounts.credit_revenue,
        account_name: 'รายได้จากการขาย',
        description: 'รายได้จากการขาย',
        debit_amount: 0,
        credit_amount: salesOrder.subtotal,
        customer_id: salesOrder.customer_id
      }
    ]
    
    // Add VAT line if applicable
    if (salesOrder.vat_amount > 0) {
      lines.push({
        line_number: 3,
        account_code: rules.accounts.credit_vat,
        account_name: 'ภาษีขาย',
        description: 'ภาษีมูลค่าเพิ่ม 7%',
        debit_amount: 0,
        credit_amount: salesOrder.vat_amount,
        tax_type: 'vat',
        tax_rate: 7,
        tax_amount: salesOrder.vat_amount
      })
    }
    
    const totals = JournalUtils.calculateTotals(lines)
    
    return {
      entry_number: JournalUtils.generateEntryNumber(),
      entry_date: salesOrder.order_date || new Date().toISOString().split('T')[0],
      journal_type: JOURNAL_TYPES.SALES,
      reference_type: REFERENCE_TYPES.SALES_ORDER,
      reference_id: salesOrder.id,
      reference_number: salesOrder.order_number,
      description: `รายการขาย ${salesOrder.order_number} - ${salesOrder.customer_name}`,
      lines,
      total_debit: totals.total_debit,
      total_credit: totals.total_credit,
      balance_difference: totals.balance_difference,
      is_auto_generated: true,
      state: 'draft'
    }
  },

  /**
   * Auto-post journal entry from Purchase Order
   */
  async postFromPurchaseOrder(purchaseOrder) {
    const rules = AUTO_POSTING_RULES.PURCHASE_ORDER
    if (!rules.enabled) return null
    
    const lines = [
      // Dr. Inventory
      {
        line_number: 1,
        account_code: rules.accounts.debit_inventory,
        account_name: 'สินค้าคงเหลือ',
        description: `ซื้อสินค้าจาก ${purchaseOrder.supplier_name}`,
        debit_amount: purchaseOrder.subtotal,
        credit_amount: 0,
        supplier_id: purchaseOrder.supplier_id
      }
    ]
    
    // Add VAT Input if applicable
    if (purchaseOrder.vat_amount > 0) {
      lines.push({
        line_number: 2,
        account_code: rules.accounts.debit_vat,
        account_name: 'ภาษีซื้อ',
        description: 'ภาษีมูลค่าเพิ่ม 7%',
        debit_amount: purchaseOrder.vat_amount,
        credit_amount: 0,
        tax_type: 'vat',
        tax_rate: 7,
        tax_amount: purchaseOrder.vat_amount
      })
    }
    
    // Cr. Accounts Payable
    lines.push({
      line_number: lines.length + 1,
      account_code: rules.accounts.credit,
      account_name: 'เจ้าหนี้การค้า',
      description: 'เจ้าหนี้จากการซื้อ',
      debit_amount: 0,
      credit_amount: purchaseOrder.total_amount,
      supplier_id: purchaseOrder.supplier_id
    })
    
    const totals = JournalUtils.calculateTotals(lines)
    
    return {
      entry_number: JournalUtils.generateEntryNumber(),
      entry_date: purchaseOrder.order_date || new Date().toISOString().split('T')[0],
      journal_type: JOURNAL_TYPES.PURCHASE,
      reference_type: REFERENCE_TYPES.PURCHASE_ORDER,
      reference_id: purchaseOrder.id,
      reference_number: purchaseOrder.po_number,
      description: `รายการซื้อ ${purchaseOrder.po_number} - ${purchaseOrder.supplier_name}`,
      lines,
      total_debit: totals.total_debit,
      total_credit: totals.total_credit,
      balance_difference: totals.balance_difference,
      is_auto_generated: true,
      state: 'draft'
    }
  },

  /**
   * Auto-post from Payment (AP or AR)
   */
  async postFromPayment(payment) {
    const isPayable = payment.payment_type === 'payable'
    const rules = isPayable ? AUTO_POSTING_RULES.PAYMENT : AUTO_POSTING_RULES.RECEIPT
    
    if (!rules.enabled) return null
    
    const lines = isPayable ? [
      // Dr. Accounts Payable
      {
        line_number: 1,
        account_code: rules.accounts.debit_ap,
        account_name: 'เจ้าหนี้การค้า',
        description: `ชำระเงินให้ ${payment.payee_name}`,
        debit_amount: payment.amount,
        credit_amount: 0,
        supplier_id: payment.payee_id
      },
      // Cr. Bank
      {
        line_number: 2,
        account_code: rules.accounts.credit_bank,
        account_name: 'เงินฝากธนาคาร',
        description: 'จ่ายเงินผ่านธนาคาร',
        debit_amount: 0,
        credit_amount: payment.amount
      }
    ] : [
      // Dr. Bank
      {
        line_number: 1,
        account_code: rules.accounts.debit_bank,
        account_name: 'เงินฝากธนาคาร',
        description: `รับชำระจาก ${payment.payer_name}`,
        debit_amount: payment.amount,
        credit_amount: 0
      },
      // Cr. Accounts Receivable
      {
        line_number: 2,
        account_code: rules.accounts.credit_ar,
        account_name: 'ลูกหนี้การค้า',
        description: 'รับชำระลูกหนี้',
        debit_amount: 0,
        credit_amount: payment.amount,
        customer_id: payment.payer_id
      }
    ]
    
    const totals = JournalUtils.calculateTotals(lines)
    
    return {
      entry_number: JournalUtils.generateEntryNumber(),
      entry_date: payment.payment_date || new Date().toISOString().split('T')[0],
      journal_type: JOURNAL_TYPES.PAYMENT,
      reference_type: REFERENCE_TYPES.PAYMENT,
      reference_id: payment.id,
      reference_number: payment.payment_number,
      description: isPayable 
        ? `ชำระเงินให้ ${payment.payee_name}` 
        : `รับชำระจาก ${payment.payer_name}`,
      lines,
      total_debit: totals.total_debit,
      total_credit: totals.total_credit,
      balance_difference: totals.balance_difference,
      is_auto_generated: true,
      state: 'draft'
    }
  }
}

// ==========================================
// POSTING ENGINE
// ==========================================
export const PostingEngine = {
  /**
   * Post journal entry
   */
  async postEntry(entry, userId) {
    // Validate before posting
    const validation = JournalUtils.validateJournalEntry(entry)
    if (!validation.isValid) {
      throw new Error(`Cannot post: ${validation.errors.join(', ')}`)
    }
    
    // Check if balanced
    if (!JournalUtils.isBalanced(entry)) {
      throw new Error('Cannot post: Entry is not balanced')
    }
    
    // Update entry status
    entry.state = 'posted'
    entry.posting_status = POSTING_STATUS.POSTED
    entry.posted_date = new Date().toISOString()
    entry.posted_by = userId
    
    return entry
  },

  /**
   * Reverse journal entry
   */
  async reverseEntry(entry, reason, userId) {
    if (entry.state !== 'posted') {
      throw new Error('Can only reverse posted entries')
    }
    
    // Create reversal entry with opposite amounts
    const reversalLines = entry.lines.map(line => ({
      ...line,
      debit_amount: line.credit_amount,
      credit_amount: line.debit_amount,
      description: `[Reversal] ${line.description}`
    }))
    
    const reversalEntry = {
      entry_number: JournalUtils.generateEntryNumber(),
      entry_date: new Date().toISOString().split('T')[0],
      journal_type: entry.journal_type,
      description: `[กลับรายการ] ${entry.description}`,
      lines: reversalLines,
      total_debit: entry.total_credit,
      total_credit: entry.total_debit,
      reversed_entry_id: entry.id,
      reversal_reason: reason,
      is_auto_generated: true,
      state: 'posted',
      posting_status: POSTING_STATUS.POSTED,
      posted_date: new Date().toISOString(),
      posted_by: userId
    }
    
    // Update original entry
    entry.state = 'reversed'
    entry.posting_status = POSTING_STATUS.REVERSED
    entry.reversed_date = new Date().toISOString()
    entry.reversed_by = userId
    entry.reversal_reason = reason
    
    return {
      originalEntry: entry,
      reversalEntry
    }
  }
}

// Export all
export default {
  JournalUtils,
  AutoPostingEngine,
  PostingEngine
}
