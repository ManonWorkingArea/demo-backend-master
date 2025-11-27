<template>
  <div>
    <!-- Product Selection Modal -->
    <div v-if="modelValue" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm" @click="closeModal">
      <div class="modal-slide-in bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh] flex flex-col" @click.stop>
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200 flex-shrink-0 bg-white rounded-t-xl">
          <!-- Back Button (Mobile Only - when product selected) -->
          <button 
            v-if="selectedProduct" 
            @click="selectedProduct = null"
            class="md:hidden text-blue-500 hover:text-blue-600 mr-2 transition-colors"
          >
            <i class="fas fa-arrow-left text-lg"></i>
          </button>
          
          <h3 class="text-base md:text-lg font-semibold text-gray-800 m-0 flex-1">
            <i class="fas fa-lock mr-1.5 text-sm md:text-base text-purple-600"></i>
            <span class="hidden sm:inline">เลือกสินค้า - เลือกจาก Lot</span>
            <span class="sm:hidden">{{ selectedProduct ? selectedProduct.product_name : 'เลือกสินค้า' }}</span>
          </h3>
          <button class="text-gray-400 hover:text-gray-600 text-lg md:text-xl p-1 transition-colors" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Modal Body: Split Layout -->
        <div class="grid md:grid-cols-[350px_1fr] flex-1 overflow-hidden">
          <!-- Left Sidebar: Product List -->
          <div 
            class="border-r border-gray-200 flex flex-col bg-gray-50"
            :class="{
              'hidden md:flex': selectedProduct
            }"
          >
            <!-- Sidebar Header -->
            <div class="p-2.5 border-b border-gray-200 bg-white">
              <!-- Search Box -->
              <div class="flex flex-col gap-2">
                <div class="relative">
                  <input 
                    v-model="searchQuery"
                    type="text" 
                    class="w-full py-1.5 px-2.5 pl-8 border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="ค้นหาสินค้า SKU, ชื่อ, รหัสม้วน..."
                    @input="filterProducts"
                  >
                  <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                </div>
                
                <!-- Filters -->
                <div class="flex justify-between items-center text-xs">
                  <div class="flex gap-2">
                    <label class="flex items-center cursor-pointer text-gray-600">
                      <input 
                        type="checkbox" 
                        v-model="showOnlyTextile" 
                        @change="filterProducts"
                        class="mr-1 cursor-pointer"
                      >
                      <span>ผ้า</span>
                    </label>
                    <label class="flex items-center cursor-pointer text-gray-600">
                      <input 
                        type="checkbox" 
                        v-model="showOnlyAvailable" 
                        @change="filterProducts"
                        class="mr-1 cursor-pointer"
                      >
                      <span>มีสต็อค</span>
                    </label>
                  </div>
                  <span class="font-semibold text-blue-500 text-[11px]">
                    {{ filteredProducts.length }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Product List -->
            <div class="flex-1 overflow-y-auto p-2">
              <!-- Loading State -->
              <div v-if="isLoadingProducts" class="text-center py-8 px-4 text-blue-500">
                <i class="fas fa-spinner fa-spin text-3xl mb-2 block"></i>
                <p class="text-xs font-medium text-gray-600">กำลังโหลด...</p>
              </div>

              <!-- Product Items -->
              <div 
                v-else
                v-for="(product, index) in filteredProducts" 
                :key="product?.id || `product-${index}`"
                @click="selectProduct(product)"
                class="flex flex-row bg-white border-2 border-transparent rounded-md mb-2 cursor-pointer transition-all overflow-hidden p-1.5 gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                :class="{
                  'product-item-active': selectedProduct?.id === product?.id,
                  'relative': product?.category === 'textile'
                }"
              >
                <!-- Large Fabric Image Left -->
                <div v-if="product?.category === 'textile'" class="relative w-14 min-w-[56px] h-14 overflow-hidden bg-gray-50 flex-shrink-0 rounded border border-gray-200">
                  <img 
                    :src="product.product_image_url || product.fabric_image || 'https://recasens.com/wp-content/uploads/2017/02/r_085.jpg'"
                    :alt="product.product_name"
                    class="w-full h-full object-cover"
                    @error="handleProductImageError"
                  />
                  <span class="absolute top-0.5 right-0.5 bg-purple-600/95 text-white w-4 h-4 rounded flex items-center justify-center text-[9px] shadow">
                    <i class="fas fa-scroll"></i>
                  </span>
                </div>
                
                <div class="flex-1 flex flex-col justify-center gap-0.5">
                  <span class="font-mono font-semibold text-gray-800 text-xs">{{ product?.sku || 'N/A' }}</span>
                  
                  <h4 class="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
                    {{ product.product_name || 'ไม่ระบุชื่อ' }}
                  </h4>
                  
                  <div class="flex gap-2 text-[10px] text-gray-600">
                    <div class="flex items-center gap-0.5">
                      <i class="fas fa-tag text-[9px]"></i>
                      <span>{{ formatCurrency(product.unit_price || 0) }}</span>
                    </div>
                    <div class="flex items-center gap-0.5">
                      <i class="fas fa-boxes text-[9px]"></i>
                      <span>{{ getProductQuantity(product) }}</span>
                    </div>
                  </div>

                  <div v-if="product?.category === 'textile' && productLots[product.id]" class="inline-flex items-center gap-0.5 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium self-start">
                    <i class="fas fa-layer-group text-[9px]"></i>
                    {{ productLots[product.id].length }} ม้วน
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!isLoadingProducts && filteredProducts.length === 0" class="text-center py-10 px-5 text-gray-400">
                <i class="fas fa-box-open text-5xl mb-3 block"></i>
                <h4 class="text-base font-semibold text-gray-600 mb-1">ไม่พบสินค้า</h4>
                <p v-if="searchQuery" class="text-sm text-gray-400">
                  ไม่พบสินค้าที่ตรงกับ "{{ searchQuery }}"
                </p>
                <p v-else class="text-sm text-gray-400">ยังไม่มีสินค้าในระบบ</p>
              </div>
            </div>
          </div>

          <!-- Right Panel: Product Details & Lot Selection -->
          <div 
            class="relative overflow-y-auto bg-white"
            :class="{
              'hidden md:block': !selectedProduct
            }"
          >
            <!-- Loading Overlay -->
            <div v-if="isLoadingLots" class="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
              <div class="text-center text-blue-500">
                <i class="fas fa-spinner fa-spin text-5xl mb-4 block"></i>
                <p class="text-sm font-medium text-gray-600">กำลังโหลดข้อมูลม้วนผ้าและการจอง...</p>
              </div>
            </div>
            
            <!-- Product Details -->
            <div v-if="selectedProduct" class="p-2.5 md:p-3">
              <div class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 pb-2 border-b border-gray-200">
                <div class="flex-1">
                  <h3 class="text-base md:text-lg font-bold text-gray-900 mb-0.5">
                    {{ selectedProduct.product_name }}
                  </h3>
                  <p class="text-[10px] md:text-xs text-gray-600 font-mono">SKU: {{ selectedProduct.sku }}</p>
                </div>
                <button
                  v-if="selectedProduct.category !== 'textile'"
                  @click="handleSelectNonTextile(selectedProduct)"
                  class="w-full sm:w-auto bg-blue-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all inline-flex items-center justify-center text-xs md:text-sm"
                >
                  <i class="fas fa-check mr-1.5"></i>
                  เลือกสินค้านี้
                </button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 mb-3">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                  <div class="text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">ราคา/หน่วย</div>
                  <div class="text-xs md:text-sm font-bold text-gray-900">{{ formatCurrency(selectedProduct.unit_price || 0) }}</div>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                  <div class="text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">หน่วย</div>
                  <div class="text-xs md:text-sm font-bold text-gray-900">{{ selectedProduct.unit || 'ชิ้น' }}</div>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                  <div class="text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">คงเหลือ</div>
                  <div class="text-xs md:text-sm font-bold text-gray-900">{{ getProductQuantity(selectedProduct) }}</div>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                  <div class="text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">พร้อมใช้</div>
                  <div class="text-xs md:text-sm font-bold text-green-600">{{ getProductAvailable(selectedProduct).toFixed(2) }}</div>
                </div>
                <div v-if="getProductReserved(selectedProduct) > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                  <div class="text-[9px] md:text-[10px] text-gray-600 mb-0.5 font-medium">ติดจอง</div>
                  <div class="text-xs md:text-sm font-bold text-orange-600">{{ getProductReserved(selectedProduct).toFixed(2) }}</div>
                </div>
              </div>

              <!-- Lot Selection (for Textile Products) -->
              <div v-if="selectedProduct.category === 'textile'" class="mt-3">
                <!-- Quantity Input First -->
                <div class="mb-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <label class="block text-sm font-semibold text-gray-900 mb-2">
                    <i class="fas fa-ruler-horizontal mr-1.5 text-blue-600"></i>
                    ระบุจำนวนที่ต้องการ (เมตร)
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model.number="requestedMeters"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="เช่น 40, 140"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      @input="calculateRecommendedLots"
                    />
                    <button
                      v-if="requestedMeters > 0"
                      @click="clearRequest"
                      class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                      title="ล้าง"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <!-- Recommendation Summary -->
                  <div v-if="requestedMeters > 0 && recommendedLots.length > 0" class="mt-2 p-2 bg-white border border-blue-200 rounded-lg">
                    <div class="text-xs font-semibold text-blue-900 mb-1">
                      <i class="fas fa-lightbulb mr-1 text-yellow-500"></i>
                      แนะนำการเลือกม้วน:
                    </div>
                    <div class="space-y-1">
                      <div v-for="(rec, idx) in recommendedLots" :key="idx" class="flex items-center justify-between text-xs">
                        <span class="text-gray-700">
                          <i class="fas fa-check-circle text-green-500 mr-1"></i>
                          {{ rec.lot.full_lot_code || rec.lot.lot_code }}
                        </span>
                        <span class="font-semibold text-blue-600">{{ rec.meters.toFixed(2) }} ม.</span>
                      </div>
                      <div class="pt-1 border-t border-gray-200 flex justify-between font-semibold text-xs">
                        <span>รวม {{ selectedLots.length }} ม้วน</span>
                        <span :class="totalSelectedMeters >= requestedMeters ? 'text-green-600' : 'text-orange-600'">
                          {{ totalSelectedMeters.toFixed(2) }} / {{ requestedMeters.toFixed(2) }} ม.
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Warning if not enough -->
                  <div v-else-if="requestedMeters > 0 && getProductAvailable(selectedProduct) < requestedMeters" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-xs text-red-700">
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      ไม่มีผ้าเพียงพอ (พร้อมใช้: {{ getProductAvailable(selectedProduct).toFixed(2) }} ม.)
                    </p>
                  </div>
                </div>

                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs md:text-sm font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-layer-group mr-1.5 text-xs"></i>
                    {{ requestedMeters > 0 ? 'ม้วนที่แนะนำ' : 'ม้วนผ้าทั้งหมด' }}
                  </h4>
                  <span class="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-semibold">
                    {{ displayedLots.length }} ม้วน
                  </span>
                </div>

                <!-- Loading Lots -->
                <div v-if="!productLots[selectedProduct.id] && isLoadingLots" class="text-center py-6 text-blue-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                  <p class="text-xs text-gray-600">โหลดม้วน...</p>
                </div>

                <!-- Lot Cards -->
                <div v-else-if="productLots[selectedProduct.id]" class="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2">
                  <div 
                    v-for="lot in displayedLots" 
                    :key="lot._id || lot.lot_code"
                    class="border-2 rounded-lg p-2 bg-white transition-all"
                    :class="{
                      'border-blue-500 bg-blue-50 shadow-md': isLotSelected(lot),
                      'border-green-400 bg-green-50': isLotRecommended(lot) && !isLotSelected(lot),
                      'border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md md:hover:-translate-y-0.5': getLotAvailable(lot) > 0 && !isLotSelected(lot),
                      'border-gray-200 opacity-60 bg-gray-50 cursor-not-allowed': getLotAvailable(lot) <= 0
                    }"
                    @click="getLotAvailable(lot) > 0 ? toggleLotSelection(lot) : null"
                  >
                    <!-- Lot Header -->
                    <div class="flex justify-between items-center mb-1.5 pb-1.5 border-b border-gray-200">
                      <div class="flex items-center gap-1.5 flex-1 min-w-0">
                        <img 
                          :src="lot.status === 'full' || lot.status === 'available' || !lot.status ? 
                            'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762841228909.png' : 
                            'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762841229498.png'" 
                          :alt="lot.status === 'full' || lot.status === 'available' || !lot.status ? 'full roll' : 'partial roll'" 
                          class="w-8 h-6 object-contain flex-shrink-0"
                          :title="lot.status === 'full' || lot.status === 'available' || !lot.status ? 'ม้วนเต็ม' : 'ม้วนบางส่วน'"
                        />
                        <img 
                          :src="selectedProduct.product_image_url || lot.fabric_image || selectedProduct.fabric_image || 'https://recasens.com/wp-content/uploads/2017/02/r_085.jpg'"
                          :alt="`ผ้า ${lot.color_code || ''}`"
                          class="lot-fabric-preview-compact"
                          :title="`สี: ${lot.color_code || 'ไม่ระบุ'}`"
                          @error="handleProductImageError"
                        />
                        <span class="font-mono font-bold text-purple-600 text-xs truncate">{{ lot.full_lot_code || lot.lot_code }}</span>
                      </div>
                      <span 
                        v-if="getLotReservationStatus(lot)"
                        :class="{
                          'bg-red-50 text-red-600': getLotReservationStatus(lot).type === 'fully_reserved',
                          'bg-orange-50 text-orange-600': getLotReservationStatus(lot).type === 'partially_reserved'
                        }"
                        class="px-2 md:px-2.5 py-0.5 md:py-1 rounded-xl text-[10px] md:text-[11px] font-semibold inline-flex items-center flex-shrink-0 ml-2"
                      >
                        <i class="fas fa-lock mr-1"></i>
                        <span class="hidden sm:inline">{{ getLotReservationStatus(lot).label }}</span>
                        <span class="sm:hidden">จอง</span>
                      </span>
                    </div>
                    
                    <!-- Lot Stats -->
                    <div class="flex flex-col gap-1 mb-1.5">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="text-gray-600 flex items-center">คงเหลือ:</span>
                        <span class="font-semibold text-gray-900">{{ lot.remaining_meters?.toFixed(2) || '0.00' }} ม.</span>
                      </div>
                      
                      <div 
                        v-if="lot.total_reserved_meters > 0"
                        class="flex justify-between items-center text-[10px] text-orange-600"
                      >
                        <span class="flex items-center">
                          <i class="fas fa-lock mr-0.5 text-[8px]"></i>
                          จอง:
                        </span>
                        <span class="font-semibold">
                          {{ lot.total_reserved_meters.toFixed(2) }} ม.
                          <span 
                            v-if="lot.reservations && lot.reservations.length > 0" 
                            class="text-[9px] text-gray-400 font-normal"
                          >
                            ({{ lot.reservations.length }})
                          </span>
                        </span>
                      </div>
                      
                      <div class="flex justify-between items-center text-[10px] pt-1 border-t border-gray-200">
                        <span class="text-green-600 font-semibold flex items-center">
                          <i class="fas fa-check-circle mr-0.5 text-[9px]"></i>
                          พร้อมใช้:
                        </span>
                        <span class="text-sm font-semibold text-green-600">
                          {{ getLotAvailable(lot).toFixed(2) }} ม.
                        </span>
                      </div>
                      
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="text-gray-600 flex items-center">
                          <i class="fas fa-weight mr-0.5 text-[8px]"></i>
                          น้ำหนัก:
                        </span>
                        <span class="font-semibold text-gray-900">{{ lot.weight_kg || 0 }} กก.</span>
                      </div>
                    </div>

                    <!-- Reservation Details -->
                    <div 
                      v-if="lot.reservations && lot.reservations.length > 0" 
                      class="bg-amber-50 border border-amber-200 rounded p-1.5 mt-1.5 text-[10px]"
                    >
                      <div class="font-semibold text-amber-900 mb-0.5">
                        <i class="fas fa-info-circle mr-0.5 text-[9px]"></i>
                        การจอง:
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <div 
                          v-for="reservation in lot.reservations.slice(0, 2)" 
                          :key="reservation.id || reservation._id"
                          class="text-amber-950 leading-tight"
                        >
                          <i class="fas fa-caret-right mr-0.5 text-[9px]"></i>
                          <span class="font-semibold">{{ reservation.reserved_meters.toFixed(2) }} ม.</span>
                          <span v-if="reservation.is_full_roll" class="text-purple-600 font-semibold">(ทั้งม้วน)</span>
                          <span class="hidden sm:inline"> - </span>
                          <span class="block sm:inline text-[9px]">{{ reservation.reference_code || reservation.reference_type }}</span>
                        </div>
                        <div 
                          v-if="lot.reservations.length > 2" 
                          class="text-amber-700 italic text-[9px]"
                        >
                          ... +{{ lot.reservations.length - 2 }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Not Available Notice -->
                    <div v-if="getLotAvailable(lot) <= 0" class="flex items-center justify-center py-1.5 bg-red-50 text-red-600 rounded font-semibold text-[10px] mt-1.5">
                      <i class="fas fa-ban mr-1 text-[9px]"></i>
                      <span>ติดจองหมด</span>
                    </div>

                    <!-- Select Action -->
                    <div v-else class="lot-action-button-compact" :class="{ 'bg-blue-500 text-white': isLotSelected(lot) }">
                      <i :class="isLotSelected(lot) ? 'fas fa-check-circle' : 'fas fa-hand-pointer'" class="mr-1 text-[10px]"></i>
                      <span>{{ isLotSelected(lot) ? 'เลือกแล้ว' : (isLotRecommended(lot) ? '✨ แนะนำ' : 'เลือกม้วนนี้') }}</span>
                    </div>
                  </div>
                  
                  <!-- Add Selected Lots Button -->
                  <div v-if="selectedLots.length > 0" class="col-span-full mt-2">
                    <button
                      @click="confirmMultipleLots"
                      class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <i class="fas fa-check-double"></i>
                      เพิ่ม {{ selectedLots.length }} ม้วน ({{ totalSelectedMeters.toFixed(2) }} ม.) ลงในรายการ
                    </button>
                  </div>
                </div>

                <!-- No Lots -->
                <div v-else class="text-center py-8 md:py-10 text-gray-400">
                  <i class="fas fa-inbox text-4xl md:text-5xl mb-2 md:mb-3 block"></i>
                  <p class="text-xs md:text-sm px-4">ไม่พบม้วนผ้าสำหรับสินค้านี้</p>
                </div>
              </div>
            </div>

            <!-- Empty State when no product selected -->
            <div v-else class="no-selection">
              <i class="fas fa-hand-pointer"></i>
              <h4>เลือกสินค้าจากรายการด้านซ้าย</h4>
              <p>คลิกที่สินค้าเพื่อดูรายละเอียดและเลือกม้วนผ้า</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lot Selection Method Modal -->
    <div v-if="showMethodModal" class="modal-overlay" @click="showMethodModal = false">
      <div class="modal-content modal-slide-in" @click.stop style="max-width: 450px;">
        <div class="flex justify-between items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
          <h3 class="text-base font-bold text-white flex items-center">
            <i class="fas fa-scroll mr-1.5 text-sm"></i>
            เลือกวิธีการสั่งซื้อ
          </h3>
          <button 
            @click="showMethodModal = false"
            class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <div class="px-3 py-2.5 bg-white border-b border-gray-100">
          <div v-if="selectedLot" class="space-y-0.5">
            <div class="text-sm font-bold text-gray-900">
              {{ selectedProduct?.product_name }}
            </div>
            <div class="text-xs text-blue-600 font-semibold">
              {{ selectedLot.full_lot_code || selectedLot.lot_code }} - คงเหลือ: <span class="font-bold">{{ getLotAvailable(selectedLot).toFixed(2) }} ม.</span> <span class="text-gray-500">(คง {{ selectedLot.remaining_meters?.toFixed(2) || '0.00' }} ม.)</span>
            </div>
          </div>

          <div class="px-3 py-2.5 space-y-2 bg-gray-50">
            <!-- Option 1: ยกทั้งม้วน -->
            <div 
              @click="confirmLotSelection('full_roll')"
              class="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all group flex items-center gap-2.5"
            >
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                <i class="fas fa-layer-group text-purple-600 text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <h4 class="text-sm font-bold text-gray-900">ยกทั้งม้วน</h4>
                  <span class="text-sm font-bold text-purple-600">{{ formatCurrency(selectedProduct?.wholesale_price || selectedProduct?.unit_price) }}/ม.</span>
                </div>
                <p class="text-xs text-gray-600">
                  รับผ้าทั้งม้วน {{ getLotAvailable(selectedLot).toFixed(2) }} ม.
                </p>
                <div class="flex items-center gap-1 mt-0.5">
                  <i class="fas fa-tag text-purple-600 text-[10px]"></i>
                  <span class="text-[10px] text-purple-600 font-semibold">ราคาขายส่ง</span>
                </div>
              </div>
            </div>

            <!-- Option 2: ระบุจำนวนเมตร -->
            <div 
              @click="confirmLotSelection('custom_meters')"
              class="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group flex items-center gap-2.5"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <i class="fas fa-ruler-horizontal text-blue-600 text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <h4 class="text-sm font-bold text-gray-900">ระบุจำนวนเมตร</h4>
                  <span class="text-sm font-bold text-blue-600">{{ formatCurrency(selectedProduct?.retail_price || selectedProduct?.unit_price) }}/ม.</span>
                </div>
                <p class="text-xs text-gray-600">
                  ดิตตามจำนวนที่ต้องการ (สูงสุด {{ getLotAvailable(selectedLot).toFixed(2) }} ม.)
                </p>
                <div class="flex items-center gap-1 mt-0.5">
                  <i class="fas fa-tag text-blue-600 text-[10px]"></i>
                  <span class="text-[10px] text-blue-600 font-semibold">ราคาขายปลีก</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center px-3 py-2 bg-white border-t border-gray-200 rounded-b-xl">
          <button 
            @click="showMethodModal = false" 
            class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium text-sm flex items-center gap-1.5"
          >
            <i class="fas fa-times text-xs"></i>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, inject } from 'vue'

export default {
  name: 'QuotationProductModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'select-product', 'select-product-with-lot'],
  
  setup(props, { emit }) {
    // ✅ Inject InventoryService
    const inventoryService = inject('inventoryService', null)
    
    // State
    const isLoadingProducts = ref(false)
    const isLoadingLots = ref(false)
    const products = ref([])
    const productLots = ref({}) // Map: product_id -> lots[]
    const searchQuery = ref('')
    const showOnlyTextile = ref(false)
    const showOnlyAvailable = ref(false)
    const filteredProducts = ref([])
    const selectedProduct = ref(null)
    
    // New: Requested meters and lot selection
    const requestedMeters = ref(0)
    const selectedLots = ref([]) // Array of { lot, meters }
    const recommendedLots = ref([]) // Calculated recommendations
    
    // Lot selection
    const showMethodModal = ref(false)
    const selectedLot = ref(null)
    
    // Methods
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    }
    
    // ✅ Load products using InventoryService
    const loadProducts = async () => {
      try {
        isLoadingProducts.value = true
        console.log('[QuotationProductModal] 📦 Loading products from InventoryService...')
        
        if (!inventoryService) {
          console.error('[QuotationProductModal] InventoryService not available')
          throw new Error('InventoryService not injected')
        }
        
        // ✅ ใช้ getAllProducts() จาก InventoryService
        const productsData = await inventoryService.getAllProducts()
        
        console.log(`[QuotationProductModal] ✅ Loaded ${productsData.length} products`)
        
        // Transform data
        products.value = productsData.map(product => ({
          id: product._id || product.id,
          _id: product._id || product.id,
          sku: product.sku,
          product_name: product.product_name,
          product_code: product.product_code,
          category: product.category,
          unit: product.unit || 'ชิ้น',
          unit_price: product.unit_price || 0,
          retail_price: product.retail_price || product.unit_price || 0, // ✅ เพิ่มราคาขายปลีก
          wholesale_price: product.wholesale_price || product.unit_price || 0, // ✅ เพิ่มราคาขายส่ง
          product_image_url: product.product_image_url, // ✅ เพิ่มรูปสินค้า
          fabric_image: product.fabric_image || product.image_url,
          // Balance data
          qty_on_hand: product.balance?.qty_on_hand || 0,
          qty_available: product.balance?.qty_available || 0,
          qty_reserved: product.balance?.qty_reserved || 0
        }))
        
        filterProducts()
        
      } catch (error) {
        console.error('[QuotationProductModal] ❌ Error loading products:', error)
        products.value = []
      } finally {
        isLoadingProducts.value = false
      }
    }
    
    // ✅ Load lots for specific product using InventoryService
    const loadProductLots = async (productId) => {
      try {
        isLoadingLots.value = true
        console.log('[QuotationProductModal] 📦 Loading lots for product:', productId)
        
        if (!inventoryService) {
          throw new Error('InventoryService not available')
        }
        
        // ✅ ใช้ getLotsWithReservations() - ดึง lots พร้อม reservations ในคราวเดียว
        const lots = await inventoryService.getLotsWithReservations(productId)
        
        console.log(`[QuotationProductModal] ✅ Loaded ${lots.length} lots with reservations`)
        
        // Store in map
        productLots.value[productId] = lots
        
      } catch (error) {
        console.error('[QuotationProductModal] ❌ Error loading lots:', error)
        productLots.value[productId] = []
      } finally {
        isLoadingLots.value = false
      }
    }
    
    // Filter products
    const filterProducts = () => {
      let items = [...products.value]
      
      // Filter by search
      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase()
        items = items.filter(product => 
          product.sku?.toLowerCase().includes(search) ||
          product.product_name?.toLowerCase().includes(search) ||
          product.product_code?.toLowerCase().includes(search)
        )
      }
      
      // Filter by textile
      if (showOnlyTextile.value) {
        items = items.filter(product => product.category === 'textile')
      }
      
      // Filter by available
      if (showOnlyAvailable.value) {
        items = items.filter(product => getProductAvailable(product) > 0)
      }
      
      filteredProducts.value = items
    }
    
    // Get product quantity
    const getProductQuantity = (product) => {
      if (product.category === 'textile') {
        return product.qty_on_hand || 0
      }
      return product.qty_on_hand || 0
    }
    
    // Get product available (after reservations)
    const getProductAvailable = (product) => {
      return product.qty_available || 0
    }
    
    // Get product reserved
    const getProductReserved = (product) => {
      return product.qty_reserved || 0
    }
    
    // Select product
    const selectProduct = async (product) => {
      selectedProduct.value = product
      console.log('[QuotationProductModal] Selected product:', product.sku)
      
      // Load lots for textile products
      if (product.category === 'textile') {
        await loadProductLots(product.id)
      }
    }
    
    // Get lot available meters
    const getLotAvailable = (lot) => {
      // ✅ ใช้ available_meters ที่คำนวณมาจาก InventoryService
      if (typeof lot.available_meters === 'number') {
        return lot.available_meters
      }
      
      // Fallback
      const remaining = parseFloat(lot.remaining_meters || 0)
      const reserved = parseFloat(lot.total_reserved_meters || 0)
      return Math.max(0, remaining - reserved)
    }
    
    // Get lot reservation status
    const getLotReservationStatus = (lot) => {
      const reservations = lot.reservations || []
      
      if (reservations.length === 0) {
        return null
      }
      
      const available = getLotAvailable(lot)
      const isFullyReserved = available <= 0
      
      return {
        type: isFullyReserved ? 'fully_reserved' : 'partially_reserved',
        label: isFullyReserved ? 'จองหมดแล้ว' : `จองแล้ว ${reservations.length} รายการ`,
        reservations: reservations
      }
    }
    
    // ✅ Calculate recommended lots based on requested meters
    const calculateRecommendedLots = () => {
      if (!requestedMeters.value || requestedMeters.value <= 0) {
        recommendedLots.value = []
        selectedLots.value = []
        return
      }
      
      const lots = productLots.value[selectedProduct.value?.id] || []
      const availableLots = lots
        .filter(lot => getLotAvailable(lot) > 0)
        .map(lot => ({
          lot,
          available: getLotAvailable(lot),
          isFull: lot.status === 'full' || lot.status === 'available' || !lot.status
        }))
        .sort((a, b) => {
          // Sort: partial rolls first (ascending), then full rolls
          if (a.isFull === b.isFull) {
            return a.available - b.available // Smaller first
          }
          return a.isFull ? 1 : -1 // Partial first
        })
      
      let remaining = requestedMeters.value
      const recommended = []
      
      for (const item of availableLots) {
        if (remaining <= 0) break
        
        const useMeters = Math.min(remaining, item.available)
        recommended.push({
          lot: item.lot,
          meters: useMeters,
          isFull: item.isFull && useMeters === item.available
        })
        remaining -= useMeters
      }
      
      recommendedLots.value = recommended
      
      // Auto-select recommended lots
      selectedLots.value = [...recommended]
      
      console.log('[QuotationProductModal] Recommended:', recommended.length, 'lots for', requestedMeters.value, 'meters')
    }
    
    // ✅ Toggle lot selection
    const toggleLotSelection = (lot) => {
      const index = selectedLots.value.findIndex(item => item.lot._id === lot._id)
      
      if (index > -1) {
        // Remove
        selectedLots.value.splice(index, 1)
      } else {
        // Add - use available meters or requested remaining
        const alreadySelected = selectedLots.value.reduce((sum, item) => sum + item.meters, 0)
        const remaining = Math.max(0, requestedMeters.value - alreadySelected)
        const available = getLotAvailable(lot)
        const useMeters = requestedMeters.value > 0 ? Math.min(remaining, available) : available
        
        selectedLots.value.push({
          lot,
          meters: useMeters,
          isFull: lot.status === 'full' && useMeters === available
        })
      }
    }
    
    // ✅ Check if lot is selected
    const isLotSelected = (lot) => {
      return selectedLots.value.some(item => item.lot._id === lot._id)
    }
    
    // ✅ Check if lot is recommended
    const isLotRecommended = (lot) => {
      return recommendedLots.value.some(item => item.lot._id === lot._id)
    }
    
    // ✅ Computed: Total selected meters
    const totalSelectedMeters = ref(0)
    watch(selectedLots, (lots) => {
      totalSelectedMeters.value = lots.reduce((sum, item) => sum + item.meters, 0)
    }, { deep: true })
    
    // ✅ Computed: Displayed lots (recommended or all)
    const displayedLots = ref([])
    watch([() => productLots.value[selectedProduct.value?.id], requestedMeters, recommendedLots], () => {
      const lots = productLots.value[selectedProduct.value?.id] || []
      
      if (requestedMeters.value > 0 && recommendedLots.value.length > 0) {
        // Show recommended lots first, then others
        const recommendedIds = recommendedLots.value.map(r => r.lot._id)
        const recommended = lots.filter(lot => recommendedIds.includes(lot._id))
        const others = lots.filter(lot => !recommendedIds.includes(lot._id) && getLotAvailable(lot) > 0)
        displayedLots.value = [...recommended, ...others]
      } else {
        // Show all available lots
        displayedLots.value = lots.filter(lot => getLotAvailable(lot) > 0)
      }
    }, { deep: true })
    
    // ✅ Clear request
    const clearRequest = () => {
      requestedMeters.value = 0
      selectedLots.value = []
      recommendedLots.value = []
    }
    
    // ✅ Confirm multiple lots selection
    const confirmMultipleLots = () => {
      // Emit multiple lots to parent
      for (const item of selectedLots.value) {
        const method = item.isFull ? 'full_roll' : 'custom_meters'
        emit('select-product-with-lot', {
          product: selectedProduct.value,
          lot: item.lot,
          method: method,
          customMeters: item.meters
        })
      }
      
      closeModal()
    }
    
    // Handle select non-textile product
    const handleSelectNonTextile = (product) => {
      emit('select-product', product)
      closeModal()
    }
    
    // Handle select lot
    const handleSelectLot = (product, lot) => {
      selectedLot.value = lot
      showMethodModal.value = true
    }
    
    // Confirm lot selection
    const confirmLotSelection = (method) => {
      emit('select-product-with-lot', {
        product: selectedProduct.value,
        lot: selectedLot.value,
        method: method
      })
      showMethodModal.value = false
      closeModal()
      selectedLot.value = null
    }
    
    // Close modal
    const closeModal = () => {
      emit('update:modelValue', false)
      selectedProduct.value = null
      selectedLot.value = null
      showMethodModal.value = false
    }
    
    // Watch modal open
    watch(() => props.modelValue, async (isOpen) => {
      if (isOpen) {
        // Load products when modal opens
        if (products.value.length === 0) {
          await loadProducts()
        }
        
        // Auto-select first product
        if (filteredProducts.value.length > 0 && !selectedProduct.value) {
          await selectProduct(filteredProducts.value[0])
        }
      } else {
        // Reset on close
        selectedProduct.value = null
        selectedLot.value = null
      }
    })
    
    // Watch filters
    watch([searchQuery, showOnlyTextile, showOnlyAvailable], () => {
      filterProducts()
    })
    
    // Initialize
    onMounted(async () => {
      console.log('[QuotationProductModal] Component mounted')
      
      if (!inventoryService) {
        console.error('[QuotationProductModal] ❌ InventoryService not available!')
        return
      }
      
      console.log('[QuotationProductModal] ✅ InventoryService available')
    })
    
    // Handle image error
    const handleProductImageError = (event) => {
      console.warn('[QuotationProductModal] Image failed to load:', event.target.src)
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56"%3E%3Crect fill="%23ddd" width="56" height="56"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E'
    }
    
    return {
      // State
      isLoadingProducts,
      isLoadingLots,
      products,
      productLots,
      searchQuery,
      showOnlyTextile,
      showOnlyAvailable,
      filteredProducts,
      selectedProduct,
      selectedLot,
      showMethodModal,
      // New state
      requestedMeters,
      selectedLots,
      recommendedLots,
      totalSelectedMeters,
      displayedLots,
      // Methods
      formatCurrency,
      loadProducts,
      loadProductLots,
      filterProducts,
      getProductQuantity,
      getProductAvailable,
      getProductReserved,
      selectProduct,
      getLotAvailable,
      getLotReservationStatus,
      handleSelectNonTextile,
      handleSelectLot,
      confirmLotSelection,
      closeModal,
      handleProductImageError,
      // New methods
      calculateRecommendedLots,
      toggleLotSelection,
      isLotSelected,
      isLotRecommended,
      clearRequest,
      confirmMultipleLots
    }
  }
}
</script>

<style scoped>
/* Modal Slide-in Animation */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-slide-in {
  animation: modalSlideIn 0.3s ease-out;
}

/* Product Item Active State with Gradient */
.product-item-active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transform: translateX(4px);
}

.product-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px 0 0 8px;
}

/* Lot Fabric Preview Hover Effect */
.lot-fabric-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: help;
  transition: all 0.2s;
}

.lot-fabric-preview:hover {
  transform: scale(1.15);
  border-color: #9ca3af;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Compact Lot Fabric Preview */
.lot-fabric-preview-compact {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  border: 1.5px solid #e5e7eb;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: help;
  transition: all 0.2s;
}

.lot-fabric-preview-compact:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Lot Action Button */
.lot-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  margin-top: 12px;
  transition: all 0.2s;
}

.lot-action-button:hover {
  background: #3b82f6;
  color: white;
}

/* Compact Lot Action Button */
.lot-action-button-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
  margin-top: 8px;
  transition: all 0.2s;
}

.lot-action-button-compact:hover {
  background: #3b82f6;
  color: white;
}

/* Scrollbar Styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>