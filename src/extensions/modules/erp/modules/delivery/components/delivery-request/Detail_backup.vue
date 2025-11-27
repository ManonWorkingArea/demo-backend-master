<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div v-if="delivery">
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-shipping-fast text-orange-500"></i>
              รายละเอียดใบจัดส่ง
            </h1>
            <div class="mt-2 flex items-center gap-3 text-gray-600">
              <span class="font-semibold text-gray-900">{{ delivery.delivery_number }}</span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-700">{{ delivery.customer_name }}</span>
              <span class="text-gray-400">•</span>
              <span class="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                <i class="fas fa-route"></i>
                Production → Delivery
              </span>
            </div>
          </div>
          <div class="flex space-x-3 flex-wrap">
            <button 
              v-if="delivery && delivery.shipping_label_number"
              @click="printShippingLabel"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์ใบปะหน้า
            </button>
            <button 
              @click="generateReceipt" 
              :disabled="generatingReceipt"
              class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-spinner fa-spin mr-2" v-if="generatingReceipt"></i>
              <i class="fas fa-receipt mr-2" v-else></i>
              {{ generatingReceipt ? 'กำลังสร้าง...' : 'สร้างใบเสร็จ' }}
            </button>
            <button 
              @click="generateTaxInvoice" 
              :disabled="generatingTaxInvoice"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-spinner fa-spin mr-2" v-if="generatingTaxInvoice"></i>
              <i class="fas fa-file-invoice-dollar mr-2" v-else></i>
              {{ generatingTaxInvoice ? 'กำลังสร้าง...' : 'สร้างใบกำกับภาษี' }}
            </button>
            <button 
              @click="printDelivery"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์ใบจัดส่ง
            </button>
            <button 
              @click="refreshData"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
          </div>
        </div>
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

    <!-- Delivery Content -->
    <div v-else-if="delivery" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
      
          <!-- Status Section -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span 
                    :class="getStatusBadgeClass(delivery.status)"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    <i class="fas" :class="getStatusIcon(delivery.status)"></i>
                    {{ getStatusText(delivery.status) }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">{{ getStatusDescription(delivery.status) }}</p>
                <div v-if="delivery.work_order_number" class="flex items-center gap-2 text-sm text-gray-500">
                  <i class="fas fa-link"></i>
                  <span>มาจาก Work Order:</span>
                  <button @click="viewWorkOrder" class="text-blue-600 hover:text-blue-700 font-medium">
                    {{ delivery.work_order_number }}
                  </button>
                  <div class="flex items-center gap-1 ml-2 text-green-600">
                    <i class="fas fa-check-circle text-xs"></i>
                    <span>เตรียมพร้อมจากฝ่าย Production</span>
                  </div>
                </div>
              </div>
              <div v-if="availableActions.length > 0" class="flex gap-2">
                <button 
                  v-for="action in availableActions" 
                  :key="action.key"
                  @click="changeStatus(action.status)"
                  :disabled="processingStatus"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2',
                    getActionButtonClass(action.class)
                  ]"
                >
                  <i class="fas" :class="action.icon"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Delivery Information -->
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-truck text-blue-600"></i>
                  ข้อมูลการจัดส่ง
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">เลขที่ใบจัดส่ง:</label>
                  <span class="text-sm text-gray-900 font-medium">{{ delivery.delivery_number }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">Work Order:</label>
                  <span class="text-sm text-gray-900">
                    <button v-if="delivery.work_order_number" 
                       @click="viewWorkOrder" 
                       class="text-blue-600 hover:text-blue-700 font-medium">
                      {{ delivery.work_order_number }}
                    </button>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">Sales Order:</label>
                  <span class="text-sm text-gray-900">
                    <button v-if="delivery.sales_order_number" 
                       @click="viewSalesOrder" 
                       class="text-blue-600 hover:text-blue-700 font-medium">
                      {{ delivery.sales_order_number }}
                    </button>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">วันที่สร้าง:</label>
                  <span class="text-sm text-gray-900">{{ formatDate(delivery.created_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">วันที่นัดส่ง:</label>
                  <span class="text-sm text-gray-900">{{ formatDate(delivery.scheduled_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">ประเภทการจัดส่ง:</label>
                  <span class="text-sm text-gray-900">{{ getDeliveryTypeText(delivery.delivery_type) }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">วิธีจัดส่ง:</label>
                  <span class="text-sm text-gray-900">{{ getShippingMethodText(delivery.shipping_method) }}</span>
                </div>
                <div v-if="delivery.work_order_completed_date" class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">วันที่ Production เสร็จ:</label>
                  <span class="text-sm text-gray-900">{{ formatDate(delivery.work_order_completed_date) }}</span>
                </div>
                <div v-if="delivery.items_status" class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">สถานะสินค้า:</label>
                  <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <i class="fas fa-check-circle"></i>
                    เบิกครบทุกรายการ
                  </span>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-user text-green-600"></i>
                  ข้อมูลลูกค้า
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">ชื่อลูกค้า:</label>
                  <span class="text-sm text-gray-900 font-medium">{{ delivery.customer_name || 'ไม่ระบุ' }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">เบอร์โทร:</label>
                  <span class="text-sm text-gray-900">{{ delivery.customer_phone || 'ไม่ระบุ' }}</span>
                </div>
                <div v-if="delivery.customer_email" class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">อีเมล:</label>
                  <span class="text-sm text-gray-900">{{ delivery.customer_email }}</span>
                </div>
                <div v-if="delivery.shipping_address" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">ที่อยู่จัดส่ง:</label>
                  <div class="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border leading-relaxed">
                    <div v-if="delivery.shipping_address.company" class="font-medium">{{ delivery.shipping_address.company }}</div>
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

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Financial Summary -->
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-calculator text-purple-600"></i>
                  สรุปการเงิน
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">มูลค่าสินค้า:</label>
                  <span class="text-sm font-semibold text-green-600">฿{{ formatNumber(delivery.total_amount || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">ค่าจัดส่ง:</label>
                  <span class="text-sm font-semibold text-green-600">
                    ฿{{ formatNumber(delivery.shipping_cost || 0) }}
                    <small v-if="delivery.shipping_cost !== calculateShippingCost()" class="text-green-500 ml-2 text-xs">
                  (คำนวณใหม่: ฿{{ formatNumber(calculateShippingCost()) }})
                      (ประหยัด ฿{{ formatNumber(calculateShippingCost() - (delivery.shipping_cost || 0)) }})
                    </small>
                  </span>
                </div>
                <div class="flex justify-between">
                  <label class="text-sm font-medium text-gray-700">ค่าใช้จ่ายรวม:</label>
                  <span class="text-sm font-semibold text-green-600">฿{{ formatNumber(getTotalCost()) }}</span>
                </div>
                <div class="flex justify-between border-t border-gray-200 pt-4 mt-4">
                  <label class="text-sm font-semibold text-gray-900">รวมทั้งสิ้น:</label>
                  <span class="text-lg font-bold text-green-600">฿{{ formatNumber(getGrandTotal()) }}</span>
                </div>
              </div>
            </div>

            <!-- Action History & Status Updates -->
            <div class="bg-white rounded-lg shadow-sm">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-history text-blue-600"></i>
                  การดำเนินการ
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <button 
                  v-if="!hasShippingLabel"
                  @click="generateShippingLabel"
                  :disabled="generatingShippingLabel"
                  class="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <i class="fas fa-spinner fa-spin" v-if="generatingShippingLabel"></i>
                  <i class="fas fa-shipping-fast" v-else></i>
                  {{ generatingShippingLabel ? 'กำลังสร้าง...' : 'สร้างใบปะหน้า' }}
                </button>
                <button 
                  v-if="hasShippingLabel"
                  @click="viewShippingLabel"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <i class="fas fa-eye"></i>
                  ดูใบปะหน้า
                </button>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    @click="viewReceipt"
                    :disabled="!hasReceipt"
                    class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <i class="fas fa-receipt"></i>
                    ใบเสร็จ
                  </button>
                  <button 
                    @click="viewTaxInvoice"
                    :disabled="!hasTaxInvoice"
                    class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <i class="fas fa-file-invoice"></i>
                    ใบกำกับภาษี
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <!-- Shipping & Tracking Information -->
        <div class="info-card" v-if="delivery.selected_carrier || delivery.tracking_number || delivery.carrier || delivery.shipping_label_number">
          <div class="card-header">
            <h3>
              <i class="fas fa-shipping-fast"></i>
              ข้อมูลการจัดส่ง & ติดตาม
            </h3>
          </div>
          <div class="card-content">
            <div class="info-row" v-if="delivery.selected_carrier">
              <label>บริษัทขนส่งที่เลือก:</label>
              <span class="value carrier-badge">
                <i class="fas fa-truck"></i>
                {{ delivery.selected_carrier }}
              </span>
            </div>
            <div class="info-row" v-if="delivery.shipping_label_number">
              <label>หมายเลขใบปะหน้า:</label>
              <span class="value shipping-label">
                {{ delivery.shipping_label_number }}
                <i class="fas fa-check-circle" style="color: #28a745; margin-left: 8px;" title="พิมพ์แล้ว"></i>
              </span>
            </div>
            <div class="info-row" v-if="delivery.ready_to_ship_date">
              <label>วันที่เตรียมจัดส่ง:</label>
              <span class="value">{{ formatDate(delivery.ready_to_ship_date) }}</span>
            </div>
            <div class="info-row" v-if="delivery.tracking_number">
              <label>Tracking Number:</label>
              <span class="value tracking">{{ delivery.tracking_number }}</span>
            </div>
            <div class="info-row" v-if="delivery.carrier && delivery.carrier !== delivery.selected_carrier">
              <label>บริษัทขนส่ง:</label>
              <span class="value">{{ delivery.carrier }}</span>
            </div>
            <div class="info-row" v-if="delivery.estimated_delivery_date">
              <label>วันที่คาดว่าจะถึง:</label>
              <span class="value">
                {{ formatDate(delivery.estimated_delivery_date) }}
                <div style="font-size: 0.8rem; color: #6c757d; margin-top: 4px;">
                  Utils คำนวณ: {{ calculateEstimatedDeliveryTime()?.estimatedDays || 0 }} วัน
                  ({{ calculateEstimatedDeliveryTime()?.estimatedDate || '-' }})
                </div>
              </span>
            </div>
            <div class="info-row" v-if="delivery.actual_delivery_date">
              <label>วันที่ส่งจริง:</label>
              <span class="value">{{ formatDate(delivery.actual_delivery_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Production Summary Section -->
      <div v-if="delivery.work_order_id" class="production-summary-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-industry"></i>
            สรุปจากฝ่าย Production
          </h3>
          <div class="section-meta">
            Work Order: {{ delivery.work_order_number }}
          </div>
        </div>
        
        <div class="production-info-grid">
          <div class="production-card">
            <div class="production-icon">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="production-content">
              <h4>Work Order เสร็จสิ้น</h4>
              <p>ฝ่าย Production ได้เบิกสินค้าและเตรียมครบถ้วนแล้ว</p>
              <div class="production-status">
                <i class="fas fa-check-circle"></i>
                สถานะ: ready-to-ship
              </div>
            </div>
          </div>
          
          <div class="production-card">
            <div class="production-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="production-content">
              <h4>สินค้าพร้อมจัดส่ง</h4>
              <p>สต็อคถูกตัดแล้ว สินค้าพร้อมสำหรับจัดส่ง</p>
              <div class="production-status">
                <i class="fas fa-check-circle"></i>
                {{ getItemsCount() }} รายการ เตรียมครบ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="items-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-box"></i>
            รายการสินค้า
          </h3>
          <div class="section-meta">
            {{ getItemsCount() }} รายการ
          </div>
        </div>
        
        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวนสั่ง</th>
                <th>จำนวนเบิก</th>
                <th>จำนวนส่ง</th>
                <th>หน่วย</th>
                <th>ราคา/หน่วย</th>
                <th>รวม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in getDeliveryItems()" :key="item.id || item.product_id">
                <td>
                  <div class="product-info">
                    <strong>{{ item.product_name || 'ไม่ระบุ' }}</strong>
                    <div v-if="item.product_code" class="product-code">
                      รหัส: {{ item.product_code }}
                    </div>
                  </div>
                </td>
                <td class="quantity">{{ item.quantity || 0 }}</td>
                <td class="picked-quantity">
                  <span class="picked-badge">{{ item.picked_quantity || item.delivery_quantity || 0 }}</span>
                </td>
                <td class="delivery-quantity">{{ item.delivery_quantity || 0 }}</td>
                <td class="unit">{{ item.unit || 'ชิ้น' }}</td>
                <td class="price">฿{{ formatNumber(item.unit_price || 0) }}</td>
                <td class="total">฿{{ formatNumber((item.delivery_quantity || 0) * (item.unit_price || 0)) }}</td>
                <td>
                  <span class="item-status-badge" :class="'item-status-' + (item.status || 'pending')">
                    {{ getItemStatusText(item.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="6"><strong>รวมทั้งหมด:</strong></td>
                <td class="total"><strong>฿{{ formatNumber(delivery.total_amount || 0) }}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Activities Section -->
      <div v-if="delivery.activities && delivery.activities.length > 0" class="activities-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-history"></i>
            กิจกรรม
          </h3>
        </div>
        
        <div class="activities-timeline">
          <div v-for="activity in delivery.activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="'activity-' + activity.type">
              <i class="fas" :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user }}</span>
                <span class="activity-time">{{ formatDateTime(activity.timestamp) }}</span>
              </div>
              <div v-if="activity.notes" class="activity-notes">{{ activity.notes }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Section -->
      <div class="documents-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-file-alt"></i>
            เอกสารที่เกี่ยวข้อง
          </h3>
        </div>
        
        <div class="documents-grid">
          <div class="document-card" v-if="hasReceipt">
            <div class="document-icon receipt">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="document-info">
              <h4>ใบเสร็จรับเงิน</h4>
              <p>เลขที่: {{ receiptNumber }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewReceipt">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printReceipt">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card" v-if="hasTaxInvoice">
            <div class="document-icon tax-invoice">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="document-info">
              <h4>ใบกำกับภาษี</h4>
              <p>เลขที่: {{ taxInvoiceNumber }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewTaxInvoice">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printTaxInvoice">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card" v-if="hasShippingLabel">
            <div class="document-icon shipping-label">
              <i class="fas fa-shipping-fast"></i>
            </div>
            <div class="document-info">
              <h4>ใบปะหน้า</h4>
              <p>เลขที่: {{ delivery.shipping_label_number }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewShippingLabel">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printShippingLabel">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasReceipt">
            <div class="document-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="document-info">
              <h4>ใบเสร็จรับเงิน</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-success" @click="generateReceipt" :disabled="generatingReceipt">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasTaxInvoice">
            <div class="document-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="document-info">
              <h4>ใบกำกับภาษี</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-info" @click="generateTaxInvoice" :disabled="generatingTaxInvoice">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasShippingLabel">
            <div class="document-icon">
              <i class="fas fa-shipping-fast"></i>
            </div>
            <div class="document-info">
              <h4>ใบปะหน้า</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-warning" @click="generateShippingLabel" :disabled="generatingShippingLabel">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div v-if="delivery.notes || delivery.internal_notes" class="notes-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-sticky-note"></i>
            หมายเหตุ
          </h3>
        </div>
        
        <div class="notes-content">
          <div v-if="delivery.notes" class="note-item">
            <label>หมายเหตุทั่วไป:</label>
            <p>{{ delivery.notes }}</p>
          </div>
          <div v-if="delivery.internal_notes" class="note-item">
            <label>หมายเหตุภายใน:</label>
            <p>{{ delivery.internal_notes }}</p>
          </div>
        </div>
      </div>

      </div>

        </div>
        <!-- End Main Content -->
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
import { ref, computed, onMounted } from 'vue'
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



    // Lifecycle
    onMounted(() => {
      loadDelivery()
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
      
      // New utility methods for Tailwind styling
      getStatusBadgeClass: (status) => {
        const statusClasses = {
          'scheduled': 'bg-gray-100 text-gray-800',
          'picking': 'bg-green-100 text-green-800',
          'packed': 'bg-yellow-100 text-yellow-800',
          'ready_to_ship': 'bg-blue-100 text-blue-800',
          'shipped': 'bg-blue-100 text-blue-800',
          'delivered': 'bg-green-100 text-green-800',
          'completed': 'bg-purple-100 text-purple-800'
        }
        return statusClasses[status] || 'bg-gray-100 text-gray-800'
      },
      getActionButtonClass: (actionClass) => {
        const buttonClasses = {
          'btn-primary': 'bg-blue-600 hover:bg-blue-700 text-white',
          'btn-success': 'bg-green-600 hover:bg-green-700 text-white',
          'btn-warning': 'bg-yellow-600 hover:bg-yellow-700 text-white',
          'btn-info': 'bg-blue-600 hover:bg-blue-700 text-white',
          'btn-secondary': 'bg-gray-600 hover:bg-gray-700 text-white'
        }
        return buttonClasses[actionClass] || 'bg-gray-600 hover:bg-gray-700 text-white'
      }
    }
  }
}
</script>

<style scoped>
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

/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Legacy support for items that haven't been converted yet */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #6c757d;
  min-width: 120px;
  font-size: 0.9rem;
}

.info-row .value {
  color: #2c3e50;
  text-align: right;
  flex: 1;
}

.status-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-content {
  padding: 20px;
}

/* Modal styles for legacy modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.large-modal {
  max-width: 90vw;
  max-height: 95vh;
  width: 90vw;
}
</style>