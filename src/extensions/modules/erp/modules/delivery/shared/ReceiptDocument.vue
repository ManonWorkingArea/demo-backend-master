<template>
  <div class="receipt-document">
    <!-- Header -->
    <div class="document-header">
      <div class="company-info">
        <h2 class="company-name">บริษัท เดโม จำกัด</h2>
        <div class="company-details">
          <p>123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110</p>
          <p>โทร: 02-123-4567 | อีเมล: info@demo.com</p>
          <p>เลขที่ประจำตัวผู้เสียภาษี: 0123456789012</p>
        </div>
      </div>
      
      <div class="document-info">
        <h3 class="document-title">ใบเสร็จรับเงิน</h3>
        <div class="document-number">เลขที่: {{ receiptNumber }}</div>
        <div class="document-date">วันที่: {{ formatDate(receiptDate) }}</div>
      </div>
    </div>

    <!-- Customer Information -->
    <div class="customer-section">
      <h4>ข้อมูลลูกค้า:</h4>
      <div class="customer-details">
        <div class="customer-row">
          <label>ชื่อลูกค้า:</label>
          <span>{{ delivery.customer_name || 'ไม่ระบุ' }}</span>
        </div>
        <div class="customer-row" v-if="delivery.customer_phone">
          <label>เบอร์โทร:</label>
          <span>{{ delivery.customer_phone }}</span>
        </div>
        <div class="customer-row" v-if="delivery.customer_email">
          <label>อีเมล:</label>
          <span>{{ delivery.customer_email }}</span>
        </div>
        <div class="customer-row" v-if="delivery.shipping_address">
          <label>ที่อยู่:</label>
          <div class="address-info">
            <div v-if="delivery.shipping_address.company">{{ delivery.shipping_address.company }}</div>
            <div>{{ delivery.shipping_address.address1 }}</div>
            <div v-if="delivery.shipping_address.address2">{{ delivery.shipping_address.address2 }}</div>
            <div>
              {{ delivery.shipping_address.city }} 
              {{ delivery.shipping_address.state }} 
              {{ delivery.shipping_address.postal_code }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-section">
      <h4>รายการสินค้า:</h4>
      <table class="items-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รายการ</th>
            <th>จำนวน</th>
            <th>หน่วย</th>
            <th>ราคา/หน่วย</th>
            <th>รวม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in getReceiptItems()" :key="item.id || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div class="item-name">{{ item.product_name || 'ไม่ระบุ' }}</div>
              <div v-if="item.product_code" class="item-code">รหัส: {{ item.product_code }}</div>
            </td>
            <td class="text-center">{{ item.delivery_quantity || item.quantity || 0 }}</td>
            <td class="text-center">{{ item.unit || 'ชิ้น' }}</td>
            <td class="text-right">฿{{ formatNumber(item.unit_price || 0) }}</td>
            <td class="text-right">฿{{ formatNumber((item.delivery_quantity || item.quantity || 0) * (item.unit_price || 0)) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="subtotal-row">
            <td colspan="5" class="text-right"><strong>รวมย่อย:</strong></td>
            <td class="text-right"><strong>฿{{ formatNumber(subtotal) }}</strong></td>
          </tr>
          <tr v-if="shippingCost > 0" class="shipping-row">
            <td colspan="5" class="text-right">ค่าจัดส่ง:</td>
            <td class="text-right">฿{{ formatNumber(shippingCost) }}</td>
          </tr>
          <tr v-if="otherCharges > 0" class="charges-row">
            <td colspan="5" class="text-right">ค่าใช้จ่ายอื่น:</td>
            <td class="text-right">฿{{ formatNumber(otherCharges) }}</td>
          </tr>
          <tr class="total-row">
            <td colspan="5" class="text-right"><strong>รวมทั้งสิ้น:</strong></td>
            <td class="text-right"><strong>฿{{ formatNumber(grandTotal) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Amount in Words -->
    <div class="amount-words">
      <strong>จำนวนเงิน (ตัวอักษร): {{ amountInWords }}</strong>
    </div>

    <!-- Payment Information -->
    <div class="payment-section">
      <h4>ข้อมูลการชำระเงิน:</h4>
      <div class="payment-details">
        <div class="payment-row">
          <label>วิธีการชำระเงิน:</label>
          <span>{{ paymentMethod }}</span>
        </div>
        <div class="payment-row" v-if="paymentReference">
          <label>เลขที่อ้างอิง:</label>
          <span>{{ paymentReference }}</span>
        </div>
        <div class="payment-row">
          <label>วันที่ชำระ:</label>
          <span>{{ formatDate(paymentDate) }}</span>
        </div>
        <div class="payment-row">
          <label>สถานะการชำระเงิน:</label>
          <span class="payment-status paid">ชำระเงินแล้ว</span>
        </div>
      </div>
    </div>

    <!-- Reference Information -->
    <div class="reference-section">
      <div class="reference-row">
        <label>เลขที่ใบจัดส่ง:</label>
        <span>{{ delivery.delivery_number }}</span>
      </div>
      <div class="reference-row" v-if="delivery.work_order_number">
        <label>เลขที่ Work Order:</label>
        <span>{{ delivery.work_order_number }}</span>
      </div>
      <div class="reference-row" v-if="delivery.sales_order_number">
        <label>เลขที่ Sales Order:</label>
        <span>{{ delivery.sales_order_number }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="document-footer">
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">ผู้รับเงิน</div>
        </div>
        
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">ผู้จ่ายเงิน</div>
        </div>
      </div>
      
      <div class="document-meta">
        <p>ใบเสร็จนี้สร้างโดยระบบอัตโนมัติ</p>
        <p>สร้างเมื่อ: {{ formatDateTime(new Date()) }}</p>
      </div>
    </div>

    <!-- Print Actions -->
    <div class="print-actions" v-if="!isPrintMode">
      <button class="btn btn-primary" @click="printReceipt">
        <i class="fas fa-print"></i>
        พิมพ์ใบเสร็จ
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
  name: 'ReceiptDocument',
  props: {
    receiptNumber: {
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
    isPrintMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props) {
    // Reactive data
    const receiptDate = ref(new Date())
    
    // Computed values
    const subtotal = computed(() => {
      if (!props.delivery) return 0
      return getReceiptItems().reduce((sum, item) => {
        const quantity = item.delivery_quantity || item.quantity || 0
        const price = item.unit_price || 0
        return sum + (quantity * price)
      }, 0)
    })
    
    const shippingCost = computed(() => {
      if (!props.delivery) return 0
      return props.delivery.shipping_cost || 0
    })
    
    const otherCharges = computed(() => {
      if (!props.delivery) return 0
      const packaging = props.delivery.costs?.packaging_cost || 0
      const handling = props.delivery.costs?.handling_cost || 0
      return packaging + handling
    })
    
    const grandTotal = computed(() => {
      return subtotal.value + shippingCost.value + otherCharges.value
    })
    
    const paymentMethod = computed(() => {
      return props.paymentInfo.method || 'เงินสด'
    })
    
    const paymentReference = computed(() => {
      return props.paymentInfo.reference || ''
    })
    
    const paymentDate = computed(() => {
      return props.paymentInfo.date || new Date()
    })
    
    const amountInWords = computed(() => {
      return convertNumberToThaiWords(grandTotal.value)
    })

    // Methods
    const getReceiptItems = () => {
      if (!props.delivery || !props.delivery.items) return []
      return props.delivery.items || []
    }
    
    const printReceipt = () => {
      window.print()
    }
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0)
    }
    
    const formatDate = (dateValue) => {
      if (!dateValue) return '-'
      try {
        const date = new Date(dateValue)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
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
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateValue
      }
    }

    const convertNumberToThaiWords = (number) => {
      // Simplified Thai number to words conversion
      // This is a basic implementation - you might want a more comprehensive one
      const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
      const tens = ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ']
      const hundreds = ['', 'หนึ่งร้อย', 'สองร้อย', 'สามร้อย', 'สี่ร้อย', 'ห้าร้อย', 'หกร้อย', 'เจ็ดร้อย', 'แปดร้อย', 'เก้าร้อย']
      
      if (number === 0) return 'ศูนย์บาทถ้วน'
      
      const integerPart = Math.floor(number)
      const decimalPart = Math.round((number - integerPart) * 100)
      
      if (integerPart < 1000) {
        let result = ''
        const h = Math.floor(integerPart / 100)
        const t = Math.floor((integerPart % 100) / 10)
        const o = integerPart % 10
        
        if (h > 0) result += hundreds[h]
        if (t > 0) result += tens[t]
        if (t === 1 && o === 1) result += 'เอ็ด'
        else if (o > 0) result += ones[o]
        
        result += 'บาท'
        
        if (decimalPart > 0) {
          const dt = Math.floor(decimalPart / 10)
          const do_ = decimalPart % 10
          if (dt > 0) result += tens[dt]
          if (do_ > 0) result += ones[do_]
          result += 'สตางค์'
        } else {
          result += 'ถ้วน'
        }
        
        return result
      }
      
      return `${formatNumber(number)} บาท` // Fallback for larger numbers
    }

    return {
      receiptDate,
      subtotal,
      shippingCost,
      otherCharges,
      grandTotal,
      paymentMethod,
      paymentReference,
      paymentDate,
      amountInWords,
      getReceiptItems,
      printReceipt,
      formatNumber,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.receipt-document {
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  background: white;
  font-family: 'Sarabun', sans-serif;
  font-size: 14px;
  line-height: 1.4;
}

/* Document Header */
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
}

.company-details p {
  margin: 2px 0;
  color: #666;
  font-size: 12px;
}

.document-info {
  text-align: right;
  flex: 0 0 auto;
}

.document-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 4px;
}

.document-number,
.document-date {
  font-size: 14px;
  color: #333;
  margin: 5px 0;
}

/* Customer Section */
.customer-section {
  margin-bottom: 25px;
}

.customer-section h4 {
  background: #f8f9fa;
  padding: 8px 12px;
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  border-left: 4px solid #007bff;
}

.customer-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.customer-row {
  display: flex;
  align-items: flex-start;
  grid-column: span 1;
}

.customer-row:last-child {
  grid-column: span 2;
}

.customer-row label {
  font-weight: 600;
  color: #555;
  min-width: 80px;
  margin-right: 10px;
}

.address-info {
  line-height: 1.3;
}

/* Items Table */
.items-section {
  margin-bottom: 25px;
}

.items-section h4 {
  background: #f8f9fa;
  padding: 8px 12px;
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  border-left: 4px solid #28a745;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.items-table th {
  background: #f8f9fa;
  padding: 10px 8px;
  text-align: center;
  font-weight: 600;
  color: #333;
  border: 1px solid #dee2e6;
  font-size: 13px;
}

.items-table td {
  padding: 8px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.items-table tbody tr:nth-child(even) {
  background: #f9f9f9;
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

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.subtotal-row td {
  background: #f8f9fa;
  font-weight: 500;
}

.shipping-row td,
.charges-row td {
  background: #f0f8ff;
}

.total-row td {
  background: #e8f5e8;
  font-weight: bold;
  font-size: 16px;
  border-top: 2px solid #28a745;
}

/* Amount in Words */
.amount-words {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 12px;
  margin-bottom: 25px;
  text-align: center;
  font-size: 15px;
  border-radius: 4px;
}

/* Payment Section */
.payment-section {
  margin-bottom: 25px;
}

.payment-section h4 {
  background: #f8f9fa;
  padding: 8px 12px;
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  border-left: 4px solid #ffc107;
}

.payment-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.payment-row {
  display: flex;
  align-items: center;
}

.payment-row label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
  margin-right: 10px;
}

.payment-status.paid {
  color: #28a745;
  font-weight: bold;
}

/* Reference Section */
.reference-section {
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.reference-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
}

.reference-row label {
  color: #666;
}

.reference-row span {
  font-weight: 500;
  color: #333;
}

/* Document Footer */
.document-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.signature-box {
  text-align: center;
}

.signature-line {
  width: 150px;
  height: 60px;
  border-bottom: 1px solid #333;
  margin-bottom: 10px;
}

.signature-label {
  font-size: 12px;
  color: #666;
}

.document-meta {
  text-align: center;
  color: #999;
  font-size: 11px;
}

.document-meta p {
  margin: 2px 0;
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
  .receipt-document {
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
  
  .signature-section {
    break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .receipt-document {
    padding: 15px;
  }
  
  .document-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .document-info {
    text-align: left;
  }
  
  .customer-details,
  .payment-details {
    grid-template-columns: 1fr;
  }
  
  .customer-row:last-child {
    grid-column: span 1;
  }
  
  .signature-section {
    flex-direction: column;
    gap: 30px;
  }
  
  .print-actions {
    flex-direction: column;
  }
}
</style>