<template>
  <div class="supplier-form-complete">
    <div class="form-container">
      <form @submit.prevent="submitForm" class="complete-form">
        <!-- Basic Information Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-building"></i>
              ข้อมูลพื้นฐาน
            </h3>
            <div class="section-badge">จำเป็น</div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">รหัสผู้ขาย</label>
              <div class="input-group">
                <input
                  v-model="formData.supplier_code"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.supplier_code }"
                  placeholder="เช่น SUP001"
                  required
                />
                <button type="button" @click="generateSupplierCode" class="btn-generate" title="สร้างรหัสอัตโนมัติ">
                  <i class="fas fa-magic"></i>
                </button>
                <button type="button" @click="showCodeConfig" class="btn-config" title="ดูการตั้งค่ารหัส">
                  <i class="fas fa-cog"></i>
                </button>
              </div>
              <span v-if="errors.supplier_code" class="error-message">
                {{ errors.supplier_code }}
              </span>
              <!-- แสดงสถานะ Code Generation พร้อม visual indicators -->
              <div v-if="codeGenerationInfo" class="code-info">
                <div class="code-info-item bg-blue-50 border-l-4 border-blue-400 px-3 py-2 rounded">
                  <i class="fas fa-info-circle text-blue-500"></i>
                  <span class="text-blue-700 font-medium">{{ codeGenerationInfo }}</span>
                  <!-- แสดงข้อมูล source เพิ่มเติม -->
                  <div v-if="lastGenerationSource" class="text-xs text-blue-600 mt-1">
                    <i class="fas fa-search"></i>
                    {{ getSourceExplanation(lastGenerationSource) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">ชื่อผู้ขาย</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                :class="{ 'error': errors.name }"
                placeholder="ชื่อบริษัท/ร้าน/ผู้ขาย"
                required
              />
              <span v-if="errors.name" class="error-message">
                {{ errors.name }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">ประเภทผู้ขาย</label>
              <select v-model="formData.supplier_type" @change="onTypeChange" class="form-select">
                <option value="domestic">ในประเทศ</option>
                <option value="international">ต่างประเทศ</option>
                <option value="manufacturer">ผู้ผลิต</option>
                <option value="distributor">ผู้จัดจำหน่าย</option>
                <option value="wholesaler">ขายส่ง</option>
                <option value="retailer">ขายปลีก</option>
                <option value="service">ผู้ให้บริการ</option>
                <option value="contractor">ผู้รับเหมา</option>
                <option value="individual">บุคคลธรรมดา</option>
                <option value="government">หน่วยงานราชการ</option>
              </select>
              <!-- แสดงตัวอย่างรหัสที่จะได้รับ -->
              <div v-if="codePreview" class="code-preview">
                <i class="fas fa-info-circle"></i>
                รูปแบบรหัส: <code>{{ codePreview }}</code>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">สถานะ</label>
              <select v-model="formData.status" class="form-select">
                <option value="active">ใช้งานอยู่</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="suspended">ระงับการใช้งาน</option>
                <option value="blocked">ถูกบล็อก</option>
                <option value="blacklisted">ขึ้นบัญชีดำ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tax & Business Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-receipt"></i>
              ข้อมูลทางภาษี
            </h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">เลขประจำตัวผู้เสียภาษี</label>
              <input
                v-model="formData.tax_id"
                type="text"
                class="form-input"
                :class="{ 'error': errors.tax_id }"
                placeholder="1234567890123"
                maxlength="13"
                @input="validateTaxId"
              />
              <span v-if="errors.tax_id" class="error-message">
                {{ errors.tax_id }}
              </span>
              <span v-else-if="formData.tax_id && formData.tax_id.length === 13" class="success-message">
                <i class="fas fa-check"></i> รูปแบบถูกต้อง
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">เลขทะเบียนนิติบุคคล</label>
              <input
                v-model="formData.business_number"
                type="text"
                class="form-input"
                placeholder="0123456789012"
                maxlength="13"
              />
            </div>

            <div class="form-group">
              <label class="form-label">เว็บไซต์</label>
              <input
                v-model="formData.website"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-address-book"></i>
              ข้อมูลติดต่อ
            </h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">ผู้ติดต่อ</label>
              <input
                v-model="formData.contact_person"
                type="text"
                class="form-input"
                placeholder="ชื่อผู้ติดต่อหลัก"
              />
            </div>

            <div class="form-group">
              <label class="form-label">เบอร์โทรศัพท์</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                :class="{ 'error': errors.phone }"
                placeholder="02-xxx-xxxx, 08x-xxx-xxxx"
                @input="validatePhone"
              />
              <span v-if="errors.phone" class="error-message">
                {{ errors.phone }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">อีเมล</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="contact@example.com"
                @input="validateEmail"
              />
              <span v-if="errors.email" class="error-message">
                {{ errors.email }}
              </span>
              <span v-else-if="formData.email && isValidEmail(formData.email)" class="success-message">
                <i class="fas fa-check"></i> รูปแบบถูกต้อง
              </span>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-map-marker-alt"></i>
              ที่อยู่
            </h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">ที่อยู่</label>
              <textarea
                v-model="formData.address"
                class="form-textarea"
                :class="{ 'error': errors.address }"
                rows="3"
                placeholder="ที่อยู่สำนักงาน/ร้าน/บ้าน"
              ></textarea>
              <span v-if="errors.address" class="error-message">
                {{ errors.address }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">จังหวัด</label>
              <input
                v-model="formData.province"
                type="text"
                class="form-input"
                placeholder="จังหวัด"
              />
            </div>

            <div class="form-group">
              <label class="form-label">รหัสไปรษณีย์</label>
              <input
                v-model="formData.postal_code"
                type="text"
                class="form-input"
                placeholder="12345"
                maxlength="5"
                pattern="[0-9]{5}"
              />
            </div>

            <div class="form-group">
              <label class="form-label">ประเทศ</label>
              <select v-model="formData.country" class="form-select">
                <option value="ไทย">ไทย</option>
                <option value="สหรัฐอเมริกา">สหรัฐอเมริกา</option>
                <option value="จีน">จีน</option>
                <option value="ญี่ปุ่น">ญี่ปุ่น</option>
                <option value="เกาหลีใต้">เกาหลีใต้</option>
                <option value="สิงคโปร์">สิงคโปร์</option>
                <option value="มาเลเซีย">มาเลเซีย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Business Terms -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-handshake"></i>
              เงื่อนไขทางธุรกิจ
            </h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">เงื่อนไขการชำระเงิน</label>
              <select v-model="formData.payment_terms" class="form-select">
                <option value="cod">เงินสดเมื่อได้รับสินค้า</option>
                <option value="net_7">เครดิต 7 วัน</option>
                <option value="net_15">เครดิต 15 วัน</option>
                <option value="net_30" selected>เครดิต 30 วัน</option>
                <option value="net_45">เครดิต 45 วัน</option>
                <option value="net_60">เครดิต 60 วัน</option>
                <option value="net_90">เครดิต 90 วัน</option>
                <option value="advance">จ่ายล่วงหน้า</option>
                <option value="installment">ผ่อนชำระ</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">วงเงินเครดิต (บาท)</label>
              <div class="input-group">
                <input
                  v-model.number="formData.credit_limit"
                  type="number"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                <span class="input-suffix">บาท</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">สกุลเงิน</label>
              <select v-model="formData.currency" class="form-select">
                <option value="THB">บาทไทย (THB)</option>
                <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                <option value="EUR">ยูโร (EUR)</option>
                <option value="JPY">เยน (JPY)</option>
                <option value="CNY">หยวน (CNY)</option>
                <option value="SGD">ดอลลาร์สิงคโปร์ (SGD)</option>
                <option value="MYR">ริงกิต (MYR)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">ระยะเวลาส่งมอบ (วัน)</label>
              <input
                v-model.number="formData.lead_time_days"
                type="number"
                class="form-input"
                placeholder="7"
                min="1"
                max="365"
              />
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-sticky-note"></i>
              ข้อมูลเพิ่มเติม
            </h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">หมายเหตุ</label>
              <textarea
                v-model="formData.notes"
                class="form-textarea"
                rows="4"
                placeholder="บันทึกเพิ่มเติมเกี่ยวกับผู้ขาย..."
                maxlength="1000"
              ></textarea>
              <div class="character-count">
                {{ formData.notes?.length || 0 }}/1000 ตัวอักษร
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">การใช้งาน</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input
                    v-model="formData.is_active"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span class="checkbox-label">เปิดใช้งาน</span>
                </label>
                <label class="checkbox-item">
                  <input
                    v-model="formData.requires_po"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span class="checkbox-label">ต้องใช้ Purchase Order</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">การประเมิน</label>
              <div class="rating-group">
                <div class="rating-stars">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="setRating(star)"
                    class="star-button"
                    :class="{ active: star <= formData.rating }"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>
                <span class="rating-text">
                  {{ getRatingText(formData.rating) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>{{ mode === 'edit' ? 'กำลังโหลดข้อมูล...' : 'กำลังบันทึกข้อมูล...' }}</p>
          </div>
        </div>

        <div v-if="error" class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>เกิดข้อผิดพลาด!</strong>
            <p>{{ error }}</p>
          </div>
        </div>

        <div v-if="successMessage" class="alert alert-success">
          <i class="fas fa-check-circle"></i>
          <div>
            <strong>สำเร็จ!</strong>
            <p>{{ successMessage }}</p>
          </div>
        </div>

        <!-- Type Correction Warning -->
        <div v-if="formData.supplier_type && !isOriginalType" class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>แจ้งเตือน!</strong>
            <p>ประเภทผู้ขายถูกแก้ไขให้ถูกต้องแล้ว กรุณาตรวจสอบความถูกต้อง</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <div class="flex items-center gap-3">
            <button type="button" @click="handleCancel" :disabled="loading" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              ยกเลิก
            </button>
            
            <!-- Debug Button -->
            <button
              type="button"
              @click="debugFormState"
              class="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              title="ตรวจสอบสถานะฟอร์ม"
            >
              🐛 Debug
            </button>
          </div>
          
          <div class="flex gap-3">
            <button type="button" @click="saveDraft" :disabled="loading" class="btn btn-outline">
              <i class="fas fa-save"></i>
              บันทึกร่าง
            </button>
            
            <button type="submit" :disabled="loading || !canSubmit" class="btn btn-primary">
              <i class="fas fa-check"></i>
              {{ mode === 'edit' ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/**
 * ✅ COMPLETE SUPPLIER FORM - ฟอร์มแบบเต็มสำหรับจัดการข้อมูลผู้ขาย
 * รองรับการสร้างและแก้ไขข้อมูลผู้ขายแบบครบครัน
 */
import { ref, reactive, computed, onMounted, nextTick, watch, inject } from 'vue'

export default {
  name: 'SupplierFormComplete',
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
  emits: ['saved', 'cancel'],
  inject: ['apiRequest'],
  setup(props, { emit }) {
    // ✅ Inject apiRequest
    const apiRequest = inject('apiRequest')
    
    // ✅ State
    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref(null)
    const errors = ref({})
    const originalType = ref(null) // เก็บค่าเดิมของ type
    const codePreview = ref('') // แสดงตัวอย่างรหัสที่จะได้รับ
    const codeGenerationInfo = ref('') // แสดงข้อมูลการสร้างรหัส
    const lastGenerationSource = ref('') // เก็บ source ล่าสุด
    
    // ฟังก์ชันแปลง source เป็นชื่อที่แสดงผู้ใช้
    const getSourceDisplayName = (source) => {
      const sourceNames = {
        'erp_core': '🏢 ERP Core Configuration',
        'loaded_default': '📋 Module Configuration (Auto-loaded)',
        'hardcoded_default': '🔧 System Default (Fallback)',
        'module_config': '📦 Direct Module Config',
        'fallback': '⚠️ Emergency Fallback',
        'dynamic_import': '📁 การโหลดจาก Config ไฟล์',
        'hardcoded': '⚙️ ค่าเริ่มต้นจากระบบ', 
        'cache': '🗄️ ค่าจากแคช',
        'unknown': '❓ ไม่ทราบแหล่งที่มา'
      }
      return sourceNames[source] || source
    }

    // Helper function สำหรับอธิบาย source
    const getSourceExplanation = (source) => {
      const explanations = {
        'erp_core': 'ดึงจาก ERP_CORE.masterdata (สูงสุด)',
        'loaded_default': 'ดึงจาก /masterdata/supplier/data.js (ปานกลาง) ✅',
        'hardcoded_default': 'ใช้ pattern ที่กำหนดไว้ในระบบ (ต่ำสุด)',
        'module_config': 'เข้าถึง config โดยตรง',
        'fallback': 'ระบบสำรองฉุกเฉิน',
        'dynamic_import': 'โหลดจาก config ไฟล์',
        'hardcoded': 'ค่าเริ่มต้นจากระบบ',
        'cache': 'ค่าจากแคช',
        'unknown': 'ไม่ทราบแหล่งที่มา'
      }
      return explanations[source] || 'ไม่ทราบแหล่งที่มา'
    }
    
    // ✅ Form Data - Complete supplier information
    const formData = reactive({
      // Basic Information
      supplier_code: '',
      name: '',
      supplier_type: 'domestic',
      status: 'active',
      
      // Tax & Business
      tax_id: '',
      business_number: '',
      website: '',
      
      // Contact Information
      contact_person: '',
      phone: '',
      email: '',
      
      // Address Information
      address: '',
      province: '',
      postal_code: '',
      country: 'ไทย',
      
      // Business Terms
      payment_terms: 'net_30',
      credit_limit: 0,
      currency: 'THB',
      lead_time_days: 7,
      
      // Additional Information
      notes: '',
      is_active: true,
      requires_po: true,
      rating: 0,
      
      // System fields
      created_date: new Date(),
      updated_date: new Date(),
      version: 1
    })

    // ✅ Computed Properties
    const canSubmit = computed(() => {
      const hasRequiredFields = !!(formData.supplier_code && formData.supplier_code.trim() && 
                                   formData.name && formData.name.trim())
      const isNotLoading = !loading.value
      
      // Debug logging
      console.log('[SupplierForm] Form validation check:', {
        supplier_code: formData.supplier_code,
        name: formData.name,
        hasRequiredFields,
        isNotLoading,
        errors: errors.value,
        errorCount: Object.keys(errors.value).length,
        finalResult: hasRequiredFields && isNotLoading
      })
      
      return hasRequiredFields && isNotLoading
    })

    const isOriginalType = computed(() => {
      return !originalType.value || originalType.value === formData.supplier_type
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

    // ✅ Utility Methods - รองรับ Module-Specific Code Config
    const generateSupplierCode = async () => {
      try {
        console.log('[Supplier Form] 🔢 Generating supplier code with module-specific config...')
        
        // 🔄 Force clear any existing cache
        if (window.CodeManager?.clearCache) {
          console.log('[Supplier Form] 🗑️ Clearing CodeManager cache...')
          window.CodeManager.clearCache()
        }
        
        // 🔄 Force reload CodeManager patterns
        if (window.CodeManager?.initialize) {
          console.log('[Supplier Form] 🔄 Force reinitializing CodeManager...')
          await window.CodeManager.initialize()
        }
        
        // Strategy 1: ใช้ Module-Specific Code Generator (ใหม่)
        if (window.ERP_CORE?.utils?.generateSupplierCode) {
          console.log('[Supplier Form] 🎯 Using module-specific code generator')
          const code = await window.ERP_CORE.utils.generateSupplierCode('default', {
            supplier_type: formData.supplier_type || 'domestic'
          })
          formData.supplier_code = code
          codeGenerationInfo.value = 'ใช้ Module-Specific Code Generator'
          console.log(`[Supplier Form] ✅ Generated supplier code (module-specific): ${code}`)
          return
        }
        
        // Strategy 2: ใช้ Centralized Code Manager (Auto-fetch)
        if (window.ERP_CORE?.codeManager) {
          console.log('[Supplier Form] 🏢 Using auto-fetch centralized code manager')
          
        // 🔍 Debug: ตรวจสอบ ERP_CORE masterdata
        console.log('[Supplier Form] 🔍 ERP_CORE status:', {
          hasERP_CORE: !!window.ERP_CORE,
          hasMasterdata: !!window.ERP_CORE?.masterdata,
          hasSupplier: !!window.ERP_CORE?.masterdata?.supplier,
          supplierKeys: window.ERP_CORE?.masterdata?.supplier ? Object.keys(window.ERP_CORE.masterdata.supplier) : [],
          hasSupplierConfig: !!window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
        })
        
        if (window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG) {
          const config = window.ERP_CORE.masterdata.supplier.SUPPLIER_CODE_CONFIG
          console.log('[Supplier Form] ✅ Found SUPPLIER_CODE_CONFIG in ERP_CORE:', config)
          console.log('[Supplier Form] 🔍 Prefix:', config.patterns?.default?.prefix)
        } else {
          console.warn('[Supplier Form] ⚠️ SUPPLIER_CODE_CONFIG not found in ERP_CORE.masterdata.supplier')
          console.log('[Supplier Form] 🔍 Available masterdata:', window.ERP_CORE?.masterdata ? Object.keys(window.ERP_CORE.masterdata) : 'none')
        }          // Debug: ตรวจสอบสถานะของ CodeManager
          console.log('[Supplier Form] 🔍 CodeManager debug:', {
            initialized: window.ERP_CORE.codeManager.initialized,
            patternCount: window.ERP_CORE.codeManager.patterns?.size || 0,
            availablePatterns: window.ERP_CORE.codeManager.patterns ? 
              Array.from(window.ERP_CORE.codeManager.patterns.keys()) : []
          })
          
          // ส่ง options เพิ่มเติม - Simple configuration
          const options = {
            cacheMaxAge: 30000, // 30 วินาที
            recordLimit: 500    // จำกัดจำนวนที่ดึงมาเช็ค
          }
          
          console.log('[Supplier Form] 📋 Code generation options:', options)
          
          const code = await window.ERP_CORE.codeManager.generateCode('supplier', null, options)
          
          // ดึงข้อมูล pattern source และรายละเอียด
          const lastGenerated = window.ERP_CORE.codeManager.cache?.get('supplier_last_generated')
          const patternSource = lastGenerated?.source || 'unknown'
          const patternInfo = window.ERP_CORE.codeManager.getPatternForModule('supplier')
          
          formData.supplier_code = code
          lastGenerationSource.value = patternSource // เก็บ source ล่าสุด
          codeGenerationInfo.value = `ใช้ ${getSourceDisplayName(patternSource)} - รหัส: ${code}`
          
          console.log(`[Supplier Form] ✅ Generated supplier code:`, {
            code,
            source: patternSource,
            pattern: patternInfo.pattern,
            configPath: patternInfo.source,
            sourceExplanation: getSourceExplanation(patternSource)
          })
          return
        }
        
        // Strategy 3: ใช้ Module Config โดยตรง
        if (window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG) {
          console.log('[Supplier Form] 📋 Using direct module config')
          const code = await generateFromModuleConfig()
          formData.supplier_code = code
          codeGenerationInfo.value = 'ใช้ Module Configuration โดยตรง'
          console.log(`[Supplier Form] ✅ Generated supplier code (module config): ${code}`)
          return
        }
        
        // Fallback: ใช้ระบบเดิม
        console.warn('[Supplier Form] ⚠️ All advanced methods unavailable, using fallback')
        const currentYear = new Date().getFullYear()
        const timestamp = Date.now().toString().slice(-4)
        formData.supplier_code = `SUP${currentYear}${timestamp}`
        codeGenerationInfo.value = 'ใช้ระบบสำรอง (Fallback)'
        
      } catch (error) {
        console.error('[Supplier Form] ❌ Error generating supplier code:', error)
        
        // Final fallback
        const timestamp = Date.now().toString().slice(-8)
        formData.supplier_code = `SUP${timestamp}`
        codeGenerationInfo.value = 'ใช้ระบบสำรองสุดท้าย (Final Fallback)'
        console.log(`[Supplier Form] 🔄 Using final fallback code: ${formData.supplier_code}`)
      }
    }



    // ✅ สร้างรหัสจาก Module Config โดยตรง (Simple SUP only)
    const generateFromModuleConfig = async () => {
      try {
        const config = window.ERP_CORE.masterdata.supplier.SUPPLIER_CODE_CONFIG
        const pattern = config.patterns.default // ใช้ default pattern เสมอ (SUP)
        
        console.log('[Supplier Form] Using simple SUP pattern')
        
        // สร้างรหัสตาม pattern
        return await buildCodeFromPattern(pattern)
        
      } catch (error) {
        console.error('[Supplier Form] Error generating from module config:', error)
        throw error
      }
    }

    // ✅ สร้างรหัสจาก pattern
    const buildCodeFromPattern = async (pattern) => {
      try {
        const now = new Date()
        let code = ''
        
        // เพิ่ม prefix
        code += pattern.prefix
        
        // เพิ่มปีถ้าจำเป็น
        if (pattern.year) {
          code += now.getFullYear().toString()
        }
        
        // เพิ่มเดือนถ้าจำเป็น
        if (pattern.month) {
          code += String(now.getMonth() + 1).padStart(2, '0')
        }
        
        // คำนวณ sequence number
        const sequence = await calculateNextSequence(pattern)
        code += String(sequence).padStart(pattern.sequence.digits, '0')
        
        return code
        
      } catch (error) {
        console.error('[Supplier Form] Error building code from pattern:', error)
        throw error
      }
    }

    // ✅ คำนวณ sequence number ถัดไป
    const calculateNextSequence = async (pattern) => {
      try {
        // ✅ ดึงรายการ supplier ที่มีอยู่ผ่าน PurchaseService
        const suppliers = await window.ERP_CORE.purchase.getAllSuppliers()
        
        // หา sequence สูงสุดจากรหัสที่มีอยู่
        let maxSequence = 0
        const now = new Date()
        const yearStr = now.getFullYear().toString()
        const monthStr = String(now.getMonth() + 1).padStart(2, '0')
        
        suppliers.forEach(supplier => {
          const code = supplier.supplier_code || ''
          
          // สร้าง regex pattern สำหรับค้นหา
          let regexPattern = `^${pattern.prefix}`
          if (pattern.year) regexPattern += yearStr
          if (pattern.month) regexPattern += monthStr
          regexPattern += `(\\d{${pattern.sequence.digits}})$`
          
          const match = code.match(new RegExp(regexPattern))
          if (match) {
            const sequence = parseInt(match[1], 10)
            if (sequence > maxSequence) {
              maxSequence = sequence
            }
          }
        })
        
        // ตรวจสอบการรีเซ็ต
        if (pattern.sequence.resetOnYearChange && shouldResetSequence(pattern)) {
          maxSequence = 0
        }
        
        return maxSequence + 1
        
      } catch (error) {
        console.error('[Supplier Form] Error calculating sequence:', error)
        return 1
      }
    }

    // ✅ ตรวจสอบว่าควรรีเซ็ต sequence หรือไม่
    const shouldResetSequence = async () => {
      // ✅ ใช้ API แทน localStorage
      const now = new Date()
      const currentYear = now.getFullYear()
      
      try {
        // ดึงข้อมูลจาก system_config ผ่าน API
        const result = await apiRequest.apiCall('/api/system-config/supplier_code_reset_year', 'GET')
        const lastResetYear = result.success && result.data?.value ? parseInt(result.data.value) : 0
        
        if (lastResetYear !== currentYear) {
          // อัปเดตปีใน database
          await apiRequest.apiCall('/api/system-config/supplier_code_reset_year', 'POST', {
            value: currentYear.toString()
          })
          return true
        }
        
        return false
      } catch (error) {
        console.warn('[Supplier Form] ⚠️ Failed to check reset year from API, using current year:', error)
        // Fallback: ถือว่าไม่ต้อง reset
        return false
      }
    }

    // ✅ จัดการเมื่อเปลี่ยน type
    const onTypeChange = async () => {
      console.log('[Supplier Form] Type changed to:', formData.supplier_type)
      
      // อัปเดตตัวอย่างรหัส
      await updateCodePreview()
      
      // ถ้าใช้ type-based code และกำลังสร้างใหม่
      if (props.mode === 'create') {
        console.log('[Supplier Form] Auto-generating new code for type change')
        await generateSupplierCode()
      }
    }

    // ✅ อัปเดตตัวอย่างรหัส
    const updateCodePreview = async () => {
      try {
        const config = window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
        if (!config) {
          codePreview.value = ''
          return
        }

        const useTypeBasedCodes = config.settings?.useTypeBasedCodes || false
        let pattern

        if (useTypeBasedCodes && formData.supplier_type && config.patterns.byType?.[formData.supplier_type]) {
          pattern = config.patterns.byType[formData.supplier_type]
          console.log(`[Supplier Form] Using type-based pattern for: ${formData.supplier_type}`)
        } else {
          pattern = config.patterns.default
          console.log('[Supplier Form] Using default pattern')
        }

        // สร้างตัวอย่าง
        const now = new Date()
        let preview = pattern.prefix
        
        if (pattern.year) {
          preview += now.getFullYear().toString()
        }
        
        if (pattern.month) {
          preview += String(now.getMonth() + 1).padStart(2, '0')
        }
        
        preview += '0'.repeat(pattern.sequence.digits - 1) + '1' // ตัวอย่าง sequence = 1
        
        codePreview.value = preview
        
        // อัปเดตข้อมูลการตั้งค่า
        if (codeGenerationInfo.value === '') {
          if (useTypeBasedCodes && formData.supplier_type && config.patterns.byType?.[formData.supplier_type]) {
            codeGenerationInfo.value = `รองรับรหัสตามประเภท: ${formData.supplier_type}`
          } else {
            codeGenerationInfo.value = 'ใช้รูปแบบมาตรฐาน'
          }
        }
        
      } catch (error) {
        console.warn('[Supplier Form] Error updating code preview:', error)
        codeGenerationInfo.value = ''
        codePreview.value = ''
      }
    }

    // ✅ แสดงการตั้งค่า Code Configuration
    const showCodeConfig = () => {
      try {
        console.log('[Supplier Form] 🔍 Checking available code configurations...')
        
        // เช็ค CodeManager patterns
        const codeManager = window.ERP_CORE?.codeManager
        const hasCodeManager = codeManager && codeManager.patterns?.has('supplier')
        
        // เช็ค ERP_CORE masterdata config
        const config = window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
        const hasDirectConfig = !!config
        
        console.log('[Supplier Form] Config availability:', {
          codeManager: hasCodeManager,
          directConfig: hasDirectConfig,
          totalPatterns: codeManager?.patterns?.size || 0
        })
        
        if (!hasCodeManager && !hasDirectConfig) {
          codeGenerationInfo.value = 'ไม่พบการตั้งค่า Code Configuration'
          if (window.$toast) {
            window.$toast.warning('ไม่พบการตั้งค่า Code Configuration สำหรับ Supplier')
          }
          return
        }

        // แสดงข้อมูลจาก CodeManager ก่อน (prioritize)
        if (hasCodeManager) {
          const managerPattern = codeManager.patterns.get('supplier')
          codeGenerationInfo.value = `ใช้ Centralized Code Manager: ${managerPattern.pattern || managerPattern.format || 'N/A'}`
          
          const managerDetails = [
            `แหล่งที่มา: Centralized Code Manager`,
            `รูปแบบ: ${managerPattern.pattern || managerPattern.format || 'N/A'}`,
            `โมดูล: ${managerPattern.module || 'supplier'}`,
            `สถานะ: ${managerPattern.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`,
            `ตัวอย่าง: ${managerPattern.example || codePreview.value}`
          ]
          
          if (window.$toast) {
            window.$toast.info(managerDetails.join('\n'))
          }
          return
        }
        
        // แสดงข้อมูลจาก direct config
        if (hasDirectConfig) {
          const pattern = config.patterns.default
          codeGenerationInfo.value = `ใช้รูปแบบ SUP: ${pattern.format.replace(/\{(\w+)\}/g, '[$1]')}`

          // แสดงรายละเอียดใน toast
          const details = [
            `แหล่งที่มา: ERP_CORE Masterdata`,
            `รูปแบบ: ${pattern.format}`,
            `จำนวนหลัก: ${pattern.sequence.digits}`,
            `รีเซ็ตรายปี: ${pattern.sequence.resetOnYearChange ? 'ใช่' : 'ไม่'}`,
            `ตัวอย่าง: ${codePreview.value}`
          ].join('\n')

          if (window.$toast) {
            window.$toast.info(`การตั้งค่ารหัสผู้ขาย:\n${details}`)
          } else {
            alert(`การตั้งค่ารหัสผู้ขาย:\n${details}`)
          }
        }

      } catch (error) {
        console.error('[Supplier Form] Error showing code config:', error)
        codeGenerationInfo.value = 'เกิดข้อผิดพลาดในการแสดงการตั้งค่า'
      }
    }

    const setRating = (rating) => {
      formData.rating = rating
    }

    const getRatingText = (rating) => {
      const texts = {
        0: 'ยังไม่ได้ประเมิน',
        1: 'แย่',
        2: 'พอใช้',
        3: 'ปานกลาง', 
        4: 'ดี',
        5: 'ดีเยี่ยม'
      }
      return texts[rating] || 'ยังไม่ได้ประเมิน'
    }

    // ✅ Validate Supplier Type - แก้ไขค่า type ที่ไม่ถูกต้อง
    const validateSupplierType = (type) => {
      console.log('[Supplier Form] validateSupplierType input:', type, typeof type)
      
      const validTypes = ['domestic', 'international', 'manufacturer', 'distributor', 'wholesaler', 'retailer', 'service', 'contractor', 'individual', 'government']
      
      // ตรวจสอบว่าค่าที่ได้มาเป็น null, undefined หรือ empty string
      if (!type || type === '' || type === null || type === undefined) {
        console.log('[Supplier Form] 🔧 Empty/null type detected, using default: domestic')
        return 'domestic'
      }
      
      // ถ้าค่าที่ได้มาถูกต้องแล้ว ให้คืนค่าเดิม
      if (validTypes.includes(type)) {
        console.log('[Supplier Form] ✅ Valid type:', type)
        return type
      }
      
      // แก้ไขค่าที่ผิด
      const typeMapping = {
        'supplier': 'domestic',     // แก้ไข "supplier" เป็น "domestic"
        'vendor': 'domestic',       // แก้ไข "vendor" เป็น "domestic"  
        'company': 'domestic',      // แก้ไข "company" เป็น "domestic"
        'business': 'domestic',     // แก้ไข "business" เป็น "domestic"
        'local': 'domestic',        // แก้ไข "local" เป็น "domestic"
        'foreign': 'international', // แก้ไข "foreign" เป็น "international"
        'overseas': 'international' // แก้ไข "overseas" เป็น "international"
      }
      
      const correctedType = typeMapping[type] || 'domestic'
      
      console.log(`[Supplier Form] 🔧 Corrected supplier type: "${type}" → "${correctedType}"`)
      
      return correctedType
    }

    // ✅ Load existing data for edit mode
    const loadData = async () => {
      if (props.mode !== 'edit' || !props.recordId) {
        console.log('[Supplier Form] Skip loading - mode:', props.mode, 'recordId:', props.recordId)
        return
      }

      loading.value = true
      error.value = null

      try {
        console.log('[Supplier Form] 🔍 Loading data for ID:', props.recordId)
        
        // ตรวจสอบ ERP_CORE engine
        if (!window.ERP_CORE || !window.ERP_CORE.engine) {
          throw new Error('ERP_CORE engine not available')
        }

        const result = await window.ERP_CORE.engine.read('supplier', props.recordId)
        
        console.log('[Supplier Form] 📊 Raw result:', result)
        
        if (result.success && result.data) {
          console.log('[Supplier Form] ✅ Successfully loaded data:', result.data)
          
          // 🔧 Map ข้อมูลทั้งหมดเข้า form - รองรับทั้ง snake_case และ camelCase
          const loadedData = {
            supplier_code: result.data.supplier_code || result.data.supplierCode || '',
            name: result.data.name || '',
            supplier_type: validateSupplierType(result.data.supplier_type || result.data.type) || 'domestic',
            status: result.data.status || 'active',
            tax_id: result.data.tax_id || result.data.taxId || '',
            business_number: result.data.business_number || result.data.businessNumber || '',
            website: result.data.website || '',
            contact_person: result.data.contact_person || result.data.contactPerson || '',
            phone: result.data.phone || '',
            email: result.data.email || '',
            address: result.data.address || '',
            province: result.data.province || '',
            postal_code: result.data.postal_code || result.data.postalCode || '',
            country: result.data.country || 'ไทย',
            payment_terms: result.data.payment_terms || result.data.paymentTerms || 'net_30',
            credit_limit: result.data.credit_limit || result.data.creditLimit || 0,
            currency: result.data.currency || 'THB',
            lead_time_days: result.data.lead_time_days || result.data.leadTimeDays || 7,
            notes: result.data.notes || '',
            is_active: result.data.is_active !== undefined ? result.data.is_active : (result.data.isActive !== undefined ? result.data.isActive : true),
            requires_po: result.data.requires_po !== undefined ? result.data.requires_po : (result.data.requiresPo !== undefined ? result.data.requiresPo : true),
            rating: result.data.rating || 0,
            created_date: result.data.created_date || result.data.createdDate || new Date(),
            updated_date: new Date(),
            version: result.data.version || 1
          }

          console.log('[Supplier Form] 🎯 Mapped data:', loadedData)
          
          // เช็คและแจ้งเตือนถ้า type ถูกแก้ไข
          originalType.value = result.data.type // เก็บค่าเดิม
          if (result.data.type && result.data.type !== loadedData.type) {
            console.warn(`[Supplier Form] ⚠️ Type corrected: "${result.data.type}" → "${loadedData.type}"`)
            if (window.$toast) {
              window.$toast.warning(`ประเภทผู้ขายถูกแก้ไขจาก "${result.data.type}" เป็น "${loadedData.type}"`)
            }
          }
          
          // Clear form และ assign ข้อมูลใหม่
          Object.keys(formData).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(loadedData, key)) {
              formData[key] = loadedData[key]
            }
          })
          
          console.log('[Supplier Form] 📝 Form data after assignment:', { ...formData })
          
          // แสดง success message
          successMessage.value = 'โหลดข้อมูลเรียบร้อยแล้ว'
          
        } else {
          console.error('[Supplier Form] ❌ Failed to load data:', result)
          throw new Error(result.message || result.error || 'ไม่พบข้อมูลผู้ขาย')
        }
      } catch (err) {
        console.error('[Supplier Form] 💥 Load error:', err)
        error.value = 'ไม่สามารถโหลดข้อมูลผู้ขายได้: ' + err.message
        
        // แสดง error toast
        if (window.$toast) {
          window.$toast.error(error.value)
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Submit Form
    const submitForm = async () => {
      console.log('[Supplier Form] 📤 Submit button clicked!')
      console.log('[Supplier Form] Submitting form:', { mode: props.mode, data: formData })
      
      // Clear previous messages
      error.value = null
      successMessage.value = null
      errors.value = {}
      
      // Validate required fields first
      if (!formData.supplier_code || !formData.supplier_code.trim()) {
        errors.value.supplier_code = 'กรุณาระบุรหัสผู้ขาย'
        error.value = 'กรุณากรอกข้อมูลที่จำเป็น'
        console.log('❌ Missing supplier_code')
        return
      }
      
      if (!formData.name || !formData.name.trim()) {
        errors.value.name = 'กรุณาระบุชื่อผู้ขาย'
        error.value = 'กรุณากรอกข้อมูลที่จำเป็น'
        console.log('❌ Missing name')
        return
      }
      
      // Validate all fields
      validateTaxId()
      validatePhone()
      validateEmail()
      
      // Check for validation errors
      if (Object.keys(errors.value).some(key => errors.value[key])) {
        error.value = 'กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง'
        console.log('❌ Validation errors:', errors.value)
        return
      }
      
      console.log('✅ Form validation passed, proceeding to save...')
      loading.value = true

      try {
        // Debug log ก่อนเตรียมข้อมูล
        console.log('[Supplier Form] Raw formData.supplier_type:', formData.supplier_type)
        console.log('[Supplier Form] Full formData:', JSON.stringify(formData, null, 2))
        
        // Prepare clean data
        const validatedType = validateSupplierType(formData.supplier_type)
        console.log('[Supplier Form] Validated type:', validatedType)
        
        const submitData = {
          supplier_code: formData.supplier_code.trim(),
          name: formData.name.trim(),
          type: validatedType, // แก้ไข type ให้ถูกต้อง
          status: formData.status,
          tax_id: formData.tax_id ? formData.tax_id.trim() : '',
          business_number: formData.business_number ? formData.business_number.trim() : '',
          website: formData.website ? formData.website.trim() : '',
          contact_person: formData.contact_person ? formData.contact_person.trim() : '',
          phone: formData.phone ? formData.phone.trim() : '',
          email: formData.email ? formData.email.trim() : '',
          address: formData.address ? formData.address.trim() : '',
          province: formData.province ? formData.province.trim() : '',
          postal_code: formData.postal_code ? formData.postal_code.trim() : '',
          country: formData.country ? formData.country.trim() : 'ไทย',
          payment_terms: formData.payment_terms,
          credit_limit: formData.credit_limit || 0,
          currency: formData.currency || 'THB',
          lead_time_days: formData.lead_time_days || 7,
          notes: formData.notes ? formData.notes.trim() : '',
          is_active: formData.is_active,
          requires_po: formData.requires_po,
          rating: formData.rating || 0
        }

        // Basic validation
        if (!submitData.supplier_code) {
          throw new Error('กรุณาระบุรหัสผู้ขาย')
        }
        
        if (!submitData.name) {
          throw new Error('กรุณาระบุชื่อผู้ขาย')
        }

        console.log('[Supplier Form] Submit data prepared:', submitData)

        // ตรวจสอบ schema ที่ Transaction Engine ใช้
        if (window.ERP_CORE.engine.getSchema) {
          const currentSchema = window.ERP_CORE.engine.getSchema('supplier')
          console.log('[Supplier Form] Current supplier schema:', currentSchema)
        }

        // บังคับอัปเดต schema ก่อนส่งข้อมูล (workaround)
        if (window.ERP_CORE.engine.updateSchema) {
          const supplierSchema = {
            // Basic Information - snake_case fields
            supplier_code: { type: 'string', required: true, maxLength: 20 },
            name: { type: 'string', required: true, maxLength: 200 },
            supplier_type: { type: 'string', required: false, enum: ['domestic', 'international', 'manufacturer', 'distributor', 'wholesaler', 'retailer', 'service', 'contractor', 'individual', 'government'], default: 'domestic' },
            status: { type: 'string', required: false, enum: ['active', 'inactive', 'pending', 'suspended', 'blocked', 'blacklisted'], default: 'active' },
            
            // Contact Information
            tax_id: { type: 'string', required: false, maxLength: 13 },
            business_number: { type: 'string', required: false, maxLength: 20 },
            contact_person: { type: 'string', required: false, maxLength: 100 },
            phone: { type: 'string', required: false, maxLength: 20 },
            email: { type: 'string', required: false, maxLength: 100 },
            website: { type: 'string', required: false, maxLength: 200 },
            
            // Address Information
            address: { type: 'string', required: false, maxLength: 500 },
            province: { type: 'string', required: false, maxLength: 50 },
            postal_code: { type: 'string', required: false, maxLength: 10 },
            country: { type: 'string', required: false, maxLength: 50, default: 'ไทย' },
            
            // Business Terms
            payment_terms: { type: 'string', required: false, enum: ['cod', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'advance', 'installment'], default: 'net_30' },
            credit_limit: { type: 'number', required: false, default: 0 },
            currency: { type: 'string', required: false, default: 'THB' },
            lead_time_days: { type: 'number', required: false, default: 7 },
            requires_po: { type: 'boolean', required: false, default: true },
            
            // System Fields
            rating: { type: 'number', required: false, default: 0 },
            is_active: { type: 'boolean', required: false, default: true },
            notes: { type: 'string', required: false, maxLength: 1000 },
            
            // Timestamps
            created_date: { type: 'date', required: false, default: () => new Date() },
            updated_date: { type: 'date', required: false, default: () => new Date() },
            version: { type: 'number', required: false, default: 1 }
          }
          
          window.ERP_CORE.engine.updateSchema('supplier', supplierSchema)
          console.log('[Supplier Form] 🔄 Force updated supplier schema')
        }

        let result
        if (props.mode === 'edit' && props.recordId) {
          // ✅ อัปเดต supplier ผ่าน PurchaseService
          result = await window.ERP_CORE.purchase.updateSupplier(props.recordId, submitData)
        } else {
          // ✅ สร้าง supplier ใหม่ผ่าน PurchaseService
          result = await window.ERP_CORE.purchase.createSupplier(submitData)
        }

        console.log('[Supplier Form] Submit result:', result)

        if (result.success) {
          successMessage.value = props.mode === 'edit' 
            ? 'อัปเดตข้อมูลผู้ขายเรียบร้อยแล้ว' 
            : 'เพิ่มผู้ขายเรียบร้อยแล้ว'
          
          // ⭐ Invalidate cache หลังบันทึกสำเร็จ
          if (window.ERP_CORE?.codeManager?.invalidateRecordsCache) {
            const reason = props.mode === 'edit' ? 'supplier_updated' : 'supplier_created'
            window.ERP_CORE.codeManager.invalidateRecordsCache('supplier', reason)
            console.log(`[Supplier Form] 🔄 Invalidated supplier records cache (${reason})`)
          }
          
          // Show success toast
          if (window.$toast) {
            window.$toast.success(successMessage.value)
          }

          // Emit success event
          emit('saved', {
            success: true,
            data: result.data,
            mode: props.mode,
            status: 'success'
          })
        } else {
          throw new Error(result.message || 'ไม่สามารถบันทึกข้อมูลได้')
        }
      } catch (err) {
        console.error('[Supplier Form] Submit error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        
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
          supplier_code: formData.supplier_code.trim() || `DRAFT_${Date.now()}`,
          name: formData.name.trim() || 'ร่างผู้ขาย',
          type: formData.type,
          status: 'pending',
          ...Object.fromEntries(
            Object.entries(formData).filter(([, value]) => 
              value !== '' && value !== null && value !== undefined
            )
          )
        }

        let result
        if (props.mode === 'edit' && props.recordId) {
          // ✅ อัปเดต supplier draft ผ่าน PurchaseService  
          result = await window.ERP_CORE.purchase.updateSupplier(props.recordId, draftData)
        } else {
          // ✅ สร้าง supplier draft ผ่าน PurchaseService
          result = await window.ERP_CORE.purchase.createSupplier(draftData)
        }

        if (result.success) {
          successMessage.value = 'บันทึกร่างเรียบร้อยแล้ว'
          
          // ⭐ Invalidate cache หลังบันทึกร่างสำเร็จ
          if (window.ERP_CORE?.codeManager?.invalidateRecordsCache) {
            window.ERP_CORE.codeManager.invalidateRecordsCache('supplier', 'draft_saved')
            console.log('[Supplier Form] 🔄 Invalidated supplier records cache (draft_saved)')
          }
          
          if (window.$toast) {
            window.$toast.success(successMessage.value)
          }
          
          emit('saved', {
            success: true,
            data: result.data,
            mode: props.mode,
            status: 'draft'
          })
        }
      } catch (err) {
        error.value = 'ไม่สามารถบันทึกร่างได้: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // ✅ Cancel handler  
    const handleCancel = () => {
      console.log('[Supplier Form] Cancelled')
      emit('cancel')
    }
    
    // ✅ Debug Form State
    const debugFormState = () => {
      console.log('🐛 [SupplierForm Debug] Current Form State:')
      console.log('📝 Form Data:', JSON.stringify(formData, null, 2))
      console.log('❌ Errors:', JSON.stringify(errors.value, null, 2))
      console.log('✅ Can Submit:', canSubmit.value)
      console.log('💾 Is Loading:', loading.value)
      
      // Check each required field
      console.log('📋 Field Validation:')
      console.log('  Supplier Code:', formData.supplier_code, '(length:', formData.supplier_code?.length, ')')
      console.log('  Name:', formData.name, '(length:', formData.name?.length, ')')
      
      // Check validation state
      console.log('🔍 Validation State:')
      console.log('  Has Supplier Code:', !!(formData.supplier_code && formData.supplier_code.trim()))
      console.log('  Has Name:', !!(formData.name && formData.name.trim()))
      console.log('  No Errors:', Object.keys(errors.value).length === 0)
      console.log('  Error Count:', Object.keys(errors.value).length)
      console.log('  Not Loading:', !loading.value)
      
      // Show button state
      const buttonDisabled = loading.value || !canSubmit.value
      console.log('🔘 Button State:')
      console.log('  Should be Disabled:', buttonDisabled)
      console.log('  Reason:', loading.value ? 'Currently Loading' : !canSubmit.value ? 'Cannot Submit' : 'Should be Enabled')
      
      // Show in toast for user
      if (window.$toast) {
        const status = buttonDisabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'
        const reason = loading.value ? 'กำลังบันทึก' : !canSubmit.value ? 'ข้อมูลไม่ครบ' : 'พร้อมใช้งาน'
        window.$toast.info(`ปุ่มบันทึก: ${status} (${reason})`)
      }
      
      // Check specific issues
      if (!formData.supplier_code || !formData.supplier_code.trim()) {
        console.warn('⚠️ Missing supplier_code')
        if (window.$toast) {
          window.$toast.warning('ขาดรหัสผู้ขาย (supplier_code)')
        }
      }
      
      if (!formData.name || !formData.name.trim()) {
        console.warn('⚠️ Missing name')
        if (window.$toast) {
          window.$toast.warning('ขาดชื่อผู้ขาย (name)')
        }
      }
      
      if (Object.keys(errors.value).length > 0) {
        console.warn('⚠️ Has validation errors:', errors.value)
        if (window.$toast) {
          window.$toast.warning('มี validation errors: ' + Object.keys(errors.value).join(', '))
        }
      }
    }

    // ✅ Lifecycle
    onMounted(async () => {
      console.log('[Supplier Form] 🚀 Component mounted with props:', props)
      console.log('[Supplier Form] 📋 Initial form data:', { ...formData })
      
      await nextTick()
      
      // อัปเดตตัวอย่างรหัสเริ่มต้น
      await updateCodePreview()
      
      if (props.mode === 'edit') {
        console.log('[Supplier Form] 📝 Edit mode detected, loading data...')
        await loadData()
        // อัปเดตตัวอย่างรหัสอีกครั้งหลังโหลดข้อมูล
        await updateCodePreview()
      } else {
        console.log('[Supplier Form] ➕ Create mode detected, generating code...')
        await generateSupplierCode()
      }
      
      console.log('[Supplier Form] 🏁 Mount process completed, final form data:', { ...formData })
    })
    
    // ✅ Watch form fields for real-time validation
    watch([
      () => formData.supplier_code,
      () => formData.name,
      () => formData.tax_id,
      () => formData.phone,
      () => formData.email
    ], () => {
      // Clear errors for fields that are now valid
      const newErrors = { ...errors.value }
      
      if (formData.supplier_code && formData.supplier_code.trim()) {
        delete newErrors.supplier_code
      }
      
      if (formData.name && formData.name.trim()) {
        delete newErrors.name
      }
      
      if (!formData.tax_id || (formData.tax_id.length === 13 && /^\d{13}$/.test(formData.tax_id))) {
        delete newErrors.tax_id
      }
      
      if (!formData.phone || /^[\d\s\-+()]+$/.test(formData.phone)) {
        delete newErrors.phone
      }
      
      if (!formData.email || isValidEmail(formData.email)) {
        delete newErrors.email
      }
      
      errors.value = newErrors
    })

    return {
      loading,
      error,
      successMessage,
      errors,
      formData,
      codePreview,
      codeGenerationInfo,
      lastGenerationSource,
      canSubmit,
      isOriginalType,
      submitForm,
      saveDraft,
      handleCancel,
      debugFormState,
      generateSupplierCode,
      showCodeConfig,
      onTypeChange,
      updateCodePreview,
      setRating,
      getRatingText,
      validateTaxId,
      validatePhone,
      validateEmail,
      isValidEmail,
      getSourceDisplayName,
      getSourceExplanation
    }
  }
}
</script>

<style scoped>
.supplier-form-complete {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.complete-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Form Sections */
.form-section {
  padding: 30px;
  border-bottom: 1px solid #e2e8f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.section-title i {
  color: #4299e1;
  font-size: 18px;
}

.section-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* Form Elements */
.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Input Groups */
.input-group {
  display: flex;
  align-items: stretch;
}

.input-group .form-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.btn-generate {
  padding: 12px 16px;
  background: #4299e1;
  color: white;
  border: 2px solid #4299e1;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover {
  background: #3182ce;
  border-color: #3182ce;
}

.btn-config {
  padding: 12px 16px;
  background: #38a169;
  color: white;
  border: 2px solid #38a169;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  border-left: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-config:hover {
  background: #2f855a;
  border-color: #2f855a;
}

.input-suffix {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-left: none;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  color: #718096;
  font-size: 14px;
}

/* Messages */
.error-message {
  color: #e53e3e;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.success-message {
  color: #38a169;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.code-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  font-size: 12px;
  color: #1a365d;
  margin-top: 4px;
}

.code-preview i {
  color: #3182ce;
}

.code-preview code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2d3748;
}

.code-info {
  margin-top: 8px;
}

.code-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #4a5568;
}

.code-info-item i {
  color: #4299e1;
  font-size: 11px;
}

.character-count {
  font-size: 12px;
  color: #718096;
  text-align: right;
}

/* Checkbox Groups */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #4299e1;
}

.checkbox-label {
  font-size: 14px;
  color: #4a5568;
}

/* Rating Stars */
.rating-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #cbd5e0;
  cursor: pointer;
  transition: color 0.2s;
  padding: 2px;
}

.star-button:hover,
.star-button.active {
  color: #f6d55c;
}

.rating-text {
  font-size: 14px;
  color: #718096;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 30px;
}

.alert-error {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  color: #2f855a;
}

.alert-warning {
  background: #fef5e7;
  border: 1px solid #f6e05e;
  color: #d69e2e;
}

.alert i {
  font-size: 20px;
  margin-top: 2px;
}

.alert div {
  flex: 1;
}

.alert strong {
  display: block;
  margin-bottom: 4px;
}

.alert p {
  margin: 0;
  font-size: 14px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  padding: 30px;
}

.loading-spinner {
  font-size: 30px;
  color: #4299e1;
  margin-bottom: 15px;
}

.loading-content p {
  color: #4a5568;
  font-size: 16px;
  margin: 0;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
}

.form-actions .flex {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
  border-color: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border-color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
  border-color: #cbd5e0;
}

.btn-outline {
  background: white;
  color: #4299e1;
  border-color: #4299e1;
}

.btn-outline:hover:not(:disabled) {
  background: #4299e1;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .supplier-form-complete {
    padding: 10px;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    padding: 20px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* ปรับปุ่มในกลุ่ม input-group */
  .input-group {
    flex-wrap: wrap;
  }
  
  .input-group .form-input {
    border-radius: 8px;
    border-right: 2px solid #e2e8f0;
    margin-bottom: 8px;
  }
  
  .btn-generate,
  .btn-config {
    border-radius: 8px;
    margin-right: 8px;
    min-width: 44px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 15px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .form-grid {
    gap: 15px;
  }
}
</style>