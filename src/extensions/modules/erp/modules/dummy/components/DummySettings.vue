<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Module Settings</h1>
            <p class="mt-1 text-gray-600">ตั้งค่าและกำหนดค่าของโมดูล</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Settings Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Settings Navigation -->
      <div class="bg-white rounded-lg shadow-sm mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              v-for="tab in settingsTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="tab.icon + ' mr-2'"></i>
              {{ tab.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="space-y-8">
        <!-- Module Information -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Module Information</h3>
            <p class="text-sm text-gray-600">ข้อมูลพื้นฐานของโมดูล</p>
          </div>
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                <input
                  v-model="settings.general.moduleName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Version</label>
                <input
                  v-model="settings.general.version"
                  type="text"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="settings.general.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- UI Preferences -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">UI Preferences</h3>
            <p class="text-sm text-gray-600">การตั้งค่าส่วนติดต่อผู้ใช้</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <!-- Theme Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div class="grid grid-cols-3 gap-3">
                <label
                  v-for="theme in themes"
                  :key="theme.value"
                  class="relative cursor-pointer"
                >
                  <input
                    v-model="settings.ui.theme"
                    type="radio"
                    :value="theme.value"
                    class="sr-only"
                  />
                  <div
                    :class="[
                      'p-4 border rounded-lg text-center transition-all',
                      settings.ui.theme === theme.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                  >
                    <i :class="theme.icon + ' text-2xl mb-2 block'"></i>
                    <span class="text-sm font-medium">{{ theme.label }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Items Per Page -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Items Per Page</label>
                <select
                  v-model="settings.ui.itemsPerPage"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="10">10 items</option>
                  <option value="20">20 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Default View</label>
                <select
                  v-model="settings.ui.defaultView"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>
            </div>

            <!-- UI Toggles -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Show Sidebar</label>
                  <p class="text-xs text-gray-500">Display navigation sidebar</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.ui.showSidebar"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="toggle-switch"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Settings -->
      <div v-if="activeTab === 'features'" class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Feature Configuration</h3>
            <p class="text-sm text-gray-600">เปิด/ปิดฟีเจอร์ต่างๆ ของโมดูล</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <div
              v-for="(feature, key) in featureList"
              :key="key"
              class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex-1">
                <div class="flex items-center">
                  <i :class="feature.icon + ' text-gray-400 mr-3'"></i>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ feature.name }}</h4>
                    <p class="text-xs text-gray-500">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.features[key]"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="toggle-switch"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Settings -->
      <div v-if="activeTab === 'data'" class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Data Management</h3>
            <p class="text-sm text-gray-600">การจัดการข้อมูลและการบันทึก</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <!-- Auto Save -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Auto Save</label>
                <p class="text-xs text-gray-500">Automatically save changes</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.data.autoSave"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="toggle-switch"></div>
              </label>
            </div>

            <!-- Auto Save Interval -->
            <div v-if="settings.data.autoSave">
              <label class="block text-sm font-medium text-gray-700 mb-2">Auto Save Interval (seconds)</label>
              <input
                v-model.number="settings.data.autoSaveInterval"
                type="number"
                min="10"
                max="300"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- File Upload Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                <input
                  v-model.number="settings.data.maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                <input
                  v-model="allowedFileTypesString"
                  type="text"
                  placeholder="jpg, png, pdf, docx"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @blur="updateAllowedFileTypes"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Data Export/Import -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-exchange-alt text-gray-400 mr-2"></i>
              Export & Import
            </h3>
            <p class="text-sm text-gray-600">จัดการข้อมูลนำเข้าและส่งออก</p>
          </div>
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <div class="flex items-center mb-3">
                  <i class="fas fa-download text-blue-500 mr-2"></i>
                  <h4 class="font-medium text-gray-900">Export Data</h4>
                </div>
                <div class="space-y-3">
                  <button class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <i class="fas fa-download mr-2"></i>
                    Export All Data
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    <i class="fas fa-file-excel mr-2"></i>
                    Export to Excel
                  </button>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center mb-3">
                  <i class="fas fa-upload text-purple-500 mr-2"></i>
                  <h4 class="font-medium text-gray-900">Import Data</h4>
                </div>
                <div class="space-y-3">
                  <button class="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    <i class="fas fa-upload mr-2"></i>
                    Import from File
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                    <i class="fas fa-sync mr-2"></i>
                    Sync External Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div v-if="activeTab === 'advanced'" class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Advanced Configuration</h3>
            <p class="text-sm text-gray-600">การตั้งค่าขั้นสูงสำหรับผู้ดูแลระบบ</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <!-- API Settings -->
            <div>
              <h4 class="font-medium text-gray-900 mb-4">API Configuration</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
                  <input
                    v-model="settings.advanced.apiBaseUrl"
                    type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">API Timeout (ms)</label>
                  <input
                    v-model.number="settings.advanced.apiTimeout"
                    type="number"
                    min="1000"
                    max="60000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Cache Settings -->
            <div>
              <h4 class="font-medium text-gray-900 mb-4">Cache Configuration</h4>
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Enable Caching</label>
                  <p class="text-xs text-gray-500">Cache API responses for better performance</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.advanced.enableCaching"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="toggle-switch"></div>
                </label>
              </div>
            </div>

            <!-- Debug Mode -->
            <div>
              <h4 class="font-medium text-gray-900 mb-4">Development Settings</h4>
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Debug Mode</label>
                  <p class="text-xs text-gray-500">Enable detailed logging and error messages</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.advanced.debugMode"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="toggle-switch"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-red-900 flex items-center">
              <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              Danger Zone
            </h3>
            <p class="text-sm text-red-600 mt-1">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                @click="resetSettings"
                class="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-undo mr-2"></i>
                Reset All Settings
              </button>
              <button 
                @click="clearAllData"
                class="flex items-center justify-center px-4 py-3 bg-red-800 hover:bg-red-900 text-white rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-trash mr-2"></i>
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Last saved: {{ lastSaved ? formatDate(lastSaved) : 'Never' }}
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="loadSettings"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <i class="fas fa-undo mr-2"></i>
              Reset
            </button>
            
            <button
              @click="saveSettings"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              :disabled="saving"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-save mr-2"></i>
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_CONFIG, MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummySettings',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Settings' }
      ],
      
      activeTab: 'general',
      saving: false,
      lastSaved: null,
      allowedFileTypesString: '',
      
      settingsTabs: [
        { id: 'general', label: 'General', icon: 'fas fa-cog' },
        { id: 'features', label: 'Features', icon: 'fas fa-puzzle-piece' },
        { id: 'data', label: 'Data', icon: 'fas fa-database' },
        { id: 'advanced', label: 'Advanced', icon: 'fas fa-code' }
      ],
      
      themes: [
        { value: 'light', label: 'Light', icon: 'fas fa-sun' },
        { value: 'dark', label: 'Dark', icon: 'fas fa-moon' },
        { value: 'auto', label: 'Auto', icon: 'fas fa-adjust' }
      ],
      
      featureList: {
        enableNotifications: {
          name: 'Notifications',
          description: 'Show system notifications',
          icon: 'fas fa-bell'
        },
        enableExport: {
          name: 'Data Export',
          description: 'Allow data export functionality',
          icon: 'fas fa-download'
        },
        enableBulkActions: {
          name: 'Bulk Actions',
          description: 'Enable bulk item operations',
          icon: 'fas fa-tasks'
        },
        enableAdvancedSearch: {
          name: 'Advanced Search',
          description: 'Enhanced search capabilities',
          icon: 'fas fa-search-plus'
        }
      },
      
      settings: {
        general: {
          moduleName: 'Dummy Module',
          version: '1.0.0',
          description: 'Template module for development'
        },
        ui: { ...DEFAULT_CONFIG.ui },
        features: { ...DEFAULT_CONFIG.features },
        data: { 
          ...DEFAULT_CONFIG.data,
          maxFileSize: Math.floor(DEFAULT_CONFIG.data.maxFileSize / (1024 * 1024)) // Convert to MB
        },
        advanced: {
          apiBaseUrl: '/api/dummy',
          apiTimeout: 30000,
          enableCaching: true,
          debugMode: false
        }
      }
    }
  },

  mounted() {
    this.loadSettings()
    this.allowedFileTypesString = this.settings.data.allowedFileTypes.join(', ')
  },

  methods: {
    async loadSettings() {
      try {
        // Simulate API call to load settings
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Load saved settings from localStorage or API
        const savedSettings = localStorage.getItem('dummy-module-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          this.settings = { ...this.settings, ...parsed }
          this.allowedFileTypesString = this.settings.data.allowedFileTypes.join(', ')
        }
        
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    },

    async saveSettings() {
      this.saving = true
      
      try {
        // Convert file size back to bytes
        const settingsToSave = {
          ...this.settings,
          data: {
            ...this.settings.data,
            maxFileSize: this.settings.data.maxFileSize * 1024 * 1024
          }
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Save to localStorage (replace with actual API call)
        localStorage.setItem('dummy-module-settings', JSON.stringify(settingsToSave))
        
        this.lastSaved = new Date()
        
        // Show success message
        alert('Settings saved successfully!')
        
      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Error saving settings. Please try again.')
      } finally {
        this.saving = false
      }
    },

    updateAllowedFileTypes() {
      this.settings.data.allowedFileTypes = this.allowedFileTypesString
        .split(',')
        .map(type => type.trim())
        .filter(type => type.length > 0)
    },

    resetSettings() {
      if (confirm('Are you sure you want to reset all settings to default values?')) {
        this.settings = {
          general: {
            moduleName: 'Dummy Module',
            version: '1.0.0',
            description: 'Template module for development'
          },
          ui: { ...DEFAULT_CONFIG.ui },
          features: { ...DEFAULT_CONFIG.features },
          data: { 
            ...DEFAULT_CONFIG.data,
            maxFileSize: Math.floor(DEFAULT_CONFIG.data.maxFileSize / (1024 * 1024))
          },
          advanced: {
            apiBaseUrl: '/api/dummy',
            apiTimeout: 30000,
            enableCaching: true,
            debugMode: false
          }
        }
        this.allowedFileTypesString = this.settings.data.allowedFileTypes.join(', ')
      }
    },

    clearAllData() {
      if (confirm('Are you sure you want to clear ALL module data? This action cannot be undone!')) {
        if (confirm('This will permanently delete all items and settings. Type "CONFIRM" to proceed.')) {
          console.log('Clearing all data...')
          // Implement data clearing logic
        }
      }
    },

    formatDate(date) {
      return MODULE_UTILS.formatDate(date)
    }
  }
}
</script>

<style scoped>
/* Toggle Switch Component */
.toggle-switch {
  width: 2.75rem;
  height: 1.5rem;
  background-color: rgb(229 231 235);
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.15s ease-in-out;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  background-color: white;
  border: 1px solid rgb(209 213 219);
  border-radius: 9999px;
  height: 1.25rem;
  width: 1.25rem;
  transition: all 0.15s ease-in-out;
}

.peer:checked ~ .toggle-switch {
  background-color: rgb(37 99 235);
}

.peer:checked ~ .toggle-switch::after {
  transform: translateX(1.25rem);
  border-color: white;
}

/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style>