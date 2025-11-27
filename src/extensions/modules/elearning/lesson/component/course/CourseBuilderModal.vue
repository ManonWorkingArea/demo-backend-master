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
              <p class="text-sm text-gray-500 mt-1">ขั้นตอนที่ {{ currentStep + 1 }}/{{ steps.length }}</p>
            </div>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
        
        <!-- Steps Navigation -->
        <div class="flex-1 p-6">
          <div class="space-y-4">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="flex items-center space-x-3 p-3 rounded-lg transition-colors"
              :class="index === currentStep ? 'bg-blue-50 border border-blue-200' : 
                      index < currentStep ? 'bg-green-50 border border-green-200' : 
                      'bg-white border border-gray-200'"
            >
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors"
                :class="index < currentStep ? 'bg-green-500 text-white' : 
                        index === currentStep ? 'bg-blue-500 text-white' : 
                        'bg-gray-200 text-gray-500'"
              >
                <i v-if="index < currentStep" class="fas fa-check text-xs"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium" 
                    :class="index <= currentStep ? 'text-gray-900' : 'text-gray-400'">
                  {{ step.name }}
                </h4>
                <p class="text-xs mt-1" 
                   :class="index <= currentStep ? 'text-gray-600' : 'text-gray-400'">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Progress Summary -->
          <div class="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">ความคืบหน้า</h4>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>เริ่มต้น</span>
              <span>{{ Math.round(((currentStep + 1) / steps.length) * 100) }}%</span>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>
        
        <!-- Sidebar Footer -->
        <div class="p-6 border-t border-gray-200">
          <div class="text-xs text-gray-400">
            <i class="fas fa-clock mr-1"></i>
            บันทึกล่าสุด: {{ lastSaved }}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Content Header -->
        <div class="bg-white border-b border-gray-200 px-8 py-6">
          <h2 class="text-2xl font-semibold text-gray-900">{{ steps[currentStep].name }}</h2>
          <p class="text-gray-600 mt-1">{{ steps[currentStep].description }}</p>
        </div>
        
        <!-- Content Body -->
        <div class="flex-1 overflow-auto bg-gray-50">
          <div class="p-8">
            
            <!-- Simple Step Display -->
            <div class="step-content">
              
              <!-- Step 0: File Upload -->
              <div v-if="currentStep === 0" class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">เลือกไฟล์เอกสาร</h2>
            <p class="text-sm text-gray-600 mb-6">
              อัพโหลดเอกสารที่ต้องการสร้างเป็นหลักสูตร
            </p>
            
            <!-- Demo Notice -->
            <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
              <div class="text-sm">
                <p class="font-medium text-blue-900 mb-1">โหมดทดลอง</p>
                <p class="text-blue-700">ใช้ไฟล์ตัวอย่างจากบริษัท ABC</p>
              </div>
            </div>
            
            <!-- File Upload Area -->
            <div 
              @click="triggerFileUpload"
              @dragover.prevent 
              @drop.prevent="handleFilesDrop"
              class="border-2 border-dashed border-gray-300 rounded p-8 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-4 text-center"
            >
              <i class="fas fa-file-upload text-2xl text-gray-400 mb-3"></i>
              <p class="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์หรือลากมาวาง</p>
              <p class="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT (สูงสุด 10MB)</p>
            </div>
            
            <input 
              ref="fileInput" 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,.txt" 
              @change="handleFilesSelect" 
              class="hidden"
            />
            
            <!-- Uploaded Files List -->
            <div v-if="uploadedFiles.length > 0" class="space-y-2 mb-6">
              <h4 class="text-sm font-medium text-gray-900">ไฟล์ที่เลือก:</h4>
              <div 
                v-for="(file, index) in uploadedFiles" 
                :key="index"
                class="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div class="flex items-center space-x-3">
                  <i :class="getFileIcon(file.type)" class="text-lg"></i>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button 
                  @click="removeFile(index)"
                  class="text-gray-400 hover:text-red-500 text-sm"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            

          </div>

          <!-- Step 1: Processing Setup -->
          <div v-else-if="currentStep === 1" class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">ตั้งค่าหลักสูตร</h2>
            <p class="text-sm text-gray-600 mb-6">
              กำหนดรูปแบบและโครงสร้างหลักสูตรที่ต้องการ
            </p>
            
            <div class="border border-gray-200 rounded p-4 mb-4">
              <h3 class="text-sm font-medium mb-3">ไฟล์ที่จะประมวลผล</h3>
              <div class="space-y-3">
                <div 
                  v-for="(file, index) in uploadedFiles" 
                  :key="index"
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded"
                >
                  <i :class="getFileIcon(file.type)" class="text-lg"></i>
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="border border-gray-200 rounded p-4 mb-4">
              <h3 class="text-sm font-medium mb-3">ตั้งค่าหลักสูตร</h3>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">จำนวนบทเรียน</label>
                  <select v-model="courseSettings.numberOfChapters" class="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="3">3 บท</option>
                    <option value="4">4 บท</option>
                    <option value="5">5 บท</option>
                    <option value="6">6 บท</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">จำนวนข้อสอบ</label>
                  <select v-model="courseSettings.numberOfQuestions" class="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="5">5 ข้อ</option>
                    <option value="10">10 ข้อ</option>
                    <option value="15">15 ข้อ</option>
                    <option value="20">20 ข้อ</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">ระดับความยาก</label>
                  <select v-model="courseSettings.difficultyLevel" class="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="easy">ง่าย</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="hard">ยาก</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">เวลาเรียนประมาณ (นาที)</label>
                  <select v-model="courseSettings.estimatedTime" class="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="60">60 นาที</option>
                    <option value="90">90 นาที</option>
                    <option value="120">120 นาที</option>
                    <option value="180">180 นาที</option>
                  </select>
                </div>
              </div>
              <div class="space-y-2 mb-4">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="courseSettings.hasPreTest" class="rounded">
                  <span class="text-sm text-gray-700">มีการทดสอบก่อนเรียน (Pre-test)</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="courseSettings.hasPostTest" class="rounded">
                  <span class="text-sm text-gray-700">มีการทดสอบหลังเรียน (Post-test)</span>
                </label>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p class="text-sm text-blue-800">
                <strong>โหมดทดลอง:</strong> ระบบจะจำลองการประมวลผลและสร้างหลักสูตรตัวอย่าง
              </p>
            </div>
            
            <div class="flex justify-end">
              <button 
                @click="startProcessing"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                เริ่มสร้างหลักสูตร
              </button>
            </div>
          </div>

          <!-- Step 2: Processing -->
          <div v-else-if="currentStep === 2" class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
            <div class="mb-6">
              <div class="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <h2 class="text-lg font-medium text-gray-900 mb-2">กำลังประมวลผล</h2>
              <p class="text-sm text-gray-600 mb-6">
                ระบบกำลังวิเคราะห์เอกสารและสร้างหลักสูตรอัตโนมัติ
              </p>
            </div>
            
            <!-- Processing Steps -->
            <div class="border border-gray-200 rounded p-4 mb-4">
              <div class="space-y-3">
                <div 
                  v-for="(process, index) in processingSteps" 
                  :key="index"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center space-x-3">
                    <div v-if="process.status === 'completed'" class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <i class="fas fa-check text-white text-xs"></i>
                    </div>
                    <div v-else-if="process.status === 'processing'" class="w-4 h-4">
                      <div class="animate-spin w-4 h-4 border border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                    <div v-else class="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span class="text-sm" :class="process.status === 'completed' ? 'text-gray-900' : 
                                                  process.status === 'processing' ? 'text-blue-600' : 'text-gray-500'">
                      {{ process.name }}
                    </span>
                  </div>
                  <span v-if="process.status === 'completed'" class="text-xs text-green-600">
                    {{ process.result }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <p class="text-xs text-gray-500">
                {{ completedProcesses }}/{{ processingSteps.length }} ขั้นตอน
              </p>
              <div class="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  class="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  :style="{ width: `${(completedProcesses / processingSteps.length) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Step 3: Course Structure Review -->
          <div v-else-if="currentStep === 3" class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">ตรวจสอบโครงสร้างหลักสูตร</h2>
            <p class="text-sm text-gray-600 mb-6">
              ปรับแต่งข้อมูลหลักสูตรและบทเรียนที่ AI สร้างขึ้น
            </p>
            
            <div class="space-y-4 mb-6">
              <!-- Course Info -->
              <div class="border border-gray-200 rounded p-4">
                <h3 class="text-sm font-medium mb-3">ข้อมูลหลักสูตร</h3>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">ชื่อหลักสูตร</label>
                    <input 
                      v-model="courseData.title"
                      type="text" 
                      class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">คำอธิบาย</label>
                    <textarea 
                      v-model="courseData.description"
                      rows="3"
                      class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">หมวดหมู่</label>
                    <select 
                      v-model="courseData.category"
                      class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="safety">ความปลอดภัย</option>
                      <option value="compliance">กฎข้อบังคับ</option>
                      <option value="onboarding">ปฐมนิเทศพนักงาน</option>
                      <option value="policy">นโยบายบริษัท</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- Course Chapters -->
              <div class="border border-gray-200 rounded p-4">
                <h3 class="text-sm font-medium mb-3">บทเรียน</h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div 
                    v-for="(chapter, index) in courseChapters" 
                    :key="index"
                    class="p-3 border border-gray-100 rounded"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900 mb-1">{{ chapter.title }}</h4>
                        <p class="text-xs text-gray-600 mb-2">{{ chapter.description }}</p>
                        <div class="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{{ chapter.duration }}</span>
                          <span>{{ chapter.pages }} หน้า</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-2">
              <button 
                @click="regenerateCourse"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                สร้างใหม่
              </button>
              <button 
                @click="nextStep"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                ดำเนินการต่อ
              </button>
            </div>
          </div>

          <!-- Remaining steps will be similar -->
          <!-- Step 4: เนื้อหา -->
          <div v-else-if="currentStep === 4" class="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">แก้ไขเนื้อหาบทเรียน</h2>
            <p class="text-sm text-gray-600 mb-6">ตรวจสอบและปรับแต่งเนื้อหาในแต่ละบท</p>
            
            <div class="space-y-4 mb-6">
              <div v-for="(chapter, index) in courseChapters" :key="index" class="border border-gray-200 rounded p-4">
                <h3 class="text-sm font-medium mb-2">บทที่ {{ index + 1 }}: {{ chapter.title }}</h3>
                <textarea v-model="chapter.content" rows="4" class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2" placeholder="เนื้อหาบทเรียน..."></textarea>
                <div class="flex justify-end">
                  <button @click="saveChapterContent(index)" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors">
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: แบบทดสอบ -->
          <div v-else-if="currentStep === 5" class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">จัดการคำถามทดสอบ</h2>
            <p class="text-sm text-gray-600 mb-6">เพิ่ม แก้ไข หรือลบคำถามแบบทดสอบ</p>
            
            <div class="border border-gray-200 rounded p-4 mb-6">
              <h3 class="text-sm font-medium mb-3">คำถามทดสอบ (Multiple Choice)</h3>
              <div class="space-y-4 max-h-80 overflow-y-auto">
                <div v-for="(quiz, idx) in quizzes" :key="idx" class="p-3 border border-gray-100 rounded">
                  <label class="block text-xs text-gray-600 mb-1">คำถามที่ {{ idx + 1 }}</label>
                  <input v-model="quiz.question" type="text" class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3" placeholder="พิมพ์คำถาม..." />
                  
                  <label class="block text-xs text-gray-600 mb-2">ตัวเลือกคำตอบ</label>
                  <div class="space-y-2 mb-3">
                    <div v-for="(choice, choiceIdx) in quiz.choices" :key="choiceIdx" class="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        :name="`quiz-${idx}`" 
                        :value="choiceIdx" 
                        v-model="quiz.correctAnswer"
                        class="text-blue-500"
                      />
                      <input 
                        v-model="quiz.choices[choiceIdx]" 
                        type="text" 
                        class="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        :placeholder="`ตัวเลือก ${choiceIdx + 1}`"
                      />
                      <button @click="removeChoice(idx, choiceIdx)" class="text-red-500 hover:text-red-700 text-xs" v-if="quiz.choices.length > 2">
                        ลบ
                      </button>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <button @click="addChoice(idx)" class="text-blue-500 hover:text-blue-600 text-xs" v-if="quiz.choices.length < 6">
                      + เพิ่มตัวเลือก
                    </button>
                    <div class="space-x-2">
                      <button @click="removeQuiz(idx)" class="text-red-500 hover:text-red-700 text-xs">
                        ลบคำถาม
                      </button>
                      <button @click="saveQuiz(idx)" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        บันทึก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button @click="addQuiz" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm mt-3">
                + เพิ่มคำถาม
              </button>
            </div>
          </div>

          <!-- Step 6: เผยแพร่ -->
          <div v-else-if="currentStep === 6" class="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">ตรวจสอบก่อนเผยแพร่</h2>
            <p class="text-sm text-gray-600 mb-6">
              ตรวจสอบข้อมูลหลักสูตรและเผยแพร่
            </p>
            
            <div class="border border-gray-200 rounded p-4 mb-4">
              <h3 class="text-sm font-medium mb-3">สรุปหลักสูตร</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">ชื่อหลักสูตร:</span>
                  <span class="font-medium">{{ courseData.title.substring(0, 50) }}...</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">หมวดหมู่:</span>
                  <span>{{ courseData.category }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">จำนวนบทเรียน:</span>
                  <span>{{ courseChapters.length }} บท</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">จำนวนคำถาม:</span>
                  <span>{{ quizzes.length }} ข้อ</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">เวลาเรียนรวม:</span>
                  <span>{{ courseSettings.estimatedTime }} นาที</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ทดสอบก่อนเรียน:</span>
                  <span>{{ courseSettings.hasPreTest ? 'มี' : 'ไม่มี' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ทดสอบหลังเรียน:</span>
                  <span>{{ courseSettings.hasPostTest ? 'มี' : 'ไม่มี' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">ระดับความยาก:</span>
                  <span>{{ courseSettings.difficultyLevel === 'easy' ? 'ง่าย' : courseSettings.difficultyLevel === 'medium' ? 'ปานกลาง' : 'ยาก' }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-green-50 border border-green-200 rounded p-3 mb-6">
              <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle text-green-600"></i>
                <div>
                  <p class="text-sm font-medium text-green-800">พร้อมเผยแพร่</p>
                  <p class="text-xs text-green-700">หลักสูตรผ่านการตรวจสอบคุณภาพแล้ว</p>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button @click="publishCourse" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded text-sm transition-colors">
                เผยแพร่หลักสูตร
              </button>
            </div>
          </div>
          
            </div> <!-- End step-content -->
          </div>
        </div>
        
        <!-- Content Footer -->
        <div v-if="currentStep !== 2" class="bg-white border-t border-gray-200 px-8 py-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
              ขั้นตอนที่ {{ currentStep + 1 }} จาก {{ steps.length }}
            </span>
            <div class="flex space-x-3">
              <button 
                v-if="currentStep > 0"
                @click="previousStep"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                ย้อนกลับ
              </button>
              
              <!-- Step 0: File Upload -->
              <button 
                v-if="currentStep === 0"
                @click="nextStep"
                :disabled="uploadedFiles.length === 0"
                class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm transition-colors"
              >
                ดำเนินการต่อ
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              
              <!-- Step 1: Settings -->
              <button 
                v-if="currentStep === 1"
                @click="startProcessing"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                เริ่มสร้างหลักสูตร
                <i class="fas fa-cog ml-2"></i>
              </button>
              
              <!-- Step 3: Course Review -->
              <button 
                v-if="currentStep === 3"
                @click="regenerateCourse"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                <i class="fas fa-redo mr-2"></i>
                สร้างใหม่
              </button>
              
              <!-- Steps 3,4,5: Continue -->
              <button 
                v-if="currentStep >= 3 && currentStep <= 5"
                @click="nextStep"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition-colors"
              >
                ดำเนินการต่อ
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              
              <!-- Step 6: Publish -->
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
      isDemoMode: true,
      
      steps: [
        { id: 1, name: 'เลือกไฟล์', description: 'อัพโหลดเอกสารของคุณ' },
        { id: 2, name: 'ตั้งค่า', description: 'กำหนดรูปแบบหลักสูตร' },
        { id: 3, name: 'ประมวลผล', description: 'ระบบกำลังวิเคราะห์เอกสาร' },
        { id: 4, name: 'โครงสร้าง', description: 'ตรวจสอบและปรับแต่งหลักสูตร' },
        { id: 5, name: 'เนื้อหา', description: 'สร้างเนื้อหาบทเรียน' },
        { id: 6, name: 'แบบทดสอบ', description: 'สร้างและปรับแต่งคำถาม' },
        { id: 7, name: 'เผยแพร่', description: 'พร้อมสำหรับการใช้งาน' }
      ],
      
      uploadedFiles: [
        { 
          name: 'นโยบายความปลอดภัย_ABC_2025.pdf', 
          size: 1024000, 
          type: 'application/pdf'
        },
        { 
          name: 'คู่มือพนักงาน_ระเบียบปฏิบัติ.docx', 
          size: 856000, 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        { 
          name: 'จรรยาบรรณองค์กร_2025.txt', 
          size: 245000, 
          type: 'text/plain'
        }
      ],
      
      processingConfig: null,

      processingSteps: [
        { name: 'อ่านและแปลงไฟล์เอกสาร (PDF, DOC, TXT)', status: 'pending', result: '' },
        { name: 'แยกเนื้อหาและวิเคราะห์โครงสร้าง', status: 'pending', result: '' },
        { name: 'สร้างหัวข้อและจัดหมวดหมู่', status: 'pending', result: '' },
        { name: 'สร้างเนื้อหาบทเรียนอัตโนมัติ', status: 'pending', result: '' },
        { name: 'สร้างคำถามแบบทดสอบ', status: 'pending', result: '' },
        { name: 'ตรวจสอบและปรับปรุงเนื้อหา', status: 'pending', result: '' }
      ],
      
      courseData: {
        title: 'หลักสูตรนโยบายความปลอดภัยและระเบียบปฏิบัติงาน บริษัท ABC จำกัด',
        description: 'หลักสูตรอบรมเชิงลึกเพื่อให้พนักงานเข้าใจและปฏิบัติตามนโยบายความปลอดภัย กฎระเบียบบริษัท และแนวปฏิบัติที่ดีในสถานที่ทำงาน รวมถึงการจัดการเหตุฉุกเฉินและการป้องกันอุบัติเหตุ สร้างขึ้นจากเอกสารนโยบายบริษัทและคู่มือพนักงานฉบับล่าสุด',
        category: 'safety'
      },
      
      courseChapters: [
        {
          title: 'บทที่ 1: นโยบายความปลอดภัยและการป้องกันอุบัติเหตุ',
          description: 'เรียนรู้นโยบายความปลอดภัยพื้นฐาน อุปกรณ์ป้องกันส่วนบุคคล และวิธีการป้องกันอุบัติเหตุในสถานที่ทำงาน',
          duration: '25 นาที',
          pages: 12,
          content: `# บทที่ 1: นโยบายความปลอดภัยและการป้องกันอุบัติเหตุ

## 1.1 นโยบายความปลอดภัยของบริษัท ABC
บริษัท ABC มุ่งมั่นสร้างสภาพแวดล้อมการทำงานที่ปลอดภัยสำหรับพนักงานทุกคน โดยยึดหลักการ "ความปลอดภัยเป็นอันดับแรก"

### วัตถุประสงค์หลัก:
• ลดความเสี่ยงจากอุบัติเหตุในที่ทำงานให้เป็นศูนย์
• สร้างวัฒนธรรมความปลอดภัยในองค์กร  
• ปกป้องทรัพย์สินและสิ่งแวดล้อม

## 1.2 อุปกรณ์ป้องกันส่วนบุคคล (PPE)
### อุปกรณ์บังคับใช้:
1. **หมวกนิรภัย** - ใส่ตลอดเวลาในพื้นที่ก่อสร้าง
2. **แว่นตาป้องกัน** - ป้องกันสารเคมีและเศษวัสดุ
3. **รองเท้านิรภัย** - รองเท้าหัวเหล็กและกันลื่น
4. **เสื้อสะท้อนแสง** - สำหรับพื้นที่ที่มีการจราจร

## 1.3 การรายงานอุบัติเหตุ
เมื่อเกิดอุบัติเหตุต้องรายงานภายใน 24 ชั่วโมง ผ่านระบบ Safety Report หรือติดต่อหมายเลข: 02-XXX-XXXX

### ข้อมูลที่ต้องรายงาน:
• เวลาและสถานที่เกิดเหตุ
• ผู้ที่ได้รับบาดเจ็บ  
• สาเหตุและรายละเอียดเหตุการณ์
• มาตรการป้องกันเบื้องต้น`
        },
        {
          title: 'บทที่ 2: จรรยาบรรณและระเบียบปฏิบัติงาน',
          description: 'ทำความเข้าใจจรรยาบรรณพนักงาน กฎระเบียบบริษัท และแนวทางปฏิบัติที่เหมาะสม',
          duration: '30 นาที',
          pages: 18,
          content: `# บทที่ 2: จรรยาบรรณและระเบียบปฏิบัติงาน

## 2.1 จรรยาบรรณพนักงาน
### หลักการพื้นฐาน:
• **ความซื่อสัตย์** - ปฏิบัติงานด้วยความจริงใจและโปร่งใส
• **ความรับผิดชอบ** - ทำงานให้สำเร็จตามที่ได้รับมอบหมาย
• **การเคารพผู้อื่น** - ให้เกียรติเพื่อนร่วมงานและลูกค้า

## 2.2 กฎระเบียบเวลาทำงาน
### เวลาทำงานมาตรฐาน:
• **จันทร์-ศุกร์**: 08:30 - 17:30 น.
• **เวลาพักกลางวัน**: 12:00 - 13:00 น.
• **การมาสาย**: เกิน 15 นาที ถือเป็นการขาดงานครึ่งวัน

### การลางาน:
1. ลาป่วย - แจ้งล่วงหน้าก่อน 09:00 น.
2. ลากิจ - แจ้งล่วงหน้าอย่างน้อย 1 วัน
3. ลาพักร้อน - แจ้งล่วงหน้าอย่างน้อย 7 วัน

## 2.3 การแต่งกาย
### เครื่องแบบพนักงาน:
• **ชาย**: เสื้อเชิ้ตสีขาวหรือฟ้าอ่อน กางเกงสีกรมท่า
• **หญิง**: เสื้อเชิ้ตสีขาวหรือฟ้าอ่อน กระโปรงหรือกางเกงสีกรมท่า
• **รองเท้า**: รองเท้าหุ้มส้นสีดำหรือน้ำต��ล`
        },
        {
          title: 'บทที่ 3: การจัดการเอกสารและข้อมูลความลับ',
          description: 'แนวทางการจัดการเอกสาร การรักษาความปลอดภัยข้อมูล และการป้องกันข้อมูลรั่วไหล',
          duration: '20 นาที',
          pages: 10,
          content: `# บทที่ 3: การจัดการเอกสารและข้อมูลความลับ

## 3.1 การจัดเก็บเอกสาร
### หลักการพื้นฐาน:
• จัดเก็บเอกสารในที่ปลอดภัยและเข้าถึงได้ง่าย
• ใช้ระบบการจัดเก็บที่เป็นมาตรฐาน
• สำรองข้อมูลสำคัญอย่างสม่ำเสมอ

### ประเภทเอกสาร:
1. **เอกสารลับที่สุด** - เข้าถึงได้เฉพาะผู้บริหารระดับสูง
2. **เอกสารลับ** - เข้าถึงได้เฉพาะพนักงานที่เกี่ยวข้อง
3. **เอกสารทั่วไป** - เข้าถึงได้โดยพนักงานทุกคน

## 3.2 การรักษาความปลอดภัยข้อมูล
### มาตรการป้องกัน:
• ใช้รหัสผ่านที่แข็งแกร่ง (อย่างน้อย 8 ตัวอักษร)
• เปลี่ยนรหัสผ่านทุก 90 วัน
• ห้ามแชร์รหัสผ่านกับผู้อื่น
• ล็อคคอมพิวเตอร์เมื่อออกจากโต๊ะทำงาน`
        },
        {
          title: 'บทที่ 4: การจัดการสิ่งแวดล้อมและความยั่งยืน',
          description: 'นโยบายสิ่งแวดล้อม การจัดการขยะ และการอนุรักษ์พลังงาน',
          duration: '18 นาที',
          pages: 8,
          content: `# บทที่ 4: การจัดการสิ่งแวดล้อมและความยั่งยืน

## 4.1 นโยบายสิ่งแวดล้อม
บริษัท ABC มุ่งมั่นเป็น "องค์กรสีเขียว" โดยลดผลกระทบต่อสิ่งแวดล้อม

### เป้าหมายหลัก:
• ลดการใช้พลังงาน 15% ภายในปี 2026
• ลดขยะ 30% และเพิ่มการรีไซเคิล
• ใช้วัสดุที่เป็นมิตรกับสิ่งแวดล้อม

## 4.2 การจัดการขยะ  
### การแยกขยะ:
1. **ขยะรีไซเคิล** - กระดาษ, พลาสติก, แก้ว, โลหะ
2. **ขยะอินทรีย์** - เศษอาหาร, ใบไม้  
3. **ขยะอันตราย** - แบตเตอรี่, หลอดไฟ, สารเคมี
4. **ขยะทั่วไป** - ขยะที่ไม่สามารถรีไซเคิลได้`
        }
      ],
      
      quizzes: [
        { 
          question: 'อุปกรณ์ป้องกันส่วนบุคคล (PPE) ที่บังคับใช้ในพื้นที่ก่อสร้าง ได้แก่ อะไรบ้าง?', 
          choices: ['หมวกนิรภัย แว่นตาป้องกัน', 'รองเท้าผ้าใบ ถุงมือ', 'หมวกนิรภัย แว่นตา รองเท้านิรภัย เสื้อสะท้อนแสง', 'เฉพาะหมวกนิรภัยเท่านั้น'],
          correctAnswer: 2
        },
        { 
          question: 'เมื่อเกิดอุบัติเหตุในที่ทำงาน ต้องรายงานภายในกี่ชั่วโมง?', 
          choices: ['12 ชั่วโมง', '24 ชั่วโมง', '48 ชั่วโมง', '7 วัน'],
          correctAnswer: 1
        },
        { 
          question: 'เวลาทำงานมาตรฐานของบริษัท ABC คือ?', 
          choices: ['จันทร์-ศุกร์ 08:00-17:00', 'จันทร์-ศุกร์ 08:30-17:30', 'จันทร์-ศุกร์ 09:00-18:00', 'จันทร์-เสาร์ 08:30-17:30'],
          correctAnswer: 1
        },
        { 
          question: 'การมาสายเกิน 15 นาที จะถือเป็นอะไร?', 
          choices: ['ไม่มีผลกระทบ', 'การขาดงานครึ่งวัน', 'หักเงินเดือน 50%', 'ใส่ชื่อในบัญชีดำ'],
          correctAnswer: 1
        },
        { 
          question: 'รหัสผ่านที่แข็งแกร่งต้องมีอย่างน้อยกี่ตัวอักษร?', 
          choices: ['6 ตัวอักษร', '8 ตัวอักษร', '10 ตัวอักษร', '12 ตัวอักษร'],
          correctAnswer: 1
        }
      ],
      
      courseSettings: {
        numberOfChapters: 4,
        numberOfQuestions: 10,
        hasPreTest: false,
        hasPostTest: true,
        difficultyLevel: 'medium',
        estimatedTime: 90
      },
      
      lastSaved: new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      
      autoSaveInterval: null
    }
  },
  
  computed: {
    completedProcesses() {
      return this.processingSteps.filter(step => step.status === 'completed').length
    }
  },
  
  watch: {
    courseSettings: {
      handler() {
        this.updatePromptWithSettings()
      },
      deep: true
    }
  },
  
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep = this.currentStep - 1
      }
    },
    
    nextStep() {
      if (this.currentStep < 6) {
        this.currentStep = this.currentStep + 1
        
        // Auto progress through processing
        if (this.currentStep === 2) {
          this.simulateProcessing()
        }
      }
    },
    
    triggerFileUpload() {
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.click()
        }
      })
    },
    
    handleFilesSelect(event) {
      const files = Array.from(event.target.files)
      this.addFiles(files)
    },
    
    handleFilesDrop(event) {
      const files = Array.from(event.dataTransfer.files)
      this.addFiles(files)
    },
    
    addFiles(files) {
      files.forEach(file => {
        if (this.isValidFile(file)) {
          this.uploadedFiles.push(file)
        }
      })
    },
    
    isValidFile(file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      return validTypes.includes(file.type) && file.size <= maxSize
    },
    
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    
    getFileIcon(type) {
      if (type.includes('pdf')) return 'fas fa-file-pdf text-red-500'
      if (type.includes('word')) return 'fas fa-file-word text-blue-500'
      if (type.includes('text')) return 'fas fa-file-alt text-gray-500'
      return 'fas fa-file text-gray-500'
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    getAnalysisPoints(type) {
      if (type.includes('pdf')) return 'โครงสร้าง 15 หน้า, หัวข้อ 23 รายการ, รูปภาพ 8 รูป, ตาราง 5 ตาราง'
      if (type.includes('word')) return 'เนื้อหา 8,500 คำ, สไตล์ 12 แบบ, หัวข้อ 18 หัวข้อ, รายการ 45 รายการ'
      if (type.includes('text')) return 'ข้อความ 3,200 คำ, บรรทัด 245 บรรทัด, ย่อหน้า 68 ย่อหน้า'
      return 'เนื้อหาพื้นฐาน'
    },
    

    
    updatePromptWithSettings() {
      // Internal processing settings - not displayed to user
      this.processingConfig = {
        numberOfChapters: this.courseSettings.numberOfChapters,
        numberOfQuestions: this.courseSettings.numberOfQuestions,
        difficultyLevel: this.courseSettings.difficultyLevel,
        estimatedTime: this.courseSettings.estimatedTime,
        hasPreTest: this.courseSettings.hasPreTest,
        hasPostTest: this.courseSettings.hasPostTest
      }
    },
    
    startProcessing() {
      this.updatePromptWithSettings()
      this.currentStep = 2
      this.simulateProcessing()
    },
    
    simulateProcessing() {
      let currentProcessIndex = 0
      
      const processNext = () => {
        if (currentProcessIndex < this.processingSteps.length) {
          // Set current step to processing
          this.processingSteps[currentProcessIndex].status = 'processing'
          
          // Complete after delay
          setTimeout(() => {
            this.processingSteps[currentProcessIndex].status = 'completed'
            this.processingSteps[currentProcessIndex].result = this.getProcessResult(currentProcessIndex)
            
            currentProcessIndex++
            
            if (currentProcessIndex < this.processingSteps.length) {
              processNext()
            } else {
              // All processing done, move to next step
              setTimeout(() => {
                this.nextStep()
              }, 1000)
            }
          }, Math.random() * 2000 + 1000) // 1-3 seconds per step
        }
      }
      
      processNext()
    },
    
    getProcessResult(index) {
      const results = [
        'ประมวลผล 3 ไฟล์ (2.4MB) สำเร็จ',
        'วิเคราะห์แล้ว 127 ย่อหน้า พบ 45 หัวข้อสำคัญ',
        'สร้าง 4 บทเรียนหลัก พร้อมโครงสร้าง',
        'สร้างเนื้อหา 15,420 คำ พร้อมตัวอย่าง',
        'สร้าง 10 คำถามแบบทดสอบ',
        'ตรวจสอบความถูกต้อง 98% ผ่านเกณฑ์'
      ]
      return results[index] || 'เสร็จสิ้น'
    },
    
    regenerateCourse() {
      this.$swal({
        icon: 'question',
        title: 'สร้างหลักสูตรใหม่?',
        text: 'คุณต้องการให้ระบบสร้างโครงสร้างหลักสูตรใหม่หรือไม่?',
        showCancelButton: true,
        confirmButtonText: 'สร้างใหม่',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset and regenerate
          this.currentStep = 2
          this.simulateProcessing()
        }
      })
    },
    
    saveChapterContent(index) {
      this.$swal({
        icon: 'success',
        title: 'บันทึกเนื้อหาสำเร็จ',
        text: `เนื้อหาบทที่ ${index + 1} ถูกบันทึกเรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false
      })
    },
    
    addQuiz() {
      this.quizzes.push({ 
        question: '', 
        choices: ['', '', '', ''], 
        correctAnswer: 0 
      })
    },
    
    removeQuiz(idx) {
      this.quizzes.splice(idx, 1)
    },
    
    addChoice(quizIdx) {
      if (this.quizzes[quizIdx].choices.length < 6) {
        this.quizzes[quizIdx].choices.push('')
      }
    },
    
    removeChoice(quizIdx, choiceIdx) {
      if (this.quizzes[quizIdx].choices.length > 2) {
        this.quizzes[quizIdx].choices.splice(choiceIdx, 1)
        // Adjust correct answer index if needed
        if (this.quizzes[quizIdx].correctAnswer >= choiceIdx) {
          this.quizzes[quizIdx].correctAnswer = Math.max(0, this.quizzes[quizIdx].correctAnswer - 1)
        }
      }
    },
    
    saveQuiz(idx) {
      this.$swal({
        icon: 'success',
        title: 'บันทึกคำถาม',
        text: `คำถามที่ ${idx + 1} ถูกบันทึกแล้ว`,
        timer: 1200,
        showConfirmButton: false
      })
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
    },
    
    updateLastSaved() {
      this.lastSaved = new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      }
    }
  },
  
  mounted() {
    // Auto save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.updateLastSaved()
    }, 30000)
    
    // Handle ESC key
    document.addEventListener('keydown', this.handleEscKey)
  },
  
  beforeUnmount() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    document.removeEventListener('keydown', this.handleEscKey)
  }
}
</script>