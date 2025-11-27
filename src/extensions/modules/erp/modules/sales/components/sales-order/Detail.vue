<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales Order Detail</h1>
            <p v-if="order" class="mt-2 text-gray-600">ใบสั่งขาย / Sales Order - <span class="font-mono">{{ order.orderNumber }}</span></p>
            <p v-else class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-gray-600 h          // Ad        }

        // Save to engine with minimal update data matching schema        
        const result = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)vity log to update data if it exists
        if (order.value.activityLog && Array.isArray(order.value.activityLog)) {
          updateData.activityLog = [...order.value.activityLog, newActivityEntry]
        } else {
          updateData.activityLog = [newActivityEntry]
        }

        // Save to engine with minimal update data matching schema
        const result = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)lse {
          updateData.activityLog = [newActivityEntry]
        }

        // Save to engine with minimal update data matching schema
        const result = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)   // Save to engine with minimal update data matching schema
        const result = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)   // Save to engine with minimal update data matching schema
        console.log('📤 Sending update data:', updateData):bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="$router.go(-1)"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              ย้อนกลับ
            </button>
            <button 
              v-if="order"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="editOrder"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไข
            </button>
            <button 
              v-if="order"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="printOrder"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

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
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="bg-red-50 rounded-full p-6 mb-6">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-6 max-w-md">{{ error }}</p>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          @click="loadOrder"
        >
          <i class="fas fa-refresh mr-2"></i>
          ลองใหม่
        </button>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!order" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="bg-gray-100 rounded-full p-8 mb-6">
          <i class="fas fa-search text-5xl text-gray-400"></i>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">ไม่พบ Sales Order</h3>
        <p class="text-gray-600 mb-8 max-w-md">Sales Order ที่ต้องการดูไม่มีในระบบ</p>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          @click="$router.push('/sales/sales-order')"
        >
          <i class="fas fa-list mr-2"></i>
          กลับไปรายการ
        </button>
      </div>
      <!-- Order Detail Content -->
      <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Document Flow -->
          <div v-if="order" class="bg-white rounded shadow-sm p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เอกสารที่เกี่ยวข้อง</h3>
            
            <div class="flex items-center gap-2 text-xs">
              <!-- Quotation -->
              <div 
                v-if="linkedQuotation"
                @click="viewDocument('quotation', linkedQuotation.id || linkedQuotation._id)"
                class="flex-1 p-2 rounded border border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
              >
                <div class="text-gray-600 mb-0.5">ใบเสนอราคา</div>
                <div class="font-semibold text-gray-900">{{ linkedQuotation.quoteNumber || linkedQuotation.quote_number || linkedQuotation.quotation_number }}</div>
              </div>
              <div v-else class="flex-1 p-2 rounded border border-dashed border-gray-300 bg-gray-50">
                <div class="text-gray-400">ใบเสนอราคา</div>
                <div class="text-gray-400 text-xs">-</div>
              </div>
              
              <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
              
              <!-- Invoice -->
              <div 
                v-if="linkedInvoice"
                @click="viewDocument('invoice', linkedInvoice.id || linkedInvoice._id)"
                class="flex-1 p-2 rounded border border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
              >
                <div class="text-gray-600 mb-0.5">ใบแจ้งหนี้</div>
                <div class="font-semibold text-gray-900">{{ linkedInvoice.invoiceNumber || linkedInvoice.invoice_number }}</div>
              </div>
              <div v-else class="flex-1 p-2 rounded border border-dashed border-gray-300 bg-gray-50">
                <div class="text-gray-400">ใบแจ้งหนี้</div>
                <div class="text-gray-400 text-xs">-</div>
              </div>
              
              <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
              
              <!-- Sales Order (Current) -->
              <div class="flex-1 p-2 rounded border-2 border-gray-600 bg-gray-50">
                <div class="text-gray-600 mb-0.5">ใบสั่งขาย</div>
                <div class="font-semibold text-gray-900">{{ order.orderNumber || order.order_number }}</div>
              </div>
            </div>
          </div>

          <!-- Order Status -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สถานะใบสั่งซื้อ</h3>
            </div>
            <div class="p-6 text-center">
              <span class="inline-flex px-6 py-3 text-lg font-semibold rounded-full" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลใบสั่งซื้อ</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หมายเลข SO</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono font-semibold">{{ order.orderNumber }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สั่ง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(order.orderDate) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ส่งมอบ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(order.deliveryDate) || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full" :class="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
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
                    <p class="text-gray-900 font-semibold">{{ order.customerName || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ order.customerPhone || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono">{{ order.customerId || 'ไม่ระบุ' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stock Reservation Status -->
          <div v-if="order.status === 'confirmed' || stockReservations.length > 0" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                <i class="fas fa-lock mr-2 text-blue-600"></i>
                สถานะการจองสต็อก
              </h3>
            </div>
            <div class="p-6">
              <div v-if="stockReservations.length > 0" class="space-y-4">
                <!-- Reservation Summary -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div class="ml-3">
                      <h4 class="text-sm font-medium text-green-800">สต็อกได้รับการจองแล้ว</h4>
                      <p class="text-sm text-green-700">
                        จองไว้ {{ stockReservations.length }} รายการ 
                        รวม {{ totalReservedQuantity }} หน่วย
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Reservation Details -->
                <div class="overflow-hidden border border-gray-200 rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สินค้า
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวนจอง
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          หน่วย
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่จอง
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="reservation in stockReservations" :key="reservation.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ reservation.product_name || 'ไม่ระบุชื่อสินค้า' }}
                          </div>
                          <div v-if="reservation.sku" class="text-sm text-gray-500">
                            SKU: {{ reservation.sku }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                          {{ reservation.quantity || 0 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {{ reservation.unit || 'ชิ้น' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {{ formatDate(reservation.movement_date) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            จองแล้ว
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- No Reservations -->
              <div v-else-if="order.status === 'confirmed'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-yellow-800">ยังไม่มีการจองสต็อก</h4>
                    <p class="text-sm text-yellow-700">
                      คำสั่งซื้อได้รับการยืนยันแล้ว แต่ยังไม่มีการจองสต็อก
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                <button 
                  @click="checkStockReservations"
                  :disabled="loadingReservations"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <i v-if="loadingReservations" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else class="fas fa-sync mr-2"></i>
                  {{ loadingReservations ? 'กำลังตรวจสอบ...' : 'ตรวจสอบการจองอีกครั้ง' }}
                </button>
                
                <button 
                  @click="debugInventoryData"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <i class="fas fa-bug mr-2"></i>
                  Debug ข้อมูล
                </button>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
            </div>
            <div class="p-6">
              <div v-if="order.items && order.items.length > 0" class="overflow-hidden border border-gray-200 rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา/หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ส่วนลด</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in order.items" :key="index" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ index + 1 }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.productName || item.productId }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ formatNumber(item.quantity) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ item.unit || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{{ formatCurrency(item.unitPrice) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{{ formatCurrency(item.discount) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="6" class="px-6 py-4 text-right text-sm font-semibold text-gray-900">ยอดรวมทั้งหมด:</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">{{ formatCurrency(itemsTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div v-else class="text-center py-12 text-gray-500">
                <div class="bg-gray-100 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4">
                  <i class="fas fa-shopping-cart text-2xl text-gray-400"></i>
                </div>
                <p class="text-lg">ไม่มีรายการสินค้า</p>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="order.notes" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">หมายเหตุ</h3>
            </div>
            <div class="p-6">
              <div class="p-4 bg-gray-50 rounded-lg border">
                <p class="text-gray-900 whitespace-pre-wrap">{{ order.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Summary Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สรุปยอดเงิน</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">ยอดรวมสินค้า:</span>
                <span class="font-semibold text-gray-900">{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">ส่วนลด:</span>
                <span class="font-semibold text-red-600">-{{ formatCurrency(order.totalDiscount) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">VAT:</span>
                <span class="font-semibold text-gray-900">{{ formatCurrency(order.vatAmount) }}</span>
              </div>
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-base font-semibold text-gray-900">ยอดรวมสุทธิ:</span>
                  <span class="text-xl font-bold text-green-600">{{ formatCurrency(order.totalAmount) }}</span>
                </div>
              </div>
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
                <p class="text-sm text-gray-600">{{ formatDateTime(order.createdAt) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">แก้ไขล่าสุด</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(order.updatedAt) || 'ไม่เคย' }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <!-- Status Change Actions -->
              <div v-if="availableActions.length > 0" class="space-y-2">
                <p class="text-sm text-white opacity-90 mb-3">เปลี่ยนสถานะ:</p>
                <button 
                  v-for="action in availableActions"
                  :key="action.status"
                  @click="changeStatus(action.status)"
                  :class="getActionButtonClass(action.status)"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                >
                  <i :class="action.icon" class="mr-2"></i>
                  {{ action.label }}
                </button>
              </div>
              
              <!-- Divider -->
              <div v-if="availableActions.length > 0" class="border-t border-white border-opacity-20 my-4"></div>
              
              <!-- Other Actions -->
              <button 
                @click="editOrder"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i class="fas fa-edit mr-2"></i>
                แก้ไขใบสั่งซื้อ
              </button>
              <button 
                @click="printOrder"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i class="fas fa-print mr-2"></i>
                พิมพ์ใบสั่งซื้อ
              </button>
              <button 
                @click="$router.push('/sales/sales-order')"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i class="fas fa-list mr-2"></i>
                กลับไปรายการ
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Document Debug Panel -->
    <DocumentDebugPanel 
      v-if="order"
      :current-document="order"
      document-type="Sales Order"
      :sales-service="salesService"
    />

    <!-- Status Change Confirmation Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full" @click.stop>
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">ยืนยันการเปลี่ยนสถานะ</h3>
          <button 
            @click="cancelStatusChange"
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <!-- Status Change Info -->
          <div class="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">จาก</label>
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="text-blue-500">
              <i class="fas fa-arrow-right text-xl"></i>
            </div>
            <div class="text-center">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">เป็น</label>
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full" :class="getStatusClass(pendingStatus)">
                {{ getStatusText(pendingStatus) }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (ไม่บังคับ)</label>
            <textarea 
              v-model="statusNotes"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="เพิ่มหมายเหตุสำหรับการเปลี่ยนสถานะ..."
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button 
            @click="cancelStatusChange"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmStatusChange"
            :disabled="changingStatus"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            <i v-if="changingStatus" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-check mr-2"></i>
            {{ changingStatus ? 'กำลังเปลี่ยน...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'
import DocumentDebugPanel from '../../shared/DocumentDebugPanel.vue'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'SalesOrderDetail',
  components: {
    DocumentDebugPanel,
    ErpBreadcrumb
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const engine = new TransactionEngine()
    const salesService = inject('salesService')
    
    // Breadcrumb navigation
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Sales Orders', path: '/sales/sales-order', icon: 'fas fa-file-invoice' },
      { name: 'Sales Order Detail' }
    ])
    
    // State
    const order = ref(null)
    const loading = ref(false)
    const error = ref('')
    
    // Linked Documents
    const linkedQuotation = ref(null)
    const linkedInvoice = ref(null)
    
    // Status change modal
    const showStatusModal = ref(false)
    const pendingStatus = ref('')
    const statusNotes = ref('')
    const changingStatus = ref(false)

    // Stock Reservations
    const stockReservations = ref([])
    const loadingReservations = ref(false)
    
    // Computed
    const itemsTotal = computed(() => {
      if (!order.value?.items) return 0
      return order.value.items.reduce((sum, item) => sum + (item.total || 0), 0)
    })

    const totalReservedQuantity = computed(() => {
      return stockReservations.value.reduce((total, reservation) => {
        return total + (reservation.quantity || 0)
      }, 0)
    })

    // Status definitions
    const statusDefinitions = {
      'draft': {
        label: 'ร่าง',
        class: 'bg-gray-100 text-gray-800',
        nextActions: [
          { status: 'quoted', label: 'เสนอราคา', icon: 'fas fa-file-invoice' }
        ]
      },
      'quoted': {
        label: 'เสนอราคา',
        class: 'bg-blue-100 text-blue-800',
        nextActions: [
          { status: 'confirmed', label: 'ลูกค้ายืนยัน', icon: 'fas fa-check-circle' }
        ]
      },
      'confirmed': {
        label: 'ยืนยันแล้ว',
        class: 'bg-green-100 text-green-800',
        nextActions: [
          { status: 'approved', label: 'ชำระเงินแล้ว', icon: 'fas fa-credit-card' }
        ]
      },
      'approved': {
        label: 'ชำระเงินแล้ว',
        class: 'bg-purple-100 text-purple-800',
        nextActions: [
          { status: 'create_work_order', label: 'สร้าง Work Order', icon: 'fas fa-tasks' }
        ]
      },
      'in_production': {
        label: 'กำลังผลิต',
        class: 'bg-yellow-100 text-yellow-800',
        nextActions: [
          { status: 'shipped', label: 'จัดส่งแล้ว', icon: 'fas fa-shipping-fast' }
        ]
      },
      'shipped': {
        label: 'จัดส่งแล้ว',
        class: 'bg-orange-100 text-orange-800',
        nextActions: [
          { status: 'delivered', label: 'ส่งมอบแล้ว', icon: 'fas fa-check-double' }
        ]
      },
      'delivered': {
        label: 'ส่งมอบแล้ว',
        class: 'bg-indigo-100 text-indigo-800',
        nextActions: [
          { status: 'completed', label: 'สำเร็จ', icon: 'fas fa-trophy' }
        ]
      },
      'completed': {
        label: 'สำเร็จ',
        class: 'bg-green-100 text-green-800',
        nextActions: []
      },
      'cancelled': {
        label: 'ยกเลิก',
        class: 'bg-red-100 text-red-800',
        nextActions: []
      }
    }

    const availableActions = computed(() => {
      if (!order.value?.status) return []
      const statusDef = statusDefinitions[order.value.status]
      return statusDef ? statusDef.nextActions : []
    })

    // Load order data
    const loadOrder = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const orderId = route.params.id
        console.log('🔍 Loading order:', orderId)
        
        if (!orderId) {
          throw new Error('ไม่พบ Order ID')
        }
        
        // ใช้ SalesService แทน Transaction Engine
        let result
        if (salesService && salesService.getSalesOrder) {
          result = await salesService.getSalesOrder(orderId)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getSalesOrder(orderId)
        }
        
        console.log('📦 Order result:', result)
        
        if (result) {
          // Map field names to match component expectations
          order.value = {
            ...result,
            id: result._id || result.id,
            orderNumber: result.order_number || result.orderNumber,
            orderDate: result.order_date || result.orderDate,
            deliveryDate: result.delivery_date || result.deliveryDate,
            customerId: result.customer_id || result.customerId,
            customerName: result.customer_name || result.customerName,
            customerPhone: result.customer_phone || result.customerPhone
          }
          console.log('✅ Order loaded:', order.value)
          
          // โหลดข้อมูลการจองสต็อกถ้าสถานะเป็น confirmed
          if (order.value.status === 'confirmed') {
            await checkStockReservations()
          }
        } else {
          throw new Error('ไม่พบข้อมูล Sales Order')
        }
        
      } catch (err) {
        console.error('❌ Error loading order:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    // Load linked documents
    const loadLinkedDocuments = async () => {
      if (!order.value?.id) return
      
      try {
        console.log('🔄 [Sales Order Detail] Loading linked documents for order:', order.value.id)
        
        let result
        if (salesService && salesService.getSalesOrderWithLinkedDocuments) {
          result = await salesService.getSalesOrderWithLinkedDocuments(order.value.id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getSalesOrderWithLinkedDocuments(order.value.id)
        }
        
        if (result) {
          linkedQuotation.value = result.quotation || null
          linkedInvoice.value = result.invoice || null
          
          console.log('✅ [Sales Order Detail] Linked documents loaded:', {
            quotation: linkedQuotation.value?.quoteNumber || linkedQuotation.value?.quote_number || 'None',
            invoice: linkedInvoice.value?.invoiceNumber || linkedInvoice.value?.invoice_number || 'None'
          })
        }
      } catch (err) {
        console.error('❌ [Sales Order Detail] Error loading linked documents:', err)
      }
    }

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    // Format number
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return dateString
      }
    }

    // Format date time
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleString('th-TH')
      } catch (error) {
        return dateString
      }
    }

    // Get status class
    const getStatusClass = (status) => {
      const statusDef = statusDefinitions[status]
      return statusDef ? statusDef.class : 'bg-gray-100 text-gray-800'
    }

    // Get status text
    const getStatusText = (status) => {
      const statusDef = statusDefinitions[status]
      return statusDef ? statusDef.label : status
    }

    // Get action button class
    const getActionButtonClass = (status) => {
      const classes = {
        'quoted': 'bg-blue-500 hover:bg-blue-600 text-white',
        'confirmed': 'bg-green-500 hover:bg-green-600 text-white',
        'approved': 'bg-purple-500 hover:bg-purple-600 text-white',
        'create_work_order': 'bg-orange-500 hover:bg-orange-600 text-white',
        'in_production': 'bg-yellow-500 hover:bg-yellow-600 text-white',
        'shipped': 'bg-orange-500 hover:bg-orange-600 text-white',
        'delivered': 'bg-indigo-500 hover:bg-indigo-600 text-white',
        'completed': 'bg-green-600 hover:bg-green-700 text-white'
      }
      return classes[status] || 'bg-gray-500 hover:bg-gray-600 text-white'
    }

    // Status change methods
    const changeStatus = (newStatus) => {
      pendingStatus.value = newStatus
      statusNotes.value = ''
      showStatusModal.value = true
    }

    const confirmStatusChange = async () => {
      if (changingStatus.value) return
      
      try {
        changingStatus.value = true
        
        console.log('🔄 Changing status from', order.value.status, 'to', pendingStatus.value)
        
        // ✅ กรณีพิเศษ: สร้าง Work Order แทนการเปลี่ยนสถานะ
        if (pendingStatus.value === 'create_work_order') {
          console.log('🏭 Creating Work Order instead of status change...')
          
          // ปิด modal ก่อน
          showStatusModal.value = false
          pendingStatus.value = ''
          statusNotes.value = ''
          
          // เรียกฟังก์ชันสร้าง Work Order (ใช้จาก SalesOrderDetail.vue)
          await createWorkOrder()
          return
        }

        // ✅ กรณีพิเศษ: จองสต็อกเมื่อเปลี่ยนเป็น confirmed
        if (pendingStatus.value === 'confirmed') {
          console.log('🔒 Confirming order - will reserve stock...')
          console.log('📦 Order items to reserve:', order.value?.items)
          
          try {
            // ตรวจสอบสต็อกก่อนจอง
            console.log('🔍 Checking stock availability...')
            const stockCheck = await checkStockAvailability()
            console.log('📊 Stock check result:', stockCheck)
            
            // จองสต็อก
            console.log('🔒 Starting stock reservation...')
            const reservations = await reserveStock()
            console.log('📋 Reservations created:', reservations)
            
            console.log('✅ Stock reserved successfully')
          } catch (stockError) {
            console.error('❌ Stock reservation failed:', stockError)
            alert('เกิดข้อผิดพลาดในการจองสต็อก: ' + stockError.message)
            return // หยุดการเปลี่ยนสถานะถ้าจองสต็อกไม่ได้
          }
        }
        
        // Prepare update data with only necessary fields matching schema
        const updateData = {
          status: pendingStatus.value
        }

        // Add activity log entry (ตาม schema ควรใช้ activityLog)
        const newActivityEntry = {
          id: Date.now(),
          action: 'status_changed',
          description: `เปลี่ยนสถานะจาก ${getStatusText(order.value.status)} เป็น ${getStatusText(pendingStatus.value)}`,
          notes: statusNotes.value,
          timestamp: new Date().toISOString(),
          user: 'system',
          from_status: order.value.status,
          to_status: pendingStatus.value
        }

        // Add activity log to update data if it exists
        if (order.value.activityLog && Array.isArray(order.value.activityLog)) {
          updateData.activityLog = [...order.value.activityLog, newActivityEntry]
        } else {
          updateData.activityLog = [newActivityEntry]
        }

        // Save to engine with minimal update data matching schema
        const result = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)
        
        if (result?.success) {
          // Update local order object with new status and activity log
          order.value.status = pendingStatus.value
          if (updateData.activityLog) {
            order.value.activityLog = updateData.activityLog
          }
          
          console.log('✅ Status changed successfully to:', pendingStatus.value)
          
          // Close modal
          showStatusModal.value = false
          pendingStatus.value = ''
          statusNotes.value = ''
          
          // Show success message
          const successMsg = pendingStatus.value === 'confirmed' ? 
            `เปลี่ยนสถานะเป็น ${getStatusText(order.value.status)} และจองสต็อกสำเร็จ` :
            `เปลี่ยนสถานะเป็น ${getStatusText(order.value.status)} สำเร็จ`
          alert(successMsg)
        } else {
          throw new Error(result?.error || 'ไม่สามารถเปลี่ยนสถานะได้')
        }
        
      } catch (err) {
        console.error('❌ Error changing status:', err)
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ' + err.message)
      } finally {
        changingStatus.value = false
      }
    }

    const cancelStatusChange = () => {
      showStatusModal.value = false
      pendingStatus.value = ''
      statusNotes.value = ''
    }

    // Stock Management Functions (จาก SalesOrderDetail.vue)
    const checkStockAvailability = async () => {
      try {
        if (!order.value?.items) return { available: false, details: [] }
        
        console.log('📦 Checking stock availability for sales order items...')
        
        // โหลดข้อมูล Product และ Balance
        const [productResult, balanceResult] = await Promise.all([
          engine.list('product'),
          engine.list('inventory_balance')
        ])
        
        const products = productResult?.data || []
        const balances = balanceResult?.data || []
        
        const stockDetails = []
        let allAvailable = true
        
        for (const item of order.value.items) {
          // ค้นหา product_id
          let productId = item.product_id || item.productId
          
          if (!productId) {
            // พยายามค้นหาจาก product name หรือ SKU
            const product = products.find(p => 
              p.name === (item.productName || item.product_name || item.name) ||
              p.sku === (item.code || item.sku)
            )
            productId = product?.id
          }
          
          if (!productId) {
            stockDetails.push({
              item: item,
              product_id: null,
              available: false,
              current_stock: 0,
              reserved_stock: 0,
              available_stock: 0,
              required: item.quantity || 0,
              status: 'no_product_id'
            })
            allAvailable = false
            continue
          }
          
          // หา Balance สำหรับ product นี้
          const balance = balances.find(b => b.product_id === productId)
          const currentStock = balance?.qty_on_hand || 0
          const reservedStock = balance?.qty_reserved || 0
          const availableStock = balance?.qty_available || (currentStock - reservedStock)
          const required = item.quantity || 0
          
          const itemAvailable = availableStock >= required
          
          stockDetails.push({
            item: item,
            product_id: productId,
            available: itemAvailable,
            current_stock: currentStock,
            reserved_stock: reservedStock,
            available_stock: availableStock,
            required: required,
            status: itemAvailable ? 'available' : 'insufficient'
          })
          
          if (!itemAvailable) {
            allAvailable = false
          }
        }
        
        console.log('📊 Stock check results:', stockDetails)
        
        return {
          available: allAvailable,
          details: stockDetails
        }
        
      } catch (error) {
        console.error('❌ Error checking stock availability:', error)
        return { available: false, details: [], error: error.message }
      }
    }

    const reserveStock = async () => {
      try {
        console.log('🔒 Starting stock reservation process for sales order...')
        
        // ตรวจสอบสต็อกก่อน
        const stockCheck = await checkStockAvailability()
        
        if (!stockCheck.available) {
          console.error('❌ Stock not available:', stockCheck)
          
          // แสดงรายละเอียดสต็อกที่ไม่เพียงพอ
          let errorMessage = 'สต็อกไม่เพียงพอสำหรับการยืนยันคำสั่งซื้อ:\n\n'
          
          stockCheck.details.forEach(detail => {
            if (detail.status === 'insufficient') {
              const productName = detail.item.productName || detail.item.product_name || detail.item.name || 'สินค้าไม่ทราบชื่อ'
              errorMessage += `• ${productName}: ต้องการ ${detail.required} แต่มีเพียง ${detail.available_stock}\n`
            } else if (detail.status === 'no_product_id') {
              const productName = detail.item.productName || detail.item.product_name || detail.item.name || 'สินค้าไม่ทราบชื่อ'
              errorMessage += `• ${productName}: ไม่พบรหัสสินค้าในระบบ\n`
            }
          })
          
          throw new Error(errorMessage)
        }
        
        const reservations = []
        console.log(`🔄 Processing ${stockCheck.details?.length || 0} items for reservation...`)
        
        // จองสต็อกสำหรับแต่ละรายการ
        for (const detail of stockCheck.details) {
          if (detail.status === 'available' && detail.product_id) {
            
            // อัปเดต Balance
            const balanceResult = await engine.list('inventory_balance')
            const balances = balanceResult?.data || []
            const existingBalance = balances.find(b => b.product_id === detail.product_id)
            
            if (existingBalance) {
              const newReservedQuantity = (existingBalance.qty_reserved || 0) + detail.required
              const newAvailableQuantity = Math.max(0, (existingBalance.qty_on_hand || 0) - newReservedQuantity)
              
              const updateData = {
                qty_reserved: newReservedQuantity,
                qty_available: newAvailableQuantity,
                updated_at: new Date().toISOString()
              }
              
              const updateResult = await engine.update('inventory_balance', existingBalance.id, updateData)
              
              if (updateResult.success) {
                console.log(`✅ Reserved ${detail.required} units for product ${detail.product_id}`)
                
                // สร้าง inventory reservation record
                const allowedUnits = ['ชิ้น', 'ชุด', 'กล่อง', 'แพ็ค', 'กิโลกรัม', 'กรัม', 'ลิตร', 'เมตร', 'ม้วน', 'ขวด', 'ถุง']
                const itemUnit = detail.item.unit || 'ชิ้น'
                const validUnit = allowedUnits.includes(itemUnit) ? itemUnit : 'ชิ้น'
                
                const reservationData = {
                  subtype: 'reservation',
                  product_id: detail.product_id,
                  product_name: detail.item.productName || detail.item.product_name || detail.item.name,
                  sku: detail.item.sku || detail.item.code,
                  movement_type: 'adjustment',
                  transaction_type: 'reservation',
                  quantity: detail.required,
                  unit: validUnit,
                  reference_type: 'sales_order',
                  reference_id: order.value.id,
                  reference_number: order.value.orderNumber,
                  sales_order_id: order.value.id,
                  notes: `จองสต็อกสำหรับ Sales Order ${order.value.orderNumber}`,
                  movement_date: new Date().toISOString(),
                  created_by: 'sales_system',
                  status: 'reserved'
                }
                
                console.log('📝 Creating inventory reservation record with data:', reservationData)
                const inventoryResult = await engine.create(TRANSACTION_TYPES.INVENTORY, reservationData, 'sales_system')
                console.log('📝 Inventory creation result:', inventoryResult)
                
                if (inventoryResult.success) {
                  console.log(`✅ Created inventory reservation record for product ${detail.product_id}`)
                  console.log('📄 Created record ID:', inventoryResult.data?.id)
                  
                  reservations.push({
                    product_id: detail.product_id,
                    quantity: detail.required,
                    balance_id: existingBalance.id,
                    sales_order_id: order.value.id,
                    reservation_id: inventoryResult.data?.id
                  })
                } else {
                  console.error(`❌ Failed to create inventory reservation record:`, inventoryResult.error)
                }
              } else {
                throw new Error(`ไม่สามารถจองสต็อกสำหรับสินค้า ${detail.product_id} ได้`)
              }
            }
          }
        }
        
        console.log(`✅ Stock reservation completed: ${reservations.length} items reserved`)
        
        // รีเฟรชข้อมูลการจองหลังจากจองสำเร็จ
        await checkStockReservations()
        
        return reservations
        
      } catch (error) {
        console.error('❌ Error reserving stock:', error)
        throw error
      }
    }

    // Check and load stock reservations
    const checkStockReservations = async () => {
      try {
        if (!order.value?.id) return
        
        loadingReservations.value = true
        console.log('🔍 Loading stock reservations for order:', order.value.id)
        
        // Query inventory records ที่เป็นการจองสำหรับ sales order นี้
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        console.log('📦 All inventory records:', inventoryResult)
        
        if (inventoryResult.success && inventoryResult.data) {
          console.log('🔍 Filtering reservations for order:', order.value.id)
          console.log('📋 Total inventory records:', inventoryResult.data.length)
          
          // แสดง sample records สำหรับ debug
          const sampleRecords = inventoryResult.data.slice(0, 3)
          console.log('📄 Sample inventory records:', sampleRecords)
          
          const allReservations = inventoryResult.data.filter(record => 
            record.subtype === 'reservation'
          )
          console.log('🔍 All reservation records:', allReservations.length)
          
          const orderReservations = inventoryResult.data.filter(record => 
            record.sales_order_id === order.value.id
          )
          console.log('🔍 Records for this order:', orderReservations.length)
          
          const reservations = inventoryResult.data.filter(record => 
            record.subtype === 'reservation' && 
            record.sales_order_id === order.value.id && 
            record.transaction_type === 'reservation'
          )
          
          console.log('🔍 Final filtered reservations:', reservations)
          
          stockReservations.value = reservations
          console.log(`✅ Found ${reservations.length} stock reservations for order ${order.value.id}`)
        } else {
          console.log('❌ No inventory data or failed to load')
          stockReservations.value = []
        }
        
      } catch (error) {
        console.error('❌ Error loading stock reservations:', error)
        stockReservations.value = []
      } finally {
        loadingReservations.value = false
      }
    }

    // Debug function
    const debugInventoryData = async () => {
      try {
        console.log('🐛 === DEBUG INVENTORY DATA ===')
        console.log('Order ID:', order.value?.id)
        console.log('Order Status:', order.value?.status)
        console.log('Order Items:', order.value?.items)
        
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        console.log('All Inventory Records:', inventoryResult.data?.length || 0)
        
        if (inventoryResult.data && inventoryResult.data.length > 0) {
          // แสดงข้อมูล 5 records แรก
          console.log('Sample Inventory Records:', inventoryResult.data.slice(0, 5))
          
          // หาข้อมูลที่เกี่ยวข้องกับ order นี้
          const relatedRecords = inventoryResult.data.filter(record => 
            record.sales_order_id === order.value.id || 
            record.reference_id === order.value.id
          )
          console.log('Records Related to This Order:', relatedRecords)
          
          // หา reservation records ทั้งหมด
          const allReservations = inventoryResult.data.filter(record => 
            record.subtype === 'reservation' || 
            record.transaction_type === 'reservation'
          )
          console.log('All Reservation Records:', allReservations)
        }
        
        console.log('Current Stock Reservations State:', stockReservations.value)
        console.log('🐛 === END DEBUG ===')
        
        alert('Debug ข้อมูลแล้ว - ดูใน Console (F12)')
      } catch (error) {
        console.error('Debug Error:', error)
        alert('เกิดข้อผิดพลาดในการ debug: ' + error.message)
      }
    }

    // Work Order functions
    const createWorkOrder = async () => {
      try {
        console.log('🏭 Creating Work Order for Sales Order:', order.value.id)
        
        if (!order.value || !order.value.items) {
          throw new Error('ไม่พบข้อมูลสินค้าในใบขาย')
        }

        // เตรียมข้อมูล work order
        const workOrderData = {
          sales_order_id: order.value.id,
          sales_order_number: order.value.orderNumber,
          order_number: `WO-${Date.now()}`,
          customer_name: order.value.customerName,
          due_date: order.value.deliveryDate,
          priority: 'normal',
          warehouse: 'main',
          notes: `Work Order สำหรับใบขาย ${order.value.orderNumber}`,
          
          // แปลง items จาก sales order เป็น work order items
          items: order.value.items.map(item => ({
            id: Math.random().toString(36).substr(2, 9),
            product_id: item.productId || item.product_id || '',
            product_name: item.productName || item.product_name || item.name || '',
            product_code: item.sku || item.code || '',
            sku: item.sku || item.code || '',
            quantity: item.quantity || 0,
            required_quantity: item.quantity || 0,
            picked_quantity: 0,
            unit: item.unit || 'ชิ้น',
            unit_price: item.unitPrice || item.unit_price || item.price || 0,
            status: 'pending',
            // เก็บข้อมูลเดิมไว้
            originalSalesItem: {
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unit: item.unit,
              discount: item.discount,
              total: item.total
            }
          })),
          
          activities: [{
            timestamp: new Date().toISOString(),
            user: 'ผู้ใช้ระบบ',
            action: 'created',
            description: 'สร้าง Work Order จากใบขาย',
            notes: `สร้างจากใบขาย ${order.value.orderNumber}`,
            sales_order_id: order.value.id
          }]
        }
        
        console.log('📋 Work Order data prepared:', workOrderData)
        
        // 🏭 สร้าง Work Order จริงๆ ใน database
        const workOrderResult = await engine.create(TRANSACTION_TYPES.WORK_ORDER, workOrderData)
        
        if (!workOrderResult?.success) {
          throw new Error(workOrderResult?.error || 'ไม่สามารถสร้าง Work Order ได้')
        }
        
        console.log('✅ Work Order created successfully:', workOrderResult.data)
        
        // อัปเดตสถานะ sales order เป็น in_production (ไม่เก็บ work_order_id ใน sales order schema)
        const updateData = {
          status: 'in_production'
        }

        // เพิ่ม activity log การสร้าง Work Order
        const newActivityEntry = {
          id: Date.now(),
          action: 'work_order_created',
          description: `สร้าง Work Order ${workOrderData.order_number} เรียบร้อยแล้ว`,
          notes: `Work Order ID: ${workOrderResult.data.id}`,
          timestamp: new Date().toISOString(),
          user: 'system',
          work_order_id: workOrderResult.data.id,
          work_order_number: workOrderData.order_number
        }

        // Add activity log to update data if it exists
        if (order.value.activityLog && Array.isArray(order.value.activityLog)) {
          updateData.activityLog = [...order.value.activityLog, newActivityEntry]
        } else {
          updateData.activityLog = [newActivityEntry]
        }
        
        const statusResult = await engine.update(TRANSACTION_TYPES.SALES, order.value.id, updateData)
        
        if (statusResult?.success) {
          order.value.status = 'in_production'
          // อัปเดต activity log ใน local object
          if (updateData.activityLog) {
            order.value.activityLog = updateData.activityLog
          }
          // เก็บ work order info ใน local object เพื่อแสดงผล (ไม่บันทึกใน database)
          order.value._localWorkOrder = {
            id: workOrderResult.data.id,
            number: workOrderData.order_number
          }
          
          console.log('✅ Sales Order status updated to in_production')
          
          const workOrderNumber = workOrderData.order_number
          alert(`Work Order สร้างสำเร็จ!\n\nหมายเลข Work Order: ${workOrderNumber}\n\nสถานะ Sales Order เปลี่ยนเป็น "กำลังผลิต" เรียบร้อยแล้ว`)
          
          // Refresh order data to show updated status
          await loadOrder()
        } else {
          throw new Error('ไม่สามารถอัปเดตสถานะ Sales Order ได้')
        }
        
      } catch (error) {
        console.error('❌ Error creating work order:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      }
    }

    // Edit order
    const editOrder = () => {
      router.push(`/sales/sales-order/${order.value.id}/edit`)
    }

    // Print order
    const printOrder = () => {
      window.print()
    }

    // Navigate to document
    const viewDocument = (type, id) => {
      if (!id) return
      const routes = {
        'quotation': `/sales/quotation/${id}`,
        'invoice': `/sales/invoice/${id}`
      }
      if (routes[type]) {
        router.push(routes[type])
      }
    }

    // Initialize
    onMounted(async () => {
      await loadOrder()
      await loadLinkedDocuments()
    })

    return {
      // Data
      order,
      loading,
      error,
      linkedQuotation,
      linkedInvoice,
      breadcrumbNav,
      
      // Status change modal
      showStatusModal,
      pendingStatus,
      statusNotes,
      changingStatus,

      // Stock Reservations
      stockReservations,
      loadingReservations,
      totalReservedQuantity,
      
      // Computed
      itemsTotal,
      availableActions,
      
      // Services
      salesService,
      
      // Methods
      loadOrder,
      formatCurrency,
      formatNumber,
      formatDate,
      formatDateTime,
      getStatusClass,
      getStatusText,
      getActionButtonClass,
      changeStatus,
      confirmStatusChange,
      cancelStatusChange,
      editOrder,
      printOrder,
      viewDocument,
      checkStockReservations,
      debugInventoryData
    }
  }
}
</script>

<style scoped>
/* Custom animations for loading */
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

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Modal animations */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active, .modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from, .modal-content-leave-to {
  transform: scale(0.95) translateY(-20px);
}

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .bg-white {
    background-color: white !important;
  }
  
  .shadow-sm {
    box-shadow: none !important;
  }
  
  .border {
    border: 1px solid #000 !important;
  }
}
</style>