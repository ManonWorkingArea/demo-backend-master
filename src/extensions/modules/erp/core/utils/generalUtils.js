// ==========================================
// General Utilities
// ==========================================

/**
 * Format number as currency (Thai Baht)
 * @param {number} amount - Amount to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount = 0, options = {}) => {
  const {
    currency = 'THB',
    locale = 'th-TH',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    symbol = true
  } = options

  if (!symbol) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount)
}

/**
 * Format number as percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value = 0, decimals = 2) => {
  return `${(value).toFixed(decimals)}%`
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''

  const options = {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    thai: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      locale: 'th-TH'
    }
  }

  const formatOption = options[format] || options.short
  const locale = formatOption.locale || 'th-TH'

  return dateObj.toLocaleDateString(locale, formatOption)
}

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type
 * @returns {string} - Formatted date time string
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''

  return dateObj.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Generate unique reference number
 * @param {string} prefix - Prefix for reference number
 * @param {Object} options - Generation options
 * @returns {string} - Generated reference number
 */
export const generateReferenceNumber = (prefix = '', options = {}) => {
  const {
    length = 6,
    includeDate = true,
    separator = '',
    dateFormat = 'YYMMDD'
  } = options

  let reference = prefix

  if (includeDate) {
    const now = new Date()
    let dateString = ''
    
    switch (dateFormat) {
      case 'YYMMDD':
        dateString = now.getFullYear().toString().slice(-2) + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0')
        break
      case 'YYYYMMDD':
        dateString = now.getFullYear().toString() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0')
        break
      default:
        dateString = now.getFullYear().toString().slice(-2) + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0')
    }
    
    if (reference && separator) reference += separator
    reference += dateString
  }

  // Generate random alphanumeric string
  const chars = '0123456789'
  let randomPart = ''
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  if (reference && separator) reference += separator
  reference += randomPart

  return reference
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Thai phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Thai phone number
 */
export const validateThaiPhone = (phone) => {
  // Remove all spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Thai phone number patterns
  const mobileRegex = /^(06|08|09)\d{8}$/ // Mobile: 06x, 08x, 09x followed by 8 digits
  const landlineRegex = /^0[2-7]\d{7,8}$/ // Landline: 02-07 followed by 7-8 digits
  
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned)
}

/**
 * Validate Thai ID number
 * @param {string} idNumber - ID number to validate
 * @returns {boolean} - True if valid Thai ID
 */
export const validateThaiID = (idNumber) => {
  if (!idNumber || idNumber.length !== 13) return false
  
  // Check if all characters are digits
  if (!/^\d+$/.test(idNumber)) return false
  
  // Calculate checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idNumber[i]) * (13 - i)
  }
  
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(idNumber[12])
}

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} - Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return Math.max(0, age)
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

/**
 * Convert string to slug (URL-friendly)
 * @param {string} text - Text to convert
 * @returns {string} - Slug string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Get nested object property safely
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot-notated path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} - Found value or default
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue
  }, obj)
}

/**
 * Set nested object property
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-notated path
 * @param {any} value - Value to set
 * @returns {Object} - Modified object
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  
  const target = keys.reduce((current, key) => {
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
  return obj
}