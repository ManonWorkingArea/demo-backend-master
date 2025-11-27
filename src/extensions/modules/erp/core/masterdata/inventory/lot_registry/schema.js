/**
 * Lot Registry Schema Definitions
 * ข้อมูล Schema สำหรับระบบจัดการ Lot สิ่งทอ
 * 
 * Format: 402-177-152-08883
 * - 402: Model Code (รหัสรุ่น)
 * - 177: Color Code (รหัสสี)  
 * - 152: Width in cm (ความกว้าง)
 * - 08883: Lot Sequence (ลำดับ Lot)
 */

// Lot Status - สถานะ Lot
export const LOT_STATUS = {
  ACTIVE: 'active',           // ใช้งานได้
  PARTIAL: 'partial',         // ใช้ไปบางส่วน
  CONSUMED: 'consumed',       // ใช้หมดแล้ว
  RESERVED: 'reserved',       // จองไว้
  ON_HOLD: 'on_hold',         // หยุดใช้ชั่วคราว
  DAMAGED: 'damaged',         // เสียหาย
  EXPIRED: 'expired',         // หมดอายุ
  RETURNED: 'returned'        // คืนแล้ว
}

// Lot Operation Types - ประเภทการดำเนินการ Lot
export const LOT_OPERATIONS = {
  CREATE: 'create',           // สร้างใหม่
  RECEIVE: 'receive',         // รับเข้า
  SPLIT: 'split',             // แบ่งย่อย
  COMBINE: 'combine',         // รวม
  TRANSFER: 'transfer',       // โอนย้าย
  CONSUME: 'consume',         // ใช้งาน
  RETURN: 'return',           // คืน
  ADJUST: 'adjust',           // ปรับปรุง
  DISPOSE: 'dispose'          // ทิ้ง/จำหน่าย
}

// Fabric Types - ประเภทผ้า
export const FABRIC_TYPES = {
  COTTON: 'cotton',
  POLYESTER: 'polyester',
  SILK: 'silk',
  WOOL: 'wool',
  LINEN: 'linen',
  BLEND: 'blend',
  SYNTHETIC: 'synthetic',
  NATURAL: 'natural',
  DENIM: 'denim',
  JERSEY: 'jersey',
  CANVAS: 'canvas',
  SATIN: 'satin',
  CHIFFON: 'chiffon',
  VELVET: 'velvet'
}

// Quality Grades - เกรดคุณภาพ
export const FABRIC_QUALITY_GRADES = {
  PREMIUM: 'premium',         // พรีเมียม
  GRADE_A: 'grade_a',         // เกรด A
  GRADE_B: 'grade_b',         // เกรด B  
  GRADE_C: 'grade_c',         // เกรด C
  STANDARD: 'standard',       // มาตรฐาน
  ECONOMY: 'economy',         // ประหยัด
  DEFECTIVE: 'defective'      // มีข้อบกพร่อง
}

// Roll Conditions - สภาพม้วนผ้า
export const ROLL_CONDITIONS = {
  NEW: 'new',                 // ใหม่
  GOOD: 'good',               // ดี
  FAIR: 'fair',               // พอใช้
  DAMAGED: 'damaged',         // เสียหาย
  STAINED: 'stained',         // เปื้อน
  WRINKLED: 'wrinkled',       // ยับ
  FADED: 'faded'              // ซีดจาง
}

// Transaction States - สถานะการทำธุรกรรม Lot Registry
export const LOT_REGISTRY_STATES = ['active', 'consumed', 'reserved', 'archived']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const LOT_REGISTRY_TRANSITIONS = {
  'active': ['consumed', 'reserved', 'archived'],
  'consumed': ['archived'],
  'reserved': ['active', 'archived'],
  'archived': [] // สถานะสุดท้าย
}

// Initial State
export const LOT_REGISTRY_INITIAL_STATE = 'active'

// Storage Key
export const LOT_REGISTRY_STORAGE_KEY = 'erp_lot_registry'

// ✅ Lot Registry Schema - Field Definitions
export const LOT_REGISTRY_SCHEMA = {
  // Lot Identification
  lot_id: { 
    type: 'string', 
    required: true, 
    unique: true,
    pattern: '^[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{5}$',
    description: 'รหัส Lot (402-177-152-08883)' 
  },
  
  // Lot Components
  model_code: { 
    type: 'string', 
    required: true, 
    minLength: 3,
    maxLength: 3,
    pattern: '^[0-9]{3}$',
    description: 'รหัสรุ่น (402)' 
  },
  color_code: { 
    type: 'string', 
    required: true,
    minLength: 3, 
    maxLength: 3,
    pattern: '^[0-9]{3}$',
    description: 'รหัสสี (177)' 
  },
  width_cm: { 
    type: 'number', 
    required: true,
    min: 50,
    max: 500,
    description: 'ความกว้าง (152 cm)' 
  },
  lot_sequence: { 
    type: 'string', 
    required: true,
    minLength: 5,
    maxLength: 5, 
    pattern: '^[0-9]{5}$',
    description: 'ลำดับ Lot (08883)' 
  },
  
  // Product Reference
  product_id: { type: 'string', required: false, description: 'รหัสสินค้า' },
  product_code: { type: 'string', required: false, description: 'รหัสสินค้า (code)' },
  sku: { type: 'string', required: false, description: 'SKU' },
  product_name: { type: 'string', required: false, description: 'ชื่อสินค้า' },
  
  // Physical Properties
  original_weight_kg: { 
    type: 'number', 
    required: true,
    min: 0,
    description: 'น้ำหนักเดิม (kg)' 
  },
  current_weight_kg: { 
    type: 'number', 
    required: true,
    min: 0,
    description: 'น้ำหนักปัจจุบัน (kg)' 
  },
  calculated_meters: { 
    type: 'number', 
    required: true,
    min: 0,
    description: 'เมตรที่คำนวณได้' 
  },
  current_meters: { 
    type: 'number', 
    required: true,
    min: 0,
    description: 'เมตรปัจจุบัน' 
  },
  weight_per_meter: { 
    type: 'number', 
    required: true,
    min: 0,
    description: 'น้ำหนักต่อเมตร (kg/m)' 
  },
  
  // Fabric Details
  fabric_type: { 
    type: 'string', 
    required: false,
    enum: Object.values(FABRIC_TYPES),
    description: 'ประเภทผ้า' 
  },
  fabric_composition: { 
    type: 'string', 
    required: false, 
    description: 'องค์ประกอบผ้า (เช่น Cotton 60%, Polyester 40%)' 
  },
  gsm: { 
    type: 'number', 
    required: false,
    min: 50,
    max: 1000,
    description: 'GSM (Grams per Square Meter)' 
  },
  thread_count: { 
    type: 'string', 
    required: false, 
    description: 'Thread Count (เช่น 200TC)' 
  },
  color_name: { 
    type: 'string', 
    required: false, 
    description: 'ชื่อสี' 
  },
  pattern: { 
    type: 'string', 
    required: false, 
    description: 'ลวดลาย' 
  },
  
  // Quality & Condition
  quality_grade: { 
    type: 'string', 
    required: false,
    enum: Object.values(FABRIC_QUALITY_GRADES),
    description: 'เกรดคุณภาพ' 
  },
  roll_condition: { 
    type: 'string', 
    required: false,
    enum: Object.values(ROLL_CONDITIONS),
    description: 'สภาพม้วนผ้า' 
  },
  defects: { 
    type: 'array', 
    required: false,
    description: 'ข้อบกพร่อง',
    itemSchema: {
      defect_type: { type: 'string', required: true, description: 'ประเภทข้อบกพร่อง' },
      severity: { type: 'string', enum: ['minor', 'major', 'critical'], description: 'ระดับความรุนแรง' },
      location: { type: 'string', description: 'ตำแหน่งข้อบกพร่อง' },
      description: { type: 'string', description: 'รายละเอียด' }
    }
  },
  
  // Lot Status & Management
  lot_status: { 
    type: 'string', 
    required: false,
    default: 'active',
    enum: Object.values(LOT_STATUS),
    description: 'สถานะ Lot' 
  },
  
  // Lot Hierarchy
  parent_lot_id: { 
    type: 'string', 
    required: false, 
    description: 'Lot หลัก (กรณีแบ่งจาก Lot ใหญ่)' 
  },
  child_lot_ids: { 
    type: 'array', 
    required: false,
    description: 'Lot ย่อย (กรณีแบ่งเป็น Lot เล็ก)',
    itemSchema: { type: 'string' }
  },
  is_split_lot: { 
    type: 'boolean', 
    required: false, 
    default: false,
    description: 'เป็น Lot ที่แบ่งมา' 
  },
  split_reason: { 
    type: 'string', 
    required: false, 
    description: 'เหตุผลการแบ่ง Lot' 
  },
  
  // Supplier Information
  supplier_id: { type: 'string', required: false, description: 'รหัสผู้จำหน่าย' },
  supplier_name: { type: 'string', required: false, description: 'ชื่อผู้จำหน่าย' },
  supplier_lot_number: { type: 'string', required: false, description: 'หมายเลข Lot จากผู้จำหน่าย' },
  purchase_order_id: { type: 'string', required: false, description: 'รหัสใบสั่งซื้อ' },
  invoice_number: { type: 'string', required: false, description: 'เลขที่ใบกำกับภาษี' },
  
  // Location & Storage
  current_location: { type: 'string', required: false, description: 'ตำแหน่งปัจจุบัน' },
  warehouse: { type: 'string', required: false, description: 'คลังสินค้า' },
  zone: { type: 'string', required: false, description: 'โซน' },
  rack: { type: 'string', required: false, description: 'ชั้นวาง' },
  storage_conditions: { 
    type: 'string', 
    required: false,
    description: 'เงื่อนไขการเก็บ' 
  },
  
  // Pricing & Costing
  unit_cost: { type: 'number', required: false, min: 0, description: 'ต้นทุนต่อหน่วย' },
  total_cost: { type: 'number', required: false, min: 0, description: 'ต้นทุนรวม' },
  currency: { type: 'string', required: false, default: 'THB', description: 'สกุลเงิน' },
  
  // Date Information
  received_date: { type: 'date', required: false, description: 'วันที่รับเข้า' },
  manufactured_date: { type: 'date', required: false, description: 'วันที่ผลิต' },
  expiry_date: { type: 'date', required: false, description: 'วันหมดอายุ' },
  last_movement_date: { type: 'date', required: false, description: 'วันที่เคลื่อนไหวล่าสุด' },
  
  // Additional Information
  barcode: { type: 'string', required: false, description: 'บาร์โค้ด' },
  qr_code: { type: 'string', required: false, description: 'QR Code' },
  images: { 
    type: 'array', 
    required: false,
    description: 'รูปภาพ',
    itemSchema: { type: 'string' }
  },
  certificates: { 
    type: 'array', 
    required: false,
    description: 'ใบรับรอง',
    itemSchema: {
      type: { type: 'string', description: 'ประเภทใบรับรอง' },
      number: { type: 'string', description: 'เลขที่ใบรับรอง' },
      issued_date: { type: 'date', description: 'วันที่ออก' },
      expiry_date: { type: 'date', description: 'วันหมดอายุ' },
      file_url: { type: 'string', description: 'URL ไฟล์' }
    }
  },
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  
  // System fields
  id: { type: 'string', required: false, readonly: true, description: 'รหัสระบบ' },
  transaction_type: { type: 'string', required: false, default: 'lot_registry', readonly: true, description: 'ประเภทธุรกรรม' },
  subtype: { type: 'string', required: false, default: 'textile_lot', description: 'ประเภทย่อย' },
  state: { type: 'string', required: false, default: 'active', description: 'สถานะระบบ' },
  created_at: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, readonly: true, description: 'ผู้สร้าง' },
  updated_at: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข' },
  updated_by: { type: 'string', required: false, readonly: true, description: 'ผู้แก้ไข' },
  version: { type: 'number', required: false, readonly: true, default: 1, description: 'เวอร์ชัน' },
  active: { type: 'boolean', required: false, default: true, description: 'ใช้งาน' },
  deleted: { type: 'boolean', required: false, default: false, description: 'ถูกลบ' }
}

// ✅ Lot Registry Indexes for MongoDB
export const LOT_REGISTRY_INDEXES = [
  { fields: { lot_id: 1 }, options: { unique: true, name: 'idx_lot_id' } },
  { fields: { model_code: 1, color_code: 1, width_cm: 1 }, options: { name: 'idx_lot_components' } },
  { fields: { product_id: 1 }, options: { name: 'idx_product_id' } },
  { fields: { lot_status: 1 }, options: { name: 'idx_lot_status' } },
  { fields: { supplier_id: 1 }, options: { name: 'idx_supplier_id' } },
  { fields: { current_location: 1 }, options: { name: 'idx_current_location' } },
  { fields: { parent_lot_id: 1 }, options: { name: 'idx_parent_lot' } },
  { fields: { created_at: -1 }, options: { name: 'idx_created_date' } },
  { fields: { fabric_type: 1 }, options: { name: 'idx_fabric_type' } },
  { fields: { quality_grade: 1 }, options: { name: 'idx_quality_grade' } }
]

// ✅ Export all schemas and constants
export default {
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
}