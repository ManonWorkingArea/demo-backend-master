// Batch Operations Functions for FileManager
import debug from '@/plugins/Logger.js';
import toast from '@/plugins/ToastUI.js';
import dialog from '@/plugins/Dialog.js';

export default function attachBatchOperationsFunctions(ctx) {

  // === BATCH OPERATIONS ===
  
  // ลบไฟล์หลายๆไฟล์
  ctx.batchDeleteFiles = async function() {
    
    // ตรวจสอบ permission ใน share mode
    if (ctx.isShareMode && ctx.shareRootPermission === 'read') {
      toast({ type: 'error', message: 'คุณไม่มีสิทธิ์ลบไฟล์ในโหมดดูอย่างเดียว' });
      return;
    }
    
    if (ctx.selectedFiles.size === 0) {
      toast({ type: 'warning', message: 'กรุณาเลือกไฟล์ที่ต้องการลบ' });
      return;
    }
    
    const fileCount = ctx.selectedFiles.size;
    const selectedFilesList = Array.from(ctx.selectedFiles);
    
    console.log('Selected files for deletion:', {
      fileCount,
      selectedFilesList,
      files: ctx.fileListing.filter(f => selectedFilesList.includes(f._id))
    });
    
    // ขอยืนยันจากผู้ใช้
    const confirmed = await new Promise((resolve) => {
      dialog.confirm({
        title: 'ยืนยันการลบ',
        message: `คุณต้องการลบไฟล์ ${fileCount} ไฟล์ใช่หรือไม่?`,
        confirm: () => {
          resolve(true);
        },
        cancel: () => {
          resolve(false);
        }
      });
    });
    
    if (!confirmed) {
      return;
    }
    
    ctx.batchOperationInProgress = true;
    ctx.batchOperation = 'delete';
    ctx.batchTotal = fileCount;
    ctx.batchProgress = 0;
    
    const toastInstance = toast({ 
      type: 'pending', 
      message: `กำลังลบไฟล์ ${fileCount} ไฟล์...` 
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < selectedFilesList.length; i++) {
      const fileId = selectedFilesList[i];
      const file = ctx.fileListing.find(f => f._id === fileId);
      
      if (file) {
        try {
          // กำหนด fileKey ที่ถูกต้อง
          let fileKey = file.path;
          if (!fileKey && file.original?.url) {
            fileKey = ctx.extractS3KeyFromUrl(file.original.url);
          }
          
          // ส่งข้อมูลไฟล์ไปด้วยเพื่อให้สามารถลบ original ได้
          await ctx.deleteFileDirectly(file.name, fileId, fileKey, file);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Delete error details:', error);
          
          // แสดงรายละเอียดข้อผิดพลาดเพิ่มเติม
          console.error('Failed file data:', {
            id: fileId,
            name: file.name,
            path: file.path,
            original: file.original,
            mimetype: file.mimetype
          });
        }
      } else {
        errorCount++;
        console.error(`File not found in fileListing for ID: ${fileId}`);
      }
      
      ctx.batchProgress = Math.round(((i + 1) / fileCount) * 100);
    }
    
    ctx.batchOperationInProgress = false;
    ctx.clearSelection();
    
    toastInstance.hide(
      `ลบไฟล์เสร็จแล้ว: สำเร็จ ${successCount} ไฟล์${errorCount > 0 ? `, ล้มเหลว ${errorCount} ไฟล์` : ''}`,
      errorCount > 0 ? 'warning' : 'success'
    );
    
    // รีเฟรชรายการไฟล์
    await ctx.listFile(ctx.prefix);
    debug.log('File list refreshed');
  };
  
  // ย้ายไฟล์หลายๆไฟล์
  ctx.batchMoveFiles = async function() {
    if (ctx.selectedFiles.size === 0) {
      toast({ type: 'warning', message: 'กรุณาเลือกไฟล์ที่ต้องการย้าย' });
      return;
    }
    
    // ขอให้ผู้ใช้เลือกโฟลเดอร์ปลายทาง
    const targetPath = await ctx.selectTargetFolder();
    if (!targetPath) return; // ยกเลิกถ้าไม่ได้เลือกโฟลเดอร์
    
    const fileCount = ctx.selectedFiles.size;
    const selectedFilesList = Array.from(ctx.selectedFiles);
    
    ctx.batchOperationInProgress = true;
    ctx.batchOperation = 'move';
    ctx.batchTotal = fileCount;
    ctx.batchProgress = 0;
    
    const toastInstance = toast({ 
      type: 'pending', 
      message: `กำลังย้ายไฟล์ ${fileCount} ไฟล์...` 
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < selectedFilesList.length; i++) {
      const fileId = selectedFilesList[i];
      
      try {
        await ctx.moveFile(fileId, targetPath);
        successCount++;
        debug.log(`Batch move: File ${fileId} moved successfully`);
      } catch (error) {
        errorCount++;
        debug.log(`Batch move error for ${fileId}:`, error);
      }
      
      ctx.batchProgress = Math.round(((i + 1) / fileCount) * 100);
    }
    
    ctx.batchOperationInProgress = false;
    ctx.clearSelection();
    
    toastInstance.hide(
      `ย้ายไฟล์เสร็จแล้ว: สำเร็จ ${successCount} ไฟล์${errorCount > 0 ? `, ล้มเหลว ${errorCount} ไฟล์` : ''}`,
      errorCount > 0 ? 'warning' : 'success'
    );
    
    await ctx.listFile(ctx.prefix); // รีเฟรชรายการไฟล์
  };

  // สร้างโฟลเดอร์ใหม่และย้ายไฟล์ที่เลือกไปไว้ในนั้น
  ctx.createFolderAndMoveSelected = async function() {
    if (ctx.selectedFiles.size === 0) {
      toast({ type: 'warning', message: 'กรุณาเลือกไฟล์ที่ต้องการย้าย' });
      return;
    }

    // เปิดโหมดสร้างโฟลเดอร์และย้ายไฟล์
    ctx.createFolderAndMoveMode = true;
    ctx.createFolderModal = true;
  };

  // ย้ายไฟล์หลายๆไฟล์ไปยัง path ที่กำหนด (สำหรับ drag & drop)
  ctx.batchMoveFilesToPath = async function(targetPath) {
    if (ctx.selectedFiles.size === 0) {
      toast({ type: 'warning', message: 'กรุณาเลือกไฟล์ที่ต้องการย้าย' });
      return;
    }
    
    const fileCount = ctx.selectedFiles.size;
    const selectedFilesList = Array.from(ctx.selectedFiles);
    
    debug.log(`Starting batch move to path: "${targetPath}" with ${fileCount} files`);
    
    ctx.batchOperationInProgress = true;
    ctx.batchOperation = 'move';
    ctx.batchTotal = fileCount;
    ctx.batchProgress = 0;
    
    const toastInstance = toast({ 
      type: 'pending', 
      message: `กำลังย้ายไฟล์ ${fileCount} ไฟล์...` 
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < selectedFilesList.length; i++) {
      const fileId = selectedFilesList[i];
      
      try {
        await ctx.moveFileToPath(fileId, targetPath);
        successCount++;
        debug.log(`Batch move: File ${fileId} moved successfully to ${targetPath}`);
      } catch (error) {
        errorCount++;
        debug.log(`Batch move error for ${fileId}:`, error);
      }
      
      ctx.batchProgress = Math.round(((i + 1) / fileCount) * 100);
    }
    
    ctx.batchOperationInProgress = false;
    ctx.clearSelection();
    
    toastInstance.hide(
      `ย้ายไฟล์เสร็จแล้ว: สำเร็จ ${successCount} ไฟล์${errorCount > 0 ? `, ล้มเหลว ${errorCount} ไฟล์` : ''}`,
      errorCount > 0 ? 'warning' : 'success'
    );
    
    await ctx.listFile(ctx.prefix); // รีเฟรชรายการไฟล์
  };

  // Helper function: Extract S3 key from URL
  ctx.extractS3KeyFromUrl = function(url) {
    try {
      debug.log("🔍 extractS3KeyFromUrl input:", url);
      if (!url) {
        debug.log("❌ URL is null/undefined");
        return null;
      }
      
      // ลบ endpoint URL ออกเพื่อเหลือแค่ key
      const endpoint = ctx.configs.s3Endpoint;
      debug.log("🔍 S3 endpoint:", endpoint);
      
      if (url.startsWith(endpoint)) {
        const key = url.substring(endpoint.length);
        debug.log("✅ Extracted S3 key:", key);
        return key;
      }
      
      // ถ้าไม่ใช่ format ที่คาดหวัง ให้ return url เดิม
      debug.log("⚠️ URL doesn't start with endpoint, returning as-is");
      return url;
    } catch (error) {
      debug.log('❌ Error extracting S3 key from URL:', error);
      return url;
    }
  };

  // Helper function: Clear selection
  ctx.clearSelection = function() {
    ctx.selectedFiles.clear();
    ctx.batchOperationInProgress = false;
    ctx.batchOperation = '';
    ctx.batchTotal = 0;
    ctx.batchProgress = 0;
    ctx.createFolderAndMoveMode = false;
  };
}
