/**
 * Stock Locations Schema Definitions
 * ข้อมูล Schema สำหรับระบบตำแหน่งคลัง (Stock Locations)
 */

// Location Types - ประเภทตำแหน่ง
export const LOCATION_TYPES = {
  WAREHOUSE: 'warehouse',
  ZONE: 'zone', 
  AISLE: 'aisle',
  RACK: 'rack',
  SHELF: 'shelf',
  BIN: 'bin',
  FLOOR: 'floor',
  OFFICE: 'office',
  PRODUCTION: 'production',
  STAGING: 'staging',
  QUALITY_CONTROL: 'quality_control',
  SHIPPING: 'shipping',
  RECEIVING: 'receiving',
  QUARANTINE: 'quarantine',
  RETURNS: 'returns',
  OTHER: 'other'
}

// Location Status - สถานะตำแหน่ง
export const LOCATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  FULL: 'full',
  DAMAGED: 'damaged',
  RESERVED: 'reserved',
  BLOCKED: 'blocked'
}

// Storage Conditions - เงื่อนไขการเก็บ
export const STORAGE_CONDITIONS = {
  NORMAL: 'normal',
  COLD: 'cold',
  FROZEN: 'frozen',
  DRY: 'dry',
  HUMID: 'humid',
  HAZARDOUS: 'hazardous',
  CONTROLLED_TEMP: 'controlled_temp',
  CLEAN_ROOM: 'clean_room',
  SECURE: 'secure'
}

// Access Levels - ระดับการเข้าถึง
export const ACCESS_LEVELS = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
  AUTHORIZED_ONLY: 'authorized_only',
  MANAGEMENT_ONLY: 'management_only',
  SECURE: 'secure'
}

// Capacity Units - หน่วยความจุ
export const CAPACITY_UNITS = {
  CUBIC_METER: 'cubic_meter',
  SQUARE_METER: 'square_meter',
  PALLETS: 'pallets',
  BINS: 'bins',
  PIECES: 'pieces',
  WEIGHT_KG: 'weight_kg',
  WEIGHT_TONS: 'weight_tons',
  UNLIMITED: 'unlimited'
}

// Priority Levels - ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// Zone Classifications - การจัดประเภทโซน
export const ZONE_CLASSIFICATIONS = {
  A: 'a', // High frequency access
  B: 'b', // Medium frequency access
  C: 'c', // Low frequency access
  SPECIAL: 'special' // Special handling required
}

// Transaction States - สถานะการทำธุรกรรม Stock Location
export const STOCK_LOCATION_STATES = ['active', 'inactive', 'maintenance', 'archived']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const STOCK_LOCATION_TRANSITIONS = {
  'active': ['inactive', 'maintenance', 'archived'],
  'inactive': ['active', 'archived'],
  'maintenance': ['active', 'inactive'],
  'archived': [] // สถานะสุดท้าย
}

// Initial State
export const STOCK_LOCATION_INITIAL_STATE = 'active'

// Storage Key
export const STOCK_LOCATION_STORAGE_KEY = 'erp_stock_locations'

// ✅ Stock Location Schema - Field Definitions
export const STOCK_LOCATION_SCHEMA = {
  // Basic Information
  location_code: { 
    type: 'string', 
    required: true, 
    unique: true,
    pattern: '^[A-Z0-9-_]+$',
    description: 'รหัสตำแหน่ง (A-Z, 0-9, -, _ เท่านั้น)' 
  },
  location_name: { 
    type: 'string', 
    required: true, 
    description: 'ชื่อตำแหน่ง' 
  },
  location_type: { 
    type: 'string', 
    required: false, 
    default: 'warehouse',
    enum: Object.values(LOCATION_TYPES),
    description: 'ประเภทตำแหน่ง' 
  },
  description: { 
    type: 'string', 
    required: false, 
    description: 'คำอธิบายตำแหน่ง' 
  },

  // Location Hierarchy
  parent_location: { 
    type: 'string', 
    required: false, 
    description: 'ตำแหน่งหลัก' 
  },
  zone: { 
    type: 'string', 
    required: false, 
    description: 'โซน' 
  },
  aisle: { 
    type: 'string', 
    required: false, 
    description: 'ทางเดิน' 
  },
  rack: { 
    type: 'string', 
    required: false, 
    description: 'ชั้นวาง' 
  },
  shelf: { 
    type: 'string', 
    required: false, 
    description: 'หิ้ง' 
  },
  bin: { 
    type: 'string', 
    required: false, 
    description: 'ช่อง' 
  },
  level: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ระดับ (0 = root level)' 
  },

  // Physical Properties
  width: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ความกว้าง (เมตร)' 
  },
  length: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ความยาว (เมตร)' 
  },
  height: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ความสูง (เมตร)' 
  },
  area: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'พื้นที่ (ตารางเมตร)' 
  },
  volume: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ปริมาตร (ลูกบาศก์เมตร)' 
  },

  // Capacity Management
  capacity: { 
    type: 'string', 
    required: false, 
    description: 'ความจุ (เช่น 1000, ไม่จำกัด)' 
  },
  capacity_numeric: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ความจุ (ตัวเลข)' 
  },
  capacity_unit: { 
    type: 'string', 
    required: false, 
    enum: Object.values(CAPACITY_UNITS),
    default: 'pieces',
    description: 'หน่วยความจุ' 
  },
  current_usage: { 
    type: 'number', 
    required: false, 
    min: 0,
    default: 0,
    description: 'การใช้งานปัจจุบัน' 
  },
  max_weight: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'น้ำหนักสูงสุด (กิโลกรัม)' 
  },
  current_weight: { 
    type: 'number', 
    required: false, 
    min: 0,
    default: 0,
    description: 'น้ำหนักปัจจุบัน (กิโลกรัม)' 
  },

  // Status & Control
  status: { 
    type: 'string', 
    required: false, 
    default: 'active',
    enum: Object.values(LOCATION_STATUS),
    description: 'สถานะตำแหน่ง' 
  },
  is_pickable: { 
    type: 'boolean', 
    required: false, 
    default: true,
    description: 'สามารถหยิบสินค้าได้' 
  },
  is_receivable: { 
    type: 'boolean', 
    required: false, 
    default: true,
    description: 'สามารถรับสินค้าได้' 
  },
  is_countable: { 
    type: 'boolean', 
    required: false, 
    default: true,
    description: 'สามารถนับสต็อคได้' 
  },
  allow_mixing: { 
    type: 'boolean', 
    required: false, 
    default: true,
    description: 'อนุญาตให้เก็บสินค้าหลายประเภท' 
  },
  allow_partial: { 
    type: 'boolean', 
    required: false, 
    default: true,
    description: 'อนุญาตการเก็บบางส่วน' 
  },

  // Storage Conditions
  storage_condition: { 
    type: 'string', 
    required: false, 
    default: 'normal',
    enum: Object.values(STORAGE_CONDITIONS),
    description: 'เงื่อนไขการเก็บ' 
  },
  temperature_min: { 
    type: 'number', 
    required: false, 
    description: 'อุณหภูมิต่ำสุด (°C)' 
  },
  temperature_max: { 
    type: 'number', 
    required: false, 
    description: 'อุณหภูมิสูงสุด (°C)' 
  },
  humidity_min: { 
    type: 'number', 
    required: false, 
    min: 0,
    max: 100,
    description: 'ความชื้นต่ำสุด (%)' 
  },
  humidity_max: { 
    type: 'number', 
    required: false, 
    min: 0,
    max: 100,
    description: 'ความชื้นสูงสุด (%)' 
  },

  // Access & Security
  access_level: { 
    type: 'string', 
    required: false, 
    default: 'public',
    enum: Object.values(ACCESS_LEVELS),
    description: 'ระดับการเข้าถึง' 
  },
  authorized_users: { 
    type: 'array', 
    required: false, 
    description: 'ผู้ใช้ที่ได้รับอนุญาต',
    itemSchema: {
      user_id: { type: 'string', required: true },
      permission: { type: 'string', required: true, enum: ['read', 'write', 'admin'] }
    }
  },
  requires_certification: { 
    type: 'boolean', 
    required: false, 
    default: false,
    description: 'ต้องการใบรับรอง' 
  },

  // Classification & Priority
  zone_classification: { 
    type: 'string', 
    required: false, 
    enum: Object.values(ZONE_CLASSIFICATIONS),
    description: 'การจัดประเภทโซน' 
  },
  priority: { 
    type: 'string', 
    required: false, 
    default: 'normal',
    enum: Object.values(PRIORITY_LEVELS),
    description: 'ระดับความสำคัญ' 
  },
  pick_sequence: { 
    type: 'number', 
    required: false, 
    description: 'ลำดับการหยิบ' 
  },

  // Address & Contact
  address: { 
    type: 'string', 
    required: false, 
    description: 'ที่อยู่' 
  },
  contact_person: { 
    type: 'string', 
    required: false, 
    description: 'ผู้ติดต่อ' 
  },
  contact_phone: { 
    type: 'string', 
    required: false, 
    description: 'เบอร์โทรติดต่อ' 
  },
  contact_email: { 
    type: 'string', 
    required: false, 
    description: 'อีเมลติดต่อ' 
  },

  // GPS & Mapping
  latitude: { 
    type: 'number', 
    required: false, 
    description: 'ละติจูด' 
  },
  longitude: { 
    type: 'number', 
    required: false, 
    description: 'ลองจิจูด' 
  },
  floor_plan_x: { 
    type: 'number', 
    required: false, 
    description: 'ตำแหน่ง X บนแผนผัง' 
  },
  floor_plan_y: { 
    type: 'number', 
    required: false, 
    description: 'ตำแหน่ง Y บนแผนผัง' 
  },

  // Business Rules
  cost_center: { 
    type: 'string', 
    required: false, 
    description: 'ศูนย์ต้นทุน' 
  },
  budget_code: { 
    type: 'string', 
    required: false, 
    description: 'รหัสงบประมาณ' 
  },
  rental_cost: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ค่าเช่าต่อเดือน' 
  },
  maintenance_cost: { 
    type: 'number', 
    required: false, 
    min: 0,
    description: 'ค่าบำรุงรักษาต่อเดือน' 
  },

  // Audit & History
  last_inventory_date: { 
    type: 'date', 
    required: false, 
    description: 'วันที่นับสต็อคล่าสุด' 
  },
  last_maintenance_date: { 
    type: 'date', 
    required: false, 
    description: 'วันที่บำรุงรักษาล่าสุด' 
  },
  next_maintenance_date: { 
    type: 'date', 
    required: false, 
    description: 'วันที่บำรุงรักษาครั้งถัดไป' 
  },
  installation_date: { 
    type: 'date', 
    required: false, 
    description: 'วันที่ติดตั้ง' 
  },

  // Additional Notes
  notes: { 
    type: 'string', 
    required: false, 
    description: 'หมายเหตุ' 
  },
  special_instructions: { 
    type: 'string', 
    required: false, 
    description: 'คำแนะนำพิเศษ' 
  },
  hazard_warnings: { 
    type: 'string', 
    required: false, 
    description: 'คำเตือนอันตราย' 
  },

  // Legacy support fields
  code: { type: 'string', required: false, description: 'รหัส (legacy)' },
  name: { type: 'string', required: false, description: 'ชื่อ (legacy)' },
  type: { type: 'string', required: false, description: 'ประเภท (legacy)' },

  // System Fields
  id: { type: 'string', required: false, readonly: true, description: 'รหัสระบบ' },
  transaction_type: { type: 'string', required: false, default: 'stock_location', readonly: true, description: 'ประเภทธุรกรรม' },
  subtype: { type: 'string', required: false, default: 'stock_location', description: 'ประเภทย่อย' },
  state: { type: 'string', required: false, default: 'active', description: 'สถานะระบบ' },
  created_at: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, readonly: true, description: 'ผู้สร้าง' },
  updated_at: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข' },
  updated_by: { type: 'string', required: false, readonly: true, description: 'ผู้แก้ไข' },
  version: { type: 'number', required: false, readonly: true, default: 1, description: 'เวอร์ชัน' },
  active: { type: 'boolean', required: false, default: true, description: 'ใช้งาน' },
  deleted: { type: 'boolean', required: false, default: false, description: 'ถูกลบ' }
}

// ✅ Export all schemas and constants
export default {
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
}