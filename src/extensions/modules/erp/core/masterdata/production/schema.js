/**
 * Production Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับการผลิต
 */

// ประเภทการผลิต
export const PRODUCTION_TYPES = {
  MAKE_TO_STOCK: 'make_to_stock',
  MAKE_TO_ORDER: 'make_to_order',
  ASSEMBLY: 'assembly',
  MANUFACTURING: 'manufacturing',
  BATCH: 'batch',
  CONTINUOUS: 'continuous',
  JOB_SHOP: 'job_shop',
  FLOW_SHOP: 'flow_shop',
  PROJECT: 'project',
  CUSTOM: 'custom'
}

// สถานะการผลิต
export const PRODUCTION_STATUS = {
  DRAFT: 'draft',
  PLANNED: 'planned',
  SCHEDULED: 'scheduled',
  RELEASED: 'released',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
  QUALITY_CHECK: 'quality_check'
}

// สถานะใบสั่งผลิต
export const PRODUCTION_ORDER_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
}

// ประเภทกระบวนการผลิต
export const PROCESS_TYPES = {
  CUTTING: 'cutting',
  WELDING: 'welding',
  MACHINING: 'machining',
  ASSEMBLY: 'assembly',
  PAINTING: 'painting',
  TESTING: 'testing',
  PACKAGING: 'packaging',
  INSPECTION: 'inspection',
  HEAT_TREATMENT: 'heat_treatment',
  SURFACE_TREATMENT: 'surface_treatment'
}

// สถานะกระบวนการ
export const PROCESS_STATUS = {
  PENDING: 'pending',
  SETUP: 'setup',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// ประเภทของเสีย
export const SCRAP_TYPES = {
  MATERIAL_DEFECT: 'material_defect',
  PROCESS_ERROR: 'process_error',
  MACHINE_MALFUNCTION: 'machine_malfunction',
  OPERATOR_ERROR: 'operator_error',
  DESIGN_CHANGE: 'design_change',
  QUALITY_REJECT: 'quality_reject',
  SETUP_WASTE: 'setup_waste',
  OTHER: 'other'
}

// ประเภทการตรวจสอบคุณภาพ
export const QUALITY_CHECK_TYPES = {
  INCOMING: 'incoming',
  IN_PROCESS: 'in_process',
  FINAL: 'final',
  RANDOM: 'random',
  FIRST_ARTICLE: 'first_article',
  LAST_ARTICLE: 'last_article'
}

// ผลการตรวจสอบคุณภาพ
export const QUALITY_RESULTS = {
  PASS: 'pass',
  FAIL: 'fail',
  CONDITIONAL: 'conditional',
  REWORK: 'rework',
  SCRAP: 'scrap'
}

// ประเภทเครื่องจักร
export const MACHINE_TYPES = {
  CNC: 'cnc',
  LATHE: 'lathe',
  MILLING: 'milling',
  PRESS: 'press',
  WELDING_MACHINE: 'welding_machine',
  OVEN: 'oven',
  CONVEYOR: 'conveyor',
  ROBOT: 'robot',
  ASSEMBLY_LINE: 'assembly_line',
  TESTING_EQUIPMENT: 'testing_equipment'
}

// สถานะเครื่องจักร
export const MACHINE_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  MAINTENANCE: 'maintenance',
  BREAKDOWN: 'breakdown',
  SETUP: 'setup',
  IDLE: 'idle'
}

// ประเภทการหยุดเครื่อง
export const DOWNTIME_TYPES = {
  PLANNED_MAINTENANCE: 'planned_maintenance',
  BREAKDOWN: 'breakdown',
  SETUP_CHANGEOVER: 'setup_changeover',
  MATERIAL_SHORTAGE: 'material_shortage',
  QUALITY_ISSUE: 'quality_issue',
  OPERATOR_UNAVAILABLE: 'operator_unavailable',
  POWER_OUTAGE: 'power_outage',
  OTHER: 'other'
}

// หน่วยการผลิต
export const PRODUCTION_UNITS = {
  PIECES: 'pieces',
  KILOGRAMS: 'kilograms',
  LITERS: 'liters',
  METERS: 'meters',
  HOURS: 'hours',
  BATCHES: 'batches',
  LOTS: 'lots'
}

// วิธีการคิดต้นทุน
export const COSTING_METHODS = {
  STANDARD: 'standard',
  ACTUAL: 'actual',
  AVERAGE: 'average',
  FIFO: 'fifo',
  LIFO: 'lifo'
}

// Labels สำหรับแสดงผล
export const PRODUCTION_TYPE_LABELS = {
  [PRODUCTION_TYPES.MAKE_TO_STOCK]: 'ผลิตเพื่อสต็อก',
  [PRODUCTION_TYPES.MAKE_TO_ORDER]: 'ผลิตตามออเดอร์',
  [PRODUCTION_TYPES.ASSEMBLY]: 'ประกอบ',
  [PRODUCTION_TYPES.MANUFACTURING]: 'ผลิต',
  [PRODUCTION_TYPES.BATCH]: 'ผลิตแบบชุด',
  [PRODUCTION_TYPES.CONTINUOUS]: 'ผลิตต่อเนื่อง',
  [PRODUCTION_TYPES.JOB_SHOP]: 'ผลิตแบบงาน',
  [PRODUCTION_TYPES.FLOW_SHOP]: 'ผลิตแบบไหล',
  [PRODUCTION_TYPES.PROJECT]: 'โครงการ',
  [PRODUCTION_TYPES.CUSTOM]: 'สั่งทำพิเศษ'
}

export const PRODUCTION_STATUS_LABELS = {
  [PRODUCTION_STATUS.DRAFT]: 'ร่าง',
  [PRODUCTION_STATUS.PLANNED]: 'วางแผนแล้ว',
  [PRODUCTION_STATUS.SCHEDULED]: 'กำหนดเวลาแล้ว',
  [PRODUCTION_STATUS.RELEASED]: 'ปล่อยแล้ว',
  [PRODUCTION_STATUS.IN_PROGRESS]: 'กำลังผลิต',
  [PRODUCTION_STATUS.ON_HOLD]: 'หยุดชั่วคราว',
  [PRODUCTION_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [PRODUCTION_STATUS.CANCELLED]: 'ยกเลิก',
  [PRODUCTION_STATUS.CLOSED]: 'ปิดงาน',
  [PRODUCTION_STATUS.QUALITY_CHECK]: 'ตรวจคุณภาพ'
}

export const PRODUCTION_ORDER_STATUS_LABELS = {
  [PRODUCTION_ORDER_STATUS.DRAFT]: 'ร่าง',
  [PRODUCTION_ORDER_STATUS.CONFIRMED]: 'ยืนยันแล้ว',
  [PRODUCTION_ORDER_STATUS.IN_PROGRESS]: 'กำลังผลิต',
  [PRODUCTION_ORDER_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [PRODUCTION_ORDER_STATUS.CANCELLED]: 'ยกเลิก',
  [PRODUCTION_ORDER_STATUS.ON_HOLD]: 'หยุดชั่วคราว'
}

export const PROCESS_TYPE_LABELS = {
  [PROCESS_TYPES.CUTTING]: 'ตัด',
  [PROCESS_TYPES.WELDING]: 'เชื่อม',
  [PROCESS_TYPES.MACHINING]: 'กลึง',
  [PROCESS_TYPES.ASSEMBLY]: 'ประกอบ',
  [PROCESS_TYPES.PAINTING]: 'ทาสี',
  [PROCESS_TYPES.TESTING]: 'ทดสอบ',
  [PROCESS_TYPES.PACKAGING]: 'บรรจุ',
  [PROCESS_TYPES.INSPECTION]: 'ตรวจสอบ',
  [PROCESS_TYPES.HEAT_TREATMENT]: 'ปรับสภาพความร้อน',
  [PROCESS_TYPES.SURFACE_TREATMENT]: 'ปรับสภาพผิว'
}

export const PROCESS_STATUS_LABELS = {
  [PROCESS_STATUS.PENDING]: 'รอดำเนินการ',
  [PROCESS_STATUS.SETUP]: 'จัดเตรียม',
  [PROCESS_STATUS.RUNNING]: 'กำลังทำงาน',
  [PROCESS_STATUS.COMPLETED]: 'เสร็จแล้ว',
  [PROCESS_STATUS.FAILED]: 'ล้มเหลว',
  [PROCESS_STATUS.ON_HOLD]: 'หยุดชั่วคราว',
  [PROCESS_STATUS.CANCELLED]: 'ยกเลิก'
}

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'ต่ำ',
  [PRIORITY_LEVELS.NORMAL]: 'ปกติ',
  [PRIORITY_LEVELS.HIGH]: 'สูง',
  [PRIORITY_LEVELS.URGENT]: 'ด่วน',
  [PRIORITY_LEVELS.CRITICAL]: 'วิกฤต'
}

export const SCRAP_TYPE_LABELS = {
  [SCRAP_TYPES.MATERIAL_DEFECT]: 'วัตถุดิบบกพร่อง',
  [SCRAP_TYPES.PROCESS_ERROR]: 'ข้อผิดพลาดในกระบวนการ',
  [SCRAP_TYPES.MACHINE_MALFUNCTION]: 'เครื่องจักรขัดข้อง',
  [SCRAP_TYPES.OPERATOR_ERROR]: 'ข้อผิดพลาดของผู้ปฏิบัติงาน',
  [SCRAP_TYPES.DESIGN_CHANGE]: 'เปลี่ยนแปลงแบบ',
  [SCRAP_TYPES.QUALITY_REJECT]: 'คุณภาพไม่ผ่าน',
  [SCRAP_TYPES.SETUP_WASTE]: 'ของเสียจากการจัดเตรียม',
  [SCRAP_TYPES.OTHER]: 'อื่นๆ'
}

export const QUALITY_CHECK_TYPE_LABELS = {
  [QUALITY_CHECK_TYPES.INCOMING]: 'ตรวจรับวัตถุดิบ',
  [QUALITY_CHECK_TYPES.IN_PROCESS]: 'ตรวจระหว่างผลิต',
  [QUALITY_CHECK_TYPES.FINAL]: 'ตรวจสุดท้าย',
  [QUALITY_CHECK_TYPES.RANDOM]: 'ตรวจสุ่ม',
  [QUALITY_CHECK_TYPES.FIRST_ARTICLE]: 'ตรวจชิ้นแรก',
  [QUALITY_CHECK_TYPES.LAST_ARTICLE]: 'ตรวจชิ้นสุดท้าย'
}

export const QUALITY_RESULT_LABELS = {
  [QUALITY_RESULTS.PASS]: 'ผ่าน',
  [QUALITY_RESULTS.FAIL]: 'ไม่ผ่าน',
  [QUALITY_RESULTS.CONDITIONAL]: 'ผ่านมีเงื่อนไข',
  [QUALITY_RESULTS.REWORK]: 'ทำใหม่',
  [QUALITY_RESULTS.SCRAP]: 'ทิ้ง'
}

export const MACHINE_TYPE_LABELS = {
  [MACHINE_TYPES.CNC]: 'เครื่อง CNC',
  [MACHINE_TYPES.LATHE]: 'เครื่องกลึง',
  [MACHINE_TYPES.MILLING]: 'เครื่องมิลลิ่ง',
  [MACHINE_TYPES.PRESS]: 'เครื่องปั๊ม',
  [MACHINE_TYPES.WELDING_MACHINE]: 'เครื่องเชื่อม',
  [MACHINE_TYPES.OVEN]: 'เตาอบ',
  [MACHINE_TYPES.CONVEYOR]: 'สายพาน',
  [MACHINE_TYPES.ROBOT]: 'หุ่นยนต์',
  [MACHINE_TYPES.ASSEMBLY_LINE]: 'สายการประกอบ',
  [MACHINE_TYPES.TESTING_EQUIPMENT]: 'อุปกรณ์ทดสอบ'
}

export const MACHINE_STATUS_LABELS = {
  [MACHINE_STATUS.AVAILABLE]: 'พร้อมใช้งาน',
  [MACHINE_STATUS.BUSY]: 'กำลังใช้งาน',
  [MACHINE_STATUS.MAINTENANCE]: 'บำรุงรักษา',
  [MACHINE_STATUS.BREAKDOWN]: 'เสีย',
  [MACHINE_STATUS.SETUP]: 'จัดเตรียม',
  [MACHINE_STATUS.IDLE]: 'ว่าง'
}

export const DOWNTIME_TYPE_LABELS = {
  [DOWNTIME_TYPES.PLANNED_MAINTENANCE]: 'บำรุงรักษาตามแผน',
  [DOWNTIME_TYPES.BREAKDOWN]: 'เครื่องเสีย',
  [DOWNTIME_TYPES.SETUP_CHANGEOVER]: 'เปลี่ยนงาน',
  [DOWNTIME_TYPES.MATERIAL_SHORTAGE]: 'วัตถุดิบขาด',
  [DOWNTIME_TYPES.QUALITY_ISSUE]: 'ปัญหาคุณภาพ',
  [DOWNTIME_TYPES.OPERATOR_UNAVAILABLE]: 'ไม่มีผู้ปฏิบัติงาน',
  [DOWNTIME_TYPES.POWER_OUTAGE]: 'ไฟดับ',
  [DOWNTIME_TYPES.OTHER]: 'อื่นๆ'
}

export const PRODUCTION_UNIT_LABELS = {
  [PRODUCTION_UNITS.PIECES]: 'ชิ้น',
  [PRODUCTION_UNITS.KILOGRAMS]: 'กิโลกรัม',
  [PRODUCTION_UNITS.LITERS]: 'ลิตร',
  [PRODUCTION_UNITS.METERS]: 'เมตร',
  [PRODUCTION_UNITS.HOURS]: 'ชั่วโมง',
  [PRODUCTION_UNITS.BATCHES]: 'ชุด',
  [PRODUCTION_UNITS.LOTS]: 'ล็อต'
}

export const COSTING_METHOD_LABELS = {
  [COSTING_METHODS.STANDARD]: 'ต้นทุนมาตรฐาน',
  [COSTING_METHODS.ACTUAL]: 'ต้นทุนจริง',
  [COSTING_METHODS.AVERAGE]: 'ต้นทุนเฉลี่ย',
  [COSTING_METHODS.FIFO]: 'เข้าก่อนออกก่อน',
  [COSTING_METHODS.LIFO]: 'เข้าหลังออกก่อน'
}

// การกำหนดค่าระบบ
export const PRODUCTION_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    PRODUCTION_ORDER: 'PO{year}{month}-{number:5}',
    WORK_ORDER: 'WO{year}{month}-{number:5}',
    BATCH: 'BATCH{year}{month}{day}-{number:3}',
    LOT: 'LOT{year}{month}{day}-{number:4}',
    QUALITY_CHECK: 'QC{year}{month}-{number:4}'
  },
  
  // ประสิทธิภาพมาตรฐาน (%)
  STANDARD_EFFICIENCY: 85,
  
  // อัตราของเสียที่ยอมรับได้ (%)
  ACCEPTABLE_SCRAP_RATE: 2,
  
  // เวลาการทำงานมาตรฐาน (ชั่วโมงต่อวัน)
  STANDARD_WORK_HOURS: 8,
  
  // จำนวนวันทำงานต่อสัปดาห์
  WORK_DAYS_PER_WEEK: 5,
  
  // เปอร์เซ็นต์ buffer time สำหรับกระบวนการ
  PROCESS_BUFFER_PERCENTAGE: 10,
  
  // ระดับการอนุมัติตามมูลค่า
  APPROVAL_LEVELS: {
    SUPERVISOR: 100000,     // 100,000 บาท
    MANAGER: 500000,        // 500,000 บาท
    DIRECTOR: 1000000,      // 1,000,000 บาท
    EXECUTIVE: Infinity     // ไม่จำกัด
  },
  
  // ช่วงเวลาการรายงาน (นาที)
  REPORTING_INTERVALS: {
    REAL_TIME: 1,
    HOURLY: 60,
    SHIFT: 480,     // 8 ชั่วโมง
    DAILY: 1440     // 24 ชั่วโมง
  },
  
  // เป้าหมาย OEE (Overall Equipment Effectiveness)
  TARGET_OEE: {
    AVAILABILITY: 90,    // %
    PERFORMANCE: 95,     // %
    QUALITY: 99          // %
  }
}

// ค่าเริ่มต้นของข้อมูล
export const PRODUCTION_DEFAULTS = {
  type: PRODUCTION_TYPES.MAKE_TO_ORDER,
  status: PRODUCTION_STATUS.DRAFT,
  priority: PRIORITY_LEVELS.NORMAL,
  unit: PRODUCTION_UNITS.PIECES,
  costing_method: COSTING_METHODS.STANDARD,
  requires_quality_check: true,
  track_labor_time: true,
  track_machine_time: true,
  track_material_consumption: true,
  buffer_percentage: PRODUCTION_CONFIG.PROCESS_BUFFER_PERCENTAGE
}

// เทมเพลตการผลิตทั่วไป
export const PRODUCTION_TEMPLATES = {
  STANDARD_MANUFACTURING: {
    name: 'การผลิตมาตรฐาน',
    type: PRODUCTION_TYPES.MANUFACTURING,
    processes: [
      { name: 'เตรียมวัตถุดิบ', type: PROCESS_TYPES.INSPECTION, duration: 30 },
      { name: 'ขึ้นรูป', type: PROCESS_TYPES.MACHINING, duration: 120 },
      { name: 'ประกอบ', type: PROCESS_TYPES.ASSEMBLY, duration: 60 },
      { name: 'ตรวจคุณภาพ', type: PROCESS_TYPES.TESTING, duration: 30 },
      { name: 'บรรจุ', type: PROCESS_TYPES.PACKAGING, duration: 15 }
    ]
  },
  ASSEMBLY_LINE: {
    name: 'สายการประกอบ',
    type: PRODUCTION_TYPES.ASSEMBLY,
    processes: [
      { name: 'สถานี 1', type: PROCESS_TYPES.ASSEMBLY, duration: 45 },
      { name: 'สถานี 2', type: PROCESS_TYPES.ASSEMBLY, duration: 45 },
      { name: 'สถานี 3', type: PROCESS_TYPES.ASSEMBLY, duration: 45 },
      { name: 'ตรวจสอบ', type: PROCESS_TYPES.INSPECTION, duration: 15 },
      { name: 'บรรจุ', type: PROCESS_TYPES.PACKAGING, duration: 10 }
    ]
  },
  BATCH_PRODUCTION: {
    name: 'การผลิตแบบชุด',
    type: PRODUCTION_TYPES.BATCH,
    processes: [
      { name: 'เตรียมชุดงาน', type: PROCESS_TYPES.INSPECTION, duration: 60 },
      { name: 'ผลิต', type: PROCESS_TYPES.MANUFACTURING, duration: 480 },
      { name: 'ตรวจคุณภาพชุด', type: PROCESS_TYPES.TESTING, duration: 120 },
      { name: 'บรรจุชุด', type: PROCESS_TYPES.PACKAGING, duration: 60 }
    ]
  }
}

// Transaction States - สถานะการทำธุรกรรม Production
export const PRODUCTION_STATES = ['planned', 'released', 'in_progress', 'completed', 'closed']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const PRODUCTION_TRANSITIONS = {
  'planned': ['released'],
  'released': ['in_progress'],
  'in_progress': ['completed'],
  'completed': ['closed'],
  'closed': [] // สถานะสุดท้าย
}

// Initial State
export const PRODUCTION_INITIAL_STATE = 'planned'

// Storage Key
export const PRODUCTION_STORAGE_KEY = 'erp_production_transactions'

// Production Schema Structure  
import { BASE_SCHEMA_STRUCTURE } from '../base/schema.js'

export const PRODUCTION_SCHEMA = {
  // Inherit base schema
  ...BASE_SCHEMA_STRUCTURE,
  
  // Production specific fields
  production_order_number: { type: 'string', required: false },
  work_order_id: { type: 'string', required: false },
  sales_order_id: { type: 'string', required: false },
  
  // Production details
  production_type: { type: 'string', required: false },
  production_method: { type: 'string', required: false },
  planned_start_date: { type: 'date', required: false },
  planned_end_date: { type: 'date', required: false },
  actual_start_date: { type: 'date', required: false },
  actual_end_date: { type: 'date', required: false },
  
  // Products to produce
  target_products: {
    type: 'array',
    required: false,
    items: {
      properties: {
        product_id: { type: 'string', required: false },
        product_name: { type: 'string', required: false },
        target_quantity: { type: 'number', required: false, min: 0 },
        produced_quantity: { type: 'number', required: false, min: 0 },
        unit: { type: 'string', required: false },
        quality_status: { type: 'string', required: false }
      }
    }
  },
  
  // Cost tracking
  production_cost: { type: 'number', required: false, min: 0 },
  material_cost: { type: 'number', required: false, min: 0 },
  labor_cost: { type: 'number', required: false, min: 0 },
  total_cost: { type: 'number', required: false, min: 0 }
}