// ==========================================
// ACCOUNTING MODULE - PLUGIN CONFIGURATION
// ==========================================

// Import masterdata
import { 
  ACCOUNT_TYPES, 
  ACCOUNT_CATEGORIES,
  BALANCE_TYPES,
  AccountingUtils,
  FiscalPeriodUtils,
  BalanceCalculator
} from '../../../core/masterdata/accounting/index.js'

import {
  JOURNAL_TYPES,
  POSTING_STATUS,
  JournalUtils,
  AutoPostingEngine,
  PostingEngine
} from '../../../core/masterdata/journal/index.js'

// ==========================================
// MODULE CONSTANTS
// ==========================================
export const ACCOUNTING_CONSTANTS = {
  MODULE_NAME: 'accounting',
  MODULE_VERSION: '1.0.0',
  MODULE_TITLE: 'Accounting & Finance',
  
  // Re-export from masterdata
  ACCOUNT_TYPES,
  ACCOUNT_CATEGORIES,
  BALANCE_TYPES,
  JOURNAL_TYPES,
  POSTING_STATUS
}

// ==========================================
// DEFAULT CONFIGURATION
// ==========================================
export const DEFAULT_CONFIG = {
  // Company Settings
  company: {
    tax_id: '',
    fiscal_year_start: '01-01',  // January 1st
    fiscal_year_end: '12-31',    // December 31st
    accounting_method: 'accrual', // 'accrual' or 'cash'
    base_currency: 'THB',
    decimal_places: 2,
    use_thai_accounting_standard: true
  },
  
  // Default Accounts Mapping
  defaultAccounts: {
    // Assets
    cash_account: '1110',
    bank_account: '1120',
    accounts_receivable: '1130',
    inventory: '1140',
    vat_input: '1150',
    
    // Liabilities
    accounts_payable: '2110',
    vat_output: '2120',
    corporate_tax_payable: '2130',
    
    // Equity
    capital: '3100',
    retained_earnings: '3200',
    
    // Revenue
    sales_revenue: '4100',
    service_revenue: '4200',
    other_revenue: '4900',
    
    // COGS & Expenses
    cogs: '5100',
    selling_expense: '6100',
    administrative_expense: '6200',
    financial_expense: '6300'
  },
  
  // VAT Settings
  vat: {
    default_rate: 7,
    calculation_method: 'add',  // 'add' or 'included'
    rounding_method: 'round'    // 'round', 'up', or 'down'
  },
  
  // Auto-posting Settings
  autoPosting: {
    enabled: true,
    postOnApprove: true,
    requireReview: false
  },
  
  // Feature Flags
  features: {
    enableMultiCurrency: false,
    enableCostCenter: true,
    enableProject: true,
    enableDepartment: true,
    enableBudget: false,
    enableRecurringEntries: true,
    enableAutoReconciliation: false
  },
  
  // UI Settings
  ui: {
    defaultView: 'grid',
    itemsPerPage: 20,
    showAccountBalance: true,
    highlightUnbalanced: true
  }
}

// ==========================================
// VALIDATION RULES
// ==========================================
export const VALIDATION_RULES = {
  chart_of_accounts: {
    account_code: {
      required: true,
      minLength: 4,
      maxLength: 20,
      pattern: /^[0-9]+$/,
      message: 'รหัสบัญชีต้องเป็นตัวเลข 4 หลักขึ้นไป'
    },
    account_name: {
      required: true,
      minLength: 2,
      maxLength: 200,
      message: 'ชื่อบัญชีต้องมีอย่างน้อย 2 ตัวอักษร'
    },
    account_type: {
      required: true,
      enum: Object.values(ACCOUNT_TYPES),
      message: 'ต้องระบุประเภทบัญชี'
    }
  },
  
  journal_entry: {
    description: {
      required: true,
      minLength: 5,
      maxLength: 500,
      message: 'รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร'
    },
    lines: {
      required: true,
      minItems: 2,
      message: 'ต้องมีรายการบัญชีอย่างน้อย 2 รายการ'
    },
    balance: {
      rule: (entry) => Math.abs(entry.total_debit - entry.total_credit) < 0.01,
      message: 'รายการบัญชีไม่สมดุล Debit และ Credit ต้องเท่ากัน'
    }
  },
  
  fiscal_period: {
    fiscal_year: {
      required: true,
      min: 2000,
      max: 2100,
      message: 'ปีบัญชีไม่ถูกต้อง'
    },
    period_number: {
      required: true,
      min: 1,
      max: 12,
      message: 'เดือนต้องอยู่ระหว่าง 1-12'
    }
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================
export const API_ENDPOINTS = {
  // Chart of Accounts
  chartOfAccounts: {
    list: '/api/accounting/chart-of-accounts',
    get: (id) => `/api/accounting/chart-of-accounts/${id}`,
    create: '/api/accounting/chart-of-accounts',
    update: (id) => `/api/accounting/chart-of-accounts/${id}`,
    delete: (id) => `/api/accounting/chart-of-accounts/${id}`,
    initialize: '/api/accounting/chart-of-accounts/initialize',
    export: '/api/accounting/chart-of-accounts/export'
  },
  
  // Journal Entries
  journalEntries: {
    list: '/api/accounting/journal-entries',
    get: (id) => `/api/accounting/journal-entries/${id}`,
    create: '/api/accounting/journal-entries',
    update: (id) => `/api/accounting/journal-entries/${id}`,
    delete: (id) => `/api/accounting/journal-entries/${id}`,
    post: (id) => `/api/accounting/journal-entries/${id}/post`,
    reverse: (id) => `/api/accounting/journal-entries/${id}/reverse`,
    autoGenerate: '/api/accounting/journal-entries/auto-generate'
  },
  
  // General Ledger
  generalLedger: {
    list: '/api/accounting/general-ledger',
    byAccount: (accountCode) => `/api/accounting/general-ledger/${accountCode}`,
    export: '/api/accounting/general-ledger/export'
  },
  
  // Reports
  reports: {
    trialBalance: '/api/accounting/reports/trial-balance',
    balanceSheet: '/api/accounting/reports/balance-sheet',
    incomeStatement: '/api/accounting/reports/income-statement',
    cashFlow: '/api/accounting/reports/cash-flow',
    profitAndLoss: '/api/accounting/reports/profit-and-loss'
  },
  
  // Fiscal Periods
  fiscalPeriods: {
    list: '/api/accounting/fiscal-periods',
    get: (id) => `/api/accounting/fiscal-periods/${id}`,
    create: '/api/accounting/fiscal-periods',
    close: (id) => `/api/accounting/fiscal-periods/${id}/close`,
    lock: (id) => `/api/accounting/fiscal-periods/${id}/lock`,
    generateYear: '/api/accounting/fiscal-periods/generate-year'
  },
  
  // AP/AR
  accountsPayable: {
    list: '/api/accounting/accounts-payable',
    aging: '/api/accounting/accounts-payable/aging'
  },
  accountsReceivable: {
    list: '/api/accounting/accounts-receivable',
    aging: '/api/accounting/accounts-receivable/aging'
  }
}

// ==========================================
// MODULE UTILITIES
// ==========================================
export const MODULE_UTILS = {
  // Currency formatting
  formatCurrency: (amount, currency = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  // Date formatting
  formatDate: (date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  },
  
  formatShortDate: (date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date))
  },

  // Number formatting
  formatNumber: (number, decimals = 2) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  },
  
  // Percentage formatting
  formatPercentage: (value) => {
    return `${(value * 100).toFixed(2)}%`
  },

  // Re-export utils from masterdata
  ...AccountingUtils,
  ...FiscalPeriodUtils,
  ...BalanceCalculator,
  ...JournalUtils,
  ...AutoPostingEngine,
  ...PostingEngine,

  // Status badge colors
  getStatusColor: (status) => {
    const colors = {
      'draft': 'gray',
      'posted': 'green',
      'cancelled': 'red',
      'reversed': 'yellow',
      'open': 'blue',
      'closed': 'orange',
      'locked': 'red',
      'active': 'green',
      'inactive': 'gray'
    }
    return colors[status] || 'gray'
  },

  // Account type colors
  getAccountTypeColor: (type) => {
    const colors = {
      [ACCOUNT_TYPES.ASSET]: 'blue',
      [ACCOUNT_TYPES.LIABILITY]: 'red',
      [ACCOUNT_TYPES.EQUITY]: 'purple',
      [ACCOUNT_TYPES.REVENUE]: 'green',
      [ACCOUNT_TYPES.EXPENSE]: 'orange',
      [ACCOUNT_TYPES.COST_OF_GOODS_SOLD]: 'yellow'
    }
    return colors[type] || 'gray'
  }
}

// ==========================================
// MODULE MENU
// ==========================================
export const MODULE_MENU = {
  title: 'Accounting',
  icon: 'fas fa-calculator',
  order: 100,
  children: [
    {
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/accounting',
      permissions: ['view_accounting']
    },
    {
      title: 'Chart of Accounts',
      icon: 'fas fa-list-alt',
      route: '/accounting/chart-of-accounts',
      permissions: ['view_coa']
    },
    {
      title: 'Journal Entries',
      icon: 'fas fa-pen-alt',
      route: '/accounting/journal-entries',
      permissions: ['view_journal']
    },
    {
      title: 'General Ledger',
      icon: 'fas fa-book',
      route: '/accounting/general-ledger',
      permissions: ['view_ledger']
    },
    {
      title: 'Reports',
      icon: 'fas fa-chart-bar',
      route: '/accounting/reports',
      permissions: ['view_reports']
    }
  ]
}

// ==========================================
// MODULE PERMISSIONS
// ==========================================
export const MODULE_PERMISSIONS = [
  'view_accounting',
  'view_coa',
  'create_coa',
  'edit_coa',
  'delete_coa',
  'view_journal',
  'create_journal',
  'edit_journal',
  'post_journal',
  'reverse_journal',
  'view_ledger',
  'view_reports',
  'close_period',
  'lock_period',
  'manage_settings'
]

// ==========================================
// EXPORT ALL
// ==========================================
export default {
  ACCOUNTING_CONSTANTS,
  DEFAULT_CONFIG,
  VALIDATION_RULES,
  API_ENDPOINTS,
  MODULE_UTILS,
  MODULE_MENU,
  MODULE_PERMISSIONS
}
