<template>
  <!-- Custom Video Controls -->
  <div :class="isOverlay 
      ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2'
      : 'w-full bg-gray-900 text-white px-3 py-2 shadow-sm'">
    <!-- Progress Bar -->
    <div class="mb-2">
      <div 
        class="relative h-1.5 bg-gray-600 rounded cursor-pointer"
        @click="seekFromProgressBar"
        @mousedown="startProgressDrag"
        ref="progressBarRef"
      >
        <!-- Background progress background -->
        <div class="absolute inset-0 bg-gray-600 rounded"></div>
        
  <!-- Loaded progress (gray) -->
        <div 
          class="absolute top-0 left-0 h-full bg-gray-500 rounded"
          :style="{ width: '100%' }"
        ></div>
        
        <!-- Unused sections (dimmed/faded) -->
        <!-- Before start time -->
        <div 
          class="absolute top-0 left-0 h-full bg-gray-700 opacity-30 rounded-l"
          :style="{ width: videoDuration > 0 ? `${(startTime / videoDuration) * 100}%` : '0%' }"
        ></div>
        
        <!-- After end time -->
        <div 
          class="absolute top-0 right-0 h-full bg-gray-700 opacity-30 rounded-r"
          :style="{ 
            left: videoDuration > 0 ? `${(endTime / videoDuration) * 100}%` : '0%',
            width: videoDuration > 0 ? `${((videoDuration - endTime) / videoDuration) * 100}%` : '0%'
          }"
        ></div>
        
        <!-- Multi-segment indicators (always visible) -->
    <div v-if="safeSegments.length > 0" class="absolute inset-0">
          <div 
            v-for="(segment, index) in safeSegments" 
      :key="segment.id"
            class="absolute top-0 h-full z-5 group segment-container"
            :class="[
              { 'segment-dragging': isDraggingSegment && dragSegmentData.segmentId === segment.id },
              getSegmentColorClass(index)
            ]"
            :style="{ 
              left: videoDuration > 0 ? `${(segment.start / videoDuration) * 100}%` : '0%',
              width: videoDuration > 0 ? `${((segment.end - segment.start) / videoDuration) * 100}%` : '0%'
            }"
            :title="`ช่วงที่ ${index + 1}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`"
          >
            <!-- Segment Number Label -->
            <div class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 text-[10px] text-white font-bold pointer-events-none">
              <div class="bg-black bg-opacity-60 px-1 py-0.5 rounded">
                {{ index + 1 }}
              </div>
            </div>
            
            <!-- Left drag handle (start time) -->
            <div 
              v-if="isMultiSegmentMode"
              class="absolute top-0 left-0 w-1.5 h-full bg-gray-800 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 segment-drag-handle"
              @mousedown="startSegmentDrag(segment.id, 'start', $event)"
              title="ลากเพื่อปรับจุดเริ่มต้น"
            >
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded"></div>
            </div>
            
            <!-- Right drag handle (end time) -->
            <div 
              v-if="isMultiSegmentMode"
              class="absolute top-0 right-0 w-1.5 h-full bg-gray-800 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 segment-drag-handle"
              @mousedown="startSegmentDrag(segment.id, 'end', $event)"
              title="ลากเพื่อปรับจุดสิ้นสุด"
            >
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded"></div>
            </div>
            
            <!-- Middle drag handle (move entire segment) -->
            <div 
              v-if="isMultiSegmentMode"
              class="absolute top-0 left-1.5 right-1.5 h-full cursor-move opacity-0 group-hover:opacity-50 transition-opacity z-25 bg-black bg-opacity-30 segment-drag-handle"
              @mousedown="startSegmentDrag(segment.id, 'move', $event)"
              title="ลากเพื่อย้ายช่วงทั้งหมด"
            >
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <i class="fas fa-arrows-alt text-white text-[10px]"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Single mode selection (when NOT in multi-segment mode) -->
        <div v-else>
          <!-- Trim selection background (active area) -->
          <div 
            class="absolute top-0 h-full bg-gray-400 rounded"
            :style="{ 
              left: `${(startTime / videoDuration) * 100}%`,
              width: `${((endTime - startTime) / videoDuration) * 100}%`
            }"
          ></div>
          
          <!-- Current progress - only in selected range -->
          <div 
            v-if="currentTime >= startTime && currentTime <= endTime"
            class="absolute top-0 h-full bg-blue-500 rounded transition-all duration-100"
            :style="{ 
              left: `${(startTime / videoDuration) * 100}%`,
              width: `${((currentTime - startTime) / videoDuration) * 100}%`
            }"
          ></div>
          
          <!-- Start marker (blue) - only in single mode -->
          <div 
            class="absolute top-0 w-1 h-full bg-blue-400 border-blue-300 border-l-2 z-30"
            :style="{ left: `${(startTime / videoDuration) * 100}%` }"
            title="จุดเริ่มต้น"
          ></div>
          
          <!-- End marker (red) - only in single mode -->
          <div 
            class="absolute top-0 w-1 h-full bg-red-400 border-red-300 border-l-2 z-30"
            :style="{ left: `${(endTime / videoDuration) * 100}%` }"
            title="จุดสิ้นสุด"
          ></div>
        </div>
        
        <!-- Main Video Playhead (always visible) -->
        <div 
          class="absolute z-25 playhead-main-container group"
          :style="{ 
            left: `${(currentTime / videoDuration) * 100}%`, 
            top: '-2px',
            transform: 'translateX(-50%)',
            marginTop: '0px',
            height: '5px'
          }"
          @mousedown="startProgressDrag"
        >
          <!-- Main playhead circle -->
          <div class="relative">
            <!-- Outer glow ring -->
            <div class="absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-30 scale-125 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            <!-- Main playhead -->
            <div class="absolute top-0 left-1/2 w-2.5 h-2.5 bg-blue-500 border border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 transform -translate-x-1/2 -translate-y-1/2">
              <!-- Inner highlight -->
              <div class="absolute inset-0.5 bg-blue-300 rounded-full opacity-40"></div>
              
              <!-- Vertical line extending down from center -->
              <div class="absolute top-full left-1/2 w-0.5 h-1.5 bg-blue-500 transform -translate-x-1/2 opacity-60"></div>
            </div>
          </div>
          
          <!-- Playhead tooltip -->
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap playhead-tooltip">
            <div class="font-medium">{{ formatTime(currentTime) }}</div>
            <div class="text-gray-300 text-[9px]">{{ Math.round((currentTime / videoDuration) * 100) }}%</div>
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-1 border-r-1 border-t-1 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Control Buttons and Time Display -->
    <div class="flex items-center justify-between">
      <!-- Left controls -->
      <div class="flex items-center space-x-2">
        <!-- Play/Pause Button -->
        <button 
          @click="togglePlayPause"
          class="h-8 px-3 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center text-white transition-colors"
          :key="`play-btn-${isVideoPlaying}`"
        >
          <i :class="isVideoPlaying ? 'fas fa-pause' : 'fas fa-play'" class="text-sm"></i>
        </button>
        
        <!-- Skip to Previous Segment -->
        <button 
          @click="goToPreviousSegment"
          class="h-8 px-2 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center text-white transition-colors"
          title="Section ก่อนหน้า"
        >
          <i class="fas fa-step-backward text-xs"></i>
        </button>
        
        <!-- Skip to Next Segment -->
        <button 
          @click="goToNextSegment"
          class="h-8 px-2 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center text-white transition-colors"
          title="Section ถัดไป"
        >
          <i class="fas fa-step-forward text-xs"></i>
        </button>
        
        <!-- Volume Control + Stereo meters -->
        <div class="flex items-center space-x-1.5">
          <!-- Integrated Volume Control -->
          <div class="flex items-center bg-white/15 rounded-lg px-2 h-8 group volume-container min-w-[120px]"
               :class="{ 'muted': isMuted }">
            
            <!-- 1. Volume Icon -->
            <button 
              @click="toggleMute"
              class="flex items-center justify-center w-5 h-5 flex-shrink-0"
              :title="isMuted ? 'เปิดเสียง' : 'ปิดเสียง'"
            >
              <i class="fas fa-volume-up text-xs" 
                 :style="isMuted ? 'color: #9CA3AF; opacity: 0.5' : 'color: #FFFFFF; opacity: 1'"></i>
            </button>
            
            <!-- 2. Volume Label -->
            <div class="text-[10px] leading-none font-mono text-center min-w-[2rem] flex-shrink-0"
                 :class="isMuted ? 'text-red-400/80' : 'text-white'">
              {{ isMuted ? 'MUTE' : Math.round(volume * 100) + '%' }}
            </div>
            
            <!-- Separator -->
            <div class="text-white/40 text-xs opacity-40">|</div>
            
            <!-- 3. Volume Slider -->
            <div class="flex items-center flex-1 min-w-[60px] ml-1">
              <div class="w-full h-2 bg-gray-400 relative cursor-pointer volume-slider-track">
                <!-- Volume fill -->
                <div 
                  class="absolute top-0 left-0 h-full"
                  :class="isMuted ? 'bg-red-500' : 'bg-teal-600'"
                  :style="{ width: `${isMuted ? 0 : volume * 100}%` }"
                ></div>
                <!-- Input overlay -->
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  :value="volume"
                  @input="updateVolume"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <!-- Stereo vertical meters -->
          <div class="hidden sm:flex items-end ml-1.5 h-8 space-x-1.5" title="ระดับเสียง L/R แบบสด">
            <div class="flex flex-col items-center justify-end h-8">
              <div class="relative w-1.5 h-full bg-white/15 rounded-sm overflow-hidden border border-white/20">
                <!-- Background scale markings -->
                <div class="absolute top-0 left-0 w-full h-0.25 bg-white/30"></div>
                <div class="absolute top-1/4 left-0 w-full h-0.25 bg-white/20"></div>
                <div class="absolute top-1/2 left-0 w-full h-0.25 bg-white/20"></div>
                <div class="absolute top-3/4 left-0 w-full h-0.25 bg-white/20"></div>
                
                <!-- Dynamic level indicator -->
                <div 
                  class="absolute bottom-0 left-0 right-0 transition-[height] duration-75 z-10"
                  :class="liveLevelLeft > 80 ? 'bg-red-500' : liveLevelLeft > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                  :style="{ height: `${Math.max(2, Math.min(100, liveLevelLeft))}%` }"
                ></div>
                
                <!-- Peak indicator -->
                <div 
                  v-if="liveLevelLeft > 0"
                  class="absolute left-0 right-0 h-0.5 bg-white z-20 transition-all duration-100"
                  :style="{ top: `${100 - Math.min(100, liveLevelLeft)}%` }"
                ></div>
              </div>
              <span class="mt-0.5 text-[9px] leading-none text-white/80">L</span>
            </div>
            <div class="flex flex-col items-center justify-end h-8">
              <div class="relative w-1.5 h-full bg-white/15 rounded-sm overflow-hidden border border-white/20">
                <!-- Background scale markings -->
                <div class="absolute top-0 left-0 w-full h-0.25 bg-white/30"></div>
                <div class="absolute top-1/4 left-0 w-full h-0.25 bg-white/20"></div>
                <div class="absolute top-1/2 left-0 w-full h-0.25 bg-white/20"></div>
                <div class="absolute top-3/4 left-0 w-full h-0.25 bg-white/20"></div>
                
                <!-- Dynamic level indicator -->
                <div 
                  class="absolute bottom-0 left-0 right-0 transition-[height] duration-75 z-10"
                  :class="liveLevelRight > 80 ? 'bg-red-500' : liveLevelRight > 50 ? 'bg-yellow-500' : 'bg-green-500'"
                  :style="{ height: `${Math.max(2, Math.min(100, liveLevelRight))}%` }"
                ></div>
                
                <!-- Peak indicator -->
                <div 
                  v-if="liveLevelRight > 0"
                  class="absolute left-0 right-0 h-0.5 bg-white z-20 transition-all duration-100"
                  :style="{ top: `${100 - Math.min(100, liveLevelRight)}%` }"
                ></div>
              </div>
              <span class="mt-0.5 text-[9px] leading-none text-white/80">R</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right controls -->
      <div class="flex items-center space-x-2">
        <!-- Debug Audio Levels (temporary) -->
        <div class="text-white text-[9px] font-mono opacity-60">
          <div v-if="liveLevelLeft > 0 || liveLevelRight > 0">
            L:{{ Math.round(liveLevelLeft) }} R:{{ Math.round(liveLevelRight) }}
          </div>
          <div v-else class="text-yellow-400">
            Audio: No signal
          </div>
        </div>
        
        <!-- Time Display (moved from center) -->
        <div class="text-white text-xs font-mono">
          {{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, toRef, watch } from 'vue';

export default {
  name: 'VideoCustomControls',
  props: {
    // Render as overlay inside the video (absolute at bottom). Default false for inline below the player.
    isOverlay: {
      type: Boolean,
      default: false
    },
    currentTime: {
      type: Number,
      default: 0
    },
    videoDuration: {
      type: Number,
      default: 0
    },
    startTime: {
      type: Number,
      default: 0
    },
    endTime: {
      type: Number,
      default: 0
    },
    isVideoPlaying: {
      type: Boolean,
      default: false
    },
    volume: {
      type: Number,
      default: 1
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    // Live audio level (0-100) from parent analyser for inline meter
    liveLevel: {
      type: Number,
      default: 0
    },
    // Per-channel levels
    liveLevelLeft: {
      type: Number,
      default: 0
    },
    liveLevelRight: {
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
    isDraggingSegment: {
      type: Boolean,
      default: false
    },
    dragSegmentData: {
      type: Object,
      default: () => ({})
    },
    
  },
  emits: [
    'seek-from-progress-bar',
    'start-progress-drag',
    'toggle-play-pause',
    'seek-to-time',
    'toggle-mute',
    'update-volume',
    'start-segment-drag',
    'go-to-previous-segment',
    'go-to-next-segment'
  ],
  setup(props, { emit }) {
    const progressBarRef = ref(null);
    const isDraggingProgress = ref(false);

    // Reactive ref from props
    const isPlayingRef = toRef(props, 'isVideoPlaying');
    
    // Debug audio levels
    const liveLevelLeftRef = toRef(props, 'liveLevelLeft');
    const liveLevelRightRef = toRef(props, 'liveLevelRight');
    
    // Watch audio levels for debugging
    watch([liveLevelLeftRef, liveLevelRightRef], () => {
      // Audio levels are being received and processed
    });
    
    // Computed for actual playing state with debug
    const actuallyPlaying = computed(() => {
      const isPlaying = !!isPlayingRef.value;
      console.log('VideoCustomControls: actuallyPlaying computed =', isPlaying, 'from isPlayingRef.value =', isPlayingRef.value);
      return isPlaying;
    });
    

    // Safe segments for rendering
    const safeSegments = computed(() => {
      if (!props.segments || !Array.isArray(props.segments)) return [];
      return props.segments.filter(segment => 
        segment && 
        typeof segment.start === 'number' && 
        typeof segment.end === 'number' &&
        typeof segment.id !== 'undefined'
      );
    });

    // Current segment being played
    const currentSegment = computed(() => {
      if (!props.isMultiSegmentMode || !safeSegments.value.length) return null;
      
      // Find the segment that contains the current time
      return safeSegments.value.find(segment => 
        props.currentTime >= segment.start && props.currentTime <= segment.end
      );
    });

    // Get segment playhead position as percentage
    const getSegmentPlayheadPosition = () => {
      if (!currentSegment.value || !props.videoDuration) return 0;
      
      const segment = currentSegment.value;
      const segmentProgress = props.currentTime - segment.start;
      const segmentPosition = segment.start + segmentProgress;
      
      return (segmentPosition / props.videoDuration) * 100;
    };

    // Get progress within current segment
    const getSegmentProgress = () => {
      if (!currentSegment.value) return 0;
      
      const segment = currentSegment.value;
      return props.currentTime - segment.start;
    };

    // Get current segment index
    const getSegmentIndex = () => {
      if (!currentSegment.value || !safeSegments.value.length) return 0;
      
      return safeSegments.value.findIndex(segment => 
        segment.id === currentSegment.value.id
      );
    };

    // Methods
    const seekFromProgressBar = (event) => {
      if (!progressBarRef.value || !props.videoDuration || isDraggingProgress.value) return;
      
      const rect = progressBarRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const time = percentage * props.videoDuration;
      
      emit('seek-from-progress-bar', time);
    };

    const startProgressDrag = (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      isDraggingProgress.value = true;
      
      const handleMouseMove = (e) => {
        if (!isDraggingProgress.value || !progressBarRef.value || !props.videoDuration) return;
        
        const rect = progressBarRef.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * props.videoDuration;
        
        emit('seek-to-time', time);
      };
      
      const handleMouseUp = () => {
        isDraggingProgress.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Initial seek on mousedown
      handleMouseMove(event);
      
      emit('start-progress-drag', event);
    };

    const togglePlayPause = () => {
      emit('toggle-play-pause');
    };

    const seekToTime = (time) => {
      emit('seek-to-time', time);
    };

    const toggleMute = () => {
      emit('toggle-mute');
    };

    const updateVolume = (event) => {
      // ถ้า mute อยู่และผู้ใช้ลาก volume slider ให้ unmute อัตโนมัติ
      if (props.isMuted && parseFloat(event.target.value) > 0) {
        emit('toggle-mute'); // unmute ก่อน
      }
      emit('update-volume', event);
    };

    const startSegmentDrag = (segmentId, dragType, event) => {
      emit('start-segment-drag', { segmentId, dragType, event });
    };

    const goToPreviousSegment = () => {
      emit('go-to-previous-segment');
    };

    const goToNextSegment = () => {
      emit('go-to-next-segment');
    };

    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get segment color class based on different colors for variety, matching timeline overview
    const getSegmentColorClass = (index) => {
      const colors = [
        'bg-orange-600 border border-orange-700',    // Orange - segment 1
        'bg-yellow-500 border border-yellow-600',    // Yellow - segment 2  
        'bg-green-600 border border-green-700',      // Green - segment 3
        'bg-blue-600 border border-blue-700',        // Blue - segment 4
        'bg-purple-600 border border-purple-700',    // Purple - segment 5
        'bg-pink-600 border border-pink-700',        // Pink - segment 6
        'bg-red-600 border border-red-700',          // Red - segment 7
        'bg-indigo-600 border border-indigo-700'     // Indigo - segment 8
      ];
      
      return colors[index % colors.length];
    };

    return {
      // Refs
      progressBarRef,
      isDraggingProgress,
      
      // Computed
      safeSegments,
      currentSegment,
      actuallyPlaying,
      
      // Methods
      seekFromProgressBar,
      startProgressDrag,
      togglePlayPause,
      seekToTime,
      toggleMute,
      updateVolume,
      startSegmentDrag,
      goToPreviousSegment,
      goToNextSegment,
      formatTime,
      getSegmentPlayheadPosition,
      getSegmentProgress,
      getSegmentIndex,
      getSegmentColorClass
    };
  }
};
</script>

<style scoped>
/* Multi-segment styling */
.segment-container {
  transition: all 0.2s ease-in-out;
}

.segment-container:hover {
  filter: brightness(1.1) saturate(1.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.segment-drag-handle {
  transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.segment-drag-handle:hover {
  background-color: #374151 !important;
}

/* Dragging state */
.segment-dragging {
  filter: brightness(0.9) saturate(1.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Playhead styling */
.playhead-main-container {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.playhead-main-container:hover {
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4));
  transform: translateY(-50%) scale(1.1);
}

.playhead-main-container:active {
  transform: translateY(-50%) scale(0.95);
  filter: drop-shadow(0 1px 2px rgba(59, 130, 246, 0.5));
}

.playhead-section-container {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3));
}

.playhead-section-container:hover {
  filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4));
  transform: translateY(-50%) scale(1.15);
}

/* Enhanced animations */
@keyframes smooth-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, 0) scale(1);
  }
  50% {
    opacity: 0.1;
    transform: translate(-50%, 0) scale(1.3);
  }
}

@keyframes gentle-ping {
  0% {
    opacity: 0.6;
    transform: translate(-50%, 0) scale(1);
  }
  75%, 100% {
    opacity: 0;
    transform: translate(-50%, 0) scale(1.5);
  }
}

.animate-smooth-pulse {
  animation: smooth-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-gentle-ping {
  animation: gentle-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Tooltip enhancements */
.playhead-tooltip {
  backdrop-filter: blur(4px);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Smooth transitions for all playhead elements */
.playhead-main-container > div,
.playhead-section-container > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Gradient overlays for depth */
.playhead-gradient-overlay {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
}

/* Interactive states */
.playhead-main-container .cursor-grab:hover {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
}

.playhead-main-container .cursor-grab:active {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
}

/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 1px solid #ccc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 1px solid #ccc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Volume Control Styling */
.volume-container {
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(4px);
  height: 2rem; /* Fixed height to match other buttons */
}

.volume-container:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.volume-slider-track {
  transition: all 0.2s ease-in-out;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.volume-slider-track:hover {
  background-color: #6b7280 !important;
  transform: scaleY(1.3);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.volume-slider-thumb {
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.volume-slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.volume-slider-thumb:active {
  transform: translate(-50%, -50%) scale(0.95);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Visual feedback for muted state */
.volume-container.muted {
  background-color: rgba(239, 68, 68, 0.15) !important;
}

.volume-container.muted:hover {
  background-color: rgba(239, 68, 68, 0.25) !important;
}

/* Volume icon container styling */
.volume-icon-container {
  transition: all 0.2s ease-in-out;
}

.volume-icon-container:hover {
  transform: translateY(-1px);
}

/* Hide all scrollbars globally */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}

/* Hide scrollbars for specific overflow elements */
.overflow-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar,
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}

.overflow-auto,
.overflow-y-auto,
.overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
