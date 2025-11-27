<template>
  <div class="tab-content">
    <div
      class="content-editor overflow-auto bg-white rounded-lg h-full"
    >
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'mobile-alt']" class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Responsive Configuration</h3>
            <p class="text-sm text-gray-500">การตั้งค่าการแสดงผลในขนาดหน้าจอต่างๆ</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 space-y-6">
        <!-- Device Visibility Section -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'desktop']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Device Visibility</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">เลือกขนาดหน้าจอที่ต้องการให้แสดงผล</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Mobile -->
              <label class="relative group cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedItem.mobile"
                  @change="$emit('update-selected-item-property', { property: 'mobile', value: $event.target.checked })"
                  class="sr-only"
                />
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="selectedItem.mobile 
                       ? 'border-blue-500 bg-blue-50 shadow-sm' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg mb-2 transition-colors duration-200"
                       :class="selectedItem.mobile ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'">
                    <font-awesome-icon :icon="['fas', 'mobile-alt']" 
                                       :class="selectedItem.mobile ? 'text-blue-600' : 'text-gray-500'"
                                       class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-medium transition-colors duration-200"
                        :class="selectedItem.mobile ? 'text-blue-700' : 'text-gray-700'">
                    Mobile
                  </span>
                  <span class="text-xs text-gray-500">&lt; 768px</span>
                </div>
                <!-- Checkmark Indicator -->
                <div v-if="selectedItem.mobile" 
                     class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
                </div>
              </label>

              <!-- Tablet -->
              <label class="relative group cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedItem.tablet"
                  @change="$emit('update-selected-item-property', { property: 'tablet', value: $event.target.checked })"
                  class="sr-only"
                />
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="selectedItem.tablet 
                       ? 'border-blue-500 bg-blue-50 shadow-sm' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg mb-2 transition-colors duration-200"
                       :class="selectedItem.tablet ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'">
                    <font-awesome-icon :icon="['fas', 'tablet-alt']" 
                                       :class="selectedItem.tablet ? 'text-blue-600' : 'text-gray-500'"
                                       class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-medium transition-colors duration-200"
                        :class="selectedItem.tablet ? 'text-blue-700' : 'text-gray-700'">
                    Tablet
                  </span>
                  <span class="text-xs text-gray-500">768px - 1024px</span>
                </div>
                <!-- Checkmark Indicator -->
                <div v-if="selectedItem.tablet" 
                     class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
                </div>
              </label>

              <!-- Laptop -->
              <label class="relative group cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedItem.laptop"
                  @change="$emit('update-selected-item-property', { property: 'laptop', value: $event.target.checked })"
                  class="sr-only"
                />
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="selectedItem.laptop 
                       ? 'border-blue-500 bg-blue-50 shadow-sm' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg mb-2 transition-colors duration-200"
                       :class="selectedItem.laptop ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'">
                    <font-awesome-icon :icon="['fas', 'laptop']" 
                                       :class="selectedItem.laptop ? 'text-blue-600' : 'text-gray-500'"
                                       class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-medium transition-colors duration-200"
                        :class="selectedItem.laptop ? 'text-blue-700' : 'text-gray-700'">
                    Laptop
                  </span>
                  <span class="text-xs text-gray-500">1024px - 1440px</span>
                </div>
                <!-- Checkmark Indicator -->
                <div v-if="selectedItem.laptop" 
                     class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
                </div>
              </label>

              <!-- Desktop -->
              <label class="relative group cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedItem.desktop"
                  @change="$emit('update-selected-item-property', { property: 'desktop', value: $event.target.checked })"
                  class="sr-only"
                />
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="selectedItem.desktop 
                       ? 'border-blue-500 bg-blue-50 shadow-sm' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg mb-2 transition-colors duration-200"
                       :class="selectedItem.desktop ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'">
                    <font-awesome-icon :icon="['fas', 'desktop']" 
                                       :class="selectedItem.desktop ? 'text-blue-600' : 'text-gray-500'"
                                       class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-medium transition-colors duration-200"
                        :class="selectedItem.desktop ? 'text-blue-700' : 'text-gray-700'">
                    Desktop
                  </span>
                  <span class="text-xs text-gray-500">&gt; 1440px</span>
                </div>
                <!-- Checkmark Indicator -->
                <div v-if="selectedItem.desktop" 
                     class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Responsive Info Panel -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg">
          <div class="p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-blue-800 mb-1">Responsive Guidelines</h4>
                <div class="text-xs text-blue-700 space-y-1">
                  <p>• เลือกขนาดหน้าจอที่ต้องการให้แสดงผล Element นี้</p>
                  <p>• หากไม่เลือกขนาดใด Element จะไม่แสดงในขนาดนั้น</p>
                  <p>• แนะนำให้เลือกทุกขนาดสำหรับ Element ที่สำคัญ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Selection Summary -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'list-check']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Selection Summary</span>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Selected Devices:</span>
              <div class="flex items-center space-x-2">
                <span v-if="selectedItem.mobile" 
                      class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  <font-awesome-icon :icon="['fas', 'mobile-alt']" class="h-3 w-3 mr-1" />
                  Mobile
                </span>
                <span v-if="selectedItem.tablet" 
                      class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  <font-awesome-icon :icon="['fas', 'tablet-alt']" class="h-3 w-3 mr-1" />
                  Tablet
                </span>
                <span v-if="selectedItem.laptop" 
                      class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  <font-awesome-icon :icon="['fas', 'laptop']" class="h-3 w-3 mr-1" />
                  Laptop
                </span>
                <span v-if="selectedItem.desktop" 
                      class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  <font-awesome-icon :icon="['fas', 'desktop']" class="h-3 w-3 mr-1" />
                  Desktop
                </span>
                <span v-if="!selectedItem.mobile && !selectedItem.tablet && !selectedItem.laptop && !selectedItem.desktop"
                      class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-3 w-3 mr-1" />
                  ไม่มีการเลือก
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponsiveTab',
  props: {
    selectedItem: {
      type: Object,
      required: true,
    },
  },
  emits: ['update-selected-item-property'],
};
</script>

<style scoped>
/* สามารถเพิ่ม style เฉพาะสำหรับ ResponsiveTab.vue ที่นี่ได้ถ้าจำเป็น */
.content-editor {
}
</style> 