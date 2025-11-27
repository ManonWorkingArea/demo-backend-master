// ==========================================
// JOURNAL MODULE - SCHEMA DEFINITIONS
// ==========================================
// Journal Entry Management

// ==========================================
// JOURNAL TYPES
// ==========================================
export const JOURNAL_TYPES = {
  GENERAL: 'general',              // รายการทั่วไป
  SALES: 'sales',                  // จากการขาย (auto from Sales Order)
  PURCHASE: 'purchase',            // จากการซื้อ (auto from Purchase Order)
  PAYMENT: 'payment',              // จากการชำระเงิน (auto from Payment)
  RECEIPT: 'receipt',              // จากการรับชำระ (auto from Receipt)
  INVENTORY: 'inventory',          // จากสินค้าคงคลัง (auto from Stock Movement)
  ADJUSTMENT: 'adjustment',        // รายการปรับปรุง
  CLOSING: 'closing',              // รายการปิดบัญชี
  OPENING: 'opening'               // รายการยกมา
}

// ==========================================
// JOURNAL ENTRY STATES
// ==========================================
export const JOURNAL_STATES = ['draft', 'posted', 'cancelled', 'reversed']
export const JOURNAL_TRANSITIONS = {
  'draft': ['posted', 'cancelled'],
  'posted': ['reversed'],
  'cancelled': [],
  'reversed': []
}
export const JOURNAL_INITIAL_STATE = 'draft'
export const JOURNAL_STORAGE_KEY = 'erp_journal_entries'

// ==========================================
// POSTING STATUS
// ==========================================
export const POSTING_STATUS = {
  DRAFT: 'draft',           // ยังไม่ post
  POSTED: 'posted',         // post แล้ว
  PARTIAL: 'partial',       // post บางส่วน
  CANCELLED: 'cancelled',   // ยกเลิก
  REVERSED: 'reversed'      // กลับรายการ
}

// ==========================================
// REFERENCE TYPES (For auto-posting)
// ==========================================
export const REFERENCE_TYPES = {
  SALES_ORDER: 'sales_order',
  SALES_INVOICE: 'sales_invoice',
  PURCHASE_ORDER: 'purchase_order',
  PURCHASE_INVOICE: 'purchase_invoice',
  PAYMENT: 'payment',
  RECEIPT: 'receipt',
  INVENTORY_ADJUSTMENT: 'inventory_adjustment',
  STOCK_TRANSFER: 'stock_transfer',
  DELIVERY_ORDER: 'delivery_order',
  GOODS_RECEIPT: 'goods_receipt',
  CREDIT_NOTE: 'credit_note',
  DEBIT_NOTE: 'debit_note',
  MANUAL: 'manual'
}

// ==========================================
// JOURNAL ENTRY SCHEMA
// ==========================================
export const JOURNAL_ENTRY_SCHEMA_STRUCTURE = {
  // Identification
  entry_number: { 
    type: 'string', 
    required: true, 
    unique: true,
    pattern: /^JE-\d{8}-\d{4}$/,  // JE-YYYYMMDD-0001
    description: 'เลขที่รายการบัญชี'
  },
  
  entry_date: { 
    type: 'date', 
    required: true,
    description: 'วันที่บันทึกรายการ'
  },

  // Journal Type & Reference
  journal_type: { 
    type: 'enum', 
    values: Object.values(JOURNAL_TYPES),
    required: true,
    description: 'ประเภทรายการบัญชี'
  },
  
  reference_type: { 
    type: 'enum',
    values: Object.values(REFERENCE_TYPES),
    required: false,
    description: 'ประเภทเอกสารอ้างอิง'
  },
  
  reference_id: { 
    type: 'string',
    required: false,
    description: 'ID ของเอกสารอ้างอิง'
  },
  
  reference_number: {
    type: 'string',
    required: false,
    description: 'เลขที่เอกสารอ้างอิง'
  },

  // Description
  description: { 
    type: 'string', 
    required: true,
    minLength: 5,
    maxLength: 500,
    description: 'รายละเอียดรายการบัญชี'
  },
  
  notes: {
    type: 'text',
    required: false,
    description: 'หมายเหตุ'
  },

  // Period
  fiscal_period_id: { 
    type: 'string', 
    required: true,
    description: 'ID ของงวดบัญชี'
  },
  
  fiscal_period_code: {
    type: 'string',
    required: true,
    description: 'รหัสงวดบัญชี (FP-2025-01)'
  },

  // State & Status
  state: { 
    type: 'enum', 
    values: JOURNAL_STATES, 
    default: JOURNAL_INITIAL_STATE,
    description: 'สถานะรายการ'
  },
  
  posting_status: {
    type: 'enum',
    values: Object.values(POSTING_STATUS),
    default: POSTING_STATUS.DRAFT,
    description: 'สถานะการ post'
  },

  // Posting Information
  posted_date: { 
    type: 'datetime',
    required: false,
    description: 'วันเวลาที่ post'
  },
  
  posted_by: { 
    type: 'string',
    required: false,
    description: 'ผู้ post รายการ'
  },

  // Reversal Information
  reversed_date: {
    type: 'datetime',
    required: false,
    description: 'วันเวลาที่กลับรายการ'
  },
  
  reversed_by: {
    type: 'string',
    required: false,
    description: 'ผู้กลับรายการ'
  },
  
  reversed_entry_id: {
    type: 'string',
    required: false,
    description: 'ID ของรายการที่กลับ'
  },
  
  reversal_reason: {
    type: 'text',
    required: false,
    description: 'เหตุผลในการกลับรายการ'
  },

  // Journal Lines (Debit/Credit)
  lines: {
    type: 'array',
    required: true,
    minItems: 2,
    items: {
      type: 'object',
      properties: {
        line_number: { 
          type: 'number', 
          required: true,
          description: 'ลำดับรายการ'
        },
        
        account_code: { 
          type: 'string', 
          required: true,
          description: 'รหัสบัญชี'
        },
        
        account_name: {
          type: 'string',
          required: true,
          description: 'ชื่อบัญชี'
        },
        
        description: { 
          type: 'string',
          maxLength: 200,
          description: 'รายละเอียด'
        },
        
        debit_amount: { 
          type: 'number', 
          default: 0,
          min: 0,
          description: 'จำนวนเงินฝั่งเดบิต'
        },
        
        credit_amount: { 
          type: 'number', 
          default: 0,
          min: 0,
          description: 'จำนวนเงินฝั่งเครดิต'
        },
        
        // Optional dimensions
        cost_center: { 
          type: 'string',
          required: false,
          description: 'ศูนย์ต้นทุน'
        },
        
        department: {
          type: 'string',
          required: false,
          description: 'แผนก'
        },
        
        project_code: { 
          type: 'string',
          required: false,
          description: 'รหัสโครงการ'
        },
        
        employee_id: {
          type: 'string',
          required: false,
          description: 'รหัสพนักงาน'
        },
        
        customer_id: {
          type: 'string',
          required: false,
          description: 'รหัสลูกค้า'
        },
        
        supplier_id: {
          type: 'string',
          required: false,
          description: 'รหัสผู้ขาย'
        },
        
        // Tax information
        tax_type: {
          type: 'string',
          required: false,
          description: 'ประเภทภาษี'
        },
        
        tax_rate: {
          type: 'number',
          required: false,
          description: 'อัตราภาษี'
        },
        
        tax_amount: {
          type: 'number',
          default: 0,
          description: 'จำนวนภาษี'
        }
      }
    },
    description: 'รายการบัญชี (Debit/Credit)'
  },

  // Totals (must be balanced)
  total_debit: { 
    type: 'number', 
    required: true,
    computed: true,
    description: 'ยอดรวม Debit'
  },
  
  total_credit: { 
    type: 'number', 
    required: true,
    computed: true,
    description: 'ยอดรวม Credit'
  },
  
  balance_difference: {
    type: 'number',
    computed: true,
    description: 'ผลต่าง (ต้องเป็น 0)'
  },

  // Attachments
  attachments: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        file_name: { type: 'string' },
        file_url: { type: 'string' },
        file_type: { type: 'string' },
        file_size: { type: 'number' },
        uploaded_at: { type: 'datetime' }
      }
    },
    description: 'ไฟล์แนบ'
  },

  // Flags
  is_auto_generated: {
    type: 'boolean',
    default: false,
    description: 'สร้างอัตโนมัติจากระบบ'
  },
  
  is_recurring: {
    type: 'boolean',
    default: false,
    description: 'รายการซ้ำ (Recurring)'
  },
  
  recurring_frequency: {
    type: 'enum',
    values: ['monthly', 'quarterly', 'yearly'],
    required: false,
    description: 'ความถี่การเกิดซ้ำ'
  },

  // Approval workflow
  requires_approval: {
    type: 'boolean',
    default: false,
    description: 'ต้องอนุมัติก่อน post'
  },
  
  approved_by: {
    type: 'string',
    required: false,
    description: 'ผู้อนุมัติ'
  },
  
  approved_date: {
    type: 'datetime',
    required: false,
    description: 'วันที่อนุมัติ'
  },

  // Metadata
  created_at: { type: 'datetime', auto: true },
  created_by: { type: 'string' },
  updated_at: { type: 'datetime', auto: true },
  updated_by: { type: 'string' }
}

// ==========================================
// AUTO-POSTING RULES
// ==========================================
export const AUTO_POSTING_RULES = {
  // Sales Order -> Journal Entry
  SALES_ORDER: {
    enabled: true,
    accounts: {
      debit: '1130',   // Accounts Receivable
      credit_revenue: '4100',  // Sales Revenue
      credit_vat: '2120'      // VAT Output
    },
    trigger: 'on_approve'
  },
  
  // Purchase Order -> Journal Entry
  PURCHASE_ORDER: {
    enabled: true,
    accounts: {
      debit_inventory: '1140',  // Inventory
      debit_vat: '1150',        // VAT Input
      credit: '2110'            // Accounts Payable
    },
    trigger: 'on_approve'
  },
  
  // Payment -> Journal Entry
  PAYMENT: {
    enabled: true,
    accounts: {
      debit_ap: '2110',  // Accounts Payable
      credit_bank: '1120'  // Bank
    },
    trigger: 'on_complete'
  },
  
  // Receipt -> Journal Entry
  RECEIPT: {
    enabled: true,
    accounts: {
      debit_bank: '1120',  // Bank
      credit_ar: '1130'    // Accounts Receivable
    },
    trigger: 'on_complete'
  }
}

// ==========================================
// VALIDATION RULES
// ==========================================
export const JOURNAL_VALIDATION_RULES = {
  // Entry must be balanced
  balance_check: {
    rule: (entry) => {
      const diff = Math.abs(entry.total_debit - entry.total_credit)
      return diff < 0.01 // Allow 0.01 tolerance for rounding
    },
    message: 'รายการบัญชีไม่สมดุล Debit และ Credit ต้องเท่ากัน'
  },
  
  // Must have at least 2 lines
  min_lines: {
    rule: (entry) => entry.lines && entry.lines.length >= 2,
    message: 'ต้องมีรายการบัญชีอย่างน้อย 2 รายการ'
  },
  
  // Each line must have either debit or credit (not both, not none)
  line_amount_check: {
    rule: (entry) => {
      return entry.lines.every(line => {
        const hasDebit = line.debit_amount > 0
        const hasCredit = line.credit_amount > 0
        return (hasDebit && !hasCredit) || (!hasDebit && hasCredit)
      })
    },
    message: 'แต่ละรายการต้องมี Debit หรือ Credit อย่างใดอย่างหนึ่งเท่านั้น'
  },
  
  // Period must be open
  period_check: {
    rule: (entry, period) => {
      return period && period.state === 'open'
    },
    message: 'ไม่สามารถบันทึกรายการในงวดที่ปิดหรือล็อกแล้ว'
  },
  
  // Account must exist and be active
  account_check: {
    rule: (entry, chartOfAccounts) => {
      return entry.lines.every(line => {
        const account = chartOfAccounts.find(a => a.account_code === line.account_code)
        return account && account.is_active
      })
    },
    message: 'บัญชีไม่ถูกต้องหรือไม่ได้เปิดใช้งาน'
  }
}

// Export all
export default {
  JOURNAL_TYPES,
  JOURNAL_STATES,
  JOURNAL_TRANSITIONS,
  JOURNAL_INITIAL_STATE,
  JOURNAL_STORAGE_KEY,
  POSTING_STATUS,
  REFERENCE_TYPES,
  JOURNAL_ENTRY_SCHEMA_STRUCTURE,
  AUTO_POSTING_RULES,
  JOURNAL_VALIDATION_RULES
}
