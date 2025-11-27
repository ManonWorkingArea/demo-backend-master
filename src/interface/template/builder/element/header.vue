<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2">
          <h1
            :class="[localItem.customClass]"
            :id="localItem.customId || null"
            :style="computedStyle"
          >
            {{ localItem.text || 'None' }}
          </h1>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto bg-white rounded-lg h-full">
          <!-- Section Header -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-heading text-blue-600 h-4 w-4"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Header Configuration</h3>
                <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของส่วนหัว</p>
              </div>
            </div>
          </div>
  
          <div class="px-6 py-4 space-y-6">
            <!-- Header Text -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <label class="popup-label block font-semibold mb-1">ข้อความที่ต้องการ</label>
              <input v-model="localItem.text" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>
  
            <!-- Text Align & Color -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Text Align -->
              <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <label class="popup-label block font-semibold mb-1">ตำแหน่งข้อความ</label>
                <div class="grid grid-cols-3 gap-2">
                  <label 
                    v-for="textAlignValue in ['left', 'center', 'right']"
                    :key="textAlignValue"
                    class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border rounded-md transition-colors"
                    :class="localItem.align === textAlignValue ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'"
                  >
                    <i :class="'fas fa-align-' + textAlignValue" class="text-lg mb-1"></i>
                    <input type="radio" v-model="localItem.align" :value="textAlignValue" class="radio-input hidden" />
                    <span class="text-xs capitalize">{{ textAlignValue }}</span>
                  </label>
                </div>
              </div>
              <!-- Color -->
              <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <label class="block popup-label font-semibold mb-1">สีตัวอักษร</label>
                <div class="flex items-center">
                  <input v-model="localItem.color" type="text" @input="updateColorText($event.target.value)" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., #RRGGBB or black" />
                  <input :value="displayColorPickerValue" @input="updateColorPicker($event.target.value)" type="color" class="ml-2 h-10 w-10 p-0 border-none rounded-md cursor-pointer" />
                </div>
              </div>
            </div>
  
            <!-- Header Height -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <label class="popup-label block font-semibold mb-1">ความสูงของส่วนหัว</label>
              <div class="flex items-center space-x-2">
                <select v-model="localItem.heightOption" class="popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                  <option value="auto">Auto</option>
                  <option value="full">Full Screen</option>
                  <option value="manual">Manual</option>
                </select>
                <template v-if="localItem.heightOption === 'manual'">
                  <input v-model.number="localItem.height" type="number" class="w-20 popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Height" />
                  <select v-model="localItem.heightUnit" class="popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="vh">vh</option>
                  </select>
                </template>
              </div>
              <div v-if="localItem.heightOption === 'full'" class="mt-2 flex space-x-2">
                <label v-for="valign in ['flex-start', 'center', 'flex-end']" :key="valign" 
                  class="radio-label flex-1 p-2 text-center cursor-pointer border rounded-md transition-colors"
                  :class="localItem.alignH === valign ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'">
                  <input type="radio" v-model="localItem.alignH" :value="valign" class="radio-input hidden" />
                  <span class="text-xs capitalize">{{ valign.replace('flex-','') }}</span>
                </label>
              </div>
            </div>
  
            <!-- Font Size -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <label class="popup-label block font-semibold mb-1">ขนาดฟอนต์</label>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 items-center">
                <label 
                  v-for="sizeValue in ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']" 
                  :key="sizeValue" 
                  class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border rounded-md transition-colors h-full"
                  :class="localItem.fontSize === sizeValue ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'"
                  >
                  <i class="fas fa-font mb-1" :style="{ fontSize: getFontSizePreview(sizeValue) }"></i>
                  <input type="radio" v-model="localItem.fontSize" :value="sizeValue" class="radio-input hidden" />
                  <span class="text-xs uppercase">{{ sizeValue }}</span>
                </label>
              </div>
            </div>
  
            <!-- Font Weight -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <label class="popup-label block font-semibold mb-1">ความหนาฟอนต์</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label 
                  v-for="weightValue in ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold']" 
                  :key="weightValue" 
                  class="radio-label flex flex-col items-center p-2 justify-center cursor-pointer border rounded-md transition-colors h-full"
                  :class="localItem.fontWeight === weightValue ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'"
                >
                  <span :style="{ fontWeight: weightValue }" class="text-lg mb-1">Aa</span>
                  <input type="radio" v-model="localItem.fontWeight" :value="weightValue" class="radio-input hidden" />
                  <span class="text-xs capitalize">{{ weightValue }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Header',
    props: {
      item: {
        type: Object,
        required: true
      },
      mode: {
        type: String,
        required: true,
        default: 'preview' // or 'edit'
      }
    },
    data() {
      return {
        localItem: JSON.parse(JSON.stringify(this.item)),
        isUpdatingFromPropInternalFlag: false,
      };
    },
    computed: {
      computedStyle() {
        let style = {
          textAlign: this.localItem.align || "left",
          fontSize: this.getFontSize(this.localItem.fontSize),
          fontWeight: this.localItem.fontWeight || "normal",
          color: this.isValidHexColor(this.localItem.color) ? this.localItem.color : this.colorNameToHex(this.localItem.color) || this.localItem.color || "black",
          width: '100%', // Ensure header takes full width of its container
        };

        if (this.localItem.heightOption === 'manual' && this.localItem.height) {
          style.height = `${this.localItem.height}${this.localItem.heightUnit || 'px'}`;
        } else if (this.localItem.heightOption === 'full') {
          style.height = '100%'; // Or a specific viewport height like 'calc(100vh - Xpx)' if needed
          style.display = 'flex';
          style.flexDirection = 'column'; // Align text based on a column, might need to adjust if horizontal alignment too
          style.justifyContent = this.localItem.alignH || 'flex-start'; // vertical alignment in flex container
        } else {
          style.height = 'auto';
        }
        return style;
      },
      displayColorPickerValue() {
        if (this.isValidHexColor(this.localItem.color)) {
          return this.localItem.color;
        }
        return this.colorNameToHex(this.localItem.color) || '#000000';
      }
    },
    methods: {
      isValidHexColor(colorStr) {
        if (!colorStr || typeof colorStr !== 'string') return false;
        return /^#[0-9A-Fa-f]{6}$/i.test(colorStr) || /^#[0-9A-Fa-f]{3}$/i.test(colorStr);
      },
      colorNameToHex(name) {
        if (!name || typeof name !== 'string') return '#000000';
        const lowerName = name.toLowerCase();
        const colors = {
          "black": "#000000",
          "white": "#ffffff",
          "red": "#ff0000",
          "green": "#008000",
          "blue": "#0000ff",
          "yellow": "#ffff00",
          "cyan": "#00ffff",
          "magenta": "#ff00ff",
          "gray": "#808080",
          "silver": "#c0c0c0",
        };
        return colors[lowerName] || null;
      },
      updateColorText(value) {
        this.localItem = { ...this.localItem, color: value };
      },
      updateColorPicker(value) {
        if (this.isValidHexColor(value)) {
          this.localItem = { ...this.localItem, color: value };
        } else {
          this.localItem = { ...this.localItem, color: '#000000' };
        }
      },
      getFontSize(size) {
        const sizes = {
          xs: "0.75rem",  // 12px
          sm: "0.875rem", // 14px
          md: "1rem",    // 16px
          lg: "1.125rem", // 18px (Tailwind default lg)
          xl: "1.25rem", // 20px (Tailwind default xl)
          "2xl": "1.5rem", // 24px (Tailwind default 2xl)
          "3xl": "1.875rem",// 30px (Tailwind default 3xl)
          "4xl": "2.25rem" // 36px (Tailwind default 4xl)
        };
        return sizes[size] || "1rem"; // Default to md (16px)
      },
      getFontSizePreview(size) { // For icon preview in edit mode
          const previewSizes = {
              xs: "10px", sm: "12px", md: "14px", lg: "16px", xl: "18px", "2xl": "20px", "3xl": "22px", "4xl": "24px"
          };
          return previewSizes[size] || "14px";
      },
    },
    watch: {
      item: {
        handler(newItem) {
          if (this.isUpdatingFromPropInternalFlag) return;

          if (JSON.stringify(newItem) !== JSON.stringify(this.localItem)) {
            this.isUpdatingFromPropInternalFlag = true;
            this.localItem = JSON.parse(JSON.stringify(newItem));
            this.$nextTick(() => {
              this.isUpdatingFromPropInternalFlag = false;
            });
          }
        },
        deep: true,
        immediate: true
      },
      localItem: {
        handler(updatedLocalItem) {
          console.log('[HeaderElement] localItem watcher START ====================================');
          console.log('[HeaderElement] isUpdatingFromPropInternalFlag:', this.isUpdatingFromPropInternalFlag);
          
          const updatedLocalItemStr = JSON.stringify(updatedLocalItem);
          const currentItemPropStr = JSON.stringify(this.item);

          console.log('[HeaderElement] updatedLocalItem (current local state):', updatedLocalItemStr);
          console.log('[HeaderElement] this.item (prop from parent):', currentItemPropStr);

          if (this.isUpdatingFromPropInternalFlag) {
            console.log('[HeaderElement] Action: SKIPPING EMIT because isUpdatingFromPropInternalFlag is true.');
            console.log('[HeaderElement] localItem watcher END ======================================');
            return;
          }

          if (updatedLocalItemStr !== currentItemPropStr) {
            console.log('[HeaderElement] Action: EMITTING update-item because local state differs from prop.');
            this.$emit('update-item', JSON.parse(updatedLocalItemStr));
          } else {
            console.log('[HeaderElement] Action: NOT EMITTING update-item because local state is THE SAME as prop.');
          }
          console.log('[HeaderElement] localItem watcher END ======================================');
        },
        deep: true
      }
    }
  };
  </script>
  
  <style scoped>
  .radio-input.hidden {
    display: none;
  }
  /* Improved styling for radio buttons acting as toggles */
  .radio-label {
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  /* Tailwind focus state for inputs/selects for consistency if not using a plugin */
  .popup-input:focus {
    border-color: #3b82f6; /* Tailwind's blue-500 */
    box-shadow: 0 0 0 1px #3b82f6; /* Ring effect */
  }
  </style>
  