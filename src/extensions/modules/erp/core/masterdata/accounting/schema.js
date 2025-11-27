// ==========================================
// ACCOUNTING MODULE - SCHEMA DEFINITIONS
// ==========================================
// Chart of Accounts, Fiscal Period, และ Account Configuration

// ==========================================
// ACCOUNT TYPES
// ==========================================
export const ACCOUNT_TYPES = {
  ASSET: 'asset',                      // สินทรัพย์
  LIABILITY: 'liability',              // หนี้สิน
  EQUITY: 'equity',                    // ทุน
  REVENUE: 'revenue',                  // รายได้
  EXPENSE: 'expense',                  // ค่าใช้จ่าย
  COST_OF_GOODS_SOLD: 'cogs'          // ต้นทุนขาย
}

// ==========================================
// ACCOUNT CATEGORIES (Sub-types)
// ==========================================
export const ACCOUNT_CATEGORIES = {
  // Assets
  CURRENT_ASSET: 'current_asset',              // สินทรัพย์หมุนเวียน
  FIXED_ASSET: 'fixed_asset',                  // สินทรัพย์ถาวร
  INTANGIBLE_ASSET: 'intangible_asset',        // สินทรัพย์ไม่มีตัวตน
  OTHER_ASSET: 'other_asset',                  // สินทรัพย์อื่น
  
  // Liabilities
  CURRENT_LIABILITY: 'current_liability',       // หนี้สินหมุนเวียน
  LONG_TERM_LIABILITY: 'long_term_liability',   // หนี้สินระยะยาว
  OTHER_LIABILITY: 'other_liability',           // หนี้สินอื่น
  
  // Equity
  CAPITAL: 'capital',                          // ทุนจดทะเบียน
  RETAINED_EARNINGS: 'retained_earnings',      // กำไรสะสม
  OTHER_EQUITY: 'other_equity',                // ส่วนของเจ้าของอื่น
  
  // Revenue
  SALES_REVENUE: 'sales_revenue',              // รายได้จากการขาย
  SERVICE_REVENUE: 'service_revenue',          // รายได้จากบริการ
  OTHER_REVENUE: 'other_revenue',              // รายได้อื่น
  
  // Expense
  OPERATING_EXPENSE: 'operating_expense',      // ค่าใช้จ่ายในการดำเนินงาน
  ADMINISTRATIVE_EXPENSE: 'administrative_expense', // ค่าใช้จ่ายบริหาร
  SELLING_EXPENSE: 'selling_expense',          // ค่าใช้จ่ายขาย
  FINANCIAL_EXPENSE: 'financial_expense',      // ค่าใช้จ่ายทางการเงิน
  OTHER_EXPENSE: 'other_expense',              // ค่าใช้จ่ายอื่น
  
  // COGS
  DIRECT_COST: 'direct_cost',                  // ต้นทุนโดยตรง
  INDIRECT_COST: 'indirect_cost'               // ต้นทุนทางอ้อม
}

// ==========================================
// BALANCE TYPES (Debit/Credit Nature)
// ==========================================
export const BALANCE_TYPES = {
  DEBIT: 'debit',    // บัญชีฝั่งเดบิต
  CREDIT: 'credit'   // บัญชีฝั่งเครดิต
}

// Default balance types by account type
export const DEFAULT_BALANCE_TYPE = {
  [ACCOUNT_TYPES.ASSET]: BALANCE_TYPES.DEBIT,
  [ACCOUNT_TYPES.LIABILITY]: BALANCE_TYPES.CREDIT,
  [ACCOUNT_TYPES.EQUITY]: BALANCE_TYPES.CREDIT,
  [ACCOUNT_TYPES.REVENUE]: BALANCE_TYPES.CREDIT,
  [ACCOUNT_TYPES.EXPENSE]: BALANCE_TYPES.DEBIT,
  [ACCOUNT_TYPES.COST_OF_GOODS_SOLD]: BALANCE_TYPES.DEBIT
}

// ==========================================
// CHART OF ACCOUNTS STATES
// ==========================================
export const COA_STATES = ['draft', 'active', 'inactive', 'archived']
export const COA_TRANSITIONS = {
  'draft': ['active', 'archived'],
  'active': ['inactive', 'archived'],
  'inactive': ['active', 'archived'],
  'archived': []
}
export const COA_INITIAL_STATE = 'draft'
export const COA_STORAGE_KEY = 'erp_chart_of_accounts'

// ==========================================
// CHART OF ACCOUNTS SCHEMA
// ==========================================
export const COA_SCHEMA_STRUCTURE = {
  // Identification
  account_code: { 
    type: 'string', 
    required: true, 
    unique: true,
    minLength: 4,
    maxLength: 20,
    pattern: /^[0-9]{4,}$/,  // 4+ digit code
    description: 'รหัสบัญชี (4 หลักขึ้นไป เช่น 1110, 2110)'
  },
  
  account_name: { 
    type: 'string', 
    required: true,
    minLength: 2,
    maxLength: 200,
    description: 'ชื่อบัญชี'
  },
  
  account_name_en: {
    type: 'string',
    required: false,
    maxLength: 200,
    description: 'ชื่อบัญชีภาษาอังกฤษ'
  },

  // Classification
  account_type: { 
    type: 'enum', 
    values: Object.values(ACCOUNT_TYPES), 
    required: true,
    description: 'ประเภทบัญชีหลัก'
  },
  
  account_category: { 
    type: 'enum', 
    values: Object.values(ACCOUNT_CATEGORIES),
    required: false,
    description: 'ประเภทบัญชีย่อย'
  },

  // Hierarchy
  parent_account_code: { 
    type: 'string',
    required: false,
    description: 'รหัสบัญชีแม่ (สำหรับ sub-account)'
  },
  
  level: {
    type: 'number',
    default: 1,
    min: 1,
    max: 5,
    description: 'ระดับของบัญชี (1 = บัญชีหลัก, 2-5 = sub-account)'
  },

  // Balance Configuration
  balance_type: { 
    type: 'enum', 
    values: Object.values(BALANCE_TYPES),
    required: true,
    description: 'ประเภทยอดคงเหลือ (Debit/Credit)'
  },

  // Balances
  opening_balance: { 
    type: 'number', 
    default: 0,
    description: 'ยอดยกมา'
  },
  
  current_balance: { 
    type: 'number', 
    default: 0,
    computed: true,
    description: 'ยอดคงเหลือปัจจุบัน'
  },
  
  ytd_debit: {
    type: 'number',
    default: 0,
    description: 'ยอด Debit ตั้งแต่ต้นปี'
  },
  
  ytd_credit: {
    type: 'number',
    default: 0,
    description: 'ยอด Credit ตั้งแต่ต้นปี'
  },

  // Flags
  is_active: { 
    type: 'boolean', 
    default: true,
    description: 'สถานะการใช้งาน'
  },
  
  is_system_account: { 
    type: 'boolean', 
    default: false,
    description: 'บัญชีระบบ (ห้ามลบ/แก้ไข)'
  },
  
  allow_manual_entry: {
    type: 'boolean',
    default: true,
    description: 'อนุญาตให้บันทึกรายการด้วยตนเอง'
  },
  
  allow_sub_account: {
    type: 'boolean',
    default: true,
    description: 'อนุญาตให้สร้าง sub-account'
  },

  // Configuration
  currency: {
    type: 'string',
    default: 'THB',
    description: 'สกุลเงิน'
  },
  
  cost_center_required: {
    type: 'boolean',
    default: false,
    description: 'ต้องระบุศูนย์ต้นทุน'
  },
  
  project_required: {
    type: 'boolean',
    default: false,
    description: 'ต้องระบุโครงการ'
  },

  // Description & Notes
  description: {
    type: 'text',
    required: false,
    maxLength: 500,
    description: 'คำอธิบาย'
  },
  
  notes: {
    type: 'text',
    required: false,
    description: 'หมายเหตุ'
  },

  // Metadata
  state: { 
    type: 'enum', 
    values: COA_STATES, 
    default: COA_INITIAL_STATE 
  },
  created_at: { type: 'datetime', auto: true },
  created_by: { type: 'string' },
  updated_at: { type: 'datetime', auto: true },
  updated_by: { type: 'string' }
}

// ==========================================
// FISCAL PERIOD SCHEMA
// ==========================================
export const FISCAL_PERIOD_STATES = ['open', 'closed', 'locked']
export const FISCAL_PERIOD_TRANSITIONS = {
  'open': ['closed'],
  'closed': ['locked', 'open'],  // Allow reopen
  'locked': []  // Cannot change locked period
}
export const FISCAL_PERIOD_INITIAL_STATE = 'open'
export const FISCAL_PERIOD_STORAGE_KEY = 'erp_fiscal_periods'

export const FISCAL_PERIOD_SCHEMA_STRUCTURE = {
  // Identification
  period_code: { 
    type: 'string', 
    required: true, 
    unique: true,
    pattern: /^FP-\d{4}-\d{2}$/,  // FP-2025-01
    description: 'รหัสงวด (FP-YYYY-MM)'
  },
  
  period_name: { 
    type: 'string', 
    required: true,
    description: 'ชื่องวด เช่น "มกราคม 2568"'
  },

  // Period Definition
  fiscal_year: { 
    type: 'number', 
    required: true,
    min: 2000,
    max: 2100,
    description: 'ปีบัญชี (ค.ศ.)'
  },
  
  period_number: { 
    type: 'number', 
    required: true,
    min: 1,
    max: 12,
    description: 'เดือนที่ของปี (1-12)'
  },
  
  quarter: {
    type: 'number',
    min: 1,
    max: 4,
    computed: true,
    description: 'ไตรมาสที่'
  },

  // Date Range
  start_date: { 
    type: 'date', 
    required: true,
    description: 'วันที่เริ่มต้นงวด'
  },
  
  end_date: { 
    type: 'date', 
    required: true,
    description: 'วันที่สิ้นสุดงวด'
  },

  // Status
  state: { 
    type: 'enum', 
    values: FISCAL_PERIOD_STATES, 
    default: FISCAL_PERIOD_INITIAL_STATE,
    description: 'สถานะงวด'
  },
  
  is_current_period: {
    type: 'boolean',
    default: false,
    description: 'งวดปัจจุบัน'
  },

  // Closing Information
  closed_date: { 
    type: 'datetime',
    required: false,
    description: 'วันที่ปิดงวด'
  },
  
  closed_by: { 
    type: 'string',
    required: false,
    description: 'ผู้ปิดงวด'
  },
  
  locked_date: {
    type: 'datetime',
    required: false,
    description: 'วันที่ล็อกงวด'
  },
  
  locked_by: {
    type: 'string',
    required: false,
    description: 'ผู้ล็อกงวด'
  },

  // Statistics
  total_entries: {
    type: 'number',
    default: 0,
    computed: true,
    description: 'จำนวนรายการบัญชีในงวด'
  },
  
  total_debit: {
    type: 'number',
    default: 0,
    computed: true,
    description: 'ยอดรวม Debit'
  },
  
  total_credit: {
    type: 'number',
    default: 0,
    computed: true,
    description: 'ยอดรวม Credit'
  },

  // Notes
  closing_notes: {
    type: 'text',
    required: false,
    description: 'หมายเหตุการปิดงวด'
  },

  // Metadata
  created_at: { type: 'datetime', auto: true },
  created_by: { type: 'string' },
  updated_at: { type: 'datetime', auto: true },
  updated_by: { type: 'string' }
}

// ==========================================
// ACCOUNT DEFAULTS (Thai Standard)
// ==========================================
export const DEFAULT_ACCOUNTS = {
  // Assets (1xxx)
  '1110': { name: 'เงินสด', name_en: 'Cash', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.CURRENT_ASSET },
  '1120': { name: 'เงินฝากธนาคาร', name_en: 'Bank', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.CURRENT_ASSET },
  '1130': { name: 'ลูกหนี้การค้า', name_en: 'Accounts Receivable', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.CURRENT_ASSET },
  '1140': { name: 'สินค้าคงเหลือ', name_en: 'Inventory', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.CURRENT_ASSET },
  '1150': { name: 'ภาษีซื้อ', name_en: 'VAT Input', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.CURRENT_ASSET },
  '1210': { name: 'ที่ดิน อาคาร และอุปกรณ์', name_en: 'Property, Plant & Equipment', type: ACCOUNT_TYPES.ASSET, category: ACCOUNT_CATEGORIES.FIXED_ASSET },
  
  // Liabilities (2xxx)
  '2110': { name: 'เจ้าหนี้การค้า', name_en: 'Accounts Payable', type: ACCOUNT_TYPES.LIABILITY, category: ACCOUNT_CATEGORIES.CURRENT_LIABILITY },
  '2120': { name: 'ภาษีขาย', name_en: 'VAT Output', type: ACCOUNT_TYPES.LIABILITY, category: ACCOUNT_CATEGORIES.CURRENT_LIABILITY },
  '2130': { name: 'ภาษีเงินได้นิติบุคคลค้างจ่าย', name_en: 'Corporate Tax Payable', type: ACCOUNT_TYPES.LIABILITY, category: ACCOUNT_CATEGORIES.CURRENT_LIABILITY },
  
  // Equity (3xxx)
  '3100': { name: 'ทุนจดทะเบียน', name_en: 'Registered Capital', type: ACCOUNT_TYPES.EQUITY, category: ACCOUNT_CATEGORIES.CAPITAL },
  '3200': { name: 'กำไรสะสม', name_en: 'Retained Earnings', type: ACCOUNT_TYPES.EQUITY, category: ACCOUNT_CATEGORIES.RETAINED_EARNINGS },
  
  // Revenue (4xxx)
  '4100': { name: 'รายได้จากการขาย', name_en: 'Sales Revenue', type: ACCOUNT_TYPES.REVENUE, category: ACCOUNT_CATEGORIES.SALES_REVENUE },
  '4200': { name: 'รายได้จากบริการ', name_en: 'Service Revenue', type: ACCOUNT_TYPES.REVENUE, category: ACCOUNT_CATEGORIES.SERVICE_REVENUE },
  '4900': { name: 'รายได้อื่น', name_en: 'Other Revenue', type: ACCOUNT_TYPES.REVENUE, category: ACCOUNT_CATEGORIES.OTHER_REVENUE },
  
  // COGS (5xxx)
  '5100': { name: 'ต้นทุนขาย', name_en: 'Cost of Goods Sold', type: ACCOUNT_TYPES.COST_OF_GOODS_SOLD, category: ACCOUNT_CATEGORIES.DIRECT_COST },
  
  // Expenses (6xxx)
  '6100': { name: 'ค่าใช้จ่ายในการขาย', name_en: 'Selling Expenses', type: ACCOUNT_TYPES.EXPENSE, category: ACCOUNT_CATEGORIES.SELLING_EXPENSE },
  '6200': { name: 'ค่าใช้จ่ายในการบริหาร', name_en: 'Administrative Expenses', type: ACCOUNT_TYPES.EXPENSE, category: ACCOUNT_CATEGORIES.ADMINISTRATIVE_EXPENSE },
  '6300': { name: 'ค่าใช้จ่ายทางการเงิน', name_en: 'Financial Expenses', type: ACCOUNT_TYPES.EXPENSE, category: ACCOUNT_CATEGORIES.FINANCIAL_EXPENSE }
}

// Export all
export default {
  // Account Types
  ACCOUNT_TYPES,
  ACCOUNT_CATEGORIES,
  BALANCE_TYPES,
  DEFAULT_BALANCE_TYPE,
  
  // Chart of Accounts
  COA_STATES,
  COA_TRANSITIONS,
  COA_INITIAL_STATE,
  COA_STORAGE_KEY,
  COA_SCHEMA_STRUCTURE,
  
  // Fiscal Period
  FISCAL_PERIOD_STATES,
  FISCAL_PERIOD_TRANSITIONS,
  FISCAL_PERIOD_INITIAL_STATE,
  FISCAL_PERIOD_STORAGE_KEY,
  FISCAL_PERIOD_SCHEMA_STRUCTURE,
  
  // Defaults
  DEFAULT_ACCOUNTS
}
