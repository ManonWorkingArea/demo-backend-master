<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Add New Item</h1>
            <p class="mt-1 text-gray-600">เพิ่ม Item ใหม่เข้าสู่ระบบ</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Form -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
            <p class="text-sm text-gray-600">ข้อมูลพื้นฐานของ Item</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Item Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="Enter item name"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.name ? 'border-red-300' : 'border-gray-300'
                ]"
                @blur="validateField('name')"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Item Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Item Code <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.code"
                type="text"
                required
                placeholder="e.g., ITM-001"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.code ? 'border-red-300' : 'border-gray-300'
                ]"
                @blur="validateField('code')"
              />
              <p v-if="errors.code" class="mt-1 text-sm text-red-600">{{ errors.code }}</p>
              <p class="mt-1 text-xs text-gray-500">Uppercase letters, numbers, and dashes only</p>
            </div>

            <!-- Item Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Item Type <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.type"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.type ? 'border-red-300' : 'border-gray-300'
                ]"
                @change="validateField('type')"
              >
                <option value="">Select type...</option>
                <option value="type_a">Type A</option>
                <option value="type_b">Type B</option>
                <option value="type_c">Type C</option>
              </select>
              <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                v-model="formData.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                rows="4"
                placeholder="Enter item description..."
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.description ? 'border-red-300' : 'border-gray-300'
                ]"
                @blur="validateField('description')"
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ formData.description.length }}/500 characters</p>
            </div>
          </div>
        </div>

        <!-- Pricing & Details Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Pricing & Details</h3>
            <p class="text-sm text-gray-600">ข้อมูลราคาและรายละเอียดเพิ่มเติม</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price (THB)</label>
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.price ? 'border-red-300' : 'border-gray-300'
                ]"
                @blur="validateField('price')"
              />
              <p v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</p>
            </div>

            <!-- Currency Display -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price Display</label>
              <div class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {{ formatCurrency(formData.price || 0) }}
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="formData.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div class="space-y-2">
                <input
                  v-model="newTag"
                  type="text"
                  placeholder="Add a tag..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @keyup.enter="addTag"
                />
                <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(tag, index) in formData.tags"
                    :key="index"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                    <button
                      @click="removeTag(index)"
                      type="button"
                      class="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Settings</h3>
            <p class="text-sm text-gray-600">การตั้งค่าเพิ่มเติม</p>
          </div>
          
          <div class="px-6 py-6 space-y-4">
            <!-- Feature Toggles -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Featured Item</label>
                  <p class="text-xs text-gray-500">Highlight this item</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="formData.is_featured"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Allow Comments</label>
                  <p class="text-xs text-gray-500">Enable user comments</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="formData.allow_comments"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
          <router-link
            to="/dummy/items"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </router-link>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="saveDraft"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              :disabled="saving"
            >
              <i class="fas fa-save mr-2"></i>
              Save Draft
            </button>
            
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              :disabled="!isFormValid || saving"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              {{ saving ? 'Creating...' : 'Create Item' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { VALIDATION_RULES, MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyItemAdd',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Items Management', path: '/dummy/items', icon: 'fas fa-list' },
        { name: 'Add New Item' }
      ],
      
      saving: false,
      newTag: '',
      
      formData: {
        name: '',
        code: '',
        type: '',
        status: 'draft',
        priority: 'medium',
        description: '',
        price: null,
        category: '',
        tags: [],
        is_featured: false,
        allow_comments: true
      },
      
      errors: {}
    }
  },

  computed: {
    isFormValid() {
      return this.formData.name &&
             this.formData.code &&
             this.formData.type &&
             Object.keys(this.errors).length === 0
    }
  },

  methods: {
    validateField(fieldName) {
      const rules = VALIDATION_RULES[fieldName]
      if (!rules) return

      const value = this.formData[fieldName]
      let error = null

      // Required validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        error = `${fieldName} is required`
      }

      // Length validations
      if (!error && value) {
        if (rules.minLength && value.length < rules.minLength) {
          error = `${fieldName} must be at least ${rules.minLength} characters`
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          error = `${fieldName} must not exceed ${rules.maxLength} characters`
        }
      }

      // Pattern validation
      if (!error && value && rules.pattern && !rules.pattern.test(value)) {
        error = `${fieldName} format is invalid`
      }

      // Number validations
      if (!error && value !== null && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          error = `${fieldName} must be at least ${rules.min}`
        }
        if (rules.max !== undefined && value > rules.max) {
          error = `${fieldName} must not exceed ${rules.max}`
        }
      }

      // Set or clear error
      if (error) {
        this.$set(this.errors, fieldName, error)
      } else {
        this.$delete(this.errors, fieldName)
      }
    },

    validateForm() {
      // Validate all required fields
      const fieldsToValidate = ['name', 'code', 'type', 'description', 'price']
      fieldsToValidate.forEach(field => {
        this.validateField(field)
      })

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.saving = true
      
      try {
        // Transform data for API
        const itemData = MODULE_UTILS.transformItemForApi(this.formData)
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        console.log('Creating item:', itemData)
        
        // Success - redirect to items list
        this.$router.push('/dummy/items')
        
      } catch (error) {
        console.error('Error creating item:', error)
        // Handle error (show notification, etc.)
      } finally {
        this.saving = false
      }
    },

    async saveDraft() {
      this.formData.status = 'draft'
      this.saving = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Saving draft:', this.formData)
        
        // Success feedback
        alert('Draft saved successfully!')
        
      } catch (error) {
        console.error('Error saving draft:', error)
      } finally {
        this.saving = false
      }
    },

    // Tag management
    addTag() {
      const tag = this.newTag.trim()
      if (tag && !this.formData.tags.includes(tag)) {
        this.formData.tags.push(tag)
        this.newTag = ''
      }
    },

    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },

    // Utility methods
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    }
  }
}
</script>

<style scoped>
/* Toggle Switch Styles */
.peer:checked ~ .peer-checked\:bg-blue-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}

.peer:checked ~ .peer-checked\:after\:translate-x-full::after {
  --tw-translate-x: 100%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

/* Form animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Input focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style>