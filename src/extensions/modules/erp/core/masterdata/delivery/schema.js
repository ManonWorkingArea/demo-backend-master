/**
 * Delivery Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับการจัดส่ง
 */

// ประเภทการจัดส่ง
export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SAME_DAY: 'same_day',
  NEXT_DAY: 'next_day',
  SCHEDULED: 'scheduled',
  BULK: 'bulk',
  PARTIAL: 'partial',
  DIRECT: 'direct',
  TRANSFER: 'transfer'
}

// สถานะการจัดส่ง
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned',
  CANCELLED: 'cancelled'
}

// วิธีการจัดส่ง
export const SHIPPING_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  POST: 'post',
  EMS: 'ems',
  KERRY: 'kerry',
  DHL: 'dhl',
  FEDEX: 'fedex',
  UPS: 'ups',
  TNT: 'tnt',
  FLASH: 'flash',
  J_AND_T: 'j_and_t',
  NINJA_VAN: 'ninja_van',
  SCG: 'scg',
  BEST: 'best'
}

// ประเภทยานพาหนะ
export const VEHICLE_TYPES = {
  MOTORCYCLE: 'motorcycle',
  CAR: 'car',
  VAN: 'van',
  PICKUP: 'pickup',
  TRUCK_6W: 'truck_6w',
  TRUCK_10W: 'truck_10w',
  TRUCK_18W: 'truck_18w',
  CONTAINER: 'container',
  BOAT: 'boat',
  PLANE: 'plane'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// ประเภทพื้นที่จัดส่ง
export const DELIVERY_ZONES = {
  LOCAL: 'local',
  CITY: 'city',
  PROVINCE: 'province',
  REGION: 'region',
  COUNTRY: 'country',
  INTERNATIONAL: 'international'
}

// สาเหตุความล้มเหลว
export const FAILURE_REASONS = {
  ADDRESS_NOT_FOUND: 'address_not_found',
  CUSTOMER_NOT_AVAILABLE: 'customer_not_available',
  REFUSED_DELIVERY: 'refused_delivery',
  DAMAGE_GOODS: 'damage_goods',
  WEATHER: 'weather',
  VEHICLE_BREAKDOWN: 'vehicle_breakdown',
  TRAFFIC: 'traffic',
  INCORRECT_ADDRESS: 'incorrect_address',
  PAYMENT_ISSUE: 'payment_issue',
  OTHER: 'other'
}

// ประเภทการบรรจุ
export const PACKAGING_TYPES = {
  ENVELOPE: 'envelope',
  BOX: 'box',
  PADDED_BAG: 'padded_bag',
  TUBE: 'tube',
  PALLET: 'pallet',
  CRATE: 'crate',
  BULK: 'bulk',
  LIQUID: 'liquid',
  FROZEN: 'frozen',
  FRAGILE: 'fragile'
}

// การประกันสินค้า
export const INSURANCE_TYPES = {
  NONE: 'none',
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  FULL: 'full'
}

// เงื่อนไขการจัดส่ง
export const DELIVERY_TERMS = {
  EXW: 'exw', // Ex Works
  FCA: 'fca', // Free Carrier
  CPT: 'cpt', // Carriage Paid To
  CIP: 'cip', // Carriage and Insurance Paid To
  DAP: 'dap', // Delivered at Place
  DPU: 'dpu', // Delivered at Place Unloaded
  DDP: 'ddp'  // Delivered Duty Paid
}

// ช่วงเวลาจัดส่ง
export const TIME_SLOTS = {
  MORNING: 'morning',     // 08:00-12:00
  AFTERNOON: 'afternoon', // 13:00-17:00
  EVENING: 'evening',     // 18:00-20:00
  ANYTIME: 'anytime',     // ทั้งวัน
  SPECIFIC: 'specific'    // เวลาที่กำหนด
}

// Labels สำหรับแสดงผล
export const DELIVERY_TYPE_LABELS = {
  [DELIVERY_TYPES.STANDARD]: 'ส่งปกติ',
  [DELIVERY_TYPES.EXPRESS]: 'ส่งด่วน',
  [DELIVERY_TYPES.SAME_DAY]: 'ส่งวันเดียว',
  [DELIVERY_TYPES.NEXT_DAY]: 'ส่งวันถัดไป',
  [DELIVERY_TYPES.SCHEDULED]: 'ส่งตามกำหนด',
  [DELIVERY_TYPES.BULK]: 'ส่งจำนวนมาก',
  [DELIVERY_TYPES.PARTIAL]: 'ส่งบางส่วน',
  [DELIVERY_TYPES.DIRECT]: 'ส่งตรง',
  [DELIVERY_TYPES.TRANSFER]: 'โอนย้าย'
}

export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUS.PENDING]: 'รอดำเนินการ',
  [DELIVERY_STATUS.PREPARING]: 'กำลังเตรียม',
  [DELIVERY_STATUS.READY]: 'พร้อมส่ง',
  [DELIVERY_STATUS.PICKED_UP]: 'รับของแล้ว',
  [DELIVERY_STATUS.IN_TRANSIT]: 'ระหว่างการส่ง',
  [DELIVERY_STATUS.OUT_FOR_DELIVERY]: 'กำลังจัดส่ง',
  [DELIVERY_STATUS.DELIVERED]: 'จัดส่งแล้ว',
  [DELIVERY_STATUS.FAILED]: 'จัดส่งไม่สำเร็จ',
  [DELIVERY_STATUS.RETURNED]: 'ส่งคืน',
  [DELIVERY_STATUS.CANCELLED]: 'ยกเลิก'
}

export const SHIPPING_METHOD_LABELS = {
  [SHIPPING_METHODS.PICKUP]: 'รับเอง',
  [SHIPPING_METHODS.DELIVERY]: 'จัดส่ง',
  [SHIPPING_METHODS.POST]: 'ไปรษณีย์',
  [SHIPPING_METHODS.EMS]: 'อีเอ็มเอส',
  [SHIPPING_METHODS.KERRY]: 'เคอรี่',
  [SHIPPING_METHODS.DHL]: 'ดีเอชแอล',
  [SHIPPING_METHODS.FEDEX]: 'เฟดเอ็กซ์',
  [SHIPPING_METHODS.UPS]: 'ยูพีเอส',
  [SHIPPING_METHODS.TNT]: 'ทีเอ็นที',
  [SHIPPING_METHODS.FLASH]: 'แฟลช',
  [SHIPPING_METHODS.J_AND_T]: 'เจแอนด์ที',
  [SHIPPING_METHODS.NINJA_VAN]: 'นินจาแวน',
  [SHIPPING_METHODS.SCG]: 'เอสซีจี',
  [SHIPPING_METHODS.BEST]: 'เบสท์'
}

export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.MOTORCYCLE]: 'มอเตอร์ไซค์',
  [VEHICLE_TYPES.CAR]: 'รถยนต์',
  [VEHICLE_TYPES.VAN]: 'รถตู้',
  [VEHICLE_TYPES.PICKUP]: 'รถกระบะ',
  [VEHICLE_TYPES.TRUCK_6W]: 'รถบรรทุก 6 ล้อ',
  [VEHICLE_TYPES.TRUCK_10W]: 'รถบรรทุก 10 ล้อ',
  [VEHICLE_TYPES.TRUCK_18W]: 'รถบรรทุก 18 ล้อ',
  [VEHICLE_TYPES.CONTAINER]: 'คอนเทนเนอร์',
  [VEHICLE_TYPES.BOAT]: 'เรือ',
  [VEHICLE_TYPES.PLANE]: 'เครื่องบิน'
}

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'ต่ำ',
  [PRIORITY_LEVELS.NORMAL]: 'ปกติ',
  [PRIORITY_LEVELS.HIGH]: 'สูง',
  [PRIORITY_LEVELS.URGENT]: 'ด่วน',
  [PRIORITY_LEVELS.CRITICAL]: 'ด่วนที่สุด'
}

export const DELIVERY_ZONE_LABELS = {
  [DELIVERY_ZONES.LOCAL]: 'พื้นที่ใกล้เคียง',
  [DELIVERY_ZONES.CITY]: 'ในเมือง',
  [DELIVERY_ZONES.PROVINCE]: 'ในจังหวัด',
  [DELIVERY_ZONES.REGION]: 'ในภูมิภาค',
  [DELIVERY_ZONES.COUNTRY]: 'ในประเทศ',
  [DELIVERY_ZONES.INTERNATIONAL]: 'ต่างประเทศ'
}

export const FAILURE_REASON_LABELS = {
  [FAILURE_REASONS.ADDRESS_NOT_FOUND]: 'หาที่อยู่ไม่เจอ',
  [FAILURE_REASONS.CUSTOMER_NOT_AVAILABLE]: 'ติดต่อลูกค้าไม่ได้',
  [FAILURE_REASONS.REFUSED_DELIVERY]: 'ลูกค้าปฏิเสธรับของ',
  [FAILURE_REASONS.DAMAGE_GOODS]: 'สินค้าเสียหาย',
  [FAILURE_REASONS.WEATHER]: 'สภาพอากาศไม่เอื้ออำนวย',
  [FAILURE_REASONS.VEHICLE_BREAKDOWN]: 'รถเสีย',
  [FAILURE_REASONS.TRAFFIC]: 'รถติด',
  [FAILURE_REASONS.INCORRECT_ADDRESS]: 'ที่อยู่ไม่ถูกต้อง',
  [FAILURE_REASONS.PAYMENT_ISSUE]: 'ปัญหาการชำระเงิน',
  [FAILURE_REASONS.OTHER]: 'อื่นๆ'
}

export const TIME_SLOT_LABELS = {
  [TIME_SLOTS.MORNING]: 'ช่วงเช้า (08:00-12:00)',
  [TIME_SLOTS.AFTERNOON]: 'ช่วงบ่าย (13:00-17:00)',
  [TIME_SLOTS.EVENING]: 'ช่วงเย็น (18:00-20:00)',
  [TIME_SLOTS.ANYTIME]: 'ทั้งวัน',
  [TIME_SLOTS.SPECIFIC]: 'เวลาที่กำหนด'
}

// การกำหนดค่าระบบ
export const DELIVERY_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    DELIVERY_NOTE: 'DN{year}{month}-{number:4}',
    TRACKING: 'TK{year}{month}{day}-{number:6}',
    ROUTE: 'RT{year}{month}{day}-{number:3}'
  },
  
  // ค่าจัดส่งเริ่มต้น
  DEFAULT_SHIPPING_RATES: {
    [DELIVERY_ZONES.LOCAL]: 30,
    [DELIVERY_ZONES.CITY]: 50,
    [DELIVERY_ZONES.PROVINCE]: 80,
    [DELIVERY_ZONES.REGION]: 120,
    [DELIVERY_ZONES.COUNTRY]: 200,
    [DELIVERY_ZONES.INTERNATIONAL]: 500
  },
  
  // น้ำหนักสูงสุดต่อประเภทยานพาหนะ (กิโลกรัม)
  VEHICLE_WEIGHT_LIMITS: {
    [VEHICLE_TYPES.MOTORCYCLE]: 20,
    [VEHICLE_TYPES.CAR]: 500,
    [VEHICLE_TYPES.VAN]: 1000,
    [VEHICLE_TYPES.PICKUP]: 1500,
    [VEHICLE_TYPES.TRUCK_6W]: 5000,
    [VEHICLE_TYPES.TRUCK_10W]: 10000,
    [VEHICLE_TYPES.TRUCK_18W]: 25000,
    [VEHICLE_TYPES.CONTAINER]: 30000
  },
  
  // เวลาจัดส่งเริ่มต้น
  DEFAULT_DELIVERY_TIME: {
    [DELIVERY_TYPES.STANDARD]: 3, // 3 วัน
    [DELIVERY_TYPES.EXPRESS]: 1,  // 1 วัน
    [DELIVERY_TYPES.SAME_DAY]: 0, // วันเดียวกัน
    [DELIVERY_TYPES.NEXT_DAY]: 1  // วันถัดไป
  },
  
  // จำนวนครั้งที่พยายามจัดส่งใหม่
  MAX_DELIVERY_ATTEMPTS: 3,
  
  // ระยะเวลารอก่อนส่งคืน (วัน)
  RETURN_WAITING_DAYS: 7,
  
  // ระยะเวลาติดตาม (วัน)
  TRACKING_DAYS: 30
}

// ค่าเริ่มต้นของข้อมูล
export const DELIVERY_DEFAULTS = {
  type: DELIVERY_TYPES.STANDARD,
  status: DELIVERY_STATUS.PENDING,
  method: SHIPPING_METHODS.DELIVERY,
  vehicle_type: VEHICLE_TYPES.VAN,
  priority: PRIORITY_LEVELS.NORMAL,
  zone: DELIVERY_ZONES.LOCAL,
  time_slot: TIME_SLOTS.ANYTIME,
  packaging_type: PACKAGING_TYPES.BOX,
  insurance_type: INSURANCE_TYPES.BASIC,
  delivery_attempts: 0,
  is_cod: false, // Cash on Delivery
  is_fragile: false,
  is_perishable: false,
  requires_signature: true
}

// Transaction States - สถานะการทำธุรกรรม Delivery
export const DELIVERY_STATES = ['scheduled', 'picking', 'packed', 'ready_to_ship', 'shipped', 'delivered', 'completed']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const DELIVERY_TRANSITIONS = {
  'scheduled': ['packed'],
  'picking': ['packed', 'scheduled'],
  'packed': ['ready_to_ship', 'scheduled'],
  'ready_to_ship': ['shipped', 'packed'],
  'shipped': ['delivered', 'packed'],
  'delivered': ['completed'],
  'completed': [] // สถานะสุดท้าย
}

// Initial State
export const DELIVERY_INITIAL_STATE = 'scheduled'

// Storage Key
export const DELIVERY_STORAGE_KEY = 'erp_delivery_transactions'

// Field Schema สำหรับ Delivery Transaction
export const DELIVERY_FIELD_SCHEMA = {
  // Basic Information
  id: { type: 'string', required: true },
  delivery_number: { type: 'string', required: true },
  status: { type: 'string', required: true, enum: DELIVERY_STATES },
  
  // Work Order Integration
  work_order_id: { type: 'string', required: false },
  work_order_number: { type: 'string', required: false },
  sales_order_id: { type: 'string', required: false },
  sales_order_number: { type: 'string', required: false },
  work_order_completed_date: { type: 'date', required: false },
  
  // Customer Information
  customer_name: { type: 'string', required: false },
  customer_phone: { type: 'string', required: false },
  customer_email: { type: 'string', required: false },
  customer_tax_id: { type: 'string', required: false },
  
  // Delivery Details
  delivery_type: { type: 'string', required: false, enum: Object.values(DELIVERY_TYPES) },
  shipping_method: { type: 'string', required: false, enum: Object.values(SHIPPING_METHODS) },
  priority: { type: 'string', required: false, enum: Object.values(PRIORITY_LEVELS) },
  
  // Shipping & Tracking
  selected_carrier: { type: 'string', required: false },
  shipping_label_number: { type: 'string', required: false },
  shipping_label_printed: { type: 'boolean', required: false },
  ready_to_ship_date: { type: 'date', required: false },
  tracking_number: { type: 'string', required: false },
  carrier: { type: 'string', required: false },
  shipped_date: { type: 'date', required: false },
  estimated_delivery_date: { type: 'date', required: false },
  actual_delivery_date: { type: 'date', required: false },
  delivery_confirmed_by: { type: 'string', required: false },
  delivery_time: { type: 'string', required: false },
  
  // Address
  shipping_address: { 
    type: 'object', 
    required: false,
    properties: {
      company: { type: 'string' },
      address1: { type: 'string' },
      address2: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      postal_code: { type: 'string' },
      country: { type: 'string' }
    }
  },
  
  // Items
  items: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        product_id: { type: 'string' },
        product_name: { type: 'string' },
        product_code: { type: 'string' },
        description: { type: 'string' },
        quantity: { type: 'number' },
        picked_quantity: { type: 'number' },
        delivery_quantity: { type: 'number' },
        unit: { type: 'string' },
        unit_price: { type: 'number' },
        status: { type: 'string' }
      }
    }
  },
  
  // Financial
  total_amount: { type: 'number', required: false },
  shipping_cost: { type: 'number', required: false },
  costs: {
    type: 'object',
    required: false,
    properties: {
      packaging_cost: { type: 'number' },
      handling_cost: { type: 'number' },
      insurance_cost: { type: 'number' }
    }
  },
  discount_amount: { type: 'number', required: false },
  
  // Status tracking
  items_status: { type: 'string', required: false },
  
  // Dates
  scheduled_date: { type: 'date', required: false },
  created_date: { type: 'date', required: false },
  updated_date: { type: 'date', required: false },
  
  // Activities & Notes
  activities: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        user: { type: 'string' },
        timestamp: { type: 'date' },
        notes: { type: 'string' }
      }
    }
  },
  notes: { type: 'string', required: false },
  internal_notes: { type: 'string', required: false },
  
  // Document references
  receipt_id: { type: 'string', required: false },
  receipt_number: { type: 'string', required: false },
  tax_invoice_id: { type: 'string', required: false },
  tax_invoice_number: { type: 'string', required: false }
}