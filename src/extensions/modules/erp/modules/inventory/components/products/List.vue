<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Product Management</h1>
            <p class="mt-2 text-gray-600">จัดการข้อมูลสินค้าและ Product Master</p>
          </div>
          <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3">
            <button 
              @click="refreshBalance"
              :disabled="loading || refreshingBalance"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              title="รีเฟรชข้อมูล Balance เท่านั้น"
            >
              <i class="fas fa-chart-bar" :class="{ 'fa-spin': refreshingBalance }"></i>
              <span class="hidden sm:inline sm:ml-2">รีเฟรช Balance</span>
            </button>
            
            <button 
              @click="refreshProducts"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i>
              <span class="hidden sm:inline sm:ml-2">รีเฟรชทั้งหมด</span>
            </button>
            
            <router-link 
              to="/inventory/products/add"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-plus"></i>
              <span class="hidden sm:inline sm:ml-2">เพิ่มสินค้าใหม่</span>
            </router-link>
            
            <button 
              @click="exportData"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline sm:ml-2">Export</span>
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
                <span class="text-sm font-medium text-gray-500">จัดการสินค้า</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col gap-4">
          <!-- First Row: Search, Category, Lot Tracking, Status -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative flex gap-2">
                <div class="relative flex-1">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="ค้นหาด้วย SKU, ชื่อสินค้า, ผู้จำหน่าย, รหัส Lot (เต็ม) หรือ Lot Code..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @input="onSearchInput"
                  />
                  <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <span v-if="searchingLots" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <i class="fas fa-spinner fa-spin text-blue-500"></i>
                  </span>
                </div>
                <button
                  @click="openBarcodeScanner"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="สแกน Barcode ด้วยกล้อง"
                >
                  <i class="fas fa-camera text-lg"></i>
                </button>
              </div>
              <p v-if="lotSearchResult" class="mt-1 text-xs text-green-600">
                <i class="fas fa-check-circle mr-1"></i>
                พบ {{ lotMatchedProductIds.length }} สินค้าจากการค้นหา Lot
              </p>
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
              <select 
                v-model="filterCategory"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทุกหมวดหมู่</option>
                <option value="textile">สิ่งทอและผ้า</option>
                <option value="fabric">ผ้าดิบ</option>
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Clothing & Fashion">Clothing & Fashion</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
              </select>
            </div>

            <!-- Lot Tracking Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Lot Tracking</label>
              <select 
                v-model="filterLotTracking"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทุกประเภท</option>
                <option value="enabled">มี Lot Tracking</option>
                <option value="disabled">ไม่มี Lot Tracking</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select 
                v-model="filterStatus"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="discontinued">หยุดผลิต</option>
                <option value="draft">ร่าง</option>
                <option value="deleted">ถูกลบแล้ว (Soft Deleted)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredProducts.length }} products found</span>
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">View:</label>
            <button 
              @click="viewMode = 'table'"
              :class="[
                'p-2 rounded-lg',
                viewMode === 'table' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-table"></i>
            </button>
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
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedProducts.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-blue-800 font-medium">
            {{ selectedProducts.length }} product{{ selectedProducts.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex space-x-2">
            <button 
              @click="bulkAction('activate')"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Activate
            </button>
            <button 
              @click="bulkAction('deactivate')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Deactivate
            </button>
            <button 
              @click="bulkAction('delete')"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Products Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">ไม่พบข้อมูลสินค้า</h3>
        <p v-if="searchQuery" class="text-gray-600 mb-6">ไม่พบสินค้าที่ตรงกับ "{{ searchQuery }}"</p>
        <p v-else class="text-gray-600 mb-6">ยังไม่มีข้อมูลสินค้าในระบบ</p>
        <button @click="addNewProduct" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center">
          <i class="fas fa-plus mr-2"></i>
          เพิ่มสินค้าแรก
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="product in paginatedProducts" 
          :key="product.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
          @click="viewProductDetails(product)"
        >
          <!-- Product Image -->
          <div class="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img 
              v-if="product.product_image_url"
              :src="product.product_image_url" 
              :alt="product.product_name"
              class="w-full h-full object-cover"
              @error="$event.target.src = ''"
            />
            <div v-else class="text-center text-gray-400">
              <i class="fas fa-image text-4xl mb-2"></i>
              <p class="text-xs">ไม่มีรูปภาพ</p>
            </div>
          </div>
          
          <!-- Product Info -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ product.product_name }}</h3>
                <p class="text-sm text-gray-500 font-mono">{{ product.sku }}</p>
                <p v-if="product.product_code" class="text-xs text-gray-400 font-mono">{{ product.product_code }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :checked="selectedProducts.includes(product.id)"
                  @change="toggleProductSelection(product.id)"
                  @click.stop
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div class="relative">
                  <button 
                    @click.stop="toggleDropdown(product.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <div 
                    v-if="dropdownOpen === product.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  >
                    <div class="py-1">
                      <button 
                        @click="editProduct(product)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fas fa-edit mr-2"></i>Edit
                      </button>
                      <button 
                        @click="duplicateProduct(product)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fas fa-copy mr-2"></i>Duplicate
                      </button>
                      <button 
                        @click="deleteProduct(product)"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <i class="fas fa-trash mr-2"></i>Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <p class="text-sm text-gray-600">
                <i class="fas fa-tag mr-2"></i>
                {{ product.category || 'General' }}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-building mr-2"></i>
                {{ product.supplier || 'ไม่ระบุ' }}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-boxes mr-2"></i>
                <span :class="getStockLevelClass(product)">{{ formatNumber(product.balance?.qty_on_hand || 0) }}</span>
                {{ product.unit || 'ชิ้น' }} 
                <span class="text-gray-400">(min: {{ product.min_stock || 0 }})</span>
              </p>
            </div>

            <div class="flex items-center justify-between">
              <span 
                :class="getStatusClass(product.status)"
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getStatusLabel(product.status) }}
              </span>
              <div class="text-right">
                <div class="text-lg font-semibold text-gray-900">
                  {{ formatPrice(product.unit_price) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatPrice(product.balance?.total_cost_value || 0) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table View -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full divide-y divide-gray-200 min-w-max">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allProductsSelected"
                  @change="toggleAllProducts"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                รูป
              </th>
              <th @click="sortBy('sku')" class="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                SKU
                <i class="fas fa-sort ml-1" :class="getSortIcon('sku')"></i>
              </th>
              <th @click="sortBy('product_name')" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                ชื่อสินค้า
                <i class="fas fa-sort ml-1" :class="getSortIcon('product_name')"></i>
              </th>
              <th class="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                หมวด
              </th>
              <th class="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                ซัพพลายเออร์
              </th>
              <th @click="sortBy('unit_price')" class="w-24 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                ราคา
                <i class="fas fa-sort ml-1" :class="getSortIcon('unit_price')"></i>
              </th>
              <th @click="sortBy('qty_on_hand')" class="w-20 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                คลัง
                <i class="fas fa-sort ml-1" :class="getSortIcon('qty_on_hand')"></i>
              </th>
              <th class="w-24 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                มูลค่า
              </th>
              <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                สถานะ
              </th>
              <th class="w-24 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                จัดการ
              </th>
            </tr>
          </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="product in paginatedProducts" 
                :key="product.id"
                :class="[
                  'cursor-pointer transition-colors',
                  product.status === 'deleted' 
                    ? 'bg-red-50 hover:bg-red-100' 
                    : 'hover:bg-gray-50'
                ]"
                @click="viewProductDetails(product)"
              >
                <td class="w-12 px-3 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.includes(product.id)"
                    @change="toggleProductSelection(product.id)"
                    @click.stop
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="w-16 px-3 py-3">
                  <div v-if="product.product_image_url" class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      :src="product.product_image_url" 
                      :alt="product.product_name"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  <div v-else class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-image text-gray-400 text-xl"></i>
                  </div>
                </td>
                <td class="w-28 px-3 py-3">
                  <div class="text-xs font-mono font-medium text-gray-900 truncate">{{ product.sku }}</div>
                  <div v-if="product.product_code" class="text-xs font-mono text-gray-500 truncate">{{ product.product_code }}</div>
                </td>
                <td class="px-3 py-3">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ product.product_name }}</div>
                  <div v-if="product.description" class="text-xs text-gray-500 truncate">{{ product.description }}</div>
                </td>
                <td class="w-20 px-3 py-3">
                  <span class="inline-flex px-1 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 truncate">
                    {{ (product.category || 'General').substring(0, 6) }}
                  </span>
                </td>
                <td class="w-32 px-3 py-3">
                  <div class="text-sm text-gray-900 truncate">{{ (product.supplier || 'ไม่ระบุ').substring(0, 12) }}</div>
                  <div v-if="product.supplier_id" class="text-xs text-gray-500 truncate">{{ product.supplier_id.substring(0, 8) }}</div>
                </td>
                <td class="w-24 px-3 py-3 text-right">
                  <div class="text-sm font-medium text-gray-900">{{ formatPrice(product.unit_price) }}</div>
                  <div class="text-xs text-gray-500">{{ product.unit || 'ชิ้น' }}</div>
                </td>
                <td class="w-20 px-3 py-3 text-center">
                  <div v-if="product.balance !== undefined" class="text-center">
                    <div class="text-sm font-medium" :class="getStockLevelClass(product)">
                      {{ formatNumber(product.balance?.qty_on_hand || 0) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ product.unit || 'ชิ้น' }}
                    </div>
                    <div class="text-xs text-gray-400">
                      ({{ product.min_stock || 0 }})
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <i class="fas fa-sync fa-spin text-gray-400 text-xs"></i>
                  </div>
                </td>
                <td class="w-24 px-3 py-3 text-center">
                  <div v-if="product.balance !== undefined">
                    <div class="text-xs font-medium text-green-600">
                      {{ formatPrice(product.balance?.total_cost_value || 0).substring(0, 6) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatPrice(product.balance?.weighted_avg_cost || 0).substring(0, 5) }}
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <i class="fas fa-sync fa-spin text-gray-400 text-xs"></i>
                  </div>
                </td>
                <td class="w-16 px-3 py-3">
                  <span 
                    :class="getStatusClass(product.status)"
                    class="inline-flex px-1 py-1 text-xs font-medium rounded"
                  >
                    {{ getStatusLabel(product.status).substring(0, 3) }}
                  </span>
                </td>
                <td class="w-24 px-3 py-3 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-1">
                    <button 
                      @click.stop="editProduct(product)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      @click.stop="duplicateProduct(product)"
                      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="สำเนา"
                    >
                      <i class="fas fa-copy text-xs"></i>
                    </button>
                    
                    <!-- แสดงปุ่มลบสำหรับสินค้าที่ยังไม่ถูก delete -->
                    <button 
                      v-if="product.status !== 'deleted'"
                      @click.stop="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="ลบ"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                    
                    <!-- แสดงปุ่มกู้คืนสำหรับสินค้าที่ถูก delete -->
                    <button 
                      v-if="product.status === 'deleted'"
                      @click.stop="restoreProduct(product)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="กู้คืน"
                    >
                      <i class="fas fa-undo text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
      </div>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm mt-6">
        <div class="text-sm text-gray-500">
          Showing {{ startItem }} to {{ endItem }} 
          of {{ filteredProducts.length }} results
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Product Form Modal -->
    <ProductForm 
      v-if="showProductForm"
      :mode="formMode"
      :product="selectedProduct"
      @save="onProductSaved"
      @cancel="closeProductForm"
    />

    <!-- Product Details Modal -->
    <ProductDetails 
      v-if="showProductDetails"
      :product="selectedProduct"
      @edit="editProduct"
      @close="closeProductDetails"
    />

    <!-- Barcode Scanner Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBarcodeScanner" class="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-0 sm:p-4 overflow-hidden" @click.self="closeBarcodeScanner">
          <!-- Mobile: Full height, Desktop: Centered Modal -->
          <div class="bg-white w-full h-full sm:h-auto sm:rounded-lg sm:shadow-xl sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden max-w-[100vw]" @click.stop>
            <!-- Modal Header -->
            <div :class="scannerMode === 'cut' ? 'bg-red-600' : 'bg-indigo-600'" class="text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <h3 class="text-base font-semibold flex items-center">
                <i :class="scannerMode === 'cut' ? 'fas fa-cut' : 'fas fa-camera'" class="mr-2"></i>
                <span v-if="scannerMode === 'cut'">ตัดสต็อค</span>
                <span v-else>{{ scannedProduct ? 'พบสินค้า' : 'สแกน Barcode' }}</span>
              </h3>
              <div class="flex items-center gap-2">
                <!-- Mode Toggle Button -->
                <button 
                  @click="toggleScannerMode" 
                  :class="scannerMode === 'cut' ? 'bg-red-700 hover:bg-red-800' : 'bg-indigo-700 hover:bg-indigo-800'"
                  class="text-white transition-colors px-3 py-1.5 rounded text-sm flex items-center gap-1"
                >
                  <i :class="scannerMode === 'cut' ? 'fas fa-eye' : 'fas fa-cut'"></i>
                  <span class="hidden sm:inline">{{ scannerMode === 'cut' ? 'อ่านข้อมูล' : 'ตัดสต็อค' }}</span>
                </button>
                <button 
                  @click="closeBarcodeScanner" 
                  class="text-white hover:text-gray-200 transition-colors p-2 hover:bg-opacity-50 rounded"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="flex-1 flex flex-col overflow-hidden relative">
              <!-- Camera Preview - Compact height, fits within modal width -->
              <div class="w-full max-w-full h-64 sm:h-56 md:h-64 relative bg-gray-900 flex-shrink-0 overflow-hidden">
                <video 
                  ref="videoElement" 
                  autoplay 
                  playsinline 
                  muted
                  class="absolute inset-0 w-full h-full object-cover"
                  style="width: 100%; height: 100%;"
                ></video>
                
                <!-- Scanning Animation Overlay (no required frame) -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="scanning-line"></div>
                </div>

                <!-- Scanning Status -->
                <div v-if="scanningActive && !scannedProduct" class="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg">
                  <i class="fas fa-qrcode text-xs sm:text-sm animate-pulse"></i>
                  <span class="text-xs sm:text-sm font-medium">กำลังสแกน Barcode...</span>
                </div>

                <!-- Scanned Code Display -->
                <div v-if="scannedCode" class="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg">
                  <i class="fas fa-check-circle text-xs sm:text-sm"></i>
                  <span class="text-xs sm:text-sm font-medium font-mono">{{ scannedCode }}</span>
                </div>

                <!-- Debug Info (bottom corner) -->
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <div>{{ scanningActive ? '🟢 Active' : '🔴 Paused' }}</div>
                </div>
              </div>

              <!-- Bottom: Product & Lot Details - Scrollable -->
              <div class="flex-1 overflow-y-auto bg-gray-50">
                <!-- Loading State -->
                <div v-if="loadingScannedProduct" class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
                    <p class="text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-else-if="scanError" class="flex items-center justify-center h-full p-6">
                  <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
                    <div class="flex items-start gap-3">
                      <i class="fas fa-exclamation-triangle text-red-600 text-2xl mt-1"></i>
                      <div>
                        <p class="font-semibold text-red-800 mb-1">ไม่พบสินค้า</p>
                        <p class="text-sm text-red-700">{{ scanError }}</p>
                        <button
                          @click="resetScanner"
                          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <i class="fas fa-redo mr-2"></i>
                          สแกนใหม่
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Instructions (when no scan yet) -->
                <div v-else-if="!scannedProduct" class="flex items-center justify-center h-full p-6">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md w-full">
                    <div class="flex items-start gap-3">
                      <i class="fas fa-info-circle text-blue-600 text-2xl mt-1"></i>
                      <div class="text-sm text-blue-800">
                        <p class="font-medium mb-2">วิธีใช้งาน:</p>
                        <ul class="list-disc list-inside space-y-1">
                          <li>วาง barcode ให้อยู่ในกรอบสีเขียว</li>
                          <li>ระบบจะอ่าน barcode อัตโนมัติ</li>
                          <li>ข้อมูลสินค้าจะแสดงที่ส่วนนี้</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Product Details -->
                <div v-else class="p-6 space-y-4">
                  <!-- Product Header -->
                  <div class="bg-white rounded-lg border border-gray-200 p-4">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h4 class="text-xl font-bold text-gray-900 mb-1">{{ scannedProduct.product_name }}</h4>
                        <p class="text-sm text-gray-500 font-mono">SKU: {{ scannedProduct.sku }}</p>
                        <p v-if="scannedProduct.product_code" class="text-xs text-gray-400 font-mono">Code: {{ scannedProduct.product_code }}</p>
                      </div>
                      <div class="text-right">
                        <span 
                          class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          :class="{
                            'bg-green-100 text-green-800': scannedProduct.status === 'active',
                            'bg-yellow-100 text-yellow-800': scannedProduct.status === 'inactive',
                            'bg-red-100 text-red-800': scannedProduct.status === 'discontinued'
                          }"
                        >
                          {{ getStatusLabel(scannedProduct.status) }}
                        </span>
                      </div>
                    </div>

                    <!-- Stock Summary -->
                    <div class="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                      <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">คงเหลือ</p>
                        <p class="text-lg font-bold text-blue-600">
                          {{ formatNumber(scannedProduct.balance?.qty_on_hand || 0) }}
                        </p>
                      </div>
                      <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">ติดจอง</p>
                        <p class="text-lg font-bold text-orange-600">
                          {{ formatNumber(scannedProduct.balance?.qty_reserved || 0) }}
                        </p>
                      </div>
                      <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">พร้อมใช้</p>
                        <p class="text-lg font-bold text-green-600">
                          {{ formatNumber(scannedProduct.balance?.qty_available || 0) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Scanned Lot (if found) -->
                  <div v-if="scannedLot" class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                      <i class="fas fa-check-circle text-green-600 text-xl"></i>
                      <h5 class="text-lg font-semibold text-green-900">Lot ที่สแกน</h5>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p class="text-xs text-green-700 mb-1">Lot Code</p>
                        <p class="font-mono font-semibold text-green-900">{{ scannedLot.lot_code }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-green-700 mb-1">รหัส Lot (เต็ม)</p>
                        <p class="font-mono font-semibold text-green-900">{{ scannedLot.full_lot_code }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-green-700 mb-1">จำนวนคงเหลือ</p>
                        <p class="font-semibold text-green-900">{{ formatNumber(scannedLot.remaining_meters || scannedLot.calculated_meters || 0) }} ม.</p>
                      </div>
                      <div>
                        <p class="text-xs text-green-700 mb-1">พร้อมใช้</p>
                        <p class="font-semibold text-green-900">{{ formatNumber((scannedLot.remaining_meters || scannedLot.calculated_meters || 0) - (scannedLot.reserved_meters || 0)) }} ม.</p>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        @click="viewFullProductDetails"
                        class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <i class="fas fa-external-link-alt mr-2"></i>
                        ดูรายละเอียดเต็ม
                      </button>
                      <button
                        @click="resetScanner"
                        class="px-4 py-2 bg-white hover:bg-gray-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <i class="fas fa-redo mr-2"></i>
                        สแกนใหม่
                      </button>
                    </div>
                  </div>

                  <!-- All Lots List -->
                  <div v-if="scannedProductLots && scannedProductLots.length > 0">
                    <h5 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i class="fas fa-list mr-2 text-indigo-600"></i>
                      Lot ทั้งหมด ({{ scannedProductLots.length }})
                    </h5>
                    
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                      <div 
                        v-for="lot in scannedProductLots" 
                        :key="lot._id"
                        class="bg-white border rounded-lg p-3 hover:border-indigo-300 transition-colors"
                        :class="{ 'border-green-400 bg-green-50': scannedLot && lot._id === scannedLot._id }"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <p class="text-xs text-gray-500">Lot Code</p>
                              <p class="font-mono text-sm font-semibold">{{ lot.lot_code }}</p>
                            </div>
                            <div>
                              <p class="text-xs text-gray-500">คงเหลือ</p>
                              <p class="text-sm font-semibold text-blue-600">{{ formatNumber(lot.remaining_meters || lot.calculated_meters || 0) }} ม.</p>
                            </div>
                            <div>
                              <p class="text-xs text-gray-500">พร้อมใช้</p>
                              <p class="text-sm font-semibold text-green-600">
                                {{ formatNumber((lot.remaining_meters || lot.calculated_meters || 0) - (lot.reserved_meters || 0)) }} ม.
                              </p>
                            </div>
                          </div>
                          <div class="flex items-center gap-2 ml-2">
                            <div v-if="scannedLot && lot._id === scannedLot._id">
                              <i class="fas fa-check-circle text-green-500 text-lg"></i>
                            </div>
                            <!-- ปุ่มเลือก Lot สำหรับตัดสต็อค -->
                            <button
                              v-if="scannerMode === 'cut'"
                              @click="selectLotForCut(lot)"
                              :class="selectedLotForCut && selectedLotForCut._id === lot._id ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100 text-gray-700'"
                              class="px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              <i class="fas fa-cut mr-1"></i>
                              เลือก
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- ========== CUT STOCK MODE: Quantity Input & Numpad ========== -->
                  <div v-if="scannerMode === 'cut' && scannedLot" class="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-4">
                    <h5 class="text-lg font-semibold text-red-900 mb-3 flex items-center">
                      <i class="fas fa-cut mr-2"></i>
                      ตัดสต็อค - {{ selectedLotForCut ? selectedLotForCut.lot_code : scannedLot.lot_code }}
                    </h5>
                    
                    <!-- Available Stock Display -->
                    <div class="grid grid-cols-2 gap-3 mb-4 bg-white rounded-lg p-3">
                      <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">คงเหลือ</p>
                        <p class="text-xl font-bold text-blue-600">
                          {{ formatNumber((selectedLotForCut || scannedLot).remaining_meters || (selectedLotForCut || scannedLot).calculated_meters || 0) }} ม.
                        </p>
                      </div>
                      <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">พร้อมใช้ (ยังไม่จอง)</p>
                        <p class="text-xl font-bold text-green-600">
                          {{ formatNumber(getAvailableMeters(selectedLotForCut || scannedLot)) }} ม.
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Input -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-red-800 mb-2">จำนวนที่ต้องการตัด (เมตร)</label>
                      <div class="flex items-center gap-2">
                        <input 
                          type="text" 
                          v-model="cutQuantity" 
                          readonly
                          class="flex-1 text-2xl font-bold text-center py-3 border-2 border-red-300 rounded-lg bg-white focus:outline-none focus:border-red-500"
                          placeholder="0"
                        />
                        <span class="text-lg font-medium text-gray-600">ม.</span>
                      </div>
                      <p v-if="cutQuantityError" class="text-red-600 text-sm mt-1">{{ cutQuantityError }}</p>
                    </div>

                    <!-- Numpad -->
                    <div class="grid grid-cols-3 gap-2 mb-4">
                      <button 
                        v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']" 
                        :key="num"
                        @click="handleNumpadInput(num)"
                        :class="num === 'del' ? 'bg-gray-300 hover:bg-gray-400' : 'bg-white hover:bg-gray-100'"
                        class="py-4 text-xl font-bold rounded-lg border border-gray-300 transition-colors active:scale-95"
                      >
                        <template v-if="num === 'del'">
                          <i class="fas fa-backspace"></i>
                        </template>
                        <template v-else>{{ num }}</template>
                      </button>
                    </div>

                    <!-- Action Buttons for Cut Mode -->
                    <div class="flex gap-3">
                      <button
                        @click="handleCutStock"
                        :disabled="!cutQuantity || parseFloat(cutQuantity) <= 0 || processingCut"
                        class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <i v-if="processingCut" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-cut"></i>
                        ตัดสต็อค
                      </button>
                      <button
                        @click="clearCutQuantity"
                        class="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Action Buttons (View Mode) -->
                  <div v-if="scannerMode === 'view'" class="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      @click="viewFullProductDetails"
                      class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <i class="fas fa-external-link-alt"></i>
                      เปิดหน้ารายละเอียดเต็ม
                    </button>
                    <button
                      @click="resetScanner"
                      class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <i class="fas fa-redo mr-2"></i>
                      สแกนใหม่
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cut Stock Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCutConfirmModal" class="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="showCutConfirmModal = false">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">ยืนยันการตัดสต็อค</h3>
              <p class="text-gray-600">คุณต้องการตัดสต็อคหรือไม่?</p>
            </div>

            <!-- Cut Details -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">สินค้า:</span>
                <span class="font-medium">{{ scannedProduct?.product_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Lot:</span>
                <span class="font-mono font-medium">{{ (selectedLotForCut || scannedLot)?.lot_code }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">จำนวนตัด:</span>
                <span class="font-bold text-red-600 text-lg">{{ cutQuantity }} ม.</span>
              </div>
              <div class="flex justify-between border-t pt-2 mt-2">
                <span class="text-gray-600">คงเหลือหลังตัด:</span>
                <span class="font-bold text-blue-600">
                  {{ formatNumber(getAvailableMeters(selectedLotForCut || scannedLot) - parseFloat(cutQuantity || 0)) }} ม.
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="showCutConfirmModal = false"
                class="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmCutStock"
                :disabled="processingCut"
                class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i v-if="processingCut" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                ยืนยันตัดสต็อค
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProductForm from './shared/Form.vue'
import ProductDetails from './shared/ProductDetails.vue'

export default {
  name: 'ProductManager',
  components: {
    ProductForm,
    ProductDetails
  },
  setup() {
    // ✅ ใช้ window.ERP_CORE.inventory สำหรับจัดการข้อมูล Inventory
    const inventoryService = window.ERP_CORE.inventory
    const router = useRouter()
    const instance = getCurrentInstance()
    
    // ✅ โหลดค่าจาก localStorage และ query params
    const savedPage = localStorage.getItem('product_list_page')
    const savedViewMode = localStorage.getItem('product_list_view_mode')
    const savedSearch = localStorage.getItem('product_list_search')
    const savedCategory = localStorage.getItem('product_list_category')
    const savedStatus = localStorage.getItem('product_list_status')
    const savedLotTracking = localStorage.getItem('product_list_lot_tracking')
    
    // ดึงค่าจาก query params ถ้ามี (มีความสำคัญสูงกว่า localStorage)
    const route = router.currentRoute.value
    const queryPage = route.query.page ? parseInt(route.query.page) : null
    
    // State
    const loading = ref(false)
    const refreshingBalance = ref(false)
    const products = ref([])
    const searchQuery = ref(savedSearch || '')
    const filterCategory = ref(savedCategory || '')
    const filterStatus = ref(savedStatus || '')
    const filterLotTracking = ref(savedLotTracking || '')
    const sortField = ref('product_name')
    const sortDirection = ref('asc')
    const currentPage = ref(queryPage || (savedPage ? parseInt(savedPage) : 1))
    const itemsPerPage = ref(20)
    const viewMode = ref(savedViewMode || 'table') // 'table' or 'grid'
    const searchingLots = ref(false)
    const lotSearchResult = ref('')
    const lotMatchedProductIds = ref([]) // Store product IDs from lot search
    
    // Barcode scanner state
    const showBarcodeScanner = ref(false)
    const videoElement = ref(null)
    const scanningActive = ref(false)
    const scannedCode = ref('')
    const scanError = ref('')
    const scannedProduct = ref(null)
    const scannedLot = ref(null)
    const scannedProductLots = ref([])
    const loadingScannedProduct = ref(false)
    let barcodeDetector = null
    let videoStream = null
    let scanInterval = null
    
    // Cut stock mode states (ตัดสต็อค)
    const scannerMode = ref('view') // 'view' = อ่านข้อมูล, 'cut' = ตัดสต็อค
    const cutQuantity = ref('')
    const showCutConfirmModal = ref(false)
    const processingCut = ref(false)
    const selectedLotForCut = ref(null)
    const cutReservation = ref(null) // เก็บ reservation ที่สร้างไว้
    
    // Selection
    const selectedProducts = ref([])
    const dropdownOpen = ref(null)
    
    // Modal states
    const showProductForm = ref(false)
    const showProductDetails = ref(false)
    const formMode = ref('add') // 'add' or 'edit'
    const selectedProduct = ref(null)
    
    // Computed
    const filteredProducts = computed(() => {
      let filtered = [...products.value]
      
      // Search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        
        // Create alternative search patterns (with and without hyphen)
        // Handle formats like: RS-1234, R-1234, D-1234 or RS1234, R1234, D1234
        const queryWithoutHyphen = query.replace(/-/g, '')
        
        // Add hyphen between letters and numbers if not present
        // Matches: RS1234 -> RS-1234, R1234 -> R-1234, D1234 -> D-1234
        const queryWithHyphen = query.includes('-') 
          ? query 
          : query.replace(/([a-z]+)(\d+)/i, '$1-$2')
        
        // Create search function that checks all variations
        const matchesQuery = (value) => {
          if (!value) return false
          const lowerValue = String(value).toLowerCase()
          return lowerValue.includes(query) || 
                 lowerValue.includes(queryWithoutHyphen) ||
                 lowerValue.includes(queryWithHyphen)
        }
        
        // If lot search found matches, prioritize those products
        if (lotMatchedProductIds.value.length > 0) {
          filtered = filtered.filter(product => {
            return lotMatchedProductIds.value.includes(product._id || product.id) ||
                   matchesQuery(product.sku) ||
                   matchesQuery(product.product_name) ||
                   matchesQuery(product.supplier) ||
                   matchesQuery(product.product_code) ||
                   matchesQuery(product.model_code) ||
                   matchesQuery(product.color_code) ||
                   matchesQuery(product.color_code_digit) ||
                   matchesQuery(product.fabric_width_cm)
          })
        } else {
          // Normal search
          filtered = filtered.filter(product => {
            return matchesQuery(product.sku) ||
                   matchesQuery(product.product_name) ||
                   matchesQuery(product.supplier) ||
                   matchesQuery(product.product_code) ||
                   matchesQuery(product.model_code) ||
                   matchesQuery(product.color_code) ||
                   matchesQuery(product.color_code_digit) ||
                   matchesQuery(product.fabric_width_cm)
          })
        }
      }
      
      // Category filter
      if (filterCategory.value) {
        filtered = filtered.filter(product => product.category === filterCategory.value)
      }
      
      // Status filter
      if (filterStatus.value) {
        filtered = filtered.filter(product => product.status === filterStatus.value)
      }
      
      // Lot tracking filter
      if (filterLotTracking.value) {
        if (filterLotTracking.value === 'enabled') {
          filtered = filtered.filter(product => 
            product.enable_lot_tracking || 
            product.category === 'textile' ||
            product.category === 'fabric'
          )
        } else if (filterLotTracking.value === 'disabled') {
          filtered = filtered.filter(product => 
            !product.enable_lot_tracking &&
            product.category !== 'textile' &&
            product.category !== 'fabric'
          )
        }
      }
      
      // Sort
      filtered.sort((a, b) => {
        let aVal, bVal
        
        // Special handling for balance-related fields
        if (sortField.value === 'qty_on_hand') {
          aVal = a.balance?.qty_on_hand || 0
          bVal = b.balance?.qty_on_hand || 0
        } else {
          aVal = a[sortField.value] || ''
          bVal = b[sortField.value] || ''
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortDirection.value === 'asc' ? comparison : -comparison
      })
      
      return filtered
    })
    
    const totalPages = computed(() => 
      Math.ceil(filteredProducts.value.length / itemsPerPage.value)
    )
    
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredProducts.value.slice(start, end)
    })
    
    const startItem = computed(() => 
      filteredProducts.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
    )
    
    const endItem = computed(() => 
      Math.min(currentPage.value * itemsPerPage.value, filteredProducts.value.length)
    )
    
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || filterCategory.value || filterStatus.value || filterLotTracking.value
    })

    const allProductsSelected = computed(() => {
      return paginatedProducts.value.length > 0 && 
             paginatedProducts.value.every(product => selectedProducts.value.includes(product.id))
    })
    
    // Methods
    const loadProducts = async () => {
      loading.value = true
      
      try {
        console.log('🔄 Loading products with balance data...')
        
        // ✅ เลือกใช้ service method ตาม filter
        let productsData
        if (filterStatus.value === 'deleted') {
          // ถ้า filter เป็น "deleted" ให้ดึงข้อมูลทั้งหมด รวมที่ถูก soft delete
          productsData = await inventoryService.getAllProductsIncludingDeleted()
          console.log('🗑️ Products including deleted loaded:', productsData.length)
        } else {
          // ปกติดึงเฉพาะสินค้าที่ยังไม่ถูก delete
          productsData = await inventoryService.getAllProducts()
          console.log('✅ Active products loaded:', productsData.length)
        }
        
        products.value = productsData
        
      } catch (error) {
        console.error('❌ Error loading products:', error)
        products.value = []
      } finally {
        loading.value = false
      }
    }    
    const refreshProducts = async () => {
      await loadProducts()
      // ไม่ต้อง reset currentPage เพื่อให้อยู่หน้าเดิม
      // ✅ บันทึกสถานะหลัง refresh
      saveCurrentState()
    }
    
    // รีเฟรชเฉพาะข้อมูล Balance
    const refreshBalance = async () => {
      if (products.value.length === 0) {
        console.warn('⚠️ No products to refresh balance')
        return
      }
      
      refreshingBalance.value = true
      
      try {
        console.log('🔄 Refreshing all products with balance...')
        
        // ✅ ใช้ InventoryService โหลดข้อมูลใหม่ทั้งหมด
        const productsData = await inventoryService.getAllProducts()
        
        console.log('✅ Products with balance refreshed:', productsData.length)
        
        products.value = productsData
        
      } catch (error) {
        console.error('❌ Error refreshing balance:', error)
      } finally {
        refreshingBalance.value = false
      }
    }
    
    // Search for lots by any field (dynamic search)
    const searchLotByCode = async (query) => {
      if (!query || query.length < 3) {
        // Need at least 3 characters to search
        lotMatchedProductIds.value = []
        lotSearchResult.value = ''
        return
      }
      
      searchingLots.value = true
      lotMatchedProductIds.value = []
      lotSearchResult.value = ''
      
      try {
        console.log('🔍 Searching lots with query:', query)
        
        // Build dynamic search conditions for lot_tracking
        const searchConditions = []
        
        // If it's a number, search in numeric fields
        if (/^\d+$/.test(query)) {
          searchConditions.push(
            { full_lot_code: query },
            { lot_code: query },
            { lot_id: query }
          )
        }
        
        // Always search in text fields (case-insensitive)
        const regexPattern = { $regex: query, $options: 'i' }
        searchConditions.push(
          { full_lot_code: regexPattern },
          { lot_code: regexPattern },
          { lot_id: regexPattern },
          { product_name: regexPattern },
          { sku: regexPattern },
          { supplier_name: regexPattern },
          { location_code: regexPattern },
          { notes: regexPattern }
        )
        
        // Search in lot_tracking
        const lotResult = await inventoryService.apiRequest.POST('lot_tracking/aggregate', {
          pipeline: [
            {
              $match: {
                $or: searchConditions
              }
            },
            {
              $group: {
                _id: '$product_id',
                lots_count: { $sum: 1 },
                lot_codes: { $push: '$lot_code' }
              }
            },
            {
              $project: {
                product_id: '$_id',
                lots_count: 1,
                lot_codes: 1
              }
            }
          ]
        }, inventoryService.clientKey)
        
        console.log('📦 Lot search result:', lotResult)
        
        if (lotResult && lotResult.data && lotResult.data.length > 0) {
          // Found lots, extract unique product IDs
          const productIds = lotResult.data
            .map(item => item.product_id)
            .filter(id => id) // Remove null/undefined
          
          if (productIds.length > 0) {
            lotMatchedProductIds.value = productIds
            lotSearchResult.value = query
            console.log('✅ Found', productIds.length, 'products from lot search')
          } else {
            console.log('⚠️ No product IDs found in lot results')
          }
        } else {
          console.log('⚠️ No lots found with query:', query)
          // Clear if no results
          lotMatchedProductIds.value = []
          lotSearchResult.value = ''
        }
        
      } catch (error) {
        console.error('❌ Error searching lots:', error)
        lotMatchedProductIds.value = []
        lotSearchResult.value = ''
      } finally {
        searchingLots.value = false
      }
    }
    
    const onSearchInput = () => {
      currentPage.value = 1
      // ✅ บันทึกสถานะเมื่อค้นหา
      saveCurrentState()
      
      // Search in lots for any query (debounced)
      const query = searchQuery.value.trim()
      if (query.length >= 3) {
        // Search in lots when query is 3+ characters
        searchLotByCode(query)
      } else {
        // Clear lot search results if query is too short
        lotMatchedProductIds.value = []
        lotSearchResult.value = ''
      }
    }
    
    const applyFilters = async () => {
      currentPage.value = 1
      // ✅ บันทึกสถานะเมื่อใช้ filter
      saveCurrentState()
      
      // ✅ เมื่อเปลี่ยน filter status เป็น "deleted" หรือจาก "deleted" ให้ reload ข้อมูล
      const previousFilter = products.value.length > 0 ? 
        (products.value.some(p => p.status === 'deleted') ? 'including_deleted' : 'active_only') : 'active_only'
      const currentFilter = filterStatus.value === 'deleted' ? 'including_deleted' : 'active_only'
      
      if (previousFilter !== currentFilter) {
        console.log('🔄 Filter status changed, reloading products...', { 
          from: previousFilter, 
          to: currentFilter 
        })
        await loadProducts()
      }
    }

    const clearFilters = async () => {
      searchQuery.value = ''
      filterCategory.value = ''
      filterLotTracking.value = ''
      lotMatchedProductIds.value = []
      lotSearchResult.value = ''
      
      // ✅ ถ้าเคยเลือก "deleted" ให้ reload ข้อมูลใหม่
      const hadDeletedFilter = filterStatus.value === 'deleted'
      filterStatus.value = ''
      currentPage.value = 1
      
      // ✅ บันทึกสถานะหลัง clear filters
      saveCurrentState()
      
      if (hadDeletedFilter) {
        console.log('🔄 Clearing deleted filter, reloading active products...')
        await loadProducts()
      }
    }

    // Selection Methods
    const toggleProductSelection = (productId) => {
      const index = selectedProducts.value.indexOf(productId)
      if (index > -1) {
        selectedProducts.value.splice(index, 1)
      } else {
        selectedProducts.value.push(productId)
      }
    }

    const toggleAllProducts = () => {
      if (allProductsSelected.value) {
        // Unselect all products on current page
        paginatedProducts.value.forEach(product => {
          const index = selectedProducts.value.indexOf(product.id)
          if (index > -1) {
            selectedProducts.value.splice(index, 1)
          }
        })
      } else {
        // Select all products on current page
        paginatedProducts.value.forEach(product => {
          if (!selectedProducts.value.includes(product.id)) {
            selectedProducts.value.push(product.id)
          }
        })
      }
    }

    const bulkAction = (action) => {
      if (selectedProducts.value.length === 0) return

      switch (action) {
        case 'activate':
          console.log('Bulk activate:', selectedProducts.value)
          // Implement bulk activation logic
          break
        case 'deactivate':
          console.log('Bulk deactivate:', selectedProducts.value)
          // Implement bulk deactivation logic
          break
        case 'delete':
          if (confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${selectedProducts.value.length} products?`)) {
            console.log('Bulk delete:', selectedProducts.value)
            // Implement bulk deletion logic
          }
          break
      }
    }

    const exportData = () => {
      console.log('Export data')
      // Implement export functionality
    }

    // UI Methods
    const toggleDropdown = (productId) => {
      dropdownOpen.value = dropdownOpen.value === productId ? null : productId
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        discontinued: 'bg-red-100 text-red-800',
        draft: 'bg-yellow-100 text-yellow-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }
    
    const getSortIcon = (field) => {
      if (sortField.value !== field) return ''
      return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        // ✅ บันทึกหน้าปัจจุบัน
        saveCurrentState()
      }
    }
    
    const formatPrice = (price) => {
      if (!price || price === 0) return 'ฟรี'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(price)
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'discontinued': 'หยุดผลิต',
        'draft': 'ร่าง'
      }
      return labels[status] || status
    }
    
    // Balance helper functions
    const formatNumber = (number) => {
      if (!number || number === 0) return '0'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(number)
    }
    
    const getStockLevelClass = (product) => {
      if (!product.balance || !product.balance.qty_on_hand) return 'stock-empty'
      
      const quantity = product.balance.qty_on_hand
      const minStock = product.min_stock || 0
      
      if (quantity <= 0) return 'stock-empty'
      if (quantity <= minStock) return 'stock-low'
      if (quantity <= minStock * 2) return 'stock-medium'
      return 'stock-good'
    }
    
    // ✅ บันทึกสถานะปัจจุบันลง localStorage และ URL
    const saveCurrentState = () => {
      // บันทึกใน localStorage
      localStorage.setItem('product_list_page', currentPage.value.toString())
      localStorage.setItem('product_list_view_mode', viewMode.value)
      localStorage.setItem('product_list_search', searchQuery.value)
      localStorage.setItem('product_list_category', filterCategory.value)
      localStorage.setItem('product_list_status', filterStatus.value)
      localStorage.setItem('product_list_lot_tracking', filterLotTracking.value)
      
      // อัพเดท URL query params
      router.replace({
        query: {
          ...router.currentRoute.value.query,
          page: currentPage.value.toString()
        }
      })
    }
    
    // Product actions
    const addNewProduct = () => {
      console.log('➕ Adding new product')
      // ✅ บันทึกสถานะก่อนไปหน้าใหม่
      saveCurrentState()
      router.push('/inventory/products/add')
    }
    
    const editProduct = (product) => {
      console.log('✏️ Editing product:', product)
      // ✅ บันทึกสถานะก่อนไปหน้าแก้ไข
      saveCurrentState()
      router.push(`/inventory/products/${product.id}/edit`)
    }
    
    const viewProductDetails = (product) => {
      console.log('👁️ Viewing product:', product)
      // ✅ บันทึกสถานะก่อนไปหน้ารายละเอียด
      saveCurrentState()
      router.push(`/inventory/products/${product.id}`)
    }
    
    const duplicateProduct = (product) => {
      const duplicated = {
        ...product,
        id: null,
        sku: '',
        product_code: '',
        product_name: `${product.product_name} (สำเนา)`,
        status: 'draft'
      }
      selectedProduct.value = duplicated
      formMode.value = 'add'
      showProductForm.value = true
    }
    
    const deleteProduct = async (product) => {
      // ✅ ปรับข้อความให้ชัดเจนว่าเป็น Soft Delete
      let confirmMessage = `ต้องการลบสินค้า "${product.product_name}" หรือไม่?\n\n🔒 หมายเหตุ: นี่เป็นการ "ลบชั่วคราว" สินค้าจะถูกซ่อนจากรายการแต่ข้อมูลจะยังคงอยู่ในระบบ`
      
      if (product.status === 'active') {
        confirmMessage = `⚠️ สินค้า "${product.product_name}" ยังใช้งานอยู่!\n\nการลบสินค้าที่ใช้งานอยู่อาจส่งผลต่อข้อมูลสินค้าคงเหลือและประวัติการเคลื่อนไหวสินค้า\n\n🔒 หมายเหตุ: นี่เป็นการ "ลบชั่วคราว" ข้อมูลยังคงอยู่ในระบบและสามารถกู้คืนได้\n\nคุณแน่ใจหรือไม่ที่จะลบสินค้านี้?`
      }
      
      // ✅ เพิ่มข้อมูล Balance สำหรับการตัดสินใจ
      if (product.balance && product.balance.qty_on_hand > 0) {
        confirmMessage += `\n\n📦 สินค้าคงเหลือ: ${formatNumber(product.balance.qty_on_hand)} ${product.unit || 'ชิ้น'}`
        confirmMessage += `\n💰 มูลค่าคงเหลือ: ${formatPrice(product.balance.total_cost_value || 0)}`
        confirmMessage += `\n\n⚠️ การลบจะทำให้ข้อมูลสินค้าคงเหลือหายไป!`
      }
      
      if (!confirm(confirmMessage)) {
        return
      }
      
      try {
        console.log('🗑️ Deleting product:', product.product_name, 'ID:', product.id)
        
        // ✅ ตรวจสอบ InventoryService ก่อนใช้งาน
        if (!inventoryService.isReady()) {
          throw new Error('InventoryService ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง')
        }
        
        console.log('🔑 [ProductList] Delete operation - Service status:', {
          isReady: inventoryService.isReady(),
          hasClientKey: !!inventoryService.clientKey,
          keyPreview: inventoryService.clientKey ? '***' + inventoryService.clientKey.slice(-4) : 'null'
        })
        
        // ✅ ใช้ InventoryService ลบสินค้า  
        await inventoryService.deleteProduct(product.id)
        
        await refreshProducts()
        
        // ✅ ใช้ toast แทน alert ถ้ามี
        if (window.$toast) {
          window.$toast.success(`ลบสินค้า "${product.product_name}" เรียบร้อยแล้ว`)
        } else {
          alert('ลบสินค้าเรียบร้อยแล้ว')
        }
      } catch (error) {
        console.error('❌ Error deleting product:', error)
        
        const errorMessage = `เกิดข้อผิดพลาดในการลบสินค้า: ${error.message || 'ไม่ทราบสาเหตุ'}`
        
        if (window.$toast) {
          window.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    }
    
    // ✅ Restore Product Method (กู้คืนสินค้าที่ถูก soft delete)
    const restoreProduct = async (product) => {
      const confirmMessage = `ต้องการกู้คืนสินค้า "${product.product_name}" หรือไม่?`
      
      if (!confirm(confirmMessage)) {
        return
      }
      
      try {
        console.log('♻️ Restoring product:', product.product_name, 'ID:', product.id)
        
        // ✅ ตรวจสอบ InventoryService ก่อนใช้งาน
        if (!inventoryService.isReady()) {
          throw new Error('InventoryService ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง')
        }
        
        // ✅ ใช้ InventoryService กู้คืนสินค้า (เปลี่ยนสถานะเป็น inactive)
        await inventoryService.restoreProduct(product.id, 'inactive')
        
        await refreshProducts()
        
        // ✅ ใช้ toast แทน alert ถ้ามี
        if (window.$toast) {
          window.$toast.success(`กู้คืนสินค้า "${product.product_name}" เรียบร้อยแล้ว`)
        } else {
          alert('กู้คืนสินค้าเรียบร้อยแล้ว')
        }
      } catch (error) {
        console.error('❌ Error restoring product:', error)
        
        const errorMessage = `เกิดข้อผิดพลาดในการกู้คืนสินค้า: ${error.message || 'ไม่ทราบสาเหตุ'}`
        
        if (window.$toast) {
          window.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    }
    
    // Modal handlers
    const onProductSaved = () => {
      closeProductForm()
      refreshProducts()
    }
    
    const closeProductForm = () => {
      showProductForm.value = false
      selectedProduct.value = null
    }
    
    const closeProductDetails = () => {
      showProductDetails.value = false
      selectedProduct.value = null
    }
    
    // Barcode Scanner Methods
    const openBarcodeScanner = async () => {
      showBarcodeScanner.value = true
      scannedCode.value = ''
      scanError.value = ''
      
      try {
        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        
        // Wait for next tick to ensure video element is mounted
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (videoElement.value) {
          videoElement.value.srcObject = videoStream
          
          // Wait for video to be ready
          await new Promise(resolve => {
            videoElement.value.onloadedmetadata = resolve
          })
          
          await videoElement.value.play()
          scanningActive.value = true
          
          console.log('📹 Video stream started, checking for barcode detection...')
          
          // Try native BarcodeDetector API first (only in Chrome/Edge)
          if ('BarcodeDetector' in window) {
            try {
              console.log('✅ Using native BarcodeDetector API')
              barcodeDetector = new window.BarcodeDetector({
                formats: ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'data_matrix', 'pdf417']
              })
              
              // Start continuous scanning
              scanInterval = setInterval(async () => {
                await detectBarcode()
              }, 300) // Scan every 300ms for faster detection
            } catch (e) {
              console.error('❌ BarcodeDetector failed:', e)
              startZXingScanner()
            }
          } else {
            // Fallback: Use ZXing library (works on all browsers)
            console.log('📱 BarcodeDetector not available, using ZXing library')
            startZXingScanner()
          }
        }
      } catch (error) {
        console.error('❌ Error accessing camera:', error)
        scanError.value = 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง'
        scanningActive.value = false
      }
    }
    
    const detectBarcode = async () => {
      if (!barcodeDetector || !videoElement.value || !scanningActive.value) return
      
      try {
        const barcodes = await barcodeDetector.detect(videoElement.value)
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0]
          console.log('📷 Barcode detected (Native API):', barcode.rawValue, 'Format:', barcode.format)
          
          scannedCode.value = barcode.rawValue
          
          // Stop scanning temporarily
          if (scanInterval) {
            clearInterval(scanInterval)
            scanInterval = null
          }
          
          // Search for product
          await searchProductByBarcode(barcode.rawValue)
        }
      } catch (error) {
        // Silently ignore detection errors, keep scanning
        if (error.message && !error.message.includes('not enough')) {
          console.error('❌ Error detecting barcode:', error)
        }
      }
    }
    
    const startZXingScanner = () => {
      // Check if ZXing is already loaded
      if (window.ZXing && window.ZXing.BrowserMultiFormatReader) {
        initZXingReader()
        return
      }
      
      // Load ZXing library dynamically
      console.log('📦 Loading ZXing library...')
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js'
      script.onload = () => {
        console.log('✅ ZXing library loaded')
        initZXingReader()
      }
      script.onerror = () => {
        console.error('❌ Failed to load ZXing library')
        scanError.value = 'ไม่สามารถโหลดไลบรารีสแกน Barcode ได้'
      }
      document.head.appendChild(script)
    }
    
    const initZXingReader = () => {
      try {
        const codeReader = new window.ZXing.BrowserMultiFormatReader()
        
        console.log('🔍 Starting ZXing continuous decode...')
        
        codeReader.decodeFromVideoElement(videoElement.value, (result, error) => {
          if (result) {
            console.log('📷 Barcode detected (ZXing):', result.text, 'Format:', result.getBarcodeFormat())
            
            if (scannedCode.value !== result.text) {
              scannedCode.value = result.text
              
              // Stop ZXing scanning
              codeReader.reset()
              
              // Search for product
              searchProductByBarcode(result.text)
            }
          }
          
          // Ignore errors (just means no barcode found in current frame)
          if (error && !(error instanceof window.ZXing.NotFoundException)) {
            console.error('ZXing error:', error)
          }
        })
        
        console.log('✅ ZXing scanner started successfully')
      } catch (error) {
        console.error('❌ Error initializing ZXing reader:', error)
        scanError.value = 'เกิดข้อผิดพลาดในการเริ่มสแกน Barcode'
      }
    }
    
    const searchProductByBarcode = async (barcode) => {
      try {
        console.log('🔍 Searching for barcode:', barcode)
        console.log('📊 Current products count:', products.value.length)
        
        loadingScannedProduct.value = true
        scanError.value = ''
        scannedProduct.value = null
        scannedLot.value = null
        scannedProductLots.value = []
        
        // Search in lot_tracking collection for full_lot_code
        const pipeline = [
          {
            $match: {
              full_lot_code: barcode
            }
          },
          {
            $limit: 1
          }
        ]
        
        const lotResult = await inventoryService.apiRequest.POST('lot_tracking/aggregate', {
          pipeline: pipeline
        }, inventoryService.clientKey)
        
        let productId = null
        
        if (lotResult && lotResult.data && lotResult.data.length > 0) {
          const lot = lotResult.data[0]
          console.log('✅ Found lot:', lot)
          
          scannedLot.value = lot
          productId = lot.product_id
          
          if (window.$toast) {
            window.$toast.success(`พบ Lot: ${lot.lot_code}`)
          }
        } else {
          // Try searching by SKU or product code
          const product = products.value.find(p => 
            p.sku === barcode || 
            p.product_code === barcode ||
            p.barcode === barcode
          )
          
          if (product) {
            console.log('✅ Found product by SKU/Code:', product)
            productId = product.id || product._id
            
            if (window.$toast) {
              window.$toast.success(`พบสินค้า: ${product.product_name}`)
            }
          }
        }
        
        if (productId) {
          // Load full product details
          const productDetails = await inventoryService.getProduct(productId)
          if (productDetails) {
            scannedProduct.value = productDetails
            console.log('📦 Product details loaded:', productDetails)
          }
          
          // Load all lots for this product
          const lots = await inventoryService.getLotTracking(productId)
          if (lots && Array.isArray(lots)) {
            scannedProductLots.value = lots.sort((a, b) => {
              // Sort: scanned lot first, then by date
              if (scannedLot.value) {
                if (a._id === scannedLot.value._id) return -1
                if (b._id === scannedLot.value._id) return 1
              }
              const dateA = new Date(a.received_date || a.created_at || 0)
              const dateB = new Date(b.received_date || b.created_at || 0)
              return dateB - dateA
            })
            console.log('📋 Lots loaded:', lots.length)
          }
        } else {
          scanError.value = `ไม่พบสินค้าที่ตรงกับ Barcode: ${barcode}`
        }
        
      } catch (error) {
        console.error('❌ Error searching product:', error)
        scanError.value = 'เกิดข้อผิดพลาดในการค้นหาสินค้า'
      } finally {
        loadingScannedProduct.value = false
        // Keep scanning active for continuous scanning
        // scanningActive.value = false
      }
    }
    
    const resetScanner = () => {
      scannedCode.value = ''
      scanError.value = ''
      scannedProduct.value = null
      scannedLot.value = null
      scannedProductLots.value = []
      scanningActive.value = true
      
      // Restart scanning based on available method
      if (barcodeDetector && videoElement.value && !scanInterval) {
        console.log('🔄 Restarting native barcode detection...')
        scanInterval = setInterval(async () => {
          await detectBarcode()
        }, 300)
      } else if (window.ZXing && videoElement.value) {
        console.log('🔄 Restarting ZXing scanner...')
        initZXingReader()
      }
    }
    
    const viewFullProductDetails = () => {
      if (!scannedProduct.value) return
      
      const productId = scannedProduct.value.id || scannedProduct.value._id
      
      // Close scanner
      closeBarcodeScanner()
      
      // Navigate to product detail page
      if (scannedLot.value) {
        router.push({
          path: `/inventory/products/${productId}`,
          query: { lot_id: scannedLot.value._id }
        })
      } else {
        router.push(`/inventory/products/${productId}`)
      }
    }
    
    const handleImageError = (event) => {
      console.warn('Image failed to load:', event.target.src)
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E'
    }
    
    const closeBarcodeScanner = () => {
      // Stop video stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
        videoStream = null
      }
      
      // Clear scanning interval
      if (scanInterval) {
        clearInterval(scanInterval)
        scanInterval = null
      }
      
      // Reset states
      showBarcodeScanner.value = false
      scanningActive.value = false
      scannedCode.value = ''
      scanError.value = ''
      scannedProduct.value = null
      scannedLot.value = null
      scannedProductLots.value = []
      loadingScannedProduct.value = false
      barcodeDetector = null
      
      // Reset cut stock states
      scannerMode.value = 'view'
      cutQuantity.value = ''
      showCutConfirmModal.value = false
      processingCut.value = false
      selectedLotForCut.value = null
      cutReservation.value = null
    }
    
    // ========== CUT STOCK FUNCTIONS ==========
    
    // สลับโหมด View <-> Cut
    const toggleScannerMode = () => {
      scannerMode.value = scannerMode.value === 'view' ? 'cut' : 'view'
      // Reset cut states เมื่อเปลี่ยนโหมด
      cutQuantity.value = ''
      selectedLotForCut.value = scannedLot.value
    }
    
    // เลือก Lot สำหรับตัด
    const selectLotForCut = (lot) => {
      selectedLotForCut.value = lot
      cutQuantity.value = ''
    }
    
    // คำนวณจำนวนพร้อมใช้ (remaining - reserved)
    const getAvailableMeters = (lot) => {
      if (!lot) return 0
      const remaining = lot.remaining_meters || lot.calculated_meters || 0
      const reserved = lot.reserved_meters || 0
      return Math.max(0, remaining - reserved)
    }
    
    // Computed: ตรวจสอบ error จำนวนตัด
    const cutQuantityError = computed(() => {
      if (!cutQuantity.value) return ''
      const qty = parseFloat(cutQuantity.value)
      const lot = selectedLotForCut.value || scannedLot.value
      if (!lot) return ''
      
      const available = getAvailableMeters(lot)
      if (qty <= 0) return 'กรุณาใส่จำนวนที่มากกว่า 0'
      if (qty > available) return `จำนวนเกินที่พร้อมใช้ (สูงสุด ${formatNumber(available)} ม.)`
      return ''
    })
    
    // จัดการ input จาก numpad
    const handleNumpadInput = (key) => {
      if (key === 'del') {
        cutQuantity.value = cutQuantity.value.slice(0, -1)
      } else if (key === '.') {
        // ป้องกันจุดซ้ำ
        if (!cutQuantity.value.includes('.')) {
          cutQuantity.value += key
        }
      } else {
        // ป้องกันตัวเลขเกิน 10 หลัก
        if (cutQuantity.value.length < 10) {
          cutQuantity.value += key
        }
      }
    }
    
    // ล้างจำนวน
    const clearCutQuantity = () => {
      cutQuantity.value = ''
    }
    
    // กดปุ่มตัดสต็อค -> แสดง modal ยืนยัน
    const handleCutStock = () => {
      const qty = parseFloat(cutQuantity.value)
      const lot = selectedLotForCut.value || scannedLot.value
      
      if (!lot || !qty || qty <= 0) {
        if (window.$toast) {
          window.$toast.error('กรุณาใส่จำนวนที่ต้องการตัด')
        }
        return
      }
      
      const available = getAvailableMeters(lot)
      if (qty > available) {
        if (window.$toast) {
          window.$toast.error(`จำนวนเกินที่พร้อมใช้ (สูงสุด ${formatNumber(available)} ม.)`)
        }
        return
      }
      
      // แสดง modal ยืนยัน
      showCutConfirmModal.value = true
    }
    
    // ยืนยันตัดสต็อค - ทำตาม flow: Reserve -> Confirm Payment -> Cut
    const confirmCutStock = async () => {
      const lot = selectedLotForCut.value || scannedLot.value
      const qty = parseFloat(cutQuantity.value)
      
      if (!lot || !qty) return
      
      processingCut.value = true
      
      try {
        console.log('🔪 Starting cut stock process...')
        console.log('📦 Lot:', lot.lot_code, '| Qty:', qty, 'm')
        
        // ===== STEP 1: สร้าง Reservation ก่อน (payment_status = 'paid' เพื่อตัดได้เลย) =====
        console.log('📝 Step 1: Creating reservation...')
        const reservationResult = await inventoryService.reserveLotStock({
          lot_id: lot._id,
          product_id: scannedProduct.value?._id || scannedProduct.value?.id,
          product_code: scannedProduct.value?.product_code || scannedProduct.value?.sku,
          product_name: scannedProduct.value?.product_name,
          lot_code: lot.lot_code,
          reservation_type: 'meters',
          reserved_meters: qty,
          reserved_weight_kg: null,
          payment_status: 'paid', // ตั้งเป็น paid เพื่อตัดได้ทันที
          status: 'paid',
          customer_name: 'ตัดสต็อค (Barcode Scanner)',
          customer_id: null,
          reference_type: 'manual',
          reference_id: null,
          reference_number: `CUT-${Date.now()}`,
          location: lot.rack_position || '',
          notes: `ตัดสต็อคผ่าน Barcode Scanner - ${new Date().toLocaleString('th-TH')}`,
          reserved_by: window.ERP_CORE?.auth?.user?.name || 'System'
        })
        
        if (!reservationResult || !reservationResult.success || !reservationResult.reservation) {
          throw new Error(reservationResult?.errors?.join(', ') || 'ไม่สามารถสร้าง Reservation ได้')
        }
        
        const reservationId = reservationResult.reservation._id
        console.log('✅ Reservation created:', reservationId)
        cutReservation.value = reservationResult.reservation
        
        // ===== STEP 2: ตัดสต็อค (Cut Lot Stock) =====
        console.log('✂️ Step 2: Cutting stock...')
        const cutResult = await inventoryService.cutLotStock({
          lot_id: lot._id,
          reservation_id: reservationId,
          cut_meters: qty,
          notes: `ตัดสต็อคผ่าน Barcode Scanner - ${lot.lot_code} - ${qty}m`
        })
        
        if (!cutResult || !cutResult.success) {
          throw new Error(cutResult?.errors?.join(', ') || cutResult?.message || 'ไม่สามารถตัดสต็อคได้')
        }
        
        console.log('✅ Stock cut successfully!')
        
        // แสดงข้อความสำเร็จ
        if (window.$toast) {
          window.$toast.success(`ตัดสต็อคสำเร็จ: ${lot.lot_code} จำนวน ${qty} ม.`)
        }
        
        // ปิด modal ยืนยัน
        showCutConfirmModal.value = false
        
        // รีเฟรชข้อมูล lot
        await refreshScannedLot()
        
        // รีเซ็ต quantity
        cutQuantity.value = ''
        
        // รีเฟรชหน้ารายการสินค้าด้วย
        await refreshBalance()
        
      } catch (error) {
        console.error('❌ Cut stock error:', error)
        if (window.$toast) {
          window.$toast.error(error.message || 'เกิดข้อผิดพลาดในการตัดสต็อค')
        }
      } finally {
        processingCut.value = false
      }
    }
    
    // รีเฟรชข้อมูล Lot หลังตัดสต็อค
    const refreshScannedLot = async () => {
      if (!scannedProduct.value) return
      
      const productId = scannedProduct.value._id || scannedProduct.value.id
      
      // โหลด lots ใหม่
      const lots = await inventoryService.getLotTracking(productId)
      if (lots && Array.isArray(lots)) {
        scannedProductLots.value = lots.sort((a, b) => {
          const dateA = new Date(a.received_date || a.created_at || 0)
          const dateB = new Date(b.received_date || b.created_at || 0)
          return dateB - dateA
        })
        
        // อัพเดท scannedLot ถ้ามี
        if (scannedLot.value) {
          const updatedLot = lots.find(l => l._id === scannedLot.value._id)
          if (updatedLot) {
            scannedLot.value = updatedLot
          }
        }
        
        // อัพเดท selectedLotForCut ถ้ามี
        if (selectedLotForCut.value) {
          const updatedLot = lots.find(l => l._id === selectedLotForCut.value._id)
          if (updatedLot) {
            selectedLotForCut.value = updatedLot
          }
        }
      }
      
      // โหลดข้อมูลสินค้าใหม่
      const productDetails = await inventoryService.getProduct(productId)
      if (productDetails) {
        scannedProduct.value = productDetails
      }
    }
    
    // Auto-refresh Balance data (เฉพาะเมื่อมี products แสดงอยู่)
    const setupAutoRefresh = () => {
      return setInterval(async () => {
        if (products.value.length > 0 && !loading.value && !refreshingBalance.value) {
          console.log('🔄 Auto-refreshing balance data...')
          await refreshBalance()
        }
      }, 30000) // ทุกๆ 30 วินาที
    }

    let autoRefreshInterval = null

    // Lifecycle
    onMounted(() => {
      console.log('🔄 [ProductList] Initializing InventoryService...')
      
      // ✅ Initialize InventoryService with current component instance
      inventoryService.initialize(instance)
      
      // ✅ Debug: ตรวจสอบ initialization
      console.log('🔑 [ProductList] InventoryService Debug:', {
        isReady: inventoryService.isReady(),
        hasClientKey: !!inventoryService.clientKey,
        erpCoreClientKey: !!window.ERP_CORE?.clientKey,
        keyMatch: inventoryService.clientKey === window.ERP_CORE?.clientKey
      })
      
      loadProducts()
      // เริ่ม auto-refresh หลังจากโหลดข้อมูลเสร็จ
      setTimeout(() => {
        autoRefreshInterval = setupAutoRefresh()
      }, 5000)
    })
    
    // ✅ Watch สำหรับบันทึกสถานะเมื่อเปลี่ยน viewMode
    watch(viewMode, () => {
      saveCurrentState()
    })

    // Cleanup interval on unmount
    onUnmounted(() => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
        console.log('🔄 Auto-refresh stopped')
      }
      
      // Cleanup barcode scanner
      closeBarcodeScanner()
    })
    
    return {
      // State
      loading,
      refreshingBalance,
      products,
      searchQuery,
      filterCategory,
      filterStatus,
      filterLotTracking,
      currentPage,
      viewMode,
      selectedProducts,
      dropdownOpen,
      searchingLots,
      lotSearchResult,
      lotMatchedProductIds,
      
      // Barcode scanner states
      showBarcodeScanner,
      videoElement,
      scanningActive,
      scannedCode,
      scanError,
      scannedProduct,
      scannedLot,
      scannedProductLots,
      loadingScannedProduct,
      
      // Cut stock states
      scannerMode,
      cutQuantity,
      showCutConfirmModal,
      processingCut,
      selectedLotForCut,
      cutQuantityError,
      
      // Modal states
      showProductForm,
      showProductDetails,
      formMode,
      selectedProduct,
      
      // Computed
      filteredProducts,
      paginatedProducts,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      hasActiveFilters,
      allProductsSelected,
      
      // Methods
      refreshProducts,
      refreshBalance,
      onSearchInput,
      applyFilters,
      clearFilters,
      sortBy,
      getSortIcon,
      goToPage,
      formatPrice,
      getStatusLabel,
      
      // Selection methods
      toggleProductSelection,
      toggleAllProducts,
      bulkAction,
      exportData,
      
      // Balance methods
      formatNumber,
      getStockLevelClass,
      
      // Actions
      addNewProduct,
      editProduct,
      viewProductDetails,
      duplicateProduct,
      deleteProduct,
      restoreProduct,
      
      // UI methods
      toggleDropdown,
      getStatusClass,
      
      // Modal handlers
      onProductSaved,
      closeProductForm,
      closeProductDetails,
      
      // Barcode scanner methods
      openBarcodeScanner,
      closeBarcodeScanner,
      resetScanner,
      viewFullProductDetails,
      handleImageError,
      
      // Cut stock methods
      toggleScannerMode,
      selectLotForCut,
      getAvailableMeters,
      handleNumpadInput,
      clearCutQuantity,
      handleCutStock,
      confirmCutStock
    }
  }
}
</script>

<style scoped>
/* Modal Transition Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to > div {
  transform: scale(0.9) translateY(-20px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Scanning Line Animation */
.scanning-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  box-shadow: 0 0 10px #10b981;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

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

/* Custom table styling for better data display */
table {
  table-layout: fixed;
  width: 100%;
}

/* Text truncation for compact display */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Remove any overflow scrolling */
.no-scroll {
  overflow: hidden;
}

/* Specific column widths to fit without scroll */
table th,
table td {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure table fits within viewport */
.w-12 { width: 48px; }    /* checkbox */
.w-28 { width: 112px; }   /* SKU */
.w-20 { width: 80px; }    /* หมวดหมู่ */
.w-32 { width: 128px; }   /* ซัพพลายเออร์ */
.w-24 { width: 96px; }    /* ราคา, มูลค่า, จัดการ */
.w-16 { width: 64px; }    /* สถานะ */

/* Status indicators */
.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #f3f4f6;
  color: #374151;
}

.status-discontinued {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-draft {
  background-color: #fef3c7;
  color: #92400e;
}

.status-deleted {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Stock level indicators */
.text-red-600 {
  color: #dc2626;
}

.text-yellow-600 {
  color: #d97706;
}

.text-green-600 {
  color: #059669;
}

/* Button hover states */
.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:bg-green-50:hover {
  background-color: #f0fdf4;
}

.hover\:bg-red-50:hover {
  background-color: #fef2f2;
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

/* Stock level colors */
.stock-empty {
  color: #dc2626 !important;
}

.stock-low {
  color: #f59e0b !important;
}

.stock-medium {
  color: #0ea5e9 !important;
}

.stock-good {
  color: #059669 !important;
}

/* Custom hover effects */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:bg-green-50:hover {
  background-color: #f0fdf4;
}

.hover\:bg-red-50:hover {
  background-color: #fef2f2;
}

/* Dropdown positioning */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  /* Hide less important table columns on mobile */
  .mobile-hide {
    display: none;
  }
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Utility classes for consistent spacing */
.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

/* Focus styles */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:ring-blue-500:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

/* Custom scrollbar for table overflow */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>