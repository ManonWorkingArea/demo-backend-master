<template>
  <div class="icon-picker relative">
    <!-- Icon Display Button -->
    <button 
      @click="togglePanel"
      class="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      :class="{'border-blue-500 bg-blue-50': showPanel}"
    >
      <font-awesome-icon 
        :icon="['fas', selectedIcon || 'home']" 
        class="text-gray-600 text-sm"
        :class="{'text-blue-600': showPanel}"
      />
    </button>

    <!-- Overlay -->
    <div 
      v-if="showPanel" 
      @click="togglePanel"
      class="fixed inset-0 bg-black bg-opacity-20 z-40"
    ></div>

    <!-- Icon Panel -->
    <div 
      v-if="showPanel" 
      class="absolute top-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-80 max-h-96 overflow-hidden"
    >
      <!-- Panel Header -->
      <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">เลือกไอคอน</h3>
          <button 
            @click="togglePanel"
            class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-xs" />
          </button>
        </div>
      </div>

      <!-- Icon Groups -->
      <div class="max-h-80 overflow-y-auto">
        <div v-for="(icons, groupName) in validatedIconGroups" :key="groupName" class="p-4 border-b border-gray-100 last:border-b-0">
          <!-- Group Header -->
          <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            {{ groupName }}
          </h4>
          
          <!-- Icons Grid -->
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="(icon, index) in icons" 
              :key="index"
              @click="selectIcon(icon)"
              class="group relative w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              :class="{
                'border-blue-500 bg-blue-100 text-blue-600': icon === selectedIcon,
                'text-gray-600': icon !== selectedIcon
              }"
              @mouseenter="showTooltip(groupName, index)"
              @mouseleave="hideTooltip(groupName, index)"
            >
              <font-awesome-icon 
                :icon="['fas', icon]" 
                class="text-xs transition-colors"
              />
              
              <!-- Tooltip -->
              <div 
                v-if="isTooltipActive(groupName, index)"
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ formattedIconName(icon) }}
                <!-- Tooltip Arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>เลือกไอคอนที่ต้องการ</span>
          <span v-if="selectedIcon" class="font-medium text-gray-700">
            {{ formattedIconName(selectedIcon) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    statusIndex: Number,
    icon: String,
  },
  data() {
    const iconGroups = {
      "สำนักงาน": [
        "home",
        "briefcase",
        "desktop",
        "building",
        "school",
        "university",
        "file",
        "pen",
        "calendar",
        "clock",
        "flag",
        "trophy",
        "book",
        "archive",
      ],
      "อารมณ์": [
        "heart",
        "thumbs-up",
        "smile",
        "laugh",
        "grin",
        "meh",
        "frown",
        "angry",
        "surprise",
        "kiss",
        "star",
        "fire",
      ],
      "สถานะ": [
        "cog",
        "globe",
        "bell",
        "comments",
        "music",
        "rocket",
        "check",
        "times",
        "check-circle",
        "times-circle",
        "exclamation-triangle",
        "info-circle",
        "question-circle",
        "plus-circle",
        "minus-circle",
      ],
      "การเงิน": [
        "credit-card",
        "shopping-bag",
        "shopping-cart",
        "wallet",
        "money-bill-wave",
        "receipt",
        "tag",
        "gift",
        "dollar-sign",
        "coins",
        "cash-register",
      ],
      "เอกสาร": [
        "file-alt",
        "file-pdf",
        "file-word",
        "file-excel",
        "file-powerpoint",
        "file-image",
        "file-video",
        "folder",
        "folder-open",
        "copy",
        "clipboard",
        "download",
        "upload",
      ],
      "เทคโนโลยี": [
        "laptop",
        "mobile",
        "tablet",
        "keyboard",
        "mouse",
        "server",
        "database",
        "wifi",
        "code",
        "terminal",
        "bug",
        "cogs",
        "microchip",
      ],
    };

    const defaultIcon = 'home';
    const selectedIcon = this.value || this.icon || defaultIcon;
    
    return {
      iconGroups,
      selectedIcon,
      showPanel: false,
      tooltipIndexes: {},
    };
  },
  watch: {
    value(newValue) {
      this.selectedIcon = newValue;
    },
  },
  computed: {
    validatedIconGroups() {
      return Object.fromEntries(
        Object.entries(this.iconGroups).map(([groupName, icons]) => [
          groupName,
          icons.filter(icon => typeof icon === 'string' && icon.trim() !== ''),
        ])
      );
    },
  },
  methods: {
    selectIcon(icon) {
      this.selectedIcon = icon || 'home';
      this.$emit("input", { icon: this.selectedIcon, statusIndex: this.statusIndex });
      this.showPanel = false;
    },
    togglePanel() {
      this.showPanel = !this.showPanel;
    },
    formattedIconName(icon) {
      return icon.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    showTooltip(groupName, index) {
      this.tooltipIndexes[groupName] = index;
    },
    hideTooltip(groupName) {
      delete this.tooltipIndexes[groupName];
    },
    isTooltipActive(groupName, index) {
      return this.tooltipIndexes[groupName] === index;
    },
  },
  mounted() {
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showPanel = false;
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closePanel);
  },
};
</script>

<style scoped>
/* Custom scrollbar for icon panel */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-picker .absolute {
  animation: fadeIn 0.2s ease-out;
}

/* Tooltip specific styles */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Focus visible for accessibility */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
  
  