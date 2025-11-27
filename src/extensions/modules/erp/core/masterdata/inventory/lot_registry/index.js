/**
 * Lot Registry Module - Main Entry Point
 * โมดูลหลักสำหรับการจัดการ Lot Registry สิ่งทอ
 */

// Import schema definitions
import {
  LOT_STATUS,
  LOT_OPERATIONS,
  FABRIC_TYPES,
  FABRIC_QUALITY_GRADES,
  ROLL_CONDITIONS,
  LOT_REGISTRY_STATES,
  LOT_REGISTRY_TRANSITIONS,
  LOT_REGISTRY_INITIAL_STATE,
  LOT_REGISTRY_STORAGE_KEY,
  LOT_REGISTRY_SCHEMA,
  LOT_REGISTRY_INDEXES
} from './schema.js'

// Import data definitions
import {
  INITIAL_LOT_REGISTRY_DATA,
  LOT_VALIDATION_RULES,
  LotRegistryHelpers
} from './data.js'

// ✅ Lot Registry Transaction Type Configuration
export const LOT_REGISTRY_TRANSACTION_TYPE = {
  name: 'LOT_REGISTRY',
  key: 'lot_registry',
  displayName: 'Lot Registry สิ่งทอ',
  description: 'ระบบจัดการ Lot สิ่งทอ รูปแบบ 402-177-152-08883',
  
  // Schema and Validation
  schema: LOT_REGISTRY_SCHEMA,
  indexes: LOT_REGISTRY_INDEXES,
  
  // State Machine
  states: LOT_REGISTRY_STATES,
  transitions: LOT_REGISTRY_TRANSITIONS,
  initialState: LOT_REGISTRY_INITIAL_STATE,
  
  // Storage
  storageKey: LOT_REGISTRY_STORAGE_KEY,
  
  // Form Configuration
  formFields: {
    create: [
      'lot_id', 'model_code', 'color_code', 'width_cm', 'lot_sequence',
      'product_id', 'original_weight_kg', 'weight_per_meter',
      'fabric_type', 'fabric_composition', 'quality_grade',
      'supplier_id', 'current_location', 'notes'
    ],
    edit: [
      'current_weight_kg', 'current_meters', 'lot_status',
      'current_location', 'roll_condition', 'notes'
    ],
    view: [
      'lot_id', 'model_code', 'color_code', 'width_cm', 'lot_sequence',
      'product_name', 'original_weight_kg', 'current_weight_kg',
      'calculated_meters', 'current_meters', 'fabric_type',
      'quality_grade', 'lot_status', 'supplier_name',
      'current_location', 'created_at', 'updated_at'
    ]
  },
  
  // List Configuration
  listFields: [
    'lot_id', 'product_name', 'fabric_type', 
    'current_weight_kg', 'current_meters', 
    'lot_status', 'current_location', 'created_at'
  ],
  
  // Search Configuration
  searchFields: [
    'lot_id', 'model_code', 'color_code', 
    'product_name', 'fabric_type', 'supplier_name'
  ],
  
  // Filter Configuration
  filterFields: [
    'lot_status', 'fabric_type', 'quality_grade',
    'supplier_id', 'current_location'
  ],
  
  // Sort Configuration
  defaultSort: { created_at: -1 },
  allowedSorts: [
    'lot_id', 'created_at', 'updated_at', 
    'current_weight_kg', 'current_meters',
    'lot_status', 'fabric_type'
  ],
  
  // Validation Rules
  validationRules: LOT_VALIDATION_RULES,
  
  // Helper Functions
  helpers: LotRegistryHelpers
}

// Export transaction type for registration
export default LOT_REGISTRY_TRANSACTION_TYPE

// Export all components for direct import
export {
  LOT_STATUS,
  LOT_OPERATIONS,
  FABRIC_TYPES,
  FABRIC_QUALITY_GRADES,
  ROLL_CONDITIONS,
  LOT_REGISTRY_STATES,
  LOT_REGISTRY_TRANSITIONS,
  LOT_REGISTRY_INITIAL_STATE,
  LOT_REGISTRY_STORAGE_KEY,
  LOT_REGISTRY_SCHEMA,
  LOT_REGISTRY_INDEXES,
  INITIAL_LOT_REGISTRY_DATA,
  LOT_VALIDATION_RULES,
  LotRegistryHelpers
}