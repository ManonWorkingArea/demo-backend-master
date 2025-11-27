<template>
  <div class="print-document">
    <!-- Print Header -->
    <div class="print-header">
      <div class="company-info">
        <h1 class="company-name">บริษัท เอ็กซ์แอมเปิ้ล จำกัด</h1>
        <p class="company-address">
          123 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500<br>
          โทร: 02-234-5678 อีเมล: info@example.com
        </p>
      </div>
      <div class="document-info">
        <h2 class="document-title">ใบขอซื้อสินค้า/บริการ</h2>
        <div class="document-number">เลขที่: {{ purchaseData?.request_number || recordId?.slice(-6) }}</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-message">
      กำลังโหลดข้อมูลสำหรับพิมพ์...
    </div>

    <!-- Print Content -->
    <div v-else-if="purchaseData" class="print-content">
      <!-- Basic Information -->
      <div class="info-section">
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">วันที่ขอซื้อ:</td>
              <td>{{ formatDate(purchaseData.request_date) }}</td>
              <td class="label">แผนก:</td>
              <td>{{ purchaseData.department || 'ไม่ระบุ' }}</td>
            </tr>
            <tr>
              <td class="label">ผู้ขอซื้อ:</td>
              <td>{{ purchaseData.created_by || 'ไม่ระบุ' }}</td>
              <td class="label">ความสำคัญ:</td>
              <td>{{ getPriorityText(purchaseData.priority) }}</td>
            </tr>
            <tr>
              <td class="label">วันที่ต้องการใช้งาน:</td>
              <td>{{ formatDate(purchaseData.expected_delivery) || 'ไม่ระบุ' }}</td>
              <td class="label">สถานะ:</td>
              <td>{{ getStatusText(purchaseData.status) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vendor Information -->
      <div class="info-section">
        <h3 class="section-title">ข้อมูลผู้ขาย</h3>
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">ชื่อผู้ขาย:</td>
              <td colspan="3">{{ purchaseData.vendor_name || 'ไม่ระบุ' }}</td>
            </tr>
            <tr>
              <td class="label">ผู้ติดต่อ:</td>
              <td>{{ purchaseData.vendor_contact || 'ไม่ระบุ' }}</td>
              <td class="label">เบอร์โทร:</td>
              <td>{{ purchaseData.vendor_phone || 'ไม่ระบุ' }}</td>
            </tr>
            <tr>
              <td class="label">อีเมล:</td>
              <td colspan="3">{{ purchaseData.vendor_email || 'ไม่ระบุ' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Items Table -->
      <div class="items-section">
        <h3 class="section-title">รายการสินค้า/บริการ</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 8%">ลำดับ</th>
              <th style="width: 40%">รายการ</th>
              <th style="width: 10%">จำนวน</th>
              <th style="width: 10%">หน่วย</th>
              <th style="width: 16%">ราคาต่อหน่วย</th>
              <th style="width: 16%">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, index) in (purchaseData.items || [])" 
              :key="index"
              class="item-row"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ item.description || 'ไม่ระบุ' }}</td>
              <td class="text-center">{{ item.quantity || 0 }}</td>
              <td class="text-center">{{ item.unit || '-' }}</td>
              <td class="text-right">{{ formatCurrency(item.unit_price || 0) }}</td>
              <td class="text-right">{{ formatCurrency(item.total_amount || 0) }}</td>
            </tr>
            
            <!-- Empty rows for formatting -->
            <tr v-for="n in Math.max(0, 10 - (purchaseData.items || []).length)" :key="'empty-' + n" class="empty-row">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5" class="text-right total-label">รวมทั้งสิ้น</td>
              <td class="text-right total-amount">{{ formatCurrency(totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Additional Information -->
      <div class="additional-section">
        <div class="justification-box">
          <h4>เหตุผลในการขอซื้อ:</h4>
          <div class="content-box">
            {{ purchaseData.justification || 'ไม่ระบุ' }}
          </div>
        </div>
        
        <div class="notes-box">
          <h4>หมายเหตุ:</h4>
          <div class="content-box">
            {{ purchaseData.notes || 'ไม่มี' }}
          </div>
        </div>
      </div>

      <!-- Signature Section -->
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-title">ผู้ขอซื้อ</div>
          <div class="signature-line"></div>
          <div class="signature-details">
            <div>ชื่อ: {{ purchaseData.created_by || '................................' }}</div>
            <div>วันที่: {{ formatDate(purchaseData.created_at) }}</div>
          </div>
        </div>

        <div class="signature-box">
          <div class="signature-title">หัวหน้าแผนก</div>
          <div class="signature-line"></div>
          <div class="signature-details">
            <div>ชื่อ: ................................</div>
            <div>วันที่: ................................</div>
          </div>
        </div>

        <div class="signature-box">
          <div class="signature-title">ผู้อนุมัติ</div>
          <div class="signature-line"></div>
          <div class="signature-details">
            <div>ชื่อ: {{ purchaseData.approved_by || '................................' }}</div>
            <div>วันที่: {{ formatDate(purchaseData.approved_date) || '................................' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Error -->
    <div v-else class="error-message">
      ไม่สามารถโหลดข้อมูลสำหรับพิมพ์ได้
    </div>

    <!-- Print Footer -->
    <div class="print-footer">
      <div class="footer-info">
        <span>พิมพ์เมื่อ: {{ formatDateTime(new Date()) }}</span>
        <span class="separator">|</span>
        <span>โดย: ระบบ ERP</span>
      </div>
    </div>

    <!-- Auto Print Script -->
    <div v-if="autoPrint && !loading && purchaseData" class="print-trigger">
      <!-- This will trigger print automatically when data is loaded -->
    </div>
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT PRINT COMPONENT - Purchase Print View
 * ปฏิบัติตาม AI Guidelines: Core-Only Access Pattern
 * - ใช้ ERP_CORE.engine สำหรับ read operations
 * - Print-optimized layout
 * - Auto-print functionality
 */
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

/**
 * ✅ CORE-ONLY ACCESS HELPER
 */
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[Purchase Print] ERP_CORE not available - must use Core-Only Access pattern')
}

export default {
  name: 'PurchasePrint',
  setup() {
    const route = useRoute()
    
    // ✅ Reactive State
    const loading = ref(false)
    const purchaseData = ref(null)
    const autoPrint = ref(true)
    
    // ✅ Get record ID from route
    const recordId = computed(() => {
      return route.params.id || route.query.id || null
    })

    // ✅ Computed Properties
    const totalAmount = computed(() => {
      if (!purchaseData.value?.items) return 0
      return purchaseData.value.items.reduce((sum, item) => {
        return sum + (item.total_amount || 0)
      }, 0)
    })

    // ✅ CORE-ONLY ACCESS: Load purchase data
    const loadPurchaseData = async () => {
      if (!recordId.value) {
        console.error('[Purchase Print] No record ID provided')
        return
      }

      loading.value = true
      
      try {
        const core = getCore()
        console.log('[Purchase Print] Loading purchase data:', recordId.value)
        
        // ✅ ใช้ Core-Only Access สำหรับ read operation
        const result = await core.engine.read('purchase', recordId.value)
        
        if (result.success && result.data) {
          purchaseData.value = result.data
          console.log('[Purchase Print] Data loaded for printing:', result.data)
          
          // Auto print after data is loaded
          if (autoPrint.value) {
            await nextTick()
            setTimeout(() => {
              window.print()
            }, 1000) // Give time for rendering
          }
        } else {
          throw new Error(result.error || 'ไม่พบข้อมูลใบขอซื้อ')
        }
      } catch (err) {
        console.error('[Purchase Print] Error loading data:', err)
      } finally {
        loading.value = false
      }
    }

    // ✅ Utility Functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'pending_approval': 'รออนุมัติ',
        'approved': 'อนุมัติแล้ว',
        'rejected': 'ไม่อนุมัติ',
        'completed': 'เสร็จสิ้น'
      }
      return statusTexts[status] || status
    }

    const getPriorityText = (priority) => {
      const priorityTexts = {
        'normal': 'ปกติ',
        'urgent': 'ด่วน',
        'critical': 'วิกฤต'
      }
      return priorityTexts[priority] || 'ปกติ'
    }

    // ✅ Lifecycle
    onMounted(() => {
      console.log('[Purchase Print] Mounted with recordId:', recordId.value)
      
      // Check if auto-print is disabled via query parameter
      if (route.query.autoprint === 'false') {
        autoPrint.value = false
      }
      
      loadPurchaseData()
    })

    return {
      // State
      loading,
      purchaseData,
      recordId,
      autoPrint,
      
      // Computed
      totalAmount,
      
      // Methods
      formatCurrency,
      formatDate,
      formatDateTime,
      getStatusText,
      getPriorityText
    }
  }
}
</script>

<style scoped>
/* Print-specific styles */
@media print {
  body {
    margin: 0;
    padding: 0;
  }
  
  .print-document {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 12px !important;
  }
  
  .print-header,
  .print-content,
  .print-footer {
    break-inside: avoid;
  }
  
  .items-section {
    page-break-inside: avoid;
  }
  
  .signature-section {
    page-break-before: avoid;
    margin-top: 30px;
  }
}

.print-document {
  width: 210mm;
  margin: 0 auto;
  padding: 20px;
  background: white;
  font-family: 'THSarabunNew', 'Sarabun', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
}

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #000;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #000;
}

.company-address {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  color: #333;
}

.document-info {
  text-align: right;
}

.document-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #000;
}

.document-number {
  font-size: 14px;
  font-weight: bold;
  padding: 5px 10px;
  border: 2px solid #000;
  display: inline-block;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  color: #666;
}

.print-content {
  margin-bottom: 30px;
}

.info-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #000;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.info-table td {
  padding: 8px 12px;
  border: 1px solid #ccc;
  vertical-align: top;
}

.info-table .label {
  background: #f5f5f5;
  font-weight: bold;
  width: 20%;
  white-space: nowrap;
}

.items-section {
  margin-bottom: 25px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
}

.items-table th {
  background: #f0f0f0;
  padding: 10px 8px;
  border: 1px solid #000;
  text-align: center;
  font-weight: bold;
  font-size: 13px;
}

.items-table td {
  padding: 8px;
  border: 1px solid #000;
  vertical-align: top;
  min-height: 25px;
}

.item-row td {
  border-bottom: 1px solid #ccc;
}

.empty-row td {
  border-bottom: 1px solid #ccc;
  height: 25px;
}

.total-row {
  background: #f9f9f9;
}

.total-label {
  font-weight: bold;
  font-size: 15px;
}

.total-amount {
  font-weight: bold;
  font-size: 16px;
  border: 2px solid #000 !important;
}

.additional-section {
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}

.justification-box,
.notes-box {
  flex: 1;
}

.justification-box h4,
.notes-box h4 {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 8px 0;
  border-bottom: 1px solid #000;
  padding-bottom: 3px;
}

.content-box {
  border: 1px solid #000;
  padding: 10px;
  min-height: 60px;
  background: #fff;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  gap: 20px;
}

.signature-box {
  flex: 1;
  text-align: center;
}

.signature-title {
  font-weight: bold;
  margin-bottom: 40px;
  font-size: 14px;
}

.signature-line {
  border-top: 1px solid #000;
  margin: 0 10px 10px 10px;
}

.signature-details {
  font-size: 12px;
  line-height: 1.6;
}

.print-footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #ccc;
  text-align: center;
}

.footer-info {
  font-size: 10px;
  color: #666;
}

.separator {
  margin: 0 10px;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

/* Screen-only styles */
@media screen {
  .print-document {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
  }
  
  .print-trigger {
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4299e1;
    color: white;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  }
  
  .print-trigger::after {
    content: "กำลังเตรียมพิมพ์...";
  }
}

/* Mobile responsive for preview */
@media screen and (max-width: 768px) {
  .print-document {
    width: 100%;
    padding: 15px;
    margin: 10px;
    font-size: 12px;
  }
  
  .print-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .document-info {
    text-align: left;
  }
  
  .additional-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .signature-section {
    flex-direction: column;
    gap: 30px;
  }
  
  .items-table {
    font-size: 11px;
  }
  
  .items-table th,
  .items-table td {
    padding: 5px 3px;
  }
}
</style>