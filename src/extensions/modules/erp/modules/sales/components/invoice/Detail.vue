<template>
  <!-- File Browser Modal for Payment Slip (z-index สูงสุด) -->
  <div v-if="FileBrowserOpen" style="z-index: 9999;">
    <FileBrowser 
      :isWindowsOpen="true" 
      :callbackFunction="'payment_slip'"
      :allowFileType="['jpg','gif','png','jpeg','pdf']" 
      @file-browser-trigger="changeFileTrigger" 
      @file-browser-callback="selectFileTrigger"
    />
  </div>

  <!-- Payment Slip Viewer Modal -->
  <div v-if="showSlipViewer" class="fixed inset-0 bg-black bg-opacity-90 overflow-y-auto h-full w-full" style="z-index: 9500;" @click.self="closeSlipViewer">
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <!-- Close Button -->
      <button 
        @click="closeSlipViewer"
        class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <i class="fas fa-times text-3xl"></i>
      </button>

      <!-- Image Container -->
      <div class="relative max-w-5xl w-full">
        <!-- Main Image Display -->
        <div class="bg-white rounded-lg overflow-hidden shadow-2xl">
          <div class="p-4 bg-gray-800 text-white">
            <h3 class="text-xl font-semibold">
              <i class="fas fa-receipt mr-2"></i>
              สลิปการชำระเงิน
            </h3>
            <p class="text-sm text-gray-300 mt-1">
              {{ invoice?.invoice_number }} - {{ formatCurrency(invoice?.paid_amount || invoice?.total_amount) }}
            </p>
          </div>
          
          <div class="bg-gray-100 flex items-center justify-center" style="min-height: 500px;">
            <!-- Image Display -->
            <div v-if="currentSlipType === 'image'" class="w-full">
              <img 
                :src="currentSlipUrl" 
                alt="Payment Slip" 
                class="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
            
            <!-- PDF Display -->
            <div v-else-if="currentSlipType === 'pdf'" class="w-full text-center p-8">
              <i class="fas fa-file-pdf text-red-600 text-8xl mb-4"></i>
              <p class="text-gray-700 mb-4">ไฟล์ PDF</p>
              <a 
                :href="currentSlipUrl" 
                target="_blank"
                class="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
              >
                <i class="fas fa-external-link-alt mr-2"></i>
                เปิดในหน้าต่างใหม่
              </a>
            </div>

            <!-- No Slip -->
            <div v-else class="text-center p-8">
              <i class="fas fa-image text-gray-400 text-8xl mb-4"></i>
              <p class="text-gray-500">ไม่พบไฟล์สลิป</p>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="p-4 bg-white border-t">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">วันที่ชำระ:</span>
                <span class="ml-2 font-semibold">{{ formatDate(invoice?.payment_date) }}</span>
              </div>
              <div>
                <span class="text-gray-600">วิธีชำระ:</span>
                <span class="ml-2 font-semibold">{{ getPaymentMethodText(invoice?.payment_method) }}</span>
              </div>
            </div>
            <div v-if="invoice?.payment_note" class="mt-3 pt-3 border-t">
              <span class="text-gray-600">หมายเหตุ:</span>
              <p class="text-gray-800 mt-1">{{ invoice.payment_note }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 bg-gray-50 border-t flex justify-between items-center">
            <a 
              :href="currentSlipUrl" 
              download
              class="text-blue-600 hover:text-blue-800"
            >
              <i class="fas fa-download mr-2"></i>
              ดาวน์โหลด
            </a>
            <button 
              @click="closeSlipViewer"
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              <i class="fas fa-times mr-2"></i>
              ปิด
            </button>
          </div>
        </div>

        <!-- Navigation Arrows (for future multiple images) -->
        <!-- <button 
          v-if="slipImages.length > 1"
          @click="previousSlip"
          class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-3 rounded-full"
        >
          <i class="fas fa-chevron-left text-2xl"></i>
        </button>
        <button 
          v-if="slipImages.length > 1"
          @click="nextSlip"
          class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-3 rounded-full"
        >
          <i class="fas fa-chevron-right text-2xl"></i>
        </button> -->
      </div>
    </div>
  </div>

  <!-- Payment Confirmation Modal (z-index ต่ำกว่า) -->
  <div v-if="showPaymentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" style="z-index: 9000;">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isAddingSlipOnly ? 'แนบสลิปการชำระเงิน' : 'บันทึกการชำระเงิน' }}
          </h3>
          <button @click="closePaymentModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Payment Amount (only show when recording payment) -->
        <div v-if="!isAddingSlipOnly" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนเงิน</label>
          <input 
            v-model="paymentAmount"
            type="number"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="formatCurrency(invoice?.total_amount || 0)"
          />
        </div>

        <!-- Payment Method (only show when recording payment) -->
        <div v-if="!isAddingSlipOnly" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">วิธีชำระเงิน</label>
          <select 
            v-model="paymentMethod"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="bank_transfer">โอนเงินผ่านธนาคาร</option>
            <option value="cash">เงินสด</option>
            <option value="credit_card">บัตรเครดิต</option>
            <option value="cheque">เช็ค</option>
          </select>
        </div>

        <!-- Payment Date (only show when recording payment) -->
        <div v-if="!isAddingSlipOnly" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ชำระเงิน</label>
          <input 
            v-model="paymentDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Payment Slip Attachment -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            แนบสลิปการชำระเงิน <span class="text-red-500">*</span>
          </label>
          
          <!-- Display selected slip -->
          <div v-if="paymentSlip" class="mb-3">
            <div class="border border-green-300 bg-green-50 rounded-lg p-3 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle text-green-600"></i>
                <span class="text-sm text-gray-700">ไฟล์สลิปถูกเลือกแล้ว</span>
              </div>
              <button 
                @click="clearPaymentSlip"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                <i class="fas fa-times mr-1"></i>ลบ
              </button>
            </div>
            
            <!-- Preview image if it's an image file -->
            <div v-if="isImageFile(paymentSlip)" class="mt-2">
              <img :src="paymentSlip" alt="Payment Slip" class="w-full h-48 object-cover rounded-lg border border-gray-300" />
            </div>
            <div v-else class="mt-2 text-center">
              <i class="fas fa-file-pdf text-red-600 text-4xl"></i>
              <p class="text-xs text-gray-500 mt-1">PDF Document</p>
            </div>
          </div>

          <!-- Select file button -->
          <button 
            @click="openFileBrowser"
            type="button"
            class="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
            <p class="text-sm text-gray-600">
              {{ paymentSlip ? 'เปลี่ยนไฟล์สลิป' : 'คลิกเพื่อเลือกไฟล์สลิป' }}
            </p>
            <p class="text-xs text-gray-500 mt-1">รองรับ JPG, PNG, GIF, PDF</p>
          </button>
        </div>

        <!-- Note -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (ถ้ามี)</label>
          <textarea 
            v-model="paymentNote"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ระบุข้อมูลเพิ่มเติมเกี่ยวกับการชำระเงิน..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button 
            @click="closePaymentModal"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmPayment"
            :disabled="!paymentSlip || recordingPayment"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i :class="recordingPayment ? 'fas fa-spinner fa-spin' : 'fas fa-check'" class="mr-2"></i>
            {{ recordingPayment ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน' }}
          </button>
        </div>
      </div>
    </div>
  </div>

    <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Invoice Detail</h1>
            <p v-if="invoice" class="mt-2 text-gray-600">ใบแจ้งหนี้ / Invoice - <span class="font-mono">{{ invoice.invoice_number }}</span></p>
            <p v-else class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
          <div class="flex space-x-3">
            <button 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="$router.go(-1)"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              ย้อนกลับ
            </button>
            <button 
              v-if="invoice"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              @click="handlePrint"
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
          @click="$router.push('/sales/invoice')"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          กลับไปหน้ารายการ
        </button>
      </div>

      <!-- Invoice Detail -->
      <div v-else-if="invoice" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Invoice Status Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">สถานะ</h3>
                  <span 
                    :class="getStatusClass(invoice.status)"
                    class="inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1"
                  >
                    {{ getStatusText(invoice.status) }}
                  </span>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">การชำระเงิน</h3>
                  <span 
                    :class="getPaymentStatusClass(invoice.payment_status)"
                    class="inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1"
                  >
                    {{ getPaymentStatusText(invoice.payment_status) }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Record Payment Button -->
                <button 
                  v-if="canRecordPayment"
                  @click="openPaymentModal"
                  :disabled="recordingPayment"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-money-bill-wave mr-2"></i>
                  บันทึกการชำระเงิน
                </button>
                
                <!-- Add Payment Slip -->
                <button 
                  v-if="invoice.payment_status === 'paid' && !invoice.payment_slip"
                  @click="openPaymentModal"
                  :disabled="recordingPayment"
                  class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-paperclip mr-2"></i>
                  แนบสลิป
                </button>
                
                <!-- Create Sales Order Button -->
                <button 
                  v-if="canCreateSalesOrder"
                  @click="handleCreateSalesOrder"
                  :disabled="creatingSalesOrder"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i :class="creatingSalesOrder ? 'fas fa-spinner fa-spin' : 'fas fa-shopping-cart'" class="mr-2"></i>
                  {{ creatingSalesOrder ? 'กำลังสร้าง...' : 'สร้าง Sales Order' }}
                </button>
                
                <!-- View Sales Order Button -->
                <button 
                  v-if="invoice.sales_order_id"
                  @click="handleViewSalesOrder"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <i class="fas fa-shopping-cart mr-2"></i>ดู Sales Order
                </button>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลใบแจ้งหนี้</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หมายเลข Invoice</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono font-semibold">{{ invoice.invoice_number }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ออก Invoice</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(invoice.invoice_date) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold">{{ invoice.customerName || `Customer ID: ${invoice.customer_id}` }}</p>
                    <p v-if="invoice.customerPhone" class="text-gray-600 text-sm mt-1">{{ invoice.customerPhone }}</p>
                  </div>
                </div>
                <div v-if="invoice.due_date">
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันครบกำหนด</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(invoice.due_date) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Payment Info (if paid) -->
              <div v-if="invoice.payment_status === 'paid'" class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 class="text-sm font-semibold text-green-800 mb-3 flex items-center">
                  <i class="fas fa-check-circle mr-2"></i>ข้อมูลการชำระเงิน
                </h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div v-if="invoice.payment_date">
                    <span class="text-green-700 font-medium">วันที่ชำระ:</span>
                    <span class="text-green-900 ml-2">{{ formatDate(invoice.payment_date) }}</span>
                  </div>
                  <div v-if="invoice.payment_method">
                    <span class="text-green-700 font-medium">วิธีชำระ:</span>
                    <span class="text-green-900 ml-2">{{ getPaymentMethodText(invoice.payment_method) }}</span>
                  </div>
                  <div>
                    <span class="text-green-700 font-medium">จำนวนเงิน:</span>
                    <span class="text-green-900 ml-2 font-semibold">{{ formatCurrency(invoice.paid_amount || invoice.total_amount) }}</span>
                  </div>
                  <div v-if="invoice.payment_slip" class="col-span-2">
                    <button
                      @click="openSlipViewer"
                      class="text-green-600 hover:text-green-800 text-sm flex items-center"
                    >
                      <i class="fas fa-receipt mr-1"></i>ดูสลิปการชำระเงิน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

              <!-- Document Flow -->
          <div v-if="invoice" class="bg-white rounded shadow-sm p-4 border border-gray-200">
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
              
              <!-- Invoice (Current) -->
              <div class="flex-1 p-2 rounded border-2 border-gray-600 bg-gray-50">
                <div class="text-gray-600 mb-0.5">ใบแจ้งหนี้</div>
                <div class="font-semibold text-gray-900">{{ invoice.invoice_number }}</div>
              </div>
              
              <i class="fas fa-arrow-right text-gray-400 text-sm"></i>
              
              <!-- Sales Order -->
              <div 
                v-if="linkedSalesOrder"
                @click="viewDocument('sales_order', linkedSalesOrder.id || linkedSalesOrder._id)"
                class="flex-1 p-2 rounded border border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
              >
                <div class="text-gray-600 mb-0.5">ใบสั่งขาย</div>
                <div class="font-semibold text-gray-900">{{ linkedSalesOrder.orderNumber || linkedSalesOrder.order_number || linkedSalesOrder.so_number }}</div>
              </div>
              <div v-else class="flex-1 p-2 rounded border border-dashed border-gray-300 bg-gray-50">
                <div class="text-gray-400">ใบสั่งขาย</div>
                <div class="text-gray-400 text-xs">-</div>
              </div>
            </div>
          </div>

          <!-- 📦 Stock Reservations Section -->
          <div v-if="invoice && stockReservations.length > 0" class="bg-white rounded shadow-sm p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-gray-700">
                <i class="fas fa-box-open mr-2 text-blue-600"></i>
                การจองสต็อค
              </h3>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {{ stockReservations.length }} รายการ
              </span>
            </div>

            <!-- Loading State -->
            <div v-if="loadingReservations" class="text-center py-4">
              <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
              <p class="text-xs text-gray-500 mt-2">กำลังโหลดข้อมูลการจอง...</p>
            </div>

            <!-- Reservations List -->
            <div v-else class="space-y-2">
              <div 
                v-for="reservation in stockReservations" 
                :key="reservation._id"
                class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <!-- Left: Product & Lot Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-900">
                        {{ reservation.lot_info?.product_name || reservation.product_name }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        <i class="fas fa-tag mr-1"></i>
                        Lot: {{ reservation.lot_info?.lot_id || reservation.lot_id }}
                      </span>
                    </div>
                    
                    <div class="flex items-center gap-3 text-xs text-gray-600">
                      <span>
                        <i class="fas fa-ruler mr-1"></i>
                        {{ reservation.reserved_meters?.toFixed(2) || 0 }} เมตร
                      </span>
                      <span v-if="reservation.lot_info?.supplier">
                        <i class="fas fa-truck mr-1"></i>
                        {{ reservation.lot_info.supplier }}
                      </span>
                      <span v-if="reservation.lot_info?.receive_date">
                        <i class="far fa-calendar mr-1"></i>
                        {{ formatDate(reservation.lot_info.receive_date) }}
                      </span>
                    </div>
                  </div>

                  <!-- Right: Status Badge -->
                  <div class="ml-4 flex flex-col items-end gap-1">
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

                <!-- Additional Info (if available) -->
                <div v-if="reservation.notes" class="mt-2 pt-2 border-t border-gray-100">
                  <p class="text-xs text-gray-600 italic">
                    <i class="fas fa-sticky-note mr-1"></i>
                    {{ reservation.notes }}
                  </p>
                </div>
              </div>
            </div>

            <!-- No Reservations Message -->
            <div v-if="!loadingReservations && stockReservations.length === 0" class="text-center py-4">
              <i class="fas fa-inbox text-3xl text-gray-300 mb-2"></i>
              <p class="text-xs text-gray-500">ไม่พบข้อมูลการจองสต็อค</p>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายการ</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ราคา/หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">รวม</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in invoice.items" :key="index">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">{{ item.description }}</div>
                        <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
                        <div v-if="item.lot_code" class="text-xs text-purple-600">
                          <i class="fas fa-scroll mr-1"></i>{{ item.lot_code }}
                          <span v-if="item.is_full_roll" class="ml-2 text-green-600">(ยกทั้งม้วน)</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.quantity }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ item.unit }}</td>
                      <td class="px-6 py-4 text-right text-sm text-gray-900">{{ formatCurrency(item.unit_price) }}</td>
                      <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="invoice.notes" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">หมายเหตุ</h3>
            <p class="text-gray-700 whitespace-pre-wrap">{{ invoice.notes }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Summary -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">สรุปยอด</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">ยอดรวมก่อนภาษี:</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(invoice.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">ภาษีมูลค่าเพิ่ม ({{ invoice.vat_rate }}%):</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(invoice.vat_amount) }}</span>
              </div>
              <hr class="border-gray-200">
              <div class="flex justify-between text-lg font-bold">
                <span class="text-gray-900">ยอดรวมทั้งสิ้น:</span>
                <span class="text-blue-600">{{ formatCurrency(invoice.total_amount) }}</span>
              </div>
              <div v-if="invoice.payment_status === 'paid'" class="flex justify-between text-sm text-green-600 pt-2 border-t">
                <span class="font-medium">ชำระแล้ว:</span>
                <span class="font-semibold">{{ formatCurrency(invoice.paid_amount || invoice.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Debug Panel -->
    <DocumentDebugPanel
      v-if="invoice"
      documentType="Invoice"
      :currentDocument="invoice"
      :salesService="salesService"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FileBrowser from '@/interface/modal/FileBrowser.vue'
import DocumentDebugPanel from '../../shared/DocumentDebugPanel.vue'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'InvoiceDetail',
  components: {
    FileBrowser,
    DocumentDebugPanel,
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const salesService = inject('salesService')
    
    // Breadcrumb navigation
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Invoices', path: '/sales/invoice', icon: 'fas fa-file-invoice-dollar' },
      { name: 'Invoice Detail' }
    ])
    
    const invoice = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const recordingPayment = ref(false)
    const creatingSalesOrder = ref(false)
    
    // Payment Modal State
    const showPaymentModal = ref(false)
    const FileBrowserOpen = ref(false)
    const paymentSlip = ref(null)
    const paymentAmount = ref(0)
    const paymentMethod = ref('bank_transfer')
    const paymentDate = ref(new Date().toISOString().split('T')[0])
    const paymentNote = ref('')
    const isAddingSlipOnly = ref(false) // ใช้บอกว่ากำลังแนบสลิปเท่านั้นหรือบันทึกการชำระ
    
    // Slip Viewer State
    const showSlipViewer = ref(false)
    const currentSlipUrl = ref('')
    const currentSlipType = ref('') // 'image' or 'pdf'
    
    // Linked Documents State
    const linkedQuotation = ref(null)
    const linkedSalesOrder = ref(null)
    
    // ✅ Stock Reservations State
    const stockReservations = ref([])
    const loadingReservations = ref(false)
    
    // ตรวจสอบว่าสามารถบันทึกการชำระเงินได้หรือไม่
    const canRecordPayment = computed(() => {
      if (!invoice.value) return false
      return invoice.value.payment_status === 'pending' && !invoice.value.sales_order_id
    })
    
    // ตรวจสอบว่าสามารถสร้าง Sales Order ได้หรือไม่ (ชำระเงินแล้ว)
    const canCreateSalesOrder = computed(() => {
      if (!invoice.value) return false
      return invoice.value.payment_status === 'paid' && !invoice.value.sales_order_id
    })
    
    const loadInvoice = async () => {
      loading.value = true
      error.value = null
      
      try {
        const id = route.params.id
        console.log('🔄 [Invoice Detail] Loading invoice:', id)
        
        let result
        if (salesService && salesService.getInvoice) {
          result = await salesService.getInvoice(id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getInvoice(id)
        }
        
        if (result) {
          invoice.value = result
          console.log('✅ [Invoice Detail] Loaded:', invoice.value)
        } else {
          error.value = 'ไม่พบข้อมูล Invoice'
        }
      } catch (err) {
        console.error('❌ [Invoice Detail] Error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    // Load linked documents
    const loadLinkedDocuments = async () => {
      if (!invoice.value?.id) return
      
      try {
        console.log('🔄 [Invoice Detail] Loading linked documents for invoice:', invoice.value.id)
        
        let result
        if (salesService && salesService.getInvoiceWithLinkedDocuments) {
          result = await salesService.getInvoiceWithLinkedDocuments(invoice.value.id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getInvoiceWithLinkedDocuments(invoice.value.id)
        }
        
        if (result) {
          linkedQuotation.value = result.quotation || null
          linkedSalesOrder.value = result.salesOrder || null
          
          console.log('✅ [Invoice Detail] Linked documents loaded:', {
            quotation: linkedQuotation.value?.quoteNumber || linkedQuotation.value?.quote_number || 'None',
            salesOrder: linkedSalesOrder.value?.orderNumber || linkedSalesOrder.value?.order_number || 'None'
          })

          // ✅ Load stock reservations
          await loadStockReservations()
        }
      } catch (err) {
        console.error('❌ [Invoice Detail] Error loading linked documents:', err)
      }
    }

    // ✅ Load stock reservations
    const loadStockReservations = async () => {
      if (!invoice.value?.quotation_id) {
        console.log('⚠️ [Invoice Detail] No quotation_id, skipping reservations load')
        return
      }

      try {
        loadingReservations.value = true
        console.log('📦 [Invoice Detail] Loading stock reservations for quotation:', invoice.value.quotation_id)

        // Import InventoryService
        const { inventoryService } = await import('@/services/InventoryService.js')

        // Initialize if needed
        if (!inventoryService.isReady()) {
          inventoryService.initialize(window.vueApp?.config?.globalProperties)
        }

        // Get reservations for this quotation
        const reservations = await inventoryService.getReservations(
          'quotation',
          invoice.value.quotation_id
        )

        stockReservations.value = reservations || []

        console.log('✅ [Invoice Detail] Loaded reservations:', stockReservations.value.length)

      } catch (err) {
        console.error('❌ [Invoice Detail] Error loading stock reservations:', err)
      } finally {
        loadingReservations.value = false
      }
    }
    
    // Payment Modal Functions
    const openPaymentModal = () => {
      // ตรวจสอบว่าเป็นการแนบสลิปเท่านั้น หรือบันทึกการชำระเงิน
      if (invoice.value?.payment_status === 'paid' && !invoice.value?.payment_slip) {
        // กรณีชำระแล้วแต่ไม่มีสลิป - แค่แนบสลิป
        isAddingSlipOnly.value = true
      } else {
        // กรณีบันทึกการชำระเงินใหม่
        isAddingSlipOnly.value = false
        paymentAmount.value = invoice.value?.total_amount || 0
        paymentDate.value = new Date().toISOString().split('T')[0]
      }
      showPaymentModal.value = true
    }
    
    const closePaymentModal = () => {
      showPaymentModal.value = false
      paymentSlip.value = null
      paymentNote.value = ''
      // Reset flag
      isAddingSlipOnly.value = false
    }
    
    const openFileBrowser = () => {
      // ปิด Payment Modal ก่อนเปิด File Browser เพื่อไม่ให้ซ้อนกัน
      showPaymentModal.value = false
      FileBrowserOpen.value = true
    }
    
    const changeFileTrigger = (payload) => {
      FileBrowserOpen.value = payload
      // เปิด Payment Modal กลับมาเมื่อปิด File Browser
      if (!payload) {
        showPaymentModal.value = true
      }
    }
    
    const selectFileTrigger = (payload) => {
      if (payload !== undefined) {
        paymentSlip.value = payload.file
        FileBrowserOpen.value = false
        // เปิด Payment Modal กลับมาหลังเลือกไฟล์
        showPaymentModal.value = true
      }
    }
    
    const clearPaymentSlip = () => {
      paymentSlip.value = null
    }
    
    const isImageFile = (url) => {
      if (!url) return false
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
      return imageExtensions.some(ext => url.toLowerCase().endsWith(ext))
    }
    
    // Slip Viewer Functions
    const openSlipViewer = () => {
      if (!invoice.value?.payment_slip) return
      
      currentSlipUrl.value = invoice.value.payment_slip
      
      // Detect file type
      if (invoice.value.payment_slip.toLowerCase().endsWith('.pdf')) {
        currentSlipType.value = 'pdf'
      } else if (isImageFile(invoice.value.payment_slip)) {
        currentSlipType.value = 'image'
      } else {
        currentSlipType.value = 'unknown'
      }
      
      showSlipViewer.value = true
    }
    
    const closeSlipViewer = () => {
      showSlipViewer.value = false
      currentSlipUrl.value = ''
      currentSlipType.value = ''
    }
    
    const confirmPayment = async () => {
      if (!paymentSlip.value) {
        alert('กรุณาแนบสลิปการชำระเงิน')
        return
      }
      
      recordingPayment.value = true
      
      try {
        console.log('🔄 [Invoice Detail] Recording payment for invoice:', route.params.id)
        
        let paymentData
        let result
        
        if (isAddingSlipOnly.value) {
          // กรณีแนบสลิปเท่านั้น (Invoice ชำระแล้ว)
          paymentData = {
            payment_slip: paymentSlip.value,
            payment_note: paymentNote.value || undefined
          }
          
          console.log('📎 [Invoice Detail] Adding payment slip only')
          
          // ใช้ PUT โดยตรงเพื่ออัพเดตแค่สลิป
          if (salesService && salesService.apiRequest) {
            result = await salesService.apiRequest.PUT(`sales_invoices/${route.params.id}`, {
              data: paymentData
            }, salesService.clientKey)
          } else {
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              newSalesService.initialize(window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.apiRequest.PUT(`sales_invoices/${route.params.id}`, {
              data: paymentData
            }, newSalesService.clientKey)
          }
        } else {
          // กรณีบันทึกการชำระเงินใหม่
          paymentData = {
            paid_amount: parseFloat(paymentAmount.value),
            payment_date: new Date(paymentDate.value).toISOString(),
            payment_method: paymentMethod.value,
            payment_slip: paymentSlip.value,
            payment_note: paymentNote.value || undefined
          }
          
          if (salesService && salesService.recordPayment) {
            result = await salesService.recordPayment(route.params.id, paymentData)
          } else {
            const { salesService: newSalesService } = await import('@/services/SalesService.js')
            if (!newSalesService.isReady()) {
              newSalesService.initialize(window.vueApp?.config?.globalProperties)
            }
            result = await newSalesService.recordPayment(route.params.id, paymentData)
          }
        }
        
        console.log('✅ [Invoice Detail] Payment recorded:', result)
        
        alert(isAddingSlipOnly.value ? 'แนบสลิปการชำระเงินสำเร็จ' : 'บันทึกการชำระเงินสำเร็จ')
        
        // Close modal and reload invoice data
        closePaymentModal()
        await loadInvoice()
        
      } catch (err) {
        console.error('❌ [Invoice Detail] Error recording payment:', err)
        alert(`เกิดข้อผิดพลาด: ${err.message}`)
      } finally {
        recordingPayment.value = false
      }
    }
    
    const handleRecordPayment = async () => {
      if (!confirm(`ยืนยันการชำระเงิน ${formatCurrency(invoice.value.total_amount)}?`)) {
        return
      }
      
      recordingPayment.value = true
      
      try {
        console.log('🔄 [Invoice Detail] Recording payment for invoice:', route.params.id)
        
        let result
        if (salesService && salesService.recordPayment) {
          result = await salesService.recordPayment(route.params.id, {
            paid_amount: invoice.value.total_amount,
            payment_date: new Date().toISOString(),
            payment_method: 'bank_transfer' // สามารถเพิ่ม dialog เลือกวิธีชำระได้
          })
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.recordPayment(route.params.id, {
            paid_amount: invoice.value.total_amount,
            payment_date: new Date().toISOString(),
            payment_method: 'bank_transfer'
          })
        }
        
        console.log('✅ [Invoice Detail] Payment recorded:', result)
        
        alert('บันทึกการชำระเงินสำเร็จ')
        
        // Reload invoice data
        await loadInvoice()
        
      } catch (err) {
        console.error('❌ [Invoice Detail] Error recording payment:', err)
        alert(`เกิดข้อผิดพลาด: ${err.message}`)
      } finally {
        recordingPayment.value = false
      }
    }
    
    const handleCreateSalesOrder = async () => {
      if (!confirm('ต้องการสร้าง Sales Order จาก Invoice นี้หรือไม่?')) {
        return
      }
      
      creatingSalesOrder.value = true
      
      try {
        console.log('🔄 [Invoice Detail] Creating sales order from invoice:', route.params.id)
        
        let result
        if (salesService && salesService.createSalesOrderFromInvoice) {
          result = await salesService.createSalesOrderFromInvoice(route.params.id)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.createSalesOrderFromInvoice(route.params.id)
        }
        
        console.log('✅ [Invoice Detail] Sales order created:', result)
        
        alert(`สร้าง Sales Order สำเร็จ: ${result.order_number}`)
        
        // Navigate to sales order detail
        router.push(`/sales/sales-order/${result._id}`)
        
      } catch (err) {
        console.error('❌ [Invoice Detail] Error creating sales order:', err)
        alert(`เกิดข้อผิดพลาด: ${err.message}`)
      } finally {
        creatingSalesOrder.value = false
      }
    }
    
    const handleViewSalesOrder = () => {
      if (invoice.value.sales_order_id) {
        router.push(`/sales/sales-order/${invoice.value.sales_order_id}`)
      }
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return dateString
      }
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        'pending_payment': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'overdue': 'bg-red-100 text-red-800',
        'cancelled': 'bg-gray-100 text-gray-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusText = (status) => {
      const statusTexts = {
        'pending_payment': 'รอชำระเงิน',
        'paid': 'ชำระเงินแล้ว',
        'overdue': 'เกินกำหนด',
        'cancelled': 'ยกเลิก'
      }
      return statusTexts[status] || status
    }
    
    const getPaymentStatusClass = (paymentStatus) => {
      const statusClasses = {
        'pending': 'bg-orange-100 text-orange-800',
        'partial': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'overdue': 'bg-red-100 text-red-800'
      }
      return statusClasses[paymentStatus] || 'bg-gray-100 text-gray-800'
    }
    
    const getPaymentStatusText = (paymentStatus) => {
      const statusTexts = {
        'pending': 'ยังไม่ชำระ',
        'partial': 'ชำระบางส่วน',
        'paid': 'ชำระครบ',
        'overdue': 'เกินกำหนด'
      }
      return statusTexts[paymentStatus] || paymentStatus
    }
    
    const getPaymentMethodText = (method) => {
      const methodTexts = {
        'bank_transfer': 'โอนเงินผ่านธนาคาร',
        'cash': 'เงินสด',
        'credit_card': 'บัตรเครดิต',
        'cheque': 'เช็ค'
      }
      return methodTexts[method] || method
    }
    
    const handlePrint = () => {
      router.push(`/sales/invoice/${route.params.id}/print`)
    }
    
    // Helper function for navigation
    const viewDocument = (type, id) => {
      if (!id) return
      const routes = {
        'quotation': `/sales/quotation/${id}`,
        'sales_order': `/sales/sales-order/${id}`
      }
      if (routes[type]) {
        router.push(routes[type])
      }
    }
    
    onMounted(async () => {
      await loadInvoice()
      await loadLinkedDocuments()
    })
    
    return {
      invoice,
      loading,
      error,
      recordingPayment,
      creatingSalesOrder,
      canRecordPayment,
      canCreateSalesOrder,
      salesService,
      breadcrumbNav,
      showPaymentModal,
      FileBrowserOpen,
      paymentSlip,
      paymentAmount,
      paymentMethod,
      paymentDate,
      paymentNote,
      isAddingSlipOnly,
      showSlipViewer,
      currentSlipUrl,
      currentSlipType,
      linkedQuotation,
      linkedSalesOrder,
      stockReservations,
      loadingReservations,
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      getPaymentStatusClass,
      getPaymentStatusText,
      getPaymentMethodText,
      openPaymentModal,
      closePaymentModal,
      openFileBrowser,
      changeFileTrigger,
      selectFileTrigger,
      clearPaymentSlip,
      isImageFile,
      confirmPayment,
      openSlipViewer,
      closeSlipViewer,
      handleRecordPayment,
      handleCreateSalesOrder,
      handleViewSalesOrder,
      handlePrint,
      viewDocument
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
