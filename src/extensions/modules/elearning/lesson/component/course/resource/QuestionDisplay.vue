<template>
  <div class="question-display">
    <!-- Question Header -->
    <div class="flex justify-between items-start mb-4">
      <h4 class="text-lg font-medium text-gray-900">
        ข้อ {{ questionNumber }}: {{ question.question }}
      </h4>
      <div class="fle  methods: {
    getSelectedOptionText(selectedId) {
      if (!selectedId || !this.question.options) return null;
      const selectedOption = this.question.options.find(option => option._id === selectedId);
      return selectedOption ? (selectedOption.detail || selectedOption.text || selectedOption.answer) : null;
    },
    
    checkFillBlankAnswer(question) {
      if (!question.studentAnswer || !question.correctAnswer) return false;
      
      // Case-insensitive comparison and trim whitespace
      const student = question.studentAnswer.toString().trim().toLowerCase();
      const correct = question.correctAnswer.toString().trim().toLowerCase();
      
      return student === correct;
    },
    
    updateScore(event) {
      const newScore = parseFloat(event.target.value) || 0;
      if (newScore >= 0 && newScore <= this.question.maxScore) {
        this.currentScore = newScore;
        this.$emit('scoreChange', {
          questionId: this.question._id,
          score: newScore,
          maxScore: this.question.maxScore
        });
      }
    },nter space-x-2">
        <span class="text-sm text-gray-500">
          {{ question.score }}/{{ question.maxScore }} คะแนน
        </span>
        <span v-if="question.needsManualGrading" class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          ต้องตรวจด้วยตนเอง
        </span>
        <span v-else class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          ตรวจอัตโนมัติ
        </span>
      </div>
    </div>

    <!-- Multiple Choice Question -->
    <div v-if="question.type === 'multiple_choice'" class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600 mb-2">คำตอบของผู้สอบ:</div>
        <div class="font-medium">{{ getSelectedOptionText(question.studentAnswer) || 'ไม่ได้ตอบ' }}</div>
      </div>
      
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-blue-600 mb-2">เฉลย:</div>
        <div class="font-medium text-blue-800">{{ getSelectedOptionText(question.correctAnswer) || 'ไม่ระบุเฉลย' }}</div>
      </div>
      
      <!-- Answer Options Display -->
      <div v-if="question.options && question.options.length > 0" class="space-y-2">
        <div class="text-sm font-medium text-gray-700 mb-2">ตัวเลือกทั้งหมด:</div>
        <div 
          v-for="(option, index) in question.options" 
          :key="option._id || index"
          class="flex items-center p-3 rounded-lg border"
          :class="{
            'bg-green-50 border-green-300': option._id === question.correctAnswer && option._id === question.studentAnswer,
            'bg-green-50 border-green-200': option._id === question.correctAnswer && option._id !== question.studentAnswer,
            'bg-red-50 border-red-300': option._id !== question.correctAnswer && option._id === question.studentAnswer,
            'bg-gray-50 border-gray-200': option._id !== question.correctAnswer && option._id !== question.studentAnswer
          }"
        >
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3"
                :class="{
                  'bg-green-500 text-white': option._id === question.correctAnswer && option._id === question.studentAnswer,
                  'bg-green-100 text-green-800': option._id === question.correctAnswer && option._id !== question.studentAnswer,
                  'bg-red-500 text-white': option._id !== question.correctAnswer && option._id === question.studentAnswer,
                  'bg-gray-200 text-gray-600': option._id !== question.correctAnswer && option._id !== question.studentAnswer
                }">
            {{ String.fromCharCode(65 + index) }}
          </span>
          <span class="flex-1">{{ option.detail || option.text || option.answer }}</span>
          
          <!-- Answer Status Icons -->
          <div class="flex items-center space-x-2">
            <font-awesome-icon 
              v-if="option._id === question.correctAnswer" 
              :icon="['fas','check']" 
              class="text-green-500"
              title="คำตอบที่ถูกต้อง" 
            />
            <font-awesome-icon 
              v-if="option._id === question.studentAnswer" 
              :icon="['fas','user']" 
              class="text-blue-500"
              title="คำตอบของผู้เข้าสอบ" 
            />
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <font-awesome-icon 
          :icon="['fas', question.studentAnswer === question.correctAnswer ? 'check-circle' : 'times-circle']" 
          :class="question.studentAnswer === question.correctAnswer ? 'text-green-500' : 'text-red-500'"
          class="text-lg"
        />
        <span :class="question.studentAnswer === question.correctAnswer ? 'text-green-700' : 'text-red-700'" class="font-medium">
          {{ question.studentAnswer === question.correctAnswer ? 'ถูกต้อง' : 'ผิด' }}
        </span>
      </div>
    </div>

    <!-- Fill in the Blank Question -->
    <div v-else-if="question.type === 'fill_blank'" class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600 mb-2">คำตอบของผู้สอบ:</div>
        <div class="font-medium">{{ question.studentAnswer || 'ไม่ได้ตอบ' }}</div>
      </div>
      
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-blue-600 mb-2">คำตอบที่ยอมรับได้:</div>
        <div class="font-medium text-blue-800">{{ question.correctAnswer }}</div>
      </div>
      
      <!-- Manual Grading Controls -->
      <div v-if="canGrade" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-yellow-800">ให้คะแนนด้วยตนเอง</div>
          <div class="text-sm text-yellow-700">เต็ม {{ question.maxScore }} คะแนน</div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <input 
              type="number" 
              :value="currentScore"
              @input="updateScore"
              :min="0" 
              :max="question.maxScore"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ใส่คะแนน"
            />
          </div>
          <div class="flex space-x-2">
            <button 
              @click="setScore(0)"
              class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              0 คะแนน
            </button>
            <button 
              @click="setScore(question.maxScore / 2)"
              class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
            >
              ครึ่งคะแนน
            </button>
            <button 
              @click="setScore(question.maxScore)"
              class="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
            >
              เต็มคะแนน
            </button>
          </div>
        </div>
        
        <!-- Score Preview -->
        <div class="mt-2 text-sm text-gray-600">
          คะแนนปัจจุบัน: <span class="font-medium">{{ currentScore }}/{{ question.maxScore }}</span>
          <span v-if="currentScore > 0" class="ml-2 text-gray-500">
            ({{ Math.round((currentScore / question.maxScore) * 100) }}%)
          </span>
        </div>
      </div>
    </div>

    <!-- Essay Question -->
    <div v-else-if="question.type === 'essay'" class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600 mb-2">คำตอบของผู้สอบ:</div>
        <div class="whitespace-pre-wrap font-medium">{{ question.studentAnswer || 'ไม่ได้ตอบ' }}</div>
      </div>
      
      <div v-if="question.sampleAnswer" class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-blue-600 mb-2">ตัวอย่างคำตอบ:</div>
        <div class="whitespace-pre-wrap font-medium text-blue-800">{{ question.sampleAnswer }}</div>
      </div>
      
      <!-- Manual Grading Controls -->
      <div v-if="canGrade" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-yellow-800">ให้คะแนนด้วยตนเอง</div>
          <div class="text-sm text-yellow-700">เต็ม {{ question.maxScore }} คะแนน</div>
        </div>
        
        <div class="space-y-3">
          <!-- Score Input -->
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <input 
                type="number" 
                :value="currentScore"
                @input="updateScore"
                :min="0" 
                :max="question.maxScore"
                step="0.5"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ใส่คะแนน"
              />
            </div>
            <div class="flex space-x-2">
              <button 
                @click="setScore(0)"
                class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
              >
                0 คะแนน
              </button>
              <button 
                @click="setScore(question.maxScore / 2)"
                class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
              >
                ครึ่งคะแนน
              </button>
              <button 
                @click="setScore(question.maxScore)"
                class="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
              >
                เต็มคะแนน
              </button>
            </div>
          </div>
          
          <!-- Comment Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ความเห็นผู้ตรวจ (ไม่บังคับ)
            </label>
            <textarea 
              v-model="gradingComment"
              @input="updateComment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ใส่ความเห็นหรือคำแนะนำ..."
            ></textarea>
          </div>
          
          <!-- Score Preview -->
          <div class="text-sm text-gray-600">
            คะแนนปัจจุบัน: <span class="font-medium">{{ currentScore }}/{{ question.maxScore }}</span>
            <span v-if="currentScore > 0" class="ml-2 text-gray-500">
              ({{ Math.round((currentScore / question.maxScore) * 100) }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Unknown Question Type -->
    <div v-else class="bg-red-50 p-4 rounded-lg border border-red-200">
      <div class="text-red-800 font-medium">ประเภทคำถามไม่รู้จัก: {{ question.type }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionDisplay',
  props: {
    question: {
      type: Object,
      required: true
    },
    questionNumber: {
      type: Number,
      required: true
    },
    canGrade: {
      type: Boolean,
      default: false
    }
  },
  emits: ['scoreChanged', 'commentChanged'],
  data() {
    return {
      currentScore: 0,
      gradingComment: ''
    }
  },
  watch: {
    question: {
      handler(newQuestion) {
        this.currentScore = newQuestion.score || 0
        this.gradingComment = newQuestion.gradingComment || ''
      },
      immediate: true
    }
  },
  methods: {
    updateScore(event) {
      const score = parseFloat(event.target.value) || 0
      const maxScore = this.question.maxScore
      
      // Ensure score is within bounds
      if (score >= 0 && score <= maxScore) {
        this.currentScore = score
        this.$emit('scoreChanged', score)
      }
    },
    
    setScore(score) {
      this.currentScore = score
      this.$emit('scoreChanged', score)
    },
    
    updateComment() {
      this.$emit('commentChanged', this.gradingComment)
    }
  }
}
</script>

<style scoped>
/* Ensure textarea resize works properly */
textarea {
  resize: vertical;
  min-height: 80px;
}

/* Style for score buttons */
.space-x-2 > button {
  transition: all 0.2s ease;
}

.space-x-2 > button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Input focus styles */
input[type="number"]:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
