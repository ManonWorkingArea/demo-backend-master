<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i :class="mode === 'create' ? 'fas fa-file-plus text-blue-600 mr-3' : 'fas fa-file-edit text-orange-600 mr-3'"></i>
              {{ mode === 'create' ? 'สร้างใบเสนอราคาใหม่' : 'แก้ไขใบเสนอราคา' }}
            </h1>
            <p class="mt-2 text-gray-600">
              {{ mode === 'create' ? 'สร้างใบเสนอราคาสำหรับลูกค้า' : 'แก้ไขข้อมูลใบเสนอราคา' }}
            </p>
          </div>
          <div>
            <button
              @click="navigateBack"
              type="button"
              :disabled="loading || navigating"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              <span v-if="navigating">กำลังโหลด...</span>
              <span v-else>กลับ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">กำลังโหลด...</span>
        </div>
      </div>
    </div>

    <!-- Main Form (แสดงแม้มี error) -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Error Alert (แสดงด้านบนฟอร์ม) -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
          <div class="flex-1">
            <h3 class="text-red-800 font-medium">เกิดข้อผิดพลาด</h3>
            <p class="text-red-700 mt-1">{{ error }}</p>
          </div>
          <button 
            @click="error = null" 
            class="text-red-600 hover:text-red-800"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-600 text-xl mr-3"></i>
          <div class="flex-1">
            <h3 class="text-green-800 font-medium">สำเร็จ</h3>
            <p class="text-green-700 mt-1">{{ successMessage }}</p>
          </div>
          <button 
            @click="successMessage = null" 
            class="text-green-600 hover:text-green-800"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="submitForm" class="space-y-8">
      
      <!-- Document Information Card -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเอกสาร</h3>
          <p class="text-sm text-gray-600">ข้อมูลหลักของใบเสนอราคา</p>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Document Number and Date -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                เลขที่เอกสาร
                <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model="formData.quote_number"
                  type="text"
                  :readonly="mode === 'edit'"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'bg-gray-100': mode === 'edit' }"
                  placeholder="จะถูกสร้างอัตโนมัติเมื่อบันทึก"
                />
                <button
                  v-if="mode === 'create'"
                  @click.prevent="generateQuotationCode"
                  type="button"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  :disabled="loading"
                >
                  <i class="fas fa-sync-alt"></i>
                  <span>สร้างรหัส</span>
                </button>
              </div>
              <div v-if="mode === 'create' && codePreview" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p class="text-sm font-medium text-blue-900">
                  <i class="fas fa-info-circle mr-1"></i>
                  รหัสที่จะได้: <span class="font-mono font-bold">{{ codePreview }}</span>
                </p>
                <p v-if="codeGenerationInfo" class="text-xs text-blue-700 mt-1">
                  {{ codeGenerationInfo }}
                </p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                วันที่เอกสาร
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.quotation_date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Valid Until Date -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                วันหมดอายุ
              </label>
              <input
                v-model="formData.expiry_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">แบบร่าง</option>
                <option value="sent">ส่งแล้ว</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ปฏิเสธ</option>
                <option value="expired">หมดอายุ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Information Card -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">ข้อมูลลูกค้า</h3>
          <p class="text-sm text-gray-600">เลือกลูกค้าสำหรับใบเสนอราคานี้</p>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="customer-search-wrapper">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ลูกค้า
              <span class="text-red-500">*</span>
            </label>
            
            <div class="customer-input-container">
              <div class="input-with-icon">
                <i class="fas fa-user input-icon"></i>
                <input
                  type="text"
                  v-model="customerSearchQuery"
                  @input="onCustomerInput"
                  @focus="showCustomerDropdown = true"
                  @blur="hideCustomerDropdown"
                  placeholder="ค้นหาลูกค้า หรือ สร้างใหม่..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent customer-input"
                  :class="{ 'border-green-500': formData.customer_id }"
                />
                <i v-if="formData.customer_id" class="fas fa-check-circle selected-indicator"></i>
              </div>

              <!-- Customer Dropdown -->
              <div v-if="showCustomerDropdown && customerSearchQuery" class="customer-dropdown">
                <div class="dropdown-header">
                  <span class="dropdown-title">เลือกลูกค้า</span>
                  <span class="dropdown-count">{{ filteredCustomers.length }} รายการ</span>
                </div>

                <div class="customers-list">
                  <!-- Create New Customer Option -->
                  <div
                    v-if="customerSearchQuery && !filteredCustomers.some(c => c.name?.toLowerCase() === customerSearchQuery.toLowerCase())"
                    @mousedown="selectCustomer(null, customerSearchQuery)"
                    class="customer-option new-customer"
                  >
                    <div class="option-icon new-icon">
                      <i class="fas fa-plus"></i>
                    </div>
                    <div class="option-content">
                      <div class="option-name">สร้างลูกค้าใหม่</div>
                      <div class="option-description">
                        <i class="fas fa-magic mr-1"></i>
                        "{{ customerSearchQuery }}"
                      </div>
                    </div>
                    <div class="option-action">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </div>

                  <!-- Existing Customers -->
                  <div
                    v-for="customer in filteredCustomers"
                    :key="customer.id"
                    @mousedown="selectCustomer(customer)"
                    class="customer-option existing-customer"
                  >
                    <div class="option-icon">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="option-content">
                      <div class="option-name">{{ customer.name }}</div>
                      <div class="option-description">
                        <span v-if="customer.customer_code" class="customer-code">{{ customer.customer_code }}</span>
                        <span v-if="customer.phone" class="contact-person">{{ customer.phone }}</span>
                      </div>
                      <div class="option-meta">
                        <span class="customer-id">ID: {{ customer.id?.substring(0, 8) }}...</span>
                        <span 
                          class="option-status" 
                          :class="`status-${customer.status || 'active'}`"
                        >
                          {{ formatCustomerStatus(customer.status || 'active') }}
                        </span>
                      </div>
                    </div>
                    <div class="option-action">
                      <i class="fas fa-chevron-right"></i>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="filteredCustomers.length === 0 && customerSearchQuery" class="empty-state">
                    <div class="empty-icon">
                      <i class="fas fa-search"></i>
                    </div>
                    <div class="empty-text">
                      ไม่พบลูกค้าที่ตรงกับ "{{ customerSearchQuery }}"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Customer Display -->
            <div v-if="selectedCustomer" class="selected-customer">
              <div class="selected-customer-info">
                <i class="fas fa-check-circle"></i>
                <span class="selected-name">{{ selectedCustomer.name }}</span>
                <span v-if="selectedCustomer.customer_code" class="selected-id">{{ selectedCustomer.customer_code }}</span>
              </div>
              <button
                type="button"
                @click="clearCustomer"
                class="clear-selection-btn"
                title="ล้างการเลือก"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Customer Details Display -->
          <div v-if="selectedCustomer" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">ข้อมูลลูกค้า</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">ชื่อ:</span>
                <span class="ml-2 text-gray-900">{{ selectedCustomer.name }}</span>
              </div>
              <div>
                <span class="text-gray-600">เบอร์โทร:</span>
                <span class="ml-2 text-gray-900">{{ selectedCustomer.phone || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-600">อีเมล:</span>
                <span class="ml-2 text-gray-900">{{ selectedCustomer.email || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-600">เครดิตลิมิต:</span>
                <span class="ml-2 text-gray-900">{{ formatCurrency(selectedCustomer.credit_limit) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า/บริการ</h3>
              <p class="text-sm text-gray-600">เพิ่มรายการสินค้าหรือบริการในใบเสนอราคา</p>
              <!-- Show product count or error -->
              <p v-if="error && error.includes('สินค้า')" class="text-xs text-red-600 mt-1">
                <i class="fas fa-exclamation-circle"></i> {{ error }}
              </p>
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="showProductModal"
                class="inline-flex items-center px-3 py-2 border border-purple-600 text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 transition-colors duration-200"
              >
                <i class="fas fa-lock mr-2"></i>
                เลือกจาก Lot
              </button>
              <button
                type="button"
                @click="addItem"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <i class="fas fa-plus mr-2"></i>
                เพิ่มรายการ
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="formData.items.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-inbox text-3xl mb-2"></i>
            <p>ยังไม่มีรายการสินค้า</p>
            <p class="text-sm">คลิก "เพิ่มรายการ" เพื่อเริ่มต้น</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white"
            >
              <!-- Header with Product Info (Compact) -->
              <div v-if="item.lot_id" class="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b border-purple-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <!-- Product Image -->
                    <div v-if="item.product_image_url" class="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-white border border-purple-200 shadow-sm">
                      <img 
                        :src="item.product_image_url" 
                        :alt="item.description"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                      />
                    </div>
                    
                    <!-- SKU Badge -->
                    <span class="inline-flex items-center px-2.5 py-1 bg-white border border-purple-300 text-purple-900 text-xs font-mono font-bold rounded-md shadow-sm flex-shrink-0">
                      {{ item.sku || 'N/A' }}
                    </span>
                    
                    <!-- Product Name & Lot Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-purple-900 truncate">
                        {{ item.description }}
                      </h4>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="inline-flex items-center text-xs text-purple-700 font-mono">
                          <i class="fas fa-lock mr-1 text-[10px]"></i>
                          {{ item.lot_code }}
                        </span>
                        <span v-if="item.is_full_roll" class="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">
                          <i class="fas fa-layer-group mr-1"></i>
                          ยกทั้งม้วน
                        </span>
                        <span v-if="item.max_quantity" class="text-[10px] text-purple-600">
                          (พร้อมใช้: {{ item.max_quantity }} ม.)
                        </span>
                      </div>
                    </div>
                    
                    <!-- Change Lot Button (Compact) -->
                    <button
                      type="button"
                      @click="showProductModal"
                      class="flex-shrink-0 px-3 py-1.5 border border-purple-600 text-purple-600 bg-white rounded-md hover:bg-purple-50 transition-colors text-xs font-medium"
                      title="เปลี่ยน Lot"
                    >
                      <i class="fas fa-sync-alt"></i>
                    </button>
                  </div>
                  
                  <!-- Delete Button -->
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="ml-3 flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    title="ลบรายการ"
                  >
                    <i class="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Regular Product Header (Non-Lot) -->
              <div v-else-if="item.product_id || item.description" class="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <!-- Product Image -->
                    <div v-if="item.product_image_url" class="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-white border border-gray-300 shadow-sm">
                      <img 
                        :src="item.product_image_url" 
                        :alt="item.description"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                      />
                    </div>
                    
                    <span v-if="item.sku" class="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-mono font-semibold rounded">
                      {{ item.sku }}
                    </span>
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.description || 'ไม่ระบุชื่อสินค้า' }}</p>
                  </div>
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="ml-2 flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <i class="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="p-4">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                  <!-- Product Selection (Only show if not lot-based) -->
                  <div v-if="!item.lot_id" class="lg:col-span-5">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      รายการสินค้า
                    </label>
                    <select
                      v-model="item.product_id"
                      @change="onProductItemChange(item)"
                      :disabled="products.length === 0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      :class="{ 'bg-gray-100': products.length === 0 }"
                    >
                      <option value="">
                        {{ products.length === 0 ? '-- กำลังโหลด... --' : '-- เลือกสินค้า --' }}
                      </option>
                      <option 
                        v-for="product in products" 
                        :key="product.id" 
                        :value="product.id"
                      >
                        {{ product.product_name }} ({{ product.sku }})
                      </option>
                    </select>
                    <input
                      v-if="!item.product_id"
                      v-model="item.description"
                      type="text"
                      placeholder="หรือพิมพ์ชื่อสินค้าเอง"
                      class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  
                  <!-- Quantity -->
                  <div :class="item.lot_id ? 'lg:col-span-2' : 'lg:col-span-2'">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      จำนวน
                      <span v-if="item.is_full_roll" class="text-green-600 font-semibold">
                        (ทั้งม้วน)
                      </span>
                      <span v-else-if="item.max_quantity" class="text-gray-500 font-normal">
                        (สูงสุด: {{ item.max_quantity }})
                      </span>
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        :max="item.max_quantity || undefined"
                        step="0.01"
                        required
                        :readonly="item.is_full_roll"
                        :disabled="item.is_full_roll"
                        @input="calculateItemTotal(item)"
                        class="w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        :class="{ 
                          'border-orange-400 bg-orange-50': item.max_quantity && item.quantity > item.max_quantity && !item.is_full_roll,
                          'bg-green-50 border-green-400 text-green-900': item.is_full_roll,
                          'border-gray-300': !item.is_full_roll && !(item.max_quantity && item.quantity > item.max_quantity)
                        }"
                      />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                        {{ item.unit || 'ชิ้น' }}
                      </span>
                    </div>
                    <p v-if="item.is_full_roll" class="text-[10px] text-green-600 mt-0.5 flex items-center">
                      <i class="fas fa-lock mr-1"></i>
                      ล็อคจำนวน
                    </p>
                    <p v-else-if="item.max_quantity && item.quantity > item.max_quantity" class="text-[10px] text-orange-600 mt-0.5 flex items-center">
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      เกินจำนวนที่มี
                    </p>
                  </div>
                  
                  <!-- Unit Price -->
                  <div :class="item.lot_id ? 'lg:col-span-2' : 'lg:col-span-2'">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      ราคา/หน่วย
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">฿</span>
                      <input
                        v-model.number="item.unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        @input="calculateItemTotal(item)"
                        class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-right"
                      />
                    </div>
                  </div>
                  
                  <!-- Total -->
                  <div :class="item.lot_id ? 'lg:col-span-3' : 'lg:col-span-3'">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      รวม
                    </label>
                    <div class="relative">
                      <input
                        :value="formatCurrency(item.total)"
                        type="text"
                        readonly
                        class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-bold text-blue-900 text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Discount Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">ส่วนลด</h3>
              <p class="text-sm text-gray-600">เพิ่มส่วนลดหลายรายการได้</p>
            </div>
            <button
              type="button"
              @click="addDiscount"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มส่วนลด
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="formData.discount_items.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-percentage text-3xl mb-2"></i>
            <p>ยังไม่มีส่วนลด</p>
            <p class="text-sm">คลิก "เพิ่มส่วนลด" เพื่อเริ่มต้น</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="(discount, index) in formData.discount_items"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-green-50/30"
            >
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <!-- Discount Description -->
                <div class="md:col-span-5">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    รายละเอียดส่วนลด
                  </label>
                  <input
                    v-model="discount.description"
                    type="text"
                    placeholder="เช่น ส่วนลดลูกค้าประจำ, ส่วนลดช่วงโปรโมชั่น"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    @input="updateTotals"
                  />
                </div>
                
                <!-- Discount Type -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    ประเภท
                  </label>
                  <select
                    v-model="discount.discount_type"
                    @change="updateTotals"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                
                <!-- Discount Value -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    {{ discount.discount_type === 'percentage' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน' }}
                  </label>
                  <input
                    v-model.number="discount.discount_value"
                    type="number"
                    :min="0"
                    :max="discount.discount_type === 'percentage' ? 100 : undefined"
                    step="0.01"
                    @input="updateTotals"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                
                <!-- Calculated Discount Amount -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    ส่วนลด
                  </label>
                  <input
                    :value="formatCurrency(calculateDiscountAmount(discount))"
                    type="text"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-semibold text-green-600"
                  />
                </div>
                
                <!-- Remove Button -->
                <div class="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    @click="removeDiscount(index)"
                    class="w-full md:w-auto px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors text-sm"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">สรุปยอดรวม</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">ยอดรวมสินค้า:</span>
              <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
            </div>
            
            <!-- Discount Breakdown -->
            <div v-if="formData.discount_items.length > 0" class="border-t border-gray-200 pt-3 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 font-semibold">ส่วนลด:</span>
                <span class="font-semibold text-green-600">-{{ formatCurrency(totalDiscount) }}</span>
              </div>
              <div
                v-for="(discount, index) in formData.discount_items"
                :key="index"
                class="flex justify-between text-xs text-gray-500 pl-4"
              >
                <span>
                  <i class="fas fa-arrow-right mr-1"></i>
                  {{ discount.description || 'ส่วนลด ' + (index + 1) }}
                  <span v-if="discount.discount_type === 'percentage'" class="text-green-600 font-medium">
                    ({{ discount.discount_value }}%)
                  </span>
                </span>
                <span class="text-green-600">-{{ formatCurrency(calculateDiscountAmount(discount)) }}</span>
              </div>
            </div>
            
            <div v-if="formData.discount_items.length > 0" class="flex justify-between text-sm border-t border-gray-200 pt-3">
              <span class="text-gray-600">ยอดรวมหลังหักส่วนลด:</span>
              <span class="font-semibold">{{ formatCurrency(subtotalAfterDiscount) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">ภาษีมูลค่าเพิ่ม ({{ formData.vat_rate }}%):</span>
              <span class="font-medium">{{ formatCurrency(vatAmount) }}</span>
            </div>
            
            <hr class="border-gray-200">
            
            <div class="flex justify-between text-lg font-bold">
              <span class="text-gray-900">ยอดรวมทั้งสิ้น:</span>
              <span class="text-blue-600">{{ formatCurrency(grandTotal) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">หมายเหตุ</h3>
        </div>
        
        <div class="p-6">
          <textarea
            v-model="formData.notes"
            rows="4"
            placeholder="เพิ่มหมายเหตุหรือข้อมูลเพิ่มเติม..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4">
          <!-- Validation Warning -->
          <div v-if="!canSubmit && formData.items.length > 0" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-start">
              <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5 mr-2"></i>
              <div class="text-sm text-yellow-800">
                <p class="font-semibold mb-1">กรุณาตรวจสอบข้อมูลก่อนบันทึก:</p>
                <ul class="list-disc ml-5 space-y-1">
                  <li v-if="!formData.customer_id">กรุณาเลือกลูกค้า</li>
                  <li v-if="!formData.quotation_date">กรุณาระบุวันที่เสนอราคา</li>
                  <li v-if="formData.items.length === 0">กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ</li>
                  <li v-if="formData.items.some(item => !item.description)">บางรายการไม่มีรายละเอียดสินค้า</li>
                  <li v-if="formData.items.some(item => !item.quantity || item.quantity <= 0)">บางรายการมีจำนวนไม่ถูกต้อง</li>
                  <li v-if="formData.items.some(item => item.unit_price < 0)">บางรายการมีราคาไม่ถูกต้อง</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              @click="saveDraft"
              :disabled="loading || navigating"
              class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-save mr-2"></i>
              บันทึกร่าง
            </button>
            
            <button
              type="submit"
              :disabled="loading || navigating || !canSubmit"
              class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="!canSubmit ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : ''"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              {{ loading ? 'กำลังบันทึก...' : (mode === 'create' ? 'สร้างใบเสนอราคา' : 'บันทึกการแก้ไข') }}
            </button>
          </div>
        </div>
      </div>

      </form>
    </div>

    <!-- Product Selection Modal Component -->
    <QuotationProductModal
      v-model="showInventoryModal"
      @select-product="selectProduct"
      @select-product-with-lot="selectProductWithLot"
    />

    <!-- Lot Selection Method Modal (Legacy - ไม่ควรใช้แล้วกับ QuotationProductModal) -->
    <div 
      v-if="showLotMethodModal && selectedLotForMethod && selectedProductForMethod" 
      :key="`method-modal-${selectedLotForMethod._id || selectedLotForMethod.lot_code}`"
      class="modal-overlay" 
      @click="showLotMethodModal = false"
    >
      <div class="modal-content" @click.stop style="max-width: 500px;">
        <div class="modal-header">
          <h3>
            <i class="fas fa-scroll mr-2"></i>
            เลือกวิธีการสั่งซื้อ
          </h3>
          <button class="close-btn" @click="showLotMethodModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="text-sm font-semibold text-blue-900 mb-1">
              {{ selectedProductForMethod.product_name }}
            </div>
            <div class="text-xs text-blue-700">
              <span class="font-mono">{{ selectedLotForMethod.full_lot_code || selectedLotForMethod.lot_code }}</span>
              - คงเหลือ: <span class="font-semibold">{{ selectedLotForMethod.remaining_meters || 0 }} เมตร</span>
              ({{ selectedLotForMethod.weight_kg || 0 }} กก.)
            </div>
          </div>

          <div class="space-y-3">
            <!-- Option 1: ยกทั้งม้วน -->
            <div 
              @click="confirmLotSelection('full_roll')"
              class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center">
                    <i class="fas fa-layer-group text-purple-600 text-lg"></i>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">ยกทั้งม้วน</h4>
                  <p class="text-xs text-gray-600 mb-2">
                    รับผ้าทั้งม้วน {{ selectedLotForMethod.remaining_meters || 0 }} เมตร
                  </p>
                  <div class="flex items-center text-xs text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>
                    ไม่ต้องระบุจำนวน
                  </div>
                </div>
              </div>
            </div>

            <!-- Option 2: ระบุจำนวนเมตร -->
            <div 
              @click="confirmLotSelection('custom_meters')"
              class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                    <i class="fas fa-ruler-horizontal text-blue-600 text-lg"></i>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">ระบุจำนวนเมตร</h4>
                  <p class="text-xs text-gray-600 mb-2">
                    ตัดตามจำนวนที่ต้องการ (สูงสุด {{ selectedLotForMethod.remaining_meters || 0 }} ม.)
                  </p>
                  <div class="flex items-center text-xs text-blue-600">
                    <i class="fas fa-edit mr-1"></i>
                    กำหนดจำนวนเองได้
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showLotMethodModal = false" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'
import QuotationProductModal from './QuotationProductModal.vue'
import { inventoryService } from '@/services/InventoryService.js'

export default {
  name: 'QuotationForm',
  components: {
    ErpBreadcrumb,
    QuotationProductModal
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator: value => ['create', 'edit'].includes(value)
    },
    recordId: {
      type: String,
      default: null
    }
  },
  emits: ['saved', 'cancel', 'navigate'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    
    // ✅ Initialize InventoryService
    if (!inventoryService.isReady()) {
      inventoryService.initialize(window.vueApp?.config?.globalProperties)
      console.log('🔧 [QuotationForm] InventoryService initialized')
    }
    
    // ✅ Provide InventoryService to child components (QuotationProductModal)
    provide('inventoryService', inventoryService)
    
    // ✅ Safe SalesService injection
    let salesService = null
    try {
      salesService = inject('salesService')
      if (!salesService) {
        console.log('[Quotation Form] No injected SalesService, will import dynamically')
      }
    } catch (err) {
      console.log('[Quotation Form] Injection failed, will import SalesService:', err.message)
    }

    // Breadcrumb Navigation
    const breadcrumbNav = computed(() => {
      const baseBreadcrumb = [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
        { name: 'Quotations', path: '/sales/quotation', icon: 'fas fa-file-alt' }
      ]
      
      if (props.mode === 'create') {
        return [...baseBreadcrumb, { name: 'Create Quotation' }]
      } else {
        return [...baseBreadcrumb, { name: 'Edit Quotation' }]
      }
    })

    // State
    const loading = ref(false)
    const navigating = ref(false)
    const error = ref(null)
    const successMessage = ref(null)
    const customers = ref([])
    const selectedCustomer = ref(null)
    const products = ref([]) // ✅ เพิ่มตัวแปร products สำหรับ dropdown (ไม่ได้ใช้แล้วเพราะมี QuotationProductModal)
    const codePreview = ref('')
    const codeGenerationInfo = ref('')

    // Customer search state
    const customerSearchQuery = ref('')
    const showCustomerDropdown = ref(false)

    // Modal state
    const showInventoryModal = ref(false)

    // Lot Method Modal state
    const showLotMethodModal = ref(false)
    const selectedProductForMethod = ref(null)
    const selectedLotForMethod = ref(null)

    // Form data
    const formData = ref({
      quote_number: '',
      quotation_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      customer_id: '',
      status: 'draft',
      items: [],
      discount_items: [], // ส่วนลดหลายรายการ
      notes: '',
      subtotal: 0, // ยอดรวมก่อนส่วนลด
      total_discount: 0, // ส่วนลดรวม
      subtotal_after_discount: 0, // ยอดรวมหลังหักส่วนลด
      vat_rate: 7,
      vat_amount: 0, // ภาษีคำนวณจาก subtotal_after_discount
      total_amount: 0 // ยอดรวมสุทธิ
    })

    // Computed properties
    const subtotal = computed(() => {
      return formData.value.items.reduce((sum, item) => sum + (item.total || 0), 0)
    })

    const totalDiscount = computed(() => {
      return formData.value.discount_items.reduce((sum, discount) => {
        if (discount.discount_type === 'percentage') {
          return sum + (subtotal.value * (discount.discount_value / 100))
        } else if (discount.discount_type === 'fixed') {
          return sum + (discount.discount_value || 0)
        }
        return sum
      }, 0)
    })

    const subtotalAfterDiscount = computed(() => {
      return Math.max(0, subtotal.value - totalDiscount.value)
    })

    const vatAmount = computed(() => {
      return subtotalAfterDiscount.value * (formData.value.vat_rate / 100)
    })

    const grandTotal = computed(() => {
      return subtotalAfterDiscount.value + vatAmount.value
    })

    const canSubmit = computed(() => {
      const hasCustomer = !!formData.value.customer_id
      const hasDate = !!formData.value.quotation_date
      const hasItems = formData.value.items.length > 0
      const allItemsValid = formData.value.items.every(item => 
        item.description && 
        item.quantity > 0 && 
        item.unit_price >= 0
      )
      
      const result = hasCustomer && hasDate && hasItems && allItemsValid
      
      // Debug log when validation fails
      if (!result) {
        console.log('[Quotation Form] canSubmit = false:', {
          hasCustomer,
          hasDate,
          hasItems,
          allItemsValid,
          items: formData.value.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            valid: !!(item.description && item.quantity > 0 && item.unit_price >= 0)
          }))
        })
      }
      
      return result
    })

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }

    const calculateItemTotal = (item) => {
      item.total = (item.quantity || 0) * (item.unit_price || 0)
      updateTotals()
    }

    const updateTotals = () => {
      formData.value.subtotal = subtotal.value
      formData.value.total_discount = totalDiscount.value
      formData.value.subtotal_after_discount = subtotalAfterDiscount.value
      formData.value.vat_amount = vatAmount.value
      formData.value.total_amount = grandTotal.value
    }

    const addItem = () => {
      formData.value.items.push({
        product_id: '', // ✅ เพิ่ม product_id
        sku: '',        // ✅ เพิ่ม SKU
        product_code: '', // ✅ เพิ่ม product_code
        description: '',
        quantity: 1,
        unit: 'ชิ้น',
        unit_price: 0,
        total: 0
      })
    }

    const removeItem = (index) => {
      formData.value.items.splice(index, 1)
      updateTotals()
    }

    // Discount management
    const addDiscount = () => {
      formData.value.discount_items.push({
        description: '',
        discount_type: 'percentage', // 'percentage' or 'fixed'
        discount_value: 0,
        discount_amount: 0
      })
    }

    const removeDiscount = (index) => {
      formData.value.discount_items.splice(index, 1)
      updateTotals()
    }

    const calculateDiscountAmount = (discount) => {
      if (discount.discount_type === 'percentage') {
        return subtotal.value * (discount.discount_value / 100)
      } else if (discount.discount_type === 'fixed') {
        return discount.discount_value || 0
      }
      return 0
    }

    const onCustomerChange = async () => {
      if (formData.value.customer_id) {
        selectedCustomer.value = customers.value.find(c => c.id === formData.value.customer_id)
      } else {
        selectedCustomer.value = null
      }
    }

    // Customer search methods
    const filteredCustomers = computed(() => {
      if (!customerSearchQuery.value) return customers.value

      const search = customerSearchQuery.value.toLowerCase()
      return customers.value.filter(customer => {
        return (
          customer.name?.toLowerCase().includes(search) ||
          customer.customer_code?.toLowerCase().includes(search) ||
          customer.phone?.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search)
        )
      })
    })

    const onCustomerInput = () => {
      showCustomerDropdown.value = true
      // If user clears the input, also clear the selection
      if (!customerSearchQuery.value) {
        formData.value.customer_id = ''
        selectedCustomer.value = null
      }
    }

    const selectCustomer = (customer, newCustomerName = null) => {
      if (customer) {
        formData.value.customer_id = customer.id
        selectedCustomer.value = customer
        customerSearchQuery.value = customer.name || ''
      } else if (newCustomerName) {
        // Create new customer - navigate to customer form or show modal
        alert(`สร้างลูกค้าใหม่: ${newCustomerName}\n(ฟีเจอร์นี้จะถูกพัฒนาต่อไป)`)
      }
      showCustomerDropdown.value = false
    }

    const hideCustomerDropdown = () => {
      setTimeout(() => {
        showCustomerDropdown.value = false
      }, 200)
    }

    const clearCustomer = () => {
      formData.value.customer_id = ''
      selectedCustomer.value = null
      customerSearchQuery.value = ''
    }

    const formatCustomerStatus = (status) => {
      const statusMap = {
        active: 'ใช้งาน',
        inactive: 'ไม่ใช้งาน',
        pending: 'รออนุมัติ'
      }
      return statusMap[status] || status
    }

    // ✅ Code Generation Methods
    const generateQuotationCode = async () => {
      try {
        console.log('[Quotation Form] 🔢 Generating quotation code using ERP Code Manager...')
        
        // Force clear form first
        formData.value.quote_number = ''
        
        // ✅ Strategy 1: Use ERP Code Manager (PRIMARY METHOD)
        if (window.ERP_CORE?.codeManager) {
          try {
            const result = await window.ERP_CORE.codeManager.generateCode('quotation')
            if (result?.code) {
              formData.value.quote_number = result.code
              codePreview.value = result.code
              codeGenerationInfo.value = `📋 สร้างจาก Code Manager: ${result.pattern || 'default'}`
              console.log(`[Quotation Form] ✅ Generated code from Code Manager: ${result.code}`)
              return
            }
          } catch (codeManagerError) {
            console.warn('[Quotation Form] Code Manager failed:', codeManagerError)
          }
        } else {
          console.log('[Quotation Form] ❌ No ERP_CORE.codeManager available')
        }
        
        // ✅ Strategy 2: Use MongoDB number_series.quotation config (PRIMARY DATABASE SOURCE)
        console.log('[Quotation Form] 🔄 Fallback to MongoDB number_series.quotation config...')
        const numberSeriesConfig = await loadQuotationNumberSeriesConfig()
        
        if (numberSeriesConfig) {
          try {
            // Use same logic as Customer Form but with MongoDB config
            const now = new Date()
            const year = numberSeriesConfig.config_data.format.includes('{year}') ? now.getFullYear().toString().slice(-2) : ''
            
            // Get next sequence from MongoDB config
            const nextSequence = numberSeriesConfig.config_data.sequence.next
            const sequenceStr = nextSequence.toString().padStart(numberSeriesConfig.config_data.sequence.digits, '0')
            
            // Format using MongoDB config format
            let code = numberSeriesConfig.config_data.format
            code = code.replace('{prefix}', numberSeriesConfig.config_data.prefix)
            code = code.replace('{year}', year)
            code = code.replace('{sequence}', sequenceStr)
            
            formData.value.quote_number = code
            codePreview.value = code
            codeGenerationInfo.value = `📋 สร้างจาก MongoDB Config: ${numberSeriesConfig.name || 'number_series.quotation'}`
            console.log(`[Quotation Form] ✅ Generated code from MongoDB config: ${code}`)
            return
          } catch (configError) {
            console.warn('[Quotation Form] MongoDB config failed:', configError)
          }
        }
        
        // ✅ Strategy 3: Use SalesService (manual fallback)
        console.log('[Quotation Form] 🔄 Fallback to SalesService...')
        let code
        if (salesService && salesService.generateQuotationNumber) {
          code = await salesService.generateQuotationNumber()
        } else {
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          code = await newSalesService.generateQuotationNumber()
        }
        
        formData.value.quote_number = code
        codePreview.value = code
        codeGenerationInfo.value = '🔢 สร้างจาก SalesService'
        console.log(`[Quotation Form] ✅ Generated code from SalesService: ${code}`)
        
      } catch (error) {
        console.error('[Quotation Form] ❌ Failed to generate quotation code:', error)
        
        // ✅ Emergency fallback - Simple timestamp-based code
        const timestamp = Date.now().toString().slice(-4)
        const fallbackCode = `QT${timestamp}`
        formData.value.quote_number = fallbackCode
        codePreview.value = fallbackCode
        codeGenerationInfo.value = '🆘 รหัสสำรอง (เกิดข้อผิดพลาด)'
        console.log(`[Quotation Form] 🆘 Emergency fallback code: ${fallbackCode}`)
      }
    }

    const calculateNextQuotationSequence = async () => {
      try {
        console.log('[Quotation Form] 📊 Calculating next quotation sequence using Code Manager first...')
        
        // ✅ Strategy 1: Use ERP Code Manager to get next sequence
        if (window.ERP_CORE?.codeManager) {
          try {
            const nextCode = await window.ERP_CORE.codeManager.getNextSequence('quotation')
            if (nextCode) {
              console.log(`[Quotation Form] ✅ Got sequence from Code Manager: ${nextCode}`)
              return nextCode
            }
          } catch (codeManagerError) {
            console.warn('[Quotation Form] Code Manager sequence failed:', codeManagerError)
          }
        }
        
        // ✅ Strategy 2: Use MongoDB config to get current sequence
        const numberSeriesConfig = await loadQuotationNumberSeriesConfig()
        if (numberSeriesConfig?.config_data?.sequence) {
          const nextSequence = numberSeriesConfig.config_data.sequence.next
          console.log(`[Quotation Form] ✅ Got sequence from MongoDB: ${nextSequence}`)
          return nextSequence
        }
        
        // ✅ Strategy 3: Use SalesService to get existing quotations (fallback)
        if (salesService) {
          try {
            const quotations = await salesService.getAllQuotations()
            const existingCodes = quotations
              .filter(q => q.quote_number && q.quote_number.startsWith('SQX'))
              .map(q => parseInt(q.quote_number.replace(/\D/g, '').slice(-4)) || 0)
            const maxSequence = Math.max(...existingCodes, 0)
            const nextSequence = maxSequence + 1
            console.log(`[Quotation Form] ✅ Calculated next sequence from existing: ${nextSequence}`)
            return nextSequence
          } catch (salesError) {
            console.warn('[Quotation Form] SalesService sequence failed:', salesError)
          }
        }
        
        // ✅ Final fallback
        console.warn('[Quotation Form] ⚠️ All methods failed, using fallback sequence: 1')
        return 1
        
      } catch (error) {
        console.error('[Quotation Form] ❌ Error calculating sequence:', error)
        return 1
      }
    }

    // ✅ Load MongoDB Number Series Configuration
    const loadQuotationNumberSeriesConfig = async () => {
      try {
        console.log('[Quotation Form] 📋 Loading number_series.quotation from MongoDB...')
        
        // Try to get config from MongoDB through ERP Core or Transaction Engine
        let config = null
        
        // Strategy 1: Use ERP Core if available
        if (window.ERP_CORE?.engine?.getConfig) {
          try {
            config = await window.ERP_CORE.engine.getConfig('number_series.quotation')
          } catch (err) {
            console.warn('[Quotation Form] ERP Core getConfig failed:', err)
          }
        }
        
        // Strategy 2: Use Transaction Engine directly
        if (!config && window.ERP_CORE?.engine?.find) {
          try {
            const results = await window.ERP_CORE.engine.find('configs', { 
              config_key: 'number_series.quotation' 
            })
            config = results.length > 0 ? results[0] : null
          } catch (err) {
            console.warn('[Quotation Form] Transaction Engine find failed:', err)
          }
        }
        
        // Strategy 3: Use SalesService if it has config access
        if (!config && salesService?.getConfig) {
          try {
            config = await salesService.getConfig('number_series.quotation')
          } catch (err) {
            console.warn('[Quotation Form] SalesService getConfig failed:', err)
          }
        }
        
        // Strategy 4: Use direct fetch to API (last resort)
        if (!config) {
          try {
            const response = await fetch('/api/configs/number_series.quotation')
            if (response.ok) {
              const data = await response.json()
              config = data.data || data
            }
          } catch (err) {
            console.warn('[Quotation Form] Direct API fetch failed:', err)
          }
        }
        
        if (config) {
          console.log('[Quotation Form] ✅ Loaded MongoDB config:', {
            config_key: config.config_key,
            prefix: config.config_data?.prefix,
            format: config.config_data?.format,
            next_sequence: config.config_data?.sequence?.next
          })
          return config
        } else {
          console.warn('[Quotation Form] ❌ No MongoDB config found for number_series.quotation')
          return null
        }
        
      } catch (error) {
        console.error('[Quotation Form] ❌ Error loading MongoDB config:', error)
        return null
      }
    }

    const updateCodePreview = async () => {
      try {
        console.log('[Quotation Form] 🔍 Updating code preview...')
        
        // แสดงรหัสที่จะได้จริงๆ โดยคำนวณจาก MongoDB config
        try {
          const numberSeriesConfig = await loadQuotationNumberSeriesConfig()
          if (numberSeriesConfig?.config_data) {
            const now = new Date()
            const year = numberSeriesConfig.config_data.format.includes('{year}') ? now.getFullYear().toString().slice(-2) : ''
            
            // Get next sequence from MongoDB config
            const nextSequence = numberSeriesConfig.config_data.sequence.next
            const sequenceStr = nextSequence.toString().padStart(numberSeriesConfig.config_data.sequence.digits, '0')
            
            // Format using MongoDB config format
            let previewCode = numberSeriesConfig.config_data.format
            previewCode = previewCode.replace('{prefix}', numberSeriesConfig.config_data.prefix)
            previewCode = previewCode.replace('{year}', year)
            previewCode = previewCode.replace('{sequence}', sequenceStr)
            
            codePreview.value = previewCode
            codeGenerationInfo.value = numberSeriesConfig.description || 'รหัสจาก MongoDB Configuration'
            return
          }
        } catch (seqError) {
          console.warn('[Quotation Form] MongoDB preview calculation failed:', seqError)
        }
        
        // Fallback: show template from MongoDB example data
        codePreview.value = 'SQX20250001'
        codeGenerationInfo.value = 'รูปแบบรหัสใบเสนอราคา (MongoDB Template)'
        
      } catch (error) {
        console.warn('[Quotation Form] Error updating code preview:', error)
        codePreview.value = 'QT202500001'
        codeGenerationInfo.value = 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า'
      }
    }

    const loadCustomers = async () => {
      try {
        let customersData = []
        if (salesService && salesService.getAllCustomers) {
          customersData = await salesService.getAllCustomers()
        } else {
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          customersData = await newSalesService.getAllCustomers()
        }
        
        customers.value = customersData || []
        console.log(`[Quotation Form] Loaded ${customers.value.length} customers`)
      } catch (err) {
        console.error('[Quotation Form] Error loading customers:', err)
        error.value = 'ไม่สามารถโหลดรายชื่อลูกค้าได้'
      }
    }

    // ✅ Modal Functions
    const showProductModal = async () => {
      console.log('[Quotation Form] 🔍 Opening product selection modal...')
      
      // Show modal (QuotationProductModal จะโหลดข้อมูลเอง)
      showInventoryModal.value = true
    }

    // ✅ Select product functions
    const selectProduct = (item) => {
      // For non-textile products, add directly
      if (item.category !== 'textile') {
        addItem()
        const lastItem = formData.value.items[formData.value.items.length - 1]
        lastItem.product_id = item.id
        lastItem.description = item.product_name
        lastItem.unit_price = item.unit_price
        lastItem.unit = item.unit
        lastItem.sku = item.sku
        lastItem.product_image_url = item.product_image_url // ✅ เพิ่มรูปสินค้า
        
        // Calculate total
        calculateItemTotal(lastItem)
        
        showInventoryModal.value = false
        console.log('[Quotation Form] Added product:', item.sku)
      } else {
        // For textile products, require lot selection
        console.log('[Quotation Form] Textile product requires lot selection')
      }
    }

    const selectProductWithLot = (data) => {
      // รับ object จาก ProductInventoryModal component
      const { product, lot, method, customMeters } = data
      
      console.log('[Quotation Form] selectProductWithLot called:', { 
        product: product?.sku, 
        lot: lot?.lot_code, 
        method,
        customMeters,
        retail_price: product?.retail_price,
        wholesale_price: product?.wholesale_price,
        unit_price: product?.unit_price
      })
      
      // ถ้า method ส่งมาจาก component แล้ว ให้ confirm ทันที
      if (method) {
        selectedProductForMethod.value = product
        selectedLotForMethod.value = lot
        confirmLotSelection(method, customMeters)
        return
      }
      
      // แบบเดิม: แทนที่จะเพิ่มทันที ให้เปิด modal เลือกวิธีการ
      // (ไม่ควรเข้ามาในส่วนนี้แล้ว เพราะ QuotationProductModal จะส่ง method มาเสมอ)
      console.warn('[Quotation Form] No method provided - this should not happen with QuotationProductModal')
      selectedProductForMethod.value = product || data
      selectedLotForMethod.value = lot
      showInventoryModal.value = false
      showLotMethodModal.value = true
      
      console.log('[Quotation Form] Opening lot method selection for:', {
        product: product?.sku || data?.sku,
        lot: lot?.full_lot_code || lot?.lot_code,
        remaining: lot?.remaining_meters
      })
    }

    const confirmLotSelection = (method, customMeters = null) => {
      if (!selectedProductForMethod.value || !selectedLotForMethod.value) {
        console.error('[Quotation Form] No product or lot selected')
        return
      }

      const item = selectedProductForMethod.value
      const lot = selectedLotForMethod.value

      // คำนวณจำนวนที่พร้อมใช้ (หลังหักจอง)
      const availableMeters = lot.available_meters || 
                             (lot.remaining_meters - (lot.total_reserved_meters || 0))

      console.log('[Quotation Form] Lot calculation:', {
        lot_code: lot.full_lot_code || lot.lot_code,
        available_meters: lot.available_meters,
        remaining_meters: lot.remaining_meters,
        total_reserved_meters: lot.total_reserved_meters,
        calculated_availableMeters: availableMeters
      })

      // ตรวจสอบว่า formData.value.items เป็น array
      if (!Array.isArray(formData.value.items)) {
        console.error('[Quotation Form] formData.items is not an array')
        formData.value.items = []
      }

      addItem()
      
      // ตรวจสอบว่าเพิ่ม item สำเร็จ
      if (!formData.value.items || formData.value.items.length === 0) {
        console.error('[Quotation Form] Failed to add item')
        return
      }
      
      const lastItem = formData.value.items[formData.value.items.length - 1]
      
      lastItem.product_id = item.id
      lastItem.unit = 'เมตร'
      lastItem.sku = item.sku
      lastItem.product_image_url = item.product_image_url // ✅ เพิ่มรูปสินค้า
      lastItem.lot_id = lot._id // ✅ ใช้ lot._id (ObjectId reference)
      lastItem.lot_code = lot.full_lot_code || lot.lot_code
      lastItem.max_quantity = availableMeters

      if (method === 'full_roll') {
        // ยกทั้งม้วน - ใช้ราคาขายส่ง (wholesale_price)
        const wholesalePrice = item.wholesale_price || item.unit_price || 0
        lastItem.description = `${item.product_name} (${lot.full_lot_code || lot.lot_code}) - ยกทั้งม้วน`
        lastItem.quantity = availableMeters
        lastItem.unit_price = wholesalePrice
        lastItem.is_full_roll = true
        console.log('[Quotation Form] Added full roll:', {
          meters: availableMeters,
          wholesalePrice,
          hasWholesalePrice: !!item.wholesale_price,
          productPrices: {
            wholesale: item.wholesale_price,
            retail: item.retail_price,
            unit: item.unit_price
          }
        })
      } else {
        // ระบุจำนวนเมตร - ใช้ราคาขายปลีก (retail_price)
        const retailPrice = item.retail_price || item.unit_price || 0
        const meters = customMeters || 1 // ใช้ customMeters ถ้ามี
        lastItem.description = `${item.product_name} (${lot.full_lot_code || lot.lot_code})`
        lastItem.quantity = meters
        lastItem.unit_price = retailPrice
        lastItem.is_full_roll = false
        console.log('[Quotation Form] Added custom meters:', {
          meters,
          retailPrice,
          hasRetailPrice: !!item.retail_price,
          hasCustomMeters: !!customMeters,
          productPrices: {
            wholesale: item.wholesale_price,
            retail: item.retail_price,
            unit: item.unit_price
          }
        })
      }

      calculateItemTotal(lastItem)
      
      // ปิด modal
      showLotMethodModal.value = false
      selectedProductForMethod.value = null
      selectedLotForMethod.value = null
      
      if (window.$toast) {
        window.$toast.success(method === 'full_roll' 
          ? `เพิ่มทั้งม้วน ${availableMeters.toFixed(2)} เมตร เรียบร้อย`
          : 'เพิ่มสินค้า - กรุณาระบุจำนวนเมตร'
        )
      }
    }

    const loadQuotationData = async () => {
      if (props.mode !== 'edit' || !props.recordId) return

      try {
        loading.value = true
        error.value = null

        let result
        if (salesService && salesService.getQuotation) {
          result = await salesService.getQuotation(props.recordId)
        } else {
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getQuotation(props.recordId)
        }

        if (result && result.id) {
          Object.assign(formData.value, {
            quote_number: result.quote_number,
            quotation_date: result.quotation_date?.split('T')[0] || result.quotation_date,
            expiry_date: result.expiry_date?.split('T')[0] || result.expiry_date,
            customer_id: result.customer_id,
            status: result.status || 'draft',
            items: result.items || [],
            discount_items: result.discount_items || [],
            notes: result.notes || '',
            subtotal: result.subtotal || 0,
            total_discount: result.total_discount || 0,
            subtotal_after_discount: result.subtotal_after_discount || 0,
            vat_rate: result.vat_rate || 7,
            vat_amount: result.vat_amount || 0,
            total_amount: result.total_amount || 0
          })
          
          await onCustomerChange()
          
          // Set customerSearchQuery for display
          if (selectedCustomer.value) {
            customerSearchQuery.value = selectedCustomer.value.name || ''
          }
          
          updateTotals()
        }
      } catch (err) {
        console.error('[Quotation Form] Error loading quotation:', err)
        error.value = 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้'
      } finally {
        loading.value = false
      }
    }

    const submitForm = async () => {
      if (!canSubmit.value) return

      loading.value = true
      error.value = null
      successMessage.value = null

      try {
        // Prepare data
        const submitData = {
          ...formData.value,
          subtotal: subtotal.value,
          total_discount: totalDiscount.value,
          subtotal_after_discount: subtotalAfterDiscount.value,
          vat_amount: vatAmount.value,
          total_amount: grandTotal.value
        }

        let result
        if (props.mode === 'edit' && props.recordId) {
          // Update existing quotation
          if (salesService && salesService.updateQuotation) {
            result = await salesService.updateQuotation(props.recordId, submitData)
          } else {
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              newSalesService.initialize(window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.updateQuotation(props.recordId, submitData)
          }
        } else {
          // Create new quotation
          if (salesService && salesService.createQuotation) {
            result = await salesService.createQuotation(submitData)
          } else {
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              newSalesService.initialize(window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.createQuotation(submitData)
          }
        }

        if (result && result.success) {
          successMessage.value = props.mode === 'edit' 
            ? 'อัปเดตใบเสนอราคาเรียบร้อยแล้ว' 
            : 'สร้างใบเสนอราคาเรียบร้อยแล้ว'

          // Show success message
          if (window.$toast) {
            window.$toast.success(successMessage.value)
          }

          // Emit result
          emit('saved', {
            success: true,
            data: result.data,
            mode: props.mode
          })

          // Navigate back to quotation list
          setTimeout(async () => {
            if (!navigating.value) {
              navigating.value = true
              try {
                if (router) {
                  await router.push('/sales/quotation')
                }
              } catch (navError) {
                emit('navigate', { route: '/sales/quotation' })
              } finally {
                navigating.value = false
              }
            }
          }, 800)
        } else {
          throw new Error(result?.message || 'การบันทึกล้มเหลว')
        }
      } catch (err) {
        console.error('[Quotation Form] Submit error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการบันทึก'
      } finally {
        loading.value = false
      }
    }

    const saveDraft = async () => {
      formData.value.status = 'draft'
      await submitForm()
    }

    const navigateBack = async () => {
      if (navigating.value || loading.value) return

      navigating.value = true
      try {
        if (router) {
          await router.push('/sales/quotation')
        }
      } catch (navError) {
        emit('navigate', { route: '/sales/quotation' })
      } finally {
        navigating.value = false
      }
    }

    // Watch for changes to update totals
    watch(
      () => formData.value.items,
      () => updateTotals(),
      { deep: true }
    )

    // Initialize
    onMounted(async () => {
      console.log('[Quotation Form] Component mounted:', { mode: props.mode, recordId: props.recordId })
      
      try {
        await loadCustomers()
      } catch (err) {
        console.error('[Quotation Form] Error loading customers in onMounted:', err)
        // ไม่ throw error - ให้หน้าแสดงต่อ
      }
      
      // ✅ ไม่ต้องโหลด products - QuotationProductModal จะจัดการเอง
      
      try {
        // Update code preview
        await updateCodePreview()
      } catch (err) {
        console.error('[Quotation Form] Error updating code preview in onMounted:', err)
      }
      
      // Check for pre-selected customer from query parameters
      if (props.mode === 'create' && route.query.customer_id) {
        console.log('[Quotation Form] Pre-selecting customer from query:', route.query.customer_id)
        formData.value.customer_id = route.query.customer_id
        
        try {
          await onCustomerChange()
        } catch (err) {
          console.error('[Quotation Form] Error in onCustomerChange:', err)
        }
        
        // Show info message if coming from customer form
        if (route.query.from === 'customer-form' && window.$toast) {
          window.$toast.success('เลือกลูกค้าเรียบร้อยแล้ว สามารถเพิ่มรายการสินค้าได้')
        }
        
        try {
          // Generate code automatically for new quotation
          await generateQuotationCode()
        } catch (err) {
          console.error('[Quotation Form] Error generating quotation code:', err)
        }
      }
      
      if (props.mode === 'edit' && props.recordId) {
        try {
          await loadQuotationData()
        } catch (err) {
          console.error('[Quotation Form] Error loading quotation data:', err)
          error.value = 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้'
        }
      } else if (props.mode === 'create') {
        try {
          // Generate code for new quotation
          await generateQuotationCode()
        } catch (err) {
          console.error('[Quotation Form] Error generating code:', err)
        }
        
        // Set default expiry date (30 days from now)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        formData.value.expiry_date = expiryDate.toISOString().split('T')[0]
      }
    })

    return {
      loading,
      navigating,
      error,
      successMessage,
      customers,
      selectedCustomer,
      products, // ✅ เพิ่ม products สำหรับ template
      formData,
      subtotal,
      totalDiscount,
      subtotalAfterDiscount,
      vatAmount,
      grandTotal,
      canSubmit,
      codePreview,
      codeGenerationInfo,
      breadcrumbNav,
      // Customer search
      customerSearchQuery,
      showCustomerDropdown,
      filteredCustomers,
      // Modal state
      showInventoryModal,
      // Lot Method Modal state
      showLotMethodModal,
      selectedProductForMethod,
      selectedLotForMethod,
      // Methods
      formatCurrency,
      addItem,
      removeItem,
      calculateItemTotal,
      onCustomerChange,
      // Discount methods
      addDiscount,
      removeDiscount,
      calculateDiscountAmount,
      // Customer search methods
      onCustomerInput,
      selectCustomer,
      hideCustomerDropdown,
      clearCustomer,
      formatCustomerStatus,
      // Code generation
      generateQuotationCode,
      loadQuotationNumberSeriesConfig,
      calculateNextQuotationSequence,
      updateCodePreview,
      submitForm,
      saveDraft,
      navigateBack,
      // Modal methods
      showProductModal,
      selectProduct,
      selectProductWithLot,
      confirmLotSelection
    }
  }
}
</script>

<style scoped>
/* Customer Search Dropdown Styles */
.customer-search-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.customer-input-container {
  position: relative;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

.customer-input {
  padding-left: 38px !important;
  padding-right: 38px !important;
  transition: all 0.2s ease;
}

.customer-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.customer-input.border-green-500 {
  border-color: #10b981 !important;
}

.selected-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-size: 16px;
  pointer-events: none;
}

/* Customer Dropdown */
.customer-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
  animation: dropdownSlideDown 0.2s ease-out;
}

@keyframes dropdownSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dropdown-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.dropdown-count {
  font-size: 12px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 12px;
}

.customers-list {
  max-height: 340px;
  overflow-y: auto;
}

/* Customer Option */
.customer-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f3f4f6;
}

.customer-option:last-child {
  border-bottom: none;
}

.customer-option:hover {
  background: #f9fafb;
}

.customer-option.new-customer {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.customer-option.new-customer:hover {
  background: #dbeafe;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 16px;
  flex-shrink: 0;
}

.option-icon.new-icon {
  background: #3b82f6;
  color: white;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-description {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #374151;
}

.contact-person {
  color: #6b7280;
}

.option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
}

.customer-id {
  color: #9ca3af;
  font-family: monospace;
}

.option-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
}

.option-status.status-active {
  background: #d1fae5;
  color: #065f46;
}

.option-status.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.option-status.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.option-action {
  margin-left: 12px;
  color: #9ca3af;
  font-size: 12px;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
}

/* Selected Customer Display */
.selected-customer {
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: selectedFadeIn 0.3s ease-out;
}

@keyframes selectedFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selected-customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.selected-customer-info i {
  color: #10b981;
  font-size: 16px;
  flex-shrink: 0;
}

.selected-name {
  font-weight: 600;
  font-size: 14px;
  color: #065f46;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-id {
  font-size: 12px;
  color: #059669;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.clear-selection-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.clear-selection-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar Styling */
.modal-content ::-webkit-scrollbar {
  width: 8px;
}

.modal-content ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content ::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.modal-content ::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Modal Header */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}

.modal-header .close-btn:hover {
  color: #4b5563;
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

</style>