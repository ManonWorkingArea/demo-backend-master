<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="tab-content">
    <div class="content-editor overflow-auto bg-white rounded-lg h-full">
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'grip-horizontal']" class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Row Configuration</h3>
            <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของแถวเนื้อหา</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 space-y-6">
        <!-- Visibility & Data Set Configuration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Visibility Section -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Visibility Settings</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">ควบคุมการแสดงผลของแถว</p>
            </div>
            <div class="p-4">
              <div class="flex items-center space-x-4">
                <label class="flex items-center cursor-pointer group">
                  <input type="radio" :value="true" v-model="localItem.visible" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                  <span class="ml-2 text-sm text-gray-700 group-hover:text-gray-900">แสดง</span>
                </label>
                <label class="flex items-center cursor-pointer group">
                  <input type="radio" :value="false" v-model="localItem.visible" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                  <span class="ml-2 text-sm text-gray-700 group-hover:text-gray-900">ซ่อน</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Data Set Configuration -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'database']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Data Set Configuration</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">ตั้งค่าการเชื่อมต่อข้อมูล</p>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <div class="flex items-center space-x-6">
                  <label class="flex items-center cursor-pointer group">
                    <input type="radio" value="standalone" v-model="localItem.dataMode" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                    <span class="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Standalone</span>
                  </label>
                  <label class="flex items-center cursor-pointer group">
                    <input type="radio" value="set" v-model="localItem.dataMode" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                    <span class="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Set</span>
                  </label>
                </div>
              </div>
              <template v-if="localItem.dataMode === 'set'">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Set Name</label>
                  <input v-model="localItem.dataSetName" type="text" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1" placeholder="Enter set name"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Set Limit (Max Items)</label>
                  <input v-model.number="localItem.dataSetLimit" type="number" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1" placeholder="e.g., 10"/>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Display Mode & Layout Style -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Display Mode Section -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'th-large']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Row Display Mode</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">เลือกรูปแบบการแสดงผลของแถว</p>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-3 gap-3">
                <label v-for="modeOption in displayModes" :key="modeOption.value" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.mode" :value="modeOption.value" class="sr-only"/>
                  <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                       :class="localItem.mode === modeOption.value 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <img :src="modeOption.img" :alt="modeOption.label" class="w-8 h-8 mb-2"/>
                    <span class="text-xs font-medium text-center"
                          :class="localItem.mode === modeOption.value ? 'text-blue-700' : 'text-gray-700'">
                      {{ modeOption.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Row Layout Style Section -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Row Layout Style</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">กำหนดรูปแบบการจัดวางของแถว</p>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-3 gap-3">
                <label v-for="styleOption in layoutStyles" :key="styleOption.value" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.sz" :value="styleOption.value" class="sr-only"/>
                  <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                       :class="localItem.sz === styleOption.value 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <img :src="styleOption.img" :alt="styleOption.label" class="w-8 h-8 mb-2"/>
                    <span class="text-xs font-medium text-center"
                          :class="localItem.sz === styleOption.value ? 'text-blue-700' : 'text-gray-700'">
                      {{ styleOption.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Inner Content Configuration -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Inner Content Configuration</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">ตั้งค่าเนื้อหาภายในแถว</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Inner Content Layout Style</label>
                  <div class="grid grid-cols-3 gap-2">
                    <label v-for="styleOption in layoutStyles" :key="styleOption.value" 
                           class="relative cursor-pointer group">
                      <input type="radio" v-model="localItem.bsz" :value="styleOption.value" class="sr-only"/>
                      <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                           :class="localItem.bsz === styleOption.value 
                             ? 'border-blue-500 bg-blue-50 shadow-md' 
                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                        <img :src="styleOption.img" :alt="styleOption.label" class="w-6 h-6 mb-1"/>
                        <span class="text-xs font-medium text-center"
                              :class="localItem.bsz === styleOption.value ? 'text-blue-700' : 'text-gray-700'">
                          {{ styleOption.label }}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Inner Content Max Width</label>
                  <select v-model="localItem.width" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2">
                    <option value="max-w-full">100% (Full Width)</option>
                    <option value="max-w-screen-xl">Extra Large (screen-xl)</option>
                    <option value="max-w-screen-lg">Large (screen-lg)</option>
                    <option value="max-w-screen-md">Medium (screen-md)</option>
                    <option value="max-w-7xl">7xl</option>
                    <option value="max-w-6xl">6xl</option>
                    <option value="max-w-5xl">5xl</option>
                    <option value="max-w-4xl">4xl</option>
                    <option value="max-w-3xl">3xl</option>
                    <option value="max-w-2xl">2xl</option>
                    <option value="max-w-xl">xl</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row Alignment & Height -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Row Alignment -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'align-center']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Content Alignment</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">จัดตำแหน่งเนื้อหาในแนวนอน</p>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-3 gap-2">
                <label v-for="alignment in horizontalAlignments" :key="alignment.value" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.alignment" :value="alignment.value" class="sr-only"/>
                  <div class="border-2 rounded-lg p-3 transition-all duration-200 flex items-center justify-center h-12"
                       :class="localItem.alignment === alignment.value 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <span class="text-xs font-medium"
                          :class="localItem.alignment === alignment.value ? 'text-blue-700' : 'text-gray-700'">
                      {{ alignment.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Row Height -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'arrows-alt-v']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Row Min Height</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">กำหนดความสูงขั้นต่ำของแถว</p>
            </div>
            <div class="p-4">
              <select v-model="localItem.height" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option v-for="h in heightOptions" :key="h.value" :value="h.value">{{ h.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Columns Configuration -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'columns']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Columns Configuration</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">ตั้งค่าจำนวนคอลัมน์และระยะห่าง</p>
          </div>
          <div class="p-4">
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700">Default Columns (Desktop)</label>
            </div>
            <div class="grid grid-cols-8 gap-4">
              <!-- Column Options (1-6) - Each takes 1 column -->
              <label v-for="col_val in [1,2,3,4,5,6]" :key="'col-'+col_val" 
                     class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.col" :value="col_val.toString()" class="sr-only"/>
                <div class="border-2 rounded-lg p-2 transition-all duration-200 flex flex-col items-center justify-center h-20"
                     :class="localItem.col == col_val.toString() 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img :src="imagePaths.cols[col_val-1]" :alt="col_val + ' Col'" class="w-6 h-6 mb-1"/>
                  <span class="text-xs font-medium"
                        :class="localItem.col == col_val.toString() ? 'text-blue-700' : 'text-gray-700'">
                    {{col_val}}
                  </span>
                </div>
              </label>

              <!-- Column Gap - Takes 2 columns (columns 7-8) -->
              <div class="col-span-2">
                <div class="h-full flex flex-col justify-center">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Column Gap (px)</label>
                  <input v-model.number="localItem.gapSize" type="number" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 10"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsive Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tablet Columns -->
          <div v-if="localItem.tablet" class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'tablet-alt']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Columns on Tablet</span>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-6 gap-2">
                <label v-for="col_val in [1,2,3,4,5,6]" :key="'colTablet-'+col_val" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.colTablet" :value="col_val.toString()" class="sr-only"/>
                  <div class="border-2 rounded-lg p-2 transition-all duration-200 flex flex-col items-center justify-center h-16"
                       :class="localItem.colTablet == col_val.toString() 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <img :src="imagePaths.cols[col_val-1]" :alt="col_val + ' Col'" class="w-6 h-6 mb-1"/>
                    <span class="text-xs font-medium"
                          :class="localItem.colTablet == col_val.toString() ? 'text-blue-700' : 'text-gray-700'">
                      {{col_val}}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Mobile Columns -->
          <div v-if="localItem.mobile" class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'mobile-alt']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Columns on Mobile</span>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-6 gap-2">
                <label v-for="col_val in [1,2,3,4,5,6]" :key="'colMobile-'+col_val" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.colMobile" :value="col_val.toString()" class="sr-only"/>
                  <div class="border-2 rounded-lg p-2 transition-all duration-200 flex flex-col items-center justify-center h-16"
                       :class="localItem.colMobile == col_val.toString() 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <img :src="imagePaths.cols[col_val-1]" :alt="col_val + ' Col'" class="w-6 h-6 mb-1"/>
                    <span class="text-xs font-medium"
                          :class="localItem.colMobile == col_val.toString() ? 'text-blue-700' : 'text-gray-700'">
                      {{col_val}}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const IMAGE_BASE_URL = 'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/';

export default {
  name: 'RowElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    // No 'mode' prop as this component is the editor itself for a row type
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      displayModes: [
        { value: 'standard', label: 'Standard', img: `${IMAGE_BASE_URL}unsetpng.png` },
        { value: 'tab', label: 'Tab Layout', img: `${IMAGE_BASE_URL}blockpng.png` }, // Placeholder, update if specific image exists
        { value: 'accordion', label: 'Accordion Layout', img: `${IMAGE_BASE_URL}w-fullpng.png` } // Placeholder
      ],
      layoutStyles: [
        { value: 'unset', label: 'Unset (Default)', img: `${IMAGE_BASE_URL}unsetpng.png` },
        { value: 'block', label: 'Block', img: `${IMAGE_BASE_URL}blockpng.png` },
        { value: 'w-full', label: 'Full Width', img: `${IMAGE_BASE_URL}w-fullpng.png` }
      ],
      horizontalAlignments: [
        { value: 'items-start', label: 'Left' }, // Corresponds to flex items-start
        { value: 'items-center', label: 'Center' },
        { value: 'items-end', label: 'Right' } // Corresponds to flex items-end
      ],
      heightOptions: [
        { value: 'h-auto', label: 'Auto' },
        { value: 'h-6', label: 'h-6 (24px)' }, { value: 'h-8', label: 'h-8 (32px)' }, { value: 'h-10', label: 'h-10 (40px)' },
        { value: 'h-12', label: 'h-12 (48px)' }, { value: 'h-16', label: 'h-16 (64px)' }, { value: 'h-20', label: 'h-20 (80px)' }, 
        { value: 'h-24', label: 'h-24 (96px)' }, { value: 'h-32', label: 'h-32 (128px)' }, { value: 'h-40', label: 'h-40 (160px)' },
        { value: 'h-48', label: 'h-48 (192px)' }, { value: 'h-64', label: 'h-64 (256px)' }, { value: 'h-80', label: 'h-80 (320px)' },
        { value: 'h-96', label: 'h-96 (384px)' }, { value: 'h-screen', label: 'Full Screen Height' }
      ],
      imagePaths: {
        cols: [
          `${IMAGE_BASE_URL}1png.png`, `${IMAGE_BASE_URL}2png.png`, `${IMAGE_BASE_URL}3png.png`,
          `${IMAGE_BASE_URL}4png.png`, `${IMAGE_BASE_URL}5png.png`, `${IMAGE_BASE_URL}6png.png`
        ]
      }
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          id: generateUid(),
          type: 'row',
          visible: true,
          dataMode: 'standalone',
          dataSetName: '',
          dataSetLimit: null,
          mode: 'standard', // Row display mode (standard, tab, accordion)
          sz: 'unset', // Row layout style
          bsz: 'unset', // Inner content layout style
          width: 'max-w-full', // Inner content max width
          alignment: 'items-start', // Row horizontal alignment
          height: 'h-auto', // Row min height
          col: '1',
          colTablet: '1',
          colMobile: '1',
          gapSize: 10, // Default gap in px (Tailwind gap-2.5 is 10px if base is 4px)
          // Ensure all relevant properties from the original selectedItem.type === 'row' are here
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        // Make a deep copy to avoid mutating the prop directly
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
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
  // No created hook needed if immediate:true on watcher initializes localItem
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
  font-size: 0.8125rem; /* Slightly smaller than text-sm for inputs */
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
 border-color: #3b82f6; /* Tailwind ring-blue-500 */
}
.popup-radio {
  height: 1rem; 
  width: 1rem;
  border-radius: 50%; 
  border-color: #d1d5db; 
  color: #4f46e5; /* Tailwind indigo-600 */
  margin-top: 0.125rem; /* Align with text */
}
.radio-image-label:hover {
    border-color: #9ca3af; /* gray-400 */
}
.section-group { margin-bottom: 0.75rem; }
</style> 