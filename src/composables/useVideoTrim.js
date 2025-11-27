import { ref, computed } from 'vue';
import toast from '@/plugins/ToastUI.js';
import debug from '@/plugins/Logger.js';

export function useVideoTrim() {
  // Core state
  const videoFile = ref(null);
  const videoUrl = ref('');
  const videoDuration = ref(0);
  const currentTime = ref(0);
  const startTime = ref(0);
  const endTime = ref(0);
  const isProcessing = ref(false);
  const progressPercentage = ref(0);
  const videoElement = ref(null);

  // Computed properties
  const trimDuration = computed(() => {
    return Math.max(0, endTime.value - startTime.value);
  });

  const canTrim = computed(() => {
    return trimDuration.value > 0 && videoDuration.value > 0;
  });

  // Methods
  const loadVideo = async (file, url) => {
    try {
      debug.log('🎬 Loading video:', file.name, 'URL:', url);
      
      videoFile.value = file;
      videoUrl.value = url;
      
      // Reset values
      startTime.value = 0;
      endTime.value = 0;
      videoDuration.value = 0;
      currentTime.value = 0;
      
      toast({ type: 'success', message: 'วิดีโอพร้อมสำหรับตัดต่อ' });
      
    } catch (error) {
      debug.error('❌ Error loading video:', error);
      toast({ type: 'error', message: 'ไม่สามารถโหลดวิดีโอได้' });
      throw error;
    }
  };

  const seekToTime = (time) => {
    const clampedTime = Math.max(0, Math.min(time, videoDuration.value));
    currentTime.value = clampedTime;
    
    if (videoElement.value) {
      videoElement.value.currentTime = clampedTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const trimVideo = async () => {
    if (!canTrim.value) {
      toast({ type: 'error', message: 'กรุณาเลือกช่วงเวลาที่ต้องการตัด' });
      return;
    }

    try {
      isProcessing.value = true;
      progressPercentage.value = 0;

      debug.log('🎬 Starting video trim:', {
        file: videoFile.value.name,
        startTime: startTime.value,
        endTime: endTime.value,
        duration: trimDuration.value
      });

      // Simulate processing progress
      const progressInterval = setInterval(() => {
        progressPercentage.value += 10;
        if (progressPercentage.value >= 90) {
          clearInterval(progressInterval);
        }
      }, 200);

      // TODO: Implement actual video trimming with FFmpeg
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      progressPercentage.value = 100;

      toast({ type: 'success', message: `ตัดต่อวิดีโอเสร็จแล้ว (${formatTime(trimDuration.value)})` });
      
      // Return mock trimmed file info
      return {
        name: `trimmed_${videoFile.value.name}`,
        originalName: videoFile.value.name,
        startTime: startTime.value,
        endTime: endTime.value,
        duration: trimDuration.value
      };

    } catch (error) {
      debug.error('❌ Error trimming video:', error);
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการตัดต่อวิดีโอ' });
      throw error;
    } finally {
      isProcessing.value = false;
      progressPercentage.value = 0;
    }
  };

  const reset = () => {
    videoFile.value = null;
    videoUrl.value = '';
    videoDuration.value = 0;
    currentTime.value = 0;
    startTime.value = 0;
    endTime.value = 0;
    isProcessing.value = false;
    progressPercentage.value = 0;
    videoElement.value = null;
  };

  const setPreviewElement = (element) => {
    videoElement.value = element;
  };

  return {
    // State
    videoFile,
    videoUrl,
    videoDuration,
    currentTime,
    startTime,
    endTime,
    isProcessing,
    progressPercentage,
    
    // Computed
    trimDuration,
    canTrim,
    
    // Methods
    loadVideo,
    seekToTime,
    formatTime,
    trimVideo,
    reset,
    setPreviewElement
  };
}
