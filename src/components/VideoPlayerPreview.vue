<template>
  <div v-if="videoUrl" class="h-full flex flex-col">
    <!-- Video Info -->
    <div v-if="videoDuration > 0" class="bg-gray-50 p-3 flex-shrink-0">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="text-center">
          <div class="flex justify-center items-center gap-2">
            <span class="text-gray-500">ความยาววิดีโอ:</span>
            <span class="font-semibold text-gray-900">{{ formatTime(videoDuration) }}</span>
          </div>
        </div>
        <div class="text-center">
          <div class="flex justify-center items-center gap-2">
            <span class="text-gray-500">ความยาวที่ตัด:</span>
            <span class="font-semibold" :class="selectedDuration > 0 ? 'text-blue-600' : 'text-gray-900'">
              {{ formatTime(selectedDuration) }}
            </span>
          </div>
        </div>
        <div class="text-center">
          <div class="flex justify-center items-center gap-2">
            <span class="text-gray-500">ขนาดประมาณ:</span>
            <span class="font-semibold text-green-600">
              {{ Math.round(percentOfOriginal) }}% ของต้นฉบับ
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-black overflow-hidden relative flex items-center justify-center flex-1">
      <video 
        ref="videoRef"
        :src="videoUrl"
        class="max-h-full max-w-full w-auto h-auto object-contain"
        preload="metadata"
        crossorigin="anonymous"
        @loadedmetadata="onVideoLoaded"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
      >
        วิดีโอของคุณไม่สามารถแสดงได้
      </video>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, nextTick } from 'vue';

export default {
  name: 'VideoPlayerPreview',
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    videoFile: {
      type: Object,
      default: null
    },
    startTime: {
      type: Number,
      default: 0
    },
    endTime: {
      type: Number,
      default: 0
    },
    isMultiSegmentMode: {
      type: Boolean,
      default: false
    },
    segments: {
      type: Array,
      default: () => []
    },
    isPreviewPlaying: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'video-loaded',
    'time-update',
    'play-pause-toggle',
    'video-ready'
  ],
  setup(props, { emit }) {
    const videoRef = ref(null);
    const videoDuration = ref(0);
    const currentTime = ref(0);
    const isVideoPlaying = ref(false);

    // Computed properties
    const trimDuration = computed(() => Math.max(0, props.endTime - props.startTime));
    const totalSegmentsDuration = computed(() => {
      if (!props.segments || props.segments.length === 0) return 0;
      return props.segments.reduce((acc, s) => {
        const start = typeof s.start === 'number' ? s.start : 0;
        const end = typeof s.end === 'number' ? s.end : 0;
        const d = Math.max(0, end - start);
        return acc + d;
      }, 0);
    });
    const selectedDuration = computed(() => {
      return props.isMultiSegmentMode ? totalSegmentsDuration.value : trimDuration.value;
    });
    const percentOfOriginal = computed(() => {
      if (!videoDuration.value || videoDuration.value <= 0) return 0;
      return (selectedDuration.value / videoDuration.value) * 100;
    });

    // Watch for props changes
    watch(() => props.videoUrl, (newUrl) => {
      if (newUrl && videoRef.value) {
        videoRef.value.load();
      }
    });

    // Provide video element reference to parent
    watch(videoRef, (element) => {
      if (element) {
        emit('video-ready', element);
      }
    });

    // Methods
    const onVideoLoaded = () => {
      if (videoRef.value) {
        videoDuration.value = videoRef.value.duration;
        
        emit('video-loaded', {
          duration: videoDuration.value,
          videoElement: videoRef.value
        });
      }
    };

    const onTimeUpdate = () => {
      if (videoRef.value) {
        currentTime.value = videoRef.value.currentTime;
        isVideoPlaying.value = !videoRef.value.paused;
        
        emit('time-update', {
          currentTime: currentTime.value,
          isPlaying: isVideoPlaying.value
        });
        
        // Handle multi-segment preview
        if (isVideoPlaying.value && props.isMultiSegmentMode && props.segments.length > 0) {
          handleMultiSegmentPreview();
        } else if (isVideoPlaying.value && props.isPreviewPlaying) {
          // Single segment preview logic
          if (currentTime.value >= props.endTime) {
            videoRef.value.currentTime = props.startTime;
          }
        }
      }
    };

    const onPlay = () => {
      nextTick(() => {
        isVideoPlaying.value = true;
        emit('time-update', {
          currentTime: currentTime.value,
          isPlaying: true
        });
      });
    };

    const onPause = () => {
      nextTick(() => {
        isVideoPlaying.value = false;
        emit('time-update', {
          currentTime: currentTime.value,
          isPlaying: false
        });
      });
    };

    const togglePlayPause = () => {
      emit('play-pause-toggle');
    };

    const handleMultiSegmentPreview = () => {
      const currentTimeVal = currentTime.value;
      
      // Find which segment we should be in
      const currentSegment = props.segments.find(segment => 
        currentTimeVal >= segment.start && currentTimeVal <= segment.end
      );
      
      if (currentSegment) {
        // We're in a valid segment, check if we've reached the end
        if (currentTimeVal >= currentSegment.end) {
          // Immediately jump to next segment
          jumpToNextSegment(currentSegment);
        }
      } else {
        // We're not in any segment, jump to the next one immediately
        jumpToNextSegment();
      }
    };

    const jumpToNextSegment = (currentSegment = null) => {
      if (!videoRef.value) return;
      
      // Sort segments by start time
      const sortedSegments = [...props.segments].sort((a, b) => a.start - b.start);
      
      let targetTime = null;
      
      if (currentSegment) {
        // Find next segment after current one
        const currentIndex = sortedSegments.findIndex(seg => seg.id === currentSegment.id);
        if (currentIndex >= 0 && currentIndex < sortedSegments.length - 1) {
          // Jump to next segment
          const nextSegment = sortedSegments[currentIndex + 1];
          targetTime = nextSegment.start;
        } else {
          // We're at the last segment, loop back to first
          const firstSegment = sortedSegments[0];
          targetTime = firstSegment.start;
        }
      } else {
        // Not in any segment, find the first segment that starts after current time
        const nextSegment = sortedSegments.find(seg => seg.start > currentTime.value) || sortedSegments[0];
        targetTime = nextSegment.start;
      }
      
      // Instant seek without waiting for events
      if (targetTime !== null) {
        videoRef.value.currentTime = targetTime;
        currentTime.value = targetTime;
      }
    };

    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Expose methods for parent component
    const seekToTime = (time) => {
      if (videoRef.value && time >= 0 && time <= videoDuration.value) {
        videoRef.value.currentTime = time;
        currentTime.value = time;
      }
    };

    const play = () => {
      if (videoRef.value) {
        videoRef.value.play();
        isVideoPlaying.value = true;
      }
    };

    const pause = () => {
      if (videoRef.value) {
        videoRef.value.pause();
        isVideoPlaying.value = false;
      }
    };

    const setVolume = (volume) => {
      if (videoRef.value) {
        videoRef.value.volume = volume;
      }
    };

    const setMuted = (muted) => {
      if (videoRef.value) {
        videoRef.value.muted = muted;
      }
    };

    return {
      // Refs
      videoRef,
      videoDuration,
      currentTime,
      isVideoPlaying,
      
      // Computed
  trimDuration,
  totalSegmentsDuration,
  selectedDuration,
  percentOfOriginal,
      
      // Methods
      onVideoLoaded,
      onTimeUpdate,
      onPlay,
      onPause,
      togglePlayPause,
      handleMultiSegmentPreview,
      jumpToNextSegment,
      formatTime,
      seekToTime,
      play,
      pause,
      setVolume,
      setMuted
    };
  }
};
</script>

<style scoped>
video {
  background: #000;
}
</style>
