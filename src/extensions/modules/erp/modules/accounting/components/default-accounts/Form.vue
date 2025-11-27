<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-link text-purple-500"></i>
            Default Accounts - บัญชีเริ่มต้น
          </h3>
          <p class="text-sm text-gray-600 mt-1">กำหนดบัญชีเริ่มต้นสำหรับรายการต่างๆ</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Default Accounts Form -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <i class="fas fa-spinner fa-spin text-4xl text-purple-500"></i>
      </div>

      <div v-else class="space-y-6">
        <!-- Warning if no accounts -->
        <div v-if="chartOfAccounts.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mt-0.5"></i>
            <div>
              <h4 class="text-sm font-semibold text-yellow-800 mb-1">
                ยังไม่มีข้อมูลผังบัญชี
              </h4>
              <p class="text-sm text-yellow-700 mb-2">
                กรุณาสร้างบัญชีใน Chart of Accounts ก่อน หรือกดปุ่ม "Initialize Defaults" เพื่อสร้างบัญชีเริ่มต้น
              </p>
              <button 
                @click="initializeDefaults"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm font-medium"
              >
                <i class="fas fa-plus mr-1"></i>
                Initialize Default Accounts
              </button>
            </div>
          </div>
        </div>

        <!-- Assets Section -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-coins text-green-600"></i>
            Assets - สินทรัพย์
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cash / เงินสด
                <span class="text-xs text-gray-500 ml-2">({{ assetAccounts.length }} accounts)</span>
              </label>
              <select
                v-model="accounts.cash"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in assetAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bank / เงินฝากธนาคาร
              </label>
              <select
                v-model="accounts.bank"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in assetAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Accounts Receivable / ลูกหนี้การค้า
              </label>
              <select
                v-model="accounts.accounts_receivable"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in assetAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Inventory / สินค้าคงเหลือ
              </label>
              <select
                v-model="accounts.inventory"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in assetAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                VAT Receivable / ภาษีมูลค่าเพิ่มซื้อ
              </label>
              <select
                v-model="accounts.vat_receivable"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in assetAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Liabilities Section -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-hand-holding-usd text-red-600"></i>
            Liabilities - หนี้สิน
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Accounts Payable / เจ้าหนี้การค้า
              </label>
              <select
                v-model="accounts.accounts_payable"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in liabilityAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                VAT Payable / ภาษีมูลค่าเพิ่มขาย
              </label>
              <select
                v-model="accounts.vat_payable"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in liabilityAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Withholding Tax / ภาษีหัก ณ ที่จ่าย
              </label>
              <select
                v-model="accounts.withholding_tax"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in liabilityAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Revenue Section -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-chart-line text-blue-600"></i>
            Revenue - รายได้
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sales Revenue / รายได้จากการขาย
              </label>
              <select
                v-model="accounts.sales_revenue"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in revenueAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Service Revenue / รายได้ค่าบริการ
              </label>
              <select
                v-model="accounts.service_revenue"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in revenueAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Other Income / รายได้อื่นๆ
              </label>
              <select
                v-model="accounts.other_income"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in revenueAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Expense Section -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-money-bill-wave text-orange-600"></i>
            Expenses - ค่าใช้จ่าย
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cost of Goods Sold / ต้นทุนขาย
              </label>
              <select
                v-model="accounts.cost_of_goods_sold"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in expenseAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Salary Expense / ค่าเงินเดือน
              </label>
              <select
                v-model="accounts.salary_expense"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in expenseAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Utility Expense / ค่าสาธารณูปโภค
              </label>
              <select
                v-model="accounts.utility_expense"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in expenseAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Depreciation Expense / ค่าเสื่อมราคา
              </label>
              <select
                v-model="accounts.depreciation_expense"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- เลือกบัญชี --</option>
                <option 
                  v-for="account in expenseAccounts" 
                  :key="account.code"
                  :value="account.code"
                >
                  {{ account.code }} - {{ account.name_th || account.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <button
          @click="$emit('close')"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i class="fas fa-times mr-2"></i>
          Cancel
        </button>
        <button
          @click="saveAccounts"
          :disabled="saving"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'" class="mr-2"></i>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

export default {
  name: 'DefaultAccountsForm',

  data() {
    return {
      saving: false,
      loading: true,
      chartOfAccounts: [], // All accounts from Chart of Accounts
      accounts: {
        // Assets
        cash: '',
        bank: '',
        accounts_receivable: '',
        inventory: '',
        vat_receivable: '',
        withholding_tax: '',
        
        // Liabilities
        accounts_payable: '',
        vat_payable: '',
        
        // Revenue
        sales_revenue: '',
        service_revenue: '',
        other_income: '',
        
        // Expenses
        cost_of_goods_sold: '',
        salary_expense: '',
        utility_expense: '',
        depreciation_expense: ''
      }
    }
  },

  computed: {
    // Filter accounts by type (dynamically from Account Types)
    assetAccounts() {
      return this.chartOfAccounts.filter(acc => acc.type === 'asset')
    },
    liabilityAccounts() {
      return this.chartOfAccounts.filter(acc => acc.type === 'liability')
    },
    equityAccounts() {
      return this.chartOfAccounts.filter(acc => acc.type === 'equity')
    },
    revenueAccounts() {
      return this.chartOfAccounts.filter(acc => acc.type === 'revenue')
    },
    expenseAccounts() {
      return this.chartOfAccounts.filter(acc => acc.type === 'expense')
    }
  },

  async mounted() {
    await accountingSettings.initialize(this)
    await this.loadChartOfAccounts()
    await this.loadDefaultAccounts()
    this.loading = false
  },

  methods: {
    async loadChartOfAccounts() {
      try {
        await accountingSettings.loadSettings()
        const data = accountingSettings.getAllAccounts()
        
        console.log('📋 Raw Chart of Accounts Data:', data)
        
        // If no accounts exist, initialize with defaults
        if (!data || Object.keys(data).length === 0) {
          console.log('⚠️ No accounts found, initializing defaults...')
          await accountingSettings.resetToDefault()
          await accountingSettings.loadSettings()
          const defaultData = accountingSettings.getAllAccounts()
          
          this.chartOfAccounts = Object.keys(defaultData).map(key => ({
            key,
            code: defaultData[key].code,
            name: defaultData[key].name,
            name_th: defaultData[key].name_th,
            type: defaultData[key].type
          }))
        } else {
          // Convert to array with code as property
          this.chartOfAccounts = Object.keys(data).map(key => ({
            key,
            code: data[key].code,
            name: data[key].name,
            name_th: data[key].name_th,
            type: data[key].type
          }))
        }
        
        console.log('✅ Loaded Chart of Accounts:', this.chartOfAccounts.length, 'accounts')
        console.log('Asset Accounts:', this.assetAccounts.length)
        console.log('Liability Accounts:', this.liabilityAccounts.length)
        console.log('Revenue Accounts:', this.revenueAccounts.length)
        console.log('Expense Accounts:', this.expenseAccounts.length)
      } catch (error) {
        console.error('❌ Failed to load chart of accounts:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถโหลดผังบัญชีได้', 'error')
      }
    },

    async loadDefaultAccounts() {
      try {
        const savedAccounts = await accountingSettings.getConfig('accounting.default_accounts')
        if (savedAccounts) {
          this.accounts = { ...this.accounts, ...savedAccounts }
          console.log('✅ Loaded Default Accounts from Database')
        }
      } catch (error) {
        console.error('Failed to load default accounts:', error)
      }
    },

    getAccountDisplay(code) {
      if (!code) return ''
      const account = this.chartOfAccounts.find(acc => acc.code === code)
      return account ? `${account.code} - ${account.name_th || account.name}` : code
    },

    async initializeDefaults() {
      try {
        const result = await this.$swal?.fire({
          title: 'Initialize Default Accounts?',
          text: 'จะสร้างผังบัญชีมาตรฐานไทย (50+ บัญชี)',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ใช่, สร้างเลย',
          cancelButtonText: 'ยกเลิก'
        })

        if (result?.isConfirmed) {
          this.loading = true
          await accountingSettings.resetToDefault()
          await this.loadChartOfAccounts()
          this.loading = false
          
          this.$swal?.fire('สำเร็จ!', 'สร้างผังบัญชีเริ่มต้นเรียบร้อย', 'success')
        }
      } catch (error) {
        console.error('Failed to initialize defaults:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        this.loading = false
      }
    },

    async saveAccounts() {
      this.saving = true
      try {
        await accountingSettings.saveConfig(
          'accounting.default_accounts',
          this.accounts,
          {
            name: 'Default Accounts Configuration',
            description: 'บัญชีเริ่มต้นสำหรับรายการต่างๆ'
          }
        )

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกบัญชีเริ่มต้นเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.$emit('saved')
      } catch (error) {
        console.error('Failed to save default accounts:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'Failed to save config'
        })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
