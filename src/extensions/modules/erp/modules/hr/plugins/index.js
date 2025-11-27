// Import HRService plugin
import hrServicePlugin from './hrService.js'

export default {
  install(app) {
    // HR Module Plugin for Dynamic Loading
    
    // Initialize ERP_CORE.modules.hr if not exists
    if (!window.ERP_CORE) {
      window.ERP_CORE = { modules: {} }
    }
    
    if (!window.ERP_CORE.modules.hr) {
      window.ERP_CORE.modules.hr = {}
    }

    // ✅ Install HRService plugin first (for Gateway API integration)
    hrServicePlugin.install(app)

    // Import HR masterdata
    const loadHRMasterData = async () => {
      try {
        const hrMasterData = await import('../../../core/masterdata/hr/index.js')
        return hrMasterData
      } catch (error) {
        console.warn('HR MasterData not available, using fallback data')
        return null
      }
    }

    // HR Module Data Management (Using ERP CORE + MasterData)
    window.ERP_CORE.modules.hr = {
      // HR MasterData reference
      masterData: null,
      
      // Internal data storage
      data: {
        employees: [],
        users: [],
        departments: [],
        positions: [],
        attendance: [],
        payroll: [],
        settings: {
          workSchedule: [],
          salaryStructure: [],
          holidays: []
        }
      },

      // Initialize HR module with masterdata
      async initializeMasterData() {
        try {
          this.masterData = await loadHRMasterData()
          if (this.masterData?.SAMPLE_HR_DATA) {
            // Load sample data from masterdata
            Object.assign(this.data, this.masterData.SAMPLE_HR_DATA)
            console.log('✅ HR MasterData loaded successfully')
          }
        } catch (error) {
          console.error('❌ Failed to load HR MasterData:', error)
        }
      },

      // Core data access methods (no external API calls)
      async getData(type, filters = {}) {
        try {
          // Ensure masterdata is loaded
          if (!this.masterData) {
            await this.initializeMasterData()
          }
          
          // Use ERP_CORE data instead of external API
          const coreData = window.ERP_CORE?.data?.[type] || this.data[type] || []
          
          // Apply filters if provided
          if (Object.keys(filters).length > 0) {
            return coreData.filter(item => {
              return Object.entries(filters).every(([key, value]) => {
                return item[key] === value || (Array.isArray(value) && value.includes(item[key]))
              })
            })
          }
          
          return coreData
        } catch (error) {
          console.error(`HR getData Error for ${type}:`, error)
          return []
        }
      },

      async setData(type, data) {
        try {
          // Store data in ERP_CORE
          if (!window.ERP_CORE.data) {
            window.ERP_CORE.data = {}
          }
          window.ERP_CORE.data[type] = Array.isArray(data) ? data : [data]
          
          // Also update local data
          this.data[type] = Array.isArray(data) ? data : [data]
          
          return { success: true, data: window.ERP_CORE.data[type] }
        } catch (error) {
          console.error(`HR setData Error for ${type}:`, error)
          return { success: false, error: error.message }
        }
      },

      // Validate data using masterdata schemas
      validateData(type, data) {
        if (!this.masterData?.hrDataManager) {
          return { valid: true } // Fallback if no masterdata
        }
        
        try {
          return this.masterData.hrDataManager.validateData(data, type)
        } catch (error) {
          console.error('Validation error:', error)
          return { valid: false, errors: [error.message] }
        }
      },

      // Generate codes using masterdata config
      generateCode(type, number) {
        if (!this.masterData?.HR_CODE_CONFIG) {
          return `${type.toUpperCase()}${number.toString().padStart(4, '0')}`
        }
        
        try {
          return this.masterData.hrDataManager.generateCode(type, number)
        } catch (error) {
          console.error('Code generation error:', error)
          return `${type.toUpperCase()}${number.toString().padStart(4, '0')}`
        }
      },

      // Employee Management Methods (Using ERP CORE)
      async getEmployees(filters = {}) {
        return await this.getData('employees', filters)
      },

      async getEmployee(id) {
        const employees = await this.getData('employees')
        return employees.find(emp => emp.id === id) || null
      },

      async createEmployee(data) {
        const employees = await this.getData('employees')
        const newEmployee = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          status: 'active'
        }
        employees.push(newEmployee)
        await this.setData('employees', employees)
        return { success: true, data: newEmployee }
      },

      async updateEmployee(id, data) {
        const employees = await this.getData('employees')
        const index = employees.findIndex(emp => emp.id === id)
        if (index !== -1) {
          employees[index] = { ...employees[index], ...data, updated_at: new Date().toISOString() }
          await this.setData('employees', employees)
          return { success: true, data: employees[index] }
        }
        return { success: false, error: 'Employee not found' }
      },

      async deleteEmployee(id) {
        const employees = await this.getData('employees')
        const filtered = employees.filter(emp => emp.id !== id)
        await this.setData('employees', filtered)
        return { success: true }
      },

      // User Management Methods (Using ERP CORE)
      async getUsers(filters = {}) {
        return await this.getData('users', filters)
      },

      async createUser(data) {
        const users = await this.getData('users')
        const newUser = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          status: 'active'
        }
        users.push(newUser)
        await this.setData('users', users)
        return { success: true, data: newUser }
      },

      async updateUser(id, data) {
        const users = await this.getData('users')
        const index = users.findIndex(user => user.id === id)
        if (index !== -1) {
          users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() }
          await this.setData('users', users)
          return { success: true, data: users[index] }
        }
        return { success: false, error: 'User not found' }
      },

      async toggleUserStatus(id, action) {
        const newStatus = action === 'activate' ? 'active' : 'inactive'
        return await this.updateUser(id, { status: newStatus })
      },

      async updateUserPermissions(id, permissions) {
        return await this.updateUser(id, { permissions })
      },

      // Department & Position Methods (Using ERP CORE)
      async getDepartments() {
        return await this.getData('departments')
      },

      async getPositions() {
        return await this.getData('positions')
      },

      async createDepartment(data) {
        const departments = await this.getData('departments')
        const newDept = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        }
        departments.push(newDept)
        await this.setData('departments', departments)
        return { success: true, data: newDept }
      },

      async createPosition(data) {
        const positions = await this.getData('positions')
        const newPos = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        }
        positions.push(newPos)
        await this.setData('positions', positions)
        return { success: true, data: newPos }
      },

      // Attendance Methods (Using ERP CORE)
      async getAttendance(filters = {}) {
        return await this.getData('attendance', filters)
      },

      async checkIn(employeeId) {
        const attendance = await this.getData('attendance')
        const newRecord = {
          id: Date.now().toString(),
          employee_id: employeeId,
          check_in: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          status: 'present'
        }
        attendance.push(newRecord)
        await this.setData('attendance', attendance)
        return { success: true, data: newRecord }
      },

      async checkOut(employeeId) {
        const attendance = await this.getData('attendance')
        const today = new Date().toISOString().split('T')[0]
        const record = attendance.find(att => 
          att.employee_id === employeeId && 
          att.date === today && 
          !att.check_out
        )
        
        if (record) {
          record.check_out = new Date().toISOString()
          await this.setData('attendance', attendance)
          return { success: true, data: record }
        }
        return { success: false, error: 'No check-in record found for today' }
      },

      // Payroll Methods (Using ERP CORE)
      async getPayroll(filters = {}) {
        return await this.getData('payroll', filters)
      },

      async calculatePayroll(employeeId, period) {
        const employee = await this.getEmployee(employeeId)
        if (!employee) {
          return { success: false, error: 'Employee not found' }
        }

        const payrollRecord = {
          id: Date.now().toString(),
          employee_id: employeeId,
          period: period,
          basic_salary: employee.salary || 0,
          calculated_at: new Date().toISOString(),
          status: 'calculated'
        }

        const payroll = await this.getData('payroll')
        payroll.push(payrollRecord)
        await this.setData('payroll', payroll)
        return { success: true, data: payrollRecord }
      },

      // Reports Methods (Using ERP CORE)
      async getEmployeeReport(filters = {}) {
        return await this.getEmployees(filters)
      },

      async getAttendanceReport(filters = {}) {
        return await this.getAttendance(filters)
      },

      async getPayrollReport(filters = {}) {
        return await this.getPayroll(filters)
      },

      // Utility Methods
      async init(component) {
        // Initialize component with HR module context
        if (component && typeof component === 'object') {
          component.hrModule = this
          
          // Initialize masterdata and sample data
          await this.initializeMasterData()
          await this.initializeSampleData()
        }
      },

      // Initialize sample data for demo purposes
      async initializeSampleData() {
        try {
          // Initialize ERP_CORE.data if not exists
          if (!window.ERP_CORE.data) {
            window.ERP_CORE.data = {}
          }

          // Load data from masterdata if available
          if (this.masterData?.SAMPLE_HR_DATA) {
            const sampleData = this.masterData.SAMPLE_HR_DATA
            
            // Initialize each data type
            for (const [type, data] of Object.entries(sampleData)) {
              if (!window.ERP_CORE.data[type] || window.ERP_CORE.data[type].length === 0) {
                window.ERP_CORE.data[type] = Array.isArray(data) ? [...data] : []
                this.data[type] = Array.isArray(data) ? [...data] : []
              }
            }
            
            console.log('✅ HR Module sample data initialized from MasterData')
          } else {
            // Fallback to basic sample data
            const dataTypes = ['employees', 'users', 'departments', 'positions', 'attendance', 'payroll']
            
            for (const type of dataTypes) {
              if (!window.ERP_CORE.data[type]) {
                window.ERP_CORE.data[type] = []
              }
            }

            // Basic sample departments
            if (window.ERP_CORE.data.departments.length === 0) {
              const basicDepartments = [
                { 
                  id: '1', 
                  name: 'Human Resources', 
                  code: 'HR', 
                  description: 'บริหารทรัพยากรบุคคล',
                  manager_id: null,
                  parent_id: null,
                  status: 'active',
                  created_at: new Date().toISOString()
                },
                { 
                  id: '2', 
                  name: 'Information Technology', 
                  code: 'IT', 
                  description: 'เทคโนโลยีสารสนเทศ',
                  manager_id: null,
                  parent_id: null,
                  status: 'active',
                  created_at: new Date().toISOString()
                }
              ]
              window.ERP_CORE.data.departments = basicDepartments
              this.data.departments = basicDepartments
            }

            // Basic sample positions
            if (window.ERP_CORE.data.positions.length === 0) {
              const basicPositions = [
                { 
                  id: '1', 
                  name: 'HR Manager', 
                  department_id: '1', 
                  level: 'Management',
                  description: 'ผู้จัดการฝ่ายทรัพยากรบุคคล',
                  salary_min: 50000,
                  salary_max: 80000,
                  status: 'active',
                  created_at: new Date().toISOString()
                },
                { 
                  id: '2', 
                  name: 'Senior Developer', 
                  department_id: '2', 
                  level: 'Senior',
                  description: 'นักพัฒนาระบบอาวุโส',
                  salary_min: 60000,
                  salary_max: 100000,
                  status: 'active',
                  created_at: new Date().toISOString()
                }
              ]
              window.ERP_CORE.data.positions = basicPositions
              this.data.positions = basicPositions
            }

            // Basic sample employees
            if (window.ERP_CORE.data.employees.length === 0) {
              const basicEmployees = [
                {
                  id: '1',
                  employee_code: 'EMP0001',
                  first_name: 'สมชาย',
                  last_name: 'ใจดี',
                  email: 'somchai@company.com',
                  phone: '081-234-5678',
                  department_id: '2',
                  position_id: '2',
                  hire_date: '2023-01-15',
                  salary: 75000,
                  status: 'active',
                  user_id: null,
                  created_at: new Date().toISOString()
                }
              ]
              window.ERP_CORE.data.employees = basicEmployees
              this.data.employees = basicEmployees
            }

            // Basic sample users
            if (window.ERP_CORE.data.users.length === 0) {
              const basicUsers = [
                {
                  id: '1',
                  username: 'admin',
                  email: 'admin@company.com',
                  first_name: 'System',
                  last_name: 'Administrator',
                  role: 'admin',
                  permissions: ['hr.*', 'sales.*', 'finance.*'],
                  employee_id: null,
                  status: 'active',
                  last_login: null,
                  created_at: new Date().toISOString()
                }
              ]
              window.ERP_CORE.data.users = basicUsers
              this.data.users = basicUsers
            }

            console.log('✅ HR Module basic sample data initialized')
          }
        } catch (error) {
          console.error('❌ Initialize sample data error:', error)
        }
      },

      // Cross-module integration (Using ERP CORE)
      async getEmployeeByUserId(userId) {
        const employees = await this.getData('employees')
        return employees.find(emp => emp.user_id === userId) || null
      },

      async getUserByEmployeeId(employeeId) {
        const users = await this.getData('users')
        return users.find(user => user.employee_id === employeeId) || null
      },

      // For other modules to access employee data
      async getEmployeesForDropdown() {
        try {
          const employees = await this.getEmployees({ status: 'active' })
          return employees.map(emp => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            code: emp.employee_code
          }))
        } catch (error) {
          console.error('Get employees for dropdown error:', error)
          return []
        }
      },

      // Integration with other ERP modules
      getModuleInfo() {
        return {
          name: 'hr',
          title: 'Human Resources',
          version: '1.0.0',
          provides: ['employees', 'users', 'departments', 'positions'],
          depends: [],
          masterData: !!this.masterData,
          schemas: this.masterData ? Object.keys(this.masterData.hrDataManager?.schemas || {}) : [],
          sampleDataTypes: Object.keys(this.data)
        }
      },

      // Get schema information
      getSchema(type) {
        if (!this.masterData?.hrDataManager?.schemas) {
          return null
        }
        return this.masterData.hrDataManager.schemas[type] || null
      },

      // Get configuration
      getConfig() {
        if (!this.masterData?.HR_CONFIG) {
          return {
            WORKING_HOURS_PER_DAY: 8,
            WORKING_DAYS_PER_WEEK: 5,
            ANNUAL_LEAVE_DAYS: 6,
            SICK_LEAVE_DAYS: 30
          }
        }
        return this.masterData.HR_CONFIG
      },

      // Get constants
      getConstants(constantName) {
        if (!this.masterData) {
          return null
        }
        
        const constants = {
          EMPLOYEE_TYPES: this.masterData.EMPLOYEE_TYPES,
          EMPLOYEE_STATUS: this.masterData.EMPLOYEE_STATUS,
          USER_ROLES: this.masterData.USER_ROLES,
          USER_STATUS: this.masterData.USER_STATUS,
          POSITION_LEVELS: this.masterData.POSITION_LEVELS,
          DEPARTMENT_STATUS: this.masterData.DEPARTMENT_STATUS
        }
        
        return constantName ? constants[constantName] : constants
      },

      // Get labels
      getLabels(labelType) {
        if (!this.masterData) {
          return {}
        }
        
        const labels = {
          EMPLOYEE_TYPE_LABELS: this.masterData.EMPLOYEE_TYPE_LABELS,
          EMPLOYEE_STATUS_LABELS: this.masterData.EMPLOYEE_STATUS_LABELS,
          USER_ROLE_LABELS: this.masterData.USER_ROLE_LABELS,
          USER_STATUS_LABELS: this.masterData.USER_STATUS_LABELS,
          POSITION_LEVEL_LABELS: this.masterData.POSITION_LEVEL_LABELS
        }
        
        return labelType ? labels[labelType] : labels
      }
    }

    // Global mixin for HR components (No external API calls)
    app.mixin({
      methods: {
        async $hrData(type, filters = {}) {
          return await window.ERP_CORE.modules.hr.getData(type, filters)
        },
        
        async $hrCreate(type, data) {
          const methodMap = {
            'employees': 'createEmployee',
            'users': 'createUser',
            'departments': 'createDepartment',
            'positions': 'createPosition'
          }
          
          const method = methodMap[type]
          if (method && window.ERP_CORE.modules.hr[method]) {
            return await window.ERP_CORE.modules.hr[method](data)
          }
          
          throw new Error(`Unknown HR data type: ${type}`)
        }
      }
    })

    // Install HR utilities globally
    app.config.globalProperties.$hr = window.ERP_CORE.modules.hr

    console.log('HR Module Plugin installed successfully')
  }
}