// Drag & Drop Functions for FileManager
import debug from '@/plugins/Logger.js';

export default function attachDragDropFunctions(ctx) {

  // Handle multi-file drop (multiple files dragged together)
  ctx.handleMultiDrop = async function(event, targetPath) {
    try {
      const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
      ctx.debugLog('=== Multi Drop ===');
      ctx.debugLog('handleMultiDrop called with:', { dragData, targetPath });
      
      if (dragData.type === 'multiple' && dragData.fileIds && dragData.source === 'internal') {
        ctx.debugLog(`✅ Multi-drop: Moving ${dragData.fileIds.length} files to "${targetPath}"`);
        ctx.debugLog('Files to move:', dragData.fileIds);
        
        // ตั้งค่า selectedFiles ตาม drag data
        ctx.selectedFiles.clear();
        dragData.fileIds.forEach(id => ctx.selectedFiles.add(id));
        
        ctx.debugLog('Updated selectedFiles:', Array.from(ctx.selectedFiles));
        
        // ย้ายไฟล์ทั้งหมดโดยตรงไปยัง targetPath
        await ctx.batchMoveFilesToPath(targetPath);
        
        ctx.debugLog('✅ Multi-drop completed successfully');
      } else {
        ctx.debugLog('❌ Invalid multi-drop data:', dragData);
      }
    } catch (error) {
      ctx.debugLog('❌ Multi-drop parsing error:', error);
      console.error('Multi-drop error:', error);
      ctx.showToast('เกิดข้อผิดพลาดในการย้ายไฟล์', 'error', 3000);
    }
  };

  // Handle file drop (main drop handler for existing files)
  ctx.handleFileDrop = async function(event, targetParent) {
    event.preventDefault();
    event.stopPropagation();
    
    // ตรวจสอบ permission ใน share mode
    if (ctx.isShareMode && ctx.shareRootPermission === 'read') {
      ctx.$notify.error('คุณไม่มีสิทธิ์จัดการไฟล์ในโหมดดูอย่างเดียว');
      return;
    }
    
    ctx.debugLog("=== File Drop ===");
    ctx.debugLog("handleFileDrop called with target:", targetParent);
    ctx.debugLog("Current draggedItem:", ctx.draggedItem);
    
    // ลบ drop highlight
    const target = event.currentTarget;
    target.classList.remove('drop-highlight');
    
    try {
      // ตรวจสอบ drag data ก่อน
      let dragData = null;
      try {
        const dragText = event.dataTransfer.getData('text/plain');
        if (dragText) {
          dragData = JSON.parse(dragText);
          ctx.debugLog("✅ Parsed drag data:", dragData);
        }
      } catch (e) {
        ctx.debugLog("❌ No valid drag data found", e);
      }
      
      // ตรวจสอบว่าเป็นการลากจากภายในหรือภายนอก
      if (dragData && dragData.source === 'internal') {
        // การลากไฟล์จากภายใน - ประมวลผลต่อ
        ctx.debugLog("✅ Internal drag detected");
        
        // กรณี multi-drag
        if (dragData.type === 'multiple' && dragData.fileIds) {
          ctx.debugLog("🎯 Multi-drag detected:", dragData.fileIds);
          await ctx.handleMultiDrop(event, targetParent);
          return;
        }
        
        // กรณี single-drag
        if (dragData.type === 'single' && dragData.fileId) {
          ctx.debugLog("🎯 Single drag detected:", dragData.fileId);
          ctx.draggedItem = dragData.fileId; // ตั้งค่า draggedItem สำหรับ single drag
          await ctx.handleDrop(targetParent);
          return;
        }
      } else if (!dragData && event.dataTransfer && event.dataTransfer.files.length > 0) {
        // การลากไฟล์จากภายนอกเข้ามา - ให้ global handler จัดการ
        ctx.debugLog("🌐 External files dropped - letting global handler manage");
        ctx.onGlobalDrop(event);
        return;
      }

      // Fallback: ถ้าไม่มี drag data แต่มี draggedItem
      if (!dragData && ctx.draggedItem && ctx.draggedItem !== 'multi') {
        ctx.debugLog("🔄 Fallback: Processing single file movement to:", targetParent);
        await ctx.handleDrop(targetParent);
        return;
      }

      ctx.debugLog("❌ No valid drag operation detected - skipping");

    } catch (error) {
      console.error("Error in handleFileDrop:", error);
      ctx.showToast('เกิดข้อผิดพลาดในการย้ายไฟล์', 'error', 3000);
    }
  };

  // Handle drop of existing files (single file movement)
  ctx.handleDrop = async function(targetParent) {
    try {
      // ตรวจสอบว่าเป็นการลากไฟล์จากภายใน (existing files) หรือจากภายนอก (new files)
      if (!ctx.draggedItem && event && event.dataTransfer && event.dataTransfer.files.length > 0) {
        // การลากไฟล์ใหม่จากภายนอกเข้ามา - ไม่ควรจัดการที่นี่
        debug.log("External files dropped - ignoring in handleDrop");
        return;
      }

      if (!ctx.draggedItem) {
        debug.log("No dragged item found");
        return;
      }

      // ป้องกันการ drop ไฟล์ลงในตัวเอง
      if (ctx.draggedItem === targetParent) {
        debug.log("Cannot drop item onto itself");
        ctx.showToast('ไม่สามารถย้ายไฟล์ลงในตัวเองได้', 'warning', 2000);
        return;
      }

      // ป้องกันการ drop โฟลเดอร์ลงในโฟลเดอร์ลูก
      const draggedFile = ctx.fileListing.find(f => f._id === ctx.draggedItem);
      if (draggedFile && draggedFile.mimetype === 'folder' && targetParent.startsWith(draggedFile.path + '/')) {
        debug.log("Cannot drop folder into its own child");
        ctx.showToast('ไม่สามารถย้ายโฟลเดอร์ลงในโฟลเดอร์ลูกได้', 'warning', 2000);
        return;
      }

      // Set the drop target
      ctx.dropTarget = targetParent;
      debug.log("Moving existing file:", ctx.draggedItem, "to target:", ctx.dropTarget);

      // แสดง loading toast
      ctx.showToast('กำลังย้ายไฟล์...', 'pending', 0);

      // Move the file
      await ctx.moveFile(ctx.draggedItem, ctx.dropTarget);

      // แสดงผลสำเร็จ
      ctx.showToast('ย้ายไฟล์เรียบร้อยแล้ว', 'success', 2000);

      // Refresh file list
      await ctx.listFile(ctx.prefix);

    } catch (error) {
      console.error("Error handling drop:", error);
      ctx.showToast('เกิดข้อผิดพลาดในการย้ายไฟล์', 'error', 3000);
    } finally {
      // รีเซ็ต drag state
      ctx.dragging = false;
      ctx.draggedItem = "";
      ctx.dropTarget = "";
    }
  };

  // Global drag enter handler
  ctx.onGlobalDragEnter = function(evt) {
    evt.preventDefault();
    
    // Skip on touch devices
    if ('ontouchstart' in window) {
      return;
    }
    
    // ถ้าเป็นการลากไฟล์ที่มีอยู่แล้ว ไม่ต้องแสดง global drop overlay
    if (ctx.draggedItem) {
      debug.log("Existing file drag detected - skipping global overlay");
      return;
    }
    
    ctx.dragCounter++;
    if (ctx.dragCounter === 1) {
      ctx.showDropOverlay = true;
      // Store drag event for file count
      window.dragEvent = evt;
      document.body.classList.add('dragging');
    }
  };

  // Global drag over handler
  ctx.onGlobalDragOver = function(evt) {
    evt.preventDefault();
    
    // Skip on touch devices
    if ('ontouchstart' in window) {
      return;
    }
    
    // ถ้าเป็นการลากไฟล์ที่มีอยู่แล้ว ไม่ต้องจัดการ
    if (ctx.draggedItem) {
      return;
    }
    
    evt.dataTransfer.dropEffect = 'copy';
    // Update drag event
    window.dragEvent = evt;
  };

  // Global drag leave handler
  ctx.onGlobalDragLeave = function(evt) {
    evt.preventDefault();
    
    // Skip on touch devices
    if ('ontouchstart' in window) {
      return;
    }
    
    // ถ้าเป็นการลากไฟล์ที่มีอยู่แล้ว ไม่ต้องจัดการ
    if (ctx.draggedItem) {
      return;
    }
    
    ctx.dragCounter--;
    if (ctx.dragCounter === 0) {
      ctx.showDropOverlay = false;
      window.dragEvent = null;
      document.body.classList.remove('dragging');
    }
  };

  // Global drop handler
  ctx.onGlobalDrop = function(evt) {
    evt.preventDefault();
    
    // Skip on touch devices
    if ('ontouchstart' in window) {
      return;
    }
    
    ctx.dragCounter = 0;
    ctx.showDropOverlay = false;
    window.dragEvent = null;
    document.body.classList.remove('dragging');

    // ตรวจสอบว่าเป็นการลากไฟล์ใหม่จากภายนอกเท่านั้น
    const files = evt.dataTransfer.files;
    if (files.length > 0 && !ctx.draggedItem) {
      // เป็นการลากไฟล์ใหม่จากภายนอก
      debug.log("Global drop: New files from external source");
      // Call addDroppedFiles if it exists on the context
      if (ctx.addDroppedFiles) {
        ctx.addDroppedFiles(files);
      } else {
        console.warn("addDroppedFiles function not found on context");
      }
    } else if (ctx.draggedItem) {
      // เป็นการลากไฟล์ที่มีอยู่แล้ว - ไม่ต้องทำอะไร เพราะจะถูกจัดการที่ handleFileDrop
      debug.log("Global drop: Existing file movement - ignoring");
    }
  };

  // Handle drag over (for file/folder hover effects)
  ctx.handleDragOver = function(event) {
    event.preventDefault();
    
    // ถ้าเป็นการลากไฟล์ที่มีอยู่แล้ว ให้แสดง drop highlight
    if (ctx.draggedItem) {
      const target = event.currentTarget;
      target.classList.add('drop-highlight');
    }
  };

  // Handle drag leave (remove hover effects)
  ctx.handleDragLeave = function(event) {
    event.preventDefault();
    
    // ตรวจสอบว่าเป็นการลากไฟล์ที่มีอยู่แล้วหรือไม่
    if (!ctx.draggedItem) {
      return;
    }
    
    // ลบ highlight เมื่อ drag ออกจาก target
    const target = event.currentTarget;
    target.classList.remove('drop-highlight');
  };
}
