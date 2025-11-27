<template>
  <!-- Invoice Document -->
  <div class="invoice-document bg-white">
    <!-- Document Header -->
    <div class="text-center mb-8 pb-6 border-b-2 border-gray-300">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">ใบแจ้งหนี้</h1>
      <h2 class="text-lg text-gray-700">TAX INVOICE</h2>
      
      <div class="mt-4 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div class="text-left">
          <span class="text-sm text-gray-600">เลขที่เอกสาร:</span>
          <div class="font-semibold">{{ data.invoice_number || 'INV-XXXX-XXXX' }}</div>
        </div>
        <div class="text-center">
          <span class="text-sm text-gray-600">วันที่:</span>
          <div class="font-semibold">{{ formatDate(data.invoice_date) }}</div>
        </div>
        <div class="text-right">
          <span class="text-sm text-gray-600">กำหนดชำระ:</span>
          <div class="font-semibold">{{ formatDate(data.due_date) }}</div>
        </div>
      </div>
    </div>
    
    <!-- Company and Customer Information -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <!-- Seller Information -->
      <div>
        <h3 class="font-semibold text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">ผู้ออกใบแจ้งหนี้ (จำหน่าย)</h3>
        <div class="space-y-2 text-sm pl-3">
          <div class="font-semibold text-lg">{{ data.seller?.company_name || 'บริษัท ABC จำกัด' }}</div>
          <div><span class="text-gray-600">ที่อยู่:</span> {{ data.seller?.address || '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110' }}</div>
          <div><span class="text-gray-600">เลขประจำตัวผู้เสียภาษี:</span> {{ data.seller?.tax_id || '0000000000000' }}</div>
          <div><span class="text-gray-600">โทรศัพท์:</span> {{ data.seller?.phone || '02-123-4567' }}</div>
          <div><span class="text-gray-600">อีเมล:</span> {{ data.seller?.email || 'info@company.com' }}</div>
        </div>
      </div>
      
      <!-- Customer Information -->
      <div>
        <h3 class="font-semibold text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">ลูกค้า (ซื้อ)</h3>
        <div class="space-y-2 text-sm pl-3">
          <div class="font-semibold text-lg">{{ data.customer?.company_name || data.customer?.name || 'ไม่ระบุ' }}</div>
          <div><span class="text-gray-600">ที่อยู่:</span> {{ data.customer?.address || 'ไม่ระบุ' }}</div>
          <div><span class="text-gray-600">เลขประจำตัวผู้เสียภาษี:</span> {{ data.customer?.tax_id || 'ไม่ระบุ' }}</div>
          <div><span class="text-gray-600">โทรศัพท์:</span> {{ data.customer?.phone || 'ไม่ระบุ' }}</div>
          <div v-if="data.customer?.email"><span class="text-gray-600">อีเมล:</span> {{ data.customer.email }}</div>
        </div>
      </div>
    </div>
    
    <!-- Reference Documents -->
    <div v-if="data.reference_documents" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 class="font-semibold text-gray-900 mb-2">เอกสารอ้างอิง</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div v-if="data.quotation_number">
          <span class="text-gray-600">เลขที่ใบเสนอราคา:</span> {{ data.quotation_number }}
        </div>
        <div v-if="data.sales_order_number">
          <span class="text-gray-600">เลขที่ใบสั่งซื้อ:</span> {{ data.sales_order_number }}
        </div>
        <div v-if="data.delivery_note_number">
          <span class="text-gray-600">เลขที่ใบส่งของ:</span> {{ data.delivery_note_number }}
        </div>
        <div v-if="data.po_number">
          <span class="text-gray-600">เลขที่ PO ลูกค้า:</span> {{ data.po_number }}
        </div>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="mb-8">
      <h3 class="font-semibold text-gray-900 mb-4">รายการสินค้าและบริการ</h3>
      
      <div class="overflow-x-auto">
        <table class="w-full border border-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900 w-12">ลำดับ</th>
              <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">รหัสสินค้า</th>
              <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">ชื่อสินค้า/บริการ</th>
              <th class="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900 w-16">จำนวน</th>
              <th class="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900 w-16">หน่วย</th>
              <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900 w-24">ราคาต่อหน่วย</th>
              <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900 w-20">ส่วนลด</th>
              <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900 w-24">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayItems" :key="index" class="hover:bg-gray-50">
              <td class="border border-gray-300 px-3 py-2 text-sm text-center">{{ index + 1 }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm font-mono">{{ item.product_code || item.sku || 'N/A' }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">
                <div>{{ item.product_name || item.description || 'ไม่ระบุ' }}</div>
                <div v-if="item.specification" class="text-xs text-gray-500 mt-1">{{ item.specification }}</div>
              </td>
              <td class="border border-gray-300 px-3 py-2 text-sm text-center">{{ formatNumber(item.quantity) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm text-center">{{ item.unit || 'ชิ้น' }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm text-right">{{ formatCurrency(item.unit_price) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm text-right">{{ formatDiscount(item.discount) }}</td>
              <td class="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">{{ formatCurrency(item.line_total) }}</td>
            </tr>
            
            <!-- Empty rows for visual spacing -->
            <tr v-for="n in Math.max(0, 5 - displayItems.length)" :key="`empty-${n}`">
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
              <td class="border border-gray-300 px-3 py-2 text-sm">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Summary Calculations -->
    <div class="mb-8">
      <div class="flex justify-end">
        <div class="w-80">
          <table class="w-full">
            <tbody>
              <tr class="border-b">
                <td class="px-4 py-2 text-right text-sm font-semibold">รวมเป็นเงิน (ก่อนภาษี):</td>
                <td class="px-4 py-2 text-right text-sm font-bold">{{ formatCurrency(subtotal) }}</td>
              </tr>
              <tr v-if="discountAmount > 0" class="border-b">
                <td class="px-4 py-2 text-right text-sm font-semibold">ส่วนลดรวม:</td>
                <td class="px-4 py-2 text-right text-sm text-red-600">-{{ formatCurrency(discountAmount) }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-4 py-2 text-right text-sm font-semibold">หลังหักส่วนลด:</td>
                <td class="px-4 py-2 text-right text-sm font-bold">{{ formatCurrency(afterDiscount) }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-4 py-2 text-right text-sm font-semibold">ภาษีมูลค่าเพิ่ม {{ vatRate }}%:</td>
                <td class="px-4 py-2 text-right text-sm font-bold">{{ formatCurrency(vatAmount) }}</td>
              </tr>
              <tr class="border-b-2 border-gray-400 bg-gray-50">
                <td class="px-4 py-3 text-right text-lg font-bold">รวมทั้งสิ้น:</td>
                <td class="px-4 py-3 text-right text-xl font-bold text-blue-600">{{ formatCurrency(grandTotal) }}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- Amount in Words -->
          <div class="mt-4 p-3 bg-gray-50 border rounded text-sm">
            <span class="font-semibold">จำนวนเงิน (ตัวอักษร): </span>
            <span class="italic">{{ amountInWords }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment Information -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 class="font-semibold text-gray-900 mb-3">ข้อมูลการชำระเงิน</h3>
        <div class="space-y-2 text-sm p-3 border border-gray-200 rounded bg-gray-50">
          <div><span class="text-gray-600">ประเภทการชำระ:</span> {{ data.payment_method || 'โอนเงิน' }}</div>
          <div><span class="text-gray-600">เงื่อนไขการชำระ:</span> {{ data.payment_terms || 'Net 30 วัน' }}</div>
          <div v-if="data.bank_account">
            <div class="font-semibold mt-3 mb-1">ข้อมูลบัญชี:</div>
            <div><span class="text-gray-600">ธนาคาร:</span> {{ data.bank_account.bank_name }}</div>
            <div><span class="text-gray-600">เลขที่บัญชี:</span> {{ data.bank_account.account_number }}</div>
            <div><span class="text-gray-600">ชื่อบัญชี:</span> {{ data.bank_account.account_name }}</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="font-semibold text-gray-900 mb-3">หมายเหตุ</h3>
        <div class="p-3 border border-gray-300 rounded bg-gray-50 min-h-[120px] text-sm">
          {{ data.notes || data.remarks || 'กรุณาชำระเงินภายในกำหนด เพื่อหลีกเลี่ยงค่าปรับ' }}
        </div>
      </div>
    </div>
    
    <!-- Signature Section -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div class="text-center">
        <div class="border-b border-gray-400 pb-1 mb-2 mx-8"></div>
        <div class="text-sm font-semibold">ผู้รับของ</div>
        <div class="text-xs text-gray-500 mt-1">ลงชื่อ วันที่ ..../...../.....  </div>
      </div>
      
      <div class="text-center">
        <div class="border-b border-gray-400 pb-1 mb-2 mx-8"></div>
        <div class="text-sm font-semibold">ผู้มีอำนาจลงนาม</div>
        <div class="text-xs text-gray-500 mt-1">บริษัท ABC จำกัด</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
      <p>
        เอกสารฉบับนี้สร้างโดยระบบ ERP • 
        สถานะ: <span :class="getStatusClass(data.status)">{{ getStatusText(data.status) }}</span> • 
        พิมพ์เมื่อ {{ formatDateTime(new Date()) }}
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'InvoiceDocument',
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const displayItems = computed(() => {
      return props.data.items || props.data.invoice_items || []
    })
    
    const subtotal = computed(() => {
      return displayItems.value.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.unit_price) || 0
        return sum + (qty * price)
      }, 0)
    })
    
    const discountAmount = computed(() => {
      return displayItems.value.reduce((sum, item) => {
        const discount = parseFloat(item.discount) || 0
        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.unit_price) || 0
        const lineTotal = qty * price
        
        if (item.discount_type === 'percent') {
          return sum + (lineTotal * discount / 100)
        } else {
          return sum + discount
        }
      }, 0)
    })
    
    const afterDiscount = computed(() => {
      return subtotal.value - discountAmount.value
    })
    
    const vatRate = computed(() => {
      return props.data.vat_rate || 7
    })
    
    const vatAmount = computed(() => {
      return afterDiscount.value * (vatRate.value / 100)
    })
    
    const grandTotal = computed(() => {
      return afterDiscount.value + vatAmount.value
    })
    
    const amountInWords = computed(() => {
      // Simple Thai number to words conversion (placeholder)
      const amount = Math.floor(grandTotal.value)
      return `${amount.toLocaleString('th-TH')} บาทถ้วน`
    })
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }
    
    const formatDiscount = (discount, type = 'percent') => {
      if (!discount) return '-'
      if (type === 'percent') {
        return `${discount}%`
      } else {
        return formatCurrency(discount)
      }
    }
    
    const formatDate = (date) => {
      if (!date) return 'ไม่ระบุ'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const formatDateTime = (date) => {
      if (!date) return 'ไม่ระบุ'
      return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        'draft': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
        'sent': 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        'paid': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        'partial': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        'overdue': 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
        'cancelled': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
      }
      return statusClasses[status] || statusClasses['draft']
    }
    
    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'แก้ไข',
        'sent': 'ส่งแล้ว',
        'paid': 'ชำระแล้ว',
        'partial': 'ชำระบางส่วน',
        'overdue': 'เกินกำหนด',
        'cancelled': 'ยกเลิก'
      }
      return statusTexts[status] || 'ไม่ระบุ'
    }
    
    return {
      displayItems,
      subtotal,
      discountAmount,
      afterDiscount,
      vatRate,
      vatAmount,
      grandTotal,
      amountInWords,
      formatNumber,
      formatCurrency,
      formatDiscount,
      formatDate,
      formatDateTime,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
/* Document specific styles */
.invoice-document {
  font-family: 'Sarabun', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Print styles */
@media print {
  .invoice-document {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 20px !important;
  }
  
  table {
    page-break-inside: avoid;
  }
  
  th, td {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  .no-print {
    display: none !important;
  }
}

/* Table styling for better readability */
table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid #d1d5db;
}

tbody tr:hover {
  background-color: #f9fafb;
}

/* Highlight total row */
tfoot tr {
  font-weight: bold;
  background-color: #f3f4f6;
}
</style>