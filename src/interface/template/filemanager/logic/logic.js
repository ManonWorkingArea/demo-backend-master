// Utility functions for file management
import storageManager from '@/plugins/storage';
import toast from '@/utils/toast';
import dialog from '@/plugins/Dialog.js';

export function isImage(src) {
  return src.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

export function isVideoFile(file) {
  return file.mimetype && file.mimetype.startsWith('video/');
}

export function isAudioFile(file) {
  return file.mimetype && file.mimetype.startsWith('audio/');
}

export function isImageFile(file) {
  return file.mimetype && file.mimetype.startsWith('image/');
}

export function formatBytes(bytes) {
  var marker = 1024; // Change to 1000 if required
  var decimal = 3; // Change as required
  var kiloBytes = marker; // One Kilobyte is 1024 bytes
  var megaBytes = marker * marker; // One MB is 1024 KB
  var gigaBytes = marker * marker * marker; // One GB is 1024 MB
  if(bytes < kiloBytes) return bytes + " Bytes";
  else if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
  else if(bytes < gigaBytes) return(bytes / megaBytes).toFixed(decimal) + " MB";
  else return(bytes / gigaBytes).toFixed(decimal) + " GB";
}

export function formatDate(dateString) {
  // ตรวจสอบว่า dateString มีค่าและไม่เป็น null หรือ undefined
  if (!dateString) {
    return '-';
  }
  
  try {
    const date = new Date(dateString);
    
    // ตรวจสอบว่าวันที่ที่สร้างขึ้นถูกต้องหรือไม่
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('th-TH', {dateStyle: 'long'}).format(date);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return '-';
  }
}

export function getFileName(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
}

export function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex);
}

export function getShareItemType(fileListing, shareSelectedFolderId) {
  if (!shareSelectedFolderId) return '';
  
  const currentItem = fileListing.find(item => item._id === shareSelectedFolderId);
  return currentItem?.mimetype === 'folder' ? 'โฟลเดอร์' : 'ไฟล์';
}

export function generateSecureShareKey() {
  // สร้าง random string ที่ปลอดภัย ขนาด 32 ตัวอักษร
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(32);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < randomArray.length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
}

export function togglePasswordVisibility(currentState) {
  return !currentState;
}

export function calculateExpiryFromDays(shareExpiryDays) {
  if (shareExpiryDays && shareExpiryDays > 0) {
    const today = new Date();
    const expiryDate = new Date(today.getTime() + (shareExpiryDays * 24 * 60 * 60 * 1000));
    return expiryDate.toISOString().split('T')[0];
  }
  return null;
}

export function calculateDaysFromExpiry(shareExpiryDate) {
  if (shareExpiryDate) {
    const today = new Date();
    const expiryDate = new Date(shareExpiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  return null;
}

export function formatDuration(duration) {
  const totalSeconds = parseFloat(duration);
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

export function toggleLayout(currentLayout) {
  return currentLayout === 'grid' ? 'list' : 'grid';
}

export function toggleMobileSidebar(currentState) {
  return !currentState;
}

export function setFilterByType(type) {
  return type;
}

export function selectAllFiles(fileListing, selectedFiles) {
  const newSelectedFiles = new Set(selectedFiles);
  fileListing.forEach(file => {
    if (file._id && file.mimetype !== 'folder') {
      newSelectedFiles.add(file._id);
    }
  });
  return newSelectedFiles;
}

export function clearSelection() {
  return {
    selectedFiles: new Set(),
    isMultiSelectMode: false,
    lastSelectedIndex: -1
  };
}

export function isFileSelected(fileId, selectedFiles) {
  if (!fileId) return false;
  return selectedFiles.has(fileId);
}

export function unselectItem() {
  return {
    selectItem: '',
    selectItemData: '',
    hasSelected: false
  };
}

// === SET 10: FILE SELECTION & CLICK HANDLING FUNCTIONS ===

export function toggleFileSelection(fileId, event, selectedFiles, debug) {
  if (!fileId) {
    console.log('❌ toggleFileSelection: fileId is undefined');
    debug.log('toggleFileSelection: fileId is undefined');
    return {
      selectedFiles: new Set(selectedFiles),
      isMultiSelectMode: selectedFiles.size > 0
    };
  }
  
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  
  console.log('🔄 toggleFileSelection called:', fileId);
  debug.log('=== File Selection Toggle ===');
  debug.log('FileId:', fileId);
  debug.log('Current selected files:', Array.from(selectedFiles));
  
  const newSelectedFiles = new Set(selectedFiles);
  
  if (newSelectedFiles.has(fileId)) {
    newSelectedFiles.delete(fileId);
    console.log('➖ File deselected:', fileId);
    debug.log('File deselected:', fileId);
  } else {
    newSelectedFiles.add(fileId);
    console.log('➕ File selected:', fileId);
    debug.log('File selected:', fileId);
  }
  
  const isMultiSelectMode = newSelectedFiles.size > 0;
  console.log(`📊 Total selected: ${newSelectedFiles.size} files`);
  debug.log(`Updated selected files: ${Array.from(newSelectedFiles)}, total: ${newSelectedFiles.size}`);
  debug.log('Multi-select mode:', isMultiSelectMode);
  
  return {
    selectedFiles: newSelectedFiles,
    isMultiSelectMode
  };
}

export function handleCtrlClick(fileId, event, selectedFiles, debug) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  return toggleFileSelection(fileId, event, selectedFiles, debug);
}

export function handleShiftClick(fileId, event, fileListing, selectedFiles, lastSelectedIndex, debug) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const currentIndex = fileListing.findIndex(f => f._id === fileId);
  const newSelectedFiles = new Set(selectedFiles);
  let newLastSelectedIndex = lastSelectedIndex;
  
  if (lastSelectedIndex !== -1 && currentIndex !== -1) {
    const start = Math.min(lastSelectedIndex, currentIndex);
    const end = Math.max(lastSelectedIndex, currentIndex);
    
    // เลือกไฟล์ในช่วงที่กำหนด
    for (let i = start; i <= end; i++) {
      if (fileListing[i] && fileListing[i]._id) {
        newSelectedFiles.add(fileListing[i]._id);
      }
    }
  } else {
    newSelectedFiles.add(fileId);
  }
  
  newLastSelectedIndex = currentIndex;
  debug.log(`Shift selection: ${newSelectedFiles.size} files selected`);
  
  return {
    selectedFiles: newSelectedFiles,
    isMultiSelectMode: true,
    lastSelectedIndex: newLastSelectedIndex
  };
}

export function handleFileClick(fileId, event, isMultiSelectMode, fileListing, selectedFiles, debug, clearSelectionFn) {
  if (!fileId) {
    debug.log('handleFileClick: fileId is undefined');
    return {
      selectedFiles: new Set(selectedFiles),
      isMultiSelectMode,
      shouldExecuteCallback: false
    };
  }
  
  if (event && (event.ctrlKey || event.metaKey)) {
    const ctrlResult = handleCtrlClick(fileId, event, selectedFiles, debug);
    return {
      ...ctrlResult,
      shouldExecuteCallback: false
    };
  } else if (event && event.shiftKey) {
    // Note: This requires additional parameters that would be passed from context
    return {
      selectedFiles: new Set(selectedFiles),
      isMultiSelectMode,
      shouldExecuteCallback: false,
      needsShiftClickHandling: true
    };
  } else {
    // ถ้าไม่มี modifier keys และไม่ได้อยู่ในโหมด multi-select
    // ให้ทำงานปกติ (เปิดไฟล์)
    if (!isMultiSelectMode) {
      const file = fileListing.find(f => f._id === fileId);
      if (file && file.name) {
        return {
          selectedFiles: new Set(selectedFiles),
          isMultiSelectMode,
          shouldExecuteCallback: true,
          callbackType: 'openViewFile',
          callbackParam: file.name
        };
      } else {
        debug.log('handleFileClick: file not found for fileId:', fileId);
        return {
          selectedFiles: new Set(selectedFiles),
          isMultiSelectMode,
          shouldExecuteCallback: false
        };
      }
    } else {
      // ถ้าอยู่ในโหมด multi-select ให้เลือกเฉพาะไฟล์นี้
      const clearResult = clearSelectionFn();
      const newSelectedFiles = new Set();
      newSelectedFiles.add(fileId);
      
      return {
        selectedFiles: newSelectedFiles,
        isMultiSelectMode: true,
        lastSelectedIndex: clearResult.lastSelectedIndex,
        shouldExecuteCallback: false
      };
    }
  }
}

export function stopVideoPlayback(refs) {
  // Stop the default HTML5 video element
  const videoElement = refs.videoStreaming;
  if (videoElement && !videoElement.paused) {
    videoElement.pause();
    videoElement.currentTime = 0; // Reset playback position
  }

  // Stop Vue HLS Video Player (if used)
  if (refs.videoPlayer && refs.videoPlayer.pause) {
    refs.videoPlayer.pause();
  }
}

export function countInnerObj(string, word) {
  return string.split(word).length - 1;
}

export function clearImageErrors(imageLoadErrors, forceUpdate) {
  imageLoadErrors.clear();
  forceUpdate();
}

export function toggleSearchInPopup(currentState, searchQuery, nextTick, focusCallback) {
  const newState = !currentState;
  let newSearchQuery = searchQuery;
  
  if (newState) {
    // Focus on search input after it's shown
    nextTick(() => {
      if (focusCallback) focusCallback();
    });
  } else {
    // Clear search when hiding
    newSearchQuery = '';
  }
  
  return { showSearchInPopup: newState, searchQuery: newSearchQuery };
}

// UI Toggle Functions
export function toggleStreamMenu(currentState) {
  return !currentState;
}

export function toggleActionsDropdown(currentState) {
  return !currentState;
}

export function toggleTranscodeDropdown(currentState) {
  return !currentState;
}

// Modal Functions
export function openModal() {
  return {
    isModalVisible: true,
    fileName: '',
    fileUrl: ''
  };
}

export function closeModal(stopVideoPlaybackCallback) {
  if (stopVideoPlaybackCallback) {
    stopVideoPlaybackCallback();
  }
  return {
    isModalVisible: false,
    fileName: '',
    fileUrl: ''
  };
}

export function closeShareModal() {
  return {
    shareModal: false,
    shareSelectedFolder: null,
    shareSelectedFolderId: '',
    shareEnabled: false,
    shareUrl: '',
    sharePassword: '',
    sharePasswordVisible: false,
    shareExpiryDate: '',
    shareExpiryDays: ''
  };
}

// Upload Box Functions
export function openUploadBox() {
  return { uploadPanel: true };
}

export function minimizeUploadBox() {
  return {
    uploadPanel: false,
    showMiniUploader: true
  };
}

export function toggleMiniUploader(currentState) {
  return !currentState;
}

export function expandToFullUploader() {
  return {
    showMiniUploader: false,
    uploadPanel: true
  };
}

// Video Functions
export function processPause() {
  // Handle video pause event - just a placeholder
  return true;
}

// ========================
// SIMPLE DATA FUNCTIONS
// ========================

// Get filter label by key
export function getFilterLabel(ctx, type) {
  const labels = {
    'all': 'ทั้งหมด',
    'folder': 'โฟลเดอร์',
    'image': 'รูปภาพ',
    'media': 'วิดีโอ',
    'document': 'เอกสาร'
  };
  return labels[type] || 'ทั้งหมด';
}

// Handle drag end
export function handleDragEnd(ctx) {
  console.log("Dragging ended for:", ctx.draggedItem, "Selected count:", ctx.selectedFiles.size);
  ctx.dragging = false;
  
  // เคลียร์ visual feedback สำหรับไฟล์ที่ลาก
  if (ctx.draggedItem === 'multi' && ctx.selectedFiles.size > 0) {
    // Multi-drag: เคลียร์ visual feedback ของไฟล์ที่เลือกทั้งหมด
    ctx.selectedFiles.forEach(fileId => {
      const element = document.querySelector(`[data-file-id="${fileId}"]`);
      if (element) {
        element.style.opacity = '1';
      }
    });
    console.log("Cleared visual feedback for selected files:", Array.from(ctx.selectedFiles));
  } else if (ctx.draggedItem && ctx.draggedItem !== 'multi') {
    // Single-drag: เคลียร์ visual feedback ของไฟล์เดียว
    const draggedElement = ctx.$refs[`draggableItem-${ctx.draggedItem}`];
    if (draggedElement && draggedElement[0]) {
      draggedElement[0].style.opacity = '1';
    }
    console.log("Cleared visual feedback for single file:", ctx.draggedItem);
  }
  
  // ลบ drop highlight จากทุก element
  document.querySelectorAll('.drop-highlight').forEach(el => {
    el.classList.remove('drop-highlight');
  });
  
  ctx.draggedItem = "";
}

// Confirm selection in popup mode
export function confirmSelection(ctx) {
  // ตรวจสอบว่าสามารถเลือกไฟล์ได้หรือไม่
  if (!ctx.canSelectSingleFile) {
    if (ctx.selectedFiles.size === 0) {
      toast({ type: 'warning', message: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์' });
    } else if (ctx.selectedFiles.size > 1) {
      toast({ type: 'warning', message: 'สามารถเลือกได้ครั้งละ 1 ไฟล์เท่านั้น' });
    } else {
      toast({ type: 'error', message: 'ไฟล์ที่เลือกไม่ถูกต้องหรือไม่อนุญาต' });
    }
    return;
  }

  // หาไฟล์ที่เลือก (เลือกเดียวเท่านั้น)
  const selectedFileId = Array.from(ctx.selectedFiles)[0];
  const file = ctx.fileListing.find(f => f._id === selectedFileId);
  
  if (!file) {
    toast({ type: 'error', message: 'ไม่พบไฟล์ที่เลือก' });
    return;
  }

  // ใช้ selectFileFunc เดียวกันกับปุ่มในไฟล์ thumbnail
  ctx.selectFileFunc(file, file?.duration, file?.thumbnail);
  
  // Clear selection
  ctx.clearSelection();
}

// Cancel selection in popup mode
export function cancelSelection(ctx) {
  console.log('cancelSelection called, selectedFiles.size:', ctx.selectedFiles.size);
  
  // ถ้ามีไฟล์ถูกเลือก ให้ยกเลิกการเลือกเท่านั้น
  if (ctx.selectedFiles.size > 0) {
    console.log('Clearing selection...');
    ctx.clearSelection();
  } else {
    // ถ้าไม่มีไฟล์ถูกเลือก ให้ปิด popup
    console.log('Emitting close event...');
    ctx.$emit('close');
  }
}

// ========================
// DATA PROCESSING FUNCTIONS
// ========================

// Get file type display text
export function getFileTypeDisplay(ctx, file) {
  if (file.mimetype === 'folder') {
    return `${file.count} ไฟล์`;
  }
  
  switch(file.type) {
    case 'image':
      return 'รูปภาพ';
    case 'media':
      return 'วิดีโอ';
    case 'document':
      return 'เอกสาร';
    default: {
      // แสดงนามสกุลไฟล์หากไม่ตรงกับประเภทที่กำหนด
      const extension = file.name.split('.').pop().toUpperCase();
      return extension || 'ไฟล์';
    }
  }
}

// Retry image load
export function retryImageLoad(ctx, fileName) {
  console.log('Retrying image load for:', fileName);
  ctx.imageLoadErrors.delete(fileName);
  ctx.$forceUpdate();
}

// Generate random password
export function generateRandomPassword(ctx, event) {
  // ป้องกันไม่ให้ event bubble up หรือ submit form
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  const randomArray = new Uint8Array(12);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < randomArray.length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  ctx.sharePassword = result;
}

// ========================
// EVENT HANDLING FUNCTIONS
// ========================

// Extract S3 key from URL
export function extractS3KeyFromUrl(ctx, url) {
  try {
    if (!url || typeof url !== 'string') {
      console.log("Invalid URL provided to extractS3KeyFromUrl:", url);
      return null;
    }
    
    console.log("Extracting S3 key from URL:", url);
    let key = null;
    
    // ตรวจสอบรูปแบบ URL และดึง key
    if (ctx.configs?.s3Endpoint && url.includes(ctx.configs.s3Endpoint)) {
      key = url.replace(ctx.configs.s3Endpoint, '');
      if (key.startsWith('/')) key = key.substring(1);
      console.log("Extracted key using s3Endpoint:", key);
    } else if (url.includes('.digitaloceanspaces.com/')) {
      // กรณี URL แบบ DigitalOcean Spaces
      const urlParts = url.split('.digitaloceanspaces.com/');
      if (urlParts.length > 1) {
        key = urlParts[1];
        console.log("Extracted key using DigitalOcean format:", key);
      }
    } else if (url.includes('.s3.')) {
      // กรณี URL แบบ AWS S3 standard format
      const match = url.match(/\.s3\..*?\.amazonaws\.com\/(.+)/);
      if (match) {
        key = match[1];
        console.log("Extracted key using AWS S3 format:", key);
      }
    } else if (url.startsWith('http')) {
      // Fallback: ลองดึง path จาก URL
      try {
        const urlObj = new URL(url);
        key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        console.log("Extracted key using URL pathname fallback:", key);
      } catch (urlError) {
        console.log("Failed to parse URL:", urlError);
      }
    }
    
    // ตรวจสอบว่า key ที่ได้มาสมเหตุสมผลหรือไม่
    if (key && key.length > 0) {
      console.log("Successfully extracted S3 key:", key);
      return key;
    } else {
      console.log("Could not extract valid S3 key from URL:", url);
      return null;
    }
  } catch (error) {
    console.log("Error in extractS3KeyFromUrl:", error);
    console.error("S3 key extraction error:", error);
    return null;
  }
}

// Get transcode display text
export function getTranscodeDisplayText(ctx, quality) {
  const sizeBytes = ctx.transcodeFileSizes[quality];
  const sizeText = sizeBytes ? formatBytes(sizeBytes) : 'กำลังโหลด...';
  
  if (quality === 'original') {
    return `Original (${sizeText})`;
  }
  if (quality === 'STREAM') {
    return `STREAM (Cloudflare)`;
  }
  // ไม่แสดง 'stream' key จาก transcode
  if (quality === 'stream') {
    return '';
  }
  return `${quality.toUpperCase()} (${sizeText})`;
}

// Execute action commands
export function executeAction(ctx, action) {
  ctx.showActionsDropdown = false; // ปิด dropdown หลังจากเลือก action
  
  switch(action) {
    case 'streaming':
      ctx.openModal();
      break;
    case 'refresh':
      ctx.refreshFileList();
      break;
    case 'batchResize':
      ctx.batchResizeImages();
      break;
    case 'createFolder':
      ctx.openCreateFolder();
      break;
    case 'upload':
      ctx.openUploadBox();
      break;
    case 'videoTrim':
      // เปิด Video Trimmer สำหรับไฟล์ที่เลือก
      if (ctx.selectedFiles.size === 1) {
        const selectedFileId = Array.from(ctx.selectedFiles)[0];
        const selectedFile = ctx.fileListing.find(f => f._id === selectedFileId);
        if (selectedFile && selectedFile.type === 'media' && ctx.isVideoFile(selectedFile)) {
          ctx.openVideoTrimmer(selectedFile);
        }
      }
      break;
    default:
      console.log('Unknown action:', action);
  }
}

// Handle popup keydown events
export function handlePopupKeydown(ctx, event) {
  // Ctrl/Cmd + F to open search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f' && ctx.Mode === 'popup') {
    event.preventDefault();
    if (!ctx.showSearchInPopup) {
      ctx.toggleSearchInPopup();
    }
  }
  // Escape to close search
  if (event.key === 'Escape' && ctx.Mode === 'popup' && ctx.showSearchInPopup) {
    event.preventDefault();
    ctx.toggleSearchInPopup();
  }
}

// Handle click outside dropdown/modal
export function onClickOutside(ctx, event) {
  if (ctx.showActionsDropdown && ctx.$refs.actionsDropdown && !ctx.$refs.actionsDropdown.contains(event.target)) {
    ctx.showActionsDropdown = false;
  }
  
  // Close transcode dropdown when clicking outside
  if (ctx.transcodeDropdownOpen) {
    const transcodeDropdown = event.target.closest('.transcode-dropdown');
    if (!transcodeDropdown) {
      ctx.transcodeDropdownOpen = false;
    }
  }
  
  // Close mobile actions menu when clicking outside
  if (ctx.showMobileActionsMenu) {
    const mobileActionsMenu = event.target.closest('.mobile-actions-menu');
    if (!mobileActionsMenu) {
      ctx.showMobileActionsMenu = false;
    }
  }
}

// === Transcode/Video Functions ===
export function openTranscodePanel(ctx, file = null) {
  if (file) {
    ctx.transcodeSelectedFile = file;
  } else if (ctx.selectItemData && ctx.isVideoFile(ctx.selectItemData)) {
    ctx.transcodeSelectedFile = ctx.selectItemData;
  } else {
    toast({ type: 'warning', message: 'กรุณาเลือกไฟล์วิดีโอก่อน' });
    return;
  }
  
  ctx.showTranscodePanel = true;
  ctx.transcodeSelectedQuality = '720p'; // ค่าเริ่มต้น
  ctx.showVideoConvertOptions = false;
  ctx.replaceExistingTranscode = false;
}

export function closeTranscodePanel(ctx, shouldRefresh = false) {
  ctx.debugLog('🔄 Closing transcode panel, shouldRefresh:', shouldRefresh);
  
  ctx.showTranscodePanel = false;
  ctx.transcodeSelectedFile = null;
  ctx.transcodeSelectedQuality = '720p';
  ctx.showVideoConvertOptions = false;
  ctx.replaceExistingTranscode = false;
  
  // อัพเดตข้อมูลเมื่อปิดหน้าต่าง (เฉพาะเมื่อผู้ใช้ปิดโดยตรง)
  if (shouldRefresh) {
    ctx.debugLog('🔄 Refreshing file list after closing transcode panel...');
    ctx.listFile(ctx.prefix).then(() => {
      ctx.debugLog('✅ File list refreshed after closing transcode panel');
    }).catch((error) => {
      ctx.debugLog('❌ Error refreshing file list after closing transcode panel:', error);
    });
  }
}

export function selectQuickQuality(ctx, quality) {
  if (!ctx.transcodeSelectedFile?.transcode?.[quality]) {
    ctx.transcodeSelectedQuality = quality;
  }
}

export function isQualityAvailable(ctx, quality) {
  return !ctx.transcodeSelectedFile?.transcode?.[quality];
}

export function getQualityStatus(ctx, quality) {
  if (ctx.transcodeSelectedFile?.transcode?.[quality]) {
    return 'มีอยู่แล้ว';
  }
  return '';
}

export async function startTranscode(ctx) {
  if (!ctx.transcodeSelectedFile) {
    toast({ type: 'error', message: 'ไม่พบไฟล์ที่ต้องการแปลง' });
    return;
  }

  // ตรวจสอบว่ามี quality ที่เลือก
  if (!ctx.transcodeSelectedQuality) {
    toast({ type: 'error', message: 'กรุณาเลือกความละเอียดที่ต้องการแปลง' });
    return;
  }

  // ตรวจสอบว่ามี transcode quality นี้อยู่แล้วหรือไม่
  const hasExistingTranscode = ctx.transcodeSelectedFile.transcode && 
                             ctx.transcodeSelectedFile.transcode[ctx.transcodeSelectedQuality];
  
  if (hasExistingTranscode && !ctx.replaceExistingTranscode) {
    toast({ 
      type: 'warning', 
      message: `ไฟล์นี้มี transcode ความละเอียด ${ctx.transcodeSelectedQuality.toUpperCase()} อยู่แล้ว\nเปิดใช้งาน "แทนที่ transcode ที่มีอยู่" เพื่อสร้างใหม่` 
    });
    return;
  }

  try {
    // เก็บข้อมูลที่จำเป็นก่อนรีเซ็ต
    const fileData = { ...ctx.transcodeSelectedFile };
    const selectedQuality = ctx.transcodeSelectedQuality;
    const shouldReplace = ctx.replaceExistingTranscode && hasExistingTranscode;

    // แสดง toast แจ้งว่าเริ่มแปลงแล้ว
    const message = shouldReplace 
      ? `เริ่มแทนที่และแปลงไฟล์เป็น ${selectedQuality.toUpperCase()}\nการแปลงจะทำงานใน background`
      : `เริ่มแปลงไฟล์เป็น ${selectedQuality.toUpperCase()}\nการแปลงจะทำงานใน background`;
    
    const toastInstance = toast({ 
      type: 'info', 
      message: message
    });

    // ปิด transcode panel ทันที (ไม่ refresh เพราะจะ refresh ข้างล่าง)
    ctx.closeTranscodePanel(false);

    // ปิด modal preview ถ้ามีการเปิดอยู่ เพื่อให้เห็นการอัพเดตข้อมูลในหน้าหลัก
    if (ctx.showModal) {
      ctx.showModal = false;
    }

    // ส่งงานไปทำใน background พร้อมข้อมูลที่เก็บไว้
    ctx.processTranscodeInBackground(fileData, selectedQuality, shouldReplace);

    // อัพเดตข้อมูลไฟล์ทันทีเพื่อแสดงสถานะล่าสุด
    ctx.debugLog('🔄 Starting file list update after transcode...');
    console.log('🔄 Starting file list update after transcode...');
    
    // อัพเดต toast message
    if (toastInstance && typeof toastInstance.update === 'function') {
      toastInstance.update({ 
        type: 'pending',
        message: 'กำลังอัพเดตข้อมูลไฟล์...' 
      });
      ctx.debugLog('✅ Toast updated to pending state');
    } else {
      ctx.debugLog('⚠️ Toast update method not available');
    }
    
    try {
      ctx.debugLog('📞 Calling listFile()...');
      console.log('📞 Calling listFile()...');
      await ctx.listFile(ctx.prefix);
      ctx.debugLog('✅ File list updated successfully');
      console.log('✅ File list updated successfully');
      
      // อัพเดต selectItemData ด้วยข้อมูลล่าสุดหลังจาก listFile
      if (fileData._id && ctx.fileListing.length > 0) {
        const updatedFile = ctx.fileListing.find(f => f._id === fileData._id);
        if (updatedFile) {
          ctx.selectItemData = updatedFile;
          ctx.debugLog('✅ selectItemData updated with latest file info');
        }
      }
      
      // แสดงข้อความสำเร็จ
      if (toastInstance && typeof toastInstance.hide === 'function') {
        toastInstance.hide('ส่งงานแปลงไฟล์เรียบร้อย และอัพเดตข้อมูลแล้ว', 'success');
      } else {
        toast({ type: 'success', message: 'ส่งงานแปลงไฟล์เรียบร้อย และอัพเดตข้อมูลแล้ว' });
      }
      
    } catch (updateError) {
      ctx.debugLog('❌ Error updating file list:', updateError);
      console.error('Error updating file list:', updateError);
      
      // แสดงข้อความเตือน
      if (toastInstance && typeof toastInstance.hide === 'function') {
        toastInstance.hide('ส่งงานแปลงไฟล์เรียบร้อย แต่ไม่สามารถอัพเดตข้อมูลได้', 'warning');
      } else {
        toast({ type: 'warning', message: 'ส่งงานแปลงไฟล์เรียบร้อย แต่ไม่สามารถอัพเดตข้อมูลได้' });
      }
    }
    
  } catch (error) {
    ctx.debugLog('❌ Transcode start error:', error);
    console.error('Transcode error:', error);
    toast({ 
      type: 'error', 
      message: 'เกิดข้อผิดพลาดในการเริ่มแปลงไฟล์\nกรุณาลองใหม่อีกครั้ง' 
    });
    
    // เปิด panel กลับมาหากเกิด error
    ctx.showTranscodePanel = true;
  }
}

export function getQualityDisplayName(ctx, quality) {
  const qualityMap = {
    '240p': '240p (ต่ำ)',
    '360p': '360p (ปานกลาง)',
    '480p': '480p (มาตรฐาน)',
    '720p': '720p (HD)',
    '1080p': '1080p (Full HD)'
  };
  return qualityMap[quality] || quality.toUpperCase();
}

// === File Operations & Navigation Functions ===
export function onDoubleClick(ctx, filename) {
  console.log('🔥 onDoubleClick called with filename:', filename);
  
  // Find the item in this.fileListing with the matching name
  const selectedItem = ctx.fileListing.find(item => item.name === filename);

  if (!selectedItem) {
    console.log('❌ Item not found:', filename);
    return;
  }

  console.log("✅ selectedItem found:", selectedItem);
  
  if (selectedItem.type === 'folder' || selectedItem.mimetype === 'folder') {
    // Handle folder double-click - ส่งคืน path เพื่อให้ function.js จัดการ
    console.log("📁 Folder double-clicked, returning path for navigation:", selectedItem.path);
    return selectedItem.path; // return path สำหรับให้ function.js จัดการ
  } else {
    // Handle file double-click
    console.log("📄 File double-clicked, opening preview...");
    
    const filetype = selectedItem.name.split('.').pop().toLowerCase();
    ctx.viewFilesize = selectedItem.size;
    ctx.viewFilename = selectedItem.name;
    ctx.viewFilecover = selectedItem.cover;
    ctx.viewFilecreate = selectedItem.createdAt || selectedItem.create || null;
    ctx.viewFileurl = selectedItem.path;
    ctx.viewFileDuration = selectedItem.duration;
    ctx.viewFileThumbnail = selectedItem.thumbnail;
    ctx.viewFileextension = filetype;
    
    // Set the complete file URL with S3 endpoint
    ctx.selectedFile = ctx.configs.s3Endpoint + selectedItem.path;
    
    // Set up selectItem data for the modal
    ctx.selectItem = selectedItem._id;
    ctx.selectItemData = selectedItem;
    ctx.hasSelected = true;

    console.log("📋 Modal data prepared:", {
      filetype,
      selectedFile: ctx.selectedFile,
      modalContent: ctx.modalContent
    });

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(filetype)) {
      ctx.modalContent = "image";
      ctx.showModal = true;
      console.log("🖼️ Opening image modal");
    } else if (['mp4', 'ogg', 'webm', 'mov', 'avi'].includes(filetype)) {
      console.log(selectedItem?.stream);

      if (selectedItem?.stream && selectedItem?.stream?.streamStatus!="ready") {
        // Start polling for stream status updates
        ctx.pollStreamStatus(ctx.selectItem, selectedItem?.stream?.streamId);
      }
      ctx.modalContent = "video";
      ctx.showModal = true;
      console.log("🎥 Opening video modal");
    } else if (['pdf'].includes(filetype)) {
      ctx.modalContent = "pdf";
      ctx.showModal = true;
      console.log("📑 Opening PDF modal");
    } else {
      console.log("📄 Other file type, opening generic modal");
      ctx.modalContent = "file";
      ctx.showModal = true;
    }
  }
}

export function openViewFile(ctx, item) {
  var index = ctx.fileListing.findIndex(p => p.name == item);

  ctx.debugLog("item", item + "/" + index);
  ctx.debugLog(ctx.fileListing[index]);

  ctx.selectItem = ctx.fileListing[index]._id;
  ctx.selectItemData = ctx.fileListing[index];
  ctx.hasSelected = true;
  
  // Set up video file data if it's a video
  if (ctx.selectItemData && ctx.isVideoFile(ctx.selectItemData)) {
    // Reset transcode selection to original
    ctx.selectedTranscodeQuality = 'original';
    ctx.transcodeDropdownOpen = false;
    
    // Set video data
    ctx.viewFilename = ctx.selectItemData.name;
    ctx.viewFilesize = ctx.selectItemData.size;
    ctx.viewFilecreate = ctx.selectItemData.createdAt;
    ctx.viewFileDuration = ctx.selectItemData.duration;
    ctx.viewFileThumbnail = ctx.selectItemData.thumbnail;
    
    // Set initial video URL
    ctx.selectedFile = ctx.configs.s3Endpoint + ctx.selectItemData.path;
    ctx.modalContent = "video";
    ctx.showFileDetail = true;
    
    // Load transcode file sizes
    ctx.loadTranscodeFileSizes();
  } else {
    // Handle other file types
    ctx.viewFilename = ctx.selectItemData.name;
    ctx.viewFilesize = ctx.selectItemData.size;
    ctx.viewFilecreate = ctx.selectItemData.createdAt;
    ctx.selectedFile = ctx.configs.s3Endpoint + ctx.selectItemData.path;
    
    // Set modal content based on file type
    if (ctx.isImageFile(ctx.selectItemData)) {
      ctx.modalContent = "image";
    } else if (ctx.selectItemData.mimetype === 'application/pdf') {
      ctx.modalContent = "pdf";
    } else {
      ctx.modalContent = "file";
    }
    
    ctx.showFileDetail = true;
  }
}

export async function loadTranscodeFileSizes(ctx) {
  if (!ctx.selectItemData?.transcode) return;
  
  ctx.transcodeFileSizes = {};
  
  // Load original file size
  const originalSize = ctx.selectItemData.size || 0;
  ctx.transcodeFileSizes['original'] = originalSize;
  
  // Load transcode file sizes
  for (const [quality, url] of Object.entries(ctx.selectItemData.transcode)) {
    try {
      const size = await getFileSize(url);
      ctx.transcodeFileSizes[quality] = size;
    } catch (error) {
      console.error(`Error loading file size for ${quality}:`, error);
      ctx.transcodeFileSizes[quality] = 0;
    }
  }
}

export async function selectTranscodeQuality(ctx, quality) {
  console.log('🎯 selectTranscodeQuality called with quality:', quality);
  console.log('🎯 selectItemData stream:', ctx.selectItemData?.stream);
  console.log('🎯 selectItemData transcode:', ctx.selectItemData?.transcode);
  
  // แปลง quality เป็นตัวใหญ่เพื่อเช็ค
  const normalizedQuality = quality.toUpperCase();
  
  if (normalizedQuality === 'STREAM') {
    console.log('🎯 STREAM quality detected!');
    
    // ลองหา stream UID จากหลายที่
    let streamId = null;
    
    // 1. จาก stream object
    if (ctx.selectItemData?.stream?.streamId) {
      streamId = ctx.selectItemData.stream.streamId;
      console.log('🎯 Found streamId in stream object:', streamId);
    }
    // 2. จาก transcode.stream
    else if (ctx.selectItemData?.transcode?.stream) {
      streamId = ctx.selectItemData.transcode.stream;
      console.log('🎯 Found streamId in transcode.stream:', streamId);
    }
    // 3. ใช้ค่าตายตัวสำหรับทดสอบ
    else {
      streamId = '9998badb15354d74985ce7ba300356eb';
      console.log('🎯 Using default streamId for testing:', streamId);
    }
    
    console.log('🎯 Final streamId to use:', streamId);
    return await selectStreamQuality(ctx, streamId);
  }
  
  console.log('🎯 Regular quality selection:', quality);
  
  // ล้าง stream data เมื่อเลือกความละเอียดปกติ
  if (ctx.selectItemData?.stream) {
    console.log('🧹 Clearing stream data for regular quality');
    delete ctx.selectItemData.stream.streamId;
    delete ctx.selectItemData.stream.streamStatus;
    delete ctx.selectItemData.stream.streamThumbnail;
    delete ctx.selectItemData.stream.streamPlayback;
    
    // ถ้า stream object ว่างเปล่า ให้ลบทั้งอัน
    if (Object.keys(ctx.selectItemData.stream).length === 0) {
      delete ctx.selectItemData.stream;
    }
  }
  
  ctx.selectedTranscodeQuality = quality;
  ctx.transcodeDropdownOpen = false;
  await updateVideoSource(ctx);
  
  // Force Vue to re-render
  ctx.$forceUpdate();
  
  console.log('✅ Switched to regular quality:', quality);
  console.log('🧹 Cleared stream data, selectItemData.stream:', ctx.selectItemData?.stream);
}

// ดึงข้อมูล Cloudflare Stream
export async function getCloudflareStreamData(ctx, uid) {
  try {
    console.log('🌥️ getCloudflareStreamData called with UID:', uid);
    console.log('🌥️ Full URL will be:', `https://api.cloudflare.com/client/v4/accounts/92d5cc09d52b3239a9bfccf8dbd1bddb/stream/${uid}`);
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/92d5cc09d52b3239a9bfccf8dbd1bddb/stream/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer xTBA4Ynm-AGnY5UtGPMMQtLvmEpvFmgK1XHaQmMl',
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Cloudflare Stream data:', data);
    
    if (data.success && data.result) {
      return data.result;
    } else {
      throw new Error('Invalid response from Cloudflare Stream API');
    }
    
  } catch (error) {
    console.error('❌ Error getting Cloudflare Stream data:', error);
    ctx.$toast({
      type: 'error',
      message: `ไม่สามารถดึงข้อมูล stream ได้: ${error.message}`
    });
    throw error;
  }
}

// เลือก STREAM quality
export async function selectStreamQuality(ctx, uid) {
  try {
    console.log('🎬 selectStreamQuality called with UID:', uid);
    console.log('🎬 About to call getCloudflareStreamData...');
    
    // ดึงข้อมูล stream จาก Cloudflare
    const streamData = await getCloudflareStreamData(ctx, uid);
    
    console.log('🎬 Received stream data:', streamData);
    
    if (streamData.readyToStream && streamData.playback?.hls) {
      console.log('🎬 Stream is ready, HLS URL:', streamData.playback.hls);
      
      // ใช้ HLS URL สำหรับ player
      ctx.selectedTranscodeQuality = 'STREAM';
      ctx.transcodeDropdownOpen = false;
      
      // อัพเดต video source เป็น HLS URL
      const hlsUrl = streamData.playback.hls;
      ctx.selectedFile = hlsUrl;
      
      // อัพเดต stream data สำหรับ selectItemData
      if (ctx.selectItemData) {
        if (!ctx.selectItemData.stream) {
          ctx.selectItemData.stream = {};
        }
        ctx.selectItemData.stream.streamId = streamData.uid;
        ctx.selectItemData.stream.streamStatus = streamData.status.state;
        ctx.selectItemData.stream.streamThumbnail = streamData.thumbnail;
        ctx.selectItemData.stream.streamPlayback = hlsUrl;
      }
      
      // Force Vue to re-render the video player component
      ctx.$forceUpdate();
      
      console.log('✅ Updated video with HLS stream:', hlsUrl);
      console.log('✅ Updated selectItemData.stream:', ctx.selectItemData?.stream);
      
      ctx.$toast({
        type: 'success',
        message: 'เปลี่ยนเป็น Cloudflare Stream สำเร็จ! ใช้ HLS Player'
      });
      
    } else {
      console.log('❌ Stream not ready or no HLS URL:', {
        readyToStream: streamData.readyToStream,
        hasHls: !!streamData.playback?.hls
      });
      throw new Error('Stream ยังไม่พร้อมใช้งาน หรือไม่มี HLS URL');
    }
    
  } catch (error) {
    console.error('❌ Error selecting stream quality:', error);
    ctx.$toast({
      type: 'error',
      message: `ไม่สามารถใช้ stream ได้: ${error.message}`
    });
  }
}

export async function updateVideoSource(ctx) {
  if (!ctx.selectItemData) return;
  
  let videoUrl;
  if (ctx.selectedTranscodeQuality === 'original') {
    videoUrl = ctx.configs.s3Endpoint + ctx.selectItemData.path;
  } else {
    const transcodeUrl = ctx.selectItemData.transcode?.[ctx.selectedTranscodeQuality];
    videoUrl = transcodeUrl || (ctx.configs.s3Endpoint + ctx.selectItemData.path);
  }
  
  // Update the video source
  const videoElement = ctx.$refs.videoStreaming;
  if (videoElement) {
    videoElement.src = videoUrl;
    videoElement.load();
  }
  
  // Update selectedFile for download
  ctx.selectedFile = videoUrl;
}

export async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}

export async function processTranscodeInBackground(ctx, fileData, selectedQuality, shouldReplace) {
  try {
    console.log('🚀 เริ่มการแปลงไฟล์ใน background...');
    console.log('📄 File Data:', fileData);
    console.log('🎯 Quality:', selectedQuality);
    console.log('� Replace existing:', shouldReplace);
    
    // ใช้ระบบ convertVideo ที่มีอยู่แล้ว
    const payload = new FormData();
    payload.append('url', fileData.path);
    payload.append('quality', selectedQuality);
    payload.append('site', 'fti.academy');
    payload.append('storage', fileData._id);
    
    // เพิ่มพารามิเตอร์สำหรับการแทนที่
    if (shouldReplace) {
      payload.append('replace', 'true');
    }

    // Debug: แสดงข้อมูลที่จะส่ง
    console.log('📤 FormData ที่จะส่ง:');
    console.log('  - url:', fileData.path);
    console.log('  - quality:', selectedQuality);
    console.log('  - site: fti.academy');
    console.log('  - storage:', fileData._id);
    console.log('  - replace:', shouldReplace);

    const actionText = shouldReplace ? 'แทนที่และแปลง' : 'แปลง';
    console.log(`📤 ส่งคำขอ${actionText} ${selectedQuality.toUpperCase()} สำหรับ:`, fileData.name);

    const response = await fetch('https://media.cloudrestfulapi.com/convert', {
      method: 'POST',
      body: payload,
    });

    if (!response.ok) {
      throw new Error('Failed to convert video');
    }

    const result = await response.json();
    console.log(`✅ ${actionText} started successfully:`, result);
    
    // สร้าง conversion task ใน TaskManager
    try {
      const taskData = {
        title: `Convert ${fileData.name} to ${selectedQuality.toUpperCase()}`,
        description: `Converting ${fileData.name} from ${fileData.mimetype || 'video'} to ${selectedQuality} quality`,
        fileName: fileData.name,
        fileId: fileData._id,
        file_id: fileData._id, // เพิ่ม file _id แยกต่างหาก
        unit: fileData.unit || 'default', // เพิ่ม unit
        originalFormat: fileData.mimetype,
        targetFormat: 'mp4',
        quality: selectedQuality,
        priority: 'medium',
        conversionOptions: {
          replaceOriginal: shouldReplace,
          conversionId: result.id || result.job_id || result.taskId || Date.now().toString(),
          filePath: fileData.path,
          fileSize: fileData.size
        }
      };
      
      const taskResult = await ctx.createConversionTask(taskData);
      
      // ตรวจสอบว่าสร้าง task สำเร็จหรือไม่ (มี _id หรือ success)
      if (taskResult && (taskResult._id || taskResult.success)) {
        console.log('✅ สร้าง conversion task สำเร็จ:', taskResult);
        
        // Refresh TaskManager เพื่อแสดง task ใหม่ทันที
        if (typeof window !== 'undefined' && window.fileManagerInstance) {
          try {
            await window.fileManagerInstance.loadConversionTasks();
            console.log('🔄 TaskManager refreshed after creating new task');
            
            // Refresh FileManager เพื่ออัพเดตสถานะไฟล์
            if (typeof window.fileManagerInstance.executeAction === 'function') {
              window.fileManagerInstance.executeAction('refresh');
              console.log('🔄 FileManager refreshed after conversion');
            }
          } catch (refreshError) {
            console.warn('⚠️ Failed to refresh TaskManager:', refreshError);
          }
        } else if (ctx.loadConversionTasks && typeof ctx.loadConversionTasks === 'function') {
          await ctx.loadConversionTasks();
          console.log('🔄 TaskManager refreshed via ctx after creating new task');
        }
      } else {
        console.warn('⚠️ สร้าง conversion task ไม่สำเร็จ:', taskResult);
      }
    } catch (taskError) {
      console.error('❌ Error creating conversion task:', taskError);
    }
    
    // แสดง toast แจ้งว่าเริ่มแปลงเรียบร้อย
    const successMessage = shouldReplace 
      ? `ระบบเริ่ม${actionText}ไฟล์ ${fileData.name} เป็น ${selectedQuality.toUpperCase()} แล้ว\nการแปลงจะทำงานใน background คุณสามารถรีเฟรชหน้าเพื่อดูผลลัพธ์ได้`
      : `ระบบเริ่มแปลงไฟล์ ${fileData.name} เป็น ${selectedQuality.toUpperCase()} แล้ว\nการแปลงจะทำงานใน background คุณสามารถรีเฟรชหน้าเพื่อดูผลลัพธ์ได้`;
    
    toast({ 
      type: 'success', 
      message: successMessage
    });
    
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ Background transcode error:', error);
    const errorMessage = shouldReplace
      ? 'เกิดข้อผิดพลาดในการส่งงานแทนที่และแปลงไฟล์\nกรุณาลองใหม่อีกครั้ง'
      : 'เกิดข้อผิดพลาดในการส่งงานแปลงไฟล์\nกรุณาลองใหม่อีกครั้ง';
      
    toast({ 
      type: 'error', 
      message: errorMessage
    });
    
    return { success: false, error: error.message };
  }
}

export function closeViewFile(ctx) {
  ctx.showFileDetail = false;
  ctx.transcodeDropdownOpen = false;
  ctx.selectedTranscodeQuality = 'original';
  ctx.transcodeFileSizes = {};
  ctx.stopVideoPlayback();
}

export function getFullPath(ctx, find) {
  // ใช้ filteredFolderPath สำหรับ share mode
  const pathArray = ctx.isShareMode ? ctx.filteredFolderPath : ctx.folderPath;
  var index = pathArray.indexOf(find);
  
  if (index == "0") {
    // ใน share mode ใช้ find โดยตรงเพราะ ShareId เป็น root แล้ว
    return find;
  } else {
    const basePath = pathArray.slice(0, index).join('/');
    const fullPath = basePath + "/" + find;
    // ใน share mode ก็ใช้ fullPath ปกติ
    return fullPath;
  }
}

// Folder Navigation Functions
export function openFolder(folder) {
  const new_prefix = folder && folder.trim() !== '' ? folder.trim() : '';
  const session = {
    prefix: new_prefix,
  };
  storageManager.update('session', session);
  // Note: renderFileBrowser() should be called by the component after this function
}

// === Set 9: Drag & Drop Operations Functions ===
export function createMultiDragImage(ctx, fileIds) {
  const fileCount = fileIds.length;
  
  // สร้าง container element
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    top: -2000px;
    left: -2000px;
    width: 200px;
    height: 150px;
    background: white;
    border: 2px solid #007bff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 9999;
  `;
  
  // เพิ่ม stack indicator ด้านหลัง
  const stackBg1 = document.createElement('div');
  stackBg1.style.cssText = `
    position: absolute;
    top: -6px;
    left: -6px;
    right: 6px;
    bottom: 6px;
    background: rgba(0,123,255,0.3);
    border-radius: 12px;
    z-index: -2;
  `;
  container.appendChild(stackBg1);
  
  const stackBg2 = document.createElement('div');
  stackBg2.style.cssText = `
    position: absolute;
    top: -3px;
    left: -3px;
    right: 3px;
    bottom: 3px;
    background: rgba(0,123,255,0.5);
    border-radius: 12px;
    z-index: -1;
  `;
  container.appendChild(stackBg2);
  
  // ไอค่อนกองไฟล์
  const icon = document.createElement('div');
  icon.style.cssText = `
    font-size: 48px;
    margin-bottom: 8px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;
  icon.textContent = '📁';
  container.appendChild(icon);
  
  // จำนวนไฟล์
  const countText = document.createElement('div');
  countText.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    color: #495057;
    margin-bottom: 4px;
  `;
  countText.textContent = `${fileCount} ไฟล์`;
  container.appendChild(countText);
  
  // Badge
  const badge = document.createElement('div');
  badge.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #28a745, #1e7e34);
    border: 3px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;
  badge.textContent = fileCount;
  container.appendChild(badge);
  
  // เพิ่มลงใน DOM
  document.body.appendChild(container);
  
  console.log('Created simple multi-drag image for', fileCount, 'files');
  return container;
}

export function cleanupDragImage(ctx, element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export function handleDragStart(ctx, file, event) {
  ctx.dragging = true;
  
  console.log('=== Drag Start ===');
  console.log('File being dragged:', file.name, 'ID:', file._id);
  console.log('Selected files count:', ctx.selectedFiles.size);
  console.log('Selected files:', Array.from(ctx.selectedFiles));
  console.log('Is dragged file selected?', ctx.selectedFiles.has(file._id));
  
  // ตรวจสอบว่าเป็น multi-drag หรือ single-drag
  if (ctx.selectedFiles.size > 1 && ctx.selectedFiles.has(file._id)) {
    // Multi-drag: ลากหลายไฟล์ที่เลือกไว้
    console.log(`✅ Multi-drag condition met: ${ctx.selectedFiles.size} files selected`);
    
    // ตั้งค่า draggedItem เป็น 'multi' เพื่อบอกว่าเป็น multi-drag
    ctx.draggedItem = 'multi';
    
    const selectedIds = Array.from(ctx.selectedFiles);
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'multiple',
      fileIds: selectedIds,
      source: 'internal' // บอกว่ามาจากภายใน
    }));
    
    // สร้าง custom drag image
    try {
      const dragElement = createMultiDragImage(ctx, selectedIds);
      
      // ใช้ requestAnimationFrame เพื่อให้ DOM พร้อม
      ctx.$nextTick(() => {
        try {
          event.dataTransfer.setDragImage(dragElement, 100, 75);
          console.log('✅ Custom drag image set successfully');
        } catch (e) {
          console.log('⚠️ setDragImage failed:', e.message);
        }
        
        // ล้าง element หลังใช้งาน
        setTimeout(() => {
          cleanupDragImage(ctx, dragElement);
        }, 1000);
      });
      
    } catch (error) {
      console.log('❌ Error creating drag image:', error);
    }
    
    console.log('Multi-drag data set:', selectedIds);
    
    // ตั้งค่า visual feedback สำหรับหลายไฟล์
    selectedIds.forEach(id => {
      const element = document.querySelector(`[data-file-id="${id}"]`);
      if (element) element.style.opacity = '0.5';
    });
    
  } else {
    // Single-drag: ลากไฟล์เดี่ยว
    console.log(`❌ Single-drag condition: size=${ctx.selectedFiles.size}, hasFile=${ctx.selectedFiles.has(file._id)}`);
    ctx.draggedItem = file._id;
    console.log("Single drag started:", ctx.draggedItem, "File:", file.name, "Type:", file.mimetype);
    
    // ถ้าไฟล์นี้ไม่ได้ถูกเลือก ให้เคลียร์การเลือกก่อน
    if (!ctx.selectedFiles.has(file._id)) {
      ctx.selectedFiles.clear();
    }
    
    // ตั้งค่า dataTransfer สำหรับ single file
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'single',
      fileId: file._id,
      source: 'internal'
    }));
    
    // visual feedback สำหรับไฟล์เดี่ยว
    const element = ctx.$refs[`draggableItem-${file._id}`] || ctx.$refs[`dropTarget-${file.path}`];
    if (element && element[0]) {
      element[0].style.opacity = '0.5';
    }
  }
}

export function handleDragOver(ctx, event) {
  event.preventDefault();
  
  // ตรวจสอบว่าเป็นการลากไฟล์ที่มีอยู่แล้วหรือไม่
  if (!ctx.draggedItem) {
    // ถ้าไม่มี draggedItem แสดงว่าเป็นการลากไฟล์ใหม่จากภายนอก
    // ให้ global drop handler จัดการแทน
    return;
  }
  
  // เพิ่ม highlight สำหรับ drop target เฉพาะการย้ายไฟล์ที่มีอยู่แล้ว
  const target = event.currentTarget;
  if (!target.classList.contains('drop-highlight')) {
    target.classList.add('drop-highlight');
  }
}

// === Set 11: Share Functions & System Functions ===
export async function deleteTranscode(ctx, quality) {
  // ตรวจสอบ permission ใน share mode
  if (ctx.isShareMode && ctx.shareRootPermission === 'read') {
    toast({ type: 'error', message: 'คุณไม่มีสิทธิ์ลบ transcode ในโหมดดูอย่างเดียว' });
    return;
  }

  if (!ctx.selectItemData || !ctx.selectItemData.transcode || !ctx.selectItemData.transcode[quality]) {
    toast({ type: 'error', message: 'ไม่พบ transcode ที่ต้องการลบ' });
    return;
  }

  // ขอยืนยันจากผู้ใช้
  const confirmed = await new Promise((resolve) => {
    dialog.confirm({
      title: 'ยืนยันการลบ Transcode',
      message: `คุณต้องการลบ transcode ความละเอียด ${quality.toUpperCase()} ใช่หรือไม่?`,
      confirm: () => resolve(true),
      cancel: () => resolve(false)
    });
  });

  if (!confirmed) return;

  try {
    const toastInstance = toast({ 
      type: 'pending', 
      message: `กำลังลบ transcode ${quality.toUpperCase()}...` 
    });

    // สร้าง object ใหม่โดยไม่รวม quality ที่ต้องการลบ
    const newTranscode = { ...ctx.selectItemData.transcode };
    delete newTranscode[quality];

    // อัพเดทข้อมูลในฐานข้อมูล
    const payload = {
      data: {
        transcode: Object.keys(newTranscode).length > 0 ? newTranscode : null
      }
    };

    const { status } = await ctx.$Request.PUT(`storage/${ctx.selectItemData._id}`, payload, ctx.requestKey());

    if (status === 200) {
      // อัพเดทข้อมูลใน local state
      if (Object.keys(newTranscode).length > 0) {
        ctx.selectItemData.transcode = newTranscode;
      } else {
        delete ctx.selectItemData.transcode;
      }

      // อัพเดทใน fileListing ด้วย
      const fileIndex = ctx.fileListing.findIndex(f => f._id === ctx.selectItemData._id);
      if (fileIndex !== -1) {
        if (Object.keys(newTranscode).length > 0) {
          ctx.fileListing[fileIndex].transcode = newTranscode;
        } else {
          delete ctx.fileListing[fileIndex].transcode;
        }
      }

      // ลบข้อมูลขนาดไฟล์ที่แคช
      delete ctx.transcodeFileSizes[quality];

      // ถ้า quality ที่เลือกอยู่ถูกลบ ให้เปลี่ยนไปใช้ original
      if (ctx.selectedTranscodeQuality === quality) {
        ctx.selectedTranscodeQuality = 'original';
        await updateVideoSource(ctx);
      }

      toastInstance.hide(`ลบ transcode ${quality.toUpperCase()} เรียบร้อยแล้ว`, 'success');
      
      // รีเฟรช UI
      ctx.$forceUpdate();
    } else {
      toastInstance.hide('เกิดข้อผิดพลาดในการลบ transcode', 'error');
    }
  } catch (error) {
    console.error('Error deleting transcode:', error);
    toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการลบ transcode' });
  }
}

export async function refreshFileList(ctx) {
  try {
    ctx.isRefreshLoading = true;
    await ctx.listFile(ctx.prefix);
  } catch (error) {
    console.error('Error refreshing file list:', error);
  } finally {
    // เพิ่ม delay เล็กน้อยเพื่อให้เห็น loading animation
    setTimeout(() => {
      ctx.isRefreshLoading = false;
    }, 500);
  }
}

export async function initializeShareMode(ctx) {
  if (ctx.Mode === 'share' && ctx.ShareId) {
    ctx.isShareMode = true;
    ctx.shareRootId = ctx.ShareId;
    
    // ใน share mode ไม่ต้องใช้ session prefix แบบปกติ
    // เก็บ original prefix เฉพาะกรณีที่มี session
    const currentSession = storageManager.get('session');
    if (currentSession && currentSession.prefix) {
      ctx.originalPrefix = currentSession.prefix;
    }
    
    // ตั้งค่า prefix เป็น ShareId โดยตรง โดยไม่ต้องพึ่งพา session
    ctx.prefix = ctx.ShareId;
    
    // ตั้งค่า shareRootPath เป็น ShareId
    ctx.shareRootPath = ctx.ShareId;
    
    console.log('Share mode initialized:', {
      shareId: ctx.ShareId,
      shareRootPath: ctx.shareRootPath,
      newPrefix: ctx.ShareId
    });
    
    // โหลดไฟล์ในโฟลเดอร์ที่แชร์
    await ctx.listFile(ctx.prefix);
  }
}

export function openShareFolder(ctx, folderName, folderId) {
  ctx.shareSelectedFolder = folderName;
  ctx.shareSelectedFolderId = folderId;
  ctx.shareModal = true;
  
  // หาข้อมูลโฟลเดอร์จาก fileListing ที่โหลดไว้แล้ว
  const folder = ctx.fileListing.find(item => item._id === folderId);
  if (folder) {
    ctx.shareEnabled = folder.share || false;
    
    // โหลดข้อมูลการแชร์ที่มีอยู่
    ctx.sharePassword = folder.sharePassword || '';
    ctx.shareHasPassword = !!folder.sharePassword;
    ctx.shareExpiryDate = folder.shareExpiryDate ? new Date(folder.shareExpiryDate).toISOString().split('T')[0] : '';
    ctx.shareHasExpiry = !!folder.shareExpiryDate;
    ctx.sharePermission = folder.sharePermission || 'read';
    
    // คำนวณจำนวนวันหากมีวันหมดอายุ
    if (ctx.shareExpiryDate) {
      ctx.calculateDaysFromExpiry();
    }
    
    // สร้าง share URL ถ้ามีการแชร์
    if (ctx.shareEnabled && folder.shareKey) {
      ctx.shareUrl = `${window.location.origin}/drive/public/${folderId}/${folder.shareKey}`;
    } else {
      ctx.shareUrl = '';
    }
  }
}

export async function toggleShareStatus(ctx) {
  console.log('🔄 toggleShareStatus called, current shareEnabled:', ctx.shareEnabled);
  
  try {
    const newShareStatus = !ctx.shareEnabled;
    console.log('🔄 New share status will be:', newShareStatus);
    
    // หาข้อมูลปัจจุบันเพื่อตรวจสอบประเภท
    const currentItem = ctx.fileListing.find(item => item._id === ctx.shareSelectedFolderId);
    const itemType = currentItem?.mimetype === 'folder' ? 'โฟลเดอร์' : 'ไฟล์';
    
    console.log('🔄 Current item:', currentItem);
    console.log('🔄 Share selected folder ID:', ctx.shareSelectedFolderId);
    
    const payload = {
      data: {
        share: newShareStatus
      }
    };

    // ถ้าเปิดการแชร์ ให้สร้าง shareKey ใหม่
    if (newShareStatus) {
      // สร้าง random key ที่ปลอดภัย
      const shareKey = ctx.generateSecureShareKey();
      payload.data.shareKey = shareKey;
      
      // เพิ่มรหัสผ่านถ้ามีการตั้งค่า
      if (ctx.shareHasPassword && ctx.sharePassword) {
        payload.data.sharePassword = ctx.sharePassword;
      }
      
      // เพิ่มวันหมดอายุถ้ามีการตั้งค่า
      if (ctx.shareHasExpiry && ctx.shareExpiryDate) {
        payload.data.shareExpiryDate = new Date(ctx.shareExpiryDate).toISOString();
      }
    } else {
      // ถ้าปิดการแชร์ ให้ลบข้อมูลทั้งหมด
      payload.data.shareKey = null;
      payload.data.sharePassword = null;
      payload.data.shareExpiryDate = null;
    }

    const { status } = await ctx.$Request.PUT(`storage/${ctx.shareSelectedFolderId}`, payload, ctx.requestKey());

    if (status === 200) {
      ctx.shareEnabled = newShareStatus;
      
      // อัพเดทข้อมูลใน fileListing ด้วย
      const itemIndex = ctx.fileListing.findIndex(item => item._id === ctx.shareSelectedFolderId);
      if (itemIndex !== -1) {
        ctx.fileListing[itemIndex].share = newShareStatus;
        if (newShareStatus) {
          ctx.fileListing[itemIndex].shareKey = payload.data.shareKey;
          ctx.fileListing[itemIndex].sharePassword = payload.data.sharePassword;
          ctx.fileListing[itemIndex].shareExpiryDate = payload.data.shareExpiryDate;
        } else {
          ctx.fileListing[itemIndex].shareKey = null;
          ctx.fileListing[itemIndex].sharePassword = null;
          ctx.fileListing[itemIndex].shareExpiryDate = null;
        }
      }
      
      if (ctx.shareEnabled) {
        ctx.shareUrl = `${window.location.origin}/drive/public/${ctx.shareSelectedFolderId}/${payload.data.shareKey}`;
        toast({ type: 'success', message: `เปิดการแชร์${itemType}เรียบร้อยแล้ว` });
      } else {
        ctx.shareUrl = '';
        toast({ type: 'success', message: `ปิดการแชร์${itemType}เรียบร้อยแล้ว` });
      }
      
      // รีเฟรช UI
      ctx.$forceUpdate();
    } else {
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแชร์' });
    }
  } catch (error) {
    console.error('Error toggling share status:', error);
    toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแชร์' });
  }
}

export function openShareFileModal(ctx, fileId, fileName) {
  // หาข้อมูลไฟล์จาก fileListing
  const file = ctx.fileListing.find(item => item._id === fileId);
  if (!file) {
    toast({ type: 'error', message: 'ไม่พบไฟล์ที่ต้องการแชร์' });
    return;
  }

  ctx.shareSelectedFolder = fileName;
  ctx.shareSelectedFolderId = fileId;
  ctx.shareEnabled = file.share || false;
  
  if (ctx.shareEnabled && file.shareKey) {
    ctx.shareUrl = `${window.location.origin}/drive/public/${fileId}/${file.shareKey}`;
  } else {
    ctx.shareUrl = '';
  }
  
  ctx.shareModal = true;
}

export async function shareFile(ctx, fileId) {
  try {
    // หาข้อมูลไฟล์จาก fileListing
    const file = ctx.fileListing.find(item => item._id === fileId);
    if (!file) {
      toast({ type: 'error', message: 'ไม่พบไฟล์ที่ต้องการแชร์' });
      return;
    }

    // ตรวจสอบสถานะการแชร์ปัจจุบัน
    const currentShareStatus = file.share || false;
    const newShareStatus = !currentShareStatus;

    const payload = {
      data: {
        share: newShareStatus
      }
    };

    // ถ้าเปิดการแชร์ ให้สร้าง shareKey ใหม่
    if (newShareStatus) {
      // สร้าง random key ที่ปลอดภัย
      const shareKey = ctx.generateSecureShareKey();
      payload.data.shareKey = shareKey;
    } else {
      // ถ้าปิดการแชร์ ให้ลบ shareKey
      payload.data.shareKey = null;
    }

    const { status } = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());

    if (status === 200) {
      // อัพเดทข้อมูลใน fileListing
      const fileIndex = ctx.fileListing.findIndex(item => item._id === fileId);
      if (fileIndex !== -1) {
        ctx.fileListing[fileIndex].share = newShareStatus;
        if (newShareStatus) {
          ctx.fileListing[fileIndex].shareKey = payload.data.shareKey;
        } else {
          ctx.fileListing[fileIndex].shareKey = null;
        }
      }

      if (newShareStatus) {
        const shareUrl = `${window.location.origin}/drive/public/${fileId}/${payload.data.shareKey}`;
        
        // คัดลอก URL ไปยัง clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({ type: 'success', message: `เปิดการแชร์ไฟล์ "${file.name}" แล้ว\nลิงค์ถูกคัดลอกไปยัง clipboard` });
        } catch (clipboardError) {
          toast({ type: 'success', message: `เปิดการแชร์ไฟล์ "${file.name}" แล้ว\nลิงค์: ${shareUrl}` });
        }
      } else {
        toast({ type: 'success', message: `ปิดการแชร์ไฟล์ "${file.name}" แล้ว` });
      }

      // รีเฟรชรายการเพื่อแสดง UI ที่อัพเดท
      ctx.$forceUpdate();
    } else {
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแชร์' });
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการแชร์ไฟล์' });
  }
}

// ดึง video URL ตาม quality ที่เลือก
export function getSelectedVideoUrl(ctx) {
  console.log('🎬 getSelectedVideoUrl called');
  console.log('🎬 selectedTranscodeQuality:', ctx.selectedTranscodeQuality);
  console.log('🎬 selectItemData:', ctx.selectItemData);
  
  // ถ้าเลือก STREAM และมี stream data
  if (ctx.selectedTranscodeQuality === 'STREAM' && ctx.selectItemData?.stream?.streamPlayback) {
    console.log('🎬 Returning stream URL:', ctx.selectItemData.stream.streamPlayback);
    return ctx.selectItemData.stream.streamPlayback;
  }
  
  // ถ้าเลือก original
  if (ctx.selectedTranscodeQuality === 'original') {
    const originalUrl = ctx.selectItemData?.original;
    console.log('🎬 Returning original URL:', originalUrl);
    return originalUrl;
  }
  
  // ถ้าเลือก transcode quality อื่นๆ
  if (ctx.selectItemData?.transcode && ctx.selectItemData.transcode[ctx.selectedTranscodeQuality]) {
    const transcodeUrl = ctx.selectItemData.transcode[ctx.selectedTranscodeQuality];
    console.log('🎬 Returning transcode URL for', ctx.selectedTranscodeQuality + ':', transcodeUrl);
    return transcodeUrl;
  }
  
  // fallback ถ้าไม่มีอะไรให้ใช้ stream หรือ original
  if (ctx.selectItemData?.stream?.streamPlayback) {
    console.log('🎬 Fallback to stream URL:', ctx.selectItemData.stream.streamPlayback);
    return ctx.selectItemData.stream.streamPlayback;
  }
  
  if (ctx.selectItemData?.original) {
    console.log('🎬 Fallback to original URL:', ctx.selectItemData.original);
    return ctx.selectItemData.original;
  }
  
  console.log('🎬 No suitable URL found, returning empty string');
  return '';
}
