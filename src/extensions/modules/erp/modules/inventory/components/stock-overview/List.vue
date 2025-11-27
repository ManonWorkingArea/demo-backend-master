<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
            <p class="mt-2 text-gray-600">ภาพรวมสต็อกสินค้า การเคลื่อนไหว และการจัดการคลัง</p>
          </div>
          <div class="flex gap-3">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
              รีเฟรช
            </button>
            
            <router-link 
              to="/inventory/products"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-boxes mr-2"></i>
              จัดการสินค้า
            </router-link>
            
            <router-link 
              to="/inventory/goods-receipt"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center relative"
            >
              <i class="fas fa-truck-loading mr-2"></i>
              รับเข้าสินค้า
              <span v-if="pendingPOCount > 0" class="absolute -top-2 -right-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                {{ pendingPOCount }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <!-- Total Products -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-cubes text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
            </div>
          </div>
        </div>

        <!-- In Stock -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-layer-group text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">จำนวน Lot (ม้วน)</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalLots }}</p>
              <p class="text-xs text-gray-500">เต็ม {{ stats.fullLots }} | ไม่เต็ม {{ stats.partialLots }}</p>
            </div>
          </div>
        </div>

        <!-- Low Stock -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-ruler text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">เมตรคงเหลือรวม</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalMetersRemaining) }}</p>
              <p class="text-xs text-gray-500">เมตร</p>
            </div>
          </div>
        </div>

        <!-- Total Value -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <i class="fas fa-lock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">เมตรที่จอง</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalMetersReserved) }}</p>
              <p class="text-xs text-gray-500">พร้อมใช้ {{ formatNumber(stats.totalMetersAvailable) }} ม.</p>
            </div>
          </div>
        </div>

        <!-- Pending POs -->
        <div class="bg-white rounded-xl shadow-sm p-6 cursor-pointer" @click="$router.push('/inventory/goods-receipt')">
          <div class="flex items-center">
            <div class="bg-orange-100 p-3 rounded-lg">
              <i class="fas fa-truck-loading text-orange-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">PO พร้อมรับเข้า</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingPOCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Balance & Movements -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Inventory Balance -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-boxes mr-2 text-blue-600"></i>
                  สินค้าคงคลัง (Top 10)
                </h3>
                <router-link 
                  to="/inventory/products"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ดูทั้งหมด →
                </router-link>
              </div>
            </div>
            
            <div class="p-6">
              <div v-if="loading" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
              </div>
              
              <div v-else-if="topBalanceItems.length === 0" class="text-center py-8">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">ยังไม่มีข้อมูลสินค้าคงคลัง</p>
              </div>
              
              <div v-else class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">คงเหลือ</th>
                      <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="item in topBalanceItems" :key="item.id" class="hover:bg-gray-50">
                      <td class="px-3 py-3">
                        <div class="flex items-center">
                          <div :class="getProductThumbnailColor(item)" class="w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm mr-3">
                            {{ getProductInitials(item) }}
                          </div>
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ getProductName(item) }}</div>
                            <div class="text-xs text-gray-500">{{ item.product_code }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-3 py-3 text-right">
                        <div :class="getStockLevelClass(item.qty_on_hand, item.min_stock_level)" class="text-sm font-semibold">
                          {{ formatNumber(item.qty_on_hand || 0) }}
                        </div>
                        <div class="text-xs text-gray-500">{{ getProductUnit(item) }}</div>
                      </td>
                      <td class="px-3 py-3 text-center">
                        <span :class="getBalanceStatus(item)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                          {{ getBalanceStatusText(item) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Recent Movements -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-exchange-alt mr-2 text-purple-600"></i>
                การเคลื่อนไหวล่าสุด
              </h3>
            </div>
            
            <div class="p-6">
              <div v-if="recentMovements.length === 0" class="text-center py-8">
                <i class="fas fa-exchange-alt text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">ยังไม่มีการเคลื่อนไหวสินค้า</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="movement in recentMovements" 
                  :key="movement.id"
                  class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div :class="getMovementIconClass(movement.movement_type)" class="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                    <i :class="getMovementIcon(movement.movement_type)" class="text-white"></i>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">{{ getMovementTypeText(movement.movement_type) }}</div>
                    <div class="text-xs text-gray-500">{{ movement.product_name || 'N/A' }}</div>
                  </div>
                  <div class="text-right">
                    <div :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-semibold">
                      {{ movement.quantity > 0 ? '+' : '' }}{{ formatNumber(movement.quantity) }}
                    </div>
                    <div class="text-xs text-gray-500">{{ formatDateTime(movement.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Sidebar -->
        <div class="space-y-8">
          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <router-link 
                to="/inventory/products/add"
                class="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div class="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg">
                  <i class="fas fa-plus text-blue-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900 text-sm">เพิ่มสินค้าใหม่</p>
                </div>
              </router-link>
              
              <router-link 
                to="/inventory/goods-receipt"
                class="w-full flex items-center p-3 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div class="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg">
                  <i class="fas fa-truck-loading text-green-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900 text-sm">รับเข้าสินค้า</p>
                </div>
              </router-link>
              
              <router-link 
                to="/inventory/stock-locations"
                class="w-full flex items-center p-3 hover:bg-purple-50 rounded-lg transition-colors group"
              >
                <div class="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg">
                  <i class="fas fa-map-marker-alt text-purple-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900 text-sm">จัดการตำแหน่งเก็บ</p>
                </div>
              </router-link>
            </div>
          </div>

          <!-- System Info -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-3">ข้อมูลระบบ</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Products:</span>
                <span class="font-semibold">{{ products.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Locations:</span>
                <span class="font-semibold">{{ stockLocations.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Total Lots:</span>
                <span class="font-semibold">{{ lotTrackingData.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Balance Records:</span>
                <span class="font-semibold">{{ balanceData.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Recent Movements:</span>
                <span class="font-semibold">{{ stockMovements.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, getCurrentInstance } from 'vue'

export default {
  name: 'InventoryDashboard',
  inject: ['apiRequest'],
  setup() {
    const apiRequest = inject('apiRequest')
    const instance = getCurrentInstance()
    const componentProxy = instance?.proxy || instance
    
    // Services
    const inventoryService = window.ERP_CORE.inventory
    const purchaseService = window.ERP_CORE.purchase
    
    // Initialize services
    if (inventoryService && !inventoryService.isReady()) {
      inventoryService.initialize(componentProxy)
    }
    if (purchaseService && !purchaseService.isReady()) {
      purchaseService.initialize(componentProxy)
    }
    
    // ===== STATE =====
    const products = ref([])
    const balanceData = ref([])
    const stockLocations = ref([])
    const stockMovements = ref([])
    const approvedPurchaseOrders = ref([])
    const lotTrackingData = ref([]) // ข้อมูล Lot Tracking ทั้งหมด
    const loading = ref(false)
    
    // ===== COMPUTED =====
    const stats = computed(() => {
      const balanceArray = Array.isArray(balanceData.value) ? balanceData.value : []
      const lots = Array.isArray(lotTrackingData.value) ? lotTrackingData.value : []
      
      // คำนวนจาก Lot Tracking
      const totalLots = lots.length
      const fullLots = lots.filter(lot => {
        const remaining = lot.remaining_meters || lot.initial_meters || 0
        const initial = lot.initial_meters || 0
        return initial > 0 && remaining >= initial * 0.95 // ถือว่าเต็มถ้าเหลือ >= 95%
      }).length
      
      const partialLots = totalLots - fullLots
      
      const totalMetersRemaining = lots.reduce((sum, lot) => {
        return sum + (Number(lot.remaining_meters) || Number(lot.initial_meters) || 0)
      }, 0)
      
      const totalMetersReserved = lots.reduce((sum, lot) => {
        return sum + (Number(lot.total_reserved) || 0)
      }, 0)
      
      const totalMetersAvailable = lots.reduce((sum, lot) => {
        return sum + (Number(lot.available_meters) || 0)
      }, 0)
      
      return {
        totalProducts: products.value.length,
        inStock: balanceArray.filter(b => (b.qty_on_hand || 0) > 0).length,
        lowStock: balanceArray.filter(b => 
          (b.qty_on_hand || 0) > 0 && 
          (b.qty_on_hand || 0) <= (b.min_stock_level || 5)
        ).length,
        totalValue: balanceArray.reduce((sum, b) => sum + (Number(b.total_cost_value) || 0), 0),
        // Lot-based stats
        totalLots,
        fullLots,
        partialLots,
        totalMetersRemaining,
        totalMetersReserved,
        totalMetersAvailable
      }
    })
    
    const topBalanceItems = computed(() => {
      return balanceData.value
        .filter(b => (b.qty_on_hand || 0) > 0)
        .sort((a, b) => (b.total_cost_value || 0) - (a.total_cost_value || 0))
        .slice(0, 10)
    })
    
    const recentMovements = computed(() => {
      return [...stockMovements.value]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    })
    
    const pendingPOCount = computed(() => {
      return approvedPurchaseOrders.value.filter(po => 
        po && po.status === 'approved' && po.workflow_state === 'approved'
      ).length
    })
    
    // ===== LOAD DATA =====
    const loadProducts = async () => {
      try {
        const productArray = await inventoryService.getAllProducts()
        products.value = productArray.filter(p => p && (p.sku || p.product_code))
        console.log('✅ Products loaded:', products.value.length)
      } catch (error) {
        console.error('❌ Error loading products:', error)
        products.value = []
      }
    }
    
    const loadBalance = async () => {
      try {
        const clientKey = window.ERP_CORE?.clientKey || componentProxy.$Key
        const result = await apiRequest.POST('inventory_balance/aggregate', {
          pipeline: [{ $match: {} }]
        }, clientKey)
        
        if (result?.data && Array.isArray(result.data)) {
          const seenCodes = new Set()
          balanceData.value = result.data
            .filter(b => b && b.product_code && typeof b.qty_on_hand === 'number')
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .filter(b => {
              if (seenCodes.has(b.product_code)) return false
              seenCodes.add(b.product_code)
              return true
            })
          
          console.log('✅ Balance loaded:', balanceData.value.length)
        } else {
          balanceData.value = []
        }
      } catch (error) {
        console.error('❌ Error loading balance:', error)
        balanceData.value = []
      }
    }
    
    const loadStockLocations = async () => {
      try {
        const locations = await inventoryService.getAllStockLocations()
        stockLocations.value = locations.filter(l => l && l.status !== 'deleted')
        console.log('✅ Locations loaded:', stockLocations.value.length)
      } catch (error) {
        console.error('❌ Error loading locations:', error)
        stockLocations.value = []
      }
    }
    
    const loadMovements = async () => {
      try {
        const clientKey = window.ERP_CORE?.clientKey || componentProxy.$Key
        const result = await apiRequest.POST('stock_movement/aggregate', {
          pipeline: [
            { $match: {} },
            { $sort: { created_at: -1 } },
            { $limit: 50 }
          ]
        }, clientKey)
        
        if (result?.data && Array.isArray(result.data)) {
          stockMovements.value = result.data.filter(m => m && m.id)
          console.log('✅ Movements loaded:', stockMovements.value.length)
        } else {
          stockMovements.value = []
        }
      } catch (error) {
        console.error('❌ Error loading movements:', error)
        stockMovements.value = []
      }
    }
    
    const loadPurchaseOrders = async () => {
      try {
        const allPOs = await purchaseService.getAllPurchaseOrders()
        approvedPurchaseOrders.value = allPOs.filter(po => 
          po && po.status === 'approved' && po.workflow_state === 'approved'
        )
        console.log('✅ POs loaded:', approvedPurchaseOrders.value.length)
      } catch (error) {
        console.error('❌ Error loading POs:', error)
        approvedPurchaseOrders.value = []
      }
    }
    
    const loadLotTracking = async () => {
      try {
        const clientKey = window.ERP_CORE?.clientKey || componentProxy.$Key
        const result = await apiRequest.POST('lot_tracking/aggregate', {
          pipeline: [
            { $match: { status: { $ne: 'deleted' } } },
            { 
              $lookup: {
                from: 'lot_reservations',
                localField: '_id',
                foreignField: 'lot_id',
                as: 'reservations'
              }
            },
            {
              $addFields: {
                total_reserved: { $sum: '$reservations.reserved_meters' },
                available_meters: { 
                  $subtract: [
                    { $ifNull: ['$remaining_meters', '$initial_meters'] },
                    { $sum: '$reservations.reserved_meters' }
                  ]
                }
              }
            }
          ]
        }, clientKey)
        
        if (result?.data && Array.isArray(result.data)) {
          lotTrackingData.value = result.data.filter(lot => lot && lot._id)
          console.log('✅ Lot Tracking loaded:', lotTrackingData.value.length, 'lots')
        } else {
          lotTrackingData.value = []
        }
      } catch (error) {
        console.error('❌ Error loading lot tracking:', error)
        lotTrackingData.value = []
      }
    }
    
    const refreshData = async () => {
      if (loading.value) return
      
      loading.value = true
      try {
        await Promise.all([
          loadProducts(),
          loadBalance(),
          loadStockLocations(),
          loadMovements(),
          loadPurchaseOrders(),
          loadLotTracking()
        ])
      } finally {
        loading.value = false
      }
    }
    
    // ===== HELPERS =====
    const getProductName = (balance) => {
      const product = products.value.find(p => 
        p.id === balance.product_id || 
        p.sku === balance.product_code ||
        p.product_code === balance.product_code
      )
      return product?.product_name || balance.product_code || 'ไม่ระบุ'
    }
    
    const getProductUnit = (balance) => {
      const product = products.value.find(p => 
        p.id === balance.product_id || 
        p.sku === balance.product_code ||
        p.product_code === balance.product_code
      )
      return product?.unit || 'ชิ้น'
    }
    
    const getStockLevelClass = (qty, minStock) => {
      if (!qty || qty <= 0) return 'text-red-600'
      if (qty <= minStock) return 'text-yellow-600'
      return 'text-green-600'
    }
    
    const getBalanceStatus = (balance) => {
      const qty = balance.qty_on_hand || 0
      const minStock = balance.min_stock_level || 0
      
      if (qty <= 0) return 'bg-red-100 text-red-800'
      if (qty <= minStock) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }
    
    const getBalanceStatusText = (balance) => {
      const qty = balance.qty_on_hand || 0
      const minStock = balance.min_stock_level || 0
      
      if (qty <= 0) return 'หมดสต็อก'
      if (qty <= minStock) return 'สต็อกต่ำ'
      return 'พร้อมใช้งาน'
    }
    
    const getProductThumbnailColor = (balance) => {
      const name = getProductName(balance)
      const firstChar = name.charAt(0).toUpperCase()
      
      const colors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-purple-100 text-purple-600',
        'bg-yellow-100 text-yellow-600',
        'bg-red-100 text-red-600',
        'bg-indigo-100 text-indigo-600'
      ]
      
      return colors[firstChar.charCodeAt(0) % colors.length]
    }
    
    const getProductInitials = (balance) => {
      const name = getProductName(balance)
      const words = name.split(' ')
      
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    
    const getMovementIcon = (type) => {
      const icons = {
        'receipt': 'fas fa-arrow-down',
        'issue': 'fas fa-arrow-up',
        'transfer': 'fas fa-exchange-alt',
        'adjustment': 'fas fa-edit'
      }
      return icons[type] || 'fas fa-question'
    }
    
    const getMovementIconClass = (type) => {
      const classes = {
        'receipt': 'bg-green-500',
        'issue': 'bg-red-500',
        'transfer': 'bg-blue-500',
        'adjustment': 'bg-yellow-500'
      }
      return classes[type] || 'bg-gray-500'
    }
    
    const getMovementTypeText = (type) => {
      const types = {
        'receipt': 'รับเข้า',
        'issue': 'เบิกออก',
        'transfer': 'โอนย้าย',
        'adjustment': 'ปรับปรุง'
      }
      return types[type] || type
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // ===== LIFECYCLE =====
    onMounted(async () => {
      console.log('🚀 Mounting Dashboard...')
      loading.value = true
      
      await Promise.all([
        loadProducts(),
        loadBalance(),
        loadStockLocations(),
        loadMovements(),
        loadPurchaseOrders(),
        loadLotTracking()
      ])
      
      loading.value = false
      
      console.log('✅ Dashboard ready:', {
        products: products.value.length,
        balance: balanceData.value.length,
        locations: stockLocations.value.length,
        movements: stockMovements.value.length,
        pendingPOs: pendingPOCount.value,
        lots: lotTrackingData.value.length
      })
    })
    
    return {
      // State
      products,
      balanceData,
      stockLocations,
      stockMovements,
      lotTrackingData,
      loading,
      
      // Computed
      stats,
      topBalanceItems,
      recentMovements,
      pendingPOCount,
      
      // Methods
      refreshData,
      getProductName,
      getProductUnit,
      getStockLevelClass,
      getBalanceStatus,
      getBalanceStatusText,
      getProductThumbnailColor,
      getProductInitials,
      getMovementIcon,
      getMovementIconClass,
      getMovementTypeText,
      formatCurrency,
      formatNumber,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
