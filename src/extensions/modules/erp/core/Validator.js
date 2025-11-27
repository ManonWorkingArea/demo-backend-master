/**
 * Transaction Validator
 * ตรวจสอบข้อมูลก่อน CRUD และ state transitions
 */

import { TRANSACTION_TYPES, TRANSACTION_STATES, TRANSACTION_TRANSITIONS } from './Types.js'
import { getSchema } from './Schema.js'

export class TransactionValidator {
  
  /**
   * Validate transaction data ตาม schema
   */
  static validateData(transactionType, data) {
    const errors = []
    
    // ตรวจสอบว่า transaction type ถูกต้องหรือไม่
    if (!Object.values(TRANSACTION_TYPES).includes(transactionType)) {
      errors.push(`Invalid transaction type: ${transactionType}`)
      return { isValid: false, errors }
    }

    const schema = getSchema(transactionType)
    
    // ตรวจสอบ required fields
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
        errors.push(`Field '${field}' is required`)
        continue
      }

      // ถ้าไม่มีข้อมูลและไม่ required ก็ข้าม
      if (data[field] === undefined || data[field] === null) {
        continue
      }

      // ตรวจสอบ type
      if (!this.validateFieldType(data[field], rules)) {
        errors.push(`Field '${field}' has invalid type. Expected: ${rules.type}`)
      }

      // ตรวจสอบ enum
      if (rules.enum && !rules.enum.includes(data[field])) {
        errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`)
      }

      // ตรวจสอบ min value
      if (rules.min !== undefined && typeof data[field] === 'number' && data[field] < rules.min) {
        errors.push(`Field '${field}' must be at least ${rules.min}`)
      }

      // ตรวจสอบ array items
      if (rules.type === 'array' && Array.isArray(data[field]) && rules.items) {
        data[field].forEach((item, index) => {
          const itemErrors = this.validateObjectProperties(item, rules.items.properties)
          itemErrors.forEach(error => {
            errors.push(`${field}[${index}].${error}`)
          })
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate field type
   */
  static validateFieldType(value, rules) {
    switch (rules.type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value))
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'boolean':
        return typeof value === 'boolean'
      default:
        return true
    }
  }

  /**
   * Validate object properties (สำหรับ nested objects)
   */
  static validateObjectProperties(obj, properties) {
    const errors = []
    
    for (const [field, rules] of Object.entries(properties)) {
      if (rules.required && (obj[field] === undefined || obj[field] === null || obj[field] === '')) {
        errors.push(`${field} is required`)
        continue
      }

      if (obj[field] !== undefined && obj[field] !== null) {
        if (!this.validateFieldType(obj[field], rules)) {
          errors.push(`${field} has invalid type. Expected: ${rules.type}`)
        }

        if (rules.min !== undefined && typeof obj[field] === 'number' && obj[field] < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
      }
    }

    return errors
  }

  /**
   * Validate state transition
   */
  static validateStateTransition(transactionType, currentState, newState) {
    // ตรวจสอบว่า transaction type ถูกต้อง
    if (!TRANSACTION_STATES[transactionType]) {
      return {
        isValid: false,
        error: `Invalid transaction type: ${transactionType}`
      }
    }

    // ตรวจสอบว่า new state อยู่ใน valid states
    if (!TRANSACTION_STATES[transactionType].includes(newState)) {
      return {
        isValid: false,
        error: `Invalid state '${newState}' for transaction type '${transactionType}'`
      }
    }

    // ตรวจสอบว่าสามารถเปลี่ยนจาก current state ไป new state ได้หรือไม่
    const allowedTransitions = TRANSACTION_TRANSITIONS[transactionType][currentState] || []
    if (!allowedTransitions.includes(newState)) {
      return {
        isValid: false,
        error: `Cannot transition from '${currentState}' to '${newState}' for transaction type '${transactionType}'`
      }
    }

    return { isValid: true }
  }

  /**
   * Validate transaction สำหรับการ create
   */
  static validateForCreate(transactionType, data) {
    return this.validateData(transactionType, data)
  }

  /**
   * Validate transaction สำหรับการ update
   */
  static validateForUpdate(transactionType, updates) {
    // สำหรับ update ไม่จำเป็นต้องมี required fields ครบ
    // แต่ field ที่มีต้องถูกต้องตาม schema
    const errors = []
    const schema = getSchema(transactionType)
    
    // ฟิลด์ที่ห้ามแก้ไข (protected fields) - แต่อนุญาตให้ system สร้าง
    const protectedFields = ['id', 'createdAt', 'createdBy', '_id', 'success', 'error', 'data', 'metadata']
    
    // ฟิลด์ที่เป็น readonly แต่อนุญาตให้ system set ได้ (ทั้ง snake_case และ camelCase)
    const systemOnlyFields = ['created_at', 'updated_at', 'approved_date', 'approved_by', 'createdAt', 'updatedAt', 'version', 'sync_status', 'approval_status']
    
    // ฟิลด์ที่ต้องกรองออก (Vue event properties, DOM properties, Form state properties)
    const ignoredFields = ['isTrusted', '_vts', 'type', 'target', 'currentTarget', 'timeStamp', 'defaultPrevented', 'returnValue', 'cancelable', 'bubbles', 'composed', 'isEdit', 'isLoading', 'isSubmitting', 'showModal']

    for (const [field, value] of Object.entries(updates)) {
      // ข้าม ignored fields
      if (ignoredFields.includes(field)) {
        continue
      }
      
      // ข้าม protected fields และแสดง warning แทน error
      if (protectedFields.includes(field)) {
        console.warn(`[TransactionValidator] Skipping protected field: ${field}`)
        continue
      }
      
      // อนุญาต system-only fields (readonly fields ที่ system สามารถ set ได้)
      if (systemOnlyFields.includes(field)) {
        console.log(`[TransactionValidator] Allowing system-only field: ${field}`)
        continue  // ข้าม validation สำหรับ system-only fields
      }
      
      if (!schema[field]) {
        errors.push(`Unknown field: ${field}`)
        continue
      }

      const rules = schema[field]

      // ตรวจสอบ type และ rules อื่น ๆ
      if (value !== undefined && value !== null) {
        if (!this.validateFieldType(value, rules)) {
          errors.push(`Field '${field}' has invalid type. Expected: ${rules.type}`)
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`)
        }

        if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
          errors.push(`Field '${field}' must be at least ${rules.min}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}