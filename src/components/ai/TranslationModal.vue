<template>
  <AIModalBase
    :title="'AI ประมวลผล: แปลภาษา'"
    :icon-class="'fas fa-language text-blue-600'"
    :progress="progress"
    :status="status"
    :result-message="resultMessage"
    @close="$emit('close')"
  >
    <template #content>
      <!-- Step Indicator -->
      <div class="flex items-center mb-6 bg-blue-50 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">✓</div>
            <span class="text-sm text-gray-600">แกะเสียง</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span class="text-sm font-medium text-blue-800">แปลภาษา</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">3</div>
            <span class="text-sm text-gray-600">พากย์เสียง</span>
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
        <!-- Current Subtitle Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h5 class="text-sm font-semibold text-gray-800 mb-2">
            <i class="fas fa-info-circle text-blue-600 mr-1"></i>
            ข้อมูล Subtitle ปัจจุบัน
          </h5>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>🎯 คำประมาณ: <strong>45 คำ</strong></div>
            <div>🕒 ระยะเวลา: <strong>2:30 นาที</strong></div>
            <div>🏷️ ภาษาต้นฉบับ: <strong>ไทย</strong></div>
          </div>
        </div>

        <!-- Target Languages -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-globe text-green-600 mr-1"></i>
            เลือกภาษาที่ต้องการแปล
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label 
              v-for="lang in availableLanguages" 
              :key="lang.code"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              :class="{ 'border-blue-500 bg-blue-50': selectedLanguages.includes(lang.code) }"
            >
              <input 
                type="checkbox" 
                :value="lang.code" 
                v-model="selectedLanguages"
                class="rounded text-blue-600"
              />
              <div class="flex items-center space-x-2">
                <span class="text-lg">{{ lang.flag }}</span>
                <span class="text-sm font-medium">{{ lang.name }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Translation Style -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-palette text-purple-600 mr-1"></i>
            รูปแบบการแปล
          </label>
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input 
                type="radio" 
                v-model="translationStyle" 
                value="formal"
              />
              <span class="text-sm">ทางการ - เป็นทางการและสุภาพ</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                type="radio" 
                v-model="translationStyle" 
                value="casual"
              />
              <span class="text-sm">ธรรมดา - เป็นกันเองและง่าย</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                type="radio" 
                v-model="translationStyle" 
                value="technical"
              />
              <span class="text-sm">เทคนิค - เหมาะสำหรับเนื้อหาเทคนิค</span>
            </label>
          </div>
        </div>

        <!-- Advanced Options -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-cog text-gray-600 mr-1"></i>
            ตัวเลือกขั้นสูง
          </label>
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="preserveTimestamp"
                class="rounded"
              />
              <span class="text-sm">คงระยะเวลาเดิม</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="contextualTranslation"
                class="rounded"
              />
              <span class="text-sm">แปลตามบริบท</span>
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
            class="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-play text-xs"></i>
            <span>เริ่มประมวลผล</span>
          </button>
          <button 
            v-if="progress >= 100"
            @click="$emit('next-step', 'voiceover')"
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
  name: 'TranslationModal',
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
      translationStyle: 'casual',
      preserveTimestamp: true,
      contextualTranslation: true,
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
      const baseTime = this.selectedLanguages.length * 30; // 30 seconds per language
      return `${Math.ceil(baseTime / 60)} นาที`;
    },
    resultMessage() {
      if (this.progress >= 100) {
        return `แปลภาษาเสร็จสิ้น ทั้งหมด ${this.selectedLanguages.length} ภาษา`;
      }
      return '';
    }
  },
  methods: {
    startProcess() {
      const options = {
        selectedLanguages: this.selectedLanguages,
        translationStyle: this.translationStyle,
        preserveTimestamp: this.preserveTimestamp,
        contextualTranslation: this.contextualTranslation
      };
      this.$emit('start-process', options);
    }
  }
};
</script>