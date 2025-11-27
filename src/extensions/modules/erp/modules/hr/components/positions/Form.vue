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
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <i :class="`fas fa-${isEditMode ? 'edit text-yellow-500' : 'plus-circle text-green-500'}`"></i>
                {{ isEditMode ? 'แก้ไขข้อมูลตำแหน่ง' : 'เพิ่มตำแหน่งใหม่' }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ isEditMode ? 'แก้ไขข้อมูลตำแหน่งงานในองค์กร' : 'สร้างตำแหน่งงานใหม่ (Master Data)' }}
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

      <!-- Form Content -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Basic Information Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <i class="fas fa-info-circle text-blue-500"></i>
              ข้อมูลพื้นฐาน
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Position Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  รหัสตำแหน่ง <span class="text-red-500">*</span>
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
                    placeholder="POS001"
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

              <!-- Position Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อตำแหน่ง <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="formData.name"
                  :class="{'border-red-300': errors.name}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ผู้จัดการฝ่าย"
                  required
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
              </div>

              <!-- Level -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ระดับตำแหน่ง <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.level"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- เลือกระดับ --</option>
                  <option value="staff">พนักงาน (Staff)</option>
                  <option value="supervisor">หัวหน้างาน (Supervisor)</option>
                  <option value="manager">ผู้จัดการ (Manager)</option>
                  <option value="director">ผู้อำนวยการ (Director)</option>
                  <option value="executive">ผู้บริหาร (Executive)</option>
                </select>
                <p v-if="errors.level" class="mt-1 text-sm text-red-500">{{ errors.level }}</p>
              </div>

              <!-- Status -->
              <div>
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
                  placeholder="รายละเอียดเกี่ยวกับตำแหน่งงาน..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <i class="fas fa-info-circle text-blue-500 text-xl mt-1"></i>
              <div class="flex-1">
                <h3 class="font-semibold text-blue-900 mb-1">หมายเหตุ</h3>
                <p class="text-sm text-blue-800">
                  ตำแหน่งที่สร้างจะเป็น <strong>Master Data</strong> สามารถนำไปใช้ในหลาย Department ได้<br>
                  การกำหนดสิทธิ์การเข้าถึง (Permissions) จะทำในหน้า <strong>Department Management</strong>
                </p>
              </div>
            </div>
          </div>

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
export default {
  name: 'PositionForm',
  
  props: {
    positionId: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      initialLoading: false,
      loading: false,
      position: null,
      formData: {
        code: '',
        name: '',
        level: '',
        description: '',
        status: 'active'
      },
      errors: {}
    }
  },
  
  computed: {
    isEditMode() {
      return !!this.positionId
    }
  },
  
  async mounted() {
    if (this.isEditMode) {
      await this.loadPosition()
    } else {
      this.generateCode()
    }
  },
  
  methods: {
    async loadPosition() {
      this.initialLoading = true
      try {
        console.log('📤 [PositionForm] Loading position:', this.positionId)
        
        this.position = await window.ERP_CORE.positions.getPositionById(this.positionId)
        
        if (this.position) {
          this.formData = {
            code: this.position.code || '',
            name: this.position.name || '',
            level: this.position.level || '',
            description: this.position.description || '',
            status: this.position.status || 'active'
          }
          
          console.log('✅ [PositionForm] Position loaded:', this.position)
        }
      } catch (error) {
        console.error('❌ [PositionForm] Load position error:', error)
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถโหลดข้อมูลตำแหน่งได้: ' + error.message, 'error')
        this.goBack()
      } finally {
        this.initialLoading = false
      }
    },
    
    generateCode() {
      const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
      this.formData.code = `POS${random}`
    },
    
    validateForm() {
      this.errors = {}
      
      if (!this.formData.code) {
        this.errors.code = 'กรุณาระบุรหัสตำแหน่ง'
      }
      
      if (!this.formData.name) {
        this.errors.name = 'กรุณาระบุชื่อตำแหน่ง'
      }
      
      if (!this.formData.level) {
        this.errors.level = 'กรุณาเลือกระดับตำแหน่ง'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async submitForm() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      try {
        console.log('📤 [PositionForm] Submitting position:', this.formData)
        
        if (this.isEditMode) {
          await window.ERP_CORE.positions.updatePosition(this.positionId, this.formData)
        } else {
          await window.ERP_CORE.positions.createPosition(this.formData)
        }
        
        await this.$swal?.fire({
          title: 'สำเร็จ!',
          text: this.isEditMode ? 'อัปเดตตำแหน่งเรียบร้อย' : 'สร้างตำแหน่งเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
        
        this.$router.push({ name: 'hr-positions' })
      } catch (error) {
        console.error('❌ [PositionForm] Submit error:', error)
        this.$swal?.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    goBack() {
      this.$router.push({ name: 'hr-positions' })
    }
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
