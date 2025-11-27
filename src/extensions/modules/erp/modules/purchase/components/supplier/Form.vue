<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ mode === 'edit' ? 'แก้ไขข้อมูลผู้ขาย' : 'เพิ่มผู้ขายใหม่' }}
            </h1>
            <p class="mt-1 text-gray-600">
              {{ mode === 'edit' ? 'แก้ไขและอัปเดตข้อมูลผู้ขาย' : 'เพิ่มผู้ขาย ผู้จัดหา และผู้ให้บริการใหม่' }}
            </p>
          </div>
          <div v-if="mode === 'edit'" class="text-sm text-gray-500">
            ID: {{ recordId }}
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Loading State -->
    <div v-if="!isDataReady" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center p-8">
        <i class="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
        <p class="mt-4 text-gray-600 text-lg">{{ mode === 'edit' ? 'กำลังโหลดข้อมูลผู้ขาย...' : 'กำลังเตรียมฟอร์ม...' }}</p>
        <p class="mt-2 text-gray-500 text-sm">กำลังโหลด Code Patterns และข้อมูล...</p>
      </div>
    </div>

    <!-- Form -->
    <div v-if="isMounted && isDataReady" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Basic Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            <p class="text-sm text-gray-600">ข้อมูลหลักของผู้ขาย</p>
          </div>
          
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Supplier Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                รหัสผู้ขาย <span class="text-red-500">*</span>
              </label>
              <div class="flex">
                <input
                  v-model="formData.supplier_code"
                  type="text"
                  required
                  placeholder="เช่น SUP001"
                  :class="[
                    'flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.supplier_code ? 'border-red-300' : 'border-gray-300'
                  ]"
                  @blur="validateField('supplier_code')"
                />
                <button 
                  type="button" 
                  @click="generateSupplierCode" 
                  class="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="สร้างรหัสอัตโนมัติ"
                >
                  <i class="fas fa-magic"></i>
                </button>
                <button 
                  type="button" 
                  @click="showCodeConfig" 
                  class="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-r-lg transition-colors"
                  title="ดูการตั้งค่ารหัส"
                >
                  <i class="fas fa-cog"></i>
                </button>
              </div>
              <p v-if="errors.supplier_code" class="mt-1 text-sm text-red-600">{{ errors.supplier_code }}</p>
              <div v-if="codeGenerationInfo" class="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm">
                {{ codeGenerationInfo }}
              </div>
            </div>
            
            <!-- Supplier Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ชื่อผู้ขาย <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="ชื่อบริษัท/ร้าน/ผู้ขาย"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.name ? 'border-red-300' : 'border-gray-300'
                ]"
                @blur="validateField('name')"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Supplier Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ประเภทผู้ขาย <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.supplier_type"
                @change="onTypeChange"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.supplier_type ? 'border-red-300' : 'border-gray-300'
                ]"
              >
                <option value="">เลือกประเภท...</option>
                <option value="domestic">ในประเทศ</option>
                <option value="international">ต่างประเทศ</option>
                <option value="manufacturer">ผู้ผลิต</option>
                <option value="distributor">ผู้จัดจำหน่าย</option>
                <option value="wholesaler">ขายส่ง</option>
                <option value="retailer">ขายปลีก</option>
                <option value="service">ผู้ให้บริการ</option>
                <option value="contractor">ผู้รับเหมา</option>
                <option value="individual">บุคคลธรรมดา</option>
                <option value="government">หน่วยงานราชการ</option>
              </select>
              <p v-if="errors.supplier_type" class="mt-1 text-sm text-red-600">{{ errors.supplier_type }}</p>
              <p v-if="codePreview" class="mt-1 text-xs text-gray-500">รูปแบบรหัส: {{ codePreview }}</p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">ใช้งานอยู่</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="suspended">ระงับการใช้งาน</option>
                <option value="blocked">ถูกบล็อก</option>
                <option value="blacklisted">ขึ้นบัญชีดำ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tax & Business Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลทางภาษีและธุรกิจ</h3>
            <p class="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษีและข้อมูลธุรกิจ</p>
          </div>
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tax ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
              <input
                v-model="formData.tax_id"
                type="text"
                placeholder="1234567890123"
                maxlength="13"
                @input="validateTaxId"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.tax_id ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.tax_id" class="mt-1 text-sm text-red-600">{{ errors.tax_id }}</p>
              <p v-else-if="formData.tax_id && formData.tax_id.length === 13" class="mt-1 text-sm text-green-600">
                <i class="fas fa-check"></i> รูปแบบถูกต้อง
              </p>
            </div>

            <!-- Business Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เลขทะเบียนนิติบุคคล</label>
              <input
                v-model="formData.business_number"
                type="text"
                placeholder="0123456789012"
                maxlength="13"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Website -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">เว็บไซต์</label>
              <input
                v-model="formData.website"
                type="url"
                placeholder="https://example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Contact Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลติดต่อ</h3>
            <p class="text-sm text-gray-600">ข้อมูลสำหรับติดต่อผู้ขาย</p>
          </div>
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Person -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อ</label>
              <input
                v-model="formData.contact_person"
                type="text"
                placeholder="ชื่อผู้ติดต่อหลัก"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="02-xxx-xxxx, 08x-xxx-xxxx"
                @input="validatePhone"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>

            <!-- Email -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="contact@example.com"
                @input="validateEmail"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.email ? 'border-red-300' : 'border-gray-300'
                ]"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
              <p v-else-if="formData.email && isValidEmail(formData.email)" class="mt-1 text-sm text-green-600">
                <i class="fas fa-check"></i> รูปแบบถูกต้อง
              </p>
            </div>
          </div>
        </div>

        <!-- Address Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ที่อยู่</h3>
            <p class="text-sm text-gray-600">ที่อยู่สำหรับจัดส่งเอกสารและสินค้า</p>
          </div>
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
              <textarea
                v-model="formData.address"
                rows="3"
                placeholder="ที่อยู่สำนักงาน/ร้าน/บ้าน"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.address ? 'border-red-300' : 'border-gray-300'
                ]"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
            </div>

            <!-- Province -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
              <input
                v-model="formData.province"
                type="text"
                placeholder="จังหวัด"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Postal Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
              <input
                v-model="formData.postal_code"
                type="text"
                placeholder="12345"
                maxlength="5"
                pattern="[0-9]{5}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Country -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">ประเทศ</label>
              <select
                v-model="formData.country"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ไทย">ไทย</option>
                <option value="สหรัฐอเมริกา">สหรัฐอเมริกา</option>
                <option value="จีน">จีน</option>
                <option value="ญี่ปุ่น">ญี่ปุ่น</option>
                <option value="เกาหลีใต้">เกาหลีใต้</option>
                <option value="สิงคโปร์">สิงคโปร์</option>
                <option value="มาเลเซีย">มาเลเซีย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Business Terms Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">เงื่อนไขทางธุรกิจ</h3>
            <p class="text-sm text-gray-600">เงื่อนไขการชำระเงินและเครดิต</p>
          </div>
          <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Payment Terms -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เงื่อนไขการชำระเงิน</label>
              <select
                v-model="formData.payment_terms"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cod">เงินสดเมื่อได้รับสินค้า</option>
                <option value="net_7">เครดิต 7 วัน</option>
                <option value="net_15">เครดิต 15 วัน</option>
                <option value="net_30" selected>เครดิต 30 วัน</option>
                <option value="net_45">เครดิต 45 วัน</option>
                <option value="net_60">เครดิต 60 วัน</option>
                <option value="net_90">เครดิต 90 วัน</option>
                <option value="advance">จ่ายล่วงหน้า</option>
                <option value="installment">ผ่อนชำระ</option>
              </select>
            </div>

            <!-- Credit Limit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">วงเงินเครดิต (บาท)</label>
              <input
                v-model.number="formData.credit_limit"
                type="number"
                placeholder="0"
                min="0"
                step="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Currency -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สกุลเงิน</label>
              <select
                v-model="formData.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="THB">บาทไทย (THB)</option>
                <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                <option value="EUR">ยูโร (EUR)</option>
                <option value="JPY">เยน (JPY)</option>
                <option value="CNY">หยวน (CNY)</option>
                <option value="SGD">ดอลลาร์สิงคโปร์ (SGD)</option>
                <option value="MYR">ริงกิต (MYR)</option>
              </select>
            </div>

            <!-- Lead Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาส่งมอบ (วัน)</label>
              <input
                v-model.number="formData.lead_time_days"
                type="number"
                placeholder="7"
                min="1"
                max="365"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Additional Information Card -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h3>
            <p class="text-sm text-gray-600">หมายเหตุและการตั้งค่าอื่นๆ</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
              <textarea
                v-model="formData.notes"
                rows="4"
                placeholder="บันทึกเพิ่มเติมเกี่ยวกับผู้ขาย..."
                maxlength="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">{{ formData.notes?.length || 0 }}/1000 ตัวอักษร</p>
            </div>

            <!-- Toggles -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label class="text-sm font-medium text-gray-700">เปิดใช้งาน</label>
                  <p class="text-xs text-gray-500">เปิด/ปิดการใช้งานผู้ขาย</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formData.is_active" type="checkbox" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label class="text-sm font-medium text-gray-700">ต้องใช้ PO</label>
                  <p class="text-xs text-gray-500">บังคับให้มี Purchase Order</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formData.requires_po" type="checkbox" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">การประเมิน</label>
              <div class="flex items-center space-x-3">
                <div class="flex">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="setRating(star)"
                    :class="[
                      'text-2xl',
                      star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                    ]"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>
                <span class="text-sm text-gray-600">{{ getRatingText(formData.rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="loading" class="text-center p-4">
          <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
          <p class="mt-2 text-gray-600">{{ mode === 'edit' ? 'กำลังโหลดข้อมูล...' : 'กำลังบันทึกข้อมูล...' }}</p>
        </div>
        <!-- Removed error and successMessage - using toast instead -->
        <div v-show="formData.supplier_type && !isOriginalType" class="p-4 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg">
          <strong>แจ้งเตือน!</strong> ประเภทผู้ขายถูกแก้ไขให้ถูกต้องแล้ว กรุณาตรวจสอบความถูกต้อง
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
          <router-link
            to="/purchase/suppliers"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ยกเลิก
          </router-link>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="saveDraft"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              :disabled="loading"
            >
              <i class="fas fa-save mr-2"></i>
              บันทึกร่าง
            </button>
            
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isFormValid || loading"
              :title="!isFormValid ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : ''"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              {{ loading ? (mode === 'edit' ? 'กำลังอัปเดต...' : 'กำลังสร้าง...') : (mode === 'edit' ? 'อัปเดตข้อมูล' : 'สร้างผู้ขาย') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/**
 * ✅ COMPLETE SUPPLIER FORM - ฟอร์มแบบเต็มสำหรับจัดการข้อมูลผู้ขาย
 * รองรับการสร้างและแก้ไขข้อมูลผู้ขายแบบครบครัน
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, inject, getCurrentInstance } from 'vue'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'SupplierFormComplete',
  components: {
    ErpBreadcrumb
  },
  props: {
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'edit'].includes(value)
    },
    recordId: {
      type: String,
      default: null
    }
  },
  emits: ['saved', 'cancel'],
  inject: ['apiRequest'],
  setup(props, { emit }) {
    // ✅ Inject services
    const apiRequest = inject('apiRequest')
    
    // ✅ Use purchaseService for supplier operations
    const purchaseService = window.ERP_CORE?.purchase
    
    if (!purchaseService) {
      console.error('[Supplier Form] ❌ purchaseService not available in window.ERP_CORE')
    }
    
    // ✅ State
    const loading = ref(false)
    const isMounted = ref(false) // Track if component is still mounted
    const isDataReady = ref(false) // Track if all initial data is loaded
    // Removed error and successMessage - using toast notifications instead
    const errors = ref({})
    const originalType = ref(null) // เก็บค่าเดิมของ type
    const codePreview = ref('') // แสดงตัวอย่างรหัสที่จะได้รับ
    const codeGenerationInfo = ref('') // แสดงข้อมูลการสร้างรหัส
    const lastGenerationSource = ref('') // เก็บ source ล่าสุด
    
    // Breadcrumb navigation
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Purchase Module', path: '/purchase', icon: 'fas fa-shopping-cart' },
      { name: 'Suppliers Management', path: '/purchase/suppliers', icon: 'fas fa-users' },
      { name: props.mode === 'edit' ? 'Edit Supplier' : 'Add New Supplier' }
    ])
    
    // ฟังก์ชันแปลง source เป็นชื่อที่แสดงผู้ใช้
    const getSourceDisplayName = (source) => {
      const sourceNames = {
        'erp_core': '🏢 ERP Core Configuration',
        'loaded_default': '📋 Module Configuration (Auto-loaded)',
        'hardcoded_default': '🔧 System Default (Fallback)',
        'module_config': '📦 Direct Module Config',
        'fallback': '⚠️ Emergency Fallback',
        'dynamic_import': '📁 การโหลดจาก Config ไฟล์',
        'hardcoded': '⚙️ ค่าเริ่มต้นจากระบบ', 
        'cache': '🗄️ ค่าจากแคช',
        'unknown': '❓ ไม่ทราบแหล่งที่มา'
      }
      return sourceNames[source] || source
    }

    // Helper function สำหรับอธิบาย source
    const getSourceExplanation = (source) => {
      const explanations = {
        'erp_core': 'ดึงจาก ERP_CORE.masterdata (สูงสุด)',
        'loaded_default': 'ดึงจาก /masterdata/supplier/data.js (ปานกลาง) ✅',
        'hardcoded_default': 'ใช้ pattern ที่กำหนดไว้ในระบบ (ต่ำสุด)',
        'module_config': 'เข้าถึง config โดยตรง',
        'fallback': 'ระบบสำรองฉุกเฉิน',
        'dynamic_import': 'โหลดจาก config ไฟล์',
        'hardcoded': 'ค่าเริ่มต้นจากระบบ',
        'cache': 'ค่าจากแคช',
        'unknown': 'ไม่ทราบแหล่งที่มา'
      }
      return explanations[source] || 'ไม่ทราบแหล่งที่มา'
    }
    
    // ✅ Form Data - Complete supplier information
    const formData = reactive({
      // Basic Information
      supplier_code: '',
      name: '',
      supplier_type: 'domestic',
      status: 'active',
      
      // Tax & Business
      tax_id: '',
      business_number: '',
      website: '',
      
      // Contact Information
      contact_person: '',
      phone: '',
      email: '',
      
      // Address Information
      address: '',
      province: '',
      postal_code: '',
      country: 'ไทย',
      
      // Business Terms
      payment_terms: 'net_30',
      credit_limit: 0,
      currency: 'THB',
      lead_time_days: 7,
      
      // Additional Information
      notes: '',
      is_active: true,
      requires_po: true,
      rating: 0,
      
      // System fields
      created_date: new Date(),
      updated_date: new Date(),
      version: 1
    })

    // ✅ Computed Properties
    const canSubmit = computed(() => {
      return formData.supplier_code.trim() && formData.name.trim() && !loading.value
    })

    const isFormValid = computed(() => {
      const valid = formData.supplier_code &&
             formData.name &&
             formData.supplier_type &&
             Object.keys(errors.value).length === 0
      
      console.log('[Supplier Form] isFormValid check:', {
        hasCode: !!formData.supplier_code,
        hasName: !!formData.name,
        hasType: !!formData.supplier_type,
        errorCount: Object.keys(errors.value).length,
        isValid: valid
      })
      
      return valid
    })

    const isOriginalType = computed(() => {
      return !originalType.value || originalType.value === formData.supplier_type
    })

    // ✅ Validation Methods
    const validateField = (fieldName) => {
      const value = formData[fieldName]
      let error = null

      // Basic validation rules
      switch (fieldName) {
        case 'supplier_code':
          if (!value || value.trim() === '') {
            error = 'รหัสผู้ขายจำเป็นต้องระบุ'
          } else if (value.length > 20) {
            error = 'รหัสผู้ขายต้องไม่เกิน 20 ตัวอักษร'
          }
          break
        case 'name':
          if (!value || value.trim() === '') {
            error = 'ชื่อผู้ขายจำเป็นต้องระบุ'
          } else if (value.length > 200) {
            error = 'ชื่อผู้ขายต้องไม่เกิน 200 ตัวอักษร'
          }
          break
        case 'supplier_type':
          if (!value || value === '') {
            error = 'ประเภทผู้ขายจำเป็นต้องระบุ'
          }
          break
        case 'description':
          if (value && value.length > 500) {
            error = 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร'
          }
          break
      }

      // Set or clear error
      if (error) {
        errors.value[fieldName] = error
      } else {
        delete errors.value[fieldName]
      }
    }

    const validateTaxId = () => {
      errors.value.tax_id = null
      
      if (formData.tax_id && formData.tax_id.length > 0) {
        if (formData.tax_id.length !== 13 || !/^\d{13}$/.test(formData.tax_id)) {
          errors.value.tax_id = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก'
        }
      }
    }

    const validatePhone = () => {
      errors.value.phone = null
      
      if (formData.phone && formData.phone.length > 0) {
        const phoneRegex = /^[\d\s\-+()]+$/
        if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 9) {
          errors.value.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
        }
      }
    }

    const validateEmail = () => {
      errors.value.email = null
      
      if (formData.email && formData.email.length > 0) {
        if (!isValidEmail(formData.email)) {
          errors.value.email = 'รูปแบบอีเมลไม่ถูกต้อง'
        }
      }
    }

    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // ✅ Utility Methods - รองรับ Module-Specific Code Config
    const generateSupplierCode = async () => {
      // ✅ ป้องกันการ generate code ใน edit mode
      if (props.mode === 'edit') {
        console.log('⚠️ Cannot generate code in edit mode')
        if (window.$toast) {
          window.$toast.warning('ไม่สามารถสร้างรหัสใหม่ในโหมดแก้ไขได้')
        }
        return
      }
      
      try {
        console.log('[Supplier Form] 🔢 Generating supplier code with module-specific config...')
        
        // 🔄 Force clear any existing cache
        if (window.ERP_CORE?.codeManager?.clearModuleCache) {
          console.log('[Supplier Form] 🗑️ Clearing CodeManager cache...')
          window.ERP_CORE.codeManager.clearModuleCache('supplier')
        }
        
        // 🔄 Force reload CodeManager patterns
        if (window.ERP_CORE?.codeManager?.initialize) {
          console.log('[Supplier Form] 🔄 Force reinitializing CodeManager...')
          await window.ERP_CORE.codeManager.initialize()
        }
        
        // Strategy 1: ใช้ Centralized Code Manager (เหมือน Products)
        if (window.ERP_CORE?.codeManager) {
          console.log('[Supplier Form] 🏢 Using centralized code manager')
          
          // 🔍 Debug: ตรวจสอบ ERP_CORE masterdata
          console.log('[Supplier Form] 🔍 ERP_CORE status:', {
            hasERP_CORE: !!window.ERP_CORE,
            hasMasterdata: !!window.ERP_CORE?.masterdata,
            hasSupplier: !!window.ERP_CORE?.masterdata?.supplier,
            supplierKeys: window.ERP_CORE?.masterdata?.supplier ? Object.keys(window.ERP_CORE.masterdata.supplier) : [],
            hasSupplierConfig: !!window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
          })
          
          if (window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG) {
            const config = window.ERP_CORE.masterdata.supplier.SUPPLIER_CODE_CONFIG
            console.log('[Supplier Form] ✅ Found SUPPLIER_CODE_CONFIG in ERP_CORE:', config)
            console.log('[Supplier Form] 🔍 Prefix:', config.patterns?.default?.prefix)
          } else {
            console.warn('[Supplier Form] ⚠️ SUPPLIER_CODE_CONFIG not found in ERP_CORE.masterdata.supplier')
            console.log('[Supplier Form] 🔍 Available masterdata:', window.ERP_CORE?.masterdata ? Object.keys(window.ERP_CORE.masterdata) : 'none')
          }
          
          // Debug: ตรวจสอบสถานะของ CodeManager
          console.log('[Supplier Form] 🔍 CodeManager debug:', {
            initialized: window.ERP_CORE.codeManager.initialized,
            patternCount: window.ERP_CORE.codeManager.patterns?.size || 0,
            availablePatterns: window.ERP_CORE.codeManager.patterns ? 
              Array.from(window.ERP_CORE.codeManager.patterns.keys()) : []
          })
          
          // ส่ง options เพิ่มเติม - Simple configuration
          const options = {
            cacheMaxAge: 30000, // 30 วินาที
            recordLimit: 500    // จำกัดจำนวนที่ดึงมาเช็ค
          }
          
          console.log('[Supplier Form] 📋 Code generation options:', options)
          
          const code = await window.ERP_CORE.codeManager.generateCode('supplier', null, options)
          
          // ดึงข้อมูล pattern source และรายละเอียด
          const lastGenerated = window.ERP_CORE.codeManager.cache?.get('supplier_last_generated')
          const patternSource = lastGenerated?.source || 'unknown'
          const patternInfo = await window.ERP_CORE.codeManager.getPatternForModule('supplier')
          
          formData.supplier_code = code
          lastGenerationSource.value = patternSource // เก็บ source ล่าสุด
          codeGenerationInfo.value = `ใช้ ${getSourceDisplayName(patternSource)} - รหัส: ${code}`
          
          console.log(`[Supplier Form] ✅ Generated supplier code:`, {
            code,
            source: patternSource,
            pattern: patternInfo.pattern,
            configPath: patternInfo.source,
            sourceExplanation: getSourceExplanation(patternSource)
          })
          return
        }
        
        // Strategy 2: ใช้ Module Config โดยตรง
        if (window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG) {
          console.log('[Supplier Form] 📋 Using direct module config')
          const code = await generateFromModuleConfig()
          formData.supplier_code = code
          codeGenerationInfo.value = 'ใช้ Module Configuration โดยตรง'
          console.log(`[Supplier Form] ✅ Generated supplier code (module config): ${code}`)
          return
        }
        
        // Fallback: ใช้ระบบเดิม
        console.warn('[Supplier Form] ⚠️ All advanced methods unavailable, using fallback')
        const currentYear = new Date().getFullYear()
        const timestamp = Date.now().toString().slice(-4)
        formData.supplier_code = `SUP${currentYear}${timestamp}`
        codeGenerationInfo.value = 'ใช้ระบบสำรอง (Fallback)'
        
      } catch (error) {
        console.error('[Supplier Form] ❌ Error generating supplier code:', error)
        
        // Final fallback
        const timestamp = Date.now().toString().slice(-8)
        formData.supplier_code = `SUP${timestamp}`
        codeGenerationInfo.value = 'ใช้ระบบสำรองสุดท้าย (Final Fallback)'
        console.log(`[Supplier Form] 🔄 Using final fallback code: ${formData.supplier_code}`)
      }
    }



    // ✅ สร้างรหัสจาก Module Config โดยตรง (Simple SUP only)
    const generateFromModuleConfig = async () => {
      try {
        const config = window.ERP_CORE.masterdata.supplier.SUPPLIER_CODE_CONFIG
        const pattern = config.patterns.default // ใช้ default pattern เสมอ (SUP)
        
        console.log('[Supplier Form] Using simple SUP pattern')
        
        // สร้างรหัสตาม pattern
        return await buildCodeFromPattern(pattern)
        
      } catch (error) {
        console.error('[Supplier Form] Error generating from module config:', error)
        throw error
      }
    }

    // ✅ สร้างรหัสจาก pattern
    const buildCodeFromPattern = async (pattern) => {
      try {
        const now = new Date()
        let code = ''
        
        // เพิ่ม prefix
        code += pattern.prefix
        
        // เพิ่มปีถ้าจำเป็น
        if (pattern.year) {
          code += now.getFullYear().toString()
        }
        
        // เพิ่มเดือนถ้าจำเป็น
        if (pattern.month) {
          code += String(now.getMonth() + 1).padStart(2, '0')
        }
        
        // คำนวณ sequence number
        const sequence = await calculateNextSequence(pattern)
        code += String(sequence).padStart(pattern.sequence.digits, '0')
        
        return code
        
      } catch (error) {
        console.error('[Supplier Form] Error building code from pattern:', error)
        throw error
      }
    }

    // ✅ คำนวณ sequence number ถัดไป
    const calculateNextSequence = async (pattern) => {
      try {
        // ดึงรายการ supplier ที่มีอยู่
        const existingSuppliers = await purchaseService.getAllSuppliers()
        const suppliers = existingSuppliers.success ? existingSuppliers.data : []
        
        // หา sequence สูงสุดจากรหัสที่มีอยู่
        let maxSequence = 0
        const now = new Date()
        const yearStr = now.getFullYear().toString()
        const monthStr = String(now.getMonth() + 1).padStart(2, '0')
        
        suppliers.forEach(supplier => {
          const code = supplier.supplier_code || ''
          
          // สร้าง regex pattern สำหรับค้นหา
          let regexPattern = `^${pattern.prefix}`
          if (pattern.year) regexPattern += yearStr
          if (pattern.month) regexPattern += monthStr
          regexPattern += `(\\d{${pattern.sequence.digits}})$`
          
          const match = code.match(new RegExp(regexPattern))
          if (match) {
            const sequence = parseInt(match[1], 10)
            if (sequence > maxSequence) {
              maxSequence = sequence
            }
          }
        })
        
        // ตรวจสอบการรีเซ็ต
        if (pattern.sequence.resetOnYearChange && shouldResetSequence(pattern)) {
          maxSequence = 0
        }
        
        return maxSequence + 1
        
      } catch (error) {
        console.error('[Supplier Form] Error calculating sequence:', error)
        return 1
      }
    }

    // ✅ ตรวจสอบว่าควรรีเซ็ต sequence หรือไม่
    // ✅ ตรวจสอบว่าควรรีเซ็ต sequence หรือไม่
    const shouldResetSequence = async () => {
      // ✅ ใช้ API แทน localStorage
      const now = new Date()
      const currentYear = now.getFullYear()
      
      try {
        // ดึงข้อมูลจาก system_config ผ่าน API
        const result = await apiRequest.apiCall('/api/system-config/supplier_code_reset_year', 'GET')
        const lastResetYear = result.success && result.data?.value ? parseInt(result.data.value) : 0
        
        if (lastResetYear !== currentYear) {
          // อัปเดตปีใน database
          await apiRequest.apiCall('/api/system-config/supplier_code_reset_year', 'POST', {
            value: currentYear.toString()
          })
          return true
        }
        
        return false
      } catch (error) {
        console.warn('[Supplier Form] ⚠️ Failed to check reset year from API, using current year:', error)
        // Fallback: ถือว่าไม่ต้อง reset
        return false
      }
    }

    // ✅ จัดการเมื่อเปลี่ยน type
    const onTypeChange = async () => {
      console.log('[Supplier Form] Type changed to:', formData.supplier_type)
      
      // อัปเดตตัวอย่างรหัส
      await updateCodePreview()
      
      // ถ้าใช้ type-based code และกำลังสร้างใหม่
      if (props.mode === 'create') {
        console.log('[Supplier Form] Auto-generating new code for type change')
        await generateSupplierCode()
      }
    }

    // ✅ อัปเดตตัวอย่างรหัส
    const updateCodePreview = async () => {
      // ป้องกันการ update หลัง component ถูก unmount
      if (!isMounted.value) {
        console.log('[Supplier Form] ⚠️ Skipping updateCodePreview - component unmounted')
        return
      }
      
      try {
        const config = window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
        if (!config) {
          codePreview.value = ''
          return
        }

        const useTypeBasedCodes = config.settings?.useTypeBasedCodes || false
        let pattern

        if (useTypeBasedCodes && formData.supplier_type && config.patterns.byType?.[formData.supplier_type]) {
          pattern = config.patterns.byType[formData.supplier_type]
          console.log(`[Supplier Form] Using type-based pattern for: ${formData.supplier_type}`)
        } else {
          pattern = config.patterns.default
          console.log('[Supplier Form] Using default pattern')
        }

        // สร้างตัวอย่าง
        const now = new Date()
        let preview = pattern.prefix
        
        if (pattern.year) {
          preview += now.getFullYear().toString()
        }
        
        if (pattern.month) {
          preview += String(now.getMonth() + 1).padStart(2, '0')
        }
        
        preview += '0'.repeat(pattern.sequence.digits - 1) + '1' // ตัวอย่าง sequence = 1
        
        codePreview.value = preview
        
        // อัปเดตข้อมูลการตั้งค่า
        if (codeGenerationInfo.value === '') {
          if (useTypeBasedCodes && formData.supplier_type && config.patterns.byType?.[formData.supplier_type]) {
            codeGenerationInfo.value = `รองรับรหัสตามประเภท: ${formData.supplier_type}`
          } else {
            codeGenerationInfo.value = 'ใช้รูปแบบมาตรฐาน'
          }
        }
        
      } catch (error) {
        console.warn('[Supplier Form] Error updating code preview:', error)
        codeGenerationInfo.value = ''
        codePreview.value = ''
      }
    }

    // ✅ แสดงการตั้งค่า Code Configuration
    const showCodeConfig = () => {
      try {
        console.log('[Supplier Form] 🔍 Checking available code configurations...')
        
        // เช็ค CodeManager patterns
        const codeManager = window.ERP_CORE?.codeManager
        const hasCodeManager = codeManager && codeManager.patterns?.has('supplier')
        
        // เช็ค ERP_CORE masterdata config
        const config = window.ERP_CORE?.masterdata?.supplier?.SUPPLIER_CODE_CONFIG
        const hasDirectConfig = !!config
        
        console.log('[Supplier Form] Config availability:', {
          codeManager: hasCodeManager,
          directConfig: hasDirectConfig,
          totalPatterns: codeManager?.patterns?.size || 0
        })
        
        if (!hasCodeManager && !hasDirectConfig) {
          codeGenerationInfo.value = 'ไม่พบการตั้งค่า Code Configuration'
          if (window.$toast) {
            window.$toast.warning('ไม่พบการตั้งค่า Code Configuration สำหรับ Supplier')
          }
          return
        }

        // แสดงข้อมูลจาก CodeManager ก่อน (prioritize)
        if (hasCodeManager) {
          const managerPattern = codeManager.patterns.get('supplier')
          codeGenerationInfo.value = `ใช้ Centralized Code Manager: ${managerPattern.pattern || managerPattern.format || 'N/A'}`
          
          const managerDetails = [
            `แหล่งที่มา: Centralized Code Manager`,
            `รูปแบบ: ${managerPattern.pattern || managerPattern.format || 'N/A'}`,
            `โมดูล: ${managerPattern.module || 'supplier'}`,
            `สถานะ: ${managerPattern.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`,
            `ตัวอย่าง: ${managerPattern.example || codePreview.value}`
          ]
          
          if (window.$toast) {
            window.$toast.info(managerDetails.join('\n'))
          }
          return
        }
        
        // แสดงข้อมูลจาก direct config
        if (hasDirectConfig) {
          const pattern = config.patterns.default
          codeGenerationInfo.value = `ใช้รูปแบบ SUP: ${pattern.format.replace(/\{(\w+)\}/g, '[$1]')}`

          // แสดงรายละเอียดใน toast
          const details = [
            `แหล่งที่มา: ERP_CORE Masterdata`,
            `รูปแบบ: ${pattern.format}`,
            `จำนวนหลัก: ${pattern.sequence.digits}`,
            `รีเซ็ตรายปี: ${pattern.sequence.resetOnYearChange ? 'ใช่' : 'ไม่'}`,
            `ตัวอย่าง: ${codePreview.value}`
          ].join('\n')

          if (window.$toast) {
            window.$toast.info(`การตั้งค่ารหัสผู้ขาย:\n${details}`)
          } else {
            alert(`การตั้งค่ารหัสผู้ขาย:\n${details}`)
          }
        }

      } catch (error) {
        console.error('[Supplier Form] Error showing code config:', error)
        codeGenerationInfo.value = 'เกิดข้อผิดพลาดในการแสดงการตั้งค่า'
      }
    }

    const setRating = (rating) => {
      formData.rating = rating
    }

    const getRatingText = (rating) => {
      const texts = {
        0: 'ยังไม่ได้ประเมิน',
        1: 'แย่',
        2: 'พอใช้',
        3: 'ปานกลาง', 
        4: 'ดี',
        5: 'ดีเยี่ยม'
      }
      return texts[rating] || 'ยังไม่ได้ประเมิน'
    }

    // ✅ Validate Supplier Type - แก้ไขค่า type ที่ไม่ถูกต้อง
    const validateSupplierType = (type) => {
      console.log('[Supplier Form] validateSupplierType input:', type, typeof type)
      
      const validTypes = ['domestic', 'international', 'manufacturer', 'distributor', 'wholesaler', 'retailer', 'service', 'contractor', 'individual', 'government']
      
      // ตรวจสอบว่าค่าที่ได้มาเป็น null, undefined หรือ empty string
      if (!type || type === '' || type === null || type === undefined) {
        console.log('[Supplier Form] 🔧 Empty/null type detected, using default: domestic')
        return 'domestic'
      }
      
      // ถ้าค่าที่ได้มาถูกต้องแล้ว ให้คืนค่าเดิม
      if (validTypes.includes(type)) {
        console.log('[Supplier Form] ✅ Valid type:', type)
        return type
      }
      
      // แก้ไขค่าที่ผิด
      const typeMapping = {
        'supplier': 'domestic',     // แก้ไข "supplier" เป็น "domestic"
        'vendor': 'domestic',       // แก้ไข "vendor" เป็น "domestic"  
        'company': 'domestic',      // แก้ไข "company" เป็น "domestic"
        'business': 'domestic',     // แก้ไข "business" เป็น "domestic"
        'local': 'domestic',        // แก้ไข "local" เป็น "domestic"
        'foreign': 'international', // แก้ไข "foreign" เป็น "international"
        'overseas': 'international' // แก้ไข "overseas" เป็น "international"
      }
      
      const correctedType = typeMapping[type] || 'domestic'
      
      console.log(`[Supplier Form] 🔧 Corrected supplier type: "${type}" → "${correctedType}"`)
      
      return correctedType
    }

    // ✅ Load existing data for edit mode
    const loadData = async () => {
      if (props.mode !== 'edit' || !props.recordId) {
        console.log('[Supplier Form] Skip loading - mode:', props.mode, 'recordId:', props.recordId)
        return
      }
      
      // ป้องกันการโหลดหลัง component ถูก unmount
      if (!isMounted.value) {
        console.log('[Supplier Form] ⚠️ Skipping loadData - component unmounted')
        return
      }

      loading.value = true

      try {
        console.log('[Supplier Form] 🔍 Loading data for ID:', props.recordId)
        
        // ตรวจสอบ purchaseService
        if (!purchaseService) {
          throw new Error('purchaseService not available')
        }

        const result = await purchaseService.getSupplier(props.recordId)
        
        console.log('[Supplier Form] 📊 Raw result:', result)
        
        // ✅ Service returns data directly, not wrapped
        if (result && result._id) {
          console.log('[Supplier Form] ✅ Successfully loaded data:', result)
          
          // 🔧 Map ข้อมูลทั้งหมดเข้า form - รองรับทั้ง snake_case และ camelCase
          const loadedData = {
            supplier_code: result.supplier_code || result.supplierCode || '',
            name: result.name || '',
            supplier_type: validateSupplierType(result.supplier_type || result.type) || 'domestic',
            status: result.status || 'active',
            tax_id: result.tax_id || result.taxId || '',
            business_number: result.business_number || result.businessNumber || '',
            website: result.website || '',
            contact_person: result.contact_person || result.contactPerson || '',
            phone: result.phone || '',
            email: result.email || '',
            address: result.address || '',
            province: result.province || '',
            postal_code: result.postal_code || result.postalCode || '',
            country: result.country || 'ไทย',
            payment_terms: result.payment_terms || result.paymentTerms || 'net_30',
            credit_limit: result.credit_limit || result.creditLimit || 0,
            currency: result.currency || 'THB',
            lead_time_days: result.lead_time_days || result.leadTimeDays || 7,
            notes: result.notes || '',
            is_active: result.is_active !== undefined ? result.is_active : (result.isActive !== undefined ? result.isActive : true),
            requires_po: result.requires_po !== undefined ? result.requires_po : (result.requiresPo !== undefined ? result.requiresPo : true),
            rating: result.rating || 0,
            created_date: result.created_date || result.createdDate || new Date(),
            updated_date: new Date(),
            version: result.version || 1
          }

          console.log('[Supplier Form] 🎯 Mapped data:', loadedData)
          
          // ป้องกันการ update หลัง unmount
          if (!isMounted.value) {
            console.log('[Supplier Form] ⚠️ Skipping data assignment - component unmounted')
            return
          }
          
          // เช็คและแจ้งเตือนถ้า type ถูกแก้ไข
          originalType.value = result.type // เก็บค่าเดิม
          if (result.type && result.type !== loadedData.supplier_type) {
            console.warn(`[Supplier Form] ⚠️ Type corrected: "${result.type}" → "${loadedData.supplier_type}"`)
            if (window.$toast) {
              window.$toast.warning(`ประเภทผู้ขายถูกแก้ไขจาก "${result.type}" เป็น "${loadedData.supplier_type}"`)
            }
          }
          
          // Clear form และ assign ข้อมูลใหม่ (only if still mounted)
          if (isMounted.value) {
            Object.keys(formData).forEach(key => {
              if (Object.prototype.hasOwnProperty.call(loadedData, key)) {
                formData[key] = loadedData[key]
              }
            })
            
            console.log('[Supplier Form] 📝 Form data after assignment:', { ...formData })
          }
          
        } else {
          console.error('[Supplier Form] ❌ Failed to load data:', result)
          throw new Error('ไม่พบข้อมูลผู้ขาย')
        }
      } catch (err) {
        console.error('[Supplier Form] 💥 Load error:', err)
        
        // แสดง error toast
        if (window.$toast) {
          window.$toast.error('ไม่สามารถโหลดข้อมูลผู้ขายได้: ' + err.message)
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Submit Form
    const submitForm = async () => {
      console.log('[Supplier Form] Submitting form:', { mode: props.mode, data: formData })
      
      // Clear previous validation errors
      errors.value = {}
      
      // Validate all fields
      validateTaxId()
      validatePhone()
      validateEmail()
      
      // Check for validation errors
      if (Object.keys(errors.value).some(key => errors.value[key])) {
        if (window.$toast) {
          window.$toast.error('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง')
        }
        return
      }
      
      // ✅ ไม่ต้องตั้ง loading = true เพื่อป้องกัน DOM error
      // loading.value = true

      try {
        // Debug log ก่อนเตรียมข้อมูล
        console.log('[Supplier Form] Raw formData.supplier_type:', formData.supplier_type)
        console.log('[Supplier Form] Full formData:', JSON.stringify(formData, null, 2))
        
        // Prepare clean data
        const validatedType = validateSupplierType(formData.supplier_type)
        console.log('[Supplier Form] Validated type:', validatedType)
        
        const submitData = {
          supplier_code: formData.supplier_code.trim(),
          name: formData.name.trim(),
          type: validatedType, // แก้ไข type ให้ถูกต้อง
          status: formData.status,
          tax_id: formData.tax_id ? formData.tax_id.trim() : '',
          business_number: formData.business_number ? formData.business_number.trim() : '',
          website: formData.website ? formData.website.trim() : '',
          contact_person: formData.contact_person ? formData.contact_person.trim() : '',
          phone: formData.phone ? formData.phone.trim() : '',
          email: formData.email ? formData.email.trim() : '',
          address: formData.address ? formData.address.trim() : '',
          province: formData.province ? formData.province.trim() : '',
          postal_code: formData.postal_code ? formData.postal_code.trim() : '',
          country: formData.country ? formData.country.trim() : 'ไทย',
          payment_terms: formData.payment_terms,
          credit_limit: formData.credit_limit || 0,
          currency: formData.currency || 'THB',
          lead_time_days: formData.lead_time_days || 7,
          notes: formData.notes ? formData.notes.trim() : '',
          is_active: formData.is_active,
          requires_po: formData.requires_po,
          rating: formData.rating || 0
        }

        // Basic validation
        if (!submitData.supplier_code) {
          throw new Error('กรุณาระบุรหัสผู้ขาย')
        }
        
        if (!submitData.name) {
          throw new Error('กรุณาระบุชื่อผู้ขาย')
        }

        console.log('[Supplier Form] Submit data prepared:', submitData)

        // ✅ ลบโค้ด schema validation - ไม่จำเป็นแล้วเมื่อใช้ API
        
        let result
        if (props.mode === 'edit' && props.recordId) {
          result = await purchaseService.updateSupplier(props.recordId, submitData)
        } else {
          result = await purchaseService.createSupplier(submitData)
        }

        console.log('[Supplier Form] Submit result:', result)

        // ✅ Service returns data directly, not wrapped in {success, data}
        if (result && result._id) {
          console.log('[Supplier Form] 🎯 Save successful, checking mode:', props.mode)
          
          // ✅ UPDATE SEQUENCE AFTER SUCCESSFUL SAVE (NEW MODE ONLY) - เหมือน Products
          if (props.mode !== 'edit' && window.ERP_CORE?.codeManager) {
            console.log('[Supplier Form] 🔢 Starting sequence update process...')
            try {
              console.log('🔄 [SupplierForm] Updating sequence after successful save:', submitData.supplier_code)
              
              // ดึง pattern ที่ใช้จริง
              const usedPattern = await window.ERP_CORE.codeManager.getPatternForModule('supplier')
              
              // ⚠️ Extract ONLY the PURE sequence number (last digits after removing prefix and year)
              let usedSequence = 1
              
              const format = usedPattern?.pattern?.format || 'SUP{year}{sequence}'
              console.log(`📐 [SupplierForm] Format: ${format}`)
              
              if (format.includes('{year}')) {
                // Format: {prefix}{year}{sequence}
                // Example: SUP202500001
                // Step 1: Remove prefix
                const prefix = usedPattern?.pattern?.prefix || 'SUP'
                let remaining = submitData.supplier_code.replace(prefix, '')
                console.log(`  Step 1 - Remove prefix "${prefix}": "${submitData.supplier_code}" → "${remaining}"`)
                
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
                const sequenceMatch = submitData.supplier_code.match(/\d+$/)
                usedSequence = sequenceMatch ? parseInt(sequenceMatch[0]) : 1
              }
              
              console.log(`✅ [SupplierForm] Extracted PURE sequence: ${usedSequence} from code: ${submitData.supplier_code}`)
              
              // สร้าง patternInfo object ตามที่ CodeManager ต้องการ
              const patternInfo = {
                source: 'corporate_config',
                pattern: {
                  prefix: usedPattern?.pattern?.prefix || 'SUP',
                  format: usedPattern?.pattern?.format || 'SUP{year}{sequence}',
                  sequence: {
                    current: usedSequence, // เฉพาะ sequence number ไม่รวมปี (e.g., 1, 2, 3...)
                    digits: usedPattern?.pattern?.sequence?.digits || 5,
                    start: usedPattern?.pattern?.sequence?.start || 1,
                    resetOnYearChange: usedPattern?.pattern?.sequence?.resetOnYearChange || true
                  }
                }
              }
              
              console.log('📝 [SupplierForm] Pattern info for sequence update:', patternInfo)
              
              // เรียก updateSequenceInDatabase
              const seqResult = await window.ERP_CORE.codeManager.updateSequenceInDatabase('supplier', patternInfo)
              
              if (seqResult?.success) {
                console.log(`✅ [SupplierForm] Sequence updated in database: current=${usedSequence}, next=${seqResult.next}`)
              } else {
                console.warn('⚠️ [SupplierForm] Sequence update returned non-success:', seqResult)
              }
            } catch (seqError) {
              console.error('[Supplier Form] ⚠️ Failed to update sequence:', seqError)
              console.error('[Supplier Form] ⚠️ Error details:', seqError.message, seqError.stack)
              // ไม่ throw error เพราะข้อมูลบันทึกสำเร็จแล้ว
            }
          } else {
            console.log('[Supplier Form] ℹ️ Edit mode - skipping sequence update')
          }
          
          // สำหรับโหมด edit: แสดง toast แล้วไม่ต้องทำอะไร
          if (props.mode === 'edit') {
            console.log('[Supplier Form] ✅ Update successful!')
            console.log('[Supplier Form] 📊 Updated data:', result)
            console.log('[Supplier Form] 💾 Data saved to server successfully')
            
            // แสดง toast notification
            if (window.$toast) {
              window.$toast.success('✅ อัปเดตข้อมูลผู้ขายเรียบร้อยแล้ว')
            }
            
            // Don't do anything else - keep form as is
            // User can continue editing or navigate away
            return // Exit early
          } else {
            // สำหรับโหมด create: แสดง toast และ emit event
            if (window.$toast) {
              window.$toast.success('✅ เพิ่มผู้ขายเรียบร้อยแล้ว')
            }
            
            await nextTick()
            
            emit('saved', {
              success: true,
              data: result,
              mode: props.mode,
              status: 'success'
            })
          }
        } else {
          throw new Error('ไม่สามารถบันทึกข้อมูลได้')
        }
      } catch (err) {
        console.error('[Supplier Form] Submit error:', err)
        
        if (window.$toast) {
          window.$toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        }
        
        // Only reset loading on error
        if (isMounted.value) {
          await nextTick()
          loading.value = false
        }
      }
      // ✅ ไม่มี finally block - ไม่ reset loading หลัง success
    }

    // ✅ Save as Draft
    const saveDraft = async () => {
      loading.value = true
      
      try {
        // Save with minimal validation
        const draftData = {
          supplier_code: formData.supplier_code.trim() || `DRAFT_${Date.now()}`,
          name: formData.name.trim() || 'ร่างผู้ขาย',
          type: formData.type,
          status: 'pending',
          ...Object.fromEntries(
            Object.entries(formData).filter(([, value]) => 
              value !== '' && value !== null && value !== undefined
            )
          )
        }

        let result
        if (props.mode === 'edit' && props.recordId) {
          result = await purchaseService.updateSupplier(props.recordId, draftData)
        } else {
          result = await purchaseService.createSupplier(draftData)
        }

        // ✅ Service returns data directly
        if (result && result._id) {
          if (window.$toast) {
            window.$toast.success('บันทึกร่างเรียบร้อยแล้ว')
          }
          
          // Emit in nextTick to avoid DOM conflicts
          await nextTick()
          
          emit('saved', {
            success: true,
            data: result,
            mode: props.mode,
            status: 'draft'
          })
        }
      } catch (err) {
        if (window.$toast) {
          window.$toast.error('ไม่สามารถบันทึกร่างได้: ' + err.message)
        }
      } finally {
        // ✅ เช็ค isMounted ก่อน update loading
        if (isMounted.value) {
          await nextTick()
          loading.value = false
        }
      }
    }

    // ✅ Cancel handler  
    const handleCancel = () => {
      console.log('[Supplier Form] Cancelled')
      emit('cancel')
    }

    // ✅ Lifecycle
    onMounted(async () => {
      console.log('[Supplier Form] 🚀 Component mounted with props:', props)
      console.log('[Supplier Form] 📋 Initial form data:', { ...formData })
      
      // Mark component as mounted
      isMounted.value = true
      
      // Show loading while initializing
      loading.value = true
      
      try {
        // Step 1: Initialize purchaseService
        if (purchaseService) {
          const instance = getCurrentInstance()
          purchaseService.initialize(instance)
          console.log('[Supplier Form] ✅ purchaseService initialized')
        }
        
        await nextTick()
        
        // Step 2: Load code patterns (ต้องรอให้โหลดก่อน)
        console.log('[Supplier Form] 📋 Loading code patterns...')
        if (isMounted.value) {
          await updateCodePreview()
        }
        
        // Step 3: Load data for edit mode หรือ generate code for create mode
        if (props.mode === 'edit') {
          console.log('[Supplier Form] 📝 Edit mode detected, loading supplier data...')
          if (isMounted.value) {
            await loadData()
            // รอให้ DOM update เสร็จก่อนทำต่อ
            await nextTick()
            // อัปเดตตัวอย่างรหัสอีกครั้งหลังโหลดข้อมูล
            if (isMounted.value) await updateCodePreview()
          }
        } else {
          console.log('[Supplier Form] ➕ Create mode detected, generating code...')
          if (isMounted.value) await generateSupplierCode()
        }
        
        // รอให้ทุก update เสร็จสมบูรณ์
        await nextTick()
        
        // Mark data as ready - ตอนนี้ form พร้อมแสดงแล้ว
        isDataReady.value = true
        
        console.log('[Supplier Form] 🏁 Mount process completed, final form data:', { ...formData })
      } catch (error) {
        console.error('[Supplier Form] ❌ Error in onMounted:', error)
        // แสดง error แต่ยังให้ form แสดง
        isDataReady.value = true
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message)
        }
      } finally {
        // Hide loading spinner
        loading.value = false
      }
    })
    
    // ✅ Mark component as unmounted to prevent updates
    onBeforeUnmount(() => {
      console.log('[Supplier Form] 🔻 Component unmounting...')
      isMounted.value = false
      isDataReady.value = false
    })

    return {
      loading,
      isMounted,
      isDataReady,
      errors,
      formData,
      codePreview,
      codeGenerationInfo,
      lastGenerationSource,
      breadcrumbNav,
      canSubmit,
      isFormValid,
      isOriginalType,
      submitForm,
      saveDraft,
      handleCancel,
      generateSupplierCode,
      showCodeConfig,
      onTypeChange,
      updateCodePreview,
      setRating,
      getRatingText,
      validateField,
      validateTaxId,
      validatePhone,
      validateEmail,
      isValidEmail,
      getSourceDisplayName,
      getSourceExplanation
    }
  }
}
</script>

<style scoped>
/* Toggle Switch Styles */
.peer:checked ~ .peer-checked\:bg-blue-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}

.peer:checked ~ .peer-checked\:after\:translate-x-full::after {
  --tw-translate-x: 100%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
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
</style>