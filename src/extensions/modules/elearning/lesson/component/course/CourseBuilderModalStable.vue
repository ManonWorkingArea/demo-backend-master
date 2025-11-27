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
              :key="index"
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
              <h2 class="text-2xl font-bold text-gray-900">{{ getCurrentStepTitle() }}</h2>
              <p class="text-gray-600 mt-1">{{ getCurrentStepDescription() }}</p>
            </div>
            <div class="text-sm text-gray-500">
              {{ Math.round(((currentStep + 1) / 7) * 100) }}% เสร็จสิ้น
            </div>
          </div>
        </div>
        
        <!-- Content Body -->
        <div class="flex-1 overflow-auto bg-gray-50">
          <div class="p-8">
            <div class="min-h-full" :class="getStepContainerClass()">
              {{ getCurrentStepContent() }}
            </div>
          </div>
        </div>
        
        <!-- Content Footer -->
        <div class="bg-white border-t border-gray-200 px-8 py-4">
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
                {{ getNextButtonText() }}
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
        this.currentStep = this.currentStep - 1
      }
    },
    
    goToNextStep() {
      if (this.currentStep < 6) {
        this.currentStep = this.currentStep + 1
        
        // Auto progress through processing step
        if (this.currentStep === 2) {
          setTimeout(() => {
            this.currentStep = 3
          }, 3000)
        }
      }
    },
    
    getCurrentStepTitle() {
      return this.stepList[this.currentStep]?.name || 'ไม่ระบุ'
    },
    
    getCurrentStepDescription() {
      return this.stepList[this.currentStep]?.description || 'ไม่ระบุ'
    },
    
    getCurrentStepContent() {
      const contents = [
        'เลือกไฟล์เอกสารที่ต้องการสร้างเป็นหลักสูตร (PDF, DOC, DOCX, TXT)',
        'กำหนดจำนวนบทเรียน ข้อสอบ และรูปแบบการสอน',
        'กำลังประมวลผลเอกสาร กรุณารอสักครู่...',
        'ตรวจสอบชื่อหลักสูตรและโครงสร้างบทเรียนที่สร้างขึ้น',
        'แก้ไขเนื้อหาในแต่ละบทเรียนให้เหมาะสม',
        'จัดการคำถามแบบทดสอบและกำหนดคำตอบ',
        'ตรวจสอบความถูกต้องก่อนเผยแพร่หลักสูตร'
      ]
      return contents[this.currentStep] || 'ไม่พบข้อมูล'
    },
    
    getStepContainerClass() {
      return 'max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center'
    },
    
    getNextButtonText() {
      if (this.currentStep === 1) return 'เริ่มสร้างหลักสูตร'
      return 'ดำเนินการต่อ'
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