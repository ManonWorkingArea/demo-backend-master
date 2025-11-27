<script lang="js">
// Vue Components & Libraries
import CreateFolder from '@/interface/modal/CreateFolder.vue';
import RenameFolder from '@/interface/modal/RenameFolder.vue';
import VideoTrimmer from '@/components/VideoTrimmer.vue';
import VideoSubtitle from '@/components/VideoSubtitle.vue';
import ScreenRecorder from '@/components/ScreenRecorder.vue';
import { useRoute } from 'vue-router';
import { VideoPlayer } from 'vue-hls-video-player';

// AWS SDK
import { S3 } from "@aws-sdk/client-s3";

// Internal Modules
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
import initMainController from './filemanager/module/mainController.js';

export default {
  emits: ["select-file-trigger", "close"],
  props: { 
    Mode: String, 
    AllowFile: Array, 
    CallbackFunc: String, 
    Client: String, 
    Space: Array,
    ShareId: String, // เพิ่ม prop สำหรับ folder ID ที่จะใช้เป็น root ใน share mode
    ShareKey: String // เพิ่ม prop สำหรับ shareKey เพื่อความปลอดภัย
  },
  
  data() {
    const session = storageManager.get('session');
    const configs = storageManager.get('configs') || {};
    const route = useRoute();
    
    // ตรวจสอบว่าอยู่ในโหมด share หรือไม่
    const isShareMode = this.Mode === 'share';
    
    // ใช้ configs สำหรับ S3 configuration ทั้ง normal mode และ share mode
    let s3Client = null;
    if (configs.s3EndpointDefault && configs.s3Key && configs.s3Secret) {
      s3Client = new S3({
        forcePathStyle: false,
        endpoint: configs.s3EndpointDefault,
        region: configs.s3Region,
        ResponseContentEncoding: "utf-8",
        credentials: {
          accessKeyId: configs.s3Key,
          secretAccessKey: configs.s3Secret
        }
      });
    }

    return {
      // Upload & Transfer
      uploadControllers: new Map(), // เก็บ controller สำหรับแต่ละไฟล์
      files: [],
      fileList: [],
      
      // UI State
      showStreamMenu: false,
      showActionsDropdown: false, // สำหรับ Actions dropdown menu
      layout: 'grid',
      searchQuery: '',
      showModal: false,
      activeBlock: false,
      showFileDetail: false,
      showFilePreview: false,
      uploadPanel: false,
      
      // Core Data
      hostkey: null,
      folderPath: "",
      prefix: "",
      objCount: "",
      S3: s3Client,
      PageName: route?.meta?.title || 'FileManager',
      PageIcon: route?.meta?.icon || 'folder',
      session: session || {},
      configs: {
        ...configs, // รวม configs ทั้งหมด
        host: isShareMode ? (window.location.origin || 'http://localhost:8080') : (configs.hostname ? `https://${configs.hostname}` : ''),
        key: isShareMode ? 'public' : (configs.key || '')
      },
      
      // Modal States
      createFolderModal: false,
      createFolderAndMoveMode: false, // โหมดสร้างโฟลเดอร์และย้ายไฟล์
      RenameFolderModal: false,
      
      // File Operations
      renameTriggerObj: "",
      renameTriggerId: "",
      oldname: "",
      modalContent: "",
      selectFile: undefined,
      
      // File Details
      viewFilename: "",
      viewFilesize: "",
      viewFilecover: "",
      viewFilecreate: "",
      viewFileurl: "",
      viewFileDuration: '',
      viewFileThumbnail: '',
      
      // Pagination
      limitOptions: [1, 10, 50, 100, 200, 500, 1000, 2000, 3000, 4000],
      totalPages: 0,
      totalItems: 0,
      limitItem: 50,
      currentPage: 1,
      
      // Drag & Drop
      dragging: false,
      draggedItem: "",
      dropTarget: "",
      selectItem: '',
      selectItemData: '',
      hasSelected: false,

      // Multiple selection state
      selectedFiles: new Set(), // เก็บ IDs ของไฟล์ที่เลือก
      isMultiSelectMode: false, // โหมดการเลือกหลายไฟล์
      lastSelectedIndex: -1, // สำหรับ shift+click selection
      
      // Batch operation state
      batchOperationInProgress: false,
      batchTotal: 0,
      batchOperation: '', // 'delete', 'move', etc.
      batchProgress: 0,
      totalBatchFiles: 0,
      processedFiles: 0,
      isBatchResizing: false,

      // File Listing & Storage
      fileListing: [],
      summaryFileSize: 0,
      space: 5000,

      // Utilities
      capturedThumbnail: null,
      debounceTimer: null,
      debouncedList: null,
      error: false,
      errorText: '',

      // Image Resize Options
      isResizeModalOpen: false,
      selectedFileType: 'image/webp', // Default file type
      selectedImageQuality: 0.8, // Default quality
      selectedResizeItem: '',
      selectedResizeId: '',
      replaceExistingFile: false,
      isModalVisible: false,
      fileName: '',
      fileUrl: '',

      // UI Layout
      fileTypeFilter: 'all',
      showMobileSidebar: false,

      // Drag & Drop Upload
      showDropOverlay: false,
      dragCounter: 0,
      showMiniUploader: false,
      isMiniCollapsed: false,

      // Share mode properties
      isShareMode: false, // ตรวจสอบว่าอยู่ใน share mode หรือไม่
      shareRootPath: '', // root path สำหรับ share mode
      shareRootId: '', // root folder ID สำหรับ share mode
      shareRootOwner: '', // owner ของ root folder สำหรับ share mode
      shareRootPermission: 'read', // สิทธิ์ของ share root สำหรับ share mode
      originalPrefix: '', // เก็บ prefix เดิมไว้

      // Share modal properties
      shareModal: false, // แสดง share modal
      shareSelectedFolder: null, // โฟลเดอร์ที่เลือกแชร์
      shareSelectedFolderId: '', // ID ของโฟลเดอร์ที่เลือกแชร์
      shareEnabled: false, // สถานะการแชร์ของโฟลเดอร์
      shareUrl: '', // URL สำหรับแชร์
      sharePassword: '', // รหัสผ่านสำหรับการแชร์
      sharePasswordVisible: false, // แสดงรหัสผ่านหรือไม่
      shareExpiryDate: '', // วันหมดอายุของการแชร์
      shareExpiryDays: '', // จำนวนวันหมดอายุ
      shareHasPassword: false, // มีการตั้งรหัสผ่านหรือไม่
      shareHasExpiry: false, // มีการตั้งวันหมดอายุหรือไม่
      sharePermission: 'read', // สิทธิ์การเข้าถึง: 'read' หรือ 'write'
      passwordSaveTimeout: null, // timeout สำหรับ debounce การบันทึกรหัสผ่าน
      shareUrlCopied: false, // สถานะการคัดลอก URL
      
      // Loading states
      isRefreshLoading: false, // สถานะ loading สำหรับปุ่ม refresh
      
      // Search state for popup mode
      showSearchInPopup: false, // สถานะการแสดงช่องค้นหาใน popup mode
      
      // Video transcode preview settings
      selectedTranscodeQuality: 'original', // ค่าเริ่มต้นเป็น original
      transcodeDropdownOpen: false,
      transcodeFileSizes: {}, // เก็บขนาดไฟล์ของแต่ละ quality
      
      // File preprocessing state
      preprocessingFiles: false, // สถานะการ preprocess ไฟล์
      
      // Mobile UI states
      showMobileActionsMenu: false, // สำหรับ dropdown menu ใน mobile
      
      // Transcode panel settings
      showTranscodePanel: false,
      transcodeSelectedFile: null,
      transcodeSelectedQuality: '720p',
      transcodeAvailableQualities: ['240p', '360p', '480p', '720p', '1080p'],
      
      // Video conversion options
      showVideoConvertOptions: false,
      replaceExistingTranscode: false,
      
      // Video resolution selection for popup mode
      showResolutionSelector: false,
      selectedFile: null,
      selectedFileResolutions: {},
      
      // Video Trimmer
      showVideoTrimmer: false,
      videoTrimmerFile: null,
      videoTrimmerUrl: '',
      
      // Video Subtitle
      showVideoSubtitle: false,
      videoSubtitleFile: null,
      videoSubtitleUrl: '',
      
      // Screen Recorder
      showScreenRecorder: false,
      
      // TaskManager
      conversionTasks: [], // รายการ conversion tasks
      taskPanelExpanded: true, // เปิด panel ตลอดเวลา (เปลี่ยนจาก false เป็น true)
      taskRefreshInterval: null // interval สำหรับ refresh tasks
    };
  },

  components: {
    CreateFolder,
    RenameFolder,
    VideoPlayer,
    VideoTrimmer,
    VideoSubtitle,
    ScreenRecorder
  },
  methods: {
    // Helper function: Clear selection
    clearSelection() {
      this.selectedFiles.clear();
      this.batchOperationInProgress = false;
      this.batchOperation = '';
      this.batchTotal = 0;
      this.batchProgress = 0;
      this.createFolderAndMoveMode = false;
    },

    // Execute context menu actions
    executeAction(action) {
      console.log('🎯 Executing action:', action);
      
      switch (action) {
        case 'createFolder':
          this.createFolderModal = true;
          break;
        case 'upload':
          this.uploadPanel = true;
          break;
        case 'streaming':
          // Handle streaming action
          break;
        case 'videoTrim':
          this.openVideoTrimmerForSelected();
          break;
        case 'videoSubtitle':
          this.openVideoSubtitleForSelected();
          break;
        case 'makeStreaming':
          this.makeStreamingForSelected();
          break;
        default:
          console.warn('Unknown action:', action);
      }
      
      // Close any open menus/dropdowns
      this.showActionsDropdown = false;
    },

    // File preprocessing method
    async preprocessFiles() {
      debug.log('🎨 Starting file preprocessing...');
      
      if (!this.files.length) {
        this.$toast({ type: 'warning', message: 'ไม่มีไฟล์ที่จะ preprocess' });
        return;
      }
      
      this.preprocessingFiles = true;
      
      try {
        // เรียก function จาก client image processor
        if (typeof this.processSelectedFiles === 'function') {
          await this.processSelectedFiles();
          this.$toast({ 
            type: 'success', 
            message: `เตรียมไฟล์เสร็จแล้ว! พร้อมอัพโหลด ${this.files.length} ไฟล์` 
          });
        } else {
          throw new Error('Client image processor not loaded');
        }
      } catch (error) {
        debug.log('❌ Error in preprocessing:', error);
        this.$toast({ 
          type: 'error', 
          message: 'เกิดข้อผิดพลาดในการเตรียมไฟล์' 
        });
      } finally {
        this.preprocessingFiles = false;
      }
    },

    // TaskManager Methods
    toggleTaskPanel() {
      this.taskPanelExpanded = !this.taskPanelExpanded;
    },

    getTaskStatusText(status) {
      const statusMap = {
        'processing': 'กำลังดำเนินการ',
        'completed': 'เสร็จสิ้น',
        'failed': 'ล้มเหลว'
      };
      return statusMap[status] || status;
    },

    async loadConversionTasks() {
      try {
        console.log('🔄 Loading conversion tasks...');
        console.log('📋 getConversionTasks function available:', typeof this.getConversionTasks);
        
        const prevTaskCount = this.conversionTasks.length;
        
        if (typeof this.getConversionTasks === 'function') {
          this.conversionTasks = await this.getConversionTasks();
          console.log('✅ Conversion tasks loaded:', this.conversionTasks.length, 'tasks');
          
          // Debug: ดูโครงสร้างของ task object
          if (this.conversionTasks.length > 0) {
            console.log('🔍 [Debug] First task structure:', this.conversionTasks[0]);
            console.log('🔍 [Debug] Task fields:', Object.keys(this.conversionTasks[0]));
          }
          
          // ถ้ามี task ใหม่เพิ่มขึ้น ให้แสดง panel
          if (this.conversionTasks.length > prevTaskCount) {
            this.taskPanelExpanded = true;
            console.log('🔍 New tasks detected - showing panel');
          }
        } else {
          console.warn('⚠️  getConversionTasks function not available');
          this.conversionTasks = [];
        }
      } catch (error) {
        console.error('❌ Failed to load conversion tasks:', error);
        this.conversionTasks = [];
      }
    },

    async refreshTasks() {
      try {
        console.log('🔄 Manual refresh tasks...');
        await this.loadConversionTasks();
        // หลังจาก refresh แล้วให้ปรับ refresh interval ตามสถานะ task
        this.$nextTick(() => {
          this.smartTaskRefresh();
        });
      } catch (error) {
        console.error('❌ Failed to refresh tasks:', error);
      }
    },

    openFullTaskManager() {
      // เปิด TaskManager component เต็มจอ
      // สามารถ implement เพิ่มเติมได้ตามต้องการ
      console.log('🚀 Opening full TaskManager...');
    },

    startTaskRefresh() {
      // เริ่ม smart refresh - refresh ทุก 10 วินาทีเมื่อมี task ที่ยังไม่เสร็จ
      this.smartTaskRefresh();
    },

    smartTaskRefresh() {
      // Clear interval เดิมก่อน
      this.stopTaskRefresh();
      
      // ตรวจสอบว่ามี task ที่ยังไม่เสร็จหรือไม่
      const hasIncompleteTasks = this.tasksWithProgress.some(task => 
        task.status === 'processing' || task.status === 'pending'
      );
      
      if (hasIncompleteTasks) {
        console.log('🔄 Starting fast refresh (10s) - มี task ที่ยังไม่เสร็จ');
        this.taskRefreshInterval = setInterval(() => {
          this.refreshTasks();
          // หลัง refresh แล้วตรวจสอบใหม่
          setTimeout(() => this.smartTaskRefresh(), 1000);
        }, 10000); // 10 วินาที
      } else if (this.tasksWithProgress.length > 0) {
        // ถ้าทุก task เสร็จแล้ว ให้ซ่อน panel และหยุด refresh
        console.log('✅ All tasks completed - hiding panel and stopping refresh');
        this.taskPanelExpanded = false;
        this.stopTaskRefresh();
      } else {
        // ไม่มี task เลย ใช้ slow refresh
        console.log('⏰ Starting slow refresh (30s) - ไม่มี task');
        this.taskRefreshInterval = setInterval(() => {
          this.refreshTasks();
        }, 30000); // 30 วินาที
      }
    },

    stopTaskRefresh() {
      if (this.taskRefreshInterval) {
        clearInterval(this.taskRefreshInterval);
        this.taskRefreshInterval = null;
      }
    },

      // Format file size helper
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const size = (bytes / Math.pow(1024, i)).toFixed(1);
      
      return `${size} ${sizes[i]}`;
    },

    // Check if file is HLS/m3u8 for proper player selection
    isSelectedFileHLS(fileUrl) {
      if (!fileUrl) return false;
      
      const isHLS = fileUrl.toLowerCase().includes('.m3u8') || 
                    fileUrl.toLowerCase().includes('m3u8') ||
                    fileUrl.toLowerCase().includes('application/x-mpegurl') ||
                    fileUrl.toLowerCase().includes('manifest/video.m3u8'); // Ready Stream HLS
      
      console.log('🎬 HLS check:', { fileUrl, isHLS });
      return isHLS;
    },

    // Check if file is Ready Stream
    isReadyStream(fileUrl) {
      if (!fileUrl) return false;
      
      const isReady = fileUrl.includes('mediadelivery.net') ||
                          fileUrl.includes('cloudflarestream.com') ||
                          fileUrl.includes('videodelivery.net');
      
      console.log('☁️ Ready check:', { fileUrl, isReady });
      return isReady;
    },

    // Extract Ready Stream video ID from URL
    extractReadyVideoID(url) {
      if (!url) return null;
      
      const match = url.match(/\/([a-f0-9-]+)\//);
      return match ? match[1] : null;
    },

    // Get Ready Stream iframe URL
    getReadyIframeSrc(videoUrl) {
      if (!videoUrl) return '';
      
      const videoID = this.extractReadyVideoID(videoUrl);
      if (videoID) {
        return `https://iframe.mediadelivery.net/embed/37374/${videoID}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
      }
      return '';
    },

    // Clear completed tasks only
    async clearAllConversionTasks() {
      try {
        console.log('🧹 Clearing completed tasks...');
        console.log('📊 All tasks:', this.tasksWithProgress);
        
        // Filter only completed tasks
        const completedTasks = this.tasksWithProgress.filter(task => {
          const isCompleted = task.status === 'completed';
          const progress = Math.round(task.progress || 0);
          console.log(`Task ${task._id}: status=${task.status}, progress=${progress}%, isCompleted=${isCompleted}`);
          return isCompleted;
        });
        
        console.log('✅ Completed tasks found:', completedTasks.length);
        console.log('📋 Completed task details:', completedTasks);
        
        if (completedTasks.length === 0) {
          this.$toast({
            type: 'info',
            message: 'ไม่มีงานที่เสร็จแล้วให้ล้าง'
          });
          return;
        }
        
        if (typeof this.clearAllTasks === 'function') {
          console.log('🔄 Calling clearAllTasks with IDs:', completedTasks.map(task => task._id));
          
          // Pass only completed task IDs
          const result = await this.clearAllTasks(completedTasks.map(task => task._id));
          console.log('✅ Clear completed tasks result:', result);
          
          // Refresh task list
          console.log('🔄 Refreshing task list...');
          await this.loadConversionTasks();
          console.log('✅ Task list refreshed');
          
          // Toast notification with details
          if (result.updated > 0) {
            this.$toast({
              type: 'success',
              message: `ล้างงานที่เสร็จแล้วเสร็จสิ้น: ลบ ${result.updated} งาน${result.errors > 0 ? `, ผิดพลาด ${result.errors} งาน` : ''}`
            });
          } else if (result.errors > 0) {
            this.$toast({
              type: 'error',
              message: `ไม่สามารถลบงานได้: ผิดพลาด ${result.errors} งาน จาก ${completedTasks.length} งาน\nกรุณาตรวจสอบ console เพื่อดูรายละเอียด`
            });
          } else {
            this.$toast({
              type: 'info',
              message: `พบ ${completedTasks.length} งานที่เสร็จแล้ว แต่ไม่สามารถลบได้\nกรุณาตรวจสอบ console เพื่อดูรายละเอียด`
            });
          }
        } else {
          console.warn('⚠️ clearAllTasks function not available');
          this.$toast({
            type: 'warning',
            message: 'ฟังก์ชันล้างงานไม่พร้อมใช้งาน'
          });
        }
      } catch (error) {
        console.error('❌ Failed to clear all tasks:', error);
        this.$toast({
          type: 'error', 
          message: 'เกิดข้อผิดพลาดในการล้างงาน'
        });
      }
    },

    // Clear single completed task
    async clearSingleTask(taskId) {
      try {
        console.log('🧹 Clearing single task:', taskId);
        
        if (typeof this.clearAllTasks === 'function') {
          // ใช้ clearAllTasks แต่ส่ง taskId เดียว
          const result = await this.clearAllTasks([taskId]);
          console.log('✅ Clear single task result:', result);
          
          // Refresh task list
          await this.loadConversionTasks();
          
          // Toast notification
          if (result.updated > 0) {
            this.$toast({
              type: 'success',
              message: 'ลบงานเสร็จสิ้น'
            });
          } else {
            this.$toast({
              type: 'info',
              message: 'ไม่สามารถลบงานนี้ได้'
            });
          }
        } else {
          console.warn('⚠️ clearAllTasks function not available');
          this.$toast({
            type: 'warning',
            message: 'ฟังก์ชันลบงานไม่พร้อมใช้งาน'
          });
        }
      } catch (error) {
        console.error('❌ Failed to clear single task:', error);
        this.$toast({
          type: 'error', 
          message: 'เกิดข้อผิดพลาดในการลบงาน'
        });
      }
    }
  },
  
  computed: {
    // ตรวจสอบว่าเป็นโหมด read-only หรือไม่
    isReadOnlyMode() {
      try {
        const result = Boolean(this.isShareMode && this.shareRootPermission === 'read');
        return result;
      } catch (error) {
        console.error('Error in isReadOnlyMode computed:', error);
        return false;
      }
    },
    
    // Filtered folder path สำหรับ Share Mode
    filteredFolderPath() {
      if (!this.isShareMode || !this.shareRootPath) {
        return this.folderPath;
      }
      
      // ใน share mode ใช้ ShareId เป็น root ดังนั้นให้ return folderPath ปกติ
      // เพราะระบบจะใช้ ShareId เป็นจุดเริ่มต้นแล้ว
      return this.folderPath;
    },
    
    // Filter และ search
    filteredFileList() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return this.fileListing;
      }
      return this.fileListing.filter((file) => file.name.toLowerCase().includes(query));
    },

    // Tasks with computed progress from fileInfo.transcode
    tasksWithProgress() {
      return this.conversionTasks.map(task => {
        const computedTask = { ...task };
        
        if (task.fileInfo && task.fileInfo.transcode && task.metadata?.quality) {
          const quality = task.metadata.quality;
          
          // ตรวจสอบ task type จากหลายแหล่ง
          let taskType = task.type || task.metadata?.type || task.metadata?.task;
          
          // ถ้ายังไม่มี type ให้ลองเดาจาก progress keys ที่มีอยู่
          if (!taskType && task.fileInfo.transcode) {
            const transcodeKeys = Object.keys(task.fileInfo.transcode);
            const hasTrimKey = transcodeKeys.some(key => key.startsWith('trim_'));
            const hasConversionKey = transcodeKeys.some(key => !key.startsWith('trim_') && ['420p', '720p', '1080p', '1920p'].includes(key));
            
            if (hasTrimKey) {
              taskType = 'trim';
            } else if (hasConversionKey) {
              taskType = 'conversion';
            }
          }
          
          // สร้าง key ตามประเภท task
          let transcodeKey;
          if (taskType === 'trim') {
            transcodeKey = `trim_${quality}`;
          } else {
            transcodeKey = quality; // สำหรับ conversion หรือ default
          }
          
          const transcodeValue = task.fileInfo.transcode[transcodeKey];
          
          console.log(`🔍 [FileManager] Task ${task._id}: detectedType=${taskType}, quality=${quality}, key=${transcodeKey}, value=${transcodeValue}`);
          
          if (transcodeValue !== undefined) {
            if (typeof transcodeValue === 'number') {
              // ตัวเลข = กำลังแปลง (progress %)
              computedTask.progress = transcodeValue;
              computedTask.status = 'processing';
            } else if (typeof transcodeValue === 'string' && transcodeValue.startsWith('http')) {
              // URL = แปลงเสร็จแล้ว
              computedTask.progress = 100;
              computedTask.status = 'completed';
              computedTask.outputUrl = transcodeValue;
            }
          }
        }
        
        return computedTask;
      });
    },

    // ตรวจสอบว่ามี task ที่ยังไม่เสร็จหรือไม่
    hasIncompleteTasks() {
      return this.tasksWithProgress.some(task => 
        task.status === 'processing' || task.status === 'pending'
      );
    },

    // ตรวจสอบว่าทุก task เสร็จแล้วหรือไม่
    allTasksCompleted() {
      return this.tasksWithProgress.length > 0 && 
             this.tasksWithProgress.every(task => task.status === 'completed');
    },

    // นับจำนวน task ที่เสร็จแล้ว
    completedTasksCount() {
      return this.tasksWithProgress.filter(task => task.status === 'completed').length;
    },

    // Computed properties สำหรับ UI
    computedDimensions() {
      return this.viewFileDimensions;
    },

    dragItemClass() {
      return this.dragging ? 'dragging' : '';
    },

    filteredQualities() {
      return ['420p', '720p', '1080p', '1920p']; // คืนค่ารายการคุณภาพทั้งหมด
    },

    displayedFiles() {
      let files = this.filteredFileList;
      
      if (this.fileTypeFilter !== 'all') {
        if (this.fileTypeFilter === 'folder') {
          files = files.filter(f => f.mimetype === 'folder');
        } else {
          files = files.filter(f => f.type === this.fileTypeFilter);
        }
      }
      
      return files;
    },
    
    // Upload และ file operations
    uploadingFilesCount() {
      return this.files.filter(f => f.status === 'pending' || f.status === 'uploading').length;
    },
    
    dropFileCount() {
      // For overlay display when dragging
      if (this.showDropOverlay && window.dragEvent && window.dragEvent.dataTransfer) {
        const items = window.dragEvent.dataTransfer.items;
        const files = window.dragEvent.dataTransfer.files;
        return items ? items.length : (files ? files.length : 0);
      }
      return 0;
    },

    // ตรวจสอบว่าสามารถเลือกไฟล์เดียวได้หรือไม่ (สำหรับ popup mode)
    canSelectSingleFile() {
      // ต้องเลือกไฟล์เดียวเท่านั้น
      if (this.selectedFiles.size !== 1) {
        return false;
      }

      // หาไฟล์ที่เลือก
      const selectedFileId = Array.from(this.selectedFiles)[0];
      const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
      
      if (!selectedFile) {
        return false;
      }

      // ตรวจสอบว่าไฟล์ที่เลือกอนุญาตให้ใช้งานหรือไม่
      return this.isAllowedFile(selectedFile.name);
    },

    // ตรวจสอบว่าไฟล์ที่เลือกเป็นวิดีโอที่มี transcode หรือไม่
    hasSelectedVideoWithTranscode() {
      const result = (() => {
        console.log('🔍 hasSelectedVideoWithTranscode check');
        console.log('📊 selectedFiles.size:', this.selectedFiles.size);
        
        if (this.selectedFiles.size !== 1) {
          console.log('❌ Not exactly 1 file selected');
          return false;
        }

        const selectedFileId = Array.from(this.selectedFiles)[0];
        console.log('🆔 Selected file ID:', selectedFileId);
        
        const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
        console.log('📁 Found file:', selectedFile);
        
        if (!selectedFile) {
          console.log('❌ Selected file not found in fileListing');
          return false;
        }

        const hasTranscode = this.hasVideoTranscode(selectedFile);
        console.log('🎬 hasVideoTranscode result:', hasTranscode);
        
        return hasTranscode;
      })();
      
      console.log('🔍 hasSelectedVideoWithTranscode final result:', result);
      return result;
    },

    // TaskManager computed properties
    processingTasks() {
      return this.conversionTasks.filter(task => task.status === 'processing');
    },

    completedTasks() {
      return this.conversionTasks.filter(task => task.status === 'completed');
    },

    failedTasks() {
      return this.conversionTasks.filter(task => task.status === 'failed');
    }
  },
  watch: {
    // เฝ้าติดตาม ShareId เมื่อมีการเปลี่ยนแปลง
    ShareId: {
      handler(newShareId, oldShareId) {
        if (newShareId !== oldShareId) {
          this.initializeShareMode();
        }
      },
      immediate: false
    },
    
    // เฝ้าติดตาม Mode เมื่อมีการเปลี่ยนแปลง
    Mode: {
      handler(newMode, oldMode) {
        if (newMode !== oldMode) {
          if (newMode === 'share') {
            this.initializeShareMode();
          } else {
            // ออกจาก share mode
            this.isShareMode = false;
            this.shareRootId = null;
            this.shareRootPath = null;
            
            // คืนค่า prefix เดิม (เฉพาะเมื่อมี session)
            if (this.originalPrefix) {
              try {
                const currentSession = storageManager.get('session');
                if (currentSession) {
                  const session = {
                    ...currentSession,
                    prefix: this.originalPrefix
                  };
                  storageManager.update('session', session);
                }
              } catch (error) {
                console.log('Error restoring original prefix:', error);
              }
            }
          }
        }
      },
      immediate: false
    },

    // เฝ้าติดตามการเปลี่ยนแปลงการตั้งค่าการแชร์
    shareHasPassword: {
      handler() {
        if (this.shareEnabled && this.shareSelectedFolderId) {
          // Auto-save เมื่อมีการเปลี่ยนแปลง
          this.$nextTick(() => {
            this.saveShareSettings();
          });
        }
      }
    },
    
    sharePassword: {
      handler() {
        if (this.shareEnabled && this.shareSelectedFolderId && this.shareHasPassword) {
          // Debounce auto-save รหัสผ่าน
          clearTimeout(this.passwordSaveTimeout);
          this.passwordSaveTimeout = setTimeout(() => {
            this.saveShareSettings();
          }, 1000); // รอ 1 วินาทีหลังจากหยุดพิมพ์
        }
      }
    },
    
    shareHasExpiry: {
      handler() {
        if (this.shareEnabled && this.shareSelectedFolderId) {
          // Auto-save เมื่อมีการเปลี่ยนแปลง
          this.$nextTick(() => {
            this.saveShareSettings();
          });
        }
      }
    },
    
    shareExpiryDate: {
      handler() {
        if (this.shareEnabled && this.shareSelectedFolderId && this.shareHasExpiry) {
          // Auto-save วันหมดอายุ
          this.$nextTick(() => {
            this.saveShareSettings();
          });
        }
      }
    },
    
    sharePermission: {
      handler() {
        if (this.shareEnabled && this.shareSelectedFolderId) {
          // Auto-save สิทธิ์การเข้าถึง
          this.$nextTick(() => {
            this.saveShareSettings();
          });
        }
      }
    },

    // เฝ้าติดตาม selectItemData เมื่อมีการเปิดไฟล์วิดีโอที่มี transcode
    selectItemData: {
      handler(newData, oldData) {
        if (newData && newData.transcode && newData !== oldData) {
          // โหลดข้อมูลขนาดไฟล์ของ transcode
          this.loadTranscodeFileSizes(newData);
        }
      },
      immediate: false
    }
  },

  created() {
    console.log('🎯 FileManager created - initializing controller...');
    
    // Initialize main controller first
    initMainController(this);
    
    console.log('✅ Main controller initialized');
    console.log('🔍 Media functions attached:');
    console.log('  - getConversionTasks:', typeof this.getConversionTasks);
    console.log('  - createConversionTask:', typeof this.createConversionTask);
    
    this.hostkey = this.$Key;
    this.debouncedList = (() => {
      let t; 
      return () => { 
        clearTimeout(t); 
        t = setTimeout(() => this.listFile(), 200); 
      };
    })();
  },

  mounted() {
    console.log('🚀 FileManager mounted');
    console.log('🚀 Mode:', this.Mode);
    console.log('🚀 Methods available:', Object.keys(this.$options.methods || {}));
    console.log('🔍 Task functions check:');
    console.log('  - getConversionTasks:', typeof this.getConversionTasks);
    console.log('  - getTasks:', typeof this.getTasks);
    console.log('  - createConversionTask:', typeof this.createConversionTask);
    
    // เพิ่ม debug สำหรับ VideoPlayer methods
    console.log('🎬 VideoPlayer debug methods:');
    console.log('  - manualCheckQualities:', typeof this.manualCheckQualities);
    console.log('  - onVideoLoaded:', typeof this.onVideoLoaded);
    console.log('  - checkVideoPlayerQualities:', typeof this.checkVideoPlayerQualities);
    
    try {
      // Initialize Share Mode
      this.initializeShareMode();
      
      this.listFile();
      
      // Initialize TaskManager (with delay to ensure media functions are attached)
      setTimeout(() => {
        this.loadConversionTasks();
        this.startTaskRefresh();
        
        // เพิ่ม global reference เพื่อให้ logic.js เข้าถึงได้
        if (typeof window !== 'undefined') {
          window.fileManagerInstance = this;
          
          // เพิ่ม debug methods
          window.fileManagerDebug = {
            checkQualities: () => this.manualCheckQualities(),
            component: this,
            refs: () => this.$refs
          };
          console.log('🎬 Global debug methods available:');
          console.log('  - window.fileManagerDebug.checkQualities()');
          console.log('  - window.fileManagerDebug.component');
          console.log('  - window.fileManagerDebug.refs()');
        }
      }, 500);
      
      // Setup global drag & drop listeners
      window.addEventListener('dragenter', this.onGlobalDragEnter);
      window.addEventListener('dragover', this.onGlobalDragOver);
      window.addEventListener('dragleave', this.onGlobalDragLeave);
      window.addEventListener('drop', this.onGlobalDrop);
      window.addEventListener('keydown', this.onKeyboardShortcuts);
      window.addEventListener('click', this.onClickOutside);
      
      // Add popup-specific keyboard shortcuts
      if (this.Mode === 'popup') {
        window.addEventListener('keydown', this.handlePopupKeydown);
      }
    } catch (error) {
      debug.log(error);
    }
  },

  beforeUnmount() {
    // Cleanup background thumbnail loading
    if (this.cleanupBackgroundLoading) {
      this.cleanupBackgroundLoading();
    }
    
    // Stop TaskManager auto-refresh
    this.stopTaskRefresh();
    
    // Cleanup global reference
    if (typeof window !== 'undefined' && window.fileManagerInstance === this) {
      window.fileManagerInstance = null;
    }
    
    // Cleanup Share Mode - เฉพาะเมื่อมี session และ originalPrefix
    if (this.isShareMode && this.originalPrefix) {
      try {
        const currentSession = storageManager.get('session');
        if (currentSession) {
          const session = {
            ...currentSession,
            prefix: this.originalPrefix,
          };
          storageManager.update('session', session);
        }
      } catch (error) {
        console.log('Error cleaning up share mode:', error);
      }
    }
    
    // Remove global drag & drop listeners
    window.removeEventListener('dragenter', this.onGlobalDragEnter);
    window.removeEventListener('dragover', this.onGlobalDragOver);
    window.removeEventListener('dragleave', this.onGlobalDragLeave);
    window.removeEventListener('drop', this.onGlobalDrop);
    window.removeEventListener('keydown', this.onKeyboardShortcuts);
    window.removeEventListener('click', this.onClickOutside);
    
    // Remove popup-specific keyboard shortcuts
    if (this.Mode === 'popup') {
      window.removeEventListener('keydown', this.handlePopupKeydown);
    }
  },

  // Methods สำหรับ resolution badge
  getResolutionBadgeClass(resolution) {
    const badgeMap = {
      '240p': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200',
      '360p': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200', 
      '480p': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200',
      '720p': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200',
      '1080p': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200',
      '1440p': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200',
      '2160p': 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200'
    };
    return badgeMap[resolution] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200';
  },

  getResolutionLabel(resolution) {
    const labelMap = {
      '240p': 'พื้นฐาน',
      '360p': 'ปกติ',
      '480p': 'ดี', 
      '720p': 'HD',
      '1080p': 'Full HD',
      '1440p': '2K QHD',
      '2160p': '4K Ultra'
    };
    return labelMap[resolution] || resolution.toUpperCase();
  },

  getResolutionDescription(resolution) {
    const descMap = {
      '240p': 'เหมาะสำหรับการดูบนมือถือ',
      '360p': 'คุณภาพมาตรฐาน ใช้ข้อมูลน้อย',
      '480p': 'คุณภาพดี เหมาะสำหรับทั่วไป', 
      '720p': 'คุณภาพสูง เหมาะสำหรับเว็บ',
      '1080p': 'คุณภาพสูงมาก เหมาะสำหรับการเก็บ',
      '1440p': 'คุณภาพพรีเมียม สำหรับจอใหญ่',
      '2160p': 'คุณภาพสูงสุด สำหรับมืออาชีพ'
    };
    return descMap[resolution] || 'คุณภาพปกติ';
  },

  getResolutionIconBg(resolution) {
    const bgMap = {
      '240p': 'bg-gradient-to-br from-red-400 to-red-600',
      '360p': 'bg-gradient-to-br from-orange-400 to-orange-600',
      '480p': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      '720p': 'bg-gradient-to-br from-green-400 to-green-600',
      '1080p': 'bg-gradient-to-br from-blue-400 to-blue-600',
      '1440p': 'bg-gradient-to-br from-purple-400 to-purple-600',
      '2160p': 'bg-gradient-to-br from-pink-400 to-pink-600'
    };
    return bgMap[resolution] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  },

  getResolutionIcon(resolution) {
    const iconMap = {
      '240p': ['fas', 'mobile-alt'],
      '360p': ['fas', 'tablet-alt'],
      '480p': ['fas', 'desktop'], 
      '720p': ['fas', 'tv'],
      '1080p': ['fas', 'film'],
      '1440p': ['fas', 'camera'],
      '2160p': ['fas', 'gem']
    };
    return iconMap[resolution] || ['fas', 'video'];
  },

  getResolutionGradient(resolution) {
    const gradientMap = {
      '240p': 'bg-gradient-to-br from-red-50 to-red-100',
      '360p': 'bg-gradient-to-br from-orange-50 to-orange-100',
      '480p': 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      '720p': 'bg-gradient-to-br from-green-50 to-green-100',
      '1080p': 'bg-gradient-to-br from-blue-50 to-blue-100',
      '1440p': 'bg-gradient-to-br from-purple-50 to-purple-100',
      '2160p': 'bg-gradient-to-br from-pink-50 to-pink-100'
    };
    return gradientMap[resolution] || 'bg-gradient-to-br from-gray-50 to-gray-100';
  },

  // ตรวจสอบว่าไฟล์วิดีโอมี transcode หรือไม่
  hasVideoTranscode(file) {
    return file && file.type === 'media' && file.transcode && Object.keys(file.transcode).length > 0;
  },

  // แสดง video resolution selector
  showVideoResolutionSelector(file) {
    console.log('🎯 showVideoResolutionSelector called with file:', file);
    
    if (!file.transcode || Object.keys(file.transcode).length === 0) {
      console.log('❌ No transcode data, selecting file normally');
      // ถ้าไม่มี transcode ให้เลือกไฟล์ปกติ
      this.selectFileFunc(file, file?.duration, file?.thumbnail);
      return;
    }
    
    console.log('📊 Setting up resolution selector');
    console.log('📁 Selected file:', file);
    console.log('🎬 Transcode data:', file.transcode);
    
    this.selectedFile = file;
    this.selectedFileResolutions = file.transcode;
    this.showResolutionSelector = true;
    
    console.log('✅ showResolutionSelector set to:', this.showResolutionSelector);
    
    // โหลดขนาดไฟล์ของแต่ละความละเอียด
    this.loadTranscodeFileSizes(file);
  },

  // โหลดขนาดไฟล์ของ transcode
  async loadTranscodeFileSizes(file) {
    if (!file || !file.transcode) return;
    
    // เซ็ตขนาดไฟล์ต้นฉบับ
    this.transcodeFileSizes['original'] = file.size;
    
    // โหลดขนาดไฟล์ของแต่ละความละเอียด
    for (const [resolution, url] of Object.entries(file.transcode)) {
      try {
        let finalUrl = url;
        
        // จัดการ stream URL เป็นพิเศษ
        if (resolution === 'stream') {
          if (url && typeof url === 'string') {
            if (!url.startsWith('http')) {
              // เป็น uid ให้สร้าง URL เต็ม
              finalUrl = `https://customer-apw77h9sea196rll.cloudflarestream.com/${url}/manifest/video.m3u8`;
            }
          }
          // สำหรับ HLS stream ไม่ต้องดึงขนาดไฟล์ เพราะเป็น adaptive streaming
          this.transcodeFileSizes[resolution] = 'ปรับขนาดอัตโนมัติ';
          continue;
        }
        
        // ถ้าเป็น URL ปกติ
        if (finalUrl && typeof finalUrl === 'string' && finalUrl.startsWith('http')) {
          // ใช้ HEAD request เพื่อดึงขนาดไฟล์โดยไม่ต้องดาวน์โหลด
          const response = await fetch(finalUrl, { method: 'HEAD' });
          if (response.ok) {
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              this.transcodeFileSizes[resolution] = parseInt(contentLength);
            }
          }
        }
      } catch (error) {
        console.warn(`ไม่สามารถโหลดขนาดไฟล์สำหรับ ${resolution}:`, error);
        // ถ้าโหลดไม่ได้ ให้ใช้การประมาณ
        if (resolution !== 'stream') {
          const estimatedSizeRatio = {
            '240p': 0.1, '360p': 0.2, '480p': 0.3, '720p': 0.5, 
            '1080p': 0.7, '1440p': 0.85, '2160p': 0.9
          };
          const ratio = estimatedSizeRatio[resolution] || 0.5;
          this.transcodeFileSizes[resolution] = Math.round(file.size * ratio);
        }
      }
    }
  },

  // ปิด video resolution selector
  closeResolutionSelector() {
    this.showResolutionSelector = false;
    this.selectedFile = null;
    this.selectedFileResolutions = {};
    this.transcodeFileSizes = {};
  },

  // เลือกวิดีโอพร้อมความละเอียด
  selectVideoWithResolution(resolution = 'original') {
    if (!this.selectedFile) return;
    
    // ตรวจสอบว่าเป็น URL ที่พร้อมใช้งานหรือไม่
    if (resolution !== 'original' && resolution !== 'stream') {
      const transcodeValue = this.selectedFile.transcode[resolution];
      
      // ถ้าเป็นตัวเลข แสดงว่ากำลัง transcode อยู่
      if (typeof transcodeValue === 'number') {
        console.log('⚠️ Resolution still transcoding:', resolution, transcodeValue + '%');
        return;
      }
      
      // ถ้าไม่ใช่ URL ที่พร้อมใช้งาน
      if (!transcodeValue || typeof transcodeValue !== 'string' || !transcodeValue.startsWith('http')) {
        console.log('⚠️ Resolution not ready:', resolution, transcodeValue);
        return;
      }
    }
    
    let finalUrl = '';
    let finalFile = this.selectedFile;
    
    if (resolution === 'original') {
      // ใช้ URL ต้นฉบับ
      finalUrl = finalFile.url || finalFile.original;
    } else if (resolution === 'stream') {
      // จัดการ HLS Stream
      const streamValue = finalFile.transcode.stream;
      
      // ตรวจสอบว่า streamValue เป็น uid หรือ URL เต็ม
      if (streamValue && typeof streamValue === 'string') {
        if (streamValue.startsWith('http')) {
          // เป็น URL เต็มแล้ว
          finalUrl = streamValue;
        } else {
          // เป็น uid ให้สร้าง URL เต็ม
          finalUrl = `https://customer-apw77h9sea196rll.cloudflarestream.com/${streamValue}/manifest/video.m3u8`;
        }
      }
    } else {
      // ใช้ URL ของความละเอียดที่เลือก
      finalUrl = finalFile.transcode[resolution];
    }
    
    // สร้าง file object ใหม่พร้อมข้อมูลความละเอียด
    // ใช้ original path เพื่อให้ extension check ผ่าน และเพิ่ม finalUrl เป็น property เพิ่มเติม
    const fileWithResolution = {
      ...finalFile,
      path: finalFile.original || finalFile.path, // ใช้ original path เพื่อให้ extension check ผ่าน
      finalUrl: finalUrl, // URL จริงที่จะใช้
      selectedResolution: resolution,
      finalSize: this.transcodeFileSizes[resolution] || finalFile.size
    };
    
    console.log('🎯 Calling selectFileFunc with:', {
      fileWithResolution,
      finalUrl,
      resolution,
      duration: finalFile?.duration,
      thumbnail: finalFile?.thumbnail,
      originalPath: finalFile.original,
      currentPath: finalFile.path
    });
    
    // เรียก selectFileFunc พร้อมข้อมูลที่เลือก
    this.selectFileFunc(fileWithResolution, finalFile?.duration, finalFile?.thumbnail);
    
    // ปิด modal
    this.closeResolutionSelector();
  },

  // แสดง video resolution selector สำหรับไฟล์ที่เลือกใน footer
  showVideoResolutionSelectorForSelected() {
    console.log('🎯 showVideoResolutionSelectorForSelected called');
    console.log('📊 selectedFiles.size:', this.selectedFiles.size);
    
    if (this.selectedFiles.size !== 1) {
      console.log('❌ More than 1 file selected, exiting');
      return;
    }

    const selectedFileId = Array.from(this.selectedFiles)[0];
    console.log('🆔 Selected file ID:', selectedFileId);
    
    const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
    console.log('📁 Found file:', selectedFile);
    
    if (!selectedFile) {
      console.log('❌ Selected file not found in fileListing');
      return;
    }
    
    const hasTranscode = this.hasVideoTranscode(selectedFile);
    console.log('🎬 Has video transcode:', hasTranscode);
    console.log('🎬 File transcode data:', selectedFile.transcode);
    
    if (!hasTranscode) {
      console.log('❌ File does not have video transcode');
      return;
    }

    console.log('✅ Calling showVideoResolutionSelector');
    // ใช้ showVideoResolutionSelector
    this.showVideoResolutionSelector(selectedFile);
  },

  // Handle resolution button click with debugging
  handleResolutionButtonClick() {
    console.log('🔥 Resolution button clicked!');
    console.log('🔥 Event fired successfully');
    this.showVideoResolutionSelectorForSelected();
  },

  // ลบ resolution ที่ระบุ
  deleteTranscodeResolution(resolution) {
    console.log('🗑️ Delete resolution:', resolution);
    // ฟังก์ชันนี้สามารถเพิ่ม logic การลบจริงได้ตามต้องการ
    // เช่น ส่ง API request ไปลบไฟล์ transcode
  },

  // Helper method สำหรับตรวจสอบว่าไฟล์ที่เลือกเป็นวิดีโอหรือไม่
  isSelectedFileVideo() {
    if (this.selectedFiles.size !== 1) return false;
    
    const selectedFileId = Array.from(this.selectedFiles)[0];
    const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
    
    if (!selectedFile) return false;
    
    // ตรวจสอบว่าเป็นไฟล์วิดีโอหรือไม่
    return selectedFile.type === 'media' && this.isVideoFile(selectedFile);
  },

  // เปิด video trimmer สำหรับไฟล์ที่เลือกใน footer
  openVideoTrimmerForSelected() {
    if (this.selectedFiles.size !== 1) return;
    
    const selectedFileId = Array.from(this.selectedFiles)[0];
    const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
    
    if (selectedFile && selectedFile.type === 'media' && this.isVideoFile(selectedFile)) {
      this.openVideoTrimmer(selectedFile);
    }
  },

  // เปิด video subtitle สำหรับไฟล์ที่เลือกใน footer  
  openVideoSubtitleForSelected() {
    if (this.selectedFiles.size !== 1) return;
    
    const selectedFileId = Array.from(this.selectedFiles)[0];
    const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
    
    if (selectedFile && selectedFile.type === 'media' && this.isVideoFile(selectedFile)) {
      this.openVideoSubtitle(selectedFile);
    }
  },

  // เปิด video subtitle สำหรับไฟล์ที่ระบุ
  openVideoSubtitle(file) {
    console.log('🎬 Opening VideoSubtitle for file:', file);
    this.videoSubtitleFile = file;
    this.videoSubtitleUrl = file.url || file.original;
    this.showVideoSubtitle = true;
  },

  // Callback เมื่อการทำ subtitle เสร็จ
  onVideoSubtitled(result) {
    console.log('✅ VideoSubtitle completed:', result);
    if (result.success) {
      this.$toast({ type: 'success', message: 'สร้าง subtitle สำเร็จ' });
      // Refresh file list if needed
      this.debouncedList();
    }
  },

  // สร้าง streaming สำหรับไฟล์ที่เลือกใน footer
  async makeStreamingForSelected() {
    if (this.selectedFiles.size !== 1) return;
    
    const selectedFileId = Array.from(this.selectedFiles)[0];
    const selectedFile = this.fileListing.find(f => f._id === selectedFileId);
    
    if (selectedFile && selectedFile.type === 'media' && this.isVideoFile(selectedFile)) {
      console.log('🎬 Making streaming for selected file:', selectedFile.name);
      
      try {
        // สร้าง URL เต็มของไฟล์
        const fileUrl = selectedFile.url || selectedFile.original || `${this.configs.s3Endpoint}${selectedFile.path}`;
        
        // เรียกฟังก์ชัน makeStreaming
        if (typeof this.makeStreaming === 'function') {
          await this.makeStreaming(fileUrl, selectedFile.name, selectedFile);
        } else {
          console.error('makeStreaming function not available');
          this.$toast({
            type: 'error',
            message: 'ฟังก์ชัน streaming ไม่พร้อมใช้งาน'
          });
        }
      } catch (error) {
        console.error('Error in makeStreamingForSelected:', error);
      }
    }
  },

  // Video player event handlers สำหรับ debug HLS qualities
  onVideoLoaded(event) {
    console.log('🎬 Video loadstart event triggered!');
    console.log('🎬 Event details:', event);
    console.log('🎬 Video URL:', this.getSelectedVideoUrl());
    console.log('🎬 Is HLS/m3u8:', this.getSelectedVideoUrl()?.includes('.m3u8'));
    
    // ตรวจสอบ player หลังจาก event
    setTimeout(() => {
      console.log('🎬 Delayed check after loadstart...');
      this.checkVideoPlayerQualities();
    }, 500);
  },

  onVideoMetadataLoaded(event) {
    console.log('🎬 Video metadata loaded:', event);
    
    // ลองเข้าถึง player instance เพื่อดู qualities
    setTimeout(() => {
      this.checkVideoPlayerQualities();
    }, 1000);
  },

  onVideoCanPlay(event) {
    console.log('🎬 Video can play:', event);
    this.checkVideoPlayerQualities();
  },

  onVideoReady(event) {
    console.log('🎬 Video ready:', event);
    this.checkVideoPlayerQualities();
  },

  checkVideoPlayerQualities() {
    console.log('🎬 checkVideoPlayerQualities called');
    console.log('🎬 $refs available:', Object.keys(this.$refs));
    
    // ลองเข้าถึง player instance หลายวิธี
    const streamPlayer = this.$refs.streamVideoPlayer;
    const hlsPlayer = this.$refs.hlsVideoPlayer;
    
    console.log('🎬 streamPlayer ref:', streamPlayer);
    console.log('🎬 hlsPlayer ref:', hlsPlayer);
    
    if (streamPlayer) {
      console.log('🎬 Stream VideoPlayer ref found:', streamPlayer);
      console.log('🎬 Stream VideoPlayer properties:', Object.keys(streamPlayer));
      
      // ลองเข้าถึง internal player
      if (streamPlayer.$refs?.video) {
        console.log('🎬 Internal video element:', streamPlayer.$refs.video);
      }
      if (streamPlayer.player) {
        console.log('🎬 Player instance:', streamPlayer.player);
        this.inspectPlayerQualities(streamPlayer.player);
      }
      if (streamPlayer.hls) {
        console.log('🎬 HLS instance:', streamPlayer.hls);
        this.inspectHLSQualities(streamPlayer.hls);
      }
      if (streamPlayer.$children) {
        console.log('🎬 Player children:', streamPlayer.$children);
      }
    }
    
    if (hlsPlayer) {
      console.log('🎬 HLS VideoPlayer ref found:', hlsPlayer);
      console.log('🎬 HLS VideoPlayer properties:', Object.keys(hlsPlayer));
      
      if (hlsPlayer.player) {
        console.log('🎬 Player instance:', hlsPlayer.player);
        this.inspectPlayerQualities(hlsPlayer.player);
      }
      if (hlsPlayer.hls) {
        console.log('🎬 HLS instance:', hlsPlayer.hls);
        this.inspectHLSQualities(hlsPlayer.hls);
      }
    }
    
    // ลองหา video element ทั่วทั้งหน้า
    const videoElements = document.querySelectorAll('video');
    console.log('🎬 Found video elements:', videoElements.length);
    videoElements.forEach((video, index) => {
      console.log(`🎬 Video ${index}:`, {
        src: video.src,
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState
      });
      
      // ลองหา HLS instance ใน video element
      if (video.hls) {
        console.log(`🎬 Video ${index} has HLS:`, video.hls);
        this.inspectHLSQualities(video.hls);
      }
    });
  },

  inspectPlayerQualities(player) {
    console.log('🎬 Inspecting player for qualities...');
    console.log('🎬 Player object:', player);
    
    // ลองหาใน player properties
    if (player.qualityLevels) {
      console.log('🎬 Player qualityLevels:', player.qualityLevels);
    }
    if (player.levels) {
      console.log('🎬 Player levels:', player.levels);
    }
    if (player.textTracks) {
      console.log('🎬 Player textTracks:', player.textTracks);
    }
    
    // แสดง properties ทั้งหมดของ player
    console.log('🎬 Player properties:', Object.keys(player));
  },

  inspectHLSQualities(hls) {
    console.log('🎬 Inspecting HLS.js for qualities...');
    console.log('🎬 HLS object:', hls);
    
    if (hls.levels) {
      console.log('🎬 HLS Levels found:', hls.levels);
      console.log('🎬 Number of levels:', hls.levels.length);
      hls.levels.forEach((level, index) => {
        console.log(`🎬 Level ${index}:`, {
          width: level.width,
          height: level.height,
          bitrate: level.bitrate,
          name: level.name,
          url: level.url
        });
      });
    } else {
      console.log('🎬 No HLS levels found');
    }
    
    if (hls.currentLevel !== undefined) {
      console.log('🎬 Current HLS level:', hls.currentLevel);
    }
    
    // แสดง properties ทั้งหมดของ HLS
    console.log('🎬 HLS properties:', Object.keys(hls));
  },
  
  // เพิ่ม method สำหรับเรียกด้วยตนเอง
  manualCheckQualities() {
    console.log('🎬 Manual quality check triggered');
    this.checkVideoPlayerQualities();
    
    // รอสักครู่แล้วลองอีกครั้ง
    setTimeout(() => {
      console.log('🎬 Second manual check after delay');
      this.checkVideoPlayerQualities();
    }, 2000);
  },

  // Screen Recorder Methods
  openScreenRecorder() {
    alert('🎥 Vue method openScreenRecorder called!');
    console.log('🎥 Opening Screen Recorder - Button clicked!');
    console.log('🎥 Current showScreenRecorder value:', this.showScreenRecorder);
    this.showScreenRecorder = true;
    console.log('🎥 After setting showScreenRecorder to true:', this.showScreenRecorder);
  },

  closeScreenRecorder() {
    console.log('🎥 Closing Screen Recorder');
    this.showScreenRecorder = false;
  },

  onScreenRecorded(result) {
    console.log('✅ Screen recording completed:', result);
    if (result.success) {
      this.$toast({ type: 'success', message: 'บันทึกหน้าจอสำเร็จ' });
      
      // Force refresh file list to show new recording
      console.log('🔄 Forcing file list refresh after screen recording upload...');
      
      // Clear existing lists and reload
      this.files = [];
      this.filteredFiles = [];
      
      // Call debounced list method
      this.debouncedList();
      
      // Close screen recorder
      this.showScreenRecorder = false;
    }
  }
};
</script>


<template>

<!-- Global Drop Overlay -->
<div v-if="showDropOverlay" class="fixed inset-0 z-[9999] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center drop-overlay">
  <div class="absolute inset-4 border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center text-white drop-zone">
    <div class="text-center space-y-4">
      <div class="w-24 h-24 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
        <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="text-4xl text-white"/>
      </div>
      <h3 class="text-2xl font-bold">วางไฟล์เพื่ออัปโหลด</h3>
      <p class="text-lg opacity-80">ปล่อยเมาส์เพื่อเพิ่มไฟล์ลงในคิวอัปโหลด</p>
      <p class="text-sm opacity-60">กด ESC เพื่อยกเลิก</p>
      <div v-if="dropFileCount > 1" class="inline-flex items-center px-4 py-2 bg-blue-600 rounded-full text-sm font-medium">
        <font-awesome-icon :icon="['fas', 'files']" class="mr-2"/>
        +{{ dropFileCount }} ไฟล์
      </div>
    </div>
  </div>
</div>

<!-- Refresh Loading Overlay -->
<div v-if="isRefreshLoading" class="fixed inset-0 z-[9998] bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-4 min-w-[250px]">
    <div class="flex-shrink-0">
      <div class="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <div>
      <h3 class="text-lg font-medium text-gray-900">กำลังรีเฟรชข้อมูล</h3>
      <p class="text-sm text-gray-500">กรุณารอสักครู่...</p>
    </div>
  </div>
</div>


<div class="bg-gray-50 flex overflow-hidden file-manager-container" 
     :class="[
       headerType && `with-${headerType}`,
       customClass,
       Mode === 'popup' ? 'popup-mode h-auto' : ''
     ]"
     :style="Mode === 'popup' ? { height: '70vh', maxHeight: '600px' } : {}">
  
  <!-- Sidebar -->
  <div v-if="Mode !== 'popup' && !isShareMode" class="hidden lg:flex lg:w-64 lg:flex-col">
    <div class="flex flex-col bg-white border-r border-gray-200 h-full">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <font-awesome-icon :icon="['fas',PageIcon]" class="text-blue-600 text-lg"/>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">{{ PageName }}</h1>
          </div>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto">
        <!-- File Type Filter Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ประเภทไฟล์</h3>
          <nav class="grid grid-cols-2 gap-1">
          <button 
            v-for="filterType in [
              { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-th-large', count: fileListing.length },
              { value: 'folder', label: 'โฟลเดอร์', icon: 'fas fa-folder', count: fileListing.filter(f => f.mimetype === 'folder').length },
              { value: 'image', label: 'รูปภาพ', icon: 'fas fa-image', count: fileListing.filter(f => f.type === 'image').length },
              { value: 'media', label: 'วิดีโอ', icon: 'fas fa-video', count: fileListing.filter(f => f.type === 'media').length },
              { value: 'document', label: 'เอกสาร', icon: 'fas fa-file-alt', count: fileListing.filter(f => f.type === 'document').length }
            ]" 
            :key="filterType.value"
            @click="filterByType(filterType.value)" 
            class="flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
            :class="{ 
              'bg-blue-100 text-blue-700 font-medium active': fileTypeFilter === filterType.value,
              'text-gray-600 hover:bg-gray-100 hover:text-gray-900': fileTypeFilter !== filterType.value
            }"
          >
            <i :class="filterType.icon" class="text-sm w-4 flex-shrink-0"></i>
            <span class="flex-1 text-left truncate text-xs">{{ filterType.label }}</span>
            <span 
              class="px-1.5 py-0.5 text-xs rounded-full status-badge flex-shrink-0 font-medium"
              :class="{ 
                'bg-blue-200 text-blue-800': fileTypeFilter === filterType.value,
                'bg-gray-200 text-gray-600': fileTypeFilter !== filterType.value
              }"
            >
              {{ filterType.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Storage Usage -->
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">พื้นที่ใช้งาน</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">ใช้แล้ว</span>
            <span class="font-medium text-gray-900">{{ formatBytes(summaryFileSize) }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="{
                'bg-green-500': calculateDiskUsagePercentage(summaryFileSize) < 70,
                'bg-yellow-500': calculateDiskUsagePercentage(summaryFileSize) >= 70 && calculateDiskUsagePercentage(summaryFileSize) < 90,
                'bg-red-500': calculateDiskUsagePercentage(summaryFileSize) >= 90
              }"
              :style="{ width: calculateDiskUsagePercentage(summaryFileSize) + '%' }">
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ calculateDiskUsagePercentage(summaryFileSize) }}% ใช้งาน</span>
            <span>{{ space }} MB</span>
          </div>
        </div>
      </div>

      <!-- Task Manager Toggle -->
      <div v-if="tasksWithProgress.length > 0" class="border-b border-gray-200">
        <button 
          @click="taskPanelExpanded = !taskPanelExpanded"
          class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          :class="{ 'bg-blue-50': taskPanelExpanded }"
        >
          <div class="flex items-center space-x-2">
            <div class="p-1 rounded"
                 :class="{ 
                   'bg-blue-100': taskPanelExpanded, 
                   'bg-orange-100': !taskPanelExpanded 
                 }">
              <i class="fas fa-tasks text-xs"
                 :class="{ 
                   'text-blue-600': taskPanelExpanded, 
                   'text-orange-600': !taskPanelExpanded 
                 }"></i>
            </div>
            <div class="text-left">
              <h3 class="text-xs font-medium text-gray-700">งาน</h3>
              <p class="text-xs text-gray-500">{{ tasksWithProgress.length }} รายการ</p>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <!-- Task count badge -->
            <span class="px-1.5 py-0.5 text-xs font-medium rounded-full"
                  :class="{ 
                    'bg-blue-200 text-blue-800': taskPanelExpanded,
                    'bg-orange-200 text-orange-800': !taskPanelExpanded
                  }">
              {{ tasksWithProgress.length }}
            </span>
            <!-- Arrow icon -->
            <i class="fas text-xs transition-transform duration-200" 
               :class="taskPanelExpanded ? 'fa-chevron-up text-blue-600' : 'fa-chevron-down text-gray-500'"></i>
          </div>
        </button>
        
        <!-- Task Panel Content (แสดงใน sidebar เมื่อเปิด) -->
        <div v-if="taskPanelExpanded" class="bg-white border-b border-gray-200 overflow-hidden">
            <!-- Panel Header -->
            <div class="bg-blue-600 text-white px-3 py-2 flex items-center justify-between">
              <h3 class="font-medium text-xs">งานแปลงไฟล์</h3>
              <div class="flex items-center space-x-1">
                <span class="text-xs bg-blue-500 px-1 py-0.5 rounded text-xs">{{ tasksWithProgress.length }}</span>
                <span v-if="completedTasksCount > 0" class="text-xs bg-green-500 px-1 py-0.5 rounded text-xs">
                  {{ completedTasksCount }}
                </span>
                
                <!-- Clear All Button -->
                <button 
                  v-if="tasksWithProgress.filter(task => task.status === 'completed').length > 0"
                  @click="clearAllConversionTasks" 
                  class="text-blue-100 hover:text-white rounded hover:bg-blue-500 transition-colors p-0.5"
                  title="ล้างงานที่เสร็จแล้ว"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
                
                <!-- Refresh Button -->
                <button 
                  @click="refreshTasks" 
                  class="text-blue-100 hover:text-white rounded hover:bg-blue-500 transition-colors p-0.5"
                  title="รีเฟรชรายการงาน"
                >
                  <i class="fas fa-sync-alt text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Task List -->
            <div 
              :class="{
                'max-h-80 overflow-y-auto': tasksWithProgress.length > 5,
                'overflow-y-hidden': tasksWithProgress.length <= 5
              }"
            >
              <div v-if="tasksWithProgress.length === 0" class="p-3 text-center text-gray-500 text-xs">
                ไม่มีงาน
              </div>
              <div v-else>
                <div v-for="task in tasksWithProgress" :key="task._id" class="border-b border-gray-100 p-3 hover:bg-gray-50 group">
                  <div class="flex items-center gap-3">
                    <!-- Status Icon/Spinner (ข้างหน้า) -->
                    <div class="flex-shrink-0">
                      <div v-if="task.status === 'processing'" class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <i v-else-if="task.status === 'completed'" class="fas fa-check-circle text-green-600 text-sm"></i>
                      <i v-else-if="task.status === 'failed'" class="fas fa-times-circle text-red-600 text-sm"></i>
                    </div>
                    
                    <!-- Task Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-xs font-medium text-gray-900 truncate">
                        {{ task.fileInfo?.name || task.metadata?.fileName || task.title }}
                      </h4>
                      <p class="text-xs text-gray-500">
                        <span v-if="task.type === 'trim' || task.metadata?.type === 'trim'">
                          ตัดต่อ ({{ task.metadata?.quality?.toUpperCase() }})
                        </span>
                        <span v-else-if="task.type === 'conversion' || task.metadata?.type === 'conversion'">
                          แปลงไฟล์ ({{ task.metadata?.quality?.toUpperCase() }})
                        </span>
                        <span v-else>
                          {{ task.metadata?.quality?.toUpperCase() }} 
                          <span v-if="task.type || task.metadata?.type" class="ml-1 px-1 py-0.5 bg-gray-100 rounded text-xs">
                            {{ task.type || task.metadata?.type }}
                          </span>
                        </span>
                      </p>
                      
                      <!-- Progress Bar -->
                      <div class="mt-1">
                        <div class="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            class="h-1 rounded-full transition-all duration-300"
                            :class="{
                              'bg-blue-600': task.status === 'processing',
                              'bg-green-600': task.status === 'completed',
                              'bg-red-600': task.status === 'failed'
                            }"
                            :style="{ width: (task.progress || 0) + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Progress Percentage / Clear Button (ข้างหลัง) -->
                    <div class="flex-shrink-0 ml-2 min-w-0 relative w-12 h-6 flex items-center justify-end">
                      <!-- Progress Percentage (แสดงปกติ) -->
                      <span 
                        v-show="!(task.status === 'completed' && Math.round(task.progress || 0) === 100)"
                        class="text-xs font-medium absolute right-0" 
                        :class="{
                          'text-blue-600': task.status === 'processing',
                          'text-green-600': task.status === 'completed',
                          'text-red-600': task.status === 'failed'
                        }">
                        {{ Math.round(task.progress || 0) }}%
                      </span>
                      
                      <!-- Percentage for completed tasks (แสดงเมื่อไม่ hover) -->
                      <span 
                        v-if="task.status === 'completed' && Math.round(task.progress || 0) === 100"
                        class="text-xs font-medium text-green-600 group-hover:opacity-0 transition-opacity duration-200 absolute right-0">
                        100%
                      </span>
                      
                      <!-- Clear Button (แสดงเมื่อ hover และ task เสร็จแล้ว 100% - ชิดขวาสุด) -->
                      <button
                        v-if="task.status === 'completed' && Math.round(task.progress || 0) === 100"
                        @click.stop="clearSingleTask(task._id)"
                        class="text-xs px-1.5 py-0.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 absolute right-0"
                        title="ลบงานนี้"
                      >
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
      
      </div> <!-- End of Scrollable Content Area -->

      <!-- User Info -->
      <div class="px-4 py-4 flex-shrink-0 border-t border-gray-200">
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
            <p class="text-xs text-gray-500">ผู้จัดการไฟล์</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0 h-full">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">{{ PageName }}</h1>
        <button 
          @click="toggleMobileSidebar" 
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Single Compact Toolbar -->
    <div class="bg-white border-b border-gray-200 py-3">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
        <!-- Left Section: Breadcrumb Navigation -->
        <div class="flex-1 order-1 lg:order-1 px-4 lg:pl-4 lg:pr-0" 
             :class="Mode === 'popup' && !showSearchInPopup ? 'lg:pr-4' : ''">
          <!-- Breadcrumb Navigation -->
          <nav class="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
            <button 
              @click="openFolder()" 
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop="handleFileDrop($event, '')"
              class="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50">
              <font-awesome-icon :icon="['fas','home']" class="text-gray-400 mr-1 w-3 h-3"/>
              <span class="font-medium">หน้าแรก</span>
            </button>
        
            <span v-for="(Path,index) in filteredFolderPath" :key="index" class="flex items-center">
              <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-300 w-2 h-2 mx-1"/>
              <button 
                v-if="(index+1)==filteredFolderPath.length" 
                class="flex items-center font-medium text-blue-600 px-2 py-1 rounded bg-blue-50">
                <font-awesome-icon :icon="['fas','folder-open']" class="text-blue-500 mr-1 w-3 h-3"/> 
                <span class="truncate" :class="Mode === 'popup' ? 'max-w-24' : 'max-w-32'">{{Path}}</span>
              </button>
              <button 
                v-else
                @click="openFolder(getFullPath(Path))"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop="handleFileDrop($event, getFullPath(Path))"
                class="flex items-center font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50">
                <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500 mr-1 w-3 h-3"/> 
                <span class="truncate" :class="Mode === 'popup' ? 'max-w-20' : 'max-w-32'">{{Path}}</span>
              </button>
            </span>
          </nav>
        </div>

        <!-- Right Section: Search, Selection Info, and Action Buttons -->
        <div class="flex items-center justify-between lg:justify-end space-x-3 flex-shrink-0 px-4 lg:pr-4 order-2 lg:order-2">
          <!-- Search Input (ซ่อนในโหมด popup เมื่อไม่ได้กดปุ่มค้นหา) -->
          <transition name="search-fade">
            <div v-if="Mode !== 'popup' || showSearchInPopup" class="w-full lg:w-64 search-input-popup">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="ค้นหาไฟล์..." 
                  name="file-search-query"
                  id="file-search-input"
                  autocomplete="off"
                  data-lpignore="true"
                  class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <!-- ปุ่มปิดค้นหาในโหมด popup -->
                <button 
                  v-if="Mode === 'popup' && showSearchInPopup"
                  @click="toggleSearchInPopup"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </transition>

          <div class="flex items-center space-x-3 flex-shrink-0">
            <!-- ปุ่มค้นหาในโหมด popup (แสดงเมื่อยังไม่ได้เปิดช่องค้นหา) -->
            <button 
              v-if="Mode === 'popup' && !showSearchInPopup"
              @click="toggleSearchInPopup"
              class="inline-flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm border border-gray-200 h-[40px]"
              title="ค้นหาไฟล์"
            >
              <i class="fas fa-search text-xs"></i>
            </button>
            
            <!-- Selection Info (แสดงเมื่อมีไฟล์ถูกเลือก) -->
            <div v-if="selectedFiles.size > 0" class="hidden lg:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 whitespace-nowrap">
              <span class="text-sm font-medium text-blue-700">
                เลือก {{ selectedFiles.size }} ไฟล์
              </span>
              <button 
                @click="selectAllFiles"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                ทั้งหมด
              </button>
              <button 
                @click="clearSelection"
                class="text-xs text-gray-600 hover:text-gray-800"
              >
                ยกเลิก
              </button>
            </div>

            <!-- Multi-Select Actions (แสดงเมื่อมีไฟล์ถูกเลือกและไม่ใช่ read-only mode) -->
            <template v-if="selectedFiles.size > 0 && !isReadOnlyMode">
              <button 
                @click="batchDeleteFiles"
                class="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                <i class="fas fa-trash mr-1 text-xs"></i>
                <span class="hidden lg:inline">ลบ</span>
              </button>
            </template>

            <!-- Regular Action Buttons (แสดงเมื่อไม่มีไฟล์ถูกเลือกหรือใน read-only mode) -->
            <template v-if="selectedFiles.size === 0 && !isReadOnlyMode">
              <!-- ปุ่มสร้างโฟลเดอร์ (ซ่อนใน popup mode) -->
              <button 
                v-if="Mode !== 'popup'"
                @click="openCreateFolder"
                class="inline-flex items-center px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm border border-green-200 h-[40px]"
              >
                <i class="fas fa-folder-plus mr-1 text-xs"></i>
                <span class="hidden lg:inline">สร้างโฟลเดอร์</span>
              </button>
              <!-- ปุ่มอัปโหลด (ซ่อนใน popup mode) -->
              <button 
                v-if="Mode !== 'popup'"
                @click="openUploadBox"
                class="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm border border-blue-200 h-[40px]"
              >
                <i class="fas fa-upload mr-1 text-xs"></i>
                <span class="hidden lg:inline">อัพโหลด</span>
              </button>
              
              <!-- ปุ่ม Screen Recorder (ปรับลด z-index ไม่ให้ทับองค์ประกอบอื่น) -->
              <button 
                @click="showScreenRecorder = true"
                class="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm border border-red-600 h-[40px] relative z-10"
                title="บันทึกหน้าจอ + กล้อง webcam"
              >
                <i class="fas fa-video mr-1 text-xs"></i>
                <span class="hidden lg:inline">อัดหน้าจอ</span>
              </button>
              
              <!-- Actions Dropdown Menu -->
              <div class="relative" ref="actionsDropdown">
                <button 
                  @click="toggleActionsDropdown"
                  class="inline-flex items-center px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm border border-gray-200 h-[40px]"
                  :class="{ 'bg-gray-50': showActionsDropdown }"
                >
                  <i class="fas fa-tools mr-1 text-xs"></i>
                  <i class="fas text-xs transition-transform duration-200" 
                     :class="showActionsDropdown ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-show="showActionsDropdown"
                  class="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  @click.stop
                >
                  <div class="py-1">
                    <!-- สร้างโฟลเดอร์ (ใน popup mode) -->
                    <button 
                      v-if="Mode === 'popup'"
                      @click="executeAction('createFolder')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-folder-plus text-green-600 w-4 text-base"></i>
                      <span class="font-medium">สร้างโฟลเดอร์</span>
                    </button>
                    
                    <!-- อัปโหลดไฟล์ (ใน popup mode) -->
                    <button 
                      v-if="Mode === 'popup'"
                      @click="executeAction('upload')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-upload text-blue-600 w-4 text-base"></i>
                      <span class="font-medium">อัปโหลดไฟล์</span>
                    </button>
                    
                    <!-- Divider (แสดงใน popup mode) -->
                    <div v-if="Mode === 'popup'" class="border-t border-gray-100 my-1"></div>
                    
                    <!-- Streaming Action -->
                    <button 
                      @click="executeAction('makeStreaming')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-stream text-purple-600 w-4 text-base"></i>
                      <span class="font-medium">เพิ่ม Streaming</span>
                    </button>
                    
                    <!-- Video Trimmer Action (แสดงเมื่อมีวิดีโอถูกเลือก) -->
                    <button 
                      v-if="selectedFiles.size === 1 && isSelectedFileVideo()"
                      @click="executeAction('videoTrim')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-cut text-green-600 w-4 text-base"></i>
                      <span class="font-medium">ตัดต่อวิดีโอ</span>
                    </button>
                    
                    <!-- Video Subtitle Action (แสดงเมื่อมีวิดีโอถูกเลือก) -->
                    <button 
                      v-if="selectedFiles.size === 1 && isSelectedFileVideo()"
                      @click="executeAction('videoSubtitle')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-closed-captioning text-indigo-600 w-4 text-base"></i>
                      <span class="font-medium">สร้าง Subtitle</span>
                    </button>
                    
                    <!-- Make Streaming Action (แสดงเมื่อมีวิดีโอถูกเลือก) -->
                    <button 
                      v-if="selectedFiles.size === 1 && isSelectedFileVideo()"
                      @click="executeAction('makeStreaming')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-stream text-purple-600 w-4 text-base"></i>
                      <span class="font-medium">สร้าง Streaming</span>
                    </button>
                    
                    <!-- Refresh Action -->
                    <button 
                      @click="executeAction('refresh')"
                      :disabled="isRefreshLoading"
                      class="w-full text-left px-4 py-3 text-sm transition-colors duration-150 flex items-center gap-3"
                      :class="isRefreshLoading ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
                    >
                      <i 
                        :class="isRefreshLoading ? 'fas fa-spinner fa-spin text-blue-400' : 'fas fa-sync-alt text-blue-600'"
                        class="w-4 text-base"
                      ></i>
                      <span class="font-medium">{{ isRefreshLoading ? 'กำลังรีเฟรช...' : 'รีเฟรช' }}</span>
                    </button>
                    
                    <!-- Batch Resize Images Action (แสดงเมื่อมีรูปภาพ) -->
                    <button 
                      v-if="fileListing.filter(f => f.type === 'image').length > 0"
                      @click="executeAction('batchResize')"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <i class="fas fa-magic text-orange-600 w-4 text-base"></i>
                      <span class="font-medium">ปรับขนาดรูปทั้งหมด</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Layout Toggle (แสดงเสมอ) -->
            <div class="flex items-center bg-gray-50 rounded-lg p-1">
              <button 
                @click="toggleLayout" 
                :class="layout === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'"
                class="p-2 rounded-md transition-all duration-200"
                title="มุมมองตาราง">
                <font-awesome-icon :icon="['fas', 'th-large']" class="w-4 h-4 text-gray-600" />
              </button>
              <button 
                @click="toggleLayout" 
                :class="layout === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'"
                class="p-2 rounded-md transition-all duration-200"
                title="มุมมองรายการ">
                <font-awesome-icon :icon="['fas', 'list']" class="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Type Filter (Mobile) -->
    <div class="lg:hidden bg-white border-b border-gray-200">
      <div class="px-4 py-2">
        <select 
          v-model="fileTypeFilter" 
          @change="filterByType(fileTypeFilter)"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">ทั้งหมด ({{ fileListing.length }})</option>
          <option value="folder">โฟลเดอร์ ({{ fileListing.filter(f => f.mimetype === 'folder').length }})</option>
          <option value="image">รูปภาพ ({{ fileListing.filter(f => f.type === 'image').length }})</option>
          <option value="media">วิดีโอ ({{ fileListing.filter(f => f.type === 'media').length }})</option>
          <option value="document">เอกสาร ({{ fileListing.filter(f => f.type === 'document').length }})</option>
        </select>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 p-4 overflow-y-auto" 
         :style="Mode === 'popup' ? { maxHeight: 'calc(70vh - 140px)' } : {}">
      <!-- Current Filter Info -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ getFilterLabel(fileTypeFilter) }}
          </h2>
          <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {{ displayedFiles.length }} รายการ
          </span>
        </div>
        
        <!-- Error Display -->
        <div v-if="error" class="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-red-600 text-sm"/>
          <span class="text-sm font-medium text-red-800">{{ errorText }}</span>
          <button @click="error = false" class="text-red-600 hover:text-red-800 ml-2">
            <font-awesome-icon :icon="['fas', 'times']" class="text-xs"/>
          </button>
        </div>
      </div>

      <!-- File Content -->
      <div :class="Mode === 'popup' ? 'h-auto' : 'flex-1'" 
           @contextmenu="onContextDesktopMenu"
           class="relative">
        <!-- Empty State Message -->
        <div v-if="displayedFiles.length === 0" 
             class="flex flex-col items-center justify-center h-96 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
             @contextmenu="onContextDesktopMenu">
          <font-awesome-icon :icon="['fas', 'folder-open']" class="text-6xl mb-4 text-gray-300"/>
          <h3 class="text-lg font-medium text-gray-600 mb-2">ไม่มีไฟล์ในโฟลเดอร์นี้</h3>
          <p class="text-sm text-gray-500 mb-4">คลิกขวาเพื่อเพิ่มไฟล์หรือสร้างโฟลเดอร์</p>
          <div class="flex space-x-2 text-xs text-gray-400">
            <span>📁 สร้างโฟลเดอร์</span>
            <span>⬆️ อัพโหลดไฟล์</span>
            <span>🔄 รีเฟรช</span>
          </div>
        </div>

        <!-- Grid Layout -->
        <div v-if="layout === 'grid' && displayedFiles.length > 0" 
             :class="Mode === 'popup' ? 
               'grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-6 lg:grid-cols-5 xl:grid-cols-5 min-h-96 p-2' : 
               'grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 min-h-96 p-2'">
          
          <div v-for="(file) in displayedFiles" :key="file._id" class="relative group" :class="{ 'selected-file-highlight': file._id === selectItem }">

            <div v-if="file.mimetype === 'folder'"
            :class="'folder-' + file._id"
            draggable="true"
            @dragstart.stop="handleDragStart(file, $event)"
            @dragend.stop="handleDragEnd"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.stop="handleFileDrop($event, file.path)"
            :data-item="file.path"
            :ref="`dropTarget-${file.path}`"
            class="bg-white rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-300 group" 
            >
                <div class="folder-content"
                @contextmenu.stop="onContextMenu($event, file.name, file.name, file._id, file.count)"
                @dblclick.stop="openFolder(file.path)"
                >
                  <!-- Folder thumbnail area with same aspect ratio as files -->
                  <div class="aspect-square relative overflow-hidden flex items-center justify-center"
                       :class="file.share ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-yellow-100 to-yellow-200'">
                    <font-awesome-icon 
                      :icon="['fas', 'folder']" 
                      :class="file.share ? 'text-blue-500' : 'text-yellow-500'"
                      class="text-6xl drop-shadow-sm group-hover:scale-105 transition-transform duration-200" 
                    />
                    
                    <div class="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                      {{file.count}}
                    </div>
                    <!-- Hover overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <font-awesome-icon 
                        :icon="['fas', 'folder-open']" 
                        :class="file.share ? 'text-blue-600' : 'text-yellow-600'"
                        class="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                      />
                    </div>
                  </div>

                  <!-- File info section (same as files) -->
                  <div class="p-3 bg-white border-t border-gray-100">
                    <!-- Flexbox Layout: Icon | Folder Name | Share Status -->
                    <div class="flex items-center gap-2 mb-2">
                      <!-- Folder Icon (Left) -->
                      <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        <font-awesome-icon 
                          :icon="['fas', 'folder']" 
                          :class="file.share ? 'text-blue-500' : 'text-yellow-500'"
                          class="text-sm" 
                        />
                      </div>
                      
                      <!-- Folder Name (Center - grows to fill space) -->
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-semibold text-gray-900 truncate" :title="file.name">
                          {{file.name}}
                        </h4>
                      </div>
                      
                      <!-- Share Status (Right) -->
                      <div class="flex-shrink-0 flex items-center justify-center">
                        <div v-if="file.share" class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">
                          <font-awesome-icon :icon="['fas', 'share-alt']" class="text-xs"/>
                        </div>
                      </div>
                    </div>
                    
                    <!-- File Size and Count -->
                    <div class="border-t border-gray-100 pt-2">
                      <p class="text-xs text-gray-600 font-medium">{{ this.formatBytes(file.size) }}</p>
                      <!-- <p class="text-xs text-gray-500">{{ file.count }} ไฟล์</p> -->
                    </div>
                  </div>
                </div>
            </div>

            <div v-if="file.mimetype!='folder'"
            draggable="true"
            @dragstart.stop="handleDragStart(file, $event)"
            @dragend.stop="handleDragEnd"
            :data-item="file._id"
            :data-file-id="file._id"
            :ref="`draggableItem-${file._id}`"
            class="bg-white rounded-xl transition-all duration-200 overflow-hidden cursor-pointer border-2 transition-colors group"
            :class="{ 'border-blue-500 bg-blue-50': isFileSelected(file._id), 'border-gray-200 hover:border-blue-300': !isFileSelected(file._id) }"
            >
              <!-- Multi-select checkbox -->
              <div class="absolute top-2 left-2 z-10">
                <input 
                  type="checkbox" 
                  :checked="isFileSelected(file._id)"
                  @click.stop="toggleFileSelection(file._id, $event)"
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  :class="{ 'opacity-100': isMultiSelectMode || isFileSelected(file._id), 'opacity-0 group-hover:opacity-100': !isMultiSelectMode && !isFileSelected(file._id) }"
                />
              </div>
              
              <div v-if="file.type === 'image' || (file.mimetype && file.mimetype.startsWith('image/')) || (file.name && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(file.name.split('.').pop()?.toLowerCase()))" @contextmenu.stop="onFileContextMenu($event, file.name, file.name, file._id, file.original)" @dblclick.stop="onDoubleClick(file.name)" @click.stop="file._id && handleFileClick(file._id, $event)" class="relative">
                
                <div class="aspect-square bg-gray-200 relative overflow-hidden">
                  
                  <template v-if="getThumbnailSource(file) && !imageLoadErrors.has(file.name)">
                    <img 
                      :src="getThumbnailSource(file)" 
                      :alt="file.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      style="image-rendering: -webkit-optimize-contrast;"
                      @load="handleImageLoad(file.name)"
                      @error="handleImageError(file.name, $event)"
                    />
                    
                    <!-- Loading indicator for thumbnailUrl -->
                    <div v-if="file.thumbnailUrl && !file.thumbnailLoaded && !file.thumbnailError" 
                         class="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 text-xs">
                      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin" />
                    </div>
                    
                    <!-- Hover overlay เฉพาะเมื่อรูปแสดงได้ -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <font-awesome-icon :icon="['fas', 'eye']" class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </template>
                  <template v-else>
                    <!-- Fallback เมื่อไม่มี thumbnail หรือโหลดไม่ได้ -->
                    <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                      <font-awesome-icon :icon="['fas', 'image']" class="text-gray-400 text-4xl mb-2"/>
                      <div class="flex flex-col space-y-1">
                        <button 
                          @click.stop="regenerateThumbnail(file)"
                          class="text-xs text-green-500 hover:text-green-700 underline">
                          สร้างใหม่
                        </button>
                      </div>
                    </div>
                    
                    <!-- Hover overlay สำหรับ fallback -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <font-awesome-icon :icon="['fas', 'eye']" class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </template>
                </div>

                <button type="button" class="absolute inset-0 focus:outline-none">
                  <span class="sr-only">View details for {{file.name}}</span>
                </button>
              </div>

              <div v-if="file.type=='media'" @contextmenu.stop="onFileContextMenu($event, file.name, file.name, file._id, file.original, file.duration)" @dblclick.stop="onDoubleClick(file.name)" @click.stop="file._id && handleFileClick(file._id, $event)" class="relative">
                <div class="aspect-square bg-gray-200 relative overflow-hidden">
                  <template v-if="getThumbnailSource(file)">
                    <!-- เพิ่ม debug ใน console -->
                    {{ debugVideoThumbnailCondition(file) }}
                    <img 
                      :src="getThumbnailSource(file)" 
                      :alt="file.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    <!-- Loading indicator for thumbnailUrl -->
                    <div v-if="file.thumbnailUrl && !file.thumbnailLoaded && !file.thumbnailError" 
                         class="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 text-xs">
                      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin" />
                    </div>
                    
                    <!-- Debug info เปิดเพื่อดูขนาด thumbnail จริง -->
                    <div class="absolute bottom-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1">
                      {{ Math.round(file.thumbnail.length * 0.75 / 1024) }}KB
                    </div>
                    
                    <!-- Status badges -->
                    <div class="absolute top-2 left-2 flex flex-col space-y-1">
                      <div v-if="file?.stream" class="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center">
                        <font-awesome-icon :icon="['fas', 'play-circle']" class="mr-1" />
                        Stream
                      </div>
                      <div v-if="file?.transcode" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                        <font-awesome-icon :icon="['fas', 'video']" class="mr-1" />
                        {{ Object.keys(file.transcode).length }} ความละเอียด
                      </div>
                    </div>

                    <!-- Type indicator overlay -->
                    <div class="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5">
                      <font-awesome-icon 
                        :icon="isVideoFile(file) ? ['fas', 'play-circle'] : ['fas', 'volume-up']" 
                        class="text-white text-xs" 
                      />
                    </div>

                    <!-- Play overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <font-awesome-icon :icon="['fas', 'play-circle']" class="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </template>
                  <template v-else>
                    <!-- Debug การแสดง fallback -->
                    {{ debugVideoThumbnailCondition(file) }}
                    <div class="w-full h-full flex flex-col items-center justify-center bg-gray-200 relative">
                      <font-awesome-icon 
                        :icon="isVideoFile(file) ? ['fas', 'file-video'] : ['fas', 'file-audio']" 
                        class="text-gray-400 text-4xl mb-2" 
                      />
                      
                      <!-- ข้อความแสดงสถานะ -->
                      <div class="text-xs text-gray-500 text-center px-2">
                        <div v-if="!file.thumbnail">
                          No Thumbnail Data
                        </div>
                        <div v-else-if="file.thumbnail.length <= 100">
                          Thumbnail Too Small ({{ file.thumbnail.length }} chars)
                        </div>
                        <div v-else>
                          Loading...
                        </div>
                        
                        <!-- Debug info -->
                        <div v-if="file.thumbnail" class="text-xs mt-1 text-blue-600">
                          Size: {{ Math.round(file.thumbnail.length * 0.75 / 1024) }}KB
                        </div>
                        
                        <!-- ปุ่มสร้าง thumbnail ใหม่ -->
                        <button 
                          v-if="!isReadOnlyMode"
                          @click.stop="regenerateThumbnail(file)"
                          class="text-xs text-blue-500 hover:text-blue-700 underline mt-1">
                          สร้างใหม่
                        </button>
                      </div>
                      
                      <!-- Status badges for videos without thumbnails -->
                      <div class="absolute top-2 left-2 flex flex-col space-y-1">
                        <div v-if="file?.stream" class="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center">
                          <font-awesome-icon :icon="['fas', 'play-circle']" class="mr-1" />
                          Stream
                        </div>
                        <div v-if="file?.transcode" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                          <font-awesome-icon :icon="['fas', 'video']" class="mr-1" />
                          {{ Object.keys(file.transcode).length }} ความละเอียด
                        </div>
                      </div>
                      
                      <!-- Type indicator overlay -->
                      <div class="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5">
                        <font-awesome-icon 
                          :icon="isVideoFile(file) ? ['fas', 'play-circle'] : ['fas', 'volume-up']" 
                          class="text-white text-xs" 
                        />
                      </div>
                    </div>
                  </template>
                </div>
                <button type="button" class="absolute inset-0 focus:outline-none">
                  <span class="sr-only">View details for {{file.name}}</span>
                </button>
              </div>

              <!-- Document/Other Files (เฉพาะไฟล์ที่ไม่ใช่ image และไม่ใช่ media) -->
              <div v-else-if="file.type !== 'image' && file.type !== 'media'" @contextmenu.stop="onFileContextMenu($event, file.name, file.name, file._id, file.original)" @dblclick.stop="onDoubleClick(file.name)" @click.stop="file._id && handleFileClick(file._id, $event)" class="relative">
                <div class="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  <font-awesome-icon :icon="getFileTypeIcon(file)" class="text-gray-400 text-5xl"/>
                  
                  <!-- Hover overlay -->
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', 'eye']" class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                <button type="button" class="absolute inset-0 focus:outline-none">
                  <span class="sr-only">View details for {{file.name}}</span>
                </button>
              </div>
            
              <!-- File info section -->
              <div class="p-3 bg-white">
                <!-- Flexbox Layout: Icon | File Name | Share Status -->
                <div class="flex items-center gap-2 mb-2">
                  <!-- File Type Icon (Left) -->
                  <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <font-awesome-icon :icon="getFileTypeIcon(file)" class="text-gray-500 text-sm"/>
                  </div>
                  
                  <!-- File Name (Center - grows to fill space) -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate" :title="file.name">{{ file.name }}</h4>
                  </div>
                  
                  <!-- Share Status (Right) -->
                  <div class="flex-shrink-0 flex items-center justify-center">
                    <div v-if="file.share" class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">
                      <font-awesome-icon :icon="['fas', 'share-alt']" class="text-xs"/>
                    </div>
                  </div>
                </div>
                
                <!-- File Size -->
                <div class="border-t border-gray-100 pt-2">
                  <p class="text-xs text-gray-600 font-medium">{{ this.formatBytes(file.size) }}</p>
                </div>
                
                <!-- Select button for popup mode -->
                <div v-if="Mode === 'popup'" class="mt-2">
                  <!-- ปุ่มเลือกไฟล์สำหรับวิดีโอที่มี transcode -->
                  <template v-if="hasVideoTranscode(file)">
                    <button 
                      v-if="isAllowedFile(file.name)"
                      @click.stop="showVideoResolutionSelector(file)"
                      class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm"
                    >
                      <font-awesome-icon :icon="['fas', 'video']" class="mr-1 text-xs"/>
                      เลือกความละเอียด
                    </button>
                  </template>
                  <!-- ปุ่มเลือกไฟล์ปกติ -->
                  <template v-else>
                    <button 
                      v-if="isAllowedFile(file.name)"
                      @click.stop="selectFileFunc(file, file?.duration, file?.thumbnail)"
                      class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm"
                    >
                      <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                      เลือกไฟล์นี้
                    </button>
                  </template>
                  <!-- ปุ่มไฟล์ไม่อนุญาต -->
                  <button 
                    v-if="!isAllowedFile(file.name)"
                    disabled
                    class="w-full inline-flex items-center justify-center px-3 py-1.5 bg-gray-300 text-gray-500 rounded-md text-xs font-medium cursor-not-allowed"
                  >
                    <font-awesome-icon :icon="['fas', 'ban']" class="mr-1 text-xs"/>
                    ไม่อนุญาต
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          <!-- Additional empty slots for context menu in grid layout -->
          <div v-for="n in 6" :key="'empty-' + n" 
               class="min-h-24 cursor-pointer" 
               @contextmenu="onContextDesktopMenu"></div>
        </div>

        <!-- List Layout -->
        <div v-else-if="layout === 'list' && displayedFiles.length > 0" 
             class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
             @contextmenu="onContextDesktopMenu">
          <!-- Header -->
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div class="grid gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                 :style="Mode === 'popup' ? 'grid-template-columns: 2rem 20rem 6rem 5rem 7rem 7rem;' : 'grid-template-columns: 2rem 25rem 8rem 6rem 8rem;'">
              <div class="flex items-center justify-center">
                <input 
                  type="checkbox" 
                  :checked="selectedFiles.size > 0 && selectedFiles.size === fileListing.filter(f => f.mimetype !== 'folder').length"
                  @change="$event.target.checked ? selectAllFiles() : clearSelection()"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div class="flex items-center">
                <span>ชื่อไฟล์</span>
              </div>
              <div class="flex items-center">ประเภท</div>
              <div class="flex items-center">ขนาด</div>
              <div class="flex items-center">วันที่แก้ไข</div>
              <div v-if="Mode === 'popup'" class="flex items-center">การดำเนินการ</div>
            </div>
          </div>

          <!-- File List -->
          <div class="divide-y divide-gray-100 overflow-y-auto pb-8" style="max-height: calc(100vh - 350px);">
            <div v-for="(file) in displayedFiles" :key="file._id" 
                class="group hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                :class="{ 'bg-blue-50 border-l-4 border-blue-500': file._id === selectItem }">
              
              <div v-if="file.mimetype === 'folder'"
                   draggable="true"
                   @dragstart.stop="handleDragStart(file, $event)"
                   @dragend.stop="handleDragEnd"
                   @dragover.prevent="handleDragOver"
                   @dragleave.prevent="handleDragLeave"
                   @drop.stop="handleFileDrop($event, file.path)"
                   @contextmenu.stop="onContextMenu($event, file.name, file.name, file._id, file.count)"
                   @dblclick.stop="openFolder(file.path)"
                   :data-item="file.path"
                   :ref="`dropTarget-${file.path}`"
                   class="px-4 py-3">
                <div class="grid gap-4 items-center"
                     :style="Mode === 'popup' ? 'grid-template-columns: 2rem 20rem 6rem 5rem 7rem 7rem;' : 'grid-template-columns: 2rem 25rem 8rem 6rem 8rem;'">
                  <!-- Checkbox (disabled for folders) -->
                  <div class="flex items-center justify-center">
                    <div class="w-4 h-4"></div>
                  </div>
                  
                  <!-- Folder Info -->
                  <div class="flex items-center space-x-3 min-w-0">
                    <div class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                         :class="file.share ? 'bg-blue-100' : 'bg-yellow-100'">
                      <font-awesome-icon 
                        :icon="['fas', 'folder']" 
                        :class="file.share ? 'text-blue-600' : 'text-yellow-600'"
                        class="text-sm"
                      />
                    </div>
                    
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150 truncate" :title="file.name">
                          {{file.name}}
                        </p>
                        <!-- Share Badge -->
                        <span v-if="file.share" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                          <font-awesome-icon :icon="['fas', 'share-alt']" class="mr-1 text-xs"/>
                          แชร์
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5">{{file.count}} ไฟล์</p>
                    </div>
                  </div>
                  
                  <!-- Type -->
                  <div>
                    <span class="text-sm text-gray-600">{{ getFileTypeDisplay(file) }}</span>
                  </div>
                  
                  <!-- Size -->
                  <div>
                    <span class="text-sm text-gray-600">{{ formatBytes(file.size) }}</span>
                  </div>
                  
                  <!-- Date -->
                  <div>
                    <span class="text-sm text-gray-500">{{ formatDate(file.createdAt) }}</span>
                  </div>
                  
                  <!-- Action (Popup mode only) -->
                  <div v-if="Mode === 'popup'">
                    <button 
                      v-if="isAllowedFile(file.name)"
                      @click.stop="selectFileFunc(file, file?.duration, file?.thumbnail)"
                      class="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-150"
                    >
                      <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                      เลือก
                    </button>
                    <button 
                      v-else
                      disabled
                      class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 rounded-md text-xs font-medium cursor-not-allowed"
                    >
                      <font-awesome-icon :icon="['fas', 'ban']" class="mr-1 text-xs"/>
                      ไม่อนุญาต
                    </button>
                  </div>
                </div>
              </div>

              <div v-else
                   draggable="true"
                   @dragstart.stop="handleDragStart(file, $event)"
                   @dragend.stop="handleDragEnd"
                   @contextmenu.stop="onFileContextMenu($event, file.name, file.name, file._id, file.original)"
                   @click.stop="file._id && handleFileClick(file._id, $event)"
                   @dblclick.prevent.stop="onDoubleClick(file.name)"
                   :data-item="file._id"
                   :data-file-id="file._id"
                   :ref="`draggableItem-${file._id}`"
                   :class="{ 'bg-blue-50 border-l-4 border-blue-500': isFileSelected(file._id) }"
                   class="px-4 py-3 cursor-pointer"
                   title="ดับเบิลคลิกเพื่อดูตัวอย่าง">
                <div class="grid gap-4 items-center pointer-events-none"
                     :style="Mode === 'popup' ? 'grid-template-columns: 2rem 20rem 6rem 5rem 7rem 7rem;' : 'grid-template-columns: 2rem 25rem 8rem 6rem 8rem;'">
                  <!-- Checkbox -->
                  <div class="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      :checked="isFileSelected(file._id)"
                      @click.stop
                      @change="toggleFileSelection(file._id, $event)"
                      class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-auto"
                    />
                  </div>
                  
                  <!-- File Info -->
                  <div class="flex items-center space-x-3 min-w-0">
                    <!-- Thumbnail/Icon -->
                    <div class="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <template v-if="file.type === 'image'">
                        <template v-if="file.thumbnail && !imageLoadErrors.has(file.name)">
                          <img 
                            :src="file.thumbnail" 
                            :alt="file.name"
                            class="w-full h-full object-cover"
                            @load="handleImageLoad(file.name)"
                            @error="handleImageError(file.name, $event)"
                          />
                        </template>
                        <template v-else>
                          <font-awesome-icon :icon="['fas', 'image']" class="text-gray-400 text-xs"/>
                        </template>
                      </template>
                      <template v-else-if="file.type === 'media'">
                        <template v-if="file.thumbnail && !imageLoadErrors.has(file.name)">
                          <img 
                            :src="file.thumbnail" 
                            :alt="file.name"
                            class="w-full h-full object-cover"
                            @load="handleImageLoad(file.name)"
                            @error="handleImageError(file.name, $event)"
                          />
                        </template>
                        <template v-else>
                          <font-awesome-icon 
                            :icon="isVideoFile(file) ? ['fas', 'file-video'] : ['fas', 'file-audio']" 
                            class="text-red-500 text-xs"
                          />
                        </template>
                      </template>
                      <template v-else>
                        <font-awesome-icon 
                          :icon="getFileTypeIcon(file)" 
                          :class="getDocumentIconColor(getNewFileExtension(file.name))"
                          class="text-xs"/>
                      </template>
                    </div>
                    
                    <!-- File Name and Info -->
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150 truncate" :title="file.name">
                          <span>{{ getFileName(file.name) }}</span>
                          <span class="text-gray-500 font-normal">{{ getFileExtension(file.name) }}</span>
                        </p>
                      </div>
                      <div class="flex items-center space-x-2 mt-0.5">
                        <!-- Badges -->
                        <template v-if="file.share">
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            <font-awesome-icon :icon="['fas', 'share-alt']" class="w-2.5 h-2.5 mr-1"/>
                            แชร์
                          </span>
                        </template>
                        <template v-if="file.stream">
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            <font-awesome-icon :icon="['fas', 'play-circle']" class="w-2.5 h-2.5 mr-1"/>
                            Stream
                          </span>
                        </template>
                        <template v-if="file.type === 'media' && file.duration">
                          <span class="text-xs text-gray-500">{{ formatDuration(file.duration) }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Type -->
                  <div>
                    <span class="text-sm text-gray-600">{{ getFileTypeDisplay(file) }}</span>
                  </div>
                  
                  <!-- Size -->
                  <div>
                    <span class="text-sm text-gray-600">{{ formatBytes(file.size) }}</span>
                  </div>
                  
                  <!-- Date -->
                  <div>
                    <span class="text-sm text-gray-500">{{ formatDate(file.createdAt) }}</span>
                  </div>
                  
                  <!-- Action (Popup mode only) -->
                  <div v-if="Mode === 'popup'">
                    <!-- ปุ่มเลือกไฟล์สำหรับวิดีโอที่มี transcode -->
                    <template v-if="hasVideoTranscode(file)">
                      <button 
                        v-if="isAllowedFile(file.name)"
                        @click.stop="showVideoResolutionSelector(file)"
                        class="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors duration-150"
                      >
                        <font-awesome-icon :icon="['fas', 'video']" class="mr-1 text-xs"/>
                        เลือกความละเอียด
                      </button>
                    </template>
                    <!-- ปุ่มเลือกไฟล์ปกติ -->
                    <template v-else>
                      <button 
                        v-if="isAllowedFile(file.name)"
                        @click.stop="selectFileFunc(file, file?.duration, file?.thumbnail)"
                        class="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-150"
                      >
                        <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                        เลือก
                      </button>
                    </template>
                    <!-- ปุ่มไฟล์ไม่อนุญาต -->
                    <button 
                      v-if="!isAllowedFile(file.name)"
                      disabled
                      class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 rounded-md text-xs font-medium cursor-not-allowed"
                    >
                      <font-awesome-icon :icon="['fas', 'ban']" class="mr-1 text-xs"/>
                      ไม่อนุญาต
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Sidebar Overlay -->
  <div 
    v-if="showMobileSidebar" 
    class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
    @click="toggleMobileSidebar"
  >
    <div 
      class="w-64 h-full bg-white transform transition-transform duration-300"
      @click.stop
    >
      <!-- Mobile Sidebar Content (same as desktop sidebar) -->
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h1 class="text-lg font-semibold text-gray-900">{{ PageName }}</h1>
          <button 
            @click="toggleMobileSidebar"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Mobile Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ไฟล์ทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ fileListing.length }}</span>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ประเภทไฟล์</h3>
          <nav class="space-y-1">
            <button 
              v-for="filterType in [
                { value: 'all', label: 'ไฟล์ทั้งหมด', icon: 'fas fa-th-large' },
                { value: 'folder', label: 'โฟลเดอร์', icon: 'fas fa-folder' },
                { value: 'image', label: 'รูปภาพ', icon: 'fas fa-image' },
                { value: 'media', label: 'วิดีโอ', icon: 'fas fa-video' },
                { value: 'document', label: 'เอกสาร', icon: 'fas fa-file-alt' }
              ]" 
              :key="filterType.value"
              @click="filterByType(filterType.value); toggleMobileSidebar()" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium': fileTypeFilter === filterType.value,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': fileTypeFilter !== filterType.value
              }"
            >
              <i :class="filterType.icon" class="text-sm w-4"></i>
              <span class="flex-1 text-left">{{ filterType.label }}</span>
              <span 
                v-if="getFilterCount(filterType.value) > 0" 
                class="px-2 py-1 text-xs rounded-full"
                :class="{ 
                  'bg-blue-200 text-blue-800': fileTypeFilter === filterType.value,
                  'bg-gray-200 text-gray-600': fileTypeFilter !== filterType.value
                }"
              >
                {{ getFilterCount(filterType.value) }}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ... existing modals and components ... -->

<CreateFolder class="z-[99999]"
v-if="createFolderModal" 
:isWindowsOpen="true" 
@create-folder-trigger="createFolderTrigger" 
@create-folder-event="createFolder"/>

<RenameFolder class="z-[99999]"
v-if="RenameFolderModal" 
:isWindowsOpen="true" 
:renameTriggerObj="this.renameTriggerObj" 
:renameTriggerId="this.renameTriggerId"
:oldname="this.oldname" 
@rename-folder-trigger="RenameFolderTrigger" 
@rename-folder-event="RenameFolder"/>

<!-- Video Trimmer Modal -->
<VideoTrimmer 
  :isOpen="showVideoTrimmer"
  :file="videoTrimmerFile"
  :fileUrl="videoTrimmerUrl"
  @close="showVideoTrimmer = false; videoTrimmerFile = null; videoTrimmerUrl = ''"
  @trimmed="onVideoTrimmed"
/>

<!-- Video Subtitle Modal -->
<VideoSubtitle 
  :isOpen="showVideoSubtitle"
  :file="videoSubtitleFile"
  :fileUrl="videoSubtitleUrl"
  @close="showVideoSubtitle = false; videoSubtitleFile = null; videoSubtitleUrl = ''"
  @subtitled="onVideoSubtitled"
/>

<!-- Screen Recorder Modal -->
<ScreenRecorder 
  v-if="showScreenRecorder"
  :isOpen="showScreenRecorder"
  @close="closeScreenRecorder"
  @recorded="onScreenRecorded"
/>

<!-- Video Resolution Selection Modal -->
<div v-if="showResolutionSelector" class="fixed inset-0 z-50 overflow-y-auto">
  <div 
    class="fixed inset-0 bg-black/40"
    @click="closeResolutionSelector"
  ></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div 
      class="relative w-full max-w-lg bg-white rounded-lg shadow-lg"
      @click.stop
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'video']" class="text-sm"/>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">เลือกความละเอียด</h3>
              <p class="text-xs text-gray-500">{{ selectedFile?.name }}</p>
            </div>
          </div>
          <button 
            @click="closeResolutionSelector"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <font-awesome-icon :icon="['fas', 'times']"/>
          </button>
        </div>
      </div>
      
      <!-- Options -->
      <div class="p-4 space-y-3">
        <!-- Original -->
        <div class="mb-4">
          <button 
            @click="selectVideoWithResolution('original')"
            class="w-full p-3 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-300 hover:bg-blue-100 transition-colors duration-200"
          >
            <div class="flex items-center justify-between mb-2">
              <!-- Column 1: Thumbnail + Original Label -->
              <div class="flex items-center space-x-3">
                <!-- Video Thumbnail -->
                <div class="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <template v-if="selectedFile?.thumbnailUrl">
                    <img 
                      :src="selectedFile.thumbnailUrl" 
                      :alt="selectedFile.name"
                      class="w-full h-full object-cover"
                    />
                  </template>
                  <template v-else>
                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                      <font-awesome-icon :icon="['fas', 'play-circle']" class="text-gray-400 text-xs"/>
                    </div>
                  </template>
                </div>
                <div class="text-left">
                  <div class="font-bold text-gray-900">ต้นฉบับ (Original)</div>
                </div>
              </div>
              
              <!-- Column 2: File Size -->
              <div class="text-center">
                <div class="text-sm text-gray-600">
                  {{ transcodeFileSizes['original'] ? formatBytes(transcodeFileSizes['original']) : formatBytes(selectedFile?.size || 0) }}
                </div>
              </div>
              
              <!-- Column 3: Best Badge -->
              <div class="text-right">
                <div class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  BEST
                </div>
              </div>
            </div>
            <!-- Divider -->
            <div class="border-t border-gray-200 my-2"></div>
            <!-- Original Description -->
            <div class="text-xs text-gray-500 text-left">
              💡 คุณภาพสูงสุด แต่ใช้พื้นที่มากที่สุด
            </div>
          </button>
        </div>

        <!-- Transcode Options Grid -->
        <div class="space-y-1">
          <!-- HLS Stream Option (ถ้ามี transcode.stream) -->
          <div v-if="selectedFile.transcode && selectedFile.transcode.stream" class="mb-2">
            <button 
              @click="selectVideoWithResolution('stream')"
              class="w-full p-3 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-300 hover:bg-green-100 transition-colors duration-200"
            >
              <div class="flex items-center justify-between mb-2">
                <!-- Column 1: Thumbnail + Stream Label -->
                <div class="flex items-center space-x-3">
                  <!-- Video Thumbnail -->
                  <div class="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <template v-if="selectedFile?.thumbnailUrl">
                      <img 
                        :src="selectedFile.thumbnailUrl" 
                        :alt="selectedFile.name"
                        class="w-full h-full object-cover"
                      />
                    </template>
                    <template v-else>
                      <div class="w-full h-full flex items-center justify-center bg-gray-100">
                        <font-awesome-icon :icon="['fas', 'play-circle']" class="text-gray-400 text-xs"/>
                      </div>
                    </template>
                  </div>
                  <div class="text-left">
                    <div class="font-bold text-gray-900">HLS</div>
                  </div>
                </div>
                
                <!-- Column 2: Adaptive Quality -->
                <div class="text-center">
                  <div class="text-sm text-green-600 font-medium">
                    อัตโนมัติ
                  </div>
                </div>
                
                <!-- Column 3: HLS Badge -->
                <div class="text-right">
                  <div class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    ADAPTIVE
                  </div>
                </div>
              </div>
              <!-- Divider -->
              <div class="border-t border-gray-200 my-2"></div>
              <!-- HLS Description -->
              <div class="text-xs text-gray-500 text-left">
                🎯 ปรับความละเอียดอัตโนมัติตามสัญญาณอินเทอร์เน็ต
              </div>
            </button>
          </div>

          <div v-for="resolution in Object.keys(selectedFile.transcode || {}).filter(key => key !== 'original' && key !== 'stream').sort((a, b) => {
            const order = ['240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
            return order.indexOf(a) - order.indexOf(b);
          })" :key="resolution">
            <button 
              @click="selectVideoWithResolution(resolution)"
              :disabled="!selectedFile.transcode[resolution] || typeof selectedFile.transcode[resolution] !== 'string' || !selectedFile.transcode[resolution].startsWith('http')"
              :class="[
                'w-full p-3 border rounded-lg transition-colors duration-200',
                selectedFile.transcode[resolution] && typeof selectedFile.transcode[resolution] === 'string' && selectedFile.transcode[resolution].startsWith('http')
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white cursor-pointer' 
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <!-- Column 1: Thumbnail + Resolution Name -->
                <div class="flex items-center space-x-3">
                  <!-- Video Thumbnail -->
                  <div class="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <template v-if="selectedFile?.thumbnailUrl">
                      <img 
                        :src="selectedFile.thumbnailUrl" 
                        :alt="selectedFile.name"
                        class="w-full h-full object-cover"
                      />
                    </template>
                    <template v-else>
                      <div class="w-full h-full flex items-center justify-center bg-gray-100">
                        <font-awesome-icon :icon="['fas', 'play-circle']" class="text-gray-400 text-xs"/>
                      </div>
                    </template>
                  </div>
                  <div class="text-left">
                    <div class="font-bold text-gray-900">{{ resolution.toUpperCase() }}</div>
                  </div>
                </div>
                
                <!-- Column 2: File Size หรือ Status -->
                <div class="text-center">
                  <div class="text-sm text-gray-600">
                    <!-- ตรวจสอบตัวเลขก่อนทุกอย่าง -->
                    <template v-if="!isNaN(selectedFile.transcode[resolution]) && typeof selectedFile.transcode[resolution] === 'number'">
                      <div class="flex flex-col items-center space-y-1">
                        <span class="text-blue-600 font-medium">กำลังแปลง {{ selectedFile.transcode[resolution] }}%</span>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                          <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                               :style="{ width: selectedFile.transcode[resolution] + '%' }"></div>
                        </div>
                      </div>
                    </template>
                    <!-- ถ้าเป็น string ที่เป็นตัวเลข (เช่น "39") -->
                    <template v-else-if="!isNaN(Number(selectedFile.transcode[resolution])) && typeof selectedFile.transcode[resolution] === 'string' && /^\d+$/.test(selectedFile.transcode[resolution])">
                      <div class="flex flex-col items-center space-y-1">
                        <span class="text-blue-600 font-medium">กำลังแปลง {{ selectedFile.transcode[resolution] }}%</span>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                          <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                               :style="{ width: selectedFile.transcode[resolution] + '%' }"></div>
                        </div>
                      </div>
                    </template>
                    <!-- ถ้าเป็น URL -->
                    <template v-else-if="selectedFile.transcode[resolution] && typeof selectedFile.transcode[resolution] === 'string' && selectedFile.transcode[resolution].startsWith('http')">
                      {{ transcodeFileSizes[resolution] ? formatBytes(transcodeFileSizes[resolution]) : 'กำลังโหลดขนาดไฟล์...' }}
                    </template>
                    <!-- ถ้าเป็น "downloading..." -->
                    <template v-else-if="selectedFile.transcode[resolution] === 'downloading...'">
                      <span class="text-orange-600 font-medium">กำลังโหลด</span>
                    </template>
                    <!-- ข้อความอื่นๆ -->
                    <template v-else-if="selectedFile.transcode[resolution] && typeof selectedFile.transcode[resolution] === 'string'">
                      <span class="text-orange-600 font-medium">{{ selectedFile.transcode[resolution] }}</span>
                    </template>
                    <!-- กรณีอื่นๆ -->
                    <template v-else>
                      <span class="text-gray-400">ไม่พร้อมใช้งาน</span>
                    </template>
                  </div>
                </div>
                
                <!-- Column 3: Savings หรือ Delete Button (แสดงเฉพาะเมื่อพร้อมใช้งานและไม่ได้กำลัง transcode) -->
                <div class="text-right flex items-center justify-end space-x-2">
                  <template v-if="selectedFile.transcode[resolution] && typeof selectedFile.transcode[resolution] === 'string' && selectedFile.transcode[resolution].startsWith('http')">
                    <!-- แสดง savings เมื่อไฟล์พร้อมใช้งาน -->
                    <div v-if="transcodeFileSizes[resolution] && transcodeFileSizes['original']" 
                         class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ประหยัด {{ Math.round((1 - transcodeFileSizes[resolution] / transcodeFileSizes['original']) * 100) }}%
                    </div>
                    <div v-else class="text-xs text-gray-400">-</div>
                    
                    <!-- ปุ่มลบ (แสดงเฉพาะเมื่อไฟล์พร้อมใช้งานและไม่ได้กำลัง transcode) -->
                    <button 
                      @click.stop="deleteTranscodeResolution(resolution)"
                      class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      :title="'ลบความละเอียด ' + resolution.toUpperCase()"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="text-xs"/>
                    </button>
                  </template>
                  <template v-else-if="typeof selectedFile.transcode[resolution] === 'number'">
                    <!-- ซ่อนปุ่มลบเมื่อกำลัง transcode (แสดงแค่ข้อความ "กำลังแปลง") -->
                    <div class="text-xs text-orange-500">กำลังแปลง...</div>
                  </template>
                  <template v-else>
                    <!-- ซ่อนทั้ง savings และปุ่มลบเมื่อไฟล์ยังไม่พร้อม -->
                    <div class="text-xs text-gray-400">-</div>
                  </template>
                </div>
              </div>
              <!-- Divider -->
              <div class="border-t border-gray-200 my-1"></div>
              <!-- Resolution Description -->
              <div class="text-xs text-gray-500 text-left">
                {{
                  resolution === '240p' ? 'เหมาะสำหรับมือถือและเครือข่ายช้า' :
                  resolution === '360p' ? 'เหมาะสำหรับอุปกรณ์พกพา' :
                  resolution === '480p' ? 'คุณภาพมาตรฐานสำหรับเดสก์ท็อป' :
                  resolution === '720p' ? 'คุณภาพ HD สำหรับหน้าจอใหญ่' :
                  resolution === '1080p' ? 'คุณภาพ Full HD สำหรับทีวี' :
                  resolution === '1440p' ? 'คุณภาพ 2K สำหรับหน้าจอคุณภาพสูง' :
                  resolution === '2160p' ? 'คุณภาพ 4K สำหรับหน้าจอ Ultra HD' : '📼 คุณภาพมาตรฐาน'
                }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex justify-between items-center">
          <div class="text-xs text-gray-500">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1"/>
            ความละเอียดสูง = คุณภาพดี แต่ใหญ่กว่า
          </div>
          <button 
            @click="closeResolutionSelector"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Image Quality Modal -->
<div v-if="isResizeModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
  <div 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm"
    @click="isResizeModalOpen = false"
  ></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div 
      class="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">ปรับคุณภาพรูปภาพ</h3>
          <button 
            @click="isResizeModalOpen = false"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-sm"/>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <!-- Settings Area -->
        <div class="space-y-4">
          <!-- Quick select buttons -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">เลือกคุณภาพด่วน</label>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="quality in [10, 30, 50, 80]" 
                :key="quality"
                @click="selectedImageQuality = quality/100"
                class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                :class="{
                  'bg-blue-500 text-white shadow-sm': selectedImageQuality === quality/100,
                  'bg-gray-100 text-gray-700 hover:bg-gray-200': selectedImageQuality !== quality/100
                }">
                {{ quality }}%
              </button>
            </div>
          </div>

          <!-- Quality slider -->
          <div>
            <label for="quality" class="block text-sm font-medium text-gray-700 mb-2">ปรับแต่งคุณภาพ</label>
            <div class="flex items-center space-x-4">
              <input 
                type="range" 
                v-model="selectedImageQuality" 
                id="quality" 
                min="0.1" 
                max="1" 
                step="0.01" 
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              >
              <div class="min-w-[4rem] text-right">
                <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {{ (selectedImageQuality * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        <div class="text-xs text-gray-600">
          <span>คุณภาพ: {{ (selectedImageQuality * 100).toFixed(0) }}%</span>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="isResizeModalOpen = false"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="mr-1 text-xs"/>
            ยกเลิก
          </button>
          <button 
            @click="handleResizeImage"
            class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'magic']" class="mr-1 text-xs"/>
            ปรับคุณภาพ
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Add Streaming File Modal -->
<div v-if="isModalVisible" class="fixed inset-0 z-50 overflow-y-auto">
  <div 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm"
    @click="closeModal"
  ></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div 
      class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">เพิ่ม Streaming File</h3>
          <button 
            @click="closeModal"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-sm"/>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <!-- Drop Zone Style Display -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <div class="space-y-3">
            <div class="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'link']" class="text-gray-500 text-lg"/>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">เพิ่มไฟล์จาก URL ภายนอก</h4>
              <p class="text-xs text-gray-500 mt-1">กรอกชื่อไฟล์และ URL ของไฟล์ที่ต้องการเพิ่ม</p>
            </div>
          </div>
        </div>
        
        <!-- Form Fields -->
        <div class="mt-4 space-y-4">
          <!-- Name input field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">ชื่อไฟล์</label>
            <input
              v-model="fileName"
              type="text"
              id="name"
              placeholder="กรอกชื่อไฟล์"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          
          <!-- URL input field -->
          <div>
            <label for="url" class="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              v-model="fileUrl"
              type="url"
              id="url"
              placeholder="กรอก URL ของไฟล์"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        <div class="text-xs text-gray-600">
          <span v-if="fileName && fileUrl">ไฟล์พร้อมเพิ่ม</span>
          <span v-else>กรอกข้อมูลให้ครบถ้วน</span>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="closeModal"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="mr-1 text-xs"/>
            ยกเลิก
          </button>
          <button 
            @click="submitFile"
            :disabled="!fileName || !fileUrl"
            class="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="mr-1 text-xs"/>
            เพิ่มไฟล์
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- File Preview Modal -->
<div v-if="showModal" :class="Mode === 'popup' ? 'fixed inset-0 z-[60]' : 'fixed inset-0 z-50'" class="overflow-y-auto">
  <!-- Backdrop with blur effect -->
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"></div>
  
  <!-- Modal container -->
  <div class="flex min-h-full items-center justify-center p-2">
    <div class="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300"
         :class="Mode === 'popup' ? 'max-w-3xl max-h-[50vh]' : 'max-w-5xl'"
         :style="Mode === 'popup' ? { maxHeight: '50vh' } : {}">
      
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Left side - File info -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <font-awesome-icon 
                  :icon="['fas', modalContent === 'image' ? 'image' : modalContent === 'video' ? 'video' : modalContent === 'pdf' ? 'file-pdf' : 'file']" 
                  class="text-white text-sm"
                />
              </div>
              <div>
                <h3 class="text-white font-semibold text-base truncate max-w-md" :title="viewFilename">
                  {{ viewFilename }}
                </h3>
                <p class="text-gray-300 text-xs">{{ formatBytes(viewFilesize) }}</p>
              </div>
            </div>
          </div>

          <!-- Right side - Action buttons -->
          <div class="flex items-center space-x-2">
            <!-- Delete button -->
            <button 
              @click="deleteFile(viewFilename, selectItemData?._id, selectItemData?.original)" 
              type="button" 
              class="inline-flex items-center px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm">
              <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs"/>
              ลบไฟล์
            </button>

            <!-- Close button -->
            <button 
              @click="showModal = false" 
              type="button" 
              class="inline-flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 shadow-sm">
              <font-awesome-icon :icon="['fas','times']" class="text-sm"/>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content area -->
      <div class="relative bg-gray-900 flex items-center justify-center"
           :class="Mode === 'popup' ? 'min-h-[200px] max-h-[30vh]' : 'min-h-[400px]'"
           :style="Mode === 'popup' ? { maxHeight: '30vh' } : {}">
        <!-- Image preview -->
        <template v-if="modalContent === 'image'">
          <div class="w-full h-full flex items-center justify-center p-3">
            <img 
              :src="selectedFile" 
              alt="Preview" 
              :class="Mode === 'popup' ? 'max-w-full max-h-[25vh] object-contain rounded-lg shadow-2xl' : 'max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl'"
            />
          </div>
        </template>
        
        <!-- Video preview -->
        <template v-else-if="modalContent === 'video'">
          <div class="w-full h-full flex items-center justify-center p-3">
            <!-- Streaming video -->
            <template v-if="selectItemData?.stream && selectItemData?.stream?.streamId">
              <div class="relative w-full max-w-4xl">
                <!-- Stream status badge -->
                <div class="absolute top-2 left-2 z-10">
                  <div class="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full shadow-lg">
                    <div class="w-1.5 h-1.5 bg-green-300 rounded-full mr-1.5 animate-pulse"></div>
                    Stream: {{ selectItemData.stream.streamStatus }}
                  </div>
                </div>
                
                <!-- Quality selector dropdown for streaming -->
                <div class="absolute top-2 right-2 z-10 transcode-dropdown">
                  <!-- Debug button - ปุ่มชั่วคราวสำหรับทดสอบ -->
                  <button 
                    @click="manualCheckQualities"
                    class="inline-flex items-center px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded mr-2"
                    title="Debug: Check HLS Qualities"
                  >
                    🔍 Debug
                  </button>
                  
                  <div class="relative">
                    <button 
                      @click="toggleTranscodeDropdown"
                      class="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 text-xs font-medium rounded-lg shadow-lg border border-gray-200 transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas', 'video']" class="mr-1.5 text-xs"/>
                      {{ getTranscodeDisplayText(selectedTranscodeQuality) }}
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="ml-1.5 text-xs" :class="{ 'rotate-180': transcodeDropdownOpen }"/>
                    </button>
                    
                    <!-- Dropdown menu -->
                    <div v-if="transcodeDropdownOpen" class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <div class="py-1">
                        <!-- Original quality -->
                        <div 
                          class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200"
                          :class="selectedTranscodeQuality === 'original' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                        >
                          <button 
                            @click="selectTranscodeQuality('original')"
                            class="flex-1 text-left"
                          >
                            <div class="flex items-center justify-between">
                              <span class="font-medium">Original</span>
                              <span class="text-xs text-gray-500">{{ transcodeFileSizes['original'] ? formatBytes(transcodeFileSizes['original']) : 'กำลังโหลด...' }}</span>
                            </div>
                          </button>
                          <!-- ไม่มีปุ่มลบสำหรับ Original -->
                          <div class="w-6"></div>
                        </div>
                        
                        <!-- STREAM option (ถ้ามี stream UID) -->
                        <div 
                          v-if="selectItemData?.stream?.streamId || selectItemData?.transcode?.stream"
                          class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                          :class="selectedTranscodeQuality === 'STREAM' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                        >
                          <button 
                            @click="selectTranscodeQuality('STREAM')"
                            class="flex-1 text-left"
                          >
                            <div class="flex items-center justify-between pr-2">
                              <div class="flex items-center">
                                <font-awesome-icon :icon="['fas', 'cloud']" class="mr-2 text-purple-600"/>
                                <span class="font-medium">STREAM</span>
                              </div>
                              <span class="text-xs text-green-600 font-medium"><template v-if="typeof selectItemData?.stream?.streamStatus === 'number'">Processing {{ selectItemData.stream.streamStatus }}%</template><template v-else>Ready</template></span>
                            </div>
                          </button>
                          <!-- ไม่มีปุ่มลบสำหรับ STREAM -->
                          <div class="w-6"></div>
                        </div>
                        
                        <!-- Transcode qualities (ไม่รวม 'stream' key) -->
                        <template v-for="(url, quality) in Object.fromEntries(Object.entries(selectItemData.transcode || {}).filter(([key]) => key !== 'stream'))" :key="quality">
                          <div 
                            class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                            :class="selectedTranscodeQuality === quality ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                          >
                            <button 
                              @click="selectTranscodeQuality(quality)"
                              class="flex-1 text-left"
                            >
                              <div class="flex items-center justify-between pr-2">
                                <span class="font-medium">{{ quality.toUpperCase() }}</span>
                                <!-- แสดงสถานะตาม type ของข้อมูล -->
                                <template v-if="typeof selectItemData.transcode[quality] === 'number'">
                                  <span class="text-xs text-blue-600 font-medium">กำลังแปลง {{ selectItemData.transcode[quality] }}%</span>
                                </template>
                                <template v-else-if="selectItemData.transcode[quality] === 'downloading...'">
                                  <span class="text-xs text-orange-600 font-medium">กำลังโหลด</span>
                                </template>
                                <template v-else-if="typeof selectItemData.transcode[quality] === 'string' && selectItemData.transcode[quality].startsWith('http')">
                                  <span class="text-xs text-gray-500">{{ transcodeFileSizes[quality] ? formatBytes(transcodeFileSizes[quality]) : 'กำลังโหลดขนาดไฟล์...' }}</span>
                                </template>
                                <template v-else>
                                  <span class="text-xs text-orange-600 font-medium">{{ selectItemData.transcode[quality] }}</span>
                                </template>
                              </div>
                            </button>
                            <!-- ปุ่มลบ transcode (แสดงเฉพาะเมื่อไฟล์พร้อมใช้งานและไม่ได้กำลัง transcode) -->
                            <button 
                              v-if="typeof selectItemData.transcode[quality] === 'string' && selectItemData.transcode[quality].startsWith('http')"
                              @click.stop="deleteTranscode(quality)"
                              class="p-1 ml-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              title="ลบ transcode นี้"
                            >
                              <font-awesome-icon :icon="['fas', 'trash']" class="text-xs"/>
                            </button>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                
                <VideoPlayer
                  type="default"
                  @pause="processPause"
                  @loadstart="onVideoLoaded"
                  @loadedmetadata="onVideoMetadataLoaded"
                  @canplay="onVideoCanPlay"
                  @ready="onVideoReady"
                  :previewImageLink="selectItemData?.stream?.streamThumbnail"
                  :link="getSelectedVideoUrl()"
                  :isMuted="false"
                  :isControls="true"
                  :enableQualitySelector="true"
                  :autoDetectQualities="true"
                  ref="streamVideoPlayer"
                  class="w-full h-full rounded-lg overflow-hidden shadow-2xl"
                />
              </div>
            </template>
            
            <!-- Regular video -->
            <template v-else>
              <div class="relative w-full max-w-4xl">
                <!-- Video type badge -->
                <div class="absolute top-2 left-2 z-10">
                  <div class="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg">
                    <font-awesome-icon :icon="['fas', 'play']" class="mr-1.5 text-xs"/>
                    Video
                  </div>
                </div>
                
                <!-- Quality selector dropdown -->
                <div v-if="selectItemData?.transcode || selectItemData?.stream" class="absolute top-2 right-2 z-10 transcode-dropdown">
                  <div class="relative">
                    <button 
                      @click="toggleTranscodeDropdown"
                      class="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 text-xs font-medium rounded-lg shadow-lg border border-gray-200 transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas', 'video']" class="mr-1.5 text-xs"/>
                      {{ getTranscodeDisplayText(selectedTranscodeQuality) }}
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="ml-1.5 text-xs" :class="{ 'rotate-180': transcodeDropdownOpen }"/>
                    </button>
                    
                    <!-- Dropdown menu -->
                    <div v-if="transcodeDropdownOpen" class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <div class="py-1">
                        <!-- Original quality -->
                        <div 
                          class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200"
                          :class="selectedTranscodeQuality === 'original' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                        >
                          <button 
                            @click="selectTranscodeQuality('original')"
                            class="flex-1 text-left"
                          >
                            <div class="flex items-center justify-between">
                              <span class="font-medium">Original</span>
                              <span class="text-xs text-gray-500">{{ transcodeFileSizes['original'] ? formatBytes(transcodeFileSizes['original']) : 'กำลังโหลด...' }}</span>
                            </div>
                          </button>
                          <!-- ไม่มีปุ่มลบสำหรับ Original -->
                          <div class="w-6"></div>
                        </div>
                        
                        <!-- STREAM option (ถ้ามี stream UID) -->
                        <div 
                          v-if="selectItemData?.stream?.streamId || selectItemData?.transcode?.stream"
                          class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                          :class="selectedTranscodeQuality === 'STREAM' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                        >
                          <button 
                            @click="selectTranscodeQuality('STREAM')"
                            class="flex-1 text-left"
                          >
                            <div class="flex items-center justify-between pr-2">
                              <div class="flex items-center">
                                <font-awesome-icon :icon="['fas', 'cloud']" class="mr-2 text-purple-600"/>
                                <span class="font-medium">STREAM</span>
                              </div>
                              <span class="text-xs text-green-600 font-medium"><template v-if="typeof selectItemData?.stream?.streamStatus === 'number'">Processing {{ selectItemData.stream.streamStatus }}%</template><template v-else>Ready</template></span>
                            </div>
                          </button>
                          <!-- ไม่มีปุ่มลบสำหรับ STREAM -->
                          <div class="w-6"></div>
                        </div>
                        
                        <!-- Transcode qualities (ไม่รวม 'stream' key) -->
                        <template v-for="(url, quality) in Object.fromEntries(Object.entries(selectItemData.transcode || {}).filter(([key]) => key !== 'stream'))" :key="quality">
                          <div 
                            class="flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                            :class="selectedTranscodeQuality === quality ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                          >
                            <button 
                              @click="selectTranscodeQuality(quality)"
                              class="flex-1 text-left"
                            >
                              <div class="flex items-center justify-between pr-2">
                                <span class="font-medium">{{ quality.toUpperCase() }}</span>
                                <!-- แสดงสถานะตาม type ของข้อมูล -->
                                <template v-if="typeof selectItemData.transcode[quality] === 'number'">
                                  <span class="text-xs text-blue-600 font-medium">กำลังแปลง {{ selectItemData.transcode[quality] }}%</span>
                                </template>
                                <template v-else-if="selectItemData.transcode[quality] === 'downloading...'">
                                  <span class="text-xs text-orange-600 font-medium">กำลังโหลด</span>
                                </template>
                                <template v-else-if="typeof selectItemData.transcode[quality] === 'string' && selectItemData.transcode[quality].startsWith('http')">
                                  <span class="text-xs text-gray-500">{{ transcodeFileSizes[quality] ? formatBytes(transcodeFileSizes[quality]) : 'กำลังโหลดขนาดไฟล์...' }}</span>
                                </template>
                                <template v-else>
                                  <span class="text-xs text-orange-600 font-medium">{{ selectItemData.transcode[quality] }}</span>
                                </template>
                              </div>
                            </button>
                            <!-- ปุ่มลบ transcode (แสดงเฉพาะเมื่อไฟล์พร้อมใช้งานและไม่ได้กำลัง transcode) -->
                            <button 
                              v-if="typeof selectItemData.transcode[quality] === 'string' && selectItemData.transcode[quality].startsWith('http')"
                              @click.stop="deleteTranscode(quality)"
                              class="p-1 ml-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              title="ลบ transcode นี้"
                            >
                              <font-awesome-icon :icon="['fas', 'trash']" class="text-xs"/>
                            </button>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Conditional video player based on file type -->
                <template v-if="isReadyStream(selectedFile)">
                  <!-- Ready Stream video using iframe -->
                  <div class="relative w-full" style="position:relative;padding-top:56.25%;min-height:400px;">
                    <iframe 
                      :src="getReadyIframeSrc(selectedFile)" 
                      loading="lazy"
                      style="border:none;position:absolute;top:0;height:100%;width:100%;"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                      allowfullscreen="true"
                      class="rounded-lg overflow-hidden shadow-2xl"
                    />
                  </div>
                </template>
                
                <template v-else-if="isSelectedFileHLS(selectedFile)">
                  <!-- HLS/m3u8 video using vue-hls-video-player -->
                  <div class="relative w-full max-w-4xl">
                    <!-- HLS debug badge -->
                    <div class="absolute top-2 left-2 z-10">
                      <div class="inline-flex items-center px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full shadow-lg">
                        <div class="w-1.5 h-1.5 bg-purple-300 rounded-full mr-1.5 animate-pulse"></div>
                        HLS Player
                      </div>
                    </div>
                    
                    <VideoPlayer
                      type="default"
                      @pause="processPause"
                      @loadstart="onVideoLoaded"
                      @loadedmetadata="onVideoMetadataLoaded"
                      @canplay="onVideoCanPlay"
                      @ready="onVideoReady"
                      :previewImageLink="selectItemData?.thumbnail"
                      :link="selectedFile"
                      :isMuted="false"
                      :isControls="true"
                      :enableQualitySelector="true"
                      :autoDetectQualities="true"
                      ref="hlsVideoPlayer"
                      class="w-full h-full rounded-lg overflow-hidden shadow-2xl"
                      :style="Mode === 'popup' ? 'max-height: 25vh;' : 'max-height: 60vh;'"
                    />
                  </div>
                </template>
                
                <template v-else>
                  <!-- Regular MP4 video using standard HTML5 video -->
                  <div class="relative w-full max-w-4xl">
                    <!-- Regular video debug badge -->
                    <div class="absolute top-2 left-2 z-10">
                      <div class="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg">
                        <font-awesome-icon :icon="['fas', 'play']" class="mr-1.5 text-xs"/>
                        HTML5 Video
                      </div>
                    </div>
                    
                    <video 
                      ref="videoStreaming" 
                      controls 
                      crossorigin 
                      playsinline
                      class="w-full h-full rounded-lg shadow-2xl"
                      :style="Mode === 'popup' ? 'max-height: 25vh;' : 'max-height: 60vh;'">
                      <source :src="selectedFile">
                    </video>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </template>
        
        <!-- PDF preview -->
        <template v-else-if="modalContent === 'pdf'">
          <div class="w-full h-full flex items-center justify-center p-3">
            <div class="relative w-full max-w-5xl">
              <!-- PDF type badge -->
              <div class="absolute top-2 left-2 z-10">
                <div class="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full shadow-lg">
                  <font-awesome-icon :icon="['fas', 'file-pdf']" class="mr-1.5 text-xs"/>
                  PDF Document
                </div>
              </div>
              
              <!-- PDF viewer using iframe -->
              <div class="w-full bg-white rounded-lg shadow-2xl overflow-hidden" 
                   :style="Mode === 'popup' ? 'height: 25vh;' : 'height: 60vh;'">
                <iframe 
                  :src="selectedFile + '#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH'"
                  class="w-full h-full border-0"
                  type="application/pdf"
                  title="PDF Preview">
                </iframe>
              </div>
              
              <!-- PDF controls -->
              <div class="absolute bottom-2 right-2 flex items-center space-x-2">
                <a 
                  :href="selectedFile" 
                  target="_blank" 
                  class="inline-flex items-center px-2 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-md text-xs font-medium transition-all duration-200 shadow-sm border border-gray-200">
                  <font-awesome-icon :icon="['fas', 'external-link-alt']" class="mr-1 text-xs"/>
                  เปิดในแท็บใหม่
                </a>
                <a 
                  :href="selectedFile" 
                  download 
                  class="inline-flex items-center px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-all duration-200 shadow-sm">
                  <font-awesome-icon :icon="['fas', 'download']" class="mr-1 text-xs"/>
                  ดาวน์โหลด
                </a>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Footer -->
      <div class="bg-white border-t border-gray-200 px-4 py-3">
        <!-- Mobile Layout (Stacked) -->
        <div class="block lg:hidden space-y-3">
          <!-- File info row -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon 
                :icon="['fas', modalContent === 'image' ? 'image' : modalContent === 'video' ? 'video' : modalContent === 'pdf' ? 'file-pdf' : 'file']" 
                class="text-gray-600 text-lg"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 truncate" :title="viewFilename">
                {{ viewFilename }}
              </h4>
              <div class="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'hdd']" class="mr-1"/>
                  {{ formatBytes(viewFilesize) }}
                </span>
                <span v-if="modalContent === 'video' && viewFileDuration" class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'clock']" class="mr-1"/>
                  {{ formatDuration(viewFileDuration) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Badges row -->
          <div :class="Mode === 'popup' ? 'flex' : 'flex items-center justify-between'">
            <div :class="Mode === 'popup' ? 'grid grid-cols-2 gap-2 flex-1' : 'flex items-center space-x-2 flex-wrap gap-1'">
              <!-- File type badge (แสดงเฉพาะเมื่อไม่ใช่ MP4 ที่มี transcode) -->
              <div v-if="!(getFileExtension(viewFilename).toLowerCase() === '.mp4' && modalContent === 'video' && selectItemData?.transcode)"
                   class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium justify-center">
                <span>{{ getFileExtension(viewFilename).replace('.', '').toUpperCase() }}</span>
              </div>

              <!-- Stream info for videos -->
              <div v-if="modalContent === 'video' && selectItemData?.stream" 
                   class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium justify-center">
                <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                <span>Stream</span>
              </div>

              <!-- Transcode info (สำหรับ MP4 ที่มี transcode แสดงแทน file type badge) -->
              <div v-if="modalContent === 'video' && selectItemData?.transcode" 
                   class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium justify-center">
                <font-awesome-icon :icon="['fas', 'video']" class="mr-1 text-xs"/>
                <span>Transcoded</span>
              </div>
            </div>
          </div>

          <!-- Actions row -->
          <div class="flex items-center justify-between">
            <!-- Primary actions -->
            <div :class="Mode === 'popup' ? 'grid grid-cols-2 gap-2 flex-1' : 'flex items-center space-x-2'">
              <!-- Select button for popup mode -->
              <button 
                v-if="Mode === 'popup' && isAllowedFile(viewFilename)"
                @click="selectFileFunc(selectItemData, selectItemData?.duration, selectItemData?.thumbnail)"
                class="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="เลือกไฟล์นี้"
              >
                <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                เลือก
              </button>

              <!-- Download button -->
              <a 
                :href="selectedFile" 
                download 
                class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="ดาวน์โหลดไฟล์"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="mr-1 text-xs"/>
                ดาวน์โหลด
              </a>
            </div>

            <!-- Secondary actions dropdown -->
            <div class="relative mobile-actions-menu">
              <button 
                @click="showMobileActionsMenu = !showMobileActionsMenu"
                class="inline-flex items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors duration-200"
                title="เมนูเพิ่มเติม"
              >
                <font-awesome-icon :icon="['fas', 'ellipsis-h']" class="text-xs"/>
              </button>

              <!-- Dropdown menu -->
              <div v-if="showMobileActionsMenu" 
                   class="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <div class="py-1">
                  <!-- Transcode for videos -->
                  <button 
                    v-if="modalContent === 'video' && !isShareMode"
                    @click="openTranscodePanel(); showMobileActionsMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <font-awesome-icon :icon="['fas', 'cog']" class="mr-2 text-xs"/>
                    Transcode วิดีโอ
                  </button>

                  <!-- Copy link -->
                  <button 
                    @click="copyToClipboard(selectedFile); showMobileActionsMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <font-awesome-icon :icon="['fas', 'link']" class="mr-2 text-xs"/>
                    คัดลอกลิงก์
                  </button>

                  <!-- Stream management for videos -->
                  <template v-if="modalContent === 'video' && selectItemData?.stream">
                    <button 
                      @click="streamFile(selectItemData.path, selectItemData.name); showMobileActionsMenu = false"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-2 text-xs"/>
                      รีเฟรช Stream
                    </button>
                    <button 
                      @click="deleteStream(selectItemData.stream.streamId, selectItemData._id); showMobileActionsMenu = false"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="mr-2 text-xs"/>
                      ลบ Stream
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout (Single Row) -->
        <div class="hidden lg:flex lg:items-center lg:justify-between space-y-0">
          <!-- File details -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon 
                  :icon="['fas', modalContent === 'image' ? 'image' : modalContent === 'video' ? 'video' : modalContent === 'pdf' ? 'file-pdf' : 'file']" 
                  class="text-gray-600 text-lg"
                />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-900 truncate max-w-xs" :title="viewFilename">
                  {{ viewFilename }}
                </h4>
                <div class="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  <span class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'hdd']" class="mr-1"/>
                    {{ formatBytes(viewFilesize) }}
                  </span>
                  <span v-if="modalContent === 'video' && viewFileDuration" class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'clock']" class="mr-1"/>
                    {{ formatDuration(viewFileDuration) }}
                  </span>
                  <span v-if="viewFilecreate" class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'calendar']" class="mr-1"/>
                    {{ formatDate(viewFilecreate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- File actions and info -->
          <div class="flex items-center space-x-3">
            <!-- Stream info for videos -->
            <div v-if="modalContent === 'video' && selectItemData?.stream" class="flex items-center space-x-2">
              <div class="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Stream: {{ selectItemData.stream.streamStatus }}</span>
              </div>
              <button 
                @click="toggleStreamMenu"
                class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                title="จัดการ Stream"
              >
                <font-awesome-icon :icon="['fas', 'cog']" class="text-xs"/>
              </button>
              
              <!-- Stream menu dropdown -->
              <div v-if="showStreamMenu" class="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <div class="py-1">
                  <button 
                    @click="streamFile(selectItemData.path, selectItemData.name)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-2 text-xs"/>
                    รีเฟรช Stream
                  </button>
                  <button 
                    @click="deleteStream(selectItemData.stream.streamId, selectItemData._id)"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="mr-2 text-xs"/>
                    ลบ Stream
                  </button>
                </div>
              </div>
            </div>

            <!-- Transcode info and File type badges -->
            <div :class="Mode === 'popup' ? 'grid grid-cols-2 gap-2' : 'flex items-center space-x-2'">
              <!-- Transcode info (สำหรับ MP4 ที่มี transcode) -->
              <div v-if="modalContent === 'video' && selectItemData?.transcode" class="flex items-center space-x-1 justify-center">
                <div class="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  <font-awesome-icon :icon="['fas', 'video']" class="text-xs"/>
                  <span>Transcoded</span>
                </div>
              </div>

              <!-- File type badge (แสดงเฉพาะเมื่อไม่ใช่ MP4 ที่มี transcode) -->
              <div v-if="!(getFileExtension(viewFilename).toLowerCase() === '.mp4' && modalContent === 'video' && selectItemData?.transcode)"
                   class="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium justify-center">
                <span>{{ getFileExtension(viewFilename).replace('.', '').toUpperCase() }}</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div :class="Mode === 'popup' ? 'grid grid-cols-2 gap-2' : 'flex items-center space-x-2'">
              <!-- Transcode button for videos -->
              <button 
                v-if="modalContent === 'video' && !isShareMode"
                @click="openTranscodePanel()"
                class="inline-flex items-center px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="แปลงความละเอียดวิดีโอ"
              >
                <font-awesome-icon :icon="['fas', 'cog']" class="mr-1 text-xs"/>
                Transcode
              </button>
              
              <!-- Select button for popup mode -->
              <button 
                v-if="Mode === 'popup' && isAllowedFile(viewFilename)"
                @click="selectFileFunc(selectItemData, selectItemData?.duration, selectItemData?.thumbnail)"
                class="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="เลือกไฟล์นี้"
              >
                <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                เลือกไฟล์
              </button>
              
              <!-- Download button -->
              <a 
                :href="selectedFile" 
                download 
                class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="ดาวน์โหลดไฟล์"
              >
                <font-awesome-icon :icon="['fas', 'download']" class="mr-1 text-xs"/>
                ดาวน์โหลด
              </a>
              
              <!-- Share button -->
              <button 
                @click="copyToClipboard(selectedFile)"
                class="inline-flex items-center px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-sm justify-center"
                title="คัดลอกลิงก์"
              >
                <font-awesome-icon :icon="['fas', 'link']" class="mr-1 text-xs"/>
                คัดลอก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Upload Panel Modal -->
<div v-if="uploadPanel" class="fixed inset-0 z-50 overflow-y-auto">
  <div 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm"
    @click="closeUploadBox"
  ></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div 
      class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">อัพโหลดไฟล์</h3>
          <button 
            @click="closeUploadBox"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-sm"/>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <!-- File Input (Hidden) -->
        <input 
          type="file" 
          ref="files" 
          @change="handleFilesUpload" 
          multiple 
          class="hidden"
        />
        
        <!-- Drop Zone -->
        <div 
          @click="addFiles"
          class="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
        >
          <div class="space-y-3">
            <div class="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="text-gray-500 text-lg"/>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">เลือกไฟล์หรือลากไฟล์มาวาง</h4>
              <p class="text-xs text-gray-500 mt-1">คลิกเพื่อเลือกไฟล์หรือลากมาวางในพื้นที่นี้</p>
            </div>
            <button 
              type="button"
              @click="addFiles"
              class="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
            >
              <font-awesome-icon :icon="['fas', 'folder-open']" class="mr-1.5 text-xs"/>
              เลือกไฟล์
            </button>
          </div>
        </div>
        
        <!-- File List -->
        <div v-if="files.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-3">ไฟล์ที่เลือก ({{ files.length }})</h4>
          <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <div 
              v-for="(file, index) in files" 
              :key="index"
              class="flex items-center justify-between p-2 border border-gray-100 rounded"
            >
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <div class="w-12 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon :icon="['fas', 'file']" class="text-blue-500 text-base"/>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900 truncate" :title="file.name">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatBytes(file.size) }}</p>
                  
                  <!-- Progress Bar -->
                  <div v-if="file.status === 'uploading'" class="mt-1.5">
                    <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        class="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                        :style="{ width: (file.progress || 0) + '%' }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-600 mt-1">
                      <span class="font-medium">กำลังอัพโหลด...</span>
                      <span class="font-mono font-semibold text-blue-600">{{ file.progress || 0 }}%</span>
                    </div>
                  </div>
                  
                  <!-- Status -->
                  <div v-if="file.status && file.status !== 'uploading'" class="mt-1.5">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                      :class="{
                        'bg-amber-50 text-amber-700 border-amber-200': file.status === 'pending',
                        'bg-emerald-50 text-emerald-700 border-emerald-200': file.status === 'success',
                        'bg-red-50 text-red-700 border-red-200': file.status === 'error',
                        'bg-gray-50 text-gray-700 border-gray-200': file.status === 'cancelled'
                      }"
                    >
                      <font-awesome-icon 
                        :icon="['fas', 
                          file.status === 'pending' ? 'clock' :
                          file.status === 'success' ? 'check' :
                          file.status === 'error' ? 'exclamation-triangle' :
                          'times'
                        ]" 
                        class="mr-1.5 text-base"
                        :class="{
                          'animate-pulse': file.status === 'pending'
                        }"
                      />
                      {{ 
                        file.status === 'pending' ? 'รอ' :
                        file.status === 'success' ? 'สำเร็จ' :
                        file.status === 'error' ? 'ผิดพลาด' :
                        'ยกเลิก'
                      }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <button 
                v-if="file.status === 'uploading'"
                @click="cancelUpload(file.name)"
                class="p-1 text-gray-400 hover:text-red-600 rounded"
                title="ยกเลิก"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="text-xs"/>
              </button>
              <button 
                v-else-if="file.status === 'error' || file.status === 'cancelled'"
                @click="resumeUpload(file.name)"
                class="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="ลองใหม่"
              >
                <font-awesome-icon :icon="['fas', 'redo']" class="text-xs"/>
              </button>
              <button 
                v-else
                @click="removeFile(index)"
                class="p-1 text-gray-400 hover:text-red-600 rounded"
                title="ลบ"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="text-xs"/>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        <div class="text-xs text-gray-600">
          <span v-if="files.length > 0">{{ files.length }} ไฟล์</span>
          <span v-else>ยังไม่ได้เลือกไฟล์</span>
        </div>
        <div class="flex space-x-2">
          <button 
            v-if="files.some(f => f.status === 'error' || f.status === 'cancelled')"
            @click="resumeFailedUploads"
            class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'redo']" class="mr-1 text-xs"/>
            ลองใหม่
          </button>
          <button 
            @click="minimizeUploadBox"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'window-minimize']" class="mr-1 text-xs"/>
            ย่อ
          </button>
          <button 
            @click="preprocessFiles"
            :disabled="files.length === 0 || preprocessingFiles"
            class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'magic']" class="mr-1 text-xs"/>
            {{ preprocessingFiles ? 'กำลังเตรียม...' : 'เตรียมไฟล์' }}
          </button>
          <button 
            @click="submitFiles"
            :disabled="files.length === 0"
            class="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium"
          >
            <font-awesome-icon :icon="['fas', 'upload']" class="mr-1 text-xs"/>
            อัพโหลด ({{ files.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Mini Uploader Panel -->
<div v-if="showMiniUploader" class="fixed bottom-4 right-4 z-[9998] bg-white rounded-lg shadow-lg border border-gray-300 max-w-sm w-80">
  <!-- Header -->
  <div class="bg-gray-100 px-3 py-2 rounded-t-lg border-b border-gray-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="text-gray-600 text-sm"/>
        <h3 class="text-gray-800 font-medium text-sm">อัปโหลดไฟล์</h3>
        <span class="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded">
          {{ uploadingFilesCount }}
        </span>
      </div>
      <div class="flex items-center space-x-1">
        <button 
          @click="toggleMiniUploader"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          :title="isMiniCollapsed ? 'ขยาย' : 'ย่อ'"
        >
          <font-awesome-icon :icon="['fas', isMiniCollapsed ? 'chevron-up' : 'chevron-down']" class="text-xs"/>
        </button>
        <button 
          @click="expandToFullUploader"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          title="ขยายเต็ม"
        >
          <font-awesome-icon :icon="['fas', 'expand']" class="text-xs"/>
        </button>
        <button 
          @click="closeMiniUploader"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          title="ปิด"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="text-xs"/>
        </button>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div v-if="!isMiniCollapsed" class="max-h-48 overflow-y-auto">
    <div v-if="files.length === 0" class="p-3 text-center text-gray-500 text-sm">
      ไม่มีไฟล์ในคิว
    </div>
    <div v-else class="p-2 space-y-1">
      <div 
        v-for="(file, index) in files" 
        :key="index"
        class="flex items-center space-x-2 p-2 border border-gray-100 rounded"
      >
        <div class="w-10 h-10 bg-blue-50 border border-blue-100 rounded flex items-center justify-center flex-shrink-0">
          <font-awesome-icon 
            :icon="['fas', file.folderName ? 'folder' : 'file']" 
            :class="file.folderName ? 'text-yellow-500' : 'text-blue-500'"
            class="text-base"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900 truncate" :title="file.relativePath || file.name">
            {{ file.relativePath || file.name }}
          </p>
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <span>{{ formatBytes(file.size) }}</span>
            <span v-if="file.folderName" class="inline-flex items-center px-1 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
              <font-awesome-icon :icon="['fas', 'folder']" class="mr-1 text-xs"/>
              {{ file.folderName }}
            </span>
          </div>
          
          <!-- Progress Bar -->
          <div v-if="file.status === 'uploading'" class="mt-1">
            <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                :style="{ width: (file.progress || 0) + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span class="font-medium">อัพโหลด</span>
              <span class="font-mono font-semibold">{{ file.progress || 0 }}%</span>
            </div>
          </div>
          
          <!-- Status -->
          <div v-if="file.status && file.status !== 'uploading'" class="mt-1">
            <span 
              class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border"
              :class="{
                'bg-amber-50 text-amber-700 border-amber-200': file.status === 'pending',
                'bg-emerald-50 text-emerald-700 border-emerald-200': file.status === 'success',
                'bg-red-50 text-red-700 border-red-200': file.status === 'error',
                'bg-gray-50 text-gray-700 border-gray-200': file.status === 'cancelled'
              }"
            >
              <font-awesome-icon 
                :icon="['fas', 
                  file.status === 'pending' ? 'clock' :
                  file.status === 'success' ? 'check' :
                  file.status === 'error' ? 'exclamation-triangle' :
                  'times'
                ]" 
                class="mr-1.5 text-base"
                :class="{
                  'animate-pulse': file.status === 'pending'
                }"
              />
              {{ 
                file.status === 'pending' ? 'รอ' :
                file.status === 'success' ? 'สำเร็จ' :
                file.status === 'error' ? 'ล้มเหลว' :
                'ยกเลิก'
              }}
            </span>
          </div>
        </div>
        
        <!-- Actions -->
        <button 
          v-if="file.status === 'uploading'"
          @click="cancelUpload(file.name)"
          class="p-1 text-gray-400 hover:text-red-600 rounded"
          title="ยกเลิก"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="text-xs"/>
        </button>
        <button 
          v-else-if="file.status === 'error' || file.status === 'cancelled'"
          @click="resumeUpload(file.name)"
          class="p-1 text-gray-400 hover:text-blue-600 rounded"
          title="ลองใหม่"
        >
          <font-awesome-icon :icon="['fas', 'redo']" class="text-xs"/>
        </button>
        <button 
          v-else
          @click="removeFile(index)"
          class="p-1 text-gray-400 hover:text-red-600 rounded"
          title="ลบ"
        >
          <font-awesome-icon :icon="['fas', 'trash']" class="text-xs"/>
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div v-if="!isMiniCollapsed && files.length > 0" class="border-t border-gray-200 p-2 space-y-1">
    <button 
      v-if="files.some(f => f.status === 'error' || f.status === 'cancelled')"
      @click="resumeFailedUploads"
      class="w-full px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
    >
      <font-awesome-icon :icon="['fas', 'redo']" class="mr-1 text-xs"/>
      ลองใหม่
    </button>
    <button 
      @click="submitFiles"
      :disabled="files.length === 0"
      class="w-full px-2 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded text-xs font-medium"
    >
      <font-awesome-icon :icon="['fas', 'upload']" class="mr-1 text-xs"/>
      อัพโหลด ({{ files.length }})
    </button>
  </div>
</div>

<!-- Popup Mode Footer -->
<div v-if="Mode === 'popup'" class="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
  <div class="flex justify-between items-center">
    <div class="text-sm text-gray-600 flex-1">
      <span v-if="selectedFiles.size === 0">คลิกเลือกไฟล์</span>
      <span v-else-if="selectedFiles.size === 1">
        <span v-if="canSelectSingleFile" class="text-green-600">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-1"/>
          เลือกแล้ว 1 ไฟล์ (พร้อมใช้งาน)
        </span>
        <span v-else class="text-red-600">
          <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-1"/>
          เลือกแล้ว 1 ไฟล์ (ไฟล์ไม่ถูกต้อง)
        </span>
      </span>
      <span v-else class="text-orange-600">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1"/>
        เลือกแล้ว {{ selectedFiles.size }} ไฟล์ (เลือกได้ครั้งละ 1 ไฟล์)
      </span>
      <!-- Debug info -->
      <div class="text-xs text-gray-400 mt-1">
        Debug: canSelectSingleFile={{ canSelectSingleFile }}, hasSelectedVideoWithTranscode={{ hasSelectedVideoWithTranscode }}
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button 
        @click.stop="cancelSelection"
        class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
      >
        ยกเลิก
      </button>
      <!-- ปุ่มเลือกความละเอียดสำหรับวิดีโอที่มี transcode -->
      <button 
        v-if="canSelectSingleFile && hasSelectedVideoWithTranscode"
        @mouseup.stop="() => { 
          console.log('🔥 Button clicked inline!'); 
          const selectedFileId = Array.from(selectedFiles)[0];
          const selectedFile = fileListing.find(f => f._id === selectedFileId);
          console.log('🔥 Found file:', selectedFile);
          if (selectedFile) {
            showVideoResolutionSelector(selectedFile);
          }
        }"
        @mousedown="console.log('🖱️ Mouse down on resolution button')"
        class="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium"
        style="pointer-events: auto; z-index: 9999;"
      >
        <font-awesome-icon :icon="['fas', 'video']" class="mr-1"/>
        ความละเอียด
      </button>
      <!-- ปุ่มเลือกไฟล์ปกติ -->
      <button 
        v-else-if="canSelectSingleFile"
        @click="confirmSelection" 
        class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
      >
        <font-awesome-icon :icon="['fas', 'check']" class="mr-1"/>
        เลือกไฟล์
      </button>
      <button 
        v-else-if="selectedFiles.size > 0"
        disabled
        class="px-3 py-1.5 bg-gray-300 text-gray-500 rounded text-sm font-medium cursor-not-allowed"
        :title="selectedFiles.size > 1 ? 'เลือกได้ครั้งละ 1 ไฟล์เท่านั้น' : 'ไฟล์ที่เลือกไม่ถูกต้องหรือไม่อนุญาต'"
      >
        <font-awesome-icon :icon="['fas', 'ban']" class="mr-1"/>
        ไม่ได้
      </button>
    </div>
    
    <!-- Video Trim Button (แสดงเมื่อเลือกไฟล์วิดีโอ 1 ไฟล์) -->
    <div v-if="selectedFiles.size === 1 && isSelectedFileVideo()" class="mt-2 space-y-2">
      <button 
        @click="openVideoTrimmerForSelected"
        class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'cut']" class="text-sm"/>
        <span>ตัดต่อวิดีโอ</span>
      </button>
      
      <!-- Video Subtitle Button -->
      <button 
        @click="openVideoSubtitleForSelected"
        class="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'closed-captioning']" class="text-sm"/>
        <span>สร้าง Subtitle</span>
      </button>
      
      <!-- Make Streaming Button -->
      <button 
        @click="makeStreamingForSelected"
        class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'stream']" class="text-sm"/>
        <span>สร้าง Streaming</span>
      </button>
    </div>
  </div>
</div>

<!-- Share Folder Modal -->
<div v-if="shareModal" class="fixed inset-0 z-50 overflow-y-auto">
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
      <!-- Modal Header -->
      <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <font-awesome-icon :icon="['fas', 'share-alt']" class="h-6 w-6 text-blue-600"/>
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              แชร์{{ getShareItemType() }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                ตั้งค่าการแชร์สำหรับ{{ getShareItemType() }} "{{ shareSelectedFolder }}"
              </p>
            </div>
          </div>
          <button 
            @click="closeShareModal"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5"/>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="bg-gray-50 px-4 py-5 sm:p-6">
        <!-- Share Toggle -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <label class="text-sm font-medium text-gray-900">เปิดการแชร์</label>
            <p class="text-xs text-gray-500">อนุญาตให้ผู้อื่นเข้าถึง{{ getShareItemType() }}นี้ผ่านลิงก์</p>
          </div>
          <button 
            @click="toggleShareStatus"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
              shareEnabled ? 'bg-blue-600' : 'bg-gray-200'
            ]">
            <span 
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                shareEnabled ? 'translate-x-5' : 'translate-x-0'
              ]">
            </span>
          </button>
        </div>

        <!-- Share URL Display (only show when sharing is enabled) -->
        <div v-if="shareEnabled" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">ลิงก์สำหรับแชร์</label>
          <div class="flex items-center space-x-2">
            <input 
              :value="shareUrl"
              readonly
              class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="copyShareUrl"
              title="คลิกเพื่อคัดลอกลิงก์"
            />
            <button 
              @click.prevent="copyShareUrl"
              type="button"
              class="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4"/>
            </button>
          </div>
          <div v-if="shareUrlCopied" class="mt-1 text-xs text-green-600 flex items-center">
            <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3 mr-1"/>
            คัดลอกลิงก์เรียบร้อยแล้ว
          </div>
        </div>

        <!-- Advanced Options (only show when sharing is enabled) -->
        <div v-if="shareEnabled" class="space-y-4">
          <!-- Password Protection -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">ป้องกันด้วยรหัสผ่าน</label>
              <input 
                type="checkbox" 
                v-model="shareHasPassword"
                @click.stop
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
            </div>
            
            <div v-if="shareHasPassword" class="flex rounded-md shadow-sm">
              <input 
                v-model="sharePassword"
                :type="sharePasswordVisible ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่าน"
                name="share-protection-password"
                id="share-protection-password"
                autocomplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                @focus="$event.target.select()"
                class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"/>
              <button 
                @click.prevent="togglePasswordVisibility"
                type="button"
                class="inline-flex items-center px-3 py-2 border border-l-0 border-r-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm">
                <font-awesome-icon :icon="sharePasswordVisible ? ['fas', 'eye-slash'] : ['fas', 'eye']" class="h-4 w-4"/>
              </button>
              <button 
                @click.prevent="generateRandomPassword"
                type="button"
                class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm">
                <font-awesome-icon :icon="['fas', 'random']" class="h-4 w-4"/>
              </button>
            </div>
          </div>

          <!-- Expiry Date -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">กำหนดวันหมดอายุ</label>
              <input 
                type="checkbox" 
                v-model="shareHasExpiry"
                @click.stop
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
            </div>
            
            <div v-if="shareHasExpiry" class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <input 
                  v-model="shareExpiryDate"
                  type="date"
                  :min="new Date().toISOString().split('T')[0]"
                  @change="calculateDaysFromExpiry"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm"/>
                <input 
                  v-model="shareExpiryDays"
                  type="number"
                  min="1"
                  placeholder="จำนวนวัน"
                  @input="calculateExpiryFromDays"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 text-sm"/>
              </div>
              <div class="flex space-x-1">
                <button 
                  @click="shareExpiryDays = 7; calculateExpiryFromDays()"
                  type="button"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                  7 วัน
                </button>
                <button 
                  @click="shareExpiryDays = 30; calculateExpiryFromDays()"
                  type="button"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                  30 วัน
                </button>
                <button 
                  @click="shareExpiryDays = 90; calculateExpiryFromDays()"
                  type="button"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                  90 วัน
                </button>
              </div>
            </div>
          </div>

          <!-- Permission Settings -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">สิทธิ์การเข้าถึง</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50" :class="sharePermission === 'read' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                <input 
                  type="radio" 
                  v-model="sharePermission" 
                  value="read"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">ดูอย่างเดียว</div>
                  <div class="text-xs text-gray-500">สามารถดูและดาวน์โหลดเท่านั้น</div>
                </div>
              </label>
              <label class="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50" :class="sharePermission === 'write' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                <input 
                  type="radio" 
                  v-model="sharePermission" 
                  value="write"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">อัพโหลดได้</div>
                  <div class="text-xs text-gray-500">สามารถดู อัพโหลด และแก้ไขได้</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- No Share Message -->
        <div v-if="!shareEnabled" class="mt-4 p-4 bg-gray-100 rounded-lg">
          <p class="text-sm text-gray-600">
            <font-awesome-icon :icon="['fas', 'lock']" class="h-4 w-4 mr-2"/>
            {{ getShareItemType() }}นี้ยังไม่ได้เปิดการแชร์
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button 
          v-if="shareEnabled"
          @click="saveShareSettings"
          type="button" 
          class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto">
          <font-awesome-icon :icon="['fas', 'save']" class="h-4 w-4 mr-2"/>
          บันทึกการตั้งค่า
        </button>
        <button 
          @click="closeShareModal"
          type="button" 
          class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
          ปิด
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Video Resolution Convert Modal -->
<div v-if="showTranscodePanel" class="fixed inset-0 z-50 overflow-y-auto">
  <div 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm"
    @click="closeTranscodePanel(true)"
  ></div>
  <div class="flex min-h-full items-center justify-center p-4">
    <div 
      class="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">แปลงความละเอียดวิดีโอ</h3>
          <button 
            @click="closeTranscodePanel(true)"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-sm"/>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <!-- File Info (compact version) -->
        <div v-if="transcodeSelectedFile" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'video']" class="text-blue-600 text-sm"/>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ transcodeSelectedFile.name }}</p>
              <p class="text-xs text-gray-500">{{ formatBytes(transcodeSelectedFile.size) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Settings Area -->
        <div class="space-y-4">
          <!-- Quick select buttons -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">เลือกความละเอียดด่วน</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="quality in transcodeAvailableQualities.slice(0, 4)" 
                :key="quality"
                @click="selectQuickQuality(quality)"
                :disabled="!isQualityAvailable(quality)"
                class="px-3 py-2 rounded text-sm font-medium transition-all duration-200 relative group"
                :class="{
                  'bg-blue-500 text-white shadow-sm': transcodeSelectedQuality === quality && isQualityAvailable(quality),
                  'bg-gray-100 text-gray-700 hover:bg-gray-200': transcodeSelectedQuality !== quality && isQualityAvailable(quality),
                  'bg-green-100 text-green-700 cursor-not-allowed': !isQualityAvailable(quality)
                }">
                {{ quality.toUpperCase() }}
                <font-awesome-icon 
                  v-if="!isQualityAvailable(quality)" 
                  :icon="['fas', 'check']" 
                  class="ml-1 text-xs"
                />
                <!-- Tooltip for existing transcodes -->
                <div v-if="!isQualityAvailable(quality)" 
                     class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  มีความละเอียดนี้แล้ว
                </div>
              </button>
            </div>
          </div>

          <!-- Additional quality options -->
          <div v-if="transcodeAvailableQualities.length > 4">
            <label class="block text-sm font-medium text-gray-700 mb-2">ความละเอียดเพิ่มเติม</label>
            <div class="grid grid-cols-1 gap-2">
              <button 
                v-for="quality in transcodeAvailableQualities.slice(4)" 
                :key="quality"
                @click="selectQuickQuality(quality)"
                :disabled="!isQualityAvailable(quality)"
                class="px-3 py-2 rounded text-sm font-medium transition-all duration-200 relative text-left group"
                :class="{
                  'bg-blue-500 text-white shadow-sm': transcodeSelectedQuality === quality && isQualityAvailable(quality),
                  'bg-gray-100 text-gray-700 hover:bg-gray-200': transcodeSelectedQuality !== quality && isQualityAvailable(quality),
                  'bg-green-100 text-green-700 cursor-not-allowed': !isQualityAvailable(quality)
                }">
                {{ getQualityDisplayName(quality) }}
                <font-awesome-icon 
                  v-if="!isQualityAvailable(quality)" 
                  :icon="['fas', 'check']" 
                  class="ml-1 text-xs float-right mt-0.5"
                />
                <!-- Tooltip for existing transcodes -->
                <div v-if="!isQualityAvailable(quality)" 
                     class="absolute bottom-full left-4 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  มีความละเอียดนี้แล้ว
                </div>
              </button>
            </div>
          </div>

          <!-- Advanced Options -->
          <div class="border-t border-gray-200 pt-4">
            <button 
              @click="showVideoConvertOptions = !showVideoConvertOptions"
              class="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <span>ตัวเลือกขั้นสูง</span>
              <font-awesome-icon 
                :icon="['fas', 'chevron-down']" 
                class="text-xs transition-transform duration-200"
                :class="{ 'rotate-180': showVideoConvertOptions }"
              />
            </button>
            
            <div v-if="showVideoConvertOptions" class="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
              <label class="flex items-center space-x-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  v-model="replaceExistingTranscode"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span>แทนที่ transcode ที่มีอยู่ (หากมี)</span>
              </label>
              
              <!-- Information about background processing -->
              <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-start space-x-2">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="text-blue-600 text-sm mt-0.5"/>
                  <div class="text-xs text-blue-800">
                    <p class="font-medium mb-1">การแปลงจะทำงานใน Background</p>
                    <p>คุณสามารถปิดหน้าต่างนี้และทำงานอื่นต่อได้ การแปลงจะดำเนินการอัตโนมัติ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Quality Display -->
          <div v-if="transcodeSelectedQuality" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'video']" class="text-blue-600 text-sm"/>
                <span class="text-sm text-blue-800">
                  ความละเอียดที่เลือก: <strong>{{ getQualityDisplayName(transcodeSelectedQuality) }}</strong>
                </span>
              </div>
              <span v-if="getQualityStatus(transcodeSelectedQuality)" 
                    class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <font-awesome-icon :icon="['fas', 'check']" class="mr-1 text-xs"/>
                {{ getQualityStatus(transcodeSelectedQuality) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
        <div class="text-xs text-gray-600">
          <span v-if="transcodeSelectedQuality && isQualityAvailable(transcodeSelectedQuality)">
            พร้อมแปลง: {{ getQualityDisplayName(transcodeSelectedQuality) }}
          </span>
          <span v-else-if="transcodeSelectedQuality && !isQualityAvailable(transcodeSelectedQuality)">
            มีอยู่แล้ว: {{ getQualityDisplayName(transcodeSelectedQuality) }}
          </span>
          <span v-else>กรุณาเลือกความละเอียด</span>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="closeTranscodePanel(true)"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors duration-200"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="mr-1 text-xs"/>
            ยกเลิก
          </button>
          <button 
            @click="startTranscode"
            :disabled="!transcodeSelectedQuality || (!isQualityAvailable(transcodeSelectedQuality) && !replaceExistingTranscode)"
            class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors duration-200"
          >
            <font-awesome-icon :icon="['fas', 'cog']" class="mr-1 text-xs"/>
            <span v-if="replaceExistingTranscode && !isQualityAvailable(transcodeSelectedQuality)">
              แทนที่แล้วแปลง
            </span>
            <span v-else>
              เริ่มแปลง
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

</template>
<style scoped>
  /* File selection highlight - minimal and contained */
  .selected-file-highlight {
    position: relative;
  }

  /* ปิดการใช้งาน pseudo-element ที่ทำให้ border ขยายออกไป */
  /* .selected-file-highlight::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    pointer-events: none;
    z-index: 10;
    box-sizing: border-box;
  } */

  /* Ensure highlight doesn't add extra space */
  .selected-file-highlight > .bg-white.rounded-xl {
    position: relative;
    z-index: 1;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  input[type="file"]{
    position: absolute;
    top: -500px;
  }

  div.file-listing{
    width: 200px;
  }

  span.remove-file{
    color: red;
    cursor: pointer;
    float: right;
  }

  .overflow-auto {
    max-height: calc(100% - 140px);
  }
  
  .dragging {
    opacity: 0.4;
    transform: scale(0.95);
    transition: all 0.2s ease;
  }
  
  /* Modern card hover effects - ไม่มีเงา */
  .group:hover {
    transform: translateY(-1px);
  }
  
  /* Smooth transitions for all interactive elements */
  .transition-all {
    transition: all 0.2s ease-in-out;
  }
  
  /* Custom scrollbar */
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
  
  /* Enhanced focus states */
  button:focus,
  input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Loading animation for progress bars */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Gradient backgrounds */
  .bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
  }
  
  .bg-gradient-to-br {
    background: linear-gradient(to bottom right, var(--tw-gradient-stops));
  }
  
  /* Enhanced shadows */
  .shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  /* File type specific colors */
  .file-pdf { background-color: #ef4444; }
  .file-doc { background-color: #3b82f6; }
  .file-xls { background-color: #10b981; }
  .file-ppt { background-color: #8b5cf6; }
  .file-zip { background-color: #f59e0b; }
  .file-img { background-color: #ec4899; }
  
  /* Context menu improvements */
  .mx-context-menu-item-wrapper {
    position: relative;
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* Responsive grid improvements */
  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 768px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
    }
  }
  
  /* Enhanced button styles */
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    color: white;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .btn-primary:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  /* Improved breadcrumb styling */
  .breadcrumb-item {
    position: relative;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }
  
  .breadcrumb-item:hover {
    background-color: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
  }
  
  /* Enhanced modal backdrop */
  .modal-backdrop {
    backdrop-filter: blur(4px);
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  /* Progress bar animations */
  .progress-bar {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    transition: width 0.3s ease;
  }
  
  /* Folder icon hover effect */
  .folder-icon:hover {
    color: #f59e0b;
    transform: scale(1.1);
    transition: all 0.2s ease;
  }
  
  /* Uniform thumbnail sizing */
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  
  /* File type icon consistency */
  .file-icon-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
  }

  /* Custom slider styles */
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    background: #1d4ed8;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
  }

  .slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    background: #1d4ed8;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
  }

  .slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
    border: none;
  }

  /* Modal animations */
  .modal-enter-active, .modal-leave-active {
    transition: all 0.3s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }

  /* Backdrop blur effect */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  /* Pulse animation for status indicators */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Enhanced focus states for accessibility */
  input:focus, button:focus, select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Smooth transitions for all interactive elements */
  button, input, select {
    transition: all 0.2s ease-in-out;
  }

  /* Enhanced hover effects for cards */
  .group:hover .group-hover\:scale-105 {
    transform: scale(1.05);
  }

  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }

  /* Popup mode styles */
  .popup-mode {
    background: white;
    display: flex;
    flex-direction: column;
  }

  .popup-mode .flex-1 {
    width: 100%;
    min-height: 0; /* Allow flex item to shrink */
  }

  /* Hide upload and create folder buttons in popup mode - พวกเขาจะปรากฏใน dropdown แทน */
  .popup-mode .lg\\:hidden {
    display: none !important;
  }

  /* Search animation in popup mode */
  .search-fade-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .search-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  }

  .search-fade-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
    max-width: 0;
  }

  .search-fade-leave-to {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
    max-width: 0;
  }

  .search-fade-enter-to, .search-fade-leave-from {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-width: 16rem; /* lg:w-64 equivalent */
  }

  /* Search input smooth width transition */
  .search-input-popup {
    transition: all 0.3s ease-in-out;
    overflow: hidden;
  }

  /* Enhanced breadcrumb spacing in popup mode */
  .popup-mode .breadcrumb-item {
    max-width: 6rem; /* ลดขนาดสำหรับ popup mode */
  }

  /* Ensure proper scrolling in popup mode */
  .popup-mode .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .popup-mode .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .popup-mode .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .popup-mode .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .popup-mode .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Global Drop Overlay Styles */
  .drop-overlay {
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-in-out;
  }

  .drop-overlay .drop-zone {
    border-color: #60a5fa;
    border-width: 4px;
    border-style: dashed;
    border-radius: 1rem;
    transition: all 0.2s ease-in-out;
    /* Ensure proper positioning */
    top: 1rem;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    min-height: calc(100vh - 2rem);
    min-width: calc(100vw - 2rem);
  }

  .drop-overlay .drop-zone:hover {
    border-color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }

  /* Ensure drop overlay covers entire viewport */
  .drop-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999 !important;
  }

  /* Responsive adjustments for drop zone */
  @media (max-width: 640px) {
    .drop-overlay .drop-zone {
      top: 0.5rem;
      left: 0.5rem;
      right: 0.5rem;
      bottom: 0.5rem;
      border-radius: 0.75rem;
    }

    .drop-overlay h3 {
      font-size: 1.25rem;
    }

    .drop-overlay p {
      font-size: 0.875rem;
    }

    .drop-overlay .w-24.h-24 {
      width: 4rem;
      height: 4rem;
    }
  }

  /* Mini Uploader Panel Styles */
  .mini-uploader {
    max-height: 400px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .mini-uploader:hover {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  }

  /* Animation for fade in */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Responsive mini uploader */
  @media (max-width: 640px) {
    .mini-uploader {
      max-width: calc(100vw - 2rem);
      right: 1rem;
      bottom: 1rem;
    }
  }

  /* Ensure drop overlay is above everything */
  .drop-overlay {
    z-index: 10000 !important;
  }

  /* Drop highlight for folders */
  .drop-highlight {
    border-color: #3b82f6 !important;
    border-width: 2px !important;
    background-color: rgba(59, 130, 246, 0.1) !important;
    transform: scale(1.02);
    transition: all 0.2s ease-in-out;
  }

  /* Dragging state styles */
  .dragging {
    opacity: 0.5;
    transform: scale(0.95);
    transition: all 0.2s ease-in-out;
  }

  /* Enhanced folder drag feedback */
  .folder-content {
    transition: all 0.2s ease-in-out;
  }

  .drop-highlight .folder-content {
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  /* Custom border width for loading spinner */
  .border-3 {
    border-width: 3px;
  }
  
  /* Enhanced loading spinner animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .drop-overlay {
    z-index: 9999 !important;
  }

  /* Prevent scroll when dragging */
  body.dragging {
    overflow: hidden;
  }

  /* Context menu area styles */
  .min-h-96 {
    min-height: 24rem; /* Ensure enough space for context menu */
  }

  /* Empty area hover effect */
  .grid > div[class*="empty-"]:hover,
  .min-h-32:hover {
    background-color: rgba(59, 130, 246, 0.02);
    cursor: context-menu;
  }

  /* Ensure file content area takes full space */
  .file-manager-container {
    height: calc(100vh - 196px);
  }
  
  .file-manager-container.popup-mode {
    height: auto;
  }

  /* Video transcode modal styles */
  .transcode-modal .quality-button {
    transition: all 0.2s ease-in-out;
  }

  .transcode-modal .quality-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .transcode-modal .quality-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Tooltip styles for transcode modal */
  .tooltip {
    position: relative;
  }

  .tooltip .tooltip-text {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
    width: 120px;
    background-color: #374151;
    color: white;
    text-align: center;
    border-radius: 6px;
    padding: 5px 8px;
    z-index: 999;
    font-size: 11px;
    transition: opacity 0.3s;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  /* Advanced options accordion animation */
  .advanced-options-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
  }

  .advanced-options-content.expanded {
    max-height: 200px;
  }

  /* Enhanced checkbox styles */
  input[type="checkbox"]:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  input[type="checkbox"]:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    outline: none;
  }

  /* Status indicator animations */
  .status-indicator {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Enhanced modal backdrop */
  .modal-backdrop {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.3);
  }

  /* Quality selection grid responsive */
  @media (max-width: 640px) {
    .quality-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Button loading state */
  .button-loading {
    position: relative;
    color: transparent;
  }

  .button-loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -8px;
    margin-top: -8px;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .file-manager-container .flex-1 {
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* Auto-height for full screen mode */
  .file-manager-container:not(.popup-mode) {
    height: calc(100vh - 196px);
    max-height: calc(100vh - 196px);
  }

  /* Empty state styling */
  .border-dashed {
    transition: all 0.2s ease-in-out;
  }

  .border-dashed:hover {
    border-color: #60a5fa;
    background-color: rgba(59, 130, 246, 0.02);
  }

  /* Thumbnail loading states */
  .thumbnail-loading {
    position: relative;
  }

  .thumbnail-loading::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 10;
  }

  .thumbnail-loaded {
    transition: opacity 0.3s ease-in-out;
  }

  .thumbnail-error {
    filter: grayscale(100%);
    opacity: 0.6;
  }

  /* Smooth image transitions */
  .aspect-square img {
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  }

  .aspect-square img.loading {
    opacity: 0.7;
  }

  .aspect-square img.loaded {
    opacity: 1;
  }

  /* TaskManager Panel Styles */
  .task-toggle-button {
    bottom: 10px;
    left: 10px;
    transition: all 0.3s ease;
  }

  .task-toggle-button:hover {
    transform: scale(1.1);
  }

  /* Slide up animation for task panel */
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }

  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  /* Mobile responsive adjustments */
  @media (max-width: 640px) {
    .task-toggle-button {
      bottom: 10px;
      left: 10px;
      width: 48px;
      height: 48px;
    }
  }
</style>

/* Force refresh */
