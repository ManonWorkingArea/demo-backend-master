<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 text-gray-400">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="h-10 w-10" />
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate" :title="localItem.name || 'Address Field'">
              {{ localItem.name || 'Address Field' }}
            </p>
            <p class="text-xs text-gray-500 truncate" :title="'Type: ' + localItem.inputType">
              Type: {{ localItem.inputType }}
            </p>
            <p v-if="localItem.required" class="text-xs text-red-500 truncate">
              Required
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="tab-content">
        <div class="content-editor overflow-auto bg-white rounded-lg h-full">
          <!-- Section Header -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Address Field Configuration</h3>
                <p class="text-sm text-gray-500">ตั้งค่าฟิลด์ที่อยู่สำหรับแบบฟอร์ม</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 space-y-6">
            <!-- Basic Information -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'tag']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Basic Information</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">ข้อมูลพื้นฐานของฟิลด์ที่อยู่</p>
              </div>
              <div class="p-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Field Name (Label)</label>
                  <input
                    v-model="localItem.name"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                    placeholder="e.g., ที่อยู่บ้าน, ที่อยู่สำนักงาน"
                  />
                </div>
              </div>
            </div>

            <!-- Address Type Configuration -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'list-alt']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Address Type</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">เลือกประเภทของที่อยู่ที่ต้องการเก็บข้อมูล</p>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-1 gap-3">
                  <label v-for="addressType in addressTypes" :key="addressType.value" 
                         class="relative cursor-pointer group">
                    <input type="radio" v-model="localItem.inputType" :value="addressType.value" class="sr-only"/>
                    <div class="border-2 rounded-lg p-4 transition-all duration-200 flex items-center space-x-3"
                         :class="localItem.inputType === addressType.value 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                      <div class="flex-shrink-0">
                        <font-awesome-icon :icon="addressType.icon" class="h-5 w-5"
                                         :class="localItem.inputType === addressType.value ? 'text-blue-600' : 'text-gray-400'" />
                      </div>
                      <div class="flex-grow">
                        <p class="text-sm font-medium"
                           :class="localItem.inputType === addressType.value ? 'text-blue-900' : 'text-gray-900'">
                          {{ addressType.label }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">{{ addressType.description }}</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Field Settings -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'cog']" class="h-4 w-4 text-gray-600" />
                  <span class="text-sm font-semibold text-gray-700">Field Settings</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">การตั้งค่าพฤติกรรมของฟิลด์</p>
              </div>
              <div class="p-4">
                <label class="flex items-center cursor-pointer group p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                       :class="localItem.required ? 'border-blue-200 bg-blue-50' : 'border-gray-200'">
                  <input
                    v-model="localItem.required"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">ต้องการข้อมูลบังคับ (Required)</span>
                    <p class="text-xs text-gray-500 mt-1">ผู้ใช้จะต้องกรอกข้อมูลในฟิลด์นี้ก่อนส่งแบบฟอร์ม</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'AddressElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      addressTypes: [
        {
          value: 'standard',
          label: 'ที่อยู่มาตรฐาน (Standard Address)',
          description: 'ที่อยู่ทั่วไปสำหรับการใช้งานพื้นฐาน',
          icon: ['fas', 'home']
        },
        {
          value: 'contact',
          label: 'ที่อยู่สำหรับติดต่อ (Contact Address)',
          description: 'ที่อยู่ที่ใช้สำหรับการติดต่อและส่งจดหมาย',
          icon: ['fas', 'envelope']
        },
        {
          value: 'billing',
          label: 'ที่อยู่สำหรับออกใบเสร็จ (Billing Address)', 
          description: 'ที่อยู่ที่ใช้สำหรับการออกใบเสร็จรับเงิน',
          icon: ['fas', 'receipt']
        },
        {
          value: 'tax',
          label: 'ที่อยู่สำหรับออกใบกำกับภาษี (Tax Address)',
          description: 'ที่อยู่ที่ใช้สำหรับการออกใบกำกับภาษี',
          icon: ['fas', 'file-invoice-dollar']
        },
        {
          value: 'delivery',
          label: 'ที่อยู่สำหรับจัดส่งเอกสาร (Delivery Address)',
          description: 'ที่อยู่ที่ใช้สำหรับการจัดส่งสินค้าและเอกสาร',
          icon: ['fas', 'truck']
        }
      ],
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          name: '',
          inputType: 'standard',
          required: false,
        };
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(newItem)) };
      },
      deep: true,
      immediate: true,
    },
    localItem: {
      handler(newItem) {
        this.$emit('update-item', JSON.parse(JSON.stringify(newItem)));
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* Tailwind text-sm */
}
.popup-input, .popup-select {
  border-width: 1px;
  border-color: #d1d5db; /* Tailwind gray-300 */
  padding: 0.375rem 0.625rem; 
  font-size: 0.8125rem; 
  border-radius: 0.25rem; /* Tailwind rounded-md */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Tailwind shadow-sm */
  background-color: white;
}
.popup-input:focus, .popup-select:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6;
}
.popup-checkbox {
  height: 1rem;
  width: 1rem;
  border-radius: 0.25rem;
  border-color: #d1d5db;
  color: #4f46e5; /* Tailwind indigo-600 */
}
.section-group { margin-bottom: 0.75rem; }
</style> 