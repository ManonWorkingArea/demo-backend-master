<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl shadow-xl border border-gray-200 rounded-lg overflow-hidden relative">
      <!-- Modern Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3 text-white" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">เลือกประเภทเนื้อหา</h2>
              <p class="text-xs text-gray-500">เลือกประเภทเนื้อหาที่ต้องการเพิ่ม</p>
            </div>
          </div>
          <button 
            @click="$emit('close')" 
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Breadcrumb Navigation -->
      <div v-if="breadcrumbs.length > 0" class="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <nav class="flex items-center space-x-2 text-sm">
          <button
            @click="navigateToLevel(0)"
            class="text-blue-600 hover:text-blue-800 font-medium"
          >
            หน้าหลัก
          </button>
          <template v-for="(breadcrumb, index) in breadcrumbs" :key="index">
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 text-gray-400" />
            <button
              @click="navigateToLevel(index + 1)"
              :class="[
                'font-medium',
                index === breadcrumbs.length - 1 
                  ? 'text-gray-900' 
                  : 'text-blue-600 hover:text-blue-800'
              ]"
            >
              {{ breadcrumb.name }}
            </button>
          </template>
        </nav>
      </div>
      
      <!-- Content -->
      <div class="px-4 py-4 max-h-[65vh] overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 text-gray-400 animate-spin" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">กำลังโหลด</h3>
          <p class="text-sm text-gray-500">กรุณารอสักครู่...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-8 w-8 text-red-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p class="text-sm text-red-500 mb-4">{{ error }}</p>
          <button
            @click="loadData(true)"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>

        <!-- Normal Content (when not loading or error) -->
        <template v-else>
          <!-- Search Box (แสดงเฉพาะหน้าหลัก) -->
          <div v-if="currentLevel === 0" class="mb-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon :icon="['fas', 'search']" class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาเนื้อหา..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Pinned Items Section (แสดงเฉพาะหน้าหลักและไม่มีการค้นหา) -->
          <div v-if="currentLevel === 0 && !searchQuery && pinnedItems.length > 0" class="mb-6">
            <div class="flex items-center mb-3">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'thumbtack']" class="h-4 w-4 text-amber-500" />
                <h3 class="text-sm font-medium text-gray-900">รายการที่ใช้บ่อย</h3>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">{{ pinnedItems.length }}</span>
              </div>
            </div>
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div
                v-for="item in pinnedItems"
                :key="`pinned-${item.id || item.type}`"
                @click="handleItemClick(item)"
                class="group flex flex-col items-center justify-center cursor-pointer py-3 px-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200"
              >
                <div class="relative mb-2">
                  <div class="w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                    <font-awesome-icon
                      :icon="['fas', item.icon || 'file']"
                      class="h-5 w-5 text-amber-600"
                    />
                  </div>
                  <!-- Pin Badge -->
                  <span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', 'thumbtack']" class="h-1.5 w-1.5 text-white" />
                  </span>
                  <!-- Category Badge -->
                  <span 
                    class="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 text-xs rounded-full leading-none"
                    :style="{ 
                      backgroundColor: getCategoryColor(item.category),
                      color: 'white',
                      fontSize: '9px'
                    }"
                  >
                    {{ getCategoryAbbr(item.category) }}
                  </span>
                </div>
                <div class="text-center">
                  <h4 class="text-xs font-medium text-gray-700 line-clamp-1">{{ item.name }}</h4>
                </div>
              </div>
            </div>
            <!-- Divider -->
            <div class="border-t border-gray-200 mb-4"></div>
          </div>

          <!-- Folders Section -->
          <div v-if="currentLevel === 0 && !searchQuery" class="mb-4">
            <div class="flex items-center mb-3">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'folder']" class="h-4 w-4 text-blue-500" />
                <h3 class="text-sm font-medium text-gray-900">หมวดหมู่เนื้อหา</h3>
              </div>
            </div>
          </div>

          <!-- Items Grid -->
          <div v-if="displayItems.length > 0" class="grid grid-cols-6 gap-3">
            <div
              v-for="item in displayItems"
              :key="item.id || item.type"
              @click="handleItemClick(item)"
              class="group flex flex-col items-center justify-center cursor-pointer py-3 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div class="relative mb-2">
                <div 
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    item.isFolder ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100 group-hover:bg-gray-200'
                  ]"
                >
                  <font-awesome-icon
                    :icon="['fas', item.icon || 'file']"
                    :class="[
                      'h-5 w-5',
                      item.isFolder ? 'text-blue-600' : 'text-gray-500'
                    ]"
                  />
                </div>
                <!-- Category Badge (แสดงเฉพาะ items ที่ไม่ใช่ folder) -->
                <span 
                  v-if="!item.isFolder && item.category"
                  class="absolute -top-1 -right-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full leading-none"
                  :style="{ backgroundColor: getCategoryColor(item.category) }"
                >
                  {{ getCategoryAbbr(item.category) }}
                </span>
              </div>
              <div class="text-center">
                <h3 class="text-xs font-medium mb-1 text-gray-700">{{ item.name }}</h3>
                <p v-if="item.description" class="text-xs text-gray-600 line-clamp-2 leading-tight">
                  {{ item.description }}
                </p>
                <p v-else class="text-xs text-gray-400 italic">{{ item.isFolder ? 'โฟลเดอร์' : 'ไม่มีคำอธิบาย' }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'search']" class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการ</h3>
            <p class="text-sm text-gray-500">
              {{ searchQuery ? `ไม่พบรายการที่ตรงกับ "${searchQuery}"` : 'ไม่พบรายการในโฟลเดอร์นี้' }}
            </p>
            <button
              v-if="currentLevel > 0"
              @click="navigateBack()"
              class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              กลับไปโฟลเดอร์ก่อนหน้า
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// Import functions from builderItems.js
import { getHierarchicalItems, getQuickAccessItems } from '../plugin/builderItems.js';

export default {
  name: 'ContentSelectorModal',
  emits: [
    'close',
    'item-click'
  ],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    rowIndex: {
      type: Number,
      default: null
    },
    columnIndex: {
      type: Number,
      default: null
    },
    builderDataType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentLevel: 0,
      navigationStack: [],
      breadcrumbs: [],
      selectedCategory: 'all',
      searchQuery: '',
      items: [],
      pinnedItems: [],
      loading: false,
      error: null
    };
  },
  computed: {
    currentItems() {
      if (this.currentLevel === 0) {
        return this.filteredRootItems;
      } else {
        const currentFolder = this.navigationStack[this.currentLevel - 1];
        const items = currentFolder?.children || [];
        const activeItems = items.filter(item => item.status === true || item.isFolder);
        return this.sortItemsWithFoldersFirst(activeItems);
      }
    },
    
    filteredRootItems() {
      let filteredItems = this.items;
      
      if (this.builderDataType === "form") {
        filteredItems = this.items;
      } else {
        filteredItems = this.items.filter((item) => item.type !== "form");
      }
      
      return this.sortItemsWithFoldersFirst(filteredItems);
    },
    
    currentFolder() {
      if (this.currentLevel === 0) return null;
      return this.navigationStack[this.currentLevel - 1];
    },
    
    filteredItems() {
      let items = this.items;
      
      if (this.searchQuery) {
        const searchResults = [];
        const searchTerm = this.searchQuery.toLowerCase();
        
        items.forEach(folder => {
          if (folder.name.toLowerCase().includes(searchTerm)) {
            searchResults.push(folder);
          }
          
          if (folder.children) {
            folder.children.forEach(child => {
              if (child.status === true && (
                child.name.toLowerCase().includes(searchTerm) || 
                (child.description && child.description.toLowerCase().includes(searchTerm))
              )) {
                searchResults.push(child);
              }
            });
          }
        });
        
        return searchResults;
      }
      
      return items;
    },
    
    availableCategories() {
      const categories = new Set(this.items.map(item => item.category));
      const categoryMapping = {
        'content': 'เนื้อหา',
        'form': 'ฟอร์ม',
        'lesson': 'บทเรียน',
        'nav': 'เมนู',
        'dashboard': 'แดชบอร์ด'
      };
      
      return Array.from(categories).map(category => ({
        key: category,
        name: categoryMapping[category] || category
      }));
    },
    
    displayItems() {
      if (this.currentLevel === 0) {
        return this.filteredItems;
      } else {
        const currentFolder = this.navigationStack[this.currentLevel - 1];
        const items = currentFolder?.children || [];
        const activeItems = items.filter(item => item.status === true || item.isFolder);
        return this.sortItemsWithFoldersFirst(activeItems);
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          this.resetNavigation();
          await this.loadData();
        }
      }
    }
  },
  methods: {
    async loadData(forceRefresh = false) {
      try {
        this.loading = true;
        this.error = null;
        
        // Load builder items
        this.items = await getHierarchicalItems(forceRefresh);
        
        // Load pinned items
        this.pinnedItems = await getQuickAccessItems();
      } catch (error) {
        console.error('Error loading data:', error);
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      } finally {
        this.loading = false;
      }
    },
    
    handleItemClick(item) {
      if (item.isFolder || (item.children && item.children.length > 0)) {
        this.navigateToFolder(item);
      } else {
        this.$emit('item-click', {
          item,
          rowIndex: this.rowIndex,
          columnIndex: this.columnIndex
        });
      }
    },
    
    navigateToFolder(folder) {
      this.navigationStack.push(folder);
      this.breadcrumbs.push({
        name: folder.name,
        folder: folder
      });
      this.currentLevel++;
    },
    
    navigateBack() {
      if (this.currentLevel > 0) {
        this.navigationStack.pop();
        this.breadcrumbs.pop();
        this.currentLevel--;
      }
    },
    
    navigateToLevel(level) {
      while (this.currentLevel > level) {
        this.navigationStack.pop();
        this.breadcrumbs.pop();
        this.currentLevel--;
      }
    },
    
    resetNavigation() {
      this.currentLevel = 0;
      this.navigationStack = [];
      this.breadcrumbs = [];
      this.searchQuery = '';
    },
    
    sortItemsWithFoldersFirst(items) {
      const folders = items.filter(item => item.isFolder || item.children);
      const regularItems = items.filter(item => !item.isFolder && !item.children);
      return [...folders, ...regularItems];
    },
    
    getCategoryColor(category) {
      const colorMapping = {
        'content': '#3b82f6',
        'form': '#10b981',
        'lesson': '#f59e0b',
        'nav': '#8b5cf6',
        'dashboard': '#ef4444'
      };
      return colorMapping[category] || '#6b7280';
    },
    
    getCategoryAbbr(category) {
      const abbrMapping = {
        'content': 'CN',
        'form': 'FM',
        'lesson': 'LS',
        'nav': 'NV',
        'dashboard': 'DB'
      };
      return abbrMapping[category] || category.substring(0, 2).toUpperCase();
    }
  }
};
</script>

<style scoped>
/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced hover effects */
.group:hover .w-8 {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.group:hover .w-10 {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Pin badge animation */
.group:hover [class*="thumbtack"] {
  animation: wiggle 0.3s ease-in-out;
}

@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-8 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .grid-cols-6 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid-cols-8 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Category badge positioning */
.absolute.-bottom-0\.5.-right-0\.5 {
  bottom: -2px;
  right: -2px;
}

.absolute.-top-0\.5.-right-0\.5 {
  top: -2px;
  right: -2px;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Search input focus styles */
.focus\:ring-2:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5);
}

/* Modal backdrop blur effect */
.bg-black.bg-opacity-50 {
  backdrop-filter: blur(4px);
}
</style>