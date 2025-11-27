<template>
  <FileBrowser 
    v-if="FileBrowserDocOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'document'"
    :allowFileType="['doc','docx','xls','xlsx','pdf']" 
    @file-browser-trigger="changeFileDocumentTrigger" 
    @file-browser-callback="selectFileDocumentTrigger"/>

  <!-- Notification System -->
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div v-for="notification in notifications" :key="notification.id" 
         class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
         :class="{
           'translate-x-0': notification.show,
           'translate-x-full': !notification.show
         }">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div v-if="notification.type === 'success'" class="w-6 h-6 text-green-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div v-else-if="notification.type === 'error'" class="w-6 h-6 text-red-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button @click="hideNotification(notification.id)" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
              <span class="sr-only">ปิด</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','file']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">เอกสารประกอบการเรียน</h2>
            <p class="text-xs text-gray-500">จัดการเอกสารและไฟล์ประกอบการเรียน ({{filteredDocuments.length}}/{{documentData.length}} ไฟล์)</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- View Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'"
              class="p-1.5 rounded text-xs font-medium transition-colors"
            >
              <font-awesome-icon :icon="['fas','th']" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'"
              class="p-1.5 rounded text-xs font-medium transition-colors"
            >
              <font-awesome-icon :icon="['fas','list']" />
            </button>
          </div>

          <!-- Add Document Button -->
          <button
            @click="OpenFileDocumentBrowser"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <font-awesome-icon :icon="['fas','plus']" class="text-white mr-1.5" /> เพิ่มเอกสาร
          </button>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-3">
      <div class="flex">
        <div class="flex-shrink-0">
          <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-400 text-sm" />
        </div>
        <div class="ml-2">
          <p class="text-xs text-blue-700">
            <strong>หมายเหตุ:</strong> รองรับไฟล์ประเภท PDF, Word (doc/docx) และ Excel (xls/xlsx) สำหรับเอกสารประกอบการเรียน
          </p>
        </div>
      </div>
    </div>

    <!-- Document Management -->
    <div class="p-4">
      <!-- Search and Filter Bar -->
      <div class="flex flex-col lg:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <font-awesome-icon :icon="['fas','search']" class="h-4 w-4 text-gray-400"/>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาเอกสาร..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button @click="searchQuery = ''" class="text-gray-400 hover:text-gray-600">
              <font-awesome-icon :icon="['fas','times']" class="h-4 w-4"/>
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-3">
          <!-- File Type Filter -->
          <select v-model="filterType" class="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-0">
            <option value="all">ทุกประเภท</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="docx">Word (docx)</option>
            <option value="xls">Excel</option>
            <option value="xlsx">Excel (xlsx)</option>
          </select>

          <!-- Sort -->
          <select v-model="sortBy" class="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-0">
            <option value="name">เรียงตามชื่อ</option>
            <option value="type">เรียงตามประเภท</option>
            <option value="date">เรียงตามวันที่</option>
          </select>

          <button @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'" 
                  class="p-2.5 text-gray-400 hover:text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <font-awesome-icon :icon="sortDirection === 'asc' ? ['fas','sort-up'] : ['fas','sort-down']"/>
          </button>

          <!-- Bulk Actions -->
          <div v-if="selectedDocuments.length > 0" class="flex items-center space-x-2 ml-2">
            <span class="text-sm text-gray-600 whitespace-nowrap">เลือกแล้ว {{selectedDocuments.length}} ไฟล์</span>
            <button 
              @click="bulkDownload"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors whitespace-nowrap">
              <font-awesome-icon :icon="['fas','download']" class="mr-1" /> ดาวน์โหลด
            </button>
            <button 
              @click="bulkDelete"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors whitespace-nowrap">
              <font-awesome-icon :icon="['fas','trash']" class="mr-1" /> ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div class="text-xs font-medium text-blue-600">ทั้งหมด</div>
          <div class="text-lg font-semibold text-blue-900">{{documentData.length}}</div>
        </div>
        <div class="bg-red-50 rounded-lg p-3 border border-red-100">
          <div class="text-xs font-medium text-red-600">PDF</div>
          <div class="text-lg font-semibold text-red-900">{{getFileTypeCount('pdf')}}</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div class="text-xs font-medium text-blue-600">Word</div>
          <div class="text-lg font-semibold text-blue-900">{{getFileTypeCount('doc') + getFileTypeCount('docx')}}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 border border-green-100">
          <div class="text-xs font-medium text-green-600">Excel</div>
          <div class="text-lg font-semibold text-green-900">{{getFileTypeCount('xls') + getFileTypeCount('xlsx')}}</div>
        </div>
      </div>

      <!-- Documents List/Grid -->
      <div class="space-y-4">
        <!-- Empty State -->
        <div v-if="filteredDocuments.length === 0 && documentData.length === 0" class="text-center py-8">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <font-awesome-icon :icon="['fas','file']" class="text-gray-400 text-lg"/>
          </div>
          <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีเอกสาร</h3>
          <p class="text-sm text-gray-500 mb-4">เริ่มต้นด้วยการเพิ่มเอกสารประกอบการเรียนครั้งแรก</p>
          <button
            @click="OpenFileDocumentBrowser"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <font-awesome-icon :icon="['fas','plus']" class="mr-1.5" /> เพิ่มเอกสารแรก
          </button>
        </div>

        <!-- No Search Results -->
        <div v-else-if="filteredDocuments.length === 0" class="text-center py-8">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <font-awesome-icon :icon="['fas','search']" class="text-gray-400 text-lg"/>
          </div>
          <h3 class="text-base font-medium text-gray-900 mb-2">ไม่พบเอกสารที่ค้นหา</h3>
          <p class="text-sm text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
        </div>

        <!-- Documents Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="(document, documentIndex) in filteredDocuments" 
            :key="document._id" 
            class="group relative bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            @click="previewDocument(document)"
          >
            <!-- Selection Checkbox -->
            <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                :checked="selectedDocuments.includes(document._id)"
                @change="toggleDocumentSelection(document._id)"
                @click.stop
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <!-- File Icon -->
            <div class="flex justify-center mb-3">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                   :class="getFileTypeColor(document.type)">
                <font-awesome-icon 
                  :icon="['fas', getFileIcon(document.type)]" 
                  class="text-xl"
                />
              </div>
            </div>

            <!-- File Info -->
            <div class="text-center">
              <h3 class="text-sm font-medium text-gray-900 truncate mb-1" :title="document.name">
                {{ document.name }}
              </h3>
              <p class="text-xs text-gray-500 uppercase">{{ document.type }}</p>
            </div>

            <!-- Actions -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button 
                @click.stop="downloadDocument(document)"
                type="button" 
                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="ดาวน์โหลด"
              >
                <font-awesome-icon :icon="['fas','download']" class="text-xs"/>
              </button>
              <button 
                @click.stop="deleteDocument(document._id, documentIndex)" 
                type="button" 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="ลบเอกสาร"
              >
                <font-awesome-icon :icon="['fas','trash']" class="text-xs"/>
              </button>
            </div>
          </div>
        </div>

        <!-- Documents List View -->
        <div v-else class="space-y-3">
          <div 
            v-for="(document, documentIndex) in filteredDocuments" 
            :key="document._id" 
            class="group flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
            @click="previewDocument(document)"
          >
            <!-- Selection Checkbox -->
            <div class="flex-shrink-0 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                :checked="selectedDocuments.includes(document._id)"
                @change="toggleDocumentSelection(document._id)"
                @click.stop
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <!-- File Icon -->
            <div class="flex-shrink-0 mr-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                   :class="getFileTypeColor(document.type)">
                <font-awesome-icon 
                  :icon="['fas', getFileIcon(document.type)]" 
                  class="text-base"
                />
              </div>
            </div>

            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="text-base font-semibold text-gray-900 truncate">
                  {{ document.name }}
                </h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 uppercase">
                  {{ document.type }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                เอกสารประกอบการเรียน • อัปเดตล่าสุด {{ formatDate(document.updatedAt) }}
              </p>
            </div>

            <!-- File Size (if available) -->
            <div v-if="document.size" class="flex-shrink-0 mr-4">
              <span class="text-xs text-gray-500">{{ formatFileSize(document.size) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-1">
              <button 
                @click.stop="previewDocument(document)"
                type="button" 
                class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                title="ดูตัวอย่าง"
              >
                <font-awesome-icon :icon="['fas','eye']" class="mr-1 text-xs"/>
                ดูตัวอย่าง
              </button>
              <button 
                @click.stop="downloadDocument(document)"
                type="button" 
                class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                title="ดาวน์โหลด"
              >
                <font-awesome-icon :icon="['fas','download']" class="mr-1 text-xs"/>
                ดาวน์โหลด
              </button>
              <button 
                @click.stop="deleteDocument(document._id, documentIndex)" 
                type="button" 
                class="inline-flex items-center px-2.5 py-1 border border-red-200 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                title="ลบเอกสาร"
              >
                <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs"/>
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import debug from '@/plugins/Logger.js';

export default {
  data() {
    return {
      configs: storageManager.get('configs'),
      FileBrowserDocOpen: false,
      
      // UI State
      viewMode: 'list', // 'list' or 'grid'
      searchQuery: '',
      filterType: 'all',
      sortBy: 'name',
      sortDirection: 'asc',
      selectedDocuments: [],
      
      // Notifications
      notifications: [],
      notificationId: 0,
    };
  },
  props: {
    documentData: {
      type: Array,
      required: true,
    },
    courseData: {
      type: Array,
      required: true,
    },
    tabs: Object,
    updateTabs: Object,
  },
  components: {
    FileBrowser,
  },
  computed: {
    filteredDocuments() {
      let filtered = this.documentData.filter(document => {
        // Search filter
        const matchesSearch = !this.searchQuery || 
          document.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Type filter
        const matchesType = this.filterType === 'all' || 
          document.type.toLowerCase() === this.filterType.toLowerCase();
        
        return matchesSearch && matchesType;
      });

      // Sort
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (this.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'type':
            aValue = a.type.toLowerCase();
            bValue = b.type.toLowerCase();
            break;
          case 'date':
            aValue = new Date(a.updatedAt || a.createdAt || 0);
            bValue = new Date(b.updatedAt || b.createdAt || 0);
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return filtered;
    }
  },
  methods: {
    getFileIcon(fileType) {
      const type = fileType.toLowerCase();
      switch (type) {
        case 'pdf':
          return 'file-pdf';
        case 'doc':
        case 'docx':
          return 'file-word';
        case 'xls':
        case 'xlsx':
          return 'file-excel';
        default:
          return 'file';
      }
    },

    getFileTypeColor(fileType) {
      const type = fileType.toLowerCase();
      switch (type) {
        case 'pdf':
          return 'bg-red-500';
        case 'doc':
        case 'docx':
          return 'bg-blue-500';
        case 'xls':
        case 'xlsx':
          return 'bg-green-500';
        default:
          return 'bg-gray-500';
      }
    },

    getFileTypeCount(type) {
      return this.documentData.filter(doc => 
        doc.type.toLowerCase() === type.toLowerCase()
      ).length;
    },

    formatDate(dateString) {
      if (!dateString) return 'ไม่ระบุ';
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH');
    },

    formatFileSize(bytes) {
      if (!bytes) return '';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    toggleDocumentSelection(documentId) {
      const index = this.selectedDocuments.indexOf(documentId);
      if (index > -1) {
        this.selectedDocuments.splice(index, 1);
      } else {
        this.selectedDocuments.push(documentId);
      }
    },

    previewDocument(document) {
      // Implement document preview functionality
      this.showNotification(`เปิดดูเอกสาร: ${document.name}`, 'success');
      // You can implement actual preview logic here
    },

    downloadDocument(document) {
      // Implement download functionality
      this.showNotification(`กำลังดาวน์โหลด: ${document.name}`, 'success');
      // You can implement actual download logic here
    },

    bulkDownload() {
      if (this.selectedDocuments.length === 0) return;
      this.showNotification(`กำลังดาวน์โหลด ${this.selectedDocuments.length} ไฟล์`, 'success');
      // Implement bulk download logic
      this.selectedDocuments = [];
    },

    bulkDelete() {
      if (this.selectedDocuments.length === 0) return;
      
      this.$swal({
        title: `ต้องการลบเอกสาร ${this.selectedDocuments.length} ไฟล์?`,
        text: "หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้อีก!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "ตกลง ลบเลย",
        cancelButtonText: "ยกเลิก",
      }).then(async (confirmed) => {
        if (confirmed.isConfirmed) {
          // Implement bulk delete logic
          for (const documentId of this.selectedDocuments) {
            const index = this.documentData.findIndex(doc => doc._id === documentId);
            if (index > -1) {
              await this.deleteDocument(documentId, index);
            }
          }
          this.selectedDocuments = [];
          this.showNotification(`ลบเอกสาร ${this.selectedDocuments.length} ไฟล์เรียบร้อยแล้ว`, 'success');
        }
      });
    },

    showNotification(message, type = 'success') {
      const notification = {
        id: ++this.notificationId,
        message,
        type,
        show: true
      };
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.hideNotification(notification.id);
      }, 3000);
    },

    hideNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },
    
    async callbackFunction() {
      try {
        console.log("callbackFunction");
      } catch (error) {
        console.error(error);
      }
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    updateBadge(badgeValue) {
      this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
    },
    
    OpenFileDocumentBrowser() {
      this.FileBrowserDocOpen = true;
    },
    
    changeFileDocumentTrigger(payload) {
      this.FileBrowserDocOpen = payload;
    },
    
    selectFileDocumentTrigger(payload) {
      debug.log("selectFileDocumentTrigger");
      if(payload != undefined) {
        this.FileBrowserDocOpen = false;
        this.addDocument(payload.file, payload.filename);
      }
    },
    
    async addDocument(file,fileName) {
      try {
        let filetype = file.replace("/", '').substring(file.replace("/", '').lastIndexOf(".")+1);
        let filename = fileName || file.substring(file.lastIndexOf('/'));

        debug.log("filename", filename)
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/document", {
          method: 'POST',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
              "courseId": this.courseData.master,
              "file": file,
              "name": filename.replace(/\//g, ""),
              "type": filetype,
            },
            options: {}
          })
        });
        
        if (response.ok) {
          const newDocument = await response.json();
          debug.log("Document added:", newDocument);
          this.$emit('add-document', newDocument);
          this.showNotification(`เพิ่มเอกสาร "${newDocument.name}" เรียบร้อยแล้ว`, 'success');
        } else {
          const errorText = await response.text();
          debug.error("Failed to add document:", response.status, errorText);
          this.showNotification('เกิดข้อผิดพลาดในการเพิ่มเอกสาร', 'error');
        }
      } catch (error) {
        debug.error("Error in addDocument:", error);
        this.showNotification('เกิดข้อผิดพลาดในการเพิ่มเอกสาร', 'error');
      }
    },
    
    async deleteDocument(id, index) {
      try {
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/document/" + id, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
        });

        if (response.ok) {
          debug.log("Document deleted:", id);
          this.$emit('delete-document', id, index);
          this.showNotification('ลบเอกสารเรียบร้อยแล้ว', 'success');
          if (response.status !== 204) {
            const finalRes = await response.json();
            debug.log("Delete response:", finalRes);
          }
        } else {
          const errorText = await response.text();
          debug.error("Failed to delete document:", response.status, errorText);
          this.showNotification('เกิดข้อผิดพลาดในการลบเอกสาร', 'error');
        }
      } catch (error) {
        debug.error("Error in deleteDocument:", error);
        this.showNotification('เกิดข้อผิดพลาดในการลบเอกสาร', 'error');
      }
    },
  },
};
</script>

<style scoped>
/* Modern Design Enhancements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Card Hover Effects */
.card-hover {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Button Enhancements */
.btn-modern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-modern:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.btn-modern:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary-modern {
  background-color: #4f46e5;
  color: white;
}

.btn-primary-modern:hover {
  background-color: #4338ca;
}

.btn-secondary-modern {
  background-color: #6b7280;
  color: white;
}

.btn-secondary-modern:hover {
  background-color: #4b5563;
}

.btn-success-modern {
  background-color: #059669;
  color: white;
}

.btn-success-modern:hover {
  background-color: #047857;
}

.btn-danger-modern {
  background-color: #dc2626;
  color: white;
}

.btn-danger-modern:hover {
  background-color: #b91c1c;
}

/* Document Card Animations */
.document-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Badge Styles */
.badge-modern {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary-modern {
  background-color: #e0e7ff;
  color: #3730a3;
}

.badge-success-modern {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-warning-modern {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-danger-modern {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-info-modern {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Loading States */
.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Gradient Backgrounds */
.gradient-bg {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s ease-out;
}

.animate-pulse-custom {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-stack {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mobile-full {
    width: 100%;
  }
  
  .mobile-text-sm {
    font-size: 0.875rem;
  }
  
  .mobile-p-3 {
    padding: 0.75rem;
  }
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

/* Text Utilities */
.prose {
  color: #374151;
  line-height: 1.625;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: #111827;
  font-weight: 600;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose a {
  color: #4f46e5;
  text-decoration: underline;
}

.prose a:hover {
  color: #3730a3;
}

/* Document specific styles */
.document-icon {
  width: 3rem;
  height: 3rem;
  background-color: #e0e7ff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-icon svg {
  color: #4f46e5;
  font-size: 1.125rem;
}

/* Enhanced Document Stats */
.document-stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.document-stat-badge.has-file {
  background-color: #d1fae5;
  color: #065f46;
}

.document-stat-badge.no-file {
  background-color: #f3f4f6;
  color: #4b5563;
}

.document-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.document-badge.pdf {
  background-color: #fee2e2;
  color: #991b1b;
}

.document-badge.word {
  background-color: #dbeafe;
  color: #1e40af;
}

.document-badge.excel {
  background-color: #d1fae5;
  color: #065f46;
}

.document-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.document-stat-item {
  display: flex;
  align-items: center;
}

.document-stat-item svg {
  margin-right: 0.25rem;
}

.document-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.document-action-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-action-button.view {
  color: #2563eb;
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.document-action-button.download {
  color: #4f46e5;
  background-color: #eef2ff;
  border-color: #c7d2fe;
}

.document-action-button.normal {
  color: #4b5563;
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.document-action-button.normal:hover {
  background-color: #f3f4f6;
}

.document-action-button.edit {
  color: #4b5563;
  background-color: white;
  border-color: #e5e7eb;
}

.document-action-button.edit:hover {
  background-color: #f9fafb;
}

.document-action-button.delete {
  color: #dc2626;
  background-color: #fef2f2;
  border-color: #fecaca;
}

.document-action-button.delete:hover {
  background-color: #fee2e2;
}

/* Empty state styles */
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-state-icon svg {
  color: #9ca3af;
  font-size: 1.5rem;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Info banner styles */
.info-banner {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
}

.info-banner-content {
  display: flex;
}

.info-banner-icon {
  flex-shrink: 0;
}

.info-banner-icon svg {
  color: #3b82f6;
}

.info-banner-text {
  margin-left: 0.75rem;
}

.info-banner-text p {
  font-size: 0.875rem;
  color: #1e40af;
}

/* View Toggle Styles */
.view-toggle {
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.view-toggle-button {
  padding: 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-toggle-button.active {
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  color: #111827;
}

.view-toggle-button.inactive {
  color: #6b7280;
}

/* Search and Filter Styles */
.search-input {
  display: block;
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 0.75rem;
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  border-color: #4f46e5;
}

.filter-select {
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  min-width: 0;
}

.filter-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.sort-button {
  padding: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sort-button:hover {
  color: #4b5563;
  background-color: #f9fafb;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.bulk-action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.bulk-action-button.download {
  color: #4f46e5;
  background-color: #eef2ff;
}

.bulk-action-button.download:hover {
  background-color: #e0e7ff;
}

.bulk-action-button.delete {
  color: #dc2626;
  background-color: #fef2f2;
}

.bulk-action-button.delete:hover {
  background-color: #fee2e2;
}

/* Grid Layout */
.document-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .document-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .document-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .document-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.document-grid-item {
  position: relative;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-grid-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.document-grid-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.document-grid-info {
  text-align: center;
}

.document-grid-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  display: flex;
  gap: 0.25rem;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-grid-item:hover .document-grid-actions {
  opacity: 1;
}

/* List Layout */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-list-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-list-item:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.document-list-checkbox {
  flex-shrink: 0;
  margin-right: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-list-item:hover .document-list-checkbox {
  opacity: 1;
}

.document-list-icon {
  flex-shrink: 0;
  margin-right: 1rem;
}

.document-list-info {
  flex: 1;
  min-width: 0;
}

.document-list-size {
  flex-shrink: 0;
  margin-right: 1rem;
}

.document-list-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* File Type Colors */
.file-type-pdf {
  background-color: #ef4444;
}

.file-type-word {
  background-color: #3b82f6;
}

.file-type-excel {
  background-color: #10b981;
}

.file-type-default {
  background-color: #6b7280;
}

/* Selection Styles */
.selection-checkbox {
  height: 1rem;
  width: 1rem;
  color: #4f46e5;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

.selection-checkbox:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.selected-item {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

/* Notification Styles */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

/* File Size Display */
.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Date Display */
.date-display {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Loading States */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
  