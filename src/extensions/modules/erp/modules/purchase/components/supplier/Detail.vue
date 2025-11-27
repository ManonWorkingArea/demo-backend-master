<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Deleted Warning Banner -->
    <div v-if="supplier && supplier.status === 'deleted'" class="bg-red-50 border-b border-red-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
          <div class="flex-1">
            <p class="text-red-800 font-medium">ผู้ขายนี้ถูกลบไปแล้ว</p>
            <p class="text-red-600 text-sm">ลบเมื่อ: {{ formatDateTime(supplier.deleted_at) }}</p>
          </div>
          <button 
            @click="restoreSupplier"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-undo mr-2"></i>
            กู้คืน
          </button>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack" 
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">รายละเอียดผู้ขาย</h1>
              <p class="mt-2 text-gray-600">{{ supplier?.supplier_code || recordId }}</p>
            </div>
          </div>
          <div v-if="supplier" class="flex space-x-3">
            <button 
              v-if="supplier.status !== 'deleted'"
              @click="editSupplier" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไขข้อมูล
            </button>
            <button 
              @click="printSupplier" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์ข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>

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
      <div v-else-if="!supplier" class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่พบข้อมูลผู้ขาย</h3>
          <p class="text-gray-600 mb-4">ไม่สามารถโหลดข้อมูลผู้ขายได้ หรือผู้ขายนี้อาจถูกลบไปแล้ว</p>
          <button 
            @click="goBack" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            กลับไปยังรายการ
          </button>
        </div>
      </div>

      <!-- Supplier Details -->
      <div v-else :class="['grid grid-cols-1 lg:grid-cols-3 gap-8', supplier.status === 'deleted' ? 'opacity-75' : '']">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Supplier Summary Card -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">{{ supplier.name }}</h2>
                  <p class="text-sm text-gray-600 font-mono">{{ supplier.supplier_code }}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full', getStatusBadgeClass(supplier.status)]">
                    {{ formatStatus(supplier.status) }}
                  </span>
                  <span :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full', getTypeBadgeClass(supplier.type)]">
                    {{ formatType(supplier.type) }}
                  </span>
                  <span v-if="supplier.rating" :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full', getRatingBadgeClass(supplier.rating)]">
                    {{ formatRating(supplier.rating) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-calendar-plus text-blue-500"></i>
                  <span>สร้างเมื่อ: {{ formatDate(supplier.createdAt) }}</span>
                </div>
                <div v-if="supplier.approved_at" class="flex items-center space-x-2">
                  <i class="fas fa-check-circle text-green-500"></i>
                  <span>อนุมัติเมื่อ: {{ formatDate(supplier.approved_at) }}</span>
                </div>
                <div v-if="supplier.last_order_date" class="flex items-center space-x-2">
                  <i class="fas fa-shopping-cart text-purple-500"></i>
                  <span>สั่งซื้อล่าสุด: {{ formatDate(supplier.last_order_date) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <i class="fas fa-boxes text-orange-500"></i>
                  <span>สินค้า: {{ supplier.products_count || 0 }} รายการ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                ข้อมูลพื้นฐาน
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ขาย</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ supplier.name }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัสผู้ขาย</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono">{{ supplier.supplier_code }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatType(supplier.type) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span :class="['inline-flex px-3 py-1 text-sm font-semibold rounded-full', getStatusBadgeClass(supplier.status)]">
                      {{ formatStatus(supplier.status) }}
                    </span>
                  </div>
                </div>
                <div v-if="supplier.tax_id">
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.tax_id }}</p>
                  </div>
                </div>
                <div v-if="supplier.business_number">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ทะเบียนการค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.business_number }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-address-book text-green-500 mr-2"></i>
                ข้อมูลการติดต่อ
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-if="supplier.contact_person">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.contact_person }}</p>
                  </div>
                </div>
                <div v-if="supplier.phone">
                  <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a :href="`tel:${supplier.phone}`" class="text-blue-600 hover:text-blue-800 font-mono">{{ supplier.phone }}</a>
                  </div>
                </div>
                <div v-if="supplier.email" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a :href="`mailto:${supplier.email}`" class="text-blue-600 hover:text-blue-800">{{ supplier.email }}</a>
                  </div>
                </div>
                <div v-if="supplier.website" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">เว็บไซต์</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a :href="supplier.website" target="_blank" class="text-blue-600 hover:text-blue-800">{{ supplier.website }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div v-if="supplier.address" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-map-marker-alt text-purple-500 mr-2"></i>
                ที่อยู่
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.address }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div v-if="supplier.province">
                    <label class="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ supplier.province }}</p>
                    </div>
                  </div>
                  <div v-if="supplier.postal_code">
                    <label class="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ supplier.postal_code }}</p>
                    </div>
                  </div>
                  <div v-if="supplier.country">
                    <label class="block text-sm font-medium text-gray-700 mb-2">ประเทศ</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ supplier.country }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Terms -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-money-check text-yellow-500 mr-2"></i>
                เงื่อนไขทางการเงิน
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เงื่อนไขการชำระเงิน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatPaymentTerms(supplier.payment_terms) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สกุลเงิน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.currency || 'THB' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วงเงินเครดิต</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono">{{ formatCurrency(supplier.credit_limit || 0) }}</p>
                  </div>
                </div>
                <div v-if="supplier.credit_days">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาเครดิต</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.credit_days }} วัน</p>
                  </div>
                </div>
                <div v-if="supplier.discount_percentage">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ส่วนลดที่ได้รับ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-green-600">{{ supplier.discount_percentage }}%</p>
                  </div>
                </div>
                <div v-if="supplier.lead_time_days">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลานำส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ supplier.lead_time_days }} วัน</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-cog text-indigo-500 mr-2"></i>
                ข้อมูลเพิ่มเติม
              </h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะการใช้งาน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span :class="['inline-flex px-2 py-1 text-sm font-semibold rounded-full', supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                      {{ supplier.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ต้องใช้ Purchase Order</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span :class="['inline-flex px-2 py-1 text-sm font-semibold rounded-full', supplier.requires_po ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                      {{ supplier.requires_po ? 'ใช่' : 'ไม่' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="supplier.notes" class="border-t pt-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">หมายเหตุ</label>
                <div class="p-4 bg-gray-50 rounded-lg border">
                  <p class="text-gray-900 whitespace-pre-wrap leading-relaxed">{{ supplier.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <i class="fas fa-boxes text-orange-500 mr-2"></i>
                  สินค้าที่จัดหา
                  <span class="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {{ products.length }} รายการ
                  </span>
                </h3>
                <div v-if="products.length > 0" class="text-sm text-gray-600">
                  <span class="text-green-600 font-medium">{{ getActiveProductsCount() }}</span> ใช้งาน
                  <span v-if="getDeletedProductsCount() > 0" class="text-red-600 font-medium ml-2">
                    • {{ getDeletedProductsCount() }} ถูกลบ
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Products List -->
            <div v-if="products.length === 0" class="p-6 text-center text-gray-500">
              <i class="fas fa-box-open text-4xl mb-4 text-gray-300"></i>
              <p>ยังไม่มีสินค้าที่จัดหาโดยผู้ขายนี้</p>
            </div>
            
            <div v-else class="p-6">
              <div class="space-y-4">
                <div 
                  v-for="product in products" 
                  :key="product._id || product.id"
                  :class="[
                    'border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors',
                    product.status === 'deleted' ? 'bg-red-50 border-red-200' : ''
                  ]"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        <h4 class="font-semibold text-gray-900">{{ product.name }}</h4>
                        <span class="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">{{ product.product_code || product.sku }}</span>
                        <span v-if="product.status === 'deleted'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ถูกลบ
                        </span>
                        <span v-else :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                          {{ product.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                        </span>
                      </div>
                      
                      <p v-if="product.description" class="text-sm text-gray-600 mt-2">{{ product.description }}</p>
                      
                      <div class="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                        <div v-if="product.category" class="flex items-center">
                          <i class="fas fa-tag text-blue-500 mr-1"></i>
                          {{ product.category }}{{ product.subcategory ? ` / ${product.subcategory}` : '' }}
                        </div>
                        <div v-if="product.unit" class="flex items-center">
                          <i class="fas fa-cube text-purple-500 mr-1"></i>
                          หน่วย: {{ product.unit }}
                        </div>
                        <div class="flex items-center">
                          <i class="fas fa-warehouse text-green-500 mr-1"></i>
                          คงเหลือ: {{ product.stock_quantity || 0 }}
                        </div>
                      </div>
                      
                      <!-- Deleted Product Info -->
                      <div v-if="product.status === 'deleted' && product.deleted_at" class="mt-2 text-xs text-red-600">
                        <i class="fas fa-trash-alt mr-1"></i>
                        ลบเมื่อ: {{ formatDateTime(product.deleted_at) }}
                      </div>
                    </div>
                    
                    <div class="text-right ml-4">
                      <div v-if="product.cost_price" class="text-sm text-gray-600">
                        <span class="font-medium">ราคาต้นทุน:</span>
                        <div class="font-semibold text-orange-600">{{ formatCurrency(product.cost_price) }}</div>
                      </div>
                      <div v-if="product.selling_price" class="text-sm text-gray-600 mt-1">
                        <span class="font-medium">ราคาขาย:</span>
                        <div class="font-semibold text-blue-600">{{ formatCurrency(product.selling_price) }}</div>
                      </div>
                      <div v-if="product.last_purchase_date" class="text-xs text-gray-500 mt-2">
                        ซื้อล่าสุด: {{ formatDate(product.last_purchase_date) }}
                      </div>
                      <div v-if="product.last_purchase_price" class="text-xs text-gray-600 font-medium">
                        {{ formatCurrency(product.last_purchase_price) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Low Stock Warning -->
                  <div v-if="product.stock_quantity !== undefined && product.min_stock_level && product.stock_quantity <= product.min_stock_level" 
                       class="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center text-red-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span class="text-sm">สินค้าใกล้หมด (ขั้นต่ำ: {{ product.min_stock_level }})</span>
                  </div>
                </div>
              </div>
              
              <!-- View All Products Link -->
              <div v-if="products.length > 5" class="mt-6 text-center">
                <button class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mx-auto">
                  <i class="fas fa-external-link-alt mr-2"></i>
                  ดูสินค้าทั้งหมดของผู้ขายนี้
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Actions Card -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">การจัดการ</h3>
            </div>
            <div class="p-6 space-y-3">
              <button 
                v-if="supplier.status === 'deleted'"
                @click="restoreSupplier" 
                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <i class="fas fa-undo mr-2"></i>
                กู้คืนผู้ขาย
              </button>
              <template v-else>
                <button @click="editSupplier" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                  <i class="fas fa-edit mr-2"></i>
                  แก้ไขข้อมูล
                </button>
                <button @click="viewPurchases" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                  <i class="fas fa-shopping-cart mr-2"></i>
                  ดูประวัติการสั่งซื้อ
                </button>
                <button v-if="products.length > 0" class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                  <i class="fas fa-boxes mr-2"></i>
                  จัดการสินค้า ({{ products.length }})
                </button>
              </template>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลระบบ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">สร้างเมื่อ</label>
                <p class="text-gray-900">{{ formatDateTime(supplier.createdAt) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">อัปเดตล่าสุด</label>
                <p class="text-gray-900">{{ formatDateTime(supplier.updatedAt) }}</p>
              </div>
              
              <!-- Products Statistics -->
              <div class="pt-3 border-t border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-2">สถิติสินค้า</label>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">สินค้าทั้งหมด:</span>
                    <span class="font-medium">{{ products.length }} รายการ</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">สินค้าใช้งาน:</span>
                    <span class="font-medium text-green-600">{{ getActiveProductsCount() }} รายการ</span>
                  </div>
                  <div v-if="getDeletedProductsCount() > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">สินค้าถูกลบ:</span>
                    <span class="font-medium text-red-600">{{ getDeletedProductsCount() }} รายการ</span>
                  </div>
                  <div v-if="products.length > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">สินค้าขาดแคลน:</span>
                    <span class="font-medium text-red-600">
                      {{ getLowStockCount() }} รายการ
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="supplier._id">
                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier ID</label>
                <div class="flex items-center">
                  <p class="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded mr-2">{{ supplier._id }}</p>
                  <button 
                    @click="copyToClipboard(supplier._id)"
                    class="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ✅ SUPPLIER DETAIL COMPONENT - ใช้ ERP_CORE.purchase
 * แสดงรายละเอียดผู้ขาย รองรับ soft delete และ restore
 */
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SupplierDetail',
  setup() {
    // ✅ ใช้ ERP_CORE.purchase แทน import PurchaseService โดยตรง
    const purchaseService = window.ERP_CORE.purchase
    const route = useRoute()
    const router = useRouter()

    // ✅ State
    const supplier = ref(null)
    const products = ref([])
    const loading = ref(false)
    
    // ✅ Get record ID from route
    const recordId = computed(() => {
      return route.params.id || route.query.id || null
    })

    // ✅ Data Loading
    const loadSupplierData = async () => {
      if (!recordId.value) return

      try {
        loading.value = true
        
        console.log('🔄 Loading supplier details with products:', recordId.value)
        
        // ✅ ใช้ PurchaseService.getSupplierWithProducts() เพื่อดึงข้อมูลพร้อม products
        const supplierData = await purchaseService.getSupplierWithProducts(recordId.value)
        
        if (supplierData) {
          supplier.value = supplierData
          products.value = supplierData.products || []
          console.log('[Supplier Detail] ✅ Loaded supplier with products:', supplierData)
          console.log('[Supplier Detail] 📦 Products count:', products.value.length)
        } else {
          console.error('[Supplier Detail] ❌ Supplier not found:', recordId.value)
          if (window.$toast) {
            window.$toast.error('ไม่พบข้อมูลผู้ขาย')
          }
        }
      } catch (error) {
        console.error('[Supplier Detail] ❌ Load error:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message)
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Actions
    const editSupplier = () => {
      router.push({
        name: 'purchase-supplier-edit',
        params: { id: recordId.value }
      })
    }

    const printSupplier = () => {
      window.print()
    }

    const goBack = () => {
      router.push({ name: 'purchase-suppliers' })
    }

    const viewPurchases = () => {
      router.push({
        name: 'purchase-orders',
        query: { supplier_id: recordId.value }
      })
    }

    const restoreSupplier = async () => {
      try {
        const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะกู้คืนผู้ขายนี้?')
        
        if (confirmed) {
          loading.value = true
          
          // ✅ ใช้ PurchaseService.restoreSupplier()
          await purchaseService.restoreSupplier(recordId.value, 'active')
          
          // อัปเดต UI
          supplier.value.status = 'active'
          supplier.value.deleted_at = null
          supplier.value.restored_at = new Date().toISOString()
          
          if (window.$toast) {
            window.$toast.success('กู้คืนผู้ขายเรียบร้อยแล้ว')
          }
          
          console.log('[Supplier Detail] ✅ Supplier restored successfully')
        }
      } catch (error) {
        console.error('[Supplier Detail] ❌ Restore error:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการกู้คืนผู้ขาย: ' + error.message)
        }
      } finally {
        loading.value = false
      }
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
        
        // Fallback for older browsers
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

    // ✅ Formatters
    const formatStatus = (status) => {
      const statusLabels = {
        'active': 'เปิดใช้งาน',
        'inactive': 'ปิดใช้งาน', 
        'suspended': 'ระงับการใช้งาน',
        'pending': 'รออนุมัติ',
        'deleted': 'ถูกลบ'
      }
      return statusLabels[status] || status
    }

    const formatType = (type) => {
      const typeLabels = {
        'domestic': 'ผู้ขายในประเทศ',
        'international': 'ผู้ขายต่างประเทศ',
        'manufacturer': 'ผู้ผลิต',
        'distributor': 'ผู้จัดจำหน่าย',
        'service': 'ผู้ให้บริการ',
        'material': 'ผู้ขายวัสดุ'
      }
      return typeLabels[type] || type
    }

    const formatRating = (rating) => {
      const ratingLabels = {
        5: 'ดีเยี่ยม',
        4: 'ดี',
        3: 'ปานกลาง',
        2: 'พอใช้',
        1: 'ต้องปรับปรุง',
        'excellent': 'ดีเยี่ยม',
        'good': 'ดี',
        'average': 'ปานกลาง',
        'poor': 'ต้องปรับปรุง',
        'unrated': 'ยังไม่ประเมิน'
      }
      return ratingLabels[rating] || rating
    }

    const formatPaymentTerms = (terms) => {
      const termsLabels = {
        'cash': 'เงินสด',
        'net_30': 'เครดิต 30 วัน',
        'net_60': 'เครดิต 60 วัน',
        'net_90': 'เครดิต 90 วัน',
        'cod': 'เก็บเงินปลายทาง',
        'advance': 'ชำระล่วงหน้า'
      }
      return termsLabels[terms] || terms
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
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // ✅ Badge Classes
    const getStatusBadgeClass = (status) => {
      const classes = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'suspended': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'deleted': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getTypeBadgeClass = (type) => {
      const classes = {
        'domestic': 'bg-blue-100 text-blue-800',
        'international': 'bg-purple-100 text-purple-800',
        'manufacturer': 'bg-blue-100 text-blue-800',
        'distributor': 'bg-purple-100 text-purple-800',
        'service': 'bg-indigo-100 text-indigo-800',
        'material': 'bg-green-100 text-green-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    const getRatingBadgeClass = (rating) => {
      const classes = {
        5: 'bg-green-100 text-green-800',
        4: 'bg-blue-100 text-blue-800',
        3: 'bg-yellow-100 text-yellow-800',
        2: 'bg-orange-100 text-orange-800',
        1: 'bg-red-100 text-red-800',
        'excellent': 'bg-green-100 text-green-800',
        'good': 'bg-blue-100 text-blue-800',
        'average': 'bg-yellow-100 text-yellow-800',
        'poor': 'bg-red-100 text-red-800',
        'unrated': 'bg-gray-100 text-gray-800'
      }
      return classes[rating] || 'bg-gray-100 text-gray-800'
    }

    // ✅ Computed Methods
    const getLowStockCount = () => {
      return products.value.filter(p => 
        p.stock_quantity !== undefined && 
        p.min_stock_level && 
        p.stock_quantity <= p.min_stock_level
      ).length
    }

    const getActiveProductsCount = () => {
      return products.value.filter(p => p.status === 'active').length
    }

    const getDeletedProductsCount = () => {
      return products.value.filter(p => p.status === 'deleted').length
    }

    // ✅ Lifecycle
    onMounted(async () => {
      // ✅ Initialize PurchaseService
      try {
        const instance = getCurrentInstance()
        const componentProxy = instance?.proxy || instance
        
        if (!purchaseService.isReady()) {
          purchaseService.initialize(componentProxy)
          console.log('[Supplier Detail] ✅ PurchaseService initialized')
        }
        
        // โหลดข้อมูล supplier
        await loadSupplierData()
        
      } catch (error) {
        console.error('[Supplier Detail] ❌ Mount error:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการโหลดหน้า')
        }
      }
    })

    return {
      // Data
      supplier,
      products,
      loading,
      recordId,
      
      // Methods
      editSupplier,
      printSupplier,
      goBack,
      viewPurchases,
      restoreSupplier,
      copyToClipboard,
      getLowStockCount,
      getActiveProductsCount,
      getDeletedProductsCount,
      
      // Formatters
      formatStatus,
      formatType,
      formatRating,
      formatPaymentTerms,
      formatCurrency,
      formatDate,
      formatDateTime,
      
      // Badge Classes
      getStatusBadgeClass,
      getTypeBadgeClass,
      getRatingBadgeClass
    }
  }
}
</script>


<style scoped>
/* Modern Tailwind-based styling - minimal custom CSS needed */
</style>
