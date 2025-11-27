// Media Processing Functions for FileManager
// Includes: Image Processing, Video Processing, and Video Streaming
import { Image } from 'image-js';
import { Upload } from '@aws-sdk/lib-storage';
import debug from '@/plugins/Logger.js';

export default function attachMediaFunctions(ctx) {
  debug.log('🎯 attachMediaFunctions called - starting media functions attachment');

  // ===========================
  // IMAGE PROCESSING FUNCTIONS
  // ===========================

  // Image compression utility function
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
          const canvasCtx = canvas.getContext('2d');
          
          // คำนวณขนาดใหม่ตามอัตราส่วน
          let { width, height } = img;
          const maxDimension = 400;
          
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
          canvasCtx.drawImage(img, 0, 0, width, height);
          
          // เริ่มจากคุณภาพสูง แล้วค่อยลดลง
          let quality = 0.9;
          let compressedString = canvas.toDataURL('image/jpeg', quality);
          let sizeKB = (compressedString.length * 0.75) / 1024;
          
          debug.log(`Initial compressed size: ${sizeKB.toFixed(2)}KB at quality ${quality}`);
          
          // ลดคุณภาพจนกว่าจะได้ขนาดที่ต้องการ
          while (sizeKB > maxSizeKB && quality > 0.1) {
            quality -= 0.1;
            compressedString = canvas.toDataURL('image/jpeg', quality);
            sizeKB = (compressedString.length * 0.75) / 1024;
            debug.log(`Compressed to: ${sizeKB.toFixed(2)}KB at quality ${quality.toFixed(1)}`);
          }
          
          debug.log(`Final compressed image: ${sizeKB.toFixed(2)}KB at quality ${quality.toFixed(1)}`);
          clearTimeout(timeout);
          resolve(compressedString);
        } catch (error) {
          debug.log('Error during image compression:', error);
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

  // Capture thumbnail from video (enhanced version)
  ctx.captureThumbnail = async function(videoUrl, id) {
    debug.log(`Starting captureThumbnail for: ${videoUrl}, id: ${id}`);
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';

      debug.log(`Video element created, loading video...`);
      await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));
      
      const canvas = document.createElement('canvas');
      
      // ใช้ขนาดต้นฉบับของวีดีโอสำหรับ capture คุณภาพสูง
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const canvasCtx = canvas.getContext('2d');

      const t = Math.min(5, isFinite(video.duration) ? video.duration / 3 : 5);
      video.currentTime = t;
      
      debug.log(`Video loaded, duration: ${video.duration}s, seeking to: ${t}s`);
      await new Promise(r => video.addEventListener('seeked', r, { once: true }));

      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // สร้าง dual thumbnails เหมือนระบบใหม่
      debug.log(`🎬 Creating dual video thumbnails (32x32 + 200x200)...`);
      
      // Import resizeCanvasToThumbnail จาก client processor
      const [smallThumbnail, largeThumbnail] = await Promise.all([
        ctx.resizeCanvasToThumbnail ? 
          ctx.resizeCanvasToThumbnail(canvas, 32, 32, 0.8) : 
          ctx.createLegacyThumbnail(canvas, 32, 32),    // fallback
        ctx.resizeCanvasToThumbnail ? 
          ctx.resizeCanvasToThumbnail(canvas, 200, 200, 0.9) : 
          ctx.createLegacyThumbnail(canvas, 200, 200)   // fallback
      ]);

      debug.log(`✅ Video dual thumbnails created - Small: ${Math.round(smallThumbnail.length * 0.75 / 1024)}KB, Large: ${Math.round(largeThumbnail.length * 0.75 / 1024)}KB`);

      // อัพโหลด large thumbnail ไป S3
      const largeThumbnailUrl = await ctx.uploadLargeThumbnailToS3(
        largeThumbnail, 
        id
      );

      // อัพเดตข้อมูลแบบรวม
      const duration = isFinite(video.duration) ? video.duration : undefined;
      await ctx.updateCombinedThumbnailData(id, {
        thumbnail: smallThumbnail,
        thumbnailUrl: largeThumbnailUrl,
        duration: duration
      });

      debug.log(`✅ Video dual thumbnail system completed for id: ${id}`);
      
      // Cleanup
      video.remove();
      
    } catch (e) {
      debug.log('Error capturing video thumbnail:', e); 
      console.error('Video thumbnail generation failed:', e);
      // ไม่ throw error เพื่อไม่ให้หยุดการอัพโหลด
    }
  };

  // Legacy thumbnail creation (fallback)
  ctx.createLegacyThumbnail = function(sourceCanvas, maxWidth, maxHeight) {
    // คำนวณขนาดใหม่แบบ aspect ratio
    const aspectRatio = sourceCanvas.width / sourceCanvas.height;
    let width = maxWidth;
    let height = maxHeight;
    
    if (aspectRatio > 1) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
    
    // สร้าง canvas ใหม่
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext('2d');
    
    // วาด canvas เก่าลงใน canvas ใหม่
    ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png', 0.8);
  };

  // Create thumbnail for any file type
  ctx.createThumbnail = async function(fileUrl, fileId, fileType) {
    debug.log(`🎯 ctx.createThumbnail called from media.js!`);
    debug.log(`Creating thumbnail for: ${fileUrl}, id: ${fileId}, type: ${fileType}`);
    
    try {
      // Auto-detect file type from URL if not provided
      if (!fileType && fileUrl) {
        const extension = fileUrl.split('.').pop().toLowerCase();
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'].includes(extension)) {
          fileType = 'video';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
          fileType = 'image';
        }
      }
      
      if (fileType === 'video' || (!fileType && (fileUrl.includes('video') || fileUrl.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp)$/i)))) {
        debug.log(`Creating video thumbnail for: ${fileUrl}`);
        
        // ใช้ client-side processing แทน captureThumbnail เก่า
        debug.log(`🎨 Using client-side video thumbnail creation for: ${fileUrl}`);
        try {
          const thumbnails = await ctx.createThumbnailsFromUrl(fileUrl);
          
          if (thumbnails) {
            // อัพโหลด large thumbnail ไป S3
            const largeThumbnailUrl = await ctx.uploadLargeThumbnailToS3(thumbnails.large, fileId);
            
            // อัพเดตข้อมูลด้วย thumbnails ทั้งสองแบบ
            await ctx.updateCombinedThumbnailData(fileId, {
              thumbnail: thumbnails.small,
              thumbnailUrl: largeThumbnailUrl
            });
            
            debug.log(`✅ Client-side video thumbnails created successfully for: ${fileUrl}`);
          } else {
            debug.log(`❌ Failed to create client-side video thumbnails, using fallback for: ${fileUrl}`);
            // Fallback ไปใช้วิธีเก่า
            await ctx.captureThumbnail(fileUrl, fileId);
          }
        } catch (error) {
          debug.log(`❌ Client-side video thumbnail creation failed, using fallback:`, error);
          // Fallback ไปใช้วิธีเก่า
          await ctx.captureThumbnail(fileUrl, fileId);
        }
      } else if (fileType === 'image' || (!fileType && (fileUrl.includes('image') || fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)))) {
        debug.log(`Creating image thumbnail for: ${fileUrl}`);
        
        // ใช้ client-side processing แทน external API
        debug.log(`🎨 Using client-side thumbnail creation for: ${fileUrl}`);
        try {
          const thumbnails = await ctx.createThumbnailsFromUrl(fileUrl);
          
          if (thumbnails) {
            // อัพโหลด large thumbnail ไป S3
            const largeThumbnailUrl = await ctx.uploadLargeThumbnailToS3(thumbnails.large, fileId);
            
            // อัพเดตข้อมูลด้วย thumbnails ทั้งสองแบบ
            await ctx.updateCombinedThumbnailData(fileId, {
              thumbnail: thumbnails.small,
              thumbnailUrl: largeThumbnailUrl
            });
            
            debug.log(`✅ Client-side thumbnails created successfully for: ${fileUrl}`);
          } else {
            debug.log(`❌ Failed to create client-side thumbnails for: ${fileUrl}`);
          }
        } catch (error) {
          debug.log(`❌ Client-side thumbnail creation failed:`, error);
        }
        
        debug.log(`Image thumbnail processing completed for: ${fileUrl.split('/').pop()}`);
      } else {
        debug.log(`Unsupported file type for thumbnail generation: ${fileType || 'unknown'}, URL: ${fileUrl}`);
      }
    } catch (error) {
      debug.log(`Error creating thumbnail:`, error);
      console.error(`Thumbnail creation failed for ${fileUrl}:`, {
        error: error.message,
        stack: error.stack,
        fileId: fileId,
        fileType: fileType
      });
      throw error;
    }
  };
  // ===========================
  // DEPRECATED: OLD EXTERNAL API FUNCTIONS
  // These functions are deprecated in favor of client-side processing
  // ===========================

  /*
  // Image processing for regular images (DEPRECATED - USES EXTERNAL API)
  ctx.processImageThumbnail = async function(imageUrl, id, size = '32x32') {
    debug.log(`⚠️ DEPRECATED: processImageThumbnail called. Use client-side processing instead.`);
    // Function body commented out to prevent external API calls
    return null;
  };
  */

  // ===========================
  // ACTIVE CLIENT-SIDE FUNCTIONS
  // ===========================

  // Thumbnail upload function  // Thumbnail upload function
  ctx.thumbnailFile = async function(file, thumbnail, duration) {
    debug.log(`Starting thumbnailFile for file: ${file}`);
    try {
      const sizeInBytes = thumbnail.length * 0.75;
      if (sizeInBytes > 800 * 1024) {
        debug.log(`Thumbnail too large: ${Math.round(sizeInBytes/1024)}KB, skipping upload`);
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
      debug.log(`API endpoint: storage/${file}`);
      debug.log(`Payload preview:`, { thumbnailPreview: thumbnail.substring(0, 50) + '...', duration });
      
      debug.log(`🔍 Checking thumbnail format: "${thumbnail.substring(0, 30)}..."`);
      if (!thumbnail.startsWith('data:image/')) {
        debug.log(`❌ Invalid thumbnail format, expected data:image/ prefix but got: "${thumbnail.substring(0, 50)}"`);
        debug.log(`❌ Full thumbnail start: "${thumbnail.substring(0, 100)}"`);
        return;
      }
      debug.log(`✅ Thumbnail format is valid`);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Thumbnail upload timeout after 30 seconds')), 30000)
      );
      
      debug.log(`🚀 Calling API: PUT storage/${file}`);
      const uploadPromise = ctx.$Request.PUT(`storage/${file}`, payload, ctx.requestKey());
      
      try {
        const response = await Promise.race([uploadPromise, timeoutPromise]);
        debug.log(`📡 API Response:`, { status: response.status, statusText: response.statusText });

        if(response.status === 200) {
          debug.log('✅ Thumbnail uploaded successfully to server');
          
          const fileInList = ctx.fileListing.find(f => f._id === file);
          if (fileInList) {
            fileInList.thumbnail = thumbnail;
            ctx.$forceUpdate();
            debug.log('✅ Thumbnail updated in local state for:', fileInList.name || fileInList.title);
          } else {
            debug.log('⚠️ File not found in fileListing for local update, ID:', file);
          }
        } else {
          debug.log('❌ Thumbnail upload failed, status:', response.status, response.statusText);
        }
      } catch (apiError) {
        debug.log(`❌ API call error for file ${file}:`, {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data
        });
        throw apiError;
      }
    } catch (error) {
      debug.log(`❌ Error uploading thumbnail for file ${file}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // ไม่ throw error เพื่อไม่ให้ระบบ crash
    }
  };

  // ===============================
  // VIDEO PROCESSING FUNCTIONS
  // ===============================

  // แปลงไฟล์วิดีโอ
  ctx.convertVideo = async function(fileData) {
    const payload = new FormData();
    payload.append('url', fileData.path); // ใช้ path ของไฟล์ที่เลือก
    payload.append('quality', ctx.selectedQuality); // ใช้ค่าจาก select
    payload.append('site', 'fti.academy'); // ใช้ค่าที่ต้องการ
    payload.append('storage', fileData._id); // ใช้ ID ของไฟล์ที่เลือก

    try {
      const response = await fetch('https://media.cloudrestfulapi.com/convert', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        throw new Error('Failed to convert video');
      }

      const result = await response.json();
      console.log('Conversion result:', result);
      
      // Show success message
      if (typeof ctx.toast === 'function') {
        ctx.toast({ 
          type: 'success', 
          message: 'การแปลงไฟล์วิดีโอเริ่มต้นแล้ว กรุณารอผลลัพธ์' 
        });
      }
      
      debug.log('Video conversion started successfully:', result);
      
    } catch (error) {
      console.error('Error converting video:', error);
      
      // Show error message
      if (typeof ctx.toast === 'function') {
        ctx.toast({ 
          type: 'error', 
          message: 'เกิดข้อผิดพลาดในการแปลงไฟล์วิดีโอ' 
        });
      }
      
      debug.log('Video conversion error:', error);
    }
  };

  // ตัดต่อไฟล์วิดีโอ (แบบเดียวกับ convertVideo ทุกประการ)
  ctx.trimVideo = async function(fileData, trimSettings = {}) {
    debug.log('🎬 Starting video trim for:', fileData.name);
    debug.log('🎯 Trim settings:', trimSettings);
    
    // สร้าง JSON payload แทน FormData
    const payload = {
      url: fileData.path, // ใช้ path ของไฟล์ที่เลือก
      site: 'fti.academy',
      storage: fileData._id, // ใช้ ID ของไฟล์ที่เลือก
      filename: trimSettings.filename || ctx.getTrimFilename(fileData.name, trimSettings)
    };
    
    // เพิ่มข้อมูลการ trim
    if (trimSettings.trimMode === 'multi' && trimSettings.segments && Array.isArray(trimSettings.segments)) {
      payload.trim_mode = 'multi';
      payload.segments = trimSettings.segments.map(seg => ({
        start: Math.round(seg.start * 100) / 100,
        end: Math.round(seg.end * 100) / 100,
        duration: Math.round(seg.duration * 100) / 100
      }));
    } else {
      payload.trim_mode = 'single';
      if (trimSettings.startTime !== undefined) payload.start_time = Math.round(trimSettings.startTime * 100) / 100;
      if (trimSettings.endTime !== undefined) payload.end_time = Math.round(trimSettings.endTime * 100) / 100;
      if (trimSettings.duration !== undefined) payload.duration = Math.round(trimSettings.duration * 100) / 100;
    }
    
    // เพิ่มการตั้งค่าอื่นๆ
    if (trimSettings.quality) payload.quality = trimSettings.quality;
    if (trimSettings.format) payload.output_format = trimSettings.format;
    if (trimSettings.audioVolume !== undefined) payload.audio_volume = trimSettings.audioVolume / 100;
    if (trimSettings.processingMode) payload.processing_mode = trimSettings.processingMode;
    
    // เพิ่ม audio filter ถ้าต้องการ
    if (trimSettings.audioVolume !== undefined && trimSettings.audioVolume !== 100) {
      payload.audio_filter = `volume=${trimSettings.audioVolume / 100}`;
    }
    
    // รวมข้อมูล text overlays
    if (trimSettings.textOverlays && Array.isArray(trimSettings.textOverlays) && trimSettings.textOverlays.length > 0) {
      payload.text_overlays = trimSettings.textOverlays.map(layer => ({
        id: layer.id,
        text: layer.text || '',
        font_family: layer.fontFamily || 'Arial',
        font_size: layer.fontSize || 24,
        color: layer.color || '#ffffff',
        position: {
          x: layer.position?.x || layer.x || 0,
          y: layer.position?.y || layer.y || 0
        },
        timing: {
          start: Math.round((layer.timing?.start || layer.start || 0) * 100) / 100,
          end: Math.round((layer.timing?.end || layer.end || 0) * 100) / 100,
          duration: Math.round((layer.timing?.duration || layer.duration || 0) * 100) / 100
        },
        style: {
          opacity: layer.style?.opacity || layer.opacity || 1,
          rotation: layer.style?.rotation || layer.rotation || 0,
          scale_x: layer.style?.scaleX || layer.scaleX || 1,
          scale_y: layer.style?.scaleY || layer.scaleY || 1,
          stroke_width: layer.style?.strokeWidth || layer.strokeWidth || 0,
          stroke_color: layer.style?.strokeColor || layer.strokeColor || '#000000',
          shadow: layer.style?.shadow || layer.shadow || false,
          bold: layer.style?.bold || layer.bold || false,
          italic: layer.style?.italic || layer.italic || false
        }
      }));
    }
    
    // รวมข้อมูล image overlays
    if (trimSettings.imageOverlays && Array.isArray(trimSettings.imageOverlays) && trimSettings.imageOverlays.length > 0) {
      payload.image_overlays = trimSettings.imageOverlays.map(layer => ({
        id: layer.id,
        image_url: layer.imageUrl || layer.url || layer.src || '',
        position: {
          x: layer.position?.x || layer.x || 0,
          y: layer.position?.y || layer.y || 0,
          width: layer.position?.width || layer.width || 100,
          height: layer.position?.height || layer.height || 100
        },
        timing: {
          start: Math.round((layer.timing?.start || layer.start || 0) * 100) / 100,
          end: Math.round((layer.timing?.end || layer.end || 0) * 100) / 100,
          duration: Math.round((layer.timing?.duration || layer.duration || 0) * 100) / 100
        },
        style: {
          opacity: layer.style?.opacity || layer.opacity || 1,
          rotation: layer.style?.rotation || layer.rotation || 0,
          scale_x: layer.style?.scaleX || layer.scaleX || 1,
          scale_y: layer.style?.scaleY || layer.scaleY || 1
        }
      }));
    }
    
    console.log('📋 Trim JSON payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://media.cloudrestfulapi.com/trim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to trim video');
      }

      const result = await response.json();
      debug.log('✅ Trim result:', result);
      
      // สร้าง task ใหม่ใน task system (เหมือน convertVideo)
      try {
        debug.log('📝 Creating trim task in task system...');
        
        // สร้าง task data แบบเดียวกับ convert แต่ใช้ type trim
        const taskData = {
          title: `Trim ${fileData.name}`,
          description: `Trimming ${fileData.name} with ${trimSettings.trimMode || 'single'} mode`,
          fileName: fileData.name,
          fileId: fileData._id,
          file_id: fileData._id,
          unit: fileData.unit || 'default',
          originalFormat: fileData.mimetype || 'video/mp4',
          targetFormat: trimSettings.format || 'mp4',
          quality: trimSettings.quality || '720p',
          priority: 'medium',
          type: 'trim', // แยกประเภท task เป็น trim
          conversionOptions: {
            trimMode: trimSettings.trimMode,
            segments: trimSettings.segments,
            startTime: trimSettings.startTime,
            endTime: trimSettings.endTime,
            duration: trimSettings.duration,
            audioVolume: trimSettings.audioVolume,
            processingMode: trimSettings.processingMode,
            textOverlays: trimSettings.textOverlays,
            imageOverlays: trimSettings.imageOverlays,
            trimJobId: result.job_id || result.id,
            filePath: fileData.path,
            fileSize: fileData.size
          }
        };
        
        // ใช้ createConversionTask เดียวกันกับ convert
        let taskResult;
        if (ctx.createConversionTask && typeof ctx.createConversionTask === 'function') {
          taskResult = await ctx.createConversionTask(taskData);
        } else {
          // Fallback ใช้ fetch ถ้าไม่มี createConversionTask
          const taskResponse = await fetch('/api/conversion_task/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
          });
          
          if (taskResponse.ok) {
            taskResult = await taskResponse.json();
          } else {
            throw new Error(`Task creation failed: ${taskResponse.status}`);
          }
        }
        
        if (taskResult && (taskResult._id || taskResult.success)) {
          debug.log('✅ Trim task created:', taskResult);
          
          // Refresh TaskManager เพื่อแสดง task ใหม่ทันที
          if (ctx.loadConversionTasks && typeof ctx.loadConversionTasks === 'function') {
            await ctx.loadConversionTasks();
            debug.log('🔄 TaskManager refreshed after creating trim task');
          }
        } else {
          debug.warn('⚠️ สร้าง trim task ไม่สำเร็จ:', taskResult);
        }
        
      } catch (taskError) {
        debug.error('❌ Failed to create trim task:', taskError);
      }
      
      // Show success message
      if (typeof ctx.toast === 'function') {
        ctx.toast({ 
          type: 'success', 
          message: `เริ่มการตัดต่อวิดีโอ "${fileData.name}" แล้ว\nตรวจสอบความคืบหน้าได้ในหน้า Task Manager` 
        });
      }
      
      debug.log('Video trim started successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Error trimming video:', error);
      
      // Show error message
      if (typeof ctx.toast === 'function') {
        ctx.toast({ 
          type: 'error', 
          message: `เกิดข้อผิดพลาดในการตัดต่อวิดีโอ: ${error.message}` 
        });
      }
      
      debug.error('Video trim error:', error);
      throw error;
    }
  };

  // Helper function: Get supported video qualities
  ctx.getSupportedQualities = function() {
    return [
      { value: '240', label: '240p' },
      { value: '360', label: '360p' },
      { value: '480', label: '480p' },
      { value: '720', label: '720p HD' },
      { value: '1080', label: '1080p Full HD' },
      { value: '1440', label: '1440p 2K' },
      { value: '2160', label: '2160p 4K' }
    ];
  };

  // Helper function: Get video file information
  ctx.getVideoInfo = function(fileData) {
    if (!fileData || !fileData.mimetype || !fileData.mimetype.startsWith('video/')) {
      return null;
    }

    return {
      id: fileData._id,
      name: fileData.name,
      path: fileData.path,
      size: fileData.size,
      mimetype: fileData.mimetype,
      duration: fileData.duration || null,
      hasStream: !!fileData.stream,
      streamStatus: fileData.stream?.streamStatus || null
    };
  };

  // Helper function: Check if file is convertible video
  ctx.isConvertibleVideo = function(fileData) {
    if (!fileData || !fileData.mimetype) {
      return false;
    }

    const convertibleFormats = [
      'video/mp4',
      'video/avi', 
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      'video/m4v',
      'video/3gp'
    ];

    return convertibleFormats.includes(fileData.mimetype.toLowerCase());
  };

  // Helper function: Check if file is trimmable video (เหมือน isConvertibleVideo)
  ctx.isTrimmableVideo = function(fileData) {
    if (!fileData || !fileData.mimetype) {
      return false;
    }

    const trimmableFormats = [
      'video/mp4',
      'video/avi', 
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      'video/m4v',
      'video/3gp',
      'video/quicktime'
    ];

    return trimmableFormats.includes(fileData.mimetype.toLowerCase());
  };

  // Helper function: Get trim-friendly filename
  ctx.getTrimFilename = function(originalName, trimSettings = {}) {
    if (!originalName) return 'trimmed_video';
    
    // ลบ extension เดิม
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    let suffix = '_trimmed';
    
    // เพิ่ม suffix ตาม trim mode
    if (trimSettings.trimMode === 'multi' && trimSettings.segments) {
      suffix = `_${trimSettings.segments.length}segments`;
    } else if (trimSettings.startTime !== undefined && trimSettings.endTime !== undefined) {
      const start = Math.round(trimSettings.startTime);
      const end = Math.round(trimSettings.endTime);
      suffix = `_${start}s-${end}s`;
    }
    
    // เพิ่ม quality ถ้ามี
    if (trimSettings.quality && trimSettings.quality !== 'original') {
      suffix += `_${trimSettings.quality}`;
    }
    
    // เพิ่ม extension
    const format = trimSettings.format || 'mp4';
    return `${baseName}${suffix}.${format}`;
  };

  // ===============================
  // VIDEO STREAMING FUNCTIONS  
  // ===============================

  // สร้าง stream สำหรับไฟล์วิดีโอ (เก่า)
  ctx.streamFile = async function(fileUrl, fileName) {
    console.log(fileUrl, fileName, ctx.selectItem);
    try {
      // Request payload
      const payload = {
        url: fileUrl,
        meta: { name: fileName }
      };

      // Send request
      const response = await fetch("https://gateway.cloudrestfulapi.com/vdo/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error("Streaming request failed.");
      }

      debug.log("Stream Response:", result);

      // Extract required data
      const { uid, thumbnail, playback, status } = result;

      // Update file database entry
      await ctx.updateFileStreamingData(ctx.selectItem, {
        streamId: uid,
        streamThumbnail: thumbnail,
        streamPlayback: playback,
        streamStatus: status,
      });

      debug.log("File updated with streaming data.");
      
      if (typeof ctx.toast === 'function') {
        ctx.toast = ctx.toast({ type: "success", message: "Streaming request successful!" });
        if (ctx.toast && typeof ctx.toast.hide === 'function') {
          setTimeout(() => ctx.toast.hide(), 3000);
        }
      }

      // Start polling for stream status updates
      ctx.pollStreamStatus(ctx.selectItem, uid);

    } catch (error) {
      console.error("Error in streaming request:", error);
      if (typeof ctx.toast === 'function') {
        ctx.toast({ type: "error", message: "Failed to start streaming." });
      }
    }
  };

  // สร้าง streaming ใหม่ด้วย API ใหม่ (แบบเดียวกับ convert)
  ctx.makeStreaming = async function(fileUrl, fileName, fileData = null) {
    console.log('🎬 Making streaming for:', fileName, fileUrl);
    
    // ถ้าไม่มี fileData ให้หาจาก fileListing
    if (!fileData && ctx.selectItem) {
      fileData = ctx.fileListing.find(f => f._id === ctx.selectItem);
    }
    
    if (!fileData) {
      console.error('❌ No file data found for streaming');
      if (typeof ctx.$toast === 'function') {
        ctx.$toast({
          type: 'error',
          message: 'ไม่พบข้อมูลไฟล์ที่ต้องการสร้าง streaming'
        });
      }
      return;
    }

    try {
      // สร้าง FormData แบบเดียวกับ convertVideo ทุกประการ
      const payload = new FormData();
      payload.append('url', fileData.path); // ใช้ path ของไฟล์ที่เลือก (เหมือน convertVideo)
      payload.append('site', 'fti.academy'); // ใช้ค่าที่ต้องการ (เหมือน convertVideo)
      payload.append('storage', fileData._id); // ใช้ ID ของไฟล์ที่เลือก (เหมือน convertVideo)

      console.log('📋 Streaming FormData payload (same as convertVideo):');
      console.log('   - URL (path):', fileData.path);
      console.log('   - Site:', 'fti.academy');
      console.log('   - Storage ID:', fileData._id);

      // ส่ง request ไป API (เปลี่ยนแค่ endpoint)
      const response = await fetch('https://media.cloudrestfulapi.com/stream-upload', {
        method: 'POST',
        body: payload, // FormData เหมือน convertVideo
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Streaming created successfully:', result);

      // แสดงข้อความสำเร็จ
      if (typeof ctx.$toast === 'function') {
        ctx.$toast({
          type: 'success',
          message: `สร้าง streaming สำหรับ ${fileName} สำเร็จแล้ว!`
        });
      }

      // อัพเดตข้อมูลในฐานข้อมูลถ้ามี fileData
      if (fileData && fileData._id && result.id) {
        await ctx.updateFileStreamingData(fileData._id, {
          streamId: result.id,
          streamUrl: result.url || result.stream_url,
          streamStatus: result.status || 'processing',
          streamThumbnail: result.thumbnail,
          streamPlayback: result.playback || result.stream_url
        });

        // รีเฟรชรายการไฟล์
        setTimeout(() => {
          ctx.listFile(ctx.prefix);
        }, 1000);
      }

      return result;

    } catch (error) {
      console.error('❌ Error creating streaming:', error);
      
      // แสดงข้อความข้อผิดพลาด
      if (typeof ctx.$toast === 'function') {
        ctx.$toast({
          type: 'error',
          message: `ไม่สามารถสร้าง streaming ได้: ${error.message}`
        });
      }
      
      throw error;
    }
  };

  // อัพเดทข้อมูล streaming ในฐานข้อมูล
  ctx.updateFileStreamingData = async function(fileId, streamData) {
    try {
      const payload = {
        data: {
          stream: {
            streamId: streamData.streamId,
            streamThumbnail: streamData.streamThumbnail,
            streamPlayback: streamData.streamPlayback,
            streamStatus: streamData.streamStatus,
          }
        },
        options: {}
      };

      const { status } = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());

      if (status === 200) {
        await ctx.listFile(ctx.prefix);
      }
    } catch (error) {
      debug.log(error);
    }
  };

  // ตรวจสอบสถานะ stream แบบ polling
  ctx.pollStreamStatus = async function(fileId, streamId, retries = 10, interval = 30000) {
    let attempts = 0;
    
    const checkStatus = async () => {
      if (attempts++ >= retries) {
        debug.log("Max retries reached for stream status check.");
        return;
      }

      try {
        const response = await fetch(`https://gateway.cloudrestfulapi.com/vdo/stream/${streamId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stream status.");
        }

        const streamData = await response.json();
        
        // Update file data
        const updatedStreamData = {
          streamId: streamData.uid,
          streamThumbnail: streamData.thumbnail,
          streamPlayback: streamData.playback,
          streamStatus: streamData.status,
        };

        await ctx.updateFileStreamingData(fileId, updatedStreamData);
        
        // Stop polling if status is ready
        if (streamData.status === 'ready') {
          await ctx.listFile(ctx.prefix);
          debug.log("Stream status updated successfully.");
          return; // Stop polling
        }
      } catch (error) {
        debug.log("Error fetching stream status:", error);
      }

      // Continue polling if status is not ready
      setTimeout(checkStatus, interval);
    };

    checkStatus();
  };

  // ลบ stream
  ctx.deleteStream = async function(streamId, fileId) {
    try {
      // Confirm deletion with user
      const confirmDelete = confirm("Are you sure you want to delete this stream?");
      if (!confirmDelete) return;

      // Send DELETE request to API
      const response = await fetch(`https://gateway.cloudrestfulapi.com/vdo/stream/${streamId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete stream.");
      }

      // Remove stream data from the database
      await ctx.removeStreamData(fileId);
      ctx.showStreamMenu = false;
      
      // Show success message
      alert("Stream deleted successfully.");

    } catch (error) {
      console.error("Error deleting stream:", error);
      alert("Failed to delete stream. Please try again.");
    }
  };

  // ลบข้อมูล stream จากฐานข้อมูล
  ctx.removeStreamData = async function(fileId) {
    try {
      const payload = {
        data: {
          stream: null, // Removing the stream data
        },
        options: {},
      };

      const { status } = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());

      if (status === 200) {
        await ctx.listFile(ctx.prefix);
        console.log("Stream data removed successfully.");
      } else {
        console.error("Failed to remove stream data.");
      }
    } catch (error) {
      console.error("Error removing stream data:", error);
    }
  };

  // ============================
  // UTILITY & DEBUG FUNCTIONS
  // ============================

  // Handle video thumbnail error
  ctx.handleVideoThumbnailError = function(file) {
    debug.log(`Video thumbnail failed to load for: ${file.name}`);
    debug.log(`Thumbnail data preview:`, file.thumbnail ? file.thumbnail.substring(0, 100) + '...' : 'null');
    
    // เพิ่ม file ลงใน error set
    ctx.imageLoadErrors.add(file.name);
    
    // บังคับ re-render
    ctx.$forceUpdate();
    
    // ลองสร้าง thumbnail ใหม่
    if (file.path && file._id) {
      debug.log(`Attempting to regenerate thumbnail for: ${file.name}`);
      ctx.captureThumbnail(ctx.configs.s3Endpoint + file.path, file._id)
        .then(() => {
          debug.log(`Thumbnail regenerated successfully for: ${file.name}`);
          // รอ 1 วินาทีแล้ว refresh รายการ
          setTimeout(() => {
            ctx.listFile(ctx.prefix);
          }, 1000);
        })
        .catch((error) => {
          debug.log(`Failed to regenerate thumbnail for: ${file.name}`, error);
        });
    }
  };

  // Debug function สำหรับตรวจสอบ video thumbnails
  ctx.debugVideoThumbnails = function() {
    console.log('🔍 Video Thumbnail Debug:');
    
    const videoFiles = ctx.fileListing.filter(f => f.type === 'media');
    console.log(`Found ${videoFiles.length} video files:`);
    
    videoFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   - ID: ${file._id}`);
      console.log(`   - Has thumbnail: ${!!file.thumbnail}`);
      
      if (file.thumbnail) {
        console.log(`   - Thumbnail size: ${Math.round(file.thumbnail.length * 0.75 / 1024)}KB`);
        console.log(`   - Thumbnail format: ${file.thumbnail.substring(0, 30)}...`);
        console.log(`   - Is valid base64: ${file.thumbnail.startsWith('data:image/')}`);
        
        // ทดสอบการโหลด thumbnail
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`   ✅ Thumbnail loads successfully (${testImg.width}x${testImg.height})`);
        };
        testImg.onerror = (e) => {
          console.log(`   ❌ Thumbnail failed to load:`, e);
        };
        testImg.src = file.thumbnail;
      } else {
        console.log(`   ❌ No thumbnail data`);
      }
      console.log('   ---');
    });
    
    return videoFiles;
  };

  // Debug function สำหรับตรวจสอบเงื่อนไขการแสดง thumbnail
  ctx.debugVideoThumbnailCondition = function(file) {
    if (file.type === 'media') {
      console.log(`🎬 ${file.name} thumbnail check:`, {
        hasThumbnail: !!file.thumbnail,
        thumbnailLength: file.thumbnail ? file.thumbnail.length : 0,
        thumbnailLengthCheck: file.thumbnail ? file.thumbnail.length > 100 : false,
        thumbnailStart: file.thumbnail ? file.thumbnail.substring(0, 50) : 'none',
        conditionResult: !!(file.thumbnail && file.thumbnail.length > 100)
      });
    }
    return ''; // คืนค่าเปล่าเพื่อไม่ให้แสดงใน template
  };

  // Debug function to test thumbnail functionality
  ctx.testThumbnailGeneration = function() {
    debug.log('Testing thumbnail generation capabilities...');
    
    // Test canvas
    try {
      const canvas = document.createElement('canvas');
      canvas.getContext('2d');
      debug.log('✅ Canvas API available');
    } catch (e) {
      debug.log('❌ Canvas API not available:', e);
    }
    
    // Test video element
    try {
      document.createElement('video');
      debug.log('✅ Video element available');
    } catch (e) {
      debug.log('❌ Video element not available:', e);
    }
    
    debug.log('Thumbnail generation test completed');
  };

  // Generate a fallback video thumbnail (icon-based)
  ctx.generateFallbackVideoThumbnail = function() {
    debug.log('Generating fallback video thumbnail...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const canvasCtx = canvas.getContext('2d');
    
    // สีพื้นหลัง
    canvasCtx.fillStyle = '#2D3748';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // วาดสัญลักษณ์ play
    canvasCtx.fillStyle = '#E2E8F0';
    canvasCtx.beginPath();
    canvasCtx.moveTo(canvas.width/2 - 30, canvas.height/2 - 40);
    canvasCtx.lineTo(canvas.width/2 + 30, canvas.height/2);
    canvasCtx.lineTo(canvas.width/2 - 30, canvas.height/2 + 40);
    canvasCtx.closePath();
    canvasCtx.fill();
    
    // เพิ่มข้อความ
    canvasCtx.fillStyle = '#A0AEC0';
    canvasCtx.font = '16px Arial';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText('Video', canvas.width/2, canvas.height/2 + 70);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Batch thumbnail generation
  ctx.generateBatchThumbnails = async function(files) {
    debug.log(`Starting batch thumbnail generation for ${files.length} files`);
    
    for (const file of files) {
      try {
        if (file.type && file.type.startsWith('video/') && file.url) {
          debug.log(`Processing video thumbnail for: ${file.name}`);
          await ctx.captureThumbnail(file.url, file._id);
        } else if (file.type && file.type.startsWith('image/') && file.url) {
          debug.log(`Processing image thumbnail for: ${file.name}`);
          const thumbnail = await ctx.processImageThumbnail(file.url, file._id);
          await ctx.thumbnailFile(file._id, thumbnail);
        }
      } catch (error) {
        debug.log(`Error processing thumbnail for ${file.name}:`, error);
        // Continue with next file
      }
    }
    
    debug.log('Batch thumbnail generation completed');
  };

  // Poll conversion status (placeholder for future implementation)
  ctx.pollConversionStatus = async function(conversionId) {
    // This function could be implemented in the future to check conversion progress
    // Similar to pollStreamStatus but for video conversion
    debug.log('Conversion status polling not yet implemented for:', conversionId);
  };

  // ตรวจสอบและอัพเดตความคืบหน้าของ trim tasks
  ctx.pollTrimStatus = async function(streamId, taskId, quality = '720p') {
    try {
      debug.log(`🔍 Checking trim progress for stream: ${streamId}, quality: ${quality}`);
      console.log(`🔍 [DEBUG] pollTrimStatus called - streamId: ${streamId}, taskId: ${taskId}, quality: ${quality}`);
      
      // เรียก API เพื่อดึงข้อมูล progress
      const response = await fetch(`https://gateway.cloudrestfulapi.com/vdo/stream/${streamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        debug.log(`❌ Failed to fetch trim status: ${response.status}`);
        console.log(`❌ [DEBUG] API call failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const streamData = await response.json();
      debug.log(`📊 Stream data received:`, streamData);
      console.log(`📊 [DEBUG] Full stream data:`, JSON.stringify(streamData, null, 2));

      // ดึงความคืบหน้าจาก trim_720p
      const trimProgressKey = `trim_${quality}`;
      const progressValue = streamData.transcode?.[trimProgressKey];
      
      debug.log(`🎯 Looking for progress in: ${trimProgressKey}`);
      debug.log(`📈 Progress found: ${progressValue}`);
      console.log(`🎯 [DEBUG] Looking for key: ${trimProgressKey}`);
      console.log(`📈 [DEBUG] Progress value: ${progressValue} (type: ${typeof progressValue})`);
      console.log(`🔧 [DEBUG] Transcode object:`, streamData.transcode);

      // ตรวจสอบว่า progress เป็นตัวเลข (%) หรือ URL (เสร็จแล้ว)
      let progressPercent = 0;
      let isCompleted = false;
      let outputUrl = null;

      if (progressValue !== undefined && progressValue !== null) {
        if (typeof progressValue === 'number') {
          // เป็นตัวเลข = progress percentage
          progressPercent = progressValue;
          isCompleted = progressValue >= 100;
          console.log(`� [DEBUG] Numeric progress: ${progressPercent}%`);
        } else if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
          // เป็น URL = task เสร็จแล้ว
          progressPercent = 100;
          isCompleted = true;
          outputUrl = progressValue;
          console.log(`✅ [DEBUG] Completed with URL: ${outputUrl}`);
        } else if (typeof progressValue === 'string' && !isNaN(progressValue)) {
          // เป็น string ที่เป็นตัวเลข
          progressPercent = parseInt(progressValue);
          isCompleted = progressPercent >= 100;
          console.log(`📊 [DEBUG] String numeric progress: ${progressPercent}%`);
        } else {
          console.log(`⚠️ [DEBUG] Unknown progress value type: ${typeof progressValue}, value: ${progressValue}`);
        }
      } else {
        console.log(`⚠️ [DEBUG] No progress value found for key: ${trimProgressKey}`);
      }

      // อัพเดต task progress ถ้าพบข้อมูล
      if (taskId && (progressPercent > 0 || isCompleted)) {
        console.log(`🔄 [DEBUG] Updating task ${taskId} with progress: ${progressPercent}%, completed: ${isCompleted}`);
        
        const updateData = {
          data: {
            progress: progressPercent,
            status: isCompleted ? 'completed' : 'processing',
            ...(isCompleted && { completedAt: new Date() }),
            ...(outputUrl && { outputPath: outputUrl })
          }
        };
        
        const updateResult = await ctx.updateTask(taskId, updateData);
        
        debug.log(`✅ Task ${taskId} progress updated: ${progressPercent}% (${isCompleted ? 'completed' : 'processing'})`);
        console.log(`✅ [DEBUG] Task update result:`, updateResult);
      } else {
        console.log(`⚠️ [DEBUG] No update - progress: ${progressPercent}, taskId: ${taskId}, progressValue: ${progressValue}`);
      }

      return {
        progress: progressPercent,
        streamId: streamId,
        status: isCompleted ? 'completed' : 'processing',
        isCompleted: isCompleted,
        outputUrl: outputUrl,
        transcode: streamData.transcode
      };

    } catch (error) {
      debug.log(`❌ Error polling trim status:`, error);
      console.error(`❌ [DEBUG] pollTrimStatus error:`, error);
      return null;
    }
  };

  // ตรวจสอบและอัพเดตความคืบหน้าของ conversion tasks (ปกติ)
  ctx.pollConversionProgress = async function(streamId, taskId, quality = '720p') {
    try {
      debug.log(`🔍 Checking conversion progress for stream: ${streamId}, quality: ${quality}`);
      
      // เรียก API เพื่อดึงข้อมูล progress
      const response = await fetch(`https://gateway.cloudrestfulapi.com/vdo/stream/${streamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        debug.log(`❌ Failed to fetch conversion status: ${response.status}`);
        return null;
      }

      const streamData = await response.json();
      debug.log(`📊 Stream data received:`, streamData);

      // ดึงความคืบหน้าจาก 720p (ไม่มี prefix)
      const progress = streamData.transcode?.[quality];
      
      debug.log(`🎯 Looking for progress in: ${quality}`);
      debug.log(`📈 Progress found: ${progress}%`);

      // อัพเดต task progress ถ้าพบข้อมูล
      if (progress !== undefined && taskId) {
        await ctx.updateTask(taskId, {
          data: {
            progress: parseInt(progress),
            // อัพเดต status ตาม progress
            status: progress >= 100 ? 'completed' : 'processing',
            ...(progress >= 100 && { completedAt: new Date() })
          }
        });
        
        debug.log(`✅ Task ${taskId} progress updated: ${progress}%`);
      }

      return {
        progress: progress || 0,
        streamId: streamId,
        status: progress >= 100 ? 'completed' : 'processing',
        transcode: streamData.transcode
      };

    } catch (error) {
      debug.log(`❌ Error polling conversion progress:`, error);
      return null;
    }
  };

  // Helper function: ดึงข้อมูล stream จากไฟล์
  ctx.getFileStreamInfo = async function(fileId) {
    try {
      console.log(`📂 [DEBUG] Getting file stream info for: ${fileId}`);
      
      const response = await ctx.$Request.GET(`storage/${fileId}`, ctx.requestKey());
      
      if (response.status === 200 && response.data) {
        console.log(`✅ [DEBUG] File info retrieved:`, {
          _id: response.data._id,
          hasTranscode: !!response.data.transcode,
          transcodeKeys: response.data.transcode ? Object.keys(response.data.transcode) : []
        });
        return response.data;
      } else {
        console.log(`❌ [DEBUG] Failed to get file info: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [DEBUG] Error getting file stream info:`, error);
      return null;
    }
  };

  // ฟังก์ชันรวมสำหรับตรวจสอบ progress ทั้ง trim และ conversion
  ctx.pollTaskProgress = async function(task) {
    try {
      console.log(`🚀 [DEBUG] pollTaskProgress called for task:`, task._id, task.type);
      
      if (!task || !task.metadata) {
        debug.log('❌ Invalid task data for progress polling');
        console.log('❌ [DEBUG] Invalid task data:', { 
          hasTask: !!task, 
          hasMetadata: !!task?.metadata
        });
        return null;
      }

      const { metadata } = task;
      
      // หา streamId จากแหล่งต่างๆ
      let streamId = null;
      let quality = '720p';
      
      if (metadata.conversionOptions) {
        // สำหรับ trim tasks
        streamId = metadata.conversionOptions.trimJobId || 
                  metadata.conversionOptions.jobId || 
                  metadata.conversionOptions.streamId ||
                  metadata.conversionOptions.conversionId;
        quality = metadata.conversionOptions.quality || metadata.quality || '720p';
      }
      
      // ถ้ายังไม่เจอ streamId ให้ใช้ file_id เป็น fallback
      if (!streamId && task.file_id) {
        // ดึงข้อมูลไฟล์เพื่อหา stream ID
        const fileInfo = task.fileInfo || await ctx.getFileStreamInfo(task.file_id);
        if (fileInfo && fileInfo.transcode && fileInfo.transcode.stream) {
          streamId = fileInfo.transcode.stream;
          console.log(`� [DEBUG] Found streamId from file info: ${streamId}`);
        }
      }
      
      console.log(`�🔍 [DEBUG] Task details:`, {
        type: task.type,
        streamId: streamId,
        quality: quality,
        file_id: task.file_id,
        metadata: metadata
      });
      
      if (!streamId) {
        debug.log('❌ No stream ID found for progress polling');
        console.log('❌ [DEBUG] No streamId found - trying file-based progress check');
        
        // ตรวจสอบ progress จากไฟล์โดยตรง
        if (task.file_id) {
          const fileInfo = task.fileInfo || await ctx.getFileStreamInfo(task.file_id);
          if (fileInfo && fileInfo.transcode) {
            console.log(`📊 [DEBUG] File transcode data:`, fileInfo.transcode);
            
            if (task.type === 'trim') {
              const trimKey = `trim_${quality}`;
              const progressValue = fileInfo.transcode[trimKey];
              
              console.log(`🎯 [DEBUG] Checking ${trimKey}: ${progressValue} (${typeof progressValue})`);
              
              if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
                // เสร็จแล้ว - มี URL
                console.log(`✅ [DEBUG] Trim completed with URL: ${progressValue}`);
                
                await ctx.updateTask(task._id, {
                  data: {
                    progress: 100,
                    status: 'completed',
                    completedAt: new Date(),
                    outputPath: progressValue
                  }
                });
                
                return { progress: 100, status: 'completed', outputUrl: progressValue };
              } else if (typeof progressValue === 'number') {
                console.log(`📊 [DEBUG] Trim progress: ${progressValue}%`);
                return { progress: progressValue, status: 'processing' };
              }
            } else if (task.type === 'conversion') {
              const progressValue = fileInfo.transcode[quality];
              
              console.log(`🔄 [DEBUG] Checking ${quality}: ${progressValue} (${typeof progressValue})`);
              
              if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
                // เสร็จแล้ว - มี URL
                console.log(`✅ [DEBUG] Conversion completed with URL: ${progressValue}`);
                
                await ctx.updateTask(task._id, {
                  data: {
                    progress: 100,
                    status: 'completed',
                    completedAt: new Date(),
                    outputPath: progressValue
                  }
                });
                
                return { progress: 100, status: 'completed', outputUrl: progressValue };
              } else if (typeof progressValue === 'number') {
                console.log(`📊 [DEBUG] Conversion progress: ${progressValue}%`);
                return { progress: progressValue, status: 'processing' };
              }
            }
          }
        }
        
        return null;
      }

      // เลือกฟังก์ชันตาม task type
      if (task.type === 'trim') {
        console.log(`✂️ [DEBUG] Calling pollTrimStatus for trim task`);
        return await ctx.pollTrimStatus(streamId, task._id, quality);
      } else if (task.type === 'conversion') {
        console.log(`🔄 [DEBUG] Calling pollConversionProgress for conversion task`);
        return await ctx.pollConversionProgress(streamId, task._id, quality);
      }

      debug.log(`⚠️ Unknown task type: ${task.type}`);
      console.log(`⚠️ [DEBUG] Unknown task type: ${task.type}`);
      return null;

    } catch (error) {
      debug.log(`❌ Error in pollTaskProgress:`, error);
      console.error(`❌ [DEBUG] pollTaskProgress error:`, error);
      return null;
    }
  };

  /*
  // DEPRECATED: Large thumbnail processing using external API
  ctx.processLargeThumbnail = async function(imageUrl, fileId) {
    debug.log(`⚠️ DEPRECATED: processLargeThumbnail called. Use client-side processing instead.`);
    // Function body commented out to prevent external API calls
    return null;
  };
  */

  // อัพโหลด thumbnail ไป S3 ด้วย AWS SDK v3
  ctx.uploadThumbnailToS3 = async function(blob, fileId) {
    debug.log(`Starting S3 upload for file: ${fileId}`);
    
    try {
      // สร้างชื่อไฟล์สำหรับ thumbnail
      const fileName = `thumbnail_${fileId}_200x200.png`;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const s3Key = `${year}/${month}/thumbnails/${fileName}`;
      
      debug.log(`S3 key: ${s3Key}`);
      
      // ใช้ Upload class ที่ import ไว้แล้ว
      
      // อัพโหลดด้วย AWS SDK v3 Upload class
      const upload = new Upload({
        client: ctx.S3,
        params: {
          Bucket: ctx.configs.s3Bucket,
          Key: s3Key,
          Body: blob,
          ContentType: 'image/png',
          ACL: 'public-read'
        }
      });
      
      debug.log(`Uploading to S3 bucket: ${ctx.configs.s3Bucket}`);
      
      await upload.done();
      const s3Url = `${ctx.configs.s3Endpoint}${s3Key}`;
      debug.log(`S3 upload completed: ${s3Url}`);
      
      return s3Url;
      
    } catch (error) {
      debug.log('Error uploading thumbnail to S3:', error);
      throw error;
    }
  };

  // อัพเดต thumbnail และ thumbnailUrl ครั้งเดียว
  ctx.updateCombinedThumbnailData = async function(fileId, updateData) {
    debug.log(`Updating combined thumbnail data for file: ${fileId}`);
    debug.log(`Update data:`, updateData);
    
    try {
      const payload = {
        data: updateData
      };
      
      debug.log(`🚀 Calling API: PUT storage/${fileId} with combined data`);
      const response = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());
      
      if (response.status === 200) {
        debug.log(`✅ Combined thumbnail data updated successfully in database`);
        
        // อัพเดตใน local state ด้วย
        const fileInList = ctx.fileListing.find(f => f._id === fileId);
        if (fileInList) {
          if (updateData.thumbnail) {
            fileInList.thumbnail = updateData.thumbnail;
            debug.log(`✅ Small thumbnail updated in local state`);
          }
          if (updateData.thumbnailUrl) {
            fileInList.thumbnailUrl = updateData.thumbnailUrl;
            debug.log(`✅ ThumbnailUrl updated in local state`);
          }
          ctx.$forceUpdate();
          debug.log(`✅ Local state updated for: ${fileInList.name}`);
        }
      } else {
        throw new Error(`Failed to update combined thumbnail data: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      debug.log('Error updating combined thumbnail data:', error);
      throw error;
    }
  };

  // อัพเดต thumbnailUrl ในฐานข้อมูล (ใช้สำหรับกรณีเดียว)
  ctx.updateThumbnailUrl = async function(fileId, thumbnailUrl) {
    debug.log(`Updating thumbnailUrl for file: ${fileId}`);
    
    try {
      const payload = {
        data: {
          thumbnailUrl: thumbnailUrl
        }
      };
      
      debug.log(`🚀 Calling API: PUT storage/${fileId} with thumbnailUrl`);
      const response = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());
      
      if (response.status === 200) {
        debug.log(`✅ ThumbnailUrl updated successfully in database`);
        
        // อัพเดตใน local state ด้วย
        const fileInList = ctx.fileListing.find(f => f._id === fileId);
        if (fileInList) {
          fileInList.thumbnailUrl = thumbnailUrl;
          ctx.$forceUpdate();
          debug.log(`✅ ThumbnailUrl updated in local state for: ${fileInList.name}`);
        }
      } else {
        throw new Error(`Failed to update thumbnailUrl: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      debug.log('Error updating thumbnailUrl:', error);
      throw error;
    }
  };

  // Fallback thumbnail creation (ใช้เมื่อไม่มี preprocessed thumbnails)
  ctx.createThumbnailFallback = async function(fileUrl, fileId) {
    debug.log(`🔄 Using fallback thumbnail creation for: ${fileUrl}`);
    
    try {
      // ใช้วิธีเก่าผ่าน external API
      await ctx.createThumbnail(fileUrl, fileId, 'image');
    } catch (error) {
      debug.log(`❌ Fallback thumbnail creation failed:`, error);
    }
  };

  // ===========================
  // TASK MANAGEMENT FUNCTIONS
  // ===========================

  // Task Management Functions for conversion tasks
  ctx.getTasks = async function(filters = {}, options = {}) {
    try {
      console.log('📋 getTasks called with filters:', filters);
      console.log('🔍 ctx.$Request available:', typeof ctx.$Request);
      console.log('🔍 ctx.requestKey available:', typeof ctx.requestKey);
      
      const response = await ctx.$Request.POST('task/query', {
        method: 'find',
        args: [filters],
        options: { 
          sort: { createdAt: -1 }, 
          limit: 50,
          ...options
        }
      }, ctx.requestKey());
      
      console.log('✅ Tasks loaded:', response.data?.length || 0, 'tasks');
      return response.data || [];
      
    } catch (error) {
      console.error('❌ Failed to get tasks:', error);
      return [];
    }
  };

  ctx.getConversionTasks = async function(filters = {}) {
    try {
      console.log('📋 getConversionTasks called with filters:', filters);
      console.log('🔍 ctx.$Request available:', typeof ctx.$Request);
      console.log('🔍 ctx.requestKey available:', typeof ctx.requestKey);
      
      // สร้าง base match condition รองรับทั้ง conversion และ trim
      const baseMatch = {
        type: { $in: ['conversion', 'trim'] }, // รองรับทั้ง conversion และ trim
        category: 'media'
      };
      
      // ถ้าไม่มี filter เฉพาะเจาะจง ให้ดึงเฉพาะที่ยังไม่ complete
      if (!filters.status && Object.keys(filters).length === 0) {
        baseMatch.status = { $ne: 'completed' };
      }
      
      // รวม filter ที่ส่งมา
      const matchCondition = { ...baseMatch, ...filters };
      
      console.log('🔍 Final match condition:', matchCondition);
      
      // สร้าง aggregation pipeline เพื่อ join task กับ storage
      const pipeline = [
        // Match conversion tasks
        {
          $match: matchCondition
        },
        // เพิ่ม field สำหรับแปลง file_id เป็น ObjectId
        {
          $addFields: {
            file_objectId: {
              $toObjectId: "$file_id"
            }
          }
        },
        // Lookup เพื่อ join กับ storage collection โดยใช้ ObjectId
        {
          $lookup: {
            from: 'storage',
            localField: 'file_objectId',
            foreignField: '_id',
            as: 'fileInfo'
          }
        },
        // Unwind fileInfo array (เนื่องจาก lookup จะให้ array)
        {
          $unwind: {
            path: '$fileInfo',
            preserveNullAndEmptyArrays: true // เก็บ task ที่ไม่มี file info ด้วย
          }
        },
        // ลบ field ชั่วคราวที่ไม่ต้องการ
        {
          $unset: 'file_objectId'
        },
        // Sort by creation date (newest first)
        {
          $sort: { createdAt: -1 }
        },
        // Limit results
        {
          $limit: 50
        }
      ];

      console.log('🔍 Aggregation pipeline:', JSON.stringify(pipeline, null, 2));

      const response = await ctx.$Request.POST('task/aggregate', {
        pipeline: pipeline
      }, ctx.requestKey());
      
      console.log('✅ Conversion tasks with file info loaded:', response.data?.length || 0, 'tasks');
      
      // Log sample result structure for debugging
      if (response.data && response.data.length > 0) {
        console.log('📋 Sample task structure:', {
          _id: response.data[0]._id,
          title: response.data[0].title,
          fileInfo: response.data[0].fileInfo ? {
            _id: response.data[0].fileInfo._id,
            name: response.data[0].fileInfo.name,
            path: response.data[0].fileInfo.path
          } : 'No file info'
        });
      }
      
      return response.data || [];
      
    } catch (error) {
      console.error('❌ Failed to get conversion tasks with aggregation:', error);
      return [];
    }
  };

  ctx.getTasksByType = async function(type, category = null, additionalFilters = {}) {
    try {
      const filters = {
        type,
        ...(category && { category }),
        ...additionalFilters
      };
      
      return await ctx.getTasks(filters);
      
    } catch (error) {
      console.error(`❌ Failed to get ${type} tasks:`, error);
      return [];
    }
  };

  ctx.createConversionTask = async function(taskData) {
    try {
      console.log('📋 Creating task...', taskData);
      
      // เตรียมข้อมูล task - Generic task structure
      const task = {
        type: taskData.type || 'conversion', // ใช้ type จาก taskData หรือ default เป็น conversion
        category: 'media', // หมวดหมู่ของ task
        unit: taskData.unit, // เพิ่ม unit ที่ root level
        file_id: taskData.file_id, // เพิ่ม file_id ที่ root level
        title: taskData.title || `แปลงไฟล์ ${taskData.fileName}`,
        description: taskData.description || `แปลงไฟล์วิดีโอ ${taskData.fileName} เป็น ${taskData.quality}`,
        status: 'processing',
        progress: 0,
        metadata: {
          fileId: taskData.fileId,
          file_id: taskData.file_id, // เพิ่ม file_id ใน metadata ด้วย
          unit: taskData.unit, // เพิ่ม unit ใน metadata ด้วย
          fileName: taskData.fileName,
          originalFormat: taskData.originalFormat,
          targetFormat: taskData.targetFormat || 'mp4',
          quality: taskData.quality,
          // เพิ่มข้อมูลเพิ่มเติมสำหรับ conversion
          conversionOptions: taskData.conversionOptions || {},
          estimatedDuration: taskData.estimatedDuration,
          originalFileSize: taskData.originalFileSize
        },
        // ข้อมูลการติดตาม
        startedAt: new Date(),
        createdBy: taskData.userId || 'system',
        // ข้อมูลเพิ่มเติม
        tags: ['video', 'conversion', taskData.quality].filter(Boolean),
        priority: taskData.priority || 'normal'
      };

      // Wrap ข้อมูลด้วย data object
      const payload = {
        data: task
      };

      const response = await ctx.$Request.POST('task', payload, ctx.requestKey());
      
      console.log('✅ Conversion task created:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Failed to create conversion task:', error);
      throw error;
    }
  };

  ctx.updateTask = async function(taskId, updates) {
    try {
      console.log(`📋 Updating task ${taskId}...`, updates);
      
      const response = await ctx.$Request.PUT(`task/${taskId}`, updates, ctx.requestKey());
      
      console.log('✅ Task updated:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      throw error;
    }
  };

  ctx.deleteTask = async function(taskId) {
    try {
      console.log(`🗑️ Deleting task ${taskId}...`);
      
      const response = await ctx.$Request.DELETE(`task/${taskId}`, {}, ctx.requestKey());
      
      console.log('✅ Task deleted:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw error;
    }
  };

  ctx.clearAllTasks = async function(specificTaskIds = null) {
    try {
      console.log('🧹 Simple clear tasks approach - mark 100% tasks as complete');
      
      // ถ้าส่ง taskIds มา = ต้องการลบงานที่ 100% แล้ว
      if (specificTaskIds && Array.isArray(specificTaskIds) && specificTaskIds.length > 0) {
        console.log('🎯 Deleting completed tasks:', specificTaskIds);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const taskId of specificTaskIds) {
          try {
            console.log(`�️ Deleting task ${taskId}...`);
            const response = await ctx.$Request.DELETE(`task/${taskId}`, {}, ctx.requestKey());
            console.log(`📋 Delete response:`, response.status, response.statusText);
            
            if (response.status === 200 || response.status === 204) {
              successCount++;
              console.log(`✅ Task ${taskId} deleted`);
            } else {
              errorCount++;
              console.error(`❌ Delete failed:`, response.status);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Delete error for ${taskId}:`, error.message);
          }
        }
        
        return { success: true, updated: successCount, errors: errorCount };
      }
      
      // ถ้าไม่ส่ง taskIds = เปลี่ยนงานที่ 100% ให้เป็น complete
      console.log('🔄 Marking 100% tasks as complete...');
      const tasks = await ctx.getConversionTasks();
      
      if (!tasks || tasks.length === 0) {
        console.log('ℹ️ No tasks found');
        return { success: true, updated: 0, errors: 0 };
      }
      
      // หา task ที่ 100% แล้วแต่ยัง status ไม่ใช่ completed
      const tasksToComplete = tasks.filter(task => {
        const progress = Math.round(task.progress || 0);
        const notCompleted = task.status !== 'completed';
        console.log(`Task ${task._id}: progress=${progress}%, status=${task.status}, needsUpdate=${progress === 100 && notCompleted}`);
        return progress === 100 && notCompleted;
      });
      
      if (tasksToComplete.length === 0) {
        console.log('ℹ️ No 100% tasks to mark as complete');
        return { success: true, updated: 0, errors: 0 };
      }
      
      console.log(`🎯 Found ${tasksToComplete.length} tasks at 100% to mark as complete`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const task of tasksToComplete) {
        try {
          console.log(`✏️ Marking task ${task._id} as completed...`);
          const response = await ctx.$Request.PUT(`task/${task._id}`, {
            data: {
              status: 'completed',
              progress: 100,
              completedAt: new Date()
            }
          }, ctx.requestKey());
          
          if (response.status === 200) {
            successCount++;
            console.log(`✅ Task ${task._id} marked as completed`);
          } else {
            errorCount++;
            console.error(`❌ Update failed:`, response.status);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Update error for ${task._id}:`, error.message);
        }
      }
      
      return { success: true, updated: successCount, errors: errorCount };
      
    } catch (error) {
      console.error('❌ Clear tasks error:', error);
      throw error;
    }
  };

  // Task functions attached successfully
  console.log('✅ Task functions attached to context:');
  console.log('  - getTasks:', typeof ctx.getTasks);
  console.log('  - getConversionTasks:', typeof ctx.getConversionTasks);
  console.log('  - getTasksByType:', typeof ctx.getTasksByType);
  console.log('  - createConversionTask:', typeof ctx.createConversionTask);
  console.log('  - updateTask:', typeof ctx.updateTask);
  console.log('  - deleteTask:', typeof ctx.deleteTask);

  debug.log('🎨 Media functions (image, video, streaming, trimming) attached successfully');
  debug.log('🎯 Client-side image processing enabled - NO external API calls');
  debug.log('🎯 ctx.createThumbnail function attached:', typeof ctx.createThumbnail);
  debug.log('🎬 Video conversion function attached:', typeof ctx.convertVideo);
  debug.log('✂️ Video trimming function attached:', typeof ctx.trimVideo);
  debug.log('🔍 Video trim helper functions:');
  debug.log('  - isTrimmableVideo:', typeof ctx.isTrimmableVideo);
  debug.log('  - getTrimFilename:', typeof ctx.getTrimFilename);
}
