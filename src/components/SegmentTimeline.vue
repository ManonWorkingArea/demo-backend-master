<template>
  <!-- All segments display with drag handles -->
  <div class="segments-layer absolute inset-0">
  <div v-for="(segment, index) in safeSegments" 
         :key="segment.id"
         class="timeline-segment group absolute top-1 bottom-1 border rounded shadow-sm"
         :class="{ 
           'current-segment bg-blue-500 bg-opacity-50 border-blue-600 z-30': currentEditingIndex === index,
           'other-segment bg-purple-500 bg-opacity-40 border-purple-600 hover:bg-purple-400 hover:bg-opacity-60 z-20': currentEditingIndex !== index 
         }"
         :style="{ 
           left: (videoDuration > 0 ? (segment.start / videoDuration) * 100 : 0) + '%',
           width: (videoDuration > 0 ? ((segment.end - segment.start) / videoDuration) * 100 : 0) + '%'
     }">
      
      <!-- Left drag handle (start) -->
      <div class="drag-handle left-handle absolute -left-1 top-0 bottom-0 w-2 bg-white border border-gray-400 rounded-l hover:bg-gray-100 z-50"
           @mousedown="startUnifiedSegmentDrag($event, index, 'start')"
           @touchstart="startUnifiedSegmentDrag($event, index, 'start')"
           title="Drag to adjust start time">
        <div class="handle-indicator absolute top-1/2 left-1/2 w-0.5 h-6 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      </div>
      
      <div class="segment-content flex items-center justify-center h-full px-1 text-white font-semibold text-sm hover:bg-opacity-90 relative overflow-hidden"
           @mousedown="startUnifiedSegmentDrag($event, index, 'move')"
           @touchstart="startUnifiedSegmentDrag($event, index, 'move')"
           title="Drag to move entire segment">
        
        <!-- Background thumbnails from timeline -->
        <div v-if="thumbnails?.length > 0" class="absolute inset-0">
          <!-- Show timeline thumbnails that correspond to this segment's time range -->
          <div class="absolute inset-0 flex opacity-70">
            <template v-for="(thumbnail, thumbIndex) in getTimelineThumbnailsForSegment(segment)" :key="thumbIndex">
              <div class="flex-1 bg-cover bg-center"
                   :style="{ 
                     backgroundImage: `url(${thumbnail.dataUrl})`,
                     filter: 'brightness(0.8) contrast(1.1)'
                   }">
              </div>
            </template>
          </div>
        </div>
        
        <!-- Fallback when no timeline thumbnails available -->
        <div v-else class="absolute inset-0"
             :style="{ 
               background: `linear-gradient(135deg, 
                 hsl(${(index * 60) % 360}, 60%, 70%) 0%,
                 hsl(${(index * 60 + 30) % 360}, 55%, 65%) 100%)`
             }">
        </div>
        
        <!-- Loading state with enhanced animation -->
        <div v-if="isGeneratingSegmentThumbnails" 
             class="absolute inset-0">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 animate-pulse"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
        </div>
        
        <!-- Enhanced overlay for better text visibility -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        <!-- Segment info with better styling -->
        <div class="relative z-10 flex flex-col items-center justify-center">
          <div class="flex items-center mb-0.5">
            <span class="segment-label mr-1 text-lg font-bold drop-shadow-lg">{{ index + 1 }}</span>
            <i v-if="!isGeneratingSegmentThumbnails" class="fas fa-arrows-alt text-xs opacity-70 drop-shadow-sm"></i>
            <i v-else class="fas fa-spinner fa-spin text-xs opacity-70 drop-shadow-sm"></i>
          </div>
          <div class="text-xs opacity-90 drop-shadow-sm bg-black/30 px-2 py-0.5 rounded-full">
            {{ segment && segment.end !== undefined && segment.start !== undefined ? Math.round(segment.end - segment.start) : 0 }}s
          </div>
        </div>
      </div>

  <!-- Overlay action buttons (top-right) -->
  <div class="absolute top-1 right-1 z-[60] flex space-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
        <button
          class="p-1 rounded bg-white/90 hover:bg-red-50 border border-gray-300 text-red-600 shadow-sm"
          title="ลบช่วงนี้"
          @mousedown.stop
          @click.stop="$emit('delete-segment', segment.id)"
        >
          <i class="fas fa-trash text-[11px]"></i>
        </button>
      </div>
      
      <!-- Right drag handle (end) -->
      <div class="drag-handle right-handle absolute -right-1 top-0 bottom-0 w-2 bg-white border border-gray-400 rounded-r hover:bg-gray-100 z-50"
           @mousedown="startUnifiedSegmentDrag($event, index, 'end')"
           @touchstart="startUnifiedSegmentDrag($event, index, 'end')"
           title="Drag to adjust end time">
        <div class="handle-indicator absolute top-1/2 left-1/2 w-0.5 h-6 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'SegmentTimeline',
  props: {
    segments: {
      type: Array,
      default: () => []
    },
    videoDuration: {
      type: Number,
      default: 0
    },
    currentEditingIndex: {
      type: Number,
      default: -1
    },
    isGeneratingSegmentThumbnails: {
      type: Boolean,
      default: false
    },
    segmentThumbnails: {
      type: Array,
      default: () => []
    },
    thumbnails: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'start-unified-segment-drag',
    'delete-segment'
  ],
  setup(props, { emit }) {
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

    // Methods
    const startUnifiedSegmentDrag = (event, segmentIndex, dragType) => {
      // Only start drag on left mouse button; allow right-click for context menu
      if (event && typeof event.button === 'number' && event.button !== 0) return;
      emit('start-unified-segment-drag', { event, segmentIndex, dragType });
    };

    // Get timeline thumbnails that correspond to a segment's time range
    const getTimelineThumbnailsForSegment = (segment) => {
      if (!props.thumbnails || props.thumbnails.length === 0 || !props.videoDuration) return [];
      
      // Calculate which thumbnails fall within this segment
      const segmentThumbnails = props.thumbnails.filter(thumb => 
        thumb.time >= segment.start && thumb.time <= segment.end
      );
      
      // If no thumbnails in range, get the closest one
      if (segmentThumbnails.length === 0) {
        const closestThumbnail = props.thumbnails.reduce((closest, thumb) => {
          const currentDistance = Math.abs(thumb.time - segment.start);
          const closestDistance = Math.abs(closest.time - segment.start);
          return currentDistance < closestDistance ? thumb : closest;
        });
        
        return closestThumbnail ? [closestThumbnail] : [];
      }
      
      return segmentThumbnails;
    };


    return {
      // Computed
      safeSegments,
      
      // Methods
      startUnifiedSegmentDrag,
      getTimelineThumbnailsForSegment,
      
    };
  }
};
</script>

<style scoped>
/* Timeline segment styling */
.timeline-segment {
  border-radius: 4px;
  overflow: hidden;
  backdrop-filter: blur(1px);
  pointer-events: auto !important;
  cursor: default;
  /* เพิ่มความโปร่งใสให้ segment */
  opacity: 0.9;
  /* ปิด transition เพื่อลด delay ในการลาก */
  transition: none !important;
  border-width: 2px;
  border-style: solid;
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-segment:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.timeline-segment .segment-content {
  border-radius: 2px;
  /* ลดความทึบของเนื้อหาภายใน */
  background-color: rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

/* Force cursor styles with high specificity */
.segments-layer .timeline-segment .drag-handle {
  cursor: ew-resize !important;
}

.segments-layer .timeline-segment .segment-content {
  cursor: move !important;
}

/* Performance optimizations for smooth dragging */
.dragging-segment {
  will-change: transform, left, width;
  transform: translateZ(0); /* Force GPU acceleration */
  transition: none !important; /* Disable transitions during drag */
  pointer-events: none; /* Prevent hover effects during drag */
}

.dragging-segment * {
  pointer-events: none; /* Prevent hover effects on children during drag */
}

/* Drag handle styling */
.drag-handle {
  cursor: ew-resize !important;
  pointer-events: auto !important;
  z-index: 50 !important;
  /* ปิด transition เพื่อลด delay */
  transition: none !important;
}

.drag-handle:hover {
  background-color: #e5e7eb !important;
  cursor: ew-resize !important;
  transform: scaleX(1.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.drag-handle .handle-indicator {
  pointer-events: none !important;
  /* ปิด transition เพื่อลด delay */
  transition: none !important;
}

.drag-handle:hover .handle-indicator {
  background-color: #374151 !important;
}

/* Segment content styling */
.segment-content {
  position: relative;
  overflow: hidden;
  cursor: move !important;
  pointer-events: auto !important;
  /* ปิด transition เพื่อลด delay */
  transition: none !important;
}

.segment-content:hover {
  cursor: move !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.segment-content > * {
  pointer-events: none !important;
}

.segment-content .absolute {
  border-radius: inherit;
}

.segment-content:hover .absolute.bg-black {
  opacity: 0.1;
}
</style>
