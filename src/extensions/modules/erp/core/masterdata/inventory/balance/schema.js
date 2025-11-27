/**
 * Inventory Balance Schema
 * 
 * เก็บ snapshot รวมของสต็อกสินค้าแต่ละรายการ (ทุก location)
 * ข้อมูลนี้เป็น derived data ที่คำนวณจาก Movement Log ทั้งหมด
 * 
 * หลักการใหม่: Product-Centric Balance Management
 * - Movement = log ทุกครั้งที่ของขยับ พร้อม location (append-only)
 * - Balance = สต็อครวมของสินค้าแต่ละตัว (calculated from all movements)
 * - Location tracking = ดูใน Movement Log, ไม่เก็บใน Balance
 */

export const INVENTORY_BALANCE_SCHEMA = {
  // Primary Key - เก็บแค่ product เดียว
  product_id: {
    type: 'string',
    required: true,
    description: 'รหัสสินค้า (FK to products) - Primary Key'
  },
  
  product_code: {
    type: 'string',
    required: true,
    description: 'รหัส SKU ของสินค้า (for quick reference)'
  },
  
  // Stock Quantities - รวมทุก Location
  qty_on_hand: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวนสินค้าคงเหลือรวมทั้งหมด (ทุก location)'
  },
  
  qty_reserved: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวนที่จองไว้รวม (เช่น สั่งขายแล้วแต่ยังไม่ตัดออก)'
  },
  
  qty_available: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวนที่พร้อมใช้งานรวม = qty_on_hand - qty_reserved'
  },
  
  qty_allocated: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวนที่จัดสรรสำหรับ production order รวม'
  },
  
  qty_in_transit: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวนที่อยู่ระหว่างการโอนคลังรวม'
  },
  
  // Location Distribution - ข้อมูลสรุป
  total_locations: {
    type: 'number',
    required: true,
    default: 0,
    description: 'จำนวน location ที่มีสต็อก'
  },
  
  location_summary: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        location_code: { type: 'string' },
        qty_on_hand: { type: 'number' },
        last_updated: { type: 'string', format: 'date-time' }
      }
    },
    description: 'สรุปการกระจายตาม location (computed field)'
  },
  
  // Cost Information - รวมทุก Location
  weighted_avg_cost: {
    type: 'number',
    required: false,
    default: 0,
    description: 'ต้นทุนเฉลี่ยถ่วงน้ำหนักรวม (จากทุก location)'
  },
  
  total_cost_value: {
    type: 'number',
    required: false,
    default: 0,
    description: 'มูลค่าสต็อกรวม = qty_on_hand * weighted_avg_cost'
  },
  
  cost_method: {
    type: 'string',
    enum: ['FIFO', 'LIFO', 'WEIGHTED_AVERAGE', 'STANDARD'],
    default: 'WEIGHTED_AVERAGE',
    description: 'วิธีการคำนวณต้นทุนรวม'
  },
  
  // Movement Statistics
  total_movements_in: {
    type: 'number',
    required: true,
    default: 0,
    description: 'ยอดรวมการรับเข้าทั้งหมด'
  },
  
  total_movements_out: {
    type: 'number',
    required: true,
    default: 0,
    description: 'ยอดรวมการจ่ายออกทั้งหมด'
  },
  
  // Tracking Information
  last_movement_id: {
    type: 'string',
    required: false,
    description: 'รหัส movement ล่าสุดที่อัพเดต balance นี้'
  },
  
  last_movement_date: {
    type: 'string',
    format: 'date-time',
    required: false,
    description: 'วันที่ movement ล่าสุด'
  },
  
  last_calculated: {
    type: 'string',
    format: 'date-time',
    required: true,
    description: 'วันเวลาที่คำนวณ balance ล่าสุด'
  },
  
  // Alert Thresholds
  min_stock_level: {
    type: 'number',
    required: false,
    default: 0,
    description: 'ระดับสต็อกขั้นต่ำ (สำหรับแจ้งเตือน)'
  },
  
  max_stock_level: {
    type: 'number',
    required: false,
    description: 'ระดับสต็อกสูงสุด (สำหรับแจ้งเตือน)'
  },
  
  reorder_point: {
    type: 'number',
    required: false,
    description: 'จุดสั่งซื้อใหม่'
  },
  
  reorder_quantity: {
    type: 'number',
    required: false,
    description: 'จำนวนที่ควรสั่งซื้อ'
  },
  
  // Status and Flags
  is_active: {
    type: 'boolean',
    default: true,
    description: 'สถานะการใช้งาน'
  },
  
  is_negative_allowed: {
    type: 'boolean',
    default: false,
    description: 'อนุญาตให้สต็อกติดลบหรือไม่'
  },
  
  lock_status: {
    type: 'string',
    enum: ['UNLOCKED', 'LOCKED', 'FROZEN'],
    default: 'UNLOCKED',
    description: 'สถานะการล็อค (ป้องกันการเปลี่ยนแปลง)'
  },
  
  // Audit Trail
  created_by: {
    type: 'string',
    required: true,
    description: 'ผู้สร้างรายการ'
  },
  
  updated_by: {
    type: 'string',
    required: true,
    description: 'ผู้แก้ไขล่าสุด'
  },
  
  created_date: {
    type: 'string',
    format: 'date-time',
    required: true,
    description: 'วันที่สร้างรายการ'
  },
  
  updated_date: {
    type: 'string',
    format: 'date-time',
    required: true,
    description: 'วันที่แก้ไขล่าสุด'
  },
  
  // System Fields
  version: {
    type: 'number',
    required: false,
    default: 1,
    description: 'เวอร์ชันของข้อมูล (สำหรับ version control)'
  },
  
  // Metadata
  notes: {
    type: 'string',
    description: 'หมายเหตุเพิ่มเติม'
  },
  
  tags: {
    type: 'array',
    items: { type: 'string' },
    description: 'แท็กสำหรับจัดกลุ่ม'
  }
}

// Index Definitions - สำหรับ Product-Centric Balance
export const INVENTORY_BALANCE_INDEXES = [
  // Primary index - product only
  { fields: ['product_id'], unique: true },
  
  // Query optimization indexes
  { fields: ['product_code'], unique: true },
  { fields: ['qty_available'] },
  { fields: ['qty_on_hand'] },
  { fields: ['last_calculated'] },
  
  // Alert indexes
  { fields: ['qty_on_hand', 'min_stock_level'] },
  { fields: ['weighted_avg_cost'] },
  { fields: ['is_active'] },
  { fields: ['lock_status'] },
  
  // Performance indexes
  { fields: ['total_locations'] },
  { fields: ['last_movement_date'] }
]

// Business Rules
export const INVENTORY_BALANCE_RULES = {
  // Validation Rules
  validateQuantities: {
    description: 'qty_available = qty_on_hand - qty_reserved',
    enforce: true
  },
  
  validateCost: {
    description: 'total_cost = qty_on_hand * unit_cost',
    enforce: true
  },
  
  negativeStockControl: {
    description: 'ป้องกันสต็อกติดลบถ้า is_negative_allowed = false',
    enforce: true
  },
  
  // Business Logic
  autoCalculation: {
    triggers: ['movement_created', 'movement_updated', 'movement_deleted'],
    action: 'recalculate_balance',
    description: 'คำนวณ balance ใหม่เมื่อมี movement เปลี่ยนแปลง'
  },
  
  alertThresholds: {
    low_stock: 'qty_available <= min_stock_level',
    overstock: 'qty_on_hand >= max_stock_level',
    reorder_needed: 'qty_available <= reorder_point'
  }
}

// Helper Functions - Product-Centric
export const INVENTORY_BALANCE_HELPERS = {
  /**
   * คำนวณ qty_available จาก qty_on_hand และ qty_reserved
   */
  calculateAvailableQuantity: (onHand, reserved) => {
    return Math.max(0, (onHand || 0) - (reserved || 0))
  },
  
  /**
   * คำนวณ total_cost_value จาก qty_on_hand และ weighted_avg_cost
   */
  calculateTotalCostValue: (quantity, weightedAvgCost) => {
    return (quantity || 0) * (weightedAvgCost || 0)
  },
  
  /**
   * คำนวณ weighted average cost จาก movements
   */
  calculateWeightedAverageCost: (movements) => {
    let totalValue = 0
    let totalQuantity = 0
    
    movements.filter(m => m.movement_type === 'IN').forEach(movement => {
      const qty = parseFloat(movement.quantity) || 0
      const cost = parseFloat(movement.unit_cost) || 0
      totalValue += qty * cost
      totalQuantity += qty
    })
    
    return totalQuantity > 0 ? totalValue / totalQuantity : 0
  },
  
  /**
   * สร้าง location summary จาก movements
   */
  generateLocationSummary: (movements) => {
    const locationMap = new Map()
    
    movements.forEach(movement => {
      const location = movement.location_code || 'UNKNOWN'
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location_code: location,
          qty_on_hand: 0,
          last_updated: movement.movement_date
        })
      }
      
      const locationData = locationMap.get(location)
      const qty = parseFloat(movement.quantity) || 0
      
      if (movement.movement_type === 'IN') {
        locationData.qty_on_hand += qty
      } else if (movement.movement_type === 'OUT') {
        locationData.qty_on_hand -= qty
      }
      
      locationData.last_updated = movement.movement_date
    })
    
    return Array.from(locationMap.values()).filter(loc => loc.qty_on_hand > 0)
  },
  
  /**
   * ตรวจสอบสถานะสต็อก
   */
  getStockStatus: (balance) => {
    const { qty_available, min_stock_level, max_stock_level } = balance
    
    if (qty_available <= 0) return 'OUT_OF_STOCK'
    if (min_stock_level && qty_available <= min_stock_level) return 'LOW_STOCK'
    if (max_stock_level && qty_available >= max_stock_level) return 'OVERSTOCK'
    return 'NORMAL'
  },
  
  /**
   * สร้าง unique key สำหรับ balance record (product เดียว)
   */
  generateKey: (productId) => {
    return `BAL_${productId}`
  }
}

export default {
  schema: INVENTORY_BALANCE_SCHEMA,
  indexes: INVENTORY_BALANCE_INDEXES,
  rules: INVENTORY_BALANCE_RULES,
  helpers: INVENTORY_BALANCE_HELPERS
}