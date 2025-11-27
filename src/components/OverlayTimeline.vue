<template>
  <div class="overlay-timeline relative select-none" ref="containerRef">
  <div v-for="(layer, index) in safeLayers" :key="layer.id"
     class="overlay-item group absolute top-1 bottom-1 rounded border shadow-sm"
         :class="{
           'bg-emerald-500/40 border-emerald-600': layer.type === 'text',
           'bg-amber-500/40 border-amber-600': layer.type === 'image'
         }"
         :style="{
           left: (videoDuration > 0 ? (layer.start / videoDuration) * 100 : 0) + '%',
           width: (videoDuration > 0 ? ((layer.end - layer.start) / videoDuration) * 100 : 0) + '%'
         }"
    >
      <!-- Left handle -->
      <div class="handle left" @mousedown.stop="onMouseDown($event, index, 'start')"></div>

      <!-- Content label -->
      <div class="content" @mousedown.stop="onMouseDown($event, index, 'move')">
        <span class="label text-xs font-medium text-white drop-shadow">{{ index + 1 }}. {{ layer.type === 'text' ? 'Text' : 'Image' }}</span>
      </div>

      <!-- Right handle -->
      <div class="handle right" @mousedown.stop="onMouseDown($event, index, 'end')"></div>

  <!-- Delete button (show on hover) -->
  <button class="delete-btn opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
      @mousedown.stop @click.stop="$emit('delete-layer', layer.id)" title="ลบ">
        <i class="fas fa-trash text-[11px]"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue';

const MIN_LEN = 0.1;

export default {
  name: 'OverlayTimeline',
  props: {
    layers: { type: Array, default: () => [] },
    videoDuration: { type: Number, default: 0 }
  },
  emits: ['update-layer', 'delete-layer'],
  setup(props, { emit }) {
    const containerRef = ref(null);
    const dragging = ref(null); // { index, type: 'start'|'end'|'move', startX, w, start, end }

    const safeLayers = computed(() => {
      if (!Array.isArray(props.layers)) return [];
      return props.layers.filter(l => l && typeof l.start === 'number' && typeof l.end === 'number');
    });

    const getWidth = () => {
      const el = containerRef.value;
      if (!el) return 1;
      return el.clientWidth || 1;
    };

    const onMouseDown = (e, idx, type) => {
      if (e && typeof e.button === 'number' && e.button !== 0) return; // left only
      const layer = safeLayers.value[idx];
      if (!layer) return;
      // Compute neighbor bounds to prevent overlaps within this free gap
      const others = safeLayers.value.filter((_, i) => i !== idx);
      let minStart = 0;
      let maxEnd = props.videoDuration || 0;
      if (others.length > 0) {
        const prev = others
          .filter(o => typeof o.end === 'number' && o.end <= layer.start)
          .reduce((acc, o) => Math.max(acc, o.end), 0);
        const next = others
          .filter(o => typeof o.start === 'number' && o.start >= layer.end)
          .reduce((acc, o) => Math.min(acc, o.start), props.videoDuration || 0);
        minStart = isFinite(prev) ? prev : 0;
        maxEnd = isFinite(next) ? next : (props.videoDuration || 0);
      }
      dragging.value = {
        index: idx,
        type,
        startX: e.clientX,
        w: getWidth(),
        start: layer.start,
        end: layer.end,
        minStart,
        maxEnd
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp, { once: true });
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      const d = dragging.value;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dt = (dx / d.w) * (props.videoDuration || 0);
      let start = d.start;
      let end = d.end;
      if (d.type === 'move') {
        // Keep length constant; clamp within initial free gap to avoid overlap
        const len = Math.max(MIN_LEN, d.end - d.start);
        const minStart = Math.max(0, d.minStart || 0);
        const maxStart = Math.max(minStart, (d.maxEnd ?? (props.videoDuration || 0)) - len);
        const desiredStart = d.start + dt;
        start = Math.min(maxStart, Math.max(minStart, desiredStart));
        end = start + len;
      } else if (d.type === 'start') {
        const minStart = Math.max(0, d.minStart || 0);
        const maxStart = (d.end - MIN_LEN);
        start = Math.min(maxStart, Math.max(minStart, d.start + dt));
      } else if (d.type === 'end') {
        const minEnd = (d.start + MIN_LEN);
        const maxEnd = Math.min(props.videoDuration || 0, d.maxEnd ?? (props.videoDuration || 0));
        end = Math.max(minEnd, Math.min(maxEnd, d.end + dt));
      }
      emit('update-layer', { index: d.index, start, end });
    };

    const onMouseUp = () => {
      dragging.value = null;
      window.removeEventListener('mousemove', onMouseMove);
    };

    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    });

    return { containerRef, safeLayers, onMouseDown };
  }
};
</script>

<style scoped>
.overlay-timeline {
  height: 44px;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 2px, transparent 2px, transparent 8px);
}
.overlay-item {
  pointer-events: auto;
}
.content {
  position: absolute;
  top: 0; bottom: 0; left: 8px; right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
}
.handle {
  position: absolute;
  top: 0; bottom: 0;
  width: 8px;
  background: #fff;
  border: 1px solid #cbd5e1;
  z-index: 10;
}
.handle.left { left: -4px; border-right: 0; cursor: ew-resize; }
.handle.right { right: -4px; border-left: 0; cursor: ew-resize; }
.delete-btn {
  position: absolute;
  top: 2px; right: 2px;
  background: rgba(255,255,255,0.92);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 2px 4px;
  color: #dc2626;
  z-index: 20;
}

</style>
