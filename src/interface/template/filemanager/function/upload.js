// Upload Functions for FileManager
import debug from '@/plugins/Logger.js';
import toast from '@/plugins/ToastUI.js';
import dialog from '@/plugins/Dialog.js';
import { Upload } from "@aws-sdk/lib-storage";

export default function attachUploadFunctions(ctx) {
  
  // Pre-process selected files สำหรับสร้าง thumbnails ก่อนอัพโหลด
  ctx.preprocessFiles = async function() {
    debug.log(`🎨 Preprocessing ${ctx.files.length} files for thumbnails...`);
    
    if (!ctx.files.length) return;
    
    try {
      // สร้าง loading toast
      const processingToast = toast({ 
        type: 'pending', 
        message: `กำลังเตรียมไฟล์... (${ctx.files.length} ไฟล์)` 
      });
      
      for (let i = 0; i < ctx.files.length; i++) {
        const file = ctx.files[i];
        
        if (file.type.startsWith('image/')) {
          debug.log(`📸 Creating thumbnails for: ${file.name}`);
          
          try {
            const thumbnails = await ctx.createThumbnailsFromFile(file);
            
            if (thumbnails) {
              file.thumbnails = thumbnails;
              file.hasPreprocessedThumbnails = true;
              debug.log(`✅ Thumbnails ready for: ${file.name}`);
            }
          } catch (error) {
            debug.log(`❌ Thumbnail creation failed for ${file.name}:`, error);
          }
        }
        
        // อัพเดต progress
        const progress = Math.round(((i + 1) / ctx.files.length) * 100);
        processingToast.update({
          message: `เตรียมไฟล์... ${i + 1}/${ctx.files.length} (${progress}%)`
        });
      }
      
      processingToast.dismiss();
      
      debug.log(`🎉 File preprocessing completed!`);
      toast({ type: 'success', message: 'เตรียมไฟล์เสร็จเรียบร้อย!' });
      
    } catch (error) {
      debug.log(`❌ Error in preprocessing:`, error);
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการเตรียมไฟล์' });
    }
  };

  // Main file upload function
  ctx.submitFiles = async function() {
    try {
      // Initialize toast สำหรับการอัปโหลด
      ctx.toast = toast({ type: 'pending', message: 'กำลังอัพโหลดไฟล์...' });

      if (!ctx.files.length) {
        throw new Error('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด');
      }

      // ตรวจสอบว่ามี S3 client หรือไม่
      if (!ctx.S3) {
        throw new Error('ไม่พบการตั้งค่า S3 สำหรับการอัปโหลด');
      }

      const currentDate = new Date();
      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

      for (let i = 0; i < ctx.files.length; i++) {
        const file = ctx.files[i];
        
        if (!file || file.size === 0) {
          console.error(`Error: File is unreadable or empty - ${file?.name || "Unknown file"}`);
          file.status = 'error';
          continue;
        }

        try {
          const file_name_array = file.name.split('.');
          const file_extension = file_name_array.pop();
          const timestamp = new Date().getTime();
          const new_file_name = String(timestamp);
          const path = `${year}/${month}/`;
          
          // กำหนดสถานะเริ่มต้น
          file.status = 'uploading';
          file.progress = 0;
          ctx.$forceUpdate();

          // สร้าง multipart upload
          const parallelUploads3 = new Upload({
            client: ctx.S3,
            params: {
              Bucket: ctx.configs.s3Bucket,
              Key: `${path}${new_file_name}.${file_extension}`,
              Body: file,
              ACL: 'public-read',
              ContentType: file.type
            },
            queueSize: 4, // optional concurrency configuration
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
          });

          // เก็บ reference ของ upload controller
          ctx.uploadControllers.set(file.name, parallelUploads3);

          // ติดตามความคืบหน้าการอัพโหลด
          parallelUploads3.on("httpUploadProgress", (progress) => {
            // ตรวจสอบว่าถูกยกเลิกหรือไม่
            if (file.status === 'cancelled') {
              return;
            }

            const loaded = progress.loaded || 0;
            const total = progress.total || file.size;
            const percentLoaded = Math.round((loaded * 100) / total);
            
            file.progress = percentLoaded;
            ctx.$forceUpdate();
            
            debug.log(`Upload Progress for ${file.name}: ${percentLoaded}%`);
          });

          // ดำเนินการอัพโหลด
          await parallelUploads3.done();

          // ลบ controller เมื่ออัพโหลดเสร็จ
          ctx.uploadControllers.delete(file.name);

          // ถ้าถูกยกเลิกให้ข้ามการประมวลผลต่อ
          if (file.status === 'cancelled') {
            continue;
          }

          // อัพเดทสถานะเมื่อสำเร็จ
          file.status = 'success';
          file.progress = 100;
          file.original = `${path}${new_file_name}.${file_extension}`;

          // บันทึกข้อมูลไฟล์
          const payload = {
            data: {
              owner: ctx.isShareMode ? ctx.shareRootOwner : (ctx.session?.current?._id || ctx.configs.siteID),
              original: file.original,
              path: ctx.configs.s3Endpoint + file.original,
              parent: ctx.prefix,
              name: file.name,
              size: file.size,
              type: ctx.getFileType(file.type),
              mimetype: file.type,
              spaceId: ctx.session?.current?.spaceId || ctx.configs.spaceId,
            },
            options: {}
          };

          // เพิ่มข้อมูลพิเศษสำหรับไฟล์ที่มี preprocessed data
          if (file.hasPreprocessedThumbnails && file.thumbnails) {
            debug.log(`📝 Adding preprocessed data to payload for: ${file.name}`);
            
            // เพิ่ม small thumbnail
            if (file.thumbnails.small) {
              payload.data.thumbnail = file.thumbnails.small;
              debug.log(`✅ Small thumbnail added to payload`);
            }
            
            // เพิ่ม duration สำหรับวีดีโอ
            if (file.type.startsWith('video/') && file.thumbnails.original && file.thumbnails.original.duration) {
              payload.data.duration = file.thumbnails.original.duration;
              debug.log(`✅ Video duration added to payload: ${file.thumbnails.original.duration}s`);
            }
          }

          const response = await ctx.$Request.POST('storage/', payload, ctx.requestKey());
          debug.log(`File metadata saved successfully for: ${file.name}`);

          // ใช้ thumbnails ที่ preprocessed แล้ว (ถ้ามี)
          if (file.hasPreprocessedThumbnails && file.thumbnails) {
            debug.log(`🎨 Using preprocessed thumbnails for: ${file.name}`);
            
            try {
              // อัพโหลด large thumbnail ไป S3
              const largeThumbnailUrl = await ctx.uploadLargeThumbnailToS3(file.thumbnails.large, response.data._id);
              
              // อัพเดตข้อมูลไฟล์ด้วย thumbnails ทั้งสองแบบ
              await ctx.updateFileWithThumbnails(response.data._id, file.thumbnails.small, largeThumbnailUrl);
              
              debug.log(`✅ Preprocessed thumbnails applied successfully for: ${file.name}`);
            } catch (thumbnailError) {
              debug.log(`❌ Error applying preprocessed thumbnails for ${file.name}:`, thumbnailError);
              // Fallback ไปใช้วิธีเก่า
              if (file.type.startsWith('image/')) {
                ctx.createThumbnailFallback(ctx.configs.s3Endpoint + file.original, response.data._id);
              } else if (file.type.startsWith('video/')) {
                ctx.captureThumbnail(ctx.configs.s3Endpoint + file.original, response.data._id);
              }
            }
          } else if (file.type.startsWith('image/')) {
            debug.log(`🔄 Using fallback thumbnail creation for image: ${file.name}`);
            // ใช้วิธีเก่าสำหรับไฟล์ที่ไม่ได้ preprocess
            ctx.createThumbnailFallback(ctx.configs.s3Endpoint + file.original, response.data._id);
          } else if (file.type.startsWith('video/')) {
            debug.log(`🎬 Using fallback video thumbnail creation for: ${file.name}`);
            
            ctx.captureThumbnail(ctx.configs.s3Endpoint + file.original, response.data._id)
              .then(() => {
                debug.log(`Background video thumbnail created successfully for: ${file.name}`);
              })
              .catch((thumbnailError) => {
                debug.log(`Background video thumbnail creation failed for ${file.name}:`, thumbnailError);
                console.error(`Video thumbnail error for ${file.name}:`, thumbnailError);
              });
          }

          debug.log(`File processing completed for: ${file.name}, status: ${file.status}`);

        } catch (error) {
          // ลบ controller เมื่อเกิด error
          ctx.uploadControllers.delete(file.name);
          
          // ตรวจสอบว่าเป็น error จากการยกเลิกหรือไม่
          if (error.name === 'AbortError') {
            file.status = 'cancelled';
            debug.log(`Upload cancelled for file: ${file.name}`);
          } else {
            console.error(`Upload Failed for file: ${file.name}`, error);
            file.status = 'error';
            file.progress = 0;
            ctx.error = true;
            
            // แสดง error message ที่ละเอียดขึ้น
            let errorMessage = `อัพโหลดไฟล์ ${file.name} ไม่สำเร็จ`;
            if (error.message) {
              errorMessage += `: ${error.message}`;
            }
            if (error.response?.data?.message) {
              errorMessage += ` (${error.response.data.message})`;
            }
            
            ctx.errorText = errorMessage;
            debug.log(`Detailed error for ${file.name}:`, {
              error: error.message,
              stack: error.stack,
              response: error.response?.data
            });
          }
          
          // ลบ controller ไม่ว่าจะ error หรือถูกยกเลิก
          ctx.uploadControllers.delete(file.name);
        }

        ctx.$forceUpdate();
      }

      // รีเฟรชรายการไฟล์เฉพาะเมื่อมีไฟล์อัพโหลดสำเร็จ
      const successFiles = ctx.files.filter(f => f.status === 'success');
      if (successFiles.length > 0) {
        await ctx.listFile(ctx.prefix);
        
        // โหลด thumbnail ใหม่สำหรับไฟล์ที่เพิ่งอัพโหลด
        setTimeout(async () => {
          try {
            await ctx.forceReloadThumbnails();
          } catch (error) {
            console.error('Error forcing thumbnail reload:', error);
          }
        }, 1000); // รอ 1 วินาทีให้ listFile เสร็จสิ้น
      }

      // แสดงผลสรุป
      if (successFiles.length > 0) {
        ctx.showToast(`อัพโหลดเสร็จสิ้น ${successFiles.length} ไฟล์`, 'success', 3000);
        debug.log(`Upload completed: ${successFiles.length} files uploaded successfully`);
      }

      // ไม่ล้างไฟล์ที่ error หรือ cancelled ให้ผู้ใช้ตัดสินใจเอง
      // เก็บไฟล์ทุกสถานะไว้ เพื่อให้สามารถ resume ได้
      
      // ล้างไฟล์ที่ success หลังจาก 3 วินาที
      if (successFiles.length > 0) {
        setTimeout(() => {
          ctx.files = ctx.files.filter(f => f.status !== 'success');
          
          // ซ่อน mini panel ถ้าไม่มีไฟล์เหลือ
          if (ctx.files.length === 0) {
            ctx.showMiniUploader = false;
          }
          
          if (ctx.files.length === 0) {
            ctx.uploadPanel = false;
          }
        }, 3000);
      }

    } catch (error) {
      console.error('Submit Files Error:', error);
      ctx.showToast(error.message, 'error');
      ctx.error = true;
      ctx.errorText = error.message;
    }
  };

  // Resume failed uploads function
  ctx.resumeFailedUploads = async function() {
    try {
      ctx.toast = toast({ type: 'pending', message: 'กำลังดำเนินการอัพโหลดต่อ...' });

      // หาไฟล์ที่สถานะเป็น pending, error, หรือ cancelled
      const pendingFiles = ctx.files.filter(f => 
        f.status === 'pending' || 
        f.status === 'error' || 
        f.status === 'cancelled'
      );

      if (pendingFiles.length === 0) {
        ctx.toast.hide('ไม่มีไฟล์ที่ต้องอัพโหลด', 'info');
        return;
      }

      // ตรวจสอบว่ามี S3 client หรือไม่
      if (!ctx.S3) {
        throw new Error('ไม่พบการตั้งค่า S3 สำหรับการอัปโหลด');
      }

      const currentDate = new Date();
      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

      for (const file of pendingFiles) {
        if (!file || file.size === 0) {
          console.error(`Error: File is unreadable or empty - ${file?.name || "Unknown file"}`);
          file.status = 'error';
          continue;
        }

        try {
          const file_name_array = file.name.split('.');
          const file_extension = file_name_array.pop();
          const timestamp = new Date().getTime();
          const new_file_name = String(timestamp);
          const path = `${year}/${month}/`;
          
          // กำหนดสถานะเริ่มต้น
          file.status = 'uploading';
          file.progress = 0;
          ctx.$forceUpdate();

          // สร้าง multipart upload
          const parallelUploads3 = new Upload({
            client: ctx.S3,
            params: {
              Bucket: ctx.configs.s3Bucket,
              Key: `${path}${new_file_name}.${file_extension}`,
              Body: file,
              ACL: 'public-read',
              ContentType: file.type
            },
            queueSize: 4,
            partSize: 1024 * 1024 * 5,
            leavePartsOnError: false,
          });

          // เก็บ reference ของ upload controller
          ctx.uploadControllers.set(file.name, parallelUploads3);

          // ติดตามความคืบหน้าการอัพโหลด
          parallelUploads3.on("httpUploadProgress", (progress) => {
            if (file.status === 'cancelled') {
              return;
            }

            const loaded = progress.loaded || 0;
            const total = progress.total || file.size;
            const percentLoaded = Math.round((loaded * 100) / total);
            
            file.progress = percentLoaded;
            ctx.$forceUpdate();
            
            debug.log(`Resume Upload Progress for ${file.name}: ${percentLoaded}%`);
          });

          // ดำเนินการอัพโหลด
          await parallelUploads3.done();

          // ลบ controller เมื่ออัพโหลดเสร็จ
          ctx.uploadControllers.delete(file.name);

          // ถ้าถูกยกเลิกให้ข้ามการประมวลผลต่อ
          if (file.status === 'cancelled') {
            continue;
          }

          // อัพเดทสถานะเมื่อสำเร็จ
          file.status = 'success';
          file.progress = 100;
          file.original = `${path}${new_file_name}.${file_extension}`;

          // บันทึกข้อมูลไฟล์
          const payload = {
            data: {
              owner: ctx.isShareMode ? ctx.shareRootOwner : (ctx.session?.current?._id || ctx.configs.siteID),
              original: file.original,
              path: ctx.configs.s3Endpoint + file.original,
              parent: ctx.prefix,
              name: file.name,
              size: file.size,
              type: ctx.getFileType(file.type),
              mimetype: file.type,
              spaceId: ctx.session?.current?.spaceId || ctx.configs.spaceId,
            },
            options: {}
          };

          // เพิ่มข้อมูลพิเศษสำหรับไฟล์ที่มี preprocessed data
          if (file.hasPreprocessedThumbnails && file.thumbnails) {
            debug.log(`📝 Adding preprocessed data to payload for: ${file.name} (resume)`);
            
            // เพิ่ม small thumbnail
            if (file.thumbnails.small) {
              payload.data.thumbnail = file.thumbnails.small;
              debug.log(`✅ Small thumbnail added to payload (resume)`);
            }
            
            // เพิ่ม duration สำหรับวีดีโอ
            if (file.type.startsWith('video/') && file.thumbnails.original && file.thumbnails.original.duration) {
              payload.data.duration = file.thumbnails.original.duration;
              debug.log(`✅ Video duration added to payload (resume): ${file.thumbnails.original.duration}s`);
            }
          }

          const response = await ctx.$Request.POST('storage/', payload, ctx.requestKey());
          debug.log(`File metadata saved successfully for: ${file.name}`);

          // สร้าง thumbnail แบบ background
          if (file.type.startsWith('image/')) {
            debug.log(`Starting background thumbnail creation for image: ${file.name} (resume)`);
            debug.log(`Image URL: ${ctx.configs.s3Endpoint + file.original}`);
            debug.log(`Image file ID: ${response.data._id}`);
            
            // ใช้ฟังก์ชัน createThumbnail จาก Vue component ที่ใช้ Image.load()
            ctx.createThumbnail(ctx.configs.s3Endpoint + file.original, response.data._id)
              .then(() => {
                debug.log(`Background thumbnail created successfully for: ${file.name} (resume)`);
              })
              .catch((thumbnailError) => {
                debug.log(`Background thumbnail creation failed for ${file.name} (resume):`, thumbnailError);
                console.error(`Image thumbnail error for ${file.name} (resume):`, thumbnailError);
              });
          } else if (file.type.startsWith('video/')) {
            debug.log(`Starting background video thumbnail creation for: ${file.name} (resume)`);
            debug.log(`Video URL: ${ctx.configs.s3Endpoint + file.original}`);
            debug.log(`Video file ID: ${response.data._id}`);
            
            ctx.captureThumbnail(ctx.configs.s3Endpoint + file.original, response.data._id)
              .then(() => {
                debug.log(`Background video thumbnail created successfully for: ${file.name} (resume)`);
              })
              .catch((thumbnailError) => {
                debug.log(`Background video thumbnail creation failed for ${file.name} (resume):`, thumbnailError);
                console.error(`Video thumbnail error for ${file.name} (resume):`, thumbnailError);
              });
          }

        } catch (error) {
          // ลบ controller เมื่อเกิด error
          ctx.uploadControllers.delete(file.name);
          
          if (error.name === 'AbortError') {
            file.status = 'cancelled';
            debug.log(`Resume upload cancelled for file: ${file.name}`);
          } else {
            console.error(`Resume upload failed for file: ${file.name}`, error);
            file.status = 'error';
            file.progress = 0;
          }
        }

        ctx.$forceUpdate();
      }

      // รีเฟรชรายการไฟล์เฉพาะเมื่อมีไฟล์อัพโหลดสำเร็จ
      const successFiles = pendingFiles.filter(f => f.status === 'success');
      if (successFiles.length > 0) {
        await ctx.listFile(ctx.prefix);
        
        // โหลด thumbnail ใหม่สำหรับไฟล์ที่เพิ่งอัพโหลด
        setTimeout(async () => {
          try {
            await ctx.forceReloadThumbnails();
          } catch (error) {
            console.error('Error forcing thumbnail reload:', error);
          }
        }, 1000);
        
        ctx.toast.hide(`อัพโหลดเสร็จสิ้น ${successFiles.length} ไฟล์`, 'success');
      } else {
        ctx.toast.hide('การอัพโหลดไม่สำเร็จ', 'error');
      }

    } catch (error) {
      console.error('Resume upload error:', error);
      ctx.toast.hide(error.message, 'error');
    }
  };

  // Close upload box function
  ctx.closeUploadBox = async function() {
    ctx.uploadPanel = false;
    
    // ยกเลิกการอัปโหลดที่กำลังดำเนินการอยู่
    const activeFiles = ctx.files.filter(f => f.status === 'pending' || f.status === 'uploading');
    
    if (activeFiles.length > 0) {
      // แสดง confirmation dialog
      dialog.confirm({
        title: 'ยกเลิกการอัปโหลด?',
        message: `คุณต้องการยกเลิกการอัปโหลด ${activeFiles.length} ไฟล์ที่กำลังดำเนินการอยู่หรือไม่?`,
        confirm: async () => {
          // ยกเลิกการอัปโหลดทั้งหมด
          for (const file of activeFiles) {
            await ctx.cancelUpload(file.name);
          }
          ctx.files = [];
          ctx.showMiniUploader = false;
        },
        cancel: () => {
          // ถ้าไม่ยกเลิก ให้แสดง mini panel แทน
          ctx.showMiniUploader = true;
        }
      });
    } else {
      // ถ้าไม่มีไฟล์ที่กำลังอัปโหลด ล้างไฟล์ทั้งหมด
      ctx.files = [];
      ctx.showMiniUploader = false;
    }
  };

  // Close mini uploader function
  ctx.closeMiniUploader = async function() {
    // ยกเลิกการอัปโหลดที่กำลังดำเนินการอยู่
    const activeFiles = ctx.files.filter(f => f.status === 'pending' || f.status === 'uploading');
    
    if (activeFiles.length > 0) {
      // แสดง confirmation dialog
      dialog.confirm({
        title: 'ยกเลิกการอัปโหลด?',
        message: `คุณต้องการยกเลิกการอัปโหลด ${activeFiles.length} ไฟล์ที่กำลังดำเนินการอยู่หรือไม่?`,
        confirm: async () => {
          // ยกเลิกการอัปโหลดทั้งหมด
          for (const file of activeFiles) {
            await ctx.cancelUpload(file.name);
          }
          ctx.showMiniUploader = false;
          ctx.files = [];
        },
        cancel: () => {
          // ไม่ทำอะไรถ้ายกเลิก
        }
      });
    } else {
      ctx.showMiniUploader = false;
      // ล้างไฟล์ที่สำเร็จแล้ว
      ctx.files = ctx.files.filter(f => f.status !== 'success');
    }
  };
}
