/**
 * Product Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบสินค้า
 */

import * as Schema from './schema.js'

/**
 * Product Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Product Module
 */
export const PRODUCT_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    product: {
      prefix: 'FB',
      year: false,
      sequence: {
        digits: 6,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // PRD000001
    },
    productCode: {
      prefix: 'PC',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PC20250001
    },
    bundle: {
      prefix: 'BND',
      year: false,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // BND0001
    },
    variant: {
      prefix: 'VAR',
      year: false,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // VAR00001
    },
    barcode: {
      prefix: 'BC',
      year: false,
      sequence: {
        digits: 10,
        start: 1000000001,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // BC1000000001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'product',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireBarcodeGeneration: false,
    autoGenerateVariants: true
  }
}

// Default Values - ค่าเริ่มต้น
export const PRODUCT_DEFAULTS = {
  TYPE: Schema.PRODUCT_TYPES.PHYSICAL,
  STATUS: Schema.PRODUCT_STATUS.DRAFT,
  CATEGORY: Schema.PRODUCT_CATEGORIES.GENERAL,
  UNIT: Schema.PRODUCT_UNITS.PIECE,
  TAX_TYPE: Schema.TAX_TYPES.VAT_7,
  PRICE_TYPE: Schema.PRICE_TYPES.FIXED,
  INVENTORY_TRACKING: Schema.INVENTORY_TRACKING.QUANTITY,
  LIFECYCLE: Schema.PRODUCT_LIFECYCLE.INTRODUCTION,
  QUALITY_GRADE: Schema.QUALITY_GRADES.STANDARD,
  STORAGE_CONDITION: Schema.STORAGE_CONDITIONS.NORMAL,
  TRANSACTION_STATUS: Schema.TRANSACTION_STATUS.DRAFT,
  PRIORITY: Schema.PRIORITY_LEVELS.NORMAL,
  COST_PER_UNIT: 0,
  SELLING_PRICE: 0,
  MIN_STOCK: 0,
  MAX_STOCK: 1000,
  REORDER_POINT: 10,
  LEAD_TIME_DAYS: 7,
  SHELF_LIFE_DAYS: 0,
  IS_ACTIVE: true,
  IS_SELLABLE: true,
  IS_PURCHASABLE: true,
  TRACK_INVENTORY: true,
  ALLOW_NEGATIVE: false,
  HAS_VARIANTS: false,
  IS_SERIALIZED: false,
  IS_BATCH_TRACKED: false
}

// Validation Rules - กฎการตรวจสอบ
export const PRODUCT_VALIDATION_RULES = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_COST: 0,
  MAX_COST: 999999999,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 999999,
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999999,
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_SKU_LENGTH: 50,
  MAX_BARCODE_LENGTH: 50,
  MIN_NAME_LENGTH: 1,
  REQUIRED_FIELDS: {
    [Schema.TRANSACTION_STATUS.DRAFT]: ['name', 'unit'],
    [Schema.TRANSACTION_STATUS.PENDING]: ['name', 'unit', 'category'],
    [Schema.TRANSACTION_STATUS.APPROVED]: ['name', 'unit', 'category', 'selling_price'],
    [Schema.TRANSACTION_STATUS.COMPLETED]: ['name', 'unit', 'category', 'selling_price', 'cost_per_unit']
  }
}

// Form Field Options - ตัวเลือกสำหรับฟอร์ม
export const PRODUCT_FORM_OPTIONS = {
  types: Object.values(Schema.PRODUCT_TYPES),
  statuses: Object.values(Schema.PRODUCT_STATUS),
  categories: Object.values(Schema.PRODUCT_CATEGORIES),
  units: Object.values(Schema.PRODUCT_UNITS),
  taxTypes: Object.values(Schema.TAX_TYPES),
  priceTypes: Object.values(Schema.PRICE_TYPES),
  inventoryTracking: Object.values(Schema.INVENTORY_TRACKING),
  lifecycles: Object.values(Schema.PRODUCT_LIFECYCLE),
  qualityGrades: Object.values(Schema.QUALITY_GRADES),
  storageConditions: Object.values(Schema.STORAGE_CONDITIONS),
  transactionStatuses: Object.values(Schema.TRANSACTION_STATUS),
  priorities: Object.values(Schema.PRIORITY_LEVELS)
}

// Helper Functions
export const ProductMasterData = {
  /**
   * Get product type label
   */
  getProductTypeLabel(type) {
    const labels = {
      [Schema.PRODUCT_TYPES.PHYSICAL]: 'สินค้าจริง',
      [Schema.PRODUCT_TYPES.DIGITAL]: 'สินค้าดิจิทัล',
      [Schema.PRODUCT_TYPES.SERVICE]: 'บริการ',
      [Schema.PRODUCT_TYPES.BUNDLE]: 'ชุดสินค้า',
      [Schema.PRODUCT_TYPES.VIRTUAL]: 'สินค้าเสมือน',
      [Schema.PRODUCT_TYPES.SUBSCRIPTION]: 'สินค้าแบบสมาชิก'
    }
    return labels[type] || type
  },

  /**
   * Get product status label
   */
  getProductStatusLabel(status) {
    const labels = {
      [Schema.PRODUCT_STATUS.DRAFT]: 'ร่าง',
      [Schema.PRODUCT_STATUS.ACTIVE]: 'ใช้งาน',
      [Schema.PRODUCT_STATUS.INACTIVE]: 'หยุดใช้งาน',
      [Schema.PRODUCT_STATUS.DISCONTINUED]: 'หยุดผลิต',
      [Schema.PRODUCT_STATUS.ARCHIVED]: 'เก็บถาวร'
    }
    return labels[status] || status
  },

  /**
   * Get category label
   */
  getCategoryLabel(category) {
    const labels = {
      [Schema.PRODUCT_CATEGORIES.ELECTRONICS]: 'อิเล็กทรอนิกส์',
      [Schema.PRODUCT_CATEGORIES.CLOTHING]: 'เสื้อผ้า',
      [Schema.PRODUCT_CATEGORIES.FOOD]: 'อาหาร',
      [Schema.PRODUCT_CATEGORIES.BOOKS]: 'หนังสือ',
      [Schema.PRODUCT_CATEGORIES.HOME]: 'ของใช้ในบ้าน',
      [Schema.PRODUCT_CATEGORIES.BEAUTY]: 'ความงาม',
      [Schema.PRODUCT_CATEGORIES.SPORTS]: 'กีฬา',
      [Schema.PRODUCT_CATEGORIES.AUTOMOTIVE]: 'ยานยนต์',
      [Schema.PRODUCT_CATEGORIES.HEALTH]: 'สุขภาพ',
      [Schema.PRODUCT_CATEGORIES.GENERAL]: 'ทั่วไป'
    }
    return labels[category] || category
  },

  /**
   * Get unit label
   */
  getUnitLabel(unit) {
    const labels = {
      [Schema.PRODUCT_UNITS.PIECE]: 'ชิ้น',
      [Schema.PRODUCT_UNITS.KILOGRAM]: 'กิโลกรัม',
      [Schema.PRODUCT_UNITS.GRAM]: 'กรัม',
      [Schema.PRODUCT_UNITS.LITER]: 'ลิตร',
      [Schema.PRODUCT_UNITS.MILLILITER]: 'มิลลิลิตร',
      [Schema.PRODUCT_UNITS.METER]: 'เมตร',
      [Schema.PRODUCT_UNITS.CENTIMETER]: 'เซนติเมตร',
      [Schema.PRODUCT_UNITS.SQUARE_METER]: 'ตารางเมตร',
      [Schema.PRODUCT_UNITS.CUBIC_METER]: 'ลูกบาศก์เมตร',
      [Schema.PRODUCT_UNITS.BOX]: 'กล่อง',
      [Schema.PRODUCT_UNITS.PACK]: 'แพ็ค',
      [Schema.PRODUCT_UNITS.DOZEN]: 'โหล',
      [Schema.PRODUCT_UNITS.SET]: 'ชุด',
      [Schema.PRODUCT_UNITS.PAIR]: 'คู่',
      [Schema.PRODUCT_UNITS.ROLL]: 'ม้วน',
      [Schema.PRODUCT_UNITS.BOTTLE]: 'ขวด',
      [Schema.PRODUCT_UNITS.CAN]: 'กระป็อง',
      [Schema.PRODUCT_UNITS.BAG]: 'ถุง',
      [Schema.PRODUCT_UNITS.HOUR]: 'ชั่วโมง',
      [Schema.PRODUCT_UNITS.DAY]: 'วัน',
      [Schema.PRODUCT_UNITS.MONTH]: 'เดือน',
      [Schema.PRODUCT_UNITS.YEAR]: 'ปี'
    }
    return labels[unit] || unit
  },

  /**
   * Calculate product profitability
   */
  calculateProfitability(sellingPrice, costPrice) {
    if (costPrice <= 0) return { margin: 0, markup: 0 }
    
    const profit = sellingPrice - costPrice
    const margin = (profit / sellingPrice) * 100
    const markup = (profit / costPrice) * 100
    
    return {
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      markup: Math.round(markup * 100) / 100
    }
  },

  /**
   * Calculate break-even point
   */
  calculateBreakEven(fixedCosts, variableCostPerUnit, sellingPricePerUnit) {
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit
    if (contributionMargin <= 0) return 0
    
    return Math.ceil(fixedCosts / contributionMargin)
  },

  /**
   * Calculate inventory value
   */
  calculateInventoryValue(quantity, costPerUnit) {
    // Simple calculation - can be extended for FIFO, LIFO, Weighted Average
    return Math.round(quantity * costPerUnit * 100) / 100
  },

  /**
   * Generate product suggestions
   */
  generateProductSuggestions(category) {
    // This would typically connect to a recommendation engine
    const suggestions = {
      [Schema.PRODUCT_CATEGORIES.ELECTRONICS]: ['สมาร์ทโฟน', 'แท็บเล็ต', 'หูฟัง'],
      [Schema.PRODUCT_CATEGORIES.CLOTHING]: ['เสื้อยืด', 'กางเกงยีนส์', 'รองเท้า'],
      [Schema.PRODUCT_CATEGORIES.FOOD]: ['ขนม', 'เครื่องดื่ม', 'อาหารกระป๋อง']
    }
    
    return suggestions[category] || []
  },

  /**
   * Validate product data
   */
  validateProductData(data, status = Schema.TRANSACTION_STATUS.DRAFT) {
    const errors = []
    const rules = PRODUCT_VALIDATION_RULES
    const requiredFields = rules.REQUIRED_FIELDS[status] || []
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`Field '${field}' is required for status '${status}'`)
      }
    })
    
    // Validate name length
    if (data.name) {
      if (data.name.length < rules.MIN_NAME_LENGTH) {
        errors.push(`Product name must be at least ${rules.MIN_NAME_LENGTH} character`)
      }
      if (data.name.length > rules.MAX_NAME_LENGTH) {
        errors.push(`Product name cannot exceed ${rules.MAX_NAME_LENGTH} characters`)
      }
    }
    
    // Validate prices
    if (data.selling_price !== undefined) {
      const price = parseFloat(data.selling_price) || 0
      if (price < rules.MIN_PRICE || price > rules.MAX_PRICE) {
        errors.push(`Selling price must be between ${rules.MIN_PRICE} and ${rules.MAX_PRICE.toLocaleString()}`)
      }
    }
    
    if (data.cost_per_unit !== undefined) {
      const cost = parseFloat(data.cost_per_unit) || 0
      if (cost < rules.MIN_COST || cost > rules.MAX_COST) {
        errors.push(`Cost per unit must be between ${rules.MIN_COST} and ${rules.MAX_COST.toLocaleString()}`)
      }
    }
    
    // Validate SKU length
    if (data.sku && data.sku.length > rules.MAX_SKU_LENGTH) {
      errors.push(`SKU cannot exceed ${rules.MAX_SKU_LENGTH} characters`)
    }
    
    // Validate description length
    if (data.description && data.description.length > rules.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${rules.MAX_DESCRIPTION_LENGTH} characters`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Format function for Product
 * ฟังก์ชันจัดรูปแบบข้อมูลสำหรับสินค้า
 */
export function format(data) {
  console.log('🔧 [Product/format] กำลังจัดรูปแบบข้อมูลสินค้า:', data)
  
  try {
    const formatted = {
      // System fields (ที่ระบบใช้ในการตรวจสอบ)
      subtype: data.subtype || 'product_master',
      product_code: data.product_code || data.sku || '',
      sku: data.sku || '',
      product_name: data.product_name || data.name || '',
      description: data.description || data.product_name || data.name || '',
      unit: data.unit || PRODUCT_DEFAULTS.UNIT,
      unit_price: parseFloat(data.unit_price || data.selling_price) || PRODUCT_DEFAULTS.SELLING_PRICE,
      min_stock: parseInt(data.min_stock) || PRODUCT_DEFAULTS.MIN_STOCK,
      category: data.category || PRODUCT_DEFAULTS.CATEGORY,
      supplier: data.supplier || '',
      updated_date: data.updated_date || new Date().toISOString(),
      version: data.version || 1,
      
      // Basic Information (เดิม)
      name: data.name || data.product_name || '',
      barcode: data.barcode || '',
      
      // Classification
      type: data.type || PRODUCT_DEFAULTS.TYPE,
      
      // Pricing (รองรับทั้ง field เดิมและใหม่)
      cost_per_unit: parseFloat(data.cost_per_unit) || PRODUCT_DEFAULTS.COST_PER_UNIT,
      selling_price: parseFloat(data.selling_price || data.unit_price) || PRODUCT_DEFAULTS.SELLING_PRICE,
      tax_type: data.tax_type || PRODUCT_DEFAULTS.TAX_TYPE,
      price_type: data.price_type || PRODUCT_DEFAULTS.PRICE_TYPE,
      
      // Inventory (รวม min_stock ไว้ข้างบนแล้ว)
      track_inventory: data.track_inventory !== undefined ? data.track_inventory : PRODUCT_DEFAULTS.TRACK_INVENTORY,
      inventory_tracking: data.inventory_tracking || PRODUCT_DEFAULTS.INVENTORY_TRACKING,
      max_stock: parseInt(data.max_stock) || PRODUCT_DEFAULTS.MAX_STOCK,
      reorder_point: parseInt(data.reorder_point) || PRODUCT_DEFAULTS.REORDER_POINT,
      quantity: parseInt(data.quantity || data.initial_quantity) || 0,
      
      // Properties
      weight: parseFloat(data.weight) || 0,
      dimensions: data.dimensions || '',
      quality_grade: data.quality_grade || PRODUCT_DEFAULTS.QUALITY_GRADE,
      storage_condition: data.storage_condition || PRODUCT_DEFAULTS.STORAGE_CONDITION,
      shelf_life_days: parseInt(data.shelf_life_days) || PRODUCT_DEFAULTS.SHELF_LIFE_DAYS,
      lead_time_days: parseInt(data.lead_time_days) || PRODUCT_DEFAULTS.LEAD_TIME_DAYS,
      
      // Flags
      is_active: data.is_active !== undefined ? data.is_active : PRODUCT_DEFAULTS.IS_ACTIVE,
      is_sellable: data.is_sellable !== undefined ? data.is_sellable : PRODUCT_DEFAULTS.IS_SELLABLE,
      is_purchasable: data.is_purchasable !== undefined ? data.is_purchasable : PRODUCT_DEFAULTS.IS_PURCHASABLE,
      allow_negative: data.allow_negative !== undefined ? data.allow_negative : PRODUCT_DEFAULTS.ALLOW_NEGATIVE,
      has_variants: data.has_variants !== undefined ? data.has_variants : PRODUCT_DEFAULTS.HAS_VARIANTS,
      is_serialized: data.is_serialized !== undefined ? data.is_serialized : PRODUCT_DEFAULTS.IS_SERIALIZED,
      is_batch_tracked: data.is_batch_tracked !== undefined ? data.is_batch_tracked : PRODUCT_DEFAULTS.IS_BATCH_TRACKED,
      
      // System fields (เอา status ออกจากที่ซ้ำ)
      lifecycle: data.lifecycle || PRODUCT_DEFAULTS.LIFECYCLE,
      priority: data.priority || PRODUCT_DEFAULTS.PRIORITY,
      status: data.status || PRODUCT_DEFAULTS.STATUS,
      
      // Metadata
      tags: data.tags || [],
      notes: data.notes || '',
      
      // Timestamps (รองรับทั้ง field เดิมและใหม่)  
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      created_by: data.created_by || '',
      updated_by: data.updated_by || '',
      
      // Optional fields (ไม่บังคับ)
      id: data.id,
      location: data.location
    }
    
    // Remove undefined and null values to prevent validation errors
    const cleanedFormatted = Object.fromEntries(
      Object.entries(formatted).filter(([, value]) => value !== undefined && value !== null)
    )
    
    console.log('✅ [Product/format] จัดรูปแบบเสร็จสิ้น:', cleanedFormatted)
    return cleanedFormatted
  } catch (error) {
    console.error('❌ [Product/format] เกิดข้อผิดพลาด:', error)
    throw error
  }
}

/**
 * Validate function for Product
 * ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลสินค้า
 */
export function validate(data) {
  console.log('🔍 [Product/validate] กำลังตรวจสอบข้อมูลสินค้า:', data)
  
  try {
    const validation = ProductMasterData.validateProductData(data, data.status)
    
    const result = {
      isValid: validation.isValid,
      errors: validation.errors,
      data: validation.isValid ? format(data) : null
    }
    
    console.log('✅ [Product/validate] ผลการตรวจสอบ:', result)
    return result
    
  } catch (error) {
    console.error('❌ [Product/validate] เกิดข้อผิดพลาดในการตรวจสอบ:', error)
    return {
      isValid: false,
      errors: [`เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: ${error.message}`],
      data: null
    }
  }
}

// Export everything
export default {
  ...Schema,
  PRODUCT_DEFAULTS,
  PRODUCT_VALIDATION_RULES,
  PRODUCT_FORM_OPTIONS,
  ProductMasterData,
  format,
  validate
}