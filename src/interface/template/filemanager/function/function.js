import * as LogicFunctions from '../logic/logic.js';
import attachContextFunctions from './context.js';
import attachUploadFunctions from './upload.js';
import attachDragDropFunctions from './dragdrop.js';
import attachMediaFunctions from './media.js';
import attachFileBrowserFunctions from './filebrowser.js';
import attachBatchOperationsFunctions from './batchoperations.js';
import debug from '@/plugins/Logger.js';
import convertUtils from '@/plugins/convertUtils.js';
import toast from '@/plugins/ToastUI.js';
import Plyr from "plyr";
import storageManager from '@/plugins/storage';

export function attachFunctions(ctx) {
  // Helper method สำหรับ debug (ใช้ rest parameter ตามที่กำหนด)
  ctx.debugLog = function(...args) {
    debug.log(...args);
  };

  // List files function - moved from main component
  ctx.listFile = async function(forcePrefix = null) {
    try {
      debug.log('🚀 listFile() method called with forcePrefix:', forcePrefix);
      
      if (!this.$Request) {
        console.error('❌ $Request is not available!');
        return;
      }
      
      if (!this.configs) {
        console.error('❌ configs is not available!');
        return;
      }
      
      //this.toast = toast({ type: 'pending', message: 'กำลังรายการไฟล์...' });
      
      // Clear image load errors when refreshing - with safety check
      if (this.imageLoadErrors && typeof this.imageLoadErrors.clear === 'function') {
        this.imageLoadErrors.clear();
      } else {
        this.imageLoadErrors = new Set();
      }
      
      const session = this.session;
      this.fileList = [];
      
      let actualParentPath = '';
      
      // ใช้ forcePrefix ถ้ามี ไม่งั้นใช้ session.prefix
      const usePrefix = forcePrefix || session?.prefix;
      
      // ตรวจสอบ Share Mode
      if (this.isShareMode && this.shareRootPath) {
        // ใน share mode ต้องดึงข้อมูล ShareId ก่อนเพื่อเอา path มาใช้
        try {
          const sharePayload = {
            pipeline: [
              {
                $match: {
                  _id: this.shareRootPath
                }
              },
              {
                $project: {
                  _id: 1,
                  path: 1,
                  owner: 1,
                  share: 1,
                  shareKey: 1,
                  sharePassword: 1,
                  shareExpiryDate: 1,
                  sharePermission: 1,
                  name: 1,
                  type: 1,
                  mimetype: 1,
                  thumbnailUrl: 1
                }
              }
            ]
          };
          
          const { data: shareData } = await this.$Request.POST('storage/aggregate', sharePayload, this.requestKey());
          
          if (shareData && shareData.length > 0) {
            // เอา path และ owner จาก ShareId มาใช้
            actualParentPath = shareData[0].path || '';
            this.shareRootOwner = shareData[0].owner || '';
            this.shareRootPermission = shareData[0].sharePermission || 'read';
            
            // ถ้ามี session.prefix แปลว่าเราอยู่ใน subfolder
            if (usePrefix) {
              actualParentPath = usePrefix;
            }
            
            this.prefix = actualParentPath;
            console.log('Share mode: Using path from ShareId:', actualParentPath);
            console.log('Share mode: Using owner from ShareId:', this.shareRootOwner);
          } else {
            console.error('ShareId not found:', this.shareRootPath);
            return;
          }
        } catch (error) {
          console.error('Error fetching ShareId data:', error);
          return;
        }
      } else if (usePrefix) {
        this.prefix = usePrefix;
        actualParentPath = usePrefix;
      }
      
      // สร้าง conditions สำหรับ query โดยแยกระหว่าง share mode และ normal mode
      let andConditions;
      let lookupConditions;
      
      if (this.isShareMode) {
        // ใน share mode ใช้ parent ที่ได้จาก ShareId path ไม่ต้องใช้ owner
        andConditions = [{ parent: actualParentPath }];
        lookupConditions = [
          { $eq: ["$parent", "$$folder_path"] }, // Match files directly in this folder
          { $ne: ["$mimetype", "folder"] }   // Exclude sub-folders from size calculation
        ];
      } else {
        // ใน normal mode ใช้ owner จาก session
        const currentUser = this.session?.current?._id;
        andConditions = [
          currentUser ? { owner: currentUser, parent: actualParentPath } : { owner: this.configs.siteID, parent: actualParentPath }
        ];
        lookupConditions = [
          { $eq: ["$parent", "$$folder_path"] }, // Match files directly in this folder
          { $eq: ["$owner", "$$owner_id"] },   // Match owner
          { $ne: ["$mimetype", "folder"] }   // Exclude sub-folders from size calculation
        ];
      }
      
      const pipeline = [
        {
          $match: {
            $and: andConditions,
          },
        },
        {
          $facet: {
            totalCount: [
              { $count: "count" },
            ],
            folders: [
              {
                $match: {
                  mimetype: "folder",
                },
              },
              {
                $lookup: {
                  from: "storage", // Target collection
                  let: this.isShareMode ? 
                    { folder_path: "$path" } : 
                    { folder_path: "$path", owner_id: "$owner" }, // Variables from the current document (folder)
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: lookupConditions
                        }
                      }
                    },
                    {
                      $group: { // Group files within the folder
                        _id: "$parent", // Group by the parent path (which is $$folder_path)
                        totalSize: { $sum: { $ifNull: ["$size", 0] } }, // Sum sizes
                        fileCount: { $sum: 1 } // Count the files
                      }
                    },
                    {
                        $project: { // Reshape for lookup result
                            _id: 0,
                            size: "$totalSize",
                            count: "$fileCount"
                        }
                    }
                  ],
                  as: "folderStats" // Name the output array
                }
              },
              {
                $project: {
                  _id: 1,
                  original: 1,
                  path: 1,
                  name: 1,
                  type: 1,
                  share: 1,
                  shareKey: 1,
                  sharePassword: 1,
                  shareExpiryDate: 1,
                  sharePermission: 1,
                  duration: 1,
                  mimetype: 1,
                  spaceId: 1,
                  createdAt: 1,
                  stream: 1,
                  transcode: 1,
                  // Extract size and count from the lookup result array (it should have 0 or 1 element)
                  size: { $ifNull: [ { $arrayElemAt: ["$folderStats.size", 0] }, 0 ] },
                  count: { $ifNull: [ { $arrayElemAt: ["$folderStats.count", 0] }, 0 ] }
                },
              },
            ],
            files: [
              {
                $match: {
                  mimetype: { $ne: "folder" }, // Exclude folders
                },
              },
              {
                $project: {
                  _id: 1,
                  original: 1,
                  path: 1,
                  name: 1,
                  type: 1,
                  share: 1,
                  shareKey: 1,
                  sharePassword: 1,
                  shareExpiryDate: 1,
                  sharePermission: 1,
                  duration: 1,
                  mimetype: 1,
                  spaceId: 1,
                  createdAt: 1,
                  stream: 1,
                  transcode: 1,
                  thumbnail: 1,
                  thumbnailUrl: 1,
                  size: { $ifNull: ["$size", 0] },
                },
              },
            ],
          },
        },
      ];

      const payload = {
        pipeline: pipeline,
      };
      
      // ใน share mode ใช้ key เป็น 'public' และไม่ต้องใช้ authorization
      const { data } = await this.$Request.POST('storage/aggregate', payload, this.requestKey());
      
      // Extract folders and files from the pipeline result
      const folders = data[0].folders;
        const files   = data[0].files;

        // Sort folders and files naturally
        folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        files.sort((a, b)   => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        // Concatenate folders and files while keeping the order (folders first)
        const newFileListing = folders.concat(files);
        
        // Clear existing array and push new items to trigger Vue reactivity
        this.fileListing.splice(0);
        this.fileListing.push(...newFileListing);

        // Debug: แสดงข้อมูลไฟล์ที่ได้จริง ๆ
        debug.log('📄 Sample file data from database:', newFileListing.slice(0, 3).map(f => ({
          name: f.name,
          type: f.type,
          mimetype: f.mimetype,
          hasThumbnail: !!f.thumbnail,
          thumbnailLength: f.thumbnail ? f.thumbnail.length : 0,
          hasThumbnailUrl: !!f.thumbnailUrl,
          thumbnailUrl: f.thumbnailUrl,
          // แสดง thumbnail sample (10 characters แรก)
          thumbnailSample: f.thumbnail ? f.thumbnail.substring(0, 10) + '...' : null
        })));

        this.folderPath = this.prefix;

        if(this.folderPath!="" && this.folderPath!=undefined) {
          this.folderPath = this.folderPath.split("/");
        } else {
          this.folderPath = "";
        }

        const size = await this.usageSpace();
        this.summaryFileSize = size
        this.unselectItem()
        
        // Force Vue reactivity update with proper async handling
        debug.log('🔄 listFile completed - fileListing updated:', this.fileListing.length, 'files');
        debug.log('🔄 folderPath:', this.folderPath);
        debug.log('🔄 prefix:', this.prefix);
        
        // ใช้ $nextTick เพื่อให้ Vue update reactivity ก่อน แล้วค่อย force update
        await this.$nextTick();
        this.$forceUpdate();
        
        debug.log('🔄 Force update completed');
        
        // โหลด thumbnailUrl ใน background หลังจากแสดงข้อมูลแล้ว
        this.loadThumbnailUrlsInBackground();
    } catch (error) {
      debug.log(error);
    }
  };

  // Usage space calculation - moved from main component
  ctx.usageSpace = async function() {
    try {
      const pipeline = [
        {
          $match: {
            owner: this.isShareMode ? this.shareRootOwner : (this.session?.current?._id || this.configs.siteID),
          },
        },
        {
          $group: {
            _id: null,
            totalSize: { $sum: "$size" }, // Replace "size" with the actual field name containing the size
          },
        },
      ];

      const payload = {
        pipeline: pipeline,
      };

      // ใน share mode ใช้ key เป็น 'public' และไม่ต้องใช้ authorization
      const { data } = await this.$Request.POST('storage/aggregate', payload, this.requestKey());

      return data[0].totalSize;

    } catch (error) {
      debug.log(error);
    }
  };

  // Force reload thumbnails for newly uploaded files
  ctx.forceReloadThumbnails = async function() {
    try {
      // รีเซ็ต thumbnailLoaded flag สำหรับไฟล์ที่มี thumbnailUrl
      this.fileListing.forEach(file => {
        if (file.thumbnailUrl && file.mimetype !== 'folder') {
          file.thumbnailLoaded = false;
        }
      });
      
      // เรียก background loading ใหม่
      await this.loadThumbnailUrlsInBackground();
      
    } catch (error) {
      console.error('Error in forceReloadThumbnails:', error);
    }
  };

  // Manual refresh thumbnail for specific file
  ctx.refreshSingleThumbnail = async function(fileId) {
    try {
      const file = this.fileListing.find(f => f._id === fileId);
      if (!file || !file.thumbnailUrl) {
        return;
      }
      
      // รีเซ็ต flag และโหลดใหม่
      file.thumbnailLoaded = false;
      file.thumbnailError = false;
      
      await this.loadSingleThumbnailUrl(file);
      
    } catch (error) {
      console.error('Error in refreshSingleThumbnail:', error);
    }
  };

  // Background thumbnail loading function
  ctx.loadThumbnailUrlsInBackground = async function() {
    try {
      // ตรวจสอบไฟล์ทั้งหมดในรายการ (เก็บไว้สำหรับ debug เมื่อต้องการ)
      // this.fileListing.forEach((file, index) => { ... });
      
      // หาไฟล์ที่มี thumbnailUrl และมี thumbnail base64 ที่ควรถูกแทนที่
      const filesToLoad = this.fileListing.filter(file => 
        file.thumbnailUrl && 
        file.mimetype !== 'folder' &&
        file.thumbnail && // ต้องมี base64 อยู่ก่อน
        file.thumbnail.length > 0 && // และต้องไม่ว่าง
        !file.thumbnailLoaded && // ยังไม่ได้โหลด thumbnailUrl
        (this.isImageType(file) || file.type === 'media') // รวม video files ด้วย
      );
      
      if (filesToLoad.length === 0) {
        return;
      }
      
      // โหลดทีละไฟล์แบบ async เพื่อไม่ให้บล็อก UI
      for (let i = 0; i < filesToLoad.length; i++) {
        const file = filesToLoad[i];
        
        // ใช้ requestIdleCallback หรือ setTimeout เป็น fallback
        const scheduleLoad = (callback) => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(callback, { timeout: 1000 });
          } else {
            setTimeout(callback, i * 50);
          }
        };
        
        scheduleLoad(async () => {
          try {
            await this.loadSingleThumbnailUrl(file);
          } catch (error) {
            debug.log(`❌ Failed to load thumbnail for ${file.name}:`, error);
          }
        });
      }
      
    } catch (error) {
      debug.log('❌ Error in loadThumbnailUrlsInBackground:', error);
    }
  };

  // Load single thumbnail URL
  ctx.loadSingleThumbnailUrl = async function(file) {
    try {
      // ตรวจสอบว่ายังมีไฟล์นี้ใน fileListing หรือไม่ (อาจถูกลบออกไปแล้ว)
      const currentFileIndex = this.fileListing.findIndex(f => f._id === file._id);
      if (currentFileIndex === -1) {
        return; // ไฟล์ถูกลบออกจากรายการแล้ว
      }
      
      // สร้าง Image object เพื่อโหลด thumbnailUrl
      const img = new Image();
      
      // เพิ่มเข้า pending loads set
      if (!this.pendingImageLoads) {
        this.pendingImageLoads = new Set();
      }
      this.pendingImageLoads.add(img);
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // ลบออกจาก pending loads
          this.pendingImageLoads.delete(img);
          
          // อัพเดตข้อมูลใน fileListing เมื่อโหลดสำเร็จ
          const updatedFileIndex = this.fileListing.findIndex(f => f._id === file._id);
          if (updatedFileIndex !== -1) {
            // อัพเดตข้อมูลใน fileListing โดยตรง (Vue 3 style)
            this.fileListing[updatedFileIndex].thumbnailLoaded = true;
            
            // บังคับให้ Vue อัพเดต UI เพื่อแสดงรูป thumbnailUrl ใหม่
            this.$nextTick(() => {
              this.$forceUpdate();
            });
          }
          resolve();
        };
        
        img.onerror = () => {
          // ลบออกจาก pending loads
          this.pendingImageLoads.delete(img);
          
          // อัพเดต flag ว่าโหลดไม่สำเร็จ
          const updatedFileIndex = this.fileListing.findIndex(f => f._id === file._id);
          if (updatedFileIndex !== -1) {
            this.fileListing[updatedFileIndex].thumbnailError = true;
          }
          reject(new Error(`Failed to load thumbnail for ${file.name}`));
        };
        
        // เริ่มโหลดรูป
        img.src = file.thumbnailUrl;
      });
      
    } catch (error) {
      console.error(`Error loading thumbnail for ${file.name}:`, error);
    }
  };

  // Helper function to check if file is an image (comprehensive check)
  ctx.isImageType = function(file) {
    if (!file) {
      return false;
    }
    
    // ตรวจสอบจาก type field
    if (file.type === 'image') {
      return true;
    }
    
    // ตรวจสอบจาก mimetype
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return true;
    }
    
    // ตรวจสอบจาก file extension
    if (file.name) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
      if (imageExtensions.includes(ext)) {
        return true;
      }
    }
    
    return false;
  };

  // Helper function to get thumbnail source (prioritize thumbnailUrl if loaded)
  ctx.getThumbnailSource = function(file) {
    if (!file) {
      return null;
    }
    
    // ถ้ามี thumbnailUrl และโหลดสำเร็จแล้ว ใช้ thumbnailUrl
    if (file.thumbnailUrl && file.thumbnailLoaded && !file.thumbnailError) {
      return file.thumbnailUrl;
    }
    
    // ถ้าไม่งั้น ใช้ thumbnail base64
    if (file.thumbnail && file.thumbnail.length > 0) {
      // สำหรับ video เท่านั้น ให้ตรวจสอบขนาดของ thumbnail
      if (file.type === 'media' && file.thumbnail.length <= 100) {
        return null; // thumbnail เล็กเกินไป สำหรับ video
      }
      
      // ตรวจสอบว่า thumbnail มี data URL prefix อยู่แล้วหรือไม่
      if (file.thumbnail.startsWith('data:image/')) {
        // ถ้ามี data URL prefix อยู่แล้ว ใช้เลย
        return file.thumbnail;
      } else {
        // ถ้าไม่มี prefix ให้เพิ่ม
        return `data:image/jpeg;base64,${file.thumbnail}`;
      }
    }
    
    // ไม่มี thumbnail
    return null;
  };

  // Cleanup function for background loading
  ctx.cleanupBackgroundLoading = function() {
    // Cancel any pending image loads
    if (this.pendingImageLoads) {
      this.pendingImageLoads.forEach(img => {
        if (img && img.src) {
          img.onload = null;
          img.onerror = null;
          img.src = '';
        }
      });
      this.pendingImageLoads.clear();
    }
  };

  // Initialize pending image loads set
  if (!ctx.pendingImageLoads) {
    ctx.pendingImageLoads = new Set();
  }

  // Small utility functions - moved from main component
  ctx.getFileType = function(mimetype) {
    return convertUtils.getFileType(mimetype, "short");
  };

  ctx.getFileTypeIcon = function(file) {
    // ตรวจสอบ mimetype เพื่อกำหนด icon
    if (file.mimetype) {
      if (file.mimetype.startsWith('image/')) {
        return ['fas', 'image'];
      } else if (file.mimetype.startsWith('video/')) {
        return ['fas', 'play-circle'];
      } else if (file.mimetype.startsWith('audio/')) {
        return ['fas', 'volume-up'];
      } else if (file.mimetype.startsWith('application/pdf')) {
        return ['fas', 'file-pdf'];
      } else if (file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/')) {
        return ['fas', 'file-alt'];
      }
    }
    return ['fas', 'file'];
  };

  ctx.handleImageError = function(fileName, event) {
    debug.log('Image load error for:', fileName, event);
    this.imageLoadErrors.add(fileName);
    // Force re-render เพื่อแสดง fallback icon
    this.$forceUpdate();
  };

  ctx.handleImageLoad = function(fileName) {
    debug.log('Image loaded successfully for:', fileName);
    this.imageLoadErrors.delete(fileName); // Remove from error set if loaded successfully
  };

  ctx.copyShareUrl = async function() {
    if (this.shareUrl) {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.shareUrlCopied = true;
        this.showToast('คัดลอก URL แชร์เรียบร้อยแล้ว', 'success');
        
        // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
        setTimeout(() => {
          this.shareUrlCopied = false;
        }, 3000);
        
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.shareUrlCopied = true;
        this.showToast('คัดลอก URL แชร์เรียบร้อยแล้ว', 'success');
        
        setTimeout(() => {
          this.shareUrlCopied = false;
        }, 3000);
      }
    }
  };

  // Group 1: Utility Functions
  ctx.getNewFileExtension = function(fileName) {
    // Logic to extract and return the file extension
    // For example, you can split the fileName by '.' and return the last part
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'default';
  };

  ctx.calculateDiskUsagePercentage = function(bytes) {
    const limitInBytes = this.space * 1024 * 1024; // 5000MB in bytes
    const percentage = (bytes / limitInBytes) * 100;
    // จำกัดค่าสูงสุดไว้ที่ 100%
    const limitedPercentage = Math.min(percentage, 100);
    return limitedPercentage.toFixed(2); // Display percentage with two decimal places
  };

  ctx.showToast = function(message, type = 'info', duration = 3000) {
    try {
      if (!this.toast) {
        this.toast = toast({ type: type, message: message });
      } else {
        this.toast.hide(message, type, duration);
      }
    } catch (error) {
      debug.log('Toast error:', error);
      // Fallback to console log if toast fails
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  // Group 2: Form/Modal Functions
  ctx.submitFile = async function() {
    if (this.fileName && this.fileUrl) {
      const file = {
        name: this.fileName,
        original: this.fileUrl,
        path: this.fileUrl,
        size: 0,
        mimetype: 'media',
        type: 'application/octet-stream',
      };

      try {
        await this.addFile(file); // Call the addFile method
        await this.listFile(this.prefix);
        this.closeModal();
      } catch (error) {
        alert('Failed to add streaming file. Please try again.');
        console.error(error);
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  ctx.handleDragLeave = function(event) {
    event.preventDefault();
    
    // ตรวจสอบว่าเป็นการลากไฟล์ที่มีอยู่แล้วหรือไม่
    if (!this.draggedItem) {
      return;
    }
    
    // ลบ highlight เมื่อ drag ออกจาก target
    const target = event.currentTarget;
    target.classList.remove('drop-highlight');
  };

  // Group 3: Drag & Drop Functions
  ctx.handleMultiDragStart = function(event) {
    if (this.selectedFiles.size === 0) return;
    
    // ตั้งค่า drag data สำหรับหลายไฟล์
    const selectedIds = Array.from(this.selectedFiles);
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'multiple',
      fileIds: selectedIds
    }));
    
    debug.log(`Multi-drag started with ${selectedIds.length} files`);
  };

  // Group A: Pure Functions (ไม่มี dependency กับ component state)
  ctx.isAllowedFile = function(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    return this.AllowFile.map(x => x.toLowerCase()).includes(ext);
  };

  ctx.stringToBytes = function(text) {
    const length = text.length;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      const code = text.charCodeAt(i);
      const byte = code > 255 ? 32 : code;
      result[i] = byte;
    }
    return result;
  };

  ctx.slugify = function(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    // remove accents, swap ñ for n, etc
    var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
    return str;
  };

  ctx.getDocumentIcon = function(extension) {
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'ppt': 'file-powerpoint',
      'pptx': 'file-powerpoint',
      'zip': 'file-archive',
      'rar': 'file-archive',
      '7z': 'file-archive',
      'txt': 'file-alt',
      'csv': 'file-csv',
      'js': 'file-code',
      'html': 'file-code',
      'htm': 'file-code',
      'css': 'file-code',
      'xml': 'file-code',
      'json': 'file-code'
    };
    return iconMap[extension.toLowerCase()] || 'file';
  };

  ctx.getDocumentIconColor = function(extension) {
    const colorMap = {
      'pdf': 'text-red-500',
      'doc': 'text-blue-500',
      'docx': 'text-blue-500',
      'xls': 'text-green-500',
      'xlsx': 'text-green-500',
      'ppt': 'text-purple-500',
      'pptx': 'text-purple-500',
      'zip': 'text-yellow-500',
      'rar': 'text-yellow-500',
      '7z': 'text-yellow-500',
      'txt': 'text-gray-500',
      'csv': 'text-gray-700',
      'js': 'text-orange-500',
      'html': 'text-orange-500',
      'htm': 'text-orange-500',
      'css': 'text-blue-400',
      'xml': 'text-cyan-500',
      'json': 'text-green-400'
    };
    return colorMap[extension.toLowerCase()] || 'text-gray-400';
  };

  // Group B: Simple Utility Functions (dependency เบา ๆ)
  ctx.removeFile = function(key) {
    this.files.splice(key, 1);
  };

  ctx.addFiles = function() {
    this.$refs.files.click();
  };

  ctx.openCreateFolder = function() {
    // ตรวจสอบ permission ใน share mode
    if (this.isShareMode && this.shareRootPermission === 'read') {
      this.$notify.error('คุณไม่มีสิทธิ์สร้างโฟลเดอร์ในโหมดดูอย่างเดียว');
      return;
    }
    
    this.createFolderModal = true;
  };

  // Video Trimmer Methods
  ctx.openVideoTrimmer = function(file) {
    debug.log('🎬 Opening video trimmer for:', file.name);
    debug.log('🎬 File data:', file);
    this.videoTrimmerFile = file;
    
    // สร้าง URL ที่ถูกต้องสำหรับวิดีโอ
    let videoUrl = '';
    if (file.url && file.url.startsWith('http')) {
      videoUrl = file.url;
    } else if (file.original && file.original.startsWith('http')) {
      videoUrl = file.original;
    } else if (file.path) {
      // ใช้ S3 endpoint + path
      videoUrl = this.configs.s3Endpoint + file.path;
    } else if (this.configs.s3Endpoint && file.name) {
      // สร้าง URL จาก S3 endpoint และ prefix
      const currentPrefix = this.prefix || '';
      const fullPath = currentPrefix ? `/${currentPrefix}/${file.name}` : `/${file.name}`;
      videoUrl = this.configs.s3Endpoint + fullPath;
    } else {
      // fallback ใช้ hostname + path
      const hostname = this.configs.hostname || 'localhost:8080';
      const protocol = hostname.includes('localhost') ? 'http://' : 'https://';
      videoUrl = protocol + hostname + '/setup' + (file.path || '');
    }
    
    debug.log('🎬 Video URL:', videoUrl);
    debug.log('🎬 S3 Endpoint:', this.configs.s3Endpoint);
    debug.log('🎬 Current prefix:', this.prefix);
    this.videoTrimmerUrl = videoUrl;
    this.showVideoTrimmer = true;
  };

  ctx.closeVideoTrimmer = function() {
    debug.log('🎬 Closing video trimmer - this context:', typeof this, this);
    try {
      if (this && this.showVideoTrimmer !== undefined) {
        this.showVideoTrimmer = false;
        this.videoTrimmerFile = null;
        this.videoTrimmerUrl = '';
        debug.log('🎬 Video trimmer closed successfully');
      } else {
        debug.error('❌ showVideoTrimmer property not found on this context');
        // Try to access via ctx if this doesn't work
        if (ctx && ctx.showVideoTrimmer !== undefined) {
          ctx.showVideoTrimmer = false;
          ctx.videoTrimmerFile = null;
          ctx.videoTrimmerUrl = '';
          debug.log('🎬 Video trimmer closed via ctx fallback');
        }
      }
    } catch (error) {
      debug.error('❌ Error in closeVideoTrimmer:', error);
    }
  };

  ctx.onVideoTrimmed = async function(trimmedResult) {
    debug.log('✅ Video trimming initiated:', trimmedResult);
    
    try {
      // ตรวจสอบว่า trimming สำเร็จและมี jobId หรือไม่
      if (trimmedResult.success && trimmedResult.jobId) {
        // แสดงข้อความแจ้งให้ทราบว่างานถูกส่งเข้าคิวแล้ว
        toast({ 
          type: 'success', 
          message: `เริ่มการตัดต่อวิดีโอ "${trimmedResult.originalFile?.name || 'วิดีโอ'}" แล้ว\n✅ งานถูกส่งเข้าคิวประมวลผล\n🔍 ตรวจสอบความคืบหน้าได้ในหน้า Task Manager` 
        });
        
        // ปิด video trimmer
        this.showVideoTrimmer = false;
        this.videoTrimmerFile = null;
        this.videoTrimmerUrl = '';
        
        // รีเฟรชรายการไฟล์เพื่อดูการเปลี่ยนแปลง (ถ้ามี)
        try {
          await this.refreshFiles();
          debug.log('✅ File listing refreshed after trim job submission');
        } catch (refreshError) {
          debug.warn('Failed to refresh files after trim:', refreshError);
        }
        
        // ถ้ามี TaskManager component ให้รีเฟรช tasks
        if (this.$refs?.taskManager?.refreshTasks) {
          try {
            await this.$refs.taskManager.refreshTasks();
            debug.log('✅ Task Manager refreshed');
          } catch (taskRefreshError) {
            debug.warn('Failed to refresh task manager:', taskRefreshError);
          }
        }
        
        return;
      }
      
      // === Legacy handling สำหรับการทำงานแบบเก่า (ถ้ายังใช้อยู่) ===
      if (trimmedResult && trimmedResult.name) {
        const trimmedFile = trimmedResult;
        debug.log('📁 Legacy trim result - adding to upload queue:', trimmedFile.name);
        
        // เพิ่มไฟล์ที่ตัดแล้วเข้าในคิวอัปโหลด
        if (this.files && Array.isArray(this.files)) {
          // สร้าง file object สำหรับ upload queue
          const uploadFile = {
            file: trimmedFile,
            name: trimmedFile.name,
            size: trimmedFile.size,
            type: trimmedFile.type,
            status: 'pending',
            progress: 0,
            url: null,
            error: null
          };
          
          this.files.push(uploadFile);
          toast({ 
            type: 'success', 
            message: `เพิ่ม ${trimmedFile.name} เข้าในคิวอัปโหลดแล้ว` 
          });
          
          // เปิด upload panel ถ้ายังไม่เปิด
          this.uploadPanel = true;
        } else {
          toast({ 
            type: 'info', 
            message: `สร้างไฟล์ ${trimmedFile.name} เสร็จแล้ว` 
          });
          
          // สำหรับการดาวน์โหลดโดยตรง
          const downloadUrl = URL.createObjectURL(trimmedFile);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = trimmedFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
      } else {
        // ไม่มีข้อมูลที่ชัดเจน
        debug.warn('Unclear trim result format:', trimmedResult);
        toast({ 
          type: 'warning', 
          message: 'การตัดต่อวิดีโอมีปัญหา กรุณาตรวจสอบใน Task Manager' 
        });
      }
      
    } catch (error) {
      console.error('Error handling trimmed video:', error);
      toast({ 
        type: 'error', 
        message: 'เกิดข้อผิดพลาดในการจัดการผลลัพธ์การตัดต่อวิดีโอ' 
      });
    }
  };

  // Video Subtitle Methods
  ctx.openVideoSubtitle = function(file) {
    debug.log('🎬 Opening video subtitle for:', file.name);
    debug.log('🎬 File data:', file);
    this.videoSubtitleFile = file;
    
    // สร้าง URL ที่ถูกต้องสำหรับวิดีโอ (เหมือนกับ openVideoTrimmer)
    let videoUrl = '';
    if (file.url && file.url.startsWith('http')) {
      videoUrl = file.url;
    } else if (file.original && file.original.startsWith('http')) {
      videoUrl = file.original;
    } else if (file.path) {
      // ใช้ S3 endpoint + path
      videoUrl = this.configs.s3Endpoint + file.path;
    } else if (this.configs.s3Endpoint && file.name) {
      // สร้าง URL จาก S3 endpoint และ prefix
      const currentPrefix = this.prefix || '';
      const fullPath = currentPrefix ? `/${currentPrefix}/${file.name}` : `/${file.name}`;
      videoUrl = this.configs.s3Endpoint + fullPath;
    } else {
      // fallback ใช้ hostname + path
      const hostname = this.configs.hostname || 'localhost:8080';
      const protocol = hostname.includes('localhost') ? 'http://' : 'https://';
      videoUrl = protocol + hostname + '/setup' + (file.path || '');
    }
    
    debug.log('🎬 Video Subtitle URL:', videoUrl);
    this.videoSubtitleUrl = videoUrl;
    this.showVideoSubtitle = true;
  };

  ctx.closeVideoSubtitle = function() {
    debug.log('🎬 Closing video subtitle');
    try {
      if (this && this.showVideoSubtitle !== undefined) {
        this.showVideoSubtitle = false;
        this.videoSubtitleFile = null;
        this.videoSubtitleUrl = '';
        debug.log('🎬 Video subtitle closed successfully');
      } else if (ctx && ctx.showVideoSubtitle !== undefined) {
        ctx.showVideoSubtitle = false;
        ctx.videoSubtitleFile = null;
        ctx.videoSubtitleUrl = '';
        debug.log('🎬 Video subtitle closed via ctx fallback');
      }
    } catch (error) {
      debug.error('❌ Error in closeVideoSubtitle:', error);
    }
  };

  ctx.onVideoSubtitled = async function(subtitleResult) {
    debug.log('✅ Video subtitle completed:', subtitleResult);
    try {
      if (subtitleResult && subtitleResult.success) {
        toast({ 
          type: 'success', 
          message: `บันทึกซับไตเติลสำเร็จ` 
        });
        
        // ปิด video subtitle
        this.showVideoSubtitle = false;
        this.videoSubtitleFile = null;
        this.videoSubtitleUrl = '';
      }
    } catch (error) {
      console.error('Error handling subtitle result:', error);
      toast({ 
        type: 'error', 
        message: 'เกิดข้อผิดพลาดในการจัดการซับไตเติล' 
      });
    }
  };

  ctx.getFilterCount = function(type) {
    if (type === 'all') {
      return this.fileListing.length;
    } else if (type === 'folder') {
      return this.fileListing.filter(f => f.mimetype === 'folder').length;
    } else {
      return this.fileListing.filter(f => f.type === type).length;
    }
  };

  ctx.onEscapeKey = function(evt) {
    if (evt.key === 'Escape') {
      if (this.showDropOverlay) {
        this.showDropOverlay = false;
        this.dragCounter = 0;
      } else if (this.showModal) {
        // ถ้า preview popup เปิดอยู่ ให้ปิด
        this.showModal = false;
      } else if (this.showFileDetail) {
        // ถ้า file detail เปิดอยู่ ให้ปิด
        this.closeViewFile();
      } else if (this.uploadPanel) {
        // ถ้า upload panel เปิดอยู่ ให้ปิดและยกเลิก
        this.closeUploadBox();
      } else if (this.showMiniUploader) {
        // ถ้า mini uploader เปิดอยู่ ให้ปิดและยกเลิก
        this.minimizeUploadBox();
      }
    }
  };

  // Group C: Event Handlers (ขนาดเล็ก)
  ctx.copyToClipboard = async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ type: 'success', message: 'คัดลอกลิงก์เรียบร้อยแล้ว' });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ type: 'success', message: 'คัดลอกลิงก์เรียบร้อยแล้ว' });
    }
  };

  ctx.createFolderTrigger = function(payload) {
    this.createFolderModal = payload;
  };

  ctx.openRenameFolder = function(item, old, id) {
    // ค้นหาโฟลเดอร์ในรายการไฟล์
    const folder = this.fileListing.find(f => f._id === id);
    
    // ตรวจสอบว่าเป็นโฟลเดอร์และมีไฟล์อยู่ข้างในหรือไม่
    if (folder && folder.mimetype === 'folder' && folder.count > 0) {
      this.showToast('ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ที่มีไฟล์อยู่ข้างในได้', 'warning');
      return;
    }
    
    this.renameTriggerObj = item;
    this.renameTriggerId = id
    this.oldname = old;
    let oldNameArray = old.split(".");
    if (oldNameArray.length > 1) {
      oldNameArray.pop();
    }
    this.oldname = oldNameArray.join("");
    this.RenameFolderModal = true;
  };
  
  // Auto-bind all exported functions from logic.js
  // ฟังก์ชันที่ไม่ต้องการ context (utility functions)
  const directBindFunctions = [
    'isImage', 'isVideoFile', 'isAudioFile', 'isImageFile', 
    'formatBytes', 'formatDate', 'getFileName', 'getFileExtension', 
    'formatDuration', 'countInnerObj', 'generateSecureShareKey'
  ];
  
  // ฟังก์ชันที่ต้องการ context และ return simple values
  const contextFunctions = [
    'toggleLayout', 'toggleMobileSidebar', 'setFilterByType',
    'toggleStreamMenu', 'toggleActionsDropdown', 'toggleTranscodeDropdown',
    'toggleMiniUploader', 'togglePasswordVisibility', 'toggleSearchInPopup',
    'selectAllFiles', 'clearSelection', 'isFileSelected', 'unselectItem',
    'toggleFileSelection', 'handleCtrlClick', 'handleShiftClick', 'handleFileClick',
    'loadTranscodeFileSizes', 'selectTranscodeQuality', 'updateVideoSource', 'getFileSize',
    'getSelectedVideoUrl',
    'processTranscodeInBackground',
    'deleteTranscode', 'refreshFileList', 'initializeShareMode', 'openShareFolder',
    'toggleShareStatus', 'openShareFileModal', 'shareFile',
    'getShareItemType', 'calculateExpiryFromDays', 'calculateDaysFromExpiry',
    'getFilterLabel', 'handleDragEnd', 'confirmSelection', 'cancelSelection',
    'getFileTypeDisplay', 'retryImageLoad', 'generateRandomPassword',
    'extractS3KeyFromUrl', 'getTranscodeDisplayText', 'executeAction',
    'handlePopupKeydown', 'onClickOutside', 'openTranscodePanel',
    'closeTranscodePanel', 'selectQuickQuality', 'isQualityAvailable',
    'getQualityStatus', 'startTranscode', 'getQualityDisplayName',
    'openViewFile', 'closeViewFile', 'getFullPath',
    'createMultiDragImage', 'cleanupDragImage', 'handleDragStart', 'handleDragOver',
    // Media & UI Functions  
    'videoStreaming', 'compressBase64Image', 'handleFilesUpload',
    // Selection & Callback Functions
    'selectFileFunc'
  ];
  
  // รายการ functions ใหม่สำหรับ video resolution selection
  const videoResolutionFunctions = [
    'showVideoResolutionSelector',
    'selectVideoWithResolution', 
    'closeResolutionSelector',
    'hasVideoTranscode',
    'getAvailableResolutions',
    'loadTranscodeFileSizes',
    'getResolutionDescription',
    'getResolutionBadgeClass'
  ];
  
  // รวม functions ใหม่เข้ากับ contextFunctions
  contextFunctions.push(...videoResolutionFunctions);
  
  // Auto-bind direct functions
  directBindFunctions.forEach(funcName => {
    if (LogicFunctions[funcName]) {
      ctx[funcName] = LogicFunctions[funcName];
    }
  });
  
  // Auto-bind context functions
  contextFunctions.forEach(funcName => {
    if (LogicFunctions[funcName]) {
      ctx[funcName] = function(...args) {
        return LogicFunctions[funcName](this, ...args);
      };
    }
  });
  
  // Special handling functions (manual binding for complex state management)
  
  // Layout Functions with state updates
  ctx.toggleLayout = function() {
    this.layout = LogicFunctions.toggleLayout(this.layout);
  };
  
  ctx.toggleMobileSidebar = function() {
    this.showMobileSidebar = LogicFunctions.toggleMobileSidebar(this.showMobileSidebar);
  };
  
  ctx.filterByType = function(type) {
    this.fileTypeFilter = LogicFunctions.setFilterByType(type);
  };
  
  // UI Toggle Functions with state updates
  ctx.toggleStreamMenu = function() {
    this.showStreamMenu = LogicFunctions.toggleStreamMenu(this.showStreamMenu);
  };
  
  ctx.toggleActionsDropdown = function() {
    this.showActionsDropdown = LogicFunctions.toggleActionsDropdown(this.showActionsDropdown);
  };
  
  ctx.toggleTranscodeDropdown = function() {
    this.transcodeDropdownOpen = LogicFunctions.toggleTranscodeDropdown(this.transcodeDropdownOpen);
  };
  
  // Modal Functions with state updates
  ctx.openModal = function() {
    const result = LogicFunctions.openModal();
    this.isModalVisible = result.isModalVisible;
    this.fileName = result.fileName;
    this.fileUrl = result.fileUrl;
  };
  
  ctx.closeModal = function() {
    const result = LogicFunctions.closeModal(() => this.stopVideoPlayback());
    this.isModalVisible = result.isModalVisible;
    this.fileName = result.fileName;
    this.fileUrl = result.fileUrl;
  };
  
  ctx.closeShareModal = function() {
    const result = LogicFunctions.closeShareModal();
    this.shareModal = result.shareModal;
    this.shareSelectedFolder = result.shareSelectedFolder;
    this.shareSelectedFolderId = result.shareSelectedFolderId;
    this.shareEnabled = result.shareEnabled;
    this.shareUrl = result.shareUrl;
    this.sharePassword = result.sharePassword;
    this.sharePasswordVisible = result.sharePasswordVisible;
    this.shareExpiryDate = result.shareExpiryDate;
    this.shareExpiryDays = result.shareExpiryDays;
  };
  
  // Upload Box Functions with state updates
  ctx.openUploadBox = function() {
    const result = LogicFunctions.openUploadBox();
    this.uploadPanel = result.uploadPanel;
  };
  
  ctx.minimizeUploadBox = function() {
    const result = LogicFunctions.minimizeUploadBox();
    this.uploadPanel = result.uploadPanel;
    this.showMiniUploader = result.showMiniUploader;
  };
  
  ctx.toggleMiniUploader = function() {
    this.isMiniCollapsed = LogicFunctions.toggleMiniUploader(this.isMiniCollapsed);
  };
  
  ctx.expandToFullUploader = function() {
    const result = LogicFunctions.expandToFullUploader();
    this.showMiniUploader = result.showMiniUploader;
    this.uploadPanel = result.uploadPanel;
  };
  
  // Video Functions
  ctx.processPause = function() {
    LogicFunctions.processPause();
    ctx.debugLog('Video paused');
  };

  // Transcode Functions
  ctx.getTranscodeDisplayText = function(quality) {
    return LogicFunctions.getTranscodeDisplayText(ctx, quality);
  };
  
  // Search utility functions with state updates
  ctx.toggleSearchInPopup = function() {
    const result = LogicFunctions.toggleSearchInPopup(
      this.showSearchInPopup,
      this.searchQuery,
      this.$nextTick,
      () => {
        const searchInput = document.getElementById('file-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    );
    this.showSearchInPopup = result.showSearchInPopup;
    this.searchQuery = result.searchQuery;
  };
  
  // Selection utility functions with state updates
  ctx.selectAllFiles = function() {
    console.log('🎯 selectAllFiles called');
    this.selectedFiles = LogicFunctions.selectAllFiles(this.fileListing, this.selectedFiles);
    this.isMultiSelectMode = true;
    console.log(`📝 Selected all files: ${this.selectedFiles.size} files`);
    ctx.debugLog(`Selected all files: ${this.selectedFiles.size} files`);
  };
  
  ctx.clearSelection = function() {
    const result = LogicFunctions.clearSelection();
    ctx.selectedFiles = result.selectedFiles;
    ctx.isMultiSelectMode = result.isMultiSelectMode;
    ctx.lastSelectedIndex = result.lastSelectedIndex;
    ctx.debugLog('Selection cleared');
  };
  
  ctx.isFileSelected = function(fileId) {
    return LogicFunctions.isFileSelected(fileId, this.selectedFiles);
  };
  
  ctx.unselectItem = function() {
    const result = LogicFunctions.unselectItem();
    this.selectItem = result.selectItem;
    this.selectItemData = result.selectItemData;
    this.hasSelected = result.hasSelected;
  };
  
  // === SET 10: FILE SELECTION & CLICK HANDLING FUNCTIONS ===
  
  ctx.toggleFileSelection = function(fileId, event) {
    const result = LogicFunctions.toggleFileSelection(fileId, event, this.selectedFiles, debug);
    this.selectedFiles = result.selectedFiles;
    this.isMultiSelectMode = result.isMultiSelectMode;
  };
  
  ctx.handleCtrlClick = function(fileId, event) {
    const result = LogicFunctions.handleCtrlClick(fileId, event, this.selectedFiles, debug);
    this.selectedFiles = result.selectedFiles;
    this.isMultiSelectMode = result.isMultiSelectMode;
  };
  
  ctx.handleShiftClick = function(fileId, event) {
    const result = LogicFunctions.handleShiftClick(
      fileId, 
      event, 
      this.fileListing, 
      this.selectedFiles, 
      this.lastSelectedIndex, 
      debug
    );
    this.selectedFiles = result.selectedFiles;
    this.isMultiSelectMode = result.isMultiSelectMode;
    this.lastSelectedIndex = result.lastSelectedIndex;
  };
  
  ctx.handleFileClick = function(fileId, event) {
    const result = LogicFunctions.handleFileClick(
      fileId, 
      event, 
      this.isMultiSelectMode, 
      this.fileListing, 
      this.selectedFiles, 
      debug, 
      () => LogicFunctions.clearSelection()
    );
    
    this.selectedFiles = result.selectedFiles;
    this.isMultiSelectMode = result.isMultiSelectMode;
    if (result.lastSelectedIndex !== undefined) {
      this.lastSelectedIndex = result.lastSelectedIndex;
    }
    
    // Handle special callbacks
    if (result.shouldExecuteCallback) {
      if (result.callbackType === 'openViewFile' && result.callbackParam) {
        this.openViewFile(result.callbackParam);
      }
    } else if (result.needsShiftClickHandling) {
      // Re-call with shift handling
      this.handleShiftClick(fileId, event);
    }
  };
  
  // Media utility functions
  ctx.stopVideoPlayback = function() {
    LogicFunctions.stopVideoPlayback(this.$refs);
  };
  
  ctx.clearImageErrors = function() {
    LogicFunctions.clearImageErrors(this.imageLoadErrors, () => this.$forceUpdate());
    ctx.debugLog('Clearing all image errors');
  };
  
  // Share utility functions with state updates
  ctx.getShareItemType = function() {
    return LogicFunctions.getShareItemType(this.fileListing, this.shareSelectedFolderId);
  };
  
  ctx.togglePasswordVisibility = function() {
    this.sharePasswordVisible = LogicFunctions.togglePasswordVisibility(this.sharePasswordVisible);
  };
  
  ctx.calculateExpiryFromDays = function() {
    const result = LogicFunctions.calculateExpiryFromDays(this.shareExpiryDays);
    if (result) {
      this.shareExpiryDate = result;
    }
  };
  
  ctx.calculateDaysFromExpiry = function() {
    const result = LogicFunctions.calculateDaysFromExpiry(this.shareExpiryDate);
    if (result !== null) {
      this.shareExpiryDays = result;
    }
  };
  
  // Folder Navigation Functions
  ctx.openFolder = function(folder) {
    debug.log('🔍 openFolder called with:', folder);
    debug.log('🔍 Current prefix before:', this.prefix);
    
    LogicFunctions.openFolder(folder);
    
    // อัพเดต prefix ใน component state
    const session = storageManager.get('session');
    const newPrefix = session.prefix;
    this.prefix = newPrefix;
    
    debug.log('🔍 Updated prefix to:', this.prefix);
    debug.log('🔍 About to call listFile with new prefix...');
    
    // เรียก listFile หลังจากเปลี่ยน prefix โดยส่ง prefix ใหม่ไปด้วย
    this.listFile(newPrefix).then(() => {
      // Force additional reactivity update หลังจาก listFile เสร็จ
      this.$nextTick(() => {
        this.$forceUpdate();
        debug.log('🔍 openFolder: Additional force update completed');
      });
    });
  };

  // File/Folder interaction functions
  ctx.onDoubleClick = function(filename) {
    debug.log('🎯 onDoubleClick called in function.js with:', filename);
    const result = LogicFunctions.onDoubleClick(ctx, filename);
    
    // ถ้า result เป็น string (path) แปลว่าเป็นการเปิดโฟลเดอร์
    if (typeof result === 'string') {
      debug.log('🎯 Detected folder navigation, calling openFolder with path:', result);
      // เรียก openFolder ของ function.js เพื่อให้มีการอัพเดท UI
      this.openFolder(result);
    }
    
    return result;
  };

  // Modal Management Functions
  ctx.createFolderTrigger = (payload) => {
    ctx.createFolderModal = payload;
    // รีเซ็ตโหมดเมื่อปิด modal
    if (!payload) {
      ctx.createFolderAndMoveMode = false;
    }
  };

  ctx.RenameFolderTrigger = (payload) => {
    ctx.RenameFolderModal = payload;
  };

  // Media & UI Functions
  ctx.videoStreaming = function() {
    const _self = this;
    var url = _self.videoContent;
    const video = this.$refs.videoStreaming;

    let extension = url.split(".").pop();
    debug.log("tage url", url);
    debug.log("tage video", video);
    debug.log("extension video", extension);
    const defaultOptions = {};

    const player = new Plyr(video, defaultOptions);
    player.on('timeupdate', (event) => {
      const instance = event.detail.plyr;
      debug.log(instance);
    });
  };

  ctx.compressBase64Image = function(base64String, maxSizeKB = 100) {
    debug.log(`Starting compressBase64Image, target size: ${maxSizeKB}KB`);
    return new Promise((resolve) => {
      // เพิ่ม timeout 10 วินาที
      const timeout = setTimeout(() => {
        debug.log('compressBase64Image timeout after 10 seconds');
        resolve(base64String); // fallback กลับไปใช้ต้นฉบับ
      }, 10000);

      const img = new Image();
      img.onload = () => {
        debug.log(`Image loaded for compression, size: ${img.width}x${img.height}`);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // คำนวณขนาดใหม่ตามอัตราส่วน - ลดขนาดให้เล็กลง
          let { width, height } = img;
          const maxDimension = 200;  // ลดจาก 400 เป็น 200
          
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          // วาดภาพลงบน canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // เริ่มจากคุณภาพสูง แล้วค่อยลดลง
          let quality = 0.9;
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          // ลดคุณภาพจนกว่าจะได้ขนาดที่ต้องการ
          while (compressedBase64.length > (maxSizeKB * 1024 * 4/3) && quality > 0.1) {
            quality -= 0.1;
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          }
          
          debug.log(`Image compressed to quality: ${quality}, final size: ${Math.round(compressedBase64.length / 1024)}KB`);
          clearTimeout(timeout);
          resolve(compressedBase64);
          
        } catch (error) {
          debug.log('Error in compressBase64Image:', error);
          clearTimeout(timeout);
          resolve(base64String); // fallback กลับไปใช้ต้นฉบับ
        }
      };
      
      img.onerror = () => {
        debug.log('Error loading image for compression');
        clearTimeout(timeout);
        resolve(base64String); // fallback กลับไปใช้ต้นฉบับ
      };
      
      img.src = base64String;
    });
  };

  ctx.handleFilesUpload = function() {
    // ตรวจสอบ permission ใน share mode
    if (this.isShareMode && this.shareRootPermission === 'read') {
      this.$notify.error('คุณไม่มีสิทธิ์อัพโหลดไฟล์ในโหมดดูอย่างเดียว');
      return;
    }
    
    let uploadedFiles = this.$refs.files.files;
    for (var i = 0; i < uploadedFiles.length; i++) {
      uploadedFiles[i].status = 'pending';
      this.files.push(uploadedFiles[i]);
      debug.log('Uploaded file name:', uploadedFiles[i].name);
    }
    debug.log(this.files);
  };

  // Selection & Callback Functions
  ctx.selectFileFunc = function(obj, duration, thumbnail) {
    // ใช้ finalUrl ถ้ามี (สำหรับ video resolution) ไม่งั้นใช้ path หรือ obj
    let filePath = obj.finalUrl || obj.path || obj;
    let fileName = obj.name ? obj.name : (obj.path ? obj.path.split("/").pop() : filePath.split("/").pop()); // Extract filename
    
    // สำหรับการตรวจสอบ extension ใช้ original path หรือ path เดิม ไม่ใช่ finalUrl
    let extensionCheckPath = obj.original || obj.path || filePath;
    let extension = extensionCheckPath.split(".").pop(); // ใช้ path เดิมสำหรับตรวจสอบ extension
    
    // ตรวจสอบและแปลง UID เป็น URL เต็มสำหรับ HLS stream
    // ตรวจสอบหลายเงื่อนไข: selectedResolution === 'stream', resolution === 'stream', หรือ transcode.stream
    const isStreamResolution = obj.selectedResolution === 'stream' || 
                                obj.resolution === 'stream' ||
                                (obj.transcode && obj.transcode.stream && filePath === obj.transcode.stream);
    
    if (isStreamResolution && filePath && !filePath.startsWith('http')) {
      // เป็น UID ให้สร้าง URL เต็ม
      filePath = `https://customer-apw77h9sea196rll.cloudflarestream.com/${filePath}/manifest/video.m3u8`;
      console.log("🔄 Converted UID to full URL:", filePath);
    }
    
    let fileArray = this.AllowFile;
    let callbackValue = this.CallbackFunc;
    let found = fileArray.find(element => element == extension);

    // Use obj.duration if it exists, otherwise use duration parameter
    const fileDuration = obj.duration || duration;
    const fileThumbnail = obj.thumbnail || thumbnail;

    console.log("🎯 selectFileFunc called with:");
    console.log("- filePath (final URL):", filePath);
    console.log("- fileName:", fileName);
    console.log("- extensionCheckPath:", extensionCheckPath);
    console.log("- extension:", extension);
    console.log("- found extension match:", found);
    console.log("- obj structure:", obj);
    console.log("- selectedResolution:", obj.selectedResolution);
    console.log("- resolution:", obj.resolution);
    console.log("- isStreamResolution:", isStreamResolution);

    if (found !== undefined) {
      const triggerData = {
        file: filePath, // Use the final URL (converted from UID if needed)
        filename: fileName, // Add filename to the trigger data
        duration: fileDuration, // Use the selected duration value
        thumbnail: fileThumbnail,
        callback: callbackValue,
        // เพิ่มข้อมูลเพิ่มเติมสำหรับ video resolution
        selectedResolution: obj.selectedResolution || obj.resolution,
        originalFile: obj.originalFile || obj,
        finalUrl: filePath // Use the converted URL
      }
      debug.log("triggerData",triggerData);
      this.$emit('select-file-trigger', triggerData);
      console.log("select-file-trigger",triggerData);
    } else {
      console.log("❌ Extension not allowed:", extension);
      debug.log("Callback", callbackValue);
    }
  };

  // Video resolution selection for popup mode
  ctx.showVideoResolutionSelector = function(file) {
    if (!file.transcode || Object.keys(file.transcode).length === 0) {
      // ถ้าไม่มี transcode ให้เลือกไฟล์ปกติ
      this.selectFileFunc(file, file?.duration, file?.thumbnail);
      return;
    }
    
    this.selectedFile = file;
    this.selectedFileResolutions = file.transcode;
    this.showResolutionSelector = true;
    
    // โหลดขนาดไฟล์ของแต่ละความละเอียด
    this.loadTranscodeFileSizes(file);
  };

  ctx.selectVideoWithResolution = function(resolution = 'original') {
    if (!this.selectedFile) return;
    
    const file = this.selectedFile;
    let selectedFile = file;
    
    if (resolution !== 'original' && file.transcode && file.transcode[resolution]) {
      // สร้าง file object ใหม่สำหรับความละเอียดที่เลือก
      selectedFile = {
        ...file,
        path: file.transcode[resolution], // ใช้ URL ของความละเอียดที่เลือก
        name: file.name.replace(/\.[^/.]+$/, `-${resolution}.$&`), // เพิ่ม resolution ในชื่อไฟล์
        resolution: resolution,
        originalFile: file // เก็บข้อมูลไฟล์ต้นฉบับ
      };
    }
    
    this.selectFileFunc(selectedFile, selectedFile?.duration, selectedFile?.thumbnail);
    this.closeResolutionSelector();
  };

  ctx.closeResolutionSelector = function() {
    this.showResolutionSelector = false;
    this.selectedFile = null;
    this.selectedFileResolutions = {};
  };

  // Helper method สำหรับตรวจสอบว่าไฟล์เป็นวิดีโอที่มี transcode หรือไม่
  ctx.hasVideoTranscode = function(file) {
    return file && file.type === 'media' && file.transcode && Object.keys(file.transcode).length > 0;
  };

  // Helper method สำหรับดึงรายการความละเอียดที่มี
  ctx.getAvailableResolutions = function(file) {
    if (!this.hasVideoTranscode(file)) return [];
    return Object.keys(file.transcode).sort((a, b) => {
      const resolutionOrder = {
        '240p': 1, '360p': 2, '480p': 3, '720p': 4, '1080p': 5, '1440p': 6, '2160p': 7
      };
      return (resolutionOrder[a] || 999) - (resolutionOrder[b] || 999);
    });
  };

  // Helper method สำหรับดึงขนาดไฟล์ของ transcode
  ctx.getTranscodeFileSize = function(file, resolution) {
    if (!file || !file.transcode || !file.transcode[resolution]) {
      return 'ไม่ทราบขนาด';
    }
    
    // ถ้า transcode เก็บเป็น object ที่มี URL และ size
    if (typeof file.transcode[resolution] === 'object' && file.transcode[resolution].size) {
      return this.formatBytes(file.transcode[resolution].size);
    }
    
    // ถ้า transcode เก็บเป็น string (URL) เราต้องประมาณขนาดไฟล์
    // โดยปกติไฟล์ที่ transcode จะมีขนาดเล็กกว่าต้นฉบับ
    if (file.size && typeof file.transcode[resolution] === 'string') {
      const estimatedSizeRatio = {
        '240p': 0.1,  // ประมาณ 10% ของต้นฉบับ
        '360p': 0.2,  // ประมาณ 20% ของต้นฉบับ  
        '480p': 0.3,  // ประมาณ 30% ของต้นฉบับ
        '720p': 0.5,  // ประมาณ 50% ของต้นฉบับ
        '1080p': 0.7, // ประมาณ 70% ของต้นฉบับ
        '1440p': 0.85, // ประมาณ 85% ของต้นฉบับ
        '2160p': 0.9   // ประมาณ 90% ของต้นฉบับ
      };
      
      const ratio = estimatedSizeRatio[resolution] || 0.5;
      const estimatedSize = Math.round(file.size * ratio);
      return `~${this.formatBytes(estimatedSize)}`;
    }
    
    return 'ไม่ทราบขนาด';
  };

  // Helper method สำหรับเปรียบเทียบขนาดไฟล์
  ctx.getFileSizeComparison = function(file, resolution) {
    if (!file || !file.size) return '';
    
    const estimatedSizeRatio = {
      '240p': 0.1, '360p': 0.2, '480p': 0.3, '720p': 0.5, 
      '1080p': 0.7, '1440p': 0.85, '2160p': 0.9
    };
    
    const ratio = estimatedSizeRatio[resolution];
    if (ratio) {
      const savings = Math.round((1 - ratio) * 100);
      return `ประหยัด ${savings}%`;
    }
    
    return '';
  };

  // Helper method สำหรับ label ของ resolution
  ctx.getResolutionLabel = function(resolution) {
    const labels = {
      '240p': 'เบสิก',
      '360p': 'มาตรฐาน', 
      '480p': 'ดี',
      '720p': 'HD',
      '1080p': 'Full HD',
      '1440p': '2K',
      '2160p': '4K'
    };
    
    return labels[resolution] || 'ปรับขนาด';
  };

  // Helper method สำหรับคำอธิบายของ resolution
  ctx.getResolutionDescription = function(resolution) {
    const descriptions = {
      '240p': 'ประหยัดพื้นที่',
      '360p': 'แชร์ทั่วไป', 
      '480p': 'ดูบนมือถือ',
      '720p': 'ดูบนคอมพิวเตอร์',
      '1080p': 'ดูบนทีวี',
      '1440p': 'หน้าจอ QHD',
      '2160p': 'หน้าจอ 4K'
    };
    
    return descriptions[resolution] || 'ใช้งานทั่วไป';
  };

  // Helper method สำหรับ CSS class ของ resolution badge
  ctx.getResolutionBadgeClass = function(resolution) {
    const classes = {
      '240p': 'bg-gray-100 text-gray-700',
      '360p': 'bg-blue-100 text-blue-700', 
      '480p': 'bg-green-100 text-green-700',
      '720p': 'bg-yellow-100 text-yellow-700',
      '1080p': 'bg-orange-100 text-orange-700',
      '1440p': 'bg-purple-100 text-purple-700',
      '2160p': 'bg-red-100 text-red-700'
    };
    
    return classes[resolution] || 'bg-gray-100 text-gray-700';
  };

  // Helper method สำหรับโหลดขนาดไฟล์จริงของ transcode
  ctx.loadTranscodeFileSizes = async function(file) {
    if (!file || !file.transcode) return;
    
    // เซ็ตขนาดไฟล์ต้นฉบับ
    this.transcodeFileSizes['original'] = file.size;
    
    // โหลดขนาดไฟล์ของแต่ละความละเอียด
    for (const [resolution, url] of Object.entries(file.transcode)) {
      try {
        // ใช้ HEAD request เพื่อดึงขนาดไฟล์โดยไม่ต้องดาวน์โหลด
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            this.transcodeFileSizes[resolution] = parseInt(contentLength);
          }
        }
      } catch (error) {
        console.warn(`ไม่สามารถโหลดขนาดไฟล์สำหรับ ${resolution}:`, error);
        // ถ้าโหลดไม่ได้ ให้ใช้การประมาณ
        const estimatedSizeRatio = {
          '240p': 0.1, '360p': 0.2, '480p': 0.3, '720p': 0.5, 
          '1080p': 0.7, '1440p': 0.85, '2160p': 0.9
        };
        const ratio = estimatedSizeRatio[resolution] || 0.5;
        this.transcodeFileSizes[resolution] = Math.round(file.size * ratio);
      }
    }
  };

  // === BATCH 6: UPLOAD MANAGEMENT & HELPER FUNCTIONS ===
  
  // Upload Management Functions
  ctx.addDroppedFiles = function(files) {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      file.status = 'pending';
      file.progress = 0;
      this.files.push(file);
    });

    // เปิด upload panel หากยังไม่เปิด
    if (!this.uploadPanel && !this.showMiniUploader) {
      this.openUploadBox();
    } else if (!this.uploadPanel && this.showMiniUploader) {
      // ถ้ามี mini panel อยู่แล้วก็แค่อัพเดท
      this.showMiniUploader = true;
    }
  };

  ctx.cancelUpload = async function(fileName) {
    const upload = this.uploadControllers.get(fileName);
    if (upload) {
      try {
        await upload.abort();
        this.uploadControllers.delete(fileName);
        
        const file = this.files.find(f => f.name === fileName);
        if (file) {
          file.status = 'cancelled';
          file.progress = 0;
        }
        
        this.$forceUpdate();
      } catch (error) {
        debug.log(`Error cancelling upload for ${fileName}:`, error);
      }
    }
  };

  ctx.resumeUpload = async function(fileName) {
    const file = this.files.find(f => f.name === fileName);
    if (!file) return;

    // เปลี่ยนสถานะเป็น pending เพื่อให้สามารถอัปโหลดใหม่ได้
    file.status = 'pending';
    file.progress = 0;
    this.$forceUpdate();

    // เรียกใช้ submitFiles แต่เฉพาะไฟล์ที่ต้องการ resume
    await this.resumeFailedUploads();
  };

  // Helper Functions
  ctx.updateFileNameInArrays = function(fileId, oldName, newName) {
    // อัพเดต fileListing
    const fileIndex = this.fileListing.findIndex(f => f._id === fileId);
    if (fileIndex !== -1) {
      this.fileListing[fileIndex].name = newName;
      
      // อัพเดต path, url, thumbnail ที่มีชื่อไฟล์
      ['path', 'url', 'thumbnail'].forEach(field => {
        if (this.fileListing[fileIndex][field]) {
          this.fileListing[fileIndex][field] = this.fileListing[fileIndex][field].replace(oldName, newName);
        }
      });
    }
    
    // อัพเดต fileList (S3 style list) ถ้ามี
    if (this.fileList && Array.isArray(this.fileList)) {
      const s3FileIndex = this.fileList.findIndex(f => f.title === oldName);
      if (s3FileIndex !== -1) {
        this.fileList[s3FileIndex].title = newName;
        if (this.fileList[s3FileIndex].prefix) {
          this.fileList[s3FileIndex].prefix = this.fileList[s3FileIndex].prefix.replace(oldName, newName);
        }
      }
    }
    
    debug.log(`Updated file name in all arrays: ${oldName} -> ${newName}`);
    
    // Force reactivity update
    this.$forceUpdate();
  };

  // Keyboard Shortcuts Handler
  ctx.onKeyboardShortcuts = function(evt) {
    // ตรวจสอบว่า focus อยู่ใน input field หรือไม่
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
    
    // ถ้า focus อยู่ใน input field ให้ข้ามการทำงานของ shortcuts
    if (isInputFocused) {
      return;
    }
    
    // ESC: ถ้ามี modal เปิดอยู่ ให้ปิด modal ก่อน, ไม่ใช่ clear selection
    if (evt.key === 'Escape') {
      // ถ้ามี modal เปิดอยู่ ให้ปิดและไม่ทำอะไรต่อ
      if (ctx.showModal) {
        ctx.showModal = false;
        return;
      }
      
      // ถ้าไม่มี modal แต่มีไฟล์เลือกอยู่ ให้ clear selection
      if (ctx.selectedFiles.size > 0) {
        ctx.clearSelection();
        return;
      }
      
      // ไม่มีทั้ง modal และ selection ให้ event bubble ขึ้นไป
      return;
    }
    
    // Ctrl+A หรือ Cmd+A: Select All
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'a') {
      evt.preventDefault();
      ctx.selectAllFiles();
    }
    
    // Delete key: Delete selected files
    if (evt.key === 'Delete' && ctx.selectedFiles.size > 0) {
      evt.preventDefault();
      ctx.batchDeleteFiles();
    }
  };

  // Utility Computation Functions
  ctx.isS3Ready = function() {
    return !!(this.S3 && this.configs?.s3Bucket);
  };

  ctx.requestKey = function() {
    return this.isShareMode ? this.hostkey : this.hostkey;
  };

  ctx.imageSource = function() {
    let filePath = this.selectFile.thumbnail || this.selectFile.path;
    return filePath;
  };

  ctx.sectionHeight = function() {
    const windowHeight = window.innerHeight;
    const sectionRatio = 0.6;
    const calculatedHeight = `${windowHeight * sectionRatio}px`;
    return calculatedHeight;
  };

  // Business Logic Functions
  ctx.saveShareSettings = async function() {
    if (!this.shareEnabled) {
      this.showToast('กรุณาเปิดการแชร์ก่อนบันทึกการตั้งค่า', 'warning');
      return;
    }

    try {
      const payload = {
        data: {}
      };

      // เพิ่มรหัสผ่านถ้ามีการตั้งค่า
      if (this.shareHasPassword && this.sharePassword) {
        payload.data.sharePassword = this.sharePassword;
      } else {
        payload.data.sharePassword = null;
      }
      
      // เพิ่มวันหมดอายุถ้ามีการตั้งค่า
      if (this.shareHasExpiry && this.shareExpiryDate) {
        payload.data.shareExpiryDate = new Date(this.shareExpiryDate).toISOString();
      } else {
        payload.data.shareExpiryDate = null;
      }
      
      // เพิ่มสิทธิ์การเข้าถึง
      payload.data.sharePermission = this.sharePermission;

      const { status } = await this.$Request.PUT(`storage/${this.shareSelectedFolderId}`, payload, this.requestKey());

      if (status === 200) {
        // อัพเดทข้อมูลใน fileListing ด้วย
        const itemIndex = this.fileListing.findIndex(item => item._id === this.shareSelectedFolderId);
        if (itemIndex !== -1) {
          this.fileListing[itemIndex].sharePassword = payload.data.sharePassword;
          this.fileListing[itemIndex].shareExpiryDate = payload.data.shareExpiryDate;
        }
        
        this.showToast('บันทึกการตั้งค่าการแชร์เรียบร้อยแล้ว', 'success');
        
        // รีเฟรช UI
        this.$forceUpdate();
      } else {
        this.showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
      }
    } catch (error) {
      console.error('Error saving share settings:', error);
      this.showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    }
  };

  ctx.regenerateThumbnail = async function(file) {
    // ใน share mode ไม่สามารถทำงานได้เพราะไม่มี S3 credentials
    if (this.isShareMode) {
      toast({ type: 'warning', message: 'ฟีเจอร์นี้ไม่สามารถใช้งานได้ในโหมดแชร์' });
      return;
    }
    
    if (!this.configs.s3Endpoint) {
      toast({ type: 'error', message: 'ไม่พบการตั้งค่า S3' });
      return;
    }

    // รองรับทั้งรูปภาพและวีดีโอ
    if (!file.path || (file.type !== 'image' && file.type !== 'media')) {
      debug.log('Cannot regenerate thumbnail for file type:', file.type, 'file:', file.name);
      toast({ type: 'warning', message: 'ไม่สามารถสร้าง thumbnail สำหรับไฟล์ประเภทนี้ได้' });
      return;
    }

    try {
      debug.log('Regenerating thumbnail for:', file.name, 'type:', file.type);
      const toastInstance = toast({ type: 'pending', message: `กำลังสร้าง thumbnail ใหม่สำหรับ ${file.name}...` });
      
      const fileUrl = this.configs.s3Endpoint + file.path;
      let finalCompressedBase64;

      // ตรวจสอบประเภทไฟล์และใช้วิธีการที่เหมาะสม
      if (file.type === 'image') {
        // สร้าง thumbnail สำหรับรูปภาพ โดยใช้ฟังก์ชันที่แก้ไขแล้ว
        debug.log(`Processing image thumbnail for regeneration: ${file.name}`);
        finalCompressedBase64 = await this.processImageThumbnail(fileUrl, file._id);
        
      } else if (file.type === 'media') {
        // สร้าง thumbnail สำหรับวีดีโอ
        debug.log('Generating video thumbnail for:', file.name);
        finalCompressedBase64 = await this.captureThumbnailForRegenerate(fileUrl);
        
        if (!finalCompressedBase64) {
          // ถ้าล้มเหลว ให้ใช้ fallback
          debug.log('Video thumbnail generation failed, using fallback');
          finalCompressedBase64 = await this.generateFallbackThumbnailForRegenerate();
        }
      }

      debug.log(`Final thumbnail base64 size: ${Math.round(finalCompressedBase64.length * 0.75 / 1024)}KB`);
      
      // อัปเดต thumbnail ในฐานข้อมูล
      await this.thumbnailFile(file._id, finalCompressedBase64);
      
      // อัปเดต thumbnail ใน local state
      const listingIndex = this.fileListing.findIndex(f => f._id === file._id);
      if (listingIndex !== -1) {
        this.fileListing[listingIndex].thumbnail = finalCompressedBase64;
      }
      
      debug.log(`Thumbnail regenerated successfully for: ${file.name}`);
      toastInstance.hide(`สร้าง thumbnail ใหม่สำเร็จ: ${file.name}`, 'success');
      
      this.$forceUpdate();
      
    } catch (error) {
      debug.log(`Error regenerating thumbnail for ${file.name}:`, error);
      toast({ type: 'error', message: `เกิดข้อผิดพลาดในการสร้าง thumbnail: ${file.name}` });
      throw error;
    }
  };

  // Helper function สำหรับสร้าง video thumbnail ใน regenerate
  ctx.captureThumbnailForRegenerate = async function(videoUrl) {
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.preload = 'metadata';
      video.muted = true;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 15000);
        video.addEventListener('loadeddata', () => { clearTimeout(timeout); resolve(); }, { once: true });
        video.addEventListener('error', (e) => { clearTimeout(timeout); reject(e); }, { once: true });
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');

      let seekTime = 1;
      if (isFinite(video.duration) && video.duration > 0) {
        seekTime = Math.min(Math.max(1, video.duration / 3), 10);
      }
      
      video.currentTime = seekTime;
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video seek timeout')), 10000);
        video.addEventListener('seeked', () => { clearTimeout(timeout); resolve(); }, { once: true });
        video.addEventListener('error', (e) => { clearTimeout(timeout); reject(e); }, { once: true });
      });

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.6);
      
      video.remove();
      
      return await this.compressBase64Image(thumbnail, 80);
    } catch (error) {
      debug.log('Error in captureThumbnailForRegenerate:', error);
      return null;
    }
  };

  // Helper function สำหรับสร้าง fallback thumbnail ใน regenerate
  ctx.generateFallbackThumbnailForRegenerate = async function() {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px Arial';
    ctx.fillText('Video', canvas.width / 2, canvas.height / 2 + 40);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  ctx.regenerateAllThumbnails = async function() {
    // ใน share mode ไม่สามารถทำงานได้เพราะไม่มี S3 credentials
    if (this.isShareMode) {
      toast({ type: 'warning', message: 'ฟีเจอร์นี้ไม่สามารถใช้งานได้ในโหมดแชร์' });
      return;
    }
    
    const imageFiles = this.files.filter(file => file.type === 'image');
    
    if (imageFiles.length === 0) {
      toast({ type: 'info', message: 'ไม่พบไฟล์รูปภาพในโฟลเดอร์นี้' });
      return;
    }
    
    const toastInstance = toast({ 
      type: 'pending', 
      message: `กำลังสร้าง thumbnail ใหม่สำหรับ ${imageFiles.length} ไฟล์...` 
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of imageFiles) {
      try {
        await this.regenerateThumbnail(file);
        successCount++;
      } catch (error) {
        errorCount++;
        debug.log(`Failed to regenerate thumbnail for ${file.name}:`, error);
      }
    }
    
    toastInstance.hide(
      `สร้าง thumbnail ใหม่เสร็จแล้ว: สำเร็จ ${successCount} ไฟล์${errorCount > 0 ? `, ล้มเหลว ${errorCount} ไฟล์` : ''}`, 
      errorCount > 0 ? 'warning' : 'success'
    );
  };

  // Share Functions
  ctx.openShareFolder = function(folderName, folderId) {
    return LogicFunctions.openShareFolder(ctx, folderName, folderId);
  };

  ctx.toggleShareStatus = async function() {
    console.log('🎯 toggleShareStatus wrapper called');
    return LogicFunctions.toggleShareStatus(ctx);
  };

  ctx.generateSecureShareKey = function() {
    return LogicFunctions.generateSecureShareKey();
  };

  ctx.calculateDaysFromExpiry = function() {
    if (ctx.shareExpiryDate) {
      ctx.shareDaysFromExpiry = LogicFunctions.calculateDaysFromExpiry(ctx.shareExpiryDate);
    }
  };

  // Attach Context Menu Functions
  attachContextFunctions(ctx);

  // Attach Upload Functions
  attachUploadFunctions(ctx);
  
  // Attach Drag & Drop Functions
  attachDragDropFunctions(ctx);
  
  // Attach Media Functions (Image, Video, Streaming)
  attachMediaFunctions(ctx);
  // Debug function สำหรับตรวจสอบการทำงานของ video thumbnail
  ctx.debugVideoThumbnail = async function() {
    if (!this.configs.s3Endpoint) {
      console.log('❌ S3 Endpoint not configured');
      return;
    }

    console.log('🔍 Video Thumbnail Debug Information:');
    console.log('S3 Endpoint:', this.configs.s3Endpoint);
    console.log('Current prefix:', this.prefix);
    console.log('Share mode:', this.isShareMode);
    
    // ค้นหาไฟล์วีดีโอทั้งหมด
    const videoFiles = this.fileListing.filter(f => f.type === 'media');
    console.log(`📹 Found ${videoFiles.length} video files:`);
    
    videoFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   - ID: ${file._id}`);
      console.log(`   - Path: ${file.path}`);
      console.log(`   - Full URL: ${this.configs.s3Endpoint + file.path}`);
      console.log(`   - Has thumbnail: ${!!file.thumbnail}`);
      console.log(`   - Thumbnail size: ${file.thumbnail ? Math.round(file.thumbnail.length * 0.75 / 1024) + 'KB' : 'N/A'}`);
      console.log('   ---');
    });

    // ทดสอบสร้าง thumbnail สำหรับไฟล์แรก
    if (videoFiles.length > 0) {
      const testFile = videoFiles[0];
      console.log(`🧪 Testing thumbnail generation for: ${testFile.name}`);
      
      try {
        const videoUrl = this.configs.s3Endpoint + testFile.path;
        console.log(`Testing URL: ${videoUrl}`);
        
        await this.captureThumbnail(videoUrl, testFile._id);
        console.log('✅ Test completed - check console for detailed logs');
        
      } catch (error) {
        console.error('❌ Test failed:', error);
      }
    } else {
      console.log('⚠️ No video files found to test');
    }
  };
  
  // Attach File Browser Functions
  attachFileBrowserFunctions(ctx);
  
  // Attach Batch Operations Functions
  attachBatchOperationsFunctions(ctx);

  // Execute Action for dropdown menu
  ctx.executeAction = function(action) {
    console.log('🎯 Executing action:', action);
    
    // ปิด dropdown menu
    this.showActionsDropdown = false;
    
    switch(action) {
      case 'createFolder':
        this.openCreateFolder();
        break;
        
      case 'upload':
        this.openUploadBox();
        break;
        
      case 'streaming':
        // เก่า - แสดง stream menu
        this.showStreamMenu = true;
        break;
        
      case 'videoTrim':
        this.openVideoTrimmerForSelected();
        break;
        
      case 'makeStreaming':
        this.makeStreamingForSelected();
        break;
        
      case 'refresh':
        this.isRefreshLoading = true;
        // ใช้ debouncedList ที่มี context ถูกต้องแล้ว
        if (this.debouncedList && typeof this.debouncedList === 'function') {
          this.debouncedList();
          // ให้เวลา debounce ทำงานแล้วปิด loading
          setTimeout(() => {
            this.isRefreshLoading = false;
          }, 500);
        } else {
          console.error('❌ debouncedList not available for refresh action');
          this.isRefreshLoading = false;
        }
        break;
        
      case 'batchResize': {
        // สำหรับปรับขนาดรูปทั้งหมด
        const imageFiles = this.fileListing.filter(f => f.type === 'image');
        if (imageFiles.length > 0) {
          this.batchResizeImages(imageFiles);
        }
        break;
      }
        
      default:
        console.warn('Unknown action:', action);
    }
  };
  
  // Attach Client-side Image Processor
  import('./clientImageProcessor.js').then(module => {
    module.default(ctx);
    debug.log('🎨 Client-side image processor loaded successfully');
  }).catch(error => {
    debug.log('❌ Failed to load client-side image processor:', error);
  });
}
