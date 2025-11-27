/**
 * Department Service
 * บริการสำหรับจัดการข้อมูลแผนก/ฝ่าย
 * รวมถึงการจัดการสิทธิ์การเข้าถึงโมดูลของแต่ละแผนก
 * ใช้ Transaction API เหมือน PurchaseService
 */

class DepartmentService {
  constructor() {
    this.apiRequest = null
    this.clientKey = null
    this.initialized = false
    this.cache = {
      departments: [],
      lastUpdated: null
    }
  }

  /**
   * Initialize with Vue app instance (for $Request service)
   * @param {Object} vueAppOrInstance - Vue app.config.globalProperties or component instance
   */
  initialize(vueAppOrInstance) {
    // ดึง clientKey จาก ERP_CORE ก่อน (Single Source of Truth)
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    // Try to get $Request from various sources
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      
      // Backup: ถ้าไม่มี key จาก ERP_CORE จึงใช้ fallback
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.$Key || null
      }
      
      this.initialized = true
      console.log('🔑 [DepartmentService] Initialized from component instance')
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.appContext.config.globalProperties.$Key || null
      }
      
      this.initialized = true
      console.log('🔑 [DepartmentService] Initialized from appContext')
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      if (!this.clientKey) {
        this.clientKey = window.vueApp.$Key || null
      }
      
      this.initialized = true
      console.log('🔑 [DepartmentService] Initialized from window.vueApp')
    }
    
    console.log('🔑 [DepartmentService] Client Key:', {
      hasKey: !!this.clientKey,
      keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
      source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback',
      initialized: this.initialized
    })
  }

  /**
   * Refresh clientKey จาก ERP_CORE
   */
  refreshClientKey() {
    if (window.ERP_CORE?.clientKey) {
      this.clientKey = window.ERP_CORE.clientKey
    }
  }

  /**
   * สร้างรหัสแผนกอัตโนมัติ
   */
  generateDepartmentCode() {
    const prefix = 'DEPT'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `${prefix}${timestamp}${random}`
  }

  /**
   * ดึงข้อมูลแผนกทั้งหมด (จาก API)
   */
  async getDepartments(filters = {}) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized, using localStorage fallback')
      return this.getDepartmentsFromLocalStorage(filters)
    }

    this.refreshClientKey()

    try {
      // สร้าง pipeline สำหรับ aggregate
      const pipeline = [
        { 
          $match: { 
            status: { $ne: 'deleted' }
          } 
        }
      ]

      // Apply filters
      if (filters.status) {
        pipeline[0].$match.status = filters.status
      }

      if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' }
        pipeline[0].$match.$or = [
          { code: searchRegex },
          { name: searchRegex },
          { description: searchRegex }
        ]
      }

      const response = await this.apiRequest.POST('departments/aggregate', {
        pipeline: pipeline
      }, this.clientKey)

      if (response && response.data) {
        const departments = response.data.map(dept => ({
          ...dept,
          id: dept._id || dept.id
        }))
        
        this.cache.departments = departments
        this.cache.lastUpdated = new Date()
        return departments
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get departments from API:', error)
      // Fallback to localStorage
      return this.getDepartmentsFromLocalStorage(filters)
    }
  }

  /**
   * Fallback: ดึงจาก localStorage
   */
  getDepartmentsFromLocalStorage(filters = {}) {
    try {
      const stored = localStorage.getItem('erp_departments')
      let departments = stored ? JSON.parse(stored) : []
      
      // Apply filters
      if (filters.status) {
        departments = departments.filter(dept => dept.status === filters.status)
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        departments = departments.filter(dept => 
          dept.code?.toLowerCase().includes(search) ||
          dept.name?.toLowerCase().includes(search) ||
          dept.description?.toLowerCase().includes(search)
        )
      }
      
      return departments
    } catch (error) {
      console.error('Get departments from localStorage error:', error)
      return []
    }
  }

  /**
   * ดึงข้อมูลแผนกตาม ID (จาก API)
   */
  async getDepartmentById(id) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized, using localStorage fallback')
      const departments = this.getDepartmentsFromLocalStorage()
      return departments.find(dept => dept.id === id) || null
    }

    try {
      const response = await this.apiRequest.GET(`departments/${id}`, this.clientKey)
      console.log('✅ [DepartmentService] getDepartmentById response:', response?.data)
      console.log('🔍 [DepartmentService] Has module_access?', !!response?.data?.module_access)
      console.log('🔍 [DepartmentService] module_access value:', response?.data?.module_access)
      console.log('🔍 [DepartmentService] All fields:', Object.keys(response?.data || {}))
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get department:', error)
      // Fallback
      const departments = this.getDepartmentsFromLocalStorage()
      return departments.find(dept => dept.id === id) || null
    }
  }

  /**
   * สร้างแผนกใหม่ (ผ่าน API)
   */
  async createDepartment(data) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized, using localStorage fallback')
      return this.createDepartmentInLocalStorage(data)
    }

    this.refreshClientKey()

    try {
      // เตรียมข้อมูล
      const departmentData = {
        code: data.code || this.generateDepartmentCode(),
        name: data.name,
        description: data.description || '',
        manager_id: data.manager_id || null,
        parent_id: data.parent_id || null,
        status: data.status || 'active',
        employees_count: 0,
        module_access: data.module_access || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: data.created_by || 'system'
      }

      console.log('📤 [DepartmentService] Creating department via API:', departmentData)

      // เรียก API
      const response = await this.apiRequest.POST('departments', {
        data: departmentData
      }, this.clientKey)

      // Invalidate cache
      this.cache.departments = []
      this.cache.lastUpdated = null

      console.log('✅ [DepartmentService] Department created:', response?.data)

      return {
        success: true,
        data: response?.data || departmentData,
        message: 'สร้างแผนกเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to create department via API:', error)
      // Fallback to localStorage
      return this.createDepartmentInLocalStorage(data)
    }
  }

  /**
   * Fallback: สร้างแผนกใน localStorage
   */
  createDepartmentInLocalStorage(data) {
    try {
      const stored = localStorage.getItem('erp_departments')
      const departments = stored ? JSON.parse(stored) : []
      
      const newDepartment = {
        id: this.generateId(),
        code: data.code || this.generateDepartmentCode(),
        name: data.name,
        description: data.description || '',
        manager_id: data.manager_id || null,
        parent_id: data.parent_id || null,
        status: data.status || 'active',
        employees_count: 0,
        module_access: data.module_access || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: data.created_by || 'system'
      }
      
      departments.push(newDepartment)
      localStorage.setItem('erp_departments', JSON.stringify(departments))
      
      // บันทึกสิทธิ์
      if (data.module_access && data.module_access.length > 0) {
        this.saveDepartmentModuleAccessToLocalStorage(newDepartment.id, data.module_access)
      }
      
      console.log('✅ [DepartmentService] Department created in localStorage:', newDepartment)
      
      return {
        success: true,
        data: newDepartment,
        message: 'สร้างแผนกเรียบร้อยแล้ว (localStorage)'
      }
    } catch (error) {
      console.error('Create department in localStorage error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างแผนก'
      }
    }
  }

  /**
   * อัพเดทข้อมูลแผนก (ผ่าน API)
   */
  async updateDepartment(id, data) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized, using localStorage fallback')
      return this.updateDepartmentInLocalStorage(id, data)
    }

    this.refreshClientKey()

    try {
      // เตรียมข้อมูลที่จะอัพเดท - ลบ immutable fields ออก
      // eslint-disable-next-line no-unused-vars
      const { id: _, _id: __, created_at, created_by, ...cleanData } = data
      
      const updateData = {
        ...cleanData,
        updated_at: new Date().toISOString()
      }

      console.log('📤 [DepartmentService] Updating department via API:', id, updateData)

      // เรียก API
      const response = await this.apiRequest.PUT(`departments/${id}`, {
        data: updateData
      }, this.clientKey)

      // Invalidate cache
      this.cache.departments = []
      this.cache.lastUpdated = null

      console.log('✅ [DepartmentService] Department updated:', response?.data)

      return {
        success: true,
        data: response?.data || updateData,
        message: 'อัพเดทข้อมูลแผนกเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to update department via API:', error)
      // Fallback to localStorage
      return this.updateDepartmentInLocalStorage(id, data)
    }
  }

  /**
   * Fallback: อัพเดทใน localStorage
   */
  updateDepartmentInLocalStorage(id, data) {
    try {
      const stored = localStorage.getItem('erp_departments')
      const departments = stored ? JSON.parse(stored) : []
      const index = departments.findIndex(dept => dept.id === id)
      
      if (index === -1) {
        return {
          success: false,
          message: 'ไม่พบแผนกที่ต้องการแก้ไข'
        }
      }
      
      departments[index] = {
        ...departments[index],
        ...data,
        id: id,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('erp_departments', JSON.stringify(departments))
      
      // อัพเดทสิทธิ์
      if (data.module_access) {
        this.saveDepartmentModuleAccessToLocalStorage(id, data.module_access)
      }
      
      console.log('✅ [DepartmentService] Department updated in localStorage')
      
      return {
        success: true,
        data: departments[index],
        message: 'อัพเดทข้อมูลแผนกเรียบร้อยแล้ว (localStorage)'
      }
    } catch (error) {
      console.error('Update department in localStorage error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพเดทแผนก'
      }
    }
  }

  /**
   * ลบแผนก (Soft Delete ผ่าน API)
   */
  async deleteDepartment(id) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized, using localStorage fallback')
      return this.deleteDepartmentFromLocalStorage(id)
    }

    this.refreshClientKey()

    try {
      console.log('🗑️ [DepartmentService] Soft deleting department:', id)

      // Soft Delete: เปลี่ยนสถานะเป็น deleted
      const deleteData = {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const response = await this.apiRequest.PUT(`departments/${id}`, {
        data: deleteData
      }, this.clientKey)

      // Invalidate cache
      this.cache.departments = []
      this.cache.lastUpdated = null

      console.log('✅ [DepartmentService] Department soft deleted:', response)

      return {
        success: true,
        message: 'ลบแผนกเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to delete department via API:', error)
      // Fallback
      return this.deleteDepartmentFromLocalStorage(id)
    }
  }

  /**
   * Fallback: ลบจาก localStorage
   */
  deleteDepartmentFromLocalStorage(id) {
    try {
      const stored = localStorage.getItem('erp_departments')
      let departments = stored ? JSON.parse(stored) : []
      const department = departments.find(dept => dept.id === id)
      
      if (!department) {
        return {
          success: false,
          message: 'ไม่พบแผนกที่ต้องการลบ'
        }
      }
      
      if (department.employees_count > 0) {
        return {
          success: false,
          message: 'ไม่สามารถลบแผนกที่มีพนักงานอยู่ได้'
        }
      }
      
      departments = departments.filter(dept => dept.id !== id)
      localStorage.setItem('erp_departments', JSON.stringify(departments))
      
      // ลบสิทธิ์
      this.deleteDepartmentModuleAccessFromLocalStorage(id)
      
      console.log('✅ [DepartmentService] Department deleted from localStorage')
      
      return {
        success: true,
        message: 'ลบแผนกเรียบร้อยแล้ว (localStorage)'
      }
    } catch (error) {
      console.error('Delete department from localStorage error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบแผนก'
      }
    }
  }

  /**
   * บันทึกสิทธิ์การเข้าถึงโมดูลของแผนก (localStorage สำหรับ module access)
   */
  async saveDepartmentModuleAccess(departmentId, moduleAccess) {
    return this.saveDepartmentModuleAccessToLocalStorage(departmentId, moduleAccess)
  }

  saveDepartmentModuleAccessToLocalStorage(departmentId, moduleAccess) {
    try {
      const stored = localStorage.getItem('erp_department_access')
      const allAccess = stored ? JSON.parse(stored) : {}
      
      allAccess[departmentId] = {
        department_id: departmentId,
        modules: moduleAccess,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('erp_department_access', JSON.stringify(allAccess))
      
      return {
        success: true,
        message: 'บันทึกสิทธิ์การเข้าถึงเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('Save department module access error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์'
      }
    }
  }

  /**
   * ดึงสิทธิ์การเข้าถึงโมดูลของแผนก
   */
  async getDepartmentModuleAccess(departmentId) {
    try {
      const stored = localStorage.getItem('erp_department_access')
      const allAccess = stored ? JSON.parse(stored) : {}
      
      return allAccess[departmentId]?.modules || []
    } catch (error) {
      console.error('Get department module access error:', error)
      return []
    }
  }

  /**
   * ลบสิทธิ์การเข้าถึงโมดูลของแผนก
   */
  async deleteDepartmentModuleAccess(departmentId) {
    return this.deleteDepartmentModuleAccessFromLocalStorage(departmentId)
  }

  deleteDepartmentModuleAccessFromLocalStorage(departmentId) {
    try {
      const stored = localStorage.getItem('erp_department_access')
      const allAccess = stored ? JSON.parse(stored) : {}
      
      delete allAccess[departmentId]
      
      localStorage.setItem('erp_department_access', JSON.stringify(allAccess))
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Delete department module access error:', error)
      return {
        success: false
      }
    }
  }

  /**
   * ตรวจสอบว่าแผนกมีสิทธิ์เข้าถึงโมดูลหรือไม่
   */
  async canAccessModule(departmentId, moduleName) {
    try {
      const moduleAccess = await this.getDepartmentModuleAccess(departmentId)
      return moduleAccess.some(module => module.module === moduleName && module.access === true)
    } catch (error) {
      console.error('Check module access error:', error)
      return false
    }
  }

  /**
   * ดึงรายชื่อโมดูลทั้งหมดจาก ERP_CORE
   */
  async getAvailableModules() {
    try {
      if (!window.ERP_CORE?.modules) {
        return []
      }
      
      const moduleNames = await window.ERP_CORE.modules.getModuleNames()
      const modules = []
      
      for (const moduleName of moduleNames) {
        const config = await window.ERP_CORE.modules.getModuleConfig(moduleName, 'menuConfig')
        if (config) {
          await config.loadModuleNameTH()
          modules.push({
            key: moduleName,
            name: config.moduleName || moduleName,
            nameTH: config.moduleNameTH || config.moduleName || moduleName,
            menuCount: config.count || 0,
            icon: this.getModuleIcon(moduleName)
          })
        }
      }
      
      return modules
    } catch (error) {
      console.error('Get available modules error:', error)
      return []
    }
  }

  /**
   * ดึงไอคอนของโมดูล
   */
  getModuleIcon(moduleKey) {
    const icons = {
      hr: 'users',
      accounting: 'calculator',
      sales: 'shopping-cart',
      inventory: 'boxes',
      purchase: 'shopping-bag',
      finance: 'money-bill-wave',
      delivery: 'truck',
      production: 'industry'
    }
    return icons[moduleKey] || 'cube'
  }

  /**
   * สร้าง ID แบบสุ่ม
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * ดึงสถิติแผนก
   */
  async getStatistics() {
    try {
      const departments = await this.getDepartments()
      
      return {
        total: departments.length,
        active: departments.filter(dept => dept.status === 'active').length,
        inactive: departments.filter(dept => dept.status === 'inactive').length,
        employees_count: departments.reduce((sum, dept) => sum + (dept.employees_count || 0), 0)
      }
    } catch (error) {
      console.error('Get statistics error:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        employees_count: 0
      }
    }
  }

  /**
   * บันทึกโครงสร้างองค์กร (Organization Chart) ของแผนก
   * @param {string} departmentId - ID ของแผนก
   * @param {Array} orgChart - โครงสร้างองค์กรแบบ tree
   */
  async saveOrganizationChart(departmentId, orgChart) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized')
      return { success: false, message: 'Service not initialized' }
    }

    // Refresh และ validate clientKey
    this.refreshClientKey()
    
    if (!this.clientKey) {
      console.error('❌ [DepartmentService] Client key is missing!')
      return { success: false, message: 'Client key is required' }
    }
    
    console.log('🔑 [DepartmentService] Using client key:', this.clientKey ? '***' + this.clientKey.slice(-4) : 'null')

    try {
      console.log('📤 [DepartmentService] Saving org chart for department:', departmentId)

      // แปลง tree structure เป็น flat array
      const positions = this.flattenOrgChart(orgChart, departmentId)
      
      console.log('📋 [DepartmentService] Processing', positions.length, 'positions')

      // แยกเป็น UPDATE และ INSERT
      const toUpdate = positions.filter(p => p.db_id)
      const toInsert = positions.filter(p => !p.db_id)

      console.log('📊 [DepartmentService] Actions:', {
        update: toUpdate.length,
        insert: toInsert.length
      })

      const results = []

      // UPDATE existing positions
      if (toUpdate.length > 0) {
        console.log('✏️ Updating', toUpdate.length, 'positions...')
        for (const position of toUpdate) {
          this.refreshClientKey()
          
          // ลบ db_id ออกก่อน update (ไม่ต้องส่งไปใน data)
          const { db_id, ...updateData } = position
          
          const response = await this.apiRequest.PUT(
            `department_position_permission/${db_id}`,
            { data: updateData },
            this.clientKey
          )
          results.push(response?.data)
          console.log('  ✓ Updated:', position.position_name)
        }
      }

      // INSERT new positions
      if (toInsert.length > 0) {
        console.log('➕ Inserting', toInsert.length, 'new positions...')
        for (const position of toInsert) {
          this.refreshClientKey()
          
          const response = await this.apiRequest.POST(
            'department_position_permission',
            { data: position },
            this.clientKey
          )
          results.push(response?.data)
          console.log('  ✓ Inserted:', position.position_name)
        }
      }

      console.log('✅ [DepartmentService] Org chart saved successfully!')

      return {
        success: true,
        data: results,
        message: 'บันทึกผังองค์กรเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ [DepartmentService] Save org chart error:', error)
      return {
        success: false,
        message: 'ไม่สามารถบันทึกผังองค์กรได้: ' + error.message
      }
    }
  }

  /**
   * สร้าง Position Permission (เพิ่มตำแหน่งใหม่)
   * @param {Object} data - ข้อมูล position permission
   * @returns {Promise<Object>}
   */
  async createPositionPermission(data) {
    if (!this.apiRequest) {
      throw new Error('Service not initialized')
    }

    this.refreshClientKey()

    try {
      console.log('➕ [DepartmentService] Creating position permission:', data.position_name)
      
      const response = await this.apiRequest.POST(
        'department_position_permission',
        { data },
        this.clientKey
      )
      
      console.log('✅ [DepartmentService] Position created:', response?.data)
      return response?.data
    } catch (error) {
      console.error('❌ [DepartmentService] Create error:', error)
      throw error
    }
  }

  /**
   * อัพเดต Position Permission (แก้ไขตำแหน่ง)
   * @param {string} id - ID ของ position permission
   * @param {Object} data - ข้อมูลที่ต้องการอัพเดต
   * @returns {Promise<Object>}
   */
  async updatePositionPermission(id, data) {
    if (!this.apiRequest) {
      throw new Error('Service not initialized')
    }

    this.refreshClientKey()

    try {
      console.log('✏️ [DepartmentService] Updating position permission:', id)
      
      const response = await this.apiRequest.PUT(
        `department_position_permission/${id}`,
        { data },
        this.clientKey
      )
      
      console.log('✅ [DepartmentService] Position updated:', response?.data)
      return response?.data
    } catch (error) {
      console.error('❌ [DepartmentService] Update error:', error)
      throw error
    }
  }

  /**
   * ลบ Position Permission (ลบตำแหน่ง)
   * @param {string} id - ID ของ position permission
   * @returns {Promise<Object>}
   */
  async deletePositionPermission(id) {
    if (!this.apiRequest) {
      throw new Error('Service not initialized')
    }

    this.refreshClientKey()

    try {
      console.log('🗑️ [DepartmentService] Deleting position permission:', id)
      
      const response = await this.apiRequest.DELETE(
        `department_position_permission/${id}`,
        null,
        this.clientKey
      )
      
      console.log('✅ [DepartmentService] Position deleted')
      return response?.data
    } catch (error) {
      console.error('❌ [DepartmentService] Delete error:', error)
      throw error
    }
  }  /**
   * แปลง tree structure เป็น flat array พร้อม parent_id และ level
   */
  flattenOrgChart(nodes, departmentId, parentPositionId = null, level = 0) {
    const result = []

    for (const node of nodes) {
      const position = {
        department_id: departmentId,
        position_id: node.position_id,
        position_code: node.position_code,
        position_name: node.position_name,
        level: node.level,
        parent_position_id: parentPositionId, // parent's position_id (not _id)
        hierarchy_level: level,
        permissions: node.permissions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      result.push(position)

      // Recursive: เพิ่ม children
      if (node.children && node.children.length > 0) {
        const childPositions = this.flattenOrgChart(
          node.children,
          departmentId,
          node.position_id, // parent_position_id = position_id ของ node นี้
          level + 1
        )
        result.push(...childPositions)
      }
    }

    return result
  }

  /**
   * ดึงโครงสร้างองค์กร (Organization Chart) ของแผนก
   * @param {string} departmentId - ID ของแผนก
   */
  async getOrganizationChart(departmentId) {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized')
      return []
    }

    this.refreshClientKey()

    try {
      // Query ข้อมูลทั้งหมดของแผนกนี้
      const pipeline = [
        {
          $match: {
            department_id: departmentId
          }
        },
        {
          $sort: {
            hierarchy_level: 1,
            created_at: 1
          }
        }
      ]

      const response = await this.apiRequest.POST(
        'department_position_permission/aggregate',
        {
          pipeline,
          collection: 'department_position_permission'
        },
        this.clientKey
      )

      const positions = response?.data || []

      console.log('✅ [DepartmentService] Loaded org chart:', positions.length, 'positions')

      // แปลง flat array เป็น tree structure
      return this.buildOrgChartTree(positions)
    } catch (error) {
      console.error('❌ Get org chart error:', error)
      return []
    }
  }

  /**
   * ดึงข้อมูลแผนกพร้อมตำแหน่งทั้งหมด (สำหรับ User Assignment)
   * Join department_position_permission + departments + positions
   */
  async getDepartmentsWithPositions() {
    if (!this.apiRequest) {
      console.warn('⚠️ DepartmentService not initialized')
      return []
    }

    this.refreshClientKey()

    try {
      console.log('📤 [DepartmentService] Loading departments with positions...')
      
      // ✅ Step 1: ดึง list ของ department_position_permission ทั้งหมด
      const permissionsResponse = await this.apiRequest.POST(
        'department_position_permission/aggregate',
        {
          pipeline: [
            {
              $sort: {
                department_id: 1,
                hierarchy_level: 1,
                created_at: 1
              }
            }
          ],
          collection: 'department_position_permission'
        },
        this.clientKey
      )

      const permissions = permissionsResponse?.data || []
      console.log('📊 [DepartmentService] Loaded', permissions.length, 'permission records')

      if (permissions.length === 0) {
        console.warn('⚠️ [DepartmentService] No department_position_permission records found')
        return []
      }

      // ✅ Step 2: ดึง departments ทั้งหมด
      const departments = await this.getDepartments({ status: 'active' })
      console.log('📊 [DepartmentService] Loaded', departments.length, 'departments')

      // ✅ Step 3: ดึง positions ทั้งหมด
      const positionsResponse = await this.apiRequest.POST(
        'positions/aggregate',
        {
          pipeline: [
            {
              $match: { status: 'active' }
            }
          ],
          collection: 'positions'
        },
        this.clientKey
      )

      const positions = positionsResponse?.data || []
      console.log('📊 [DepartmentService] Loaded', positions.length, 'positions')

      // ✅ Step 4: สร้าง lookup maps
      const deptMap = {}
      departments.forEach(dept => {
        const id = dept._id || dept.id
        deptMap[id] = dept
      })

      const posMap = {}
      positions.forEach(pos => {
        const id = pos._id || pos.id
        posMap[id] = pos
      })

      // ✅ Step 5: Join ข้อมูลแบบ manual
      const joinedData = permissions.map(perm => {
        const dept = deptMap[perm.department_id]
        const pos = posMap[perm.position_id]

        if (!dept) {
          console.warn(`⚠️ Department not found: ${perm.department_id}`)
          return null
        }

        if (!pos) {
          console.warn(`⚠️ Position not found: ${perm.position_id}`)
          return null
        }

        return {
          _id: perm._id,
          department_id: perm.department_id,
          position_id: perm.position_id,
          position_code: perm.position_code || pos.code,
          position_name: perm.position_name || pos.name,
          level: perm.level || pos.level,
          parent_position_id: perm.parent_position_id,
          hierarchy_level: perm.hierarchy_level,
          permissions: perm.permissions || [],
          // ข้อมูลจาก join
          department_code: dept.code,
          department_name: dept.name,
          department_description: dept.description,
          position_level: pos.level,
          position_status: pos.status
        }
      }).filter(item => item !== null)

      console.log('✅ [DepartmentService] Joined', joinedData.length, 'position assignments')

      // Group by department
      const grouped = this.groupPositionsByDepartment(joinedData)
      console.log('✅ [DepartmentService] Grouped into', grouped.length, 'departments')
      console.log('📊 [DepartmentService] Departments:', grouped.map(d => ({ id: d._id, name: d.name, positions: d.positions?.length })))
      
      return grouped
    } catch (error) {
      console.error('❌ Get departments with positions error:', error)
      return []
    }
  }

  /**
   * จัดกลุ่มตำแหน่งตามแผนก และสร้าง tree structure
   */
  groupPositionsByDepartment(data) {
    const departmentMap = {}

    data.forEach(item => {
      const deptId = item.department_id
      
      if (!departmentMap[deptId]) {
        departmentMap[deptId] = {
          _id: deptId,
          code: item.department_code,
          name: item.department_name,
          description: item.department_description,
          positions: []
        }
      }

      departmentMap[deptId].positions.push({
        _id: item._id,
        db_id: item._id, // For reference
        position_id: item.position_id,
        position_code: item.position_code,
        position_name: item.position_name,
        level: item.level,
        parent_position_id: item.parent_position_id,
        hierarchy_level: item.hierarchy_level,
        permissions: item.permissions || []
      })
    })

    // Convert map to array and build tree for each department
    return Object.values(departmentMap).map(dept => ({
      ...dept,
      positions_tree: this.buildOrgChartTree(dept.positions)
    }))
  }

  /**
   * สร้าง tree structure จาก flat array
   * ใช้ parent_position_id ซึ่งเป็น MongoDB _id ของ parent
   */
  buildOrgChartTree(positions) {
    if (!positions || positions.length === 0) {
      return []
    }

    // สร้าง map สำหรับค้นหาตำแหน่งจาก MongoDB _id
    const positionMap = {}
    const tree = []

    // Step 1: สร้าง node ทั้งหมดและเก็บใน map (ใช้ _id เป็น key)
    positions.forEach(pos => {
      const nodeId = pos._id || pos.id
      positionMap[nodeId] = {
        id: `node_${nodeId}`, // ใช้สำหรับ Vue key
        db_id: nodeId, // MongoDB _id สำหรับ API calls
        position_id: pos.position_id,
        position_code: pos.position_code,
        position_name: pos.position_name,
        level: pos.level,
        parent_position_id: pos.parent_position_id, // เก็บไว้สำหรับ update
        permissions: pos.permissions || [],
        children: []
      }
    })

    console.log('📊 [buildOrgChartTree] Created', Object.keys(positionMap).length, 'nodes')

    // Step 2: สร้างความสัมพันธ์ parent-child (ใช้ parent_position_id ซึ่งเป็น _id)
    positions.forEach(pos => {
      const nodeId = pos._id || pos.id
      const node = positionMap[nodeId]
      
      if (pos.parent_position_id && positionMap[pos.parent_position_id]) {
        // มี parent และหา parent เจอ -> เพิ่มเป็น child
        positionMap[pos.parent_position_id].children.push(node)
        console.log('  ├─', pos.position_name, '→ child of', positionMap[pos.parent_position_id].position_name)
      } else {
        // ไม่มี parent หรือหาไม่เจอ -> เป็น root node
        tree.push(node)
        console.log('  🌳', pos.position_name, '→ root')
      }
    })

    console.log('✅ [buildOrgChartTree] Built tree with', tree.length, 'root nodes')

    return tree
  }
}

// Export singleton instance
export default new DepartmentService()
