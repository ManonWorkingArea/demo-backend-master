/**
 * Customer Master Data Module
 * โมดูลจัดการข้อมูลลูกค้า - Export หลัก
 */

// Import schema และ configuration
import { 
  CUSTOMER_SCHEMA,
  CUSTOMER_STATUS,
  CUSTOMER_STATES,
  CUSTOMER_TRANSITIONS,
  CUSTOMER_INITIAL_STATE,
  CUSTOMER_STORAGE_KEY
} from './schema.js'

import {
  CUSTOMER_CODE_CONFIG,
  DEFAULT_CUSTOMER_GROUPS,
  SALES_CHANNELS,
  INDUSTRY_CATEGORIES,
  PAYMENT_TERMS_CONFIG,
  CUSTOMER_TEMPLATES,
  CUSTOMER_VALIDATION_RULES
} from './data.js'

// Customer Business Logic Functions
export const CustomerFunctions = {
  /**
   * Generate customer code
   */
  generateCustomerCode(options = {}) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const sequence = String(options.sequence || 1).padStart(3, '0')
    
    return `${CUSTOMER_CODE_CONFIG.prefix}${year}${month}${day}${sequence}`
  },

  /**
   * Validate customer data
   */
  validateCustomerData(customerData) {
    const errors = []

    // ตรวจสอบ required fields
    if (!customerData.customer_name || customerData.customer_name.trim() === '') {
      errors.push('ชื่อลูกค้าเป็นข้อมูลที่จำเป็น')
    }

    // ตรวจสอบ tax_id format
    if (customerData.tax_id && !CUSTOMER_VALIDATION_RULES.tax_id.format.test(customerData.tax_id)) {
      errors.push(CUSTOMER_VALIDATION_RULES.tax_id.message)
    }

    // ตรวจสอบ email format
    if (customerData.email && !CUSTOMER_VALIDATION_RULES.email.format.test(customerData.email)) {
      errors.push(CUSTOMER_VALIDATION_RULES.email.message)
    }

    // ตรวจสอบ phone format
    if (customerData.phone && !CUSTOMER_VALIDATION_RULES.phone.format.test(customerData.phone)) {
      errors.push(CUSTOMER_VALIDATION_RULES.phone.message)
    }

    // ตรวจสอบ postal_code format
    if (customerData.postal_code && !CUSTOMER_VALIDATION_RULES.postal_code.format.test(customerData.postal_code)) {
      errors.push(CUSTOMER_VALIDATION_RULES.postal_code.message)
    }

    // ตรวจสอบ credit_limit range
    if (customerData.credit_limit !== undefined) {
      if (customerData.credit_limit < CUSTOMER_VALIDATION_RULES.credit_limit.min || 
          customerData.credit_limit > CUSTOMER_VALIDATION_RULES.credit_limit.max) {
        errors.push(CUSTOMER_VALIDATION_RULES.credit_limit.message)
      }
    }

    // ตรวจสอบ credit_days range
    if (customerData.credit_days !== undefined) {
      if (customerData.credit_days < CUSTOMER_VALIDATION_RULES.credit_days.min || 
          customerData.credit_days > CUSTOMER_VALIDATION_RULES.credit_days.max) {
        errors.push(CUSTOMER_VALIDATION_RULES.credit_days.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Apply customer template
   */
  applyCustomerTemplate(customerType, customData = {}) {
    const template = CUSTOMER_TEMPLATES[customerType] || CUSTOMER_TEMPLATES.individual
    
    return {
      ...template,
      ...customData,
      customer_type: customerType // บังคับใช้ customerType ที่เลือก
    }
  },

  /**
   * Calculate credit limit based on customer group
   */
  calculateCreditLimit(customerGroup, annualRevenue = 0) {
    const group = DEFAULT_CUSTOMER_GROUPS.find(g => g.id === customerGroup)
    if (!group) return 0

    let creditLimit = group.credit_limit

    // ปรับวงเงินตามรายได้ประจำปี
    if (annualRevenue > 0) {
      creditLimit = Math.min(creditLimit, annualRevenue * 0.1) // 10% ของรายได้ประจำปี
    }

    return creditLimit
  },

  /**
   * Get payment terms information
   */
  getPaymentTermsInfo(paymentTerms) {
    return PAYMENT_TERMS_CONFIG[paymentTerms] || PAYMENT_TERMS_CONFIG.cash
  },

  /**
   * Check customer status
   */
  isCustomerActive(customer) {
    return customer.status === 'active' && customer.is_active === true
  },

  /**
   * Get customer group information
   */
  getCustomerGroupInfo(customerGroup) {
    return DEFAULT_CUSTOMER_GROUPS.find(g => g.id === customerGroup)
  },

  /**
   * Get sales channel information
   */
  getSalesChannelInfo(salesChannel) {
    return SALES_CHANNELS.find(c => c.id === salesChannel)
  },

  /**
   * Format customer address
   */
  formatCustomerAddress(customer) {
    const parts = []
    
    if (customer.address) parts.push(customer.address)
    if (customer.district) parts.push(`แขวง/ตำบล ${customer.district}`)
    if (customer.province) parts.push(`จังหวัด ${customer.province}`)
    if (customer.postal_code) parts.push(customer.postal_code)
    if (customer.country && customer.country !== 'ไทย') parts.push(customer.country)
    
    return parts.join(' ')
  },

  /**
   * Check duplicate customer
   */
  checkDuplicateCustomer(newCustomer, existingCustomers) {
    const duplicates = []

    // ตรวจสอบ customer_code
    if (existingCustomers.some(c => c.customer_code === newCustomer.customer_code)) {
      duplicates.push('รหัสลูกค้าซ้ำ')
    }

    // ตรวจสอบ tax_id (ถ้ามี)
    if (newCustomer.tax_id && existingCustomers.some(c => c.tax_id === newCustomer.tax_id)) {
      duplicates.push('เลขประจำตัวผู้เสียภาษีซ้ำ')
    }

    // ตรวจสอบ email (ถ้ามี)
    if (newCustomer.email && existingCustomers.some(c => c.email === newCustomer.email)) {
      duplicates.push('อีเมลซ้ำ')
    }

    return {
      hasDuplicate: duplicates.length > 0,
      duplicates
    }
  }
}

// Export ทั้งหมดสำหรับการใช้งานภายนอก
export {
  // Schema
  CUSTOMER_SCHEMA,
  CUSTOMER_STATUS,
  CUSTOMER_STATES,
  CUSTOMER_TRANSITIONS,
  CUSTOMER_INITIAL_STATE,
  CUSTOMER_STORAGE_KEY,
  
  // Data & Configuration
  CUSTOMER_CODE_CONFIG,
  DEFAULT_CUSTOMER_GROUPS,
  SALES_CHANNELS,
  INDUSTRY_CATEGORIES,
  PAYMENT_TERMS_CONFIG,
  CUSTOMER_TEMPLATES,
  CUSTOMER_VALIDATION_RULES
}

// Default export
export default {
  schema: CUSTOMER_SCHEMA,
  status: CUSTOMER_STATUS,
  states: CUSTOMER_STATES,
  transitions: CUSTOMER_TRANSITIONS,
  initialState: CUSTOMER_INITIAL_STATE,
  storageKey: CUSTOMER_STORAGE_KEY,
  codeConfig: CUSTOMER_CODE_CONFIG,
  functions: CustomerFunctions
}