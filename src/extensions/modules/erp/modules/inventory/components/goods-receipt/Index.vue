
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-truck-loading mr-3 text-blue-600"></i>
              รับเข้าสินค้า (Goods Receipt)
            </h1>
            <p class="mt-2 text-gray-600">รับเข้าสินค้าจาก Purchase Order ที่อนุมัติแล้ว</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="loadApprovedPurchaseOrders"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              :disabled="loadingPurchaseOrders"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loadingPurchaseOrders }"></i>
              รีเฟรช
            </button>
            
            <!-- Debug: Reset PO Status Button -->
            <button 
              v-if="selectedPO"
              @click="resetPOStatus"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              title="เปลี่ยนสถานะ PO กลับเป็น approved เพื่อทดสอบ"
            >
              <i class="fas fa-undo mr-2"></i>
              Reset Status
            </button>
            <router-link 
              to="/inventory" 
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              กลับ
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
                <span class="text-sm font-medium text-gray-500">รับเข้าสินค้า</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- Purchase Orders Selection Card -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-shopping-cart mr-2 text-blue-600"></i>
            Purchase Orders ที่พร้อมรับเข้า
          </h2>
        </div>
        <div class="px-6 py-6">
          <div v-if="loadingPurchaseOrders" class="text-center py-12">
            <div class="inline-flex items-center px-4 py-2 text-blue-600">
              <i class="fas fa-spinner fa-spin mr-3"></i>
              <span class="text-lg">กำลังโหลด Purchase Orders...</span>
            </div>
          </div>

          <div v-else-if="(approvedPurchaseOrders || []).length === 0" class="text-center py-12">
            <div class="text-6xl mb-4 text-gray-300">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">ไม่มี Purchase Order ที่พร้อมรับเข้า</h3>
            <p class="text-gray-600 mb-6">ไม่พบ Purchase Order ที่อนุมัติแล้วและพร้อมสำหรับการรับเข้าสินค้า</p>
            <button 
              @click="loadApprovedPurchaseOrders"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2"></i>
              ลองใหม่
            </button>
          </div>

          <div v-else class="grid gap-4">
            <div 
              v-for="po in (approvedPurchaseOrders || [])" 
              :key="po.id"
              :class="[
                'border rounded-lg p-6 cursor-pointer transition-all duration-200',
                selectedPO && selectedPO.id === po.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              ]"
              @click="selectPurchaseOrder(po)"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    PO: {{ po.po_number || po.purchase_request_code || po.id }}
                  </h3>
                  <p class="text-gray-600 mb-2">{{ po.supplier || po.supplier_name || 'ผู้จำหน่ายไม่ระบุ' }}</p>
                  <div class="flex items-center text-sm text-gray-500 space-x-4">
                    <span>
                      <i class="fas fa-calendar-alt mr-1"></i>
                      {{ formatDate(po.created_date || po.created_at) }}
                    </span>
                    <span>
                      <i class="fas fa-list mr-1"></i>
                      {{ po.items?.length || 0 }} รายการ
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600 mb-2">
                    ฿{{ Number(po.total_amount || 0).toLocaleString() }}
                  </div>
                  <span 
                    :class="getStatusBadgeClass(po.status)"
                    class="inline-flex px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(po.status || 'approved') }}
                  </span>
                  <div class="text-sm text-gray-500 mt-1">
                    Workflow: {{ po.workflow_state || 'N/A' }}
                  </div>
                </div>
              </div>

              <div v-if="po.items && po.items.length > 0" class="border-t border-gray-100 pt-4">
                <p class="text-sm font-medium text-gray-700 mb-2">รายการสินค้า:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div 
                    v-for="item in (po.items || []).slice(0, 4)" 
                    :key="item.id || item.sku"
                    class="text-xs bg-gray-100 rounded px-2 py-1 text-gray-700"
                  >
                    {{ item.product_name || item.sku }} ({{ item.quantity || 0 }})
                  </div>
                </div>
                <p v-if="(po.items || []).length > 4" class="text-xs text-gray-500 mt-2">
                  และอีก {{ (po.items || []).length - 4 }} รายการ...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Goods Receipt Form -->
      <div v-if="selectedPO && !processingReceipt" class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-clipboard-check mr-2 text-green-600"></i>
            รับเข้าสินค้าจาก PO: {{ selectedPO.po_number || selectedPO.purchase_request_code || selectedPO.id }}
          </h2>
        </div>
        <div class="px-6 py-6">
          <form @submit.prevent="processGoodsReceipt" class="space-y-8">
            <!-- Receipt Header -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">วันที่รับเข้า</label>
                <input 
                  type="date" 
                  v-model="receiptForm.date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ผู้รับเข้า</label>
                <input 
                  type="text" 
                  v-model="receiptForm.received_by"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ชื่อผู้รับเข้าสินค้า"
                  required
                >
              </div>
            </div>

            <!-- Items List -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-boxes mr-2 text-blue-600"></i>
                รายการสินค้าที่จะรับเข้า
              </h3>
              
              <div v-if="!selectedPO.items || selectedPO.items.length === 0" class="text-center py-12">
                <div class="text-6xl mb-4 text-gray-300">
                  <i class="fas fa-box-open"></i>
                </div>
                <p class="text-gray-500">ไม่มีรายการสินค้าใน PO นี้</p>
              </div>

              <div v-else class="space-y-4 overflow-visible">
                <!-- Items Header -->
                <div class="bg-gray-50 border-b border-gray-200 p-3">
                  <div class="grid grid-cols-7 gap-3 text-sm font-medium text-gray-600">
                    <div class="col-span-2">สินค้า</div>
                    <div class="text-center">สั่ง</div>
                    <div class="text-center">รับ</div>
                    <div>ตำแหน่งเก็บ</div>
                    <div class="text-center">RACK</div>
                    <div class="text-center">LOT</div>
                  </div>
                </div>

                <!-- Items List -->
                <div class="space-y-2 overflow-visible">
                  <div 
                    v-for="(item, index) in (selectedPO.items || [])" 
                    :key="item.id || index" 
                    class="bg-white border border-gray-200 overflow-visible relative"
                    style="z-index: 1;"
                  >
                    <!-- Main Row -->
                    <div class="p-3 hover:bg-gray-50 transition-colors">
                      <div class="grid grid-cols-7 gap-3 items-center"
                           :style="activeRackDropdown === index ? 'z-index: 10; position: relative;' : ''">
                        <!-- Product Info (2 columns) -->
                        <div class="col-span-2">
                          <div class="text-sm font-medium text-gray-900">{{ item.product_name || item.sku }}</div>
                          <div class="text-xs text-gray-500">{{ item.sku }}</div>
                        </div>

                        <!-- Quantity Ordered -->
                        <div class="text-center">
                          <div class="bg-gray-100 px-2 py-1 rounded text-sm font-medium">{{ item.quantity || 0 }} {{ item.unit || 'ชิ้น' }}</div>
                        </div>

                        <!-- Quantity Received -->
                        <div class="text-center">
                          <input 
                            type="number" 
                            v-model.number="item.received_quantity"
                            :max="item.quantity"
                            min="0"
                            step="0.01"
                            class="w-16 px-2 py-1 text-sm font-medium text-center border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            @input="validateReceivedQuantity(item)"
                            placeholder="0"
                          >
                        </div>

                        <!-- Location -->
                        <div>
                          <div class="relative">
                            <i class="fas fa-warehouse absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs z-10"></i>
                            <select 
                              v-model="item.location"
                              class="w-full pl-7 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                              required
                            >
                              <option value="">เลือกตำแหน่ง</option>
                              <option 
                                v-for="location in (stockLocations || [])" 
                                :key="location.code"
                                :value="location.code"
                              >
                                {{ location.code }} - {{ location.name }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <!-- Rack Position -->
                        <div class="text-center">
                          <div class="relative" style="z-index: 1;">
                            <button 
                              @click="toggleRackDropdown(index)"
                              type="button"
                              data-rack-dropdown
                              :disabled="processingReceipt"
                              class="px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 min-w-[70px] inline-flex items-center justify-center"
                              :class="{ 
                                'border-green-500 bg-green-50 text-green-700': item.rack_position,
                                'border-red-300 bg-red-50 text-red-700': item.received_quantity > 0 && !item.rack_position,
                                'border-gray-300 bg-gray-50 text-gray-600': !item.rack_position && item.received_quantity <= 0,
                                'opacity-50 cursor-not-allowed': processingReceipt
                              }"
                              :style="activeRackDropdown === index && !processingReceipt ? 'z-index: 10000; position: relative;' : ''"
                            >
                              <i class="fas fa-th-large mr-1 text-xs"></i>
                              {{ item.rack_position || 'เลือก' }}
                            </button>
                            
                            <!-- Dropdown Panel -->
                            <div v-if="activeRackDropdown === index && !processingReceipt" 
                                 @click.stop
                                 class="dropdown-panel-rack">
                              
                              <!-- Step 1: Select Rack (Left/Right) -->
                              <div v-if="!selectedRackForItem[index]" class="text-center">
                                <div class="text-xs text-gray-600 mb-3 font-medium">เลือก Rack</div>
                                <div class="grid grid-cols-2 gap-3 mb-3">
                                  <button
                                    v-for="rack in availableRacks"
                                    :key="rack.id"
                                    @click.stop="selectRackForItem(index, rack)"
                                    type="button"
                                    class="py-3 px-2 rounded text-sm font-bold border flex flex-col items-center justify-center hover:shadow-md transition-all"
                                    :class="'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'"
                                  >
                                    <i class="fas fa-warehouse text-lg mb-1" :class="rack.position === 'left' ? 'text-orange-500' : 'text-purple-500'"></i>
                                    <span class="text-xs">{{ rack.name }}</span>
                                  </button>
                                </div>
                              </div>

                              <!-- Step 2: Select Position (A1-C3) -->
                              <div v-else class="text-center">
                                <div class="flex items-center justify-between mb-3">
                                  <button 
                                    @click.stop="goBackToRackSelection(index)"
                                    type="button"
                                    class="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <i class="fas fa-arrow-left mr-1"></i>
                                    {{ selectedRackForItem[index].name }}
                                  </button>
                                </div>
                                <div class="text-xs text-gray-600 mb-3 font-medium">เลือกตำแหน่ง</div>
                                <!-- 3x3 Rack Grid -->
                                <div class="grid grid-cols-3 gap-3">
                                  <button
                                    v-for="position in rackPositions || []"
                                    :key="position.id"
                                    @click.stop="selectRackPosition(position, item, index)"
                                    type="button"
                                    class="py-3 px-3 rounded text-sm font-bold border w-14 h-14 flex items-center justify-center hover:shadow-md transition-all"
                                    :class="getFullRackPosition(selectedRackForItem[index], position) === item.rack_position 
                                      ? 'bg-blue-600 text-white border-blue-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'"
                                  >
                                    {{ position.id }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Lot Management -->
                        <div class="text-center">
                          <div v-if="isTextileProduct(item)">
                            <button 
                              @click="configureLots(item, index)"
                              type="button"
                              class="px-2 py-1 text-sm border border-indigo-300 rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 min-w-[70px] inline-flex items-center justify-center"
                              :disabled="!item.received_quantity || item.received_quantity <= 0"
                              :class="{ 'opacity-50': !item.received_quantity || item.received_quantity <= 0 }"
                            >
                              <i class="fas fa-layer-group mr-1 text-xs"></i>
                              {{ item.lots && item.lots.length > 0 ? `${item.lots.length}` : 'ตั้งค่า' }}
                            </button>
                          </div>
                          <div v-else class="text-xs text-gray-400">
                            -
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Notes Row -->
                    <div class="px-3 pb-3 border-t border-gray-100">
                      <div class="pt-2 relative">
                        <i class="fas fa-sticky-note absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs z-10"></i>
                        <input 
                          type="text" 
                          v-model="item.notes"
                          class="w-full pl-7 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="หมายเหตุ..."
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receipt Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุการรับเข้า</label>
              <textarea 
                v-model="receiptForm.notes"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการรับเข้าสินค้า"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between border-t border-gray-200 pt-6">
              <div class="text-sm text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนดำเนินการ
              </div>
              <div class="flex space-x-3">
                <button 
                  type="button" 
                  @click="cancelReceipt"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  :disabled="processingReceipt || !canProcessReceipt"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <i v-if="processingReceipt" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else class="fas fa-check mr-2"></i>
                  {{ processingReceipt ? 'กำลังประมวลผล...' : 'รับเข้าสินค้า' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Processing Modal -->
      <div v-if="processingReceipt" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-cog fa-spin mr-2 text-blue-600"></i>
            กำลังประมวลผล
          </h3>
          <div class="space-y-3 mb-6">
            <div class="flex items-center text-green-600">
              <i class="fas fa-check mr-2"></i>
              <span>รับเข้าสินค้าเข้าสู่ระบบ</span>
            </div>
            <div class="flex items-center text-blue-600">
              <i class="fas fa-chart-line mr-2"></i>
              <span>อัปเดต Balance และ Stock Movement</span>
            </div>
            <div class="flex items-center text-purple-600">
              <i class="fas fa-check-double mr-2"></i>
              <span>ตรวจสอบความถูกต้องของข้อมูล</span>
            </div>
            <p class="text-sm text-gray-500 italic">กรุณารอสักครู่...</p>
          </div>
          <div class="flex justify-center">
            <div class="flex space-x-1">
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info Panel -->
      <div v-if="selectedPO" class="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
        <div class="px-6 py-4">
          <h3 class="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
            <i class="fas fa-tools mr-2"></i>
            Debug Mode - Testing Tools
          </h3>
          <div class="text-sm text-yellow-700 space-y-3">
            <div>
              <strong>Selected PO:</strong> {{ selectedPO.po_number || selectedPO.id }}
              <span class="ml-2 px-2 py-1 bg-yellow-200 rounded text-xs">{{ selectedPO.status }}</span>
            </div>
            <div>
              <strong>Reset Status Button:</strong> ใช้เพื่อเปลี่ยนสถานะ PO กลับเป็น "approved" สำหรับการทดสอบ Balance ซ้ำ
            </div>
            <p class="text-xs text-yellow-600">
              หลังจากรับเข้าสินค้าแล้ว สามารถใช้ปุ่ม "Reset Status" เพื่อทดสอบการอัปเดต Balance อีกครั้ง
            </p>
            
            <!-- Debug Action Buttons -->
            <div class="flex space-x-2 pt-3">
              <button 
                @click="checkBalanceStatus"
                class="bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                <i class="fas fa-chart-bar mr-1"></i>
                ตรวจสอบ Balance Status
              </button>
              
              <button 
                @click="cleanBalanceRecords"
                class="bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                <i class="fas fa-trash mr-1"></i>
                ลบ Balance Records เก่า
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lot Management Modal -->
      <div v-if="showLotModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-90vh overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <i class="fas fa-layer-group text-blue-600 mr-2"></i>
                จัดการ Lot สำหรับ {{ currentLotItem?.product_name }}
              </h3>
              <button @click="closeLotModal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div class="text-sm text-gray-600 mt-1">
              จำนวนที่รับ: {{ currentLotItem?.received_quantity }} {{ mapUnitToThai(currentLotItem?.unit) }}
            </div>
          </div>
          
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <!-- Lot Configuration Form -->
            <div class="space-y-4">
              <!-- Current Lots List -->
              <div v-if="currentLotItem?.lots && currentLotItem.lots.length > 0">
                <h4 class="font-medium text-gray-900 mb-3">Lot ที่ตั้งค่าแล้ว</h4>
                <div class="space-y-3">
                  <div v-for="(lot, lotIndex) in (currentLotItem.lots || [])" :key="`lot-${lotIndex}-${lot.lot_id || lotIndex}`" 
                       class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <!-- Row 1: Lot Code และ Lot ID -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-barcode text-blue-600 mr-1"></i>
                          Lot Code (จากผู้ขาย) *
                        </label>
                        <input 
                          type="text" 
                          v-model="lot.lot_code"
                          @input="updateFullLotCode(lot)"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="เช่น ABC-2024-001, L240801-A1"
                          required
                        >
                        <p class="text-xs text-gray-500 mt-1">รหัส Lot ที่มากับสินค้าจากผู้ขาย</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-tag text-green-600 mr-1"></i>
                          Internal Lot ID
                        </label>
                        <input 
                          type="text" 
                          v-model="lot.lot_id"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          placeholder="เช่น LOT-12345 (สร้างอัตโนมัติ)"
                          readonly
                        >
                        <p class="text-xs text-gray-500 mt-1">รหัส Lot ภายในระบบ (สร้างอัตโนมัติ)</p>
                      </div>
                    </div>
                    
                    <!-- Row 2: Meters, Weight และ meters_per_kg (เปลี่ยนลำดับและวิธีการคำนวณ) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-ruler-horizontal text-blue-600 mr-1"></i>
                          ความยาว (เมตร) *
                        </label>
                        <input 
                          type="number" 
                          v-model.number="lot.calculated_meters"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          step="0.01"
                          min="0"
                          @input="calculateMetersPerKg(lot)"
                          placeholder="ระบุความยาว"
                          required
                        >
                        <p class="text-xs text-gray-500 mt-1">กรอกความยาวตามที่วัดได้จริง</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-weight text-purple-600 mr-1"></i>
                          น้ำหนัก (กก.) <span class="text-gray-400 text-xs">(ไม่บังคับ)</span>
                        </label>
                        <input 
                          type="number" 
                          v-model.number="lot.weight_kg"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          step="0.01"
                          min="0"
                          @input="calculateMetersPerKg(lot)"
                          placeholder="ไม่ระบุจะใช้ค่าจากสินค้า"
                        >
                        <p v-if="lot.weight_kg" class="text-xs text-gray-500 mt-1">ชั่งน้ำหนักจริง</p>
                        <p v-else class="text-xs text-gray-400 mt-1">จะใช้ค่าจากข้อมูลสินค้า</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-calculator text-green-600 mr-1"></i>
                          ม./กก. (คำนวณอัตโนมัติ)
                        </label>
                        <input 
                          type="number" 
                          v-model.number="lot.meters_per_kg"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-green-50 focus:ring-2 focus:ring-green-500"
                          readonly
                        >
                        <p class="text-xs text-green-600 mt-1">ใช้สำหรับชั่งสต็อค</p>
                      </div>
                    </div>
                    
                    <!-- Row 2.5: Full Lot Code -->
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          <i class="fas fa-qrcode text-yellow-600 mr-1"></i>
                          รหัส Lot เต็ม (สร้างอัตโนมัติ)
                        </label>
                        <input 
                          type="text" 
                          v-model="lot.full_lot_code"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-yellow-50 font-mono text-lg font-bold text-yellow-800"
                          readonly
                        >
                        <p class="text-xs text-gray-500 mt-1">
                          รหัส Lot ที่ประกอบจาก: รุ่น{{ currentLotItem?.model_code || '000' }} + สี{{ currentLotItem?.color_code || '000' }} + กว้าง{{ currentLotItem?.fabric_width_cm || '000' }} + {{ lot.lot_code || 'xxxx' }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Row 3: Supplier และ Actions -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ผู้จำหน่าย</label>
                        <input 
                          type="text" 
                          v-model="lot.supplier_name"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="ชื่อผู้จำหน่าย"
                        >
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                        <input 
                          type="text" 
                          v-model="lot.notes"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                        >
                      </div>
                      <div class="flex items-end">
                        <button 
                          @click="removeLot(lotIndex)"
                          type="button"
                          class="w-full px-3 py-2 text-sm border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        >
                          <i class="fas fa-trash mr-1"></i>
                          ลบ Lot นี้
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Add New Lot Button -->
              <div class="flex justify-between items-center pt-4">
                <button 
                  @click="addNewLot"
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
                >
                  <i class="fas fa-plus mr-2"></i>
                  เพิ่ม Lot ใหม่
                </button>
                
                <div class="text-sm text-gray-600">
                  รวม: {{ getTotalLotMeters() }} เมตร
                  <span v-if="Math.abs(getTotalLotMeters() - (currentLotItem?.received_quantity || 0)) > 0.1" class="text-red-600 ml-2">
                    (ไม่ตรงกับจำนวนที่รับ: {{ currentLotItem?.received_quantity }})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              @click="closeLotModal" 
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button 
              @click="saveLotConfiguration" 
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
              :disabled="!isLotConfigurationValid()"
              :class="{ 'opacity-50 cursor-not-allowed': !isLotConfigurationValid() }"
            >
              บันทึกการตั้งค่า Lot
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue'

export default {
  name: 'GoodsReceipt',
  setup() {
    // ใช้ InventoryService หลักผ่าน global
    const currentInstance = getCurrentInstance()
    const inventoryService = currentInstance.appContext.config.globalProperties.$inventoryService || 
                           window.InventoryService || 
                           window.ERP_CORE.inventory

    // Initialize InventoryService if needed
    if (!inventoryService?.isReady?.()) {
      inventoryService?.initialize?.(currentInstance)
    }

    // Reactive data
    const approvedPurchaseOrders = ref([])
    const stockLocations = ref([])
    const selectedPO = ref(null)
    const loadingPurchaseOrders = ref(false)
    const processingReceipt = ref(false)
    
    // Lot Management States
    const showLotModal = ref(false)
    const currentLotItem = ref(null)
    const currentItemIndex = ref(null)

    // Rack Position States
    const showRackModal = ref(false)
    const currentRackItem = ref(null)
    const currentRackItemIndex = ref(null)
    const activeRackDropdown = ref(null) // Track which dropdown is open
    const selectedRack = ref({ id: 'RCK002' }) // Default rack
    const availableRacks = ref([
      { id: 'RACK-L', name: 'Rack ซ้าย', position: 'left' },
      { id: 'RACK-R', name: 'Rack ขวา', position: 'right' }
    ])
    const rackPositions = ref([
      // แถวที่ 1 (A1, A2, A3)
      { id: 'A1', row: 'A', col: 1 },
      { id: 'A2', row: 'A', col: 2 },
      { id: 'A3', row: 'A', col: 3 },
      // แถวที่ 2 (B1, B2, B3)  
      { id: 'B1', row: 'B', col: 1 },
      { id: 'B2', row: 'B', col: 2 },
      { id: 'B3', row: 'B', col: 3 },
      // แถวที่ 3 (C1, C2, C3)
      { id: 'C1', row: 'C', col: 1 },
      { id: 'C2', row: 'C', col: 2 },
      { id: 'C3', row: 'C', col: 3 },
    ])

    // Rack selection state
    const activeRackSelector = ref(null)
    const selectedRackForItem = ref({})

    // Form data
    const receiptForm = ref({
      date: new Date().toISOString().split('T')[0],
      received_by: 'warehouse_staff',
      notes: ''
    })

    // Computed properties
    const canProcessReceipt = computed(() => {
      if (!selectedPO.value || !selectedPO.value.items) return false
      
      return selectedPO.value.items.some(item => 
        item.received_quantity > 0 && item.location && item.product_id && item.rack_position
      )
    })

    // Methods
    const mapUnitToThai = (unit) => {
      const unitMap = {
        'piece': 'ชิ้น',
        'pieces': 'ชิ้น',
        'set': 'ชุด',
        'box': 'กล่อง',
        'pack': 'แพ็ค',
        'kg': 'กิโลกรัม',
        'kilogram': 'กิโลกรัม',
        'g': 'กรัม',
        'gram': 'กรัม',
        'l': 'ลิตร',
        'liter': 'ลิตร',
        'm': 'เมตร',
        'meter': 'เมตร',
        'roll': 'ม้วน',
        'bottle': 'ขวด',
        'bag': 'ถุง'
      }
      return unitMap[unit?.toLowerCase()] || unit || 'ชิ้น'
    }

    const normalizeCategory = (category) => {
      if (!category) return 'general'
      
      // Normalize category names to standard format
      const categoryMap = {
        'electronics': 'electronics',
        'electronic': 'electronics',
        'อิเล็กทรอนิกส์': 'electronics',
        'food': 'food_beverage',
        'food & beverage': 'food_beverage',
        'อาหารและเครื่องดื่ม': 'food_beverage',
        'clothing': 'clothing_fashion',
        'fashion': 'clothing_fashion',
        'เสื้อผ้า': 'clothing_fashion',
        'tools': 'tools_equipment',
        'equipment': 'tools_equipment',
        'เครื่องมือ': 'tools_equipment',
        'general': 'general',
        'ทั่วไป': 'general',
        'office': 'office_supplies',
        'supplies': 'office_supplies',
        'เครื่องเขียน': 'office_supplies'
      }
      
      const normalized = categoryMap[category.toLowerCase()] || category.toLowerCase()
      console.log(`📂 Category normalized: "${category}" → "${normalized}"`)
      return normalized
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return 'ไม่ระบุ'
      }
    }

    const loadApprovedPurchaseOrders = async () => {
      loadingPurchaseOrders.value = true
      try {
        console.log('🔄 [GoodsReceipt] Loading approved purchase orders...')
        console.log('🔍 [GoodsReceipt] Available inventoryService methods:', Object.keys(inventoryService || {}))
        
        // ✅ ตรวจสอบว่า inventoryService มีฟังก์ชัน getApprovedPurchaseOrders หรือไม่
        if (!inventoryService || !inventoryService.getApprovedPurchaseOrders) {
          console.error('❌ [GoodsReceipt] InventoryService.getApprovedPurchaseOrders not available!')
          console.log('📍 Available service:', inventoryService)
          
          // ลองใช้ fallback หรือแสดง error
          throw new Error('InventoryService.getApprovedPurchaseOrders ไม่พร้อมใช้งาน')
        }
        
        const approvedPOs = await inventoryService.getApprovedPurchaseOrders()
        
        console.log(`📋 [GoodsReceipt] Found ${approvedPOs.length} approved purchase orders`)
        console.log('📋 [GoodsReceipt] Purchase orders:', approvedPOs)
        
        approvedPurchaseOrders.value = approvedPOs
        
        if (approvedPOs.length === 0) {
          console.log('ℹ️ [GoodsReceipt] No approved purchase orders found for goods receipt')
        }
        
      } catch (error) {
        console.error('❌ [GoodsReceipt] Error loading purchase orders via InventoryService:', error)
        approvedPurchaseOrders.value = []
        alert(`เกิดข้อผิดพลาดในการโหลด Purchase Orders: ${error.message}`)
      } finally {
        loadingPurchaseOrders.value = false
      }
    }

    const loadStockLocations = async () => {
      try {
        console.log('📍 [GoodsReceipt] Loading stock locations via InventoryService...')
        
        // ✅ ใช้ InventoryService เพื่อดึงข้อมูล stock locations
        const locations = await inventoryService.getAllStockLocations()
        
        stockLocations.value = locations.map(loc => {
          const code = loc.location_code || loc.code || loc.id
          const name = loc.location_name || loc.name || 'ไม่ระบุชื่อ'
          const zone = loc.zone || loc.location_zone || loc.area || ''
          
          console.log(`📍 [GoodsReceipt] Mapped location: ${code} - ${name} (${zone})`)
          
          return {
            code: code,
            name: name,
            zone: zone,
            id: loc.id || code,
            type: loc.location_type || loc.type || 'warehouse',
            capacity: loc.capacity_numeric ? 
              `${loc.capacity_numeric} ${loc.capacity_unit || 'หน่วย'}` : 
              'ไม่จำกัด',
            current_usage: loc.current_usage || 0,
            status: loc.status || 'active'
          }
        })
        
        console.log(`✅ [GoodsReceipt] Stock locations loaded: ${stockLocations.value.length}`)
        console.log('📍 [GoodsReceipt] Final stock locations:', stockLocations.value)
        
        if (stockLocations.value.length === 0) {
          console.warn('⚠️ [GoodsReceipt] No stock locations found in system - please create stock locations first')
        }
        
      } catch (error) {
        console.error('❌ [GoodsReceipt] Error loading stock locations via InventoryService:', error)
        stockLocations.value = []
        
        // แสดง error message ให้ user
        alert(`เกิดข้อผิดพลาดในการโหลดสถานที่เก็บสินค้า: ${error.message}`)
      }
    }

    const loadProductDetails = async (items) => {
      try {
        console.log('🔍 [GoodsReceipt] Loading product details via InventoryService...')
        
        // ✅ ใช้ InventoryService เพื่อดึงข้อมูล products แทนการใช้ engine โดยตรง
        const allProducts = await inventoryService.getAllProducts()
        
        console.log(`✅ [GoodsReceipt] Found ${allProducts.length} products from InventoryService`)
        
        return items.map(item => {
          // Find matching product by SKU or product_name
          const product = allProducts.find(p => 
            p.sku === item.sku || 
            p.product_code === item.sku ||
            p.product_name === item.product_name
          )
          
          if (product) {
            console.log(`✅ [GoodsReceipt] Found product: ${product.sku} - ${product.product_name}`)
            return {
              ...item,
              product_id: product.id,
              product_code: product.product_code || product.sku,
              product_name: product.product_name,
              unit: product.unit || item.unit || 'piece',
              category: product.category || item.category || 'general',
              supplier_id: product.supplier_id,
              // Additional product details for balance management
              min_stock: product.min_stock || 0,
              unit_price: item.unit_price || product.unit_price || 0,
              status: product.status || 'active',
              // ✅ เพิ่มข้อมูลสิ่งทอสำหรับ lot tracking
              model_code: product.model_code,
              color_code: product.color_code,
              fabric_width_cm: product.fabric_width_cm,
              fabric_type: product.fabric_type,
              fabric_composition: product.fabric_composition,
              gsm: product.gsm,
              thread_count: product.thread_count,
              weight_per_meter: product.weight_per_meter,
              enable_lot_tracking: product.enable_lot_tracking
            }
          } else {
            console.warn(`⚠️ [GoodsReceipt] Product not found for SKU: ${item.sku} - will use original data`)
            return {
              ...item,
              product_id: item.product_id || null // ใช้ product_id ที่มีอยู่แล้วหรือ null
            }
          }
        })
      } catch (error) {
        console.error('❌ [GoodsReceipt] Error loading product details via InventoryService:', error)
        // ถ้า error ให้ใช้ข้อมูลเดิมที่มี product_id อยู่แล้ว
        return items
      }
    }

    const selectPurchaseOrder = async (po) => {
      selectedPO.value = { ...po }
      
      // Load product details and initialize received quantities
      if (selectedPO.value.items) {
        const itemsWithProductDetails = await loadProductDetails(selectedPO.value.items)
        
        selectedPO.value.items = itemsWithProductDetails.map(item => ({
          ...item,
          received_quantity: item.quantity || 0, // Default to ordered quantity
          location: '', // Will be selected by user
          notes: ''
        }))
      }
      
      console.log('📋 Selected PO with product details:', selectedPO.value.po_number || selectedPO.value.id)
    }

    const validateReceivedQuantity = (item) => {
      if (item.received_quantity > item.quantity) {
        item.received_quantity = item.quantity
        alert(`จำนวนที่รับไม่สามารถเกินจำนวนที่สั่ง (${item.quantity})`)
      }
      if (item.received_quantity < 0) {
        item.received_quantity = 0
      }
    }

    // === LOT MANAGEMENT FUNCTIONS ===
    
    /**
     * ตรวจสอบว่าสินค้าเป็นประเภทผ้าที่ต้อง lot tracking หรือไม่
     */
    const isTextileProduct = (item) => {
      if (!item) return false
      
      const category = item.category?.toLowerCase() || ''
      const productName = item.product_name?.toLowerCase() || ''
      const sku = item.sku?.toLowerCase() || ''
      
      // คำที่บ่งบอกว่าเป็นสินค้าผ้า
      const textileKeywords = ['textile', 'fabric', 'ผ้า', 'cotton', 'polyester', 'silk', 'wool']
      
      return textileKeywords.some(keyword => 
        category.includes(keyword) || 
        productName.includes(keyword) || 
        sku.includes(keyword)
      )
    }

    /**
     * เปิด modal สำหรับจัดการ lot
     */
    const configureLots = (item, index) => {
      currentLotItem.value = { ...item }
      currentItemIndex.value = index
      
      // ถ้ายังไม่มี lots ให้สร้างใหม่
      if (!currentLotItem.value.lots) {
        currentLotItem.value.lots = []
      }
      
      // ถ้ายังไม่มี lot ให้สร้าง lot เริ่มต้น
      if (currentLotItem.value.lots.length === 0) {
        addNewLot()
      }
      
      showLotModal.value = true
    }

    /**
     * เพิ่ม lot ใหม่
     */
    const addNewLot = () => {
      if (!currentLotItem.value.lots) {
        currentLotItem.value.lots = []
      }
      
      const newLot = {
        lot_code: '', // รหัส lot จากผู้ขาย (ต้องกรอกเอง)
        lot_id: generateLotId(), // รหัส lot ภายในระบบ (สร้างอัตโนมัติ)
        weight_kg: 0,
        calculated_meters: 0,
        supplier_name: selectedPO.value?.supplier_name || '',
        notes: '',
        received_date: receiptForm.value.date,
        // ✅ เพิ่มข้อมูลสิ่งทอจาก product
        model_code: currentLotItem.value.model_code,
        color_code: currentLotItem.value.color_code,  
        fabric_width_cm: currentLotItem.value.fabric_width_cm,
        fabric_type: currentLotItem.value.fabric_type,
        fabric_composition: currentLotItem.value.fabric_composition,
        gsm: currentLotItem.value.gsm,
        thread_count: currentLotItem.value.thread_count,
        weight_per_meter: currentLotItem.value.weight_per_meter,
        full_lot_code: '', // จะสร้างหลังจากกรอก lot_code
        status: 'full' // เริ่มต้นเป็นม้วนเต็ม
      }
      
      currentLotItem.value.lots.push(newLot)
      console.log('✅ Added new lot with textile data:', newLot)
    }

    /**
     * ลบ lot
     */
    const removeLot = (lotIndex) => {
      if (currentLotItem.value.lots && lotIndex >= 0) {
        currentLotItem.value.lots.splice(lotIndex, 1)
      }
    }

    /**
     * ✅ คำนวณ meters_per_kg จากความยาวและน้ำหนักที่กรอก
     * ใช้สำหรับการชั่งสต็อคในภายหลัง
     */
    const calculateMetersPerKg = (lot) => {
      // สูตร: meters_per_kg = เมตร / น้ำหนัก
      if (lot.calculated_meters && lot.weight_kg && lot.weight_kg > 0) {
        lot.meters_per_kg = parseFloat((lot.calculated_meters / lot.weight_kg).toFixed(4))
      } else {
        lot.meters_per_kg = 0
      }
      
      console.log('📐 [calculateMetersPerKg]', {
        meters: lot.calculated_meters,
        weight_kg: lot.weight_kg,
        meters_per_kg: lot.meters_per_kg
      })
    }

    /**
     * อัปเดต Full Lot Code เมื่อ lot_code เปลี่ยนแปลง
     */
    const updateFullLotCode = (lot) => {
      if (lot.lot_code && lot.lot_code.trim() !== '') {
        lot.full_lot_code = generateFullLotCode(lot)
        console.log(`🔄 Updated full lot code for ${lot.lot_code}: ${lot.full_lot_code}`)
      } else {
        lot.full_lot_code = ''
      }
    }

    /**
     * สร้าง Lot ID อัตโนมัติ
     */
    const generateLotId = () => {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      
      return `LOT-${year}${month}${day}-${random}`
    }

    /**
     * สร้าง Full Lot Code จากข้อมูลสิ่งทอ
     * Format: รุ่น + สี + กว้าง + lot_code (ไม่มีขีด)
     */
    const generateFullLotCode = (lot) => {
      if (!lot.lot_code || !currentLotItem.value) return ''
      
      const model = String(currentLotItem.value.model_code || '000')
      const color = String(currentLotItem.value.color_code || '000')  
      const width = String(currentLotItem.value.fabric_width_cm || 0).padStart(3, '0')
      const lotCode = String(lot.lot_code)
      
      const fullCode = `${model}${color}${width}${lotCode}`
      console.log(`🔢 Generated full lot code: ${fullCode} (${model} + ${color} + ${width} + ${lotCode})`)
      return fullCode
    }

    /**
     * คำนวณเมตรรวมของ lots ทั้งหมด
     */
    const getTotalLotMeters = () => {
      if (!currentLotItem.value?.lots) return 0
      
      return currentLotItem.value.lots.reduce((total, lot) => {
        return total + (lot.calculated_meters || 0)
      }, 0)
    }

    /**
     * ตรวจสอบว่าการตั้งค่า lot ถูกต้องหรือไม่
     */
    const isLotConfigurationValid = () => {
      if (!currentLotItem.value?.lots || currentLotItem.value.lots.length === 0) {
        return false
      }
      
      // ตรวจสอบว่าทุก lot มี lot_code, lot_id, weight_kg และ full_lot_code
      const allLotsValid = currentLotItem.value.lots.every(lot => 
        lot.lot_code && lot.lot_code.trim() !== '' && // รหัส lot จากผู้ขาย (บังคับ)
        lot.lot_id && lot.lot_id.trim() !== '' && // รหัส lot ภายในระบบ (บังคับ)
        lot.weight_kg > 0 && // น้ำหนักต้องมากกว่า 0
        lot.full_lot_code && lot.full_lot_code.trim() !== '' // รหัส lot เต็ม (บังคับ)
      )
      
      return allLotsValid
    }

    /**
     * บันทึกการตั้งค่า lot
     */
    const saveLotConfiguration = async () => {
      if (!isLotConfigurationValid()) {
        alert('กรุณาตรวจสอบข้อมูล Lot ให้ครบถ้วน:\n- Lot Code จากผู้ขาย (บังคับ)\n- น้ำหนักต้องมากกว่า 0 กก.')
        return
      }
      
      // อัปเดตข้อมูลในรายการสินค้าหล็ก
      if (selectedPO.value && selectedPO.value.items && currentItemIndex.value !== null) {
        selectedPO.value.items[currentItemIndex.value].lots = [...currentLotItem.value.lots]
      }
      
      await closeLotModal()
    }

    /**
     * ปิด modal การจัดการ lot
     */
    const closeLotModal = async () => {
      // ปิด modal ก่อน
      showLotModal.value = false
      
      // รอ DOM update
      await nextTick()
      
      // ล้างข้อมูล
      currentLotItem.value = null
      currentItemIndex.value = null
    }

    // === RACK POSITION MANAGEMENT FUNCTIONS ===
    
    /**
     * เปิด modal เลือก rack position
     */
    const openRackSelector = (item) => {
      if (!item.location) {
        alert('กรุณาเลือก Location ก่อนเลือก Rack Position')
        return
      }
      
      console.log('🏗️ Opening rack dropdown for:', item.product_name)
    }

    /**
     * Toggle dropdown panel (ไม่มี modal)
     */
    const toggleRackDropdown = (index) => {
      const item = selectedPO.value?.items?.[index]
      if (!item?.location) {
        alert('กรุณาเลือก Location ก่อนเลือก Rack Position')
        return
      }
      
      // Toggle dropdown
      if (activeRackDropdown.value === index) {
        console.log('🔽 Closing dropdown for index:', index)
        activeRackDropdown.value = null
      } else {
        console.log('🔽 Opening dropdown for index:', index, 'Current rack selection:', selectedRackForItem.value[index])
        activeRackDropdown.value = index
      }
      
      console.log('🎯 toggleRackDropdown result:', {
        activeRackDropdown: activeRackDropdown.value,
        selectedRackForItem: selectedRackForItem.value
      })
    }

    /**
     * เลือก rack สำหรับ item (ขั้นตอนที่ 1)
     */
    const selectRackForItem = (itemIndex, rack) => {
      console.log('🎯 Before selecting rack:', {
        itemIndex,
        rack,
        currentState: selectedRackForItem.value[itemIndex]
      });
      
      // Use reactive assignment for Vue 3
      selectedRackForItem.value = {
        ...selectedRackForItem.value,
        [itemIndex]: rack
      }
      
      console.log('✅ After selecting rack:', {
        itemIndex,
        rack: rack.name,
        newState: selectedRackForItem.value[itemIndex],
        allStates: { ...selectedRackForItem.value }
      });
    }

    /**
     * กลับไปเลือก rack ใหม่ (จากขั้นตอนที่ 2 กลับไปขั้นตอนที่ 1)
     */
    const goBackToRackSelection = (itemIndex) => {
      // Use reactive assignment for Vue 3
      const newState = { ...selectedRackForItem.value }
      delete newState[itemIndex]
      selectedRackForItem.value = newState
    }

    /**
     * สร้าง full rack position string (รวม rack + position)
     */
    const getFullRackPosition = (rack, position) => {
      if (!rack || !position) return ''
      return `${rack.id}-${position.id}` // เช่น "RACK-L-A1", "RACK-R-B2"
    }

    /**
     * เลือก rack position จาก dropdown - บันทึกทันที (ขั้นตอนที่ 2)
     */
    const selectRackPosition = (position, item, itemIndex) => {
      const selectedRack = selectedRackForItem.value[itemIndex]
      if (!selectedRack) return
      
      const fullPosition = getFullRackPosition(selectedRack, position)
      item.rack_position = fullPosition
      
      console.log('✅ Full rack position selected:', fullPosition)
      
      // Reset rack selection for this item after position is selected
      const newState = { ...selectedRackForItem.value }
      delete newState[itemIndex]
      selectedRackForItem.value = newState
      
      // Close dropdown after a short delay to let user see the result
      setTimeout(() => {
        activeRackDropdown.value = null
        console.log('🔽 Dropdown closed after position selection')
      }, 500) // 0.5 second delay
    }

    /**
     * บันทึก rack position
     */
    const saveRackPosition = async () => {
      // เซฟค่าไว้ก่อนจะปิด modal (เพราะ closeRackModal จะ set currentRackItem.value = null)
      if (!currentRackItem.value) {
        alert('ไม่พบข้อมูลสินค้า กรุณาเลือกใหม่')
        return
      }

      const selectedPosition = currentRackItem.value.rack_position
      const itemIndex = currentRackItemIndex.value

      if (!selectedPosition) {
        alert('กรุณาเลือก Rack Position')
        return
      }

      // อัปเดตข้อมูลในรายการสินค้าหลัก
      if (selectedPO.value && selectedPO.value.items && itemIndex !== null) {
        // Add null check and safety check
        if (itemIndex >= 0 && itemIndex < selectedPO.value.items.length) {
          selectedPO.value.items[itemIndex].rack_position = selectedPosition
          
          console.log('✅ Rack position saved:', selectedPosition)
        } else {
          console.error('❌ Invalid itemIndex:', itemIndex)
          alert('เกิดข้อผิดพลาดในการบันทึกตำแหน่ง กรุณาลองใหม่')
          return
        }
      } else {
        console.error('❌ Missing selectedPO or items')
        alert('ไม่พบข้อมูล PO กรุณาลองใหม่')
        return
      }

      // ปิด modal หลังจากบันทึกสำเร็จ
      await closeRackModal()
    }

    /**
     * ปิด modal เลือก rack position
     */
    const closeRackModal = async () => {
      showRackModal.value = false
      await nextTick()
      currentRackItem.value = null
      currentRackItemIndex.value = null
    }

    const processGoodsReceipt = async () => {
      // ป้องกัน double submission
      if (processingReceipt.value) {
        console.warn('Already processing, ignoring duplicate submission')
        return
      }

      if (!selectedPO.value || !canProcessReceipt.value) {
        alert('กรุณาตรวจสอบข้อมูลการรับเข้าสินค้า และตรวจสอบว่าสินค้าทุกรายการมี Product ID และ Rack Position')
        return
      }

      // 🔥 ตรวจสอบว่าสินค้าทุกรายการมี rack_position
      const itemsWithoutRack = selectedPO.value.items.filter(item => 
        item.received_quantity > 0 && item.location && item.product_id && !item.rack_position
      )

      if (itemsWithoutRack.length > 0) {
        const skuList = itemsWithoutRack.map(item => item.sku || item.product_name).join(', ')
        alert(`❌ สินค้าต่อไปนี้ยังไม่มี Rack Position:\n\n${skuList}\n\nกรุณาเลือก Rack Position ให้ครบทุกรายการ`)
        return
      }

      // Set processing state ก่อนทำอะไรอื่น
      processingReceipt.value = true
      
      // Force close all UI components ทันทีเพื่อป้องกัน DOM conflicts
      activeRackDropdown.value = null
      showRackModal.value = false
      showLotModal.value = false
      selectedRackForItem.value = {}
      
      // รอให้ Vue จัดการ DOM ก่อน
      await nextTick()
      
      try {
        console.log('🔄 [GoodsReceipt] Processing goods receipt via InventoryService...')
        
        // ✅ Prepare goods receipt data for InventoryService
        const goodsReceiptData = {
          purchase_order_id: selectedPO.value.id,
          po_number: selectedPO.value.po_number || selectedPO.value.purchase_request_code,
          received_date: receiptForm.value.date,
          received_by: receiptForm.value.received_by,
          notes: receiptForm.value.notes,
          items: selectedPO.value.items.filter(item => 
            item.received_quantity > 0 && item.location && item.product_id && item.rack_position
          ).map(item => ({
            ...item,
            unit: mapUnitToThai(item.unit),
            category: normalizeCategory(item.category || 'general'),
            // 🔥 เพิ่มข้อมูล rack position
            rack_position: item.rack_position,
            rack_id: selectedRack.value.id,
            // 🔥 เพิ่มข้อมูล lots หากมี (สำหรับสินค้าผ้า)
            lots: item.lots || null,
            // 🔥 เพิ่ม flag ระบุว่าเป็น textile product หรือไม่
            is_textile: isTextileProduct(item),
            // 🔥 เพิ่มข้อมูลสำหรับการติดตาม lot
            lot_tracking_enabled: isTextileProduct(item) && item.lots && item.lots.length > 0
          }))
        }

        console.log('[GoodsReceipt] Goods receipt data:', goodsReceiptData)

        // ✅ Process goods receipt using InventoryService
        const results = await inventoryService.processGoodsReceipt(goodsReceiptData)
        
        console.log('✅ [GoodsReceipt] Results from InventoryService:', results)

        // ✅ Update PO status to complete via InventoryService
        const poUpdateData = {
          notes: receiptForm.value.notes || 'รับเข้าสินค้าครบถ้วนแล้ว',
          updated_by: receiptForm.value.received_by
        }
        
        await inventoryService.updatePurchaseOrderStatus(selectedPO.value.id, 'complete', poUpdateData)
        
        console.log(`✅ [GoodsReceipt] PO ${selectedPO.value.po_number || selectedPO.value.id} updated to status: complete`)

        // ✅ Show success message with detailed results
        const errorCount = results.errors.length
        const lotRecordsCount = results.lotRecords?.length || 0
        
        let successMessage = '🎉 รับเข้าสินค้าเรียบร้อยแล้ว!\n\n'
        successMessage += `📊 สรุปผลการประมวลผล:\n`
        successMessage += `• Inventory Items: ${results.inventoryItems.length} records\n`
        successMessage += `• Stock Movements: ${results.stockMovements.length} records\n`
        successMessage += `• Balance Updates: ${results.balanceUpdates.length} records\n`
        
        if (lotRecordsCount > 0) {
          successMessage += `• Lot Records: ${lotRecordsCount} lots tracked\n`
        }
        
        if (errorCount > 0) {
          successMessage += `• ข้อผิดพลาด: ${errorCount} รายการ\n`
          successMessage += '\nรายการที่มีข้อผิดพลาด:\n'
          results.errors.forEach(error => {
            successMessage += `  - ${error.item}: ${error.error}\n`
          })
        }
        
        successMessage += `\n✅ Purchase Order สถานะ: Complete`
        
        // 🔧 COMPLETE ISOLATION - ป้องกัน DOM conflicts อย่างสมบูรณ์
        console.log('🔧 [GoodsReceipt] Starting COMPLETE DOM isolation reset...')
        
        // Step 1: หยุด processing และปิด UI components ทันที
        processingReceipt.value = false
        activeRackDropdown.value = null
        showRackModal.value = false
        showLotModal.value = false
        selectedRackForItem.value = {}
        
        // Step 2: รอให้ DOM stabilize
        await nextTick()
        await nextTick() // Double nextTick for safety
        
        // Step 3: แสดงผลลัพธ์
        setTimeout(() => {
          alert(successMessage)
          
          // Step 4: Complete reset หลังจาก alert ปิด (user เสร็จจากอ่าน)
          setTimeout(() => {
            console.log('🔧 [GoodsReceipt] Performing complete page reset...')
            
            // ใช้ window.location.reload() เพื่อให้แน่ใจว่าไม่มี DOM conflicts
            window.location.reload()
            
          }, 500) // รอครึ่งวินาทีหลังจาก alert ปิด
          
        }, 100) // รอ DOM stable ก่อนแสดง alert
        
      } catch (error) {
        console.error('❌ [GoodsReceipt] Error processing goods receipt via InventoryService:', error)
        
        // ปิด processing state ทันที
        processingReceipt.value = false
        
        // ปิด UI components เพื่อป้องกัน DOM conflicts
        activeRackDropdown.value = null
        showRackModal.value = false
        showLotModal.value = false
        selectedRackForItem.value = {}
        
        // รอ DOM stabilize ก่อนแสดง error
        await nextTick()
        
        // Show specific error message based on error type
        let errorMessage = 'เกิดข้อผิดพลาดในการรับเข้าสินค้า:\n\n'
        
        if (error.message && error.message.includes('400')) {
          errorMessage += '• ข้อมูลไม่ถูกต้อง - กรุณาตรวจสอบข้อมูลสินค้าและ location\n'
          errorMessage += '• ตรวจสอบว่าสินค้ามี Product ID และเลือก location แล้ว\n'
        } else if (error.message && error.message.includes('network')) {
          errorMessage += '• ปัญหาการเชื่อมต่อเครือข่าย - กรุณาลองใหม่อีกครั้ง\n'
        } else if (error.message && error.message.includes('insertBefore')) {
          errorMessage += '• เกิดข้อผิดพลาดในการแสดงผล - กรุณารีเฟรชหน้าเว็บแล้วลองใหม่\n'
        } else {
          errorMessage += `• ${error.message}\n`
        }
        
        errorMessage += '\n💡 แนะนำ: ตรวจสอบ console log เพื่อดูรายละเอียดเพิ่มเติม'
        
        // แสดง error หลังจาก DOM stable
        setTimeout(() => {
          alert(errorMessage)
          
          // Reload page after error to ensure clean state
          setTimeout(() => {
            console.log('🔄 Reloading page after error...')
            window.location.reload()
          }, 1000)
          
        }, 100)
      }
    }

    // Cancel receipt function
    const cancelReceipt = () => {
      // Safe reset without nextTick to prevent DOM issues
      selectedPO.value = null
      receiptForm.value = {
        date: new Date().toISOString().split('T')[0],
        received_by: 'warehouse_staff',
        notes: ''
      }
    }

    // Status text mapping
    const getStatusText = (status) => {
      const statusMap = {
        'draft': 'ร่าง',
        'approved': 'อนุมัติแล้ว',
        'ready_for_receipt': 'พร้อมรับเข้า',
        'received': 'รับเข้าแล้ว',
        'invoiced': 'วางบิลแล้ว',
        'complete': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก'
      }
      return statusMap[status] || status
    }

    const getStatusBadgeClass = (status) => {
      const classMap = {
        'draft': 'badge-ghost',
        'approved': 'badge-primary',
        'ready_for_receipt': 'badge-info',
        'received': 'badge-warning',
        'invoiced': 'badge-secondary',
        'complete': 'badge-success',
        'cancelled': 'badge-error'
      }
      return classMap[status] || 'badge-ghost'
    }

    // Lifecycle
    onMounted(async () => {
      console.log('🚀 Mounting GoodsReceipt...')
      
      await Promise.all([
        loadApprovedPurchaseOrders(),
        loadStockLocations()
      ])
    })
    
    // Cleanup และ Event Handlers
    onMounted(() => {
      // เพิ่ม event listener สำหรับปิด dropdown เมื่อคลิกข้างนอก
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      // ลบ event listener
      document.removeEventListener('click', handleClickOutside)
    })

    // ฟังก์ชันจัดการ click outside dropdown
    const handleClickOutside = (event) => {
      // ตรวจสอบว่าคลิกข้างนอก dropdown หรือไม่
      if (activeRackDropdown.value !== null) {
        const dropdownElement = document.querySelector('.dropdown-panel')
        const buttonElement = event.target.closest('[data-rack-dropdown]')
        
        if (!dropdownElement?.contains(event.target) && !buttonElement) {
          activeRackDropdown.value = null
        }
      }
    }

    /**
     * Reset Purchase Order Status (Debug Function)
     * เปลี่ยนสถานะ PO กลับเป็น approved เพื่อทดสอบซ้ำ
     */
    const resetPOStatus = async () => {
      if (!selectedPO.value) {
        alert('กรุณาเลือก Purchase Order ก่อน')
        return
      }

      const confirmed = confirm(`ต้องการเปลี่ยนสถานะ PO "${selectedPO.value.po_number || selectedPO.value.id}" กลับเป็น "approved" หรือไม่?\n\nการกระทำนี้เป็นเพื่อการทดสอบเท่านั้น`)
      
      if (!confirmed) return

      try {
        console.log('🔄 [GoodsReceipt] Resetting PO status to approved for testing via InventoryService...')
        
        // ✅ ใช้ InventoryService เพื่ออัปเดตสถานะ Purchase Order
        const additionalData = {
          updated_by: 'debug_user',
          notes: `[DEBUG] Status reset to approved for testing - ${new Date().toLocaleString()}`
        }

        const result = await inventoryService.updatePurchaseOrderStatus(
          selectedPO.value.id,
          'approved',
          additionalData
        )

        if (result) {
          alert(`✅ เปลี่ยนสถานะ PO เป็น "approved" เรียบร้อยแล้ว!\nสามารถทดสอบรับเข้าสินค้าได้อีกครั้ง`)
          
          // อัปเดตข้อมูลใน selectedPO
          selectedPO.value.status = 'approved'
          selectedPO.value.workflow_state = 'approved'
          
          // รีโหลดรายการ PO
          await loadApprovedPurchaseOrders()
        } else {
          throw new Error('Failed to reset PO status')
        }

      } catch (error) {
        console.error('❌ Error resetting PO status:', error)
        alert(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ PO: ${error.message}`)
      }
    }

    /**
     * Check Balance Status (Debug Function)
     * ตรวจสอบสถานะ Balance ปัจจุบัน
     */
    const checkBalanceStatus = async () => {
      try {
        console.log('📊 Checking Balance Status...')
        
        // Get all Balance records
        const balanceResult = await window.ERP_CORE.executeModuleFunction(
          'transactionEngine', 
          'list', 
          'inventory_balance'
        )
        
        console.log('📋 Balance Records:', balanceResult.data)
        
        // Get Product records for reference
        const productResult = await window.ERP_CORE.executeModuleFunction(
          'transactionEngine', 
          'list', 
          'product'
        )
        
        console.log('📦 Product Records:', productResult.data)
        
        // Create summary
        let summary = '📊 Balance Status Summary:\n\n'
        
        if (balanceResult.data && balanceResult.data.length > 0) {
          balanceResult.data.forEach(balance => {
            const product = productResult.data?.find(p => p.id === balance.product_id)
            summary += `🔹 Product: ${balance.product_code} (${product?.product_name || 'Unknown'})\n`
            summary += `   📊 On Hand: ${balance.qty_on_hand || 0}\n`
            summary += `   ✅ Available: ${balance.qty_available || 0}\n`
            summary += `   💰 Cost: ฿${balance.total_cost_value || 0}\n`
            summary += `   🕒 Last Updated: ${balance.updated_date || 'N/A'}\n\n`
          })
        } else {
          summary += 'ไม่พบ Balance Records\n'
        }
        
        alert(summary)
        
      } catch (error) {
        console.error('❌ Error checking balance status:', error)
        alert(`เกิดข้อผิดพลาดในการตรวจสอบ Balance: ${error.message}`)
      }
    }

    /**
     * Clean Balance Records (Debug Function)
     * ลบ Balance records เก่าที่มี schema ผิด
     */
    const cleanBalanceRecords = async () => {
      const confirmed = confirm('ต้องการลบ Balance records ทั้งหมดหรือไม่?\n\nการกระทำนี้จะลบข้อมูล Balance เก่าที่มี schema ผิด เพื่อให้ระบบสร้างใหม่ด้วย schema ที่ถูกต้อง')
      
      if (!confirmed) return

      try {
        console.log('🗑️ Cleaning old Balance records...')
        
        // Get all Balance records
        const balanceResult = await window.ERP_CORE.executeModuleFunction(
          'transactionEngine', 
          'list', 
          'inventory_balance'
        )
        
        if (balanceResult.data && balanceResult.data.length > 0) {
          let deletedCount = 0
          
          for (const balance of balanceResult.data) {
            try {
              await window.ERP_CORE.executeModuleFunction(
                'transactionEngine', 
                'delete', 
                'inventory_balance', 
                balance.id
              )
              console.log(`✅ Deleted balance: ${balance.id} (${balance.product_code})`)
              deletedCount++
            } catch (deleteError) {
              console.error(`❌ Failed to delete balance ${balance.id}:`, deleteError)
            }
          }
          
          alert(`✅ ลบ Balance records เสร็จแล้ว!\n\nลบสำเร็จ: ${deletedCount}/${balanceResult.data.length} records\n\nตอนนี้สามารถทดสอบรับเข้าสินค้าใหม่ เพื่อสร้าง Balance ด้วย schema ที่ถูกต้อง`)
        } else {
          alert('ไม่พบ Balance records ที่ต้องลบ')
        }

      } catch (error) {
        console.error('❌ Error cleaning balance records:', error)
        alert(`เกิดข้อผิดพลาดในการลบ Balance records: ${error.message}`)
      }
    }

    return {
      // ✅ Reactive Data (ขาดตรงนี้!)
      approvedPurchaseOrders,
      selectedPO,
      loadingPurchaseOrders,
      stockLocations,
      processingReceipt,
      receiptForm,
      
      // Lot Management States
      showLotModal,
      currentLotItem,
      currentItemIndex,
      
      // Rack Position States
      showRackModal,
      currentRackItem,
      currentRackItemIndex,
      activeRackDropdown,
      selectedRack,
      rackPositions,
      
      // Computed
      canProcessReceipt,
      
      // Methods
      mapUnitToThai,
      normalizeCategory,
      formatDate,
      loadApprovedPurchaseOrders,
      selectPurchaseOrder,
      validateReceivedQuantity,
      processGoodsReceipt,
      cancelReceipt,
      resetPOStatus,
      checkBalanceStatus,
      cleanBalanceRecords,
      getStatusText,
      getStatusBadgeClass,
      
      // Lot Management Methods
      isTextileProduct,
      configureLots,
      addNewLot,
      removeLot,
      calculateMetersPerKg,
      generateLotId,
      generateFullLotCode,
      updateFullLotCode,
      getTotalLotMeters,
      isLotConfigurationValid,
      saveLotConfiguration,
      closeLotModal,
      
      // Rack Position Methods
      openRackSelector,
      toggleRackDropdown,
      selectRackForItem,
      goBackToRackSelection,
      getFullRackPosition,
      selectRackPosition,
      saveRackPosition,
      closeRackModal,
      handleClickOutside,
      
      // Reactive Data
      availableRacks,
      selectedRackForItem,
      activeRackSelector
    }
  }
}
</script>

<style scoped>
/* Dropdown and overflow fixes */
.overflow-visible {
  overflow: visible !important;
}

.relative {
  position: relative;
  z-index: 1;
}

/* Enhanced z-index management for dropdowns */
.z-dropdown {
  z-index: 9999 !important;
  position: absolute;
}

/* Ensure cards can show dropdowns */
.grid.grid-cols-8 {
  position: relative;
  z-index: 1;
}

/* Force dropdown to appear above everything */
.dropdown-panel {
  position: absolute !important;
  z-index: 10000 !important;
  top: 100% !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-top: 2px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 6px;
  width: 110px;
}

/* Enhanced rack dropdown panel */
.dropdown-panel-rack {
  position: absolute !important;
  z-index: 20000 !important;
  top: 100% !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-top: 4px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  width: 220px;
  max-width: none;
  min-height: 120px;
}

/* Loading animation */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom text size */
.text-xxs {
  font-size: 0.65rem;
  line-height: 1rem;
}

/* Focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style>