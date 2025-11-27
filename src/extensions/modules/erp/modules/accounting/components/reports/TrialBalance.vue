<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <i class="fas fa-balance-scale text-purple-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Trial Balance - งบทดลอง</h1>
              <p class="text-sm text-gray-600 mt-1">รายงานยอดคงเหลือของบัญชี</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="exportToExcel"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
            <button
              @click="printReport"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-print mr-2"></i>
              Print
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
          <router-link to="/accounting/reports" class="text-gray-500 hover:text-gray-700 transition-colors">
            Reports
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-gray-900 font-medium">Trial Balance</span>
        </nav>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Period From</label>
            <input
              v-model="filters.period_from"
              type="month"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Period To</label>
            <input
              v-model="filters.period_to"
              type="month"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              v-model="filters.account_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 space-x-3">
          <button
            @click="clearFilters"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i class="fas fa-times mr-2"></i>
            Clear
          </button>
          <button
            @click="generateReport"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-sync-alt mr-2"></i>
            Generate Report
          </button>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 text-center">
          <h2 class="text-xl font-bold text-gray-900">Trial Balance Report</h2>
          <p class="text-sm text-gray-600 mt-1">งบทดลอง</p>
          <p class="text-sm text-gray-500 mt-1">
            Period: {{ formatPeriod(filters.period_from) }} - {{ formatPeriod(filters.period_to) }}
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Code
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-500">Generating report...</p>
                  </div>
                </td>
              </tr>

              <tr v-else-if="accounts.length === 0">
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-balance-scale text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-medium">No data available</p>
                    <p class="text-gray-400 text-sm mt-2">Select period and generate report</p>
                  </div>
                </td>
              </tr>

              <template v-else>
                <tr v-for="account in accounts" :key="account.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ account.account_code }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ account.account_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                    {{ account.debit > 0 ? formatCurrency(account.debit) : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                    {{ account.credit > 0 ? formatCurrency(account.credit) : '-' }}
                  </td>
                </tr>

                <tr class="bg-gray-50 font-bold">
                  <td colspan="2" class="px-6 py-4 text-sm text-gray-900 text-right">Total:</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                    {{ formatCurrency(totalDebit) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    {{ formatCurrency(totalCredit) }}
                  </td>
                </tr>

                <tr class="bg-yellow-50 font-bold">
                  <td colspan="2" class="px-6 py-4 text-sm text-gray-900 text-right">Difference:</td>
                  <td colspan="2" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}
                    <span v-if="totalDebit !== totalCredit" class="ml-2 text-red-600">
                      <i class="fas fa-exclamation-triangle"></i>
                      (Unbalanced)
                    </span>
                    <span v-else class="ml-2 text-green-600">
                      <i class="fas fa-check-circle"></i>
                      (Balanced)
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../../plugins/index.js'

export default {
  name: 'TrialBalanceReport',
  data() {
    return {
      loading: false,
      accounts: [],
      filters: {
        period_from: '',
        period_to: '',
        account_type: ''
      }
    }
  },
  computed: {
    totalDebit() {
      return this.accounts.reduce((sum, acc) => sum + acc.debit, 0)
    },
    totalCredit() {
      return this.accounts.reduce((sum, acc) => sum + acc.credit, 0)
    }
  },
  methods: {
    async generateReport() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Complete Trial Balance data with Thai account names
        this.accounts = [
          // Assets (สินทรัพย์)
          { id: 1, account_code: '1110', account_name: 'Cash - เงินสด', account_type: 'asset', debit: 125000, credit: 0 },
          { id: 2, account_code: '1120', account_name: 'Bank - ธนาคาร', account_type: 'asset', debit: 850000, credit: 0 },
          { id: 3, account_code: '1130', account_name: 'Petty Cash - เงินสดย่อย', account_type: 'asset', debit: 10000, credit: 0 },
          { id: 4, account_code: '1210', account_name: 'Accounts Receivable - ลูกหนี้การค้า', account_type: 'asset', debit: 450000, credit: 0 },
          { id: 5, account_code: '1220', account_name: 'Allowance for Doubtful Accounts - ค่าเผื่อหนี้สงสัยจะสูญ', account_type: 'asset', debit: 0, credit: 15000 },
          { id: 6, account_code: '1310', account_name: 'Inventory - สินค้าคงเหลือ', account_type: 'asset', debit: 680000, credit: 0 },
          { id: 7, account_code: '1410', account_name: 'Prepaid Expenses - ค่าใช้จ่ายจ่ายล่วงหน้า', account_type: 'asset', debit: 35000, credit: 0 },
          { id: 8, account_code: '1510', account_name: 'Land - ที่ดิน', account_type: 'asset', debit: 5000000, credit: 0 },
          { id: 9, account_code: '1520', account_name: 'Building - อาคาร', account_type: 'asset', debit: 10000000, credit: 0 },
          { id: 10, account_code: '1521', account_name: 'Accumulated Depreciation - Building - ค่าเสื่อมราคาสะสม-อาคาร', account_type: 'asset', debit: 0, credit: 2500000 },
          { id: 11, account_code: '1530', account_name: 'Machinery - เครื่องจักร', account_type: 'asset', debit: 3500000, credit: 0 },
          { id: 12, account_code: '1531', account_name: 'Accumulated Depreciation - Machinery - ค่าเสื่อมราคาสะสม-เครื่องจักร', account_type: 'asset', debit: 0, credit: 1225000 },
          { id: 13, account_code: '1540', account_name: 'Vehicles - ยานพาหนะ', account_type: 'asset', debit: 1200000, credit: 0 },
          { id: 14, account_code: '1541', account_name: 'Accumulated Depreciation - Vehicles - ค่าเสื่อมราคาสะสม-ยานพาหนะ', account_type: 'asset', debit: 0, credit: 300000 },
          { id: 15, account_code: '1550', account_name: 'Office Equipment - อุปกรณ์สำนักงาน', account_type: 'asset', debit: 500000, credit: 0 },
          { id: 16, account_code: '1551', account_name: 'Accumulated Depreciation - Equipment - ค่าเสื่อมราคาสะสม-อุปกรณ์', account_type: 'asset', debit: 0, credit: 175000 },
          
          // Liabilities (หนี้สิน)
          { id: 17, account_code: '2110', account_name: 'Accounts Payable - เจ้าหนี้การค้า', account_type: 'liability', debit: 0, credit: 320000 },
          { id: 18, account_code: '2120', account_name: 'Notes Payable - ตั๋วเงินจ่าย', account_type: 'liability', debit: 0, credit: 150000 },
          { id: 19, account_code: '2210', account_name: 'Accrued Expenses - ค่าใช้จ่ายค้างจ่าย', account_type: 'liability', debit: 0, credit: 45000 },
          { id: 20, account_code: '2220', account_name: 'Unearned Revenue - รายได้รับล่วงหน้า', account_type: 'liability', debit: 0, credit: 80000 },
          { id: 21, account_code: '2230', account_name: 'VAT Payable - ภาษีมูลค่าเพิ่มค้างจ่าย', account_type: 'liability', debit: 0, credit: 22750 },
          { id: 22, account_code: '2310', account_name: 'Long-term Loans - เงินกู้ยืมระยะยาว', account_type: 'liability', debit: 0, credit: 2000000 },
          
          // Equity (ส่วนของเจ้าของ)
          { id: 23, account_code: '3110', account_name: 'Capital Stock - ทุนจดทะเบียน', account_type: 'equity', debit: 0, credit: 10000000 },
          { id: 24, account_code: '3210', account_name: 'Retained Earnings - กำไรสะสม', account_type: 'equity', debit: 0, credit: 3500000 },
          { id: 25, account_code: '3310', account_name: 'Current Year Earnings - กำไรปีปัจจุบัน', account_type: 'equity', debit: 0, credit: 950000 },
          
          // Revenue (รายได้)
          { id: 26, account_code: '4110', account_name: 'Sales Revenue - รายได้จากการขาย', account_type: 'revenue', debit: 0, credit: 5500000 },
          { id: 27, account_code: '4120', account_name: 'Service Revenue - รายได้จากการให้บริการ', account_type: 'revenue', debit: 0, credit: 800000 },
          { id: 28, account_code: '4210', account_name: 'Interest Income - ดอกเบี้ยรับ', account_type: 'revenue', debit: 0, credit: 25000 },
          { id: 29, account_code: '4310', account_name: 'Other Income - รายได้อื่นๆ', account_type: 'revenue', debit: 0, credit: 50000 },
          
          // Expenses (ค่าใช้จ่าย)
          { id: 30, account_code: '5110', account_name: 'Cost of Goods Sold - ต้นทุนขาย', account_type: 'expense', debit: 3200000, credit: 0 },
          { id: 31, account_code: '6110', account_name: 'Salaries Expense - ค่าเงินเดือน', account_type: 'expense', debit: 1200000, credit: 0 },
          { id: 32, account_code: '6120', account_name: 'Rent Expense - ค่าเช่า', account_type: 'expense', debit: 180000, credit: 0 },
          { id: 33, account_code: '6130', account_name: 'Utilities Expense - ค่าสาธารณูปโภค', account_type: 'expense', debit: 85000, credit: 0 },
          { id: 34, account_code: '6140', account_name: 'Depreciation Expense - ค่าเสื่อมราคา', account_type: 'expense', debit: 420000, credit: 0 },
          { id: 35, account_code: '6150', account_name: 'Insurance Expense - ค่าประกันภัย', account_type: 'expense', debit: 60000, credit: 0 },
          { id: 36, account_code: '6160', account_name: 'Advertising Expense - ค่าโฆษณา', account_type: 'expense', debit: 150000, credit: 0 },
          { id: 37, account_code: '6170', account_name: 'Office Supplies Expense - ค่าเครื่องเขียน', account_type: 'expense', debit: 45000, credit: 0 },
          { id: 38, account_code: '6180', account_name: 'Transportation Expense - ค่าขนส่ง', account_type: 'expense', debit: 120000, credit: 0 },
          { id: 39, account_code: '6190', account_name: 'Telephone Expense - ค่าโทรศัพท์', account_type: 'expense', debit: 35000, credit: 0 },
          { id: 40, account_code: '6210', account_name: 'Professional Fees - ค่าที่ปรึกษา', account_type: 'expense', debit: 80000, credit: 0 },
          { id: 41, account_code: '6220', account_name: 'Bank Charges - ค่าธรรมเนียมธนาคาร', account_type: 'expense', debit: 12000, credit: 0 },
          { id: 42, account_code: '6230', account_name: 'Interest Expense - ดอกเบี้ยจ่าย', account_type: 'expense', debit: 88000, credit: 0 },
          { id: 43, account_code: '6310', account_name: 'Bad Debt Expense - หนี้สูญ', account_type: 'expense', debit: 15000, credit: 0 },
          { id: 44, account_code: '6320', account_name: 'Miscellaneous Expense - ค่าใช้จ่ายเบ็ดเตล็ด', account_type: 'expense', debit: 35000, credit: 0 }
        ]

        // Filter by account type if selected
        if (this.filters.account_type) {
          this.accounts = this.accounts.filter(acc => acc.account_type === this.filters.account_type)
        }
      } catch (error) {
        console.error('Error generating report:', error)
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Failed to generate trial balance report'
        })
      } finally {
        this.loading = false
      }
    },
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },
    formatPeriod(period) {
      if (!period) return '-'
      const date = new Date(period + '-01')
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
    },
    clearFilters() {
      this.filters = {
        period_from: '',
        period_to: '',
        account_type: ''
      }
      this.accounts = []
    },
    exportToExcel() {
      this.$swal({
        icon: 'info',
        title: 'Export to Excel',
        text: 'This feature will be implemented soon'
      })
    },
    printReport() {
      window.print()
    }
  },
  mounted() {
    const now = new Date()
    this.filters.period_from = now.toISOString().slice(0, 7)
    this.filters.period_to = now.toISOString().slice(0, 7)
  }
}
</script>
