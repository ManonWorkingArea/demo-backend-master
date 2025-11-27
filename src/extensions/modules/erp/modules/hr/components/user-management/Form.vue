<template>
  <div class="user-form-container">
    <!-- Loading State (Edit mode only) -->
    <div v-if="isEditMode && !isLoaded" class="form-card">
      <div class="alert alert-info">
        <i class="fas fa-spinner fa-spin"></i>
        กำลังโหลดข้อมูลผู้ใช้...
      </div>
    </div>

    <!-- Error State (Edit mode - load failed) -->
    <div v-else-if="isEditMode && isLoaded && loadError" class="form-card">
      <div class="alert alert-error">
        <i class="fas fa-exclamation-circle"></i>
        {{ loadError }}
      </div>
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          ย้อนกลับ
        </button>
      </div>
    </div>

    <!-- Form (ready to use) -->
    <div v-else class="form-card">
      <form @submit.prevent="handleSubmit">
        <!-- Personal Information -->
        <div class="form-section">
          <h3><i class="fas fa-user"></i> ข้อมูลส่วนตัว</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>ชื่อ <span class="required">*</span></label>
              <input 
                v-model="formData.firstname" 
                type="text" 
                required
                placeholder="ระบุชื่อ"
                :disabled="loading"
              />
              <span v-if="errors.firstname" class="error-text">{{ errors.firstname }}</span>
            </div>

            <div class="form-group">
              <label>นามสกุล <span class="required">*</span></label>
              <input 
                v-model="formData.lastname" 
                type="text" 
                required
                placeholder="ระบุนามสกุล"
                :disabled="loading"
              />
              <span v-if="errors.lastname" class="error-text">{{ errors.lastname }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>อีเมล <span class="required">*</span></label>
              <input 
                v-model="formData.email" 
                type="email" 
                required
                placeholder="example@company.com"
                :disabled="loading || isEditMode"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input 
                v-model="formData.phone" 
                type="tel" 
                placeholder="081-234-5678"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="form-section">
          <h3><i class="fas fa-key"></i> ข้อมูลบัญชี</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Username <span class="required">*</span></label>
              <input 
                v-model="formData.username" 
                type="text" 
                required
                placeholder="username หรือ email"
                :disabled="loading || isEditMode"
                @blur="syncUsernameWithEmail"
              />
              <small class="hint" v-if="!isEditMode">จะใช้ email เป็น username โดยอัตโนมัติ</small>
              <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
            </div>

            <div class="form-group">
              <label>Role</label>
              <div class="role-display">
                <span class="badge badge-admin">
                  <i class="fas fa-shield-alt"></i>
                  Admin
                </span>
                <small class="hint">Role ถูกกำหนดเป็น Admin สำหรับระบบนี้</small>
              </div>
            </div>
          </div>

          <div class="form-row" v-if="!isEditMode">
            <div class="form-group">
              <label>รหัสผ่าน <span class="required">*</span></label>
              <div class="password-input">
                <input 
                  v-model="formData.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  minlength="6"
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  :disabled="loading"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
                <button 
                  type="button" 
                  class="btn-gen-password"
                  @click="generatePassword"
                  :disabled="loading"
                >
                  <i class="fas fa-magic"></i>
                  สร้างรหัสผ่าน
                </button>
              </div>
              <div v-if="formData.password" class="password-strength">
                <div class="strength-bar" :class="passwordStrength.class">
                  <div class="strength-fill" :style="{width: passwordStrength.percent + '%'}"></div>
                </div>
                <small :class="'strength-text ' + passwordStrength.class">
                  {{ passwordStrength.text }}
                </small>
              </div>
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>

            <div class="form-group">
              <label>ยืนยันรหัสผ่าน <span class="required">*</span></label>
              <input 
                v-model="formData.confirmPassword" 
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                :disabled="loading"
              />
              <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
            </div>
          </div>
        </div>

        <!-- Multi-tenant Information -->
        <div class="form-section" v-if="!isEditMode">
          <h3><i class="fas fa-building"></i> สังกัดองค์กร</h3>
          
          <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>Parent Organization:</strong> 6423f055e49d918b2ac085f1
              <br>
              <small>User จะถูกสร้างภายใต้องค์กรนี้โดยอัตโนมัติ</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Unit (หน่วยงาน)</label>
              <input 
                v-model="unitInput" 
                type="text" 
                readonly
                class="readonly-input"
              />
              <small class="hint">หากมีหลาย Unit ให้คั่นด้วยเครื่องหมาย , (กำเนิดตัวเครื่องหมายระบบ)</small>
            </div>

            <div class="form-group">
              <label>Asset (สินทรัพย์)</label>
              <input 
                v-model="assetInput" 
                type="text" 
                readonly
                class="readonly-input"
              />
              <small class="hint">หากมีหลาย Asset ให้คั่นด้วยเครื่องหมาย , (กำเนิดตัวเครื่องหมายระบบ)</small>
            </div>
          </div>
        </div>

        <!-- Department Assignment -->
        <div class="form-section">
          <h3><i class="fas fa-sitemap"></i> แผนกที่สังกัด</h3>
          
          <div v-if="departments.length === 0" class="info-box">
            <i class="fas fa-info-circle"></i>
            <div>
              <small>ไม่มีข้อมูลแผนก กรุณาสร้างแผนกในระบบก่อน</small>
            </div>
          </div>

          <div v-else class="department-selection">
            <div class="department-list">
              <div 
                v-for="dept in departments" 
                :key="dept._id" 
                class="department-item"
                :class="{ 'is-selected': isDepartmentSelected(dept._id) }"
              >
                <div class="department-header">
                  <label class="department-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="isDepartmentSelected(dept._id)"
                      @change="toggleDepartment(dept._id)"
                      :disabled="loading"
                    />
                    <div class="department-info">
                      <span class="department-name">{{ dept.name }}</span>
                      <span v-if="dept.code" class="department-code">{{ dept.code }}</span>
                    </div>
                  </label>
                </div>

                <!-- Position Selection (Only if department is selected) -->
                <div v-if="isDepartmentSelected(dept._id)" class="position-selection">
                  <div v-if="isLoadingPositions(dept._id)" class="loading-positions">
                    <i class="fas fa-spinner fa-spin"></i> กำลังโหลดตำแหน่ง...
                  </div>
                  <div v-else class="form-group">
                    <label>ตำแหน่งในแผนกนี้ <span class="required">*</span></label>
                    
                    <div class="position-tree-container">
                      <position-tree
                        :nodes="getDepartmentPositions(dept._id)"
                        :value="getAssignment(dept._id).position_id"
                        :name="'position-group-' + dept._id"
                        @input="updateAssignment(dept._id, $event)"
                      />
                    </div>
                    
                    <div v-if="!getDepartmentPositions(dept._id) || (Array.isArray(getDepartmentPositions(dept._id)) && getDepartmentPositions(dept._id).length === 0)" class="no-positions">
                      <small class="text-gray-500">ไม่พบข้อมูลตำแหน่งในแผนกนี้</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <small class="hint">
              <i class="fas fa-check-square"></i>
              เลือกแผนกและระบุตำแหน่งในแต่ละแผนก
            </small>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="handleCancel" class="btn-secondary" :disabled="loading">
            <i class="fas fa-times"></i>
            ยกเลิก
          </button>
          <button type="submit" class="btn-primary" :disabled="loading || !isFormValid">
            <i class="fas fa-spinner fa-spin" v-if="loading"></i>
            <i class="fas fa-save" v-else></i>
            {{ loading ? 'กำลังบันทึก...' : (isEditMode ? 'อัปเดต User' : 'บันทึก User') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>

    <!-- Credentials Modal -->
    <teleport to="body">
      <div v-if="showCredentialsModal" class="modal-overlay" @click="closeCredentialsModal">
        <div class="credentials-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>สร้าง User สำเร็จ!</h2>
            <p class="modal-subtitle">กรุณาบันทึกข้อมูลเหล่านี้ก่อนปิดหน้าต่าง</p>
          </div>
          
          <div class="modal-body">
            <div class="credential-item">
              <label>
                <i class="fas fa-user"></i>
                Username
              </label>
              <div class="credential-value">
                <input 
                  type="text" 
                  :value="createdCredentials.username" 
                  readonly 
                  ref="usernameInput"
                />
                <button 
                  type="button" 
                  class="btn-copy" 
                  @click="copyToClipboard(createdCredentials.username, 'username')"
                  :class="{ 'copied': copiedField === 'username' }"
                >
                  <i :class="copiedField === 'username' ? 'fas fa-check' : 'fas fa-copy'"></i>
                  {{ copiedField === 'username' ? 'คัดลอกแล้ว' : 'คัดลอก' }}
                </button>
              </div>
            </div>

            <div class="credential-item">
              <label>
                <i class="fas fa-key"></i>
                Password
              </label>
              <div class="credential-value">
                <input 
                  type="text" 
                  :value="createdCredentials.password" 
                  readonly 
                  ref="passwordInput"
                />
                <button 
                  type="button" 
                  class="btn-copy" 
                  @click="copyToClipboard(createdCredentials.password, 'password')"
                  :class="{ 'copied': copiedField === 'password' }"
                >
                  <i :class="copiedField === 'password' ? 'fas fa-check' : 'fas fa-copy'"></i>
                  {{ copiedField === 'password' ? 'คัดลอกแล้ว' : 'คัดลอก' }}
                </button>
              </div>
            </div>

            <div class="warning-box">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <strong>คำเตือน:</strong> กรุณาบันทึกข้อมูลเหล่านี้ไว้ในที่ปลอดภัย<br>
                คุณจะไม่สามารถดูรหัสผ่านนี้ได้อีกครั้งหลังจากปิดหน้าต่างนี้
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-modal-close" @click="closeCredentialsModal">
              <i class="fas fa-times"></i>
              ปิดและกลับไปหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import PositionTree from './PositionTree.vue'

export default {
  name: 'UserForm',
  
  components: {
    PositionTree
  },
  
  props: {
    userId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      formData: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
      },
      unitInput: '69078e8039cbc5602b23f976',
      assetInput: '69078e4939cbc5602b23f975',
      
      departments: [],
      // New structure for assignments
      jobAssignments: [], // Array of { department_id, position_id }
      departmentPositionsCache: {}, // Cache for positions in each department
      
      showPassword: false,
      loading: false,
      isLoaded: false,
      loadError: '',
      isDestroyed: false,
      errors: {},
      successMessage: '',
      errorMessage: '',
      
      // Credentials Modal
      showCredentialsModal: false,
      createdCredentials: {
        username: '',
        password: ''
      },
      copiedField: ''
    }
  },

  computed: {
    isEditMode() {
      return !!this.userId
    },

    isFormValid() {
      // Debug logging
      console.log('🔍 [Form Validation]', {
        isEditMode: this.isEditMode,
        firstname: !!this.formData.firstname,
        lastname: !!this.formData.lastname,
        email: !!this.formData.email,
        username: !!this.formData.username,
        role: this.formData.role,
        validateAssignments: this.validateAssignments(),
        jobAssignments: this.jobAssignments,
        loading: this.loading
      })

      const commonValid = 
        this.formData.firstname &&
        this.formData.lastname &&
        this.formData.email &&
        this.formData.username &&
        this.formData.role && // Just check if role exists (not hardcoded to 'admin')
        this.validateAssignments() // Validate assignments

      if (this.isEditMode) {
        console.log('✅ Edit Mode - commonValid:', commonValid)
        return commonValid
      } else {
        const createValid = (
          commonValid &&
          this.formData.password &&
          this.formData.confirmPassword &&
          this.formData.password === this.formData.confirmPassword &&
          this.formData.password.length >= 6
        )
        console.log('✅ Create Mode - createValid:', createValid)
        return createValid
      }
    },

    passwordStrength() {
      const password = this.formData.password
      if (!password) return { percent: 0, text: '', class: '' }

      let strength = 0
      let text = 'อ่อนแอมาก'
      let colorClass = 'weak'

      if (password.length >= 6) strength += 20
      if (password.length >= 8) strength += 20
      if (password.length >= 12) strength += 10

      if (/[a-z]/.test(password)) strength += 10
      if (/[A-Z]/.test(password)) strength += 15
      if (/[0-9]/.test(password)) strength += 15
      if (/[^a-zA-Z0-9]/.test(password)) strength += 10

      if (strength < 30) {
        text = 'อ่อนแอมาก'
        colorClass = 'weak'
      } else if (strength < 50) {
        text = 'อ่อนแอ'
        colorClass = 'fair'
      } else if (strength < 70) {
        text = 'ปานกลาง'
        colorClass = 'good'
      } else if (strength < 90) {
        text = 'แข็งแรง'
        colorClass = 'strong'
      } else {
        text = 'แข็งแรงมาก'
        colorClass = 'very-strong'
      }

      return {
        percent: Math.min(strength, 100),
        text,
        class: colorClass
      }
    }
  },

  watch: {
    'formData.email'(newEmail) {
      if (newEmail && !this.formData.username && !this.isEditMode) {
        this.formData.username = newEmail
      }
    }
  },

  async mounted() {
    console.log('🎯 [UserForm] Component mounted', { isEditMode: this.isEditMode, userId: this.userId })
    
    // Initialize HR service
    if (window.ERP_CORE?.hr) {
      window.ERP_CORE.hr.initialize(this)
    }
    
    // Initialize Department service (IMPORTANT!)
    if (window.ERP_CORE?.departments) {
      window.ERP_CORE.departments.initialize(this)
      console.log('✅ [UserForm] Department service initialized')
    } else {
      console.error('❌ [UserForm] ERP_CORE.departments not available!')
    }

    // Load departments for selection
    await this.loadDepartments()

    if (this.isEditMode) {
      await this.loadUserData()
      if (!this.isDestroyed) {
        this.isLoaded = true
      }
    } else {
      // Create mode - ready immediately
      this.isLoaded = true
    }
  },

  beforeUnmount() {
    this.isDestroyed = true
  },

  methods: {
    async loadDepartments() {
      try {
        console.log('📤 [UserForm] Loading departments with positions from department_position_permission...')
        const result = await window.ERP_CORE.departments.getDepartmentsWithPositions()
        
        if (this.isDestroyed) return
        
        console.log('📥 [UserForm] Result from getDepartmentsWithPositions:', result)
        console.log('📥 [UserForm] Result type:', typeof result, 'isArray:', Array.isArray(result))
        
        if (result && Array.isArray(result)) {
          this.departments = result
          console.log('✅ [UserForm] Departments with positions loaded:', this.departments.length)
          console.log('📊 [UserForm] Department details:', this.departments.map(d => ({ 
            id: d._id, 
            name: d.name, 
            code: d.code,
            has_positions_tree: !!d.positions_tree,
            positions_count: d.positions_tree?.length 
          })))
          
          // Pre-populate positions cache
          this.departments.forEach(dept => {
            if (dept.positions_tree) {
              this.departmentPositionsCache[dept._id] = dept.positions_tree
              console.log('📋 [UserForm] Cached positions for', dept.name, ':', dept.positions_tree.length)
            } else {
              console.warn('⚠️ [UserForm] No positions_tree for', dept.name)
            }
          })
        } else {
          console.warn('⚠️ [UserForm] No departments available or invalid result')
          this.departments = []
        }
      } catch (error) {
        if (this.isDestroyed) return
        console.error('❌ [UserForm] Load departments error:', error)
        this.departments = []
      }
    },

    async loadUserData() {
      if (!this.userId) return

      this.loading = true
      try {
        console.log('📤 [UserForm] Loading ERP user data:', this.userId)
        
        // ดึงจาก ERP users collection แทน Gateway
        const result = await window.ERP_CORE.hr.getERPUserById(this.userId)
        
        if (this.isDestroyed) return
        
        if (result.success && result.data) {
          const user = result.data
          this.formData = {
            firstname: user.firstname || user.first_name || '',
            lastname: user.lastname || user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            username: user.username || '',
            password: '',
            confirmPassword: '',
            role: user.role || 'admin'
          }
          
          // Load selected departments and assignments
          console.log('📋 [UserForm] Raw user.job_assignments:', user.job_assignments)
          
          if (user.job_assignments && Array.isArray(user.job_assignments)) {
            this.jobAssignments = user.job_assignments
              .filter(ja => ja && (ja.department_id || ja.department?._id)) // Filter out invalid entries
              .map(ja => {
                const deptId = ja.department_id || ja.department?._id || null
                const posId = ja.position_id || ja.position?._id || null
                
                console.log('  📌 Mapping assignment:', { 
                  original: ja, 
                  mapped: { department_id: deptId, position_id: posId }
                })
                
                return {
                  department_id: deptId,
                  position_id: posId
                }
              })
            
            console.log('📋 [UserForm] Mapped jobAssignments:', this.jobAssignments)
            
            // Load positions for each assigned department
            this.jobAssignments.forEach(ja => {
              if (ja.department_id) {
                this.loadDepartmentPositions(ja.department_id)
              }
            })
          } else if (user.departments && Array.isArray(user.departments)) {
            // Fallback for legacy data (only departments)
            this.jobAssignments = user.departments.map(d => ({
              department_id: d._id || d,
              position_id: '' // No position yet
            }))
            
            this.jobAssignments.forEach(ja => {
              if (ja.department_id) {
                this.loadDepartmentPositions(ja.department_id)
              }
            })
          } else {
            this.jobAssignments = []
          }
          
          console.log('✅ [UserForm] User data loaded', { 
            assignments: this.jobAssignments,
            count: this.jobAssignments.length 
          })
        } else {
          this.loadError = result.error || 'ไม่พบข้อมูล User'
          this.errorMessage = this.loadError
        }
      } catch (error) {
        if (this.isDestroyed) return
        console.error('❌ [UserForm] Load user error:', error)
        this.loadError = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        this.errorMessage = this.loadError
      } finally {
        if (!this.isDestroyed) {
          this.loading = false
        }
      }
    },

    // Assignment Methods
    isDepartmentSelected(deptId) {
      return this.jobAssignments.some(ja => ja.department_id === deptId)
    },

    getAssignment(deptId) {
      return this.jobAssignments.find(ja => ja.department_id === deptId)
    },

    toggleDepartment(deptId) {
      const index = this.jobAssignments.findIndex(ja => ja.department_id === deptId)
      if (index === -1) {
        // Add
        this.jobAssignments.push({
          department_id: deptId,
          position_id: ''
        })
        this.loadDepartmentPositions(deptId)
      } else {
        // Remove
        this.jobAssignments.splice(index, 1)
      }
    },

    updateAssignment(deptId, positionId) {
      const assignment = this.getAssignment(deptId)
      if (assignment) {
        assignment.position_id = positionId
      }
    },

    isLoadingPositions(deptId) {
      return this.departmentPositionsCache[deptId] === 'loading'
    },

    getDepartmentPositions(deptId) {
      const positions = this.departmentPositionsCache[deptId]
      // Return as is, PositionTree handles Array or Object. 
      // If it's 'loading', we handle that in template.
      if (positions === 'loading') return []
      return positions
    },

    async loadDepartmentPositions(deptId) {
      if (this.departmentPositionsCache[deptId]) return // Already loaded or loading

      this.departmentPositionsCache[deptId] = 'loading'
      
      try {
        // Find department from loaded departments
        const dept = this.departments.find(d => d._id === deptId)
        if (dept && dept.positions_tree) {
          // Use pre-loaded positions tree from getDepartmentsWithPositions
          this.departmentPositionsCache[deptId] = dept.positions_tree
        } else {
          console.warn(`No positions_tree found for dept ${deptId}`)
          this.departmentPositionsCache[deptId] = []
        }
        
        // Force update if needed
        this.departmentPositionsCache = { ...this.departmentPositionsCache }
      } catch (error) {
        console.error(`Failed to load positions for dept ${deptId}`, error)
        this.departmentPositionsCache[deptId] = []
      }
    },

    flattenPositions(nodes) {
      let positions = []
      if (!nodes || !Array.isArray(nodes)) return positions

      for (const node of nodes) {
        // We use the node's db_id (permission ID) as the value, 
        // because that's what links to the specific node in the tree with permissions.
        positions.push({
          id: node.db_id, 
          name: node.position_name,
          code: node.position_code
        })
        
        if (node.children && node.children.length > 0) {
          positions = positions.concat(this.flattenPositions(node.children))
        }
      }
      return positions
    },

    validateAssignments() {
      console.log('🔍 [validateAssignments]', {
        isEditMode: this.isEditMode,
        jobAssignments: this.jobAssignments,
        length: this.jobAssignments.length
      })

      // ✅ In edit mode, ALWAYS return true (skip validation)
      // Because existing users already have valid data, and we don't force changes
      if (this.isEditMode) {
        console.log('  ✓ Edit mode: SKIP validation (always true)')
        return true
      }
      
      // In create mode, check if any selected department has no position selected
      if (this.jobAssignments.length > 0) {
        const allValid = this.jobAssignments.every(ja => {
          const valid = ja.department_id && ja.position_id
          console.log('  - Assignment:', { dept: ja.department_id, pos: ja.position_id, valid })
          return valid
        })
        console.log('  ✓ Create mode validation:', allValid)
        return allValid
      }
      console.log('  ✓ No assignments (optional): true')
      return true // No assignments is valid (optional)
    },

    validateForm() {
      this.errors = {}

      if (!this.formData.firstname) {
        this.errors.firstname = 'กรุณาระบุชื่อ'
      }

      if (!this.validateAssignments()) {
        this.errorMessage = 'กรุณาระบุตำแหน่งให้ครบทุกแผนกที่เลือก'
        return false
      }

      if (!this.formData.lastname) {
        this.errors.lastname = 'กรุณาระบุนามสกุล'
      }

      if (!this.formData.email) {
        this.errors.email = 'กรุณาระบุอีเมล'
      } else if (!/\S+@\S+\.\S+/.test(this.formData.email)) {
        this.errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
      }

      if (!this.formData.username) {
        this.errors.username = 'กรุณาระบุ Username'
      }

      // Password validation only for create mode
      if (!this.isEditMode) {
        if (!this.formData.password) {
          this.errors.password = 'กรุณาระบุรหัสผ่าน'
        } else if (this.formData.password.length < 6) {
          this.errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        }

        if (!this.formData.confirmPassword) {
          this.errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
        } else if (this.formData.password !== this.formData.confirmPassword) {
          this.errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
        }
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      this.successMessage = ''
      this.errorMessage = ''

      if (!this.validateForm()) {
        if (!this.errorMessage) this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน'
        return
      }

      if (this.isEditMode) {
        await this.updateUser()
      } else {
        await this.createUser()
      }
    },

    async createUser() {
      this.loading = true

      try {
        const userData = {
          firstname: this.formData.firstname,
          lastname: this.formData.lastname,
          email: this.formData.email,
          phone: this.formData.phone,
          username: this.formData.username,
          password: this.formData.password,
          role: this.formData.role
        }

        if (this.unitInput) {
          userData.unit = this.unitInput.split(',').map(u => u.trim()).filter(u => u)
        }

        if (this.assetInput) {
          userData.asset = this.assetInput.split(',').map(a => a.trim()).filter(a => a)
        }

        console.log('📤 [UserForm] Creating user:', userData)

        // Step 1: สร้างที่ Gateway
        const result = await window.ERP_CORE.hr.createUser(userData)

        if (result.success) {
          console.log('✅ [UserForm] User created at Gateway:', result.data)
          
          // Step 2: สร้างที่ ERP
          try {
            const erpUserData = {
              user_id: result.data._id || result.data.id,
              username: userData.username,
              email: userData.email,
              firstname: userData.firstname,
              lastname: userData.lastname,
              phone: userData.phone || '',
              role: userData.role,
              // Send both for compatibility
              departments: this.jobAssignments.map(ja => ja.department_id),
              job_assignments: this.jobAssignments,
              status: 'active',
              created_at: new Date().toISOString(),
              created_by: 'system'
            }

            const erpResult = await window.ERP_CORE.hr.createERPUser(erpUserData)
            
            if (erpResult.success) {
              console.log('✅ [UserForm] ERP user created:', erpResult.data)
              this.successMessage = 'สร้าง User เรียบร้อยแล้ว'
            } else {
              console.warn('⚠️ [UserForm] ERP creation warning:', erpResult.error)
              this.successMessage = 'สร้าง User ที่ระบบกลางสำเร็จ'
            }
          } catch (erpError) {
            console.error('❌ [UserForm] ERP creation error:', erpError)
          }

          // Show credentials modal instead of navigating immediately
          this.createdCredentials = {
            username: userData.username,
            password: userData.password
          }
          this.showCredentialsModal = true
          
          this.resetForm()
        } else {
          this.errorMessage = result.error || 'เกิดข้อผิดพลาดในการสร้าง User'
        }
      } catch (error) {
        console.error('❌ [UserForm] Create error:', error)
        this.errorMessage = 'เกิดข้อผิดพลาด: ' + error.message
      } finally {
        this.loading = false
      }
    },

    async updateUser() {
      this.loading = true

      try {
        const updateData = {
          firstname: this.formData.firstname,
          lastname: this.formData.lastname,
          phone: this.formData.phone,
          role: this.formData.role,
          // Send both for compatibility
          departments: this.jobAssignments.map(ja => ja.department_id),
          job_assignments: this.jobAssignments
        }

        console.log('📤 [UserForm] Updating user:', this.userId, updateData)

        const result = await window.ERP_CORE.hr.updateUser(this.userId, updateData)

        if (result.success) {
          this.successMessage = 'อัปเดต User เรียบร้อยแล้ว'
          
          setTimeout(() => {
            this.$router.push({ name: 'hr-user-management' })
          }, 1500)
        } else {
          this.errorMessage = result.error || 'เกิดข้อผิดพลาดในการอัปเดต User'
        }
      } catch (error) {
        console.error('❌ [UserForm] Update error:', error)
        this.errorMessage = 'เกิดข้อผิดพลาด: ' + error.message
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.formData = {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
      }
      this.unitInput = '69078e8039cbc5602b23f976'
      this.assetInput = '69078e4939cbc5602b23f975'
      this.jobAssignments = []
      this.departmentPositionsCache = {}
      this.errors = {}
      this.successMessage = ''
      this.errorMessage = ''
    },

    handleCancel() {
      this.$router.push({ name: 'hr-user-management' })
    },

    generatePassword() {
      const length = 12
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      
      // Ensure at least one of each type
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      password += '0123456789'[Math.floor(Math.random() * 10)]
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
      
      // Fill the rest randomly
      for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }
      
      // Shuffle the password
      password = password.split('').sort(() => Math.random() - 0.5).join('')
      
      this.formData.password = password
      this.formData.confirmPassword = password
      this.showPassword = true
    },

    async copyToClipboard(text, field) {
      try {
        await navigator.clipboard.writeText(text)
        this.copiedField = field
        setTimeout(() => {
          this.copiedField = ''
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    },

    closeCredentialsModal() {
      this.showCredentialsModal = false
      this.createdCredentials = {
        username: '',
        password: ''
      }
      this.copiedField = ''
      this.$router.push({ name: 'hr-user-management' })
    }
  }
}
</script>

<style scoped>
.user-form-container {
  width: 100%;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
}

.form-section h3 i {
  color: #3b82f6;
  margin-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: #ef4444;
  margin-left: 4px;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group input.readonly-input {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
  cursor: default;
}

.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.password-input {
  position: relative;
  display: flex;
  gap: 8px;
}

.password-input input {
  flex: 1;
}

.btn-gen-password {
  padding: 10px 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-gen-password:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
}

.btn-gen-password:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
}

.toggle-password:hover {
  color: #3b82f6;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-bar.weak .strength-fill { background: #ef4444; }
.strength-bar.fair .strength-fill { background: #f59e0b; }
.strength-bar.good .strength-fill { background: #eab308; }
.strength-bar.strong .strength-fill { background: #22c55e; }
.strength-bar.very-strong .strength-fill { background: #10b981; }

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.strength-text.weak { color: #ef4444; }
.strength-text.fair { color: #f59e0b; }
.strength-text.good { color: #eab308; }
.strength-text.strong { color: #22c55e; }
.strength-text.very-strong { color: #10b981; }

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.info-box i {
  color: #3b82f6;
  font-size: 20px;
  flex-shrink: 0;
}

.role-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  width: fit-content;
}

.badge-admin {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.badge i {
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.alert i {
  font-size: 20px;
}

.alert-success {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}

.alert-error {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.alert-info {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

/* Department Selection */
.department-selection {
  margin-top: 16px;
}

.department-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.department-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background: white;
}

.department-item.is-selected {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.department-header {
  display: flex;
  align-items: center;
}

.department-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.department-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.department-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.department-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.department-code {
  font-size: 12px;
  color: #6b7280;
}

.position-selection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding-left: 32px;
}

.position-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.position-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.loading-positions {
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.position-tree-container {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f9fafb;
}

.no-positions {
  margin-top: 8px;
  font-style: italic;
}

/* Credentials Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.credentials-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  padding: 32px 32px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3);
}

.modal-icon i {
  font-size: 40px;
  color: white;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.modal-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.modal-body {
  padding: 24px 32px;
}

.credential-item {
  margin-bottom: 20px;
}

.credential-item:last-of-type {
  margin-bottom: 24px;
}

.credential-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.credential-item label i {
  color: #3b82f6;
  font-size: 16px;
}

.credential-value {
  display: flex;
  gap: 8px;
}

.credential-value input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Monaco', 'Courier New', monospace;
  background: #f9fafb;
  color: #111827;
  font-weight: 500;
}

.btn-copy {
  padding: 12px 20px;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-copy.copied {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.btn-copy i {
  font-size: 14px;
}

.warning-box {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.warning-box i {
  color: #f59e0b;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-box strong {
  color: #92400e;
}

.warning-box div {
  color: #78350f;
  font-size: 13px;
  line-height: 1.6;
}

.modal-footer {
  padding: 20px 32px 32px;
  text-align: center;
}

.btn-modal-close {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-modal-close:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-card {
    padding: 20px;
  }

  .password-input {
    flex-direction: column;
  }

  .btn-gen-password {
    width: 100%;
    justify-content: center;
  }

  .credentials-modal {
    width: 95%;
  }

  .modal-header {
    padding: 24px 20px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px 24px;
  }

  .credential-value {
    flex-direction: column;
  }

  .btn-copy {
    width: 100%;
    justify-content: center;
  }
}
</style>
