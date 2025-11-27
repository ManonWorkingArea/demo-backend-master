<template>
  <div v-if="shouldShowCustomFields" class="bg-white shadow-sm rounded-md border border-gray-200">
    <div class="p-3">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">
          <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
          ข้อมูลเพิ่มเติม
        </h2>
        <div class="text-xs text-gray-500">
          {{ customFields.length }} fields
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-sm text-gray-600">กำลังโหลดฟิลด์...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8 text-red-600">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- No Fields -->
      <div v-else-if="customFields.length === 0" class="text-center py-8 text-gray-500">
        <i class="fas fa-inbox text-3xl mb-3 text-gray-300"></i>
        <p class="text-sm">ไม่มีฟิลด์เพิ่มเติม</p>
        <p class="text-xs mt-1">หน้าหลักยังไม่ได้กำหนด Custom Fields</p>
      </div>

      <!-- Custom Fields Form -->
      <div v-else class="space-y-4">
        <!-- Main Content Fields -->
        <div v-if="mainFields.length > 0">
          <h3 class="text-xs font-medium text-gray-700 mb-3">ข้อมูลหลัก</h3>
          <div class="space-y-3">
            <div 
              v-for="field in mainFields" 
              :key="field.id"
              class="space-y-1"
            >
              <!-- Field Label -->
              <label :for="`field_${field.id}`" class="block text-xs font-medium text-gray-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Field Description -->
              <p v-if="field.description" class="text-xs text-gray-500 mb-1">
                {{ field.description }}
              </p>

              <!-- Text Input -->
              <input
                v-if="field.type === 'input'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                type="text"
                :placeholder="field.placeholder"
                :required="field.required"
                class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                @input="emitUpdate"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'textarea'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                :placeholder="field.placeholder"
                :required="field.required"
                rows="3"
                class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs resize-none"
                @input="emitUpdate"
              ></textarea>

              <!-- DateTime -->
              <input
                v-else-if="field.type === 'datetime'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                type="datetime-local"
                :required="field.required"
                class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                @input="emitUpdate"
              />

              <!-- Radio Buttons -->
              <div v-else-if="field.type === 'radio'" class="space-y-1">
                <label 
                  v-for="option in field.options" 
                  :key="option.value"
                  class="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <input
                    :name="`field_${field.id}`"
                    :value="option.value"
                    v-model="localCustomData[field.name]"
                    type="radio"
                    :required="field.required"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    @change="emitUpdate"
                  />
                  <span class="text-xs text-gray-700">{{ option.label }}</span>
                </label>
              </div>

              <!-- Checkbox -->
              <label 
                v-else-if="field.type === 'checkbox'"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <input
                  :id="`field_${field.id}`"
                  v-model="localCustomData[field.name]"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  @change="emitUpdate"
                />
                <span class="text-xs text-gray-700">{{ field.label }}</span>
              </label>

              <!-- Image Upload -->
              <div v-else-if="field.type === 'image'" class="space-y-2">
                <div class="flex items-center gap-2">
                  <input
                    :id="`field_${field.id}`"
                    v-model="localCustomData[field.name]"
                    type="text"
                    :placeholder="field.placeholder || 'URL รูปภาพ'"
                    class="flex-1 rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                    @input="emitUpdate"
                  />
                  <button
                    @click="openImageBrowser(field.name)"
                    type="button"
                    class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-image"></i>
                  </button>
                </div>
                <div v-if="localCustomData[field.name]" class="relative w-32 h-20 bg-gray-100 rounded overflow-hidden">
                  <img
                    :src="localCustomData[field.name]"
                    :alt="field.label"
                    class="w-full h-full object-cover"
                  />
                  <button
                    @click="localCustomData[field.name] = ''; emitUpdate()"
                    class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Validation Error -->
              <p v-if="fieldErrors[field.name]" class="text-xs text-red-600 mt-1">
                {{ fieldErrors[field.name] }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sidebar Fields -->
        <div v-if="sidebarFields.length > 0" class="pt-4 border-t border-gray-200">
          <h3 class="text-xs font-medium text-gray-700 mb-3">ข้อมูลเพิ่มเติม</h3>
          <div class="space-y-3">
            <div 
              v-for="field in sidebarFields" 
              :key="field.id"
              class="space-y-1"
            >
              <!-- Field Label -->
              <label :for="`field_${field.id}`" class="block text-xs font-medium text-gray-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Field Description -->
              <p v-if="field.description" class="text-xs text-gray-500 mb-1">
                {{ field.description }}
              </p>

              <!-- Similar field rendering as main fields but more compact -->
              <!-- Text Input -->
              <input
                v-if="field.type === 'input'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                type="text"
                :placeholder="field.placeholder"
                :required="field.required"
                class="block w-full rounded border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                @input="emitUpdate"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'textarea'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                :placeholder="field.placeholder"
                :required="field.required"
                rows="2"
                class="block w-full rounded border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs resize-none"
                @input="emitUpdate"
              ></textarea>

              <!-- DateTime -->
              <input
                v-else-if="field.type === 'datetime'"
                :id="`field_${field.id}`"
                v-model="localCustomData[field.name]"
                type="datetime-local"
                :required="field.required"
                class="block w-full rounded border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                @input="emitUpdate"
              />

              <!-- Radio Buttons -->
              <div v-else-if="field.type === 'radio'" class="space-y-1">
                <label 
                  v-for="option in field.options" 
                  :key="option.value"
                  class="flex items-center gap-2 p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <input
                    :name="`field_${field.id}`"
                    :value="option.value"
                    v-model="localCustomData[field.name]"
                    type="radio"
                    :required="field.required"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    @change="emitUpdate"
                  />
                  <span class="text-xs text-gray-700">{{ option.label }}</span>
                </label>
              </div>

              <!-- Checkbox -->
              <label 
                v-else-if="field.type === 'checkbox'"
                class="flex items-center gap-2 p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <input
                  :id="`field_${field.id}`"
                  v-model="localCustomData[field.name]"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  @change="emitUpdate"
                />
                <span class="text-xs text-gray-700">{{ field.label }}</span>
              </label>

              <!-- Image Upload -->
              <div v-else-if="field.type === 'image'" class="space-y-2">
                <div class="flex items-center gap-2">
                  <input
                    :id="`field_${field.id}`"
                    v-model="localCustomData[field.name]"
                    type="text"
                    :placeholder="field.placeholder || 'URL รูปภาพ'"
                    class="flex-1 rounded border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                    @input="emitUpdate"
                  />
                  <button
                    @click="openImageBrowser(field.name)"
                    type="button"
                    class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-image"></i>
                  </button>
                </div>
                <div v-if="localCustomData[field.name]" class="relative w-24 h-16 bg-gray-100 rounded overflow-hidden">
                  <img
                    :src="localCustomData[field.name]"
                    :alt="field.label"
                    class="w-full h-full object-cover"
                  />
                  <button
                    @click="localCustomData[field.name] = ''; emitUpdate()"
                    class="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Validation Error -->
              <p v-if="fieldErrors[field.name]" class="text-xs text-red-600 mt-1">
                {{ fieldErrors[field.name] }}
              </p>
            </div>
          </div>
        </div>

        <!-- Custom Data Summary -->
        <div class="pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between text-xs text-gray-600">
            <span>ข้อมูลที่กรอก: <strong>{{ Object.keys(localCustomData).filter(key => localCustomData[key]).length }}/{{ customFields.length }}</strong></span>
            <button
              @click="validateAllFields"
              type="button"
              class="text-blue-600 hover:text-blue-700"
            >
              <i class="fas fa-check-circle mr-1"></i>
              ตรวจสอบข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomFieldRenderer',
  props: {
    type: {
      type: String,
      default: 'page',
      validator: value => ['page', 'post'].includes(value)
    },
    parentId: {
      type: String,
      default: ''
    },
    parentData: {
      type: Object,
      default: () => ({})
    },
    customData: {
      type: Object,
      default: () => ({})
    },
    configs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      customFields: [],
      localCustomData: { ...this.customData },
      fieldErrors: {},
      currentImageField: null
    }
  },
  computed: {
    shouldShowCustomFields() {
      return this.type === 'post' && (this.parentId || this.parentData._id);
    },
    mainFields() {
      return this.customFields.filter(field => field.position === 'main');
    },
    sidebarFields() {
      return this.customFields.filter(field => field.position === 'sidebar');
    }
  },
  watch: {
    parentId: {
      handler(newId) {
        if (newId && this.shouldShowCustomFields) {
          this.loadParentCustomFields();
        }
      },
      immediate: true
    },
    parentData: {
      handler(newData) {
        if (newData && newData.customFields && this.shouldShowCustomFields) {
          this.customFields = newData.customFields || [];
          this.initializeCustomData();
        }
      },
      deep: true,
      immediate: true
    },
    customData: {
      handler(newData) {
        this.localCustomData = { ...newData };
      },
      deep: true
    }
  },
  methods: {
    async loadParentCustomFields() {
      if (!this.parentId || !this.shouldShowCustomFields) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading parent custom fields for ID:', this.parentId);
        
        const { data } = await this.$Request.GET(
          `post/${this.parentId}`,
          this.configs.key
        );
        
        if (data && data.customFields) {
          this.customFields = data.customFields;
          this.initializeCustomData();
          console.log('Loaded custom fields:', this.customFields);
        } else {
          this.customFields = [];
          console.log('No custom fields found in parent');
        }
        
      } catch (error) {
        console.error('Error loading parent custom fields:', error);
        this.error = 'ไม่สามารถโหลดฟิลด์เพิ่มเติมได้';
        this.customFields = [];
      } finally {
        this.loading = false;
      }
    },
    
    initializeCustomData() {
      // Initialize custom data with default values if not already set
      this.customFields.forEach(field => {
        if (!(field.name in this.localCustomData)) {
          if (field.type === 'checkbox') {
            this.localCustomData[field.name] = false;
          } else if (field.defaultValue) {
            this.localCustomData[field.name] = field.defaultValue;
          } else {
            this.localCustomData[field.name] = '';
          }
        }
      });
      
      this.emitUpdate();
    },
    
    emitUpdate() {
      this.$emit('update:customData', { ...this.localCustomData });
    },
    
    validateAllFields() {
      this.fieldErrors = {};
      let hasErrors = false;
      
      this.customFields.forEach(field => {
        const value = this.localCustomData[field.name];
        
        // Required field validation
        if (field.required) {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            this.fieldErrors[field.name] = `${field.label} จำเป็นต้องกรอก`;
            hasErrors = true;
          }
        }
        
        // Unique field validation (would need backend check)
        if (field.validation && field.validation.unique && value) {
          // This would typically require an API call to check uniqueness
          // For now, we'll skip this validation
        }
        
        // Length validation
        if (field.validation && value) {
          if (field.validation.min && value.length < field.validation.min) {
            this.fieldErrors[field.name] = `${field.label} ต้องมีอย่างน้อย ${field.validation.min} ตัวอักษร`;
            hasErrors = true;
          }
          
          if (field.validation.max && value.length > field.validation.max) {
            this.fieldErrors[field.name] = `${field.label} ต้องไม่เกิน ${field.validation.max} ตัวอักษร`;
            hasErrors = true;
          }
        }
        
        // Pattern validation
        if (field.validation && field.validation.pattern && value) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            this.fieldErrors[field.name] = `${field.label} รูปแบบไม่ถูกต้อง`;
            hasErrors = true;
          }
        }
      });
      
      if (!hasErrors) {
        this.$toast?.success('ข้อมูลถูกต้องทั้งหมด');
      } else {
        this.$toast?.error('กรุณาตรวจสอบข้อมูลที่กรอก');
      }
      
      return !hasErrors;
    },
    
    openImageBrowser(fieldName) {
      this.currentImageField = fieldName;
      this.$emit('openImageBrowser', fieldName);
    },
    
    handleImageSelected(imageUrl) {
      if (this.currentImageField) {
        this.localCustomData[this.currentImageField] = imageUrl;
        this.emitUpdate();
        this.currentImageField = null;
      }
    },
    
    // Public method for parent components to validate
    validate() {
      return this.validateAllFields();
    },
    
    // Public method to get validation status
    getValidationStatus() {
      const requiredFields = this.customFields.filter(field => field.required);
      const filledRequiredFields = requiredFields.filter(field => {
        const value = this.localCustomData[field.name];
        return value && (typeof value !== 'string' || value.trim() !== '');
      });
      
      return {
        isValid: requiredFields.length === filledRequiredFields.length,
        totalRequired: requiredFields.length,
        filledRequired: filledRequiredFields.length,
        totalFields: this.customFields.length,
        filledFields: Object.keys(this.localCustomData).filter(key => this.localCustomData[key]).length
      };
    }
  },
  mounted() {
    console.log('CustomFieldRenderer mounted:', {
      type: this.type,
      parentId: this.parentId,
      shouldShow: this.shouldShowCustomFields
    });
    
    if (this.shouldShowCustomFields) {
      if (this.parentData && this.parentData.customFields) {
        this.customFields = this.parentData.customFields;
        this.initializeCustomData();
      } else if (this.parentId) {
        this.loadParentCustomFields();
      }
    }
  },
  emits: ['update:customData', 'openImageBrowser']
}
</script>
