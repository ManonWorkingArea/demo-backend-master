/**
 * HR Module Schema
 * กำหนดโครงสร้างข้อมูลและค่าคงที่สำหรับระบบทรัพยากรบุคคล
 */

import { BASE_SCHEMA_STRUCTURE } from '../base/schema.js'

// ประเภทพนักงาน
export const EMPLOYEE_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  TEMPORARY: 'temporary',
  INTERN: 'intern',
  CONSULTANT: 'consultant',
  FREELANCE: 'freelance',
  VOLUNTEER: 'volunteer'
}

// สถานะพนักงาน
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
  RESIGNED: 'resigned',
  RETIRED: 'retired',
  PROBATION: 'probation'
}

// ระดับตำแหน่ง
export const POSITION_LEVELS = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  SENIOR: 'senior',
  LEAD: 'lead',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  DIRECTOR: 'director',
  EXECUTIVE: 'executive'
}

// สถานะแผนก
export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  REORGANIZING: 'reorganizing',
  DISSOLVED: 'dissolved'
}

// ประเภทการลา
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  PERSONAL: 'personal',
  EMERGENCY: 'emergency',
  BEREAVEMENT: 'bereavement',
  UNPAID: 'unpaid',
  SABBATICAL: 'sabbatical',
  STUDY: 'study'
}

// สถานะการลา
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  USED: 'used',
  EXPIRED: 'expired'
}

// ประเภทการเข้าทำงาน
export const ATTENDANCE_TYPES = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EARLY_OUT: 'early_out',
  OVERTIME: 'overtime',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
  REMOTE: 'remote'
}

// สถานะการเข้าทำงาน
export const ATTENDANCE_STATUS = {
  RECORDED: 'recorded',
  PENDING: 'pending',
  APPROVED: 'approved',
  DISPUTED: 'disputed',
  CORRECTED: 'corrected'
}

// ประเภทเงินเดือน
export const PAYROLL_TYPES = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
  HOURLY: 'hourly',
  PROJECT_BASED: 'project_based',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  OVERTIME: 'overtime'
}

// สถานะเงินเดือน
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  CALCULATED: 'calculated',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  VOID: 'void'
}

// ระดับการศึกษา
export const EDUCATION_LEVELS = {
  ELEMENTARY: 'elementary',
  MIDDLE_SCHOOL: 'middle_school',
  HIGH_SCHOOL: 'high_school',
  VOCATIONAL: 'vocational',
  DIPLOMA: 'diploma',
  BACHELOR: 'bachelor',
  MASTER: 'master',
  DOCTORATE: 'doctorate',
  OTHER: 'other'
}

// ทักษะและความเชี่ยวชาญ
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  MASTER: 'master'
}

// ประเภทการประเมิน
export const EVALUATION_TYPES = {
  PROBATION: 'probation',
  ANNUAL: 'annual',
  MID_YEAR: 'mid_year',
  PROJECT: 'project',
  PROMOTION: 'promotion',
  DISCIPLINARY: 'disciplinary',
  EXIT: 'exit'
}

// ผลการประเมิน
export const EVALUATION_RESULTS = {
  OUTSTANDING: 'outstanding',
  EXCEEDS: 'exceeds',
  MEETS: 'meets',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  UNSATISFACTORY: 'unsatisfactory'
}

// ระบบ User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  HR: 'hr',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  ACCOUNTANT: 'accountant',
  SALES: 'sales',
  PURCHASE: 'purchase',
  WAREHOUSE: 'warehouse',
  GUEST: 'guest'
}

// สถานะ User
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired'
}

// ประเภทสิทธิ์
export const PERMISSION_TYPES = {
  READ: 'read',
  WRITE: 'write',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  ADMIN: 'admin'
}

// Labels สำหรับแสดงผล
export const EMPLOYEE_TYPE_LABELS = {
  [EMPLOYEE_TYPES.FULL_TIME]: 'พนักงานประจำ',
  [EMPLOYEE_TYPES.PART_TIME]: 'พนักงานพาร์ทไทม์',
  [EMPLOYEE_TYPES.CONTRACT]: 'พนักงานสัญญาจ้าง',
  [EMPLOYEE_TYPES.TEMPORARY]: 'พนักงานชั่วคราว',
  [EMPLOYEE_TYPES.INTERN]: 'นักศึกษาฝึกงาน',
  [EMPLOYEE_TYPES.CONSULTANT]: 'ที่ปรึกษา',
  [EMPLOYEE_TYPES.FREELANCE]: 'อิสระ',
  [EMPLOYEE_TYPES.VOLUNTEER]: 'อาสาสมัคร'
}

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'ทำงานอยู่',
  [EMPLOYEE_STATUS.INACTIVE]: 'ไม่ได้ทำงาน',
  [EMPLOYEE_STATUS.ON_LEAVE]: 'ลาพักงาน',
  [EMPLOYEE_STATUS.SUSPENDED]: 'พักงาน',
  [EMPLOYEE_STATUS.TERMINATED]: 'ถูกเลิกจ้าง',
  [EMPLOYEE_STATUS.RESIGNED]: 'ลาออก',
  [EMPLOYEE_STATUS.RETIRED]: 'เกษียณ',
  [EMPLOYEE_STATUS.PROBATION]: 'ทดลองงาน'
}

export const POSITION_LEVEL_LABELS = {
  [POSITION_LEVELS.ENTRY]: 'ระดับเริ่มต้น',
  [POSITION_LEVELS.JUNIOR]: 'ระดับต้น',
  [POSITION_LEVELS.SENIOR]: 'ระดับอาวุโส',
  [POSITION_LEVELS.LEAD]: 'หัวหน้าทีม',
  [POSITION_LEVELS.SUPERVISOR]: 'หัวหน้างาน',
  [POSITION_LEVELS.MANAGER]: 'ผู้จัดการ',
  [POSITION_LEVELS.DIRECTOR]: 'ผู้อำนวยการ',
  [POSITION_LEVELS.EXECUTIVE]: 'ผู้บริหาร'
}

export const LEAVE_TYPE_LABELS = {
  [LEAVE_TYPES.ANNUAL]: 'ลาพักร้อน',
  [LEAVE_TYPES.SICK]: 'ลาป่วย',
  [LEAVE_TYPES.MATERNITY]: 'ลาคลอด',
  [LEAVE_TYPES.PATERNITY]: 'ลาเลี้ยงดูบุตร',
  [LEAVE_TYPES.PERSONAL]: 'ลากิจส่วนตัว',
  [LEAVE_TYPES.EMERGENCY]: 'ลาฉุกเฉิน',
  [LEAVE_TYPES.BEREAVEMENT]: 'ลาเพื่อการฌาปนกิจ',
  [LEAVE_TYPES.UNPAID]: 'ลาไม่รับเงินเดือน',
  [LEAVE_TYPES.SABBATICAL]: 'ลาศึกษา',
  [LEAVE_TYPES.STUDY]: 'ลาอบรม'
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'ผู้ดูแลระบบ',
  [USER_ROLES.MANAGER]: 'ผู้จัดการ',
  [USER_ROLES.HR]: 'ทรัพยากรบุคคล',
  [USER_ROLES.SUPERVISOR]: 'หัวหน้างาน',
  [USER_ROLES.EMPLOYEE]: 'พนักงาน',
  [USER_ROLES.ACCOUNTANT]: 'นักบัญชี',
  [USER_ROLES.SALES]: 'ขาย',
  [USER_ROLES.PURCHASE]: 'จัดซื้อ',
  [USER_ROLES.WAREHOUSE]: 'คลังสินค้า',
  [USER_ROLES.GUEST]: 'แขก'
}

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'ใช้งานได้',
  [USER_STATUS.INACTIVE]: 'ไม่ใช้งาน',
  [USER_STATUS.LOCKED]: 'ถูกล็อค',
  [USER_STATUS.PENDING]: 'รอการอนุมัติ',
  [USER_STATUS.SUSPENDED]: 'ระงับการใช้งาน',
  [USER_STATUS.EXPIRED]: 'หมดอายุ'
}

// การกำหนดค่าระบบ HR
export const HR_CONFIG = {
  // เลขที่พนักงานเริ่มต้น
  EMPLOYEE_NUMBER_START: 1,
  
  // รูปแบบเลขที่พนักงาน
  EMPLOYEE_NUMBER_FORMAT: 'EMP{number:4}',
  
  // รูปแบบเลขที่แผนก
  DEPARTMENT_CODE_FORMAT: 'DEPT{number:3}',
  
  // จำนวนวันลาพักร้อนต่อปี
  ANNUAL_LEAVE_DAYS: 6,
  
  // จำนวนวันลาป่วยต่อปี
  SICK_LEAVE_DAYS: 30,
  
  // จำนวนชั่วโมงทำงานต่อวัน
  WORKING_HOURS_PER_DAY: 8,
  
  // จำนวนวันทำงานต่อสัปดาห์
  WORKING_DAYS_PER_WEEK: 5,
  
  // เวลาทำงานมาตรฐาน
  STANDARD_WORK_TIME: {
    START: '09:00',
    END: '18:00',
    BREAK_START: '12:00',
    BREAK_END: '13:00'
  },
  
  // ระยะเวลาทดลองงาน (วัน)
  PROBATION_PERIOD_DAYS: 90,
  
  // อายุเกษียณ
  RETIREMENT_AGE: 60,
  
  // การตั้งค่าเงินเดือน
  SALARY_CONFIG: {
    CURRENCY: 'THB',
    MIN_WAGE: 15000,
    OVERTIME_RATE: 1.5,
    HOLIDAY_RATE: 2.0
  }
}

// ค่าเริ่มต้นของข้อมูล HR
export const HR_DEFAULTS = {
  employee_type: EMPLOYEE_TYPES.FULL_TIME,
  employee_status: EMPLOYEE_STATUS.PROBATION,
  position_level: POSITION_LEVELS.ENTRY,
  department_status: DEPARTMENT_STATUS.ACTIVE,
  user_role: USER_ROLES.EMPLOYEE,
  user_status: USER_STATUS.PENDING,
  working_hours: HR_CONFIG.WORKING_HOURS_PER_DAY,
  annual_leave_balance: HR_CONFIG.ANNUAL_LEAVE_DAYS,
  sick_leave_balance: HR_CONFIG.SICK_LEAVE_DAYS
}

// Employee Schema
export const EMPLOYEE_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  // Personal Information
  employee_code: { type: 'string', required: true },
  employee_number: { type: 'string', required: false },
  title: { type: 'string', required: false },
  first_name: { type: 'string', required: true },
  last_name: { type: 'string', required: true },
  full_name: { type: 'string', required: false },
  nickname: { type: 'string', required: false },
  gender: { type: 'string', required: false },
  date_of_birth: { type: 'date', required: false },
  nationality: { type: 'string', required: false },
  id_card_number: { type: 'string', required: false },
  passport_number: { type: 'string', required: false },
  
  // Contact Information
  phone: { type: 'string', required: false },
  mobile: { type: 'string', required: false },
  email: { type: 'string', required: true },
  personal_email: { type: 'string', required: false },
  address: { type: 'string', required: false },
  emergency_contact_name: { type: 'string', required: false },
  emergency_contact_phone: { type: 'string', required: false },
  emergency_contact_relationship: { type: 'string', required: false },
  
  // Employment Information
  hire_date: { type: 'date', required: true },
  start_date: { type: 'date', required: false },
  end_date: { type: 'date', required: false },
  employment_type: { type: 'string', required: false },
  employee_status: { type: 'string', required: false },
  
  // Organization
  department_id: { type: 'string', required: false },
  position_id: { type: 'string', required: false },
  manager_id: { type: 'string', required: false },
  reports_to: { type: 'string', required: false },
  
  // Compensation
  salary: { type: 'number', required: false, min: 0 },
  hourly_rate: { type: 'number', required: false, min: 0 },
  currency: { type: 'string', required: false, default: 'THB' },
  
  // Work Schedule
  working_hours: { type: 'number', required: false, default: 8 },
  work_schedule: { type: 'string', required: false },
  
  // Leave Balances
  annual_leave_balance: { type: 'number', required: false, default: 6 },
  sick_leave_balance: { type: 'number', required: false, default: 30 },
  personal_leave_balance: { type: 'number', required: false, default: 3 },
  
  // User Account Link
  user_id: { type: 'string', required: false },
  
  // Files and Documents
  avatar: { type: 'string', required: false },
  documents: {
    type: 'array',
    required: false,
    items: {
      properties: {
        type: { type: 'string', required: false },
        name: { type: 'string', required: false },
        url: { type: 'string', required: false },
        uploaded_at: { type: 'date', required: false }
      }
    }
  }
}

// Department Schema
export const DEPARTMENT_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  name: { type: 'string', required: true },
  code: { type: 'string', required: true },
  description: { type: 'string', required: false },
  manager_id: { type: 'string', required: false },
  parent_id: { type: 'string', required: false },
  department_status: { type: 'string', required: false, default: DEPARTMENT_STATUS.ACTIVE },
  budget: { type: 'number', required: false, min: 0 },
  location: { type: 'string', required: false },
  phone: { type: 'string', required: false },
  email: { type: 'string', required: false }
}

// Position Schema
export const POSITION_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  name: { type: 'string', required: true },
  code: { type: 'string', required: false },
  description: { type: 'string', required: false },
  department_id: { type: 'string', required: false },
  level: { type: 'string', required: false },
  salary_min: { type: 'number', required: false, min: 0 },
  salary_max: { type: 'number', required: false, min: 0 },
  requirements: { type: 'string', required: false },
  responsibilities: { type: 'string', required: false }
}

// User Schema
export const USER_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  username: { type: 'string', required: true },
  email: { type: 'string', required: true },
  password: { type: 'string', required: false }, // ไม่เก็บใน schema จริง
  first_name: { type: 'string', required: false },
  last_name: { type: 'string', required: false },
  full_name: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  
  // Role and Permissions
  role: { type: 'string', required: false, default: USER_ROLES.EMPLOYEE },
  roles: { 
    type: 'array', 
    required: false, 
    items: { type: 'string' },
    default: [USER_ROLES.EMPLOYEE]
  },
  permissions: {
    type: 'array',
    required: false,
    items: { type: 'string' }
  },
  
  // Employee Link
  employee_id: { type: 'string', required: false },
  
  // Account Status
  user_status: { type: 'string', required: false, default: USER_STATUS.PENDING },
  email_verified: { type: 'boolean', required: false, default: false },
  last_login: { type: 'date', required: false },
  failed_login_attempts: { type: 'number', required: false, default: 0 },
  locked_until: { type: 'date', required: false },
  
  // Settings
  timezone: { type: 'string', required: false, default: 'Asia/Bangkok' },
  language: { type: 'string', required: false, default: 'th' },
  theme: { type: 'string', required: false, default: 'light' }
}

// Attendance Schema
export const ATTENDANCE_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  employee_id: { type: 'string', required: true },
  date: { type: 'date', required: true },
  check_in: { type: 'datetime', required: false },
  check_out: { type: 'datetime', required: false },
  break_start: { type: 'datetime', required: false },
  break_end: { type: 'datetime', required: false },
  
  // Working Hours
  working_hours: { type: 'number', required: false, min: 0 },
  overtime_hours: { type: 'number', required: false, min: 0 },
  
  // Status and Type
  attendance_type: { type: 'string', required: false, default: ATTENDANCE_TYPES.PRESENT },
  attendance_status: { type: 'string', required: false, default: ATTENDANCE_STATUS.RECORDED },
  
  // Location
  location: { type: 'string', required: false },
  ip_address: { type: 'string', required: false },
  device_info: { type: 'string', required: false },
  
  // Notes
  remarks: { type: 'string', required: false },
  approved_by: { type: 'string', required: false },
  approved_at: { type: 'date', required: false }
}

// Payroll Schema
export const PAYROLL_SCHEMA = {
  ...BASE_SCHEMA_STRUCTURE,
  
  employee_id: { type: 'string', required: true },
  payroll_period: { type: 'string', required: true }, // YYYY-MM
  pay_date: { type: 'date', required: false },
  
  // Basic Salary
  basic_salary: { type: 'number', required: false, min: 0 },
  hourly_rate: { type: 'number', required: false, min: 0 },
  regular_hours: { type: 'number', required: false, min: 0 },
  overtime_hours: { type: 'number', required: false, min: 0 },
  
  // Earnings
  overtime_pay: { type: 'number', required: false, min: 0 },
  bonus: { type: 'number', required: false, min: 0 },
  commission: { type: 'number', required: false, min: 0 },
  allowances: { type: 'number', required: false, min: 0 },
  total_earnings: { type: 'number', required: false, min: 0 },
  
  // Deductions
  tax: { type: 'number', required: false, min: 0 },
  social_security: { type: 'number', required: false, min: 0 },
  health_insurance: { type: 'number', required: false, min: 0 },
  other_deductions: { type: 'number', required: false, min: 0 },
  total_deductions: { type: 'number', required: false, min: 0 },
  
  // Net Pay
  net_pay: { type: 'number', required: false, min: 0 },
  
  // Status
  payroll_status: { type: 'string', required: false, default: PAYROLL_STATUS.DRAFT },
  calculated_by: { type: 'string', required: false },
  calculated_at: { type: 'date', required: false },
  approved_by: { type: 'string', required: false },
  approved_at: { type: 'date', required: false }
}

// Storage Keys
export const HR_STORAGE_KEYS = {
  EMPLOYEES: 'erp_hr_employees',
  DEPARTMENTS: 'erp_hr_departments',
  POSITIONS: 'erp_hr_positions',
  USERS: 'erp_hr_users',
  ATTENDANCE: 'erp_hr_attendance',
  PAYROLL: 'erp_hr_payroll',
  LEAVE_REQUESTS: 'erp_hr_leave_requests'
}