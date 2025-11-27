<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-tasks text-blue-500"></i>
              จัดการ Work Orders
            </h1>
            <p class="mt-2 text-gray-600">จัดการและติดตาม Work Orders ทั้งหมด</p>
          </div>
          <div class="flex space-x-3">
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
                to="/production/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Production Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Work Orders</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="เลขที่ Work Order หรือชื่อลูกค้า"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="applyFilters"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select 
              v-model="filters.status"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="picking">กำลังหยิบสินค้า</option>
              <option value="picked">หยิบเสร็จแล้ว</option>
              <option value="ready-to-ship">เตรียมส่งเรียบร้อย</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ความสำคัญ</label>
            <select 
              v-model="filters.priority"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="high">สูง</option>
              <option value="normal">ปกติ</option>
              <option value="low">ต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
              <p class="text-sm text-gray-600">รอดำเนินการ</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-hand-paper text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.picking }}</p>
              <p class="text-sm text-gray-600">กำลังหยิบสินค้า</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-check text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.picked }}</p>
              <p class="text-sm text-gray-600">หยิบเสร็จแล้ว</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-teal-400 to-green-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-truck text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.ready }}</p>
              <p class="text-sm text-gray-600">เตรียมส่งเรียบร้อย</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
          <i class="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
          <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
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
            @click="loadWorkOrders"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-refresh mr-2"></i>
            ลองใหม่
          </button>
        </div>
      </div>

      <!-- Work Orders Table -->
      <div v-else class="bg-white rounded-lg shadow-sm">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i class="fas fa-list text-blue-500"></i>
              รายการ Work Orders
            </h3>
            <p class="text-sm text-gray-600 mt-1">{{ filteredWorkOrders.length }} รายการ</p>
          </div>
        </div>
        
        <div v-if="filteredWorkOrders.length > 0" class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ Work Order</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความสำคัญ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรายการ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความคืบหน้า</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กำหนดส่ง</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สร้างเมื่อ</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="workOrder in filteredWorkOrders" :key="workOrder.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ workOrder.order_number }}</div>
                      <div class="text-sm text-gray-500">#{{ workOrder.id }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ workOrder.customer_name || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(workOrder.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusText(workOrder.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPriorityClass(workOrder.priority)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ getPriorityText(workOrder.priority) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center text-sm text-gray-900">
                      <i class="fas fa-box mr-2 text-gray-400"></i>
                      {{ workOrder.items?.length || 0 }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                          :style="{ width: getProgressPercentage(workOrder) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-600 font-medium min-w-fit">
                        {{ getPickedItemsCount(workOrder) }}/{{ workOrder.items?.length || 0 }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500" :class="getDueDateClass(workOrder.due_date)">
                      {{ formatDate(workOrder.due_date) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ formatDate(workOrder.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="viewWorkOrder(workOrder.id)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors inline-flex items-center"
                    >
                      <i class="fas fa-eye mr-1"></i>
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-inbox text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่พบ Work Orders</h3>
          <p class="text-gray-600">ยังไม่มี Work Orders ในระบบ หรือไม่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine } from '../../../../core/Engine'

export default {
  name: 'WorkOrderList',
  setup() {
    const router = useRouter()
    
    // Data
    const workOrders = ref([])
    const loading = ref(true)
    const error = ref('')
    
    // Filters
    const filters = reactive({
      status: '',
      priority: '',
      search: ''
    })
    
    // Transaction engine
    const engine = new TransactionEngine('local')
    
    // Computed
    const filteredWorkOrders = computed(() => {
      let filtered = [...workOrders.value]
      
      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(wo => wo.status === filters.status)
      }
      
      // Filter by priority
      if (filters.priority) {
        filtered = filtered.filter(wo => wo.priority === filters.priority)
      }
      
      // Filter by search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filtered = filtered.filter(wo => 
          wo.order_number?.toLowerCase().includes(searchTerm) ||
          wo.customer_name?.toLowerCase().includes(searchTerm) ||
          wo.id?.toLowerCase().includes(searchTerm)
        )
      }
      
      // Sort by created date (newest first)
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
    
    const stats = computed(() => {
      const counts = {
        pending: 0,
        picking: 0,
        picked: 0,
        ready: 0
      }
      
      workOrders.value.forEach(wo => {
        switch (wo.status) {
          case 'pending':
            counts.pending++
            break
          case 'picking':
            counts.picking++
            break
          case 'picked':
            counts.picked++
            break
          case 'ready-to-ship':
            counts.ready++
            break
        }
      })
      
      return counts
    })
    
    // Methods
    const loadWorkOrders = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const result = await engine.list('work-order')
        
        if (result.success && result.data) {
          workOrders.value = result.data
          console.log('📋 Work Orders loaded:', result.data.length)
        } else {
          error.value = result.error || 'ไม่สามารถโหลดข้อมูลได้'
        }
      } catch (err) {
        console.error('Error loading work orders:', err)
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = () => {
      loadWorkOrders()
    }
    
    const applyFilters = () => {
      // Filters are reactive, so the computed will update automatically
      console.log('Filters applied:', filters)
    }
    
    const viewWorkOrder = (workOrderId) => {
      router.push(`/production/work-order/${workOrderId}`)
    }
    
    const getPickedItemsCount = (workOrder) => {
      if (!workOrder.items) return 0
      return workOrder.items.filter(item => item.status === 'picked').length
    }
    
    const getProgressPercentage = (workOrder) => {
      if (!workOrder.items || workOrder.items.length === 0) return 0
      const pickedCount = getPickedItemsCount(workOrder)
      return (pickedCount / workOrder.items.length) * 100
    }
    
    // Utility functions
    const getStatusText = (status) => {
      const statuses = {
        'pending': 'รอดำเนินการ',
        'picking': 'กำลังหยิบสินค้า',
        'picked': 'หยิบเสร็จแล้ว', 
        'ready-to-ship': 'เตรียมส่งเรียบร้อย'
      }
      return statuses[status] || status
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'picking': 'bg-blue-100 text-blue-800',
        'picked': 'bg-green-100 text-green-800',
        'ready-to-ship': 'bg-purple-100 text-purple-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getPriorityText = (priority) => {
      const priorities = {
        'high': 'สูง',
        'normal': 'ปกติ',
        'low': 'ต่ำ'
      }
      return priorities[priority] || priority || 'ปกติ'
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        'high': 'bg-red-100 text-red-800',
        'normal': 'bg-green-100 text-green-800',
        'low': 'bg-gray-100 text-gray-800'
      }
      return classes[priority || 'normal'] || 'bg-gray-100 text-gray-800'
    }
    
    const getDueDateClass = (dueDate) => {
      if (!dueDate) return ''
      
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-red-600 font-semibold'
      if (diffDays <= 1) return 'text-orange-600 font-semibold'
      if (diffDays <= 3) return 'text-yellow-600 font-semibold'
      return ''
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    }
    
    // Initialize
    onMounted(() => {
      loadWorkOrders()
    })
    
    return {
      // Data
      workOrders,
      loading,
      error,
      filters,
      
      // Computed
      filteredWorkOrders,
      stats,
      
      // Methods
      loadWorkOrders,
      refreshData,
      applyFilters,
      viewWorkOrder,
      getPickedItemsCount,
      getProgressPercentage,
      
      // Utilities
      getStatusText,
      getStatusClass,
      getPriorityText,
      getPriorityClass,
      getDueDateClass,
      formatDate
    }
  }
}
</script>