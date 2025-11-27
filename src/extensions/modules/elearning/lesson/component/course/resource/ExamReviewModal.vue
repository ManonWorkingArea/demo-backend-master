<template>
  <div v-if="isVisible" class="fixed inset-0 z-[60]">
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="handleClose"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-7xl max-h-[95vh] flex flex-col rounded-lg shadow-xl relative z-10">
        
        <!-- Modal Header -->
        <div class="border-b bg-gray-50 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold">
                ตรวจข้อสอบ<span :class="examTypeColor" class="ml-2">({{ examTypeText }})</span>
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                Student: {{ studentId }} | Course: {{ examId }}
                <span v-if="examType !== 'general'" :class="examTypeColor" class="ml-2 font-medium">
                  • {{ examTypeText }}
                </span>
              </p>
            </div>
            <button 
              @click="handleClose"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <font-awesome-icon :icon="['fas','times']" class="text-xl"/>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="overflow-y-auto flex-grow p-6">
          
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p class="text-gray-600">กำลังโหลดข้อมูลการสอบ...</p>
              <p class="text-sm text-gray-500 mt-2">
                StudentID: {{ studentId }}<br>
                CourseID: {{ examId }}<br>
                Configs: {{ configs ? 'Available' : 'Missing' }}
              </p>
            </div>
          </div>

          <!-- Error State -->
          <div v-if="error && !loading" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="text-red-500 text-6xl mb-4">⚠️</div>
              <p class="text-red-600 text-lg">{{ error }}</p>
            </div>
          </div>

          <!-- Raw Score Data Display -->
          <div v-if="rawScoreData && !loading" class="space-y-6">
            
            <!-- Debug Info -->
            <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 class="font-bold text-red-800 mb-2">🔍 Debug Status</h4>
              <div class="text-sm text-red-700">
                <strong>rawScoreData exists:</strong> {{ !!rawScoreData }}<br>
                <strong>loading:</strong> {{ loading }}<br>
                <strong>error:</strong> {{ error }}<br>
                <strong>Data keys:</strong> {{ rawScoreData ? Object.keys(rawScoreData).join(', ') : 'None' }}
              </div>
            </div>
            
            <!-- Query Info -->
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 class="font-bold text-blue-800 mb-2">Query Parameters</h4>
              <div class="text-sm text-blue-700">
                <strong>userId:</strong> {{ studentId }}<br>
                <strong>courseId:</strong> {{ examId }}<br>
                <strong>examType:</strong> {{ examType }}<br>
                <strong>API Endpoint:</strong> /api/score/aggregate<br>
                <strong>Pipeline:</strong> $match → $facet → $lookup (exam collection)
              </div>
            </div>

            <!-- Exam Information (from joined data) -->
            <div v-if="rawScoreData.examInfo" class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <h4 class="font-bold text-purple-800 mb-4">ข้อมูลข้อสอบ (จาก exam collection)</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong class="text-purple-700">Basic Info:</strong><br>
                  Exam ID: {{ rawScoreData.examInfo._id || 'N/A' }}<br>
                  Name: {{ rawScoreData.examInfo.name || 'N/A' }}<br>
                  Type: {{ rawScoreData.examInfo.type || 'N/A' }}<br>
                  Total Questions: {{ rawScoreData.examInfo.total || 'N/A' }}<br>
                  Timer: {{ rawScoreData.examInfo.timer || 'N/A' }} นาที
                </div>
                <div>
                  <strong class="text-purple-700">Settings:</strong><br>
                  Measure: {{ rawScoreData.examInfo.measure || 'N/A' }}<br>
                  Show Score: {{ rawScoreData.examInfo.is_score || 'N/A' }}<br>
                  Question Shuffle: {{ rawScoreData.examInfo.is_question_shuffle || 'N/A' }}<br>
                  Answer Shuffle: {{ rawScoreData.examInfo.is_answer_shuffle || 'N/A' }}<br>
                  Result: {{ rawScoreData.examInfo.result || 'N/A' }}
                </div>
              </div>
              <div class="mt-4">
                <strong class="text-purple-700">Description:</strong><br>
                {{ rawScoreData.examInfo.description || 'ไม่มีคำอธิบาย' }}
              </div>
            </div>

            <!-- Raw Data -->
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 class="font-bold text-gray-800 mb-4">Raw Score Data from MongoDB</h4>
              <div class="bg-white p-4 rounded border overflow-auto max-h-96">
                <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(rawScoreData, null, 2) }}</pre>
              </div>
            </div>

            <!-- Data Analysis -->
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 class="font-bold text-green-800 mb-4">Score Data Analysis</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong class="text-green-700">Score Info:</strong><br>
                  _id: {{ rawScoreData._id || 'N/A' }}<br>
                  userID: {{ rawScoreData.userID || 'N/A' }}<br>
                  courseID: {{ rawScoreData.courseID || 'N/A' }}<br>
                  score: {{ rawScoreData.score || 'N/A' }}<br>
                  examType: {{ rawScoreData.examType || 'N/A' }}
                </div>
                <div>
                  <strong class="text-green-700">Timestamps:</strong><br>
                  startTime: {{ rawScoreData.startTime || 'N/A' }}<br>
                  submitTime: {{ rawScoreData.submitTime || 'N/A' }}<br>
                  remark: {{ rawScoreData.remark || 'N/A' }}<br>
                  <span v-if="rawScoreData.examInfo">
                    <strong class="text-green-700 block mt-2">Joined Exam:</strong>
                    {{ rawScoreData.examInfo.name || 'N/A' }}
                  </span>
                </div>
              </div>
              <div class="mt-4">
                <strong class="text-green-700">Answer Structure:</strong><br>
                <span v-if="rawScoreData.answer">
                  Type: {{ typeof rawScoreData.answer }}<br>
                  Keys: {{ Object.keys(rawScoreData.answer || {}).length }} questions<br>
                  Sample keys: {{ Object.keys(rawScoreData.answer || {}).slice(0, 3).join(', ') }}
                </span>
                <span v-else>No answer data found</span>
              </div>
            </div>

          </div>

          <!-- Always Show State Info -->
          <div v-if="!loading" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 class="font-bold text-yellow-800 mb-2">🔧 Current State</h4>
            <div class="text-sm text-yellow-700">
              <strong>Modal visible:</strong> {{ isVisible }}<br>
              <strong>Has rawScoreData:</strong> {{ !!rawScoreData }}<br>
              <strong>Loading:</strong> {{ loading }}<br>
              <strong>Error:</strong> {{ error || 'None' }}<br>
              <strong>Props received:</strong> studentId={{ studentId }}, examId={{ examId }}
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t p-4 flex justify-end space-x-2">
          <button @click="handleClose" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamReviewModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    studentId: {
      type: String,
      required: true
    },
    examId: {
      type: [String, Object],
      required: true
    },
    userInfo: {
      type: Object,
      default: null
    },
    configs: {
      type: Object,
      required: true
    },
    examType: {
      type: String,
      default: 'general' // 'pre', 'post', 'general'
    },
    preloadedData: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  mounted() {
    console.log('🎯 ExamReviewModal mounted');
    console.log('🔍 Props on mount:', {
      isVisible: this.isVisible,
      studentId: this.studentId,
      examId: this.examId
    });
    
    if (this.isVisible) {
      console.log('🚀 Modal is visible on mount, loading data...');
      this.loadScoreData();
    }
  },
  data() {
    return {
      loading: false,
      rawScoreData: null,
      error: null
    }
  },
  computed: {
    examTypeText() {
      switch(this.examType) {
        case 'pre': return 'ก่อนเรียน'
        case 'post': return 'หลังเรียน' 
        default: return 'ทั่วไป'
      }
    },
    examTypeColor() {
      switch(this.examType) {
        case 'pre': return 'text-blue-600'
        case 'post': return 'text-green-600'
        default: return 'text-gray-600'
      }
    }
  },
  watch: {
    isVisible(newVal) {
      console.log('👀 ExamReviewModal visibility changed:', newVal);
      console.log('📋 Modal props:', {
        studentId: this.studentId,
        examId: this.examId,
        configs: this.configs
      });
      
      if (newVal) {
        console.log('🚀 Starting to load score data...');
        this.loadScoreData()
      }
    }
  },
  methods: {
    async loadScoreData() {
      console.log('📚 loadScoreData started');
      this.loading = true;
      this.error = null;
      
      try {
        // Check if we have preloaded data first
        if (this.preloadedData) {
          console.log('✅ Using preloaded data from ExamReviewManager:', this.preloadedData);
          this.rawScoreData = this.preloadedData;
          return;
        }

        // No API fallback - if no preloaded data, show error
        console.log('⚠️ No preloaded data available');
        this.error = 'ไม่พบข้อมูลการสอบ - ไม่ได้รับข้อมูลจาก ExamReviewManager';
        
      } catch (error) {
        console.error('❌ Error loading score data:', error);
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message;
      } finally {
        this.loading = false;
        console.log('🏁 loadScoreData completed');
      }
    },
    
    getAuthToken() {
      return this.configs?.key || '';
    },

    handleClose() {
      this.resetData();
      this.$emit('close');
    },
    
    resetData() {
      this.loading = false;
      this.rawScoreData = null;
      this.error = null;
    }
  }
}
</script>

<style scoped>
/* Custom styles for modal animations and responsive design */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
