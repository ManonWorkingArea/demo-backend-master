/**
 * HR Module Data Management
 * จัดการข้อมูล sample และ operations สำหรับระบบทรัพยากรบุคคล
 */

import {
  EMPLOYEE_TYPES,
  EMPLOYEE_STATUS,
  POSITION_LEVELS,
  DEPARTMENT_STATUS,
  USER_ROLES,
  USER_STATUS,
  ATTENDANCE_TYPES,
  PAYROLL_STATUS,
  HR_CONFIG,
  HR_DEFAULTS,
  EMPLOYEE_SCHEMA,
  DEPARTMENT_SCHEMA,
  POSITION_SCHEMA,
  USER_SCHEMA,
  ATTENDANCE_SCHEMA,
  PAYROLL_SCHEMA,
  HR_STORAGE_KEYS
} from './schema.js'

/**
 * HR Code Configuration
 * กำหนดรูปแบบการสร้างรหัสต่างๆ
 */
export const HR_CODE_CONFIG = {
  EMPLOYEE: {
    prefix: 'EMP',
    length: 4,
    start: 1,
    format: 'EMP{number:4}'
  },
  DEPARTMENT: {
    prefix: 'DEPT',
    length: 3,
    start: 1,
    format: 'DEPT{number:3}'
  },
  POSITION: {
    prefix: 'POS',
    length: 3,
    start: 1,
    format: 'POS{number:3}'
  },
  USER: {
    prefix: 'USR',
    length: 4,
    start: 1,
    format: 'USR{number:4}'
  }
}

/**
 * Sample HR Data
 * ข้อมูลตัวอย่างสำหรับระบบ HR
 */
export const SAMPLE_HR_DATA = {
  departments: [
    {
      id: '1',
      code: 'HR',
      name: 'Human Resources',
      description: 'ฝ่ายทรัพยากรบุคคล',
      manager_id: null,
      parent_id: null,
      department_status: DEPARTMENT_STATUS.ACTIVE,
      budget: 2000000,
      location: 'อาคาร A ชั้น 2',
      phone: '02-123-4567',
      email: 'hr@company.com',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '2',
      code: 'IT',
      name: 'Information Technology',
      description: 'ฝ่ายเทคโนโลยีสารสนเทศ',
      manager_id: null,
      parent_id: null,
      department_status: DEPARTMENT_STATUS.ACTIVE,
      budget: 5000000,
      location: 'อาคาร B ชั้น 3',
      phone: '02-123-4568',
      email: 'it@company.com',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '3',
      code: 'FIN',
      name: 'Finance & Accounting',
      description: 'ฝ่ายการเงินและบัญชี',
      manager_id: null,
      parent_id: null,
      department_status: DEPARTMENT_STATUS.ACTIVE,
      budget: 1500000,
      location: 'อาคาร A ชั้น 1',
      phone: '02-123-4569',
      email: 'finance@company.com',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '4',
      code: 'SALES',
      name: 'Sales & Marketing',
      description: 'ฝ่ายขายและการตลาด',
      manager_id: null,
      parent_id: null,
      department_status: DEPARTMENT_STATUS.ACTIVE,
      budget: 3000000,
      location: 'อาคาร C ชั้น 1',
      phone: '02-123-4570',
      email: 'sales@company.com',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    }
  ],

  positions: [
    {
      id: '1',
      code: 'POS001',
      name: 'HR Manager',
      description: 'ผู้จัดการฝ่ายทรัพยากรบุคคล',
      department_id: '1',
      level: POSITION_LEVELS.MANAGER,
      salary_min: 50000,
      salary_max: 80000,
      requirements: 'ปริญญาตรี สาขาที่เกี่ยวข้อง, ประสบการณ์ 5 ปี',
      responsibilities: 'บริหารจัดการทีม HR, วางแผนนโยบายบุคคล',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '2',
      code: 'POS002',
      name: 'Senior Developer',
      description: 'นักพัฒนาระบบอาวุโส',
      department_id: '2',
      level: POSITION_LEVELS.SENIOR,
      salary_min: 60000,
      salary_max: 100000,
      requirements: 'ปริญญาตรี วิทยาการคอมพิวเตอร์, ประสบการณ์ 3-5 ปี',
      responsibilities: 'พัฒนาระบบ, ดูแลระบบฐานข้อมูล, แก้ไขปัญหา',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '3',
      code: 'POS003',
      name: 'Accountant',
      description: 'นักบัญชี',
      department_id: '3',
      level: POSITION_LEVELS.JUNIOR,
      salary_min: 25000,
      salary_max: 40000,
      requirements: 'ปริญญาตรี บัญชี, ประสบการณ์ 1-3 ปี',
      responsibilities: 'บันทึกบัญชี, จัดทำรายงานทางการเงิน',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '4',
      code: 'POS004',
      name: 'Sales Executive',
      description: 'ผู้บริหารงานขาย',
      department_id: '4',
      level: POSITION_LEVELS.JUNIOR,
      salary_min: 30000,
      salary_max: 50000,
      requirements: 'ปริญญาตรี การตลาด, ประสบการณ์ 2-4 ปี',
      responsibilities: 'ขายสินค้า, ดูแลลูกค้า, หาลูกค้าใหม่',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    }
  ],

  employees: [
    {
      id: '1',
      employee_code: 'EMP0001',
      employee_number: '2024001',
      title: 'คุณ',
      first_name: 'สมชาย',
      last_name: 'ใจดี',
      full_name: 'สมชาย ใจดี',
      nickname: 'ชาย',
      gender: 'male',
      date_of_birth: '1990-05-15',
      nationality: 'ไทย',
      id_card_number: '1234567890123',
      phone: '081-234-5678',
      mobile: '081-234-5678',
      email: 'somchai@company.com',
      personal_email: 'somchai.personal@gmail.com',
      address: '123/45 ถ.สุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110',
      emergency_contact_name: 'สมหญิง ใจดี',
      emergency_contact_phone: '081-234-5679',
      emergency_contact_relationship: 'ภรรยา',
      hire_date: '2023-01-15',
      start_date: '2023-01-15',
      employment_type: EMPLOYEE_TYPES.FULL_TIME,
      employee_status: EMPLOYEE_STATUS.ACTIVE,
      department_id: '2',
      position_id: '2',
      manager_id: null,
      salary: 75000,
      currency: 'THB',
      working_hours: 8,
      annual_leave_balance: 6,
      sick_leave_balance: 30,
      personal_leave_balance: 3,
      user_id: '2',
      avatar: null,
      created_at: new Date('2023-01-15').toISOString(),
      status: 'active'
    },
    {
      id: '2',
      employee_code: 'EMP0002',
      employee_number: '2024002',
      title: 'คุณ',
      first_name: 'สมหญิง',
      last_name: 'รักการงาน',
      full_name: 'สมหญิง รักการงาน',
      nickname: 'หญิง',
      gender: 'female',
      date_of_birth: '1992-08-20',
      nationality: 'ไทย',
      id_card_number: '1234567890124',
      phone: '081-234-5680',
      mobile: '081-234-5680',
      email: 'somying@company.com',
      personal_email: 'somying.personal@gmail.com',
      address: '456/78 ถ.พระราม 4 แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110',
      emergency_contact_name: 'สมชาย ใจดี',
      emergency_contact_phone: '081-234-5678',
      emergency_contact_relationship: 'สามี',
      hire_date: '2023-02-01',
      start_date: '2023-02-01',
      employment_type: EMPLOYEE_TYPES.FULL_TIME,
      employee_status: EMPLOYEE_STATUS.ACTIVE,
      department_id: '3',
      position_id: '3',
      manager_id: null,
      salary: 35000,
      currency: 'THB',
      working_hours: 8,
      annual_leave_balance: 6,
      sick_leave_balance: 30,
      personal_leave_balance: 3,
      user_id: '3',
      avatar: null,
      created_at: new Date('2023-02-01').toISOString(),
      status: 'active'
    },
    {
      id: '3',
      employee_code: 'EMP0003',
      employee_number: '2024003',
      title: 'คุณ',
      first_name: 'วิชัย',
      last_name: 'ทำงานหนัก',
      full_name: 'วิชัย ทำงานหนัก',
      nickname: 'วิชัย',
      gender: 'male',
      date_of_birth: '1988-12-10',
      nationality: 'ไทย',
      id_card_number: '1234567890125',
      phone: '081-234-5681',
      mobile: '081-234-5681',
      email: 'wichai@company.com',
      personal_email: 'wichai.personal@gmail.com',
      address: '789/12 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
      emergency_contact_name: 'มาลี ทำงานหนัก',
      emergency_contact_phone: '081-234-5682',
      emergency_contact_relationship: 'ภรรยา',
      hire_date: '2022-06-01',
      start_date: '2022-06-01',
      employment_type: EMPLOYEE_TYPES.FULL_TIME,
      employee_status: EMPLOYEE_STATUS.ACTIVE,
      department_id: '4',
      position_id: '4',
      manager_id: null,
      salary: 45000,
      currency: 'THB',
      working_hours: 8,
      annual_leave_balance: 6,
      sick_leave_balance: 30,
      personal_leave_balance: 3,
      user_id: '4',
      avatar: null,
      created_at: new Date('2022-06-01').toISOString(),
      status: 'active'
    }
  ],

  users: [
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      first_name: 'System',
      last_name: 'Administrator',
      full_name: 'System Administrator',
      avatar: null,
      role: USER_ROLES.ADMIN,
      roles: [USER_ROLES.ADMIN],
      permissions: ['hr.*', 'sales.*', 'finance.*', 'purchase.*', 'inventory.*'],
      employee_id: null,
      user_status: USER_STATUS.ACTIVE,
      email_verified: true,
      last_login: new Date().toISOString(),
      failed_login_attempts: 0,
      timezone: 'Asia/Bangkok',
      language: 'th',
      theme: 'light',
      created_at: new Date('2024-01-01').toISOString(),
      status: 'active'
    },
    {
      id: '2',
      username: 'somchai.jaidee',
      email: 'somchai@company.com',
      first_name: 'สมชาย',
      last_name: 'ใจดี',
      full_name: 'สมชาย ใจดี',
      avatar: null,
      role: USER_ROLES.EMPLOYEE,
      roles: [USER_ROLES.EMPLOYEE],
      permissions: ['hr.read', 'attendance.*'],
      employee_id: '1',
      user_status: USER_STATUS.ACTIVE,
      email_verified: true,
      last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // เมื่อวาน
      failed_login_attempts: 0,
      timezone: 'Asia/Bangkok',
      language: 'th',
      theme: 'light',
      created_at: new Date('2023-01-15').toISOString(),
      status: 'active'
    },
    {
      id: '3',
      username: 'somying.rakgan',
      email: 'somying@company.com',
      first_name: 'สมหญิง',
      last_name: 'รักการงาน',
      full_name: 'สมหญิง รักการงาน',
      avatar: null,
      role: USER_ROLES.EMPLOYEE,
      roles: [USER_ROLES.EMPLOYEE, USER_ROLES.ACCOUNTANT],
      permissions: ['hr.read', 'finance.*', 'attendance.*'],
      employee_id: '2',
      user_status: USER_STATUS.ACTIVE,
      email_verified: true,
      last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 ชั่วโมงที่แล้ว
      failed_login_attempts: 0,
      timezone: 'Asia/Bangkok',
      language: 'th',
      theme: 'light',
      created_at: new Date('2023-02-01').toISOString(),
      status: 'active'
    },
    {
      id: '4',
      username: 'wichai.tamngan',
      email: 'wichai@company.com',
      first_name: 'วิชัย',
      last_name: 'ทำงานหนัก',
      full_name: 'วิชัย ทำงานหนัก',
      avatar: null,
      role: USER_ROLES.EMPLOYEE,
      roles: [USER_ROLES.EMPLOYEE, USER_ROLES.SALES],
      permissions: ['hr.read', 'sales.*', 'attendance.*'],
      employee_id: '3',
      user_status: USER_STATUS.ACTIVE,
      email_verified: true,
      last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 นาทีที่แล้ว
      failed_login_attempts: 0,
      timezone: 'Asia/Bangkok',
      language: 'th',
      theme: 'light',
      created_at: new Date('2022-06-01').toISOString(),
      status: 'active'
    }
  ],

  attendance: [
    {
      id: '1',
      employee_id: '1',
      date: new Date().toISOString().split('T')[0],
      check_in: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 ชั่วโมงที่แล้ว
      check_out: null,
      working_hours: 0,
      overtime_hours: 0,
      attendance_type: ATTENDANCE_TYPES.PRESENT,
      attendance_status: 'recorded',
      location: 'สำนักงาน',
      remarks: 'เข้างานปกติ',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      employee_id: '2',
      date: new Date().toISOString().split('T')[0],
      check_in: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(), // 7.5 ชั่วโมงที่แล้ว
      check_out: null,
      working_hours: 0,
      overtime_hours: 0,
      attendance_type: ATTENDANCE_TYPES.PRESENT,
      attendance_status: 'recorded',
      location: 'สำนักงาน',
      remarks: 'เข้างานปกติ',
      created_at: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ],

  payroll: [
    {
      id: '1',
      employee_id: '1',
      payroll_period: '2024-10',
      pay_date: null,
      basic_salary: 75000,
      regular_hours: 184, // 23 วันทำงาน * 8 ชม
      overtime_hours: 0,
      overtime_pay: 0,
      bonus: 0,
      commission: 0,
      allowances: 0,
      total_earnings: 75000,
      tax: 7500,
      social_security: 750,
      health_insurance: 0,
      other_deductions: 0,
      total_deductions: 8250,
      net_pay: 66750,
      payroll_status: PAYROLL_STATUS.CALCULATED,
      calculated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      employee_id: '2',
      payroll_period: '2024-10',
      pay_date: null,
      basic_salary: 35000,
      regular_hours: 184,
      overtime_hours: 0,
      overtime_pay: 0,
      bonus: 0,
      commission: 0,
      allowances: 0,
      total_earnings: 35000,
      tax: 3500,
      social_security: 750,
      health_insurance: 0,
      other_deductions: 0,
      total_deductions: 4250,
      net_pay: 30750,
      payroll_status: PAYROLL_STATUS.CALCULATED,
      calculated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'active'
    }
  ]
}

/**
 * HR Data Management Class
 * คลาสสำหรับจัดการข้อมูล HR
 */
export class HRDataManager {
  constructor() {
    this.data = SAMPLE_HR_DATA
    this.schemas = {
      employees: EMPLOYEE_SCHEMA,
      departments: DEPARTMENT_SCHEMA,
      positions: POSITION_SCHEMA,
      users: USER_SCHEMA,
      attendance: ATTENDANCE_SCHEMA,
      payroll: PAYROLL_SCHEMA
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Generate code with format
  generateCode(type, number) {
    const config = HR_CODE_CONFIG[type.toUpperCase()]
    if (!config) return null
    
    return config.format.replace('{number:' + config.length + '}', 
      number.toString().padStart(config.length, '0'))
  }

  // Validate data against schema
  validateData(data, schemaType) {
    const schema = this.schemas[schemaType]
    if (!schema) return { valid: false, errors: ['Unknown schema type'] }

    const errors = []
    
    // Basic validation (can be expanded)
    for (const [key, rules] of Object.entries(schema)) {
      if (rules.required && (data[key] === undefined || data[key] === null)) {
        errors.push(`${key} is required`)
      }
      
      if (rules.type === 'number' && data[key] !== undefined) {
        if (isNaN(Number(data[key]))) {
          errors.push(`${key} must be a number`)
        }
        if (rules.min !== undefined && Number(data[key]) < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`)
        }
      }
      
      if (rules.type === 'email' && data[key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data[key])) {
          errors.push(`${key} must be a valid email`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get data by type
  getData(type) {
    return this.data[type] || []
  }

  // Add new record
  addRecord(type, record) {
    if (!this.data[type]) {
      this.data[type] = []
    }

    const validation = this.validateData(record, type)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const newRecord = {
      ...record,
      id: record.id || this.generateId(),
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: record.status || 'active'
    }

    this.data[type].push(newRecord)
    return newRecord
  }

  // Update record
  updateRecord(type, id, updates) {
    const records = this.data[type]
    if (!records) return null

    const index = records.findIndex(r => r.id === id)
    if (index === -1) return null

    const validation = this.validateData({ ...records[index], ...updates }, type)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    records[index] = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString()
    }

    return records[index]
  }

  // Delete record
  deleteRecord(type, id) {
    const records = this.data[type]
    if (!records) return false

    const index = records.findIndex(r => r.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    return true
  }

  // Find records
  findRecords(type, filters = {}) {
    const records = this.data[type] || []
    
    if (Object.keys(filters).length === 0) {
      return records
    }

    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(record[key])
        }
        return record[key] === value
      })
    })
  }

  // Get statistics
  getStatistics(type) {
    const records = this.data[type] || []
    
    const stats = {
      total: records.length,
      active: records.filter(r => r.status === 'active').length,
      inactive: records.filter(r => r.status === 'inactive').length
    }

    // Type-specific statistics
    if (type === 'employees') {
      stats.by_department = {}
      stats.by_position = {}
      stats.by_status = {}
      
      records.forEach(emp => {
        // By department
        const deptId = emp.department_id
        if (deptId) {
          stats.by_department[deptId] = (stats.by_department[deptId] || 0) + 1
        }
        
        // By position
        const posId = emp.position_id
        if (posId) {
          stats.by_position[posId] = (stats.by_position[posId] || 0) + 1
        }
        
        // By status
        const empStatus = emp.employee_status
        if (empStatus) {
          stats.by_status[empStatus] = (stats.by_status[empStatus] || 0) + 1
        }
      })
    }

    if (type === 'users') {
      stats.by_role = {}
      stats.verified = records.filter(u => u.email_verified).length
      stats.logged_in_today = records.filter(u => {
        if (!u.last_login) return false
        const loginDate = new Date(u.last_login).toDateString()
        const today = new Date().toDateString()
        return loginDate === today
      }).length
      
      records.forEach(user => {
        const role = user.role
        if (role) {
          stats.by_role[role] = (stats.by_role[role] || 0) + 1
        }
      })
    }

    return stats
  }

  // Export data
  exportData(type) {
    return JSON.stringify(this.data[type] || [], null, 2)
  }

  // Import data
  importData(type, jsonData) {
    try {
      const data = JSON.parse(jsonData)
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array')
      }

      // Validate each record
      data.forEach((record, index) => {
        const validation = this.validateData(record, type)
        if (!validation.valid) {
          throw new Error(`Record ${index + 1}: ${validation.errors.join(', ')}`)
        }
      })

      this.data[type] = data
      return data.length
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`)
    }
  }
}

// Create global instance
export const hrDataManager = new HRDataManager()

// Export configuration and defaults
export {
  HR_CONFIG,
  HR_DEFAULTS,
  HR_STORAGE_KEYS,
  EMPLOYEE_TYPES,
  EMPLOYEE_STATUS,
  POSITION_LEVELS,
  DEPARTMENT_STATUS,
  USER_ROLES,
  USER_STATUS,
  ATTENDANCE_TYPES,
  PAYROLL_STATUS
}

// Export schemas
export {
  EMPLOYEE_SCHEMA,
  DEPARTMENT_SCHEMA,
  POSITION_SCHEMA,
  USER_SCHEMA,
  ATTENDANCE_SCHEMA,
  PAYROLL_SCHEMA
}