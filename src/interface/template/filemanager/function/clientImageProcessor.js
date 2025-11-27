// Client-side Image Processing for FileManager
// ใช้ Canvas API และ built-in browser features แทน external API
import debug from '@/plugins/Logger.js';

export default function attachClientImageProcessor(ctx) {
  // สร้าง canvas สำหรับ image processing
  ctx.createCanvas = function(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  // อ่านไฟล์เป็น Image object
  ctx.loadImageFromFile = function(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up memory
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      
      img.src = url;
    });
  };

  // อ่านรูปภาพจาก URL (สำหรับไฟล์ที่อัพโหลดแล้ว)
  ctx.loadImageFromUrl = function(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // เพิ่ม CORS handling
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image from URL: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  };

  // สร้าง thumbnails จาก URL (สำหรับไฟล์ที่อัพโหลดแล้ว)
  ctx.createThumbnailsFromUrl = async function(fileUrl) {
    try {
      // ตรวจสอบประเภทไฟล์จาก URL
      const extension = fileUrl.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        return await ctx.processImageUrl(fileUrl);
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'].includes(extension)) {
        return await ctx.processVideoUrl(fileUrl);
      } else {
        return null;
      }

    } catch (error) {
      console.error(`Thumbnail creation failed for URL ${fileUrl}:`, error);
      return null;
    }
  };

  // ประมวลผล image URL
  ctx.processImageUrl = async function(imageUrl) {
    // โหลดรูปภาพจาก URL
    const img = await ctx.loadImageFromUrl(imageUrl);

    // สร้าง thumbnails ทั้งสองขนาด
    const [smallThumbnail, largeThumbnail] = await Promise.all([
      ctx.resizeImageToThumbnail(img, 32, 32, 0.8),    // Small: 32x32, quality 0.8
      ctx.resizeImageToThumbnail(img, 200, 200, 0.9)   // Large: 200x200, quality 0.9
    ]);

    return {
      small: smallThumbnail,   // base64 for DB
      large: largeThumbnail,   // base64 for S3 upload
      original: {
        width: img.width,
        height: img.height
      }
    };
  };

  // ประมวลผล video URL
  ctx.processVideoUrl = async function(videoUrl) {
    // สร้าง video element
    const video = document.createElement('video');
    
    try {
      // โหลดวีดีโอจาก URL
      const videoData = await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        });
        
        video.addEventListener('error', (e) => {
          reject(new Error(`Failed to load video from URL: ${e.message}`));
        });
        
        video.crossOrigin = 'anonymous';
        video.src = videoUrl;
        video.load();
      });

      // Capture frame ที่ 1 วินาที หรือ 10% ของวีดีโอ
      const captureTime = Math.min(1, videoData.duration * 0.1);
      video.currentTime = captureTime;
      
      // รอให้ video seek เสร็จ
      await new Promise((resolve) => {
        video.addEventListener('seeked', resolve, { once: true });
      });

      // สร้าง canvas และ capture frame
      const canvas = ctx.createCanvas(videoData.width, videoData.height);
      const ctx2d = canvas.getContext('2d');
      ctx2d.drawImage(video, 0, 0);
      
      // สร้าง thumbnails ทั้งสองขนาด
      const [smallThumbnail, largeThumbnail] = await Promise.all([
        ctx.resizeCanvasToThumbnail(canvas, 32, 32, 0.8),    // Small: 32x32
        ctx.resizeCanvasToThumbnail(canvas, 200, 200, 0.9)   // Large: 200x200
      ]);

      return {
        small: smallThumbnail,   // base64 for DB
        large: largeThumbnail,   // base64 for S3 upload
        original: {
          width: videoData.width,
          height: videoData.height,
          duration: videoData.duration
        }
      };

    } finally {
      // Clean up
      video.remove();
    }
  };

  // สร้าง thumbnails จาก file object (รองรับทั้งรูปและวีดีโอ)
  ctx.createThumbnailsFromFile = async function(file) {
    try {
      if (file.type.startsWith('image/')) {
        return await ctx.processImageFile(file);
      } else if (file.type.startsWith('video/')) {
        return await ctx.processVideoFile(file);
      } else {
        return null;
      }

    } catch (error) {
      console.error(`Thumbnail creation failed for ${file.name}:`, error);
      return null;
    }
  };

  // ประมวลผลไฟล์รูปภาพ
  ctx.processImageFile = async function(file) {
    // โหลดรูปภาพ
    const img = await ctx.loadImageFromFile(file);

    // สร้าง thumbnails ทั้งสองขนาด
    const [smallThumbnail, largeThumbnail] = await Promise.all([
      ctx.resizeImageToThumbnail(img, 32, 32, 0.8),    // Small: 32x32, quality 0.8
      ctx.resizeImageToThumbnail(img, 200, 200, 0.9)   // Large: 200x200, quality 0.9
    ]);

    return {
      small: smallThumbnail,   // base64 for DB
      large: largeThumbnail,   // base64 for S3 upload
      original: {
        width: img.width,
        height: img.height
      }
    };
  };

  // ประมวลผลไฟล์วีดีโอ
  ctx.processVideoFile = async function(file) {
    // สร้าง video element
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    try {
      // โหลดวีดีโอ
      const videoData = await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        });
        
        video.addEventListener('error', (e) => {
          reject(new Error(`Failed to load video: ${e.message}`));
        });
        
        video.src = url;
        video.load();
      });

      // Capture frame ที่ 1 วินาที หรือ 10% ของวีดีโอ
      const captureTime = Math.min(1, videoData.duration * 0.1);
      video.currentTime = captureTime;
      
      // รอให้ video seek เสร็จ
      await new Promise((resolve) => {
        video.addEventListener('seeked', resolve, { once: true });
      });

      // สร้าง canvas และ capture frame
      const canvas = ctx.createCanvas(videoData.width, videoData.height);
      const ctx2d = canvas.getContext('2d');
      ctx2d.drawImage(video, 0, 0);
      
      // สร้าง thumbnails ทั้งสองขนาด
      const [smallThumbnail, largeThumbnail] = await Promise.all([
        ctx.resizeCanvasToThumbnail(canvas, 32, 32, 0.8),    // Small: 32x32
        ctx.resizeCanvasToThumbnail(canvas, 200, 200, 0.9)   // Large: 200x200
      ]);

      debug.log(`✅ Video thumbnails created - Small: ${Math.round(smallThumbnail.length * 0.75 / 1024)}KB, Large: ${Math.round(largeThumbnail.length * 0.75 / 1024)}KB`);

      return {
        small: smallThumbnail,   // base64 for DB
        large: largeThumbnail,   // base64 for S3 upload
        original: {
          width: videoData.width,
          height: videoData.height,
          duration: videoData.duration
        }
      };

    } finally {
      // Clean up
      URL.revokeObjectURL(url);
      video.remove();
    }
  };

  // ปรับขนาดรูปภาพเป็น thumbnail
  ctx.resizeImageToThumbnail = function(img, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve) => {
      // คำนวณขนาดใหม่แบบ aspect ratio
      const { width, height } = ctx.calculateThumbnailSize(img.width, img.height, maxWidth, maxHeight);
      
      // สร้าง canvas
      const canvas = ctx.createCanvas(width, height);
      const ctx2d = canvas.getContext('2d');
      
      // เซต image smoothing สำหรับคุณภาพที่ดี
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = 'high';
      
      // วาดรูปภาพลงใน canvas
      ctx2d.drawImage(img, 0, 0, width, height);
      
      // แปลงเป็น base64
      const base64 = canvas.toDataURL('image/png', quality);
      
      debug.log(`📏 Resized image: ${img.width}x${img.height} → ${width}x${height}`);
      resolve(base64);
    });
  };

  // ปรับขนาด canvas เป็น thumbnail (สำหรับวีดีโอ)
  ctx.resizeCanvasToThumbnail = function(sourceCanvas, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve) => {
      // คำนวณขนาดใหม่แบบ aspect ratio
      const { width, height } = ctx.calculateThumbnailSize(sourceCanvas.width, sourceCanvas.height, maxWidth, maxHeight);
      
      // สร้าง canvas ใหม่
      const canvas = ctx.createCanvas(width, height);
      const ctx2d = canvas.getContext('2d');
      
      // เซต image smoothing สำหรับคุณภาพที่ดี
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = 'high';
      
      // วาด canvas เก่าลงใน canvas ใหม่
      ctx2d.drawImage(sourceCanvas, 0, 0, width, height);
      
      // แปลงเป็น base64
      const base64 = canvas.toDataURL('image/png', quality);
      
      debug.log(`📏 Resized canvas: ${sourceCanvas.width}x${sourceCanvas.height} → ${width}x${height}`);
      resolve(base64);
    });
  };

  // คำนวณขนาด thumbnail แบบ maintain aspect ratio
  ctx.calculateThumbnailSize = function(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down ถ้าใหญ่เกิน
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  };

  // แปลง base64 เป็น Blob สำหรับ upload ไป S3
  ctx.base64ToBlob = function(base64, mimeType = 'image/png') {
    // ตรวจสอบว่า base64 เป็น string และมีรูปแบบที่ถูกต้อง
    if (typeof base64 !== 'string') {
      throw new Error(`base64ToBlob: Expected string, got ${typeof base64}`);
    }
    
    if (!base64.includes(',')) {
      throw new Error('base64ToBlob: Invalid base64 format, missing data prefix');
    }
    
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // อัพโหลด large thumbnail ไป S3
  ctx.uploadLargeThumbnailToS3 = async function(largeThumbnailBase64, fileId) {
    debug.log(`☁️ Uploading large thumbnail to S3 for file: ${fileId}`);
    
    try {
      // แปลง base64 เป็น Blob
      const blob = ctx.base64ToBlob(largeThumbnailBase64);
      
      // สร้างชื่อไฟล์และ path
      const fileName = `thumbnail_${fileId}_200x200.png`;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const s3Key = `${year}/${month}/thumbnails/${fileName}`;
      
      // อัพโหลดด้วย AWS SDK v3
      const { Upload } = await import('@aws-sdk/lib-storage');
      
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
      
      await upload.done();
      const s3Url = `${ctx.configs.s3Endpoint}${s3Key}`;
      
      debug.log(`✅ Large thumbnail uploaded to S3: ${s3Url}`);
      return s3Url;
      
    } catch (error) {
      debug.log(`❌ Error uploading large thumbnail to S3:`, error);
      throw error;
    }
  };

  // อัพเดตข้อมูลไฟล์ด้วย thumbnails ทั้งสองแบบ
  ctx.updateFileWithThumbnails = async function(fileId, smallThumbnail, largeThumbnailUrl) {
    debug.log(`📝 Updating file ${fileId} with dual thumbnails`);
    
    try {
      const updateData = {};
      
      if (smallThumbnail) {
        updateData.thumbnail = smallThumbnail;
      }
      
      if (largeThumbnailUrl) {
        updateData.thumbnailUrl = largeThumbnailUrl;
      }
      
      const payload = {
        data: updateData
      };
      
      debug.log(`🚀 Calling API: PUT storage/${fileId} with thumbnail data`);
      const response = await ctx.$Request.PUT(`storage/${fileId}`, payload, ctx.requestKey());
      
      if (response.status === 200) {
        debug.log(`✅ File updated successfully with thumbnails`);
        
        // อัพเดต local state
        const fileInList = ctx.fileListing.find(f => f._id === fileId);
        if (fileInList) {
          if (updateData.thumbnail) fileInList.thumbnail = updateData.thumbnail;
          if (updateData.thumbnailUrl) fileInList.thumbnailUrl = updateData.thumbnailUrl;
          ctx.$forceUpdate();
        }
      } else {
        throw new Error(`Failed to update file: ${response.status}`);
      }
      
    } catch (error) {
      debug.log(`❌ Error updating file with thumbnails:`, error);
      throw error;
    }
  };

  // ฟังก์ชันหลักสำหรับ process ไฟล์ที่เลือก (ก่อนอัพโหลด)
  ctx.processSelectedFiles = async function() {
    debug.log(`🔄 Processing ${ctx.files.length} selected files for thumbnails...`);
    
    const processedFiles = [];
    
    for (let i = 0; i < ctx.files.length; i++) {
      const file = ctx.files[i];
      
      try {
        if (file.type.startsWith('image/')) {
          debug.log(`📸 Processing image: ${file.name}`);
          
          // สร้าง thumbnails สำหรับรูปภาพ
          const thumbnails = await ctx.createThumbnailsFromFile(file);
          
          if (thumbnails) {
            // เก็บ thumbnails ไว้ใน file object
            file.thumbnails = thumbnails;
            file.hasPreprocessedThumbnails = true;
            
            debug.log(`✅ Image thumbnails preprocessed for: ${file.name}`);
          }
        } else if (file.type.startsWith('video/')) {
          debug.log(`🎬 Processing video: ${file.name}`);
          
          // สร้าง thumbnails สำหรับวีดีโอ
          const thumbnails = await ctx.createThumbnailsFromFile(file);
          
          if (thumbnails) {
            // เก็บ thumbnails ไว้ใน file object
            file.thumbnails = thumbnails;
            file.hasPreprocessedThumbnails = true;
            
            debug.log(`✅ Video thumbnails preprocessed for: ${file.name}`);
          }
        } else {
          debug.log(`⏭️ Skipping non-media file: ${file.name}`);
        }
        
        processedFiles.push(file);
        
      } catch (error) {
        debug.log(`❌ Error processing file ${file.name}:`, error);
        processedFiles.push(file); // Still add file even if thumbnail fails
      }
    }
    
    debug.log(`🎉 File preprocessing completed: ${processedFiles.length} files ready`);
    return processedFiles;
  };

  debug.log('🎨 Client-side image processor attached successfully');
}
