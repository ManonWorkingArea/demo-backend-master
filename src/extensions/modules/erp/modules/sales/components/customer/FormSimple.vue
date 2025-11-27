<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i :class="($props.mode || 'create') === 'create' ? 'fas fa-user-plus text-green-600 mr-3' : 'fas fa-user-edit text-orange-600 mr-3'"></i>
              {{ ($props.mode || 'create') === 'create' ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขลูกค้า' }}
            </h1>
            <p class="mt-2 text-gray-600">
              {{ ($props.mode || 'create') === 'create' ? 'เพิ่มลูกค้าใหม่เข้าสู่ระบบ' : 'แก้ไขข้อมูลลูกค้า' }}
            </p>
          </div>
          <div>
            <button
              @click="navigateBack"
              type="button"
              :disabled="loading || navigating"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              <span v-if="navigating">กำลังโหลด...</span>
              <span v-else>กลับ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            <p class="text-sm text-gray-600">ข้อมูลหลักของลูกค้า</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสลูกค้า <span class="text-red-500">*</span>
              </label>
              <div class="flex">
                <input
                  v-model="formData.customer_code"
                  type="text"
                  required
                  :readonly="($props.mode || 'create') === 'edit'"
                  placeholder="เช่น CUS001"
                  :class="[
                    'flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.customer_code ? 'border-red-300' : 'border-gray-300',
                    ($props.mode || 'create') === 'edit' ? 'bg-gray-50 text-gray-500' : ''
                  ]"
                />
                <button 
                  v-if="($props.mode || 'create') === 'create'"
                  type="button" 
                  @click="generateCustomerCode" 
                  :disabled="loading"
                  class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-r-lg transition-colors"
                  title="สร้างรหัสลูกค้าอัตโนมัติ"
                >
                  <i class="fas fa-magic"></i>
                </button>
                <button 
                  v-if="($props.mode || 'create') === 'edit'"
                  type="button" 
                  @click="showCodeConfig" 
                  class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded-r-lg transition-colors"
                  title="ดูรูปแบบรหัสลูกค้า"
                >
                  <i class="fas fa-info-circle"></i>
                </button>
              </div>
              <p v-if="errors.customer_code" class="mt-1 text-sm text-red-600">{{ errors.customer_code }}</p>
              
              <!-- Code Preview -->
              <div v-if="codePreview && ($props.mode || 'create') === 'create'" class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <i class="fas fa-eye mr-1"></i>
                ตัวอย่างรหัส: <code class="font-mono">{{ codePreview }}</code>
              </div>
              
              <!-- Code Generation Information -->
              <div v-if="codeGenerationInfo" class="mt-2 text-xs text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                {{ codeGenerationInfo }}
                <span v-if="lastGenerationSource" class="ml-2">
                  ({{ getSourceDisplayName(lastGenerationSource) }})
                </span>
              </div>
            </div>

            <!-- Customer Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ชื่อลูกค้า <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="ชื่อบริษัทหรือบุคคล"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.name ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
            <!-- Customer Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทลูกค้า</label>
              <select 
                v-model="formData.customer_type" 
                @change="onTypeChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">บุคคลธรรมดา</option>
                <option value="corporate">นิติบุคคล</option>
                <option value="government">หน่วยงานราชการ</option>
                <option value="non-profit">องค์กรไม่แสวงหากำไร</option>
              </select>
            </div>

            <!-- Customer Group -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">กลุ่มลูกค้า</label>
              <select 
                v-model="formData.customer_group"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="retail">ลูกค้าปลีก</option>
                <option value="wholesale">ลูกค้าส่ง</option>
                <option value="distributor">ผู้จัดจำหน่าย</option>
                <option value="vip">ลูกค้า VIP</option>
                <option value="government">หน่วยงานราชการ</option>
                <option value="export">ลูกค้าส่งออก</option>
              </select>
            </div>

            <!-- Tax ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
              <input
                v-model="formData.tax_id"
                type="text"
                placeholder="1234567890123"
                maxlength="13"
                @blur="validateTaxId"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.tax_id ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.tax_id" class="mt-1 text-sm text-red-600 flex items-center">
                <i class="fas fa-exclamation-circle mr-1"></i>
                {{ errors.tax_id }}
              </p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select 
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="suspended">ระงับการใช้งาน</option>
                <option value="blacklisted">บัญชีดำ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contact Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลติดต่อ</h3>
            <p class="text-sm text-gray-600">ข้อมูลการติดต่อและผู้ประสานงาน</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Person -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อ</label>
              <input
                v-model="formData.contact_person"
                type="text"
                placeholder="ชื่อผู้ติดต่อ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="02-xxx-xxxx"
                @blur="validatePhone"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
              <p class="mt-1 text-xs text-gray-500">เช่น 02-123-4567 หรือ 081-234-5678</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="example@domain.com"
                @blur="validateEmail"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.email ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Website -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เว็บไซต์</label>
              <input
                v-model="formData.website"
                type="url"
                placeholder="https://example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Address Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลที่อยู่</h3>
            <p class="text-sm text-gray-600">ที่อยู่และข้อมูลการจัดส่ง</p>
          </div>
          
          <div class="px-6 py-6 space-y-6">
            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
              <textarea
                v-model="formData.address"
                rows="3"
                placeholder="ที่อยู่ลูกค้า"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Province -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                <input
                  v-model="formData.province"
                  type="text"
                  placeholder="จังหวัด"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Postal Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
                <input
                  v-model="formData.postal_code"
                  type="text"
                  placeholder="10100"
                  maxlength="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Country -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ประเทศ</label>
                <input
                  v-model="formData.country"
                  type="text"
                  placeholder="ไทย"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Payment Terms -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">เงื่อนไขการชำระเงิน</label>
                <select 
                  v-model="formData.payment_terms"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">เงินสด</option>
                  <option value="credit_7">เครดิต 7 วัน</option>
                  <option value="credit_15">เครดิต 15 วัน</option>
                  <option value="credit_30">เครดิต 30 วัน</option>
                  <option value="credit_45">เครดิต 45 วัน</option>
                  <option value="credit_60">เครดิต 60 วัน</option>
                  <option value="credit_90">เครดิต 90 วัน</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Credit Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเครดิต</h3>
            <p class="text-sm text-gray-600">จัดการวงเงินและยอดคงเหลือ</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Credit Limit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">วงเงินเครดิต</label>
              <input
                v-model.number="formData.credit_limit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="mt-1 text-xs text-gray-500">วงเงินเครดิตสูงสุดที่อนุญาต</p>
            </div>

            <!-- Outstanding Balance -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ยอดค้างชำระ</label>
              <input
                v-model.number="formData.outstanding_balance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">ยอดเงินที่ยังค้างชำระ (อัตโนมัติ)</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 text-center min-w-[200px]">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-3"></i>
            <p class="text-gray-700">กำลังบันทึกข้อมูล...</p>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-red-600 text-lg mt-1 mr-3"></i>
            <div class="flex-1">
              <h4 class="text-red-800 font-medium">เกิดข้อผิดพลาด!</h4>
              <p class="text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <i class="fas fa-check-circle text-green-600 text-lg mt-1 mr-3"></i>
            <div class="flex-1">
              <h4 class="text-green-800 font-medium">สำเร็จ!</h4>
              <p class="text-green-700 mt-1">{{ successMessage }}</p>
              <div v-if="props.mode === 'create' && formData.customer_code" class="mt-2 text-sm text-green-600">
                <i class="fas fa-lightbulb mr-1"></i>
                ตอนนี้คุณสามารถสร้างใบเสนอราคาสำหรับลูกค้า "{{ formData.name }}" ได้แล้ว
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button 
            type="button" 
            @click="handleCancel" 
            :disabled="loading" 
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <i class="fas fa-times mr-2"></i>
            ยกเลิก
          </button>
          
          <button 
            type="button" 
            @click="saveDraft" 
            :disabled="loading" 
            class="px-6 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <i class="fas fa-save mr-2"></i>
            บันทึกร่าง
          </button>
          
          <button 
            type="submit" 
            :disabled="loading || !canSubmit" 
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <i class="fas fa-check mr-2"></i>
            {{ ($props.mode || 'create') === 'edit' ? 'อัปเดต' : 'บันทึก' }}
          </button>
          
          <!-- Quick Action Buttons (แสดงเมื่อมีลูกค้าแล้ว) -->
          <button 
            v-if="(($props.mode || 'create') === 'edit' && ($props.recordId || recordId)) || (($props.mode || 'create') === 'create' && successMessage && formData.customer_code)"
            type="button" 
            @click="createQuotation"
            :disabled="loading || navigating" 
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <i class="fas fa-file-alt mr-2"></i>
            สร้างใบเสนอราคา
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/**
 * ✅ CUSTOMER FORM - Customer Management Form
 * Based on Customer transaction type and Supplier form structure
 */
import { ref, reactive, computed, onMounted, nextTick, inject, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'CustomerFormSimple',
  components: {
    ErpBreadcrumb
  },
  props: {
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'edit'].includes(value)
    },
    recordId: {
      type: String,
      default: null
    }
  },
  emits: ['saved', 'cancel', 'navigate'],
  setup(props, { emit }) {
    // ✅ Router
    const router = useRouter()
    
    // ✅ Safe SalesService Access
    const currentInstance = getCurrentInstance()
    const salesService = inject('salesService', null) || 
                        currentInstance?.appContext?.config?.globalProperties?.$salesService || 
                        window.salesService || 
                        null
    
    // Breadcrumb Navigation
    const breadcrumbNav = computed(() => {
      const baseBreadcrumb = [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
        { name: 'Customers', path: '/sales/customers', icon: 'fas fa-users' }
      ]
      
      if (props.mode === 'create') {
        return [...baseBreadcrumb, { name: 'Create Customer' }]
      } else {
        return [...baseBreadcrumb, { name: 'Edit Customer' }]
      }
    })
    
    // ✅ State
    const loading = ref(false)
    const navigating = ref(false) // ป้องกันการ navigate ซ้ำ
    const error = ref(null)
    const successMessage = ref(null)
    const errors = ref({})
    const codePreview = ref('')
    const codeGenerationInfo = ref('')
    const lastGenerationSource = ref('')
    
    // ✅ Form Data - ใช้โครงสร้างตาม Customer transaction type
    const formData = reactive({
      customer_code: '',
      name: '',
      customer_type: 'individual',
      customer_group: 'retail',
      tax_id: '',
      status: 'active',
      contact_person: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      province: '',
      postal_code: '',
      country: 'ไทย',
      payment_terms: 'cash',
      credit_limit: 0,
      outstanding_balance: 0,
      created_date: new Date(),
      updated_date: new Date(),
      version: 1
    })

    // ✅ Computed Properties
    const canSubmit = computed(() => {
      return formData.customer_code.trim() && formData.name.trim() && !loading.value
    })

    // ✅ Validation Methods
    const validateTaxId = () => {
      errors.value.tax_id = null
      
      if (formData.tax_id && formData.tax_id.length > 0) {
        if (formData.tax_id.length !== 13 || !/^\d{13}$/.test(formData.tax_id)) {
          errors.value.tax_id = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก'
        }
      }
    }

    const validatePhone = () => {
      errors.value.phone = null
      
      if (formData.phone && formData.phone.length > 0) {
        const phoneRegex = /^[\d\s\-+()]+$/
        if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 9) {
          errors.value.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
        }
      }
    }

    const validateEmail = () => {
      errors.value.email = null
      
      if (formData.email && formData.email.length > 0) {
        if (!isValidEmail(formData.email)) {
          errors.value.email = 'รูปแบบอีเมลไม่ถูกต้อง'
        }
      }
    }

    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // ✅ Code Generation Methods
    const generateCustomerCode = async () => {
      try {
        console.log('[Customer Form] 🔢 Generating customer code using ERP Code Manager first...')
        
        // Force clear form first
        formData.customer_code = ''
        
        // ✅ Strategy 1: Use ERP Code Manager (PRIMARY METHOD)
        if (window.ERP_CORE?.codeManager) {
          console.log('[Customer Form] 🏢 Trying ERP Code Manager...')
          
          try {
            // Initialize CodeManager if needed
            if (!window.ERP_CORE.codeManager.initialized) {
              console.log('[Customer Form] 🔄 Initializing CodeManager...')
              await window.ERP_CORE.codeManager.initialize()
            }
            
            const generatedCode = await window.ERP_CORE.codeManager.generateCode('customer')
            
            // Validate generated code (not a template)
            if (generatedCode && 
                generatedCode !== 'CUS(NNN)' && 
                !generatedCode.includes('{') && 
                !generatedCode.includes('(') &&
                !generatedCode.includes('NNN')) {
              
              formData.customer_code = generatedCode
              codeGenerationInfo.value = '✅ สร้างด้วย ERP Code Manager'
              lastGenerationSource.value = 'erp_code_manager'
              console.log(`[Customer Form] ✅ Code Manager generated: ${generatedCode}`)
              await updateCodePreview()
              return
            } else {
              console.warn('[Customer Form] ⚠️ Code Manager returned template or invalid code:', generatedCode)
            }
          } catch (codeManagerError) {
            console.warn('[Customer Form] ⚠️ Code Manager error:', codeManagerError)
          }
        } else {
          console.warn('[Customer Form] ⚠️ ERP Code Manager not available')
        }
        
        // ✅ Strategy 2: Manual sequence calculation (using safe injection)
        console.log('[Customer Form] 🔄 Fallback to manual sequence calculation...')
        const nextSequence = await calculateNextSequence()
        const code = `CUS${String(nextSequence).padStart(3, '0')}`
        formData.customer_code = code
        codeGenerationInfo.value = '🔢 สร้างรหัสจากลำดับถัดไป (Fallback)'
        lastGenerationSource.value = 'manual_sequence'
        console.log(`[Customer Form] ✅ Generated customer code (manual): ${code}`)
        await updateCodePreview()
        
      } catch (error) {
        console.error('[Customer Form] ❌ Failed to generate customer code:', error)
        
        // ✅ Emergency fallback - Simple timestamp-based code
        const timestamp = Date.now().toString().slice(-4)
        const fallbackCode = `CUS${timestamp}`
        formData.customer_code = fallbackCode
        codeGenerationInfo.value = '🆘 รหัสสำรอง (เกิดข้อผิดพลาด)'
        lastGenerationSource.value = 'emergency_fallback'
        console.log(`[Customer Form] 🆘 Emergency fallback code: ${fallbackCode}`)
      }
    }

    const calculateNextSequence = async () => {
      try {
        console.log('[Customer Form] 📊 Calculating next customer sequence using Code Manager first...')
        
        // ✅ Strategy 1: Use ERP Code Manager to get next sequence
        if (window.ERP_CORE?.codeManager) {
          try {
            // Initialize if needed
            if (!window.ERP_CORE.codeManager.initialized) {
              console.log('[Customer Form] 🔄 Initializing CodeManager...')
              await window.ERP_CORE.codeManager.initialize()
            }
            
            const generatedCode = await window.ERP_CORE.codeManager.generateCode('customer')
            if (generatedCode && 
                generatedCode !== 'CUS(NNN)' && 
                !generatedCode.includes('{') && 
                !generatedCode.includes('(') &&
                !generatedCode.includes('NNN')) {
              
              // Extract sequence from generated code (e.g., CUS2412001 -> 1)
              const sequenceMatch = generatedCode.match(/(\d+)$/)
              if (sequenceMatch) {
                const sequence = parseInt(sequenceMatch[1], 10)
                console.log('[Customer Form] ✅ Code Manager provided sequence:', sequence)
                return sequence
              }
            }
          } catch (codeManagerError) {
            console.warn('[Customer Form] ⚠️ Code Manager failed:', codeManagerError)
          }
        }
        
        // ✅ Strategy 2: Use SalesService (safe injection)
        if (salesService) {
          try {
            const existingCustomers = await salesService.getAllCustomers()
            const customers = Array.isArray(existingCustomers) ? existingCustomers : []
            
            console.log(`[Customer Form] 📋 Found ${customers.length} existing customers via SalesService`)
            
            // หา sequence สูงสุดจาก CUS pattern
            let maxSequence = 0
            
            customers.forEach(customer => {
              const code = customer.customer_code
              if (code && code.startsWith('CUS')) {
                // Extract number part (CUS001 -> 001 -> 1)
                const numberPart = code.replace(/^CUS/, '')
                const sequence = parseInt(numberPart, 10)
                if (!isNaN(sequence) && sequence > maxSequence) {
                  maxSequence = sequence
                }
                console.log(`[Customer Form] 🔍 Found customer: ${code} -> sequence: ${sequence}`)
              }
            })
            
            const nextSequence = maxSequence + 1
            console.log(`[Customer Form] ➡️ Next sequence from SalesService: ${nextSequence}`)
            return nextSequence
          } catch (salesServiceError) {
            console.warn('[Customer Form] SalesService failed:', salesServiceError)
            // Use fallback sequence if SalesService fails
            console.log('[Customer Form] quotationUsing fallback sequence 1...')
            return 1
          }
        }
        
        // ✅ Final fallback
        console.warn('[Customer Form] ⚠️ All methods failed, using fallback sequence: 1')
        return 1
        
      } catch (error) {
        console.error('[Customer Form] ❌ Error calculating sequence:', error)
        return 1
      }
    }

    const getNextCustomerNumber = async () => {
      try {
        console.log('[Customer Form] Getting next customer number...')
        
        // Use SalesService to get customer list
        let customers = []
        if (salesService && salesService.getAllCustomers) {
          const customersData = await salesService.getAllCustomers()
          customers = customersData || []
        } else {
          // Dynamic import as fallback
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          const customersData = await newSalesService.getAllCustomers()
          customers = customersData || []
        }
        
        // Find max number from CUS### codes
        let maxNum = 0
        customers.forEach(customer => {
          if (customer.customer_code && customer.customer_code.startsWith('CUS')) {
            const numStr = customer.customer_code.substring(3) // Remove CUS prefix
            const num = parseInt(numStr, 10)
            if (!isNaN(num) && num > maxNum) {
              maxNum = num
            }
          }
        })
        
        return maxNum + 1
        
      } catch (error) {
        console.error('[Customer Form] Error getting next number:', error)
        // If error occurs, use timestamp as fallback
        return parseInt(Date.now().toString().slice(-3))
      }
    }

    // ✅ Utility Methods
    const onTypeChange = async () => {
      console.log('[Customer Form] Type changed to:', formData.customer_type)
      
      await updateCodePreview()
      
      if (props.mode === 'create') {
        await generateCustomerCode()
      }
    }

    const updateCodePreview = async () => {
      try {
        console.log('[Customer Form] 🔍 Updating code preview...')
        
        // แสดงรหัสที่จะได้จริงๆ โดยคำนวณจาก sequence ถัดไป
        try {
          const nextSequence = await calculateNextSequence()
          const preview = `CUS${String(nextSequence).padStart(3, '0')}`
          codePreview.value = preview
          codeGenerationInfo.value = `รหัสลูกค้าถัดไป: ${preview}`
          
          console.log('[Customer Form] ✅ Preview updated with actual next code:', preview)
          return
        } catch (seqError) {
          console.warn('[Customer Form] ⚠️ Could not calculate next sequence:', seqError)
        }
        
        // Fallback: แสดง template
        const config = window.ERP_CORE?.masterdata?.customer?.CUSTOMER_CODE_CONFIG
        if (config?.patterns?.default) {
          const pattern = config.patterns.default
          const preview = `${pattern.prefix}001`
          codePreview.value = preview
          codeGenerationInfo.value = config.formatDescription || 'รูปแบบรหัสลูกค้าแบบเรียงตัวเลข'
        } else {
          codePreview.value = 'CUS001'
          codeGenerationInfo.value = 'รูปแบบรหัสลูกค้าเริ่มต้น'
        }
        
      } catch (error) {
        console.warn('[Customer Form] Error updating code preview:', error)
        codePreview.value = 'CUS001'
        codeGenerationInfo.value = 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า'
      }
    }

    const showCodeConfig = () => {
      try {
        console.log('[Customer Form] 🔍 Checking available code configurations...')
        
        const codeManager = window.ERP_CORE?.codeManager
        const config = window.ERP_CORE?.masterdata?.customer?.CUSTOMER_CODE_CONFIG
        
        console.log('[Customer Form] 🔍 Available configs:', {
          hasCodeManager: !!codeManager,
          hasPatterns: !!codeManager?.patterns,
          hasCustomerPattern: codeManager?.patterns?.has('customer'),
          hasDirectConfig: !!config,
          configDetails: config
        })
        
        if (codeManager?.patterns?.has('customer')) {
          const pattern = codeManager.patterns.get('customer')
          console.log('[Customer Form] ✅ CodeManager pattern:', pattern)
          codeGenerationInfo.value = `CodeManager: ${pattern.prefix}${pattern.sequence?.digits ? '0'.repeat(pattern.sequence.digits) : '###'}`
        } else if (config) {
          console.log('[Customer Form] ✅ Direct config available:', config)
          const pattern = config.patterns.default
          codeGenerationInfo.value = `Module Config: ${pattern.prefix}${'0'.repeat(pattern.sequence.digits)}`
        } else {
          codeGenerationInfo.value = 'ไม่พบการตั้งค่า Customer Code - ใช้ระบบเริ่มต้น (CUS###)'
        }
        
      } catch (error) {
        console.error('[Customer Form] Error showing code config:', error)
        codeGenerationInfo.value = 'เกิดข้อผิดพลาดในการแสดงการตั้งค่า'
      }
    }

    const getSourceDisplayName = (source) => {
      const sourceNames = {
        'erp_core': '🏢 ERP Core Configuration',
        'loaded_default': '📋 Module Configuration', 
        'hardcoded_default': '🔧 System Default',
        'module_config': '📦 Direct Module Config',
        'code_manager': '🏢 Centralized Code Manager',
        'direct_calculation': '🧮 Direct Sequence Calculation',
        'fallback': '⚠️ Simple Sequence Fallback',
        'emergency': '🆘 Emergency Timestamp',
        'cache': '🗄️ ค่าจากแคช',
        'unknown': '❓ ไม่ทราบแหล่งที่มา'
      }
      return sourceNames[source] || source
    }

    // ✅ Load existing data for edit mode
    const loadData = async () => {
      if (props.mode !== 'edit' || !props.recordId) return

      try {
        console.log('[Customer Form] Loading data for ID:', props.recordId)
        
        let result
        // ✅ Use SalesService only (no ERP Engine fallback for customers)
        if (salesService && salesService.getCustomer) {
          console.log('[Customer Form] Using SalesService.getCustomer...')
          const customerData = await salesService.getCustomer(props.recordId)
          if (customerData) {
            result = { success: true, data: customerData }
          } else {
            result = { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
          }
        } else {
          // Initialize salesService if not available
          console.log('[Customer Form] Initializing SalesService for loading...')
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            const currentInstance = getCurrentInstance()
            newSalesService.initialize(currentInstance?.appContext?.config?.globalProperties || window.vueApp?.config?.globalProperties)
          }
          const customerData = await newSalesService.getCustomer(props.recordId)
          if (customerData) {
            result = { success: true, data: customerData }
          } else {
            result = { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
          }
        }
        
        if (result.success && result.data) {
          console.log('[Customer Form] Loaded data:', result.data)
          
          // ✅ Map data to form
          Object.assign(formData, {
            customer_code: result.data.customer_code || '',
            name: result.data.customer_name || result.data.name || '', // ✅ รองรับทั้ง customer_name และ name
            customer_type: result.data.customer_type || 'individual',
            customer_group: result.data.customer_group || 'retail', // ✅ เปลี่ยนเป็น retail
            tax_id: result.data.tax_id || '',
            status: result.data.status || 'active',
            contact_person: result.data.contact_person || '',
            phone: result.data.phone || '',
            email: result.data.email || '',
            website: result.data.website || '',
            address: result.data.address || '',
            province: result.data.province || '',
            postal_code: result.data.postal_code || '',
            country: result.data.country || 'ไทย',
            payment_terms: result.data.payment_terms || 'cash',
            credit_limit: result.data.credit_limit || 0,
            outstanding_balance: result.data.outstanding_balance || 0,
            created_date: result.data.created_date || new Date(),
            updated_date: new Date(),
            version: result.data.version || 1
          })
        } else {
          throw new Error(result.message || 'ไม่พบข้อมูลลูกค้า')
        }
      } catch (err) {
        console.error('[Customer Form] Load error:', err)
        error.value = 'ไม่สามารถโหลดข้อมูลลูกค้าได้: ' + err.message
      }
    }

    // ✅ Submit Form
    const submitForm = async () => {
      console.log('[Customer Form] Submitting form:', { mode: props.mode, data: formData })
      
      // Clear previous messages
      error.value = null
      successMessage.value = null
      errors.value = {}
      
      // Validate all fields
      validateTaxId()
      validatePhone()
      validateEmail()
      
      // Check for validation errors
      if (Object.keys(errors.value).some(key => errors.value[key])) {
        error.value = 'กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง'
        return
      }
      
      loading.value = true

      try {
        // ✅ Prepare data for Transaction Engine
        const submitData = {
          customer_code: formData.customer_code.trim(),
          customer_name: formData.name.trim(), // ✅ ใช้ customer_name แทน name
          name: formData.name.trim(), // ✅ เก็บทั้งสองฟิลด์เผื่อ
          customer_type: formData.customer_type,
          customer_group: formData.customer_group === 'regular' ? 'retail' : formData.customer_group, // ✅ แปลง regular -> retail
          tax_id: formData.tax_id ? formData.tax_id.trim() : '',
          status: formData.status,
          contact_person: formData.contact_person ? formData.contact_person.trim() : '',
          phone: formData.phone ? formData.phone.trim() : '',
          email: formData.email ? formData.email.trim() : '',
          website: formData.website ? formData.website.trim() : '',
          address: formData.address ? formData.address.trim() : '',
          province: formData.province ? formData.province.trim() : '',
          postal_code: formData.postal_code ? formData.postal_code.trim() : '',
          country: formData.country ? formData.country.trim() : 'ไทย',
          payment_terms: formData.payment_terms,
          credit_limit: formData.credit_limit || 0,
          outstanding_balance: formData.outstanding_balance || 0
        }
        
        console.log('[Customer Form] submitData complete:', submitData)

        // ✅ Basic validation
        if (!submitData.customer_code) {
          throw new Error('กรุณาระบุรหัสลูกค้า')
        }
        
        if (!submitData.name) {
          throw new Error('กรุณาระบุชื่อลูกค้า')
        }
        
        // ✅ Validate customer type
        const validTypes = ['individual', 'corporate', 'government', 'non-profit']
        if (!validTypes.includes(submitData.customer_type)) {
          console.error('[Customer Form] Invalid type:', submitData.customer_type, 'Valid types:', validTypes)
          throw new Error(`ประเภทลูกค้าไม่ถูกต้อง: ${submitData.customer_type}`)
        }

        // ✅ Validate customer group
        const validGroups = ['retail', 'wholesale', 'distributor', 'vip', 'government', 'export']
        if (!validGroups.includes(submitData.customer_group)) {
          console.error('[Customer Form] Invalid group:', submitData.customer_group, 'Valid groups:', validGroups)
          throw new Error(`กลุ่มลูกค้าไม่ถูกต้อง: ${submitData.customer_group}`)
        }

        // ✅ Validate status
        const validStatuses = ['active', 'inactive', 'suspended', 'blacklisted']
        if (!validStatuses.includes(submitData.status)) {
          console.error('[Customer Form] Invalid status:', submitData.status, 'Valid statuses:', validStatuses)
          throw new Error(`สถานะลูกค้าไม่ถูกต้อง: ${submitData.status}`)
        }

        console.log('[Customer Form] Submit data prepared:', submitData)
        
        // ✅ Debug: ตรวจสอบฟิลด์ที่จำเป็น
        console.log('[Customer Form] 🔍 Field validation check:', {
          hasCustomerCode: !!submitData.customer_code,
          hasCustomerName: !!submitData.customer_name,
          hasName: !!submitData.name,
          customerGroup: submitData.customer_group,
          isValidGroup: ['retail', 'wholesale', 'distributor', 'vip', 'government', 'export'].includes(submitData.customer_group)
        })

        let result
        if (props.mode === 'edit' && props.recordId) {
          // ✅ Update existing customer
          if (salesService && salesService.updateCustomer) {
            console.log('[Customer Form] Using SalesService.updateCustomer...')
            result = await salesService.updateCustomer(props.recordId, submitData)
          } else {
            // Initialize salesService if not available
            console.log('[Customer Form] Initializing SalesService for update...')
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              const currentInstance = getCurrentInstance()
              newSalesService.initialize(currentInstance?.appContext?.config?.globalProperties || window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.updateCustomer(props.recordId, submitData)
          }
        } else {
          // ✅ Create new customer
          if (salesService && salesService.createCustomer) {
            console.log('[Customer Form] Using SalesService.createCustomer...')
            result = await salesService.createCustomer(submitData)
          } else {
            // Initialize salesService if not available
            console.log('[Customer Form] Initializing SalesService for create...')
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              const currentInstance = getCurrentInstance()
              newSalesService.initialize(currentInstance?.appContext?.config?.globalProperties || window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.createCustomer(submitData)
          }
        }

        console.log('[Customer Form] Submit result:', result)

        if (result.success) {
          // ✅ Success handling
          console.log('[Customer Form] Success:', result)
          
          successMessage.value = props.mode === 'edit' 
            ? 'อัปเดตลูกค้าเรียบร้อยแล้ว' 
            : 'เพิ่มลูกค้าเรียบร้อยแล้ว'
          
          // Show success message
          if (window.$toast) {
            window.$toast.success(successMessage.value)
          }

          // ✅ Emit result
          emit('saved', {
            success: true,
            data: result.data,
            mode: props.mode
          })
          
          // ✅ Navigate back to customer list after showing success message
          setTimeout(async () => {
            if (!navigating.value) {
              navigating.value = true
              try {
                if (router) {
                  console.log('[Customer Form] ✅ Navigating to customer list after successful save...')
                  await router.push('/sales/customers')
                }
              } catch (navError) {
                console.log('[Customer Form] Navigation error:', navError.message)
                // ✅ Fallback: emit event for parent to handle navigation
                emit('navigate', { route: '/sales/customers' })
              } finally {
                navigating.value = false
              }
            }
          }, 800) // รอ 0.8 วินาทีเพื่อให้ผู้ใช้เห็น success message
        } else {
          throw new Error(result.message || 'ไม่สามารถบันทึกข้อมูลได้')
        }
      } catch (err) {
        console.error('[Customer Form] Submit error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        
        // Show error toast
        if (window.$toast) {
          window.$toast.error(error.value)
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Save as Draft
    const saveDraft = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Save with minimal validation
        const draftData = {
          customer_code: formData.customer_code.trim() || `DRAFT_${Date.now()}`,
          customer_name: formData.name.trim() || 'ลูกค้าใหม่ (ร่าง)', // ✅ ใช้ customer_name
          name: formData.name.trim() || 'ลูกค้าใหม่ (ร่าง)', // ✅ เก็บทั้งสองฟิลด์
          customer_type: formData.customer_type,
          customer_group: formData.customer_group === 'regular' ? 'retail' : formData.customer_group, // ✅ แปลง regular -> retail
          status: 'draft',
          created_date: formData.created_date || new Date(),
          updated_date: new Date(),
          version: formData.version || 1
        }

        let result
        if (props.mode === 'edit' && props.recordId) {
          // ✅ Update draft using SalesService only
          if (salesService && salesService.updateCustomer) {
            console.log('[Customer Form] Using SalesService.updateCustomer for draft...')
            result = await salesService.updateCustomer(props.recordId, draftData)
          } else {
            // Initialize salesService if not available
            console.log('[Customer Form] Initializing SalesService for draft update...')
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              const currentInstance = getCurrentInstance()
              newSalesService.initialize(currentInstance?.appContext?.config?.globalProperties || window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.updateCustomer(props.recordId, draftData)
          }
        } else {
          // ✅ Create draft using SalesService only
          if (salesService && salesService.createCustomer) {
            console.log('[Customer Form] Using SalesService.createCustomer for draft...')
            result = await salesService.createCustomer(draftData)
          } else {
            // Initialize salesService if not available
            console.log('[Customer Form] Initializing SalesService for draft create...')
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              const currentInstance = getCurrentInstance()
              newSalesService.initialize(currentInstance?.appContext?.config?.globalProperties || window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.createCustomer(draftData)
          }
        }

        if (result.success) {
          successMessage.value = 'บันทึกร่างเรียบร้อยแล้ว'
          
          if (window.$toast) {
            window.$toast.success(successMessage.value)
          }

          emit('saved', {
            success: true,
            data: result.data,
            mode: props.mode,
            isDraft: true
          })
        } else {
          throw new Error(result.message || 'ไม่สามารถบันทึกร่างได้')
        }
      } catch (err) {
        error.value = 'ไม่สามารถบันทึกร่างได้: ' + err.message
        
        if (window.$toast) {
          window.$toast.error(error.value)
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Cancel handler
    const handleCancel = async () => {
      console.log('[Customer Form] 🔙 Cancel button clicked')
      
      // Emit cancel event for parent component
      emit('cancel')
      
      // Navigate back using multiple strategies
      try {
        // Strategy 1: Use Vue Router (preferred)
        if (router) {
          console.log('[Customer Form] 🔄 Using Vue Router to go back...')
          await router.back()
          return
        }
        
        // Strategy 2: Try global router
        if (window.$router) {
          console.log('[Customer Form] 🔄 Using global router to go back...')
          await window.$router.back()
          return
        }
        
        // Strategy 3: Navigate to customer list route directly
        if (router) {
          console.log('[Customer Form] 🏠 Navigating to customer list route...')
          await router.push({ name: 'CustomerList' }) // หรือ path ที่เหมาะสม
          return
        }
        
        // Strategy 4: Use browser history
        if (window.history.length > 1) {
          console.log('[Customer Form] 🔄 Using browser history back...')
          window.history.back()
          return
        }
        
        // Strategy 5: Redirect to customer list URL
        const currentPath = window.location.pathname
        let customerListPath = '/erp/sales/customer'
        
        if (currentPath.includes('/customer/')) {
          // Extract base path: /erp/sales/customer/form -> /erp/sales/customer  
          customerListPath = currentPath.replace(/\/form.*$/, '')
        }
        
        console.log('[Customer Form] 🏠 Redirecting to customer list:', customerListPath)
        window.location.href = customerListPath
        
      } catch (navError) {
        console.error('[Customer Form] ❌ All navigation methods failed:', navError)
        
        // Final fallback: reload page
        console.log('[Customer Form] 🔄 Final fallback: reloading page...')
        window.location.reload()
      }
    }



    // ✅ Lifecycle
    onMounted(async () => {
      console.log('[Customer Form] 🚀 Mounting component with props:', props)
      
      await nextTick()
      
      // Debug: ตรวจสอบสถานะของระบบ
      console.log('[Customer Form] 🔍 System status:', {
        hasERP_CORE: !!window.ERP_CORE,
        hasEngine: !!window.ERP_CORE?.engine,
        hasCodeManager: !!window.ERP_CORE?.codeManager,
        hasCustomerConfig: !!window.ERP_CORE?.masterdata?.customer?.CUSTOMER_CODE_CONFIG,
        hasRouter: !!router,
        hasGlobalRouter: !!window.$router,
        currentPath: window.location.pathname
      })
      
      // อัปเดตตัวอย่างรหัสเริ่มต้น
      await updateCodePreview()
      
      if (props.mode === 'edit') {
        console.log('[Customer Form] 📝 Edit mode - loading existing data...')
        await loadData()
        // อัปเดตตัวอย่างรหัสอีกครั้งหลังโหลดข้อมูล
        await updateCodePreview()
      } else {
        console.log('[Customer Form] ➕ Create mode - generating new code...')
        await generateCustomerCode()
      }
      
      console.log('[Customer Form] 🏁 Component mounted successfully')
    })

    // ✅ Navigation functions
    const navigateBack = async () => {
      if (navigating.value || loading.value) {
        console.log('[Customer Form] Cannot navigate: already navigating or loading')
        return
      }
      
      navigating.value = true
      try {
        if (router) {
          console.log('[Customer Form] 🔙 User clicked back button, navigating to customer list...')
          await router.push('/sales/customers')
        }
      } catch (navError) {
        console.error('[Customer Form] Navigation error:', navError.message)
        // ✅ Fallback: emit event for parent to handle navigation
        emit('navigate', { route: '/sales/customers' })
      } finally {
        navigating.value = false
      }
    }

    const createQuotation = async () => {
      if (navigating.value || loading.value) {
        console.log('[Customer Form] Cannot navigate: already navigating or loading')
        return
      }
      
      // ใช้ customer ID ที่เหมาะสม
      let customerId = null
      if (props.mode === 'edit' && props.recordId) {
        customerId = props.recordId
      } else if (formData.customer_code) {
        // ใช้ customer_code ที่สร้างขึ้น
        customerId = formData.customer_code
      }
      
      if (!customerId) {
        if (window.$toast) {
          window.$toast.warning('กรุณาบันทึกข้อมูลลูกค้าก่อน')
        }
        return
      }
      
      navigating.value = true
      try {
        if (router) {
          console.log('[Customer Form] 📄 Navigating to create quotation for customer:', customerId)
          // Navigate to quotation create page with customer pre-selected
          await router.push({
            path: '/sales/quotations/create',
            query: { 
              customer_id: customerId,
              customer_code: formData.customer_code,
              from: 'customer-form'
            }
          })
        }
      } catch (navError) {
        console.error('[Customer Form] Navigation error:', navError.message)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถไปยังหน้าสร้างใบเสนอราคาได้')
        }
      } finally {
        navigating.value = false
      }
    }

    return {
      // ✅ Core
      router,
      loading,
      navigating,
      error,
      successMessage,
      errors,
      formData,
      codePreview,
      codeGenerationInfo,
      lastGenerationSource,
      breadcrumbNav,
      canSubmit,
      submitForm,
      saveDraft,
      handleCancel,
      generateCustomerCode,
      showCodeConfig,
      onTypeChange,
      updateCodePreview,
      validateTaxId,
      validatePhone,
      navigateBack,
      createQuotation,
      validateEmail,
      isValidEmail,
      getSourceDisplayName,
      calculateNextSequence,
      getNextCustomerNumber,
      
      // ✅ Debug functions (for testing)
      debugNavigation: () => {
        console.log('[Customer Form] 🔍 Navigation Debug Info:', {
          hasRouter: !!router,
          hasGlobalRouter: !!window.$router,
          hasHistory: !!window.history,
          historyLength: window.history.length,
          currentPath: window.location.pathname,
          currentUrl: window.location.href,
          referrer: document.referrer
        })
      }
    }
  }
}
</script>

<style scoped>
/* Custom transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Loading animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>