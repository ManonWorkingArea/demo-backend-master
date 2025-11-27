/**
 * Inventory Schema Definitions
 * ข้อมูล Schema สำหรับระบบ Inventory
 */

// Inventory Types - ประเภทสินค้าคงคลัง
export const INVENTORY_TYPES = {
  RAW_MATERIAL: 'raw_material',
  FINISHED_GOODS: 'finished_goods',
  WORK_IN_PROGRESS: 'work_in_progress',
  CONSUMABLES: 'consumables',
  PACKAGING: 'packaging',
  SPARE_PARTS: 'spare_parts',
  TOOLS: 'tools',
  OFFICE_SUPPLIES: 'office_supplies',
  TEXTILE: 'textile' // สำหรับสิ่งทอ
}

// Stock Status - สถานะสต็อก
export const STOCK_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  ON_HOLD: 'on_hold',
  QUARANTINE: 'quarantine',
  DAMAGED: 'damaged',
  EXPIRED: 'expired',
  OUT_OF_STOCK: 'out_of_stock'
}

// Movement Types - ประเภทการเคลื่อนไหว
export const MOVEMENT_TYPES = {
  RECEIVE: 'receive',
  ISSUE: 'issue',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  SCRAP: 'scrap',
  CYCLE_COUNT: 'cycle_count'
}

// ABC Classification - การจัดประเภท ABC
export const ABC_CLASSIFICATION = {
  A: 'a', // High value items
  B: 'b', // Medium value items
  C: 'c'  // Low value items
}

// XYZ Classification - การจัดประเภท XYZ (ตามความต้องการ)
export const XYZ_CLASSIFICATION = {
  X: 'x', // Regular demand
  Y: 'y', // Irregular demand
  Z: 'z'  // Sporadic demand
}

// Valuation Methods - วิธีการคิดมูลค่า
export const VALUATION_METHODS = {
  FIFO: 'fifo',
  LIFO: 'lifo',
  WEIGHTED_AVERAGE: 'weighted_average',
  STANDARD_COST: 'standard_cost',
  MOVING_AVERAGE: 'moving_average'
}

// Storage Conditions - เงื่อนไขการเก็บ
export const STORAGE_CONDITIONS = {
  NORMAL: 'normal',
  COLD: 'cold',
  FROZEN: 'frozen',
  DRY: 'dry',
  HAZARDOUS: 'hazardous',
  CONTROLLED_TEMP: 'controlled_temp'
}

// Units - หน่วยนับ
export const INVENTORY_UNITS = {
  PIECE: 'ชิ้น',
  SET: 'ชุด',
  BOX: 'กล่อง',
  PACK: 'แพ็ค',
  KG: 'กิโลกรัม',
  GRAM: 'กรัม',
  LITER: 'ลิตร',
  METER: 'เมตร',
  ROLL: 'ม้วน',
  BOTTLE: 'ขวด',
  BAG: 'ถุง'
}

// Location Types - ประเภทตำแหน่ง
export const LOCATION_TYPES = {
  WAREHOUSE: 'warehouse',
  ZONE: 'zone',
  AISLE: 'aisle',
  RACK: 'rack',
  SHELF: 'shelf',
  BIN: 'bin',
  FLOOR: 'floor'
}

// Product Categories - หมวดหมู่สินค้า
export const PRODUCT_CATEGORIES = {
  GENERAL: 'general',
  ELECTRONICS: 'electronics',
  FOOD_BEVERAGE: 'food_beverage',
  CLOTHING: 'clothing',
  TOOLS_EQUIPMENT: 'tools_equipment',
  MATERIALS: 'materials',
  OFFICE_SUPPLIES: 'office_supplies',
  MEDICAL: 'medical',
  AUTOMOTIVE: 'automotive',
  HOME_GARDEN: 'home_garden',
  TEXTILE: 'textile', // สำหรับสิ่งทอ
  FABRIC: 'fabric'    // สำหรับผ้า
}

// Transaction Status - สถานะการทำธุรกรรม
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
}

// Priority Levels - ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// Quality Status - สถานะคุณภาพ
export const QUALITY_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  PENDING: 'pending',
  CONDITIONAL: 'conditional',
  QUARANTINE: 'quarantine'
}

// Batch/Lot Status - สถานะแบช/ล็อต
export const BATCH_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RECALLED: 'recalled',
  ON_HOLD: 'on_hold',
  RELEASED: 'released',
  PARTIAL: 'partial',    // ใช้ไปบางส่วน
  CONSUMED: 'consumed',   // ใช้หมดแล้ว
  RESERVED: 'reserved'    // จองไว้
}

// ✅ Lot Operation Types - ประเภทการดำเนินการ Lot
export const LOT_OPERATION_TYPES = {
  RECEIVE: 'receive',      // รับเข้า
  SPLIT: 'split',          // แบ่งย่อย
  COMBINE: 'combine',      // รวม
  CONSUME: 'consume',      // ใช้งาน
  TRANSFER: 'transfer',    // โอนย้าย
  ADJUSTMENT: 'adjustment', // ปรับปรุง
  RETURN: 'return',        // คืน
  SCRAP: 'scrap'          // ทิ้ง
}

// ✅ Textile Fabric Types - ประเภทผ้าสิ่งทอ
export const TEXTILE_FABRIC_TYPES = {
  COTTON: 'cotton',         // ผ้าฝ้าย
  POLYESTER: 'polyester',   // ผ้าโพลีเอสเตอร์
  SILK: 'silk',             // ผ้าไหม
  WOOL: 'wool',             // ผ้าขนสัตว์
  LINEN: 'linen',           // ผ้าลินิน
  BLEND: 'blend',           // ผ้าผสม
  SYNTHETIC: 'synthetic',   // ผ้าสังเคราะห์
  NATURAL: 'natural'        // ผ้าธรรมชาติ
}

// ✅ Textile Measurement Units - หน่วยวัดสิ่งทอ
export const TEXTILE_UNITS = {
  METER: 'meter',           // เมตร
  YARD: 'yard',             // หลา
  KILOGRAM: 'kg',           // กิโลกรัม
  GRAM: 'gram',             // กรัม
  ROLL: 'roll'              // ม้วน
}

// Supplier Rating - การให้คะแนนผู้จำหน่าย
export const SUPPLIER_RATING = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor',
  BLACKLISTED: 'blacklisted'
}

// Transaction States - สถานะการทำธุรกรรม Inventory
export const INVENTORY_STATES = ['available', 'reserved', 'allocated', 'inactive']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const INVENTORY_TRANSITIONS = {
  'available': ['reserved', 'allocated', 'inactive'],
  'reserved': ['available', 'allocated', 'inactive'],
  'allocated': ['available', 'inactive'],
  'inactive': ['available'] // สามารถกลับมาใช้งานได้
}

// Initial State
export const INVENTORY_INITIAL_STATE = 'available'

// Storage Key
export const INVENTORY_STORAGE_KEY = 'erp_inventory_transactions'

// ✅ Inventory Sub-types - ประเภทย่อยของธุรกรรม Inventory
export const INVENTORY_SUBTYPES = {
  STOCK_ITEM: 'stock_item',
  STOCK_MOVEMENT: 'stock_movement', 
  STOCK_ADJUSTMENT: 'stock_adjustment',
  STOCK_TRANSFER: 'stock_transfer',
  STOCK_COUNT: 'stock_count',
  STOCK_LOCATION: 'stock_location', // Sub-module: ตำแหน่งคลัง
  BATCH_LOT: 'batch_lot',
  LOT_REGISTRY: 'lot_registry',     // รีจิสทรี Lot
  TEXTILE_LOT: 'textile_lot',       // Lot สิ่งทอ
  QUALITY_CHECK: 'quality_check',
  SUPPLIER_ITEM: 'supplier_item'
}

// ✅ Inventory Transaction Schema - Field Definitions
export const INVENTORY_SCHEMA = {
  // Transaction fields
  movement_type: { 
    type: 'string', 
    required: false, 
    enum: Object.values(MOVEMENT_TYPES),
    description: 'ประเภทการเคลื่อนไหว' 
  },
  transaction_type: { type: 'string', required: false, description: 'ประเภทธุรกรรม (in, out, adjustment)' },
  reference_type: { type: 'string', required: false, description: 'อ้างอิงจาก (purchase, sales, production, etc.)' },
  reference_id: { type: 'string', required: false, description: 'รหัสอ้างอิง' },
  
  // Product reference
  product_id: { type: 'string', required: false, description: 'รหัสสินค้า' },
  product_code: { type: 'string', required: false, description: 'รหัสสินค้า (code)' },
  sku: { type: 'string', required: false, description: 'SKU' },
  product_name: { type: 'string', required: false, description: 'ชื่อสินค้า' },
  
  // Transaction details  
  quantity: { type: 'number', required: false, min: 0, description: 'จำนวน' },
  unit: { 
    type: 'string', 
    required: false, 
    enum: Object.values(INVENTORY_UNITS),
    description: 'หน่วย' 
  },
  unit_price: { type: 'number', required: false, min: 0, description: 'ราคาต่อหน่วย' },
  total_value: { type: 'number', required: false, min: 0, description: 'มูลค่ารวม' },
  
  // Location & tracking
  location: { type: 'string', required: false, description: 'ตำแหน่ง' },
  from_location: { type: 'string', required: false, description: 'จากตำแหน่ง' },
  to_location: { type: 'string', required: false, description: 'ไปยังตำแหน่ง' },
  batch_number: { type: 'string', required: false, description: 'หมายเลข Batch' },
  serial_number: { type: 'string', required: false, description: 'หมายเลข Serial' },
  
  // ✅ Textile Lot Tracking - สำหรับสิ่งทอ
  lot_id: { type: 'string', required: false, description: 'รหัส Lot (402-177-152-08883)' },
  model_code: { type: 'string', required: false, description: 'รหัสรุ่น (402)' },
  color_code: { type: 'string', required: false, description: 'รหัสสี (177)' },
  width_cm: { type: 'number', required: false, description: 'ความกว้าง (152 cm)' },
  lot_sequence: { type: 'string', required: false, description: 'ลำดับ Lot (08883)' },
  
  // Weight & Measurement for Textiles
  weight_kg: { type: 'number', required: false, min: 0, description: 'น้ำหนัก (kg)' },
  meters: { type: 'number', required: false, min: 0, description: 'เมตร' },
  weight_per_meter: { type: 'number', required: false, min: 0, description: 'น้ำหนักต่อเมตร (kg/m)' },
  conversion_rate: { type: 'number', required: false, min: 0, description: 'อัตราแปลง kg/m' },
  
  // Lot Operation
  lot_operation: { 
    type: 'string', 
    required: false, 
    enum: Object.values(LOT_OPERATION_TYPES),
    description: 'ประเภทการดำเนินการ Lot' 
  },
  parent_lot_id: { type: 'string', required: false, description: 'Lot หลัก (กรณีแบ่งย่อย)' },
  child_lot_ids: { type: 'array', required: false, description: 'Lot ย่อย (กรณีแบ่ง)', itemSchema: { type: 'string' } },
  is_partial_lot: { type: 'boolean', required: false, default: false, description: 'เป็น Lot บางส่วน' },
  
  // Textile Properties
  fabric_type: { 
    type: 'string', 
    required: false,
    enum: Object.values(TEXTILE_FABRIC_TYPES),
    description: 'ประเภทผ้า' 
  },
  fabric_composition: { type: 'string', required: false, description: 'องค์ประกอบผ้า (เช่น Cotton 60%, Polyester 40%)' },
  gsm: { type: 'number', required: false, description: 'GSM (Grams per Square Meter)' },
  thread_count: { type: 'string', required: false, description: 'Thread Count' },
  
  // Stock information
  current_stock: { type: 'number', required: false, description: 'สต็อคปัจจุบัน' },
  stock_after: { type: 'number', required: false, description: 'สต็อคหลังการทำรายการ' },
  
  // Quality & classification
  quality_status: { 
    type: 'string', 
    required: false, 
    enum: Object.values(QUALITY_STATUS),
    description: 'สถานะคุณภาพ' 
  },
  abc_class: { 
    type: 'string', 
    required: false, 
    enum: Object.values(ABC_CLASSIFICATION),
    description: 'การจัดประเภท ABC' 
  },
  
  // Transaction metadata
  transaction_date: { type: 'date', required: false, description: 'วันที่ทำรายการ' },
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  status: { 
    type: 'string', 
    required: false, 
    default: 'pending',
    enum: Object.values(TRANSACTION_STATUS),
    description: 'สถานะ' 
  },
  
  // Legacy fields (รองรับ field เดิม)
  productName: { type: 'string', required: false, description: 'ชื่อสินค้า (legacy)' },
  
  // System fields
  id: { type: 'string', required: false, readonly: true, description: 'รหัสระบบ' },
  type: { type: 'string', required: false, default: 'inventory', readonly: true, description: 'ประเภทธุรกรรม' },
  state: { type: 'string', required: false, default: 'available', description: 'สถานะระบบ' },
  created_at: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, readonly: true, description: 'ผู้สร้าง' },
  updated_at: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข' },
  updated_date: { type: 'string', required: false, readonly: true, description: 'วันที่แก้ไข (ISO string)' },
  updated_by: { type: 'string', required: false, readonly: true, description: 'ผู้แก้ไข' },
  version: { type: 'number', required: false, readonly: true, default: 1, description: 'เวอร์ชัน' }
}

export default {
  INVENTORY_TYPES,
  STOCK_STATUS,
  MOVEMENT_TYPES,
  ABC_CLASSIFICATION,
  XYZ_CLASSIFICATION,
  VALUATION_METHODS,
  STORAGE_CONDITIONS,
  INVENTORY_UNITS,
  LOCATION_TYPES,
  PRODUCT_CATEGORIES,
  TRANSACTION_STATUS,
  PRIORITY_LEVELS,
  QUALITY_STATUS,
  BATCH_STATUS,
  LOT_OPERATION_TYPES,
  TEXTILE_FABRIC_TYPES,
  TEXTILE_UNITS,
  SUPPLIER_RATING,
  INVENTORY_STATES,
  INVENTORY_TRANSITIONS,
  INVENTORY_INITIAL_STATE,
  INVENTORY_STORAGE_KEY,
  INVENTORY_SUBTYPES,
  INVENTORY_SCHEMA
}