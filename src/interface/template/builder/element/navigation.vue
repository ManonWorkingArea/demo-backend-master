<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 text-gray-400 pt-1">
            <!-- Heroicon name: outline/menu-alt-2 -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate" :title="localItem.menuName || 'Navigation Menu'">
              {{ localItem.menuName || 'Navigation Menu' }}
            </p>
            <p v-if="localItem.display" class="text-xs text-gray-500 truncate">
              Display: {{ localItem.display }}
            </p>
            <p v-if="localItem.alignment" class="text-xs text-gray-500 truncate">
              Alignment: {{ localItem.alignment }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto p-2" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
        <div class="section-group">
          <div class="border-b border-gray-200 pb-3 mb-3">
            <span class="popup-label block font-bold text-lg">Navigation Configuration</span>
            <span class="popup-label text-gray-500">Configure the navigation menu and its appearance.</span>
          </div>
        </div>

        <div class="section-group mb-4">
          <label class="popup-label block mb-1 font-semibold">Selected Menu:</label>
          <select
            :value="localItem.menu" 
            @change="handleMenuSelection($event.target.value)"
            class="popup-input w-full rounded-sm border border-gray-200"
          >
            <option value="" disabled>-- Select a Menu --</option>
            <option v-for="menu in menuItems" :key="menu._id" :value="menu._id">
              {{ menu.title }}
            </option>
          </select>
          <p v-if="localItem.menuName" class="text-xs text-gray-500 mt-1">Current selection: {{ localItem.menuName }}</p>
        </div>

        <div class="section-group mt-4 pt-3 border-t border-gray-100">
          <label class="popup-label block mb-2 font-semibold">Style Configuration:</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <div>
              <label class="popup-label text-sm">Text Alignment:</label>
              <select v-model="localItem.alignment" class="popup-input w-full text-sm mt-0.5">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label class="popup-label text-sm">Display Mode:</label>
              <select v-model="localItem.display" class="popup-input w-full text-sm mt-0.5">
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <div>
              <label class="popup-label text-sm">Font Size (px):</label>
              <input v-model.number="localItem.fontSize" type="number" class="popup-input w-full text-sm mt-0.5" placeholder="e.g., 16"/>
            </div>
            <div>
              <label class="popup-label text-sm block">Font Color:</label>
              <ColorPicker
                :defaultColor="localItem.fontColor"
                @selectColor="updateFontColor"
                class="w-full mt-0.5"
              />
              <div class="selected-color-preview mt-1 h-5 w-full border rounded" :style="{ background: localItem.fontColor || 'transparent' }"></div>
            </div>
            <div>
              <label class="popup-label text-sm block">Hover Color:</label>
              <ColorPicker
                :defaultColor="localItem.hoverColor"
                @selectColor="updateHoverColor"
                class="w-full mt-0.5"
              />
              <div class="selected-color-preview mt-1 h-5 w-full border rounded" :style="{ background: localItem.hoverColor || 'transparent' }"></div>
            </div>
            <div>
              <label class="popup-label text-sm">Menu Item Spacing (px):</label>
              <input v-model.number="localItem.itemSpace" type="number" class="popup-input w-full text-sm mt-0.5" placeholder="e.g., 10"/>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// Assuming ColorPicker is globally registered or you will adjust the import path.
// import ColorPicker from '@/path/to/ColorPicker.vue'; 
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// library.add(fas);

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  name: 'NavigationElement',
  components: {
    // FontAwesomeIcon,
    // ColorPicker, // Uncomment if imported locally
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          id: generateUid(),
          type: 'navigation',
          menu: '',
          menuName: '',
          alignment: 'left',
          display: 'horizontal',
          fontSize: 16,
          fontColor: '#000000',
          hoverColor: '#cccccc',
          itemSpace: 10,
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
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
  methods: {
    handleMenuSelection(selectedMenuId) {
      const selectedMenu = this.menuItems.find(menu => menu._id === selectedMenuId);
      if (selectedMenu) {
        this.localItem.menu = selectedMenu._id;
        this.localItem.menuName = selectedMenu.title;
      } else {
        this.localItem.menu = '';
        this.localItem.menuName = '';
      }
    },
    updateFontColor(color) {
      this.localItem.fontColor = color;
    },
    updateHoverColor(color) {
      this.localItem.hoverColor = color;
    },
  },
  created() {
    // Initialize with current menuName if menu ID exists
    if (this.localItem.menu && this.menuItems.length > 0) {
        const selectedMenu = this.menuItems.find(menu => menu._id === this.localItem.menu);
        if (selectedMenu) {
            this.localItem.menuName = selectedMenu.title;
        } else {
             // If menu ID is set but not found in current menuItems, clear it
             this.localItem.menu = '';
             this.localItem.menuName = '';
        }
    }
  }
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
}
.popup-input {
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  padding: 0.375rem 0.625rem; 
  font-size: 0.8125rem; 
  border-radius: 0.25rem; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
  background-color: white;
}
.popup-input:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6; 
}
.selected-color-preview {
  height: 1.25rem; /* h-5 */
  width: 100%;
  border: 1px solid #e5e7eb; /* border-gray-200 */
  border-radius: 0.25rem; /* rounded */
}
</style>
  