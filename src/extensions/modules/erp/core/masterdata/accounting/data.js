// ==========================================
// ACCOUNTING MODULE - BUSINESS LOGIC & UTILITIES
// ==========================================

import {
  ACCOUNT_TYPES,
  ACCOUNT_CATEGORIES,
  BALANCE_TYPES,
  DEFAULT_BALANCE_TYPE,
  DEFAULT_ACCOUNTS
} from './schema.js'

// ==========================================
// CHART OF ACCOUNTS UTILITIES
// ==========================================
export const AccountingUtils = {
  /**
   * Validate Chart of Accounts data
   */
  validateCOAData(data) {
    const errors = []
    
    // Required fields
    if (!data.account_code) {
      errors.push('รหัสบัญชีเป็นข้อมูลที่จำเป็น')
    } else if (!/^[0-9]{4,}$/.test(data.account_code)) {
      errors.push('รหัสบัญชีต้องเป็นตัวเลข 4 หลักขึ้นไป')
    }
    
    if (!data.account_name || data.account_name.trim().length < 2) {
      errors.push('ชื่อบัญชีต้องมีอย่างน้อย 2 ตัวอักษร')
    }
    
    if (!data.account_type || !Object.values(ACCOUNT_TYPES).includes(data.account_type)) {
      errors.push('ประเภทบัญชีไม่ถูกต้อง')
    }
    
    if (!data.balance_type || !Object.values(BALANCE_TYPES).includes(data.balance_type)) {
      errors.push('ประเภทยอดคงเหลือไม่ถูกต้อง')
    }

    // Parent account validation
    if (data.parent_account_code) {
      if (data.parent_account_code === data.account_code) {
        errors.push('บัญชีไม่สามารถเป็นบัญชีแม่ของตัวเองได้')
      }
    }

    // Balance validation
    if (data.opening_balance && isNaN(parseFloat(data.opening_balance))) {
      errors.push('ยอดยกมาต้องเป็นตัวเลข')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Get account type label in Thai
   */
  getAccountTypeLabel(type) {
    const labels = {
      [ACCOUNT_TYPES.ASSET]: 'สินทรัพย์',
      [ACCOUNT_TYPES.LIABILITY]: 'หนี้สิน',
      [ACCOUNT_TYPES.EQUITY]: 'ทุน',
      [ACCOUNT_TYPES.REVENUE]: 'รายได้',
      [ACCOUNT_TYPES.EXPENSE]: 'ค่าใช้จ่าย',
      [ACCOUNT_TYPES.COST_OF_GOODS_SOLD]: 'ต้นทุนขาย'
    }
    return labels[type] || type
  },

  /**
   * Get account category label in Thai
   */
  getAccountCategoryLabel(category) {
    const labels = {
      [ACCOUNT_CATEGORIES.CURRENT_ASSET]: 'สินทรัพย์หมุนเวียน',
      [ACCOUNT_CATEGORIES.FIXED_ASSET]: 'สินทรัพย์ถาวร',
      [ACCOUNT_CATEGORIES.INTANGIBLE_ASSET]: 'สินทรัพย์ไม่มีตัวตน',
      [ACCOUNT_CATEGORIES.OTHER_ASSET]: 'สินทรัพย์อื่น',
      [ACCOUNT_CATEGORIES.CURRENT_LIABILITY]: 'หนี้สินหมุนเวียน',
      [ACCOUNT_CATEGORIES.LONG_TERM_LIABILITY]: 'หนี้สินระยะยาว',
      [ACCOUNT_CATEGORIES.OTHER_LIABILITY]: 'หนี้สินอื่น',
      [ACCOUNT_CATEGORIES.CAPITAL]: 'ทุนจดทะเบียน',
      [ACCOUNT_CATEGORIES.RETAINED_EARNINGS]: 'กำไรสะสม',
      [ACCOUNT_CATEGORIES.OTHER_EQUITY]: 'ส่วนของเจ้าของอื่น',
      [ACCOUNT_CATEGORIES.SALES_REVENUE]: 'รายได้จากการขาย',
      [ACCOUNT_CATEGORIES.SERVICE_REVENUE]: 'รายได้จากบริการ',
      [ACCOUNT_CATEGORIES.OTHER_REVENUE]: 'รายได้อื่น',
      [ACCOUNT_CATEGORIES.OPERATING_EXPENSE]: 'ค่าใช้จ่ายในการดำเนินงาน',
      [ACCOUNT_CATEGORIES.ADMINISTRATIVE_EXPENSE]: 'ค่าใช้จ่ายบริหาร',
      [ACCOUNT_CATEGORIES.SELLING_EXPENSE]: 'ค่าใช้จ่ายขาย',
      [ACCOUNT_CATEGORIES.FINANCIAL_EXPENSE]: 'ค่าใช้จ่ายทางการเงิน',
      [ACCOUNT_CATEGORIES.OTHER_EXPENSE]: 'ค่าใช้จ่ายอื่น',
      [ACCOUNT_CATEGORIES.DIRECT_COST]: 'ต้นทุนโดยตรง',
      [ACCOUNT_CATEGORIES.INDIRECT_COST]: 'ต้นทุนทางอ้อม'
    }
    return labels[category] || category
  },

  /**
   * Get balance type label
   */
  getBalanceTypeLabel(type) {
    return type === BALANCE_TYPES.DEBIT ? 'เดบิต' : 'เครดิต'
  },

  /**
   * Auto-suggest balance type based on account type
   */
  getDefaultBalanceType(accountType) {
    return DEFAULT_BALANCE_TYPE[accountType] || BALANCE_TYPES.DEBIT
  },

  /**
   * Calculate current balance
   */
  calculateCurrentBalance(openingBalance, debitAmount, creditAmount, balanceType) {
    openingBalance = parseFloat(openingBalance) || 0
    debitAmount = parseFloat(debitAmount) || 0
    creditAmount = parseFloat(creditAmount) || 0

    if (balanceType === BALANCE_TYPES.DEBIT) {
      return openingBalance + debitAmount - creditAmount
    } else {
      return openingBalance + creditAmount - debitAmount
    }
  },

  /**
   * Format account code (add leading zeros if needed)
   */
  formatAccountCode(code) {
    const numStr = String(code).replace(/\D/g, '')
    return numStr.padStart(4, '0')
  },

  /**
   * Get account level from code
   * Example: 1110 = level 1, 111001 = level 2
   */
  getAccountLevel(accountCode) {
    const code = String(accountCode)
    if (code.length <= 4) return 1
    if (code.length <= 6) return 2
    if (code.length <= 8) return 3
    if (code.length <= 10) return 4
    return 5
  },

  /**
   * Check if account can have sub-accounts
   */
  canHaveSubAccounts(account) {
    return account.allow_sub_account !== false && account.level < 5
  },

  /**
   * Generate sub-account code
   */
  generateSubAccountCode(parentCode, sequenceNumber) {
    const seq = String(sequenceNumber).padStart(2, '0')
    return `${parentCode}${seq}`
  },

  /**
   * Get account range for filtering by type
   * Thai standard: 1xxx=Assets, 2xxx=Liabilities, 3xxx=Equity, 4xxx=Revenue, 5xxx=COGS, 6xxx=Expenses
   */
  getAccountCodeRange(accountType) {
    const ranges = {
      [ACCOUNT_TYPES.ASSET]: { from: '1000', to: '1999' },
      [ACCOUNT_TYPES.LIABILITY]: { from: '2000', to: '2999' },
      [ACCOUNT_TYPES.EQUITY]: { from: '3000', to: '3999' },
      [ACCOUNT_TYPES.REVENUE]: { from: '4000', to: '4999' },
      [ACCOUNT_TYPES.COST_OF_GOODS_SOLD]: { from: '5000', to: '5999' },
      [ACCOUNT_TYPES.EXPENSE]: { from: '6000', to: '6999' }
    }
    return ranges[accountType] || null
  },

  /**
   * Initialize default Chart of Accounts
   */
  getDefaultAccounts() {
    return Object.entries(DEFAULT_ACCOUNTS).map(([code, account]) => ({
      account_code: code,
      account_name: account.name,
      account_name_en: account.name_en,
      account_type: account.type,
      account_category: account.category,
      balance_type: DEFAULT_BALANCE_TYPE[account.type],
      opening_balance: 0,
      current_balance: 0,
      ytd_debit: 0,
      ytd_credit: 0,
      level: this.getAccountLevel(code),
      is_active: true,
      is_system_account: true,
      allow_manual_entry: true,
      allow_sub_account: true,
      currency: 'THB',
      state: 'active'
    }))
  }
}

// ==========================================
// FISCAL PERIOD UTILITIES
// ==========================================
export const FiscalPeriodUtils = {
  /**
   * Validate Fiscal Period data
   */
  validatePeriodData(data) {
    const errors = []
    
    if (!data.fiscal_year || data.fiscal_year < 2000 || data.fiscal_year > 2100) {
      errors.push('ปีบัญชีไม่ถูกต้อง')
    }
    
    if (!data.period_number || data.period_number < 1 || data.period_number > 12) {
      errors.push('เดือนต้องอยู่ระหว่าง 1-12')
    }
    
    if (!data.start_date) {
      errors.push('วันที่เริ่มต้นเป็นข้อมูลที่จำเป็น')
    }
    
    if (!data.end_date) {
      errors.push('วันที่สิ้นสุดเป็นข้อมูลที่จำเป็น')
    }
    
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      if (end <= start) {
        errors.push('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Generate period code
   */
  generatePeriodCode(fiscalYear, periodNumber) {
    const year = fiscalYear
    const month = String(periodNumber).padStart(2, '0')
    return `FP-${year}-${month}`
  },

  /**
   * Generate period name in Thai
   */
  generatePeriodName(periodNumber, fiscalYear) {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const thaiYear = fiscalYear + 543
    return `${thaiMonths[periodNumber - 1]} ${thaiYear}`
  },

  /**
   * Calculate quarter from period number
   */
  calculateQuarter(periodNumber) {
    return Math.ceil(periodNumber / 3)
  },

  /**
   * Get period date range
   */
  getPeriodDateRange(fiscalYear, periodNumber) {
    const startDate = new Date(fiscalYear, periodNumber - 1, 1)
    const endDate = new Date(fiscalYear, periodNumber, 0) // Last day of month
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    }
  },

  /**
   * Generate all periods for a fiscal year
   */
  generateYearPeriods(fiscalYear) {
    const periods = []
    
    for (let month = 1; month <= 12; month++) {
      const dateRange = this.getPeriodDateRange(fiscalYear, month)
      const periodCode = this.generatePeriodCode(fiscalYear, month)
      const periodName = this.generatePeriodName(month, fiscalYear)
      const quarter = this.calculateQuarter(month)
      
      periods.push({
        period_code: periodCode,
        period_name: periodName,
        fiscal_year: fiscalYear,
        period_number: month,
        quarter: quarter,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        state: 'open',
        is_current_period: false,
        total_entries: 0,
        total_debit: 0,
        total_credit: 0
      })
    }
    
    return periods
  },

  /**
   * Check if can close period
   */
  canClosePeriod(period) {
    if (period.state !== 'open') {
      return { canClose: false, reason: 'งวดนี้ไม่เปิดอยู่' }
    }
    
    // Check if entries are balanced
    const diff = Math.abs(period.total_debit - period.total_credit)
    if (diff > 0.01) { // Allow 0.01 tolerance for rounding
      return { 
        canClose: false, 
        reason: `รายการบัญชีไม่สมดุล ต่างกัน ${diff.toFixed(2)} บาท` 
      }
    }
    
    return { canClose: true }
  },

  /**
   * Check if can post entry to period
   */
  canPostToPeriod(period) {
    if (period.state === 'locked') {
      return { canPost: false, reason: 'งวดนี้ถูกล็อกแล้ว ไม่สามารถบันทึกรายการได้' }
    }
    
    if (period.state === 'closed') {
      return { canPost: false, reason: 'งวดนี้ปิดแล้ว ไม่สามารถบันทึกรายการได้' }
    }
    
    return { canPost: true }
  },

  /**
   * Get current period based on current date
   */
  getCurrentPeriod(periods) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    return periods.find(p => 
      p.fiscal_year === currentYear && 
      p.period_number === currentMonth
    )
  },

  /**
   * Get period by date
   */
  getPeriodByDate(periods, date) {
    const targetDate = new Date(date)
    
    return periods.find(p => {
      const startDate = new Date(p.start_date)
      const endDate = new Date(p.end_date)
      return targetDate >= startDate && targetDate <= endDate
    })
  }
}

// ==========================================
// ACCOUNT BALANCE CALCULATION
// ==========================================
export const BalanceCalculator = {
  /**
   * Calculate trial balance
   */
  calculateTrialBalance(accounts, journalEntries) {
    const balance = {}
    
    accounts.forEach(account => {
      balance[account.account_code] = {
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        balance_type: account.balance_type,
        opening_balance: account.opening_balance || 0,
        debit: 0,
        credit: 0,
        ending_balance: 0
      }
    })
    
    // Sum up journal entries
    journalEntries.forEach(entry => {
      if (entry.state === 'posted') {
        entry.lines.forEach(line => {
          if (balance[line.account_code]) {
            balance[line.account_code].debit += line.debit_amount || 0
            balance[line.account_code].credit += line.credit_amount || 0
          }
        })
      }
    })
    
    // Calculate ending balance
    Object.values(balance).forEach(acc => {
      if (acc.balance_type === BALANCE_TYPES.DEBIT) {
        acc.ending_balance = acc.opening_balance + acc.debit - acc.credit
      } else {
        acc.ending_balance = acc.opening_balance + acc.credit - acc.debit
      }
    })
    
    return Object.values(balance)
  },

  /**
   * Calculate income statement
   */
  calculateIncomeStatement(trialBalance) {
    let totalRevenue = 0
    let totalCOGS = 0
    let totalExpense = 0
    
    trialBalance.forEach(acc => {
      if (acc.account_type === ACCOUNT_TYPES.REVENUE) {
        totalRevenue += acc.ending_balance
      } else if (acc.account_type === ACCOUNT_TYPES.COST_OF_GOODS_SOLD) {
        totalCOGS += acc.ending_balance
      } else if (acc.account_type === ACCOUNT_TYPES.EXPENSE) {
        totalExpense += acc.ending_balance
      }
    })
    
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalExpense
    
    return {
      revenue: totalRevenue,
      cogs: totalCOGS,
      gross_profit: grossProfit,
      expenses: totalExpense,
      net_profit: netProfit
    }
  },

  /**
   * Calculate balance sheet
   */
  calculateBalanceSheet(trialBalance) {
    let totalAssets = 0
    let totalLiabilities = 0
    let totalEquity = 0
    
    trialBalance.forEach(acc => {
      if (acc.account_type === ACCOUNT_TYPES.ASSET) {
        totalAssets += acc.ending_balance
      } else if (acc.account_type === ACCOUNT_TYPES.LIABILITY) {
        totalLiabilities += acc.ending_balance
      } else if (acc.account_type === ACCOUNT_TYPES.EQUITY) {
        totalEquity += acc.ending_balance
      }
    })
    
    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity,
      total: totalAssets,
      liabilities_and_equity: totalLiabilities + totalEquity,
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    }
  }
}

// Export all
export default {
  AccountingUtils,
  FiscalPeriodUtils,
  BalanceCalculator
}
