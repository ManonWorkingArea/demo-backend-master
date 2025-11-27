<template>
  <div class="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50" @click.self="closeModal">
    <!-- Full Screen Modal -->
    <div class="relative h-full w-full flex bg-white">
      
      <!-- Sidebar -->
      <div class="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
        <!-- Sidebar Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900">สร้างหลักสูตรอัตโนมัติ</h1>
              <p class="text-sm text-gray-500 mt-1">ขั้นตอนที่ {{ currentStep + 1 }}/7</p>
            </div>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
        
        <!-- Progress Steps -->
        <div class="flex-1 p-6">
          <div class="space-y-4">
            <div 
              v-for="(step, index) in stepList" 
              :key="'step-' + index"
              class="flex items-center space-x-3"
              :class="{ 'opacity-50': index > currentStep }"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                :class="[
                  index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-600'
                ]"
              >
                <i v-if="index < currentStep" class="fas fa-check text-xs"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ step.name }}</p>
                <p class="text-xs text-gray-500">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar Footer -->
        <div class="p-6 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            <i class="fas fa-save mr-2"></i>
            บันทึกอัตโนมัติ: {{ lastSaved }}
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        
        <!-- Content Header -->
        <div class="bg-white border-b border-gray-200 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ stepList[currentStep]?.name }}</h2>
              <p class="text-gray-600 mt-1">{{ stepList[currentStep]?.description }}</p>
            </div>
            <div class="text-sm text-gray-500">
              {{ Math.round(((currentStep + 1) / 7) * 100) }}% เสร็จสิ้น
            </div>
          </div>
        </div>
        
        <!-- Content Body -->
        <div class="flex-1 overflow-auto bg-gray-50">
          <div class="p-8">
            <!-- Step Content Container -->
            <div class="min-h-full">
              
              <!-- Step 0: File Upload -->
              <div v-if="currentStep === 0" class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">เลือกไฟล์เอกสาร</h2>
                <p class="text-sm text-gray-600 mb-6">อัพโหลดเอกสารที่ต้องการสร้างเป็นหลักสูตร</p>
                
                <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                  <div class="text-sm">
                    <p class="font-medium text-blue-900 mb-1">โหมดทดลอง</p>
                    <p class="text-blue-700">ใช้ไฟล์ตัวอย่างจากบริษัท ABC</p>
                  </div>
                </div>
                
                <div class="border-2 border-dashed border-gray-300 rounded p-8 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-4 text-center">
                  <i class="fas fa-file-upload text-2xl text-gray-400 mb-3"></i>
                  <p class="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์หรือลากมาวาง</p>
                  <p class="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT (สูงสุด 10MB)</p>
                </div>
                
                <div class="space-y-3">
                  <div class="border border-gray-200 rounded p-3 bg-white">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <i class="fas fa-file-pdf text-red-500"></i>
                        <div>
                          <p class="text-sm font-medium">คู่มือพนักงาน_ABC.pdf</p>
                          <p class="text-xs text-gray-500">2.3 MB • โครงสร้าง 15 หน้า, หัวข้อ 23 รายการ</p>
                        </div>
                      </div>
                      <button class="text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 1: Settings -->
              <div v-else-if="currentStep === 1" class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">ตั้งค่าหลักสูตร</h2>
                <p class="text-sm text-gray-600 mb-6">กำหนดรูปแบบและโครงสร้างหลักสูตรที่ต้องการ</p>
                
                <div class="border border-gray-200 rounded p-4 mb-4">
                  <h3 class="text-sm font-medium mb-3">ตั้งค่าหลักสูตร</h3>
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">จำนวนบทเรียน</label>
                      <select v-model="courseSettings.numberOfChapters" class="w-full p-2 border border-gray-300 rounded text-sm">
                        <option value="5">5 บท</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">จำนวนข้อสอบ</label>
                      <select v-model="courseSettings.numberOfQuestions" class="w-full p-2 border border-gray-300 rounded text-sm">
                        <option value="10">10 ข้อ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 2: Processing -->
              <div v-else-if="currentStep === 2" class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
                <div class="mb-6">
                  <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h2 class="text-lg font-medium text-gray-900 mb-2">กำลังประมวลผลเอกสาร</h2>
                  <p class="text-sm text-gray-600">กรุณารอสักครู่...</p>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-check-circle text-green-500"></i>
                      <span class="text-sm text-green-800">วิเคราะห์โครงสร้างเอกสาร</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                    <div class="flex items-center space-x-3">
                      <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span class="text-sm text-blue-800">สร้างโครงสร้างหลักสูตร</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 3: Course Structure -->
              <div v-else-if="currentStep === 3" class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">ตรวจสอบโครงสร้างหลักสูตร</h2>
                <p class="text-sm text-gray-600 mb-6">ปรับแต่งข้อมูลหลักสูตรและบทเรียนที่สร้างขึ้น</p>
                
                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-medium mb-3">ข้อมูลหลักสูตร</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร</label>
                      <input 
                        type="text" 
                        v-model="courseTitle"
                        class="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                      <textarea 
                        v-model="courseDescription"
                        class="w-full p-2 border border-gray-300 rounded text-sm h-20"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 4: Content -->
              <div v-else-if="currentStep === 4" class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">แก้ไขเนื้อหาบทเรียน</h2>
                <p class="text-sm text-gray-600 mb-6">ตรวจสอบและปรับแต่งเนื้อหาในแต่ละบท</p>
                
                <div class="border border-gray-200 rounded p-4">
                  <p class="text-sm text-gray-600">เนื้อหาบทเรียนจะแสดงที่นี่...</p>
                </div>
              </div>
              
              <!-- Step 5: Quiz -->
              <div v-else-if="currentStep === 5" class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">จัดการคำถามทดสอบ</h2>
                <p class="text-sm text-gray-600 mb-6">เพิ่ม แก้ไข หรือลบคำถามแบบทดสอบ</p>
                
                <div class="border border-gray-200 rounded p-4">
                  <p class="text-sm text-gray-600">คำถามแบบทดสอบจะแสดงที่นี่...</p>
                </div>
              </div>
              
              <!-- Step 6: Publish -->
              <div v-else-if="currentStep === 6" class="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-2">ตรวจสอบก่อนเผยแพร่</h2>
                <p class="text-sm text-gray-600 mb-6">ตรวจสอบข้อมูลหลักสูตรก่อนเผยแพร่</p>
                
                <div class="space-y-4">
                  <div class="bg-green-50 border border-green-200 rounded p-4">
                    <div class="flex items-start space-x-3">
                      <i class="fas fa-check-circle text-green-500 mt-0.5"></i>
                      <div>
                        <p class="font-medium text-green-900">พร้อมเผยแพร่</p>
                        <p class="text-sm text-green-700">หลักสูตรของคุณผ่านการตรวจสอบเรียบร้อยแล้ว</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="border border-gray-200 rounded p-4">
                    <h3 class="font-medium mb-2">สรุปหลักสูตร</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• ชื่อ: {{ courseTitle }}</li>
                      <li>• บทเรียน: {{ courseSettings.numberOfChapters }} บท</li>
                      <li>• คำถาม: {{ courseSettings.numberOfQuestions }} ข้อ</li>
                      <li>• ระยะเวลา: ประมาณ 45 นาที</li>
                    </ul>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Content Footer -->
        <div v-if="currentStep !== 2" class="bg-white border-t border-gray-200 px-8 py-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
              ขั้นตอนที่ {{ currentStep + 1 }} จาก 7
            </span>
            <div class="flex space-x-3">
              <button 
                v-if="currentStep > 0"
                @click="goToPreviousStep"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                ย้อนกลับ
              </button>
              
              <button 
                v-if="currentStep < 6"
                @click="goToNextStep"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                ดำเนินการต่อ
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              
              <button 
                v-if="currentStep === 6"
                @click="publishCourse"
                class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                <i class="fas fa-rocket mr-2"></i>
                เผยแพร่หลักสูตร
              </button>
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
      
      courseTitle: 'คู่มือพนักงานใหม่ บริษัท ABC',
      courseDescription: 'หลักสูตรสำหรับพนักงานใหม่ เรียนรู้นโยบายและขั้นตอนการทำงานของบริษัท',
      
      courseSettings: {
        numberOfChapters: 5,
        numberOfQuestions: 10
      },
      
      stepList: [
        { name: 'เลือกไฟล์', description: 'อัพโหลดเอกสารของคุณ' },
        { name: 'ตั้งค่า', description: 'กำหนดรูปแบบหลักสูตร' },
        { name: 'ประมวลผล', description: 'วิเคราะห์เอกสาร' },
        { name: 'โครงสร้าง', description: 'ตรวจสอบโครงสร้าง' },
        { name: 'เนื้อหา', description: 'แก้ไขเนื้อหา' },
        { name: 'แบบทดสอบ', description: 'จัดการคำถาม' },
        { name: 'เผยแพร่', description: 'เผยแพร่หลักสูตร' }
      ]
    }
  },
  
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    goToPreviousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    goToNextStep() {
      if (this.currentStep < 6) {
        this.currentStep++
        
        // Auto progress through processing step
        if (this.currentStep === 2) {
          setTimeout(() => {
            this.currentStep = 3
          }, 3000)
        }
      }
    },
    
    publishCourse() {
      this.$swal({
        icon: 'success',
        title: 'เผยแพร่สำเร็จ!',
        text: 'หลักสูตรของคุณได้ถูกเผยแพร่เรียบร้อยแล้ว',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        this.closeModal()
      })
    }
  }
}
</script>