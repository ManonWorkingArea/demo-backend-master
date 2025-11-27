<template>
  <!-- FileBrowser Component for Image Fields - Using Teleport to avoid z-index issues -->
  <Teleport to="body">
    <FileBrowser 
      v-if="fileBrowserOpen" 
      :isWindowsOpen="true" 
      :callbackFunction="currentImageFieldKey"
      :allowFileType="['jpg','gif','png','jpeg','webp','svg']" 
      @file-browser-trigger="changeFileTrigger" 
      @file-browser-callback="selectFileTrigger"
      style="z-index: 9999 !important;"
    />
  </Teleport>

  <!-- Custom Fields Section -->
  <div v-if="fieldConfig.length > 0" class="mt-4 p-3 border border-gray-200 rounded-lg bg-white">
    <h4 class="text-sm font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">
      ฟิลด์เพิ่มเติม
    </h4>
    
    <!-- Render fields in order without showing order numbers -->
    <div v-for="field in fieldConfig" :key="field.key" class="mb-3">
      <!-- Input Field -->
      <div v-if="field.type === 'input'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-1">*</span>
        </label>
        <input 
          :value="customData[field.key] || ''"
          @input="updateField(field.key, $event.target.value)"
          type="text" 
          :placeholder="field.label"
          :class="getFieldClass(field)"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <small v-if="getFieldError(field)" class="text-red-600 text-xs mt-1 block">
          {{ getFieldError(field) }}
        </small>
      </div>

      <!-- Textarea Field -->
      <div v-if="field.type === 'textarea'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-1">*</span>
        </label>
        <textarea 
          :value="customData[field.key] || ''"
          @input="updateField(field.key, $event.target.value)"
          rows="3"
          :placeholder="field.label"
          :class="getFieldClass(field)"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        ></textarea>
        <small v-if="getFieldError(field)" class="text-red-600 text-xs mt-1 block">
          {{ getFieldError(field) }}
        </small>
      </div>

      <!-- Select Field -->
      <div v-if="field.type === 'select'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-1">*</span>
        </label>
        <select 
          :value="customData[field.key] || ''"
          @change="updateField(field.key, $event.target.value)"
          :class="getFieldClass(field)"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- เลือก {{ field.label }} --</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <small v-if="getFieldError(field)" class="text-red-600 text-xs mt-1 block">
          {{ getFieldError(field) }}
        </small>
      </div>

      <!-- Status Field -->
      <div v-if="field.type === 'status'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-1">*</span>
        </label>
        
        <div class="flex gap-4 flex-wrap">
          <!-- True Option -->
          <label class="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors border border-gray-200">
            <input 
              :checked="customData[field.key] === true || customData[field.key] === 'true'"
              @change="updateField(field.key, true)"
              :name="`status_${field.key}`"
              type="radio" 
              value="true"
              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 mr-2"
            />
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-check text-xs mr-1"></i>
              เปิดใช้งาน
            </span>
          </label>
          
          <!-- False Option -->
          <label class="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors border border-gray-200">
            <input 
              :checked="customData[field.key] === false || customData[field.key] === 'false'"
              @change="updateField(field.key, false)"
              :name="`status_${field.key}`"
              type="radio" 
              value="false"
              class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-2"
            />
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <i class="fas fa-times text-xs mr-1"></i>
              ปิดใช้งาน
            </span>
          </label>
          
          <!-- Clear/Reset Option (if not required) -->
          <label v-if="!field.required" class="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors border border-gray-200">
            <input 
              :checked="customData[field.key] === null || customData[field.key] === undefined || customData[field.key] === ''"
              @change="updateField(field.key, null)"
              :name="`status_${field.key}`"
              type="radio" 
              value=""
              class="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500 mr-2"
            />
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <i class="fas fa-minus text-xs mr-1"></i>
              ไม่ระบุ
            </span>
          </label>
        </div>
        
        <small v-if="getFieldError(field)" class="text-red-600 text-xs mt-2 block">
          {{ getFieldError(field) }}
        </small>
      </div>

      <!-- Image Field -->
      <div v-if="field.type === 'image'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-1">*</span>
          <span v-if="field.unique" class="text-orange-600 ml-1 text-xs">(ไม่ซ้ำ)</span>
        </label>
        
        <!-- File Browser Button -->
        <button 
          @click="openImageFileBrowser(field.key)"
          type="button"
          :style="{ 'background-image': customData[field.key] ? `url(${customData[field.key]})` : 'none' }" 
          :class="getFieldClass(field)"
          class="relative bg-cover bg-center block w-full border-2 border-dashed border-gray-300 hover:border-gray-400 focus:outline-none focus:border-blue-500 rounded-md p-6 text-center"
          style="min-height: 100px;">
          <div class="bg-white/90 p-2 rounded">
            <div class="text-gray-500 mb-1">
              <i class="fas fa-image text-xl"></i>
            </div>
            <span class="text-sm text-gray-600">
              {{ customData[field.key] ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ' }}
            </span>
          </div>
        </button>
        
        <!-- Manual URL Input (Optional) -->
        <details class="mt-2">
          <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            กรอก URL ด้วยตนเอง
          </summary>
          <input 
            :value="customData[field.key] || ''"
            @input="updateField(field.key, $event.target.value)"
            type="text" 
            placeholder="https://example.com/image.jpg"
            :class="getFieldClass(field)"
            class="w-full px-3 py-2 mt-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </details>
        
        <!-- Clear Image Button -->
        <button 
          v-if="customData[field.key]"
          @click="clearImageField(field.key)"
          type="button"
          class="mt-2 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200">
          ลบรูปภาพ
        </button>
        
        <small v-if="getFieldError(field)" class="text-red-600 text-xs mt-1 block">
          {{ getFieldError(field) }}
        </small>
      </div>
    </div>

    <!-- Validation Summary -->
    <div v-if="hasValidationErrors" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
      <div class="text-red-800 font-medium mb-1">กรุณาแก้ไขข้อผิดพลาด:</div>
      <ul class="text-red-700 text-xs space-y-0.5 ml-3">
        <li v-for="error in validationErrors" :key="error.field">
          • {{ error.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import FileBrowser from '@/interface/modal/FileBrowser.vue'

export default {
  name: 'CustomFieldRenderer',
  
  components: {
    FileBrowser
  },

  props: {
    fieldConfig: {
      type: Array,
      default: () => []
    },
    customData: {
      type: Object,
      default: () => ({})
    },
    showValidation: {
      type: Boolean,
      default: false
    },
    // Data for unique validation
    existingTerms: {
      type: Array,
      default: () => []
    },
    currentTermId: {
      type: [String, Number],
      default: null
    },
    taxonomyGroupId: {
      type: [String, Number],
      default: null
    }
  },

  emits: ['update:customData', 'validation-change'],

  setup(props, { emit }) {
    const fieldErrors = ref({})
    const fileBrowserOpen = ref(false)
    const currentImageFieldKey = ref('')

    const validationErrors = computed(() => {
      const errors = []
      
      props.fieldConfig.forEach(field => {
        const value = props.customData[field.key]
        
        // Required field validation
        if (field.required) {
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push({
              field: field.key,
              message: `${field.label} เป็นฟิลด์บังคับ`
            })
          }
        }
        
        // Unique field validation
        if (field.unique && value && (typeof value === 'string' ? value.trim() : value)) {
          const isDuplicate = checkFieldUniqueness(field.key, value)
          if (isDuplicate) {
            errors.push({
              field: field.key,
              message: `${field.label} ซ้ำกัน กรุณาใช้ข้อมูลอื่น`
            })
          }
        }
      })
      
      return errors
    })

    const hasValidationErrors = computed(() => {
      return props.showValidation && validationErrors.value.length > 0
    })

    const updateField = (key, value) => {
      const updatedData = { ...props.customData, [key]: value }
      emit('update:customData', updatedData)
      
      // Clear field error when user starts typing
      if (fieldErrors.value[key]) {
        fieldErrors.value = { ...fieldErrors.value, [key]: null }
      }
    }

    const getFieldClass = (field) => {
      if (props.showValidation) {
        const value = props.customData[field.key]
        
        // Check required field validation
        if (field.required) {
          // For status fields, check if value is null/undefined
          if (field.type === 'status' && (value === null || value === undefined || value === '')) {
            return 'error-field'
          }
          // For other fields, check if empty
          else if (field.type !== 'status' && (!value || (typeof value === 'string' && !value.trim()))) {
            return 'error-field'
          }
        }
        
        // Check unique field validation
        if (field.unique && value && (typeof value === 'string' ? value.trim() : value)) {
          const isDuplicate = checkFieldUniqueness(field.key, value)
          if (isDuplicate) {
            return 'error-field'
          }
        }
      }
      return ''
    }

    const getFieldError = (field) => {
      if (props.showValidation) {
        const value = props.customData[field.key]
        
        // Check required field validation first
        if (field.required) {
          // For status fields, check if value is null/undefined
          if (field.type === 'status' && (value === null || value === undefined || value === '')) {
            return `${field.label} เป็นฟิลด์บังคับ กรุณาเลือกตัวเลือก`
          }
          // For other fields, check if empty
          else if (field.type !== 'status' && (!value || (typeof value === 'string' && !value.trim()))) {
            return `${field.label} เป็นฟิลด์บังคับ`
          }
        }
        
        // Check unique field validation
        if (field.unique && value && (typeof value === 'string' ? value.trim() : value)) {
          const isDuplicate = checkFieldUniqueness(field.key, value)
          if (isDuplicate) {
            return `${field.label} ซ้ำกัน กรุณาใช้ข้อมูลอื่น`
          }
        }
      }
      return null
    }

    const isValidImageUrl = (url) => {
      if (!url) return false
      // Simple URL validation for images
      return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url) || 
             url.startsWith('http') || 
             url.startsWith('data:image')
    }

    const onImageError = (event) => {
      console.warn('Failed to load image:', event.target.src)
      // Optionally hide broken image
      event.target.style.display = 'none'
    }

    const checkFieldUniqueness = (fieldKey, value) => {
      if (!props.existingTerms || !props.taxonomyGroupId) return false
      
      const normalizedValue = typeof value === 'string' ? value.toLowerCase().trim() : value
      
      return props.existingTerms.some(term => {
        // Skip current term when editing
        if (props.currentTermId && term._id === props.currentTermId) return false
        
        // Only check terms in the same taxonomy group
        if (term.taxonomy !== props.taxonomyGroupId) return false
        
        // Check custom data for the field
        const termValue = term.customData?.[fieldKey] || term[fieldKey]
        if (!termValue) return false
        
        const normalizedTermValue = typeof termValue === 'string' 
          ? termValue.toLowerCase().trim() 
          : termValue
          
        return normalizedTermValue === normalizedValue
      })
    }

    const openImageFileBrowser = (fieldKey) => {
      currentImageFieldKey.value = fieldKey
      fileBrowserOpen.value = true
    }

    const changeFileTrigger = (payload) => {
      fileBrowserOpen.value = payload
    }

    const selectFileTrigger = (payload) => {
      if (payload !== undefined && currentImageFieldKey.value) {
        updateField(currentImageFieldKey.value, payload.file)
        currentImageFieldKey.value = ''
      }
    }

    const clearImageField = (fieldKey) => {
      updateField(fieldKey, '')
    }

    // Watch for validation changes and emit to parent
    watch(validationErrors, (errors) => {
      emit('validation-change', {
        isValid: errors.length === 0,
        errors
      })
    }, { immediate: true })

    return {
      fieldErrors,
      validationErrors,
      hasValidationErrors,
      updateField,
      getFieldClass,
      getFieldError,
      isValidImageUrl,
      onImageError,
      checkFieldUniqueness,
      fileBrowserOpen,
      currentImageFieldKey,
      openImageFileBrowser,
      changeFileTrigger,
      selectFileTrigger,
      clearImageField
    }
  }
}
</script>

<style scoped>
.error-field {
  border-color: #dc3545 !important;
  background-color: #fff5f5;
}

.error-field:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
</style> 