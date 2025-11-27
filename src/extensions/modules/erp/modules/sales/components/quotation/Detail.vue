<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Quotation Detail</h1>
            <p v-if="quotation" class="mt-2 text-gray-600">ใบเสนอราคา / Quotation - <span class="font-mono">{{ quotation.quote_number }}</span></p>
            <p v-else class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="$router.go(-1)"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              ย้อนกลับ
            </button>
            
            <!-- Create Invoice Button -->
            <button 
              v-if="canCreateInvoice"
              @click="handleCreateInvoice"
              :disabled="creatingInvoice"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i :class="creatingInvoice ? 'fas fa-spinner fa-spin' : 'fas fa-file-invoice'" class="mr-2"></i>
              {{ creatingInvoice ? 'กำลังสร้าง...' : 'สร้าง Invoice' }}
            </button>
            
            <!-- View Invoice Button -->
            <button 
              v-if="quotation?.invoice_id"
              @click="handleViewInvoice"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-file-invoice mr-2"></i>
              ดู Invoice
            </button>
            
            <button 
              v-if="quotation"
              @click="handleEdit"
              :disabled="quotation.invoice_id"
              :title="quotation.invoice_id ? 'ไม่สามารถแก้ไขได้เนื่องจากสร้าง Invoice แล้ว' : ''"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไข
            </button>
            
            <button 
              v-if="quotation"
              @click="handlePrint"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์
            </button>
            
            <button 
              v-if="quotation"
              @click="handlePreviewDocument"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-file-alt mr-2"></i>
              ดูเอกสาร
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
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

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="bg-red-50 rounded-full p-6 mb-6">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-6 max-w-md">{{ error }}</p>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          @click="$router.push('/sales/quotation')"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          กลับไปหน้ารายการ
        </button>
      </div>

      <!-- Quotation Detail -->
      <div v-else-if="quotation" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Quotation Status Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-500">สถานะ</h3>
                <span 
                  :class="getStatusClass(quotation.status)"
                  class="inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1"
                >
                  {{ getStatusText(quotation.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขที่ใบเสนอราคา</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono font-semibold">{{ quotation.quote_number }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ quotation.customerName || `Customer ID: ${quotation.customer_id}` }}</p>
                    <p v-if="quotation.customerPhone" class="text-sm text-gray-600 mt-1">{{ quotation.customerPhone }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่เสนอราคา</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(quotation.quotation_date) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(quotation.expiry_date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Flow -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">เอกสารที่เกี่ยวข้อง</h3>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-xs">
                <!-- Quotation (Current) -->
                <div class="flex-1 p-2 rounded border-2 border-gray-600 bg-gray-50">
                  <div class="text-gray-600 mb-0.5">ใบเสนอราคา</div>
                  <div class="font-semibold text-gray-900">{{ quotation.quote_number }}</div>
                </div>
                
                <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
                
                <!-- Invoice -->
                <div 
                  v-if="linkedInvoice"
                  @click="handleViewInvoice"
                  class="flex-1 p-2 rounded border border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                >
                  <div class="text-gray-600 mb-0.5">ใบแจ้งหนี้</div>
                  <div class="font-semibold text-gray-900">{{ linkedInvoice.invoiceNumber || linkedInvoice.invoice_number }}</div>
                </div>
                <div v-else class="flex-1 p-2 rounded border border-dashed border-gray-300 bg-gray-50">
                  <div class="text-gray-400">ใบแจ้งหนี้</div>
                  <div class="text-gray-400 text-xs">-</div>
                </div>
                
                <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
                
                <!-- Sales Order -->
                <div 
                  v-if="linkedSalesOrder"
                  @click="viewDocument('sales-order', linkedSalesOrder._id || linkedSalesOrder.id)"
                  class="flex-1 p-2 rounded border border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                >
                  <div class="text-gray-600 mb-0.5">ใบสั่งขาย</div>
                  <div class="font-semibold text-gray-900">{{ linkedSalesOrder.orderNumber || linkedSalesOrder.order_number }}</div>
                </div>
                <div v-else class="flex-1 p-2 rounded border border-dashed border-gray-300 bg-gray-50">
                  <div class="text-gray-400">ใบสั่งขาย</div>
                  <div class="text-gray-400 text-xs">-</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ราคา/หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">รวม</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in quotation.items" :key="index">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">{{ item.description }}</div>
                        <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
                        <div v-if="item.lot_code" class="text-xs text-purple-600">
                          <i class="fas fa-scroll mr-1"></i>{{ item.lot_code }}
                          <span v-if="item.is_full_roll" class="ml-2 text-green-600">(ยกทั้งม้วน)</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.quantity }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ item.unit }}</td>
                      <td class="px-6 py-4 text-right text-sm text-gray-900">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="quotation.notes" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">หมายเหตุ</h3>
            <p class="text-gray-700 whitespace-pre-wrap">{{ quotation.notes }}</p>
          </div>

          <!-- ✅ Stock Reservations -->
          <div v-if="quotation.invoice_id && stockReservations.length > 0" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-boxes mr-2 text-orange-600"></i>
                สถานะการจองสต็อค
              </h3>
            </div>
            <div class="p-6">
              <!-- Loading State -->
              <div v-if="loadingReservations" class="text-center py-4">
                <i class="fas fa-spinner fa-spin text-gray-400"></i>
                <p class="text-sm text-gray-500 mt-2">กำลังโหลดข้อมูลการจอง...</p>
              </div>

              <!-- Reservation List -->
              <div v-else class="space-y-3">
                <div v-for="reservation in stockReservations" :key="reservation._id" 
                     class="border rounded-lg p-4"
                     :class="reservation.status === 'paid' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <!-- Lot Badge -->
                      <div class="flex items-center mb-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <i class="fas fa-scroll mr-1"></i>
                          {{ reservation.lot_id }}
                        </span>
                        <span class="ml-2 text-sm text-gray-600">
                          {{ reservation.reserved_meters }} เมตร
                        </span>
                      </div>

                      <!-- Product Name -->
                      <p class="text-sm font-medium text-gray-900 mb-1">
                        {{ reservation.product_name }}
                      </p>

                      <!-- Location -->
                      <p v-if="reservation.location" class="text-xs text-gray-500">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        {{ reservation.location }}
                      </p>

                      <!-- Lot Info -->
                      <div v-if="reservation.lot_info && reservation.lot_info.length > 0" 
                           class="mt-2 pt-2 border-t border-gray-200">
                        <p class="text-xs text-gray-600">
                          ม้วนปัจจุบัน: {{ reservation.lot_info[0].current_meters }} เมตร
                          <span class="text-gray-400 ml-2">
                            (จอง: {{ reservation.lot_info[0].reserved_meters || 0 }} เมตร)
                          </span>
                        </p>
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="ml-4">
                      <span v-if="reservation.status === 'paid'" 
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i class="fas fa-check-circle mr-1"></i>
                        ชำระเงินแล้ว
                      </span>
                      <span v-else-if="reservation.status === 'not_paid'" 
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <i class="fas fa-clock mr-1"></i>
                        รอชำระเงิน
                      </span>
                      <span v-else-if="reservation.status === 'cancelled'" 
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <i class="fas fa-times-circle mr-1"></i>
                        ยกเลิกแล้ว
                      </span>
                    </div>
                  </div>

                  <!-- Expiry Date (for not_paid) -->
                  <div v-if="reservation.status === 'not_paid' && reservation.expiry_date" 
                       class="mt-3 pt-3 border-t border-orange-200">
                    <p class="text-xs text-orange-700 flex items-center">
                      <i class="fas fa-exclamation-triangle mr-2"></i>
                      การจองนี้หมดอายุ: {{ formatDate(reservation.expiry_date) }}
                      <span class="ml-2 text-orange-600">(ยกเลิกได้ใน 7 วัน)</span>
                    </p>
                  </div>

                  <!-- Confirmed Date (for paid) -->
                  <div v-if="reservation.status === 'paid' && reservation.confirmed_date" 
                       class="mt-3 pt-3 border-t border-green-200">
                    <p class="text-xs text-green-700 flex items-center">
                      <i class="fas fa-check-circle mr-2"></i>
                      ชำระเงินเมื่อ: {{ formatDate(reservation.confirmed_date) }}
                      <span class="ml-2 text-green-600 font-medium">(ยกเลิกไม่ได้)</span>
                    </p>
                  </div>
                </div>

                <!-- Summary -->
                <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="text-sm text-gray-700">
                    <strong>สรุป:</strong> จองทั้งหมด {{ stockReservations.length }} รายการ
                    <span class="ml-2">
                      ({{ stockReservations.filter(r => r.status === 'paid').length }} ชำระแล้ว,
                      {{ stockReservations.filter(r => r.status === 'not_paid').length }} รอชำระ)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Summary -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">สรุปยอด</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">ยอดรวมก่อนภาษี:</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(quotation.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">ภาษีมูลค่าเพิ่ม ({{ quotation.vat_rate }}%):</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(quotation.vat_amount) }}</span>
              </div>
              <hr class="border-gray-200">
              <div class="flex justify-between text-lg font-bold">
                <span class="text-gray-900">ยอดรวมทั้งสิ้น:</span>
                <span class="text-blue-600">{{ formatCurrency(quotation.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Debug Panel -->
    <!-- ปิดใช้งาน Debug Panel เพราะมี Document Flow แทนแล้ว -->
    <!-- <DocumentDebugPanel
      v-if="quotation"
      documentType="Quotation"
      :currentDocument="quotation"
      :salesService="salesService"
    /> -->
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'
// import DocumentDebugPanel from '../DocumentDebugPanel.vue'

export default {
  name: 'QuotationDetail',
  components: {
    ErpBreadcrumb
    // DocumentDebugPanel
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const salesService = inject('salesService')
    
    // Breadcrumb navigation
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Quotations', path: '/sales/quotation', icon: 'fas fa-file-alt' },
      { name: 'Quotation Detail' }
    ])
    
    const quotation = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const creatingInvoice = ref(false)
    
    // Linked documents
    const linkedInvoice = ref(null)
    const linkedSalesOrder = ref(null)
    
    // ✅ Stock Reservations
    const stockReservations = ref([])
    const loadingReservations = ref(false)
    
    // ตรวจสอบว่าสามารถสร้าง Invoice ได้หรือไม่
    const canCreateInvoice = computed(() => {
      if (!quotation.value) return false
      return quotation.value.status === 'draft' && !quotation.value.invoice_id
    })
    
    const loadQuotation = async () => {
      loading.value = true
      error.value = null
      
      try {
        const id = route.params.id
        console.log('🔄 [Quotation Detail] Loading quotation:', id)
        
        let result
        if (salesService && salesService.getQuotation) {
          result = await salesService.getQuotation(id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getQuotation(id)
        }
        
        if (result) {
          quotation.value = result
          console.log('✅ [Quotation Detail] Loaded:', quotation.value)
          
          // Load linked documents
          await loadLinkedDocuments()
        } else {
          error.value = 'ไม่พบข้อมูลใบเสนอราคา'
        }
      } catch (err) {
        console.error('❌ [Quotation Detail] Error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    const loadLinkedDocuments = async () => {
      if (!quotation.value) return
      
      try {
        console.log('🔗 [Quotation Detail] Loading linked documents...')
        
        let serviceInstance = salesService
        if (!serviceInstance || !serviceInstance.getQuotationWithLinkedDocuments) {
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          serviceInstance = newSalesService
        }
        
        const linkedData = await serviceInstance.getQuotationWithLinkedDocuments(quotation.value._id || quotation.value.id)
        
        linkedInvoice.value = linkedData.invoice
        linkedSalesOrder.value = linkedData.salesOrder
        
        console.log('✅ [Quotation Detail] Linked documents loaded:', {
          invoice: !!linkedInvoice.value,
          salesOrder: !!linkedSalesOrder.value
        })

        // ✅ Load stock reservations if invoice exists
        await loadStockReservations()

      } catch (err) {
        console.error('❌ [Quotation Detail] Error loading linked documents:', err)
      }
    }

    // ✅ Load stock reservations
    const loadStockReservations = async () => {
      if (!quotation.value) return

      try {
        loadingReservations.value = true
        console.log('📦 [Quotation Detail] Loading stock reservations...')

        // Import InventoryService
        const { inventoryService } = await import('@/services/InventoryService.js')

        // Initialize if needed
        if (!inventoryService.isReady()) {
          inventoryService.initialize(window.vueApp?.config?.globalProperties)
        }

        // Get reservations for this quotation
        const reservations = await inventoryService.getReservations(
          'quotation',
          quotation.value._id || quotation.value.id
        )

        stockReservations.value = reservations || []

        console.log('✅ [Quotation Detail] Loaded reservations:', stockReservations.value.length)

      } catch (err) {
        console.error('❌ [Quotation Detail] Error loading stock reservations:', err)
      } finally {
        loadingReservations.value = false
      }
    }
    
    const handleCreateInvoice = async () => {
      if (!confirm('ต้องการสร้าง Invoice จากใบเสนอราคานี้หรือไม่?')) {
        return
      }
      
      creatingInvoice.value = true
      
      try {
        console.log('🔄 [Quotation Detail] Creating invoice from quotation:', route.params.id)
        
        let result
        if (salesService && salesService.createInvoiceFromQuotation) {
          result = await salesService.createInvoiceFromQuotation(route.params.id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.createInvoiceFromQuotation(route.params.id)
        }
        
        console.log('✅ [Quotation Detail] Invoice created:', result)
        
        // แสดงข้อความสำเร็จและนำไปหน้า Invoice
        alert(`สร้าง Invoice สำเร็จ: ${result.invoice_number}`)
        router.push(`/sales/invoice/${result._id}`)
        
      } catch (err) {
        console.error('❌ [Quotation Detail] Error creating invoice:', err)
        alert(`เกิดข้อผิดพลาด: ${err.message}`)
      } finally {
        creatingInvoice.value = false
      }
    }
    
    const handleViewInvoice = () => {
      if (quotation.value.invoice_id) {
        router.push(`/sales/invoice/${quotation.value.invoice_id}`)
      }
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return dateString
      }
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        'draft': 'bg-blue-100 text-blue-800',
        'quoted': 'bg-green-100 text-green-800',
        'sent': 'bg-yellow-100 text-yellow-800',
        'accepted': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'invoiced': 'bg-purple-100 text-purple-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusBadgeClass = (status) => {
      const statusClasses = {
        'draft': 'bg-blue-100 text-blue-800',
        'quoted': 'bg-indigo-100 text-indigo-800',
        'invoiced': 'bg-purple-100 text-purple-800',
        'confirmed': 'bg-green-100 text-green-800',
        'paid': 'bg-emerald-100 text-emerald-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'pending_payment': 'bg-orange-100 text-orange-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const viewDocument = (type, id) => {
      router.push(`/sales/${type}/${id}`)
    }
    
    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'quoted': 'เสนอราคาแล้ว',
        'sent': 'ส่งแล้ว',
        'accepted': 'ตอบรับแล้ว',
        'rejected': 'ปฏิเสธ',
        'invoiced': 'สร้าง Invoice แล้ว'
      }
      return statusTexts[status] || status
    }
    
    const handleEdit = () => {
      if (quotation.value.invoice_id) {
        alert('ไม่สามารถแก้ไขได้เนื่องจากสร้าง Invoice แล้ว')
        return
      }
      router.push(`/sales/quotation/${route.params.id}/edit`)
    }
    
    const handlePrint = () => {
      router.push(`/sales/quotation/${route.params.id}/print`)
    }
    
    const handlePreviewDocument = async () => {
      if (!quotation.value) {
        alert('ไม่พบข้อมูลใบเสนอราคา')
        return
      }
      
      try {
        console.log('🔍 [Quotation] Starting document preview...')
        console.log('📦 Raw Quotation Data:', quotation.value)
        
        // Get ERP Core
        const core = window.ERP_CORE || window.vueApp?.config?.globalProperties?.$erpCore
        if (!core) {
          console.error('❌ ERP_CORE not available')
          alert('ระบบ ERP Core ไม่พร้อมใช้งาน')
          return
        }
        
        // Import Document Factory
        const { createStandardDocument } = await import('../../../../core/components/document/DocumentFactory.js')
        
        // แปลงข้อมูลเป็น Standard Document Schema
        const standardDocument = createStandardDocument('quotation', quotation.value, { validate: true })
        
        console.log('✅ Converted Standard Document:', standardDocument)
        console.log('📄 Document Number:', standardDocument.documentNumber)
        console.log('📊 Items Count:', standardDocument.items.length)
        console.log('📑 Pagination Info:', standardDocument.metadata?.pagination)
        console.log('💰 Financial Summary:', {
          subtotal: standardDocument.financial.subtotal,
          vat: standardDocument.financial.vatAmount,
          total: standardDocument.financial.grandTotal
        })
        console.log('📋 Items Details:', standardDocument.items)
        
        // Get DocumentPreview component
        const DocumentPreview = core.components.DocumentPreview
        
        if (!DocumentPreview) {
          console.warn('⚠️ DocumentPreview component not available in CORE')
          alert('DocumentPreview component ไม่พร้อมใช้งาน')
          return
        }
        
        const { createApp, h } = await import('vue')
        
        // สร้าง Vue app พร้อม DocumentPreview component
        const previewApp = createApp({
          data() {
            return {
              showPreview: true
            }
          },
          render() {
            return h(DocumentPreview, {
              show: this.showPreview,
              documentType: 'quotation',
              documentData: standardDocument,  // ✅ ใช้ documentData (ถูกต้อง)
              title: 'ใบเสนอราคา',
              onClose: () => {
                console.log('📌 [Quotation] Closing document preview')
                this.showPreview = false
                this.$nextTick(() => {
                  previewApp.unmount()
                  if (previewContainer && previewContainer.parentNode) {
                    document.body.removeChild(previewContainer)
                  }
                  document.body.style.overflow = 'auto'
                })
              },
              onPrint: () => {
                console.log('🖨️ Printing quotation')
                core.showNotification('success', 'ส่งคำสั่งพิมพ์ใบเสนอราคาแล้ว!', 'Print')
              },
              onDownload: () => {
                console.log('📥 Downloading quotation')
                core.showNotification('success', 'ดาวน์โหลดใบเสนอราคาแล้ว!', 'Download')
              }
            })
          }
        })
        
        // สร้าง container element
        const previewContainer = document.createElement('div')
        previewContainer.id = 'quotation-preview-container'
        document.body.appendChild(previewContainer)
        document.body.style.overflow = 'hidden'
        
        // Mount app
        previewApp.mount(previewContainer)
        
        console.log('✅ [Quotation] Document preview opened successfully')
      } catch (error) {
        console.error('❌ [Quotation] Error opening document preview:', error)
        alert('เกิดข้อผิดพลาดในการเปิดตัวอย่างเอกสาร: ' + error.message)
      }
    }
    
    onMounted(() => {
      loadQuotation()
    })
    
    return {
      quotation,
      loading,
      error,
      creatingInvoice,
      canCreateInvoice,
      linkedInvoice,
      linkedSalesOrder,
      stockReservations, // ✅
      loadingReservations, // ✅
      salesService,
      breadcrumbNav,
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusBadgeClass,
      getStatusText,
      handleEdit,
      handlePrint,
      handlePreviewDocument,
      handleCreateInvoice,
      handleViewInvoice,
      viewDocument
    }
  }
}
</script>

<style scoped>
/* Custom animations for loading */
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

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
```