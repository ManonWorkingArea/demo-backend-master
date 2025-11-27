<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">รายละเอียดสินค้า</h1>
            <p class="mt-2 text-gray-600" v-if="product">
              รายละเอียดของ {{ product.product_name || product.name || 'ไม่ระบุ' }}
            </p>
          </div>
          <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3" v-if="product">
            <!-- Document Preview Button -->
            <div class="relative">
              <button 
                @click="toggleDocumentMenu"
                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i class="fas fa-file-alt"></i>
                <span class="hidden sm:inline sm:ml-2">เอกสาร</span>
                <i class="fas fa-chevron-down hidden sm:inline sm:ml-2"></i>
              </button>
              
              <!-- Document Menu Dropdown -->
              <div 
                v-if="showDocumentMenu"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                @click.stop
              >
                <div class="py-2">
                  <button
                    @click="previewDocument('quotation')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center"
                  >
                    <i class="fas fa-file-invoice mr-2 text-blue-500"></i>
                    ใบเสนอราคา
                  </button>
                  <button
                    @click="previewDocument('purchase_request')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center"
                  >
                    <i class="fas fa-shopping-cart mr-2 text-green-500"></i>
                    ใบขอซื้อ
                  </button>
                  <button
                    @click="previewDocument('invoice')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center"
                  >
                    <i class="fas fa-file-invoice-dollar mr-2 text-purple-500"></i>
                    ใบแจ้งหนี้
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              @click="refreshData" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              :disabled="loading"
            >
              <i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i>
              <span class="hidden sm:inline sm:ml-2">รีเฟรช</span>
            </button>
            <router-link 
              :to="`/inventory/products/${productId}/edit`"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-edit"></i>
              <span class="hidden sm:inline sm:ml-2">แก้ไขสินค้า</span>
            </router-link>
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
                to="/inventory/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Inventory Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <router-link to="/inventory/products" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                  จัดการสินค้า
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">รายละเอียดสินค้า</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
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

      <div v-else-if="product" class="space-y-6">
        
        <!-- Lot Summary for Textile Products -->
        <div v-if="isTextileProduct">
          <ProductLotSummary :product-id="product.id || product._id" />
        </div>

        <!-- Bottom Row: Details and Other Information -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Details -->
          <div class="lg:col-span-2 space-y-6">

          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            </div>
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อสินค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium break-words text-sm sm:text-base">{{ product.product_name || product.name || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัสสินค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border overflow-x-auto">
                    <p class="text-gray-900 font-mono text-xs sm:text-sm whitespace-nowrap">{{ product.product_code || product.sku || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <div class="p-3 bg-gray-50 rounded-lg border overflow-x-auto">
                    <p class="text-gray-900 font-mono text-xs sm:text-sm whitespace-nowrap">{{ product.sku || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 text-sm sm:text-base">{{ formatCategory(product.category) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span
                      :class="getStatusClass(product.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ formatStatus(product.status) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หน่วยนับ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 text-sm sm:text-base">{{ product.unit || 'ชิ้น' }}</p>
                  </div>
                </div>
                <div class="sm:col-span-2" v-if="product.description">
                  <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 break-words text-sm sm:text-base">{{ product.description || 'ไม่มีคำอธิบาย' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing & Inventory -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">ราคาและสต็อก</h3>
            </div>
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ราคาต่อหน่วย</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-lg">{{ formatCurrency(product.unit_price) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สต็อกปัจจุบัน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium" :class="getStockLevelClass(currentStock, product.min_stock)">
                      {{ formatNumber(currentStock) }} {{ product.unit || 'ชิ้น' }}
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สต็อกขั้นต่ำ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatNumber(product.min_stock) }} {{ product.unit || 'ชิ้น' }}</p>
                  </div>
                </div>
              </div>

              <!-- Stock Alert -->
              <div v-if="showStockAlert" class="mt-6 p-4 rounded-lg" :class="getStockAlertClass()">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i :class="stockAlertIcon" class="text-lg"></i>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium">{{ stockAlertTitle }}</h3>
                    <div class="mt-1 text-sm">{{ stockAlertMessage }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Supplier Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลผู้จำหน่าย</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้จำหน่าย</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ product.supplier || 'ไม่ระบุผู้จำหน่าย' }}</p>
                    <p v-if="product.supplier_id" class="text-xs text-gray-500 font-mono mt-1">ID: {{ product.supplier_id }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory & Balance Details -->
          <div class="bg-white rounded-lg shadow-sm" v-if="currentBalance">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                <i class="fas fa-chart-pie text-blue-600 text-sm sm:text-base"></i>
                <span class="text-sm sm:text-lg">Inventory Balance Details</span>
              </h3>
            </div>
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-green-800 mb-1">สต็อกทั้งหมด</div>
                  <div class="text-2xl font-bold text-green-900">
                    {{ formatNumber(currentBalance.qty_on_hand || 0) }}
                    <span class="text-sm font-normal">{{ product.unit || 'ชิ้น' }}</span>
                  </div>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-blue-800 mb-1">พร้อมใช้งาน</div>
                  <div class="text-2xl font-bold text-blue-900">
                    {{ formatNumber(currentBalance.qty_available || 0) }}
                    <span class="text-sm font-normal">{{ product.unit || 'ชิ้น' }}</span>
                  </div>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-yellow-800 mb-1">จองแล้ว</div>
                  <div class="text-2xl font-bold text-yellow-900">
                    {{ formatNumber(currentBalance.qty_reserved || 0) }}
                    <span class="text-sm font-normal">{{ product.unit || 'ชิ้น' }}</span>
                  </div>
                </div>
                
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-purple-800 mb-1">มูลค่าสต็อกรวม</div>
                  <div class="text-xl font-bold text-purple-900">
                    {{ formatCurrency(currentBalance.total_cost_value || 0) }}
                  </div>
                </div>
                
                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-indigo-800 mb-1">ต้นทุนเฉลี่ย</div>
                  <div class="text-xl font-bold text-indigo-900">
                    {{ formatCurrency(currentBalance.weighted_avg_cost || 0) }}
                  </div>
                </div>
                
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="text-sm font-medium text-gray-800 mb-1">Movement ล่าสุด</div>
                  <div class="text-sm font-semibold text-gray-900">
                    {{ currentBalance.last_movement_date ? formatDateTime(currentBalance.last_movement_date) : 'ไม่มี' }}
                  </div>
                </div>
              </div>
              
              <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">รายการเข้า</div>
                  <div class="text-lg font-semibold text-green-600">{{ formatNumber(activityHistory.filter(h => h.type === 'stock_in').length) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">รายการออก</div>
                  <div class="text-lg font-semibold text-red-600">{{ formatNumber(activityHistory.filter(h => h.type === 'stock_out').length) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">จำนวน Location</div>
                  <div class="text-lg font-semibold text-blue-600">{{ formatNumber(locationData.length || 0) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stock Reservations -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <i class="fas fa-lock text-orange-600 text-sm sm:text-base"></i>
                  <span>การจองสินค้า</span>
                </h3>
                <button 
                  @click="debugInventoryData"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap"
                  title="Debug Inventory Data"
                >
                  <i class="fas fa-bug mr-1"></i>
                  Debug
                </button>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div v-if="stockReservations && stockReservations.length > 0">
                <div class="space-y-3">
                  <div 
                    v-for="(reservation, index) in stockReservations" 
                    :key="reservation._id || index"
                    class="border border-orange-200 rounded-lg p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div class="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                      <!-- Left: Product & Lot Info -->
                      <div class="flex-1 w-full overflow-hidden">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                          <i class="fas fa-lock text-orange-600 text-sm"></i>
                          <span class="font-semibold text-orange-800 text-sm sm:text-base break-words">
                            {{ reservation.lot_info?.product_name || product.product_name || product.name }}
                          </span>
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                            <i class="fas fa-tag mr-1"></i>
                            Lot: {{ reservation.lot_info?.lot_id || reservation.lot_id }}
                          </span>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 mt-2">
                          <div>
                            <i class="fas fa-ruler text-gray-500 mr-1"></i>
                            <span class="font-semibold">{{ reservation.reserved_meters?.toFixed(2) || 0 }} เมตร</span>
                          </div>
                          <div v-if="reservation.lot_info?.supplier">
                            <i class="fas fa-truck text-gray-500 mr-1"></i>
                            {{ reservation.lot_info.supplier }}
                          </div>
                          <div v-if="reservation.lot_info?.receive_date">
                            <i class="far fa-calendar text-gray-500 mr-1"></i>
                            {{ formatDate(reservation.lot_info.receive_date) }}
                          </div>
                          <div v-if="reservation.reference_type && reservation.reference_id" class="overflow-x-auto">
                            <i class="fas fa-file-alt text-gray-500 mr-1"></i>
                            <span class="font-mono text-xs whitespace-nowrap">{{ reservation.reference_id }}</span>
                          </div>
                          <div class="overflow-x-auto">
                            <i class="far fa-clock text-gray-500 mr-1"></i>
                            <span class="text-xs sm:text-sm whitespace-nowrap">{{ formatDateTime(reservation.created_at) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Right: Status Badge -->
                      <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto sm:ml-4">
                        <span 
                          v-if="reservation.status === 'paid'"
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          <i class="fas fa-check-circle mr-1"></i>
                          ชำระแล้ว
                        </span>
                        <span 
                          v-else-if="reservation.status === 'not_paid'"
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          <i class="fas fa-clock mr-1"></i>
                          รอชำระ
                        </span>
                        <span 
                          v-else
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {{ reservation.status }}
                        </span>

                        <!-- Expiry Warning (only for not_paid) -->
                        <div 
                          v-if="reservation.status === 'not_paid' && reservation.expiry_date"
                          class="text-xs text-orange-600 flex items-center gap-1"
                        >
                          <i class="fas fa-exclamation-triangle"></i>
                          <span>หมดอายุ {{ formatDate(reservation.expiry_date) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="reservation.notes" class="mt-2 pt-2 border-t border-orange-200 text-sm text-gray-700">
                      <i class="fas fa-sticky-note text-gray-500 mr-1"></i>
                      <span class="text-gray-600">หมายเหตุ:</span> {{ reservation.notes }}
                    </div>
                  </div>
                </div>
                
                <div class="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <div class="text-sm text-orange-800 flex items-center justify-between">
                    <span>
                      <strong>สรุปการจอง:</strong> จองไว้ทั้งหมด {{ formatNumber(totalReservedQuantity) }} เมตร จาก {{ stockReservations.length }} รายการ
                    </span>
                    <span class="text-xs">
                      <i class="fas fa-info-circle mr-1"></i>
                      {{ stockReservations.filter(r => r.status === 'paid').length }} ชำระแล้ว / 
                      {{ stockReservations.filter(r => r.status === 'not_paid').length }} รอชำระ
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <i class="fas fa-unlock-alt text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 font-medium">ไม่มีการจองสินค้า</p>
                <p class="text-sm text-gray-500 mt-2">สินค้าทั้งหมดพร้อมใช้งาน</p>
              </div>
            </div>
          </div>

          <!-- Activity History -->
          <div class="bg-white rounded-lg shadow-sm" v-if="activityHistory && activityHistory.length > 0">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <i class="fas fa-history text-green-600 text-sm sm:text-base"></i>
                  <span>ประวัติการเคลื่อนไหว</span>
                </h3>
                <span class="text-xs sm:text-sm text-gray-500">({{ activityHistory.length }} รายการ)</span>
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <div class="space-y-4">
                <div 
                  v-for="(activity, index) in displayedActivities" 
                  :key="index"
                  class="border-l-4 pl-3 sm:pl-4 py-3 rounded-r-lg bg-gray-50"
                  :class="getActivityTypeClass(activity.type)"
                >
                  <div class="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                    <div class="flex items-start gap-2 sm:gap-3 w-full">
                      <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0" :class="getActivityIconClass(activity.type)">
                        <i :class="getActivityIcon(activity.type)"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 text-sm sm:text-base break-words">{{ activity.description }}</div>
                        <div class="text-xs text-gray-500 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
                          <span class="truncate">By: {{ activity.user }}</span>
                          <span v-if="activity.location" class="truncate">Location: {{ activity.location }}</span>
                          <span v-if="activity.reference" class="truncate font-mono">Ref: {{ activity.reference }}</span>
                          <span v-if="activity.transaction_type" class="truncate">Type: {{ activity.transaction_type }}</span>
                        </div>
                      </div>
                    </div>
                    <span class="text-xs text-gray-500 whitespace-nowrap self-start sm:self-auto">{{ formatDateTime(activity.timestamp) }}</span>
                  </div>
                  
                  <div v-if="activity.quantity" class="ml-8 sm:ml-11 text-xs sm:text-sm space-y-1">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="activity.type === 'stock_out' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                      <i :class="activity.type === 'stock_out' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" class="mr-1"></i>
                      {{ formatNumber(activity.quantity) }} {{ activity.unit || product.unit || 'ชิ้น' }}
                    </span>
                    <div v-if="activity.unit_price && activity.unit_price > 0" class="text-xs text-gray-600">
                      ราคาต่อหน่วย: {{ formatCurrency(activity.unit_price) }}
                      <span v-if="activity.total_value" class="ml-2">รวม: {{ formatCurrency(activity.total_value) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="activityHistory.length > 5" class="mt-6 text-center">
                <button @click="showAllActivity = !showAllActivity" class="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  {{ showAllActivity ? 'แสดงน้อยลง' : 'แสดงทั้งหมด' }}
                  <i :class="showAllActivity ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4 sm:space-y-6">
          <!-- Product Image -->
          <div v-if="product.product_image_url" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="aspect-square w-full bg-gray-100 flex items-center justify-center">
              <img 
                :src="product.product_image_url" 
                :alt="product.product_name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div v-if="product.product_image_source" class="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p class="text-xs text-gray-500 text-center">
                <i class="fas fa-info-circle mr-1"></i>
                {{ product.product_image_source }}
              </p>
            </div>
          </div>
          
          <!-- Status & Actions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">สถานะและการดำเนินการ</h3>
            </div>
            <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div class="text-center">
                <span
                  :class="getStatusClass(product.status)"
                  class="inline-flex px-4 py-2 text-sm font-semibold rounded-full"
                >
                  {{ formatStatus(product.status).toUpperCase() }}
                </span>
              </div>
              <div class="space-y-2">
                <router-link 
                  :to="`/inventory/products/${productId}/edit`"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                >
                  <i class="fas fa-edit mr-2"></i>
                  แก้ไขสินค้า
                </router-link>
                <button 
                  @click="refreshData"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  :disabled="loading"
                >
                  <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
                  รีเฟรชข้อมูล
                </button>
              </div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">ข้อมูลระบบ</h3>
            </div>
            <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สร้าง</label>
                <p class="text-xs sm:text-sm text-gray-600 break-words">{{ formatDateTime(product.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">อัปเดตล่าสุด</label>
                <p class="text-xs sm:text-sm text-gray-600 break-words">{{ formatDateTime(product.updated_at) }}</p>
              </div>
              <div v-if="product.id">
                <label class="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <div class="flex items-center overflow-x-auto">
                  <p class="text-xs sm:text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded mr-2 whitespace-nowrap">{{ product.id }}</p>
                  <button 
                    @click="copyToClipboard(product.id)"
                    class="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Balance Summary -->
          <div v-if="currentBalance" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-4 sm:p-6 text-white">
            <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">สรุป Balance</h3>
            <div class="space-y-2 sm:space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm opacity-90">สต็อกทั้งหมด</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(currentBalance.qty_on_hand || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm opacity-90">พร้อมใช้งาน</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(currentBalance.qty_available || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm opacity-90">จองแล้ว</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(currentBalance.qty_reserved || 0) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm opacity-90">มูลค่ารวม</span>
                <span class="font-semibold text-xs sm:text-sm">{{ formatCurrency(currentBalance.total_cost_value || 0) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="currentBalance.weighted_avg_cost">
                <span class="text-xs sm:text-sm opacity-90">ต้นทุนเฉลี่ย</span>
                <span class="font-semibold text-xs sm:text-sm">{{ formatCurrency(currentBalance.weighted_avg_cost || 0) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="activityHistory.filter(h => h.type === 'stock_in').length > 0">
                <span class="text-xs sm:text-sm opacity-90">รายการเข้า</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(activityHistory.filter(h => h.type === 'stock_in').length) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="activityHistory.filter(h => h.type === 'stock_out').length > 0">
                <span class="text-xs sm:text-sm opacity-90">รายการออก</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(activityHistory.filter(h => h.type === 'stock_out').length) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="locationData.length > 0">
                <span class="text-xs sm:text-sm opacity-90">จำนวน Location</span>
                <span class="font-semibold text-sm sm:text-base">{{ formatNumber(locationData.length) }}</span>
              </div>
              <div class="flex justify-between items-center" v-if="currentBalance.last_movement_date">
                <span class="text-xs sm:text-sm opacity-90">Movement ล่าสุด</span>
                <span class="font-semibold text-xs sm:text-sm break-words text-right">{{ formatDate(currentBalance.last_movement_date) }}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="bg-white rounded-lg shadow-sm p-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่พบข้อมูลสินค้า</h3>
          <p class="text-gray-600 mb-6">ไม่สามารถโหลดข้อมูลสินค้าที่ต้องการดูได้</p>
          <router-link to="/inventory/products" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center">
            <i class="fas fa-arrow-left mr-2"></i>
            กลับไปหน้าจัดการสินค้า
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import ProductLotSummary from '../../shared/ProductLotSummary.vue'

export default {
  name: 'ProductView',
  components: {
    ProductLotSummary
  },
  setup() {
    const route = useRoute()
    
    // State
    const loading = ref(false)
    const product = ref(null)
    const currentStock = ref(0)
    const currentBalance = ref(null) // เพิ่ม Balance data
    const activityHistory = ref([])
    const showAllActivity = ref(false)
    const stockReservations = ref([]) // เพิ่มการจองสินค้า
    const locationData = ref([]) // เพิ่ม Location data
    
    // Document Preview States
    const showDocumentMenu = ref(false)
    const showDocumentPreview = ref(false)
    const currentDocumentType = ref('')
    const currentDocumentData = ref(null)
    const currentDocumentTitle = ref('')
    
    // Computed
    const productId = computed(() => route.params.id)
    
    const displayedActivities = computed(() => {
      if (showAllActivity.value) {
        return activityHistory.value
      }
      return activityHistory.value.slice(0, 5)
    })
    
    const stockAlertType = computed(() => {
      const stock = currentStock.value
      const minStock = product.value?.min_stock || 0
      
      if (stock === 0) return 'alert-danger'
      if (stock <= minStock * 0.5) return 'alert-warning'
      if (stock <= minStock) return 'alert-info'
      return 'alert-success'
    })
    
    const showStockAlert = computed(() => {
      const stock = currentStock.value
      const minStock = product.value?.min_stock || 0
      return stock <= minStock
    })
    
    const stockAlertIcon = computed(() => {
      const stock = currentStock.value
      if (stock === 0) return 'fas fa-times-circle'
      if (stock <= (product.value?.min_stock || 0)) return 'fas fa-exclamation-triangle'
      return 'fas fa-check-circle'
    })
    
    const stockAlertTitle = computed(() => {
      const stock = currentStock.value
      const minStock = product.value?.min_stock || 0
      
      if (stock === 0) return 'สินค้าหมด'
      if (stock <= minStock * 0.5) return 'สต็อกต่ำมาก'
      if (stock <= minStock) return 'สต็อกใกล้หมด'
      return 'สต็อกปกติ'
    })
    
    const stockAlertMessage = computed(() => {
      const stock = currentStock.value
      const minStock = product.value?.min_stock || 0
      const unit = product.value?.unit || 'ชิ้น'
      
      if (stock === 0) {
        return `สินค้าหมดสต็อก กรุณาเติมสต็อกให้อย่างน้อย ${minStock} ${unit}`
      }
      if (stock <= minStock * 0.5) {
        return `สต็อกต่ำมาก เหลือเพียง ${stock} ${unit} (ต่ำกว่า 50% ของขั้นต่ำ)`
      }
      if (stock <= minStock) {
        return `สต็อกใกล้หมด เหลือ ${stock} ${unit} (ขั้นต่ำ: ${minStock} ${unit})`
      }
      return `สต็อกเพียงพอ มี ${stock} ${unit} (ขั้นต่ำ: ${minStock} ${unit})`
    })
    
    const totalReservedQuantity = computed(() => {
      return stockReservations.value.reduce((total, reservation) => {
        // ✅ Use reserved_meters for new lot-based reservation system
        return total + (reservation.reserved_meters || reservation.quantity || 0)
      }, 0)
    })
    
    const isTextileProduct = computed(() => {
      if (!product.value) return false
      return product.value.category === 'textile' || 
             product.value.category === 'fabric' ||
             product.value.is_textile ||
             product.value.enable_lot_tracking
    })
    
    // Methods
    const formatStatus = (status) => {
      const statusLabels = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'discontinued': 'หยุดผลิต',
        'draft': 'ร่าง'
      }
      return statusLabels[status] || status
    }
    
    const getStatusIcon = (status) => {
      const statusIcons = {
        'active': 'fas fa-check-circle',
        'inactive': 'fas fa-pause-circle',
        'discontinued': 'fas fa-times-circle',
        'draft': 'fas fa-edit'
      }
      return statusIcons[status] || 'fas fa-question-circle'
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-blue-100 text-blue-800',
        discontinued: 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'ไม่ระบุ'
      }
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'ไม่ระบุ'
      }
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }
    
    // Get InventoryService reference
    // const inventoryService = window.ERP_CORE.inventory (ไม่ใช้แล้ว - ใช้ method แทน)
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }
    
    const formatCategory = (category) => {
      const categoryLabels = {
        'electronics': 'อิเล็กทรอนิกส์',
        'clothing': 'เสื้อผ้าและแฟชั่น',
        'food': 'อาหารและเครื่องดื่ม',
        'books': 'หนังสือและสื่อการเรียน',
        'home': 'บ้านและสวน',
        'beauty': 'ความงามและสุขภาพ',
        'sports': 'กีฬาและออกกำลังกาย',
        'automotive': 'ยานยนต์',
        'health': 'การแพทย์และสุขภาพ',
        'general': 'ทั่วไป'
      }
      return categoryLabels[category] || category
    }
    
    const getStockLevelClass = (stock, minStock) => {
      if (stock === 0) return 'text-red-600'
      if (stock <= minStock * 0.5) return 'text-orange-600'
      if (stock <= minStock) return 'text-yellow-600'
      return 'text-green-600'
    }
    
    const getStockAlertClass = () => {
      const stock = currentStock.value
      const minStock = product.value?.min_stock || 0
      
      if (stock === 0) return 'bg-red-50 border-l-4 border-red-400 text-red-700'
      if (stock <= minStock * 0.5) return 'bg-orange-50 border-l-4 border-orange-400 text-orange-700'
      if (stock <= minStock) return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700'
      return 'bg-green-50 border-l-4 border-green-400 text-green-700'
    }
    
    const getStockIcon = (stock, minStock) => {
      if (stock === 0) return 'fas fa-times-circle'
      if (stock <= minStock * 0.5) return 'fas fa-exclamation-triangle'
      if (stock <= minStock) return 'fas fa-exclamation-circle'
      return 'fas fa-check-circle'
    }
    
    const getActivityTypeClass = (type) => {
      const typeClasses = {
        create: 'border-green-400',
        created: 'border-green-400',
        update: 'border-blue-400',
        updated: 'border-blue-400',
        status: 'border-yellow-400',
        delete: 'border-red-400'
      }
      return typeClasses[type] || 'border-gray-400'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        'created': 'fas fa-plus-circle',
        'updated': 'fas fa-edit',
        'stock_in': 'fas fa-arrow-down',
        'stock_out': 'fas fa-arrow-up',
        'adjustment': 'fas fa-balance-scale',
        'transfer': 'fas fa-exchange-alt'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const getActivityIconClass = (type) => {
      const classes = {
        'created': 'bg-green-500',
        'updated': 'bg-blue-500',
        'stock_in': 'bg-green-600',
        'stock_out': 'bg-red-600',
        'adjustment': 'bg-purple-500',
        'transfer': 'bg-yellow-500'
      }
      return classes[type] || 'bg-gray-500'
    }
    
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        console.log('📋 Copied to clipboard:', text)
        
        if (window.$toast) {
          window.$toast.success('คัดลอกแล้ว: ' + text)
        }
      } catch (error) {
        console.error('❌ Failed to copy:', error)
        
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (window.$toast) {
          window.$toast.info('คัดลอกแล้ว')
        }
      }
    }
    
    const loadProduct = async () => {
      if (!productId.value) {
        console.error('❌ No product ID provided')
        return
      }
      
      loading.value = true
      
      try {
        console.log('🔄 Loading product with complete inventory data:', productId.value)
        
        // ✅ ใช้ฟังก์ชันใหม่ที่ดึงข้อมูลครบถ้วนในคำขอเดียว
        const productData = await window.ERP_CORE.inventory.getProductWithInventoryData(productId.value)
        
        if (productData) {
          product.value = productData
          console.log('✅ Product with complete inventory data loaded:', productData)
          
          // ✅ ข้อมูลครบถ้วนดึงมาพร้อมกันแล้ว - ไม่ต้องเรียก API เพิ่ม
          // Set data from aggregated result
          currentStock.value = productData.current_stock || 0
          currentBalance.value = productData.balance || null
          locationData.value = productData.locations || []
          stockReservations.value = productData.reservations || []
          
          // ✅ แปลงข้อมูล movements เป็น activityHistory ที่สมบูรณ์
          if (productData.movements && productData.movements.length > 0) {
            activityHistory.value = productData.movements.map(movement => {
              return {
                id: movement._id || movement.id,
                type: movement.movement_type === 'IN' ? 'stock_in' : 'stock_out',
                description: movement.notes || `${movement.transaction_type} - ${movement.movement_type}`,
                quantity: movement.quantity,
                unit: movement.unit,
                user: movement.created_by || movement.updated_by || 'ระบบ',
                timestamp: movement.movement_date || movement.created_at,
                location: movement.location_code,
                reference: movement.reference_number || movement.reference_id,
                reference_type: movement.reference_type,
                transaction_type: movement.transaction_type,
                unit_price: movement.unit_price,
                total_value: movement.total_value,
                status: movement.status,
                raw_data: movement // เก็บข้อมูลต้นฉบับไว้
              }
            })
          } else {
            activityHistory.value = []
          }
          
          console.log('📊 Inventory Summary:', {
            stock: productData.current_stock,
            available: productData.available_stock,
            reserved: productData.reserved_stock,
            locations: productData.total_locations,
            movements: productData.total_movements
          })
          
          // เหลือเพียง Load activity history เพิ่มเติมจาก transaction log (ถ้าต้องการ)
          // await loadActivityHistory() // ไม่จำเป็นแล้ว เพราะมี movements มาในข้อมูลเบื้องต้น
        } else {
          throw new Error('ไม่พบข้อมูลสินค้า')
        }
        
      } catch (error) {
        console.error('❌ Error loading product:', error)
        product.value = null
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้: ' + error.message)
        }
      } finally {
        loading.value = false
      }
    }

    const debugInventoryData = async () => {
      console.log('🐛 === DEBUG INVENTORY DATA ===')
      console.log('📦 Product:', product.value)
      console.log('📊 Current Stock:', currentStock.value)
      console.log('💰 Current Balance:', currentBalance.value)
      
      try {
        // Use InventoryService method instead of direct engine call
        const inventoryData = await window.ERP_CORE.inventory.getAllInventoryForDebug()
        
        console.log('📋 All Inventory Records:', inventoryData.length)
        console.log('🔍 Sample inventory records:', inventoryData.slice(0, 3))
        
        // Filter for this product
        const productRecords = inventoryData.filter(item => 
          item.product_id === product.value?.id ||
          item.product_sku === product.value?.sku ||
          item.sku === product.value?.sku
        )
        
        console.log('🎯 Product-specific inventory records:', productRecords.length)
        console.log('📝 Product records:', productRecords)
        
        // Show reservations specifically
        const reservations = productRecords.filter(item => 
          item.transaction_type === 'RESERVATION' ||
          item.notes?.includes('จอง') ||
          item.reference_type === 'SALES_ORDER'
        )
        
        console.log('🔒 Current reservations:', reservations.length)
        console.log('📋 Reservation details:', reservations)
        
        // Check balance using InventoryService
        const balanceData = await window.ERP_CORE.inventory.getInventoryBalance(product.value?.id)
        
        console.log('💰 Balance Records via InventoryService:', balanceData.length)
        
        const productBalance = balanceData.filter(b => 
          b.product_id === product.value?.id ||
          b.product_sku === product.value?.sku ||
          b.sku === product.value?.sku
        )
        
        console.log('💰 Product Balance:', productBalance)
        
        if (window.$toast) {
          window.$toast.info(`Debug: พบ ${productRecords.length} รายการ, ${reservations.length} การจอง - ดูใน Console`)
        }
        
      } catch (error) {
        console.error('❌ Debug error:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการ debug: ' + error.message)
        }
      }
    }
    
    const refreshData = async () => {
      await loadProduct()
      
      if (window.$toast) {
        window.$toast.success('รีเฟรชข้อมูลแล้ว')
      }
    }
    
    const handleImageError = (event) => {
      console.warn('Image failed to load:', event.target.src)
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'
    }
    
    // Document Preview Functions
    const toggleDocumentMenu = () => {
      showDocumentMenu.value = !showDocumentMenu.value
    }
    
    const previewDocument = (documentType) => {
      showDocumentMenu.value = false
      
      if (!product.value) {
        if (window.$toast) {
          window.$toast.error('ไม่พบข้อมูลสินค้า')
        }
        return
      }
      
      try {
        // ใช้ ERP_CORE.documents.generateDocumentData
        const core = window.ERP_CORE
        const documentData = core.documents.generateDocumentData(product.value, documentType, {
          status: 'draft'
        })
        
        currentDocumentType.value = documentType
        currentDocumentData.value = documentData
        currentDocumentTitle.value = core.documents.getDocumentTitle(documentType)
        showDocumentPreview.value = true
        
      } catch (error) {
        console.error('Error generating document:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการสร้างเอกสาร')
        }
      }
    }
    
    const closeDocumentPreview = () => {
      showDocumentPreview.value = false
      currentDocumentType.value = ''
      currentDocumentData.value = null
      currentDocumentTitle.value = ''
    }
    
    const handleDocumentPrint = (documentInfo) => {
      console.log('🖨️ Printing document:', documentInfo)
      if (window.$toast) {
        window.$toast.success(`ส่งคำสั่งพิมพ์${documentInfo.type}แล้ว!`)
      }
    }
    
    const handleDocumentDownload = (documentInfo) => {
      console.log('📥 Downloading document:', documentInfo)
      if (window.$toast) {
        window.$toast.success(`ดาวน์โหลด${documentInfo.type}แล้ว!`)
      }
    }
    
    const handleDocumentError = (error) => {
      console.error('❌ Document error:', error)
      if (window.$toast) {
        window.$toast.error('เกิดข้อผิดพลาดในการแสดงเอกสาร')
      }
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      showDocumentMenu.value = false
    }
    
    // StockCard Event Handlers
    const onQRGenerated = (qrData) => {
      console.log('📱 QR Code generated:', qrData)
      if (window.$toast) {
        window.$toast.success('QR Code สร้างเสร็จแล้ว!')
      }
    }
    
    const onCardPrinted = (product) => {
      console.log('🖨️ Stock Card printed for product:', product?.product_name)
      if (window.$toast) {
        window.$toast.success('ส่งคำสั่งพิมพ์ Stock Card แล้ว!')
      }
    }
    
    const onCardDownloaded = (data) => {
      console.log('📥 Stock Card downloaded:', data?.filename)
      if (window.$toast) {
        window.$toast.success(`ดาวน์โหลด ${data?.filename} เสร็จแล้ว!`)
      }
    }
    
    const onDataCopied = (data) => {
      console.log('📋 Stock Card data copied:', data?.sku)
      if (window.$toast) {
        window.$toast.success('คัดลอกข้อมูล Stock Card เสร็จแล้ว!')
      }
    }
    
    // Watchers
    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadProduct()
      }
    })
    
    // Lifecycle
    onMounted(() => {
      // ✅ Initialize InventoryService with component instance
      if (window.ERP_CORE?.inventory) {
        try {
          const instance = getCurrentInstance()
          const componentProxy = instance?.proxy || instance
          
          window.ERP_CORE.inventory.initialize(componentProxy)
          console.log('[Product Detail] ✅ InventoryService initialized')
        } catch (error) {
          console.error('[Product Detail] ❌ Failed to initialize InventoryService:', error)
        }
      }
      
      if (productId.value) {
        loadProduct()
      }
      // Add click outside handler
      document.addEventListener('click', handleClickOutside)
    })
    
    // Cleanup on unmount
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      loading,
      product,
      productId,
      currentStock,
      currentBalance,
      activityHistory,
      showAllActivity,
      displayedActivities,
      stockReservations,
      totalReservedQuantity,
      isTextileProduct,
      locationData,
      showStockAlert,
      stockAlertType,
      stockAlertIcon,
      stockAlertTitle,
      stockAlertMessage,
      formatStatus,
      getStatusIcon,
      getStatusClass,
      formatDateTime,
      formatDate,
      formatCurrency,
      formatNumber,
      formatCategory,
      getStockLevelClass,
      getStockAlertClass,
      getStockIcon,
      getActivityTypeClass,
      getActivityIcon,
      getActivityIconClass,
      copyToClipboard,
      refreshData,
      debugInventoryData,
      handleImageError,
      // Document Preview
      showDocumentMenu,
      showDocumentPreview,
      currentDocumentType,
      currentDocumentData,
      currentDocumentTitle,
      toggleDocumentMenu,
      previewDocument,
      closeDocumentPreview,
      handleDocumentPrint,
      handleDocumentDownload,
      handleDocumentError,
      // StockCard event handlers
      onQRGenerated,
      onCardPrinted,
      onCardDownloaded,
      onDataCopied
    }
  }
}
</script>

<style scoped>
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

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeInUp 0.3s ease-out;
}

/* Balance cards hover effects */
.bg-green-50:hover {
  background-color: rgb(240 253 244);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.bg-blue-50:hover {
  background-color: rgb(239 246 255);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.bg-yellow-50:hover {
  background-color: rgb(255 251 235);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.bg-purple-50:hover {
  background-color: rgb(250 245 255);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.bg-indigo-50:hover {
  background-color: rgb(238 242 255);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Activity timeline improvements */
.border-l-4 {
  border-left-width: 4px;
  position: relative;
}

.border-l-4::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  border: 2px solid currentColor;
  transform: translateY(-50%);
}

/* Stock reservation styling */
.bg-orange-50 {
  border-left: 4px solid #f97316;
}

/* Debug button styling */
.bg-gray-500:hover {
  background-color: #6b7280;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .grid.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .md\:col-span-2 {
    grid-column: span 1;
  }
  
  .lg\:col-span-2 {
    grid-column: span 1;
  }
  
  .lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>