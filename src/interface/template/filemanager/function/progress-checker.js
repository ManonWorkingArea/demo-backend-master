// Progress Checker for Tasks
export default function attachProgressChecker(ctx) {
  // ตรวจสอบ progress จากไฟล์โดยตรง
  ctx.checkTaskProgressFromFile = async function(task) {
    try {
      console.log(`📂 [PROGRESS] Checking task ${task._id} (${task.type}) via file data`);
      
      if (!task.file_id) {
        console.log(`❌ [PROGRESS] No file_id for task: ${task._id}`);
        return null;
      }

      // ดึงข้อมูลไฟล์
      const fileInfo = task.fileInfo || await ctx.getFileStreamInfo(task.file_id);
      if (!fileInfo || !fileInfo.transcode) {
        console.log(`❌ [PROGRESS] No transcode data for file: ${task.file_id}`);
        return null;
      }

      console.log(`📊 [PROGRESS] Transcode data:`, fileInfo.transcode);

      // หา quality
      const quality = task.metadata?.quality || task.metadata?.conversionOptions?.quality || '720p';
      
      // ตรวจสอบตาม task type
      if (task.type === 'trim') {
        const trimKey = `trim_${quality}`;
        const progressValue = fileInfo.transcode[trimKey];
        
        console.log(`🎯 [PROGRESS] Checking ${trimKey}: ${progressValue} (${typeof progressValue})`);
        
        if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
          // เสร็จแล้ว - มี URL
          console.log(`✅ [PROGRESS] Trim completed: ${progressValue}`);
          
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
          // กำลังประมวลผล
          console.log(`📊 [PROGRESS] Trim progress: ${progressValue}%`);
          
          if (progressValue > 0) {
            await ctx.updateTask(task._id, {
              data: {
                progress: progressValue,
                status: 'processing'
              }
            });
          }
          
          return { progress: progressValue, status: 'processing' };
        }
      } else if (task.type === 'conversion') {
        const progressValue = fileInfo.transcode[quality];
        
        console.log(`🔄 [PROGRESS] Checking ${quality}: ${progressValue} (${typeof progressValue})`);
        
        if (typeof progressValue === 'string' && progressValue.startsWith('http')) {
          // เสร็จแล้ว - มี URL
          console.log(`✅ [PROGRESS] Conversion completed: ${progressValue}`);
          
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
          // กำลังประมวลผล
          console.log(`📊 [PROGRESS] Conversion progress: ${progressValue}%`);
          
          if (progressValue > 0) {
            await ctx.updateTask(task._id, {
              data: {
                progress: progressValue,
                status: 'processing'
              }
            });
          }
          
          return { progress: progressValue, status: 'processing' };
        }
      }

      console.log(`⚠️ [PROGRESS] No progress data found for task: ${task._id}`);
      return null;

    } catch (error) {
      console.error(`❌ [PROGRESS] Error checking task progress:`, error);
      return null;
    }
  };

  // แทนที่ pollTaskProgress เดิม
  ctx.pollTaskProgress = async function(task) {
    console.log(`🚀 [PROGRESS] pollTaskProgress called for task: ${task._id}`);
    
    // ลองตรวจสอบจากไฟล์ก่อน
    const result = await ctx.checkTaskProgressFromFile(task);
    if (result) {
      return result;
    }

    // ถ้าไม่เจอให้ใช้วิธีเดิม (API polling)
    const { metadata } = task;
    if (!metadata?.conversionOptions) {
      console.log(`❌ [PROGRESS] No conversionOptions for API polling`);
      return null;
    }

    const streamId = metadata.conversionOptions.trimJobId || 
                    metadata.conversionOptions.conversionId ||
                    metadata.conversionOptions.streamId;
    
    const quality = metadata.conversionOptions.quality || '720p';

    if (!streamId) {
      console.log(`❌ [PROGRESS] No streamId for API polling`);
      return null;
    }

    console.log(`🌐 [PROGRESS] Using API polling with streamId: ${streamId}`);

    if (task.type === 'trim') {
      return await ctx.pollTrimStatus(streamId, task._id, quality);
    } else if (task.type === 'conversion') {
      return await ctx.pollConversionProgress(streamId, task._id, quality);
    }

    return null;
  };
}
