<!-- Product Lot Summary Component - Compact Layout -->
<template>
  <div class="product-lot-summary">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p class="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-4">
      <!-- Header with Action Buttons -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 class="text-xl lg:text-2xl font-bold text-gray-800">สรุป Lot ทั้งหมด</h2>
        
        <!-- Action Buttons -->
        <div class="flex flex-row gap-2 flex-shrink-0">
          <button
            @click="openAddLotModal"
            class="px-3 py-2.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            title="เพิ่ม Lot ใหม่"
          >
            <i class="fas fa-plus text-sm"></i>
            <span class="text-sm font-medium">เพิ่ม Lot</span>
          </button>
          <button
            v-if="lotData && lotData.length > 0"
            @click="generateFullLotCodesForAll"
            :disabled="generatingLotCodes"
            class="px-3 py-2.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            title="สร้างรหัส Lot (เต็ม) และบันทึกลงฐานข้อมูล"
          >
            <i class="fas fa-cog text-sm" :class="{ 'fa-spin': generatingLotCodes }"></i>
            <span class="text-sm font-medium">สร้างรหัส</span>
          </button>
          <button
            v-if="lotData && lotData.length > 0"
            @click="showBulkBarcodeModal = true"
            class="px-3 py-2.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            <i class="fas fa-barcode text-sm"></i>
            <span class="text-sm font-medium">พิมพ์บาร์โค๊ด</span>
          </button>
        </div>
      </div>

      <!-- Search Field -->
      <div v-if="lotData && lotData.length > 0" class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาด้วย รหัส Lot (เต็ม), Lot Code, ผู้ใหญ่, หรือ Location..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
          <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="searchQuery = ''"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              title="ล้างการค้นหา"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div v-if="searchQuery && filteredLotData.length > 0" class="mt-2 text-sm text-gray-600">
          <i class="fas fa-info-circle mr-1"></i>
          พบ <span class="font-semibold text-blue-600">{{ filteredLotData.length }}</span> รายการจากทั้งหมด {{ lotData.length }} รายการ
        </div>
        <div v-else-if="searchQuery && filteredLotData.length === 0" class="mt-2 text-sm text-amber-600">
          <i class="fas fa-exclamation-triangle mr-1"></i>
          ไม่พบข้อมูลที่ตรงกับ "{{ searchQuery }}"
        </div>
      </div>

      <!-- Summary Cards Row -->
      <div v-if="lotSummary && lotSummary.totalLots > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <!-- จำนวน Lot รวม -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div class="text-xs text-blue-600 font-medium mb-1">
            <i class="fas fa-layer-group mr-1"></i>
            <span class="hidden sm:inline">Lot รวม</span>
            <span class="sm:hidden">รวม</span>
          </div>
          <div class="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">{{ lotSummary.totalLots || 0 }}</div>
          <div class="text-xs text-blue-600">ม้วน</div>
        </div>

        <!-- ม้วนเต็ม -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div class="text-xs text-green-600 font-medium mb-1">
            <i class="fas fa-circle mr-1"></i>
            เต็ม
          </div>
          <div class="text-xl sm:text-2xl font-bold text-green-700">{{ lotSummary.fullLots || 0 }}</div>
          <div class="text-xs text-green-600">ม้วน</div>
        </div>

        <!-- ม้วนไม่เต็ม -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div class="text-xs text-orange-600 font-medium mb-1">
            <i class="fas fa-circle-half-stroke mr-1"></i>
            <span class="hidden sm:inline">ไม่เต็ม</span>
            <span class="sm:hidden">ไม่เต็ม</span>
          </div>
          <div class="text-xl sm:text-2xl font-bold text-orange-700">{{ lotSummary.partialLots || 0 }}</div>
          <div class="text-xs text-orange-600">ม้วน</div>
        </div>

        <!-- เมตรทั้งหมด -->
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div class="text-xs text-purple-600 font-medium mb-1">
            <i class="fas fa-ruler mr-1"></i>
            <span class="hidden sm:inline">ทั้งหมด</span>
            <span class="sm:hidden">รวม</span>
          </div>
          <div class="text-xl sm:text-2xl font-bold text-purple-700">{{ lotSummary.totalMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-purple-600">ม.</div>
        </div>

        <!-- ติดจองแล้ว (รวม) -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <div class="text-xs text-amber-600 font-medium mb-1">
            <i class="fas fa-lock mr-1"></i>
            จองรวม
          </div>
          <div class="text-xl sm:text-2xl font-bold text-amber-700">{{ lotSummary.totalReservedMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-amber-600">ม.</div>
        </div>

        <!-- จองชั่วคราว (unpaid + deposit) -->
        <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
          <div class="text-xs text-yellow-700 font-medium mb-1">
            <i class="fas fa-clock mr-1"></i>
            <span class="hidden sm:inline">ชั่วคราว</span>
            <span class="sm:hidden">ชั่วคราว</span>
          </div>
          <div class="text-xl sm:text-2xl font-bold text-yellow-800">{{ lotSummary.temporaryReservedMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-yellow-700">ม.</div>
        </div>

        <!-- จองถาวร (paid) -->
        <div class="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
          <div class="text-xs text-red-700 font-medium mb-1">
            <i class="fas fa-lock mr-1"></i>
            <span class="hidden sm:inline">ถาวร</span>
            <span class="sm:hidden">ถาวร</span>
          </div>
          <div class="text-xl sm:text-2xl font-bold text-red-800">{{ lotSummary.permanentReservedMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-red-700">ม.</div>
        </div>

        <!-- พร้อมใช้ -->
        <div class="bg-teal-50 border border-teal-200 rounded-lg p-3 text-center">
          <div class="text-xs text-teal-600 font-medium mb-1">
            <i class="fas fa-check-circle mr-1"></i>
            พร้อม
          </div>
          <div class="text-xl sm:text-2xl font-bold text-teal-700">{{ lotSummary.totalAvailableMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-teal-600">ม.</div>
        </div>

        <!-- น้ำหนักรวม -->
        <div class="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
          <div class="text-xs text-cyan-600 font-medium mb-1">
            <i class="fas fa-weight mr-1"></i>
            <span class="hidden sm:inline">น้ำหนัก</span>
            <span class="sm:hidden">น้ำหนัก</span>
          </div>
          <div class="text-xl sm:text-2xl font-bold text-cyan-700">{{ lotSummary.totalWeight?.toFixed(1) || '0.0' }}</div>
          <div class="text-xs text-cyan-600">กก.</div>
        </div>
      </div>

      <!-- Scrap/Sample/Defective Summary (ถ้ามีข้อมูล) -->
      <div 
        v-if="lotSummary && (lotSummary.scrapMeters > 0 || lotSummary.sampleMeters > 0 || lotSummary.defectiveMeters > 0)" 
        class="grid grid-cols-3 gap-3 mt-3"
      >
        <!-- ของเสีย (Scrap) -->
        <div v-if="lotSummary.scrapMeters > 0" class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div class="text-xs text-red-600 font-medium mb-1">
            <i class="fas fa-trash-alt mr-1"></i>ของเสีย
          </div>
          <div class="text-xl sm:text-2xl font-bold text-red-700">{{ lotSummary.scrapMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-red-600">ม.</div>
        </div>

        <!-- ตัวอย่าง (Sample) -->
        <div v-if="lotSummary.sampleMeters > 0" class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div class="text-xs text-green-600 font-medium mb-1">
            <i class="fas fa-flask mr-1"></i>ตัวอย่าง
          </div>
          <div class="text-xl sm:text-2xl font-bold text-green-700">{{ lotSummary.sampleMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-green-600">ม.</div>
        </div>

        <!-- ชำรุด (Defective) -->
        <div v-if="lotSummary.defectiveMeters > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <div class="text-xs text-amber-600 font-medium mb-1">
            <i class="fas fa-exclamation-circle mr-1"></i>ชำรุด
          </div>
          <div class="text-xl sm:text-2xl font-bold text-amber-700">{{ lotSummary.defectiveMeters?.toFixed(0) || '0' }}</div>
          <div class="text-xs text-amber-600">ม.</div>
        </div>
      </div>

      <!-- Lot Table -->
      <div v-if="lotData && lotData.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <!-- Table Header -->
        <div class="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
          <h3 class="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2 lg:hidden">
            <i class="fas fa-list text-blue-600"></i>
            <span class="hidden sm:inline">รายการ Lot ทั้งหมด</span>
            <span class="sm:hidden">Lot</span>
            <span class="text-sm font-normal text-gray-500">({{ filteredLotData.length }})</span>
          </h3>
          <div class="hidden lg:grid grid-cols-8 gap-4 text-sm font-medium text-gray-700">
            <div>LOT CODE</div>
            <div>รหัส Lot (เต็ม)</div>
            <div>น้ำหนัก/เมตร</div>
            <div>จำนวน (เมตร)</div>
            <div>ผู้ใหญ่</div>
            <div>วันรับ</div>
            <div>PURCHASE ORDER</div>
            <div class="text-center">จัดการ</div>
          </div>
        </div>

        <!-- Table Body - Scrollable on mobile -->
        <div class="divide-y divide-gray-200 overflow-x-auto">
          <div 
            v-for="(lot, index) in filteredLotData" 
            :key="lot.lot_id || lot._id || index"
            class="px-4 sm:px-6 py-4 transition-colors cursor-pointer min-w-max lg:min-w-0"
            :class="{
              'bg-blue-50 border-l-4 border-blue-500': selectedLot?.lot_id === lot.lot_id,
              'hover:bg-gray-50': selectedLot?.lot_id !== lot.lot_id
            }"
            @click="selectLot(lot)"
          >
            <div class="grid grid-cols-8 gap-4 items-center">
              <!-- LOT CODE -->
              <div class="flex items-center space-x-3">
                <img 
                  :src="lot.status === 'full' || lot.status === 'available' || !lot.status ? 
                    'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762599570262.png' : 
                    'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762599569920.png'" 
                  :alt="lot.status === 'full' || lot.status === 'available' || !lot.status ? 'full roll' : 'partial roll'" 
                  class="w-8 h-6 object-contain flex-shrink-0"
                />
                <div>
                  <div class="font-medium text-gray-900">{{ lot.lot_code || '08883' }}</div>
                  <div class="text-xs text-gray-500">จากผู้ขาย</div>
                </div>
              </div>

              <!-- รหัส Lot (เต็ม) -->
              <div>
                <div v-if="lot.full_lot_code" class="font-mono text-sm font-medium text-gray-900">{{ lot.full_lot_code }}</div>
                <div v-else class="flex items-center gap-2">
                  <span class="text-xs text-gray-400 italic">ยังไม่มีรหัส</span>
                  <button
                    @click.stop="generateFullLotCodeForLot(lot)"
                    class="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors flex items-center gap-1"
                    title="สร้างรหัส Lot (เต็ม)"
                  >
                    <i class="fas fa-cog text-xs"></i>
                    สร้าง
                  </button>
                </div>
                <div class="text-xs text-gray-500">รหัสเต็ม</div>
              </div>

              <!-- น้ำหนัก/เมตร/Ratio -->
              <div>
                <div class="text-sm">
                  <span class="font-medium">{{ (lot.weight_kg || 50.0).toFixed(0) }} กก.</span>
                </div>
                <div class="text-xs text-gray-600">{{ (lot.calculated_meters || 166.67).toFixed(0) }} ม.</div>
                <div class="text-xs text-green-600 font-semibold" v-if="lot.meters_per_kg">
                  {{ lot.meters_per_kg.toFixed(2) }} ม./กก.
                </div>
              </div>

              <!-- จำนวน (เมตร) - NEW COLUMN -->
              <div>
                <div class="space-y-1">
                  <!-- ทั้งหมด -->
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">ทั้งหมด:</span>
                    <span class="font-semibold text-blue-900">{{ formatNumber(lot.remaining_meters || lot.calculated_meters || 0) }} ม.</span>
                  </div>
                  
                  <!-- ติดจอง -->
                  <div class="flex items-center justify-between text-sm" v-if="(lot.reserved_meters || 0) > 0">
                    <span class="text-orange-600">ติดจอง:</span>
                    <span class="font-semibold text-orange-700">{{ formatNumber(lot.reserved_meters || 0) }} ม.</span>
                  </div>
                  
                  <!-- จองชั่วคราว -->
                  <div class="flex items-center justify-between text-xs" v-if="(lot.temporary_reserved_meters || 0) > 0">
                    <span class="text-yellow-600">
                      <i class="fas fa-clock mr-1"></i>ชั่วคราว:
                    </span>
                    <span class="font-semibold text-yellow-700">{{ formatNumber(lot.temporary_reserved_meters || 0) }} ม.</span>
                  </div>
                  
                  <!-- จองถาวร -->
                  <div class="flex items-center justify-between text-xs" v-if="(lot.permanent_reserved_meters || 0) > 0">
                    <span class="text-red-600">
                      <i class="fas fa-lock mr-1"></i>ถาวร:
                    </span>
                    <span class="font-semibold text-red-700">{{ formatNumber(lot.permanent_reserved_meters || 0) }} ม.</span>
                  </div>
                  
                  <!-- พร้อมใช้ -->
                  <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-1 mt-1">
                    <span :class="getAvailableStockColor(lot) + ' font-medium'">พร้อมใช้:</span>
                    <span :class="getAvailableStockColor(lot) + ' font-bold'">
                      {{ formatNumber(getLotAvailableMeters(lot)) }} ม.
                    </span>
                  </div>
                </div>
              </div>

              <!-- ผู้ใหญ่ -->
              <div>
                <div class="flex items-center space-x-1">
                  <i class="fas fa-map-marker-alt text-gray-400 text-xs"></i>
                  <span class="text-sm">{{ lot.supplier_name || 'wefwe' }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ lot.location_code || 'WH-01' }}</div>
              </div>

              <!-- วันรับ -->
              <div>
                <div class="text-sm">{{ formatDate(lot.received_date) || '8 พ.ย. 2568' }}</div>
                <div class="flex items-center text-xs text-gray-600">
                  <i class="fas fa-user text-gray-400 mr-1"></i>
                  <span>{{ lot.received_by || 'warehouse_staff' }}</span>
                </div>
              </div>

              <!-- PURCHASE ORDER -->
              <div>
                <div class="font-mono text-xs text-gray-600">
                  {{ lot.purchase_order_id?.substring(0, 16) || '690f08f931a07a0d' }}
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <i class="fas fa-shopping-cart text-gray-400 mr-1"></i>
                  <span>{{ lot.purchase_order_id ? 'มีใบสั่งซื้อ' : 'ไม่มีใบสั่งซื้อ' }}</span>
                </div>
              </div>

              <!-- จัดการ -->
              <div class="flex items-center justify-center gap-2" @click.stop>
                <button
                  @click="openReturnModal(lot)"
                  class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="รับสินค้าคืน/เครม/เปลี่ยนสินค้า"
                >
                  <i class="fas fa-undo text-sm"></i>
                </button>
                <button
                  @click="openCutStockModal(lot)"
                  :disabled="(lot.permanent_reserved_meters || 0) <= 0"
                  class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="(lot.permanent_reserved_meters || 0) > 0 ? 'ตัดสต็อค' : 'ไม่มีการจองที่ชำระแล้ว'"
                >
                  <i class="fas fa-cut text-sm"></i>
                </button>
                <button
                  @click="openReserveLotModal(lot)"
                  :disabled="getLotAvailableMeters(lot) <= 0"
                  class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="getLotAvailableMeters(lot) > 0 ? 'จองสต็อค' : 'ไม่มีสต็อคพร้อมใช้'"
                >
                  <i class="fas fa-lock text-sm"></i>
                </button>
                <button
                  @click="openEditLotModal(lot)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="แก้ไข Lot"
                >
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button
                  v-if="lot.status !== 'deleted'"
                  @click="deleteLot(lot)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="ลบ Lot"
                >
                  <i class="fas fa-trash text-sm"></i>
                </button>
                <button
                  v-else
                  @click="restoreLot(lot)"
                  class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="กู้คืน Lot"
                >
                  <i class="fas fa-undo text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lot Detail Modal - New Component -->
      <LotDetailModal
        :show="!!selectedLot"
        :lot="selectedLot"
        :product-id="productId"
        @close="selectedLot = null"
        @reserve="openReserveLotModal"
        @cut="openCutStockModal"
        @return="openReturnModal"
      />

      <!-- Bulk Barcode Print Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showBulkBarcodeModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="showBulkBarcodeModal = false">
            <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" @click.stop>
              <!-- Modal Header -->
              <div class="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold flex items-center">
                  <i class="fas fa-barcode mr-3"></i>
                  พิมพ์ Barcode ทั้งหมด ({{ lotData.length }} Lots)
                </h3>
                <button 
                  @click="showBulkBarcodeModal = false" 
                  class="text-white hover:text-gray-200 transition-colors p-2 hover:bg-indigo-700 rounded"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Modal Content -->
              <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <!-- Print Button -->
                <div class="mb-4 flex justify-between items-center">
                  <div class="text-sm text-gray-600">
                    <i class="fas fa-info-circle mr-2"></i>
                    คลิก "พิมพ์" เพื่อพิมพ์ Barcode ทั้งหมด หรือคลิกขวาที่รูปเพื่อบันทึก
                  </div>
                  <button
                    @click="printBulkBarcodes"
                    class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <i class="fas fa-print"></i>
                    <span class="font-medium">พิมพ์ทั้งหมด</span>
                  </button>
                </div>

                <!-- Barcode Grid -->
                <div id="bulk-barcode-print-area" class="grid grid-cols-4 gap-4">
                  <div 
                    v-for="(lot, index) in lotData" 
                    :key="lot.lot_id || lot._id || index"
                    class="border-2 border-gray-300 rounded-lg p-4 bg-white"
                  >
                    <!-- QR Code -->
                    <div class="mb-4">
                      <div class="text-center mb-2">
                        <span class="text-xs font-semibold text-gray-700">QR CODE</span>
                      </div>
                      <div class="flex justify-center bg-gray-50 p-3 rounded border border-gray-200">
                        <img 
                          :src="`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lot.full_lot_code || generateLotCode(lot))}&code=QRCode&translate-esc=on&eclevel=L`"
                          alt="QR Code"
                          class="block"
                          style="width: 150px; height: 150px;"
                        />
                      </div>
                    </div>

                    <!-- Barcode -->
                    <div class="mb-3">
                      <div class="flex justify-center bg-gray-50 p-3 rounded border border-gray-200">
                        <img 
                          :src="`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lot.full_lot_code || generateLotCode(lot))}&code=Code128&translate-esc=on`"
                          alt="Barcode"
                          class="block"
                          style="width: 200px; height: 60px;"
                        />
                      </div>
                    </div>

                    <!-- Lot Info -->
                    <div class="border-t border-gray-200 pt-3 space-y-1">
                      <div class="text-center">
                        <div class="text-xs text-gray-500">รหัส Lot (เต็ม)</div>
                        <div class="font-mono text-sm font-bold text-gray-900">{{ lot.full_lot_code || 'ยังไม่มีรหัส' }}</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500">Lot Code</div>
                        <div class="font-medium text-sm text-gray-700">{{ lot.lot_code }}</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-500">จำนวน</div>
                        <div class="font-medium text-sm text-blue-600">{{ formatNumber(lot.remaining_meters || lot.calculated_meters || 0) }} ม.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  @click="showBulkBarcodeModal = false"
                  class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  ปิด
                </button>
                <button
                  @click="printBulkBarcodes"
                  class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Lot Management Modal -->
      <LotManagementModal
        v-model="showLotModal"
        :product-id="productId"
        :product="product"
        :lot-data="editingLot"
        @save="handleLotSave"
        @close="closeLotModal"
      />

      <!-- Reserve Stock Modal - Using New Component -->
      <LotReservationModal
        v-model="showReserveModal"
        :lot="reservingLot"
        :product-id="productId"
        @reserved="handleReserved"
        @close="closeReserveModal"
      />

      <!-- Cut Stock Modal -->
      <LotCutStockModal
        :is-open="showCutStockModal"
        :lot="cuttingLot"
        :paid-reservations="lotPaidReservations"
        @close="closeCutStockModal"
        @cut-stock="handleCutStock"
      />

      <!-- Return Stock Modal -->
      <LotReturnModal
        :show="showReturnModal"
        :lot="returningLot"
        :recent-movements="lotMovements"
        @close="closeReturnModal"
        @returned="handleReturnStock"
      />

      <!-- No Data State -->
      <div v-if="!lotData || lotData.length === 0" class="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <i class="fas fa-database text-amber-600 text-3xl mb-3"></i>
        <h4 class="text-amber-800 font-medium mb-2">ไม่มีข้อมูล Lot</h4>
        <p class="text-amber-700 text-sm">
          สินค้านี้ยังไม่มีการติดตาม lot หรือยังไม่ได้รับสินค้าเข้า
        </p>
        <button
          @click="openAddLotModal"
          class="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <i class="fas fa-plus"></i>
          <span>เพิ่ม Lot แรก</span>
        </button>
      </div>

      <!-- Lot Reservations Panel - Compact -->
      <div v-if="productId" class="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="bg-purple-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
            <i class="fas fa-lock text-xs"></i>
            รายการจองสต็อค
          </h3>
          <button
            @click="loadAllReservations"
            :disabled="loadingReservations"
            class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors flex items-center gap-1"
          >
            <i class="fas fa-sync text-xs" :class="{ 'fa-spin': loadingReservations }"></i>
            <span>{{ loadingReservations ? 'โหลด...' : 'รีเฟรช' }}</span>
          </button>
        </div>

        <div class="p-3">
          <div v-if="allReservations.length === 0" class="text-center py-6 text-gray-500">
            <i class="fas fa-inbox text-3xl mb-2"></i>
            <p class="text-sm">ไม่มีรายการจอง</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="reservation in allReservations"
              :key="reservation._id"
              class="border rounded-lg p-3 hover:shadow-sm transition-shadow"
              :class="{
                'border-green-300 bg-green-50': reservation.payment_status === 'paid',
                'border-blue-300 bg-blue-50': reservation.payment_status === 'deposit',
                'border-gray-300 bg-white': reservation.payment_status === 'unpaid'
              }"
            >
              <div class="flex items-start justify-between gap-3">
                <!-- Reservation Info - Compact -->
                <div class="flex-1 min-w-0">
                  <!-- Header: Lot + Badges -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="font-semibold text-sm text-gray-900">Lot {{ reservation.lot_code }}</span>
                    
                    <!-- Payment Status -->
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap" :class="{
                      'bg-green-100 text-green-700': reservation.payment_status === 'paid',
                      'bg-blue-100 text-blue-700': reservation.payment_status === 'deposit',
                      'bg-gray-100 text-gray-700': reservation.payment_status === 'unpaid'
                    }">
                      {{ reservation.payment_status === 'paid' ? 'ชำระแล้ว' : 
                         reservation.payment_status === 'deposit' ? 'มัดจำ' : 'ยังไม่ชำระ' }}
                    </span>

                    <!-- Type -->
                    <span class="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 whitespace-nowrap">
                      {{ reservation.reservation_type === 'whole_roll' ? 'ทั้งม้วน' : 'เป็นเมตร' }}
                    </span>
                  </div>

                  <!-- Details: One line -->
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span class="font-semibold text-purple-700">{{ formatNumber(reservation.reserved_meters) }} ม.</span>
                    <span v-if="reservation.reserved_weight_kg">{{ formatNumber(reservation.reserved_weight_kg) }} กก.</span>
                    <span v-if="reservation.customer_name" class="truncate max-w-[150px]">{{ reservation.customer_name }}</span>
                    <span>{{ formatDate(reservation.reserved_date) }}</span>
                    <span v-if="reservation.expiry_date" class="text-orange-600">
                      <i class="fas fa-clock"></i> {{ formatDate(reservation.expiry_date) }}
                    </span>
                  </div>

                  <!-- Notes (if any) -->
                  <div v-if="reservation.notes" class="text-xs text-gray-500 mt-1 truncate">
                    {{ reservation.notes }}
                  </div>
                </div>

                <!-- Action Buttons - Compact -->
                <div class="flex gap-1">
                  <!-- ปุ่มยืนยันชำระเงิน -->
                  <button
                    v-if="reservation.payment_status !== 'paid'"
                    @click="confirmPayment(reservation)"
                    class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors whitespace-nowrap"
                    title="ยืนยันชำระเงิน"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>

                  <!-- ปุ่มอัพเดตสถานะ -->
                  <button
                    v-if="reservation.payment_status !== 'paid'"
                    @click="updatePaymentStatus(reservation)"
                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors whitespace-nowrap"
                    title="เปลี่ยนสถานะ"
                  >
                    <i class="fas fa-edit"></i>
                  </button>

                  <!-- ปุ่มยกเลิก -->
                  <button
                    v-if="reservation.payment_status !== 'paid'"
                    @click="cancelReservation(reservation)"
                    class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors whitespace-nowrap"
                    title="ยกเลิกการจอง"
                  >
                    <i class="fas fa-times-circle"></i>
                  </button>

                  <!-- แสดงสถานะ paid -->
                  <div v-if="reservation.payment_status === 'paid'" class="text-xs text-green-700 font-medium px-2">
                    <i class="fas fa-lock"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Section: Stock Movements & Inventory Balance -->
      <div v-if="productId" class="mt-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-database text-blue-600"></i>
            ข้อมูล Debug: Stock Movements & Inventory Balance
            <span v-if="selectedLot" class="text-sm font-normal text-gray-600">
              (Lot: {{ selectedLot.lot_code }})
            </span>
          </h3>
          <div class="flex gap-2">
            <button
              v-if="selectedLot"
              @click="loadDebugData(selectedLot)"
              :disabled="loadingDebug"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <i class="fas fa-filter" :class="{ 'fa-spin': loadingDebug }"></i>
              <span>{{ loadingDebug ? 'กำลังโหลด...' : 'Lot นี้' }}</span>
            </button>
            <button
              @click="loadDebugData(null)"
              :disabled="loadingDebug"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <i class="fas fa-sync" :class="{ 'fa-spin': loadingDebug }"></i>
              <span>{{ loadingDebug ? 'กำลังโหลด...' : (selectedLot ? 'ทั้งหมด' : 'โหลดข้อมูล') }}</span>
            </button>
          </div>
        </div>

        <!-- Stock Movements -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b border-gray-200">
            <h4 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
              <i class="fas fa-exchange-alt"></i>
              Stock Movements ({{ stockMovements.length }} รายการ)
            </h4>
          </div>
          <div class="p-4">
            <div v-if="stockMovements.length === 0" class="text-center py-8 text-gray-500">
              <i class="fas fa-inbox text-4xl mb-2"></i>
              <p>ไม่มีข้อมูล Stock Movements</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left">วันที่</th>
                    <th class="px-3 py-2 text-left">ประเภท</th>
                    <th class="px-3 py-2 text-left">Lot Code</th>
                    <th class="px-3 py-2 text-right">จำนวน</th>
                    <th class="px-3 py-2 text-right">มูลค่า</th>
                    <th class="px-3 py-2 text-left">Location</th>
                    <th class="px-3 py-2 text-left">Reference</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(movement, idx) in stockMovements" :key="movement._id || idx" class="hover:bg-gray-50">
                    <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(movement.movement_date) }}</td>
                    <td class="px-3 py-2">
                      <span class="px-2 py-1 rounded text-xs font-medium" :class="{
                        'bg-green-100 text-green-800': movement.movement_type?.toUpperCase() === 'IN',
                        'bg-red-100 text-red-800': movement.movement_type?.toUpperCase() === 'OUT',
                        'bg-blue-100 text-blue-800': movement.movement_type?.toUpperCase() === 'ADJUST'
                      }">
                        {{ movement.movement_type?.toUpperCase() }}
                      </span>
                    </td>
                    <td class="px-3 py-2 font-mono text-xs">{{ movement.lot_code || '-' }}</td>
                    <td class="px-3 py-2 text-right font-medium">{{ formatNumber(movement.quantity || movement.quantity_meters || 0) }} {{ movement.unit }}</td>
                    <td class="px-3 py-2 text-right">{{ movement.total_value ? formatCurrency(movement.total_value) : '-' }}</td>
                    <td class="px-3 py-2">{{ movement.location_code || '-' }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600">{{ movement.reference_number || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Inventory Balance -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-gray-200">
            <h4 class="text-sm font-semibold text-green-900 flex items-center gap-2">
              <i class="fas fa-balance-scale"></i>
              Inventory Balance
              <span v-if="inventoryBalance?._filtered_by_lot" class="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                <i class="fas fa-filter mr-1"></i>
                กรองตาม Lot: {{ inventoryBalance._filtered_by_lot }}
              </span>
            </h4>
          </div>
          <div class="p-4">
            <div v-if="!inventoryBalance" class="text-center py-8 text-gray-500">
              <i class="fas fa-inbox text-4xl mb-2"></i>
              <p>ไม่มีข้อมูล Inventory Balance</p>
            </div>
            <div v-else class="space-y-4">
              <!-- Summary Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-blue-50 border border-blue-200 rounded p-3">
                  <div class="text-xs text-blue-600 font-medium mb-1">คงเหลือ</div>
                  <div class="text-2xl font-bold text-blue-700">{{ formatNumber(inventoryBalance.qty_on_hand || 0) }}</div>
                  <div class="text-xs text-blue-600">{{ inventoryBalance.unit }}</div>
                </div>
                <div class="bg-green-50 border border-green-200 rounded p-3">
                  <div class="text-xs text-green-600 font-medium mb-1">พร้อมใช้</div>
                  <div class="text-2xl font-bold text-green-700">{{ formatNumber(inventoryBalance.qty_available || 0) }}</div>
                  <div class="text-xs text-green-600">{{ inventoryBalance.unit }}</div>
                </div>
                <div class="bg-orange-50 border border-orange-200 rounded p-3">
                  <div class="text-xs text-orange-600 font-medium mb-1">จอง</div>
                  <div class="text-2xl font-bold text-orange-700">{{ formatNumber(inventoryBalance.qty_reserved || 0) }}</div>
                  <div class="text-xs text-orange-600">{{ inventoryBalance.unit }}</div>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded p-3">
                  <div class="text-xs text-purple-600 font-medium mb-1">มูลค่ารวม</div>
                  <div class="text-xl font-bold text-purple-700">{{ formatCurrency(inventoryBalance.total_cost_value || 0) }}</div>
                  <div class="text-xs text-purple-600">THB</div>
                </div>
              </div>

              <!-- Lot Details Table -->
              <div v-if="inventoryBalance.lot_details && inventoryBalance.lot_details.length > 0">
                <h5 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i class="fas fa-list"></i>
                  Lot Details ({{ inventoryBalance.lot_details.length }} Lots)
                </h5>
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-3 py-2 text-left">Lot Code</th>
                        <th class="px-3 py-2 text-right">คงเหลือ</th>
                        <th class="px-3 py-2 text-right">พร้อมใช้</th>
                        <th class="px-3 py-2 text-right">จอง</th>
                        <th class="px-3 py-2 text-left">Location</th>
                        <th class="px-3 py-2 text-right">น้ำหนัก</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="(lot, idx) in inventoryBalance.lot_details" :key="lot.lot_id || idx" class="hover:bg-gray-50">
                        <td class="px-3 py-2 font-mono text-xs">{{ lot.full_lot_code || lot.lot_code }}</td>
                        <td class="px-3 py-2 text-right font-medium">{{ formatNumber(lot.qty_on_hand || 0) }}</td>
                        <td class="px-3 py-2 text-right text-green-700 font-medium">{{ formatNumber(lot.qty_available || 0) }}</td>
                        <td class="px-3 py-2 text-right text-orange-700">{{ formatNumber(lot.qty_reserved || 0) }}</td>
                        <td class="px-3 py-2 text-xs">{{ lot.location_code }} {{ lot.rack_position }}</td>
                        <td class="px-3 py-2 text-right">{{ (lot.weight_kg || 0).toFixed(2) }} kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Raw JSON Data -->
              <details class="mt-4">
                <summary class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  <i class="fas fa-code mr-2"></i>ดูข้อมูล JSON แบบเต็ม
                </summary>
                <pre class="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs overflow-auto max-h-96">{{ JSON.stringify(inventoryBalance, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import LotManagementModal from './LotManagementModal.vue'
import LotReservationModal from './LotReservationModal.vue'
import LotCutStockModal from './LotCutStockModal.vue'
import LotReturnModal from './LotReturnModal.vue'
import LotDetailModal from './LotDetailModal.vue'

export default {
  name: 'ProductLotSummary',
  components: {
    LotManagementModal,
    LotReservationModal,
    LotCutStockModal,
    LotReturnModal,
    LotDetailModal
  },
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // Router
    const router = useRouter()
    
    // State
    const loading = ref(false)
    const product = ref(null)
    const lotData = ref([])
    const selectedLot = ref(null) // For showing detailed lot information
    const lotReservations = ref([]) // Reservations for selected lot only
    const loadingReservations = ref(false) // Loading state for reservations
    const showBulkBarcodeModal = ref(false) // Bulk barcode print modal
    const generatingLotCodes = ref(false) // Loading state for generating full lot codes
    const searchQuery = ref('') // Search query for filtering lots
    
    // Lot Management States
    const showLotModal = ref(false)
    const editingLot = ref(null)
    
    // Reservation States
    const showReserveModal = ref(false)
    const reservingLot = ref(null)
    
    // Cut Stock States
    const showCutStockModal = ref(false)
    const cuttingLot = ref(null)
    const lotPaidReservations = ref([])
    
    // Return Stock States
    const showReturnModal = ref(false)
    const returningLot = ref(null)
    
    // Reservation Management States
    const allReservations = ref([])
    
    // Debug States
    const loadingDebug = ref(false)
    const stockMovements = ref([])
    const inventoryBalance = ref(null)
    
    // Lot-specific Debug States (for modal)
    const loadingLotMovements = ref(false)
    const loadingLotBalance = ref(false)
    const lotMovements = ref([])
    const lotBalance = ref(null)
    
    // Computed: Get reservations for the selected lot
    const selectedLotReservations = computed(() => {
      // Simply return the loaded reservations (already filtered for this lot)
      return lotReservations.value || []
    })

    // Computed: Filtered lot data based on search query
    const filteredLotData = computed(() => {
      if (!searchQuery.value || searchQuery.value.trim() === '') {
        return lotData.value
      }

      const query = searchQuery.value.toLowerCase().trim()
      
      return lotData.value.filter(lot => {
        // Search in full_lot_code
        if (lot.full_lot_code && lot.full_lot_code.toLowerCase().includes(query)) {
          return true
        }
        
        // Search in lot_code
        if (lot.lot_code && lot.lot_code.toLowerCase().includes(query)) {
          return true
        }
        
        // Search in supplier_name
        if (lot.supplier_name && lot.supplier_name.toLowerCase().includes(query)) {
          return true
        }
        
        // Search in location_code
        if (lot.location_code && lot.location_code.toLowerCase().includes(query)) {
          return true
        }
        
        // Search in purchase_order_id
        if (lot.purchase_order_id && lot.purchase_order_id.toLowerCase().includes(query)) {
          return true
        }
        
        return false
      })
    })

    // Computed lot summary
    const lotSummary = computed(() => {
      if (!lotData.value || !Array.isArray(lotData.value)) {
        return {
          totalWeight: 0,
          totalMeters: 0,
          totalReservedMeters: 0,
          temporaryReservedMeters: 0,
          permanentReservedMeters: 0,
          totalAvailableMeters: 0,
          totalLots: 0,
          fullLots: 0,
          partialLots: 0,
          emptyLots: 0,
          activeLots: 0,
          scrapMeters: 0,
          sampleMeters: 0,
          defectiveMeters: 0
        }
      }

      const summary = lotData.value.reduce((acc, lot) => {
        if (!lot) return acc

        // รวมข้อมูลทั้งหมด
        // ใช้ ?? แทน || เพื่อไม่ให้ค่า 0 ถูกมองว่า falsy
        const remainingMeters = lot.remaining_meters ?? lot.calculated_meters ?? 0
        const reservedMeters = lot.reserved_meters ?? 0
        const temporaryReserved = lot.temporary_reserved_meters ?? 0
        const permanentReserved = lot.permanent_reserved_meters ?? 0
        const availableMeters = remainingMeters - reservedMeters
        
        acc.totalWeight += lot.weight_kg || 0
        acc.totalMeters += remainingMeters
        acc.totalReservedMeters += reservedMeters
        acc.temporaryReservedMeters += temporaryReserved
        acc.permanentReservedMeters += permanentReserved
        acc.totalAvailableMeters += availableMeters
        
        // ✅ เพิ่มการรวม scrap/sample/defective
        acc.scrapMeters += lot.scrap_meters || 0
        acc.sampleMeters += lot.sample_meters || 0
        acc.defectiveMeters += lot.defective_meters || 0
        acc.totalLots += 1

        // นับตามสถานะม้วน
        const status = lot.status || 'full' // ถ้าไม่มีสถานะ ถือว่าเต็มม้วน
        
        if (status === 'full' || status === 'available') {
          acc.fullLots += 1
          acc.activeLots += 1
        } else if (status === 'partial' || status === 'used') {
          acc.partialLots += 1
          acc.activeLots += 1
        } else if (status === 'empty') {
          acc.emptyLots += 1
        } else {
          // สถานะอื่นๆ ถือว่าใช้งานได้
          acc.activeLots += 1
        }

        return acc
      }, {
        totalWeight: 0,
        totalMeters: 0,
        totalReservedMeters: 0,
        temporaryReservedMeters: 0,
        permanentReservedMeters: 0,
        totalAvailableMeters: 0,
        totalLots: 0,
        fullLots: 0,
        partialLots: 0,
        emptyLots: 0,
        activeLots: 0,
        scrapMeters: 0,
        sampleMeters: 0,
        defectiveMeters: 0
      })

      return summary
    })

    // Function to generate proper lot code: "รุ่นสีหน้ากว้างlot_code" (ไม่มี -)
    const generateLotCode = (lot) => {
      if (!lot) return 'ไม่ระบุรหัส'
      
      // Get textile information from product data
      const modelCode = product.value?.model_code || '000'
      const colorCode = product.value?.color_code || '000'
      const fabricWidth = product.value?.fabric_width_cm || '000'
      const lotCode = lot.lot_code || '00000'

      console.log('🔧 [generateLotCode] Debug:', {
        productLoaded: !!product.value,
        productId: product.value?._id,
        modelCode,
        colorCode, 
        fabricWidth,
        lotCode,
        rawProduct: product.value
      })

      // Format: modelcode+colorcode+width+lotcode (ไม่มี -)
      const formattedLotCode = `${modelCode}${colorCode}${String(fabricWidth).padStart(3, '0')}${lotCode}`
      console.log('🏷️ [generateLotCode] Final lot code:', formattedLotCode)
      
      return formattedLotCode
    }

    // Load Product Data
    const loadProductAndLots = async () => {
      loading.value = true
      
      try {
        console.log('🔍 [ProductLotSummary] Loading data for product:', props.productId)
        
        // Load product data first to get textile information (model_code, color_code, fabric_width_cm)
        try {
          const productResult = await window.ERP_CORE.inventory.getProduct(props.productId)
          if (productResult) {
            product.value = productResult
            console.log('📦 [ProductLotSummary] Product data loaded:', product.value)
            console.log('📦 [ProductLotSummary] Textile info:', {
              model_code: product.value.model_code,
              color_code: product.value.color_code,
              fabric_width_cm: product.value.fabric_width_cm,
              is_textile: product.value.is_textile
            })
          } else {
            console.warn('⚠️ [ProductLotSummary] No product data received')
          }
        } catch (productError) {
          console.error('❌ [ProductLotSummary] Error loading product data:', productError)
          product.value = null
        }

        // Use InventoryService method to get lot tracking data
        const lotTrackingResult = await window.ERP_CORE.inventory.getLotTracking(props.productId)
        
        console.log('📊 [ProductLotSummary] Raw lot data:', lotTrackingResult)
        
        if (lotTrackingResult && Array.isArray(lotTrackingResult)) {
          // Sort lots by received date (newest first) and then by lot_code
          lotData.value = lotTrackingResult.sort((a, b) => {
            const dateA = new Date(a.received_date || a.created_at || 0)
            const dateB = new Date(b.received_date || b.created_at || 0)
            if (dateB - dateA !== 0) return dateB - dateA
            return (a.lot_code || '').localeCompare(b.lot_code || '')
          })
          
          console.log('✅ [ProductLotSummary] Loaded', lotData.value.length, 'lots')
          console.log('📊 [ProductLotSummary] Sorted lot data:', lotData.value)
          
          // Generate QR codes and barcodes after data is loaded
          setTimeout(() => {
            generateAllCodes()
          }, 500)
        } else {
          console.log('⚠️ [ProductLotSummary] No lot data found')
          lotData.value = []
        }
        
      } catch (err) {
        console.error('❌ [ProductLotSummary] Error loading data:', err)
        lotData.value = []
        
        // Show user-friendly error message
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูล Lot ได้: ' + err.message)
        }
      } finally {
        loading.value = false
      }
    }

    // Load lot reservations for a specific lot
    const loadLotReservations = async (lot) => {
      if (!lot || (!lot._id && !lot.lot_id)) {
        console.warn('⚠️ No lot provided to load reservations')
        return
      }

      try {
        loadingReservations.value = true
        lotReservations.value = [] // Clear previous reservations
        
        // Use lot_id if available, otherwise fall back to _id
        const lotIdToQuery = lot.lot_id || lot._id
        
        console.log('🔍 [ProductLotSummary] Loading reservations for lot:', {
          lot_id: lotIdToQuery,
          lot_code: lot.lot_code,
          raw_lot: lot
        })
        
        // ✅ ใช้ InventoryService แทนการเรียก API โดยตรง
        if (!window.ERP_CORE?.inventory) {
          console.error('❌ InventoryService not available')
          return
        }

        // ✅ Query โดยใช้ lot_id (ที่เก็บ reference ไปยัง lot_tracking)
        const pipeline = [
          {
            $match: {
              lot_id: lotIdToQuery,  // ✅ Match by lot_id (reference to lot_tracking._id)
              status: { $in: ['not_paid', 'paid'] }
            }
          },
          {
            $lookup: {
              from: 'lot_tracking',
              localField: 'lot_id',
              foreignField: '_id',
              as: 'lot_info'
            }
          }
        ]
        
        console.log('📤 Sending aggregate query:', JSON.stringify(pipeline, null, 2))
        
        const result = await window.ERP_CORE.inventory.apiRequest.POST('lot_reservations/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)
        
        console.log('📊 API Response:', result)
        
        // ✅ รับ array ของ reservations
        if (result && result.data && Array.isArray(result.data)) {
          lotReservations.value = result.data
          console.log(`✅ Loaded ${result.data.length} reservations for lot ${lot.lot_code || lot._id}`)
          
          if (result.data.length > 0) {
            console.log('📋 Sample reservation:', result.data[0])
          }
        } else if (result && Array.isArray(result)) {
          lotReservations.value = result
          console.log(`✅ Loaded ${result.length} reservations (direct array)`)
        } else {
          console.log('⚠️ No reservations found for this lot')
          lotReservations.value = []
        }
        
      } catch (error) {
        console.error('❌ Failed to load reservations:', error)
        lotReservations.value = []
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูลการจองได้')
        }
      } finally {
        loadingReservations.value = false
      }
    }

    // Get reservation status label
    const getReservationStatusLabel = (status) => {
      const labels = {
        'not_paid': 'รอชำระ',
        'paid': 'ชำระแล้ว',
        'cancelled': 'ยกเลิก',
        'expired': 'หมดอายุ'
      }
      return labels[status] || status
    }

    // Load stock movements for a specific lot (for modal)
    const loadLotMovements = async (lot) => {
      if (!lot || (!lot._id && !lot.lot_id)) {
        console.warn('⚠️ No lot provided to load movements')
        return
      }

      try {
        loadingLotMovements.value = true
        lotMovements.value = []
        
        const lotIdToQuery = lot.lot_id || lot._id
        
        console.log('🔍 [loadLotMovements] Loading movements for lot:', {
          lot_id: lotIdToQuery,
          lot_code: lot.lot_code
        })

        if (!window.ERP_CORE?.inventory) {
          console.error('❌ InventoryService not available')
          return
        }

        // Query stock movements for this specific lot
        const pipeline = [
          {
            $match: {
              product_id: props.productId,
              lot_id: lotIdToQuery
            }
          },
          {
            $sort: { movement_date: -1 }
          },
          {
            $limit: 100 // Limit to recent 100 movements
          },
          {
            $project: {
              movement_type: 1,
              transaction_type: 1,
              quantity_meters: 1,
              quantity_kg: 1,
              unit: 1,
              reference_type: 1,
              reference_id: 1,
              reference_number: 1,
              customer_name: 1,
              notes: 1,
              movement_date: 1,
              created_by: 1,
              created_at: 1
            }
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('stock_movements/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        if (result && result.data && Array.isArray(result.data)) {
          lotMovements.value = result.data
          console.log(`✅ Loaded ${result.data.length} movements for lot ${lot.lot_code}`)
        } else if (result && Array.isArray(result)) {
          lotMovements.value = result
          console.log(`✅ Loaded ${result.length} movements`)
        } else {
          console.log('⚠️ No movements found for this lot')
          lotMovements.value = []
        }

      } catch (error) {
        console.error('❌ Failed to load lot movements:', error)
        lotMovements.value = []
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลด Stock Movements ได้')
        }
      } finally {
        loadingLotMovements.value = false
      }
    }

    // Load inventory balance for a specific lot (for modal)
    const loadLotBalance = async (lot) => {
      if (!lot || (!lot._id && !lot.lot_id)) {
        console.warn('⚠️ No lot provided to load balance')
        return
      }

      try {
        loadingLotBalance.value = true
        lotBalance.value = null
        
        const lotIdToQuery = lot.lot_id || lot._id
        
        console.log('🔍 [loadLotBalance] Loading balance for lot:', {
          lot_id: lotIdToQuery,
          lot_code: lot.lot_code
        })

        if (!window.ERP_CORE?.inventory) {
          console.error('❌ InventoryService not available')
          return
        }

        // Query inventory balance for this product
        const pipeline = [
          {
            $match: {
              product_id: props.productId
            }
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        console.log('📊 Balance API Response:', result)

        if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
          const fullBalance = result.data[0]
          
          // Find the specific lot detail
          if (fullBalance.lot_details && Array.isArray(fullBalance.lot_details)) {
            const lotDetail = fullBalance.lot_details.find(
              detail => detail.lot_id === lotIdToQuery || detail.lot_code === lot.lot_code
            )
            
            if (lotDetail) {
              // Create a balance object specific to this lot
              lotBalance.value = {
                product_id: fullBalance.product_id,
                location_code: fullBalance.location_code,
                unit: fullBalance.unit,
                qty_on_hand: lotDetail.qty_available || 0,
                qty_reserved: lotDetail.qty_reserved || 0,
                qty_available: (lotDetail.qty_available || 0) - (lotDetail.qty_reserved || 0),
                total_cost_value: lotDetail.total_cost_value || 0,
                lot_code: lot.lot_code,
                last_updated: fullBalance.last_updated
              }
              
              console.log(`✅ Loaded balance for lot ${lot.lot_code}:`, lotBalance.value)
            } else {
              console.log('⚠️ Lot not found in inventory balance')
              lotBalance.value = null
            }
          }
        } else {
          console.log('⚠️ No balance found for this product')
          lotBalance.value = null
        }

      } catch (error) {
        console.error('❌ Failed to load lot balance:', error)
        lotBalance.value = null
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลด Inventory Balance ได้')
        }
      } finally {
        loadingLotBalance.value = false
      }
    }

    // Open document (Quotation or Invoice)
    const openDocument = (reservation) => {
      console.log('📄 Opening document:', reservation)
      
      if (!reservation.reference_id || !reservation.reference_type) {
        if (window.$toast) {
          window.$toast.warning('ไม่พบข้อมูลเอกสาร')
        }
        return
      }

      // Determine the route based on reference type
      let route = ''
      if (reservation.reference_type === 'quotation') {
        route = `/sales/quotations/${reservation.reference_id}`
      } else if (reservation.reference_type === 'invoice' || reservation.reference_type === 'sales_invoice') {
        route = `/sales/invoices/${reservation.reference_id}`
      } else {
        console.warn('Unknown reference type:', reservation.reference_type)
        if (window.$toast) {
          window.$toast.warning('ไม่รองรับประเภทเอกสารนี้')
        }
        return
      }

      // Navigate to the document using Vue Router
      router.push(route)
    }

    // Format functions for display
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0)
    }

    const formatNumber = (value) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    }

    const getLotAvailableMeters = (lot) => {
      // ใช้ ?? แทน || เพื่อไม่ให้ค่า 0 ถูกมองว่า falsy
      const total = lot.remaining_meters ?? lot.calculated_meters ?? 0
      const reserved = lot.reserved_meters ?? 0
      return total - reserved
    }

    // คำนวณสีตามสถานะสต็อค
    const getAvailableStockColor = (lot) => {
      const available = getLotAvailableMeters(lot)
      const total = lot.remaining_meters ?? lot.calculated_meters ?? 0
      
      if (available <= 0) {
        return 'text-red-600' // สต็อคหมด
      }
      
      if (total > 0 && (available / total) < 0.5) {
        return 'text-orange-600' // เหลือน้อยกว่า 50%
      }
      
      return 'text-green-600' // ปกติ
    }

    // เช็คว่า lot นี้สามารถรับสินค้าคืนได้หรือไม่
    // (ต้องมีการขายออกไปแล้ว และยังคืนไม่หมด)
    const canReturnStock = (lot) => {
      // ถ้าไม่เคยมีการขายเลย ไม่มีอะไรให้คืน
      const totalSold = lot.total_sold_meters ?? 0
      const totalReturned = lot.total_returned_meters ?? 0
      
      // มีของขายออกไป และยังคืนไม่หมด
      return totalSold > 0 && (totalSold - totalReturned) > 0
    }

    // Get reserved meters for a specific lot from a reservation record
    const getLotReservedMetersFromReservation = (reservation, lot) => {
      const lotId = lot.lot_id || lot._id
      
      // Case 1: Single lot reservation
      if (reservation.lot_id === lotId) {
        return reservation.reserved_meters || 0
      }
      
      // Case 2: Multiple lots in reservation
      if (reservation.lots && Array.isArray(reservation.lots)) {
        const lotInReservation = reservation.lots.find(l => 
          l.lot_id === lotId || 
          l._id === lotId ||
          l.lot_code === lot.lot_code
        )
        
        if (lotInReservation) {
          return lotInReservation.reserved_meters || lotInReservation.meters || 0
        }
      }
      
      // Fallback
      return reservation.reserved_meters || 0
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      try {
        return new Date(dateString).toLocaleDateString('th-TH', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    }

    // Status information mapping
    const getStatusInfo = (status) => {
      const statusMap = {
        'active': {
          label: 'พร้อมใช้',
          colorClass: 'bg-green-100 text-green-800',
          dotClass: 'bg-green-500'
        },
        'partial': {
          label: 'ใช้แล้วบางส่วน',
          colorClass: 'bg-yellow-100 text-yellow-800',
          dotClass: 'bg-yellow-500'
        },
        'empty': {
          label: 'ใช้หมดแล้ว',
          colorClass: 'bg-red-100 text-red-800',
          dotClass: 'bg-red-500'
        },
        'reserved': {
          label: 'จองแล้ว',
          colorClass: 'bg-blue-100 text-blue-800',
          dotClass: 'bg-blue-500'
        }
      }

      return statusMap[status] || {
        label: 'ไม่ทราบสถานะ',
        colorClass: 'bg-gray-100 text-gray-800',
        dotClass: 'bg-gray-500'
      }
    }

    // QR Code & Barcode Generation
    // Note: Now using TEC-IT API directly in template for accurate QR/Barcode generation
    const generateAllCodes = () => {
      console.log('ℹ️ QR/Barcode generation using TEC-IT API in modal')
    }

    const generateCodesForLot = () => {
      console.log('ℹ️ QR/Barcode will use TEC-IT API')
    }

    // Print bulk barcodes
    const printBulkBarcodes = () => {
      const lotCodes = lotData.value.map(lot => lot.full_lot_code || generateLotCode(lot))
      
      // Calculate center position
      const width = 700
      const height = 700
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      
      // Open popup window at center
      const printWindow = window.open('', 'PrintWindow', `width=${width},height=${height},left=${left},top=${top}`)
      if (!printWindow) return

      // Generate HTML for all barcodes
      const barcodesHTML = lotCodes.map((lotCode, index) => `
        <div class="barcode-set">
          <div class="qr-code">
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lotCode)}&code=QRCode&translate-esc=on&eclevel=L" 
                 alt="QR Code ${index + 1}" />
          </div>
          <div class="barcode">
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lotCode)}&code=Code128&translate-esc=on" 
                 alt="Barcode ${index + 1}" />
          </div>
          <div class="lot-code">${lotCode}</div>
        </div>
      `).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>พิมพ์ Barcode - ${lotCodes.length} Sets</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                size: 150mm 200mm;
                margin: 0;
              }
              
              html, body {
                width: 150mm;
                height: 200mm;
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
                background: white;
              }
              
              .barcode-set {
                width: 150mm;
                height: 200mm;
                margin: 0;
                padding: 10mm;
                page-break-inside: avoid;
                page-break-after: always;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              
              .barcode-set:last-child {
                page-break-after: avoid;
              }
              
              .qr-code {
                margin-bottom: 15mm;
                text-align: center;
              }
              
              .qr-code img {
                width: 80mm;
                height: 80mm;
                display: block;
                margin: 0 auto;
              }
              
              .barcode {
                margin-bottom: 10mm;
                text-align: center;
              }
              
              .barcode img {
                width: 120mm;
                height: 30mm;
                display: block;
                margin: 0 auto;
              }
              
              .lot-code {
                font-size: 18pt;
                font-weight: bold;
                text-align: center;
                letter-spacing: 2px;
                margin-top: 5mm;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                .barcode-set {
                  page-break-after: always;
                  page-break-inside: avoid;
                }
                
                .barcode-set:last-child {
                  page-break-after: avoid;
                }
              }
            </style>
          </head>
          <body>
            ${barcodesHTML}
          </body>
        </html>
      `)

      printWindow.document.close()
      
      // Wait for images to load, then print and close
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        
        // Close popup after printing dialog is closed
        setTimeout(() => {
          printWindow.close()
        }, 500)
      }, 2000)
    }

    // Generate full lot codes for all lots and save to database
    const generateFullLotCodesForAll = async () => {
      if (!product.value || !lotData.value || lotData.value.length === 0) {
        if (window.$toast) {
          window.$toast.warning('ไม่มีข้อมูล Lot ให้สร้างรหัส')
        }
        return
      }

      generatingLotCodes.value = true

      try {
        console.log('🔧 [generateFullLotCodes] Starting to generate full lot codes for', lotData.value.length, 'lots')

        const modelCode = product.value.model_code || '000'
        const colorCode = product.value.color_code || '000'
        const fabricWidth = product.value.fabric_width_cm || '000'

        let successCount = 0
        let errorCount = 0

        // Process each lot
        for (const lot of lotData.value) {
          try {
            const lotCode = lot.lot_code || '00000'
            const fullLotCode = `${modelCode}${colorCode}${String(fabricWidth).padStart(3, '0')}${lotCode}`

            console.log('📝 Updating lot:', lot._id, 'with full_lot_code:', fullLotCode)

            // Update lot_tracking with full_lot_code
            await window.ERP_CORE.inventory.apiRequest.PUT(
              `lot_tracking/${lot._id}`,
              { data: { full_lot_code: fullLotCode } },
              window.ERP_CORE.inventory.clientKey
            )

            successCount++
          } catch (error) {
            console.error('❌ Error updating lot:', lot._id, error)
            errorCount++
          }
        }

        console.log(`✅ Generated ${successCount} full lot codes, ${errorCount} errors`)

        if (window.$toast) {
          if (errorCount === 0) {
            window.$toast.success(`สร้างรหัส Lot (เต็ม) สำเร็จทั้งหมด ${successCount} รายการ`)
          } else {
            window.$toast.warning(`สร้างรหัสสำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`)
          }
        }

        // Reload lot data to get updated full_lot_code
        await loadProductAndLots()

      } catch (error) {
        console.error('❌ Error generating full lot codes:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการสร้างรหัส Lot')
        }
      } finally {
        generatingLotCodes.value = false
      }
    }

    // Generate full lot code for a single lot
    const generateFullLotCodeForLot = async (lot) => {
      if (!product.value || !lot) {
        if (window.$toast) {
          window.$toast.warning('ไม่สามารถสร้างรหัสได้')
        }
        return
      }

      try {
        const modelCode = product.value.model_code || '000'
        const colorCode = product.value.color_code || '000'
        const fabricWidth = product.value.fabric_width_cm || '000'
        const lotCode = lot.lot_code || '00000'
        const fullLotCode = `${modelCode}${colorCode}${String(fabricWidth).padStart(3, '0')}${lotCode}`

        console.log('📝 Creating full_lot_code for lot:', lot._id, fullLotCode)

            // Update lot_tracking with full_lot_code
            await window.ERP_CORE.inventory.apiRequest.PUT(
              `lot_tracking/${lot._id}`,
              { data: { full_lot_code: fullLotCode } },
              window.ERP_CORE.inventory.clientKey
            )        // Update local data
        lot.full_lot_code = fullLotCode
        
        // If this is the selected lot, update it too
        if (selectedLot.value && selectedLot.value._id === lot._id) {
          selectedLot.value.full_lot_code = fullLotCode
        }

        if (window.$toast) {
          window.$toast.success(`สร้างรหัส Lot (เต็ม) สำเร็จ: ${fullLotCode}`)
        }

        console.log('✅ Full lot code created:', fullLotCode)

      } catch (error) {
        console.error('❌ Error creating full lot code:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการสร้างรหัส')
        }
      }
    }

    // Lot Management Functions
    const openAddLotModal = () => {
      editingLot.value = null
      showLotModal.value = true
    }

    const openEditLotModal = (lot) => {
      editingLot.value = lot
      showLotModal.value = true
    }

    const closeLotModal = () => {
      showLotModal.value = false
      editingLot.value = null
    }

    const handleLotSave = async ({ data, isEdit, originalLot }) => {
      try {
        let result

        if (isEdit && originalLot) {
          // Update existing lot
          result = await window.ERP_CORE.inventory.updateLotTracking(
            originalLot._id,
            data
          )
        } else {
          // ✅ ใช้ฟังก์ชันใหม่ที่สร้าง lot + movement + balance
          console.log('📦 [ProductLotSummary] Creating new lot with full tracking...')
          
          result = await window.ERP_CORE.inventory.receiveGoodsWithLotTracking({
            product_id: data.product_id,
            sku: data.sku,
            product_name: data.product_name,
            lot_code: data.lot_code,
            quantity: data.calculated_meters, // ✅ ใช้ความยาวที่กรอกโดยตรง
            calculated_meters: data.calculated_meters, // ✅ ส่งความยาวไปด้วย
            weight_kg: data.weight_kg,
            meters_per_kg: data.meters_per_kg, // ✅ ส่งค่า meters_per_kg ไปด้วย
            unit_price: product.value?.unit_price || 0,
            location_code: data.location_code,
            rack_position: data.rack_position,
            supplier_name: data.supplier_name,
            received_date: data.received_date,
            received_by: 'warehouse_staff',
            notes: data.notes || ''
          })
          
          console.log('✅ [ProductLotSummary] Lot created with tracking:', result)
        }

        if (result.success) {
          if (window.$toast) {
            window.$toast.success(result.message || 'บันทึกข้อมูล Lot สำเร็จ')
          }
          closeLotModal()
          await loadProductAndLots()
          
          // ✅ โหลดข้อมูล debug ด้วยเพื่อดูผลลัพธ์
          await loadDebugData()
        } else {
          throw new Error(result.error || 'เกิดข้อผิดพลาด')
        }
      } catch (error) {
        console.error('❌ Error saving lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถบันทึก Lot ได้: ' + error.message)
        }
      }
    }

    const deleteLot = async (lot) => {
      const confirmMsg = `ต้องการลบ Lot "${lot.lot_code}" หรือไม่?\n\nข้อมูล:\n- คงเหลือ: ${lot.remaining_meters || lot.calculated_meters || 0} เมตร\n- ใช้ไป: ${lot.used_meters || 0} เมตร\n- จอง: ${lot.reserved_meters || 0} เมตร`
      
      if (!confirm(confirmMsg)) return

      try {
        const result = await window.ERP_CORE.inventory.deleteLotTracking(lot._id)
        
        if (result.success) {
          if (window.$toast) {
            window.$toast.success(result.message)
          }
          await loadProductAndLots()
        } else {
          throw new Error(result.error || 'เกิดข้อผิดพลาด')
        }
      } catch (error) {
        console.error('❌ Error deleting lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถลบ Lot ได้: ' + error.message)
        }
      }
    }

    const restoreLot = async (lot) => {
      if (!confirm(`ต้องการกู้คืน Lot "${lot.lot_code}" หรือไม่?`)) return

      try {
        const result = await window.ERP_CORE.inventory.restoreLotTracking(lot._id)
        
        if (result.success) {
          if (window.$toast) {
            window.$toast.success(result.message)
          }
          await loadProductAndLots()
        } else {
          throw new Error(result.error || 'เกิดข้อผิดพลาด')
        }
      } catch (error) {
        console.error('❌ Error restoring lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถกู้คืน Lot ได้: ' + error.message)
        }
      }
    }

    // ========== RESERVATION FUNCTIONS ==========

    // Open reserve lot modal
    const openReserveLotModal = (lot) => {
      reservingLot.value = lot
      showReserveModal.value = true
    }

    // Close reserve modal
    const closeReserveModal = () => {
      showReserveModal.value = false
      reservingLot.value = null
    }

    // Handle reserved event from LotReservationModal
    const handleReserved = async (data) => {
      console.log('✅ [ProductLotSummary] Reservation completed:', data)
      
      // Reload lot data and debug info
      await loadProductAndLots()
      await loadDebugData()
    }

    // ========== CUT STOCK FUNCTIONS ==========

    // Open cut stock modal
    const openCutStockModal = async (lot) => {
      console.log('✂️ Opening cut stock modal for lot:', lot.lot_code)
      
      cuttingLot.value = lot
      
      // Load paid reservations for this lot
      try {
        const result = await window.ERP_CORE.inventory.apiRequest.POST('lot_reservations/aggregate', {
          pipeline: [
            {
              $match: {
                lot_id: lot._id,
                payment_status: 'paid',
                status: { $in: ['not_paid', 'paid'] } // ยังไม่ถูก complete
              }
            },
            {
              $sort: { reserved_date: -1 }
            }
          ]
        }, window.ERP_CORE.inventory.clientKey)

        lotPaidReservations.value = result?.data || []
        console.log('✅ Loaded', lotPaidReservations.value.length, 'paid reservations')
        
        showCutStockModal.value = true
      } catch (error) {
        console.error('❌ Error loading paid reservations:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดรายการจองได้')
        }
      }
    }

    // Close cut stock modal
    const closeCutStockModal = () => {
      showCutStockModal.value = false
      cuttingLot.value = null
      lotPaidReservations.value = []
    }

    // Handle cut stock
    const handleCutStock = async (cutData) => {
      console.log('✂️ [ProductLotSummary] Cutting stock:', cutData)
      console.log('🔍 Debug - ERP_CORE.inventory:', window.ERP_CORE?.inventory)
      console.log('🔍 Debug - cutLotStock method:', typeof window.ERP_CORE?.inventory?.cutLotStock)
      
      try {
        // ตรวจสอบว่า method มีอยู่หรือไม่
        if (!window.ERP_CORE?.inventory?.cutLotStock) {
          console.error('❌ InventoryService.cutLotStock is not available')
          console.log('Available methods:', Object.keys(window.ERP_CORE?.inventory || {}))
          throw new Error('InventoryService ยังไม่พร้อมใช้งาน กรุณา reload หน้า')
        }

        // Call InventoryService to cut stock
        const result = await window.ERP_CORE.inventory.cutLotStock(cutData)
        
        if (result.success) {
          console.log('✅ Stock cut successfully:', result)
          
          if (window.$toast) {
            window.$toast.success('ตัดสต็อคสำเร็จ')
          }
          
          // Close modal
          closeCutStockModal()
          
          // Reload lot data
          await loadProductAndLots()
          await loadDebugData()
        } else {
          throw new Error(result.message || 'Failed to cut stock')
        }
      } catch (error) {
        console.error('❌ Error cutting stock:', error)
        if (window.$toast) {
          window.$toast.error(`ไม่สามารถตัดสต็อคได้: ${error.message}`)
        }
      }
    }

    // ========== END CUT STOCK FUNCTIONS ==========

    // ========== RETURN STOCK FUNCTIONS ==========

    // Open return stock modal
    const openReturnModal = async (lot) => {
      console.log('🔄 [ProductLotSummary] Opening return modal for lot:', lot)
      returningLot.value = lot
      
      // โหลด movements ของ lot นี้อัตโนมัติ (ง่ายๆ ไม่ต้องให้ user ไปกดโหลด)
      loadingLotMovements.value = true
      try {
        // lot_id ใน stock_movements เก็บเป็น string ของ _id
        const lotIdToQuery = (lot._id && typeof lot._id === 'object' && lot._id.$oid) 
          ? lot._id.$oid 
          : (lot._id || lot.lot_id)
        
        console.log('🔍 Querying movements with lot_id:', lotIdToQuery)
        
        const pipeline = [
          {
            $match: {
              product_id: props.productId,
              lot_id: lotIdToQuery, // ใช้ string ID
              movement_type: { $regex: '^out$', $options: 'i' },
              transaction_type: 'sale'
            }
          },
          {
            $addFields: {
              // คำนวณจำนวนที่สามารถคืนได้ (ขาย - คืนไปแล้ว)
              returnable_meters: {
                $subtract: [
                  { $ifNull: ['$quantity', 0] },
                  { $ifNull: ['$returned_meters', 0] }
                ]
              }
            }
          },
          {
            $match: {
              returnable_meters: { $gt: 0 } // เฉพาะที่ยังคืนได้
            }
          },
          {
            $sort: { movement_date: -1 }
          },
          {
            $limit: 20
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('stock_movements/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        lotMovements.value = result?.data || []
        console.log(`✅ Loaded ${lotMovements.value.length} OUT movements for return modal`)
      } catch (error) {
        console.error('❌ Error loading movements:', error)
        lotMovements.value = []
      } finally {
        loadingLotMovements.value = false
      }
      
      showReturnModal.value = true
    }

    // Close return modal
    const closeReturnModal = () => {
      showReturnModal.value = false
      returningLot.value = null
    }

    // Handle return stock
    const handleReturnStock = async (returnData) => {
      console.log('🔄 [ProductLotSummary] Returning stock:', returnData)
      
      try {
        // ตรวจสอบว่า method มีอยู่หรือไม่
        if (!window.ERP_CORE?.inventory?.returnLotStock) {
          console.error('❌ InventoryService.returnLotStock is not available')
          throw new Error('InventoryService ยังไม่พร้อมใช้งาน กรุณา reload หน้า')
        }

        // Call InventoryService to return stock
        const result = await window.ERP_CORE.inventory.returnLotStock(returnData)
        
        if (result.success) {
          console.log('✅ Stock returned successfully:', result)
          
          if (window.$toast) {
            const returnTypeLabel = returnData.return_type === 'refund' ? 'รับคืนสินค้า (เครม)' :
                                   returnData.return_type === 'exchange' ? 'รับคืนสินค้า (เปลี่ยน)' :
                                   'รับสินค้าของเสีย'
            window.$toast.success(`${returnTypeLabel} สำเร็จ - ${returnData.return_meters} เมตร`)
          }
          
          // Reload lot data
          await loadProductAndLots()
          await loadDebugData()
          
          // Reload movements เพื่อดูสถานะที่อัปเดต (returned_meters)
          if (returningLot.value) {
            loadingLotMovements.value = true
            try {
              const lotIdToQuery = (returningLot.value._id && typeof returningLot.value._id === 'object' && returningLot.value._id.$oid) 
                ? returningLot.value._id.$oid 
                : (returningLot.value._id || returningLot.value.lot_id)
              
              const pipeline = [
                {
                  $match: {
                    product_id: props.productId,
                    lot_id: lotIdToQuery,
                    movement_type: { $regex: '^out$', $options: 'i' },
                    transaction_type: 'sale'
                  }
                },
                {
                  $addFields: {
                    returnable_meters: {
                      $subtract: [
                        { $ifNull: ['$quantity', 0] },
                        { $ifNull: ['$returned_meters', 0] }
                      ]
                    }
                  }
                },
                {
                  $match: {
                    returnable_meters: { $gt: 0 }
                  }
                },
                {
                  $sort: { movement_date: -1 }
                },
                {
                  $limit: 20
                }
              ]

              const result = await window.ERP_CORE.inventory.apiRequest.POST('stock_movements/aggregate', {
                pipeline: pipeline
              }, window.ERP_CORE.inventory.clientKey)

              lotMovements.value = result?.data || []
              console.log(`✅ Reloaded ${lotMovements.value.length} returnable movements`)
              
              // ถ้าไม่มีรายการที่คืนได้แล้ว ให้ปิด modal
              if (lotMovements.value.length === 0) {
                closeReturnModal()
                if (window.$toast) {
                  window.$toast.info('รายการนี้ถูกคืนครบแล้ว ไม่สามารถคืนเพิ่มได้')
                }
              }
            } catch (error) {
              console.error('❌ Error reloading movements:', error)
            } finally {
              loadingLotMovements.value = false
            }
          }
        } else {
          throw new Error(result.message || 'Failed to return stock')
        }
      } catch (error) {
        console.error('❌ Error returning stock:', error)
        
        // แสดง error message ที่ชัดเจน
        let errorMessage = 'ไม่สามารถรับสินค้าคืนได้'
        
        if (error.message) {
          if (error.message.includes('ไม่สามารถคืนได้')) {
            errorMessage = error.message // ใช้ error จาก backend ตรงๆ
          } else if (error.message.includes('ไม่พบรายการขาย')) {
            errorMessage = 'ไม่พบรายการขายที่เลือก กรุณาลองใหม่'
          } else if (error.message.includes('อัปเดตสถานะการคืน')) {
            errorMessage = 'ไม่สามารถบันทึกสถานะการคืนได้ - อาจมีการคืนซ้ำ กรุณาตรวจสอบข้อมูล'
          } else {
            errorMessage = `ไม่สามารถรับสินค้าคืนได้: ${error.message}`
          }
        }
        
        if (window.$toast) {
          window.$toast.error(errorMessage)
        }
        
        // Reload movements เพื่อดูสถานะปัจจุบัน
        if (returningLot.value) {
          await openReturnModal(returningLot.value)
        }
      }
    }

    // ========== END RETURN STOCK FUNCTIONS ==========

    // ========== END RESERVATION FUNCTIONS ==========

    // Select lot and load its reservations
    const selectLot = async (lot) => {
      console.log('🖱️ [selectLot] Clicked on lot:', lot)
      
      // Toggle selection
      if (selectedLot.value?.lot_id === lot.lot_id) {
        console.log('🔄 [selectLot] Toggling off - same lot clicked')
        selectedLot.value = null
        lotReservations.value = []
        // โหลดข้อมูล debug ทั้งหมดเมื่อยกเลิกการเลือก
        await loadDebugData(null)
        return
      }
      
      // Set selected lot
      console.log('✅ [selectLot] Setting selected lot:', lot.lot_code || lot._id)
      selectedLot.value = lot
      
      // Load reservations for this lot
      console.log('📥 [selectLot] Loading reservations for lot...')
      await loadLotReservations(lot)
      console.log('✅ [selectLot] Finished loading reservations')
      
      // โหลดข้อมูล debug เฉพาะ lot นี้
      await loadDebugData(lot)
    }

    // Lock/Unlock body scroll
    const lockBodyScroll = () => {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // Prevent layout shift
    }

    const unlockBodyScroll = () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    // Close modal on ESC key
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && selectedLot.value) {
        selectedLot.value = null
        lotReservations.value = []
      }
    }

    // ========== DEBUG FUNCTIONS ==========
    
    /**
     * Load Stock Movements and Inventory Balance for debugging
     * @param {Object} lot - Lot object to filter data (optional, if not provided shows all product data)
     */
    const loadDebugData = async (lot = null) => {
      if (!props.productId) {
        console.warn('⚠️ No product ID provided')
        return
      }

      loadingDebug.value = true

      try {
        if (lot) {
          console.log('🐛 [ProductLotSummary] Loading debug data for lot:', lot.lot_code)
        } else {
          console.log('🐛 [ProductLotSummary] Loading debug data for product:', props.productId)
        }

        // Load Stock Movements - กรองตาม lot ถ้ามี
        const matchCondition = lot 
          ? { product_id: props.productId, lot_id: lot._id }
          : { product_id: props.productId }

        const movementsResult = await window.ERP_CORE.inventory.apiRequest.POST('stock_movements/aggregate', {
          pipeline: [
            {
              $match: matchCondition
            },
            {
              // เรียงตามเวลาที่สร้างจริง (created_at) แทน movement_date
              // เพราะ movement_date เป็นแค่วันที่ ไม่มีเวลา
              $sort: { created_at: -1 }
            },
            {
              $limit: 50 // จำกัดไว้ 50 รายการล่าสุด
            }
          ]
        }, window.ERP_CORE.inventory.clientKey)

        stockMovements.value = movementsResult?.data || []
        console.log('✅ Loaded', stockMovements.value.length, 'stock movements')

        // Load Inventory Balance
        const balanceResult = await window.ERP_CORE.inventory.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: [
            {
              $match: {
                product_id: props.productId
              }
            }
          ]
        }, window.ERP_CORE.inventory.clientKey)

        const fullBalance = balanceResult?.data?.[0] || null
        
        // ถ้ามี lot ให้กรอง lot_details เฉพาะ lot นั้น
        if (lot && fullBalance?.lot_details) {
          const lotDetail = fullBalance.lot_details.find(
            detail => detail.lot_id === lot._id || detail.lot_code === lot.lot_code
          )
          
          inventoryBalance.value = lotDetail ? {
            ...fullBalance,
            // Override ด้วยข้อมูลเฉพาะ lot นี้
            qty_on_hand: lotDetail.qty_available || 0,
            qty_reserved: lotDetail.qty_reserved || 0,
            qty_available: (lotDetail.qty_available || 0) - (lotDetail.qty_reserved || 0),
            lot_details: [lotDetail],
            _filtered_by_lot: lot.lot_code
          } : null
        } else {
          inventoryBalance.value = fullBalance
        }
        
        console.log('✅ Loaded inventory balance:', inventoryBalance.value)

        if (window.$toast) {
          const message = lot 
            ? `โหลดข้อมูล Debug ของ Lot ${lot.lot_code}: ${stockMovements.value.length} movements`
            : `โหลดข้อมูล Debug สำเร็จ: ${stockMovements.value.length} movements, ${inventoryBalance.value ? '1' : '0'} balance`
          window.$toast.success(message)
        }

      } catch (error) {
        console.error('❌ Error loading debug data:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูล Debug ได้')
        }
      } finally {
        loadingDebug.value = false
      }
    }

    // ========== RESERVATION MANAGEMENT FUNCTIONS ==========

    const loadAllReservations = async () => {
      if (!props.productId) {
        console.warn('⚠️ No product ID provided')
        return
      }

      loadingReservations.value = true

      try {
        console.log('🔄 [ProductLotSummary] Loading all reservations for product:', props.productId)

        const result = await window.ERP_CORE.inventory.apiRequest.POST('lot_reservations/aggregate', {
          pipeline: [
            {
              $match: {
                product_id: props.productId,
                status: { $ne: 'cancelled' } // ไม่เอารายการที่ยกเลิกแล้ว
              }
            },
            {
              $lookup: {
                from: 'lot_tracking',
                localField: 'lot_id',
                foreignField: '_id',
                as: 'lot_info'
              }
            },
            {
              $unwind: {
                path: '$lot_info',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $sort: { reserved_date: -1, created_at: -1 }
            }
          ]
        }, window.ERP_CORE.inventory.clientKey)

        allReservations.value = result?.data || []
        console.log('✅ Loaded', allReservations.value.length, 'reservations')

        if (window.$toast) {
          window.$toast.success(`โหลดรายการจอง ${allReservations.value.length} รายการ`)
        }

      } catch (error) {
        console.error('❌ Error loading reservations:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดรายการจองได้')
        }
      } finally {
        loadingReservations.value = false
      }
    }

    const confirmPayment = async (reservation) => {
      if (!reservation || !reservation._id) {
        console.error('❌ Invalid reservation')
        return
      }

      // ยืนยันการชำระเงินแล้ว
      if (!confirm(`ยืนยันการชำระเงินสำหรับการจอง Lot: ${reservation.lot_info?.full_lot_code || reservation.lot_id}?`)) {
        return
      }

      try {
        console.log('💰 Confirming payment for reservation:', reservation._id)

        const updateData = {
          payment_status: 'paid',
          status: 'paid',
          expiry_date: null, // ชำระแล้วไม่มีวันหมดอายุ
          updated_at: new Date().toISOString()
        }

        await window.ERP_CORE.inventory.apiRequest.PUT(
          `lot_reservations/${reservation._id}`,
          { data: updateData },
          window.ERP_CORE.inventory.clientKey
        )

        console.log('✅ Payment confirmed')
        if (window.$toast) {
          window.$toast.success('ยืนยันการชำระเงินสำเร็จ')
        }

        // Reload lots to get updated reservation data
        await loadProductAndLots()
        await loadAllReservations()

      } catch (error) {
        console.error('❌ Error confirming payment:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถยืนยันการชำระเงินได้')
        }
      }
    }

    const updatePaymentStatus = async (reservation) => {
      if (!reservation || !reservation._id) {
        console.error('❌ Invalid reservation')
        return
      }

      // เลือกสถานะใหม่
      const newStatus = prompt(
        `เปลี่ยนสถานะการชำระเงินสำหรับ Lot: ${reservation.lot_info?.full_lot_code || reservation.lot_id}\n\n` +
        `สถานะปัจจุบัน: ${reservation.payment_status}\n\n` +
        `กรุณาใส่สถานะใหม่:\n` +
        `- unpaid (ยังไม่ชำระ)\n` +
        `- deposit (มีเงินมัดจำ)\n` +
        `- paid (ชำระแล้ว)`,
        reservation.payment_status
      )

      if (!newStatus) return

      const validStatuses = ['unpaid', 'deposit', 'paid']
      if (!validStatuses.includes(newStatus)) {
        if (window.$toast) {
          window.$toast.error('สถานะไม่ถูกต้อง กรุณาเลือก: unpaid, deposit, หรือ paid')
        }
        return
      }

      try {
        console.log('🔄 Updating payment status for reservation:', reservation._id, 'to', newStatus)

        // คำนวณวันหมดอายุใหม่
        let expiryDate = null
        if (newStatus === 'unpaid') {
          expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 วัน
        } else if (newStatus === 'deposit') {
          expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 วัน
        }

        const updateData = {
          payment_status: newStatus,
          status: newStatus === 'paid' ? 'paid' : 'not_paid',
          expiry_date: expiryDate ? expiryDate.toISOString() : null,
          updated_at: new Date().toISOString()
        }

        await window.ERP_CORE.inventory.apiRequest.PUT(
          `lot_reservations/${reservation._id}`,
          { data: updateData },
          window.ERP_CORE.inventory.clientKey
        )

        console.log('✅ Payment status updated')
        if (window.$toast) {
          window.$toast.success(`เปลี่ยนสถานะเป็น ${newStatus} สำเร็จ`)
        }

        // Reload lots to get updated reservation data
        await loadProductAndLots()
        await loadAllReservations()

      } catch (error) {
        console.error('❌ Error updating payment status:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถเปลี่ยนสถานะได้')
        }
      }
    }

    const cancelReservation = async (reservation) => {
      if (!reservation || !reservation._id) {
        console.error('❌ Invalid reservation')
        return
      }

      // ชำระแล้วห้ามยกเลิก
      if (reservation.payment_status === 'paid') {
        if (window.$toast) {
          window.$toast.error('ไม่สามารถยกเลิกการจองที่ชำระเงินแล้ว')
        }
        return
      }

      if (!confirm(
        `ยืนยันการยกเลิกการจอง Lot: ${reservation.lot_info?.full_lot_code || reservation.lot_id}?\n\n` +
        `จำนวน: ${reservation.reserved_meters} เมตร\n` +
        `ลูกค้า: ${reservation.customer_name || '-'}\n\n` +
        `สต็อคจะถูกคืนกลับเข้า Lot`
      )) {
        return
      }

      try {
        console.log('🗑️ Cancelling reservation:', reservation._id)

        // ตรวจสอบว่า method มีอยู่หรือไม่
        if (!window.ERP_CORE?.inventory?.cancelLotReservation) {
          console.error('❌ InventoryService.cancelLotReservation is not available')
          throw new Error('InventoryService ยังไม่พร้อมใช้งาน')
        }

        // เรียก Service เพื่อยกเลิกการจอง
        const result = await window.ERP_CORE.inventory.cancelLotReservation(reservation._id)

        if (result.success) {
          console.log('✅ Reservation cancelled:', result)
          if (window.$toast) {
            window.$toast.success('ยกเลิกการจองสำเร็จ')
          }

          // Reload reservations and lots, then recalculate breakdown
          await loadAllReservations()
          await loadProductAndLots()

        } else {
          throw new Error(result.message || 'Unknown error')
        }

      } catch (error) {
        console.error('❌ Error cancelling reservation:', error)
        if (window.$toast) {
          window.$toast.error(`ไม่สามารถยกเลิกการจองได้: ${error.message}`)
        }
      }
    }

    // ========== END RESERVATION MANAGEMENT FUNCTIONS ==========

    // ========== END DEBUG FUNCTIONS ==========

    // Lifecycle
    onMounted(async () => {
      // Load main product and lots data
      await loadProductAndLots()
      
      // Auto-load reservations, stock movements, and inventory balance
      await Promise.all([
        loadAllReservations(),
        loadDebugData()
      ])
      
      console.log('✅ [ProductLotSummary] All data loaded on mount')
      
      // Add ESC key listener
      window.addEventListener('keydown', handleEscKey)
    })

    // Cleanup
    onUnmounted(() => {
      window.removeEventListener('keydown', handleEscKey)
      // Ensure body scroll is unlocked when component is destroyed
      unlockBodyScroll()
    })

    // Watch for selectedLot changes to manage body scroll
    watch(() => selectedLot.value, (newLot, oldLot) => {
      if (newLot) {
        // Lock body scroll when modal opens
        lockBodyScroll()
        console.log('🔄 Modal opened for lot:', newLot.lot_code)
        console.log('📊 Using TEC-IT API for QR Code and Barcode generation')
      } else if (oldLot) {
        // Unlock body scroll when modal closes
        unlockBodyScroll()
      }
    })

    return {
      // State
      loading,
      loadingReservations,
      product,
      lotData,
      selectedLot,
      lotReservations,
      showBulkBarcodeModal,
      generatingLotCodes,
      searchQuery,
      showLotModal,
      editingLot,
      
      // Reservation State
      showReserveModal,
      reservingLot,
      
      // Cut Stock State
      showCutStockModal,
      cuttingLot,
      lotPaidReservations,
      
      // Reservation Management State
      allReservations,
      
      // Debug State
      loadingDebug,
      stockMovements,
      inventoryBalance,
      
      // Lot-specific Debug State (for modal)
      loadingLotMovements,
      loadingLotBalance,
      lotMovements,
      lotBalance,
      
      // Computed
      lotSummary,
      selectedLotReservations,
      filteredLotData,
      
      // Methods
      loadProductAndLots,
      loadLotReservations,
      selectLot,
      generateLotCode,
      formatCurrency,
      formatNumber,
      formatDate,
      getLotAvailableMeters,
      getAvailableStockColor,
      canReturnStock,
      getLotReservedMetersFromReservation,
      getReservationStatusLabel,
      openDocument,
      getStatusInfo,
      generateAllCodes,
      generateCodesForLot,
      printBulkBarcodes,
      generateFullLotCodesForAll,
      generateFullLotCodeForLot,
      // Lot Management
      openAddLotModal,
      openEditLotModal,
      closeLotModal,
      handleLotSave,
      deleteLot,
      restoreLot,
      // Reservation
      openReserveLotModal,
      closeReserveModal,
      handleReserved,
      // Cut Stock
      openCutStockModal,
      closeCutStockModal,
      handleCutStock,
      // Return Stock
      showReturnModal,
      returningLot,
      openReturnModal,
      closeReturnModal,
      handleReturnStock,
      // Reservation Management
      loadAllReservations,
      confirmPayment,
      updatePaymentStatus,
      cancelReservation,
      // Debug
      loadDebugData,
      loadLotMovements,
      loadLotBalance
    }
  }
}
</script>

<style scoped>
.product-lot-summary {
  width: 100%;
}

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

/* Smooth scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
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
</style>