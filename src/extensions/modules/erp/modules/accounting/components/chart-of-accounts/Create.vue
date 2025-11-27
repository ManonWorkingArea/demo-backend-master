<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">เพิ่มบัญชีใหม่</h2>
        
        <form @submit.prevent="handleSubmit">
          <!-- Account Code -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">รหัสบัญชี *</label>
            <input
              v-model="form.account_code"
              type="text"
              placeholder="เช่น 1110, 2110"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p class="mt-1 text-sm text-gray-500">ตัวเลข 4 หลักขึ้นไป</p>
          </div>

          <!-- Account Name (English) -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อบัญชี (EN) *</label>
            <input
              v-model="form.account_name"
              type="text"
              placeholder="e.g. Cash on Hand, Bank Deposit"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Account Name (Thai) -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อบัญชี (TH)</label>
            <input
              v-model="form.account_name_th"
              type="text"
              placeholder="เช่น เงินสด, เงินฝากธนาคาร"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Account Type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทบัญชี *</label>
            <select
              v-model="form.account_type"
              @change="onTypeChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
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
          </div>

          <!-- Opening Balance -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">ยอดยกมา</label>
            <input
              v-model="form.opening_balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <router-link
              to="/accounting/chart-of-accounts"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
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
  name: 'ChartOfAccountsCreate',
  
  data() {
    return {
      form: {
        key: '',
        account_code: '',
        account_name: '',
        account_name_th: '',
        account_type: '',
        opening_balance: 0
      },
      accountTypes: [],
      loading: false
    }
  },

  async mounted() {
    await accountingSettings.initialize(this)
    await this.loadAccountTypes()
  },

  methods: {
    async loadAccountTypes() {
      try {
        const config = await accountingSettings.getConfig('accounting.account_types')
        this.accountTypes = config?.account_types || []
        
        // Use default types if config not found
        if (this.accountTypes.length === 0) {
          this.accountTypes = [
            { id: 'asset', name: 'สินทรัพย์', name_en: 'Asset', color: '#10b981', code_prefix: '1' },
            { id: 'liability', name: 'หนี้สิน', name_en: 'Liability', color: '#ef4444', code_prefix: '2' },
            { id: 'equity', name: 'ทุน', name_en: 'Equity', color: '#8b5cf6', code_prefix: '3' },
            { id: 'revenue', name: 'รายได้', name_en: 'Revenue', color: '#3b82f6', code_prefix: '4' },
            { id: 'expense', name: 'ค่าใช้จ่าย', name_en: 'Expense', color: '#f97316', code_prefix: '5' }
          ]
        }
      } catch (error) {
        console.error('Failed to load account types:', error)
      }
    },

    onTypeChange() {
      if (this.form.account_type && !this.form.account_code) {
        this.form.account_code = this.generateAccountCode(this.form.account_type)
      }
    },

    generateAccountCode(type) {
      const typeConfig = this.accountTypes.find(t => t.id === type)
      if (!typeConfig) return ''
      
      const prefix = typeConfig.code_prefix
      // Simple generation: prefix + "001"
      return `${prefix}001`
    },

    async handleSubmit() {
      this.loading = true
      try {
        // Generate key from name if not provided
        if (!this.form.key) {
          this.form.key = this.form.account_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
        }

        await accountingSettings.addAccount(
          this.form.key,
          this.form.account_code,
          this.form.account_name,
          this.form.account_name_th || this.form.account_name,
          this.form.account_type
        )

        this.$swal?.fire('สำเร็จ!', 'เพิ่มบัญชีเรียบร้อย', 'success')
        this.$router.push('/accounting/chart-of-accounts')
      } catch (error) {
        console.error('Save error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
