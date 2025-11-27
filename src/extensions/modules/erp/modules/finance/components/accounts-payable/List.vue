<template>
  <div class="accounts-payable-list">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title">
              <i class="fas fa-file-invoice-dollar"></i>
              Accounts Payable (AP) - เจ้าหนี้
            </h5>
            <div class="card-tools">
              <button type="button" class="btn btn-primary" @click="createInvoice">
                <i class="fas fa-plus"></i>
                สร้างใบแจ้งหนี้เจ้าหนี้
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Search & Filters -->
            <div class="row mb-3">
              <div class="col-md-3">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="filters.search"
                  placeholder="ค้นหา..."
                />
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filters.status">
                  <option value="">ทุกสถานะ</option>
                  <option value="draft">แบบร่าง</option>
                  <option value="pending">รอชำระ</option>
                  <option value="partial">ชำระบางส่วน</option>
                  <option value="paid">ชำระแล้ว</option>
                  <option value="overdue">เกินกำหนด</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filters.supplier">
                  <option value="">ทุกซัพพลายเออร์</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <button class="btn btn-outline-primary me-2" @click="searchInvoices">
                  <i class="fas fa-search"></i>
                  ค้นหา
                </button>
                <button class="btn btn-outline-secondary" @click="resetFilters">
                  <i class="fas fa-undo"></i>
                  ล้าง
                </button>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card bg-info text-white">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div>
                        <h6 class="card-title">รอชำระ</h6>
                        <h4>{{ formatCurrency(summary.pending) }}</h4>
                      </div>
                      <div class="align-self-center">
                        <i class="fas fa-clock fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-warning text-white">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div>
                        <h6 class="card-title">เกินกำหนด</h6>
                        <h4>{{ formatCurrency(summary.overdue) }}</h4>
                      </div>
                      <div class="align-self-center">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div>
                        <h6 class="card-title">ชำระแล้ว</h6>
                        <h4>{{ formatCurrency(summary.paid) }}</h4>
                      </div>
                      <div class="align-self-center">
                        <i class="fas fa-check-circle fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div>
                        <h6 class="card-title">รวมทั้งหมด</h6>
                        <h4>{{ formatCurrency(summary.total) }}</h4>
                      </div>
                      <div class="align-self-center">
                        <i class="fas fa-calculator fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- AP Table -->
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>เลขที่ใบแจ้งหนี้</th>
                    <th>ซัพพลายเออร์</th>
                    <th>วันที่ออกใบแจ้งหนี้</th>
                    <th>วันที่ครบกำหนด</th>
                    <th>จำนวนเงิน</th>
                    <th>ชำระแล้ว</th>
                    <th>คงเหลือ</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="9" class="text-center">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="invoices.length === 0">
                    <td colspan="9" class="text-center text-muted">ไม่มีข้อมูล</td>
                  </tr>
                  <tr v-else v-for="invoice in invoices" :key="invoice.id">
                    <td>{{ invoice.invoice_number }}</td>
                    <td>{{ invoice.supplier_name }}</td>
                    <td>{{ formatDate(invoice.invoice_date) }}</td>
                    <td>{{ formatDate(invoice.due_date) }}</td>
                    <td class="text-end">{{ formatCurrency(invoice.total_amount) }}</td>
                    <td class="text-end">{{ formatCurrency(invoice.paid_amount) }}</td>
                    <td class="text-end">{{ formatCurrency(invoice.remaining_amount) }}</td>
                    <td>
                      <span :class="getStatusClass(invoice.status)">
                        {{ getStatusText(invoice.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary"
                          @click="viewDetail(invoice.id)"
                          title="ดูรายละเอียด"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          v-if="canEdit(invoice)"
                          type="button" 
                          class="btn btn-outline-warning"
                          @click="editInvoice(invoice.id)"
                          title="แก้ไข"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          v-if="canPay(invoice)"
                          type="button" 
                          class="btn btn-outline-success"
                          @click="makePayment(invoice.id)"
                          title="ชำระเงิน"
                        >
                          <i class="fas fa-money-check-alt"></i>
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary"
                          @click="printInvoice(invoice.id)"
                          title="พิมพ์"
                        >
                          <i class="fas fa-print"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                แสดง {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
                {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
                จาก {{ pagination.total }} รายการ
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                    <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page - 1)">
                      ก่อนหน้า
                    </a>
                  </li>
                  <li 
                    v-for="page in visiblePages" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: page === pagination.current_page }"
                  >
                    <a class="page-link" href="#" @click.prevent="goToPage(page)">
                      {{ page }}
                    </a>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.current_page >= pagination.last_page }">
                    <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page + 1)">
                      ถัดไป
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountsPayableList',
  data() {
    return {
      loading: false,
      invoices: [],
      suppliers: [],
      summary: {
        pending: 0,
        overdue: 0,
        paid: 0,
        total: 0
      },
      filters: {
        search: '',
        status: '',
        supplier: ''
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
    await this.loadSuppliers()
    await this.loadInvoices()
    await this.loadSummary()
  },
  methods: {
    async loadInvoices(page = 1) {
      this.loading = true
      try {
        const response = await this.apiCall('/api/finance/accounts-payable', {
          method: 'GET',
          params: {
            page,
            per_page: this.pagination.per_page,
            search: this.filters.search,
            status: this.filters.status,
            supplier: this.filters.supplier
          }
        })

        if (response.success) {
          this.invoices = response.data.data
          this.pagination = response.data.pagination
        }
      } catch (error) {
        console.error('Load AP invoices error:', error)
        this.$swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถโหลดข้อมูลได้', 'error')
      } finally {
        this.loading = false
      }
    },

    async loadSuppliers() {
      try {
        // Use dynamic loading from purchase module if available
        if (window.ERP_CORE?.modules?.purchase?.getSuppliers) {
          this.suppliers = await window.ERP_CORE.modules.purchase.getSuppliers()
        } else {
          const response = await this.apiCall('/api/suppliers')
          if (response.success) {
            this.suppliers = response.data
          }
        }
      } catch (error) {
        console.error('Load suppliers error:', error)
      }
    },

    async loadSummary() {
      try {
        const response = await this.apiCall('/api/finance/accounts-payable/summary')
        if (response.success) {
          this.summary = response.data
        }
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    searchInvoices() {
      this.loadInvoices(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        status: '',
        supplier: ''
      }
      this.loadInvoices(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadInvoices(page)
      }
    },

    createInvoice() {
      this.$router.push({ name: 'finance-ap-create-invoice' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'finance-ap-detail', params: { id } })
    },

    editInvoice(id) {
      this.$router.push({ name: 'finance-ap-edit', params: { id } })
    },

    makePayment(id) {
      this.$router.push({ name: 'finance-ap-payment', params: { id } })
    },

    printInvoice(id) {
      window.open(
        this.$router.resolve({ name: 'finance-ap-print', params: { id } }).href,
        '_blank'
      )
    },

    canEdit(invoice) {
      return ['draft', 'pending'].includes(invoice.status)
    },

    canPay(invoice) {
      return ['pending', 'partial'].includes(invoice.status) && invoice.remaining_amount > 0
    },

    getStatusClass(status) {
      const classes = {
        draft: 'badge bg-secondary',
        pending: 'badge bg-warning',
        partial: 'badge bg-info',
        paid: 'badge bg-success',
        overdue: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        draft: 'แบบร่าง',
        pending: 'รอชำระ',
        partial: 'ชำระบางส่วน',
        paid: 'ชำระแล้ว',
        overdue: 'เกินกำหนด'
      }
      return texts[status] || status
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH')
    },

    formatCurrency(amount) {
      if (!amount) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount)
    },

    async apiCall(url, options = {}) {
      // Use dynamic loading for API calls
      if (window.ERP_CORE?.modules?.finance?.apiCall) {
        return await window.ERP_CORE.modules.finance.apiCall(url, options)
      }
      
      // Fallback to global API
      const method = options.method || 'GET'
      let fullUrl = url
      
      if (options.params && method === 'GET') {
        const params = new URLSearchParams(options.params)
        fullUrl += `?${params.toString()}`
      }
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }
      
      if (options.data && method !== 'GET') {
        config.body = JSON.stringify(options.data)
      }
      
      const response = await fetch(fullUrl, config)
      return await response.json()
    }
  }
}
</script>

<style scoped>
.accounts-payable-list {
  padding: 1rem;
}

.card-tools .btn {
  margin-left: 0.5rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.pagination {
  margin: 0;
}

.card {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.card-body {
  padding: 1.5rem;
}
</style>