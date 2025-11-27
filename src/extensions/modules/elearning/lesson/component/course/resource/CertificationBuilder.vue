<template>
  <!-- Main Container -->
  <div class="flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden" style="height: calc(100vh - 81px);">
    <!-- Left Sidebar - Elements Panel -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      <!-- Sidebar Header -->
      <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <font-awesome-icon :icon="['fas','puzzle-piece']" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">องค์ประกอบ</h3>
            <p class="text-xs text-gray-500">เลือกเพื่อเพิ่มลงในใบรับรอง</p>
          </div>
        </div>
        
        <!-- Background Selection -->
        <div class="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
          <label class="block text-xs font-medium text-gray-700 mb-1">พื้นหลังใบรับรอง</label>
          <button 
            @click="OpenFileBrowser" 
            class="w-full flex items-center justify-center px-2 py-1.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <div class="text-center">
              <div class="w-5 h-5 mx-auto mb-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                <font-awesome-icon :icon="['fas','image']" class="text-sm" />
              </div>
              <div class="text-xs font-medium text-gray-600 group-hover:text-blue-700">เลือกรูปพื้นหลัง</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Elements List -->
      <div class="flex-1 overflow-y-auto p-3 min-h-0">
        <div class="space-y-2">
          <div v-for="element in disabledSidebarElements" :key="element.id" class="group">
            <button 
              @click="addElementToPage(element)" 
              :disabled="element.disabled"
              class="w-full text-left p-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:bg-blue-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md"
                     :class="getElementIconBg(element.type, element.use)">
                  <font-awesome-icon :icon="['fas', getElementIcon(element.type, element.use)]" class="text-xs" />
                </div>
                <div class="flex-1 text-left">
                  <div class="text-xs font-semibold text-gray-900">{{ element.text }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ getElementTypeLabel(element.type) }}</div>
                </div>
                <div class="flex-shrink-0">
                  <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <font-awesome-icon :icon="['fas', 'plus']" class="text-xs text-blue-600" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Page Configuration -->
      <div class="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 flex-shrink-0">
        <h4 class="text-xs font-semibold text-gray-900 mb-2">การตั้งค่าหน้า</h4>
        
        <div class="space-y-2">
          <!-- Page Name -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อหน้า</label>
            <input
              type="text"
              v-model="pages[0].name"
              placeholder="ชื่อหน้า"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>

          <!-- Padding -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ระยะขอบ</label>
            <input
              type="text"
              v-model="pages[0].padding"
              placeholder="เช่น 1cm"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>

          <!-- Download Permission -->
          <div>
            <label class="flex items-center space-x-2">
              <input type="checkbox" v-model="pages[0].allowDownload" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-xs text-gray-700">อนุญาตให้ดาวน์โหลดใบรับรอง</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">{{ pages[0].allowDownload ? 'ผู้ใช้สามารถดาวน์โหลดใบรับรองได้' : 'ไม่อนุญาตให้ดาวน์โหลด' }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-1">
            <button 
              @click="togglePreview" 
              class="flex-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors">
              <font-awesome-icon :icon="['fas', showPreview ? 'edit' : 'eye']" class="mr-1" />
              {{ showPreview ? 'แก้ไข' : 'ตัวอย่าง' }}
            </button>
            <button 
              @click="sendDataToParent" 
              class="flex-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm">
              <font-awesome-icon :icon="['fas','save']" class="mr-1" />
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Center Area - Canvas -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Canvas Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <font-awesome-icon :icon="['fas','certificate']" class="text-white text-sm" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">{{ certName || 'ตัวสร้างใบรับรอง' }}</h2>
              <p class="text-xs text-gray-500">{{ pages[0].landscapeMode ? 'A4 แนวนอน' : 'A4 แนวตั้ง' }} • {{ pages[0].elements.length }} องค์ประกอบ</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Preview Button -->
            <button 
              @click="togglePreview"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm">
              <font-awesome-icon :icon="['fas', showPreview ? 'edit' : 'eye']" class="mr-1" />
              {{ showPreview ? 'แก้ไข' : 'ตัวอย่าง' }}
            </button>
            
            <!-- Orientation Toggle -->
            <button 
              @click="toggleLayout"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <font-awesome-icon :icon="['fas', pages[0].landscapeMode ? 'mobile-alt' : 'tablet-alt']" class="mr-1" />
              {{ pages[0].landscapeMode ? 'แนวตั้ง' : 'แนวนอน' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="flex-1 p-4 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-0">
        <div class="flex justify-center items-center h-full">
          <div 
            v-for="(page, pageIndex) in pages"
            :key="pageIndex"
            class="page relative bg-white border border-gray-300 shadow-2xl rounded-lg overflow-hidden"
            :class="{ 
              landscape: page.landscapeMode,
              'page-with-grid': !showPreview
            }"
            :style="{
              'padding': page.padding,
              'background-image': 'url(' + page.backgroundImage + ')',
              'background-size': 'cover',
              'background-repeat': 'no-repeat',
              'transform': getPageScale(),
              'transform-origin': 'center center'
            }">
            
            <!-- Empty State (only show in edit mode) -->
            <div v-if="!showPreview && (!page.elements || page.elements.length === 0)" 
                 class="absolute inset-0 flex items-center justify-center text-gray-400">
              <div class="text-center p-6">
                <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','plus-circle']" class="text-2xl text-gray-400" />
                </div>
                <h3 class="text-base font-medium text-gray-600 mb-2">เริ่มต้นออกแบบใบรับรอง</h3>
                <p class="text-sm text-gray-500">คลิกเพิ่มองค์ประกอบจากแผงด้านซ้าย</p>
              </div>
            </div>
            
            <!-- Elements -->
            <div 
              v-for="element in page.elements" 
              :key="element.id"
              class="element-preview"
              :class="{ 
                'preview-mode': showPreview,
                'element-selected': element.showOptions && !showPreview,
                'watermark-element': element.use === 'watermark',
                'stamp-element': element.use === 'stamp',
                'general-image-element': element.use === 'general'
              }"
              @click="!showPreview && selectElement(element)"
              :style="{
                'margin-top': element.marginTop + 'cm',
                'margin-bottom': element.marginBottom + 'cm',
                'font-size': (element.type === 'text' || (element.type === 'watermark' && element.watermarkType === 'text')) ? element.fontSize : 'inherit',
                'font-weight': (element.type === 'text' || (element.type === 'watermark' && element.watermarkType === 'text')) ? (element.bold ? 'bold' : 'normal') : 'inherit',
                'font-style': (element.type === 'text' || (element.type === 'watermark' && element.watermarkType === 'text')) ? (element.italic ? 'italic' : 'normal') : 'inherit',
                'text-decoration': (element.type === 'text' || (element.type === 'watermark' && element.watermarkType === 'text')) ? (element.underline ? 'underline' : 'none') : 'inherit',
                'color': (element.type === 'watermark' && element.watermarkType === 'text') ? element.fontColor : 'inherit',
                'width': (element.type === 'image' || (element.type === 'watermark' && element.watermarkType === 'image')) ? element.width : 'auto',
                'height': (element.type === 'image' || (element.type === 'watermark' && element.watermarkType === 'image')) ? element.height : 'auto',
                'position': (element.type === 'image' || element.type === 'watermark') ? 'absolute' : 'static',
                'top': getElementPosition(element, 'top'),
                'bottom': getElementPosition(element, 'bottom'),
                'left': getElementPosition(element, 'left'),
                'right': getElementPosition(element, 'right'),
                'transform': getElementTransform(element),
                'margin-left': element.marginLeft + 'cm',
                'margin-right': element.marginRight + 'cm',
                'opacity': element.opacity || 1,
                'z-index': element.zIndex || 'auto',
                // ปิดกรอบและพื้นหลังสำหรับรูปภาพทั่วไป
                'border': element.use === 'general' ? 'none' : '',
                'background': element.use === 'general' ? 'transparent' : '',
                'padding': element.use === 'general' ? '0' : ''
              }">
              
              <!-- Watermark Element -->
              <div v-if="element.type === 'watermark'">
                <!-- Text Watermark -->
                <div v-if="element.watermarkType === 'text'" class="watermark-text">
                  {{ element.value }}
                </div>
                <!-- Image Watermark -->
                <div v-else>
                  <img :src="element.url" alt="Watermark" style="max-width: 100%;" 
                       class="watermark-image"
                       :style="{
                         'transform': element.rotation ? `rotate(${element.rotation}deg)` : 'none',
                         'transform-origin': 'center center'
                       }" />
                </div>
              </div>
              
              <!-- Regular Image Element -->
              <div v-else-if="element.type === 'image'">
                <!-- กรอบสำหรับรูปภาพทั่วไป -->
                <div v-if="element.use === 'general'" 
                     class="image-frame"
                     :class="{ 
                        'frame-visible': !showPreview && element.showOptions,
                        'frame-hidden': showPreview || !element.showOptions
                     }"
                     :style="{
                       'width': element.width,
                       'height': element.height,
                     }">
                  <img v-if="element.url" 
                       :src="element.url" 
                       alt="General Image" 
                       :style="{
                         'width': '100%',
                         'height': '100%',
                         'object-fit': element.objectFit || 'cover',
                         'transform': element.rotation ? `rotate(${element.rotation}deg)` : 'none',
                         'transform-origin': 'center center'
                       }" />
                  <div v-else class="placeholder-content"
                       :style="{
                         'color': '#6b7280',
                         'font-size': '12px',
                         'text-align': 'center',
                         'padding': '10px'
                       }">
                    <font-awesome-icon :icon="['fas','image']" class="text-2xl mb-2" />
                    <div>คลิกเพื่อเลือกรูปภาพ</div>
                  </div>
                </div>
                
                <!-- รูปภาพแบบเดิมสำหรับ stamp, qrcode, avatar -->
                <img v-else 
                     :src="element.url" 
                     alt="Image" 
                     style="max-width: 100%;" 
                     :class="{
                       'stamp-image': element.use === 'stamp'
                     }"
                     :style="{
                       'width': element.width || 'auto',
                       'height': element.height || 'auto',
                       'transform': element.rotation ? `rotate(${element.rotation}deg)` : 'none',
                       'transform-origin': 'center center',
                       'object-fit': 'contain'
                     }" />
                <p v-if="element.caption">{{ element.value }}</p>
              </div>
              
              <!-- Text Element -->
              <div v-else>
                <template v-if="element.use === 'text'">
                  {{ element.value }}
                </template>
                <template v-else-if="element.use === 'date'">
                  <div v-html="getDisplayDate(element).replace(/\n/g, '<br>')"></div>
                </template>
                <template v-else-if="element.use === 'name'">
                  {{ getDisplayName(element) }}
                </template>
                <template v-else>
                  {{ element.start }}{{ element.text }}{{ element.end }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar - Properties Panel -->
    <div class="w-72 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <!-- Properties Header -->
      <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
            <font-awesome-icon :icon="['fas','sliders-h']" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">คุณสมบัติ</h3>
            <p class="text-xs text-gray-500">จัดการองค์ประกอบในใบรับรอง</p>
          </div>
        </div>
      </div>

      <!-- Properties Content -->
      <div class="flex-1 overflow-y-auto p-3 min-h-0">
        <div v-if="pages[0].elements.length > 0" class="space-y-2">
          <div v-for="(element, index) in pages[0].elements" :key="element.id" 
               class="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            
            <!-- Element Header -->
            <div class="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
              <button @click="toggleOptions(element)" class="flex items-center space-x-2 flex-1 text-left">
                <div class="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
                     :class="getElementIconBg(element.type, element.use)">
                  <font-awesome-icon :icon="['fas', getElementIcon(element.type, element.use)]" />
                </div>
                <div>
                  <div class="font-semibold text-gray-900 text-xs">{{ element.text }}</div>
                  <div class="text-xs text-gray-500">{{ getElementTypeLabel(element.type) }}</div>
                </div>
              </button>
              
              <div class="flex items-center space-x-1">
                <button @click="moveElementUp(0, index)" 
                        class="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <font-awesome-icon :icon="['fas','chevron-up']" class="text-xs text-gray-600"/>
                </button>
                <button @click="moveElementDown(0, index)" 
                        class="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <font-awesome-icon :icon="['fas','chevron-down']" class="text-xs text-gray-600"/>
                </button>
                <button @click="removeElement(0, element)" 
                        class="w-5 h-5 rounded-md bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                  <font-awesome-icon :icon="['fas','trash']" class="text-xs text-red-600"/>
                </button>
              </div>
            </div>
            
            <!-- Element Properties -->
            <div v-if="element.showOptions" class="p-2 space-y-3">
              <!-- Margin Controls -->
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
                <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <font-awesome-icon :icon="['fas','arrows-alt']" class="mr-1 text-blue-600" />
                  ระยะห่าง
                </h5>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">ด้านบน</label>
                    <div class="flex items-center space-x-1">
                      <button @click="decreaseTopMargin(0, element)" 
                              class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                        <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                      </button>
                      <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                        {{ parseFloat(element.marginTop).toFixed(1) }}
                      </div>
                      <button @click="increaseTopMargin(0, element)" 
                              class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                        <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">ด้านล่าง</label>
                    <div class="flex items-center space-x-1">
                      <button @click="decreaseBottomMargin(0, element)" 
                              class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                        <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                      </button>
                      <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                        {{ parseFloat(element.marginBottom).toFixed(1) }}
                      </div>
                      <button @click="increaseBottomMargin(0, element)" 
                              class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                        <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Text Properties -->
              <div v-if="element.type === 'text'" class="space-y-2">
                <!-- Text Content -->
                <div v-if="element.use === 'text'" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','font']" class="mr-1 text-purple-600" />
                    ข้อความ
                  </h5>
                  <input type="text" v-model="element.value" 
                         class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                         placeholder="ใส่ข้อความ">
                </div>

                <!-- Name Properties -->
                <div v-if="element.use === 'name'" class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','id-card']" class="mr-1 text-indigo-600" />
                    การตั้งค่าชื่อ-นามสกุล
                  </h5>
                  
                  <div class="space-y-2">
                    <!-- Prefix Display Toggle -->
                    <div>
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" v-model="element.showPrefix" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-xs text-gray-700">แสดงคำนำหน้าชื่อ</span>
                      </label>
                      <p class="text-xs text-gray-500 mt-1">{{ element.showPrefix ? 'จะแสดงคำนำหน้าชื่อก่อนชื่อ-นามสกุล' : 'แสดงเฉพาะชื่อ-นามสกุล' }}</p>
                    </div>

                    <!-- Prefix Settings (only show when showPrefix is true) -->
                    <div v-if="element.showPrefix" class="space-y-2 border-l-2 border-indigo-200 pl-3 ml-1 bg-white rounded-md p-2">
                      <div class="text-xs font-medium text-indigo-700 mb-1">
                        <font-awesome-icon :icon="['fas','cog']" class="mr-1" />
                        การตั้งค่าคำนำหน้า
                      </div>
                      
                      <!-- Data Mapping -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Data Mapping สำหรับคำนำหน้า</label>
                        <input type="text" v-model="element.prefixMapping" 
                               class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                               placeholder="เช่น title, prefix, honorific">
                        <p class="text-xs text-gray-500 mt-1">
                          <font-awesome-icon :icon="['fas','info-circle']" class="mr-1" />
                          กำหนดชื่อฟิลด์ในข้อมูลที่ต้องการนำมาแสดง
                        </p>
                      </div>
                      
                      <!-- Fallback Prefix -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">คำนำหน้าสำรอง</label>
                        <input type="text" v-model="element.fallbackPrefix" 
                               class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                               placeholder="เช่น คุณ, นาย, นาง, ดร.">
                        <p class="text-xs text-gray-500 mt-1">
                          <font-awesome-icon :icon="['fas','shield-alt']" class="mr-1" />
                          ข้อความที่แสดงเมื่อไม่พบข้อมูลจาก mapping หรือข้อมูลว่าง
                        </p>
                      </div>
                      
                      <!-- Preview -->
                      <div class="bg-gray-50 rounded-md p-2 border border-gray-200">
                        <div class="text-xs text-gray-600 mb-1">ตัวอย่างการแสดงผล:</div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ getDisplayName(element) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Date Properties -->
                <div v-if="element.use === 'date'" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','calendar']" class="mr-1 text-green-600" />
                    การตั้งค่าวันที่
                  </h5>
                  
                  <div class="space-y-2">
                    <!-- Date Display Options -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-2">การแสดงวันที่</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="element.showIssueDate" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span class="text-xs text-gray-700">แสดงวันที่ออกใบรับรอง</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="element.showExpiryDate" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span class="text-xs text-gray-700">แสดงวันที่หมดอายุ</span>
                        </label>
                      </div>
                    </div>

                    <!-- Certificate Validity Period -->
                    <div v-if="element.showExpiryDate">
                      <label class="block text-xs font-medium text-gray-700 mb-1">อายุใบรับรอง (ปี)</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustCertificateValidity(element, false)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <input type="number" v-model.number="element.validityYears" min="1" max="10"
                               class="flex-1 text-center text-xs font-medium border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                               placeholder="ปี">
                        <button @click="adjustCertificateValidity(element, true)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">ใบรับรองจะหมดอายุหลังจากวันที่ออกใบรับรอง {{ element.validityYears || 1 }} ปี</p>
                    </div>
                    
                    <!-- Date Separator (only show when both dates are selected) -->
                    <div v-if="element.showIssueDate && element.showExpiryDate">
                      <label class="block text-xs font-medium text-gray-700 mb-1">เครื่องหมายคั่นระหว่างวันที่</label>
                      <select v-model="element.dateSeparator" 
                              class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                        <option value=" | ">เส้นแนวตั้ง ( | )</option>
                        <option value=" - ">เส้นขีด ( - )</option>
                        <option value=", ">จุลภาค ( , )</option>
                        <option value=" / ">เส้นทับ ( / )</option>
                        <option value=" • ">จุดกลม ( • )</option>
                        <option value="\n">บรรทัดใหม่</option>
                        <option value="custom">กำหนดเอง</option>
                      </select>
                      
                      <!-- Custom separator input -->
                      <div v-if="element.dateSeparator === 'custom'" class="mt-2">
                        <label class="block text-xs font-medium text-gray-700 mb-1">เครื่องหมายคั่นที่ต้องการ</label>
                        <input type="text" v-model="element.customSeparator" 
                               class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                               placeholder="เช่น :: หรือ ถึง">
                      </div>
                    </div>
                    
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="element.useMultipleDates" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span class="text-xs text-gray-700">วันออกใบรับรองแบบมีเงื่อนไข</span>
                    </label>
                    
                    <div v-if="element.useMultipleDates" class="space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="text-xs font-medium text-gray-700">วันที่ออกใบรับรอง</span>
                        <button @click="addDateItem(element)" 
                                class="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">
                          เพิ่มเงื่อนไข
                        </button>
                      </div>
                      
                      <div v-for="(item, index) in element.dateItems" :key="`date-${element.id}-${index}`" 
                           class="border border-gray-200 rounded-md p-2 bg-white">
                        <div class="flex justify-between items-center mb-1">
                          <button @click="item.isExpanded = !item.isExpanded" 
                                  class="text-xs text-green-600 hover:text-green-700 font-medium">
                            {{ formatThaidate(item.date) || 'เลือกวันที่' }}
                          </button>
                          <button @click="removeDateItem(element, index)" 
                                  class="text-red-500 hover:text-red-700">
                            <font-awesome-icon :icon="['fas','trash']" class="text-xs"/>
                          </button>
                        </div>
                        
                        <div v-if="item.isExpanded" class="space-y-1">
                          <datepicker v-model="item.date" :clearable="true" class="text-xs" />
                          <input type="text" v-model="item.mapping" placeholder="Master mapping" 
                                 class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                          <input type="text" v-model="item.keyword" placeholder="Keyword mapping" 
                                 class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                        </div>
                      </div>
                    </div>
                    
                    <div v-else>
                      <label class="block text-xs font-medium text-gray-700 mb-1">วันที่ออกใบรับรอง</label>
                      <datepicker v-model="element.singleDate" :clearable="true" />
                    </div>
                  </div>
                </div>

                <!-- Text Styling -->
                <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','palette']" class="mr-1 text-indigo-600" />
                    รูปแบบตัวอักษร
                  </h5>
                  
                  <div class="space-y-2">
                    <!-- Font Size -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ขนาดตัวอักษร</label>
                      <div class="flex items-center space-x-1">
                        <button @click="changeFontSize(0, element, 'decrease')" 
                                class="w-5 h-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ parseFloat(element.fontSize).toFixed(0) }}px
                        </div>
                        <button @click="changeFontSize(0, element, 'increase')" 
                                class="w-5 h-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Font Style -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบ</label>
                      <div class="flex space-x-1">
                        <button @click="toggleBold(0, element)" 
                                :class="element.bold ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                                class="flex-1 px-2 py-1 text-xs font-bold rounded-md transition-colors">
                          B
                        </button>
                        <button @click="toggleItalic(0, element)" 
                                :class="element.italic ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                                class="flex-1 px-2 py-1 text-xs italic rounded-md transition-colors">
                          I
                        </button>
                        <button @click="toggleUnderline(0, element)" 
                                :class="element.underline ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                                class="flex-1 px-2 py-1 text-xs underline rounded-md transition-colors">
                          U
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Text Prefix/Suffix -->
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','quote-left']" class="mr-1 text-yellow-600" />
                    ข้อความเสริม
                  </h5>
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ข้อความเริ่มต้น</label>
                      <input type="text" v-model="element.start" 
                             class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                             placeholder="ข้อความที่แสดงก่อน">
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ข้อความลงท้าย</label>
                      <input type="text" v-model="element.end" 
                             class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                             placeholder="ข้อความที่แสดงหลัง">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Properties -->
              <div v-else-if="element.type === 'image'" class="space-y-2">
                <!-- Position -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','crosshairs']" class="mr-1 text-purple-600" />
                    ตำแหน่ง
                  </h5>
                  <select v-model="element.cornerPosition" 
                          class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option value="top left">ซ้ายบน</option>
                    <option value="top right">ขวาบน</option>
                    <option value="bottom left">ซ้ายล่าง</option>
                    <option value="bottom right">ขวาล่าง</option>
                  </select>
                </div>

                <!-- Image Margins -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','expand-arrows-alt']" class="mr-1 text-green-600" />
                    ระยะห่าง
                  </h5>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ด้านซ้าย</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustMargin(0, element, 'marginLeft', false)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ parseFloat(element.marginLeft).toFixed(1) }}
                        </div>
                        <button @click="adjustMargin(0, element, 'marginLeft', true)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ด้านขวา</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustMargin(0, element, 'marginRight', false)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ parseFloat(element.marginRight).toFixed(1) }}
                        </div>
                        <button @click="adjustMargin(0, element, 'marginRight', true)" 
                                class="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Image Size -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','expand']" class="mr-1 text-blue-600" />
                    ขนาด
                  </h5>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ความกว้าง</label>
                      <div class="flex items-center space-x-1">
                        <button @click="decreaseWidth(0, element)" 
                                class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ element.width }}
                        </div>
                        <button @click="increaseWidth(0, element)" 
                                class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ความสูง</label>
                      <div class="flex items-center space-x-1">
                        <button @click="decreaseHeight(0, element)" 
                                class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ element.height }}
                        </div>
                        <button @click="increaseHeight(0, element)" 
                                class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Caption -->
                <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','comment']" class="mr-1 text-gray-600" />
                    คำอธิบาย
                  </h5>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="element.caption" class="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                      <span class="text-xs text-gray-700">แสดงคำอธิบาย</span>
                    </label>
                    
                    <div v-if="element.caption">
                      <label class="block text-xs font-medium text-gray-700 mb-1">เลือกข้อความที่แสดง</label>
                      <select v-model="element.value" 
                              class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors">
                        <option value="code">Code</option>
                        <option value="id">ID</option>
                        <option value="slug">Slug</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- General Image Properties -->
                <div v-if="element.use === 'general'" class="space-y-2">
                  <!-- Image Selection -->
                  <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-2">
                    <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <font-awesome-icon :icon="['fas','image']" class="mr-1 text-emerald-600" />
                      เลือกรูปภาพ
                    </h5>
                    <button 
                      @click="openGeneralImageFileBrowser(element)" 
                      class="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group">
                      <div class="text-center">
                        <div class="w-6 h-6 mx-auto mb-1 text-emerald-400 group-hover:text-emerald-500 transition-colors">
                          <font-awesome-icon :icon="['fas','image']" class="text-sm" />
                        </div>
                        <div class="text-xs font-medium text-emerald-600 group-hover:text-emerald-700">{{ element.url ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ' }}</div>
                        <div v-if="element.url" class="text-xs text-gray-500 mt-1 truncate max-w-32">
                          {{ element.url.split('/').pop() }}
                        </div>
                      </div>
                    </button>
                  </div>

                  <!-- Ratio Settings -->
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
                    <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <font-awesome-icon :icon="['fas','crop']" class="mr-1 text-blue-600" />
                      การจัดขนาด
                    </h5>
                    <div class="space-y-2">
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" v-model="element.maintainRatio" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span class="text-xs text-gray-700">รักษาสัดส่วนรูปภาพ</span>
                      </label>
                      
                      <div v-if="!element.maintainRatio" class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ความกว้าง</label>
                          <div class="flex items-center space-x-1">
                            <button @click="decreaseWidth(0, element)" 
                                    class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                            </button>
                            <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                              {{ parseInt(element.width) }}px
                            </div>
                            <button @click="increaseWidth(0, element)" 
                                    class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ความสูง</label>
                          <div class="flex items-center space-x-1">
                            <button @click="decreaseHeight(0, element)" 
                                    class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                            </button>
                            <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                              {{ parseInt(element.height) }}px
                            </div>
                            <button @click="increaseHeight(0, element)" 
                                    class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-else>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ความกว้าง (ความสูงจะปรับตามสัดส่วน)</label>
                        <div class="flex items-center space-x-1">
                          <button @click="adjustImageWidth(element, false)" 
                                  class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                          </button>
                          <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                            {{ parseInt(element.width) }}px
                          </div>
                          <button @click="adjustImageWidth(element, true)" 
                                  class="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                          </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">ความสูง: {{ Math.round(parseInt(element.width) / (element.aspectRatio || 1)) }}px</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Image Fit Mode -->
                  <div class="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-2">
                    <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <font-awesome-icon :icon="['fas','expand-alt']" class="mr-1 text-purple-600" />
                      การแสดงผลในกรอบ
                    </h5>
                    
                    <!-- Frame Visibility Toggle -->
                    <div class="mb-2">
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" v-model="element.showFrame" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span class="text-xs text-gray-700">แสดงกรอบรูปภาพ (เฉพาะโหมดแก้ไข)</span>
                      </label>
                    </div>
                    
                    <select v-model="element.objectFit" 
                            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                      <option value="cover">เต็มกรอบ (ครอบคลุม)</option>
                      <option value="contain">พอดีกรอบ (แสดงทั้งหมด)</option>
                      <option value="fill">ยืดเต็มกรอบ</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ element.objectFit === 'cover' ? 'รูปภาพจะเต็มกรอบ แต่อาจถูกตัดส่วนเกิน' : 
                         element.objectFit === 'contain' ? 'รูปภาพจะแสดงทั้งหมดภายในกรอบ' : 
                         'รูปภาพจะยืดให้เต็มกรอบ' }}
                    </p>
                  </div>
                </div>

                <!-- Watermark Properties -->
                <div v-else-if="element.type === 'watermark'" class="space-y-2">
                  <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-2">
                    <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <font-awesome-icon :icon="['fas','water']" class="mr-1 text-cyan-600" />
                      การตั้งค่าลายน้ำ
                    </h5>
                    <div class="space-y-2">
                      <!-- Watermark Type Selection -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ประเภทลายน้ำ</label>
                        <select v-model="element.watermarkType" 
                                class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                          <option value="image">รูปภาพ</option>
                          <option value="text">ข้อความ</option>
                        </select>
                      </div>

                      <!-- Position Selection -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                        <select v-model="element.cornerPosition" 
                                class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                          <option value="center">ตรงกลาง</option>
                          <option value="top">ติดด้านบน</option>
                          <option value="bottom">ชิดด้านล่าง</option>
                        </select>
                      </div>

                      <!-- Text Watermark Properties -->
                      <div v-if="element.watermarkType === 'text'" class="space-y-2">
                        <!-- Text Content -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ข้อความลายน้ำ</label>
                          <input type="text" v-model="element.value" 
                                 class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" 
                                 placeholder="ใส่ข้อความลายน้ำ">
                        </div>

                        <!-- Font Size -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">ขนาดตัวอักษร</label>
                          <div class="flex items-center space-x-1">
                            <button @click="changeWatermarkFontSize(element, 'decrease')" 
                                    class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                            </button>
                            <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                              {{ parseFloat(element.fontSize).toFixed(0) }}px
                            </div>
                            <button @click="changeWatermarkFontSize(element, 'increase')" 
                                    class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                            </button>
                          </div>
                        </div>

                        <!-- Font Color -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">สีตัวอักษร</label>
                          <input type="color" v-model="element.fontColor" 
                                 class="w-full h-8 border border-gray-300 rounded-md cursor-pointer">
                        </div>

                        <!-- Text Rotation -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">องศาการเอียง</label>
                          <div class="flex items-center space-x-1">
                            <button @click="adjustTextRotation(element, false)" 
                                    class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                            </button>
                            <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                              {{ element.textRotation || -45 }}°
                            </div>
                            <button @click="adjustTextRotation(element, true)" 
                                    class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                              <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Image Watermark Properties -->
                      <div v-if="element.watermarkType === 'image'" class="space-y-2">
                        <!-- Image Selection -->
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">เลือกรูปภาพลายน้ำ</label>
                          <button 
                            @click="openWatermarkFileBrowser(element)" 
                            class="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-cyan-300 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 group">
                            <div class="text-center">
                              <div class="w-6 h-6 mx-auto mb-1 text-cyan-400 group-hover:text-cyan-500 transition-colors">
                                <font-awesome-icon :icon="['fas','image']" class="text-sm" />
                              </div>
                              <div class="text-xs font-medium text-cyan-600 group-hover:text-cyan-700">เลือกรูปลายน้ำ</div>
                              <div v-if="element.url" class="text-xs text-gray-500 mt-1 truncate max-w-32">
                                {{ element.url.split('/').pop() }}
                              </div>
                            </div>
                          </button>
                        </div>
                        
                        <!-- Image Size -->
                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">ความกว้าง</label>
                            <div class="flex items-center space-x-1">
                              <button @click="decreaseWidth(0, element)" 
                                      class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                                <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                              </button>
                              <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                                {{ element.width }}
                              </div>
                              <button @click="increaseWidth(0, element)" 
                                      class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                                <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">ความสูง</label>
                            <div class="flex items-center space-x-1">
                              <button @click="decreaseHeight(0, element)" 
                                      class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                                <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                              </button>
                              <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                                {{ element.height }}
                              </div>
                              <button @click="increaseHeight(0, element)" 
                                      class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                                <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Opacity Control -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ความโปร่งใส</label>
                        <div class="flex items-center space-x-1">
                          <button @click="adjustOpacity(element, false)" 
                                  class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                          </button>
                          <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                            {{ Math.round((element.opacity || 1) * 100) }}%
                          </div>
                          <button @click="adjustOpacity(element, true)" 
                                  class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                          </button>
                        </div>
                      </div>
                      
                      <!-- Z-Index Control -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ลำดับชั้น</label>
                        <div class="flex items-center space-x-1">
                          <button @click="adjustZIndex(element, false)" 
                                  class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                          </button>
                          <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                            {{ element.zIndex || 1 }}
                          </div>
                          <button @click="adjustZIndex(element, true)" 
                                  class="w-5 h-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md flex items-center justify-center transition-colors">
                            <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stamp Properties -->
                <div v-if="element.use === 'stamp'" class="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-2">
                  <h5 class="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                    <font-awesome-icon :icon="['fas','stamp']" class="mr-1 text-red-600" />
                    การตั้งค่าตราประทับ
                  </h5>
                  <div class="space-y-2">
                    <!-- Image Selection -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">เลือกรูปภาพตราประทับ</label>
                      <button 
                        @click="openStampFileBrowser(element)" 
                        class="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-200 group">
                        <div class="text-center">
                          <div class="w-6 h-6 mx-auto mb-1 text-red-400 group-hover:text-red-500 transition-colors">
                            <font-awesome-icon :icon="['fas','image']" class="text-sm" />
                          </div>
                          <div class="text-xs font-medium text-red-600 group-hover:text-red-700">เลือกรูปตราประทับ</div>
                          <div v-if="element.url" class="text-xs text-gray-500 mt-1 truncate max-w-32">
                            {{ element.url.split('/').pop() }}
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    <!-- Z-Index Control -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ลำดับชั้น</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustZIndex(element, false)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ element.zIndex || 10 }}
                        </div>
                        <button @click="adjustZIndex(element, true)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Opacity Control -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ความโปร่งใส</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustOpacity(element, false)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ Math.round((element.opacity || 1) * 100) }}%
                        </div>
                        <button @click="adjustOpacity(element, true)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Rotation Control -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">การหมุน (องศา)</label>
                      <div class="flex items-center space-x-1">
                        <button @click="adjustRotation(element, false)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','minus']" class="text-xs" />
                        </button>
                        <div class="flex-1 text-center text-xs font-medium bg-white border border-gray-300 rounded px-1 py-1">
                          {{ element.rotation || 0 }}°
                        </div>
                        <button @click="adjustRotation(element, true)" 
                                class="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors">
                          <font-awesome-icon :icon="['fas','plus']" class="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-6">
          <div class="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
            <font-awesome-icon :icon="['fas','layer-group']" class="text-lg text-gray-400" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 mb-1">ยังไม่มีองค์ประกอบ</h3>
          <p class="text-xs text-gray-500">เพิ่มองค์ประกอบจากแผงด้านซ้ายเพื่อเริ่มออกแบบ</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Preview Modal -->
  <Transition
    enter-active-class="preview-modal-enter-active"
    leave-active-class="preview-modal-leave-active"
    enter-from-class="preview-modal-enter-from"
    leave-to-class="preview-modal-leave-to"
  >
    <div v-if="showPreviewModal" class="preview-modal">
      <!-- Background overlay -->
      <div class="preview-modal-backdrop" @click="closePreviewModal"></div>

      <!-- Modal panel - Full Screen -->
      <div class="preview-modal-container">
        <!-- Modal header -->
        <div class="preview-modal-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','eye']" class="text-green-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">ตัวอย่างใบรับรอง</h3>
                <p class="text-sm text-gray-500">{{ certName || 'ใบรับรองใหม่' }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Fullscreen indicator -->
              <div class="hidden sm:flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <font-awesome-icon :icon="['fas','expand']" class="mr-1" />
                โหมดตัวอย่าง
              </div>
              <button 
                @click="closePreviewModal" 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="ปิด (ESC)"
              >
                <font-awesome-icon :icon="['fas','times']" class="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <!-- Modal content - Full height -->
        <div class="preview-modal-content">
          <div class="flex justify-center items-center h-full p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div class="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-full max-w-full">
              <result-component 
                :pages="pages"
                :debug="false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- File Browser Modal -->
  <Teleport to="body">
    <FileBrowser 
      v-if="FileBrowserOpen" 
      :key="FileBrowserOpen"
      :isWindowsOpen="FileBrowserOpen" 
      :callbackFunction="'cover'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeFileTrigger" 
      @file-browser-callback="selectFileTrigger"/>
      
    <!-- Watermark File Browser -->
    <FileBrowser 
      v-if="watermarkFileBrowserOpen" 
      :key="'watermark-' + watermarkFileBrowserOpen"
      :isWindowsOpen="watermarkFileBrowserOpen" 
      :callbackFunction="'watermark'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeWatermarkFileTrigger" 
      @file-browser-callback="selectWatermarkFileTrigger"/>
      
    <!-- Stamp File Browser -->
    <FileBrowser 
      v-if="stampFileBrowserOpen" 
      :key="'stamp-' + stampFileBrowserOpen"
      :isWindowsOpen="stampFileBrowserOpen" 
      :callbackFunction="'stamp'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeStampFileTrigger" 
      @file-browser-callback="selectStampFileTrigger"/>
      
    <!-- General Image File Browser -->
    <FileBrowser 
      v-if="generalImageFileBrowserOpen" 
      :key="'general-' + generalImageFileBrowserOpen"
      :isWindowsOpen="generalImageFileBrowserOpen" 
      :callbackFunction="'general'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeGeneralImageFileTrigger" 
      @file-browser-callback="selectGeneralImageFileTrigger"/>
  </Teleport>
</template>

<script>
import storageManager from '@/plugins/storage';
import ResultComponent from './CertificationRender.vue';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import debug from '@/plugins/Logger.js';
// S3 Config
import { S3 } from "@aws-sdk/client-s3";
import convertUtils from "@/plugins/convertUtils";

export default {
  components: {
    ResultComponent,
    FileBrowser,
    Datepicker
  },
  props: {
    certItem: Object,
    certName: String,
  },
  data() {
    const pagesCopy = this.certItem;
    const configs = storageManager.get("configs");
    const schoolSession = configs;
    const s3Client = new S3({
      forcePathStyle: false,
      endpoint: schoolSession.s3EndpointDefault,
      region: schoolSession.s3Region,
      ResponseContentEncoding: "utf-8",
      credentials: {
        accessKeyId: schoolSession.s3Key,
        secretAccessKey: schoolSession.s3Secret,
      },
    });
    return {
      S3: s3Client,
      showPreview:false,
      showPreviewModal: false,
      FileBrowserOpen: false,
      watermarkFileBrowserOpen: false,
      stampFileBrowserOpen: false,
      generalImageFileBrowserOpen: false,
      currentEditingElement: null,
      sidebarElements: [
        { 
          id: 1, 
          text: 'ชื่อ-นามสกุล', 
          use:'name', 
          type:'text', 
          start:'', 
          end:'',
          // เพิ่มการตั้งค่า prefix
          showPrefix: false,
          prefixMapping: 'title',
          fallbackPrefix: 'คุณ'
        },
        { id: 2, text: 'ชื่อหลักสูตร', use:'lesson', type:'text', start:'', end:'' },
        { id: 3, text: 'ชื่อสถาบัน', use:'school', type:'text', start:'', end:''},
        { id: 4, text: 'วันที่ออกใบรับรอง', use:'date', type:'text', start:'', end:'', show_year:'', custom_cert_date:'', useMultipleDates: false, singleDate: '', dateItems: [{ date: '', mapping: '', keyword: '', isExpanded: false }] },
        { id: 5, text: 'คิวอาร์โค๊ด', type: 'image', use:'qrcode', cornerPosition:'bottom left', url:'https://vue-project.sgp1.digitaloceanspaces.com/2024/01/1704536394318.png', caption: false, value: 'code' },
        { id: 6, text: 'รูปประจำตัว', type: 'image', use:'avatar', cornerPosition:'bottom right', url:"https://vue-project.sgp1.digitaloceanspaces.com/2024/01/1704536391861.png", caption: false },
        { id: 7, text: 'ข้อความ', use:'text', type:'text', value:'ข้อความ', end:'' },
        { id: 8, text: 'ลายน้ำ', type: 'watermark', use:'watermark', watermarkType: 'image', cornerPosition:'center', url:'https://vue-project.sgp1.digitaloceanspaces.com/2024/01/1704536394318.png', caption: false, opacity: 0.3, zIndex: 1, value: 'ลายน้ำ', fontSize: '48px', fontColor: '#000000', rotation: 0, textRotation: -45 },
        { id: 9, text: 'ตราประทับ', type: 'image', use:'stamp', cornerPosition:'bottom right', url:'https://vue-project.sgp1.digitaloceanspaces.com/2024/01/1704536391861.png', caption: false, zIndex: 10 },
        { id: 10, text: 'รูปภาพ', type: 'image', use:'general', cornerPosition:'top left', url:'', caption: false, maintainRatio: true, aspectRatio: 1 },
      ],
      useMultipleDates: false,  // This will control the toggle
      singleDate: '',           // This will hold the single date if useMultipleDates is false
      dateItems: [{ date: '', keyword: '' }],  // This holds multiple date items
      pages: pagesCopy,
    };
  },
  computed: {
    disabledSidebarElements() {
      return this.sidebarElements.map(element => {
        // อนุญาตให้เพิ่มได้หลายตัวสำหรับ: รูปภาพทั่วไป และ ข้อความ
        const allowMultiple = element.use === 'general' || element.use === 'text';
        
        let isDuplicate = false;
        if (!allowMultiple) {
          isDuplicate = this.pages[0].elements.some(el => el.id === element.id);
        }
        
        return {
          ...element,
          disabled: isDuplicate,
        };
      });
    },
  },
  methods: {
    // Element Icon and Styling Methods
    getElementIcon(type, use) {
      // Special icons for specific use cases
      if (use === 'watermark') return 'water';
      if (use === 'stamp') return 'stamp';
      if (use === 'qrcode') return 'qrcode';
      if (use === 'avatar') return 'user-circle';
      if (use === 'name') return 'id-card';
      if (use === 'lesson') return 'graduation-cap';
      if (use === 'school') return 'university';
      if (use === 'date') return 'calendar';
      if (use === 'general') return 'image';
      
      // Default icons by type
      const icons = {
        text: 'font',
        image: 'image',
        watermark: 'water'
      };
      return icons[type] || 'puzzle-piece';
    },

    getElementIconBg(type, use) {
      // Special backgrounds for specific use cases
      if (use === 'watermark') return 'bg-gradient-to-br from-cyan-500 to-blue-600';
      if (use === 'stamp') return 'bg-gradient-to-br from-red-500 to-red-600';
      if (use === 'qrcode') return 'bg-gradient-to-br from-gray-500 to-gray-600';
      if (use === 'avatar') return 'bg-gradient-to-br from-indigo-500 to-purple-600';
      if (use === 'name') return 'bg-gradient-to-br from-blue-500 to-blue-600';
      if (use === 'lesson') return 'bg-gradient-to-br from-green-500 to-green-600';
      if (use === 'school') return 'bg-gradient-to-br from-yellow-500 to-orange-600';
      if (use === 'date') return 'bg-gradient-to-br from-purple-500 to-purple-600';
      if (use === 'general') return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      
      // Default backgrounds by type
      const backgrounds = {
        text: 'bg-gradient-to-br from-blue-500 to-blue-600',
        image: 'bg-gradient-to-br from-purple-500 to-purple-600'
      };
      return backgrounds[type] || 'bg-gradient-to-br from-gray-500 to-gray-600';
    },

    getElementTypeLabel(type) {
      const labels = {
        text: 'ข้อความ',
        image: 'รูปภาพ'
      };
      return labels[type] || 'องค์ประกอบ';
    },

    // Page Scale Calculation
    getPageScale() {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate available space (subtract sidebars and headers)
      const sidebarWidth = 64 + 72; // Left (256px) + Right (288px) converted to rem equivalent
      const headerHeight = 60; // Approximate header height
      const padding = 32; // Padding around canvas
      
      const availableWidth = viewportWidth - (sidebarWidth * 4) - padding; // Convert rem to px
      const availableHeight = viewportHeight - headerHeight - padding;
      
      // A4 dimensions in pixels (assuming 96 DPI)
      const a4Width = this.pages[0].landscapeMode ? 1123 : 794; // 29.7cm : 21cm
      const a4Height = this.pages[0].landscapeMode ? 794 : 1123; // 21cm : 29.7cm
      
      // Calculate scale to fit both width and height
      const scaleX = availableWidth / a4Width;
      const scaleY = availableHeight / a4Height;
      
      // Use the smaller scale to ensure it fits completely
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      
      return `scale(${Math.max(scale, 0.3)})`; // Minimum scale of 0.3
    },

    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date,'datefull');
    },
    OpenFileBrowser() {
      console.log('OpenFileBrowser clicked!', this.FileBrowserOpen);
      this.FileBrowserOpen = true;
      console.log('FileBrowserOpen set to:', this.FileBrowserOpen);
    },
    changeFileTrigger(payload) {
      console.log('changeFileTrigger called with:', payload);
      this.FileBrowserOpen = payload;
    },

    addDateItem(element) {
      // Ensure that dateItems exists and is an array before trying to push to it
      if (!Array.isArray(element.dateItems)) {
        element.dateItems = [];
      }
      element.dateItems.push({ date: '', mapping: '', keyword: '', isExpanded: false });
    },
    removeDateItem(element, index) {
      // Perform a check before splicing to prevent errors
      if (Array.isArray(element.dateItems) && element.dateItems.length > 1) {
        element.dateItems.splice(index, 1);
      }
    },

    selectFileTrigger(payload) {
      console.log("selectFileTrigger called with:", payload);
      debug.log("selectFileTrigger");
      if(payload!=undefined) {
        this.selectCourseCover = payload;
        this.pages[0].backgroundImage = payload.file
        console.log("Background image set to:", payload.file);
      }
    },
    
    // Watermark FileBrowser methods
    openWatermarkFileBrowser(element) {
      this.currentEditingElement = element;
      this.watermarkFileBrowserOpen = true;
    },
    changeWatermarkFileTrigger(payload) {
      this.watermarkFileBrowserOpen = payload;
    },
    selectWatermarkFileTrigger(payload) {
      console.log("selectWatermarkFileTrigger called with:", payload);
      if(payload && this.currentEditingElement) {
        this.currentEditingElement.url = payload.file;
        console.log("Watermark image updated to:", payload.file);
      }
      this.currentEditingElement = null;
    },
    
    // Stamp FileBrowser methods
    openStampFileBrowser(element) {
      this.currentEditingElement = element;
      this.stampFileBrowserOpen = true;
    },
    changeStampFileTrigger(payload) {
      this.stampFileBrowserOpen = payload;
    },
    selectStampFileTrigger(payload) {
      console.log("selectStampFileTrigger called with:", payload);
      if(payload && this.currentEditingElement) {
        this.currentEditingElement.url = payload.file;
        console.log("Stamp image updated to:", payload.file);
      }
      this.currentEditingElement = null;
    },
    
    // General Image FileBrowser methods
    openGeneralImageFileBrowser(element) {
      this.currentEditingElement = element;
      this.generalImageFileBrowserOpen = true;
    },
    changeGeneralImageFileTrigger(payload) {
      this.generalImageFileBrowserOpen = payload;
    },
    selectGeneralImageFileTrigger(payload) {
      console.log("selectGeneralImageFileTrigger called with:", payload);
      if(payload && this.currentEditingElement) {
        // เก็บ reference ของ element ไว้ในตัวแปรท้องถิ่นเพื่อป้องกัน null reference
        const element = this.currentEditingElement;
        element.url = payload.file;
        console.log("General image updated to:", payload.file);
        
        // โหลดรูปภาพเพื่อคำนวณ aspect ratio และปรับกรอบตามขนาดรูปจริง
        if (element.maintainRatio) {
          const img = new Image();
          img.onload = () => {
            // ตรวจสอบว่า element ยังคงมีอยู่และมี property ที่ต้องการ
            if (element && typeof element === 'object') {
              element.aspectRatio = img.width / img.height;
              element.originalWidth = img.width;
              element.originalHeight = img.height;
              
              // กำหนดขนาดกรอบตามรูปภาพจริง (ปรับสเกลให้เหมาะสม)
              const maxFrameSize = 200; // ขนาดกรอบสูงสุด
              let frameWidth = img.width;
              let frameHeight = img.height;
              
              // ปรับสเกลถ้ารูปใหญ่เกินไป
              if (frameWidth > maxFrameSize || frameHeight > maxFrameSize) {
                const scale = Math.min(maxFrameSize / frameWidth, maxFrameSize / frameHeight);
                frameWidth = Math.round(frameWidth * scale);
                frameHeight = Math.round(frameHeight * scale);
              }
              
              element.width = frameWidth + 'px';
              element.height = frameHeight + 'px';
              
              console.log("Frame size set to:", element.width, "x", element.height);
              console.log("Aspect ratio calculated:", element.aspectRatio);
            }
          };
          img.onerror = () => {
            console.error("Failed to load image for ratio calculation");
          };
          img.src = payload.file;
        }
      }
      this.currentEditingElement = null;
    },
    
    // Image ratio methods
    adjustImageWidth(element, increase) {
      const currentWidth = parseInt(element.width);
      const step = 10;
      
      let newWidth;
      if (increase) {
        newWidth = currentWidth + step;
      } else {
        newWidth = Math.max(currentWidth - step, 10); // ความกว้างขั้นต่ำ 10px
      }
      
      element.width = newWidth + 'px';
      
      // ถ้ารักษาสัดส่วน ให้ปรับ height ตาม ratio
      if (element.maintainRatio && element.aspectRatio) {
        const newHeight = Math.round(newWidth / element.aspectRatio);
        element.height = newHeight + 'px';
      }
    },
    
    togglePreview() {
      this.showPreview = !this.showPreview;
    },
    openPreviewModal() {
      this.showPreviewModal = true;
      // Add body class to prevent scrolling
      document.body.classList.add('modal-open');
      // Add keyboard event listener
      document.addEventListener('keydown', this.handlePreviewKeydown);
    },
    closePreviewModal() {
      this.showPreviewModal = false;
      // Remove body class to restore scrolling
      document.body.classList.remove('modal-open');
      // Remove keyboard event listener
      document.removeEventListener('keydown', this.handlePreviewKeydown);
    },
    handlePreviewKeydown(event) {
      // Close modal on ESC key
      if (event.key === 'Escape' && this.showPreviewModal) {
        this.closePreviewModal();
      }
    },
    sendDataToParent() {
      this.$emit('data-emitted', this.pages);
    },
    addElementToPage(element) {
        element.marginTop = 0;
        element.marginBottom = 0;
        element.showOptions = false;

        if (element.type === 'text') {
            element.fontSize = '12px';
            element.bold = false;
            element.italic = false;
            element.underline = false;
            
            // เพิ่มค่าเริ่มต้นสำหรับ name element
            if (element.use === 'name') {
                element.showPrefix = element.showPrefix !== undefined ? element.showPrefix : false;
                element.prefixMapping = element.prefixMapping || 'title';
                element.fallbackPrefix = element.fallbackPrefix || 'คุณ';
            }
            
            // เพิ่มค่าเริ่มต้นสำหรับ date element
            if (element.use === 'date') {
                element.showIssueDate = element.showIssueDate !== undefined ? element.showIssueDate : true;
                element.showExpiryDate = element.showExpiryDate !== undefined ? element.showExpiryDate : false;
                element.validityYears = element.validityYears || '1';
                element.dateSeparator = element.dateSeparator || ' | ';
                element.customSeparator = element.customSeparator || '';
            }
        }
        if (element.type === 'image') {
            element.width = '100px';
            element.height = '100px';
            element.marginLeft = 0;
            element.marginRight = 0;
            element.marginTop = 0;
            element.marginBottom = 0;
            
            // เพิ่มค่าเริ่มต้นสำหรับ stamp
            if (element.use === 'stamp') {
                element.opacity = element.opacity || 1.0;
                element.zIndex = element.zIndex || 10;
                element.rotation = element.rotation || 0;
            }
            
            // เพิ่มค่าเริ่มต้นสำหรับรูปภาพทั่วไป
            if (element.use === 'general') {
                element.maintainRatio = element.maintainRatio !== undefined ? element.maintainRatio : true;
                element.aspectRatio = element.aspectRatio || 1;
                element.originalWidth = null;
                element.originalHeight = null;
                element.objectFit = element.objectFit || 'cover';
                element.showFrame = element.showFrame !== undefined ? element.showFrame : false; // ไม่แสดงกรอบตามค่าเริ่มต้น
                // กำหนดขนาดกรอบเริ่มต้น
                element.width = '150px';
                element.height = '150px';
            }
        }
        if (element.type === 'watermark') {
            if (element.watermarkType === 'text') {
                element.fontSize = element.fontSize || '48px';
                element.fontColor = element.fontColor || '#000000';
                element.textRotation = element.textRotation || -45;
                element.value = element.value || 'ลายน้ำ';
            } else {
                element.width = '150px';
                element.height = '150px';
                element.marginLeft = 0;
                element.marginRight = 0;
                element.marginTop = 0;
                element.marginBottom = 0;
            }
            element.opacity = element.opacity || 0.3;
            element.zIndex = element.zIndex || 1;
            element.cornerPosition = element.cornerPosition || 'center';
        }

        // ตรวจสอบว่าเป็น element ที่สามารถเพิ่มได้หลายตัวหรือไม่
        const allowMultiple = element.use === 'general' || element.use === 'text';
        let isDuplicate = false;
        
        if (!allowMultiple) {
            isDuplicate = this.pages[0].elements.some(el => el.id === element.id);
        }
        
        if (!isDuplicate) {
            // สร้าง unique ID สำหรับ element ที่เพิ่มได้หลายตัว
            const newElement = { ...element };
            if (allowMultiple) {
                newElement.uniqueId = Date.now() + Math.random();
            }
            this.pages[0].elements.push(newElement);
        }
    },
    toggleOptions(element) {
      this.pages[0].elements.forEach((el) => {
        el.showOptions = false;
      });

      element.showOptions = !element.showOptions;
    },
    moveElementUp(pageIndex, elementIndex) {
        if (elementIndex > 0) {
          const temp = this.pages[pageIndex].elements[elementIndex];
          this.pages[pageIndex].elements[elementIndex] = this.pages[pageIndex].elements[elementIndex - 1];
          this.pages[pageIndex].elements[elementIndex - 1] = temp;
        }
    },
    moveElementDown(pageIndex, elementIndex) {
        if (elementIndex < this.pages[pageIndex].elements.length - 1) {
          const temp = this.pages[pageIndex].elements[elementIndex];
          this.pages[pageIndex].elements[elementIndex] = this.pages[pageIndex].elements[elementIndex + 1];
          this.pages[pageIndex].elements[elementIndex + 1] = temp;
        }
    },
    removeElement(pageIndex, element) {
        const index = this.pages[pageIndex].elements.indexOf(element);
        if (index !== -1) {
          this.pages[pageIndex].elements.splice(index, 1);
        }
    },
    adjustMargin(pageIndex, element, marginType, increase) {
      let marginValue = parseFloat(element[marginType]);
      const step = 0.1;

      if (isNaN(marginValue)) {
        marginValue = 0;
      }

      if (increase) {
        element[marginType] = (marginValue + step).toFixed(1);
      } else {
        if (marginValue > 0) {
          element[marginType] = (marginValue - step).toFixed(1);
        }
      }
    },
      increaseTopMargin(pageIndex, element) {
        element.marginTop += 0.1;
      },
      decreaseTopMargin(pageIndex, element) {
        if (element.marginTop > 0) {
          element.marginTop -= 0.1;
        }
      },
      increaseBottomMargin(pageIndex, element) {
        element.marginBottom += 0.1;
      },
      decreaseBottomMargin(pageIndex, element) {
        if (element.marginBottom > 0) {
          element.marginBottom -= 0.1;
        }
      },
      toggleLayout() {
        this.pages[0].landscapeMode = !this.pages[0].landscapeMode;
      },
      changeFontSize(pageIndex, element, action) {
        const currentSize = parseInt(element.fontSize);
        if (!isNaN(currentSize)) {
          if (action === 'increase') {
            element.fontSize = `${currentSize + 2}px`;
          } else if (action === 'decrease' && currentSize >= 4) {
            element.fontSize = `${currentSize - 2}px`;
          }
        }
      },
      toggleBold(pageIndex, element) {
        element.bold = !element.bold;
      },
      toggleItalic(pageIndex, element) {
        element.italic = !element.italic;
      },
      toggleUnderline(pageIndex, element) {
        element.underline = !element.underline;
      },
      increaseWidth(pageIndex, element) {
        const currentWidth = parseInt(element.width);
        const newWidth = currentWidth + 10;
        element.width = newWidth + 'px';
        
        // ถ้าเป็นรูปภาพทั่วไปและรักษาสัดส่วน ให้ปรับ height ตาม ratio
        if (element.use === 'general' && element.maintainRatio && element.aspectRatio) {
          const newHeight = Math.round(newWidth / element.aspectRatio);
          element.height = newHeight + 'px';
        }
      },
      decreaseWidth(pageIndex, element) {
        const currentWidth = parseInt(element.width);
        if (currentWidth >= 20) {
          const newWidth = currentWidth - 10;
          element.width = newWidth + 'px';
          
          // ถ้าเป็นรูปภาพทั่วไปและรักษาสัดส่วน ให้ปรับ height ตาม ratio
          if (element.use === 'general' && element.maintainRatio && element.aspectRatio) {
            const newHeight = Math.round(newWidth / element.aspectRatio);
            element.height = newHeight + 'px';
          }
        }
      },
      increaseHeight(pageIndex, element) {
        const currentHeight = parseInt(element.height);
        const newHeight = currentHeight + 10;
        element.height = newHeight + 'px';
        
        // ถ้าเป็นรูปภาพทั่วไปและรักษาสัดส่วน ให้ปรับ width ตาม ratio
        if (element.use === 'general' && element.maintainRatio && element.aspectRatio) {
          const newWidth = Math.round(newHeight * element.aspectRatio);
          element.width = newWidth + 'px';
        }
      },
      decreaseHeight(pageIndex, element) {
        const currentHeight = parseInt(element.height);
        if (currentHeight >= 20) {
          const newHeight = currentHeight - 10;
          element.height = newHeight + 'px';
          
          // ถ้าเป็นรูปภาพทั่วไปและรักษาสัดส่วน ให้ปรับ width ตาม ratio
          if (element.use === 'general' && element.maintainRatio && element.aspectRatio) {
            const newWidth = Math.round(newHeight * element.aspectRatio);
            element.width = newWidth + 'px';
          }
        }
      },
    selectElement(element) {
      this.pages[0].elements.forEach((el) => {
        el.showOptions = false;
      });

      element.showOptions = true;
      
      // Debug: ตรวจสอบ element ที่ถูก select
      console.log('Selected element:', element);
      console.log('Element type:', element.type);
      console.log('Element use:', element.use);
      console.log('Show options:', element.showOptions);
    },
    adjustOpacity(element, increase) {
      let opacity = parseFloat(element.opacity);
      const step = 0.1;

      if (isNaN(opacity)) {
        opacity = 0;
      }

      if (increase) {
        opacity = Math.min(opacity + step, 1);
      } else {
        if (opacity > 0) {
          opacity = Math.max(opacity - step, 0);
        }
      }

      element.opacity = opacity.toFixed(1);
    },
    adjustZIndex(element, increase) {
      let zIndex = parseInt(element.zIndex);
      const step = 1;

      if (isNaN(zIndex)) {
        zIndex = 1;
      }

      if (increase) {
        zIndex = Math.max(zIndex + step, 1);
      } else {
        if (zIndex > 1) {
          zIndex = Math.max(zIndex - step, 1);
        }
      }

      element.zIndex = zIndex.toString();
    },
    adjustRotation(element, increase) {
      let rotation = parseInt(element.rotation);
      const step = 1;

      if (isNaN(rotation)) {
        rotation = 0;
      }

      if (increase) {
        rotation = (rotation + step) % 360;
      } else {
        if (rotation > 0) {
          rotation = (rotation - step + 360) % 360;
        }
      }

      element.rotation = rotation.toString();
    },
    getElementPosition(element, side) {
      if (element.type !== 'image' && element.type !== 'watermark') return 'auto';
      
      const position = element.cornerPosition;
      
      // For watermark, handle special positions
      if (element.type === 'watermark') {
        switch (position) {
          case 'center':
            if (side === 'top') return '50%';
            if (side === 'left') return '50%';
            return 'auto';
          case 'top':
            if (side === 'top') return '10%';
            if (side === 'left') return '50%';
            return 'auto';
          case 'bottom':
            if (side === 'bottom') return '10%';
            if (side === 'left') return '50%';
            return 'auto';
          default:
            break;
        }
      }
      
      // Original logic for other elements
      if (side === 'top') return position.includes('top') ? '0' : 'auto';
      if (side === 'bottom') return position.includes('bottom') ? '0' : 'auto';
      if (side === 'left') return position.includes('left') ? '0' : 'auto';
      if (side === 'right') return position.includes('right') ? '0' : 'auto';
      
      return 'auto';
    },
    getElementTransform(element) {
      let transforms = [];
      
      // Handle watermark center positioning
      if (element.type === 'watermark' && element.cornerPosition === 'center') {
        transforms.push('translate(-50%, -50%)');
      } else if (element.type === 'watermark' && (element.cornerPosition === 'top' || element.cornerPosition === 'bottom')) {
        transforms.push('translateX(-50%)');
      }
      
      // Handle text rotation for watermark
      if (element.type === 'watermark' && element.watermarkType === 'text' && element.textRotation) {
        transforms.push(`rotate(${element.textRotation}deg)`);
      }
      
      // Handle image rotation
      if ((element.type === 'image' || (element.type === 'watermark' && element.watermarkType === 'image')) && element.rotation) {
        transforms.push(`rotate(${element.rotation}deg)`);
      }
      
      return transforms.length > 0 ? transforms.join(' ') : 'none';
    },
    changeWatermarkFontSize(element, action) {
      const currentSize = parseFloat(element.fontSize);
      if (!isNaN(currentSize)) {
        if (action === 'increase') {
          element.fontSize = `${currentSize + 2}px`;
        } else if (action === 'decrease' && currentSize >= 4) {
          element.fontSize = `${currentSize - 2}px`;
        }
      }
    },
    adjustTextRotation(element, increase) {
      const currentRotation = parseInt(element.textRotation);
      if (!isNaN(currentRotation)) {
        if (increase) {
          element.textRotation = (currentRotation + 15) % 360;
        } else {
          if (currentRotation > 0) {
            element.textRotation = (currentRotation - 15 + 360) % 360;
          }
        }
      }
    },
    adjustCertificateValidity(element, increase) {
      let validityYears = parseInt(element.validityYears);
      const step = 1;

      if (isNaN(validityYears)) {
        validityYears = 1;
      }

      if (increase) {
        validityYears = Math.max(validityYears + step, 1);
      } else {
        if (validityYears > 1) {
          validityYears = Math.max(validityYears - step, 1);
        }
      }

      element.validityYears = validityYears.toString();
    },
    getDisplayDate(element) {
      // ตั้งค่าเริ่มต้นถ้าไม่มี
      if (element.showIssueDate === undefined) {
        element.showIssueDate = true;
      }
      if (element.showExpiryDate === undefined) {
        element.showExpiryDate = false;
      }
      
      let displayParts = [];
      
      // ถ้าไม่ได้เลือกอะไรเลย ให้แสดงวันที่ออกใบรับรองเป็นค่าเริ่มต้น
      if (!element.showIssueDate && !element.showExpiryDate) {
        element.showIssueDate = true;
      }
      
      // หาวันที่ออกใบรับรอง
      let issueDate;
      if (element.useMultipleDates && element.dateItems && element.dateItems.length > 0) {
        issueDate = element.dateItems[0].date;
      } else {
        issueDate = element.singleDate;
      }
      
      // แสดงวันที่ออกใบรับรอง
      if (element.showIssueDate) {
        if (issueDate) {
          displayParts.push(this.formatThaidate(issueDate));
        } else {
          displayParts.push('กรุณาเลือกวันที่');
        }
      }
      
      // แสดงวันที่หมดอายุ
      if (element.showExpiryDate) {
        if (issueDate) {
          const issueDateObj = new Date(issueDate);
          if (!isNaN(issueDateObj.getTime())) {
            const validityYears = parseInt(element.validityYears) || 1;
            const expiryDate = new Date(issueDateObj);
            expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);
            displayParts.push(this.formatThaidate(expiryDate));
          } else {
            displayParts.push('กรุณาเลือกวันที่ออกใบรับรอง');
          }
        } else {
          displayParts.push('กรุณาเลือกวันที่ออกใบรับรอง');
        }
      }
      
      // รวมข้อความที่จะแสดง
      let separator = element.dateSeparator || ' | ';
      
      // ถ้าเลือกใช้ separator กำหนดเอง
      if (element.dateSeparator === 'custom' && element.customSeparator) {
        separator = element.customSeparator;
      }
      
      // ถ้าเลือกใช้บรรทัดใหม่
      if (element.dateSeparator === '\n') {
        separator = '\n';
      }
      
      const dateText = displayParts.join(separator);
      return element.start + dateText + element.end;
    },
    
    getDisplayName(element) {
      // ถ้าไม่ใช่ name element ให้ return ข้อความปกติ
      if (element.use !== 'name') {
        return element.start + element.text + element.end;
      }
      
      let displayText = '';
      
      // เพิ่ม prefix ถ้าเปิดใช้งาน
      if (element.showPrefix) {
        // ในโหมดตัวอย่าง ให้แสดง fallback prefix
        // ในโหมดจริงจะต้องดึงข้อมูลจาก data mapping
        const prefix = element.fallbackPrefix || 'คุณ';
        displayText += prefix + ' ';
      }
      
      // เพิ่มข้อความหลัก (ชื่อ-นามสกุล)
      displayText += element.text;
      
      return element.start + displayText + element.end;
    },
  },
  mounted() {
    // กำหนดค่าเริ่มต้นสำหรับการอนุญาตดาวน์โหลด
    if (this.pages[0].allowDownload === undefined) {
      this.pages[0].allowDownload = false;
    }
  },
  beforeUnmount() {
    // Cleanup when component is destroyed
    if (this.showPreviewModal) {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', this.handlePreviewKeydown);
    }
  },
};
</script>

<style scoped>
/* Global Transitions */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page Styles */
.page {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 21cm;
  height: 29.7cm; 
  transition: all 0.5s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  overflow: hidden;
}

.page.landscape {
  width: 29.7cm;
  height: 21cm;
}

/* Grid Pattern */
.page-with-grid {
  position: relative;
}

.page-with-grid::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 0.5cm 0.5cm;
  pointer-events: none;
  z-index: 1;
}

/* Element Preview Styles */
.element-preview {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  /* Default editing mode styles */
  border: 1px solid #d1d5db;
  padding: 8px;
  margin: 4px;
  background-color: rgba(229, 231, 235, 0.4);
  text-align: center;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.element-preview:hover:not(.preview-mode) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

/* Selected element styles */
.element-preview.element-selected {
  border-color: #10b981 !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
}

/* Preview mode - hide all editing visual aids */
.element-preview.preview-mode {
  border: none !important;
  background: transparent !important;
  backdrop-filter: none !important;
  cursor: default !important;
  /* Keep all other styles like padding, margin, font properties, positioning */
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

/* Button Hover Effects */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Card Hover Effects */
.group:hover {
  transform: translateY(-2px);
}

/* Gradient Backgrounds */
.bg-gradient-to-br {
  background-attachment: fixed;
}

/* Focus States */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
  transform: scale(1.02);
}

/* Animation for element addition */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading states */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Enhanced shadows */
.shadow-soft {
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.shadow-medium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-large {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Improved spacing */
.space-y-tight > * + * {
  margin-top: 0.5rem;
}

.space-y-loose > * + * {
  margin-top: 2rem;
}

/* Enhanced border radius */
.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-2xl {
  border-radius: 1rem;
}

/* Text gradients */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Interactive elements */
.interactive {
  cursor: pointer;
  user-select: none;
}

.interactive:hover {
  transform: scale(1.05);
}

.interactive:active {
  transform: scale(0.98);
}

/* Status indicators */
.status-indicator {
  position: relative;
}

.status-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid white;
}

/* Responsive design improvements */
@media (max-width: 1024px) {
  .page {
    transform: scale(0.7);
  }
}

@media (max-width: 768px) {
  .page {
    transform: scale(0.6);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background: #1f2937;
    color: #f9fafb;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  * {
    border-width: 2px !important;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .properties-panel {
    display: none !important;
  }
  
  .page {
    transform: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus visible for better accessibility */
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Enhanced button styles */
.btn-modern {
  position: relative;
  overflow: hidden;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-modern:hover::before {
  left: 100%;
}

/* Enhanced form controls */
.form-control {
  position: relative;
}

.form-control:focus-within {
  transform: scale(1.02);
}

/* Tooltip styles */
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
}

.tooltip:hover::after {
  opacity: 1;
}

/* Enhanced grid layouts */
.grid-modern {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Improved typography */
.text-balance {
  text-wrap: balance;
}

.text-pretty {
  text-wrap: pretty;
}

/* Enhanced spacing utilities */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

/* Modern card styles */
.card-modern {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Enhanced gradients */
.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Loading spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Enhanced transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modern input styles */
.input-modern {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.input-modern:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

/* Enhanced select styles */
.select-modern {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Modern checkbox styles */
.checkbox-modern {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  position: relative;
  cursor: pointer;
}

.checkbox-modern:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-modern:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
}

/* Enhanced badge styles */
.badge-modern {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.badge-primary {
  background: #dbeafe;
  color: #1e40af;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  @apply bg-red-100 text-red-800;
}
</style>

/* Preview Modal Styles */
.preview-modal {
  @apply fixed inset-0 z-50 overflow-hidden;
}

.preview-modal-backdrop {
  @apply fixed inset-0 bg-gray-900 bg-opacity-95 transition-opacity duration-300;
}

.preview-modal-container {
  @apply fixed inset-0 flex flex-col;
}

.preview-modal-header {
  @apply bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0 shadow-sm;
}

.preview-modal-content {
  @apply flex-1 bg-gray-50 overflow-auto;
}

/* Preview Modal Animation */
.preview-modal-enter-active,
.preview-modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-modal-enter-from {
  opacity: 0;
}

.preview-modal-enter-from .preview-modal-container {
  transform: translateY(20px);
}

.preview-modal-leave-to {
  opacity: 0;
}

.preview-modal-leave-to .preview-modal-container {
  transform: translateY(-20px);
}

/* Ensure modal content doesn't interfere with scrolling */
.modal-open {
  overflow: hidden;
}

/* Custom scrollbar for preview modal content */
.preview-modal-content::-webkit-scrollbar {
  width: 8px;
}

.preview-modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.preview-modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.preview-modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Enhanced button styles */
.btn-modern {
  position: relative;
  overflow: hidden;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-modern:hover::before {
  left: 100%;
}

/* Enhanced form controls */
.form-control {
  position: relative;
}

.form-control:focus-within {
  transform: scale(1.02);
}

/* Watermark and Stamp Styles */
.watermark-element {
  pointer-events: none !important;
}

.watermark-element.preview-mode {
  pointer-events: none !important;
}

.watermark-element:not(.preview-mode) {
  pointer-events: auto !important;
}

.watermark-image {
  filter: grayscale(30%) brightness(1.2);
  mix-blend-mode: multiply;
}

.watermark-text {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  user-select: none;
  white-space: nowrap;
}

.watermark-text::selection {
  background: transparent;
}

.stamp-element {
  z-index: 999 !important;
}

.stamp-image {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.stamp-image:hover {
  transform: scale(1.05);
}

/* Special element indicators in edit mode */
.watermark-element:not(.preview-mode)::before {
  content: 'ลายน้ำ';
  position: absolute;
  top: -20px;
  left: 0;
  background: rgba(6, 182, 212, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  z-index: 1000;
}

.stamp-element:not(.preview-mode)::before {
  content: 'ตราประทับ';
  position: absolute;
  top: -20px;
  left: 0;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  z-index: 1000;
}

.image-frame {
  border: 2px solid #10b981;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  min-width: 50px;
  min-height: 50px;
}

.frame-visible {
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.frame-hidden {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.image-frame:hover:not(.preview-mode) {
  border-color: #059669;
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.image-frame img {
  transition: transform 0.3s ease;
  user-select: none;
  pointer-events: none;
}

.placeholder-content {
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  padding: 10px;
  user-select: none;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
