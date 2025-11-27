<template>
  <div class="min-h-screen bg-gray-50" :key="'inventory-root-' + renderKey">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p class="mt-2 text-gray-600">จัดการสต็อกสินค้า การเข้า-ออก และการปรับปรุงสต็อก</p>
          </div>
          <div class="flex space-x-3 flex-wrap">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
              รีเฟรช
            </button>
            
            <button 
              @click="$router.push('/inventory/goods-receipt')"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center relative"
            >
              <i class="fas fa-truck-loading mr-2"></i>
              รับเข้าสินค้า
              <!-- Badge showing pending PO count -->
              <span v-if="pendingPOCount > 0" class="ml-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                {{ pendingPOCount }}
              </span>
            </button>
            
            <button 
              @click="$router.push('/inventory/add-product')"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มสินค้าใหม่
            </button>
            
            <!-- Debug/Admin Actions - Dropdown -->
            <div class="relative inline-block text-left">
              <button 
                @click="showAdminMenu = !showAdminMenu"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-cog mr-2"></i>
                Admin Tools
                <i class="fas fa-chevron-down ml-2"></i>
              </button>
              
              <div v-if="showAdminMenu" class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                  <button @click="debugAllData; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-bug mr-2"></i>Debug All
                  </button>
                  <button @click="debugStockLocations; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-map-marker-alt mr-2"></i>Debug Locations
                  </button>
                  <button @click="showProductMasters; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-list mr-2"></i>Product Masters
                  </button>
                  <hr class="my-1">
                  <button @click="migrateProductMastersFromInventory; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                    <i class="fas fa-database mr-2"></i>Migrate Data
                  </button>
                  <button @click="consolidateDuplicateItems; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                    <i class="fas fa-compress-alt mr-2"></i>รวมข้อมูลซ้ำ
                  </button>
                  <button @click="fixLegacyData; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50">
                    <i class="fas fa-tools mr-2"></i>แก้ไขข้อมูลเก่า
                  </button>
                  <hr class="my-1">
                  <button @click="cleanupSystemLocations; showAdminMenu = false" class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                    <i class="fas fa-trash-alt mr-2"></i>ลบ System Locations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" :key="'stats-' + Date.now()">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <!-- Total Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-cubes text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-blue-500 text-sm font-medium">
              <i class="fas fa-boxes mr-1"></i>Total Products
            </span>
          </div>
        </div>

        <!-- In Stock Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">มีสินค้าในสต็อก</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.inStock }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">
              <i class="fas fa-check mr-1"></i>Available Stock
            </span>
          </div>
        </div>

        <!-- Low Stock Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">สต็อกต่ำ</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.lowStock }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-yellow-500 text-sm font-medium">
              <i class="fas fa-warning mr-1"></i>Needs Restock
            </span>
          </div>
        </div>

        <!-- Total Value Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">มูลค่าสต็อกรวม</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-purple-500 text-sm font-medium">
              <i class="fas fa-chart-line mr-1"></i>Total Inventory Value
            </span>
          </div>
        </div>

        <!-- Pending Purchase Orders Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/inventory/goods-receipt')">
          <div class="flex items-center">
            <div class="bg-orange-100 p-3 rounded-lg">
              <i class="fas fa-truck-loading text-orange-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">PO พร้อมรับเข้า</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingPOCount }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-orange-500 text-sm font-medium">
              <i class="fas fa-clipboard-check mr-1"></i>Ready to Receive
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" :key="'main-content-' + renderKey">
        <!-- Inventory & Movements Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Inventory Panel -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  <i class="fas fa-boxes mr-2 text-blue-600"></i>
                  สินค้าคงคลัง
                </h3>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600">{{ balanceData.length }} รายการ</span>
                  <router-link 
                    to="/inventory/products" 
                    class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    ดูทั้งหมด
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Inventory Content -->
            <div class="">
              <div v-if="balanceData.length === 0" class="text-center py-8 px-4">
                <i class="fas fa-boxes text-4xl text-gray-300 mb-3"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีข้อมูลสินค้าคงคลัง</h3>
                <p class="text-gray-600 mb-4 text-sm">เริ่มต้นด้วยการรับเข้าสินค้าหรือเพิ่มสินค้าใหม่</p>
                <button 
                  @click="$router.push('/inventory/goods-receipt')"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
                >
                  <i class="fas fa-truck-loading mr-2"></i>
                  รับเข้าสินค้า
                </button>
              </div>
              
              <div v-else>
                <!-- Compact Debug info -->
                <div class="mx-4 mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p class="text-xs text-blue-700">
                    <i class="fas fa-info-circle mr-1"></i>
                    แสดง {{ balanceData.filter(b => b && b.product_code).length }} รายการจากทั้งหมด {{ balanceData.length }} records
                  </p>
                </div>
                
                <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">รูป</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">จำนวน</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">สถานะ</th>
                      <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="balance in balanceData" :key="`bal-${balance.id}-${balance.product_code}`" v-show="balance && balance.product_code" class="hover:bg-gray-50">
                      <!-- Product Thumbnail -->
                      <td class="px-3 py-3 whitespace-nowrap">
                        <div class="h-12 w-12 flex-shrink-0">
                          <!-- Option 1: Initials-based thumbnail -->
                          <div class="h-12 w-12 rounded-lg flex items-center justify-center font-medium text-sm" :class="getProductThumbnailColor(balance)">
                            {{ getProductInitials(balance) }}
                          </div>
                          <!-- Option 2: Icon-based thumbnail (uncomment to use) -->
                          <!-- <div class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <i :class="getProductIcon(balance)" class="text-gray-600 text-lg"></i>
                          </div> -->
                        </div>
                      </td>
                      
                      <!-- Product Info (Combined SKU + Name) -->
                      <td class="px-3 py-3">
                        <div class="flex flex-col">
                          <div class="text-sm font-medium text-gray-900 line-clamp-1">
                            {{ getProductName(balance) }}
                          </div>
                          <div class="text-xs text-gray-500 font-mono">
                            {{ balance.product_code }}
                          </div>
                          <div class="flex flex-wrap gap-1 mt-1">
                            <span v-if="balance.total_locations > 1" class="inline-flex px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {{ balance.total_locations }} ที่
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <!-- Quantity (Combined On Hand + Available) -->
                      <td class="px-3 py-3 whitespace-nowrap text-right">
                        <div class="flex flex-col">
                          <div class="text-sm font-semibold" :class="getStockLevelClass(balance.qty_on_hand, balance.min_stock_level)">
                            {{ formatNumber(balance.qty_on_hand || 0) }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ getProductUnit(balance) }}
                          </div>
                          <div v-if="balance.qty_reserved > 0" class="text-xs text-yellow-600">
                            <i class="fas fa-lock mr-1"></i>{{ formatNumber(balance.qty_reserved) }}
                          </div>
                        </div>
                      </td>
                      
                      <!-- Status (Combined Stock Status + Locations) -->
                      <td class="px-3 py-3">
                        <div class="flex flex-col space-y-1">
                          <span :class="getBalanceStatus(balance)" class="inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit">
                            {{ getBalanceStatusText(balance) }}
                          </span>
                          <div v-if="balance.location_summary && balance.location_summary.length > 0" class="text-xs text-gray-600">
                            <i class="fas fa-map-marker-alt text-blue-500 mr-1"></i>
                            <span v-if="balance.location_summary.length === 1">
                              {{ getLocationName(balance.location_summary[0].location_code) }}
                            </span>
                            <span v-else>
                              {{ balance.location_summary.length }} ตำแหน่ง
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <!-- Actions (Compact) -->
                      <td class="px-3 py-3 whitespace-nowrap text-center">
                        <div class="flex justify-center space-x-1">
                          <button @click="editBalance(balance)" class="text-indigo-600 hover:text-indigo-900 p-1" title="แก้ไข">
                            <i class="fas fa-edit text-sm"></i>
                          </button>
                          <button @click="viewMovements(balance)" class="text-purple-600 hover:text-purple-900 p-1" title="ประวัติ">
                            <i class="fas fa-history text-sm"></i>
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

          <!-- Movements Panel -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  <i class="fas fa-exchange-alt mr-2 text-purple-600"></i>
                  การเคลื่อนไหวสินค้า
                </h3>
                <router-link 
                  to="/inventory/movements" 
                  class="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  ดูทั้งหมด
                </router-link>
              </div>
            </div>

            <!-- Movements Content -->
            <div class="p-6">
              <div v-if="!stockMovements || stockMovements.length === 0" class="text-center py-12">
                <i class="fas fa-exchange-alt text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีการเคลื่อนไหวสินค้า</h3>
                <p class="text-gray-600">การเคลื่อนไหวจะแสดงที่นี่เมื่อมีการรับเข้า-เบิกออกสินค้า</p>
              </div>
              
              <div v-else-if="filteredStockMovements && filteredStockMovements.length > 0" class="space-y-4">
                <div 
                  v-for="movement in filteredStockMovements" 
                  :key="movement.id" 
                  class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div :class="getMovementIconClass(movement?.movement_type)" class="w-10 h-10 rounded-lg flex items-center justify-center">
                          <i :class="getMovementIcon(movement?.movement_type || 'unknown')" class="text-white"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ getMovementTypeText(movement?.movement_type || 'unknown') }}
                        </div>
                        <div class="text-sm text-gray-600">
                          {{ movement?.product_name || movement?.productName || movement?.name || movement?.itemName || 'ไม่ระบุสินค้า' }}
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-semibold" :class="movement?.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ (movement?.quantity > 0 ? '+' : '') }}{{ movement?.quantity || 0 }}
                      </div>
                      <div class="text-xs text-gray-500">{{ formatDateTime(movement?.created_at) }}</div>
                      <div class="text-xs text-gray-500">{{ movement?.created_by || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Info Sidebar -->
        <div class="space-y-8">
          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button 
                @click="$router.push('/inventory/products/add')"
                class="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div class="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg">
                  <i class="fas fa-plus text-blue-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">เพิ่มสินค้าใหม่</p>
                  <p class="text-sm text-gray-500">สร้างรายการสินค้าใหม่</p>
                </div>
              </button>
              
              <button 
                @click="$router.push('/inventory/goods-receipt')"
                class="w-full flex items-center p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div class="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg">
                  <i class="fas fa-truck-loading text-green-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">รับเข้าสินค้า</p>
                  <p class="text-sm text-gray-500">จาก Purchase Order</p>
                </div>
              </button>
              
              <router-link 
                to="/inventory/stock-locations"
                class="w-full flex items-center p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
              >
                <div class="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg">
                  <i class="fas fa-map-marker-alt text-purple-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">จัดการตำแหน่งเก็บ</p>
                  <p class="text-sm text-gray-500">ตั้งค่าตำแหน่งคลัง</p>
                </div>
              </router-link>
              
              <button 
                @click="refreshData"
                class="w-full flex items-center p-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
              >
                <div class="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg">
                  <i class="fas fa-sync text-indigo-600" :class="{ 'fa-spin': loading }"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">รีเฟรชข้อมูล</p>
                  <p class="text-sm text-gray-500">อัปเดตข้อมูลล่าสุด</p>
                </div>
              </button>
            </div>
          </div>

          <!-- System Info -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-2">Inventory Status</h3>
            <div class="space-y-2 text-sm opacity-90">
              <p><i class="fas fa-database mr-2"></i>Records: {{ balanceData.length }}</p>
              <p><i class="fas fa-boxes mr-2"></i>Products: {{ inventory.length }}</p>
              <p><i class="fas fa-clock mr-2"></i>Last Updated: {{ formatDateTime(new Date()) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goods Receipt Modal -->
    <div v-if="showGoodsReceiptModal" class="modal-overlay" @click="showGoodsReceiptModal = false" :key="`goods-receipt-modal-${renderKey}`">
      <div class="modal-content large" @click.stop :key="`modal-content-${selectedPO?.id || 'none'}`">
        <div class="modal-header">
          <h3>
            <i class="fas fa-truck-loading"></i>
            รับเข้าสินค้า (Goods Receipt)
          </h3>
          <button class="close-btn" @click="showGoodsReceiptModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingPurchaseOrders" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>กำลังโหลด Purchase Orders...</p>
          </div>
          
          <div v-else-if="approvedPurchaseOrders.length === 0" class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h4>ไม่มี Purchase Order ที่พร้อมรับเข้า</h4>
            <p>ไม่พบ Purchase Order ที่อนุมัติแล้วและพร้อมสำหรับการรับเข้าสินค้า</p>
          </div>
          
          <div v-else-if="approvedPurchaseOrders && approvedPurchaseOrders.length > 0">
            <div class="purchase-orders-list">
              <h4>เลือก Purchase Order ที่ต้องการรับเข้าสินค้า</h4>
              <div class="po-cards">
                <div 
                  v-for="po in approvedPurchaseOrders" 
                  :key="po.id || po.purchase_order_number || Math.random()"
                  class="po-card"
                  :class="{ selected: selectedPO?.id === po.id }"
                  @click="selectPurchaseOrder(po)"
                >
                  <div class="po-header">
                    <div class="po-number">
                      <strong>{{ po.purchase_order_number || po.id }}</strong>
                    </div>
                    <div class="po-status">
                      <span class="status-badge success">{{ po.status }}</span>
                    </div>
                  </div>
                  <div class="po-info">
                    <div class="info-row">
                      <span class="label">ผู้ขาย:</span>
                      <span class="value">{{ po.vendor_name || 'ไม่ระบุ' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">จำนวนรายการ:</span>
                      <span class="value">{{ po.items?.length || 0 }} รายการ</span>
                    </div>
                    <div class="info-row">
                      <span class="label">มูลค่ารวม:</span>
                      <span class="value">{{ formatCurrency(po.total_amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Receipt Form -->
            <div v-if="selectedPO && receiptForm" class="receipt-form">
              <h4>รายละเอียดการรับเข้าสินค้า</h4>
              
              <div class="form-grid">
                <div class="form-group">
                  <label>วันที่รับเข้า</label>
                  <input 
                    type="date" 
                    v-model="receiptForm.received_date"
                    class="form-control"
                  >
                </div>
                <div class="form-group">
                  <label>ผู้รับเข้า</label>
                  <input 
                    type="text" 
                    v-model="receiptForm.received_by"
                    class="form-control"
                    placeholder="ชื่อผู้รับเข้าสินค้า"
                  >
                </div>
              </div>              <div v-if="receiptForm.items && receiptForm.items.length > 0" class="items-receipt" :key="`receipt-items-${selectedPO?.id || 'none'}`">
                <h5>รายการสินค้าที่รับเข้า</h5>
                <table class="receipt-table">
                  <thead>
                    <tr>
                      <th>สินค้า</th>
                      <th>จำนวนที่สั่ง</th>
                      <th>จำนวนที่รับ</th>
                      <th>ตำแหน่งเก็บ</th>
                      <th>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in receiptForm.items" :key="`receipt-item-${selectedPO?.id || 'none'}-${index}-${item.product_name || item.productName || item.sku || index}`">
                      <td>{{ item.product_name || item.productName || item.name || item.itemName || 'ไม่ระบุ' }}</td>
                      <td class="text-right">{{ formatNumber(item.quantity) }}</td>
                      <td>
                        <input 
                          type="number" 
                          v-model.number="item.received_quantity"
                          :max="item.quantity"
                          min="0"
                          class="form-control small"
                        >
                      </td>
                      <td>
                        <div class="location-display-wrapper">
                          <select 
                            v-model="item.location" 
                            class="form-control small"
                            @change="updateLocationDisplay(item)"
                          >
                            <option value="">เลือกตำแหน่ง</option>
                            <option 
                              v-for="location in validStockLocations" 
                              :key="location.code"
                              :value="location.code"
                            >
                              {{ location.name }}
                            </option>
                            <option v-if="validStockLocations.length === 0" value="" disabled>
                              ไม่มีตำแหน่งเก็บที่ใช้งานได้ - กรุณาสร้างตำแหน่งเก็บก่อน
                            </option>
                          </select>
                          <div v-if="item.location" class="location-name-display">
                            {{ getLocationName(item.location) }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          v-model="item.notes"
                          class="form-control small"
                          placeholder="หมายเหตุ"
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="form-group">
                <label>หมายเหตุการรับเข้า</label>
                <textarea 
                  v-model="receiptForm.receipt_notes"
                  class="form-control"
                  rows="3"
                  placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการรับเข้าสินค้า"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showGoodsReceiptModal = false" class="btn btn-secondary">
            ยกเลิก
          </button>
          <button 
            v-if="selectedPO" 
            @click="processGoodsReceipt" 
            class="btn btn-success"
            :disabled="processingReceipt || !selectedPO || !receiptForm.items?.length"
          >
            <i class="fas fa-check" v-if="!processingReceipt"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ processingReceipt ? 'กำลังดำเนินการ...' : 'รับเข้าสินค้า' }}
          </button>
        </div>
      </div>
    </div>



    <!-- Create Product Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>เพิ่มสินค้าใหม่เข้าสู่ระบบ</h3>
          <button @click="showCreateForm = false; resetProductForm()" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="addNewProduct()" class="product-form">
            <!-- Basic Product Info -->
            <div class="form-section">
              <h4 class="section-title">ข้อมูลพื้นฐานสินค้า</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">รหัสสินค้า (SKU)</label>
                  <input 
                    type="text" 
                    v-model="newProduct.sku" 
                    :class="['form-input', { 'error': productErrors.sku }]"
                    placeholder="ป้อนรหัสสินค้า (A-Z, 0-9, -, _)"
                    :disabled="savingProduct"
                  />
                  <div v-if="productErrors.sku" class="error-message">{{ productErrors.sku }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label required">ชื่อสินค้า</label>
                  <input 
                    type="text" 
                    v-model="newProduct.product_name" 
                    :class="['form-input', { 'error': productErrors.product_name }]"
                    placeholder="ระบุชื่อสินค้า"
                    :disabled="savingProduct"
                  />
                  <div v-if="productErrors.product_name" class="error-message">{{ productErrors.product_name }}</div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">คำอธิบาย</label>
                <textarea 
                  v-model="newProduct.description" 
                  class="form-textarea"
                  rows="2"
                  placeholder="รายละเอียดสินค้า (เลือกได้)"
                  :disabled="savingProduct"
                ></textarea>
              </div>
            </div>
            
            <!-- Unit and Pricing -->
            <div class="form-section">
              <h4 class="section-title">หน่วยและราคา</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">หน่วยนับ</label>
                  <select v-model="newProduct.unit" class="form-select" :disabled="savingProduct">
                    <option>ชิ้น</option>
                    <option>กล่อง</option>
                    <option>แพ็ค</option>
                    <option>ลิตร</option>
                    <option>กิโลกรัม</option>
                    <option>เมตร</option>
                    <option>ม.</option>
                    <option>ตัว</option>
                    <option>อัน</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">ราคาต่อหน่วย (บาท)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    v-model="newProduct.unit_price" 
                    :class="['form-input', { 'error': productErrors.unit_price }]"
                    placeholder="0.00"
                    :disabled="savingProduct"
                  />
                  <div v-if="productErrors.unit_price" class="error-message">{{ productErrors.unit_price }}</div>
                </div>
              </div>
            </div>
            
            <!-- Category and Supplier -->
            <div class="form-section">
              <h4 class="section-title">หมวดหมู่และผู้จำหน่าย</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">หมวดหมู่</label>
                  <select v-model="newProduct.category" class="form-select" :disabled="savingProduct">
                    <option>General</option>
                    <option>Electronics</option>
                    <option>Food & Beverage</option>
                    <option>Clothing</option>
                    <option>Tools & Equipment</option>
                    <option>Materials</option>
                    <option>Office Supplies</option>
                    <option>Medical</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">ผู้จำหน่าย</label>
                  <input 
                    type="text" 
                    v-model="newProduct.supplier" 
                    class="form-input"
                    placeholder="ชื่อผู้จำหน่าย (เลือกได้)"
                    :disabled="savingProduct"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">สต็อกขั้นต่ำ</label>
                <input 
                  type="number" 
                  min="0" 
                  v-model="newProduct.min_stock" 
                  :class="['form-input', { 'error': productErrors.min_stock }]"
                  placeholder="5"
                  :disabled="savingProduct"
                />
                <div v-if="productErrors.min_stock" class="error-message">{{ productErrors.min_stock }}</div>
                <div class="form-help">จำนวนสต็อกขั้นต่ำที่ต้องมีในคลัง</div>
              </div>
            </div>
            
            <!-- Initial Stock -->
            <div class="form-section">
              <h4 class="section-title">สต็อกเริ่มต้น (เลือกได้)</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">จำนวนเริ่มต้น</label>
                  <input 
                    type="number" 
                    min="0" 
                    v-model="newProduct.initial_quantity" 
                    :class="['form-input', { 'error': productErrors.initial_quantity }]"
                    placeholder="0"
                    :disabled="savingProduct"
                  />
                  <div v-if="productErrors.initial_quantity" class="error-message">{{ productErrors.initial_quantity }}</div>
                  <div class="form-help">หากไม่ระบุหรือเป็น 0 จะสร้างเฉพาะ Product Master</div>
                </div>
                
                <div class="form-group" v-if="Number(newProduct.initial_quantity) > 0">
                  <label class="form-label required">ตำแหน่งเก็บ</label>
                  <select 
                    v-model="newProduct.location" 
                    :class="['form-select', { 'error': productErrors.location }]"
                    :disabled="savingProduct"
                  >
                    <option value="">เลือกตำแหน่งเก็บ</option>
                    <option v-for="loc in validStockLocations" :key="loc.code" :value="loc.code">
                      {{ loc.code }} - {{ loc.name }}
                    </option>
                  </select>
                  <div v-if="productErrors.location" class="error-message">{{ productErrors.location }}</div>
                </div>
              </div>
              
              <div v-if="Number(newProduct.initial_quantity) === 0" class="info-box">
                <i class="fas fa-info-circle"></i>
                <span>หากไม่ระบุจำนวนเริ่มต้น ระบบจะสร้างเฉพาะ Product Master โดยยังไม่มี Stock Item ในคลัง</span>
              </div>
              
              <div v-else class="info-box success">
                <i class="fas fa-check-circle"></i>
                <span>
                  จะสร้าง Product Master และ Stock Item จำนวน {{ newProduct.initial_quantity }} {{ newProduct.unit }} 
                  ที่ตำแหน่ง {{ newProduct.location }}
                </span>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            @click="showCreateForm = false; resetProductForm()" 
            class="btn btn-secondary"
            :disabled="savingProduct"
          >
            ยกเลิก
          </button>
          <button 
            @click="addNewProduct()" 
            class="btn btn-primary"
            :disabled="savingProduct"
          >
            <i v-if="savingProduct" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-plus"></i>
            {{ savingProduct ? 'กำลังบันทึก...' : 'เพิ่มสินค้า' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onErrorCaptured, nextTick, watch, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { TRANSACTION_TYPES } from '@/extensions/modules/erp'

export default {
  name: 'InventoryManager',
  setup() {
    // ✅ ใช้ window.ERP_CORE.engine ที่ถูก configure เป็น API driver แล้ว
    if (!window.ERP_CORE || !window.ERP_CORE.engine) {
      console.error('❌ ERP_CORE not initialized!')
      throw new Error('ERP_CORE is not available. Please ensure it is properly initialized.')
    }
    const engine = window.ERP_CORE.engine
    const router = useRouter()
    
    // Error handling for DOM operations
    onErrorCaptured((error, instance, info) => {
      console.error('Component error captured:', error, info)
      
      // Handle specific DOM insertion errors
      if (error.message && (error.message.includes('insertBefore') || error.message.includes('null'))) {
        console.warn('DOM manipulation error detected, attempting recovery')
        
        // Reset critical states
        processingReceipt.value = false
        showGoodsReceiptModal.value = false
        
        // Force component re-render
        nextTick(() => {
          renderKey.value = Date.now() + Math.random()
          
          // Additional safety reset
          setTimeout(() => {
            if (selectedPO.value) {
              selectedPO.value = null
            }
          }, 100)
        })
      }
      
      return false // Don't propagate the error
    })
    
    // Reactive State
    const inventory = ref([])
    const balanceData = ref([]) // เพิ่ม Balance data
    const stockLocations = ref([])
    const renderKey = ref(0)
    const stockMovements = ref([])
    const approvedPurchaseOrders = ref([])
    const loading = ref(false)
    const loadingPurchaseOrders = ref(false)
    const processingReceipt = ref(false)
    
    // UI States
    const showAdminMenu = ref(false)
    
    // Form States
    const showCreateForm = ref(false)
    const showGoodsReceiptModal = ref(false)
    const selectedPO = ref(null)
    
    // Form Data
    const receiptForm = ref({
      received_date: new Date().toISOString().split('T')[0],
      received_by: 'system',
      receipt_notes: '',
      items: []
    })
    
    // Product Form States
    const savingProduct = ref(false)
    const newProduct = ref({
      sku: '',
      product_name: '',
      description: '',
      unit: 'ชิ้น',
      unit_price: 0,
      min_stock: 5,
      category: 'General',
      supplier: '',
      initial_quantity: 0,
      location: ''
    })
    const productErrors = ref({})

    // Computed Stats from Balance data (แทนการใช้ inventory array)
    const stats = computed(() => {
      try {
        // ใช้ Balance data แทน inventory array
        const balanceArray = Array.isArray(balanceData.value) ? balanceData.value : []
        
        console.log('📊 Computing stats from Balance data:', balanceArray.length, 'records')
        
        const result = {
          totalItems: balanceArray.length,
          inStock: balanceArray.filter(balance => 
            balance && typeof balance === 'object' && (balance.qty_on_hand || 0) > 0
          ).length,
          lowStock: balanceArray.filter(balance => 
            balance && typeof balance === 'object' && 
            (balance.qty_on_hand || 0) <= (balance.min_stock_level || 5)
          ).length,
          totalValue: balanceArray.reduce((sum, balance) => {
            if (!balance || typeof balance !== 'object') return sum
            return sum + (Number(balance.total_cost_value) || 0)
          }, 0)
        }
        
        console.log('📊 Computed stats:', result)
        return result
      } catch (error) {
        console.error('Error computing stats from Balance:', error)
        return {
          totalItems: 0,
          inStock: 0,
          lowStock: 0,
          totalValue: 0
        }
      }
    })

    // กรอง stockLocations ที่ถูกต้องเท่านั้น
    const validStockLocations = computed(() => {
      if (!Array.isArray(stockLocations.value)) {
        console.log('❌ stockLocations is not array:', typeof stockLocations.value)
        return []
      }
      
      const filtered = stockLocations.value.filter(location => {
        // ตรวจสอบพื้นฐานเท่านั้น
        if (!location) {
          return false
        }
        
        // ต้องมีข้อมูลระบุตัวตนอย่างน้อย 1 อย่าง
        if (!location.code && !location.name && !location.description) {
          return false
        }
        
        // กรองเฉพาะข้อมูลที่แน่ใจว่าเป็น sample data เท่านั้น
        const code = (location.code || '').toUpperCase()
        const name = (location.name || '').toUpperCase()
        
        const strictSamplePatterns = [
          'SAMPLE', 'TEST', 'DEMO', 'TMP', 'TEMP'
        ]
        
        const isSampleData = strictSamplePatterns.some(pattern => 
          code.includes(pattern) || name.includes(pattern)
        )
        
        if (isSampleData) {
          console.log('🚫 Filtered out sample location:', location.code, location.name)
          return false
        }
        
        console.log('✅ Valid location in InventoryManager:', location.code, location.name)
        
        return true
      }).map((location, index) => ({
        ...location,
        code: location.code || `AUTO-${index + 1}`,
        name: location.name || location.description || `ตำแหน่ง ${index + 1}`,
        status: location.status || 'active'
      }))
      
      return filtered
    })

    // Filtered computed properties for safe rendering  
    const filteredStockLocations = computed(() => {
      return validStockLocations.value
    })

    const filteredStockMovements = computed(() => {
      return (stockMovements.value || []).filter(movement => movement && movement.id)
    })

    // Computed for pending Purchase Orders count
    const pendingPOCount = computed(() => {
      try {
        const approved = approvedPurchaseOrders.value || []
        return approved.filter(po => 
          po && 
          po.status === 'approved' && 
          po.workflow_state === 'approved' &&
          !po.goods_received // ยังไม่ได้รับเข้าสินค้า
        ).length
      } catch (error) {
        console.error('Error computing pending PO count:', error)
        return 0
      }
    })

    // Load inventory data (สำหรับ tab สินค้า - แสดงเฉพาะ Product Masters)
    const loadInventory = async () => {
      loading.value = true
      try {
        console.log('🔄 Loading product data for Inventory tab...')
        
        // โหลดข้อมูล Product Masters เท่านั้น (สำหรับ tab สินค้า)
        console.log('📋 Loading Product Masters from PRODUCT transaction type...')
        const productResult = await engine.list(TRANSACTION_TYPES.PRODUCT)
        
        console.log('🔍 Product result:', productResult)
        
        // Extract data from response objects
        const productData = productResult?.data || []
        const productArray = Array.isArray(productData) ? productData : []
        
        console.log('📦 Product Masters from database:', productArray)
        console.log('📦 Total Product Masters found:', productArray.length)
        
        // ตรวจสอบข้อมูลแต่ละรายการ
        productArray.forEach((item, index) => {
          console.log(`Product ${index + 1}:`, {
            id: item.id,
            type: item.type,
            sku: item.sku,
            product_code: item.product_code,
            product_name: item.product_name,
            category: item.category,
            supplier: item.supplier,
            unit_price: item.unit_price,
            min_stock: item.min_stock,
            status: item.status
          })
        })
        
        // กรองเฉพาะ Product Masters ที่มีข้อมูลครบถ้วน
        const validProducts = productArray.filter(item => {
          if (!item) return false
          
          const hasProductInfo = (
            item.sku || 
            item.product_code ||
            item.product_name
          )
          
          return hasProductInfo
        }).map(item => ({
          ...item,
          displayType: 'product_master',
          // เพิ่มข้อมูลเพื่อการแสดงผล
          quantity: 0, // Product Master ไม่มี quantity โดยตรง
          location: 'N/A', // Product Master ไม่มี location เฉพาะ
          hasStock: false // จะต้องตรวจสอบจาก stock items ต่อไป
        }))
        
        inventory.value = validProducts
        
        console.log(`📋 Valid Product Masters: ${validProducts.length}`)
        console.log('✅ Product data loaded for Inventory tab')
        
        // โหลดข้อมูล Stock Locations แยก
        await loadStockLocations()
        
      } catch (error) {
        console.error('❌ Error loading inventory:', error)
        inventory.value = []
      } finally {
        loading.value = false
      }
    }

    // Load stock locations
    const loadStockLocations = async () => {
      try {
        console.log('📍 Loading stock locations via InventoryService...')
        // ✅ ใช้ InventoryService แทน engine.list
        stockLocations.value = await window.ERP_CORE.inventory.getAllStockLocations()
        console.log('📍 Stock locations loaded:', stockLocations.value.length)
      } catch (error) {
        console.error('❌ Error loading stock locations:', error)
        stockLocations.value = []
      }
    }

    // Load Balance data
    const loadBalance = async () => {
      try {
        console.log('📊 Loading Balance data...')
        const balanceResult = await engine.list(TRANSACTION_TYPES.INVENTORY_BALANCE)
        
        if (balanceResult?.success && balanceResult?.data) {
          // Filter และ clean Balance data เพื่อให้ตรงกับจำนวนจริง
          const rawData = balanceResult.data
          const validBalance = rawData.filter(balance => 
            balance && 
            balance.product_code && 
            balance.product_code.trim() !== '' &&
            typeof balance.qty_on_hand === 'number' // ต้องมี qty_on_hand เป็น number
          )
          
          // Remove duplicates based on product_code (เก็บอันล่าสุด)
          const uniqueBalance = []
          const seenCodes = new Set()
          
          // เรียงข้อมูลตาม created_at ล่าสุดก่อน
          const sortedBalance = [...validBalance].sort((a, b) => {
            const aDate = new Date(a.created_at || 0)
            const bDate = new Date(b.created_at || 0)
            return bDate - aDate // เรียงใหม่ไปเก่า
          })
          
          // เลือกเฉพาะรายการแรก (ล่าสุด) ของแต่ละ product_code
          for (const balance of sortedBalance) {
            if (!seenCodes.has(balance.product_code)) {
              seenCodes.add(balance.product_code)
              uniqueBalance.push(balance)
            }
          }
          
          balanceData.value = uniqueBalance
          console.log('📊 Raw Balance data:', rawData.length)
          console.log('📊 Valid Balance data:', validBalance.length)
          console.log('📊 Unique Balance data loaded:', uniqueBalance.length)
          console.log('📊 Sample Balance records:', uniqueBalance.slice(0, 3).map(b => ({
            product_code: b.product_code,
            qty_on_hand: b.qty_on_hand,
            total_cost_value: b.total_cost_value,
            created_at: b.created_at
          })))
        } else {
          console.warn('⚠️ No Balance data found')
          balanceData.value = []
        }
      } catch (error) {
        console.error('❌ Error loading Balance data:', error)
        balanceData.value = []
      }
    }

    // Load movements data (สำหรับ tab การเคลื่อนไหว - แสดง inventory transactions)
    const loadMovements = async () => {
      try {
        console.log('🔄 Loading inventory movements...')
        
        // โหลดข้อมูล Inventory Transactions (stock_item และ stock_movement)-
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        
        console.log('Inventory result:', inventoryResult)
        
        // Extract data from response objects
        const inventoryData = inventoryResult?.data || []
        const inventoryArray = Array.isArray(inventoryData) ? inventoryData : []
        
        console.log('📦 Inventory transactions from database:', inventoryArray)
        console.log('📦 Total inventory transactions found:', inventoryArray.length)
        
        // แยกเป็น stock movements และ stock items
        const movementsArray = inventoryArray.filter(item => 
          item && item.subtype === 'stock_movement'
        )
        
        const stockItemsArray = inventoryArray.filter(item => 
          item && (item.subtype === 'stock_item' || (!item.subtype && item.sku))
        )
        
        stockMovements.value = movementsArray
        
        console.log(`📊 Stock Movements: ${movementsArray.length}`)
        console.log(`📦 Stock Items: ${stockItemsArray.length}`)
        
      } catch (error) {
        console.error('❌ Error loading movements:', error)
        stockMovements.value = []
      }
    }




    // Load approved purchase orders
    const loadApprovedPurchaseOrders = async () => {
      loadingPurchaseOrders.value = true
      try {
        const purchases = await engine.list(TRANSACTION_TYPES.PURCHASE)
        console.log('Raw purchase orders:', purchases)
        
        // Extract data from response object
        const purchasesData = purchases?.data || []
        const purchasesArray = Array.isArray(purchasesData) ? purchasesData : []
        approvedPurchaseOrders.value = purchasesArray.filter(p => 
          p.status === 'approved' && 
          p.workflow_state === 'approved'
        )
        
        console.log('Approved purchase orders:', approvedPurchaseOrders.value)
      } catch (error) {
        console.error('Error loading purchase orders:', error)
        approvedPurchaseOrders.value = []
      } finally {
        loadingPurchaseOrders.value = false
      }
    }

    // Select purchase order for receipt
    const selectPurchaseOrder = (po) => {
      if (!po || processingReceipt.value) {
        console.log('⚠️ Cannot select PO: invalid PO or processing in progress')
        return
      }
      
      try {
        selectedPO.value = po
        console.log('✅ Selected PO:', po)
        
        // Initialize receipt form items with proper defaults
        const items = Array.isArray(po.items) ? po.items : []
        receiptForm.value.items = items.map(item => ({
          ...item,
          received_quantity: item?.quantity || 0, // Default to ordered quantity
          location: stockLocations.value[0]?.code || '', // ใช้ตำแหน่งแรกที่มี หรือเว้นว่างไว้
          notes: ''
        }))
        
        console.log('✅ Receipt form items initialized:', receiptForm.value.items)
        
      } catch (error) {
        console.error('❌ Error selecting PO:', error)
        selectedPO.value = null
      }
    }

    // Process goods receipt
    const processGoodsReceipt = async () => {
      // Prevent multiple simultaneous calls
      if (processingReceipt.value) {
        console.log('⚠️ Already processing receipt, skipping...')
        return
      }
      
      if (!selectedPO.value) {
        alert('กรุณาเลือก Purchase Order ก่อน')
        return
      }
      
      if (!receiptForm.value.items || receiptForm.value.items.length === 0) {
        alert('ไม่มีรายการสินค้าให้รับเข้า')
        return
      }
      
      // ตรวจสอบว่ามีตำแหน่งเก็บสินค้าหรือไม่
      if (!stockLocations.value || stockLocations.value.length === 0) {
        alert('จำเป็นต้องมีตำแหน่งเก็บสินค้าก่อนรับเข้าสินค้า กรุณาไปที่หน้าจัดการตำแหน่งเก็บสินค้าก่อน')
        return
      }
      
      // ตรวจสอบว่าทุกรายการมีตำแหน่งเก็บหรือไม่
      const itemsWithoutLocation = receiptForm.value.items.filter(item => !item.location)
      if (itemsWithoutLocation.length > 0) {
        alert(`กรุณาระบุตำแหน่งเก็บสำหรับสินค้า ${itemsWithoutLocation.length} รายการ`)
        return
      }
      
      processingReceipt.value = true
      
      try {
        console.log('Processing goods receipt for PO:', selectedPO.value.id)
        console.log('Receipt form:', receiptForm.value)
        
        // Create product master data and inventory transactions for each received item
        for (const item of receiptForm.value.items) {
          if (item.received_quantity > 0) {
            const itemSKU = item.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            console.log(`📦 Processing item: SKU=${itemSKU}, Qty=${item.received_quantity}`)
            
            // Step 1: Check/Create Product Master Data
            let productMaster = null
            try {
              // ค้นหา Product Master ที่มี SKU เดียวกัน
              const productResult = await engine.list(TRANSACTION_TYPES.PRODUCT)
              const existingProducts = productResult?.data || []
              productMaster = existingProducts.find(prod => prod.sku === itemSKU)
              
              if (!productMaster) {
                // สร้าง Product Master ใหม่
                console.log(`🆕 Creating new product master: ${itemSKU}`)
                const productMasterData = {
                  subtype: 'product_master',
                  sku: itemSKU,
                  product_name: item.product_name || item.productName || item.name || item.itemName,
                  productName: item.product_name || item.productName || item.name || item.itemName,
                  description: item.description || item.product_name || item.productName || 'Product from Purchase Order',
                  unit: item.unit || 'ชิ้น',
                  unit_price: item.unit_price || 0,
                  min_stock: item.min_stock || 5,
                  category: item.category || 'General',
                  supplier: selectedPO.value.vendor_name || 'Unknown',
                  status: 'active',
                  created_from: 'purchase_order',
                  po_reference: selectedPO.value.id
                }
                
                const productResult = await engine.create(TRANSACTION_TYPES.PRODUCT, productMasterData, receiptForm.value.received_by)
                if (productResult.success) {
                  productMaster = productResult.data
                  console.log(`✅ Product master created: ${productMaster.id}`)
                } else {
                  throw new Error(`Failed to create product master: ${productResult.error}`)
                }
              } else {
                console.log("Using existing product master:", productMaster.id)
              }
            } catch (error) {
              console.error(`❌ Error handling product master:`, error)
              throw error
            }
            
            // Step 2: Check/Update Inventory Stock Item per Location
            let inventoryItem = null
            if (inventory.value && Array.isArray(inventory.value)) {
              // หาสินค้าที่มี SKU และ Location เดียวกัน
              inventoryItem = inventory.value.find(inv => 
                inv && 
                inv.sku === itemSKU && 
                inv.location === item.location &&
                inv.subtype === 'stock_item'
              )
            }
            
            if (inventoryItem) {
              // อัปเดตจำนวนในตำแหน่งเดิม
              console.log(`➕ Updating existing stock at ${item.location}: ${inventoryItem.quantity} + ${item.received_quantity}`)
              
              const updatedData = {
                ...inventoryItem,
                quantity: (inventoryItem.quantity || 0) + item.received_quantity,
                unit_price: item.unit_price || inventoryItem.unit_price,
                last_received: receiptForm.value.received_date,
                updated_at: new Date().toISOString(),
                updated_by: receiptForm.value.received_by,
                product_master_id: productMaster.id
              }
              
              await engine.update(TRANSACTION_TYPES.INVENTORY, inventoryItem.id, updatedData, receiptForm.value.received_by)
            } else {
              // สร้าง Stock Item ใหม่ในตำแหน่งนี้
              console.log(`🆕 Creating new stock item: SKU=${itemSKU} at ${item.location}, Qty=${item.received_quantity}`)
              
              const newStockData = {
                subtype: 'stock_item',
                sku: itemSKU,
                product_name: productMaster.product_name,
                productName: productMaster.productName,
                description: `Stock of ${productMaster.product_name} at ${item.location}`,
                quantity: item.received_quantity,
                unit: productMaster.unit,
                unit_price: item.unit_price || productMaster.unit_price,
                location: item.location,
                min_stock: productMaster.min_stock,
                last_received: receiptForm.value.received_date,
                status: 'active',
                product_master_id: productMaster.id,
                requested_by: receiptForm.value.received_by
              }
              
              await engine.create(TRANSACTION_TYPES.INVENTORY, newStockData, receiptForm.value.received_by)
            }
            
            // Step 3: Create stock movement record with product master reference
            const productName = productMaster.product_name || productMaster.productName
            const movementData = {
              subtype: 'stock_movement',
              movement_type: 'receipt',
              description: `รับเข้าสินค้า: ${productName}`,
              requested_by: receiptForm.value.received_by,
              product_name: productName,
              productName: productName,
              sku: itemSKU,
              quantity: item.received_quantity,
              unit: productMaster.unit,
              unit_price: item.unit_price || productMaster.unit_price,
              from_location: 'INCOMING',
              to_location: item.location,
              reference_type: 'purchase_order',
              reference_id: selectedPO.value.id,
              product_master_id: productMaster.id,
              notes: item.notes || receiptForm.value.receipt_notes
            }
            
            await engine.create(TRANSACTION_TYPES.INVENTORY, movementData, receiptForm.value.received_by)
            console.log(`📋 Movement record created for ${itemSKU}`)
          }
        }
        
        console.log('✅ All items processed successfully with Product Master separation')
        
        // Import Purchase functions to update PO status
        try {
          const { receiveGoods } = await import('../../purchase/plugins/index.js')
          
          // Update Purchase Order status
          await receiveGoods(selectedPO.value.id, {
            received_by: receiptForm.value.received_by,
            receipt_notes: receiptForm.value.receipt_notes
          })
          
          console.log('Purchase Order status updated successfully')
        } catch (purchaseError) {
          console.warn('Failed to update Purchase Order status:', purchaseError.message)
          // Continue with the process even if PO update fails
        }
        
        // Safe cleanup with proper DOM handling
        console.log('✅ Goods receipt completed, starting cleanup...')
        
        // Step 1: Close modal immediately to prevent DOM conflicts
        showGoodsReceiptModal.value = false
        
        // Step 2: Wait for DOM to settle
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 150))
        
        // Step 3: Reset form data safely
        selectedPO.value = null
        receiptForm.value = {
          received_date: new Date().toISOString().split('T')[0],
          received_by: 'system',
          receipt_notes: '',
          items: []
        }
        
        // Step 4: Force DOM update before data refresh
        await nextTick()
        
        // Step 5: Refresh data with delay
        setTimeout(async () => {
          try {
            await Promise.all([
              loadInventory(),
              loadApprovedPurchaseOrders()
            ])
            
            // Final render update
            renderKey.value = Date.now() + Math.random()
            
            // Success message after everything is done
            setTimeout(() => {
              alert('รับเข้าสินค้าเรียบร้อยแล้ว!')
            }, 200)
            
          } catch (refreshError) {
            console.error('❌ Error during data refresh:', refreshError)
          }
        }, 300)
        
      } catch (error) {
        console.error('❌ Error processing goods receipt:', error)
        
        // Safe error cleanup
        setTimeout(async () => {
          try {
            showGoodsReceiptModal.value = false
            selectedPO.value = null
            
            // Wait before showing error
            await new Promise(resolve => setTimeout(resolve, 100))
            alert('เกิดข้อผิดพลาดในการรับเข้าสินค้า: ' + error.message)
            
          } catch (resetError) {
            console.error('❌ Error during error recovery:', resetError)
          }
        }, 100)
        
      } finally {
        // Always reset processing flag with delay
        setTimeout(() => {
          processingReceipt.value = false
        }, 100)
      }
    }





    // Stock status helpers
    const getStockStatus = (item) => {
      const qty = item.quantity || 0
      const minStock = item.min_stock || 5
      
      if (qty === 0) return 'danger'
      if (qty <= minStock) return 'warning'
      return 'success'
    }

    const getStockStatusText = (item) => {
      const qty = item.quantity || 0
      const minStock = item.min_stock || 5
      
      if (qty === 0) return 'หมดสต็อก'
      if (qty <= minStock) return 'สต็อกต่ำ'
      return 'พร้อมใช้งาน'
    }

    // Movement helpers
    const getMovementIcon = (type) => {
      const icons = {
        'receipt': 'fas fa-arrow-down text-success',
        'issue': 'fas fa-arrow-up text-danger',
        'transfer': 'fas fa-exchange-alt text-info',
        'adjustment': 'fas fa-edit text-warning'
      }
      return icons[type] || 'fas fa-question'
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

    const getMovementIconClass = (type) => {
      const classes = {
        'receipt': 'bg-green-500',
        'issue': 'bg-red-500',
        'transfer': 'bg-blue-500',
        'adjustment': 'bg-yellow-500'
      }
      return classes[type] || 'bg-gray-500'
    }

    // Utility functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('th-TH')
    }

    // Stock management actions
    const adjustStock = (item) => {
      alert(`ฟีเจอร์ปรับสต็อกสำหรับ ${item.product_name || item.productName || item.name || item.itemName} จะพัฒนาในเฟสถัดไป`)
    }

    const moveStock = (item) => {
      alert(`ฟีเจอร์ย้ายตำแหน่งสำหรับ ${item.product_name || item.productName || item.name || item.itemName} จะพัฒนาในเฟสถัดไป`)
    }

    const editProduct = (item) => {
      // หา Product Master ID หรือใช้ ID ปัจจุบัน
      let productId = item.id
      let itemSKU = item.sku || item.product_code
      
      // ถ้าเป็น Balance object ให้ใช้ product_id หรือค้นหาจาก product_code/sku
      if (item.product_id) {
        productId = item.product_id
      } else if (item.product_master_id) {
        // ถ้าเป็น Stock Item ให้หา Product Master ID
        productId = item.product_master_id
      } else if (item.displayType === 'stock_item' || !productId) {
        // หา Product Master จาก SKU/product_code
        const productMaster = inventory.value.find(invItem => 
          (invItem.sku === itemSKU || invItem.product_code === itemSKU) && 
          invItem.displayType === 'product_master'
        )
        if (productMaster) {
          productId = productMaster.id
        } else {
          // ถ้าหาไม่เจอใน inventory array ให้ลองใช้ product_id จาก Balance
          console.warn(`⚠️ Cannot find Product Master for SKU: ${itemSKU}`)
          
          // ถ้าเป็น Balance object อาจจะใช้ product_id โดยตรง
          if (item.product_id) {
            productId = item.product_id
          } else {
            alert('ไม่พบข้อมูล Product Master สำหรับสินค้านี้')
            return
          }
        }
      }
      
      console.log(`🔧 Editing product: ${itemSKU} (Product ID: ${productId})`)
      
      // Navigate to edit page with proper Vue router
      router.push(`/inventory/edit-product/${productId}`)
    }


    
    // Recover stock locations from localStorage
    const recoverStockLocations = async () => {
      try {
        const backupData = localStorage.getItem('stock_locations')
        if (!backupData) {
          alert('ไม่พบข้อมูลสำรองใน localStorage')
          return
        }
        
        const parsed = JSON.parse(backupData)
        if (!Array.isArray(parsed) || parsed.length === 0) {
          alert('ข้อมูลสำรองไม่ถูกต้องหรือว่างเปล่า')
          return
        }
        
        console.log('🔄 กำลังกู้คืนข้อมูล:', parsed)
        
        // ใช้เฉพาะข้อมูลจริงที่มี code หรือ name หรือ description
        const validLocations = parsed.filter(loc => {
          // ต้องมีข้อมูลระบุตัวตนอย่างน้อย 1 อย่าง
          return loc && (loc.code || loc.name || loc.description)
        })
        
        if (validLocations.length === 0) {
          alert('ไม่พบข้อมูลที่ใช้งานได้ใน localStorage')
          return
        }
        
        stockLocations.value = validLocations.map((loc, index) => {
          // สร้าง code และ name ถ้าไม่มี
          const recoveredLoc = {
            id: loc.id || `RECOVER_${Date.now()}_${index}`,
            code: loc.code || (loc.description ? extractCodeFromDescription(loc.description) : null),
            name: loc.name || (loc.description ? extractNameFromDescription(loc.description) : null),
            capacity: loc.capacity || 'ไม่จำกัด',
            type: loc.type || 'warehouse',
            zone: loc.zone || 'DEFAULT',
            description: loc.description || loc.name || null,
            item_count: loc.item_count || 0,
            status: loc.status || 'active',
            created_at: loc.created_at || new Date().toISOString(),
            created_by: loc.created_by || 'recovery'
          }
          
          // ถ้าไม่สามารถสร้าง code หรือ name ได้ ให้ใช้ค่า fallback
          if (!recoveredLoc.code) {
            recoveredLoc.code = `AUTO-${index + 1}`
          }
          if (!recoveredLoc.name) {
            recoveredLoc.name = `ตำแหน่ง ${index + 1}`
          }
          if (!recoveredLoc.description) {
            recoveredLoc.description = `ตำแหน่งเก็บ ${recoveredLoc.name}`
          }
          
          console.log('📦 กู้คืนรายการ:', recoveredLoc)
          return recoveredLoc
        })
        
        // บันทึกข้อมูลที่กู้คืนแล้วกลับไป
        localStorage.setItem('stock_locations', JSON.stringify(stockLocations.value))
        
        // Force re-render
        renderKey.value += 1
        
        alert(`กู้คืนข้อมูลสำเร็จ ${stockLocations.value.length} รายการ`)
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการกู้คืนข้อมูล:', error)
        alert('เกิดข้อผิดพลาดในการกู้คืนข้อมูล')
      }
    }
    
    // Helper functions สำหรับการกู้คืน
    const extractCodeFromDescription = (description) => {
      // พยายามดึง code จาก description
      if (typeof description !== 'string') return 'AUTO'
      
      // ลองหา pattern (XXX-XX)
      const codeMatch = description.match(/\(([^)]+)\)/)
      if (codeMatch && codeMatch[1]) {
        return codeMatch[1]
      }
      
      // ถ้าไม่มี ใช้ส่วนแรกของ description
      const parts = description.split(':')
      if (parts.length > 1) {
        return parts[1].trim().split(' ')[0] || 'AUTO'
      }
      
      return 'AUTO'
    }
    
    const extractNameFromDescription = (description) => {
      // พยายามดึง name จาก description
      if (typeof description !== 'string') return 'ไม่ระบุชื่อ'
      
      // ลองหา pattern ตำแหน่งเก็บ: XXX
      const nameMatch = description.match(/ตำแหน่งเก็บ:\s*(.+?)\s*\(/)
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim()
      }
      
      // ถ้าไม่มี ใช้ description ทั้งหมด
      return description.length > 50 ? description.substring(0, 47) + '...' : description
    }
    
    // Clear all stock locations

    
    // Get items in specific location
    const getItemsInLocation = (locationCode) => {
      if (!locationCode || !inventory.value) return []
      
      return inventory.value.filter(item => 
        item && 
        item.location === locationCode && 
        item.displayType !== 'product_master' &&
        item.quantity > 0
      )
    }

    // View location details
    const viewLocationDetails = (locationCode) => {
      const items = getItemsInLocation(locationCode)
      const location = stockLocations.value.find(loc => loc.code === locationCode)
      
      if (!location) return
      
      const itemsList = items.length > 0 
        ? items.map(item => `• ${item.sku}: ${item.product_name || item.productName || 'ไม่ระบุ'} (${formatNumber(item.quantity)} ${item.unit || 'ชิ้น'})`).join('\n')
        : '• ไม่มีสินค้าในตำแหน่งนี้'
      
      alert(`รายละเอียดตำแหน่ง: ${location.name}\nรหัส: ${location.code}\nโซน: ${location.zone || 'ไม่ระบุ'}\nสถานะ: ${location.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}\n\nสินค้าในตำแหน่งนี้ (${items.length} รายการ):\n${itemsList}`)
    }


    
    // Get location type text
    const getLocationTypeText = (type) => {
      const types = {
        warehouse: 'คลังสินค้า',
        office: 'สำนักงาน',
        production: 'พื้นที่ผลิต',
        staging: 'รอจัดส่ง',
        quality: 'ตรวจคุณภาพ',
        other: 'อื่นๆ'
      }
      return types[type] || 'คลังสินค้า'
    }

    // แปลง location code เป็น location name
    const getLocationName = (locationCode) => {
      if (!locationCode) return 'ไม่ระบุ'
      
      const location = stockLocations.value.find(loc => 
        loc && loc.code === locationCode
      )
      
      return location ? location.name : locationCode
    }

    // อัพเดต location display
    const updateLocationDisplay = (item) => {
      // Force reactivity update with error handling
      nextTick(() => {
        try {
          if (item && item.location) {
            console.log('Location updated:', item.location, 'Name:', getLocationName(item.location))
          }
        } catch (error) {
          console.warn('Error updating location display:', error)
        }
      })
    }
    
    // Refresh data
    const refreshData = async () => {
      if (loading.value || processingReceipt.value) {
        console.log('⚠️ Refresh blocked: already loading or processing')
        return
      }
      
      try {
        console.log('🔄 Refreshing data...')
        await Promise.all([
          loadInventory(),
          loadBalance(),
          loadApprovedPurchaseOrders()
        ])
        
        // Safe re-render
        setTimeout(() => {
          renderKey.value = Date.now() + Math.random()
        }, 100)
        
        console.log('✅ Data refresh completed')
      } catch (error) {
        console.error('❌ Error refreshing data:', error)
      }
    }

    // Watch for modal opening
    watch(showGoodsReceiptModal, async (newValue, oldValue) => {
      if (newValue && !oldValue) {
        console.log('🔄 เปิด Goods Receipt Modal - โหลดข้อมูล')
        
        try {
          await Promise.all([
            loadApprovedPurchaseOrders()
          ])
          console.log('📦 Stock Locations ปัจจุบัน:', stockLocations.value)
        } catch (error) {
          console.error('❌ Error loading modal data:', error)
        }
      }
      
      // Clean up when modal closes
      if (!newValue && oldValue) {
        console.log('🔄 ปิด Goods Receipt Modal - ทำความสะอาด')
        
        // Use timeout to prevent DOM issues
        setTimeout(() => {
          if (selectedPO.value && !processingReceipt.value) {
            selectedPO.value = null
            receiptForm.value = {
              received_date: new Date().toISOString().split('T')[0],
              received_by: 'system',
              receipt_notes: '',
              items: []
            }
          }
        }, 100)
      }
    })

        
    // Update item counts for locations
    const updateLocationItemCounts = () => {
      if (!stockLocations.value || !Array.isArray(stockLocations.value)) {
        return
      }
      
      const inventoryArray = Array.isArray(inventory.value) ? inventory.value : []
      
      stockLocations.value.forEach(location => {
        if (location && location.code) {
          location.item_count = inventoryArray.filter(item => 
            item && item.location === location.code
          ).length
        }
      })
    }
    
    // Debug all data in localStorage
    // Debug stock locations
    const debugStockLocations = async () => {
      console.log('🔍 === DEBUG STOCK LOCATIONS ===')
      
      try {
        // ดึงข้อมูลจาก database
        const result = await engine.list(TRANSACTION_TYPES.INVENTORY)
        const allItems = result?.data || []
        
        const locationItems = allItems.filter(item => item && item.subtype === 'stock_location')
        console.log('📍 All location items in database:', locationItems)
        
        console.log('📦 stockLocations.value:', stockLocations.value)
        console.log('✅ validStockLocations.value:', validStockLocations.value)
        console.log('🔧 filteredStockLocations.value:', filteredStockLocations.value)
        
        const summary = {
          totalInDatabase: locationItems.length,
          loadedInComponent: stockLocations.value.length,
          validFiltered: validStockLocations.value.length,
          finalFiltered: filteredStockLocations.value.length
        }
        
        console.log('📊 Stock Locations Summary:', summary)
        
        // แสดงรายละเอียดของแต่ละ location
        locationItems.forEach((item, index) => {
          const isSystemCreated = item.created_by === 'system' || item.code?.match(/^[ABC]\d{2}$/)
          console.log(`Location ${index + 1} ${isSystemCreated ? '(SYSTEM)' : '(USER)'}:`, {
            id: item.id,
            code: item.code,
            name: item.name,
            description: item.description,
            zone: item.zone,
            type: item.type,
            created_by: item.created_by,
            is_active: item.is_active,
            status: item.status,
            isSystemCreated
          })
        })
        
        // แยกข้อมูล system vs user
        const systemLocations = locationItems.filter(item => 
          item.created_by === 'system' || item.code?.match(/^[ABC]\d{2}$/)
        )
        const userLocations = locationItems.filter(item => 
          item.created_by !== 'system' && !item.code?.match(/^[ABC]\d{2}$/)
        )
        
        alert(`Debug Stock Locations:\n\nในฐานข้อมูล: ${summary.totalInDatabase} ตำแหน่ง\n- System created: ${systemLocations.length} ตำแหน่ง\n- User created: ${userLocations.length} ตำแหน่ง\n\nโหลดในคอมโพเนนต์: ${summary.loadedInComponent} ตำแหน่ง\nผ่านการกรอง: ${summary.validFiltered} ตำแหน่ง\nแสดงผลสุดท้าย: ${summary.finalFiltered} ตำแหน่ง\n\nSystem Locations: ${systemLocations.map(l => l.code).join(', ')}\nUser Locations: ${userLocations.map(l => l.code).join(', ')}\n\nดูรายละเอียดใน Console`)
        
      } catch (error) {
        console.error('❌ Debug error:', error)
        alert('เกิดข้อผิดพลาดในการ debug: ' + error.message)
      }
    }

    // Cleanup system-created locations
    const cleanupSystemLocations = async () => {
      const confirmed = confirm('ต้องการลบข้อมูลตำแหน่งที่สร้างโดย system (A01, B01, C01) ทั้งหมดหรือไม่?')
      if (!confirmed) return

      try {
        console.log('🧹 กำลังลบข้อมูลตำแหน่งที่สร้างโดย system...')
        
        // ดึงข้อมูลทั้งหมด
        const result = await engine.list(TRANSACTION_TYPES.INVENTORY)
        const allItems = result?.data || []
        
        // หา stock_location ที่สร้างโดย system หรือตรงกับ pattern
        const systemLocations = allItems.filter(item => 
          item && 
          item.subtype === 'stock_location' && 
          (
            item.created_by === 'system' ||
            item.code?.match(/^[ABC]\d{2}$/) ||
            item.name?.includes('โซน A') ||
            item.name?.includes('โซน B') ||
            item.name?.includes('โซน C') ||
            item.description?.includes('โซนเก็บสินค้าหลัก') ||
            item.description?.includes('โซนเก็บสินค้าพิเศษ')
          )
        )
        
        console.log('🗑️ System locations to delete:', systemLocations)
        
        if (systemLocations.length === 0) {
          alert('ไม่พบข้อมูลตำแหน่งที่สร้างโดย system')
          return
        }
        
        // ลบแต่ละรายการ
        let deletedCount = 0
        for (const location of systemLocations) {
          try {
            if (location.id) {
              await engine.delete(TRANSACTION_TYPES.INVENTORY, location.id, 'system')
              console.log(`✅ ลบ location: ${location.code} - ${location.name}`)
              deletedCount++
            }
          } catch (error) {
            console.warn(`⚠️ ไม่สามารถลบ location ${location.code}:`, error)
          }
        }
        
        // Refresh ข้อมูล
        await loadInventory()
        renderKey.value = Date.now() + Math.random()
        
        alert(`✅ ลบข้อมูลตำแหน่งที่สร้างโดย system เรียบร้อยแล้ว (${deletedCount}/${systemLocations.length} รายการ)`)
        
      } catch (error) {
        console.error('❌ Error cleaning up system locations:', error)
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message)
      }
    }

    const debugAllData = async () => {
      console.log('🚀 === DEBUG ALL DATA ===')
      
      // Check all localStorage keys
      const allKeys = Object.keys(localStorage).filter(key => key.includes('erp') || key.includes('inventory') || key.includes('stock'))
      console.log('📋 All relevant localStorage keys:', allKeys)
      
      allKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          console.log(`📦 ${key}:`, data)
          
          if (Array.isArray(data)) {
            console.log(`  📊 Array with ${data.length} items`)
            data.forEach((item, index) => {
              if (item && typeof item === 'object') {
                console.log(`    Item ${index + 1}:`, {
                  id: item.id,
                  type: item.type,
                  subtype: item.subtype,
                  sku: item.sku,
                  names: {
                    product_name: item.product_name,
                    productName: item.productName,
                    name: item.name,
                    itemName: item.itemName,
                    description: item.description
                  },
                  quantity: item.quantity,
                  location: item.location
                })
              }
            })
          } else if (typeof data === 'object' && data !== null) {
            console.log(`  📊 Object with keys: ${Object.keys(data)}`)
            Object.values(data).forEach((item, index) => {
              if (item && typeof item === 'object') {
                console.log(`    Item ${index + 1}:`, {
                  id: item.id,
                  type: item.type,
                  subtype: item.subtype,
                  sku: item.sku,
                  names: {
                    product_name: item.product_name,
                    productName: item.productName,
                    name: item.name,
                    itemName: item.itemName,
                    description: item.description
                  },
                  quantity: item.quantity,
                  location: item.location
                })
              }
            })
          }
        } catch (error) {
          console.error(`❌ Error parsing ${key}:`, error)
        }
      })
      
      // Also check database directly
      console.log('\n🗄️ === DATABASE CHECK ===')
      try {
        const allInventoryData = await engine.list(TRANSACTION_TYPES.INVENTORY)
        console.log('📋 All database inventory items:', allInventoryData)
        
        if (allInventoryData?.data) {
          console.log(`📊 Total items in database: ${allInventoryData.data.length}`)
          allInventoryData.data.forEach((item, index) => {
            console.log(`  DB Item ${index + 1}:`, {
              id: item.id,
              type: item.type,
              subtype: item.subtype,
              sku: item.sku,
              names: {
                product_name: item.product_name,
                productName: item.productName,
                name: item.name,
                itemName: item.itemName,
                description: item.description
              },
              quantity: item.quantity,
              location: item.location,
              created_date: item.created_date
            })
          })
        }
      } catch (dbError) {
        console.error('❌ Database check error:', dbError)
      }
      
      console.log('🏁 === END DEBUG ===')
      alert('Debug info logged to console. กด F12 เพื่อดู console')
    }



    // Initialize
    // Error handling for DOM safety
    const handleRenderError = (error) => {
      console.error('Template render error:', error)
      renderKey.value = Date.now() + Math.random()
    }

    // Vue error boundary
    onErrorCaptured((error, instance, info) => {
      console.error('Component error captured:', error, info)
      
      // Try to recover by forcing re-render
      setTimeout(() => {
        renderKey.value = Date.now() + Math.random()
      }, 100)
      
      return false // Don't propagate
    })

    // รวมข้อมูลสินค้าที่ซ้ำกัน (Consolidate duplicate inventory items)
    const consolidateDuplicateItems = async () => {
      console.log('🔄 เริ่มรวมข้อมูลสินค้าที่ซ้ำกัน...')
      
      try {
        // โหลดข้อมูลล่าสุด
        await loadInventory()
        
        if (!inventory.value || inventory.value.length === 0) {
          alert('ไม่มีข้อมูลสินค้าให้รวม')
          return
        }
        
        // จัดกลุ่มสินค้าตาม SKU
        const itemGroups = {}
        inventory.value.forEach(item => {
          const key = item.sku || `${item.product_name || item.productName || item.name}_${item.unit || 'ชิ้น'}`
          if (!itemGroups[key]) {
            itemGroups[key] = []
          }
          itemGroups[key].push(item)
        })
        
        let consolidatedCount = 0
        let removedCount = 0
        
        // รวมข้อมูลสินค้าที่มี SKU เดียวกัน
        for (const [key, items] of Object.entries(itemGroups)) {
          if (items.length > 1) {
            console.log(`📦 รวมสินค้า ${key}: ${items.length} รายการ`)
            
            // เลือกรายการแรกเป็นหลัก
            const mainItem = items[0]
            let totalQuantity = 0
            let locations = []
            
            // รวมจำนวนและตำแหน่งเก็บ
            items.forEach(item => {
              totalQuantity += (item.quantity || 0)
              if (item.location && !locations.includes(item.location)) {
                locations.push(item.location)
              }
            })
            
            // อัปเดตรายการหลัก
            const updatedData = {
              ...mainItem,
              quantity: totalQuantity,
              location: locations.join(', '), // รวมตำแหน่งเก็บทั้งหมด
              updated_at: new Date().toISOString(),
              updated_by: 'system',
              notes: `Consolidated from ${items.length} items on ${new Date().toISOString()}`
            }
            
            await engine.update(TRANSACTION_TYPES.INVENTORY, mainItem.id, updatedData, 'system')
            consolidatedCount++
            
            // ลบรายการที่เหลือ
            for (let i = 1; i < items.length; i++) {
              await engine.delete(TRANSACTION_TYPES.INVENTORY, items[i].id)
              removedCount++
              console.log(`🗑️ ลบรายการซ้ำ: ${items[i].id}`)
            }
          }
        }
        
        // รีเฟรชข้อมูล
        await loadInventory()
        renderKey.value = Date.now() + Math.random()
        
        if (consolidatedCount > 0) {
          alert(`รวมข้อมูลสำเร็จ!\n- รวมสินค้า: ${consolidatedCount} รายการ\n- ลบรายการซ้ำ: ${removedCount} รายการ`)
        } else {
          alert('ไม่พบข้อมูลสินค้าที่ซ้ำกัน')
        }
        
      } catch (error) {
        console.error('❌ Error consolidating items:', error)
        alert('เกิดข้อผิดพลาดในการรวมข้อมูล: ' + error.message)
      }
    }



    // ทำความสะอาดและแก้ไขข้อมูล Legacy
    const fixLegacyData = async () => {
      console.log('🔧 Fixing legacy inventory data...')
      
      try {
        await loadInventory()
        
        if (!inventory.value || inventory.value.length === 0) {
          alert('ไม่มีข้อมูลให้แก้ไข')
          return
        }
        
        let processedCount = 0
        const processedSKUs = new Set()
        
        // แปลงข้อมูลเก่าให้เป็น Product Master + Stock Item
        for (const item of inventory.value) {
          if (!item.sku || processedSKUs.has(item.sku)) continue
          
          const itemSKU = item.sku
          console.log(`🔧 Processing legacy item: ${itemSKU}`)
          
          // 1. สร้าง Product Master
          const productMasterData = {
            subtype: 'product_master',
            sku: itemSKU,
            product_name: item.product_name || item.productName || item.name || `Product ${itemSKU}`,
            productName: item.product_name || item.productName || item.name || `Product ${itemSKU}`,
            description: item.description || `Legacy product ${itemSKU}`,
            unit: item.unit || 'ชิ้น',
            unit_price: item.unit_price || 0,
            min_stock: item.min_stock || 5,
            category: 'Legacy',
            supplier: 'Legacy Import',
            status: 'active',
            created_from: 'legacy_conversion',
            requested_by: 'system'
          }
          
          const masterResult = await engine.create(TRANSACTION_TYPES.PRODUCT, productMasterData, 'system')
          if (masterResult.success) {
            console.log(`✅ Product Master created for ${itemSKU}`)
            
            // 2. อัปเดต Stock Item ให้ลิงก์กับ Product Master
            const updatedStockData = {
              ...item,
              subtype: 'stock_item',
              product_master_id: masterResult.data.id,
              description: `Stock of ${item.product_name || itemSKU} at ${item.location || 'Unknown'}`,
              updated_by: 'system',
              updated_at: new Date().toISOString()
            }
            
            await engine.update(TRANSACTION_TYPES.INVENTORY, item.id, updatedStockData, 'system')
            console.log(`✅ Stock Item updated for ${itemSKU}`)
            
            processedSKUs.add(itemSKU)
            processedCount++
          }
        }
        
        // รีเฟรชข้อมูล
        await loadInventory()
        renderKey.value = Date.now() + Math.random()
        
        alert(`แก้ไขข้อมูลเสร็จสิ้น!\n- ประมวลผล: ${processedCount} SKU\n- สร้าง Product Master: ${processedCount} รายการ`)
        
      } catch (error) {
        console.error('❌ Error fixing legacy data:', error)
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล: ' + error.message)
      }
    }

    // แสดงข้อมูล Product Master ทั้งหมด
    const showProductMasters = async () => {
      console.log('📋 === PRODUCT MASTERS ===')
      try {
        const result = await engine.list(TRANSACTION_TYPES.PRODUCT)
        const products = result?.data || []
        
        console.log(`Found ${products.length} product masters:`)
        products.forEach((product, index) => {
          console.log(`${index + 1}. SKU: ${product.sku}`)
          console.log(`   Name: ${product.product_name || product.productName}`)
          console.log(`   Unit: ${product.unit}`)
          console.log(`   Price: ${product.unit_price}`)
          console.log(`   Category: ${product.category}`)
          console.log(`   Supplier: ${product.supplier}`)
          console.log(`   Status: ${product.status}`)
          console.log('   ---')
        })
        
        alert(`พบ Product Master ${products.length} รายการ (ดู console สำหรับรายละเอียด)`)
      } catch (error) {
        console.error('Error loading product masters:', error)
        alert('เกิดข้อผิดพลาดในการโหลด Product Masters')
      }
    }

    // Migration: ย้าย Product Master จาก INVENTORY ไป PRODUCT
    const migrateProductMastersFromInventory = async () => {
      console.log('🔄 Starting Product Master migration from INVENTORY to PRODUCT...')
      
      try {
        // 1. โหลดข้อมูลจาก INVENTORY ที่เป็น product_master
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        const inventoryItems = inventoryResult?.data || []
        
        const productMasters = inventoryItems.filter(item => 
          item && item.subtype === 'product_master' && item.sku
        )
        
        console.log(`📋 Found ${productMasters.length} Product Masters in INVENTORY to migrate`)
        
        if (productMasters.length === 0) {
          alert('ไม่พบ Product Master ใน INVENTORY ที่ต้องย้าย')
          return
        }
        
        // 2. ตรวจสอบข้อมูลที่มีอยู่แล้วใน PRODUCT
        const productResult = await engine.list(TRANSACTION_TYPES.PRODUCT)
        const existingProducts = productResult?.data || []
        const existingSkus = new Set(existingProducts.map(p => p.sku))
        
        let migratedCount = 0
        let skippedCount = 0
        
        // 3. ย้ายข้อมูลที่ยังไม่มีใน PRODUCT
        for (const productMaster of productMasters) {
          if (existingSkus.has(productMaster.sku)) {
            console.log(`⏭️  Skipping ${productMaster.sku} - already exists in PRODUCT`)
            skippedCount++
            continue
          }
          
          // สร้างข้อมูล Product Master ใหม่
          const newProductData = {
            sku: productMaster.sku,
            product_name: productMaster.product_name || productMaster.productName,
            description: productMaster.description || '',
            unit: productMaster.unit || 'ชิ้น',
            unit_price: productMaster.unit_price || 0,
            min_stock: productMaster.min_stock || 5,
            category: productMaster.category || 'General',
            supplier: productMaster.supplier || 'Migrated',
            status: productMaster.status || 'active',
            created_at: productMaster.created_at || new Date().toISOString(),
            migrated_from: 'inventory_product_master',
            original_id: productMaster.id
          }
          
          console.log(`📋 Migrating ${productMaster.sku} to PRODUCT...`)
          const result = await engine.create(TRANSACTION_TYPES.PRODUCT, newProductData, 'migration')
          
          if (result.success) {
            migratedCount++
            console.log(`✅ Migrated ${productMaster.sku}`)
            
            // อัปเดต Stock Items ให้ link กับ Product Master ใหม่
            const relatedStockItems = inventoryItems.filter(item => 
              item.sku === productMaster.sku && item.subtype === 'stock_item'
            )
            
            for (const stockItem of relatedStockItems) {
              const updatedStockItem = {
                ...stockItem,
                product_master_id: result.data.id,
                updated_at: new Date().toISOString(),
                updated_by: 'migration'
              }
              
              await engine.update(TRANSACTION_TYPES.INVENTORY, stockItem.id, updatedStockItem, 'migration')
              console.log(`🔗 Updated stock item ${stockItem.id} to link with new Product Master`)
            }
          } else {
            console.error(`❌ Failed to migrate ${productMaster.sku}:`, result.error)
          }
        }
        
        const message = `Migration เสร็จสิ้น!\n\n✅ ย้ายสำเร็จ: ${migratedCount} รายการ\n⏭️  ข้ามแล้ว: ${skippedCount} รายการ\n\nProduct Master ทั้งหมดถูกย้ายไป PRODUCT database แล้ว`
        alert(message)
        
        // Refresh data
        await loadInventory()
        
      } catch (error) {
        console.error('❌ Migration error:', error)
        alert('เกิดข้อผิดพลาดในการ migrate: ' + error.message)
      }
    }

    // Product Form Functions
    const validateProductForm = () => {
      const errors = {}
      
      if (!newProduct.value.sku?.trim()) {
        errors.sku = 'กรุณาระบุรหัสสินค้า (SKU)'
      }
      
      if (!newProduct.value.product_name?.trim()) {
        errors.product_name = 'กรุณาระบุชื่อสินค้า'
      }
      
      if (!newProduct.value.unit_price || newProduct.value.unit_price <= 0) {
        errors.unit_price = 'กรุณาระบุราคาต่อหน่วยที่ถูกต้อง'
      }
      
      productErrors.value = errors
      return Object.keys(errors).length === 0
    }
    
    const resetProductForm = () => {
      newProduct.value = {
        sku: '',
        product_name: '',
        description: '',
        unit: 'ชิ้น',
        unit_price: 0,
        min_stock: 5,
        category: 'General',
        supplier: '',
        initial_quantity: 0,
        location: validStockLocations.value[0]?.code || ''
      }
      productErrors.value = {}
    }
    
    const addNewProduct = async () => {
      console.log('🏷️ Creating new product via InventoryManager modal...')
      
      // Validate form
      if (!validateProductForm()) {
        console.log('❌ Product form validation failed')
        return
      }
      
      savingProduct.value = true
      
      try {
        const productSKU = newProduct.value.sku.trim().toUpperCase()
        
        // Check if SKU already exists in Product Master
        const existingResult = await engine.list(TRANSACTION_TYPES.PRODUCT)
        const existingProducts = existingResult?.data || []
        const existingProduct = existingProducts.find(item => item.sku === productSKU)
        
        if (existingProduct) {
          productErrors.value.sku = 'รหัส SKU นี้มีอยู่แล้วในระบบ'
          savingProduct.value = false
          return
        }
        
        // Create Product Master
        const rawProductData = {
          sku: productSKU,
          product_name: newProduct.value.product_name.trim(),
          description: newProduct.value.description.trim() || newProduct.value.product_name.trim(),
          unit: newProduct.value.unit,
          unit_price: Number(newProduct.value.unit_price),
          min_stock: Number(newProduct.value.min_stock),
          category: newProduct.value.category,
          supplier: newProduct.value.supplier.trim() || 'Manual Entry',
          status: 'active'
        }
        
        console.log('📋 Creating Product Master:', rawProductData)
        const masterResult = await engine.create(TRANSACTION_TYPES.PRODUCT, rawProductData, 'user')
        
        if (!masterResult.success) {
          throw new Error('ไม่สามารถสร้าง Product Master: ' + masterResult.error)
        }
        
        console.log('✅ Product Master created:', masterResult.data.id)
        
        // Create Stock Item if initial quantity > 0
        if (Number(newProduct.value.initial_quantity) > 0) {
          if (!newProduct.value.location) {
            throw new Error('กรุณาเลือกตำแหน่งเก็บสำหรับจำนวนเริ่มต้น')
          }
          
          const stockItemData = {
            subtype: 'stock_item',
            sku: productSKU,
            product_name: newProduct.value.product_name.trim(),
            description: `Stock of ${newProduct.value.product_name.trim()} at ${newProduct.value.location}`,
            quantity: Number(newProduct.value.initial_quantity),
            unit: newProduct.value.unit,
            unit_price: Number(newProduct.value.unit_price),
            location: newProduct.value.location,
            min_stock: Number(newProduct.value.min_stock),
            status: 'active',
            product_master_id: masterResult.data.id,
            last_received: new Date().toISOString()
          }
          
          const stockResult = await engine.create(TRANSACTION_TYPES.INVENTORY, stockItemData, 'user')
          
          if (!stockResult.success) {
            throw new Error('ไม่สามารถสร้าง Stock Item: ' + stockResult.error)
          }
          
          console.log('✅ Stock Item created:', stockResult.data.id)
          
          // Create movement record
          const movementData = {
            subtype: 'stock_movement',
            movement_type: 'adjustment',
            description: `เพิ่มสินค้าใหม่: ${newProduct.value.product_name.trim()}`,
            product_name: newProduct.value.product_name.trim(),
            sku: productSKU,
            quantity: Number(newProduct.value.initial_quantity),
            unit: newProduct.value.unit,
            unit_price: Number(newProduct.value.unit_price),
            from_location: 'NEW',
            to_location: newProduct.value.location,
            reference_type: 'add_product',
            product_master_id: masterResult.data.id,
            notes: 'เพิ่มสินค้าใหม่เข้าระบบ'
          }
          
          await engine.create(TRANSACTION_TYPES.INVENTORY, movementData, 'user')
          console.log('✅ Movement record created')
        }
        
        // Success message
        const message = Number(newProduct.value.initial_quantity) > 0 
          ? `เพิ่มสินค้าใหม่เรียบร้อยแล้ว!\nSKU: ${productSKU}\nจำนวนเริ่มต้น: ${newProduct.value.initial_quantity} ${newProduct.value.unit}\nตำแหน่ง: ${newProduct.value.location}`
          : `เพิ่ม Product Master เรียบร้อยแล้ว!\nSKU: ${productSKU}\n(ไม่มีจำนวนเริ่มต้น)`
        
        alert(message)
        
        // Reset form and close modal
        resetProductForm()
        showCreateForm.value = false
        await loadInventory() // Refresh data
        
      } catch (error) {
        console.error('❌ Error adding new product:', error)
        alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message)
      } finally {
        savingProduct.value = false
      }
    }

    // สร้างข้อมูลตัวอย่างเพื่อทดสอบ


    // ล้างข้อมูล sample ทั้งหมด


    // Watch for activeTab changes


    onMounted(async () => {
      try {
        console.log('🚀 Mounting InventoryManager...')
        
        // ✅ Initialize InventoryService
        if (window.ERP_CORE?.inventory) {
          try {
            const instance = getCurrentInstance()
            const componentProxy = instance?.proxy || instance
            window.ERP_CORE.inventory.initialize(componentProxy)
            console.log('[InventoryManager] ✅ InventoryService initialized')
          } catch (error) {
            console.error('[InventoryManager] ❌ Failed to initialize InventoryService:', error)
          }
        }
        
        // โหลดข้อมูลทั้งหมด (สินค้า, Balance, Movements, และ Purchase Orders)
        await Promise.all([
          loadInventory(),
          loadBalance(), 
          loadMovements(),
          loadStockLocations(), // ✅ เพิ่มการโหลด Stock Locations
          loadApprovedPurchaseOrders() // เพิ่มการโหลด PO เพื่อแสดงจำนวนที่ปุ่มและ widget
        ])
        
        // Debug: ตรวจสอบข้อมูลที่โหลดมา
        console.log('📊 Debug - Inventory items:', inventory.value?.length || 0)
        console.log('📊 Debug - Balance records:', balanceData.value?.length || 0)
        console.log('📊 Debug - Stock movements:', stockMovements.value?.length || 0)
        console.log('📊 Debug - Approved POs:', approvedPurchaseOrders.value?.length || 0)
        console.log('📊 Debug - Pending PO Count:', pendingPOCount.value)
        
        if (balanceData.value?.length > 0) {
          console.log('📊 Sample Balance data:', balanceData.value.slice(0, 2))
        } else {
          console.warn('⚠️ No Balance data found!')
        }
        
        // Ensure DOM is ready after data load
        await nextTick()
        renderKey.value = Date.now() + Math.random()
        
        console.log('✅ InventoryManager mounted successfully')
        
      } catch (error) {
        console.error('Error during mount:', error)
        handleRenderError(error)
      }
    })

    // Helper functions for Balance display
    const getProductName = (balance) => {
      // Try to find matching product from inventory
      const product = inventory.value.find(p => 
        p.id === balance.product_id || 
        p.sku === balance.product_code
      )
      return product?.product_name || product?.name || balance.product_code || 'ไม่ระบุ'
    }

    const getProductUnit = (balance) => {
      const product = inventory.value.find(p => 
        p.id === balance.product_id || 
        p.sku === balance.product_code
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

    // Placeholder functions for new actions
    const viewBalanceDetails = (balance) => {
      console.log('📊 View Balance Details:', balance)
      alert(`Balance Details for ${balance.product_code}:\n\nOn Hand: ${balance.qty_on_hand || 0}\nAvailable: ${balance.qty_available || 0}\nReserved: ${balance.qty_reserved || 0}\nTotal Value: ฿${balance.total_cost_value || 0}`)
    }

    const editBalance = (balance) => {
      console.log('✏️ Edit Balance:', balance)
      alert('Edit Balance function - Coming soon!')
    }

    const viewMovements = (balance) => {
      console.log('📈 View Movements:', balance)
      alert('View Movement History - Coming soon!')
    }

    // Helper functions for product thumbnail
    const getProductThumbnailColor = (balance) => {
      // Generate color based on product category or first letter
      const name = getProductName(balance)
      const firstChar = name.charAt(0).toUpperCase()
      
      const colors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600', 
        'bg-purple-100 text-purple-600',
        'bg-yellow-100 text-yellow-600',
        'bg-red-100 text-red-600',
        'bg-indigo-100 text-indigo-600',
        'bg-pink-100 text-pink-600',
        'bg-gray-100 text-gray-600'
      ]
      
      const charCode = firstChar.charCodeAt(0)
      return colors[charCode % colors.length]
    }

    const getProductInitials = (balance) => {
      const name = getProductName(balance)
      const words = name.split(' ')
      
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }

    const getProductIcon = (balance) => {
      // Return icon based on product category or type
      const product = inventory.value.find(p => 
        p.id === balance.product_id || 
        p.sku === balance.product_code
      )
      
      const category = product?.category?.toLowerCase() || ''
      
      if (category.includes('electronic') || category.includes('tech')) return 'fas fa-microchip'
      if (category.includes('food') || category.includes('อาหาร')) return 'fas fa-utensils'
      if (category.includes('cloth') || category.includes('เสื้อผ้า')) return 'fas fa-tshirt'
      if (category.includes('book') || category.includes('หนังสือ')) return 'fas fa-book'
      if (category.includes('tool') || category.includes('เครื่องมือ')) return 'fas fa-tools'
      if (category.includes('medical') || category.includes('ยา')) return 'fas fa-pills'
      
      return 'fas fa-cube' // default icon
    }

    return {
      // Data
      inventory,
      balanceData,
      stockLocations,
      validStockLocations,
      stockMovements,
      approvedPurchaseOrders,
      loading,
      loadingPurchaseOrders,
      processingReceipt,
      renderKey,
      
      // UI States
      showAdminMenu,
      selectedPO,
      
      // Form states
      showCreateForm,
      showGoodsReceiptModal,
      receiptForm,
      
      // Computed
      stats,
      filteredStockLocations,
      filteredStockMovements,
      pendingPOCount,
      
      // Methods
      loadInventory,
      loadBalance,
      loadMovements,
      loadStockLocations,
      selectPurchaseOrder,
      processGoodsReceipt,
      recoverStockLocations,

      // Helper functions
      getProductName,
      getProductUnit,
      getStockLevelClass,
      getBalanceStatus,
      getBalanceStatusText,
      viewBalanceDetails,
      editBalance,
      viewMovements,
      getProductThumbnailColor,
      getProductInitials,
      getProductIcon,

      updateLocationItemCounts,
      getLocationTypeText,
      getLocationName,
      updateLocationDisplay,
      getStockStatus,
      getStockStatusText,
      getMovementIcon,
      getMovementIconClass,
      getMovementTypeText,
      adjustStock,
      moveStock,
      editProduct,
      formatCurrency,
      formatNumber,
      formatDateTime,
      refreshData,
      handleRenderError,
      debugAllData,
      debugStockLocations,
      cleanupSystemLocations,
      showProductMasters,
      fixLegacyData,
      consolidateDuplicateItems,
      migrateProductMastersFromInventory,
      
      // Product Form Functions
      addNewProduct,
      resetProductForm,
      validateProductForm,
      newProduct,
      productErrors,
      savingProduct,
      
      // Location management
      getItemsInLocation,
      viewLocationDetails
    }
  }
}
</script>

<style scoped>
/* Only essential styles that can't be replaced by Tailwind */

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal overlay (fixed positioning needs custom CSS) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Line clamp utility for text truncation */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}
</style>
