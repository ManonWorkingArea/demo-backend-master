<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
              <i class="fas fa-money-bill-wave text-teal-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Cash & Bank - เงินสดและธนาคาร</h1>
              <p class="text-sm text-gray-600 mt-1">จัดการเงินสด เงินฝากธนาคาร และกระทบยอดธนาคาร</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Uncomment when route is available
            <router-link
              :to="{ name: 'accounting-cash-bank-create' }"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              New Transaction
            </router-link>
            -->
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
          <span class="text-gray-900 font-medium">Cash & Bank</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Cash Balance -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Cash Balance</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.cash_balance) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-wallet text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Bank Balance -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Bank Balance</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.bank_balance) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-university text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Total In -->
        <div class="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-teal-100 text-sm font-medium mb-1">Total In (Month)</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_in) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-arrow-down text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Out -->
        <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm font-medium mb-1">Total Out (Month)</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_out) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-arrow-up text-2xl"></i>
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
                placeholder="Search description..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Account Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              v-model="filters.account_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          <!-- Transaction Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <select
              v-model="filters.transaction_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Transactions</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              v-model="filters.date"
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
              @click="loadTransactions"
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
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-500">Loading transactions...</p>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredTransactions.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-money-bill-wave text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-medium">No transactions found</p>
                    <p class="text-gray-400 text-sm mt-2">Create your first cash/bank transaction</p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="transaction in paginatedTransactions" :key="transaction.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.transaction_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                      transaction.account_type === 'cash' ? 'bg-green-100' : 'bg-blue-100'
                    ]">
                      <i :class="[
                        'text-sm',
                        transaction.account_type === 'cash' ? 'fas fa-wallet text-green-600' : 'fas fa-university text-blue-600'
                      ]"></i>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ transaction.account_name }}</div>
                      <div class="text-sm text-gray-500">{{ transaction.account_number || '-' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ transaction.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getTypeBadgeClass(transaction.transaction_type)">
                    {{ getTypeLabel(transaction.transaction_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span :class="transaction.transaction_type === 'deposit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                    {{ transaction.transaction_type === 'deposit' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                  {{ formatCurrency(transaction.balance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="viewTransaction(transaction)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
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
            <span class="font-medium">{{ filteredTransactions.length }}</span>
            transactions
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
  name: 'CashBankList',
  data() {
    return {
      loading: false,
      transactions: [],
      filters: {
        search: '',
        account_type: '',
        transaction_type: '',
        date: ''
      },
      summary: {
        cash_balance: 0,
        bank_balance: 0,
        total_in: 0,
        total_out: 0
      },
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0
      }
    }
  },
  computed: {
    filteredTransactions() {
      let filtered = [...this.transactions]

      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase()
        filtered = filtered.filter(t => 
          t.description.toLowerCase().includes(searchLower) ||
          t.account_name.toLowerCase().includes(searchLower)
        )
      }

      if (this.filters.account_type) {
        filtered = filtered.filter(t => t.account_type === this.filters.account_type)
      }

      if (this.filters.transaction_type) {
        filtered = filtered.filter(t => t.transaction_type === this.filters.transaction_type)
      }

      if (this.filters.date) {
        filtered = filtered.filter(t => t.transaction_date === this.filters.date)
      }

      return filtered
    },
    paginatedTransactions() {
      const start = (this.pagination.current_page - 1) * this.pagination.per_page
      const end = start + this.pagination.per_page
      return this.filteredTransactions.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredTransactions.length / this.pagination.per_page)
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
      return Math.min(this.pagination.current_page * this.pagination.per_page, this.filteredTransactions.length)
    },
    hasActiveFilters() {
      return this.filters.search || this.filters.account_type || this.filters.transaction_type || this.filters.date
    }
  },
  methods: {
    async loadTransactions() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.transactions = [
          {
            id: 1,
            transaction_date: '2024-01-15',
            account_type: 'cash',
            account_name: 'Petty Cash',
            account_number: null,
            description: 'Initial cash balance',
            transaction_type: 'deposit',
            amount: 10000,
            balance: 10000
          },
          {
            id: 2,
            transaction_date: '2024-01-16',
            account_type: 'bank',
            account_name: 'Bangkok Bank',
            account_number: '123-4-56789-0',
            description: 'Opening balance',
            transaction_type: 'deposit',
            amount: 500000,
            balance: 500000
          },
          {
            id: 3,
            transaction_date: '2024-01-17',
            account_type: 'cash',
            account_name: 'Petty Cash',
            account_number: null,
            description: 'Office supplies purchase',
            transaction_type: 'withdrawal',
            amount: 1500,
            balance: 8500
          }
        ]

        this.loadSummary()
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        this.loading = false
      }
    },
    loadSummary() {
      this.summary.cash_balance = this.transactions
        .filter(t => t.account_type === 'cash')
        .reduce((sum, t) => sum + (t.transaction_type === 'deposit' ? t.amount : -t.amount), 0)
      
      this.summary.bank_balance = this.transactions
        .filter(t => t.account_type === 'bank')
        .reduce((sum, t) => sum + (t.transaction_type === 'deposit' ? t.amount : -t.amount), 0)
      
      const thisMonth = new Date().toISOString().slice(0, 7)
      this.summary.total_in = this.transactions
        .filter(t => t.transaction_type === 'deposit' && t.transaction_date.startsWith(thisMonth))
        .reduce((sum, t) => sum + t.amount, 0)
      
      this.summary.total_out = this.transactions
        .filter(t => t.transaction_type === 'withdrawal' && t.transaction_date.startsWith(thisMonth))
        .reduce((sum, t) => sum + t.amount, 0)
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
    getTypeLabel(type) {
      const labels = {
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        transfer: 'Transfer'
      }
      return labels[type] || type
    },
    getTypeBadgeClass(type) {
      const classes = {
        deposit: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        withdrawal: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
        transfer: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
      }
      return classes[type] || classes.deposit
    },
    clearFilters() {
      this.filters = {
        search: '',
        account_type: '',
        transaction_type: '',
        date: ''
      }
      this.pagination.current_page = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.current_page = page
      }
    },
    viewTransaction(transaction) {
      this.$swal({
        icon: 'info',
        title: 'Transaction Details',
        text: `View details for transaction #${transaction.id}`
      })
    }
  },
  watch: {
    'filters.search': function() {
      this.pagination.current_page = 1
    },
    'filters.account_type': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.transaction_type': function() {
      this.pagination.current_page = 1
    },
    'filters.date': function() {
      this.pagination.current_page = 1
    }
  },
  mounted() {
    this.loadTransactions()
  }
}
</script>
