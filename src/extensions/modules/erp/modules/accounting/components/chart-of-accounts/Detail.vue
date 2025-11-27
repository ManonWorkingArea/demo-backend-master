<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
    </div>

    <div v-else-if="account" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          รายละเอียดบัญชี: {{ account.code }}
        </h2>
        
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">ชื่อบัญชี (EN)</label>
              <p class="mt-1 text-lg text-gray-900">{{ account.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ชื่อบัญชี (TH)</label>
              <p class="mt-1 text-lg text-gray-900">{{ account.name_th }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Key</label>
              <p class="mt-1">
                <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ account.key }}</code>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ประเภท</label>
              <p class="mt-1 text-gray-900">{{ getAccountTypeLabel(account.type) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">ยอดคงเหลือ</label>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              {{ formatAmount(account.current_balance) }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">รายการล่าสุด</label>
            <div class="border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">วันที่</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">รายการ</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                      ยังไม่มีรายการ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <router-link
            to="/accounting/chart-of-accounts"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            กลับ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

import { formatCurrency } from '../../utils/accountingHelpers'

export default {
  name: 'ChartOfAccountsDetail',
  
  data() {
    return {
      account: null,
      accountTypes: [],
      currencySettings: null,
      loading: true
    }
  },

  async mounted() {
    await accountingSettings.initialize(this)
    await this.loadAccountTypes()
    await this.loadCurrencySettings()
    await this.loadAccount()
  },

  methods: {
    async loadAccountTypes() {
      try {
        const config = await accountingSettings.getConfig('accounting.account_types')
        this.accountTypes = config?.account_types || []
      } catch (error) {
        console.error('Failed to load account types:', error)
      }
    },

    async loadCurrencySettings() {
      try {
        const config = await accountingSettings.getConfig('accounting.currency_settings')
        this.currencySettings = config
      } catch (error) {
        console.error('Failed to load currency settings:', error)
      }
    },

    async loadAccount() {
      this.loading = true
      try {
        const key = this.$route.params.id
        await accountingSettings.loadSettings()
        const accounts = accountingSettings.getAllAccounts()
        
        if (accounts[key]) {
          this.account = {
            key,
            ...accounts[key],
            current_balance: 0 // TODO: Calculate from transactions
          }
        } else {
          this.$swal?.fire('ไม่พบข้อมูล', 'ไม่พบบัญชีที่ระบุ', 'error')
          this.$router.push('/accounting/chart-of-accounts')
        }
      } catch (error) {
        console.error('Load error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    getAccountTypeLabel(type) {
      const typeConfig = this.accountTypes.find(t => t.id === type)
      return typeConfig ? `${typeConfig.name} (${typeConfig.name_en})` : type
    },

    formatAmount(amount) {
      return formatCurrency(amount, this.currencySettings)
    }
  }
}
</script>
