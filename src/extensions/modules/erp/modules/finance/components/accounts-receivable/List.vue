<template>
  <div class="accounts-receivable-list">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title">
              <i class="fas fa-hand-holding-usd"></i>
              Accounts Receivable (AR) - ลูกหนี้
            </h5>
            <div class="card-tools">
              <button type="button" class="btn btn-primary" @click="createInvoice">
                <i class="fas fa-plus"></i>
                สร้างใบแจ้งหนี้ลูกหนี้
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Similar structure to AP List but for customers -->
            <div class="row mb-3">
              <div class="col-md-3">
                <input type="text" class="form-control" v-model="filters.search" placeholder="ค้นหา..."/>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filters.status">
                  <option value="">ทุกสถานะ</option>
                  <option value="draft">แบบร่าง</option>
                  <option value="pending">รอรับชำระ</option>
                  <option value="partial">รับชำระบางส่วน</option>
                  <option value="paid">รับชำระแล้ว</option>
                  <option value="overdue">เกินกำหนด</option>
                </select>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card bg-info text-white">
                  <div class="card-body">
                    <h6 class="card-title">รอรับชำระ</h6>
                    <h4>{{ formatCurrency(summary.pending) }}</h4>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-warning text-white">
                  <div class="card-body">
                    <h6 class="card-title">เกินกำหนด</h6>
                    <h4>{{ formatCurrency(summary.overdue) }}</h4>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <h6 class="card-title">รับชำระแล้ว</h6>
                    <h4>{{ formatCurrency(summary.paid) }}</h4>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <h6 class="card-title">รวมทั้งหมด</h6>
                    <h4>{{ formatCurrency(summary.total) }}</h4>
                  </div>
                </div>
              </div>
            </div>

            <!-- AR Table -->
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>เลขที่ใบแจ้งหนี้</th>
                    <th>ลูกค้า</th>
                    <th>วันที่ออกใบแจ้งหนี้</th>
                    <th>วันที่ครบกำหนด</th>
                    <th>จำนวนเงิน</th>
                    <th>รับชำระแล้ว</th>
                    <th>คงเหลือ</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="9" class="text-center">
                      <div class="spinner-border" role="status"></div>
                    </td>
                  </tr>
                  <tr v-else-if="invoices.length === 0">
                    <td colspan="9" class="text-center text-muted">ไม่มีข้อมูล</td>
                  </tr>
                  <tr v-else v-for="invoice in invoices" :key="invoice.id">
                    <td>{{ invoice.invoice_number }}</td>
                    <td>{{ invoice.customer_name }}</td>
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
                        <button type="button" class="btn btn-outline-primary" @click="viewDetail(invoice.id)">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button v-if="canEdit(invoice)" type="button" class="btn btn-outline-warning" @click="editInvoice(invoice.id)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button v-if="canReceive(invoice)" type="button" class="btn btn-outline-success" @click="receivePayment(invoice.id)">
                          <i class="fas fa-money-bill-wave"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountsReceivableList',
  data() {
    return {
      loading: false,
      invoices: [],
      summary: { pending: 0, overdue: 0, paid: 0, total: 0 },
      filters: { search: '', status: '' }
    }
  },
  async mounted() {
    await this.loadInvoices()
    await this.loadSummary()
  },
  methods: {
    async loadInvoices() {
      this.loading = true
      try {
        const response = await this.apiCall('/api/finance/accounts-receivable')
        if (response.success) {
          this.invoices = response.data.data
        }
      } catch (error) {
        console.error('Load AR invoices error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadSummary() {
      try {
        const response = await this.apiCall('/api/finance/accounts-receivable/summary')
        if (response.success) this.summary = response.data
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    createInvoice() {
      this.$router.push({ name: 'finance-ar-create-invoice' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'finance-ar-detail', params: { id } })
    },

    editInvoice(id) {
      this.$router.push({ name: 'finance-ar-edit', params: { id } })
    },

    receivePayment(id) {
      this.$router.push({ name: 'finance-ar-receipt', params: { id } })
    },

    canEdit(invoice) {
      return ['draft', 'pending'].includes(invoice.status)
    },

    canReceive(invoice) {
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
        pending: 'รอรับชำระ',
        partial: 'รับชำระบางส่วน',
        paid: 'รับชำระแล้ว',
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
      if (window.ERP_CORE?.modules?.finance?.apiCall) {
        return await window.ERP_CORE.modules.finance.apiCall(url, options)
      }
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: options.data ? JSON.stringify(options.data) : undefined
      })
      return await response.json()
    }
  }
}
</script>

<style scoped>
.accounts-receivable-list {
  padding: 1rem;
}
</style>