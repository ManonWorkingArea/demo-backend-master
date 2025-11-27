<template>
  <!-- Full Screen Modal -->
  <div 
    v-if="show" 
    class="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75 backdrop-blur-sm"
    @click.self="closeOnBackdrop && close()"
  >
    <!-- Modal Container -->
    <div class="relative w-full h-full flex flex-col">
      
      <!-- PDF Generation Loading Overlay -->
      <div 
        v-if="pdfGenerating"
        class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
      >
        <div class="bg-white rounded-lg p-8 shadow-2xl w-96 h-64 mx-4 text-center flex flex-col justify-between">
          <!-- Loading Spinner -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 mx-auto mb-4">
              <svg class="animate-spin w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Progress Content - Fixed Height Area -->
          <div class="flex-1 flex flex-col justify-center min-h-0">
            <!-- Progress Title -->
            <h3 class="text-lg font-semibold text-gray-900 mb-3">กำลังสร้าง PDF</h3>
            
            <!-- Progress Text - Fixed Height -->
            <div class="h-12 flex items-center justify-center mb-4">
              <p class="text-gray-600 text-sm leading-relaxed px-2">
                {{ pdfProgress || 'กำลังเตรียมเอกสาร...' }}
              </p>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                class="h-2 rounded-full transition-all duration-500 ease-out" 
                :class="{
                  'bg-blue-600': !pdfProgress.includes('ผิดพลาด') && !pdfProgress.includes('เสร็จ'),
                  'bg-green-500': pdfProgress.includes('เสร็จ'),
                  'bg-red-500': pdfProgress.includes('ผิดพลาด')
                }"
                :style="{ 
                  width: pdfProgress.includes('เตรียม') ? '20%' : 
                         pdfProgress.includes('ประมวลผล') ? '50%' :
                         pdfProgress.includes('สร้าง') ? '80%' :
                         pdfProgress.includes('เสร็จ') ? '100%' :
                         pdfProgress.includes('ผิดพลาด') ? '100%' :
                         '10%'
                }"
              ></div>
            </div>
          </div>
          
          <!-- Footer Text -->
          <div class="flex-shrink-0">
            <p class="text-xs text-gray-500">กรุณารอสักครู่...</p>
          </div>
        </div>
      </div>
      
      <!-- Header Bar -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center space-x-4">
            Preview
          <h2 class="text-lg font-semibold text-gray-900">{{ title || 'ตัวอย่างเอกสาร' }}</h2>
          <div v-if="documentInfo" class="flex items-center space-x-2 text-sm text-gray-600">
            <span class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{{ documentInfo.type }}</span>
            <span>{{ documentInfo.number }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- Sidebar Toggle Button -->
          <button
            v-if="showThumbnails && totalPages > 1"
            @click="toggleSidebar"
            :class="[
              'px-3 py-2 text-sm font-medium border rounded-md transition-colors inline-flex items-center',
              showSidebar ? 'text-blue-700 bg-blue-50 border-blue-300' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            ]"
          >
            <i class="fas fa-th-large mr-2"></i>
            หน้าเอกสาร
          </button>
          
          <!-- Copy Mode Checkbox -->
          <label class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              v-model="showBothCopies"
              class="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            >
            <i class="fas fa-copy mr-2"></i>
            {{ getCopyModeLabel() }}
          </label>

          <!-- Action Buttons -->
          <button
            v-if="allowPrint"
            @click="printDocument"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <i class="fas fa-print mr-2"></i>
            พิมพ์
          </button>
          
          <button
            v-if="allowDownload"
            @click="downloadDocument"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <i class="fas fa-download mr-2"></i>
            ดาวน์โหลด
          </button>
          
          <!-- Close Button -->
          <button
            @click="close"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
      </div>
      
      <!-- Document Content Area -->
      <div class="document-content-area">
        <div class="flex h-full relative">
          
          <!-- Thumbnail Sidebar -->
          <div 
            v-if="showThumbnails && showSidebar && totalPages > 1" 
            class="thumbnail-sidebar"
            :style="{ width: sidebarWidth + 'px' }"
          >
            <div class="sidebar-header">
              <h3 class="text-sm font-semibold text-gray-700">หน้าเอกสาร</h3>
              <button @click="toggleSidebar" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-sm"></i>
              </button>
            </div>
            <div class="sidebar-content">
              <!-- All Pages from Page Structure -->
              <div 
                v-for="pageInfo in (pageStructure || [])" 
                :key="pageInfo.id"
                @click="selectPage(pageInfo.logicalPageNumber)"
                :class="[
                  'thumbnail-item',
                  currentPage === pageInfo.logicalPageNumber ? 'thumbnail-active' : 'thumbnail-inactive',
                  ...(pageInfo.cssClasses || [])
                ]"
              >
                <div class="thumbnail-preview">
                  <div class="thumbnail-document-container">
                    <div class="thumbnail-document-wrapper">
                      <div class="document-watermark-container">
                        <component
                          :is="documentComponent"
                          :data="documentData"
                          :options="getPageOptions(pageInfo.pageNumber, pageInfo.copyType)"
                          v-bind="componentProps"
                          class="thumbnail-document"
                        />
                        <div v-if="pageInfo.watermarkText" 
                             class="thumbnail-watermark"
                             :class="{ 'copy-watermark': pageInfo.type === 'copy' }">
                          {{ pageInfo.watermarkText }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="thumbnail-label">
                  {{ pageInfo.displayName }}
                </div>
              </div>
              
              <!-- Section Divider for Copy Pages (แสดงเฉพาะเมื่อมีทั้งต้นฉบับและสำเนา) -->
              <div v-if="showBothCopies && originalPages.length > 0 && copyPages.length > 0" 
                   class="sidebar-divider">
                <div class="divider-text">
                  📄 สำเนา ({{ getCopyPageCount() }} หน้า)
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sidebar Toggle Button (ปุ่มเล็กข้างๆ sidebar) -->
          <div 
            v-if="showThumbnails && totalPages > 1"
            :class="[
              'sidebar-toggle-button',
              showSidebar ? 'sidebar-toggle-close' : 'sidebar-toggle-open'
            ]"
            :style="showSidebar ? { left: sidebarWidth + 'px' } : { left: '0px' }"
            @click="toggleSidebar"
          >
            <i :class="showSidebar ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
          </div>
          
          <!-- Main Content Area -->
          <div class="flex-1 flex flex-col">
            
            <!-- Document Info Bar -->
            <div class="page-navigation">
          <div class="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <i class="fas fa-file-alt mr-2"></i>
              <span>แสดงเอกสารแบบมาตรฐาน</span>
              
              <!-- Current Page Info -->
              <span v-if="currentPageInfo" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {{ currentPageInfo.displayName }}
              </span>
              
              <!-- Page Structure Summary -->
              <span v-if="getBaseTotalPages() >= 2" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {{ getOriginalPageCount() }} หน้าต้นฉบับ
              </span>
              
              <span v-if="showBothCopies && getCopyPageCount() > 0" class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {{ getCopyPageCount() }} หน้าสำเนา
              </span>
              
              <span v-if="totalPages > 2" class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                รวม {{ totalPages }} หน้า
              </span>
            </div>
            <!-- Zoom Controls -->
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <button @click.stop="setFitPage" :class="['px-2 py-1 rounded border', zoomModeComputed === 'actual' ? 'bg-gray-100 border-gray-300' : 'bg-white border-transparent hover:bg-gray-50']" title="เต็มหน้า (100%)">
                100%
              </button>
              <div class="w-px h-5 bg-gray-200 mx-1"></div>
              <button @click.stop="zoomOut" class="px-2 py-1 rounded border bg-white hover:bg-gray-50" title="ซูมออก">-</button>
              <div class="min-w-[64px] text-center font-medium">{{ zoomPercent }}%</div>
              <button @click.stop="zoomIn" class="px-2 py-1 rounded border bg-white hover:bg-gray-50" title="ซูมเข้า">+</button>
            </div>
          </div>
        </div>
        
        <!-- Document Container -->
        <div class="document-container" ref="containerEl" @click.stop>
            
            <!-- Document Component - Dynamic Pages from Structure -->
            <div v-if="documentComponent && documentData && (pageStructure && pageStructure.length > 0)" class="document-sequence">
              <!-- Dynamic Pages Loop -->
              <div 
                v-for="(pageInfo, index) in (pageStructure || [])" 
                :key="pageInfo.id"
                :class="[
                  'page-container',
                  index > 0 ? 'page-separator' : '',
                  ...(pageInfo.cssClasses || [])
                ]"
              >
                <!-- Page Divider (ไม่แสดงสำหรับหน้าแรก) -->
                <div v-if="index > 0" class="page-divider">
                  <div class="divider-line"></div>
                  <div class="divider-label">{{ pageInfo.displayName }}</div>
                  <div class="divider-line"></div>
                </div>
                
                <!-- Page Content -->
                <div class="fit-viewport">
                  <div class="scale-viewport" :style="viewportStyle">
                    <div class="scale-inner" :style="scaleStyle">
                      <div class="document-watermark-container">
                        <div 
                          class="document-isolation-container" 
                          :ref="index === 0 ? setDocRoot : null"
                        >
                          <component
                            :is="documentComponent"
                            :data="documentData"
                            :options="getPageOptions(pageInfo.pageNumber, pageInfo.copyType)"
                            v-bind="componentProps"
                          />
                        </div>
                        <!-- Dynamic Watermark -->
                        <div 
                          v-if="pageInfo.watermarkText" 
                          class="document-watermark" 
                          :data-type="pageInfo.type"
                          :style="{ color: pageInfo.watermarkColor }"
                        >
                          {{ pageInfo.watermarkText }}
                        </div>
                        
                        <!-- Page Number -->
                        <div class="document-page-number">
                          <span v-if="pageInfo.type === 'original'">
                            {{ getOriginalPageIndex(pageInfo.logicalPageNumber) }}/{{ getOriginalPageCount() }} ต้นฉบับ
                          </span>
                          <span v-else-if="pageInfo.type === 'copy'">
                            {{ getCopyPageIndex(pageInfo.logicalPageNumber) }}/{{ getCopyPageCount() }} สำเนา
                          </span>
                          <span v-else>
                            {{ pageInfo.logicalPageNumber }}/{{ totalPages }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-else-if="loading" class="state-container">
              <div class="text-center">
                <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-6"></i>
                <p class="text-lg text-gray-600">กำลังโหลดเอกสาร...</p>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="state-container">
              <div class="text-center max-w-md">
                <i class="fas fa-exclamation-triangle text-3xl text-red-500 mb-6"></i>
                <p class="text-lg text-red-600 font-medium mb-4">{{ error }}</p>
                <button 
                  @click="retry"
                  class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
            
            <!-- No Data State -->
            <div v-else class="state-container">
              <div class="text-center">
                <i class="fas fa-file-alt text-3xl text-gray-400 mb-6"></i>
                <p class="text-lg text-gray-600">ไม่พบข้อมูลเอกสาร</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer Bar -->
      <div v-if="showFooter" class="bg-white border-t border-gray-200 px-6 py-3">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div class="flex items-center space-x-4">
            <span v-if="documentInfo">สร้างเมื่อ: {{ formatDate(documentInfo.created_at) }}</span>
            <span v-if="documentInfo">โดย: {{ documentInfo.created_by }}</span>
            
            <!-- Page Structure Debug Info (เฉพาะ development) -->
            <span v-if="pageStructure.length" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Page Structure: {{ pageStructure.length }} pages
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">ESC เพื่อปิด</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getDocumentComponent, isDocumentTypeSupported } from '../document/index.js'
import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default {
  name: 'DocumentPreview',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    documentType: {
      type: String,
      required: true
    },
    documentId: {
      type: [String, Number],
      default: null
    },
    documentData: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    allowPrint: {
      type: Boolean,
      default: true
    },
    allowDownload: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showThumbnails: {
      type: Boolean,
      default: true
    },
    documentOptions: {
      type: Object,
      default: () => ({})
    },
    componentProps: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'print', 'download', 'error'],
  setup(props, { emit }) {
    const loading = ref(false)
    const pdfGenerating = ref(false)
    const pdfProgress = ref('')
    const error = ref('')
    const containerEl = ref(null)
    const docRoot = ref(null)
    
    // Safe ref setter function
    const setDocRoot = (el) => {
      if (el && typeof el.getBoundingClientRect === 'function') {
        docRoot.value = el
        console.log('🎯 docRoot set successfully')
      } else {
        console.warn('⚠️ Invalid element for docRoot:', el)
      }
    }
  const scale = ref(1)
  const zoom = ref(1)
  // actual | fit-page | fit-width | custom | auto
  // Default to 100% (actual size)
  const zoomMode = ref('actual')
    const docWidthPx = ref(0)
    const docHeightPx = ref(0)
    // Preserve original body styles to restore after modal closes
    const prevBodyOverflow = ref('')
    const prevBodyPaddingRight = ref('')
    
    // Multi-page support
    const currentPage = ref(1)
    const totalPages = ref(1)
    
    // Thumbnail sidebar
    const showSidebar = ref(true) // เปิดเป็น default
    const sidebarWidth = ref(160)
    
    // Document copy mode (ต้นฉบับ และ ต้นฉบับ+สำเนา)
    const showBothCopies = ref(false) // false = ต้นฉบับอย่างเดียว, true = ต้นฉบับ+สำเนา
    
    // Page Structure Array - เก็บโครงสร้างของทุกหน้า
    const pageStructure = ref([])
    
    const toggleBothCopies = () => {
      showBothCopies.value = !showBothCopies.value
      console.log('🔄 showBothCopies toggled:', showBothCopies.value)
    }
    
    const getCopyModeLabel = () => {
      return showBothCopies.value ? 'ต้นฉบับ + สำเนา' : 'ต้นฉบับ'
    }
    
    const getBaseTotalPages = () => {
      // คำนวณจำนวนหน้าฐาน (ไม่รวมสำเนา) จากจำนวน items
      let items = []
      if (Array.isArray(props.documentData)) {
        const firstDoc = props.documentData.length > 0 ? props.documentData[0] : {}
        items = firstDoc.items || firstDoc.request_items || []
      } else if (props.documentData && typeof props.documentData === 'object') {
        items = props.documentData.items || props.documentData.request_items || []
      }
      
      if (items.length === 0) {
        return 1
      }
      
      // คำนวณจำนวนหน้าจาก items และ itemsPerPage
      const pages = Math.ceil(items.length / itemsPerPage.value)
      return Math.max(1, pages)
    }

    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth
    }

    const lockBodyScroll = () => {
      const body = document.body
      // Save inline styles to restore later
      if (!prevBodyOverflow.value) prevBodyOverflow.value = body.style.overflow || ''
      if (!prevBodyPaddingRight.value) prevBodyPaddingRight.value = body.style.paddingRight || ''

      // Add padding-right to compensate for scrollbar removal to avoid layout shift
      const scrollbarWidth = getScrollbarWidth()
      if (scrollbarWidth > 0) {
        const currentComputedPadding = parseFloat(window.getComputedStyle(body).paddingRight || '0')
        body.style.paddingRight = `${currentComputedPadding + scrollbarWidth}px`
      }

      body.style.overflow = 'hidden'
    }

    const unlockBodyScroll = () => {
      const body = document.body
      body.style.overflow = prevBodyOverflow.value || ''
      body.style.paddingRight = prevBodyPaddingRight.value || ''
      prevBodyOverflow.value = ''
      prevBodyPaddingRight.value = ''
    }
    
    const documentComponent = computed(() => {
      return getDocumentComponent(props.documentType)
    })
    
    // Calculate total pages and items per page
    const itemsPerPage = computed(() => {
      // ถ้ามีข้อมูล pagination จาก adapter ให้ใช้ค่านั้น
      if (props.data?.metadata?.pagination?.itemsPerPage) {
        return props.data.metadata.pagination.itemsPerPage
      }
      
      // Different document types may have different items per page
      if (props.documentType === 'purchase_request') {
        return 5 // 5 items per page for purchase request
      }
      return 20 // default items per page
    })
    
    // สร้าง page structure array
    const buildPageStructure = () => {
      try {
        const baseTotalPages = getBaseTotalPages()
        const pages = []
        
        // ตรวจสอบความถูกต้องของข้อมูล
        if (baseTotalPages <= 0) {
          console.warn('⚠️ Invalid base total pages:', baseTotalPages)
          pageStructure.value = []
          return []
        }
        
        // สร้างหน้าต้นฉบับ
        for (let i = 1; i <= baseTotalPages; i++) {
          pages.push({
            id: `original-${i}`,
            pageNumber: i,
            logicalPageNumber: pages.length + 1, // ลำดับจริงในเอกสาร
            type: 'original',
            displayName: `ต้นฉบับ หน้า ${i}`,
            shortName: `หน้า ${i}`,
            copyType: 'original',
            isVisible: true,
            watermarkText: showBothCopies.value ? 'ต้นฉบับ' : '',
            watermarkColor: 'rgba(37, 99, 235, 0.12)',
            cssClasses: ['page-original'],
            metadata: {
              section: 'original',
              basePage: i,
              totalBasePages: baseTotalPages
            }
          })
        }
        
        // สร้างหน้าสำเนา (ถ้าเลือก showBothCopies)
        if (showBothCopies.value) {
          for (let i = 1; i <= baseTotalPages; i++) {
            pages.push({
              id: `copy-${i}`,
              pageNumber: i,
              logicalPageNumber: pages.length + 1, // ลำดับจริงในเอกสาร
              type: 'copy',
              displayName: `สำเนา หน้า ${i}`,
              shortName: `สำเนา ${i}`,
              copyType: 'copy',
              isVisible: true,
              watermarkText: 'สำเนา',
              watermarkColor: 'rgba(239, 68, 68, 0.12)',
              cssClasses: ['page-copy'],
              metadata: {
                section: 'copy',
                basePage: i,
                totalBasePages: baseTotalPages
              }
            })
          }
        }
        
        pageStructure.value = pages
        console.log('📋 Page structure built:', pages)
        return pages
        
      } catch (error) {
        console.error('❌ Error building page structure:', error)
        pageStructure.value = []
        return []
      }
    }
    
    const calculateTotalPages = () => {
      const baseTotalPages = getBaseTotalPages()
      
      // สร้าง page structure
      buildPageStructure()
      
      // ถ้าเลือก showBothCopies จะมีเอกสาร x2 (ต้นฉบับ + สำเนา)
      totalPages.value = showBothCopies.value ? baseTotalPages * 2 : baseTotalPages
      
      console.log(`📊 calculateTotalPages - baseTotalPages: ${baseTotalPages}, showBothCopies: ${showBothCopies.value}, totalPages: ${totalPages.value}`)
      
      // Reset to page 1 if current page exceeds total pages
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1
      }
    }
    
    // Page Structure computed properties
    const currentPageInfo = computed(() => {
      if (!pageStructure.value || !pageStructure.value.length) return null
      return pageStructure.value.find(page => page.logicalPageNumber === currentPage.value) || null
    })
    
    const originalPages = computed(() => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return []
      return pageStructure.value.filter(page => page.type === 'original')
    })
    
    const copyPages = computed(() => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return []
      return pageStructure.value.filter(page => page.type === 'copy')
    })
    
    const getPageInfo = (logicalPageNumber) => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return null
      return pageStructure.value.find(page => page.logicalPageNumber === logicalPageNumber) || null
    }
    
    const getPagesByType = (type) => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return []
      return pageStructure.value.filter(page => page.type === type)
    }
    
    const getTotalPagesByType = (type) => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return 0
      return pageStructure.value.filter(page => page.type === type).length
    }
    
    // Merged document options with current page info
    const mergedDocumentOptions = computed(() => {
      const currentInfo = currentPageInfo.value
      return {
        ...props.documentOptions,
        currentPage: currentPage.value,
        totalPages: getBaseTotalPages(), // ใช้จำนวนหน้าฐาน ไม่รวมสำเนา
        itemsPerPage: itemsPerPage.value,
        showBothCopies: showBothCopies.value, // เพิ่ม copy mode
        pageStructure: pageStructure.value, // เพิ่ม page structure
        currentPageInfo: currentInfo // ข้อมูลหน้าปัจจุบัน
      }
    })
    
    // Get page-specific options for multi-page display
    const getPageOptions = (pageNumber, copyType = 'original') => {
      // หา page info จาก page structure
      const pageInfo = pageStructure.value.find(page => 
        page.pageNumber === pageNumber && page.type === copyType
      )
      
      return {
        ...props.documentOptions,
        currentPage: pageNumber,
        totalPages: getBaseTotalPages(), // ใช้จำนวนหน้าฐาน ไม่รวมสำเนา
        itemsPerPage: itemsPerPage.value,
        showBothCopies: showBothCopies.value,
        copyType: copyType, // 'original' หรือ 'copy'
        pageInfo: pageInfo, // ข้อมูลหน้าจาก structure
        pageStructure: pageStructure.value // ข้อมูลทั้ง structure
      }
    }
    
    // Page navigation functions
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const goToPage = () => {
      // currentPage is already updated by v-model
      nextTick(() => {
        setTimeout(() => {
          try {
            measureDoc()
            updateScale()
            scrollToSelectedPage()
          } catch (error) {
            console.warn('⚠️ Error in goToPage:', error)
          }
        }, 100)
      })
    }
    
    const scrollToSelectedPage = () => {
      // Scroll to the selected page in document
      const baseTotalPages = getBaseTotalPages()
      let targetPageIndex = currentPage.value
      
      if (showBothCopies.value && currentPage.value > baseTotalPages) {
        // Navigate to copy section
        targetPageIndex = currentPage.value - baseTotalPages + baseTotalPages
      }
      
      const pageElements = document.querySelectorAll('.page-container')
      if (pageElements[targetPageIndex - 1]) {
        pageElements[targetPageIndex - 1].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }
    
    // Thumbnail sidebar functions
    const toggleSidebar = () => {
      showSidebar.value = !showSidebar.value
    }
    
    const selectPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        
        const pageInfo = getPageInfo(page)
        console.log(`📄 Selected page ${page}:`, pageInfo)
        
        // Scroll to the selected page in the document
        nextTick(() => {
          const pageElements = document.querySelectorAll('.page-container')
          if (pageElements[page - 1]) {
            pageElements[page - 1].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            })
          }
          
          // Add delay to ensure DOM is ready
          setTimeout(() => {
            try {
              measureDoc()
              updateScale()
            } catch (error) {
              console.warn('⚠️ Error in selectPage measurement:', error)
            }
          }, 100)
        })
      }
    }
    
    // Helper functions สำหรับ page structure
    const getPageByLogicalNumber = (logicalPageNumber) => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return null
      return pageStructure.value.find(page => page.logicalPageNumber === logicalPageNumber) || null
    }
    
    const getOriginalPageCount = () => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return 0
      return pageStructure.value.filter(page => page.type === 'original').length
    }
    
    const getCopyPageCount = () => {
      if (!pageStructure.value || !Array.isArray(pageStructure.value)) return 0
      return pageStructure.value.filter(page => page.type === 'copy').length
    }
    
    const getOriginalPageIndex = (logicalPageNumber) => {
      const originalPages = pageStructure.value.filter(page => page.type === 'original')
      const pageIndex = originalPages.findIndex(page => page.logicalPageNumber === logicalPageNumber)
      return pageIndex + 1
    }
    
    const getCopyPageIndex = (logicalPageNumber) => {
      const copyPages = pageStructure.value.filter(page => page.type === 'copy')
      const pageIndex = copyPages.findIndex(page => page.logicalPageNumber === logicalPageNumber)
      return pageIndex + 1
    }
    
    const isOriginalPage = (logicalPageNumber) => {
      const pageInfo = getPageByLogicalNumber(logicalPageNumber)
      return pageInfo?.type === 'original'
    }
    
    const isCopyPage = (logicalPageNumber) => {
      const pageInfo = getPageByLogicalNumber(logicalPageNumber)
      return pageInfo?.type === 'copy'
    }
    
    const getPageDisplayName = (logicalPageNumber) => {
      const pageInfo = getPageByLogicalNumber(logicalPageNumber)
      return pageInfo?.displayName || `หน้า ${logicalPageNumber}`
    }
    
    const getPageWatermarkText = (logicalPageNumber) => {
      const pageInfo = getPageByLogicalNumber(logicalPageNumber)
      return pageInfo?.watermarkText || ''
    }
    
    // Utility functions สำหรับการประมวลผลข้อมูลหน้า
    const exportPageStructure = () => {
      const structure = pageStructure.value || []
      return {
        totalPages: structure.length,
        basePages: getBaseTotalPages(),
        hasCopies: showBothCopies.value,
        pages: structure.map(page => ({
          id: page.id,
          pageNumber: page.pageNumber,
          logicalPageNumber: page.logicalPageNumber,
          type: page.type,
          displayName: page.displayName,
          hasWatermark: !!page.watermarkText
        }))
      }
    }
    
    const getPageStructureForExport = (format = 'json') => {
      const structure = exportPageStructure()
      
      if (format === 'json') {
        return JSON.stringify(structure, null, 2)
      } else if (format === 'array') {
        return structure.pages
      } else if (format === 'summary') {
        return {
          total: structure.totalPages,
          original: structure.pages.filter(p => p.type === 'original').length,
          copy: structure.pages.filter(p => p.type === 'copy').length,
          showBothCopies: structure.hasCopies
        }
      }
      
      return structure
    }
    
    const resetPageStructure = () => {
      pageStructure.value = []
      console.log('🗑️ Page structure reset')
    }
    
    const rebuildPageStructure = () => {
      console.log('🔄 Rebuilding page structure...')
      buildPageStructure()
      console.log('✅ Page structure rebuilt with', pageStructure.value.length, 'pages')
    }
    
    // Enhanced functions สำหรับ Print/Download ที่ใช้ Page Structure
    const getPrintOptions = () => {
      return {
        totalPages: pageStructure.value.length,
        originalPages: getOriginalPageCount(),
        copyPages: getCopyPageCount(),
        pageStructure: pageStructure.value.map(page => ({
          id: page.id,
          logicalPageNumber: page.logicalPageNumber,
          type: page.type,
          displayName: page.displayName,
          hasWatermark: !!page.watermarkText,
          watermarkText: page.watermarkText
        })),
        documentInfo: {
          type: props.documentType,
          title: props.title,
          showBothCopies: showBothCopies.value
        }
      }
    }
    
    const getDownloadOptions = () => {
      return {
        ...getPrintOptions(),
        downloadMetadata: {
          timestamp: new Date().toISOString(),
          filenameSuggestion: generateSmartFilename(),
          pageStructureSummary: getPageStructureForExport('summary')
        }
      }
    }
    
    const generateSmartFilename = () => {
      const originalCount = getOriginalPageCount()
      const copyCount = getCopyPageCount()
      const baseTitle = props.title || `${props.documentType}-document`
      
      let filename = baseTitle.replace(/[^a-zA-Z0-9ก-๙\-_]/g, '_')
      
      if (copyCount > 0) {
        filename += `_${originalCount}orig_${copyCount}copy`
      } else {
        filename += `_${originalCount}pages`
      }
      
      return filename
    }
    
    // Enhanced print function ที่ใช้ page structure เต็มรูปแบบ
    const printWithPageStructure = async (options = {}) => {
      try {
        const printOptions = {
          ...getPrintOptions(),
          ...options
        }
        
        console.log('🖨️ Print with page structure:', printOptions)
        
        // เรียกฟังก์ชันพิมพ์ที่เหมาะสม
        if (printOptions.totalPages > 1) {
          await printMultiplePages()
        } else {
          await printSinglePage()
        }
        
        // Log การใช้งาน
        console.log('📊 Print completed:', {
          totalPages: printOptions.totalPages,
          originalPages: printOptions.originalPages,
          copyPages: printOptions.copyPages,
          success: true
        })
        
      } catch (error) {
        console.error('❌ Print with page structure error:', error)
        throw error
      }
    }
    
    // Enhanced download function ที่ใช้ page structure เต็มรูปแบบ
    const downloadWithPageStructure = async (options = {}) => {
      try {
        const downloadOptions = {
          ...getDownloadOptions(),
          ...options
        }
        
        console.log('📱 Download with page structure:', downloadOptions)
        
        // เรียกฟังก์ชัน download ที่เหมาะสม
        if (downloadOptions.totalPages > 1) {
          if (showBothCopies.value) {
            await downloadWithJsPDF() // ใช้ jsPDF สำหรับเอกสารที่มีสำเนา
          } else {
            await downloadWithCombinedPages() // ใช้ combined pages สำหรับเอกสารปกติ
          }
        } else {
          await downloadSinglePage()
        }
        
        // Log การใช้งาน
        console.log('📊 Download completed:', {
          totalPages: downloadOptions.totalPages,
          originalPages: downloadOptions.originalPages,
          copyPages: downloadOptions.copyPages,
          filename: downloadOptions.downloadMetadata.filenameSuggestion,
          success: true
        })
        
      } catch (error) {
        console.error('❌ Download with page structure error:', error)
        throw error
      }
    }
    
    // ไม่ต้องใช้ thumbnail cache อีกแล้ว
    
    // ไม่ต้อง generate thumbnail อีกแล้ว ใช้ live document แทน
    const generateThumbnail = async (pageNumber) => {
      // ไม่ต้องทำอะไร template จะแสดง document จริง ๆ แล้ว
      console.log(`✅ Using live thumbnail for page ${pageNumber}`)
      return null
    }
    
    const generateAllThumbnails = async () => {
      // ไม่ต้องทำอะไร ให้ template แสดง live document
      console.log('✅ Using live document thumbnails - no generation needed!')
    }
    
    // Remove all computed styles - complete document independence
    
    // Watch for document type changes and update error accordingly
    watch(() => props.documentType, (newType) => {
      if (!isDocumentTypeSupported(newType)) {
        error.value = `ไม่รองรับเอกสารประเภท "${newType}"`
      } else if (!getDocumentComponent(newType)) {
        error.value = `ไม่พบ Component สำหรับเอกสารประเภท "${newType}"`
      } else {
        error.value = ''
      }
    }, { immediate: true })
    
    // Watch for document data changes and recalculate pages
    watch([() => props.documentData, () => props.documentType, () => showBothCopies.value], () => {
      calculateTotalPages()
    }, { immediate: true })
    
    // Auto-show sidebar when multi-page document is loaded
    watch(() => totalPages.value, (newTotal) => {
      if (newTotal > 1 && props.showThumbnails) {
        showSidebar.value = true // เปิดเป็น default เสมอ
        nextTick(() => {
          generateAllThumbnails()
        })
      } else {
        showSidebar.value = false // ปิดถ้าเป็นหน้าเดียว
      }
    })
    
    // ไม่ต้อง watch สำหรับ thumbnail generation อีกแล้ว
    // ใช้ live document thumbnails แทน
    
    // Watch showBothCopies for debugging
    watch(() => showBothCopies.value, (newValue) => {
      console.log('📋 showBothCopies changed to:', newValue)
      console.log('📄 totalPages:', totalPages.value)
      console.log('📋 pageStructure:', pageStructure.value)
    })
    
    // Watch page structure changes
    watch(() => pageStructure.value, (newStructure) => {
      console.log('🏗️ Page structure updated:', newStructure)
      console.log('📊 Structure summary:', {
        totalPages: newStructure.length,
        originalPages: newStructure.filter(p => p.type === 'original').length,
        copyPages: newStructure.filter(p => p.type === 'copy').length
      })
    }, { deep: true })
    
    // Watch current page info
    watch(() => currentPageInfo.value, (newPageInfo) => {
      if (newPageInfo) {
        console.log('📄 Current page info:', newPageInfo)
      }
    })
    
    const documentInfo = computed(() => {
      if (!props.documentData) return null
      
      // Handle both array and object data formats
      let currentDoc
      if (Array.isArray(props.documentData)) {
        currentDoc = props.documentData.length > 0 ? props.documentData[0] : {}
      } else {
        currentDoc = props.documentData
      }
      
      return {
        type: props.documentType.toUpperCase(),
        number: currentDoc.document_number || currentDoc.number || 'N/A',
        created_at: currentDoc.created_at || currentDoc.date,
        created_by: currentDoc.created_by || currentDoc.requester || 'N/A'
      }
    })
    
    const close = () => {
      emit('close')
    }
    
    
    const printDocument = async () => {
      try {
        console.log(`🖨️ Print Document using Page Structure`)
        
        // ใช้ enhanced print function ที่ใช้ page structure
        await printWithPageStructure()
        
      } catch (error) {
        console.error('Print error:', error)
        // Final fallback: emit event with page structure data
        emit('print', {
          type: props.documentType,
          id: props.documentId,
          data: props.documentData,
          totalPages: totalPages.value,
          showBothCopies: showBothCopies.value,
          pageStructure: exportPageStructure(), // เพิ่ม page structure
          pageStructureSummary: getPageStructureForExport('summary'), // เพิ่มสรุปข้อมูล
          printOptions: {
            originalPages: getOriginalPageCount(),
            copyPages: getCopyPageCount(),
            documentType: props.documentType
          }
        })
      }
    }

    // Enhanced jsPDF-based download using page structure
    const downloadWithJsPDF = async () => {
      try {
        // Start loading
        pdfGenerating.value = true
        pdfProgress.value = 'กำลังตรวจสอบข้อมูลเอกสาร...'
        
        const structure = pageStructure.value || []
        const pageElements = document.querySelectorAll('.document-isolation-container')
        
        if (pageElements.length === 0 || structure.length === 0) {
          throw new Error('No document pages or page structure found')
        }
        
        pdfProgress.value = `กำลังเตรียมสร้าง PDF (${structure.length} หน้า)...`
        
        console.log(`📱 Generating PDF using page structure:`, {
          totalPages: structure.length,
          originalPages: getOriginalPageCount(),
          copyPages: getCopyPageCount(),
          domElements: pageElements.length
        })
        
        // Create new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        // Add PDF metadata จาก page structure
        pdf.setProperties({
          title: props.title || 'เอกสาร',
          author: 'ERP System',
          subject: `Document Type: ${props.documentType}`,
          creator: 'DocumentPreview Component',
          keywords: `${props.documentType}, original: ${getOriginalPageCount()}, copy: ${getCopyPageCount()}`
        })
        
        // Process pages ตาม page structure
        for (let i = 0; i < structure.length; i++) {
          const pageInfo = structure[i]
          
          // Update progress
          pdfProgress.value = `กำลังประมวลผล ${pageInfo.displayName} (${i + 1}/${structure.length})...`
          
          console.log(`📱 Processing ${pageInfo.displayName} (${i + 1}/${structure.length})`)
        console.log(`📱 Page info:`, {
          type: pageInfo.type,
          watermarkText: pageInfo.watermarkText,
          watermarkColor: pageInfo.watermarkColor
        })
          
          // Add new page for subsequent pages
          if (i > 0) {
            pdf.addPage()
          }
          
          try {
            // Find corresponding DOM element
            const elementIndex = pageInfo.logicalPageNumber - 1
            const element = pageElements[elementIndex]
            
            if (!element) {
              throw new Error(`DOM element not found for ${pageInfo.displayName}`)
            }
            
            // Prepare element for capture
            element.style.display = 'block'
            element.style.visibility = 'visible'
            element.style.opacity = '1'
            
            // Enhance watermark visibility for PDF capture
            const watermarks = element.querySelectorAll('.document-watermark')
            const originalWatermarkStyles = []
            
            watermarks.forEach((watermark, index) => {
              // Store original style
              originalWatermarkStyles[index] = {
                cssText: watermark.style.cssText,
                classList: Array.from(watermark.classList)
              }
              
              // Enhance visibility for PDF - ใช้ setProperty เพื่อ override !important
              if (watermark.hasAttribute('data-type')) {
                const type = watermark.getAttribute('data-type')
                if (type === 'original') {
                  watermark.style.setProperty('color', 'rgba(37, 99, 235, 0.45)', 'important')
                } else if (type === 'copy') {
                  watermark.style.setProperty('color', 'rgba(239, 68, 68, 0.45)', 'important')
                }
              } else {
                // Default watermark
                watermark.style.setProperty('color', 'rgba(0, 0, 0, 0.35)', 'important')
              }
              watermark.style.setProperty('opacity', '1', 'important')
              watermark.style.setProperty('display', 'block', 'important')
              watermark.style.setProperty('visibility', 'visible', 'important')
              
              console.log(`🎨 Enhanced watermark ${index + 1}:`, {
                type: watermark.getAttribute('data-type') || 'default',
                text: watermark.textContent,
                color: watermark.style.color,
                opacity: watermark.style.opacity
              })
            })
            
            // หากไม่มี watermark ใน DOM ให้สร้างขึ้นมาใหม่
            if (watermarks.length === 0 && pageInfo.watermarkText) {
              console.log(`🎨 No existing watermarks found, creating new one for: ${pageInfo.watermarkText}`)
              
              const newWatermark = document.createElement('div')
              newWatermark.className = 'document-watermark'
              newWatermark.setAttribute('data-type', pageInfo.type)
              newWatermark.textContent = pageInfo.watermarkText
              
              // Style the new watermark
              newWatermark.style.cssText = `
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(45deg) !important;
                font-size: 80px !important;
                font-weight: 900 !important;
                font-family: Arial, sans-serif !important;
                letter-spacing: 8px !important;
                user-select: none !important;
                pointer-events: none !important;
                z-index: 10 !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                opacity: 1 !important;
                display: block !important;
                visibility: visible !important;
              `
              
              if (pageInfo.type === 'original') {
                newWatermark.style.setProperty('color', 'rgba(37, 99, 235, 0.45)', 'important')
              } else if (pageInfo.type === 'copy') {
                newWatermark.style.setProperty('color', 'rgba(239, 68, 68, 0.45)', 'important')
              } else {
                newWatermark.style.setProperty('color', 'rgba(0, 0, 0, 0.35)', 'important')
              }
              
              // Add to element
              element.appendChild(newWatermark)
              
              // Store for cleanup
              originalWatermarkStyles.push({
                element: newWatermark,
                isNew: true
              })
              
              console.log(`🎨 Created new watermark:`, {
                type: pageInfo.type,
                text: pageInfo.watermarkText,
                color: newWatermark.style.color
              })
            }
            
            // Wait for element to be ready
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Convert page to canvas with precise A4 dimensions
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: 794, // A4 width at 96dpi (210mm)
              height: 1123, // A4 height at 96dpi (297mm)
              windowWidth: 794,
              windowHeight: 1123,
              foreignObjectRendering: false,
              imageTimeout: 0,
              removeContainer: false,
              ignoreElements: (el) => {
                return el.classList.contains('page-divider') || 
                       el.classList.contains('page-navigation') ||
                       el.classList.contains('sidebar-toggle-button')
              }
            })
            
            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/jpeg', 0.98)
            
            // Add image to PDF - exact A4 dimensions, no scaling
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, '', 'FAST')
            
            // Restore original watermark styles and cleanup
            originalWatermarkStyles.forEach((styleInfo, index) => {
              if (styleInfo.isNew && styleInfo.element) {
                // Remove newly created watermarks
                styleInfo.element.remove()
              } else if (styleInfo.cssText !== undefined && watermarks[index]) {
                // Restore original watermarks
                watermarks[index].style.cssText = styleInfo.cssText
                watermarks[index].className = styleInfo.classList.join(' ')
              }
            })
            
            // Add page information as text (for debugging)
            if (process.env.NODE_ENV === 'development') {
              pdf.setFontSize(8)
              pdf.setTextColor(200, 200, 200)
              
              // Create formatted page text (e.g., "1/2 original")
              const originalPages = getOriginalPageCount()
              const copyPages = getCopyPageCount()
              
              let pageText = ''
              if (pageInfo.type === 'original') {
                const originalPageNum = pageInfo.pageNumber || (i + 1)
                pageText = `${originalPageNum}/${originalPages} original`
              } else if (pageInfo.type === 'copy') {
                const copyPageNum = pageInfo.pageNumber || (i + 1 - originalPages)
                pageText = `${copyPageNum}/${copyPages} copy`
              } else {
                pageText = `${i + 1}/${structure.length} ${pageInfo.type || 'page'}`
              }
              
              // Center the text
              const textWidth = pdf.getTextWidth(pageText)
              const pageWidth = 210 // A4 width in mm
              const xPosition = (pageWidth - textWidth) / 2
              
              pdf.text(pageText, xPosition, 292)
            }
            
            console.log(`✅ Added ${pageInfo.displayName} to PDF successfully`)
            
          } catch (pageError) {
            console.error(`❌ Error processing ${pageInfo.displayName}:`, pageError)
            
            // Add error placeholder page
            pdf.setFontSize(16)
            pdf.setTextColor(100, 100, 100)
            pdf.text(`${pageInfo.displayName}`, 20, 50)
            pdf.setFontSize(12)
            pdf.setTextColor(200, 100, 100)
            pdf.text(`เกิดข้อผิดพลาดในการสร้าง: ${pageError.message}`, 20, 70)
            pdf.setTextColor(0, 0, 0) // Reset color
          }
        }
        
        // Generate filename with page structure info
        const originalCount = getOriginalPageCount()
        const copyCount = getCopyPageCount()
        let filename = `${props.title || 'document'}`
        
        if (copyCount > 0) {
          filename += `-${originalCount}orig-${copyCount}copy`
        } else {
          filename += `-${originalCount}pages`
        }
        filename += '.pdf'
        
        // Final step
        pdfProgress.value = 'กำลังบันทึกไฟล์ PDF...'
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
        
        // Save the PDF
        pdf.save(filename)
        
        pdfProgress.value = 'สร้าง PDF เสร็จเรียบร้อย!'
        await new Promise(resolve => setTimeout(resolve, 1000)) // Show success message
        
        console.log(`📱 PDF saved as ${filename} with page structure:`, {
          totalPages: structure.length,
          original: originalCount,
          copy: copyCount
        })
        
      } catch (error) {
        console.error('Enhanced jsPDF download error:', error)
        pdfProgress.value = 'เกิดข้อผิดพลาด กำลังลองวิธีอื่น...'
        
        // Fallback to original method
        try {
          await downloadWithCombinedPages()
        } catch (fallbackError) {
          console.error('Fallback download also failed:', fallbackError)
          pdfProgress.value = 'เกิดข้อผิดพลาด กำลังลองวิธีสุดท้าย...'
          
          // Final fallback: use print dialog
          await downloadWithPrint()
        }
      } finally {
        // Always hide loading
        pdfGenerating.value = false
        pdfProgress.value = ''
      }
    }

    const downloadDocument = async () => {
      try {
        console.log(`📱 Download Document using Page Structure`)
        
        // ใช้ jsPDF method แทน html2pdf เพื่อควบคุมหน้าได้ดีกว่า
        await downloadWithJsPDF()
        
      } catch (error) {
        console.error('Download error:', error)
        // Fallback to combined pages method
        try {
          await downloadWithCombinedPages()
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          // Final fallback: emit event
          emit('download', {
            type: props.documentType,
            id: props.documentId,
            data: props.documentData,
            totalPages: totalPages.value,
            showBothCopies: showBothCopies.value,
            pageStructure: exportPageStructure(),
            pageStructureSummary: getPageStructureForExport('summary'),
            error: error.message
          })
        }
      }
    }

    // Simple print-based download as last resort
    const downloadWithPrint = async () => {
      try {
        // Start loading if not already started
        if (!pdfGenerating.value) {
          pdfGenerating.value = true
          pdfProgress.value = 'กำลังเปิดหน้าต่างการพิมพ์...'
        }
        
        const originalTitle = document.title
        document.title = `ดาวน์โหลด PDF - ${props.title || 'เอกสาร'}`
        
        // Show alert to user
        alert('กรุณาเลือก "Save as PDF" หรือ "บันทึกเป็น PDF" ในหน้าต่างการพิมพ์ที่จะเปิดขึ้น')
        
        pdfProgress.value = 'กำลังเตรียมการพิมพ์...'
        
        // Use native print dialog which can save as PDF
        window.print()
        
        // Restore title
        setTimeout(() => {
          document.title = originalTitle
        }, 100)
        
        // Auto-hide loading after timeout (user might cancel print dialog)
        setTimeout(() => {
          if (pdfGenerating.value) {
            pdfProgress.value = 'หน้าต่างการพิมพ์เปิดแล้ว'
            setTimeout(() => {
              pdfGenerating.value = false
              pdfProgress.value = ''
            }, 2000)
          }
        }, 3000)
        
      } catch (error) {
        console.error('Print-based download error:', error)
        throw error
      }
    }

    // Combined pages approach for multi-page PDF using page structure
    const downloadWithCombinedPages = async () => {
      try {
        // Start loading if not already started
        if (!pdfGenerating.value) {
          pdfGenerating.value = true
          pdfProgress.value = 'กำลังเตรียมเอกสารแบบรวมหน้า...'
        }
        
        const documentSequence = document.querySelector('.document-sequence')
        const structure = pageStructure.value || []
        
        if (!documentSequence || structure.length === 0) {
          throw new Error('Document sequence or page structure not found')
        }
        
        console.log(`📱 Download PDF using combined pages with structure:`, {
          totalPages: structure.length,
          originalPages: getOriginalPageCount(),
          copyPages: getCopyPageCount(),
          showBothCopies: showBothCopies.value
        })
        
        // Temporarily hide dividers and navigation
        const dividers = document.querySelectorAll('.page-divider')
        const navigation = document.querySelector('.page-navigation')
        const debugHeaders = document.querySelectorAll('.text-center.py-4') // ส่วนหัว "เอกสารสำเนา"

        // Also normalize margins/paddings for export to avoid extra blank pages
        const pageContainers = documentSequence.querySelectorAll('.page-container')
        const fitViewports = documentSequence.querySelectorAll('.fit-viewport')
        const scaleViewports = documentSequence.querySelectorAll('.scale-viewport')
        const scaleInners = documentSequence.querySelectorAll('.scale-inner')

        console.log(`📱 Found ${pageContainers.length} page containers for PDF generation`)
        pdfProgress.value = `กำลังปรับแต่งเอกสาร (${pageContainers.length} หน้า)...`

        // Store original styles so we can restore later
        const originalStyles = {
          dividers: Array.from(dividers).map(d => d.style.display),
          navigation: navigation ? navigation.style.display : null,
          debugHeaders: Array.from(debugHeaders).map(h => h.style.display),
          pageContainers: Array.from(pageContainers).map(c => ({
            marginTop: c.style.marginTop,
            marginBottom: c.style.marginBottom,
            paddingTop: c.style.paddingTop,
            paddingBottom: c.style.paddingBottom
          })),
          fitViewports: Array.from(fitViewports).map(c => ({
            marginTop: c.style.marginTop,
            marginBottom: c.style.marginBottom,
            paddingTop: c.style.paddingTop,
            paddingBottom: c.style.paddingBottom
          })),
          scaleViewports: Array.from(scaleViewports).map(c => ({
            marginTop: c.style.marginTop,
            marginBottom: c.style.marginBottom,
            paddingTop: c.style.paddingTop,
            paddingBottom: c.style.paddingBottom
          })),
          scaleInners: Array.from(scaleInners).map(c => ({
            marginTop: c.style.marginTop,
            marginBottom: c.style.marginBottom,
            paddingTop: c.style.paddingTop,
            paddingBottom: c.style.paddingBottom
          }))
        }

        // Hide elements that shouldn't be in PDF
        dividers.forEach(d => d.style.display = 'none')
        debugHeaders.forEach(h => h.style.display = 'none') // ซ่อน debug headers
        if (navigation) navigation.style.display = 'none'

        // Remove margins/paddings that can push content to a new page and create blanks
        pageContainers.forEach((c, index) => {
          c.style.marginTop = '0'
          c.style.marginBottom = '0'  
          c.style.paddingTop = '0'
          c.style.paddingBottom = '0'
          
          // Add specific page break control
          if (index === 0) {
            // First page - no break before
            c.style.pageBreakBefore = 'auto'
          } else {
            // Subsequent pages - break before
            c.style.pageBreakBefore = 'always'
          }
          c.style.pageBreakAfter = 'auto'
          c.style.pageBreakInside = 'avoid'
        })
        
        fitViewports.forEach(c => {
          c.style.marginTop = '0'
          c.style.marginBottom = '0'
          c.style.paddingTop = '0'
          c.style.paddingBottom = '0'
        })
        scaleViewports.forEach(c => {
          c.style.marginTop = '0'
          c.style.marginBottom = '0'
          c.style.paddingTop = '0'
          c.style.paddingBottom = '0'
        })
        scaleInners.forEach(c => {
          c.style.marginTop = '0'
          c.style.marginBottom = '0'
          c.style.paddingTop = '0'
          c.style.paddingBottom = '0'
        })
        
        // Enhance watermark visibility for PDF capture
        const allWatermarks = documentSequence.querySelectorAll('.document-watermark')
        const originalWatermarkStyles = []
        
        console.log(`🎨 Found ${allWatermarks.length} watermarks for PDF enhancement`)
        
        allWatermarks.forEach((watermark, index) => {
          // Store original style
          originalWatermarkStyles[index] = {
            cssText: watermark.style.cssText,
            classList: Array.from(watermark.classList)
          }
          
          // Enhance visibility for PDF - ใช้ setProperty เพื่อ override !important
          if (watermark.hasAttribute('data-type')) {
            const type = watermark.getAttribute('data-type')
            if (type === 'original') {
              watermark.style.setProperty('color', 'rgba(37, 99, 235, 0.45)', 'important')
            } else if (type === 'copy') {
              watermark.style.setProperty('color', 'rgba(239, 68, 68, 0.45)', 'important')
            }
          } else {
            // Default watermark
            watermark.style.setProperty('color', 'rgba(0, 0, 0, 0.35)', 'important')
          }
          watermark.style.setProperty('opacity', '1', 'important')
          watermark.style.setProperty('display', 'block', 'important')
          watermark.style.setProperty('visibility', 'visible', 'important')
          
          console.log(`🎨 Enhanced watermark ${index + 1}:`, {
            type: watermark.getAttribute('data-type') || 'default',
            text: watermark.textContent,
            color: watermark.style.color
          })
        })
        
        // สร้าง watermarks ใหม่หากไม่มีใน DOM
        if (allWatermarks.length === 0) {
          console.log(`🎨 No watermarks found in DOM, creating new ones from page structure`)
          
          const structure = pageStructure.value || []
          const pageContainers = documentSequence.querySelectorAll('.document-isolation-container')
          
          structure.forEach((pageInfo, index) => {
            if (pageInfo.watermarkText && pageContainers[index]) {
              const container = pageContainers[index]
              
              const newWatermark = document.createElement('div')
              newWatermark.className = 'document-watermark'
              newWatermark.setAttribute('data-type', pageInfo.type)
              newWatermark.textContent = pageInfo.watermarkText
              
              // Style the new watermark
              newWatermark.style.cssText = `
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(45deg) !important;
                font-size: 80px !important;
                font-weight: 900 !important;
                font-family: Arial, sans-serif !important;
                letter-spacing: 8px !important;
                user-select: none !important;
                pointer-events: none !important;
                z-index: 10 !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                opacity: 1 !important;
                display: block !important;
                visibility: visible !important;
              `
              
              if (pageInfo.type === 'original') {
                newWatermark.style.setProperty('color', 'rgba(37, 99, 235, 0.45)', 'important')
              } else if (pageInfo.type === 'copy') {
                newWatermark.style.setProperty('color', 'rgba(239, 68, 68, 0.45)', 'important')
              } else {
                newWatermark.style.setProperty('color', 'rgba(0, 0, 0, 0.35)', 'important')
              }
              
              // Add to container
              container.appendChild(newWatermark)
              
              // Store for cleanup
              originalWatermarkStyles.push({
                element: newWatermark,
                isNew: true,
                container: container
              })
              
              console.log(`🎨 Created new watermark for page ${index + 1}:`, {
                type: pageInfo.type,
                text: pageInfo.watermarkText,
                color: newWatermark.style.color
              })
            }
          })
        }
        
  // Note: Do NOT add CSS page breaks here; we'll let html2pdf handle page breaks
  // via the `pagebreak.before` option below. Adding both CSS page breaks and the
  // html2pdf `before` hook can cause duplicate breaks that produce blank pages.
        
        // Wait for layout
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Generate enhanced filename with page structure info
        const originalCount = getOriginalPageCount()
        const copyCount = getCopyPageCount()
        let enhancedFilename = `${props.title || 'document'}`
        
        if (copyCount > 0) {
          enhancedFilename += `-${originalCount}orig-${copyCount}copy-combined`
        } else {
          enhancedFilename += `-${originalCount}pages-combined`
        }
        enhancedFilename += '.pdf'
        
        const opt = {
          margin: 0,
          filename: enhancedFilename,
          image: { 
            type: 'jpeg', 
            quality: 0.98
          },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 794, // A4 width at 96dpi (210mm * 96/25.4)
            windowHeight: 1123, // A4 height at 96dpi (297mm * 96/25.4)
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc) => {
              // ลบ elements ที่ไม่ต้องการใน cloned document
              const clonedDividers = clonedDoc.querySelectorAll('.page-divider')
              const clonedNav = clonedDoc.querySelector('.page-navigation')
              const clonedDebug = clonedDoc.querySelectorAll('.text-center.py-4')
              
              clonedDividers.forEach(d => d.remove())
              clonedDebug.forEach(h => h.remove())
              if (clonedNav) clonedNav.remove()
              
              // ตั้งค่า page containers ใน cloned doc
              const clonedContainers = clonedDoc.querySelectorAll('.page-container')
              clonedContainers.forEach((container, idx) => {
                container.style.pageBreakBefore = idx === 0 ? 'auto' : 'always'
                container.style.pageBreakAfter = 'auto'
                container.style.pageBreakInside = 'avoid'
              })
            }
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true,
            hotfixes: ['px_scaling']
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            before: '.page-container:not(:first-child)',
            after: [],
            avoid: ['.document-isolation-container', 'table', 'tr', 'thead', 'tbody']
          }
        }
        
        console.log('Starting combined pages PDF generation...')
        pdfProgress.value = 'กำลังสร้าง PDF...'
        
        await html2pdf().set(opt).from(documentSequence).save()
        
        pdfProgress.value = 'สร้าง PDF เสร็จเรียบร้อย!'
        await new Promise(resolve => setTimeout(resolve, 1000)) // Show success message
        
        console.log('Combined pages PDF generated successfully')
        
        // Restore original watermark styles and cleanup
        originalWatermarkStyles.forEach((styleInfo, index) => {
          if (styleInfo.isNew && styleInfo.element) {
            // Remove newly created watermarks
            styleInfo.element.remove()
          } else if (styleInfo.cssText !== undefined && allWatermarks[index]) {
            // Restore original watermarks
            allWatermarks[index].style.cssText = styleInfo.cssText
            allWatermarks[index].className = styleInfo.classList.join(' ')
          }
        })
        
        // Restore original styles
        dividers.forEach((d, index) => {
          d.style.display = originalStyles.dividers[index]
        })
        debugHeaders.forEach((h, index) => {
          h.style.display = originalStyles.debugHeaders[index]
        })
        if (navigation && originalStyles.navigation !== null) {
          navigation.style.display = originalStyles.navigation
        }
        pageContainers.forEach((c, i) => {
          const s = originalStyles.pageContainers[i]
          c.style.marginTop = s.marginTop
          c.style.marginBottom = s.marginBottom
          c.style.paddingTop = s.paddingTop
          c.style.paddingBottom = s.paddingBottom
          // Reset page break styles
          c.style.pageBreakBefore = ''
          c.style.pageBreakAfter = ''
          c.style.pageBreakInside = ''
        })
        fitViewports.forEach((c, i) => {
          const s = originalStyles.fitViewports[i]
          c.style.marginTop = s.marginTop
          c.style.marginBottom = s.marginBottom
          c.style.paddingTop = s.paddingTop
          c.style.paddingBottom = s.paddingBottom
        })
        scaleViewports.forEach((c, i) => {
          const s = originalStyles.scaleViewports[i]
          c.style.marginTop = s.marginTop
          c.style.marginBottom = s.marginBottom
          c.style.paddingTop = s.paddingTop
          c.style.paddingBottom = s.paddingBottom
        })
        scaleInners.forEach((c, i) => {
          const s = originalStyles.scaleInners[i]
          c.style.marginTop = s.marginTop
          c.style.marginBottom = s.marginBottom
          c.style.paddingTop = s.paddingTop
          c.style.paddingBottom = s.paddingBottom
        })
        
      } catch (error) {
        console.error('Combined pages download error:', error)
        pdfProgress.value = 'เกิดข้อผิดพลาด กำลังลองวิธีอื่น...'
        
        // Fallback to jsPDF method
        try {
          await downloadWithJsPDF()
        } catch (jsPdfError) {
          console.error('jsPDF download also failed:', jsPdfError)
          pdfProgress.value = 'เกิดข้อผิดพลาด กำลังลองวิธีสุดท้าย...'
          
          // Final fallback: use print dialog
          await downloadWithPrint()
        }
      } finally {
        // Always hide loading if this function started it
        pdfGenerating.value = false
        pdfProgress.value = ''
      }
    }

    // Single page print function
    const printSinglePage = async () => {
      // Open centered popup window for better print UX
      const w = 800
      const h = 600
      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY
      const width = window.innerWidth || document.documentElement.clientWidth || screen.width
      const height = window.innerHeight || document.documentElement.clientHeight || screen.height
      const left = dualScreenLeft + (width - w) / 2
      const top = dualScreenTop + (height - h) / 2
      const features = `toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1,status=0,width=${w},height=${h},top=${Math.max(0, top)},left=${Math.max(0, left)}`
      const printWindow = window.open('', 'document-print', features)
      if (!printWindow) {
        console.error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้')
        return
      }
      
      const docElement = document.querySelector('.document-isolation-container')
      if (!docElement) {
        console.error('ไม่พบเอกสารที่จะพิมพ์')
        printWindow.close()
        return
      }
      
      try {
        const { inlineStyles, linkTags } = extractDocumentStyles()
        
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>พิมพ์เอกสาร - ${props.title || 'เอกสาร'}</title>
            <meta charset="UTF-8">
            ${linkTags}
            <style>
              /* Reset and base styles */
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif; 
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              /* A4 Print page settings */
              @page { 
                size: A4 portrait; 
                margin: 0; 
              }
              
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
              
              /* Import all document styles */
              ${inlineStyles}
            </style>
          </head>
          <body>
            ${docElement.outerHTML}
          </body>
          </html>
        `
        
        printWindow.document.write(printContent)
        printWindow.document.close()

        // Auto-close the popup when printing completes
        printWindow.onafterprint = () => {
          try { printWindow.close() } catch (e) { /* noop */ }
        }

        // Fallback: if afterprint is not fired, close when window regains focus
        const closeOnFocus = () => {
          try { printWindow.close() } catch (e) { /* noop */ }
          window.removeEventListener('focus', closeOnFocus)
        }

        // Add a small delay to ensure content is loaded before printing
        setTimeout(() => {
          try { printWindow.focus() } catch (e) { /* noop */ }
          printWindow.print()
          // Add focus listener as a fallback for browsers that don't fire onafterprint reliably
          setTimeout(() => {
            window.addEventListener('focus', closeOnFocus, { once: true })
          }, 100)
        }, 250)
        
      } catch (error) {
        console.error('Error in single page printing:', error)
        printWindow.close()
        throw error
      }
    }

    // Multi-page print function using page structure
    const printMultiplePages = async () => {
      // Open centered popup window for better print UX
      const w = 800
      const h = 600
      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY
      const width = window.innerWidth || document.documentElement.clientWidth || screen.width
      const height = window.innerHeight || document.documentElement.clientHeight || screen.height
      const left = dualScreenLeft + (width - w) / 2
      const top = dualScreenTop + (height - h) / 2
      const features = `toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1,status=0,width=${w},height=${h},top=${Math.max(0, top)},left=${Math.max(0, left)}`
      const printWindow = window.open('', 'document-print', features)
      if (!printWindow) {
        console.error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้')
        return
      }
      
      try {
        const pages = []
        const { inlineStyles, linkTags } = extractDocumentStyles()
        
        // ใช้ page structure ในการสร้างหน้าพิมพ์
        const structure = pageStructure.value || []
        console.log(`🖨️ Starting print with page structure:`, {
          totalPages: structure.length,
          originalPages: getOriginalPageCount(),
          copyPages: getCopyPageCount(),
          showBothCopies: showBothCopies.value
        })
        
        // วนลูปตาม page structure
        for (const pageInfo of structure) {
          console.log(`🖨️ Processing ${pageInfo.displayName} (${pageInfo.type})`)
          
          try {
            const pageContent = await renderPageContent(pageInfo.logicalPageNumber)
            pages.push({
              content: pageContent,
              pageInfo: pageInfo,
              logicalPageNumber: pageInfo.logicalPageNumber
            })
            console.log(`✅ Successfully processed ${pageInfo.displayName}`)
          } catch (error) {
            console.error(`❌ Error processing ${pageInfo.displayName}:`, error)
            // เพิ่ม placeholder สำหรับหน้าที่มีปัญหา
            pages.push({
              content: createPlaceholderPage(pageInfo.logicalPageNumber, error.message, pageInfo),
              pageInfo: pageInfo,
              logicalPageNumber: pageInfo.logicalPageNumber
            })
          }
        }
        console.log(`🖨️ Collected ${pages.length} pages for printing`)
        
        // สร้าง print metadata จาก page structure
        const printMetadata = {
          title: props.title || 'เอกสาร',
          totalPages: pages.length,
          originalPages: pages.filter(p => p.pageInfo.type === 'original').length,
          copyPages: pages.filter(p => p.pageInfo.type === 'copy').length,
          documentType: props.documentType,
          timestamp: new Date().toISOString(),
          pageStructure: structure.map(p => ({
            logicalPageNumber: p.logicalPageNumber,
            type: p.type,
            displayName: p.displayName
          }))
        }
        
        console.log('📋 Print metadata:', printMetadata)
        
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>พิมพ์เอกสารหลายหน้า - ${printMetadata.title}</title>
            <meta charset="UTF-8">
            <meta name="print-metadata" content='${JSON.stringify(printMetadata)}'>
            ${linkTags}
            <style>
              /* Reset and base styles */
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif; 
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              /* A4 Print page settings */
              @page { 
                size: A4 portrait; 
                margin: 0; 
              }
              
              .page-break { 
                page-break-after: always; 
              }
              .page-break:last-child { 
                page-break-after: auto; 
              }
              
              /* Page type specific styles */
              .page-original { position: relative; }
              .page-copy { position: relative; opacity: 0.98; }
              
              /* Enhanced watermark styles for print */
              .document-watermark {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(45deg) !important;
                font-size: 80px !important;
                font-weight: 900 !important;
                font-family: 'Arial', sans-serif !important;
                letter-spacing: 8px !important;
                user-select: none !important;
                pointer-events: none !important;
                z-index: 10 !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                display: block !important;
                visibility: visible !important;
              }
              
              /* Page number styles for print */
              .print-page-number {
                position: absolute !important;
                bottom: 6px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                font-size: 10px !important;
                font-weight: 500 !important;
                color: rgba(0, 0, 0, 0.8) !important;
                font-family: 'Arial', sans-serif !important;
                z-index: 15 !important;
                white-space: nowrap !important;
                text-align: center !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .page-break { page-break-after: always; }
                .page-break:last-child { page-break-after: auto; }
                .document-watermark {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  display: block !important;
                  visibility: visible !important;
                }
                .print-page-number {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  display: block !important;
                  visibility: visible !important;
                }
                /* Hide preview page numbers in print */
                .document-page-number {
                  display: none !important;
                }
              }
              
              /* Import all document styles */
              ${inlineStyles}
            </style>
          </head>
          <body>
            <!-- Print Header Comment -->
            <!-- Generated from Page Structure Array: ${pages.length} pages -->
            <!-- Original: ${printMetadata.originalPages}, Copy: ${printMetadata.copyPages} -->
            
            ${pages.map((pageData, index) => {
              // Calculate page numbers for display
              let pageNumberText = ''
              if (pageData.pageInfo.type === 'original') {
                const originalPageNum = pageData.pageInfo.pageNumber
                pageNumberText = `${originalPageNum}/${printMetadata.originalPages} ต้นฉบับ`
              } else if (pageData.pageInfo.type === 'copy') {
                const copyPageNum = pageData.pageInfo.pageNumber - printMetadata.originalPages
                pageNumberText = `${copyPageNum}/${printMetadata.copyPages} สำเนา`
              } else {
                pageNumberText = `${index + 1}/${printMetadata.totalPages}`
              }
              
              return `<div class="page-break page-${pageData.pageInfo.type}" 
                    data-page-type="${pageData.pageInfo.type}"
                    data-page-number="${pageData.pageInfo.pageNumber}"
                    data-logical-page="${pageData.pageInfo.logicalPageNumber}"
                    data-display-name="${pageData.pageInfo.displayName}"
                    style="position: relative;">
                ${pageData.content}
                <div class="print-page-number">${pageNumberText}</div>
              </div>`
            }).join('')}
            
            <!-- Print Footer Comment -->
            <!-- End of ${printMetadata.title} - ${printMetadata.totalPages} pages -->
          </body>
          </html>
        `
        
        printWindow.document.write(printContent)
        printWindow.document.close()

        // Auto-close the popup when printing completes
        printWindow.onafterprint = () => {
          try { printWindow.close() } catch (e) { /* noop */ }
        }

        // Fallback: if afterprint is not fired, close when main window regains focus
        const closeOnFocus = () => {
          try { printWindow.close() } catch (e) { /* noop */ }
          window.removeEventListener('focus', closeOnFocus)
        }
        
        // Add a small delay to ensure content is loaded before printing
        setTimeout(() => {
          try { printWindow.focus() } catch (e) { /* noop */ }
          printWindow.print()
          setTimeout(() => {
            window.addEventListener('focus', closeOnFocus, { once: true })
          }, 100)
        }, 250)
        
      } catch (error) {
        console.error('Error in multi-page printing:', error)
        printWindow.close()
        throw error
      }
    }

    // Single page download function
    const downloadSinglePage = async () => {
      const docElement = document.querySelector('.document-isolation-container')
      if (!docElement) {
        console.error('ไม่พบเอกสารที่จะดาวน์โหลด')
        return
      }
      
      try {
        const element = docElement.cloneNode(true)
        const opt = {
          margin: 0,
          filename: `${props.title || 'document'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123 // A4 height in pixels at 96 DPI
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        }
        
        await html2pdf().set(opt).from(element).save()
        
      } catch (error) {
        console.error('Download error:', error)
        // Fallback: emit event for external handling with page structure
        emit('download', {
          type: props.documentType,
          id: props.documentId,
          data: props.documentData,
          totalPages: 1,
          showBothCopies: showBothCopies.value,
          pageStructure: exportPageStructure(), // เพิ่ม page structure
          pageStructureSummary: getPageStructureForExport('summary'), // เพิ่มสรุปข้อมูล
          error: error.message
        })
      }
    }

    // Helper function to extract CSS styles from document component
    const extractDocumentStyles = () => {
      const styles = []
      
      // Get all style elements from the document (including Vue scoped styles)
      const allStyles = document.querySelectorAll('style')
      allStyles.forEach(style => {
        if (style.textContent) {
          // Include all styles, including scoped styles
          styles.push(style.textContent)
        }
      })
      
      // Get all linked stylesheets (external CSS like Tailwind, etc.)
      const links = document.querySelectorAll('link[rel="stylesheet"]')
      const linkTags = Array.from(links).map(link => 
        `<link rel="stylesheet" href="${link.href}">`
      ).join('\n')
      
      // Add specific styles for PurchaseRequestDocument if not already included
      const purchaseRequestStyles = `
        /* Ensure A4 document styles are preserved */
        [data-document-isolated="true"] {
          width: 210mm !important;
          height: 297mm !important;
          font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.2 !important;
          color: #000000 !important;
          background: #ffffff !important;
          margin: 0 auto !important;
          padding: 0 !important;
          position: relative !important;
          box-sizing: border-box !important;
          display: block !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Ensure document content preserves layout */
        .document-content {
          position: absolute;
          top: 5mm;
          left: 5mm;
          right: 5mm;
          bottom: 5mm;
          width: 200mm;
          height: 287mm;
          display: grid;
          grid-template-rows: 24mm 26mm 1fr 35mm 20mm;
          grid-row-gap: 0mm;
          background: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        /* Watermark styles for printing */
        .document-watermark-container {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .document-watermark {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) rotate(45deg) !important;
          font-size: 80px !important;
          font-weight: 900 !important;
          color: rgba(0, 0, 0, 0.08) !important;
          font-family: 'Arial', sans-serif !important;
          letter-spacing: 8px !important;
          user-select: none !important;
          pointer-events: none !important;
          z-index: 10 !important;
          text-transform: uppercase !important;
          white-space: nowrap !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document-watermark[data-type="original"] {
          color: rgba(37, 99, 235, 0.12) !important;
        }
        
        .document-watermark[data-type="copy"] {
          color: rgba(239, 68, 68, 0.12) !important;
        }
        
        @media print {
          .document-watermark {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: block !important;
            visibility: visible !important;
          }
          
          .document-watermark[data-type="original"] {
            color: rgba(37, 99, 235, 0.15) !important;
          }
          
          .document-watermark[data-type="copy"] {
            color: rgba(239, 68, 68, 0.15) !important;
          }
        }
      `
      
      return {
        inlineStyles: styles.join('\n') + '\n' + purchaseRequestStyles,
        linkTags: linkTags
      }
    }

    // Helper function to render page content for printing/downloading using page structure
    const renderPageContent = async (logicalPageNumber) => {
      return new Promise((resolve) => {
        console.log(`🖨️ Rendering page ${logicalPageNumber} using page structure`)
        
        // ใช้ page structure เพื่อหาข้อมูลหน้า
        const pageInfo = getPageByLogicalNumber(logicalPageNumber)
        if (!pageInfo) {
          console.warn(`❌ No page info found for logical page ${logicalPageNumber}`)
          resolve(createPlaceholderPage(logicalPageNumber, 'No page info'))
          return
        }
        
        console.log(`📄 Found page info:`, pageInfo)
        
        // หา DOM element ที่ตรงกับหน้านี้
        const pageElements = document.querySelectorAll('.document-isolation-container')
        const elementIndex = logicalPageNumber - 1
        
        if (elementIndex >= 0 && elementIndex < pageElements.length && pageElements[elementIndex]) {
          const pageClone = pageElements[elementIndex].cloneNode(true)
          
          // ลบ watermarks เก่าออก
          const existingWatermarks = pageClone.querySelectorAll('.document-watermark')
          existingWatermarks.forEach(wm => wm.remove())
          
          // เพิ่ม watermark ตามข้อมูลใน page structure
          if (pageInfo.watermarkText) {
            addWatermarkToElement(pageClone, pageInfo)
          }
          
          // กำหนด page break style
          pageClone.style.pageBreakAfter = logicalPageNumber < totalPages.value ? 'always' : 'auto'
          
          // เพิ่ม metadata attributes
          pageClone.setAttribute('data-page-type', pageInfo.type)
          pageClone.setAttribute('data-page-number', pageInfo.pageNumber.toString())
          pageClone.setAttribute('data-logical-page', pageInfo.logicalPageNumber.toString())
          
          console.log(`✅ Successfully rendered ${pageInfo.displayName}`)
          resolve(pageClone.outerHTML)
        } else {
          console.warn(`❌ Could not find DOM element for page ${logicalPageNumber}`)
          resolve(createPlaceholderPage(logicalPageNumber, 'DOM element not found', pageInfo))
        }
      })
    }
    
    // Helper function สำหรับสร้าง placeholder page
    const createPlaceholderPage = (logicalPageNumber, reason, pageInfo = null) => {
      const displayName = pageInfo?.displayName || `หน้า ${logicalPageNumber}`
      
      return `<div class="document-isolation-container" 
                   style="padding: 20px; text-align: center; page-break-after: auto;"
                   data-page-type="${pageInfo?.type || 'unknown'}"
                   data-logical-page="${logicalPageNumber}">
        <div style="color: #666; font-size: 16px; margin-bottom: 10px;">
          ${displayName}
        </div>
        <div style="color: #999; font-size: 12px;">
          ไม่สามารถสร้างได้: ${reason}
        </div>
      </div>`
    }
    
    // Helper function สำหรับเพิ่ม watermark ตาม page structure
    const addWatermarkToElement = (element, pageInfo) => {
      try {
        let watermarkContainer = element.querySelector('.document-watermark-container')
        
        if (!watermarkContainer) {
          // สร้าง watermark container ใหม่
          const documentContent = element.querySelector('[data-document-isolated="true"]') || element
          watermarkContainer = document.createElement('div')
          watermarkContainer.className = 'document-watermark-container'
          watermarkContainer.style.cssText = 'position: relative; width: 100%; height: 100%;'
          
          // ย้าย content ไปใน container
          while (documentContent.firstChild) {
            watermarkContainer.appendChild(documentContent.firstChild)
          }
          documentContent.appendChild(watermarkContainer)
        }
        
        // สร้าง watermark element
        const watermark = document.createElement('div')
        watermark.className = 'document-watermark'
        watermark.textContent = pageInfo.watermarkText
        watermark.setAttribute('data-type', pageInfo.type)
        
        // ใช้สีจาก page structure
        watermark.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          font-size: 80px;
          font-weight: 900;
          color: ${pageInfo.watermarkColor};
          font-family: 'Arial', sans-serif;
          letter-spacing: 8px;
          user-select: none;
          pointer-events: none;
          z-index: 10;
          text-transform: uppercase;
          white-space: nowrap;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: block !important;
          visibility: visible !important;
        `
        
        watermarkContainer.appendChild(watermark)
        console.log(`🏷️ Added ${pageInfo.watermarkText} watermark (${pageInfo.type})`)
        
      } catch (error) {
        console.warn('⚠️ Error adding watermark:', error)
      }
    }

    const retry = () => {
      error.value = ''
      // Emit retry event if needed
      emit('error', { action: 'retry', type: props.documentType, id: props.documentId })
    }
    
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Handle ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && props.show) {
        close()
      }
    }

    // Handle clicks outside (ไม่ต้องใช้แล้วเพราะเปลี่ยนเป็น checkbox)
    const handleClickOutside = () => {
      // ไม่ต้องทำอะไร
    }

    // Fit document to viewport without scroll by scaling down
    const measureDoc = () => {
      let targetElement = null
      
      try {
        // First try: use docRoot ref if available
        if (docRoot.value && typeof docRoot.value.getBoundingClientRect === 'function') {
          targetElement = docRoot.value
        } else {
          // Fallback: find the first document isolation container
          const containers = document.querySelectorAll('.document-isolation-container')
          if (containers.length > 0) {
            targetElement = containers[0]
          }
        }
        
        if (targetElement && typeof targetElement.getBoundingClientRect === 'function') {
          // Measure natural size in pixels
          const rect = targetElement.getBoundingClientRect()
          // If component not laid out yet, fallback to A4 at 96dpi (~793.7 x 1122.5)
          docWidthPx.value = rect.width > 0 ? rect.width : (210 * 96) / 25.4
          docHeightPx.value = rect.height > 0 ? rect.height : (297 * 96) / 25.4
          
          console.log('📏 Document measured:', {
            width: docWidthPx.value,
            height: docHeightPx.value,
            source: docRoot.value === targetElement ? 'docRoot' : 'querySelector'
          })
        } else {
          // Use A4 dimensions as fallback
          docWidthPx.value = (210 * 96) / 25.4
          docHeightPx.value = (297 * 96) / 25.4
          console.log('📏 Using fallback A4 dimensions:', {
            width: docWidthPx.value,
            height: docHeightPx.value
          })
        }
      } catch (error) {
        console.warn('⚠️ Error in measureDoc:', error)
        // Use A4 dimensions as safe fallback
        docWidthPx.value = (210 * 96) / 25.4
        docHeightPx.value = (297 * 96) / 25.4
      }
    }

    const updateScale = () => {
      if (!containerEl.value) {
        console.log('⚠️ containerEl not available for updateScale')
        return
      }
      
      // Ensure we have doc dimensions
      if (!docWidthPx.value || !docHeightPx.value) {
        console.log('📏 Measuring document dimensions...')
        measureDoc()
      }

      const el = containerEl.value
      const cs = window.getComputedStyle(el)
      const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0')
      const padY = parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0')

      const availW = Math.max(0, el.clientWidth - padX)
      const availH = Math.max(0, el.clientHeight - padY)

      if (docWidthPx.value && docHeightPx.value && availW && availH) {
        // Calculate base fit scales
        const fitPage = Math.min(availW / docWidthPx.value, availH / docHeightPx.value)

        // Resolve current mode
        let mode = zoomMode.value
        if (mode === 'auto') {
          mode = 'fit-page'
        }

        let s
        if (mode === 'fit-page') {
          s = fitPage
        } else if (mode === 'custom') {
          // custom zoom uses absolute scale (1 = 100%)
          s = zoom.value
        } else if (mode === 'actual') {
          s = 1
        } else {
          s = fitPage
        }
        // Clamp scale to reasonable range
        const sClamped = Math.max(0.3, Math.min(s, 3))
        scale.value = isFinite(sClamped) && sClamped > 0 ? sClamped : 1
        
        console.log('🔍 Scale updated:', {
          mode: mode,
          scale: scale.value,
          docDimensions: { width: docWidthPx.value, height: docHeightPx.value },
          availableDimensions: { width: availW, height: availH }
        })
      } else {
        scale.value = 1
        console.log('⚠️ Using fallback scale: 1')
      }
    }

    const viewportStyle = computed(() => {
      const w = Math.round(docWidthPx.value * scale.value)
      const h = Math.round(docHeightPx.value * scale.value)
      return {
        width: (w || 0) + 'px',
        height: (h || 0) + 'px',
      }
    })

    const scaleStyle = computed(() => {
      return {
        width: (docWidthPx.value || 0) + 'px',
        height: (docHeightPx.value || 0) + 'px',
        transform: `scale(${scale.value})`,
        transformOrigin: 'center center',
      }
    })

    const zoomModeComputed = computed(() => {
      // Reflect effective mode when auto is used
      if (!containerEl.value || zoomMode.value !== 'auto') return zoomMode.value
      return 'fit-page'
    })

    const zoomPercent = computed(() => Math.round(scale.value * 100))

    const setFitPage = () => {
      zoomMode.value = 'actual'
      zoom.value = 1
      scale.value = 1
      nextTick(() => {
        try {
          updateScale()
        } catch (error) {
          console.warn('⚠️ Error in setFitPage:', error)
        }
      })
    }
    const zoomIn = () => {
      zoomMode.value = 'custom'
      zoom.value = Math.min(zoom.value + 0.1, 3)
      try {
        updateScale()
      } catch (error) {
        console.warn('⚠️ Error in zoomIn:', error)
      }
    }
    const zoomOut = () => {
      zoomMode.value = 'custom'
      zoom.value = Math.max(zoom.value - 0.1, 0.3)
      try {
        updateScale()
      } catch (error) {
        console.warn('⚠️ Error in zoomOut:', error)
      }
    }
    
    // Watch for show prop changes
    watch(() => props.show, (newShow) => {
      if (newShow) {
        lockBodyScroll()
        nextTick(() => {
          setTimeout(() => {
            try {
              measureDoc()
              updateScale()
            } catch (error) {
              console.warn('⚠️ Error in show watch:', error)
            }
          }, 200) // Increased delay for DOM readiness
        })
      } else {
        unlockBodyScroll()
      }
    })

    // Recompute when document changes
    watch([() => props.documentType, () => props.documentData], () => {
      nextTick(() => {
        setTimeout(() => {
          try {
            measureDoc()
            updateScale()
          } catch (error) {
            console.warn('⚠️ Error in document watch:', error)
          }
        }, 200)
      })
    })
    
    onMounted(() => {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('resize', updateScale)
      
      // Initialize page structure first
      try {
        buildPageStructure()
        console.log('📋 Initial page structure built in onMounted')
      } catch (error) {
        console.warn('⚠️ Error building initial page structure:', error)
      }
      
      // Wait for component to be fully mounted and DOM to be ready
      nextTick(() => {
        setTimeout(() => {
          try {
            measureDoc()
            updateScale()
          } catch (error) {
            console.warn('⚠️ Error in onMounted measurement:', error)
          }
        }, 300) // Longer delay for initial mount
      })
      
      if (props.show) {
        lockBodyScroll()
      }
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
      unlockBodyScroll()
      window.removeEventListener('resize', updateScale)
    })
    
    return {
      loading,
      pdfGenerating,
      pdfProgress,
      error,
      documentComponent,
      documentInfo,
      close,
      printDocument,
      downloadDocument,
      retry,
      formatDate,
      containerEl,
      docRoot,
      viewportStyle,
      scaleStyle,

      // Multi-page support
      currentPage,
      totalPages,
      mergedDocumentOptions,
      getPageOptions,
      nextPage,
      previousPage,
      goToPage,
      // Zoom controls
      zoomModeComputed,
      zoomPercent,
      setFitPage,
      zoomIn,
      zoomOut,
      // Thumbnail sidebar
      showSidebar,
      sidebarWidth,
      toggleSidebar,
      selectPage,
      generateThumbnail,
      generateAllThumbnails,
      scrollToSelectedPage,
      // Copy mode functions
      showBothCopies,
      toggleBothCopies,
      getCopyModeLabel,
      getBaseTotalPages,
      
      // Page Structure functions
      pageStructure,
      currentPageInfo,
      originalPages,
      copyPages,
      getPageInfo,
      getPagesByType,
      getTotalPagesByType,
      getPageByLogicalNumber,
      getOriginalPageCount,
      getCopyPageCount,
      getOriginalPageIndex,
      getCopyPageIndex,
      isOriginalPage,
      isCopyPage,
      getPageDisplayName,
      getPageWatermarkText,
      buildPageStructure,
      
      // Page Structure utilities
      exportPageStructure,
      getPageStructureForExport,
      resetPageStructure,
      rebuildPageStructure,
      
      // Enhanced Print/Download functions
      getPrintOptions,
      getDownloadOptions,
      generateSmartFilename,
      printWithPageStructure,
      downloadWithPageStructure,
      
      // Ref utilities
      setDocRoot
    }
  }
}
</script>

<style scoped>
/* Document Content Area */
.document-content-area {
  flex: 1;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Thumbnail Sidebar */
.thumbnail-sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sidebar Toggle Button */
.sidebar-toggle-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 24px;
  height: 48px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0 0.375rem 0.375rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  font-size: 12px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.sidebar-toggle-close {
  left: var(--sidebar-width, 160px); /* ข้างๆ sidebar */
  border-left: none;
}

.sidebar-toggle-open {
  left: 0;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
}

.sidebar-toggle-button:hover {
  background: #f8fafc;
  color: #374151;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.5rem;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.thumbnail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.thumbnail-active {
  background: #dbeafe;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
  transform: scale(1.02);
}

.thumbnail-inactive {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
}

.thumbnail-inactive:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.thumbnail-active .thumbnail-preview {
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.thumbnail-inactive:hover .thumbnail-preview {
  border-color: #94a3b8;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

.thumbnail-preview {
  width: 100px;
  height: 140px; /* A4 ratio แนวตั้ง (5:7) */
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.thumbnail-document-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.thumbnail-document-wrapper {
  transform-origin: center center;
  transform: scale(0.125);
  width: 794px; /* A4 width at 96dpi (210mm) */
  height: 1123px; /* A4 height at 96dpi (297mm) */
  background: white;
  position: relative;
}

.thumbnail-document {
  width: 100%;
  height: 100%;
  font-size: 10px;
  line-height: 1.2;
  padding: 6px;
  box-sizing: border-box;
  overflow: hidden;
}

.thumbnail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 40px;
  transition: all 0.2s ease;
}

.thumbnail-active .thumbnail-label {
  background: #dbeafe;
  color: #1e40af;
}

.thumbnail-inactive:hover .thumbnail-label {
  background: #e2e8f0;
  color: #475569;
}

/* Page Navigation */
.page-navigation {
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

/* Document Container - A4 Paper Preview Layout */
.document-container {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  overflow-y: auto; /* allow vertical scrolling to see page 2 */
  overflow-x: auto; /* allow horizontal scroll when needed */
  padding: 2rem;
  display: block;
  text-align: center; /* center align all content */
}

/* Document Wrapper - Pure Container Only */
/* No longer relying on display: contents; use explicit scale wrappers */

/* Document Isolation Container - Complete CSS Reset */
.document-isolation-container {
  /* Reset all inherited styles */
  all: initial;
  
  /* Only essential display properties */
  display: block;
  
  /* Isolation from parent styles */
  contain: layout style;
}

/* Watermark Container */
.document-watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Watermark Styling */
.document-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  font-size: 80px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.08);
  font-family: 'Arial', sans-serif;
  letter-spacing: 8px;
  user-select: none;
  pointer-events: none;
  z-index: 10;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Watermark for original document (ต้นฉบับ) - สีน้ำเงิน */
.document-watermark[data-type="original"] {
  color: rgba(37, 99, 235, 0.12) !important;
}

/* Watermark for copy document (สำเนา) - สีแดง */
.document-watermark[data-type="copy"] {
  color: rgba(239, 68, 68, 0.12) !important;
}

/* Document Page Number */
.document-page-number {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  font-family: 'Arial', sans-serif;
  user-select: none;
  pointer-events: none;
  z-index: 15;
  white-space: nowrap;
  text-align: center;
}

/* Page Type Styling */
.page-original {
  position: relative;
}

.page-copy {
  position: relative;
  opacity: 0.95; /* เล็กน้อยต่างจากต้นฉบับ */
}



/* Sidebar Copy Thumbnails */
.sidebar-divider {
  padding: 0.75rem 0.5rem 0.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.divider-text {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.thumbnail-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  font-size: 20px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.1);
  user-select: none;
  pointer-events: none;
  z-index: 5;
}

.copy-watermark {
  color: rgba(59, 130, 246, 0.2) !important;
}

/* Scale wrappers for fit-to-viewport preview */
.fit-viewport {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  margin: 0.75rem 0;
}

/* Document Sequence Layout */
.document-sequence {
  display: inline-block;
  text-align: left; /* reset text alignment for content */
  width: auto;
  max-width: 100%;
}

.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0.75rem 0;
}

.page-separator {
  margin: 0;
}

/* Page Divider */
.page-divider {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0.75rem 0;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #d1d5db, transparent);
}

.divider-label {
  padding: 0.5rem 1.5rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Two Pages Layout - Keep for backward compatibility but not used */
.two-pages-layout {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 100%;
  padding: 0.5rem 0;
}

.page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  max-width: 800px;
}

.page-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.page-label {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  min-width: 80px;
  letter-spacing: 0.025em;
}

.scale-viewport {
  /* Sized to scaled content so container never overflows */
  position: relative;
}

.scale-inner {
  /* Natural document size; scaled via transform */
  will-change: transform;
}





/* NO PAGE BREAK RULES - Document handles its own print styles */

/* State Container for Loading/Error/No Data */
.state-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Smooth entrance animation */
@keyframes documentFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Main Container Scrollbar - Clean and Smooth */
.document-container::-webkit-scrollbar {
  width: 14px;
}

.document-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 7px;
}

.document-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 7px;
  border: 2px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.document-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.document-container::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* Ensure document wrapper has no scrollbar */
.document-wrapper::-webkit-scrollbar {
  display: none;
}

.document-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Backdrop blur for better visual */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Enhanced button styles */
button:hover {
  transform: translateY(-1px);
  transition: transform 0.15s ease-in-out;
}

/* Focus styles for accessibility */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Copy Mode Checkbox Styling */
label.cursor-pointer:hover {
  background-color: #f8fafc;
}

label.cursor-pointer input:checked + i {
  color: #3b82f6;
}

/* Ensure modal is above everything */
.z-50 {
  z-index: 9999;
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Disabled responsive overrides - Let document handle its own size */

/* Print styles - Enhanced for document preservation */
@media print {
  /* Hide modal overlay and controls */
  .fixed.inset-0 {
    position: static !important;
    background: white !important;
    backdrop-filter: none !important;
  }
  
  /* Hide header and footer bars */
  .bg-white.border-b,
  .bg-white.border-t {
    display: none !important;
  }
  
  /* Make document content area full screen */
  .document-content-area {
    background: white !important;
    position: static !important;
    overflow: visible !important;
    flex: none !important;
    display: block !important;
  }
  
  .page-navigation {
    display: none !important;
  }
  
  .document-container {
    position: static !important;
    background: white !important;
    padding: 0 !important;
    overflow: visible !important;
    height: auto !important;
    width: 100% !important;
  }
  
  .document-sequence {
    gap: 0 !important;
  }
  
  .page-container {
    margin-bottom: 0 !important;
  }
  
  .fit-viewport {
    margin-bottom: 0 !important;
  }
  
  .scale-viewport,
  .scale-inner {
    width: auto !important;
    height: auto !important;
    transform: none !important;
  }
  
  /* Hide page dividers in print */
  .page-divider {
    display: none !important;
  }
  
  .page-separator {
    margin-top: 0 !important;
    page-break-before: always;
  }
  
  /* Ensure document isolation container prints correctly */
  .document-isolation-container {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    all: revert !important;
  }
  
  /* NO document component print rules - complete isolation */
}
</style>