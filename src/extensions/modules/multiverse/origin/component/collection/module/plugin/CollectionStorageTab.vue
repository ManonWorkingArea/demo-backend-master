<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-gray-900">พื้นที่จัดเก็บข้อมูล</h2>
          <p class="text-gray-500 text-sm mt-1">จัดการไฟล์และข้อมูล</p>
        </div>
        
        <!-- Storage Stats -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-blue-50 rounded-lg px-3 py-2 min-w-[80px]">
            <div class="text-lg font-semibold text-blue-600">{{ formatFileSize(spaceData.usedSpace || 0) }}</div>
            <div class="text-xs text-blue-600">ใช้แล้ว</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2 min-w-[80px]">
            <div class="text-lg font-semibold text-gray-600">{{ formatFileSize(spaceData.totalSpace || 1073741824) }}</div>
            <div class="text-xs text-gray-600">ทั้งหมด</div>
          </div>
          <div class="bg-green-50 rounded-lg px-3 py-2 min-w-[80px]">
            <div class="text-lg font-semibold text-green-600">{{ formatFileSize((spaceData.totalSpace || 1073741824) - (spaceData.usedSpace || 0)) }}</div>
            <div class="text-xs text-green-600">เหลือ</div>
          </div>
        </div>
      </div>
      
      <!-- Storage Usage Bar -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">การใช้พื้นที่</span>
          <span class="text-sm text-gray-500">
            {{ Math.round(((spaceData.usedSpace || 0) / (spaceData.totalSpace || 1073741824)) * 100) }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: Math.round(((spaceData.usedSpace || 0) / (spaceData.totalSpace || 1073741824)) * 100) + '%' }">
          </div>
        </div>
      </div>
    </div>
    
    <!-- File Manager Content -->
    <div>
      <FileManager :Mode='"static"' :Client="collectionData._id" :Space="spaceData"/>
    </div>
  </div>
</template>

<script>
import FileManager from '@/interface/template/FileManager.vue'

export default {
  name: 'CollectionStorageTab',
  components: {
    FileManager
  },
  props: {
    spaceData: {
      type: Object,
      required: true,
      default: () => ({})
    },
    collectionData: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
}
</script>

<style scoped>
/* Clean transitions */
button,
.transition-colors {
  transition: all 0.2s ease;
}

/* Stats cards hover effect */
.bg-blue-50:hover,
.bg-gray-50:hover,
.bg-green-50:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* Progress bar smooth animation */
.transition-all {
  transition: all 0.3s ease;
}
</style>
