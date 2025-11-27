<template>
  <AIModalBase
    :title="'AI ประมวลผล: พากย์เสียง'"
    :icon-class="'fas fa-microphone text-purple-600'"
    :progress="progress"
    :status="status"
    :result-message="resultMessage"
    @close="$emit('close')"
  >
    <template #content>
      <!-- Step Indicator -->
      <div class="flex items-center mb-6 bg-purple-50 rounded-lg p-4">
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
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span class="text-sm font-medium text-purple-800">พากย์เสียง</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">4</div>
            <span class="text-sm text-gray-600">แก้เสียง</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Target Languages -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-globe text-green-600 mr-1"></i>
            ภาษาที่จะสร้างเสียงพากย์
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label 
              v-for="lang in availableLanguages" 
              :key="lang.code"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              :class="{ 'border-purple-500 bg-purple-50': selectedLanguages.includes(lang.code) }"
            >
              <input 
                type="checkbox" 
                :value="lang.code" 
                v-model="selectedLanguages"
                class="rounded text-purple-600"
              />
              <div class="flex items-center space-x-2">
                <span class="text-lg">{{ lang.flag }}</span>
                <span class="text-sm font-medium">{{ lang.name }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Voice Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-user-friends text-blue-600 mr-1"></i>
            ประเภทเสียง
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   :class="{ 'border-purple-500 bg-purple-50': voiceType === 'female' }">
              <input type="radio" v-model="voiceType" value="female" />
              <div>
                <div class="font-medium">👩 เสียงผู้หญิง</div>
                <div class="text-xs text-gray-600">นุ่มนวล เหมาะสำหรับเนื้อหาทั่วไป</div>
              </div>
            </label>
            
            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   :class="{ 'border-purple-500 bg-purple-50': voiceType === 'male' }">
              <input type="radio" v-model="voiceType" value="male" />
              <div>
                <div class="font-medium">👨 เสียงผู้ชาย</div>
                <div class="text-xs text-gray-600">มั่นคง เหมาะสำหรับเนื้อหาเป็นทางการ</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Voice Settings -->
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-tachometer-alt text-orange-600 mr-1"></i>
              ความเร็วในการพูด
            </label>
            <div class="space-y-2">
              <input 
                type="range" 
                v-model="voiceSpeed" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>ช้า (0.5x)</span>
                <span class="font-medium">{{ voiceSpeed }}x</span>
                <span>เร็ว (2.0x)</span>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-music text-pink-600 mr-1"></i>
              ระดับเสียง (Pitch)
            </label>
            <div class="space-y-2">
              <input 
                type="range" 
                v-model="voicePitch" 
                min="-12" 
                max="12" 
                step="1" 
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>ต่ำ (-12)</span>
                <span class="font-medium">{{ voicePitch > 0 ? '+' : '' }}{{ voicePitch }}</span>
                <span>สูง (+12)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Format -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-file-audio text-green-600 mr-1"></i>
            รูปแบบไฟล์เสียงที่ต้องการ
          </label>
          <div class="grid grid-cols-3 gap-3">
            <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   :class="{ 'border-purple-500 bg-purple-50': audioFormat === 'mp3' }">
              <input type="radio" v-model="audioFormat" value="mp3" />
              <span class="text-sm font-medium">MP3</span>
            </label>
            <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   :class="{ 'border-purple-500 bg-purple-50': audioFormat === 'wav' }">
              <input type="radio" v-model="audioFormat" value="wav" />
              <span class="text-sm font-medium">WAV</span>
            </label>
            <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                   :class="{ 'border-purple-500 bg-purple-50': audioFormat === 'aac' }">
              <input type="radio" v-model="audioFormat" value="aac" />
              <span class="text-sm font-medium">AAC</span>
            </label>
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
            :disabled="selectedLanguages.length === 0"
            class="px-4 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-play text-xs"></i>
            <span>เริ่มประมวลผล</span>
          </button>
          <button 
            v-if="progress >= 100"
            @click="$emit('next-step', 'audiofix')"
            class="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5"
          >
            <span>ไปขั้นตอนถัดไป</span>
            <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </template>
  </AIModalBase>
</template>

<script>
import AIModalBase from './AIModalBase.vue';

export default {
  name: 'VoiceOverModal',
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
  emits: ['close', 'start-process', 'next-step'],
  data() {
    return {
      selectedLanguages: [],
      voiceType: 'female',
      voiceSpeed: 1.0,
      voicePitch: 0,
      audioFormat: 'mp3',
      availableLanguages: [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'my', name: 'Myanmar', flag: '🇲🇲' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      ]
    };
  },
  computed: {
    estimatedTime() {
      const baseTime = this.selectedLanguages.length * 45; // 45 seconds per language
      return `${Math.ceil(baseTime / 60)} นาที`;
    },
    resultMessage() {
      if (this.progress >= 100) {
        return `สร้างเสียงพากย์เสร็จสิ้น ทั้งหมด ${this.selectedLanguages.length} ไฟล์`;
      }
      return '';
    }
  },
  methods: {
    startProcess() {
      const options = {
        selectedLanguages: this.selectedLanguages,
        voiceType: this.voiceType,
        voiceSpeed: this.voiceSpeed,
        voicePitch: this.voicePitch,
        audioFormat: this.audioFormat
      };
      this.$emit('start-process', options);
    }
  }
};
</script>