<template>
  <AIModalBase
    :title="'AI ประมวลผล: แกะเสียง'"
    :icon-class="'fas fa-volume-up text-indigo-600'"
    :progress="progress"
    :status="status"
    :result-message="resultMessage"
    @close="$emit('close')"
  >
    <template #content>
      <!-- Step Indicator -->
      <div class="flex items-center mb-6 bg-indigo-50 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <span class="text-sm font-medium text-indigo-800">แกะเสียง</span>
          </div>
          <i class="fas fa-arrow-right text-gray-400"></i>
          <div class="flex items-center space-x-2 opacity-50">
            <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">2</div>
            <span class="text-sm text-gray-600">แปลภาษา</span>
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

      <!-- Settings -->
      <div class="space-y-6">
        <!-- Source Language -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-language text-blue-600 mr-1"></i>
            ภาษาต้นฉบับในวิดีโอ
          </label>
          <select v-model="sourceLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="th">🇹🇭 ไทย</option>
            <option value="en">🇺🇸 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="my">🇲🇲 Myanmar</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>

        <!-- Extraction Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-cogs text-purple-600 mr-1"></i>
            ประเภทการแกะเสียง
          </label>
          <div class="space-y-3">
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                v-model="extractionType" 
                value="text_only" 
                class="mt-1"
              />
              <div>
                <div class="font-medium text-gray-800">แปลงเป็นข้อความเท่านั้น</div>
                <div class="text-xs text-gray-600">สร้าง subtitle จากเสียงในวิดีโอ</div>
              </div>
            </label>
            
            <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                v-model="extractionType" 
                value="audio_text" 
                class="mt-1"
              />
              <div>
                <div class="font-medium text-gray-800">แยกไฟล์เสียง + ข้อความ</div>
                <div class="text-xs text-gray-600">ได้ทั้งไฟล์เสียงและ subtitle</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Quality Settings -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-sliders-h text-green-600 mr-1"></i>
            การปรับปรุงคุณภาพ
          </label>
          <div class="grid grid-cols-1 gap-3">
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="enhancementOptions" 
                value="noise_reduction"
                class="rounded"
              />
              <span class="text-sm text-gray-700">ลดเสียงรบกวน</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="enhancementOptions" 
                value="voice_clarity"
                class="rounded"
              />
              <span class="text-sm text-gray-700">เพิ่มความชัดเจนของเสียง</span>
            </label>
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="enhancementOptions" 
                value="auto_punctuation"
                class="rounded"
              />
              <span class="text-sm text-gray-700">เติมเครื่องหมายวรรคตอนอัตโนมัติ</span>
            </label>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          ⚡ เวลาประมาณ: 2-5 นาที (ขึ้นอยู่กับความยาววิดีโอ)
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
            class="px-4 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors flex items-center space-x-1.5"
          >
            <i class="fas fa-play text-xs"></i>
            <span>เริ่มประมวลผล</span>
          </button>
          <button 
            v-if="progress >= 100"
            @click="$emit('next-step', 'translate')"
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
  name: 'AudioExtractModal',
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
      sourceLanguage: 'th',
      extractionType: 'text_only',
      enhancementOptions: ['noise_reduction', 'voice_clarity']
    };
  },
  computed: {
    resultMessage() {
      if (this.progress >= 100) {
        return 'แกะเสียงจากวิดีโอเสร็จสิ้น สร้าง 3 subtitle';
      }
      return '';
    }
  },
  methods: {
    startProcess() {
      const options = {
        sourceLanguage: this.sourceLanguage,
        extractionType: this.extractionType,
        enhancementOptions: this.enhancementOptions
      };
      this.$emit('start-process', options);
    }
  }
};
</script>