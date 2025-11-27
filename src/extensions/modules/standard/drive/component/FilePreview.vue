<template>
  <div class="bg-gray-50 flex overflow-hidden file-manager-container">
    <!-- Header Bar -->
    <div class="flex flex-col flex-1">
      <!-- Top Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="text-blue-600 text-lg"/>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">File Preview</h1>
              <p class="text-sm text-gray-500" v-if="fileData">{{ fileData.name }}</p>
            </div>
          </div>
          
          <div v-if="fileData" class="flex items-center space-x-2">
            <button 
              @click="shareFile"
              class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <font-awesome-icon :icon="['fas', 'share']" class="mr-1.5"/>
              Share
            </button>
            <button 
              @click="downloadFile"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'download']" class="mr-1.5"/>
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 bg-white overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-3 text-sm text-gray-600">Loading file...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mt-16 h-[calc(100vh-300px)] flex items-center justify-center p-8">
          <div class="max-w-md w-full text-center">
            <!-- Error Icon -->
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-red-500 text-xl"/>
            </div>
            
            <!-- Error Title -->
            <h3 class="text-xl font-semibold text-gray-900 mb-2">File Not Available</h3>
            
            <!-- Error Message -->
            <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
              <p class="text-sm text-red-700 leading-relaxed">{{ error }}</p>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                @click="loadFileData"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <font-awesome-icon :icon="['fas', 'redo']" class="mr-2"/>
                Try Again
              </button>
              <button 
                @click="$router.go(-1)"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2"/>
                Go Back
              </button>
            </div>
          </div>
        </div>

        <!-- File Content -->
        <div v-else-if="fileData" class="max-w-4xl mx-auto">
          <!-- File Info Header -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="getFileIcon()" class="text-blue-600 text-lg"/>
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900">{{ fileData.name }}</h2>
                <div class="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                  <span>{{ getFileType() }}</span>
                  <span>•</span>
                  <span>{{ formatBytes(fileData.size) }}</span>
                  <span>•</span>
                  <span>{{ formatDate(fileData.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <!-- Image Preview -->
            <div v-if="isImage()" class="p-4">
              <div class="flex justify-center">
                <img 
                  :src="fileData.path" 
                  :alt="fileData.name"
                  class="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  @error="imageError = true"
                  @click="openLightbox"
                >
              </div>
              <p class="text-center text-sm text-gray-500 mt-2">Click to view full size</p>
            </div>

            <!-- Video Preview -->
            <div v-else-if="isVideo()" class="p-4">
              <video 
                :src="fileData.path"
                controls
                class="w-full max-h-96 rounded-lg"
                preload="metadata"
              >
                Your browser does not support video playback
              </video>
            </div>

            <!-- PDF Preview -->
            <div v-else-if="isPDF()" class="h-96 relative">
              <iframe 
                :src="fileData.path + '#toolbar=0'"
                class="w-full h-full border-0"
                frameborder="0"
                @error="handleIframeError"
                @load="(e) => { console.log('PDF iframe loaded successfully'); }"
              >
                PDF preview not available. Please open the file in a new tab to view it.
              </iframe>
              <!-- Fallback content shown if iframe fails to load -->
              <div 
                class="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded iframe-fallback"
                style="display: none;"
              >
                <div class="text-center">
                  <font-awesome-icon :icon="['fas', 'file-pdf']" class="text-red-500 text-3xl mb-3"/>
                  <p class="text-gray-600">PDF preview not available. <a :href="fileData.path" target="_blank" class="text-blue-600 hover:underline">Open in new tab</a></p>
                </div>
              </div>
            </div>

            <!-- Audio Preview -->
            <div v-else-if="isAudio()" class="p-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <font-awesome-icon :icon="['fas', 'music']" class="text-blue-600 text-xl"/>
                </div>
                <h4 class="font-medium text-gray-900 mb-4">{{ fileData.name }}</h4>
                <audio 
                  :src="fileData.path"
                  controls
                  class="w-full max-w-md mx-auto"
                  preload="metadata"
                >
                  Your browser does not support audio playback
                </audio>
              </div>
            </div>

            <!-- Other Files -->
            <div v-else class="p-8 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <font-awesome-icon :icon="getFileIcon()" class="text-gray-500 text-xl"/>
              </div>
              <h4 class="font-medium text-gray-900 mb-2">{{ getFileExtension().toUpperCase() }} File</h4>
              <p class="text-sm text-gray-600 mb-4">Preview not available for this file type</p>
              <button 
                @click="downloadFile"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="mr-1.5"/>
                Download File
              </button>
            </div>
          </div>

          <!-- File Actions -->
          <div class="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Actions</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="downloadFile"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="mr-1.5"/>
                Download
              </button>
              <button 
                @click="shareFile"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'share']" class="mr-1.5"/>
                Copy Link
              </button>
              <button 
                @click="openInNewTab"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'external-link-alt']" class="mr-1.5"/>
                Open in New Tab
              </button>
            </div>
          </div>

          <!-- File Details -->
          <div class="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">File Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Type</span>
                <p class="font-medium text-gray-900">{{ getFileType() }}</p>
              </div>
              <div>
                <span class="text-gray-600">Size</span>
                <p class="font-medium text-gray-900">{{ formatBytes(fileData.size) }}</p>
              </div>
              <div>
                <span class="text-gray-600">Created</span>
                <p class="font-medium text-gray-900">{{ formatFullDate(fileData.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div 
      v-if="lightboxOpen" 
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      @click="closeLightbox"
      @keydown.esc="closeLightbox"
      tabindex="0"
    >
      <!-- Close Button -->
      <button 
        @click="closeLightbox"
        class="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'times']" class="text-2xl"/>
      </button>

      <!-- Zoom Controls -->
      <div class="absolute top-4 left-4 z-60 flex space-x-2">
        <button 
          @click.stop="zoomIn"
          class="p-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-lg transition-colors"
          :disabled="zoomLevel >= 3"
        >
          <font-awesome-icon :icon="['fas', 'search-plus']" class="text-lg"/>
        </button>
        <button 
          @click.stop="zoomOut"
          class="p-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-lg transition-colors"
          :disabled="zoomLevel <= 0.5"
        >
          <font-awesome-icon :icon="['fas', 'search-minus']" class="text-lg"/>
        </button>
        <button 
          @click.stop="resetZoom"
          class="p-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-lg transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="text-lg"/>
        </button>
      </div>

      <!-- Zoom Level Indicator -->
      <div class="absolute bottom-4 left-4 z-60 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-lg">
        {{ Math.round(zoomLevel * 100) }}%
      </div>

      <!-- Image Container -->
      <div 
        class="relative max-w-full max-h-full overflow-auto"
        @click.stop
        ref="imageContainer"
        @wheel.prevent="handleWheel"
        @mousedown="startPan"
        @mousemove="doPan"
        @mouseup="endPan"
        @mouseleave="endPan"
      >
        <img 
          :src="fileData.path"
          :alt="fileData.name"
          class="block transition-transform duration-200 select-none"
          :style="{ 
            transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
            cursor: isPanning ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default')
          }"
          @dragstart.prevent
          ref="lightboxImage"
        >
      </div>

      <!-- Image Info -->
      <div class="absolute bottom-4 right-4 z-60 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-lg">
        {{ fileData.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fileId: {
      type: String,
      required: true
    },
    shareKey: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      fileData: null,
      loading: true,
      error: null,
      imageError: false,
      // Lightbox state
      lightboxOpen: false,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      startPanX: 0,
      startPanY: 0,
      lastPanX: 0,
      lastPanY: 0
    }
  },
  computed: {
    // Request key สำหรับ public access (เหมือนกับ FileManager)
    requestKey() {
      return this.$Key;
    }
  },
  async mounted() {
    await this.loadFileData()
    
    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightboxOpen) {
        this.closeLightbox()
      }
    })
  },
  methods: {
    async loadFileData() {
      try {
        this.loading = true
        this.error = null
        
        // ใช้ aggregate เพื่อดึงข้อมูลไฟล์และเช็ค share status
        const matchCriteria = {
          _id: this.fileId,
          share: true  // เช็คว่าไฟล์นี้ถูกแชร์หรือไม่
        };

        // เพิ่มการตรวจสอบ shareKey เพื่อความปลอดภัย
        if (this.shareKey) {
          matchCriteria.shareKey = this.shareKey;
        }

        const pipeline = [
          {
            $match: matchCriteria
          },
          {
            $project: {
              _id: 1,
              name: 1,
              mimetype: 1,
              owner: 1,
              share: 1,
              shareKey: 1,
              sharePassword: 1,
              shareExpiryDate: 1,
              sharePermission: 1,
              path: 1,
              original: 1,
              size: 1,
              type: 1,
              createdAt: 1,
              thumbnail: 1,
              duration: 1,
              stream: 1,
              transcode: 1
            }
          }
        ];

        const payload = {
          pipeline: pipeline
        };
        
        // ใช้ this.requestKey เหมือนกับตัวหลัก (เป็น 'public' สำหรับ share mode)
        const response = await this.$Request.POST('storage/aggregate', payload, this.requestKey);
        
        if (response.data && response.data.length > 0) {
          this.fileData = response.data[0];
        } else {
          this.error = 'ไฟล์นี้ไม่ได้ถูกแชร์หรือไม่มีอยู่';
        }
      } catch (error) {
        console.error('Error loading file data:', error)
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลไฟล์'
      } finally {
        this.loading = false
      }
    },
    
    getFileExtension() {
      if (!this.fileData?.name) return ''
      return this.fileData.name.split('.').pop() || ''
    },
    
    getFileIcon() {
      const ext = this.getFileExtension().toLowerCase()
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return ['fas', 'image']
      } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
        return ['fas', 'film']
      } else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
        return ['fas', 'music']
      } else if (ext === 'pdf') {
        return ['fas', 'file-pdf']
      } else if (['doc', 'docx'].includes(ext)) {
        return ['fas', 'file-word']
      } else if (['xls', 'xlsx'].includes(ext)) {
        return ['fas', 'file-excel']
      } else if (['ppt', 'pptx'].includes(ext)) {
        return ['fas', 'file-powerpoint']
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        return ['fas', 'file-archive']
      } else {
        return ['fas', 'file']
      }
    },
    
    isImage() {
      const ext = this.getFileExtension().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
    },
    
    isVideo() {
      const ext = this.getFileExtension().toLowerCase()
      return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)
    },
    
    isAudio() {
      const ext = this.getFileExtension().toLowerCase()
      return ['mp3', 'wav', 'ogg', 'flac'].includes(ext)
    },
    
    isPDF() {
      return this.getFileExtension().toLowerCase() === 'pdf'
    },
    
    formatBytes(bytes) {
      if (!bytes) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    getFileType() {
      const ext = this.getFileExtension().toLowerCase()
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return 'Image'
      } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
        return 'Video'
      } else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
        return 'Audio'
      } else if (ext === 'pdf') {
        return 'PDF Document'
      } else if (['doc', 'docx'].includes(ext)) {
        return 'Word Document'
      } else if (['xls', 'xlsx'].includes(ext)) {
        return 'Excel Spreadsheet'
      } else if (['ppt', 'pptx'].includes(ext)) {
        return 'PowerPoint Presentation'
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        return 'Archive'
      } else {
        return 'File'
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        const diffInHours = Math.floor(diffInMinutes / 60)
        const diffInDays = Math.floor(diffInHours / 24)
        
        if (diffInSeconds < 60) {
          return 'Just now'
        } else if (diffInMinutes < 60) {
          return `${diffInMinutes}m ago`
        } else if (diffInHours < 24) {
          return `${diffInHours}h ago`
        } else if (diffInDays < 7) {
          return `${diffInDays}d ago`
        } else {
          return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
          }).format(date)
        }
      } catch (error) {
        return '-'
      }
    },
    
    formatFullDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } catch (error) {
        return '-'
      }
    },
    
    downloadFile() {
      if (this.fileData?.path) {
        // ตรวจสอบว่า browser รองรับ modern download methods หรือไม่
        const isModernBrowser = 'fetch' in window && 'URL' in window && 'createObjectURL' in URL
        
        if (isModernBrowser) {
          // วิธีใหม่สำหรับ modern browsers (Chrome, Firefox, Safari, Edge)
          fetch(this.fileData.path)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok')
              }
              return response.blob()
            })
            .then(blob => {
              // ตรวจสอบว่าเป็น Safari หรือไม่ (มีการจัดการ download แตกต่าง)
              const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
              
              if (isSafari && blob.size > 50 * 1024 * 1024) {
                // Safari มีปัญหากับไฟล์ใหญ่ ใช้วิธีเดิม
                this.fallbackDownload()
                return
              }
              
              // สร้าง blob URL
              const blobUrl = window.URL.createObjectURL(blob)
              
              // สร้าง link element
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = this.fileData.name
              
              // สำหรับ Firefox ต้องเพิ่ม link เข้าไปใน DOM
              if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                document.body.appendChild(link)
              }
              
              // Trigger download
              link.click()
              
              // ทำความสะอาด
              if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                document.body.removeChild(link)
              }
              
              // ลบ blob URL (ใช้ setTimeout เพื่อให้ download เสร็จก่อน)
              setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl)
              }, 100)
            })
            .catch(error => {
              console.error('Modern download failed:', error)
              this.fallbackDownload()
            })
        } else {
          // สำหรับ browser เก่า
          this.fallbackDownload()
        }
      }
    },
    
    fallbackDownload() {
      // วิธี fallback สำหรับ browser เก่าหรือเมื่อ modern method ล้มเหลว
      try {
        const link = document.createElement('a')
        link.href = this.fileData.path
        link.download = this.fileData.name || 'download'
        
        // เพิ่ม target="_blank" เพื่อความปลอดภัย
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        // สำหรับ IE และ browser เก่า
        if (typeof link.download === 'undefined') {
          window.open(this.fileData.path, '_blank')
          return
        }
        
        // เพิ่มเข้า DOM ชั่วคราว
        document.body.appendChild(link)
        link.click()
        
        // ลบออกจาก DOM
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
        
      } catch (error) {
        console.error('Fallback download failed:', error)
        // Last resort: เปิดไฟล์ใน tab ใหม่
        window.open(this.fileData.path, '_blank')
      }
    },
    
    shareFile() {
      // Copy share link to clipboard
      const shareUrl = window.location.href
      navigator.clipboard.writeText(shareUrl).then(() => {
        // TODO: Show toast notification
        console.log('Share link copied to clipboard')
      }).catch(() => {
        console.log('Failed to copy share link')
      })
    },
    
    openInNewTab() {
      if (this.fileData?.path) {
        window.open(this.fileData.path, '_blank')
      }
    },

    // Lightbox methods
    openLightbox() {
      this.lightboxOpen = true
      this.resetZoom()
      // Focus the lightbox for keyboard navigation
      this.$nextTick(() => {
        document.querySelector('[tabindex="0"]')?.focus()
      })
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    },

    closeLightbox() {
      this.lightboxOpen = false
      // Restore body scroll
      document.body.style.overflow = ''
    },

    zoomIn() {
      if (this.zoomLevel < 3) {
        this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3)
      }
    },

    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5)
        // Reset pan if zoomed out too much
        if (this.zoomLevel === 1) {
          this.panX = 0
          this.panY = 0
        }
      }
    },

    resetZoom() {
      this.zoomLevel = 1
      this.panX = 0
      this.panY = 0
    },

    handleWheel(event) {
      const delta = event.deltaY
      if (delta < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },

    startPan(event) {
      if (this.zoomLevel > 1) {
        this.isPanning = true
        this.startPanX = event.clientX - this.panX
        this.startPanY = event.clientY - this.panY
        this.lastPanX = this.panX
        this.lastPanY = this.panY
      }
    },

    doPan(event) {
      if (this.isPanning && this.zoomLevel > 1) {
        this.panX = event.clientX - this.startPanX
        this.panY = event.clientY - this.startPanY
      }
    },

    endPan() {
      this.isPanning = false
    },

    // Handle iframe load error and show fallback
    handleIframeError(event) {
      console.log('PDF iframe failed to load, showing fallback');
      const iframe = event.target;
      const fallback = iframe.parentElement.querySelector('.iframe-fallback');
      if (fallback) {
        iframe.style.display = 'none';
        fallback.style.display = 'flex';
      }
    }
  },

  beforeUnmount() {
    // Clean up body scroll style
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
/* Match FileManager styling */
.file-manager-container {
  height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Simple hover effects */
button:hover {
  transform: none;
  box-shadow: none;
}

/* Clean scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
