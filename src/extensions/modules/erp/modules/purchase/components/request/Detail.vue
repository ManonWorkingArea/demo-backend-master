<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.go(-1)" 
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">รายละเอียดใบขอซื้อ</h1>
              <p class="mt-2 text-gray-600">PR #{{ requestId }}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <!-- Submit Button - แสดงเมื่อสถานะเป็น draft -->
            <button 
              v-if="requestData && requestData.status === 'draft'"
              @click="showSubmitModal = true" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              ส่งใบขอซื้อ
            </button>
            
            <!-- Approve Button - แสดงเมื่อสถานะเป็น pending -->
            <button 
              v-if="requestData && (requestData.status === 'pending' || requestData.workflow_state === 'pending_approval')"
              @click="showApprovalModal = true" 
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-check mr-2"></i>
              อนุมัติ
            </button>
            
            <!-- Goods Receipt Button - แสดงเมื่อสถานะเป็น approved -->
            <button 
              v-if="requestData && requestData.status === 'approved'"
              @click="goToGoodsReceipt" 
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-truck-loading mr-2"></i>
              รับเข้าสินค้า
            </button>
            
            <button 
              @click="editRequest" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไข
            </button>
            <button 
              @click="printRequest" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              พิมพ์
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div v-else-if="requestData" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Request Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลใบขอซื้อ</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขที่ใบขอซื้อ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ requestData.requestNumber }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span :class="['inline-flex px-3 py-1 text-sm font-semibold rounded-full', getStatusClass(requestData.status)]">
                      {{ getStatusText(requestData.status) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ขอ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ requestData.requesterName }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">แผนก</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ requestData.department }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สร้าง</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(requestData.createdDate) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ต้องการ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatDate(requestData.requiredDate) }}</p>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ requestData.type }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
                <span class="text-sm text-gray-500">{{ requestData.items.length }} รายการ</span>
              </div>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายการ</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา/หน่วย</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in requestData.items" :key="index" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ item.product_name || item.name }}</div>
                        <div v-if="item.sku" class="text-sm text-gray-500">SKU: {{ item.sku }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.unit }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{{ formatNumber(item.quantity) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{{ formatCurrency(item.unit_price || item.unitPrice) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{{ formatCurrency(item.total || item.amount) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="5" class="px-6 py-4 text-right text-sm font-semibold text-gray-900">รวมทั้งสิ้น:</td>
                      <td class="px-6 py-4 text-right text-lg font-bold text-blue-600">{{ formatCurrency(requestData.totalAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div v-if="requestData.comments" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">หมายเหตุ</h3>
            </div>
            <div class="p-6">
              <div class="p-4 bg-gray-50 rounded-lg border">
                <p class="text-gray-900 leading-relaxed">{{ requestData.comments }}</p>
              </div>
            </div>
          </div>

          <!-- Approval History -->
          <div v-if="requestData.approvalHistory?.length" class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">ประวัติการอนุมัติ</h3>
                <span class="text-sm text-gray-500">{{ requestData.approvalHistory.length }} รายการ</span>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div 
                  v-for="approval in requestData.approvalHistory" 
                  :key="approval.id"
                  class="border-l-4 pl-4 py-3"
                  :class="getApprovalBorderClass(approval.status)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <i :class="getApprovalIcon(approval.status)"></i>
                      <span class="font-medium text-gray-900">{{ approval.approverName }}</span>
                    </div>
                    <span class="text-sm text-gray-500">{{ formatDate(approval.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-600 mb-1">{{ approval.action }}</p>
                  <p v-if="approval.comments" class="text-sm text-gray-500 italic">{{ approval.comments }}</p>
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
              <h3 class="text-lg font-semibold text-gray-900">สถานะและการกระทำ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="text-center">
                <span :class="['inline-flex px-4 py-2 text-sm font-semibold rounded-full', getStatusClass(requestData.status)]">
                  {{ getStatusText(requestData.status).toUpperCase() }}
                </span>
              </div>
              <div class="space-y-2">
                <!-- Submit Button - แสดงเมื่อสถานะเป็น draft -->
                <button 
                  v-if="requestData && requestData.status === 'draft'"
                  @click="showSubmitModal = true"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-paper-plane mr-2"></i>
                  ส่งใบขอซื้อ
                </button>
                
                <!-- Approve Button - แสดงเมื่อสถานะเป็น pending -->
                <button 
                  v-if="requestData && (requestData.status === 'pending' || requestData.workflow_state === 'pending_approval')"
                  @click="showApprovalModal = true"
                  class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-check mr-2"></i>
                  อนุมัติใบขอซื้อ
                </button>
                
                <!-- Goods Receipt Button - แสดงเมื่อสถานะเป็น approved -->
                <button 
                  v-if="requestData && requestData.status === 'approved'"
                  @click="goToGoodsReceipt"
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-truck-loading mr-2"></i>
                  รับเข้าสินค้า
                </button>
                
                <button 
                  @click="editRequest"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-edit mr-2"></i>
                  แก้ไข
                </button>
                <!-- Document Preview Button -->
                <div class="relative">
                  <button 
                    @click.stop="toggleDocumentMenu"
                    class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                  >
                    <i class="fas fa-file-alt mr-2"></i>
                    ตัวอย่างเอกสาร
                    <i class="fas fa-chevron-down ml-2"></i>
                  </button>
                  
                  <!-- Document Menu Dropdown -->
                  <div 
                    v-if="showDocumentMenu"
                    class="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    @click.stop
                  >
                    <div class="py-2">
                      <button
                        @click="previewDocument('purchase_request')"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center"
                      >
                        <i class="fas fa-shopping-cart mr-2 text-green-500"></i>
                        ใบขอซื้อ
                      </button>
                      <button
                        @click="previewDocument('quotation')"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center"
                      >
                        <i class="fas fa-file-invoice mr-2 text-blue-500"></i>
                        ใบเสนอราคา
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
                  @click="printRequest"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-print mr-2"></i>
                  พิมพ์เอกสาร
                </button>
                <button 
                  @click="duplicateRequest"
                  class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-copy mr-2"></i>
                  ทำสำเนา
                </button>
              </div>
            </div>
          </div>

          <!-- Summary Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สรุปข้อมูล</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">จำนวนรายการ</span>
                <span class="font-semibold text-gray-900">{{ requestData.items.length }} รายการ</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">มูลค่ารวม</span>
                <span class="font-semibold text-blue-600">{{ formatCurrency(requestData.totalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">สถานะ</span>
                <span :class="['font-semibold', getStatusTextClass(requestData.status)]">{{ getStatusText(requestData.status) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">ผู้สร้าง</span>
                <span class="font-semibold text-gray-900">{{ requestData.requesterName }}</span>
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
                <p class="text-sm text-gray-600">{{ formatDateTime(requestData.createdDate) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ต้องการ</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(requestData.requiredDate) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                <p class="text-sm text-gray-600">{{ requestData.department }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทการซื้อ</label>
                <p class="text-sm text-gray-600">{{ requestData.type }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">การกระทำด่วน</h3>
            <div class="space-y-3">
              <button 
                @click="downloadPDF"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-download mr-2"></i>
                ดาวน์โหลด PDF
              </button>
              <button 
                @click="sendEmail"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-envelope mr-2"></i>
                ส่งอีเมล
              </button>
              <button 
                @click="exportExcel"
                class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-file-excel mr-2"></i>
                ส่งออก Excel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Approval Modal -->
      <div v-if="showApprovalModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <i class="fas fa-check text-green-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">ยืนยันการอนุมัติใบขอซื้อ</h3>
            <p class="text-sm text-gray-600 mb-6">
              คุณต้องการอนุมัติใบขอซื้อ #{{ requestData?.requestNumber }} หรือไม่?
            </p>
            
            <!-- Approval Comments -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2 text-left">หมายเหตุการอนุมัติ</label>
              <textarea 
                v-model="approvalForm.comments"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              ></textarea>
            </div>
            
            <div class="flex space-x-3">
              <button 
                @click="showApprovalModal = false"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                @click="approveRequest"
                :disabled="processingApproval"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i v-if="processingApproval" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-check mr-2"></i>
                {{ processingApproval ? 'กำลังประมวลผล...' : 'ยืนยันอนุมัติ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Submit Modal -->
      <div v-if="showSubmitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <i class="fas fa-paper-plane text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">ยืนยันการส่งใบขอซื้อ</h3>
            <p class="text-sm text-gray-600 mb-6">
              คุณต้องการส่งใบขอซื้อ #{{ requestData?.requestNumber }} เพื่อขออนุมัติหรือไม่?
            </p>
            
            <!-- Submit Comments -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2 text-left">หมายเหตุเพิ่มเติม</label>
              <textarea 
                v-model="submitForm.comments"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              ></textarea>
            </div>
            
            <div class="flex space-x-3">
              <button 
                @click="showSubmitModal = false"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                @click="submitRequest"
                :disabled="processingSubmit"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <i v-if="processingSubmit" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-paper-plane mr-2"></i>
                {{ processingSubmit ? 'กำลังส่ง...' : 'ยืนยันส่ง' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * ✅ CORE-ONLY ACCESS HELPER
 * เข้าถึง ERP_CORE ผ่าน global window object เท่านั้น
 */
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[Detail] ERP_CORE not available - must use Core-Only Access pattern')
}

const router = useRouter()
const route = useRoute()

const requestId = ref(route.params.id)
const requestData = ref(null)
const loading = ref(true)

// Approval system
const showApprovalModal = ref(false)
const processingApproval = ref(false)
const approvalForm = ref({
  comments: '',
  approved_by: 'current_user'
})

// Submit system
const showSubmitModal = ref(false)
const processingSubmit = ref(false)
const submitForm = ref({
  comments: '',
  submitted_by: 'current_user'
})

// Document Preview States
const showDocumentMenu = ref(false)

const loadData = async () => {
  try {
    console.log('🔄 Loading purchase request data for ID:', requestId.value)
    
    // ✅ Initialize PurchaseService ถ้าจำเป็น
    const core = getCore()
    const purchaseService = window.ERP_CORE.purchase
    if (purchaseService && typeof purchaseService.initialize === 'function') {
      await purchaseService.initialize(core)
      console.log('[Detail] ✅ PurchaseService initialized')
    }
    
    // ✅ ใช้ PurchaseService แทน core.engine.read
    const result = await window.ERP_CORE.purchase.getPurchaseRequest(requestId.value)
    console.log('📋 API Response:', result)
    
    if (result) {
      console.log('✅ Data loaded successfully:', result)
      
      // ✅ Handle both wrapped and direct API response formats
      const apiData = result.data || result
      
      requestData.value = {
        ...apiData,
        // Map ข้อมูลให้ตรงกับ template
        requestNumber: apiData.purchase_request_code || apiData._id,
        createdDate: apiData.createdAt || apiData.created_at,
        requesterName: apiData.requested_by || 'ไม่ระบุ',
        department: apiData.department || 'ไม่ระบุ',
        requiredDate: apiData.expected_delivery_date,
        type: getPurchaseTypeText(apiData.purchase_type) || 'ทั่วไป',
        items: apiData.items || [],
        totalAmount: apiData.total_amount || 0,
        comments: apiData.notes,
        status: apiData.status || apiData.workflow_state || apiData.state || 'draft',
        approvalHistory: apiData.approval_history || []
      }
      console.log('✅ Mapped data:', requestData.value)
    } else {
      console.warn('⚠️ No data returned from API:', result)
      const core = getCore()
      core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ หรือคุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้', 'Purchase Request')
      requestData.value = null
    }
  } catch (error) {
    console.error('❌ Load purchase request error:', error)
    const core = getCore()
    core.showNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'Purchase Request')
    requestData.value = null
  } finally {
    loading.value = false
  }
}

const editRequest = () => {
  // ไปหน้าแก้ไขใบขอซื้อ
  router.push(`/purchase/purchase-request/${requestId.value}/edit`)
}

const printRequest = () => {
  // พิมพ์ใบขอซื้อ - implement later
  const core = getCore()
  core.showNotification('info', 'ฟีเจอร์พิมพ์จะพัฒนาในเวอร์ชันถัดไป', 'Print')
}

const duplicateRequest = () => {
  if (confirm('คุณต้องการทำสำเนาใบขอซื้อนี้หรือไม่?')) {
    const core = getCore()
    core.showNotification('info', 'ฟีเจอร์ทำสำเนาจะพัฒนาในเวอร์ชันถัดไป', 'Duplicate')
  }
}

const downloadPDF = () => {
  const core = getCore()
  core.showNotification('info', 'ฟีเจอร์ดาวน์โหลด PDF จะพัฒนาในเวอร์ชันถัดไป', 'Download')
}

const sendEmail = () => {
  const core = getCore()
  core.showNotification('info', 'ฟีเจอร์ส่งอีเมลจะพัฒนาในเวอร์ชันถัดไป', 'Email')
}

const exportExcel = () => {
  const core = getCore()
  core.showNotification('info', 'ฟีเจอร์ส่งออก Excel จะพัฒนาในเวอร์ชันถัดไป', 'Export')
}

// Document Preview Functions
const toggleDocumentMenu = () => {
  showDocumentMenu.value = !showDocumentMenu.value
}

const previewDocument = async (documentType) => {
  showDocumentMenu.value = false
  
  if (!requestData.value) {
    const core = getCore()
    core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ', 'Document Preview')
    return
  }
  
  try {
    const core = getCore()
    console.log('🔍 Document type requested:', documentType)
    console.log('📦 Raw Purchase Request Data:', requestData.value)
    
    // ✅ แปลงข้อมูลจาก Database เป็น Standard Document Schema
    const { createStandardDocument } = await import('../../../../core/components/document/DocumentFactory.js')
    
    const standardDocument = createStandardDocument(
      documentType,           // 'purchase_request', 'quotation', 'invoice'
      requestData.value,      // ข้อมูลจาก Database
      { validate: true }      // ตรวจสอบความถูกต้อง
    )
    
    console.log('✅ Standard Document created:', standardDocument)
    console.log('📄 Document Number:', standardDocument.documentNumber)
    console.log('📊 Items Count:', standardDocument.items.length)
    console.log('📑 Pagination Info:', standardDocument.metadata?.pagination)
    console.log('💰 Financial Summary:', {
      subtotal: standardDocument.financial.subtotal,
      vat: standardDocument.financial.vatAmount,
      total: standardDocument.financial.grandTotal
    })
    console.log('📋 Items Details:', standardDocument.items)
    
    // ใช้ DocumentPreview จาก ERP_CORE โดยตรง (ไม่ต้อง import)
    const DocumentPreview = core.components.DocumentPreview
    
    if (!DocumentPreview) {
      console.warn('⚠️ DocumentPreview component not available in CORE')
      core.showNotification('error', 'DocumentPreview component ไม่พร้อมใช้งาน', 'Component Error')
      return
    }
    
    const { createApp, h } = await import('vue')
    
    // สร้าง Vue app พร้อม DocumentPreview component จาก CORE
    const app = createApp({
      data() {
        return {
          showPreview: true
        }
      },
      render() {
        return h(DocumentPreview, {
          show: this.showPreview,
          documentType: documentType,
          documentData: standardDocument,  // ✅ ส่งข้อมูลมาตรฐาน
          title: getDocumentTitle(documentType),
          onClose: () => {
            this.showPreview = false
            this.$nextTick(() => {
              app.unmount()
              document.body.removeChild(previewContainer)
              document.body.style.overflow = 'auto'
            })
          },
          onPrint: () => {
            console.log('🖨️ Printing document')
            core.showNotification('success', `ส่งคำสั่งพิมพ์ ${getDocumentTitle(documentType)} แล้ว!`, 'Print')
          },
          onDownload: () => {
            console.log('📥 Downloading document')
            core.showNotification('success', `ดาวน์โหลด ${getDocumentTitle(documentType)} แล้ว!`, 'Download')
          }
        })
      }
    })
    
    // สร้าง container สำหรับ mount DocumentPreview
    const previewContainer = document.createElement('div')
    previewContainer.id = 'document-preview-container'
    document.body.appendChild(previewContainer)
    document.body.style.overflow = 'hidden'
    
    // Mount DocumentPreview component
    app.mount(previewContainer)
    
  } catch (error) {
    const core = getCore()
    core.showNotification('error', 'เกิดข้อผิดพลาดในการแสดงเอกสาร: ' + error.message, 'Document Preview')
    console.error('Document preview error:', error)
  }
}

// Helper function สำหรับแสดง document title
const getDocumentTitle = (documentType) => {
  const titles = {
    'purchase_request': 'ใบขอซื้อ',
    'quotation': 'ใบเสนอราคา',
    'invoice': 'ใบแจ้งหนี้'
  }
  return titles[documentType] || documentType
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  showDocumentMenu.value = false
}

const submitRequest = async () => {
  if (!requestData.value) {
    const core = getCore()
    core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ', 'Submit')
    return
  }

  // ป้องกัน double click
  if (processingSubmit.value) {
    return
  }

  processingSubmit.value = true
  
  try {
    const core = getCore()
    
    // Store data before processing
    const submitComments = submitForm.value.comments || 'ส่งใบขอซื้อเพื่อขออนุมัติ'
    const submittedBy = submitForm.value.submitted_by
    
    // ปิด modal ทันที เพื่อป้องกัน DOM conflicts
    showSubmitModal.value = false
    submitForm.value.comments = ''
    
    // รอให้ DOM เสถียร
    await nextTick()
    await nextTick() // Double nextTick for safety
    
    // สร้างข้อมูลการส่งใบขอซื้อ
    const submitData = {
      status: 'pending',
      workflow_state: 'pending_approval',
      updated_date: new Date().toISOString(),
      updated_by: submittedBy,
      notes: submitComments ? 
        (requestData.value.notes ? requestData.value.notes + '\n\n[ส่งเพื่อขออนุมัติ] ' + submitComments : '[ส่งเพื่อขออนุมัติ] ' + submitComments) :
        (requestData.value.notes || '[ส่งเพื่อขออนุมัติ] ส่งใบขอซื้อเพื่อขออนุมัติ')
    }

    // ✅ อัปเดตสถานะใบขอซื้อผ่าน PurchaseService
    const result = await window.ERP_CORE.purchase.updatePurchaseRequest(requestId.value, submitData)
    console.log('✅ Submit result:', result)
    
    // ✅ Check if API call was successful
    const isSuccess = result && (result.success !== false)
    
    if (isSuccess) {
      // รอ DOM stable ก่อนแสดงผลลัพธ์
      setTimeout(() => {
        core.showNotification('success', 'ส่งใบขอซื้อเรียบร้อยแล้ว รออนุมัติจากผู้บังคับบัญชา', 'Submit Success')
        
        // Delayed state update หลังจากแสดงผลลัพธ์แล้ว
        setTimeout(async () => {
          // ✅ Update data safely after everything is stable
          Object.assign(requestData.value, {
            status: 'pending',
            workflow_state: 'pending_approval',
            updated_date: submitData.updated_date,
            updated_by: submitData.updated_by,
            notes: submitData.notes
          })
          
          // ✅ Add submission history entry safely
          if (!requestData.value.approvalHistory) {
            requestData.value.approvalHistory = []
          }
          
          requestData.value.approvalHistory.push({
            id: Date.now(),
            approverName: submittedBy,
            action: 'ส่งใบขอซื้อเพื่อขออนุมัติ',
            status: 'pending_approval',
            date: submitData.updated_date,
            comments: submitComments
          })
          
          console.log('✅ State updated successfully after submit')
        }, 300) // รอ 300ms หลังแสดงผลลัพธ์
        
      }, 100) // รอ DOM stable 100ms
      
    } else {
      throw new Error(result?.error || 'การส่งใบขอซื้อล้มเหลว')
    }
    
  } catch (error) {
    const core = getCore()
    
    // รอ DOM stable ก่อนแสดง error
    setTimeout(() => {
      core.showNotification('error', 'เกิดข้อผิดพลาดในการส่งใบขอซื้อ: ' + error.message, 'Submit Error')
    }, 100)
    
    console.error('Submit error:', error)
  } finally {
    // Reset processing state
    setTimeout(() => {
      processingSubmit.value = false
    }, 500)
  }
}

const approveRequest = async () => {
  if (!requestData.value) {
    const core = getCore()
    core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ', 'Approval')
    return
  }

  // ป้องกัน double click
  if (processingApproval.value) {
    return
  }

  processingApproval.value = true
  
  try {
    const core = getCore()
    
    // Store data before processing
    const approvalComments = approvalForm.value.comments || 'อนุมัติใบขอซื้อ'
    const approvedBy = approvalForm.value.approved_by
    
    // ปิด modal ทันที เพื่อป้องกัน DOM conflicts
    showApprovalModal.value = false
    approvalForm.value.comments = ''
    
    // รอให้ DOM เสถียร
    await nextTick()
    await nextTick() // Double nextTick for safety
    
    // สร้างข้อมูลการอนุมัติ
    const approvalData = {
      status: 'approved',
      workflow_state: 'approved',
      updated_date: new Date().toISOString(),
      updated_by: approvedBy,
      notes: approvalComments ? 
        (requestData.value.notes ? requestData.value.notes + '\n\n[อนุมัติ] ' + approvalComments : '[อนุมัติ] ' + approvalComments) :
        (requestData.value.notes || '[อนุมัติ] อนุมัติใบขอซื้อเรียบร้อยแล้ว')
    }

    // ✅ อัปเดตสถานะใบขอซื้อผ่าน PurchaseService
    const result = await window.ERP_CORE.purchase.updatePurchaseRequest(requestId.value, approvalData)
    console.log('✅ Approval result:', result)
    
    // ✅ Check if API call was successful
    const isSuccess = result && (result.success !== false)
    
    if (isSuccess) {
      // รอ DOM stable ก่อนแสดงผลลัพธ์
      setTimeout(() => {
        core.showNotification('success', 'อนุมัติใบขอซื้อเรียบร้อยแล้ว สามารถดำเนินการรับเข้าสินค้าได้', 'Approval Success')
        
        // Delayed state update หลังจากแสดงผลลัพธ์แล้ว
        setTimeout(async () => {
          // ✅ Update data safely after everything is stable
          Object.assign(requestData.value, {
            status: 'approved',
            workflow_state: 'approved',
            updated_date: approvalData.updated_date,
            updated_by: approvalData.updated_by,
            notes: approvalData.notes
          })
          
          // ✅ Add approval history entry safely
          if (!requestData.value.approvalHistory) {
            requestData.value.approvalHistory = []
          }
          
          requestData.value.approvalHistory.push({
            id: Date.now(),
            approverName: approvedBy,
            action: 'อนุมัติใบขอซื้อ',
            status: 'approved',
            date: approvalData.updated_date,
            comments: approvalComments
          })
          
          console.log('✅ State updated successfully after approval')
        }, 300) // รอ 300ms หลังแสดงผลลัพธ์
        
      }, 100) // รอ DOM stable 100ms
      
    } else {
      throw new Error(result?.error || 'การอนุมัติล้มเหลว')
    }
    
  } catch (error) {
    const core = getCore()
    
    // รอ DOM stable ก่อนแสดง error
    setTimeout(() => {
      core.showNotification('error', 'เกิดข้อผิดพลาดในการอนุมัติ: ' + error.message, 'Approval Error')
    }, 100)
    
    console.error('Approval error:', error)
  } finally {
    // Reset processing state
    setTimeout(() => {
      processingApproval.value = false
    }, 500)
  }
}

const goToGoodsReceipt = () => {
  if (!requestData.value) {
    const core = getCore()
    core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ', 'Navigation')
    return
  }

  // ไปหน้ารับเข้าสินค้า พร้อมส่งข้อมูล Purchase Order
  router.push({
    path: '/inventory/goods-receipt',
    query: {
      po_id: requestId.value,
      po_number: requestData.value.requestNumber,
      from: 'purchase-request'
    }
  })
}

const getStatusClass = (status) => {
  const statusClasses = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'pending_approval': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'complete': 'bg-blue-100 text-blue-800',
    'received': 'bg-purple-100 text-purple-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getStatusTextClass = (status) => {
  const statusClasses = {
    'draft': 'text-gray-600',
    'pending': 'text-yellow-600',
    'pending_approval': 'text-yellow-600',
    'approved': 'text-green-600',
    'complete': 'text-blue-600',
    'received': 'text-purple-600',
    'rejected': 'text-red-600',
    'cancelled': 'text-gray-600'
  }
  return statusClasses[status] || 'text-gray-600'
}

const getStatusText = (status) => {
  const statusTexts = {
    'draft': 'ร่าง',
    'pending': 'รออนุมัติ',
    'pending_approval': 'รออนุมัติ',
    'approved': 'อนุมัติแล้ว',
    'complete': 'เสร็จสิ้น',
    'received': 'รับเข้าแล้ว',
    'rejected': 'ไม่อนุมัติ',
    'cancelled': 'ยกเลิก'
  }
  return statusTexts[status] || 'ไม่ระบุ'
}

const getApprovalIcon = (status) => {
  const icons = {
    'approved': 'fas fa-check-circle text-green-500',
    'rejected': 'fas fa-times-circle text-red-500',
    'pending': 'fas fa-clock text-yellow-500'
  }
  return icons[status] || 'fas fa-question-circle text-gray-500'
}

const getApprovalBorderClass = (status) => {
  const borderClasses = {
    'approved': 'border-green-400',
    'rejected': 'border-red-400',
    'pending': 'border-yellow-400'
  }
  return borderClasses[status] || 'border-gray-400'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('th-TH')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNumber = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat('th-TH').format(number)
}

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getPurchaseTypeText = (type) => {
  const typeTexts = {
    'stock_replenishment': 'เติมสต๊อก',
    'new_product': 'สินค้าใหม่',
    'replacement': 'ทดแทน',
    'maintenance': 'บำรุงรักษา',
    'project': 'โปรเจ็กต์',
    'emergency': 'เร่งด่วน',
    'general': 'ทั่วไป'
  }
  return typeTexts[type] || type || 'ทั่วไป'
}

onMounted(() => {
  loadData()
  // Add click outside handler for dropdown
  document.addEventListener('click', handleClickOutside)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom animations */
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

/* Hover animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>