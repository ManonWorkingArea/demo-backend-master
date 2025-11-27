/**
 * Code Generator Utility
 * Utility functions สำหรับสร้างรหัสในแต่ละ module
 */

/**
 * 🔢 Generate Supplier Code
 * ใช้งาน: generateSupplierCode()
 */
/**
 * Code Generation Utilities
 * ฟังก์ชันสำหรับการสร้างรหัสสำหรับแต่ละโมดูล
 */

/**
 * Get module-specific code configuration
 * @param {string} module - Module name
 * @returns {Object} Module code configuration
 */
const getModuleConfig = async (module) => {
  try {
    // Import module configuration dynamically
    const moduleData = await import(`../core/masterdata/${module}/data.js`)
    const configKey = `${module.toUpperCase()}_CODE_CONFIG`
    return moduleData[configKey] || null
  } catch (error) {
    console.warn(`Could not load config for module ${module}:`, error)
    return null
  }
}

/**
 * Generate code using module-specific configuration
 * @param {string} module - Module name (supplier, purchase, sales, etc.)
 * @param {string} pattern - Pattern name from module config
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated code
 */
export const generateModuleCode = async (module, pattern = 'default', options = {}) => {
  try {
    // Try centralized CodeManager first
    const CodeManager = window.ERP_CORE?.codeManager
    if (CodeManager) {
      return await CodeManager.generateCode(module, pattern, options)
    }

    // Fallback to module-specific configuration
    const moduleConfig = await getModuleConfig(module)
    if (moduleConfig && moduleConfig.patterns[pattern]) {
      return generateCodeFromPattern(moduleConfig.patterns[pattern], options)
    }

    // Final fallback
    return generateFallbackCode(module)
  } catch (error) {
    console.error(`Error generating ${module} code:`, error)
    return generateFallbackCode(module)
  }
}

/**
 * Generate code from pattern configuration
 * @param {Object} patternConfig - Pattern configuration
 * @param {Object} options - Additional options
 * @returns {string} Generated code
 */
const generateCodeFromPattern = (patternConfig, options = {}) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  // Get next sequence number (simplified - would need proper database integration)
  const sequence = options.sequence || 1
  const paddedSequence = String(sequence).padStart(patternConfig.sequence.digits, '0')
  
  // Build code based on format
  let code = patternConfig.format
  code = code.replace('{prefix}', patternConfig.prefix)
  
  if (patternConfig.year) {
    code = code.replace('{year}', year)
  }
  
  if (patternConfig.month) {
    code = code.replace('{month}', month)
  }
  
  code = code.replace('{sequence}', paddedSequence)
  
  return code
}

/**
 * Generate fallback code when all else fails
 * @param {string} module - Module name
 * @returns {string} Fallback code
 */
const generateFallbackCode = (module) => {
  const prefixes = {
    supplier: 'SUP',
    purchase: 'PUR',
    sales: 'SAL', 
    inventory: 'INV',
    document: 'DOC',
    delivery: 'DEL',
    payment: 'PAY',
    production: 'PRD',
    quotation: 'QUO',
    returns: 'RTN',
    workorder: 'WOR'
  }
  
  const prefix = prefixes[module] || 'GEN'
  const timestamp = Date.now().toString().slice(-4)
  return `${prefix}${new Date().getFullYear()}${timestamp}`
}

/**
 * Generate supplier code
 * @param {string} type - Supplier type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated supplier code
 */
export const generateSupplierCode = async (type = 'default', options = {}) => {
  return generateModuleCode('supplier', type, options)
}

/**
 * 🔢 Generate Product Code
 * ใช้งาน: generateProductCode()
 */
/**
 * Generate product code
 * @param {string} category - Product category or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated product code
 */
export const generateProductCode = async (category = 'product', options = {}) => {
  return generateModuleCode('inventory', category, options)
}

/**
 * Generate document code
 * @param {string} type - Document type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated document code
 */
export const generateDocumentCode = async (type = 'contract', options = {}) => {
  return generateModuleCode('document', type, options)
}

/**
 * Generate customer code
 * @param {string} type - Customer type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated customer code
 */
export const generateCustomerCode = async (type = 'customer', options = {}) => {
  return generateModuleCode('sales', type, options)
}

/**
 * Generate purchase request code
 * @param {string} type - Purchase type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated purchase code
 */
export const generatePurchaseCode = async (type = 'purchaseRequest', options = {}) => {
  return generateModuleCode('purchase', type, options)
}

/**
 * Generate delivery order code
 * @param {string} type - Delivery type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated delivery code
 */
export const generateDeliveryCode = async (type = 'deliveryOrder', options = {}) => {
  return generateModuleCode('delivery', type, options)
}

/**
 * Generate payment code
 * @param {string} type - Payment type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated payment code
 */
export const generatePaymentCode = async (type = 'payment', options = {}) => {
  return generateModuleCode('payment', type, options)
}

/**
 * Generate production order code
 * @param {string} type - Production type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated production code
 */
export const generateProductionCode = async (type = 'productionOrder', options = {}) => {
  return generateModuleCode('production', type, options)
}

/**
 * Generate quotation code
 * @param {string} type - Quotation type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated quotation code
 */
export const generateQuotationCode = async (type = 'quotation', options = {}) => {
  return generateModuleCode('quotation', type, options)
}

/**
 * Generate returns code
 * @param {string} type - Returns type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated returns code
 */
export const generateReturnsCode = async (type = 'salesReturn', options = {}) => {
  return generateModuleCode('returns', type, options)
}

/**
 * Generate work order code
 * @param {string} type - Work order type or pattern name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated work order code
 */
export const generateWorkOrderCode = async (type = 'workOrder', options = {}) => {
  return generateModuleCode('workorder', type, options)
}





/**
 * 🎛️ Get Code Pattern
 * ใช้งาน: getCodePattern('supplier')
 */
export function getCodePattern(module) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.codeManager) {
      console.warn('Code Manager not available, using default pattern')
      return null
    }

    return window.ERP_CORE.codeManager.getPattern(module)
  } catch (error) {
    console.error(`[CodeGenerator] Error getting pattern for ${module}:`, error)
    return null
  }
}

/**
 * 🎨 Generate Code Example
 * ใช้งาน: generateCodeExample('supplier')
 */
export function generateCodeExample(module) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.codeManager) {
      return null
    }

    return window.ERP_CORE.codeManager.generateExample(module)
  } catch (error) {
    console.error(`[CodeGenerator] Error generating example for ${module}:`, error)
    return null
  }
}

/**
 * ✅ Validate Code
 * ใช้งาน: validateCode('SUP20250001', 'supplier')
 */
export function validateCode(code, module) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.codeManager) {
      // Basic validation หาก Code Manager ไม่พร้อม
      return {
        isValid: /^[A-Za-z0-9\-_]+$/.test(code) && code.length >= 3 && code.length <= 50,
        error: !(/^[A-Za-z0-9\-_]+$/.test(code) && code.length >= 3 && code.length <= 50) 
          ? 'รูปแบบรหัสไม่ถูกต้อง' : null
      }
    }

    return window.ERP_CORE.codeManager.validateCode(code, module)
  } catch (error) {
    console.error(`[CodeGenerator] Error validating code ${code}:`, error)
    return { isValid: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบ' }
  }
}

/**
 * 🔄 Reset Sequence
 * ใช้งาน: resetSequence('supplier')
 */
export async function resetSequence(module) {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.codeManager) {
      throw new Error('Code Manager not available')
    }

    return await window.ERP_CORE.codeManager.resetSequence(module)
  } catch (error) {
    console.error(`[CodeGenerator] Error resetting sequence for ${module}:`, error)
    throw error
  }
}

/**
 * 📊 Get Code Manager Statistics
 * ใช้งาน: getCodeManagerStats()
 */
export function getCodeManagerStats() {
  try {
    if (!window.ERP_CORE || !window.ERP_CORE.codeManager) {
      return null
    }

    return window.ERP_CORE.codeManager.getStatistics()
  } catch (error) {
    console.error('[CodeGenerator] Error getting statistics:', error)
    return null
  }
}

// Export all functions
export default {
  generateSupplierCode,
  generateProductCode,
  generateDocumentCode,
  generateCustomerCode,
  getCodePattern,
  generateCodeExample,
  validateCode,
  resetSequence,
  getCodeManagerStats
}