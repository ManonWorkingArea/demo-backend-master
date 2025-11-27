<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <i class="fas fa-book text-blue-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">General Ledger - บัญชีแยกประเภท</h1>
              <p class="text-sm text-gray-600 mt-1">รายงานและติดตามรายการบัญชีแยกประเภททั้งหมด</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="exportToExcel"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
            <button
              @click="printReport"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
          <span class="text-gray-900 font-medium">General Ledger</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Transactions -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total Transactions</p>
              <p class="text-3xl font-bold">{{ summary.total_transactions }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-list text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Debit -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Total Debit</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_debit) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-plus-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Credit -->
        <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm font-medium mb-1">Total Credit</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_credit) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-minus-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Balance -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium mb-1">Balance</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.balance) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-balance-scale text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search account, description..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Account -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Account</label>
            <select
              v-model="filters.account_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Accounts</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.account_code }} - {{ account.account_name }}
              </option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              v-model="filters.date_from"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              v-model="filters.date_to"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span v-if="hasActiveFilters" class="inline-flex items-center">
              <i class="fas fa-filter mr-2 text-blue-600"></i>
              Filters active
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-times mr-2"></i>
              Clear Filters
            </button>
            <button
              @click="loadLedger"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-500">Loading ledger entries...</p>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredLedger.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-book text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-medium">No ledger entries found</p>
                    <p class="text-gray-400 text-sm mt-2">Try adjusting your filters or date range</p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="entry in paginatedLedger" :key="entry.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(entry.entry_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ entry.account_code }}</div>
                  <div class="text-sm text-gray-500">{{ entry.account_name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ entry.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ entry.reference }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                  {{ entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                  {{ entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                  {{ formatCurrency(entry.balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing 
            <span class="font-medium">{{ paginationStart }}</span>
            to 
            <span class="font-medium">{{ paginationEnd }}</span>
            of 
            <span class="font-medium">{{ filteredLedger.length }}</span>
            entries
          </div>
          <nav class="flex items-center space-x-2">
            <button
              @click="goToPage(pagination.current_page - 1)"
              :disabled="pagination.current_page <= 1"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                pagination.current_page <= 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <template v-for="page in displayedPages">
              <button
                v-if="page !== '...'"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  page === pagination.current_page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <span v-else :key="`ellipsis-${page}`" class="px-2 text-gray-500">...</span>
            </template>

            <button
              @click="goToPage(pagination.current_page + 1)"
              :disabled="pagination.current_page >= totalPages"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                pagination.current_page >= totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../../plugins/index.js'

export default {
  name: 'GeneralLedgerList',
  data() {
    return {
      loading: false,
      ledgerEntries: [],
      accounts: [],
      filters: {
        search: '',
        account_id: '',
        date_from: '',
        date_to: ''
      },
      summary: {
        total_transactions: 0,
        total_debit: 0,
        total_credit: 0,
        balance: 0
      },
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0
      }
    }
  },
  computed: {
    filteredLedger() {
      let filtered = [...this.ledgerEntries]

      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase()
        filtered = filtered.filter(entry => 
          entry.account_code.toLowerCase().includes(searchLower) ||
          entry.account_name.toLowerCase().includes(searchLower) ||
          entry.description.toLowerCase().includes(searchLower) ||
          entry.reference.toLowerCase().includes(searchLower)
        )
      }

      // Account filter
      if (this.filters.account_id) {
        filtered = filtered.filter(entry => entry.account_id === this.filters.account_id)
      }

      // Date range filter
      if (this.filters.date_from) {
        filtered = filtered.filter(entry => entry.entry_date >= this.filters.date_from)
      }
      if (this.filters.date_to) {
        filtered = filtered.filter(entry => entry.entry_date <= this.filters.date_to)
      }

      return filtered
    },
    paginatedLedger() {
      const start = (this.pagination.current_page - 1) * this.pagination.per_page
      const end = start + this.pagination.per_page
      return this.filteredLedger.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredLedger.length / this.pagination.per_page)
    },
    displayedPages() {
      const pages = []
      const current = this.pagination.current_page
      const total = this.totalPages

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 3) {
          pages.push(1, 2, 3, 4, '...', total)
        } else if (current >= total - 2) {
          pages.push(1, '...', total - 3, total - 2, total - 1, total)
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total)
        }
      }
      return pages
    },
    paginationStart() {
      return ((this.pagination.current_page - 1) * this.pagination.per_page) + 1
    },
    paginationEnd() {
      return Math.min(this.pagination.current_page * this.pagination.per_page, this.filteredLedger.length)
    },
    hasActiveFilters() {
      return this.filters.search || this.filters.account_id || this.filters.date_from || this.filters.date_to
    }
  },
  methods: {
    async loadLedger() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.ledgerEntries = [
          {
            id: 1,
            entry_date: '2024-01-15',
            account_id: 1,
            account_code: '1110',
            account_name: 'Cash',
            description: 'Opening balance',
            reference: 'JV-2024-001',
            debit_amount: 50000,
            credit_amount: 0,
            balance: 50000
          },
          {
            id: 2,
            entry_date: '2024-01-16',
            account_id: 2,
            account_code: '5100',
            account_name: 'Sales Revenue',
            description: 'Sales invoice #INV-001',
            reference: 'JV-2024-002',
            debit_amount: 0,
            credit_amount: 15000,
            balance: 35000
          },
          {
            id: 3,
            entry_date: '2024-01-17',
            account_id: 1,
            account_code: '1110',
            account_name: 'Cash',
            description: 'Payment received',
            reference: 'JV-2024-003',
            debit_amount: 15000,
            credit_amount: 0,
            balance: 50000
          }
        ]

        this.loadSummary()
      } catch (error) {
        console.error('Error loading ledger:', error)
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load general ledger entries'
        })
      } finally {
        this.loading = false
      }
    },
    async loadAccounts() {
      try {
        // Mock data - replace with actual API call
        this.accounts = [
          { id: 1, account_code: '1110', account_name: 'Cash' },
          { id: 2, account_code: '5100', account_name: 'Sales Revenue' }
        ]
      } catch (error) {
        console.error('Error loading accounts:', error)
      }
    },
    loadSummary() {
      this.summary.total_transactions = this.filteredLedger.length
      this.summary.total_debit = this.filteredLedger.reduce((sum, entry) => sum + entry.debit_amount, 0)
      this.summary.total_credit = this.filteredLedger.reduce((sum, entry) => sum + entry.credit_amount, 0)
      this.summary.balance = this.summary.total_debit - this.summary.total_credit
    },
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    clearFilters() {
      this.filters = {
        search: '',
        account_id: '',
        date_from: '',
        date_to: ''
      }
      this.pagination.current_page = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.current_page = page
      }
    },
    exportToExcel() {
      this.$swal({
        icon: 'info',
        title: 'Export to Excel',
        text: 'This feature will be implemented soon'
      })
    },
    printReport() {
      this.$swal({
        icon: 'info',
        title: 'Print Report',
        text: 'This feature will be implemented soon'
      })
    }
  },
  watch: {
    'filters.search': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.account_id': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.date_from': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.date_to': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    }
  },
  mounted() {
    this.loadLedger()
    this.loadAccounts()
  }
}
</script>
