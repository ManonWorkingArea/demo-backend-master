<script>
export default {
  props: {
    packageData: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add', // 'add' or 'edit'
      validator: value => ['add', 'edit'].includes(value)
    }
  },
  inject: ['apiServer'],
  data() {
    return {
      hostkey: this.$Key,
      activeBlock: false,
      name: '',
      description: '',
      pricing: {
        basePrice: 0,
        billingCycles: [
          { 
            type: 'monthly', 
            duration: 30, 
            price: 0, 
            discount: 0, 
            label: 'รายเดือน' 
          },
          { 
            type: 'quarterly', 
            duration: 90, 
            price: 0, 
            discount: 5, 
            label: 'รายไตรมาส' 
          },
          { 
            type: 'yearly', 
            duration: 365, 
            price: 0, 
            discount: 15, 
            label: 'รายปี' 
          }
        ],
        defaultCycle: 'monthly'
      },
      limits: {
        maxAssets: 1,
        maxUsers: 5,
        storageGB: 1,
        bandwidth: 10,
        customDomain: false,
        sslCertificate: false,
        apiAccess: false,
        prioritySupport: false
      },
      features: [],
      status: true,
      error: null,
      success: false,
    }
  },
  computed: {
    isEditMode() {
      return this.mode === 'edit';
    },
    formTitle() {
      return this.isEditMode ? 'แก้ไข Package' : 'เพิ่ม Package ใหม่';
    },
    formDescription() {
      return this.isEditMode ? 'แก้ไขข้อมูล Package สำหรับ Collection' : 'สร้าง Package สำหรับ Collection';
    },
    submitButtonText() {
      return this.isEditMode ? 'อัพเดท Package' : 'บันทึก Package';
    },
    successMessage() {
      return this.isEditMode ? 'อัปเดต Package เรียบร้อยแล้ว กำลังไปยังหน้ารายการ...' : 'สร้าง Package เรียบร้อยแล้ว กำลังไปยังหน้ารายการ...';
    }
  },
  watch: {
    packageData: {
      immediate: true,
      deep: true,
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.populateForm(newData);
        }
      }
    }
  },
  methods: {
    populateForm(data) {
      this.name = data.name || '';
      this.description = data.description || '';
      
      // Handle different pricing structures for backward compatibility
      if (data.pricing && data.pricing.basePrice !== undefined) {
        // New pricing structure
        this.pricing = {
          basePrice: data.pricing.basePrice || 0,
          billingCycles: data.pricing.billingCycles || this.pricing.billingCycles,
          defaultCycle: data.pricing.defaultCycle || 'monthly'
        };
      } else if (data.price !== undefined) {
        // Old pricing structure - convert to new format
        this.pricing.basePrice = data.price || 0;
        this.pricing.billingCycles = [
          {
            type: 'monthly',
            duration: data.duration || 30,
            price: data.price || 0,
            discount: 0,
            label: 'รายเดือน'
          }
        ];
      }
      
      this.limits = { ...this.limits, ...data.limits };
      this.features = data.features ? [...data.features] : [];
      this.status = data.status !== undefined ? data.status : true;
    },
    
    async submitForm() {
      try {
        // Reset error state
        this.error = null;
        this.success = false;

        // Validate required fields
        if (!this.name.trim()) {
          this.error = 'กรุณาใส่ชื่อ Package';
          return;
        }

        if (!this.description.trim()) {
          this.error = 'กรุณาใส่คำอธิบาย Package';
          return;
        }

        if (this.pricing.basePrice <= 0) {
          this.error = 'กรุณาใส่ราคาพื้นฐานที่มากกว่า 0';
          return;
        }

        // Calculate pricing for each cycle
        const calculatedCycles = this.pricing.billingCycles.map(cycle => ({
          ...cycle,
          price: this.calculateCyclePrice(cycle)
        }));

        const formData = {
          name: this.name,
          description: this.description,
          pricing: {
            ...this.pricing,
            billingCycles: calculatedCycles
          },
          limits: this.limits,
          features: this.features.filter(f => f.trim() !== ''), // Remove empty features
          status: this.status
        };

        // Add timestamps
        if (this.isEditMode) {
          formData.updatedAt = new Date();
        } else {
          formData.createdAt = new Date();
        }

        this.activeBlock = true;
        
        const url = this.isEditMode 
          ? `https://gateway.cloudrestfulapi.com/api/package/${this.packageData._id || this.packageData.id}`
          : 'https://gateway.cloudrestfulapi.com/api/package';
        
        const method = this.isEditMode ? 'PUT' : 'POST';
        
        const requestBody = {
          data: formData,
          options: this.isEditMode 
            ? { unique: '_id' }
            : { fieldType: [], uniqueFields: [["name"]] }
        };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.hostkey
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        this.activeBlock = false;
        
        if (response.ok) {
          this.success = true;
          this.$emit('submit-success', data);
          
          setTimeout(() => {
            this.$router.push('/origin/package');
          }, 1500);
        } else {
          const errorMessage = this.isEditMode 
            ? 'เกิดข้อผิดพลาดในการอัปเดต Package'
            : 'เกิดข้อผิดพลาดในการสร้าง Package';
          this.error = data.message || errorMessage;
          this.$emit('submit-error', this.error);
        }
      } catch (error) {
        console.error('Error submitting package:', error);
        this.error = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
        this.activeBlock = false;
        this.$emit('submit-error', this.error);
      }
    },
    
    addFeature() {
      this.features.push('');
    },
    
    removeFeature(index) {
      this.features.splice(index, 1);
    },
    
    calculateCyclePrice(cycle) {
      const basePrice = this.pricing.basePrice;
      const discountPercent = cycle.discount || 0;
      const cyclePeriods = cycle.duration / 30; // แปลงเป็นเดือน
      const totalPrice = basePrice * cyclePeriods;
      const discountAmount = (totalPrice * discountPercent) / 100;
      return Math.round(totalPrice - discountAmount);
    },
    
    updateCyclePrices() {
      this.pricing.billingCycles.forEach(cycle => {
        cycle.price = this.calculateCyclePrice(cycle);
      });
    },
    
    addCustomCycle() {
      this.pricing.billingCycles.push({
        type: 'custom',
        duration: 30,
        price: 0,
        discount: 0,
        label: 'กำหนดเอง'
      });
    },
    
    removeCycle(index) {
      if (this.pricing.billingCycles.length > 1) {
        this.pricing.billingCycles.splice(index, 1);
      }
    },

    resetForm() {
      this.name = '';
      this.description = '';
      this.pricing = {
        basePrice: 0,
        billingCycles: [
          { 
            type: 'monthly', 
            duration: 30, 
            price: 0, 
            discount: 0, 
            label: 'รายเดือน' 
          },
          { 
            type: 'quarterly', 
            duration: 90, 
            price: 0, 
            discount: 5, 
            label: 'รายไตรมาส' 
          },
          { 
            type: 'yearly', 
            duration: 365, 
            price: 0, 
            discount: 15, 
            label: 'รายปี' 
          }
        ],
        defaultCycle: 'monthly'
      };
      this.limits = {
        maxAssets: 1,
        maxUsers: 5,
        storageGB: 1,
        bandwidth: 10,
        customDomain: false,
        sslCertificate: false,
        apiAccess: false,
        prioritySupport: false
      };
      this.features = [];
      this.status = true;
      this.error = null;
      this.success = false;
    }
  },
  
  setup() {
    //console.log("Setup");
  },
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              @click="$router.push('/origin/package')"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                {{ formTitle }}
              </h1>
              <p class="text-sm text-gray-600">{{ formDescription }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-xs text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
            
            <button 
              type="button"
              @click="resetForm"
              class="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเซ็ต
            </button>
            
            <button
              type="button"
              @click="submitForm"
              class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ submitButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="w-full">
      <form @submit.prevent="submitForm">
        <section aria-labelledby="package-form-heading" class="relative" 
                 :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" 
                 :class="[(activeBlock?'isblock' : 'isunblock')]">

          <div class="bg-white shadow-sm">
            <div class="px-6 py-8 space-y-10">

            <!-- Error Message -->
            <div v-if="error" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                  <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">สำเร็จ</h3>
                  <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
                </div>
              </div>
            </div>

            <!-- Package Information Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <h2 id="package-form-heading" class="text-2xl font-bold text-gray-900 mb-2">📦 ข้อมูล Package</h2>
                <p class="text-base text-gray-700 font-medium">กำหนดรายละเอียดและข้อมูลพื้นฐานของแพ็กเกจ</p>
                <p class="text-sm text-gray-500 mt-1">ข้อมูลเหล่านี้จะใช้ในการแสดงผลและจัดการแพ็กเกจในระบบ</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label for="name" class="block text-sm font-bold text-gray-800 mb-1">📝 ชื่อ Package</label>
                  <p class="text-xs text-gray-500 mb-2">ชื่อแพ็กเกจที่จะแสดงให้ผู้ใช้เห็น</p>
                  <input v-model="name" type="text" name="name" id="name" required
                    class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                </div>

                <div class="space-y-3">
                  <label for="basePrice" class="block text-sm font-bold text-gray-800 mb-1">💰 ราคาพื้นฐาน (บาท/เดือน)</label>
                  <p class="text-xs text-gray-500 mb-2">ราคาพื้นฐานต่อเดือนของแพ็กเกจ</p>
                  <input v-model="pricing.basePrice" @input="updateCyclePrices" type="number" name="basePrice" id="basePrice" min="0" required
                    class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                </div>

                <div class="lg:col-span-2 space-y-3">
                  <label for="description" class="block text-sm font-bold text-gray-800 mb-1">📋 คำอธิบาย</label>
                  <p class="text-xs text-gray-500 mb-2">รายละเอียดและคุณสมบัติของแพ็กเกจ</p>
                  <textarea v-model="description" name="description" id="description" rows="3" required
                    class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    placeholder="อธิบายรายละเอียดของ Package"></textarea>
                </div>

                <div class="space-y-3">
                  <label for="defaultCycle" class="block text-sm font-bold text-gray-800 mb-1">🔄 รูปแบบการชำระเงินเริ่มต้น</label>
                  <p class="text-xs text-gray-500 mb-2">เลือกรูปแบบการชำระเงินที่จะเป็นค่าเริ่มต้น</p>
                  <select v-model="pricing.defaultCycle" name="defaultCycle" id="defaultCycle"
                    class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors">
                    <option v-for="cycle in pricing.billingCycles" :key="cycle.type" :value="cycle.type">
                      {{ cycle.label }}
                    </option>
                  </select>
                </div>

                <div class="space-y-3">
                  <label class="block text-sm font-bold text-gray-800 mb-1">🔧 สถานะ</label>
                  <p class="text-xs text-gray-500 mb-2">สถานะการเปิด/ปิดใช้งานแพ็กเกจ</p>
                  <div class="mt-3">
                    <label class="inline-flex items-center">
                      <input v-model="status" type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing Cycles Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <div class="flex justify-between items-center">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">💳 รูปแบบการชำระเงิน</h2>
                    <p class="text-base text-gray-700 font-medium">กำหนดรูปแบบและราคาสำหรับการชำระเงินในแต่ละรอบ</p>
                    <p class="text-sm text-gray-500 mt-1">สามารถเพิ่มรูปแบบการชำระเงินที่หลากหลายเพื่อให้ลูกค้าเลือก</p>
                  </div>
                  <button type="button" @click="addCustomCycle"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    เพิ่มรูปแบบใหม่
                  </button>
                </div>
              </div>
              
              <div class="space-y-4">
                <div v-for="(cycle, index) in pricing.billingCycles" :key="index" 
                  class="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label class="block text-sm font-bold text-gray-800 mb-1">🏷️ ประเภท</label>
                      <p class="text-xs text-gray-500 mb-2">ชื่อรูปแบบการชำระเงิน</p>
                      <input v-model="cycle.label" type="text" 
                        class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-bold text-gray-800 mb-1">📅 ระยะเวลา (วัน)</label>
                      <p class="text-xs text-gray-500 mb-2">จำนวนวันในรอบชำระเงิน</p>
                      <input v-model="cycle.duration" @input="updateCyclePrices" type="number" min="1"
                        class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-bold text-gray-800 mb-1">🎯 ส่วนลด (%)</label>
                      <p class="text-xs text-gray-500 mb-2">เปอร์เซ็นต์ส่วนลด</p>
                      <input v-model="cycle.discount" @input="updateCyclePrices" type="number" min="0" max="100"
                        class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-bold text-gray-800 mb-1">💰 ราคาสุทธิ (บาท)</label>
                      <p class="text-xs text-gray-500 mb-2">ราคาหลังหักส่วนลด</p>
                      <input :value="calculateCyclePrice(cycle)" readonly
                        class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed" />
                    </div>
                    
                    <div v-if="pricing.billingCycles.length > 1" class="flex justify-center">
                      <button type="button" @click="removeCycle(index)"
                        class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Limits Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">⚙️ ข้อจำกัดการใช้งาน</h2>
                <p class="text-base text-gray-700 font-medium">กำหนดขีดจำกัดการใช้งานและคุณสมบัติต่าง ๆ ของแพ็กเกจ</p>
                <p class="text-sm text-gray-500 mt-1">ข้อจำกัดเหล่านี้จะควบคุมการใช้งานของผู้ใช้ในแต่ละแพ็กเกจ</p>
              </div>

              <!-- Usage Limits -->
              <div class="space-y-6">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 class="text-lg font-bold text-gray-800 mb-1">📊 ขีดจำกัดการใช้งาน</h3>
                  <p class="text-sm text-gray-600">กำหนดจำนวนและขีดจำกัดการใช้งานต่าง ๆ</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="space-y-3">
                    <label for="maxAssets" class="block text-sm font-bold text-gray-800 mb-1">🖼️ จำนวน Assets สูงสุด</label>
                    <p class="text-xs text-gray-500 mb-2">จำนวนไฟล์ทรัพยากรที่สามารถอัปโหลดได้</p>
                    <input v-model="limits.maxAssets" type="number" name="maxAssets" id="maxAssets" min="1"
                      class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                  </div>

                  <div class="space-y-3">
                    <label for="maxUsers" class="block text-sm font-bold text-gray-800 mb-1">👥 จำนวนผู้ใช้สูงสุด</label>
                    <p class="text-xs text-gray-500 mb-2">จำนวนผู้ใช้ที่สามารถเข้าใช้งานได้</p>
                    <input v-model="limits.maxUsers" type="number" name="maxUsers" id="maxUsers" min="1"
                      class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                  </div>

                  <div class="space-y-3">
                    <label for="storageGB" class="block text-sm font-bold text-gray-800 mb-1">💾 พื้นที่จัดเก็บ (GB)</label>
                    <p class="text-xs text-gray-500 mb-2">พื้นที่สำหรับจัดเก็บไฟล์และข้อมูล</p>
                    <input v-model="limits.storageGB" type="number" name="storageGB" id="storageGB" min="1"
                      class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                  </div>

                  <div class="space-y-3">
                    <label for="bandwidth" class="block text-sm font-bold text-gray-800 mb-1">📡 Bandwidth (GB/เดือน)</label>
                    <p class="text-xs text-gray-500 mb-2">ปริมาณการใช้งานข้อมูลต่อเดือน</p>
                    <input v-model="limits.bandwidth" type="number" name="bandwidth" id="bandwidth" min="1"
                      class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                  </div>
                </div>

                <!-- Feature Toggles -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 class="text-lg font-bold text-gray-800 mb-1">🔧 คุณสมบัติเพิ่มเติม</h3>
                  <p class="text-sm text-gray-600">เลือกคุณสมบัติพิเศษที่รวมอยู่ในแพ็กเกจ</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input v-model="limits.customDomain" type="checkbox" 
                      class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <div class="flex-1">
                      <label class="text-sm font-medium text-gray-900 cursor-pointer">🌐 Custom Domain</label>
                      <p class="text-xs text-gray-500 mt-1">ใช้โดเมนส่วนตัวได้</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input v-model="limits.sslCertificate" type="checkbox" 
                      class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <div class="flex-1">
                      <label class="text-sm font-medium text-gray-900 cursor-pointer">🔒 SSL Certificate</label>
                      <p class="text-xs text-gray-500 mt-1">ใบรับรอง SSL ฟรี</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input v-model="limits.apiAccess" type="checkbox" 
                      class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <div class="flex-1">
                      <label class="text-sm font-medium text-gray-900 cursor-pointer">🔌 API Access</label>
                      <p class="text-xs text-gray-500 mt-1">เข้าถึง API ได้</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input v-model="limits.prioritySupport" type="checkbox" 
                      class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <div class="flex-1">
                      <label class="text-sm font-medium text-gray-900 cursor-pointer">⭐ Priority Support</label>
                      <p class="text-xs text-gray-500 mt-1">การสนับสนุนลำดับความสำคัญ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <div class="flex justify-between items-center">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">✨ คุณสมบัติเพิ่มเติม</h2>
                    <p class="text-base text-gray-700 font-medium">เพิ่มรายการคุณสมบัติพิเศษที่จะแสดงให้ลูกค้าเห็น</p>
                    <p class="text-sm text-gray-500 mt-1">รายการคุณสมบัติจะช่วยให้ลูกค้าเข้าใจข้อดีของแพ็กเกจมากขึ้น</p>
                  </div>
                  <button type="button" @click="addFeature"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    เพิ่มคุณสมบัติ
                  </button>
                </div>
              </div>
              
              <div class="space-y-3">
                <div v-for="(feature, index) in features" :key="index" 
                  class="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <input v-model="features[index]" type="text" placeholder="ระบุคุณสมบัติ เช่น การสนับสนุนลูกค้า 24/7"
                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors" />
                  <button type="button" @click="removeFeature(index)"
                    class="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                
                <div v-if="features.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <p class="text-sm">ยังไม่มีคุณสมบัติเพิ่มเติม คลิก "เพิ่มคุณสมบัติ" เพื่อเริ่มต้น</p>
                </div>
              </div>
            </div>

            </div>

            <!-- Submit Button -->
            <div class="bg-gray-50 border-t border-gray-200">
              <div class="px-6 py-6">
                <div class="flex justify-between items-center">
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">{{ isEditMode ? 'อัพเดทข้อมูล Package' : 'สร้าง Package ใหม่' }}</span>
                    <p class="text-xs text-gray-500 mt-1">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</p>
                  </div>
                  <div class="flex space-x-3">
                    <button 
                      type="button"
                      @click="resetForm"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      รีเซ็ตฟอร์ม
                    </button>
                    <button type="submit" 
                            class="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {{ submitButtonText }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<style scoped>
.isblock::before {
  content: attr(data-content);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #374151;
  backdrop-filter: blur(2px);
}

.isblock {
  position: relative;
  pointer-events: none;
  opacity: 0.6;
}

.isunblock {
  position: relative;
  pointer-events: auto;
  opacity: 1;
}

/* Additional modern styling */
.space-y-10 > * + * {
  margin-top: 2.5rem;
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

/* Enhanced focus states */
input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Enhanced button hover states */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button:active {
  transform: translateY(0);
}

/* Card hover effects */
.rounded-lg:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
