<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-users text-blue-600 mr-3"></i>
              การจัดการลูกค้า
            </h1>
            <p class="mt-2 text-gray-600">ระบบจัดการข้อมูลลูกค้า เครดิต และประวัติการซื้อ</p>
          </div>
          <div class="flex space-x-3">
            <router-link to="/sales/customers/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center">
              <i class="fas fa-plus mr-2"></i>
              เพิ่มลูกค้าใหม่
            </router-link>
            <button @click="refreshData" :disabled="loading" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Statistics Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" v-if="stats">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
              <p class="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-check text-green-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.active || 0 }}</p>
              <p class="text-sm text-gray-600">ใช้งาน</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-credit-card text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalCredit || 0) }}</p>
              <p class="text-sm text-gray-600">วงเงินเครดิตรวม</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalOutstanding || 0) }}</p>
              <p class="text-sm text-gray-600">ยอดค้างชำระรวม</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
            <div class="relative">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="ค้นหาลูกค้า (รหัส, ชื่อ, เบอร์โทร, อีเมล)"
                @input="handleSearch"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="suspended">ระงับการใช้งาน</option>
              <option value="blacklisted">บัญชีดำ</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
            <select 
              v-model="filters.customer_type" 
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="individual">บุคคลธรรมดา</option>
              <option value="corporate">นิติบุคคล</option>
              <option value="government">หน่วยงานราชการ</option>
              <option value="non-profit">องค์กรไม่แสวงหากำไร</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredCustomers.length }} ลูกค้าพบ</span>
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ล้างตัวกรอง
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">มุมมอง:</label>
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg',
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg',
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Customers Grid/List View -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="loadCustomers" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          <i class="fas fa-redo mr-2"></i>
          ลองใหม่
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="customer in paginatedCustomers" 
          :key="customer.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
          @click="viewCustomerDetail(customer.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ customer.name }}</h3>
              <p class="text-sm text-gray-500">{{ customer.customer_code }}</p>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600" v-if="customer.contact_person">
              <i class="fas fa-user mr-2"></i>
              {{ customer.contact_person }}
            </p>
            <p class="text-sm text-gray-600" v-if="customer.phone">
              <i class="fas fa-phone mr-2"></i>
              {{ customer.phone }}
            </p>
            <p class="text-sm text-gray-600" v-if="customer.email">
              <i class="fas fa-envelope mr-2"></i>
              {{ customer.email }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col space-y-1">
              <span :class="getStatusBadgeClass(customer.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ getStatusText(customer.status) }}
              </span>
              <span :class="getTypeBadgeClass(customer.customer_type)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ getCustomerTypeText(customer.customer_type) }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(customer.credit_limit || 0) }}
              </p>
              <p class="text-xs text-gray-500">วงเงินเครดิต</p>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การติดต่อ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วงเงินเครดิต</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ค้างชำระ</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="7" class="px-6 py-20 text-center">
                <div class="flex flex-col items-center">
                  <i class="fas fa-users text-gray-400 text-5xl mb-4"></i>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลลูกค้า</h3>
                  <p class="text-gray-600 mb-4" v-if="searchTerm || hasActiveFilters">ไม่พบลูกค้าที่ตรงกับเงื่อนไขการค้นหา</p>
                  <p class="text-gray-600 mb-4" v-else>ยังไม่มีลูกค้าในระบบ เริ่มต้นโดยเพิ่มลูกค้าใหม่</p>
                  <router-link to="/sales/customers/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                    <i class="fas fa-plus mr-2"></i>
                    เพิ่มลูกค้าใหม่
                  </router-link>
                </div>
              </td>
            </tr>
            <tr 
              v-for="customer in paginatedCustomers" 
              :key="customer.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="viewCustomerDetail(customer.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                    <div class="text-sm text-gray-500">{{ customer.customer_code }}</div>
                    <div v-if="customer.contact_person" class="text-sm text-gray-500">{{ customer.contact_person }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeBadgeClass(customer.customer_type)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                  {{ getCustomerTypeText(customer.customer_type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(customer.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(customer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div v-if="customer.phone" class="flex items-center">
                  <i class="fas fa-phone mr-2 text-gray-400"></i>
                  {{ customer.phone }}
                </div>
                <div v-if="customer.email" class="flex items-center">
                  <i class="fas fa-envelope mr-2 text-gray-400"></i>
                  {{ customer.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(customer.credit_limit || 0) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="text-sm font-medium" :class="{ 'text-red-600': isOverLimit(customer) }">
                  {{ formatCurrency(customer.outstanding_balance || 0) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <router-link 
                    :to="`/sales/customers/${customer.id}`" 
                    class="text-blue-600 hover:text-blue-700 p-1 rounded"
                    title="ดูรายละเอียด"
                    @click.stop
                  >
                    <i class="fas fa-eye"></i>
                  </router-link>
                  <router-link 
                    :to="`/sales/customers/${customer.id}/edit`" 
                    class="text-blue-600 hover:text-blue-700 p-1 rounded"
                    title="แก้ไข"
                    @click.stop
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>



<script>
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { salesService } from '@/services/SalesService.js'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'CustomerManager',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    
    // Breadcrumb
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Customers', path: '/sales/customers', icon: 'fas fa-users' }
    ])
    
    // State
    const loading = ref(true)
    const error = ref(null)
    const customers = ref([])
    const searchTerm = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const sortField = ref('name')
    const sortDirection = ref('asc')
    const viewMode = ref('list') // 'grid' or 'list'
    
    // Filters
    const filters = ref({
      status: '',
      customer_group: '',
      customer_type: ''
    })

    // Computed
    const stats = computed(() => {
      const total = customers.value.length
      const active = customers.value.filter(c => c.status === 'active').length
      const totalCredit = customers.value.reduce((sum, c) => sum + (c.credit_limit || 0), 0)
      const totalOutstanding = customers.value.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0)
      
      return {
        total,
        active,
        totalCredit,
        totalOutstanding
      }
    })

    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value !== '')
    })

    const filteredCustomers = computed(() => {
      let result = [...customers.value]

      // Apply search
      if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase()
        result = result.filter(customer => 
          customer.customer_code?.toLowerCase().includes(search) ||
          customer.name?.toLowerCase().includes(search) ||
          customer.phone?.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search) ||
          customer.contact_person?.toLowerCase().includes(search)
        )
      }

      // Apply filters
      if (filters.value.status) {
        result = result.filter(customer => customer.status === filters.value.status)
      }
      
      if (filters.value.customer_group) {
        result = result.filter(customer => customer.customer_group === filters.value.customer_group)
      }
      
      if (filters.value.customer_type) {
        result = result.filter(customer => customer.customer_type === filters.value.customer_type)
      }

      // Apply sorting
      result.sort((a, b) => {
        const aValue = a[sortField.value] || ''
        const bValue = b[sortField.value] || ''
        
        if (sortDirection.value === 'asc') {
          return aValue.toString().localeCompare(bValue.toString())
        } else {
          return bValue.toString().localeCompare(aValue.toString())
        }
      })

      return result
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredCustomers.value.length / itemsPerPage.value)
    })

    const paginatedCustomers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredCustomers.value.slice(start, end)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return Math.min(end, filteredCustomers.value.length)
    })

    // Methods
    const loadCustomers = async () => {
      loading.value = true
      error.value = null

      try {
        console.log('[Customer Manager] Loading customers via SalesService...')
        
        // Initialize service if not ready
        if (!salesService.isReady()) {
          const app = getCurrentInstance()
          if (app) {
            salesService.initialize(app.appContext.config.globalProperties)
          } else {
            console.error('❌ Cannot initialize SalesService - no Vue app context')
            throw new Error('SalesService initialization failed')
          }
        }
        
        // Load customers using SalesService
        const result = await salesService.getAllCustomers()
        
        console.log('[Customer Manager] SalesService result:', result)
        
        customers.value = Array.isArray(result) ? result : []
        console.log('[Customer Manager] Loaded customers via SalesService:', customers.value.length)
        
        // Debug customer data
        if (customers.value.length > 0) {
          console.log('[Customer Manager] Sample customer:', customers.value[0])
        }
        
      } catch (err) {
        console.error('[Customer Manager] Load error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า'
        customers.value = []
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadCustomers()
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      searchTerm.value = ''
      filters.value = {
        status: '',
        customer_group: '',
        customer_type: ''
      }
      currentPage.value = 1
    }

    const toggleSort = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const getSortClass = (field) => {
      if (sortField.value !== field) return ''
      return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const getCustomerTypeText = (type) => {
      const typeMap = {
        'individual': 'บุคคลธรรมดา',
        'corporate': 'นิติบุคคล',
        'government': 'หน่วยงานราชการ',
        'non-profit': 'องค์กรไม่แสวงหากำไร'
      }
      return typeMap[type] || '-'
    }

    const getCustomerGroupText = (group) => {
      const groupMap = {
        'retail': 'ปลีก',
        'wholesale': 'ส่ง',
        'distributor': 'จัดจำหน่าย',
        'vip': 'VIP',
        'regular': 'ทั่วไป'
      }
      return groupMap[group] || '-'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'suspended': 'ระงับ',
        'blacklisted': 'บัญชีดำ'
      }
      return statusMap[status] || '-'
    }

    const isOverLimit = (customer) => {
      const limit = customer.credit_limit || 0
      const outstanding = customer.outstanding_balance || 0
      return limit > 0 && outstanding > limit
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }

    // ✅ Navigation Functions
    const viewCustomerDetail = (id) => {
      router.push(`/sales/customers/${id}`)
    }

    // ✅ Badge Classes
    const getStatusBadgeClass = (status) => {
      const classes = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'suspended': 'bg-yellow-100 text-yellow-800',
        'blacklisted': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getTypeBadgeClass = (type) => {
      const classes = {
        'individual': 'bg-blue-100 text-blue-800',
        'corporate': 'bg-green-100 text-green-800',
        'government': 'bg-purple-100 text-purple-800',
        'non-profit': 'bg-orange-100 text-orange-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    // Watch for filter changes to reset pagination
    watch([searchTerm, filters], () => {
      currentPage.value = 1
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      loadCustomers()
    })

    return {
      loading,
      error,
      customers,
      searchTerm,
      currentPage,
      viewMode,
      filters,
      breadcrumbNav,
      stats,
      hasActiveFilters,
      filteredCustomers,
      paginatedCustomers,
      totalPages,
      startItem,
      endItem,
      loadCustomers,
      refreshData,
      handleSearch,
      applyFilters,
      clearFilters,
      toggleSort,
      getSortClass,
      goToPage,
      getCustomerTypeText,
      getCustomerGroupText,
      getStatusText,
      isOverLimit,
      formatCurrency,
      viewCustomerDetail,
      getStatusBadgeClass,
      getTypeBadgeClass
    }
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Custom responsive grid for stats */
@media (max-width: 768px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>