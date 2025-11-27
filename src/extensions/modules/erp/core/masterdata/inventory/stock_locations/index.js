/**
 * Stock Locations Module - Main Entry Point
 * โมดูลหลักสำหรับการจัดการตำแหน่งคลัง (Stock Locations)
 */

// Import schema definitions
import {
  LOCATION_TYPES,
  LOCATION_STATUS,
  STORAGE_CONDITIONS,
  ACCESS_LEVELS,
  CAPACITY_UNITS,
  PRIORITY_LEVELS,
  ZONE_CLASSIFICATIONS,
  STOCK_LOCATION_STATES,
  STOCK_LOCATION_TRANSITIONS,
  STOCK_LOCATION_INITIAL_STATE,
  STOCK_LOCATION_STORAGE_KEY,
  STOCK_LOCATION_SCHEMA
} from './schema.js'

// Import data definitions
import {
  INITIAL_STOCK_LOCATIONS,
  LOCATION_VALIDATION_RULES,
  StockLocationHelpers
} from './data.js'

// ✅ Stock Location Transaction Type Configuration
export const STOCK_LOCATION_TRANSACTION_TYPE = {
  name: 'STOCK_LOCATION',
  key: 'stock_location',
  displayName: 'ตำแหน่งคลัง',
  description: 'ระบบจัดการตำแหน่งเก็บสินค้าในคลัง',
  
  // Schema configuration
  schema: STOCK_LOCATION_SCHEMA,
  initialState: STOCK_LOCATION_INITIAL_STATE,
  states: STOCK_LOCATION_STATES,
  transitions: STOCK_LOCATION_TRANSITIONS,
  storageKey: STOCK_LOCATION_STORAGE_KEY,
  
  // Data configuration
  initialData: INITIAL_STOCK_LOCATIONS,
  validationRules: LOCATION_VALIDATION_RULES,
  helpers: StockLocationHelpers,
  
  // UI Configuration
  ui: {
    icon: 'fas fa-map-marker-alt',
    color: '#10b981',
    listTitle: 'ตำแหน่งคลัง',
    createTitle: 'เพิ่มตำแหน่งใหม่',
    editTitle: 'แก้ไขตำแหน่ง',
    deleteTitle: 'ลบตำแหน่ง',
    
    // List view configuration
    listFields: [
      { key: 'location_code', label: 'รหัส', type: 'text', width: '120px' },
      { key: 'location_name', label: 'ชื่อตำแหน่ง', type: 'text', width: '200px' },
      { key: 'location_type', label: 'ประเภท', type: 'enum', enum: LOCATION_TYPES, width: '120px' },
      { key: 'zone', label: 'โซน', type: 'text', width: '80px' },
      { key: 'capacity', label: 'ความจุ', type: 'text', width: '100px' },
      { key: 'current_usage', label: 'ใช้งาน', type: 'number', width: '80px' },
      { key: 'status', label: 'สถานะ', type: 'enum', enum: LOCATION_STATUS, width: '100px' },
      { key: 'updated_at', label: 'แก้ไขล่าสุด', type: 'datetime', width: '140px' }
    ],
    
    // Form fields configuration
    formFields: [
      {
        section: 'ข้อมูลพื้นฐาน',
        fields: [
          { key: 'location_code', label: 'รหัสตำแหน่ง', type: 'text', required: true, placeholder: 'เช่น WH-01, ZONE-A' },
          { key: 'location_name', label: 'ชื่อตำแหน่ง', type: 'text', required: true, placeholder: 'เช่น คลังสินค้าหลัก' },
          { key: 'location_type', label: 'ประเภทตำแหน่ง', type: 'select', enum: LOCATION_TYPES, required: true },
          { key: 'description', label: 'คำอธิบาย', type: 'textarea', rows: 3 }
        ]
      },
      {
        section: 'โครงสร้างตำแหน่ง',
        fields: [
          { key: 'parent_location', label: 'ตำแหน่งหลัก', type: 'text', placeholder: 'รหัสตำแหน่งหลัก' },
          { key: 'zone', label: 'โซน', type: 'text', placeholder: 'เช่น A, B, C' },
          { key: 'aisle', label: 'ทางเดิน', type: 'text', placeholder: 'เช่น A1, B2' },
          { key: 'rack', label: 'ชั้นวาง', type: 'text', placeholder: 'เช่น R1, R2' },
          { key: 'shelf', label: 'หิ้ง', type: 'text', placeholder: 'เช่น S1, S2' },
          { key: 'bin', label: 'ช่อง', type: 'text', placeholder: 'เช่น B1, B2' }
        ]
      },
      {
        section: 'ข้อมูลความจุ',
        fields: [
          { key: 'capacity', label: 'ความจุ', type: 'text', placeholder: 'เช่น 1000 หรือ ไม่จำกัด' },
          { key: 'capacity_numeric', label: 'ความจุ (ตัวเลข)', type: 'number', min: 0 },
          { key: 'capacity_unit', label: 'หน่วยความจุ', type: 'select', enum: CAPACITY_UNITS },
          { key: 'max_weight', label: 'น้ำหนักสูงสุด (กก.)', type: 'number', min: 0 }
        ]
      },
      {
        section: 'การตั้งค่าและควบคุม',
        fields: [
          { key: 'status', label: 'สถานะ', type: 'select', enum: LOCATION_STATUS, required: true },
          { key: 'storage_condition', label: 'เงื่อนไขการเก็บ', type: 'select', enum: STORAGE_CONDITIONS },
          { key: 'access_level', label: 'ระดับการเข้าถึง', type: 'select', enum: ACCESS_LEVELS },
          { key: 'priority', label: 'ความสำคัญ', type: 'select', enum: PRIORITY_LEVELS }
        ]
      },
      {
        section: 'การอนุญาต',
        fields: [
          { key: 'is_pickable', label: 'สามารถหยิบสินค้าได้', type: 'checkbox', default: true },
          { key: 'is_receivable', label: 'สามารถรับสินค้าได้', type: 'checkbox', default: true },
          { key: 'is_countable', label: 'สามารถนับสต็อคได้', type: 'checkbox', default: true },
          { key: 'allow_mixing', label: 'อนุญาตให้เก็บสินค้าหลายประเภท', type: 'checkbox', default: true },
          { key: 'allow_partial', label: 'อนุญาตการเก็บบางส่วน', type: 'checkbox', default: true }
        ]
      },
      {
        section: 'หมายเหตุและคำแนะนำ',
        fields: [
          { key: 'notes', label: 'หมายเหตุ', type: 'textarea', rows: 3 },
          { key: 'special_instructions', label: 'คำแนะนำพิเศษ', type: 'textarea', rows: 2 },
          { key: 'hazard_warnings', label: 'คำเตือนอันตราย', type: 'textarea', rows: 2 }
        ]
      }
    ],
    
    // Filter options
    filters: [
      { key: 'location_type', label: 'ประเภท', type: 'select', enum: LOCATION_TYPES },
      { key: 'status', label: 'สถานะ', type: 'select', enum: LOCATION_STATUS },
      { key: 'zone', label: 'โซน', type: 'text' },
      { key: 'storage_condition', label: 'เงื่อนไขการเก็บ', type: 'select', enum: STORAGE_CONDITIONS }
    ],
    
    // Sort options
    sortOptions: [
      { key: 'location_code', label: 'รหัสตำแหน่ง' },
      { key: 'location_name', label: 'ชื่อตำแหน่ง' },
      { key: 'zone', label: 'โซน' },
      { key: 'capacity_numeric', label: 'ความจุ' },
      { key: 'current_usage', label: 'การใช้งาน' },
      { key: 'updated_at', label: 'วันที่แก้ไข' }
    ]
  },
  
  // Business rules
  businessRules: {
    beforeCreate: (data) => {
      // Generate ID if not provided
      if (!data.id) {
        data.id = StockLocationHelpers.generateLocationId()
      }
      
      // Validate location code
      const codeError = StockLocationHelpers.validateLocationCode(data.location_code)
      if (codeError) {
        throw new Error(codeError)
      }
      
      // Set default values
      data.subtype = 'stock_location'
      data.transaction_type = 'stock_location'
      data.current_usage = data.current_usage || 0
      data.active = data.active !== false
      data.deleted = data.deleted || false
      
      return data
    },
    
    beforeUpdate: (data, existing) => {
      // Don't allow changing location_code after creation
      if (existing.location_code && data.location_code !== existing.location_code) {
        throw new Error('ไม่สามารถเปลี่ยนรหัสตำแหน่งได้หลังจากสร้างแล้ว')
      }
      
      // Validate if location has items before status change
      if (data.status === 'inactive' && existing.current_usage > 0) {
        throw new Error('ไม่สามารถเปลี่ยนสถานะเป็นไม่ใช้งานได้ เนื่องจากยังมีสินค้าอยู่')
      }
      
      return data
    },
    
    beforeDelete: (existing) => {
      // Check if location has items
      if (existing.current_usage > 0) {
        throw new Error('ไม่สามารถลบตำแหน่งที่ยังมีสินค้าอยู่')
      }
      
      // Soft delete instead of hard delete
      return { ...existing, deleted: true, active: false, status: 'inactive' }
    }
  }
}

// ✅ Export all modules
export {
  // Schema exports
  LOCATION_TYPES,
  LOCATION_STATUS,
  STORAGE_CONDITIONS,
  ACCESS_LEVELS,
  CAPACITY_UNITS,
  PRIORITY_LEVELS,
  ZONE_CLASSIFICATIONS,
  STOCK_LOCATION_STATES,
  STOCK_LOCATION_TRANSITIONS,
  STOCK_LOCATION_INITIAL_STATE,
  STOCK_LOCATION_STORAGE_KEY,
  STOCK_LOCATION_SCHEMA,
  
  // Data exports
  INITIAL_STOCK_LOCATIONS,
  LOCATION_VALIDATION_RULES,
  StockLocationHelpers
}

// ✅ Default export
export default STOCK_LOCATION_TRANSACTION_TYPE