/**
 * Accounting Helpers
 * Functions สำหรับใช้งานทั่วไปในระบบบัญชี
 */

/**
 * Format ตัวเลขเงินตามการตั้งค่า
 */
export function formatCurrency(amount, currencySettings, showSymbol = true) {
  if (!currencySettings) {
    return amount.toFixed(2)
  }

  const decimals = currencySettings.decimal_places || 2
  const decSep = currencySettings.decimal_separator || '.'
  const thousandSep = currencySettings.thousand_separator || ','
  const symbol = currencySettings.base_currency_symbol || '฿'

  // Round based on rounding method
  let rounded = amount
  const precision = Math.pow(10, decimals)
  
  if (currencySettings.rounding_method === 'floor') {
    rounded = Math.floor(amount * precision) / precision
  } else if (currencySettings.rounding_method === 'ceil') {
    rounded = Math.ceil(amount * precision) / precision
  } else {
    rounded = Math.round(amount * precision) / precision
  }

  // Format number
  let formatted = rounded.toFixed(decimals)
  
  // Add thousand separators
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
  formatted = parts.join(decSep)

  if (!showSymbol) {
    return formatted
  }

  // Add currency symbol
  return currencySettings.symbol_position === 'before'
    ? `${symbol} ${formatted}`
    : `${formatted} ${symbol}`
}

/**
 * คำนวณ VAT
 */
export function calculateVAT(amount, taxSettings, isInclusive = false) {
  if (!taxSettings || !taxSettings.vat_enabled) {
    return { vat: 0, subtotal: amount, total: amount }
  }

  const vatRate = taxSettings.vat_rate / 100

  if (isInclusive || taxSettings.vat_calculation_method === 'inclusive') {
    // ราคารวม VAT
    const vat = amount - (amount / (1 + vatRate))
    const subtotal = amount - vat
    return { 
      vat: Math.round(vat * 100) / 100, 
      subtotal: Math.round(subtotal * 100) / 100, 
      total: amount 
    }
  } else {
    // ราคาไม่รวม VAT
    const vat = amount * vatRate
    const total = amount + vat
    return { 
      vat: Math.round(vat * 100) / 100, 
      subtotal: amount, 
      total: Math.round(total * 100) / 100 
    }
  }
}

/**
 * คำนวณภาษีหัก ณ ที่จ่าย
 */
export function calculateWithholdingTax(amount, type, taxSettings) {
  if (!taxSettings || !taxSettings.wht_enabled) {
    return 0
  }

  const rates = {
    service: taxSettings.wht_service_rate || 3,
    goods: taxSettings.wht_goods_rate || 1,
    rent: taxSettings.wht_rent_rate || 5,
    transport: taxSettings.wht_transport_rate || 1
  }

  const rate = (rates[type] || 0) / 100
  return Math.round(amount * rate * 100) / 100
}

/**
 * ดึงข้อมูลบริษัทสำหรับเอกสาร
 */
export function getCompanyInfoForDocument(companyInfo) {
  if (!companyInfo) {
    return {
      name: 'Company Name',
      tax_id: '0-0000-00000-00-0',
      address: 'Address',
      phone: '',
      email: ''
    }
  }

  return {
    name: companyInfo.company_name_th || companyInfo.company_name_en,
    name_en: companyInfo.company_name_en,
    name_th: companyInfo.company_name_th,
    tax_id: companyInfo.tax_id,
    branch: companyInfo.branch || '00000',
    address: companyInfo.address,
    city: companyInfo.city,
    province: companyInfo.province,
    postal_code: companyInfo.postal_code,
    phone: companyInfo.phone,
    email: companyInfo.email,
    website: companyInfo.website,
    logo_url: companyInfo.logo_url
  }
}

/**
 * Format Tax ID
 */
export function formatTaxID(taxId, format = 'X-XXXX-XXXXX-XX-X') {
  if (!taxId) return ''
  
  // Remove all non-digits
  const digits = taxId.replace(/\D/g, '')
  
  if (format === 'X-XXXX-XXXXX-XX-X' && digits.length === 13) {
    return `${digits.substring(0, 1)}-${digits.substring(1, 5)}-${digits.substring(5, 10)}-${digits.substring(10, 12)}-${digits.substring(12, 13)}`
  }
  
  return taxId
}

/**
 * ตรวจสอบว่าวันที่อยู่ในงวดบัญชี
 */
export function isDateInFiscalYear(date, fiscalYearSettings) {
  if (!fiscalYearSettings) return true
  
  const targetDate = new Date(date)
  const year = targetDate.getFullYear()
  
  const startMonth = fiscalYearSettings.fiscal_year_start_month - 1 // 0-indexed
  const startDay = fiscalYearSettings.fiscal_year_start_day
  
  const fiscalYearStart = new Date(year, startMonth, startDay)
  const fiscalYearEnd = new Date(year + 1, startMonth, startDay - 1)
  
  return targetDate >= fiscalYearStart && targetDate <= fiscalYearEnd
}

/**
 * ดึงปีบัญชีจากวันที่
 */
export function getFiscalYear(date, fiscalYearSettings) {
  if (!fiscalYearSettings) {
    return new Date(date).getFullYear()
  }
  
  const targetDate = new Date(date)
  const year = targetDate.getFullYear()
  
  const startMonth = fiscalYearSettings.fiscal_year_start_month - 1
  const startDay = fiscalYearSettings.fiscal_year_start_day
  
  const fiscalYearStart = new Date(year, startMonth, startDay)
  
  if (targetDate >= fiscalYearStart) {
    return year
  } else {
    return year - 1
  }
}

/**
 * Format ปีบัญชีตามรูปแบบที่ตั้งค่า
 */
export function formatFiscalYear(year, format = 'YYYY') {
  switch (format) {
    case 'YY':
      return String(year).substring(2)
    case 'YYYY-YYYY':
      return `${year}-${year + 1}`
    case 'BBBB':
      return String(year + 543) // พ.ศ.
    case 'YYYY':
    default:
      return String(year)
  }
}

/**
 * ดึง Account Type สี
 */
export function getAccountTypeColor(accountTypes, typeKey) {
  const type = accountTypes[typeKey]
  if (!type) return 'gray'
  
  return type.color || 'gray'
}

/**
 * ดึง Account Type ชื่อ
 */
export function getAccountTypeName(accountTypes, typeKey, language = 'th') {
  const type = accountTypes[typeKey]
  if (!type) return typeKey
  
  return language === 'th' ? type.name_th : type.name
}

/**
 * Generate Account Code
 */
export function generateAccountCode(typeKey, accountTypes, existingCodes = []) {
  const type = accountTypes[typeKey]
  if (!type) return ''
  
  const prefix = type.code_prefix || '0'
  
  // Find next available code
  let nextNumber = 1
  let code = `${prefix}${String(nextNumber).padStart(3, '0')}`
  
  while (existingCodes.includes(code)) {
    nextNumber++
    code = `${prefix}${String(nextNumber).padStart(3, '0')}`
  }
  
  return code
}

/**
 * Validate Transaction Date
 */
export function validateTransactionDate(date, fiscalYearSettings) {
  const errors = []
  
  if (!fiscalYearSettings) return errors
  
  const txDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  txDate.setHours(0, 0, 0, 0)
  
  // Check backdated transactions
  if (!fiscalYearSettings.allow_backdated_transactions && txDate < today) {
    errors.push('ไม่อนุญาตให้บันทึกรายการย้อนหลัง')
  }
  
  // Check if in current fiscal year
  if (!isDateInFiscalYear(date, fiscalYearSettings)) {
    errors.push('วันที่ไม่อยู่ในงวดปีบัญชีปัจจุบัน')
  }
  
  return errors
}

/**
 * Get Period Name
 */
export function getPeriodName(periodNumber, periodType = 'monthly', language = 'th') {
  const monthNames = {
    th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
         'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
  }
  
  const quarterNames = {
    th: ['ไตรมาสที่ 1', 'ไตรมาสที่ 2', 'ไตรมาสที่ 3', 'ไตรมาสที่ 4'],
    en: ['Q1', 'Q2', 'Q3', 'Q4']
  }
  
  switch (periodType) {
    case 'monthly':
      return monthNames[language][periodNumber - 1] || `Period ${periodNumber}`
    case 'quarterly':
      return quarterNames[language][periodNumber - 1] || `Q${periodNumber}`
    case 'semi-annual':
      return language === 'th' ? `ครึ่งปีที่ ${periodNumber}` : `H${periodNumber}`
    case 'annual':
      return language === 'th' ? 'ทั้งปี' : 'Annual'
    default:
      return `Period ${periodNumber}`
  }
}

export default {
  formatCurrency,
  calculateVAT,
  calculateWithholdingTax,
  getCompanyInfoForDocument,
  formatTaxID,
  isDateInFiscalYear,
  getFiscalYear,
  formatFiscalYear,
  getAccountTypeColor,
  getAccountTypeName,
  generateAccountCode,
  validateTransactionDate,
  getPeriodName
}
