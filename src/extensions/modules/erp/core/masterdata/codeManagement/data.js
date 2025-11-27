/**
 * Code Management Data Functions
 * ฟังก์ชันสำหรับจัดการรหัสแบบศูนย์กลาง
 */

import {
  CODE_MODULES,
  PATTERN_COMPONENTS,
  YEAR_FORMATS,
  MONTH_FORMATS,
  DAY_FORMATS,
  RESET_PERIODS,
  DEFAULT_CODE_PATTERNS
} from './schema.js'

/**
 * 🔢 สร้างรหัสใหม่ตาม pattern ที่กำหนด
 */
export async function generateCode(module, existingRecords = []) {
  try {
    console.log(`[CodeManager] 🔢 Generating code for module: ${module}`)
    
    // ดึง pattern configuration
    const pattern = await getCodePattern(module)
    if (!pattern) {
      throw new Error(`No code pattern found for module: ${module}`)
    }
    
    // คำนวณเลขลำดับถัดไป
    const nextSequence = await calculateNextSequence(module, pattern, existingRecords)
    
    // สร้างรหัสตาม components
    const code = buildCodeFromPattern(pattern, nextSequence)
    
    console.log(`[CodeManager] ✅ Generated code: ${code}`)
    return code
    
  } catch (error) {
    console.error(`[CodeManager] ❌ Error generating code:`, error)
    // Fallback: ใช้ timestamp
    const timestamp = Date.now().toString().slice(-6)
    const prefix = getModulePrefix(module)
    return `${prefix}${timestamp}`
  }
}

/**
 * 🏗️ สร้างรหัสจาก pattern และ sequence
 */
export function buildCodeFromPattern(pattern, sequence) {
  const now = new Date()
  let result = ''
  
  for (const component of pattern.components) {
    switch (component.type) {
      case PATTERN_COMPONENTS.PREFIX:
        result += component.value
        break
        
      case PATTERN_COMPONENTS.YEAR:
        if (component.format === YEAR_FORMATS.FULL) {
          result += now.getFullYear().toString()
        } else {
          result += now.getFullYear().toString().slice(-2)
        }
        break
        
      case PATTERN_COMPONENTS.MONTH: {
        const month = now.getMonth() + 1
        if (component.format === MONTH_FORMATS.PADDED) {
          result += month.toString().padStart(2, '0')
        } else {
          result += month.toString()
        }
        break
      }
        
      case PATTERN_COMPONENTS.DAY: {
        const day = now.getDate()
        if (component.format === DAY_FORMATS.PADDED) {
          result += day.toString().padStart(2, '0')
        } else {
          result += day.toString()
        }
        break
      }
        
      case PATTERN_COMPONENTS.SEQUENCE: {
        const digits = component.format.length
        result += sequence.toString().padStart(digits, '0')
        break
      }
        
      case PATTERN_COMPONENTS.SEPARATOR:
        result += component.value
        break
        
      case PATTERN_COMPONENTS.CUSTOM:
        result += component.value
        break
        
      default:
        console.warn(`[CodeManager] Unknown component type: ${component.type}`)
    }
  }
  
  return result
}

/**
 * 🔍 คำนวณเลขลำดับถัดไป
 */
export async function calculateNextSequence(module, pattern, existingRecords) {
  const now = new Date()
  let maxSequence = 0
  
  // สร้าง regex pattern สำหรับค้นหารหัสที่มีอยู่
  const regexPattern = createRegexFromPattern(pattern, now)
  
  // หาเลขลำดับสูงสุดจากรหัสที่มีอยู่
  existingRecords.forEach(record => {
    const codeField = getCodeFieldName(module)
    const code = record[codeField]
    
    if (code) {
      const match = code.match(regexPattern)
      if (match && match.groups && match.groups.sequence) {
        const sequence = parseInt(match.groups.sequence, 10)
        if (sequence > maxSequence) {
          maxSequence = sequence
        }
      }
    }
  })
  
  // ตรวจสอบว่าต้องรีเซ็ตเลขลำดับหรือไม่
  const shouldReset = shouldResetSequence(pattern, now)
  if (shouldReset) {
    maxSequence = 0
  }
  
  return maxSequence + 1
}

/**
 * 🔄 ตรวจสอบว่าต้องรีเซ็ตเลขลำดับหรือไม่
 */
export function shouldResetSequence(pattern, currentDate) {
  if (!pattern.lastResetDate || pattern.resetPeriod === RESET_PERIODS.NEVER) {
    return false
  }
  
  const lastReset = new Date(pattern.lastResetDate)
  
  switch (pattern.resetPeriod) {
    case RESET_PERIODS.DAILY:
      return currentDate.toDateString() !== lastReset.toDateString()
      
    case RESET_PERIODS.MONTHLY:
      return currentDate.getMonth() !== lastReset.getMonth() || 
             currentDate.getFullYear() !== lastReset.getFullYear()
             
    case RESET_PERIODS.YEARLY:
      return currentDate.getFullYear() !== lastReset.getFullYear()
      
    default:
      return false
  }
}

/**
 * 🎯 สร้าง regex pattern จาก code pattern
 */
export function createRegexFromPattern(pattern, date) {
  let regexStr = ''
  
  for (const component of pattern.components) {
    switch (component.type) {
      case PATTERN_COMPONENTS.PREFIX:
        regexStr += escapeRegex(component.value)
        break
        
      case PATTERN_COMPONENTS.YEAR:
        if (component.format === YEAR_FORMATS.FULL) {
          regexStr += date.getFullYear().toString()
        } else {
          regexStr += date.getFullYear().toString().slice(-2)
        }
        break
        
      case PATTERN_COMPONENTS.MONTH: {
        const month = date.getMonth() + 1
        if (component.format === MONTH_FORMATS.PADDED) {
          regexStr += month.toString().padStart(2, '0')
        } else {
          regexStr += month.toString()
        }
        break
      }
        
      case PATTERN_COMPONENTS.DAY: {
        const day = date.getDate()
        if (component.format === DAY_FORMATS.PADDED) {
          regexStr += day.toString().padStart(2, '0')
        } else {
          regexStr += day.toString()
        }
        break
      }
        
      case PATTERN_COMPONENTS.SEQUENCE: {
        const digits = component.format.length
        regexStr += `(?<sequence>\\d{${digits}})`
        break
      }
        
      case PATTERN_COMPONENTS.SEPARATOR:
        regexStr += escapeRegex(component.value)
        break
        
      case PATTERN_COMPONENTS.CUSTOM:
        regexStr += escapeRegex(component.value)
        break
    }
  }
  
  return new RegExp(`^${regexStr}$`)
}

/**
 * 🛡️ Escape regex special characters
 */
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 🎛️ ดึง code pattern สำหรับ module
 */
export async function getCodePattern(module) {
  try {
    // ลองดึงจาก Transaction Engine ก่อน
    if (window.ERP_CORE && window.ERP_CORE.engine) {
      const result = await window.ERP_CORE.engine.list('codeManagement', {
        module: module,
        isActive: true
      })
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0]
      }
    }
    
    // ถ้าไม่มี ให้ใช้ค่าเริ่มต้น
    return DEFAULT_CODE_PATTERNS[module] || null
    
  } catch (error) {
    console.error(`[CodeManager] Error getting pattern for ${module}:`, error)
    return DEFAULT_CODE_PATTERNS[module] || null
  }
}

/**
 * 💾 บันทึก code pattern
 */
export async function saveCodePattern(patternData) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.engine) {
      throw new Error('ERP Core not available')
    }
    
    const result = await window.ERP_CORE.engine.create('codeManagement', patternData)
    return result
    
  } catch (error) {
    console.error('[CodeManager] Error saving pattern:', error)
    throw error
  }
}

/**
 * 🔧 อัปเดต code pattern
 */
export async function updateCodePattern(id, updates) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.engine) {
      throw new Error('ERP Core not available')
    }
    
    const result = await window.ERP_CORE.engine.update('codeManagement', id, updates)
    return result
    
  } catch (error) {
    console.error('[CodeManager] Error updating pattern:', error)
    throw error
  }
}

/**
 * 📋 ดึงรายการ code patterns ทั้งหมด
 */
export async function getAllCodePatterns() {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.engine) {
      return Object.values(DEFAULT_CODE_PATTERNS)
    }
    
    const result = await window.ERP_CORE.engine.list('codeManagement')
    return result.success ? result.data : Object.values(DEFAULT_CODE_PATTERNS)
    
  } catch (error) {
    console.error('[CodeManager] Error getting all patterns:', error)
    return Object.values(DEFAULT_CODE_PATTERNS)
  }
}

/**
 * 🏷️ ดึงชื่อ field ที่เก็บรหัสสำหรับแต่ละ module
 */
export function getCodeFieldName(module) {
  const fieldMapping = {
    [CODE_MODULES.SUPPLIER]: 'supplier_code',
    [CODE_MODULES.PRODUCT]: 'product_code',
    [CODE_MODULES.DOCUMENT]: 'document_code',
    [CODE_MODULES.CUSTOMER]: 'customer_code',
    [CODE_MODULES.PURCHASE]: 'purchase_code',
    [CODE_MODULES.SALES]: 'sales_code',
    [CODE_MODULES.INVENTORY]: 'inventory_code'
  }
  
  return fieldMapping[module] || 'code'
}

/**
 * 🎯 ดึง prefix เริ่มต้นสำหรับ module
 */
export function getModulePrefix(module) {
  const prefixMapping = {
    [CODE_MODULES.SUPPLIER]: 'SUP',
    [CODE_MODULES.PRODUCT]: 'PRD',
    [CODE_MODULES.DOCUMENT]: 'DOC',
    [CODE_MODULES.CUSTOMER]: 'CUS',
    [CODE_MODULES.PURCHASE]: 'PUR',
    [CODE_MODULES.SALES]: 'SAL',
    [CODE_MODULES.INVENTORY]: 'INV'
  }
  
  return prefixMapping[module] || 'GEN'
}

/**
 * ✅ ตรวจสอบความถูกต้องของรหัส
 */
export function validateCode(code) {
  try {
    // ตรวจสอบพื้นฐาน
    if (!code || typeof code !== 'string') {
      return { isValid: false, error: 'รหัสไม่ถูกต้อง' }
    }
    
    // ตรวจสอบความยาว
    if (code.length < 3 || code.length > 50) {
      return { isValid: false, error: 'ความยาวรหัสไม่ถูกต้อง' }
    }
    
    // ตรวจสอบรูปแบบพื้นฐาน (ตัวอักษรและตัวเลขเท่านั้น)
    if (!/^[A-Za-z0-9\-_]+$/.test(code)) {
      return { isValid: false, error: 'รหัสสามารถใช้ตัวอักษร ตัวเลข และเครื่องหมาย - _ เท่านั้น' }
    }
    
    return { isValid: true }
    
  } catch (error) {
    return { isValid: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบรหัส' }
  }
}

/**
 * 🎨 สร้างตัวอย่างรหัสจาก pattern
 */
export function generateCodeExample(pattern) {
  const mockSequence = 1
  
  return buildCodeFromPattern(pattern, mockSequence)
}

/**
 * 🔄 รีเซ็ตเลขลำดับ
 */
export async function resetSequence(module) {
  try {
    const pattern = await getCodePattern(module)
    if (!pattern) {
      throw new Error(`Pattern not found for module: ${module}`)
    }
    
    const updates = {
      currentSequence: 0,
      lastResetDate: new Date().toISOString()
    }
    
    if (pattern.id) {
      return await updateCodePattern(pattern.id, updates)
    } else {
      throw new Error('Cannot reset sequence for default pattern')
    }
    
  } catch (error) {
    console.error(`[CodeManager] Error resetting sequence for ${module}:`, error)
    throw error
  }
}