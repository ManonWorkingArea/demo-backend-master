<template>
  <div v-if="isMounted" class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-users text-blue-600 mr-3"></i>
              การจัดการผู้ขาย
            </h1>
            <p class="mt-2 text-gray-600">จัดการข้อมูลผู้ขาย ผู้จัดหา และผู้ให้บริการ</p>
          </div>
          <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3">
            <button @click="openCreateForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center">
              <i class="fas fa-plus"></i>
              <span class="hidden sm:inline sm:ml-2">เพิ่มผู้ขายใหม่</span>
            </button>
            <button @click="refreshData" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center">
              <i class="fas fa-sync-alt"></i>
              <span class="hidden sm:inline sm:ml-2">รีเฟรช</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!isDataReady" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4"></i>
        <p class="text-gray-600 text-lg">กำลังโหลดข้อมูลผู้ขาย...</p>
      </div>
    </div>

    <!-- Main Content (only show when data is ready) -->
    <div v-if="isDataReady" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              <p class="text-sm text-gray-600">ผู้ขายทั้งหมด</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
              <p class="text-sm text-gray-600">ใช้งานอยู่</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
              <p class="text-sm text-gray-600">รอการอนุมัติ</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-star text-orange-600 text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.excellent }}</p>
              <p class="text-sm text-gray-600">ประเมินดีเยี่ยม</p>
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
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาด้วยชื่อ รหัส หรือผู้ติดต่อ..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select 
              v-model="statusFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option v-for="(label, value) in supplierStatusLabels" :key="value" :value="value">
                {{ label }}
              </option>
              <option value="deleted">ถูกลบแล้ว (Soft Deleted)</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
            <select 
              v-model="typeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option v-for="(label, value) in supplierTypeLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredSuppliers.length }} ผู้ขายพบ</span>
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
                  ? 'bg-blue-100 text-blue-600' 
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
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Test Actions (Development) -->
      <!-- <div class="flex space-x-2 mb-6">
        <button @click="testCreateSupplier" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <i class="fas fa-flask mr-1"></i>
          🧪 สร้างผู้ขายทดสอบ
        </button>
        <button @click="testCreateInternationalSupplier" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <i class="fas fa-globe mr-1"></i>
          🧪 สร้างผู้ขายต่างประเทศ
        </button>
      </div> -->

      <!-- Suppliers Grid/List View -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="supplier in filteredSuppliers" 
          :key="supplier.id"
          :class="[
            'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer',
            supplier.status === 'deleted' ? 'bg-red-50 border border-red-200' : ''
          ]"
          @click="viewSupplierDetail(supplier.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ supplier.name }}</h3>
              <p class="text-sm text-gray-500">{{ supplier.supplier_code }}</p>
            </div>
            <div class="relative">
              <button 
                @click.stop="toggleDropdown(supplier.id)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div 
                v-if="dropdownOpen === supplier.id"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div class="py-1">
                  <button 
                    @click="editSupplier(supplier.id)"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="fas fa-edit mr-2"></i>แก้ไข
                  </button>
                  <button 
                    v-if="supplier.status === 'pending'"
                    @click="approveSupplier(supplier.id)"
                    class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                  >
                    <i class="fas fa-check mr-2"></i>อนุมัติ
                  </button>
                  <button 
                    v-if="supplier.status !== 'deleted'"
                    @click="deleteSupplier(supplier.id)"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i class="fas fa-trash mr-2"></i>ลบ (Soft Delete)
                  </button>
                  <button 
                    v-if="supplier.status === 'deleted'"
                    @click="restoreSupplier(supplier.id)"
                    class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <i class="fas fa-undo mr-2"></i>กู้คืน
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600" v-if="supplier.contact_person">
              <i class="fas fa-user mr-2"></i>
              {{ supplier.contact_person }}
            </p>
            <p class="text-sm text-gray-600" v-if="supplier.phone">
              <i class="fas fa-phone mr-2"></i>
              {{ supplier.phone }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDate(supplier.created_at) }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col space-y-1">
              <span :class="getStatusBadgeClass(supplier.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ formatStatus(supplier.status) }}
              </span>
              <span :class="getTypeBadgeClass(supplier.type)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                {{ formatType(supplier.type) }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(supplier.credit_limit || 0) }}
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ขาย</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การติดต่อ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วงเงินเครดิต</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="suppliers.length === 0">
              <td colspan="7" class="px-6 py-20 text-center">
                <div class="flex flex-col items-center">
                  <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">ยังไม่มีข้อมูลผู้ขาย</p>
                  <button @click="openCreateForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i class="fas fa-plus mr-2"></i>
                    เพิ่มผู้ขายแรก
                  </button>
                </div>
              </td>
            </tr>
            <tr 
              v-for="supplier in filteredSuppliers" 
              :key="supplier.id"
              :class="[
                'cursor-pointer transition-colors',
                supplier.status === 'deleted' 
                  ? 'bg-red-50 hover:bg-red-100' 
                  : 'hover:bg-gray-50'
              ]"
              @click="viewSupplierDetail(supplier.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ supplier.name }}</div>
                    <div class="text-sm text-gray-500">{{ supplier.supplier_code }}</div>
                    <div class="text-xs text-gray-400" v-if="supplier.contact_person">
                      <i class="fas fa-user mr-1"></i>{{ supplier.contact_person }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeBadgeClass(supplier.type)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                  {{ formatType(supplier.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(supplier.status)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                  {{ formatStatus(supplier.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div v-if="supplier.phone" class="flex items-center">
                    <i class="fas fa-phone mr-2 text-gray-400"></i>
                    {{ supplier.phone }}
                  </div>
                  <div v-if="supplier.email" class="flex items-center">
                    <i class="fas fa-envelope mr-2 text-gray-400"></i>
                    {{ supplier.email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ formatCurrency(supplier.credit_limit || 0) }}</div>
                  <div class="text-xs text-gray-500" v-if="supplier.payment_terms">
                    {{ formatPaymentTerms(supplier.payment_terms) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(supplier.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click.stop="editSupplier(supplier.id)"
                    class="text-blue-600 hover:text-blue-900"
                    :title="`แก้ไข ${supplier.name}`"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="supplier.status === 'pending'"
                    @click.stop="approveSupplier(supplier.id)"
                    class="text-green-600 hover:text-green-900"
                    :title="`อนุมัติ ${supplier.name}`"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="supplier.status !== 'deleted'"
                    @click.stop="deleteSupplier(supplier.id)"
                    class="text-red-600 hover:text-red-900"
                    :title="`ลบ ${supplier.name} (Soft Delete)`"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button 
                    v-if="supplier.status === 'deleted'"
                    @click.stop="restoreSupplier(supplier.id)"
                    class="text-blue-600 hover:text-blue-900"
                    :title="`กู้คืน ${supplier.name}`"
                  >
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- End of Main Content -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT SUPPLIER MANAGER - Supplier Management
 * ใช้ Core-Only Access ตาม AI Guidelines
 * - ใช้ getCore() helper function
 * - ไม่มี direct business logic  
 * - จัดการ CRUD ผ่าน ERP_CORE.engine
 */
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
// ✅ Dynamic Module Import - ไม่ต้อง hardcode import
// ใช้ window.ERP_CORE.modules.supplier แทน

export default {
  name: 'SupplierManager',
  setup() {
    const router = useRouter()
    const instance = getCurrentInstance()
    
    // ✅ ใช้ PurchaseService แทน engine
    const purchaseService = window.ERP_CORE.purchase
    
    // ✅ Core-Only Access Helper
    const getCore = () => {
      if (typeof window !== 'undefined' && window.ERP_CORE) {
        return window.ERP_CORE
      }
      throw new Error('ERP_CORE not available')
    }

    // ✅ Dynamic Module Access - Auto-load supplier module
    const getSupplierModule = () => {
      const core = getCore()
      return core.modules.supplier || {}
    }

    // 🎯 Dynamic Constants Loading
    const supplier = getSupplierModule()
    const SUPPLIER_TYPES = supplier.SUPPLIER_TYPES || {}
    const SUPPLIER_STATUS = supplier.SUPPLIER_STATUS || {}
    const SUPPLIER_RATING = supplier.SUPPLIER_RATING || {}
    const SUPPLIER_TYPE_LABELS = supplier.SUPPLIER_TYPE_LABELS || {}
    const SUPPLIER_STATUS_LABELS = supplier.SUPPLIER_STATUS_LABELS || {}
    const SUPPLIER_RATING_LABELS = supplier.SUPPLIER_RATING_LABELS || {}
    const PAYMENT_TERMS_LABELS = supplier.PAYMENT_TERMS_LABELS || {}

    // ✅ State
    const suppliers = ref([])
    const loading = ref(false)
    const isDataReady = ref(false) // Track if initial data is loaded
    const isMounted = ref(false) // Track if component is mounted
    
    // ✅ Filters
    const statusFilter = ref('')
    const typeFilter = ref('')
    const ratingFilter = ref('')
    const searchQuery = ref('')
    
    // ✅ UI State
    const viewMode = ref('list') // 'grid' or 'list'
    const dropdownOpen = ref(null)

    // ✅ Labels (ใช้ dynamic constants)
    const supplierTypeLabels = SUPPLIER_TYPE_LABELS
    const supplierStatusLabels = SUPPLIER_STATUS_LABELS
    const supplierRatingLabels = SUPPLIER_RATING_LABELS

    // ✅ Computed Properties
    const stats = computed(() => {
      const total = suppliers.value.length
      const active = suppliers.value.filter(s => s.status === SUPPLIER_STATUS.ACTIVE).length
      const pending = suppliers.value.filter(s => s.status === SUPPLIER_STATUS.PENDING).length
      const excellent = suppliers.value.filter(s => s.rating === SUPPLIER_RATING.EXCELLENT).length
      
      return { total, active, pending, excellent }
    })

    const filteredSuppliers = computed(() => {
      let filtered = suppliers.value

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(s => s.status === statusFilter.value)
      }

      // Filter by type
      if (typeFilter.value) {
        filtered = filtered.filter(s => s.type === typeFilter.value)
      }

      // Filter by rating
      if (ratingFilter.value) {
        filtered = filtered.filter(s => s.rating === ratingFilter.value)
      }

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(s => 
          s.name?.toLowerCase().includes(query) ||
          s.supplier_code?.toLowerCase().includes(query) ||
          s.contact_person?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const hasActiveFilters = computed(() => {
      return statusFilter.value || typeFilter.value || ratingFilter.value || searchQuery.value
    })

    // ✅ UI Methods
    const toggleDropdown = (supplierId) => {
      dropdownOpen.value = dropdownOpen.value === supplierId ? null : supplierId
    }

    const applyFilters = async () => {
      // ✅ เมื่อเปลี่ยน filter status เป็น "deleted" หรือจาก "deleted" ให้ reload ข้อมูล
      const previousFilter = suppliers.value.length > 0 ? 
        (suppliers.value.some(s => s.status === 'deleted') ? 'including_deleted' : 'active_only') : 'active_only'
      const currentFilter = statusFilter.value === 'deleted' ? 'including_deleted' : 'active_only'
      
      if (previousFilter !== currentFilter) {
        console.log('🔄 Filter status changed, reloading suppliers...', { 
          from: previousFilter, 
          to: currentFilter 
        })
        await refreshData()
      }
    }

    const clearFilters = async () => {
      searchQuery.value = ''
      typeFilter.value = ''
      ratingFilter.value = ''
      
      // ✅ ถ้าเคยเลือก "deleted" ให้ reload ข้อมูลใหม่
      const hadDeletedFilter = statusFilter.value === 'deleted'
      statusFilter.value = ''
      
      if (hadDeletedFilter) {
        console.log('🔄 Clearing deleted filter, reloading active suppliers...')
        await refreshData()
      }
    }

    // ✅ Badge Classes
    const getStatusBadgeClass = (status) => {
      const classes = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'suspended': 'bg-red-100 text-red-800',
        'blacklisted': 'bg-red-200 text-red-900',
        'deleted': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getTypeBadgeClass = (type) => {
      const classes = {
        'domestic': 'bg-blue-100 text-blue-800',
        'international': 'bg-green-100 text-green-800',
        'manufacturer': 'bg-purple-100 text-purple-800',
        'distributor': 'bg-orange-100 text-orange-800',
        'service': 'bg-pink-100 text-pink-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    // ✅ Data Loading
    const refreshData = async () => {
      // ป้องกันการโหลดถ้า component ไม่ได้ mount แล้ว
      if (!isMounted.value) {
        console.log('[Supplier List] ⚠️ Skipping refreshData - component not mounted')
        return
      }
      
      try {
        loading.value = true
        isDataReady.value = false
        
        // ✅ เลือกใช้ service method ตาม filter
        let suppliersData
        if (statusFilter.value === 'deleted') {
          // ถ้า filter เป็น "deleted" ให้ดึงข้อมูลทั้งหมด รวมที่ถูก soft delete
          suppliersData = await purchaseService.getAllSuppliersIncludingDeleted()
          console.log('🗑️ [Supplier List] Suppliers including deleted loaded:', suppliersData.length)
        } else {
          // ปกติดึงเฉพาะผู้ขายที่ยังไม่ถูก delete
          suppliersData = await purchaseService.getAllSuppliers()
          console.log('✅ [Supplier List] Active suppliers loaded:', suppliersData.length)
        }
        
        // เช็คอีกครั้งก่อน update state
        if (!isMounted.value) {
          console.log('[Supplier List] ⚠️ Component unmounted during load')
          return
        }
        
        suppliers.value = suppliersData || []
        console.log('[Supplier Manager] Loaded suppliers:', suppliers.value.length)
        
        // Mark data as ready
        isDataReady.value = true
        
      } catch (error) {
        console.error('[Supplier Manager] Failed to load:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูลผู้ขายได้')
        }
        // Still mark as ready to show empty state
        if (isMounted.value) {
          isDataReady.value = true
        }
      } finally {
        if (isMounted.value) {
          loading.value = false
        }
      }
    }

    // ✅ Navigation Functions
    const openCreateForm = () => {
      router.push('/purchase/suppliers/new')
    }

    const editSupplier = (id) => {
      router.push({ 
        name: 'purchase-supplier-edit', 
        params: { id } 
      })
    }

    const viewSupplierDetail = (id) => {
      router.push({
        name: 'purchase-supplier-detail',
        params: { id }
      })
    }

    // ✅ Actions
    const approveSupplier = async (id) => {
      if (!confirm('ต้องการอนุมัติผู้ขายนี้หรือไม่?')) return

      try {
        // ✅ ใช้ PurchaseService แทน engine
        await purchaseService.updateSupplier(id, {
          status: SUPPLIER_STATUS.ACTIVE,
          approved_at: new Date(),
          updated_at: new Date()
        })

        console.log('[Supplier Manager] Supplier approved:', id)
        if (window.$toast) {
          window.$toast.success('อนุมัติผู้ขายเรียบร้อยแล้ว')
        }
        refreshData()
      } catch (error) {
        console.error('[Supplier Manager] Approve error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถอนุมัติผู้ขายได้: ' + error.message)
        }
      }
    }

    const deleteSupplier = async (id) => {
      // หาข้อมูลผู้ขายเพื่อแสดงชื่อใน confirmation
      const supplier = suppliers.value.find(s => s.id === id)
      const supplierName = supplier ? supplier.name || supplier.supplier_code : 'ผู้ขายนี้'
      
      let confirmMessage = `ต้องการลบ ${supplierName} หรือไม่?\n\n🔒 หมายเหตุ: นี่เป็นการ "ลบชั่วคราว" ข้อมูลจะยังคงอยู่ในระบบและสามารถกู้คืนได้`
      
      if (supplier?.status === 'active') {
        confirmMessage = `⚠️ ผู้ขาย "${supplierName}" ยังใช้งานอยู่!\n\nการลบผู้ขายที่ใช้งานอยู่อาจส่งผลต่อข้อมูลการสั่งซื้อและประวัติการทำธุรกรรม\n\n🔒 หมายเหตุ: นี่เป็นการ "ลบชั่วคราว" ข้อมูลยังคงอยู่ในระบบและสามารถกู้คืนได้\n\nคุณแน่ใจหรือไม่ที่จะลบผู้ขายนี้?`
      }
      
      if (!confirm(confirmMessage)) return

      try {
        // ✅ ใช้ PurchaseService แทน engine
        await purchaseService.deleteSupplier(id)
        
        console.log('[Supplier Manager] Supplier soft deleted:', id)
        if (window.$toast) {
          window.$toast.success(`ลบ ${supplierName} เรียบร้อยแล้ว`)
        }
        refreshData()
      } catch (error) {
        console.error('[Supplier Manager] Delete error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถลบผู้ขายได้: ' + error.message)
        }
      }
    }

    // ✅ Restore Supplier Method (กู้คืนผู้ขายที่ถูก soft delete)
    const restoreSupplier = async (id) => {
      const supplier = suppliers.value.find(s => s.id === id)
      const supplierName = supplier ? supplier.name || supplier.supplier_code : 'ผู้ขายนี้'
      const confirmMessage = `ต้องการกู้คืน ${supplierName} หรือไม่?`
      
      if (!confirm(confirmMessage)) return
      
      try {
        console.log('♻️ Restoring supplier:', supplierName, 'ID:', id)
        
        // ✅ ใช้ PurchaseService กู้คืนผู้ขาย (เปลี่ยนสถานะเป็น inactive)
        await purchaseService.restoreSupplier(id, 'inactive')
        
        if (window.$toast) {
          window.$toast.success(`กู้คืน ${supplierName} เรียบร้อยแล้ว`)
        } else {
          alert('กู้คืนผู้ขายเรียบร้อยแล้ว')
        }
        
        refreshData()
      } catch (error) {
        console.error('❌ Error restoring supplier:', error)
        
        const errorMessage = `เกิดข้อผิดพลาดในการกู้คืนผู้ขาย: ${error.message || 'ไม่ทราบสาเหตุ'}`
        
        if (window.$toast) {
          window.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    }

    // ✅ Test Data Functions
    const testCreateSupplier = async () => {
      const sampleData = {
        supplier_code: `DOM${Date.now().toString().slice(-5)}`,
        name: 'บริษัท ผู้ขายทดสอบ จำกัด',
        type: SUPPLIER_TYPES.DOMESTIC,
        status: SUPPLIER_STATUS.ACTIVE,
        contact_person: 'คุณทดสอบ ผู้ขาย',
        phone: '02-123-4567',
        email: 'test@supplier.com',
        address: '123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ',
        province: 'กรุงเทพมหานคร',
        postal_code: '10100',
        country: 'ไทย',
        tax_id: '1234567890123',
        payment_terms: 'net_30',
        currency: 'THB',
        credit_limit: 100000,
        credit_days: 30,
        discount_percentage: 5,
        lead_time_days: 7,
        rating: SUPPLIER_RATING.GOOD,
        is_active: true,
        requires_po: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      try {
        // ✅ ใช้ PurchaseService แทน engine
        await purchaseService.createSupplier(sampleData)
        
        console.log('[Supplier Manager] Test supplier created')
        if (window.$toast) {
          window.$toast.success('สร้างผู้ขายทดสอบเรียบร้อยแล้ว')
        }
        refreshData()
      } catch (error) {
        console.error('[Supplier Manager] Create test supplier error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้างผู้ขายทดสอบได้: ' + error.message)
        }
      }
    }

    const testCreateInternationalSupplier = async () => {
      const sampleData = {
        supplier_code: `INT${Date.now().toString().slice(-5)}`,
        name: 'ABC International Trading Co.',
        type: SUPPLIER_TYPES.INTERNATIONAL,
        status: SUPPLIER_STATUS.PENDING,
        contact_person: 'Mr. John Smith',
        phone: '+1-555-123-4567',
        email: 'john@abctrading.com',
        address: '123 Main Street, Business District',
        province: 'California',
        postal_code: '90210',
        country: 'United States',
        payment_terms: 'net_45',
        currency: 'USD',
        credit_limit: 500000,
        credit_days: 45,
        discount_percentage: 3,
        lead_time_days: 30,
        rating: SUPPLIER_RATING.UNRATED,
        is_active: true,
        requires_po: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      try {
        // ✅ ใช้ PurchaseService แทน engine
        await purchaseService.createSupplier(sampleData)
        
        console.log('[Supplier Manager] Test international supplier created')
        if (window.$toast) {
          window.$toast.success('สร้างผู้ขายต่างประเทศทดสอบเรียบร้อยแล้ว')
        }
        refreshData()
      } catch (error) {
        console.error('[Supplier Manager] Create international supplier error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้างผู้ขายต่างประเทศได้: ' + error.message)
        }
      }
    }

    // ✅ Formatters
    const formatStatus = (status) => {
      return SUPPLIER_STATUS_LABELS[status] || status
    }

    const formatType = (type) => {
      return SUPPLIER_TYPE_LABELS[type] || type
    }

    const formatRating = (rating) => {
      return SUPPLIER_RATING_LABELS[rating] || rating
    }

    const formatPaymentTerms = (terms) => {
      return PAYMENT_TERMS_LABELS[terms] || terms
    }

    const formatCurrency = (amount, currency = 'THB') => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // ✅ Lifecycle
    onMounted(async () => {
      console.log('[Supplier List] 🚀 Component mounted')
      isMounted.value = true
      
      try {
        // Debug: ตรวจสอบว่า instance มีอะไรบ้าง
        console.log('[Supplier List] Instance keys:', Object.keys(instance || {}))
        console.log('[Supplier List] Has $Request:', !!instance?.$Request)
        console.log('[Supplier List] Has $Key:', !!instance?.$Key)
        console.log('[Supplier List] Has proxy:', !!instance?.proxy)
        console.log('[Supplier List] Has appContext:', !!instance?.appContext)
        
        // ✅ ใช้ proxy แทน instance โดยตรง
        const componentProxy = instance?.proxy || instance
        console.log('[Supplier List] Proxy keys:', Object.keys(componentProxy || {}))
        console.log('[Supplier List] Proxy.$Request:', !!componentProxy?.$Request)
        console.log('[Supplier List] Proxy.$Key:', componentProxy?.$Key)  // ดูค่าจริงของ $Key
        console.log('[Supplier List] Proxy.$Key type:', typeof componentProxy?.$Key)
        
        // ✅ Initialize PurchaseService with component proxy
        purchaseService.initialize(componentProxy)
        
        // Load data
        await refreshData()
      } catch (error) {
        console.error('[Supplier List] ❌ Error in onMounted:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการเริ่มต้น: ' + error.message)
        }
      }
    })
    
    // ✅ Cleanup on unmount
    onBeforeUnmount(() => {
      console.log('[Supplier List] 🔻 Component unmounting...')
      isMounted.value = false
      isDataReady.value = false
    })

    return {
      // Data
      suppliers,
      loading,
      isDataReady,
      isMounted,
      
      // Filters
      statusFilter,
      typeFilter, 
      ratingFilter,
      searchQuery,
      
      // UI State
      viewMode,
      dropdownOpen,
      
      // Labels
      supplierTypeLabels,
      supplierStatusLabels,
      supplierRatingLabels,
      
      // Computed
      stats,
      filteredSuppliers,
      hasActiveFilters,
      
      // UI Methods
      toggleDropdown,
      applyFilters,
      clearFilters,
      
      // Badge Methods
      getStatusBadgeClass,
      getTypeBadgeClass,
      
      // Methods
      refreshData,
      openCreateForm,
      editSupplier,
      viewSupplierDetail,
      approveSupplier,
      deleteSupplier,
      restoreSupplier,
      testCreateSupplier,
      testCreateInternationalSupplier,
      
      // Formatters
      formatStatus,
      formatType,
      formatRating,
      formatPaymentTerms,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.supplier-manager {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header-content {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #4299e1;
  font-size: 24px;
}

.subtitle {
  color: #718096;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

.filters-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filters-container {
  padding: 20px 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.search-group {
  position: relative;
  margin-left: auto;
}

.search-input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.test-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table th {
  background: #f7fafc;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.suppliers-table td {
  padding: 15px;
  border-bottom: 1px solid #f7fafc;
  vertical-align: top;
}

.supplier-code {
  font-family: monospace;
  font-weight: 600;
  color: #2d3748;
}

.supplier-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.supplier-name {
  font-weight: 500;
  color: #2d3748;
}

.supplier-contact {
  font-size: 12px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

.contact-info div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.credit-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.credit-terms {
  font-size: 11px;
  color: #718096;
}

.date-info {
  font-size: 12px;
  color: #718096;
}

.type-badge,
.status-badge,
.rating-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active { background: #c6f6d5; color: #22543d; }
.status-inactive { background: #e2e8f0; color: #4a5568; }
.status-pending { background: #fef5e7; color: #c05621; }
.status-suspended { background: #fed7d7; color: #c53030; }
.status-blocked { background: #fed7d7; color: #c53030; }
.status-blacklisted { background: #2d3748; color: white; }

.type-domestic { background: #bee3f8; color: #2a69ac; }
.type-international { background: #c6f6d5; color: #22543d; }
.type-manufacturer { background: #e9d8fd; color: #553c9a; }
.type-distributor { background: #fef5e7; color: #c05621; }
.type-service { background: #fed7e2; color: #b83280; }
.type-individual { background: #f7fafc; color: #4a5568; }

.rating-excellent { background: #c6f6d5; color: #22543d; }
.rating-good { background: #bee3f8; color: #2a69ac; }
.rating-average { background: #fef5e7; color: #c05621; }
.rating-poor { background: #fed7d7; color: #c53030; }
.rating-unrated { background: #e2e8f0; color: #4a5568; }

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-icon {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.btn-icon.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-icon.btn-outline {
  background: white;
  color: #4a5568;
  border: 1px solid #d1d5db;
}

.btn-icon.btn-success {
  background: #48bb78;
  color: white;
}

.btn-icon.btn-danger {
  background: #f56565;
  color: white;
}

.btn-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-outline {
  background: white;
  color: #4a5568;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f7fafc;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #718096;
}

.no-data-content i {
  font-size: 48px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .supplier-manager {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-group {
    margin-left: 0;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>