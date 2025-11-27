<template>
  <AIModalBase
    :title="'AI ประมวลผล: แก้ไขเสียง'"
    :icon-class="'fas fa-sliders-h text-orange-600'"
    :progress="progress"
    :status="status"
    :result-message="resultMessage"
    @close="$emit('close')"
  >
    <template #content>
      <!-- Step Indicator -->
      <div class="flex items-center mb-6 bg-orange-50 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">✓</div>
            <span class="text-sm text-gray-600">แกะเสียง</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">✓</div>
            <span class="text-sm text-gray-600">แปลภาษา</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">✓</div>
            <span class="text-sm text-gray-600">พากย์เสียง</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
            <span class="text-sm font-medium text-orange-800">แก้ไขเสียง</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Audio Files Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-file-audio text-blue-600 mr-1"></i>
            เลือกไฟล์เสียงที่ต้องการปรับแต่ง
          </label>
          <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <label 
              v-for="file in mockAudioFiles" 
              :key="file.id"
              class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input 
                type="checkbox" 
                :value="file.id" 
                v-model="selectedAudioFiles"
                class="rounded text-orange-600"
              />
              <div class="flex items-center space-x-2">
                <i class="fas fa-file-audio text-gray-500"></i>
                <span class="text-sm">{{ file.name }}</span>
                <span class="text-xs text-gray-500">({{ file.duration }})</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Enhancement Options -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-magic text-purple-600 mr-1"></i>
            การปรับปรุงคุณภาพเสียง
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="audioFixOptions" 
                value="noise_reduction"
                class="mt-1 rounded text-orange-600"
              />
              <div>
                <div class="font-medium text-gray-800">ลดเสียงรบกวน</div>
                <div class="text-xs text-gray-600">กำจัดเสียงพื้นหลัง เสียงลม</div>
              </div>
            </label>
            
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="audioFixOptions" 
                value="voice_enhance"
                class="mt-1 rounded text-orange-600"
              />
              <div>
                <div class="font-medium text-gray-800">เพิ่มความชัดเจน</div>
                <div class="text-xs text-gray-600">ปรับปรุงความชัดของเสียงพูด</div>
              </div>
            </label>
            
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="audioFixOptions" 
                value="volume_normalize"
                class="mt-1 rounded text-orange-600"
              />
              <div>
                <div class="font-medium text-gray-800">ปรับระดับเสียง</div>
                <div class="text-xs text-gray-600">ทำให้ระดับเสียงสม่ำเสมอ</div>
              </div>
            </label>
            
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="audioFixOptions" 
                value="echo_remove"
                class="mt-1 rounded text-orange-600"
              />
              <div>
                <div class="font-medium text-gray-800">ลดเสียงก้อง</div>
                <div class="text-xs text-gray-600">กำจัดเสียงสะท้อนในห้อง</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Audio EQ Settings -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-sliders-h text-green-600 mr-1"></i>
            การปรับแต่งเสียง (EQ)
          </label>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm text-gray-600 mb-2">Bass (เสียงทุ้ม)</label>
              <div class="space-y-2">
                <input 
                  type="range" 
                  v-model="audioSettings.bass" 
                  min="-10" 
                  max="10" 
                  step="1" 
                  class="w-full"
                />
                <div class="text-center text-xs text-gray-500">{{ audioSettings.bass }}dB</div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-2">Treble (เสียงแหลม)</label>
              <div class="space-y-2">
                <input 
                  type="range" 
                  v-model="audioSettings.treble" 
                  min="-10" 
                  max="10" 
                  step="1" 
                  class="w-full"
                />
                <div class="text-center text-xs text-gray-500">{{ audioSettings.treble }}dB</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Settings -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-cog text-gray-600 mr-1"></i>
            การส่งออก
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-2">รูปแบบไฟล์</label>
              <select v-model="outputFormat" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="aac">AAC</option>
                <option value="flac">FLAC</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-2">คุณภาพ</label>
              <select v-model="audioQuality" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="standard">มาตรฐาน (128kbps)</option>
                <option value="high">สูง (192kbps)</option>
                <option value="highest">สูงสุด (320kbps)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          ⚡ เวลาประมาณ: {{ estimatedTime }}
        </div>
        
        <div class="flex space-x-2">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            v-if="progress === 0"
            @click="startProcess"
            :disabled="!canStartProcess"
            class="px-4 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-play text-xs"></i>
            <span>เริ่มประมวลผล</span>
          </button>
          <button 
            v-if="progress >= 100"
            @click="$emit('complete')"
            class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5"
          >
            <i class="fas fa-check text-xs"></i>
            <span>เสร็จสิ้น</span>
          </button>
        </div>
      </div>
    </template>
  </AIModalBase>
</template>

<script>
import AIModalBase from './AIModalBase.vue';

export default {
  name: 'AudioFixModal',
  components: {
    AIModalBase
  },
  props: {
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'start-process', 'complete'],
  data() {
    return {
      selectedAudioFiles: [],
      audioFixOptions: ['noise_reduction', 'voice_enhance'],
      audioSettings: {
        bass: 0,
        treble: 0
      },
      outputFormat: 'mp3',
      audioQuality: 'high',
      mockAudioFiles: [
        { id: 1, name: 'original_thai.mp3', duration: '2:30' },
        { id: 2, name: 'voiceover_en.mp3', duration: '2:45' },
        { id: 3, name: 'voiceover_zh.mp3', duration: '2:40' },
        { id: 4, name: 'voiceover_ja.mp3', duration: '2:35' }
      ]
    };
  },
  computed: {
    canStartProcess() {
      return this.selectedAudioFiles.length > 0 || this.audioFixOptions.length > 0;
    },
    estimatedTime() {
      const fileCount = this.selectedAudioFiles.length;
      const baseTime = fileCount * 20; // 20 seconds per file
      return fileCount > 0 ? `${Math.ceil(baseTime / 60)} นาที` : '1 นาที';
    },
    resultMessage() {
      if (this.progress >= 100) {
        return `ปรับแต่งเสียงเสร็จสิ้น ทั้งหมด ${this.selectedAudioFiles.length} ไฟล์`;
      }
      return '';
    }
  },
  methods: {
    startProcess() {
      const options = {
        selectedAudioFiles: this.selectedAudioFiles,
        audioFixOptions: this.audioFixOptions,
        audioSettings: this.audioSettings,
        outputFormat: this.outputFormat,
        audioQuality: this.audioQuality
      };
      this.$emit('start-process', options);
    }
  }
};
</script>