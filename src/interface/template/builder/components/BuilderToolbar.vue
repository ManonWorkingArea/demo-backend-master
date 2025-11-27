<template>
  <!-- Professional Builder Toolbar -->
  <div 
    :class="[
      'bg-white border-b border-gray-200 shadow-sm transition-all duration-300',
      isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg sticky-toolbar' : 'relative'
    ]"
  >
    <div class="px-6">
      <div class="flex items-center justify-between py-3">
        <!-- Left: Tool Groups -->
        <div class="flex items-center space-x-6">
          <!-- Layout Tools -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">Layout</span>
            <div class="flex items-center space-x-1">
              <!-- Add Row Dropdown -->
              <div class="relative" ref="addRowDropdown">
                <button 
                  @click="toggleAddRowDropdown"
                  v-tooltip="'เพิ่มแถวใหม่'"
                  class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3 ml-1" />
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="showAddRowDropdown"
                  class="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div class="py-1">
                    <button
                      @click="handleAddEmptyRow"
                      class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
                    >
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div class="font-medium">Add Empty Row</div>
                        <div class="text-xs text-gray-500">เพิ่มแถวเปล่าใหม่</div>
                      </div>
                    </button>
                    
                    <div class="border-t border-gray-100 my-1"></div>
                    
                    <button
                      @click="handleAddFromTemplate"
                      class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
                    >
                      <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div class="font-medium">From Block Template</div>
                        <div class="text-xs text-gray-500">เลือกจาก Template ที่บันทึกไว้</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <button 
                @click="$emit('toggle-grid')"
                v-tooltip="showGridLines ? 'ซ่อนเส้นตาราง' : 'แสดงเส้นตาราง'"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  showGridLines 
                    ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                ]"
              >
                <font-awesome-icon :icon="['fas', 'th']" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Actions Tools -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">Actions</span>
            <div class="flex items-center space-x-1">
              <button 
                @click="$emit('undo')"
                :disabled="!canUndo"
                v-tooltip="'ยกเลิกการกระทำล่าสุด (Ctrl+Z)'"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  canUndo 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
                ]"
              >
                <font-awesome-icon :icon="['fas', 'undo']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('redo')"
                :disabled="!canRedo"
                v-tooltip="'ทำซ้ำการกระทำ (Ctrl+Y)'"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  canRedo 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
                ]"
              >
                <font-awesome-icon :icon="['fas', 'redo']" class="h-4 w-4" />
              </button>
              <div class="w-px h-6 bg-gray-300"></div>
              <!-- Export/Import Buttons -->
              <button 
                @click="$emit('export-json')"
                v-tooltip="'ส่งออกเป็น JSON'"
                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('import-json')"
                v-tooltip="'นำเข้าจาก JSON'"
                class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'upload']" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- View Tools -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">View</span>
            <div class="flex items-center space-x-1">
              <button 
                @click="$emit('open-css-modal')"
                v-tooltip="'แก้ไข CSS'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'palette']" class="h-4 w-4" />
              </button>
              <div class="w-px h-6 bg-gray-300"></div>
              <button 
                @click="$emit('open-revision-history')"
                v-tooltip="'ประวัติการแก้ไข'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('reload-data')"
                v-tooltip="'รีโหลดข้อมูล'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'sync-alt']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('zoom-in')"
                v-tooltip="'ขยายภาพ'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'search-plus']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('zoom-out')"
                v-tooltip="'ย่อภาพ'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'search-minus']" class="h-4 w-4" />
              </button>
              <button 
                @click="$emit('fit-to-screen')"
                v-tooltip="'ปรับขนาดให้พอดีหน้าจอ'"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Device Preview & Actions -->
        <div class="flex items-center space-x-4">
          <!-- Device Preview -->
          <div class="flex items-center space-x-2">
            <!-- Device Preview Toggle -->
            <button 
              v-if="!showDevicePreview"
              @click="$emit('toggle-device-preview')"
              v-tooltip="'แสดงตัวอย่างบนอุปกรณ์'"
              class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span class="text-sm font-medium">Preview</span>
            </button>
            
            <!-- Device Preview Buttons (แสดงเมื่อ toggle เปิด) -->
            <div v-if="showDevicePreview" class="flex items-center bg-gray-100 rounded-lg p-1">
              <button 
                @click="$emit('set-viewport', 'desktop')"
                v-tooltip="'แสดงแบบคอมพิวเตอร์'"
                :class="[
                  'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                  currentViewport === 'desktop' ? 'text-white bg-gray-700' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Desktop
              </button>
              <button 
                @click="$emit('set-viewport', 'tablet')"
                v-tooltip="'แสดงแบบแท็บเล็ต'"
                :class="[
                  'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                  currentViewport === 'tablet' ? 'text-white bg-gray-700' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Tablet
              </button>
              <button 
                @click="$emit('set-viewport', 'mobile')"
                v-tooltip="'แสดงแบบมือถือ'"
                :class="[
                  'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                  currentViewport === 'mobile' ? 'text-white bg-gray-700' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Mobile
              </button>
              <div class="w-px h-4 bg-gray-300 mx-1"></div>
              <button 
                @click="$emit('toggle-device-preview')"
                v-tooltip="'ซ่อนตัวอย่างอุปกรณ์'"
                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <!-- Main Actions -->
          <div class="flex items-center space-x-2">
            <button 
              @click="$emit('open-css-modal')"
              v-tooltip="'แก้ไข CSS'"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'palette']" class="h-4 w-4" />
            </button>
            <div class="w-px h-6 bg-gray-300"></div>
            <button 
              @click="$emit('open-revision-history')"
              v-tooltip="'ประวัติการแก้ไข'"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
            </button>
            <button 
              @click="$emit('reload-data')"
              v-tooltip="'รีโหลดข้อมูล'"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'sync-alt']" class="h-4 w-4" />
            </button>
            <button 
              @click="$emit('save-data')"
              v-tooltip="'บันทึกการเปลี่ยนแปลง'"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'save']" class="h-4 w-4" />
            </button>
            <div class="w-px h-6 bg-gray-300"></div>
            <a 
              :href="backUrl"
              v-tooltip="'กลับหน้าหลัก'"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'home']" class="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Spacer div เมื่อ toolbar เป็น sticky -->
  <div v-if="isSticky" class="h-16"></div>

  <!-- Tooltip Component -->
  <div
    v-if="tooltip.show"
    ref="tooltipElement"
    :style="tooltip.style"
    class="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg pointer-events-none transition-all duration-200"
    :class="[
      tooltip.show ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      'tooltip-container'
    ]"
  >
    {{ tooltip.text }}
    <!-- Tooltip Arrow -->
    <div 
      class="absolute w-3 h-3 bg-gray-900 transform rotate-45 tooltip-arrow"
      :style="tooltip.arrowStyle"
      :class="{
        'bottom-full': tooltip.position === 'top',
        'top-full': tooltip.position === 'bottom'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'BuilderToolbar',
  props: {
    isSticky: {
      type: Boolean,
      default: false
    },
    showGridLines: {
      type: Boolean,
      default: true
    },
    showDevicePreview: {
      type: Boolean,
      default: false
    },
    currentViewport: {
      type: String,
      default: 'desktop'
    },
    backUrl: {
      type: String,
      required: true
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showAddRowDropdown: false,
      tooltip: {
        show: false,
        text: '',
        style: {},
        arrowStyle: {},
        position: 'bottom'
      },
      tooltipTimeout: null
    };
  },
  directives: {
    tooltip: {
      mounted(el, binding) {
        const text = binding.value;
        if (!text) return;

        const showTooltip = () => {
          const instance = binding.instance;
          clearTimeout(instance.tooltipTimeout);
          instance.tooltipTimeout = setTimeout(() => {
            instance.showTooltip(text, el);
          }, 100);
        };

        const hideTooltip = () => {
          const instance = binding.instance;
          clearTimeout(instance.tooltipTimeout);
          instance.tooltipTimeout = setTimeout(() => {
            instance.hideTooltip();
          }, 100);
        };

        el._tooltipEvents = { showTooltip, hideTooltip };
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('focus', showTooltip);
        el.addEventListener('blur', hideTooltip);
      },
      updated(el, binding) {
        const text = binding.value;
        if (el._tooltipText === text) return;
        el._tooltipText = text;
      },
      unmounted(el) {
        if (el._tooltipEvents) {
          el.removeEventListener('mouseenter', el._tooltipEvents.showTooltip);
          el.removeEventListener('mouseleave', el._tooltipEvents.hideTooltip);
          el.removeEventListener('focus', el._tooltipEvents.showTooltip);
          el.removeEventListener('blur', el._tooltipEvents.hideTooltip);
        }
      }
    }
  },
  methods: {
    toggleAddRowDropdown() {
      this.showAddRowDropdown = !this.showAddRowDropdown;
    },
    closeAddRowDropdown() {
      this.showAddRowDropdown = false;
    },
    handleAddEmptyRow() {
      this.$emit('add-row');
      this.closeAddRowDropdown();
    },
    handleAddFromTemplate() {
      this.$emit('add-from-template');
      this.closeAddRowDropdown();
    },
    // Tooltip methods
    showTooltip(text, element) {
      if (!text || !element) return;
      
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Calculate approximate tooltip dimensions
      const tooltipWidth = Math.max(120, text.length * 6 + 16);
      const tooltipHeight = 32;
      const arrowSize = 6;
      const gap = 8;
      
      // Calculate element center position
      const elementCenterX = rect.left + scrollLeft + rect.width / 2;
      
      let position = 'bottom';
      let left = elementCenterX - tooltipWidth / 2;
      let top = rect.bottom + scrollTop + gap;
      
      // Check horizontal boundaries and adjust
      const minLeft = 8;
      const maxLeft = window.innerWidth - tooltipWidth - 8;
      
      if (left < minLeft) {
        left = minLeft;
      } else if (left > maxLeft) {
        left = maxLeft;
      }
      
      // Calculate arrow position - should always point to element center
      let arrowLeft = elementCenterX - left - arrowSize;
      let arrowTop = -arrowSize;
      
      // Check if tooltip goes below viewport, show above element
      if (top + tooltipHeight > window.innerHeight + scrollTop - 8) {
        position = 'top';
        top = rect.top + scrollTop - tooltipHeight - gap;
        arrowTop = tooltipHeight;
      }
      
      // Ensure arrow stays within tooltip bounds
      arrowLeft = Math.max(arrowSize, Math.min(arrowLeft, tooltipWidth - arrowSize * 2));
      
      this.tooltip = {
        show: true,
        text: text,
        position: position,
        style: {
          left: `${left}px`,
          top: `${top}px`,
          width: `${tooltipWidth}px`
        },
        arrowStyle: {
          left: `${arrowLeft}px`,
          top: `${arrowTop}px`
        }
      };
    },
    hideTooltip() {
      this.tooltip.show = false;
    },
    // Close dropdown when clicking outside
    handleClickOutside(event) {
      if (!this.$refs.addRowDropdown?.contains(event.target)) {
        this.closeAddRowDropdown();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  },
  emits: [
    'add-row',
    'add-from-template',
    'toggle-grid',
    'undo',
    'redo',
    'open-css-modal',
    'open-revision-history',
    'reload-data',
    'zoom-in',
    'zoom-out',
    'fit-to-screen',
    'toggle-device-preview',
    'set-viewport',
    'save-data',
    'export-json',
    'import-json'
  ]
}
</script>

<style scoped>
/* Sticky Toolbar Styles */
.sticky-toolbar {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.sticky-toolbar.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Smooth entrance animation for sticky toolbar */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toolbar-sticky-enter {
  animation: slideDown 0.3s ease-out;
}

/* Ensure toolbar content is above other content */
.sticky-toolbar {
  z-index: 50;
}

/* Tooltip Styles */
.tooltip-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: 200px;
  word-wrap: break-word;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 500;
  color: white;
  background-color: #374151;
  border-radius: 6px;
  padding: 6px 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  transform-origin: center;
}

.tooltip-container.opacity-0 {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.tooltip-container.opacity-100 {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Tooltip Arrow */
.tooltip-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #374151;
  transform: rotate(45deg);
  z-index: -1;
  border-radius: 1px;
}

/* Arrow positioning based on tooltip position */
.tooltip-container .tooltip-arrow.bottom-full {
  top: 100%;
  margin-top: -6px;
}

.tooltip-container .tooltip-arrow.top-full {
  bottom: 100%;
  margin-bottom: -6px;
}

/* Animation */
@keyframes tooltipFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes tooltipFadeOut {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }
}

.tooltip-enter-active {
  animation: tooltipFadeIn 0.15s ease-out;
}

.tooltip-leave-active {
  animation: tooltipFadeOut 0.15s ease-in;
}

/* Focus styles for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}
</style> 