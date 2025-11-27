<template>
  <div class="ap-edit">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-edit"></i>
              แก้ไขใบแจ้งหนี้เจ้าหนี้ #{{ invoiceData.invoice_number }}
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status"></div>
            </div>
            <form v-else @submit.prevent="updateInvoice">
              <!-- Similar structure as Create.vue but with edit functionality -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">ซัพพลายเออร์ *</label>
                    <select class="form-select" v-model="invoiceData.supplier_id" required>
                      <option value="">เลือกซัพพลายเออร์</option>
                      <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                        {{ supplier.code }} - {{ supplier.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">เลขที่ใบแจ้งหนี้</label>
                    <input type="text" class="form-control" v-model="invoiceData.invoice_number" readonly />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">วันที่ออกใบแจ้งหนี้ *</label>
                    <input type="date" class="form-control" v-model="invoiceData.invoice_date" required />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">วันที่ครบกำหนด *</label>
                    <input type="date" class="form-control" v-model="invoiceData.due_date" required />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">สถานะ</label>
                    <select class="form-select" v-model="invoiceData.status">
                      <option value="draft">แบบร่าง</option>
                      <option value="pending">รอชำระ</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Items Table (similar to Create.vue) -->
              <div class="mb-4">
                <h6>รายการสินค้า/บริการ</h6>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>รายการ</th>
                        <th>จำนวน</th>
                        <th>ราคาต่อหน่วย</th>
                        <th>จำนวนเงิน</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in invoiceData.items" :key="index">
                        <td>
                          <select class="form-select" v-model="item.product_id">
                            <option value="">เลือกสินค้า</option>
                            <option v-for="product in products" :key="product.id" :value="product.id">
                              {{ product.code }} - {{ product.name }}
                            </option>
                          </select>
                          <textarea class="form-control mt-1" v-model="item.description" rows="1"></textarea>
                        </td>
                        <td>
                          <input type="number" class="form-control" v-model="item.quantity" @input="calculateItemTotal(index)" />
                        </td>
                        <td>
                          <input type="number" class="form-control" v-model="item.unit_price" @input="calculateItemTotal(index)" />
                        </td>
                        <td>
                          <input type="number" class="form-control" v-model="item.total_amount" readonly />
                        </td>
                        <td>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeItem(index)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm" @click="addItem">
                  <i class="fas fa-plus"></i>
                  เพิ่มรายการ
                </button>
              </div>

              <!-- Summary & Notes -->
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">หมายเหตุ</label>
                    <textarea class="form-control" rows="3" v-model="invoiceData.notes"></textarea>
                  </div>
                </div>
                <div class="col-md-4">
                  <table class="table table-borderless">
                    <tr>
                      <td>รวมก่อนภาษี:</td>
                      <td class="text-end">{{ formatCurrency(totals.subtotal) }}</td>
                    </tr>
                    <tr>
                      <td>ภาษีมูลค่าเพิ่ม:</td>
                      <td class="text-end">{{ formatCurrency(totals.tax_amount) }}</td>
                    </tr>
                    <tr class="border-top">
                      <td><strong>รวมทั้งสิ้น:</strong></td>
                      <td class="text-end"><strong>{{ formatCurrency(totals.total) }}</strong></td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">
                  <i class="fas fa-arrow-left"></i>
                  ยกเลิก
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i class="fas fa-save"></i>
                  <span v-if="saving">กำลังบันทึก...</span>
                  <span v-else>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountsPayableEdit',
  data() {
    return {
      loading: false,
      saving: false,
      suppliers: [],
      products: [],
      invoiceData: {
        supplier_id: '',
        invoice_number: '',
        invoice_date: '',
        due_date: '',
        status: 'pending',
        notes: '',
        items: []
      }
    }
  },
  computed: {
    totals() {
      let subtotal = 0
      let tax_amount = 0
      
      this.invoiceData.items.forEach(item => {
        const itemTotal = parseFloat(item.total_amount) || 0
        subtotal += itemTotal
        tax_amount += itemTotal * 0.07 // VAT 7%
      })
      
      return {
        subtotal,
        tax_amount,
        total: subtotal + tax_amount
      }
    }
  },
  async mounted() {
    await this.loadSuppliers()
    await this.loadProducts()
    await this.loadInvoice()
  },
  methods: {
    async loadInvoice() {
      this.loading = true
      try {
        const response = await this.apiCall(`/api/finance/accounts-payable/${this.$route.params.id}`)
        if (response.success) {
          this.invoiceData = response.data
        }
      } catch (error) {
        console.error('Load invoice error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadSuppliers() {
      try {
        if (window.ERP_CORE?.modules?.purchase?.getSuppliers) {
          this.suppliers = await window.ERP_CORE.modules.purchase.getSuppliers()
        } else {
          const response = await this.apiCall('/api/suppliers')
          if (response.success) this.suppliers = response.data
        }
      } catch (error) {
        console.error('Load suppliers error:', error)
      }
    },

    async loadProducts() {
      try {
        if (window.ERP_CORE?.modules?.inventory?.getProducts) {
          this.products = await window.ERP_CORE.modules.inventory.getProducts()
        } else {
          const response = await this.apiCall('/api/products')
          if (response.success) this.products = response.data
        }
      } catch (error) {
        console.error('Load products error:', error)
      }
    },

    calculateItemTotal(index) {
      const item = this.invoiceData.items[index]
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      item.total_amount = quantity * unitPrice
    },

    addItem() {
      this.invoiceData.items.push({
        product_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0
      })
    },

    removeItem(index) {
      if (this.invoiceData.items.length > 1) {
        this.invoiceData.items.splice(index, 1)
      }
    },

    async updateInvoice() {
      this.saving = true
      try {
        const response = await this.apiCall(`/api/finance/accounts-payable/${this.$route.params.id}`, {
          method: 'PUT',
          data: {
            ...this.invoiceData,
            subtotal: this.totals.subtotal,
            tax_amount: this.totals.tax_amount,
            total_amount: this.totals.total
          }
        })

        if (response.success) {
          this.$swal.fire({
            title: 'สำเร็จ!',
            text: 'แก้ไขใบแจ้งหนี้เรียบร้อยแล้ว',
            icon: 'success'
          }).then(() => {
            this.$router.push({ name: 'finance-ap-detail', params: { id: this.$route.params.id } })
          })
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        this.$swal.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      } finally {
        this.saving = false
      }
    },

    goBack() {
      this.$router.push({ name: 'finance-ap-detail', params: { id: this.$route.params.id } })
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
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: options.data ? JSON.stringify(options.data) : undefined
      })
      return await response.json()
    }
  }
}
</script>

<style scoped>
.ap-edit {
  padding: 1rem;
}
</style>