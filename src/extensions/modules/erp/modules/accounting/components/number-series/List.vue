<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <i class="fas fa-hashtag text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Number Series - รูปแบบเลขที่เอกสาร</h1>
              <p class="text-sm text-gray-600 mt-1">กำหนดรูปแบบและลำดับเลขที่เอกสารสำหรับแต่ละโมดูล</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="loadFromDefaults"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              title="โหลดการตั้งค่าเริ่มต้นจาก Code Config"
            >
              <i class="fas fa-download mr-2"></i>
              Load Defaults
            </button>
            <button
              @click="syncToDatabase"
              :disabled="syncing"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              title="บันทึกการตั้งค่าทั้งหมดเข้าฐานข้อมูล"
            >
              <i :class="syncing ? 'fas fa-spinner fa-spin' : 'fas fa-database'" class="mr-2"></i>
              {{ syncing ? 'Syncing...' : 'Sync to DB' }}
            </button>
            <button
              @click="resetDatabase"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              title="ลบและสร้างใหม่ทั้งหมด"
            >
              <i class="fas fa-trash-restore mr-2"></i>
              Reset DB
            </button>
            <button
              @click="loadModules"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <router-link to="/" class="text-gray-500 hover:text-gray-700 transition-colors">
            <i class="fas fa-home"></i>
            <span class="ml-1">Home</span>
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <router-link to="/accounting" class="text-gray-500 hover:text-gray-700 transition-colors">
            Accounting
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <router-link to="/accounting/settings" class="text-gray-500 hover:text-gray-700 transition-colors">
            Settings
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-gray-900 font-medium">Number Series</span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <i class="fas fa-spinner fa-spin text-4xl text-yellow-500"></i>
    </div>

    <!-- Module List -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Pattern
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Example
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Seq
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="module in modules" :key="module.name">
                <!-- Main Module Row -->
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <button
                        v-if="module.subPatterns && module.subPatterns.length > 0"
                        @click="toggleExpand(module.name)"
                        class="mr-2 text-gray-500 hover:text-gray-700"
                      >
                        <i :class="expandedModules.includes(module.name) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                      </button>
                      <div :class="`flex items-center justify-center w-10 h-10 ${module.color} rounded-lg mr-3`">
                        <i :class="`${module.icon} text-white`"></i>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ module.label }}</div>
                        <div class="text-xs text-gray-500">
                          {{ module.name }}
                          <span v-if="module.subPatterns && module.subPatterns.length > 0" class="text-blue-600">
                            ({{ module.subPatterns.length }} patterns)
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ module.pattern }}</code>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-mono text-gray-700">{{ module.example }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ module.currentSequence || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ module.updatedAt ? formatDate(module.updatedAt) : '-' }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button
                      @click="editModule(module)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit Pattern"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="resetSequence(module)"
                      class="text-yellow-600 hover:text-yellow-900"
                      title="Reset Sequence"
                    >
                      <i class="fas fa-redo"></i>
                    </button>
                  </td>
                </tr>

                <!-- Sub-patterns (เอกสารย่อย) -->
                <template v-if="expandedModules.includes(module.name) && module.subPatterns">
                  <tr v-for="subPattern in module.subPatterns" :key="`${module.name}-${subPattern.key}`" class="bg-blue-50">
                    <td class="px-6 py-3 whitespace-nowrap">
                      <div class="flex items-center ml-12">
                        <i class="fas fa-file-alt text-blue-500 text-sm mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-800">{{ subPattern.label }}</div>
                          <div class="text-xs text-gray-500">{{ subPattern.key }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-3">
                      <code class="text-xs bg-white px-2 py-1 rounded border">{{ subPattern.format }}</code>
                    </td>
                    <td class="px-6 py-3">
                      <span class="text-sm font-mono text-gray-600">{{ subPattern.example }}</span>
                    </td>
                    <td class="px-6 py-3 text-center">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ subPattern.currentSequence || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {{ subPattern.updatedAt ? formatDate(subPattern.updatedAt) : '-' }}
                    </td>
                    <td class="px-6 py-3 text-center">
                      <button
                        @click="editSubPattern(module, subPattern)"
                        class="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit Sub-Pattern"
                      >
                        <i class="fas fa-edit text-sm"></i>
                      </button>
                      <button
                        @click="resetSubSequence(module, subPattern)"
                        class="text-yellow-600 hover:text-yellow-900"
                        title="Reset Sequence"
                      >
                        <i class="fas fa-redo text-sm"></i>
                      </button>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Card -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <i class="fas fa-info-circle text-blue-600 text-xl mt-0.5 mr-3"></i>
          <div>
            <h4 class="text-sm font-semibold text-blue-800 mb-1">Pattern Format Explanation</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li><code class="bg-blue-100 px-1 rounded">{prefix}</code> - รหัสนำหน้า (เช่น INV, PO, SO)</li>
              <li><code class="bg-blue-100 px-1 rounded">{year}</code> - ปี 4 หลัก (2025)</li>
              <li><code class="bg-blue-100 px-1 rounded">{month}</code> - เดือน 2 หลัก (01-12)</li>
              <li><code class="bg-blue-100 px-1 rounded">{sequence}</code> - เลขลำดับตามจำนวนหลักที่กำหนด</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <h3 class="text-2xl font-bold flex items-center gap-2">
              <i class="fas fa-edit text-blue-500"></i>
              Edit Number Series
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ editingSubPattern 
                ? `${editingModule?.label} → ${editingSubPattern.label}` 
                : editingModule?.label 
              }}
            </p>
          </div>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Prefix -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prefix / รหัสนำหน้า <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.prefix"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="INV"
              maxlength="10"
            />
          </div>

          <!-- Pattern Format -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pattern Format <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.format"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="{prefix}{year}{sequence}"
            />
            <p class="text-xs text-gray-500 mt-1">
              ใช้: {prefix}, {year}, {month}, {sequence}
            </p>
          </div>

          <!-- Sequence Settings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sequence Digits / จำนวนหลัก
              </label>
              <input
                v-model.number="editForm.sequenceDigits"
                type="number"
                min="2"
                max="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start From / เริ่มต้นที่
              </label>
              <input
                v-model.number="editForm.startFrom"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Reset Period -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reset Sequence / รีเซ็ตเลขลำดับ
            </label>
            <select
              v-model="editForm.resetPeriod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="never">Never (ไม่รีเซ็ต)</option>
              <option value="daily">Daily (รายวัน)</option>
              <option value="monthly">Monthly (รายเดือน)</option>
              <option value="yearly">Yearly (รายปี)</option>
            </select>
          </div>

          <!-- Preview -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div class="text-lg font-mono text-gray-900">{{ generatePreview() }}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button
            @click="closeEditModal"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <i class="fas fa-times mr-2"></i>
            Cancel
          </button>
          <button
            @click="savePattern"
            :disabled="saving"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'" class="mr-2"></i>
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NumberSeriesList',

  data() {
    return {
      loading: false,
      saving: false,
      syncing: false,
      modules: [],
      expandedModules: [], // สำหรับเก็บ module ที่ expand แสดง sub-patterns
      showEditModal: false,
      editingModule: null,
      editingSubPattern: null, // สำหรับแก้ไข sub-pattern
      editForm: {
        prefix: '',
        format: '',
        sequenceDigits: 4,
        startFrom: 1,
        resetPeriod: 'yearly'
      }
    }
  },

  async mounted() {
    // Initialize AccountingSettings
    const accountingSettings = window.ERP_CORE?.accounting
    if (accountingSettings) {
      try {
        accountingSettings.initialize(this)
        console.log('[NumberSeries] ✅ AccountingSettings initialized')
      } catch (error) {
        console.warn('[NumberSeries] ⚠️ Failed to initialize AccountingSettings:', error.message)
      }
    }
    
    await this.loadModules()
  },

  methods: {
    async loadModules() {
      this.loading = true
      try {
        console.log('[NumberSeries] Loading modules from ERP_CORE.masterdata')
        
        if (!window.ERP_CORE || !window.ERP_CORE.masterdata) {
          console.error('[NumberSeries] ERP_CORE.masterdata not available')
          this.$swal({
            icon: 'error',
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถโหลด ERP_CORE ได้'
          })
          return
        }

        const masterdata = window.ERP_CORE.masterdata
        const accountingSettings = window.ERP_CORE.accounting
        const moduleList = []

        // 🚀 ใช้ Aggregation Pipeline - ดึงข้อมูลทั้งหมดครั้งเดียว (1 request!)
        const allSettings = await accountingSettings.loadAllSettingsWithAggregate()
        console.log('[NumberSeries] 📦 All settings loaded via aggregate:', Object.keys(allSettings).length, 'items')

        // ดึงรายการ modules จาก masterdata
        const availableModules = Object.keys(masterdata)
        console.log('[NumberSeries] Available modules:', availableModules)

        for (const moduleName of availableModules) {
          const moduleData = masterdata[moduleName]
          const configKey = `${moduleName.toUpperCase()}_CODE_CONFIG`
          
          if (moduleData && moduleData[configKey]) {
            const config = moduleData[configKey]
            const defaultPattern = config.patterns?.default || config.patterns?.product || {}
            
            // 🚀 ดึงจาก aggregate result (ไม่มี await!)
            const savedMainPattern = allSettings[`number_series.${moduleName}`]?.value || null
            if (savedMainPattern) {
              console.log(`[NumberSeries] 💾 Using ${moduleName} from aggregate result`)
            }
            
            // ใช้ข้อมูลจาก database ถ้ามี ไม่งั้นใช้ masterdata
            const mainPattern = savedMainPattern || defaultPattern
            
            // ดึง sub-patterns (เอกสารย่อย)
            const subPatterns = []
            const patterns = config.patterns || {}
            
            // กรอง patterns ที่ไม่ใช่ default
            const subPatternKeys = Object.keys(patterns).filter(key => 
              !['default', 'product'].includes(key)
            )
            
            for (const key of subPatternKeys) {
              const pattern = patterns[key]
              
              // 🚀 ดึง sub-pattern จาก aggregate result (ไม่มี await!)
              const savedSubPattern = allSettings[`number_series.${moduleName}.${key}`]?.value || null
              if (savedSubPattern) {
                console.log(`[NumberSeries] 💾 Using ${moduleName}.${key} from aggregate result`)
              }
              
              const subPattern = savedSubPattern || pattern
              
              subPatterns.push({
                key: key,
                label: this.getSubPatternLabel(moduleName, key),
                format: subPattern.format || pattern.format || '{prefix}{year}{sequence}',
                prefix: subPattern.prefix || pattern.prefix || key.substring(0, 3).toUpperCase(),
                sequenceDigits: subPattern.sequence?.digits || pattern.sequence?.digits || 4,
                startFrom: subPattern.sequence?.start || pattern.sequence?.start || 1,
                resetPeriod: (subPattern.sequence?.resetOnYearChange || pattern.sequence?.resetOnYearChange) ? 'yearly' : 'never',
                example: this.generateExample(subPattern.format ? subPattern : pattern),
                pattern: subPattern,
                currentSequence: subPattern.sequence?.current || pattern.sequence?.current || 0,
                updatedAt: subPattern.updatedAt || null
              })
            }
            
            moduleList.push({
              name: moduleName,
              label: this.getModuleLabel(moduleName),
              icon: this.getModuleIcon(moduleName),
              color: this.getModuleColor(moduleName),
              pattern: mainPattern.format || defaultPattern.format || '{prefix}{year}{sequence}',
              prefix: mainPattern.prefix || defaultPattern.prefix || moduleName.substring(0, 3).toUpperCase(),
              sequenceDigits: mainPattern.sequence?.digits || defaultPattern.sequence?.digits || 4,
              startFrom: mainPattern.sequence?.start || defaultPattern.sequence?.start || 1,
              resetPeriod: (mainPattern.sequence?.resetOnYearChange || defaultPattern.sequence?.resetOnYearChange) ? 'yearly' : 'never',
              example: this.generateExample(mainPattern.format ? mainPattern : defaultPattern),
              config: config,
              subPatterns: subPatterns,
              currentSequence: mainPattern.sequence?.current || defaultPattern.sequence?.current || 0,
              updatedAt: mainPattern.updatedAt || config.updatedAt || null
            })
          }
        }

        this.modules = moduleList.sort((a, b) => a.label.localeCompare(b.label))
        console.log('[NumberSeries] Loaded modules:', this.modules.length)

      } catch (error) {
        console.error('[NumberSeries] Error loading modules:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดรายการ modules ได้'
        })
      } finally {
        this.loading = false
      }
    },

    getModuleLabel(module) {
      const labels = {
        supplier: 'Supplier - ซัพพลายเออร์',
        customer: 'Customer - ลูกค้า',
        purchase: 'Purchase Order - ใบสั่งซื้อ',
        inventory: 'Inventory - สินค้าคงคลัง',
        product: 'Product - สินค้า',
        sales: 'Sales - การขาย',
        delivery: 'Delivery - การจัดส่ง',
        document: 'Document - เอกสาร',
        payment: 'Payment - ใบชำระเงิน',
        quotation: 'Quotation - ใบเสนอราคา',
        returns: 'Returns - ใบคืนสินค้า',
        workorder: 'Work Order - ใบสั่งผลิต',
        production: 'Production - การผลิต'
      }
      return labels[module] || module.charAt(0).toUpperCase() + module.slice(1)
    },

    getSubPatternLabel(moduleName, patternKey) {
      // Sales sub-patterns
      const salesLabels = {
        salesOrder: 'Sales Order - ใบสั่งขาย',
        salesQuotation: 'Quotation - ใบเสนอราคา', 
        salesInvoice: 'Invoice - ใบแจ้งหนี้/ใบกำกับภาษี',
        receipt: 'Receipt - ใบเสร็จรับเงิน',
        creditNote: 'Credit Note - ใบลดหนี้',
        debitNote: 'Debit Note - ใบเพิ่มหนี้',
        customer: 'Customer - รหัสลูกค้า'
      }
      
      // Delivery sub-patterns
      const deliveryLabels = {
        deliveryOrder: 'Delivery Order - ใบสั่งจัดส่ง',
        deliveryNote: 'Delivery Note - ใบส่งของ',
        pickingList: 'Picking List - ใบเบิกสินค้า',
        shippingLabel: 'Shipping Label - ฉลากจัดส่ง',
        trackingNumber: 'Tracking Number - เลขติดตาม'
      }
      
      // Production sub-patterns
      const productionLabels = {
        productionOrder: 'Production Order - ใบสั่งผลิต',
        workOrder: 'Work Order - ใบสั่งงาน',
        bom: 'BOM - Bill of Materials',
        qualityControl: 'Quality Control - ใบตรวจสอบคุณภาพ',
        batch: 'Batch Number - เลขที่ Batch'
      }
      
      if (moduleName === 'sales') {
        return salesLabels[patternKey] || patternKey
      } else if (moduleName === 'delivery') {
        return deliveryLabels[patternKey] || patternKey
      } else if (moduleName === 'production') {
        return productionLabels[patternKey] || patternKey
      }
      
      return patternKey.charAt(0).toUpperCase() + patternKey.slice(1)
    },

    getModuleIcon(module) {
      const icons = {
        supplier: 'fas fa-truck',
        customer: 'fas fa-users',
        purchase: 'fas fa-shopping-cart',
        inventory: 'fas fa-boxes',
        product: 'fas fa-box',
        sales: 'fas fa-receipt',
        delivery: 'fas fa-shipping-fast',
        document: 'fas fa-file-alt',
        payment: 'fas fa-money-bill-wave',
        quotation: 'fas fa-file-invoice-dollar',
        returns: 'fas fa-undo',
        workorder: 'fas fa-tasks',
        production: 'fas fa-industry'
      }
      return icons[module] || 'fas fa-folder'
    },

    getModuleColor(module) {
      const colors = {
        supplier: 'bg-blue-500',
        customer: 'bg-green-500',
        purchase: 'bg-purple-500',
        inventory: 'bg-orange-500',
        product: 'bg-cyan-500',
        sales: 'bg-pink-500',
        delivery: 'bg-indigo-500',
        document: 'bg-gray-500',
        payment: 'bg-teal-500',
        quotation: 'bg-yellow-500',
        returns: 'bg-red-500',
        workorder: 'bg-lime-500',
        production: 'bg-amber-500'
      }
      return colors[module] || 'bg-gray-500'
    },

    generateExample(pattern) {
      // รองรับทั้ง pattern object และ string format
      if (typeof pattern === 'string') {
        // ถ้าเป็น string format โดยตรง
        const year = new Date().getFullYear()
        const sequence = '00001'
        return pattern
          .replace('{prefix}', 'XX')
          .replace('{year}', year.toString())
          .replace('{month}', '01')
          .replace('{sequence}', sequence)
      }
      
      // ถ้าเป็น pattern object
      if (!pattern || !pattern.prefix) return 'N/A'
      
      const year = new Date().getFullYear()
      const digits = pattern.sequence?.digits || 4
      const sequence = '1'.padStart(digits, '0')
      const format = pattern.format || '{prefix}{year}{sequence}'
      
      return format
        .replace('{prefix}', pattern.prefix)
        .replace('{year}', year.toString())
        .replace('{month}', '01')
        .replace('{sequence}', sequence)
    },

    editModule(module) {
      this.editingModule = module
      this.editingSubPattern = null // รีเซ็ต sub-pattern
      this.editForm = {
        prefix: module.prefix,
        format: module.pattern,
        sequenceDigits: module.sequenceDigits,
        startFrom: module.startFrom,
        resetPeriod: module.resetPeriod
      }
      this.showEditModal = true
    },

    editSubPattern(module, subPattern) {
      this.editingModule = module
      this.editingSubPattern = subPattern
      this.editForm = {
        prefix: subPattern.prefix,
        format: subPattern.format,
        sequenceDigits: subPattern.sequenceDigits,
        startFrom: subPattern.startFrom,
        resetPeriod: subPattern.resetPeriod
      }
      this.showEditModal = true
    },

    toggleExpand(moduleName) {
      const index = this.expandedModules.indexOf(moduleName)
      if (index > -1) {
        this.expandedModules.splice(index, 1)
      } else {
        this.expandedModules.push(moduleName)
      }
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingModule = null
      this.editingSubPattern = null
    },

    generatePreview() {
      const year = new Date().getFullYear()
      const month = '01'
      const sequence = '1'.padStart(this.editForm.sequenceDigits, '0')
      
      return this.editForm.format
        .replace('{prefix}', this.editForm.prefix)
        .replace('{year}', year.toString())
        .replace('{month}', month)
        .replace('{sequence}', sequence)
    },

    async savePattern() {
      if (!this.editForm.prefix || !this.editForm.format) {
        this.$swal({
          icon: 'error',
          title: 'กรุณากรอกข้อมูล',
          text: 'กรุณากรอก Prefix และ Pattern Format'
        })
        return
      }

      this.saving = true
      try {
        const accountingSettings = window.ERP_CORE.accounting
        accountingSettings.initialize(this)

        // สร้าง config key
        let configKey
        let configName
        
        if (this.editingSubPattern) {
          // บันทึก sub-pattern
          configKey = `number_series.${this.editingModule.name}.${this.editingSubPattern.key}`
          configName = `${this.editingModule.label} - ${this.editingSubPattern.label}`
        } else {
          // บันทึก main pattern
          configKey = `number_series.${this.editingModule.name}`
          configName = this.editingModule.label
        }

        const patternData = {
          prefix: this.editForm.prefix,
          format: this.editForm.format,
          sequence: {
            digits: this.editForm.sequenceDigits,
            start: this.editForm.startFrom,
            resetOnYearChange: this.editForm.resetPeriod === 'yearly'
          },
          resetPeriod: this.editForm.resetPeriod,
          updatedAt: new Date().toISOString()
        }

        await accountingSettings.saveConfig(configKey, patternData, {
          name: `Number Series for ${configName}`,
          description: `รูปแบบเลขที่เอกสารสำหรับ ${configName}`
        })

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกรูปแบบเลขที่เอกสารเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.closeEditModal()
        await this.loadModules()

      } catch (error) {
        console.error('[NumberSeries] Error saving pattern:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกรูปแบบได้'
        })
      } finally {
        this.saving = false
      }
    },

    async resetSequence(module) {
      const result = await this.$swal({
        icon: 'warning',
        title: 'ยืนยันการรีเซ็ต',
        text: `ต้องการรีเซ็ตเลขลำดับของ ${module.label} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: 'ใช่, รีเซ็ต',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        try {
          if (window.ERP_CORE && window.ERP_CORE.codeManager) {
            await window.ERP_CORE.codeManager.resetSequence(module.name)
            
            this.$swal({
              icon: 'success',
              title: 'รีเซ็ตสำเร็จ',
              text: 'รีเซ็ตเลขลำดับเรียบร้อยแล้ว',
              timer: 2000,
              showConfirmButton: false
            })

            await this.loadModules()
          }
        } catch (error) {
          console.error('[NumberSeries] Error resetting sequence:', error)
          this.$swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถรีเซ็ตเลขลำดับได้'
          })
        }
      }
    },

    async resetSubSequence(module, subPattern) {
      const result = await this.$swal({
        icon: 'warning',
        title: 'ยืนยันการรีเซ็ต',
        text: `ต้องการรีเซ็ตเลขลำดับของ ${subPattern.label} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: 'ใช่, รีเซ็ต',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        try {
          if (window.ERP_CORE && window.ERP_CORE.codeManager) {
            // รีเซ็ต sub-pattern sequence
            await window.ERP_CORE.codeManager.resetSequence(module.name, subPattern.key)
            
            this.$swal({
              icon: 'success',
              title: 'รีเซ็ตสำเร็จ',
              text: 'รีเซ็ตเลขลำดับเรียบร้อยแล้ว',
              timer: 2000,
              showConfirmButton: false
            })

            await this.loadModules()
          }
        } catch (error) {
          console.error('[NumberSeries] Error resetting sub-sequence:', error)
          this.$swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถรีเซ็ตเลขลำดับได้'
          })
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async syncToDatabase() {
      const result = await this.$swal({
        icon: 'question',
        title: 'ยืนยันการ Sync',
        html: `
          <div class="text-left">
            <p class="mb-2">จะทำการบันทึกการตั้งค่า Number Series ทั้งหมดเข้าฐานข้อมูล:</p>
            <ul class="list-disc list-inside text-sm text-gray-600">
              <li>บันทึกรูปแบบเลขที่ของทุก Module</li>
              <li>บันทึก Sub-patterns (เอกสารย่อย)</li>
              <li>สามารถดึงกลับมาใช้ได้ทุกที่</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'ใช่, Sync เลย',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#3b82f6'
      })

      if (!result.isConfirmed) return

      this.syncing = true
      try {
        const accountingSettings = window.ERP_CORE.accounting
        accountingSettings.initialize(this)

        let syncCount = 0
        const errors = []

        // บันทึก main patterns และ sub-patterns ของทุก module
        for (const module of this.modules) {
          try {
            // บันทึก main pattern
            const mainConfigKey = `number_series.${module.name}`
            const mainPatternData = {
              prefix: module.prefix,
              format: module.pattern,
              sequence: {
                digits: module.sequenceDigits,
                start: module.startFrom,
                resetOnYearChange: module.resetPeriod === 'yearly',
                current: 0 // 🔢 เริ่มต้นที่ 0 (จะถูกอัปเดตอัตโนมัติเมื่อสร้างรหัส)
              },
              resetPeriod: module.resetPeriod,
              updatedAt: new Date().toISOString(),
              lastUsed: null
            }

            await accountingSettings.saveConfig(mainConfigKey, mainPatternData, {
              name: `Number Series for ${module.label}`,
              description: `รูปแบบเลขที่เอกสารหลักสำหรับโมดูล ${module.name}`
            })
            syncCount++

            // บันทึก sub-patterns
            if (module.subPatterns && module.subPatterns.length > 0) {
              for (const subPattern of module.subPatterns) {
                const subConfigKey = `number_series.${module.name}.${subPattern.key}`
                const subPatternData = {
                  prefix: subPattern.prefix,
                  format: subPattern.format,
                  sequence: {
                    digits: subPattern.sequenceDigits,
                    start: subPattern.startFrom,
                    resetOnYearChange: subPattern.resetPeriod === 'yearly',
                    current: 0 // 🔢 เริ่มต้นที่ 0 (จะถูกอัปเดตอัตโนมัติเมื่อสร้างรหัส)
                  },
                  resetPeriod: subPattern.resetPeriod,
                  updatedAt: new Date().toISOString(),
                  lastUsed: null
                }

                await accountingSettings.saveConfig(subConfigKey, subPatternData, {
                  name: `Number Series for ${module.label} - ${subPattern.label}`,
                  description: `รูปแบบเลขที่เอกสารสำหรับ ${subPattern.label}`
                })
                syncCount++
              }
            }

          } catch (error) {
            console.error(`[NumberSeries] Error syncing ${module.name}:`, error)
            errors.push(`${module.label}: ${error.message}`)
          }
        }

        // แสดงผลลัพธ์
        if (errors.length === 0) {
          this.$swal({
            icon: 'success',
            title: 'Sync สำเร็จ!',
            html: `
              <div class="text-center">
                <p class="text-lg font-semibold text-green-600 mb-2">
                  บันทึกเข้าฐานข้อมูลเรียบร้อยแล้ว
                </p>
                <p class="text-gray-600">
                  จำนวน ${syncCount} patterns
                </p>
              </div>
            `,
            timer: 3000,
            showConfirmButton: false
          })
        } else {
          this.$swal({
            icon: 'warning',
            title: 'Sync สำเร็จบางส่วน',
            html: `
              <div class="text-left">
                <p class="mb-2">บันทึกสำเร็จ: ${syncCount} patterns</p>
                <p class="mb-2 text-red-600">มีข้อผิดพลาด ${errors.length} รายการ:</p>
                <ul class="list-disc list-inside text-sm text-gray-600">
                  ${errors.map(err => `<li>${err}</li>`).join('')}
                </ul>
              </div>
            `
          })
        }

        // Refresh data
        await this.loadModules()

      } catch (error) {
        console.error('[NumberSeries] Error syncing to database:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถ Sync ข้อมูลได้: ' + error.message
        })
      } finally {
        this.syncing = false
      }
    },

    async loadFromDefaults() {
      const result = await this.$swal({
        icon: 'info',
        title: 'โหลดค่าเริ่มต้น',
        html: `
          <div class="text-left">
            <p class="mb-2">จะโหลดการตั้งค่าเริ่มต้นจาก Code Config:</p>
            <ul class="list-disc list-inside text-sm text-gray-600">
              <li>โหลดจาก ERP_CORE.masterdata</li>
              <li>ไม่บันทึกเข้าฐานข้อมูล (แค่ดูตัวอย่าง)</li>
              <li>ต้องกด Sync to DB เพื่อบันทึก</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'โหลดเลย',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981'
      })

      if (result.isConfirmed) {
        await this.loadModules()
        this.$swal({
          icon: 'success',
          title: 'โหลดสำเร็จ',
          text: 'โหลดค่าเริ่มต้นเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })
      }
    },

    async resetDatabase() {
      const result = await this.$swal({
        icon: 'warning',
        title: 'ยืนยันการรีเซ็ต',
        html: `
          <div class="text-left">
            <p class="mb-2 text-red-600 font-semibold">⚠️ คำเตือน: การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <p class="mb-2">จะทำการ:</p>
            <ul class="list-disc list-inside text-sm text-gray-600">
              <li>ลบการตั้งค่า Number Series ทั้งหมดจากฐานข้อมูล</li>
              <li>สร้างใหม่จากค่าเริ่มต้น</li>
              <li>Sequence จะถูกรีเซ็ตเป็น 1</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'ใช่, รีเซ็ตเลย',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444'
      })

      if (!result.isConfirmed) return

      this.syncing = true
      try {
        const accountingSettings = window.ERP_CORE.accounting
        accountingSettings.initialize(this)

        let deleteCount = 0
        let createCount = 0

        // ลบการตั้งค่าเก่าทั้งหมด
        for (const module of this.modules) {
          try {
            // ลบ main pattern
            const mainConfigKey = `number_series.${module.name}`
            await accountingSettings.deleteConfig(mainConfigKey)
            deleteCount++

            // ลบ sub-patterns
            if (module.subPatterns && module.subPatterns.length > 0) {
              for (const subPattern of module.subPatterns) {
                const subConfigKey = `number_series.${module.name}.${subPattern.key}`
                await accountingSettings.deleteConfig(subConfigKey)
                deleteCount++
              }
            }
          } catch (error) {
            console.warn(`[NumberSeries] Error deleting ${module.name}:`, error.message)
          }
        }

        // สร้างใหม่จากค่าเริ่มต้น
        for (const module of this.modules) {
          try {
            // สร้าง main pattern
            const mainConfigKey = `number_series.${module.name}`
            const mainPatternData = {
              prefix: module.prefix,
              format: module.pattern,
              sequence: {
                digits: module.sequenceDigits,
                start: module.startFrom,
                resetOnYearChange: module.resetPeriod === 'yearly',
                current: 0 // 🔢 รีเซ็ตเป็น 0
              },
              resetPeriod: module.resetPeriod,
              updatedAt: new Date().toISOString(),
              lastUsed: null
            }

            await accountingSettings.saveConfig(mainConfigKey, mainPatternData, {
              name: `Number Series for ${module.label}`,
              description: `รูปแบบเลขที่เอกสารหลักสำหรับโมดูล ${module.name}`
            })
            createCount++

            // สร้าง sub-patterns
            if (module.subPatterns && module.subPatterns.length > 0) {
              for (const subPattern of module.subPatterns) {
                const subConfigKey = `number_series.${module.name}.${subPattern.key}`
                const subPatternData = {
                  prefix: subPattern.prefix,
                  format: subPattern.format,
                  sequence: {
                    digits: subPattern.sequenceDigits,
                    start: subPattern.startFrom,
                    resetOnYearChange: subPattern.resetPeriod === 'yearly',
                    current: 0 // 🔢 รีเซ็ตเป็น 0
                  },
                  resetPeriod: subPattern.resetPeriod,
                  updatedAt: new Date().toISOString(),
                  lastUsed: null
                }

                await accountingSettings.saveConfig(subConfigKey, subPatternData, {
                  name: `Number Series for ${module.label} - ${subPattern.label}`,
                  description: `รูปแบบเลขที่เอกสารสำหรับ ${subPattern.label}`
                })
                createCount++
              }
            }
          } catch (error) {
            console.error(`[NumberSeries] Error creating ${module.name}:`, error)
          }
        }

        this.$swal({
          icon: 'success',
          title: 'รีเซ็ตสำเร็จ!',
          html: `
            <div class="text-center">
              <p class="text-gray-600 mb-2">ลบ: ${deleteCount} patterns</p>
              <p class="text-gray-600">สร้างใหม่: ${createCount} patterns</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false
        })

        // Refresh data
        await this.loadModules()

      } catch (error) {
        console.error('[NumberSeries] Error resetting database:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถรีเซ็ตฐานข้อมูลได้: ' + error.message
        })
      } finally {
        this.syncing = false
      }
    }
  }
}
</script>
