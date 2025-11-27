/**
 * Work Order Transaction Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับใบสั่งงาน
 */

// ประเภทใบสั่งงาน
export const WORK_ORDER_TYPES = {
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  INSTALLATION: 'installation',
  INSPECTION: 'inspection',
  UPGRADE: 'upgrade',
  EMERGENCY: 'emergency',
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  PROJECT: 'project',
  SERVICE: 'service'
}

// สถานะใบสั่งงาน
export const WORK_ORDER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  CLOSED: 'closed'
}

// ระดับความสำคัญ
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
}

// ประเภทงาน
export const JOB_TYPES = {
  MECHANICAL: 'mechanical',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  HVAC: 'hvac',
  IT: 'it',
  CLEANING: 'cleaning',
  SECURITY: 'security',
  LANDSCAPING: 'landscaping',
  CONSTRUCTION: 'construction',
  PAINTING: 'painting'
}

// สถานะการทำงาน
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
}

// ประเภททรัพยากร
export const RESOURCE_TYPES = {
  HUMAN: 'human',
  EQUIPMENT: 'equipment',
  MATERIAL: 'material',
  TOOL: 'tool',
  VEHICLE: 'vehicle',
  FACILITY: 'facility'
}

// หน่วยเวลา
export const TIME_UNITS = {
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks'
}

// ประเภทค่าใช้จ่าย
export const COST_TYPES = {
  LABOR: 'labor',
  MATERIAL: 'material',
  EQUIPMENT: 'equipment',
  OVERHEAD: 'overhead',
  SUBCONTRACTOR: 'subcontractor',
  TRAVEL: 'travel',
  OTHER: 'other'
}

// สาเหตุการหยุดงาน
export const HOLD_REASONS = {
  WAITING_PARTS: 'waiting_parts',
  WAITING_APPROVAL: 'waiting_approval',
  WEATHER: 'weather',
  RESOURCE_UNAVAILABLE: 'resource_unavailable',
  SAFETY_CONCERN: 'safety_concern',
  CUSTOMER_REQUEST: 'customer_request',
  TECHNICAL_ISSUE: 'technical_issue',
  OTHER: 'other'
}

// ประเภทการตรวจสอบ
export const INSPECTION_TYPES = {
  QUALITY: 'quality',
  SAFETY: 'safety',
  COMPLIANCE: 'compliance',
  PERFORMANCE: 'performance',
  FINAL: 'final'
}

// ผลการตรวจสอบ
export const INSPECTION_RESULTS = {
  PASS: 'pass',
  FAIL: 'fail',
  CONDITIONAL: 'conditional',
  PENDING: 'pending'
}

// Labels สำหรับแสดงผล
export const WORK_ORDER_TYPE_LABELS = {
  [WORK_ORDER_TYPES.MAINTENANCE]: 'บำรุงรักษา',
  [WORK_ORDER_TYPES.REPAIR]: 'ซ่อมแซม',
  [WORK_ORDER_TYPES.INSTALLATION]: 'ติดตั้ง',
  [WORK_ORDER_TYPES.INSPECTION]: 'ตรวจสอบ',
  [WORK_ORDER_TYPES.UPGRADE]: 'อัพเกรด',
  [WORK_ORDER_TYPES.EMERGENCY]: 'เร่งด่วน',
  [WORK_ORDER_TYPES.PREVENTIVE]: 'ป้องกัน',
  [WORK_ORDER_TYPES.CORRECTIVE]: 'แก้ไข',
  [WORK_ORDER_TYPES.PROJECT]: 'โครงการ',
  [WORK_ORDER_TYPES.SERVICE]: 'บริการ'
}

export const WORK_ORDER_STATUS_LABELS = {
  [WORK_ORDER_STATUS.DRAFT]: 'ร่าง',
  [WORK_ORDER_STATUS.SUBMITTED]: 'ส่งแล้ว',
  [WORK_ORDER_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [WORK_ORDER_STATUS.SCHEDULED]: 'กำหนดเวลาแล้ว',
  [WORK_ORDER_STATUS.IN_PROGRESS]: 'กำลังดำเนินการ',
  [WORK_ORDER_STATUS.ON_HOLD]: 'หยุดชั่วคราว',
  [WORK_ORDER_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [WORK_ORDER_STATUS.CANCELLED]: 'ยกเลิก',
  [WORK_ORDER_STATUS.REJECTED]: 'ปฏิเสธ',
  [WORK_ORDER_STATUS.CLOSED]: 'ปิดงาน'
}

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'ต่ำ',
  [PRIORITY_LEVELS.NORMAL]: 'ปกติ',
  [PRIORITY_LEVELS.HIGH]: 'สูง',
  [PRIORITY_LEVELS.URGENT]: 'ด่วน',
  [PRIORITY_LEVELS.CRITICAL]: 'วิกฤต',
  [PRIORITY_LEVELS.EMERGENCY]: 'ฉุกเฉิน'
}

export const JOB_TYPE_LABELS = {
  [JOB_TYPES.MECHANICAL]: 'งานช่าง',
  [JOB_TYPES.ELECTRICAL]: 'งานไฟฟ้า',
  [JOB_TYPES.PLUMBING]: 'งานประปา',
  [JOB_TYPES.HVAC]: 'งานแอร์',
  [JOB_TYPES.IT]: 'งานไอที',
  [JOB_TYPES.CLEANING]: 'งานทำความสะอาด',
  [JOB_TYPES.SECURITY]: 'งานรักษาความปลอดภัย',
  [JOB_TYPES.LANDSCAPING]: 'งานจัดสวน',
  [JOB_TYPES.CONSTRUCTION]: 'งานก่อสร้าง',
  [JOB_TYPES.PAINTING]: 'งานทาสี'
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'รอดำเนินการ',
  [TASK_STATUS.ASSIGNED]: 'มอบหมายแล้ว',
  [TASK_STATUS.IN_PROGRESS]: 'กำลังทำ',
  [TASK_STATUS.COMPLETED]: 'เสร็จแล้ว',
  [TASK_STATUS.FAILED]: 'ล้มเหลว',
  [TASK_STATUS.CANCELLED]: 'ยกเลิก',
  [TASK_STATUS.ON_HOLD]: 'หยุดชั่วคราว'
}

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.HUMAN]: 'บุคลากร',
  [RESOURCE_TYPES.EQUIPMENT]: 'อุปกรณ์',
  [RESOURCE_TYPES.MATERIAL]: 'วัสดุ',
  [RESOURCE_TYPES.TOOL]: 'เครื่องมือ',
  [RESOURCE_TYPES.VEHICLE]: 'ยานพาหนะ',
  [RESOURCE_TYPES.FACILITY]: 'สถานที่'
}

export const TIME_UNIT_LABELS = {
  [TIME_UNITS.MINUTES]: 'นาที',
  [TIME_UNITS.HOURS]: 'ชั่วโมง',
  [TIME_UNITS.DAYS]: 'วัน',
  [TIME_UNITS.WEEKS]: 'สัปดาห์'
}

export const COST_TYPE_LABELS = {
  [COST_TYPES.LABOR]: 'ค่าแรง',
  [COST_TYPES.MATERIAL]: 'ค่าวัสดุ',
  [COST_TYPES.EQUIPMENT]: 'ค่าอุปกรณ์',
  [COST_TYPES.OVERHEAD]: 'ค่าใช้จ่ายทั่วไป',
  [COST_TYPES.SUBCONTRACTOR]: 'ค่าจ้างเหมา',
  [COST_TYPES.TRAVEL]: 'ค่าเดินทาง',
  [COST_TYPES.OTHER]: 'อื่นๆ'
}

export const HOLD_REASON_LABELS = {
  [HOLD_REASONS.WAITING_PARTS]: 'รออะไหล่',
  [HOLD_REASONS.WAITING_APPROVAL]: 'รออนุมัติ',
  [HOLD_REASONS.WEATHER]: 'สภาพอากาศ',
  [HOLD_REASONS.RESOURCE_UNAVAILABLE]: 'ทรัพยากรไม่พร้อม',
  [HOLD_REASONS.SAFETY_CONCERN]: 'ปัญหาความปลอดภัย',
  [HOLD_REASONS.CUSTOMER_REQUEST]: 'คำขอลูกค้า',
  [HOLD_REASONS.TECHNICAL_ISSUE]: 'ปัญหาทางเทคนิค',
  [HOLD_REASONS.OTHER]: 'อื่นๆ'
}

export const INSPECTION_TYPE_LABELS = {
  [INSPECTION_TYPES.QUALITY]: 'ตรวจคุณภาพ',
  [INSPECTION_TYPES.SAFETY]: 'ตรวจความปลอดภัย',
  [INSPECTION_TYPES.COMPLIANCE]: 'ตรวจความสอดคล้อง',
  [INSPECTION_TYPES.PERFORMANCE]: 'ตรวจสมรรถนะ',
  [INSPECTION_TYPES.FINAL]: 'ตรวจสุดท้าย'
}

export const INSPECTION_RESULT_LABELS = {
  [INSPECTION_RESULTS.PASS]: 'ผ่าน',
  [INSPECTION_RESULTS.FAIL]: 'ไม่ผ่าน',
  [INSPECTION_RESULTS.CONDITIONAL]: 'ผ่านมีเงื่อนไข',
  [INSPECTION_RESULTS.PENDING]: 'รอผลตรวจ'
}

// การกำหนดค่าระบบ
export const WORK_ORDER_CONFIG = {
  // เลขที่เอกสารเริ่มต้น
  DOCUMENT_NUMBER_START: 1,
  
  // รูปแบบเลขที่เอกสาร
  DOCUMENT_NUMBER_FORMAT: {
    WORK_ORDER: 'WO{year}{month}-{number:5}',
    TASK: 'TSK{year}{month}-{number:6}',
    INSPECTION: 'INS{year}{month}-{number:4}'
  },
  
  // เวลาทำงานมาตรฐาน (ชั่วโมงต่อวัน)
  STANDARD_WORK_HOURS: 8,
  
  // อัตราค่าแรงเริ่มต้น (บาทต่อชั่วโมง)
  DEFAULT_LABOR_RATES: {
    TECHNICIAN: 200,
    SUPERVISOR: 300,
    SPECIALIST: 400,
    ENGINEER: 500
  },
  
  // ระดับการอนุมัติตามมูลค่า
  APPROVAL_LEVELS: {
    SUPERVISOR: 50000,      // 50,000 บาท
    MANAGER: 200000,        // 200,000 บาท
    DIRECTOR: 500000,       // 500,000 บาท
    EXECUTIVE: Infinity     // ไม่จำกัด
  },
  
  // เวลาเตือนล่วงหน้า (ชั่วโมง)
  REMINDER_HOURS: {
    [PRIORITY_LEVELS.LOW]: 24,
    [PRIORITY_LEVELS.NORMAL]: 12,
    [PRIORITY_LEVELS.HIGH]: 6,
    [PRIORITY_LEVELS.URGENT]: 2,
    [PRIORITY_LEVELS.CRITICAL]: 1,
    [PRIORITY_LEVELS.EMERGENCY]: 0.5
  },
  
  // ระยะเวลา SLA (ชั่วโมง)
  SLA_HOURS: {
    [PRIORITY_LEVELS.LOW]: 72,      // 3 วัน
    [PRIORITY_LEVELS.NORMAL]: 48,   // 2 วัน
    [PRIORITY_LEVELS.HIGH]: 24,     // 1 วัน
    [PRIORITY_LEVELS.URGENT]: 8,    // 8 ชั่วโมง
    [PRIORITY_LEVELS.CRITICAL]: 4,  // 4 ชั่วโมง
    [PRIORITY_LEVELS.EMERGENCY]: 1  // 1 ชั่วโมง
  }
}

// ค่าเริ่มต้นของข้อมูล
export const WORK_ORDER_DEFAULTS = {
  type: WORK_ORDER_TYPES.MAINTENANCE,
  status: WORK_ORDER_STATUS.DRAFT,
  priority: PRIORITY_LEVELS.NORMAL,
  job_type: JOB_TYPES.MECHANICAL,
  estimated_hours: 1,
  time_unit: TIME_UNITS.HOURS,
  requires_approval: true,
  requires_inspection: false,
  is_recurring: false,
  billable: true,
  safety_required: true
}

// เทมเพลตงานทั่วไป
export const WORK_ORDER_TEMPLATES = {
  DAILY_MAINTENANCE: {
    title: 'การบำรุงรักษาประจำวัน',
    type: WORK_ORDER_TYPES.PREVENTIVE,
    job_type: JOB_TYPES.MECHANICAL,
    estimated_hours: 2,
    tasks: [
      'ตรวจสอบระบบทั่วไป',
      'ทำความสะอาดอุปกรณ์',
      'บันทึกผลการตรวจสอบ'
    ]
  },
  EQUIPMENT_REPAIR: {
    title: 'ซ่อมแซมอุปกรณ์',
    type: WORK_ORDER_TYPES.REPAIR,
    job_type: JOB_TYPES.MECHANICAL,
    priority: PRIORITY_LEVELS.HIGH,
    estimated_hours: 4,
    requires_inspection: true
  },
  EMERGENCY_FIX: {
    title: 'แก้ไขเร่งด่วน',
    type: WORK_ORDER_TYPES.EMERGENCY,
    priority: PRIORITY_LEVELS.EMERGENCY,
    estimated_hours: 1,
    requires_approval: false
  }
}

// Transaction States - สถานะการทำธุรกรรม WorkOrder
export const WORKORDER_STATES = ['pending', 'picking', 'picked', 'ready-to-ship']

// Transaction Transitions - การเปลี่ยนสถานะที่อนุญาต
export const WORKORDER_TRANSITIONS = {
  'pending': ['picking'],
  'picking': ['picked'],
  'picked': ['ready-to-ship'],
  'ready-to-ship': [] // สถานะสุดท้าย
}

// Initial State
export const WORKORDER_INITIAL_STATE = 'pending'

// Storage Key
export const WORKORDER_STORAGE_KEY = 'erp_work_order_transactions'