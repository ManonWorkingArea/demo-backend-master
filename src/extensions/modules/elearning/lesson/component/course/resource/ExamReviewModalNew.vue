<template>
  <div v-if="isVisible" class="fixed inset-0 z-[60]">
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="handleClose"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-7xl max-h-[95vh] flex flex-col rounded-lg shadow-xl relative z-10">
        
        <!-- Modal Header -->
        <div class="border-b bg-gray-50 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold">ตรวจข้อสอบ - Raw Data</h2>
              <p class="text-sm text-gray-600 mt-1">
                Student: {{ studentId }} | Course: {{ examId }}
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
            
            <!-- Query Info -->
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 class="font-bold text-blue-800 mb-2">Query Parameters</h4>
              <div class="text-sm text-blue-700">
                <strong>userId:</strong> {{ studentId }}<br>
                <strong>courseId:</strong> {{ examId }}<br>
                <strong>API Endpoint:</strong> /api/score/query
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
              <h4 class="font-bold text-green-800 mb-4">Data Structure Analysis</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong class="text-green-700">Basic Info:</strong><br>
                  _id: {{ rawScoreData._id || 'N/A' }}<br>
                  userID: {{ rawScoreData.userID || 'N/A' }}<br>
                  courseID: {{ rawScoreData.courseID || 'N/A' }}<br>
                  score: {{ rawScoreData.score || 'N/A' }}
                </div>
                <div>
                  <strong class="text-green-700">Timestamps:</strong><br>
                  startTime: {{ rawScoreData.startTime || 'N/A' }}<br>
                  submitTime: {{ rawScoreData.submitTime || 'N/A' }}<br>
                  remark: {{ rawScoreData.remark || 'N/A' }}
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
    }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      loading: false,
      rawScoreData: null,
      error: null
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
        // Simple query to get score data
        const queryParams = {
          userId: this.studentId,
          courseId: this.examId,
        };
        
        console.log('Query params:', queryParams);
        
        // Query score collection
        const query = {
          method: 'find',
          hidden: ['userID'],
          args: [{ 
            $and: [
              { userID: queryParams.userId },
              { courseID: queryParams.courseId }
            ]
          }]
        };

        console.log('📊 Score query:', JSON.stringify(query, null, 2));

        const response = await this.$Request.POST('score/query', query, this.getAuthToken());
        console.log('📋 Raw score API response:', response);
        
        const { data, status } = response;

        if (status === 200 && data && data.length > 0) {
          console.log('✅ Found score data:', data[0]);
          this.rawScoreData = data[0];
        } else {
          console.warn('⚠️ No score data found');
          this.error = 'ไม่พบข้อมูลการสอบ';
        }
        
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
