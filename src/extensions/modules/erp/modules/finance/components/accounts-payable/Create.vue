<template>
  <div class="ap-create">
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-plus"></i>
              สร้างใบแจ้งหนี้เจ้าหนี้ (AP Invoice)
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveInvoice" class="needs-validation" novalidate>
              <!-- Supplier Information -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">ซัพพลายเออร์ *</label>
                    <select 
                      class="form-select" 
                      v-model="invoiceData.supplier_id"
                      @change="onSupplierChange"
                      required
                    >
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
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="invoiceData.invoice_number"
                      placeholder="จะสร้างอัตโนมัติ"
                      readonly
                    />
                  </div>
                </div>
              </div>

              <!-- Invoice Details -->
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">วันที่ออกใบแจ้งหนี้ *</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="invoiceData.invoice_date"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">วันที่ครบกำหนด *</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="invoiceData.due_date"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">เลขที่ Purchase Order</label>
                    <select class="form-select" v-model="invoiceData.purchase_order_id">
                      <option value="">ไม่มี PO อ้างอิง</option>
                      <option v-for="po in purchaseOrders" :key="po.id" :value="po.id">
                        {{ po.po_number }} ({{ formatCurrency(po.total) }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Invoice Items -->
              <div class="mb-4">
                <h6>รายการสินค้า/บริการ</h6>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th width="40%">รายการ</th>
                        <th width="15%">จำนวน</th>
                        <th width="15%">ราคาต่อหน่วย</th>
                        <th width="15%">จำนวนเงิน</th>
                        <th width="10%">ภาษี</th>
                        <th width="5%"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in invoiceData.items" :key="index">
                        <td>
                          <select 
                            class="form-select" 
                            v-model="item.product_id"
                            @change="onProductChange(index)"
                          >
                            <option value="">เลือกสินค้า/บริการ</option>
                            <option v-for="product in products" :key="product.id" :value="product.id">
                              {{ product.code }} - {{ product.name }}
                            </option>
                          </select>
                          <textarea 
                            class="form-control mt-1" 
                            v-model="item.description"
                            rows="1"
                            placeholder="รายละเอียดเพิ่มเติม"
                          ></textarea>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            class="form-control" 
                            v-model="item.quantity"
                            @input="calculateItemTotal(index)"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            class="form-control" 
                            v-model="item.unit_price"
                            @input="calculateItemTotal(index)"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            class="form-control" 
                            v-model="item.total_amount"
                            readonly
                          />
                        </td>
                        <td>
                          <select class="form-select" v-model="item.tax_type" @change="calculateItemTotal(index)">
                            <option value="none">ไม่มีภาษี</option>
                            <option value="vat7">VAT 7%</option>
                            <option value="vat10">VAT 10%</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removeItem(index)"
                            :disabled="invoiceData.items.length <= 1"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm"
                  @click="addItem"
                >
                  <i class="fas fa-plus"></i>
                  เพิ่มรายการ
                </button>
              </div>

              <!-- Summary -->
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">หมายเหตุ</label>
                    <textarea 
                      class="form-control" 
                      rows="3" 
                      v-model="invoiceData.notes"
                      placeholder="หมายเหตุเพิ่มเติม"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="row justify-content-end">
                <div class="col-md-4">
                  <table class="table table-borderless">
                    <tbody>
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
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Actions -->
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">
                  <i class="fas fa-arrow-left"></i>
                  ยกเลิก
                </button>
                <button type="button" class="btn btn-outline-primary me-2" @click="saveDraft">
                  <i class="fas fa-save"></i>
                  บันทึกแบบร่าง
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i class="fas fa-check"></i>
                  <span v-if="loading">กำลังบันทึก...</span>
                  <span v-else>บันทึกและส่ง</span>
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
  name: 'AccountsPayableCreate',
  data() {
    return {
      loading: false,
      suppliers: [],
      products: [],
      purchaseOrders: [],
      invoiceData: {
        supplier_id: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        purchase_order_id: '',
        notes: '',
        status: 'pending',
        items: [{
          product_id: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          total_amount: 0,
          tax_type: 'vat7'
        }]
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
        
        if (item.tax_type === 'vat7') {
          tax_amount += itemTotal * 0.07
        } else if (item.tax_type === 'vat10') {
          tax_amount += itemTotal * 0.10
        }
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
    this.generateInvoiceNumber()
  },
  methods: {
    async loadSuppliers() {
      try {
        // Use dynamic loading from purchase module
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

    async loadProducts() {
      try {
        // Use dynamic loading from inventory module
        if (window.ERP_CORE?.modules?.inventory?.getProducts) {
          this.products = await window.ERP_CORE.modules.inventory.getProducts()
        } else {
          const response = await this.apiCall('/api/products')
          if (response.success) {
            this.products = response.data
          }
        }
      } catch (error) {
        console.error('Load products error:', error)
      }
    },

    async onSupplierChange() {
      if (this.invoiceData.supplier_id) {
        // Load POs for selected supplier
        try {
          const response = await this.apiCall(`/api/purchase-orders?supplier_id=${this.invoiceData.supplier_id}&status=approved`)
          if (response.success) {
            this.purchaseOrders = response.data
          }
        } catch (error) {
          console.error('Load POs error:', error)
        }

        // Set default due date based on supplier payment terms
        const supplier = this.suppliers.find(s => s.id == this.invoiceData.supplier_id)
        if (supplier && supplier.payment_terms) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + supplier.payment_terms)
          this.invoiceData.due_date = dueDate.toISOString().split('T')[0]
        }
      }
    },

    onProductChange(index) {
      const item = this.invoiceData.items[index]
      const product = this.products.find(p => p.id == item.product_id)
      
      if (product) {
        item.description = product.description || product.name
        item.unit_price = product.cost_price || product.price || 0
        this.calculateItemTotal(index)
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
        total_amount: 0,
        tax_type: 'vat7'
      })
    },

    removeItem(index) {
      if (this.invoiceData.items.length > 1) {
        this.invoiceData.items.splice(index, 1)
      }
    },

    async generateInvoiceNumber() {
      try {
        const response = await this.apiCall('/api/finance/accounts-payable/generate-number')
        if (response.success) {
          this.invoiceData.invoice_number = response.data.number
        }
      } catch (error) {
        console.error('Generate number error:', error)
      }
    },

    async saveDraft() {
      this.invoiceData.status = 'draft'
      await this.saveInvoice()
    },

    async saveInvoice() {
      if (!this.validateForm()) return
      
      this.loading = true
      try {
        const response = await this.apiCall('/api/finance/accounts-payable', {
          method: 'POST',
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
            text: 'บันทึกใบแจ้งหนี้เจ้าหนี้เรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.$router.push({ name: 'finance-accounts-payable' })
          })
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาด')
        }
      } catch (error) {
        console.error('Save invoice error:', error)
        this.$swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.loading = false
      }
    },

    validateForm() {
      if (!this.invoiceData.supplier_id) {
        this.$swal.fire('แจ้งเตือน', 'กรุณาเลือกซัพพลายเออร์', 'warning')
        return false
      }
      
      if (!this.invoiceData.invoice_date) {
        this.$swal.fire('แจ้งเตือน', 'กรุณากรอกวันที่ออกใบแจ้งหนี้', 'warning')
        return false
      }
      
      if (!this.invoiceData.due_date) {
        this.$swal.fire('แจ้งเตือน', 'กรุณากรอกวันที่ครบกำหนด', 'warning')
        return false
      }

      if (this.invoiceData.items.every(item => !item.product_id)) {
        this.$swal.fire('แจ้งเตือน', 'กรุณาเพิ่มรายการสินค้าหรือบริการอย่างน้อย 1 รายการ', 'warning')
        return false
      }
      
      return true
    },

    goBack() {
      this.$router.push({ name: 'finance-accounts-payable' })
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
      
      const response = await fetch(url, config)
      return await response.json()
    }
  }
}
</script>

<style scoped>
.ap-create {
  padding: 1rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.btn {
  min-width: 100px;
}

.table-borderless td {
  border: none;
  padding: 0.25rem 0.5rem;
}

.table-borderless .border-top td {
  border-top: 1px solid #dee2e6 !important;
}
</style>