<template>
  <div v-if="!loading" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack"
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="fas fa-file-plus mr-3 text-blue-600"></i>
                {{ isEdit ? 'แก้ไขใบขอซื้อ' : 'สร้างใบขอซื้อใหม่' }}
              </h1>
              <p class="mt-1 text-gray-600">{{ isEdit ? 'แก้ไขข้อมูลใบขอซื้อสินค้า' : 'สร้างใบขอซื้อสินค้าเข้าสู่คลัง' }}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              v-if="isEdit && purchaseRequest?.status === 'draft'"
              @click="deleteDraft"
              :disabled="loading"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-trash mr-2"></i>
              ลบร่าง
            </button>
            <button 
              @click="resetForm"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-undo mr-2"></i>
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            <p class="text-sm text-gray-600">ข้อมูลทั่วไปของใบขอซื้อ</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Purchase Request Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสใบขอซื้อ
              </label>
              <div class="flex rounded-lg shadow-sm">
                <input 
                  v-model="form.purchase_request_code" 
                  type="text" 
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="รหัสจะถูกสร้างอัตโนมัติ"
                  readonly
                />
                <button 
                  type="button" 
                  @click="generatePurchaseRequestCode"
                  :disabled="loading"
                  class="px-3 py-2 bg-blue-600 border border-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  title="สร้างรหัสใหม่"
                >
                  <i class="fas fa-sync" :class="{ 'fa-spin': generatingCode }"></i>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">รหัสใบขอซื้อจะถูกสร้างอัตโนมัติเมื่อบันทึก</p>
            </div>

            <!-- Purchase Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ประเภทการซื้อ <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.purchase_type" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">การซื้อทั่วไป</option>
                <option value="stock_replenishment">เพิ่มสินค้าในสต็อค</option>
                <option value="project_specific">สำหรับโครงการเฉพาะ</option>
                <option value="maintenance">บำรุงรักษา</option>
                <option value="office_supplies">อุปกรณ์สำนักงาน</option>
              </select>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ form.purchase_type === 'stock_replenishment' ? 'หมวดหมู่สินค้า' : 'หมวดหมู่' }}
              </label>
              <select 
                v-model="form.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <template v-if="form.purchase_type === 'stock_replenishment'">
                  <option value="">เลือกหมวดหมู่สินค้า</option>
                  <option value="raw_materials">วัตถุดิบ</option>
                  <option value="finished_goods">สินค้าสำเร็จรูป</option>
                  <option value="packaging">บรรจุภัณฑ์</option>
                  <option value="spare_parts">อะไหล่</option>
                  <option value="consumables">วัสดุสิ้นเปลือง</option>
                </template>
                <template v-else>
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="equipment">อุปกรณ์</option>
                  <option value="supplies">วัสดุ</option>
                  <option value="services">บริการ</option>
                  <option value="software">ซอฟต์แวร์</option>
                  <option value="other">อื่นๆ</option>
                </template>
              </select>
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดใบขอซื้อ <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.description" 
                type="text" 
                required
                :placeholder="getDescriptionPlaceholder()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Department -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">แผนก</label>
              <select 
                v-model="form.department"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">เลือกแผนก</option>
                <option value="IT">IT Department</option>
                <option value="HR">HR Department</option>
                <option value="Finance">Finance Department</option>
                <option value="Operations">Operations Department</option>
                <option value="Marketing">Marketing Department</option>
                <option value="Procurement">Procurement Department</option>
              </select>
            </div>

            <!-- Requested By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ผู้ขอซื้อ <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.requested_by" 
                type="text" 
                required
                placeholder="ชื่อผู้ขอซื้อ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ระดับความสำคัญ</label>
              <select 
                v-model="form.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">ต่ำ</option>
                <option value="normal">ปกติ</option>
                <option value="high">สูง</option>
                <option value="urgent">เร่งด่วน</option>
              </select>
            </div>

            <!-- Expected Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">วันที่ต้องการใช้</label>
              <input 
                v-model="form.expected_delivery_date" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Justification -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลความจำเป็น</label>
              <textarea 
                v-model="form.justification" 
                rows="3"
                placeholder="ระบุเหตุผลความจำเป็นในการขอซื้อ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Items Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า</h3>
              <p class="text-sm text-gray-600">รายละเอียดสินค้าที่ต้องการขอซื้อ</p>
            </div>
            <div class="flex space-x-3">
              <button 
                v-if="isStockReplenishment"
                type="button" 
                @click="showInventorySelector"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                title="เลือกสินค้าจากระบบคลัง"
              >
                <i class="fas fa-boxes mr-2"></i>
                เลือกจากคลัง
              </button>
              <button 
                type="button" 
                @click="importFromTemplate"
                class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-file-import mr-2"></i>
                นำเข้าจากแม่แบบ
              </button>
              <button 
                type="button" 
                @click="addItem"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-plus mr-2"></i>
                เพิ่มรายการ
              </button>
            </div>
          </div>

          <div class="px-6 py-6 space-y-6">
            <!-- Items List -->

            <div 
              v-for="(item, index) in form.items" 
              :key="index" 
              class="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div class="flex items-start justify-between mb-4">
                <h4 class="text-sm font-medium text-gray-900">รายการที่ {{ index + 1 }}</h4>
                <div class="flex space-x-2">
                  <button 
                    type="button" 
                    @click="duplicateItem(index)"
                    class="text-blue-600 hover:text-blue-800 p-1"
                    title="ทำสำเนา"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  <button 
                    type="button" 
                    @click="removeItem(index)"
                    :disabled="form.items.length === 1"
                    class="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="ลบรายการ"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Product ID -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัสสินค้า</label>
                  <input 
                    v-model="item.product_id" 
                    type="text" 
                    placeholder="PROD001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อสินค้า <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="item.product_name" 
                    type="text" 
                    required
                    placeholder="ชื่อสินค้า"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <!-- Quantity -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    จำนวน <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model.number="item.quantity" 
                    type="number" 
                    min="1"
                    step="1"
                    required
                    @input="calculateItemTotal(index)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <!-- Unit -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หน่วย</label>
                  <select 
                    v-model="item.unit"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ชิ้น">ชิ้น</option>
                    <option value="กล่อง">กล่อง</option>
                    <option value="แพ็ค">แพ็ค</option>
                    <option value="เครื่อง">เครื่อง</option>
                    <option value="ลิตร">ลิตร</option>
                    <option value="กิโลกรัม">กิโลกรัม</option>
                  </select>
                </div>
                
                <!-- Unit Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    ราคาต่อหน่วย <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model.number="item.unit_price" 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    @input="calculateItemTotal(index)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <!-- Total -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รวม (บาท)</label>
                  <div class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold">
                    {{ formatNumber(item.total || 0) }}
                  </div>
                </div>
              </div>

              <!-- Specifications -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                <textarea 
                  v-model="item.specifications" 
                  rows="2"
                  placeholder="รายละเอียดเพิ่มเติม, คุณสมบัติ, หรือหมายเหตุ..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Replenishment Summary -->
        <div class="bg-white rounded-lg shadow-sm" v-if="isStockReplenishment">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">สรุปการเพิ่มสต็อค</h3>
            <p class="text-sm text-gray-600">สรุปข้อมูลการเติมสินค้าและสถานะสต็อค</p>
          </div>
          
          <div class="px-6 py-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-red-800">สินค้าที่สต็อคต่ำ</p>
                    <p class="text-2xl font-bold text-red-900">{{ getLowStockItemsCount() }}</p>
                    <p class="text-xs text-red-600">รายการ</p>
                  </div>
                  <div class="p-2 bg-red-200 rounded-lg">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-green-800">สินค้าใหม่</p>
                    <p class="text-2xl font-bold text-green-900">{{ getNewProductsCount() }}</p>
                    <p class="text-xs text-green-600">รายการ</p>
                  </div>
                  <div class="p-2 bg-green-200 rounded-lg">
                    <i class="fas fa-plus-circle text-green-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-800">จำนวนรวมที่สั่ง</p>
                    <p class="text-2xl font-bold text-blue-900">{{ getTotalOrderQuantity() }}</p>
                    <p class="text-xs text-blue-600">ชิ้น</p>
                  </div>
                  <div class="p-2 bg-blue-200 rounded-lg">
                    <i class="fas fa-boxes text-blue-600"></i>
                  </div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-purple-800">มูลค่าเพิ่มสต็อค</p>
                    <p class="text-2xl font-bold text-purple-900">{{ formatCurrency(form.total_amount) }}</p>
                    <p class="text-xs text-purple-600">บาท</p>
                  </div>
                  <div class="p-2 bg-purple-200 rounded-lg">
                    <i class="fas fa-chart-line text-purple-600"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Low Stock Items Detail -->
            <div v-if="getLowStockItemsCount() > 0" class="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i> 
                รายการสินค้าที่สต็อคต่ำ
              </h4>
              <div class="space-y-3">
                <div 
                  v-for="(item, index) in form.items.filter(item => !item.is_new_product && item.current_stock <= item.min_stock)" 
                  :key="index"
                  class="bg-white p-4 rounded-lg border border-red-200"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">{{ item.sku }} - {{ item.product_name }}</p>
                      <div class="flex items-center space-x-4 mt-1 text-sm">
                        <span class="text-red-600">
                          สต็อคปัจจุบัน: <strong>{{ item.current_stock }}</strong>
                        </span>
                        <span class="text-gray-600">
                          ขั้นต่ำ: {{ item.min_stock }} {{ item.unit }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-blue-600">สั่งซื้อ: {{ item.quantity }} {{ item.unit }}</p>
                      <p class="text-xs text-green-600">
                        คาดหวัง: {{ item.current_stock + item.quantity }} {{ item.unit }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Auto Update Stock Option -->
            <div class="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="form.auto_update_stock"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                >
                <div>
                  <p class="font-medium text-blue-900">อัปเดตสต็อคอัตโนมัติ</p>
                  <p class="text-sm text-blue-600">อัปเดตสต็อคอัตโนมัติเมื่อรับสินค้าเข้าคลัง</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">สรุปยอดรวม</h3>
            <p class="text-sm text-gray-600">ข้อมูลงบประมาณและสรุปราคา</p>
          </div>
          
          <div class="px-6 py-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left: Budget Info -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัสงบประมาณ</label>
                  <input 
                    v-model="form.budget_code" 
                    type="text" 
                    placeholder="BG-2024-001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ศูนย์ต้นทุน</label>
                  <select 
                    v-model="form.cost_center"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">เลือกศูนย์ต้นทุน</option>
                    <option value="CC001">IT Operations</option>
                    <option value="CC002">Human Resources</option>
                    <option value="CC003">Finance & Accounting</option>
                    <option value="CC004">Marketing</option>
                    <option value="CC005">General Admin</option>
                  </select>
                </div>
              </div>
              
              <!-- Right: Summary -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">จำนวนรายการ:</span>
                  <span class="font-medium text-gray-900">{{ form.items.length }} รายการ</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">ยอดรวมก่อนภาษี:</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(form.subtotal) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">ภาษีมูลค่าเพิ่ม (7%):</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(form.tax_amount) }}</span>
                </div>
                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-900">ยอดรวมทั้งสิ้น:</span>
                    <span class="text-xl font-bold text-blue-600">{{ formatCurrency(form.total_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- Additional Information -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h3>
            <p class="text-sm text-gray-600">ข้อมูลการจัดส่งและเงื่อนไขต่างๆ</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Delivery Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่จัดส่ง</label>
              <textarea 
                v-model="form.delivery_address" 
                rows="3"
                placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Supplier Suggestion -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ขายที่แนะนำ</label>
              <input 
                v-model="form.supplier_suggestion" 
                type="text" 
                placeholder="ชื่อผู้ขายที่แนะนำ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Payment Terms -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เงื่อนไขการชำระเงิน</label>
              <select 
                v-model="form.payment_terms"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">เงินสด</option>
                <option value="15_days">เครดิต 15 วัน</option>
                <option value="30_days">เครดิต 30 วัน</option>
                <option value="45_days">เครดิต 45 วัน</option>
                <option value="60_days">เครดิต 60 วัน</option>
              </select>
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
              <textarea 
                v-model="form.notes" 
                rows="4"
                placeholder="หมายเหตุเพิ่มเติม เงื่อนไขการส่งมอบ ฯลฯ"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <span v-if="lastSaved" class="text-sm text-green-600 flex items-center">
              <i class="fas fa-check-circle mr-2"></i>
              บันทึกล่าสุด: {{ formatDateTime(lastSaved) }}
            </span>
          </div>
          
          <div class="flex space-x-3">
            <button 
              type="button" 
              @click="goBack"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <i class="fas fa-times mr-2"></i>
              ยกเลิก
            </button>
            
            <button 
              type="button" 
              @click="saveDraft" 
              :disabled="loading"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <i class="fas fa-save mr-2" :class="{ 'fa-spin': loading && actionType === 'draft' }"></i>
              บันทึกร่าง
            </button>
            
            <button 
              type="submit" 
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <i v-if="loading && actionType === 'submit'" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-paper-plane mr-2"></i>
              {{ loading && actionType === 'submit' ? 'กำลังส่ง...' : (isEdit ? 'อัปเดตใบขอซื้อ' : 'ส่งใบขอซื้อ') }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Inventory Selector Modal -->
    <div v-if="showInventoryModal" class="modal-overlay" @click="showInventoryModal = false">
      <div class="modal-content inventory-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-boxes mr-2"></i>
            เลือกสินค้าจากคลัง
          </h3>
          <button class="close-btn" @click="showInventoryModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Search Box -->
          <div class="mb-4">
            <div class="relative">
              <input 
                v-model="inventorySearch"
                type="text" 
                class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ค้นหาสินค้าจาก SKU หรือชื่อสินค้า..."
                @input="filterInventoryItems"
              >
              <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
            </div>
            
            <!-- Filters -->
            <div class="mt-3 flex items-center justify-between">
              <label class="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="showOnlyLowStock" 
                  @change="filterInventoryItems"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-700">แสดงเฉพาะสินค้าสต็อคต่ำ</span>
              </label>
              <span class="text-sm text-gray-600">
                พบ <span class="font-semibold text-blue-600">{{ filteredInventoryItems.length }}</span> รายการ
              </span>
            </div>
          </div>
          
          <!-- Product List -->
          <div v-if="filteredInventoryItems.length > 0" class="space-y-2 max-h-96 overflow-y-auto pr-2">
            <template v-for="(item, index) in filteredInventoryItems" :key="item?.sku || `item-${index}`">
            <div 
              v-if="item"
              @click="selectInventoryItem(item)"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              :class="{
                'border-yellow-400 bg-yellow-50': isLowStock(item),
                'border-red-400 bg-red-50': (item?.stock_quantity || 0) === 0
              }"
            >
              <div class="flex items-start justify-between">
                <!-- Product Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono font-semibold rounded">
                      {{ item?.sku || 'N/A' }}
                    </span>
                    <span 
                      class="inline-block px-2 py-1 text-xs font-semibold rounded"
                      :class="{
                        'bg-green-100 text-green-800': (item?.stock_quantity || 0) > (item?.min_stock_level || 0),
                        'bg-yellow-100 text-yellow-800': (item?.stock_quantity || 0) > 0 && (item?.stock_quantity || 0) <= (item?.min_stock_level || 0),
                        'bg-red-100 text-red-800': (item?.stock_quantity || 0) === 0
                      }"
                    >
                      <i class="fas fa-boxes mr-1"></i>
                      {{ item?.stock_quantity || 0 }} {{ item?.unit || 'ชิ้น' }}
                    </span>
                  </div>
                  
                  <h4 class="text-gray-900 font-medium mb-2">
                    {{ item.product_name || item.name || 'ไม่ระบุชื่อ' }}
                  </h4>
                  
                  <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div class="flex items-center">
                      <i class="fas fa-layer-group w-4 text-gray-400 mr-2"></i>
                      <span>ขั้นต่ำ: {{ item?.min_stock_level || 0 }}</span>
                    </div>
                    <div class="flex items-center">
                      <i class="fas fa-check-circle w-4 text-green-500 mr-2"></i>
                      <span>พร้อมใช้: {{ item?.available_quantity || 0 }}</span>
                    </div>
                    <div v-if="item?.reserved_quantity > 0" class="flex items-center">
                      <i class="fas fa-lock w-4 text-orange-500 mr-2"></i>
                      <span>จอง: {{ item?.reserved_quantity || 0 }}</span>
                    </div>
                    <div v-if="item?.unit_price" class="flex items-center">
                      <i class="fas fa-tag w-4 text-blue-500 mr-2"></i>
                      <span class="font-semibold text-gray-900">{{ formatCurrency(item.unit_price) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Select Button -->
                <button 
                  type="button"
                  class="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center"
                  @click.stop="selectInventoryItem(item)"
                >
                  <i class="fas fa-plus mr-2"></i>
                  เลือก
                </button>
              </div>
            </div>
            </template>
          </div>
          
          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <i class="fas fa-box-open text-gray-300 text-6xl mb-4"></i>
            <h4 class="text-lg font-semibold text-gray-700 mb-2">ไม่พบสินค้าในคลัง</h4>
            <p class="text-gray-500 mb-4" v-if="inventorySearch">
              ไม่มีสินค้าที่ตรงกับคำค้นหา "<span class="font-semibold">{{ inventorySearch }}</span>"
            </p>
            <p class="text-gray-500 mb-4" v-else-if="showOnlyLowStock">
              ไม่มีสินค้าที่สต็อคต่ำในขณะนี้
            </p>
            <p class="text-gray-500 mb-4" v-else>
              ไม่มีข้อมูลสินค้าในระบบคลัง
            </p>
            <button 
              @click="loadInventoryData" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2"></i>
              รีเฟรชข้อมูล
            </button>
          </div>
        </div>
        
        <div class="modal-footer border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            ข้อมูลสินค้าทั้งหมด: {{ inventoryItems.length }} รายการ
          </div>
          <div class="flex gap-2">
            <button 
              @click="loadInventoryData" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="showInventoryModal = false" 
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Loading State -->
  <div v-else class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600">{{ actionType === 'saving' ? 'กำลังบันทึกข้อมูล...' : 'กำลังประมวลผล...' }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * ✅ PURCHASE REQUEST FORM - ใช้ PurchaseService แทน plugins
 */

// ✅ Helper for Core components (DocumentPreview, etc.)
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[PurchaseRequestForm] ERP_CORE not available')
}

export default {
  name: 'PurchaseRequestForm',
  emits: ['submit'],
  setup(props, { emit }) {
    console.log('[PurchaseRequestForm] Setup - emit function:', typeof emit, emit)
    const router = useRouter()
    const route = useRoute()
    
    // ✅ Initialize PurchaseService
    const instance = getCurrentInstance()
    const componentProxy = instance?.proxy || instance
    const purchaseService = window.ERP_CORE.purchase
    
    // Initialize services if needed
    if (!purchaseService?.isReady?.()) {
      purchaseService?.initialize?.(componentProxy)
    }
    
    if (window.ERP_CORE?.inventory && !window.ERP_CORE.inventory.isReady()) {
      window.ERP_CORE.inventory.initialize(componentProxy)
      console.log('✅ InventoryService initialized in PurchaseRequestForm')
    }
    
    // State
    const loading = ref(false)
    const actionType = ref('')
    const lastSaved = ref(null)
    const purchaseRequest = ref(null)
    const generatingCode = ref(false)
    
    // Check if editing
    const isEdit = computed(() => {
      return route.params.id && route.params.id !== 'new'
    })

    // Form Data
    const form = ref({
      purchase_request_code: '', // รหัสใบขอซื้อ
      description: '',
      department: '',
      requested_by: '',
      priority: 'normal',
      purchase_type: 'general',
      category: '',
      expected_delivery_date: '',
      justification: '',
      items: [
        {
          product_id: '',
          product_name: '',
          quantity: 1,
          unit: 'ชิ้น',
          unit_price: 0,
          total: 0,
          specifications: '',
          sku: '', // รหัสสินค้าในสต็อค
          current_stock: 0, // ระดับสต็อคปัจจุบัน
          min_stock: 0, // ระดับสต็อคขั้นต่ำ
          reorder_point: 0 // จุดที่ควรสั่งซื้อใหม่
        }
      ],
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      delivery_address: '',
      supplier_suggestion: '',
      payment_terms: '30_days',
      budget_code: '',
      cost_center: '',
      notes: '',
      inventory_impact: false, // บอกว่าการซื้อนี้จะส่งผลต่อสต็อคหรือไม่
      auto_update_stock: true // อัปเดตสต็อคอัตโนมัติเมื่อรับสินค้า
    })

    // Inventory Modal States
    const showInventoryModal = ref(false)
    const inventoryItems = ref([])
    const inventorySearch = ref('')
    const showOnlyLowStock = ref(false)
    const filteredInventoryItems = ref([])

    // Methods
    const goBack = () => {
      router.push('/purchase/purchase-request')
    }

    const resetForm = () => {
      if (isEdit.value && purchaseRequest.value) {
        // Reset to original data if editing
        loadPurchaseRequest()
      } else {
        // Reset to default if creating new
        form.value = {
          description: '',
          department: '',
          requested_by: '',
          priority: 'normal',
          expected_delivery_date: '',
          justification: '',
          items: [
            {
              product_id: '',
              product_name: '',
              quantity: 1,
              unit: 'ชิ้น',
              unit_price: 0,
              total: 0,
              specifications: ''
            }
          ],
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          delivery_address: '',
          supplier_suggestion: '',
          payment_terms: '30_days',
          budget_code: '',
          cost_center: '',
          notes: ''
        }
      }
    }

    // Item Management
    const addItem = () => {
      form.value.items.push({
        product_id: '',
        product_name: '',
        quantity: 1,
        unit: 'ชิ้น',
        unit_price: 0,
        total: 0,
        specifications: '',
        sku: '', // รหัสสินค้าในสต็อค
        current_stock: 0, // ระดับสต็อคปัจจุบัน
        min_stock: 0, // ระดับสต็อคขั้นต่ำ
        reorder_point: 0, // จุดที่ควรสั่งซื้อใหม่
        is_new_product: false // ระบุว่าเป็นสินค้าใหม่หรือไม่
      })
    }

    const removeItem = (index) => {
      if (form.value.items.length > 1) {
        form.value.items.splice(index, 1)
        calculateTotals()
      }
    }

    const duplicateItem = (index) => {
      const item = { ...form.value.items[index] }
      form.value.items.splice(index + 1, 0, item)
      calculateTotals()
    }

    const calculateItemTotal = (index) => {
      const item = form.value.items[index]
      if (!item) return
      
      // ✅ แปลงค่าเป็น number และตรวจสอบ NaN
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      
      // ✅ ตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
      item.quantity = isNaN(quantity) ? 0 : quantity
      item.unit_price = isNaN(unitPrice) ? 0 : unitPrice
      item.total = item.quantity * item.unit_price
      
      calculateTotals()
    }

    const calculateTotals = () => {
      const subtotal = form.value.items.reduce((sum, item) => {
        const itemTotal = parseFloat(item.total) || 0
        return sum + (isNaN(itemTotal) ? 0 : itemTotal)
      }, 0)
      
      form.value.subtotal = isNaN(subtotal) ? 0 : subtotal
      form.value.tax_amount = isNaN(subtotal) ? 0 : subtotal * 0.07 // VAT 7%
      form.value.total_amount = form.value.subtotal + form.value.tax_amount
    }

    // Inventory Modal Functions
    const showInventorySelector = () => {
      console.log('🔄 เปิด Inventory Selector')
      
      // Debug ข้อมูลปัจจุบันใน component
      console.log('📊 ข้อมูลปัจจุบันใน component:')
      console.log('  - inventoryItems:', inventoryItems.value)
      console.log('  - filteredInventoryItems:', filteredInventoryItems.value)
      
      // เคลียร์ข้อมูลทั้งหมดก่อน
      console.log('🗑️ เคลียร์ข้อมูลเก่าทั้งหมด')
      inventoryItems.value = []
      filteredInventoryItems.value = []
      inventorySearch.value = ''
      showOnlyLowStock.value = false
      
      // ✅ ลบ localStorage debug code - ไม่ต้องใช้แล้ว
      
      // แสดง Modal ก่อนแล้วค่อยโหลดข้อมูล
      showInventoryModal.value = true
      
      // โหลดข้อมูลใหม่
      loadInventoryData()
    }

    const clearInventoryData = () => {
      console.log('🗑️ เคลียร์ข้อมูล Inventory ทั้งหมด')
      
      // เคลียร์ใน component state
      inventoryItems.value = []
      filteredInventoryItems.value = []
      inventorySearch.value = ''
      showOnlyLowStock.value = false
      
      // ✅ ลบ localStorage clear code - ไม่ต้องใช้แล้ว
      // ข้อมูลอยู่ใน API แล้ว
      
      console.log('✅ เคลียร์ข้อมูลเสร็จสิ้น')
    }

    const forceResetInventory = () => {
      console.log('🚨 บังคับรีเซ็ต Inventory ทั้งหมด')
      
      // รีเซ็ตทุกอย่างในข้อมูล component
      inventoryItems.value = []
      filteredInventoryItems.value = []
      inventorySearch.value = ''
      showOnlyLowStock.value = false
      
      // บังคับ re-render
      showInventoryModal.value = false
      setTimeout(() => {
        showInventoryModal.value = true
      }, 100)
      
      console.log('✅ บังคับรีเซ็ตเสร็จสิ้น')
    }

    const loadInventoryData = async () => {
      console.log('🔄 เริ่มโหลดข้อมูล Product จาก InventoryService...')
      
      // บังคับเคลียร์ข้อมูลเก่าอย่างสมบูรณ์
      console.log('🗑️ เคลียร์ข้อมูลเก่าอย่างสมบูรณ์')
      inventoryItems.value = []
      filteredInventoryItems.value = []
      
      try {
        let items = []
        
        // ✅ ใช้ InventoryService ดึงข้อมูล Product (มี balance รวมอยู่แล้ว)
        const core = getCore()
        
        // Debug: ตรวจสอบ ERP_CORE
        console.log('🔍 ERP_CORE:', {
          exists: !!core,
          hasInventory: !!core?.inventory,
          hasEngine: !!core?.engine,
          inventoryReady: core?.inventory?.isReady?.()
        })
        
        if (core?.inventory) {
          console.log('🔍 ใช้ InventoryService.getAllProducts()...')
          
          try {
            // โหลดข้อมูล Products (InventoryService รวม balance ให้เลย)
            const productsData = await core.inventory.getAllProducts()
            
            console.log('📦 Products from InventoryService:', productsData.length)
            console.log('📦 Sample products:', productsData.slice(0, 3).map(p => ({
              id: p.id,
              sku: p.sku,
              name: p.product_name,
              balance: p.balance
            })))
            
            if (Array.isArray(productsData) && productsData.length > 0) {
              console.log('✅ Products loaded:', productsData.length)
              
              // Map ข้อมูล Product (balance รวมอยู่ใน product.balance แล้ว)
              items = productsData.map(product => {
                const balance = product.balance // InventoryService รวม balance ให้แล้ว
                
                // Debug: แสดงข้อมูล balance ที่พบ
                if (product.sku === 'FB000001' || product.product_code === 'FB000001') {
                  console.log(`🔍 Product ${product.sku || product.product_code}:`, {
                    product_id: product.id,
                    found_balance: balance ? {
                      id: balance.id,
                      qty_on_hand: balance.qty_on_hand,
                      qty_available: balance.qty_available,
                      qty_reserved: balance.qty_reserved
                    } : null
                  })
                }
                
                return {
                  // Product info
                  id: product.id || product._id,
                  sku: product.sku || product.product_code || product.id,
                  name: product.product_name || 'ไม่ระบุชื่อ',
                  product_name: product.product_name || 'ไม่ระบุชื่อ',
                  description: product.description || '',
                  category: product.category || '',
                  unit: product.unit || 'ชิ้น',
                  
                  // Pricing
                  unit_price: parseFloat(product.unit_price || 0),
                  cost_price: parseFloat(product.cost_price || 0),
                  
                  // Stock info (ใช้ข้อมูลจาก Balance record)
                  stock_quantity: balance?.qty_on_hand || 0,
                  quantity: balance?.qty_on_hand || 0, // alias สำหรับ compatibility
                  min_stock_level: parseInt(product.min_stock_level || product.min_stock || 0),
                  min_stock: parseInt(product.min_stock_level || product.min_stock || 0), // alias
                  max_stock_level: parseInt(product.max_stock_level || 100),
                  available_quantity: balance?.qty_available || balance?.qty_on_hand || 0,
                  reserved_quantity: balance?.qty_reserved || 0,
                  
                  // Balance data (เก็บ balance object ไว้)
                  balance: balance || null,
                  
                  // Supplier info
                  supplier_id: product.supplier_id,
                  supplier_name: product.supplier_name || product.supplier || '',
                  
                  // Status
                  status: product.status || 'active',
                  location: product.location || '',
                  
                  // Metadata
                  created_at: product.created_at,
                  updated_at: product.updated_at
                }
              })
              
              console.log('🔗 Products with balance merged:', items.length)
              console.log('Sample product with balance:', items[0])
              
            } else {
              console.warn('⚠️ ไม่สามารถโหลด Products ได้')
            }
            
          } catch (engineError) {
            console.error('❌ Error loading from InventoryService:', engineError)
          }
        }
        
        // ✅ ลบ Fallback engine - ใช้ InventoryService เท่านั้น
        
        // แสดงข้อมูลที่ได้และทำให้แน่ใจว่าเป็น array
        if (!Array.isArray(items)) {
          console.log('⚠️ items ไม่ใช่ array:', items)
          items = []
        }
        
        // กรองเฉพาะ items ที่มีข้อมูลจริง (ไม่ใช่ค่าว่างหรือ placeholder)
        items = items.filter(item => {
          return item && 
                 item.sku && 
                 item.sku !== 'ไม่ระบุ' && 
                 item.sku !== '' &&
                 (item.product_name || item.name) &&
                 (item.product_name || item.name) !== 'ไม่ระบุชื่อ'
        })

        // Debug: แสดงข้อมูลก่อนกรอง duplicate
        console.log('🔍 Debug ข้อมูลก่อนกรอง duplicate:', items.map(item => ({
          sku: item.sku,
          name: item.product_name || item.name,
          quantity: item.quantity,
          source: 'loaded'
        })))

        // กรองข้อมูลซ้ำ (duplicate) โดยใช้ SKU เป็นหลัก และเลือกรายการที่มี quantity มากกว่า
        const itemsBySKU = new Map()
        const duplicateInfo = []
        
        items.forEach((item, index) => {
          const sku = item.sku
          const quantity = parseFloat(item.quantity) || 0
          
          if (!itemsBySKU.has(sku)) {
            // รายการแรกของ SKU นี้
            itemsBySKU.set(sku, item)
            console.log(`✅ เพิ่ม SKU: ${sku} (${item.product_name || item.name}) - quantity: ${quantity}`)
          } else {
            // พบ duplicate, เปรียบเทียบ quantity
            const existingItem = itemsBySKU.get(sku)
            const existingQuantity = parseFloat(existingItem.quantity) || 0
            
            duplicateInfo.push({
              index,
              sku: sku,
              name: item.product_name || item.name,
              quantity: quantity,
              action: 'duplicate_found'
            })
            
            if (quantity > existingQuantity) {
              // รายการใหม่มี quantity มากกว่า ให้แทนที่
              console.log(`🔄 แทนที่ SKU: ${sku} จาก quantity ${existingQuantity} เป็น ${quantity}`)
              itemsBySKU.set(sku, item)
              duplicateInfo[duplicateInfo.length - 1].action = 'replaced_existing'
            } else {
              // รายการเก่ามี quantity มากกว่าหรือเท่ากัน ให้ใช้รายการเก่า
              console.log(`❌ ข้าม duplicate SKU: ${sku} (quantity: ${quantity} <= ${existingQuantity})`)
              duplicateInfo[duplicateInfo.length - 1].action = 'skipped'
            }
          }
        })
        
        const uniqueItems = Array.from(itemsBySKU.values())
        
        if (duplicateInfo.length > 0) {
          console.log('📋 รายการ duplicate ที่ถูกข้าม:', duplicateInfo)
        }
        
        items = uniqueItems
        console.log(`🧹 หลังกรอง duplicate: เหลือ ${items.length} รายการ`)
        
        console.log(`✅ โหลดข้อมูล Inventory สำเร็จ: พบ ${items.length} รายการ (หลังกรอง)`)
        if (items.length > 0) {
          console.log('📋 ตัวอย่างข้อมูล (หลังกรอง):', items.slice(0, 3))
          console.log('📋 ข้อมูลทั้งหมด (หลังกรอง):', JSON.stringify(items, null, 2))
        } else {
          console.warn('⚠️ ไม่พบข้อมูล Product จากระบบ')
        }
        
        console.log('🔄 กำลังกำหนดค่าให้ inventoryItems.value')
        inventoryItems.value = [...items] // สร้าง array ใหม่
        console.log('📊 หลังกำหนดค่า inventoryItems.value:', inventoryItems.value)
        
        filterInventoryItems()
        console.log('📊 หลัง filterInventoryItems filteredInventoryItems.value:', filteredInventoryItems.value)
        
      } catch (error) {
        console.error('❌ Error loading inventory:', error)
        inventoryItems.value = []
        filteredInventoryItems.value = []
      }
    }

    const filterInventoryItems = () => {
      // ป้องกัน undefined หรือ non-array
      if (!Array.isArray(inventoryItems.value)) {
        console.log('⚠️ inventoryItems.value ไม่ใช่ array:', inventoryItems.value)
        inventoryItems.value = []
        filteredInventoryItems.value = []
        return
      }
      
      let filtered = [...inventoryItems.value]
      
      // กรองตามคำค้นหา
      if (inventorySearch.value.trim()) {
        const searchTerm = inventorySearch.value.toLowerCase()
        filtered = filtered.filter(item => 
          item && (
            item.sku?.toLowerCase().includes(searchTerm) ||
            item.product_name?.toLowerCase().includes(searchTerm) ||
            item.name?.toLowerCase().includes(searchTerm)
          )
        )
      }
      
      // กรองเฉพาะสต็อคต่ำ
      if (showOnlyLowStock.value) {
        filtered = filtered.filter(item => 
          item && (item.quantity || 0) <= (item.min_stock || 0)
        )
      }
      
      filteredInventoryItems.value = filtered
      console.log('🔍 Filtered items:', filtered.length, 'รายการ')
    }

    const selectInventoryItem = (item) => {
      console.log('🎯 กำลังเลือกสินค้าจาก Inventory:', item)
      
      // ✅ แปลงค่าเป็น number และตรวจสอบ NaN
      const stockQty = parseFloat(item.stock_quantity || item.available_quantity) || 0
      const minStock = parseFloat(item.min_stock_level || item.min_stock) || 0
      const unitPrice = parseFloat(item.unit_price || item.last_price) || 0
      const quantity = isLowStock(item) ? suggestReorderQuantity(item) : 1
      
      // สร้างข้อมูลสินค้าใหม่
      const newItem = {
        product_id: item.id || item.sku || '',
        sku: item.sku || item.id || '',
        product_name: item.name || item.product_name || '',
        current_stock: isNaN(stockQty) ? 0 : stockQty,
        min_stock: isNaN(minStock) ? 0 : minStock,
        reorder_point: isNaN(minStock) ? 0 : minStock,
        unit: item.unit || 'ชิ้น',
        quantity: isNaN(quantity) ? 1 : quantity,
        unit_price: isNaN(unitPrice) ? 0 : unitPrice,
        total: 0,
        specifications: item.description || '',
        is_new_product: false
      }
      
      // คำนวณราคารวม
      newItem.total = newItem.quantity * newItem.unit_price
      
      // ตรวจสอบว่ามีรายการว่างอยู่หรือไม่
      let hasEmptyItem = false
      let emptyItemIndex = -1
      
      for (let i = 0; i < form.value.items.length; i++) {
        const existingItem = form.value.items[i]
        
        // ตรวจสอบว่าเป็นรายการว่าง (ไม่มี SKU หรือชื่อสินค้า)
        if (!existingItem.sku || existingItem.sku.trim() === '' || 
            !existingItem.product_name || existingItem.product_name.trim() === '' ||
            existingItem.product_name === 'ไม่ระบุชื่อ') {
          hasEmptyItem = true
          emptyItemIndex = i
          break
        }
      }
      
      if (hasEmptyItem && emptyItemIndex >= 0) {
        // แทนที่รายการว่าง
        console.log(`🔄 แทนที่รายการที่ ${emptyItemIndex + 1} ด้วยสินค้าจาก Inventory`)
        form.value.items[emptyItemIndex] = { ...newItem }
      } else {
        // ไม่มีรายการว่าง ให้เพิ่มรายการใหม่
        console.log('➕ เพิ่มรายการใหม่เนื่องจากไม่มีรายการว่าง')
        form.value.items.push(newItem)
      }
      
      calculateTotals()
      
      // ปิด modal
      showInventoryModal.value = false
      
      console.log('✅ เลือกสินค้าสำเร็จ:', {
        action: hasEmptyItem ? 'replaced' : 'added',
        index: hasEmptyItem ? emptyItemIndex : form.value.items.length - 1,
        item: newItem
      })
    }

    const isLowStock = (item) => {
      const currentStock = item?.stock_quantity || item?.available_quantity || 0
      const minStock = item?.min_stock_level || item?.min_stock || 0
      return currentStock <= minStock
    }

    const getStockStatusClass = (item) => {
      const currentStock = item?.stock_quantity || item?.available_quantity || 0
      const minStock = item?.min_stock_level || item?.min_stock || 0
      
      if (currentStock === 0) return 'out-of-stock'
      if (currentStock <= minStock) return 'low-stock'
      return 'in-stock'
    }

    // Formatting
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatNumber = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Load existing purchase request for editing
    const loadPurchaseRequest = async () => {
      if (!isEdit.value) return

      try {
        loading.value = true
        
        // Debug log เพื่อดูว่าใช้ transaction type อะไร
        console.log('[PurchaseRequestForm] Loading with transaction type: purchase')
        console.log('[PurchaseRequestForm] Loading with ID:', route.params.id)
        
        const core = getCore()
        const result = await core.engine.read('purchase', route.params.id)
        
        console.log('[PurchaseRequestForm] Load result:', result)
        
        if (result.success && result.data) {
          purchaseRequest.value = result.data
          form.value = { ...result.data }
          calculateTotals()
        } else {
          alert('ไม่พบข้อมูลใบขอซื้อที่ระบุ: ' + (result.error || 'ไม่ทราบสาเหตุ'))
          goBack()
        }
      } catch (error) {
        console.error('Error loading purchase request:', error)
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message)
        goBack()
      } finally {
        loading.value = false
      }
    }

    // Form submission
    const saveDraft = async () => {
      if (!form.value.description || !form.value.requested_by) {
        alert('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน')
        return
      }

      actionType.value = 'draft'
      loading.value = true

      try {
        // สร้างรหัสใบขอซื้อถ้ายังไม่มี
        if (!form.value.purchase_request_code) {
          await generatePurchaseRequestCode()
        }

        const draftData = {
          ...form.value,
          status: 'draft',
          workflow_state: 'draft'
        }

        console.log('[PurchaseRequestForm] Saving draft data:', draftData)

        let result
        if (isEdit.value) {
          console.log('[PurchaseRequestForm] Updating existing draft:', route.params.id)
          result = await purchaseService.updatePurchaseRequest(route.params.id, draftData)
        } else {
          console.log('[PurchaseRequestForm] Creating new draft via PurchaseService')
          result = await purchaseService.createPurchaseRequest(draftData)
        }

        console.log('[PurchaseRequestForm] Save result:', result)

        if (result) {
          lastSaved.value = new Date().toISOString()
          alert(isEdit.value ? 'อัปเดตร่างเรียบร้อย' : 'บันทึกร่างเรียบร้อย')
          
          if (!isEdit.value && result.data) {
            // Redirect to edit mode after creating
            console.log('[PurchaseRequestForm] Redirecting to edit mode with ID:', result.data.id)
            router.replace(`/purchase/purchase-request/${result.data.id}/edit`)
          }
        }
      } catch (error) {
        console.error('[PurchaseRequestForm] Error saving draft:', error)
        alert('เกิดข้อผิดพลาดในการบันทึกร่าง')
      } finally {
        loading.value = false
        actionType.value = ''
      }
    }

    const validateNumericFields = () => {
      form.value.items.forEach(item => {
        item.quantity = item.quantity || 0;
        item.unit_price = item.unit_price || 0;
        item.total = item.quantity * item.unit_price;
      });
    };

    const submitForm = async (event) => {
      console.log('[PurchaseRequestForm] Starting submitForm...')
      
      // ป้องกัน default form submission
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      
      // ตรวจสอบ loading state เพื่อป้องกันการ submit ซ้ำ
      if (loading.value) {
        console.log('[PurchaseRequestForm] Already loading, skipping submit')
        return
      }

      validateNumericFields();

      if (!form.value.description || !form.value.requested_by) {
        alert('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน');
        return;
      }

      const hasValidItems = form.value.items.some(item => 
        item.product_name && item.quantity > 0 && item.unit_price > 0
      );

      if (!hasValidItems) {
        alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        return;
      }

      actionType.value = 'submit'
      loading.value = true

      try {
        // ✅ แปลง expected_delivery_date เป็น ISO format
        let deliveryDate = form.value.expected_delivery_date
        if (deliveryDate && typeof deliveryDate === 'string') {
          // ถ้าเป็น date string (YYYY-MM-DD) ให้แปลงเป็น ISO
          if (!deliveryDate.includes('T')) {
            deliveryDate = new Date(deliveryDate + 'T00:00:00.000Z').toISOString()
          }
        } else if (!deliveryDate) {
          // ถ้าไม่มีค่า ให้เป็น null
          deliveryDate = null
        }

        // เตรียมข้อมูลสำหรับส่ง - ใช้ form.value โดยตรง ไม่ใช่ event object
        const requestData = {
          ...form.value,
          expected_delivery_date: deliveryDate,
          items: form.value.items.filter(item => item.product_name && item.quantity > 0 && item.unit_price > 0),
          status: isEdit.value ? form.value.status : 'pending_approval',
          // ✅ ใช้ pending_approval เมื่อส่งใบขอซื้อ, draft เมื่อแก้ไข
          workflow_state: isEdit.value ? form.value.workflow_state : 'pending_approval',
          state: isEdit.value ? form.value.state : 'pending_approval',
          created_by: 'user',
          updated_by: 'user'
        };

        console.log('[PurchaseRequestForm] Submitting request data:', requestData);

        let result

        if (isEdit.value) {
          // ✅ อัปเดตใบขอซื้อที่มีอยู่ผ่าน PurchaseService
          console.log('[PurchaseRequestForm] Updating existing purchase request:', route.params.id)
          result = await purchaseService.updatePurchaseRequest(route.params.id, requestData)
        } else {
          // ✅ สร้างใบขอซื้อใหม่ผ่าน PurchaseService
          console.log('[PurchaseRequestForm] Creating new purchase request via PurchaseService')
          result = await purchaseService.createPurchaseRequest(requestData)
        }

        console.log('[PurchaseRequestForm] Submit result:', result)

        if (result && (result.success !== false)) {
          // ✅ Update sequence ใน database หลังบันทึกสำเร็จ (สำหรับ purchase request ใหม่เท่านั้น)
          if (!isEdit.value && window.ERP_CORE?.codeManager && requestData.purchase_request_code) {
            try {
              console.log('🔄 [PurchaseRequestForm] Updating sequence after successful save:', requestData.purchase_request_code)
              
              // ดึง pattern ที่ใช้จริง - ✅ ใช้ purchase
              const usedPattern = await window.ERP_CORE.codeManager.getPatternForModule('purchase')
              
              // ⚠️ Extract ONLY the PURE sequence number (last digits after removing prefix and year)
              let usedSequence = 1
              
              const format = usedPattern?.pattern?.format || usedPattern?.format || 'PRX{year}{sequence}'
              console.log(`📐 [PurchaseRequestForm] Format: ${format}`)
              
              if (format.includes('{year}')) {
                // Format: {prefix}{year}{sequence}
                // Example: PRX2025000001 หรือ PR2025000001
                // Step 1: Remove prefix
                const prefix = usedPattern?.pattern?.prefix || usedPattern?.prefix || 'PRX'
                let remaining = requestData.purchase_request_code.replace(prefix, '')
                console.log(`  Step 1 - Remove prefix "${prefix}": "${requestData.purchase_request_code}" → "${remaining}"`)
                
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
                const sequenceMatch = requestData.purchase_request_code.match(/\d+$/)
                usedSequence = sequenceMatch ? parseInt(sequenceMatch[0]) : 1
              }
              
              console.log(`✅ [PurchaseRequestForm] Extracted PURE sequence: ${usedSequence} from code: ${requestData.purchase_request_code}`)
              
              // สร้าง patternInfo object ตามที่ CodeManager ต้องการ
              const patternInfo = {
                source: 'corporate_config',
                pattern: {
                  prefix: usedPattern?.pattern?.prefix || usedPattern?.prefix || 'PR',
                  format: usedPattern?.pattern?.format || usedPattern?.format || 'PR{year}{sequence}',
                  sequence: {
                    current: usedSequence, // เฉพาะ sequence number ไม่รวมปี (e.g., 1, 2, 3...)
                    digits: usedPattern?.pattern?.sequence?.digits || usedPattern?.sequence?.digits || 6,
                    start: usedPattern?.pattern?.sequence?.start || usedPattern?.sequence?.start || 1,
                    resetOnYearChange: usedPattern?.pattern?.sequence?.resetOnYearChange || usedPattern?.sequence?.resetOnYearChange || true
                  }
                }
              }
              
              console.log('📝 [PurchaseRequestForm] Pattern info for sequence update:', patternInfo)
              
              // เรียก updateSequenceInDatabase - ✅ ใช้ purchase
              const sequenceResult = await window.ERP_CORE.codeManager.updateSequenceInDatabase('purchase', patternInfo)
              
              if (sequenceResult?.success) {
                console.log(`✅ [PurchaseRequestForm] Sequence updated in database: current=${usedSequence}, next=${sequenceResult.next}`)
              } else {
                console.warn('⚠️ [PurchaseRequestForm] Sequence update returned non-success:', sequenceResult)
              }
            } catch (sequenceError) {
              console.warn('⚠️ [PurchaseRequestForm] Failed to update sequence:', sequenceError.message)
              // ไม่หยุดกระบวนการแม้ sequence update จะล้มเหลว
            }
          }
          
          // ✅ ป้องกัน DOM errors โดย reset loading ก่อน
          loading.value = false
          actionType.value = ''
          
          // อัปเดต lastSaved
          lastSaved.value = new Date().toISOString()
          
          // Emit สำหรับ parent component ก่อน
          console.log('[PurchaseRequestForm] About to emit, emit function:', typeof emit)
          try {
            if (emit && typeof emit === 'function') {
              emit('submit', {
                success: true,
                data: result.data || result,
                isEdit: isEdit.value
              })
              console.log('[PurchaseRequestForm] Emit successful')
            }
          } catch (emitError) {
            console.error('[PurchaseRequestForm] Error calling emit:', emitError)
          }
          
          // ✅ ไม่ redirect ใน PurchaseRequestForm แล้ว - ให้ parent component จัดการ
          console.log('[PurchaseRequestForm] ส่งใบขอซื้อเรียบร้อย')
          
          // ✅ Reset loading state
          loading.value = false
          actionType.value = ''
          
        } else {
          throw new Error(result?.message || result?.error || 'ไม่สามารถบันทึกใบขอซื้อได้')
        }

      } catch (error) {
        console.error('[PurchaseRequestForm] Error submitting form:', error);
        
        // ✅ Reset loading ก่อนแสดง error
        loading.value = false
        actionType.value = ''
        
        // Emit error สำหรับ parent component
        console.log('[PurchaseRequestForm] About to emit error, emit function:', typeof emit)
        try {
          if (emit && typeof emit === 'function') {
            emit('submit', {
              success: false,
              error: error.message
            })
            console.log('[PurchaseRequestForm] Error emit successful')
          }
        } catch (emitError) {
          console.error('[PurchaseRequestForm] Error calling emit in error handler:', emitError)
        }
        
        // ✅ แสดง error หลัง emit เสร็จ
        await nextTick()
        
        // ✅ ใช้ ERP_CORE notification แทน alert
        try {
          const core = getCore()
          if (core && core.showNotification) {
            core.showNotification('error', 'เกิดข้อผิดพลาดในการส่งข้อมูล: ' + error.message, 'Purchase Request')
          } else {
            console.error('[PurchaseRequestForm] ERP_CORE notification not available, fallback to alert')
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + error.message)
          }
        } catch (notificationError) {
          console.error('[PurchaseRequestForm] Error showing notification:', notificationError)
          alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + error.message)
        }
      }
    }

    const deleteDraft = async () => {
      if (!confirm('ต้องการลบร่างนี้หรือไม่?')) return

      try {
        loading.value = true
        const core = getCore()
        const result = await core.engine.delete('purchase', route.params.id)
        if (result.success) {
          alert('ลบร่างเรียบร้อย')
          goBack()
        } else {
          alert('เกิดข้อผิดพลาดในการลบร่าง: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting draft:', error)
        alert('เกิดข้อผิดพลาดในการลบร่าง')
      } finally {
        loading.value = false
      }
    }

    const importFromTemplate = () => {
      // TODO: Implement template import
      alert('ฟีเจอร์นำเข้าจากแม่แบบจะพัฒนาในเวอร์ชันถัดไป')
    }

    // Purchase Request Code Generation
    const generatePurchaseRequestCode = async () => {
      console.log('🔧 [PurchaseRequestForm] เริ่มสร้างรหัสใบขอซื้อ')
      
      try {
        generatingCode.value = true
        
        // ใช้ ERP_CORE.codeManager ในการสร้างรหัส (เหมือนกับ Product)
        const core = getCore()
        if (core?.codeManager) {
          console.log('✅ [PurchaseRequestForm] พบ CodeManager ใน ERP_CORE')
          
          // 🔄 Force initialize and load from database
          console.log('🔄 Forcing database pattern reload...')
          
          const accountingSettings = core.accounting
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
          console.log('🔄 Invalidating pattern cache for purchase...')
          if (core.codeManager.clearModuleCache) {
            core.codeManager.clearModuleCache('purchase')
          }
          
          // 🔄 Force reload pattern from database with detailed logging
          console.log('🔄 Reloading pattern from database...')
          const patternInfo = await core.codeManager.getPatternForModule('purchase')
          console.log('📋 Pattern loaded:', {
            source: patternInfo?.source,
            prefix: patternInfo?.pattern?.prefix || patternInfo?.prefix,
            format: patternInfo?.pattern?.format || patternInfo?.format,
            sequenceCurrent: patternInfo?.pattern?.sequence?.current || patternInfo?.sequence?.current,
            sequenceNext: patternInfo?.pattern?.sequence?.next || patternInfo?.sequence?.next,
            hasDatabase: patternInfo?.source === 'corporate_config'
          })
          
          // ⚠️ Validate pattern source
          if (patternInfo?.source !== 'corporate_config') {
            console.warn('⚠️ Pattern not from database! Source:', patternInfo?.source)
            console.warn('⚠️ Will try to load PRX pattern from database directly...')
            
            // ✅ ลองโหลด pattern PRX จาก database โดยตรง
            try {
              console.log('🔄 Trying to load PRX pattern from database...')
              
              const directPattern = await core.accounting.getCorporateConfig('number_series.purchase.purchaseRequest')
              
              if (directPattern?.config_data) {
                console.log('✅ Found PRX pattern in database:', directPattern.config_data)
                
                // ใช้ pattern จาก database เพื่อสร้างรหัส
                const currentYear = new Date().getFullYear()
                const sequence = (directPattern.config_data.sequence?.current || 0) + 1
                const paddedSequence = String(sequence).padStart(directPattern.config_data.sequence?.digits || 5, '0')
                
                const manualCode = `${directPattern.config_data.prefix || 'PRX'}${currentYear}${paddedSequence}`
                console.log('🔨 Generated manual PRX code:', manualCode)
                
                form.value.purchase_request_code = manualCode
                console.log('✅ [PurchaseRequestForm] สร้างรหัส PRX สำเร็จ:', manualCode)
                
                // Skip ไปยัง cleanup
                generatingCode.value = false
                return
              } else {
                console.warn('⚠️ No PRX pattern found in database')
              }
            } catch (directError) {
              console.warn('⚠️ Failed to load PRX pattern directly:', directError)
            }
          }
          
          // ✅ Generate code with fresh pattern
          const newCode = await core.codeManager.generateCode('purchase', null, {
            type: 'purchase_request',
            department: form.value.department,
            priority: form.value.priority,
            // ✅ บอก CodeManager ว่านี่เป็น purchase_request เพื่อให้ใช้ PRX pattern
            submodule: 'purchaseRequest'
          })
          
          if (newCode) {
            form.value.purchase_request_code = newCode
            console.log('✅ [PurchaseRequestForm] สร้างรหัสสำเร็จ:', newCode)
          } else {
            const fallbackCode = `PR${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
            form.value.purchase_request_code = fallbackCode
            console.log('🔄 [PurchaseRequestForm] ใช้รหัส fallback:', fallbackCode)
          }
        } else {
          console.log('⚠️ [PurchaseRequestForm] ไม่พบ CodeManager, สร้างรหัสแบบง่าย')
          // สร้างรหัสแบบง่าย
          const simpleCode = `PR${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
          form.value.purchase_request_code = simpleCode
          console.log('🔄 [PurchaseRequestForm] ใช้รหัสแบบง่าย:', simpleCode)
        }
        
      } catch (error) {
        console.error('❌ [PurchaseRequestForm] เกิดข้อผิดพลาดในการสร้างรหัส:', error)
        // สร้างรหัสสำรองในกรณีเกิดข้อผิดพลาด
        const emergencyCode = `PR${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
        form.value.purchase_request_code = emergencyCode
        console.log('🚨 [PurchaseRequestForm] ใช้รหัสสำรอง:', emergencyCode)
      } finally {
        generatingCode.value = false
      }
    }

    // Auto-calculate when items change
    watch(() => form.value.items, () => {
      calculateTotals()
    }, { deep: true })

    // Initialize
    onMounted(async () => {
      if (isEdit.value) {
        loadPurchaseRequest()
      } else {
        // สร้างรหัสใบขอซื้อสำหรับใบขอซื้อใหม่
        await generatePurchaseRequestCode()
      }
    })

    // Helper functions for Purchase Type
    const getDescriptionPlaceholder = () => {
      switch (form.value.purchase_type) {
        case 'stock_replenishment':
          return 'ขอซื้อเพื่อเพิ่มสินค้าในสต็อค - ระบุรายละเอียดสินค้าที่ต้องการเพิ่ม'
        case 'project_specific':
          return 'ขอซื้อสำหรับโครงการเฉพาะ - ระบุชื่อโครงการและรายละเอียด'
        case 'maintenance':
          return 'ขอซื้อเพื่อการบำรุงรักษา - ระบุอุปกรณ์ที่ต้องการซ่อมหรือเปลี่ยน'
        case 'office_supplies':
          return 'ขอซื้ออุปกรณ์สำนักงาน - ระบุรายละเอียดอุปกรณ์ที่ต้องการ'
        default:
          return 'ระบุรายละเอียดใบขอซื้อ'
      }
    }

    const isStockReplenishment = computed(() => {
      return form.value.purchase_type === 'stock_replenishment'
    })

    // Watch for purchase type changes
    watch(() => form.value.purchase_type, (newType) => {
      form.value.inventory_impact = newType === 'stock_replenishment'
      if (newType === 'stock_replenishment') {
        form.value.auto_update_stock = true
      }
    })

    // Inventory integration functions
    const checkStockLevel = async (sku) => {
      try {
        // ✅ ใช้ InventoryService แทน engine.list
        const core = getCore()
        if (core?.inventory) {
          const products = await core.inventory.getAllProducts()
          if (Array.isArray(products)) {
            const stockItem = products.find(item => 
              item.sku === sku || 
              item.product_code === sku ||
              item.code === sku
            )
            return stockItem ? {
              current_stock: stockItem.stock_quantity || stockItem.balance?.quantity || 0,
              min_stock: stockItem.min_stock_level || stockItem.min_stock || 0,
              reorder_point: stockItem.reorder_point || stockItem.reorder_level || 0
            } : null
          }
        }
      } catch (error) {
        console.log('ไม่สามารถดึงข้อมูลสต็อคได้:', error)
      }
      return null
    }

    const updateStockInfo = async (index) => {
      const item = form.value.items[index]
      if (!item.sku || !isStockReplenishment.value) return

      const stockInfo = await checkStockLevel(item.sku)
      if (stockInfo) {
        item.current_stock = stockInfo.current_stock
        item.min_stock = stockInfo.min_stock
        item.reorder_point = stockInfo.reorder_point
        
        // แนะนำจำนวนที่ควรสั่งซื้อ
        if (stockInfo.current_stock <= stockInfo.min_stock) {
          const suggestedQty = Math.max(stockInfo.reorder_point - stockInfo.current_stock, 1)
          item.quantity = suggestedQty
          calculateItemTotal(index)
        }
      }
    }

    const getStockStatus = (item) => {
      if (!isStockReplenishment.value) return ''
      if (item.current_stock <= item.min_stock) return 'low-stock'
      return 'good-stock'
    }

    const suggestReorderQuantity = (item) => {
      if (!isStockReplenishment.value) return 1
      if (item.is_new_product) return 10 // จำนวนเริ่มต้นสำหรับสินค้าใหม่
      if (item.current_stock <= item.min_stock && item.reorder_point > 0) {
        return Math.max(item.reorder_point - item.current_stock, 1)
      }
      return Math.max(item.min_stock - item.current_stock + 5, 1) // เพิ่มเผื่อ 5 ชิ้น
    }

    const setSuggestedQuantity = (index) => {
      const item = form.value.items[index]
      item.quantity = suggestReorderQuantity(item)
      calculateItemTotal(index)
    }

    // ค้นหาสินค้าในระบบ Inventory
    const searchProduct = async (index) => {
      const item = form.value.items[index]
      if (!item.sku) return

      try {
        // ✅ ใช้ InventoryService แทน engine.list
        let inventoryItems = []
        
        const core = getCore()
        if (core?.inventory) {
          inventoryItems = await core.inventory.getAllProducts()
          if (!Array.isArray(inventoryItems)) {
            inventoryItems = []
          }
        }
        
        // ✅ ลบ localStorage fallback - ใช้ API เท่านั้น
        
        console.log(`ค้นหาสินค้าใน Inventory: พบ ${inventoryItems.length} รายการ`)
        
        // กรองสินค้าที่ตรงกับคำค้นหา
        const foundProducts = inventoryItems.filter(invItem => {
          const searchTerm = item.sku.toLowerCase()
          return (
            invItem.sku?.toLowerCase().includes(searchTerm) ||
            invItem.product_code?.toLowerCase().includes(searchTerm) ||
            invItem.product_name?.toLowerCase().includes(searchTerm) ||
            invItem.name?.toLowerCase().includes(searchTerm)
          )
        })

        console.log(`พบสินค้าที่ตรงกับ "${item.sku}": ${foundProducts.length} รายการ`)

        if (foundProducts.length > 0) {
          // แสดงรายการสินค้าที่พบ
          showProductSelection(index, foundProducts)
        } else {
          // ไม่พบสินค้า แสดงตัวเลือกสร้างใหม่
          const shouldCreate = confirm(`ไม่พบสินค้า "${item.sku}" ในระบบคลัง (${inventoryItems.length} รายการ)\n\nต้องการสร้างสินค้าใหม่หรือไม่?`)
          if (shouldCreate) {
            createNewProduct(index)
          }
        }
        
      } catch (error) {
        console.error('Error searching products:', error)
        const shouldCreate = confirm(`เกิดข้อผิดพลาดในการค้นหาสินค้า: ${error.message}\n\nต้องการสร้างสินค้าใหม่หรือไม่?`)
        if (shouldCreate) {
          createNewProduct(index)
        }
      }
    }

    // แสดงตัวเลือกสินค้าที่พบ
    const showProductSelection = (index, products) => {
      console.log(`แสดงรายการสินค้าที่พบ ${products.length} รายการสำหรับ index ${index}`)
      
      // สร้าง HTML สำหรับแสดงรายการสินค้า
      const productList = products.map((product, idx) => `
        <div class="product-option" onclick="window.selectProduct(${index}, ${idx})">
          <strong>${product.sku}</strong> - ${product.product_name || 'ไม่ระบุชื่อ'}
          <br><small>สต็อค: ${product.quantity || 0} ${product.unit || 'ชิ้น'} | ขั้นต่ำ: ${product.min_stock || 0}</small>
        </div>
      `).join('')

      // เก็บรายการสินค้าไว้ใน window เพื่อใช้ในการเลือก
      window.tempProducts = products
      window.selectProduct = (itemIndex, productIndex) => {
        const selectedProduct = window.tempProducts[productIndex]
        const targetItem = form.value.items[itemIndex]
        
        targetItem.sku = selectedProduct.sku
        targetItem.product_name = selectedProduct.product_name || selectedProduct.name
        targetItem.current_stock = selectedProduct.quantity || 0
        targetItem.min_stock = selectedProduct.min_stock || 0
        targetItem.reorder_point = selectedProduct.reorder_point || selectedProduct.min_stock || 0
        targetItem.unit = selectedProduct.unit || 'ชิ้น'
        targetItem.is_new_product = false
        
        // แนะนำจำนวนถ้าสต็อคต่ำ
        if (targetItem.current_stock <= targetItem.min_stock) {
          targetItem.quantity = suggestReorderQuantity(targetItem)
          calculateItemTotal(itemIndex)
        }
        
        // ปิด modal
        document.getElementById('productSelectionModal')?.remove()
      }

      // แสดง modal สำหรับเลือกสินค้า
      const modal = document.createElement('div')
      modal.id = 'productSelectionModal'
      modal.className = 'product-modal'
      modal.innerHTML = `
        <div class="product-modal-content">
          <div class="product-modal-header">
            <h4>เลือกสินค้า</h4>
            <button onclick="this.closest('.product-modal').remove()">&times;</button>
          </div>
          <div class="product-modal-body">
            ${productList}
          </div>
          <div class="product-modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.product-modal').remove()">ยกเลิก</button>
            <button class="btn btn-success" onclick="window.createNewProductFromModal(${index})">สร้างสินค้าใหม่</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)
    }

    // สร้างสินค้าใหม่
    const createNewProduct = (index) => {
      const item = form.value.items[index]
      
      // ถ้ายังไม่มี SKU ให้สร้างอัตโนมัติ
      if (!item.sku) {
        const timestamp = Date.now().toString(36)
        item.sku = `NEW-${timestamp.toUpperCase()}`
      }
      
      // ตั้งค่าเป็นสินค้าใหม่
      item.is_new_product = true
      item.current_stock = 0
      item.min_stock = 10 // ขั้นต่ำเริ่มต้น
      item.reorder_point = 20 // จุดสั่งซื้อใหม่เริ่มต้น
      item.quantity = 10 // จำนวนเริ่มต้นสำหรับสินค้าใหม่
      
      if (!item.product_name) {
        item.product_name = `สินค้าใหม่ ${item.sku}`
      }
      
      calculateItemTotal(index)
      
      // ปิด modal ถ้ามี
      document.getElementById('productSelectionModal')?.remove()
    }

    // ฟังก์ชันสำหรับเรียกจาก modal
    window.createNewProductFromModal = (index) => {
      createNewProduct(index)
    }

    const getLowStockItemsCount = () => {
      if (!isStockReplenishment.value) return 0
      return form.value.items.filter(item => 
        !item.is_new_product &&
        item.current_stock !== undefined && 
        item.min_stock !== undefined && 
        item.current_stock <= item.min_stock
      ).length
    }

    const getNewProductsCount = () => {
      if (!isStockReplenishment.value) return 0
      return form.value.items.filter(item => item.is_new_product).length
    }

    const getTotalOrderQuantity = () => {
      if (!isStockReplenishment.value) return 0
      return form.value.items.reduce((total, item) => total + (item.quantity || 0), 0)
    }

    // Stock display helper functions
    const getStockCardClass = (item) => {
      const currentStock = item.current_stock || 0
      const minStock = item.min_stock || 0
      
      if (currentStock === 0) return 'out-of-stock'
      if (currentStock <= minStock) return 'low-stock'
      return 'good-stock'
    }

    const getStockStatusIcon = (item) => {
      const currentStock = item.current_stock || 0
      const minStock = item.min_stock || 0
      
      if (currentStock === 0) return 'fas fa-times-circle'
      if (currentStock <= minStock) return 'fas fa-exclamation-triangle'
      return 'fas fa-check-circle'
    }

    const getStockStatusText = (item) => {
      const currentStock = item.current_stock || 0
      const minStock = item.min_stock || 0
      
      if (currentStock === 0) return 'หมดสต็อค'
      if (currentStock <= minStock) return 'สต็อคต่ำ'
      return 'เพียงพอ'
    }

    const getStockValueClass = (item) => {
      const currentStock = item.current_stock || 0
      const minStock = item.min_stock || 0
      
      if (currentStock === 0) return 'text-danger'
      if (currentStock <= minStock) return 'text-warning'
      return 'text-success'
    }

    return {
      // State
      loading,
      actionType,
      lastSaved,
      isEdit,
      purchaseRequest,
      form,
      generatingCode,
      
      // Emit function
      emit,
      
      // Inventory Modal State
      showInventoryModal,
      inventoryItems,
      inventorySearch,
      showOnlyLowStock,
      filteredInventoryItems,
      
      // Computed
      isStockReplenishment,
      
      // Methods
      goBack,
      resetForm,
      addItem,
      removeItem,
      duplicateItem,
      calculateItemTotal,
      formatCurrency,
      formatNumber,
      formatDateTime,
      saveDraft,
      submitForm,
      deleteDraft,
      importFromTemplate,
      generatePurchaseRequestCode,
      getDescriptionPlaceholder,
      checkStockLevel,
      updateStockInfo,
      getStockStatus,
      suggestReorderQuantity,
      setSuggestedQuantity,
      searchProduct,
      showProductSelection,
      createNewProduct,
      getLowStockItemsCount,
      getNewProductsCount,
      getTotalOrderQuantity,
      
      // Inventory Modal Methods
      showInventorySelector,
      loadInventoryData,
      filterInventoryItems,
      selectInventoryItem,
      isLowStock,
      getStockStatusClass,
      clearInventoryData,
      forceResetInventory,
      
      // Stock Display Methods
      getStockCardClass,
      getStockStatusIcon,
      getStockStatusText,
      getStockValueClass
    }
  }
}
</script>

<style scoped>
/* Custom animations for Vue transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Stock Status Badges for complex dynamic styling */
.stock-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stock-status-badge.good-stock {
  background-color: #dcfce7;
  color: #166534;
}

.stock-status-badge.low-stock {
  background-color: #fef3c7;
  color: #a16207;
}

.stock-status-badge.out-of-stock {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Essential styles for complex layouts and animations that can't be easily replaced with Tailwind */

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}

/* Inventory Modal Layout */
.inventory-modal {
  width: 90vw;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.inventory-modal .modal-header {
  flex-shrink: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inventory-modal .modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
}

.inventory-modal .modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.inventory-modal .modal-header .close-btn:hover {
  color: #111827;
}

.inventory-modal .modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.inventory-modal .modal-footer {
  flex-shrink: 0;
}

.inventory-list {
  max-height: 400px;
  overflow-y: auto;
}

/* Stock Summary Modal */
.stock-info-section {
  margin-top: 20px;
}

.stock-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Complex Item Table Layout */
.items-header, .item-row {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.items-header {
  grid-template-columns: 120px 2fr 100px 100px 120px 100px;
  background: #f9fafb;
}

.item-row {
  grid-template-columns: 120px 2fr 100px 100px 120px 100px;
}

.items-header.stock-mode, .item-row.stock-mode {
  grid-template-columns: 100px 120px 1fr 100px 100px 100px 100px 120px 120px 100px;
}

/* Complex input group layouts */
.input-group {
  display: flex;
  align-items: stretch;
}

.input-group .form-control {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.input-group .btn-icon {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Summary Grid Layout */
.summary-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
}

@media (max-width: 1024px) {
  .summary-container {
    grid-template-columns: 1fr;
  }
  
  .items-header, .item-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .items-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
  
  .items-header, .item-row {
    min-width: 800px;
  }
  
  .items-header.stock-mode, .item-row.stock-mode {
    min-width: 1000px;
  }
  
  .stock-items-grid {
    grid-template-columns: 1fr;
  }
}
</style>