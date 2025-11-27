/**
 * InputValidator - Centralized Input Validation Utility
 * 
 * 🛡️ Provides comprehensive input validation for all services
 * ✅ Type checking, format validation, business rules
 * 🎯 Consistent error messages and validation patterns
 * 📊 Support for complex validation scenarios
 */

class InputValidator {
  
  // ===== 🔍 BASIC TYPE VALIDATION =====
  
  /**
   * ตรวจสอบว่าเป็น string ที่ไม่ว่าง
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์สำหรับ error message
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateRequiredString(value, fieldName) {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น string`,
        code: 'INVALID_TYPE'
      };
    }
    
    if (value.trim().length === 0) {
      return {
        isValid: false,
        error: `${fieldName} ไม่สามารถเป็นค่าว่างได้`,
        code: 'REQUIRED_FIELD'
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบว่าเป็น number ที่ถูกต้อง
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @param {Object} options - ตัวเลือกเพิ่มเติม (min, max, integer)
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateNumber(value, fieldName, options = {}) {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็นตัวเลขที่ถูกต้อง`,
        code: 'INVALID_NUMBER'
      };
    }
    
    if (options.integer && !Number.isInteger(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็นจำนวนเต็ม`,
        code: 'INVALID_INTEGER'
      };
    }
    
    if (options.min !== undefined && value < options.min) {
      return {
        isValid: false,
        error: `${fieldName} ต้องมีค่าอย่างน้อย ${options.min}`,
        code: 'VALUE_TOO_LOW'
      };
    }
    
    if (options.max !== undefined && value > options.max) {
      return {
        isValid: false,
        error: `${fieldName} ต้องมีค่าไม่เกิน ${options.max}`,
        code: 'VALUE_TOO_HIGH'
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบ ObjectId format
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateObjectId(value, fieldName) {
    const stringCheck = this.validateRequiredString(value, fieldName);
    if (!stringCheck.isValid) return stringCheck;
    
    // MongoDB ObjectId pattern: 24 hex characters
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น ObjectId ที่ถูกต้อง (24 hex characters)`,
        code: 'INVALID_OBJECT_ID'
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบ email format
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @param {boolean} required - จำเป็นหรือไม่
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateEmail(value, fieldName, required = false) {
    if (!required && (!value || value.trim() === '')) {
      return { isValid: true };
    }
    
    const stringCheck = this.validateRequiredString(value, fieldName);
    if (!stringCheck.isValid) return stringCheck;
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น email ที่ถูกต้อง`,
        code: 'INVALID_EMAIL'
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบวันที่
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @param {Object} options - ตัวเลือก (future, past)
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateDate(value, fieldName, options = {}) {
    if (!value) {
      return {
        isValid: false,
        error: `${fieldName} จำเป็นต้องระบุ`,
        code: 'REQUIRED_FIELD'
      };
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็นวันที่ที่ถูกต้อง`,
        code: 'INVALID_DATE'
      };
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (options.future && date < now) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็นวันที่ในอนาคต`,
        code: 'DATE_IN_PAST'
      };
    }
    
    if (options.past && date > now) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็นวันที่ในอดีต`,
        code: 'DATE_IN_FUTURE'
      };
    }
    
    return { isValid: true };
  }
  
  // ===== 🏢 BUSINESS VALIDATION =====
  
  /**
   * ตรวจสอบ billing cycle
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateBillingCycle(value, fieldName = 'Billing Cycle') {
    const validCycles = ['monthly', 'quarterly', 'yearly'];
    
    const stringCheck = this.validateRequiredString(value, fieldName);
    if (!stringCheck.isValid) return stringCheck;
    
    if (!validCycles.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น: ${validCycles.join(', ')}`,
        code: 'INVALID_BILLING_CYCLE',
        validValues: validCycles
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบสกุลเงิน
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string} fieldName - ชื่อฟิลด์
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateCurrency(value, fieldName = 'Currency') {
    const validCurrencies = ['THB', 'USD', 'EUR', 'GBP', 'JPY'];
    
    const stringCheck = this.validateRequiredString(value, fieldName);
    if (!stringCheck.isValid) return stringCheck;
    
    if (!validCurrencies.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น: ${validCurrencies.join(', ')}`,
        code: 'INVALID_CURRENCY',
        validValues: validCurrencies,
        warning: validCurrencies.includes(value.toUpperCase()) ? 
          `ลองใช้ ${value.toUpperCase()} แทน` : null
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * ตรวจสอบสถานะ
   * @param {*} value - ค่าที่ต้องการตรวจสอบ
   * @param {string[]} validStatuses - สถานะที่ถูกต้อง
   * @param {string} fieldName - ชื่อฟิลด์
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateStatus(value, validStatuses, fieldName = 'Status') {
    const stringCheck = this.validateRequiredString(value, fieldName);
    if (!stringCheck.isValid) return stringCheck;
    
    if (!validStatuses.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} ต้องเป็น: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS',
        validValues: validStatuses
      };
    }
    
    return { isValid: true };
  }
  
  // ===== 📦 COMPLEX OBJECT VALIDATION =====
  
  /**
   * ตรวจสอบข้อมูล Contract
   * @param {Object} contractData - ข้อมูล Contract
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateContractData(contractData) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    const collectionIdCheck = this.validateObjectId(contractData.collectionId, 'Collection ID');
    if (!collectionIdCheck.isValid) errors.push(collectionIdCheck);
    
    const packageIdCheck = this.validateObjectId(contractData.packageId, 'Package ID');
    if (!packageIdCheck.isValid) errors.push(packageIdCheck);
    
    const basePriceCheck = this.validateNumber(contractData.basePrice, 'Base Price', { min: 0 });
    if (!basePriceCheck.isValid) errors.push(basePriceCheck);
    
    const billingCycleCheck = this.validateBillingCycle(contractData.billingCycle);
    if (!billingCycleCheck.isValid) errors.push(billingCycleCheck);
    
    // Optional fields with validation
    if (contractData.currency) {
      const currencyCheck = this.validateCurrency(contractData.currency);
      if (!currencyCheck.isValid) errors.push(currencyCheck);
    }
    
    if (contractData.contractStartDate) {
      const startDateCheck = this.validateDate(contractData.contractStartDate, 'Contract Start Date');
      if (!startDateCheck.isValid) errors.push(startDateCheck);
    }
    
    // Business rules
    if (contractData.basePrice === 0) {
      warnings.push({
        field: 'basePrice',
        message: 'ราคา 0 บาท - สัญญานี้จะเป็นแบบฟรี',
        code: 'FREE_CONTRACT'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length
      }
    };
  }
  
  /**
   * ตรวจสอบข้อมูล Subscription
   * @param {Object} subscriptionData - ข้อมูล Subscription
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateSubscriptionData(subscriptionData) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    const contractIdCheck = this.validateObjectId(subscriptionData.contractId, 'Contract ID');
    if (!contractIdCheck.isValid) errors.push(contractIdCheck);
    
    const collectionIdCheck = this.validateObjectId(subscriptionData.collectionId, 'Collection ID');
    if (!collectionIdCheck.isValid) errors.push(collectionIdCheck);
    
    const packageIdCheck = this.validateObjectId(subscriptionData.packageId, 'Package ID');
    if (!packageIdCheck.isValid) errors.push(packageIdCheck);
    
    // Date validation
    if (subscriptionData.periodStart) {
      const startDateCheck = this.validateDate(subscriptionData.periodStart, 'Period Start');
      if (!startDateCheck.isValid) errors.push(startDateCheck);
    }
    
    if (subscriptionData.periodEnd) {
      const endDateCheck = this.validateDate(subscriptionData.periodEnd, 'Period End');
      if (!endDateCheck.isValid) errors.push(endDateCheck);
      
      // Business rule: end date should be after start date
      if (subscriptionData.periodStart && endDateCheck.isValid) {
        const startDate = new Date(subscriptionData.periodStart);
        const endDate = new Date(subscriptionData.periodEnd);
        
        if (endDate <= startDate) {
          errors.push({
            isValid: false,
            error: 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น',
            code: 'INVALID_DATE_RANGE'
          });
        }
      }
    }
    
    // Trial period validation
    if (subscriptionData.trialDays !== undefined) {
      const trialCheck = this.validateNumber(subscriptionData.trialDays, 'Trial Days', { 
        min: 0, 
        max: 365, 
        integer: true 
      });
      if (!trialCheck.isValid) errors.push(trialCheck);
      
      if (subscriptionData.trialDays > 90) {
        warnings.push({
          field: 'trialDays',
          message: 'ระยะทดลองใช้นานกว่า 90 วัน',
          code: 'LONG_TRIAL_PERIOD'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length
      }
    };
  }
  
  /**
   * ตรวจสอบข้อมูล Invoice
   * @param {Object} invoiceData - ข้อมูล Invoice
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateInvoiceData(invoiceData) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    const amountCheck = this.validateNumber(invoiceData.amount, 'Amount', { min: 0 });
    if (!amountCheck.isValid) errors.push(amountCheck);
    
    if (invoiceData.subscriptionId) {
      const subscriptionIdCheck = this.validateObjectId(invoiceData.subscriptionId, 'Subscription ID');
      if (!subscriptionIdCheck.isValid) errors.push(subscriptionIdCheck);
    }
    
    if (invoiceData.dueDate) {
      const dueDateCheck = this.validateDate(invoiceData.dueDate, 'Due Date');
      if (!dueDateCheck.isValid) errors.push(dueDateCheck);
    }
    
    // Optional validations
    if (invoiceData.currency) {
      const currencyCheck = this.validateCurrency(invoiceData.currency);
      if (!currencyCheck.isValid) errors.push(currencyCheck);
    }
    
    if (invoiceData.status) {
      const validStatuses = ['draft', 'pending_payment', 'paid', 'overdue', 'cancelled', 'refunded'];
      const statusCheck = this.validateStatus(invoiceData.status, validStatuses, 'Invoice Status');
      if (!statusCheck.isValid) errors.push(statusCheck);
    }
    
    // Business warnings
    if (invoiceData.amount === 0) {
      warnings.push({
        field: 'amount',
        message: 'จำนวนเงิน 0 บาท - ใบแจ้งหนี้นี้จะเป็นแบบฟรี',
        code: 'FREE_INVOICE'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length
      }
    };
  }
  
  // ===== 🔧 UTILITY METHODS =====
  
  /**
   * รวมผลการตรวจสอบหลายๆ อัน
   * @param {Object[]} validationResults - ผลการตรวจสอบ
   * @returns {Object} ผลรวม
   */
  static combineValidationResults(validationResults) {
    const allErrors = [];
    const allWarnings = [];
    
    validationResults.forEach(result => {
      if (result.errors) {
        allErrors.push(...result.errors);
      }
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      summary: {
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
        totalChecks: validationResults.length
      }
    };
  }
  
  /**
   * สร้าง validation error ที่มี format เดียวกัน
   * @param {string} message - ข้อความ error
   * @param {string} code - รหัส error
   * @param {Object} extra - ข้อมูลเพิ่มเติม
   * @returns {Error} Custom validation error
   */
  static createValidationError(message, code = 'VALIDATION_ERROR', extra = {}) {
    const error = new Error(message);
    error.name = 'ValidationError';
    error.code = code;
    error.details = extra;
    return error;
  }
}

export default InputValidator; 