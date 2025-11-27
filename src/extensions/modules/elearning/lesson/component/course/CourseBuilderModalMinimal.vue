<template>
  <div class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" @click="closeModal">
      <div class="bg-white w-[95vw] h-[90vh] rounded-lg overflow-hidden shadow-2xl" @click.stop>
        
        <!-- Full Width Layout -->
        <div class="flex h-full">
          
          <!-- Sidebar -->
          <div class="w-80 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
            <!-- Sidebar Header -->
            <div class="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h1 class="text-xl font-semibold text-gray-900">สร้างหลักสูตรอัตโนมัติ</h1>
                <p class="text-sm text-gray-500 mt-1">ขั้นตอนที่ {{ currentStep + 1 }}/7</p>
              </div>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <!-- Progress Steps -->
            <div class="flex-1 p-6 overflow-y-auto">
              <div 
                v-for="(step, index) in steps" 
                :key="'step-' + index"
                class="flex items-start gap-3 mb-4 transition-opacity"
                :class="{ 'opacity-50': index > currentStep }"
              >
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                  :class="[
                    index < currentStep ? 'bg-green-500 text-white' : 
                    index === currentStep ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-600'
                  ]"
                >
                  <i v-show="index < currentStep" class="fas fa-check text-xs"></i>
                  <span v-show="index >= currentStep">{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 mb-1">{{ step.title }}</p>
                  <p class="text-xs text-gray-500">{{ step.description }}</p>
                </div>
              </div>
            </div>
            
            <!-- Sidebar Footer -->
            <div class="p-6 border-t border-gray-200">
              <div class="text-xs text-gray-500 flex items-center gap-2">
                <i class="fas fa-save"></i>
                บันทึกอัตโนมัติ: {{ lastSaved }}
              </div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="flex-1 flex flex-col bg-white">
            
            <!-- Content Header -->
            <div class="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ getStepTitle() }}</h2>
                <p class="text-gray-600 mt-1">{{ getStepDescription() }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">{{ getProgressPercentage() }}% เสร็จสิ้น</span>
              </div>
            </div>
            
            <!-- Content Body -->
            <div class="flex-1 overflow-y-auto bg-gray-50 p-8">
              <div class="h-full flex items-center justify-center">
                
                <!-- Step Content Area -->
                <div class="w-full max-w-6xl">
                  
                  <!-- Step 0: File Upload -->
                  <div v-show="currentStep === 0" class="w-full">
                    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="font-medium text-blue-900 mb-1">โหมดทดลอง</p>
                        <p class="text-sm text-blue-700">ใช้ไฟล์ตัวอย่างจากบริษัท ABC</p>
                      </div>
                      
                      <div 
                        class="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-4 text-center" 
                        @click="triggerFileUpload"
                      >
                        <i class="fas fa-file-upload text-3xl text-gray-400 mb-3"></i>
                        <p class="text-sm text-gray-600 mb-1">คลิกเพื่อเลือกไฟล์หรือลากมาวาง</p>
                        <p class="text-xs text-gray-500">PDF, DOC, DOCX, TXT (สูงสุด 10MB)</p>
                      </div>
                      
                      <div class="mt-4">
                        <div class="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <i class="fas fa-file-pdf text-red-500"></i>
                            <div>
                              <p class="text-sm font-medium text-gray-900">คู่มือพนักงาน_ABC.pdf</p>
                              <p class="text-xs text-gray-500">2.3 MB • โครงสร้าง 15 หน้า, หัวข้อ 23 รายการ</p>
                            </div>
                          </div>
                          <button class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 1: Settings -->
                  <div v-show="currentStep === 1" class="w-full">
                    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
                      <h3 class="text-lg font-semibold text-gray-900 mb-6">ตั้งค่าหลักสูตร</h3>
                      <div class="grid grid-cols-2 gap-6 mb-8">
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-2">จำนวนบทเรียน</label>
                          <select v-model="courseSettings.numberOfChapters" class="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="3">3 บท</option>
                            <option value="4">4 บท</option>
                            <option value="5">5 บท</option>
                            <option value="6">6 บท</option>
                          </select>
                        </div>
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-2">จำนวนข้อสอบ</label>
                          <select v-model="courseSettings.numberOfQuestions" class="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="5">5 ข้อ</option>
                            <option value="10">10 ข้อ</option>
                            <option value="15">15 ข้อ</option>
                            <option value="20">20 ข้อ</option>
                          </select>
                        </div>
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-2">ระดับความยาก</label>
                          <select v-model="courseSettings.difficultyLevel" class="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="easy">ง่าย</option>
                            <option value="medium">ปานกลาง</option>
                            <option value="hard">ยาก</option>
                          </select>
                        </div>
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-2">เวลาโดยประมาณ</label>
                          <select v-model="courseSettings.estimatedTime" class="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="30">30 นาที</option>
                            <option value="45">45 นาที</option>
                            <option value="60">1 ชั่วโมง</option>
                            <option value="90">1.5 ชั่วโมง</option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="border-t border-gray-200 pt-6">
                        <h4 class="text-base font-semibold text-gray-900 mb-4">ตัวเลือกการทดสอบ</h4>
                        <div class="flex flex-col gap-3">
                          <label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                            <input type="checkbox" v-model="courseSettings.hasPreTest" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            แบบทดสอบก่อนเรียน
                          </label>
                          <label class="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                            <input type="checkbox" v-model="courseSettings.hasPostTest" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            แบบทดสอบหลังเรียน
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 2: Processing -->
                  <div v-show="currentStep === 2" class="w-full">
                    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
                      <div class="mb-8">
                        <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">กำลังประมวลผลเอกสาร</h3>
                        <p class="text-gray-600">กรุณารอสักครู่...</p>
                      </div>
                      
                      <div class="flex flex-col gap-4 text-left">
                        <div class="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <i class="fas fa-check-circle text-green-500 text-lg"></i>
                          <span class="text-sm text-green-800">วิเคราะห์โครงสร้างเอกสาร</span>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div class="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                          <span class="text-sm text-blue-800">สร้างโครงสร้างหลักสูตร</span>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div class="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                          <span class="text-sm text-gray-600">สร้างคำถามทดสอบ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 3: Course Structure -->
                  <div v-show="currentStep === 3" class="w-full">
                    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
                      <h3 class="text-lg font-semibold text-gray-900 mb-6">ข้อมูลหลักสูตร</h3>
                      <div class="space-y-6">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อหลักสูตร</label>
                          <input 
                            type="text" 
                            v-model="courseTitle"
                            class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                          <textarea 
                            v-model="courseDescription"
                            class="w-full p-3 border border-gray-300 rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </div>
                        
                        <div class="border-t border-gray-200 pt-6">
                          <button @click="regenerateCourse" class="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100">
                            <i class="fas fa-redo"></i>
                            สร้างใหม่
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 4: Content -->
                  <div v-show="currentStep === 4" class="w-full">
                    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-8">
                      <h3 class="text-lg font-semibold text-gray-900 mb-6">แก้ไขเนื้อหาบทเรียน</h3>
                      <div class="flex gap-2 mb-6 pb-4 border-b border-gray-200">
                        <button 
                          v-for="i in courseSettings.numberOfChapters" 
                          :key="'tab-' + i"
                          class="px-4 py-2 text-sm rounded-lg border transition-colors"
                          :class="selectedChapter === i ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
                          @click="selectedChapter = i"
                        >
                          บทที่ {{ i }}
                        </button>
                      </div>
                      
                      <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex gap-2">
                          <button class="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
                            <i class="fas fa-bold text-gray-600"></i>
                          </button>
                          <button class="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
                            <i class="fas fa-italic text-gray-600"></i>
                          </button>
                          <button class="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
                            <i class="fas fa-list text-gray-600"></i>
                          </button>
                        </div>
                        <textarea 
                          class="w-full h-80 p-4 border-none resize-none focus:outline-none text-sm leading-relaxed"
                          :placeholder="'เนื้อหาบทที่ ' + selectedChapter"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 5: Quiz -->
                  <div v-show="currentStep === 5" class="w-full">
                    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
                      <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">จัดการคำถามทดสอบ</h3>
                        <button @click="addQuestion" class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                          <i class="fas fa-plus"></i>
                          เพิ่มคำถาม
                        </button>
                      </div>
                      
                      <div class="space-y-6">
                        <div 
                          v-for="(question, index) in quizQuestions" 
                          :key="'q-' + index"
                          class="border border-gray-200 rounded-lg p-6 bg-gray-50"
                        >
                          <div class="flex justify-between items-center mb-4">
                            <span class="text-sm font-semibold text-gray-700">คำถามที่ {{ index + 1 }}</span>
                            <button @click="removeQuestion(index)" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                          
                          <div class="space-y-4">
                            <input 
                              type="text" 
                              v-model="question.text"
                              class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ใส่คำถาม..."
                            >
                            
                            <div class="space-y-2">
                              <div 
                                v-for="(option, optIndex) in question.options" 
                                :key="'opt-' + optIndex"
                                class="flex items-center gap-3"
                              >
                                <input 
                                  type="radio" 
                                  :name="'question-' + index"
                                  :value="optIndex"
                                  v-model="question.correctAnswer"
                                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                >
                                <input 
                                  type="text" 
                                  v-model="option.text"
                                  class="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  :placeholder="'ตัวเลือก ' + (optIndex + 1)"
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Step 6: Publish -->
                  <div v-show="currentStep === 6" class="w-full">
                    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
                      <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start gap-4 text-left">
                        <i class="fas fa-check-circle text-green-500 text-xl mt-1"></i>
                        <div>
                          <h3 class="text-base font-semibold text-green-900 mb-1">พร้อมเผยแพร่</h3>
                          <p class="text-sm text-green-700">หลักสูตรของคุณผ่านการตรวจสอบเรียบร้อยแล้ว</p>
                        </div>
                      </div>
                      
                      <div class="border border-gray-200 rounded-lg p-6 text-left">
                        <h4 class="text-base font-semibold text-gray-900 mb-4">สรุปหลักสูตร</h4>
                        <ul class="space-y-2 text-sm text-gray-600">
                          <li>• ชื่อ: {{ courseTitle }}</li>
                          <li>• บทเรียน: {{ courseSettings.numberOfChapters }} บท</li>
                          <li>• คำถาม: {{ courseSettings.numberOfQuestions }} ข้อ</li>
                          <li>• ระยะเวลา: ประมาณ {{ courseSettings.estimatedTime }} นาที</li>
                          <li>• ระดับความยาก: {{ getDifficultyText() }}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                </div>
                
              </div>
            </div>
            
            <!-- Content Footer -->
            <div v-show="currentStep !== 2" class="bg-white border-t border-gray-200 px-8 py-6 flex justify-between items-center">
              <span class="text-sm text-gray-500">ขั้นตอนที่ {{ currentStep + 1 }} จาก 7</span>
              <div class="flex gap-3">
                <button 
                  v-show="currentStep > 0"
                  @click="previousStep" 
                  class="flex items-center gap-2 px-4 py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <i class="fas fa-arrow-left"></i>
                  ย้อนกลับ
                </button>
                
                <button 
                  v-show="currentStep === 0"
                  @click="nextStep"
                  :disabled="!hasUploadedFile"
                  class="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ดำเนินการต่อ
                  <i class="fas fa-arrow-right"></i>
                </button>
                
                <button 
                  v-show="currentStep === 1"
                  @click="startProcessing"
                  class="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  เริ่มสร้างหลักสูตร
                  <i class="fas fa-cog"></i>
                </button>
                
                <button 
                  v-show="currentStep >= 3 && currentStep <= 5"
                  @click="nextStep"
                  class="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  ดำเนินการต่อ
                  <i class="fas fa-arrow-right"></i>
                </button>
                
                <button 
                  v-show="currentStep === 6"
                  @click="publishCourse" 
                  class="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  <i class="fas fa-rocket"></i>
                  เผยแพร่หลักสูตร
                </button>
              </div>
            </div>
            
          </div>
          
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseBuilderModal',
  
  data() {
    return {
      currentStep: 0,
      lastSaved: '14:30',
      selectedChapter: 1,
      hasUploadedFile: true,
      
      courseTitle: 'คู่มือพนักงานใหม่ บริษัท ABC',
      courseDescription: 'หลักสูตรสำหรับพนักงานใหม่ เรียนรู้นโยบายและขั้นตอนการทำงานของบริษัท',
      
      courseSettings: {
        numberOfChapters: 5,
        numberOfQuestions: 10,
        difficultyLevel: 'medium',
        estimatedTime: 45,
        hasPreTest: false,
        hasPostTest: true
      },
      
      quizQuestions: [
        {
          text: 'บริษัท ABC ก่อตั้งขึ้นเมื่อปีใด?',
          options: [
            { text: '2010' },
            { text: '2015' },
            { text: '2020' },
            { text: '2025' }
          ],
          correctAnswer: 1
        }
      ],
      
      steps: [
        { title: 'เลือกไฟล์', description: 'อัพโหลดเอกสารของคุณ' },
        { title: 'ตั้งค่า', description: 'กำหนดรูปแบบหลักสูตร' },
        { title: 'ประมวลผล', description: 'วิเคราะห์เอกสาร' },
        { title: 'โครงสร้าง', description: 'ตรวจสอบโครงสร้าง' },
        { title: 'เนื้อหา', description: 'แก้ไขเนื้อหา' },
        { title: 'แบบทดสอบ', description: 'จัดการคำถาม' },
        { title: 'เผยแพร่', description: 'เผยแพร่หลักสูตร' }
      ]
    }
  },
  
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    nextStep() {
      if (this.currentStep < 6) {
        this.currentStep++
      }
    },
    
    startProcessing() {
      this.currentStep = 2
      // Auto advance after 3 seconds
      setTimeout(() => {
        this.currentStep = 3
      }, 3000)
    },
    
    regenerateCourse() {
      this.$swal({
        title: 'สร้างใหม่?',
        text: 'คุณต้องการให้ระบบสร้างโครงสร้างหลักสูตรใหม่หรือไม่?',
        showCancelButton: true,
        confirmButtonText: 'สร้างใหม่',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.startProcessing()
        }
      })
    },
    
    addQuestion() {
      this.quizQuestions.push({
        text: '',
        options: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
        ],
        correctAnswer: 0
      })
    },
    
    removeQuestion(index) {
      if (this.quizQuestions.length > 1) {
        this.quizQuestions.splice(index, 1)
      }
    },
    
    triggerFileUpload() {
      // Simulate file upload
      console.log('File upload triggered')
    },
    
    publishCourse() {
      this.$swal({
        icon: 'success',
        title: 'เผยแพร่สำเร็จ!',
        text: 'หลักสูตรได้ถูกเผยแพร่เรียบร้อยแล้ว',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        this.closeModal()
      })
    },
    
    getStepTitle() {
      return this.steps[this.currentStep]?.title || ''
    },
    
    getStepDescription() {
      return this.steps[this.currentStep]?.description || ''
    },
    
    getProgressPercentage() {
      return Math.round(((this.currentStep + 1) / 7) * 100)
    },
    
    getDifficultyText() {
      const levels = {
        easy: 'ง่าย',
        medium: 'ปานกลาง', 
        hard: 'ยาก'
      }
      return levels[this.courseSettings.difficultyLevel] || 'ปานกลาง'
    }
  }
}
</script>

