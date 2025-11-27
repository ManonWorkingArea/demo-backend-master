/**
 * Purchase Schema Definitions
 * ข้อมูล Schema สำหรับระบบ Purchase
 */

// Purchase Types - ประเภทการซื้อ
export const PURCHASE_TYPES = {
  STANDARD: 'standard',
  SERVICE: 'service',
  URGENT: 'urgent',
  BLANKET_ORDER: 'blanket_order',
  CONTRACT: 'contract',
  SPOT_BUY: 'spot_buy',
  CONSIGNMENT: 'consignment',
  DROP_SHIP: 'drop_ship'
}

// Purchase Status - สถานะการซื้อ
export const PURCHASE_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  SENT: 'sent',
  ACKNOWLEDGED: 'acknowledged',
  PARTIALLY_RECEIVED: 'partially_received',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
}

// Purchase Priorities - ความสำคัญ
export const PURCHASE_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// Payment Terms - เงื่อนไขการชำระเงิน
export const PAYMENT_TERMS = {
  CASH_ON_DELIVERY: 'cash_on_delivery',
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_45: 'net_45',
  NET_60: 'net_60',
  ADVANCE_PAYMENT: 'advance_payment',
  CREDIT_TERMS: 'credit_terms'
}

// Delivery Terms - เงื่อนไขการส่งมอบ
export const DELIVERY_TERMS = {
  EXW: 'exw', // Ex Works
  FCA: 'fca', // Free Carrier
  FOB: 'fob', // Free on Board
  CIF: 'cif', // Cost, Insurance and Freight
  DDP: 'ddp', // Delivered Duty Paid
  CUSTOM: 'custom'
}

// Supplier Types - ประเภทผู้จำหน่าย
export const SUPPLIER_TYPES = {
  MANUFACTURER: 'manufacturer',
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer',
  SERVICE_PROVIDER: 'service_provider',
  CONTRACTOR: 'contractor',
  CONSULTANT: 'consultant'
}

// Approval Levels - ระดับการอนุมัติ
export const APPROVAL_LEVELS = {
  AUTO_APPROVE: 'auto_approve',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  DIRECTOR: 'director',
  BOARD: 'board'
}

// Transaction States - สถานะการทำธุรกรรม Purchase
// ✅ เพิ่ม 'pending_approval' เพื่อให้ตรงกับ PURCHASE_STATUS
export const PURCHASE_STATES = ['draft', 'pending_approval', 'approved', 'received', 'invoiced', 'complete']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const PURCHASE_TRANSITIONS = {
  'draft': ['pending_approval', 'approved'], // ✅ จาก draft สามารถไป pending_approval หรือ approved ได้
  'pending_approval': ['approved', 'draft'], // ✅ จาก pending_approval สามารถอนุมัติหรือกลับไป draft ได้
  'approved': ['received'],
  'received': ['invoiced'],
  'invoiced': ['complete'],
  'complete': [] // สถานะสุดท้าย
}

// Initial State
export const PURCHASE_INITIAL_STATE = 'draft'

// Storage Key
export const PURCHASE_STORAGE_KEY = 'erp_purchase_transactions'

// ✅ Purchase Request Schema - Field Definitions
export const PURCHASE_REQUEST_SCHEMA = {
  // Basic Information
  purchase_request_code: { type: 'string', required: false, description: 'รหัสใบขอซื้อ' },
  description: { type: 'string', required: true, description: 'รายละเอียดใบขอซื้อ' },
  department: { type: 'string', required: false, description: 'แผนก' },
  requested_by: { type: 'string', required: true, description: 'ผู้ขอซื้อ' },
  priority: { 
    type: 'string', 
    required: false, 
    default: 'normal',
    enum: Object.values(PURCHASE_PRIORITIES),
    description: 'ระดับความสำคัญ' 
  },
  purchase_type: { 
    type: 'string', 
    required: false, 
    default: 'general',
    enum: ['general', 'stock_replenishment', 'project_specific', 'maintenance', 'office_supplies'],
    description: 'ประเภทการซื้อ' 
  },
  category: { type: 'string', required: false, description: 'หมวดหมู่' },
  expected_delivery_date: { type: 'date', required: false, description: 'วันที่ต้องการใช้' },
  justification: { type: 'string', required: false, description: 'เหตุผลความจำเป็น' },

  // Items
  items: { 
    type: 'array', 
    required: true, 
    minLength: 1,
    description: 'รายการสินค้า',
    itemSchema: {
      product_id: { type: 'string', required: false },
      sku: { type: 'string', required: false },
      product_name: { type: 'string', required: true },
      quantity: { type: 'number', required: true, min: 1 },
      unit: { type: 'string', required: false, default: 'ชิ้น' },
      unit_price: { type: 'number', required: true, min: 0 },
      total: { type: 'number', required: false },
      specifications: { type: 'string', required: false },
      current_stock: { type: 'number', required: false },
      min_stock: { type: 'number', required: false },
      reorder_point: { type: 'number', required: false },
      is_new_product: { type: 'boolean', required: false, default: false }
    }
  },

  // Financial Information
  subtotal: { type: 'number', required: false, min: 0, description: 'ยอดรวมก่อนภาษี' },
  tax_amount: { type: 'number', required: false, min: 0, description: 'จำนวนภาษี (7%)' },
  total_amount: { type: 'number', required: false, min: 0, description: 'ยอดรวมทั้งสิ้น' },

  // Additional Information
  delivery_address: { type: 'string', required: false, description: 'ที่อยู่จัดส่ง' },
  supplier_suggestion: { type: 'string', required: false, description: 'ผู้ขายที่แนะนำ' },
  payment_terms: { 
    type: 'string', 
    required: false, 
    default: '30_days',
    enum: ['cash', '15_days', '30_days', '45_days', '60_days'],
    description: 'เงื่อนไขการชำระเงิน' 
  },
  budget_code: { type: 'string', required: false, description: 'รหัสงบประมาณ' },
  cost_center: { type: 'string', required: false, description: 'ศูนย์ต้นทุน' },
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },

  // Stock Replenishment Fields
  inventory_impact: { type: 'boolean', required: false, default: false, description: 'ส่งผลต่อสต็อค' },
  auto_update_stock: { type: 'boolean', required: false, default: true, description: 'อัปเดตสต็อคอัตโนมัติ' },
  new_products: { type: 'array', required: false, description: 'สินค้าใหม่ที่ต้องสร้าง' },
  is_stock_replenishment: { type: 'boolean', required: false, default: false, description: 'การเพิ่มสต็อค' },
  stock_impact_items: { 
    type: 'array', 
    required: false, 
    description: 'รายการที่ส่งผลต่อสต็อค',
    itemSchema: {
      sku: { type: 'string', required: true },
      current_stock: { type: 'number', required: false },
      min_stock: { type: 'number', required: false },
      reorder_quantity: { type: 'number', required: true },
      expected_stock_after: { type: 'number', required: false }
    }
  },

  // Workflow Fields
  status: { 
    type: 'string', 
    required: false, 
    default: 'draft',
    enum: Object.values(PURCHASE_STATUS),
    description: 'สถานะใบขอซื้อ' 
  },
  workflow_state: { 
    type: 'string', 
    required: false, 
    default: 'draft',
    enum: PURCHASE_STATES,
    description: 'สถานะ workflow' 
  },
  subtype: { 
    type: 'string', 
    required: false, 
    default: 'purchase_request',
    description: 'ประเภทย่อย' 
  },

  // System Fields
  id: { type: 'string', required: false, readonly: true, description: 'รหัสระบบ' },
  type: { type: 'string', required: false, default: 'purchase', readonly: true, description: 'ประเภทธุรกรรม' },
  state: { type: 'string', required: false, default: 'draft', description: 'สถานะระบบ' },
  created_at: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง' },
  created_by: { type: 'string', required: false, readonly: true, description: 'ผู้สร้าง' },
  updated_at: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข' },
  updated_by: { type: 'string', required: false, readonly: true, description: 'ผู้แก้ไข' },
  created_date: { type: 'date', required: false, readonly: true, description: 'วันที่สร้าง (legacy)' },
  updated_date: { type: 'date', required: false, readonly: true, description: 'วันที่แก้ไข (legacy)' },
  version: { type: 'number', required: false, readonly: true, default: 1, description: 'เวอร์ชัน' },
  currency: { type: 'string', required: false, default: 'THB', description: 'สกุลเงิน' },
  exchange_rate: { type: 'number', required: false, default: 1, description: 'อัตราแลกเปลี่ยน' },
  approval_status: { type: 'string', required: false, default: 'pending', description: 'สถานะการอนุมัติ' },
  sync_status: { type: 'string', required: false, default: 'pending', description: 'สถานะการซิงค์' },
  
  // Approval Fields (ควรจะสร้างจาก system logic)
  approved_by: { type: 'string', required: false, readonly: true, description: 'ผู้อนุมัติ' },
  approved_date: { type: 'date', required: false, readonly: true, description: 'วันที่อนุมัติ' }
}

// ✅ Purchase Order Schema - Field Definitions
export const PURCHASE_ORDER_SCHEMA = {
  // Inherit from Purchase Request Schema
  ...PURCHASE_REQUEST_SCHEMA,
  
  // Additional PO specific fields
  po_number: { type: 'string', required: true, description: 'เลขที่ใบสั่งซื้อ' },
  supplier_id: { type: 'string', required: true, description: 'รหัสผู้ขาย' },
  supplier_name: { type: 'string', required: true, description: 'ชื่อผู้ขาย' },
  delivery_terms: { 
    type: 'string', 
    required: false,
    enum: Object.values(DELIVERY_TERMS),
    description: 'เงื่อนไขการส่งมอบ' 
  },
  approval_level: { 
    type: 'string', 
    required: false,
    enum: Object.values(APPROVAL_LEVELS),
    description: 'ระดับการอนุมัติ' 
  },
  approved_by: { type: 'string', required: false, description: 'ผู้อนุมัติ' },
  approved_date: { type: 'date', required: false, description: 'วันที่อนุมัติ' },
  sent_date: { type: 'date', required: false, description: 'วันที่ส่ง PO' },
  acknowledged_date: { type: 'date', required: false, description: 'วันที่ผู้ขายรับทราบ' }
}

// ✅ Export all schemas and constants
export default {
  PURCHASE_TYPES,
  PURCHASE_STATUS,
  PURCHASE_PRIORITIES,
  PAYMENT_TERMS,
  DELIVERY_TERMS,
  SUPPLIER_TYPES,
  APPROVAL_LEVELS,
  PURCHASE_STATES,
  PURCHASE_TRANSITIONS,
  PURCHASE_INITIAL_STATE,
  PURCHASE_STORAGE_KEY,
  PURCHASE_REQUEST_SCHEMA,
  PURCHASE_ORDER_SCHEMA
}