<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-book text-indigo-500"></i>
              Chart of Accounts - ผังบัญชี (Dynamic)
            </h1>
            <p class="mt-2 text-gray-600">จัดการผังบัญชีแบบ Dynamic ผ่าน AccountingSettings</p>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="loadFromHardcoded"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
              title="โหลดข้อมูลต้นฉบับจาก Code (ไม่บันทึก Database)"
            >
              <i class="fas fa-code mr-2"></i>
              Load Defaults
            </button>
            <button 
              @click="syncToDatabase"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
              title="บันทึกข้อมูลต้นฉบับไป Database"
            >
              <i class="fas fa-cloud-upload-alt mr-2"></i>
              Sync to DB
            </button>
            <button 
              @click="resetDatabase"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
              title="ลบข้อมูลจาก Database และโหลดต้นฉบับ"
            >
              <i class="fas fa-trash-restore mr-2"></i>
              Reset DB
            </button>
            <button 
              @click="loadAccounts"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
            >
              <i class="fas fa-refresh mr-2"></i>
              Refresh
            </button>
            <button
              @click="openAddAccountModal"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มบัญชี
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
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
                <router-link to="/accounting" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Accounting
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Chart of Accounts</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Debug Info -->
      <div v-if="accountTypes.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p class="text-yellow-800 text-sm">
          ⚠️ Warning: Account Types not loaded ({{ accountTypes.length }} types found)
        </p>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm p-5 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-xs">Total</p>
              <p class="text-2xl font-bold mt-1">{{ summary.total }}</p>
              <p class="text-xs opacity-75 mt-1">All Accounts</p>
            </div>
            <i class="fas fa-book text-2xl opacity-50"></i>
          </div>
        </div>

        <!-- Dynamic Account Type Stats -->
        <div 
          v-for="type in accountTypes" 
          :key="type.id"
          :style="{ background: `linear-gradient(to bottom right, ${type.color}, ${type.color}dd)` }"
          class="rounded-lg shadow-sm p-5 text-white"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs opacity-90">{{ type.name }}</p>
              <p class="text-2xl font-bold mt-1">{{ summary[type.id] || 0 }}</p>
              <p class="text-xs opacity-75 mt-1">{{ type.name_en }}</p>
            </div>
            <i :class="getTypeIcon(type.id)" class="text-2xl opacity-50"></i>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="ค้นหา Key, Code, Name..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          <!-- Type Filter -->
          <select v-model="filters.type" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">ทุกประเภท</option>
            <option 
              v-for="type in accountTypes" 
              :key="type.id" 
              :value="type.id"
            >
              {{ type.name }} ({{ type.name_en }})
            </option>
          </select>

          <!-- Clear Filter -->
          <button 
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <i class="fas fa-times mr-2"></i>
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        </div>

        <div v-else-if="filteredAccounts.length === 0" class="text-center py-12">
          <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">ไม่พบข้อมูลบัญชี</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="account in filteredAccounts" :key="account.key" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ account.key }}</code>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="font-mono font-semibold">{{ account.code }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ account.name }}</div>
                  <div class="text-sm text-gray-500">{{ account.name_th }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeBadgeClass(account.type)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getTypeLabel(account.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button @click="editAccount(account)" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteAccount(account)" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-xl font-bold">{{ editingAccount ? 'แก้ไขบัญชี' : 'เพิ่มบัญชีใหม่' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveAccount" class="space-y-4">
          <div v-if="!editingAccount">
            <label class="block text-sm font-medium mb-1">Key <span class="text-red-500">*</span></label>
            <input
              v-model="accountForm.key"
              type="text"
              required
              pattern="[a-z_]+"
              class="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="cash_on_hand"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Code <span class="text-red-500">*</span></label>
            <input
              v-model="accountForm.code"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="1010"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Name (EN) <span class="text-red-500">*</span></label>
            <input
              v-model="accountForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="Cash on Hand"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Name (TH) <span class="text-red-500">*</span></label>
            <input
              v-model="accountForm.name_th"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="เงินสด"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Type <span class="text-red-500">*</span></label>
            <select 
              v-model="accountForm.type" 
              @change="onTypeChange"
              required 
              class="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">เลือกประเภท</option>
              <option 
                v-for="type in accountTypes" 
                :key="type.id" 
                :value="type.id"
              >
                {{ type.name }} ({{ type.name_en }})
              </option>
            </select>
            <p v-if="accountForm.type" class="text-xs text-gray-500 mt-1">
              Code Prefix: {{ getTypeCodePrefix(accountForm.type) }}
            </p>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

export default {
  name: 'ChartOfAccountsDynamic',
  
  data() {
    return {
      accounts: [],
      accountTypes: [
        // Default fallback types (will be replaced after loading)
        { id: 'asset', name: 'สินทรัพย์', name_en: 'Asset', color: '#10b981', code_prefix: '1' },
        { id: 'liability', name: 'หนี้สิน', name_en: 'Liability', color: '#ef4444', code_prefix: '2' },
        { id: 'equity', name: 'ทุน', name_en: 'Equity', color: '#8b5cf6', code_prefix: '3' },
        { id: 'revenue', name: 'รายได้', name_en: 'Revenue', color: '#3b82f6', code_prefix: '4' },
        { id: 'expense', name: 'ค่าใช้จ่าย', name_en: 'Expense', color: '#f97316', code_prefix: '5' }
      ],
      loading: false,
      showModal: false,
      editingAccount: null,
      accountForm: {
        key: '',
        code: '',
        name: '',
        name_th: '',
        type: ''
      },
      filters: {
        search: '',
        type: ''
      },
      summary: {
        total: 0,
        assets: 0,
        liabilities: 0,
        equity: 0,
        revenue: 0,
        expense: 0
      }
    }
  },

  computed: {
    filteredAccounts() {
      let result = [...this.accounts]

      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(a => 
          a.key?.toLowerCase().includes(search) ||
          a.code?.toLowerCase().includes(search) ||
          a.name?.toLowerCase().includes(search) ||
          a.name_th?.toLowerCase().includes(search)
        )
      }

      if (this.filters.type) {
        result = result.filter(a => a.type === this.filters.type)
      }

      return result
    },

    hasActiveFilters() {
      return this.filters.search || this.filters.type
    }
  },

  async mounted() {
    console.log('🚀 Chart of Accounts Component Mounted')
    await accountingSettings.initialize(this)
    console.log('✅ AccountingSettings Initialized')
    
    // Load Account Types first (needed for summary)
    await this.loadAccountTypes()
    console.log('✅ Account Types Loaded:', this.accountTypes.length, 'types')
    
    // Then load accounts and calculate summary
    await this.loadAccounts()
    console.log('✅ Accounts Loaded:', this.accounts.length, 'accounts')
    console.log('📊 Final State:', {
      accountTypes: this.accountTypes,
      summary: this.summary
    })
  },

  methods: {
    async loadAccounts() {
      this.loading = true
      try {
        await accountingSettings.loadSettings()
        const data = accountingSettings.getAllAccounts()
        
        this.accounts = Object.keys(data).map(key => ({
          key,
          ...data[key]
        }))

        this.loadSummary()
      } catch (error) {
        console.error('Load error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    async loadAccountTypes() {
      try {
        console.log('🔄 Loading Account Types...')
        
        // Load from AccountingSettings (single source of truth)
        await accountingSettings.loadAccountTypes()
        const typesObject = accountingSettings.getAllAccountTypes()
        
        console.log('📦 Raw Account Types Object:', typesObject)
        
        // Convert object to array format for UI
        this.accountTypes = Object.keys(typesObject).map(key => ({
          id: key,
          name: typesObject[key].name_th,
          name_en: typesObject[key].name,
          color: typesObject[key].color,
          code_prefix: typesObject[key].code_prefix,
          description: typesObject[key].description
        }))
        
        console.log('✅ Loaded Account Types from AccountingSettings:', this.accountTypes.length, 'types')
        console.log('📊 Account Types Array:', this.accountTypes)
      } catch (error) {
        console.error('❌ Failed to load account types:', error)
        // Use default types if config not found
        this.accountTypes = [
          { id: 'asset', name: 'สินทรัพย์', name_en: 'Asset', color: '#10b981', code_prefix: '1' },
          { id: 'liability', name: 'หนี้สิน', name_en: 'Liability', color: '#ef4444', code_prefix: '2' },
          { id: 'equity', name: 'ทุน', name_en: 'Equity', color: '#8b5cf6', code_prefix: '3' },
          { id: 'revenue', name: 'รายได้', name_en: 'Revenue', color: '#3b82f6', code_prefix: '4' },
          { id: 'expense', name: 'ค่าใช้จ่าย', name_en: 'Expense', color: '#f97316', code_prefix: '5' }
        ]
        console.log('🔄 Using Fallback Account Types:', this.accountTypes.length, 'types')
      }
    },

    loadSummary() {
      this.summary = {
        total: this.accounts.length
      }
      
      // Count by dynamic account types
      this.accountTypes.forEach(type => {
        const count = this.accounts.filter(a => a.type === type.id).length
        this.summary[type.id] = count
      })
      
      console.log('📊 Summary Updated:', {
        total: this.summary.total,
        accountTypes: this.accountTypes.length,
        breakdown: this.summary
      })
    },

    async syncFromSettings() {
      const result = await this.$swal?.fire({
        title: 'Sync Settings?',
        text: 'จะโหลดข้อมูลจาก AccountingSettings ใหม่',
        icon: 'question',
        showCancelButton: true
      })

      if (result?.isConfirmed) {
        await this.loadAccounts()
        this.$swal?.fire('สำเร็จ!', 'Sync เรียบร้อย', 'success')
      }
    },

    async loadFromHardcoded() {
      const result = await this.$swal?.fire({
        title: 'โหลดข้อมูลต้นฉบับ?',
        html: `
          <div class="text-left">
            <p class="mb-2">จะโหลดข้อมูลผังบัญชีมาตรฐานไทยจาก Code</p>
            <ul class="text-sm text-gray-600 list-disc pl-5">
              <li><strong>ไม่บันทึก</strong> ลง Database</li>
              <li>แสดงข้อมูลชั่วคราวเท่านั้น</li>
              <li>รวม ~67 บัญชี</li>
            </ul>
            <p class="mt-3 text-yellow-600">💡 ถ้าต้องการบันทึกลง DB ให้กด "Sync to DB" ภายหลัง</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'โหลดเลย',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // Load hardcoded defaults without saving to database
          const defaultSettings = accountingSettings.defaultSettings
          
          this.accounts = Object.keys(defaultSettings).map(key => ({
            key,
            ...defaultSettings[key]
          }))

          this.loadSummary()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'โหลดสำเร็จ!',
            html: `
              <p>โหลดข้อมูลต้นฉบับ ${this.accounts.length} บัญชีแล้ว</p>
              <p class="text-sm text-gray-600 mt-2">
                ⚠️ ข้อมูลยังไม่ได้บันทึกลง Database<br/>
                กด "Sync to DB" เพื่อบันทึก
              </p>
            `
          })
        } catch (error) {
          console.error('Load error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async syncToDatabase() {
      const result = await this.$swal?.fire({
        title: 'บันทึกลง Database?',
        html: `
          <div class="text-left">
            <p class="mb-2">จะบันทึกข้อมูลต้นฉบับไป Database</p>
            <ul class="text-sm text-gray-600 list-disc pl-5">
              <li>บันทึกผังบัญชีมาตรฐานไทย ~67 บัญชี</li>
              <li><strong>เขียนทับ</strong> ข้อมูลเดิมใน Database</li>
              <li>ใช้ข้อมูลจาก Code เป็นมาตรฐาน</li>
            </ul>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, บันทึกเลย',
        confirmButtonColor: '#7c3aed',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // Save hardcoded defaults to database
          await accountingSettings.resetToDefault()
          await this.loadAccounts()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ!',
            text: `บันทึกผังบัญชีลง Database เรียบร้อย (${this.accounts.length} บัญชี)`
          })
        } catch (error) {
          console.error('Sync error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async resetDatabase() {
      const result = await this.$swal?.fire({
        title: 'ลบและรีเซ็ต Database?',
        html: `
          <div class="text-left">
            <p class="mb-2 text-red-600 font-semibold">⚠️ การกระทำนี้จะ:</p>
            <ul class="text-sm list-disc pl-5 space-y-1">
              <li><strong class="text-red-600">ลบข้อมูล</strong> ผังบัญชีทั้งหมดใน Database</li>
              <li>โหลดข้อมูลต้นฉบับจาก Code</li>
              <li><strong>บันทึก</strong> ข้อมูลต้นฉบับลง Database</li>
              <li>รีเซ็ตกลับเป็นมาตรฐานไทย (~67 บัญชี)</li>
            </ul>
            <p class="mt-3 text-orange-600 font-medium">
              ⚡ บัญชีที่สร้างเองจะหายทั้งหมด!
            </p>
          </div>
        `,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบและรีเซ็ต',
        confirmButtonColor: '#dc2626',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // Delete from database and load defaults
          await accountingSettings.resetToDefault()
          await this.loadAccounts()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'รีเซ็ตสำเร็จ!',
            text: `ลบข้อมูลเดิมและบันทึกผังบัญชีมาตรฐานแล้ว (${this.accounts.length} บัญชี)`
          })
        } catch (error) {
          console.error('Reset error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async resetToDefault() {
      const result = await this.$swal?.fire({
        title: 'Reset to Default?',
        text: 'จะรีเซ็ตผังบัญชีเป็นค่า Default (มาตรฐานไทย)',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
      })

      if (result?.isConfirmed) {
        await accountingSettings.resetToDefault()
        await this.loadAccounts()
        this.$swal?.fire('สำเร็จ!', 'รีเซ็ตเรียบร้อย', 'success')
      }
    },

    openAddAccountModal() {
      this.editingAccount = null
      this.accountForm = { key: '', code: '', name: '', name_th: '', type: '' }
      this.showModal = true
    },

    onTypeChange() {
      // Auto-generate code when type is selected (only for new accounts)
      if (!this.editingAccount && this.accountForm.type && !this.accountForm.code) {
        this.accountForm.code = this.generateAccountCode(this.accountForm.type)
      }
    },

    closeModal() {
      this.showModal = false
      this.editingAccount = null
    },

    async saveAccount() {
      try {
        if (this.editingAccount) {
          await accountingSettings.updateAccount(
            this.editingAccount.key,
            this.accountForm.code,
            this.accountForm.name,
            this.accountForm.name_th
          )
          this.$swal?.fire('สำเร็จ!', 'แก้ไขเรียบร้อย', 'success')
        } else {
          await accountingSettings.addAccount(
            this.accountForm.key,
            this.accountForm.code,
            this.accountForm.name,
            this.accountForm.name_th,
            this.accountForm.type
          )
          this.$swal?.fire('สำเร็จ!', 'เพิ่มเรียบร้อย', 'success')
        }

        this.closeModal()
        await this.loadAccounts()
      } catch (error) {
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      }
    },

    editAccount(account) {
      this.editingAccount = account
      this.accountForm = {
        key: account.key,
        code: account.code,
        name: account.name,
        name_th: account.name_th,
        type: account.type
      }
      this.showModal = true
    },

    async deleteAccount(account) {
      const result = await this.$swal?.fire({
        title: 'ยืนยันการลบ?',
        text: `ลบบัญชี "${account.name}" (${account.code})`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
      })

      if (result?.isConfirmed) {
        try {
          const settings = accountingSettings.getAllAccounts()
          delete settings[account.key]
          await accountingSettings.saveSettings(settings)
          
          this.$swal?.fire('สำเร็จ!', 'ลบเรียบร้อย', 'success')
          await this.loadAccounts()
        } catch (error) {
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        }
      }
    },

    clearFilters() {
      this.filters = { search: '', type: '' }
    },

    getTypeLabel(type) {
      const typeConfig = this.accountTypes.find(t => t.id === type)
      return typeConfig ? typeConfig.name : type
    },

    getTypeBadgeClass(type) {
      const typeConfig = this.accountTypes.find(t => t.id === type)
      if (!typeConfig) return 'bg-gray-100 text-gray-800'
      
      // Convert hex color to Tailwind-like classes
      const colorMap = {
        '#10b981': 'bg-green-100 text-green-800',
        '#ef4444': 'bg-red-100 text-red-800',
        '#8b5cf6': 'bg-purple-100 text-purple-800',
        '#3b82f6': 'bg-blue-100 text-blue-800',
        '#f97316': 'bg-orange-100 text-orange-800',
        '#06b6d4': 'bg-cyan-100 text-cyan-800',
        '#eab308': 'bg-yellow-100 text-yellow-800'
      }
      
      return colorMap[typeConfig.color] || 'bg-gray-100 text-gray-800'
    },

    getTypeCodePrefix(type) {
      const typeConfig = this.accountTypes.find(t => t.id === type)
      return typeConfig ? typeConfig.code_prefix : ''
    },

    generateAccountCode(type) {
      const prefix = this.getTypeCodePrefix(type)
      if (!prefix) return ''
      
      // Find existing accounts of this type
      const sameTypeAccounts = this.accounts.filter(a => a.type === type)
      const codes = sameTypeAccounts.map(a => parseInt(a.code)).filter(c => !isNaN(c))
      
      // Generate next code
      let nextNumber = 1
      if (codes.length > 0) {
        nextNumber = Math.max(...codes) + 1
      } else {
        nextNumber = parseInt(prefix) * 1000 + 1
      }
      
      return nextNumber.toString().padStart(4, '0')
    },

    getTypeIcon(typeId) {
      const iconMap = {
        asset: 'fas fa-coins',
        liability: 'fas fa-hand-holding-usd',
        equity: 'fas fa-balance-scale',
        revenue: 'fas fa-chart-line',
        expense: 'fas fa-receipt'
      }
      return iconMap[typeId] || 'fas fa-folder'
    }
  }
}
</script>
