<template>
  <div class="fixed inset-0 z-50 bg-white" v-if="isOpen">
    <!-- Full Screen Layout -->
    <div class="h-screen flex flex-col">
      
      <!-- Fixed Header -->
      <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 relative">
        <!-- ปุ่มปิดมุมขวาบน -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
          title="ปิดหน้าต่าง"
        >
          <font-awesome-icon icon="times" class="w-4 h-4" />
        </button>

        <!-- หัวข้อหลัก -->
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">ติดตั้งระบบ</h3>
          <p class="text-gray-600">ขั้นตอนการติดตั้งระบบสำหรับใช้งานครั้งแรก</p>
        </div>

        <!-- Enhanced Progress Bar -->
        <div class="max-w-5xl mx-auto">
          <!-- Progress Steps -->
          <div class="relative">
            <!-- Background Line -->
            <div class="absolute top-6 h-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full" 
                 style="left: 24px; right: 24px;"></div>
            
            <!-- Active Progress Line -->
            <div 
              class="absolute top-6 h-1 progress-line rounded-full transition-all duration-700 ease-in-out"
              :style="{ 
                left: '24px',
                width: currentStep === 0 ? '0%' : `calc((100% - 48px) * ${currentStep / (steps.length - 1)})`
              }"
            ></div>
            
            <!-- Step Circles -->
            <div class="relative flex justify-between">
              <div 
                v-for="(step, index) in steps" 
                :key="index" 
                class="flex flex-col items-center group cursor-pointer"
                @click="goToStep(index)"
              >
                <!-- Circle with enhanced styling -->
                <div 
                  :class="[
                    'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 transform',
                    currentStep > index 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110 glow-green' 
                      : currentStep === index 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-115 glow-blue ring-4 ring-blue-200 ring-opacity-50 animate-bounce-subtle' 
                        : 'bg-white text-gray-500 border-2 border-gray-300 group-hover:border-blue-300 group-hover:shadow-md step-hover',
                    celebratingStep === index ? 'animate-celebrate' : '',
                    'group-hover:scale-105'
                  ]"
                >
                  <!-- Success Icon -->
                  <font-awesome-icon 
                    v-if="currentStep > index" 
                    icon="check" 
                    class="w-5 h-5 animate-pulse"
                  />
                  <!-- Current Step Icon -->
                  <div v-else-if="currentStep === index" class="relative">
                    <span class="relative z-10">{{ index + 1 }}</span>
                    <div class="absolute inset-0 bg-white bg-opacity-20 rounded-full animate-ping"></div>
                  </div>
                  <!-- Future Step Number -->
                  <span v-else class="transition-colors duration-200">{{ index + 1 }}</span>
                  
                  <!-- Glow Effect for Active Step -->
                  <div 
                    v-if="currentStep === index"
                    class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-75 blur-sm animate-pulse"
                  ></div>
                </div>
                
                <!-- Step Label with Enhanced Typography -->
                <div class="mt-3 text-center max-w-20">
                  <span 
                    :class="[
                      'text-xs font-medium transition-all duration-300',
                      currentStep >= index 
                        ? 'text-gray-900 font-semibold' 
                        : 'text-gray-500 group-hover:text-gray-700',
                      currentStep === index ? 'text-blue-600 font-bold' : ''
                    ]"
                  >
                    {{ step }}
                  </span>
                  
                  <!-- Active Step Indicator -->
                  <div 
                    v-if="currentStep === index"
                    class="mt-1 mx-auto w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto bg-gray-50 flex">
        <div class="max-w-4xl mx-auto px-4 py-4 w-full flex flex-col min-h-full">
        
          <!-- ขั้นตอนที่ 1: Agreement Check -->
          <div v-if="currentStep === 0" class="step-content flex-1 flex flex-col min-h-0">
            <div class="step-card flex-1 flex flex-col min-h-0">
              <h4 class="text-lg font-semibold mb-6 text-gray-900 flex-shrink-0">ข้อตกลงการใช้งาน</h4>
              
              <div class="flex-1 bg-gray-50 border rounded-lg flex flex-col min-h-0">
                <!-- Header ของเงื่อนไข -->
                <div class="flex-shrink-0 p-4 text-center border-b border-gray-200 bg-white">
                  <h5 class="font-semibold text-gray-900">เงื่อนไขการใช้งานระบบ</h5>
                  <p class="mt-2 text-sm text-gray-600">
                    โดยการดำเนินการติดตั้งระบบนี้ คุณยอมรับเงื่อนไขการใช้งานดังต่อไปนี้:
                  </p>
                </div>
                
                <!-- เนื้อหาที่ scroll ได้ -->
                <div class="flex-1 overflow-y-auto p-6 terms-scroll min-h-0">
                    <div class="text-left max-w-4xl mx-auto">
                    
                    <!-- ส่วนที่ 1: สิทธิ์การใช้งาน -->
                    <div class="mb-6">
                      <h6 class="font-medium text-gray-900 mb-3 text-left">1. สิทธิ์และการใช้งาน</h6>
                      <ul class="list-disc pl-6 space-y-2 text-gray-700 text-left">
                        <li>คุณมีสิทธิ์ในการใช้งานระบบนี้ตามวัตถุประสงค์ที่กำหนดเท่านั้น</li>
                        <li>การใช้งานต้องเป็นไปตามนีติกรรมและจริยธรรมที่ดี</li>
                        <li>ห้ามนำระบบไปใช้ในกิจกรรมที่ผิดกฎหมายหรือเป็นอันตรายต่อผู้อื่น</li>
                        <li>การแชร์หรือถ่ายทอดสิทธิ์การใช้งานต้องได้รับอนุญาตจากผู้ให้บริการ</li>
                      </ul>
                    </div>

                    <!-- ส่วนที่ 2: ความปลอดภัยข้อมูล -->
                    <div class="mb-6">
                      <h6 class="font-medium text-gray-900 mb-3 text-left">2. ความปลอดภัยและการคุ้มครองข้อมูล</h6>
                      <ul class="list-disc pl-6 space-y-2 text-gray-700 text-left">
                        <li>ข้อมูลทั้งหมดจะถูกเข้ารหัสและปกป้องตามมาตรฐาน SSL/TLS</li>
                        <li>ระบบมีการสำรองข้อมูลอัตโนมัติเพื่อป้องกันการสูญหาย</li>
                        <li>ข้อมูลส่วนบุคคลจะถูกประมวลผลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล</li>
                        <li>ผู้ใช้งานต้องรักษาความลับของรหัสผ่านและข้อมูลการเข้าถึง</li>
                        <li>การรายงานช่องโหว่หรือปัญหาความปลอดภัยจะได้รับการตอบสนองทันที</li>
                      </ul>
                    </div>

                    <!-- ส่วนที่ 3: ความรับผิดชอบ -->
                    <div class="mb-6">
                      <h6 class="font-medium text-gray-900 mb-3 text-left">3. ความรับผิดชอบและข้อจำกัด</h6>
                      <ul class="list-disc pl-6 space-y-2 text-gray-700 text-left">
                        <li>ผู้ใช้งานรับผิดชอบต่อข้อมูลที่นำเข้าและใช้งานในระบบ</li>
                        <li>ผู้ให้บริการไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานที่ผิดวิธี</li>
                        <li>การบำรุงรักษาระบบอาจทำให้บริการหยุดชะงักชั่วคราว</li>
                        <li>ผู้ให้บริการขอสงวนสิทธิ์ในการปรับปรุงและพัฒนาระบบ</li>
                      </ul>
                    </div>
                    
                    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                      <p class="text-sm text-blue-800">
                        <strong>หมายเหตุ:</strong> ข้อตกลงนี้จะมีผลตั้งแต่วันที่ติดตั้งระบบจนกว่าจะมีการยกเลิกการใช้งาน 
                        การปรับปรุงเงื่อนไขจะแจ้งให้ทราบล่วงหน้าไม่น้อยกว่า 15 วัน
                      </p>
                    </div>

                    <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                      <p class="text-sm text-amber-800">
                        <strong>ข้อควรระวัง:</strong> โปรดอ่านเงื่อนไขทั้งหมดอย่างละเอียดก่อนดำเนินการติดตั้งระบบ 
                        หากมีข้อสงสัยสามารถติดต่อทีมสนับสนูนได้ตลอดเวลา
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex-shrink-0 mt-6">
                <div class="flex items-center justify-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="agreement"
                    v-model="formData.agreementAccepted"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  >
                  <label for="agreement" class="text-base font-medium text-gray-800">
                    ฉันได้อ่านและยอมรับเงื่อนไขการใช้งานแล้ว
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ขั้นตอนที่ 2: Add Name & Slug -->
          <div v-if="currentStep === 1" class="step-content flex-1 flex flex-col">
            <div class="step-card flex-1">
              <div class="flex flex-col h-full">
                <h4 class="text-lg font-semibold mb-6 text-gray-900">ข้อมูลพื้นฐานของระบบ</h4>
                
                <div class="flex-1 flex flex-col space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        ชื่อระบบ <span class="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        v-model="formData.systemName"
                        placeholder="ระบบจัดการ..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                        @input="generateSlug"
                      >
                      <p class="text-sm text-gray-500 mt-2">ชื่อที่จะแสดงในหัวข้อของระบบ</p>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        URL Slug <span class="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        v-model="formData.systemSlug"
                        placeholder="system-management"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                        pattern="[a-z0-9-]+"
                      >
                      <p class="text-sm text-gray-500 mt-2">ใช้สำหรับ URL (ตัวอักษรเล็ก, ตัวเลข และ - เท่านั้น)</p>
                    </div>
                  </div>

                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      คำอธิบายระบบ
                    </label>
                    <textarea 
                      v-model="formData.systemDescription"
                      rows="6"
                      placeholder="อธิบายเกี่ยวกับระบบและวัตถุประสงค์การใช้งาน..."
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                    ></textarea>
                    <p class="text-sm text-gray-500 mt-2">อธิบายวัตถุประสงค์และฟีเจอร์หลักของระบบ</p>
                  </div>
                </div>

                <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div class="flex">
                    <font-awesome-icon icon="info-circle" class="text-blue-500 w-6 h-6 mt-0.5 mr-4" />
                    <div class="text-blue-800">
                      <p class="font-semibold mb-3">ตัวอย่างการแสดงผล:</p>
                      <div class="space-y-2">
                        <p class="text-sm">ชื่อระบบ: <strong class="text-blue-900">{{ formData.systemName || 'ระบบจัดการ...' }}</strong></p>
                        <p class="text-sm">URL: <strong class="text-blue-900">{{ formData.systemSlug || 'system-management' }}.domain.com</strong></p>
                        <p v-if="formData.systemDescription" class="text-sm">คำอธิบาย: <span class="text-blue-700">{{ formData.systemDescription }}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ขั้นตอนที่ 3: Add Logo & Favicon -->
          <div v-if="currentStep === 2" class="step-content flex-1 flex flex-col">
            <div class="step-card flex-1">
              <h4 class="text-lg font-semibold mb-4 text-gray-900">โลโก้และไอคอนระบบ</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <!-- Logo Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    โลโก้ระบบ
                  </label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="formData.logoPreview" class="mb-4">
                      <img :src="formData.logoPreview" alt="Logo Preview" class="max-h-32 mx-auto">
                      <button 
                        @click="removeLogo"
                        class="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        <font-awesome-icon icon="trash" class="mr-1" />
                        ลบโลโก้
                      </button>
                    </div>
                    <div v-else>
                      <font-awesome-icon icon="image" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p class="text-sm text-gray-600 mb-2">อัปโหลดโลโก้ระบบ</p>
                      <p class="text-xs text-gray-500">PNG, JPG, SVG (ขนาดแนะนำ: 200x60px)</p>
                    </div>
                    <input 
                      type="file" 
                      ref="logoInput"
                      @change="handleLogoUpload"
                      accept="image/*"
                      class="hidden"
                    >
                    <button 
                      @click="$refs.logoInput.click()"
                      class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      เลือกไฟล์
                    </button>
                  </div>
                </div>

                <!-- Favicon Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Favicon (ไอคอนเว็บไซต์)
                  </label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="formData.faviconPreview" class="mb-4">
                      <img :src="formData.faviconPreview" alt="Favicon Preview" class="w-16 h-16 mx-auto">
                      <button 
                        @click="removeFavicon"
                        class="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        <font-awesome-icon icon="trash" class="mr-1" />
                        ลบ Favicon
                      </button>
                    </div>
                    <div v-else>
                      <font-awesome-icon icon="star" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p class="text-sm text-gray-600 mb-2">อัปโหลด Favicon</p>
                      <p class="text-xs text-gray-500">ICO, PNG (ขนาดแนะนำ: 32x32px)</p>
                    </div>
                    <input 
                      type="file" 
                      ref="faviconInput"
                      @change="handleFaviconUpload"
                      accept="image/*"
                      class="hidden"
                    >
                    <button 
                      @click="$refs.faviconInput.click()"
                      class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      เลือกไฟล์
                    </button>
                  </div>
                </div>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex">
                  <font-awesome-icon icon="lightbulb" class="text-yellow-400 w-5 h-5 mt-0.5 mr-3" />
                  <div class="text-sm text-yellow-700">
                    <p class="font-medium">เคล็ดลับการออกแบบ:</p>
                    <ul class="mt-1 list-disc list-inside space-y-1">
                      <li>โลโก้ควรมีพื้นหลังโปร่งใส (PNG) เพื่อความยืดหยุ่น</li>
                      <li>ใช้สีที่เข้ากับธีมของระบบ</li>
                      <li>Favicon ควรเป็นรูปสี่เหลี่ยมจัตุรัสและชัดเจนแม้ขนาดเล็ก</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ขั้นตอนที่ 4: Mapping Labels -->
          <div v-if="currentStep === 3" class="step-content flex-1 flex flex-col">
            <div class="step-card flex-1">
              <h4 class="text-lg font-semibold mb-4 text-gray-900">การตั้งค่าป้ายกำกับข้อมูลหลัก</h4>
              <p class="text-gray-600 mb-4 text-sm">กำหนดป้ายกำกับสำหรับข้อมูลหลักที่จะใช้ในระบบ</p>
              
              <div class="space-y-3 mb-4">
                <div v-for="(mapping, index) in formData.labelMappings" :key="index" 
                     class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Key</label>
                    <input 
                      type="text" 
                      v-model="mapping.key"
                      placeholder="user_status"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input 
                      type="text" 
                      v-model="mapping.label"
                      placeholder="สถานะผู้ใช้งาน"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                  <div class="flex-shrink-0">
                    <button 
                      @click="removeLabelMapping(index)"
                      class="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      :disabled="formData.labelMappings.length === 1"
                    >
                      <font-awesome-icon icon="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                @click="addLabelMapping"
                class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 mb-4"
              >
                <font-awesome-icon icon="plus" class="mr-2" />
                เพิ่มป้ายกำกับใหม่
              </button>

              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <h5 class="font-medium text-gray-900 mb-2 text-sm">ตัวอย่างการใช้งาน:</h5>
                <div class="space-y-2 text-sm">
                  <div v-for="mapping in formData.labelMappings.filter(m => m.key && m.label)" :key="mapping.key" 
                       class="flex justify-between">
                    <code class="bg-gray-200 px-2 py-1 rounded text-xs">{{ mapping.key }}</code>
                    <span class="text-gray-700">→ {{ mapping.label }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex">
                  <font-awesome-icon icon="info-circle" class="text-blue-400 w-5 h-5 mt-0.5 mr-3" />
                  <div class="text-sm text-blue-700">
                    <p class="font-medium">หมายเหตุ:</p>
                    <p class="mt-1">Key ควรใช้ตัวอักษรเล็ก ตัวเลข และ underscore (_) เท่านั้น เช่น user_role, product_category</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ขั้นตอนที่ 5: Summary & Confirm -->
          <div v-if="currentStep === 4" class="step-content flex-1 flex flex-col min-h-0">
            <div class="step-card flex-1 flex flex-col min-h-0">
              <div class="flex-shrink-0">
                <h4 class="text-lg font-semibold mb-4 text-gray-900">สรุปการตั้งค่า</h4>
                <p class="text-gray-600 mb-4 text-sm">ตรวจสอบข้อมูลก่อนเริ่มการติดตั้งระบบ</p>
              </div>
              
              <div class="flex-1 overflow-y-auto pr-2" style="scrollbar-width: thin;">
                <div class="space-y-3">
                <!-- ข้อมูลระบบ -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 class="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                    <font-awesome-icon icon="cog" class="w-4 h-4 mr-2 text-blue-600" />
                    ข้อมูลระบบ
                  </h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm font-medium text-gray-700">ชื่อระบบ:</span>
                      <p class="text-gray-900">{{ formData.systemName || '-' }}</p>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-700">URL Slug:</span>
                      <p class="text-gray-900">{{ formData.systemSlug || '-' }}</p>
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-sm font-medium text-gray-700">คำอธิบาย:</span>
                      <p class="text-gray-900">{{ formData.systemDescription || 'ไม่ระบุ' }}</p>
                    </div>
                  </div>
                </div>

                <!-- รูปภาพ -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 class="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                    <font-awesome-icon icon="image" class="w-4 h-4 mr-2 text-green-600" />
                    รูปภาพและไอคอน
                  </h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-center">
                      <span class="text-sm font-medium text-gray-700">โลโก้ระบบ:</span>
                      <div class="mt-2">
                        <img v-if="formData.logoPreview" :src="formData.logoPreview" alt="Logo" class="max-h-20 mx-auto">
                        <span v-else class="text-gray-500">ไม่ได้เลือก</span>
                      </div>
                    </div>
                    <div class="text-center">
                      <span class="text-sm font-medium text-gray-700">Favicon:</span>
                      <div class="mt-2">
                        <img v-if="formData.faviconPreview" :src="formData.faviconPreview" alt="Favicon" class="w-8 h-8 mx-auto">
                        <span v-else class="text-gray-500">ไม่ได้เลือก</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ป้ายกำกับ -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 class="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                    <font-awesome-icon icon="tags" class="w-4 h-4 mr-2 text-purple-600" />
                    ป้ายกำกับข้อมูลหลัก ({{ formData.labelMappings.filter(m => m.key && m.label).length }} รายการ)
                  </h5>
                  <div class="space-y-2">
                    <div v-for="mapping in formData.labelMappings.filter(m => m.key && m.label)" 
                         :key="mapping.key" 
                         class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ mapping.key }}</code>
                      <span class="text-gray-700">{{ mapping.label }}</span>
                    </div>
                    <div v-if="formData.labelMappings.filter(m => m.key && m.label).length === 0" 
                         class="text-gray-500 text-center py-4">
                      ไม่มีป้ายกำกับที่กำหนด
                    </div>
                  </div>
                </div>
              </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div class="flex">
                    <font-awesome-icon icon="check-circle" class="text-green-400 w-5 h-5 mt-0.5 mr-3" />
                    <div class="text-sm text-green-700">
                      <p class="font-medium">พร้อมติดตั้งระบบ!</p>
                      <p class="mt-1">ระบบจะดำเนินการติดตั้งและตั้งค่าเริ่มต้นตามข้อมูลที่ระบุ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Fixed Footer -->
      <div class="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-between items-center">
            <button 
              @click="previousStep"
              :disabled="currentStep === 0"
              class="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon icon="arrow-left" class="mr-2" />
              ย้อนกลับ
            </button>

            <!-- Progress Percentage in Center -->
            <div class="flex flex-col items-center space-y-2 hidden md:flex">
              <div class="text-xs text-gray-600">ความคืบหน้า</div>
              <div class="flex items-center space-x-2">
                <div class="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-out rounded-full"
                    :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs font-medium text-gray-700 min-w-8">
                  {{ Math.round(((currentStep + 1) / steps.length) * 100) }}%
                </span>
              </div>
            </div>

            <div class="flex space-x-3">
              <button 
                v-if="currentStep < steps.length - 1"
                @click="nextStep"
                :disabled="!canProceed"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
                <font-awesome-icon icon="arrow-right" class="ml-2" />
              </button>
              
              <button 
                v-else
                @click="confirmInstallation"
                :disabled="!canProceed || isInstalling"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon v-if="isInstalling" icon="spinner" class="animate-spin mr-2" />
                {{ isInstalling ? 'กำลังติดตั้ง...' : 'เริ่มติดตั้งระบบ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSetupInstaller',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentStep: 0,
      isInstalling: false,
      celebratingStep: null,
      scrollY: 0,
      steps: [
        'ข้อตกลง',
        'ข้อมูลระบบ', 
        'โลโก้และไอคอน',
        'ป้ายกำกับ',
        'สรุปและยืนยัน'
      ],
      formData: {
        // Step 1: Agreement
        agreementAccepted: false,
        
        // Step 2: System Info
        systemName: '',
        systemSlug: '',
        systemDescription: '',
        
        // Step 3: Images
        logoFile: null,
        logoPreview: null,
        faviconFile: null,
        faviconPreview: null,
        
        // Step 4: Label Mappings
        labelMappings: [
          { key: '', label: '' }
        ]
      }
    }
  },
  computed: {
    canProceed() {
      switch (this.currentStep) {
        case 0:
          return this.formData.agreementAccepted;
        case 1:
          return this.formData.systemName.trim() && this.formData.systemSlug.trim();
        case 2:
          return true; // Optional step
        case 3:
          return true; // Optional step
        case 4:
          return true; // Summary step
        default:
          return false;
      }
    }
  },
  watch: {
    isOpen: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // เปิด modal - บล็อค body scroll
          this.disableBodyScroll();
        } else {
          // ปิด modal - เปิด body scroll
          this.enableBodyScroll();
        }
      }
    }
  },
  methods: {
    nextStep() {
      if (this.canProceed && this.currentStep < this.steps.length - 1) {
        this.celebrateStepCompletion(this.currentStep);
        this.currentStep++;
      }
    },
    
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    
    goToStep(stepIndex) {
      // Allow going to previous completed steps
      if (stepIndex <= this.currentStep) {
        this.currentStep = stepIndex;
      }
      // Allow going to next step only if current step is valid
      else if (stepIndex === this.currentStep + 1 && this.canProceed) {
        this.celebrateStepCompletion(this.currentStep);
        this.currentStep = stepIndex;
      }
    },
    
    celebrateStepCompletion(stepIndex) {
      this.celebratingStep = stepIndex;
      setTimeout(() => {
        this.celebratingStep = null;
      }, 600);
    },
    
    generateSlug() {
      // Auto-generate slug from system name
      if (this.formData.systemName) {
        this.formData.systemSlug = this.formData.systemName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
    },
    
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.logoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.logoPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    removeLogo() {
      this.formData.logoFile = null;
      this.formData.logoPreview = null;
      this.$refs.logoInput.value = '';
    },
    
    handleFaviconUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.faviconFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.faviconPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    removeFavicon() {
      this.formData.faviconFile = null;
      this.formData.faviconPreview = null;
      this.$refs.faviconInput.value = '';
    },
    
    addLabelMapping() {
      this.formData.labelMappings.push({ key: '', label: '' });
    },
    
    removeLabelMapping(index) {
      if (this.formData.labelMappings.length > 1) {
        this.formData.labelMappings.splice(index, 1);
      }
    },
    
    async confirmInstallation() {
      if (!this.canProceed) return;
      
      this.isInstalling = true;
      
      try {
        // Prepare installation data
        const installationData = {
          systemInfo: {
            name: this.formData.systemName,
            slug: this.formData.systemSlug,
            description: this.formData.systemDescription
          },
          files: {
            logo: this.formData.logoFile,
            favicon: this.formData.faviconFile
          },
          labelMappings: this.formData.labelMappings.filter(m => m.key && m.label)
        };
        
        // Here you would send the data to your backend
        // await this.$Request.post('/api/system/install', installationData);
        
        // Simulate installation process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        this.$Toast.success('ติดตั้งระบบเสร็จสิ้น!');
        
        // Emit success event to parent component
        this.$emit('installation-complete', installationData);
        
        this.closeModal();
        
      } catch (error) {
        console.error('Installation failed:', error);
        this.$Toast.error('เกิดข้อผิดพลาดในการติดตั้งระบบ');
      } finally {
        this.isInstalling = false;
      }
    },
    
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
    
    resetForm() {
      this.currentStep = 0;
      this.isInstalling = false;
      this.celebratingStep = null;
      this.formData = {
        agreementAccepted: false,
        systemName: '',
        systemSlug: '',
        systemDescription: '',
        logoFile: null,
        logoPreview: null,
        faviconFile: null,
        faviconPreview: null,
        labelMappings: [{ key: '', label: '' }]
      };
    },

    disableBodyScroll() {
      // เก็บ scroll position ปัจจุบัน
      this.scrollY = window.scrollY;
      
      // เพิ่ม class เพื่อป้องกัน scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    },

    enableBodyScroll() {
      // ลบ styles ที่ป้องกัน scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // คืนค่า scroll position
      if (this.scrollY) {
        window.scrollTo(0, this.scrollY);
      }
    }
  },
  beforeUnmount() {
    // ทำความสะอาดเมื่อ component ถูก destroy
    this.enableBodyScroll();
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for main content */
.overflow-y-auto::-webkit-scrollbar {
  width: 12px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
  border: 2px solid #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Custom scrollbar for terms section */
.terms-scroll::-webkit-scrollbar {
  width: 8px;
}

.terms-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.terms-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
  border: 1px solid #f8fafc;
}

.terms-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Firefox */
.terms-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f8fafc;
}

/* Custom scrollbar for summary section */
.overflow-y-auto[style*="scrollbar-width"]::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto[style*="scrollbar-width"]::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto[style*="scrollbar-width"]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto[style*="scrollbar-width"]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Add smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Content spacing - minimal */
.step-content {
  padding: 0;
}

/* Card-like styling for step content - minimal */
.step-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
}

/* Enhanced focus states */
.focus-enhanced:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  ring-offset: 2px;
}

/* Progress Bar Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
  background-size: 400% 400%;
  animation: gradient-shift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Step hover effects */
.step-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-hover:hover {
  transform: translateY(-2px);
}

/* Progress line animation */
.progress-line {
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 1) 0%, 
    rgba(139, 92, 246, 1) 25%, 
    rgba(236, 72, 153, 1) 50%, 
    rgba(16, 185, 129, 1) 75%, 
    rgba(34, 197, 94, 1) 100%
  );
  background-size: 200% 100%;
  animation: flow 3s ease-in-out infinite;
}

@keyframes flow {
  0% { background-position: 200% 0%; }
  100% { background-position: -200% 0%; }
}

/* Glow effects */
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
}

.glow-green {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
}

/* Step completion celebration */
@keyframes celebrate {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.15) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.animate-celebrate {
  animation: celebrate 0.6s ease-in-out;
}
</style> 