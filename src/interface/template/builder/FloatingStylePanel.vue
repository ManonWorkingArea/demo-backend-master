<script>
export default {
  name: 'FloatingStylePanel',
  emits: ['update-styles'],
  data() {
    return {
      isOpen: false,
      activeTarget: 'row', // row, column, object
      activeSection: 'head', // head, body, footer
      
      // Border radius mode
      borderRadiusMode: 'all', // all, top, bottom, individual
      
      styles: {
        row: {
          head: {
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#374151'
          },
          body: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f9fafb',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#6b7280'
          }
        },
        column: {
          head: {
            backgroundColor: '#fef3c7',
            borderColor: '#fbbf24',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#92400e'
          },
          body: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#6b7280'
          }
        },
        object: {
          head: {
            backgroundColor: '#dbeafe',
            borderColor: '#3b82f6',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#1e40af'
          },
          body: {
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#6b7280'
          }
        }
      }
    };
  },
  computed: {
    currentStyle() {
      return this.styles[this.activeTarget][this.activeSection];
    },
    stylesJson() {
      return JSON.stringify(this.styles, null, 2);
    },
    previewStyle() {
      const style = this.currentStyle;
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderTopLeftRadius: style.borderTopLeftRadius,
        borderTopRightRadius: style.borderTopRightRadius,
        borderBottomLeftRadius: style.borderBottomLeftRadius,
        borderBottomRightRadius: style.borderBottomRightRadius,
        borderStyle: 'solid',
        color: style.textColor,
        transition: 'all 0.3s ease'
      };
    }
  },
  methods: {
    togglePanel() {
      this.isOpen = !this.isOpen;
    },
    setTarget(target) {
      this.activeTarget = target;
    },
    setSection(section) {
      this.activeSection = section;
    },
    updateStyle(property, value) {
      this.styles[this.activeTarget][this.activeSection][property] = value;
      this.emitStyles();
    },
    emitStyles() {
      this.$emit('update-styles', {
        styles: this.styles,
        activeTarget: this.activeTarget,
        activeSection: this.activeSection
      });
    },
    resetToDefaults() {
      this.styles = {
        row: {
          head: {
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#374151'
          },
          body: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f9fafb',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '8px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            textColor: '#6b7280'
          }
        },
        column: {
          head: {
            backgroundColor: '#fef3c7',
            borderColor: '#fbbf24',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#92400e'
          },
          body: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '6px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            textColor: '#6b7280'
          }
        },
        object: {
          head: {
            backgroundColor: '#dbeafe',
            borderColor: '#3b82f6',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#1e40af'
          },
          body: {
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#111827'
          },
          footer: {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: '4px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            textColor: '#6b7280'
          }
        }
      };
      this.borderRadiusMode = 'all';
      this.emitStyles();
    },
    copyJsonToClipboard() {
      navigator.clipboard.writeText(this.stylesJson).then(() => {
        alert('JSON copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    },
    setBorderRadiusMode(mode) {
      this.borderRadiusMode = mode;
    },
    updateBorderRadius(value) {
      const style = this.currentStyle;
      
      if (this.borderRadiusMode === 'all') {
        style.borderRadius = value;
        style.borderTopLeftRadius = value;
        style.borderTopRightRadius = value;
        style.borderBottomLeftRadius = value;
        style.borderBottomRightRadius = value;
      } else if (this.borderRadiusMode === 'top') {
        style.borderTopLeftRadius = value;
        style.borderTopRightRadius = value;
        style.borderBottomLeftRadius = '0px';
        style.borderBottomRightRadius = '0px';
        style.borderRadius = `${value} ${value} 0px 0px`;
      } else if (this.borderRadiusMode === 'bottom') {
        style.borderTopLeftRadius = '0px';
        style.borderTopRightRadius = '0px';
        style.borderBottomLeftRadius = value;
        style.borderBottomRightRadius = value;
        style.borderRadius = `0px 0px ${value} ${value}`;
      }
      
      this.emitStyles();
    },
    updateIndividualRadius(corner, value) {
      this.styles[this.activeTarget][this.activeSection][corner] = value;
      
      const style = this.currentStyle;
      const topLeft = style.borderTopLeftRadius;
      const topRight = style.borderTopRightRadius;
      const bottomLeft = style.borderBottomLeftRadius;
      const bottomRight = style.borderBottomRightRadius;
      
      style.borderRadius = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
      this.emitStyles();
    },
    getCurrentRadiusValue() {
      const style = this.currentStyle;
      if (this.borderRadiusMode === 'all') {
        return style.borderTopLeftRadius;
      } else if (this.borderRadiusMode === 'top') {
        return style.borderTopLeftRadius;
      } else if (this.borderRadiusMode === 'bottom') {
        return style.borderBottomLeftRadius;
      }
      return '0px';
    }
  },
  mounted() {
    this.emitStyles();
  }
};
</script>

<template>
  <!-- Floating Toggle Button -->
  <div class="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
    <button
      @click="togglePanel"
      :class="[
        'bg-indigo-600 hover:bg-indigo-700 text-white p-3 shadow-lg transition-all duration-300',
        isOpen ? 'rounded-l-lg' : 'rounded-l-lg translate-x-0'
      ]"
      title="Style Panel"
    >
      <font-awesome-icon 
        :icon="['fas', isOpen ? 'times' : 'palette']" 
        class="h-5 w-5" 
      />
    </button>
  </div>

  <!-- Floating Panel -->
  <div
    :class="[
      'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-40',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="bg-indigo-600 text-white p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Style Panel</h2>
            <p class="text-indigo-200 text-sm">Customize panel appearances</p>
          </div>
          <button
            @click="togglePanel"
            class="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Target Selection -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">เลือกประเภท Panel</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="target in ['row', 'column', 'object']"
            :key="target"
            @click="setTarget(target)"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
              activeTarget === target
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            ]"
          >
            <font-awesome-icon 
              :icon="['fas', target === 'row' ? 'minus' : target === 'column' ? 'columns' : 'cube']" 
              class="h-3 w-3 mr-1" 
            />
            {{ target.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Section Selection -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">เลือกส่วน Panel</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="section in ['head', 'body', 'footer']"
            :key="section"
            @click="setSection(section)"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
              activeSection === section
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            ]"
          >
            {{ section.charAt(0).toUpperCase() + section.slice(1) }}
          </button>
        </div>
      </div>

      <!-- Style Controls -->
      <div class="flex-1 overflow-y-auto p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-4">
          จัดการสไตล์ {{ activeTarget.toUpperCase() }} - {{ activeSection.toUpperCase() }}
        </h3>

        <!-- Preview -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">ตัวอย่าง</label>
          <div
            :style="previewStyle"
            class="p-3 text-center"
          >
            {{ activeTarget.toUpperCase() }} {{ activeSection.toUpperCase() }}
          </div>
        </div>

        <!-- Background Color -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">สีพื้นหลัง</label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              :value="currentStyle.backgroundColor"
              @input="updateStyle('backgroundColor', $event.target.value)"
              class="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              :value="currentStyle.backgroundColor"
              @input="updateStyle('backgroundColor', $event.target.value)"
              class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <!-- Border Color -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">สีขอบ</label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              :value="currentStyle.borderColor"
              @input="updateStyle('borderColor', $event.target.value)"
              class="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              :value="currentStyle.borderColor"
              @input="updateStyle('borderColor', $event.target.value)"
              class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="#e5e7eb"
            />
          </div>
        </div>

        <!-- Border Width -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">ความหนาขอบ</label>
          <select
            :value="currentStyle.borderWidth"
            @change="updateStyle('borderWidth', $event.target.value)"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="0px">ไม่มีขอบ</option>
            <option value="1px">บาง (1px)</option>
            <option value="2px">ปานกลาง (2px)</option>
            <option value="3px">หนา (3px)</option>
            <option value="4px">หนาพิเศษ (4px)</option>
          </select>
        </div>

        <!-- Border Radius -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">ความโค้งขอบ</label>
          
          <!-- Border Radius Mode Selection -->
          <div class="mb-3">
            <div class="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                @click="setBorderRadiusMode('all')"
                :class="[
                  'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                  borderRadiusMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
                title="ทั้งหมด"
              >
                ทั้งหมด
              </button>
              <button
                @click="setBorderRadiusMode('top')"
                :class="[
                  'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                  borderRadiusMode === 'top' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
                title="เฉพาะบน"
              >
                บน
              </button>
              <button
                @click="setBorderRadiusMode('bottom')"
                :class="[
                  'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                  borderRadiusMode === 'bottom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
                title="เฉพาะล่าง"
              >
                ล่าง
              </button>
              <button
                @click="setBorderRadiusMode('individual')"
                :class="[
                  'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                  borderRadiusMode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
                title="แยกแต่ละมุม"
              >
                แยก
              </button>
            </div>
          </div>

          <!-- Simple Mode Controls -->
          <div v-if="borderRadiusMode !== 'individual'">
            <select
              :value="getCurrentRadiusValue()"
              @change="updateBorderRadius($event.target.value)"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="0px">เหลี่ยม</option>
              <option value="4px">โค้งเล็กน้อย</option>
              <option value="6px">โค้งปานกลาง</option>
              <option value="8px">โค้งมาก</option>
              <option value="12px">โค้งมากพิเศษ</option>
              <option value="16px">โค้งมากที่สุด</option>
              <option value="50%">กลม</option>
            </select>
          </div>

          <!-- Individual Corner Controls -->
          <div v-if="borderRadiusMode === 'individual'" class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <!-- Top Left -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">บนซ้าย</label>
                <select
                  :value="currentStyle.borderTopLeftRadius"
                  @change="updateIndividualRadius('borderTopLeftRadius', $event.target.value)"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="0px">0px</option>
                  <option value="4px">4px</option>
                  <option value="6px">6px</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                </select>
              </div>
              
              <!-- Top Right -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">บนขวา</label>
                <select
                  :value="currentStyle.borderTopRightRadius"
                  @change="updateIndividualRadius('borderTopRightRadius', $event.target.value)"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="0px">0px</option>
                  <option value="4px">4px</option>
                  <option value="6px">6px</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <!-- Bottom Left -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">ล่างซ้าย</label>
                <select
                  :value="currentStyle.borderBottomLeftRadius"
                  @change="updateIndividualRadius('borderBottomLeftRadius', $event.target.value)"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="0px">0px</option>
                  <option value="4px">4px</option>
                  <option value="6px">6px</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                </select>
              </div>
              
              <!-- Bottom Right -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">ล่างขวา</label>
                <select
                  :value="currentStyle.borderBottomRightRadius"
                  @change="updateIndividualRadius('borderBottomRightRadius', $event.target.value)"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="0px">0px</option>
                  <option value="4px">4px</option>
                  <option value="6px">6px</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="16px">16px</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Text Color -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">สีข้อความ</label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              :value="currentStyle.textColor"
              @input="updateStyle('textColor', $event.target.value)"
              class="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              :value="currentStyle.textColor"
              @input="updateStyle('textColor', $event.target.value)"
              class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="#111827"
            />
          </div>
        </div>

        <!-- Quick Presets -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">Presets ที่ใช้บ่อย</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="updateStyle('backgroundColor', '#f3f4f6'); updateStyle('borderColor', '#d1d5db')"
              class="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              Gray Light
            </button>
            <button
              @click="updateStyle('backgroundColor', '#dbeafe'); updateStyle('borderColor', '#3b82f6')"
              class="px-2 py-1 text-xs bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
            >
              Blue Light
            </button>
            <button
              @click="updateStyle('backgroundColor', '#dcfce7'); updateStyle('borderColor', '#16a34a')"
              class="px-2 py-1 text-xs bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors"
            >
              Green Light
            </button>
            <button
              @click="updateStyle('backgroundColor', '#fef2f2'); updateStyle('borderColor', '#dc2626')"
              class="px-2 py-1 text-xs bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
            >
              Red Light
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <button
          @click="resetToDefaults"
          class="w-full px-3 py-2 text-xs font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'undo']" class="h-3 w-3 mr-1" />
          รีเซ็ตเป็นค่าเริ่มต้น
        </button>
      </div>

      <!-- JSON Output -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-medium text-gray-700">JSON Configuration</h3>
          <button
            @click="copyJsonToClipboard"
            class="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'copy']" class="h-3 w-3 mr-1" />
            Copy
          </button>
        </div>
        <textarea
          :value="stylesJson"
          readonly
          class="w-full h-32 px-2 py-1 text-xs font-mono bg-gray-50 border border-gray-300 rounded resize-none focus:outline-none"
        ></textarea>
      </div>
    </div>
  </div>

  <!-- Overlay -->
  <div
    v-if="isOpen"
    @click="togglePanel"
    class="fixed inset-0 bg-black bg-opacity-25 z-30"
  ></div>
</template>

<style scoped>
/* Custom scrollbar for the panel */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 