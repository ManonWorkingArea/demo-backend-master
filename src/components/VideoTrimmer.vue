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
            <div class="p-1.5 bg-blue-100 rounded-lg">
              <i class="fas fa-cut text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 leading-tight">ตัดต่อวิดีโอ</h3>
              <p class="text-xs text-gray-500 leading-tight">เลือกช่วงเวลาที่ต้องการตัดจากวิดีโอ</p>
            </div>
          </div>
          <button 
            @click="closeModal"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times text-base"></i>
          </button>
        </div>

  <!-- Top Toolbar: Save / Import / Undo-Redo -->
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
            <!-- hidden file input for import -->
            <input ref="importInputRef" type="file" accept="application/json" class="hidden" @change="handleImportFile" />
          </div>
        </div>
        
        <!-- Video Preview Section - Half Height -->
        <div class="h-[50vh] bg-white overflow-hidden">
          <!-- Video Preview with Controls (full-width, flush to header/toolbar) -->
          <div v-if="videoUrl" class="h-full relative">
              <!-- Video Player Preview Component -->
              <VideoPlayerPreview
                :video-url="videoUrl"
                :video-file="videoFile"
                :start-time="startTime"
                :end-time="endTime"
                :is-multi-segment-mode="isMultiSegmentMode"
                :segments="segments"
                :is-preview-playing="isPreviewPlaying"
                @video-loaded="onVideoLoaded"
                @time-update="onTimeUpdate"
                @play-pause-toggle="togglePlayPause"
                @video-ready="setVideoElement"
              />

              <!-- Overlay preview layers (text + image on separate tracks) -->
              <div class="absolute inset-0 pointer-events-none" ref="overlayContainerRef" @mousedown="clearOverlaySelection">
                <!-- Actual video content box wrapper to constrain drag inside real visible video area -->
                <div class="absolute" :style="overlayContentStyle" ref="overlayContentRef" @mousedown="clearOverlaySelection">
                  <!-- Image layers below -->
                  <template v-if="imageLayers && imageLayers.length">
                    <div v-for="layer in imageLayers" :key="layer.id"
                         v-show="currentTime >= layer.start && currentTime <= layer.end"
                         class="absolute pointer-events-auto group overlay-box"
                         :class="{ 'overlay-selected': isOverlaySelected('image', layer.id) }"
                         :data-image-layer="layer.id"
                         @mousedown.stop="startOverlayPreviewDrag($event, 'image', layer.id, 'move')"
                         @click.stop="selectOverlay('image', layer.id)"
                         @dblclick.stop="openImageEditor(layer.id)"
                         :style="{
                           left: (layer.x || 0) + '%',
                           top: (layer.y || 0) + '%',
                           width: (layer.width || 20) + '%',
                           height: (layer.height || 10) + '%',
                           transform: `rotate(${layer.rotation || 0}deg)`,
                           opacity: layer.opacity != null ? layer.opacity : 1,
                           zIndex: layer.zIndex || 10
                         }">
                      <img :src="layer.src" alt="overlay" 
                           class="w-full h-full object-contain select-none" 
                           draggable="false"
                           :style="{
                             filter: layer.shadow !== false ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' : 'none'
                           }" />
          <!-- Transform handles (only when selected) -->
          <template v-if="isOverlaySelected('image', layer.id)">
            <div class="overlay-handle handle-tl" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'image', layer.id, 'resize:tl')"></div>
            <div class="overlay-handle handle-tr" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'image', layer.id, 'resize:tr')"></div>
            <div class="overlay-handle handle-bl" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'image', layer.id, 'resize:bl')"></div>
            <div class="overlay-handle handle-br" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'image', layer.id, 'resize:br')"></div>
          </template>
                    </div>
                  </template>

                  <!-- Text layers above -->
                  <template v-if="textLayers && textLayers.length">
        <div v-for="layer in textLayers" :key="layer.id"
                         v-show="currentTime >= layer.start && currentTime <= layer.end"
                         class="absolute pointer-events-auto group overlay-box"
                         :class="{ 'overlay-selected': isOverlaySelected('text', layer.id) }"
          :data-text-layer="layer.id"
                         @mousedown.stop="startOverlayPreviewDrag($event, 'text', layer.id, 'move')"
                         @click.stop="selectOverlay('text', layer.id)"
                         @dblclick.stop="openTextEditor(layer.id)"
                         :style="{
                           left: (layer.x || 0) + '%',
                           top: (layer.y || 0) + '%',
                           width: (layer.width || 20) + '%',
                           height: (layer.height || 10) + '%',
                           transform: `rotate(${layer.rotation || 0}deg)`,
                           opacity: layer.opacity != null ? layer.opacity : 1,
                           zIndex: (layer.zIndex || 20)
                         }">
                      <div class="w-full h-full flex items-center select-none" :style="{
                        color: layer.color || '#fff',
                        fontSize: (layer.fontSize || 20) + 'px',
                        fontFamily: layer.fontFamily || 'sans-serif',
                        fontWeight: layer.fontWeight || 'bold',
                        fontStyle: layer.fontStyle || 'normal',
                        textAlign: layer.textAlign || 'center',
                        textShadow: layer.textShadow === false ? 'none' : (layer.textShadow || '0 2px 4px rgba(0,0,0,.6)'),
                        justifyContent: (layer.textAlign === 'left' ? 'flex-start' : (layer.textAlign === 'right' ? 'flex-end' : 'center')),
                        backgroundColor: layer.backgroundColor || 'transparent',
                        padding: layer.backgroundColor && layer.backgroundColor !== 'transparent' ? '4px 8px' : '0'
                      }">
                        {{ layer.text || 'Sample Text' }}
                      </div>
          <!-- Transform handles (only when selected) -->
          <template v-if="isOverlaySelected('text', layer.id)">
            <div class="overlay-handle handle-tl" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'text', layer.id, 'resize:tl')"></div>
            <div class="overlay-handle handle-tr" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'text', layer.id, 'resize:tr')"></div>
            <div class="overlay-handle handle-bl" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'text', layer.id, 'resize:bl')"></div>
            <div class="overlay-handle handle-br" title="Resize"
              @mousedown.stop="startOverlayPreviewDrag($event, 'text', layer.id, 'resize:br')"></div>
          </template>
                    </div>
                  </template>
                  <!-- Inline Text Editor Panel -->
                  <template v-if="isTextEditorOpen && editorTargetId && isOverlaySelected('text', editorTargetId)">
                    <div 
                      class="z-[70]"
                      :style="editorPanelStyle"
                      ref="textEditorPanelRef"
                      style="pointer-events: auto;"
                    >
                      <div class="min-w-[260px] max-w-[320px] px-2 py-2 rounded-md shadow-xl border border-gray-200 bg-white/95 backdrop-blur-sm text-[11px] max-h-[40vh] overflow-auto" @mousedown.stop>
                        <div class="flex items-center justify-between mb-1">
                          <div class="font-medium text-gray-700">แก้ไขข้อความ</div>
                          <button class="text-gray-500 hover:text-gray-700" title="ปิด" @click="closeTextEditor"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="space-y-2">
                          <!-- Text -->
                          <input type="text" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                 v-model="textEditor.text" @input="applyTextEdit('text', textEditor.text)" placeholder="ข้อความ" />
                          <div class="grid grid-cols-3 gap-2">
                            <!-- Color -->
                            <label class="col-span-1 flex items-center space-x-2">
                              <span class="text-gray-600">สี</span>
                              <input type="color" v-model="textEditor.color" @input="applyTextEdit('color', textEditor.color)"/>
                            </label>
                            <!-- Font size -->
                            <label class="col-span-2 flex items-center justify-end space-x-2">
                              <span class="text-gray-600">ขนาด</span>
                              <input type="number" min="8" max="200" step="1" class="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                     v-model.number="textEditor.fontSize" @input="applyTextEdit('fontSize', textEditor.fontSize)" />
                              <span>px</span>
                            </label>
                          </div>
                          <!-- Background and opacity controls -->
                          <div class="grid grid-cols-2 gap-2">
                            <!-- Background color -->
                            <label class="flex items-center space-x-2">
                              <span class="text-gray-600">พื้นหลัง</span>
                              <input type="color" v-model="textEditor.bgColor" @input="applyTextEdit('bgColor', textEditor.bgColor)"/>
                            </label>
                            <!-- Opacity -->
                            <label class="flex items-center space-x-2">
                              <span class="text-gray-600">ความจาง</span>
                              <input type="range" min="0" max="100" step="5" class="flex-1" 
                                     v-model.number="textEditor.opacity" @input="applyTextEdit('opacity', textEditor.opacity)" />
                              <span class="text-xs">{{textEditor.opacity}}%</span>
                            </label>
                          </div>
                          <!-- Style toggles -->
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-1">
                              <button @click="toggleTextStyle('bold')" :class="textEditor.bold ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]"><i class="fas fa-bold"></i></button>
                              <button @click="toggleTextStyle('italic')" :class="textEditor.italic ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]"><i class="fas fa-italic"></i></button>
                              <button @click="toggleShadow" :class="textEditor.shadow ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]" title="เงา"><i class="fas fa-adjust"></i></button>
                            </div>
                            <div class="flex items-center space-x-1">
                              <button @click="setAlign('left')" :class="textEditor.align==='left' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]"><i class="fas fa-align-left"></i></button>
                              <button @click="setAlign('center')" :class="textEditor.align==='center' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]"><i class="fas fa-align-center"></i></button>
                              <button @click="setAlign('right')" :class="textEditor.align==='right' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded border text-[11px]"><i class="fas fa-align-right"></i></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Image Editor Panel -->
                  <template v-if="isImageEditorOpen && editorTargetId && isOverlaySelected('image', editorTargetId)">
                    <div 
                      class="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[280px]"
                      ref="imageEditorPanelRef"
                      :style="editorPanelStyle"
                      @click.stop
                      @mousedown.stop
                    >
                      <!-- Header -->
                      <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                        <span class="text-sm font-medium text-gray-700">แก้ไขรูปภาพ</span>
                        <button class="text-gray-500 hover:text-gray-700" title="ปิด" @click="closeImageEditor"><i class="fas fa-times"></i></button>
                      </div>
                      
                      <!-- Controls Grid -->
                      <div class="grid grid-cols-2 gap-3 text-xs">
                        <!-- URL Input -->
                        <div class="col-span-2">
                          <label class="block text-gray-600 mb-1">URL รูปภาพ</label>
                          <input type="url" class="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                 v-model="imageEditor.src" @input="applyImageEdit('src', imageEditor.src)" placeholder="https://..." />
                        </div>
                        
                        <!-- Shadow Toggle -->
                        <div class="col-span-1">
                          <label class="block text-gray-600 mb-1">เงา</label>
                          <button @click="toggleImageShadow" :class="imageEditor.shadow ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'" 
                                  class="w-full px-2 py-1 rounded border text-[11px]" title="เงา">
                            <i class="fas fa-adjust"></i> {{ imageEditor.shadow ? 'เปิด' : 'ปิด' }}
                          </button>
                        </div>
                        
                        <!-- Opacity -->
                        <div class="col-span-1">
                          <label class="block text-gray-600 mb-1">ความทึบ</label>
                          <div class="flex items-center space-x-1">
                            <input type="range" min="0" max="100" class="flex-1"
                                   v-model.number="imageEditor.opacity" @input="applyImageEdit('opacity', imageEditor.opacity)" />
                            <span class="text-xs">{{imageEditor.opacity}}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
              </div>
            </div>

            <!-- Hover time label when using scissors tool -->
            <div 
              v-if="isCutModeActive && cutHoverTime != null"
              class="absolute top-2 right-2 z-30 pointer-events-none"
            >
              <span class="px-2 py-1 rounded bg-black/70 text-white text-xs font-mono shadow">
                {{ formatTime(cutHoverTime) }}
              </span>
            </div>
          </div>
          
          <!-- Fallback message when no video is loaded -->
          <div v-else class="h-full flex items-center justify-center bg-gray-100">
            <div class="text-center text-gray-500">
              <i class="fas fa-video text-4xl mb-3"></i>
              <p class="text-lg">ไม่พบวิดีโอ</p>
              <p class="text-sm">กรุณาตรวจสอบไฟล์วิดีโอ</p>
            </div>
          </div>
          
        </div>
        
        <!-- Custom Controls (Always visible - outside video conditional) -->
        <div class="bg-gray-900">
          <VideoCustomControls
            :current-time="currentTime"
            :video-duration="videoDuration"
            :start-time="startTime"
            :end-time="endTime"
            :is-video-playing="isVideoPlaying"
            :volume="volume"
            :is-muted="isMuted"
            :live-level="liveLevel"
            :live-level-left="liveLevelLeft"
            :live-level-right="liveLevelRight"
            :is-multi-segment-mode="isMultiSegmentMode"
            :segments="segments"
            :is-dragging-segment="isDraggingSegment"
            :drag-segment-data="dragSegmentData"
            @seek-from-progress-bar="handleSeekFromProgressBar"
            @start-progress-drag="handleStartProgressDrag"
            @toggle-play-pause="togglePlayPause"
            @seek-to-time="seekToTime"
            @toggle-mute="toggleMute"
            @update-volume="updateVolume"
            @toggle-fullscreen="toggleFullscreen"
            @start-segment-drag="handleStartSegmentDrag"
            @go-to-previous-segment="goToPreviousSegment"
            @go-to-next-segment="goToNextSegment"
          />
        </div>
        
        <!-- Bottom Panel: Timeline & Segments -->
        <div class="flex-1 bg-white border-t border-gray-200 overflow-y-auto">
          <div class="p-2 space-y-2">
          
          <!-- Video Timeline Overview  -->
          <div class="unified-timeline-container mt-2 border-t border-gray-200 pt-2">
            <div class="timeline-header mb-1 flex items-center justify-between">
              <div>
                <h4 class="text-sm font-semibold text-gray-900 flex items-center leading-tight">
                  <i class="fas fa-film mr-1 text-sm text-purple-600"></i>
                  Video Timeline Overview
                </h4>
                <div class="timeline-info flex items-center space-x-3 text-xs text-gray-600 mt-0.5">
                  <span class="segment-count">{{ safeSegments.length }} segments selected</span>
                  <span class="total-duration">Total output: {{ Math.round(getTotalSegmentsDuration()) }}s</span>
                  <span class="recommended-duration text-purple-600">Recommended: {{ recommendedSegmentDuration }}s/segment</span>
                </div>
              </div>
              
              <!-- Add Segment + Split (Scissors) Buttons -->
              <div v-if="isMultiSegmentMode" class="flex items-center space-x-1">
                <button 
                  @click="addSegment"
                  :disabled="trimDuration < 0.1"
                  class="px-1.5 py-0.5 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors flex items-center space-x-1"
                  title="เพิ่มช่วงใหม่"
                >
                  <i class="fas fa-plus text-xs"></i>
                  <span>เพิ่มช่วงใหม่</span>
                </button>
                <!-- Add Text / Add Image controls moved here -->
                <button @click="addTextLayer" class="px-1.5 py-0.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center space-x-1" title="Add Text">
                  <i class="fas fa-font text-xs"></i>
                  <span>Add Text</span>
                </button>
                <button @click="promptAddImageLayer" class="px-1.5 py-0.5 text-xs rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center space-x-1" title="Add Image (URL)">
                  <i class="fas fa-image text-xs"></i>
                  <span>Add Image</span>
                </button>
                <button
                  @click="toggleCutMode"
                  :aria-pressed="isCutModeActive ? 'true' : 'false'"
                  class="px-1.5 py-0.5 text-xs rounded font-medium transition-colors flex items-center space-x-1 border"
                  :class="isCutModeActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-400 hover:bg-blue-100' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  title="โหมดตัดช่วง (คลิกที่ไทม์ไลน์เพื่อแบ่ง)"
                >
                  <i class="fas fa-cut text-xs"></i>
                  <span class="hidden sm:inline">ตัดช่วง</span>
                </button>
              </div>
            </div>

            <!-- Wrapper so playhead can span overlays + main timeline -->
      <div class="relative" ref="globalTimelineWrapperRef">
              <!-- Global playhead spanning overlays + main timeline -->
              <div 
                v-if="videoDuration > 0"
        class="absolute top-0 bottom-0 z-50 cursor-col-resize"
                :style="{ left: Math.min(100, Math.max(0, (currentTime / videoDuration) * 100)) + '%' }"
                aria-label="ตำแหน่งการเล่นปัจจุบัน"
                role="presentation"
        @mousedown.stop="startPlayheadDrag"
              >
                <!-- Larger invisible handle area for easier dragging -->
        <div class="absolute -left-3 top-0 bottom-0 w-6" style="background: transparent;"></div>
                <!-- Move label below overlays; make it editable on click -->
                <div class="absolute -bottom-3 -translate-x-1/2 pointer-events-auto z-[60] max-w-[120px]" @mousedown.stop>
                  <!-- small connector notch -->
                  <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-white drop-shadow-sm pointer-events-none"></div>
                  <template v-if="isEditingPlayheadTime">
                    <input
                      ref="playheadInputRef"
          v-model="playheadEditText"
                      class="w-16 text-center px-1 py-[2px] rounded-md bg-white border text-gray-800 text-[11px] leading-4 shadow-sm focus:outline-none focus:ring-1"
                      :class="playheadInputInvalid ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                      @keydown.enter.prevent="commitPlayheadEdit"
                      @keydown.esc.prevent="cancelPlayheadEdit"
                      @blur="commitPlayheadEdit"
                      placeholder="00:00"
                    />
                  </template>
                  <template v-else>
                    <button type="button"
                            class="w-16 text-center px-1 py-[2px] rounded-md bg-white border border-gray-300 text-gray-800 text-[11px] leading-4 shadow-sm hover:bg-gray-50"
                            title="แก้ไขเวลา (เช่น 1:23 หรือ 83)"
                            @mousedown.stop="startPlayheadEdit">
                      {{ formatTime(currentTime) }}
                    </button>
                  </template>
                </div>
        <div class="relative h-full z-[40]">
                  <div class="absolute top-0 bottom-0 bg-blue-600 opacity-90" style="width:2px; transform: translateX(-1px);"></div>
                </div>
              </div>

              <!-- Overlay timelines placed directly under the header -->
              <div class="space-y-2 mb-3">
                <OverlayTimeline
                  :layers="textLayers"
                  :video-duration="videoDuration"
                  @update-layer="updateTextLayerTime"
                  @delete-layer="removeTextLayer"
                />
                <OverlayTimeline
                  :layers="imageLayers"
                  :video-duration="videoDuration"
                  @update-layer="updateImageLayerTime"
                  @delete-layer="removeImageLayer"
                />
              </div>

              <div 
              class="unified-timeline relative h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden"
              ref="unifiedTimelineRef"
              @click="onUnifiedTimelineClick"
            >
              <!-- Cut overlay: captures clicks, shows cursor, and renders hover guide -->
              <div 
                v-if="isCutModeActive"
                class="absolute inset-0 z-[60]"
                @click.stop.prevent="onCutOverlayClick"
                @mousemove="onCutOverlayMove"
                @mouseleave="onCutOverlayLeave"
                :style="scissorCursorStyle"
                aria-label="โหมดตัด: คลิกเพื่อแบ่งช่วง"
              >
                <!-- Hover cut guide (vertical dashed line at cursor position inside a valid segment) -->
                <div 
                  v-if="videoDuration > 0 && isCutHoverValid && cutHoverTime != null"
                  class="absolute top-0 bottom-0 pointer-events-none"
                  :style="{ left: Math.min(100, Math.max(0, (cutHoverTime / videoDuration) * 100)) + '%' }"
                >
                  <div class="absolute top-0 bottom-0 border-l-2 border-red-500 border-dashed" style="transform: translateX(-1px);"></div>
                </div>
              </div>
              <!-- Background thumbnails for the entire timeline -->
              <div v-if="videoDuration > 0 && thumbnails.length > 0" class="absolute inset-0 flex opacity-40">
                <div 
                  v-for="(thumbnail, index) in thumbnails" 
                  :key="index"
                  class="flex-1 bg-cover bg-center border-r border-gray-300 last:border-r-0"
                  :style="{ 
                    backgroundImage: `url(${thumbnail.dataUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }"
                ></div>
              </div>
              
              <!-- Background timeline -->
              <div class="timeline-background absolute inset-0" 
                   :class="thumbnails.length > 0 ? 'bg-white bg-opacity-50' : 'bg-gradient-to-r from-gray-100 to-gray-200'"></div>
              
              <!-- Waveform Canvas -->
              <canvas ref="waveformCanvasRef" class="absolute inset-0 pointer-events-none opacity-70"></canvas>
              
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
                
              
              <!-- All segments display with drag handles -->
              <SegmentTimeline
                :segments="segments"
                :video-duration="videoDuration"
                :current-editing-index="currentEditingIndex"
                :is-generating-segment-thumbnails="isGeneratingSegmentThumbnails"
                :segment-thumbnails="segmentThumbnails"
                :thumbnails="thumbnails"
                @start-unified-segment-drag="handleStartUnifiedSegmentDrag"
                @delete-segment="removeSegment"
              />
            </div>
            </div>
            
            <!-- Timeline Legend -->
            <div class="timeline-legend mt-3 flex items-center space-x-4 text-xs text-gray-600">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                <span>Saved segments</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>Current editing</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-arrows-alt-h mr-1 text-gray-400"></i>
                <span>Drag handles to resize</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-arrows-alt mr-1 text-gray-400"></i>
                <span>Drag center to move</span>
              </div>

              
            </div>
            
            <!-- Collapsible History panel trigger lives near segments header below -->
            
            <div v-if="!safeSegments.length" class="text-center text-gray-500 py-4">
              <i class="fas fa-info-circle mb-2"></i>
              <p class="text-sm">กำลังโหลด segment เริ่มต้น...</p>
            </div>
          </div>

          
          
          <!-- Segments Layout - Full Width -->
          <div class="mt-6 border-t border-gray-200 pt-4">
            
            <!-- Multi-Segment Controls - Full Width -->
            <div class="space-y-4 w-full">
              <div class="flex items-center justify-between">
                <button 
                  @click="isSegmentsExpanded = !isSegmentsExpanded"
                  class="flex items-center space-x-2 text-base leading-tight font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <i class="fas fa-layer-group text-purple-600"></i>
                  <span>ช่วงที่เลือกแล้ว ({{ safeSegments.length }})</span>
                  <i class="fas transition-transform duration-200" 
                     :class="isSegmentsExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
                <div class="flex items-center space-x-2">
                  <div class="text-sm text-purple-600 font-medium">
                    {{ Math.round(getTotalSegmentsDuration()) }}s รวม
                  </div>
                    <!-- Toggle History Panel -->
                    <button 
                      type="button"
                      @click="showHistoryPanel = !showHistoryPanel"
                      class="px-2 py-0.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1"
                      :aria-expanded="showHistoryPanel ? 'true' : 'false'"
                      title="ประวัติการแก้ไข"
                    >
                      <i class="fas fa-history text-gray-600"></i>
                      <span class="hidden sm:inline">ประวัติ</span>
                    </button>
                  <button 
                    v-if="safeSegments.length > 0"
                    @click="clearAllSegments"
                    class="px-2 py-0.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  >
                    ลบทั้งหมด
                  </button>
                </div>
              </div>

                <!-- History now opens as a centered popup modal; inline panel removed -->
            
            <!-- Unified Info Display (always visible) -->
            <div class="space-y-3">
              <!-- Single Mode Info -->
              <div v-if="!isMultiSegmentMode" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 mb-2">ช่วงที่เลือก</h5>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-700">
                    {{ formatTime(startTime) }} - {{ formatTime(endTime) }}
                  </span>
                  <span class="text-gray-600 font-medium">
                    ระยะเวลา: {{ formatTime(trimDuration) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Collapsible Segments Section -->
            <div v-if="isMultiSegmentMode && isSegmentsExpanded" class="space-y-4">
              
              <!-- Segments List -->
              <div 
                v-if="safeSegments.length > 0" 
                class="space-y-2"
              >
                <div 
                  v-for="(segment, index) in safeSegments" 
                  :key="segment.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-900">
                          #{{ index + 1 }}
                        </span>
                        <!-- Inline time editors for start/end -->
            <div class="flex items-center space-x-1.5 text-sm text-gray-600">
                          <input
                            :value="segmentEdit[segment.id]?.startText ?? formatTime(segment.start)"
                            @input="onEditInput(segment.id, 'startText', $event.target.value)"
                            @keydown.enter.prevent="commitSegmentEdit(segment.id)"
                            @blur="commitSegmentEdit(segment.id)"
              :class="['w-16 px-2 py-0.5 text-xs rounded bg-white focus:outline-none focus:ring-1',
                   isInvalidTime(segmentEdit[segment.id]?.startText) ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500']"
                            placeholder="00:00"
                          />
                          <span class="opacity-60">-</span>
                          <input
                            :value="segmentEdit[segment.id]?.endText ?? formatTime(segment.end)"
                            @input="onEditInput(segment.id, 'endText', $event.target.value)"
                            @keydown.enter.prevent="commitSegmentEdit(segment.id)"
                            @blur="commitSegmentEdit(segment.id)"
              :class="['w-16 px-2 py-0.5 text-xs rounded bg-white focus:outline-none focus:ring-1',
                   isInvalidTime(segmentEdit[segment.id]?.endText) ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500']"
                            placeholder="00:00"
                          />
                        </div>
                        <!-- Inline duration editor -->
                        <input
                          :value="segmentEdit[segment.id]?.durText ?? formatTime(segment.duration)"
                          @input="onEditInput(segment.id, 'durText', $event.target.value)"
                          @keydown.enter.prevent="commitSegmentEdit(segment.id)"
                          @blur="commitSegmentEdit(segment.id)"
              :class="['w-16 px-2 py-0.5 text-xs rounded bg-white focus:outline-none focus:ring-1',
                   isInvalidTime(segmentEdit[segment.id]?.durText) ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500']"
                          placeholder="00:10"
                        />
                      </div>
                    </div>
          <div class="flex items-center space-x-2">
                    <button 
                      @click="selectSegment(segment)"
                      class="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="removeSegment(segment.id)"
                      class="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      title="ลบ"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
            
            <div v-if="!safeSegments.length" class="text-center text-gray-500 py-4">
              <i class="fas fa-info-circle mb-2"></i>
              <p class="text-sm">กำลังโหลด segment เริ่มต้น...</p>
            </div>
            
            <!-- Processing Progress -->
            <div v-if="isProcessing" class="space-y-3 mt-6">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700">กำลังประมวลผล...</span>
                <span class="font-semibold text-blue-600">{{ progressPercentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer (compact) -->
        <div class="flex items-center justify-end py-3 px-4 border-t border-gray-200 bg-gray-50/95 backdrop-blur">
          <div class="flex space-x-2">
            <button 
              @click="closeModal"
              :disabled="isProcessing"
              class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button 
              @click="startTrimming"
              :disabled="(!canTrim && !isMultiSegmentMode) || (isMultiSegmentMode && segments.length === 0) || isProcessing"
              class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <i class="fas fa-cut text-xs"></i>
              <span>
                {{ isProcessing ? 'กำลังตัดต่อ...' : 
                   isMultiSegmentMode && segments.length > 0 ? `ตัดต่อ ${segments.length} ช่วง` : 
                   'ตัดต่อวีดีโอ' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Export Options Modal (Separate from main modal) -->
  <div v-if="showExportOptions" class="fixed inset-0 z-[9999] overflow-y-auto" @keyup.esc="cancelExport" tabindex="0">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="cancelExport"></div>
  <div class="flex min-h-full items-center justify-center p-4" @keyup.esc.stop="cancelExport">
      <div class="relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all">
        <!-- Export Header (compact) -->
        <div class="flex items-center justify-between py-3 px-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="p-1.5 bg-green-100 rounded-lg">
              <i class="fas fa-cog text-green-600 text-base"></i>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 leading-tight">ตั้งค่าการส่งออก</h3>
              <p class="text-xs text-gray-500 leading-tight">กำหนดรายละเอียดก่อนตัดต่อ</p>
            </div>
          </div>
          <button 
            @click="cancelExport"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="ปิด"
          >
            <i class="fas fa-times text-base"></i>
          </button>
        </div>
              
              <!-- Export Settings -->
              <div class="p-4 space-y-4">
                <!-- Trim Mode Selection -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">โหมดการตัดต่อ</label>
                  <div class="grid grid-cols-1 gap-2">
                    <label class="relative cursor-pointer">
                      <input 
                        type="radio" 
                        v-model="exportSettings.trimMode" 
                        value="single"
                        class="sr-only"
                      />
                      <div class="p-3 border-2 rounded-lg transition-all" 
                           :class="exportSettings.trimMode === 'single' 
                             ? 'border-blue-500 bg-blue-50' 
                             : 'border-gray-200 hover:border-gray-300'"
                      >
                        <div class="flex items-center space-x-2.5">
                          <i class="fas fa-cut text-base" 
                             :class="exportSettings.trimMode === 'single' ? 'text-blue-600' : 'text-gray-400'"></i>
                          <div>
                            <div class="font-medium text-gray-900 text-sm">ตัดช่วงเดียว</div>
                            <div class="text-xs text-gray-500">ตัดเฉพาะช่วงที่เลือกปัจจุบัน</div>
                          </div>
                        </div>
                      </div>
                    </label>
                    <label class="relative cursor-pointer">
                      <input 
                        type="radio" 
                        v-model="exportSettings.trimMode" 
                        value="multi"
                        class="sr-only"
                        :disabled="segments.length === 0"
                      />
                      <div class="p-3 border-2 rounded-lg transition-all" 
                           :class="[
                             exportSettings.trimMode === 'multi' 
                               ? 'border-purple-500 bg-purple-50' 
                               : 'border-gray-200 hover:border-gray-300',
                             segments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                           ]"
                      >
                        <div class="flex items-center space-x-2.5">
                          <i class="fas fa-layer-group text-base" 
                             :class="exportSettings.trimMode === 'multi' ? 'text-purple-600' : 'text-gray-400'"></i>
                          <div>
                            <div class="font-medium text-gray-900 text-sm">ตัดหลายช่วง</div>
                            <div class="text-xs text-gray-500">
                              นำช่วงที่เลือกมาต่อกัน ({{ segments.length }} ช่วง)
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div v-if="exportSettings.trimMode === 'multi' && segments.length > 0" 
                       class="text-xs text-purple-600 p-1.5 bg-purple-50 rounded">
                    ระยะเวลารวม: {{ formatTime(getTotalSegmentsDuration()) }}
                  </div>
                </div>
                
                <!-- Audio Volume -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">ระดับเสียง</label>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-600">{{ exportSettings.volume }}%</span>
                      <span class="text-xs text-gray-500">
                        <template v-if="exportSettings.volume < 100">เบา</template>
                        <template v-else-if="exportSettings.volume === 100">ปกติ</template>
                        <template v-else>ดัง</template>
                      </span>
                    </div>
                    
                    <!-- Custom Volume Slider -->
                    <div class="relative">
                      <div class="w-full h-1.5 bg-gray-200 rounded-lg relative overflow-hidden">
                        <!-- Volume fill -->
                        <div 
                          class="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-lg transition-all duration-200"
                          :style="{ width: `${Math.min(exportSettings.volume / 2, 100)}%` }"
                        ></div>
                        
                        <!-- Volume handle -->
                        <div 
                          class="absolute top-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1.5 cursor-pointer"
                          :style="{ left: `${Math.min(exportSettings.volume / 2, 100)}%` }"
                        ></div>
                        
                        <!-- Hidden input for interaction -->
                        <input 
                          type="range" 
                          min="0" 
                          max="200" 
                          step="5"
                          v-model="exportSettings.volume"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      
                      <!-- Volume markers -->
                      <div class="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Output Quality -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">ความละเอียด</label>
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      v-for="quality in qualityOptions"
                      :key="quality.value"
                      @click="exportSettings.quality = quality.value"
                      :class="[
                        'w-full px-2 py-1 text-xs font-medium rounded border transition-colors text-center',
                        exportSettings.quality === quality.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      ]"
                    >
                      {{ quality.label }}
                    </button>
                  </div>
                  <div class="text-xs text-gray-500">
                    <template v-if="exportSettings.quality === '240p'">ขนาดไฟล์เล็กมาก, คุณภาพต่ำ</template>
                    <template v-else-if="exportSettings.quality === '480p'">ขนาดไฟล์เล็ก, คุณภาพปานกลาง</template>
                    <template v-else-if="exportSettings.quality === '720p'">ขนาดไฟล์กลาง, คุณภาพดี</template>
                    <template v-else-if="exportSettings.quality === '1080p'">ขนาดไฟล์ใหญ่, คุณภาพสูง</template>
                    <template v-else-if="exportSettings.quality === 'original'">ขนาดใหญ่ที่สุด, คุณภาพเหมือนต้นฉบับ</template>
                  </div>
                </div>
                
                <!-- Output Format -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">รูปแบบไฟล์</label>
                  <select 
                    v-model="exportSettings.format"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mp4">MP4 (แนะนำ)</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                  </select>
                </div>
                
                <!-- Processing Mode -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">โหมดการประมวลผล</label>
                  <div class="space-y-2">
          <label class="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        v-model="exportSettings.processingMode" 
                        value="fast"
                        class="w-4 h-4 text-blue-600"
                      />
                      <div>
            <div class="font-medium text-gray-900 text-sm">เร็ว (Copy Streams)</div>
                        <div class="text-xs text-gray-500">ไม่แปลงไฟล์ใหม่ เร็วแต่อาจมีข้อจำกัด</div>
                      </div>
                    </label>
          <label class="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        v-model="exportSettings.processingMode" 
                        value="quality"
                        class="w-4 h-4 text-blue-600"
                      />
                      <div>
            <div class="font-medium text-gray-900 text-sm">คุณภาพ (Re-encode)</div>
                        <div class="text-xs text-gray-500">แปลงไฟล์ใหม่ ช้าแต่คุณภาพดีและปรับแต่งได้มาก</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <!-- File Name -->
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-700">ชื่อไฟล์</label>
                  <input 
                    type="text" 
                    v-model="exportSettings.filename"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ชื่อไฟล์ที่ต้องการ"
                  />
                </div>
              </div>
              
              <!-- Export Actions -->
              <div class="flex items-center justify-between py-3 px-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button 
                  @click="cancelExport"
                  class="px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                
                <div class="flex space-x-3">
                  <button 
                    @click="resetExportSettings"
                    class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors"
                  >
                    รีเซ็ต
                  </button>
                  <button 
                    @click="confirmExport"
                    :disabled="isProcessing || !exportSettings.filename || (exportSettings.trimMode === 'multi' && segments.length === 0)"
                    class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-download"></i>
                    <span>เริ่มตัดต่อ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Popup Modal (Centered, above other panels) -->
      <div v-if="showHistoryPanel" class="fixed inset-0 z-[10000] overflow-y-auto" @keyup.esc="showHistoryPanel = false" tabindex="0">
        <div class="fixed inset-0 bg-black/50" @click="showHistoryPanel = false"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all">
            <!-- Header -->
            <div class="flex items-center justify-between py-2.5 px-3 border-b border-gray-200">
              <div class="flex items-center space-x-2">
                <i class="fas fa-history text-gray-700"></i>
                <h3 class="text-sm font-semibold text-gray-900">ประวัติการแก้ไข</h3>
              </div>
              <div class="flex items-center space-x-1">
                <button @click="undo" :disabled="!canUndo" class="p-1 text-[11px] border border-gray-300 rounded disabled:opacity-50" aria-label="Undo" title="Undo">
                  <i class="fas fa-undo"></i>
                </button>
                <button @click="redo" :disabled="!canRedo" class="p-1 text-[11px] border border-gray-300 rounded disabled:opacity-50" aria-label="Redo" title="Redo">
                  <i class="fas fa-redo"></i>
                </button>
                <button @click="showHistoryPanel = false" class="p-1 text-gray-500 hover:bg-gray-100 rounded" aria-label="ปิด">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <!-- Body -->
            <div class="p-3">
              <!-- Vertical List View with Scrollbar -->
              <div class="history-list max-h-72 overflow-y-auto rounded border border-gray-200 divide-y divide-gray-200">
                <button
                  v-for="(h, i) in historyItems"
                  :key="h.id"
                  @click="gotoHistory(i)"
                  class="w-full flex items-center justify-between px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="i === historyIndex 
                    ? 'bg-blue-50 text-blue-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'"
                  :title="h.time"
                >
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center justify-center w-5 h-5 text-[10px] rounded-full"
                          :class="i === historyIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'">
                      {{ i + 1 }}
                    </span>
                    <span class="font-medium">{{ h.label }}</span>
                  </div>
                  <span class="text-[10px] text-gray-500">{{ h.time }}</span>
                </button>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-end py-2 px-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button @click="showHistoryPanel = false" class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import toast from '@/plugins/ToastUI.js';
import { useVideoTrim } from '@/composables/useVideoTrim';
import VideoPlayerPreview from './VideoPlayerPreview.vue';
import VideoCustomControls from './VideoCustomControls.vue';
import OverlayTimeline from './OverlayTimeline.vue';
import SegmentTimeline from './SegmentTimeline.vue';
import {
  parseTimeStringSafe,
  cloneSegment,
  recommendSegmentDuration as recommendSegmentDurationFn,
  buildProjectSnapshot as buildProjectSnapshotFn,
  validateImportedProject as validateImportedProjectFn,
  normalizeImportedSegments,
  sumSegmentsDuration,
  makeId,
  computeTimeMarkers,
  isInvalidTimeText,
  rangesOverlap,
  computeDefaultSegmentDuration,
  findLastSegmentByEnd,
  sortAndFindIndex,
  // extracted helpers
  autoResolveOverlaps,
  computeTargetBarsByWidth,
  samplePeaksFromAudioBuffer,
  getSegmentMiddleTime
} from '@/components/videoEditor/function/function.js';
import { downloadJson } from '@/components/videoEditor/lib/lib.js';
import { createHistory } from '@/components/videoEditor/function/history.js';

export default {
  name: 'VideoTrimmer',
  components: {
    VideoPlayerPreview,
  VideoCustomControls,
  OverlayTimeline,
    SegmentTimeline
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
  emits: ['close', 'trimmed'],
  setup(props, { emit }) {
    const {
      videoFile,
      videoUrl,
      videoDuration,
      currentTime,
      startTime,
      endTime,
      trimDuration,
      isProcessing,
      progressPercentage,
      canTrim,
      loadVideo,
      seekToTime,
      formatTime,
      reset,
      setPreviewElement
    } = useVideoTrim();
    
      // ===== Undo / Redo History Stack =====
      const snapshotState = (label) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        label,
        time: new Date().toLocaleTimeString(),
        segments: (segments.value || []).map(s => ({ id: s.id, start: s.start, end: s.end, duration: s.duration })),
        currentEditingIndex: currentEditingIndex.value
      });
      const restoreFromSnapshot = async (snap) => {
        if (!snap) return;
        isAddingSegment.value = true;
        // Clear then set to avoid patching into stale anchors
        segments.value = [];
        await nextTick();
        segments.value = snap.segments.map(s => ({ ...s }));
        currentEditingIndex.value = Math.min(Math.max(0, snap.currentEditingIndex ?? -1), segments.value.length - 1);
        await nextTick();
        isAddingSegment.value = false;
      };
  const { index: historyIndex, push: pushHistory, undo, redo, gotoIndex, canUndo, canRedo, items: historyItems } = createHistory({
        getSnapshot: snapshotState,
        restore: restoreFromSnapshot,
        maxHistory: 200
      });
      const gotoHistory = (idx) => gotoIndex(idx);
  const showHistoryPanel = ref(false);

    const videoRef = ref(null);
    const timelineRef = ref(null);
    const unifiedTimelineRef = ref(null);
    const isDragging = ref(false);
    const dragType = ref(''); // 'start' or 'end'
    const thumbnails = ref([]);
    const segmentThumbnails = ref([]);
    const isGeneratingSegmentThumbnails = ref(false);
    const isGeneratingThumbnails = ref(false);
    const thumbnailProgress = ref(0);
  const isPreviewPlaying = ref(false);
  // Overlay layers state (split by type)
  const textLayers = ref([]);
  const imageLayers = ref([]);
  // (No unified computed; separate text/image timelines are used)
  const overlayContainerRef = ref(null);
  // Inner wrapper aligned to the actual visible video rect (letterbox/pillarbox safe)
  const overlayContentRef = ref(null);
  const overlayContentStyle = ref({ left: '0px', top: '0px', width: '100%', height: '100%' });
  const overlayDragging = ref(null); // { kind, id, mode: 'move'|'resize:tl|resize:tr|resize:bl|resize:br', startX, startY, startPctX, startPctY, startW, startH, boxW, boxH }
  // rAF loop id to keep editor panel following the text box during drag
  let editorFollowRaf = 0;
  const startEditorFollow = () => {
    if (editorFollowRaf) return;
    const step = () => {
      if (!isTextEditorOpen.value && !isImageEditorOpen.value) { editorFollowRaf = 0; return; }
      try { updateEditorPanelPosition(); } catch (e) { /* ignore */ }
      editorFollowRaf = requestAnimationFrame(step);
    };
    editorFollowRaf = requestAnimationFrame(step);
  };
  const stopEditorFollow = () => {
    if (editorFollowRaf) cancelAnimationFrame(editorFollowRaf);
    editorFollowRaf = 0;
  };
  const selectedOverlay = ref({ kind: null, id: null });
  const textEditorPanelRef = ref(null);
  const editorPanelStyle = ref({ 
    position: 'absolute',
    left: '50px', 
    top: '50px',
    zIndex: 70
  });
  // Inline Text Editor Panel state
  const isTextEditorOpen = ref(false);
  const editorTargetId = ref(null);
  const textEditor = ref({ text: '', color: '#FFFFFF', fontSize: 24, bold: true, italic: false, align: 'center', shadow: true });
  
  // Inline Image Editor Panel state
  const isImageEditorOpen = ref(false);
  const imageEditorPanelRef = ref(null);
  const imageEditor = ref({ src: '', shadow: true, opacity: 100 });
    const isVideoPlaying = ref(false);
    const volume = ref(1);
    const isMuted = ref(false);
  // Cut mode state
  const isCutModeActive = ref(false);
  // Hover guide for cut mode
  const cutHoverTime = ref(null); // seconds or null
  const isCutHoverValid = computed(() => {
    const t = cutHoverTime.value;
    if (t == null || !Array.isArray(segments.value) || segments.value.length === 0) return false;
    const idx = segments.value.findIndex(s => t > s.start && t < s.end);
    return idx !== -1;
  });
    
  // WebAudio: audio output + live meters (stereo)
  const audioCtx = ref(null);
  const mediaSource = ref(null);
  const analyser = ref(null); // overall
  const analyserL = ref(null);
  const analyserR = ref(null);
  const splitterNode = ref(null);
  const audioConnected = ref(false);
    const waveformCanvasRef = ref(null);
    const waveformPeaks = ref([]);
  const liveLevel = ref(0); // 0-100 overall
  const liveLevelLeft = ref(0);  // 0-100
  const liveLevelRight = ref(0); // 0-100
  let meterRaf = null;
  let hoverSeekRaf = null; // throttle seek on hover

    // Editable playhead time state
    const isEditingPlayheadTime = ref(false);
    const playheadEditText = ref('');
    const playheadInputInvalid = ref(false);
    const playheadInputRef = ref(null);
    const startPlayheadEdit = () => {
      isEditingPlayheadTime.value = true;
      playheadEditText.value = formatTime(currentTime.value);
      playheadInputInvalid.value = false;
      // focus next tick
      requestAnimationFrame(() => playheadInputRef.value?.focus?.());
    };
    const cancelPlayheadEdit = () => {
      isEditingPlayheadTime.value = false;
      playheadInputInvalid.value = false;
    };
    const commitPlayheadEdit = () => {
      const raw = (playheadEditText.value || '').trim();
      if (!raw) { cancelPlayheadEdit(); return; }
      // Accept mm:ss, hh:mm:ss, or seconds
      const parsed = parseTimeStringSafe(raw);
      if (parsed == null || isNaN(parsed)) {
        playheadInputInvalid.value = true;
        return;
      }
      const vd = Number(videoDuration.value) || 0;
      const t = Math.min(vd, Math.max(0, parsed));
      currentTime.value = t;
  try { if (videoRef.value) videoRef.value.currentTime = t; } catch (_) { /* ignore seek error */ }
      cancelPlayheadEdit();
    };

    const setupAudioGraph = (el) => {
      try {
        if (!el) {
          console.log('Audio setup: No video element provided');
          return;
        }
        
        console.log('Setting up audio graph for video element');
        
        if (!audioCtx.value) {
          audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
          console.log('Created audio context, state:', audioCtx.value.state);
        }
        
        if (!mediaSource.value) {
          mediaSource.value = audioCtx.value.createMediaElementSource(el);
          console.log('Created media element source');
        }
        
        if (!analyser.value) {
          analyser.value = audioCtx.value.createAnalyser();
          analyser.value.fftSize = 2048;
          analyser.value.smoothingTimeConstant = 0.85;
        }
        
        if (!splitterNode.value) splitterNode.value = audioCtx.value.createChannelSplitter(2);
        
        if (!analyserL.value) { 
          analyserL.value = audioCtx.value.createAnalyser(); 
          analyserL.value.fftSize = 2048; 
          analyserL.value.smoothingTimeConstant = 0.85; 
        }
        
        if (!analyserR.value) { 
          analyserR.value = audioCtx.value.createAnalyser(); 
          analyserR.value.fftSize = 2048; 
          analyserR.value.smoothingTimeConstant = 0.85; 
        }
        
        if (!audioConnected.value) {
          try { 
            mediaSource.value.connect(audioCtx.value.destination); 
            console.log('Connected media source to destination');
          } catch (e) { 
            console.warn('Media source to destination connection failed:', e);
          }
          
          try {
            mediaSource.value.connect(analyser.value);
            mediaSource.value.connect(splitterNode.value);
            splitterNode.value.connect(analyserL.value, 0);
            splitterNode.value.connect(analyserR.value, 1);
            console.log('Connected audio analysis graph');
            audioConnected.value = true;
          } catch (e) { 
            console.warn('Failed to wire analysis graph:', e); 
          }
        }
        
        // Resume audio context if needed
        if (audioCtx.value.state === 'suspended') {
          audioCtx.value.resume().then(() => {
            console.log('Audio context resumed');
          }).catch(e => {
            console.warn('Failed to resume audio context:', e);
          });
        }
        
      } catch (e) {
        console.error('Audio graph setup failed:', e);
      }
    };

    const startLiveMeter = () => {
      if (!analyserL.value || !analyserR.value) {
        console.log('Cannot start live meter: analysers not ready');
        return;
      }
      
      console.log('Starting live audio meter');
      
      const bufL = new Uint8Array(analyserL.value.fftSize);
      const bufR = new Uint8Array(analyserR.value.fftSize);
      
      const loop = () => {
        try {
          analyserL.value.getByteTimeDomainData(bufL);
          analyserR.value.getByteTimeDomainData(bufR);
          
          const rms = (arr) => {
            let sum = 0;
            for (let i = 0; i < arr.length; i++) { 
              const v = (arr[i] - 128) / 128; 
              sum += v * v; 
            }
            return Math.sqrt(sum / arr.length);
          };
          
          const l = rms(bufL);
          const r = rms(bufR);
          
          liveLevelLeft.value = Math.min(100, Math.max(0, Math.round(l * 200))); // Increased sensitivity
          liveLevelRight.value = Math.min(100, Math.max(0, Math.round(r * 200))); // Increased sensitivity
          liveLevel.value = Math.round((liveLevelLeft.value + liveLevelRight.value) / 2);
          
          // Debug every 60 frames (about once per second at 60fps)
          if (Math.random() < 0.016) {
            console.log('Audio levels - L:', liveLevelLeft.value, 'R:', liveLevelRight.value);
          }
          
        } catch (e) { 
          console.error('Live meter error:', e);
        }
        meterRaf = requestAnimationFrame(loop);
      };
      
      if (!meterRaf) {
        meterRaf = requestAnimationFrame(loop);
      }
    };

    const stopLiveMeter = () => {
      if (meterRaf) {
        cancelAnimationFrame(meterRaf);
        meterRaf = null;
      }
    };

    // ========== Draggable Playhead ==========
    const globalTimelineWrapperRef = ref(null);
    const isDraggingPlayhead = ref(false);
    let playheadAnimationFrame = null;
    let cachedWrapperRect = null;

    const seekFromWrapperEvent = (clientX) => {
      try {
        const wrap = globalTimelineWrapperRef.value;
        if (!wrap || !videoDuration.value) return;
        const rect = cachedWrapperRect || wrap.getBoundingClientRect();
        if (!cachedWrapperRect) cachedWrapperRect = rect;
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const ratio = rect.width > 0 ? (x / rect.width) : 0;
        const t = Math.min(videoDuration.value, Math.max(0, ratio * videoDuration.value));
        currentTime.value = t;
        if (videoRef.value) {
          // use rAF to avoid flooding
          if (!playheadAnimationFrame) {
            playheadAnimationFrame = requestAnimationFrame(() => {
              try { videoRef.value.currentTime = currentTime.value; } catch (e) { /* ignore */ }
              playheadAnimationFrame = null;
            });
          }
        }
      } catch (_) { /* ignore */ }
    };

    const onPlayheadDragMove = (e) => {
      if (!isDraggingPlayhead.value) return;
      e.preventDefault();
      seekFromWrapperEvent(e.clientX);
    };

    const stopPlayheadDrag = () => {
      isDraggingPlayhead.value = false;
      cachedWrapperRect = null;
      document.removeEventListener('mousemove', onPlayheadDragMove);
      document.removeEventListener('mouseup', stopPlayheadDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const startPlayheadDrag = (e) => {
      if (isCutModeActive.value) return; // disable in cut mode overlay
      isDraggingPlayhead.value = true;
      cachedWrapperRect = globalTimelineWrapperRef.value?.getBoundingClientRect() || null;
      seekFromWrapperEvent(e.clientX);
      document.addEventListener('mousemove', onPlayheadDragMove);
      document.addEventListener('mouseup', stopPlayheadDrag);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

  const computeWaveform = async (file) => {
      try {
        if (!file) return;
        if (!audioCtx.value) audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
        const ab = await file.arrayBuffer();
        const audioBuf = await audioCtx.value.decodeAudioData(ab.slice(0));
  const targetBars = computeTargetBarsByWidth(waveformCanvasRef.value?.clientWidth || 800);
  waveformPeaks.value = samplePeaksFromAudioBuffer(audioBuf, targetBars);
        drawWaveform();
      } catch (e) {
        console.warn('Waveform generation failed:', e);
      }
    };

    const drawWaveform = () => {
      const canvas = waveformCanvasRef.value;
      const peaks = waveformPeaks.value;
      if (!canvas || !peaks || peaks.length === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(10, Math.floor(rect.width));
      const height = Math.max(10, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(width, mid);
      ctx.stroke();
      const barW = Math.max(1, width / peaks.length);
      ctx.fillStyle = '#93c5fd';
      for (let i = 0; i < peaks.length; i++) {
        const x = i * barW;
        const min = peaks[i].min;
        const max = peaks[i].max;
        const y1 = mid + min * (height / 2);
        const y2 = mid + max * (height / 2);
        ctx.fillRect(x, y1, Math.max(1, barW * 0.9), Math.max(1, y2 - y1));
      }
    };

    // Compute the visible video box inside the preview container so overlays clamp to actual content
    const updateOverlayContentStyle = () => {
      try {
        const container = overlayContainerRef.value;
        const videoEl = videoRef.value;
        if (!container || !videoEl) {
          overlayContentStyle.value = { left: '0px', top: '0px', width: '100%', height: '100%' };
          return;
        }
        const cRect = container.getBoundingClientRect();
        const vRect = videoEl.getBoundingClientRect();
        const vw = Number(videoEl.videoWidth) || 0;
        const vh = Number(videoEl.videoHeight) || 0;
        if (!cRect.width || !cRect.height || !vRect.width || !vRect.height || !vw || !vh) {
          overlayContentStyle.value = { left: '0px', top: '0px', width: '100%', height: '100%' };
          return;
        }
        // Compute displayed content inside the video element (object-contain letterboxing inside vRect)
        const scale = Math.min(vRect.width / vw, vRect.height / vh);
        const dispW = vw * scale;
        const dispH = vh * scale;
        const innerLeftInVideo = (vRect.width - dispW) / 2;
        const innerTopInVideo = (vRect.height - dispH) / 2;
        const left = (vRect.left - cRect.left) + innerLeftInVideo;
        const top = (vRect.top - cRect.top) + innerTopInVideo;
        overlayContentStyle.value = {
          left: Math.round(left) + 'px',
          top: Math.round(top) + 'px',
          width: Math.round(dispW) + 'px',
          height: Math.round(dispH) + 'px'
        };
      } catch (_) { /* ignore */ }
    };

    // Observe size changes to keep overlay bounds in sync
    let overlayResizeObs = null;
    const setupOverlayObservers = () => {
      try {
        if (typeof ResizeObserver === 'undefined') return;
        if (overlayResizeObs) overlayResizeObs.disconnect();
        overlayResizeObs = new ResizeObserver(() => {
          try { updateOverlayContentStyle(); } catch (e) { /* ignore */ }
          // Reposition text editor if open since overlay box changed
          try { if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition); } catch (e) { /* ignore */ }
        });
        if (overlayContainerRef.value) overlayResizeObs.observe(overlayContainerRef.value);
        if (videoRef.value) overlayResizeObs.observe(videoRef.value);
      } catch (_) { /* ignore */ }
    };
  const importInputRef = ref(null);
  // Inline edit buffers per segment id
  const segmentEdit = ref({});
    
  // Removed renderKey forcing; rely on reactive updates for stability.
    
    // Computed properties for unified timeline
  const timeMarkers = computed(() => computeTimeMarkers(videoDuration.value, 10));
    
  const recommendedSegmentDuration = computed(() => recommendSegmentDurationFn(videoDuration.value));

    // Determine if we can split at current playhead
    const canSplitAtPlayhead = computed(() => {
      const t = Number(currentTime.value) || 0;
      const vd = Number(videoDuration.value) || 0;
      if (vd <= 0 || !Array.isArray(segments.value) || segments.value.length === 0) return false;
      // Find segment containing t (exclusive of end to avoid splitting at exact end)
      const idx = segments.value.findIndex(s => t > s.start && t < s.end);
      if (idx === -1) return false;
      const MIN = 0.1;
      // Ensure both sides remain >= MIN
      const seg = segments.value[idx];
      return (t - seg.start) >= MIN && (seg.end - t) >= MIN;
    });

    const splitAtPlayhead = async () => {
      const t = Number(currentTime.value) || 0;
      if (!Array.isArray(segments.value) || segments.value.length === 0) return;
      const idx = segments.value.findIndex(s => t > s.start && t < s.end);
      if (idx === -1) return;
      const MIN = 0.1;
      const seg = segments.value[idx];
      // Validate minimal durations
      if ((t - seg.start) < MIN || (seg.end - t) < MIN) return;
      // Create two new segments preserving order
  const left = { id: makeId(), start: seg.start, end: t, duration: Math.max(0, t - seg.start) };
  const right = { id: makeId(), start: t, end: seg.end, duration: Math.max(0, seg.end - t) };
      // Build new array
      const newArr = [
        ...segments.value.slice(0, idx),
        left,
        right,
        ...segments.value.slice(idx + 1)
      ].map(s => ({ ...s, duration: Math.max(0, s.end - s.start) }));

      // Safe commit: clear first to avoid DOM anchor issues, then set
      try {
        isAddingSegment.value = true;
        segments.value = [];
        await nextTick();
        segments.value = newArr;
        currentEditingIndex.value = idx + 1; // Set editor to right segment (after the cut)
        await nextTick();
      } finally {
        isAddingSegment.value = false;
      }
      // Record history after DOM settles
      pushHistory('ตัดช่วงที่ตำแหน่งเล่น');
    };

    const toggleCutMode = () => {
      isCutModeActive.value = !isCutModeActive.value;
      if (!isCutModeActive.value) {
        // Clear hover guide when leaving cut mode
        cutHoverTime.value = null;
      }
    };

    const onUnifiedTimelineClick = (e) => {
      if (!isCutModeActive.value) return;
      splitAtTime(e);
    };

    const splitAtTime = async (e) => {
      const tl = unifiedTimelineRef.value;
      if (!tl || !videoDuration.value) return;
      const rect = tl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const t = ratio * videoDuration.value;
      const idx = segments.value.findIndex(s => t > s.start && t < s.end);
      const MIN = 0.1;
      if (idx === -1) return;
      const seg = segments.value[idx];
      if ((t - seg.start) < MIN || (seg.end - t) < MIN) return;
  const left = { id: makeId(), start: seg.start, end: t, duration: Math.max(0, t - seg.start) };
  const right = { id: makeId(), start: t, end: seg.end, duration: Math.max(0, seg.end - t) };
      const newArr = [
        ...segments.value.slice(0, idx),
        left,
        right,
        ...segments.value.slice(idx + 1)
      ].map(s => ({ ...s, duration: Math.max(0, s.end - s.start) }));

      // Safe commit: clear first to avoid DOM anchor issues, then set
      try {
        isAddingSegment.value = true;
        segments.value = [];
        await nextTick();
        segments.value = newArr;
        currentEditingIndex.value = idx + 1;
        await nextTick();
      } finally {
        isAddingSegment.value = false;
      }
      // Record history after DOM settles
      pushHistory('ตัดช่วงที่ตำแหน่งคลิก');
    };

    const onCutOverlayClick = (e) => {
      if (!isCutModeActive.value) return;
      splitAtTime(e);
    };

    const onCutOverlayMove = (e) => {
      const tl = unifiedTimelineRef.value;
      if (!tl || !videoDuration.value) { cutHoverTime.value = null; return; }
      const rect = tl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const t = ratio * videoDuration.value;
      cutHoverTime.value = t;
      // Move playhead preview; seek video when not playing (throttled)
      try {
        currentTime.value = t;
        if (videoRef.value && !isVideoPlaying.value) {
          if (!hoverSeekRaf) {
            hoverSeekRaf = requestAnimationFrame(() => {
              try { videoRef.value.currentTime = cutHoverTime.value ?? t; } catch (err) { /* ignore */ }
              hoverSeekRaf = null;
            });
          }
        }
      } catch (_) { /* ignore */ }
    };

    const onCutOverlayLeave = () => {
      cutHoverTime.value = null;
    };

    // Use a scissors-like cursor via data URL (fallback to crosshair)
    const scissorCursorStyle = computed(() => ({
      cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88"/><path d="M14.47 14.48L20 20"/></svg>') 6 6, crosshair`
    }));

    // Escape key to exit cut mode
    const onKeydown = (ev) => {
      if (ev.key === 'Escape' && isCutModeActive.value) {
        isCutModeActive.value = false;
      }
    };
    onMounted(() => window.addEventListener('keydown', onKeydown));
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

    // Current segment index for navigation
    const currentSegmentForNavigation = computed(() => {
      if (!safeSegments.value.length) return -1;
      
      // Find the segment that contains current time
      const currentSegmentIndex = safeSegments.value.findIndex(segment => 
        currentTime.value >= segment.start && currentTime.value <= segment.end
      );
      
      return currentSegmentIndex;
    });

    // Check if can go to previous segment
    const canGoToPreviousSegment = computed(() => {
      if (!safeSegments.value.length) return false;
      
      const currentIndex = currentSegmentForNavigation.value;
      // Can go to previous if:
      // 1. Currently in a segment and not the first one
      // 2. Not in any segment but there are segments available
      return currentIndex > 0 || currentIndex === -1;
    });

    // Check if can go to next segment
    const canGoToNextSegment = computed(() => {
      if (!safeSegments.value.length) return false;
      
      const currentIndex = currentSegmentForNavigation.value;
      // Can go to next if:
      // 1. Currently in a segment and not the last one
      // 2. Not in any segment but there are segments available
      return (currentIndex >= 0 && currentIndex < safeSegments.value.length - 1) || 
             currentIndex === -1;
    });

  // Safe segments for rendering
    const safeSegments = computed(() => {
      if (!segments.value || !Array.isArray(segments.value)) return [];
      return segments.value.filter(segment => 
        segment && 
        typeof segment.start === 'number' && 
        typeof segment.end === 'number' &&
        typeof segment.id !== 'undefined'
      );
    });
    const showExportOptions = ref(false);
    
    // Multi-segment support - enable by default
    const segments = ref([]);
    const currentSegmentIndex = ref(0);
    const currentEditingIndex = ref(-1); // Track which segment is being edited
    const isMultiSegmentMode = ref(true); // Always on by default
    const isAddingSegment = ref(false); // Flag to prevent watcher during segment addition
    const isSegmentsExpanded = ref(true); // Control segments list collapse/expand

    // -------- Inline segment time editing (safe) --------
    const onEditInput = (id, field, value) => {
      if (!segmentEdit.value[id]) segmentEdit.value[id] = {};
      segmentEdit.value[id][field] = value;
    };

  // parseTimeStringSafe is imported from function.js

    // Quick validator for input field binding to style invalid state
  const isInvalidTime = (text) => isInvalidTimeText(text);

  // ---- Auto-push helpers are imported from function.js ----

  const commitSegmentEdit = async (id) => {
      const buf = segmentEdit.value[id];
      if (!buf) return;
      // Find segment by id
      const idx = segments.value.findIndex(s => s.id === id);
      if (idx === -1) return;
      const seg = segments.value[idx];
      // Parse values or fallback to current
      const parsedStart = buf.startText != null ? parseTimeStringSafe(buf.startText) : seg.start;
      const parsedEnd = buf.endText != null ? parseTimeStringSafe(buf.endText) : seg.end;
      const parsedDur = buf.durText != null ? parseTimeStringSafe(buf.durText) : null;
      // If parsing failed for any provided field, keep user text, mark invalid via class, and notify
      if ((buf.startText != null && parsedStart == null) ||
          (buf.endText != null && parsedEnd == null) ||
          (buf.durText != null && parsedDur == null)) {
        toast({ type: 'error', message: 'รูปแบบเวลาไม่ถูกต้อง (ใช้ mm:ss, hh:mm:ss หรือวินาที)' });
        return;
      }

      // Normalize desired start/end with precedence rules
      const vd = Number(videoDuration.value) || 0;
      const MIN = 0.1; // minimal duration and spacing
      let desiredStart = Math.max(0, Math.min(parsedStart ?? seg.start, Math.max(0, vd - MIN)));
      let desiredEnd;
      if (parsedDur != null) {
        const dur = Math.max(MIN, parsedDur);
        desiredEnd = Math.min(vd, desiredStart + dur);
        if (desiredEnd - desiredStart < MIN) desiredEnd = Math.min(vd, desiredStart + MIN);
      } else {
        desiredEnd = Math.max(desiredStart + MIN, Math.min(parsedEnd ?? seg.end, vd));
      }

      // Prepare working array
      const base = (segments.value || []).map(cloneSegment);
      const { sorted, idx: sortedIdx } = sortAndFindIndex(base, id);
      if (sortedIdx === -1) return;

      // Apply desired edit
      sorted[sortedIdx].start = desiredStart;
      sorted[sortedIdx].end = Math.max(sorted[sortedIdx].start + MIN, Math.min(desiredEnd, vd));
      sorted[sortedIdx].duration = Math.max(0, sorted[sortedIdx].end - sorted[sortedIdx].start);

      // Try auto-resolve by pushing neighbors
      let tryArr = sorted.map(cloneSegment);
  let res = autoResolveOverlaps(tryArr, sortedIdx, vd, MIN);

      // Fallbacks if pushing hits bounds
      if (!res.ok) {
        // If left bound blocks, nudge our segment right
        if (res.side === 'left') {
          const prev = tryArr[sortedIdx - 1];
          if (prev) {
            const minStart = prev.end + MIN;
            tryArr = sorted.map(cloneSegment);
            tryArr[sortedIdx].start = Math.max(tryArr[sortedIdx].start, minStart);
            tryArr[sortedIdx].end = Math.max(tryArr[sortedIdx].start + MIN, Math.min(desiredEnd, vd));
            res = autoResolveOverlaps(tryArr, sortedIdx, vd, MIN);
          }
        } else if (res.side === 'right') {
          const next = tryArr[sortedIdx + 1];
          if (next) {
            const maxEnd = next.start - MIN;
            tryArr = sorted.map(cloneSegment);
            tryArr[sortedIdx].end = Math.min(tryArr[sortedIdx].end, maxEnd);
            if (tryArr[sortedIdx].end - tryArr[sortedIdx].start < MIN) {
              tryArr[sortedIdx].start = Math.max(0, maxEnd - MIN);
              tryArr[sortedIdx].end = maxEnd;
            }
            res = autoResolveOverlaps(tryArr, sortedIdx, vd, MIN);
          }
        }
      }

      // If still not ok, clamp into current neighbor window as last resort
      if (!res.ok) {
        const others = (segments.value || []).filter(s => s && s.id !== id);
        let prevEnd = -Infinity;
        let nextStart = Infinity;
        for (const s of others) {
          if (typeof s.end === 'number' && s.end <= desiredStart && s.end > prevEnd) prevEnd = s.end;
          if (typeof s.start === 'number' && s.start >= desiredStart && s.start < nextStart) nextStart = s.start;
        }
        const windowStart = Math.max(0, isFinite(prevEnd) ? prevEnd + MIN : 0);
        const windowEnd = Math.min(vd, isFinite(nextStart) ? nextStart - MIN : vd);
        if (windowEnd - windowStart < MIN) {
          toast({ type: 'warning', message: 'พื้นที่ไม่พอสำหรับขยับช่วงนี้' });
          return;
        }
        const dur = parsedDur != null ? Math.max(MIN, Math.min(parsedDur, windowEnd - windowStart)) : Math.min(Math.max(MIN, (parsedEnd ?? seg.end) - desiredStart), windowEnd - windowStart);
        const startVal = Math.min(Math.max(desiredStart, windowStart), windowEnd - dur);
        const endVal = startVal + dur;

  isAddingSegment.value = true;
  const newArr = [...segments.value];
  const updated = { ...seg, start: startVal, end: endVal, duration: Math.max(0, endVal - startVal) };
  newArr.splice(idx, 1, updated);
  newArr.sort((a, b) => a.start - b.start);
  // Clear then set to avoid patching anchor issues
  segments.value = [];
  await nextTick();
  segments.value = newArr;
  await nextTick();
  isAddingSegment.value = false;
        toast({ type: 'warning', message: 'ชนขอบเวลาของวิดีโอ จึงปรับให้อยู่ในขอบเขตอัตโนมัติ' });
        segmentEdit.value[id] = {};
        return;
      }

      // Success: commit array
  isAddingSegment.value = true;
  const committed = tryArr.map(s => ({ ...s, duration: Math.max(0, s.end - s.start) }));
  // Clear then set to avoid patching anchor issues
  segments.value = [];
  await nextTick();
  segments.value = committed;
  await nextTick();
  isAddingSegment.value = false;

      // Clear edit buffer so inputs reflect formatted values
      segmentEdit.value[id] = {};
  // Record history
  pushHistory('แก้ไขเวลา');
    };
    
    const exportSettings = ref({
      volume: 100,
      quality: '720p',
      format: 'mp4',
      processingMode: 'fast',
      filename: '',
      trimMode: 'single' // 'single' or 'multi'
    });

    const qualityOptions = ref([
      { value: '240p', label: '240p' },
      { value: '480p', label: '480p' },
      { value: '720p', label: '720p (HD)' },
      { value: '1080p', label: '1080p (FHD)' },
      { value: 'original', label: 'ต้นฉบับ' }
    ]);

    // Watch for props changes
    watch(() => [props.file, props.fileUrl, props.isOpen], async ([newFile, newFileUrl, newIsOpen]) => {
      if (newIsOpen && newFile && newFileUrl) {
        try {
          await loadVideo(newFile, newFileUrl);
        } catch (error) {
          console.error('Error loading video:', error);
        }
      }
    }, { immediate: true });

    // Watch for segments changes to generate thumbnails (with debounce and safety)
    watch(segments, async (newSegments) => {
      try {
        // Skip if currently adding segments to prevent DOM corruption
        if (isDraggingSegment.value || isAddingSegment.value) {
          console.log('Skipping thumbnail generation - segment operation in progress');
          return;
        }
        
        // Add debounce delay to let DOM settle
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (newSegments && newSegments.length > 0 && videoRef.value && videoDuration.value) {
          isGeneratingSegmentThumbnails.value = true;
          
          // Additional safety check
          await nextTick();
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const thumbnails = await generateSegmentThumbnails(newSegments);
          segmentThumbnails.value = thumbnails;
          console.log('Generated segment thumbnails:', thumbnails.length);
        } else {
          segmentThumbnails.value = [];
        }
      } catch (error) {
        console.warn('Failed to generate segment thumbnails:', error);
      } finally {
        isGeneratingSegmentThumbnails.value = false;
      }
    }, { deep: true, flush: 'post' });

    // Watch for segments to auto-select first segment if none is selected
    watch(segments, (newSegments) => {
      if (newSegments && newSegments.length > 0 && currentEditingIndex.value === -1) {
        currentEditingIndex.value = 0;
      } else if (!newSegments || newSegments.length === 0) {
        currentEditingIndex.value = -1;
      }
    }, { immediate: true });

    // Methods
    const closeModal = () => {
      // Stop any preview playback
      stopPreview();
      // Stop audio meter and suspend context
  try { stopLiveMeter(); } catch (e) { /* ignore */ }
  try { audioCtx.value?.suspend?.(); } catch (e) { /* ignore */ }
      reset();
      emit('close');
    };

    const setVideoElement = (element) => {
      videoRef.value = element;
      if (element) {
        setPreviewElement(element);
        console.log('Setting up audio graph for video element');
        // Setup audio graph and start live meter
        setupAudioGraph(element);
        setTimeout(() => {
          console.log('Starting live meter after delay');
          startLiveMeter();
        }, 500); // Add small delay for audio context to be ready
  // Compute overlay content bounds when video element is ready
  try { updateOverlayContentStyle(); } catch (e) { /* ignore */ }
  setupOverlayObservers();
      }
    };

    const onVideoLoaded = (data) => {
      if (data && data.duration) {
        videoDuration.value = data.duration;
        endTime.value = data.duration;
        
        // Initialize video settings
        if (data.videoElement) {
          data.videoElement.volume = volume.value;
        }
        
        // Create initial full-length segment automatically
        createInitialSegment();
        
        generateThumbnails();
        // Generate waveform peaks
        if (videoFile.value) {
          computeWaveform(videoFile.value);
        }
  // Recompute visible content rect after metadata/dimensions available
  try { updateOverlayContentStyle(); } catch (e) { /* ignore */ }
  setupOverlayObservers();
      }
    };

  // ---------- Project Save / Import ----------

    const saveProject = () => {
      const snapshot = buildProjectSnapshotFn({
        video: {
          name: videoFile.value?.name || null,
          size: videoFile.value?.size || null,
          mime: videoFile.value?.type || null,
          duration: videoDuration.value || null,
          url: videoUrl.value || null
        },
        settings: {
          isMultiSegmentMode: isMultiSegmentMode.value,
          export: exportSettings.value
        },
        timeline: {
          startTime: startTime.value,
          endTime: endTime.value
        },
        segments: (segments.value || [])
      });
      const base = snapshot.video?.name?.replace(/\.[^/.]+$/, '') || 'video';
      const fname = `${base}.video-trimmer.json`;
      try {
        downloadJson(snapshot, fname);
      } catch (e) {
        console.error('Failed to download JSON:', e);
        toast({ type: 'error', message: 'ไม่สามารถบันทึกไฟล์ได้' });
      }
    };

    const triggerImport = () => {
      importInputRef.value?.click();
    };

  // validateImportedProject now provided by function.js

  const handleImportFile = async (evt) => {
      const file = evt.target.files && evt.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
  const val = validateImportedProjectFn(data);
        if (!val.ok) {
          toast({ type: 'error', message: val.reason || 'ไฟล์ไม่ถูกต้อง' });
          return;
        }

        // Optional: check video duration compatibility (tolerate small drift)
        const importedDuration = Number(data.video?.duration) || null;
        if (videoDuration.value && importedDuration && Math.abs(importedDuration - videoDuration.value) > 2) {
          // Non-blocking notice; continue import
          toast({ type: 'warning', message: 'ความยาววิดีโอไม่ตรงกับโปรเจกต์ที่นำเข้า อาจมีตำแหน่งคลาดเคลื่อน' });
        }

        // Normalize segments to be within current videoDuration
        const vd = videoDuration.value || importedDuration || Infinity;
  const importedSegments = normalizeImportedSegments(data.segments, vd);

        // Apply segments using safe clearing strategy to avoid DOM patching issues
        isAddingSegment.value = true;
        const newSegments = [...importedSegments];

  // Clear first and wait a tick
  segments.value = [];
  await nextTick();
        await new Promise(r => setTimeout(r, 50));

  // Set imported segments
  segments.value = newSegments;
  await nextTick();

        // Update timeline and state
        startTime.value = data.timeline?.startTime ?? (newSegments[0]?.start || 0);
        endTime.value = data.timeline?.endTime ?? (newSegments[0]?.end || (videoDuration.value || 0));
        currentEditingIndex.value = newSegments.length ? 0 : -1;
        isMultiSegmentMode.value = !!(data.settings?.isMultiSegmentMode ?? true);
        if (data.settings?.export) {
          exportSettings.value = { ...exportSettings.value, ...data.settings.export };
        }

  toast({ type: 'success', message: 'นำเข้าโปรเจกต์สำเร็จ' });
        pushHistory('นำเข้าโปรเจกต์');
      } catch (e) {
        console.error('Import failed:', e);
  toast({ type: 'error', message: 'ไม่สามารถนำเข้าไฟล์ได้' });
      } finally {
        isAddingSegment.value = false;
        // reset input so same file can be selected again
        if (evt?.target) evt.target.value = '';
      }
    };

    const onTimeUpdate = (data) => {
      if (data) {
        currentTime.value = data.currentTime;
        // Add debug to see if this is overriding our manual setting
        if (isVideoPlaying.value !== data.isPlaying) {
          console.log('onTimeUpdate changing isVideoPlaying from', isVideoPlaying.value, 'to', data.isPlaying);
          console.log('Video element paused state:', videoRef.value?.paused);
        }
        isVideoPlaying.value = data.isPlaying;
        // Auto-jump across segments during multi-segment preview playback
        if (isMultiSegmentMode.value && isPreviewPlaying.value && data.isPlaying) {
          handleMultiSegmentPreview();
        }
      }
    };

    // Keyboard shortcuts for Undo/Redo
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

    // Redraw waveform on resize
    let resizeTimer = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    drawWaveform();
    try { updateOverlayContentStyle(); } catch (e) { /* ignore */ }
    // Keep inline text editor panel attached during responsive changes
    try { if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition); } catch (e) { /* ignore */ }
  }, 150);
    };
    onMounted(() => {
      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', onKeyDown);
      try { updateOverlayContentStyle(); } catch (e) { /* ignore */ }
  setupOverlayObservers();
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
  try { overlayResizeObs?.disconnect?.(); } catch (e) { /* ignore */ }
    });

    // Handler methods for VideoCustomControls events
    const handleSeekFromProgressBar = (time) => {
      // Stop preview mode when manually seeking
      if (isPreviewPlaying.value) {
        isPreviewPlaying.value = false;
      }
      seekToTime(time);
    };

    const handleStartProgressDrag = () => {
      // Stop preview mode when manually seeking
      if (isPreviewPlaying.value) {
        isPreviewPlaying.value = false;
      }
    };

    const handleStartSegmentDrag = ({ segmentId, dragType, event }) => {
      startSegmentDrag(segmentId, dragType, event);
    };

    const handleStartUnifiedSegmentDrag = ({ event, segmentIndex, dragType }) => {
      startUnifiedSegmentDrag(event, segmentIndex, dragType);
    };
    
    // Create initial segment that spans the entire video
    const createInitialSegment = async () => {
      if (!videoDuration.value || segments.value.length > 0) return;
      
      try {
        isAddingSegment.value = true;
        
        const initialSegment = {
          id: `segment_${Date.now()}_initial`,
          start: 0,
          end: videoDuration.value,
          duration: videoDuration.value,
          thumbnails: []
        };
        
        console.log('Creating initial segment:', initialSegment);
        
  // Clear then set to avoid patching anchor issues
  segments.value = [];
  await nextTick();
  segments.value = [initialSegment];
        
        // Set the first segment as active/current editing
        currentEditingIndex.value = 0;
        
        await nextTick();
        
        console.log('Initial segment created successfully');
        
      } catch (error) {
        console.error('Error creating initial segment:', error);
      } finally {
        isAddingSegment.value = false;
      }
    };

    const generateThumbnails = async () => {
      if (!videoRef.value || !videoDuration.value) return;
      
      // Start generating thumbnails
      isGeneratingThumbnails.value = true;
      thumbnailProgress.value = 0;
      thumbnails.value = [];
      
      const video = videoRef.value;
      
      // Set crossOrigin before any operations
      if (!video.crossOrigin) {
        video.crossOrigin = 'anonymous';
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match timeline aspect ratio
      canvas.width = 120;
      canvas.height = 64;
      
      const thumbnailCount = 10; // Number of thumbnails to generate
      const interval = videoDuration.value / thumbnailCount;
      const newThumbnails = [];
      
      for (let i = 0; i < thumbnailCount; i++) {
        try {
          const time = i * interval;
          
          // Create a promise to handle video seeking
          await new Promise((resolve, reject) => {
            const handleSeeked = () => {
              video.removeEventListener('seeked', handleSeeked);
              video.removeEventListener('error', handleError);
              
              try {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to data URL with error handling
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                newThumbnails.push({
                  time,
                  dataUrl
                });
                
                // Update progress
                thumbnailProgress.value = newThumbnails.length;
                
                resolve();
              } catch (error) {
                console.warn('Canvas export error, using placeholder:', error);
                // Use a placeholder color instead
                ctx.fillStyle = `hsl(${(i * 36) % 360}, 50%, 70%)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(formatTime(time), canvas.width/2, canvas.height/2);
                
                newThumbnails.push({
                  time,
                  dataUrl: canvas.toDataURL('image/jpeg', 0.8)
                });
                
                // Update progress
                thumbnailProgress.value = newThumbnails.length;
                
                resolve();
              }
            };
            
            const handleError = () => {
              video.removeEventListener('seeked', handleSeeked);
              video.removeEventListener('error', handleError);
              reject(new Error('Video seek error'));
            };
            
            video.addEventListener('seeked', handleSeeked);
            video.addEventListener('error', handleError);
            video.currentTime = time;
          });
          
          // Small delay to ensure proper frame capture
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Add placeholder thumbnail
          ctx.fillStyle = `hsl(${(i * 36) % 360}, 30%, 80%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#666';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(formatTime(i * interval), canvas.width/2, canvas.height/2);
          
          newThumbnails.push({
            time: i * interval,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8)
          });
          
          // Update progress even for placeholder thumbnails
          thumbnailProgress.value = newThumbnails.length;
        }
      }
      
      thumbnails.value = newThumbnails;
      
      // Finished generating thumbnails
      isGeneratingThumbnails.value = false;
      
      // Reset video to start
      try {
        video.currentTime = 0;
      } catch (error) {
        console.warn('Could not reset video time:', error);
      }
    };

    // Generate thumbnails for specific segments with multiple frames per segment
    const generateSegmentThumbnails = async (segments) => {
      if (!videoDuration.value || segments.length === 0) return [];
      
      console.log('Generating segment thumbnails from existing timeline thumbnails for', segments.length, 'segments');
      
      // Wait for timeline thumbnails to be generated if they don't exist
      if (!thumbnails.value || thumbnails.value.length === 0) {
        console.log('Timeline thumbnails not available, generating them first...');
        await generateThumbnails();
      }
      
      if (!thumbnails.value || thumbnails.value.length === 0) {
        console.warn('Could not generate timeline thumbnails');
        return [];
      }
      
      const segmentThumbnails = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        try {
          const segmentDuration = segment.end - segment.start;
          
          // Find thumbnails that fall within this segment's time range
          const segmentTimelineThumbnails = thumbnails.value.filter(thumb => 
            thumb.time >= segment.start && thumb.time <= segment.end
          );
          
          // If no thumbnails found in segment range, find closest ones
          if (segmentTimelineThumbnails.length === 0) {
            // Find closest thumbnail to segment start
            const closestThumbnail = thumbnails.value.reduce((closest, thumb) => {
              const currentDistance = Math.abs(thumb.time - segment.start);
              const closestDistance = Math.abs(closest.time - segment.start);
              return currentDistance < closestDistance ? thumb : closest;
            });
            
            if (closestThumbnail) {
              segmentTimelineThumbnails.push(closestThumbnail);
            }
          }
          
          // Generate multiple frames per segment based on available thumbnails and duration
          const frameCount = Math.min(4, Math.max(1, segmentTimelineThumbnails.length));
          const segmentFrames = [];
          
          for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            let thumbnailToUse;
            
            if (segmentTimelineThumbnails.length > frameIndex) {
              // Use available thumbnail
              thumbnailToUse = segmentTimelineThumbnails[frameIndex];
            } else {
              // Use the last available thumbnail
              thumbnailToUse = segmentTimelineThumbnails[segmentTimelineThumbnails.length - 1];
            }
            
            if (thumbnailToUse) {
              segmentFrames.push({
                frameIndex,
                time: thumbnailToUse.time,
                url: thumbnailToUse.dataUrl
              });
            }
          }
          
          // If we still don't have frames, create multiple copies of the closest thumbnail
          if (segmentFrames.length === 0 && segmentTimelineThumbnails.length > 0) {
            const baseThumbnail = segmentTimelineThumbnails[0];
            const desiredFrames = Math.min(4, Math.max(1, Math.floor(segmentDuration / 2)));
            
            for (let frameIndex = 0; frameIndex < desiredFrames; frameIndex++) {
              const timeOffset = frameIndex / (desiredFrames - 1 || 1);
              const frameTime = segment.start + (segmentDuration * timeOffset);
              
              segmentFrames.push({
                frameIndex,
                time: frameTime,
                url: baseThumbnail.dataUrl
              });
            }
          }
          
          segmentThumbnails.push({
            segmentId: segment.id,
            segmentIndex: i,
            segment: segment,
            frames: segmentFrames,
            // Use first frame as primary thumbnail
            url: segmentFrames[0]?.url,
            time: segmentFrames[0]?.time || getSegmentMiddleTime(segment)
          });
          
          console.log(`Generated ${segmentFrames.length} frames for segment ${i} using timeline thumbnails`);
          
        } catch (error) {
          console.warn(`Failed to generate thumbnails for segment ${i}:`, error);
          
          // Fallback: use a placeholder
          segmentThumbnails.push({
            segmentId: segment.id,
            segmentIndex: i,
            segment: segment,
            frames: [{
              frameIndex: 0,
              time: getSegmentMiddleTime(segment),
              url: '' // Empty URL will show placeholder in CSS
            }],
            url: '',
            time: getSegmentMiddleTime(segment),
            isPlaceholder: true
          });
        }
      }
      
      console.log(`Generated thumbnails for ${segmentThumbnails.length} segments using existing timeline thumbnails`);
      return segmentThumbnails;
    };
    
    // Helper function to generate thumbnail at specific time
    
    // Handle multi-segment preview playback
    const handleMultiSegmentPreview = () => {
      const currentTimeVal = currentTime.value;
      
      // Find which segment we should be in
      const currentSegment = segments.value.find(segment => 
        currentTimeVal >= segment.start && currentTimeVal <= segment.end
      );
      
      if (currentSegment) {
        // We're in a valid segment, check if we've reached the end
        if (currentTimeVal >= currentSegment.end) {
          // Immediately jump to next segment without delay
          jumpToNextSegment(currentSegment);
        }
      } else {
        // We're not in any segment, jump to the next one immediately
        jumpToNextSegment();
      }
    };

    // Jump to the next segment in sequence - optimized for instant jumping
    const jumpToNextSegment = (currentSegment = null) => {
      if (!videoRef.value) return;
      
      // Sort segments by start time
      const sortedSegments = [...segments.value].sort((a, b) => a.start - b.start);
      
      let targetTime = null;
      
      if (currentSegment) {
        // Find next segment after current one
        const currentIndex = sortedSegments.findIndex(seg => seg.id === currentSegment.id);
        if (currentIndex >= 0 && currentIndex < sortedSegments.length - 1) {
          // Jump to next segment
          const nextSegment = sortedSegments[currentIndex + 1];
          targetTime = nextSegment.start;
          console.log(`Jumping from segment ${currentIndex + 1} to segment ${currentIndex + 2}`);
        } else {
          // We're at the last segment, loop back to first
          const firstSegment = sortedSegments[0];
          targetTime = firstSegment.start;
          console.log('Looping back to first segment');
        }
      } else {
        // Not in any segment, find the first segment that starts after current time
        const nextSegment = sortedSegments.find(seg => seg.start > currentTime.value) || sortedSegments[0];
        targetTime = nextSegment.start;
        console.log(`Jumping to segment starting at ${nextSegment.start}s`);
      }
      
      // Instant seek without waiting for events
      if (targetTime !== null) {
        videoRef.value.currentTime = targetTime;
        currentTime.value = targetTime;
      }
    };    // Custom video control methods
    const togglePlayPause = async () => {
      console.log('togglePlayPause called, current paused state:', videoRef.value?.paused);
      if (videoRef.value) {
        try {
          if (videoRef.value.paused) {
            if (isMultiSegmentMode.value && segments.value.length > 0) {
              // Multi-segment mode: check if current time is in any segment
              const currentTimeVal = currentTime.value;
              const isInAnySegment = segments.value.some(segment => 
                currentTimeVal >= segment.start && currentTimeVal <= segment.end
              );
              
              if (!isInAnySegment) {
                // If not in any segment, jump to first segment
                const sortedSegments = [...segments.value].sort((a, b) => a.start - b.start);
                videoRef.value.currentTime = sortedSegments[0].start;
              }
            } else {
              // Single segment mode: original behavior
              if (currentTime.value < startTime.value || currentTime.value >= endTime.value) {
                videoRef.value.currentTime = startTime.value;
              }
            }
            
            try { 
              await audioCtx.value?.resume?.(); 
              console.log('Audio context resumed, state:', audioCtx.value?.state);
              // Ensure live meter is running after resume
              if (audioCtx.value?.state === 'running' && !meterRaf) {
                startLiveMeter();
              }
            } catch (e) { 
              console.warn('Failed to resume audio context:', e); 
            }
            
            await videoRef.value.play();
            console.log('Video started playing');
            
            // Set preview mode if playing
            isPreviewPlaying.value = true;
          } else {
            videoRef.value.pause();
            console.log('Video paused');
            isPreviewPlaying.value = false;
          }
        } catch (error) {
          console.error('Error toggling play/pause:', error);
        }
      }
    };

    const toggleMute = () => {
      if (!videoRef.value) return;
      // Toggle between 0% and 100%
      if (isMuted.value || volume.value === 0) {
        volume.value = 1;
        videoRef.value.volume = 1;
        isMuted.value = false;
      } else {
        volume.value = 0;
        videoRef.value.volume = 0;
        isMuted.value = true;
      }
    };

    const updateVolume = (event) => {
      const newVolume = parseFloat(event.target.value);
      volume.value = newVolume;
      if (videoRef.value) {
        videoRef.value.volume = newVolume;
      }
      isMuted.value = newVolume === 0;
    };

    const toggleFullscreen = () => {
      if (videoRef.value) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          videoRef.value.requestFullscreen();
        }
      }
    };

    const jumpToStart = () => {
      seekToTime(0);
      startTime.value = 0;
    };

    const jumpToEnd = () => {
      seekToTime(videoDuration.value);
      endTime.value = videoDuration.value;
    };

    const adjustStartTime = (seconds) => {
      const newTime = Math.max(0, Math.min(startTime.value + seconds, endTime.value - 0.1));
      startTime.value = newTime;
      seekToTime(newTime);
    };

    const adjustEndTime = (seconds) => {
      const newTime = Math.max(startTime.value + 0.1, Math.min(endTime.value + seconds, videoDuration.value));
      endTime.value = newTime;
      seekToTime(newTime);
    };

    const updateStartTimeFromInput = (event) => {
      const timeStr = event.target.value.trim();
  const seconds = parseTimeStringSafe(timeStr);
      if (seconds !== null && seconds >= 0 && seconds < endTime.value) {
        startTime.value = seconds;
        seekToTime(seconds);
      } else {
        // Reset input to current value if invalid
        event.target.value = formatTime(startTime.value);
      }
    };

    const updateEndTimeFromInput = (event) => {
      const timeStr = event.target.value.trim();
  const seconds = parseTimeStringSafe(timeStr);
      if (seconds !== null && seconds > startTime.value && seconds <= videoDuration.value) {
        endTime.value = seconds;
        seekToTime(seconds);
      } else {
        // Reset input to current value if invalid
        event.target.value = formatTime(endTime.value);
      }
    };


    const playFromStart = () => {
      if (videoRef.value) {
        if (isMultiSegmentMode.value && segments.value.length > 0) {
          // Multi-segment mode: start from first segment
          const sortedSegments = [...segments.value].sort((a, b) => a.start - b.start);
          const firstSegment = sortedSegments[0];
          videoRef.value.currentTime = firstSegment.start;
          console.log(`Starting multi-segment preview from ${firstSegment.start}s`);
        } else {
          // Single segment mode: start from startTime
          videoRef.value.currentTime = startTime.value;
        }
        
        videoRef.value.play();
        isPreviewPlaying.value = true;
        isVideoPlaying.value = true;
      }
    };

    const stopPreview = () => {
      if (videoRef.value) {
        videoRef.value.pause();
        isPreviewPlaying.value = false;
        isVideoPlaying.value = false;
      }
    };

    // Overlay layers helpers
    const computeDefaultOverlayRange = (kind) => {
      // keep param for future per-type rules
      void kind;
      const vd = Number(videoDuration.value) || 0;
      // Start after the last overlay of the SAME kind (original behavior)
      const list = kind === 'image' ? (imageLayers.value || []) : (textLayers.value || []);
      let start = list.length > 0
        ? Math.max(0, Math.min(vd, Math.max(...list.map(l => Number(l?.end) || 0))))
        : Math.max(0, Math.min(vd, Number(currentTime.value) || 0));

      // Determine end: default to video end; if in multi-segment mode, cap to segment end (or next segment window)
      let end = vd;
      const segs = Array.isArray(safeSegments.value) ? safeSegments.value : [];
      if (isMultiSegmentMode.value && segs.length > 0) {
        let segIdx = segs.findIndex(s => start >= s.start && start < s.end);
        if (segIdx !== -1) {
          end = Math.min(vd, segs[segIdx].end);
        } else {
          // If start falls between segments, snap to the next segment window
          const nextSeg = segs.find(s => s.start >= start);
          if (nextSeg) {
            start = Math.max(start, nextSeg.start);
            end = Math.min(vd, nextSeg.end);
          }
        }
      }

      const MIN = 0.1;
      if (end - start < MIN) {
        // Clamp to minimal duration at the tail if needed
        if (start >= vd - MIN) {
          start = Math.max(0, vd - MIN);
          end = vd;
        } else {
          end = Math.min(vd, start + MIN);
        }
      }
      return { start, end };
    };
  // No unified timeline handlers needed in separate mode
    const addTextLayer = () => {
      const { start, end } = computeDefaultOverlayRange('text');
      const id = 'L' + Math.random().toString(36).slice(2, 9);
      textLayers.value.push({
        id, type: 'text', text: 'Your text',
        start, end,
        x: 10, y: 10, width: 30, height: 15,
        fontSize: 24, color: '#FFFFFF', fontFamily: 'sans-serif', fontWeight: 'bold',
        backgroundColor: 'transparent',
        rotation: 0, opacity: 1, zIndex: 20
      });
    };
    const promptAddImageLayer = () => {
      const url = window.prompt('Image URL');
      if (!url) return;
  const { start, end } = computeDefaultOverlayRange('image');
      const id = 'L' + Math.random().toString(36).slice(2, 9);
      imageLayers.value.push({
        id, type: 'image', src: url,
        start, end,
        x: 60, y: 10, width: 25, height: 25,
        rotation: 0, opacity: 1, zIndex: 15, shadow: true
      });
    };
    const updateTextLayerTime = ({ index, start, end }) => {
      if (!textLayers.value[index]) return;
      textLayers.value[index] = { ...textLayers.value[index], start, end };
    };
    const updateImageLayerTime = ({ index, start, end }) => {
      if (!imageLayers.value[index]) return;
      imageLayers.value[index] = { ...imageLayers.value[index], start, end };
    };
    const removeTextLayer = (id) => {
      textLayers.value = textLayers.value.filter(l => l.id !== id);
    };
    const removeImageLayer = (id) => {
      imageLayers.value = imageLayers.value.filter(l => l.id !== id);
    };

    // Drag to move overlays in preview
    const startOverlayPreviewDrag = (e, kind, id, mode = 'move') => {
      if (e && typeof e.button === 'number' && e.button !== 0) return;
      const box = overlayContentRef.value?.getBoundingClientRect();
      if (!box) return;
      const list = kind === 'text' ? textLayers.value : imageLayers.value;
      const target = list.find(l => l.id === id);
      if (!target) return;
      overlayDragging.value = {
        kind, id, mode,
        startX: e.clientX,
        startY: e.clientY,
        startPctX: target.x || 0,
        startPctY: target.y || 0,
        startW: target.width || 20,
        startH: target.height || 10,
        boxW: box.width,
        boxH: box.height
      };
      // Begin continuous follow if we're dragging the currently being edited element
      if ((kind === 'text' && isTextEditorOpen.value && editorTargetId.value === id) ||
          (kind === 'image' && isImageEditorOpen.value && editorTargetId.value === id)) {
        startEditorFollow();
      }
      window.addEventListener('mousemove', onOverlayPreviewMove);
      window.addEventListener('mouseup', onOverlayPreviewUp, { once: true });
    };
    const onOverlayPreviewMove = (e) => {
      const d = overlayDragging.value;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      // Use precise inner-box size for percentage conversion
      const pctX = d.startPctX + (dx / d.boxW) * 100;
      const pctY = d.startPctY + (dy / d.boxH) * 100;
      const list = d.kind === 'text' ? textLayers.value : imageLayers.value;
      const idx = list.findIndex(l => l.id === d.id);
      if (idx === -1) return;
      const layer = list[idx];
      if (d.mode === 'move') {
  const maxX = 100 - (layer.width || 0);
  const maxY = 100 - (layer.height || 0);
  const newX = Math.min(maxX, Math.max(0, pctX));
  const newY = Math.min(maxY, Math.max(0, pctY));
        list[idx] = { ...layer, x: newX, y: newY };
      } else if (d.mode?.startsWith('resize')) {
        let newX = layer.x || 0;
        let newY = layer.y || 0;
        let newW = d.startW;
        let newH = d.startH;
        const minW = 5;
        const minH = 5;
        const handle = d.mode.split(':')[1] || 'br';
        if (handle === 'br') {
          newW = d.startW + (dx / d.boxW) * 100;
          newH = d.startH + (dy / d.boxH) * 100;
        } else if (handle === 'tr') {
          newW = d.startW + (dx / d.boxW) * 100;
          newH = d.startH - (dy / d.boxH) * 100;
          newY = d.startPctY - (newH - d.startH);
        } else if (handle === 'bl') {
          newW = d.startW - (dx / d.boxW) * 100;
          newH = d.startH + (dy / d.boxH) * 100;
          newX = d.startPctX - (newW - d.startW);
        } else if (handle === 'tl') {
          newW = d.startW - (dx / d.boxW) * 100;
          newH = d.startH - (dy / d.boxH) * 100;
          newX = d.startPctX - (newW - d.startW);
          newY = d.startPctY - (newH - d.startH);
        }
  // Clamp size to [min, 100]
  newW = Math.max(minW, Math.min(100, newW));
  newH = Math.max(minH, Math.min(100, newH));
  // Clamp position so the box stays fully within inner bounds
  newX = Math.max(0, Math.min(newX, 100 - newW));
  newY = Math.max(0, Math.min(newY, 100 - newH));
        list[idx] = { ...layer, x: newX, y: newY, width: newW, height: newH };
      }
      // Recompute editor panel position if editing this layer
      if ((isTextEditorOpen.value && editorTargetId.value === d.id && d.kind === 'text') ||
          (isImageEditorOpen.value && editorTargetId.value === d.id && d.kind === 'image')) {
        requestAnimationFrame(updateEditorPanelPosition);
      }
    };
    const selectOverlay = (kind, id) => {
      selectedOverlay.value = { kind, id };
    };
    const isOverlaySelected = (kind, id) => selectedOverlay.value.kind === kind && selectedOverlay.value.id === id;
    const clearOverlaySelection = () => {
      selectedOverlay.value = { kind: null, id: null };
    };
    // Inline text editor open/close
    const openTextEditor = (id) => {
      const idx = textLayers.value.findIndex(l => l.id === id);
      if (idx === -1) return;
      const l = textLayers.value[idx];
      editorTargetId.value = id;
      textEditor.value = {
        text: l.text || '',
        color: l.color || '#FFFFFF',
        fontSize: l.fontSize || 24,
        bold: (l.fontWeight || 'bold') === 'bold',
        italic: (l.fontStyle || 'normal') === 'italic',
        align: l.textAlign || 'center',
        shadow: l.textShadow === false ? false : true,
        bgColor: l.backgroundColor || '#000000',
        opacity: l.opacity != null ? Math.round(l.opacity * 100) : 100
      };
      isTextEditorOpen.value = true;
      selectedOverlay.value = { kind: 'text', id };
      
      // Position the panel after DOM updates
      nextTick(() => {
        requestAnimationFrame(() => {
          updateEditorPanelPosition();
        });
      });
    };
    const closeTextEditor = () => { isTextEditorOpen.value = false; };
    const applyTextEdit = (key, val) => {
      const idx = textLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...textLayers.value[idx] };
      if (key === 'text') cur.text = String(val ?? '');
      else if (key === 'color') cur.color = String(val || '#FFFFFF');
      else if (key === 'fontSize') cur.fontSize = Math.max(8, Math.min(200, Number(val) || 24));
      else if (key === 'bgColor') cur.backgroundColor = String(val || '#000000');
      else if (key === 'opacity') cur.opacity = Math.max(0, Math.min(100, Number(val) || 100)) / 100;
      textLayers.value[idx] = cur;
  // Text changes can affect layout; keep panel attached
  if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    const toggleTextStyle = (which) => {
      const idx = textLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...textLayers.value[idx] };
      if (which === 'bold') {
        textEditor.value.bold = !textEditor.value.bold;
        cur.fontWeight = textEditor.value.bold ? 'bold' : 'normal';
      } else if (which === 'italic') {
        textEditor.value.italic = !textEditor.value.italic;
        cur.fontStyle = textEditor.value.italic ? 'italic' : 'normal';
      }
      textLayers.value[idx] = cur;
  if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    const setAlign = (pos) => {
      textEditor.value.align = pos;
      const idx = textLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...textLayers.value[idx], textAlign: pos };
      textLayers.value[idx] = cur;
  if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    const toggleShadow = () => {
      textEditor.value.shadow = !textEditor.value.shadow;
      const idx = textLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...textLayers.value[idx] };
      cur.textShadow = textEditor.value.shadow ? (cur.textShadow || '0 2px 4px rgba(0,0,0,.6)') : 'none';
      textLayers.value[idx] = cur;
  if (isTextEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    // Close on Escape
    const onTextEditorKeydown = (ev) => { if (ev.key === 'Escape' && isTextEditorOpen.value) closeTextEditor(); };
    onMounted(() => window.addEventListener('keydown', onTextEditorKeydown));
    onBeforeUnmount(() => window.removeEventListener('keydown', onTextEditorKeydown));

    // Image Editor Functions
    const openImageEditor = (id) => {
      const idx = imageLayers.value.findIndex(l => l.id === id);
      if (idx === -1) return;
      const l = imageLayers.value[idx];
      editorTargetId.value = id;
      imageEditor.value = {
        src: l.src || '',
        shadow: l.shadow !== false,
        opacity: l.opacity != null ? Math.round(l.opacity * 100) : 100
      };
      isImageEditorOpen.value = true;
      selectedOverlay.value = { kind: 'image', id };
      
      // Position the panel after DOM updates
      nextTick(() => {
        requestAnimationFrame(() => {
          updateEditorPanelPosition();
        });
      });
    };
    const closeImageEditor = () => { isImageEditorOpen.value = false; };
    const applyImageEdit = (key, val) => {
      const idx = imageLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...imageLayers.value[idx] };
      if (key === 'src') cur.src = String(val || '');
      else if (key === 'opacity') cur.opacity = Math.max(0, Math.min(100, Number(val) || 100)) / 100;
      imageLayers.value[idx] = cur;
      // Image changes can affect layout; keep panel attached
      if (isImageEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    const toggleImageShadow = () => {
      imageEditor.value.shadow = !imageEditor.value.shadow;
      const idx = imageLayers.value.findIndex(l => l.id === editorTargetId.value);
      if (idx === -1) return;
      const cur = { ...imageLayers.value[idx] };
      cur.shadow = imageEditor.value.shadow;
      imageLayers.value[idx] = cur;
      if (isImageEditorOpen.value) requestAnimationFrame(updateEditorPanelPosition);
    };
    // Close image editor on Escape
    const onImageEditorKeydown = (ev) => { if (ev.key === 'Escape' && isImageEditorOpen.value) closeImageEditor(); };
    onMounted(() => window.addEventListener('keydown', onImageEditorKeydown));
    onBeforeUnmount(() => window.removeEventListener('keydown', onImageEditorKeydown));
    const onOverlayPreviewUp = () => {
      overlayDragging.value = null;
      window.removeEventListener('mousemove', onOverlayPreviewMove);
  // Stop follow loop when drag ends
  stopEditorFollow();
    };
    const updateEditorPanelPosition = () => {
      // Check if either editor is open
      if ((!isTextEditorOpen.value && !isImageEditorOpen.value) || !editorTargetId.value) return;
      
      try {
        let targetElement, layer;
        
        if (isTextEditorOpen.value) {
          layer = (textLayers.value || []).find(l => l.id === editorTargetId.value);
          targetElement = document.querySelector(`[data-text-layer="${editorTargetId.value}"]`);
        } else if (isImageEditorOpen.value) {
          layer = (imageLayers.value || []).find(l => l.id === editorTargetId.value);
          targetElement = document.querySelector(`[data-image-layer="${editorTargetId.value}"]`);
        }
        
        if (!layer || !targetElement) return;
        
        // Get the element's position relative to viewport
        const targetRect = targetElement.getBoundingClientRect();
        
        // Get overlay container to constrain within it
        const overlayContainer = overlayContentRef.value;
        if (!overlayContainer) return;
        
        const containerRect = overlayContainer.getBoundingClientRect();
        
        // Calculate panel dimensions
        const panelWidth = 300;
        const panelHeight = 180;
        
        // Convert target position to container-relative coordinates
        const targetX = targetRect.left - containerRect.left;
        const targetY = targetRect.top - containerRect.top;
        const targetWidth = targetRect.width;
        const targetHeight = targetRect.height;
        
        let panelX, panelY;
        
        // Try to place panel to the right of target first
        if (targetX + targetWidth + 20 + panelWidth <= containerRect.width) {
          // Place to the right
          panelX = targetX + targetWidth + 20;
          panelY = targetY;
        } else if (targetX - panelWidth - 20 >= 0) {
          // Place to the left
          panelX = targetX - panelWidth - 20;
          panelY = targetY;
        } else if (targetY + targetHeight + 20 + panelHeight <= containerRect.height) {
          // Place below with larger gap
          panelX = Math.max(10, targetX + (targetWidth / 2) - (panelWidth / 2));
          panelY = targetY + targetHeight + 30; // 30px gap to ensure separation
        } else {
          // Place above with larger gap
          panelX = Math.max(10, targetX + (targetWidth / 2) - (panelWidth / 2));
          panelY = Math.max(10, targetY - panelHeight - 30); // 30px gap above
        }
        
        // Final boundary checks
        panelX = Math.max(10, Math.min(panelX, containerRect.width - panelWidth - 10));
        panelY = Math.max(10, Math.min(panelY, containerRect.height - panelHeight - 10));
        
        editorPanelStyle.value = {
          position: 'absolute',
          left: Math.round(panelX) + 'px',
          top: Math.round(panelY) + 'px',
          zIndex: 70
        };
        
      } catch (e) { 
        console.error('Panel positioning error:', e);
      }
    };

    // Navigate to previous segment
    const goToPreviousSegment = () => {
      if (!safeSegments.value.length) return;
      
      const sortedSegments = [...safeSegments.value].sort((a, b) => a.start - b.start);
      const currentIndex = currentSegmentForNavigation.value;
      
      if (currentIndex > 0) {
        // Go to previous segment if we're in a segment
        const prevSegment = sortedSegments[currentIndex - 1];
        seekToTime(prevSegment.start);
        console.log(`Navigated to previous segment ${currentIndex}: ${formatTime(prevSegment.start)}`);
      } else if (currentIndex === -1) {
        // If not in any segment, find the nearest previous segment
        const nearestPrevSegment = sortedSegments
          .filter(segment => segment.end < currentTime.value)
          .sort((a, b) => b.end - a.end)[0];
          
        if (nearestPrevSegment) {
          seekToTime(nearestPrevSegment.start);
          console.log(`Navigated to nearest previous segment: ${formatTime(nearestPrevSegment.start)}`);
        } else {
          // Go to last segment if no previous segments
          const lastSegment = sortedSegments[sortedSegments.length - 1];
          seekToTime(lastSegment.start);
          console.log(`Navigated to last segment: ${formatTime(lastSegment.start)}`);
        }
      }
    };

    // Navigate to next segment
    const goToNextSegment = () => {
      if (!safeSegments.value.length) return;
      
      const sortedSegments = [...safeSegments.value].sort((a, b) => a.start - b.start);
      const currentIndex = currentSegmentForNavigation.value;
      
      if (currentIndex >= 0 && currentIndex < sortedSegments.length - 1) {
        // Go to next segment if we're in a segment and there's a next one
        const nextSegment = sortedSegments[currentIndex + 1];
        seekToTime(nextSegment.start);
        console.log(`Navigated to next segment ${currentIndex + 2}: ${formatTime(nextSegment.start)}`);
      } else if (currentIndex === -1) {
        // If not in any segment, find the nearest next segment
        const nearestNextSegment = sortedSegments
          .filter(segment => segment.start > currentTime.value)
          .sort((a, b) => a.start - b.start)[0];
          
        if (nearestNextSegment) {
          seekToTime(nearestNextSegment.start);
          console.log(`Navigated to nearest next segment: ${formatTime(nearestNextSegment.start)}`);
        } else {
          // Go to first segment if no next segments
          const firstSegment = sortedSegments[0];
          seekToTime(firstSegment.start);
          console.log(`Navigated to first segment: ${formatTime(firstSegment.start)}`);
        }
      }
    };

    const startTrimming = async () => {
      // Show export options popup instead of direct processing
      showExportOptions.value = true;
      
      // Set default filename from video file
      if (videoFile.value?.name) {
        exportSettings.value.filename = videoFile.value.name.replace(/\.[^/.]+$/, "") + "_trimmed";
      }
    };

    const cancelExport = () => {
      showExportOptions.value = false;
    };

    const resetExportSettings = () => {
      exportSettings.value = {
        volume: 100,
        quality: '720p',
        format: 'mp4',
        processingMode: 'fast',
        trimMode: 'single',
        filename: videoFile.value?.name?.replace(/\.[^/.]+$/, "") + "_trimmed" || 'trimmed_video'
      };
    };

    // Segment dragging functionality
    const isDraggingSegment = ref(false);
    const dragSegmentData = ref({ segmentId: null, type: null, startX: 0, originalSegment: null });
    
    // Original segment drag for main timeline
    const startSegmentDrag = (segmentId, dragType, event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const segment = segments.value.find(s => s.id === segmentId);
      if (!segment) return;
      
      isDraggingSegment.value = true;
      dragSegmentData.value = {
        segmentId,
        type: dragType, // 'start', 'end', or 'move'
        startX: event.clientX,
        originalSegment: { ...segment }
      };
      
      document.addEventListener('mousemove', handleSegmentDrag);
      document.addEventListener('mouseup', stopSegmentDrag);
    };
    
    // Performance optimizations for smooth dragging
    let animationFrameId = null;
    let cachedTimelineRect = null;
    let lastDragUpdate = 0;
    
    // New segment drag for unified timeline with performance optimizations
    const startUnifiedSegmentDrag = (event, segmentIndex, dragType) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (segmentIndex < 0 || segmentIndex >= segments.value.length) return;
      
      const segment = segments.value[segmentIndex];
      if (!segment) return;
      
      // ลบ event listeners เก่าก่อน (ถ้ามี) เพื่อป้องกันการซ้ำ
      document.removeEventListener('mousemove', handleUnifiedSegmentDrag);
      document.removeEventListener('mouseup', stopUnifiedSegmentDrag);
      
      // Cache timeline rect เพื่อไม่ต้องคำนวณใหม่ทุกครั้ง
      if (unifiedTimelineRef.value) {
        cachedTimelineRect = unifiedTimelineRef.value.getBoundingClientRect();
      }
      
      console.log('Starting drag for segment:', segment);
      
      isDraggingSegment.value = true;
      dragSegmentData.value = {
        segmentIndex,
        type: dragType, // 'start', 'end', or 'move'
        startX: event.clientX,
        originalSegment: { ...segment }
      };
      
      // เพิ่ม event listeners ใหม่
      document.addEventListener('mousemove', handleUnifiedSegmentDrag, { passive: false });
      document.addEventListener('mouseup', stopUnifiedSegmentDrag);
      
      // Set cursor style for better UX
      document.body.style.cursor = dragType === 'move' ? 'grabbing' : 'ew-resize';
      document.body.style.userSelect = 'none';
    };
    
    const handleUnifiedSegmentDrag = (event) => {
      // ตรวจสอบสถานะการลากก่อน
      if (!isDraggingSegment.value || !cachedTimelineRect || !dragSegmentData.value || dragSegmentData.value.segmentIndex === -1) {
        console.log('handleUnifiedSegmentDrag: Not in dragging state, stopping');
        stopUnifiedSegmentDrag(); // ลบ event listeners ถ้าไม่ควรลาก
        return;
      }
      
      // Throttle updates for better performance (reduce from 60fps to avoid over-processing)
      const now = performance.now();
      if (now - lastDragUpdate < 8) { // ~120fps for smoother dragging
        return;
      }
      lastDragUpdate = now;
      
      // Cancel previous animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Use RequestAnimationFrame for smooth updates
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = event.clientX - dragSegmentData.value.startX;
        const deltaTime = (deltaX / cachedTimelineRect.width) * videoDuration.value;
        
        const segmentIndex = dragSegmentData.value.segmentIndex;
        if (segmentIndex < 0 || segmentIndex >= segments.value.length) return;
        
        const segment = segments.value[segmentIndex];
        const originalSegment = dragSegmentData.value.originalSegment;
        
        if (dragSegmentData.value.type === 'start') {
          let newStart = Math.max(0, originalSegment.start + deltaTime);
          newStart = Math.min(newStart, segment.end - 0.1); // Minimum 0.1s duration
          
          // Check for overlap with other segments
          if (!checkSegmentOverlapForUpdate(segmentIndex, newStart, segment.end)) {
            if (Math.abs(segment.start - newStart) > 0.01) { // Only update if significant change
              segment.start = newStart;
              segment.duration = segment.end - segment.start;
            }
          }
        } else if (dragSegmentData.value.type === 'end') {
          let newEnd = Math.min(videoDuration.value, originalSegment.end + deltaTime);
          newEnd = Math.max(newEnd, segment.start + 0.1); // Minimum 0.1s duration
          
          // Check for overlap with other segments
          if (!checkSegmentOverlapForUpdate(segmentIndex, segment.start, newEnd)) {
            if (Math.abs(segment.end - newEnd) > 0.01) { // Only update if significant change
              segment.end = newEnd;
              segment.duration = segment.end - segment.start;
            }
          }
        } else if (dragSegmentData.value.type === 'move') {
          // Move entire segment
          const segmentDuration = originalSegment.end - originalSegment.start;
          let newStart = Math.max(0, originalSegment.start + deltaTime);
          let newEnd = newStart + segmentDuration;
          
          // Ensure segment doesn't go beyond video duration
          if (newEnd > videoDuration.value) {
            newEnd = videoDuration.value;
            newStart = newEnd - segmentDuration;
          }
          
          // Ensure segment doesn't go before 0
          if (newStart < 0) {
            newStart = 0;
            newEnd = newStart + segmentDuration;
          }
          
          // Check for overlap with other segments
          if (!checkSegmentOverlapForUpdate(segmentIndex, newStart, newEnd)) {
            if (Math.abs(segment.start - newStart) > 0.01 || Math.abs(segment.end - newEnd) > 0.01) {
              segment.start = newStart;
              segment.end = newEnd;
              segment.duration = segmentDuration; // Duration stays the same
            }
          }
        }
        
  // Don't force re-render during drag for better performance
      });
    };
    
    const stopUnifiedSegmentDrag = () => {
      console.log('stopUnifiedSegmentDrag called, stopping drag');
      
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // อันดับแรก ลบ event listeners ทันที
      document.removeEventListener('mousemove', handleUnifiedSegmentDrag);
      document.removeEventListener('mouseup', stopUnifiedSegmentDrag);
      
      // Reset cursor and selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Clear cached values
      cachedTimelineRect = null;
      lastDragUpdate = 0;
      
      // ตั้งค่า drag state เป็น false
      isDraggingSegment.value = false;
      dragSegmentData.value = { 
        segmentIndex: -1, 
        type: null, 
        startX: 0, 
        originalSegment: null 
      };
      
  // No explicit re-key; reactive updates suffice
  // Push to history for drag action on unified timeline
  pushHistory('ลากปรับช่วง (Timeline)');
      
      console.log('Drag stopped, isDraggingSegment:', isDraggingSegment.value);
    };
    
    const checkSegmentOverlapForUpdate = (currentIndex, newStart, newEnd) => {
      for (let i = 0; i < segments.value.length; i++) {
        if (i === currentIndex) continue;
        const other = segments.value[i];
        if (rangesOverlap(newStart, newEnd, other.start, other.end)) return true;
      }
      return false;
    };
    
    const handleSegmentDrag = (event) => {
      if (!isDraggingSegment.value || !timelineRef.value) return;
      
      const rect = timelineRef.value.getBoundingClientRect();
      const deltaX = event.clientX - dragSegmentData.value.startX;
      const deltaTime = (deltaX / rect.width) * videoDuration.value;
      
      const segment = segments.value.find(s => s.id === dragSegmentData.value.segmentId);
      if (!segment) return;
      
      const original = dragSegmentData.value.originalSegment;
      let newStart = original.start;
      let newEnd = original.end;
      
      // Calculate new times based on drag type
      if (dragSegmentData.value.type === 'start') {
        newStart = Math.max(0, Math.min(original.start + deltaTime, original.end - 0.1));
      } else if (dragSegmentData.value.type === 'end') {
        newEnd = Math.min(videoDuration.value, Math.max(original.end + deltaTime, original.start + 0.1));
      } else if (dragSegmentData.value.type === 'move') {
        const duration = original.end - original.start;
        newStart = Math.max(0, Math.min(original.start + deltaTime, videoDuration.value - duration));
        newEnd = newStart + duration;
      }
      
      // Check for overlaps with other segments
      const isValidPosition = checkSegmentOverlap(dragSegmentData.value.segmentId, newStart, newEnd);
      
      if (isValidPosition) {
        segment.start = newStart;
        segment.end = newEnd;
        segment.duration = newEnd - newStart;
      }
    };
    
    const stopSegmentDrag = () => {
      isDraggingSegment.value = false;
      dragSegmentData.value = { segmentId: null, type: null, startX: 0, originalSegment: null };
      document.removeEventListener('mousemove', handleSegmentDrag);
      document.removeEventListener('mouseup', stopSegmentDrag);
  // Push to history for drag action
  pushHistory('ลากปรับช่วง');
    };
    
    const checkSegmentOverlap = (currentSegmentId, newStart, newEnd) => {
      return !segments.value.some(s => {
        if (s.id === currentSegmentId) return false;
        return rangesOverlap(newStart, newEnd, s.start, s.end);
      });
    };

    const confirmExport = async () => {
      try {
        showExportOptions.value = false;
        isProcessing.value = true;
        progressPercentage.value = 0;
        
        // Sanitize filename and ensure extension
        let outName = (exportSettings.value.filename || '').trim();
        if (!outName) {
          outName = (videoFile.value?.name?.replace(/\.[^/.]+$/, '') || 'trimmed_video') + '_trimmed';
        }
        const ext = (exportSettings.value.format || 'mp4').toLowerCase();
        if (!outName.toLowerCase().endsWith(`.${ext}`)) {
          outName = `${outName}.${ext}`;
        }

        // ใช้ file._id ถ้ามี หรือสร้าง ID ใหม่
        const fileId = videoFile.value?._id || `temp_${Date.now()}`;
        
        // สร้าง JSON payload แทน FormData
        const payload = {
          url: videoUrl.value,
          site: 'fti.academy',
          storage: fileId,
          filename: outName,
          output_format: exportSettings.value.format,
          quality: exportSettings.value.quality,
          processing_mode: exportSettings.value.processingMode,
          audio_volume: exportSettings.value.volume / 100,
          copy_streams: exportSettings.value.processingMode === 'fast'
        };
        
        // เพิ่มข้อมูลการ trim
        if (exportSettings.value.trimMode === 'multi' && segments.value.length > 0) {
          // Multi-segment trimming
          payload.trim_mode = 'multi';
          payload.segments = segments.value.map(seg => ({
            start: Math.round(seg.start * 100) / 100,
            end: Math.round(seg.end * 100) / 100,
            duration: Math.round(seg.duration * 100) / 100
          }));
        } else {
          // Single segment trimming
          payload.trim_mode = 'single';
          payload.start_time = Math.round(startTime.value * 100) / 100;
          payload.end_time = Math.round(endTime.value * 100) / 100;
          payload.duration = Math.round(trimDuration.value * 100) / 100;
        }
        
        // เพิ่ม audio filter ถ้าต้องการ
        if (exportSettings.value.volume !== 100) {
          payload.audio_filter = `volume=${exportSettings.value.volume / 100}`;
        }
        
        // รวมข้อมูล text overlays
        if (textLayers.value && textLayers.value.length > 0) {
          payload.text_overlays = textLayers.value.map(layer => ({
            id: layer.id,
            text: layer.text || '',
            font_family: layer.fontFamily || 'Arial',
            font_size: layer.fontSize || 24,
            color: layer.color || '#ffffff',
            position: {
              x: layer.x || 0,
              y: layer.y || 0
            },
            timing: {
              start: Math.round((layer.start || 0) * 100) / 100,
              end: Math.round((layer.end || videoDuration.value) * 100) / 100,
              duration: Math.round(((layer.end || videoDuration.value) - (layer.start || 0)) * 100) / 100
            },
            style: {
              opacity: layer.opacity || 1,
              rotation: layer.rotation || 0,
              scale_x: layer.scaleX || 1,
              scale_y: layer.scaleY || 1,
              stroke_width: layer.strokeWidth || 0,
              stroke_color: layer.strokeColor || '#000000',
              shadow: layer.shadow || false,
              bold: layer.bold || false,
              italic: layer.italic || false
            }
          }));
        }
        
        // รวมข้อมูล image overlays
        if (imageLayers.value && imageLayers.value.length > 0) {
          payload.image_overlays = imageLayers.value.map(layer => ({
            id: layer.id,
            image_url: layer.url || layer.src || '',
            position: {
              x: layer.x || 0,
              y: layer.y || 0,
              width: layer.width || 100,
              height: layer.height || 100
            },
            timing: {
              start: Math.round((layer.start || 0) * 100) / 100,
              end: Math.round((layer.end || videoDuration.value) * 100) / 100,
              duration: Math.round(((layer.end || videoDuration.value) - (layer.start || 0)) * 100) / 100
            },
            style: {
              opacity: layer.opacity || 1,
              rotation: layer.rotation || 0,
              scale_x: layer.scaleX || 1,
              scale_y: layer.scaleY || 1
            }
          }));
        }
        
        console.log('🎬 Sending trim request to https://media.cloudrestfulapi.com/trim');
        console.log('📋 Trim JSON payload:', JSON.stringify(payload, null, 2));
        
        // เรียก API ไปที่ https://media.cloudrestfulapi.com/trim
        const response = await fetch('https://media.cloudrestfulapi.com/trim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Trim API response:', result);
        
        // สร้าง task ใหม่ใน task system (เหมือน convertVideo)
        try {
          console.log('📝 Creating trim task in task system...');
          
          // สร้าง task data แบบเดียวกับ convert แต่ใช้ type trim
          const taskData = {
            title: `Trim ${videoFile.value?.name || outName}`,
            description: `Trimming ${videoFile.value?.name || outName} with ${exportSettings.value.trimMode} mode`,
            fileName: videoFile.value?.name || outName,
            fileId: fileId,
            file_id: fileId,
            unit: 'default',
            originalFormat: videoFile.value?.type || 'video/mp4',
            targetFormat: exportSettings.value.format || 'mp4',
            quality: exportSettings.value.quality,
            priority: 'medium',
            type: 'trim', // แยกประเภท task
            conversionOptions: {
              trimMode: exportSettings.value.trimMode,
              segments: exportSettings.value.trimMode === 'multi' ? segments.value : null,
              startTime: exportSettings.value.trimMode === 'single' ? startTime.value : null,
              endTime: exportSettings.value.trimMode === 'single' ? endTime.value : null,
              duration: exportSettings.value.trimMode === 'single' ? trimDuration.value : null,
              audioVolume: exportSettings.value.volume,
              processingMode: exportSettings.value.processingMode,
              textOverlays: textLayers.value && textLayers.value.length > 0 ? textLayers.value : null,
              imageOverlays: imageLayers.value && imageLayers.value.length > 0 ? imageLayers.value : null,
              trimJobId: result.job_id || result.id,
              filePath: videoUrl.value,
              fileSize: videoFile.value?.size
            }
          };
          
          // ใช้ createConversionTask เดียวกันกับ convert
          let taskResult;
          if (window.fileManagerInstance && typeof window.fileManagerInstance.createConversionTask === 'function') {
            taskResult = await window.fileManagerInstance.createConversionTask(taskData);
          } else {
            // Fallback ใช้ fetch ถ้าไม่มี fileManagerInstance
            const taskResponse = await fetch('/api/conversion_task/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(taskData)
            });
            
            if (taskResponse.ok) {
              taskResult = await taskResponse.json();
            } else {
              throw new Error(`Task creation failed: ${taskResponse.status}`);
            }
          }
          
          if (taskResult && (taskResult._id || taskResult.success)) {
            console.log('✅ Trim task created:', taskResult);
            
            // Refresh TaskManager เพื่อแสดง task ใหม่ทันที
            if (window.fileManagerInstance && typeof window.fileManagerInstance.loadConversionTasks === 'function') {
              await window.fileManagerInstance.loadConversionTasks();
              console.log('🔄 TaskManager refreshed after creating trim task');
            }
            
            // แสดงข้อความสำเร็จ
            toast({ 
              type: 'success', 
              message: `เริ่มการตัดต่อวิดีโอ "${videoFile.value?.name || outName}" แล้ว\nสามารถตรวจสอบความคืบหน้าได้ในหน้า Task Manager`
            });
          } else {
            console.warn('⚠️ สร้าง trim task ไม่สำเร็จ:', taskResult);
            toast({ 
              type: 'warning', 
              message: `เริ่มการตัดต่อวิดีโอแล้ว แต่อาจไม่สามารถบันทึกงานได้`
            });
          }
          
        } catch (taskError) {
          console.error('Failed to create task:', taskError);
          // แสดงข้อความสำเร็จแต่แจ้งว่า task อาจไม่ถูกบันทึก
          toast({ 
            type: 'warning', 
            message: `เริ่มการตัดต่อวิดีโอแล้ว แต่อาจไม่สามารถติดตามความคืบหน้าได้`
          });
        }
        
        // Simulate progress updates while job is processing
        const progressInterval = setInterval(() => {
          progressPercentage.value = Math.min(progressPercentage.value + 10, 90);
        }, 500);
        
        // Wait for initial processing setup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(progressInterval);
        progressPercentage.value = 100;
        
        // ปิด modal และ reset state
        isProcessing.value = false;
        progressPercentage.value = 0;
        closeModal();
        
        // Emit ผลลัพธ์
        emit('trimmed', {
          success: true,
          jobId: result.job_id || result.id,
          taskCreated: true,
          message: 'งานตัดต่อวิดีโอถูกส่งเข้าคิวแล้ว',
          originalFile: videoFile.value,
          trimSettings: {
            startTime: startTime.value,
            endTime: endTime.value,
            duration: trimDuration.value,
            segments: exportSettings.value.trimMode === 'multi' ? segments.value : null
          },
          exportSettings: exportSettings.value
        });
        
      } catch (error) {
        console.error('Error during video trimming:', error);
        isProcessing.value = false;
        progressPercentage.value = 0;
        
        toast({ type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}` });
      }
    };

    // Drag functionality
    const startDrag = (type, event) => {
      event.preventDefault();
      event.stopPropagation();
      
      isDragging.value = true;
      dragType.value = type;
      
      const handleMouseMove = (e) => {
        if (!isDragging.value || !timelineRef.value) return;
        
        const rect = timelineRef.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * videoDuration.value;
        
        if (dragType.value === 'start') {
          const newStartTime = Math.max(0, Math.min(time, endTime.value - 0.1));
          startTime.value = newStartTime;
          seekToTime(newStartTime);
        } else if (dragType.value === 'end') {
          const newEndTime = Math.min(videoDuration.value, Math.max(time, startTime.value + 0.1));
          endTime.value = newEndTime;
          seekToTime(newEndTime);
        }
      };
      
      const handleMouseUp = () => {
        isDragging.value = false;
        dragType.value = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Multi-segment functions
    const addSegment = async () => {
      try {
        // Set flag to prevent watcher from triggering
        isAddingSegment.value = true;
        
        const duration = videoDuration.value;
        
        if (!duration || duration <= 0) {
          console.warn('Invalid video duration');
          return;
        }
        
        if (!segments.value) {
          console.warn('Segments array is not initialized');
          return;
        }
        
  // คำนวณความยาว segment ที่เหมาะสม
  const defaultSegmentDuration = computeDefaultSegmentDuration(duration);
      
      // Sort segments by start time
      const sortedSegments = [...segments.value].sort((a, b) => a.start - b.start);
      
      let newSegmentStart, newSegmentEnd;
      
        if (sortedSegments.length === 0) {
          // ไม่ควรเกิดขึ้นเพราะมี initial segment แล้ว
          newSegmentStart = 0;
          newSegmentEnd = Math.min(defaultSegmentDuration, duration);
        } else {
          // หา segment ที่มี end time สูงสุด
          const lastSegment = findLastSegmentByEnd(sortedSegments) || sortedSegments[0];
          
          // เริ่ม segment ใหม่จากจุดสิ้นสุดของ segment สุดท้าย
          newSegmentStart = lastSegment.end;
          
          // ความยาวของ segment ใหม่ = เวลาที่เหลือทั้งหมด
          const remainingTime = duration - newSegmentStart;
          
          if (remainingTime <= 0) {
            console.log('No more time left for new segments');
            return;
          }
          
          // ใช้เวลาที่เหลือทั้งหมดสำหรับ segment ใหม่
          newSegmentEnd = duration; // ใช้ความยาววีดีโอทั้งหมดที่เหลือ
        }      // สร้าง segment ใหม่
      const newSegment = {
        id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        start: newSegmentStart,
        end: newSegmentEnd,
        duration: newSegmentEnd - newSegmentStart
      };
      
        console.log(`Adding new segment: ${newSegmentStart}s - ${newSegmentEnd}s (${newSegment.duration}s)`);
        console.log('Existing segments before insert:', segments.value.map(s => `${s.start}s-${s.end}s`));
        console.log('New segment ID:', newSegment.id);        // Insert segment in chronological order using immutable approach
        const currentSegments = [...segments.value];
        const insertIndex = currentSegments.findIndex(seg => seg.start > newSegment.start);
        
        let newSegments;
        if (insertIndex === -1) {
          newSegments = [...currentSegments, newSegment];
        } else {
          newSegments = [
            ...currentSegments.slice(0, insertIndex),
            newSegment,
            ...currentSegments.slice(insertIndex)
          ];
        }
        
  // Update array immutably without clearing to avoid DOM anchor issues
  // Clear then set to avoid patching anchor issues
  segments.value = [];
  await nextTick();
  segments.value = newSegments;
  console.log(`Segment added successfully. Total segments: ${segments.value.length}`);
  await nextTick();
        
  // Set the newly added segment as current editing (latest segment)
        currentEditingIndex.value = newSegments.length - 1;
        
        // อัพเดท timeline ให้แสดงตำแหน่งถัดไป (ถ้ามี)
  findNextSequentialSlot();
  pushHistory('เพิ่มช่วงใหม่');
        
      } catch (error) {
        console.error('Error adding segment:', error);
      } finally {
        // Always reset the flag
        isAddingSegment.value = false;
      }
    };
    
    const findNextSequentialSlot = () => {
      const duration = videoDuration.value;
      
  // คำนวณความยาว section ที่เหมาะสมตามความยาววีดีโอ
  const defaultSegmentDuration = computeDefaultSegmentDuration(duration);
      
      // Sort segments by start time
      const sortedSegments = [...segments.value].sort((a, b) => a.start - b.start);
      
      if (sortedSegments.length === 0) {
        // First segment: start at 0 seconds
        const start = 0;
        const end = Math.min(defaultSegmentDuration, duration);
        
        if (start >= 0 && end > start) {
          startTime.value = start;
          endTime.value = end;
          seekToTime(startTime.value);
          return;
        }
      }
      
      // For subsequent segments: หาตำแหน่งหลัง segment สุดท้าย (เรียงตาม end time)
  const lastSegment = findLastSegmentByEnd(sortedSegments) || sortedSegments[0];
      
      const nextStart = lastSegment.end;
      const nextEnd = Math.min(nextStart + defaultSegmentDuration, duration);
      
      // ตรวจสอบว่ามีพื้นที่เพียงพอหรือไม่
      if (nextStart < duration && (nextEnd - nextStart) >= 1) {
        startTime.value = nextStart;
        endTime.value = nextEnd;
        seekToTime(startTime.value);
        
        console.log(`Next segment: ${nextStart}s - ${nextEnd}s (after segment ending at ${lastSegment.end}s)`);
      } else {
        // ไม่มีพื้นที่เหลือสำหรับ segment ใหม่
        console.log(`No space left. Video duration: ${duration}s, Last segment ends at: ${lastSegment.end}s`);
        // ไม่ต้องแจ้งเตือน - ให้ผู้ใช้รู้จากการที่ไม่มีการเปลี่ยนแปลงใน timeline
      }
    };
    
    const removeSegment = async (segmentId) => {
      const removedIndex = segments.value.findIndex(seg => seg.id === segmentId);
      // Guard to prevent concurrent thumbnail generation / DOM patch thrash
      isAddingSegment.value = true;
      try {
        // Clear then set to avoid patching anchor issues
        const remaining = segments.value.filter(seg => seg.id !== segmentId);
        segments.value = [];
        await nextTick();
        segments.value = remaining;
        await nextTick();
        // Clean up thumbnails referencing removed segment
        if (Array.isArray(segmentThumbnails.value) && segmentId) {
          segmentThumbnails.value = segmentThumbnails.value.filter(t => t.segmentId !== segmentId);
        }
      } finally {
        isAddingSegment.value = false;
      }
      
      // Adjust currentEditingIndex after removal
      if (removedIndex !== -1) {
        if (removedIndex === currentEditingIndex.value) {
          // If removing the current editing segment, select the next one or previous one
          if (segments.value.length > 0) {
            currentEditingIndex.value = Math.min(removedIndex, segments.value.length - 1);
          } else {
            currentEditingIndex.value = -1;
          }
        } else if (removedIndex < currentEditingIndex.value) {
          // If removing a segment before current editing, decrease the index
          currentEditingIndex.value--;
        }
      }
      
  toast({ type: 'success', message: 'ลบช่วงแล้ว' });
    pushHistory('ลบช่วง');
  };

    const clearAllSegments = async () => {
      isAddingSegment.value = true;
      try {
        segments.value = [];
        await nextTick();
        currentEditingIndex.value = -1;
        // Clear segment thumbnails too
        segmentThumbnails.value = [];
      } finally {
        isAddingSegment.value = false;
      }
      toast({ type: 'success', message: 'ลบช่วงทั้งหมดแล้ว' });
      pushHistory('ลบทั้งหมด');
    };

    const selectSegment = (segment) => {
      startTime.value = segment.start;
      endTime.value = segment.end;
      seekToTime(segment.start);
      
      // Set current editing index to highlight this segment
      const segmentIndex = segments.value.findIndex(s => s.id === segment.id);
      if (segmentIndex !== -1) {
        currentEditingIndex.value = segmentIndex;
      }
    };

  const getTotalSegmentsDuration = () => sumSegmentsDuration(segments.value);

    return {
      // Core state
      videoFile,
      videoUrl,
      videoDuration,
      currentTime,
      startTime,
      endTime,
      trimDuration,
      isProcessing,
      progressPercentage,
      canTrim,
      thumbnails,
      segmentThumbnails,
      isPreviewPlaying,
      isVideoPlaying,
      volume,
  isMuted,
  isCutModeActive,
  // audio meter
  liveLevel,
  liveLevelLeft,
  liveLevelRight,
  waveformCanvasRef,
  importInputRef,
      showExportOptions,
      exportSettings,
      qualityOptions,
      
      // Multi-segment state
      segments,
      safeSegments,
      currentSegmentIndex,
      currentEditingIndex,
  isMultiSegmentMode,
  isSegmentsExpanded,
  showHistoryPanel,
  // history
  historyItems,
  historyIndex,
  canUndo,
  canRedo,
      
      // Refs
      videoRef,
      timelineRef,
      unifiedTimelineRef,
  globalTimelineWrapperRef,
      isGeneratingThumbnails,
      isGeneratingSegmentThumbnails,
      thumbnailProgress,
      
      // Computed properties
      timeMarkers,
      recommendedSegmentDuration,
      currentSegmentForNavigation,
      canGoToPreviousSegment,
  canGoToNextSegment,
  canSplitAtPlayhead,
  // Cut hover guide
  cutHoverTime,
  isCutHoverValid,
      
      // Methods
      closeModal,
      setVideoElement,
      onVideoLoaded,
      onTimeUpdate,
      handleSeekFromProgressBar,
      handleStartProgressDrag,
      handleStartSegmentDrag,
  handleStartUnifiedSegmentDrag,
  undo,
  redo,
  gotoHistory,
  toggleCutMode,
      handleMultiSegmentPreview,
      jumpToNextSegment,
      jumpToStart,
      jumpToEnd,
      adjustStartTime,
      adjustEndTime,
      playFromStart,
      stopPreview,
      goToPreviousSegment,
      goToNextSegment,
      togglePlayPause,
      toggleMute,
      updateVolume,
      toggleFullscreen,
      seekToTime,
      startTrimming,
      cancelExport,
      resetExportSettings,
      confirmExport,
  saveProject,
  triggerImport,
  handleImportFile,
      formatTime,
      startDrag,
      updateStartTimeFromInput,
      updateEndTimeFromInput,
      
      // Multi-segment functions
      addSegment,
      removeSegment,
      clearAllSegments,
      selectSegment,
      getTotalSegmentsDuration,
      findNextSequentialSlot,
      createInitialSegment,
  isInvalidTime,
  splitAtPlayhead,
  // Overlay Layers
  textLayers,
  imageLayers,
  addTextLayer,
  promptAddImageLayer,
  updateTextLayerTime,
  updateImageLayerTime,
  removeTextLayer,
  removeImageLayer,
  overlayContainerRef,
  overlayContentRef,
  overlayContentStyle,
  startOverlayPreviewDrag,
  selectOverlay,
  isOverlaySelected,
  clearOverlaySelection,
  
  // Text editor panel
  isTextEditorOpen,
  editorTargetId,
  textEditor,
  textEditorPanelRef,
  editorPanelStyle,
  openTextEditor,
  closeTextEditor,
  applyTextEdit,
  toggleTextStyle,
  setAlign,
  toggleShadow,
  
  // Image editor panel
  isImageEditorOpen,
  imageEditor,
  imageEditorPanelRef,
  openImageEditor,
  closeImageEditor,
  applyImageEdit,
  toggleImageShadow,
      
      // Thumbnail functions
      generateSegmentThumbnails,
      
      // Segment dragging functions
      startSegmentDrag,
      startUnifiedSegmentDrag,
      isDraggingSegment,
      dragSegmentData
  ,
  onUnifiedTimelineClick,
      onCutOverlayClick,
  onCutOverlayMove,
  onCutOverlayLeave,
      scissorCursorStyle,
  startPlayheadDrag,
  // Playhead inline edit
  isEditingPlayheadTime,
  playheadEditText,
  playheadInputInvalid,
  playheadInputRef,
  startPlayheadEdit,
  commitPlayheadEdit,
  cancelPlayheadEdit,
  // Inline editors
  segmentEdit,
  onEditInput,
  commitSegmentEdit
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
  border-color: #8B5CF6 !important;
  background-color: rgba(139, 92, 246, 0.7) !important;
}

.segment-drag-handle {
  transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.segment-drag-handle:hover {
  background-color: #7C3AED !important;
}

/* Dragging state */
.segment-dragging {
  border-color: #6D28D9 !important;
  background-color: rgba(109, 40, 217, 0.8) !important;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);
}

/* Video sequence preview styling */
/* Overlay preview resize handle */
.overlay-resize-handle {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 12px;
  height: 12px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #d1d5db;
  border-radius: 2px;
  cursor: nwse-resize;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  opacity: 0;
}
.group:hover .overlay-resize-handle { opacity: 1; }

/* Transform box: show border only when selected */
.overlay-selected {
  outline: 2px solid rgba(59,130,246,0.9); /* blue-500 */
}
.overlay-handle {
  position: absolute;
  width: 10px; height: 10px;
  background: #fff;
  border: 1px solid #3b82f6; /* blue-500 */
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.handle-tl { left: -6px; top: -6px; cursor: nwse-resize; }
.handle-tr { right: -6px; top: -6px; cursor: nesw-resize; }
.handle-bl { left: -6px; bottom: -6px; cursor: nesw-resize; }
.handle-br { right: -6px; bottom: -6px; cursor: nwse-resize; }
.video-sequence-segment {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.video-sequence-segment::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease-in-out;
}

.video-sequence-segment:hover::before {
  left: 100%;
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

/* Audio volume slider styling */
.slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Timeline background thumbnails */
.unified-timeline .bg-cover {
  filter: brightness(1.1) contrast(0.9);
}
</style>
