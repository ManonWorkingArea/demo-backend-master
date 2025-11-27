<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center gap-2 text-gray-500 mb-4 text-sm">
              <router-link to="/ai/knowledge-base" class="hover:text-gray-700 transition-colors">Knowledge Base</router-link>
              <i class="fas fa-chevron-right text-xs"></i>
              <span class="text-gray-900 font-medium">AI Upload & Processing</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">อัพโหลดและประมวลผลด้วย AI</h1>
            <p class="text-gray-600">อัพโหลดเอกสาร AI จะประมวลผล แยกข้อความ และจัดหมวดหมู่อัตโนมัติ</p>
          </div>
          <div class="hidden lg:block">
            <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-cloud-upload-alt text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Upload Area -->
        <div class="xl:col-span-2">
          <!-- Drag & Drop Upload -->
          <div class="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-upload text-purple-600"></i>
              </div>
              อัพโหลดเอกสาร
            </h2>

            <!-- Upload Zone -->
            <div 
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              :class="isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50'"
              class="border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer hover:border-purple-400 hover:bg-purple-50"
              @click="$refs.fileInput.click()"
            >
              <div class="mb-6">
                <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4 block"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</h3>
                <p class="text-gray-500">รองรับไฟล์ PDF, Word, Excel, PowerPoint, Images และอื่นๆ</p>
              </div>
              
              <div class="flex flex-wrap justify-center gap-3 mb-6">
                <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">PDF</span>
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">DOCX</span>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">XLSX</span>
                <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">PPTX</span>
                <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Images</span>
              </div>

              <button class="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                <i class="fas fa-folder-open mr-2"></i>
                เลือกไฟล์
              </button>
              
              <input type="file" ref="fileInput" multiple class="hidden" @change="handleFileSelect" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png">
            </div>

            <!-- Processing Queue -->
            <div v-if="uploadQueue.length > 0" class="mt-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">คิวการประมวลผล</h3>
              <div class="space-y-3">
                <div v-for="file in uploadQueue" :key="file.id" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i :class="getFileIcon(file.name)" class="text-purple-600"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">{{ file.name }}</h4>
                      <div class="flex items-center gap-4 mt-1">
                        <span class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</span>
                        <div class="flex-1">
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              :class="file.status === 'completed' ? 'bg-emerald-500' : file.status === 'processing' ? 'bg-purple-500' : 'bg-gray-300'"
                              :style="`width: ${file.progress}%`"
                              class="h-full rounded-full transition-all duration-300"
                            ></div>
                          </div>
                        </div>
                        <span :class="getStatusColor(file.status)" class="text-sm font-medium">{{ getStatusText(file.status) }}</span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button v-if="file.status === 'completed'" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <i class="fas fa-check"></i>
                      </button>
                      <button v-else-if="file.status === 'error'" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i class="fas fa-exclamation-triangle"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- AI Processing Details -->
                  <div v-if="file.status === 'completed'" class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h5 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <i class="fas fa-robot text-purple-500"></i>
                      ผลการประมวลผล AI
                    </h5>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="text-center">
                        <p class="text-2xl font-bold text-emerald-600">{{ file.aiResults.pages || 'N/A' }}</p>
                        <p class="text-sm text-gray-600">จำนวนหน้า</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">{{ file.aiResults.words || 'N/A' }}</p>
                        <p class="text-sm text-gray-600">จำนวนคำ</p>
                      </div>
                      <div class="text-center">
                        <p class="text-2xl font-bold text-purple-600">{{ file.aiResults.confidence || 'N/A' }}%</p>
                        <p class="text-sm text-gray-600">ความแม่นยำ</p>
                      </div>
                    </div>
                    <div class="mt-3">
                      <p class="text-sm font-medium text-gray-700">หมวดหมู่ที่ AI แนะนำ:</p>
                      <div class="flex flex-wrap gap-2 mt-1">
                        <span v-for="category in file.aiResults.categories" :key="category" 
                              class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {{ category }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Batch Operations -->
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-layer-group text-white"></i>
              </div>
              การประมวลผลแบบกลุ่ม
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-6 border-2 border-dashed border-indigo-200 rounded-2xl text-center">
                <i class="fas fa-folder-plus text-4xl text-indigo-400 mb-4"></i>
                <h3 class="font-semibold text-gray-900 mb-2">อัพโหลดโฟลเดอร์</h3>
                <p class="text-sm text-gray-600 mb-4">อัพโหลดไฟล์ทั้งโฟลเดอร์พร้อมรักษาโครงสร้าง</p>
                <button class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  เลือกโฟลเดอร์
                </button>
              </div>

              <div class="p-6 border-2 border-dashed border-emerald-200 rounded-2xl text-center">
                <i class="fas fa-link text-4xl text-emerald-400 mb-4"></i>
                <h3 class="font-semibold text-gray-900 mb-2">นำเข้าจาก URL</h3>
                <p class="text-sm text-gray-600 mb-4">นำเข้าเอกสารจาก Google Drive, OneDrive</p>
                <button class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  เชื่อมต่อ
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="xl:col-span-1 space-y-6">
          <!-- Processing Status -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-cogs text-purple-500"></i>
              สถานะการประมวลผล
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">ประมวลผลวันนี้</span>
                <span class="text-lg font-bold text-purple-600">87 ไฟล์</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">รอคิว</span>
                <span class="text-lg font-bold text-orange-600">12 ไฟล์</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">เสร็จสมบูรณ์</span>
                <span class="text-lg font-bold text-emerald-600">75 ไฟล์</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">เกิดข้อผิดพลาด</span>
                <span class="text-lg font-bold text-red-600">0 ไฟล์</span>
              </div>
            </div>

            <!-- Processing Queue Progress -->
            <div class="mt-6 p-4 bg-purple-50 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-purple-900">Processing Queue</span>
                <span class="text-sm text-purple-700">12 files remaining</span>
              </div>
              <div class="w-full bg-purple-200 rounded-full h-2">
                <div class="bg-purple-500 h-full rounded-full" style="width: 75%"></div>
              </div>
            </div>
          </div>

          <!-- AI Processing Features -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
            <h3 class="font-bold text-purple-900 mb-4 flex items-center gap-2">
              <i class="fas fa-brain text-purple-600"></i>
              AI Processing Features
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <i class="fas fa-eye text-white text-sm"></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">OCR Text Extraction</p>
                  <p class="text-xs text-gray-600">แยกข้อความจากรูปภาพและ PDF</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <i class="fas fa-tags text-white text-sm"></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Auto Categorization</p>
                  <p class="text-xs text-gray-600">จัดหมวดหมู่อัตโนมัติ</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <i class="fas fa-key text-white text-sm"></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Keyword Extraction</p>
                  <p class="text-xs text-gray-600">สกัดคำสำคัญอัจฉริยะ</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div class="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <i class="fas fa-language text-white text-sm"></i>
                </div>
                <div>
                  <p class="font-semibent text-gray-900 text-sm">Language Detection</p>
                  <p class="text-xs text-gray-600">ตรวจจับภาษาอัตโนมัติ</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-history text-gray-500"></i>
              กิจกรรมล่าสุด
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                  <i class="fas fa-check text-emerald-600 text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Budget_2025.xlsx</p>
                  <p class="text-xs text-gray-500">ประมวลผลเสร็จ - จัดอยู่ในหมวด "การเงิน"</p>
                  <p class="text-xs text-gray-400">2 นาทีที่แล้ว</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                  <i class="fas fa-upload text-blue-600 text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Marketing_Plan.pdf</p>
                  <p class="text-xs text-gray-500">เริ่มการประมวลผล AI</p>
                  <p class="text-xs text-gray-400">5 นาทีที่แล้ว</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                  <i class="fas fa-folder text-purple-600 text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">Q1_Reports/</p>
                  <p class="text-xs text-gray-500">อัพโหลดโฟลเดอร์ 15 ไฟล์</p>
                  <p class="text-xs text-gray-400">1 ชั่วโมงที่แล้ว</p>
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
export default {
  name: 'KnowledgeUpload',
  data() {
    return {
      isDragging: false,
      uploadQueue: [
        {
          id: 1,
          name: 'รายงานการเงิน_2025.pdf',
          size: 2400000,
          status: 'completed',
          progress: 100,
          aiResults: {
            pages: 24,
            words: 3420,
            confidence: 97,
            categories: ['การเงิน', 'รายงาน', 'วิเคราะห์']
          }
        },
        {
          id: 2,
          name: 'แผนการตลาด_Q1.docx',
          size: 1800000,
          status: 'processing',
          progress: 65,
          aiResults: {}
        },
        {
          id: 3,
          name: 'งบประมาณ_2025.xlsx',
          size: 856000,
          status: 'queued',
          progress: 0,
          aiResults: {}
        }
      ]
    }
  },
  methods: {
    handleDrop(event) {
      event.preventDefault();
      this.isDragging = false;
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
    },
    
    processFiles(files) {
      files.forEach(file => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          status: 'uploading',
          progress: 0,
          aiResults: {}
        };
        
        this.uploadQueue.unshift(newFile);
        this.simulateUpload(newFile);
      });
    },
    
    simulateUpload(file) {
      const interval = setInterval(() => {
        file.progress += Math.random() * 20;
        if (file.progress >= 100) {
          file.progress = 100;
          file.status = 'completed';
          file.aiResults = {
            pages: Math.floor(Math.random() * 50) + 1,
            words: Math.floor(Math.random() * 5000) + 500,
            confidence: Math.floor(Math.random() * 20) + 80,
            categories: this.getRandomCategories()
          };
          clearInterval(interval);
        } else if (file.progress > 30) {
          file.status = 'processing';
        }
      }, 300);
    },
    
    getRandomCategories() {
      const categories = ['การเงิน', 'การตลาด', 'HR', 'เทคโนโลยี', 'รายงาน', 'วิเคราะห์', 'กลยุทธ์'];
      return categories.slice(0, Math.floor(Math.random() * 3) + 1);
    },
    
    getFileIcon(filename) {
      const extension = filename.split('.').pop().toLowerCase();
      const iconMap = {
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        xls: 'fas fa-file-excel',
        xlsx: 'fas fa-file-excel',
        ppt: 'fas fa-file-powerpoint',
        pptx: 'fas fa-file-powerpoint',
        txt: 'fas fa-file-alt',
        jpg: 'fas fa-file-image',
        jpeg: 'fas fa-file-image',
        png: 'fas fa-file-image'
      };
      return iconMap[extension] || 'fas fa-file';
    },
    
    formatFileSize(bytes) {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    getStatusColor(status) {
      const colors = {
        uploading: 'text-blue-600',
        processing: 'text-purple-600',
        completed: 'text-emerald-600',
        error: 'text-red-600',
        queued: 'text-gray-600'
      };
      return colors[status] || 'text-gray-600';
    },
    
    getStatusText(status) {
      const texts = {
        uploading: 'อัพโหลด...',
        processing: 'ประมวลผล AI...',
        completed: 'เสร็จสมบูรณ์',
        error: 'ข้อผิดพลาด',
        queued: 'รอคิว'
      };
      return texts[status] || 'ไม่ทราบสถานะ';
    }
  }
}
</script>

<style scoped>
.upload-zone {
  transition: all 0.3s ease;
}

.upload-zone:hover {
  transform: translateY(-2px);
}

.progress-bar {
  transition: width 0.3s ease;
}
</style>