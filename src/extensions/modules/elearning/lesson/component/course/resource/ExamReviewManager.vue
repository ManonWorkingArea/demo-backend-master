<template>
  <!-- Exam Review Modal -->
  <div v-if="showExamReviewModal" class="fixed inset-0 z-[60]">
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeExamReviewModal"></div>
    <div class="fixed inset-0 flex items-center justify-center p-2">
      <div class="bg-white w-[98vw] h-[96vh] flex flex-col rounded-lg shadow-xl relative z-10">
        
        <!-- Modal Header -->
        <div class="border-b bg-gray-50 p-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold">
                ตรวจข้อสอบ<span :class="examTypeColor" class="ml-2">({{ examTypeText }})</span>
              </h2>
              <!-- <p class="text-sm text-gray-600 mt-1">
                Student: {{ currentExamStudentId }} | Course: {{ currentExamId }}
                <span v-if="currentMasterId" class="text-blue-600">| Master: {{ currentMasterId }}</span>
                <span v-if="currentExamType !== 'general'" :class="examTypeColor" class="ml-2 font-medium">
                  • {{ examTypeText }}
                </span>
                <span v-if="rawScoreData && rawScoreData.examInfo" class="text-purple-600 ml-2">
                  | คะแนนขั้นต่ำ: {{ rawScoreData.examInfo.measure }}/{{ rawScoreData.examInfo.total }}
                </span>
              </p> -->
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
          <div v-if="rawScoreData && !loading" class="flex flex-col h-full space-y-6">

            <!-- Recheck Debug Panel -->
            <div v-if="recheckResults" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 class="font-bold text-yellow-800 mb-4">🔍 ผลการตรวจสอบคำตอบใหม่ (Debug Mode)</h4>
              
              <!-- Update Status -->
              <div v-if="rawScoreData.remark === 'ตรวจสอบแล้ว'" class="bg-green-100 border border-green-300 p-3 rounded mb-4">
                <div class="flex items-center text-green-800">
                  <span class="text-green-600 mr-2">✅</span>
                  <strong>สถานะ: คะแนนและสถานะได้รับการอัพเดตแล้ว</strong>
                </div>
                <div class="text-sm text-green-700 mt-1">
                  คะแนนปัจจุบัน: {{ rawScoreData.score }} คะแนน | อัพเดตล่าสุด: {{ rawScoreData.lastUpdated ? new Date(rawScoreData.lastUpdated).toLocaleString('th-TH') : 'ไม่ทราบ' }}
                </div>
              </div>
              
              <!-- Summary Statistics -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="bg-green-100 p-3 rounded text-center">
                  <div class="text-green-800 font-bold text-lg">{{ recheckResults.stats.correct }}</div>
                  <div class="text-green-600 text-sm">ตอบถูก</div>
                </div>
                <div class="bg-red-100 p-3 rounded text-center">
                  <div class="text-red-800 font-bold text-lg">{{ recheckResults.stats.incorrect }}</div>
                  <div class="text-red-600 text-sm">ตอบผิด</div>
                </div>
                <div class="bg-gray-100 p-3 rounded text-center">
                  <div class="text-gray-800 font-bold text-lg">{{ recheckResults.stats.unanswered }}</div>
                  <div class="text-gray-600 text-sm">ไม่ตอบ</div>
                </div>
                <div class="bg-orange-100 p-3 rounded text-center">
                  <div class="text-orange-800 font-bold text-lg">{{ recheckResults.stats.essay }}</div>
                  <div class="text-orange-600 text-sm">Essay</div>
                </div>
              </div>

              <!-- Score Calculation -->
              <div class="bg-white p-4 rounded border mb-4">
                <h5 class="font-bold text-gray-800 mb-2">การคำนวณคะแนน:</h5>
                
                <!-- Exam Info Summary -->
                <div v-if="rawScoreData.examInfo" class="bg-gray-50 p-3 rounded mb-3">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong class="text-gray-700">คะแนนรวม:</strong><br>
                      <span class="text-lg font-bold text-gray-800">{{ rawScoreData.examInfo.total || 'N/A' }}</span> คะแนน
                    </div>
                    <div>
                      <strong class="text-blue-700">คะแนนขั้นต่ำ:</strong><br>
                      <span class="text-lg font-bold text-blue-600">{{ rawScoreData.examInfo.measure || 'N/A' }}</span> คะแนน
                    </div>
                    <div>
                      <strong class="text-purple-700">เวลาที่กำหนด:</strong><br>
                      <span class="text-lg font-bold text-purple-600">{{ rawScoreData.examInfo.timer || 'N/A' }}</span> นาที
                    </div>
                    <div>
                      <strong class="text-green-700">ผลการสอบ:</strong><br>
                      <span class="text-lg font-bold" :class="getPassFailClass()">
                        {{ getPassFailText() }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Enrollment Analytics Summary -->
                <div v-if="enrollmentData && enrollmentData.analytics" class="bg-indigo-50 p-3 rounded mb-3">
                  <div class="text-sm font-medium text-indigo-800 mb-2">📊 ข้อมูลการลงทะเบียน:</div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <!-- Pre-test Analytics -->
                    <div v-if="enrollmentData.analytics.pre.req" class="bg-blue-100 p-2 rounded">
                      <div class="font-medium text-blue-800">Pre-test:</div>
                      <div class="text-xs text-blue-700">
                        <span v-if="enrollmentData.analytics.pre.has" class="text-green-700">✅</span>
                        <span v-else class="text-orange-700">⏳</span>
                        คะแนน: {{ enrollmentData.analytics.pre.score || 'N/A' }}/{{ enrollmentData.analytics.pre.measure || 'N/A' }}
                      </div>
                      <div class="text-xs" :class="enrollmentData.analytics.pre.result ? 'text-green-600' : 'text-red-600'">
                        {{ enrollmentData.analytics.pre.message || 'รอทำข้อสอบ' }}
                      </div>
                    </div>
                    
                    <!-- Post-test Analytics -->
                    <div v-if="enrollmentData.analytics.post.req" class="bg-green-100 p-2 rounded">
                      <div class="font-medium text-green-800">Post-test:</div>
                      <div class="text-xs text-green-700">
                        <span v-if="enrollmentData.analytics.post.has" class="text-green-700">✅</span>
                        <span v-else class="text-orange-700">⏳</span>
                        คะแนน: {{ enrollmentData.analytics.post.score || 'N/A' }}/{{ enrollmentData.analytics.post.measure || 'N/A' }}
                      </div>
                      <div class="text-xs" :class="enrollmentData.analytics.post.result ? 'text-green-600' : 'text-red-600'">
                        {{ enrollmentData.analytics.post.message || 'รอทำข้อสอบ' }}
                      </div>
                    </div>
                    
                    <!-- Overall Status -->
                    <div class="bg-gray-100 p-2 rounded">
                      <div class="font-medium text-gray-800">สถานะรวม:</div>
                      <div class="text-xs text-gray-700">
                        <span v-if="enrollmentData.analytics.status === 'complete'" class="text-green-700">✅</span>
                        <span v-else class="text-orange-700">⏳</span>
                        {{ enrollmentData.analytics.message || 'กำลังดำเนินการ' }}
                      </div>
                      <div class="text-xs text-gray-600 mt-1">
                        ความคืบหน้า: {{ enrollmentData.analytics.complete || 0 }}/{{ enrollmentData.analytics.total || 0 }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Current vs New Score Comparison -->
                <div class="bg-blue-50 p-3 rounded mb-3">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong class="text-blue-800">คะแนนปัจจุบัน:</strong><br>
                      <span class="text-2xl font-bold text-blue-600">{{ rawScoreData.score || 0 }}</span>
                    </div>
                    <div>
                      <strong class="text-green-800">คะแนนใหม่ (รวมการตรวจของแอดมิน):</strong><br>
                      <span class="text-2xl font-bold text-green-600">{{ finalScoreCalculation ? finalScoreCalculation.totalScore : recheckResults.scoreCalculation.totalScore }}</span>
                    </div>
                    <div>
                      <strong class="text-gray-800">สถานะปัจจุบัน:</strong><br>
                      <span class="px-2 py-1 rounded text-xs font-medium"
                            :class="rawScoreData.remark === 'pending_manual_grading' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">
                        {{ rawScoreData.remark === 'pending_manual_grading' ? 'รอตรวจ' : rawScoreData.remark }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>คะแนนตัวเลือกผสม:</strong><br>
                    {{ recheckResults.scoreCalculation.multipleChoiceScore }} / {{ recheckResults.scoreCalculation.maxMultipleChoiceScore }}
                    ({{ recheckResults.scoreCalculation.multipleChoicePercentage }}%)
                  </div>
                  <div>
                    <strong>คะแนน Essay:</strong><br>
                    <span class="text-blue-600 font-medium">{{ finalScoreCalculation ? finalScoreCalculation.essayScore : recheckResults.scoreCalculation.essayScore }}</span> / {{ recheckResults.scoreCalculation.maxEssayScore }}
                    ({{ finalScoreCalculation ? finalScoreCalculation.essayPercentage : recheckResults.scoreCalculation.essayPercentage }}%)
                    <span v-if="finalScoreCalculation && finalScoreCalculation.essayScore !== recheckResults.scoreCalculation.essayScore" class="text-xs text-blue-600 block">
                      (รวมคะแนนที่แอดมินให้)
                    </span>
                  </div>
                  <div>
                    <strong>คะแนนรวม:</strong><br>
                    <span class="text-green-600 font-bold">{{ finalScoreCalculation ? finalScoreCalculation.totalScore : recheckResults.scoreCalculation.totalScore }}</span> / {{ recheckResults.scoreCalculation.maxTotalScore }}
                    ({{ finalScoreCalculation ? finalScoreCalculation.totalPercentage : recheckResults.scoreCalculation.totalPercentage }}%)
                  </div>
                </div>
              </div>

              <!-- Question Details -->
              <div class="bg-white p-4 rounded border max-h-48 overflow-y-auto">
                <h5 class="font-bold text-gray-800 mb-2">รายละเอียดข้อคำถาม:</h5>
                <div class="space-y-2 text-sm">
                  <div v-for="(question, index) in recheckResults.questions" :key="question.questionId" class="flex justify-between items-center p-2 rounded"
                       :class="question.type === 'essay' ? 'bg-orange-50' : (question.isCorrect ? 'bg-green-50' : (question.userAnswer ? 'bg-red-50' : 'bg-gray-50'))">
                    <div>
                      <strong>ข้อ {{ index + 1 }}:</strong> 
                      <span v-if="question.type === 'essay'">
                        Essay 
                        <span v-if="getEssayScore(question.questionId)" class="text-blue-600 font-bold">
                          (แอดมิน: {{ getEssayScore(question.questionId) }}/5)
                        </span>
                        <span v-else class="text-gray-600">
                          (อัตโนมัติ: {{ question.essayScore || 0 }}/5)
                        </span>
                      </span>
                      <span v-else>
                        {{ question.isCorrect ? 'ถูก' : (question.userAnswer ? 'ผิด' : 'ไม่ตอบ') }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-600">
                      <span v-if="question.type === 'essay'">
                        {{ question.userAnswer && question.userAnswer.length > 50 ? question.userAnswer.substring(0, 50) + '...' : (question.userAnswer || 'ไม่ตอบ') }}
                        <span v-if="getEssayScore(question.questionId)" class="block text-blue-600 font-medium">
                          ✓ แอดมินให้คะแนนแล้ว
                        </span>
                        <span v-else class="block text-orange-600">
                          ⏳ ยังไม่ได้ให้คะแนน (ใช้คะแนนอัตโนมัติ)
                        </span>
                      </span>
                      <span v-else>
                        {{ question.isCorrect ? '✓' : (question.userAnswer ? '✗' : '—') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timestamp -->
              <div class="text-xs text-gray-500 mt-4">
                ตรวจสอบเมื่อ: {{ recheckResults.timestamp }}
              </div>
            </div>

            <!-- Questions Information -->
            <div v-if="rawScoreData.examInfo && rawScoreData.examInfo.questions && rawScoreData.examInfo.questions.length > 0" class="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex flex-col h-full">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4 class="font-bold text-indigo-800">คำถามข้อสอบ ({{ rawScoreData.examInfo.questions.length }} ข้อ)</h4>
                  <p class="text-sm text-indigo-600 mt-1">
                    {{ rawScoreData.examInfo.name }}
                  </p>
                </div>
                <div class="text-right text-sm text-indigo-700">
                  <div><strong>คะแนนรวม:</strong> {{ rawScoreData.examInfo.total }} คะแนน</div>
                  <div><strong>คะแนนขั้นต่ำ:</strong> {{ rawScoreData.examInfo.measure }} คะแนน</div>
                  <div><strong>เวลา:</strong> {{ rawScoreData.examInfo.timer }} นาที</div>
                </div>
              </div>
              <div class="space-y-4 flex-1 overflow-y-auto">
                <div v-for="(question, index) in rawScoreData.examInfo.questions" :key="question._id" class="bg-white p-4 rounded border">
                  <div class="flex justify-between items-start mb-2">
                    <div class="text-sm font-medium text-indigo-700">
                      ข้อ {{ index + 1 }} - {{ getQuestionTypeName(question.type) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Order: {{ question.order || 'N/A' }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-700 mb-3 font-medium" v-html="question.detail || 'ไม่มีรายละเอียด'"></div>
                  
                  <!-- Multiple Choice Questions -->
                  <div v-if="question.choices && question.choices.length > 0" class="mt-3 space-y-2">
                    <div class="text-xs font-medium text-gray-600 mb-2">ตัวเลือก ({{ question.choices.length }} ข้อ):</div>
                    <div class="space-y-2">
                      <div v-for="(choice, choiceIndex) in question.choices" :key="choice._id" 
                           class="p-2 rounded text-xs"
                           :class="getChoiceClass(choice, question, rawScoreData.answer)">
                        <div class="flex items-start space-x-2">
                          <span class="font-medium min-w-[20px]">{{ choice.order || (choiceIndex + 1) }}.</span>
                          <div class="flex-1">
                            <span v-html="choice.detail || 'ไม่มีรายละเอียด'"></span>
                            <div class="mt-1 flex flex-wrap gap-2">
                              <span v-if="choice._id === question.correct" class="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-bold">
                                ✓ คำตอบที่ถูกต้อง
                              </span>
                              <span v-if="getUserAnswer(question._id, rawScoreData.answer) === choice._id" class="inline-flex items-center px-2 py-1 rounded text-xs"
                                    :class="getUserAnswer(question._id, rawScoreData.answer) === question.correct ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'">
                                {{ getUserAnswer(question._id, rawScoreData.answer) === question.correct ? '👤 คำตอบของผู้สอบ (ถูก)' : '👤 คำตอบของผู้สอบ (ผิด)' }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Essay Questions -->
                  <div v-else-if="question.type === 'essay'" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div class="text-xs font-medium text-yellow-700 mb-2">คำถามเขียนเรียงความ:</div>
                    <div class="text-xs text-gray-600">
                      <div v-if="getEssayAnswer(question._id, rawScoreData.answer)" class="mt-2">
                        <div class="text-base font-bold text-gray-800 mb-2">คำตอบของผู้สอบ:</div>
                        <div class="bg-white p-3 rounded border mt-1 italic text-sm" v-html="getEssayAnswer(question._id, rawScoreData.answer)"></div>
                        
                        <!-- Get grading status for this essay -->
                        <!-- Essay Rating System -->
                        <div class="mt-3 p-3 rounded" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'">
                          <div class="text-sm font-medium mb-2" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'text-green-700' : 'text-blue-700'">
                            {{ rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'คะแนนที่ได้รับ:' : 'ให้คะแนนคำตอบ:' }}
                          </div>
                          <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-600 mr-2">คะแนน:</span>
                            
                            <!-- Graded State - Read Only -->
                            <div v-if="rawScoreData.remark === 'ตรวจสอบแล้ว'" class="flex space-x-1">
                              <div v-for="score in 5" :key="score"
                                   class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                                   :class="getGradedScoreButtonClass(score, getSavedEssayScore(question._id))">
                                {{ score }}
                              </div>
                            </div>
                            
                            <!-- Not Graded State - Interactive -->
                            <div v-else class="flex space-x-1">
                              <button v-for="score in 5" :key="score"
                                      @click="setEssayScore(question._id, score)"
                                      class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110"
                                      :class="getScoreButtonClass(score, getEssayScore(question._id))">
                                {{ score }}
                              </button>
                            </div>
                            
                            <span class="text-xs ml-3" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'text-green-600' : 'text-gray-500'">
                              คะแนนที่ให้: <span class="font-bold" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'text-green-600' : 'text-blue-600'">
                                {{ rawScoreData.remark === 'ตรวจสอบแล้ว' ? getSavedEssayScore(question._id) : (getEssayScore(question._id) || 'ยังไม่ให้คะแนน') }}
                              </span>
                            </span>
                          </div>
                          
                          <!-- Auto-calculated score display -->
                          <div v-if="recheckResults && rawScoreData.remark !== 'ตรวจสอบแล้ว'" class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <div class="text-xs text-green-700">
                              <strong>คะแนนที่คำนวณอัตโนมัติ:</strong>
                              <span class="font-bold text-green-600 ml-1">
                                {{ getAutoCalculatedEssayScore(question._id) }}/5
                              </span>
                              <span class="text-green-600 ml-1">
                                (จากความยาวคำตอบ: {{ getEssayAnswer(question._id, rawScoreData.answer) ? getEssayAnswer(question._id, rawScoreData.answer).length : 0 }} ตัวอักษร)
                              </span>
                            </div>
                          </div>
                          
                          <!-- Grading Status Info -->
                          <div v-if="rawScoreData.remark === 'ตรวจสอบแล้ว'" class="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                            <div class="text-xs text-green-700">
                              <strong>✅ ตรวจสอบแล้ว</strong>
                              <span class="ml-2">ผู้ตรวจ: {{ getSavedEssayGradedBy(question._id) }}</span>
                              <span class="ml-2">วันที่: {{ formatGradedDate(getSavedEssayGradedAt(question._id)) }}</span>
                            </div>
                          </div>
                          
                          <div v-if="rawScoreData.remark !== 'ตรวจสอบแล้ว'" class="mt-2 text-xs text-gray-500">
                            คลิกที่วงกลมเพื่อให้คะแนน (1 = น้อยที่สุด, 5 = มากที่สุด)
                          </div>
                          
                          <!-- Comments Section -->
                          <div class="mt-3 pt-2 border-t" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'border-green-200' : 'border-blue-200'">
                            <div class="text-xs font-medium mb-2" :class="rawScoreData.remark === 'ตรวจสอบแล้ว' ? 'text-green-700' : 'text-blue-700'">
                              ความคิดเห็นของผู้ตรวจ:
                            </div>
                            
                            <!-- Graded State - Read Only Comment -->
                            <div v-if="rawScoreData.remark === 'ตรวจสอบแล้ว'" class="w-full p-2 border rounded text-xs bg-green-50 border-green-300 text-green-800">
                              {{ getSavedEssayComment(question._id) || 'ไม่มีความคิดเห็นเพิ่มเติม' }}
                            </div>
                            
                            <!-- Not Graded State - Editable Comment -->
                            <textarea v-else
                              v-model="essayComments[question._id]"
                              placeholder="เพิ่มความคิดเห็นหรือข้อเสนอแนะสำหรับคำตอบนี้..."
                              class="w-full p-2 border border-blue-300 rounded text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="3"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-gray-500 italic">ไม่มีคำตอบ</div>
                    </div>
                  </div>
                  
                  <!-- Question Summary -->
                  <!-- <div class="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Question ID:</strong> {{ question._id }}<br>
                        <strong>Correct Answer ID:</strong> {{ question.correct || 'N/A' }}<br>
                        <strong>User Answer ID:</strong> {{ getUserAnswer(question._id, rawScoreData.answer) || 'ไม่ตอบ' }}
                      </div>
                      <div>
                        <strong>Question Type:</strong> {{ question.type }}<br>
                        <strong>Choices Count:</strong> {{ question.choices ? question.choices.length : 0 }}<br>
                        <strong>Result:</strong> 
                        <span v-if="question.type === 'essay'" class="text-yellow-600">
                          <span v-if="isGraded && getSavedEssayScore(question._id)" class="text-green-600 font-bold">
                            คะแนน: {{ getSavedEssayScore(question._id) }}/5 (ตรวจแล้ว)
                          </span>
                          <span v-else-if="getEssayScore(question._id)" class="text-blue-600 font-bold">
                            คะแนน: {{ getEssayScore(question._id) }}/5 (แอดมิน)
                          </span>
                          <span v-else class="text-orange-600">
                            {{ getAutoCalculatedEssayScore(question._id) ? `คะแนนอัตโนมัติ: ${getAutoCalculatedEssayScore(question._id)}/5` : 'รอให้คะแนน' }}
                          </span>
                        </span>
                        <span v-else-if="getUserAnswer(question._id, rawScoreData.answer) === question.correct" class="text-green-600 font-bold">ถูก ✓</span>
                        <span v-else-if="getUserAnswer(question._id, rawScoreData.answer)" class="text-red-600 font-bold">ผิด ✗</span>
                        <span v-else class="text-gray-600">ไม่ตอบ</span>
                      </div>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t p-4 flex justify-between items-center">
          <div class="flex space-x-2">
            <button @click="recheckAnswers" 
                    :disabled="isRechecking"
                    class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm flex items-center space-x-2">
              <span v-if="isRechecking" class="animate-spin">🔄</span>
              <span v-else>🔄</span>
              <span>{{ isRechecking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบคำตอบใหม่อีกครั้ง' }}</span>
            </button>
            
            <!-- Only show update button if not already graded -->
            <button v-if="!isGraded" 
                    @click="updateScoreAndRemark" 
                    :disabled="isUpdatingScore || !recheckResults"
                    class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded text-sm flex items-center space-x-2">
              <span v-if="isUpdatingScore" class="animate-spin">💾</span>
              <span v-else>💾</span>
              <span>{{ isUpdatingScore ? 'กำลังบันทึก...' : 'อัพเดตคะแนนและสถานะ' }}</span>
              <span v-if="finalScoreCalculation" class="bg-green-700 px-2 py-1 rounded text-xs ml-2">
                คะแนนรวม: {{ finalScoreCalculation.totalScore }}
              </span>
            </button>
            
            <!-- Show graded status if already graded -->
            <div v-if="isGraded" class="bg-green-100 text-green-800 px-4 py-2 rounded text-sm flex items-center space-x-2">
              <span>✅</span>
              <span class="font-medium">ตรวจสอบเรียบร้อยแล้ว</span>
              <span class="bg-green-200 px-2 py-1 rounded text-xs">
                คะแนน: {{ rawScoreData.score }}{{ rawScoreData.examInfo ? `/${rawScoreData.examInfo.total}` : '' }}
              </span>
              <span class="px-2 py-1 rounded text-xs font-bold" :class="getPassFailClass()">
                {{ getPassFailText() }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2">
            <button @click="closeExamReviewModal" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm">
              ปิด
            </button>
          </div>
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
      error: null,
      essayScores: {}, // Store essay scores { questionId: score }
      essayComments: {}, // Store essay comments { questionId: comment }
      recheckResults: null, // Store recheck results
      isRechecking: false, // Recheck loading state
      isUpdatingScore: false, // Update score loading state
      enrollmentData: null // Store enrollment data
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
    },

    // Check if exam is already graded and locked
    isGraded() {
      return this.rawScoreData && this.rawScoreData.remark === 'ตรวจสอบแล้ว';
    },
    
    // Calculate final scores including admin's manual grading
    finalScoreCalculation() {
      if (!this.recheckResults) return null;
      
      let finalEssayScore = 0;
      let maxEssayScore = 0;
      let multipleChoiceScore = this.recheckResults.scoreCalculation.multipleChoiceScore;
      let maxMultipleChoiceScore = this.recheckResults.scoreCalculation.maxMultipleChoiceScore;
      
      // Calculate essay scores with admin's manual scores
      this.recheckResults.questions.forEach(question => {
        if (question.type === 'essay') {
          maxEssayScore += 5;
          const adminScore = this.getEssayScore(question.questionId);
          const finalScore = adminScore !== null ? adminScore : (question.essayScore || 0);
          finalEssayScore += finalScore;
        }
      });
      
      const totalScore = multipleChoiceScore + finalEssayScore;
      const maxTotalScore = maxMultipleChoiceScore + maxEssayScore;
      const essayPercentage = maxEssayScore > 0 ? Math.round((finalEssayScore / maxEssayScore) * 100) : 0;
      const totalPercentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
      
      return {
        multipleChoiceScore,
        maxMultipleChoiceScore,
        multipleChoicePercentage: this.recheckResults.scoreCalculation.multipleChoicePercentage,
        essayScore: finalEssayScore,
        maxEssayScore,
        essayPercentage,
        totalScore,
        maxTotalScore,
        totalPercentage
      };
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
        
        // Disable body scroll
        this.disableBodyScroll();
        
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
        // Build and conditions for the match (score collection only)
        const andConditions = [
          { userID: this.currentExamStudentId }
        ];

        // Always use courseID for score collection matching
        if (this.currentExamId) {
          andConditions.push({ courseID: this.currentExamId });
          console.log('🎯 Using courseID filter for score collection:', this.currentExamId);
        }

        // Note: examType filter will be applied to exam collection, not score collection

        // Create aggregation pipeline with optimized lookup strategy
        let pipeline;
        
        if (this.currentMasterId) {
          // Use masterId directly for exam lookup - much simpler and faster
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
                        $and: [
                          { $eq: ["$courseId", "$$masterId"] },
                          ...(this.currentExamType !== 'general' ? [{ $eq: ["$type", this.currentExamType] }] : [])
                        ]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'questions',
                      let: { examId: { $toString: "$_id" } },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$examID", "$$examId"]
                            }
                          }
                        },
                        {
                          $lookup: {
                            from: 'answer',
                            let: { questionId: { $toString: "$_id" } },
                            pipeline: [
                              {
                                $match: {
                                  $expr: {
                                    $eq: ["$questionID", "$$questionId"]
                                  }
                                }
                              },
                              {
                                $sort: { order: 1 }
                              }
                            ],
                            as: 'choices'
                          }
                        }
                      ],
                      as: 'questions'
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
                      updatedAt: 1,
                      questions: 1
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
                'examInfo.updatedAt': 1,
                'examInfo.questions': 1
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
                              $and: [
                                { $eq: ["$courseId", "$$masterID"] },
                                ...(this.currentExamType !== 'general' ? [{ $eq: ["$type", this.currentExamType] }] : [])
                              ]
                            }
                          }
                        },
                        {
                          $lookup: {
                            from: 'questions',
                            let: { examId: { $toString: "$_id" } },
                            pipeline: [
                              {
                                $match: {
                                  $expr: {
                                    $eq: ["$examID", "$$examId"]
                                  }
                                }
                              },
                              {
                                $lookup: {
                                  from: 'answer',
                                  let: { questionId: { $toString: "$_id" } },
                                  pipeline: [
                                    {
                                      $match: {
                                        $expr: {
                                          $eq: ["$questionID", "$$questionId"]
                                        }
                                      }
                                    },
                                    {
                                      $sort: { order: 1 }
                                    }
                                  ],
                                  as: 'choices'
                                }
                              }
                            ],
                            as: 'questions'
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
                            updatedAt: 1,
                            questions: 1
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
                      'examInfo.updatedAt': 1,
                      'examInfo.questions': 1
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

        // Load saved essay scores and comments if graded
        if (this.rawScoreData && this.isGraded) {
          this.loadSavedEssayGrades();
        }

        // Load enrollment data for analytics
        await this.loadEnrollmentData();
        
      } catch (error) {
        console.error('❌ Error loading score data:', error);
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message;
      } finally {
        this.loading = false;
        console.log('🏁 loadScoreData completed');
      }
    },

    // Load saved essay grades from answer data
    loadSavedEssayGrades() {
      if (!this.rawScoreData || !this.rawScoreData.answer) return;
      
      console.log('📚 Loading saved essay grades...');
      
      Object.keys(this.rawScoreData.answer).forEach(questionId => {
        const questionAnswer = this.rawScoreData.answer[questionId];
        if (questionAnswer && Array.isArray(questionAnswer) && questionAnswer.length > 0) {
          const latestAnswer = questionAnswer[questionAnswer.length - 1];
          
          // If this is an essay with saved grade, load it to display
          if (latestAnswer.questionType === 'essay' && latestAnswer.score !== undefined) {
            console.log(`📝 Loaded saved essay score for ${questionId}:`, latestAnswer.score);
            // Don't set to this.essayScores since it's read-only mode
            // We'll use getSavedEssayScore() method instead
          }
        }
      });
    },

    // Load enrollment data
    async loadEnrollmentData() {
      try {
        console.log('📈 Loading enrollment data...');
        
        const response = await this.$Request.POST('enroll/aggregate', {
          pipeline: [
            {
              $match: {
                courseID: this.currentExamId,
                userID: this.currentExamStudentId
              }
            }
          ]
        }, this.configs.key);

        if (response.status === 200 && response.data && response.data.length > 0) {
          this.enrollmentData = response.data[0];
          console.log('✅ Enrollment data loaded:', this.enrollmentData);
        } else {
          console.warn('⚠️ No enrollment data found');
          this.enrollmentData = null;
        }
      } catch (error) {
        console.error('❌ Error loading enrollment data:', error);
        this.enrollmentData = null;
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
      this.essayScores = {}; // Reset essay scores
      this.essayComments = {}; // Reset essay comments
      this.recheckResults = null; // Reset recheck results
      this.isRechecking = false; // Reset recheck state
      this.isUpdatingScore = false; // Reset update score state
      this.enrollmentData = null; // Reset enrollment data
      
      // Re-enable body scroll
      this.enableBodyScroll();
      
      // Emit event to parent to refresh data
      this.$emit('exam-review-closed');
    },

    // Body scroll management
    disableBodyScroll() {
      document.body.style.overflow = 'hidden';
    },

    enableBodyScroll() {
      document.body.style.overflow = '';
    },

    // Recheck answers functionality
    async recheckAnswers() {
      if (!this.rawScoreData || !this.rawScoreData.examInfo || !this.rawScoreData.examInfo.questions) {
        console.warn('⚠️ No exam data available for rechecking');
        return;
      }

      console.log('🔄 Starting answer recheck...');
      this.isRechecking = true;

      try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const questions = this.rawScoreData.examInfo.questions;
        const answerData = this.rawScoreData.answer;

        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        let essayCount = 0;
        let totalEssayScore = 0;
        let maxEssayScore = 0;

        const questionDetails = questions.map((question, index) => {
          const questionDetail = {
            questionId: question._id,
            questionNumber: index + 1,
            type: question.type,
            userAnswer: null,
            correctAnswer: question.correct,
            isCorrect: false,
            essayScore: null
          };

          if (question.type === 'essay') {
            essayCount++;
            maxEssayScore += 5; // Maximum 5 points per essay
            
            // Get essay answer
            const essayAnswer = this.getEssayAnswer(question._id, answerData);
            questionDetail.userAnswer = essayAnswer;
            
            // Calculate essay score based on answer length and content
            let essayScore = 0;
            if (essayAnswer && essayAnswer.trim().length > 0) {
              const answerLength = essayAnswer.trim().length;
              if (answerLength > 200) {
                essayScore = 5; // Full score for comprehensive answer
              } else if (answerLength > 100) {
                essayScore = 4; // Good score for adequate answer
              } else if (answerLength > 50) {
                essayScore = 3; // Fair score for short answer
              } else if (answerLength > 20) {
                essayScore = 2; // Low score for very short answer
              } else {
                essayScore = 1; // Minimum score for any attempt
              }
            }
            
            questionDetail.essayScore = essayScore;
            totalEssayScore += essayScore;
          } else {
            // Multiple choice question
            const userAnswer = this.getUserAnswer(question._id, answerData);
            questionDetail.userAnswer = userAnswer;
            
            if (userAnswer) {
              if (userAnswer === question.correct) {
                correctCount++;
                questionDetail.isCorrect = true;
              } else {
                incorrectCount++;
                questionDetail.isCorrect = false;
              }
            } else {
              unansweredCount++;
            }
          }

          return questionDetail;
        });

        // Calculate scores
        const multipleChoiceQuestions = questions.filter(q => q.type !== 'essay').length;
        const multipleChoiceScore = correctCount;
        const maxMultipleChoiceScore = multipleChoiceQuestions;
        const multipleChoicePercentage = maxMultipleChoiceScore > 0 ? Math.round((multipleChoiceScore / maxMultipleChoiceScore) * 100) : 0;

        const essayPercentage = maxEssayScore > 0 ? Math.round((totalEssayScore / maxEssayScore) * 100) : 0;

        // Total score calculation (you can adjust weighting as needed)
        const totalMaxScore = maxMultipleChoiceScore + maxEssayScore;
        const totalScore = multipleChoiceScore + totalEssayScore;
        const totalPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

        this.recheckResults = {
          timestamp: new Date().toLocaleString('th-TH'),
          stats: {
            correct: correctCount,
            incorrect: incorrectCount,
            unanswered: unansweredCount,
            essay: essayCount
          },
          scoreCalculation: {
            multipleChoiceScore,
            maxMultipleChoiceScore,
            multipleChoicePercentage,
            essayScore: totalEssayScore,
            maxEssayScore,
            essayPercentage,
            totalScore,
            maxTotalScore: totalMaxScore,
            totalPercentage
          },
          questions: questionDetails
        };

        console.log('✅ Recheck completed:', this.recheckResults);

      } catch (error) {
        console.error('❌ Error during recheck:', error);
      } finally {
        this.isRechecking = false;
      }
    },
    
    // Update score and remark functionality
    async updateScoreAndRemark() {
      if (!this.recheckResults || !this.rawScoreData) {
        console.warn('⚠️ No recheck results or score data available for update');
        alert('ไม่สามารถอัพเดตคะแนนได้ กรุณาตรวจสอบคำตอบใหม่ก่อน');
        return;
      }

      // Show confirmation dialog
      const currentScore = this.rawScoreData.score || 0;
      const minimumScore = this.rawScoreData.examInfo ? this.rawScoreData.examInfo.measure : 0;
      const totalScore = this.rawScoreData.examInfo ? this.rawScoreData.examInfo.total : 0;
      
      // Check if there are essay questions that haven't been manually graded
      const essayQuestions = this.recheckResults.questions.filter(q => q.type === 'essay');
      const ungradedEssays = essayQuestions.filter(q => !this.getEssayScore(q.questionId));
      
      let confirmMessage = `คุณต้องการอัพเดตคะแนนหรือไม่?\n\n`;
      confirmMessage += `คะแนนปัจจุบัน: ${currentScore}/${totalScore}\n`;
      confirmMessage += `คะแนนขั้นต่ำ: ${minimumScore} คะแนน\n`;
      
      if (ungradedEssays.length > 0) {
        confirmMessage += `\n⚠️ คำเตือน: มีคำถาม Essay ${ungradedEssays.length} ข้อที่ยังไม่ได้ให้คะแนนด้วยตนเอง\n`;
        confirmMessage += `ระบบจะใช้คะแนนที่คำนวณอัตโนมัติแทน\n`;
        confirmMessage += `\nคำถาม Essay ที่ยังไม่ได้ตรวจ:\n`;
        ungradedEssays.forEach((q) => {
          confirmMessage += `- ข้อ ${this.recheckResults.questions.indexOf(q) + 1}: คะแนนอัตโนมัติ ${q.essayScore}/5\n`;
        });
      }
      
      // Calculate final score with admin's manual scoring
      let finalTotalEssayScore = 0;
      let finalMultipleChoiceScore = 0;
      
      this.recheckResults.questions.forEach(question => {
        if (question.type === 'essay') {
          // Always prioritize admin's manual score over auto-calculated score
          const adminScore = this.getEssayScore(question.questionId);
          const finalScore = adminScore !== null ? adminScore : (question.essayScore || 0);
          finalTotalEssayScore += finalScore;
        } else if (question.isCorrect) {
          finalMultipleChoiceScore++;
        }
      });
      
      const finalTotalScore = finalMultipleChoiceScore + finalTotalEssayScore;
      
      confirmMessage += `\nคะแนนใหม่: ${finalTotalScore}/${totalScore}\n`;
      confirmMessage += `(ตัวเลือก: ${finalMultipleChoiceScore}, Essay: ${finalTotalEssayScore})\n`;
      
      // Show pass/fail status
      const currentPassFail = currentScore >= minimumScore ? 'ผ่าน ✅' : 'ไม่ผ่าน ❌';
      const newPassFail = finalTotalScore >= minimumScore ? 'ผ่าน ✅' : 'ไม่ผ่าน ❌';
      
      confirmMessage += `\nผลการสอบ:\n`;
      confirmMessage += `- ปัจจุบัน: ${currentPassFail} (${currentScore}/${minimumScore})\n`;
      confirmMessage += `- ใหม่: ${newPassFail} (${finalTotalScore}/${minimumScore})\n`;
      
      // Show detailed essay scoring information
      if (essayQuestions.length > 0) {
        confirmMessage += `\nรายละเอียดคะแนน Essay:\n`;
        essayQuestions.forEach(question => {
          const questionIndex = this.recheckResults.questions.indexOf(question) + 1;
          const adminScore = this.getEssayScore(question.questionId);
          const autoScore = question.essayScore || 0;
          
          if (adminScore !== null) {
            confirmMessage += `- ข้อ ${questionIndex}: ${adminScore}/5 (แอดมินให้คะแนน)\n`;
          } else {
            confirmMessage += `- ข้อ ${questionIndex}: ${autoScore}/5 (คำนวณอัตโนมัติ)\n`;
          }
        });
      }
      
      confirmMessage += `\nสถานะจะเปลี่ยนเป็น: "ตรวจสอบแล้ว"\n\n`;
      confirmMessage += `การดำเนินการนี้ไม่สามารถย้อนกลับได้`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      console.log('💾 Starting score and remark update...');
      this.isUpdatingScore = true;

      try {
        // Prepare the updated score data
        const newRemark = "ตรวจสอบแล้ว";
        
        // Prepare essay scores for answer data
        const updatedAnswerData = { ...this.rawScoreData.answer };
        
        // Update essay answers with scores from admin's manual grading
        this.recheckResults.questions.forEach(question => {
          if (question.type === 'essay') {
            const questionId = question.questionId;
            // Use admin's manual score if available, otherwise use auto-calculated score
            const finalEssayScore = this.getEssayScore(questionId) || question.essayScore || 0;
            
            if (updatedAnswerData[questionId] && updatedAnswerData[questionId].length > 0) {
              // Update the latest answer entry with score
              const latestAnswerIndex = updatedAnswerData[questionId].length - 1;
              updatedAnswerData[questionId][latestAnswerIndex] = {
                ...updatedAnswerData[questionId][latestAnswerIndex],
                score: finalEssayScore,
                gradedBy: this.getEssayScore(questionId) ? 'manual_admin' : 'auto_system',
                gradedAt: new Date().toISOString(),
                comment: this.essayComments[questionId] || null
              };
            }
            
            // Update the question detail for final calculation
            question.essayScore = finalEssayScore;
          }
        });
        
        // Recalculate total score with admin's manual scores
        let totalEssayScore = 0;
        let multipleChoiceScore = 0;
        
        this.recheckResults.questions.forEach(question => {
          if (question.type === 'essay') {
            const finalScore = this.getEssayScore(question.questionId) || question.essayScore || 0;
            totalEssayScore += finalScore;
          } else if (question.isCorrect) {
            multipleChoiceScore++;
          }
        });
        
        const finalTotalScore = multipleChoiceScore + totalEssayScore;

        // Create update payload with new format
        const updateData = {
          score: finalTotalScore,
          remark: newRemark,
          answer: updatedAnswerData,
          lastUpdated: new Date().toISOString(),
          gradedBy: 'admin_review',
          essayGradingComplete: true,
          gradingDetails: {
            multipleChoiceScore: multipleChoiceScore,
            essayScore: totalEssayScore,
            totalQuestions: this.recheckResults.questions.length,
            essayQuestions: this.recheckResults.questions.filter(q => q.type === 'essay').length,
            gradedAt: new Date().toISOString()
          }
        };

                console.log("Update data:", JSON.stringify(updateData, null, 2));

        // Use PUT method with specific ID endpoint
        const scoreId = this.rawScoreData._id;
        const response = await this.$Request.PUT(`score/${scoreId}`, { data: updateData }, this.configs.key);
        console.log('📋 Update API response:', response);
        
        const { status } = response;

        if (status === 200) {
          // Update local data
          this.rawScoreData.score = finalTotalScore;
          this.rawScoreData.remark = newRemark;
          this.rawScoreData.answer = updatedAnswerData;
          this.rawScoreData.lastUpdated = new Date().toISOString();
          this.rawScoreData.gradedBy = 'admin_review';

          console.log('✅ Score and remark updated successfully');
          
          // Update enrollment analytics after successful score update
          await this.updateEnrollmentAnalytics(finalTotalScore, minimumScore);
          
          // Show success message (using native alert for now, can be replaced with toast library)
          alert('อัพเดตคะแนนและสถานะเรียบร้อยแล้ว');

          // Emit event for parent component
          this.$emit('score-updated', {
            examId: this.currentExamId,
            userId: this.currentExamStudentId,
            newScore: finalTotalScore,
            newRemark: newRemark
          });

        } else {
          console.error('❌ Failed to update score:', response);
          alert('เกิดข้อผิดพลาดในการอัพเดตคะแนน');
        }
        
      } catch (error) {
        console.error('❌ Error updating score and remark:', error);
        alert('เกิดข้อผิดพลาดในการอัพเดตคะแนน: ' + error.message);
      } finally {
        this.isUpdatingScore = false;
      }
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
    },

    // Answer Analysis Helper Methods
    getUserAnswer(questionId, answerData) {
      if (!answerData || !questionId) return null;
      
      const questionAnswer = answerData[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.answer || null;
    },

    getEssayAnswer(questionId, answerData) {
      if (!answerData || !questionId) return null;
      
      const questionAnswer = answerData[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.answer || null;
    },

    getChoiceClass(choice, question, answerData) {
      const userAnswer = this.getUserAnswer(question._id, answerData);
      const isCorrect = choice._id === question.correct;
      const isUserChoice = choice._id === userAnswer;
      
      if (isCorrect && isUserChoice) {
        return 'bg-green-100 border-l-4 border-green-500'; // ถูกและเลือก
      } else if (isCorrect) {
        return 'bg-green-50 border-l-4 border-green-300'; // ถูกแต่ไม่เลือก
      } else if (isUserChoice) {
        return 'bg-red-100 border-l-4 border-red-500'; // ผิดแต่เลือก
      } else {
        return 'bg-gray-50 border-l-4 border-gray-200'; // ไม่เกี่ยวข้อง
      }
    },

    // Essay Scoring Methods
    setEssayScore(questionId, score) {
      // Only allow setting score if not already graded
      if (this.isGraded) {
        alert('ข้อสอบนี้ตรวจสอบแล้ว ไม่สามารถแก้ไขคะแนนได้');
        return;
      }
      
      this.essayScores[questionId] = score;
      console.log('📝 Essay score set:', { questionId, score });
      
      // Here you can add API call to save the score
      // this.saveEssayScore(questionId, score);
    },

    getEssayScore(questionId) {
      // If already graded, return null (use saved score instead)
      if (this.isGraded) {
        return null;
      }
      return this.essayScores[questionId] || null;
    },

    // Get saved essay score from answer data
    getSavedEssayScore(questionId) {
      if (!this.rawScoreData || !this.rawScoreData.answer || !questionId) return null;
      
      const questionAnswer = this.rawScoreData.answer[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.score || null;
    },

    // Get saved essay comment from answer data
    getSavedEssayComment(questionId) {
      if (!this.rawScoreData || !this.rawScoreData.answer || !questionId) return null;
      
      const questionAnswer = this.rawScoreData.answer[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.comment || null;
    },

    // Get who graded the essay
    getSavedEssayGradedBy(questionId) {
      if (!this.rawScoreData || !this.rawScoreData.answer || !questionId) return null;
      
      const questionAnswer = this.rawScoreData.answer[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.gradedBy === 'manual_admin' ? 'แอดมิน' : 'ระบบอัตโนมัติ';
    },

    // Get when the essay was graded
    getSavedEssayGradedAt(questionId) {
      if (!this.rawScoreData || !this.rawScoreData.answer || !questionId) return null;
      
      const questionAnswer = this.rawScoreData.answer[questionId];
      if (!questionAnswer || !Array.isArray(questionAnswer) || questionAnswer.length === 0) return null;
      
      // Get the latest answer (last in array)
      const latestAnswer = questionAnswer[questionAnswer.length - 1];
      return latestAnswer.gradedAt || null;
    },

    // Format graded date
    formatGradedDate(dateString) {
      if (!dateString) return 'ไม่ทราบ';
      return new Date(dateString).toLocaleString('th-TH');
    },

    // Check if student passed the exam based on minimum score (measure)
    getPassFailText() {
      if (!this.rawScoreData || !this.rawScoreData.examInfo) return 'N/A';
      
      const currentScore = this.rawScoreData.score || 0;
      const newScore = this.finalScoreCalculation ? this.finalScoreCalculation.totalScore : (this.recheckResults ? this.recheckResults.scoreCalculation.totalScore : currentScore);
      const minimumScore = this.rawScoreData.examInfo.measure || 0;
      
      // Use the higher score (current or new calculated score)
      const scoreToCheck = Math.max(currentScore, newScore);
      
      if (scoreToCheck >= minimumScore) {
        return 'ผ่าน ✅';
      } else {
        return 'ไม่ผ่าน ❌';
      }
    },

    // Get CSS class for pass/fail status
    getPassFailClass() {
      if (!this.rawScoreData || !this.rawScoreData.examInfo) return 'text-gray-600';
      
      const currentScore = this.rawScoreData.score || 0;
      const newScore = this.finalScoreCalculation ? this.finalScoreCalculation.totalScore : (this.recheckResults ? this.recheckResults.scoreCalculation.totalScore : currentScore);
      const minimumScore = this.rawScoreData.examInfo.measure || 0;
      
      // Use the higher score (current or new calculated score)
      const scoreToCheck = Math.max(currentScore, newScore);
      
      if (scoreToCheck >= minimumScore) {
        return 'text-green-600';
      } else {
        return 'text-red-600';
      }
    },

    getAutoCalculatedEssayScore(questionId) {
      if (!this.recheckResults || !this.recheckResults.questions) return 0;
      
      const question = this.recheckResults.questions.find(q => q.questionId === questionId);
      return question ? (question.essayScore || 0) : 0;
    },

    getScoreButtonClass(score, currentScore) {
      if (score === currentScore) {
        // Selected score
        if (score <= 2) {
          return 'bg-red-500 text-white border-red-500 shadow-lg'; // Low score - red
        } else if (score <= 3) {
          return 'bg-yellow-500 text-white border-yellow-500 shadow-lg'; // Medium score - yellow
        } else {
          return 'bg-green-500 text-white border-green-500 shadow-lg'; // High score - green
        }
      } else {
        // Unselected score
        if (score <= 2) {
          return 'bg-white text-red-500 border-red-300 hover:bg-red-50'; // Low score hover
        } else if (score <= 3) {
          return 'bg-white text-yellow-500 border-yellow-300 hover:bg-yellow-50'; // Medium score hover
        } else {
          return 'bg-white text-green-500 border-green-300 hover:bg-green-50'; // High score hover
        }
      }
    },

    // Score button class for graded (read-only) state
    getGradedScoreButtonClass(score, gradedScore) {
      if (score === gradedScore) {
        // This is the graded score
        if (score <= 2) {
          return 'bg-red-500 text-white border-red-500 shadow-lg'; // Low score - red
        } else if (score <= 3) {
          return 'bg-yellow-500 text-white border-yellow-500 shadow-lg'; // Medium score - yellow
        } else {
          return 'bg-green-500 text-white border-green-500 shadow-lg'; // High score - green
        }
      } else {
        // Not the graded score - show as inactive/grayed out
        return 'bg-gray-100 text-gray-400 border-gray-300';
      }
    },

    // Optional: Save essay score to API
    async saveEssayScore(questionId, score) {
      try {
        // Implement API call to save essay score
        console.log('💾 Saving essay score to API:', { questionId, score });
        // const response = await this.$Request.POST('essay-score', { questionId, score }, this.configs.key);
      } catch (error) {
        console.error('❌ Error saving essay score:', error);
      }
    },

    // Update enrollment analytics after score update
    async updateEnrollmentAnalytics(finalScore, minimumScore) {
      try {
        console.log('📈 Updating enrollment analytics...', {
          examType: this.currentExamType,
          finalScore,
          minimumScore,
          courseID: this.currentExamId,
          userID: this.currentExamStudentId
        });

        // First, get the current enrollment data
        const enrollmentResponse = await this.$Request.POST('enroll/aggregate', {
          pipeline: [
            {
              $match: {
                courseID: this.currentExamId,
                userID: this.currentExamStudentId
              }
            }
          ]
        }, this.configs.key);

        console.log('📋 Enrollment response:', enrollmentResponse);

        if (enrollmentResponse.status !== 200 || !enrollmentResponse.data || enrollmentResponse.data.length === 0) {
          console.warn('⚠️ No enrollment data found');
          return;
        }

        const enrollmentData = enrollmentResponse.data[0];
        console.log('📊 Current enrollment data:', enrollmentData);

        // Determine if the student passed
        const passed = finalScore >= minimumScore;
        const passMessage = passed ? 'Passed' : 'Failed';

        // Create updated analytics object
        const updatedAnalytics = { ...enrollmentData.analytics };

        // Update the specific exam type (pre or post)
        const examType = this.currentExamType === 'general' ? 'post' : this.currentExamType;
        
        updatedAnalytics[examType] = {
          req: true,
          has: true,
          measure: minimumScore,
          score: finalScore,
          result: passed,
          message: passMessage
        };

        console.log('🔄 Updated analytics:', updatedAnalytics);

        // Update the enrollment record
        const updateResponse = await this.$Request.PUT(`enroll/${enrollmentData._id}`, {
          data: {
            analytics: updatedAnalytics,
            updatedAt: new Date().toISOString()
          }
        }, this.configs.key);

        console.log('📝 Enrollment update response:', updateResponse);

        if (updateResponse.status === 200) {
          console.log('✅ Enrollment analytics updated successfully');
          
          // Update local enrollment data
          if (this.enrollmentData) {
            this.enrollmentData.analytics = updatedAnalytics;
            this.enrollmentData.updatedAt = new Date().toISOString();
          }
        } else {
          console.error('❌ Failed to update enrollment analytics:', updateResponse);
        }

      } catch (error) {
        console.error('❌ Error updating enrollment analytics:', error);
        // Don't throw error - enrollment update failure shouldn't break the main flow
      }
    }
  },
  beforeUnmount() {
    // Ensure body scroll is re-enabled when component is destroyed
    this.enableBodyScroll();
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
