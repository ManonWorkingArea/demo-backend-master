<template>
  <li class="relative" :class="{ 'selected': file._id === selectItem }">
    <!-- Folder Item -->
    <div 
      v-if="file.mimetype === 'folder'"
      :class="'folder-' + file._id"
      @click.stop="$emit('select', file.name)"
      @contextmenu.stop="onContextMenu($event, file.name, file.name, file._id, file.count)"
      @dblclick.stop="$emit('open-folder', file.path)"
      class="folder-container flex flex-col items-center justify-center cursor-pointer"
    >
      <div class="folder-content">
        <div class="icon-container relative">
          <font-awesome-icon :icon="['fas', 'folder']" class="text-yellow-500 text-[120px]" />
          <button type="button" class="absolute inset-0 focus:outline-none">
            <span class="bg-yellow-600 rounded-lg text-sm p-1 pl-2 pr-2 text-white top-[10px] left-0 text-center relative">
              {{ file.count }} ไฟล์
            </span>
          </button>
        </div>
        <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900 max-w-[120px]">
          {{ file.name }}
        </p>
        <p class="pointer-events-none block text-xs font-medium text-gray-500">
          {{ formatBytes(file.size) }}
        </p>
      </div>
    </div>

    <!-- File Item -->
    <div 
      v-else
      @click.stop="$emit('select', file.name)"
      @contextmenu.stop="onFileContextMenu($event, file.name, file.name, file._id, file.original)"
      @dblclick.stop="$emit('double-click', file.name)"
      class="cursor-pointer overflow-hidden"
    >
      <!-- Image File -->
      <div 
        v-if="file.type === 'image'" 
        class="h-[120px] ring-offset-2 group block w-full aspect-w-10 aspect-h-7 rounded-md overflow-hidden"
      >
        <template v-if="file.thumbnail && !imageLoadError">
          <div class="grid place-items-center relative">
            <div v-if="imageLoading" class="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-gray-400 text-[20px]" />
            </div>
            <img 
              :src="file.thumbnail" 
              alt="" 
              class="rounded-lg p-1 object-cover w-full h-full pointer-events-none"
              @load="onThumbnailLoad"
              @error="onThumbnailError"
            >
          </div>
        </template>
        <template v-else>
          <div class="grid place-items-center bg-gray-100">
            <font-awesome-icon :icon="['fas', 'image']" class="opacity-70 p-3 bg-indigo-500 rounded-full text-white text-[20px]" />
            <div v-if="imageLoadError" class="absolute bottom-1 right-1">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-yellow-500 text-xs" />
            </div>
          </div>
        </template>
        <button type="button" class="absolute inset-0 focus:outline-none">
          <span class="sr-only">View details for {{ file.name }}</span>
        </button>
      </div>

      <!-- Document File -->
      <div 
        v-else-if="file.type === 'document'" 
        class="h-[120px] ring-offset-2 group block w-full aspect-w-10 aspect-h-7 rounded-md overflow-hidden"
      >
        <div class="grid place-items-center">
          <div
            :class="getFileTypeClass(file.name)"
            class="opacity-70 absolute top-22 p-1 rounded-lg text-sm text-white min-w-[40px] text-center"
          >
            {{ getFileExtension(file.name) }}
          </div>
          <font-awesome-icon :icon="['fas','file']" class="p-1 text-gray-300 text-[120px]"/>
        </div>
        <button type="button" class="absolute inset-0 focus:outline-none">
          <span class="sr-only">View details for {{ file.name }}</span>
        </button>
      </div>

      <!-- Media File -->
      <div 
        v-else-if="file.type === 'media'" 
        class="h-[120px] ring-offset-2 group block w-full aspect-w-10 aspect-h-7 rounded-md overflow-hidden"
      >
        <template v-if="file.thumbnail">
          <div class="grid place-items-center relative">
            <div v-if="file?.stream" class="absolute bg-black text-white top-2 left-2 text-xs p-1 rounded-sm z-10">
              <font-awesome-icon :icon="file?.stream ? ['fas', 'play-circle'] : ['fas', 'file-video']" />
              {{ file?.stream ? 'Stream' : 'Demand' }}
            </div>
            
            <span v-if="file?.transcode" class="absolute bg-black text-white top-2 left-2 text-xs p-1 rounded-sm z-10">
              <span v-for="(value, key, index) in file.transcode" :key="index">
                <span v-if="typeof value === 'string' && value.includes('http')">{{ key }}</span>
                <span v-else>{{ key }}: {{ value }}%</span>
                <span v-if="index < Object.keys(file.transcode).length - 1">, </span>
              </span>
            </span>

            <div v-if="imageLoading" class="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
              <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-gray-400 text-[20px]" />
            </div>

            <font-awesome-icon :icon="['fas', 'play-circle']" class="opacity-70 absolute top-12 p-3 bg-red-500 rounded-full text-white text-[20px] z-10" />
            <img 
              :src="file.thumbnail" 
              alt="" 
              class="rounded-lg p-1 object-cover w-full h-full pointer-events-none"
              @load="onThumbnailLoad"
              @error="onThumbnailError"
            />
            
            <div v-if="imageLoadError" class="absolute bottom-1 right-1 z-10">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-yellow-500 text-xs" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="grid place-items-center relative bg-gray-100">
            <font-awesome-icon :icon="['fas', 'file-video']" class="p-1 text-gray-400 text-[60px]" />
            <font-awesome-icon :icon="['fas', 'play-circle']" class="absolute top-12 p-2 bg-red-500 rounded-full text-white text-[16px]" />
            
            <span v-if="file?.stream" class="absolute bg-black text-white top-2 left-2 text-xs p-1 rounded-sm z-10">
              <font-awesome-icon :icon="file?.stream ? ['fas', 'play-circle'] : ['fas', 'file-video']" />
              {{ file?.stream ? 'Stream' : 'Demand' }}
            </span>
            
            <span v-if="file?.transcode" class="absolute bg-black text-white top-2 left-2 text-xs p-1 rounded-sm z-10">
              <span v-for="(value, key, index) in file.transcode" :key="index">
                <span v-if="typeof value === 'string' && value.includes('http')">{{ key }}</span>
                <span v-else>{{ key }}: {{ value }}%</span>
                <span v-if="index < Object.keys(file.transcode).length - 1">, </span>
              </span>
            </span>
          </div>
        </template>
        <button type="button" class="absolute inset-0 focus:outline-none">
          <span class="sr-only">View details for {{ file.name }}</span>
        </button>
      </div>
    
      <!-- File Selection for Popup Mode -->
      <div v-if="mode === 'popup' && isAllowedFile(file.name)">
        <div class="mt-2 block truncate text-sm font-medium text-gray-900">
          <label class="block pl-1 pt-2 pb-2 pr-2">
            <input 
              type="radio" 
              :value="file" 
              @change="$emit('select-file', file)"
              class="radio-input border-2 border-black" 
            /> 
            {{ file.name }}
          </label>
        </div>
        <p class="ml-1 pointer-events-none block text-sm font-medium text-gray-500">
          {{ formatBytes(file.size) }}
        </p>
      </div>

      <!-- File Info -->
      <div v-else class="px-2">
        <p class="mt-2 block text-sm font-medium text-gray-900 truncate">
          <span class="text-black">{{ getFileName(file.name) }}</span>
          <span class="text-gray-600">{{ getFileExtension(file.name) }}</span>
        </p>
        <p class="pointer-events-none block text-xs font-medium text-gray-500">
          <span style="float: left;">{{ formatBytes(file.size) }}</span>
          <span v-if="file.type === 'media'" style="float: right;">{{ formatDuration(file.duration) }}</span>
        </p>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'FileItem',
  data() {
    return {
      imageLoadError: false,
      imageLoading: true
    }
  },
  props: {
    file: {
      type: Object,
      required: true
    },
    selectItem: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'static'
    },
    allowFile: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select', 'open-folder', 'double-click', 'select-file'],
  mounted() {
    // Debug: ตรวจสอบข้อมูล thumbnail ที่ได้รับ
    if (this.file.type === 'image' || this.file.type === 'media') {
      console.log(`🎨 FileItem Debug for ${this.file.name}:`, {
        hasThumbnail: !!this.file.thumbnail,
        thumbnailLength: this.file.thumbnail ? this.file.thumbnail.length : 0,
        thumbnailPreview: this.file.thumbnail ? this.file.thumbnail.substring(0, 50) + '...' : 'none',
        thumbnailUrl: this.file.thumbnailUrl,
        fileType: this.file.type
      });
    }
  },
  watch: {
    'file._id': {
      handler() {
        // Reset loading state เมื่อไฟล์เปลี่ยน
        this.imageLoading = true
        this.imageLoadError = false
      },
      immediate: true
    }
  },
  methods: {
    onThumbnailLoad() {
      this.imageLoading = false
      this.imageLoadError = false
    },
    
    onThumbnailError() {
      this.imageLoading = false
      this.imageLoadError = true
      console.log(`📷 Thumbnail failed to load for: ${this.file.name}`)
    },
    
    formatBytes(bytes) {
      const marker = 1024
      const decimal = 3
      const kiloBytes = marker
      const megaBytes = marker * marker
      const gigaBytes = marker * marker * marker
      
      if (bytes < kiloBytes) return bytes + " Bytes"
      else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB"
      else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB"
      else return (bytes / gigaBytes).toFixed(decimal) + " GB"
    },
    
    formatDuration(duration) {
      const totalSeconds = parseFloat(duration)
      if (isNaN(totalSeconds) || totalSeconds <= 0) {
        return '00:00'
      }

      const minutes = Math.floor(totalSeconds / 60)
      const seconds = Math.floor(totalSeconds % 60)

      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')

      return `${formattedMinutes}:${formattedSeconds}`
    },
    
    getFileName(fileName) {
      const lastDotIndex = fileName.lastIndexOf('.')
      return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex)
    },
    
    getFileExtension(fileName) {
      const lastDotIndex = fileName.lastIndexOf('.')
      return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex)
    },
    
    getFileTypeClass(fileName) {
      const ext = this.getFileExtension(fileName).toLowerCase().replace('.', '')
      const classMap = {
        'pdf': 'bg-red-500',
        'xlsx': 'bg-green-500',
        'xls': 'bg-green-500',
        'docx': 'bg-blue-500',
        'doc': 'bg-blue-500',
        'pptx': 'bg-purple-500',
        'ppt': 'bg-purple-500',
        'csv': 'bg-black',
        'js': 'bg-orange-500',
        'zip': 'bg-yellow-500',
        'jpg': 'bg-pink-500',
        'jpeg': 'bg-pink-500',
        'png': 'bg-pink-500',
        'gif': 'bg-pink-500',
        'html': 'bg-brown-500',
        'htm': 'bg-brown-500',
        'xml': 'bg-cyan-500',
        'txt': 'bg-gray-500'
      }
      return classMap[ext] || 'bg-gray-500'
    },
    
    isAllowedFile(filename) {
      const ext = filename.split('.').pop().toLowerCase()
      return this.allowFile.includes(ext)
    },

    onContextMenu(e, item, old, id, counting) {
      e.preventDefault()
      this.$contextmenu({
        zIndex: 99999,
        x: e.x,
        y: e.y,
        items: [
          {
            label: item,
            icon: "fa fa-folder",
            divided: true,
          },
          { 
            label: "เปลี่ยนชื่อโฟลเดอร์", 
            icon: "fa fa-pencil",
            onClick: () => {
              this.openRenameFolder(item, old, id)
            }
          },
          { 
            label: "Assign Space", 
            icon: "fa fa-key",
            onClick: () => {
              this.assignSpace(id)
            }
          },
          { 
            label: "ลบโฟลเดอร์", 
            icon: "fa fa-trash",
            onClick: () => {
              this.deleteFolder(item, id, counting)
            }
          },
        ]
      })
    },

    onFileContextMenu(e, item, old, id, path) {
      e.preventDefault()
      const contextMenuItems = [
        {
          label: item,
          icon: "fa fa-file",
          divided: true,
        },
        {
          label: "เปลี่ยนชื่อ",
          icon: "fa fa-pencil",
          onClick: () => {
            this.openRenameFolder(item, old, id)
          },
        },
        { 
          label: "Assign Space", 
          icon: "fa fa-key",
          onClick: () => {
            this.assignSpace(id)
          }
        },
        {
          label: "ย่อขนาดรูป",
          icon: "fa fa-crop",
          onClick: () => {
            this.resizeOption(path, id)
          },
        },
        {
          label: "สร้างรูปหน้าปกวีดีโอ",
          icon: "fa fa-video",
          onClick: () => {
            this.captureThumbnail(path, id)
          },
        },
        {
          label: "ลบไฟล์",
          icon: "fa fa-trash",
          onClick: () => {
            this.deleteFile(item, id, path)
          },
        },
      ]

      this.$contextmenu({
        zIndex: 99999,
        x: e.x,
        y: e.y,
        items: contextMenuItems,
      })
    },

    // Placeholder methods - these should be implemented or passed from parent
    openRenameFolder(item, old, id) {
      console.log('openRenameFolder', item, old, id)
    },
    
    assignSpace(id) {
      console.log('assignSpace', id)
    },
    
    deleteFolder(item, id, counting) {
      console.log('deleteFolder', item, id, counting)
    },
    
    resizeOption(path, id) {
      console.log('resizeOption', path, id)
    },
    
    captureThumbnail(path, id) {
      console.log('captureThumbnail', path, id)
    },
    
    deleteFile(item, id, path) {
      console.log('deleteFile', item, id, path)
    }
  }
}
</script>

<style scoped>
.selected {
  border: 1px solid #b3ddff;
  padding: 0px;
  border-radius: 5px;
  background: #e1f2ff;
}
</style> 