// ==========================================
// Finance/Accounting Module Core
// ==========================================

import { TRANSACTION_TYPES } from '../../../core'

// Re-export TRANSACTION_TYPES for components
export { TRANSACTION_TYPES }

// ==========================================
// Finance Document Types
// ==========================================
export const FINANCE_DOCUMENT_TYPES = {
  PURCHASE_INVOICE: 'purchase_invoice',    // AP - จากโมดูล Purchase
  SALES_INVOICE: 'sales_invoice',          // AR - จากโมดูล Sales  
  CREDIT_NOTE: 'credit_note',              // ปรับลดยอดขาย/คืนสินค้า
  DEBIT_NOTE: 'debit_note',                // ปรับเพิ่มยอดซื้อ/ค่าใช้จ่าย
  RECEIPT: 'receipt',                      // ใบเสร็จรับเงิน
  PAYMENT_VOUCHER: 'payment_voucher',      // ใบสำคัญจ่าย
  TAX_INVOICE: 'tax_invoice',              // ใบกำกับภาษี
  JOURNAL_ENTRY: 'journal_entry',          // รายการบัญชี (Manual)
  EXPENSE: 'expense',                      // ค่าใช้จ่าย
  PETTY_CASH: 'petty_cash'                 // เงินสดย่อย
}

export const FINANCE_DOCUMENT_LABELS = {
  [FINANCE_DOCUMENT_TYPES.PURCHASE_INVOICE]: 'ใบแจ้งหนี้ซื้อ (AP)',
  [FINANCE_DOCUMENT_TYPES.SALES_INVOICE]: 'ใบแจ้งหนี้ขาย (AR)',
  [FINANCE_DOCUMENT_TYPES.CREDIT_NOTE]: 'ใบลดหนี้',
  [FINANCE_DOCUMENT_TYPES.DEBIT_NOTE]: 'ใบเพิ่มหนี้',
  [FINANCE_DOCUMENT_TYPES.RECEIPT]: 'ใบเสร็จรับเงิน',
  [FINANCE_DOCUMENT_TYPES.PAYMENT_VOUCHER]: 'ใบสำคัญจ่าย',
  [FINANCE_DOCUMENT_TYPES.TAX_INVOICE]: 'ใบกำกับภาษี',
  [FINANCE_DOCUMENT_TYPES.JOURNAL_ENTRY]: 'รายการบัญชี',
  [FINANCE_DOCUMENT_TYPES.EXPENSE]: 'ค่าใช้จ่าย',
  [FINANCE_DOCUMENT_TYPES.PETTY_CASH]: 'เงินสดย่อย'
}

// ==========================================
// Finance Document States
// ==========================================
export const FINANCE_STATES = {
  DRAFT: 'draft',                    // ร่างเอกสาร
  VERIFIED: 'verified',              // ตรวจสอบโดยบัญชี
  APPROVED: 'approved',              // ผ่านการอนุมัติ
  POSTED: 'posted',                  // ลงบัญชีจริง (journal entry สร้างแล้ว)
  LOCKED: 'locked',                  // ปิดเอกสาร ห้ามแก้ไข
  CANCELLED: 'cancelled'             // ยกเลิก
}

export const FINANCE_STATE_LABELS = {
  [FINANCE_STATES.DRAFT]: 'ร่างเอกสาร',
  [FINANCE_STATES.VERIFIED]: 'ตรวจสอบแล้ว',
  [FINANCE_STATES.APPROVED]: 'อนุมัติแล้ว',
  [FINANCE_STATES.POSTED]: 'ลงบัญชีแล้ว',
  [FINANCE_STATES.LOCKED]: 'ปิดเอกสาร',
  [FINANCE_STATES.CANCELLED]: 'ยกเลิก'
}

// ==========================================
// State Transitions
// ==========================================
export const FINANCE_STATE_TRANSITIONS = {
  [FINANCE_STATES.DRAFT]: [FINANCE_STATES.VERIFIED, FINANCE_STATES.CANCELLED],
  [FINANCE_STATES.VERIFIED]: [FINANCE_STATES.APPROVED, FINANCE_STATES.DRAFT, FINANCE_STATES.CANCELLED],
  [FINANCE_STATES.APPROVED]: [FINANCE_STATES.POSTED, FINANCE_STATES.CANCELLED],
  [FINANCE_STATES.POSTED]: [FINANCE_STATES.LOCKED],
  [FINANCE_STATES.LOCKED]: [], // ห้ามเปลี่ยน
  [FINANCE_STATES.CANCELLED]: [] // ห้ามเปลี่ยน
}

// ==========================================
// Payment Methods
// ==========================================
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
  CREDIT_CARD: 'credit_card',
  PROMISSORY_NOTE: 'promissory_note',
  OFFSET: 'offset'                   // หักล้างหนี้
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'เงินสด',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'โอนเงิน',
  [PAYMENT_METHODS.CHEQUE]: 'เช็ค',
  [PAYMENT_METHODS.CREDIT_CARD]: 'บัตรเครดิต',
  [PAYMENT_METHODS.PROMISSORY_NOTE]: 'ตั้งเงิน',
  [PAYMENT_METHODS.OFFSET]: 'หักล้างหนี้'
}

// ==========================================
// Payment Status
// ==========================================
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',                  // ยังไม่ชำระ
  PARTIAL: 'partial',                // ชำระบางส่วน
  PAID: 'paid',                      // ชำระครบแล้ว
  OVERDUE: 'overdue',                // เกินกำหนด
  OVERPAID: 'overpaid'               // ชำระเกิน
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.UNPAID]: 'ยังไม่ชำระ',
  [PAYMENT_STATUS.PARTIAL]: 'ชำระบางส่วน',
  [PAYMENT_STATUS.PAID]: 'ชำระครบแล้ว',
  [PAYMENT_STATUS.OVERDUE]: 'เกินกำหนด',
  [PAYMENT_STATUS.OVERPAID]: 'ชำระเกิน'
}

// ==========================================
// Tax Types
// ==========================================
export const TAX_TYPES = {
  VAT: 'vat',                        // ภาษีมูลค่าเพิ่ม
  WITHHOLDING_TAX: 'withholding_tax', // ภาษีหัก ณ ที่จ่าย
  SPECIFIC_TAX: 'specific_tax',       // ภาษีเฉพาะ
  EXEMPT: 'exempt'                    // ยกเว้นภาษี
}

export const TAX_TYPE_LABELS = {
  [TAX_TYPES.VAT]: 'ภาษีมูลค่าเพิ่ม (VAT)',
  [TAX_TYPES.WITHHOLDING_TAX]: 'ภาษีหัก ณ ที่จ่าย',
  [TAX_TYPES.SPECIFIC_TAX]: 'ภาษีเฉพาะ',
  [TAX_TYPES.EXEMPT]: 'ยกเว้นภาษี'
}

// ==========================================
// Account Types (Basic GL)
// ==========================================
export const ACCOUNT_TYPES = {
  ASSET: 'asset',                    // สินทรัพย์
  LIABILITY: 'liability',            // หนี้สิน
  EQUITY: 'equity',                  // ส่วนของเจ้าของ
  REVENUE: 'revenue',                // รายได้
  EXPENSE: 'expense',                // ค่าใช้จ่าย
  COST_OF_GOODS: 'cost_of_goods'     // ต้นทุนขาย
}

export const ACCOUNT_TYPE_LABELS = {
  [ACCOUNT_TYPES.ASSET]: 'สินทรัพย์',
  [ACCOUNT_TYPES.LIABILITY]: 'หนี้สิน',
  [ACCOUNT_TYPES.EQUITY]: 'ส่วนของเจ้าของ',
  [ACCOUNT_TYPES.REVENUE]: 'รายได้',
  [ACCOUNT_TYPES.EXPENSE]: 'ค่าใช้จ่าย',
  [ACCOUNT_TYPES.COST_OF_GOODS]: 'ต้นทุนขาย'
}

// ==========================================
// Default Finance Document Structure
// ==========================================
export const DEFAULT_FINANCE_DOCUMENT = {
  // Basic Info
  id: null,
  documentNumber: '',
  documentType: FINANCE_DOCUMENT_TYPES.SALES_INVOICE,
  state: FINANCE_STATES.DRAFT,
  
  // Reference Transaction
  sourceModule: '',                  // purchase, sales, delivery, manual
  sourceTransactionId: '',           // ID อ้างอิงจากโมดูลต้นทาง
  sourceDocumentNumber: '',          // เลขที่เอกสารต้นทาง
  
  // Party Information
  partyId: '',                       // ลูกค้า/ผู้ขาย ID
  partyName: '',
  partyAddress: {},
  partyTaxId: '',
  
  // Financial Data
  subtotal: 0,                       // ยอดก่อนภาษี
  taxAmount: 0,                      // ยอดภาษี
  discountAmount: 0,                 // ส่วนลด
  totalAmount: 0,                    // ยอดรวม
  paidAmount: 0,                     // ยอดที่ชำระแล้ว
  balanceAmount: 0,                  // ยอดคงเหลือ
  
  // Payment Info
  paymentStatus: PAYMENT_STATUS.UNPAID,
  paymentMethod: PAYMENT_METHODS.CASH,
  paymentTerms: 'immediate',         // เงื่อนไขการชำระเงิน
  dueDate: null,                     // วันครบกำหนด
  
  // Tax Information
  taxType: TAX_TYPES.VAT,
  taxRate: 0.07,                     // 7%
  taxInclusive: false,               // รวมภาษีหรือไม่
  
  // Line Items
  items: [],                         // รายการสินค้า/บริการ
  
  // Journal Entry (GL)
  journalEntries: [],                // รายการบัญชีคู่
  
  // Workflow
  workflow: {
    createdBy: '',
    createdAt: null,
    verifiedBy: '',
    verifiedAt: null,
    approvedBy: '',
    approvedAt: null,
    postedBy: '',
    postedAt: null,
    lockedBy: '',
    lockedAt: null
  },
  
  // Audit Trail
  stateHistory: [],
  
  // Snapshots (Immutable)
  originalSnapshot: null,            // ข้อมูลต้นฉบับเมื่อสร้าง
  approvedSnapshot: null,            // ข้อมูลเมื่ออนุมัติ
  postedSnapshot: null,              // ข้อมูลเมื่อลงบัญชี
  
  // Notes & Attachments
  notes: '',
  attachments: [],
  
  // System
  version: 1,
  isImmutable: false,                // เป็น true หลังจาก posted
  createdAt: null,
  updatedAt: null
}

// ==========================================
// Default Line Item Structure
// ==========================================
export const DEFAULT_FINANCE_LINE_ITEM = {
  id: null,
  description: '',                   // รายละเอียดสินค้า/บริการ
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0,                     // quantity × unitPrice
  discountRate: 0,                  // % ส่วนลด
  discountAmount: 0,                // ยอดส่วนลด
  taxRate: 0.07,                    // อัตราภาษี
  taxAmount: 0,                     // ยอดภาษี
  netAmount: 0,                     // ยอดสุทธิ
  
  // GL Mapping
  accountCode: '',                  // รหัสบัญชี
  accountType: ACCOUNT_TYPES.REVENUE,
  
  // Reference
  productId: '',                    // อ้างอิงสินค้า (ถ้ามี)
  projectId: '',                    // อ้างอิงโปรเจค (ถ้ามี)
  costCenter: ''                    // ศูนย์ต้นทุน (ถ้ามี)
}

// ==========================================
// Journal Entry Structure
// ==========================================
export const DEFAULT_JOURNAL_ENTRY = {
  id: null,
  entryNumber: '',
  date: null,
  description: '',
  reference: '',                    // อ้างอิงเอกสารต้นทาง
  
  // Debits & Credits
  debits: [],                       // รายการเดบิต
  credits: [],                      // รายการเครดิต
  totalDebit: 0,
  totalCredit: 0,
  
  // Status
  posted: false,
  postedBy: '',
  postedAt: null,
  
  // Period
  period: '',                       // งวดบัญชี (YYYY-MM)
  fiscalYear: '',                   // ปีบัญชี
  
  createdAt: null,
  updatedAt: null
}

// ==========================================
// Finance Module Configuration
// ==========================================
export const FINANCE_MODULE_CONFIG = {
  name: 'Finance',
  version: '1.0.0',
  description: 'Finance & Accounting Management System',
  
  // Integration Settings
  sourceModules: ['purchase', 'sales', 'delivery', 'inventory'],
  
  // Auto-generation Settings
  autoCreateInvoices: true,          // สร้าง Invoice อัตโนมัติ
  autoGenerateJournalEntries: true,  // สร้าง Journal Entry อัตโนมัติ
  
  // Numbering
  documentNumberFormats: {
    [FINANCE_DOCUMENT_TYPES.SALES_INVOICE]: 'SI-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.PURCHASE_INVOICE]: 'PI-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.RECEIPT]: 'RC-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.PAYMENT_VOUCHER]: 'PV-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.CREDIT_NOTE]: 'CN-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.DEBIT_NOTE]: 'DN-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.TAX_INVOICE]: 'TI-{YYYY}{MM}-{####}',
    [FINANCE_DOCUMENT_TYPES.JOURNAL_ENTRY]: 'JE-{YYYY}{MM}-{####}'
  },
  
  // Tax Settings
  defaultTaxRate: 0.07,              // 7% VAT
  defaultWithholdingTaxRate: 0.03,   // 3% WHT
  
  // Payment Terms
  defaultPaymentTerms: {
    immediate: { days: 0, description: 'ชำระทันที' },
    net7: { days: 7, description: 'เครดิต 7 วัน' },
    net15: { days: 15, description: 'เครดิต 15 วัน' },
    net30: { days: 30, description: 'เครดิต 30 วัน' },
    net60: { days: 60, description: 'เครดิต 60 วัน' },
    net90: { days: 90, description: 'เครดิต 90 วัน' }
  },
  
  // Workflow Settings
  requireVerification: true,         // ต้องตรวจสอบก่อนอนุมัติ
  requireApproval: true,             // ต้องอนุมัติก่อนลงบัญชี
  autoLockAfterPosting: false,       // ล็อกอัตโนมัติหลังลงบัญชี
  
  // Permissions
  permissions: {
    create: 'finance.create',
    view: 'finance.view',
    edit: 'finance.edit',
    verify: 'finance.verify',
    approve: 'finance.approve',
    post: 'finance.post',
    lock: 'finance.lock',
    delete: 'finance.delete',
    viewReports: 'finance.reports'
  }
}

// ==========================================
// Integration with ERP Core
// ==========================================
export const registerFinanceModule = (transactionEngine) => {
  // Register Finance transaction type
  if (!transactionEngine.hasTransactionType(TRANSACTION_TYPES.FINANCE)) {
    transactionEngine.registerTransactionType(TRANSACTION_TYPES.FINANCE, {
      name: 'Finance Transaction',
      description: 'Financial documents and journal entries',
      states: FINANCE_STATES,
      stateTransitions: FINANCE_STATE_TRANSITIONS,
      defaultData: DEFAULT_FINANCE_DOCUMENT,
      immutableAfterState: FINANCE_STATES.POSTED,
      
      // Event Handlers
      onStateChange: async (transaction, fromState, toState, context) => {
        console.log(`Finance document ${transaction.id} changed from ${fromState} to ${toState}`)
        
        // Create snapshots
        if (toState === FINANCE_STATES.APPROVED && !transaction.data.approvedSnapshot) {
          transaction.data.approvedSnapshot = JSON.parse(JSON.stringify(transaction.data))
        }
        
        if (toState === FINANCE_STATES.POSTED && !transaction.data.postedSnapshot) {
          transaction.data.postedSnapshot = JSON.parse(JSON.stringify(transaction.data))
          transaction.data.isImmutable = true
          
          // Auto-generate journal entries
          if (FINANCE_MODULE_CONFIG.autoGenerateJournalEntries) {
            await generateJournalEntries(transaction)
          }
        }
        
        if (toState === FINANCE_STATES.LOCKED) {
          transaction.data.workflow.lockedBy = context.user || 'System'
          transaction.data.workflow.lockedAt = new Date().toISOString()
        }
      },
      
      onBeforeStateChange: async (transaction, fromState, toState) => {
        // Validation before state change
        if (toState === FINANCE_STATES.POSTED) {
          const validation = validateFinanceDocument(transaction.data)
          if (!validation.isValid) {
            throw new Error(`Cannot post document: ${validation.errors.join(', ')}`)
          }
        }
        
        return true
      }
    })
  }
  
  return FINANCE_MODULE_CONFIG
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Generate document number based on format
 */
export const generateDocumentNumber = (documentType, sequence = 1) => {
  const format = FINANCE_MODULE_CONFIG.documentNumberFormats[documentType] || 'DOC-{YYYY}{MM}-{####}'
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const seq = String(sequence).padStart(4, '0')
  
  return format
    .replace('{YYYY}', year)
    .replace('{MM}', month)
    .replace('{DD}', day)
    .replace('{####}', seq)
}

/**
 * Calculate financial amounts
 */
export const calculateFinancialAmounts = (items, taxRate = 0.07, taxInclusive = false) => {
  let subtotal = 0
  let taxAmount = 0
  let totalAmount = 0
  
  items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice
    const discountAmount = lineTotal * (item.discountRate || 0) / 100
    const netLineTotal = lineTotal - discountAmount
    
    if (taxInclusive) {
      // ราคารวมภาษีแล้ว
      const taxableAmount = netLineTotal / (1 + taxRate)
      subtotal += taxableAmount
      taxAmount += netLineTotal - taxableAmount
    } else {
      // ราคายังไม่รวมภาษี
      subtotal += netLineTotal
      taxAmount += netLineTotal * taxRate
    }
    
    // Update item calculations
    item.lineTotal = lineTotal
    item.discountAmount = discountAmount
    item.taxAmount = netLineTotal * taxRate
    item.netAmount = taxInclusive ? netLineTotal : netLineTotal + (netLineTotal * taxRate)
  })
  
  totalAmount = subtotal + taxAmount
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  }
}

/**
 * Validate finance document
 */
export const validateFinanceDocument = (document) => {
  const errors = []
  
  if (!document.documentNumber) {
    errors.push('เลขที่เอกสารไม่ได้ระบุ')
  }
  
  if (!document.partyId || !document.partyName) {
    errors.push('ข้อมูลคู่ค้าไม่ครบถ้วน')
  }
  
  if (!document.items || document.items.length === 0) {
    errors.push('ไม่มีรายการสินค้า/บริการ')
  }
  
  if (document.totalAmount <= 0) {
    errors.push('ยอดรวมต้องมากกว่า 0')
  }
  
  // Validate tax calculations
  const calculated = calculateFinancialAmounts(document.items, document.taxRate, document.taxInclusive)
  if (Math.abs(calculated.totalAmount - document.totalAmount) > 0.01) {
    errors.push('การคำนวณยอดรวมไม่ถูกต้อง')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate journal entries from finance document
 */
export const generateJournalEntries = async (transaction) => {
  const document = transaction.data
  const entries = []
  
  // Basic double-entry logic based on document type
  switch (document.documentType) {
    case FINANCE_DOCUMENT_TYPES.SALES_INVOICE:
      // DR: Accounts Receivable, CR: Sales Revenue, CR: Tax Payable
      entries.push({
        account: '1200', // Accounts Receivable
        accountType: ACCOUNT_TYPES.ASSET,
        debit: document.totalAmount,
        credit: 0,
        description: `Sales to ${document.partyName}`
      })
      entries.push({
        account: '4100', // Sales Revenue
        accountType: ACCOUNT_TYPES.REVENUE,
        debit: 0,
        credit: document.subtotal,
        description: `Sales Revenue from ${document.partyName}`
      })
      if (document.taxAmount > 0) {
        entries.push({
          account: '2110', // VAT Payable
          accountType: ACCOUNT_TYPES.LIABILITY,
          debit: 0,
          credit: document.taxAmount,
          description: `VAT on sales to ${document.partyName}`
        })
      }
      break
      
    case FINANCE_DOCUMENT_TYPES.PURCHASE_INVOICE:
      // DR: Purchases/Expense, DR: Tax Receivable, CR: Accounts Payable
      entries.push({
        account: '5100', // Purchases
        accountType: ACCOUNT_TYPES.EXPENSE,
        debit: document.subtotal,
        credit: 0,
        description: `Purchase from ${document.partyName}`
      })
      if (document.taxAmount > 0) {
        entries.push({
          account: '1140', // VAT Receivable
          accountType: ACCOUNT_TYPES.ASSET,
          debit: document.taxAmount,
          credit: 0,
          description: `VAT on purchase from ${document.partyName}`
        })
      }
      entries.push({
        account: '2100', // Accounts Payable
        accountType: ACCOUNT_TYPES.LIABILITY,
        debit: 0,
        credit: document.totalAmount,
        description: `Purchase from ${document.partyName}`
      })
      break
      
    case FINANCE_DOCUMENT_TYPES.RECEIPT:
      // DR: Cash/Bank, CR: Accounts Receivable
      entries.push({
        account: document.paymentMethod === PAYMENT_METHODS.CASH ? '1100' : '1110',
        accountType: ACCOUNT_TYPES.ASSET,
        debit: document.totalAmount,
        credit: 0,
        description: `Receipt from ${document.partyName}`
      })
      entries.push({
        account: '1200', // Accounts Receivable
        accountType: ACCOUNT_TYPES.ASSET,
        debit: 0,
        credit: document.totalAmount,
        description: `Receipt from ${document.partyName}`
      })
      break
      
    case FINANCE_DOCUMENT_TYPES.PAYMENT_VOUCHER:
      // DR: Accounts Payable, CR: Cash/Bank
      entries.push({
        account: '2100', // Accounts Payable
        accountType: ACCOUNT_TYPES.LIABILITY,
        debit: document.totalAmount,
        credit: 0,
        description: `Payment to ${document.partyName}`
      })
      entries.push({
        account: document.paymentMethod === PAYMENT_METHODS.CASH ? '1100' : '1110',
        accountType: ACCOUNT_TYPES.ASSET,
        debit: 0,
        credit: document.totalAmount,
        description: `Payment to ${document.partyName}`
      })
      break
  }
  
  // Create journal entry
  if (entries.length > 0) {
    const journalEntry = {
      ...DEFAULT_JOURNAL_ENTRY,
      id: `JE-${Date.now()}`,
      entryNumber: generateDocumentNumber(FINANCE_DOCUMENT_TYPES.JOURNAL_ENTRY),
      date: new Date().toISOString(),
      description: `Auto-generated from ${document.documentType} ${document.documentNumber}`,
      reference: document.documentNumber,
      debits: entries.filter(e => e.debit > 0),
      credits: entries.filter(e => e.credit > 0),
      totalDebit: entries.reduce((sum, e) => sum + e.debit, 0),
      totalCredit: entries.reduce((sum, e) => sum + e.credit, 0),
      posted: true,
      postedBy: 'System',
      postedAt: new Date().toISOString()
    }
    
    document.journalEntries.push(journalEntry)
  }
  
  return entries
}

/**
 * Create finance document from source transaction
 */
export const createFinanceDocumentFromTransaction = (sourceTransaction, documentType) => {
  const financeDocument = {
    ...DEFAULT_FINANCE_DOCUMENT,
    id: `FIN-${Date.now()}`,
    documentNumber: generateDocumentNumber(documentType),
    documentType,
    sourceModule: sourceTransaction.type.toLowerCase().replace('_', ''),
    sourceTransactionId: sourceTransaction.id,
    sourceDocumentNumber: sourceTransaction.data.orderNumber || sourceTransaction.data.documentNumber,
    
    // Copy party information
    partyId: sourceTransaction.data.customerId || sourceTransaction.data.supplierId,
    partyName: sourceTransaction.data.customerName || sourceTransaction.data.supplierName,
    partyAddress: sourceTransaction.data.customerAddress || sourceTransaction.data.supplierAddress || {},
    partyTaxId: sourceTransaction.data.customerTaxId || sourceTransaction.data.supplierTaxId,
    
    // Copy items
    items: (sourceTransaction.data.items || []).map(item => ({
      ...DEFAULT_FINANCE_LINE_ITEM,
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: item.productName || item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      productId: item.productId
    })),
    
    // Set workflow
    workflow: {
      ...DEFAULT_FINANCE_DOCUMENT.workflow,
      createdBy: 'System',
      createdAt: new Date().toISOString()
    },
    
    // Create original snapshot
    originalSnapshot: null, // Will be set after calculation
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Calculate amounts
  const amounts = calculateFinancialAmounts(financeDocument.items, financeDocument.taxRate, financeDocument.taxInclusive)
  financeDocument.subtotal = amounts.subtotal
  financeDocument.taxAmount = amounts.taxAmount
  financeDocument.totalAmount = amounts.totalAmount
  financeDocument.balanceAmount = amounts.totalAmount
  
  // Create original snapshot
  financeDocument.originalSnapshot = JSON.parse(JSON.stringify(financeDocument))
  
  return financeDocument
}

// ==========================================
// Export Components
// ==========================================
export { default as FinanceManager } from '../shared/FinanceManager.vue'

// ==========================================
// Export Module Configuration
// ==========================================
export default {
  FINANCE_DOCUMENT_TYPES,
  FINANCE_DOCUMENT_LABELS,
  FINANCE_STATES,
  FINANCE_STATE_LABELS,
  FINANCE_STATE_TRANSITIONS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  TAX_TYPES,
  TAX_TYPE_LABELS,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  DEFAULT_FINANCE_DOCUMENT,
  DEFAULT_FINANCE_LINE_ITEM,
  DEFAULT_JOURNAL_ENTRY,
  FINANCE_MODULE_CONFIG,
  registerFinanceModule,
  generateDocumentNumber,
  calculateFinancialAmounts,
  validateFinanceDocument,
  generateJournalEntries,
  createFinanceDocumentFromTransaction
}