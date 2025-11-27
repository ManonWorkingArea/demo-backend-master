<template>
  <div v-if="$props.isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/55 backdrop-blur-sm"
      @click="closeModal"
    ></div>
    
    <!-- Modal Content - Full Screen Layout -->
    <div class="relative w-full h-full flex flex-col" @click.stop>
      <!-- Header (compact) -->
      <div class="flex items-center justify-between py-3 px-4 bg-white/95 backdrop-blur border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="p-1.5 bg-indigo-100 rounded-lg">
            <i class="fas fa-closed-captioning text-indigo-600 text-lg"></i>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 leading-tight">เครื่องมือสร้าง Subtitle</h3>
            <p class="text-xs text-gray-500 leading-tight">สร้างและแก้ไขคำบรรยายให้กับวิดีโอ</p>
          </div>
        </div>
        <button 
          @click="closeModal"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="fas fa-times text-base"></i>
        </button>
      </div>

      <!-- Top Toolbar: Save / Import / Export -->
      <div class="flex items-center justify-between px-4 py-1.5 bg-gray-50/95 backdrop-blur border-b border-gray-200">
        <div class="flex items-center space-x-2 text-xs text-gray-500">
          <span class="uppercase tracking-wide font-semibold">Project</span>
          <span class="opacity-60">•</span>
          <span>{{ videoFile?.name || 'No file loaded' }}</span>
          <span v-if="videoDuration" class="opacity-60">— {{ Math.round(videoDuration) }}s</span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="undo"
            :disabled="!canUndo"
            class="p-1.5 text-xs bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded transition-colors flex items-center justify-center"
            aria-label="Undo"
            title="ย้อนกลับ (⌘/Ctrl+Z)"
          >
            <i class="fas fa-undo text-xs"></i>
          </button>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="p-1.5 text-xs bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded transition-colors flex items-center justify-center"
            aria-label="Redo"
            title="ทำซ้ำ (Shift+⌘/Ctrl+Z หรือ ⌘/Ctrl+Y)"
          >
            <i class="fas fa-redo text-xs"></i>
          </button>
          <span class="opacity-40">|</span>
          <button
            @click="saveProject"
            class="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center space-x-1.5"
            title="บันทึกเป็น JSON"
          >
            <i class="fas fa-save text-xs"></i>
            <span>Save</span>
          </button>
          <button
            @click="triggerImport"
            class="px-2 py-0.5 text-xs bg-gray-800 hover:bg-black text-white rounded transition-colors flex items-center space-x-1.5"
            title="นำเข้าโปรเจกต์จาก JSON"
          >
            <i class="fas fa-file-import text-xs"></i>
            <span>Import</span>
          </button>
          <!-- AI Transcription Dropdown -->
          <div class="relative" ref="aiDropdownRef">
            <button
              @click="toggleAIDropdown"
              :disabled="isTranscribing || !videoUrl"
              class="px-2 py-0.5 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center space-x-1.5"
              :class="{ 'bg-purple-700': showAIDropdown }"
            >
              <i class="fas" :class="isTranscribing ? 'fa-spinner fa-spin' : 'fa-robot'" text-xs></i>
              <span>{{ isTranscribing ? 'AI กำลังทำงาน...' : 'AI Transcribe' }}</span>
              <i class="fas text-xs transition-transform duration-200" 
                 :class="showAIDropdown ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <!-- AI Options Dropdown - ขยับขึ้นมาแทนที่จะลง -->
            <div 
              v-show="showAIDropdown"
              class="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
              @click.stop
            >
              <div class="py-1">
                <button 
                  @click="startAITranscription"
                  :disabled="isTranscribing"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <i class="fas fa-cloud text-purple-600 w-4 text-sm"></i>
                  <div class="flex-1">
                    <div class="font-medium">OpenAI Whisper API</div>
                    <div class="text-xs text-gray-500">แม่นยำสูง, มีค่าใช้จ่าย</div>
                  </div>
                </button>
                <button 
                  @click="startWebSpeechTranscription"
                  :disabled="isTranscribing"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <i class="fas fa-microphone text-green-600 w-4 text-sm"></i>
                  <div class="flex-1">
                    <div class="font-medium">Web Speech API</div>
                    <div class="text-xs text-gray-500">ฟรี, ต้องเล่นวิดีโอ</div>
                  </div>
                </button>
                <div class="border-t border-gray-100 my-1"></div>
                <div class="px-3 py-2 text-xs text-gray-500">
                  <div class="font-medium text-gray-700 mb-1">💡 คำแนะนำ:</div>
                  <div>• ไฟล์ &lt; 25MB → Whisper API</div>
                  <div>• ไฟล์ใหญ่ → Web Speech API</div>
                  <div>• ภาษาไทย → แนะนำ Web Speech</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Export dropdown button -->
          <div class="relative" ref="exportDropdownRef">
            <button
              @click="toggleExportDropdown"
              class="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center space-x-1.5"
              :class="{ 'bg-green-700': showExportDropdown }"
            >
              <i class="fas fa-download text-xs"></i>
              <span>Export</span>
              <i class="fas text-xs transition-transform duration-200" 
                 :class="showExportDropdown ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <!-- Export Dropdown Menu - ขยับขึ้นมาแทนที่จะลง -->
            <div 
              v-show="showExportDropdown"
              class="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
              @click.stop
            >
              <div class="py-1">
                <button 
                  @click="exportFormat('srt')"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <i class="fas fa-file-alt text-blue-600 w-4 text-sm"></i>
                  <span class="font-medium">SRT Format</span>
                </button>
                <button 
                  @click="exportFormat('vtt')"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <i class="fas fa-file-code text-green-600 w-4 text-sm"></i>
                  <span class="font-medium">WebVTT Format</span>
                </button>
                <button 
                  @click="exportFormat('ass')"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <i class="fas fa-file-video text-purple-600 w-4 text-sm"></i>
                  <span class="font-medium">ASS Format</span>
                </button>
              </div>
            </div>
          </div>
          <!-- hidden file input for import -->
          <input ref="importInputRef" type="file" accept="application/json,.srt,.vtt" class="hidden" @change="handleImportFile" />
        </div>
      </div>
      
      <!-- Video Preview Section - Full Height -->
      <div class="flex-1 bg-white overflow-hidden">
        <!-- Video Preview with Controls (full-width, flush to header/toolbar) -->
        <div v-if="videoUrl" class="h-full flex flex-col">
          <!-- Video Container -->
          <div class="flex-1 bg-black overflow-hidden relative"
               style="min-height: 50vh;">
            <!-- Video Player -->
            <video
              ref="videoRef"
              :src="videoUrl"
              class="w-full h-full object-contain"
              @loadedmetadata="onVideoLoaded"
              @timeupdate="onTimeUpdate"
              @seeked="onVideoSeeked"
              @play="onVideoPlay(); updateBuffered()"
              @pause="onVideoPause"
              @ended="onVideoEnded"
              @progress="updateBuffered"
              playsinline
              preload="metadata"
            ></video>

            <!-- Subtitle Overlay -->
            <div class="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-end space-y-2 pointer-events-none">
              <div v-for="subtitle in activeSubtitles" :key="subtitle.id" 
                   class="subtitle-text bg-black/70 text-white px-4 py-2 rounded-lg max-w-4xl mx-auto"
                   :style="getSubtitleStyle(subtitle)">
                {{ subtitle.text }}
              </div>
            </div>

            <!-- Quick action buttons overlay (add subtitle, preview toggle) -->
            <div class="absolute bottom-4 right-4 flex items-center space-x-2 pointer-events-auto">
              <button 
                @click="addSubtitleAtCurrentTime"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors shadow"
              >
                <i class="fas fa-plus mr-1"></i>
                เพิ่ม Subtitle
              </button>
              <button 
                @click="showPreview = !showPreview"
                :class="showPreview ? 'text-blue-400' : 'text-white/60'"
                class="hover:text-blue-300 transition-colors bg-black/40 backdrop-blur px-3 py-1 rounded"
                title="แสดง/ซ่อน subtitle"
              >
                <i class="fas" :class="showPreview ? 'fa-eye' : 'fa-eye-slash'"></i>
              </button>
            </div>
          </div>

          <!-- Custom Video Controls Bar (below video) -->
          <div class="bg-gray-900 border-t border-gray-700 px-4 py-3">
            <CustomVideoControls
              :current-time="currentTime"
              :duration="videoDuration"
              :buffered="bufferedEnd"
              :playing="isVideoPlaying"
              :volume="volume"
              :muted="isMuted"
              :playback-rate="playbackRate"
              @seek="seekVideo"
              @toggle-play="togglePlay"
              @toggle-mute="toggleMute"
              @change-volume="setVolume"
              @change-rate="setPlaybackRate"
              @toggle-fullscreen="toggleFullscreen"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Panel: Timeline & Subtitle Management -->
      <div class="bg-white border-t border-gray-200 overflow-y-auto" style="max-height: 40vh;">
        <div class="p-6 space-y-6">
          
          <!-- Subtitle Timeline -->
          <div class="subtitle-timeline-container">
            <div class="timeline-header mb-4 flex items-center justify-between">
              <div>
                <h4 class="text-base font-semibold text-gray-900 flex items-center leading-tight">
                  <i class="fas fa-closed-captioning mr-1.5 text-base text-indigo-600"></i>
                  Subtitle Timeline
                </h4>
                <div class="timeline-info flex items-center space-x-3 text-xs text-gray-600 mt-0.5">
                  <span class="subtitle-count">{{ subtitles.length }} subtitles</span>
                  <span class="total-duration">Total: {{ formatTime(videoDuration) }}</span>
                  <!-- Debug Info -->
                  <span class="text-red-500">Modal: {{ showAIModal ? 'OPEN' : 'CLOSED' }}</span>
                  <span class="text-blue-500">Type: {{ aiProcessType || 'None' }}</span>
                  <span class="text-green-500">Subs: {{ subtitles.length }}</span>
                </div>
              </div>
              
              <!-- AI Content Production Workflow -->
              <div class="flex items-center space-x-2">
                <!-- Step 1: Extract Audio/Text from Video -->
                <button 
                  @click.stop="openAIModal('extract')"
                  class="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-blue-50 text-gray-700 rounded font-medium transition-colors flex items-center space-x-1"
                  title="ขั้นตอนที่ 1: แกะเสียงและข้อความจากวิดีโอ"
                >
                  <i class="fas fa-waveform-lines text-xs text-blue-600"></i>
                  <span>แกะเสียง</span>
                </button>
                
                <!-- Step 2: Translate Subtitles -->
                <button 
                  @click.stop="openAIModal('translate')"
                  class="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-green-50 text-gray-700 rounded font-medium transition-colors flex items-center space-x-1"
                  :disabled="subtitles.length === 0"
                  title="ขั้นตอนที่ 2: แปล Subtitle เป็นหลายภาษา"
                >
                  <i class="fas fa-language text-xs text-green-600"></i>
                  <span>แปลภาษา</span>
                </button>
                
                <!-- Step 3: Generate Voice Over -->
                <button 
                  @click.stop="openAIModal('voiceover')"
                  class="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-purple-50 text-gray-700 rounded font-medium transition-colors flex items-center space-x-1"
                  :disabled="subtitles.length === 0"
                  title="ขั้นตอนที่ 3: สร้างเสียงพากย์จาก Subtitle"
                >
                  <i class="fas fa-microphone text-xs text-purple-600"></i>
                  <span>พากย์เสียง</span>
                </button>
                
                <!-- Step 4: Audio Enhancement -->
                <button 
                  @click.stop="openAIModal('audiofix')"
                  class="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-orange-50 text-gray-700 rounded font-medium transition-colors flex items-center space-x-1"
                  title="ขั้นตอนที่ 4: ปรับแต่งคุณภาพเสียงและเอฟเฟกต์"
                >
                  <i class="fas fa-sliders text-xs text-orange-600"></i>
                  <span>แก้เสียง</span>
                </button>
                
                <!-- Divider -->
                <span class="text-gray-300">|</span>
                
                <!-- Additional Tools -->
                <button 
                  @click.stop="openAIModal('enhance')"
                  class="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-amber-50 text-gray-700 rounded font-medium transition-colors flex items-center space-x-1"
                  :disabled="subtitles.length === 0"
                  title="ปรับปรุงคุณภาพ Subtitle"
                >
                  <i class="fas fa-wand-magic-sparkles text-xs text-amber-600"></i>
                  <span>ปรับปรุง Sub</span>
                </button>
                
                <button 
                  @click="autoArrangeSubtitles"
                  class="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors flex items-center space-x-1"
                  :disabled="subtitles.length === 0"
                  title="จัดเรียงเวลาให้ต่อเนื่อง"
                >
                  <i class="fas fa-sort text-xs"></i>
                  <span>จัดเรียง</span>
                </button>
              </div>
            </div>

            <!-- Timeline Ruler -->
            <div class="timeline-ruler relative h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-visible mb-4"
                 @click="onTimelineClick">
              
              <!-- Time markers -->
              <div class="time-markers absolute inset-0">
                <div v-for="marker in timeMarkers" :key="marker.time" 
                     class="time-marker absolute top-0 h-full border-l border-gray-300" 
                     :style="{ left: marker.position + '%' }">
                  <span class="time-label absolute -top-5 text-xs text-gray-500 transform -translate-x-1/2">
                    {{ formatTime(marker.time) }}
                  </span>
                </div>
              </div>

              <!-- Current time indicator (draggable playhead) -->
              <div 
                v-if="videoDuration > 0"
                class="absolute top-0 bottom-0 z-40 group"
                :style="{ left: Math.min(100, Math.max(0, (currentTime / videoDuration) * 100)) + '%' }"
              >
                <!-- Drag handle (wider invisible area for easier grabbing) -->
                <div 
                  class="absolute top-0 -left-2 w-4 h-full cursor-ew-resize playhead-hit flex items-center justify-center"
                  @mousedown.stop="startPlayheadDrag"
                  title="ลากเพื่อเลื่อนเวลา"
                >
                  <div class="w-0.5 h-full bg-red-500 opacity-90"></div>
                </div>
                <!-- Time label -->
                <div class="absolute -top-3 -translate-x-1/2 select-none">
                  <div class="px-1 py-0.5 bg-red-500 text-white text-xs rounded font-mono shadow-sm">
                    {{ formatTime(currentTime) }}
                  </div>
                </div>
              </div>

              <!-- Subtitle blocks -->
              <div class="subtitle-tracks absolute inset-0 pt-6">
                <div 
                  v-for="subtitle in sortedSubtitles" 
                  :key="subtitle.id"
                  class="subtitle-block absolute h-8 bg-blue-500 text-white text-xs flex items-center px-2 rounded cursor-pointer hover:bg-blue-600 transition-colors"
                  :class="{ 'selected': selectedSubtitle?.id === subtitle.id }"
                  :style="getSubtitleBlockStyle(subtitle)"
                  @click.stop="selectSubtitle(subtitle)"
                  @mousedown.stop="startDragSubtitle($event, subtitle)"
                >
                  <span class="truncate">{{ subtitle.text }}</span>
                  
                  <!-- Resize handles -->
                  <div 
                    class="resize-handle resize-handle-start absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
                    @mousedown.stop="startResizeSubtitle($event, subtitle, 'start')"
                  ></div>
                  <div 
                    class="resize-handle resize-handle-end absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
                    @mousedown.stop="startResizeSubtitle($event, subtitle, 'end')"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtitle Editor Panel -->
          <div v-if="selectedSubtitle" class="subtitle-editor bg-white rounded-lg shadow border border-gray-200">
            <!-- Compact Header -->
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-edit text-blue-600 text-sm"></i>
                <h5 class="text-sm font-semibold text-gray-900">แก้ไข Subtitle</h5>
              </div>
              <button 
                @click="deleteSubtitle(selectedSubtitle.id)"
                class="w-7 h-7 rounded bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors flex items-center justify-center"
                title="ลบ subtitle นี้"
              >
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
            
            <!-- Compact Content -->
            <div class="p-4">
              <div class="grid grid-cols-12 gap-4">
                <!-- Text Editor - Takes more space -->
                <div class="col-span-12 lg:col-span-7">
                  <label class="block text-xs font-medium text-gray-600 mb-2">ข้อความ</label>
                  <div class="relative">
                    <textarea
                      v-model="selectedSubtitle.text"
                      @input="updateSubtitle"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="2"
                      placeholder="พิมพ์ข้อความ subtitle..."
                    ></textarea>
                    <span class="absolute bottom-1 right-2 text-xs text-gray-400">{{ selectedSubtitle.text.length }}</span>
                  </div>
                </div>
                
                <!-- Time Controls - Compact -->
                <div class="col-span-12 lg:col-span-5">
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Start Time -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-2">เริ่ม</label>
                      <div class="relative">
                        <input
                          type="text"
                          :value="formatTimeMs(selectedSubtitle.startTime)"
                          @input="updateSubtitleTime('start', $event.target.value)"
                          class="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-gray-50"
                          placeholder="00:00:00.000"
                        />
                        <button
                          @click="setSubtitleTimeFromCurrent('start')"
                          class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center justify-center"
                          title="ใช้เวลาปัจจุบัน"
                        >
                          <i class="fas fa-crosshairs text-xs"></i>
                        </button>
                      </div>
                    </div>
                    
                    <!-- End Time -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-2">สิ้นสุด</label>
                      <div class="relative">
                        <input
                          type="text"
                          :value="formatTimeMs(selectedSubtitle.endTime)"
                          @input="updateSubtitleTime('end', $event.target.value)"
                          class="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-gray-50"
                          placeholder="00:00:00.000"
                        />
                        <button
                          @click="setSubtitleTimeFromCurrent('end')"
                          class="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center justify-center"
                          title="ใช้เวลาปัจจุบัน"
                        >
                          <i class="fas fa-crosshairs text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Duration Info - Inline -->
                  <div class="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>ระยะเวลา:</span>
                    <span class="font-mono font-medium">{{ formatDuration(selectedSubtitle.endTime - selectedSubtitle.startTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer (compact) -->
      <div class="flex items-center justify-end py-3 px-4 border-t border-gray-200 bg-gray-50/95 backdrop-blur">
        <div class="flex space-x-2">
          <button 
            @click="closeModal"
            class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors"
          >
            ปิด
          </button>
          <button 
            @click="exportSubtitles"
            :disabled="subtitles.length === 0"
            class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <i class="fas fa-download text-xs"></i>
            <span>Export Subtitle</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AI Modals แยกตามประเภท -->
    <AudioExtractModal
      v-if="showAIModal && aiProcessType === 'extract'"
      :progress="aiProgress"
      :status="aiStatus"
      @close="closeAIModal"
      @start-process="handleAIProcess"
      @next-step="switchToNextStep"
    />
    
    <TranslationModal
      v-if="showAIModal && aiProcessType === 'translate'"
      :progress="aiProgress"
      :status="aiStatus"
      @close="closeAIModal"
      @start-process="handleAIProcess"
      @next-step="switchToNextStep"
    />
    
    <VoiceOverModal
      v-if="showAIModal && aiProcessType === 'voiceover'"
      :progress="aiProgress"
      :status="aiStatus"
      @close="closeAIModal"
      @start-process="handleAIProcess"
      @next-step="switchToNextStep"
    />
    
    <AudioFixModal
      v-if="showAIModal && aiProcessType === 'audiofix'"
      :progress="aiProgress"
      :status="aiStatus"
      @close="closeAIModal"
      @start-process="handleAIProcess"
      @complete="completeAIProcess"
    />

    <!-- Legacy AI Processing Modal (สำหรับ backup) -->
    <div v-if="false" class="fixed inset-0 z-[99999] overflow-hidden"
         style="z-index: 99999 !important;">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/55 backdrop-blur-sm" @click="closeAIModal"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full h-full flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          
          <!-- Header (คล้ายกับ header หลัก) -->
          <div class="flex items-center justify-between py-3 px-4 bg-white/95 backdrop-blur border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="p-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <i class="fas fa-robot text-purple-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900 leading-tight">{{ getAIModalTitle() }}</h3>
                <p class="text-xs text-gray-500 leading-tight">{{ aiStatus }}</p>
              </div>
            </div>
            <button 
              @click="closeAIModal"
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times text-base"></i>
            </button>
          </div>

          <!-- Content Area (คล้ายกับ bottom panel หลัก) -->
          <div class="flex-1 bg-white overflow-y-auto">
            <div class="p-6 space-y-6">
              
              <!-- Content based on AI Process Type -->
              
              <!-- Audio Extraction Settings -->
              <div v-if="aiProcessType === 'extract'" class="space-y-4">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-waveform-lines text-purple-600 text-base"></i>
                  <h4 class="text-base font-semibold text-gray-900">ขั้นตอนที่ 1: แกะเสียงและข้อความจากวิดีโอ</h4>
                </div>
                
                <!-- Workflow Status -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <div class="flex items-center space-x-2 mb-3">
                    <i class="fas fa-route text-blue-600"></i>
                    <h5 class="text-sm font-semibold text-gray-900">กระบวนการผลิตเนื้อหาแบบครบวงจร</h5>
                  </div>
                  <div class="text-xs text-gray-600 space-y-1">
                    <div>📹 <strong>ขั้นตอนที่ 1:</strong> แกะเสียงจากวิดีโอต้นฉบับ → ได้ Subtitle ภาษาแม่</div>
                    <div>🌐 <strong>ขั้นตอนที่ 2:</strong> แปลภาษา → ได้ Subtitle หลายภาษา</div>
                    <div>🎤 <strong>ขั้นตอนที่ 3:</strong> สร้างเสียงพากย์ → ได้เนื้อหาวิดีโอหลายภาษา</div>
                  </div>
                </div>
                
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div class="space-y-4">
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">เลือกรูปแบบการแกะข้อมูล</h5>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label class="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" v-model="extractionType" value="high_quality" class="text-purple-600" />
                          <div>
                            <div class="font-medium text-sm">คุณภาพสูง (Whisper API)</div>
                            <div class="text-xs text-gray-500">แม่นยำ 95%+, รองรับ 99 ภาษา</div>
                          </div>
                        </label>
                        <label class="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" v-model="extractionType" value="fast_free" class="text-purple-600" />
                          <div>
                            <div class="font-medium text-sm">รวดเร็วฟรี (Web Speech)</div>
                            <div class="text-xs text-gray-500">แม่นยำ 85%, ไม่มีค่าใช้จ่าย</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-2">ภาษาของเนื้อหาในวิดีโอ</h5>
                      <select v-model="sourceLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="auto">🤖 ตรวจจับอัตโนมัติ (แนะนำ)</option>
                        <option value="th">🇹🇭 ไทย</option>
                        <option value="en">🇺🇸 อังกฤษ</option>
                        <option value="ja">🇯🇵 ญี่ปุ่น</option>
                        <option value="my">พม่า</option>
                        <option value="zh">🇨🇳 จีน</option>
                        <option value="de">🇩🇪 เยอรมัน</option>
                      </select>
                    </div>

                    <!-- Advanced Options -->
                    <div class="border-t pt-4">
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">ตัวเลือกขั้นสูง</h5>
                      <div class="space-y-3">
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="extractionOptions" value="remove_background_noise" class="text-purple-600" />
                          <span class="text-sm">ลดเสียงรบกวนเบื้องหลัง</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="extractionOptions" value="enhance_voice" class="text-purple-600" />
                          <span class="text-sm">เพิ่มความชัดของเสียงพูด</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="extractionOptions" value="auto_punctuation" class="text-purple-600" />
                          <span class="text-sm">ใส่เครื่องหมายวรรคตอนอัตโนมัติ</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Enhancement Settings -->
              <div v-if="aiProcessType === 'enhance'" class="space-y-4">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-wand-magic-sparkles text-amber-600 text-base"></i>
                  <h4 class="text-base font-semibold text-gray-900">ปรับปรุงคุณภาพ Subtitle</h4>
                </div>
                
                <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div class="space-y-4">
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">เลือกประเภทการปรับปรุง</h5>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="enhancementOptions" value="grammar" class="text-amber-600" />
                          <span class="text-sm">แก้ไขไวยากรณ์และการสะกดคำ</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="enhancementOptions" value="timing" class="text-amber-600" />
                          <span class="text-sm">ปรับจังหวะเวลาให้เหมาะสม</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="enhancementOptions" value="formatting" class="text-amber-600" />
                          <span class="text-sm">จัดรูปแบบข้อความให้สวยงาม</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="enhancementOptions" value="consistency" class="text-amber-600" />
                          <span class="text-sm">ปรับความสอดคล้องของคำศัพท์</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Audio Enhancement Settings -->
              <div v-if="aiProcessType === 'audiofix'" class="space-y-4">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-sliders text-orange-600 text-base"></i>
                  <h4 class="text-base font-semibold text-gray-900">ขั้นตอนที่ 4: แก้ไขและปรับแต่งเสียง</h4>
                </div>
                
                <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div class="space-y-4">
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">เลือกไฟล์เสียงที่ต้องการปรับแต่ง</h5>
                      <div class="grid grid-cols-1 gap-3">
                        <div v-for="audioFile in mockAudioFiles" :key="audioFile.id" 
                             class="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div class="flex items-center space-x-3">
                            <i class="fas fa-file-audio text-orange-600"></i>
                            <div>
                              <div class="font-medium text-sm">{{ audioFile.name }}</div>
                              <div class="text-xs text-gray-500">{{ audioFile.language }} • {{ audioFile.duration }}s • {{ audioFile.size }}</div>
                            </div>
                          </div>
                          <input type="checkbox" v-model="selectedAudioFiles" :value="audioFile.id" class="text-orange-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">การปรับแต่งคุณภาพเสียง</h5>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="audioFixOptions" value="noise_reduction" class="text-orange-600" />
                          <span class="text-sm">ลดเสียงรบกวนเบื้องหลัง</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="audioFixOptions" value="voice_enhance" class="text-orange-600" />
                          <span class="text-sm">เพิ่มความชัดเจนของเสียงพูด</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="audioFixOptions" value="volume_normalize" class="text-orange-600" />
                          <span class="text-sm">ปรับระดับเสียงให้สม่ำเสมอ</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="audioFixOptions" value="echo_remove" class="text-orange-600" />
                          <span class="text-sm">ลดเสียงก้อง</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h5 class="text-sm font-semibold text-gray-900 mb-3">เอฟเฟกต์เสียง</h5>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Bass</label>
                          <input type="range" v-model="audioSettings.bass" min="-10" max="10" 
                                 class="w-full accent-orange-600" />
                          <div class="text-xs text-gray-500">{{ audioSettings.bass }}dB</div>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-1">Treble</label>
                          <input type="range" v-model="audioSettings.treble" min="-10" max="10" 
                                 class="w-full accent-orange-600" />
                          <div class="text-xs text-gray-500">{{ audioSettings.treble }}dB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Language Selection (for translate/voiceover) -->
              <div v-if="aiProcessType === 'translate' || aiProcessType === 'voiceover'" class="space-y-4">
                <div class="flex items-center space-x-2">
                  <i class="fas text-base" :class="aiProcessType === 'translate' ? 'fa-language text-green-600' : 'fa-microphone text-purple-600'"></i>
                  <h4 class="text-base font-semibold text-gray-900">
                    {{ aiProcessType === 'translate' ? 'ขั้นตอนที่ 2: แปล Subtitle เป็นภาษาอื่น' : 'ขั้นตอนที่ 3: สร้างเสียงพากย์จาก Subtitle' }}
                  </h4>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <!-- Current Subtitle Info -->
                  <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <i class="fas fa-info-circle text-blue-600"></i>
                      <span class="text-sm font-semibold text-gray-900">Subtitle ต้นฉบับที่จะแปล</span>
                    </div>
                    <div class="text-xs text-gray-600">
                      <div>📝 จำนวน Subtitle: <strong>{{ subtitles.length }} รายการ</strong></div>
                      <div>⏱️ ระยะเวลารวม: <strong>{{ formatTime(videoDuration) }}</strong></div>
                      <div>🎯 คำประมาณ: <strong>{{ estimateWordCount() }} คำ</strong></div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label v-for="lang in availableLanguages" :key="lang.code" 
                           class="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           :class="{ 'border-green-500 bg-green-50 shadow-sm': selectedLanguages.includes(lang.code) }">
                      <input 
                        type="checkbox" 
                        :value="lang.code"
                        v-model="selectedLanguages"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div class="flex items-center space-x-2">
                        <span class="text-lg">{{ getLanguageFlag(lang.code) }}</span>
                        <div class="flex-1">
                          <div class="font-medium text-sm text-gray-900">{{ lang.name }}</div>
                          <div class="text-xs text-gray-500">{{ lang.native }}</div>
                          <div class="text-xs text-green-600 font-medium" v-if="selectedLanguages.includes(lang.code)">
                            ✓ จะสร้าง {{ subtitles.length }} Subtitle
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Translation Settings -->
                  <div class="mt-4 border-t pt-4">
                    <h5 class="text-sm font-semibold text-gray-900 mb-3">การตั้งค่าการแปล</h5>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบการแปล</label>
                        <select v-model="translationStyle" class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                          <option value="formal">เป็นทางการ (Formal)</option>
                          <option value="casual">สบายๆ (Casual)</option>
                          <option value="literal">แปลตรงตัว (Literal)</option>
                          <option value="creative">สร้างสรรค์ (Creative)</option>
                        </select>
                      </div>
                      <div class="flex items-center space-x-4">
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="translationOptions" value="preserve_timing" class="text-green-600" />
                          <span class="text-sm">รักษาจังหวะเวลาเดิม</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input type="checkbox" v-model="translationOptions" value="cultural_adapt" class="text-green-600" />
                          <span class="text-sm">ปรับให้เข้ากับวัฒนธรรม</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Voice Selection & TTS Settings (for voiceover) -->
                <div v-if="aiProcessType === 'voiceover'" class="space-y-4">
                  <div class="bg-white rounded-lg border border-gray-200 p-4">
                    <h5 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <i class="fas fa-microphone text-green-600 mr-2"></i>
                      การตั้งค่าเสียงพากย์ (Text-to-Speech)
                    </h5>
                    
                    <div class="space-y-4">
                      <!-- Voice Type Selection -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-2">ประเภทเสียง</label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input type="radio" v-model="voiceType" value="natural" class="text-green-600" />
                            <span class="text-sm">เสียงธรรมชาติ</span>
                          </label>
                          <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input type="radio" v-model="voiceType" value="professional" class="text-green-600" />
                            <span class="text-sm">เสียงพากย์มืออาชีพ</span>
                          </label>
                          <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input type="radio" v-model="voiceType" value="clone" class="text-green-600" />
                            <span class="text-sm">โคลนเสียงต้นฉบับ</span>
                          </label>
                        </div>
                      </div>
                      
                      <!-- Voice Speed & Pitch -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-2">ความเร็วเสียง</label>
                          <select v-model="voiceSpeed" class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <option value="0.8">ช้า (0.8x)</option>
                            <option value="1.0" selected>ปกติ (1.0x)</option>
                            <option value="1.2">เร็ว (1.2x)</option>
                            <option value="1.5">เร็วมาก (1.5x)</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 mb-2">โทนเสียง</label>
                          <select v-model="voicePitch" class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <option value="low">เสียงต่ำ</option>
                            <option value="normal" selected>เสียงปกติ</option>
                            <option value="high">เสียงสูง</option>
                          </select>
                        </div>
                      </div>
                      
                      <!-- Output Format -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-2">รูปแบบไฟล์เสียง</label>
                        <div class="flex space-x-4">
                          <label class="flex items-center space-x-2">
                            <input type="radio" v-model="audioFormat" value="mp3" class="text-green-600" />
                            <span class="text-sm">MP3 (คุณภาพมาตรฐาน)</span>
                          </label>
                          <label class="flex items-center space-x-2">
                            <input type="radio" v-model="audioFormat" value="wav" class="text-green-600" />
                            <span class="text-sm">WAV (คุณภาพสูง)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Section (คล้าย timeline style) -->
              <div v-if="aiProgress > 0" class="bg-white rounded-lg shadow border border-gray-200">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <i class="fas fa-chart-line text-indigo-600 text-sm"></i>
                      <h5 class="text-sm font-semibold text-gray-900">ความคืบหน้า</h5>
                    </div>
                    <span class="text-sm font-medium text-gray-600">{{ Math.round(aiProgress) }}%</span>
                  </div>
                </div>
                
                <div class="p-4 space-y-4">
                  <!-- Progress Bar (คล้าย timeline ruler) -->
                  <div class="relative h-4 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg transition-all duration-500 ease-out"
                      :style="{ width: aiProgress + '%' }"
                    ></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-700">{{ Math.round(aiProgress) }}%</span>
                    </div>
                  </div>
                  
                  <!-- Current Task -->
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <i class="fas fa-spinner fa-spin text-indigo-600"></i>
                    <span>{{ aiStatus }}</span>
                  </div>

                  <!-- Processing Languages List -->
                  <div v-if="selectedLanguages.length > 0" class="space-y-2">
                    <h6 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">ภาษาที่กำลังประมวลผล</h6>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div v-for="langCode in selectedLanguages" :key="langCode" 
                           class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div class="flex items-center space-x-2">
                          <span class="text-base">{{ getLanguageFlag(langCode) }}</span>
                          <span class="text-sm font-medium text-gray-700">{{ getLanguageName(langCode) }}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <i class="fas fa-check-circle text-green-500" v-if="isLanguageCompleted(langCode)"></i>
                          <i class="fas fa-spinner fa-spin text-indigo-500" v-else-if="isLanguageProcessing(langCode)"></i>
                          <i class="fas fa-clock text-gray-400" v-else></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Results Section (แสดงผลลัพธ์แบบง่าย) -->
              <div v-if="aiProgress >= 100" 
                   :key="`results-${aiProcessType}-${aiProgress}`"
                   class="bg-white rounded-lg shadow border border-gray-200">
                <div class="bg-green-50 px-4 py-3 border-b border-green-200">
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-check-circle text-green-600 text-base"></i>
                    <h5 class="text-sm font-semibold text-green-800">การประมวลผลเสร็จสิ้น!</h5>
                  </div>
                </div>
                
                <div class="p-4">
                  <p class="text-sm text-gray-700">
                    <i class="fas fa-sparkles text-purple-600 mr-1"></i>
                    <span>{{ getAIResultMessage() }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions (คล้าย footer หลัก) -->
          <div class="flex items-center justify-between py-3 px-4 border-t border-gray-200 bg-gray-50/95 backdrop-blur">
            <div class="flex items-center space-x-3 text-xs text-gray-600">
              <div class="flex items-center space-x-1">
                <i class="fas fa-info-circle text-gray-400"></i>
                <span v-if="aiProcessType === 'translate'">แปลด้วย AI จะช่วยให้เข้าถึงผู้ชมได้หลากหลายภาษา</span>
                <span v-else-if="aiProcessType === 'voiceover'">พากย์เสียงด้วย AI เพื่อประสบการณ์ที่สมจริง</span>
                <span v-else>เลือกฟีเจอร์ AI ที่ต้องการใช้งาน</span>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button 
                v-if="aiProgress === 0 && canStartProcess()"
                @click="startAIProcess"
                class="px-4 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5"
              >
                <i class="fas fa-play text-xs"></i>
                <span>เริ่มประมวลผล</span>
              </button>
              
              <button 
                v-if="aiProgress >= 100"
                @click="applyAIResult"
                class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5"
              >
                <i class="fas fa-check text-xs"></i>
                <span>ใช้ผลลัพธ์</span>
              </button>
              
              <button 
                @click="closeAIModal"
                class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors"
              >
                <span v-if="aiProgress > 0 && aiProgress < 100">ยกเลิก</span>
                <span v-else>ปิด</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import toast from '@/plugins/ToastUI.js';
import CustomVideoControls from './videoEditor/CustomVideoControls.vue';
import AudioExtractModal from './ai/AudioExtractModal.vue';
import TranslationModal from './ai/TranslationModal.vue';
import VoiceOverModal from './ai/VoiceOverModal.vue';
import AudioFixModal from './ai/AudioFixModal.vue';

export default {
  name: 'VideoSubtitle',
  components: { 
    CustomVideoControls,
    AudioExtractModal,
    TranslationModal,
    VoiceOverModal,
    AudioFixModal
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    file: {
      type: Object,
      default: null
    },
    fileUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'subtitled'],
  setup(props, { emit }) {
    // Core state
  const videoRef = ref(null);
  // Custom player state
  const volume = ref(1);
  const isMuted = ref(false);
  const playbackRate = ref(1);
  const bufferedEnd = ref(0);
    const importInputRef = ref(null);
    const exportDropdownRef = ref(null);
    const videoFile = ref(null);
    const videoUrl = ref('');
    const videoDuration = ref(0);
    const currentTime = ref(0);
    const isVideoPlaying = ref(false);
    const onVideoPlay = () => { 
      console.log('🟢 onVideoPlay event triggered'); 
      isVideoPlaying.value = true; 
      console.log('🟢 isVideoPlaying set to:', isVideoPlaying.value);
    };
    const onVideoPause = () => { 
      console.log('🔴 onVideoPause event triggered'); 
      isVideoPlaying.value = false; 
      console.log('🔴 isVideoPlaying set to:', isVideoPlaying.value);
    };
    const onVideoEnded = () => { 
      console.log('⚫ onVideoEnded event triggered'); 
      isVideoPlaying.value = false; 
      console.log('⚫ isVideoPlaying set to:', isVideoPlaying.value);
    };
    const updateBuffered = () => {
      const el = videoRef.value;
      if (!el || !el.buffered || el.buffered.length === 0) { bufferedEnd.value = 0; return; }
      try {
        bufferedEnd.value = el.buffered.end(el.buffered.length - 1);
      } catch (e) {
        bufferedEnd.value = 0;
      }
    };

    const togglePlay = async () => {
      const el = videoRef.value;
      if (!el) return;
      
      console.log('🔄 togglePlay called, current state - paused:', el.paused, 'ended:', el.ended);
      console.log('🔄 Current isVideoPlaying:', isVideoPlaying.value);
      
      try {
        if (el.paused || el.ended) {
          console.log('▶️ Attempting to play video...');
          isVideoPlaying.value = true; // immediate UI feedback
          console.log('▶️ Set isVideoPlaying to true immediately');
          await el.play();
          console.log('✅ Video started playing successfully');
        } else {
          console.log('⏸️ Attempting to pause video...');
          isVideoPlaying.value = false; // immediate UI feedback
          console.log('⏸️ Set isVideoPlaying to false immediately');
          el.pause();
          console.log('✅ Video paused successfully');
        }
      } catch (error) {
        console.warn('❌ Play/pause failed:', error);
        // Sync with actual video state if error occurs
        isVideoPlaying.value = !el.paused && !el.ended;
        console.log('🔄 Synced isVideoPlaying to actual state:', isVideoPlaying.value);
      }
    };
    // New player helper methods
    const seekVideo = (time) => {
      if (!videoRef.value || isNaN(time)) return;
      videoRef.value.currentTime = Math.min(videoDuration.value, Math.max(0, time));
      currentTime.value = videoRef.value.currentTime;
    };
    const toggleMute = () => {
      isMuted.value = !isMuted.value;
      if (videoRef.value) videoRef.value.muted = isMuted.value;
    };
    const setVolume = (v) => {
      volume.value = Math.min(1, Math.max(0, v));
      if (videoRef.value) {
        videoRef.value.volume = volume.value;
        if (volume.value === 0) isMuted.value = true; else if (isMuted.value) isMuted.value = false;
      }
    };
    const setPlaybackRate = (r) => {
      playbackRate.value = r;
      if (videoRef.value) videoRef.value.playbackRate = r;
    };
    const toggleFullscreen = () => {
      const container = videoRef.value?.parentElement;
      if (!container) return;
      if (!document.fullscreenElement) container.requestFullscreen?.(); else document.exitFullscreen?.();
    };
    const showPreview = ref(true);
    
    // Subtitle state
    const showExportDropdown = ref(false);
    const showAIDropdown = ref(false);
    const aiDropdownRef = ref(null);
    const isTranscribing = ref(false);
    const transcriptionProgress = ref(0);
    
    // AI Processing Modal State
    const showAIModal = ref(false);
    const aiProcessType = ref(''); // 'transcribe', 'translate', 'voiceover'
    const aiProgress = ref(0);
    const aiStatus = ref('');
    const aiResult = ref(null);
    const selectedLanguages = ref([]);
    const masterSubtitles = ref([]);
    
    const toggleExportDropdown = () => {
      showExportDropdown.value = !showExportDropdown.value;
    };
    
    const closeExportDropdown = () => {
      showExportDropdown.value = false;
    };
    
    const toggleAIDropdown = () => {
      showAIDropdown.value = !showAIDropdown.value;
    };
    
    const closeAIDropdown = () => {
      showAIDropdown.value = false;
    };
    
    // AI Modal Data
    const voiceType = ref('natural');
    const voiceSpeed = ref('1.0');
    const voicePitch = ref('normal');
    const audioFormat = ref('mp3');
    const extractionType = ref('audio_text');
    const sourceLanguage = ref('auto');
    const enhancementOptions = ref(['grammar', 'timing']);
    const extractionOptions = ref(['remove_background_noise', 'auto_punctuation']);
    
    // Audio Fix Data
    const selectedAudioFiles = ref([]);
    const audioFixOptions = ref(['noise_reduction', 'voice_enhance']);
    const audioSettings = ref({
      bass: 0,
      treble: 0
    });
    
    // Translation Data
    const translationStyle = ref('formal');
    const translationOptions = ref(['preserve_timing']);
    
    // Mock Data for Demonstration
    const mockAudioFiles = ref([
      { id: 'audio_th', name: 'voice_thai.mp3', language: 'ไทย', duration: 180, size: '2.1MB' },
      { id: 'audio_en', name: 'voice_english.mp3', language: 'English', duration: 175, size: '2.0MB' },
      { id: 'audio_ja', name: 'voice_japanese.mp3', language: '日本語', duration: 190, size: '2.3MB' },
      { id: 'audio_zh', name: 'voice_chinese.mp3', language: '中文', duration: 185, size: '2.2MB' }
    ]);
    
    const availableLanguages = [
      { code: 'th', name: 'Thai', native: 'ไทย' },
      { code: 'zh', name: 'Chinese', native: '中文'},
      { code: 'ja', name: 'Japanese', native: '日本語' },
      { code: 'my', name: 'Myanmar', native: 'မြန်မာ' },
      { code: 'en', name: 'English', native: 'English'},
      { code: 'de', name: 'German', native: 'Deutsch' },
    ];
    const processingStatus = ref({});
    
    // AI Modal Methods
    const openAIModal = (type) => {
      console.log('🚀 Opening AI Modal with type:', type);
      
      // Close any open dropdowns first
      showAIDropdown.value = false;
      showExportDropdown.value = false;
      
      aiProcessType.value = type;
      showAIModal.value = true;
      aiProgress.value = 0;
      aiStatus.value = getInitialStatus(type);
      selectedLanguages.value = [];
      processingStatus.value = {};
      
      // Set master subtitles if available
      if (subtitles.value.length > 0) {
        masterSubtitles.value = [...subtitles.value];
        console.log('📝 Set master subtitles:', masterSubtitles.value.length, 'items');
      } else if (type === 'extract') {
        // Add sample subtitles for demo purposes
        const sampleSubtitles = [
          { id: generateId(), text: 'สวัสดีครับ ยินดีต้อนรับสู่วิดีโอนี้', startTime: 1, endTime: 4 },
          { id: generateId(), text: 'วันนี้เราจะมาเรียนรู้เกี่ยวกับ AI', startTime: 5, endTime: 8 },
          { id: generateId(), text: 'การทำงานของ AI นั้นซับซ้อน', startTime: 9, endTime: 12 }
        ];
        subtitles.value = sampleSubtitles;
      }
      
      console.log('✅ AI Modal should now be visible:', showAIModal.value);
    };
    
    const closeAIModal = () => {
      console.log('❌ Closing AI Modal');
      showAIModal.value = false;
      aiProgress.value = 0;
      aiProcessType.value = '';
      selectedLanguages.value = [];
      processingStatus.value = {};
      aiResult.value = null;
    };

    // Handle AI process from new components
    const handleAIProcess = async (options) => {
      console.log('🚀 Starting AI Process with options:', options);
      
      try {
        aiProgress.value = 0;
        aiResult.value = null;
        aiStatus.value = 'เริ่มต้นประมวลผล...';
        
        // Wait for DOM to stabilize
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        
        aiProgress.value = 5;
        
        // สร้าง result ตามประเภท
        if (aiProcessType.value === 'translate') {
          aiResult.value = { languages: [], translations: {} };
          await processTranslation();
        } else if (aiProcessType.value === 'voiceover') {
          aiResult.value = { audioFiles: [] };
          await processVoiceOver();
        } else if (aiProcessType.value === 'extract') {
          aiResult.value = { subtitleCount: 0 };
          await processAudioExtraction();
        } else if (aiProcessType.value === 'audiofix') {
          aiResult.value = { enhancedAudioFiles: [] };
          await processAudioEnhancement();
        }
        
        // Final wait before showing results
        await new Promise(resolve => setTimeout(resolve, 500));
        
        aiProgress.value = 100;
        aiStatus.value = 'การประมวลผลเสร็จสิ้น!';
        
        console.log('✅ AI Process completed successfully');
        
      } catch (error) {
        console.error('❌ AI Process Error:', error);
        aiStatus.value = 'เกิดข้อผิดพลาด: ' + error.message;
        aiResult.value = null;
        aiProgress.value = 0;
        toast({ type: 'error', message: 'การประมวลผล AI ล้มเหลว' });
      }
    };

    // Switch to next step
    const switchToNextStep = (nextStep) => {
      aiProcessType.value = nextStep;
      aiProgress.value = 0;
      aiStatus.value = '';
      aiResult.value = null;
    };

    // Complete AI process
    const completeAIProcess = () => {
      closeAIModal();
      toast({ type: 'success', message: 'การประมวลผล AI ทั้งหมดเสร็จสิ้น!' });
    };
    
    const getAIModalTitle = () => {
      switch (aiProcessType.value) {
        case 'transcribe': return 'AI Transcription - แปลงเสียงเป็นข้อความ';
        case 'translate': return '🌐 ขั้นตอนที่ 2: แปลภาษา Subtitle';
        case 'voiceover': return '🎤 ขั้นตอนที่ 3: สร้างเสียงพากย์';
        case 'extract': return '🔊 ขั้นตอนที่ 1: แกะเสียงจากวิดีโอ';
        case 'enhance': return '✨ ปรับปรุงคุณภาพ Subtitle';
        case 'audiofix': return '🎚️ ขั้นตอนที่ 4: แก้ไขและปรับแต่งเสียง';
        default: return 'AI Processing - การประมวลผลด้วย AI';
      }
    };
    
    const getInitialStatus = (type) => {
      switch (type) {
        case 'transcribe': return 'เตรียมแปลงเสียงเป็นข้อความด้วย Speech-to-Text AI...';
        case 'translate': return 'เลือกภาษาที่ต้องการแปล - สร้างเนื้อหาหลายภาษาจาก Subtitle เดียว';
        case 'voiceover': return 'เลือกภาษาและสไตล์เสียง - สร้างไฟล์เสียงพากย์จาก Text';
        case 'extract': return 'เตรียมแกะเสียงและข้อความจากวิดีโอต้นฉบับ...';
        case 'enhance': return 'เตรียมปรับปรุงไวยากรณ์ จังหวะเวลา และคุณภาพ Subtitle...';
        case 'audiofix': return 'เตรียมปรับแต่งคุณภาพเสียง ลดเสียงรบกวน และเพิ่มเอฟเฟกต์...';
        default: return 'กำลังเตรียมความพร้อมสำหรับการประมวลผล AI...';
      }
    };
    
    const getLanguageFlag = (code) => {
      const flags = {
        'th': '🇹🇭',
        'zh': '🇨🇳',
        'ja': '🇯🇵',
        'my': '🇲🇲',
        'en': '🇺🇸',
        'de': '🇩🇪'
      };
      return flags[code] || '🌍';
    };
    
    const getLanguageName = (code) => {
      const lang = availableLanguages.find(l => l.code === code);
      return lang ? lang.name : code.toUpperCase();
    };
    
    const isLanguageCompleted = (langCode) => {
      return processingStatus.value[langCode] === 'completed';
    };
    
    const isLanguageProcessing = (langCode) => {
      return processingStatus.value[langCode] === 'processing';
    };
    
    // Main AI Processing Method
    const startAIProcess = async () => {
      try {
        console.log('🚀 Starting AI Process:', aiProcessType.value);
        
        // Reset states safely
        aiProgress.value = 0;
        aiResult.value = null;
        aiStatus.value = 'เริ่มต้นประมวลผล...';
        
        // Wait for DOM to stabilize
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        
        aiProgress.value = 5;
        
        // สร้าง result ตามประเภท
        if (aiProcessType.value === 'translate') {
          aiResult.value = { languages: [], translations: {} };
          await processTranslation();
        } else if (aiProcessType.value === 'voiceover') {
          aiResult.value = { audioFiles: [] };
          await processVoiceOver();
        } else if (aiProcessType.value === 'extract') {
          aiResult.value = { subtitleCount: 0 };
          await processAudioExtraction();
        } else if (aiProcessType.value === 'enhance') {
          aiResult.value = { enhancedSubtitles: [] };
          await processSubtitleEnhancement();
        } else if (aiProcessType.value === 'audiofix') {
          aiResult.value = { enhancedAudioFiles: [] };
          await processAudioEnhancement();
        }
        
        // Final wait before showing results
        await new Promise(resolve => setTimeout(resolve, 500));
        
        aiProgress.value = 100;
        aiStatus.value = 'การประมวลผลเสร็จสิ้น!';
        
        console.log('✅ AI Process completed successfully');
        
      } catch (error) {
        console.error('❌ AI Process Error:', error);
        aiStatus.value = 'เกิดข้อผิดพลาด: ' + error.message;
        aiResult.value = null;
        aiProgress.value = 0;
        toast({ type: 'error', message: 'การประมวลผล AI ล้มเหลว' });
      }
    };
    
    // Translation Process
    const processTranslation = async () => {
      const totalLanguages = selectedLanguages.value.length;
      const progressPerLanguage = 90 / totalLanguages;
      
      for (let i = 0; i < selectedLanguages.value.length; i++) {
        const langCode = selectedLanguages.value[i];
        const langName = getLanguageName(langCode);
        
        aiStatus.value = `กำลังแปลเป็นภาษา ${langName}...`;
        processingStatus.value[langCode] = 'processing';
        
        // Simulate API call
        await simulateAITranslation(langCode);
        
        processingStatus.value[langCode] = 'completed';
        aiResult.value.languages.push(langCode);
        
        aiProgress.value = 5 + ((i + 1) * progressPerLanguage);
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };
    
    // Voice Over Process  
    const processVoiceOver = async () => {
      const totalLanguages = selectedLanguages.value.length;
      const progressPerLanguage = 90 / totalLanguages;
      
      aiResult.value.voiceType = voiceType.value;
      aiResult.value.voiceSpeed = voiceSpeed.value;
      aiResult.value.voicePitch = voicePitch.value;
      aiResult.value.audioFormat = audioFormat.value;
      
      for (let i = 0; i < selectedLanguages.value.length; i++) {
        const langCode = selectedLanguages.value[i];
        const langName = getLanguageName(langCode);
        
        aiStatus.value = `กำลังสร้างเสียงพากย์ภาษา ${langName} (${voiceType.value})...`;
        processingStatus.value[langCode] = 'processing';
        
        // Simulate voice generation
        await simulateVoiceGeneration(langCode);
        
        processingStatus.value[langCode] = 'completed';
        aiResult.value.audioFiles.push({
          language: langCode,
          url: `generated_voice_${langCode}.${audioFormat.value}`,
          settings: {
            voiceType: voiceType.value,
            speed: voiceSpeed.value,
            pitch: voicePitch.value
          }
        });
        
        aiProgress.value = 5 + ((i + 1) * progressPerLanguage);
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    };

    // Audio Extraction Process
    const processAudioExtraction = async () => {
      aiStatus.value = 'เริ่มแกะเสียงจากวิดีโอ...';
      aiProgress.value = 10;
      
      // Simulate audio extraction steps
      const steps = [
        { progress: 20, status: 'กำลังแยกไฟล์เสียงจากวิดีโอ...' },
        { progress: 40, status: 'กำลังปรับปรุงคุณภาพเสียง...' },
        { progress: 60, status: 'กำลังแปลงเสียงเป็นข้อความด้วย AI...' },
        { progress: 80, status: 'กำลังปรับจังหวะเวลาให้ตรงกับวิดีโอ...' },
        { progress: 95, status: 'กำลังสร้างไฟล์ Subtitle...' }
      ];
      
      for (const step of steps) {
        aiStatus.value = step.status;
        aiProgress.value = step.progress;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Simulate extracted subtitles
      const extractedSubtitles = [
        { id: generateId(), text: 'สวัสดีครับ ยินดีต้อนรับสู่วิดีโอนี้', startTime: 1, endTime: 4 },
        { id: generateId(), text: 'วันนี้เราจะมาเรียนรู้เกี่ยวกับ AI', startTime: 5, endTime: 8 },
        { id: generateId(), text: 'การทำงานของ AI นั้นซับซ้อน', startTime: 9, endTime: 12 }
      ];
      
      aiResult.value.subtitleCount = extractedSubtitles.length;
      aiResult.value.extractedSubtitles = extractedSubtitles;
      aiResult.value.audioFile = extractionType.value === 'audio_text' ? `extracted_audio.wav` : null;
      aiResult.value.sourceLanguage = sourceLanguage.value;
      aiResult.value.extractionType = extractionType.value;
    };

    // Subtitle Enhancement Process
    const processSubtitleEnhancement = async () => {
      if (subtitles.value.length === 0) {
        throw new Error('ไม่มี Subtitle ให้ปรับปรุง');
      }
      
      aiStatus.value = 'เริ่มปรับปรุงคุณภาพ Subtitle...';
      aiProgress.value = 10;
      
      const selectedOptions = enhancementOptions.value;
      const totalOptions = selectedOptions.length;
      const progressPerOption = 80 / totalOptions;
      
      for (let i = 0; i < selectedOptions.length; i++) {
        const option = selectedOptions[i];
        
        switch (option) {
          case 'grammar':
            aiStatus.value = 'กำลังแก้ไขไวยากรณ์และการสะกดคำ...';
            break;
          case 'timing':
            aiStatus.value = 'กำลังปรับจังหวะเวลาให้เหมาะสม...';
            break;
          case 'formatting':
            aiStatus.value = 'กำลังจัดรูปแบบข้อความ...';
            break;
          case 'consistency':
            aiStatus.value = 'กำลังปรับความสอดคล้องของคำศัพท์...';
            break;
        }
        
        aiProgress.value = 10 + ((i + 1) * progressPerOption);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Simulate enhancement results
      const enhancedSubtitles = subtitles.value.map(sub => ({
        ...sub,
        id: generateId(),
        text: `[ปรับปรุงแล้ว] ${sub.text}`,
        enhanced: true,
        enhancementOptions: selectedOptions
      }));
      
      aiResult.value = {
        enhancedSubtitles: enhancedSubtitles,
        originalCount: subtitles.value.length,
        enhancementOptions: selectedOptions,
        improvements: {
          grammar: selectedOptions.includes('grammar') ? Math.floor(Math.random() * 15) + 5 : 0,
          timing: selectedOptions.includes('timing') ? Math.floor(Math.random() * 8) + 2 : 0,
          formatting: selectedOptions.includes('formatting') ? subtitles.value.length : 0,
          consistency: selectedOptions.includes('consistency') ? Math.floor(Math.random() * 10) + 3 : 0
        }
      };
    };

    // Audio Enhancement Process (Step 4)
    const processAudioEnhancement = async () => {
      if (selectedAudioFiles.value.length === 0) {
        throw new Error('กรุณาเลือกไฟล์เสียงที่ต้องการปรับแต่ง');
      }
      
      aiStatus.value = 'เริ่มปรับแต่งคุณภาพเสียง...';
      aiProgress.value = 10;
      
      const totalFiles = selectedAudioFiles.value.length;
      const progressPerFile = 80 / totalFiles;
      
      const enhancedAudioFiles = [];
      
      for (let i = 0; i < selectedAudioFiles.value.length; i++) {
        const fileId = selectedAudioFiles.value[i];
        const audioFile = mockAudioFiles.value.find(f => f.id === fileId);
        
        if (!audioFile) continue;
        
        // Process each selected enhancement
        for (const option of audioFixOptions.value) {
          switch (option) {
            case 'noise_reduction':
              aiStatus.value = `กำลังลดเสียงรบกวนใน ${audioFile.name}...`;
              break;
            case 'voice_enhance':
              aiStatus.value = `กำลังเพิ่มความชัดเจนของเสียงใน ${audioFile.name}...`;
              break;
            case 'volume_normalize':
              aiStatus.value = `กำลังปรับระดับเสียงใน ${audioFile.name}...`;
              break;
            case 'echo_remove':
              aiStatus.value = `กำลังลดเสียงก้องใน ${audioFile.name}...`;
              break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Apply audio settings (bass, treble)
        aiStatus.value = `กำลังปรับ EQ ใน ${audioFile.name}...`;
        await new Promise(resolve => setTimeout(resolve, 800));
        
        enhancedAudioFiles.push({
          ...audioFile,
          id: `enhanced_${fileId}`,
          name: `enhanced_${audioFile.name}`,
          enhancements: [...audioFixOptions.value],
          settings: { ...audioSettings.value }
        });
        
        aiProgress.value = 10 + ((i + 1) * progressPerFile);
      }
      
      aiResult.value.enhancedAudioFiles = enhancedAudioFiles;
      aiResult.value.originalFileCount = selectedAudioFiles.value.length;
      aiResult.value.appliedEnhancements = audioFixOptions.value;
      aiResult.value.audioSettings = audioSettings.value;
    };
    
    // Helper function for word count estimation
    const estimateWordCount = () => {
      if (subtitles.value.length === 0) return 0;
      const totalChars = subtitles.value.reduce((sum, sub) => sum + sub.text.length, 0);
      // Estimate: Thai ~= 1 word per 3 chars, English ~= 1 word per 5 chars
      return Math.round(totalChars / 4);
    };

    // เช็คว่าสามารถเริ่มประมวลผลได้หรือไม่
    const canStartProcess = () => {
      switch (aiProcessType.value) {
        case 'extract':
          return true; // แกะเสียงไม่ต้องเลือกภาษา
        case 'translate':
          return selectedLanguages.value.length > 0;
        case 'voiceover':
          return selectedLanguages.value.length > 0;
        case 'audiofix':
          return selectedAudioFiles.value.length > 0 || 
                 (audioFixOptions.value.reduce && audioFixOptions.value.denoise);
        default:
          return false;
      }
    };

    // Helper function สำหรับนับผลลัพธ์
    const getResultCount = (processType) => {
      if (!aiResult.value) return 0;
      switch (processType) {
        case 'extract':
          return aiResult.value.subtitleCount || 0;
        case 'translate':
          return (aiResult.value.languages || []).length;
        case 'voiceover':
          return (aiResult.value.audioFiles || []).length;
        case 'audiofix':
          return (aiResult.value.enhancedAudioFiles || []).length;
        default:
          return 0;
      }
    };

    // Helper function สำหรับ enhancement labels
    const getEnhancementLabel = (enhancement) => {
      const labels = {
        'noise_reduction': 'ลดเสียงรบกวน',
        'voice_enhance': 'เพิ่มความชัด',
        'volume_normalize': 'ปรับระดับเสียง',
        'echo_remove': 'ลดเสียงก้อง'
      };
      return labels[enhancement] || enhancement;
    };

    // Helper function สำหรับแสดงข้อความผลลัพธ์
    const getAIResultMessage = () => {
      try {
        if (!aiResult.value) return 'ประมวลผลเสร็จสิ้น';
        
        switch (aiProcessType.value) {
          case 'extract': {
            const count = aiResult.value.subtitleCount || 0;
            return `แกะเสียงจากวิดีโอเสร็จสิ้น สร้าง ${count} subtitle`;
          }
          case 'translate': {
            const langCount = (aiResult.value.languages || []).length;
            return `แปลภาษาเสร็จสิ้น ทั้งหมด ${langCount} ภาษา`;
          }
          case 'voiceover': {
            const audioCount = (aiResult.value.audioFiles || []).length;
            return `สร้างเสียงพากย์เสร็จสิ้น ทั้งหมด ${audioCount} ไฟล์`;
          }
          case 'audiofix': {
            const fileCount = (aiResult.value.enhancedAudioFiles || []).length;
            return `ปรับแต่งเสียงเสร็จสิ้น ทั้งหมด ${fileCount} ไฟล์`;
          }
          default:
            return 'ประมวลผลเสร็จสิ้น';
        }
      } catch (error) {
        console.error('Error in getAIResultMessage:', error);
        return 'ประมวลผลเสร็จสิ้น';
      }
    };
    
    // Simulate AI Translation API
    const simulateAITranslation = async (targetLang) => {
      // In real implementation, this would call translation API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create translated subtitles
      const translatedSubs = masterSubtitles.value.map(sub => ({
        ...sub,
        id: generateId(),
        text: `[${targetLang.toUpperCase()}] ${sub.text}`, // Simulate translation
        language: targetLang
      }));
      
      if (!aiResult.value.translations) {
        aiResult.value.translations = {};
      }
      aiResult.value.translations[targetLang] = translatedSubs;
    };
    
    // Simulate Voice Generation API
    const simulateVoiceGeneration = async (targetLang) => {
      // In real implementation, this would call voice synthesis API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate voice file info
      return {
        language: targetLang,
        voiceType: voiceType.value,
        audioUrl: `voice_${targetLang}_${Date.now()}.mp3`
      };
    };
    
    // Apply AI Results
    const applyAIResult = () => {
      if (aiProcessType.value === 'translate' && aiResult.value?.translations) {
        // Add translated subtitles to the main list
        Object.values(aiResult.value.translations).forEach(langSubs => {
          subtitles.value.push(...langSubs);
        });
        
        pushHistory('AI Translation');
        toast({ 
          type: 'success', 
          message: `เพิ่ม subtitle ${aiResult.value.languages.length} ภาษาเสร็จสิ้น` 
        });
      } else if (aiProcessType.value === 'voiceover' && aiResult.value?.audioFiles) {
        toast({ 
          type: 'success', 
          message: `สร้างไฟล์เสียงพากย์ ${aiResult.value.audioFiles.length} ภาษาเสร็จสิ้น` 
        });
      } else if (aiProcessType.value === 'extract' && aiResult.value?.extractedSubtitles) {
        // Add extracted subtitles to the main list
        subtitles.value.push(...aiResult.value.extractedSubtitles);
        
        pushHistory('AI Audio Extraction');
        toast({ 
          type: 'success', 
          message: `แกะได้ ${aiResult.value.subtitleCount} subtitle จากวิดีโอ` 
        });
      } else if (aiProcessType.value === 'enhance' && aiResult.value?.enhancedSubtitles) {
        // Replace original subtitles with enhanced ones
        subtitles.value = aiResult.value.enhancedSubtitles;
        
        pushHistory('AI Enhancement');
        const improvements = aiResult.value.improvements;
        const improvementText = Object.entries(improvements)
          .filter(([, value]) => value > 0)
          .map(([key, value]) => `${key}: ${value} จุด`)
          .join(', ');
        
        toast({ 
          type: 'success', 
          message: `ปรับปรุง Subtitle เสร็จสิ้น (${improvementText})` 
        });
      } else if (aiProcessType.value === 'audiofix' && aiResult.value?.enhancedAudioFiles) {
        toast({ 
          type: 'success', 
          message: `ปรับแต่งเสียงเสร็จสิ้น ${aiResult.value.enhancedAudioFiles.length} ไฟล์` 
        });
      }
      
      closeAIModal();
    };
    
    const subtitles = ref([]);
    const selectedSubtitle = ref(null);
    const dragState = ref({ isDragging: false, type: null, subtitle: null });
    const isDraggingPlayhead = ref(false);
    const MIN_DURATION = 0.1; // minimum subtitle duration in seconds
    const MIN_GAP = 0; // gap between subtitles (0 = contiguous allowed)

    const getNeighbors = (subtitle) => {
      if (!subtitle) return { prev: null, next: null };
      const ordered = [...subtitles.value].sort((a,b)=>a.startTime - b.startTime);
      const idx = ordered.findIndex(s=>s.id === subtitle.id);
      return {
        prev: idx > 0 ? ordered[idx-1] : null,
        next: idx >=0 && idx < ordered.length -1 ? ordered[idx+1] : null
      };
    };
    
    // History state (simple implementation)
    const history = ref([]);
    const historyIndex = ref(-1);
    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(() => historyIndex.value < history.value.length - 1);
    
    // Computed properties
    const progressPercentage = computed(() => {
      return videoDuration.value > 0 ? (currentTime.value / videoDuration.value) * 100 : 0;
    });
    
    const sortedSubtitles = computed(() => {
      return [...subtitles.value].sort((a, b) => a.startTime - b.startTime);
    });
    
    const activeSubtitles = computed(() => {
      if (!showPreview.value) return [];
      return subtitles.value.filter(sub => 
        currentTime.value >= sub.startTime && currentTime.value <= sub.endTime
      );
    });
    
    const timeMarkers = computed(() => {
      const markers = [];
      const duration = videoDuration.value;
      if (duration <= 0) return markers;
      
      const interval = duration <= 60 ? 10 : duration <= 300 ? 30 : 60;
      for (let i = 0; i <= duration; i += interval) {
        markers.push({
          time: i,
          position: (i / duration) * 100
        });
      }
      return markers;
    });
    
    // Methods
    const formatTime = (seconds) => {
      if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00:00';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Continuous sync (some browsers may delay play/pause events when custom controls overlaid)
    let playStateRaf = null;
    const syncPlayState = () => {
      if (videoRef.value) {
        const real = !videoRef.value.paused && !videoRef.value.ended;
        if (real !== isVideoPlaying.value) isVideoPlaying.value = real;
      }
      playStateRaf = requestAnimationFrame(syncPlayState);
    };
    onMounted(() => { playStateRaf = requestAnimationFrame(syncPlayState); });
    onBeforeUnmount(() => { if (playStateRaf) cancelAnimationFrame(playStateRaf); });

    const formatTimeMs = (seconds) => {
      if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00:00.000';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };

    const formatDuration = (seconds) => {
      if (seconds < 1) return (seconds.toFixed(3)) + 's';
      return formatTime(seconds);
    };

    const parseTimeString = (timeStr) => {
      if (!timeStr) return 0;
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})(?:[.,](\d{1,3}))?$/);
      if (!match) return 0;
      const [, h, m, s, ms = '0'] = match;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms.padEnd(3, '0')) / 1000;
    };
    
    const generateId = () => `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const pushHistory = (action) => {
      const snapshot = {
        subtitles: JSON.parse(JSON.stringify(subtitles.value)),
        selectedId: selectedSubtitle.value?.id || null,
        action,
        timestamp: Date.now()
      };
      
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      
      history.value.push(snapshot);
      historyIndex.value = history.value.length - 1;
      
      // Limit history size
      if (history.value.length > 100) {
        history.value = history.value.slice(1);
        historyIndex.value = history.value.length - 1;
      }
    };
    
    const undo = () => {
      if (canUndo.value) {
        historyIndex.value--;
        const snapshot = history.value[historyIndex.value];
        subtitles.value = JSON.parse(JSON.stringify(snapshot.subtitles));
        selectedSubtitle.value = subtitles.value.find(s => s.id === snapshot.selectedId) || null;
      }
    };
    
    const redo = () => {
      if (canRedo.value) {
        historyIndex.value++;
        const snapshot = history.value[historyIndex.value];
        subtitles.value = JSON.parse(JSON.stringify(snapshot.subtitles));
        selectedSubtitle.value = subtitles.value.find(s => s.id === snapshot.selectedId) || null;
      }
    };
    
    const closeModal = () => {
      emit('close');
    };
    
    const onVideoLoaded = () => {
      if (videoRef.value) {
        videoDuration.value = videoRef.value.duration;
      }
    };
    
    const onTimeUpdate = () => {
      if (videoRef.value) {
        currentTime.value = videoRef.value.currentTime;
      }
    };
    
    const onVideoSeeked = () => {
      onTimeUpdate();
    };
    
    const addSubtitleAtCurrentTime = () => {
      try {
        const preferredStart = currentTime.value;
        const preferredDuration = 3; // 3 seconds default
        
        const timeSlot = findAvailableTimeSlot(preferredStart, preferredDuration);
        
        if (!timeSlot) {
          toast({ type: 'warning', message: 'ไม่สามารถเพิ่ม subtitle ได้ เนื่องจากมี subtitle อื่นอยู่ในช่วงเวลานี้แล้ว' });
          return;
        }
        
        const newSubtitle = {
          id: generateId(),
          text: '',
          startTime: timeSlot.start,
          endTime: timeSlot.end
        };
        
        subtitles.value.push(newSubtitle);
        selectedSubtitle.value = newSubtitle;
        pushHistory('เพิ่ม subtitle');
        
        console.log('✅ Added new subtitle:', newSubtitle);
      } catch (error) {
        console.error('❌ Error adding subtitle:', error);
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการเพิ่ม subtitle' });
      }
    };
    
    // หาช่วงเวลาที่ว่างสำหรับ subtitle ใหม่
    const findAvailableTimeSlot = (preferredStart, preferredDuration) => {
      const sorted = sortedSubtitles.value;
      const maxTime = videoDuration.value;
      
      // ถ้าไม่มี subtitle เลย
      if (sorted.length === 0) {
        return {
          start: Math.max(0, preferredStart),
          end: Math.min(maxTime, preferredStart + preferredDuration)
        };
      }
      
      // ตรวจสอบว่าสามารถใส่ที่ตำแหน่งที่ต้องการได้หรือไม่
      const proposedEnd = preferredStart + preferredDuration;
      
      // หาว่ามี subtitle ที่ทับซ้อนหรือไม่
      const hasOverlap = sorted.some(sub => 
        (preferredStart < sub.endTime && proposedEnd > sub.startTime)
      );
      
      if (!hasOverlap && proposedEnd <= maxTime) {
        return { start: preferredStart, end: proposedEnd };
      }
      
      // หาช่องว่างที่ใกล้เคียงที่สุด
      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        
        // ตรวจสอบช่องว่างหลัง subtitle ปัจจุบัน
        const availableStart = current.endTime;
        const availableEnd = next ? next.startTime : maxTime;
        const availableDuration = availableEnd - availableStart;
        
        if (availableDuration >= preferredDuration) {
          return {
            start: availableStart,
            end: Math.min(availableEnd, availableStart + preferredDuration)
          };
        }
      }
      
      // ตรวจสอบช่องว่างก่อน subtitle แรก
      if (sorted[0].startTime >= preferredDuration) {
        return {
          start: 0,
          end: Math.min(sorted[0].startTime, preferredDuration)
        };
      }
      
      // ไม่พบช่องว่างที่เหมาะสม
      return null;
    };
    
    // จัดเรียง subtitles ให้ต่อเนื่องกัน
    const autoArrangeSubtitles = () => {
      try {
        if (subtitles.value.length === 0) return;
        
        const sorted = [...subtitles.value].sort((a, b) => a.startTime - b.startTime);
        const defaultDuration = 3; // 3 seconds
        let currentStart = 0;
        
        sorted.forEach(subtitle => {
          subtitle.startTime = currentStart;
          subtitle.endTime = currentStart + defaultDuration;
          currentStart = subtitle.endTime + 0.5; // 0.5 second gap
        });
        
        subtitles.value = sorted;
        pushHistory('จัดเรียง subtitle');
        toast({ type: 'success', message: 'จัดเรียง subtitle เรียบร้อยแล้ว' });
      } catch (error) {
        console.error('Error arranging subtitles:', error);
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการจัดเรียง subtitle' });
      }
    };
    
    const selectSubtitle = (subtitle) => {
      selectedSubtitle.value = subtitle;
      // Seek to subtitle start time
      if (videoRef.value) {
        videoRef.value.currentTime = subtitle.startTime;
      }
    };
    
    const deleteSubtitle = (id) => {
      subtitles.value = subtitles.value.filter(sub => sub.id !== id);
      if (selectedSubtitle.value?.id === id) {
        selectedSubtitle.value = null;
      }
      pushHistory('ลบ subtitle');
    };
    
    const updateSubtitle = () => {
      // Trigger reactivity and save to history
      nextTick(() => {
        pushHistory('แก้ไข subtitle');
      });
    };
    
    const updateSubtitleTime = (type, timeStr) => {
      if (!selectedSubtitle.value) return;
      const s = selectedSubtitle.value;
      const { prev, next } = getNeighbors(s);
      const t = parseTimeString(timeStr);
      if (type === 'start') {
        let newStart = Math.max(0, Math.min(t, s.endTime - MIN_DURATION));
        if (prev) newStart = Math.max(newStart, prev.endTime + MIN_GAP);
        s.startTime = newStart;
      } else {
        let newEnd = Math.max(s.startTime + MIN_DURATION, Math.min(t, videoDuration.value));
        if (next) newEnd = Math.min(newEnd, next.startTime - MIN_GAP);
        s.endTime = newEnd;
      }
      updateSubtitle();
    };
    
    const setSubtitleTimeFromCurrent = (type) => {
      if (!selectedSubtitle.value) return;
      
      const s = selectedSubtitle.value;
      const { prev, next } = getNeighbors(s);
      if (type === 'start') {
        let newStart = currentTime.value;
        newStart = Math.min(newStart, s.endTime - MIN_DURATION);
        if (prev) newStart = Math.max(newStart, prev.endTime + MIN_GAP);
        s.startTime = newStart;
      } else {
        let newEnd = Math.max(currentTime.value, s.startTime + MIN_DURATION);
        if (next) newEnd = Math.min(newEnd, next.startTime - MIN_GAP);
        s.endTime = newEnd;
      }
      updateSubtitle();
    };
    
    const getSubtitleBlockStyle = (subtitle) => {
      if (!subtitle) return {};
      
      const duration = videoDuration.value;
      if (duration <= 0) return {};
      
      const left = (subtitle.startTime / duration) * 100;
      const width = ((subtitle.endTime - subtitle.startTime) / duration) * 100;
      
      return {
        left: left + '%',
        width: width + '%'
      };
    };
    
    const getSubtitleStyle = (subtitle) => {
      if (!subtitle) return {};
      
      const baseStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        lineHeight: '1.4'
      };
      
      return baseStyle;
    };
    
    // Drag and resize functionality
    const startDragSubtitle = (event, subtitle) => {
      try {
        dragState.value = {
          isDragging: true,
          type: 'move',
          subtitle: subtitle,
          startX: event.clientX,
          startTime: subtitle.startTime
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
      } catch (error) {
        console.error('Error starting drag:', error);
      }
    };
    
    const startResizeSubtitle = (event, subtitle, type) => {
      try {
        dragState.value = {
          isDragging: true,
          type: type,
          subtitle: subtitle,
          startX: event.clientX,
          startTime: subtitle.startTime,
          startEndTime: subtitle.endTime
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
      } catch (error) {
        console.error('Error starting resize:', error);
      }
    };
    
  const handleDrag = (event) => {
      try {
    // Only move playhead if specifically dragging playhead (not while dragging a subtitle block)
    if (isDraggingPlayhead.value && !dragState.value.isDragging) {
          const timelineElement = document.querySelector('.timeline-ruler');
            if (!timelineElement || videoDuration.value <= 0) return;
            const rect = timelineElement.getBoundingClientRect();
            let x = event.clientX - rect.left;
            x = Math.max(0, Math.min(rect.width, x));
            const time = (x / rect.width) * videoDuration.value;
            currentTime.value = time;
            if (videoRef.value) videoRef.value.currentTime = time;
        }
        if (!dragState.value.isDragging) return;
        
        const deltaX = event.clientX - dragState.value.startX;
        const timelineElement = document.querySelector('.timeline-ruler');
        if (!timelineElement) return;
        
        const timelineWidth = timelineElement.offsetWidth;
        const deltaTime = (deltaX / timelineWidth) * videoDuration.value;
        
        const s = dragState.value.subtitle;
        const { prev, next } = getNeighbors(s);
        if (dragState.value.type === 'move') {
          const duration = s.endTime - s.startTime;
          let newStart = dragState.value.startTime + deltaTime;
          newStart = Math.max(0, Math.min(newStart, videoDuration.value - duration));
          if (prev) newStart = Math.max(newStart, prev.endTime + MIN_GAP);
          if (next) newStart = Math.min(newStart, next.startTime - duration - MIN_GAP);
          if (next && newStart > next.startTime - duration - MIN_GAP) return; // no space
          s.startTime = newStart;
          s.endTime = newStart + duration;
        } else if (dragState.value.type === 'start') {
          let newStart = dragState.value.startTime + deltaTime;
          newStart = Math.max(0, newStart);
          newStart = Math.min(newStart, s.endTime - MIN_DURATION);
          if (prev) newStart = Math.max(newStart, prev.endTime + MIN_GAP);
          s.startTime = newStart;
        } else if (dragState.value.type === 'end') {
          let newEnd = dragState.value.startEndTime + deltaTime;
          newEnd = Math.min(newEnd, videoDuration.value);
          newEnd = Math.max(newEnd, s.startTime + MIN_DURATION);
          if (next) newEnd = Math.min(newEnd, next.startTime - MIN_GAP);
          s.endTime = newEnd;
        }
      } catch (error) {
        console.error('Error handling drag:', error);
      }
    };
    
    const stopDrag = () => {
      try {
        if (isDraggingPlayhead.value) {
          isDraggingPlayhead.value = false;
        }
        if (dragState.value.isDragging) {
          pushHistory('ปรับเวลา subtitle');
        }
        
        dragState.value = { isDragging: false, type: null, subtitle: null };
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
      } catch (error) {
        console.error('Error stopping drag:', error);
      }
    };

    // Playhead drag start
  const startPlayheadDrag = () => {
      if (videoRef.value) {
        // Pause while dragging for precision
        videoRef.value.pause();
      }
      isDraggingPlayhead.value = true;
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDrag, { once: true });
    };
    
    const onTimelineClick = (event) => {
      if (dragState.value.isDragging) return;
      
      const timelineElement = event.currentTarget;
      const rect = timelineElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = x / rect.width;
      const time = percentage * videoDuration.value;
      
      if (videoRef.value) {
        videoRef.value.currentTime = time;
      }
    };
    
    const exportSubtitles = () => {
      exportFormat('srt'); // Default to SRT
    };
    
    const exportFormat = (format) => {
      let content = '';
      let filename = `${videoFile.value?.name || 'video'}_subtitles.${format}`;
      let mimeType = 'text/plain';
      
      switch (format) {
        case 'srt':
          content = generateSRT();
          break;
        case 'vtt':
          content = generateVTT();
          break;
        case 'ass':
          content = generateASS();
          break;
        default:
          content = generateSRT();
      }
      
      downloadFile(content, filename, mimeType);
      showExportDropdown.value = false;
      
      // Show success message
      toast({ type: 'success', message: `ส่งออก ${format.toUpperCase()} เรียบร้อยแล้ว` });
    };
    
    const generateVTT = () => {
      const sorted = sortedSubtitles.value;
      let vtt = 'WEBVTT\n\n';
      
      sorted.forEach((subtitle) => {
        const start = formatVTTTime(subtitle.startTime);
        const end = formatVTTTime(subtitle.endTime);
        
        vtt += `${start} --> ${end}\n`;
        vtt += `${subtitle.text}\n\n`;
      });
      
      return vtt;
    };
    
    const generateASS = () => {
      const sorted = sortedSubtitles.value;
      let ass = `[Script Info]
Title: ${videoFile.value?.name || 'Video'} Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&Hffffff,&Hffffff,&H0,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
      
      sorted.forEach((subtitle) => {
        const start = formatASSTime(subtitle.startTime);
        const end = formatASSTime(subtitle.endTime);
        
        ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${subtitle.text}\n`;
      });
      
      return ass;
    };
    
    const formatVTTTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };
    
    const formatASSTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const cs = Math.floor((seconds % 1) * 100); // centiseconds
      
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };
    
    const generateSRT = () => {
      const sorted = sortedSubtitles.value;
      let srt = '';
      
      sorted.forEach((subtitle, index) => {
        const start = formatSRTTime(subtitle.startTime);
        const end = formatSRTTime(subtitle.endTime);
        
        srt += `${index + 1}\n`;
        srt += `${start} --> ${end}\n`;
        srt += `${subtitle.text}\n\n`;
      });
      
      return srt;
    };
    
    const formatSRTTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };
    
    const downloadFile = (content, filename, mimeType) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };
    
    const saveProject = () => {
      const projectData = {
        videoFile: videoFile.value?.name,
        videoDuration: videoDuration.value,
        subtitles: subtitles.value,
        createdAt: new Date().toISOString()
      };
      
      const json = JSON.stringify(projectData, null, 2);
      downloadFile(json, `${videoFile.value?.name || 'video'}_subtitle_project.json`, 'application/json');
    };
    
    const triggerImport = () => {
      importInputRef.value?.click();
    };
    
    const handleImportFile = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        const content = await file.text();
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (extension === 'srt') {
          importSRT(content);
        } else if (extension === 'vtt') {
          importVTT(content);
        } else if (extension === 'json') {
          importProject(content);
        }
        
        toast({ type: 'success', message: 'นำเข้าไฟล์สำเร็จ' });
        pushHistory('นำเข้าไฟล์');
      } catch (error) {
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการนำเข้าไฟล์' });
      }
      
      // Reset input
      event.target.value = '';
    };
    
    const importSRT = (content) => {
      const lines = content.split('\n');
      const newSubtitles = [];
      let currentSub = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (/^\d+$/.test(line)) {
          currentSub = { id: generateId() };
        } else if (line.includes('-->')) {
          const [start, end] = line.split('-->');
          currentSub.startTime = parseSRTTime(start.trim());
          currentSub.endTime = parseSRTTime(end.trim());
        } else if (line && currentSub && currentSub.startTime !== undefined) {
          currentSub.text = line;
          newSubtitles.push(currentSub);
          currentSub = null;
        }
      }
      
      subtitles.value = newSubtitles;
    };
    
    const parseSRTTime = (timeStr) => {
      const [time, ms] = timeStr.split(',');
      const [h, m, s] = time.split(':').map(Number);
      return h * 3600 + m * 60 + s + (parseInt(ms) / 1000);
    };
    
    const importVTT = (content) => {
      const lines = content.split('\n');
      const newSubtitles = [];
      let currentSub = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('WEBVTT')) {
          continue; // Skip header
        } else if (line.includes('-->')) {
          const [start, end] = line.split('-->');
          currentSub = {
            id: generateId(),
            startTime: parseVTTTime(start.trim()),
            endTime: parseVTTTime(end.trim())
          };
        } else if (line && currentSub && currentSub.startTime !== undefined) {
          currentSub.text = line;
          newSubtitles.push(currentSub);
          currentSub = null;
        }
      }
      
      subtitles.value = newSubtitles;
    };
    
    const parseVTTTime = (timeStr) => {
      const parts = timeStr.split(':');
      if (parts.length === 3) {
        const [h, m, s] = parts;
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
      } else if (parts.length === 2) {
        const [m, s] = parts;
        return parseInt(m) * 60 + parseFloat(s);
      }
      return 0;
    };
    
    const importProject = (content) => {
      const data = JSON.parse(content);
      if (data.subtitles) {
        subtitles.value = data.subtitles.map(sub => ({
          ...sub,
          id: generateId() // Generate new IDs
        }));
      }
    };
    
    // AI Transcription Methods
    const startAITranscription = async () => {
      if (!videoFile.value) {
        toast({ type: 'warning', message: 'กรุณาเลือกไฟล์วิดีโอก่อน' });
        return;
      }
      
      try {
        isTranscribing.value = true;
        transcriptionProgress.value = 0;
        
        toast({ type: 'info', message: 'เริ่มต้นการแปลงเสียงเป็นข้อความด้วย AI...' });
        
        // เลือกวิธีการ transcribe ตามขนาดไฟล์
        const fileSizeMB = videoFile.value.size / (1024 * 1024);
        
        if (fileSizeMB <= 25) {
          // ไฟล์เล็ก: ส่งทั้งหมด
          await transcribeWithWhisperAPI(videoFile.value);
        } else {
          // ไฟล์ใหญ่: แบ่งเป็นชิ้นๆ
          await transcribeInChunks(videoFile.value);
        }
        
        toast({ type: 'success', message: 'สร้าง subtitle ด้วย AI เสร็จสิ้น!' });
        pushHistory('AI Transcription');
        
      } catch (error) {
        console.error('AI Transcription Error:', error);
        toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการใช้ AI: ' + error.message });
      } finally {
        isTranscribing.value = false;
        transcriptionProgress.value = 0;
        showAIDropdown.value = false;
      }
    };
    
    const transcribeWithWhisperAPI = async (file) => {
      // แปลงไฟล์วิดีโอเป็น audio ก่อน
      const audioBlob = await extractAudioFromVideo(file);
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'th'); // หรือ auto-detect
      formData.append('response_format', 'verbose_json'); // เพื่อได้ timestamps
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY', // ต้องเก็บใน environment
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      convertTranscriptToSubtitles(result.segments || [{ text: result.text, start: 0, end: videoDuration.value }]);
    };
    
    const transcribeInChunks = async (file) => {
      const chunkDuration = 300; // 5 นาที per chunk
      const totalDuration = videoDuration.value;
      const numChunks = Math.ceil(totalDuration / chunkDuration);
      
      toast({ type: 'info', message: `แบ่งไฟล์เป็น ${numChunks} ส่วน เพื่อประมวลผล` });
      
      for (let i = 0; i < numChunks; i++) {
        const startTime = i * chunkDuration;
        
        transcriptionProgress.value = (i / numChunks) * 100;
        
        try {
          const chunkBlob = await extractVideoChunk(file);
          const audioBlob = await extractAudioFromVideo(chunkBlob);
          
          // เรียก API สำหรับแต่ละ chunk
          const result = await transcribeAudioChunk(audioBlob);
          convertTranscriptToSubtitles(result.segments || [], startTime);
          
          // พักระหว่าง API calls เพื่อไม่ให้ hit rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error transcribing chunk ${i + 1}:`, error);
          toast({ type: 'warning', message: `ข้ามส่วนที่ ${i + 1} เนื่องจากข้อผิดพลาด` });
        }
      }
    };
    
    const extractAudioFromVideo = async (videoBlob) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        
        video.onloadedmetadata = () => {
          // ใช้ Web Audio API หรือ FFmpeg.wasm
          // สำหรับ demo ใช้วิธีง่ายๆ ก่อน
          resolve(videoBlob); // ในการใช้งานจริงต้องแปลงเป็น audio format
        };
        
        video.onerror = reject;
        video.src = URL.createObjectURL(videoBlob);
      });
    };
    
    const extractVideoChunk = async (file) => {
      // ใช้ FFmpeg.wasm หรือ Media Source Extensions
      // สำหรับ demo ส่งไฟล์ทั้งหมดก่อน
      return file;
    };
    
    const transcribeAudioChunk = async (audioBlob) => {
      // เรียก API เดียวกับ transcribeWithWhisperAPI แต่สำหรับ chunk
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio_chunk.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'th');
      formData.append('response_format', 'verbose_json');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    };
    
    const convertTranscriptToSubtitles = (segments, timeOffset = 0) => {
      segments.forEach((segment) => {
        const newSubtitle = {
          id: generateId(),
          text: segment.text.trim(),
          startTime: (segment.start || 0) + timeOffset,
          endTime: (segment.end || segment.start + 3) + timeOffset
        };
        
        if (newSubtitle.text) {
          subtitles.value.push(newSubtitle);
        }
      });
      
      // เรียงลำดับ subtitles ตาม startTime
      subtitles.value.sort((a, b) => a.startTime - b.startTime);
    };
    
    // Alternative: ใช้ Web Speech API (ฟรี แต่ต้องเล่นวิดีโอ)
    const startWebSpeechTranscription = async () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({ type: 'error', message: 'เบราว์เซอร์นี้ไม่รองรับ Speech Recognition' });
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'th-TH'; // หรือ en-US
      
      let currentSubtitle = null;
      
      recognition.onstart = () => {
        isTranscribing.value = true;
        toast({ type: 'info', message: 'เริ่มแปลงเสียงเป็นข้อความ กรุณาเล่นวิดีโอ' });
        // เล่นวิดีโออัตโนมัติ
        if (videoRef.value) {
          videoRef.value.play();
        }
      };
      
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const timestamp = currentTime.value;
          
          if (event.results[i].isFinal) {
            // สร้าง subtitle ใหม่
            if (currentSubtitle) {
              currentSubtitle.endTime = timestamp;
            }
            
            currentSubtitle = {
              id: generateId(),
              text: transcript.trim(),
              startTime: Math.max(0, timestamp - 3), // ย้อนหลัง 3 วินาที
              endTime: timestamp
            };
            
            if (currentSubtitle.text) {
              subtitles.value.push(currentSubtitle);
            }
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + event.error });
        isTranscribing.value = false;
      };
      
      recognition.onend = () => {
        isTranscribing.value = false;
        showAIDropdown.value = false;
        toast({ type: 'success', message: 'การแปลงเสียงเป็นข้อความเสร็จสิ้น' });
        pushHistory('Speech Recognition');
      };
      
      recognition.start();
    };
    
    // Watch for props changes
    watch(() => [props.file, props.fileUrl, props.isOpen], ([newFile, newFileUrl, newIsOpen]) => {
      if (newIsOpen && newFile && newFileUrl) {
        videoFile.value = newFile;
        videoUrl.value = newFileUrl;
        subtitles.value = [];
        selectedSubtitle.value = null;
        history.value = [];
        historyIndex.value = -1;
      }
    }, { immediate: true });
    
    // Keyboard shortcuts
    const onKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      
      if (!mod) return;
      
      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    onMounted(() => {
      window.addEventListener('keydown', onKeyDown);
      document.addEventListener('click', handleClickOutside);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('click', handleClickOutside);
    });
    
    const handleClickOutside = (event) => {
      try {
        if (event.target && typeof event.target.closest === 'function') {
          if (!event.target.closest('[ref="exportDropdownRef"]')) {
            showExportDropdown.value = false;
          }
          if (!event.target.closest('[ref="aiDropdownRef"]')) {
            showAIDropdown.value = false;
          }
        } else {
          showExportDropdown.value = false;
          showAIDropdown.value = false;
        }
      } catch (error) {
        console.warn('Error in handleClickOutside:', error);
        showExportDropdown.value = false;
        showAIDropdown.value = false;
      }
    };

  // Removed old progress bar logic (replaced by CustomVideoControls component)
    
    return {
      // Refs
  videoRef,
      importInputRef,
      exportDropdownRef,
      
      // State
      videoFile,
      videoUrl,
      videoDuration,
      currentTime,
      isVideoPlaying,
      showPreview,
      showExportDropdown,
      subtitles,
      selectedSubtitle,
      
      // Computed
  progressPercentage,
      sortedSubtitles,
      activeSubtitles,
      timeMarkers,
      canUndo,
      canRedo,
      
      // Methods
      closeModal,
      onVideoLoaded,
      onTimeUpdate,
      onVideoSeeked,
  formatTime,
  formatTimeMs,
  formatDuration,
      addSubtitleAtCurrentTime,
      autoArrangeSubtitles,
      selectSubtitle,
      deleteSubtitle,
      updateSubtitle,
      updateSubtitleTime,
      setSubtitleTimeFromCurrent,
      getSubtitleBlockStyle,
      getSubtitleStyle,
      startDragSubtitle,
      startResizeSubtitle,
      onTimelineClick,
      exportSubtitles,
      exportFormat,
      toggleExportDropdown,
      closeExportDropdown,
      saveProject,
      triggerImport,
      handleImportFile,
      handleClickOutside,
      undo,
  redo,
  startPlayheadDrag,
  togglePlay,
  seekVideo,
  toggleMute,
  setVolume,
  setPlaybackRate,
  toggleFullscreen,
  volume,
  isMuted,
  playbackRate,
  bufferedEnd,
  updateBuffered,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  
  // AI Transcription
  showAIDropdown,
  aiDropdownRef,
  toggleAIDropdown,
  closeAIDropdown,
  isTranscribing,
  transcriptionProgress,
  startAITranscription,
  startWebSpeechTranscription,
  
  // AI Modal & Multi-language Features
  showAIModal,
  aiProcessType,
  aiProgress,
  aiStatus,
  aiResult,
  selectedLanguages,
  masterSubtitles,
  voiceType,
  voiceSpeed,
  voicePitch,
  audioFormat,
  extractionType,
  sourceLanguage,
  enhancementOptions,
  extractionOptions,
  selectedAudioFiles,
  audioFixOptions,
  audioSettings,
  translationStyle,
  translationOptions,
  mockAudioFiles,
  availableLanguages,
  processingStatus,
  openAIModal,
  closeAIModal,
  handleAIProcess,
  switchToNextStep,
  completeAIProcess,
  getAIModalTitle,
  getLanguageFlag,
  getLanguageName,
  isLanguageCompleted,
  isLanguageProcessing,
  startAIProcess,
  applyAIResult,
  estimateWordCount,
  canStartProcess,
  getResultCount,
  getEnhancementLabel,
  getAIResultMessage
    };
  }
};
</script>

<style scoped>
.subtitle-text {
  font-family: Arial, sans-serif;
  font-weight: bold;
  text-align: center;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.subtitle-track {
  position: relative;
  min-height: 48px;
}

.timeline-ruler {
  position: relative;
  user-select: none;
}

/* Custom scrollbar for subtitle tracks */
.subtitle-tracks::-webkit-scrollbar {
  width: 6px;
}

.subtitle-tracks::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.subtitle-tracks::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.subtitle-tracks::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Subtitle track styling */
.subtitle-track {
  position: relative;
  min-height: 64px;
  background: linear-gradient(to right, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
}

.subtitle-track:hover {
  background: linear-gradient(to right, #f1f3f4 0%, #ffffff 50%, #f1f3f4 100%);
}

/* Timeline ruler */
.timeline-ruler {
  position: relative;
  user-select: none;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
}

/* Subtitle blocks */
.subtitle-block {
  /* Removed fixed min-width so very short durations reflect accurately on timeline */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 4px; /* minimal visual presence */
}

.subtitle-block:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.subtitle-block.selected {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Resize handles */
.resize-handle {
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background-color: rgba(99, 102, 241, 0.8) !important;
}

/* Distinct start/end handle colors for clarity */
.resize-handle-start {
  background: linear-gradient(to right, #1e3a8a, #2563eb); /* deep to primary blue */
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  opacity: 0;
  transition: opacity .15s ease, filter .15s ease;
}
.resize-handle-end {
  background: linear-gradient(to left, #b91c1c, #ef4444); /* deep red to red */
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  opacity: 0;
  transition: opacity .15s ease, filter .15s ease;
}

.subtitle-block:hover .resize-handle-start,
.subtitle-block:hover .resize-handle-end {
  opacity: 1;
}

.resize-handle-start:hover { filter: brightness(1.15); }
.resize-handle-end:hover { filter: brightness(1.15); }

/* Custom scrollbar for subtitle tracks */
.subtitle-tracks::-webkit-scrollbar {
  width: 6px;
}

.subtitle-tracks::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.subtitle-tracks::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.subtitle-tracks::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Drag cursor */
.cursor-dragging {
  cursor: grabbing !important;
}

/* Dropdown animations */
.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* Overlap warning animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.overlap-warning {
  animation: shake 0.5s ease-in-out;
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}
</style>
