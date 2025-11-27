<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg">
              <i class="fas fa-file-invoice-dollar text-amber-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Tax Management - จัดการภาษี</h1>
              <p class="text-sm text-gray-600 mt-1">จัดการภาษีซื้อ/ขาย และรายงานภาษี</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="createTaxInvoice"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <i class="fas fa-plus mr-2"></i>
              New Tax Invoice
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
          <span class="text-gray-900 font-medium">Tax Management</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Input VAT -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">Input VAT (ภาษีซื้อ)</p>
              <p class="text-3xl font-bold mt-2">{{ formatCurrency(totalInputVAT) }}</p>
              <p class="text-blue-100 text-xs mt-1">{{ taxInvoices.filter(t => t.type === 'input').length }} รายการ</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-shopping-cart text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Output VAT -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Output VAT (ภาษีขาย)</p>
              <p class="text-3xl font-bold mt-2">{{ formatCurrency(totalOutputVAT) }}</p>
              <p class="text-green-100 text-xs mt-1">{{ taxInvoices.filter(t => t.type === 'output').length }} รายการ</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-shopping-bag text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Net VAT Payable -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">Net VAT (ภาษีสุทธิ)</p>
              <p class="text-3xl font-bold mt-2">{{ formatCurrency(netVAT) }}</p>
              <p class="text-purple-100 text-xs mt-1">{{ netVAT >= 0 ? 'ต้องชำระ' : 'ขอคืน' }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-balance-scale text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Withholding Tax -->
        <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-amber-100 text-sm font-medium">Withholding Tax (ภงด.)</p>
              <p class="text-3xl font-bold mt-2">{{ formatCurrency(totalWithholdingTax) }}</p>
              <p class="text-amber-100 text-xs mt-1">{{ withholdingTaxes.length }} รายการ</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-receipt text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Invoice number, vendor..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="input">Input VAT (ภาษีซื้อ)</option>
              <option value="output">Output VAT (ภาษีขาย)</option>
              <option value="withholding">Withholding Tax (ภงด.)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tax Month</label>
            <input
              v-model="filters.tax_month"
              type="month"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-times mr-2"></i>Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tax Invoices Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor/Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Amount
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT Amount
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="invoice in paginatedInvoices"
                :key="invoice.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.invoice_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ invoice.invoice_number }}</div>
                  <div class="text-xs text-gray-500">Tax ID: {{ invoice.tax_id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ invoice.partner_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeBadgeClass(invoice.type)">
                    {{ getTypeLabel(invoice.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {{ formatCurrency(invoice.base_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="invoice.type === 'input' ? 'text-blue-600' : 'text-green-600'">
                  {{ formatCurrency(invoice.vat_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getStatusBadgeClass(invoice.status)">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="viewInvoice(invoice)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="invoice.status === 'pending'"
                      @click="editInvoice(invoice)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="downloadInvoice(invoice)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="Download"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                    <button
                      v-if="invoice.status === 'pending'"
                      @click="deleteInvoice(invoice)"
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

        <!-- Empty State -->
        <div v-if="filteredInvoices.length === 0" class="text-center py-12">
          <i class="fas fa-file-invoice-dollar text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500 text-lg font-medium">No tax invoices found</p>
          <p class="text-gray-400 text-sm mt-2">Try adjusting your filters or create a new tax invoice</p>
        </div>

        <!-- Pagination -->
        <div v-if="filteredInvoices.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredInvoices.length) }} of {{ filteredInvoices.length }} entries
            </div>
            <div class="flex space-x-2">
              <button
                @click="goToPage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                :class="pagination.current_page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-1 border rounded-md text-sm font-medium transition-colors"
                :class="page === pagination.current_page ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page === totalPages"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                :class="pagination.current_page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../../plugins/index.js'

export default {
  name: 'TaxManagementList',
  data() {
    return {
      loading: false,
      filters: {
        search: '',
        type: '',
        tax_month: '',
        status: ''
      },
      pagination: {
        current_page: 1,
        per_page: 10
      },
      taxInvoices: [
        {
          id: 1,
          invoice_date: '2024-01-05',
          invoice_number: 'INV-2024-001',
          partner_name: 'ABC Company Ltd.',
          tax_id: '0105558888999',
          type: 'output',
          base_amount: 100000,
          vat_amount: 7000,
          total_amount: 107000,
          status: 'submitted',
          tax_month: '2024-01'
        },
        {
          id: 2,
          invoice_date: '2024-01-08',
          invoice_number: 'PUR-2024-001',
          partner_name: 'XYZ Supplies Co., Ltd.',
          tax_id: '0105559999888',
          type: 'input',
          base_amount: 50000,
          vat_amount: 3500,
          total_amount: 53500,
          status: 'submitted',
          tax_month: '2024-01'
        },
        {
          id: 3,
          invoice_date: '2024-01-12',
          invoice_number: 'INV-2024-002',
          partner_name: 'DEF Corporation',
          tax_id: '0105557777666',
          type: 'output',
          base_amount: 200000,
          vat_amount: 14000,
          total_amount: 214000,
          status: 'paid',
          tax_month: '2024-01'
        },
        {
          id: 4,
          invoice_date: '2024-01-15',
          invoice_number: 'PUR-2024-002',
          partner_name: 'GHI Trading',
          tax_id: '0105556666555',
          type: 'input',
          base_amount: 75000,
          vat_amount: 5250,
          total_amount: 80250,
          status: 'pending',
          tax_month: '2024-01'
        },
        {
          id: 5,
          invoice_date: '2024-01-18',
          invoice_number: 'INV-2024-003',
          partner_name: 'JKL Services Ltd.',
          tax_id: '0105555555444',
          type: 'output',
          base_amount: 150000,
          vat_amount: 10500,
          total_amount: 160500,
          status: 'pending',
          tax_month: '2024-01'
        }
      ],
      withholdingTaxes: [
        {
          id: 1,
          date: '2024-01-10',
          reference: 'WT-2024-001',
          vendor_name: 'ABC Consultant',
          type: 'pnd3',
          base_amount: 100000,
          tax_rate: 3,
          tax_amount: 3000,
          status: 'submitted'
        },
        {
          id: 2,
          date: '2024-01-20',
          reference: 'WT-2024-002',
          vendor_name: 'XYZ Services',
          type: 'pnd53',
          base_amount: 50000,
          tax_rate: 5,
          tax_amount: 2500,
          status: 'pending'
        }
      ]
    }
  },
  computed: {
    filteredInvoices() {
      let result = this.taxInvoices

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(search) ||
          invoice.partner_name.toLowerCase().includes(search) ||
          invoice.tax_id.includes(search)
        )
      }

      // Type filter
      if (this.filters.type) {
        result = result.filter(invoice => invoice.type === this.filters.type)
      }

      // Tax month filter
      if (this.filters.tax_month) {
        result = result.filter(invoice => invoice.tax_month === this.filters.tax_month)
      }

      // Status filter
      if (this.filters.status) {
        result = result.filter(invoice => invoice.status === this.filters.status)
      }

      return result
    },
    paginatedInvoices() {
      const start = (this.pagination.current_page - 1) * this.pagination.per_page
      const end = start + this.pagination.per_page
      return this.filteredInvoices.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredInvoices.length / this.pagination.per_page)
    },
    startIndex() {
      return (this.pagination.current_page - 1) * this.pagination.per_page
    },
    endIndex() {
      return this.startIndex + this.pagination.per_page
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.pagination.current_page
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    },
    totalInputVAT() {
      return this.taxInvoices
        .filter(t => t.type === 'input')
        .reduce((sum, t) => sum + t.vat_amount, 0)
    },
    totalOutputVAT() {
      return this.taxInvoices
        .filter(t => t.type === 'output')
        .reduce((sum, t) => sum + t.vat_amount, 0)
    },
    netVAT() {
      return this.totalOutputVAT - this.totalInputVAT
    },
    totalWithholdingTax() {
      return this.withholdingTaxes.reduce((sum, t) => sum + t.tax_amount, 0)
    }
  },
  methods: {
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
        input: 'Input VAT (ภาษีซื้อ)',
        output: 'Output VAT (ภาษีขาย)',
        withholding: 'Withholding Tax (ภงด.)'
      }
      return labels[type] || type
    },
    getTypeBadgeClass(type) {
      const classes = {
        input: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        output: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        withholding: 'px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800'
      }
      return classes[type] || classes.input
    },
    getStatusLabel(status) {
      const labels = {
        pending: 'Pending',
        submitted: 'Submitted',
        paid: 'Paid'
      }
      return labels[status] || status
    },
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        submitted: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        paid: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
      }
      return classes[status] || classes.pending
    },
    clearFilters() {
      this.filters = {
        search: '',
        type: '',
        tax_month: '',
        status: ''
      }
      this.pagination.current_page = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== '...') {
        this.pagination.current_page = page
      }
    },
    createTaxInvoice() {
      this.$swal({
        icon: 'info',
        title: 'Create Tax Invoice',
        text: 'This feature will be implemented soon'
      })
    },
    viewInvoice(invoice) {
      this.$swal({
        icon: 'info',
        title: 'View Invoice',
        text: `View details for ${invoice.invoice_number}`
      })
    },
    editInvoice(invoice) {
      this.$swal({
        icon: 'info',
        title: 'Edit Invoice',
        text: `Edit ${invoice.invoice_number}`
      })
    },
    downloadInvoice(invoice) {
      this.$swal({
        icon: 'success',
        title: 'Download Invoice',
        text: `Downloading ${invoice.invoice_number}...`
      })
    },
    deleteInvoice(invoice) {
      this.$swal({
        title: 'Are you sure?',
        text: `Delete tax invoice ${invoice.invoice_number}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Delete logic here
          this.$swal('Deleted!', 'Tax invoice has been deleted.', 'success')
        }
      })
    }
  },
  watch: {
    'filters.search': function() {
      this.pagination.current_page = 1
    },
    'filters.type': function() {
      this.pagination.current_page = 1
    },
    'filters.tax_month': function() {
      this.pagination.current_page = 1
    },
    'filters.status': function() {
      this.pagination.current_page = 1
    }
  },
  mounted() {
    console.log('Tax Management List loaded with', this.taxInvoices.length, 'invoices')
  }
}
</script>
