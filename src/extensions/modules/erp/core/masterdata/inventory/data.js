/**
 * Inventory Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Inventory
 */

import * as Schema from './schema.js'

/**
 * Inventory Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Inventory Module
 */
export const INVENTORY_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    product: {
      prefix: 'PRD',
      year: false,
      sequence: {
        digits: 6,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // PRD000001
    },
    category: {
      prefix: 'CAT',
      year: false,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // CAT001
    },
    stockMovement: {
      prefix: 'STK',
      year: true,
      month: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{month}{sequence}' // STK202510001
    },
    stockAdjustment: {
      prefix: 'ADJ',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // ADJ20250001
    },
    stockTransfer: {
      prefix: 'TRF',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // TRF20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'product',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireBarcodeGeneration: true
  }
}

// Default Values - ค่าเริ่มต้น
export const INVENTORY_DEFAULTS = {
  TYPE: Schema.INVENTORY_TYPES.FINISHED_GOODS,
  STATUS: Schema.STOCK_STATUS.AVAILABLE,
  MOVEMENT_TYPE: Schema.MOVEMENT_TYPES.RECEIVE,
  ABC_CLASS: Schema.ABC_CLASSIFICATION.C,
  XYZ_CLASS: Schema.XYZ_CLASSIFICATION.Y,
  VALUATION_METHOD: Schema.VALUATION_METHODS.WEIGHTED_AVERAGE,
  STORAGE_CONDITION: Schema.STORAGE_CONDITIONS.NORMAL,
  UNIT: Schema.INVENTORY_UNITS.PIECE,
  LOCATION_TYPE: Schema.LOCATION_TYPES.SHELF,
  CATEGORY: Schema.PRODUCT_CATEGORIES.GENERAL,
  TRANSACTION_STATUS: Schema.TRANSACTION_STATUS.PENDING,
  PRIORITY: Schema.PRIORITY_LEVELS.NORMAL,
  QUALITY_STATUS: Schema.QUALITY_STATUS.PENDING,
  BATCH_STATUS: Schema.BATCH_STATUS.ACTIVE,
  SUPPLIER_RATING: Schema.SUPPLIER_RATING.GOOD,
  MIN_STOCK: 10,
  MAX_STOCK: 1000,
  REORDER_POINT: 50,
  SAFETY_STOCK: 20,
  LEAD_TIME_DAYS: 7,
  SHELF_LIFE_DAYS: 365,
  COST_PER_UNIT: 0,
  IS_ACTIVE: true,
  TRACK_SERIAL: false,
  TRACK_BATCH: false,
  ALLOW_NEGATIVE: false
}

// Validation Rules - กฎการตรวจสอบ
export const INVENTORY_VALIDATION_RULES = {
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999999,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 999999,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_SKU_LENGTH: 50,
  MAX_NAME_LENGTH: 200,
  REQUIRED_FIELDS: {
    [Schema.TRANSACTION_STATUS.PENDING]: ['sku', 'product_name', 'unit'],
    [Schema.TRANSACTION_STATUS.APPROVED]: ['sku', 'product_name', 'unit', 'location'],
    [Schema.TRANSACTION_STATUS.COMPLETED]: ['sku', 'product_name', 'unit', 'location', 'quantity']
  }
}

// Cost Calculations - การคำนวณต้นทุน
export const COST_CALCULATIONS = {
  CARRYING_COST_RATE: 0.15, // 15% per year
  ORDERING_COST: 50, // Cost per order
  SHORTAGE_COST_MULTIPLIER: 2, // 2x unit cost
  OBSOLESCENCE_RATE: 0.05, // 5% per year
  DAMAGE_RATE: 0.02 // 2% per year
}

// Performance Metrics - เมตริกส์ประสิทธิภาพ
export const PERFORMANCE_METRICS = {
  TARGET_INVENTORY_TURNOVER: 12, // times per year
  TARGET_STOCKOUT_RATE: 0.02, // 2%
  TARGET_ACCURACY: 0.995, // 99.5%
  TARGET_FILL_RATE: 0.98, // 98%
  MAX_CYCLE_COUNT_VARIANCE: 0.01 // 1%
}

// Form Field Options - ตัวเลือกสำหรับฟอร์ม
export const INVENTORY_FORM_OPTIONS = {
  types: Object.values(Schema.INVENTORY_TYPES),
  statuses: Object.values(Schema.STOCK_STATUS),
  movementTypes: Object.values(Schema.MOVEMENT_TYPES),
  abcClasses: Object.values(Schema.ABC_CLASSIFICATION),
  xyzClasses: Object.values(Schema.XYZ_CLASSIFICATION),
  valuationMethods: Object.values(Schema.VALUATION_METHODS),
  storageConditions: Object.values(Schema.STORAGE_CONDITIONS),
  units: Object.values(Schema.INVENTORY_UNITS),
  locationTypes: Object.values(Schema.LOCATION_TYPES),
  categories: Object.values(Schema.PRODUCT_CATEGORIES),
  transactionStatuses: Object.values(Schema.TRANSACTION_STATUS),
  priorities: Object.values(Schema.PRIORITY_LEVELS),
  qualityStatuses: Object.values(Schema.QUALITY_STATUS),
  batchStatuses: Object.values(Schema.BATCH_STATUS),
  supplierRatings: Object.values(Schema.SUPPLIER_RATING)
}

// Helper Functions
export const InventoryMasterData = {
  /**
   * Get inventory type label
   */
  getInventoryTypeLabel(type) {
    const labels = {
      [Schema.INVENTORY_TYPES.RAW_MATERIAL]: 'วัตถุดิบ',
      [Schema.INVENTORY_TYPES.FINISHED_GOODS]: 'สินค้าสำเร็จรูป',
      [Schema.INVENTORY_TYPES.WORK_IN_PROGRESS]: 'สินค้าระหว่างผลิต',
      [Schema.INVENTORY_TYPES.CONSUMABLES]: 'วัสดุสิ้นเปลือง',
      [Schema.INVENTORY_TYPES.PACKAGING]: 'บรรจุภัณฑ์',
      [Schema.INVENTORY_TYPES.SPARE_PARTS]: 'ชิ้นส่วนอะไหล่',
      [Schema.INVENTORY_TYPES.TOOLS]: 'เครื่องมือ',
      [Schema.INVENTORY_TYPES.OFFICE_SUPPLIES]: 'อุปกรณ์สำนักงาน'
    }
    return labels[type] || type
  },

  /**
   * Get stock status label
   */
  getStockStatusLabel(status) {
    const labels = {
      [Schema.STOCK_STATUS.AVAILABLE]: 'พร้อมใช้',
      [Schema.STOCK_STATUS.RESERVED]: 'จอง',
      [Schema.STOCK_STATUS.ON_HOLD]: 'หยุดชั่วคราว',
      [Schema.STOCK_STATUS.QUARANTINE]: 'กักกัน',
      [Schema.STOCK_STATUS.DAMAGED]: 'เสียหาย',
      [Schema.STOCK_STATUS.EXPIRED]: 'หมดอายุ',
      [Schema.STOCK_STATUS.OUT_OF_STOCK]: 'หมดสต็อก'
    }
    return labels[status] || status
  },

  /**
   * Get movement type label
   */
  getMovementTypeLabel(type) {
    const labels = {
      [Schema.MOVEMENT_TYPES.RECEIVE]: 'รับเข้า',
      [Schema.MOVEMENT_TYPES.ISSUE]: 'เบิกออก',
      [Schema.MOVEMENT_TYPES.TRANSFER]: 'โอน',
      [Schema.MOVEMENT_TYPES.ADJUSTMENT]: 'ปรับปรุง',
      [Schema.MOVEMENT_TYPES.RETURN]: 'คืน',
      [Schema.MOVEMENT_TYPES.SCRAP]: 'ทำลาย',
      [Schema.MOVEMENT_TYPES.CYCLE_COUNT]: 'นับสต็อก'
    }
    return labels[type] || type
  },

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  calculateEOQ(annualDemand, orderingCost = COST_CALCULATIONS.ORDERING_COST, carryingCostPerUnit) {
    if (annualDemand <= 0 || carryingCostPerUnit <= 0) return 0
    
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / carryingCostPerUnit)
    return Math.round(eoq)
  },

  /**
   * Calculate Reorder Point
   */
  calculateReorderPoint(averageDemandPerDay, leadTimeDays, safetyStock = 0) {
    const reorderPoint = (averageDemandPerDay * leadTimeDays) + safetyStock
    return Math.round(reorderPoint)
  },

  /**
   * Calculate Safety Stock
   */
  calculateSafetyStock(maxDemand, averageDemand, maxLeadTime, averageLeadTime) {
    const safetyStock = (maxDemand * maxLeadTime) - (averageDemand * averageLeadTime)
    return Math.max(0, Math.round(safetyStock))
  },

  /**
   * Calculate ABC Classification based on value
   */
  calculateABCClassification(items) {
    // Sort by annual value (quantity * unit_cost)
    const sortedItems = items
      .map(item => ({
        ...item,
        annualValue: (item.annual_usage || 0) * (item.unit_cost || 0)
      }))
      .sort((a, b) => b.annualValue - a.annualValue)
    
    const totalValue = sortedItems.reduce((sum, item) => sum + item.annualValue, 0)
    let cumulativeValue = 0
    
    return sortedItems.map(item => {
      cumulativeValue += item.annualValue
      const percentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0
      
      let classification
      if (percentage <= 80) classification = Schema.ABC_CLASSIFICATION.A
      else if (percentage <= 95) classification = Schema.ABC_CLASSIFICATION.B
      else classification = Schema.ABC_CLASSIFICATION.C
      
      return {
        ...item,
        abc_classification: classification,
        cumulative_percentage: Math.round(percentage * 100) / 100
      }
    })
  },

  /**
   * Calculate Inventory Turnover
   */
  calculateInventoryTurnover(costOfGoodsSold, averageInventoryValue) {
    if (averageInventoryValue <= 0) return 0
    return Math.round((costOfGoodsSold / averageInventoryValue) * 100) / 100
  },

  /**
   * Calculate Days Sales Outstanding (DSO)
   */
  calculateDaysSalesOutstanding(averageInventoryValue, costOfGoodsSold) {
    if (costOfGoodsSold <= 0) return 0
    return Math.round((averageInventoryValue / costOfGoodsSold) * 365)
  },

  /**
   * Calculate Carrying Cost
   */
  calculateCarryingCost(averageInventoryValue, carryingCostRate = COST_CALCULATIONS.CARRYING_COST_RATE) {
    return Math.round(averageInventoryValue * carryingCostRate * 100) / 100
  },

  /**
   * Validate inventory data
   */
  validateInventoryData(data, status = Schema.TRANSACTION_STATUS.PENDING) {
    const errors = []
    const rules = INVENTORY_VALIDATION_RULES
    const requiredFields = rules.REQUIRED_FIELDS[status] || []
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Field '${field}' is required for status '${status}'`)
      }
    })
    
    // Validate quantities
    if (data.quantity && (data.quantity < rules.MIN_QUANTITY || data.quantity > rules.MAX_QUANTITY)) {
      errors.push(`Quantity must be between ${rules.MIN_QUANTITY} and ${rules.MAX_QUANTITY}`)
    }
    
    // Validate prices
    if (data.unit_price && (data.unit_price < rules.MIN_PRICE || data.unit_price > rules.MAX_PRICE)) {
      errors.push(`Unit price must be between ${rules.MIN_PRICE} and ${rules.MAX_PRICE}`)
    }
    
    // Validate SKU length
    if (data.sku && data.sku.length > rules.MAX_SKU_LENGTH) {
      errors.push(`SKU cannot exceed ${rules.MAX_SKU_LENGTH} characters`)
    }
    
    // Validate product name length
    if (data.product_name && data.product_name.length > rules.MAX_NAME_LENGTH) {
      errors.push(`Product name cannot exceed ${rules.MAX_NAME_LENGTH} characters`)
    }
    
    // Validate description length
    if (data.description && data.description.length > rules.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${rules.MAX_DESCRIPTION_LENGTH} characters`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Generate inventory transaction number
   */
  generateTransactionNumber(type = Schema.MOVEMENT_TYPES.RECEIVE, sequence = 1) {
    const typePrefix = {
      [Schema.MOVEMENT_TYPES.RECEIVE]: 'RCV',
      [Schema.MOVEMENT_TYPES.ISSUE]: 'ISS',
      [Schema.MOVEMENT_TYPES.TRANSFER]: 'TRF',
      [Schema.MOVEMENT_TYPES.ADJUSTMENT]: 'ADJ',
      [Schema.MOVEMENT_TYPES.RETURN]: 'RTN',
      [Schema.MOVEMENT_TYPES.SCRAP]: 'SCR',
      [Schema.MOVEMENT_TYPES.CYCLE_COUNT]: 'CNT'
    }
    
    const prefix = typePrefix[type] || 'INV'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const seqStr = sequence.toString().padStart(4, '0')
    
    return `${prefix}-${date}-${seqStr}`
  },

  /**
   * Get stock alert level
   */
  getStockAlertLevel(currentStock, minStock, maxStock) {
    const minRatio = currentStock / minStock
    const maxRatio = currentStock / maxStock
    
    if (currentStock <= 0) return 'out_of_stock'
    if (minRatio <= 0.5) return 'critical'
    if (minRatio <= 1) return 'low'
    if (maxRatio >= 1.2) return 'overstock'
    return 'normal'
  },

  /**
   * Calculate inventory metrics
   */
  calculateInventoryMetrics(items) {
    const totalItems = items.length
    const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_cost || 0)), 0)
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const avgUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0
    
    // Stock levels
    const outOfStock = items.filter(item => (item.quantity || 0) <= 0).length
    const lowStock = items.filter(item => {
      const qty = item.quantity || 0
      const min = item.min_stock || 0
      return qty > 0 && qty <= min
    }).length
    const overstock = items.filter(item => {
      const qty = item.quantity || 0
      const max = item.max_stock || 1000
      return qty > max * 1.2
    }).length
    
    // ABC distribution
    const abcDistribution = {
      A: items.filter(item => item.abc_classification === Schema.ABC_CLASSIFICATION.A).length,
      B: items.filter(item => item.abc_classification === Schema.ABC_CLASSIFICATION.B).length,
      C: items.filter(item => item.abc_classification === Schema.ABC_CLASSIFICATION.C).length
    }
    
    return {
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      totalQuantity,
      avgUnitCost: Math.round(avgUnitCost * 100) / 100,
      stockLevels: {
        outOfStock,
        lowStock,
        overstock,
        normal: totalItems - outOfStock - lowStock - overstock
      },
      abcDistribution,
      stockoutRate: totalItems > 0 ? Math.round((outOfStock / totalItems) * 10000) / 100 : 0,
      overstockRate: totalItems > 0 ? Math.round((overstock / totalItems) * 10000) / 100 : 0
    }
  }
}

/**
 * Format function for Inventory/Product
 * ฟังก์ชันจัดรูปแบบข้อมูลสำหรับสินค้า
 */
export function format(data) {
  console.log('🔧 [Inventory/format] กำลังจัดรูปแบบข้อมูลสินค้า:', data)
  
  try {
    const formatted = {
      // Basic Information
      sku: data.sku || '',
      product_name: data.product_name || '',
      description: data.description || data.product_name || '',
      unit: data.unit || INVENTORY_DEFAULTS.UNIT,
      unit_price: parseFloat(data.unit_price) || 0,
      min_stock: parseInt(data.min_stock) || INVENTORY_DEFAULTS.MIN_STOCK,
      category: data.category || INVENTORY_DEFAULTS.CATEGORY,
      supplier: data.supplier || 'Manual Entry',
      
      // System fields
      status: data.status || INVENTORY_DEFAULTS.STATUS,
      subtype: data.subtype || 'product_master',
      
      // For stock items
      quantity: parseInt(data.quantity) || 0,
      location: data.location || '',
      
      // Initial quantity for new products
      initial_quantity: parseInt(data.initial_quantity) || 0,
      
      // Timestamps
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.created_by || '',
      updated_by: data.updated_by || ''
    }
    
    console.log('✅ [Inventory/format] จัดรูปแบบเสร็จสิ้น:', formatted)
    return formatted
  } catch (error) {
    console.error('❌ [Inventory/format] เกิดข้อผิดพลาด:', error)
    throw error
  }
}

/**
 * Validate function for Inventory/Product
 * ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลสินค้า
 */
export function validate(data) {
  console.log('🔍 [Inventory/validate] กำลังตรวจสอบข้อมูลสินค้า:', data)
  
  const errors = []
  
  try {
    // SKU validation
    if (!data.sku || data.sku.trim() === '') {
      errors.push('กรุณาระบุรหัส SKU')
    } else if (!/^[A-Z0-9-._]+$/.test(data.sku.trim())) {
      errors.push('รหัส SKU ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ -._  เท่านั้น')
    }
    
    // Product name validation
    if (!data.product_name || data.product_name.trim() === '') {
      errors.push('กรุณาระบุชื่อสินค้า')
    } else {
      const nameLength = data.product_name.trim().length
      if (nameLength < 1) {
        errors.push('ชื่อสินค้าต้องมีความยาวอย่างน้อย 1 ตัวอักษร')
      } else if (nameLength > INVENTORY_VALIDATION_RULES.MAX_NAME_LENGTH) {
        errors.push('ชื่อสินค้าต้องมีความยาวไม่เกิน ' + INVENTORY_VALIDATION_RULES.MAX_NAME_LENGTH + ' ตัวอักษร')
      }
    }
    
    // Unit price validation
    const unitPrice = parseFloat(data.unit_price) || 0
    if (unitPrice < 0) {
      errors.push('ราคาต่อหน่วยต้องไม่น้อยกว่า 0')
    } else if (unitPrice > INVENTORY_VALIDATION_RULES.MAX_PRICE) {
      errors.push('ราคาต่อหน่วยต้องไม่เกิน ' + INVENTORY_VALIDATION_RULES.MAX_PRICE.toLocaleString())
    }
    
    // Min stock validation
    const minStock = parseInt(data.min_stock) || 0
    if (minStock < 0) {
      errors.push('สต็อกขั้นต่ำต้องไม่น้อยกว่า 0')
    }
    
    // Initial quantity validation (for new products)
    if (data.initial_quantity !== undefined) {
      const initialQty = parseInt(data.initial_quantity) || 0
      if (initialQty < 0) {
        errors.push('จำนวนเริ่มต้นต้องไม่น้อยกว่า 0')
      } else if (initialQty > INVENTORY_VALIDATION_RULES.MAX_QUANTITY) {
        errors.push('จำนวนเริ่มต้นต้องไม่เกิน ' + INVENTORY_VALIDATION_RULES.MAX_QUANTITY.toLocaleString())
      }
      
      // Location validation (required if initial quantity > 0)
      if (initialQty > 0 && (!data.location || data.location.trim() === '')) {
        errors.push('กรุณาเลือกตำแหน่งเก็บสำหรับจำนวนเริ่มต้น')
      }
    }
    
    const result = {
      isValid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? format(data) : null
    }
    
    console.log('✅ [Inventory/validate] ผลการตรวจสอบ:', result)
    return result
    
  } catch (error) {
    console.error('❌ [Inventory/validate] เกิดข้อผิดพลาดในการตรวจสอบ:', error)
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
  INVENTORY_DEFAULTS,
  INVENTORY_VALIDATION_RULES,
  COST_CALCULATIONS,
  PERFORMANCE_METRICS,
  INVENTORY_FORM_OPTIONS,
  InventoryMasterData,
  format,
  validate
}