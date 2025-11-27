<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div v-if="delivery">
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-shipping-fast text-orange-500"></i>
              รายละเอียดใบจัดส่ง
            </h1>
            <div class="mt-2 flex flex-wrap items-center gap-2 lg:gap-3 text-gray-600">
              <span class="font-semibold text-gray-900 text-sm lg:text-base">{{ delivery.delivery_number }}</span>
              <span class="text-gray-400 hidden sm:inline">•</span>
              <span class="text-gray-700 text-sm lg:text-base">{{ delivery.customer_name }}</span>
              <span class="text-gray-400 hidden sm:inline">•</span>
              <span class="inline-flex items-center gap-2 px-2 lg:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs lg:text-sm font-medium">
                <i class="fas fa-route text-xs"></i>
                <span class="hidden sm:inline">Production → Delivery</span>
                <span class="sm:hidden">P→D</span>
              </span>
            </div>
          </div>
          <!-- Desktop Actions -->
          <div class="hidden lg:flex items-center space-x-2">
            <!-- กลับ -->
            <button 
              @click="goToDeliveryQueue"
              class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
            >
              <i class="fas fa-arrow-left mr-1.5 text-xs"></i>
              กลับ
            </button>

            <!-- รีเฟรช -->
            <button 
              @click="refreshData"
              class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
              title="รีเฟรชข้อมูล"
            >
              <i class="fas fa-sync-alt text-xs"></i>
            </button>

            <!-- Separator -->
            <div class="w-px h-6 bg-gray-300 mx-2"></div>

            <!-- Print Dropdown -->
            <div class="relative print-dropdown">
              <button 
                @click="showPrintDropdown = !showPrintDropdown"
                class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
              >
                <i class="fas fa-print mr-1.5 text-xs"></i>
                พิมพ์
                <i class="fas fa-chevron-down ml-1.5 text-xs transition-transform" 
                   :class="{ 'rotate-180': showPrintDropdown }"></i>
              </button>

              <!-- Dropdown Panel -->
              <div 
                v-if="showPrintDropdown"
                class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-1">
                  <!-- พิมพ์ใบจัดส่ง -->
                  <button 
                    @click="printDelivery(); showPrintDropdown = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                  >
                    <i class="fas fa-file-alt mr-3 text-gray-400"></i>
                    พิมพ์ใบจัดส่ง
                  </button>

                  <!-- พิมพ์ใบปะหน้า -->
                  <button 
                    v-if="delivery && delivery.shipping_label_number"
                    @click="printShippingLabel(); showPrintDropdown = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                  >
                    <i class="fas fa-shipping-fast mr-3 text-yellow-500"></i>
                    พิมพ์ใบปะหน้า
                    <span class="ml-auto text-xs text-gray-500">{{ delivery.shipping_label_number }}</span>
                  </button>

                  <!-- Separator -->
                  <div class="border-t border-gray-100 my-1"></div>

                  <!-- พิมพ์ใบเสร็จ -->
                  <button 
                    v-if="hasReceipt"
                    @click="printReceipt(); showPrintDropdown = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                  >
                    <i class="fas fa-receipt mr-3 text-green-500"></i>
                    พิมพ์ใบเสร็จ
                    <span class="ml-auto text-xs text-gray-500">{{ receiptNumber }}</span>
                  </button>
                  <div v-else class="px-4 py-2 text-sm text-gray-400 flex items-center">
                    <i class="fas fa-receipt mr-3 text-gray-300"></i>
                    ใบเสร็จ (ยังไม่ได้สร้าง)
                  </div>

                  <!-- พิมพ์ใบกำกับภาษี -->
                  <button 
                    v-if="hasTaxInvoice"
                    @click="printTaxInvoice(); showPrintDropdown = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                  >
                    <i class="fas fa-file-invoice-dollar mr-3 text-blue-500"></i>
                    พิมพ์ใบกำกับภาษี
                    <span class="ml-auto text-xs text-gray-500">{{ taxInvoiceNumber }}</span>
                  </button>
                  <div v-else class="px-4 py-2 text-sm text-gray-400 flex items-center">
                    <i class="fas fa-file-invoice-dollar mr-3 text-gray-300"></i>
                    ใบกำกับภาษี (ยังไม่ได้สร้าง)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Actions -->
          <div class="flex lg:hidden items-center space-x-2">
            <!-- กลับ -->
            <button 
              @click="goToDeliveryQueue"
              class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
            >
              <i class="fas fa-arrow-left text-xs"></i>
            </button>

            <!-- รีเฟรช -->
            <button 
              @click="refreshData"
              class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
            >
              <i class="fas fa-sync-alt text-xs"></i>
            </button>

            <!-- Actions Menu -->
            <div class="flex space-x-1">
              <!-- Mobile Print Dropdown -->
              <div class="relative print-dropdown">
                <button 
                  @click="showPrintDropdown = !showPrintDropdown"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm"
                  title="พิมพ์เอกสาร"
                >
                  <i class="fas fa-print text-xs"></i>
                </button>

                <!-- Mobile Dropdown Panel -->
                <div 
                  v-if="showPrintDropdown"
                  class="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <!-- พิมพ์ใบจัดส่ง -->
                    <button 
                      @click="printDelivery(); showPrintDropdown = false"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <i class="fas fa-file-alt mr-2 text-gray-400 text-xs"></i>
                      พิมพ์ใบจัดส่ง
                    </button>

                    <!-- พิมพ์ใบปะหน้า -->
                    <button 
                      v-if="delivery && delivery.shipping_label_number"
                      @click="printShippingLabel(); showPrintDropdown = false"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <i class="fas fa-shipping-fast mr-2 text-yellow-500 text-xs"></i>
                      พิมพ์ใบปะหน้า
                    </button>

                    <div class="border-t border-gray-100 my-1"></div>

                    <!-- พิมพ์ใบเสร็จ -->
                    <button 
                      v-if="hasReceipt"
                      @click="printReceipt(); showPrintDropdown = false"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <i class="fas fa-receipt mr-2 text-green-500 text-xs"></i>
                      พิมพ์ใบเสร็จ
                    </button>

                    <!-- พิมพ์ใบกำกับภาษี -->
                    <button 
                      v-if="hasTaxInvoice"
                      @click="printTaxInvoice(); showPrintDropdown = false"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <i class="fas fa-file-invoice-dollar mr-2 text-blue-500 text-xs"></i>
                      พิมพ์ใบกำกับภาษี
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link to="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                <i class="fas fa-home mr-2 text-gray-500"></i>
                หน้าหลัก
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                <router-link to="/delivery" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center">
                  <i class="fas fa-shipping-fast mr-2 text-orange-500"></i>
                  จัดการจัดส่ง
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                <router-link to="/delivery/delivery-queue" class="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center">
                  <i class="fas fa-list mr-2 text-blue-500"></i>
                  คิวการจัดส่ง
                </router-link>
              </div>
            </li>
            <li aria-current="page">
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                <span class="text-sm font-medium text-gray-500 inline-flex items-center">
                  <i class="fas fa-file-alt mr-2 text-gray-400"></i>
                  รายละเอียดใบจัดส่ง
                  <span v-if="delivery" class="ml-1 font-mono text-blue-600">{{ delivery.delivery_number }}</span>
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="animate-pulse">
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
          @click="loadDelivery"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-refresh mr-2"></i>
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="delivery" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลการจัดส่ง</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขที่ใบจัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium font-mono">{{ delivery.delivery_number }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Work Order</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">
                      <a v-if="delivery.work_order_number" 
                         @click="viewWorkOrder" 
                         class="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                        {{ delivery.work_order_number }}
                      </a>
                      <span v-else>-</span>
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Sales Order</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">
                      <a v-if="delivery.sales_order_number" 
                         @click="viewSalesOrder" 
                         class="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                        {{ delivery.sales_order_number }}
                      </a>
                      <span v-else>-</span>
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                          :class="getStatusClass(delivery.status)">
                      <i class="fas" :class="getStatusIcon(delivery.status)"></i>
                      {{ getStatusText(delivery.status) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สร้าง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(delivery.created_date) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่นัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(delivery.scheduled_date) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทการจัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ getDeliveryTypeText(delivery.delivery_type) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วิธีจัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ getShippingMethodText(delivery.shipping_method) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลลูกค้า</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ delivery.customer_name || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ delivery.customer_phone || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div v-if="delivery.customer_email" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ delivery.customer_email }}</p>
                  </div>
                </div>
                <div v-if="delivery.shipping_address" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่จัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <div class="text-gray-900">
                      <div v-if="delivery.shipping_address.company">{{ delivery.shipping_address.company }}</div>
                      <div>{{ delivery.shipping_address.address1 }}</div>
                      <div v-if="delivery.shipping_address.address2">{{ delivery.shipping_address.address2 }}</div>
                      <div>
                        {{ delivery.shipping_address.city }} 
                        {{ delivery.shipping_address.state }} 
                        {{ delivery.shipping_address.postal_code }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สรุปการเงิน</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">มูลค่าสินค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-lg text-green-600">฿{{ formatNumber(delivery.total_amount || 0) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ค่าจัดส่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-green-600">
                      ฿{{ formatNumber(delivery.shipping_cost || 0) }}
                      <small v-if="delivery.shipping_cost !== calculateShippingCost()" class="text-green-500 ml-2">
                        (คำนวณใหม่: ฿{{ formatNumber(calculateShippingCost()) }})
                      </small>
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ค่าใช้จ่ายรวม</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold">฿{{ formatNumber(getTotalCost()) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รวมทั้งสิ้น</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-bold text-xl text-green-600">฿{{ formatNumber(getGrandTotal()) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
                <span class="text-sm text-gray-500">{{ getItemsCount() }} รายการ</span>
              </div>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">สินค้า</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">จำนวนสั่ง</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">จำนวนเบิก</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">จำนวนส่ง</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">หน่วย</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">ราคา/หน่วย</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">รวม</th>
                      <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in getDeliveryItems()" :key="item.id || item.product_id" class="hover:bg-gray-50">
                      <td class="px-4 py-3 border-b">
                        <div>
                          <div class="font-medium text-gray-900">{{ item.product_name || 'ไม่ระบุ' }}</div>
                          <div v-if="item.product_code" class="text-sm text-gray-500">
                            รหัส: {{ item.product_code }}
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-center border-b">{{ item.quantity || 0 }}</td>
                      <td class="px-4 py-3 text-center border-b">
                        <span class="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {{ item.picked_quantity || item.delivery_quantity || 0 }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-center border-b">{{ item.delivery_quantity || 0 }}</td>
                      <td class="px-4 py-3 text-center border-b">{{ item.unit || 'ชิ้น' }}</td>
                      <td class="px-4 py-3 text-center border-b font-medium">฿{{ formatNumber(item.unit_price || 0) }}</td>
                      <td class="px-4 py-3 text-center border-b font-medium">฿{{ formatNumber((item.delivery_quantity || 0) * (item.unit_price || 0)) }}</td>
                      <td class="px-4 py-3 text-center border-b">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                              :class="getItemStatusClass(item.status)">
                          {{ getItemStatusText(item.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="bg-gray-50 font-semibold">
                      <td colspan="6" class="px-4 py-3 text-right border-t-2">รวมทั้งหมด:</td>
                      <td class="px-4 py-3 text-center border-t-2 font-bold text-lg">฿{{ formatNumber(delivery.total_amount || 0) }}</td>
                      <td class="px-4 py-3 border-t-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Activities Section -->
          <div v-if="delivery.activities && delivery.activities.length > 0" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">กิจกรรม</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div v-for="activity in delivery.activities" :key="activity.id" class="flex items-start space-x-4 p-4 border-l-4 rounded-lg"
                     :class="getActivityBorderClass(activity.type)">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                       :class="getActivityIconClass(activity.type)">
                    <i class="fas" :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ activity.description }}</div>
                    <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{{ activity.user }}</span>
                      <span>{{ formatDateTime(activity.timestamp) }}</span>
                    </div>
                    <div v-if="activity.notes" class="text-sm text-gray-600 mt-2 italic">{{ activity.notes }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">เอกสารที่เกี่ยวข้อง</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Receipt -->
                <div class="border rounded-lg p-4 flex items-center space-x-4"
                     :class="hasReceipt ? 'border-green-200 bg-green-50' : 'border-gray-200 border-dashed'">
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                       :class="hasReceipt ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'">
                    <i class="fas fa-receipt"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">ใบเสร็จรับเงิน</h4>
                    <p class="text-sm text-gray-500">{{ hasReceipt ? `เลขที่: ${receiptNumber}` : 'ยังไม่ได้สร้าง' }}</p>
                    <div class="flex space-x-2 mt-2">
                      <button v-if="hasReceipt" @click="viewReceipt"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-eye mr-1"></i>ดู
                      </button>
                      <button v-if="hasReceipt" @click="printReceipt"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-print mr-1"></i>พิมพ์
                      </button>
                      <button v-if="!hasReceipt" @click="generateReceipt" :disabled="generatingReceipt"
                              class="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-2 py-1 rounded">
                        <i class="fas fa-plus mr-1"></i>สร้าง
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tax Invoice -->
                <div class="border rounded-lg p-4 flex items-center space-x-4"
                     :class="hasTaxInvoice ? 'border-green-200 bg-green-50' : 'border-gray-200 border-dashed'">
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                       :class="hasTaxInvoice ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'">
                    <i class="fas fa-file-invoice-dollar"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">ใบกำกับภาษี</h4>
                    <p class="text-sm text-gray-500">{{ hasTaxInvoice ? `เลขที่: ${taxInvoiceNumber}` : 'ยังไม่ได้สร้าง' }}</p>
                    <div class="flex space-x-2 mt-2">
                      <button v-if="hasTaxInvoice" @click="viewTaxInvoice"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-eye mr-1"></i>ดู
                      </button>
                      <button v-if="hasTaxInvoice" @click="printTaxInvoice"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-print mr-1"></i>พิมพ์
                      </button>
                      <button v-if="!hasTaxInvoice" @click="generateTaxInvoice" :disabled="generatingTaxInvoice"
                              class="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded">
                        <i class="fas fa-plus mr-1"></i>สร้าง
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Shipping Label -->
                <div class="border rounded-lg p-4 flex items-center space-x-4"
                     :class="hasShippingLabel ? 'border-green-200 bg-green-50' : 'border-gray-200 border-dashed'">
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                       :class="hasShippingLabel ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'">
                    <i class="fas fa-shipping-fast"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">ใบปะหน้า</h4>
                    <p class="text-sm text-gray-500">{{ hasShippingLabel ? `เลขที่: ${delivery.shipping_label_number}` : 'ยังไม่ได้สร้าง' }}</p>
                    <div class="flex space-x-2 mt-2">
                      <button v-if="hasShippingLabel" @click="viewShippingLabel"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-eye mr-1"></i>ดู
                      </button>
                      <button v-if="hasShippingLabel" @click="printShippingLabel"
                              class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
                        <i class="fas fa-print mr-1"></i>พิมพ์
                      </button>
                      <button v-if="!hasShippingLabel" @click="generateShippingLabel" :disabled="generatingShippingLabel"
                              class="text-xs bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-2 py-1 rounded">
                        <i class="fas fa-plus mr-1"></i>สร้าง
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="delivery.notes || delivery.internal_notes" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">หมายเหตุ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="delivery.notes">
                <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุทั่วไป</label>
                <div class="p-3 bg-gray-50 rounded-lg border border-l-4 border-l-blue-500">
                  <p class="text-gray-900">{{ delivery.notes }}</p>
                </div>
              </div>
              <div v-if="delivery.internal_notes">
                <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุภายใน</label>
                <div class="p-3 bg-gray-50 rounded-lg border border-l-4 border-l-blue-500">
                  <p class="text-gray-900">{{ delivery.internal_notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status & Actions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สถานะ & การดำเนินการ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="text-center">
                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                      :class="getStatusClass(delivery.status)">
                  <i class="fas" :class="getStatusIcon(delivery.status)"></i>
                  {{ getStatusText(delivery.status).toUpperCase() }}
                </span>
              </div>
              <div class="text-center text-sm text-gray-600">
                {{ getStatusDescription(delivery.status) }}
              </div>
              <div v-if="delivery.work_order_number" class="text-center text-sm text-gray-600">
                <i class="fas fa-link mr-1"></i>
                มาจาก Work Order: 
                <a @click="viewWorkOrder" class="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                  {{ delivery.work_order_number }}
                </a>
              </div>
              <div v-if="availableActions.length > 0" class="space-y-2">
                <button v-for="action in availableActions" 
                        :key="action.key"
                        @click="changeStatus(action.status)"
                        :disabled="processingStatus"
                        class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        :class="getActionButtonClass(action.status)">
                  <i class="fas" :class="action.icon"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Shipping & Tracking -->
          <div v-if="delivery.selected_carrier || delivery.tracking_number || delivery.carrier || delivery.shipping_label_number" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลการจัดส่ง & ติดตาม</h3>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="delivery.selected_carrier">
                <label class="block text-sm font-medium text-gray-700 mb-1">บริษัทขนส่งที่เลือก</label>
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <i class="fas fa-truck"></i>
                  {{ delivery.selected_carrier }}
                </div>
              </div>
              <div v-if="delivery.shipping_label_number">
                <label class="block text-sm font-medium text-gray-700 mb-1">หมายเลขใบปะหน้า</label>
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                  {{ delivery.shipping_label_number }}
                  <i class="fas fa-check-circle text-green-500" title="พิมพ์แล้ว"></i>
                </div>
              </div>
              <div v-if="delivery.tracking_number">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <div class="px-3 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                  {{ delivery.tracking_number }}
                </div>
              </div>
              <div v-if="delivery.estimated_delivery_date">
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่คาดว่าจะถึง</label>
                <p class="text-sm text-gray-600">{{ formatDate(delivery.estimated_delivery_date) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Utils คำนวณ: {{ calculateEstimatedDeliveryTime()?.estimatedDays || 0 }} วัน
                  ({{ calculateEstimatedDeliveryTime()?.estimatedDate || '-' }})
                </p>
              </div>
            </div>
          </div>

          <!-- Production Summary -->
          <div v-if="delivery.work_order_id" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สรุปจากฝ่าย Production</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-clipboard-check text-green-600"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">Work Order เสร็จสิ้น</h4>
                    <p class="text-sm text-gray-600">ฝ่าย Production ได้เบิกสินค้าและเตรียมครบถ้วนแล้ว</p>
                  </div>
                </div>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-boxes text-blue-600"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">สินค้าพร้อมจัดส่ง</h4>
                    <p class="text-sm text-gray-600">{{ getItemsCount() }} รายการ เตรียมครบ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สร้าง</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(delivery.created_date) }}</p>
              </div>
              <div v-if="delivery.work_order_completed_date">
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ Production เสร็จ</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(delivery.work_order_completed_date) }}</p>
              </div>
              <div v-if="delivery.ready_to_ship_date">
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เตรียมจัดส่ง</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(delivery.ready_to_ship_date) }}</p>
              </div>
              <div v-if="delivery.actual_delivery_date">
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ส่งจริง</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(delivery.actual_delivery_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">สถิติด่วน</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm opacity-90">จำนวนรายการ</span>
                <span class="font-semibold">{{ getItemsCount() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">มูลค่าสินค้า</span>
                <span class="font-semibold">฿{{ formatNumber(delivery.total_amount || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">ค่าจัดส่ง</span>
                <span class="font-semibold">฿{{ formatNumber(delivery.shipping_cost || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">ยอดรวม</span>
                <span class="font-semibold">฿{{ formatNumber(getGrandTotal()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>เปลี่ยนสถานะใบจัดส่ง</h3>
          <button class="btn-close" @click="closeStatusModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="status-change-info">
            <p>เปลี่ยนสถานะจาก <strong>{{ getStatusText(delivery.status) }}</strong> 
               เป็น <strong>{{ getStatusText(pendingStatus) }}</strong></p>
          </div>
          
          <div class="form-group">
            <label>หมายเหตุ:</label>
            <textarea 
              v-model="statusNotes"
              class="form-control"
              rows="3"
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeStatusModal">
            ยกเลิก
          </button>
          <button 
            class="btn btn-primary" 
            @click="confirmStatusChange"
            :disabled="processingStatus"
          >
            <i class="fas fa-spinner fa-spin" v-if="processingStatus"></i>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <Teleport to="body" v-if="showReceiptModal">
      <div class="modal-overlay receipt-modal" @click="closeReceiptModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบเสร็จรับเงิน</h3>
            <button class="btn-close" @click="closeReceiptModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <ReceiptDocument
              v-if="delivery && receiptNumber"
              :receiptNumber="receiptNumber"
              :delivery="delivery"
              :paymentInfo="paymentInfo"
              @close="closeReceiptModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tax Invoice Modal -->
    <Teleport to="body" v-if="showTaxInvoiceModal">
      <div class="modal-overlay tax-invoice-modal" @click="closeTaxInvoiceModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบกำกับภาษี</h3>
            <button class="btn-close" @click="closeTaxInvoiceModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <TaxInvoiceDocument
              v-if="delivery && taxInvoiceNumber"
              :taxInvoiceNumber="taxInvoiceNumber"
              :delivery="delivery"
              :paymentInfo="paymentInfo"
              :vatRate="7"
              @close="closeTaxInvoiceModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Shipping Label Modal -->
    <Teleport to="body" v-if="showShippingLabelModal">
      <div class="modal-overlay shipping-label-modal" @click="closeShippingLabelModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบปะหน้า / Shipping Label</h3>
            <button class="btn-close" @click="closeShippingLabelModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <ShippingLabelDocument
              v-if="delivery && delivery.shipping_label_number"
              :delivery="delivery"
              @close="closeShippingLabelModal"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'
import ReceiptDocument from '../../shared/ReceiptDocument.vue'
import TaxInvoiceDocument from '../../shared/TaxInvoiceDocument.vue'
import ShippingLabelDocument from '../../shared/ShippingLabelDocument.vue'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const { delivery: deliveryUtils, general } = window.ERP_CORE.utils

export default {
  name: 'DeliveryDetail',
  components: {
    ReceiptDocument,
    TaxInvoiceDocument,
    ShippingLabelDocument
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const delivery = ref(null)
    const loading = ref(true)
    const error = ref('')
    
    // Status change modal
    const showStatusModal = ref(false)
    const pendingStatus = ref('')
    const statusNotes = ref('')
    const processingStatus = ref(false)
    
    // Document generation
    const generatingReceipt = ref(false)
    const generatingTaxInvoice = ref(false)
    const generatingShippingLabel = ref(false)
    const receiptNumber = ref('')
    const taxInvoiceNumber = ref('')
    const hasReceipt = ref(false)
    const hasTaxInvoice = ref(false)
    const hasShippingLabel = ref(false)
    
    // Document modals
    const showReceiptModal = ref(false)
    const showTaxInvoiceModal = ref(false)
    const showShippingLabelModal = ref(false)
    const paymentInfo = ref({
      method: 'เงินสด',
      date: new Date(),
      reference: '',
      terms: 'ชำระเงินสดทันที'
    })

    // Print dropdown
    const showPrintDropdown = ref(false)

    // Status definitions with available actions
    const statusDefinitions = {
      'scheduled': {
        label: 'นัดจัดส่ง',
        icon: 'fa-calendar-alt',
        color: '#6c757d',
        description: 'กำหนดวันเวลาจัดส่ง รอเบิกสินค้า',
        actions: ['packed'] // ข้ามไป packed เลย เพราะเบิกแล้วใน production
      },
      'picking': {
        label: 'กำลังเบิกสินค้า',
        icon: 'fa-hand-paper',
        color: '#17a2b8',
        description: 'เบิกสินค้าจาก Work Order ที่เตรียมไว้',
        actions: ['packed', 'scheduled']
      },
      'packed': {
        label: 'แพ็คเรียบร้อย',
        icon: 'fa-box',
        color: '#ffc107',
        description: 'สินค้าพร้อมจัดส่ง - เลือกขนส่งและพิมพ์ใบปะหน้า',
        actions: ['ready_to_ship', 'scheduled']
      },
      'ready_to_ship': {
        label: 'พร้อมจัดส่ง',
        icon: 'fa-truck-loading',
        color: '#17a2b8',
        description: 'เลือกขนส่งแล้ว พิมพ์ใบปะหน้าแล้ว',
        actions: ['shipped', 'packed']
      },
      'shipped': {
        label: 'จัดส่งแล้ว',
        icon: 'fa-shipping-fast',
        color: '#007bff',
        description: 'อยู่ระหว่างขนส่ง มี tracking number',
        actions: ['delivered', 'packed']
      },
      'delivered': {
        label: 'ลูกค้ารับแล้ว',
        icon: 'fa-check-circle',
        color: '#28a745',
        description: 'ลูกค้าเซ็นรับสินค้าเรียบร้อย',
        actions: ['completed']
      },
      'completed': {
        label: 'เสร็จสิ้นทุกขั้นตอน',
        icon: 'fa-flag-checkered',
        color: '#6f42c1',
        description: 'สามารถออกเอกสารและสรุปการเงิน',
        actions: []
      }
    }

    // Available actions based on current status
    const availableActions = computed(() => {
      if (!delivery.value) return []
      
      const currentStatus = statusDefinitions[delivery.value.status]
      if (!currentStatus) return []
      
      return currentStatus.actions.map(actionStatus => ({
        key: actionStatus,
        status: actionStatus,
        label: statusDefinitions[actionStatus].label,
        icon: statusDefinitions[actionStatus].icon,
        class: getActionClass(actionStatus)
      }))
    })

    // Methods
    const loadDelivery = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const deliveryId = route.params.id
        const result = await engine.read(TRANSACTION_TYPES.DELIVERY, deliveryId)
        
        if (result.success) {
          delivery.value = result.data
          
          // ✅ Ensure enum values are valid
          if (delivery.value.delivery_type && !['standard', 'express', 'same_day', 'next_day', 'scheduled', 'bulk', 'partial', 'direct', 'transfer'].includes(delivery.value.delivery_type)) {
            delivery.value.delivery_type = 'standard'
          }
          if (delivery.value.shipping_method && !['pickup', 'delivery', 'post', 'ems', 'kerry', 'dhl', 'fedex', 'ups', 'tnt', 'flash', 'j_and_t', 'ninja_van', 'scg', 'best'].includes(delivery.value.shipping_method)) {
            delivery.value.shipping_method = 'delivery'
          }
          
          // Check for existing documents
          checkExistingDocuments()
          
          console.log('📦 Loaded delivery:', delivery.value)
        } else {
          throw new Error(result.error || 'ไม่พบใบจัดส่งที่ระบุ')
        }
        
      } catch (err) {
        console.error('❌ Error loading delivery:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const checkExistingDocuments = () => {
      // Check if receipt, tax invoice, and shipping label exist
      // This would typically check from a documents service or database
      // For demo purposes, we'll check if they were previously generated
      const deliveryId = delivery.value.id
      
      // Simulate checking for existing documents
      hasReceipt.value = localStorage.getItem('receipt_' + deliveryId) !== null
      hasTaxInvoice.value = localStorage.getItem('tax_invoice_' + deliveryId) !== null
      hasShippingLabel.value = delivery.value.shipping_label_number !== null && delivery.value.shipping_label_number !== undefined
      
      if (hasReceipt.value) {
        receiptNumber.value = localStorage.getItem('receipt_' + deliveryId)
      }
      if (hasTaxInvoice.value) {
        taxInvoiceNumber.value = localStorage.getItem('tax_invoice_' + deliveryId)
      }
    }

    const changeStatus = (newStatus) => {
      pendingStatus.value = newStatus
      statusNotes.value = ''
      showStatusModal.value = true
    }

    const confirmStatusChange = async () => {
      try {
        processingStatus.value = true
        
        const oldStatus = delivery.value.status
        
        // Prepare status-specific data
        let statusSpecificData = {}
        
        if (pendingStatus.value === 'ready_to_ship') {
          // When ready to ship - select carrier and generate shipping label
          const carriers = ['Kerry Express', 'Thailand Post', 'Flash Express', 'J&T Express', 'Ninja Van']
          const selectedCarrier = carriers[Math.floor(Math.random() * carriers.length)]
          const shippingLabelNumber = 'SL' + Date.now()
          
          statusSpecificData = {
            selected_carrier: selectedCarrier,
            shipping_label_number: shippingLabelNumber,
            shipping_label_printed: true,
            ready_to_ship_date: new Date().toISOString().split('T')[0]
          }
        } else if (pendingStatus.value === 'shipped') {
          // Generate tracking number when shipped
          const trackingNumber = 'TH' + Date.now() + Math.floor(Math.random() * 100)
          statusSpecificData = {
            tracking_number: trackingNumber,
            carrier: delivery.value.selected_carrier || 'ขนส่งมาตรฐาน',
            shipped_date: new Date().toISOString().split('T')[0],
            estimated_delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +2 days
          }
        } else if (pendingStatus.value === 'delivered') {
          // Set actual delivery date
          statusSpecificData = {
            actual_delivery_date: new Date().toISOString().split('T')[0],
            delivery_confirmed_by: 'ลูกค้า',
            delivery_time: new Date().toLocaleTimeString('th-TH')
          }
        }
        
        const newActivity = {
          id: Math.random().toString(36).substr(2, 9),
          type: pendingStatus.value,
          description: 'เปลี่ยนสถานะจาก "' + getStatusText(oldStatus) + '" เป็น "' + getStatusText(pendingStatus.value) + '"',
          user: 'ผู้ใช้ปัจจุบัน',
          timestamp: new Date().toISOString(),
          notes: statusNotes.value
        }
        
        // Add specific activity details
        if (pendingStatus.value === 'ready_to_ship' && statusSpecificData.selected_carrier) {
          newActivity.description += ' - ขนส่ง: ' + statusSpecificData.selected_carrier + ', ใบปะหน้า: ' + statusSpecificData.shipping_label_number
        } else if (pendingStatus.value === 'shipped' && statusSpecificData.tracking_number) {
          newActivity.description += ' - Tracking: ' + statusSpecificData.tracking_number
        }
        
        const updatedDelivery = {
          ...delivery.value,
          ...statusSpecificData,
          status: pendingStatus.value,
          updated_date: new Date().toISOString(),
          activities: [...(delivery.value.activities || []), newActivity],
          // ✅ Fix enum values to match schema
          delivery_type: delivery.value.delivery_type || 'standard', // ensure valid enum value
          shipping_method: delivery.value.shipping_method || 'delivery' // ensure valid enum value
        }
        
        if (statusNotes.value) {
          updatedDelivery.notes = (delivery.value.notes || '') + '\n' + 
            '[' + new Date().toLocaleString('th-TH') + '] ' + statusNotes.value
        }
        
        const result = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, updatedDelivery)
        
        if (result.success) {
          delivery.value = result.data
          closeStatusModal()
          
          // Show success notification with specific info
          if (pendingStatus.value === 'ready_to_ship' && statusSpecificData.selected_carrier) {
            alert('เตรียมจัดส่งเรียบร้อย!\nขนส่ง: ' + statusSpecificData.selected_carrier + '\nใบปะหน้า: ' + statusSpecificData.shipping_label_number + '\n✅ พิมพ์ใบปะหน้าแล้ว - พร้อมมอบให้ขนส่ง')
          } else if (pendingStatus.value === 'shipped' && statusSpecificData.tracking_number) {
            alert('จัดส่งสำเร็จ!\nTracking Number: ' + statusSpecificData.tracking_number + '\nคาดว่าจะถึงมือลูกค้าใน 2 วันทำการ')
          } else if (pendingStatus.value === 'delivered') {
            alert('ยืนยันการส่งมอบสำเร็จ! ลูกค้าได้รับสินค้าเรียบร้อยแล้ว')
          }
          
          console.log('✅ Status updated successfully:', pendingStatus.value)
        } else {
          throw new Error(result.error || 'ไม่สามารถเปลี่ยนสถานะได้')
        }
        
      } catch (err) {
        console.error('❌ Error updating status:', err)
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ' + err.message)
      } finally {
        processingStatus.value = false
      }
    }

    const closeStatusModal = () => {
      showStatusModal.value = false
      pendingStatus.value = ''
      statusNotes.value = ''
    }

    const generateReceipt = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }
      
      try {
        generatingReceipt.value = true
        
        // Generate receipt through Transaction Engine (จะใช้ Receipt MasterData Schema validation อัตโนมัติ)
        const receiptNum = general.generateReferenceNumber({
          prefix: 'RC',
          includeDate: true,
          length: 4
        })
        
        const receiptData = {
          receipt_number: receiptNum,
          receipt_date: new Date().toISOString(),
          delivery_id: delivery.value.id,
          delivery_number: delivery.value.delivery_number,
          customer_name: delivery.value.customer_name,
          customer_phone: delivery.value.customer_phone,
          customer_email: delivery.value.customer_email,
          customer_address: delivery.value.shipping_address?.address1 || '',
          items: delivery.value.items || [],
          subtotal: delivery.value.total_amount || 0,
          shipping_cost: delivery.value.shipping_cost || 0,
          discount_amount: delivery.value.discount_amount || 0,
          total_amount: (delivery.value.total_amount || 0) + (delivery.value.shipping_cost || 0) - (delivery.value.discount_amount || 0),
          payment_method: 'cash', // ใช้ enum value ที่ถูกต้องตาม Receipt MasterData Schema
          payment_terms: 'ชำระเงินสดทันที',
          payment_date: new Date().toISOString(),
          issued_by: 'ผู้ใช้ปัจจุบัน',
          issued_date: new Date().toISOString(),
          notes: `สร้างจากใบจัดส่ง ${delivery.value.delivery_number}`,
          status: 'issued'
        }
        
        // Log receipt data for debugging
        console.log('Sending receipt data to TransactionEngine:', receiptData)
        
        // Create receipt transaction through Core Engine
        const result = await engine.create(TRANSACTION_TYPES.RECEIPT, receiptData)
        
        if (result.success) {
          // Store receipt information locally (for demo)
          localStorage.setItem(`receipt_${delivery.value.id}`, receiptNum)
          receiptNumber.value = receiptNum
          hasReceipt.value = true
          
          // Set payment info for document components
          paymentInfo.value = {
            method: 'เงินสด',
            date: new Date(),
            reference: result.data.id,
            terms: 'ชำระเงินสดทันที'
          }
          
          // 📝 Update delivery with receipt reference through Core Engine
          const deliveryUpdate = {
            receipt_id: result.data.id,
            receipt_number: receiptNum,
            activities: [...(delivery.value.activities || []), {
              id: Math.random().toString(36).substr(2, 9),
              type: 'receipt_generated',
              description: `สร้างใบเสร็จเลขที่ ${receiptNum} ผ่าน Transaction Engine`,
              user: 'ผู้ใช้ปัจจุบัน',
              timestamp: new Date().toISOString()
            }]
          }
          
          const updateResult = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
          if (updateResult.success) {
            delivery.value = updateResult.data
          }
          
          console.log('✅ Receipt generated through Transaction Engine (using Receipt MasterData):', receiptNum)
          
          // Show success message with receipt details
          alert(`สร้างใบเสร็จสำเร็จ!\nเลขที่: ${receiptNum}\nยอดเงิน: ฿${formatNumber(receiptData.total_amount)}\nวิธีชำระ: ${getPaymentMethodText(receiptData.payment_method)}`)
          
          // Auto open receipt modal
          showReceiptModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบเสร็จได้')
        }
        
      } catch (err) {
        console.error('❌ Error generating receipt:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบเสร็จ: ' + err.message)
      } finally {
        generatingReceipt.value = false
      }
    }

    const generateTaxInvoice = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }
      
      try {
        generatingTaxInvoice.value = true
        
        // 🧾 Generate tax invoice through Transaction Engine (จะใช้ Tax Invoice MasterData Schema validation อัตโนมัติ)
        const taxInvoiceNum = general.generateReferenceNumber({
          prefix: 'TAX',
          includeDate: true,
          length: 4
        })
        
        // Prepare customer address
        const customerAddress = delivery.value.shipping_address ? {
          address: delivery.value.shipping_address.address1 || '',
          district: delivery.value.shipping_address.district || '',
          amphoe: delivery.value.shipping_address.amphoe || '',
          province: delivery.value.shipping_address.province || '',
          postal_code: delivery.value.shipping_address.postal_code || ''
        } : {}
        
        // Calculate VAT (7%)
        const subtotal = delivery.value.total_amount || 0
        const shippingCost = delivery.value.shipping_cost || 0
        const discountAmount = delivery.value.discount_amount || 0
        const netTotal = subtotal + shippingCost - discountAmount
        const vatRate = 7
        const vatAmount = (netTotal * vatRate) / 100
        const grandTotal = netTotal + vatAmount
        
        const taxInvoiceData = {
          tax_invoice_number: taxInvoiceNum,
          tax_invoice_date: new Date().toISOString(),
          delivery_id: delivery.value.id,
          delivery_number: delivery.value.delivery_number,
          customer_name: delivery.value.customer_name,
          customer_phone: delivery.value.customer_phone,
          customer_email: delivery.value.customer_email,
          customer_tax_id: delivery.value.customer_tax_id || '',
          customer_address: customerAddress,
          items: delivery.value.items || [],
          subtotal: subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          net_total: netTotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          grand_total: grandTotal,
          vat_type: 'standard', // ใช้ VAT_TYPES.STANDARD enum value
          payment_terms: 'ชำระเงินสดทันที',
          branch_code: '00000', // ใช้ BRANCH_TYPES.HEAD_OFFICE enum value
          issued_by: 'ผู้ใช้ปัจจุบัน',
          issued_date: new Date().toISOString(),
          notes: `สร้างจากใบจัดส่ง ${delivery.value.delivery_number}`,
          status: 'issued'
        }
        
        // 💾 Create tax invoice transaction through Core Engine
        const result = await engine.create(TRANSACTION_TYPES.TAX_INVOICE, taxInvoiceData)
        
        if (result.success) {
          // Store tax invoice information locally (for demo)
          localStorage.setItem(`tax_invoice_${delivery.value.id}`, taxInvoiceNum)
          taxInvoiceNumber.value = taxInvoiceNum
          hasTaxInvoice.value = true
          
          // Set payment info for document components
          paymentInfo.value = {
            method: 'เงินสด',
            date: new Date(),
            reference: result.data.id,
            terms: 'ชำระเงินสดทันที'
          }
          
          // 📝 Update delivery with tax invoice reference through Core Engine
          const deliveryUpdate = {
            tax_invoice_id: result.data.id,
            tax_invoice_number: taxInvoiceNum,
            activities: [...(delivery.value.activities || []), {
              id: Math.random().toString(36).substr(2, 9),
              type: 'tax_invoice_generated',
              description: `สร้างใบกำกับภาษีเลขที่ ${taxInvoiceNum} ผ่าน Transaction Engine`,
              user: 'ผู้ใช้ปัจจุบัน',
              timestamp: new Date().toISOString()
            }]
          }
          
          const updateResult = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
          if (updateResult.success) {
            delivery.value = updateResult.data
          }
          
          console.log('✅ Tax invoice generated through Transaction Engine (using Tax Invoice MasterData):', taxInvoiceNum)
          
          // Show success message with tax invoice details  
          alert(`สร้างใบกำกับภาษีสำเร็จ!\nเลขที่: ${taxInvoiceNum}\nยอดก่อน VAT: ฿${formatNumber(netTotal)}\nVAT ${vatRate}%: ฿${formatNumber(vatAmount)}\nยอดรวม: ฿${formatNumber(grandTotal)}`)
          
          // Auto open tax invoice modal
          showTaxInvoiceModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบกำกับภาษีได้')
        }
        
      } catch (err) {
        console.error('❌ Error generating tax invoice:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบกำกับภาษี: ' + err.message)
      } finally {
        generatingTaxInvoice.value = false
      }
    }

    const refreshData = () => {
      loadDelivery()
    }

    const printDelivery = () => {
      window.print()
    }

    const printShippingLabel = () => {
      if (!delivery.value.shipping_label_number) {
        alert('ไม่พบหมายเลขใบปะหน้า')
        return
      }
      
      // แสดง modal ใบปะหน้า
      showShippingLabelModal.value = true
      
      console.log('🖨️ Opening shipping label modal:', {
        labelNumber: delivery.value.shipping_label_number,
        carrier: delivery.value.selected_carrier,
        customer: delivery.value.customer_name,
        address: delivery.value.shipping_address
      })
    }

    const viewWorkOrder = () => {
      if (delivery.value.work_order_id) {
        router.push(`/production/work-order/${delivery.value.work_order_id}`)
      }
    }

    const viewSalesOrder = () => {
      if (delivery.value.sales_order_id) {
        router.push(`/sales/sales-order/${delivery.value.sales_order_id}`)
      }
    }

    const viewReceipt = () => {
      if (hasReceipt.value) {
        showReceiptModal.value = true
      }
    }

    const printReceipt = () => {
      if (hasReceipt.value) {
        showReceiptModal.value = true
        // The ReceiptDocument component will handle printing
      }
    }

    const viewTaxInvoice = () => {
      if (hasTaxInvoice.value) {
        showTaxInvoiceModal.value = true
      }
    }

    const printTaxInvoice = () => {
      if (hasTaxInvoice.value) {
        showTaxInvoiceModal.value = true
        // The TaxInvoiceDocument component will handle printing
      }
    }

    const closeReceiptModal = () => {
      showReceiptModal.value = false
    }

    const closeTaxInvoiceModal = () => {
      showTaxInvoiceModal.value = false
    }

    const closeShippingLabelModal = () => {
      showShippingLabelModal.value = false
    }

    const generateShippingLabel = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }

      try {
        generatingShippingLabel.value = true

        // Generate shipping label using utils
        const labelNumber = general.generateReferenceNumber({
          prefix: 'SL',
          includeDate: true,
          length: 4
        })
        const trackingNumber = general.generateReferenceNumber({
          prefix: 'TH',
          includeDate: false,
          length: 8
        })

        // Update delivery with shipping label info
        const deliveryUpdate = {
          shipping_label_number: labelNumber,
          tracking_number: trackingNumber,
          shipping_label_printed: true,
          activities: [...(delivery.value.activities || []), {
            id: Math.random().toString(36).substr(2, 9),
            type: 'shipping_label_generated',
            description: `สร้างใบปะหน้าเลขที่ ${labelNumber}`,
            user: 'ผู้ใช้ปัจจุบัน',
            timestamp: new Date().toISOString()
          }]
        }

        const result = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
        
        if (result.success) {
          delivery.value = result.data
          hasShippingLabel.value = true
          
          console.log('✅ Shipping label generated:', labelNumber)
          alert(`สร้างใบปะหน้าสำเร็จ!\nเลขที่: ${labelNumber}\nTracking: ${trackingNumber}`)
          
          // Auto open shipping label modal
          showShippingLabelModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบปะหน้าได้')
        }

      } catch (err) {
        console.error('❌ Error generating shipping label:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบปะหน้า: ' + err.message)
      } finally {
        generatingShippingLabel.value = false
      }
    }

    const viewShippingLabel = () => {
      if (hasShippingLabel.value) {
        showShippingLabelModal.value = true
      }
    }

    const getDeliveryItems = () => {
      return delivery.value.items || []
    }

    const getItemsCount = () => {
      return getDeliveryItems().length
    }

    const getTotalCost = () => {
      // Use delivery utils to calculate cost breakdown
      if (delivery.value) {
        const costBreakdown = deliveryUtils.calculateDeliveryCostBreakdown(delivery.value)
        return costBreakdown.totalCost
      }
      return 0
    }

    const getGrandTotal = () => {
      return (delivery.value.total_amount || 0) + getTotalCost()
    }

    const getStatusText = (status) => {
      return statusDefinitions[status]?.label || status
    }

    const getStatusIcon = (status) => {
      return statusDefinitions[status]?.icon || 'fa-question'
    }

    const getStatusDescription = (status) => {
      return statusDefinitions[status]?.description || 'ไม่มีรายละเอียด'
    }

    const getActionClass = (status) => {
      const classMap = {
        'picking': 'btn-info',
        'packed': 'btn-warning',
        'shipped': 'btn-primary',
        'delivered': 'btn-success',
        'completed': 'btn-dark'
      }
      return classMap[status] || 'btn-secondary'
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        'scheduled': 'bg-gray-100 text-gray-800',
        'picking': 'bg-blue-100 text-blue-800',
        'packed': 'bg-yellow-100 text-yellow-800',
        'ready_to_ship': 'bg-cyan-100 text-cyan-800',
        'shipped': 'bg-blue-100 text-blue-800',
        'delivered': 'bg-green-100 text-green-800',
        'completed': 'bg-purple-100 text-purple-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }

    const getActionButtonClass = (status) => {
      const classMap = {
        'picking': 'bg-blue-600 hover:bg-blue-700 text-white',
        'packed': 'bg-yellow-600 hover:bg-yellow-700 text-white',
        'ready_to_ship': 'bg-cyan-600 hover:bg-cyan-700 text-white',
        'shipped': 'bg-blue-600 hover:bg-blue-700 text-white',
        'delivered': 'bg-green-600 hover:bg-green-700 text-white',
        'completed': 'bg-gray-600 hover:bg-gray-700 text-white'
      }
      return classMap[status] || 'bg-gray-600 hover:bg-gray-700 text-white'
    }

    const getItemStatusClass = (status) => {
      const statusClasses = {
        'pending': 'bg-red-100 text-red-800',
        'picked': 'bg-blue-100 text-blue-800',
        'packed': 'bg-yellow-100 text-yellow-800',
        'delivered': 'bg-green-100 text-green-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }

    const getActivityBorderClass = (type) => {
      const typeClasses = {
        'created': 'border-green-400',
        'picked': 'border-blue-400',
        'packed': 'border-yellow-400',
        'ready_to_ship': 'border-cyan-400',
        'shipped': 'border-blue-400',
        'delivered': 'border-green-400',
        'receipt_generated': 'border-purple-400',
        'tax_invoice_generated': 'border-orange-400'
      }
      return typeClasses[type] || 'border-gray-400'
    }

    const getActivityIconClass = (type) => {
      const typeClasses = {
        'created': 'bg-green-500',
        'picked': 'bg-blue-500',
        'packed': 'bg-yellow-500',
        'ready_to_ship': 'bg-cyan-500',
        'shipped': 'bg-blue-500',
        'delivered': 'bg-green-500',
        'receipt_generated': 'bg-purple-500',
        'tax_invoice_generated': 'bg-orange-500'
      }
      return typeClasses[type] || 'bg-gray-500'
    }

    const getDeliveryTypeText = (type) => {
      const typeMap = {
        'full_delivery': 'ส่งครบ',
        'partial_delivery': 'ส่งบางส่วน'
      }
      return typeMap[type] || type
    }

    const getShippingMethodText = (method) => {
      const methodMap = {
        'standard': 'ปกติ',
        'express': 'ด่วน',
        'internal': 'รถบริษัท'
      }
      return methodMap[method] || method
    }

    const getItemStatusText = (status) => {
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'picked': 'เบิกแล้ว',
        'packed': 'แพ็คแล้ว',
        'delivered': 'ส่งแล้ว'
      }
      return statusMap[status] || status
    }

    const getActivityIcon = (type) => {
      const iconMap = {
        'created': 'fa-plus',
        'picked': 'fa-hand-paper',
        'packed': 'fa-box',
        'ready_to_ship': 'fa-truck-loading',
        'shipped': 'fa-shipping-fast',
        'delivered': 'fa-check-circle',
        'receipt_generated': 'fa-receipt',
        'tax_invoice_generated': 'fa-file-invoice-dollar'
      }
      return iconMap[type] || 'fa-circle'
    }

    // Use ERP Utils for formatting
    const formatDate = (dateString) => {
      return general.formatDate(dateString, 'long')
    }

    // Calculate shipping cost using delivery utils
    const calculateShippingCost = () => {
      if (!delivery.value) return 0
      
      return deliveryUtils.calculateShippingCost({
        shippingMethod: delivery.value.shipping_method || 'delivery',
        deliveryType: delivery.value.delivery_type || 'standard',
        weight: delivery.value.total_weight || 2,
        distance: delivery.value.distance || 15,
        isFragile: delivery.value.has_fragile_items || false,
        isUrgent: delivery.value.priority === 'urgent'
      })
    }

    // Calculate delivery time using delivery utils
    const calculateEstimatedDeliveryTime = () => {
      if (!delivery.value) return null
      
      return deliveryUtils.calculateDeliveryTime({
        shippingMethod: delivery.value.shipping_method || 'delivery',
        deliveryType: delivery.value.delivery_type || 'standard',
        distance: delivery.value.distance || 15
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0)
    }

    // Helper function to convert payment method enum to Thai text
    const getPaymentMethodText = (method) => {
      const methodMap = {
        'cash': 'เงินสด',
        'bank_transfer': 'โอนเงิน',
        'credit_card': 'บัตรเครดิต',
        'debit_card': 'บัตรเดบิต',
        'cheque': 'เช็ค',
        'promissory_note': 'ตั๋วเงิน'
      }
      return methodMap[method] || method
    }

    // Navigation methods
    const goToDeliveryQueue = () => {
      router.push('/delivery/delivery-queue')
    }

    const goToDeliveryManagement = () => {
      router.push('/delivery')
    }

    const goToHome = () => {
      router.push('/')
    }

    // Close dropdown when clicking outside
    const closePrintDropdown = () => {
      showPrintDropdown.value = false
    }



    // Lifecycle
    onMounted(() => {
      loadDelivery()
      
      // Add click outside handler for dropdown
      const handleClickOutside = (event) => {
        const dropdownElements = document.querySelectorAll('.print-dropdown')
        let isInside = false
        dropdownElements.forEach(dropdown => {
          if (dropdown.contains(event.target)) {
            isInside = true
          }
        })
        if (!isInside) {
          showPrintDropdown.value = false
        }
      }
      
      document.addEventListener('click', handleClickOutside)
      
      // Cleanup on unmount
      const cleanup = () => {
        document.removeEventListener('click', handleClickOutside)
      }
      
      // Store cleanup function for onUnmounted
      window.__printDropdownCleanup = cleanup
    })
    
    // Cleanup event listener on component unmount
    onUnmounted(() => {
      if (window.__printDropdownCleanup) {
        window.__printDropdownCleanup()
        delete window.__printDropdownCleanup
      }
    })

    return {
      // Data
      delivery,
      loading,
      error,
      showStatusModal,
      pendingStatus,
      statusNotes,
      processingStatus,
      generatingReceipt,
      generatingTaxInvoice,
      receiptNumber,
      taxInvoiceNumber,
      hasReceipt,
      hasTaxInvoice,
      showReceiptModal,
      showTaxInvoiceModal,
      showShippingLabelModal,
      generatingShippingLabel,
      hasShippingLabel,
      paymentInfo,
      showPrintDropdown,
      
      // Computed
      availableActions,
      
      // Methods
      loadDelivery,
      changeStatus,
      confirmStatusChange,
      closeStatusModal,
      generateReceipt,
      generateTaxInvoice,
      refreshData,
      printDelivery,
      viewWorkOrder,
      viewSalesOrder,
      viewReceipt,
      printReceipt,
      viewTaxInvoice,
      printTaxInvoice,
      closeReceiptModal,
      closeTaxInvoiceModal,
      closeShippingLabelModal,
      generateShippingLabel,
      viewShippingLabel,
      getDeliveryItems,
      getItemsCount,
      getTotalCost,
      getGrandTotal,
      getStatusText,
      getStatusIcon,
      getStatusDescription,
      printShippingLabel,
      getDeliveryTypeText,
      getShippingMethodText,
      getItemStatusText,
      getActivityIcon,
      formatDate,
      formatDateTime,
      formatNumber,
      getPaymentMethodText,
      calculateShippingCost,
      calculateEstimatedDeliveryTime,
      goToDeliveryQueue,
      goToDeliveryManagement,
      goToHome,
      closePrintDropdown,
      getStatusClass,
      getActionButtonClass,
      getItemStatusClass,
      getActivityBorderClass,
      getActivityIconClass
    }
  }
}
</script>