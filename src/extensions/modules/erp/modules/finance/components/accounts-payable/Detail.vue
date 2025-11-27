<template>
  <div class="ap-detail">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title">
              <i class="fas fa-file-invoice-dollar"></i>
              รายละเอียดใบแจ้งหนี้เจ้าหนี้ #{{ invoice.invoice_number }}
            </h5>
            <div class="card-tools">
              <button type="button" class="btn btn-outline-secondary me-2" @click="goBack">
                <i class="fas fa-arrow-left"></i>
                ย้อนกลับ
              </button>
              <button v-if="canEdit" type="button" class="btn btn-outline-warning me-2" @click="editInvoice">
                <i class="fas fa-edit"></i>
                แก้ไข
              </button>
              <button v-if="canPay" type="button" class="btn btn-success me-2" @click="makePayment">
                <i class="fas fa-money-check-alt"></i>
                ชำระเงิน
              </button>
              <button type="button" class="btn btn-outline-primary" @click="printInvoice">
                <i class="fas fa-print"></i>
                พิมพ์
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <!-- Invoice Info -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6>ข้อมูลใบแจ้งหนี้</h6>
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td width="30%">เลขที่:</td>
                        <td><strong>{{ invoice.invoice_number }}</strong></td>
                      </tr>
                      <tr>
                        <td>วันที่ออกใบแจ้งหนี้:</td>
                        <td>{{ formatDate(invoice.invoice_date) }}</td>
                      </tr>
                      <tr>
                        <td>วันที่ครบกำหนด:</td>
                        <td>{{ formatDate(invoice.due_date) }}</td>
                      </tr>
                      <tr>
                        <td>สถานะ:</td>
                        <td>
                          <span :class="getStatusClass(invoice.status)">
                            {{ getStatusText(invoice.status) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>ข้อมูลซัพพลายเออร์</h6>
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td width="30%">รหัส:</td>
                        <td>{{ invoice.supplier?.code }}</td>
                      </tr>
                      <tr>
                        <td>ชื่อ:</td>
                        <td><strong>{{ invoice.supplier?.name }}</strong></td>
                      </tr>
                      <tr>
                        <td>เลขผู้เสียภาษี:</td>
                        <td>{{ invoice.supplier?.tax_id }}</td>
                      </tr>
                      <tr>
                        <td>เบอร์โทร:</td>
                        <td>{{ invoice.supplier?.phone }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Items -->
              <div class="mb-4">
                <h6>รายการสินค้า/บริการ</h6>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>รายการ</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-end">ราคาต่อหน่วย</th>
                        <th class="text-end">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in invoice.items" :key="item.id">
                        <td>
                          <strong>{{ item.product?.name }}</strong>
                          <div v-if="item.description" class="text-muted small">
                            {{ item.description }}
                          </div>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ formatCurrency(item.unit_price) }}</td>
                        <td class="text-end">{{ formatCurrency(item.total_amount) }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr>
                        <td colspan="3" class="text-end"><strong>รวมก่อนภาษี:</strong></td>
                        <td class="text-end"><strong>{{ formatCurrency(invoice.subtotal) }}</strong></td>
                      </tr>
                      <tr>
                        <td colspan="3" class="text-end">ภาษีมูลค่าเพิ่ม:</td>
                        <td class="text-end">{{ formatCurrency(invoice.tax_amount) }}</td>
                      </tr>
                      <tr>
                        <td colspan="3" class="text-end"><strong>รวมทั้งสิ้น:</strong></td>
                        <td class="text-end"><strong>{{ formatCurrency(invoice.total_amount) }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- Payment Summary -->
              <div class="row mb-4" v-if="invoice.payments && invoice.payments.length > 0">
                <div class="col-12">
                  <h6>รายการชำระเงิน</h6>
                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead class="table-light">
                        <tr>
                          <th>วันที่ชำระ</th>
                          <th>จำนวนเงิน</th>
                          <th>วิธีการชำระ</th>
                          <th>อ้างอิง</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="payment in invoice.payments" :key="payment.id">
                          <td>{{ formatDate(payment.payment_date) }}</td>
                          <td class="text-end">{{ formatCurrency(payment.amount) }}</td>
                          <td>{{ payment.payment_method }}</td>
                          <td>{{ payment.reference }}</td>
                        </tr>
                      </tbody>
                      <tfoot class="table-light">
                        <tr>
                          <td colspan="3" class="text-end"><strong>ชำระแล้ว:</strong></td>
                          <td class="text-end"><strong>{{ formatCurrency(invoice.paid_amount) }}</strong></td>
                        </tr>
                        <tr>
                          <td colspan="3" class="text-end"><strong>คงเหลือ:</strong></td>
                          <td class="text-end"><strong>{{ formatCurrency(invoice.remaining_amount) }}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="invoice.notes" class="mb-3">
                <h6>หมายเหตุ</h6>
                <p class="text-muted">{{ invoice.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountsPayableDetail',
  data() {
    return {
      loading: false,
      invoice: {
        supplier: {},
        items: [],
        payments: []
      }
    }
  },
  computed: {
    canEdit() {
      return ['draft', 'pending'].includes(this.invoice.status)
    },
    canPay() {
      return ['pending', 'partial'].includes(this.invoice.status) && this.invoice.remaining_amount > 0
    }
  },
  async mounted() {
    await this.loadInvoice()
  },
  methods: {
    async loadInvoice() {
      this.loading = true
      try {
        const response = await this.apiCall(`/api/finance/accounts-payable/${this.$route.params.id}`)
        if (response.success) {
          this.invoice = response.data
        }
      } catch (error) {
        console.error('Load invoice error:', error)
        this.$swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถโหลดข้อมูลได้', 'error')
      } finally {
        this.loading = false
      }
    },

    editInvoice() {
      this.$router.push({ name: 'finance-ap-edit', params: { id: this.invoice.id } })
    },

    makePayment() {
      this.$router.push({ name: 'finance-ap-payment', params: { id: this.invoice.id } })
    },

    printInvoice() {
      window.open(
        this.$router.resolve({ name: 'finance-ap-print', params: { id: this.invoice.id } }).href,
        '_blank'
      )
    },

    goBack() {
      this.$router.push({ name: 'finance-accounts-payable' })
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
      if (window.ERP_CORE?.modules?.finance?.apiCall) {
        return await window.ERP_CORE.modules.finance.apiCall(url, options)
      }
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.data ? JSON.stringify(options.data) : undefined
      })
      return await response.json()
    }
  }
}
</script>

<style scoped>
.ap-detail {
  padding: 1rem;
}

.table-borderless td {
  border: none;
  padding: 0.25rem 0.5rem;
}

.badge {
  font-size: 0.75rem;
}

.card-tools .btn {
  margin-left: 0.5rem;
}
</style>