/**
 * Customer Master Data Schema
 * โครงสร้างข้อมูลสำหรับจัดการข้อมูลลูกค้า
 */

// Customer Schema Definition
export const CUSTOMER_SCHEMA = {
  // Basic Customer Information
  customer_code: {
    type: 'string',
    required: true,
    unique: true,
    pattern: '^CUS[0-9]{3}$',
    description: 'รหัสลูกค้า (Auto-generated หรือ Manual)',
    example: 'CUS001'
  },
  customer_name: {
    type: 'string',
    required: true,
    maxLength: 255,
    description: 'ชื่อลูกค้า/บริษัท',
    example: 'บริษัท ABC จำกัด'
  },
  customer_type: {
    type: 'string',
    required: true,
    enum: ['individual', 'company', 'government', 'ngo'],
    default: 'individual',
    description: 'ประเภทลูกค้า'
  },
  
  // Contact Information
  contact_person: {
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'ชื่อผู้ติดต่อหลัก',
    example: 'คุณสมชาย ใจดี'
  },
  phone: {
    type: 'string',
    required: false,
    pattern: '^[0-9+\\-\\s()]+$',
    description: 'หมายเลขโทรศัพท์หลัก',
    example: '02-123-4567'
  },
  mobile: {
    type: 'string',
    required: false,
    pattern: '^[0-9+\\-\\s()]+$',
    description: 'หมายเลขมือถือ',
    example: '081-234-5678'
  },
  email: {
    type: 'string',
    required: false,
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    description: 'อีเมล',
    example: 'contact@abc.co.th'
  },
  website: {
    type: 'string',
    required: false,
    description: 'เว็บไซต์',
    example: 'https://www.abc.co.th'
  },
  
  // Address Information
  address: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'ที่อยู่',
    example: '123 ถนนสุขุมวิท แขวงคลองตัน'
  },
  district: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'เขต/อำเภอ',
    example: 'วัฒนา'
  },
  province: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'จังหวัด',
    example: 'กรุงเทพมหานคร'
  },
  postal_code: {
    type: 'string',
    required: false,
    pattern: '^[0-9]{5}$',
    description: 'รหัษไปรษณีย์',
    example: '10110'
  },
  country: {
    type: 'string',
    required: false,
    default: 'ไทย',
    description: 'ประเทศ',
    example: 'ไทย'
  },
  
  // Business Information
  tax_id: {
    type: 'string',
    required: false,
    pattern: '^[0-9]{13}$',
    description: 'เลขประจำตัวผู้เสียภาษี (13 หลัก)',
    example: '1234567890123'
  },
  branch_code: {
    type: 'string',
    required: false,
    pattern: '^[0-9]{5}$',
    default: '00000',
    description: 'รหัสสาขา (5 หลัก)',
    example: '00000'
  },
  vat_registration: {
    type: 'boolean',
    required: false,
    default: false,
    description: 'จดทะเบียน VAT หรือไม่'
  },
  
  // Credit & Payment Terms
  credit_limit: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    description: 'วงเงินเครดิต (บาท)',
    example: 100000
  },
  credit_days: {
    type: 'number',
    required: false,
    min: 0,
    max: 365,
    default: 30,
    description: 'วันเครดิต',
    example: 30
  },
  payment_terms: {
    type: 'string',
    required: false,
    enum: ['cash', 'net_15', 'net_30', 'net_45', 'net_60', 'cod', 'advance'],
    default: 'net_30',
    description: 'เงื่อนไขการชำระเงิน'
  },
  currency: {
    type: 'string',
    required: false,
    enum: ['THB', 'USD', 'EUR', 'JPY', 'SGD'],
    default: 'THB',
    description: 'สกุลเงินหลัก'
  },
  
  // Customer Categories & Classification
  customer_group: {
    type: 'string',
    required: false,
    enum: ['retail', 'wholesale', 'distributor', 'vip', 'government', 'export'],
    default: 'retail',
    description: 'กลุ่มลูกค้า'
  },
  sales_channel: {
    type: 'string',
    required: false,
    enum: ['direct', 'online', 'retail', 'wholesale', 'agent', 'partner'],
    default: 'direct',
    description: 'ช่องทางการขาย'
  },
  priority_level: {
    type: 'string',
    required: false,
    enum: ['low', 'normal', 'high', 'vip'],
    default: 'normal',
    description: 'ระดับความสำคัญ'
  },
  
  // Discount & Pricing
  default_discount_percentage: {
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    default: 0,
    description: 'เปอร์เซ็นต์ส่วนลดมาตรฐาน',
    example: 5.5
  },
  price_list: {
    type: 'string',
    required: false,
    description: 'รายการราคาที่ใช้',
    example: 'retail_price_2024'
  },
  
  // Status & Control
  status: {
    type: 'string',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'blacklisted'],
    default: 'active',
    description: 'สถานะลูกค้า'
  },
  is_active: {
    type: 'boolean',
    required: false,
    default: true,
    description: 'เปิดใช้งานหรือไม่'
  },
  
  // Sales Representative
  sales_rep_id: {
    type: 'string',
    required: false,
    description: 'รหัสพนักงานขายที่รับผิดชอบ',
    example: 'EMP001'
  },
  sales_rep_name: {
    type: 'string',
    required: false,
    description: 'ชื่อพนักงานขายที่รับผิดชอบ',
    example: 'คุณสมหญิง จริงใจ'
  },
  
  // Additional Information
  industry: {
    type: 'string',
    required: false,
    description: 'ประเภทอุตสาหกรรม/ธุรกิจ',
    example: 'การผลิต'
  },
  company_size: {
    type: 'string',
    required: false,
    enum: ['small', 'medium', 'large', 'enterprise'],
    description: 'ขนาดบริษัท'
  },
  annual_revenue: {
    type: 'number',
    required: false,
    min: 0,
    description: 'รายได้ต่อปี (บาท)',
    example: 50000000
  },
  
  // Relationships
  parent_customer_id: {
    type: 'string',
    required: false,
    description: 'รหัสลูกค้าแม่ (สำหรับลูกค้าสาขา)',
    example: 'CUS20241008001'
  },
  
  // Notes & Tags
  notes: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'หมายเหตุเพิ่มเติม'
  },
  tags: {
    type: 'array',
    required: false,
    items: { type: 'string' },
    description: 'แท็กสำหรับจัดกลุ่ม',
    example: ['vip', 'มีศักยภาพ', 'ลูกค้าประจำ']
  },
  
  // Audit Fields (จะถูกเพิ่มโดย BASE_SCHEMA)
  created_at: {
    type: 'date',
    required: false,
    auto: true,
    description: 'วันที่สร้างข้อมูล'
  },
  updated_at: {
    type: 'date',
    required: false,
    auto: true,
    description: 'วันที่อัปเดตล่าสุด'
  },
  created_by: {
    type: 'string',
    required: false,
    description: 'ผู้สร้างข้อมูล'
  },
  updated_by: {
    type: 'string',
    required: false,
    description: 'ผู้อัปเดตล่าสุด'
  }
}

// Customer Status Configuration
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive', 
  SUSPENDED: 'suspended',
  BLACKLISTED: 'blacklisted'
}

// Customer States (for State Machine)
export const CUSTOMER_STATES = [
  'active',
  'inactive', 
  'suspended',
  'blacklisted'
]

// Customer State Transitions
export const CUSTOMER_TRANSITIONS = {
  'active': ['inactive', 'suspended', 'blacklisted'],
  'inactive': ['active', 'suspended'],
  'suspended': ['active', 'inactive', 'blacklisted'],
  'blacklisted': [] // สถานะสุดท้าย - ต้องมีการตรวจสอบพิเศษ
}

// Initial State
export const CUSTOMER_INITIAL_STATE = 'active'

// Storage Key
export const CUSTOMER_STORAGE_KEY = 'erp_customer_masterdata'

// Export all customer constants
export default {
  CUSTOMER_SCHEMA,
  CUSTOMER_STATUS,
  CUSTOMER_STATES,
  CUSTOMER_TRANSITIONS,
  CUSTOMER_INITIAL_STATE,
  CUSTOMER_STORAGE_KEY
}