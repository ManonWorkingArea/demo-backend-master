<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="tab-content">
    <div class="content-editor overflow-auto bg-white rounded-lg h-full">
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Column Configuration</h3>
            <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของแถวแนวตั้ง</p>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-3 mt-3">
          <div class="flex items-center space-x-2 text-sm">
            <span class="text-gray-500">Column UID:</span>
            <span class="font-medium text-gray-800">{{ localItem.uid }}</span>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 space-y-6">
        <!-- Column Display Style -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Column Display Style</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">กำหนดรูปแบบการแสดงผลของคอลัมน์</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-3">
              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.sz" value="unset" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.sz === 'unset' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png" alt="Unset" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.sz === 'unset' ? 'text-blue-700' : 'text-gray-700'">
                    Unset
                  </span>
                </div>
              </label>

              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.sz" value="block" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.sz === 'block' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png" alt="Block" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.sz === 'block' ? 'text-blue-700' : 'text-gray-700'">
                    Block
                  </span>
                </div>
              </label>

              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.sz" value="w-full" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.sz === 'w-full' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png" alt="Full Width" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.sz === 'w-full' ? 'text-blue-700' : 'text-gray-700'">
                    Full Width
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Column Colspan -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'border-all']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Column Width (Colspan)</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">กำหนดความกว้างของคอลัมน์</p>
          </div>
          <div class="p-4">
            <div v-if="parentRow && parentRow.col && parseInt(parentRow.col) > 0">
              <div class="grid grid-cols-6 gap-3">
                <label v-for="col_val in parseInt(parentRow.col)" :key="col_val" 
                       class="relative cursor-pointer group">
                  <input type="radio" v-model="localItem.colspan" :value="col_val.toString()" class="sr-only"/>
                  <div class="border-2 rounded-lg p-3 transition-all duration-200 flex flex-col items-center justify-center h-20"
                       :class="localItem.colspan === col_val.toString() 
                         ? 'border-blue-500 bg-blue-50 shadow-md' 
                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                    <img :src="imagePaths.cols[col_val - 1] || defaultColImage" :alt="col_val + ' Colspan'" class="w-8 h-8 mb-1"/>
                    <span class="text-xs font-medium"
                          :class="localItem.colspan === col_val.toString() ? 'text-blue-700' : 'text-gray-700'">
                      {{ col_val }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div v-else-if="parentRow && (!parentRow.col || parseInt(parentRow.col) <= 0)" 
                 class="flex items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-8 w-8 text-yellow-600 mb-2" />
                <p class="text-sm text-yellow-800">แถวแม่ (Parent row) ไม่ได้กำหนดจำนวนคอลัมน์ที่ถูกต้อง</p>
              </div>
            </div>
            <div v-else class="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'times-circle']" class="h-8 w-8 text-red-600 mb-2" />
                <p class="text-sm text-red-800">ไม่สามารถกำหนดค่า Colspan ได้ เนื่องจากข้อมูลแถวแม่ (parent row) ไม่พร้อมใช้งาน</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Column Alignment and Display -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Column Alignment -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'align-center']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Column Alignment</span>
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

          <!-- Inline Display -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'square']" class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-semibold text-gray-700">Display Mode</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">การแสดงผลแบบ inline</p>
            </div>
            <div class="p-4">
              <label class="flex items-center cursor-pointer group p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                     :class="localItem.inline ? 'border-blue-200 bg-blue-50' : 'border-gray-200'">
                <input type="checkbox" v-model="localItem.inline" 
                       class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Display as inline-block</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Spacing Adjustment -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'arrows-alt-h']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Spacing Adjustment</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">ปรับระยะห่างระหว่างรายการ</p>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Spacing Type</label>
              <select v-model="localItem.spacing" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2">
                <option value="none">None</option>
                <option value="space-x">Horizontal Space Between Items (space-x-*)</option>
                <option value="space-y">Vertical Space Between Items (space-y-*)</option>
              </select>
            </div>
            <div v-if="localItem.spacing && localItem.spacing !== 'none'" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Spacing Size (Tailwind Unit)</label>
              <input v-model="localItem.spacingValue" type="text" 
                     class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                     placeholder="e.g., 2, 4, 8"/>
              <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p class="text-xs text-blue-800">
                  จะใช้ class: <code class="bg-blue-100 px-1 rounded">{{ localItem.spacing }}-{{ localItem.spacingValue || 'X' }}</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inner Content Display Style -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Inner Content Display Style</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">การแสดงผลของเนื้อหาด้านใน</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-3">
              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.bsz" value="unset" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.bsz === 'unset' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png" alt="Unset" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.bsz === 'unset' ? 'text-blue-700' : 'text-gray-700'">
                    Unset
                  </span>
                </div>
              </label>

              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.bsz" value="block" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.bsz === 'block' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png" alt="Block" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.bsz === 'block' ? 'text-blue-700' : 'text-gray-700'">
                    Block
                  </span>
                </div>
              </label>

              <label class="relative cursor-pointer group">
                <input type="radio" v-model="localItem.bsz" value="w-full" class="sr-only"/>
                <div class="border-2 rounded-lg p-4 transition-all duration-200 flex flex-col items-center justify-center h-24"
                     :class="localItem.bsz === 'w-full' 
                       ? 'border-blue-500 bg-blue-50 shadow-md' 
                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                  <img src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png" alt="Full Width" class="w-8 h-8 mb-2"/>
                  <span class="text-xs font-medium text-center"
                        :class="localItem.bsz === 'w-full' ? 'text-blue-700' : 'text-gray-700'">
                    Full Width
                  </span>
                </div>
              </label>
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
  name: 'ColumnElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    parentRow: { // The row object that contains this column
      type: Object,
      required: false, // Make it not strictly required initially, handle absence gracefully
      default: () => ({ col: '1' }) // Default to prevent breaking parseInt if undefined
    }
    // No 'mode' prop as this component is the editor itself for a column type
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      imagePaths: {
        cols: [
          `${IMAGE_BASE_URL}1png.png`, `${IMAGE_BASE_URL}2png.png`, `${IMAGE_BASE_URL}3png.png`,
          `${IMAGE_BASE_URL}4png.png`, `${IMAGE_BASE_URL}5png.png`, `${IMAGE_BASE_URL}6png.png`
          // Add more if needed, up to the max columns supported by parentRow.col (e.g., 12)
        ]
      },
      defaultColImage: `${IMAGE_BASE_URL}defaultcolpng.png`, // A fallback image
      horizontalAlignments: [
        { value: 'justify-start', label: 'Left' }, // text-left or flex justify-start
        { value: 'justify-center', label: 'Center' }, // text-center or flex justify-center
        { value: 'justify-end', label: 'Right' } // text-right or flex justify-end
      ],
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          uid: generateUid(),
          type: 'column',
          sz: 'unset', // Column display style
          bsz: 'unset', // Inner content display style
          colspan: '1',
          alignment: 'justify-start', // Default horizontal alignment for content within the column
          inline: false,
          spacing: 'none',
          spacingValue: '',
          // Ensure all relevant properties for a column are here
          // These would typically come from the initial structure of a column object
          text: 'New Column', // Default text/label for the column itself
          object: [], // Content items within the column
          // Style properties (padding, margin, background) for the column itself are usually handled in the 'Style' tab
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };

        // Ensure colspan is valid based on parentRow if parentRow is available
        if (this.parentRow && this.parentRow.col) {
            const maxCols = parseInt(this.parentRow.col);
            if (parseInt(this.localItem.colspan) > maxCols) {
                this.localItem.colspan = maxCols.toString();
            }
        } else if (this.parentRow === null || typeof this.parentRow.col === 'undefined') {
             // If parentRow is explicitly null or col is undefined, maybe default colspan to 1 or handle as error
             console.warn("ColumnElement: parentRow or parentRow.col is not defined. Colspan might be inaccurate.");
             if (!this.localItem.colspan) this.localItem.colspan = '1'; // Default if not set
        }

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
    parentRow: { // Watch parentRow changes to re-validate colspan
        handler(newParentRow) {
            if (newParentRow && newParentRow.col && this.localItem.colspan) {
                const maxCols = parseInt(newParentRow.col);
                if (parseInt(this.localItem.colspan) > maxCols) {
                    this.localItem.colspan = maxCols.toString();
                }
            } else if (newParentRow === null || (newParentRow && typeof newParentRow.col === 'undefined')) {
                 console.warn("ColumnElement (parentRow watcher): parentRow or parentRow.col is not defined. Colspan might be inaccurate.");
                 // Optionally reset or warn about colspan
            }
        },
        deep: true,
        // immediate: true // Not needed if item watcher already handles initial colspan logic
    }
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
.radio-label:hover, .radio-image-label:hover {
    border-color: #9ca3af; /* gray-400 */
}
.section-group { margin-bottom: 0.75rem; }
</style> 