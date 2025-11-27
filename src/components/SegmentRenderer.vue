<template>
  <div v-if="segments && segments.length > 0" class="segments-layer absolute inset-0">
    <div 
      v-for="(segment, index) in segments" 
      :key="`segment-${segment.id}`"
      class="timeline-segment absolute top-1 bottom-1 border rounded shadow-sm transition-all duration-200"
      :class="{ 
        'current-segment bg-blue-500 bg-opacity-80 border-blue-600 z-30': currentEditingIndex === index,
        'other-segment bg-purple-500 bg-opacity-70 border-purple-600 z-20': currentEditingIndex !== index 
      }"
      :style="{ 
        left: (videoDuration > 0 ? (segment.start / videoDuration) * 100 : 0) + '%',
        width: (videoDuration > 0 ? ((segment.end - segment.start) / videoDuration) * 100 : 0) + '%'
      }"
    >
      <!-- Segment thumbnails -->
      <div class="absolute inset-0 overflow-hidden rounded">
        <div 
          v-for="(thumbnail, thumbIndex) in segment.thumbnails" 
          :key="`thumb-${segment.id}-${thumbIndex}`"
          class="absolute top-0 bottom-0 bg-cover bg-center opacity-60"
          :style="{
            left: `${(thumbIndex / segment.thumbnails.length) * 100}%`,
            width: `${100 / segment.thumbnails.length}%`,
            backgroundImage: `url(${thumbnail.dataUrl})`
          }"
        ></div>
      </div>
      
      <!-- Segment overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-20 rounded"></div>
      
      <!-- Segment number and time display -->
      <div class="absolute inset-0 flex items-center justify-center z-40">
        <div class="bg-black bg-opacity-60 text-white text-sm font-semibold px-2 py-1 rounded text-center">
          <div>{{ index + 1 }}</div>
          <div class="text-xs opacity-90">{{ Math.round(segment.start) }}s - {{ Math.round(segment.end) }}s</div>
        </div>
      </div>
      
      <!-- Drag handles -->
      <div class="resize-handle resize-handle-start absolute left-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize z-50"
           @mousedown="handleDragStart(index, 'start', $event)"
           @click="handleDragStart(index, 'start', $event)"></div>
      <div class="resize-handle resize-handle-end absolute right-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize z-50"
           @mousedown="handleDragStart(index, 'end', $event)"
           @click="handleDragStart(index, 'end', $event)"></div>
      <div class="move-handle absolute inset-x-2 top-1 bottom-1 cursor-move z-40"
           @mousedown="handleDragStart(index, 'move', $event)"
           @click="handleDragStart(index, 'move', $event)"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SegmentRenderer',
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
    }
  },
  emits: ['dragStart'],
  methods: {
    handleDragStart(index, type, event) {
      console.log('SegmentRenderer handleDragStart:', { index, type, event });
      this.$emit('dragStart', { index, type, event });
    }
  }
}
</script>
