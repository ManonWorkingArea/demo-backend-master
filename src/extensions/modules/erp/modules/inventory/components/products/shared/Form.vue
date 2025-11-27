<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ formTitle }}</h1>
            <p class="mt-1 text-gray-600">{{ mode === 'edit' ? 'แก้ไขข้อมูลสินค้าในระบบ' : 'เพิ่มสินค้าใหม่เข้าสู่ระบบ' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex space-x-2 text-sm">
          <button @click="$router.push('/')" class="text-blue-600 hover:text-blue-700">
            <i class="fas fa-home mr-1"></i>
            หน้าหลัก
          </button>
          <i class="fas fa-chevron-right text-gray-400"></i>
          <button @click="$router.push('/inventory')" class="text-blue-600 hover:text-blue-700">
            <i class="fas fa-warehouse mr-1"></i>
            คลังสินค้า
          </button>
          <i class="fas fa-chevron-right text-gray-400"></i>
          <button @click="$router.push('/inventory/products')" class="text-blue-600 hover:text-blue-700">
            <i class="fas fa-list mr-1"></i>
            จัดการสินค้า
          </button>
          <i class="fas fa-chevron-right text-gray-400"></i>
          <span class="text-gray-500">{{ mode === 'edit' ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</span>
        </nav>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="saveProduct" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐานสินค้า</h3>
            <p class="text-sm text-gray-600">ข้อมูลเบื้องต้นของสินค้า</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Code -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสสินค้า (Product Code) <span class="text-red-500">*</span>
              </label>
              <div class="flex">
                <input 
                  type="text" 
                  v-model="formData.product_code" 
                  :placeholder="mode === 'edit' ? 'แก้ไขรหัสสินค้าได้' : 'รหัสจะถูกสร้างอัตโนมัติ'"
                  :readonly="mode === 'add'"
                  :disabled="saving"
                  :class="[
                    'flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.product_code ? 'border-red-300' : 'border-gray-300'
                  ]"
                />
                <button 
                  type="button" 
                  @click="generateProductCode"
                  :title="mode === 'edit' ? 'ไม่สามารถสร้างรหัสใหม่ในโหมดแก้ไขได้' : 'สร้างรหัสใหม่'"
                  :disabled="saving || generating || mode === 'edit'"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-r-lg transition-colors"
                >
                  <i class="fas fa-sync" :class="{ 'fa-spin': generating }"></i>
                </button>
              </div>
              <p v-if="errors.product_code" class="mt-1 text-sm text-red-600">{{ errors.product_code }}</p>
              <p class="mt-1 text-xs text-gray-500">รหัสสินค้าภายในระบบ (สร้างอัตโนมัติ)</p>
            </div>

            <!-- SKU -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SKU <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="formData.sku"
                  placeholder="e.g., PRD-001 หรือ 406014120 (9 หลัก)"
                  required
                  :class="[
                    'flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  ]"
                  :disabled="saving"
                />
                <button
                  v-if="isTextileProduct && formData.sku && formData.sku.length === 9"
                  type="button"
                  @click="autoFillTextileFromSKU"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  title="แยก SKU เป็นข้อมูลสิ่งทอ"
                >
                  <i class="fas fa-magic"></i>
                  <span>Auto Fill</span>
                </button>
              </div>
              <p v-if="errors.sku" class="mt-1 text-sm text-red-600">{{ errors.sku }}</p>
              <p class="mt-1 text-xs text-gray-500">
                รหัสสินค้าสำหรับระบบภายนอก
                <span v-if="isTextileProduct" class="text-green-600 font-medium">
                  (สิ่งทอ: 9 หลัก = Model(3) + Color(3) + Width(3))
                </span>
              </p>
            </div>

            <!-- Product Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ชื่อสินค้า <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="formData.product_name"
                placeholder="ระบุชื่อสินค้า"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.product_name ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.product_name" class="mt-1 text-sm text-red-600">{{ errors.product_name }}</p>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
              <select
                v-model="formData.category"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.category ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              >
                <option value="">เลือกหมวดหมู่...</option>
                <option value="electronics">อิเล็กทรอนิกส์</option>
                <option value="clothing">เสื้อผ้าและแฟชั่น</option>
                <option value="textile">สิ่งทอและผ้า</option>
                <option value="fabric">ผ้าดิบ</option>
                <option value="food">อาหารและเครื่องดื่ม</option>
                <option value="books">หนังสือและสื่อการเรียน</option>
                <option value="home">บ้านและสวน</option>
                <option value="beauty">ความงามและสุขภาพ</option>
                <option value="sports">กีฬาและออกกำลังกาย</option>
                <option value="automotive">ยานยนต์</option>
                <option value="health">การแพทย์และสุขภาพ</option>
                <option value="general">ทั่วไป</option>
              </select>
              <p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                v-model="formData.status"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.status ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="draft">ร่าง</option>
                <option value="discontinued">หยุดผลิต</option>
              </select>
              <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
              <textarea
                v-model="formData.description"
                rows="4"
                placeholder="ระบุคำอธิบายสินค้า..."
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.description ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ (formData.description || '').length }}/500 characters</p>
            </div>
          </div>
        </div>

        <!-- Textile Information Card -->
        <div v-if="isTextileProduct" class="bg-white rounded-lg shadow-sm border-l-4 border-green-500">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-cut mr-2 text-green-600"></i>
              ข้อมูลสิ่งทอ
            </h3>
            <p class="text-sm text-gray-600">ข้อมูลเฉพาะสำหรับผลิตภัณฑ์สิ่งทอและผ้า</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Model Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสรุ่น (Model Code) <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="formData.model_code"
                placeholder="411"
                maxlength="3"
                pattern="[0-9]{3}"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.model_code ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.model_code" class="mt-1 text-sm text-red-600">{{ errors.model_code }}</p>
              <p class="mt-1 text-xs text-gray-500">3 หลัก (เช่น 402)</p>
            </div>

            <!-- Color Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสสี (Color Code) <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="formData.color_code"
                placeholder="102"
                maxlength="3"
                pattern="[0-9]{3}"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.color_code ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.color_code" class="mt-1 text-sm text-red-600">{{ errors.color_code }}</p>
              <p class="mt-1 text-xs text-gray-500">3 หลัก (เช่น 177)</p>
            </div>

            <!-- Color Code Digit (ตัวเลขรหัสสีเพิ่มเติม) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ตัวเลขรหัสสี (Digit)
              </label>
              <input
                type="text"
                v-model="formData.color_code_digit"
                placeholder="1"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.color_code_digit ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.color_code_digit" class="mt-1 text-sm text-red-600">{{ errors.color_code_digit }}</p>
              <p class="mt-1 text-xs text-gray-500">ระบุตัวเลขหรือตัวอักษรรหัสสี</p>
            </div>

            <!-- Fabric Width -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ความกว้างผ้า (cm) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="formData.fabric_width_cm"
                placeholder="120"
                min="50"
                max="500"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.fabric_width_cm ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.fabric_width_cm" class="mt-1 text-sm text-red-600">{{ errors.fabric_width_cm }}</p>
              <p class="mt-1 text-xs text-gray-500">ความกว้าง 50-500 cm</p>
            </div>

            <!-- Fabric Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทผ้า</label>
              <select
                v-model="formData.fabric_type"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.fabric_type ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              >
                <option value="">เลือกประเภทผ้า...</option>
                <option value="cotton">ผ้าฝ้าย</option>
                <option value="polyester">ผ้าโพลีเอสเตอร์</option>
                <option value="silk">ผ้าไหม</option>
                <option value="wool">ผ้าขนสัตว์</option>
                <option value="linen">ผ้าลินิน</option>
                <option value="blend">ผ้าผสม</option>
                <option value="synthetic">ผ้าสังเคราะห์</option>
                <option value="natural">ผ้าธรรมชาติ</option>
                <option value="denim">ผ้ายีนส์</option>
                <option value="jersey">ผ้าเจอร์ซีย์</option>
              </select>
              <p v-if="errors.fabric_type" class="mt-1 text-sm text-red-600">{{ errors.fabric_type }}</p>
            </div>

            <!-- Weight per Meter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                น้ำหนักต่อเมตร (kg/m) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="formData.weight_per_meter"
                placeholder="0.300"
                min="0.001"
                max="5.000"
                step="0.001"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.weight_per_meter ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.weight_per_meter" class="mt-1 text-sm text-red-600">{{ errors.weight_per_meter }}</p>
              <p class="mt-1 text-xs text-gray-500">สำหรับคำนวณแปลงหน่วย kg ↔ m</p>
            </div>

            <!-- GSM -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">GSM</label>
              <input
                type="number"
                v-model.number="formData.gsm"
                placeholder="180"
                min="50"
                max="1000"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.gsm ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.gsm" class="mt-1 text-sm text-red-600">{{ errors.gsm }}</p>
              <p class="mt-1 text-xs text-gray-500">Grams per Square Meter</p>
            </div>

            <!-- Fabric Composition -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">องค์ประกอบผ้า</label>
              <input
                type="text"
                v-model="formData.fabric_composition"
                placeholder="Cotton 60%, Polyester 40%"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.fabric_composition ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.fabric_composition" class="mt-1 text-sm text-red-600">{{ errors.fabric_composition }}</p>
              <p class="mt-1 text-xs text-gray-500">ระบุเปอร์เซ็นต์ของวัสดุแต่ละชนิด</p>
            </div>

            <!-- Thread Count -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Thread Count</label>
              <input
                type="text"
                v-model="formData.thread_count"
                placeholder="200TC"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
                  errors.thread_count ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.thread_count" class="mt-1 text-sm text-red-600">{{ errors.thread_count }}</p>
              <p class="mt-1 text-xs text-gray-500">จำนวนเส้นด้ายต่อนิ้วกำลังสอง</p>
            </div>

            <!-- Enable Lot Tracking -->
            <div class="md:col-span-3">
              <div class="flex items-start space-x-3">
                <div class="flex items-center h-5">
                  <input
                    id="enable_lot_tracking"
                    type="checkbox"
                    v-model="formData.enable_lot_tracking"
                    class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    :disabled="saving"
                  />
                </div>
                <div>
                  <label for="enable_lot_tracking" class="text-sm font-medium text-gray-700">
                    เปิดใช้การติดตาม Lot (123456152008883)
                  </label>
                  <p class="text-xs text-gray-500">
                    เมื่อเปิดใช้งาน จะสามารถติดตาม Lot แต่ละม้วนได้อย่างละเอียด รวมถึงการแปลงน้ำหนัก-เมตร
                  </p>
                </div>
              </div>
            </div>

            <!-- Product Code & Lot ID Preview (2 Columns) -->
            <div v-if="isTextileProduct && hasValidLotComponents" class="md:col-span-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Product Code Preview -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-blue-800 mb-2">รหัสสินค้าที่จะสร้าง (Product Code):</h4>
                  <div class="text-xl font-mono text-blue-900 bg-blue-100 px-3 py-2 rounded border">
                    {{ previewProductCode }}
                  </div>
                  <p class="text-xs text-blue-600 mt-2">
                    รูปแบบ: PRD-{{ formData.model_code || 'XXX' }}-{{ formData.color_code || 'XXX' }}-{{ String(formData.fabric_width_cm || 'XXX').padStart(3, '0') }}
                  </p>
                </div>

                <!-- Lot ID Preview -->
                <div v-if="formData.enable_lot_tracking" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-green-800 mb-2">ตัวอย่าง Lot ID ที่จะสร้าง:</h4>
                  <div class="text-lg font-mono text-green-900 bg-green-100 px-3 py-2 rounded border">
                    {{ previewLotId }}
                  </div>
                  <p class="text-xs text-green-600 mt-2">
                    รูปแบบ: {{ formData.model_code || 'XXX' }}{{ formData.color_code || 'XXX' }}{{ String(formData.fabric_width_cm || 'XXX').padStart(3, '0') }}XXXXX
                  </p>
                </div>
                
                <!-- Placeholder when Lot Tracking is disabled -->
                <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                  <p class="text-sm text-gray-500 text-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    เปิดใช้การติดตาม Lot เพื่อดู Lot ID
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Image Card -->
        <div v-if="isTextileProduct" class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-image mr-2 text-purple-600"></i>
              รูปภาพสินค้า
            </h3>
            <p class="text-sm text-gray-600">ดึงรูปภาพจาก Recasens API อัตโนมัติ หรือค้นหาด้วยตนเอง</p>
          </div>
          
          <div class="px-6 py-6">
            <!-- Custom Search Input -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-search mr-1 text-purple-600"></i>
                ค้นหารูปภาพ
              </label>
              <div class="flex gap-2">
                <input
                  v-model="customImageSearch"
                  type="text"
                  :placeholder="productImageSearchRef || 'กรอกคำค้นหา เช่น NAUTIMAR 006'"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  :disabled="loadingProductImage"
                  @keyup.enter="searchProductImageCustom"
                />
                <button
                  type="button"
                  @click="searchProductImageCustom"
                  :disabled="loadingProductImage || (!customImageSearch && !productImageSearchRef)"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <i class="fas fa-search" :class="{ 'fa-spin': loadingProductImage }"></i>
                  <span class="hidden sm:inline">ค้นหา</span>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                กรอกคำค้นหาเอง หรือปล่อยว่างเพื่อใช้ค่าอัตโนมัติ: <span class="font-mono text-purple-600">{{ productImageSearchRef || '-' }}</span>
              </p>
            </div>

            <!-- Search Reference Display (collapsed when custom search is used) -->
            <div v-if="productImageSearchRef && !customImageSearch" class="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div class="flex items-center text-sm text-purple-800">
                <i class="fas fa-magic mr-2"></i>
                <span>ค้นหาอัตโนมัติด้วย: <strong class="font-mono">{{ productImageSearchRef }}</strong></span>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingProductImage" class="flex items-center justify-center py-12">
              <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-3"></i>
                <p class="text-gray-600">กำลังค้นหารูปภาพจาก Recasens...</p>
              </div>
            </div>

            <!-- Image Display -->
            <div v-else-if="formData.product_image_url" class="space-y-4">
              <div class="relative inline-block">
                <img 
                  :src="formData.product_image_url" 
                  :alt="formData.product_name || 'Product Image'"
                  class="max-w-md rounded-lg shadow-lg border-2 border-gray-200"
                  @error="handleImageError"
                />
                <button
                  type="button"
                  @click="clearProductImage"
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="ลบรูปภาพ"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="refetchProductImage"
                  :disabled="!productImageSearchRef || loadingProductImage"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loadingProductImage }"></i>
                  ดึงรูปใหม่
                </button>
                
                <div v-if="formData.product_image_source" class="text-xs text-gray-500">
                  <i class="fas fa-link mr-1"></i>
                  แหล่งที่มา: {{ formData.product_image_source }}
                </div>
              </div>
            </div>

            <!-- No Image State -->
            <div v-else class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <i class="fas fa-image text-5xl text-gray-300 mb-3"></i>
              <p class="text-gray-500 mb-4">ไม่พบรูปภาพสินค้า</p>
              <button
                v-if="productImageSearchRef"
                type="button"
                @click="fetchProductImage"
                :disabled="loadingProductImage"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <i class="fas fa-search mr-2"></i>
                ค้นหารูปภาพ
              </button>
              <p v-else class="text-xs text-gray-400 mt-2">กรุณากรอกตัวเลขรหัสสี (Digit) เพื่อค้นหารูปภาพ</p>
            </div>
          </div>
        </div>

        <!-- Pricing & Inventory Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ราคาและสต็อก</h3>
            <p class="text-sm text-gray-600">ข้อมูลราคาและการจัดการสต็อก</p>
          </div>
          
          <div class="px-6 py-6 space-y-6">
            <!-- Pricing Section -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <i class="fas fa-tag text-blue-600 mr-2"></i>
                ราคาขาย
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Retail Price (per meter) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ราคาขายปลีก <span class="text-gray-500 text-xs">(ต่อเมตร)</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-baht-sign text-gray-400 text-sm"></i>
                    </div>
                    <input
                      v-model.number="formData.retail_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="errors.retail_price ? 'border-red-300' : 'border-gray-300'"
                      :disabled="saving"
                    />
                  </div>
                  <p v-if="errors.retail_price" class="mt-1 text-sm text-red-600">{{ errors.retail_price }}</p>
                  <p class="mt-1 text-xs text-gray-500">ราคาขายต่อเมตรสำหรับลูกค้าทั่วไป</p>
                </div>

                <!-- Wholesale Price (per roll) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ราคาขายส่ง <span class="text-gray-500 text-xs">(ยกม้วน)</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-baht-sign text-gray-400 text-sm"></i>
                    </div>
                    <input
                      v-model.number="formData.wholesale_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="errors.wholesale_price ? 'border-red-300' : 'border-gray-300'"
                      :disabled="saving"
                    />
                  </div>
                  <p v-if="errors.wholesale_price" class="mt-1 text-sm text-red-600">{{ errors.wholesale_price }}</p>
                  <p class="mt-1 text-xs text-gray-500">ราคาขายยกม้วนสำหรับลูกค้าขายส่ง</p>
                </div>

                <!-- Unit Price (Cost) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ราคาต้นทุน <span class="text-gray-500 text-xs">(ต่อหน่วย)</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-baht-sign text-gray-400 text-sm"></i>
                    </div>
                    <input
                      v-model.number="formData.unit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="errors.unit_price ? 'border-red-300' : 'border-gray-300'"
                      :disabled="saving"
                    />
                  </div>
                  <p v-if="errors.unit_price" class="mt-1 text-sm text-red-600">{{ errors.unit_price }}</p>
                  <p class="mt-1 text-xs text-gray-500">ราคาต้นทุนต่อหน่วย</p>
                </div>

                <!-- Price Summary (if both prices set) -->
                <div v-if="formData.retail_price > 0 && formData.wholesale_price > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="text-xs font-medium text-blue-800 mb-2">
                    <i class="fas fa-calculator mr-1"></i>
                    สรุปราคา
                  </div>
                  <div class="space-y-1 text-xs text-blue-700">
                    <div class="flex justify-between">
                      <span>ปลีก (ต่อเมตร):</span>
                      <span class="font-semibold">{{ formatCurrency(formData.retail_price) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>ส่ง (ยกม้วน):</span>
                      <span class="font-semibold">{{ formatCurrency(formData.wholesale_price) }}</span>
                    </div>
                    <div v-if="formData.unit_price > 0" class="flex justify-between pt-1 border-t border-blue-300">
                      <span>กำไรปลีก:</span>
                      <span class="font-semibold" :class="formData.retail_price > formData.unit_price ? 'text-green-700' : 'text-red-700'">
                        {{ formatCurrency(formData.retail_price - formData.unit_price) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inventory Section -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <i class="fas fa-boxes text-green-600 mr-2"></i>
                การจัดการสต็อก
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Unit -->
                <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">หน่วยนับ</label>
              <select
                v-model="formData.unit"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.unit ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              >
                <option value="piece">ชิ้น</option>
                <option value="pack">แพ็ค</option>
                <option value="box">กล่อง</option>
                <option value="kg">กิโลกรัม</option>
                <option value="gram">กรัม</option>
                <option value="liter">ลิตร</option>
                <option value="ml">มิลลิลิตร</option>
                <option value="meter">เมตร</option>
                <option value="cm">เซนติเมตร</option>
                <option value="set">ชุด</option>
              </select>
              <p v-if="errors.unit" class="mt-1 text-sm text-red-600">{{ errors.unit }}</p>
            </div>

            <!-- Min Stock -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สต็อกขั้นต่ำ</label>
              <input
                type="number"
                v-model.number="formData.min_stock"
                min="0"
                placeholder="5"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.min_stock ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.min_stock" class="mt-1 text-sm text-red-600">{{ errors.min_stock }}</p>
              <p class="mt-1 text-xs text-gray-500">แจ้งเตือนเมื่อสต็อกต่ำกว่านี้</p>
            </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Supplier Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลผู้จำหน่าย</h3>
            <p class="text-sm text-gray-600">ระบุผู้จำหน่ายสินค้า</p>
          </div>
          
          <div class="px-6 py-6">
            <div class="supplier-search-wrapper">
              <label class="block text-sm font-medium text-gray-700 mb-2">ผู้จำหน่าย</label>
              <div class="supplier-input-container">
                <div class="input-with-icon">
                  <i class="input-icon fas fa-building"></i>
                  <input
                    type="text"
                    v-model="supplierSearchQuery"
                    placeholder="ค้นหาผู้จำหน่าย หรือพิมพ์ชื่อใหม่..."
                    class="supplier-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @input="onSupplierInput"
                    @focus="showSupplierDropdown = true"
                    @blur="hideSupplierDropdown"
                    :disabled="saving"
                  />
                  <i v-if="formData.supplier_id" class="selected-indicator fas fa-check-circle"></i>
                </div>
                
                <div v-if="showSupplierDropdown" class="supplier-dropdown">
                  <div class="dropdown-header">
                    <span class="dropdown-title">เลือกผู้จำหน่าย</span>
                    <span class="dropdown-count">{{ filteredSuppliers.length }} รายการ</span>
                  </div>
                  
                  <div class="suppliers-list">
                    <!-- New Supplier Option -->
                    <div 
                      v-if="supplierSearchQuery.trim() && !filteredSuppliers.some(s => (s.name || '').toLowerCase() === supplierSearchQuery.toLowerCase().trim())"
                      @mousedown.prevent="selectSupplier(null, supplierSearchQuery.trim())"
                      class="supplier-option new-supplier"
                    >
                      <div class="option-icon new-icon">
                        <i class="fas fa-plus"></i>
                      </div>
                      <div class="option-content">
                        <div class="option-name">สร้างผู้จำหน่ายใหม่</div>
                        <div class="option-description">
                          <span class="supplier-code">{{ supplierSearchQuery.trim() }}</span>
                        </div>
                        <div class="option-meta">
                          <span>จะสร้างผู้จำหน่ายใหม่ในระบบ</span>
                        </div>
                      </div>
                      <div class="option-action">
                        <i class="fas fa-arrow-right"></i>
                      </div>
                    </div>
                    
                    <!-- Existing Suppliers -->
                    <div 
                      v-for="supplier in filteredSuppliers" 
                      :key="supplier.id"
                      @mousedown.prevent="selectSupplier(supplier)"
                      class="supplier-option existing-supplier"
                    >
                      <div class="option-icon">
                        <i class="fas fa-building"></i>
                      </div>
                      <div class="option-content">
                        <div class="option-name">{{ supplier.name || supplier.supplier_code }}</div>
                        <div class="option-description">
                          <span v-if="supplier.supplier_code" class="supplier-code">{{ supplier.supplier_code }}</span>
                          <span v-if="supplier.contact_person" class="contact-person">{{ supplier.contact_person }}</span>
                        </div>
                        <div class="option-meta">
                          <span class="supplier-id">ID: {{ supplier.id }}</span>
                          <span class="option-status" :class="`status-${supplier.status}`">
                            {{ formatSupplierStatus(supplier.status) }}
                          </span>
                        </div>
                      </div>
                      <div class="option-action">
                        <i class="fas fa-check"></i>
                      </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div v-if="filteredSuppliers.length === 0 && !supplierSearchQuery.trim()" class="empty-state">
                      <div class="empty-icon">
                        <i class="fas fa-search"></i>
                      </div>
                      <div class="empty-text">เริ่มพิมพ์เพื่อค้นหาผู้จำหน่าย</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Selected Supplier Display -->
              <div v-if="formData.supplier && formData.supplier_id" class="selected-supplier">
                <div class="selected-supplier-info">
                  <i class="fas fa-building"></i>
                  <span class="selected-name">{{ formData.supplier }}</span>
                  <span class="selected-id">ID: {{ formData.supplier_id }}</span>
                </div>
                <button type="button" @click="clearSupplier" class="clear-selection-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <p class="mt-1 text-xs text-gray-500">เลือกจากรายการ หรือพิมพ์ชื่อใหม่เพื่อสร้างผู้จำหน่ายใหม่</p>
            </div>
          </div>
        </div>

        <!-- Initial Stock Card (แสดงเฉพาะใน Add mode) -->
        <div v-if="mode === 'add'" class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">สต็อกเริ่มต้น</h3>
            <p class="text-sm text-gray-600">กำหนดสต็อกเริ่มต้นสำหรับสินค้าใหม่</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Initial Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนเริ่มต้น</label>
              <input
                type="number"
                v-model.number="formData.initial_quantity"
                min="0"
                placeholder="0"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.initial_quantity ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.initial_quantity" class="mt-1 text-sm text-red-600">{{ errors.initial_quantity }}</p>
            </div>

            <!-- Initial Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ตำแหน่งจัดเก็บ</label>
              <input
                type="text"
                v-model="formData.initial_location"
                placeholder="WH01-A-001"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.initial_location ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.initial_location" class="mt-1 text-sm text-red-600">{{ errors.initial_location }}</p>
            </div>

            <!-- Initial Cost -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ต้นทุนต่อหน่วย</label>
              <input
                type="number"
                v-model.number="formData.initial_cost"
                step="0.01"
                min="0"
                placeholder="0.00"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.initial_cost ? 'border-red-300' : 'border-gray-300'
                ]"
                :disabled="saving"
              />
              <p v-if="errors.initial_cost" class="mt-1 text-sm text-red-600">{{ errors.initial_cost }}</p>
            </div>
          </div>
        </div>

        <!-- Current Balance (แสดงเฉพาะใน Edit mode) -->
        <div v-if="mode === 'edit' && product?.id" class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">ยอดคงเหลือปัจจุบัน</h3>
                <p class="text-sm text-gray-600">สถานะสต็อกสินค้าในระบบ</p>
              </div>
              <button
                type="button"
                @click="refreshBalance"
                :disabled="refreshing"
                class="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync" :class="{ 'fa-spin': refreshing }"></i>
                รีเฟรช
              </button>
            </div>
          </div>
          
          <div v-if="currentBalance" class="px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-cubes text-green-600"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-green-900">ยอดคงเหลือ</p>
                    <p class="text-lg font-bold text-green-600">{{ formatNumber(currentBalance.available || 0) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-lock text-yellow-600"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-yellow-900">จองแล้ว</p>
                    <p class="text-lg font-bold text-yellow-600">{{ formatNumber(currentBalance.reserved || 0) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-calculator text-blue-600"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-blue-900">รวมทั้งหมด</p>
                    <p class="text-lg font-bold text-blue-600">{{ formatNumber(currentBalance.total || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="px-6 py-6 text-center text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>กำลังโหลดข้อมูลยอดคงเหลือ...</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="$emit('cancel')"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              ยกเลิก
            </button>
            
            <!-- Bulk Import Button -->
            <button
              v-if="mode === 'add'"
              @click="showBulkImportModal = true"
              type="button"
              class="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              title="เพิ่มสินค้าจำนวนมาก"
            >
              <i class="fas fa-file-import"></i>
              เพิ่มหลายรายการ
            </button>
            
            <!-- Debug Button -->
            <button
              type="button"
              @click="debugFormState"
              class="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              title="ตรวจสอบสถานะฟอร์ม"
            >
              🐛 Debug
            </button>
          </div>
          
          <div class="flex space-x-3">
            <button
              v-if="mode === 'add'"
              type="button"
              @click="saveDraft"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              :disabled="saving"
            >
              <i class="fas fa-save mr-2"></i>
              บันทึกร่าง
            </button>
            
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              :disabled="!isFormValid || saving"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              {{ saving ? 'กำลังบันทึก...' : submitButtonText }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Image Selection Modal -->
    <div v-if="showImageSelectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-2">🖼️ เลือกรูปภาพสินค้า ({{ productImageResults.length }} รายการ)</h3>
              <div v-if="formData.sku" class="flex flex-wrap gap-3 text-sm text-blue-50">
                <div class="flex items-center gap-2">
                  <i class="fas fa-barcode"></i>
                  <span>SKU: <strong>{{ formData.sku }}</strong></span>
                </div>
                <div v-if="formData.product_name" class="flex items-center gap-2">
                  <i class="fas fa-tag"></i>
                  <span>{{ formData.product_name }}</span>
                </div>
                <div v-if="productImageSearchRef" class="flex items-center gap-2">
                  <i class="fas fa-search"></i>
                  <span>ค้นหา: <strong>{{ productImageSearchRef }}</strong></span>
                </div>
              </div>
            </div>
            <button @click="closeImageSelectionModal" class="text-white hover:text-gray-200 transition-colors ml-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="(product, index) in productImageResults" 
              :key="index"
              @click="selectProductImage(product)"
              class="border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div class="aspect-square bg-gray-100">
                <img 
                  :src="product.imageUrl" 
                  :alt="product.productName" 
                  class="w-full h-full object-cover"
                  @error="(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                />
              </div>
              <div class="p-2 bg-white">
                <p class="font-medium text-xs text-gray-900 mb-1 truncate">{{ product.productName }}</p>
                <p class="text-xs text-blue-600 font-semibold mb-1">{{ product.category }}</p>
                <a 
                  :href="product.productUrl" 
                  target="_blank" 
                  class="text-xs text-gray-500 hover:text-blue-600 underline"
                  @click.stop
                >
                  ดูรายละเอียด →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            @click="closeImageSelectionModal"
            class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <div v-if="showBulkImportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeBulkImportModal">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i class="fas fa-file-import"></i>
                เพิ่มสินค้าจำนวนมาก
              </h3>
              <p class="text-purple-100 text-sm mt-1">นำเข้าสินค้าหลายรายการพร้อมกัน</p>
            </div>
            <button @click="closeBulkImportModal" class="text-white hover:text-purple-200 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px);">
          <!-- Instructions -->
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
              <div>
                <h4 class="font-semibold text-blue-900 mb-2">รูปแบบข้อมูล</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• แต่ละบรรทัดคือ 1 รายการสินค้า</li>
                  <li>• รูปแบบ: <code class="bg-blue-100 px-2 py-1 rounded">SKU[TAB]ชื่อสินค้า</code></li>
                  <li>• ตัวอย่าง: <code class="bg-blue-100 px-2 py-1 rounded">406014120	RECACRIL LTDO. 14 BLANCO-VERDE</code></li>
                  <li>• ระบบจะใช้การตั้งค่าจากฟอร์มด้านล่างสำหรับสินค้าทั้งหมด</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Current Settings Display -->
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <i class="fas fa-cog"></i>
              การตั้งค่าที่จะใช้สำหรับสินค้าทั้งหมด
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">หมวดหมู่:</span>
                <strong class="ml-2 text-purple-700">{{ getCategoryLabel(formData.category) }}</strong>
              </div>
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">หน่วย:</span>
                <strong class="ml-2 text-purple-700">{{ getUnitLabel(formData.unit) }}</strong>
              </div>
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">สถานะ:</span>
                <strong class="ml-2 text-purple-700">{{ getStatusLabel(formData.status) }}</strong>
              </div>
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">ผู้จัดจำหน่าย:</span>
                <strong class="ml-2 text-purple-700">{{ formData.supplier || 'ไม่ระบุ' }}</strong>
              </div>
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">ราคาขาย:</span>
                <strong class="ml-2 text-purple-700">{{ formatCurrency(formData.unit_price) }}</strong>
              </div>
              <div class="bg-white rounded px-3 py-2 border border-purple-100">
                <span class="text-gray-600">สต็อกต่ำสุด:</span>
                <strong class="ml-2 text-purple-700">{{ formData.min_stock }}</strong>
              </div>
            </div>
            <p class="text-xs text-purple-600 mt-3 italic">
              <i class="fas fa-lightbulb mr-1"></i>
              หากต้องการเปลี่ยนการตั้งค่า กรุณาปิดหน้าต่างนี้และแก้ไขในฟอร์มด้านล่างก่อน
            </p>
          </div>

          <!-- Textarea Input -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              วางข้อมูลสินค้า (1 บรรทัดต่อ 1 รายการ)
            </label>
            <textarea
              v-model="bulkImportText"
              rows="12"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="406014120	RECACRIL LTDO. 14 BLANCO-VERDE&#10;406014121	RECACRIL LTDO. 15 AZUL-BLANCO&#10;406014122	RECACRIL LTDO. 16 ROJO-VERDE"
            ></textarea>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-500">
                จำนวนรายการที่ไม่ซ้ำ: <strong class="text-purple-600">{{ bulkImportLines.length }}</strong> รายการ
              </p>
              <p v-if="bulkImportDuplicateCount > 0" class="text-xs text-orange-600">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                พบข้อมูลซ้ำ: <strong>{{ bulkImportDuplicateCount }}</strong> รายการ (จะถูกกรองออก)
              </p>
            </div>
          </div>
          
          <!-- Duplicate Warning -->
          <div v-if="bulkImportDuplicateCount > 0" class="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <div class="flex items-start">
              <i class="fas fa-exclamation-triangle text-orange-500 mt-1 mr-3"></i>
              <div class="flex-1">
                <h4 class="font-semibold text-orange-900 mb-2">พบข้อมูล SKU ซ้ำกัน</h4>
                <p class="text-sm text-orange-800 mb-2">
                  ระบบพบ SKU ซ้ำกัน <strong>{{ bulkImportDuplicateCount }}</strong> รายการ จะเก็บเฉพาะตัวแรกที่พบเท่านั้น
                </p>
                <div class="max-h-32 overflow-y-auto bg-white rounded p-2 text-xs">
                  <div v-for="(dup, idx) in bulkImportDuplicates.slice(0, 10)" :key="idx" class="py-1 border-b border-orange-100 last:border-0">
                    <span class="font-mono font-semibold text-orange-700">{{ dup.sku }}</span>
                    <span class="text-gray-600 mx-2">-</span>
                    <span class="text-gray-700">{{ dup.name }}</span>
                    <span class="text-orange-500 ml-2">(ซ้ำ {{ dup.count }} ครั้ง)</span>
                  </div>
                  <p v-if="bulkImportDuplicates.length > 10" class="text-center text-gray-500 mt-2">
                    ... และอีก {{ bulkImportDuplicates.length - 10 }} รายาการ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="bulkImportLines.length > 0" class="mb-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">ตัวอย่างข้อมูลที่จะนำเข้า (5 รายการแรก)</h4>
            <div class="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-600 border-b">
                    <th class="pb-2 w-12">#</th>
                    <th class="pb-2">SKU</th>
                    <th class="pb-2">ชื่อสินค้า</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in bulkImportPreview" :key="idx" class="border-b border-gray-200">
                    <td class="py-2 text-gray-500">{{ idx + 1 }}</td>
                    <td class="py-2 font-mono font-semibold text-purple-600">{{ item.sku }}</td>
                    <td class="py-2 text-gray-700">{{ item.name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="bulkImporting" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">กำลังนำเข้า...</span>
              <span class="text-sm text-gray-600">{{ bulkImportProgress }}/{{ bulkImportTotal }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 transition-all duration-300"
                :style="{ width: bulkImportProgressPercent + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ bulkImportStatus }}</p>
          </div>

          <!-- Results Summary -->
          <div v-if="bulkImportResults.length > 0" class="mb-4">
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <div class="flex-1">
                  <h4 class="font-semibold text-green-900 mb-2">สรุปผลการนำเข้า</h4>
                  <div class="space-y-1 text-sm">
                    <p class="text-green-800">
                      <i class="fas fa-check-circle text-green-600 mr-1"></i>
                      นำเข้าสำเร็จ: <strong>{{ bulkImportSuccessCount }}</strong> รายการ
                    </p>
                    <p v-if="bulkImportResults.filter(r => r.skipped).length > 0" class="text-orange-600">
                      <i class="fas fa-ban text-orange-500 mr-1"></i>
                      ข้าม (SKU ซ้ำ): <strong>{{ bulkImportResults.filter(r => r.skipped).length }}</strong> รายการ
                    </p>
                    <p v-if="bulkImportResults.filter(r => !r.success && !r.skipped).length > 0" class="text-red-600">
                      <i class="fas fa-times-circle text-red-500 mr-1"></i>
                      ล้มเหลว: <strong>{{ bulkImportResults.filter(r => !r.success && !r.skipped).length }}</strong> รายการ
                    </p>
                  </div>
                  
                  <!-- Show failed/skipped items -->
                  <div v-if="bulkImportFailCount > 0" class="mt-3 max-h-48 overflow-y-auto bg-white rounded p-3 text-xs">
                    <div v-for="(result, idx) in bulkImportResults.filter(r => !r.success)" :key="idx" class="py-2 border-b border-gray-200 last:border-0">
                      <div class="flex items-start gap-2">
                        <i :class="result.skipped ? 'fas fa-ban text-orange-500' : 'fas fa-times-circle text-red-500'" class="mt-0.5"></i>
                        <div class="flex-1">
                          <div class="font-mono font-semibold" :class="result.skipped ? 'text-orange-700' : 'text-red-700'">
                            {{ result.sku }}
                          </div>
                          <div class="text-gray-600">{{ result.name }}</div>
                          <div :class="result.skipped ? 'text-orange-600' : 'text-red-600'" class="mt-1">
                            {{ result.error }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            @click="closeBulkImportModal"
            type="button"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            :disabled="bulkImporting"
          >
            {{ bulkImporting ? 'กำลังดำเนินการ...' : 'ปิด' }}
          </button>
          
          <div class="flex gap-3">
            <button
              v-if="!bulkImporting && bulkImportResults.length === 0"
              @click="clearBulkImport"
              type="button"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <i class="fas fa-eraser mr-2"></i>
              ล้างข้อมูล
            </button>
            
            <button
              v-if="!bulkImporting"
              @click="processBulkImport"
              type="button"
              :disabled="bulkImportLines.length === 0"
              class="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-upload mr-2"></i>
              เริ่มนำเข้า ({{ bulkImportLines.length }} รายการ)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, getCurrentInstance, nextTick } from 'vue'

export default {
  name: 'ProductForm',
  props: {
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    },
    product: {
      type: Object,
      default: null
    },
    isPageMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    // ✅ ใช้ window.ERP_CORE.engine ที่ถูก configure เป็น API driver แล้ว
    const engine = window.ERP_CORE.engine
    
    // State
    const saving = ref(false)
    const loading = ref(false)
    const generating = ref(false)
    const suppliers = ref([])
    const errors = ref({})
    
    // Supplier search states
    const showSupplierDropdown = ref(false)
    const supplierSearchQuery = ref('')
    
    // Balance states
    const currentBalance = ref(null)
    const recalculating = ref(false)
    const refreshing = ref(false)
    
    // Product Image states
    const loadingProductImage = ref(false)
    const productImageError = ref(null)
    const productImageResults = ref([])
    const showImageSelectionModal = ref(false)
    const customImageSearch = ref('') // Custom search input for product image
    
    // Bulk Import states
    const showBulkImportModal = ref(false)
    const bulkImportText = ref('')
    const bulkImporting = ref(false)
    const bulkImportProgress = ref(0)
    const bulkImportTotal = ref(0)
    const bulkImportStatus = ref('')
    const bulkImportResults = ref([])
    
    const formData = ref({
      product_code: '',
      sku: '',
      product_name: '',
      description: '',
      unit: 'piece',
      unit_price: 0,
      retail_price: 0,  // ราคาขายปลีก (ต่อเมตร)
      wholesale_price: 0,  // ราคาขายส่ง (ยกม้วน)
      min_stock: 5,
      category: 'general',  // เปลี่ยนจาก 'electronics' เป็น 'general'
      supplier: '',
      supplier_id: null,
      status: 'active',
      // Initial stock fields (for new products)
      initial_quantity: 0,
      initial_location: 'WH01-A-001',
      initial_cost: 0,
      // Textile specific fields
      is_textile: false,
      model_code: '',
      color_code: '',
      color_code_digit: '', // ตัวเลขรหัสสีเพิ่มเติม (แยกจาก color_code)
      fabric_width_cm: null,
      fabric_type: '',
      fabric_composition: '',
      gsm: null,
      thread_count: '',
      weight_per_meter: null,
      enable_lot_tracking: false,
      fabric_pattern: '',
      care_instructions: '',
      // Product Image fields
      product_image_url: '',
      product_image_source: ''
    })
    
    // Computed
    const availableSuppliers = computed(() => {
      if (!suppliers.value || !Array.isArray(suppliers.value)) {
        return []
      }
      
      return suppliers.value.filter(supplier => {
        if (supplier.status !== 'active') return false
        if (!supplier.name && !supplier.supplier_code) return false
        return true
      }).sort((a, b) => {
        const nameA = a.name || a.supplier_code || ''
        const nameB = b.name || b.supplier_code || ''
        return nameA.localeCompare(nameB)
      })
    })
    
    const filteredSuppliers = computed(() => {
      if (!supplierSearchQuery.value.trim()) {
        return availableSuppliers.value.slice(0, 10)
      }
      
      const query = supplierSearchQuery.value.toLowerCase().trim()
      
      return availableSuppliers.value.filter(supplier => {
        const name = (supplier.name || '').toLowerCase()
        const code = (supplier.supplier_code || '').toLowerCase()
        const contact = (supplier.contact_person || '').toLowerCase()
        
        return name.includes(query) || 
               code.includes(query) || 
               contact.includes(query)
      }).slice(0, 8)
    })
    
    // Textile computed properties
    const isTextileProduct = computed(() => {
      return formData.value.category === 'textile' || formData.value.category === 'fabric' || formData.value.is_textile
    })
    
    const hasValidLotComponents = computed(() => {
      return formData.value.model_code && 
             formData.value.color_code && 
             formData.value.fabric_width_cm &&
             /^[0-9]{3}$/.test(formData.value.model_code) &&
             /^[0-9]{3}$/.test(formData.value.color_code)
    })
    
    const previewLotId = computed(() => {
      if (!hasValidLotComponents.value) return 'XXXXXXXXXXXX'
      
      const model = formData.value.model_code
      const color = formData.value.color_code  
      const width = String(formData.value.fabric_width_cm).padStart(3, '0')
      
      return `${model}${color}${width}XXXXX`
    })
    
    const previewProductCode = computed(() => {
      if (!hasValidLotComponents.value) return 'PRD-XXX-XXX-XXX'
      
      const model = formData.value.model_code.padStart(3, '0')
      const color = formData.value.color_code.padStart(3, '0')  
      const width = String(formData.value.fabric_width_cm).padStart(3, '0')
      
      return `PRD-${model}-${color}-${width}`
    })

    // Computed property for product image search
    const productImageSearchRef = computed(() => {
      const digit = formData.value.color_code_digit?.trim()
      
      if (!digit) return ''
      
      // Format: ใช้เฉพาะ color_code_digit (Digit) เช่น "006"
      return digit
    })

    // Watch for category changes to auto-enable textile
    watch(() => formData.value.category, (newCategory) => {
      formData.value.is_textile = newCategory === 'textile' || newCategory === 'fabric'
      
      // Auto-set appropriate unit for textiles
      if (formData.value.is_textile && formData.value.unit === 'piece') {
        formData.value.unit = 'meter'
      }
    })

    // Watch for textile fields to validate
    watch([
      () => formData.value.model_code,
      () => formData.value.color_code,
      () => formData.value.fabric_width_cm
    ], () => {
      if (isTextileProduct.value) {
        validateTextileFields()
      }
    })

    // Watch for product image search reference changes
    watch(productImageSearchRef, (newRef, oldRef) => {
      if (newRef && newRef !== oldRef && isTextileProduct.value) {
        console.log('🖼️ Search reference changed:', newRef)
        // Auto-fetch image when search reference is complete
        if (newRef.length >= 5) { // e.g., "RS-102" = 6 chars
          fetchProductImage()
        }
      }
    })

    const validateTextileFields = () => {
      // Clear textile-related errors first
      delete errors.value.model_code
      delete errors.value.color_code
      delete errors.value.fabric_width_cm
      delete errors.value.weight_per_meter

      if (!isTextileProduct.value) return

      // Validate model code
      if (formData.value.enable_lot_tracking && formData.value.model_code) {
        if (!/^[0-9]{3}$/.test(formData.value.model_code)) {
          errors.value.model_code = 'รหัสรุ่นต้องเป็นตัวเลข 3 หลัก'
        }
      }

      // Validate color code
      if (formData.value.enable_lot_tracking && formData.value.color_code) {
        if (!/^[0-9]{3}$/.test(formData.value.color_code)) {
          errors.value.color_code = 'รหัสสีต้องเป็นตัวเลข 3 หลัก'
        }
      }

      // Validate fabric width
      if (formData.value.fabric_width_cm) {
        if (formData.value.fabric_width_cm < 50 || formData.value.fabric_width_cm > 500) {
          errors.value.fabric_width_cm = 'ความกว้างต้องอยู่ระหว่าง 50-500 cm'
        }
      }

      // Validate weight per meter for lot tracking
      if (formData.value.enable_lot_tracking && !formData.value.weight_per_meter) {
        errors.value.weight_per_meter = 'ต้องระบุน้ำหนักต่อเมตรสำหรับการติดตาม Lot'
      } else if (formData.value.weight_per_meter && formData.value.weight_per_meter <= 0) {
        errors.value.weight_per_meter = 'น้ำหนักต่อเมตรต้องมากกว่า 0'
      }
    }
    
    // Methods
    const loadSuppliers = async () => {
      try {
        console.log('🔄 Loading suppliers from PurchaseService...')
        
        // ✅ ใช้ PurchaseService แทน engine.list('supplier')
        if (window.ERP_CORE?.purchase) {
          const suppliersData = await window.ERP_CORE.purchase.getAllSuppliers()
          
          if (suppliersData && Array.isArray(suppliersData)) {
            suppliers.value = suppliersData
            console.log('✅ Loaded suppliers from PurchaseService:', suppliers.value.length)
          } else {
            suppliers.value = []
            console.log('⚠️ No suppliers data received')
          }
        } else {
          console.error('❌ PurchaseService not available')
          suppliers.value = []
        }
        
      } catch (error) {
        console.error('❌ Error loading suppliers:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูลผู้จำหน่ายได้: ' + error.message)
        }
        suppliers.value = []
      }
    }
    
    const generateProductCode = async () => {
      // ✅ ป้องกันการ generate code ถ้ามี _id (แปลว่าเป็น edit mode)
      if (props.product?._id) {
        console.log('⚠️ Cannot generate code - product has _id (edit mode)')
        if (window.$toast) {
          window.$toast.warning('ไม่สามารถสร้างรหัสใหม่ได้ในโหมดแก้ไข')
        }
        return
      }
      
      console.log('🔧 Generating Product Code')
      
      try {
        generating.value = true
        
        // ✨ NEW: Generate product code based on product type
        if (isTextileProduct.value && hasValidLotComponents.value) {
          // Generate textile product code: PRD-402-177-152
          const model = formData.value.model_code.padStart(3, '0')
          const color = formData.value.color_code.padStart(3, '0') 
          const width = String(formData.value.fabric_width_cm).padStart(3, '0')
          
          const newProductCode = `PRD-${model}-${color}-${width}`
          formData.value.product_code = newProductCode
          
          console.log('✅ Generated textile product code:', newProductCode)
          
          if (window.$toast) {
            window.$toast.success(`สร้างรหัสสินค้าผ้า: ${newProductCode}`)
          }
          
          return
        }
        
        // Traditional code generation for non-textile products
        if (window.ERP_CORE?.codeManager) {
          // 🔄 Force initialize and load from database
          console.log('🔄 Forcing database pattern reload...')
          
          const accountingSettings = window.ERP_CORE.accounting
          if (accountingSettings) {
            // Initialize if needed
            if (!accountingSettings.initialized) {
              if (window.vueApp?.$Request) {
                accountingSettings.initialize(window.vueApp)
              }
            }
            
            // Force reload settings from database
            if (accountingSettings.initialized) {
              await accountingSettings.loadSettings()
              console.log('✅ Settings loaded from database')
            }
          }
          
          // 🔄 Invalidate cache ก่อนโหลด pattern ใหม่
          console.log('🔄 Invalidating pattern cache for product...')
          if (window.ERP_CORE.codeManager.clearModuleCache) {
            window.ERP_CORE.codeManager.clearModuleCache('product')
          }
          
          // 🔄 Force reload pattern from database with detailed logging
          console.log('🔄 Reloading pattern from database...')
          const patternInfo = await window.ERP_CORE.codeManager.getPatternForModule('product')
          console.log('📋 Pattern loaded:', {
            source: patternInfo?.source,
            prefix: patternInfo?.pattern?.prefix,
            format: patternInfo?.pattern?.format,
            sequenceCurrent: patternInfo?.pattern?.sequence?.current,
            sequenceNext: patternInfo?.pattern?.sequence?.next,
            hasDatabase: patternInfo?.source === 'corporate_config'
          })
          
          // ⚠️ Validate pattern source
          if (patternInfo?.source !== 'corporate_config') {
            console.warn('⚠️ Pattern not from database! Source:', patternInfo?.source)
            console.warn('⚠️ Will use fallback pattern, but sequence may not increment correctly')
          }
          
          // ✅ Generate code with fresh pattern
          const newProductCode = await window.ERP_CORE.codeManager.generateCode('product', null, {
            type: 'product',
            category: formData.value.category,
            supplier: formData.value.supplier
          })
          
          if (newProductCode) {
            formData.value.product_code = newProductCode
            console.log('✅ Generated Product Code:', newProductCode)
          } else {
            const fallbackCode = `PRD${String(Date.now()).slice(-6)}`
            formData.value.product_code = fallbackCode
            console.log('🔄 Used fallback code:', fallbackCode)
          }
        } else {
          const simpleCode = `PRD${String(Date.now()).slice(-6)}`
          formData.value.product_code = simpleCode
          console.log('🔄 Used simple code:', simpleCode)
        }
        
      } catch (error) {
        console.error('❌ Error generating Product Code:', error)
        const emergencyCode = `PRD${String(Date.now()).slice(-6)}`
        formData.value.product_code = emergencyCode
        console.log('🚨 Used emergency code:', emergencyCode)
      } finally {
        generating.value = false
      }
    }
    
    const onSupplierInput = (event) => {
      const value = event.target.value
      supplierSearchQuery.value = value
      showSupplierDropdown.value = true
    }
    
    const selectSupplier = (supplier, customName = null) => {
      if (customName) {
        // Manual entry
        formData.value.supplier = customName
        formData.value.supplier_id = null
      } else if (supplier) {
        // Selected from list
        formData.value.supplier = supplier.name || supplier.supplier_code
        formData.value.supplier_id = supplier.id
      }
      
      hideSupplierDropdown()
    }
    
    const hideSupplierDropdown = () => {
      setTimeout(() => {
        showSupplierDropdown.value = false
        if (formData.value.supplier) {
          supplierSearchQuery.value = formData.value.supplier
        }
      }, 150)
    }
    
    const clearSupplier = () => {
      formData.value.supplier = ''
      formData.value.supplier_id = null
      supplierSearchQuery.value = ''
      showSupplierDropdown.value = false
    }
    
    const formatSupplierStatus = (status) => {
      const statusLabels = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน', 
        'pending': 'รอการอนุมัติ',
        'suspended': 'ระงับการใช้งาน'
      }
      return statusLabels[status] || status
    }

    // Balance Management Functions
    const loadCurrentBalance = async (productId) => {
      if (!productId) return
      
      try {
        console.log('🔍 [ProductForm] Loading balance for product:', productId)
        refreshing.value = true
        
        if (window.ERP_CORE?.balance) {
          const balance = await window.ERP_CORE.balance.findProductBalance(productId)
          
          if (balance) {
            currentBalance.value = balance
            console.log('✅ [ProductForm] Balance loaded:', balance)
          } else {
            console.log('ℹ️ [ProductForm] No balance found for product')
            currentBalance.value = null
          }
        } else {
          console.warn('⚠️ [ProductForm] ERP_CORE.balance not available')
          currentBalance.value = null
        }
        
      } catch (error) {
        console.error('❌ [ProductForm] Error loading balance:', error)
        currentBalance.value = null
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูล Balance ได้')
        }
      } finally {
        refreshing.value = false
      }
    }
    
    const recalculateBalance = async () => {
      if (!props.product?.id) return
      
      try {
        console.log('🔄 [ProductForm] Recalculating balance for product:', props.product.id)
        recalculating.value = true
        
        if (window.ERP_CORE?.engine) {
          // ใช้ executeModuleFunction เพื่อเรียก recalculateFromMovements
          const result = await window.ERP_CORE.executeModuleFunction(
            'inventory_balance', 
            'recalculateFromMovements', 
            props.product.id
          )
          
          if (result?.success) {
            console.log('✅ [ProductForm] Balance recalculated successfully')
            
            // โหลด balance ใหม่
            await loadCurrentBalance(props.product.id)
            
            if (window.$toast) {
              window.$toast.success('คำนวณ Balance ใหม่เรียบร้อยแล้ว')
            }
          } else {
            console.error('❌ [ProductForm] Balance recalculation failed:', result?.error)
            
            if (window.$toast) {
              window.$toast.error(result?.error || 'ไม่สามารถคำนวณ Balance ใหม่ได้')
            }
          }
        } else {
          console.warn('⚠️ [ProductForm] ERP_CORE not available')
          
          if (window.$toast) {
            window.$toast.warning('ระบบไม่พร้อมใช้งาน')
          }
        }
        
      } catch (error) {
        console.error('❌ [ProductForm] Error recalculating balance:', error)
        
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการคำนวณ Balance')
        }
      } finally {
        recalculating.value = false
      }
    }
    
    const refreshBalance = async () => {
      if (!props.product?.id) return
      await loadCurrentBalance(props.product.id)
    }
    
    // Formatting Functions
    const formatNumber = (value) => {
      if (value == null || isNaN(value)) return '0'
      return Number(value).toLocaleString('th-TH')
    }
    
    const formatCurrency = (value) => {
      if (value == null || isNaN(value)) return '0.00'
      return Number(value).toLocaleString('th-TH', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        return new Date(dateString).toLocaleString('th-TH', {
          year: '2-digit',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    }
    
    // Product Image Functions
    const fetchProductImage = async () => {
      const searchRef = productImageSearchRef.value
      
      if (!searchRef) {
        console.warn('⚠️ No search reference for product image')
        return
      }
      
      try {
        console.log('🔍 Fetching product image for:', searchRef)
        loadingProductImage.value = true
        productImageError.value = null
        productImageResults.value = []
        
        // ใช้ Cloudflare Workers Scraper API (POST method)
        const scraperUrl = 'https://recasens-scraper.manonsanoi.workers.dev/'
        
        console.log('📡 Calling Recasens Scraper (POST):', searchRef)
        
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ ref: searchRef })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📄 Scraper response:', data)
        
        if (data.success && data.products && data.products.length > 0) {
          console.log('✅ Found', data.count, 'product images')
          
          // เก็บผลลัพธ์ทั้งหมด
          productImageResults.value = data.products
          
          // ถ้ามีแค่รูปเดียว ใช้เลย
          if (data.products.length === 1) {
            selectProductImage(data.products[0])
          } else {
            // ถ้ามีหลายรูป แสดง modal ให้เลือก
            showImageSelectionModal.value = true
          }
          
          if (window.$toast) {
            window.$toast.success(`พบรูปภาพ ${data.count} รายการ`)
          }
        } else {
          console.log('ℹ️ No image found for:', searchRef)
          
          if (window.$toast) {
            window.$toast.info('ไม่พบรูปภาพสินค้า')
          }
        }
        
      } catch (error) {
        console.error('❌ Error fetching product image:', error)
        productImageError.value = error.message
        
        if (window.$toast) {
          window.$toast.error(`ไม่สามารถดึงรูปภาพได้: ${error.message}`)
        }
      } finally {
        loadingProductImage.value = false
      }
    }
    
    const selectProductImage = (product) => {
      if (!product || !product.imageUrl) return
      
      // Update form data
      formData.value.product_image_url = product.imageUrl
      formData.value.product_image_source = `Recasens - ${product.category} (${product.productName})`
      
      // Optional: Update product name if not set
      if (product.productName && !formData.value.product_name) {
        formData.value.product_name = product.productName
      }
      
      // ปิด modal
      showImageSelectionModal.value = false
      
      console.log('✅ Selected product image:', product)
      
      if (window.$toast) {
        window.$toast.success(`เลือกรูปภาพ: ${product.category}`)
      }
    }
    
    const clearProductImage = () => {
      formData.value.product_image_url = ''
      formData.value.product_image_source = ''
      productImageResults.value = []
      console.log('🗑️ Cleared product image')
    }
    
    const closeImageSelectionModal = () => {
      showImageSelectionModal.value = false
    }
    
    const refetchProductImage = async () => {
      // ล้างรูปภาพเดิม
      formData.value.product_image_url = ''
      formData.value.product_image_source = ''
      productImageResults.value = []
      
      // ดึงใหม่
      await fetchProductImage()
    }
    
    // Search product image with custom query
    const searchProductImageCustom = async () => {
      // Use custom search if provided, otherwise use auto-generated search ref
      const searchQuery = customImageSearch.value?.trim() || productImageSearchRef.value
      
      if (!searchQuery) {
        console.warn('⚠️ No search query for product image')
        if (window.$toast) {
          window.$toast.warning('กรุณากรอกคำค้นหา')
        }
        return
      }
      
      try {
        console.log('🔍 Searching product image with custom query:', searchQuery)
        loadingProductImage.value = true
        productImageError.value = null
        productImageResults.value = []
        
        // ใช้ Cloudflare Workers Scraper API (POST method)
        const scraperUrl = 'https://recasens-scraper.manonsanoi.workers.dev/'
        
        console.log('📡 Calling Recasens Scraper (POST):', searchQuery)
        
        const response = await fetch(scraperUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ ref: searchQuery })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📄 Scraper response:', data)
        
        if (data.success && data.products && data.products.length > 0) {
          console.log('✅ Found', data.count, 'product images')
          
          // เก็บผลลัพธ์ทั้งหมด
          productImageResults.value = data.products
          
          // ถ้ามีแค่รูปเดียว ใช้เลย
          if (data.products.length === 1) {
            const product = data.products[0]
            formData.value.product_image_url = product.imageUrl
            formData.value.product_image_source = product.name || searchQuery
            console.log('🖼️ Single image found, auto-selected:', product.imageUrl)
            
            if (window.$toast) {
              window.$toast.success(`พบรูปภาพสินค้า: ${product.name || searchQuery}`)
            }
          } else {
            // มีหลายรูป - เปิด modal ให้เลือก
            console.log('🖼️ Multiple images found, showing selection modal')
            showImageSelectionModal.value = true
          }
        } else {
          console.log('⚠️ No images found for:', searchQuery)
          productImageError.value = 'ไม่พบรูปภาพสินค้า'
          
          if (window.$toast) {
            window.$toast.info(`ไม่พบรูปภาพสำหรับ "${searchQuery}"`)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching product image:', error)
        productImageError.value = error.message
        
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการค้นหารูปภาพ')
        }
      } finally {
        loadingProductImage.value = false
      }
    }
    
    const handleImageError = (event) => {
      console.error('❌ Image failed to load:', formData.value.product_image_url)
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
    }

    // Auto-fill Textile Fields from SKU
    const autoFillTextileFromSKU = () => {
      const sku = formData.value.sku?.trim()
      
      if (!sku || sku.length !== 9) {
        if (window.$toast) {
          window.$toast.warning('SKU ต้องมี 9 หลักเท่านั้น (Model 3 + Color 3 + Width 3)')
        }
        return
      }
      
      // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
      if (!/^[0-9]{9}$/.test(sku)) {
        if (window.$toast) {
          window.$toast.warning('SKU ต้องเป็นตัวเลข 9 หลักเท่านั้น')
        }
        return
      }
      
      // แยก SKU
      const modelCode = sku.substring(0, 3)      // 3 หลักแรก
      const colorCode = sku.substring(3, 6)      // 3 หลักกลาง
      const widthCode = sku.substring(6, 9)      // 3 หลักสุดท้าย
      
      console.log('🎨 Auto-filling textile fields from SKU:', {
        sku,
        modelCode,
        colorCode,
        widthCode
      })
      
      // Fill ข้อมูล
      formData.value.model_code = modelCode
      formData.value.color_code = colorCode
      formData.value.color_code_digit = colorCode      // ใช้ค่าเดียวกับ color_code
      formData.value.fabric_width_cm = parseInt(widthCode, 10)
      
      // Auto-fill ค่าเริ่มต้น
      formData.value.weight_per_meter = 1              // 1 kg/m
      formData.value.fabric_type = 'polyester'         // ผ้าโพลีเอสเตอร์
      formData.value.enable_lot_tracking = true        // เปิดใช้การติดตาม Lot
      
      if (window.$toast) {
        window.$toast.success(`แยกข้อมูลสำเร็จ: Model ${modelCode}, Color ${colorCode}, Width ${widthCode} cm`)
      }
      
      console.log('✅ Textile fields filled:', {
        model_code: formData.value.model_code,
        color_code: formData.value.color_code,
        color_code_digit: formData.value.color_code_digit,
        fabric_width_cm: formData.value.fabric_width_cm,
        weight_per_meter: formData.value.weight_per_meter,
        fabric_type: formData.value.fabric_type
      })
    }

    
    const createSupplierIfNotExists = async (supplierName) => {
      if (!supplierName || supplierName.trim() === '') return null
      
      const cleanName = supplierName.trim()
      
      const existingSupplier = availableSuppliers.value.find(supplier => 
        supplier.name === cleanName || supplier.supplier_code === cleanName
      )
      
      if (existingSupplier) {
        console.log('✅ Supplier already exists:', existingSupplier.name, 'ID:', existingSupplier.id)
        return existingSupplier
      }
      
      if (window.ERP_CORE?.codeManager && window.ERP_CORE?.engine) {
        try {
          console.log('🏗️ Creating new supplier:', cleanName)
          
          const supplierCode = await window.ERP_CORE.codeManager.generateCode('supplier', null, {})
          
          const newSupplierData = {
            supplier_code: supplierCode,
            name: cleanName,
            type: 'domestic',
            status: 'active',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            province: '',
            postal_code: '',
            country: 'ไทย',
            payment_terms: 'net_30',
            currency: 'THB',
            credit_limit: 0,
            credit_days: 30,
            discount_percentage: 0,
            lead_time_days: 7,
            rating: 'unrated',
            is_active: true,
            requires_po: false,
            notes: `สร้างอัตโนมัติจากการเพิ่มสินค้า เมื่อ ${new Date().toLocaleString('th-TH')}`,
            created_at: new Date(),
            updated_at: new Date()
          }
          
          const result = await window.ERP_CORE.purchase.createSupplier(newSupplierData)
          
          if (result.success) {
            console.log('✅ New supplier created:', result.data)
            suppliers.value.push(result.data)
            
            if (window.$toast) {
              window.$toast.success(`สร้างผู้จำหน่ายใหม่: ${cleanName} (${supplierCode})`)
            }
            
            return result.data
          } else {
            console.error('❌ Failed to create supplier:', result.message)
            return null
          }
          
        } catch (error) {
          console.error('❌ Error creating supplier:', error)
          return null
        }
      } else {
        console.warn('⚠️ ERP_CORE not available for supplier creation')
        return null
      }
    }
    
    const validateForm = () => {
      const newErrors = {}
      
      console.log('[ProductForm] Validating form with data:', {
        sku: formData.value.sku,
        product_name: formData.value.product_name,
        category: formData.value.category,
        unit: formData.value.unit
      })
      
      if (!formData.value.sku || !formData.value.sku.trim()) {
        newErrors.sku = 'กรุณาระบุรหัส SKU'
        console.log('[ProductForm] SKU validation failed: empty')
      } else if (!/^[A-Z0-9-_.]+$/.test(formData.value.sku.trim().toUpperCase())) {
        newErrors.sku = 'SKU ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ - _ . เท่านั้น'
        console.log('[ProductForm] SKU validation failed: invalid format')
      }
      
      if (!formData.value.product_name || !formData.value.product_name.trim()) {
        newErrors.product_name = 'กรุณาระบุชื่อสินค้า'
        console.log('[ProductForm] Product name validation failed: empty')
      }
      
      if (Number(formData.value.unit_price) < 0) {
        newErrors.unit_price = 'ราคาต้องไม่ติดลบ'
        console.log('[ProductForm] Unit price validation failed: negative')
      }
      
      if (Number(formData.value.min_stock) < 0) {
        newErrors.min_stock = 'สต็อกขั้นต่ำต้องไม่ติดลบ'
        console.log('[ProductForm] Min stock validation failed: negative')
      }
      
      // Validate initial stock fields (for new products)
      if (props.mode === 'add') {
        const initialQty = Number(formData.value.initial_quantity) || 0
        const initialCost = Number(formData.value.initial_cost) || 0
        
        if (initialQty < 0) {
          newErrors.initial_quantity = 'จำนวนเริ่มต้นต้องไม่ติดลบ'
          console.log('[ProductForm] Initial quantity validation failed: negative')
        }
        
        if (initialCost < 0) {
          newErrors.initial_cost = 'ต้นทุนต่อหน่วยต้องไม่ติดลบ'
          console.log('[ProductForm] Initial cost validation failed: negative')
        }
        
        // Location is optional - if not specified and quantity > 0, use default
        // No validation error for missing location
      }
      
      errors.value = newErrors
      const isValid = Object.keys(newErrors).length === 0
      
      console.log('[ProductForm] Validation result:', {
        isValid,
        errorCount: Object.keys(newErrors).length,
        errors: newErrors
      })
      
      return isValid
    }
    
    const saveProduct = async () => {
      console.log('[DEBUG] saveProduct function called')
      console.log('[DEBUG] Mode:', props.mode)
      console.log('[DEBUG] Product ID:', props.product?.id)
      console.log('[DEBUG] Product Object:', props.product)
      console.log('[DEBUG] Form data:', formData.value)
      console.log('[ProductForm] saveProduct called, mode:', props.mode)
      console.log('🚀 [ProductForm] Current formData:', JSON.stringify(formData.value, null, 2))
      console.log('🚀 [ProductForm] Product prop:', props.product)
      
      // ✅ ง่ายๆ: ถ้ามี _id ก็ update ถ้าไม่มีก็ create
      const shouldUpdate = !!(props.product && props.product._id)
      
      console.log('[DEBUG] Simple Update/Create decision:', {
        mode: props.mode,
        hasProductId: !!props.product?._id,
        productId: props.product?._id,
        shouldUpdate
      })
      
      console.log('[DEBUG] Running form validation...')
      const validationResult = validateForm()
      console.log('[DEBUG] Validation result:', validationResult)
      console.log('[DEBUG] Current errors object:', errors.value)
      
      if (!validationResult) {
        console.log('❌ Form validation failed, errors:', errors.value)
        
        // แสดง error ให้ user เห็น
        if (window.$toast) {
          const errorMessages = Object.values(errors.value).join(', ')
          window.$toast.error('กรุณาแก้ไขข้อมูลต่อไปนี้: ' + errorMessages)
        }
        return
      }
      
      console.log('[DEBUG] Form validation passed')
      // ✅ ไม่ต้องตั้ง saving.value = true เพื่อป้องกัน DOM insertBefore error
      
      try {
        const productSKU = formData.value.sku.trim().toUpperCase()
        console.log(`[DEBUG] Saving product: ${productSKU}, mode: ${props.mode}`)
        
        // ตรวจสอบ engine
        if (!engine) {
          throw new Error('TransactionEngine ไม่พร้อมใช้งาน')
        }
        
        // Handle supplier
        let finalSupplierId = formData.value.supplier_id
        let finalSupplierName = formData.value.supplier.trim() || 'Manual Entry'
        
        if (!finalSupplierId && finalSupplierName && finalSupplierName !== 'Manual Entry') {
          console.log('[DEBUG] Creating supplier for manual entry:', finalSupplierName)
          
          const createdSupplier = await createSupplierIfNotExists(finalSupplierName)
          if (createdSupplier) {
            finalSupplierId = createdSupplier.id
            finalSupplierName = createdSupplier.name
            console.log('[DEBUG] Using supplier:', finalSupplierName, 'ID:', finalSupplierId)
          }
        }
        
        // ✅ เตรียม product data แบบง่ายๆ
        const productData = {
          product_code: shouldUpdate && props.product?.product_code 
            ? props.product.product_code  // ใช้ product_code เดิมในโหมดแก้ไข
            : (formData.value.product_code || productSKU),  // สร้างใหม่ในโหมดเพิ่ม
          sku: productSKU,
          product_name: formData.value.product_name.trim(),
          description: formData.value.description.trim() || formData.value.product_name.trim(),
          unit: formData.value.unit,
          unit_price: Number(formData.value.unit_price),
          retail_price: Number(formData.value.retail_price || 0),
          wholesale_price: Number(formData.value.wholesale_price || 0),
          min_stock: Number(formData.value.min_stock),
          category: formData.value.category,
          supplier_id: finalSupplierId,
          supplier: finalSupplierName,
          status: formData.value.status,
          updated_at: new Date().toISOString()
        }

        // ✅ เพิ่มข้อมูลสิ่งทอ (Textile Information) 
        if (isTextileProduct.value || formData.value.is_textile) {
          // เพิ่มฟิลด์สำหรับสิ่งทอ
          productData.is_textile = true
          productData.model_code = formData.value.model_code?.trim() || ''
          productData.color_code = formData.value.color_code?.trim() || ''
          productData.color_code_digit = formData.value.color_code_digit?.trim() || ''
          productData.fabric_width_cm = formData.value.fabric_width_cm ? Number(formData.value.fabric_width_cm) : null
          productData.fabric_type = formData.value.fabric_type?.trim() || ''
          productData.fabric_composition = formData.value.fabric_composition?.trim() || ''
          productData.gsm = formData.value.gsm ? Number(formData.value.gsm) : null
          productData.thread_count = formData.value.thread_count?.trim() || ''
          productData.weight_per_meter = formData.value.weight_per_meter ? Number(formData.value.weight_per_meter) : null
          productData.enable_lot_tracking = Boolean(formData.value.enable_lot_tracking)
          productData.product_image_url = formData.value.product_image_url?.trim() || ''
          productData.product_image_source = formData.value.product_image_source?.trim() || ''
          
          console.log('✅ Added textile fields to product data:', {
            is_textile: productData.is_textile,
            model_code: productData.model_code,
            color_code: productData.color_code,
            color_code_digit: productData.color_code_digit,
            fabric_width_cm: productData.fabric_width_cm,
            enable_lot_tracking: productData.enable_lot_tracking,
            product_image_url: productData.product_image_url
          })
        } else {
          // ไม่ใช่สิ่งทอ - set เป็น false
          productData.is_textile = false
          productData.enable_lot_tracking = false
        }

        // ✅ สำคัญ! ห้ามใส่ _id ใน update data (MongoDB immutable field)
        // ID จะถูกใช้เป็น parameter ใน updateProduct(_id, data) แทน
        
        // Values are now hardcoded to match TransactionEngine validation
        console.log('[ProductForm] Using validated enum values - unit:', productData.unit, 'category:', productData.category)
        
        if (!shouldUpdate) {
          productData.created_at = new Date().toISOString()
        }
        
        console.log('[ProductForm] Final product data:', JSON.stringify(productData, null, 2))
        console.log('[ProductForm] Product data prepared with unit:', productData.unit, 'category:', productData.category)
        
        let result
        if (shouldUpdate) {
          console.log(`🔄 [ProductForm] EDIT MODE - Updating product _id: ${props.product._id}`)
          console.log(`🔄 [ProductForm] Product data being updated:`, {
            _id: productData._id,
            product_code: productData.product_code,
            sku: productData.sku,
            product_name: productData.product_name
          })
          
          // ✅ ใช้ _id เพื่อ update
          try {
            console.log('🔄 [ProductForm] Sending update data (should NOT contain _id):', {
              productId: props.product._id,
              hasIdInData: '_id' in productData,
              dataKeys: Object.keys(productData),
              productData: JSON.stringify(productData, null, 2)
            })
            
            const updatedProduct = await window.ERP_CORE.inventory.updateProduct(props.product._id, productData)
            result = {
              success: !!updatedProduct,
              data: updatedProduct,
              error: updatedProduct ? null : 'Update failed'
            }
            console.log('📤 [ProductForm] Update result:', result)
          } catch (updateError) {
            console.error('❌ [ProductForm] Update error:', updateError)
            result = {
              success: false,
              data: null,
              error: updateError.message || 'Update failed with exception'
            }
          }
        } else {
          console.log('➕ [ProductForm] CREATE MODE - Creating new product')
          console.log('➕ [ProductForm] Reason for create mode:', {
            mode: props.mode,
            hasProductId: !!props.product?._id,
            shouldUpdate,
            productId: props.product?._id
          })
          
          // ✅ ใช้ InventoryService แทน engine
          try {
            const newProduct = await window.ERP_CORE.inventory.createProduct(productData)
            result = {
              success: !!newProduct,
              data: newProduct,
              error: newProduct ? null : 'Create failed'
            }
            console.log('📤 [ProductForm] Create result:', result)
          } catch (createError) {
            console.error('❌ [ProductForm] Create error:', createError)
            result = {
              success: false,
              data: null,
              error: createError.message || 'Create failed with exception'
            }
          }
        }
        
        if (result && result.success) {
          console.log('✅ [ProductForm] Product saved successfully:', result.data)
          
          // ✅ Handle Balance Management
          try {
            // 1. สร้าง/อัปเดต Balance สำหรับ Product นี้
            await window.ERP_CORE.balance.ensureProductBalance(result.data, {
              updatedBy: 'product_form'
            })
            console.log('🔗 [ProductForm] Balance linking completed for product:', result.data.sku)
            
            // 2. Handle initial stock for new products
            if (!shouldUpdate && formData.value.initial_quantity > 0) {
              console.log('📦 [ProductForm] Creating initial stock movement...')
              
              // Use default location if none selected
              const locationCode = formData.value.initial_location || 'WH01-A-001'
              
              // สร้าง Stock Movement ผ่าน InventoryService
              const stockMovementData = {
                subtype: 'initial_stock',
                product_id: result.data.id,
                sku: result.data.sku,
                product_name: result.data.product_name,
                movement_type: 'IN',
                transaction_type: 'initial_stock',
                quantity: Number(formData.value.initial_quantity),
                unit: formData.value.unit,
                unit_price: Number(formData.value.initial_cost) || Number(formData.value.unit_price) || 0,
                location_code: locationCode,
                movement_date: new Date(),
                reference_type: 'initial_stock',
                reference_id: result.data.id,
                notes: `สต็อกเริ่มต้นจากการสร้างสินค้า - ${formData.value.initial_quantity} ${formData.value.unit}`,
                status: 'completed'
              }
              
              const movementResult = await window.ERP_CORE.inventory.createStockMovement(stockMovementData)
              
              if (movementResult.success) {
                console.log('✅ [ProductForm] Initial stock movement created:', movementResult.data)
                
                // อัปเดต Balance จาก Movement ที่เพิ่งสร้าง
                await window.ERP_CORE.balance.updateBalanceFromMovement(
                  stockMovementData,
                  { updatedBy: 'product_form' }
                )
                
                if (window.$toast) {
                  window.$toast.success(`สร้างสต็อกเริ่มต้น ${formData.value.initial_quantity} ${formData.value.unit} ที่ ${locationCode}`)
                }
              } else {
                console.warn('⚠️ [ProductForm] Initial stock movement creation failed:', movementResult.error)
                if (window.$toast) {
                  window.$toast.warning('สินค้าถูกสร้างแล้ว แต่ไม่สามารถสร้างสต็อกเริ่มต้นได้')
                }
              }
            }
            
          } catch (balanceError) {
            console.warn('⚠️ [ProductForm] Balance/Movement creation failed but product saved:', balanceError.message)
            // แสดงคำเตือนแต่ไม่หยุดกระบวนการ
            if (window.$toast) {
              window.$toast.warning('สินค้าถูกบันทึกแล้ว แต่ไม่สามารถจัดการ Balance ได้')
            }
          }
          
          // ✅ Update sequence ใน database หลังบันทึกสำเร็จ (สำหรับ product ใหม่เท่านั้น)
          if (!shouldUpdate && window.ERP_CORE?.codeManager) {
            try {
              console.log('🔄 [ProductForm] Updating sequence after successful save:', productData.product_code)
              
              // ดึง pattern ที่ใช้จริง
              const usedPattern = await window.ERP_CORE.codeManager.getPatternForModule('product')
              
              // ⚠️ Extract ONLY the PURE sequence number (last digits after removing prefix and year)
              let usedSequence = 1
              
              const format = usedPattern?.format || 'FB{year}{sequence}'
              console.log(`📐 [ProductForm] Format: ${format}`)
              
              if (format.includes('{year}')) {
                // Format: {prefix}{year}{sequence}
                // Example: FB2025000001
                // Step 1: Remove prefix
                const prefix = usedPattern?.prefix || 'FB'
                let remaining = productData.product_code.replace(prefix, '')
                console.log(`  Step 1 - Remove prefix "${prefix}": "${productData.product_code}" → "${remaining}"`)
                
                // Step 2: Remove year (first 4 digits)
                const currentYear = new Date().getFullYear().toString()
                if (remaining.startsWith(currentYear)) {
                  remaining = remaining.substring(currentYear.length)
                  console.log(`  Step 2 - Remove year "${currentYear}": → "${remaining}"`)
                }
                
                // Step 3: Parse remaining as pure sequence
                usedSequence = parseInt(remaining) || 1
                console.log(`  Step 3 - Parse sequence: "${remaining}" → ${usedSequence}`)
                
              } else {
                // ถ้าไม่มี {year} ใช้วิธีเดิม (extract ตัวเลขท้ายสุด)
                const sequenceMatch = productData.product_code.match(/\d+$/)
                usedSequence = sequenceMatch ? parseInt(sequenceMatch[0]) : 1
              }
              
              console.log(`✅ [ProductForm] Extracted PURE sequence: ${usedSequence} from code: ${productData.product_code}`)
              
              // สร้าง patternInfo object ตามที่ CodeManager ต้องการ
              const patternInfo = {
                source: 'corporate_config',
                pattern: {
                  prefix: usedPattern?.prefix || 'FB',
                  format: usedPattern?.format || 'FB{year}{sequence}',
                  sequence: {
                    current: usedSequence, // เฉพาะ sequence number ไม่รวมปี (e.g., 1, 2, 3...)
                    digits: usedPattern?.sequence?.digits || 6,
                    start: usedPattern?.sequence?.start || 1,
                    resetOnYearChange: usedPattern?.sequence?.resetOnYearChange || false
                  }
                }
              }
              
              console.log('📝 [ProductForm] Pattern info for sequence update:', patternInfo)
              
              // เรียก updateSequenceInDatabase
              const sequenceResult = await window.ERP_CORE.codeManager.updateSequenceInDatabase('product', patternInfo)
              
              if (sequenceResult?.success) {
                console.log(`✅ [ProductForm] Sequence updated in database: current=${usedSequence}, next=${sequenceResult.next}`)
              } else {
                console.warn('⚠️ [ProductForm] Sequence update returned non-success:', sequenceResult)
              }
            } catch (sequenceError) {
              console.warn('⚠️ [ProductForm] Failed to update sequence:', sequenceError.message)
              // ไม่หยุดกระบวนการแม้ sequence update จะล้มเหลว
            }
          }
          
          if (window.$toast) {
            window.$toast.success(props.product?._id ? 'แก้ไขสินค้าเรียบร้อยแล้ว' : 'เพิ่มสินค้าเรียบร้อยแล้ว')
          }
          
          emit('save', result.data)
        } else {
          console.error('❌ [ProductForm] Save failed:', result)
          throw new Error(result?.error || 'ไม่สามารถบันทึกข้อมูลได้')
        }
        
      } catch (error) {
        console.error('❌ [ProductForm] Error saving product:', error)
        console.error('❌ [ProductForm] Error stack:', error.stack)
        
        const errorMessage = `เกิดข้อผิดพลาดในการบันทึกสินค้า: ${error.message}`
        
        if (window.$toast) {
          window.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      } finally {
        console.log('🏁 [ProductForm] Save process completed, setting saving to false')
        saving.value = false
      }
    }
    
    const resetForm = () => {
      formData.value = {
        product_code: '',
        sku: '',
        product_name: '',
        description: '',
        unit: 'piece',
        unit_price: 0,
        retail_price: 0,
        wholesale_price: 0,
        min_stock: 5,
        category: 'general',  // เปลี่ยนจาก 'electronics' เป็น 'general'
        supplier: '',
        supplier_id: null,
        status: 'active',
        // Textile specific fields
        is_textile: false,
        model_code: '',
        color_code: '',
        color_code_digit: '',
        fabric_width_cm: null,
        fabric_type: '',
        fabric_composition: '',
        gsm: null,
        thread_count: '',
        weight_per_meter: null,
        enable_lot_tracking: false,
        fabric_pattern: '',
        care_instructions: ''
      }
      errors.value = {}
      
      supplierSearchQuery.value = ''
      showSupplierDropdown.value = false
      
      // ✅ ถ้าไม่มี _id (ไม่ใช่ edit mode) ถึงจะ generate code
      if (!props.product?._id) {
        generateProductCode()
      }
    }
    
    const initializeForm = async () => {
      if (props.product && props.product._id) {
        // ✅ ง่ายๆ: ถ้ามี _id แปลว่าเป็น edit mode
        formData.value = {
          product_code: props.product.product_code || props.product.sku || '',
          sku: props.product.sku || '',
          product_name: props.product.product_name || props.product.name || '',
          description: props.product.description || '',
          unit: props.product.unit || 'piece',
          unit_price: props.product.unit_price || 0,
          retail_price: props.product.retail_price || 0,
          wholesale_price: props.product.wholesale_price || 0,
          min_stock: props.product.min_stock || 5,
          category: props.product.category || 'general',
          supplier: props.product.supplier || '',
          supplier_id: props.product.supplier_id || null,
          status: props.product.status || 'active',
          // Textile specific fields
          is_textile: props.product.is_textile || false,
          model_code: props.product.model_code || '',
          color_code: props.product.color_code || '',
          color_code_digit: props.product.color_code_digit || '',
          fabric_width_cm: props.product.fabric_width_cm || null,
          fabric_type: props.product.fabric_type || '',
          fabric_composition: props.product.fabric_composition || '',
          gsm: props.product.gsm || null,
          thread_count: props.product.thread_count || '',
          weight_per_meter: props.product.weight_per_meter || null,
          enable_lot_tracking: props.product.enable_lot_tracking || false,
          fabric_pattern: props.product.fabric_pattern || '',
          care_instructions: props.product.care_instructions || '',
          product_image_url: props.product.product_image_url || '',
          product_image_source: props.product.product_image_source || ''
        }
        
        if (formData.value.supplier) {
          supplierSearchQuery.value = formData.value.supplier
        }
        
        // โหลด Balance สำหรับโหมดแก้ไข
        if (props.product._id || props.product.sku) {
          await loadCurrentBalance(props.product._id || props.product.sku)
        }
      } else {
        resetForm()
      }
    }
    
    // Watchers
    watch(() => props.product, async () => {
      await initializeForm()
    }, { immediate: true })
    
    // Watch form fields for real-time validation
    watch([
      () => formData.value.sku,
      () => formData.value.product_name,
      () => formData.value.unit_price,
      () => formData.value.min_stock
    ], () => {
      // Clear errors for fields that are now valid
      const newErrors = { ...errors.value }
      
      if (formData.value.sku && formData.value.sku.trim()) {
        delete newErrors.sku
      }
      
      if (formData.value.product_name && formData.value.product_name.trim()) {
        delete newErrors.product_name
      }
      
      if (Number(formData.value.unit_price) >= 0) {
        delete newErrors.unit_price
      }
      
      if (Number(formData.value.min_stock) >= 0) {
        delete newErrors.min_stock
      }
      
      errors.value = newErrors
    })
    
    // Lifecycle
    onMounted(async () => {
      console.log('[Product Form] 🚀 Component mounted')
      
      const instance = getCurrentInstance()
      const componentProxy = instance?.proxy || instance
      
      // ✅ Initialize PurchaseService with component instance
      if (window.ERP_CORE?.purchase) {
        try {
          window.ERP_CORE.purchase.initialize(componentProxy)
          console.log('[Product Form] ✅ PurchaseService initialized')
        } catch (error) {
          console.error('[Product Form] ❌ Failed to initialize PurchaseService:', error)
        }
      }
      
      // ✅ Initialize InventoryService with component instance
      if (window.ERP_CORE?.inventory) {
        try {
          window.ERP_CORE.inventory.initialize(componentProxy)
          console.log('[Product Form] ✅ InventoryService initialized')
        } catch (error) {
          console.error('[Product Form] ❌ Failed to initialize InventoryService:', error)
        }
      }
      
      // 🔧 Fix database format if needed (one-time migration)
      if (window.ERP_CORE?.codeManager && props.mode === 'add') {
        try {
          console.log('[Product Form] 🔧 Checking database format...')
          
          // ✅ เช็คก่อนว่า format ถูกต้องแล้วหรือยัง
          const accountingSettings = window.ERP_CORE.accounting
          if (accountingSettings?.initialized) {
            await accountingSettings.loadSettings()
            const currentConfig = await accountingSettings.getConfig('number_series.product')
            
            // ถ้า format ถูกต้องแล้ว (มี {year}) ไม่ต้อง fix
            if (currentConfig?.format?.includes('{year}')) {
              console.log('[Product Form] ✅ Format already correct:', currentConfig.format)
            } else {
              // Format ยังไม่ถูกต้อง ถึงจะ fix
              console.log('[Product Form] ⚠️ Format needs fixing:', currentConfig?.format)
              const result = await window.ERP_CORE.codeManager.fixDatabaseFormat('product', 'FB{year}{sequence}')
              if (result.success) {
                console.log('[Product Form] ✅ Database format fixed:', result)
              }
            }
          }
        } catch (error) {
          console.warn('[Product Form] ⚠️ Could not check/fix database format:', error.message)
        }
      }
      
      await loadSuppliers()
      await initializeForm()
    })
    
    // Additional methods for external access
    const setFormData = (data) => {
      if (data) {
        Object.keys(formData.value).forEach(key => {
          if (data[key] !== undefined) {
            formData.value[key] = data[key]
          }
        })
        
        // Set supplier search query if supplier exists
        if (data.supplier) {
          supplierSearchQuery.value = data.supplier
        }
      }
    }
    
    const saveDraft = async () => {
      console.log('💾 Saving as draft...')
      
      if (!validateForm()) {
        console.log('❌ Validation failed for draft save')
        return
      }
      
      const originalStatus = formData.value.status
      formData.value.status = 'draft'
      
      try {
        await saveProduct()
        
        if (window.$toast) {
          window.$toast.success('บันทึกร่างเรียบร้อย')
        }
      } catch (error) {
        console.error('❌ Error saving draft:', error)
        
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการบันทึกร่าง')
        }
      } finally {
        formData.value.status = originalStatus
      }
    }
    
    const debugFormState = () => {
      console.log('🐛 [ProductForm Debug] Current Form State:')
      console.log('📝 Form Data:', JSON.stringify(formData.value, null, 2))
      console.log('❌ Errors:', JSON.stringify(errors.value, null, 2))
      console.log('✅ Is Form Valid:', isFormValid.value)
      console.log('💾 Is Saving:', saving.value)
      console.log('🔄 Is Generating:', generating.value)
      
      // Check each required field
      console.log('📋 Field Validation:')
      console.log('  SKU:', formData.value.sku, '(length:', formData.value.sku?.length, ')')
      console.log('  Product Name:', formData.value.product_name, '(length:', formData.value.product_name?.length, ')')
      console.log('  Product Code:', formData.value.product_code, '(length:', formData.value.product_code?.length, ')')
      
      // Check validation state
      console.log('🔍 Validation State:')
      console.log('  Has SKU:', !!(formData.value.sku && formData.value.sku.trim()))
      console.log('  Has Product Name:', !!(formData.value.product_name && formData.value.product_name.trim()))
      console.log('  No Errors:', Object.keys(errors.value).length === 0)
      console.log('  Error Count:', Object.keys(errors.value).length)
      
      // Show button state
      const buttonDisabled = !isFormValid.value || saving.value
      console.log('🔘 Button State:')
      console.log('  Should be Disabled:', buttonDisabled)
      console.log('  Reason:', !isFormValid.value ? 'Form Invalid' : saving.value ? 'Currently Saving' : 'Should be Enabled')
      
      // Show in toast for user
      if (window.$toast) {
        const status = buttonDisabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'
        const reason = !isFormValid.value ? 'ข้อมูลไม่ครบ' : saving.value ? 'กำลังบันทึก' : 'พร้อมใช้งาน'
        window.$toast.info(`ปุ่มบันทึก: ${status} (${reason})`)
      }
    }
    
    // Computed properties
    const formTitle = computed(() => {
      return props.product?._id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'
    })
    
    const submitButtonText = computed(() => {
      return props.product?._id ? 'อัปเดตสินค้า' : 'เพิ่มสินค้า'
    })
    
    const isFormValid = computed(() => {
      const hasRequiredFields = !!(formData.value.sku && formData.value.sku.trim() && 
                                   formData.value.product_name && formData.value.product_name.trim())
      const hasNoErrors = Object.keys(errors.value).length === 0
      
      // Debug logging
      console.log('[ProductForm] Form validation check:', {
        sku: formData.value.sku,
        product_name: formData.value.product_name,
        hasRequiredFields,
        hasNoErrors,
        errors: errors.value,
        finalResult: hasRequiredFields && hasNoErrors
      })
      
      return hasRequiredFields && hasNoErrors
    })
    
    // Bulk Import computed properties
    const bulkImportLines = computed(() => {
      if (!bulkImportText.value.trim()) return []
      
      const allLines = bulkImportText.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const parts = line.split('\t')
          return {
            sku: parts[0]?.trim() || '',
            name: parts[1]?.trim() || parts[0]?.trim() || ''
          }
        })
        .filter(item => item.sku)
      
      // กรองข้อมูลซ้ำออก (เก็บแค่ SKU แรกที่พบ)
      const seen = new Set()
      const uniqueLines = []
      
      for (const item of allLines) {
        const skuUpper = item.sku.toUpperCase()
        if (!seen.has(skuUpper)) {
          seen.add(skuUpper)
          uniqueLines.push(item)
        }
      }
      
      return uniqueLines
    })
    
    const bulkImportDuplicates = computed(() => {
      if (!bulkImportText.value.trim()) return []
      
      const allLines = bulkImportText.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const parts = line.split('\t')
          return {
            sku: parts[0]?.trim() || '',
            name: parts[1]?.trim() || parts[0]?.trim() || ''
          }
        })
        .filter(item => item.sku)
      
      // หา SKU ที่ซ้ำกัน
      const skuCount = {}
      const duplicates = []
      
      for (const item of allLines) {
        const skuUpper = item.sku.toUpperCase()
        skuCount[skuUpper] = (skuCount[skuUpper] || 0) + 1
      }
      
      for (const item of allLines) {
        const skuUpper = item.sku.toUpperCase()
        if (skuCount[skuUpper] > 1) {
          duplicates.push({
            ...item,
            count: skuCount[skuUpper]
          })
        }
      }
      
      return duplicates
    })
    
    const bulkImportDuplicateCount = computed(() => {
      return bulkImportDuplicates.value.length
    })
    
    const bulkImportPreview = computed(() => {
      return bulkImportLines.value.slice(0, 5)
    })
    
    const bulkImportProgressPercent = computed(() => {
      if (bulkImportTotal.value === 0) return 0
      return Math.round((bulkImportProgress.value / bulkImportTotal.value) * 100)
    })
    
    const bulkImportSuccessCount = computed(() => {
      return bulkImportResults.value.filter(r => r.success).length
    })
    
    const bulkImportFailCount = computed(() => {
      return bulkImportResults.value.filter(r => !r.success).length
    })
    
    // Helper methods for labels
    const getCategoryLabel = (category) => {
      const labels = {
        'general': 'ทั่วไป',
        'electronics': 'อิเล็กทรอนิกส์',
        'textile': 'สิ่งทอ/ผ้า',
        'fabric': 'ผ้า',
        'furniture': 'เฟอร์นิเจอร์',
        'food': 'อาหาร',
        'beverage': 'เครื่องดื่ม',
        'cosmetics': 'เครื่องสำอาง',
        'chemical': 'เคมีภัณฑ์',
        'stationery': 'เครื่องเขียน',
        'other': 'อื่นๆ'
      }
      return labels[category] || category
    }
    
    const getUnitLabel = (unit) => {
      const labels = {
        'piece': 'ชิ้น',
        'box': 'กล่อง',
        'set': 'ชุด',
        'kg': 'กิโลกรัม',
        'g': 'กรัม',
        'liter': 'ลิตร',
        'ml': 'มิลลิลิตร',
        'meter': 'เมตร',
        'roll': 'ม้วน'
      }
      return labels[unit] || unit
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'draft': 'ร่าง',
        'discontinued': 'เลิกผลิต'
      }
      return labels[status] || status
    }
    
    // Bulk Import Methods
    const checkExistingProducts = async (items) => {
      const existingMap = {}
      
      try {
        if (!window.ERP_CORE?.inventory) {
          console.warn('⚠️ InventoryService not available, skipping duplicate check')
          return existingMap
        }
        
        // ตรวจสอบแต่ละ SKU
        for (const item of items) {
          const skuUpper = item.sku.toUpperCase()
          
          try {
            // ใช้ engine ค้นหาสินค้าจาก SKU
            const products = await window.ERP_CORE.engine.list('product', {
              filter: { sku: skuUpper },
              limit: 1
            })
            
            if (products && products.length > 0) {
              existingMap[skuUpper] = products[0]
              console.log(`✅ Found existing product: ${skuUpper}`)
            }
          } catch (error) {
            console.warn(`⚠️ Error checking SKU ${skuUpper}:`, error.message)
          }
        }
        
      } catch (error) {
        console.error('❌ Error checking existing products:', error)
      }
      
      return existingMap
    }
    
    const closeBulkImportModal = async () => {
      if (bulkImporting.value) {
        if (!confirm('กำลังนำเข้าข้อมูลอยู่ ต้องการยกเลิกหรือไม่?')) {
          return
        }
      }
      
      // รอให้ process ล่าสุดเสร็จก่อนปิด modal
      await nextTick()
      
      showBulkImportModal.value = false
      
      // รอให้ modal ปิดเสร็จก่อน clear data
      await nextTick()
      
      if (!bulkImporting.value) {
        clearBulkImport()
      }
    }
    
    const clearBulkImport = async () => {
      bulkImportText.value = ''
      bulkImportResults.value = []
      bulkImportProgress.value = 0
      bulkImportTotal.value = 0
      bulkImportStatus.value = ''
      
      // รอให้ DOM update
      await nextTick()
    }
    
    const processBulkImport = async () => {
      if (bulkImportLines.value.length === 0) {
        if (window.$toast) {
          window.$toast.warning('กรุณาใส่ข้อมูลสินค้า')
        }
        return
      }
      
      // Confirm before import
      const confirmMsg = `คุณต้องการนำเข้าสินค้า ${bulkImportLines.value.length} รายการหรือไม่?`
      if (!confirm(confirmMsg)) {
        return
      }
      
      // ใช้ nextTick เพื่อให้ DOM update ก่อน
      await nextTick()
      
      bulkImporting.value = true
      bulkImportProgress.value = 0
      bulkImportTotal.value = bulkImportLines.value.length
      bulkImportResults.value = []
      
      // ✨ ใช้การตั้งค่าจาก Form ปัจจุบัน
      const baseSettings = {
        category: formData.value.category,
        unit: formData.value.unit,
        status: formData.value.status,
        supplier_id: formData.value.supplier_id,
        supplier: formData.value.supplier,
        unit_price: formData.value.unit_price,
        retail_price: formData.value.retail_price,
        wholesale_price: formData.value.wholesale_price,
        min_stock: formData.value.min_stock,
        // Textile settings (if applicable)
        is_textile: formData.value.is_textile,
        fabric_type: formData.value.fabric_type,
        fabric_composition: formData.value.fabric_composition,
        gsm: formData.value.gsm,
        weight_per_meter: formData.value.weight_per_meter,
        enable_lot_tracking: formData.value.enable_lot_tracking
      }
      
      console.log('🚀 Starting bulk import:', bulkImportTotal.value, 'items')
      console.log('⚙️ Using base settings:', baseSettings)
      
      // ตรวจสอบ SKU ที่มีอยู่แล้วในระบบ
      const existingProducts = await checkExistingProducts(bulkImportLines.value)
      console.log('🔍 Existing products check:', existingProducts)
      
      // รอให้ UI update
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      for (let i = 0; i < bulkImportLines.value.length; i++) {
        const item = bulkImportLines.value[i]
        const skuUpper = item.sku.toUpperCase()
        bulkImportStatus.value = `กำลังนำเข้า: ${item.sku} - ${item.name}`
        
        // รอให้ UI update
        await nextTick()
        
        // ตรวจสอบว่า SKU มีอยู่แล้วหรือไม่
        if (existingProducts[skuUpper]) {
          console.log(`⚠️ [${i + 1}/${bulkImportTotal.value}] Skipped (exists):`, item.sku)
          bulkImportResults.value.push({
            success: false,
            sku: item.sku,
            name: item.name,
            error: 'ข้าม - SKU มีอยู่ในระบบแล้ว',
            skipped: true
          })
          bulkImportProgress.value = i + 1
          
          // รอให้ DOM update หลัง skip
          await nextTick()
          await new Promise(resolve => setTimeout(resolve, 50))
          continue
        }
        
        try {
          // Fill form data - เปลี่ยนเฉพาะ SKU และชื่อ ส่วนอื่นใช้จาก baseSettings
          formData.value.sku = item.sku.toUpperCase()
          formData.value.product_name = item.name
          formData.value.description = item.name
          
          // ใช้การตั้งค่าจาก baseSettings
          formData.value.supplier_id = baseSettings.supplier_id
          formData.value.supplier = baseSettings.supplier
          formData.value.category = baseSettings.category
          formData.value.unit = baseSettings.unit
          formData.value.status = baseSettings.status
          formData.value.unit_price = baseSettings.unit_price
          formData.value.retail_price = baseSettings.retail_price
          formData.value.wholesale_price = baseSettings.wholesale_price
          formData.value.min_stock = baseSettings.min_stock
          
          // Textile settings (if applicable)
          formData.value.is_textile = baseSettings.is_textile
          formData.value.fabric_type = baseSettings.fabric_type
          formData.value.fabric_composition = baseSettings.fabric_composition
          formData.value.gsm = baseSettings.gsm
          formData.value.weight_per_meter = baseSettings.weight_per_meter
          formData.value.enable_lot_tracking = baseSettings.enable_lot_tracking
          
          // 🔄 Generate product code BEFORE creating product (สร้างรหัสก่อนบันทึก)
          console.log(`🔄 [${i + 1}/${bulkImportTotal.value}] Generating product code...`)
          await generateProductCode()
          
          // Wait for code generation to complete
          await new Promise(resolve => setTimeout(resolve, 200))
          
          console.log(`📦 [${i + 1}/${bulkImportTotal.value}] Processing:`, item.sku, 'with code:', formData.value.product_code)
          
          // Clear previous errors
          errors.value = {}
          
          // Validate
          const isValid = validateForm()
          if (!isValid) {
            const errorMsg = Object.values(errors.value).join(', ')
            throw new Error('Form validation failed: ' + errorMsg)
          }
          
          // Save product using the same logic as saveProduct
          const productSKU = formData.value.sku.trim().toUpperCase()
          
          const productData = {
            product_code: formData.value.product_code || productSKU,
            sku: productSKU,
            product_name: formData.value.product_name.trim(),
            description: formData.value.description.trim() || formData.value.product_name.trim(),
            unit: baseSettings.unit,
            unit_price: Number(baseSettings.unit_price),
            retail_price: Number(baseSettings.retail_price || 0),
            wholesale_price: Number(baseSettings.wholesale_price || 0),
            min_stock: Number(baseSettings.min_stock),
            category: baseSettings.category,
            supplier_id: baseSettings.supplier_id,
            supplier: baseSettings.supplier,
            status: baseSettings.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // เพิ่ม textile fields ถ้าเป็นสินค้าผ้า
          if (baseSettings.is_textile) {
            productData.is_textile = true
            productData.fabric_type = baseSettings.fabric_type || ''
            productData.fabric_composition = baseSettings.fabric_composition || ''
            productData.gsm = baseSettings.gsm || null
            productData.weight_per_meter = baseSettings.weight_per_meter || null
            productData.enable_lot_tracking = baseSettings.enable_lot_tracking || false
          }
          
          // Create product
          if (!window.ERP_CORE?.inventory) {
            throw new Error('InventoryService ไม่พร้อมใช้งาน')
          }
          
          const result = await window.ERP_CORE.inventory.createProduct(productData)
          
          console.log(`📦 [${i + 1}/${bulkImportTotal.value}] Create result:`, {
            hasResult: !!result,
            hasSuccess: result?.success,
            hasData: !!result?.data,
            hasId: !!(result?._id || result?.data?._id),
            result: result
          })
          
          // ✅ ตรวจสอบความสำเร็จหลายรูปแบบ
          const isSuccess = result && (
            result.success === true || 
            result._id || 
            result.data?._id ||
            (result.product_code && result.sku)
          )
          
          if (isSuccess) {
            const productId = result._id || result.data?._id || result.id
            console.log(`✅ [${i + 1}/${bulkImportTotal.value}] Success:`, item.sku, 'ID:', productId)
            
            bulkImportResults.value.push({
              success: true,
              sku: item.sku,
              name: item.name,
              message: 'นำเข้าสำเร็จ',
              productId: productId
            })
            
            // รอให้ DOM update หลัง push result
            await nextTick()
            
            // 🔥 สำคัญ! Update sequence ใน database หลังสร้างสำเร็จ
            try {
              console.log(`🔄 [${i + 1}/${bulkImportTotal.value}] Updating sequence for code:`, formData.value.product_code)
              
              const usedPattern = await window.ERP_CORE.codeManager.getPatternForModule('product')
              
              // Extract sequence number
              let usedSequence = 1
              const format = usedPattern?.format || 'FB{year}{sequence}'
              
              if (format.includes('{year}')) {
                const prefix = usedPattern?.prefix || 'FB'
                let remaining = formData.value.product_code.replace(prefix, '')
                const currentYear = new Date().getFullYear().toString()
                
                if (remaining.startsWith(currentYear)) {
                  remaining = remaining.substring(currentYear.length)
                }
                
                usedSequence = parseInt(remaining) || 1
              } else {
                const sequenceMatch = formData.value.product_code.match(/\d+$/)
                usedSequence = sequenceMatch ? parseInt(sequenceMatch[0]) : 1
              }
              
              const patternInfo = {
                source: 'corporate_config',
                pattern: {
                  prefix: usedPattern?.prefix || 'FB',
                  format: usedPattern?.format || 'FB{year}{sequence}',
                  sequence: {
                    current: usedSequence,
                    digits: usedPattern?.sequence?.digits || 6,
                    start: usedPattern?.sequence?.start || 1,
                    resetOnYearChange: usedPattern?.sequence?.resetOnYearChange || false
                  }
                }
              }
              
              const sequenceResult = await window.ERP_CORE.codeManager.updateSequenceInDatabase('product', patternInfo)
              
              if (sequenceResult?.success) {
                console.log(`✅ [${i + 1}/${bulkImportTotal.value}] Sequence updated: ${usedSequence} → next: ${sequenceResult.next}`)
              } else {
                console.warn(`⚠️ [${i + 1}/${bulkImportTotal.value}] Sequence update failed:`, sequenceResult)
              }
            } catch (seqError) {
              console.warn(`⚠️ [${i + 1}/${bulkImportTotal.value}] Sequence update error:`, seqError.message)
              // ไม่หยุดกระบวนการแม้ sequence update จะล้มเหลว
            }
            
          } else {
            const errorMsg = result?.error || result?.message || 'ไม่สามารถสร้างสินค้าได้'
            throw new Error(errorMsg)
          }
          
        } catch (error) {
          console.error(`❌ [${i + 1}/${bulkImportTotal.value}] Failed:`, item.sku, error)
          bulkImportResults.value.push({
            success: false,
            sku: item.sku,
            name: item.name,
            error: error.message || 'เกิดข้อผิดพลาด'
          })
          
          // รอให้ DOM update หลัง push error result
          await nextTick()
        }
        
        bulkImportProgress.value = i + 1
        
        // รอให้ UI update progress
        await nextTick()
        
        // Small delay between items
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      bulkImporting.value = false
      bulkImportStatus.value = 'เสร็จสิ้น'
      
      // รอให้ UI update
      await nextTick()
      
      // Show summary
      const successCount = bulkImportSuccessCount.value
      const failCount = bulkImportFailCount.value
      const skippedCount = bulkImportResults.value.filter(r => r.skipped).length
      const errorCount = failCount - skippedCount
      
      console.log('🏁 Bulk import completed:', { 
        successCount, 
        failCount, 
        skippedCount, 
        errorCount,
        results: bulkImportResults.value 
      })
      
      if (window.$toast) {
        if (errorCount === 0 && skippedCount === 0) {
          window.$toast.success(`นำเข้าสินค้าสำเร็จทั้งหมด ${successCount} รายการ`)
        } else {
          const messages = []
          if (successCount > 0) messages.push(`สำเร็จ ${successCount}`)
          if (skippedCount > 0) messages.push(`ข้าม ${skippedCount} (ซ้ำ)`)
          if (errorCount > 0) messages.push(`ล้มเหลว ${errorCount}`)
          window.$toast.warning(messages.join(', ') + ' รายการ')
        }
      }
      
      // Reset form after delay
      setTimeout(() => {
        resetForm()
      }, 1000)
    }
    
    return {
      // State
      saving,
      loading,
      generating,
      formData,
      errors,
      
      // Balance state
      currentBalance,
      recalculating,
      refreshing,
      
      // Supplier search
      showSupplierDropdown,
      supplierSearchQuery,
      availableSuppliers,
      filteredSuppliers,
      
      // Bulk Import state
      showBulkImportModal,
      bulkImportText,
      bulkImporting,
      bulkImportProgress,
      bulkImportTotal,
      bulkImportStatus,
      bulkImportResults,
      bulkImportLines,
      bulkImportPreview,
      bulkImportProgressPercent,
      bulkImportSuccessCount,
      bulkImportFailCount,
      bulkImportDuplicates,
      bulkImportDuplicateCount,
      
      // Computed properties
      formTitle,
      submitButtonText,
      isFormValid,
      
      // Textile computed properties
      isTextileProduct,
      hasValidLotComponents,
      previewLotId,
      previewProductCode,
      
      // Product Image
      loadingProductImage,
      productImageError,
      productImageResults,
      showImageSelectionModal,
      productImageSearchRef,
      customImageSearch,
      fetchProductImage,
      searchProductImageCustom,
      selectProductImage,
      clearProductImage,
      closeImageSelectionModal,
      refetchProductImage,
      handleImageError,
      
      // Auto-fill textile
      autoFillTextileFromSKU,
      
      // Methods
      generateProductCode,
      validateForm,
      validateTextileFields,
      onSupplierInput,
      selectSupplier,
      hideSupplierDropdown,
      clearSupplier,
      formatSupplierStatus,
      saveProduct,
      saveDraft,
      resetForm,
      setFormData,
      debugFormState,
      
      // Balance methods
      loadCurrentBalance,
      refreshBalance,
      recalculateBalance,
      formatNumber,
      formatCurrency,
      formatDate,
      
      // Bulk Import methods
      closeBulkImportModal,
      clearBulkImport,
      processBulkImport,
      
      // Helper methods
      getCategoryLabel,
      getUnitLabel,
      getStatusLabel
    }
  }
}
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

/* Form animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Input focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Supplier Search Styles */
.supplier-search-wrapper {
  position: relative;
}

.supplier-input-container {
  position: relative;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  z-index: 2;
}

.supplier-input {
  padding-left: 40px !important;
  padding-right: 40px !important;
}

.selected-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-size: 16px;
  z-index: 2;
}

/* Dropdown Styles */
.supplier-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 400px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.dropdown-count {
  font-size: 11px;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.suppliers-list {
  max-height: 280px;
  overflow-y: auto;
}

/* Supplier Option Styles */
.supplier-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
}

.supplier-option:hover {
  background-color: #f8fafc;
}

.supplier-option:last-child {
  border-bottom: none;
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.new-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.existing-supplier .option-icon {
  background: #f0fdf4;
  color: #16a34a;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.option-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.2;
}

.option-description {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

.supplier-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #475569;
}

.contact-person {
  color: #64748b;
}

.option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  margin-top: 2px;
}

.supplier-id {
  color: #94a3b8;
  font-family: monospace;
  font-weight: 500;
}

.option-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.option-status.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.option-status.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.option-status.status-inactive {
  background-color: #f1f5f9;
  color: #64748b;
}

.option-action {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 12px;
  transition: all 0.2s ease;
}

.supplier-option:hover .option-action {
  color: #3b82f6;
}

/* New Supplier Option */
.new-supplier {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 1px solid #bae6fd;
  position: relative;
}

.new-supplier::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.new-supplier .option-name {
  color: #1e40af;
}

.new-supplier .option-description {
  color: #1e40af;
  font-weight: 500;
}

.new-supplier .option-meta {
  color: #3b82f6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: #64748b;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
  color: #94a3b8;
}

.empty-text {
  font-size: 14px;
  text-align: center;
}

/* Selected Supplier Display */
.selected-supplier {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.selected-supplier-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.selected-supplier-info i {
  color: #16a34a;
  font-size: 14px;
}

.selected-name {
  font-weight: 500;
  color: #15803d;
  font-size: 14px;
}

.selected-id {
  font-size: 11px;
  color: #16a34a;
  font-family: monospace;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 4px;
}

.clear-selection-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #fca5a5;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
}

.clear-selection-btn:hover {
  background: #f87171;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .md\:col-span-2 {
    grid-column: span 1;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
  
  .py-6 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  .space-y-8 > * + * {
    margin-top: 1rem;
  }
  
  .space-x-3 > * + * {
    margin-left: 0;
    margin-top: 0.75rem;
  }
  
  .flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .space-x-3 {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .justify-between {
    justify-content: center;
  }
}

/* Button hover states */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Disabled state improvements */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button:disabled:hover {
  transform: none;
}

/* Focus states for accessibility */
button:focus, 
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Space utilities */
.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

/* Shadow utilities */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Border utilities */
.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.border-red-300 {
  border-color: #fca5a5;
}

/* Color utilities */
.text-gray-900 {
  color: #111827;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-red-500 {
  color: #ef4444;
}

.text-red-600 {
  color: #dc2626;
}

.text-green-600 {
  color: #059669;
}

.text-blue-600 {
  color: #2563eb;
}

.text-blue-700 {
  color: #1d4ed8;
}

.text-yellow-600 {
  color: #d97706;
}

.text-yellow-900 {
  color: #78350f;
}

.text-green-900 {
  color: #14532d;
}

.text-blue-900 {
  color: #1e3a8a;
}

/* Background utilities */
.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-blue-700 {
  background-color: #1d4ed8;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.bg-yellow-50 {
  background-color: #fefce8;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.bg-blue-200 {
  background-color: #bfdbfe;
}

/* Font utilities */
.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

/* Text size utilities */
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

/* Custom scrollbar for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>