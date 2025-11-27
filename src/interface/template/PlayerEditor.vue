<template>
    <FileBrowser 
        v-if="VideoBrowserOpen" 
        :isWindowsOpen="true" 
        :callbackFunction="'video'"
        :allowFileType="['mp4','m3u8']" 
        @file-browser-trigger="changeVideoTrigger" 
        @file-browser-callback="selectVideoTrigger"
    />

    <FileBrowser 
        v-if="DocumentBrowserOpen" 
        :isWindowsOpen="true" 
        :callbackFunction="'document'"
        :allowFileType="['pdf','doc','docx','xls','xlsx','csv']" 
        @file-browser-trigger="changeDocumentTrigger" 
        @file-browser-callback="selectDocumentTrigger"
    />

    <SetContentSource 
    v-if="SetContentSourceModal" 
    :isWindowsOpen="true" 
    :setContentTriggerObj="getContentTriggerObj"
    :contentType="initialSelectPlayerItemType" 
    :contentOriginal="getContentTriggerObj" 
    @set-content-trigger="SetContentTrigger" 
    @set-content-event="handleSetContentSource"
/>

    <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden" @click.stop="handleCheckboxClick">
        <!-- Header Section -->
        <div class="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-700">ประเภท:</span>
                        <select 
                            v-model="type" 
                            id="content-type" 
                            class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                            :disabled="isTypeChangeDisabled" 
                            @click.stop
                            @change="handleTypeChange">
                            <option value="" disabled>กรุณาเลือก</option>
                            <template v-for="(typeItem) in availableTypes" :key="typeItem.code">
                                <option :value="typeItem.code" :disabled="typeItem.disabled">
                                    {{ typeItem.name }}{{ typeItem.disabled ? ' (ไม่อนุญาต)' : '' }}
                                </option>
                            </template>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-700">ระยะเวลา:</span>
                        <span class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {{ selectPlayerItem.duration || '0:00' }}
                        </span>
                    </div>
                </div>
                
                <button 
                    @click.stop="cancelUpdate"
                    type="button" 
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <font-awesome-icon :icon="['fas','times']" class="w-4 h-4 mr-2"/> 
                    ปิด
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="bg-gray-50" v-if="['demand', 'streaming', 'youtube', 'live'].includes(selectPlayerItem.type) || ['demand', 'streaming', 'youtube', 'live'].includes(type)">
            <div class="p-4">
                <div v-if="localVideo">
                    <div class="bg-black rounded-lg overflow-hidden shadow-md mb-4">
                        <!-- Universal HLS Video Player (รองรับ .m3u8, .mp4, และ YouTube) -->
                        <div v-if="shouldUseUniversalPlayer">
                            <!-- ใช้ YouTube Player API สำหรับ YouTube -->
                            <div v-if="getVideoType() === 'YouTube'" 
                                 class="relative group youtube-fullscreen-container"
                                 @mouseenter="handleYouTubeMouseEnter"
                                 @mouseleave="handleYouTubeMouseLeave"
                                 @mousemove="handleYouTubeMouseMove">
                                <!-- Loading indicator สำหรับ YouTube -->
                                <div 
                                    v-if="(!youtubePlayer || youtubePlayerState === -1) && getVideoType() === 'YouTube'" 
                                    class="absolute inset-0 bg-black flex items-center justify-center z-30">
                                    <div class="text-white text-center">
                                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                        <div class="text-lg font-medium">Loading YouTube Player...</div>
                                        <div class="text-sm text-gray-300 mt-2">
                                            {{ youtubeReady ? 'Initializing player...' : 'Loading YouTube API...' }}
                                        </div>
                                    </div>
                                </div>
                                
                                <div 
                                    :id="`youtube-player-${videoKey}`"
                                    class="w-full transition-all duration-300"
                                    style="height: 400px;"
                                ></div>
                                
                                <!-- Overlay เพื่อป้องกันการคลิกปุ่ม YouTube -->
                                <div 
                                    v-if="youtubePlayer && youtubePlayerState !== -1"
                                    class="absolute inset-0 z-5 cursor-pointer"
                                    @click="togglePlayPause"
                                    @contextmenu.prevent
                                    @dblclick.prevent="toggleFullscreen"
                                ></div>

                                <!-- Big Play Button เมื่อ pause หรือ stop -->
                                <div 
                                    v-if="youtubePlayer && (youtubePlayerState === 2 || youtubePlayerState === 0 || youtubePlayerState === 5)"
                                    class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 z-20"
                                >
                                    <button
                                        class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-200 hover:scale-105 shadow-lg pointer-events-auto mb-2"
                                        :style="{ backgroundColor: playerConfig.themeColor }"
                                        @click.stop="universalPlay"
                                        aria-label="เล่นวิดีโอ"
                                    >
                                        <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </button>
                                    <div class="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full pointer-events-none">
                                        คลิกเพื่อเล่น
                                    </div>
                                </div>

                                <!-- Custom Control Bar แสดงเฉพาะตอนเล่นและ hover -->
                                <div
                                    v-if="youtubePlayer && youtubePlayerState !== -1 && youtubePlayerState === 1"
                                    class="absolute inset-x-0 bottom-0 text-white pointer-events-none transition-all duration-300 px-4 pb-4 z-30"
                                    :class="{ 
                                        'opacity-100 translate-y-0': showYouTubeControls,
                                        'opacity-0 translate-y-2': !showYouTubeControls
                                    }"
                                >
                                    <!-- Main Control Bar Container -->
                                    <div class="bg-black/70 px-6 py-2 flex items-center space-x-3 pointer-events-auto w-full rounded-lg">
                                        <!-- Play/Pause Button (Left) -->
                                        <button 
                                            class="w-12 h-10 rounded-lg flex items-center justify-center text-white transition-all duration-200" 
                                            :style="{ backgroundColor: playerConfig.themeColor }"
                                            @click.stop="togglePlayPause" 
                                            :aria-label="youtubePlayerState === 1 ? 'หยุดชั่วคราว' : 'เล่น'"
                                        >
                                            <svg v-if="youtubePlayerState !== 1" class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                            <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                            </svg>
                                        </button>

                                        <!-- -10 Button -->
                                        <button 
                                            v-if="playerConfig.showSkipButtons"
                                            class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                                            @click.stop="universalSeekTo(Math.max(0, universalGetCurrentTime() - 10))" 
                                            aria-label="ย้อนกลับ 10 วินาที"
                                        >
                                            <span class="text-white text-sm font-bold">-10</span>
                                        </button>

                                        <!-- +10 Button -->
                                        <button 
                                            v-if="playerConfig.showSkipButtons"
                                            class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                                            @click.stop="universalSeekTo(universalGetCurrentTime() + 10)" 
                                            aria-label="กรอไปข้างหน้า 10 วินาที"
                                        >
                                            <span class="text-white text-sm font-bold">10+</span>
                                        </button>

                                        <!-- Progress Bar Section -->
                                        <div class="flex-1 flex items-center space-x-2">
                                            <!-- Time Display -->
                                            <div class="text-xs text-white font-mono whitespace-nowrap">
                                                {{ formatTime(universalGetCurrentTime()) }} / {{ formatTime(universalGetDuration()) }}
                                            </div>
                                            
                                            <!-- Progress Bar -->
                                            <div class="flex-1 relative group/progress">
                                                <!-- Background Track -->
                                                <div class="h-1.5 bg-white/40 overflow-hidden transition-all duration-200 group-hover/progress:h-2">
                                                    <!-- Current Progress -->
                                                    <div 
                                                        class="absolute top-0 left-0 h-full transition-all duration-150"
                                                        :style="{ 
                                                            width: (universalGetDuration() ? (universalGetCurrentTime() / universalGetDuration()) * 100 : 0) + '%',
                                                            backgroundColor: playerConfig.themeColor
                                                        }"
                                                    ></div>
                                                </div>
                                                
                                                <!-- Invisible Input for Seeking -->
                                                <input
                                                    type="range"
                                                    min="0"
                                                    :max="universalGetDuration() || 0"
                                                    step="0.1"
                                                    class="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                                    :value="universalGetCurrentTime()"
                                                    @input="universalSeekTo(parseFloat($event.target.value))"
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
                                                    :aria-label="isMuted ? 'เปิดเสียง' : 'ปิดเสียง'"
                                                >
                                                    <svg v-if="isMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
                                                                width: (isMuted ? 0 : volumeLevel) + '%',
                                                                backgroundColor: isMuted ? '#6b7280' : playerConfig.themeColor
                                                            }"
                                                        ></div>
                                                    </div>
                                                    <!-- Invisible Volume Slider -->
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        class="absolute inset-0 w-full h-6 opacity-0 cursor-pointer volume-slider"
                                                        :value="volumeLevel"
                                                        @input="setVolume(parseInt($event.target.value))"
                                                        aria-label="ระดับเสียง"
                                                    />
                                                </div>
                                            </div>

                                            <!-- Fullscreen Button -->
                                            <button 
                                                v-if="playerConfig.showFullscreenButton"
                                                class="w-10 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200" 
                                                @click.stop="toggleFullscreen" 
                                                aria-label="เต็มจอ"
                                            >
                                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- ใช้ Universal Player สำหรับ MP4, HLS และอื่นๆ -->
                            <UniversalPlayer
                                v-else-if="getVideoType() !== 'YouTube'"
                                ref="universalPlayer"
                                :src="getVideoUrl()"
                                :autoplay="false"
                                :muted="false"
                                :height="400"
                                :key="`universal-${videoKey}`"
                                :showBigPlayButton="playerConfig.showBigPlayButton"
                                :showSkipButtons="playerConfig.showSkipButtons"
                                :showQualitySelector="playerConfig.showQualitySelector"
                                :showFullscreenButton="playerConfig.showFullscreenButton"
                                :showPipButton="playerConfig.showPipButton"
                                :themeColor="playerConfig.themeColor"
                                :logo="playerConfig.logo"
                                :showWatermark="playerConfig.watermark.show"
                                :watermarkTitle="playerConfig.watermark.title"
                                :watermarkText="playerConfig.watermark.text"
                                :watermarkSubtitle="playerConfig.watermark.subtitle"
                                :watermarkOpacity="playerConfig.watermark.opacity"
                                :watermarkFontSize="playerConfig.watermark.fontSize"
                                :watermarkColor="playerConfig.watermark.color"
                                :watermarkSpacing="playerConfig.watermark.spacing"
                                :watermarkRotation="playerConfig.watermark.rotation"
                                :showOverlayLabel="true"
                                :overlayLabel="name || 'Video Content'"
                                :overlaySubtitle="getVideoTypeSubtitle()"
                                @ready="onPlayerReady"
                                @play="onPlayerPlay"
                                @pause="onPlayerPause"
                                @stop="onPlayerStop"
                                @time-update="onPlayerTimeUpdate"
                                @seek="onPlayerSeek"
                                @enter-pip="onPlayerEnterPip"
                                @leave-pip="onPlayerLeavePip"
                                @logo-error="onLogoError"
                                @pip-error="onPlayerPipError"
                                @error="onHlsError"
                            />
                        </div>

                        <!-- Streaming Player สำหรับ type streaming (non-HLS fallback) -->
                        <div v-else-if="effectiveType === 'streaming'">
                            <iframe v-if="localVideo && localVideo.streaming && !localVideo.streaming.includes('.m3u8')"
                                    :src="getIframeSrc(localVideo.streaming)" loading="lazy" 
                                    :key="`streaming-${videoKey}`"
                                    style="border:0;position:absolute;top:0;height:100%;width:100%;min-height:400px;" 
                                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" 
                                    allowfullscreen="true">
                            </iframe>
                        </div>
                    </div>
                </div>
                  
                <div v-else>
                    <!-- แสดง YouTube thumbnail ถ้าเป็นประเภท YouTube และมี URL -->
                    <div v-if="effectiveType === 'youtube' && localVideo && localVideo.youtube" 
                         class="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-4"
                         style="height: 400px;">
                        <img 
                            :src="getYouTubeThumbnail(localVideo.youtube, 'hqdefault')" 
                            alt="YouTube Thumbnail"
                            class="w-full h-full object-cover"
                            @error="$event.target.style.display='none'"
                        />
                        <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <div class="bg-red-600 rounded-full p-4">
                                <font-awesome-icon :icon="['fab', 'youtube']" class="text-white text-3xl"/>
                            </div>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                            <p class="text-white text-sm font-medium">YouTube Video Preview</p>
                        </div>
                    </div>
                    
                    <!-- แสดงข้อความเริ่มต้นสำหรับกรณีอื่นๆ -->
                    <div v-else class="bg-white border-2 border-dashed border-gray-300 rounded-lg h-96 flex flex-col justify-center items-center text-center mb-4">
                        <div class="p-6">
                            <font-awesome-icon :icon="['fas', 'film']" class="text-4xl text-gray-400 mb-4"/>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีเนื้อหา</h3>
                            <p class="text-sm text-gray-500">คลิกปุ่มด้านล่างเพื่อเลือกไฟล์วีดีโอ</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons - ย้ายมาอยู่ด้านล่าง -->
                <div class="flex justify-center space-x-3 mb-4">
                    <button 
                        @click.stop="handleButtonClick(effectiveType)" 
                        class="inline-flex items-center px-6 py-2 bg-blue-600 border border-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm">
                        <font-awesome-icon :icon="['fas', 'folder-open']" class="w-4 h-4 mr-2" />
                        {{ effectiveType === 'live' ? 'รหัส Live' : (effectiveType !== 'youtube' && effectiveType !== 'streaming' ? 'เลือกวีดีโอ' : 'เปลี่ยนลิงค์') }}
                    </button>
                
                    <button
                        @click.stop="removeContent"
                        class="inline-flex items-center px-6 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm">
                        <font-awesome-icon :icon="['fas','trash']" class="w-4 h-4 mr-2"/>
                        {{ effectiveType === 'document' ? 'ลบเอกสาร' : effectiveType === 'exam' ? 'ลบแบบทดสอบ' : 'ลบวีดีโอ' }}
                    </button>
                </div>

                <!-- Player Configuration Panel -->
                <div v-if="shouldUseUniversalPlayer && localVideo" class="bg-white border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-sm font-medium text-gray-900 flex items-center">
                            <font-awesome-icon :icon="['fas', 'cog']" class="w-4 h-4 mr-2 text-gray-500"/>
                            การตั้งค่า Universal Player (รองรับ MP4 & HLS)
                        </h4>
                        <button 
                            @click.stop="togglePlayerConfig = !togglePlayerConfig"
                            class="text-xs text-gray-500 hover:text-gray-700"
                        >
                            {{ togglePlayerConfig ? 'ซ่อน' : 'แสดง' }}
                        </button>
                    </div>
                    
                    <div v-if="togglePlayerConfig" class="space-y-4">
                        <!-- UI Controls -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-3">
                                <div class="flex items-center space-x-3">
                                    <input 
                                        id="bigPlayButton" 
                                        type="checkbox" 
                                        v-model="playerConfig.showBigPlayButton"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="bigPlayButton" class="text-sm text-gray-700">แสดงปุ่มเล่นใหญ่</label>
                                </div>
                                
                                <div class="flex items-center space-x-3">
                                    <input 
                                        id="skipButtons" 
                                        type="checkbox" 
                                        v-model="playerConfig.showSkipButtons"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="skipButtons" class="text-sm text-gray-700">แสดงปุ่มข้าม (-10/+10)</label>
                                </div>
                            </div>
                            
                            <div class="space-y-3">
                                <div class="flex items-center space-x-3">
                                    <input 
                                        id="qualitySelector" 
                                        type="checkbox" 
                                        v-model="playerConfig.showQualitySelector"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="qualitySelector" class="text-sm text-gray-700">แสดงเลือกคุณภาพ</label>
                                </div>
                                
                                <div class="flex items-center space-x-3">
                                    <input 
                                        id="fullscreenButton" 
                                        type="checkbox" 
                                        v-model="playerConfig.showFullscreenButton"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="fullscreenButton" class="text-sm text-gray-700">แสดงปุ่มเต็มจอ</label>
                                </div>
                                
                                <div class="flex items-center space-x-3">
                                    <input 
                                        id="pipButton" 
                                        type="checkbox" 
                                        v-model="playerConfig.showPipButton"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="pipButton" class="text-sm text-gray-700">แสดงปุ่ม Picture-in-Picture</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Theme Color Selection -->
                        <div class="border-t border-gray-200 pt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-3">สีธีม:</label>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="color in themeColors"
                                    :key="color.name"
                                    class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                    :style="{ backgroundColor: color.value }"
                                    :class="{
                                        'border-gray-900 ring-2 ring-offset-2 ring-gray-400': playerConfig.themeColor === color.value,
                                        'border-gray-300': playerConfig.themeColor !== color.value
                                    }"
                                    @click.stop="playerConfig.themeColor = color.value"
                                    :title="color.name"
                                ></button>
                            </div>
                            
                            <!-- Custom Color Input -->
                            <div class="mt-3 flex items-center space-x-2">
                                <input 
                                    type="color" 
                                    v-model="playerConfig.themeColor"
                                    @click.stop
                                    class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                                    title="เลือกสีกำหนดเอง"
                                >
                                <input 
                                    type="text" 
                                    v-model="playerConfig.themeColor"
                                    @click.stop
                                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="#3b82f6"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                >
                            </div>
                        </div>
                        
                        <!-- Logo Configuration -->
                        <div class="border-t border-gray-200 pt-4">
                            <div class="flex items-center justify-between mb-3">
                                <label class="block text-sm font-medium text-gray-700">การตั้งค่า Logo:</label>
                                <div class="flex items-center space-x-2">
                                    <input 
                                        id="showLogo" 
                                        type="checkbox" 
                                        v-model="playerConfig.logo.show"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="showLogo" class="text-sm text-gray-600">แสดง Logo</label>
                                </div>
                            </div>
                            
                            <div v-if="playerConfig.logo.show" class="space-y-3">
                                <!-- Logo URL -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">URL Logo:</label>
                                    <div class="flex space-x-2">
                                        <input 
                                            type="url" 
                                            v-model="playerConfig.logo.url"
                                            @click.stop
                                            class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://example.com/logo.png"
                                        >
                                        <button 
                                            @click.stop="setDefaultLogo"
                                            class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                            title="ใช้ Logo เริ่มต้น"
                                        >
                                            Default
                                        </button>
                                        <button 
                                            @click.stop="testLogoDisplay"
                                            class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                            title="ทดสอบแสดง Logo"
                                        >
                                            Test
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Logo Position -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">ตำแหน่ง:</label>
                                    <select 
                                        v-model="playerConfig.logo.position"
                                        @click.stop
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="top-left">มุมบนซ้าย</option>
                                        <option value="top-right">มุมบนขวา</option>
                                        <option value="bottom-left">มุมล่างซ้าย</option>
                                        <option value="bottom-right">มุมล่างขวา</option>
                                    </select>
                                </div>
                                
                                <!-- Logo Size Controls -->
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-xs font-medium text-gray-600 mb-1">ความกว้าง:</label>
                                        <input 
                                            type="text" 
                                            v-model="playerConfig.logo.width"
                                            @click.stop
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="60px"
                                        >
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-600 mb-1">ความสูง:</label>
                                        <input 
                                            type="text" 
                                            v-model="playerConfig.logo.height"
                                            @click.stop
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="30px"
                                        >
                                    </div>
                                </div>
                                
                                <!-- Logo Alt Text -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Alt Text:</label>
                                    <input 
                                        type="text" 
                                        v-model="playerConfig.logo.alt"
                                        @click.stop
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Brand Logo"
                                    >
                                </div>
                                
                                <!-- Logo Options -->
                                <div class="flex items-center space-x-4">
                                    <div class="flex items-center space-x-2">
                                        <input 
                                            id="alwaysShowLogo" 
                                            type="checkbox" 
                                            v-model="playerConfig.logo.alwaysShow"
                                            @click.stop
                                            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        >
                                        <label for="alwaysShowLogo" class="text-xs text-gray-600">แสดงตลอดเวลา</label>
                                    </div>
                                </div>
                                
                                <!-- Custom Background Class -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">CSS Class เพิ่มเติม:</label>
                                    <input 
                                        type="text" 
                                        v-model="playerConfig.logo.backgroundClass"
                                        @click.stop
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="bg-white/90 border border-gray-200"
                                    >
                                </div>
                                
                                <!-- Logo Preview -->
                                <div v-if="playerConfig.logo.url" class="bg-gray-50 border border-gray-200 rounded p-2">
                                    <div class="text-xs font-medium text-gray-600 mb-1">ตัวอย่าง:</div>
                                    <div class="flex items-center space-x-2">
                                        <img 
                                            :src="playerConfig.logo.url" 
                                            :alt="playerConfig.logo.alt"
                                            class="object-contain border border-gray-300 rounded"
                                            :style="{ 
                                                width: playerConfig.logo.width, 
                                                height: playerConfig.logo.height
                                            }"
                                            @error="onLogoPreviewError"
                                        />
                                        <div class="text-xs text-gray-500">
                                            {{ playerConfig.logo.position.replace('-', ' ') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Watermark Configuration (Anti-Screen Recording Protection) -->
                        <div class="border-t border-gray-200 pt-4">
                            <div class="flex items-center justify-between mb-3">
                                <label class="block text-sm font-medium text-gray-700">การตั้งค่า Watermark (ป้องกันการอัดหน้าจอ):</label>
                                <div class="flex items-center space-x-2">
                                    <input 
                                        id="showWatermark" 
                                        type="checkbox" 
                                        v-model="playerConfig.watermark.show"
                                        @click.stop
                                        class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    >
                                    <label for="showWatermark" class="text-sm text-gray-600">แสดง Watermark</label>
                                </div>
                            </div>
                            
                            <div v-if="playerConfig.watermark.show" class="space-y-3">
                                <!-- Watermark Title -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">หัวข้อหลัก (Title):</label>
                                    <input 
                                        type="text" 
                                        v-model="playerConfig.watermark.title"
                                        @click.stop
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="RESTRICTED"
                                    >
                                </div>
                                
                                <!-- Watermark Text -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">ข้อความกลาง (Main Text):</label>
                                    <input 
                                        type="text" 
                                        v-model="playerConfig.watermark.text"
                                        @click.stop
                                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="PROTECTED CONTENT"
                                    >
                                </div>
                                
                                <!-- Watermark Subtitle -->
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">ข้อความรอง (Subtitle):</label>
                                    <div class="flex space-x-2">
                                        <input 
                                            type="text" 
                                            v-model="playerConfig.watermark.subtitle"
                                            @click.stop
                                            class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="UNAUTHORIZED RECORDING PROHIBITED"
                                        >
                                        <button 
                                            @click.stop="setDefaultWatermark"
                                            class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                            title="ใช้ข้อความเริ่มต้น"
                                        >
                                            Default
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Watermark Appearance Settings -->
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-xs font-medium text-gray-600 mb-1">ความโปร่งใส:</label>
                                        <input 
                                            type="range" 
                                            min="0.05"
                                            max="0.5"
                                            step="0.05"
                                            v-model="playerConfig.watermark.opacity"
                                            @click.stop
                                            class="w-full"
                                        >
                                        <div class="text-xs text-gray-500 text-center">{{ (playerConfig.watermark.opacity * 100).toFixed(0) }}%</div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-600 mb-1">ขนาดตัวอักษร:</label>
                                        <select 
                                            v-model="playerConfig.watermark.fontSize"
                                            @click.stop
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="24px">เล็ก (24px)</option>
                                            <option value="32px">กลาง (32px)</option>
                                            <option value="40px">ใหญ่ (40px)</option>
                                            <option value="48px">ใหญ่มาก (48px)</option>
                                            <option value="56px">ใหญ่พิเศษ (56px)</option>
                                            <option value="64px">ยักษ์ (64px)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Watermark Color & Spacing -->
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-xs font-medium text-gray-600 mb-1">สี:</label>
                                        <div class="flex space-x-2">
                                            <input 
                                                type="color" 
                                                v-model="playerConfig.watermark.color"
                                                @click.stop
                                                class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                                            >
                                            <input 
                                                type="text" 
                                                v-model="playerConfig.watermark.color"
                                                @click.stop
                                                class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="#ffffff"
                                            >
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Watermark Preview -->
                                <div v-if="playerConfig.watermark.title || playerConfig.watermark.text || playerConfig.watermark.subtitle" class="bg-gray-900 border border-gray-700 rounded p-4 relative overflow-hidden" style="height: 140px;">
                                    <div class="text-xs font-medium text-gray-300 mb-2">ตัวอย่าง Watermark (ตรงกลางจอ):</div>
                                    <!-- Simulated Watermark -->
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                        <div class="text-white text-center flex flex-col items-center space-y-1">
                                            <!-- Title Preview -->
                                            <div 
                                                v-if="playerConfig.watermark.title"
                                                class="font-black tracking-wider whitespace-nowrap"
                                                :style="{
                                                    fontSize: Math.min(parseInt(playerConfig.watermark.fontSize), 16) + 'px',
                                                    opacity: playerConfig.watermark.opacity,
                                                    color: playerConfig.watermark.color,
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                                    fontFamily: 'Arial Black, sans-serif',
                                                    letterSpacing: '2px',
                                                    textTransform: 'uppercase'
                                                }"
                                            >
                                                {{ playerConfig.watermark.title }}
                                            </div>
                                            
                                            <!-- Main Text Preview -->
                                            <div 
                                                v-if="playerConfig.watermark.text"
                                                class="font-bold tracking-wider whitespace-nowrap"
                                                :style="{
                                                    fontSize: Math.min(parseInt(playerConfig.watermark.fontSize) * 0.8, 14) + 'px',
                                                    opacity: parseFloat(playerConfig.watermark.opacity) * 0.9,
                                                    color: playerConfig.watermark.color,
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                                    fontFamily: 'Arial Black, sans-serif',
                                                    letterSpacing: '2px',
                                                    textTransform: 'uppercase'
                                                }"
                                            >
                                                {{ playerConfig.watermark.text }}
                                            </div>
                                            
                                            <!-- Subtitle Preview -->
                                            <div 
                                                v-if="playerConfig.watermark.subtitle"
                                                class="font-semibold tracking-wide whitespace-nowrap"
                                                :style="{
                                                    fontSize: Math.min(parseInt(playerConfig.watermark.fontSize) * 0.5, 10) + 'px',
                                                    opacity: parseFloat(playerConfig.watermark.opacity) * 0.8,
                                                    color: playerConfig.watermark.color,
                                                    textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
                                                    fontFamily: 'Arial, sans-serif',
                                                    letterSpacing: '1px',
                                                    textTransform: 'uppercase'
                                                }"
                                            >
                                                {{ playerConfig.watermark.subtitle }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                                        แสดงเฉพาะตอนเล่นวิดีโอ
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Reset Button -->
                        <div class="border-t border-gray-200 pt-4">
                            <button 
                                @click.stop="resetPlayerConfig"
                                class="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <font-awesome-icon :icon="['fas', 'undo']" class="w-3 h-3 mr-1"/>
                                รีเซ็ตค่าเริ่มต้น
                            </button>
                        </div>

                        <!-- Debug & Control Section -->
                        <div class="border-t border-gray-200 pt-4" v-if="shouldUseUniversalPlayer && localVideo">
                            <div class="flex items-center justify-between mb-3">
                                <label class="text-sm font-medium text-gray-700">Debug & Control:</label>
                                <button 
                                    @click.stop="showDebugControl = !showDebugControl"
                                    class="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    {{ showDebugControl ? 'ซ่อน' : 'แสดง' }}
                                </button>
                            </div>
                            
                            <div v-if="showDebugControl" class="space-y-3">
                                <!-- Player Control Buttons -->
                                <div class="grid grid-cols-3 gap-2">
                                    <button @click.stop="universalPlay" 
                                        class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                        :title="getVideoType() === 'YouTube' ? 'Play YouTube video' : 'Play video'">
                                        ▶️ Play
                                    </button>
                                    <button @click.stop="universalPause" 
                                        class="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        :title="getVideoType() === 'YouTube' ? 'Pause YouTube video' : 'Pause video'">
                                        ⏸️ Pause
                                    </button>
                                    <button @click.stop="universalStop" 
                                        class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        :title="getVideoType() === 'YouTube' ? 'Stop YouTube video' : 'Stop video'">
                                        ⏹️ Stop
                                    </button>
                                </div>

                                <!-- Jump Controls -->
                                <div class="flex items-center space-x-2 text-xs">
                                    <input 
                                        v-model.number="jumpTime"
                                        type="number"
                                        min="0"
                                        step="1"
                                        class="w-16 px-1 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="วินาที"
                                    >
                                    <button @click.stop="universalJumpToTime" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Jump</button>
                                    <button v-if="debugInfo.error" @click.stop="clearError" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Clear Error</button>
                                </div>

                                <!-- Test Source Controls -->
                                <div class="space-y-2">
                                    <div class="text-xs font-medium text-gray-700">🧪 ทดสอบ Source:</div>
                                    <div class="grid grid-cols-3 gap-1">
                                        <button @click.stop="testMP4Source" class="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">Test MP4</button>
                                        <button @click.stop="testHLSSource" class="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600">Test HLS</button>
                                        <button @click.stop="testYouTubeSource" class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" title="Test embeddable YouTube video">Test YT</button>
                                    </div>
                                    <div class="flex space-x-1">
                                        <input 
                                            v-model="testSourceUrl"
                                            type="url"
                                            class="flex-1 px-1 py-1 border border-gray-300 rounded text-xs"
                                            placeholder="Custom URL..."
                                        >
                                        <button @click.stop="testCustomSource" class="px-2 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-xs">Test</button>
                                    </div>
                                    <button @click.stop="restoreOriginalSource" class="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">🔄 Restore Original</button>
                                </div>

                                <!-- User Preferences & History Management -->
                                <div v-if="showDebugControl" class="text-xs bg-purple-50 border border-purple-200 rounded p-2 mt-2">
                                    <div class="text-purple-700 font-medium mb-2">
                                        💾 User Preferences & History:
                                    </div>
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-purple-600">Saved Volume:</span>
                                            <span class="font-mono">{{ userPreferences.volume }}%</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-purple-600">Last Position:</span>
                                            <span class="font-mono">{{ formatTime(getLastPlayedTime()) }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-purple-600">Auto Resume:</span>
                                            <input 
                                                type="checkbox" 
                                                v-model="userPreferences.autoResume" 
                                                @change="saveUserPreferences"
                                                class="w-4 h-4"
                                            />
                                        </div>
                                        <div class="flex space-x-1 mt-2">
                                            <button 
                                                @click="clearVideoHistory" 
                                                class="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                title="Clear current video history"
                                            >
                                                🗑️ Clear This Video
                                            </button>
                                            <button 
                                                @click="clearAllHistory" 
                                                class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                title="Clear all video history"
                                            >
                                                🗑️ Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Universal Player API -->
                                <div v-if="showDebugControl" class="text-xs bg-green-50 border border-green-200 rounded p-2 mt-2">
                                    <div class="text-green-700 font-medium mb-1">
                                        � Universal Player API:
                                    </div>
                                    <div class="text-green-600 space-y-1 text-xs">
                                        <div><code>this.$refs.playerEditor.universalPlay()</code></div>
                                        <div><code>this.$refs.playerEditor.getPlayerEventData()</code></div>
                                        <div><code>this.$refs.playerEditor.onPlayerEvent('play', callback)</code></div>
                                    </div>
                                </div>

                                <!-- YouTube Control Status -->
                                <div v-if="getVideoType() === 'YouTube'" class="text-xs bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                                    <div class="text-blue-700 font-medium mb-1">
                                        🛡️ YouTube Protection Active:
                                    </div>
                                    <div v-if="youtubePlayer && typeof youtubePlayer.getCurrentTime === 'function'" class="text-green-600">
                                        ✅ All YouTube buttons/shortcuts blocked. Only custom controls work.
                                    </div>
                                    <div v-else class="text-orange-600">
                                        ⏳ Loading protection layer... YouTube controls will be blocked.
                                    </div>
                                    <div class="text-xs text-gray-600 mt-1">
                                        🎮 Custom shortcuts: Space/K=Play/Pause, J/L=±10s, ←/→=±5s, F=Fullscreen, 0-9=Jump%
                                    </div>
                                </div>

                                <!-- Simple Debug Info -->
                                <div class="bg-gray-100 p-2 rounded text-xs space-y-1">
                                    <div class="flex justify-between">
                                        <span>ประเภทไฟล์:</span>
                                        <span class="font-medium">{{ getVideoType() }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>เวลา:</span>
                                        <span>{{ formatTime(universalGetCurrentTime()) }} / {{ formatTime(universalGetDuration()) }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>สถานะ:</span>
                                        <span :class="debugInfo.isPlaying ? 'text-green-600' : 'text-gray-600'">
                                            {{ debugInfo.isPlaying ? 'กำลังเล่น' : 'หยุดชั่วคราว' }}
                                        </span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>ความคืบหน้า:</span>
                                        <span>{{ debugInfo.progress.toFixed(1) }}%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>URL:</span>
                                        <span class="truncate max-w-24" :title="getVideoUrl()">{{ getVideoUrl()?.substring(0, 20) }}...</span>
                                    </div>
                                    <div v-if="originalSource" class="flex justify-between">
                                        <span>Mode:</span>
                                        <span class="text-orange-600 font-medium">🧪 Test Source</span>
                                    </div>
                                    <div v-if="debugInfo.error" class="flex justify-between">
                                        <span>Error:</span>
                                        <span class="text-red-600 truncate max-w-24" :title="debugInfo.error">{{ debugInfo.error }}</span>
                                    </div>
                                    <div v-if="getVideoType() === 'YouTube'" class="col-span-2">
                                        <div class="text-blue-600 text-xs bg-blue-50 p-1 rounded space-y-1">
                                            <div v-if="youtubePlayer && typeof youtubePlayer.getCurrentTime === 'function'">
                                                ✅ YouTube mode: Full control enabled with API
                                            </div>
                                            <div v-else>
                                                ⏳ YouTube mode: Loading API...
                                            </div>
                                            <div v-if="getYouTubeVideoId(getVideoUrl())">
                                                <strong>Video ID:</strong> {{ getYouTubeVideoId(getVideoUrl()) }}
                                            </div>
                                            <div v-if="youtubePlayerState !== null" class="text-xs text-gray-600">
                                                <strong>Player State:</strong> {{ getYouTubePlayerStateText() }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Status -->
            <div class="bg-white border-t border-gray-200 px-6 py-3">
                <div class="flex items-center space-x-2 text-sm">
                    <font-awesome-icon :icon="['fas','video']" :class="localVideo ? 'text-green-500' : 'text-gray-400'"/>
                    <span class="text-gray-600">สถานะ:</span>
                    <span v-if="!localVideo" class="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">ไม่มีเนื้อหา</span>
                    <div v-else class="flex items-center space-x-2">
                        <span class="text-green-700 bg-green-50 px-2 py-1 rounded text-xs">
                            {{ localVideo.desktop || localVideo.streaming || localVideo.youtube || localVideo.live }}
                        </span>
                        <span v-if="shouldUseUniversalPlayer" class="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                            {{ getVideoType() }}
                        </span>
                        <span class="text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs">
                            Universal Player
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Document/Exam Content Area -->
        <div class="bg-gray-50" v-if="['document', 'exam'].includes(selectPlayerItem.type) || ['document', 'exam'].includes(type)">
            <div class="p-4">
                <div v-if="localContent">
                    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-96 overflow-auto mb-4">
                        <div v-if="effectiveType === 'document'" class="prose prose-sm max-w-none">
                            <div class="flex items-center mb-4">
                                <font-awesome-icon :icon="['fas', 'file-alt']" class="text-blue-500 text-lg mr-2"/>
                                <h3 class="text-lg font-medium text-gray-900">เอกสาร</h3>
                            </div>
                            <div class="text-gray-700">{{ localContent }}</div>
                        </div>
                        <div v-if="effectiveType === 'exam'" class="prose prose-sm max-w-none">
                            <div class="flex items-center mb-4">
                                <font-awesome-icon :icon="['fas', 'question-circle']" class="text-purple-500 text-lg mr-2"/>
                                <h3 class="text-lg font-medium text-gray-900">ข้อสอบ</h3>
                            </div>
                        </div>
                    </div>
                </div>
              
                <div v-else>
                    <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg h-96 flex flex-col justify-center items-center text-center mb-4">
                        <div class="p-6">
                            <font-awesome-icon :icon="['fas', effectiveType === 'document' ? 'file-alt' : 'question-circle']" class="text-4xl text-gray-400 mb-4"/>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มี{{ effectiveType === 'document' ? 'เอกสาร' : 'ข้อสอบ' }}</h3>
                            <p class="text-sm text-gray-500">คลิกปุ่มด้านล่างเพื่อเลือกไฟล์</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons - ย้ายมาอยู่ด้านล่าง -->
                <div class="flex justify-center space-x-3">
                    <button @click.stop="handleButtonClick(effectiveType)" class="inline-flex items-center px-6 py-2 bg-green-600 border border-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm">
                        <font-awesome-icon :icon="['fas','folder-open']" class="w-4 h-4 mr-2"/>
                        {{ effectiveType === 'document' ? 'เลือกไฟล์' : (effectiveType === 'exam' ? 'เลือกข้อสอบ' : 'เลือกไฟล์') }}
                    </button>
                    
                    <button
                        @click.stop="removeContent"
                        class="inline-flex items-center px-6 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm">
                        <font-awesome-icon :icon="['fas','trash']" class="w-4 h-4 mr-2"/>
                        ลบข้อมูล
                    </button>
                </div>
            </div>
        </div>

        <div v-if="selectPlayerItem.type === 'exam'" class="p-2">
            <div class="bg-gray-100 p-3 rounded shadow-md">
                <h3 class="font-medium text-lg mb-1">สร้างข้อสอบ</h3>
                <input v-model="newQuestion" placeholder="คำถามใหม่" class="w-full p-1 border border-gray-300 rounded mb-1" />
                <button @click.stop="addQuestion" class="w-full bg-blue-500 text-white p-1 rounded hover:bg-blue-600">เพิ่มคำถาม</button>
            </div>
            
            <div class="mt-2">
                <label>
                    <input type="checkbox" v-model="examOptionValid" />
                    Exam Option
                </label>
            </div>

            <div v-if="examOptionValid" class="col-span-1">
                <label for="validScore" class="block text-base font-medium text-gray-900">คะแนนที่ถูกต้อง</label>
                <input
                    v-model="validScore"
                    @click.stop="handleCheckboxClick"
                    type="number"
                    autocomplete="validScore"
                    class="mt-1 block w-full rounded-sm border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                />
            </div>
            
            <div v-if="questions.length" class="mt-2">
                <h4 class="font-medium text-lg">คำถามที่เพิ่มแล้ว:</h4>
                <ul class="list-disc pl-5">
                    <li v-for="(question, index) in questions" :key="question.id" class="mb-2">
                        <div class="font-semibold">{{ question.text }}</div>
                        <div class="mt-1">
                            <input v-model="question.newAnswer" placeholder="คำตอบใหม่" class="w-full p-1 border border-gray-300 rounded mb-1" />
                            <button @click.stop="addAnswerToQuestion(index)" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">เพิ่มคำตอบ</button>
                            <button @click.stop="removeQuestion(index)" class="ml-2 bg-red-500 text-white p-1 rounded hover:bg-red-600">ลบคำถาม</button>
                        </div>
                        <ul class="mt-1">
                            <li v-for="(answer, answerIndex) in question.answers" :key="answer.id" class="flex items-center mb-1">
                                <input type="radio" :value="answer.id" v-model="question.correctAnswer" class="mr-1" />
                                <span>{{ answer.text }}</span>
                                <button @click.stop="removeAnswer(index, answerIndex)" class="ml-2 bg-red-500 text-white p-1 rounded hover:bg-red-600">ลบคำตอบ</button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="mt-4">
                <button @click.stop="updateExam" class="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                    อัปเดตข้อมูลข้อสอบ
                </button>
            </div>
        </div>

        <!-- Form Section -->
        <div class="bg-white border-t border-gray-200 px-6 py-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">ชื่อบทเรียน</label>
                        <input
                            v-model="name"
                            @click.stop="handleCheckboxClick"
                            type="text"
                            autocomplete="name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="กรอกชื่อบทเรียน"
                        />
                    </div>

                    <div>
                        <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">ความยาว (นาที)</label>
                        <input
                            v-model="duration"
                            @click.stop="handleCheckboxClick"
                            type="text"
                            autocomplete="duration"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="เช่น 10:30"
                        />
                    </div>

                    <div class="flex items-center">
                        <input
                            v-model="demo"
                            @click.stop="handleCheckboxClick"
                            type="checkbox"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label class="ml-2 block text-sm text-gray-700">
                            ตัวอย่างเนื้อหา
                        </label>
                    </div>
                </div>
    
                <div>
                    <label for="slug" class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                    <textarea 
                        v-model="description" 
                        @click.stop="handleCheckboxClick" 
                        rows="6" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        placeholder="กรอกคำอธิบายเกี่ยวกับบทเรียน...">
                    </textarea>
                </div>
            </div>
        </div>
  
        <!-- Footer Actions -->
        <div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <button 
                    @click.stop="deleteItem"
                    type="button" 
                    class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <font-awesome-icon :icon="['fas','trash']" class="w-4 h-4 mr-2"/> 
                    ลบรายการ
                </button>

                <SpecialAssign 
                    :player="selectPlayerItem"
                    @set-content-reload="handleDataSource"
                />
            </div>
    
            <button 
                @click.stop="saveChanges"
                type="button" 
                class="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <font-awesome-icon :icon="['fas','save']" class="w-4 h-4 mr-2"/> 
                บันทึกการเปลี่ยนแปลง
            </button>
        </div>
    </div>
</template>

<script>
import SetContentSource from '@/interface/modal/SetContentSource.vue';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import { player } from "@/master/type";
import { UniversalPlayer } from '@/components/videoplayer';

export default {
    props: {
        selectPlayerItem: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            playerType: player,
            id: this.selectPlayerItem._id,
            name: this.selectPlayerItem.name,
            duration: this.selectPlayerItem.duration,
            description: this.selectPlayerItem.description,
            type: this.selectPlayerItem.type,
            demo: this.selectPlayerItem.demo,
            not_visible: this.selectPlayerItem.not_visible,
            status: this.selectPlayerItem.status,

            VideoBrowserOpen: false,
            SetContentSourceModal: false,
            DocumentBrowserOpen: false,

            initialSelectPlayerItemType: this.selectPlayerItem.type,
            buttonType: this.selectPlayerItem.type,

            newQuestion: '',
            questions: this.selectPlayerItem.content ? this.selectPlayerItem.content.exam || [] : [],
            examOptionValid: false,
            validScore: '',
            
            // เพิ่ม reactive data สำหรับการแสดงผล
            localVideo: this.selectPlayerItem.video,
            localContent: this.selectPlayerItem.content,
            
            // เพิ่ม reactive key สำหรับบังคับ re-render
            videoKey: Date.now(),
            
            // เพิ่มการตั้งค่า Player Configuration
            playerConfig: {
                showBigPlayButton: true,
                showSkipButtons: true,
                showQualitySelector: true,
                showFullscreenButton: true,
                showPipButton: true,
                themeColor: '#3b82f6',
                // Logo Configuration
                logo: {
                    show: true,
                    url: 'https://backend-storage.sgp1.digitaloceanspaces.com/Graphic/Logo/white-logopng-1png.png',
                    alt: 'Brand Logo',
                    width: '80px',
                    height: '40px',
                    maxWidth: '120px',
                    maxHeight: '60px',
                    backgroundClass: 'bg-black/70 border border-white/20',
                    alwaysShow: false,
                    position: 'top-right' // top-left, top-right, bottom-left, bottom-right
                },
                // Watermark Configuration (Anti-Screen Recording Protection)
                watermark: {
                    show: true,
                    title: 'RESTRICTED',
                    text: 'PROTECTED CONTENT',
                    subtitle: 'UNAUTHORIZED RECORDING PROHIBITED',
                    opacity: '0.3',
                    fontSize: '48px',
                    color: '#ffffff',
                    spacing: 200,
                    rotation: 0
                }
            },
            
            // Toggle สำหรับแสดง/ซ่อน Player Config
            togglePlayerConfig: false,
            
            // สีธีมที่กำหนดไว้ล่วงหน้า
            themeColors: [
                { name: 'Blue', value: '#3b82f6' },
                { name: 'Red', value: '#ef4444' },
                { name: 'Green', value: '#10b981' },
                { name: 'Purple', value: '#8b5cf6' },
                { name: 'Yellow', value: '#f59e0b' },
                { name: 'Pink', value: '#ec4899' },
                { name: 'Indigo', value: '#6366f1' },
                { name: 'Teal', value: '#14b8a6' },
                { name: 'Orange', value: '#f97316' },
                { name: 'Lime', value: '#84cc16' },
            ],
            
            // Player tracking data
            currentProgress: 0,
            currentTime: 0,
            achievedMilestones: [],
            userId: null, // สามารถเซ็ตจาก authentication system

            // Simple Debug & Control
            showDebugControl: false,
            jumpTime: 0,
            testSourceUrl: '',
            originalSource: null, // เก็บ source เดิมไว้
            debugInfo: {
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                progress: 0,
                error: null
            },
            
            // YouTube Player API
            youtubePlayer: null,
            youtubeReady: false,
            youtubePlayerState: null,
            showYouTubeControls: false,
            youtubeControlsTimeout: null,
            
            // Fullscreen handler
            fullscreenHandler: null,
            
            // Volume controls
            volumeLevel: 100,
            isMuted: false,
            
            // Player Event Callbacks
            playerEventCallbacks: {},
            
            // Cookie-based User Preferences
            userPreferences: {
                volume: 100,
                lastPlayedTime: 0,
                autoResume: true // เปิดใช้การเล่นต่อจากจุดเดิมอัตโนมัติ
            }
        };
    },
    components: {
        FileBrowser,
        SetContentSource,
        UniversalPlayer,
    },
    computed: {
        effectiveType() {
            // Prioritize the dynamic type over the initial type for better UX
            return this.type || this.selectPlayerItem.type || this.initialSelectPlayerItemType;
        },
        getContentTriggerObj() {
            if (!this.localVideo) {
                return null;
            }
            if (this.effectiveType === 'streaming') {
                return this.localVideo.streaming;
            } else if (this.effectiveType === 'youtube') {
                return this.localVideo.youtube;
            } else if (this.effectiveType === 'live') {
                return this.localVideo.live;
            } else if (this.effectiveType === 'demand') {
                return this.localVideo.desktop;
            } else {
                return null;
            }
        },
        isTypeChangeDisabled() {
            // ถ้าเป็น folder และมี sub items จะไม่สามารถเปลี่ยนประเภทได้
            return this.selectPlayerItem.type === 'folder' && 
                   this.selectPlayerItem.items && 
                   this.selectPlayerItem.items.length > 0;
        },
        availableTypes() {
            // Show all types but disable folder to provide better UX feedback
            return this.playerType.map(typeItem => ({
                ...typeItem,
                disabled: typeItem.code === 'folder'
            }));
        },
        // ตรวจสอบว่าควรใช้ Universal player หรือไม่ (รองรับ MP4, M3U8, และ YouTube)
        shouldUseUniversalPlayer() {
            const videoUrl = this.getVideoUrl();
            if (!videoUrl) return false;
            
            // รองรับทั้ง HLS (.m3u8), MP4, และ YouTube ใน Universal Player
            return videoUrl.endsWith('.m3u8') || 
                   videoUrl.includes('manifest/video.m3u8') || 
                   videoUrl.endsWith('.mp4') ||
                   (this.effectiveType === 'demand' && this.localVideo && this.localVideo.desktop) ||
                   (this.effectiveType === 'youtube' && this.localVideo && this.localVideo.youtube);
        },
        formattedQuestions() {
            return {
                exam: this.questions.map(question => ({
                    id: question.id,
                    text: question.text,
                    answers: question.answers,
                    newAnswer: question.newAnswer,
                    correctAnswer: question.correctAnswer,
                })),
                option: {
                    valid: this.examOptionValid, // สถานะของ Exam Option
                    score: this.validScore, // สถานะของ Exam Option
                },
            };
        },
    },
    watch: {
        type(newType) {
            this.initialSelectPlayerItemType = newType;
            this.buttonType = newType;
        },
        // เพิ่ม watcher สำหรับซิงค์ข้อมูลจาก parent
        'selectPlayerItem.video': {
            handler(newVideo) {
                this.localVideo = newVideo;
            },
            deep: true
        },
        'selectPlayerItem.content': {
            handler(newContent) {
                this.localContent = newContent;
            },
            deep: true
        },
        // เพิ่ม watcher สำหรับ debug และ initialize YouTube player
        'localVideo': {
            handler(newVideo, oldVideo) {
                console.log("localVideo changed:", { old: oldVideo, new: newVideo });
                
                // ถ้าเป็น YouTube video ให้ initialize player
                if (newVideo && this.getVideoType() === 'YouTube') {
                    this.videoKey = Date.now(); // Force re-render
                    this.$nextTick(() => {
                        this.initializeYouTubePlayer();
                    });
                }
            },
            deep: true
        },
        // Watch for video type changes to initialize YouTube player
        'videoKey'() {
            if (this.getVideoType() === 'YouTube') {
                this.$nextTick(() => {
                    this.initializeYouTubePlayer();
                });
            }
        }
    },
    mounted() {
        // โหลด user preferences จาก cookies
        this.loadUserPreferences();
        
        this.loadYouTubeAPI();
        
        // Set up debug info update interval
        setInterval(() => {
            this.updatePlayerDebugInfo();
        }, 1000);

        // เพิ่มการป้องกัน keyboard events สำหรับ YouTube
        document.addEventListener('keydown', this.preventYouTubeKeyboard);
        
        // ใช้ volume preference ที่โหลดมา
        this.volumeLevel = this.userPreferences.volume;
        
        // รอให้ player พร้อมแล้วค่อยใช้ preferences
        setTimeout(() => {
            this.applyVolumePreference();
        }, 2000);
    },

    beforeUnmount() {
        // ลบ event listeners
        document.removeEventListener('keydown', this.preventYouTubeKeyboard);
        
        // ลบ fullscreen listeners
        this.removeFullscreenListeners();
        
        // Clear YouTube controls timeout
        this.clearYouTubeControlsTimeout();
        
        // ทำลาย YouTube player
        if (this.youtubePlayer) {
            this.youtubePlayer.destroy();
            this.youtubePlayer = null;
        }
    },
    methods: {
        // YouTube API Management
        loadYouTubeAPI() {
            console.log('Loading YouTube API...');
            
            // ตรวจสอบว่า YouTube API โหลดแล้วหรือยัง
            if (window.YT && window.YT.Player) {
                console.log('YouTube API already loaded');
                this.youtubeReady = true;
                // ถ้าเป็น YouTube video ให้ initialize ทันที
                if (this.getVideoType() === 'YouTube') {
                    this.$nextTick(() => {
                        this.initializeYouTubePlayer();
                    });
                }
                return;
            }

            // โหลด YouTube API Script
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                console.log('Creating YouTube API script tag');
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                script.onload = () => {
                    console.log('YouTube API script loaded');
                };
                script.onerror = (error) => {
                    console.error('Failed to load YouTube API script:', error);
                    this.updateDebugInfo({
                        status: 'YouTube Error',
                        error: 'Failed to load YouTube API'
                    });
                };
                document.head.appendChild(script);
            } else {
                console.log('YouTube API script already exists');
            }

            // Set global callback
            window.onYouTubeIframeAPIReady = () => {
                console.log('YouTube API Ready callback fired');
                this.youtubeReady = true;
                // ถ้าเป็น YouTube video ให้ initialize
                if (this.getVideoType() === 'YouTube') {
                    this.$nextTick(() => {
                        this.initializeYouTubePlayer();
                    });
                }
            };
            
            // เพิ่มการตรวจสอบแบบ polling กรณีที่ callback ไม่ทำงาน
            let checkCount = 0;
            const maxChecks = 50; // 5 วินาที (100ms x 50)
            const checkYouTubeAPI = () => {
                checkCount++;
                if (window.YT && window.YT.Player) {
                    console.log('YouTube API detected via polling');
                    this.youtubeReady = true;
                    if (this.getVideoType() === 'YouTube') {
                        this.$nextTick(() => {
                            this.initializeYouTubePlayer();
                        });
                    }
                } else if (checkCount < maxChecks) {
                    setTimeout(checkYouTubeAPI, 100);
                } else {
                    console.error('YouTube API failed to load after timeout');
                    this.updateDebugInfo({
                        status: 'YouTube Error',
                        error: 'API load timeout'
                    });
                }
            };
            
            setTimeout(checkYouTubeAPI, 100);
        },

        initializeYouTubePlayer() {
            console.log('Initializing YouTube Player...', {
                youtubeReady: this.youtubeReady,
                videoType: this.getVideoType(),
                videoUrl: this.getVideoUrl(),
                hasYT: !!window.YT,
                hasYTPlayer: !!(window.YT && window.YT.Player)
            });

            if (!this.youtubeReady || this.getVideoType() !== 'YouTube') {
                console.log('YouTube not ready or not YouTube video');
                return;
            }
            
            const videoId = this.getYouTubeVideoId(this.getVideoUrl());
            if (!videoId) {
                console.error('Invalid YouTube video ID from URL:', this.getVideoUrl());
                this.updateDebugInfo({
                    status: 'YouTube Error',
                    error: 'Invalid video ID'
                });
                return;
            }

            console.log('YouTube Video ID:', videoId);

            // ทำลาย player เก่าก่อน
            if (this.youtubePlayer) {
                console.log('Destroying old YouTube player');
                this.youtubePlayer.destroy();
                this.youtubePlayer = null;
            }

            const playerId = `youtube-player-${this.videoKey}`;
            console.log('Looking for player element:', playerId);
            
            // รอให้ element ถูกสร้างใน DOM
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryInitialize = () => {
                const playerElement = document.getElementById(playerId);
                attempts++;
                
                if (!playerElement) {
                    console.log(`Player element not found (attempt ${attempts}/${maxAttempts})`);
                    if (attempts < maxAttempts) {
                        setTimeout(tryInitialize, 100);
                    } else {
                        console.error('Player element not found after max attempts');
                        this.updateDebugInfo({
                            status: 'YouTube Error',
                            error: 'Player element not found'
                        });
                    }
                    return;
                }

                console.log('Player element found, creating YouTube player');
                
                try {
                    this.youtubePlayer = new window.YT.Player(playerId, {
                        height: '400',
                        width: '100%',
                        videoId: videoId,
                        host: 'https://www.youtube-nocookie.com',  // ใช้ nocookie domain
                        playerVars: {
                            autoplay: 0,              
                            controls: 0,              
                            disablekb: 1,             
                            modestbranding: 1,        
                            rel: 0,                   
                            showinfo: 0,              
                            iv_load_policy: 3,        
                            cc_load_policy: 0,        
                            fs: 0,                    
                            enablejsapi: 1,           
                            playsinline: 1,           
                            origin: window.location.protocol + '//' + window.location.host
                        },
                        events: {
                            onReady: this.onYouTubePlayerReady,
                            onStateChange: this.onYouTubePlayerStateChange,
                            onError: this.onYouTubePlayerError
                        }
                    });
                    
                    console.log('YouTube player created successfully');
                    this.updateDebugInfo({
                        status: 'YouTube Loading...',
                        error: null
                    });
                    
                } catch (error) {
                    console.error('Error creating YouTube player:', error);
                    this.updateDebugInfo({
                        status: 'YouTube Error',
                        error: error.message
                    });
                }
            };
            
            tryInitialize();
        },

        onYouTubePlayerReady() {
            console.log('✅ YouTube Player Ready');
            this.youtubeReady = true;
            this.updateDebugInfo({
                status: 'YouTube Ready',
                error: null
            });
            
            // Force update player state to hide loading
            this.youtubePlayerState = this.youtubePlayer.getPlayerState();
            
            // ซ่อน YouTube elements ที่ไม่สามารถปิดด้วย parameters (เฉพาะครั้งเดียว)
            setTimeout(() => {
                this.hideYouTubeElements();
            }, 2000);
            
            // Initialize volume controls
            this.initializeVolumeControls();
            
            // ตั้งค่า volume ตาม user preferences
            setTimeout(() => {
                this.applyVolumePreference();
            }, 500);
            
            // ทดสอบ methods ของ player
            if (this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') {
                console.log('YouTube Player methods available');
            } else {
                console.warn('YouTube Player methods not available yet');
                // ลองอีกครั้งหลัง 1 วินาที
                setTimeout(() => {
                    if (this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') {
                        console.log('YouTube Player methods now available');
                        this.youtubePlayerState = this.youtubePlayer.getPlayerState();
                        // Initialize volume controls เมื่อ player พร้อม
                        this.initializeVolumeControls();
                    }
                }, 1000);
            }
        },

        onYouTubePlayerStateChange(event) {
            this.youtubePlayerState = event.data;
            
            // จัดการ controls visibility ตาม state
            if (event.data === 1) {
                // กำลังเล่น - อนุญาตให้แสดง controls เมื่อ hover
                // ไม่ต้องเปลี่ยน showYouTubeControls ที่นี่ ให้ mouse events จัดการ
            } else {
                // pause, stop, หรือ state อื่นๆ - ซ่อน controls และ clear timeout
                this.showYouTubeControls = false;
                this.clearYouTubeControlsTimeout();
            }
            
            const states = {
                [-1]: 'unstarted',
                [0]: 'ended',
                [1]: 'playing', 
                [2]: 'paused',
                [3]: 'buffering',
                [5]: 'cued'
            };

            const status = states[event.data] || 'unknown';
            
            this.updateDebugInfo({
                status: `YouTube: ${status}`,
                isPlaying: event.data === 1
            });

            // Emit custom events ที่เข้ากันได้กับระบบเดิม
            const eventData = {
                state: event.data,
                status: status,
                isPlaying: event.data === 1,
                currentTime: (this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') 
                    ? this.youtubePlayer.getCurrentTime() : 0,
                duration: (this.youtubePlayer && typeof this.youtubePlayer.getDuration === 'function') 
                    ? this.youtubePlayer.getDuration() : 0,
                type: 'YouTube',
                player: this.youtubePlayer
            };
            
            this.triggerPlayerEvent('state-change', eventData);
            
            // Trigger specific events
            if (event.data === 1) {
                this.triggerPlayerEvent('play', eventData);
            } else if (event.data === 2) {
                this.triggerPlayerEvent('pause', eventData);
            } else if (event.data === 0) {
                this.triggerPlayerEvent('ended', eventData);
            }
        },

        onYouTubePlayerError(event) {
            const errorMessages = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or private',
                101: 'Video owner has disabled embedding',
                150: 'Video owner has disabled embedding'
            };

            const errorMessage = errorMessages[event.data] || `YouTube Error: ${event.data}`;
            
            this.updateDebugInfo({
                status: 'YouTube Error',
                error: errorMessage
            });
        },

        // Universal Player Control Methods (รองรับทั้ง HLS และ YouTube)
        universalPlay() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.playVideo === 'function') {
                this.youtubePlayer.playVideo();
                this.$emit('player-play', { type: 'YouTube', player: this.youtubePlayer });
            } else {
                // ใช้ HLS player controls
                this.controlPlay();
                this.$emit('player-play', { type: 'HLS', player: this.$refs.universalPlayer });
            }
        },

        universalPause() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.pauseVideo === 'function') {
                this.youtubePlayer.pauseVideo();
                this.$emit('player-pause', { type: 'YouTube', player: this.youtubePlayer });
            } else {
                this.controlPause();
                this.$emit('player-pause', { type: 'HLS', player: this.$refs.universalPlayer });
            }
        },

        universalStop() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.stopVideo === 'function') {
                this.youtubePlayer.stopVideo();
                this.triggerPlayerEvent('stop', { type: 'YouTube', player: this.youtubePlayer });
            } else {
                this.controlStop();
                this.triggerPlayerEvent('stop', { type: 'HLS', player: this.$refs.universalPlayer });
            }
        },

        universalSeekTo(time) {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.seekTo === 'function') {
                this.youtubePlayer.seekTo(time, true);
                
                const currentTime = (typeof this.youtubePlayer.getCurrentTime === 'function') 
                    ? this.youtubePlayer.getCurrentTime() : 0;
                const duration = (typeof this.youtubePlayer.getDuration === 'function') 
                    ? this.youtubePlayer.getDuration() : 0;
                
                this.$emit('player-seek', { 
                    type: 'YouTube', 
                    player: this.youtubePlayer, 
                    time: time,
                    currentTime: currentTime,
                    duration: duration
                });
            } else {
                // ใช้ HLS player seek
                this.jumpToCustomTime(time);
                this.$emit('player-seek', { 
                    type: 'HLS', 
                    player: this.$refs.universalPlayer, 
                    time: time,
                    currentTime: this.debugInfo.currentTime,
                    duration: this.debugInfo.duration
                });
            }
        },

        universalJumpToTime() {
            if (this.jumpTime >= 0) {
                this.universalSeekTo(this.jumpTime);
            }
        },

        // Custom YouTube Control Methods
        togglePlayPause() {
            if (this.getVideoType() === 'YouTube') {
                if (this.youtubePlayerState === 1) {
                    this.universalPause();
                } else {
                    this.universalPlay();
                }
            }
        },

        seekToProgress(event) {
            if (this.getVideoType() === 'YouTube') {
                const progressBar = event.currentTarget;
                const rect = progressBar.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const percentage = clickX / rect.width;
                const duration = this.universalGetDuration();
                const seekTime = duration * percentage;
                
                this.universalSeekTo(seekTime);
            }
        },

        toggleFullscreen() {
            // ใช้ Custom Fullscreen เหมือน HLS Player
            const playerContainer = document.querySelector(`#youtube-player-${this.videoKey}`)?.parentElement;
            if (!playerContainer) {
                console.warn('Player container not found for fullscreen');
                return;
            }

            // Toggle custom fullscreen state
            const isCurrentlyFullscreen = playerContainer.style.position === 'fixed';
            
            if (!isCurrentlyFullscreen) {
                // เข้าสู่ custom fullscreen mode
                playerContainer.style.position = 'fixed';
                playerContainer.style.top = '0';
                playerContainer.style.left = '0';
                playerContainer.style.width = '100vw';
                playerContainer.style.height = '100vh';
                playerContainer.style.zIndex = '9999';
                playerContainer.style.backgroundColor = '#000';
                
                // ซ่อน body scroll
                document.body.style.overflow = 'hidden';
                
                // ปรับขนาด YouTube player ให้เต็มจอ
                const youtubePlayerElement = document.querySelector(`#youtube-player-${this.videoKey}`);
                if (youtubePlayerElement) {
                    youtubePlayerElement.style.width = '100vw';
                    youtubePlayerElement.style.height = '100vh';
                }
                
                console.log('Entered custom fullscreen mode');
            } else {
                // ออกจาก custom fullscreen mode
                playerContainer.style.position = '';
                playerContainer.style.top = '';
                playerContainer.style.left = '';
                playerContainer.style.width = '';
                playerContainer.style.height = '';
                playerContainer.style.zIndex = '';
                playerContainer.style.backgroundColor = '';
                
                // คืนค่า body scroll
                document.body.style.overflow = '';
                
                // คืนขนาด YouTube player ปกติ
                const youtubePlayerElement = document.querySelector(`#youtube-player-${this.videoKey}`);
                if (youtubePlayerElement) {
                    youtubePlayerElement.style.width = '100%';
                    youtubePlayerElement.style.height = '400px';
                }
                
                console.log('Exited custom fullscreen mode');
            }
        },

        addFullscreenListeners() {
            const handleFullscreenChange = () => {
                const playerElement = document.querySelector(`#youtube-player-${this.videoKey}`);
                
                if (document.fullscreenElement) {
                    // เข้า fullscreen - ปรับขนาด YouTube player
                    if (playerElement && this.youtubePlayer) {
                        // ตั้งค่าขนาดเต็มจอ
                        playerElement.style.width = '100vw';
                        playerElement.style.height = '100vh';
                        
                        // บังคับ YouTube player ให้ resize
                        setTimeout(() => {
                            if (this.youtubePlayer && typeof this.youtubePlayer.getIframe === 'function') {
                                const iframe = this.youtubePlayer.getIframe();
                                if (iframe) {
                                    iframe.style.width = '100%';
                                    iframe.style.height = '100%';
                                }
                            }
                        }, 100);
                    }
                } else {
                    // ออกจาก fullscreen - คืนขนาดปกติ
                    if (playerElement) {
                        playerElement.style.width = '100%';
                        playerElement.style.height = '400px';
                        
                        // คืนค่า YouTube player
                        setTimeout(() => {
                            if (this.youtubePlayer && typeof this.youtubePlayer.getIframe === 'function') {
                                const iframe = this.youtubePlayer.getIframe();
                                if (iframe) {
                                    iframe.style.width = '100%';
                                    iframe.style.height = '400px';
                                }
                            }
                        }, 100);
                    }
                }
            };

            // เพิ่ม event listeners สำหรับ fullscreen changes
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('msfullscreenchange', handleFullscreenChange);
            
            // เก็บ reference เพื่อลบ listeners ภายหลัง
            this.fullscreenHandler = handleFullscreenChange;
        },

        removeFullscreenListeners() {
            if (this.fullscreenHandler) {
                document.removeEventListener('fullscreenchange', this.fullscreenHandler);
                document.removeEventListener('webkitfullscreenchange', this.fullscreenHandler);
                document.removeEventListener('msfullscreenchange', this.fullscreenHandler);
                this.fullscreenHandler = null;
            }
        },

        // ป้องกัน YouTube keyboard shortcuts
        preventYouTubeKeyboard(event) {
            // ตรวจสอบว่าเป็น YouTube player หรือไม่
            if (this.getVideoType() !== 'YouTube') return;
            
            // ไม่ต้องตรวจสอบ element เพราะเราต้องการป้องกัน keyboard ทั้งหมด
            // เมื่อมี YouTube player อยู่
            
            // รายการ keys ที่ YouTube ใช้
            const youtubeKeys = [
                'Space',        // Play/Pause
                'KeyK',         // Play/Pause  
                'KeyJ',         // Rewind 10s
                'KeyL',         // Forward 10s
                'ArrowLeft',    // Rewind 5s
                'ArrowRight',   // Forward 5s
                'ArrowUp',      // Volume up
                'ArrowDown',    // Volume down
                'KeyM',         // Mute
                'KeyF',         // Fullscreen
                'KeyT',         // Theater mode
                'KeyI',         // Miniplayer
                'KeyC',         // Captions
                'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
                'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'  // Jump to %
            ];
            
            // ป้องกัน YouTube keyboard shortcuts และใช้ของเราแทน
            if (youtubeKeys.includes(event.code)) {
                event.preventDefault();
                event.stopPropagation();
                
                // จัดการ custom keyboard shortcuts
                this.handleCustomKeyboard(event);
            }
        },

        // จัดการ custom keyboard shortcuts
        handleCustomKeyboard(event) {
            switch (event.code) {
                case 'Space':
                case 'KeyK':
                    this.togglePlayPause();
                    break;
                case 'KeyJ':
                    this.universalSeekTo(Math.max(0, this.universalGetCurrentTime() - 10));
                    break;
                case 'KeyL':
                    this.universalSeekTo(this.universalGetCurrentTime() + 10);
                    break;
                case 'ArrowLeft':
                    this.universalSeekTo(Math.max(0, this.universalGetCurrentTime() - 5));
                    break;
                case 'ArrowRight':
                    this.universalSeekTo(this.universalGetCurrentTime() + 5);
                    break;
                case 'KeyF':
                    this.toggleFullscreen();
                    break;
                case 'Digit0':
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9': {
                    const digit = parseInt(event.code.replace('Digit', ''));
                    const duration = this.universalGetDuration();
                    const seekTime = (duration * digit) / 10;
                    this.universalSeekTo(seekTime);
                    break;
                }
            }
        },

        universalGetCurrentTime() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') {
                try {
                    return this.youtubePlayer.getCurrentTime() || 0;
                } catch (error) {
                    console.warn('YouTube getCurrentTime error:', error);
                    return 0;
                }
            } else {
                return this.debugInfo.currentTime || 0;
            }
        },

        universalGetDuration() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.getDuration === 'function') {
                try {
                    return this.youtubePlayer.getDuration() || 0;
                } catch (error) {
                    console.warn('YouTube getDuration error:', error);
                    return 0;
                }
            } else {
                return this.debugInfo.duration || 0;
            }
        },

        // Volume Control Methods
        toggleMute() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer) {
                try {
                    if (this.isMuted) {
                        this.youtubePlayer.unMute();
                        this.isMuted = false;
                    } else {
                        this.youtubePlayer.mute();
                        this.isMuted = true;
                    }
                } catch (error) {
                    console.warn('YouTube mute toggle error:', error);
                }
            }
        },

        setVolume(volume) {
            this.volumeLevel = parseInt(volume);
            
            // บันทึกลง cookie
            this.saveVolumePreference(this.volumeLevel);
            
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer) {
                try {
                    this.youtubePlayer.setVolume(this.volumeLevel);
                    // อัปเดต mute status
                    this.isMuted = this.volumeLevel === 0;
                } catch (error) {
                    console.warn('YouTube volume set error:', error);
                }
            }
        },

        initializeVolumeControls() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer) {
                try {
                    // ตั้งค่า volume เริ่มต้น
                    this.volumeLevel = this.youtubePlayer.getVolume() || 100;
                    this.isMuted = this.youtubePlayer.isMuted() || false;
                } catch (error) {
                    console.warn('YouTube volume initialization error:', error);
                    this.volumeLevel = 100;
                    this.isMuted = false;
                }
            }
        },

        updatePlayerDebugInfo() {
            if (this.getVideoType() === 'YouTube' && this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') {
                try {
                    const currentTime = this.youtubePlayer.getCurrentTime();
                    const duration = this.youtubePlayer.getDuration();
                    
                    this.debugInfo.currentTime = currentTime || 0;
                    this.debugInfo.duration = duration || 0;
                    this.debugInfo.progress = duration > 0 ? (currentTime / duration) * 100 : 0;
                } catch (error) {
                    // YouTube player not ready yet or method not available
                    console.warn('YouTube player debug update failed:', error);
                }
            }
        },

        // Universal Player Event Subscription (สำหรับให้ components อื่นใช้)
        getPlayerEventData() {
            const isYoutube = this.getVideoType() === 'YouTube';
            const youtubeReady = isYoutube && this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function';
            
            return {
                type: this.getVideoType(),
                isPlaying: isYoutube 
                    ? (this.youtubePlayerState === 1) 
                    : this.debugInfo.isPlaying,
                currentTime: this.universalGetCurrentTime(),
                duration: this.universalGetDuration(),
                progress: this.universalGetDuration() > 0 
                    ? (this.universalGetCurrentTime() / this.universalGetDuration()) * 100 
                    : 0,
                player: isYoutube ? this.youtubePlayer : this.$refs.universalPlayer,
                error: this.debugInfo.error,
                ready: isYoutube ? youtubeReady : true
            };
        },

        // Method สำหรับให้ external components listen ไปยัง player events
        onPlayerEvent(eventType, callback) {
            // ใช้ callback pattern แทน $on
            if (!this.playerEventCallbacks) {
                this.playerEventCallbacks = {};
            }
            if (!this.playerEventCallbacks[eventType]) {
                this.playerEventCallbacks[eventType] = [];
            }
            this.playerEventCallbacks[eventType].push(callback);
        },

        // Method สำหรับ remove event listeners  
        offPlayerEvent(eventType, callback) {
            if (this.playerEventCallbacks && this.playerEventCallbacks[eventType]) {
                const index = this.playerEventCallbacks[eventType].indexOf(callback);
                if (index > -1) {
                    this.playerEventCallbacks[eventType].splice(index, 1);
                }
            }
        },

        // Method สำหรับ trigger callbacks
        triggerPlayerEvent(eventType, data) {
            if (this.playerEventCallbacks && this.playerEventCallbacks[eventType]) {
                this.playerEventCallbacks[eventType].forEach(callback => {
                    if (typeof callback === 'function') {
                        callback(data);
                    }
                });
            }
            // ยัง emit ไปยัง parent เพื่อความเข้ากันได้
            this.$emit(`player-${eventType}`, data);
        },
        // Simple Debug & Control Methods
        controlPlay() {
            if (this.getVideoType() === 'YouTube') {
                // YouTube iframe ไม่สามารถควบคุมผ่าน JavaScript ได้โดยตรง
                console.log('YouTube player - cannot control via JavaScript');
                return;
            }
            
            const player = this.$refs ? this.$refs.universalPlayer || this.$refs.playerRef : null;
            if (player && player.play) {
                player.play();
            }
        },
        controlPause() {
            if (this.getVideoType() === 'YouTube') {
                console.log('YouTube player - cannot control via JavaScript');
                return;
            }
            
            const player = this.$refs ? this.$refs.universalPlayer || this.$refs.playerRef : null;
            if (player && player.pause) {
                player.pause();
            }
        },
        controlStop() {
            if (this.getVideoType() === 'YouTube') {
                console.log('YouTube player - cannot control via JavaScript');
                return;
            }
            
            const player = this.$refs ? this.$refs.universalPlayer || this.$refs.playerRef : null;
            if (player && player.stop) {
                player.stop();
            }
        },
        jumpToCustomTime() {
            if (this.getVideoType() === 'YouTube') {
                console.log('YouTube player - cannot jump via JavaScript');
                return;
            }
            
            const player = this.$refs ? this.$refs.universalPlayer || this.$refs.playerRef : null;
            if (player && player.jumpTo && this.jumpTime >= 0) {
                player.jumpTo(this.jumpTime);
            }
        },
        formatTime(seconds) {
            if (!seconds || seconds <= 0) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },
        updateDebugInfo(data) {
            this.debugInfo = {
                isPlaying: data.isPlaying || false,
                currentTime: data.currentTime || 0,
                duration: data.duration || 0,
                progress: data.progress || 0,
                error: this.debugInfo.error // Keep existing error
            };
        },
        getYouTubeVideoId(url) {
            if (!url) return null;
            
            // Handle different YouTube URL formats
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            
            return null;
        },

        getYouTubePlayerStateText() {
            const states = {
                [-1]: '🔄 Unstarted',
                [0]: '⏹️ Ended',
                [1]: '▶️ Playing',
                [2]: '⏸️ Paused',
                [3]: '⏳ Buffering',
                [5]: '📋 Cued'
            };
            return states[this.youtubePlayerState] || '❓ Unknown';
        },

        clearError() {
            this.debugInfo.error = null;
        },

        onYouTubeLoad() {
            console.log('YouTube iframe loaded successfully');
            this.updateDebugInfo({
                status: 'YouTube loaded',
                error: null
            });
        },

        onYouTubeError() {
            console.error('YouTube iframe failed to load');
            this.updateDebugInfo({
                status: 'YouTube error',
                error: 'Failed to load YouTube video. Video may not be embeddable or URL is invalid.'
            });
        },
        // Test Source Methods
        testMP4Source() {
            // เก็บ source เดิมไว้ถ้ายังไม่เคยเก็บ
            if (!this.originalSource) {
                this.originalSource = this.getVideoUrl();
            }
            
            // ใช้ MP4 ตัวอย่าง
            const mp4TestUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            this.changeVideoSource(mp4TestUrl);
        },
        testHLSSource() {
            // เก็บ source เดิมไว้ถ้ายังไม่เคยเก็บ
            if (!this.originalSource) {
                this.originalSource = this.getVideoUrl();
            }
            
            // ใช้ HLS ตัวอย่าง
            const hlsTestUrl = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
            this.changeVideoSource(hlsTestUrl);
        },
        testYouTubeSource() {
            // เก็บ source เดิมไว้ถ้ายังไม่เคยเก็บ
            if (!this.originalSource) {
                this.originalSource = this.getVideoUrl();
            }
            
            // ใช้ YouTube video ที่ยอมให้ embed (Rick Roll - classic!)
            const youtubeTestUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            this.changeVideoSource(youtubeTestUrl);
            
            // แสดงข้อความแนะนำ
            setTimeout(() => {
                if (this.getVideoType() === 'YouTube') {
                    this.updateDebugInfo({
                        status: 'YouTube loaded - Try custom controls!',
                        error: null
                    });
                }
            }, 2000);
        },
        testCustomSource() {
            if (!this.testSourceUrl.trim()) return;
            
            // เก็บ source เดิมไว้ถ้ายังไม่เคยเก็บ
            if (!this.originalSource) {
                this.originalSource = this.getVideoUrl();
            }
            
            this.changeVideoSource(this.testSourceUrl.trim());
            this.testSourceUrl = ''; // Clear input
        },
        changeVideoSource(newUrl) {
            // เปลี่ยน source โดยการอัพเดต localVideo
            if (this.effectiveType === 'demand') {
                this.localVideo = {
                    ...this.localVideo,
                    desktop: newUrl
                };
            } else if (this.effectiveType === 'streaming') {
                this.localVideo = {
                    ...this.localVideo,
                    streaming: newUrl
                };
            } else if (this.effectiveType === 'live') {
                this.localVideo = {
                    ...this.localVideo,
                    live: newUrl
                };
            } else if (this.effectiveType === 'youtube') {
                this.localVideo = {
                    ...this.localVideo,
                    youtube: newUrl
                };
            }
            
            // Force re-render
            this.videoKey = Date.now();
            
            // Initialize YouTube player ถ้าเป็น YouTube
            if (this.getVideoType() === 'YouTube') {
                this.$nextTick(() => {
                    this.initializeYouTubePlayer();
                });
            }
            
            // Clear error
            this.debugInfo.error = null;
            
            console.log('Changed video source to:', newUrl);
        },
        restoreOriginalSource() {
            if (this.originalSource) {
                this.changeVideoSource(this.originalSource);
                this.originalSource = null; // Reset
                console.log('Restored original source');
            }
        },
        // ตรวจสอบประเภทไฟล์วิดีโอ
        getVideoType() {
            const videoUrl = this.getVideoUrl();
            if (!videoUrl) return 'unknown';
            
            if (videoUrl.endsWith('.m3u8') || videoUrl.includes('manifest/video.m3u8')) {
                return 'HLS';
            } else if (videoUrl.endsWith('.mp4')) {
                return 'MP4';
            } else if (this.effectiveType === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                return 'YouTube';
            } else {
                return 'unknown';
            }
        },
        // สร้าง subtitle สำหรับ overlay
        getVideoTypeSubtitle() {
            const type = this.getVideoType();
            const effectiveType = this.effectiveType;
            
            if (effectiveType === 'live') {
                return 'LIVE STREAMING';
            } else if (type === 'HLS') {
                return 'HLS Video';
            } else if (type === 'MP4') {
                return 'MP4 Video';
            } else if (type === 'YouTube') {
                return 'YouTube Video';
            } else {
                return 'Video';
            }
        },

        // Cookie Management Methods
        setCookie(name, value, days = 365) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
        },

        getCookie(name) {
            const nameEQ = `${name}=`;
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        deleteCookie(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        },

        // User Preferences Management
        saveUserPreferences() {
            try {
                const preferences = {
                    volume: this.userPreferences.volume,
                    lastPlayedTime: this.userPreferences.lastPlayedTime,
                    autoResume: this.userPreferences.autoResume
                };
                this.setCookie('videoPlayerPrefs', JSON.stringify(preferences));
                console.log('✅ User preferences saved:', preferences);
            } catch (error) {
                console.warn('❌ Failed to save user preferences:', error);
            }
        },

        loadUserPreferences() {
            try {
                const savedPrefs = this.getCookie('videoPlayerPrefs');
                if (savedPrefs) {
                    const preferences = JSON.parse(savedPrefs);
                    this.userPreferences = {
                        volume: preferences.volume || 100,
                        lastPlayedTime: preferences.lastPlayedTime || 0,
                        autoResume: preferences.autoResume !== false // default true
                    };
                    console.log('✅ User preferences loaded:', this.userPreferences);
                } else {
                    console.log('📝 No saved preferences found, using defaults');
                }
            } catch (error) {
                console.warn('❌ Failed to load user preferences:', error);
                // ใช้ค่า default หากโหลดไม่ได้
                this.userPreferences = {
                    volume: 100,
                    lastPlayedTime: 0,
                    autoResume: true
                };
            }
        },

        // Video-specific Last Played Time Management
        getVideoIdentifier() {
            // สร้าง unique identifier สำหรับแต่ละวิดีโอ
            const videoUrl = this.getVideoUrl();
            if (!videoUrl) return null;
            
            // ใช้ URL หรือ video ID เป็น identifier
            if (this.getVideoType() === 'YouTube') {
                const videoId = this.getYouTubeVideoId(videoUrl);
                return videoId ? `youtube_${videoId}` : null;
            } else {
                // สำหรับ MP4/HLS ใช้ URL แต่ลบ query parameters
                const cleanUrl = videoUrl.split('?')[0];
                return `video_${btoa(cleanUrl).replace(/[+=/]/g, '')}`; // base64 encode และลบ special chars
            }
        },

        saveLastPlayedTime(currentTime) {
            const videoId = this.getVideoIdentifier();
            if (!videoId || currentTime < 5) return; // ไม่บันทึกถ้าเล่นไปน้อยกว่า 5 วินาที
            
            try {
                this.setCookie(`lastTime_${videoId}`, currentTime.toString(), 30); // เก็บ 30 วัน
                this.userPreferences.lastPlayedTime = currentTime;
                console.log(`💾 Saved last played time: ${this.formatTime(currentTime)} for ${videoId}`);
            } catch (error) {
                console.warn('❌ Failed to save last played time:', error);
            }
        },

        getLastPlayedTime() {
            const videoId = this.getVideoIdentifier();
            if (!videoId) return 0;
            
            try {
                const savedTime = this.getCookie(`lastTime_${videoId}`);
                const time = savedTime ? parseFloat(savedTime) : 0;
                console.log(`🔄 Retrieved last played time: ${this.formatTime(time)} for ${videoId}`);
                return time;
            } catch (error) {
                console.warn('❌ Failed to get last played time:', error);
                return 0;
            }
        },

        // Auto-resume functionality - ปิดใช้งานแล้ว เพราะ UniversalPlayer ทำ auto resume เอง
        async resumeFromLastPosition() {
            // ไม่ต้องทำอะไรแล้ว เพราะ UniversalPlayer จะ auto resume เมื่อกด play
            return;
        },

        // Enhanced Volume Management with Cookie Save
        saveVolumePreference(volume) {
            this.userPreferences.volume = volume;
            this.saveUserPreferences();
        },

        applyVolumePreference() {
            if (this.userPreferences.volume !== 100) {
                console.log(`🔊 Applying saved volume: ${this.userPreferences.volume}%`);
                setTimeout(() => {
                    this.setVolume(this.userPreferences.volume);
                }, 500);
            }
        },

        // Enhanced Player Event Handlers with Cookie Integration
        onPlayerTimeUpdateWithSave(data) {
            // อัปเดต current time และบันทึกทุก 10 วินาที
            this.currentTime = data.currentTime || 0;
            
            // บันทึก last played time ทุก 10 วินาที
            if (Math.floor(this.currentTime) % 10 === 0 && this.currentTime > 0) {
                this.saveLastPlayedTime(this.currentTime);
            }
            
            // เรียก original handler
            this.onPlayerTimeUpdate(data);
        },

        // Clear video history
        clearVideoHistory() {
            const videoId = this.getVideoIdentifier();
            if (videoId) {
                this.deleteCookie(`lastTime_${videoId}`);
                console.log(`🗑️ Cleared history for ${videoId}`);
            }
        },

        clearAllHistory() {
            // ลบ cookies ทั้งหมดที่เกี่ยวกับ video
            const cookies = document.cookie.split(';');
            cookies.forEach(cookie => {
                const name = cookie.split('=')[0].trim();
                if (name.startsWith('lastTime_')) {
                    this.deleteCookie(name);
                }
            });
            console.log('🗑️ Cleared all video history');
        },

        hideYouTubeElements() {
            try {
                // ลบ style เก่าก่อน
                const existingStyle = document.getElementById('youtube-element-hider-gentle');
                if (existingStyle) {
                    existingStyle.remove();
                }

                // สร้าง gentle CSS เพื่อซ่อนเฉพาะ elements ที่จำเป็น
                const style = document.createElement('style');
                style.id = 'youtube-element-hider-gentle';
                
                style.innerHTML = `
                    /* ซ่อนเฉพาะ YouTube Elements ที่จำเป็น - Gentle Mode */
                    .ytp-endscreen-content,
                    .ytp-ce-element,
                    .ytp-cards-teaser,
                    .ytp-pause-overlay,
                    .annotation,
                    .ytp-watermark {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                    }
                `;
                
                document.head.appendChild(style);
                console.log('🛡️ Applied YouTube element hiding - Gentle mode');
                
            } catch (error) {
                console.warn('❌ Error applying gentle YouTube hiding:', error);
            }
        },

        setupYouTubeMutationObserver() {
            // ปิดการใช้งาน mutation observer ชั่วคราวเพื่อไม่ให้รบกวน YouTube player
            console.log('👁️ YouTube DOM mutation observer disabled - Allowing player to load');
        },

        // YouTube Controls Mouse Handling
        handleYouTubeMouseEnter() {
            if (this.youtubePlayerState === 1) { // เฉพาะตอนเล่น
                this.showYouTubeControls = true;
                this.clearYouTubeControlsTimeout();
            }
        },

        handleYouTubeMouseLeave() {
            if (this.youtubePlayerState === 1) { // เฉพาะตอนเล่น
                this.showYouTubeControls = false;
                this.clearYouTubeControlsTimeout();
            }
        },

        handleYouTubeMouseMove() {
            if (this.youtubePlayerState === 1) { // เฉพาะตอนเล่น
                this.showYouTubeControls = true;
                this.clearYouTubeControlsTimeout();
                
                // Auto-hide หลังจาก 3 วินาที
                this.youtubeControlsTimeout = setTimeout(() => {
                    this.showYouTubeControls = false;
                }, 3000);
            }
        },

        clearYouTubeControlsTimeout() {
            if (this.youtubeControlsTimeout) {
                clearTimeout(this.youtubeControlsTimeout);
                this.youtubeControlsTimeout = null;
            }
        },

        // Original methods
        extractVideoID(url) {
            // ตรวจสอบว่า url ไม่เป็น undefined หรือ null ก่อน
            if (!url) return null;
            
            const match = url.match(/\/([a-f0-9-]+)\//);
            return match ? match[1] : null;
        },
        getIframeSrc(videoUrl) {
            // ตรวจสอบว่า videoUrl ไม่เป็น undefined หรือ null ก่อน
            if (!videoUrl) return '';
            
            const videoID = this.extractVideoID(videoUrl);
            if (videoID) {
                return `https://iframe.mediadelivery.net/embed/37374/${videoID}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
            }
            return '';
        },
        getYouTubeEmbedUrl(youtubeUrl) {
            if (!youtubeUrl) return '';
            
            // แปลง YouTube URL เป็น embed format
            let videoId = '';
            
            // ตรวจสอบรูปแบบ URL ต่างๆ
            if (youtubeUrl.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(youtubeUrl.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (youtubeUrl.includes('youtu.be/')) {
                videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
            } else if (youtubeUrl.includes('youtube.com/embed/')) {
                // ถ้าเป็น embed URL อยู่แล้วก็ใช้เลย
                return youtubeUrl;
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`;
            }
            
            return youtubeUrl; // ถ้าแปลงไม่ได้ก็ใช้ URL เดิม
        },
        getYouTubeThumbnail(youtubeUrl, quality = 'hqdefault') {
            if (!youtubeUrl) return '';
            
            let videoId = '';
            
            // ดึง video ID จาก URL รูปแบบต่างๆ
            if (youtubeUrl.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(youtubeUrl.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (youtubeUrl.includes('youtu.be/')) {
                videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
            } else if (youtubeUrl.includes('youtube.com/embed/')) {
                videoId = youtubeUrl.split('embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                // YouTube thumbnail quality options:
                // default.jpg (120x90)
                // mqdefault.jpg (320x180) 
                // hqdefault.jpg (480x360)
                // sddefault.jpg (640x480)
                // maxresdefault.jpg (1280x720) - ไม่มีทุกวีดีโอ
                return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
            }
            
            return '';
        },
        // ดึง video URL ตาม type ปัจจุบัน
        getVideoUrl() {
            if (!this.localVideo) return '';
            
            let url = '';
            switch(this.effectiveType) {
                case 'demand':
                    url = this.localVideo.desktop || this.localVideo.mobile || '';
                    break;
                case 'streaming':
                    url = this.localVideo.streaming || '';
                    break;
                case 'live':
                    url = this.localVideo.live || '';
                    break;
                case 'youtube':
                    url = this.localVideo.youtube || '';
                    // แปลง YouTube URL เป็น embed URL สำหรับ Universal Player
                    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                        return this.getYouTubeEmbedUrl(url);
                    }
                    break;
                default:
                    url = '';
            }
            
            return url;
        },
        // สร้าง iframe URL สำหรับ HLS (ใช้สำหรับ Cloudflare Stream)
        getHLSIframeSrc(videoUrl) {
            if (!videoUrl) return '';
            
            // ถ้าเป็น Cloudflare Stream HLS
            if (videoUrl.includes('cloudflarestream.com') && videoUrl.includes('manifest/video.m3u8')) {
                const videoID = this.extractVideoIDFromCloudflareURL(videoUrl);
                if (videoID) {
                    // ใช้ format ใหม่: https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe
                    return `https://customer-apw77h9sea196rll.cloudflarestream.com/${videoID}/iframe`;
                }
            }
            
            // ถ้าเป็น HLS URL อื่นๆ ให้ใช้ generic HLS player หรือคืน URL เดิม
            // อาจต้องใช้ third-party HLS player เช่น Video.js หรือ Plyr
            return videoUrl;
        },
        onHlsError(err) {
            console.warn('Video Player Error:', err);
            
            // แสดงข้อความ error ใน debug info
            this.debugInfo.error = err;
            
            // สามารถเพิ่ม toast notification หรือ alert ตามต้องการ
            const errorMsg = this.getVideoType() === 'MP4' ? 
                'ไม่สามารถเล่นไฟล์ MP4 ได้' : 
                'ไม่สามารถเล่นไฟล์ HLS ได้';
            
            console.error(errorMsg, err);
        },
        
        // Simple Player Event Handlers for Debug
        onPlayerReady(data) {
            this.updateDebugInfo(data);
            // Auto-resume ถูกยกเลิกแล้ว เพราะ UniversalPlayer ทำ auto resume เอง
            // setTimeout(() => {
            //     this.resumeFromLastPosition();
            // }, 1500);
        },
        onPlayerPlay(data) {
            this.updateDebugInfo(data);
        },
        onPlayerPause(data) {
            this.updateDebugInfo(data);
        },
        onPlayerStop(data) {
            this.updateDebugInfo(data);
        },
        onPlayerTimeUpdate(data) {
            this.updateDebugInfo(data);
            // อัพเดต progress ใน parent component
            this.currentProgress = data.progress || 0;
            this.currentTime = data.currentTime || 0;
            
            // บันทึก last played time ทุก 15 วินาที
            if (Math.floor(this.currentTime) % 15 === 0 && this.currentTime > 0) {
                this.saveLastPlayedTime(this.currentTime);
            }
        },
        onPlayerSeek(data) {
            this.updateDebugInfo(data);
        },
        
        // Picture-in-Picture Event Handlers
        onPlayerEnterPip() {
            console.log('🎬 Picture-in-Picture: Entered');
            this.updateDebugInfo({
                status: 'Picture-in-Picture: Entered',
                pipMode: true
            });
        },
        onPlayerLeavePip() {
            console.log('🎬 Picture-in-Picture: Left');
            this.updateDebugInfo({
                status: 'Picture-in-Picture: Left',
                pipMode: false
            });
        },
        onPlayerPipError(error) {
            console.error('🎬 Picture-in-Picture Error:', error);
            this.updateDebugInfo({
                status: 'Picture-in-Picture Error',
                error: error.message || 'PiP not supported'
            });
        },
        
        // ดึง video ID จาก Cloudflare Stream URL
        extractVideoIDFromCloudflareURL(url) {
            if (!url) return null;
            
            // รูปแบบ: https://customer-apw77h9sea196rll.cloudflarestream.com/{videoID}/manifest/video.m3u8
            const match = url.match(/cloudflarestream\.com\/([a-f0-9-]+)\//);
            return match ? match[1] : null;
        },
        handleCheckboxClick(event) {
            event.stopPropagation();
        },
        saveChanges() {
            const updatedItem = {
                id: this.id,
                name: this.name,
                duration: this.duration,
                description: this.description,
                type: this.type,
                demo: this.demo,
                not_visible: this.not_visible,
                status: this.status,
            };
            
            // ส่งข้อมูล video และ content ตามสถานะปัจจุบันของตัวแปร local
            if (this.localVideo === null) {
                // เมื่อลบวิดีโอ ส่งข้อมูลเปล่าทั้งหมด
                updatedItem.video = null;
                updatedItem.file = '';
                updatedItem.thumbnail = '';
            } else {
                updatedItem.video = this.localVideo;
            }
            
            updatedItem.content = this.localContent;
            
            this.$emit('update-select-player-item', updatedItem);
        },
        deleteItem() {
            const updatedItem = {
                id: this.id,
                _id: this.id, // เพิ่ม _id เพื่อ backward compatibility
            };
            this.$emit('delete-select-player-item', updatedItem);
        },
        removeVideo() {
            // เคลียร์วิดีโอ local data ทันที
            this.localVideo = null;
        },
        removeContent() {
            // ฟังก์ชันสำหรับเคลียร์ข้อมูลตามประเภท (ไม่บันทึกทันที)
            switch(this.effectiveType) {
                case 'document':
                    this.localContent = null;
                    break;
                case 'exam':
                    this.localContent = null;
                    this.questions = [];
                    break;
                default:
                    // สำหรับวิดีโอทุกประเภท
                    this.localVideo = null;
                    // อัพเดต videoKey เพื่อบังคับให้ Vue ลบ element
                    this.videoKey = Date.now();
                    break;
            }
            
            console.log("removeContent - videoKey updated to:", this.videoKey);
        },
        cancelUpdate() {
            this.$emit('cancel-update');
        },
        handleButtonClick(type) {
            console.log("type",type);
            if (type === 'demand') {
                this.OpenVideoBrowser();
            } else if (type === 'document') {
                this.OpenDocumentBrowser();
            } else if (type === 'exam') {
                this.OpenExamBrowser();
            } else {
                this.openSetContentSource(this.selectPlayerItem, type);
            }
        },
        OpenDocumentBrowser() {
            this.DocumentBrowserOpen = true;
        },
        changeDocumentTrigger(payload) {
            this.DocumentBrowserOpen = payload;
        },
        selectDocumentTrigger(payload) {
            if (payload != undefined) {
                // อัปเดต local data ทันที
                this.localContent = payload.file;
                
                const updatedItem = {
                    id: this.id,
                    file: payload.file,
                };
                this.$emit('update-player-document', updatedItem);
            }
        },
        OpenVideoBrowser() {
            this.VideoBrowserOpen = true;
        },
        changeVideoTrigger(payload) {
            this.VideoBrowserOpen = payload;
        },
        selectVideoTrigger(payload) {
            if (payload != undefined) {
                console.log("selectVideoTrigger payload:", payload);
                
                // กำหนด type ตามนามสกุลไฟล์ แต่ไม่เปลี่ยนถ้าเป็น transcode.stream ที่แปลงจาก UID
                let videoType = this.effectiveType;
                
                // ตรวจสอบว่าเป็น transcode.stream ที่แปลงจาก UID หรือไม่
                const isTranscodeStream = payload.selectedResolution === 'stream' ||
                                         (payload.file && payload.file.includes('cloudflarestream.com') && payload.file.includes('manifest/video.m3u8'));
                
                if (payload.file && !isTranscodeStream) {
                    // เปลี่ยน type เฉพาะเมื่อไม่ใช่ transcode.stream
                    if (payload.file.endsWith('.m3u8')) {
                        videoType = 'streaming';
                        this.type = 'streaming'; // อัพเดต type ด้วย
                    } else if (payload.file.endsWith('.mp4')) {
                        videoType = 'demand';
                        this.type = 'demand'; // อัพเดต type ด้วย
                    }
                } else if (isTranscodeStream) {
                    // สำหรับ transcode.stream ให้คงประเภทเดิม (demand) แต่ใช้ URL ที่แปลงแล้ว
                    console.log("Detected transcode.stream - keeping original type:", videoType);
                }
                
                // อัปเดต local data ทันที ตาม type ที่ถูกต้อง
                this.localVideo = {};
                if (videoType === 'streaming') {
                    this.localVideo.streaming = payload.file;
                } else if (videoType === 'demand') {
                    this.localVideo.desktop = payload.file;
                    this.localVideo.mobile = payload.file; // สำหรับ mobile version
                } else if (videoType === 'youtube') {
                    this.localVideo.youtube = payload.file;
                } else if (videoType === 'live') {
                    this.localVideo.live = payload.file;
                }
                
                // อัพเดต videoKey เพื่อบังคับให้ Vue สร้าง element ใหม่
                this.videoKey = Date.now();
                
                console.log("selectVideoTrigger - Updated localVideo:", this.localVideo);
                console.log("selectVideoTrigger - Final videoType:", videoType);
                console.log("selectVideoTrigger - New videoKey:", this.videoKey);
                
                // อัพเดต duration หากมีใน payload
                if (payload.duration) {
                    this.duration = payload.duration;
                }
                
                // บังคับให้ Vue อัพเดตการแสดงผล
                this.$forceUpdate();
                
                const updatedItem = {
                    id: this.id,
                    file: payload.file,
                    duration: payload.duration,
                    thumbnail: payload.thumbnail,
                    filename: payload.filename, // เพิ่ม filename
                    type: videoType // ส่ง type ไปด้วย
                };
                
                console.log("Emitting update-player-video with:", updatedItem);
                this.$emit('update-player-video', updatedItem);
            }
        },
        updateExam(payload) {
            if (payload != undefined) {
                const updatedItem = {
                    id: this.id,
                    questions: this.formattedQuestions,
                };
                this.$emit('update-player-exam', updatedItem);
            }
        },
        openSetContentSource(item, type) {
            console.log("type",item,type);
            this.setContentTriggerObj = item;
            this.contentType = type;
            this.SetContentSourceModal = true;
        },
        SetContentTrigger(payload) {
            console.log("SetContentTrigger",payload);
            this.SetContentSourceModal = payload;
        },
        handleSetContentSource(payload) {
            if (payload != undefined) {
                console.log("handleSetContentSource - Before:", this.localVideo);
                console.log("handleSetContentSource - New URL:", payload.contentURL);
                
                // เคลียร์ข้อมูลเดิมก่อน
                this.removeContent();
                
                // ใช้ $nextTick เพื่อให้ DOM อัพเดตหลังจากเคลียร์ข้อมูลแล้ว
                this.$nextTick(() => {
                    // อัปเดต local data ทันที ตาม type ที่ถูกต้อง
                    this.localVideo = {};
                    if (this.type === 'streaming') {
                        this.localVideo.streaming = payload.contentURL;
                    } else if (this.type === 'demand') {
                        this.localVideo.desktop = payload.contentURL;
                        this.localVideo.mobile = payload.contentURL; // สำหรับ mobile version
                    } else if (this.type === 'youtube') {
                        this.localVideo.youtube = payload.contentURL;
                    } else if (this.type === 'live') {
                        this.localVideo.live = payload.contentURL;
                    }
                    
                    // อัพเดต videoKey เพื่อบังคับให้ Vue สร้าง element ใหม่
                    this.videoKey = Date.now();
                    
                    console.log("handleSetContentSource - After:", this.localVideo);
                    console.log("handleSetContentSource - New videoKey:", this.videoKey);
                    
                    // บังคับให้ Vue อัพเดตการแสดงผล
                    this.$forceUpdate();
                    
                    const updatedItem = {
                        id: this.id,
                        type: this.type,
                        file: payload.contentURL,
                    };
                    this.$emit('update-player-video-url', updatedItem);
                });
                
                this.SetContentSourceModal = false;  // Close modal after setting content source
            }
        },
        handleDataSource() {
            console.log("handleDataSource");
            this.$emit('update-player-data');
        },
        handleTypeChange() {
            this.saveChanges();
        },
        OpenExamBrowser() {
            // Implementation for opening exam browser
        },
        addQuestion() {
            if (this.newQuestion) {
                const newQuestion = {
                    id: Date.now(), // สร้าง ID ที่ไม่ซ้ำกันด้วย timestamp
                    text: this.newQuestion,
                    answers: [],
                    newAnswer: '', // ช่องสำหรับคำตอบใหม่
                    correctAnswer: '', // คำตอบที่ถูกต้อง (เก็บ ID)
                };

                // เพิ่มคำถามใหม่ในอาร์เรย์ questions
                this.questions.push(newQuestion);
                
                // รีเซ็ตค่า newQuestion
                this.newQuestion = '';
            }
        },
        addAnswerToQuestion(index) {
            const question = this.questions[index];
            if (question.newAnswer) {
                question.answers.push({
                    id: Date.now(), // สร้าง ID ที่ไม่ซ้ำกันด้วย timestamp
                    text: question.newAnswer,
                });
                question.newAnswer = ''; // รีเซ็ตช่องคำตอบใหม่
            }
        },
        removeQuestion(index) {
            this.questions.splice(index, 1);
        },
        removeAnswer(questionIndex, answerIndex) {
            this.questions[questionIndex].answers.splice(answerIndex, 1);
        },
        
        // เพิ่ม method สำหรับ Player Configuration
        resetPlayerConfig() {
            this.playerConfig = {
                showBigPlayButton: true,
                showSkipButtons: true,
                showQualitySelector: true,
                showFullscreenButton: true,
                showPipButton: true,
                themeColor: '#3b82f6',
                // Logo Configuration
                logo: {
                    show: false,
                    url: 'https://backend-storage.sgp1.digitaloceanspaces.com/Graphic/Logo/white-logopng-1png.png',
                    alt: 'Brand Logo',
                    width: '80px',
                    height: '40px',
                    maxWidth: '120px',
                    maxHeight: '60px',
                    backgroundClass: 'bg-black/70 border border-white/20',
                    alwaysShow: false,
                    position: 'top-right'
                },
                // Watermark Configuration (Anti-Screen Recording Protection)
                watermark: {
                    show: true,
                    title: 'RESTRICTED',
                    text: 'PROTECTED CONTENT',
                    subtitle: 'UNAUTHORIZED RECORDING PROHIBITED',
                    opacity: '0.3',
                    fontSize: '48px',
                    color: '#ffffff',
                    spacing: 200,
                    rotation: 0
                }
            };
        },
        
        // เพิ่ม methods สำหรับ Logo
        onLogoError(error) {
            console.warn('Logo failed to load:', error);
            // แสดง notification หรือ alert
            alert('ไม่สามารถโหลด Logo ได้: ' + error.url);
        },
        
        onLogoPreviewError() {
            console.warn('Logo preview failed to load');
            // อาจจะแสดง placeholder หรือ message
        },
        
        // Methods สำหรับ Logo Testing
        setDefaultLogo() {
            this.playerConfig.logo.url = 'https://backend-storage.sgp1.digitaloceanspaces.com/Graphic/Logo/white-logopng-1png.png';
            this.playerConfig.logo.width = '80px';
            this.playerConfig.logo.height = '40px';
            this.playerConfig.logo.backgroundClass = 'bg-black/70 border border-white/20';
            this.playerConfig.logo.show = true;
            console.log('Default logo set:', this.playerConfig.logo.url);
        },
        
        setDefaultWatermark() {
            this.playerConfig.watermark.title = 'RESTRICTED';
            this.playerConfig.watermark.text = 'PROTECTED CONTENT';
            this.playerConfig.watermark.subtitle = 'UNAUTHORIZED RECORDING PROHIBITED';
            this.playerConfig.watermark.opacity = 0.3;
            this.playerConfig.watermark.fontSize = '48px';
            this.playerConfig.watermark.color = '#ffffff';
            this.playerConfig.watermark.spacing = 200;
            this.playerConfig.watermark.rotation = 0;
            this.playerConfig.watermark.show = true;
            console.log('Default watermark set:', this.playerConfig.watermark);
        },
        
        testLogoDisplay() {
            if (!this.playerConfig.logo.url) {
                alert('กรุณาใส่ URL Logo ก่อน');
                return;
            }
            
            // เปิดการแสดง logo และแสดงตลอดเวลา
            this.playerConfig.logo.show = true;
            this.playerConfig.logo.alwaysShow = true;
            
            // สร้าง notification
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Logo ทดสอบกำลังแสดงผล</span>
                    </div>
                </div>
            `;
            document.body.appendChild(notification);
            
            // ลบ notification หลัง 3 วินาที
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
            console.log('Logo test activated:', {
                url: this.playerConfig.logo.url,
                position: this.playerConfig.logo.position,
                size: `${this.playerConfig.logo.width} x ${this.playerConfig.logo.height}`
            });
        },

        // เพิ่ม methods สำหรับ HLS debug integration
        updateHLSDebugInfo(data) {
            if (data.currentTime !== undefined) {
                this.playerCurrentTime = data.currentTime;
                this.playerDebugInfo.currentTime = data.currentTime;
            }
            if (data.isPlaying !== undefined) {
                this.playerIsPlaying = data.isPlaying;
                this.playerDebugInfo.isPlaying = data.isPlaying;
            }
            if (data.progress !== undefined) {
                this.currentProgress = data.progress;
                this.playerDebugInfo.progress = data.progress;
            }
            if (data.buffered !== undefined) {
                this.playerDebugInfo.buffered = data.buffered;
            }
        },
    },
};
</script>

<style scoped>
/* Clean minimal styles */
.bg-gray-100 {
    background-color: #f7fafc;
}

/* Smooth transitions for all interactive elements */
* {
    transition: all 0.15s ease-in-out;
}

/* Enhanced form controls */
input:focus, 
select:focus, 
textarea:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Button hover effects */
button:hover {
    transform: translateY(-1px);
}

button:active {
    transform: translateY(0);
}

/* Content area styles */
.content-area {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.content-area::-webkit-scrollbar {
    width: 6px;
}

.content-area::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Icon spacing */
.fa-icon {
    flex-shrink: 0;
}

/* Card hover effects */
.card-hover:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Clean focus states */
.focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* YouTube Element Hiding - MAXIMUM STEALTH MODE */
.youtube-fullscreen-container iframe,
.youtube-fullscreen-container div[id*="youtube-player"] {
    position: relative;
    /* บล็อกการแสดง YouTube UI ทั้งหมด */
    overflow: hidden !important;
}

/* === ซ่อน YouTube Elements ระดับ Global === */
.ytp-endscreen-content,
.ytp-ce-element, 
.ytp-cards-teaser,
.ytp-pause-overlay,
.annotation,
.ytp-info-panel,
.ytp-title,
.ytp-chrome-top,
.ytp-watermark,
.ytp-chrome-bottom,
.ytp-gradient-bottom,
.ytp-chrome-controls,
.ytp-show-cards-title,
.ytp-videowall-still,
.ytp-suggestions-container,
.ytp-endscreen-element,
.ytp-popup,
.ytp-contextmenu,
.ytp-share-panel,
.ytp-settings-menu,
.ytp-youtube-button,
.ytp-watch-later-button,
.ytp-share-button,
.ytp-title-channel,
.ytp-title-text,
.ytp-logo {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
    position: absolute !important;
    top: -9999px !important;
    left: -9999px !important;
    z-index: -1 !important;
}

/* === Force Hide YouTube Control Bar === */
.ytp-play-button,
.ytp-pause-button,
.ytp-mute-button,
.ytp-volume-slider,
.ytp-time-display,
.ytp-progress-bar,
.ytp-fullscreen-button,
.ytp-settings-button,
.ytp-subtitles-button {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
}

/* === Hide YouTube Annotations และ Cards === */
.iv-click-target,
.iv-card,
.iv-drawer,
.annotation-popup,
.annotation-link,
.annotation-speech,
.annotation-highlight,
.annotation-title,
.annotation-pause {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
}

/* === Block YouTube iframe content === */
iframe[src*="youtube.com"],
iframe[src*="youtube-nocookie.com"] {
    /* ป้องกันการแสดง YouTube native UI */
    background: black !important;
}

/* === YouTube Fullscreen Styles === */
.youtube-fullscreen-container:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    background: black;
}

.youtube-fullscreen-container:fullscreen div[id*="youtube-player"] {
    width: 100vw !important;
    height: 100vh !important;
}

.youtube-fullscreen-container:-webkit-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    background: black;
}

.youtube-fullscreen-container:-webkit-full-screen div[id*="youtube-player"] {
    width: 100vw !important;
    height: 100vh !important;
}

.youtube-fullscreen-container:-moz-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    background: black;
}

.youtube-fullscreen-container:-moz-full-screen div[id*="youtube-player"] {
    width: 100vw !important;
    height: 100vh !important;
}

/* Volume Slider Styles */
.slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
}

.slider::-webkit-slider-track {
    background: rgba(255, 255, 255, 0.2);
    height: 4px;
    border-radius: 2px;
}

.slider::-webkit-slider-thumb {
    appearance: none;
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    margin-top: -4px;
}

.slider::-moz-range-track {
    background: rgba(255, 255, 255, 0.2);
    height: 4px;
    border-radius: 2px;
    border: none;
}

.slider::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
}
</style>
