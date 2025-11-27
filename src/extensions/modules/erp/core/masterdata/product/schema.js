/**
 * Product Schema
 * โครงสร้างข้อมูลสำหรับระบบสินค้า
 */

// Product Types - ประเภทสินค้า
export const PRODUCT_TYPES = {
  PHYSICAL: 'physical',           // สินค้าจริง
  DIGITAL: 'digital',             // สินค้าดิจิทัล
  SERVICE: 'service',             // บริการ
  BUNDLE: 'bundle',               // ชุดสินค้า
  VIRTUAL: 'virtual',             // สินค้าเสมือน
  SUBSCRIPTION: 'subscription'     // สินค้าแบบสมาชิก
}

// Product Status - สถานะสินค้า
export const PRODUCT_STATUS = {
  DRAFT: 'draft',                 // ร่าง
  ACTIVE: 'active',               // ใช้งาน
  INACTIVE: 'inactive',           // หยุดใช้งาน
  DISCONTINUED: 'discontinued',   // หยุดผลิต
  ARCHIVED: 'archived'            // เก็บถาวร
}

// Product Categories - หมวดหมู่สินค้า
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',     // อิเล็กทรอนิกส์
  CLOTHING: 'clothing',           // เสื้อผ้า
  FOOD: 'food',                   // อาหาร
  BOOKS: 'books',                 // หนังสือ
  HOME: 'home',                   // ของใช้ในบ้าน
  BEAUTY: 'beauty',               // ความงาม
  SPORTS: 'sports',               // กีฬา
  AUTOMOTIVE: 'automotive',       // ยานยนต์
  HEALTH: 'health',               // สุขภาพ
  GENERAL: 'general',             // ทั่วไป
  TEXTILE: 'textile',             // สิ่งทอ
  FABRIC: 'fabric'                // ผ้า
}

// Units of Measure - หน่วยวัด
export const PRODUCT_UNITS = {
  PIECE: 'piece',                 // ชิ้น
  KILOGRAM: 'kg',                 // กิโลกรัม
  GRAM: 'g',                      // กรัม
  LITER: 'l',                     // ลิตร
  MILLILITER: 'ml',               // มิลลิลิตร
  METER: 'm',                     // เมตร
  CENTIMETER: 'cm',               // เซนติเมตร
  SQUARE_METER: 'sqm',            // ตารางเมตร
  CUBIC_METER: 'cbm',             // ลูกบาศก์เมตร
  BOX: 'box',                     // กล่อง
  PACK: 'pack',                   // แพ็ค
  DOZEN: 'dozen',                 // โหล
  SET: 'set',                     // ชุด
  PAIR: 'pair',                   // คู่
  ROLL: 'roll',                   // ม้วน
  BOTTLE: 'bottle',               // ขวด
  CAN: 'can',                     // กระป็อง
  BAG: 'bag',                     // ถุง
  HOUR: 'hour',                   // ชั่วโมง (สำหรับบริการ)
  DAY: 'day',                     // วัน (สำหรับบริการ)
  MONTH: 'month',                 // เดือน (สำหรับบริการ)
  YEAR: 'year'                    // ปี (สำหรับบริการ)
}

// Tax Types - ประเภทภาษี
export const TAX_TYPES = {
  NONE: 'none',                   // ไม่มีภาษี
  VAT_7: 'vat_7',                 // ภาษีมูลค่าเพิ่ม 7%
  VAT_0: 'vat_0',                 // ภาษีมูลค่าเพิ่ม 0%
  EXEMPT: 'exempt',               // ยกเว้นภาษี
  WITHHOLDING: 'withholding'      // ภาษีหัก ณ ที่จ่าย
}

// Price Types - ประเภทราคา
export const PRICE_TYPES = {
  FIXED: 'fixed',                 // ราคาคงที่
  VARIABLE: 'variable',           // ราคาผันแปร
  TIERED: 'tiered',               // ราคาแบบขั้นบันได
  DYNAMIC: 'dynamic'              // ราคาแบบไดนามิก
}

// Inventory Tracking - การติดตามสต็อก
export const INVENTORY_TRACKING = {
  NONE: 'none',                   // ไม่ติดตาม
  QUANTITY: 'quantity',           // ติดตามจำนวน
  SERIAL: 'serial',               // ติดตาม Serial Number
  BATCH: 'batch',                 // ติดตาม Batch/Lot
  EXPIRY: 'expiry',               // ติดตามวันหมดอายุ
  LOT: 'lot',                     // ติดตาม Lot (สำหรับสิ่งทอ)
  WEIGHT_METER: 'weight_meter'    // ติดตามน้ำหนัก-เมตร
}

// Product Lifecycle - วงจรชีวิตสินค้า
export const PRODUCT_LIFECYCLE = {
  INTRODUCTION: 'introduction',   // เปิดตัว
  GROWTH: 'growth',               // เติบโต
  MATURITY: 'maturity',           // เต็มวัย
  DECLINE: 'decline',             // ถดถอย
  PHASE_OUT: 'phase_out'          // ถอนตัว
}

// Quality Grades - เกรดคุณภาพ
export const QUALITY_GRADES = {
  PREMIUM: 'premium',             // พรีเมียม
  STANDARD: 'standard',           // มาตรฐาน
  ECONOMY: 'economy',             // ประหยัด
  GRADE_A: 'grade_a',             // เกรด A
  GRADE_B: 'grade_b',             // เกรด B
  GRADE_C: 'grade_c'              // เกรด C
}

// Storage Conditions - เงื่อนไขการเก็บ
export const STORAGE_CONDITIONS = {
  NORMAL: 'normal',               // ปกติ
  REFRIGERATED: 'refrigerated',   // แช่เย็น
  FROZEN: 'frozen',               // แช่แข็ง
  DRY: 'dry',                     // แห้ง
  HUMIDITY_CONTROLLED: 'humidity_controlled', // ควบคุมความชื้น
  TEMPERATURE_CONTROLLED: 'temperature_controlled', // ควบคุมอุณหภูมิ
  HAZARDOUS: 'hazardous'          // อันตราย
}

// Transaction Status - สถานะการทำรายการ
export const TRANSACTION_STATUS = {
  DRAFT: 'draft',                 // ร่าง
  PENDING: 'pending',             // รอดำเนินการ
  APPROVED: 'approved',           // อนุมัติแล้ว
  REJECTED: 'rejected',           // ปฏิเสธ
  COMPLETED: 'completed',         // เสร็จสิ้น
  CANCELLED: 'cancelled',         // ยกเลิก
  ON_HOLD: 'on_hold'              // หยุดชั่วคราว
}

// Priority Levels - ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',                     // ต่ำ
  NORMAL: 'normal',               // ปกติ
  HIGH: 'high',                   // สูง
  URGENT: 'urgent',               // เร่งด่วน
  CRITICAL: 'critical'            // วิกฤต
}

// ✅ Product Master Data Schema - Field Definitions
export const PRODUCT_SCHEMA = {
  // Product Master fields
  product_code: { type: 'string', required: false, description: 'รหัสสินค้า' },
  sku: { type: 'string', required: false, description: 'SKU' },
  product_name: { type: 'string', required: true, description: 'ชื่อสินค้า' },
  description: { type: 'string', required: false, description: 'รายละเอียด' },
  
  // Categorization
  product_type: { 
    type: 'string', 
    required: false, 
    default: 'physical',
    enum: Object.values(PRODUCT_TYPES),
    description: 'ประเภทสินค้า' 
  },
  category: { 
    type: 'string', 
    required: false,
    enum: Object.values(PRODUCT_CATEGORIES),
    description: 'หมวดหมู่' 
  },
  
  // Measurement & Units
  unit: { 
    type: 'string', 
    required: false, 
    default: 'piece',
    enum: Object.values(PRODUCT_UNITS),
    description: 'หน่วย' 
  },
  
  // Pricing
  unit_price: { type: 'number', required: false, min: 0, description: 'ราคาต่อหน่วย' },
  cost_per_unit: { type: 'number', required: false, min: 0, description: 'ต้นทุนต่อหน่วย' },
  selling_price: { type: 'number', required: false, min: 0, description: 'ราคาขาย' },
  price_type: { 
    type: 'string', 
    required: false, 
    default: 'fixed',
    enum: Object.values(PRICE_TYPES),
    description: 'ประเภทราคา' 
  },
  
  // Tax & Accounting
  tax_type: { 
    type: 'string', 
    required: false, 
    default: 'vat_7',
    enum: Object.values(TAX_TYPES),
    description: 'ประเภทภาษี' 
  },
  
  // Inventory Management
  min_stock: { type: 'number', required: false, min: 0, description: 'สต็อคขั้นต่ำ' },
  max_stock: { type: 'number', required: false, min: 0, description: 'สต็อคสูงสุด' },
  reorder_point: { type: 'number', required: false, min: 0, description: 'จุดสั่งซื้อใหม่' },
  current_stock: { type: 'number', required: false, min: 0, description: 'สต็อคปัจจุบัน' },
  
  inventory_tracking: { 
    type: 'string', 
    required: false, 
    default: 'quantity',
    enum: Object.values(INVENTORY_TRACKING),
    description: 'การติดตามสต็อค' 
  },
  
  // Storage & Quality
  storage_condition: { 
    type: 'string', 
    required: false, 
    default: 'normal',
    enum: Object.values(STORAGE_CONDITIONS),
    description: 'เงื่อนไขการเก็บ' 
  },
  quality_grade: { 
    type: 'string', 
    required: false,
    enum: Object.values(QUALITY_GRADES),
    description: 'เกรดคุณภาพ' 
  },
  
  // Supplier Information
  supplier: { type: 'string', required: false, description: 'ผู้จำหน่าย' },
  supplier_id: { type: 'string', required: false, description: 'รหัสผู้จำหน่าย' },
  
  // Product Lifecycle
  lifecycle_stage: { 
    type: 'string', 
    required: false,
    enum: Object.values(PRODUCT_LIFECYCLE),
    description: 'ระยะวงจรชีวิตสินค้า' 
  },
  
  // Status & Flags
  status: { 
    type: 'string', 
    required: false, 
    default: 'active',
    enum: Object.values(PRODUCT_STATUS),
    description: 'สถานะ' 
  },
  is_active: { type: 'boolean', required: false, default: true, description: 'ใช้งาน' },
  is_serialized: { type: 'boolean', required: false, default: false, description: 'มี Serial Number' },
  is_batch_tracked: { type: 'boolean', required: false, default: false, description: 'ติดตาม Batch' },
  
  // Additional Information
  barcode: { type: 'string', required: false, description: 'บาร์โค้ด' },
  qr_code: { type: 'string', required: false, description: 'QR Code' },
  image_url: { type: 'string', required: false, description: 'URL รูปภาพ' },
  weight: { type: 'number', required: false, min: 0, description: 'น้ำหนัก' },
  dimensions: { type: 'string', required: false, description: 'ขนาด (กว้าง x ยาว x สูง)' },
  color: { type: 'string', required: false, description: 'สี' },
  size: { type: 'string', required: false, description: 'ไซส์' },
  material: { type: 'string', required: false, description: 'วัสดุ' },
  warranty_period: { type: 'number', required: false, description: 'ระยะเวลาการรับประกัน (วัน)' },
  shelf_life: { type: 'number', required: false, description: 'อายุการเก็บ (วัน)' },
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  
  // ✅ Textile Specific Fields - ฟิลด์เฉพาะสิ่งทอ
  is_textile: { type: 'boolean', required: false, default: false, description: 'เป็นสิ่งทอ' },
  fabric_type: { type: 'string', required: false, description: 'ประเภทผ้า' },
  fabric_composition: { type: 'string', required: false, description: 'องค์ประกอบผ้า' },
  gsm: { type: 'number', required: false, min: 50, max: 1000, description: 'GSM (Grams per Square Meter)' },
  thread_count: { type: 'string', required: false, description: 'Thread Count' },
  fabric_width_cm: { type: 'number', required: false, min: 50, max: 500, description: 'ความกว้างผ้า (cm)' },
  weight_per_meter: { type: 'number', required: false, min: 0, description: 'น้ำหนักต่อเมตร (kg/m)' },
  fabric_pattern: { type: 'string', required: false, description: 'ลวดลายผ้า' },
  care_instructions: { type: 'string', required: false, description: 'วิธีการดูแล' },
  
  // Textile Model & Color Codes
  model_code: { type: 'string', required: false, description: 'รหัสรุ่น (สำหรับสิ่งทอ)' },
  color_code: { type: 'string', required: false, description: 'รหัสสี (สำหรับสิ่งทอ)' },
  
  // Lot Tracking Configuration
  enable_lot_tracking: { type: 'boolean', required: false, default: false, description: 'เปิดใช้การติดตาม Lot' },
  lot_format: { type: 'string', required: false, description: 'รูปแบบ Lot (เช่น {model}-{color}-{width}-{sequence})' },
  
  // Legacy fields (รองรับ field เดิม)
  name: { type: 'string', required: false, description: 'ชื่อสินค้า (legacy)' },
  productName: { type: 'string', required: false, description: 'ชื่อสินค้า (legacy)' },
  
  // System fields
  id: { type: 'string', required: false, readonly: true, description: 'รหัสระบบ' },
  type: { type: 'string', required: false, default: 'product', readonly: true, description: 'ประเภทธุรกรรม' },
  state: { type: 'string', required: false, default: 'active', description: 'สถานะระบบ' },
  created_at: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, readonly: true, description: 'ผู้สร้าง' },
  updated_at: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข' },
  updated_by: { type: 'string', required: false, readonly: true, description: 'ผู้แก้ไข' },
  updated_date: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข (legacy)' },
  version: { type: 'number', required: false, readonly: true, default: 1, description: 'เวอร์ชัน' }
}

// Export all schemas
export default {
  PRODUCT_TYPES,
  PRODUCT_STATUS,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  TAX_TYPES,
  PRICE_TYPES,
  INVENTORY_TRACKING,
  PRODUCT_LIFECYCLE,
  QUALITY_GRADES,
  STORAGE_CONDITIONS,
  TRANSACTION_STATUS,
  PRIORITY_LEVELS,
  PRODUCT_SCHEMA
}