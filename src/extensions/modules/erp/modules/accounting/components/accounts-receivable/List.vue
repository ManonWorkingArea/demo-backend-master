<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <i class="fas fa-file-invoice text-green-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Accounts Receivable - ลูกหนี้</h1>
              <p class="text-sm text-gray-600 mt-1">จัดการใบแจ้งหนี้และการรับชำระเงินจากลูกค้า</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Uncomment when route is available
            <router-link
              :to="{ name: 'accounting-receivable-create' }"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              New Receivable
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
          <span class="text-gray-900 font-medium">Accounts Receivable</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Receivables -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total Receivables</p>
              <p class="text-3xl font-bold">{{ summary.total_receivables }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-file-invoice text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Unpaid -->
        <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium mb-1">Unpaid</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.unpaid_amount) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-hourglass-half text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Overdue -->
        <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm font-medium mb-1">Overdue</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.overdue_amount) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-exclamation-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Collected This Month -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Collected This Month</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.collected_this_month) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-money-bill-wave text-2xl"></i>
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
                placeholder="Search invoice, customer..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Customer -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              v-model="filters.customer_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Customers</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              v-model="filters.due_date"
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
              @click="loadReceivables"
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
                  Invoice Number
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="9" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-500">Loading receivables...</p>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredReceivables.length === 0">
                <td colspan="9" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-file-invoice text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-medium">No receivables found</p>
                    <p class="text-gray-400 text-sm mt-2">Create your first customer invoice</p>
                    <!-- Uncomment when route is available
                    <router-link
                      :to="{ name: 'accounting-receivable-create' }"
                      class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i class="fas fa-plus mr-2"></i>
                      New Receivable
                    </router-link>
                    -->
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-else v-for="receivable in paginatedReceivables" :key="receivable.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ receivable.invoice_number }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ receivable.customer_name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(receivable.invoice_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm" :class="isOverdue(receivable.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'">
                    {{ formatDate(receivable.due_date) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {{ formatCurrency(receivable.total_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  {{ formatCurrency(receivable.received_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                  {{ formatCurrency(receivable.balance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getStatusBadgeClass(receivable.status)">
                    {{ getStatusLabel(receivable.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="viewReceivable(receivable)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="receivable.status !== 'paid' && receivable.status !== 'cancelled'"
                      @click="receivePayment(receivable)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="Receive Payment"
                    >
                      <i class="fas fa-hand-holding-usd"></i>
                    </button>
                    <button
                      v-if="receivable.status === 'draft'"
                      @click="editReceivable(receivable)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      v-if="receivable.status === 'draft'"
                      @click="deleteReceivable(receivable)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
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
            <span class="font-medium">{{ filteredReceivables.length }}</span>
            receivables
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
  name: 'AccountsReceivableList',
  data() {
    return {
      loading: false,
      receivables: [],
      customers: [],
      filters: {
        search: '',
        customer_id: '',
        status: '',
        due_date: ''
      },
      summary: {
        total_receivables: 0,
        unpaid_amount: 0,
        overdue_amount: 0,
        collected_this_month: 0
      },
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0
      }
    }
  },
  computed: {
    filteredReceivables() {
      let filtered = [...this.receivables]

      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase()
        filtered = filtered.filter(receivable => 
          receivable.invoice_number.toLowerCase().includes(searchLower) ||
          receivable.customer_name.toLowerCase().includes(searchLower)
        )
      }

      // Customer filter
      if (this.filters.customer_id) {
        filtered = filtered.filter(receivable => receivable.customer_id === this.filters.customer_id)
      }

      // Status filter
      if (this.filters.status) {
        filtered = filtered.filter(receivable => receivable.status === this.filters.status)
      }

      // Due date filter
      if (this.filters.due_date) {
        filtered = filtered.filter(receivable => receivable.due_date === this.filters.due_date)
      }

      return filtered
    },
    paginatedReceivables() {
      const start = (this.pagination.current_page - 1) * this.pagination.per_page
      const end = start + this.pagination.per_page
      return this.filteredReceivables.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredReceivables.length / this.pagination.per_page)
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
      return Math.min(this.pagination.current_page * this.pagination.per_page, this.filteredReceivables.length)
    },
    hasActiveFilters() {
      return this.filters.search || this.filters.customer_id || this.filters.status || this.filters.due_date
    }
  },
  methods: {
    async loadReceivables() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.receivables = [
          {
            id: 1,
            invoice_number: 'AR-2024-001',
            customer_id: 1,
            customer_name: 'ABC Company Ltd.',
            invoice_date: '2024-01-15',
            due_date: '2024-02-15',
            total_amount: 100000,
            received_amount: 0,
            balance: 100000,
            status: 'pending'
          },
          {
            id: 2,
            invoice_number: 'AR-2024-002',
            customer_id: 2,
            customer_name: 'XYZ Corporation',
            invoice_date: '2024-01-10',
            due_date: '2024-01-20',
            total_amount: 50000,
            received_amount: 0,
            balance: 50000,
            status: 'overdue'
          },
          {
            id: 3,
            invoice_number: 'AR-2024-003',
            customer_id: 1,
            customer_name: 'ABC Company Ltd.',
            invoice_date: '2024-01-05',
            due_date: '2024-02-05',
            total_amount: 75000,
            received_amount: 75000,
            balance: 0,
            status: 'paid'
          }
        ]

        this.loadSummary()
      } catch (error) {
        console.error('Error loading receivables:', error)
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load accounts receivable'
        })
      } finally {
        this.loading = false
      }
    },
    async loadCustomers() {
      try {
        // Mock data - replace with actual API call
        this.customers = [
          { id: 1, name: 'ABC Company Ltd.' },
          { id: 2, name: 'XYZ Corporation' }
        ]
      } catch (error) {
        console.error('Error loading customers:', error)
      }
    },
    loadSummary() {
      this.summary.total_receivables = this.receivables.length
      this.summary.unpaid_amount = this.receivables
        .filter(r => r.status !== 'paid' && r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.balance, 0)
      this.summary.overdue_amount = this.receivables
        .filter(r => r.status === 'overdue')
        .reduce((sum, r) => sum + r.balance, 0)
      
      const thisMonth = new Date().toISOString().slice(0, 7)
      this.summary.collected_this_month = this.receivables
        .filter(r => r.status === 'paid' && r.invoice_date.startsWith(thisMonth))
        .reduce((sum, r) => sum + r.received_amount, 0)
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
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date() && dueDate !== ''
    },
    getStatusLabel(status) {
      const labels = {
        draft: 'Draft',
        pending: 'Pending',
        partial: 'Partial',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled'
      }
      return labels[status] || status
    },
    getStatusBadgeClass(status) {
      const classes = {
        draft: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
        pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        partial: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        paid: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        overdue: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
        cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
      }
      return classes[status] || classes.draft
    },
    clearFilters() {
      this.filters = {
        search: '',
        customer_id: '',
        status: '',
        due_date: ''
      }
      this.pagination.current_page = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.current_page = page
      }
    },
    receivePayment(receivable) {
      this.$swal({
        icon: 'info',
        title: 'Receive Payment',
        text: `Receive payment for ${receivable.invoice_number}`
      })
    },
    deleteReceivable(receivable) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete receivable ${receivable.invoice_number}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Delete logic here
          this.$swal('Deleted!', 'Receivable has been deleted.', 'success')
        }
      })
    }
  },
  watch: {
    'filters.search': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.customer_id': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.status': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    },
    'filters.due_date': function() {
      this.pagination.current_page = 1
      this.loadSummary()
    }
  },
  mounted() {
    this.loadReceivables()
    this.loadCustomers()
  }
}
</script>
