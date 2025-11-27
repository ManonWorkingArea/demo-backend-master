<template>
  <div class="tax-invoice-document">
    <!-- Header -->
    <div class="document-header">
      <div class="company-info">
        <h2 class="company-name">บริษัท เดโม จำกัด</h2>
        <div class="company-details">
          <p><strong>ที่อยู่:</strong> 123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110</p>
          <p><strong>โทรศัพท์:</strong> 02-123-4567 | <strong>อีเมล:</strong> info@demo.com</p>
          <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> 0123456789012</p>
          <p><strong>สาขา:</strong> สำนักงานใหญ่ | <strong>รหัสสาขา:</strong> 00000</p>
        </div>
      </div>
      
      <div class="document-info">
        <h3 class="document-title">ใบกำกับภาษี / TAX INVOICE</h3>
        <div class="document-number">เลขที่ / No.: {{ taxInvoiceNumber }}</div>
        <div class="document-date">วันที่ / Date: {{ formatDate(invoiceDate) }}</div>
        <div class="document-original">ต้นฉบับ / ORIGINAL</div>
      </div>
    </div>

    <!-- Customer Information -->
    <div class="customer-section">
      <h4>ลูกค้า / Customer:</h4>
      <div class="customer-details">
        <div class="customer-info-grid">
          <div class="customer-basic">
            <div class="customer-row">
              <label>ชื่อ / Name:</label>
              <span>{{ delivery.customer_name || 'ไม่ระบุ' }}</span>
            </div>
            <div class="customer-row" v-if="delivery.customer_tax_id">
              <label>เลขประจำตัวผู้เสียภาษี / Tax ID:</label>
              <span>{{ delivery.customer_tax_id }}</span>
            </div>
            <div class="customer-row" v-else>
              <label>เลขประจำตัวผู้เสียภาษี / Tax ID:</label>
              <span>ไม่มี</span>
            </div>
            <div class="customer-row" v-if="delivery.customer_phone">
              <label>โทรศัพท์ / Tel:</label>
              <span>{{ delivery.customer_phone }}</span>
            </div>
            <div class="customer-row" v-if="delivery.customer_email">
              <label>อีเมล / Email:</label>
              <span>{{ delivery.customer_email }}</span>
            </div>
          </div>
          
          <div class="customer-address" v-if="delivery.shipping_address">
            <div class="address-row">
              <label>ที่อยู่ / Address:</label>
              <div class="address-details">
                <div v-if="delivery.shipping_address.company">{{ delivery.shipping_address.company }}</div>
                <div>{{ delivery.shipping_address.address1 }}</div>
                <div v-if="delivery.shipping_address.address2">{{ delivery.shipping_address.address2 }}</div>
                <div>
                  {{ delivery.shipping_address.city }} 
                  {{ delivery.shipping_address.state }} 
                  {{ delivery.shipping_address.postal_code }}
                </div>
                <div v-if="delivery.shipping_address.country">{{ delivery.shipping_address.country }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th class="col-no">ลำดับ<br>No.</th>
            <th class="col-description">รายการ<br>Description</th>
            <th class="col-quantity">จำนวน<br>Quantity</th>
            <th class="col-unit">หน่วย<br>Unit</th>
            <th class="col-price">ราคาต่อหน่วย<br>Unit Price</th>
            <th class="col-total">จำนวนเงิน<br>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in getTaxInvoiceItems()" :key="item.id || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div class="item-name">{{ item.product_name || 'ไม่ระบุ' }}</div>
              <div v-if="item.product_code" class="item-code">รหัสสินค้า: {{ item.product_code }}</div>
              <div v-if="item.description" class="item-description">{{ item.description }}</div>
            </td>
            <td class="text-center">{{ formatNumber(item.delivery_quantity || item.quantity || 0, 0) }}</td>
            <td class="text-center">{{ item.unit || 'ชิ้น' }}</td>
            <td class="text-right">{{ formatNumber(item.unit_price || 0) }}</td>
            <td class="text-right">{{ formatNumber((item.delivery_quantity || item.quantity || 0) * (item.unit_price || 0)) }}</td>
          </tr>
          
          <!-- Fill empty rows to maintain table structure -->
          <tr v-for="n in Math.max(0, 10 - getTaxInvoiceItems().length)" :key="'empty-' + n" class="empty-row">
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
      <div class="summary-grid">
        <div class="amount-words">
          <div class="words-label">จำนวนเงิน (ตัวหนังสือ) / Amount in Words:</div>
          <div class="words-text">{{ amountInWords }}</div>
        </div>
        
        <div class="calculation-table">
          <table>
            <tbody>
              <tr>
                <td>รวมเป็นเงิน / Subtotal:</td>
                <td class="text-right">{{ formatNumber(subtotal) }}</td>
              </tr>
              <tr v-if="discountAmount > 0">
                <td>ส่วนลด / Discount:</td>
                <td class="text-right">({{ formatNumber(discountAmount) }})</td>
              </tr>
              <tr v-if="shippingCost > 0">
                <td>ค่าจัดส่ง / Shipping:</td>
                <td class="text-right">{{ formatNumber(shippingCost) }}</td>
              </tr>
              <tr v-if="otherCharges > 0">
                <td>ค่าใช้จ่ายอื่น / Other Charges:</td>
                <td class="text-right">{{ formatNumber(otherCharges) }}</td>
              </tr>
              <tr class="net-total">
                <td>มูลค่าสินค้า / Net Total:</td>
                <td class="text-right">{{ formatNumber(netTotal) }}</td>
              </tr>
              <tr class="vat-row">
                <td>ภาษีมูลค่าเพิ่ม {{ vatRate }}% / VAT {{ vatRate }}%:</td>
                <td class="text-right">{{ formatNumber(vatAmount) }}</td>
              </tr>
              <tr class="grand-total">
                <td><strong>จำนวนเงินรวมทั้งสิ้น / Grand Total:</strong></td>
                <td class="text-right"><strong>{{ formatNumber(grandTotal) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Payment and Terms -->
    <div class="payment-terms-section">
      <div class="payment-info">
        <h5>เงื่อนไขการชำระเงิน / Payment Terms:</h5>
        <p>{{ paymentTerms }}</p>
        
        <div class="payment-details" v-if="paymentInfo.method">
          <div class="payment-row">
            <label>วิธีการชำระเงิน / Payment Method:</label>
            <span>{{ paymentInfo.method }}</span>
          </div>
          <div class="payment-row" v-if="paymentInfo.reference">
            <label>เลขที่อ้างอิง / Reference:</label>
            <span>{{ paymentInfo.reference }}</span>
          </div>
          <div class="payment-row" v-if="paymentInfo.date">
            <label>วันที่ชำระ / Payment Date:</label>
            <span>{{ formatDate(paymentInfo.date) }}</span>
          </div>
        </div>
      </div>
      
      <div class="delivery-info">
        <h5>ข้อมูลการจัดส่ง / Delivery Information:</h5>
        <div class="delivery-row">
          <label>เลขที่ใบจัดส่ง / Delivery No.:</label>
          <span>{{ delivery.delivery_number }}</span>
        </div>
        <div class="delivery-row" v-if="delivery.work_order_number">
          <label>เลขที่ Work Order:</label>
          <span>{{ delivery.work_order_number }}</span>
        </div>
        <div class="delivery-row" v-if="delivery.sales_order_number">
          <label>เลขที่ Sales Order:</label>
          <span>{{ delivery.sales_order_number }}</span>
        </div>
        <div class="delivery-row" v-if="delivery.tracking_number">
          <label>Tracking Number:</label>
          <span>{{ delivery.tracking_number }}</span>
        </div>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signature-section">
      <div class="signature-grid">
        <div class="signature-box">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-info">
              <div class="signature-label">ผู้ซื้อ / Buyer</div>
              <div class="signature-date">วันที่ / Date: ________________</div>
            </div>
          </div>
        </div>
        
        <div class="signature-box">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-info">
              <div class="signature-label">ผู้มีอำนาจลงนาม / Authorized Signature</div>
              <div class="signature-date">วันที่ / Date: {{ formatDate(invoiceDate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="document-footer">
      <div class="footer-info">
        <div class="footer-row">
          <span>เอกสารนี้ถูกสร้างโดยระบบอัตโนมัติ / This document is generated automatically</span>
        </div>
        <div class="footer-row">
          <span>สร้างเมื่อ / Generated: {{ formatDateTime(new Date()) }}</span>
        </div>
      </div>
      
      <div class="tax-note">
        <p><strong>หมายเหตุ:</strong> ใบกำกับภาษีนี้จะสมบูรณ์ต่อเมื่อบริษัทได้รับเงินเรียบร้อยแล้ว</p>
        <p><strong>Note:</strong> This tax invoice is valid when payment is completed.</p>
      </div>
    </div>

    <!-- Print Actions -->
    <div class="print-actions" v-if="!isPrintMode">
      <button class="btn btn-primary" @click="printInvoice">
        <i class="fas fa-print"></i>
        พิมพ์ใบกำกับภาษี
      </button>
      <button class="btn btn-outline" @click="$emit('close')">
        <i class="fas fa-times"></i>
        ปิด
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TaxInvoiceDocument',
  props: {
    taxInvoiceNumber: {
      type: String,
      required: true
    },
    delivery: {
      type: Object,
      required: true
    },
    paymentInfo: {
      type: Object,
      default: () => ({})
    },
    vatRate: {
      type: Number,
      default: 7
    },
    isPrintMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props) {
    // Reactive data
    const invoiceDate = ref(new Date())
    
    // Computed values
    const subtotal = computed(() => {
      if (!props.delivery) return 0
      return getTaxInvoiceItems().reduce((sum, item) => {
        const quantity = item.delivery_quantity || item.quantity || 0
        const price = item.unit_price || 0
        return sum + (quantity * price)
      }, 0)
    })
    
    const discountAmount = computed(() => {
      if (!props.delivery) return 0
      return props.delivery.discount_amount || 0
    })
    
    const shippingCost = computed(() => {
      if (!props.delivery) return 0
      return props.delivery.shipping_cost || 0
    })
    
    const otherCharges = computed(() => {
      if (!props.delivery) return 0
      const packaging = props.delivery.costs?.packaging_cost || 0
      const handling = props.delivery.costs?.handling_cost || 0
      const insurance = props.delivery.costs?.insurance_cost || 0
      return packaging + handling + insurance
    })
    
    const netTotal = computed(() => {
      return subtotal.value - discountAmount.value + shippingCost.value + otherCharges.value
    })
    
    const vatAmount = computed(() => {
      return netTotal.value * (props.vatRate / 100)
    })
    
    const grandTotal = computed(() => {
      return netTotal.value + vatAmount.value
    })
    
    const paymentTerms = computed(() => {
      return props.paymentInfo.terms || 'ชำระเงินสดทันที / Cash on Delivery'
    })
    
    const amountInWords = computed(() => {
      return convertNumberToThaiWords(grandTotal.value)
    })

    // Methods
    const getTaxInvoiceItems = () => {
      if (!props.delivery || !props.delivery.items) return []
      return props.delivery.items || []
    }
    
    const printInvoice = () => {
      window.print()
    }
    
    const formatNumber = (number, decimals = 2) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number || 0)
    }
    
    const formatDate = (dateValue) => {
      if (!dateValue) return '-'
      try {
        const date = new Date(dateValue)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch {
        return dateValue
      }
    }
    
    const formatDateTime = (dateValue) => {
      if (!dateValue) return '-'
      try {
        const date = new Date(dateValue)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateValue
      }
    }

    const convertNumberToThaiWords = (number) => {
      // Enhanced Thai number to words conversion for tax invoice
      const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
      const hundreds = ['', 'หนึ่งร้อย', 'สองร้อย', 'สามร้อย', 'สี่ร้อย', 'ห้าร้อย', 'หกร้อย', 'เจ็ดร้อย', 'แปดร้อย', 'เก้าร้อย']
      const thousands = ['', 'หนึ่งพัน', 'สองพัน', 'สามพัน', 'สี่พัน', 'ห้าพัน', 'หกพัน', 'เจ็ดพัน', 'แปดพัน', 'เก้าพัน']
      
      if (number === 0) return 'ศูนย์บาทถ้วน'
      
      const integerPart = Math.floor(number)
      const decimalPart = Math.round((number - integerPart) * 100)
      
      let result = ''
      
      if (integerPart >= 10000) {
        const tenThousands = Math.floor(integerPart / 10000)
        if (tenThousands === 1) {
          result += 'หนึ่งหมื่น'
        } else if (tenThousands < 10) {
          result += ones[tenThousands] + 'หมื่น'
        }
      }
      
      const remainingAfterTenThousands = integerPart % 10000
      
      if (remainingAfterTenThousands >= 1000) {
        const th = Math.floor(remainingAfterTenThousands / 1000)
        result += thousands[th]
      }
      
      const remainingAfterThousands = remainingAfterTenThousands % 1000
      
      if (remainingAfterThousands >= 100) {
        const h = Math.floor(remainingAfterThousands / 100)
        result += hundreds[h]
      }
      
      const remainingAfterHundreds = remainingAfterThousands % 100
      
      if (remainingAfterHundreds >= 10) {
        const t = Math.floor(remainingAfterHundreds / 10)
        if (t === 2) {
          result += 'ยี่สิบ'
        } else if (t === 1) {
          result += 'สิบ'
        } else {
          result += ones[t] + 'สิบ'
        }
      }
      
      const o = remainingAfterHundreds % 10
      if (o > 0) {
        if (remainingAfterHundreds >= 10 && o === 1) {
          result += 'เอ็ด'
        } else {
          result += ones[o]
        }
      }
      
      result += 'บาท'
      
      if (decimalPart > 0) {
        const dt = Math.floor(decimalPart / 10)
        const do_ = decimalPart % 10
        
        if (dt === 2) {
          result += 'ยี่สิบ'
        } else if (dt === 1) {
          result += 'สิบ'
        } else if (dt > 0) {
          result += ones[dt] + 'สิบ'
        }
        
        if (do_ > 0) {
          if (dt >= 1 && do_ === 1) {
            result += 'เอ็ด'
          } else {
            result += ones[do_]
          }
        }
        
        result += 'สตางค์'
      } else {
        result += 'ถ้วน'
      }
      
      return result
    }

    return {
      invoiceDate,
      subtotal,
      discountAmount,
      shippingCost,
      otherCharges,
      netTotal,
      vatAmount,
      grandTotal,
      paymentTerms,
      amountInWords,
      getTaxInvoiceItems,
      printInvoice,
      formatNumber,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.tax-invoice-document {
  max-width: 210mm;
  margin: 0 auto;
  padding: 15mm;
  background: white;
  font-family: 'Sarabun', sans-serif;
  font-size: 13px;
  line-height: 1.3;
  color: #333;
}

/* Document Header */
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.company-details p {
  margin: 3px 0;
  color: #555;
  font-size: 12px;
}

.document-info {
  text-align: right;
  flex: 0 0 auto;
  min-width: 200px;
}

.document-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 2px solid #333;
}

.document-number,
.document-date,
.document-original {
  font-size: 13px;
  color: #333;
  margin: 4px 0;
  font-weight: 500;
}

.document-original {
  background: #ffe6e6;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: bold;
}

/* Customer Section */
.customer-section {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.customer-section h4 {
  background: #f8f9fa;
  padding: 8px 12px;
  margin: 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.customer-details {
  padding: 12px;
}

.customer-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.customer-row,
.address-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
}

.customer-row label,
.address-row label {
  font-weight: 600;
  color: #555;
  min-width: 140px;
  margin-right: 10px;
  flex-shrink: 0;
}

.address-details {
  line-height: 1.4;
}

/* Items Table */
.items-section {
  margin-bottom: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #333;
}

.items-table th {
  background: #f8f9fa;
  padding: 8px 6px;
  text-align: center;
  font-weight: bold;
  color: #333;
  border: 1px solid #333;
  font-size: 12px;
  vertical-align: middle;
}

.items-table td {
  padding: 6px;
  border: 1px solid #333;
  vertical-align: top;
  font-size: 12px;
}

.col-no {
  width: 40px;
}

.col-description {
  width: auto;
  min-width: 200px;
}

.col-quantity {
  width: 60px;
}

.col-unit {
  width: 50px;
}

.col-price {
  width: 80px;
}

.col-total {
  width: 90px;
}

.empty-row td {
  height: 20px;
  border-color: #ddd;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-code {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.item-description {
  font-size: 11px;
  color: #777;
  margin-top: 2px;
  font-style: italic;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Summary Section */
.summary-section {
  margin-bottom: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.amount-words {
  border: 1px solid #333;
  padding: 12px;
  border-radius: 4px;
}

.words-label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.words-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.calculation-table {
  border: 1px solid #333;
  border-radius: 4px;
}

.calculation-table table {
  width: 100%;
  border-collapse: collapse;
}

.calculation-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
}

.calculation-table td:first-child {
  border-right: 1px solid #ddd;
}

.net-total td {
  border-top: 1px solid #333;
  font-weight: 600;
}

.vat-row td {
  background: #f0f8ff;
  font-weight: 500;
}

.grand-total td {
  background: #e8f5e8;
  font-weight: bold;
  font-size: 14px;
  border-top: 2px solid #333;
  border-bottom: 2px solid #333;
}

/* Payment and Terms */
.payment-terms-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.payment-info,
.delivery-info {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
}

.payment-info h5,
.delivery-info h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
}

.payment-info p {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #555;
}

.payment-row,
.delivery-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.payment-row label,
.delivery-row label {
  font-weight: 500;
  color: #555;
  min-width: 120px;
  margin-right: 8px;
}

/* Signatures */
.signature-section {
  margin-bottom: 25px;
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.signature-box {
  text-align: center;
}

.signature-area {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.signature-line {
  height: 50px;
  border-bottom: 1px solid #333;
  margin-bottom: 8px;
}

.signature-info {
  font-size: 12px;
}

.signature-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.signature-date {
  color: #666;
}

/* Document Footer */
.document-footer {
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.footer-info {
  text-align: center;
  margin-bottom: 15px;
}

.footer-row {
  font-size: 11px;
  color: #777;
  margin-bottom: 2px;
}

.tax-note {
  background: #fff8dc;
  border: 1px solid #f0e68c;
  padding: 10px;
  border-radius: 4px;
}

.tax-note p {
  margin: 2px 0;
  font-size: 11px;
  color: #666;
}

/* Print Actions */
.print-actions {
  margin-top: 30px;
  text-align: center;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Print Media Query */
@media print {
  .tax-invoice-document {
    padding: 0;
    margin: 0;
    box-shadow: none;
  }
  
  .print-actions {
    display: none !important;
  }
  
  .document-header {
    break-inside: avoid;
  }
  
  .items-table {
    break-inside: avoid;
  }
  
  .summary-section {
    break-inside: avoid;
  }
  
  .signature-section {
    break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .tax-invoice-document {
    padding: 10px;
  }
  
  .document-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .document-info {
    text-align: left;
  }
  
  .customer-info-grid,
  .summary-grid,
  .payment-terms-section,
  .signature-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .calculation-table {
    order: -1;
  }
  
  .print-actions {
    flex-direction: column;
  }
}
</style>