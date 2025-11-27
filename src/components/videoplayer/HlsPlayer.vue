<template>
  <div 
    ref="containerEl" 
    class="relative group select-none bg-black overflow-hidden"
    :style="containerStyle"
    @mousemove="showUiTemporarily" 
    @mouseleave="hideUiAfterDelay" 
    @click="closeAllDropdowns"
    @contextmenu.prevent>

    <video
      ref="videoEl"
      :poster="poster"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :controls="false"
      playsinline
      :preload="preload"
      class="w-full block cursor-pointer"
      :style="isCustomFullscreen ? { width: '100%', height: '100%', objectFit: 'contain' } : computedStyle"
      @click="togglePlay"
      @contextmenu.prevent
    ></video>

    <!-- Vimeo-style Center Play Button -->
    <div 
      v-if="!isPlaying && showBigPlayButton"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
      :class="{ 'opacity-0': uiVisible && isPlaying, 'opacity-100': !isPlaying }"
    >
      <button
        class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-200 hover:scale-105 shadow-lg pointer-events-auto mb-2"
        :style="{ backgroundColor: themeColor }"
        @click.stop="togglePlay"
        @mouseenter="$event.target.style.backgroundColor = darkenColor(themeColor)"
        @mouseleave="$event.target.style.backgroundColor = themeColor"
        :aria-label="isPlaying ? 'หยุดชั่วคราว' : 'เล่น'"
      >
        <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      <!-- ข้อความใต้ปุ่ม -->
      <div class="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full pointer-events-none">
        คลิกเพื่อเล่น
      </div>
    </div>

    <!-- Overlay Label (Top Left) -->
    <div 
      v-if="showOverlayLabel && (overlayLabel || overlaySubtitle)"
      class="absolute top-4 left-4 z-20 pointer-events-none max-w-48 transition-all duration-300"
      :class="{
        'opacity-0 translate-y-[-8px]': isPlaying && !uiVisible,
        'opacity-100 translate-y-0': !isPlaying || uiVisible
      }"
    >
      <div class="bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm rounded-md px-3 py-1.5 text-white shadow-lg">
        <div v-if="overlayLabel" class="text-xs font-semibold leading-tight truncate">
          {{ overlayLabel }}
        </div>
        <div v-if="overlaySubtitle" class="text-xs text-gray-200 mt-0.5 leading-tight truncate">
          {{ overlaySubtitle }}
        </div>
      </div>
    </div>

    <!-- Vimeo-style Single Control Bar (Bottom Full Width) -->
    <div
      class="absolute inset-x-0 bottom-0 text-white pointer-events-none transition-all duration-300 px-4 pb-4"
      :class="{ 
        'opacity-0 translate-y-4': !uiVisible || (!isPlaying && showBigPlayButton), 
        'opacity-100 translate-y-0': uiVisible && (isPlaying || !showBigPlayButton)
      }"
    >
      <!-- Main Control Bar Container -->
      <div class="bg-black/70 px-6 py-2 flex items-center space-x-3 pointer-events-auto w-full rounded-lg">
        <!-- Play/Pause Button (Left) -->
        <button 
          class="w-12 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200" 
          :style="{ backgroundColor: themeColor }"
          @click.stop="togglePlay" 
          @mouseenter="$event.target.style.backgroundColor = darkenColor(themeColor)"
          @mouseleave="$event.target.style.backgroundColor = themeColor"
          :aria-label="isPlaying ? 'หยุดชั่วคราว' : 'เล่น'"
        >
          <svg v-if="!isPlaying" class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        </button>

        <!-- -10 Button -->
        <button 
          v-if="showSkipButtons"
          class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
          @click.stop="skipBackward" 
          aria-label="ย้อนกลับ 10 วินาที"
        >
          <span class="text-white text-sm font-bold">-10</span>
        </button>

        <!-- +10 Button -->
        <button 
          v-if="showSkipButtons"
          class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
          @click.stop="skipForward" 
          aria-label="กรอไปข้างหน้า 10 วินาที"
        >
          <span class="text-white text-sm font-bold">10+</span>
        </button>

        <!-- Progress Bar Section -->
        <div class="flex-1 flex items-center space-x-2">
          <!-- Time Display -->
          <div class="text-xs text-white font-mono whitespace-nowrap">
            {{ timeText }}
          </div>
          
          <!-- Progress Bar -->
          <div class="flex-1 relative group/progress">
            <!-- Background Track (More Visible) -->
            <div class="h-1.5 bg-white/40 overflow-hidden transition-all duration-200 group-hover/progress:h-2">
              <!-- Buffered Progress -->
              <div 
                class="absolute top-0 left-0 h-full bg-white/60 transition-all duration-300"
                :style="{ width: (bufferedPercentage || 0) + '%' }"
              ></div>
              <!-- Current Progress -->
              <div 
                class="absolute top-0 left-0 h-full transition-all duration-150"
                :style="{ 
                  width: progressPercent + '%',
                  backgroundColor: themeColor
                }"
              ></div>
            </div>
            
            <!-- Invisible Input for Seeking -->
            <input
              type="range"
              min="0"
              :max="duration || 0"
              step="0.1"
              class="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
              :value="currentTime"
              @input="onSeekInput"
              @change="onSeekCommit"
              aria-label="วิดีโอเซีก"
            />
          </div>
        </div>

        <!-- Right Controls -->
        <div class="flex items-center space-x-2">
          <!-- Volume Control Section -->
          <div class="flex items-center space-x-2">
            <!-- Volume Button -->
            <button 
              class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
              @click.stop="toggleMute" 
              :aria-label="volumeLevel === 'muted' ? 'เปิดเสียง' : 'ปิดเสียง'"
            >
              <svg v-if="volumeLevel === 'muted'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                <path d="M20 10l-2.12 2.12 2.12 2.12L18.5 15.66l-2.12-2.12L14.26 15.66 12.84 14.24l2.12-2.12L12.84 9.98 14.26 8.56l2.12 2.12L18.5 8.56z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            
            <!-- Volume Slider -->
            <div class="relative w-12">
              <!-- Volume Track -->
              <div class="h-1.5 bg-white/40 overflow-hidden">
                <!-- Volume Fill -->
                <div 
                  class="h-full transition-all duration-150"
                  :style="{ 
                    width: (volumeLevel === 'muted' ? 0 : volume * 100) + '%',
                    backgroundColor: volumeLevel === 'muted' ? '#6b7280' : themeColor
                  }"
                ></div>
              </div>
              <!-- Invisible Volume Slider -->
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="absolute inset-0 w-full h-6 opacity-0 cursor-pointer volume-slider"
                :value="volume"
                @input="onVolumeChange"
                aria-label="ระดับเสียง"
              />
            </div>
          </div>

          <!-- Quality Display -->
          <div v-if="showQualitySelector && showQuality && canSelectQuality" class="relative">
            <button 
              class="px-2 py-1 hover:bg-white/20 rounded text-xs font-medium transition-all duration-200"
              @click.stop="showSettingsDropdown = !showSettingsDropdown"
              aria-label="ความละเอียด"
            >
              {{ currentQualityLabel || 'AUTO' }}
            </button>
            
            <!-- Settings Panel -->
            <div v-if="showSettingsDropdown" 
                 class="absolute right-0 bottom-8 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg py-2 z-50 min-w-32 border border-white/10"
                 @click.stop>
              <div class="text-xs text-gray-400 px-3 py-2">Quality</div>
              <div>
                <button
                  v-for="opt in qualityOptionsWithAuto"
                  :key="opt.value"
                  class="w-full text-left px-3 py-1 text-sm transition-colors"
                  :class="selectedQuality === String(opt.value) ? 'text-white' : ''"
                  :style="{
                    backgroundColor: selectedQuality === String(opt.value) ? `${themeColor}80` : 'transparent',
                    color: selectedQuality === String(opt.value) ? '#fff' : '#fff'
                  }"
                  @click="selectQuality(opt.value)"
                  @mouseenter="$event.target.style.backgroundColor = selectedQuality === String(opt.value) ? `${themeColor}80` : `${themeColor}30`"
                  @mouseleave="$event.target.style.backgroundColor = selectedQuality === String(opt.value) ? `${themeColor}80` : 'transparent'"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Fullscreen Button -->
          <button 
            v-if="showFullscreenButton"
            class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
            @click.stop="toggleFullscreen" 
            :aria-label="isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'"
          >
            <svg v-if="!isFullscreen" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16H8V18H5V16ZM5 6H8V8H5V6ZM16 18H19V16H16V18ZM16 8H19V6H16V8ZM10 14H14V10H10V14Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* global defineProps, defineEmits, defineExpose */
import { useHlsPlayer } from './composables/useHlsPlayer';

const props = defineProps({
  src: { type: String, required: true },
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  loop: { type: Boolean, default: false },
  poster: { type: String, default: '' },
  preload: { type: String, default: 'metadata' },
  height: { type: [String, Number], default: 400 },
  objectFit: { type: String, default: 'contain' },
  showQuality: { type: Boolean, default: true },
  showSpeed: { type: Boolean, default: true },
  speeds: { type: Array, default: () => [0.5, 0.75, 1, 1.25, 1.5, 2] },
  
  // Custom Config Options
  showBigPlayButton: { type: Boolean, default: true },
  showQualitySelector: { type: Boolean, default: true },
  showFullscreenButton: { type: Boolean, default: true },
  showSkipButtons: { type: Boolean, default: true },
  themeColor: { type: String, default: '#3b82f6' }, // Default blue-500
  
  // Overlay Label Options
  overlayLabel: { type: String, default: '' },
  overlaySubtitle: { type: String, default: '' },
  showOverlayLabel: { type: Boolean, default: false },
});

const emit = defineEmits([
  'error', 
  'quality-changed', 
  'rate-changed',
  // Player Events for Parent Integration
  'ready',
  'play',
  'pause', 
  'stop',
  'time-update',
  'seek',
]);

const player = useHlsPlayer(props, emit);
const {
  videoEl,
  containerEl,
  isPlaying,
  volume,
  duration,
  currentTime,
  isFullscreen,
  isCustomFullscreen,
  showSettingsDropdown,
  uiVisible,
  selectedQuality,
  computedStyle,
  canSelectQuality,
  qualityOptionsWithAuto,
  currentQualityLabel,
  volumeLevel,
  timeText,
  progressPercent,
  bufferedPercentage,
  containerStyle,
  togglePlay,
  play,
  pause,
  stop,
  jumpTo,
  changeSource,
  skipBackward,
  skipForward,
  onSeekInput,
  onSeekCommit,
  toggleMute,
  onVolumeChange,
  toggleFullscreen,
  selectQuality,
  showUiTemporarily,
  hideUiAfterDelay,
  closeAllDropdowns,
} = player;

// Expose methods for parent component control
defineExpose({
  play,
  pause,
  stop,
  jumpTo,
  changeSource,
  togglePlay,
  skipBackward,
  skipForward,
  toggleMute,
  toggleFullscreen,
  // Video element properties
  get videoElement() { return videoEl.value; },
  get isPlaying() { return isPlaying.value; },
  get currentTime() { return currentTime.value; },
  get duration() { return duration.value; },
  get volume() { return volume.value; },
});

// Utility function to darken color for hover effects
const darkenColor = (color) => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Darken by 20%
  const factor = 0.8;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

</script>

<style scoped>
/* Simple, clean styling */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  margin-top: -5px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

/* Volume slider */
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #ffffff;
  margin-top: -4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Clean track styling */
input[type="range"]::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  height: 2px;
}

input[type="range"]::-moz-range-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  height: 2px;
  border: none;
}

/* Remove border radius in fullscreen */
.group[style*="position: fixed"] {
  border-radius: 0 !important;
}

.group[style*="position: fixed"] video {
  border-radius: 0 !important;
}
</style>
