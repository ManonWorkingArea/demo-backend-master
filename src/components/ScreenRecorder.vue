<template>
  <div class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-black/55 backdrop-blur-sm" @click="closeModal"></div>
    <div class="relative w-full h-full flex flex-col" @click.stop>
      <!-- Top Toolbar -->
      <div class="flex items-center gap-3 px-3 py-2 bg-white/95 backdrop-blur border-b border-gray-200 text-xs">
        <div class="flex items-center gap-2 pr-3 border-r border-gray-200">
          <span class="p-1.5 bg-red-100 rounded-lg"><i class="fas fa-video text-red-600"></i></span>
          <div class="leading-tight">
            <div class="font-semibold text-gray-800 text-sm">Screen Recorder</div>
            <div class="text-[10px] text-gray-500">บันทึกหน้าจอ + webcam</div>
          </div>
        </div>
        <!-- Main Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <button @click="initializeNewSession" :disabled="isRecording" class="rec-btn btn-info" title="สร้าง Session ใหม่">
            <i class="fas fa-refresh"></i>
            <span>Session ใหม่</span>
          </button>
          <button @click="selectScreen" :disabled="isRecording" class="rec-btn" :class="isScreenSharing?'btn-secondary':'btn-primary'">
            <i class="fas fa-display"></i>
            <span>{{ isScreenSharing ? 'เปลี่ยนหน้าจอ' : 'เลือกหน้าจอ' }}</span>
          </button>
          <button @click="toggleWebcam" :disabled="isRecording" class="rec-btn" :class="isWebcamEnabled?'btn-green':'btn-secondary'">
            <i :class="isWebcamEnabled ? 'fas fa-video' : 'fas fa-video-slash'"></i>
            <span>{{ isWebcamEnabled ? 'ปิดกล้อง' : 'เปิดกล้อง' }}</span>
          </button>
          <button @click="toggleAudio" :disabled="isRecording" class="rec-btn" :class="includeAudio?'btn-blue':'btn-secondary'">
            <i class="fas" :class="includeAudio?'fa-microphone':'fa-microphone-slash'"></i>
            <span>{{ includeAudio ? 'ปิดเสียง' : 'เปิดเสียง' }}</span>
          </button>
          <button v-if="!isRecording" @click="startRecording" :disabled="!isScreenSharing" class="rec-btn btn-danger">
            <i class="fas fa-circle text-[11px]"></i><span>เริ่ม</span>
          </button>
          <button v-if="isRecording" @click="stopRecording" class="rec-btn btn-dark">
            <i class="fas fa-stop"></i><span>หยุด</span>
          </button>
          <button v-if="isRecording" @click="pauseRecording" class="rec-btn btn-warn">
            <i class="fas" :class="isPaused?'fa-play':'fa-pause'"></i><span>{{ isPaused?'ต่อ':'พัก' }}</span>
          </button>
        </div>
        <!-- Spacer -->
        <div class="flex-1"></div>
        <!-- Status Time -->
        <div v-if="isRecording" class="hidden md:flex items-center bg-red-600 text-white px-3 py-1 rounded-full font-medium gap-2">
          <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>{{ recordingTime }}
        </div>
        <button @click="showSettingsPanel = !showSettingsPanel" class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100" :class="showSettingsPanel && 'bg-gray-100 text-gray-900'" :title="showSettingsPanel?'ซ่อนการตั้งค่า':'การตั้งค่า'">
          <i class="fas fa-gear"></i>
        </button>
        <button @click="closeModal" :disabled="isRecording" class="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <!-- Preview Area -->
      <div class="flex-1 relative bg-black overflow-hidden">
        <div v-if="!isScreenSharing" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 select-none">
          <i class="fas fa-desktop text-7xl mb-5 opacity-60"></i>
          <p class="text-lg mb-1">ยังไม่ได้เลือกหน้าจอที่จะบันทึก</p>
          <p class="text-sm opacity-70">กด "เลือกหน้าจอ" ด้านบน</p>
        </div>
        <video v-if="isScreenSharing" ref="screenPreview" autoplay muted playsinline class="absolute inset-0 w-full h-full object-contain bg-black"></video>
        <div v-if="isWebcamEnabled" class="absolute rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-700"
             :class="[
              webcamSize === 'small' ? 'w-32 h-24' : webcamSize === 'medium' ? 'w-48 h-36' : 'w-64 h-48',
              webcamPosition === 'top-left' ? 'top-4 left-4' :
              webcamPosition === 'top-right' ? 'top-4 right-4' :
              webcamPosition === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
             ]">
          <video ref="webcamPreview" autoplay muted playsinline class="w-full h-full object-cover"></video>
        </div>
        <div v-if="isRecording" class="absolute top-3 left-3 md:hidden bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
          <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>{{ recordingTime }}
        </div>
        <!-- Settings Drawer -->
        <transition name="slide">
          <div v-if="showSettingsPanel" class="absolute top-0 right-0 h-full w-80 max-w-full bg-white/95 backdrop-blur border-l border-gray-200 flex flex-col">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 class="text-xs font-semibold tracking-wide text-gray-600 uppercase">การตั้งค่า</h4>
              <button @click="showSettingsPanel=false" class="p-1.5 rounded hover:bg-gray-100 text-gray-500"><i class="fas fa-times text-xs"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
              <!-- Webcam Settings -->
              <div v-if="isWebcamEnabled" class="space-y-3">
                <h5 class="font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-video text-green-600"></i>Webcam</h5>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-medium text-gray-500 mb-1">ตำแหน่ง</label>
                    <select v-model="webcamPosition" :disabled="isRecording" class="w-full px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                      <option value="top-left">บนซ้าย</option>
                      <option value="top-right">บนขวา</option>
                      <option value="bottom-left">ล่างซ้าย</option>
                      <option value="bottom-right">ล่างขวา</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-gray-500 mb-1">ขนาด</label>
                    <select v-model="webcamSize" :disabled="isRecording" class="w-full px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                      <option value="small">เล็ก</option>
                      <option value="medium">กลาง</option>
                      <option value="large">ใหญ่</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- Audio -->
              <div class="space-y-3">
                <h5 class="font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-microphone text-indigo-600"></i>เสียง</h5>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">บันทึกเสียง</span>
                  <button @click="toggleAudio" :disabled="isRecording" class="relative inline-flex h-5 w-10 rounded-full transition" :class="includeAudio?'bg-blue-600':'bg-gray-300'">
                    <span :class="['absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transform transition', includeAudio ? 'translate-x-5' : 'translate-x-0']" />
                  </button>
                </div>
                <div v-if="includeAudio" class="space-y-2">
                  <label class="flex items-center gap-2 text-[11px] text-gray-600">
                    <input type="checkbox" v-model="captureSystemAudio" :disabled="isRecording" class="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span>รวมเสียงระบบ (ทดลอง)</span>
                  </label>
                  <div class="space-y-1">
                    <div class="flex justify-between text-[10px] text-gray-500"><span>ระดับเสียงไมค์</span><span>{{ (audioLevel*100).toFixed(0) }}%</span></div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full transition-all" :style="{ width: (audioLevel*100).toFixed(0)+'%', background: audioLevelColor }"></div>
                    </div>
                  </div>
                  <p v-if="audioError" class="text-[10px] text-red-600">{{ audioError }}</p>
                </div>
              </div>
              <!-- Video Quality -->
              <div class="space-y-3">
                <h5 class="font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-sliders-h text-gray-600"></i>วิดีโอ</h5>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-medium text-gray-500 mb-1">คุณภาพ</label>
                    <select v-model="recordingQuality" :disabled="isRecording" class="w-full px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="1440p">1440p</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-medium text-gray-500 mb-1">FPS</label>
                    <select v-model="frameRate" :disabled="isRecording" class="w-full px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                      <option value="30">30</option>
                      <option value="60">60</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-2 border-t border-gray-200 text-[10px] text-gray-500">ขนาดไฟล์โดยประมาณ: ~{{ estimatedSize }}MB</div>
          </div>
        </transition>
      </div>
      <!-- Bottom Status -->
      <div class="flex items-center justify-between px-3 py-1.5 bg-white/95 backdrop-blur border-t border-gray-200 text-[11px]">
        <div class="text-gray-600 truncate">
          <span v-if="!isRecording">พร้อมสำหรับการบันทึก</span>
          <span v-else class="text-red-600 font-medium">● กำลังบันทึก ({{ recordingTime }})</span>
          <span v-if="chunkStatus.pendingUploads > 0" class="ml-2 text-orange-500">
            • อัพโหลด {{ chunkStatus.pendingUploads }} chunks
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="chunkStatus.failedChunks > 0" class="text-red-500 text-xs">
            ❌ {{ chunkStatus.failedChunks }} failed
          </span>
          <span class="text-gray-500 hidden sm:block">Canvas: {{ window?.targetResolution?.width || '—' }}x{{ window?.targetResolution?.height || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Post-Recording Modal -->
  <div v-if="showPostRecordingModal" class="fixed inset-0 z-[60] overflow-hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="relative w-full h-full flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i class="fas fa-video text-xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold">การบันทึกเสร็จสิ้น</h3>
              <p class="text-blue-100 text-sm">เลือกการดำเนินการต่อไป</p>
            </div>
          </div>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6">
          <!-- Video Preview -->
          <div v-if="recordedVideoData" class="mb-6">
            <div class="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-file-video text-blue-600 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">{{ recordedVideoData.filename }}</h4>
                <div class="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="text-center">
                    <div class="font-medium text-gray-900">{{ recordedVideoData.size }} MB</div>
                    <div class="text-xs">ขนาดไฟล์</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium text-gray-900">{{ recordedVideoData.duration }}</div>
                    <div class="text-xs">ระยะเวลา</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium text-gray-900">{{ recordedVideoData.extension.toUpperCase() }}</div>
                    <div class="text-xs">รูปแบบ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-4">
            <h5 class="font-semibold text-gray-900 text-lg mb-4">คุณต้องการทำอะไรกับวิดีโอนี้?</h5>
            
            <!-- Upload Option -->
            <button 
              @click="uploadVideo"
              class="w-full flex items-center gap-4 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
            >
              <div class="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center">
                <i class="fas fa-cloud-upload-alt text-green-600 text-xl"></i>
              </div>
              <div class="text-left flex-1">
                <div class="font-semibold text-gray-900 text-lg">อัพโหลดไปยังระบบ</div>
                <div class="text-gray-600 text-sm">เพิ่มวิดีโอเข้าไปในไฟล์แมเนเจอร์เพื่อจัดเก็บและแชร์</div>
              </div>
              <i class="fas fa-arrow-right text-green-600 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
            </button>
            
            <!-- Download Option -->
            <button 
              @click="downloadVideo"
              class="w-full flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div class="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center">
                <i class="fas fa-download text-blue-600 text-xl"></i>
              </div>
              <div class="text-left flex-1">
                <div class="font-semibold text-gray-900 text-lg">ดาวน์โหลดไฟล์</div>
                <div class="text-gray-600 text-sm">บันทึกไฟล์ลงในเครื่องของคุณ</div>
              </div>
              <i class="fas fa-arrow-right text-blue-600 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
            </button>
          </div>
          
          <!-- Warning Notice -->
          <div class="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <i class="fas fa-exclamation-triangle text-amber-600 mt-0.5"></i>
              <div class="text-sm text-amber-800">
                <div class="font-medium mb-1">หมายเหตุ:</div>
                <p>หากคุณปิดหน้าต่างนี้โดยไม่เลือกการดำเนินการใดๆ วิดีโอที่บันทึกจะสูญหาย</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            <i class="fas fa-info-circle mr-1"></i>
            เลือกการดำเนินการภายใน 5 นาที
          </div>
          <button 
            @click="closePostRecordingModal"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import { ref, onBeforeUnmount, nextTick, onMounted, getCurrentInstance, computed } from 'vue';
import VideoSegmentManager from '@/utils/VideoSegmentManager.js';

export default {
  name: 'ScreenRecorder',
  emits: ['close', 'recorded'],
  setup(props, { emit }) {
    console.log('🎥 ScreenRecorder setup - chunk-based mode');
    
    // Get Vue instance for API access
    const instance = getCurrentInstance();
    
    // Initialize VideoSegmentManager
    const segmentManager = new VideoSegmentManager({
      mediaServerUrl: 'https://media.cloudrestfulapi.com/api/media',
      segmentDurationMs: 5000, // 5 seconds per segment for complete MP4 files
      useDummyServer: false, // Use real media server
      simulateRealRequests: true, // Direct to real server
      onSegmentUploaded: (data) => {
        console.log(`✅ Complete MP4 segment ${data.index + 1} uploaded:`, data);
      },
      onUploadError: (error, segmentIndex) => {
        console.error(`❌ Segment ${segmentIndex + 1} upload failed:`, error);
        window.toast?.({
          type: 'error',
          message: `การอัพโหลด MP4 segment ${segmentIndex + 1} ล้มเหลว: ${error.message}`
        });
      },
      onProgressUpdate: (progress) => {
        // อัพเดท UI progress
        estimatedSize.value = progress.totalSizeMB;
        console.log(`📊 Progress: ${progress.totalUploaded} segments, ${progress.totalSizeMB}MB, ${progress.failed} failed`);
      },
      onSessionComplete: (result) => {
        console.log('🎉 Recording session completed:', result);
        handleSessionComplete(result);
      }
    });
    
    // Check for existing session on mount
    onMounted(async () => {
      // ล้าง existing session และสร้างใหม่ทุกครั้ง
      await initializeNewSession();
      
      if (includeAudio.value) startMic();
    });

    /**
     * สร้าง session ใหม่ทุกครั้งที่เปิด modal
     */
    const initializeNewSession = async () => {
      try {
        console.log('🔄 Initializing new recording session...');
        
        // ล้าง existing session data
        segmentManager.cleanup();
        localStorage.removeItem('screen_recording_session');
        
        // เตรียมข้อมูลการตั้งค่าการบันทึก
        const recordingSettings = {
          quality: recordingQuality.value || '1080p',
          frameRate: parseInt(frameRate.value) || 30,
          includeAudio: includeAudio.value,
          videoBitsPerSecond: 8000000, // 8 Mbps
          audioBitsPerSecond: 128000   // 128 kbps
        };
        
        // สร้าง session ใหม่พร้อมสร้างไฟล์ในฐานข้อมูล
        const sessionInfo = await segmentManager.initializeNewSession(recordingSettings);
        console.log('📋 New recording session created with storage:', sessionInfo);
        
        // Reset recording state
        isRecording.value = false;
        isPaused.value = false;
        recordingTime.value = 0;
        estimatedSize.value = 0;
        showPostRecordingModal.value = false;
        recordedVideoData.value = null;
        
        // แสดงข้อมูล session ใหม่
        const currentFolder = segmentManager.preVideoFile?.currentFolder || 'Root';
        window.toast?.({
          type: 'success',
          message: `เตรียมระบบบันทึกเรียบร้อย\n📁 ไฟล์: ${sessionInfo.filename}\n📂 โฟลเดอร์: ${currentFolder}\n🆔 File ID: ${sessionInfo.fileId?.slice(0, 8)}...\n💾 ไฟล์ในฐานข้อมูลพร้อมแล้ว`
        });
        
      } catch (error) {
        console.error('❌ Failed to initialize new session:', error);
        window.toast?.({
          type: 'error',
          message: `ไม่สามารถเตรียมระบบบันทึกได้: ${error.message}`
        });
      }
    };

    /**
     * ปิด modal และล้างข้อมูล
     */
    
    // Video element refs
    const screenPreview = ref(null);
    const webcamPreview = ref(null);
    
    // Recording state
    const isRecording = ref(false);
    const isPaused = ref(false);
    const recordingStartTime = ref(null);
    const recordingTime = ref('00:00');
    const estimatedSize = ref(0);
    
    // Post-recording modal state
    const showPostRecordingModal = ref(false);
    const recordedVideoData = ref(null);
    const modalTimeout = ref(null);
    const timeoutCountdown = ref(300); // 5 minutes in seconds
    
    // Screen sharing
    const isScreenSharing = ref(false);
    const selectedScreen = ref('');
    
    // Webcam
    const isWebcamEnabled = ref(false);
    const webcamPosition = ref('bottom-right');
    const webcamSize = ref('medium');
    
    // Settings
  const includeAudio = ref(true);
  // Audio (simplified)
  const captureSystemAudio = ref(false);
  const audioError = ref('');
  const audioLevel = ref(0); // 0 - 1 meter
  const audioLevelColor = ref('#16a34a');
  let audioContext = null, analyser = null, micSource = null, levelRaf = null, micStream = null;
    const recordingQuality = ref('1080p');
    const frameRate = ref('30');
    const showSettingsPanel = ref(false);
    
    // Timer for recording
    let recordingTimer = null;

    // Computed properties for chunk status
    const chunkStatus = computed(() => {
      if (!segmentManager) {
        return { pendingUploads: 0, failedChunks: 0 };
      }
      try {
        return segmentManager.getStatus();
      } catch (error) {
        console.warn('Error getting chunk status:', error);
        return { pendingUploads: 0, failedChunks: 0 };
      }
    });
  
  const closeModal = () => {
      console.log('🧪 closeModal clicked. isRecording =', isRecording.value, 'isPaused =', isPaused.value);
      // If recording, ask for confirmation (with discard option)
      if (isRecording.value) {
        const action = window.prompt('ยังบันทึกอยู่:\nพิมพ์ 1 = หยุดและบันทึกไฟล์\nพิมพ์ 2 = ยกเลิกและปิด (ทิ้งไฟล์)\nกด Cancel = ไม่ทำอะไร');
        if (action === null) {
          console.log('❎ User cancelled close while recording');
          return;
        }
        if (action === '1') {
          console.log('🛑 Stopping & saving before close');
          stopRecording(); // onstop will emit close
          return;
        } else if (action === '2') {
          console.log('🗑️ Discard recording and close');
          // Discard recorded blobs (if any) and cleanup immediately
          try {
            if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
              window.mediaRecorder.ondataavailable = null; // prevent further collection
              window.mediaRecorder.onstop = null; // prevent auto handler
              window.mediaRecorder.stop();
            }
          } catch (e) { console.warn('Stop mediaRecorder error (discard path):', e); }
          window.recordedBlobs = [];
          cleanup();
          emit('close');
          return;
        } else {
          alert('ไม่ได้เลือกตัวเลือกที่ถูกต้อง ยกเลิกการปิด');
          return;
        }
      }
      // Not recording – just cleanup and close
      console.log('✅ Closing modal (not recording)');
      cleanup();
      emit('close');
      // Fallback to ensure parent state updates
      if (typeof window !== 'undefined' && window.fileManagerInstance) {
        try {
          window.fileManagerInstance.showScreenRecorder = false;
          console.log('🛰️ Fallback applied: set fileManagerInstance.showScreenRecorder = false');
        } catch(e) { console.warn('Fallback update failed:', e); }
      }
    };
    
    const selectScreen = async () => {
      try {
        console.log('🖥️ Starting high-resolution screen capture...');
        
        // Use high-resolution constraints from VideoChunkManager
        const highResConstraints = segmentManager.getHighResolutionConstraints();
        
        // Request screen sharing for preview with high resolution
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: highResConstraints.video,
          audio: includeAudio.value ? highResConstraints.audio : false
        });
        
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        
        console.log('✅ High-resolution screen capture started:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          hasAudio: stream.getAudioTracks().length > 0,
          estimatedBitrate: Math.round((settings.width * settings.height * settings.frameRate) / 1000000) + 'Mbps'
        });
        
        isScreenSharing.value = true;
        selectedScreen.value = `หน้าจอ ${settings.width}x${settings.height}@${settings.frameRate}fps`;
        
        // Store screen share stream for preview only
        window.previewStream = stream;
        
        // Connect to preview
        await nextTick();
        
        if (screenPreview.value) {
          console.log('🎬 Connecting stream to preview');
          screenPreview.value.srcObject = stream;
          
          try {
            await screenPreview.value.play();
            console.log('✅ Preview started');
          } catch (playError) {
            console.warn('⚠️ Preview play error:', playError);
          }
        }
        
        // Setup DOM capture for the preview section only
        await setupPreviewSectionCapture();
        
        // Handle when user stops sharing
        videoTrack.addEventListener('ended', () => {
          console.log('📺 Screen sharing ended by user');
          isScreenSharing.value = false;
          selectedScreen.value = '';
          window.previewStream = null;
          
          if (screenPreview.value) {
            screenPreview.value.srcObject = null;
          }
          
          // Clean up DOM capture
          if (window.currentScreenStream) {
            window.currentScreenStream.getTracks().forEach(track => track.stop());
            window.currentScreenStream = null;
          }
          
          if (isRecording.value) {
            stopRecording();
          }
        });
        
        console.log('✅ Screen capture setup complete');
        
      } catch (error) {
        console.error('❌ Error in screen capture:', error);
        if (error.name === 'NotAllowedError') {
          alert('กรุณาอนุญาตการแชร์หน้าจอเพื่อใช้งานฟีเจอร์นี้');
        } else {
          alert('เกิดข้อผิดพลาดในการเริ่มต้นการบันทึก: ' + error.message);
        }
      }
    };

    const setupPreviewSectionCapture = async () => {
      try {
        console.log('🎯 Setting up HIGH QUALITY canvas capture...');
        
        // Use higher resolution based on user selection
        let targetWidth, targetHeight;
        
        switch (recordingQuality.value) {
          case '1440p':
            targetWidth = 2560;
            targetHeight = 1440;
            break;
          case '1080p':
            targetWidth = 1920;
            targetHeight = 1080;
            break;
          case '720p':
          default:
            targetWidth = 1280;
            targetHeight = 720;
        }
        
        console.log('📐 Using HIGH RESOLUTION dimensions:', {
          width: targetWidth,
          height: targetHeight,
          quality: recordingQuality.value
        });
        
        // Create HIGH QUALITY canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.position = 'fixed';
        canvas.style.left = '-9999px';
        canvas.style.top = '-9999px';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0';
        document.body.appendChild(canvas);
        
        // Use high-quality context settings
        const ctx = canvas.getContext('2d', {
          alpha: false,
          desynchronized: false, // Change to false for better quality
          willReadFrequently: false,
          imageSmoothingEnabled: true, // Enable smoothing for better quality
          imageSmoothingQuality: 'high' // Use high quality smoothing
        });
        
        // Set high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Initial HIGH QUALITY frame
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.floor(targetWidth / 40)}px Arial`; // Responsive font size
        ctx.textAlign = 'center';
        ctx.fillText('Initializing HIGH QUALITY Stream...', canvas.width / 2, canvas.height / 2);
        
        // Create HIGH FRAME RATE stream
        const targetFPS = parseInt(frameRate.value) || 30;
        const canvasStream = canvas.captureStream(targetFPS);
        
        // Verify stream is working
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error('ไม่สามารถสร้าง video track จาก canvas ได้');
        }
        
        console.log('📹 HIGH QUALITY Canvas stream verification:', {
          id: canvasStream.id,
          active: canvasStream.active,
          resolution: `${targetWidth}x${targetHeight}`,
          fps: targetFPS,
          videoTrack: {
            kind: videoTrack.kind,
            label: videoTrack.label,
            enabled: videoTrack.enabled,
            readyState: videoTrack.readyState,
            settings: videoTrack.getSettings()
          }
        });
        
        // Store for recording
        window.captureCanvas = canvas;
        window.captureContext = ctx;
        window.captureTarget = document.querySelector('.aspect-video') || document.body;
        window.currentScreenStream = canvasStream;
        window.targetResolution = { width: targetWidth, height: targetHeight };
        window.targetFPS = targetFPS;
        
        console.log('✅ HIGH QUALITY canvas capture ready');
        
      } catch (error) {
        console.error('❌ Error setting up HIGH QUALITY canvas capture:', error);
        throw error;
      }
    };

    const startDOMCapture = async () => {
      if (!window.captureCanvas || !window.captureTarget || !window.captureContext) {
        console.error('❌ DOM capture not properly initialized');
        return;
      }
      
      const canvas = window.captureCanvas;
      const ctx = window.captureContext;
      
      console.log('🎬 Starting Real Preview Capture...');
      console.log('📐 Canvas size:', canvas.width, 'x', canvas.height);
      
      let frameCount = 0;
      
      // HIGH QUALITY preview capture function
      const captureFrame = () => {
        try {
          frameCount++;
          
          // Clear canvas with black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Enable HIGH QUALITY rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Get the actual preview video elements
          const screenVideo = screenPreview.value;
          const webcamVideo = webcamPreview.value;
          
          // Draw screen share video with HIGH QUALITY if available
          if (screenVideo && screenVideo.videoWidth > 0 && screenVideo.videoHeight > 0) {
            // Calculate aspect ratio and positioning for screen video
            const videoAspect = screenVideo.videoWidth / screenVideo.videoHeight;
            const canvasAspect = canvas.width / canvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (videoAspect > canvasAspect) {
              // Video is wider - fit to canvas width
              drawWidth = canvas.width;
              drawHeight = canvas.width / videoAspect;
              drawX = 0;
              drawY = (canvas.height - drawHeight) / 2;
            } else {
              // Video is taller - fit to canvas height
              drawHeight = canvas.height;
              drawWidth = canvas.height * videoAspect;
              drawX = (canvas.width - drawWidth) / 2;
              drawY = 0;
            }
            
            // HIGH QUALITY drawing with anti-aliasing
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw the screen video with high quality
            ctx.drawImage(screenVideo, drawX, drawY, drawWidth, drawHeight);
            
            ctx.restore();
            
            if (frameCount % 60 === 0) { // Log every 60 frames (2 seconds)
              console.log(`📺 HIGH QUALITY Screen video drawn: ${drawWidth}x${drawHeight} at (${drawX}, ${drawY})`);
            }
          } else {
            // No screen video - draw HIGH QUALITY placeholder
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const fontSize = Math.floor(canvas.width / 25); // Responsive font size
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('No Screen Share', canvas.width / 2, canvas.height / 2 - fontSize/2);
            
            const smallFontSize = Math.floor(fontSize * 0.6);
            ctx.font = `${smallFontSize}px Arial`;
            ctx.fillStyle = '#9ca3af';
            ctx.fillText('Select screen to start recording', canvas.width / 2, canvas.height / 2 + fontSize/2);
          }
          
          // Draw HIGH QUALITY webcam overlay if available
          if (isWebcamEnabled.value && webcamVideo && webcamVideo.videoWidth > 0 && webcamVideo.videoHeight > 0) {
            // Calculate webcam size based on canvas resolution
            const baseSize = Math.min(canvas.width, canvas.height) * 0.15; // 15% of smallest dimension
            let webcamWidth, webcamHeight;
            
            switch (webcamSize.value) {
              case 'small':
                webcamWidth = baseSize * 0.7;
                webcamHeight = baseSize * 0.7 * (3/4); // 4:3 aspect ratio
                break;
              case 'medium':
                webcamWidth = baseSize;
                webcamHeight = baseSize * (3/4);
                break;
              case 'large':
                webcamWidth = baseSize * 1.4;
                webcamHeight = baseSize * 1.4 * (3/4);
                break;
              default:
                webcamWidth = baseSize;
                webcamHeight = baseSize * (3/4);
            }
            
            // Calculate webcam position with proper margins
            let webcamX, webcamY;
            const margin = Math.floor(Math.min(canvas.width, canvas.height) * 0.02); // 2% margin
            
            switch (webcamPosition.value) {
              case 'top-left':
                webcamX = margin;
                webcamY = margin;
                break;
              case 'top-right':
                webcamX = canvas.width - webcamWidth - margin;
                webcamY = margin;
                break;
              case 'bottom-left':
                webcamX = margin;
                webcamY = canvas.height - webcamHeight - margin;
                break;
              case 'bottom-right':
              default:
                webcamX = canvas.width - webcamWidth - margin;
                webcamY = canvas.height - webcamHeight - margin;
            }
            
            // Draw HIGH QUALITY webcam border
            const borderWidth = Math.max(2, Math.floor(canvas.width / 400)); // Responsive border
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(webcamX - borderWidth, webcamY - borderWidth, 
                        webcamWidth + (borderWidth * 2), webcamHeight + (borderWidth * 2));
            
            // Draw HIGH QUALITY webcam video with anti-aliasing
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(webcamVideo, webcamX, webcamY, webcamWidth, webcamHeight);
            
            ctx.restore();
            
            if (frameCount % 60 === 0) { // Log every 60 frames
              console.log(`📷 HIGH QUALITY Webcam drawn: ${Math.floor(webcamWidth)}x${Math.floor(webcamHeight)} at (${Math.floor(webcamX)}, ${Math.floor(webcamY)})`);
            }
          }
          
          // Draw HIGH QUALITY recording indicator if recording
          if (isRecording.value) {
            const time = Date.now() / 1000;
            const pulse = Math.sin(time * 4) * 0.3 + 0.7;
            
            const indicatorSize = Math.floor(canvas.width / 60); // Responsive indicator size
            const textSize = Math.floor(canvas.width / 50);
            
            // Recording dot
            ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.beginPath();
            ctx.arc(indicatorSize * 2, indicatorSize * 2, indicatorSize, 0, 2 * Math.PI);
            ctx.fill();
            
            // REC text
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${textSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText('REC', indicatorSize * 4, indicatorSize * 2.5);
            
            // Time display
            ctx.fillText(recordingTime.value, indicatorSize * 8, indicatorSize * 2.5);
          }
          
          // Debug info (scaled to resolution)
          const debugSize = Math.floor(canvas.width / 80);
          ctx.fillStyle = '#ffffff';
          ctx.font = `${debugSize}px Arial`;
          ctx.textAlign = 'right';
          ctx.fillText(`Frame: ${frameCount}`, canvas.width - 10, debugSize + 10);
          ctx.fillText(`${canvas.width}x${canvas.height}`, canvas.width - 10, debugSize * 2 + 15);
          ctx.fillText(new Date().toLocaleTimeString(), canvas.width - 10, debugSize * 3 + 20);
          
          if (frameCount % 30 === 0) { // Log every 30 frames (1 second)
            console.log(`📹 HIGH QUALITY frame ${frameCount} captured at ${canvas.width}x${canvas.height}`);
          }
          
        } catch (error) {
          console.error('⚠️ Frame capture error:', error);
          
          // Fallback - red screen with error
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Recording Error', canvas.width / 2, canvas.height / 2);
          ctx.font = '14px Arial';
          ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 30);
        }
      };
      
      // Start capturing at user-selected FPS
      const targetFPS = window.targetFPS || 30;
      const frameInterval = 1000 / targetFPS; // Calculate interval in milliseconds
      
      window.domCaptureInterval = setInterval(captureFrame, frameInterval);
      
      // Initial frame
      captureFrame();
      
      console.log(`✅ HIGH QUALITY capture started at ${targetFPS} FPS (${frameInterval}ms interval) with resolution ${canvas.width}x${canvas.height}`);
    };
    
    const toggleWebcam = async () => {
      try {
        if (!isWebcamEnabled.value) {
          console.log('📷 Starting webcam...');
          
          // Request webcam access
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 }
            },
            audio: false // Audio will be handled by screen recording
          });
          
          console.log('📷 Webcam started successfully');
          isWebcamEnabled.value = true;
          
          // Store webcam stream
          window.currentWebcamStream = webcamStream;
          
          // Wait for DOM update then connect stream to video element
          await nextTick();
          
          if (webcamPreview.value) {
            console.log('🎬 Connecting webcam stream to video element');
            webcamPreview.value.srcObject = webcamStream;
            
            // Force video to play
            try {
              await webcamPreview.value.play();
              console.log('✅ Webcam video started playing');
            } catch (playError) {
              console.warn('⚠️ Webcam video play error:', playError);
            }
          } else {
            console.error('❌ Webcam preview element not found');
          }
          
          // Listen for when webcam is stopped
          webcamStream.getVideoTracks()[0].onended = () => {
            console.log('📷 Webcam ended');
            isWebcamEnabled.value = false;
            window.currentWebcamStream = null;
            
            // Clear video element
            if (webcamPreview.value) {
              webcamPreview.value.srcObject = null;
            }
          };
          
        } else {
          console.log('📷 Stopping webcam...');
          
          // Stop webcam
          if (window.currentWebcamStream) {
            window.currentWebcamStream.getTracks().forEach(track => track.stop());
            window.currentWebcamStream = null;
          }
          
          // Clear video element
          if (webcamPreview.value) {
            webcamPreview.value.srcObject = null;
          }
          
          isWebcamEnabled.value = false;
        }
        
      } catch (error) {
        console.error('❌ Error with webcam:', error);
        
        if (error.name === 'NotAllowedError') {
          alert('กรุณาอนุญาตให้เข้าถึงกล้องเพื่อใช้งานฟีเจอร์นี้');
        } else if (error.name === 'NotFoundError') {
          alert('ไม่พบกล้องในเครื่องของคุณ');
        } else {
          alert('เกิดข้อผิดพลาดในการเปิดกล้อง: ' + error.message);
        }
      }
    };
    
    const toggleAudio = () => {
      includeAudio.value = !includeAudio.value;
      if (!includeAudio.value) stopMic(); else startMic();
    };

    const refreshAudioDevices = async () => {
      // Kept for compatibility (no-op now)
      if (includeAudio.value) startMic();
    };

  const startMic = async () => {
      try {
        stopMic();
        if (!includeAudio.value) return;
        audioError.value = '';
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(analyser);
        const updateLevel = () => {
          // ตรวจสอบว่า analyser ยังพร้อมใช้งานหรือไม่
          if (!analyser) {
            console.warn('Audio analyser is null, stopping audio level updates');
            return;
          }
          
          analyser.getByteFrequencyData(dataArray);
          // Calculate average
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length; // 0 - 255
          audioLevel.value = avg / 255;
          // Color gradient (green -> yellow -> red)
          if (audioLevel.value < 0.4) audioLevelColor.value = '#16a34a';
          else if (audioLevel.value < 0.7) audioLevelColor.value = '#f59e0b';
          else audioLevelColor.value = '#dc2626';
          
          // ตรวจสอบอีกครั้งก่อนขอ animation frame ใหม่
          if (analyser) {
            levelRaf = requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
      } catch (e) {
        console.error('Mic start error:', e);
        audioError.value = e.message || 'เปิดไมโครโฟนไม่ได้';
      }
    };

    const stopMic = () => {
      // หยุด animation frame ก่อน
      if (levelRaf) {
        cancelAnimationFrame(levelRaf);
        levelRaf = null;
      }
      
      // Clear analyser ก่อนจะหยุด mic stream
      if (analyser) { 
        try { 
          analyser.disconnect(); 
        } catch(e) { 
          console.warn('Error disconnecting analyser:', e);
        } 
        analyser = null; 
      }
      
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
      }
      
      if (micSource) { 
        try { 
          micSource.disconnect(); 
        } catch(e) { 
          console.warn('Error disconnecting mic source:', e);
        } 
        micSource = null; 
      }
      
      audioLevel.value = 0;
    };
  // (No device selection watching needed now)

  onMounted(() => { if (includeAudio.value) startMic(); });
    
  const startRecording = async () => {
      if (!isScreenSharing.value) {
        alert('กรุณาเลือกหน้าจอก่อนเริ่มบันทึก');
        return;
      }

      try {
        console.log('🔴 Starting enhanced canvas recording...');
        
        // Ensure DOM capture is setup
        if (!window.currentScreenStream) {
          console.log('⚠️ Recreating canvas stream...');
          await setupPreviewSectionCapture();
        }
        
        // Start DOM capture animation first
        await startDOMCapture();
        
        // Wait for a few frames to be generated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the canvas capture stream
        let recordingStream = window.currentScreenStream;

        // Merge audio tracks (mic + optional system) if requested
        if (includeAudio.value) {
          const combinedStream = new MediaStream();
          recordingStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
          if (micStream) micStream.getAudioTracks().forEach(t => combinedStream.addTrack(t));
          // (Optional) system audio not added automatically due to UX; user must re-share screen with audio if needed.
          recordingStream = combinedStream;
        }
        
        if (!recordingStream) {
          throw new Error('ไม่พบ canvas stream สำหรับบันทึก');
        }
        
        if (!recordingStream.active) {
          throw new Error('Canvas stream ไม่ทำงาน');
        }
        
        const tracks = recordingStream.getTracks();
        const videoTrack = tracks.find(t => t.kind === 'video');
        
        if (!videoTrack) {
          throw new Error('ไม่พบ video track ใน canvas stream');
        }
        
        if (videoTrack.readyState !== 'live') {
          throw new Error('Video track ไม่พร้อมใช้งาน');
        }
        
        console.log('📹 Recording stream verified:', {
          streamId: recordingStream.id,
          active: recordingStream.active,
          videoTrack: {
            id: videoTrack.id,
            kind: videoTrack.kind,
            label: videoTrack.label,
            enabled: videoTrack.enabled,
            readyState: videoTrack.readyState,
            settings: videoTrack.getSettings()
          }
        });
        
        // HIGH QUALITY recording options based on resolution
        const getRecordingOptions = () => {
          const resolution = window.targetResolution || { width: 1280, height: 720 };
          const fps = window.targetFPS || 30;
          
          // Calculate optimal bitrate based on resolution and FPS
          const pixels = resolution.width * resolution.height;
          const baseBitrate = Math.floor(pixels * 0.15); // 0.15 bits per pixel
          const fpsMultiplier = fps / 30; // Adjust for frame rate
          const targetBitrate = Math.floor(baseBitrate * fpsMultiplier);
          
          console.log('📊 Calculating optimal bitrate:', {
            resolution: `${resolution.width}x${resolution.height}`,
            fps: fps,
            pixels: pixels,
            targetBitrate: `${Math.floor(targetBitrate / 1000000)}Mbps`
          });
          
          return [
            {
              mimeType: 'video/webm;codecs=vp9,opus',
              videoBitsPerSecond: Math.max(targetBitrate, 5000000), // Minimum 5 Mbps
              audioBitsPerSecond: 128000, // High quality audio
            },
            {
              mimeType: 'video/webm;codecs=vp8,opus',
              videoBitsPerSecond: Math.max(targetBitrate * 0.8, 4000000), // Slightly lower for VP8
              audioBitsPerSecond: 128000,
            },
            {
              mimeType: 'video/webm;codecs=h264,opus',
              videoBitsPerSecond: Math.max(targetBitrate, 5000000),
              audioBitsPerSecond: 128000,
            },
            {
              mimeType: 'video/webm',
              videoBitsPerSecond: Math.max(targetBitrate * 0.7, 3000000), // Fallback
              audioBitsPerSecond: 128000,
            }
          ];
        };
        
        // Try HIGH QUALITY recording options
        const recordingOptions = getRecordingOptions();
        
        let selectedOptions = null;
        for (const option of recordingOptions) {
          if (MediaRecorder.isTypeSupported(option.mimeType)) {
            selectedOptions = option;
            console.log('✅ Selected HIGH QUALITY codec:', option.mimeType, `${Math.floor(option.videoBitsPerSecond / 1000000)}Mbps`);
            break;
          }
        }
        
        if (!selectedOptions) {
          throw new Error('ไม่พบรูปแบบวีดีโอที่รองรับในเบราว์เซอร์นี้');
        }
        
        console.log('✅ Selected recording options:', selectedOptions);
        
        // Store recording settings globally
        window.recordingSettings = selectedOptions;
        
        // Use VideoChunkManager instead of traditional MediaRecorder
        console.log('🎬 Starting chunk-based recording with VideoChunkManager...');
        
        try {
          const sessionId = await segmentManager.startRecording(recordingStream, selectedOptions);
          console.log('✅ Chunk recording started with session:', sessionId);
          
          // Store reference for cleanup
          window.currentChunkManager = segmentManager;
          
        } catch (chunkError) {
          console.error('❌ Chunk recording failed:', chunkError);
          throw new Error('การเริ่ม chunk recording ล้มเหลว: ' + chunkError.message);
        }
        
        isRecording.value = true;
        recordingStartTime.value = Date.now();
        
        recordingTimer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - recordingStartTime.value) / 1000);
          const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
          const seconds = (elapsed % 60).toString().padStart(2, '0');
          recordingTime.value = `${minutes}:${seconds}`;
          
          // Get size from chunk manager instead of blobs
          const status = segmentManager.getStatus();
          estimatedSize.value = status.totalSizeMB;
          
          // Log detailed progress every 5 seconds
          if (elapsed % 5 === 0 && elapsed > 0) {
            console.log(`📊 Recording status: ${recordingTime.value}, ${status.totalSizeMB}MB, ${status.uploadedChunks} chunks uploaded, ${status.failedChunks} failed`);
          }
          
          // Auto-stop after 30 minutes for safety
          if (elapsed >= 1800) { // 30 minutes
            console.log('⏰ Auto-stopping after 30 minutes');
            stopRecording();
            alert('หยุดการบันทึกอัตโนมัติหลัง 30 นาที');
          }
        }, 1000);
        
        console.log('✅ Enhanced canvas recording started successfully');
        
      } catch (error) {
        console.error('❌ Error starting canvas recording:', error);
        alert('เกิดข้อผิดพลาดในการเริ่มบันทึก: ' + error.message);
        
        // Cleanup on error
        if (window.domCaptureInterval) {
          clearInterval(window.domCaptureInterval);
          window.domCaptureInterval = null;
        }
        isRecording.value = false;
      }
    };
    
    const stopRecording = async () => {
      if (!isRecording.value) return;
      
      console.log('⏹️ Stopping chunk-based recording...');
      
      // Stop chunk manager
      if (window.currentChunkManager) {
        try {
          await window.currentChunkManager.stopRecording();
          console.log('✅ Chunk recording stopped successfully');
        } catch (error) {
          console.error('❌ Error stopping chunk recording:', error);
        }
      }
      
      // Stop timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
      
      // Stop DOM capture if active
      if (window.domCaptureInterval) {
        clearInterval(window.domCaptureInterval);
        window.domCaptureInterval = null;
        console.log('🛑 DOM capture stopped');
      }
      
      isRecording.value = false;
      isPaused.value = false;
    };

  const cleanup = () => {
      // Clean up VideoChunkManager
      if (segmentManager) {
        segmentManager.cleanup();
      }
      
      // Clean up DOM capture resources
      if (window.domCaptureInterval) {
        clearInterval(window.domCaptureInterval);
        window.domCaptureInterval = null;
      }
      
      if (window.captureCanvas) {
        // Remove canvas from DOM if it was added
        if (window.captureCanvas.parentNode) {
          window.captureCanvas.parentNode.removeChild(window.captureCanvas);
        }
        window.captureCanvas = null;
      }
      
      if (window.captureTarget) {
        window.captureTarget = null;
      }
      
      if (window.captureContext) {
        window.captureContext = null;
      }
      
      // Clean up recording stream (DOM capture)
      if (window.currentScreenStream) {
        window.currentScreenStream.getTracks().forEach(track => track.stop());
        window.currentScreenStream = null;
      }
      
      // Clean up preview stream (screen share)
      if (window.previewStream) {
        window.previewStream.getTracks().forEach(track => track.stop());
        window.previewStream = null;
      }
      
      // Clean up webcam stream
      if (window.currentWebcamStream) {
        window.currentWebcamStream.getTracks().forEach(track => track.stop());
        window.currentWebcamStream = null;
      }
      
      // Reset states
      isScreenSharing.value = false;
      isWebcamEnabled.value = false;
      selectedScreen.value = '';
      window.captureMode = null;

      // Audio cleanup
      stopMic();
      if (audioContext) {
        try { audioContext.close(); } catch(e) { /* ignore */ }
        audioContext = null;
      }
      
      // Clear chunk manager reference
      window.currentChunkManager = null;
    };

    const handleRecordingComplete = async () => {
      try {
        console.log('📁 Processing recorded video...');
        console.log('📦 Checking recorded blobs...');
        
        // Check if blobs exist
        if (!window.recordedBlobs) {
          console.error('❌ No recordedBlobs found');
          throw new Error('ไม่พบข้อมูลการบันทึก - การบันทึกอาจไม่เริ่มต้นได้');
        }
        
        if (!Array.isArray(window.recordedBlobs)) {
          console.error('❌ recordedBlobs is not an array:', typeof window.recordedBlobs);
          throw new Error('ข้อมูลการบันทึกผิดพลาด');
        }
        
        if (window.recordedBlobs.length === 0) {
          console.error('❌ No blobs recorded');
          throw new Error('ไม่มีข้อมูลวิดีโอที่บันทึก - ลองบันทึกใหม่อีกครั้ง');
        }
        
        console.log('📦 Total blobs:', window.recordedBlobs.length);
        console.log('📦 Blob sizes:', window.recordedBlobs.map(blob => blob.size));
        
        // Get MIME type from recording settings
        const mimeType = window.recordingSettings?.mimeType || 'video/webm';
        console.log('🎬 Creating blob with MIME type:', mimeType);
        
        // Create blob with proper MIME type
        const blob = new Blob(window.recordedBlobs, { type: mimeType });
        const fileSize = Math.round(blob.size / 1024 / 1024 * 100) / 100;
        
        console.log('📊 Blob created:', {
          size: `${fileSize} MB`,
          type: blob.type,
          blobs: window.recordedBlobs.length
        });
        
        // Validate blob
        if (blob.size === 0) {
          throw new Error('ไฟล์วิดีโอมีขนาด 0 ไบต์ - การบันทึกอาจมีปัญหา');
        }
        
        // Generate filename with proper extension
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const duration = recordingTime.value.replace(/:/g, 'm') + 's';
        
        // Determine file extension from MIME type
        let extension = 'webm';
        if (mimeType.includes('mp4')) extension = 'mp4';
        else if (mimeType.includes('webm')) extension = 'webm';
        
        const filename = `screen-recording-${timestamp}-${duration}.${extension}`;
        
        console.log('💾 Preparing video data:', {
          filename,
          size: `${fileSize} MB`,
          duration: recordingTime.value,
          mimeType
        });
        
        // Store video data for user decision
        recordedVideoData.value = {
          blob: blob,
          filename: filename,
          size: fileSize,
          duration: recordingTime.value,
          mimeType: mimeType,
          extension: extension,
          url: URL.createObjectURL(blob)
        };
        
        // Show post-recording modal instead of auto-downloading
        showPostRecordingModal.value = true;
        
        // Start modal timeout (5 minutes)
        startModalTimeout();
        
        console.log('✅ Recording data prepared successfully');
        
      } catch (error) {
        console.error('❌ Error processing recording:', error);
        alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์:\n${error.message}\n\nลองบันทึกใหม่อีกครั้ง`);
        
        // Clean up on error
        if (window.recordedBlobs) {
          window.recordedBlobs = [];
        }
        
        emit('recorded', {
          success: false,
          error: error.message
        });
      }
    };
    
    /**
     * Handle completion from VideoChunkManager
     */
    const handleSessionComplete = async (finalVideo) => {
      try {
        console.log('🎉 Session completed with final video:', finalVideo);
        
        if (segmentManager.useDummyServer) {
          // Dummy server mode
          recordedVideoData.value = {
            filename: `dummy_recording_${segmentManager.sessionId}.png`,
            size: Math.round(segmentManager.totalUploadedSize / 1024 / 1024 * 100) / 100,
            duration: recordingTime.value,
            mimeType: 'image/png', // Dummy format
            extension: 'png',
            url: finalVideo.finalVideoUrl,
            serverPath: finalVideo.finalVideoUrl,
            sessionId: segmentManager.sessionId,
            totalChunks: finalVideo.totalChunks,
            isDummyMode: true // Flag for dummy mode
          };
        } else {
          // Real server mode
          recordedVideoData.value = {
            filename: finalVideo.filename,
            size: finalVideo.sizeMB,
            duration: finalVideo.duration || recordingTime.value,
            mimeType: 'video/mp4', // FFmpeg output
            extension: 'mp4',
            url: `/api/media/recording/download/${segmentManager.sessionId}`, // Download URL
            serverPath: finalVideo.path,
            sessionId: segmentManager.sessionId,
            totalChunks: finalVideo.totalChunks,
            isServerGenerated: true // Flag to indicate this is server-generated
          };
        }
        
        // Show post-recording modal
        showPostRecordingModal.value = true;
        
        // Start modal timeout (5 minutes)
        startModalTimeout();
        
        console.log('✅ Session complete - ready for user action');
        
      } catch (error) {
        console.error('❌ Error handling session completion:', error);
        alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์:\n${error.message}\n\nลองบันทึกใหม่อีกครั้ง`);
        
        // Emit error event
        emit('recorded', {
          success: false,
          error: error.message
        });
      }
    };
    
    const pauseRecording = () => {
      isPaused.value = !isPaused.value;
      console.log('⏸️ Recording paused:', isPaused.value);
    };
    
    // Post-recording action handlers
    const downloadVideo = () => {
      if (!recordedVideoData.value) return;
      
      const { filename, url, isServerGenerated, isDummyMode } = recordedVideoData.value;
      
      if (isDummyMode) {
        // Dummy mode - use VideoChunkManager dummy download
        console.log('📥 Downloading dummy video file...');
        segmentManager.downloadDummyVideo(filename);
        return;
      }
      
      if (isServerGenerated) {
        // Server-generated video - use direct download link
        console.log('📥 Downloading server-generated video:', url);
        
        // Open download URL
        const downloadWindow = window.open(url, '_blank');
        if (!downloadWindow) {
          // Fallback if popup blocked
          window.location.href = url;
        }
        
      } else {
        // Client-generated blob - traditional download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      }
      
      console.log('✅ Video download initiated:', filename);
      
      // Show success message
      const message = `✅ ดาวน์โหลดสำเร็จ!\n\nไฟล์: ${recordedVideoData.value.filename}\nขนาด: ${recordedVideoData.value.size} MB\nระยะเวลา: ${recordedVideoData.value.duration}\n\n💡 ตรวจสอบโฟลเดอร์ Downloads`;
      alert(message);
      
      // Emit success event
      emit('recorded', {
        success: true,
        action: 'download',
        filename: recordedVideoData.value.filename,
        size: recordedVideoData.value.size,
        duration: recordedVideoData.value.duration,
        mimeType: recordedVideoData.value.mimeType,
        extension: recordedVideoData.value.extension,
        isServerGenerated: recordedVideoData.value.isServerGenerated
      });
      
      closePostRecordingModal();
      
      // Close the entire Screen Recorder after download
      setTimeout(() => {
        console.log('📱 Auto-closing Screen Recorder after download');
        cleanup();
        emit('close');
      }, 1000); // Give time for success message to show
    };
    
    const uploadVideo = async () => {
      if (!recordedVideoData.value) return;
      
      console.log('📤 Starting video upload via existing system:', recordedVideoData.value.filename);
      
      try {
        // Show loading state
        const uploadingToast = window.toast({ 
          type: 'pending', 
          message: `กำลังอัพโหลด ${recordedVideoData.value.filename}...` 
        });
        
        // Import useFileUpload composable
        const { useFileUpload } = await import('@/composables/useFileUpload');
        const fileUploader = useFileUpload();
        const { files, submitFiles } = fileUploader;
        
        // Import storage manager and session data
        const storageManager = await import('@/plugins/storage');
        const sessionData = storageManager.default.get('session');
        const configs = storageManager.default.get('configs');
        const schoolSession = configs;
        
        if (!sessionData || !sessionData.current) {
          throw new Error('กรุณาเข้าสู่ระบบก่อนอัพโหลด');
        }
        
        // Create compatible session structure for useFileUpload
        const session = {
          current: {
            _id: sessionData.current._id || sessionData.current.id || configs.siteID,
            spaceId: sessionData.current.spaceId || configs.spaceId
          },
          prefix: sessionData.prefix || ''
        };
        
        console.log('👤 Session structure:', {
          userId: session.current._id,
          spaceId: session.current.spaceId,
          prefix: session.prefix
        });
        
        // Setup S3 client like other components
        const { S3 } = await import('@aws-sdk/client-s3');
        const s3Client = new S3({
          forcePathStyle: false,
          endpoint: schoolSession.s3EndpointDefault,
          region: schoolSession.s3Region,
          responseContentEncoding: 'utf-8',
          credentials: {
            accessKeyId: schoolSession.s3Key,
            secretAccessKey: schoolSession.s3Secret
          }
        });
        
        // Create File object from blob
        const videoFile = new File(
          [recordedVideoData.value.blob], 
          recordedVideoData.value.filename,
          { 
            type: recordedVideoData.value.mimeType,
            lastModified: Date.now()
          }
        );
        
        // Add file status property required by upload system
        videoFile.status = 'pending';
        videoFile.progress = 0;
        
        console.log('📁 Created file object:', {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          status: videoFile.status
        });
        
        // Add file to the upload system's files array
        files.push(videoFile);
        console.log('📋 Added file to upload queue. Files count:', files.length);
        
        // Create callback functions for upload system that handle metadata ourselves
        const addFileCallback = async (payload) => {
          try {
            console.log('💾 Saving file metadata:', payload);
            
            // Get proper request key from Vue global properties like FileManager does
            
            // Use $Key from Vue global properties like FileManager does
            const $Key = instance?.appContext?.app?.config?.globalProperties?.$Key;
            
            if (!$Key) {
              throw new Error('$Key not available in Vue instance');
            }
            
            console.log('🔑 Using $Key:', $Key?.substring(0, 8) + '...');
            
            // Use Vue's global $Request from stored instance
            const $Request = instance?.appContext?.app?.config?.globalProperties?.$Request;
            
            if (!$Request) {
              throw new Error('$Request not available in Vue instance');
            }
            
            console.log('📡 Making API call to storage/ with payload:', payload);
            const response = await $Request.POST('storage/', payload, $Key);
            
            console.log('✅ File metadata saved successfully:', response.data);
            return response;
          } catch (error) {
            console.error('❌ Error saving file metadata:', error);
            throw error;
          }
        };
        
        const listFileCallback = async () => {
          console.log('� File list callback called');
          // Optional refresh logic can go here
        };
        
        const createThumbnailCallback = async (url, fileId) => {
          console.log('🖼️ Thumbnail creation for video:', url, fileId);
          // Video thumbnail creation can be added here
        };
        
        const captureThumbnailCallback = async (url, fileId) => {
          console.log('🎬 Video thumbnail capture:', url, fileId);
          // Video thumbnail capture logic
        };
        
        // Use the existing upload system
        await submitFiles(
          s3Client,
          schoolSession,
          session, // Use our fixed session structure
          configs,
          session.prefix || '',
          addFileCallback,
          listFileCallback,
          createThumbnailCallback,
          captureThumbnailCallback
        );
        
        // Hide loading toast
        uploadingToast.hide();
        
        // Show success message with file details
        const currentFolder = segmentManager.preVideoFile?.currentFolder || 'Root';
        window.toast({ 
          type: 'success', 
          message: `อัพโหลดสำเร็จ! 🎉\n📁 ไฟล์: ${recordedVideoData.value.filename}\n📂 โฟลเดอร์: ${currentFolder}\n📊 ขนาด: ${recordedVideoData.value.size} MB\n⏱️ ระยะเวลา: ${recordedVideoData.value.duration}\n✅ ไฟล์พร้อมใช้งานในระบบแล้ว` 
        });
        
        console.log('🎬 Video uploaded successfully:', {
          fileName: recordedVideoData.value.filename,
          fileSize: recordedVideoData.value.size + ' MB',
          duration: recordedVideoData.value.duration,
          s3Path: `https://vue-project.sgp1.digitaloceanspaces.com/2025/09/${recordedVideoData.value.filename}`,
          databaseId: 'Saved in database'
        });
        
        // Emit success event for parent component
        emit('recorded', {
          success: true,
          action: 'upload',
          file: videoFile,
          filename: recordedVideoData.value.filename,
          size: recordedVideoData.value.size,
          duration: recordedVideoData.value.duration,
          mimeType: recordedVideoData.value.mimeType,
          extension: recordedVideoData.value.extension
        });
        
        console.log('🎉 Video upload completed successfully via existing system!');
        
        // Close the entire Screen Recorder after successful upload
        setTimeout(() => {
          console.log('📱 Auto-closing Screen Recorder after successful upload');
          cleanup();
          emit('close');
        }, 1000); // Give time for success message to show
        
      } catch (error) {
        console.error('❌ Upload failed:', error);
        
        window.toast({ 
          type: 'error', 
          message: `อัพโหลดล้มเหลว! ข้อผิดพลาด: ${error.message} กรุณาลองใหม่อีกครั้ง` 
        });
        
        // Emit error event
        emit('recorded', {
          success: false,
          action: 'upload',
          error: error.message,
          filename: recordedVideoData.value.filename
        });
      }
      
      // Close post-recording modal regardless of outcome
      closePostRecordingModal();
    };
    
    const closePostRecordingModal = () => {
      // Clear timeout if active
      if (modalTimeout.value) {
        clearInterval(modalTimeout.value);
        modalTimeout.value = null;
      }
      
      // Clean up video data URL
      if (recordedVideoData.value?.url) {
        URL.revokeObjectURL(recordedVideoData.value.url);
      }
      
      // Clear data
      recordedVideoData.value = null;
      showPostRecordingModal.value = false;
      timeoutCountdown.value = 300; // Reset countdown
      
      // Clear recording data
      setTimeout(() => {
        window.recordedBlobs = [];
        window.recordingSettings = null;
        console.log('🧹 Recording data cleaned up');
      }, 1000);
      
      // Reset UI
      recordingTime.value = '00:00';
      estimatedSize.value = 0;
      
      // Note: We don't auto-close the main modal here anymore
      // Main modal will be closed by specific actions (upload success, download, etc.)
    };
    
    const startModalTimeout = () => {
      timeoutCountdown.value = 300; // 5 minutes
      
      modalTimeout.value = setInterval(() => {
        timeoutCountdown.value--;
        
        if (timeoutCountdown.value <= 0) {
          console.log('⏰ Modal timeout reached - auto closing');
          alert('หมดเวลาในการเลือก วิดีโอที่บันทึกจะสูญหาย');
          closePostRecordingModal();
        }
      }, 1000);
    };
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Cleanup on unmount
    onBeforeUnmount(() => {
      if (recordingTimer) clearInterval(recordingTimer);
      cleanup();
    });
    
  return {
      // Refs
      screenPreview,
      webcamPreview,
      
      // State
      isRecording,
      isPaused,
      recordingTime,
      estimatedSize,
      isScreenSharing,
      selectedScreen,
      isWebcamEnabled,
      webcamPosition,
      webcamSize,
  includeAudio,
  recordingQuality,
  frameRate,
  showSettingsPanel,
      
      // Computed
      chunkStatus,
      
      // Post-recording state
      showPostRecordingModal,
      recordedVideoData,
      modalTimeout,
      timeoutCountdown,
      
      // Methods
      initializeNewSession,  // เพิ่ม method สำหรับสร้าง session ใหม่
      closeModal,
      selectScreen,
      toggleWebcam,
      toggleAudio,
  refreshAudioDevices,
  captureSystemAudio,
  audioLevel,
  audioLevelColor,
  audioError,
      startRecording,
      stopRecording,
      pauseRecording,
  handleRecordingComplete,
  cleanup,
      
      // Post-recording methods
      downloadVideo,
      uploadVideo,
      closePostRecordingModal,
      startModalTimeout,
      formatTime
    };
  }
};
</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16 / 9;
}
/* Basic utility styles without @apply (fallback if Tailwind not processed in SFC scope) */
.rec-btn { display:inline-flex; align-items:center; gap:0.375rem; padding:0.375rem 0.75rem; border-radius:0.375rem; font-size:0.75rem; font-weight:500; line-height:1; transition:background-color .15s, color .15s, opacity .15s; user-select:none; }
.rec-btn:disabled { opacity:.5; cursor:not-allowed; }
.btn-primary { background:#2563eb; color:#fff; }
.btn-primary:hover { background:#1d4ed8; }
.btn-secondary { background:#e5e7eb; color:#374151; }
.btn-secondary:hover { background:#d1d5db; }
.btn-green { background:#16a34a; color:#fff; }
.btn-green:hover { background:#15803d; }
.btn-blue { background:#4f46e5; color:#fff; }
.btn-blue:hover { background:#4338ca; }
.btn-info { background:#0ea5e9; color:#fff; }
.btn-info:hover { background:#0284c7; }
.btn-danger { background:#dc2626; color:#fff; }
.btn-danger:hover { background:#b91c1c; }
.btn-dark { background:#374151; color:#fff; }
.btn-dark:hover { background:#1f2937; }
.btn-warn { background:#f59e0b; color:#fff; }
.btn-warn:hover { background:#d97706; }

.slide-enter-active, .slide-leave-active { transition: transform .25s ease, opacity .25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); opacity:0; }
</style>
