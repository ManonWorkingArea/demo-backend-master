<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="initialLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Form -->
    <div v-else>
      <!-- Header Section -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <i :class="`fas fa-${isEditMode ? 'edit text-yellow-500' : 'plus-circle text-green-500'}`"></i>
                {{ isEditMode ? 'แก้ไขข้อมูลแผนก' : 'เพิ่มแผนก/ฝ่ายใหม่' }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ isEditMode ? 'แก้ไขข้อมูลแผนกและสิทธิ์การเข้าถึงโมดูล' : 'สร้างแผนกใหม่และกำหนดสิทธิ์การเข้าถึงโมดูล' }}
              </p>
            </div>
            <button 
              @click="goBack"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              กลับ
            </button>
          </div>
        </div>
      </div>

      <!-- Breadcrumb (Show only in Create mode) -->
      <div v-if="!isEditMode" class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              <li class="inline-flex items-center">
                <router-link to="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <i class="fas fa-home mr-2"></i>
                  Home
                </router-link>
              </li>
              <li>
                <div class="flex items-center">
                  <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                  <router-link to="/hr/dashboard" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                    HR Dashboard
                  </router-link>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                  <router-link to="/hr/departments" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Departments
                  </router-link>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                  <span class="text-sm font-medium text-gray-500">Create</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <!-- Form Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Basic Information Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <i class="fas fa-info-circle text-blue-500"></i>
              ข้อมูลพื้นฐาน
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Department Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  รหัสแผนก <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    v-model="formData.code"
                    :class="[
                      'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      {'border-red-300': errors.code, 'bg-gray-100': isEditMode}
                    ]"
                    :readonly="isEditMode"
                    placeholder="DEPT001"
                    required
                  />
                  <button
                    v-if="!isEditMode"
                    type="button"
                    @click="generateCode"
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    title="สร้างรหัสอัตโนมัติ"
                  >
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
                <p v-if="errors.code" class="mt-1 text-sm text-red-500">{{ errors.code }}</p>
              </div>

              <!-- Department Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อแผนก <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="formData.name"
                  :class="{'border-red-300': errors.name}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="แผนกการเงิน"
                  required
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
              </div>

              <!-- Status (Show only in Edit mode) -->
              <div v-if="isEditMode">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ระงับการใช้งาน</option>
                </select>
              </div>

              <!-- Status (Show in Create mode) -->
              <div v-else>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ระงับการใช้งาน</option>
                </select>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับแผนก..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Module Access Card - Using Shared Component -->
          <ModuleAccessSelector 
            v-model="selectedMenus"
            title="สิทธิ์การเข้าถึงโมดูล"
            :showActions="true"
          />

          <!-- Action Buttons -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <button
                type="button"
                @click="goBack"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-times mr-2"></i>
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="loading"
                :class="[
                  loading ? 'opacity-50 cursor-not-allowed' : '',
                  isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                ]"
                class="text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-spinner fa-spin mr-2" v-if="loading"></i>
                <i class="fas fa-save mr-2" v-else></i>
                {{ loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ModuleAccessSelector } from '@/extensions/modules/erp'

export default {
  name: 'DepartmentForm',
  components: {
    ModuleAccessSelector
  },
  props: {
    // Props สำหรับ Edit mode
    departmentId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      initialLoading: false,
      loading: false,
      department: null,
      formData: {
        code: '',
        name: '',
        description: '',
        status: 'active'
      },
      selectedMenus: {}, // เก็บ menu items ที่เลือก { moduleName: ['menu1', 'menu2'] }
      errors: {}
    }
  },
  computed: {
    isEditMode() {
      return !!this.departmentId
    }
  },
  async mounted() {
    // Initialize via ERP_CORE
    if (window.ERP_CORE?.departments) {
      window.ERP_CORE.departments.initialize(this)
    }

    if (this.isEditMode) {
      await this.loadDepartment()
    } else {
      this.generateCode()
    }
  },
  methods: {
    /**
     * โหลดข้อมูลแผนก (สำหรับ Edit mode)
     */
    async loadDepartment() {
      this.initialLoading = true
      try {
        console.log('📤 [DepartmentForm] Loading department:', this.departmentId)
        
        this.department = await window.ERP_CORE.departments.getDepartmentById(this.departmentId)
        
        if (this.department) {
          console.log('✅ [DepartmentForm] Department loaded:', this.department)
          
          // โหลดข้อมูลพื้นฐาน
          this.formData = {
            code: this.department.code || '',
            name: this.department.name || '',
            description: this.department.description || '',
            status: this.department.status || 'active'
          }
          
          // แปลง module_access เป็น selectedMenus format
          // module_access = [{ module: "hr", menus: ["employees", "departments"] }]
          // selectedMenus = { "hr": ["employees", "departments"] }
          const newSelectedMenus = {}
          
          if (Array.isArray(this.department.module_access)) {
            this.department.module_access.forEach(item => {
              if (item.access && item.module && Array.isArray(item.menus)) {
                newSelectedMenus[item.module] = item.menus
              }
            })
          }
          
          this.selectedMenus = newSelectedMenus
          
          console.log('✅ [DepartmentForm] Selected menus:', this.selectedMenus)
        } else {
          throw new Error('Department not found')
        }
      } catch (error) {
        console.error('❌ [DepartmentForm] Load department error:', error)
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถโหลดข้อมูลแผนกได้: ' + error.message, 'error')
        this.goBack()
      } finally {
        this.initialLoading = false
      }
    },

    /**
     * สร้างรหัสแผนกอัตโนมัติ
     */
    generateCode() {
      this.formData.code = window.ERP_CORE.departments.generateDepartmentCode()
    },

    /**
     * Validate form
     */
    validateForm() {
      this.errors = {}

      if (!this.formData.code) {
        this.errors.code = 'กรุณาระบุรหัสแผนก'
      }

      if (!this.formData.name) {
        this.errors.name = 'กรุณาระบุชื่อแผนก'
      }

      return Object.keys(this.errors).length === 0
    },

    /**
     * Submit form
     */
    async submitForm() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        // สร้าง module access object ละเอียดระดับ menu
        const moduleAccess = Object.keys(this.selectedMenus).map(moduleKey => ({
          module: moduleKey,
          access: true,
          menus: this.selectedMenus[moduleKey], // array ของ menu keys ที่เลือก
          granted_at: new Date().toISOString()
        }))

        let response
        if (this.isEditMode) {
          // Update mode
          const updateData = {
            name: this.formData.name,
            description: this.formData.description,
            status: this.formData.status,
            module_access: moduleAccess
          }
          
          console.log('📤 Submitting department update:', updateData)
          response = await window.ERP_CORE.departments.updateDepartment(this.departmentId, updateData)
        } else {
          // Create mode
          const createData = {
            ...this.formData,
            module_access: moduleAccess
          }
          
          console.log('📤 Submitting department create:', createData)
          response = await window.ERP_CORE.departments.createDepartment(createData)
        }

        if (response.success) {
          await this.$swal?.fire({
            title: 'สำเร็จ!',
            text: this.isEditMode ? 'อัพเดทแผนกเรียบร้อย' : 'สร้างแผนกเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
          
          this.$router.push({ name: 'hr-departments' })
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาด')
        }
      } catch (error) {
        console.error('Submit error:', error)
        this.$swal?.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * กลับไปหน้ารายการ
     */
    goBack() {
      this.$router.push({ name: 'hr-departments' })
    }
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
