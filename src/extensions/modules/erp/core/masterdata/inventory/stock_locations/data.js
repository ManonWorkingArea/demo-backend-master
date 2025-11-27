/**
 * Stock Locations Data - Sample/Initial Data
 * ข้อมูลตัวอย่างสำหรับตำแหน่งคลัง
 */

// Helper function to generate ID
const generateId = (prefix = 'LOC') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Helper function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString()

// ✅ Initial Stock Locations Data
export const INITIAL_STOCK_LOCATIONS = [
  // Main Warehouse Locations
  {
    id: generateId('WH'),
    location_code: 'WH01',
    location_name: 'คลังสินค้าหลัก',
    location_type: 'warehouse',
    description: 'คลังสินค้าหลักสำหรับเก็บสินค้าทั่วไป',
    zone: 'A',
    capacity: '1000',
    capacity_numeric: 1000,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'normal',
    access_level: 'public',
    is_pickable: true,
    is_receivable: true,
    is_countable: true,
    allow_mixing: true,
    allow_partial: true,
    priority: 'high',
    pick_sequence: 1,
    zone_classification: 'a',
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'system',
    updated_at: getCurrentTimestamp(),  
    updated_by: 'system',
    version: 1
  },
  {
    id: generateId('WH'),
    location_code: 'WH02',
    location_name: 'คลังสินค้ารอง',
    location_type: 'warehouse',  
    description: 'คลังสินค้ารองสำหรับสินค้าที่ใช้น้อย',
    zone: 'B',
    capacity: '500',
    capacity_numeric: 500,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'normal',
    access_level: 'public',
    is_pickable: true,
    is_receivable: true,
    is_countable: true,
    allow_mixing: true,
    allow_partial: true,
    priority: 'normal',
    pick_sequence: 2,
    zone_classification: 'b',
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'system',
    updated_at: getCurrentTimestamp(),
    updated_by: 'system',
    version: 1
  },
  {
    id: generateId('QC'),
    location_code: 'QC01',
    location_name: 'พื้นที่ตรวจสอบคุณภาพ',
    location_type: 'quality_control',
    description: 'พื้นที่สำหรับตรวจสอบคุณภาพสินค้าก่อนเข้าคลัง',
    zone: 'QC',
    capacity: '100',
    capacity_numeric: 100,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'controlled_temp',
    access_level: 'restricted',
    is_pickable: false,
    is_receivable: true,
    is_countable: true,
    allow_mixing: false,
    allow_partial: true,
    priority: 'high',
    pick_sequence: 0,
    zone_classification: 'special',
    requires_certification: true,
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'system',
    updated_at: getCurrentTimestamp(),
    updated_by: 'system',
    version: 1
  },

  // Office and Special Areas
  {
    id: generateId('OFF'),
    location_code: 'OFF01',
    location_name: 'สำนักงานใหญ่',
    location_type: 'office',
    description: 'พื้นที่สำนักงานสำหรับเก็บอุปกรณ์สำนักงาน',
    zone: 'OFFICE',
    capacity: '200',
    capacity_numeric: 200,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'normal',
    access_level: 'restricted',
    is_pickable: true,
    is_receivable: true,
    is_countable: true,
    allow_mixing: true,
    allow_partial: true,
    priority: 'normal',
    pick_sequence: 10,
    zone_classification: 'c',
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'system',
    updated_at: getCurrentTimestamp(),
    updated_by: 'system',
    version: 1
  },

  // Production Areas
  {
    id: generateId('PROD'),
    location_code: 'PROD01',
    location_name: 'ห้องผลิต 1',
    location_type: 'production',
    description: 'พื้นที่ผลิตสำหรับสายการผลิตหลัก',
    zone: 'PRODUCTION',
    capacity: '50',
    capacity_numeric: 50,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'controlled_temp',
    access_level: 'authorized_only',
    is_pickable: true,
    is_receivable: true,
    is_countable: true,
    allow_mixing: false,
    allow_partial: true,
    priority: 'high',
    pick_sequence: 5,
    zone_classification: 'special',
    requires_certification: true,
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'system',
    updated_at: getCurrentTimestamp(),
    updated_by: 'system',
    version: 1
  }
]

// ✅ Location validation data
export const LOCATION_VALIDATION_RULES = {
  location_code: {
    required: true,
    pattern: /^[A-Z0-9-_]+$/,
    maxLength: 50,
    unique: true
  },
  location_name: {
    required: true,
    maxLength: 200
  },
  capacity_numeric: {
    min: 0,
    max: 999999999
  },
  current_usage: {
    min: 0
  },
  temperature_min: {
    min: -100,
    max: 100
  },
  temperature_max: {
    min: -100,
    max: 100
  },
  humidity_min: {
    min: 0,
    max: 100
  },
  humidity_max: {
    min: 0,
    max: 100
  }
}

// ✅ Helper functions for stock location data
export const StockLocationHelpers = {
  /**
   * Generate a new stock location ID
   */
  generateLocationId: (prefix = 'LOC') => generateId(prefix),

  /**
   * Create a new stock location object with default values
   */
  createDefaultLocation: (overrides = {}) => ({
    id: generateId('LOC'),
    location_code: '',
    location_name: '',
    location_type: 'warehouse',
    description: '',
    zone: '',
    capacity: '1000',
    capacity_numeric: 1000,
    capacity_unit: 'pieces',
    current_usage: 0,
    status: 'active',
    storage_condition: 'normal',
    access_level: 'public',
    is_pickable: true,
    is_receivable: true,
    is_countable: true,
    allow_mixing: true,
    allow_partial: true,
    priority: 'normal',
    zone_classification: 'b',
    subtype: 'stock_location',
    transaction_type: 'stock_location',
    state: 'active',
    active: true,
    deleted: false,
    created_at: getCurrentTimestamp(),
    created_by: 'user',
    updated_at: getCurrentTimestamp(),
    updated_by: 'user',
    version: 1,
    ...overrides
  }),

  /**
   * Validate location code format
   */
  validateLocationCode: (code) => {
    if (!code) return 'รหัสตำแหน่งจำเป็น'
    if (!/^[A-Z0-9-_]+$/.test(code)) return 'รหัสตำแหน่งต้องเป็น A-Z, 0-9, -, _ เท่านั้น'
    if (code.length > 50) return 'รหัสตำแหน่งต้องไม่เกิน 50 ตัวอักษร'
    return null
  },

  /**
   * Calculate capacity utilization percentage
   */
  calculateUtilization: (current, capacity) => {
    if (!capacity || capacity === 0) return 0
    return Math.round((current / capacity) * 100)
  },

  /**
   * Check if location is available for receiving
   */
  isAvailableForReceiving: (location) => {
    return location.status === 'active' && 
           location.is_receivable && 
           !location.deleted &&
           location.active
  },

  /**
   * Check if location is available for picking
   */
  isAvailableForPicking: (location) => {
    return location.status === 'active' && 
           location.is_pickable && 
           !location.deleted &&
           location.active &&
           location.current_usage > 0
  },

  /**
   * Get location hierarchy path
   */
  getLocationPath: (location) => {
    const parts = []
    if (location.parent_location) parts.push(location.parent_location)
    if (location.zone) parts.push(location.zone)
    if (location.aisle) parts.push(location.aisle)
    if (location.rack) parts.push(location.rack)
    if (location.shelf) parts.push(location.shelf)
    if (location.bin) parts.push(location.bin)
    parts.push(location.location_code)
    return parts.join(' > ')
  }
}

// ✅ Export everything
export default {
  INITIAL_STOCK_LOCATIONS,
  LOCATION_VALIDATION_RULES,
  StockLocationHelpers
}