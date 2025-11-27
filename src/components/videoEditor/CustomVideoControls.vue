<template>
  <div class="video-controls">
    <!-- Play/Pause Button -->
    <button 
      class="control-btn play-btn"
      @click="handlePlayClick"
      :title="playing ? 'Pause' : 'Play'"
      :key="`play-btn-${playing}`"
    >
      <i :class="iconClass" :key="`icon-${playing}`"></i>
    </button>

    <!-- Time Display -->
    <div class="time-display">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </div>

    <!-- Progress Bar -->
    <div 
      class="progress-container"
      ref="progressRef"
      @click="onProgressClick"
      @mousedown="startProgressDrag"
    >
      <!-- Background -->
      <div class="progress-bg"></div>
      <!-- Buffered -->
      <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
      <!-- Played -->
      <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
      <!-- Handle -->
      <div class="progress-handle" :style="{ left: playedPercent + '%' }"></div>
    </div>

    <!-- Volume -->
    <div class="volume-container">
      <button 
        class="control-btn volume-btn"
        @click="$emit('toggle-mute')"
        :title="muted ? 'Unmute' : 'Mute'"
      >
        <i :class="volumeIcon"></i>
      </button>
      <div 
        class="volume-slider"
        ref="volumeRef"
        @click="onVolumeClick"
        @mousedown="startVolumeDrag"
      >
        <div class="volume-bg"></div>
        <div class="volume-fill" :style="{ width: volumePercent + '%' }"></div>
      </div>
    </div>

    <!-- Playback Rate -->
    <div class="rate-container">
      <button 
        class="control-btn rate-btn"
        @click="showRateMenu = !showRateMenu"
        :title="'Speed: ' + playbackRate + 'x'"
      >
        {{ playbackRate }}x
      </button>
      <div v-if="showRateMenu" class="rate-menu">
        <div 
          v-for="rate in rates"
          :key="rate"
          class="rate-option"
          :class="{ active: rate === playbackRate }"
          @click="selectRate(rate)"
        >
          {{ rate }}x
        </div>
      </div>
    </div>

    <!-- Fullscreen -->
    <button 
      class="control-btn fullscreen-btn"
      @click="$emit('toggle-fullscreen')"
      title="Fullscreen"
    >
      <i class="fas fa-expand"></i>
    </button>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'CustomVideoControls',
  props: {
    currentTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    buffered: { type: Number, default: 0 },
    playing: { type: Boolean, default: false },
    volume: { type: Number, default: 1 },
    muted: { type: Boolean, default: false },
    playbackRate: { type: Number, default: 1 }
  },
  emits: ['toggle-play', 'seek', 'toggle-mute', 'change-volume', 'change-rate', 'toggle-fullscreen'],
  setup(props, { emit }) {
    const progressRef = ref(null);
    const volumeRef = ref(null);
    const showRateMenu = ref(false);
    const isDragging = ref(false);
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const playedPercent = computed(() => {
      return props.duration > 0 ? (props.currentTime / props.duration) * 100 : 0;
    });

    const bufferedPercent = computed(() => {
      return props.duration > 0 ? (props.buffered / props.duration) * 100 : 0;
    });

    const volumePercent = computed(() => {
      return props.muted ? 0 : props.volume * 100;
    });

    const volumeIcon = computed(() => {
      if (props.muted || props.volume === 0) return 'fas fa-volume-mute';
      if (props.volume < 0.5) return 'fas fa-volume-down';
      return 'fas fa-volume-up';
    });

    // Computed property for play/pause icon to ensure reactivity
    const iconClass = computed(() => {
      const icon = props.playing ? 'fas fa-pause' : 'fas fa-play';
      console.log('🎭 Icon class computed:', icon, 'playing:', props.playing);
      return icon;
    });

    const formatTime = (seconds) => {
      if (!isFinite(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const seekToPosition = (clientX, element) => {
      if (!element || props.duration <= 0) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const time = (x / rect.width) * props.duration;
      emit('seek', time);
    };

    const onProgressClick = (e) => {
      seekToPosition(e.clientX, progressRef.value);
    };

    const startProgressDrag = (e) => {
      isDragging.value = true;
      seekToPosition(e.clientX, progressRef.value);
      
      const onMouseMove = (ev) => {
        if (isDragging.value) seekToPosition(ev.clientX, progressRef.value);
      };
      
      const onMouseUp = () => {
        isDragging.value = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const setVolumeAtPosition = (clientX, element) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const volume = x / rect.width;
      emit('change-volume', volume);
    };

    const onVolumeClick = (e) => {
      setVolumeAtPosition(e.clientX, volumeRef.value);
    };

    const startVolumeDrag = (e) => {
      setVolumeAtPosition(e.clientX, volumeRef.value);
      
      const onMouseMove = (ev) => {
        setVolumeAtPosition(ev.clientX, volumeRef.value);
      };
      
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const selectRate = (rate) => {
      showRateMenu.value = false;
      emit('change-rate', rate);
    };

    const handlePlayClick = () => {
      console.log('🔵 Play button clicked, current playing prop:', props.playing);
      emit('toggle-play');
      console.log('🔵 Emitted toggle-play event');
    };

    // Watch for playing prop changes
    watch(() => props.playing, (newVal, oldVal) => {
      console.log('🔄 CustomVideoControls - playing prop changed from', oldVal, 'to', newVal);
      console.log('🔄 Icon should show:', newVal ? 'fas fa-pause' : 'fas fa-play');
    }, { immediate: true });

    return {
      progressRef,
      volumeRef,
      showRateMenu,
      rates,
      playedPercent,
      bufferedPercent,
      volumePercent,
      volumeIcon,
      iconClass,
      formatTime,
      onProgressClick,
      startProgressDrag,
      onVolumeClick,
      startVolumeDrag,
      selectRate,
      handlePlayClick
    };
  }
};
</script>

<style scoped>
.video-controls {
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
  width: 100%;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.control-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #60a5fa;
}

.time-display {
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  min-width: 100px;
  text-align: center;
}

.progress-container {
  flex: 1;
  height: 20px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.progress-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  transform: translateY(-50%);
}

.progress-buffered {
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
  transform: translateY(-50%);
  transition: width 0.1s;
}

.progress-played {
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  background: #3b82f6;
  border-radius: 2px;
  transform: translateY(-50%);
  transition: width 0.1s;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.1s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 60px;
  height: 20px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.volume-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255,255,255,0.3);
  border-radius: 1.5px;
  transform: translateY(-50%);
}

.volume-fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: 3px;
  background: #10b981;
  border-radius: 1.5px;
  transform: translateY(-50%);
  transition: width 0.1s;
}

.rate-container {
  position: relative;
}

.rate-btn {
  font-size: 12px;
  min-width: 48px;
}

.rate-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0,0,0,0.9);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 4px;
  margin-bottom: 8px;
  min-width: 60px;
}

.rate-option {
  padding: 6px 12px;
  color: white;
  cursor: pointer;
  text-align: center;
  font-size: 12px;
  border-radius: 3px;
  transition: background 0.2s;
}

.rate-option:hover {
  background: rgba(255,255,255,0.1);
}

.rate-option.active {
  background: #3b82f6;
  color: white;
}
</style>
