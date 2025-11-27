// File Browser & File Management Functions for FileManager
import { ListObjectsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import debug from '@/plugins/Logger.js';
import storageManager from '@/plugins/storage';
import toast from '@/plugins/ToastUI.js';
import dialog from '@/plugins/Dialog.js';

export default function attachFileBrowserFunctions(ctx) {

  // Main file browser rendering function
  ctx.renderFileBrowser = async function() {
    if(storageManager.get('session','login')) {
      try {
        const session = storageManager.get('session');
        ctx.rawfileList = "";
        ctx.fileList = [];
        ctx.prefix = session.prefix;

        await ctx.listFile(ctx.prefix);

        const data = await ctx.S3.send(new ListObjectsCommand({
          Bucket: ctx.configs.s3Bucket, 
          Prefix: ctx.prefix
        }));
        
        debug.log("Success", data.Contents);
        
        if(data.Contents != undefined && data.Contents != null && data.Contents != "") {
          // Process S3 data
          const processedData = ctx.processS3Data(data.Contents);
          
          // Build file and folder objects
          ctx.buildFileList(processedData);
          
          // Sort and organize
          ctx.sortFileList();
          
          // Update folder path for navigation
          ctx.updateFolderPath();
          
          debug.log("File List", ctx.fileList);
          debug.log("Folder Path", ctx.folderPath);
          debug.log("Object Count", ctx.objCount);
        }
      } catch (err) {
        debug.log("Error", err);
      }
    }
  };

  // Process raw S3 data into manageable format
  ctx.processS3Data = function(contents) {
    let rawFile = [];
    
    for (let i = 0; i < contents.length; i++) {
      rawFile.push(contents[i].Key);
    }
    
    ctx.rawfileList = rawFile.join();
    ctx.objCount = contents.length;
    
    debug.log("RAW", ctx.rawfileList);
    
    return contents.map(item => {
      let contentObj;
      
      if(ctx.prefix != "" && ctx.prefix != undefined) {
        contentObj = item.Key.replace(ctx.prefix + "/", '');
      } else {
        contentObj = item.Key;
      }
      
      return {
        originalKey: item.Key,
        contentObj: contentObj,
        size: item.Size,
        lastModified: item.LastModified
      };
    });
  };

  // Build file list from processed data
  ctx.buildFileList = function(processedData) {
    ctx.fileList = [];
    
    for (let i = 0; i < processedData.length; i++) {
      const item = processedData[i];
      
      debug.log("contentObj", item.contentObj);
      
      if(item.contentObj.includes('/')) {
        // Handle folders
        ctx.processFolderItem(item);
      } else {
        // Handle files
        if(item.contentObj.trim().length) {
          ctx.processFileItem(item);
        }
      }
    }
  };

  // Process folder items
  ctx.processFolderItem = function(item) {
    const res = item.contentObj.split("/");
    const arrFiltered = res.filter(el => {
      return el != null && el != '';
    });
    
    debug.log("length", arrFiltered.length);
    debug.log("contentObj", item.contentObj);
    
    if(arrFiltered.length == 1) {
      const folderObj = ctx.createFolderObject(item);
      ctx.fileList.push(folderObj);
    }
  };

  // Process file items
  ctx.processFileItem = function(item) {
    const fileType = ctx.detectFileType(item.contentObj);
    const fileObj = ctx.createFileObject(item, fileType);
    ctx.fileList.push(fileObj);
  };

  // Create folder object for UI
  ctx.createFolderObject = function(item) {
    const folderName = item.contentObj.replace("/", '');
    const folderPrefix = ctx.prefix != "" && ctx.prefix != undefined ? 
      ctx.prefix + '/' + folderName : 
      folderName;
    
    return {
      title: folderName,
      prefix: folderPrefix,
      count: ctx.countInnerObj(ctx.rawfileList, item.contentObj),
      size: item.size,
      create: item.lastModified,
      isFolder: true
    };
  };

  // Create file object for UI
  ctx.createFileObject = function(item, fileTypeInfo) {
    const fileName = item.contentObj.replace("/", '');
    const filePrefix = ctx.prefix != "" && ctx.prefix != undefined ? 
      ctx.prefix + '/' + fileName : 
      fileName;
    
    return {
      title: fileName,
      prefix: filePrefix,
      size: item.size,
      type: fileTypeInfo.group,
      cover: fileTypeInfo.cover,
      icon: fileTypeInfo.icon,
      create: item.lastModified,
      isFolder: false
    };
  };

  // Detect file type and return metadata
  ctx.detectFileType = function(contentObj) {
    const filetype = contentObj.replace("/", '').substring(
      contentObj.replace("/", '').lastIndexOf(".") + 1
    ).toLowerCase();
    
    return ctx.getFileTypeInfo(filetype, contentObj);
  };

  // Get file type information (icon, group, cover)
  ctx.getFileTypeInfo = function(filetype, contentObj) {
    // Image files
    if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(filetype)) {
      return {
        group: "image",
        icon: "",
        cover: ctx.buildImageCoverUrl(contentObj)
      };
    }
    
    // Video files
    if(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(filetype)) {
      return {
        group: "video",
        icon: "file-video",
        cover: ""
      };
    }
    
    // Audio files
    if(['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(filetype)) {
      return {
        group: "audio",
        icon: "file-audio",
        cover: ""
      };
    }
    
    // Document files
    const documentTypes = {
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-spreadsheet',
      'xlsx': 'file-spreadsheet',
      'pdf': 'file-pdf',
      'ppt': 'file-powerpoint',
      'pptx': 'file-powerpoint',
      'txt': 'file-alt',
      'rtf': 'file-alt',
      'csv': 'file-csv'
    };
    
    if(documentTypes[filetype]) {
      return {
        group: "document",
        icon: documentTypes[filetype],
        cover: ""
      };
    }
    
    // Archive files
    if(['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(filetype)) {
      return {
        group: "archive",
        icon: "file-archive",
        cover: ""
      };
    }
    
    // Code files
    if(['js', 'ts', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c'].includes(filetype)) {
      return {
        group: "code",
        icon: "file-code",
        cover: ""
      };
    }
    
    // Default fallback
    return {
      group: "document",
      icon: "file",
      cover: ""
    };
  };

  // Build image cover URL
  ctx.buildImageCoverUrl = function(contentObj) {
    const cleanObj = contentObj.replace("/", '');
    
    if(ctx.prefix != "" && ctx.prefix != undefined) {
      return ctx.configs.s3Endpoint + ctx.prefix + "/" + cleanObj;
    } else {
      return ctx.configs.s3Endpoint + cleanObj;
    }
  };

  // Sort file list (folders first, then files)
  ctx.sortFileList = function() {
    ctx.fileList.sort(function(a, b) {
      // First priority: folders come before files
      const folderDiff = b.isFolder - a.isFolder;
      if (folderDiff !== 0) return folderDiff;
      
      // Second priority: natural sorting by title
      return a.title.localeCompare(b.title, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  };

  // Update folder path for breadcrumb navigation
  ctx.updateFolderPath = function() {
    ctx.folderPath = ctx.prefix;
    
    if(ctx.folderPath != "" && ctx.folderPath != undefined) {
      ctx.folderPath = ctx.folderPath.split("/");
    } else {
      ctx.folderPath = "";
    }
  };

  // Count inner objects in a folder (helper function)
  ctx.countInnerObj = function(rawfileList, folderPath) {
    if (!rawfileList || !folderPath) return 0;
    
    const files = rawfileList.split(',');
    let count = 0;
    
    for (let file of files) {
      if (file.startsWith(folderPath) && file !== folderPath) {
        count++;
      }
    }
    
    return count;
  };

  // Refresh file browser data
  ctx.refreshFileBrowser = async function() {
    debug.log('Refreshing file browser...');
    try {
      await ctx.renderFileBrowser();
      debug.log('File browser refreshed successfully');
    } catch (error) {
      debug.log('Error refreshing file browser:', error);
    }
  };

  // Navigate to folder (update prefix and refresh)
  ctx.navigateToFolder = async function(folderPrefix) {
    debug.log('Navigating to folder:', folderPrefix);
    
    try {
      // Update session prefix
      const session = storageManager.get('session');
      session.prefix = folderPrefix;
      storageManager.set('session', session);
      
      // Update local prefix
      ctx.prefix = folderPrefix;
      
      // Refresh browser
      await ctx.renderFileBrowser();
      
      debug.log('Navigation completed to:', folderPrefix);
    } catch (error) {
      debug.log('Error navigating to folder:', error);
    }
  };

  // Navigate back to parent folder
  ctx.navigateBack = async function() {
    if (!ctx.prefix) return;
    
    const pathParts = ctx.prefix.split('/');
    pathParts.pop(); // Remove last part
    const parentPath = pathParts.join('/');
    
    await ctx.navigateToFolder(parentPath);
  };

  // Get current folder info
  ctx.getCurrentFolderInfo = function() {
    return {
      prefix: ctx.prefix,
      folderPath: ctx.folderPath,
      fileCount: ctx.fileList ? ctx.fileList.filter(f => !f.isFolder).length : 0,
      folderCount: ctx.fileList ? ctx.fileList.filter(f => f.isFolder).length : 0,
      totalItems: ctx.objCount || 0
    };
  };

  // Filter files by type
  ctx.filterFilesByType = function(fileType) {
    if (!ctx.fileList) return [];
    
    if (fileType === 'all') {
      return ctx.fileList;
    }
    
    if (fileType === 'folder') {
      return ctx.fileList.filter(item => item.isFolder);
    }
    
    return ctx.fileList.filter(item => !item.isFolder && item.type === fileType);
  };

  // Search files by name
  ctx.searchFiles = function(searchQuery) {
    if (!ctx.fileList || !searchQuery) return ctx.fileList;
    
    const query = searchQuery.toLowerCase();
    return ctx.fileList.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  };

  // === FILE/FOLDER MANAGEMENT FUNCTIONS ===

  // Helper function for refreshing current folder
  ctx.refreshCurrentFolder = async function() {
    debug.log('Refreshing current folder:', ctx.prefix);
    await ctx.listFile(ctx.prefix);
    debug.log('Current folder refreshed');
  };

  // Add file to database
  ctx.addFile = async function(file) {
    try {
      ctx.toast = toast({ type: 'pending', message: 'กำลังเพิ่มไฟล์' + file.name });
      
      // ใน share mode ใช้ owner ของ root folder, ใน normal mode ใช้ owner จาก session
      const ownerToUse = ctx.isShareMode && ctx.shareRootOwner ? 
                        ctx.shareRootOwner : 
                        (ctx.session?.current?._id || ctx.configs.siteID);
      
      const payload = {
        data: {
          owner: ownerToUse,
          original: file.original,
          path: file.path,
          parent: ctx.prefix,
          name: file.name,
          size: file.size,
          type: file.mimetype,
          mimetype: file.type,
          spaceId: ctx.session?.current?.spaceId || ctx.configs.spaceId,
        },
        options: {}
      };
      
      console.log('Adding file with owner:', ownerToUse, 'Share mode:', ctx.isShareMode);
      
      // ใน share mode ใช้ key เป็น 'public'
      const requestKey = ctx.isShareMode ? ctx.hostkey : ctx.hostkey;
      const { data } = await ctx.$Request.POST('storage/', payload, requestKey);
      ctx.toast.hide('เพิ่มเสร็จแล้ว.', 'success', 300, () => {
        return data;
      });
    } catch (error) {
      debug.log(error);
    }
  };

  // Assign space to file
  ctx.assignSpace = async function(file) {
    try {
      const payload = {
        data: {
          "spaceId": ctx.session?.current?.spaceId || ctx.configs.spaceId,
        },
        options: {}
      };
      const { status } = await ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());

      if(status === 200) {
        ctx.debouncedList();
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Rename file or folder
  ctx.renameFile = async function(file, name) {
    try {
      const payload = {
        data: {
          "name": name,
        },
        options: {}
      };
      const { status } = await ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());

      if(status === 200) {
        // อัพเดต fileListing array โดยตรงแทนการเรียก listFile()
        const fileIndex = ctx.fileListing.findIndex(f => f._id === file);
        if (fileIndex !== -1) {
          const oldName = ctx.fileListing[fileIndex].name;
          ctx.updateFileNameInArrays(file, oldName, name);
          debug.log(`File renamed successfully: ${oldName} -> ${name}`);
        } else {
          debug.log(`File not found in fileListing: ${file}, falling back to listFile()`);
          await ctx.listFile(ctx.prefix);
        }
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Resize file
  ctx.resizeFile = async function(file, size) {
    try {
      const payload = {
        data: {
          "size": size,
        },
        options: {}
      };
      const { status } = await ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());

      if(status === 200) {
        await ctx.listFile(ctx.prefix);
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Update file with original URL
  ctx.updateFileWithOriginal = async function(fileId, size, originalUrl) {
    try {
      const payload = {
        data: {
          "size": size,
          "original": {
            "url": originalUrl,
            "processedAt": new Date().toISOString()
          }
        },
        options: {}
      };
      const { status } = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());

      if(status === 200) {
        await ctx.listFile(ctx.prefix);
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Update file thumbnail
  ctx.thumbnailFile = async function(file, thumbnail, duration) {
    debug.log(`Starting thumbnailFile for file: ${file}`);
    try {
      // ตรวจสอบขนาดของ base64 string ก่อนส่ง
      const sizeInBytes = thumbnail.length * 0.75; // ประมาณการขนาด base64
      if (sizeInBytes > 800 * 1024) { // เพิ่ม limit จาก 200KB เป็น 800KB
        debug.log(`Thumbnail too large: ${Math.round(sizeInBytes/1024)}KB, skipping upload`);
        ctx.showToast('Thumbnail ใหญ่เกินไป จะข้ามการอัปโหลด', 'warning', 2000);
        return;
      }

      const payload = {
        data: {
          "thumbnail": thumbnail,
          "duration": duration,
        },
        options: {}
      };
      
      debug.log(`Uploading thumbnail for file ${file}, size: ${Math.round(sizeInBytes/1024)}KB`);
      
      // ตรวจสอบ base64 format
      if (!thumbnail.startsWith('data:image/')) {
        debug.log('Invalid thumbnail format, expected data:image/ prefix');
        return;
      }
      
      // เพิ่ม timeout สำหรับ API request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Thumbnail upload timeout')), 15000)
      );
      
      const uploadPromise = ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());
      
      const { status } = await Promise.race([uploadPromise, timeoutPromise]);

      if(status === 200) {
        debug.log('Thumbnail uploaded successfully');
        
        // อัปเดต thumbnail ใน local state ทันที
        const fileInList = ctx.fileListing.find(f => f._id === file);
        if (fileInList) {
          fileInList.thumbnail = thumbnail;
          ctx.$forceUpdate();
          debug.log('Thumbnail updated in local state for:', fileInList.name || fileInList.title);
        } else {
          debug.log('File not found in fileListing for thumbnail update, ID:', file);
          debug.log('Available files:', ctx.fileListing.map(f => ({ id: f._id, name: f.name })));
        }
        
        await ctx.listFile(ctx.prefix);
        debug.log('File list refreshed after thumbnail upload');
      } else {
        debug.log(`Thumbnail upload failed with status: ${status}`);
      }
    } catch (error) {
      debug.log('Thumbnail upload error:', error);
      
      // จัดการ error ตามประเภท
      if (error.message?.includes('413') || error.message?.includes('Content Too Large')) {
        ctx.showToast('ไฟล์ Thumbnail ใหญ่เกินไป', 'error', 3000);
      } else if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
        ctx.showToast('ปัญหาการเชื่อมต่อ CORS', 'error', 3000);
      } else {
        ctx.showToast('เกิดข้อผิดพลาดในการอัปโหลด Thumbnail', 'error', 3000);
      }
    }
  };

  // Move file to new parent
  ctx.moveFile = async function(file, parent) {
    try {
      const payload = {
        data: {
          "parent": parent,
        },
        options: {}
      };
      const { status } = await ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());

      if(status === 200) {
        await ctx.listFile(ctx.prefix);
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Move file to specific path (for batch operations)
  ctx.moveFileToPath = async function(fileId, targetPath) {
    try {
      debug.log(`Moving file ${fileId} to path: "${targetPath}"`);
      
      const payload = {
        data: {
          "parent": targetPath,
        },
        options: {}
      };
      
      const response = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());
      
      if (response.status === 200) {
        debug.log(`File ${fileId} moved successfully`);
        return true;
      } else {
        throw new Error(`Move failed with status: ${response.status}`);
      }
    } catch (error) {
      debug.log(`Move file error:`, error);
      throw error;
    }
  };

  // Delete document with toast notification
  ctx.deleteDocument = async function(id) {
    try {
      ctx.toast = toast({ type: 'pending', message: 'กำลังลบ..' });
      const { status } = await ctx.$Request.DELETE(`storage/${id}`, null, ctx.requestKey());
      if(status === 200) {
        ctx.toast.hide('ลบเสร็จแล้ว.', 'success', 300, async () => {
          await ctx.listFile(ctx.prefix);
        });
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // Delete document silently (for batch operations)
  ctx.deleteDocumentSilent = async function(id) {
    try {
      if (!id) {
        throw new Error('Document ID is required for deletion');
      }
      
      debug.log("Deleting document silently:", id);
      const response = await ctx.$Request.DELETE(`storage/${id}`, null, ctx.requestKey());
      debug.log("Silent delete response:", response);
      
      if (response.status === 200) {
        debug.log("Document deleted successfully:", id);
        return true;
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (error) {
      debug.log("Silent delete error:", error);
      throw error;
    }
  };

  // Create new folder
  ctx.createFolder = async function(payload) {
    // ตรวจสอบ permission ใน share mode
    if (ctx.isShareMode && ctx.shareRootPermission === 'read') {
      ctx.$notify.error('คุณไม่มีสิทธิ์สร้างโฟลเดอร์ในโหมดดูอย่างเดียว');
      return;
    }

    const folderNameToCreate = payload.foldername;
    // Check if the folder name already exists in the fileListing array
    const folderAlreadyExists = ctx.fileListing.some(item => {
      return item.mimetype === 'folder' && item.name === folderNameToCreate;
    });

    if (folderAlreadyExists) {
      // Handle the case where the folder name already exists
      ctx.error = true;
      ctx.errorText = `มีโฟลเดรอ์ '${folderNameToCreate}' ในระบบแล้ว.`;
      return; // Exit the function
    }

    let folderpath;
    if(ctx.folderPath != "" && ctx.folderPath != undefined) {
      folderpath = ctx.prefix + "/" + payload.foldername;
    } else {
      folderpath = payload.foldername;
    }

    await ctx.addFile({ 
      parent: ctx.prefix, 
      path: folderpath, 
      name: payload.foldername, 
      size: null, 
      type: 'folder' 
    });
    ctx.createFolderModal = false;

    // ถ้าอยู่ในโหมดสร้างโฟลเดอร์และย้ายไฟล์
    if (ctx.createFolderAndMoveMode && ctx.selectedFiles.size > 0) {
      await ctx.moveSelectedFilesToFolder(folderpath, payload.foldername);
    }

    ctx.listFile(ctx.prefix);
  };

  // Move selected files to newly created folder
  ctx.moveSelectedFilesToFolder = async function(folderPath, folderName) {
    try {
      const fileCount = ctx.selectedFiles.size;
      const selectedFilesList = Array.from(ctx.selectedFiles);

      const toastInstance = toast({ 
        type: 'pending', 
        message: `กำลังย้ายไฟล์ ${fileCount} ไฟล์ไปยังโฟลเดอร์ "${folderName}"...` 
      });

      let successCount = 0;
      let errorCount = 0;

      // ย้ายไฟล์ที่เลือกไปยังโฟลเดอร์ใหม่
      for (let i = 0; i < selectedFilesList.length; i++) {
        const fileId = selectedFilesList[i];
        
        try {
          await ctx.moveFileToPath(fileId, folderPath);
          successCount++;
          debug.log(`Moved file ${fileId} to new folder ${folderName}`);
        } catch (error) {
          errorCount++;
          debug.log(`Error moving file ${fileId} to new folder:`, error);
        }
      }

      // ล้างการเลือกไฟล์และรีเซ็ตโหมด
      ctx.clearSelection();
      ctx.createFolderAndMoveMode = false;

      toastInstance.hide(
        `สร้างโฟลเดอร์และย้ายไฟล์เสร็จแล้ว: สำเร็จ ${successCount} ไฟล์${errorCount > 0 ? `, ล้มเหลว ${errorCount} ไฟล์` : ''}`,
        errorCount > 0 ? 'warning' : 'success'
      );

    } catch (error) {
      debug.log('Error moving files to new folder:', error);
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการย้ายไฟล์ไปยังโฟลเดอร์ใหม่' });
      ctx.createFolderAndMoveMode = false;
    }
  };

  // Count files in folder
  ctx.countFolder = async function(payload) {
    try {
      const data = await ctx.S3.send(new ListObjectsCommand({
        Bucket: ctx.configs.s3Bucket, 
        Prefix: payload
      }));
      debug.log("Success", data);
      return data.Contents.length;
    } catch (error) {
      debug.log(error);
    }
  };

  // Rename folder
  ctx.RenameFolder = async function(payload) {
    debug.log("payload", payload);
    // Extract the file extension from originalname (if it exists)
    const originalNameParts = payload.originalname.split('.');
    let folderNameWithExtension = payload.foldername;
    
    if (originalNameParts.length > 1) {
      // If originalname has an extension, append it to foldername
      folderNameWithExtension += '.' + originalNameParts.pop();
    }

    // Rename the folder using folderNameWithExtension
    await ctx.renameFile(payload.originalid, folderNameWithExtension);

    ctx.RenameFolderModal = false;
    // ไม่ต้องเรียก listFile() เพราะ renameFile จะอัพเดต fileListing array แล้ว
    debug.log('Rename completed, fileListing updated locally');
  };

  // Delete folder with confirmation
  ctx.deleteFolder = async function(payload, id, count) {
    if (count > 0) {
      ctx.error = true;
      ctx.errorText = 'ไม่สามารถลบโฟลเดอร์ที่มีไฟล์ภายในได้';
      dialog.prompt({
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถลบโฟลเดอร์ที่มีไฟล์ภายในได้ !',
        confirm: async () => {},
        cancel: () => {}
      });
      return;
    }
    dialog.confirm({
      title: 'ต้องการลบโฟลเดอร์นี้?',
      message: 'หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !',
      confirm: async () => {
        try {
          await ctx.deleteDocument(id);
        } catch (error) {
          debug.log(error);
        }
      },
      cancel: () => {}
    });
  };

  // Delete file with confirmation
  ctx.deleteFile = async function(payload, id, file) {
    // ตรวจสอบ permission ใน share mode
    if (ctx.isShareMode && ctx.shareRootPermission === 'read') {
      ctx.$notify.error('คุณไม่มีสิทธิ์ลบไฟล์ในโหมดดูอย่างเดียว');
      return;
    }
    
    dialog.confirm({
      title: 'ต้องการลบไฟล์นี้?',
      message: 'หลังจากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้อีก !',
      confirm: async () => {
        try {
          debug.log("=== Delete File Starting ===");
          debug.log("Input params:", { payload, id, file });
          debug.log("selectItemData:", ctx.selectItemData);
          debug.log("S3 ready:", ctx.isS3Ready());
          debug.log("S3 config:", {
            hasS3: !!ctx.S3,
            bucket: ctx.configs?.s3Bucket,
            endpoint: ctx.configs?.s3Endpoint
          });
          
          // ตรวจสอบ prerequisites
          if (!id) {
            throw new Error('File ID not provided for database deletion');
          }
          
          // หาข้อมูลไฟล์จาก fileListing ก่อน
          const fileData = ctx.fileListing.find(f => f._id === id);
          
          // ลบ thumbnailUrl จาก S3 ก่อน (ถ้ามี)
          if (ctx.isS3Ready() && fileData && fileData.thumbnailUrl) {
            try {
              // ใช้ helper function เพื่อดึง key
              const thumbnailKey = ctx.extractS3KeyFromUrl(fileData.thumbnailUrl);
              
              if (thumbnailKey) {
                try {
                  await ctx.S3.send(new DeleteObjectCommand({
                    Bucket: ctx.configs.s3Bucket, 
                    Key: thumbnailKey
                  }));
                } catch (thumbnailS3Error) {
                  console.warn("S3 delete failed for thumbnail file:", thumbnailS3Error);
                  // ไม่ throw error เพื่อให้การลบหลักดำเนินต่อไปได้
                }
              }
            } catch (thumbnailError) {
              console.warn("Thumbnail file delete failed:", thumbnailError);
              // ไม่ต้อง throw error เพื่อให้การลบหลักดำเนินต่อไปได้
            }
          }

          // ลบไฟล์หลักจาก S3 (ถ้ามี S3 configuration)
          if (ctx.isS3Ready() && file) {
            try {
              await ctx.S3.send(new DeleteObjectCommand({
                Bucket: ctx.configs.s3Bucket, 
                Key: file
              }));
            } catch (s3Error) {
              console.warn("S3 delete failed for main file:", s3Error);
              // ดำเนินการต่อถึงแม้ S3 delete จะล้มเหลว
            }
          }
          
          // ตรวจสอบและลบไฟล์ original ถ้ามี
          if (ctx.isS3Ready() && fileData && fileData.original && fileData.original.url) {
            try {
              // ใช้ helper function เพื่อดึง key
              const originalKey = ctx.extractS3KeyFromUrl(fileData.original.url);
              
              if (originalKey) {
                try {
                  await ctx.S3.send(new DeleteObjectCommand({
                    Bucket: ctx.configs.s3Bucket, 
                    Key: originalKey
                  }));
                } catch (originalS3Error) {
                  console.warn("S3 delete failed for original file:", originalS3Error);
                  // ไม่ throw error เพื่อให้การลบหลักดำเนินต่อไปได้
                }
              }
            } catch (originalError) {
              console.warn("Original file delete failed:", originalError);
              // ไม่ต้อง throw error เพื่อให้การลบหลักดำเนินต่อไปได้
            }
          }
          
          // ลบจากฐานข้อมูล
          if (!id) {
            throw new Error('File ID not provided for database deletion');
          }
          
          debug.log("Deleting from database with ID:", id);
          await ctx.deleteDocument(id);
          debug.log("✅ Database deletion completed");
          
          // รีเฟรชและปิด UI
          await ctx.refreshCurrentFolder();
          ctx.closeViewFile();
          ctx.showModal = false;
          
          debug.log("✅ File deletion completed successfully");
          toast({ type: 'success', message: 'ลบไฟล์เรียบร้อยแล้ว' });
          
        } catch (error) {
          debug.log("❌ Delete file error:", error);
          console.error("Complete delete error details:", error);
          
          // แสดง error message ที่ละเอียดขึ้น
          let errorMessage = 'เกิดข้อผิดพลาดในการลบไฟล์';
          if (error.message) {
            errorMessage += `: ${error.message}`;
          }
          
          toast({ type: 'error', message: errorMessage });
        }
      },
      cancel: () => {}
    });
  };

  // Delete file directly (for batch operations)
  ctx.deleteFileDirectly = async function(fileName, fileId, fileKey, fileData = null) {
    try {
      debug.log("=== Starting Direct Delete ===");
      debug.log("Input params:", { fileName, fileId, fileKey, fileData });
      debug.log("S3 ready:", ctx.isS3Ready());
      debug.log("S3 config:", {
        hasS3: !!ctx.S3,
        bucket: ctx.configs?.s3Bucket,
        endpoint: ctx.configs?.s3Endpoint
      });
      
      // ตรวจสอบ prerequisites สำหรับฐานข้อมูล
      if (!fileId) {
        throw new Error('File ID required for deletion');
      }
      
      // หาข้อมูลไฟล์ถ้าไม่ได้ส่งมา
      if (!fileData && fileId) {
        fileData = ctx.fileListing.find(f => f._id === fileId);
        debug.log("Found file data:", fileData);
      }
      
      // ลบ thumbnailUrl จาก S3 ก่อน (ถ้ามี)
      if (ctx.isS3Ready() && fileData && fileData.thumbnailUrl) {
        try {
          // ใช้ helper function เพื่อดึง key
          const thumbnailKey = ctx.extractS3KeyFromUrl(fileData.thumbnailUrl);
          
          if (thumbnailKey) {
            try {
              await ctx.S3.send(new DeleteObjectCommand({
                Bucket: ctx.configs.s3Bucket, 
                Key: thumbnailKey
              }));
            } catch (thumbnailS3Error) {
              console.warn("S3 delete failed for thumbnail file:", thumbnailS3Error);
              // ไม่ throw error เพื่อให้การลบหลักดำเนินต่อไปได้
            }
          }
        } catch (thumbnailError) {
          console.warn("Thumbnail file processing error:", thumbnailError);
          // ไม่ต้อง throw error เพื่อให้การลบหลักดำเนินต่อไปได้
        }
      }

      // ลบไฟล์หลักจาก S3 (ถ้ามี S3 configuration)
      if (ctx.isS3Ready() && fileKey) {
        try {
          await ctx.S3.send(new DeleteObjectCommand({
            Bucket: ctx.configs.s3Bucket, 
            Key: fileKey
          }));
        } catch (s3Error) {
          console.warn("S3 delete failed for main file:", s3Error);
          // อาจจะไม่ throw error ถ้าไฟล์ไม่มีอยู่ใน S3
          if (!s3Error.name?.includes('NoSuchKey') && !s3Error.name?.includes('NotFound')) {
            console.error("S3 delete error (non-404):", s3Error);
            // ยังคงดำเนินการต่อเพื่อลบจากฐานข้อมูล
          }
        }
      }
      
      // ตรวจสอบและลบไฟล์ original ถ้ามี
      if (ctx.isS3Ready() && fileData && fileData.original && fileData.original.url) {
        try {
          // ใช้ helper function เพื่อดึง key
          const originalKey = ctx.extractS3KeyFromUrl(fileData.original.url);
          
          if (originalKey) {
            try {
              await ctx.S3.send(new DeleteObjectCommand({
                Bucket: ctx.configs.s3Bucket, 
                Key: originalKey
              }));
            } catch (originalS3Error) {
              console.warn("S3 delete failed for original file:", originalS3Error);
              // ไม่ throw error เพื่อให้การลบหลักดำเนินต่อไปได้
            }
          }
        } catch (originalError) {
          console.warn("Original file processing error:", originalError);
          // ไม่ต้อง throw error เพื่อให้การลบหลักดำเนินต่อไปได้
        }
      }
      
      // ลบจาม database (แบบเงียบๆ ไม่แสดง toast)
      try {
        await ctx.deleteDocumentSilent(fileId);
      } catch (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error("Complete direct delete error:", error);
      throw error;
    }
  };

  // Select target folder for batch move operations
  ctx.selectTargetFolder = async function() {
    return new Promise((resolve) => {
      // สร้าง modal แบบง่าย ๆ สำหรับเลือกโฟลเดอร์
      const folderList = ctx.files.filter(f => f.mimetype === 'folder');
      
      if (folderList.length === 0) {
        toast({ type: 'info', message: 'ไม่มีโฟลเดอร์ให้เลือก' });
        resolve(null);
        return;
      }
      
      // ใช้ prompt แบบง่าย (ในการใช้งานจริงควรใช้ modal component)
      const folderNames = folderList.map((f, index) => `${index + 1}. ${f.name}`).join('\n');
      const selection = prompt(
        `เลือกโฟลเดอร์ปลายทาง:\n${folderNames}\n\nกรุณาใส่หมายเลข (หรือกด Cancel เพื่อยกเลิก):`
      );
      
      if (selection === null) {
        resolve(null);
        return;
      }
      
      const folderIndex = parseInt(selection) - 1;
      if (folderIndex >= 0 && folderIndex < folderList.length) {
        resolve(folderList[folderIndex].path);
      } else {
        toast({ type: 'error', message: 'หมายเลขโฟลเดอร์ไม่ถูกต้อง' });
        resolve(null);
      }
    });
  };
}
