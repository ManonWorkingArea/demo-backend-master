<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8">ทดสอบ PurchaseRequestDocument 2 หน้าจริง</h1>
      
      <!-- Control Panel -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">เลือกข้อมูลทดสอบ</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="selectTestData(12)"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              selectedItems === 12 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="font-semibold">12 รายการ</div>
            <div class="text-sm text-gray-600">1 หน้า</div>
          </button>
          
          <button
            @click="selectTestData(20)"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              selectedItems === 20 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="font-semibold">20 รายการ</div>
            <div class="text-sm text-gray-600">2 หน้า (12+8)</div>
          </button>
          
          <button
            @click="selectTestData(25)"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              selectedItems === 25 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="font-semibold">25 รายการ</div>
            <div class="text-sm text-gray-600">3 หน้า (12+12+1)</div>
          </button>
        </div>
        
        <div class="mt-6 text-center space-x-4">
          <button
            @click="showPreview = true"
            :disabled="!documentData"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-eye mr-2"></i>
            แสดงเอกสาร {{ selectedItems }} รายการ
          </button>
          
          <button
            @click="directPrint"
            :disabled="!documentData"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-print mr-2"></i>
            พิมพ์เอกสาร
          </button>
          
          <button
            @click="directDownload"
            :disabled="!documentData"
            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-download mr-2"></i>
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>

      <!-- Current Data Info -->
      <div v-if="documentData" class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">ข้อมูลเอกสารปัจจุบัน</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-2">รายละเอียดเอกสาร</h4>
            <div class="space-y-1 text-sm">
              <div><strong>หมายเลข:</strong> {{ documentData.document_number }}</div>
              <div><strong>บริษัท:</strong> {{ documentData.company_name }}</div>
              <div><strong>ผู้ขอ:</strong> {{ documentData.requester }}</div>
              <div><strong>วันที่:</strong> {{ documentData.request_date }}</div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-700 mb-2">สถิติรายการ</h4>
            <div class="space-y-1 text-sm">
              <div><strong>จำนวนรายการ:</strong> {{ documentData.items?.length || 0 }} รายการ</div>
              <div><strong>หน้าทั้งหมด:</strong> {{ Math.ceil((documentData.items?.length || 0) / 12) }} หน้า</div>
              <div><strong>รายการต่อหน้า:</strong> 12 รายการ</div>
              <div><strong>ยอดรวม:</strong> {{ formatCurrency(totalAmount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Preview -->
      <div v-if="documentData?.items?.length > 12" class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4">ตัวอย่างการแบ่งหน้า</h3>
        
        <div class="grid gap-4">
          <div v-for="pageNum in Math.ceil(documentData.items.length / 12)" :key="pageNum" class="border rounded p-4">
            <h4 class="font-medium mb-2">หน้าที่ {{ pageNum }}</h4>
            <div class="text-sm text-gray-600">
              รายการที่ {{ ((pageNum - 1) * 12) + 1 }} - {{ Math.min(pageNum * 12, documentData.items.length) }}
              ({{ getPageItemCount(pageNum) }} รายการ)
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ getPageItems(pageNum).map(item => item.product_code).slice(0, 3).join(', ') }}
              {{ getPageItems(pageNum).length > 3 ? '...' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DocumentPreview Component -->
    <DocumentPreview
      :show="showPreview"
      document-type="purchase_request"
      :document-data="documentData"
      title="ใบขอซื้อทดสอบ"
      @close="showPreview = false"
      @print="handlePrint"
      @download="handleDownload"
    />
  </div>
</template>

<script>
import DocumentPreview from '../extensions/modules/erp/core/components/preview/DocumentPreview.vue'

export default {
  name: 'TestPurchaseRequest2Pages',
  components: {
    DocumentPreview
  },
  data() {
    return {
      showPreview: false,
      documentData: null,
      selectedItems: 20 // default to 2 pages
    }
  },
  computed: {
    totalAmount() {
      if (!this.documentData?.items) return 0
      return this.documentData.items.reduce((sum, item) => sum + (item.total || 0), 0)
    }
  },
  methods: {
    selectTestData(itemCount) {
      this.selectedItems = itemCount
      this.documentData = this.createTestData(itemCount)
    },
    
    createTestData(itemCount) {
      const data = {
        document_number: `PR-2024-${String(itemCount).padStart(3, '0')}`,
        request_date: '2024-10-24',
        company_name: `บริษัท ทดสอบ ${itemCount} รายการ จำกัด`,
        company_address: '123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110',
        tax_id: '0123456789012',
        requester: `นายทดสอบ ${itemCount} รายการ`,
        department: 'แผนก IT',
        required_date: '2024-11-01',
        remarks: `ขอซื้อสำหรับทดสอบการแสดงผล ${itemCount} รายการ แบ่งเป็น ${Math.ceil(itemCount / 12)} หน้า`,
        items: []
      }
      
      // สร้างรายการสินค้า
      for (let i = 1; i <= itemCount; i++) {
        const quantity = Math.floor(Math.random() * 5) + 1
        const unitPrice = Math.floor(Math.random() * 1000) + 100
        
        data.items.push({
          product_code: `TEST-${String(i).padStart(3, '0')}`,
          product_name: `สินค้าทดสอบ รายการที่ ${i} (${itemCount} รายการรวม)`,
          description: `รายละเอียดสินค้าทดสอบสำหรับการแสดงผลหลายหน้า รายการที่ ${i}`,
          quantity: quantity,
          unit: 'ชิ้น',
          unit_price: unitPrice,
          total: quantity * unitPrice
        })
      }
      
      return data
    },
    
    getPageItems(pageNum) {
      if (!this.documentData?.items) return []
      const start = (pageNum - 1) * 12
      const end = start + 12
      return this.documentData.items.slice(start, end)
    },
    
    getPageItemCount(pageNum) {
      return this.getPageItems(pageNum).length
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    },
    
    handlePrint(data) {
      console.log('Print document:', data)
      alert(`พิมพ์เอกสาร ${data.type}: ${data.data.document_number} (${data.totalPages} หน้า)`)
    },
    
    handleDownload(data) {
      console.log('Download document:', data)
      alert(`ดาวน์โหลดเอกสาร ${data.type}: ${data.data.document_number} (${data.totalPages} หน้า)`)
    },
    
    // Direct print - เปิด preview แล้วพิมพ์ทันที
    directPrint() {
      this.showPreview = true
      this.$nextTick(() => {
        // หน่วงเวลาเล็กน้อยเพื่อให้ preview แสดงผลเสร็จ
        setTimeout(() => {
          // จำลองการกดปุ่ม print ใน DocumentPreview
          const printEvent = new CustomEvent('print-document')
          document.dispatchEvent(printEvent)
        }, 500)
      })
    },
    
    // Direct download - เปิด preview แล้วดาวน์โหลดทันที  
    directDownload() {
      this.showPreview = true
      this.$nextTick(() => {
        // หน่วงเวลาเล็กน้อยเพื่อให้ preview แสดงผลเสร็จ
        setTimeout(() => {
          // จำลองการกดปุ่ม download ใน DocumentPreview
          const downloadEvent = new CustomEvent('download-document')
          document.dispatchEvent(downloadEvent)
        }, 500)
      })
    }
  },
  
  mounted() {
    // สร้างข้อมูลเริ่มต้น 20 รายการ (2 หน้า)
    this.selectTestData(20)
  }
}
</script>

<style scoped>
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>