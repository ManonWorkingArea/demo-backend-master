/**
 * ErrorHandler - Centralized Error Handling Utility
 * 
 * 🛡️ Provides comprehensive error handling and logging
 * ✅ Custom error types, error classification, recovery strategies
 * 🎯 Consistent error responses and debugging information
 * 📊 Error tracking and monitoring capabilities
 */

class ErrorHandler {
  
  // ===== 🏷️ ERROR TYPES =====
  
  static ERROR_TYPES = {
    VALIDATION: 'ValidationError',
    NOT_FOUND: 'NotFoundError',
    PERMISSION: 'PermissionError',
    NETWORK: 'NetworkError',
    DATABASE: 'DatabaseError',
    BUSINESS_RULE: 'BusinessRuleError',
    SYSTEM: 'SystemError',
    TIMEOUT: 'TimeoutError',
    RATE_LIMIT: 'RateLimitError'
  };
  
  static ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };
  
  // ===== 🎯 CUSTOM ERROR CLASSES =====
  
  /**
   * สร้าง Validation Error
   * @param {string} message - ข้อความ error
   * @param {Object} details - รายละเอียดเพิ่มเติม
   * @returns {Error} Validation error
   */
  static createValidationError(message, details = {}) {
    const error = new Error(message);
    error.name = this.ERROR_TYPES.VALIDATION;
    error.severity = this.ERROR_SEVERITY.MEDIUM;
    error.details = details;
    error.recoverable = true;
    error.userFriendly = true;
    return error;
  }
  
  /**
   * สร้าง Not Found Error
   * @param {string} resource - ทรัพยากรที่หาไม่เจอ
   * @param {string} identifier - ตัวระบุ
   * @returns {Error} Not found error
   */
  static createNotFoundError(resource, identifier) {
    const error = new Error(`${resource} ไม่พบ: ${identifier}`);
    error.name = this.ERROR_TYPES.NOT_FOUND;
    error.severity = this.ERROR_SEVERITY.MEDIUM;
    error.details = { resource, identifier };
    error.recoverable = true;
    error.userFriendly = true;
    return error;
  }
  
  /**
   * สร้าง Business Rule Error
   * @param {string} rule - กฎธุรกิจที่ถูกละเมิด
   * @param {Object} context - บริบทของข้อผิดพลาด
   * @returns {Error} Business rule error
   */
  static createBusinessRuleError(rule, context = {}) {
    const error = new Error(`กฎธุรกิจถูกละเมิด: ${rule}`);
    error.name = this.ERROR_TYPES.BUSINESS_RULE;
    error.severity = this.ERROR_SEVERITY.HIGH;
    error.details = { rule, context };
    error.recoverable = false;
    error.userFriendly = true;
    return error;
  }
  
  /**
   * สร้าง Network Error
   * @param {string} operation - การดำเนินการที่ล้มเหลว
   * @param {Object} details - รายละเอียดเครือข่าย
   * @returns {Error} Network error
   */
  static createNetworkError(operation, details = {}) {
    const error = new Error(`เครือข่ายผิดพลาดระหว่าง ${operation}`);
    error.name = this.ERROR_TYPES.NETWORK;
    error.severity = this.ERROR_SEVERITY.HIGH;
    error.details = details;
    error.recoverable = true;
    error.userFriendly = true;
    error.retryable = true;
    return error;
  }
  
  /**
   * สร้าง Database Error
   * @param {string} operation - การดำเนินการฐานข้อมูล
   * @param {Error} originalError - Error เดิม
   * @returns {Error} Database error
   */
  static createDatabaseError(operation, originalError) {
    const error = new Error(`ฐานข้อมูลผิดพลาดระหว่าง ${operation}`);
    error.name = this.ERROR_TYPES.DATABASE;
    error.severity = this.ERROR_SEVERITY.CRITICAL;
    error.details = { 
      operation, 
      originalMessage: originalError?.message,
      originalStack: originalError?.stack 
    };
    error.recoverable = false;
    error.userFriendly = false;
    return error;
  }
  
  // ===== 🔍 ERROR CLASSIFICATION =====
  
  /**
   * จำแนกประเภทของ Error
   * @param {Error} error - Error ที่ต้องการจำแนก
   * @returns {Object} ข้อมูลการจำแนก
   */
  static classifyError(error) {
    const classification = {
      type: error.name || 'UnknownError',
      severity: error.severity || this.ERROR_SEVERITY.MEDIUM,
      recoverable: error.recoverable !== undefined ? error.recoverable : true,
      userFriendly: error.userFriendly !== undefined ? error.userFriendly : false,
      retryable: error.retryable !== undefined ? error.retryable : false,
      details: error.details || {}
    };
    
    // Auto-classify based on error message patterns
    if (!error.name || error.name === 'Error') {
      const message = error.message.toLowerCase();
      
      if (message.includes('not found') || message.includes('ไม่พบ')) {
        classification.type = this.ERROR_TYPES.NOT_FOUND;
        classification.severity = this.ERROR_SEVERITY.MEDIUM;
        classification.userFriendly = true;
      } else if (message.includes('validation') || message.includes('invalid')) {
        classification.type = this.ERROR_TYPES.VALIDATION;
        classification.severity = this.ERROR_SEVERITY.MEDIUM;
        classification.userFriendly = true;
      } else if (message.includes('network') || message.includes('fetch')) {
        classification.type = this.ERROR_TYPES.NETWORK;
        classification.severity = this.ERROR_SEVERITY.HIGH;
        classification.retryable = true;
      } else if (message.includes('timeout')) {
        classification.type = this.ERROR_TYPES.TIMEOUT;
        classification.severity = this.ERROR_SEVERITY.HIGH;
        classification.retryable = true;
      } else if (message.includes('permission') || message.includes('unauthorized')) {
        classification.type = this.ERROR_TYPES.PERMISSION;
        classification.severity = this.ERROR_SEVERITY.HIGH;
        classification.recoverable = false;
      }
    }
    
    return classification;
  }
  
  // ===== 🔧 ERROR HANDLING STRATEGIES =====
  
  /**
   * จัดการ Error ด้วยกลยุทธ์ที่เหมาะสม
   * @param {Error} error - Error ที่ต้องการจัดการ
   * @param {Object} context - บริบทของการดำเนินการ
   * @returns {Object} ผลลัพธ์การจัดการ
   */
  static handleError(error, context = {}) {
    const classification = this.classifyError(error);
    const timestamp = new Date().toISOString();
    
    const result = {
      success: false,
      error: {
        type: classification.type,
        message: classification.userFriendly ? error.message : 'เกิดข้อผิดพลาดระบบ',
        severity: classification.severity,
        recoverable: classification.recoverable,
        retryable: classification.retryable,
        timestamp,
        context
      },
      originalError: error,
      classification
    };
    
    // Log error based on severity
    this.logError(error, classification, context);
    
    // Add recovery suggestions
    result.suggestions = this.getRecoverySuggestions(classification, context);
    
    // Add retry information if applicable
    if (classification.retryable) {
      result.retryInfo = {
        canRetry: true,
        suggestedDelay: this.calculateRetryDelay(context.retryCount || 0),
        maxRetries: 3
      };
    }
    
    return result;
  }
  
  /**
   * จัดการ Error แบบ Async พร้อม fallback
   * @param {Function} operation - การดำเนินการที่อาจล้มเหลว
   * @param {Object} options - ตัวเลือก (fallback, retries, context)
   * @returns {Promise<Object>} ผลลัพธ์
   */
  static async handleAsyncOperation(operation, options = {}) {
    const { fallback, maxRetries = 0, context = {}, retryDelay = 1000 } = options;
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
          attempt: attempt + 1
        };
      } catch (error) {
        lastError = error;
        const classification = this.classifyError(error);
        
        // Don't retry if not retryable or on last attempt
        if (!classification.retryable || attempt === maxRetries) {
          break;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          await this.delay(retryDelay * (attempt + 1));
        }
      }
    }
    
    // All retries failed, handle the error
    const errorResult = this.handleError(lastError, { 
      ...context, 
      retryCount: maxRetries,
      operation: operation.name || 'anonymous'
    });
    
    // Use fallback if provided
    if (fallback !== undefined) {
      return {
        success: true,
        data: typeof fallback === 'function' ? fallback(lastError) : fallback,
        usedFallback: true,
        originalError: errorResult
      };
    }
    
    return errorResult;
  }
  
  // ===== 📊 LOGGING & MONITORING =====
  
  /**
   * บันทึก Error log
   * @param {Error} error - Error ที่ต้องการบันทึก
   * @param {Object} classification - การจำแนก error
   * @param {Object} context - บริบท
   */
  static logError(error, classification, context) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: classification.type,
      severity: classification.severity,
      message: error.message,
      stack: error.stack,
      context,
      details: classification.details
    };
    
    // Log based on severity
    switch (classification.severity) {
      case this.ERROR_SEVERITY.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case this.ERROR_SEVERITY.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case this.ERROR_SEVERITY.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case this.ERROR_SEVERITY.LOW:
        console.info('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
      default:
        console.error('❓ UNKNOWN SEVERITY ERROR:', logData);
    }
    
    // Could send to external monitoring service here
    // this.sendToMonitoring(logData);
  }
  
  // ===== 💡 RECOVERY SUGGESTIONS =====
  
  /**
   * สร้างคำแนะนำการแก้ไข
   * @param {Object} classification - การจำแนก error
   * @param {Object} context - บริบท
   * @returns {string[]} คำแนะนำ
   */
  static getRecoverySuggestions(classification, context) {
    const suggestions = [];
    
    // Add context-specific suggestions if available
    if (context.operation) {
      suggestions.push(`ปัญหาเกิดขึ้นระหว่าง: ${context.operation}`);
    }
    
    switch (classification.type) {
      case this.ERROR_TYPES.VALIDATION:
        suggestions.push('ตรวจสอบข้อมูลที่ป้อนให้ถูกต้อง');
        suggestions.push('ดูรายละเอียด error เพื่อทราบฟิลด์ที่ผิดพลาด');
        break;
        
      case this.ERROR_TYPES.NOT_FOUND:
        suggestions.push('ตรวจสอบว่า ID หรือข้อมูลที่ค้นหามีอยู่จริง');
        suggestions.push('ลองรีเฟรชข้อมูลหรือค้นหาใหม่');
        break;
        
      case this.ERROR_TYPES.NETWORK:
        suggestions.push('ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        suggestions.push('ลองใหม่อีกครั้งในภายหลัง');
        suggestions.push('ติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่');
        break;
        
      case this.ERROR_TYPES.PERMISSION:
        suggestions.push('ตรวจสอบสิทธิ์การเข้าถึง');
        suggestions.push('ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์');
        break;
        
      case this.ERROR_TYPES.BUSINESS_RULE:
        suggestions.push('ตรวจสอบเงื่อนไขทางธุรกิจ');
        suggestions.push('ปรับแก้ข้อมูลให้เป็นไปตามกฎที่กำหนด');
        break;
        
      case this.ERROR_TYPES.DATABASE:
        suggestions.push('ลองใหม่อีกครั้งในภายหลัง');
        suggestions.push('ติดต่อผู้ดูแลระบบทันที');
        break;
        
      default:
        suggestions.push('ลองใหม่อีกครั้ง');
        suggestions.push('ติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่');
    }
    
    return suggestions;
  }
  
  // ===== 🔧 UTILITY METHODS =====
  
  /**
   * คำนวณเวลาหน่วงสำหรับ retry
   * @param {number} retryCount - จำนวนครั้งที่ retry แล้ว
   * @returns {number} เวลาหน่วง (ms)
   */
  static calculateRetryDelay(retryCount) {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  }
  
  /**
   * หน่วงเวลา
   * @param {number} ms - เวลาที่ต้องการหน่วง (milliseconds)
   * @returns {Promise} Promise ที่ resolve หลังจากเวลาที่กำหนด
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * สร้าง user-friendly error message
   * @param {Error} error - Error เดิม
   * @returns {string} ข้อความที่เป็นมิตรกับผู้ใช้
   */
  static getUserFriendlyMessage(error) {
    const classification = this.classifyError(error);
    
    if (classification.userFriendly) {
      return error.message;
    }
    
    // Generic user-friendly messages based on type
    const friendlyMessages = {
      [this.ERROR_TYPES.VALIDATION]: 'ข้อมูลที่ป้อนไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
      [this.ERROR_TYPES.NOT_FOUND]: 'ไม่พบข้อมูลที่ต้องการ',
      [this.ERROR_TYPES.NETWORK]: 'เกิดปัญหาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
      [this.ERROR_TYPES.PERMISSION]: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
      [this.ERROR_TYPES.BUSINESS_RULE]: 'การดำเนินการไม่เป็นไปตามเงื่อนไขที่กำหนด',
      [this.ERROR_TYPES.DATABASE]: 'เกิดปัญหาระบบฐานข้อมูล กรุณาลองใหม่ภายหลัง',
      [this.ERROR_TYPES.TIMEOUT]: 'การดำเนินการใช้เวลานานเกินไป กรุณาลองใหม่',
      [this.ERROR_TYPES.SYSTEM]: 'เกิดข้อผิดพลาดระบบ กรุณาติดต่อผู้ดูแล'
    };
    
    return friendlyMessages[classification.type] || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง';
  }
  
  /**
   * ตรวจสอบว่า Error สามารถ retry ได้หรือไม่
   * @param {Error} error - Error ที่ต้องการตรวจสอบ
   * @returns {boolean} สามารถ retry ได้หรือไม่
   */
  static isRetryable(error) {
    const classification = this.classifyError(error);
    return classification.retryable;
  }
  
  /**
   * สร้าง Error summary สำหรับ debugging
   * @param {Error} error - Error ที่ต้องการสรุป
   * @param {Object} context - บริบท
   * @returns {Object} สรุป error
   */
  static createErrorSummary(error, context = {}) {
    const classification = this.classifyError(error);
    
    return {
      timestamp: new Date().toISOString(),
      type: classification.type,
      severity: classification.severity,
      message: error.message,
      userFriendlyMessage: this.getUserFriendlyMessage(error),
      recoverable: classification.recoverable,
      retryable: classification.retryable,
      suggestions: this.getRecoverySuggestions(classification, context),
      context,
      stack: error.stack,
      details: classification.details
    };
  }
}

export default ErrorHandler; 