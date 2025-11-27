/**
 * HR Service
 * จัดการข้อมูล Users, Employees ผ่าน Gateway API และ ERP Central
 * รองรับ multi-tenant architecture ด้วย parent organization filtering
 */

import CryptoJS from 'crypto-js'
import storageManager from '@/plugins/storage'

class HRService {
  constructor() {
    this.apiRequest = null
    this.initialized = false
    
    // API Configuration
    this.gatewayUrl = 'https://gateway.cloudrestfulapi.com/api/user/'
    this.erpCentralUrl = 'https://gateway.cloudrestfulapi.com/api/' // ERP Central (different key)
    
    // Client Keys - Fixed Gateway Key
    this.gatewayKey = 'DU1eYMDG7j8yb199YDPg4'  // ⭐ Fixed Gateway API Key
    this.clientKey = null   // สำหรับ ERP Central (เหมือน DepartmentService)
    
    // Parent Organization ID (filter users)
    this.parentOrgId = '6423f055e49d918b2ac085f1'
    
    // Cache
    this.cache = {
      users: [],
      employees: [],
      lastUpdated: null
    }
    
    // Auto-initialize from storageManager
    this.autoInitialize()
  }

  /**
   * Auto initialize from storageManager (like UserAdd.vue pattern)
   */
  autoInitialize() {
    try {
      const configs = storageManager.get('configs')
      
      // ⭐ gatewayKey is fixed, only get clientKey and parentOrgId
      if (configs) {
        this.clientKey = configs.key || configs.erpKey
        
        // ถ้ามี siteID ให้ใช้เป็น parent
        if (configs.siteID) {
          this.parentOrgId = configs.siteID
        }
      }
      
      // ดึง clientKey จาก ERP_CORE ถ้ามี (Single Source of Truth)
      if (window.ERP_CORE?.clientKey) {
        this.clientKey = window.ERP_CORE.clientKey
      }
      
      this.initialized = true
      
      console.log('🔑 [HRService] Auto-initialized from storageManager:', {
        hasGatewayKey: !!this.gatewayKey,
        hasClientKey: !!this.clientKey,
        gatewayKeyPreview: this.gatewayKey ? '***' + this.gatewayKey.slice(-4) : 'null',
        clientKeyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        parentOrgId: this.parentOrgId
      })
    } catch (error) {
      console.warn('⚠️ [HRService] Could not auto-initialize from storageManager:', error.message)
    }
  }

  /**
   * Initialize with Vue app instance
   * @param {Object} vueAppOrInstance - Vue app.config.globalProperties or component instance
   */
  initialize(vueAppOrInstance) {
    // ⭐ ดึง clientKey จาก ERP_CORE ก่อน (Single Source of Truth)
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    // Try to get $Request from various sources
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      
      // Backup: ถ้าไม่มี key จาก ERP_CORE จึงใช้ fallback
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.$Key || null
      }
      
      this.initialized = true
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.appContext.config.globalProperties.$Key || null
      }
      
      this.initialized = true
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      if (!this.clientKey) {
        this.clientKey = window.vueApp.$Key || null
      }
      
      this.initialized = true
    }
    
    // Always initialized since gatewayKey is fixed
    this.initialized = true
    
    // Debug
    console.log('🔑 [HRService] Initialized:', {
      hasGatewayKey: !!this.gatewayKey,
      hasClientKey: !!this.clientKey,
      gatewayKeyPreview: this.gatewayKey ? '***' + this.gatewayKey.slice(-4) : 'null',
      clientKeyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
      source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback',
      parentOrgId: this.parentOrgId,
      initialized: this.initialized
    })
  }
  
  /**
   * Get the source of the API key (for debugging)
   */
  getKeySource() {
    return 'Fixed Gateway Key (DU1eYMDG7j8yb199YDPg4)'
  }

  // ==================== Password Security ====================

  /**
   * Generate password hash with salt (SHA256)
   * @param {string} password - Plain text password
   * @returns {Object} - { hash, salt }
   */
  generatePasswordHash(password) {
    const salt = CryptoJS.lib.WordArray.random(16) // 16 bytes = 32 hex chars
    const hash = CryptoJS.SHA256(password + salt.toString()).toString()
    
    return {
      hash,
      salt: salt.toString()
    }
  }

  /**
   * Verify password against stored hash
   * @param {string} password - Plain text password to verify
   * @param {string} storedHash - Stored password hash
   * @param {string} salt - Stored salt
   * @returns {boolean} - True if password matches
   */
  verifyPassword(password, storedHash, salt) {
    const inputHash = CryptoJS.SHA256(password + salt).toString()
    return inputHash === storedHash
  }

  // ==================== User Management (Gateway API) ====================

  /**
   * Create new user via Gateway API
   * @param {Object} userData - User data (firstname, lastname, username, password, role, etc.)
   * @returns {Promise<Object>} - Created user data
   */
  async createUser(userData) {
    try {
      if (!this.gatewayKey) {
        throw new Error('Gateway API key not configured')
      }

      // Generate password hash
      const { hash, salt } = this.generatePasswordHash(userData.password)

      // Prepare user data for Gateway API
      const gatewayUserData = {
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        phone: userData.phone || '',
        email: userData.email || userData.username,
        username: userData.username,
        password: hash,
        salt: salt,
        role: userData.role || 'employee',
        parent: this.parentOrgId, // ⭐ สำคัญ: กำหนด parent organization
        unit: userData.unit || [],
        asset: userData.asset || []
      }

      console.log('📤 [HRService] Creating user via Gateway API:', {
        username: gatewayUserData.username,
        role: gatewayUserData.role,
        parent: gatewayUserData.parent
      })

      // Call Gateway API directly
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': this.gatewayKey
        },
        body: JSON.stringify({
          data: gatewayUserData,
          options: {
            uniqueFields: [['username']] // Ensure username is unique
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Gateway API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ [HRService] User created via Gateway:', result)

      // ⚠️ ไม่ต้อง save to ERP ที่นี่ เพราะ UI จะเรียก createERPUser() เอง
      // เพื่อให้ควบคุมการบันทึกได้ดีกว่า

      // Clear cache
      this.cache.users = []
      this.cache.lastUpdated = null

      return {
        success: true,
        data: result.data || result,
        message: 'สร้าง User เรียบร้อยแล้ว'
      }

    } catch (error) {
      console.error('❌ [HRService] Error creating user:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการสร้าง User: ' + error.message
      }
    }
  }

  /**
   * Save user to ERP Central (dual storage)
   * @param {Object} userData - User data from Gateway API
   * @returns {Promise<Object>} - Result from ERP Central
   */
  async saveUserToERP(userData) {
    try {
      if (!this.clientKey) {
        console.warn('⚠️ [HRService] Client key not configured, skipping ERP save')
        return { success: false, error: 'Client key not configured' }
      }

      // Transform to ERP format
      const erpUserData = {
        user_id: userData._id || userData.id,    // ⭐ Reference ไปหา Gateway user
        username: userData.username,
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        phone: userData.phone || '',
        role: userData.role,
        roles: [userData.role], // Convert single role to array
        parent: userData.parent,
        unit: userData.unit || [],
        asset: userData.asset || [],
        status: 'active',
        created_at: new Date().toISOString()
      }

      console.log('📤 [HRService] Saving user to ERP:', erpUserData.username)

      // ✅ ใช้ $Request.POST เหมือน DepartmentService
      if (this.apiRequest) {
        const response = await this.apiRequest.POST('users', {
          data: erpUserData
        }, this.clientKey)

        console.log('✅ [HRService] User saved to ERP via API:', response?.data)
        return { success: true, data: response?.data }
      }

      console.warn('⚠️ [HRService] No apiRequest available')
      return { success: false, error: 'No apiRequest available' }

    } catch (error) {
      console.error('❌ [HRService] Error saving to ERP:', error)
      // Don't throw, just return error (ไม่ให้ล้มเหลวทั้งหมด)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create ERP user record (for UI component use)
   * @param {Object} erpUserData - ERP user data
   * @returns {Promise<Object>} - Result
   */
  async createERPUser(erpUserData) {
    try {
      console.log('📤 [HRService] Creating ERP user record:', erpUserData)

      // ✅ ใช้ $Request.POST เหมือน DepartmentService
      if (this.apiRequest) {
        const userData = {
          user_id: erpUserData.user_id,       // ⭐ Reference ไปหา Gateway user
          username: erpUserData.username,
          email: erpUserData.email,
          firstname: erpUserData.firstname,
          lastname: erpUserData.lastname,
          phone: erpUserData.phone || '',
          role: erpUserData.role,
          status: erpUserData.status || 'active',
          created_at: erpUserData.created_at || new Date().toISOString(),
          created_by: erpUserData.created_by || 'system'
        }

        console.log('📤 [HRService] Calling API POST /users with:', userData)

        const response = await this.apiRequest.POST('users', {
          data: userData
        }, this.clientKey)

        console.log('✅ [HRService] ERP user created via API:', response?.data)

        return {
          success: true,
          data: response?.data || userData,
          message: 'สร้างข้อมูล User ใน ERP เรียบร้อย'
        }
      }

      // Fallback: ถ้าไม่มี apiRequest ให้บันทึกใน localStorage
      console.log('⚠️ [HRService] No apiRequest available, saving to localStorage')
      
      // Get existing users from localStorage
      let erpUsers = []
      try {
        const stored = storageManager.get('erp_users') || []
        erpUsers = Array.isArray(stored) ? stored : []
      } catch (e) {
        erpUsers = []
      }

      // Add new user
      const newUser = {
        ...erpUserData,
        _id: erpUserData.user_id,
        created_at: erpUserData.created_at || new Date().toISOString()
      }
      
      erpUsers.push(newUser)
      
      // Save back to localStorage
      storageManager.set('erp_users', erpUsers)
      
      console.log('✅ [HRService] ERP user saved to localStorage:', newUser)
      
      return {
        success: true,
        data: newUser,
        message: 'บันทึกข้อมูล User ใน ERP (localStorage) เรียบร้อย'
      }

    } catch (error) {
      console.error('❌ [HRService] Error creating ERP user:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการสร้างข้อมูล User ใน ERP'
      }
    }
  }

  /**
   * Get all departments from ERP Central (for user assignment)
   * @returns {Promise<Array>} - List of departments
   */
  async getDepartments() {
    try {
      if (!this.clientKey) {
        console.warn('⚠️ [HRService] clientKey not configured, returning empty departments')
        return {
          success: true,
          data: []
        }
      }

      if (!this.apiRequest?.POST) {
        throw new Error('$Request.POST not available')
      }

      console.log('📤 [HRService] Fetching departments from ERP Central...')

      const result = await this.apiRequest.POST('departments/aggregate', {
        pipeline: [
          {
            $match: {
              status: 'active' // เฉพาะ department ที่ active
            }
          },
          {
            $sort: { name: 1 }
          },
          {
            $project: {
              _id: 1,
              code: 1,
              name: 1,
              description: 1,
              status: 1
            }
          }
        ]
      }, this.clientKey)

      // $Request.POST ส่งกลับ Axios response object ที่มี .data
      const departments = result?.data || result
      
      if (Array.isArray(departments)) {
        console.log('✅ [HRService] Departments loaded:', departments.length)
        return {
          success: true,
          data: departments
        }
      } else {
        console.error('❌ [HRService] Unexpected response format:', typeof result, result)
        throw new Error('Invalid response from departments/aggregate')
      }

    } catch (error) {
      console.error('❌ [HRService] Error loading departments:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  /**
   * Get all users filtered by parent organization
   * @returns {Promise<Array>} - List of users
   */
  async getUsers() {
    try {
      if (!this.gatewayKey) {
        throw new Error('Gateway API key not configured')
      }

      // Check cache
      if (this.cache.users.length > 0 && this.cache.lastUpdated) {
        const cacheAge = Date.now() - this.cache.lastUpdated
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('📦 [HRService] Returning cached users')
          return {
            success: true,
            data: this.cache.users,
            cached: true
          }
        }
      }

      console.log('📤 [HRService] Fetching users from Gateway API...')

      // ✅ Use aggregate endpoint like DepartmentService
      const aggregateUrl = this.gatewayUrl.replace('/user/', '/user/aggregate')
      
      const response = await fetch(aggregateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': this.gatewayKey
        },
        body: JSON.stringify({
          pipeline: [
            {
              $match: {
                parent: this.parentOrgId // ⭐ Filter by parent organization
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 1000
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gateway API error: ${response.status}`)
      }

      const result = await response.json()
      const users = result.data || result.results || []

      console.log('✅ [HRService] Fetched users:', users.length)

      // Update cache
      this.cache.users = users
      this.cache.lastUpdated = Date.now()

      return {
        success: true,
        data: users
      }

    } catch (error) {
      console.error('❌ [HRService] Error fetching users:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  /**
   * Get ERP users WITH department_position_permission data
   * ✅ Lookup department_position_permission โดยตรงจาก position_id
   * @returns {Promise<Array>} - List of ERP users with enriched job_assignments
   */
  async getERPUsers() {
    try {
      if (!this.clientKey) {
        console.warn('⚠️ [HRService] Client key not configured')
        return {
          success: false,
          error: 'Client key not configured',
          data: []
        }
      }

      console.log('📤 [HRService] Fetching ERP users from database...')

      if (!this.apiRequest) {
        console.warn('⚠️ [HRService] No apiRequest available')
        return {
          success: false,
          error: 'No apiRequest available',
          data: []
        }
      }

      // ✅ Lookup department_position_permission โดยตรง
      const usersResponse = await this.apiRequest.POST('users/aggregate', {
        pipeline: [
          // 1. Match users
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          
          // 2. Unwind job_assignments
          {
            $unwind: {
              path: '$job_assignments',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 3. Lookup department_position_permission โดยใช้ position_id
          {
            $addFields: {
              dept_pos_perm_id: { $toObjectId: '$job_assignments.position_id' }
            }
          },
          {
            $lookup: {
              from: 'department_position_permission',
              localField: 'dept_pos_perm_id',
              foreignField: '_id',
              as: 'dept_pos_perm'
            }
          },
          {
            $unwind: {
              path: '$dept_pos_perm',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 4. Lookup department จาก department_position_permission.department_id
          {
            $addFields: {
              dept_objectid: { $toObjectId: '$dept_pos_perm.department_id' }
            }
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'dept_objectid',
              foreignField: '_id',
              as: 'dept_info'
            }
          },
          {
            $unwind: {
              path: '$dept_info',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 5. Lookup position จาก department_position_permission.position_id
          {
            $addFields: {
              pos_objectid: { $toObjectId: '$dept_pos_perm.position_id' }
            }
          },
          {
            $lookup: {
              from: 'positions',
              localField: 'pos_objectid',
              foreignField: '_id',
              as: 'pos_info'
            }
          },
          {
            $unwind: {
              path: '$pos_info',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 6. Merge ข้อมูลเข้าไปใน job_assignments
          {
            $addFields: {
              'job_assignments.department': '$dept_info',
              'job_assignments.position': '$pos_info',
              'job_assignments.permissions': '$dept_pos_perm.permissions',
              'job_assignments.position_code': '$dept_pos_perm.position_code',
              'job_assignments.position_name': '$dept_pos_perm.position_name',
              'job_assignments.level': '$dept_pos_perm.level',
              'job_assignments.hierarchy_level': '$dept_pos_perm.hierarchy_level'
            }
          },
          
          // 6. Group กลับมา
          {
            $group: {
              _id: '$_id',
              username: { $first: '$username' },
              email: { $first: '$email' },
              firstname: { $first: '$firstname' },
              lastname: { $first: '$lastname' },
              phone: { $first: '$phone' },
              role: { $first: '$role' },
              status: { $first: '$status' },
              created_at: { $first: '$created_at' },
              created_by: { $first: '$created_by' },
              createdAt: { $first: '$createdAt' },
              updatedAt: { $first: '$updatedAt' },
              departments: { $first: '$departments' },
              job_assignments: { $push: '$job_assignments' }
            }
          },
          
          // 7. Sort
          {
            $sort: { created_at: -1 }
          }
        ]
      }, this.clientKey)

      const users = usersResponse?.data || []
      console.log('✅ [HRService] Fetched', users.length, 'ERP users')

      return {
        success: true,
        data: users
      }

    } catch (error) {
      console.error('❌ [HRService] Error fetching ERP users:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserById(userId) {
    try {
      if (!this.gatewayKey) {
        throw new Error('Gateway API key not configured')
      }

      const response = await fetch(this.gatewayUrl + userId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': this.gatewayKey
        }
      })

      if (!response.ok) {
        throw new Error(`Gateway API error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result.data || result
      }

    } catch (error) {
      console.error('❌ [HRService] Error fetching user:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Get ERP user by system user_id (ค้นหา ERP user ที่มี user_id ตรงกับ user ของระบบ)
   * @param {string} systemUserId - User ID จากระบบหลัก (จาก session.user._id)
   * @returns {Promise<Object>} - ERP user data with enriched job_assignments
   */
  async getERPUserBySystemUserId(systemUserId) {
    try {
      if (!this.clientKey) {
        console.warn('⚠️ [HRService] Client key not configured for getERPUserBySystemUserId')
        return {
          success: false,
          error: 'Client key not configured',
          data: null
        }
      }

      if (!this.apiRequest) {
        console.warn('⚠️ [HRService] No apiRequest available for getERPUserBySystemUserId')
        return {
          success: false,
          error: 'No apiRequest available',
          data: null
        }
      }

      console.log('📤 [HRService] Finding ERP user by system user_id:', systemUserId)

      // ขั้นตอนที่ 1: ค้นหา ERP user ที่มี user_id ตรงกับ systemUserId
      const findResponse = await this.apiRequest.POST('users/aggregate', {
        pipeline: [
          // Match user ที่มี user_id ตรงกับ systemUserId
          { $match: { user_id: systemUserId } },
          // เอาแค่ _id
          { $project: { _id: 1 } },
          { $limit: 1 }
        ]
      }, this.clientKey)

      const users = findResponse?.data || []
      const foundUser = users[0]

      if (!foundUser || !foundUser._id) {
        console.log('⚠️ [HRService] No ERP user found with user_id:', systemUserId)
        return {
          success: false,
          error: 'ERP user not found',
          data: null
        }
      }

      const erpUserId = foundUser._id
      console.log('✅ [HRService] Found ERP user _id:', erpUserId)

      // ขั้นตอนที่ 2: ดึงข้อมูล ERP user เต็มด้วย _id
      const fullUserData = await this.getERPUserById(erpUserId)

      return fullUserData

    } catch (error) {
      console.error('❌ [HRService] Error finding ERP user by system user_id:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Get ERP user by ID WITH department_position_permission data
   * ✅ Lookup department_position_permission โดยตรงจาก position_id
   * @param {string} userId - ERP user's _id
   * @returns {Promise<Object>} - ERP user data with enriched job_assignments
   */
  async getERPUserById(userId) {
    try {
      if (!this.clientKey) {
        console.warn('⚠️ [HRService] Client key not configured for getERPUserById')
        return {
          success: false,
          error: 'Client key not configured',
          data: null
        }
      }

      if (!this.apiRequest) {
        console.warn('⚠️ [HRService] No apiRequest available for getERPUserById')
        return {
          success: false,
          error: 'No apiRequest available',
          data: null
        }
      }

      console.log('📤 [HRService] Fetching ERP user by id:', userId)

      // ✅ Lookup department_position_permission โดยตรง
      const userResponse = await this.apiRequest.POST('users/aggregate', {
        pipeline: [
          // 1. Match user
          { $match: { _id: userId } },
          
          // 2. Unwind job_assignments
          {
            $unwind: {
              path: '$job_assignments',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 3. Lookup department_position_permission โดยใช้ position_id
          {
            $addFields: {
              dept_pos_perm_id: { $toObjectId: '$job_assignments.position_id' }
            }
          },
          {
            $lookup: {
              from: 'department_position_permission',
              localField: 'dept_pos_perm_id',
              foreignField: '_id',
              as: 'dept_pos_perm'
            }
          },
          {
            $unwind: {
              path: '$dept_pos_perm',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 4. Lookup department จาก department_position_permission.department_id
          {
            $addFields: {
              dept_objectid: { $toObjectId: '$dept_pos_perm.department_id' }
            }
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'dept_objectid',
              foreignField: '_id',
              as: 'dept_info'
            }
          },
          {
            $unwind: {
              path: '$dept_info',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 5. Lookup position จาก department_position_permission.position_id
          {
            $addFields: {
              pos_objectid: { $toObjectId: '$dept_pos_perm.position_id' }
            }
          },
          {
            $lookup: {
              from: 'positions',
              localField: 'pos_objectid',
              foreignField: '_id',
              as: 'pos_info'
            }
          },
          {
            $unwind: {
              path: '$pos_info',
              preserveNullAndEmptyArrays: true
            }
          },
          
          // 6. Merge ข้อมูลเข้าไปใน job_assignments
          {
            $addFields: {
              'job_assignments.department': '$dept_info',
              'job_assignments.position': '$pos_info',
              'job_assignments.permissions': '$dept_pos_perm.permissions',
              'job_assignments.position_code': '$dept_pos_perm.position_code',
              'job_assignments.position_name': '$dept_pos_perm.position_name',
              'job_assignments.level': '$dept_pos_perm.level',
              'job_assignments.hierarchy_level': '$dept_pos_perm.hierarchy_level'
            }
          },
          
          // 6. Group กลับมา
          {
            $group: {
              _id: '$_id',
              username: { $first: '$username' },
              email: { $first: '$email' },
              firstname: { $first: '$firstname' },
              lastname: { $first: '$lastname' },
              phone: { $first: '$phone' },
              role: { $first: '$role' },
              status: { $first: '$status' },
              created_at: { $first: '$created_at' },
              created_by: { $first: '$created_by' },
              createdAt: { $first: '$createdAt' },
              updatedAt: { $first: '$updatedAt' },
              departments: { $first: '$departments' },
              job_assignments: { $push: '$job_assignments' }
            }
          },
          
          { $limit: 1 }
        ]
      }, this.clientKey)

      const users = userResponse?.data || []
      const user = users[0] || null

      if (!user) {
        return {
          success: false,
          error: 'ERP user not found',
          data: null
        }
      }

      console.log('✅ [HRService] ERP user loaded with', user.job_assignments?.length || 0, 'jobs')

      return {
        success: true,
        data: user
      }

    } catch (error) {
      console.error('❌ [HRService] Error fetching ERP user by id:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user data
   */
  /**
   * Update user in ERP Central database (not Gateway)
   * @param {string} userId - ERP user's _id
   * @param {Object} updateData - Data to update (firstname, lastname, phone, role, departments, etc.)
   * @returns {Promise<Object>} - Result
   */
  async updateUser(userId, updateData) {
    try {
      if (!this.clientKey) {
        throw new Error('Client key not configured for ERP update')
      }

      if (!this.apiRequest) {
        throw new Error('No apiRequest available')
      }

      console.log('📤 [HRService] Updating ERP user:', userId, updateData)

      // Update user in ERP users collection
      const response = await this.apiRequest.PUT(`users/${userId}`, {
        data: updateData
      }, this.clientKey)

      console.log('✅ [HRService] ERP user updated:', response)

      return {
        success: true,
        data: response?.data || response,
        message: 'อัปเดต User เรียบร้อยแล้ว'
      }

    } catch (error) {
      console.error('❌ [HRService] Error updating ERP user:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการอัปเดต User: ' + error.message
      }
    }
  }

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Result
   */
  async deleteUser(userId) {
    try {
      if (!this.gatewayKey) {
        throw new Error('Gateway API key not configured')
      }

      console.log('📤 [HRService] Deleting user:', userId)

      const response = await fetch(this.gatewayUrl + userId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': this.gatewayKey
        }
      })

      if (!response.ok) {
        throw new Error(`Gateway API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ [HRService] User deleted:', result)

      // Clear cache
      this.cache.users = []
      this.cache.lastUpdated = null

      return {
        success: true,
        message: 'ลบ User เรียบร้อยแล้ว'
      }

    } catch (error) {
      console.error('❌ [HRService] Error deleting user:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการลบ User: ' + error.message
      }
    }
  }

  // ==================== Authentication ====================

  /**
   * Authenticate user (verify username/password)
   * @param {string} username - Username or email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} - Authentication result with user data
   */
  async authenticate(username, password) {
    try {
      if (!this.gatewayKey) {
        throw new Error('Gateway API key not configured')
      }

      console.log('🔐 [HRService] Authenticating user:', username)

      // Fetch user by username
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': this.gatewayKey
        },
        body: JSON.stringify({
          query: {
            username: username,
            parent: this.parentOrgId
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gateway API error: ${response.status}`)
      }

      const result = await response.json()
      const users = result.data || result.results || []

      if (users.length === 0) {
        return {
          success: false,
          error: 'ไม่พบ User ในระบบ',
          authenticated: false
        }
      }

      const user = users[0]

      // Verify password
      const isPasswordValid = this.verifyPassword(password, user.password, user.salt)

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'รหัสผ่านไม่ถูกต้อง',
          authenticated: false
        }
      }

      console.log('✅ [HRService] Authentication successful:', user.username)

      return {
        success: true,
        authenticated: true,
        data: {
          id: user._id || user.id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          parent: user.parent,
          unit: user.unit,
          asset: user.asset
        },
        message: 'เข้าสู่ระบบสำเร็จ'
      }

    } catch (error) {
      console.error('❌ [HRService] Authentication error:', error)
      return {
        success: false,
        error: error.message,
        authenticated: false,
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      }
    }
  }

  // ==================== Utilities ====================

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.users = []
    this.cache.employees = []
    this.cache.lastUpdated = null
    console.log('🗑️ [HRService] Cache cleared')
  }

  /**
   * Set parent organization ID
   * @param {string} parentId - Parent organization ID
   */
  setParentOrganization(parentId) {
    this.parentOrgId = parentId
    this.clearCache()
    console.log('🏢 [HRService] Parent organization changed to:', parentId)
  }
}

// Export singleton instance
export const hrService = new HRService()

// Export class for testing
export default HRService
