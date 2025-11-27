<template>
  <!-- Exam Review Modal -->
  <div v-if="showExamReviewModal" class="fixed inset-0 z-[60]">
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeExamReviewModal"></div>
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
                Student: {{ currentExamStudentId }} | Course: {{ currentExamId }}
                <span v-if="currentMasterId" class="text-blue-600">| Master: {{ currentMasterId }}</span>
                <span v-if="currentExamType !== 'general'" :class="examTypeColor" class="ml-2 font-medium">
                  • {{ examTypeText }}
                </span>
              </p>
            </div>
            <button 
              @click="closeExamReviewModal"
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
                StudentID: {{ currentExamStudentId }}<br>
                CourseID: {{ currentExamId }}<br>
                MasterID: {{ currentMasterId || 'ไม่ระบุ' }}<br>
                ExamType: {{ currentExamType }}
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
                <strong>userId:</strong> {{ currentExamStudentId }}<br>
                <strong>courseId:</strong> {{ currentExamId }}<br>
                <strong>masterId:</strong> {{ currentMasterId || 'ไม่ระบุ (จะใช้ course lookup)' }}<br>
                <strong>examType:</strong> {{ currentExamType }}<br>
                <strong>API Endpoint:</strong> /api/score/aggregate<br>
                <strong>Pipeline:</strong> {{ currentMasterId ? '$match → $lookup exam (direct)' : '$match → $lookup course → $lookup exam' }}
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
              <strong>Modal visible:</strong> {{ showExamReviewModal }}<br>
              <strong>Has rawScoreData:</strong> {{ !!rawScoreData }}<br>
              <strong>Loading:</strong> {{ loading }}<br>
              <strong>Error:</strong> {{ error || 'None' }}<br>
              <strong>Current examType:</strong> {{ currentExamType }}<br>
              <strong>MasterId provided:</strong> {{ !!currentMasterId }} ({{ currentMasterId || 'ไม่ระบุ' }})
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t p-4 flex justify-end space-x-2">
          <button @click="closeExamReviewModal" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamReviewManager',
  props: {
    listItems: {
      type: Array,
      required: true
    },
    dataItem: {
      type: String,
      required: true
    },
    configs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showExamReviewModal: false,
      currentExamStudentId: null,
      currentExamId: null,
      currentUserInfo: null,
      currentExamType: 'general',
      currentMasterId: null,
      loading: false,
      rawScoreData: null,
      error: null
    }
  },
  computed: {
    examTypeText() {
      switch(this.currentExamType) {
        case 'pre': return 'ก่อนเรียน'
        case 'post': return 'หลังเรียน' 
        default: return 'ทั่วไป'
      }
    },
    examTypeColor() {
      switch(this.currentExamType) {
        case 'pre': return 'text-blue-600'
        case 'post': return 'text-green-600'
        default: return 'text-gray-600'
      }
    }
  },
  methods: {
    // Main exam review method
    async reviewExam(examId, userId, userInfo = null, examType = 'general', masterId = null) {
      console.log('🔍 ExamReviewManager.reviewExam called with:', {
        examId,
        userId,
        userInfo,
        examType,
        masterId
      });

      try {
        // Set current exam data
        this.currentExamStudentId = userId;
        this.currentExamId = examId;
        this.currentUserInfo = userInfo;
        this.currentExamType = examType;
        this.currentMasterId = masterId;
        
        // Reset state
        this.loading = false;
        this.rawScoreData = null;
        this.error = null;
        
        // Show modal first
        this.showExamReviewModal = true;
        
        // Then load data
        await this.loadScoreData();

      } catch (error) {
        console.error('❌ Error in reviewExam:', error);
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลการสอบ: ' + error.message;
      }
    },
    
    async loadScoreData() {
      console.log('📚 loadScoreData started - using masterId:', this.currentMasterId);
      this.loading = true;
      this.error = null;
      
      try {
        // Build and conditions for the match
        const andConditions = [
          { userID: this.currentExamStudentId }
        ];

        // If courseID is available, filter by it
        if (this.currentExamId) {
          andConditions.push({ courseID: this.currentExamId });
        }

        // Filter by exam type if specified
        if (this.currentExamType !== 'general') {
          andConditions.push({ examType: this.currentExamType });
        }

        // Create simplified aggregation pipeline (no course lookup needed when masterId is provided)
        let pipeline;
        
        if (this.currentMasterId) {
          // Use masterId directly - much simpler and faster
          pipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
            {
              $lookup: {
                from: 'exam',
                let: { masterId: this.currentMasterId },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$courseId", "$$masterId"]
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      courseId: 1,
                      name: 1,
                      total: 1,
                      timer: 1,
                      measure: 1,
                      type: 1,
                      description: 1,
                      result: 1,
                      is_score: 1,
                      is_answer_shuffle: 1,
                      is_question_shuffle: 1,
                      createdAt: 1,
                      updatedAt: 1
                    }
                  }
                ],
                as: 'examInfo'
              }
            },
            {
              $unwind: {
                path: '$examInfo',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                userID: 1,
                courseID: 1,
                score: 1,
                answer: 1,
                startTime: 1,
                submitTime: 1,
                remark: 1,
                examType: 1,
                'examInfo._id': 1,
                'examInfo.name': 1,
                'examInfo.total': 1,
                'examInfo.timer': 1,
                'examInfo.measure': 1,
                'examInfo.type': 1,
                'examInfo.description': 1,
                'examInfo.result': 1,
                'examInfo.is_score': 1,
                'examInfo.is_answer_shuffle': 1,
                'examInfo.is_question_shuffle': 1,
                'examInfo.createdAt': 1,
                'examInfo.updatedAt': 1
              }
            }
          ];
        } else {
          // Fallback to course lookup if masterId not provided
          pipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
            {
              $lookup: {
                from: 'course',
                localField: 'courseID',
                foreignField: '_id',
                as: 'course'
              }
            },
            {
              $unwind: '$course'
            },
            {
              $facet: {
                scoreData: [
                  {
                    $lookup: {
                      from: 'exam',
                      let: { masterID: "$course.master" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$courseId", "$$masterID"]
                            }
                          }
                        },
                        {
                          $project: {
                            _id: 1,
                            courseId: 1,
                            name: 1,
                            total: 1,
                            timer: 1,
                            measure: 1,
                            type: 1,
                            description: 1,
                            result: 1,
                            is_score: 1,
                            is_answer_shuffle: 1,
                            is_question_shuffle: 1,
                            createdAt: 1,
                            updatedAt: 1
                          }
                        }
                      ],
                      as: 'examInfo'
                    }
                  },
                  {
                    $unwind: {
                      path: '$examInfo',
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      userID: 1,
                      courseID: 1,
                      score: 1,
                      answer: 1,
                      startTime: 1,
                      submitTime: 1,
                      remark: 1,
                      examType: 1,
                      'course._id': 1,
                      'course.name': 1,
                      'course.master': 1,
                      'examInfo._id': 1,
                      'examInfo.name': 1,
                      'examInfo.total': 1,
                      'examInfo.timer': 1,
                      'examInfo.measure': 1,
                      'examInfo.type': 1,
                      'examInfo.description': 1,
                      'examInfo.result': 1,
                      'examInfo.is_score': 1,
                      'examInfo.is_answer_shuffle': 1,
                      'examInfo.is_question_shuffle': 1,
                      'examInfo.createdAt': 1,
                      'examInfo.updatedAt': 1
                    }
                  }
                ]
              }
            }
          ];
        }

        // Create payload with pipeline
        const payload = { pipeline };
        console.log('📊 Aggregation payload (using masterId:', this.currentMasterId, '):', JSON.stringify(payload, null, 2));

        const response = await this.$Request.POST('score/aggregate', payload, this.configs.key);
        console.log('📋 API response:', response);
        
        const { data, status } = response;

        if (this.currentMasterId) {
          // Direct result when using masterId
          if (status === 200 && data && data.length > 0) {
            console.log('✅ Found score data with exam info (direct):', data[0]);
            this.rawScoreData = data[0];
          } else {
            console.warn('⚠️ No score data found');
            this.error = 'ไม่พบข้อมูลการสอบ';
          }
        } else {
          // Faceted result when using course lookup
          if (status === 200 && data && data.length > 0 && data[0].scoreData && data[0].scoreData.length > 0) {
            console.log('✅ Found score data with exam info (faceted):', data[0].scoreData[0]);
            this.rawScoreData = data[0].scoreData[0];
          } else {
            console.warn('⚠️ No score data found');
            this.error = 'ไม่พบข้อมูลการสอบ';
          }
        }
        
      } catch (error) {
        console.error('❌ Error loading score data:', error);
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message;
      } finally {
        this.loading = false;
        console.log('🏁 loadScoreData completed');
      }
    },
    
    closeExamReviewModal() {
      this.showExamReviewModal = false;
      this.currentExamStudentId = null;
      this.currentExamId = null;
      this.currentUserInfo = null;
      this.currentExamType = 'general';
      this.currentMasterId = null;
      this.loading = false;
      this.rawScoreData = null;
      this.error = null;
    },
    
    handleExamGradesSaved() {
      // Handle when grades are saved
      console.log('Exam grades saved successfully');
      this.$emit('grades-saved');
    },
    
    // Exam Review Helper Methods
    formatExamDateTime(dateTime) {
      if (!dateTime) return '-';
      return new Date(dateTime).toLocaleString('th-TH');
    },
    
    calculateExamDuration(startTime, endTime) {
      if (!startTime || !endTime) return '-';
      const diff = new Date(endTime) - new Date(startTime);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    getExamStatusClass(status) {
      const classes = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'grading': 'bg-blue-100 text-blue-800',
        'failed': 'bg-red-100 text-red-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    },
    
    getExamStatusText(status) {
      const texts = {
        'completed': 'เสร็จสิ้น',
        'pending': 'รอตรวจ',
        'grading': 'กำลังตรวจ',
        'failed': 'ไม่ผ่าน'
      };
      return texts[status] || 'ไม่ทราบสถานะ';
    },
    
    // Question Type Helper Methods
    isMultipleChoice(type) {
      return ['text', 'image', 'video'].includes(type);
    },
    
    isWrittenQuestion(type) {
      return ['fill_blank', 'essay'].includes(type);
    },
    
    requiresManualGrading(question) {
      return question.type === 'essay' || question.requires_manual_grading === true;
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
    
    scrollToQuestion(index) {
      const element = document.getElementById(`exam-question-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
