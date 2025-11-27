<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack"
              class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <font-awesome-icon :icon="['fas','arrow-left']" class="mr-2"/>
              กลับ
            </button>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">ตรวจข้อสอบ</h1>
              <p class="text-sm text-gray-500">{{ studentInfo.name }} - {{ courseInfo.name }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(examStatus)">
              {{ getStatusText(examStatus) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดข้อมูลการสอบ...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Sidebar - Exam Info -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลการสอบ</h3>
            
            <!-- Student Info -->
            <div class="space-y-3 mb-6">
              <div>
                <label class="text-sm font-medium text-gray-700">ผู้เข้าสอบ</label>
                <p class="text-sm text-gray-900">{{ studentInfo.name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">รหัสประจำตัว</label>
                <p class="text-sm text-gray-900">{{ studentInfo.student_id || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">อีเมล</label>
                <p class="text-sm text-gray-900">{{ studentInfo.email }}</p>
              </div>
            </div>

            <!-- Exam Summary -->
            <div class="border-t pt-4 space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-700">เวลาเริ่มสอบ</label>
                <p class="text-sm text-gray-900">{{ formatDateTime(examData.start_time) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">เวลาส่งข้อสอบ</label>
                <p class="text-sm text-gray-900">{{ formatDateTime(examData.submit_time) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">เวลาที่ใช้</label>
                <p class="text-sm text-gray-900">{{ calculateDuration(examData.start_time, examData.submit_time) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">คะแนนรวม</label>
                <p class="text-lg font-semibold" 
                   :class="examData.total_score >= examData.passing_score ? 'text-green-600' : 'text-red-600'">
                  {{ examData.total_score || 0 }} / {{ examData.max_score || 0 }}
                </p>
              </div>
            </div>

            <!-- Grading Actions -->
            <div v-if="hasManualGradingQuestions" class="border-t pt-4 mt-4">
              <button 
                @click="saveAllGrades"
                :disabled="!hasUnsavedChanges"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                บันทึกคะแนน
              </button>
              <p class="text-xs text-gray-500 mt-2 text-center">
                บันทึกคะแนนการตรวจข้อเขียน
              </p>
            </div>
          </div>
        </div>

        <!-- Main Content - Questions -->
        <div class="lg:col-span-3">
          <div class="space-y-6">
            
            <!-- Question Navigation -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-3">รายการข้อสอบ</h3>
              <div class="grid grid-cols-10 gap-2">
                <button 
                  v-for="(question, index) in examQuestions" 
                  :key="question._id"
                  @click="scrollToQuestion(index)"
                  class="w-8 h-8 rounded text-sm font-medium transition-colors"
                  :class="getQuestionButtonClass(question)"
                >
                  {{ index + 1 }}
                </button>
              </div>
            </div>

            <!-- Questions List -->
            <div class="space-y-4">
              <div 
                v-for="(question, index) in examQuestions" 
                :key="question._id"
                :id="`question-${index}`"
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                
                <!-- Question Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start space-x-3">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                      {{ index + 1 }}
                    </span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">ข้อที่ {{ index + 1 }}</p>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="getQuestionTypeClass(question.type)">
                        {{ getQuestionTypeName(question.type) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Question Score -->
                  <div class="text-right">
                    <p class="text-sm text-gray-500">คะแนน</p>
                    <p class="text-lg font-semibold" 
                       :class="question.user_score > 0 ? 'text-green-600' : 'text-gray-400'">
                      {{ question.user_score || 0 }} / {{ question.max_score || 1 }}
                    </p>
                  </div>
                </div>

                <!-- Question Content -->
                <div class="mb-4">
                  <div class="prose max-w-none">
                    <div v-html="question.detail"></div>
                  </div>
                </div>

                <!-- Multiple Choice Questions -->
                <div v-if="isMultipleChoice(question.type)" class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700">ตัวเลือก:</h4>
                  <div class="space-y-2">
                    <div 
                      v-for="(answer, answerIndex) in question.answers" 
                      :key="answer._id"
                      class="flex items-center p-3 rounded-lg border"
                      :class="getAnswerClass(question, answer._id)"
                    >
                      <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3"
                            :class="getAnswerLabelClass(question, answer._id)">
                        {{ String.fromCharCode(65 + answerIndex) }}
                      </span>
                      <span class="flex-1">{{ answer.detail }}</span>
                      
                      <!-- Answer Status Icons -->
                      <div class="flex items-center space-x-2">
                        <font-awesome-icon 
                          v-if="answer._id === question.correct" 
                          :icon="['fas','check']" 
                          class="text-green-500"
                          title="คำตอบที่ถูกต้อง" 
                        />
                        <font-awesome-icon 
                          v-if="answer._id === question.user_answer" 
                          :icon="['fas','user']" 
                          class="text-blue-500"
                          title="คำตอบของผู้เข้าสอบ" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Written Questions -->
                <div v-else-if="isWrittenQuestion(question.type)" class="space-y-4">
                  
                  <!-- User Answer -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 mb-2">คำตอบของผู้เข้าสอบ:</h4>
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p v-if="question.user_answer" class="text-gray-900 whitespace-pre-wrap">{{ question.user_answer }}</p>
                      <p v-else class="text-gray-500 italic">ไม่ได้ตอบข้อนี้</p>
                    </div>
                  </div>

                  <!-- Correct Answer (for reference) -->
                  <div v-if="question.correct_answer">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">เฉลยอ้างอิง:</h4>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p class="text-green-900 whitespace-pre-wrap">{{ question.correct_answer }}</p>
                    </div>
                  </div>

                  <!-- Manual Grading -->
                  <div v-if="requiresManualGrading(question)" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-yellow-800 mb-3">
                      <font-awesome-icon :icon="['fas','user-graduate']" class="mr-2"/>
                      ตรวจให้คะแนนเอง
                    </h4>
                    
                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">คะแนนที่ได้</label>
                        <input 
                          type="number" 
                          v-model.number="question.user_score"
                          :max="question.max_score || 1"
                          min="0"
                          step="0.5"
                          @input="markAsChanged(question._id)"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div class="text-sm text-gray-500">
                        / {{ question.max_score || 1 }}
                      </div>
                    </div>

                    <!-- Grading Comments -->
                    <div class="mt-3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุการตรวจ (ไม่บังคับ)</label>
                      <textarea 
                        v-model="question.grading_comment"
                        @input="markAsChanged(question._id)"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="เพิ่มหมายเหตุการให้คะแนน..."
                      ></textarea>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamReview',
  props: {
    enrollId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    courseId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      examData: {},
      examQuestions: [],
      studentInfo: {},
      courseInfo: {},
      examStatus: 'completed',
      unsavedChanges: new Set(),
    };
  },
  computed: {
    hasManualGradingQuestions() {
      return this.examQuestions.some(q => this.requiresManualGrading(q));
    },
    hasUnsavedChanges() {
      return this.unsavedChanges.size > 0;
    }
  },
  methods: {
    async loadExamData() {
      try {
        this.loading = true;
        
        // Load exam data, questions, student info, etc.
        // This is where you'll implement the API calls
        
        // Example API calls:
        // const examData = await this.getExamData(this.enrollId);
        // const questions = await this.getExamQuestions(this.enrollId);
        // const studentInfo = await this.getStudentInfo(this.userId);
        
        // Mock data for now
        this.studentInfo = {
          name: 'John Doe',
          student_id: 'ST2024001',
          email: 'john@example.com'
        };
        
        this.courseInfo = {
          name: 'หลักสูตรตัวอย่าง'
        };
        
        this.examData = {
          start_time: new Date(),
          submit_time: new Date(),
          total_score: 0,
          max_score: 100,
          passing_score: 70
        };
        
        this.examQuestions = [];
        
      } catch (error) {
        console.error('Error loading exam data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return '-';
      return moment(dateTime).format('DD/MM/YYYY HH:mm:ss');
    },
    
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return '-';
      const duration = moment(endTime).diff(moment(startTime));
      return moment.utc(duration).format('HH:mm:ss');
    },
    
    getStatusClass(status) {
      const classes = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'grading': 'bg-blue-100 text-blue-800',
        'failed': 'bg-red-100 text-red-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    },
    
    getStatusText(status) {
      const texts = {
        'completed': 'เสร็จสิ้น',
        'pending': 'รอตรวจ',
        'grading': 'กำลังตรวจ',
        'failed': 'ไม่ผ่าน'
      };
      return texts[status] || 'ไม่ทราบสถานะ';
    },
    
    getQuestionButtonClass(question) {
      if (this.requiresManualGrading(question) && !question.user_score) {
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      } else if (question.user_score > 0) {
        return 'bg-green-100 text-green-800 border border-green-200';
      } else {
        return 'bg-red-100 text-red-800 border border-red-200';
      }
    },
    
    getQuestionTypeClass(type) {
      const classes = {
        'text': 'bg-blue-100 text-blue-800',
        'image': 'bg-purple-100 text-purple-800',
        'video': 'bg-indigo-100 text-indigo-800',
        'fill_blank': 'bg-green-100 text-green-800',
        'essay': 'bg-orange-100 text-orange-800'
      };
      return classes[type] || 'bg-gray-100 text-gray-800';
    },
    
    getQuestionTypeName(type) {
      const names = {
        'text': 'ข้อความ',
        'image': 'รูปภาพ',
        'video': 'วิดีโอ',
        'fill_blank': 'เติมคำ',
        'essay': 'อธิบาย'
      };
      return names[type] || type;
    },
    
    isMultipleChoice(type) {
      return ['text', 'image', 'video'].includes(type);
    },
    
    isWrittenQuestion(type) {
      return ['fill_blank', 'essay'].includes(type);
    },
    
    requiresManualGrading(question) {
      return question.type === 'essay' || question.requires_manual_grading === true;
    },
    
    getAnswerClass(question, answerId) {
      const isCorrect = answerId === question.correct;
      const isUserAnswer = answerId === question.user_answer;
      
      if (isCorrect && isUserAnswer) {
        return 'bg-green-50 border-green-300';
      } else if (isCorrect) {
        return 'bg-green-50 border-green-200';
      } else if (isUserAnswer) {
        return 'bg-red-50 border-red-300';
      } else {
        return 'bg-gray-50 border-gray-200';
      }
    },
    
    getAnswerLabelClass(question, answerId) {
      const isCorrect = answerId === question.correct;
      const isUserAnswer = answerId === question.user_answer;
      
      if (isCorrect && isUserAnswer) {
        return 'bg-green-500 text-white';
      } else if (isCorrect) {
        return 'bg-green-100 text-green-800';
      } else if (isUserAnswer) {
        return 'bg-red-500 text-white';
      } else {
        return 'bg-gray-200 text-gray-600';
      }
    },
    
    scrollToQuestion(index) {
      const element = document.getElementById(`question-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    
    markAsChanged(questionId) {
      this.unsavedChanges.add(questionId);
    },
    
    async saveAllGrades() {
      try {
        // Implement saving grades to backend
        console.log('Saving all grades...');
        
        // Reset unsaved changes
        this.unsavedChanges.clear();
        
        // Show success message
        this.$toast.success('บันทึกคะแนนเรียบร้อยแล้ว');
        
      } catch (error) {
        console.error('Error saving grades:', error);
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกคะแนน');
      }
    }
  },
  
  async mounted() {
    await this.loadExamData();
  },
  
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?');
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  }
};
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.prose p {
  margin-bottom: 0.5rem;
}

.prose img {
  max-width: 100%;
  height: auto;
}
</style>
