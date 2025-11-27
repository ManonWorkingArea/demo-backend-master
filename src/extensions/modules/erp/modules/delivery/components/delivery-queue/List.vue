<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-truck-loading text-orange-500"></i>
              คิวจัดส่งสินค้า
            </h1>
            <p class="mt-2 text-gray-600">Work Orders ที่พร้อมจัดส่ง และสร้างใบจัดส่ง</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="createTestWorkOrder"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้าง Test Work Order
            </button>
            <button 
              @click="refreshData"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/delivery/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Delivery Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Delivery Queue</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button 
          @click="loadData"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-refresh mr-2"></i>
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-tasks text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ readyToShipOrders.length }}</p>
              <p class="text-sm text-gray-600">พร้อมจัดส่ง</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-shipping-fast text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ existingDeliveries.length }}</p>
              <p class="text-sm text-gray-600">ใบจัดส่งที่มีอยู่</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ availableForDelivery.length }}</p>
              <p class="text-sm text-gray-600">พร้อมสร้างใบจัดส่ง</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-dollar-sign text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">฿{{ formatNumber(totalOrderValue) }}</p>
              <p class="text-sm text-gray-600">มูลค่ารวม</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Ready to Ship Work Orders -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i class="fas fa-truck-loading text-orange-500"></i>
              Work Orders พร้อมจัดส่ง
            </h3>
            <p class="text-sm text-gray-600 mt-1">รายการ Work Order ที่มีสถานะ "ready-to-ship" และพร้อมสร้างใบจัดส่ง</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="readyToShipOrders.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-truck-loading text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่มี Work Order ที่พร้อมจัดส่ง</h3>
          <p class="text-gray-600 mb-4">ยังไม่มี Work Order ที่มีสถานะ "ready-to-ship" ในระบบ</p>
          <div class="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 class="font-medium text-gray-900 mb-2">กำลังค้นหา Work Orders ที่มี status:</h4>
            <ul class="text-sm text-gray-600">
              <li>• ready-to-ship (พร้อมจัดส่ง)</li>
            </ul>
          </div>
        </div>

        <!-- Work Orders Table -->
        <div v-else class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Order</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรายการ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">มูลค่า</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เสร็จ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in readyToShipOrders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ order.order_number }}</div>
                      <div class="text-sm text-gray-500">#{{ order.id }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-blue-600">{{ order.sales_order_number || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ order.customer_name || 'ไม่ระบุ' }}</div>
                      <div v-if="order.customer_phone" class="text-sm text-gray-500">{{ order.customer_phone }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center text-sm text-gray-900">
                      <i class="fas fa-box mr-2 text-gray-400"></i>
                      {{ getItemsCount(order) }} รายการ
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-green-600">฿{{ formatNumber(order.total_amount || 0) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ formatDate(order.updated_date || order.created_date) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {{ getStatusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <!-- ถ้ามี Delivery แล้ว แสดงปุ่มดู -->
                      <button 
                        v-if="hasDelivery(order.id)"
                        @click="viewDelivery(order.id)"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors inline-flex items-center"
                        title="ดูใบจัดส่ง"
                      >
                        <i class="fas fa-eye mr-1"></i>
                        ดูใบจัดส่ง
                      </button>
                      
                      <!-- ถ้ายังไม่มี Delivery แสดงปุ่มสร้าง -->
                      <button 
                        v-else
                        @click="createDelivery(order)"
                        :disabled="creatingDelivery === order.id"
                        class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors inline-flex items-center"
                        title="สร้างใบจัดส่ง"
                      >
                        <i class="fas fa-spinner fa-spin mr-1" v-if="creatingDelivery === order.id"></i>
                        <i class="fas fa-truck mr-1" v-else></i>
                        {{ creatingDelivery === order.id ? 'กำลังสร้าง...' : 'สร้างใบจัดส่ง' }}
                      </button>
                      
                      <!-- ปุ่มดูรายละเอียด Work Order -->
                      <button 
                        @click="viewWorkOrderDetail(order)"
                        class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors inline-flex items-center"
                        title="ดูรายละเอียด Work Order"
                      >
                        <i class="fas fa-tasks mr-1"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Order Detail Modal -->
    <div v-if="showWorkOrderDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i class="fas fa-tasks text-blue-600"></i>
            รายละเอียด Work Order
          </h3>
          <button @click="closeWorkOrderDetail" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6" v-if="selectedWorkOrder">
          <!-- Work Order Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Work Order Number:</label>
                <span class="text-sm text-gray-900">{{ selectedWorkOrder.order_number }}</span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sales Order:</label>
                <span class="text-sm text-gray-900">{{ selectedWorkOrder.sales_order_number || 'N/A' }}</span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ลูกค้า:</label>
                <span class="text-sm text-gray-900">{{ selectedWorkOrder.customer_name || 'ไม่ระบุ' }}</span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ:</label>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {{ getStatusText(selectedWorkOrder.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สร้าง:</label>
                <span class="text-sm text-gray-900">{{ formatDate(selectedWorkOrder.created_date) }}</span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่อัปเดต:</label>
                <span class="text-sm text-gray-900">{{ formatDate(selectedWorkOrder.updated_date) }}</span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-box text-blue-600"></i>
              รายการสินค้า
            </h4>
            
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนสั่ง</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเบิก</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วย</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in getWorkOrderItems(selectedWorkOrder)" :key="item.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ item.product_name || 'ไม่ระบุ' }}</div>
                        <div v-if="item.product_code" class="text-sm text-gray-500">รหัส: {{ item.product_code }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ item.quantity || 0 }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ item.picked_quantity || 0 }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ item.unit || 'ชิ้น' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {{ getItemStatusText(item.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activities -->
          <div v-if="selectedWorkOrder.activities && selectedWorkOrder.activities.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-history text-blue-600"></i>
              กิจกรรม
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div v-for="activity in selectedWorkOrder.activities" :key="activity.id" class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">{{ activity.description }}</div>
                  <div class="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{{ activity.user }}</span>
                    <span>{{ formatDateTime(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            @click="closeWorkOrderDetail"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ปิด
          </button>
          <button 
            v-if="!hasDelivery(selectedWorkOrder.id)"
            @click="createDelivery(selectedWorkOrder)"
            :disabled="creatingDelivery === selectedWorkOrder.id"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <i class="fas fa-spinner fa-spin" v-if="creatingDelivery === selectedWorkOrder.id"></i>
            <i class="fas fa-truck" v-else></i>
            {{ creatingDelivery === selectedWorkOrder.id ? 'กำลังสร้าง...' : 'สร้างใบจัดส่ง' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const ERP_CORE = window.ERP_CORE
const { delivery, general } = ERP_CORE.utils

export default {
  name: 'DeliveryQueue',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const workOrders = ref([])
    const deliveries = ref([])
    const loading = ref(true)
    const error = ref('')
    const creatingDelivery = ref(null)
    
    // Modal State
    const showWorkOrderDetail = ref(false)
    const selectedWorkOrder = ref(null)

    // Computed
    const readyToShipOrders = computed(() => {
      const filtered = workOrders.value.filter(order => {
        const isReady = order.status === 'ready-to-ship'
        if (isReady) {
          console.log('✅ Found ready-to-ship order:', order)
        }
        return isReady
      })
      console.log('📦 Total ready-to-ship orders:', filtered.length)
      return filtered
    })

    const existingDeliveries = computed(() => {
      return deliveries.value || []
    })

    const availableForDelivery = computed(() => {
      return readyToShipOrders.value.filter(order => !hasDelivery(order.id))
    })

    const totalOrderValue = computed(() => {
      return readyToShipOrders.value.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    })

    // Methods
    const loadData = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Load Work Orders
        const workOrderResult = await engine.list(TRANSACTION_TYPES.WORK_ORDER)
        workOrders.value = workOrderResult.data || []
        
        // Load Deliveries
        const deliveryResult = await engine.list(TRANSACTION_TYPES.DELIVERY)
        deliveries.value = deliveryResult.data || []
        
        console.log('📋 Loaded work orders:', workOrders.value.length)
        console.log('📋 Work orders data:', workOrders.value)
        console.log('📋 Loaded deliveries:', deliveries.value.length)
        
        // Debug: Check ready-to-ship orders
        const ready = workOrders.value.filter(order => order.status === 'ready-to-ship')
        console.log('📦 Ready-to-ship orders found:', ready.length, ready)
        
      } catch (err) {
        console.error('❌ Error loading data:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const hasDelivery = (workOrderId) => {
      return deliveries.value.some(delivery => delivery.work_order_id === workOrderId)
    }

    const getDeliveryByWorkOrderId = (workOrderId) => {
      return deliveries.value.find(delivery => delivery.work_order_id === workOrderId)
    }

    const createDelivery = async (workOrder) => {
      try {
        creatingDelivery.value = workOrder.id
        
        // Generate Delivery Number using utils
        const deliveryNumber = general.generateReferenceNumber('DEL')
        
        // Prepare shipping address first
        const shippingAddress = {
          company: workOrder.customer_name || 'บริษัท ลูกค้าทดสอบ จำกัด',
          address1: '123 ถนนสุขุมวิท',
          address2: 'แขวงคลองตัน',
          city: 'กรุงเทพฯ',
          state: 'กรุงเทพมหานคร',
          postal_code: '10110',
          country: 'ประเทศไทย'
        }
        
        // Prepare Delivery data
        const deliveryData = {
          delivery_number: deliveryNumber,
          work_order_id: workOrder.id,
          work_order_number: workOrder.order_number,
          sales_order_id: workOrder.sales_order_id,
          sales_order_number: workOrder.sales_order_number,
          customer_name: workOrder.customer_name || 'ลูกค้าทดสอบ',
          customer_phone: workOrder.customer_phone || '02-123-4567',
          customer_email: workOrder.customer_email || 'customer@test.com',
          customer_tax_id: workOrder.customer_tax_id || '1234567890123',
          status: 'scheduled',
          delivery_type: 'standard',
          shipping_method: 'delivery',
          priority: 'normal',
          shipping_address: shippingAddress,
          items: getWorkOrderItems(workOrder).map(item => ({
            id: item.id || general.generateReferenceNumber('ITM', { length: 6 }),
            product_id: item.product_id,
            product_name: item.product_name || 'สินค้าทดสอบ',
            product_code: item.product_code || general.generateReferenceNumber('SKU', { length: 6 }),
            description: item.description || 'รายละเอียดสินค้า',
            quantity: item.picked_quantity || item.quantity || 1,
            delivery_quantity: item.picked_quantity || item.quantity || 1,
            unit: item.unit || 'ชิ้น',
            unit_price: item.unit_price || 100,
            status: 'pending'
          })),
          total_amount: workOrder.total_amount || 1000,
          shipping_cost: delivery.calculateShippingCost(
            10, // total weight (kg)
            0.1, // total volume (m³)
            shippingAddress,
            'delivery',
            { deliveryType: 'standard' }
          ),
          costs: {
            packaging_cost: delivery.calculatePackagingCost('box', 10, 0.1),
            handling_cost: Math.max((workOrder.total_amount || 1000) * 0.02, 20),
            insurance_cost: (workOrder.total_amount || 1000) * 0.001
          },
          discount_amount: 0,
          scheduled_date: new Date().toISOString().split('T')[0],
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          notes: `สร้างจาก Work Order: ${workOrder.order_number}`,
          activities: [
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'created',
              description: 'สร้างใบจัดส่งจาก Work Order',
              user: 'System',
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        // Create Delivery
        const result = await engine.create(TRANSACTION_TYPES.DELIVERY, deliveryData)
        
        if (result.success) {
          // Refresh data
          await loadData()
          
          // Close modal if open
          if (showWorkOrderDetail.value && selectedWorkOrder.value?.id === workOrder.id) {
            closeWorkOrderDetail()
          }
          
          // Navigate to Delivery detail
          router.push(`/delivery/delivery-request/${result.data.id}`)
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบจัดส่งได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating delivery:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบจัดส่ง: ' + err.message)
      } finally {
        creatingDelivery.value = null
      }
    }

    const viewDelivery = (workOrderId) => {
      const delivery = getDeliveryByWorkOrderId(workOrderId)
      if (delivery) {
        router.push(`/delivery/detail/${delivery.id}`)
      }
    }

    const viewWorkOrderDetail = (workOrder) => {
      selectedWorkOrder.value = workOrder
      showWorkOrderDetail.value = true
    }

    const closeWorkOrderDetail = () => {
      showWorkOrderDetail.value = false
      selectedWorkOrder.value = null
    }

    const refreshData = () => {
      loadData()
    }

    const createTestWorkOrder = async () => {
      try {
        const testWorkOrderData = {
          id: Date.now().toString(),
          order_number: general.generateReferenceNumber('WO'),
          sales_order_id: general.generateReferenceNumber('SO', { length: 6 }),
          sales_order_number: general.generateReferenceNumber('SO', { length: 6 }),
          customer_name: 'ไฟไฟ ไฟไฟ',
          customer_phone: '123-456-7890',
          status: 'ready-to-ship',
          priority: 'normal',
          items: [
            {
              id: general.generateReferenceNumber('ITM', { length: 4 }),
              product_id: general.generateReferenceNumber('PRD', { length: 6 }),
              product_name: 'สินค้าทดสอบ 1',
              product_code: general.generateReferenceNumber('SKU', { length: 6 }),
              quantity: 2,
              picked_quantity: 2,
              unit: 'ชิ้น',
              unit_price: 5350,
              status: 'picked'
            }
          ],
          total_amount: 10700,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          notes: 'Test Work Order สำหรับทดสอบระบบจัดส่ง',
          activities: [
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'created',
              description: 'สร้าง Work Order ทดสอบ',
              user: 'System',
              timestamp: new Date().toISOString()
            },
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'picked',
              description: 'เบิกสินค้าเสร็จสิ้น - พร้อมจัดส่ง',
              user: 'System',
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        const result = await engine.create(TRANSACTION_TYPES.WORK_ORDER, testWorkOrderData)
        
        if (result.success) {
          console.log('✅ Created test work order:', result.data)
          await loadData() // Refresh data
          alert('สร้าง Test Work Order สำเร็จ!')
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้าง Test Work Order ได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating test work order:', err)
        alert('เกิดข้อผิดพลาดในการสร้าง Test Work Order: ' + err.message)
      }
    }

    const getWorkOrderItems = (workOrder) => {
      return workOrder.items || []
    }

    const getItemsCount = (workOrder) => {
      const items = getWorkOrderItems(workOrder)
      return items.length
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'picking': 'กำลังเบิก',
        'picked': 'เบิกเสร็จ',
        'ready-to-ship': 'พร้อมจัดส่ง',
        'shipped': 'จัดส่งแล้ว',
        'completed': 'เสร็จสิ้น'
      }
      return statusMap[status] || status
    }

    const getItemStatusText = (status) => {
      const statusMap = {
        'pending': 'รอเบิก',
        'picking': 'กำลังเบิก',
        'picked': 'เบิกแล้ว',
        'ready': 'พร้อม'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return general.formatDate(dateString, 'short')
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      return general.formatDateTime(dateString)
    }

    const formatNumber = (number) => {
      return general.formatCurrency(number || 0, { symbol: false })
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      workOrders,
      deliveries,
      loading,
      error,
      creatingDelivery,
      showWorkOrderDetail,
      selectedWorkOrder,
      
      // Computed
      readyToShipOrders,
      existingDeliveries,
      availableForDelivery,
      totalOrderValue,
      
      // Methods
      loadData,
      hasDelivery,
      createDelivery,
      viewDelivery,
      viewWorkOrderDetail,
      closeWorkOrderDetail,
      refreshData,
      createTestWorkOrder,
      getWorkOrderItems,
      getItemsCount,
      getStatusText,
      getItemStatusText,
      formatDate,
      formatDateTime,
      formatNumber
    }
  }
}
</script>

<style scoped>
/* Loading animation */
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

/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>