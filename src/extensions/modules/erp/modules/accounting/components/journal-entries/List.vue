<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-pen-alt text-indigo-500"></i>
              Journal Entries - รายการบันทึกบัญชี
            </h1>
            <p class="mt-2 text-gray-600">จัดการรายการบันทึกบัญชีทั้งหมด</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="loadEntries"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="createEntry"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้างรายการใหม่
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
              <router-link 
                to="/" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Home
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <router-link 
                  to="/accounting" 
                  class="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Accounting
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Journal Entries</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Entries -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">รายการทั้งหมด</p>
              <p class="text-3xl font-bold mt-2">{{ summary.total }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-file-alt text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Draft -->
        <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">Draft</p>
              <p class="text-3xl font-bold mt-2">{{ summary.draft }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-edit text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Posted -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Posted</p>
              <p class="text-3xl font-bold mt-2">{{ summary.posted }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-check-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Cancelled -->
        <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm font-medium">Cancelled</p>
              <p class="text-3xl font-bold mt-2">{{ summary.cancelled }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-times-circle text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <!-- Search Box -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input 
                type="text" 
                v-model="filters.search"
                placeholder="ค้นหาเลขที่, คำอธิบาย..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <select v-model="filters.journal_type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุกประเภท</option>
              <option value="general">ทั่วไป</option>
              <option value="sales">ขาย</option>
              <option value="purchase">ซื้อ</option>
              <option value="payment">จ่ายเงิน</option>
              <option value="receipt">รับเงิน</option>
              <option value="adjustment">ปรับปรุง</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="filters.state" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุกสถานะ</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Date Filter -->
          <div>
            <input 
              type="date" 
              v-model="filters.date_from"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button 
              @click="searchEntries"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-search"></i>
            </button>
            <button 
              @click="resetFilters"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>
      </div>
            <!-- Journal Entries Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="entries.length === 0" class="text-center py-12">
          <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">ไม่มีรายการบันทึกบัญชี</p>
          <button 
            @click="createEntry"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            สร้างรายการใหม่
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่รายการ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in entries" :key="entry.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ entry.entry_number }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(entry.entry_date) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeBadgeClass(entry.journal_type)">
                    {{ getTypeLabel(entry.journal_type) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ entry.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(entry.total_debit) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(entry.total_credit) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getStatusBadgeClass(entry.state)">
                    {{ getStatusLabel(entry.state) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div class="flex space-x-2 justify-end">
                    <button 
                      @click="viewDetail(entry.id)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      v-if="entry.state === 'draft'"
                      @click="editEntry(entry.id)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="entry.state === 'draft'"
                      @click="postEntry(entry.id)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="Post"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      v-if="entry.state === 'posted'"
                      @click="reverseEntry(entry.id)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      title="Reverse"
                    >
                      <i class="fas fa-undo"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          แสดง <span class="font-medium">{{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}</span> - 
          <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> 
          จาก <span class="font-medium">{{ pagination.total }}</span> รายการ
        </div>
        <nav class="flex space-x-2">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            :class="pagination.current_page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ก่อนหน้า
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-4 py-2 rounded-lg transition-colors"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            :class="pagination.current_page >= pagination.last_page ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ถัดไป
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JournalEntriesList',
  data() {
    return {
      loading: false,
      entries: [],
      summary: {
        total: 0,
        draft: 0,
        posted: 0,
        cancelled: 0
      },
      filters: {
        search: '',
        journal_type: '',
        state: '',
        date_from: ''
      },
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1
      }
    }
  },
  computed: {
    visiblePages() {
      const pages = []
      const current = this.pagination.current_page
      const last = this.pagination.last_page
      
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  async mounted() {
    await this.loadEntries()
    await this.loadSummary()
  },
  methods: {
    async loadEntries(page = 1) {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const mockEntries = [
          {
            id: 1,
            entry_number: 'JE-20251105-0001',
            entry_date: '2025-11-05',
            journal_type: 'sales',
            description: 'รายการขาย SO-2025-001',
            total_debit: 107000,
            total_credit: 107000,
            state: 'posted'
          },
          {
            id: 2,
            entry_number: 'JE-20251105-0002',
            entry_date: '2025-11-05',
            journal_type: 'purchase',
            description: 'รายการซื้อ PO-2025-015',
            total_debit: 53500,
            total_credit: 53500,
            state: 'posted'
          },
          {
            id: 3,
            entry_number: 'JE-20251105-0003',
            entry_date: '2025-11-05',
            journal_type: 'payment',
            description: 'ชำระเงินผู้ขาย',
            total_debit: 10000,
            total_credit: 10000,
            state: 'draft'
          }
        ]

        this.entries = mockEntries
        this.pagination = {
          current_page: page,
          per_page: 20,
          total: mockEntries.length,
          last_page: 1
        }

      } catch (error) {
        console.error('Load entries error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadSummary() {
      try {
        // Mock data - calculate from entries
        this.summary = {
          total: 3,
          draft: 1,
          posted: 2,
          cancelled: 0
        }
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    searchEntries() {
      this.loadEntries(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        journal_type: '',
        state: '',
        date_from: ''
      }
      this.loadEntries(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadEntries(page)
      }
    },

    createEntry() {
      this.$router.push({ name: 'accounting-journal-create' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'accounting-journal-detail', params: { id } })
    },

    editEntry(id) {
      this.$router.push({ name: 'accounting-journal-create', query: { id } })
    },

    async postEntry(id) {
      if (confirm('ต้องการ Post รายการนี้หรือไม่?')) {
        // API call to post entry
        console.log('Posting entry:', id)
        await this.loadEntries(this.pagination.current_page)
      }
    },

    async reverseEntry(id) {
      if (confirm('ต้องการ Reverse รายการนี้หรือไม่?')) {
        // API call to reverse entry
        console.log('Reversing entry:', id)
        await this.loadEntries(this.pagination.current_page)
      }
    },

    getTypeBadgeClass(type) {
      const classes = {
        general: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
        sales: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        purchase: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        payment: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
        receipt: 'px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800',
        adjustment: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'
      }
      return classes[type] || classes.general
    },

    getTypeLabel(type) {
      const labels = {
        general: 'ทั่วไป',
        sales: 'ขาย',
        purchase: 'ซื้อ',
        payment: 'จ่ายเงิน',
        receipt: 'รับเงิน',
        adjustment: 'ปรับปรุง'
      }
      return labels[type] || type
    },

    getStatusBadgeClass(status) {
      const classes = {
        draft: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        posted: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
        reversed: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
      }
      return classes[status] || classes.draft
    },

    getStatusLabel(status) {
      const labels = {
        draft: 'Draft',
        posted: 'Posted',
        cancelled: 'Cancelled',
        reversed: 'Reversed'
      }
      return labels[status] || status
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    formatCurrency(amount) {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>
