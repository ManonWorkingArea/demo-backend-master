<template>
  <div>
    <!-- Step 0: File Upload -->
    <div v-if="step === 0">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
    </div>
    
    <!-- Step 1: Settings -->
    <div v-else-if="step === 1">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-2">ตั้งค่าหลักสูตร</h2>
        <p class="text-sm text-gray-600 mb-6">กำหนดรูปแบบและโครงสร้างหลักสูตรที่ต้องการ</p>
        
        <div class="border border-gray-200 rounded p-4 mb-4">
          <h3 class="text-sm font-medium mb-3">ตั้งค่าหลักสูตร</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">จำนวนบทเรียน</label>
              <select class="w-full p-2 border border-gray-300 rounded text-sm">
                <option value="5">5 บท</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">จำนวนข้อสอบ</label>
              <select class="w-full p-2 border border-gray-300 rounded text-sm">
                <option value="10">10 ข้อ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Processing -->
    <div v-else-if="step === 2">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
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
    </div>
    
    <!-- Step 3: Course Structure -->
    <div v-else-if="step === 3">
      <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-2">ตรวจสอบโครงสร้างหลักสูตร</h2>
        <p class="text-sm text-gray-600 mb-6">ปรับแต่งข้อมูลหลักสูตรและบทเรียนที่สร้างขึ้น</p>
        
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium mb-3">ข้อมูลหลักสูตร</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร</label>
              <input 
                type="text" 
                value="คู่มือพนักงานใหม่ บริษัท ABC" 
                class="w-full p-2 border border-gray-300 rounded text-sm"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea 
                class="w-full p-2 border border-gray-300 rounded text-sm h-20"
              >หลักสูตรสำหรับพนักงานใหม่ เรียนรู้นโยบายและขั้นตอนการทำงานของบริษัท</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 4: Content -->
    <div v-else-if="step === 4">
      <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-2">แก้ไขเนื้อหาบทเรียน</h2>
        <p class="text-sm text-gray-600 mb-6">ตรวจสอบและปรับแต่งเนื้อหาในแต่ละบท</p>
        
        <div class="border border-gray-200 rounded p-4">
          <p class="text-sm text-gray-600">เนื้อหาบทเรียนจะแสดงที่นี่...</p>
        </div>
      </div>
    </div>
    
    <!-- Step 5: Quiz -->
    <div v-else-if="step === 5">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-2">จัดการคำถามทดสอบ</h2>
        <p class="text-sm text-gray-600 mb-6">เพิ่ม แก้ไข หรือลบคำถามแบบทดสอบ</p>
        
        <div class="border border-gray-200 rounded p-4">
          <p class="text-sm text-gray-600">คำถามแบบทดสอบจะแสดงที่นี่...</p>
        </div>
      </div>
    </div>
    
    <!-- Step 6: Publish -->
    <div v-else-if="step === 6">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
              <li>• ชื่อ: คู่มือพนักงานใหม่ บริษัท ABC</li>
              <li>• บทเรียน: 5 บท</li>
              <li>• คำถาม: 10 ข้อ</li>
              <li>• ระยะเวลา: ประมาณ 45 นาที</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepContent',
  props: {
    step: {
      type: Number,
      required: true
    }
  }
}
</script>