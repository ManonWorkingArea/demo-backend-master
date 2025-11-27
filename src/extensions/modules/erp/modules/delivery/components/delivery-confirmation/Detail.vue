<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.go(-1)" 
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">รายละเอียดการยืนยันการส่ง</h1>
              <p class="mt-2 text-gray-600">DC #{{ confirmationId }}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="editConfirmation" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไข
            </button>
            <button 
              @click="printConfirmation" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="animate-pulse">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="confirmationData" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Confirmation Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลการยืนยันการส่ง</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขที่การยืนยัน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ confirmationData.confirmationNumber }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusClass(confirmationData.status)]">
                      {{ getStatusText(confirmationData.status) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ formatDate(confirmationData.deliveryDate) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้รับ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ confirmationData.receiverName }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่จัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ confirmationData.deliveryAddress }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ confirmationData.deliveryPerson }}
                  </div>
                </div>
                <div class="md:col-span-2" v-if="confirmationData.notes">
                  <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    {{ confirmationData.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">รายการสินค้าที่ส่ง</h3>
                <span class="text-sm text-gray-500">{{ confirmationData.items?.length || 0 }} รายการ</span>
              </div>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนที่ส่ง</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วย</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in confirmationData.items" :key="item.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ item.productName }}</div>
                        <div class="text-sm text-gray-500">{{ item.productCode }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatNumber(item.deliveredQuantity) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ item.unit }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getItemStatusClass(item.status)]">
                          {{ getItemStatusText(item.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status & Actions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สถานะและการกระทำ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="text-center">
                <span :class="['inline-flex px-4 py-2 text-sm font-semibold rounded-full', getStatusClass(confirmationData.status)]">
                  {{ getStatusText(confirmationData.status) }}
                </span>
              </div>
              <div class="space-y-2">
                <button 
                  @click="editConfirmation"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-edit mr-2"></i>
                  แก้ไข
                </button>
                
                <!-- Document Preview Button -->
                <div class="relative">
                  <button 
                    @click="toggleDocumentMenu"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                  >
                    <i class="fas fa-file-alt mr-2"></i>
                    ตัวอย่างเอกสาร
                    <i class="fas fa-chevron-down ml-2"></i>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div v-if="showDocumentMenu" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div class="py-1">
                      <button 
                        @click="previewDocument('delivery-note')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i class="fas fa-shipping-fast mr-2 text-blue-500"></i>
                        ใบส่งของ
                      </button>
                      <button 
                        @click="previewDocument('packing-slip')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i class="fas fa-box mr-2 text-orange-500"></i>
                        ใบแพ็คกิ้ง
                      </button>
                      <button 
                        @click="previewDocument('receipt')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i class="fas fa-receipt mr-2 text-green-500"></i>
                        ใบเสร็จรับเงิน
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="printConfirmation"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-print mr-2"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <!-- Summary Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สรุปข้อมูล</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">จำนวนรายการ</span>
                <span class="font-semibold text-gray-900">{{ confirmationData.items?.length || 0 }} รายการ</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">สถานะ</span>
                <span :class="['font-semibold', getStatusTextClass(confirmationData.status)]">{{ getStatusText(confirmationData.status) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">ผู้ส่ง</span>
                <span class="font-semibold text-gray-900">{{ confirmationData.deliveryPerson }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">ผู้รับ</span>
                <span class="font-semibold text-gray-900">{{ confirmationData.receiverName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p class="text-gray-600">ไม่พบข้อมูลการยืนยันการส่ง</p>
        </div>
      </div>
    </div>
    
    <!-- Document Preview Modal -->
    <DocumentPreview
      :show="showDocumentPreview"
      :document-type="currentDocumentType"
      :document-data="currentDocumentData"
      :title="currentDocumentTitle"
      @close="closeDocumentPreview"
      @print="handleDocumentPrint"
      @download="handleDocumentDownload"
      @error="handleDocumentError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// ใช้ DocumentPreview component จาก ERP_CORE
const DocumentPreview = window.ERP_CORE?.components?.DocumentPreview

/**
 * ✅ CORE COMPLIANT - Delivery Confirmation Detail
 * ใช้ Dynamic Module Loading และ ERP_CORE.documents
 */
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[DeliveryConfirmationDetail] ERP_CORE not available - must use Core-Only Access pattern')
}

const router = useRouter()
const route = useRoute()

const confirmationId = ref(route.params.id)
const confirmationData = ref(null)
const loading = ref(true)

// Document Preview States
const showDocumentMenu = ref(false)
const showDocumentPreview = ref(false)
const currentDocumentType = ref('')
const currentDocumentData = ref(null)
const currentDocumentTitle = ref('')

const loadData = async () => {
  try {
    
    // สร้างข้อมูล mock สำหรับการยืนยันการส่ง
    const mockData = {
      id: confirmationId.value,
      confirmationNumber: `DC${confirmationId.value.toString().padStart(6, '0')}`,
      status: 'delivered',
      deliveryDate: new Date().toISOString(),
      receiverName: 'บริษัท ABC จำกัด',
      deliveryAddress: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      deliveryPerson: 'คุณสมชาย ใจดี',
      notes: 'ส่งของเรียบร้อยแล้ว ลูกค้าได้รับสินค้าครบถ้วน',
      items: [
        {
          id: 1,
          productCode: 'P001',
          productName: 'สินค้าตัวอย่าง A',
          deliveredQuantity: 10,
          unit: 'ชิ้น',
          status: 'delivered'
        },
        {
          id: 2,
          productCode: 'P002',
          productName: 'สินค้าตัวอย่าง B',
          deliveredQuantity: 5,
          unit: 'กล่อง',
          status: 'delivered'
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      delivery_type: 'standard'
    }
    
    confirmationData.value = mockData
    
  } catch (error) {
    const core = getCore()
    core.showNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'Delivery Confirmation')
    console.error('Load delivery confirmation error:', error)
  } finally {
    loading.value = false
  }
}

const editConfirmation = () => {
  router.push(`/delivery/confirmation/${confirmationId.value}/edit`)
}

const printConfirmation = () => {
  const core = getCore()
  core.showNotification('info', 'ฟีเจอร์พิมพ์จะพัฒนาในเวอร์ชันถัดไป', 'Print')
}

// Document Preview Functions
const toggleDocumentMenu = () => {
  showDocumentMenu.value = !showDocumentMenu.value
}

const previewDocument = (documentType) => {
  showDocumentMenu.value = false
  
  if (!confirmationData.value) {
    const core = getCore()
    core.showNotification('error', 'ไม่พบข้อมูลการยืนยันการส่ง', 'Document Preview')
    return
  }
  
  // Generate document data based on confirmation data
  const documentData = generateDocumentData(documentType)
  
  currentDocumentType.value = documentType
  currentDocumentData.value = documentData
  currentDocumentTitle.value = getDocumentTitle(documentType)
  showDocumentPreview.value = true
}

const generateDocumentData = (documentType) => {
  const core = getCore()
  
  // ใช้ ERP_CORE.documents.generateDocumentData
  return core.documents.generateDocumentData(confirmationData.value, documentType, {
    status: 'delivered',
    delivery_type: 'standard'
  })
}

const getDocumentTitle = (documentType) => {
  const core = getCore()
  return core.documents.getDocumentTitle(documentType)
}

const closeDocumentPreview = () => {
  showDocumentPreview.value = false
  currentDocumentType.value = ''
  currentDocumentData.value = null
  currentDocumentTitle.value = ''
}

const handleDocumentPrint = (documentInfo) => {
  console.log('🖨️ Printing document:', documentInfo)
  const core = getCore()
  core.showNotification('success', `ส่งคำสั่งพิมพ์${documentInfo.type}แล้ว!`, 'Print')
}

const handleDocumentDownload = (documentInfo) => {
  console.log('📥 Downloading document:', documentInfo)
  const core = getCore()
  core.showNotification('success', `ดาวน์โหลด${documentInfo.type}แล้ว!`, 'Download')
}

const handleDocumentError = (error) => {
  console.error('❌ Document error:', error)
  const core = getCore()
  core.showNotification('error', 'เกิดข้อผิดพลาดในการแสดงเอกสาร', 'Document Error')
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  showDocumentMenu.value = false
}

const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getStatusTextClass = (status) => {
  const statusClasses = {
    'pending': 'text-yellow-600',
    'in-transit': 'text-blue-600',
    'delivered': 'text-green-600',
    'failed': 'text-red-600',
    'cancelled': 'text-gray-600'
  }
  return statusClasses[status] || 'text-gray-600'
}

const getStatusText = (status) => {
  const statusTexts = {
    'pending': 'รอส่ง',
    'in-transit': 'กำลังส่ง',
    'delivered': 'ส่งแล้ว',
    'failed': 'ส่งไม่สำเร็จ',
    'cancelled': 'ยกเลิก'
  }
  return statusTexts[status] || 'ไม่ระบุ'
}

const getItemStatusClass = (status) => {
  const statusClasses = {
    'delivered': 'bg-green-100 text-green-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getItemStatusText = (status) => {
  const statusTexts = {
    'delivered': 'ส่งครบ',
    'partial': 'ส่งบางส่วน',
    'failed': 'ส่งไม่สำเร็จ'
  }
  return statusTexts[status] || 'ไม่ระบุ'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('th-TH')
}

const formatNumber = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat('th-TH').format(number)
}

onMounted(() => {
  loadData()
  // Add click outside handler for dropdown
  document.addEventListener('click', handleClickOutside)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Hover animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>