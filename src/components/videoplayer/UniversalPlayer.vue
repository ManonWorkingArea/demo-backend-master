<template>
  <!-- Gentle Security Notice (แทนที่ Player ทั้งหมด) -->
  <div 
    v-if="isCheatingDetected"
    class="relative group select-none bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden"
    :style="containerStyle"
  >
    <div class="flex flex-col items-center justify-center h-full min-h-[400px] p-12 text-center">
      <!-- Simple Icon -->
      <svg class="w-16 h-16 mx-auto mb-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.4 14.4,13 13.5,13H10.5C9.6,13 9.2,12.4 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.8H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
      </svg>
      
      <!-- Gentle Message -->
      <h2 class="text-3xl font-light text-slate-700 mb-3 tracking-wide">ระบบรักษาความปลอดภัย</h2>
      <div class="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mb-8 rounded-full"></div>
      
      <!-- Info Content -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-white/50 max-w-lg mx-auto shadow-xl">
        <div class="text-lg text-slate-600 font-light text-center leading-relaxed space-y-4">
          <p class="text-slate-700">
            เพื่อรักษาคุณภาพและความปลอดภัยของเนื้อหา
          </p>
          <p class="text-base text-slate-500">
            โปรดใช้งานผ่านระบบมาตรฐานเท่านั้น
          </p>
          
          <!-- Support Info -->
          <div class="mt-6 pt-6 border-t border-slate-200">
            <p class="text-sm text-slate-400 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              หากมีปัญหา กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal Player (แสดงเฉพาะเมื่อไม่มีการโกง) -->
  <div 
    v-else
    ref="containerEl" 
    class="relative group select-none bg-black overflow-hidden"
    :style="containerStyle"
    @mousemove="showUiTemporarily" 
    @mouseleave="hideUiAfterDelay" 
    @click="closeAllDropdowns"
    @contextmenu.prevent>

    <video
      ref="videoEl"
      :poster="computedPoster"
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

    <!-- Cover Image Overlay (เต็มพื้นที่) -->
    <div 
      v-if="computedPoster && !isPlaying && !isCustomFullscreen"
      class="absolute inset-0 z-5 pointer-events-none transition-opacity duration-300"
      :class="{ 'opacity-100': !isPlaying, 'opacity-0': isPlaying }"
      :style="{
        backgroundImage: `url(${computedPoster})`,
        backgroundSize: coverObjectFit || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }"
    ></div>

    <!-- Loading indicator สำหรับ auto cover -->
    <div 
      v-if="autoCover && isCoverLoading && !computedPoster && !isPlaying"
      class="absolute inset-0 z-4 flex items-center justify-center bg-black/50 transition-opacity duration-300"
    >
      <div class="text-white text-sm opacity-70">
        <svg class="animate-spin h-6 w-6 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        กำลังโหลด Cover...
      </div>
    </div>

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

    <!-- Logo (Dynamic Position) -->
    <div 
      v-if="logoSettings.show && logoSettings.url"
      class="absolute z-20 pointer-events-none transition-all duration-300"
      :class="[
        logoPositionClass,
        {
          'opacity-0 translate-y-[-8px]': isPlaying && !uiVisible && !logoSettings.alwaysShow,
          'opacity-100 translate-y-0': !isPlaying || uiVisible || logoSettings.alwaysShow
        }
      ]"
    >
      <div 
        class="bg-black/50 backdrop-blur-sm rounded-lg p-2 shadow-lg"
        :class="logoSettings.backgroundClass"
      >
        <img 
          :src="logoSettings.url" 
          :alt="logoSettings.alt"
          class="block object-contain"
          :style="{ 
            width: logoSettings.width, 
            height: logoSettings.height,
            maxWidth: logoSettings.maxWidth,
            maxHeight: logoSettings.maxHeight
          }"
          @error="onLogoError"
        />
      </div>
    </div>

    <!-- Canvas Watermark Overlay (Enhanced Anti-Screen Recording Protection) -->
    <div 
      v-if="showWatermark && (watermarkText || watermarkTitle || watermarkSubtitle) && isPlaying"
      ref="watermarkEl"
      class="absolute inset-0 z-10 pointer-events-none select-none flex items-center justify-center transition-opacity duration-500"
    >
      <!-- Canvas Watermark (Cannot be modified via CSS/DOM) -->
      <canvas
        ref="watermarkCanvasEl"
        data-watermark="canvas"
        class="pointer-events-none select-none"
        :style="{
          opacity: watermarkOpacity,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }"
      ></canvas>
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
      <div class="bg-black/70 px-6 py-2 pointer-events-auto w-full rounded-lg">
        <!-- Desktop Layout: Single Row -->
        <div class="hidden md:flex items-center space-x-3">
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

            <!-- Picture-in-Picture Button -->
            <button 
              v-if="showPipButton && canPictureInPicture"
              class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
              @click.stop="togglePictureInPicture" 
              :aria-label="isPictureInPicture ? 'ออกจาก Picture-in-Picture' : 'Picture-in-Picture'"
            >
              <svg v-if="!isPictureInPicture" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                <path d="M14 14h-4v-4h4v4z"/>
              </svg>
            </button>

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

        <!-- Mobile Layout: Two Rows -->
        <div class="md:hidden space-y-3">
          <!-- Row 1: Control Buttons -->
          <div class="flex items-center justify-between">
            <!-- Left Controls -->
            <div class="flex items-center space-x-2">
              <!-- Play/Pause Button -->
              <button 
                class="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200" 
                :style="{ backgroundColor: themeColor }"
                @click.stop="togglePlay" 
                :aria-label="isPlaying ? 'หยุดชั่วคราว' : 'เล่น'"
              >
                <svg v-if="!isPlaying" class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                </svg>
              </button>

              <!-- -10 Button -->
              <button 
                v-if="showSkipButtons"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="skipBackward" 
                aria-label="ย้อนกลับ 10 วินาที"
              >
                <span class="text-white text-xs font-bold">-10</span>
              </button>

              <!-- +10 Button -->
              <button 
                v-if="showSkipButtons"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="skipForward" 
                aria-label="กรอไปข้างหน้า 10 วินาที"
              >
                <span class="text-white text-xs font-bold">10+</span>
              </button>

              <!-- Time Display -->
              <div class="text-xs text-white font-mono whitespace-nowrap ml-2">
                {{ timeText }}
              </div>
            </div>

            <!-- Right Controls -->
            <div class="flex items-center space-x-2">
              <!-- Volume Button -->
              <button 
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="toggleMute" 
                :aria-label="volumeLevel === 'muted' ? 'เปิดเสียง' : 'ปิดเสียง'"
              >
                <svg v-if="volumeLevel === 'muted'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                  <path d="M20 10l-2.12 2.12 2.12 2.12L18.5 15.66l-2.12-2.12L14.26 15.66 12.84 14.24l2.12-2.12L12.84 9.98 14.26 8.56l2.12 2.12L18.5 8.56z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>

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

              <!-- Picture-in-Picture Button -->
              <button 
                v-if="showPipButton && canPictureInPicture"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="togglePictureInPicture" 
                :aria-label="isPictureInPicture ? 'ออกจาก Picture-in-Picture' : 'Picture-in-Picture'"
              >
                <svg v-if="!isPictureInPicture" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                  <path d="M14 14h-4v-4h4v4z"/>
                </svg>
              </button>

              <!-- Fullscreen Button -->
              <button 
                v-if="showFullscreenButton"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="toggleFullscreen" 
                :aria-label="isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'"
              >
                <svg v-if="!isFullscreen" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16H8V18H5V16ZM5 6H8V8H5V6ZM16 18H19V16H16V18ZM16 8H19V6H16V8ZM10 14H14V10H10V14Z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Row 2: Progress & Volume Bar -->
          <div class="flex items-center space-x-3">
            <!-- Progress Bar -->
            <div class="flex-1 relative group/progress">
              <!-- Background Track -->
              <div class="h-2 bg-white/40 overflow-hidden transition-all duration-200 group-hover/progress:h-2.5 rounded-full">
                <!-- Buffered Progress -->
                <div 
                  class="absolute top-0 left-0 h-full bg-white/60 transition-all duration-300 rounded-full"
                  :style="{ width: (bufferedPercentage || 0) + '%' }"
                ></div>
                <!-- Current Progress -->
                <div 
                  class="absolute top-0 left-0 h-full transition-all duration-150 rounded-full"
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
                class="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                :value="currentTime"
                @input="onSeekInput"
                @change="onSeekCommit"
                aria-label="วิดีโอเซีก"
              />
            </div>

            <!-- Volume Slider -->
            <div class="relative w-16">
              <!-- Volume Track -->
              <div class="h-2 bg-white/40 overflow-hidden rounded-full">
                <!-- Volume Fill -->
                <div 
                  class="h-full transition-all duration-150 rounded-full"
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
                class="absolute inset-0 w-full h-8 opacity-0 cursor-pointer volume-slider"
                :value="volume"
                @input="onVolumeChange"
                aria-label="ระดับเสียง"
              />
            </div>
          </div>
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
      <div class="bg-black/70 px-6 py-2 pointer-events-auto w-full rounded-lg">
        <!-- Desktop Layout: Single Row -->
        <div class="hidden md:flex items-center space-x-3">
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

            <!-- Picture-in-Picture Button -->
            <button 
              v-if="showPipButton && canPictureInPicture"
              class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
              @click.stop="togglePictureInPicture" 
              :aria-label="isPictureInPicture ? 'ออกจาก Picture-in-Picture' : 'Picture-in-Picture'"
            >
              <svg v-if="!isPictureInPicture" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                <path d="M14 14h-4v-4h4v4z"/>
              </svg>
            </button>

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

        <!-- Mobile Layout: Two Rows -->
        <div class="md:hidden space-y-3">
          <!-- Row 1: Control Buttons -->
          <div class="flex items-center justify-between">
            <!-- Left Controls -->
            <div class="flex items-center space-x-2">
              <!-- Play/Pause Button -->
              <button 
                class="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200" 
                :style="{ backgroundColor: themeColor }"
                @click.stop="togglePlay" 
                :aria-label="isPlaying ? 'หยุดชั่วคราว' : 'เล่น'"
              >
                <svg v-if="!isPlaying" class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                </svg>
              </button>

              <!-- -10 Button -->
              <button 
                v-if="showSkipButtons"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="skipBackward" 
                aria-label="ย้อนกลับ 10 วินาที"
              >
                <span class="text-white text-xs font-bold">-10</span>
              </button>

              <!-- +10 Button -->
              <button 
                v-if="showSkipButtons"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="skipForward" 
                aria-label="กรอไปข้างหน้า 10 วินาที"
              >
                <span class="text-white text-xs font-bold">10+</span>
              </button>

              <!-- Time Display -->
              <div class="text-xs text-white font-mono whitespace-nowrap ml-2">
                {{ timeText }}
              </div>
            </div>

            <!-- Right Controls -->
            <div class="flex items-center space-x-2">
              <!-- Volume Button -->
              <button 
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="toggleMute" 
                :aria-label="volumeLevel === 'muted' ? 'เปิดเสียง' : 'ปิดเสียง'"
              >
                <svg v-if="volumeLevel === 'muted'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                  <path d="M20 10l-2.12 2.12 2.12 2.12L18.5 15.66l-2.12-2.12L14.26 15.66 12.84 14.24l2.12-2.12L12.84 9.98 14.26 8.56l2.12 2.12L18.5 8.56z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>

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

              <!-- Picture-in-Picture Button -->
              <button 
                v-if="showPipButton && canPictureInPicture"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="togglePictureInPicture" 
                :aria-label="isPictureInPicture ? 'ออกจาก Picture-in-Picture' : 'Picture-in-Picture'"
              >
                <svg v-if="!isPictureInPicture" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                  <path d="M14 14h-4v-4h4v4z"/>
                </svg>
              </button>

              <!-- Fullscreen Button -->
              <button 
                v-if="showFullscreenButton"
                class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                @click.stop="toggleFullscreen" 
                :aria-label="isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'"
              >
                <svg v-if="!isFullscreen" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16H8V18H5V16ZM5 6H8V8H5V6ZM16 18H19V16H16V18ZM16 8H19V6H16V8ZM10 14H14V10H10V14Z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Row 2: Progress & Volume Bar -->
          <div class="flex items-center space-x-3">
            <!-- Progress Bar -->
            <div class="flex-1 relative group/progress">
              <!-- Background Track -->
              <div class="h-2 bg-white/40 overflow-hidden transition-all duration-200 group-hover/progress:h-2.5 rounded-full">
                <!-- Buffered Progress -->
                <div 
                  class="absolute top-0 left-0 h-full bg-white/60 transition-all duration-300 rounded-full"
                  :style="{ width: (bufferedPercentage || 0) + '%' }"
                ></div>
                <!-- Current Progress -->
                <div 
                  class="absolute top-0 left-0 h-full transition-all duration-150 rounded-full"
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
                class="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                :value="currentTime"
                @input="onSeekInput"
                @change="onSeekCommit"
                aria-label="วิดีโอเซีก"
              />
            </div>

            <!-- Volume Slider -->
            <div class="relative w-16">
              <!-- Volume Track -->
              <div class="h-2 bg-white/40 overflow-hidden rounded-full">
                <!-- Volume Fill -->
                <div 
                  class="h-full transition-all duration-150 rounded-full"
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
                class="absolute inset-0 w-full h-8 opacity-0 cursor-pointer volume-slider"
                :value="volume"
                @input="onVolumeChange"
                aria-label="ระดับเสียง"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useUniversalPlayer } from './composables/useUniversalPlayer';

const props = defineProps({
  src: { type: String, required: true },
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  loop: { type: Boolean, default: false },
  poster: { type: String, default: '' },
  coverUrl: { type: String, default: '' }, // URL สำหรับ cover image
  autoCover: { type: Boolean, default: true }, // ดึง cover อัตโนมัติจาก video
  coverObjectFit: { type: String, default: 'cover' }, // object-fit สำหรับ cover
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
  showPipButton: { type: Boolean, default: true },
  showSkipButtons: { type: Boolean, default: true },
  themeColor: { type: String, default: '#3b82f6' }, // Default blue-500
  
  // Overlay Label Options
  overlayLabel: { type: String, default: '' },
  overlaySubtitle: { type: String, default: '' },
  showOverlayLabel: { type: Boolean, default: false },
  
  // Logo Options (Object format)
  logo: { 
    type: Object, 
    default: () => ({
      show: false,
      url: '',
      alt: 'Logo',
      width: '60px',
      height: '30px',
      maxWidth: '100px',
      maxHeight: '50px',
      backgroundClass: '',
      alwaysShow: false,
      position: 'top-right' // top-left, top-right, bottom-left, bottom-right
    })
  },
  
  // Legacy Logo Options (for backward compatibility)
  showLogo: { type: Boolean, default: false },
  logoUrl: { type: String, default: '' },
  logoAlt: { type: String, default: 'Logo' },
  logoWidth: { type: String, default: '60px' },
  logoHeight: { type: String, default: '30px' },
  logoMaxWidth: { type: String, default: '100px' },
  logoMaxHeight: { type: String, default: '50px' },
  logoBackgroundClass: { type: String, default: '' },
  alwaysShowLogo: { type: Boolean, default: false },
  
  // Watermark Text Overlay Options (Anti-Screen Recording Protection)
  showWatermark: { type: Boolean, default: false },
  watermarkTitle: { type: String, default: '' }, // หัวข้อหลัก
  watermarkText: { type: String, default: '' }, // ข้อความกลาง
  watermarkSubtitle: { type: String, default: '' }, // ข้อความรอง
  watermarkOpacity: { type: String, default: '0.15' }, // ความโปร่งใส
  watermarkFontSize: { type: String, default: '16px' },
  watermarkColor: { type: String, default: '#ffffff' }, // สี watermark
  watermarkFontFamily: { type: String, default: 'Arial, sans-serif' },
  watermarkRotation: { type: Number, default: -20 }, // มุมหมุน (องศา)
  watermarkTextShadow: { type: String, default: '1px 1px 2px rgba(0,0,0,0.5)' },
  watermarkClass: { type: String, default: '' },
  watermarkContainerClass: { type: String, default: '' },
  watermarkPattern: { type: String, default: 'grid' }, // 'grid', 'diagonal', 'center', 'random'
  watermarkSpacing: { type: Number, default: 200 }, // ระยะห่างระหว่าง watermark (px)
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
  // Picture-in-Picture Events
  'enter-pip',
  'leave-pip',
  'pip-error',
  // Logo Events
  'logo-error',
  // Video Element Events (from useUniversalPlayer)
  'seeking',
  'seeked',
  'waiting',
  'canplay',
  'progress',
  'loadstart',
  'loadedmetadata',
  'loadeddata',
  'ended',
  'stalled',
  'suspend',
  'abort',
  'emptied',
  'durationchange',
  'ratechange',
  'volumechange',
  // Chunk detection events
  'chunk-request',
  'hls-fragment-loading',
  'hls-fragment-loaded', 
  'range-request',
  'progress-chunk-loaded',
  'chunk-loading-prediction',
  'video-waiting-for-chunk',
  'video-resumed-after-chunk',
]);

const player = useUniversalPlayer(props, emit);
const {
  videoEl,
  containerEl,
  isPlaying,
  volume,
  duration,
  currentTime,
  isFullscreen,
  isCustomFullscreen,
  isPictureInPicture,
  showSettingsDropdown,
  uiVisible,
  selectedQuality,
  computedStyle,
  canSelectQuality,
  canPictureInPicture,
  qualityOptionsWithAuto,
  currentQualityLabel,
  volumeLevel,
  timeText,
  progressPercent,
  bufferedPercentage,
  containerStyle,
  computedPoster,
  isCoverLoading,
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
  togglePictureInPicture,
  enterPictureInPicture,
  exitPictureInPicture,
  selectQuality,
  showUiTemporarily,
  hideUiAfterDelay,
  closeAllDropdowns,
  hls, // เพิ่ม hls จาก useUniversalPlayer
} = player;

// Watermark Element Reference and Monitoring
const watermarkEl = ref(null);
const watermarkCanvasEl = ref(null);
const isCheatingDetected = ref(false);

// เก็บ reference ของ watermark text เดิมเพื่อเปรียบเทียบ
const originalWatermarkContent = ref({
  title: '',
  text: '',
  subtitle: '',
  hash: '' // hash ของเนื้อหาทั้งหมดเพื่อตรวจสอบการเปลี่ยนแปลง
});

// เก็บ Canvas ImageData เดิมเพื่อเปรียบเทียบ
const originalCanvasImageData = ref(null);

// Function to create hash of watermark content
const createWatermarkHash = (title, text, subtitle) => {
  const content = `${title}|${text}|${subtitle}`;
  // Simple hash function for content verification
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// 🎨 Canvas Watermark Functions (Enhanced Security)
const createCanvasWatermark = () => {
  if (!watermarkCanvasEl.value || !props.showWatermark) return;
  
  const canvas = watermarkCanvasEl.value;
  const ctx = canvas.getContext('2d');
  
  // กำหนดขนาด canvas ตามต้องการ
  const canvasWidth = 600;
  const canvasHeight = 300;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // ตั้งค่าฟอนต์และสี
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = props.watermarkColor || '#ffffff';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 2;
  
  let currentY = canvasHeight / 2 - 40;
  
  // วาด Main Title
  if (props.watermarkTitle) {
    const titleSize = parseInt(props.watermarkFontSize) || 48;
    ctx.font = `bold ${titleSize}px "Arial Black", sans-serif`;
    ctx.letterSpacing = '4px';
    
    // Text shadow effect
    ctx.strokeText(props.watermarkTitle, canvasWidth / 2, currentY);
    ctx.fillText(props.watermarkTitle, canvasWidth / 2, currentY);
    
    currentY += titleSize + 20;
  }
  
  // วาด Main Text
  if (props.watermarkText) {
    const textSize = (parseInt(props.watermarkFontSize) || 48) * 0.8;
    ctx.font = `bold ${textSize}px "Arial Black", sans-serif`;
    ctx.letterSpacing = '3px';
    
    ctx.strokeText(props.watermarkText, canvasWidth / 2, currentY);
    ctx.fillText(props.watermarkText, canvasWidth / 2, currentY);
    
    currentY += textSize + 15;
  }
  
  // วาด Subtitle
  if (props.watermarkSubtitle) {
    const subtitleSize = (parseInt(props.watermarkFontSize) || 48) * 0.5;
    ctx.font = `${subtitleSize}px "Arial", sans-serif`;
    ctx.letterSpacing = '2px';
    
    ctx.strokeText(props.watermarkSubtitle, canvasWidth / 2, currentY);
    ctx.fillText(props.watermarkSubtitle, canvasWidth / 2, currentY);
  }
  
  // เพิ่มการป้องกันเพิ่มเติม: เพิ่ม timestamp และ random elements
  const timestamp = new Date().toLocaleTimeString();
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText(`Generated: ${timestamp}`, canvasWidth / 2, canvasHeight - 20);
  
  // บันทึก ImageData เดิมเพื่อเปรียบเทียบ
  originalCanvasImageData.value = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  
  console.log('🎨 Canvas Watermark สร้างเสร็จแล้ว:', {
    size: `${canvasWidth}x${canvasHeight}`,
    title: props.watermarkTitle || '(ไม่มี)',
    text: props.watermarkText || '(ไม่มี)',
    subtitle: props.watermarkSubtitle || '(ไม่มี)',
    timestamp
  });
};

// Function to check canvas watermark integrity
const checkCanvasWatermarkIntegrity = () => {
  if (!watermarkCanvasEl.value || !originalCanvasImageData.value) {
    return true; // ยังไม่พร้อม ให้ผ่านไปก่อน
  }
  
  try {
    const canvas = watermarkCanvasEl.value;
    const ctx = canvas.getContext('2d');
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // เปรียบเทียบ ImageData
    if (currentImageData.data.length !== originalCanvasImageData.value.data.length) {
      console.warn('⚠️ Canvas watermark ขนาดเปลี่ยนแปลง');
      return false;
    }
    
    // เปรียบเทียบ pixel data (ตัวอย่าง sampling เพื่อ performance)
    const sampleRate = 100; // เช็คทุก 100 pixels
    for (let i = 0; i < currentImageData.data.length; i += sampleRate * 4) {
      if (currentImageData.data[i] !== originalCanvasImageData.value.data[i] ||
          currentImageData.data[i + 1] !== originalCanvasImageData.value.data[i + 1] ||
          currentImageData.data[i + 2] !== originalCanvasImageData.value.data[i + 2] ||
          currentImageData.data[i + 3] !== originalCanvasImageData.value.data[i + 3]) {
        console.warn('⚠️ Canvas watermark pixel data ถูกเปลี่ยนแปลง');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking canvas watermark integrity:', error);
    return true; // ในกรณี error ให้ผ่านเพื่อไม่ให้เกิด false positive
  }
};

// Function to initialize watermark content reference
const initializeWatermarkContent = () => {
  if (props.showWatermark && (props.watermarkTitle || props.watermarkText || props.watermarkSubtitle)) {
    const title = props.watermarkTitle || '';
    const text = props.watermarkText || '';
    const subtitle = props.watermarkSubtitle || '';
    
    originalWatermarkContent.value = {
      title,
      text,
      subtitle,
      hash: createWatermarkHash(title, text, subtitle)
    };
    
    console.log('🔒 บันทึก Watermark content เดิม:', {
      title: title ? `"${title}"` : '(ไม่มี)',
      text: text ? `"${text}"` : '(ไม่มี)', 
      subtitle: subtitle ? `"${subtitle}"` : '(ไม่มี)',
      hash: originalWatermarkContent.value.hash
    });
    
    // สร้าง Canvas Watermark หลังจากเก็บ content แล้ว
    nextTick(() => {
      setTimeout(() => {
        createCanvasWatermark();
      }, 100);
    });
  }
};

// Function to check watermark CSS styles integrity (ปรับปรุงให้ยืดหยุ่นขึ้น)
const checkWatermarkStyles = (currentWatermarkEl) => {
  try {
    const computedStyles = window.getComputedStyle(currentWatermarkEl);
    
    // ตรวจสอบ CSS properties ที่สำคัญ (เพิ่ม Advanced CSS properties)
    const styleChecks = {
      display: computedStyles.display,
      visibility: computedStyles.visibility,
      opacity: parseFloat(computedStyles.opacity),
      position: computedStyles.position,
      zIndex: parseInt(computedStyles.zIndex) || 0,
      pointerEvents: computedStyles.pointerEvents,
      transform: computedStyles.transform,
      width: computedStyles.width,
      height: computedStyles.height,
      // เพิ่มการตรวจสอบ Advanced CSS properties
      clipPath: computedStyles.clipPath,
      filter: computedStyles.filter,
      overflow: computedStyles.overflow,
      maxWidth: computedStyles.maxWidth,
      maxHeight: computedStyles.maxHeight
    };
    
    // กำหนดเงื่อนไขที่ถือว่า watermark ถูกซ่อนอย่างชัดเจน (เดิม)
    const isObviouslyHidden = 
      styleChecks.display === 'none' ||
      styleChecks.visibility === 'hidden' ||
      styleChecks.opacity === 0 || // เฉพาะ opacity = 0 เท่านั้น (ไม่ใช่ค่าต่ำ)
      styleChecks.width === '0px' ||
      styleChecks.height === '0px';
    
    // *** เพิ่มการตรวจสอบ Advanced CSS Hiding Techniques ***
    
    // 1. Clip-path polygon(0 0, 0 0, 0 0, 0 0) - ทำให้ element หายไป
    const isSuspiciousClipPath = 
      styleChecks.clipPath !== 'none' && (
        styleChecks.clipPath.includes('polygon(0px 0px, 0px 0px, 0px 0px, 0px 0px)') ||
        styleChecks.clipPath.includes('polygon(0 0, 0 0, 0 0, 0 0)') ||
        styleChecks.clipPath.includes('polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)') ||
        styleChecks.clipPath.includes('circle(0)') ||
        styleChecks.clipPath.includes('inset(100%)')
      );
    
    // 2. Filter opacity(0) - ซ่อนด้วย CSS filter
    const isSuspiciousFilter = 
      styleChecks.filter !== 'none' && (
        styleChecks.filter.includes('opacity(0)') ||
        styleChecks.filter.includes('opacity(0%)') ||
        styleChecks.filter.includes('brightness(0)') ||
        styleChecks.filter.includes('contrast(0)')
      );
    
    // 3. Transform translateZ(-9999px) - ย้ายไปมิติ Z ที่ไกลมาก + เดิม
    const obviousSuspiciousTransforms = [
      'scale(0)',
      'scaleX(0)', 
      'scaleY(0)',
      'translate(-9999px',
      'translate3d(-9999px',
      // เพิ่ม Advanced 3D Transform hiding
      'translateZ(-9999',
      'translate3d(-9999',
      'rotateX(90deg)',
      'rotateY(90deg)',
      'rotateX(-90deg)',
      'rotateY(-90deg)'
    ];
    
    const hasObviousSuspiciousTransform = obviousSuspiciousTransforms.some(transform => 
      styleChecks.transform.includes(transform)
    );
    
    // 4. Overflow hidden + zero dimension combinations
    const isSuspiciousOverflow = 
      styleChecks.overflow === 'hidden' && (
        styleChecks.maxWidth === '0px' ||
        styleChecks.maxHeight === '0px' ||
        (styleChecks.width === '0px' && styleChecks.height === '0px')
      );
    
    // ตรวจสอบการย้ายออกจอที่ชัดเจน (เดิม)
    const isMovedOffScreen = 
      computedStyles.left === '-9999px' ||
      computedStyles.top === '-9999px' ||
      computedStyles.right === '-9999px' ||
      computedStyles.bottom === '-9999px';
    
    // รวมการตรวจสอบ advanced techniques
    const hasAdvancedHiding = 
      isSuspiciousClipPath ||
      isSuspiciousFilter ||
      isSuspiciousOverflow;
    
    if (isObviouslyHidden || hasObviousSuspiciousTransform || isMovedOffScreen || hasAdvancedHiding) {
      console.warn('⚠️ Watermark ถูกซ่อนด้วย CSS (รวม Advanced Techniques):', {
        basicHiding: isObviouslyHidden,
        suspiciousTransform: hasObviousSuspiciousTransform,
        movedOffScreen: isMovedOffScreen,
        advancedHiding: hasAdvancedHiding,
        details: {
          suspiciousClipPath: isSuspiciousClipPath,
          suspiciousFilter: isSuspiciousFilter,
          suspiciousOverflow: isSuspiciousOverflow,
          clipPath: styleChecks.clipPath,
          filter: styleChecks.filter,
          overflow: styleChecks.overflow,
          maxWidth: styleChecks.maxWidth,
          maxHeight: styleChecks.maxHeight
        },
        styles: styleChecks,
        timestamp: new Date().toLocaleTimeString()
      });
      return false;
    }
    
    // ตรวจสอบ z-index ที่ต่ำผิดปกติ (แต่ยอมให้เป็น 0 หรือบวก)
    const isZIndexSuspicious = styleChecks.zIndex < -10; // ยอมให้ติดลบเล็กน้อยได้
    
    if (isZIndexSuspicious) {
      console.warn('⚠️ Watermark z-index ต่ำผิดปกติ:', {
        zIndex: styleChecks.zIndex,
        timestamp: new Date().toLocaleTimeString()
      });
      return false;
    }
    
    // ปล่อยให้ผ่านสำหรับการปรับแต่ง CSS ที่ไม่ได้ซ่อนอย่างชัดเจน
    console.log('✅ Watermark CSS styles ปกติ (รวม Advanced CSS checks):', {
      display: styleChecks.display,
      visibility: styleChecks.visibility,
      opacity: styleChecks.opacity,
      clipPath: styleChecks.clipPath,
      filter: styleChecks.filter,
      transform: styleChecks.transform,
      overflow: styleChecks.overflow,
      zIndex: styleChecks.zIndex,
      timestamp: new Date().toLocaleTimeString()
    });
    
    return true;
    
  } catch (error) {
    console.warn('Error checking watermark styles:', error);
    return true; // ให้ผ่านในกรณี error เพื่อไม่ให้เกิด false positive
  }
};

// Function to check if watermark is actually visible on screen (ปรับปรุงให้ยืดหยุ่นขึ้น)
const checkWatermarkVisibility = (currentWatermarkEl) => {
  try {
    // ตรวจสอบ bounding rectangle
    const rect = currentWatermarkEl.getBoundingClientRect();
    
    // ตรวจสอบว่า element มีขนาดและไม่ถูกซ่อนด้วยวิธีที่ชัดเจน
    const hasValidSize = rect.width > 0 && rect.height > 0;
    
    if (!hasValidSize) {
      console.warn('⚠️ Watermark ไม่มีขนาดที่มองเห็นได้:', {
        rect: { width: rect.width, height: rect.height },
        timestamp: new Date().toLocaleTimeString()
      });
      return false;
    }
    
    // ตรวจสอบว่า watermark อยู่ใน container ของ video player หรือไม่
    // แทนที่จะตรวจสอบ viewport ทั้งหน้า
    const containerRect = containerEl.value?.getBoundingClientRect();
    if (!containerRect) {
      console.warn('⚠️ ไม่สามารถหา container element ได้');
      return true; // ให้ผ่านถ้าไม่สามารถตรวจสอบได้
    }
    
    // ตรวจสอบว่า watermark อยู่ใน container หรือไม่ (อนุญาตให้อยู่นอก viewport ได้)
    const isInContainer = rect.left >= containerRect.left - 50 && 
                         rect.right <= containerRect.right + 50 &&
                         rect.top >= containerRect.top - 50 && 
                         rect.bottom <= containerRect.bottom + 50;
    
    if (!isInContainer) {
      console.warn('⚠️ Watermark อยู่นอก video container:', {
        watermarkRect: { 
          left: rect.left, 
          right: rect.right, 
          top: rect.top, 
          bottom: rect.bottom 
        },
        containerRect: { 
          left: containerRect.left, 
          right: containerRect.right, 
          top: containerRect.top, 
          bottom: containerRect.bottom 
        },
        timestamp: new Date().toLocaleTimeString()
      });
      return false;
    }
    
    // ตรวจสอบว่าถูกบังด้วย element อื่นหรือไม่ (เฉพาะจุดกึ่งกลาง)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // ตรวจสอบเฉพาะเมื่อจุดกึ่งกลางอยู่ใน viewport
    const centerInViewport = centerX >= 0 && 
                            centerX <= window.innerWidth && 
                            centerY >= 0 && 
                            centerY <= window.innerHeight;
    
    if (centerInViewport) {
      const elementAtCenter = document.elementFromPoint(centerX, centerY);
      
      // ตรวจสอบว่า element ที่ center point เป็น watermark หรือ child ของมัน
      const isWatermarkVisible = elementAtCenter === currentWatermarkEl || 
                                currentWatermarkEl.contains(elementAtCenter) ||
                                elementAtCenter?.closest('[ref="watermarkEl"]') === currentWatermarkEl;
      
      if (!isWatermarkVisible && elementAtCenter) {
        // ให้ warning แต่ไม่ block ถ้าถูกบังด้วย UI elements ของ player
        const blockingElement = elementAtCenter.tagName || 'unknown';
        const isPlayerUI = elementAtCenter.closest('.group') === containerEl.value ||
                          elementAtCenter.classList.contains('absolute') ||
                          blockingElement.toLowerCase().includes('button') ||
                          blockingElement.toLowerCase().includes('control');
        
        if (!isPlayerUI) {
          console.warn('⚠️ Watermark ถูกบังด้วย element ที่น่าสงสัย:', {
            centerPoint: { x: centerX, y: centerY },
            elementAtCenter: blockingElement,
            elementAtCenterClass: elementAtCenter?.className || '',
            timestamp: new Date().toLocaleTimeString()
          });
          return false;
        } else {
          console.log('ℹ️ Watermark ถูกบังด้วย Player UI (ปกติ):', blockingElement);
        }
      }
    }
    
    console.log('✅ Watermark visibility ปกติ');
    return true;
    
  } catch (error) {
    console.warn('Error checking watermark visibility:', error);
    return true; // ให้ผ่านในกรณี error เพื่อไม่ให้เกิด false positive
  }
};
const checkWatermarkContent = (currentWatermarkEl) => {
  if (!originalWatermarkContent.value.hash) {
    return true; // ไม่มีเนื้อหาเดิมให้เปรียบเทียบ
  }
  
  try {
    // ตรวจสอบ Canvas Watermark แทน Text Elements
    const canvasElement = currentWatermarkEl.querySelector('[data-watermark="canvas"]');
    
    if (canvasElement) {
      // สำหรับ Canvas Watermark - ตรวจสอบ Canvas integrity
      const isCanvasValid = checkCanvasWatermarkIntegrity();
      
      if (!isCanvasValid) {
        console.warn('⚠️ Canvas Watermark ถูกเปลี่ยนแปลง:', {
          canvasExists: !!canvasElement,
          canvasWidth: canvasElement.width,
          canvasHeight: canvasElement.height,
          timestamp: new Date().toLocaleTimeString()
        });
        return false;
      }
      
      console.log('✅ Canvas Watermark ยังคงไม่เปลี่ยนแปลง');
      return true;
    } else {
      // Fallback: ตรวจสอบ Text Elements (สำหรับกรณีที่ยังใช้ text watermark)
      const titleElement = currentWatermarkEl.querySelector('[data-watermark="title"]') || 
                          currentWatermarkEl.querySelector('div:first-child');
      const textElement = currentWatermarkEl.querySelector('[data-watermark="text"]') || 
                         currentWatermarkEl.querySelector('div:nth-child(2)');
      const subtitleElement = currentWatermarkEl.querySelector('[data-watermark="subtitle"]') || 
                             currentWatermarkEl.querySelector('div:nth-child(3)');
      
      // ดึง text content ปัจจุบัน
      const currentTitle = titleElement?.textContent?.trim() || '';
      const currentText = textElement?.textContent?.trim() || '';
      const currentSubtitle = subtitleElement?.textContent?.trim() || '';
      
      // สร้าง hash ของเนื้อหาปัจจุบัน
      const currentHash = createWatermarkHash(currentTitle, currentText, currentSubtitle);
      
      // เปรียบเทียบกับเนื้อหาเดิม
      const isContentValid = currentHash === originalWatermarkContent.value.hash;
      
      if (!isContentValid) {
        console.warn('⚠️ Text Watermark content ถูกเปลี่ยนแปลง:', {
          original: {
            title: originalWatermarkContent.value.title,
            text: originalWatermarkContent.value.text,
            subtitle: originalWatermarkContent.value.subtitle,
            hash: originalWatermarkContent.value.hash
          },
          current: {
            title: currentTitle,
            text: currentText,
            subtitle: currentSubtitle,
            hash: currentHash
          },
          timestamp: new Date().toLocaleTimeString()
        });
        return false;
      }
      
      console.log('✅ Text Watermark content ยังคงไม่เปลี่ยนแปลง');
      return true;
    }
    
  } catch (error) {
    console.warn('Error checking watermark content:', error);
    return true; // ให้ผ่านในกรณี error เพื่อไม่ให้เกิด false positive
  }
};
const handleCheatingDetection = () => {
  // ป้องกันการเรียกซ้ำ
  if (isCheatingDetected.value) {
    return;
  }
  
  console.warn('🚨 ตรวจพบการโกง: Watermark element ถูกลบออกจาก DOM');
  
  // ตั้งสธานะการโกงทันที
  isCheatingDetected.value = true;
  
  try {
    // หยุดวิดีโอทันที
    if (videoEl.value) {
      videoEl.value.pause();
      videoEl.value.currentTime = 0;
    }
    
    // หยุด HLS ถ้ามี
    if (hls.value) {
      try {
        hls.value.destroy();
        hls.value = null;
      } catch (error) {
        console.warn('Error destroying HLS:', error);
      }
    }
    
    // หยุดการเล่น
    isPlaying.value = false;
    
    // Emit error event ไปยัง parent
    emit('error', {
      type: 'CHEATING_DETECTED',
      message: 'Watermark tampering detected - Video stopped for security',
      code: 'WATERMARK_REMOVED',
      timestamp: new Date().toISOString(),
      action: 'VIDEO_BLOCKED'
    });
    
    // Log รายละเอียดการโกง
    console.error('🛑 การเรียนถูกระงับ:', {
      reason: 'Watermark element removed from DOM',
      timestamp: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
  } catch (error) {
    console.error('Error in handleCheatingDetection:', error);
  }
};

// Function to check if watermark element exists in DOM (ปรับปรุงเพื่อความแม่นยำ + ตรวจสอบเนื้อหา)
const checkWatermarkInDOM = () => {
  // เช็คเฉพาะตอนที่ showWatermark = true และกำลังเล่นวิดีโออยู่เท่านั้น
  if (!props.showWatermark || !isPlaying.value || isCheatingDetected.value) {
    return true; // ไม่ต้องตรวจสอบ
  }

  // ให้ได้ reference ใหม่ในกรณีที่ element ถูก re-render
  const currentWatermarkEl = watermarkEl.value;
  
  if (!currentWatermarkEl) {
    // ถ้าไม่มี ref อาจเป็นเพราะ Vue กำลัง re-render หรือ element ยังไม่ถูกสร้าง
    console.log('⏳ Watermark ref ยังไม่พร้อม - รอ element ถูกสร้าง...');
    return true; // ให้โอกาสอีกครั้ง ไม่ถือว่าโกง
  }
  
  // ตรวจสอบหลายระดับเพื่อความแน่ใจ
  const isElementValid = currentWatermarkEl && 
                        currentWatermarkEl.nodeType === Node.ELEMENT_NODE &&
                        currentWatermarkEl.isConnected &&
                        document.contains(currentWatermarkEl);
  
  // ตรวจสอบว่า parent container ยังอยู่หรือไม่
  const isParentValid = containerEl.value && 
                       containerEl.value.isConnected && 
                       containerEl.value.contains(currentWatermarkEl);
  
  const watermarkExists = isElementValid && isParentValid;
  
  // ตรวจสอบเนื้อหา watermark (เพิ่มใหม่)
  const isContentValid = watermarkExists ? checkWatermarkContent(currentWatermarkEl) : false;
  
  // ตรวจสอบ CSS styles (เพิ่มใหม่)
  const isStylesValid = watermarkExists ? checkWatermarkStyles(currentWatermarkEl) : false;
  
  // ตรวจสอบการมองเห็นจริงบนหน้าจอ (เพิ่มใหม่)
  const isVisibilityValid = watermarkExists ? checkWatermarkVisibility(currentWatermarkEl) : false;
  
  const isWatermarkValid = watermarkExists && isContentValid && isStylesValid && isVisibilityValid;
  
  if (isWatermarkValid) {
    console.log('✅ Watermark element, เนื้อหา, CSS และการมองเห็นยังปกติ:', {
      element: currentWatermarkEl.tagName,
      isConnected: currentWatermarkEl.isConnected,
      parentValid: isParentValid,
      contentValid: isContentValid,
      stylesValid: isStylesValid,
      visibilityValid: isVisibilityValid,
      timestamp: new Date().toLocaleTimeString()
    });
    return true;
  } else {
    // ระบุสาเหตุที่ล้มเหลวอย่างละเอียด
    let failureReason = 'UNKNOWN';
    if (!watermarkExists) failureReason = 'DOM_REMOVED';
    else if (!isContentValid) failureReason = 'CONTENT_MODIFIED';
    else if (!isStylesValid) failureReason = 'CSS_HIDDEN';
    else if (!isVisibilityValid) failureReason = 'VISIBILITY_BLOCKED';
    
    // ตรวจสอบซ้ำด้วยความระมัดระวังมากขึ้น
    console.warn(`⚠️ Watermark validation failed (${failureReason}) - เริ่มกระบวนการตรวจสอบซ้ำ...`, {
      refExists: !!currentWatermarkEl,
      isConnected: currentWatermarkEl?.isConnected || false,
      isElementValid,
      isParentValid,
      contentValid: isContentValid,
      stylesValid: isStylesValid,
      visibilityValid: isVisibilityValid,
      showWatermark: props.showWatermark,
      isPlaying: isPlaying.value,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // ใช้ Promise เพื่อตรวจสอบซ้ำหลายครั้งก่อนตัดสิน
    return new Promise((resolve) => {
      let recheckCount = 0;
      const maxRechecks = 3; // ตรวจสอบซ้ำสูงสุด 3 ครั้ง
      
      const recheckInterval = setInterval(() => {
        recheckCount++;
        const recheckEl = watermarkEl.value;
        const recheckExists = recheckEl && 
                             recheckEl.isConnected && 
                             document.contains(recheckEl) &&
                             containerEl.value?.contains(recheckEl);
        
        // ตรวจสอบเนื้อหาและ CSS ใหม่
        const recheckContentValid = recheckExists ? checkWatermarkContent(recheckEl) : false;
        const recheckStylesValid = recheckExists ? checkWatermarkStyles(recheckEl) : false;
        const recheckVisibilityValid = recheckExists ? checkWatermarkVisibility(recheckEl) : false;
        const recheckValid = recheckExists && recheckContentValid && recheckStylesValid && recheckVisibilityValid;
        
        console.log(`🔍 ตรวจสอบซ้ำครั้งที่ ${recheckCount}/${maxRechecks}:`, {
          recheckValid,
          elementPresent: !!recheckEl,
          isConnected: recheckEl?.isConnected || false,
          contentValid: recheckContentValid,
          stylesValid: recheckStylesValid,
          visibilityValid: recheckVisibilityValid
        });
        
        if (recheckValid) {
          console.log('✅ False alarm - Watermark element, เนื้อหา, CSS และการมองเห็นกลับมาปกติแล้ว');
          clearInterval(recheckInterval);
          resolve(true);
        } else if (recheckCount >= maxRechecks) {
          // ตรวจสอบครั้งสุดท้าย - ยืนยันว่าถูก tamper จริง
          let finalFailureReason = 'UNKNOWN';
          if (!recheckExists) finalFailureReason = 'DOM_REMOVED';
          else if (!recheckContentValid) finalFailureReason = 'CONTENT_MODIFIED';
          else if (!recheckStylesValid) finalFailureReason = 'CSS_HIDDEN';
          else if (!recheckVisibilityValid) finalFailureReason = 'VISIBILITY_BLOCKED';
          
          console.error(`❌ ยืนยันการโกง: Watermark ${finalFailureReason} (ตรวจสอบแล้ว 3 ครั้ง)`, {
            finalCheck: recheckValid,
            elementExists: recheckExists,
            contentValid: recheckContentValid,
            stylesValid: recheckStylesValid,
            visibilityValid: recheckVisibilityValid,
            totalRechecks: recheckCount,
            showWatermark: props.showWatermark,
            isPlaying: isPlaying.value,
            timestamp: new Date().toLocaleTimeString()
          });
          
          clearInterval(recheckInterval);
          // เรียกใช้ระบบป้องกันการโกง
          handleCheatingDetection();
          resolve(false);
        }
      }, 150); // ตรวจสอบทุก 150ms
    });
  }
};

// Track last check time to avoid too frequent checks
let lastWatermarkCheck = 0;
const watermarkCheckInterval = 5000; // เพิ่มเป็น 5 วินาที เพื่อลด false positive
let initialGracePeriod = 0; // Grace period หลังเริ่มเล่น

// Function to handle watermark monitoring on time update (ปรับปรุงแล้ว)
const handleWatermarkMonitoring = () => {
  // เช็คเงื่อนไขอย่างเข้มงวด
  if (!props.showWatermark || !isPlaying.value || isCheatingDetected.value) {
    return; // ไม่ต้องตรวจสอบ
  }
  
  const now = Date.now();
  
  // Grace period 10 วินาทีแรกหลังเริ่มเล่น (ให้เวลา UI stabilize)
  if (initialGracePeriod === 0) {
    initialGracePeriod = now;
    console.log('⏳ เริ่ม grace period 10 วินาที สำหรับ watermark monitoring');
    return;
  }
  
  if (now - initialGracePeriod < 10000) {
    console.log('⏳ ยังอยู่ใน grace period - รอ UI stabilize');
    return;
  }
  
  if (now - lastWatermarkCheck >= watermarkCheckInterval) {
    lastWatermarkCheck = now;
    
    // เรียกใช้ function ตรวจสอบใหม่ (อาจส่งกลับ Promise)
    const checkResult = checkWatermarkInDOM();
    
    // ถ้าเป็น Promise ก็ไม่ต้องทำอะไร เพราะ function จะจัดการเอง
    // ถ้าเป็น boolean ก็แค่ log ผลลัพธ์
    if (typeof checkResult === 'boolean') {
      console.log(`🔍 Watermark check result: ${checkResult ? 'SAFE' : 'SUSPICIOUS'}`);
    }
  }
};

// Start monitoring watermark when component mounts (ปรับปรุงแล้ว)
onMounted(() => {
  if (props.showWatermark) {
    console.log('🔍 เริ่มระบบป้องกัน Watermark (จะตรวจสอบเฉพาะตอนวิดีโอเล่นเท่านั้น)');
    
    // เริ่มต้นการเก็บข้อมูล watermark content
    initializeWatermarkContent();
    
    // ตรวจสอบเบื้องต้นหลังจากทุกอย่างพร้อม
    nextTick(() => {
      setTimeout(() => {
        if (isPlaying.value && props.showWatermark && !isCheatingDetected.value) {
          console.log('🎬 วิดีโอกำลังเล่น - เริ่มตรวจสอบ watermark');
          checkWatermarkInDOM();
        }
      }, 500);
    });
  }
});

// Watch currentTime for watermark monitoring (ปรับปรุงแล้ว)
watch(currentTime, async (newTime, oldTime) => {
  // ตรวจสอบว่าวิดีโอกำลังเล่นจริง และไม่อยู่ในช่วง seeking
  if (props.showWatermark && isPlaying.value && newTime > 0 && newTime !== oldTime) {
    // ตรวจสอบว่าไม่ใช่การ seek หรือ jump (เปลี่ยนแปลงมากเกินไป)
    const timeDiff = Math.abs(newTime - oldTime);
    if (timeDiff < 2) { // อัปเดทปกติ (ไม่ใช่ seek)
      handleWatermarkMonitoring();
    }
  }
});

// Watch for changes in watermark visibility (ปรับปรุงแล้ว)
watch([() => props.showWatermark, isPlaying], ([newShowWatermark, newIsPlaying]) => {
  console.log('👀 Watermark watch triggered:', {
    showWatermark: newShowWatermark,
    isPlaying: newIsPlaying,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // ตรวจสอบเฉพาะเมื่อเปลี่ยนเป็นสถานะที่ควรแสดง watermark
  if (newShowWatermark && newIsPlaying && !isCheatingDetected.value) {
    console.log('🎬 เริ่มแสดง watermark - รอให้ DOM stabilize ก่อนตรวจสอบ');
    
    // อัปเดท watermark content ใหม่ถ้า props เปลี่ยน
    initializeWatermarkContent();
    
    // รอให้ DOM stabilize และ rendering เสร็จก่อนเริ่มตรวจสอบ
    nextTick(() => {
      setTimeout(() => {
        if (props.showWatermark && isPlaying.value && !isCheatingDetected.value) {
          // ตรวจสอบครั้งแรกอย่างอ่อน (สำหรับ debug)
          const initialCheck = checkWatermarkInDOM();
          if (typeof initialCheck === 'boolean' && !initialCheck) {
            console.warn('⚠️ Initial watermark check failed - อาจเป็น timing issue, จะตรวจสอบซ้ำภายหลัง');
          } else {
            console.log('✅ Initial watermark check ผ่าน - เริ่ม monitoring ปกติ');
          }
        }
      }, 800); // เพิ่มเวลารอเป็น 800ms เพื่อให้ DOM พร้อมสมบูรณ์
    });
  } else if (!newShowWatermark || !newIsPlaying) {
    console.log('⏹️ Watermark ถูกซ่อนหรือวิดีโอหยุดเล่น - รีเซ็ต monitoring');
    lastWatermarkCheck = 0; // รีเซ็ต timer
    initialGracePeriod = 0; // รีเซ็ต grace period ด้วย
  }
}, { immediate: false });

// Watch สำหรับการเปลี่ยนแปลง watermark content props
watch([() => props.watermarkTitle, () => props.watermarkText, () => props.watermarkSubtitle], () => {
  if (props.showWatermark) {
    console.log('🔄 Watermark content props เปลี่ยนแปลง - อัปเดท Canvas');
    initializeWatermarkContent();
  }
});

// Watch สำหรับการเปลี่ยนแปลง watermark display props
watch([() => props.watermarkColor, () => props.watermarkFontSize, () => props.watermarkOpacity], () => {
  if (props.showWatermark && watermarkCanvasEl.value) {
    console.log('🎨 Watermark style props เปลี่ยนแปลง - วาด Canvas ใหม่');
    nextTick(() => {
      setTimeout(() => {
        createCanvasWatermark();
      }, 100);
    });
  }
});

// Stop monitoring when component unmounts (cleanup)
onUnmounted(() => {
  console.log('🛑 หยุดติดตาม Watermark element');
  lastWatermarkCheck = 0;
  initialGracePeriod = 0;
  if (isCheatingDetected.value) {
    console.log('📝 Component unmounted ขณะที่ตรวจพบการโกง');
  }
});

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
  togglePictureInPicture,
  enterPictureInPicture,
  exitPictureInPicture,
  // Watermark monitoring functions
  checkWatermarkInDOM,
  get watermarkElement() { return watermarkEl.value; },
  get isCheatingDetected() { return isCheatingDetected.value; },
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

// Logo error handler
const onLogoError = (event) => {
  const logoConfig = logoSettings.value;
  console.warn('Logo failed to load:', logoConfig.url);
  emit('logo-error', {
    url: logoConfig.url,
    error: event,
    message: 'Logo image failed to load'
  });
};

// Computed properties for logo configuration
const logoSettings = computed(() => {
  // Use new object format if provided, otherwise fall back to legacy props
  if (props.logo && (props.logo.show || props.logo.url)) {
    return {
      show: props.logo.show || false,
      url: props.logo.url || '',
      alt: props.logo.alt || 'Logo',
      width: props.logo.width || '60px',
      height: props.logo.height || '30px',
      maxWidth: props.logo.maxWidth || '100px',
      maxHeight: props.logo.maxHeight || '50px',
      backgroundClass: props.logo.backgroundClass || '',
      alwaysShow: props.logo.alwaysShow || false,
      position: props.logo.position || 'top-right'
    };
  }
  
  // Legacy props support
  return {
    show: props.showLogo || false,
    url: props.logoUrl || '',
    alt: props.logoAlt || 'Logo',
    width: props.logoWidth || '60px',
    height: props.logoHeight || '30px',
    maxWidth: props.logoMaxWidth || '100px',
    maxHeight: props.logoMaxHeight || '50px',
    backgroundClass: props.logoBackgroundClass || '',
    alwaysShow: props.alwaysShowLogo || false,
    position: 'top-right'
  };
});

const logoPositionClass = computed(() => {
  const position = logoSettings.value.position;
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-16 left-4';
    case 'bottom-right':
      return 'bottom-16 right-4';
    default:
      return 'top-4 right-4';
  }
});


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
