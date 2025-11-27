<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="true" class="fixed inset-0 z-[9999] bg-black bg-opacity-75 overflow-hidden">
        <!-- Full Screen Modal -->
        <div class="w-full h-full flex flex-col bg-white">
          <!-- Modal Header -->
          <div class="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <h3 class="text-base font-semibold flex items-center">
              <i class="fas fa-camera mr-2"></i>
              <span>{{ scannedProduct ? 'พบสินค้า' : 'สแกน Barcode' }}</span>
            </h3>
            <button 
              @click="closeScanner" 
              class="text-white hover:text-gray-200 transition-colors p-2 hover:bg-indigo-700 rounded"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 flex flex-col overflow-hidden relative">
            <!-- Camera Preview - Compact height (Hidden when: no mode selected, receive mode with barcode, cut mode with lot) -->
            <div v-show="selectedMode && !receivedBarcode && !(selectedMode === 'cut' && cutStockLot)" class="w-full h-32 sm:h-36 relative bg-gray-900 flex-shrink-0 overflow-hidden">
              <video 
                ref="videoElement" 
                autoplay 
                playsinline
                webkit-playsinline
                muted
                class="w-full h-full object-cover"
              ></video>
              
              <!-- Scanning Animation Overlay -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="scanning-line"></div>
              </div>

              <!-- Error Flash Overlay -->
              <div v-if="showErrorFlash" class="absolute inset-0 bg-red-500 opacity-50 pointer-events-none error-flash"></div>
              
              <!-- Success Flash Overlay -->
              <div v-if="showSuccessFlash" class="absolute inset-0 bg-green-500 opacity-50 pointer-events-none success-flash"></div>

              <!-- Scanning Status -->
              <div v-if="scanningActive && !scannedProduct" class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <i class="fas fa-qrcode animate-pulse"></i>
                <span class="text-sm font-medium">กำลังสแกน...</span>
              </div>

              <!-- Scanned Code Display -->
              <div v-if="scannedCode" class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <i class="fas fa-check-circle"></i>
                <span class="text-sm font-medium font-mono">{{ scannedCode }}</span>
              </div>

              <!-- Debug Info -->
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {{ scanningActive ? '🟢 Active' : '🔴 Paused' }}
              </div>
            </div>

            <!-- Bottom: Product Details - Scrollable -->
            <div class="flex-1 overflow-y-auto bg-gray-50">
              <!-- Loading State -->
              <div v-if="loadingProduct" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
                  <p class="text-gray-600">กำลังค้นหาสินค้า...</p>
                </div>
              </div>

              <!-- Error Message -->
              <div v-else-if="errorMessage" class="flex items-center justify-center h-full p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-exclamation-triangle text-red-600 text-2xl mt-1"></i>
                    <div>
                      <p class="font-semibold text-red-800 mb-1">ไม่พบสินค้า</p>
                      <p class="text-sm text-red-700">{{ errorMessage }}</p>
                      <button
                        @click="resetScanner"
                        class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <i class="fas fa-redo mr-2"></i>
                        สแกนใหม่
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mode Selection -->
              <div v-if="!selectedMode" class="flex items-center justify-center h-full p-6">
                <div class="text-center max-w-md w-full">
                  <!-- Icon -->
                  <div class="mb-6">
                    <div class="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fas fa-barcode text-5xl text-indigo-600"></i>
                    </div>
                  </div>
                  
                  <!-- Title -->
                  <h4 class="text-xl font-bold text-gray-900 mb-2">เลือกโหมดการใช้งาน</h4>
                  
                  <!-- Mode Buttons -->
                  <div class="space-y-3">
                    <button
                      @click="selectMode('search')"
                      class="w-full bg-white border-2 border-gray-300 hover:border-indigo-500 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-search text-xl text-indigo-600"></i>
                        </div>
                        <div class="text-left flex-1">
                          <p class="font-semibold text-gray-900">อ่านสินค้า</p>
                          <p class="text-xs text-gray-600">ค้นหาและดูข้อมูลสินค้า</p>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                    
                    <button
                      @click="selectMode('count')"
                      class="w-full bg-white border-2 border-gray-300 hover:border-green-500 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-clipboard-list text-xl text-green-600"></i>
                        </div>
                        <div class="text-left flex-1">
                          <p class="font-semibold text-gray-900">นับสต็อค</p>
                          <p class="text-xs text-gray-600">สแกนและบันทึกรายการสินค้า</p>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                    
                    <button
                      @click="selectMode('receive')"
                      class="w-full bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-dolly text-xl text-blue-600"></i>
                        </div>
                        <div class="text-left flex-1">
                          <p class="font-semibold text-gray-900">รับเข้า</p>
                          <p class="text-xs text-gray-600">สแกนสินค้าใหม่เพื่อรับเข้าระบบ</p>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                    
                    <button
                      @click="selectMode('cut')"
                      class="w-full bg-white border-2 border-gray-300 hover:border-red-500 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-cut text-xl text-red-600"></i>
                        </div>
                        <div class="text-left flex-1">
                          <p class="font-semibold text-gray-900">ตัดสต็อค</p>
                          <p class="text-xs text-gray-600">สแกน Lot แล้วตัดจำนวนออก</p>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Instructions (Search Mode) -->
              <div v-else-if="selectedMode === 'search' && !scannedProduct" class="flex items-center justify-center h-full p-6">
                <div class="text-center max-w-md">
                  <!-- Barcode Icon Animation -->
                  <div class="mb-6 relative inline-block">
                    <div class="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fas fa-barcode text-6xl text-indigo-600"></i>
                    </div>
                    <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <i class="fas fa-camera text-white text-sm"></i>
                    </div>
                  </div>
                  
                  <!-- Title -->
                  <h4 class="text-xl font-bold text-gray-900 mb-2">พร้อมสแกน Barcode</h4>
                  <p class="text-sm text-gray-600 mb-6">วางบาร์โค้ดให้อยู่หน้ากล้อง<br>ระบบจะค้นหาสินค้าอัตโนมัติ</p>
                  
                  <!-- Back Button -->
                  <button
                    @click="backToModeSelection"
                    class="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <i class="fas fa-arrow-left mr-2"></i>เปลี่ยนโหมด
                  </button>
                </div>
              </div>

              <!-- Instructions (Receive Mode) -->
              <div v-else-if="selectedMode === 'receive' && !receivedBarcode" class="flex items-center justify-center h-full p-6">
                <div class="text-center max-w-md">
                  <!-- Icon -->
                  <div class="mb-6 relative inline-block">
                    <div class="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fas fa-dolly text-6xl text-blue-600"></i>
                    </div>
                    <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <i class="fas fa-camera text-white text-sm"></i>
                    </div>
                  </div>
                  
                  <!-- Title -->
                  <h4 class="text-xl font-bold text-gray-900 mb-2">พร้อมรับสินค้าเข้า</h4>
                  <p class="text-sm text-gray-600 mb-6">สแกนบาร์โค้ดสินค้าใหม่<br>ระบบจะตรวจสอบว่ายังไม่มีในระบบ</p>
                  
                  <!-- Back Button -->
                  <button
                    @click="backToModeSelection"
                    class="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <i class="fas fa-arrow-left mr-2"></i>เปลี่ยนโหมด
                  </button>
                </div>
              </div>

              <!-- Receive Mode - Length Input -->
              <div v-else-if="selectedMode === 'receive' && receivedBarcode" class="flex flex-col h-full">
                <!-- Header -->
                <div class="bg-white border-b border-gray-300 p-2">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-semibold text-gray-900">รับสินค้าเข้า</h4>
                    <button
                      @click="backToModeSelection"
                      class="text-xs text-gray-600 hover:text-gray-900"
                    >
                      <i class="fas fa-arrow-left mr-1"></i>เปลี่ยนโหมด
                    </button>
                  </div>
                </div>

                <!-- Barcode Display -->
                <div class="bg-blue-50 border-b border-blue-200 p-2">
                  <div class="text-center mb-2">
                    <p class="text-xs text-blue-600">บาร์โค้ดที่สแกน</p>
                    <p class="text-sm font-mono font-bold text-blue-900">{{ receivedBarcode.rawBarcode }}</p>
                    <p class="text-xs text-green-600">✓ ยังไม่มีในระบบ</p>
                  </div>
                  <div class="grid grid-cols-4 gap-1 text-xs">
                    <div class="bg-white rounded p-1.5 text-center">
                      <p class="text-gray-600">Model</p>
                      <p class="font-mono font-bold text-gray-900">{{ receivedBarcode.model_code }}</p>
                    </div>
                    <div class="bg-white rounded p-1.5 text-center">
                      <p class="text-gray-600">Color</p>
                      <p class="font-mono font-bold text-gray-900">{{ receivedBarcode.color_code }}</p>
                    </div>
                    <div class="bg-white rounded p-1.5 text-center">
                      <p class="text-gray-600">Width</p>
                      <p class="font-mono font-bold text-gray-900">{{ receivedBarcode.fabric_width_cm }} cm</p>
                    </div>
                    <div class="bg-white rounded p-1.5 text-center">
                      <p class="text-gray-600">Lot</p>
                      <p class="font-mono font-bold text-gray-900">{{ receivedBarcode.lot_number }}</p>
                    </div>
                  </div>
                </div>

                <!-- Input Selection and Display -->
                <div class="bg-white border-b border-gray-300 p-2">
                  <!-- Toggle Buttons -->
                  <div class="grid grid-cols-2 gap-2 mb-2">
                    <button
                      @click="activeInputField = 'length'"
                      :class="[
                        'p-2 rounded-lg text-sm font-medium transition-all',
                        activeInputField === 'length' 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      <i class="fas fa-ruler-horizontal mr-1"></i>
                      ความยาว (เมตร) *
                    </button>
                    <button
                      @click="activeInputField = 'weight'"
                      :class="[
                        'p-2 rounded-lg text-sm font-medium transition-all',
                        activeInputField === 'weight' 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      <i class="fas fa-weight mr-1"></i>
                      น้ำหนัก (กก.)
                    </button>
                  </div>
                  
                  <!-- Input Display -->
                  <div class="text-center">
                    <div 
                      :class="[
                        'border-2 rounded p-2',
                        activeInputField === 'length' 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-green-50 border-green-300'
                      ]"
                    >
                      <p class="text-2xl font-bold font-mono" :class="activeInputField === 'length' ? 'text-blue-900' : 'text-green-900'">
                        {{ activeInputField === 'length' ? (lengthInput || '0') : (weightInput || '0') }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Values Summary -->
                  <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div class="text-center">
                      <p class="text-gray-600">ความยาว</p>
                      <p class="font-bold text-gray-900">{{ lengthInput || '-' }} ม.</p>
                    </div>
                    <div class="text-center">
                      <p class="text-gray-600">น้ำหนัก</p>
                      <p class="font-bold text-gray-900">{{ weightInput || '-' }} กก.</p>
                    </div>
                  </div>
                </div>

                <!-- Numeric Keypad -->
                <div class="flex-1 overflow-y-auto bg-gray-50 p-2">
                  <div class="max-w-xs mx-auto">
                    <!-- Number Grid -->
                    <div class="grid grid-cols-3 gap-1.5 mb-1.5">
                      <button
                        v-for="num in [1,2,3,4,5,6,7,8,9]"
                        :key="num"
                        @click="appendNumber(num)"
                        class="bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                      >
                        {{ num }}
                      </button>
                    </div>
                    
                    <!-- Bottom Row -->
                    <div class="grid grid-cols-3 gap-1.5 mb-1.5">
                      <button
                        @click="appendDecimal"
                        class="bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                      >
                        .
                      </button>
                      <button
                        @click="appendNumber(0)"
                        class="bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                      >
                        0
                      </button>
                      <button
                        @click="deleteLastDigit"
                        class="bg-red-100 border-2 border-red-300 hover:border-red-500 hover:bg-red-200 rounded-lg p-2 text-base font-bold text-red-700 transition-all active:scale-95"
                      >
                        <i class="fas fa-backspace"></i>
                      </button>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="grid grid-cols-3 gap-1.5">
                      <button
                        @click="resetReceiveMode"
                        class="bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg p-2 text-sm font-medium transition-all"
                      >
                        <i class="fas fa-qrcode mr-1"></i>สแกนใหม่
                      </button>
                      <button
                        @click="clearLengthInput"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg p-2 text-sm font-medium transition-all"
                      >
                        <i class="fas fa-times mr-1"></i>ล้าง
                      </button>
                      <button
                        @click="confirmReceive"
                        :disabled="!lengthInput || parseFloat(lengthInput) <= 0"
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg p-2 text-sm font-medium transition-all"
                      >
                        <i class="fas fa-check mr-1"></i>ยืนยัน
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Count Mode -->
              <div v-else-if="selectedMode === 'count'" class="flex flex-col h-full">
                <!-- Header Stats -->
                <div class="bg-white border-b border-gray-300 p-3">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-semibold text-gray-900">โหมดนับสต็อค</h4>
                    <button
                      @click="backToModeSelection"
                      class="text-xs text-gray-600 hover:text-gray-900"
                    >
                      <i class="fas fa-arrow-left mr-1"></i>เปลี่ยนโหมด
                    </button>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex-1 bg-gray-50 rounded p-2 text-center">
                      <p class="text-xs text-gray-600">สแกนแล้ว</p>
                      <p class="text-base font-bold text-gray-900">{{ scannedItems.length }}</p>
                    </div>
                    <button
                      v-if="scannedItems.length > 0"
                      @click="clearScannedItems"
                      class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                    >
                      <i class="fas fa-trash mr-1"></i>ล้างข้อมูล
                    </button>
                  </div>
                </div>

                <!-- Scanned Items List -->
                <div class="flex-1 overflow-y-auto bg-gray-50 p-3">
                  <div v-if="scannedItems.length === 0" class="text-center py-8">
                    <i class="fas fa-qrcode text-3xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-600">ยังไม่มีรายการที่สแกน</p>
                    <p class="text-xs text-gray-500">เริ่มสแกนบาร์โค้ดเพื่อบันทึก</p>
                  </div>
                  
                  <div v-else class="space-y-1.5">
                    <div
                      v-for="(item, index) in scannedItems"
                      :key="item.barcode"
                      class="bg-white border border-gray-300 p-2"
                    >
                      <!-- Product Info Row -->
                      <div class="flex items-start gap-2">
                        <!-- Index Badge -->
                        <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span class="text-xs font-bold text-green-700">{{ index + 1 }}</span>
                        </div>
                        
                        <!-- Product Image -->
                        <div class="flex-shrink-0">
                          <div v-if="item.product?.product_image_url" class="w-12 h-12 rounded overflow-hidden border border-gray-200">
                            <img 
                              :src="item.product.product_image_url" 
                              :alt="item.product.product_name"
                              class="w-full h-full object-cover"
                              @error="$event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23cbd5e1%22%3E%3Cpath d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z%22/%3E%3C/svg%3E'"
                            />
                          </div>
                          <div v-else class="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <i class="fas fa-box text-gray-400 text-sm"></i>
                          </div>
                        </div>
                        
                        <!-- Product Details -->
                        <div class="flex-1 min-w-0">
                          <p v-if="item.product" class="text-xs font-semibold text-gray-900 truncate">{{ item.product.product_name }}</p>
                          <p v-else class="font-mono text-xs font-semibold text-gray-900 truncate">{{ item.barcode }}</p>
                          <p class="text-xs text-gray-500 font-mono">{{ item.product?.sku || item.barcode }}</p>
                          <p class="text-xs text-gray-400">{{ item.timestamp }}</p>
                        </div>
                        
                        <!-- Stock Info -->
                        <div class="flex-shrink-0 text-right">
                          <div v-if="item.product?.balance" class="space-y-0.5">
                            <div class="text-xs">
                              <span class="text-gray-500">คงเหลือ: </span>
                              <span class="font-semibold text-gray-900">{{ formatNumber(item.product.balance.qty_on_hand || 0) }}</span>
                            </div>
                            <div class="text-xs">
                              <span class="text-gray-500">พร้อมใช้: </span>
                              <span class="font-semibold text-green-600">{{ formatNumber(item.product.balance.qty_available || 0) }}</span>
                            </div>
                          </div>
                          <div v-else-if="item.loading" class="text-xs text-gray-400">
                            <i class="fas fa-spinner fa-spin"></i>
                          </div>
                          <div v-else class="text-xs text-gray-400">
                            ไม่พบข้อมูล
                          </div>
                        </div>
                        
                        <!-- Remove Button -->
                        <button
                          @click="removeScannedItem(item.barcode)"
                          class="flex-shrink-0 text-red-600 hover:text-red-800 p-1"
                        >
                          <i class="fas fa-times text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cut Stock Mode -->
              <div v-else-if="selectedMode === 'cut'" class="flex flex-col h-full">
                <!-- Header -->
                <div class="bg-red-600 text-white p-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold flex items-center gap-2">
                      <i class="fas fa-cut"></i>
                      โหมดตัดสต็อค
                    </h4>
                    <button
                      @click="backToModeSelection"
                      class="text-xs text-red-100 hover:text-white"
                    >
                      <i class="fas fa-arrow-left mr-1"></i>เปลี่ยนโหมด
                    </button>
                  </div>
                </div>

                <!-- Waiting for scan -->
                <div v-if="!cutStockLot" class="flex-1 flex items-center justify-center p-6">
                  <div class="text-center max-w-md">
                    <div class="mb-6 relative inline-block">
                      <div class="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-cut text-6xl text-red-600"></i>
                      </div>
                      <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <i class="fas fa-camera text-white text-sm"></i>
                      </div>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">พร้อมตัดสต็อค</h4>
                    <p class="text-sm text-gray-600 mb-6">สแกนบาร์โค้ด Lot ที่ต้องการตัด<br>ระบบจะแสดงข้อมูลและให้กรอกจำนวน</p>
                  </div>
                </div>

                <!-- Lot found - show cut interface -->
                <div v-else class="flex-1 flex flex-col overflow-hidden">
                  <!-- Lot Info with Product Image -->
                  <div class="bg-white border-b border-gray-300 p-3">
                    <div class="flex items-start gap-3 mb-2">
                      <!-- Product Image -->
                      <div class="flex-shrink-0">
                        <div v-if="cutStockProduct?.product_image_url" class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img 
                            :src="cutStockProduct.product_image_url" 
                            :alt="cutStockProduct.product_name"
                            class="w-full h-full object-cover"
                            @error="$event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23cbd5e1%22%3E%3Cpath d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z%22/%3E%3C/svg%3E'"
                          />
                        </div>
                        <div v-else class="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <i class="fas fa-image text-gray-400 text-xl"></i>
                        </div>
                      </div>
                      <!-- Product Info -->
                      <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500">สินค้า</p>
                        <p class="font-semibold text-gray-900 truncate">{{ cutStockProduct?.product_name }}</p>
                        <p class="text-xs text-gray-500 font-mono">{{ cutStockProduct?.sku }}</p>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div class="bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-500">Lot Code</p>
                        <p class="font-mono font-bold text-gray-900">{{ cutStockLot.lot_code }}</p>
                      </div>
                      <div class="bg-blue-50 rounded p-2">
                        <p class="text-xs text-blue-600">พร้อมใช้</p>
                        <p class="font-bold text-blue-900">{{ formatNumber(getAvailableMeters(cutStockLot)) }} ม.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Quantity Input -->
                  <div class="bg-red-50 border-b border-red-200 p-3">
                    <p class="text-xs text-red-600 mb-1 text-center">จำนวนที่ต้องการตัด (เมตร)</p>
                    <div class="text-center">
                      <div class="border-2 border-red-300 bg-white rounded p-2">
                        <p class="text-3xl font-bold font-mono text-red-900">{{ cutQuantityInput || '0' }}</p>
                      </div>
                    </div>
                    <p v-if="cutQuantityError" class="text-red-600 text-xs mt-1 text-center">{{ cutQuantityError }}</p>
                  </div>

                  <!-- Numpad -->
                  <div class="flex-1 overflow-y-auto bg-gray-50 p-2">
                    <div class="max-w-xs mx-auto">
                      <div class="grid grid-cols-3 gap-1.5 mb-1.5">
                        <button
                          v-for="num in [1,2,3,4,5,6,7,8,9]"
                          :key="num"
                          @click="appendCutNumber(num)"
                          class="bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                        >
                          {{ num }}
                        </button>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5 mb-1.5">
                        <button
                          @click="appendCutDecimal"
                          class="bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                        >
                          .
                        </button>
                        <button
                          @click="appendCutNumber(0)"
                          class="bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 rounded-lg p-2 text-lg font-bold text-gray-900 transition-all active:scale-95"
                        >
                          0
                        </button>
                        <button
                          @click="deleteCutLastDigit"
                          class="bg-red-100 border-2 border-red-300 hover:border-red-500 hover:bg-red-200 rounded-lg p-2 text-base font-bold text-red-700 transition-all active:scale-95"
                        >
                          <i class="fas fa-backspace"></i>
                        </button>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5">
                        <button
                          @click="resetCutMode"
                          class="bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg p-2 text-sm font-medium transition-all"
                        >
                          <i class="fas fa-qrcode mr-1"></i>สแกนใหม่
                        </button>
                        <button
                          @click="clearCutQuantity"
                          class="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg p-2 text-sm font-medium transition-all"
                        >
                          <i class="fas fa-times mr-1"></i>ล้าง
                        </button>
                        <button
                          @click="handleCutStock"
                          :disabled="!cutQuantityInput || parseFloat(cutQuantityInput) <= 0 || !!cutQuantityError"
                          class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg p-2 text-sm font-medium transition-all"
                        >
                          <i class="fas fa-cut mr-1"></i>ตัด
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div v-else class="p-4 space-y-3">
                <!-- Product Header with Image -->
                <div class="bg-white border border-gray-300 p-3">
                  <div class="flex items-start gap-3 mb-2">
                    <!-- Product Image -->
                    <div class="flex-shrink-0">
                      <div v-if="scannedProduct.product_image_url" class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          :src="scannedProduct.product_image_url" 
                          :alt="scannedProduct.product_name"
                          class="w-full h-full object-cover"
                          @error="$event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23cbd5e1%22%3E%3Cpath d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z%22/%3E%3C/svg%3E'"
                        />
                      </div>
                      <div v-else class="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <i class="fas fa-image text-gray-400 text-xl"></i>
                      </div>
                    </div>
                    <!-- Product Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-900 truncate">{{ scannedProduct.product_name }}</h4>
                      <p class="text-xs text-gray-600 font-mono">{{ scannedProduct.sku }}</p>
                    </div>
                  </div>

                  <!-- Stock Summary - Compact -->
                  <div class="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
                    <div>
                      <p class="text-xs text-gray-600">คงเหลือ</p>
                      <p class="text-base font-semibold text-gray-900">
                        {{ formatNumber(scannedProduct.balance?.qty_on_hand || 0) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">ติดจอง</p>
                      <p class="text-base font-semibold text-gray-900">
                        {{ formatNumber(scannedProduct.balance?.qty_reserved || 0) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">พร้อมใช้</p>
                      <p class="text-base font-semibold text-gray-900">
                        {{ formatNumber(scannedProduct.balance?.qty_available || 0) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Scanned Lot (if found) - Compact -->
                <div v-if="scannedLot" class="bg-gray-100 border border-gray-400 p-3">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-check-circle text-gray-700"></i>
                    <h5 class="text-sm font-semibold text-gray-900">Lot ที่สแกน</h5>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p class="text-xs text-gray-600">Lot Code</p>
                      <p class="font-mono font-semibold text-gray-900">{{ scannedLot.lot_code }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600">คงเหลือ</p>
                      <p class="font-semibold text-gray-900">{{ formatNumber(scannedLot.remaining_meters || scannedLot.calculated_meters || 0) }} ม.</p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons - Compact -->
                <div class="flex gap-2 pt-2">
                  <button
                    @click="viewProductDetails"
                    class="flex-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    @click="resetScanner"
                    class="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-medium transition-colors"
                  >
                    สแกนใหม่
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Cut Stock Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showCutConfirmModal" class="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
          <div class="text-center mb-5">
            <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">ยืนยันการตัดสต็อค</h3>
            <p class="text-sm text-gray-600">คุณต้องการตัดสต็อคหรือไม่?</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-3 mb-5 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">สินค้า:</span>
              <span class="font-medium text-right max-w-[60%] truncate">{{ cutStockProduct?.product_name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Lot:</span>
              <span class="font-mono font-medium">{{ cutStockLot?.lot_code }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">จำนวนตัด:</span>
              <span class="font-bold text-red-600 text-base">{{ cutQuantityInput }} ม.</span>
            </div>
            <div class="flex justify-between border-t pt-2 mt-2">
              <span class="text-gray-600">คงเหลือหลังตัด:</span>
              <span class="font-bold text-blue-600">
                {{ formatNumber(getAvailableMeters(cutStockLot) - parseFloat(cutQuantityInput || 0)) }} ม.
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="showCutConfirmModal = false"
              class="flex-1 px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              @click="confirmCutStock"
              :disabled="processingCut"
              class="flex-1 px-3 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <i v-if="processingCut" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'

export default {
  name: 'BarcodeScannerModal',
  
  emits: ['close', 'product-found'],
  
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    const inventoryService = window.ERP_CORE?.inventory
    
    // Refs
    const videoElement = ref(null)
    const scanningActive = ref(false)
    const scannedCode = ref('')
    const scannedProduct = ref(null)
    const scannedLot = ref(null)
    const productLots = ref([])
    const loadingProduct = ref(false)
    const errorMessage = ref('')
    const selectedMode = ref(null) // 'search', 'count', or 'receive'
    const scannedItems = ref([]) // For count mode
    const showErrorFlash = ref(false) // For error flash animation
    const showSuccessFlash = ref(false) // For success flash animation
    const receivedBarcode = ref(null) // For receive mode - stores parsed barcode data
    const lengthInput = ref('') // For receive mode length input
    const weightInput = ref('') // For receive mode weight input (optional)
    const activeInputField = ref('length') // 'length' or 'weight'
    
    // Cut stock mode states
    const cutStockLot = ref(null) // Lot ที่จะตัดสต็อค
    const cutStockProduct = ref(null) // Product ของ Lot
    const cutQuantityInput = ref('') // จำนวนที่ต้องการตัด
    const showCutConfirmModal = ref(false) // แสดง modal ยืนยัน
    const processingCut = ref(false) // กำลังประมวลผล
    
    // Scanner variables
    let videoStream = null
    let barcodeDetector = null
    let scanInterval = null
    let zxingReader = null // Store ZXing reader instance
    
    // Initialize InventoryService
    if (inventoryService && !inventoryService.initialized) {
      inventoryService.initialize(instance)
    }
    
    // Methods
    const closeScanner = () => {
      stopCamera()
      emit('close')
    }
    
    const stopCamera = () => {
      scanningActive.value = false
      
      if (scanInterval) {
        clearInterval(scanInterval)
        scanInterval = null
      }
      
      // Stop ZXing reader if active
      if (zxingReader) {
        try {
          zxingReader.reset()
          zxingReader = null
        } catch (error) {
          console.log('Error stopping ZXing:', error)
        }
      }
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
        videoStream = null
      }
    }
    
    const initCamera = async () => {
      try {
        // Request permissions first (important for iOS)
        const constraints = { 
          video: { 
            facingMode: { ideal: 'environment' }, // Use ideal instead of exact for better compatibility
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints)
        
        // Wait a bit for iOS to initialize camera
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (videoElement.value) {
          videoElement.value.srcObject = videoStream
          
          // Set attributes for iOS compatibility
          videoElement.value.setAttribute('playsinline', 'true')
          videoElement.value.setAttribute('webkit-playsinline', 'true')
          videoElement.value.setAttribute('autoplay', 'true')
          videoElement.value.muted = true
          
          await new Promise(resolve => {
            videoElement.value.onloadedmetadata = resolve
          })
          
          // Explicitly play video (required for iOS)
          try {
            await videoElement.value.play()
            console.log('✅ Video playing successfully')
          } catch (playError) {
            console.error('Play error:', playError)
            // Try again after a short delay
            await new Promise(resolve => setTimeout(resolve, 100))
            await videoElement.value.play()
          }
          
          scanningActive.value = true
          
          // Try native BarcodeDetector first
          if ('BarcodeDetector' in window) {
            barcodeDetector = new window.BarcodeDetector({
              formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code']
            })
            
            console.log('✅ Using native BarcodeDetector')
            
            scanInterval = setInterval(async () => {
              await detectBarcode()
            }, 300)
          } else {
            // Load ZXing fallback (for iOS/Safari)
            console.log('⚠️ BarcodeDetector not available, loading ZXing...')
            loadZXingScanner()
          }
        }
      } catch (error) {
        console.error('Camera error:', error)
        let errorMsg = 'ไม่สามารถเข้าถึงกล้องได้'
        
        if (error.name === 'NotAllowedError') {
          errorMsg = 'กรุณาอนุญาตการใช้กล้องในการตั้งค่าเบราว์เซอร์'
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'ไม่พบกล้องในอุปกรณ์นี้'
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'กล้องถูกใช้งานโดยแอปพลิเคชันอื่น'
        }
        
        errorMessage.value = errorMsg
        scanningActive.value = false
      }
    }
    
    const detectBarcode = async () => {
      if (!barcodeDetector || !videoElement.value || !scanningActive.value) return
      
      try {
        const barcodes = await barcodeDetector.detect(videoElement.value)
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0]
          console.log('Barcode detected:', barcode.rawValue)
          
          scannedCode.value = barcode.rawValue
          
          // In count or receive mode, stop scanning temporarily
          if (selectedMode.value === 'count' || selectedMode.value === 'receive') {
            if (scanInterval) {
              clearInterval(scanInterval)
              scanInterval = null
            }
          }
          // In search mode, keep scanning running to detect duplicates
          
          await handleBarcodeScanned(barcode.rawValue)
        }
      } catch (error) {
        // Ignore detection errors
      }
    }
    
    const loadZXingScanner = () => {
      if (window.ZXing && window.ZXing.BrowserMultiFormatReader) {
        initZXingReader()
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js'
      script.onload = () => initZXingReader()
      script.onerror = () => {
        errorMessage.value = 'ไม่สามารถโหลดตัวสแกนได้'
      }
      document.head.appendChild(script)
    }
    
    const initZXingReader = () => {
      try {
        const codeReader = new window.ZXing.BrowserMultiFormatReader()
        
        console.log('✅ ZXing initialized, starting continuous scan...')
        
        // Use decodeFromVideoDevice for continuous scanning
        codeReader.decodeFromVideoDevice(undefined, videoElement.value, (result, error) => {
          if (result) {
            console.log('✅ ZXing barcode detected:', result.text)
            
            // Only process if scanning is active and no code is currently being processed
            if (scanningActive.value && !scannedCode.value) {
              scannedCode.value = result.text
              
              // In count or receive mode, stop scanning temporarily
              if (selectedMode.value === 'count' || selectedMode.value === 'receive') {
                codeReader.reset()
              }
              
              handleBarcodeScanned(result.text)
            }
          }
          
          // Ignore errors (they happen continuously when no barcode is visible)
          if (error && error.name !== 'NotFoundException') {
            console.warn('ZXing scan error:', error.name)
          }
        })
        
        console.log('✅ ZXing continuous scanning started')
      } catch (error) {
        console.error('ZXing initialization error:', error)
        errorMessage.value = 'ไม่สามารถเริ่มตัวสแกนบาร์โค้ดได้'
      }
    }
    
    const playBeepSound = () => {
      try {
        // Create beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 1800 // Higher frequency for brighter beep sound
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        console.log('Could not play beep sound:', error)
      }
    }
    
    const playErrorSound = () => {
      try {
        // Create error sound (lower frequency, longer duration)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 400 // Lower frequency for error
        oscillator.type = 'square' // Square wave for harsh sound
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (error) {
        console.log('Could not play error sound:', error)
      }
    }
    
    const showErrorFlashAnimation = () => {
      showErrorFlash.value = true
      setTimeout(() => {
        showErrorFlash.value = false
      }, 300) // Flash for 300ms
    }
    
    const showSuccessFlashAnimation = () => {
      showSuccessFlash.value = true
      setTimeout(() => {
        showSuccessFlash.value = false
      }, 300) // Flash for 300ms
    }
    
    const parseBarcodeForReceive = (barcode) => {
      // Barcode format: 14 digits
      // model_code (3) + color_code (3) + fabric_width_cm (3) + lot_number (5)
      // Example: 41110212022222
      
      if (barcode.length !== 14) {
        return null
      }
      
      return {
        rawBarcode: barcode,
        model_code: barcode.substring(0, 3),      // 411
        color_code: barcode.substring(3, 6),      // 102
        fabric_width_cm: parseInt(barcode.substring(6, 9)), // 120
        lot_number: barcode.substring(9, 14)      // 22222
      }
    }
    
    const searchProductByParsedBarcode = async (parsed) => {
      // New function specifically for receive mode
      // Search product by model_code, color_code, fabric_width_cm using aggregate pipeline
      try {
        if (!inventoryService || !inventoryService.isReady()) {
          throw new Error('Inventory service ยังไม่พร้อม กรุณารอสักครู่')
        }
        
        console.log('🔍 Searching product by parsed barcode:', {
          model_code: parsed.model_code,
          color_code: parsed.color_code,
          fabric_width_cm: parsed.fabric_width_cm
        })
        
        // Use products/aggregate endpoint like searchProductByBarcode
        const response = await inventoryService.apiRequest.POST('products/aggregate', {
          pipeline: [
            {
              $match: {
                model_code: parsed.model_code,
                color_code: parsed.color_code,
                fabric_width_cm: parsed.fabric_width_cm,
                is_textile: true,
                status: { $ne: 'deleted' }
              }
            },
            { $limit: 10 }
          ]
        }, inventoryService.clientKey)
        
        const products = response?.data || []
        console.log(`✅ Found ${products.length} matching products`)
        
        return products
      } catch (error) {
        console.error('❌ Search product error:', error)
        throw new Error('ไม่สามารถค้นหาสินค้าได้: ' + (error.response?.data?.message || error.message))
      }
    }
    
    const searchProduct = async (barcode) => {
      loadingProduct.value = true
      errorMessage.value = ''
      scannedProduct.value = null
      scannedLot.value = null
      productLots.value = []
      
      try {
        console.log('Searching for barcode:', barcode)
        
        if (!inventoryService || !inventoryService.isReady()) {
          throw new Error('Inventory service ยังไม่พร้อม กรุณารอสักครู่')
        }
        
        // Search product from API (products + lot_tracking)
        const product = await inventoryService.searchProductByBarcode(barcode)
        
        if (product) {
          scannedProduct.value = product
          
          // If the search matched a specific lot, set it as scannedLot
          if (product.matchedLot) {
            scannedLot.value = product.matchedLot
          }
          
          // Load all lots for this product
          const lots = await inventoryService.getLotTracking(product.id)
          
          if (lots && lots.length > 0) {
            productLots.value = lots
            
            // If no matched lot yet, try to find it from the lot summary
            if (!scannedLot.value) {
              const exactLot = lots.find(lot => 
                lot.lot_code === barcode || 
                lot.full_lot_code === barcode ||
                lot.barcode === barcode
              )
              
              if (exactLot) {
                scannedLot.value = exactLot
              }
            }
          }
          
          // Don't emit event - just display the result
        } else {
          errorMessage.value = `ไม่พบสินค้าที่มี Barcode: ${barcode}`
        }
      } catch (error) {
        console.error('Search error:', error)
        errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการค้นหา'
      } finally {
        loadingProduct.value = false
      }
    }
    
    const handleBarcodeScanned = async (barcode) => {
      if (selectedMode.value === 'cut') {
        // Cut stock mode: Search for lot by barcode
        if (scanInterval) {
          clearInterval(scanInterval)
          scanInterval = null
        }
        
        loadingProduct.value = true
        errorMessage.value = ''
        
        try {
          if (!inventoryService || !inventoryService.isReady()) {
            throw new Error('Inventory service ยังไม่พร้อม กรุณารอสักครู่')
          }
          
          // Search for product/lot by barcode
          const product = await inventoryService.searchProductByBarcode(barcode)
          
          if (product) {
            // Found product, check if we have a matched lot
            let lot = product.matchedLot
            
            if (!lot) {
              // Try to find lot from lot tracking
              const lots = await inventoryService.getLotTracking(product.id)
              if (lots && lots.length > 0) {
                lot = lots.find(l => 
                  l.lot_code === barcode || 
                  l.full_lot_code === barcode ||
                  l.barcode === barcode
                )
                
                // If no exact match, use first available lot
                if (!lot) {
                  lot = lots.find(l => getAvailableMeters(l) > 0)
                }
              }
            }
            
            if (lot && getAvailableMeters(lot) > 0) {
              playBeepSound()
              showSuccessFlashAnimation()
              
              cutStockProduct.value = product
              cutStockLot.value = lot
              cutQuantityInput.value = ''
              scannedCode.value = ''
            } else {
              playErrorSound()
              showErrorFlashAnimation()
              errorMessage.value = lot ? 'Lot นี้ไม่มีสต็อคพร้อมใช้' : 'ไม่พบ Lot ที่มีสต็อค'
              
              setTimeout(() => {
                scannedCode.value = ''
                errorMessage.value = ''
                resetCutMode()
              }, 2000)
            }
          } else {
            playErrorSound()
            showErrorFlashAnimation()
            errorMessage.value = `ไม่พบสินค้า/Lot: ${barcode}`
            
            setTimeout(() => {
              scannedCode.value = ''
              errorMessage.value = ''
              resetCutMode()
            }, 2000)
          }
        } catch (error) {
          console.error('Cut mode search error:', error)
          errorMessage.value = error.message || 'เกิดข้อผิดพลาด'
          
          setTimeout(() => {
            scannedCode.value = ''
            errorMessage.value = ''
            resetCutMode()
          }, 2000)
        } finally {
          loadingProduct.value = false
        }
      } else if (selectedMode.value === 'receive') {
        // Receive mode: Two-step validation
        // Step 1: Check if this exact barcode already exists
        // Step 2: If not, check if product with model/color/width exists
        
        // Stop scanning while searching
        if (scanInterval) {
          clearInterval(scanInterval)
          scanInterval = null
        }
        
        loadingProduct.value = true
        errorMessage.value = ''
        
        try {
          // Parse barcode (14 digits)
          const parsed = parseBarcodeForReceive(barcode)
          
          if (!parsed) {
            // Invalid barcode format
            playErrorSound()
            showErrorFlashAnimation()
            errorMessage.value = `รูปแบบบาร์โค้ดไม่ถูกต้อง: ${barcode} (ต้องเป็น 14 หลัก)`
            
            setTimeout(() => {
              scannedCode.value = ''
              errorMessage.value = ''
              
              if (barcodeDetector && !scanInterval) {
                scanInterval = setInterval(async () => {
                  await detectBarcode()
                }, 300)
              }
            }, 2000)
            
            loadingProduct.value = false
            return
          }
          
          if (!inventoryService || !inventoryService.isReady()) {
            throw new Error('Inventory service ยังไม่พร้อม กรุณารอสักครู่')
          }
          
          // STEP 1: Check if this exact barcode already exists (like search mode)
          console.log('🔍 Step 1: Checking if barcode exists:', barcode)
          const existingProduct = await inventoryService.searchProductByBarcode(barcode)
          
          if (existingProduct) {
            // Barcode already exists - ERROR
            playErrorSound()
            showErrorFlashAnimation()
            errorMessage.value = `บาร์โค้ดนี้มีในระบบแล้ว: ${existingProduct.product_name || existingProduct.sku}`
            
            // Resume scanning after delay
            setTimeout(() => {
              scannedCode.value = ''
              errorMessage.value = ''
              
              if (barcodeDetector && !scanInterval) {
                scanInterval = setInterval(async () => {
                  await detectBarcode()
                }, 300)
              } else if (!zxingReader && window.ZXing) {
                // Re-initialize ZXing for receive mode
                initZXingReader()
              }
            }, 2000)
            
            loadingProduct.value = false
            return
          }
          
          // STEP 2: Barcode doesn't exist - now check if product with model/color/width exists
          console.log('✅ Step 1 passed: Barcode not found')
          console.log('🔍 Step 2: Searching product by model/color/width:', {
            model_code: parsed.model_code,
            color_code: parsed.color_code,
            fabric_width_cm: parsed.fabric_width_cm
          })
          
          const products = await searchProductByParsedBarcode(parsed)
          
          if (products && products.length > 0) {
            // Product EXISTS - allow receiving with length input
            const product = products[0]
            console.log('✅ Step 2 passed: Found product:', product.product_name || product.sku)
            
            playBeepSound()
            showSuccessFlashAnimation()
            receivedBarcode.value = {
              ...parsed,
              product: product // Store product info for later use
            }
            lengthInput.value = ''
            weightInput.value = ''
            activeInputField.value = 'length'
            scannedCode.value = ''
          } else {
            // Product does NOT exist - cannot receive (need product master data)
            playErrorSound()
            showErrorFlashAnimation()
            errorMessage.value = `ไม่พบข้อมูลสินค้า Model: ${parsed.model_code}, Color: ${parsed.color_code}, Width: ${parsed.fabric_width_cm} cm`
            
            // Resume scanning after delay
            setTimeout(() => {
              scannedCode.value = ''
              errorMessage.value = ''
              
              if (barcodeDetector && !scanInterval) {
                scanInterval = setInterval(async () => {
                  await detectBarcode()
                }, 300)
              } else if (!zxingReader && window.ZXing) {
                // Re-initialize ZXing for receive mode
                initZXingReader()
              }
            }, 2000)
          }
        } catch (error) {
          console.error('Search error:', error)
          errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการตรวจสอบ'
          
          // Resume scanning after delay
          setTimeout(() => {
            scannedCode.value = ''
            errorMessage.value = ''
            
            if (barcodeDetector && !scanInterval) {
              scanInterval = setInterval(async () => {
                await detectBarcode()
              }, 300)
            } else if (!zxingReader && window.ZXing) {
              // Re-initialize ZXing for receive mode
              initZXingReader()
            }
          }, 2000)
        } finally {
          loadingProduct.value = false
        }
      } else if (selectedMode.value === 'count') {
        // Count mode: Add to list if not duplicate
        const exists = scannedItems.value.some(item => item.barcode === barcode)
        
        if (!exists) {
          // Play beep sound and show green flash for new item
          playBeepSound()
          showSuccessFlashAnimation()
          
          const now = new Date()
          const timestamp = now.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
          
          // Create item with loading state
          const newItem = {
            barcode: barcode,
            timestamp: timestamp,
            scannedAt: now,
            product: null,
            loading: true
          }
          
          scannedItems.value.unshift(newItem)
          
          // Fetch product data in background
          fetchProductForCountItem(barcode)
        } else {
          // Duplicate barcode - show error effect
          playErrorSound()
          showErrorFlashAnimation()
        }
        
        // Reset for next scan immediately
        scannedCode.value = ''
        
        // Resume scanning
        if (!scanInterval && barcodeDetector) {
          scanInterval = setInterval(async () => {
            await detectBarcode()
          }, 300)
        } else if (!zxingReader && window.ZXing) {
          // Re-initialize ZXing if needed
          initZXingReader()
        }
      } else {
        // Search mode
        if (scannedProduct.value) {
          // Already have product - show error (error sound + flash)
          playErrorSound()
          showErrorFlashAnimation()
          
          // Clear scanned code after delay
          setTimeout(() => {
            scannedCode.value = ''
          }, 1000)
          
          // Keep scanning running - no need to resume
        } else {
          // No product yet - stop scanning while searching
          if (scanInterval) {
            clearInterval(scanInterval)
            scanInterval = null
          }
          
          playBeepSound()
          showSuccessFlashAnimation()
          await searchProduct(barcode)
          
          // After search completes, always resume scanning
          // This allows detection of duplicate scans when product is found
          if (barcodeDetector && !scanInterval) {
            scanInterval = setInterval(async () => {
              await detectBarcode()
            }, 300)
          }
          
          // Clear scanned code after delay
          setTimeout(() => {
            scannedCode.value = ''
          }, 2000)
        }
      }
    }
    
    // ========== CUT STOCK FUNCTIONS ==========
    
    // คำนวณจำนวนพร้อมใช้
    const getAvailableMeters = (lot) => {
      if (!lot) return 0
      const remaining = lot.remaining_meters || lot.calculated_meters || 0
      const reserved = lot.reserved_meters || 0
      return Math.max(0, remaining - reserved)
    }
    
    // Computed: ตรวจสอบ error จำนวนตัด
    const cutQuantityError = computed(() => {
      if (!cutQuantityInput.value) return ''
      const qty = parseFloat(cutQuantityInput.value)
      if (!cutStockLot.value) return ''
      
      const available = getAvailableMeters(cutStockLot.value)
      if (qty <= 0) return 'กรุณาใส่จำนวนที่มากกว่า 0'
      if (qty > available) return `จำนวนเกินที่พร้อมใช้ (สูงสุด ${formatNumber(available)} ม.)`
      return ''
    })
    
    // Numpad functions for cut mode
    const appendCutNumber = (num) => {
      if (cutQuantityInput.value.length < 10) {
        cutQuantityInput.value += num.toString()
      }
    }
    
    const appendCutDecimal = () => {
      if (!cutQuantityInput.value.includes('.')) {
        cutQuantityInput.value += '.'
      }
    }
    
    const deleteCutLastDigit = () => {
      cutQuantityInput.value = cutQuantityInput.value.slice(0, -1)
    }
    
    const clearCutQuantity = () => {
      cutQuantityInput.value = ''
    }
    
    // Reset cut mode (scan new lot)
    const resetCutMode = () => {
      cutStockLot.value = null
      cutStockProduct.value = null
      cutQuantityInput.value = ''
      scannedCode.value = ''
      errorMessage.value = ''
      
      // Resume scanning
      scanningActive.value = true
      if (barcodeDetector && !scanInterval) {
        scanInterval = setInterval(async () => {
          await detectBarcode()
        }, 300)
      } else if (!zxingReader && window.ZXing) {
        initZXingReader()
      }
    }
    
    // Handle cut stock button click -> show confirm modal
    const handleCutStock = () => {
      const qty = parseFloat(cutQuantityInput.value)
      if (!qty || qty <= 0 || cutQuantityError.value) {
        return
      }
      showCutConfirmModal.value = true
    }
    
    // Confirm and execute cut stock
    const confirmCutStock = async () => {
      const lot = cutStockLot.value
      const product = cutStockProduct.value
      const qty = parseFloat(cutQuantityInput.value)
      
      if (!lot || !product || !qty) return
      
      processingCut.value = true
      
      try {
        console.log('🔪 Starting cut stock process...')
        console.log('📦 Lot:', lot.lot_code, '| Qty:', qty, 'm')
        
        // ===== STEP 1: สร้าง Reservation (payment_status = 'paid') =====
        console.log('📝 Step 1: Creating reservation...')
        const reservationResult = await inventoryService.reserveLotStock({
          lot_id: lot._id,
          product_id: product._id || product.id,
          product_code: product.product_code || product.sku,
          product_name: product.product_name,
          lot_code: lot.lot_code,
          reservation_type: 'meters',
          reserved_meters: qty,
          reserved_weight_kg: null,
          payment_status: 'paid',
          status: 'paid',
          customer_name: 'ตัดสต็อค (Barcode Scanner)',
          customer_id: null,
          reference_type: 'manual',
          reference_id: null,
          reference_number: `CUT-${Date.now()}`,
          location: lot.rack_position || '',
          notes: `ตัดสต็อคผ่าน Barcode Scanner - ${new Date().toLocaleString('th-TH')}`,
          reserved_by: window.ERP_CORE?.auth?.user?.name || 'System'
        })
        
        if (!reservationResult || !reservationResult.success || !reservationResult.reservation) {
          throw new Error(reservationResult?.errors?.join(', ') || 'ไม่สามารถสร้าง Reservation ได้')
        }
        
        const reservationId = reservationResult.reservation._id
        console.log('✅ Reservation created:', reservationId)
        
        // ===== STEP 2: ตัดสต็อค =====
        console.log('✂️ Step 2: Cutting stock...')
        const cutResult = await inventoryService.cutLotStock({
          lot_id: lot._id,
          reservation_id: reservationId,
          cut_meters: qty,
          notes: `ตัดสต็อคผ่าน Barcode Scanner - ${lot.lot_code} - ${qty}m`
        })
        
        if (!cutResult || !cutResult.success) {
          throw new Error(cutResult?.errors?.join(', ') || cutResult?.message || 'ไม่สามารถตัดสต็อคได้')
        }
        
        console.log('✅ Stock cut successfully!')
        
        // แสดงข้อความสำเร็จ
        playBeepSound()
        showSuccessFlashAnimation()
        
        if (window.$toast) {
          window.$toast.success(`ตัดสต็อคสำเร็จ: ${lot.lot_code} จำนวน ${qty} ม.`)
        }
        
        // ปิด modal และ reset
        showCutConfirmModal.value = false
        resetCutMode()
        
      } catch (error) {
        console.error('❌ Cut stock error:', error)
        playErrorSound()
        showErrorFlashAnimation()
        
        if (window.$toast) {
          window.$toast.error(error.message || 'เกิดข้อผิดพลาดในการตัดสต็อค')
        }
      } finally {
        processingCut.value = false
      }
    }
    
    // ========== END CUT STOCK FUNCTIONS ==========
    
    const selectMode = (mode) => {
      selectedMode.value = mode
    }
    
    const backToModeSelection = () => {
      selectedMode.value = null
      scannedCode.value = ''
      scannedProduct.value = null
      scannedLot.value = null
      errorMessage.value = ''
      scannedItems.value = []
      receivedBarcode.value = null
      lengthInput.value = ''
      weightInput.value = ''
      activeInputField.value = 'length'
      
      // Reset cut stock states
      cutStockLot.value = null
      cutStockProduct.value = null
      cutQuantityInput.value = ''
      showCutConfirmModal.value = false
      processingCut.value = false
      
      // Resume scanning
      if (barcodeDetector && !scanInterval) {
        scanInterval = setInterval(async () => {
          await detectBarcode()
        }, 300)
      }
    }
    
    const appendNumber = (num) => {
      if (activeInputField.value === 'length') {
        lengthInput.value += num.toString()
      } else {
        weightInput.value += num.toString()
      }
    }
    
    const appendDecimal = () => {
      if (activeInputField.value === 'length') {
        if (!lengthInput.value.includes('.')) {
          lengthInput.value += '.'
        }
      } else {
        if (!weightInput.value.includes('.')) {
          weightInput.value += '.'
        }
      }
    }
    
    const deleteLastDigit = () => {
      if (activeInputField.value === 'length') {
        lengthInput.value = lengthInput.value.slice(0, -1)
      } else {
        weightInput.value = weightInput.value.slice(0, -1)
      }
    }
    
    const clearLengthInput = () => {
      if (activeInputField.value === 'length') {
        lengthInput.value = ''
      } else {
        weightInput.value = ''
      }
    }
    
    const confirmReceive = () => {
      const length = parseFloat(lengthInput.value)
      const weight = weightInput.value ? parseFloat(weightInput.value) : null
      
      // Validate: length is required
      if (!length || length <= 0) {
        alert('กรุณาระบุความยาว (ต้องมากกว่า 0)')
        activeInputField.value = 'length'
        return
      }
      
      if (receivedBarcode.value) {
        const receiveData = {
          barcode: receivedBarcode.value.rawBarcode,
          model_code: receivedBarcode.value.model_code,
          color_code: receivedBarcode.value.color_code,
          fabric_width_cm: receivedBarcode.value.fabric_width_cm,
          lot_number: receivedBarcode.value.lot_number,
          length_meters: length,
          weight_kg: weight // Optional
        }
        
        console.log('Confirm receive:', receiveData)
        
        // TODO: Emit event or save to backend
        let message = `รับสินค้าเข้าสำเร็จ\nบาร์โค้ด: ${receiveData.barcode}\nModel: ${receiveData.model_code}\nColor: ${receiveData.color_code}\nWidth: ${receiveData.fabric_width_cm} cm\nLot: ${receiveData.lot_number}\nความยาว: ${length} เมตร`
        
        if (weight) {
          message += `\nน้ำหนัก: ${weight} กก.`
        }
        
        alert(message)
        
        // Reset to ready state for next scan
        resetReceiveMode()
      }
    }
    
    const resetReceiveMode = () => {
      // Clear receive mode data
      receivedBarcode.value = null
      lengthInput.value = ''
      weightInput.value = ''
      activeInputField.value = 'length'
      scannedCode.value = ''
      errorMessage.value = ''
      
      // Resume camera and scanning
      if (!videoStream) {
        initCamera()
      } else {
        scanningActive.value = true
        if (barcodeDetector && !scanInterval) {
          scanInterval = setInterval(async () => {
            await detectBarcode()
          }, 300)
        } else if (!zxingReader && window.ZXing) {
          initZXingReader()
        }
      }
    }
    
    const clearScannedItems = () => {
      if (confirm('ต้องการล้างรายการที่สแกนทั้งหมดหรือไม่?')) {
        scannedItems.value = []
      }
    }
    
    const removeScannedItem = (barcode) => {
      scannedItems.value = scannedItems.value.filter(item => item.barcode !== barcode)
    }
    
    // Fetch product data for count mode item
    const fetchProductForCountItem = async (barcode) => {
      try {
        // Find item by barcode (since index might change)
        const item = scannedItems.value.find(i => i.barcode === barcode)
        if (!item) return
        
        // Search for product
        const searchResult = await window.ERP_CORE.inventory.searchProducts({
          query: barcode,
          page: 1,
          limit: 1
        })
        
        if (searchResult && searchResult.data && searchResult.data.length > 0) {
          const product = searchResult.data[0]
          
          // Get product balance
          const balanceResult = await window.ERP_CORE.inventory.getProductBalance(product._id)
          if (balanceResult) {
            product.balance = balanceResult
          }
          
          // Update item with product data
          item.product = product
        }
        
        item.loading = false
      } catch (error) {
        console.error('Error fetching product for count item:', error)
        const item = scannedItems.value.find(i => i.barcode === barcode)
        if (item) {
          item.loading = false
        }
      }
    }
    
    const resetScanner = () => {
      scannedCode.value = ''
      scannedProduct.value = null
      scannedLot.value = null
      productLots.value = []
      errorMessage.value = ''
      scanningActive.value = true
      
      // Resume scanning
      if (barcodeDetector && !scanInterval) {
        scanInterval = setInterval(async () => {
          await detectBarcode()
        }, 300)
      } else if (!zxingReader && window.ZXing) {
        // Re-initialize ZXing if needed
        initZXingReader()
      }
    }
    
    const viewProductDetails = () => {
      if (scannedProduct.value) {
        // Just close the modal, don't navigate
        closeScanner()
      }
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'ใช้งาน',
        inactive: 'ไม่ใช้งาน',
        discontinued: 'ยกเลิก',
        deleted: 'ลบแล้ว'
      }
      return labels[status] || status
    }
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num || 0)
    }
    
    // Lifecycle
    onMounted(() => {
      // Disable body scroll when modal opens
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      
      initCamera()
    })
    
    onUnmounted(() => {
      // Re-enable body scroll when modal closes
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      
      stopCamera()
    })
    
    return {
      videoElement,
      scanningActive,
      scannedCode,
      scannedProduct,
      scannedLot,
      productLots,
      loadingProduct,
      errorMessage,
      selectedMode,
      scannedItems,
      showErrorFlash,
      showSuccessFlash,
      receivedBarcode,
      lengthInput,
      weightInput,
      activeInputField,
      closeScanner,
      resetScanner,
      viewProductDetails,
      getStatusLabel,
      formatNumber,
      selectMode,
      backToModeSelection,
      clearScannedItems,
      removeScannedItem,
      appendNumber,
      appendDecimal,
      deleteLastDigit,
      clearLengthInput,
      confirmReceive,
      resetReceiveMode,
      
      // Cut stock
      cutStockLot,
      cutStockProduct,
      cutQuantityInput,
      showCutConfirmModal,
      processingCut,
      cutQuantityError,
      getAvailableMeters,
      appendCutNumber,
      appendCutDecimal,
      deleteCutLastDigit,
      clearCutQuantity,
      resetCutMode,
      handleCutStock,
      confirmCutStock
    }
  }
}
</script>

<style scoped>
/* Scanning Line Animation */
.scanning-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  box-shadow: 0 0 10px #10b981;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Error Flash Animation */
.error-flash {
  animation: flash 0.3s ease-in-out;
}

@keyframes flash {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
}

/* Success Flash Animation */
.success-flash {
  animation: flash 0.3s ease-in-out;
}
</style>
